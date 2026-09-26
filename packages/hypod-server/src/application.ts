import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { Express } from 'express';

import { BuiltInAccessPolicy } from './access/built-in-policy';
import { TokenIssuer } from './access/token-issuer';
import type { AccessPolicy } from './access/types';
import { resolveConfig, type HypodConfig, type HypodConfigInput } from './config/config';
import { createHttpAdapter, type HttpAdapter } from './http/adapter';
import { createLogger, type Logger } from './logging/logger';
import { ContentStore } from './persistence/content-store';
import { DataRootLock } from './persistence/data-root-lock';
import { MetadataRepository } from './persistence/metadata-repository';
import { Registry } from './registry/registry';

export interface HypodAddress {
  host: string;
  port: number;
  url: string;
}

export interface HypodApplication {
  readonly config: HypodConfig;
  readonly express: Express;
  readonly registry: Registry;
  readonly accessPolicy: AccessPolicy;
  readonly logger: Logger;
  ready(): Promise<void>;
  start(): Promise<HypodAddress>;
  stop(): Promise<void>;
  address(): HypodAddress | undefined;
}

class HypodApplicationImplementation implements HypodApplication {
  readonly #server: Server;
  readonly #http: HttpAdapter;
  readonly #metadata: MetadataRepository;
  readonly #lock: DataRootLock;
  readonly #setReady: (value: boolean) => void;
  #ready = true;
  #stopped = false;
  #address: HypodAddress | undefined;
  readonly #signalHandlers = new Map<NodeJS.Signals, () => void>();

  public constructor(
    public readonly config: HypodConfig,
    public readonly express: Express,
    public readonly registry: Registry,
    public readonly accessPolicy: AccessPolicy,
    public readonly logger: Logger,
    resources: {
      server: Server;
      http: HttpAdapter;
      metadata: MetadataRepository;
      lock: DataRootLock;
      setReady: (value: boolean) => void;
    },
  ) {
    this.#server = resources.server;
    this.#http = resources.http;
    this.#metadata = resources.metadata;
    this.#lock = resources.lock;
    this.#setReady = resources.setReady;
    if (config.manageSignals) this.#installSignalHandlers();
  }

  public async ready(): Promise<void> {
    if (!this.#ready || this.#stopped) throw new Error('Hypod is not ready.');
  }

  public async start(): Promise<HypodAddress> {
    if (this.#stopped) throw new Error('A stopped Hypod application cannot be restarted.');
    if (this.#address) return this.#address;
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        this.#server.off('listening', onListening);
        reject(error);
      };
      const onListening = () => {
        this.#server.off('error', onError);
        resolve();
      };
      this.#server.once('error', onError);
      this.#server.once('listening', onListening);
      this.#server.listen(this.config.port, this.config.host);
    });
    const details = this.#server.address() as AddressInfo;
    const host = details.address.includes(':') ? `[${details.address}]` : details.address;
    this.#address = {
      host: details.address,
      port: details.port,
      url: `http://${host}:${details.port}`,
    };
    this.logger.info('Hypod started', {
      host: this.#address.host,
      port: this.#address.port,
      externalUrl: this.config.externalUrl.toString(),
      mode: this.config.mode,
      readOnly: this.config.readOnly,
    });
    return this.#address;
  }

  public address(): HypodAddress | undefined {
    return this.#address;
  }

  public async stop(): Promise<void> {
    if (this.#stopped) return;
    this.#ready = false;
    this.#setReady(false);
    this.#removeSignalHandlers();
    if (this.#server.listening) {
      await new Promise<void>((resolve, reject) => {
        this.#server.close((error) => (error ? reject(error) : resolve()));
        this.#server.closeIdleConnections();
      });
    }
    await this.#http.stop();
    this.#metadata.close();
    await this.#lock.release();
    this.#stopped = true;
    this.#address = undefined;
    this.logger.info('Hypod stopped');
  }

  #installSignalHandlers(): void {
    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
      const handler = () => {
        void this.stop().catch((error: unknown) => {
          this.logger.error('Graceful shutdown failed', { signal, error });
          process.exitCode = 1;
        });
      };
      this.#signalHandlers.set(signal, handler);
      process.once(signal, handler);
    }
  }

  #removeSignalHandlers(): void {
    for (const [signal, handler] of this.#signalHandlers) process.off(signal, handler);
    this.#signalHandlers.clear();
  }
}

export const createHypod = async (input: HypodConfigInput = {}): Promise<HypodApplication> => {
  const config = resolveConfig(input);
  const logger = createLogger({ level: config.logLevel });
  for (const deprecation of config.deprecations) logger.warn(deprecation);
  if (config.readOnly) {
    logger.warn(
      'Public Usage started read-only because complete owner credentials are not configured. ' +
        'Set HYPOD_OWNER_IDENTONYM, HYPOD_OWNER_KEY, and HYPOD_TOKEN_SECRET to accept writes.',
    );
  }

  const lock = await DataRootLock.acquire(config.dataRoot);
  let metadata: MetadataRepository | undefined;
  let http: HttpAdapter | undefined;
  try {
    const content = new ContentStore(config.dataRoot);
    await content.initialize();
    metadata = await MetadataRepository.open(config.dataRoot);
    const registry = new Registry(metadata, content);
    const tokenIssuer = config.tokenSecret
      ? new TokenIssuer({
          secret: config.tokenSecret,
          audience: config.externalUrl.host,
          ttlSeconds: config.tokenTtlSeconds,
        })
      : undefined;
    const accessPolicy =
      config.accessPolicy ??
      new BuiltInAccessPolicy({
        mode: config.mode === 'custom' ? 'private' : config.mode,
        ...(config.owner ? { owner: config.owner } : {}),
        ...(tokenIssuer ? { tokenIssuer } : {}),
        tokenTtlSeconds: config.tokenTtlSeconds,
        readOnly: config.readOnly,
      });
    const readiness = { value: false };
    http = await createHttpAdapter({
      config,
      registry,
      accessPolicy,
      logger,
      isReady: () => readiness.value,
    });
    const server = createServer(http.app);
    const application = new HypodApplicationImplementation(
      config,
      http.app,
      registry,
      accessPolicy,
      logger,
      { server, http, metadata, lock, setReady: (value) => (readiness.value = value) },
    );
    // The closure is intentionally changed only after all Modules have initialized.
    readiness.value = true;
    return application;
  } catch (error) {
    if (http) await http.stop();
    metadata?.close();
    await lock.release();
    throw error;
  }
};
