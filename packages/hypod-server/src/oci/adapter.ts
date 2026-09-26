import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream/promises';

import { Router, type Request, type Response } from 'express';

import type { AccessPolicy, Principal, RegistryAction, RequestedAccess } from '../access/types';
import type { Logger } from '../logging/logger';
import { RegistryError } from '../registry/errors';
import type { Registry } from '../registry/registry';

export interface OciRouterOptions {
  registry: Registry;
  accessPolicy: AccessPolicy;
  externalUrl: URL;
  service: string;
  logger: Logger;
  maxManifestBytes?: number;
}

interface OciErrorPayload {
  errors: Array<{ code: string; message: string; detail?: unknown }>;
}

const manifestRoute = /^\/v2\/(.+)\/manifests\/([^/]+)$/;
const tagsRoute = /^\/v2\/(.+)\/tags\/list$/;
const blobRoute = /^\/v2\/(.+)\/blobs\/(sha256:[a-f0-9]+)$/;
const uploadsRoute = /^\/v2\/(.+)\/blobs\/uploads\/?$/;
const uploadRoute = /^\/v2\/(.+)\/blobs\/uploads\/([A-Za-z0-9_-]+)$/;

const queryString = (request: Request, name: string): string | undefined => {
  const value = request.query[name];
  return typeof value === 'string' ? value : undefined;
};

const queryStrings = (request: Request, name: string): string[] => {
  const value = request.query[name];
  if (typeof value === 'string') return [value];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
};

/** The specification asks for at least ten tags per push and allows 414 beyond a limit. */
const maxTagsPerPush = 64;

/**
 * Distribution requires the registry to return at most `n` entries, so `n=0` asks for an
 * empty page. Only a missing or malformed value falls back to the default page size.
 */
const pageCount = (value: string | undefined, fallback = 100): number => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? Math.min(parsed, 1_000) : fallback;
};

const body = async (request: Request, limit: number, code: 'MANIFEST_INVALID') => {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const value of request) {
    const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value as Uint8Array);
    size += chunk.byteLength;
    if (size > limit) throw new RegistryError('SIZE_INVALID', 'Request body is too large.', 413);
    chunks.push(chunk);
  }
  if (size === 0) throw new RegistryError(code, 'Manifest body is required.', 400);
  return Buffer.concat(chunks, size);
};

const stream = (request: Request): AsyncIterable<Uint8Array> => request;

interface ContentRange {
  start: number;
  length: number;
}

const contentRange = (header: string | undefined): ContentRange | undefined => {
  if (!header) return undefined;
  const match = /^(?:bytes\s+)?(\d+)-(\d+)$/.exec(header.trim());
  if (!match) throw new RegistryError('BLOB_UPLOAD_INVALID', 'Content-Range is invalid.', 416);
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || end < start) {
    throw new RegistryError('BLOB_UPLOAD_INVALID', 'Content-Range is invalid.', 416);
  }
  return { start, length: end - start + 1 };
};

interface ByteRange {
  start: number;
  end: number;
}

/**
 * Parses a single RFC 9110 byte range against a known Blob size.
 *
 * Returns `undefined` when the whole Blob should be sent — a missing header, a syntax the
 * registry does not serve, or a multi-range request, all of which a server may answer with
 * the complete representation — and `'unsatisfiable'` when the client named a range that
 * cannot be produced.
 */
const byteRange = (
  header: string | undefined,
  size: number,
): ByteRange | 'unsatisfiable' | undefined => {
  if (!header) return undefined;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return undefined;
  const [, startText, endText] = match;
  if (startText === '' && endText === '') return undefined;
  if (startText === '') {
    const suffix = Number(endText);
    if (!Number.isSafeInteger(suffix) || suffix <= 0 || size === 0) return 'unsatisfiable';
    return { start: Math.max(size - suffix, 0), end: size - 1 };
  }
  const start = Number(startText);
  if (!Number.isSafeInteger(start) || start >= size) return 'unsatisfiable';
  const end = endText === '' ? size - 1 : Number(endText);
  if (!Number.isSafeInteger(end) || end < start) return 'unsatisfiable';
  return { start, end: Math.min(end, size - 1) };
};

const registryActions: readonly RegistryAction[] = ['catalog', 'pull', 'push', 'delete', 'manage'];

const isRegistryAction = (value: string): value is RegistryAction =>
  (registryActions as readonly string[]).includes(value);

const parseScopes = (request: Request): RequestedAccess[] => {
  const url = new URL(request.originalUrl, 'http://hypod.local');
  // A token request may repeat `scope`, or carry several space-separated scopes in one.
  return url.searchParams
    .getAll('scope')
    .flatMap((value) => value.split(/\s+/).filter(Boolean))
    .flatMap((scope): RequestedAccess[] => {
      const [type, name, actionsText] = scope.split(':');
      if ((type !== 'repository' && type !== 'registry') || !name) return [];
      // Clients such as the Docker CLI request every action on a resource as `*`,
      // most visibly for the `registry:catalog:*` scope.
      const actions = [
        ...new Set(
          (actionsText ?? '')
            .split(',')
            .flatMap((action): RegistryAction[] =>
              action === '*' ? [...registryActions] : isRegistryAction(action) ? [action] : [],
            ),
        ),
      ];
      return [{ type, name, actions }];
    });
};

export const createOciRouter = (options: OciRouterOptions): Router => {
  const router = Router();
  const { registry, accessPolicy, externalUrl, service, logger } = options;
  const maxManifestBytes = options.maxManifestBytes ?? 16 * 1024 * 1024;
  const principals = new WeakMap<Request, Promise<Principal | null>>();

  const requestID = (request: Request): string => {
    const candidate = request.header('x-request-id');
    return candidate && /^[A-Za-z0-9._:-]{1,128}$/.test(candidate) ? candidate : randomUUID();
  };

  const principalFor = (request: Request): Promise<Principal | null> => {
    const existing = principals.get(request);
    if (existing) return existing;
    const authorization = request.header('authorization');
    const cookie = request.header('cookie');
    const authentication = accessPolicy.authenticate({
      requestID: requestID(request),
      ...(authorization ? { authorization } : {}),
      ...(cookie ? { cookie } : {}),
    });
    principals.set(request, authentication);
    return authentication;
  };

  const challengeScopes = (response: Response, scopes: string[]) => {
    const realm = new URL('/v2/token', externalUrl).toString();
    const scope = scopes.length > 0 ? `,scope="${scopes.join(' ')}"` : '';
    response.setHeader('WWW-Authenticate', `Bearer realm="${realm}",service="${service}"${scope}`);
  };

  const challenge = (
    response: Response,
    repository?: string,
    actions: RegistryAction[] = ['pull'],
  ) => {
    challengeScopes(response, repository ? [`repository:${repository}:${actions.join(',')}`] : []);
  };

  const authorize = async (
    request: Request,
    response: Response,
    action: RegistryAction,
    repository?: string,
  ): Promise<Principal | null> => {
    const principal = await principalFor(request);
    const isPublic = repository
      ? registry.metadata.getImageneByName(repository)?.isPublic === true
      : false;
    const allowed = await accessPolicy.authorize({
      principal,
      action,
      ...(repository ? { repository, isPublic } : {}),
    });
    if (!allowed) {
      const bearerToken = request.header('authorization')?.startsWith('Bearer ') === true;
      if (!principal || bearerToken) {
        challenge(response, repository, [action]);
        throw new RegistryError(
          'UNAUTHORIZED',
          bearerToken
            ? 'Authentication with the requested scope is required.'
            : 'Authentication is required.',
          401,
        );
      }
      throw new RegistryError('DENIED', 'Requested access is denied.', 403);
    }
    return principal;
  };

  const location = (pathname: string): string => new URL(pathname, externalUrl).toString();

  const uploadHeaders = (
    response: Response,
    repository: string,
    uploadID: string,
    offset: number,
  ) => {
    response.setHeader('Docker-Upload-UUID', uploadID);
    response.setHeader('Location', location(`/v2/${repository}/blobs/uploads/${uploadID}`));
    response.setHeader('Range', offset > 0 ? `0-${offset - 1}` : '0-0');
  };

  const sendError = (response: Response, error: unknown) => {
    if (response.headersSent) {
      response.destroy(error instanceof Error ? error : undefined);
      return;
    }
    const registryError =
      error instanceof RegistryError
        ? error
        : new RegistryError('UNSUPPORTED', 'The registry could not complete the request.', 500);
    const payload: OciErrorPayload = {
      errors: [
        {
          code: registryError.code,
          message: registryError.message,
          ...(registryError.detail === undefined ? {} : { detail: registryError.detail }),
        },
      ],
    };
    response.status(registryError.status).type('application/json').send(payload);
  };

  router.use(async (request, response, next) => {
    if (!request.path.startsWith('/v2')) {
      next();
      return;
    }
    const startedAt = performance.now();
    response.setHeader('Docker-Distribution-API-Version', 'registry/2.0');
    try {
      if ((request.path === '/v2' || request.path === '/v2/') && request.method === 'GET') {
        await authorize(request, response, 'catalog');
        response.status(200).end();
        return;
      }

      if (request.path === '/v2/token' && (request.method === 'GET' || request.method === 'POST')) {
        const authorization = request.header('authorization');
        const issued = accessPolicy.issueToken
          ? await accessPolicy.issueToken({
              ...(authorization ? { authorization } : {}),
              service: queryString(request, 'service') ?? service,
              access: parseScopes(request),
            })
          : undefined;
        if (!issued) {
          challenge(response);
          throw new RegistryError('UNAUTHORIZED', 'Owner credentials are invalid.', 401);
        }
        response.status(200).json(issued);
        return;
      }

      if (request.path === '/v2/_catalog' && request.method === 'GET') {
        const principal = await authorize(request, response, 'catalog');
        const count = pageCount(queryString(request, 'n'));
        const page = registry.catalog(!principal, count, queryString(request, 'last'));
        if (page.next) {
          response.setHeader(
            'Link',
            `</v2/_catalog?n=${count}&last=${encodeURIComponent(page.next)}>; rel="next"`,
          );
        }
        response.status(200).json({ repositories: page.repositories });
        return;
      }

      const tagsMatch = tagsRoute.exec(request.path);
      if (tagsMatch && request.method === 'GET') {
        const repository = tagsMatch[1] as string;
        await authorize(request, response, 'pull', repository);
        const count = pageCount(queryString(request, 'n'));
        const page = registry.tags(repository, count, queryString(request, 'last'));
        if (page.next) {
          response.setHeader(
            'Link',
            `</v2/${repository}/tags/list?n=${count}&last=${encodeURIComponent(page.next)}>; rel="next"`,
          );
        }
        response.status(200).json({ name: page.name, tags: page.tags });
        return;
      }

      const manifestMatch = manifestRoute.exec(request.path);
      if (manifestMatch) {
        const repository = manifestMatch[1] as string;
        const reference = decodeURIComponent(manifestMatch[2] as string);
        if (request.method === 'GET' || request.method === 'HEAD') {
          await authorize(request, response, 'pull', repository);
          const manifest = await registry.getManifest(
            repository,
            reference,
            request.header('accept'),
          );
          response.setHeader('Content-Type', manifest.mediaType);
          response.setHeader('Content-Length', manifest.size);
          response.setHeader('Docker-Content-Digest', manifest.digest);
          response.status(200);
          if (request.method === 'HEAD') response.end();
          else response.send(manifest.bytes);
          return;
        }
        if (request.method === 'PUT') {
          const principal = await authorize(request, response, 'push', repository);
          const tags = queryStrings(request, 'tag');
          if (tags.length > maxTagsPerPush) {
            throw new RegistryError(
              'TAG_INVALID',
              `At most ${maxTagsPerPush} tag parameters may accompany a Manifest push.`,
              414,
            );
          }
          const bytes = await body(request, maxManifestBytes, 'MANIFEST_INVALID');
          const manifest = await registry.putManifest(
            repository,
            reference,
            bytes,
            request.header('content-type'),
            principal?.id ?? 'owner',
            tags,
          );
          response.setHeader('Docker-Content-Digest', manifest.digest);
          response.setHeader(
            'Location',
            location(`/v2/${repository}/manifests/${manifest.digest}`),
          );
          if (tags.length > 0) response.setHeader('OCI-Tag', tags.join(', '));
          response.status(201).end();
          return;
        }
        if (request.method === 'DELETE') {
          await authorize(request, response, 'delete', repository);
          await registry.deleteManifest(repository, reference);
          response.status(202).end();
          return;
        }
      }

      const blobMatch = blobRoute.exec(request.path);
      if (blobMatch) {
        const repository = blobMatch[1] as string;
        const digest = blobMatch[2] as string;
        if (request.method === 'HEAD') {
          await authorize(request, response, 'pull', repository);
          const blob = await registry.describeBlob(repository, digest);
          response.setHeader('Content-Type', 'application/octet-stream');
          response.setHeader('Content-Length', blob.size);
          response.setHeader('Docker-Content-Digest', blob.digest);
          response.setHeader('Accept-Ranges', 'bytes');
          response.status(200).end();
          return;
        }
        if (request.method === 'GET') {
          await authorize(request, response, 'pull', repository);
          const described = await registry.describeBlob(repository, digest);
          const range = byteRange(request.header('range'), described.size);
          if (range === 'unsatisfiable') {
            response.setHeader('Content-Range', `bytes */${described.size}`);
            throw new RegistryError(
              'BLOB_UNKNOWN',
              'The requested Blob range cannot be satisfied.',
              416,
              { digest: described.digest },
            );
          }
          const blob = await registry.openBlob(repository, digest, range);
          response.setHeader('Content-Type', 'application/octet-stream');
          response.setHeader('Docker-Content-Digest', blob.digest);
          response.setHeader('Accept-Ranges', 'bytes');
          if (range) {
            response.setHeader('Content-Length', range.end - range.start + 1);
            response.setHeader(
              'Content-Range',
              `bytes ${range.start}-${range.end}/${described.size}`,
            );
            response.status(206);
          } else {
            response.setHeader('Content-Length', blob.size);
            response.status(200);
          }
          try {
            await pipeline(blob.stream, response);
          } finally {
            blob.stream.destroy();
          }
          return;
        }
        if (request.method === 'DELETE') {
          await authorize(request, response, 'delete', repository);
          await registry.deleteBlob(repository, digest);
          response.status(202).end();
          return;
        }
      }

      const uploadsMatch = uploadsRoute.exec(request.path);
      if (uploadsMatch && request.method === 'POST') {
        const repository = uploadsMatch[1] as string;
        const principal = await authorize(request, response, 'push', repository);
        const mount = queryString(request, 'mount');
        const from = queryString(request, 'from');
        if (mount && from) {
          const sourceIsPublic = registry.metadata.getImageneByName(from)?.isPublic === true;
          const canPullSource = await accessPolicy.authorize({
            principal,
            action: 'pull',
            repository: from,
            isPublic: sourceIsPublic,
          });
          if (!canPullSource) {
            // Mounting needs pull on the source as well as push on the target. Naming both
            // scopes lets the client obtain a token that permits the mount; silently
            // falling back would make every cross-repository mount re-upload the Blob.
            // The challenge depends only on the caller's own scopes, so it reveals
            // nothing about whether the source repository holds this Blob.
            challengeScopes(response, [
              `repository:${repository}:pull,push`,
              `repository:${from}:pull`,
            ]);
            throw new RegistryError(
              'UNAUTHORIZED',
              'Mounting a Blob requires pull access to the source repository.',
              401,
            );
          }
          if (await registry.mountBlob(from, repository, mount, principal?.id ?? 'owner')) {
            response.setHeader('Location', location(`/v2/${repository}/blobs/${mount}`));
            response.setHeader('Docker-Content-Digest', mount);
            response.status(201).end();
            return;
          }
          // Authorized but unmountable, so fall through to an ordinary upload.
        }
        const digest = queryString(request, 'digest');
        const upload = await registry.beginUpload(repository);
        if (digest) {
          const record = await registry.completeUpload(
            repository,
            upload.id,
            digest,
            stream(request),
            undefined,
            principal?.id ?? 'owner',
          );
          response.setHeader('Location', location(`/v2/${repository}/blobs/${record.digest}`));
          response.setHeader('Docker-Content-Digest', record.digest);
          response.status(201).end();
          return;
        }
        uploadHeaders(response, repository, upload.id, upload.offset);
        response.status(202).end();
        return;
      }

      const uploadMatch = uploadRoute.exec(request.path);
      if (uploadMatch) {
        const repository = uploadMatch[1] as string;
        const uploadID = uploadMatch[2] as string;
        const principal = await authorize(request, response, 'push', repository);
        if (request.method === 'GET') {
          const upload = registry.upload(repository, uploadID);
          uploadHeaders(response, repository, upload.id, upload.offset);
          response.status(204).end();
          return;
        }
        if (request.method === 'PATCH') {
          const range = contentRange(request.header('content-range'));
          const upload = await registry.appendUpload(
            repository,
            uploadID,
            stream(request),
            range?.start,
            range?.length,
          );
          uploadHeaders(response, repository, upload.id, upload.offset);
          response.status(202).end();
          return;
        }
        if (request.method === 'PUT') {
          const digest = queryString(request, 'digest');
          if (!digest) {
            throw new RegistryError('DIGEST_INVALID', 'digest query parameter is required.', 400);
          }
          const range = contentRange(request.header('content-range'));
          const record = await registry.completeUpload(
            repository,
            uploadID,
            digest,
            stream(request),
            range?.start,
            principal?.id ?? 'owner',
            range?.length,
          );
          response.setHeader('Location', location(`/v2/${repository}/blobs/${record.digest}`));
          response.setHeader('Docker-Content-Digest', record.digest);
          response.status(201).end();
          return;
        }
        if (request.method === 'DELETE') {
          await registry.cancelUpload(repository, uploadID);
          response.status(204).end();
          return;
        }
      }

      throw new RegistryError('UNSUPPORTED', 'Registry route is unsupported.', 404);
    } catch (error) {
      logger.warn('OCI request failed', {
        requestID: requestID(request),
        method: request.method,
        path: request.path,
        durationMilliseconds: performance.now() - startedAt,
        error,
      });
      sendError(response, error);
    }
  });

  return router;
};
