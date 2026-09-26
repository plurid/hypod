import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { BuiltInAccessPolicy } from '../../src/access/built-in-policy';
import { createGraphqlAdapter } from '../../src/graphql/adapter';
import { createLogger } from '../../src/logging/logger';
import { ContentStore } from '../../src/persistence/content-store';
import { MetadataRepository } from '../../src/persistence/metadata-repository';
import { Registry } from '../../src/registry/registry';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('GraphQL access filtering', () => {
  it('returns only public Imagenes to an anonymous admin-interface request', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-graphql-'));
    roots.push(root);
    const content = new ContentStore(root);
    await content.initialize();
    const metadata = await MetadataRepository.open(root);
    const registry = new Registry(metadata, content);
    const publicImagene = metadata.ensureImagene('team/public', 'owner');
    metadata.setImagenePublic(publicImagene.id, true);
    metadata.ensureImagene('team/private', 'owner');
    const graphql = await createGraphqlAdapter({
      registry,
      accessPolicy: new BuiltInAccessPolicy({ mode: 'public' }),
      mode: 'public',
      externalUrl: new URL('https://registry.example.test'),
      service: 'registry.example.test',
      logger: createLogger({ level: 'silent' }),
    });
    const app = express();
    app.use('/graphql', graphql.router);

    try {
      const response = await request(app)
        .post('/graphql')
        .send({
          query:
            'query { getImagenes { status data { name isPublic } } getCurrentOwner { status error { type } data { id } } }',
        })
        .expect(200);
      expect(response.body.data.getImagenes).toEqual({
        status: true,
        data: [{ name: 'team/public', isPublic: true }],
      });
      expect(response.body.data.getCurrentOwner).toEqual({
        status: false,
        error: { type: 'Unauthorized' },
        data: null,
      });
    } finally {
      await graphql.stop();
      metadata.close();
    }
  });

  it('lets a read-only Owner browse the admin interface but not mutate through it', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-graphql-read-only-'));
    roots.push(root);
    const content = new ContentStore(root);
    await content.initialize();
    const metadata = await MetadataRepository.open(root);
    const registry = new Registry(metadata, content);
    metadata.ensureImagene('team/private', 'owner');
    const graphql = await createGraphqlAdapter({
      registry,
      accessPolicy: new BuiltInAccessPolicy({
        mode: 'public',
        owner: { identonym: 'owner', key: 'owner-key' },
        readOnly: true,
      }),
      mode: 'public',
      externalUrl: new URL('https://registry.example.test'),
      service: 'registry.example.test',
      logger: createLogger({ level: 'silent' }),
    });
    const app = express();
    app.use('/graphql', graphql.router);
    const authorization = `Basic ${Buffer.from('owner:owner-key').toString('base64')}`;

    try {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', authorization)
        .send({
          query: `query { getImagenes { status data { name } } }`,
        })
        .expect(200);
      expect(response.body.data.getImagenes).toEqual({
        status: true,
        data: [{ name: 'team/private' }],
      });

      const mutation = await request(app)
        .post('/graphql')
        .set('Authorization', authorization)
        .send({
          query: `mutation { registerNamespace(input: { value: "platform" }) { status error { type } } }`,
        })
        .expect(200);
      expect(mutation.body.data.registerNamespace).toEqual({
        status: false,
        error: { type: 'ReadOnly' },
      });
      expect(metadata.listNamespaces()).toEqual([]);
    } finally {
      await graphql.stop();
      metadata.close();
    }
  });
});
