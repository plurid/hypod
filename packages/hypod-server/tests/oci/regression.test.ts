import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { BuiltInAccessPolicy } from '../../src/access/built-in-policy';
import { TokenIssuer } from '../../src/access/token-issuer';
import { createLogger } from '../../src/logging/logger';
import { createOciRouter } from '../../src/oci/adapter';
import { ContentStore, digestBytes } from '../../src/persistence/content-store';
import { MetadataRepository } from '../../src/persistence/metadata-repository';
import { OCI_IMAGE_MANIFEST } from '../../src/registry/manifest';
import { Registry } from '../../src/registry/registry';

const roots: string[] = [];
const closers: Array<() => void> = [];

afterEach(async () => {
  closers.splice(0).forEach((close) => {
    close();
  });
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const service = 'registry.example.test';
const secret = '0123456789abcdef0123456789abcdef';

const manifestFor = (configurationDigest: string, size: number): Buffer =>
  Buffer.from(
    JSON.stringify({
      schemaVersion: 2,
      mediaType: OCI_IMAGE_MANIFEST,
      config: {
        mediaType: 'application/vnd.oci.image.config.v1+json',
        digest: configurationDigest,
        size,
      },
      layers: [],
    }),
  );

const scenario = async (options: { readOnly?: boolean } = {}) => {
  const root = await mkdtemp(join(tmpdir(), 'hypod-regression-'));
  roots.push(root);
  const content = new ContentStore(root);
  await content.initialize();
  const metadata = await MetadataRepository.open(root);
  closers.push(() => {
    metadata.close();
  });
  const registry = new Registry(metadata, content);
  const tokenIssuer = new TokenIssuer({ secret, audience: service, ttlSeconds: 300 });
  const accessPolicy = new BuiltInAccessPolicy({
    mode: 'public',
    owner: { identonym: 'owner', key: 'owner-key' },
    tokenIssuer,
    ...(options.readOnly === undefined ? {} : { readOnly: options.readOnly }),
  });
  const app = express();
  app.use(
    createOciRouter({
      registry,
      accessPolicy,
      externalUrl: new URL(`https://${service}`),
      service,
      logger: createLogger({ level: 'silent' }),
    }),
  );
  const authorization = `Basic ${Buffer.from('owner:owner-key').toString('base64')}`;
  return { app, authorization, content, metadata, registry, tokenIssuer };
};

describe('OCI adapter regressions', () => {
  it('answers HEAD for a Blob without opening the stored bytes', async () => {
    const { app, authorization, content, registry } = await scenario();
    const bytes = Buffer.from('head-me');
    const digest = digestBytes(bytes);
    await registry.putBlob('team/app', bytes, digest);

    let opened = 0;
    const createStream = content.createBlobReadStream.bind(content);
    content.createBlobReadStream = (value: string) => {
      opened += 1;
      return createStream(value);
    };

    await request(app)
      .head(`/v2/team/app/blobs/${digest}`)
      .set('Authorization', authorization)
      .expect(200)
      .expect('Content-Length', String(bytes.byteLength))
      .expect('Docker-Content-Digest', digest);
    expect(opened).toBe(0);

    await request(app)
      .get(`/v2/team/app/blobs/${digest}`)
      .set('Authorization', authorization)
      .expect(200);
    expect(opened).toBe(1);
  });

  it('refuses a Manifest that references a Blob belonging to another repository', async () => {
    const { app, authorization, registry } = await scenario();
    const configuration = Buffer.from('private-configuration');
    const configurationDigest = digestBytes(configuration);
    await registry.putBlob('team/private', configuration, configurationDigest);

    const response = await request(app)
      .put('/v2/team/attacker/manifests/latest')
      .set('Authorization', authorization)
      .set('Content-Type', OCI_IMAGE_MANIFEST)
      .send(manifestFor(configurationDigest, configuration.byteLength).toString('utf8'))
      .expect(400);
    expect(response.body.errors[0].code).toBe('MANIFEST_BLOB_UNKNOWN');

    await request(app)
      .get(`/v2/team/attacker/blobs/${configurationDigest}`)
      .set('Authorization', authorization)
      .expect(404);
  });

  it('refuses an image index that references a Manifest from another repository', async () => {
    const { app, authorization, registry } = await scenario();
    const configuration = Buffer.from('index-configuration');
    const configurationDigest = digestBytes(configuration);
    await registry.putBlob('team/source', configuration, configurationDigest);
    const child = manifestFor(configurationDigest, configuration.byteLength);
    const childDigest = digestBytes(child);
    await registry.putManifest('team/source', childDigest, child, OCI_IMAGE_MANIFEST);

    const index = Buffer.from(
      JSON.stringify({
        schemaVersion: 2,
        mediaType: 'application/vnd.oci.image.index.v1+json',
        manifests: [
          {
            mediaType: OCI_IMAGE_MANIFEST,
            digest: childDigest,
            size: child.byteLength,
          },
        ],
      }),
    );
    const response = await request(app)
      .put('/v2/team/elsewhere/manifests/multi')
      .set('Authorization', authorization)
      .set('Content-Type', 'application/vnd.oci.image.index.v1+json')
      .send(index.toString('utf8'))
      .expect(400);
    expect(response.body.errors[0].code).toBe('MANIFEST_BLOB_UNKNOWN');
  });

  it('reports NAME_UNKNOWN for tags of a repository the registry does not have', async () => {
    const { app, authorization } = await scenario();
    const response = await request(app)
      .get('/v2/team/absent/tags/list')
      .set('Authorization', authorization)
      .expect(404);
    expect(response.body.errors[0].code).toBe('NAME_UNKNOWN');
  });

  it('returns an empty page when a client asks for zero entries', async () => {
    const { app, authorization, registry } = await scenario();
    const configuration = Buffer.from('page-configuration');
    const configurationDigest = digestBytes(configuration);
    await registry.putBlob('team/app', configuration, configurationDigest);
    const bytes = manifestFor(configurationDigest, configuration.byteLength);
    for (const tag of ['one', 'two']) {
      await registry.putManifest('team/app', tag, bytes, OCI_IMAGE_MANIFEST);
    }

    await request(app)
      .get('/v2/team/app/tags/list?n=0')
      .set('Authorization', authorization)
      .expect(200)
      .expect(({ body, headers }) => {
        expect(body.tags).toEqual([]);
        expect(headers.link).toBeUndefined();
      });
    await request(app)
      .get('/v2/_catalog?n=0')
      .set('Authorization', authorization)
      .expect(200)
      .expect(({ body }) => {
        expect(body.repositories).toEqual([]);
      });
    await request(app)
      .get('/v2/team/app/tags/list')
      .set('Authorization', authorization)
      .expect(200)
      .expect(({ body }) => {
        expect(body.tags).toEqual(['one', 'two']);
      });
  });

  it('issues a usable token for the wildcard scope the Docker CLI requests', async () => {
    const { app, authorization, registry } = await scenario();
    const configuration = Buffer.from('catalog-configuration');
    const configurationDigest = digestBytes(configuration);
    await registry.putBlob('team/app', configuration, configurationDigest);

    const issued = await request(app)
      .get('/v2/token')
      .query({ service, scope: 'registry:catalog:*' })
      .set('Authorization', authorization)
      .expect(200);
    await request(app)
      .get('/v2/_catalog')
      .set('Authorization', `Bearer ${issued.body.token as string}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.repositories).toEqual(['team/app']);
      });
  });

  it('serves byte ranges of a Blob and refuses ranges it cannot satisfy', async () => {
    const { app, authorization, registry } = await scenario();
    const bytes = Buffer.from('0123456789abcdef'.repeat(8));
    const digest = digestBytes(bytes);
    await registry.putBlob('team/app', bytes, digest);
    const path = `/v2/team/app/blobs/${digest}`;

    await request(app)
      .head(path)
      .set('Authorization', authorization)
      .expect(200)
      .expect('Accept-Ranges', 'bytes');

    const window = await request(app)
      .get(path)
      .set('Authorization', authorization)
      .set('Range', 'bytes=10-19')
      .expect(206)
      .expect('Content-Length', '10')
      .expect('Content-Range', `bytes 10-19/${bytes.byteLength}`);
    expect(Buffer.from(window.body)).toEqual(bytes.subarray(10, 20));

    const openEnded = await request(app)
      .get(path)
      .set('Authorization', authorization)
      .set('Range', 'bytes=100-')
      .expect(206)
      .expect('Content-Range', `bytes 100-${bytes.byteLength - 1}/${bytes.byteLength}`);
    expect(Buffer.from(openEnded.body)).toEqual(bytes.subarray(100));

    const suffix = await request(app)
      .get(path)
      .set('Authorization', authorization)
      .set('Range', 'bytes=-16')
      .expect(206)
      .expect('Content-Length', '16');
    expect(Buffer.from(suffix.body)).toEqual(bytes.subarray(bytes.byteLength - 16));

    // An end beyond the Blob is clamped rather than refused.
    await request(app)
      .get(path)
      .set('Authorization', authorization)
      .set('Range', `bytes=120-9999`)
      .expect(206)
      .expect('Content-Range', `bytes 120-${bytes.byteLength - 1}/${bytes.byteLength}`);

    for (const unsatisfiable of ['bytes=500-0', 'bytes=5000-10000']) {
      await request(app)
        .get(path)
        .set('Authorization', authorization)
        .set('Range', unsatisfiable)
        .expect(416)
        .expect('Content-Range', `bytes */${bytes.byteLength}`);
    }

    // A range syntax the registry does not serve falls back to the whole Blob.
    const whole = await request(app)
      .get(path)
      .set('Authorization', authorization)
      .set('Range', 'bytes=0-9,20-29')
      .expect(200)
      .expect('Content-Length', String(bytes.byteLength));
    expect(Buffer.from(whole.body)).toEqual(bytes);
  });

  it('deletes a tag without removing the Manifest it pointed at', async () => {
    const { app, authorization, registry } = await scenario();
    const configuration = Buffer.from('tag-delete-configuration');
    const configurationDigest = digestBytes(configuration);
    await registry.putBlob('team/app', configuration, configurationDigest);
    const bytes = manifestFor(configurationDigest, configuration.byteLength);
    const manifest = await registry.putManifest('team/app', 'keep', bytes, OCI_IMAGE_MANIFEST);
    await registry.putManifest('team/app', 'drop', bytes, OCI_IMAGE_MANIFEST);

    await request(app)
      .delete('/v2/team/app/manifests/drop')
      .set('Authorization', authorization)
      .expect(202);
    await request(app)
      .head('/v2/team/app/manifests/drop')
      .set('Authorization', authorization)
      .expect(404);
    await request(app)
      .get(`/v2/team/app/manifests/${manifest.digest}`)
      .set('Authorization', authorization)
      .expect(200);
    await request(app)
      .get('/v2/team/app/tags/list')
      .set('Authorization', authorization)
      .expect(200)
      .expect(({ body }) => {
        expect(body.tags).toEqual(['keep']);
      });

    const missing = await request(app)
      .delete('/v2/team/app/manifests/never-existed')
      .set('Authorization', authorization)
      .expect(404);
    expect(missing.body.errors[0].code).toBe('MANIFEST_UNKNOWN');
  });

  it('applies tag query parameters when a Manifest is pushed by digest', async () => {
    const { app, authorization, registry } = await scenario();
    const configuration = Buffer.from('tag-param-configuration');
    const configurationDigest = digestBytes(configuration);
    await registry.putBlob('team/app', configuration, configurationDigest);
    const bytes = manifestFor(configurationDigest, configuration.byteLength);
    const digest = digestBytes(bytes);

    await request(app)
      .put(`/v2/team/app/manifests/${digest}?tag=1.2.3&tag=1.2&tag=latest`)
      .set('Authorization', authorization)
      .set('Content-Type', OCI_IMAGE_MANIFEST)
      .send(bytes.toString('utf8'))
      .expect(201)
      .expect('OCI-Tag', '1.2.3, 1.2, latest')
      .expect('Docker-Content-Digest', digest);

    await request(app)
      .get('/v2/team/app/tags/list')
      .set('Authorization', authorization)
      .expect(200)
      .expect(({ body }) => {
        expect(body.tags).toEqual(['1.2', '1.2.3', 'latest']);
      });
    for (const tag of ['1.2.3', '1.2', 'latest']) {
      await request(app)
        .get(`/v2/team/app/manifests/${tag}`)
        .set('Authorization', authorization)
        .expect(200)
        .expect('Docker-Content-Digest', digest);
    }

    // A Manifest pushed by digest with no tag parameter stays untagged.
    const untagged = manifestFor(configurationDigest, configuration.byteLength - 0);
    await request(app)
      .put(`/v2/team/other/manifests/${digestBytes(untagged)}`)
      .set('Authorization', authorization)
      .set('Content-Type', OCI_IMAGE_MANIFEST)
      .send(untagged.toString('utf8'))
      .expect(400);

    const invalid = await request(app)
      .put(`/v2/team/app/manifests/${digest}?tag=not%20a%20tag`)
      .set('Authorization', authorization)
      .set('Content-Type', OCI_IMAGE_MANIFEST)
      .send(bytes.toString('utf8'))
      .expect(400);
    expect(invalid.body.errors[0].code).toBe('TAG_INVALID');
  });

  it('refuses every write while a read-only Hypod still serves public pulls', async () => {
    const { app, authorization, registry, metadata } = await scenario({ readOnly: true });
    const configuration = Buffer.from('read-only-configuration');
    const configurationDigest = digestBytes(configuration);
    await registry.putBlob('team/app', configuration, configurationDigest);
    await registry.putManifest(
      'team/app',
      'latest',
      manifestFor(configurationDigest, configuration.byteLength),
      OCI_IMAGE_MANIFEST,
    );
    metadata.setImagenePublic(metadata.getImageneByName('team/app')!.id, true);

    await request(app)
      .post('/v2/team/app/blobs/uploads/')
      .set('Authorization', authorization)
      .expect(403);
    await request(app)
      .put('/v2/team/app/manifests/next')
      .set('Authorization', authorization)
      .set('Content-Type', OCI_IMAGE_MANIFEST)
      .send(manifestFor(configurationDigest, configuration.byteLength).toString('utf8'))
      .expect(403);
    await request(app)
      .delete(`/v2/team/app/manifests/${digestBytes(configuration)}`)
      .set('Authorization', authorization)
      .expect(403);
    await request(app).get('/v2/team/app/manifests/latest').expect(200);

    const issued = await request(app)
      .get('/v2/token')
      .query({ service, scope: 'repository:team/app:pull,push' })
      .set('Authorization', authorization)
      .expect(200);
    await request(app)
      .post('/v2/team/app/blobs/uploads/')
      .set('Authorization', `Bearer ${issued.body.token as string}`)
      .expect(401);
  });
});
