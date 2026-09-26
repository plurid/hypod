import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runGarbageCollection } from './garbage-collection';
import { ContentStore } from '../persistence/content-store';
import { MetadataRepository } from '../persistence/metadata-repository';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('offline garbage collection', () => {
  it('reports orphans without mutation in dry-run and removes them only when applied', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-gc-'));
    roots.push(root);
    const content = new ContentStore(root);
    await content.initialize();
    const metadata = await MetadataRepository.open(root);
    const orphan = await content.putBlob(Buffer.from('orphan'));
    metadata.recordBlob({
      ...orphan,
      path: content.pathFor('blobs', orphan.digest),
      generatedAt: Date.now(),
    });
    metadata.close();

    const planned = await runGarbageCollection({ dataRoot: root, dryRun: true });
    expect(planned.blobs).toContain(orphan.digest);
    await expect(access(content.pathFor('blobs', orphan.digest))).resolves.toBeUndefined();

    const applied = await runGarbageCollection({ dataRoot: root, dryRun: false });
    expect(applied.deletedBlobs).toBe(1);
    await expect(access(content.pathFor('blobs', orphan.digest))).rejects.toThrow();
  });
});
