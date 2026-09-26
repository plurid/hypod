import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runMigration } from '../../src/operations/migrate';
import { ContentStore, digestBytes } from '../../src/persistence/content-store';
import { MetadataRepository } from '../../src/persistence/metadata-repository';
import { OCI_IMAGE_MANIFEST } from '../../src/registry/manifest';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('legacy migration', () => {
  it('dry-runs without writes, preserves legacy files, activates last, and is idempotent', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-migrate-'));
    roots.push(root);
    const configuration = Buffer.from('legacy-configuration');
    const layer = Buffer.from('legacy-layer');
    const configurationDigest = digestBytes(configuration);
    const layerDigest = digestBytes(layer);
    const manifest = Buffer.from(
      JSON.stringify({
        schemaVersion: 2,
        mediaType: OCI_IMAGE_MANIFEST,
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
    const legacyManifestPath = join(root, 'imagenes', 'manifest', 'team', 'app', 'latest');
    await mkdir(join(root, 'metadata', 'imagenes'), { recursive: true });
    await mkdir(join(root, 'imagenes', 'sha256'), { recursive: true });
    await mkdir(join(root, 'imagenes', 'manifest', 'team', 'app'), { recursive: true });
    await writeFile(join(root, 'imagenes', 'sha256', configurationDigest.slice(7)), configuration);
    await writeFile(join(root, 'imagenes', 'sha256', layerDigest.slice(7)), layer);
    await writeFile(legacyManifestPath, manifest);
    await writeFile(
      join(root, 'metadata', 'imagenes', 'legacy-image.json'),
      JSON.stringify({
        id: 'legacy-image',
        generatedAt: 1_700_000_000,
        name: 'team/app',
        latest: 'latest',
        tags: [],
        isPublic: true,
      }),
    );

    const dryRun = await runMigration({ dataRoot: root, dryRun: true });
    expect(dryRun.status).toBe('planned');
    await expect(access(join(root, 'v2'))).rejects.toThrow();

    const applied = await runMigration({ dataRoot: root, dryRun: false });
    expect(applied.status).toBe('applied');
    expect(await readFile(legacyManifestPath)).toEqual(manifest);
    const metadata = await MetadataRepository.open(root, { readOnly: true });
    const content = new ContentStore(root);
    try {
      const imagene = metadata.getImageneByName('team/app');
      expect(imagene?.isPublic).toBe(true);
      expect(imagene?.tags[0]?.digest).toBe(digestBytes(manifest));
      expect(await content.readManifest(digestBytes(manifest))).toEqual(manifest);
    } finally {
      metadata.close();
    }

    const repeated = await runMigration({ dataRoot: root, dryRun: false });
    expect(repeated.status).toBe('already-applied');
  });
});
