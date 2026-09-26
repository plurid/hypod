import { resolve } from 'node:path';

import type { AccessPolicy } from '../access/types';

export type HypodMode = 'public' | 'private' | 'custom';
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';
export type TrustProxy = boolean | number | string;

export interface OwnerCredentials {
  identonym: string;
  key: string;
}

export interface HypodConfig {
  mode: HypodMode;
  host: string;
  port: number;
  externalUrl: URL;
  dataRoot: string;
  trustProxy: TrustProxy;
  owner?: OwnerCredentials;
  tokenSecret?: string;
  tokenTtlSeconds: number;
  accessPolicy?: AccessPolicy;
  readOnly: boolean;
  logLevel: LogLevel;
  serveAdmin: boolean;
  manageSignals: boolean;
  deprecations: string[];
}

export interface HypodConfigInput {
  mode?: HypodMode;
  host?: string;
  port?: number;
  externalUrl?: string | URL;
  dataRoot?: string;
  trustProxy?: TrustProxy;
  owner?: OwnerCredentials;
  tokenSecret?: string;
  tokenTtlSeconds?: number;
  accessPolicy?: AccessPolicy;
  logLevel?: LogLevel;
  serveAdmin?: boolean;
  manageSignals?: boolean;
}

export class HypodConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'HypodConfigurationError';
  }
}

const legacyNames = [
  'PORT',
  'HYPOD_PRIVATE_USAGE',
  'HYPOD_PRIVATE_OWNER_IDENTONYM',
  'HYPOD_PRIVATE_OWNER_KEY',
  'HYPOD_PRIVATE_TOKEN',
  'HYPOD_STORAGE_ROOT_PATH',
  'HYPOD_DATABASE_TYPE',
  'HYPOD_STORAGE_TYPE',
  'HYPOD_DOCKER_REALM_BASE',
  'HYPOD_DOCKER_SERVICE',
  'HYPOD_CUSTOM_LOGIC',
  'PERFORMER_CUSTOM_LOGIC_USAGE',
  'HYPOD_QUIET',
  'HYPOD_QUITE',
] as const;

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  throw new HypodConfigurationError(`Expected a boolean configuration value, received ${value}.`);
};

const parsePositiveInteger = (
  value: string | number | undefined,
  name: string,
  fallback: number,
): number => {
  if (value === undefined) return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new HypodConfigurationError(`${name} must be a positive integer.`);
  }
  return parsed;
};

const parseMode = (value: string | undefined): HypodMode | undefined => {
  if (value === undefined || value === '') return undefined;
  if (value === 'public' || value === 'private' || value === 'custom') return value;
  throw new HypodConfigurationError('HYPOD_MODE must be public, private, or custom.');
};

const parseLogLevel = (value: string | undefined): LogLevel | undefined => {
  if (value === undefined || value === '') return undefined;
  if (
    value === 'silent' ||
    value === 'error' ||
    value === 'warn' ||
    value === 'info' ||
    value === 'debug'
  ) {
    return value;
  }
  throw new HypodConfigurationError('HYPOD_LOG_LEVEL must be silent, error, warn, info, or debug.');
};

const parseTrustProxy = (value: string | undefined): TrustProxy | undefined => {
  if (value === undefined || value === '') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : value;
};

const resolveLegacyMode = (environment: NodeJS.ProcessEnv): HypodMode | undefined => {
  if (
    environment.HYPOD_CUSTOM_LOGIC === 'true' ||
    environment.PERFORMER_CUSTOM_LOGIC_USAGE === 'true'
  ) {
    return 'custom';
  }
  if (environment.HYPOD_PRIVATE_USAGE !== undefined) {
    return environment.HYPOD_PRIVATE_USAGE === 'true' ? 'private' : 'public';
  }
  return undefined;
};

const normalizeExternalUrl = (value: string | URL): URL => {
  let url: URL;
  try {
    url = value instanceof URL ? new URL(value) : new URL(value);
  } catch {
    throw new HypodConfigurationError('HYPOD_EXTERNAL_URL must be an absolute HTTP(S) URL.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new HypodConfigurationError('HYPOD_EXTERNAL_URL must use HTTP or HTTPS.');
  }
  if (url.username || url.password) {
    throw new HypodConfigurationError('HYPOD_EXTERNAL_URL must not contain credentials.');
  }
  return url;
};

const legacyExternalUrl = (environment: NodeJS.ProcessEnv): string | undefined => {
  if (environment.HYPOD_DOCKER_REALM_BASE) return environment.HYPOD_DOCKER_REALM_BASE;
  if (!environment.HYPOD_DOCKER_SERVICE) return undefined;
  return environment.HYPOD_DOCKER_SERVICE.includes('://')
    ? environment.HYPOD_DOCKER_SERVICE
    : `http://${environment.HYPOD_DOCKER_SERVICE}`;
};

const assertFilesystemOnly = (environment: NodeJS.ProcessEnv): void => {
  const database = environment.HYPOD_DATABASE_TYPE;
  const storage = environment.HYPOD_STORAGE_TYPE;
  if (database && database !== 'filesystem') {
    throw new HypodConfigurationError(
      `Legacy database type "${database}" is unsupported; Hypod 0.2 supports SQLite metadata only.`,
    );
  }
  if (storage && storage !== 'filesystem') {
    throw new HypodConfigurationError(
      `Legacy storage type "${storage}" is unsupported; Hypod 0.2 supports local files only.`,
    );
  }
};

export const resolveConfig = (
  input: HypodConfigInput = {},
  environment: NodeJS.ProcessEnv = process.env,
): HypodConfig => {
  assertFilesystemOnly(environment);

  const deprecations = legacyNames
    .filter((name) => environment[name] !== undefined)
    .map(
      (name) =>
        `${name} is a legacy configuration alias and will be removed in a future major release.`,
    );

  const mode =
    input.mode ?? parseMode(environment.HYPOD_MODE) ?? resolveLegacyMode(environment) ?? 'public';
  const host = input.host ?? environment.HYPOD_HOST ?? '127.0.0.1';
  if (!host.trim()) throw new HypodConfigurationError('HYPOD_HOST must not be empty.');
  const port =
    input.port === 0
      ? 0
      : parsePositiveInteger(
          input.port ?? environment.HYPOD_PORT ?? environment.PORT,
          'port',
          56565,
        );
  if (port > 65_535) throw new HypodConfigurationError('port must be at most 65535.');

  const externalUrl = normalizeExternalUrl(
    input.externalUrl ??
      environment.HYPOD_EXTERNAL_URL ??
      legacyExternalUrl(environment) ??
      `http://${host}:${port}`,
  );

  const legacyRoot = environment.HYPOD_STORAGE_ROOT_PATH
    ? resolve(environment.HYPOD_STORAGE_ROOT_PATH, 'data')
    : undefined;
  const dataRoot = resolve(input.dataRoot ?? environment.HYPOD_DATA_ROOT ?? legacyRoot ?? 'data');
  const trustProxy = input.trustProxy ?? parseTrustProxy(environment.HYPOD_TRUST_PROXY) ?? false;

  const identonym =
    input.owner?.identonym ??
    environment.HYPOD_OWNER_IDENTONYM ??
    environment.HYPOD_PRIVATE_OWNER_IDENTONYM;
  const key =
    input.owner?.key ?? environment.HYPOD_OWNER_KEY ?? environment.HYPOD_PRIVATE_OWNER_KEY;
  const owner = identonym && key ? { identonym, key } : undefined;
  const tokenSecret =
    input.tokenSecret ?? environment.HYPOD_TOKEN_SECRET ?? environment.HYPOD_PRIVATE_TOKEN;
  if (tokenSecret !== undefined && Buffer.byteLength(tokenSecret, 'utf8') < 32) {
    throw new HypodConfigurationError('Token secret must contain at least 32 UTF-8 bytes.');
  }
  const tokenTtlSeconds = parsePositiveInteger(
    input.tokenTtlSeconds ?? environment.HYPOD_TOKEN_TTL_SECONDS,
    'token TTL',
    900,
  );
  if (tokenTtlSeconds > 86_400) {
    throw new HypodConfigurationError('token TTL must be at most 86400 seconds.');
  }

  const credentialsComplete = owner !== undefined && tokenSecret !== undefined;
  let readOnly = false;
  if (mode === 'public' && !credentialsComplete) {
    readOnly = true;
  }
  if (mode === 'private' && !credentialsComplete) {
    throw new HypodConfigurationError(
      'Private Usage requires owner identonym, owner key, and token secret.',
    );
  }
  if (mode === 'custom' && !input.accessPolicy) {
    throw new HypodConfigurationError('Custom Usage requires an AccessPolicy implementation.');
  }
  const quiet = parseBoolean(environment.HYPOD_QUIET ?? environment.HYPOD_QUITE, false);
  const logLevel =
    input.logLevel ?? parseLogLevel(environment.HYPOD_LOG_LEVEL) ?? (quiet ? 'silent' : 'info');

  return {
    mode,
    host,
    port,
    externalUrl,
    dataRoot,
    trustProxy,
    ...(owner ? { owner } : {}),
    ...(tokenSecret ? { tokenSecret } : {}),
    tokenTtlSeconds,
    ...(input.accessPolicy ? { accessPolicy: input.accessPolicy } : {}),
    readOnly,
    logLevel,
    serveAdmin: input.serveAdmin ?? parseBoolean(environment.HYPOD_SERVE_ADMIN, true),
    manageSignals: input.manageSignals ?? false,
    deprecations,
  };
};
