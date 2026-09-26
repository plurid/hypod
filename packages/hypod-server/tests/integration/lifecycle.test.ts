import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createHypod } from '../../src/application';
import { DataRootAlreadyLockedError } from '../../src/persistence/data-root-lock';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('Hypod lifecycle', () => {
  it('awaits readiness, reports health, drains, and releases the data-root lock', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-application-'));
    roots.push(root);
    const application = await createHypod({
      mode: 'public',
      dataRoot: root,
      port: 0,
      serveAdmin: false,
      logLevel: 'silent',
    });

    await application.ready();
    await expect(
      createHypod({ mode: 'public', dataRoot: root, serveAdmin: false }),
    ).rejects.toBeInstanceOf(DataRootAlreadyLockedError);
    const address = await application.start();
    await expect(
      fetch(`${address.url}/health/live`).then((response) => response.status),
    ).resolves.toBe(200);
    await expect(
      fetch(`${address.url}/health/ready`).then((response) => response.status),
    ).resolves.toBe(200);
    await application.stop();

    const replacement = await createHypod({
      mode: 'public',
      dataRoot: root,
      port: 0,
      serveAdmin: false,
      logLevel: 'silent',
    });
    await replacement.stop();
  });
});
