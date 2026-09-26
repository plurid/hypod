import { access } from 'node:fs/promises';
import { join } from 'node:path';

import { resolveConfig } from '../config/config';
import { ContentStore, digestBytes } from '../persistence/content-store';
import { DataRootLock } from '../persistence/data-root-lock';
import { MetadataRepository } from '../persistence/metadata-repository';

export interface DoctorOptions {
  dataRoot: string;
  environment?: NodeJS.ProcessEnv;
}

export interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface DoctorReport {
  ok: boolean;
  dataRoot: string;
  checks: DoctorCheck[];
}

const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

export const runDoctor = async (options: DoctorOptions): Promise<DoctorReport> => {
  const checks: DoctorCheck[] = [];
  try {
    const config = resolveConfig({ dataRoot: options.dataRoot }, options.environment);
    checks.push({
      name: 'configuration',
      ok: true,
      detail: `${config.mode} Usage; external URL ${config.externalUrl.origin}; ${config.readOnly ? 'read-only' : 'writes enabled'}.`,
    });
  } catch (error) {
    checks.push({ name: 'configuration', ok: false, detail: (error as Error).message });
  }
  const versionRoot = join(options.dataRoot, 'v2');
  const layoutExists = await exists(versionRoot);
  checks.push({
    name: 'layout',
    ok: layoutExists,
    detail: layoutExists ? 'v2 data layout is present.' : 'v2 data layout is missing.',
  });
  if (!layoutExists) return { ok: false, dataRoot: options.dataRoot, checks };

  let lock: DataRootLock;
  try {
    lock = await DataRootLock.acquire(options.dataRoot);
    checks.push({
      name: 'offline',
      ok: true,
      detail: 'Data root is not owned by a running writer.',
    });
  } catch (error) {
    checks.push({ name: 'offline', ok: false, detail: (error as Error).message });
    return { ok: false, dataRoot: options.dataRoot, checks };
  }

  let metadata: MetadataRepository | undefined;
  try {
    metadata = await MetadataRepository.open(options.dataRoot, { readOnly: true });
    const integrity = metadata.integrityCheck();
    checks.push({
      name: 'sqlite-integrity',
      ok: integrity.length === 1 && integrity[0] === 'ok',
      detail: integrity.join('; '),
    });
    const foreignKeys = metadata.foreignKeyViolations();
    checks.push({
      name: 'sqlite-foreign-keys',
      ok: foreignKeys.length === 0,
      detail: foreignKeys.length === 0 ? 'No violations.' : JSON.stringify(foreignKeys),
    });
    const versions = metadata.migrationVersions();
    checks.push({
      name: 'sqlite-migrations',
      ok: versions.includes(1),
      detail: `Applied versions: ${versions.join(', ') || 'none'}.`,
    });

    const content = new ContentStore(options.dataRoot);
    const referenced = metadata.referencedContent();
    for (const digest of referenced.blobs) {
      let ok = false;
      let detail = 'Blob is missing.';
      try {
        const bytes = await content.readBlob(digest);
        ok = digestBytes(bytes) === digest;
        detail = ok ? 'Digest matches exact bytes.' : 'Digest does not match exact bytes.';
      } catch {
        // Missing is represented by the default detail.
      }
      checks.push({ name: `blob:${digest}`, ok, detail });
    }
    for (const digest of referenced.manifests) {
      let ok = false;
      let detail = 'Manifest is missing.';
      try {
        const bytes = await content.readManifest(digest);
        ok = digestBytes(bytes) === digest;
        detail = ok ? 'Digest matches exact bytes.' : 'Digest does not match exact bytes.';
      } catch {
        // Missing is represented by the default detail.
      }
      checks.push({ name: `manifest:${digest}`, ok, detail });
    }
  } catch (error) {
    checks.push({ name: 'metadata-open', ok: false, detail: (error as Error).message });
  } finally {
    metadata?.close();
    await lock.release();
  }
  return { ok: checks.every(({ ok }) => ok), dataRoot: options.dataRoot, checks };
};
