import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BuiltInAccessPolicy } from '../../src/access/built-in-policy';
import { TokenIssuer } from '../../src/access/token-issuer';
import { createLogger } from '../../src/logging/logger';
import { createOciRouter } from '../../src/oci/adapter';
import { ContentStore, digestBytes } from '../../src/persistence/content-store';
import { MetadataRepository } from '../../src/persistence/metadata-repository';
import { OCI_IMAGE_MANIFEST } from '../../src/registry/manifest';
import { Registry } from '../../src/registry/registry';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('OCI public access', () => {
  it('serves public pulls anonymously while challenging writes and private pulls', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-oci-'));
    roots.push(root);
    const content = new ContentStore(root);
    await content.initialize();
    const metadata = await MetadataRepository.open(root);
    const registry = new Registry(metadata, content);
    const configuration = Buffer.from('configuration');
    const configurationDigest = digestBytes(configuration);
    await registry.putBlob('team/public', configuration, configurationDigest);
    const manifestBytes = Buffer.from(
      JSON.stringify({
        schemaVersion: 2,
        mediaType: OCI_IMAGE_MANIFEST,
        config: {
          mediaType: 'application/vnd.oci.image.config.v1+json',
          digest: configurationDigest,
          size: configuration.byteLength,
        },
        layers: [],
      }),
    );
    const manifest = await registry.putManifest('team/public', 'latest', manifestBytes);
    const publicImagene = metadata.getImageneByName('team/public');
    metadata.setImagenePublic(publicImagene!.id, true);
    await registry.putBlob('team/private', configuration, configurationDigest);
    await registry.putManifest('team/private', 'latest', manifestBytes);

    const app = express();
    app.use(
      createOciRouter({
        registry,
        accessPolicy: new BuiltInAccessPolicy({ mode: 'public' }),
        externalUrl: new URL('https://registry.example.test'),
        service: 'registry.example.test',
        logger: createLogger({ level: 'silent' }),
      }),
    );

    try {
      await request(app)
        .get('/v2/')
        .expect(200)
        .expect('Docker-Distribution-API-Version', 'registry/2.0');
      await request(app)
        .get('/v2/team/public/manifests/latest')
        .set('Accept', OCI_IMAGE_MANIFEST)
        .expect(200)
        .expect('Docker-Content-Digest', manifest.digest)
        .expect('Content-Type', OCI_IMAGE_MANIFEST);
      await request(app)
        .put('/v2/team/public/manifests/latest')
        .set('Content-Type', OCI_IMAGE_MANIFEST)
        .send(manifestBytes)
        .expect(401)
        .expect('WWW-Authenticate', /Bearer realm=/);
      await request(app).get('/v2/team/private/manifests/latest').expect(401);
    } finally {
      metadata.close();
    }
  });

  it('streams a scoped chunked upload back without buffering the stored Blob', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-oci-stream-'));
    roots.push(root);
    const content = new ContentStore(root);
    await content.initialize();
    const metadata = await MetadataRepository.open(root);
    const registry = new Registry(metadata, content);
    const service = 'registry.example.test';
    const tokenIssuer = new TokenIssuer({
      secret: '0123456789abcdef0123456789abcdef',
      audience: service,
      ttlSeconds: 300,
    });
    const accessPolicy = new BuiltInAccessPolicy({
      mode: 'public',
      owner: { identonym: 'owner', key: 'test-key' },
      tokenIssuer,
    });
    const app = express();
    app.use(
      createOciRouter({
        registry,
        accessPolicy,
        externalUrl: new URL('https://registry.example.test'),
        service,
        logger: createLogger({ level: 'silent' }),
      }),
    );

    try {
      const tokenResponse = await request(app)
        .get('/v2/token')
        .query({ service, scope: 'repository:team/stream:pull,push' })
        .set('Authorization', `Basic ${Buffer.from('owner:test-key').toString('base64')}`)
        .expect(200);
      const authorization = `Bearer ${tokenResponse.body.token as string}`;
      const initiated = await request(app)
        .post('/v2/team/stream/blobs/uploads/')
        .set('Authorization', authorization)
        .expect(202);
      const uploadPath = new URL(initiated.headers.location as string).pathname;
      const first = Buffer.from('streamed-');
      const second = Buffer.from('blob');
      const bytes = Buffer.concat([first, second]);
      const digest = digestBytes(bytes);

      await request(app)
        .patch(uploadPath)
        .set('Authorization', authorization)
        .set('Content-Type', 'application/octet-stream')
        .set('Content-Range', '0-99')
        .send(Buffer.from('bad'))
        .expect(416)
        .expect(({ body }) => {
          expect(body.errors[0].code).toBe('BLOB_UPLOAD_INVALID');
        });

      const pullOnlyAuthorization = `Bearer ${tokenIssuer.issue('owner', [
        { type: 'repository', name: 'team/stream', actions: ['pull'] },
      ])}`;
      await request(app)
        .get(uploadPath)
        .set('Authorization', pullOnlyAuthorization)
        .expect(401)
        .expect('WWW-Authenticate', /scope="repository:team\/stream:push"/);
      await request(app)
        .get(uploadPath)
        .set('Authorization', authorization)
        .expect(204)
        .expect('Range', '0-0');

      await request(app)
        .patch(uploadPath)
        .set('Authorization', authorization)
        .set('Content-Type', 'application/octet-stream')
        .set('Content-Range', `0-${first.byteLength - 1}`)
        .send(first)
        .expect(202)
        .expect('Range', `0-${first.byteLength - 1}`);
      await request(app)
        .put(`${uploadPath}?digest=${encodeURIComponent(digest)}`)
        .set('Authorization', authorization)
        .set('Content-Type', 'application/octet-stream')
        .set('Content-Range', `${first.byteLength}-${bytes.byteLength - 1}`)
        .send(second)
        .expect(201)
        .expect('Docker-Content-Digest', digest);

      vi.spyOn(content, 'readBlob').mockRejectedValue(new Error('Blob reads must stream.'));
      const pulled = await request(app)
        .get(`/v2/team/stream/blobs/${digest}`)
        .set('Authorization', authorization)
        .expect(200)
        .expect('Content-Length', String(bytes.byteLength));
      expect(pulled.body).toEqual(bytes);

      const pushOnlyToken = tokenIssuer.issue('owner', [
        { type: 'repository', name: 'team/mounted', actions: ['push'] },
      ]);
      // A token without pull on the source cannot mount. The challenge names both scopes
      // so the client can obtain one that can, instead of silently re-uploading the Blob.
      await request(app)
        .post('/v2/team/mounted/blobs/uploads/')
        .query({ mount: digest, from: 'team/stream' })
        .set('Authorization', `Bearer ${pushOnlyToken}`)
        .expect(401)
        .expect(
          'WWW-Authenticate',
          /scope="repository:team\/mounted:pull,push repository:team\/stream:pull"/,
        );
      expect(metadata.repositoryReferencesBlob('team/mounted', digest)).toBe(false);

      const mountToken = tokenIssuer.issue('owner', [
        { type: 'repository', name: 'team/mounted', actions: ['push'] },
        { type: 'repository', name: 'team/stream', actions: ['pull'] },
      ]);
      await request(app)
        .post('/v2/team/mounted/blobs/uploads/')
        .query({ mount: digest, from: 'team/stream' })
        .set('Authorization', `Bearer ${mountToken}`)
        .expect(201)
        .expect('Docker-Content-Digest', digest);
      expect(metadata.repositoryReferencesBlob('team/mounted', digest)).toBe(true);
    } finally {
      metadata.close();
    }
  });
});
