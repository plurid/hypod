import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { ContentStore, digestBytes } from '../persistence/content-store';
import { MetadataRepository } from '../persistence/metadata-repository';
import { Registry } from './registry';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('Registry Manifest publication', () => {
  it('publishes the exact Manifest digest and sums declared compressed layer sizes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-registry-'));
    roots.push(root);
    const content = new ContentStore(root);
    await content.initialize();
    const metadata = await MetadataRepository.open(root);
    const registry = new Registry(metadata, content);

    try {
      const configuration = Buffer.from('config');
      const layer = Buffer.from('compressed-layer');
      const configurationDigest = digestBytes(configuration);
      const layerDigest = digestBytes(layer);
      await registry.putBlob('team/app', configuration, configurationDigest);
      await registry.putBlob('team/app', layer, layerDigest);

      const bytes = Buffer.from(
        JSON.stringify({
          schemaVersion: 2,
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          config: {
            mediaType: 'application/vnd.oci.image.config.v1+json',
            digest: configurationDigest,
            size: configuration.byteLength,
          },
          layers: [
            {
              mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip',
              digest: layerDigest,
              size: layer.byteLength,
            },
          ],
        }),
      );

      const manifest = await registry.putManifest('team/app', 'latest', bytes);
      const imagene = metadata.getImageneByName('team/app');

      expect(manifest.digest).toBe(digestBytes(bytes));
      expect(imagene?.tags[0]?.digest).toBe(manifest.digest);
      expect(imagene?.tags[0]?.size).toBe(layer.byteLength);
    } finally {
      metadata.close();
    }
  });

  it('accepts externally hosted layers without recording them as local Blobs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-registry-external-'));
    roots.push(root);
    const content = new ContentStore(root);
    await content.initialize();
    const metadata = await MetadataRepository.open(root);
    const registry = new Registry(metadata, content);

    try {
      const configuration = Buffer.from('config');
      const layer = Buffer.from('local-layer');
      const configurationDigest = digestBytes(configuration);
      const layerDigest = digestBytes(layer);
      const externalDigest = digestBytes(Buffer.from('external-layer'));
      await registry.putBlob('team/external', configuration, configurationDigest);
      await registry.putBlob('team/external', layer, layerDigest);

      const bytes = Buffer.from(
        JSON.stringify({
          schemaVersion: 2,
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          config: {
            mediaType: 'application/vnd.oci.image.config.v1+json',
            digest: configurationDigest,
            size: configuration.byteLength,
          },
          layers: [
            {
              mediaType: 'application/vnd.oci.image.layer.nondistributable.v1.tar+gzip',
              digest: externalDigest,
              size: 123_456,
              urls: [`https://content.example.test/blobs/${externalDigest}`],
            },
            {
              mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip',
              digest: layerDigest,
              size: layer.byteLength,
            },
          ],
        }),
      );

      const manifest = await registry.putManifest('team/external', 'latest', bytes);
      const stored = await registry.getManifest('team/external', manifest.digest);

      expect(stored.bytes).toEqual(bytes);
      expect(metadata.repositoryReferencesBlob('team/external', externalDigest)).toBe(false);
      expect(metadata.getImageneByName('team/external')?.tags[0]?.size).toBe(layer.byteLength);
    } finally {
      metadata.close();
    }
  });
});

describe('Imagene latest tag', () => {
  it('names the most recently generated Tag after publication and after deletion', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-latest-'));
    roots.push(root);
    const content = new ContentStore(root);
    await content.initialize();
    const metadata = await MetadataRepository.open(root);
    let now = 1_000;
    const registry = new Registry(metadata, content, { clock: () => now });

    try {
      const configuration = Buffer.from('latest-configuration');
      const configurationDigest = digestBytes(configuration);
      await registry.putBlob('team/app', configuration, configurationDigest);
      const bytes = Buffer.from(
        JSON.stringify({
          schemaVersion: 2,
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          config: {
            mediaType: 'application/vnd.oci.image.config.v1+json',
            digest: configurationDigest,
            size: configuration.byteLength,
          },
          layers: [],
        }),
      );

      await registry.putManifest('team/app', 'first', bytes);
      expect(metadata.getImageneByName('team/app')?.latest).toBe('first');

      now = 2_000;
      await registry.putManifest('team/app', 'second', bytes);
      expect(metadata.getImageneByName('team/app')?.latest).toBe('second');

      // Re-publishing an older reference does not make it the latest Tag, because
      // publication and deletion share one definition of `latest`.
      now = 1_500;
      await registry.putManifest('team/app', 'third', bytes);
      expect(metadata.getImageneByName('team/app')?.latest).toBe('second');

      const imagene = metadata.getImageneByName('team/app');
      expect(registry.deleteTag(imagene!.id, 'second')).toBe(true);
      expect(metadata.getImageneByName('team/app')?.latest).toBe('third');
    } finally {
      metadata.close();
    }
  });
});
