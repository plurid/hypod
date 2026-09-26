import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { DataRootAlreadyLockedError, DataRootLock } from './data-root-lock';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('DataRootLock', () => {
  it('allows only one writer and releases ownership explicitly', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-lock-'));
    roots.push(root);
    const first = await DataRootLock.acquire(root);

    await expect(DataRootLock.acquire(root)).rejects.toBeInstanceOf(DataRootAlreadyLockedError);
    await first.release();
    const second = await DataRootLock.acquire(root);
    await second.release();
  });
});
