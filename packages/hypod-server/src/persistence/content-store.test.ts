import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { ContentDigestMismatchError, ContentStore, digestBytes } from './content-store';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('ContentStore', () => {
  it('addresses a Manifest by its exact bytes and rejects a mismatched expected digest', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-content-'));
    roots.push(root);
    const store = new ContentStore(root);
    await store.initialize();

    const compact = Buffer.from('{"schemaVersion":2}');
    const spaced = Buffer.from('{ "schemaVersion": 2 }');
    const descriptor = await store.putManifest(compact);

    expect(descriptor.digest).toBe(digestBytes(compact));
    expect(descriptor.digest).not.toBe(digestBytes(spaced));
    expect(await store.readManifest(descriptor.digest)).toEqual(compact);
    await expect(store.putBlob(spaced, descriptor.digest)).rejects.toBeInstanceOf(
      ContentDigestMismatchError,
    );
    expect(await store.hasBlob(descriptor.digest)).toBe(false);
  });
});
