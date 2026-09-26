import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { hostname } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

interface LockPayload {
  pid: number;
  host: string;
  acquiredAt: string;
}

export class DataRootAlreadyLockedError extends Error {
  public constructor(
    public readonly lockPath: string,
    public readonly owner?: Partial<LockPayload>,
  ) {
    super(
      `Hypod data root is already locked${owner?.pid ? ` by process ${owner.pid}` : ''}${
        owner?.host ? ` on ${owner.host}` : ''
      }: ${lockPath}. Stop that Hypod process, or the offline operation holding the root, and retry.`,
    );
    this.name = 'DataRootAlreadyLockedError';
  }
}

const readOwner = async (path: string): Promise<Partial<LockPayload> | undefined> => {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as Partial<LockPayload>;
  } catch {
    return undefined;
  }
};

/**
 * Exclusive, single-writer access to one data root.
 *
 * The lock is an open SQLite `BEGIN EXCLUSIVE` transaction against a dedicated file, so the
 * operating system owns it: the kernel drops the underlying record lock when the holding
 * process exits for any reason, including `SIGKILL` and a hard crash. A previous writer can
 * therefore never leave behind a lock that permanently refuses every later start, and no
 * process-liveness heuristic — which would risk stealing a live lock after PID reuse — is
 * needed to decide whether an existing lock is stale.
 *
 * It lives beside the generation directories rather than inside `v2`, because migration
 * renames a freshly built `v2` into place and must not have to move or race the lock that
 * protects it. A sibling owner file records who holds the lock, for diagnostics only; the
 * lock itself never depends on that file being accurate.
 */
export class DataRootLock {
  #released = false;
  readonly #database: DatabaseSync;

  private constructor(
    public readonly path: string,
    public readonly ownerPath: string,
    database: DatabaseSync,
  ) {
    this.#database = database;
  }

  public static async acquire(dataRoot: string): Promise<DataRootLock> {
    await mkdir(dataRoot, { recursive: true });
    const path = join(dataRoot, '.hypod.lock');
    const ownerPath = join(dataRoot, '.hypod.owner');

    let database: DatabaseSync | undefined;
    try {
      database = new DatabaseSync(path, { timeout: 0 });
      // A rollback journal keeps the lock to a single file and a single kernel record lock.
      database.exec('PRAGMA journal_mode = DELETE');
      database.exec('BEGIN EXCLUSIVE');
    } catch {
      database?.close();
      throw new DataRootAlreadyLockedError(path, await readOwner(ownerPath));
    }

    const payload: LockPayload = {
      pid: process.pid,
      host: hostname(),
      acquiredAt: new Date().toISOString(),
    };
    try {
      await writeFile(ownerPath, `${JSON.stringify(payload)}\n`, { mode: 0o600 });
    } catch {
      // The owner file is diagnostic. Failing to record it must not fail the acquisition.
    }
    return new DataRootLock(path, ownerPath, database);
  }

  public async release(): Promise<void> {
    if (this.#released) return;
    this.#released = true;
    try {
      this.#database.exec('ROLLBACK');
    } catch {
      // The transaction may already be gone; closing the handle still releases the lock.
    }
    this.#database.close();
    await rm(this.ownerPath, { force: true });
  }
}
