import { randomUUID } from 'node:crypto';
import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import express, { type Express, type Request } from 'express';

import type { AccessPolicy } from '../access/types';
import type { HypodConfig } from '../config/config';
import { createGraphqlAdapter } from '../graphql/adapter';
import type { Logger } from '../logging/logger';
import { createOciRouter } from '../oci/adapter';
import type { Registry } from '../registry/registry';

export interface HttpAdapterOptions {
  config: HypodConfig;
  registry: Registry;
  accessPolicy: AccessPolicy;
  logger: Logger;
  isReady: () => boolean;
}

export interface HttpAdapter {
  app: Express;
  stop(): Promise<void>;
}

const idFor = (request: Request): string => {
  const candidate = request.header('x-request-id');
  return candidate && /^[A-Za-z0-9._:-]{1,128}$/.test(candidate) ? candidate : randomUUID();
};

const fileExists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const runtimeDirectory = (): string =>
  typeof __dirname === 'string' ? __dirname : dirname(fileURLToPath(import.meta.url));

export const createHttpAdapter = async (options: HttpAdapterOptions): Promise<HttpAdapter> => {
  const { config, registry, accessPolicy, logger, isReady } = options;
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.use((request, response, next) => {
    const requestID = idFor(request);
    const startedAt = performance.now();
    response.setHeader('x-request-id', requestID);
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('referrer-policy', 'no-referrer');
    response.setHeader('x-frame-options', 'DENY');
    response.once('finish', () => {
      logger.info('HTTP request', {
        requestID,
        method: request.method,
        path: request.path,
        status: response.statusCode,
        durationMilliseconds: performance.now() - startedAt,
      });
    });
    next();
  });

  app.get('/health/live', (_request, response) => {
    response.status(200).json({ status: 'live' });
  });
  app.get('/health/ready', (_request, response) => {
    response.status(isReady() ? 200 : 503).json({ status: isReady() ? 'ready' : 'not-ready' });
  });

  app.use(
    createOciRouter({
      registry,
      accessPolicy,
      externalUrl: config.externalUrl,
      service: config.externalUrl.host,
      logger,
    }),
  );

  const graphql = await createGraphqlAdapter({
    registry,
    accessPolicy,
    mode: config.mode,
    externalUrl: config.externalUrl,
    service: config.externalUrl.host,
    logger,
  });
  app.use('/graphql', graphql.router);

  if (config.serveAdmin) {
    const clientRoot = resolve(runtimeDirectory(), 'client');
    const index = resolve(clientRoot, 'index.html');
    if (await fileExists(index)) {
      app.use(express.static(clientRoot, { index: false, immutable: true, maxAge: '1y' }));
      app.use((request, response, next) => {
        if (request.method !== 'GET' || !request.accepts('html')) {
          next();
          return;
        }
        response.sendFile(index);
      });
    } else {
      app.get('/', (_request, response) => {
        response
          .status(200)
          .type('html')
          .send(
            '<!doctype html><html lang="en"><meta charset="utf-8"><title>Hypod</title><body><main><h1>Hypod</h1><p>The admin interface has not been built.</p></main></body></html>',
          );
      });
    }
  }

  app.use((_request, response) => {
    response.status(404).json({ error: 'Not found.' });
  });

  return { app, stop: () => graphql.stop() };
};
