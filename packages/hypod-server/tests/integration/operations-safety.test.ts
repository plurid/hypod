import { spawnSync } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createHypod } from '../../src/application';
import { runMigration } from '../../src/operations/migrate';
import { DataRootAlreadyLockedError, DataRootLock } from '../../src/persistence/data-root-lock';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const temporaryRoot = async (prefix: string): Promise<string> => {
  const root = await mkdtemp(join(tmpdir(), prefix));
  roots.push(root);
  return root;
};

describe('offline operation safety', () => {
  it('refuses to migrate a data root that a Hypod process is serving', async () => {
    const root = await temporaryRoot('hypod-migrate-lock-');
    const application = await createHypod({
      mode: 'public',
      dataRoot: root,
      port: 0,
      serveAdmin: false,
      logLevel: 'silent',
    });
    try {
      await expect(runMigration({ dataRoot: root, dryRun: true })).rejects.toBeInstanceOf(
        DataRootAlreadyLockedError,
      );
    } finally {
      await application.stop();
    }
    await expect(runMigration({ dataRoot: root, dryRun: true })).resolves.toMatchObject({
      status: 'already-applied',
    });
  });

  it('keeps the lock beside the generation directory it protects', async () => {
    const root = await temporaryRoot('hypod-lock-placement-');
    const lock = await DataRootLock.acquire(root);
    try {
      expect(lock.path).toBe(join(root, '.hypod.lock'));
      // Acquiring the lock must not create the `v2` generation that migration renames
      // into place, otherwise every migration reports itself as already applied.
      await expect(access(join(root, 'v2'))).rejects.toThrow();
    } finally {
      await lock.release();
    }
  });

  it('recovers the data root after a writer is killed without releasing its lock', async () => {
    const root = await temporaryRoot('hypod-lock-crash-');
    // A writer that takes the lock and is then killed outright, the way a container OOM
    // kill or `kill -9` ends a real deployment.
    const crashed = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import { DatabaseSync } from 'node:sqlite';
         const database = new DatabaseSync(${JSON.stringify(join('PLACEHOLDER', '.hypod.lock'))}, { timeout: 0 });
         database.exec('PRAGMA journal_mode = DELETE');
         database.exec('BEGIN EXCLUSIVE');
         process.stdout.write('held');
         process.kill(process.pid, 'SIGKILL');`.replace('PLACEHOLDER', root),
      ],
      { encoding: 'utf8' },
    );
    expect(crashed.stdout).toContain('held');
    expect(crashed.signal).toBe('SIGKILL');

    // The kernel released the record lock when that process died, so the root is usable.
    const lock = await DataRootLock.acquire(root);
    await lock.release();
  });

  it('refuses a second writer while the first still holds the data root', async () => {
    const root = await temporaryRoot('hypod-lock-live-');
    const first = await DataRootLock.acquire(root);
    try {
      await expect(DataRootLock.acquire(root)).rejects.toBeInstanceOf(DataRootAlreadyLockedError);
    } finally {
      await first.release();
    }
    const second = await DataRootLock.acquire(root);
    await second.release();
  });

  it('does not start a registry when the CLI module is imported rather than executed', async () => {
    const root = await temporaryRoot('hypod-cli-import-');
    const previous = process.env.HYPOD_DATA_ROOT;
    process.env.HYPOD_DATA_ROOT = root;
    try {
      const cli = await import('../../src/cli');
      expect(typeof cli.runCli).toBe('function');
      await new Promise((resolve) => setImmediate(resolve));
      await expect(access(join(root, '.hypod.lock'))).rejects.toThrow();
    } finally {
      if (previous === undefined) delete process.env.HYPOD_DATA_ROOT;
      else process.env.HYPOD_DATA_ROOT = previous;
    }
  });
});
