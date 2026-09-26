import { COPYFILE_EXCL } from 'node:constants';
import {
  access,
  copyFile,
  link,
  lstat,
  mkdir,
  readFile,
  readdir,
  rename,
  rmdir,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, join, relative, sep } from 'node:path';

import type { Imagene, Namespace, Project } from '@plurid/hypod-contracts';

import { ContentStore, digestBytes } from '../persistence/content-store';
import { DataRootLock } from '../persistence/data-root-lock';
import { MetadataRepository } from '../persistence/metadata-repository';
import { OCI_IMAGE_INDEX, DOCKER_MANIFEST_LIST, parseManifest } from '../registry/manifest';
import { Registry } from '../registry/registry';

export interface MigrationOptions {
  dataRoot: string;
  dryRun: boolean;
  clock?: () => number;
}

export interface MigrationReport {
  status: 'planned' | 'applied' | 'already-applied';
  dataRoot: string;
  backup?: string;
  namespaces: number;
  projects: number;
  imagenes: number;
  blobs: number;
  manifests: number;
  warnings: string[];
}

interface LegacyInventory {
  namespaces: Namespace[];
  projects: Project[];
  imagenes: Imagene[];
  blobs: Array<{ path: string; digest: string }>;
  manifests: Array<{ path: string; repository: string; reference: string; isIndex: boolean }>;
  warnings: string[];
}

export class MigrationValidationError extends Error {
  public constructor(public readonly failures: string[]) {
    super(
      `Legacy migration validation failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`,
    );
    this.name = 'MigrationValidationError';
  }
}

const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const filesBelow = async (root: string): Promise<string[]> => {
  if (!(await exists(root))) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(root, entry.name);
      return entry.isDirectory() ? filesBelow(path) : [path];
    }),
  );
  return nested.flat();
};

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const numberValue = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const readJsonObjects = async (
  root: string,
  warnings: string[],
): Promise<Record<string, unknown>[]> => {
  const values: Record<string, unknown>[] = [];
  for (const path of await filesBelow(root)) {
    try {
      const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
      if (record(parsed)) values.push(parsed);
      else warnings.push(`Ignored non-object metadata file ${path}.`);
    } catch {
      warnings.push(`Ignored unreadable metadata file ${path}.`);
    }
  }
  return values;
};

const inspectLegacy = async (dataRoot: string, now: number): Promise<LegacyInventory> => {
  const warnings: string[] = [];
  const namespaceObjects = await readJsonObjects(
    join(dataRoot, 'metadata', 'namespaces'),
    warnings,
  );
  const projectObjects = await readJsonObjects(join(dataRoot, 'metadata', 'projects'), warnings);
  const imageneObjects = await readJsonObjects(join(dataRoot, 'metadata', 'imagenes'), warnings);

  const namespaces = namespaceObjects.flatMap((item): Namespace[] => {
    if (typeof item.id !== 'string' || typeof item.name !== 'string') return [];
    return [
      {
        id: item.id,
        name: item.name,
        generatedAt: numberValue(item.generatedAt, now),
        generatedBy: typeof item.generatedBy === 'string' ? item.generatedBy : 'owner',
      },
    ];
  });
  const projects = projectObjects.flatMap((item): Project[] => {
    if (typeof item.id !== 'string' || typeof item.name !== 'string') return [];
    return [
      {
        id: item.id,
        name: item.name,
        generatedAt: numberValue(item.generatedAt, now),
        generatedBy: typeof item.generatedBy === 'string' ? item.generatedBy : 'owner',
        namespaceID: typeof item.namespaceID === 'string' ? item.namespaceID : null,
      },
    ];
  });
  const imagenes = imageneObjects.flatMap((item): Imagene[] => {
    if (typeof item.id !== 'string' || typeof item.name !== 'string') return [];
    return [
      {
        id: item.id,
        name: item.name,
        generatedAt: numberValue(item.generatedAt, now),
        latest: typeof item.latest === 'string' ? item.latest : '',
        tags: [],
        isPublic: item.isPublic === true,
        projectID: typeof item.projectID === 'string' ? item.projectID : null,
      },
    ];
  });

  const blobs: LegacyInventory['blobs'] = [];
  for (const path of await filesBelow(join(dataRoot, 'imagenes', 'sha256'))) {
    const hexadecimal = basename(path);
    if (!/^[a-f0-9]{64}$/.test(hexadecimal)) {
      warnings.push(`Ignored legacy Blob with non-digest name ${path}.`);
      continue;
    }
    blobs.push({ path, digest: `sha256:${hexadecimal}` });
  }

  const manifestRoot = join(dataRoot, 'imagenes', 'manifest');
  const manifests: LegacyInventory['manifests'] = [];
  for (const path of await filesBelow(manifestRoot)) {
    const relativePath = relative(manifestRoot, path);
    const segments = relativePath.split(sep);
    const reference = segments.pop();
    const repository = segments.join('/');
    if (!reference || !repository) {
      warnings.push(`Ignored legacy Manifest with an ambiguous path ${path}.`);
      continue;
    }
    let isIndex = false;
    try {
      const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
      isIndex =
        record(parsed) &&
        (parsed.mediaType === OCI_IMAGE_INDEX || parsed.mediaType === DOCKER_MANIFEST_LIST);
    } catch {
      warnings.push(`Legacy Manifest ${path} is not valid JSON and will fail apply validation.`);
    }
    manifests.push({ path, repository, reference, isIndex });
  }
  return { namespaces, projects, imagenes, blobs, manifests, warnings };
};

const linkOrCopyTree = async (source: string, destination: string): Promise<void> => {
  if (!(await exists(source))) return;
  const details = await lstat(source);
  if (details.isDirectory()) {
    await mkdir(destination, { recursive: true });
    for (const entry of await readdir(source)) {
      await linkOrCopyTree(join(source, entry), join(destination, entry));
    }
    return;
  }
  await mkdir(dirname(destination), { recursive: true });
  try {
    await link(source, destination);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return;
    await copyFile(source, destination, COPYFILE_EXCL);
  }
};

const backupLegacy = async (dataRoot: string): Promise<string> => {
  const destination = join(dataRoot, 'backups', 'legacy-before-v2');
  await mkdir(destination, { recursive: true });
  for (const name of ['metadata', 'imagenes', 'blobs']) {
    await linkOrCopyTree(join(dataRoot, name), join(destination, name));
  }
  return destination;
};

const validateStaging = async (
  metadata: MetadataRepository,
  content: ContentStore,
): Promise<string[]> => {
  const failures: string[] = [];
  const referenced = metadata.referencedContent();
  for (const digest of referenced.blobs) {
    if (!(await content.hasBlob(digest))) failures.push(`Referenced Blob ${digest} is missing.`);
    else if (digestBytes(await content.readBlob(digest)) !== digest) {
      failures.push(`Referenced Blob ${digest} does not match its bytes.`);
    }
  }
  for (const digest of referenced.manifests) {
    if (!(await content.hasManifest(digest)))
      failures.push(`Referenced Manifest ${digest} is missing.`);
    else if (digestBytes(await content.readManifest(digest)) !== digest) {
      failures.push(`Referenced Manifest ${digest} does not match its bytes.`);
    }
  }
  return failures;
};

const migrate = async (options: MigrationOptions): Promise<MigrationReport> => {
  const dataRoot = options.dataRoot;
  const now = options.clock?.() ?? Date.now();
  const target = join(dataRoot, 'v2');
  const activeMarker = join(dataRoot, 'ACTIVE');
  const inventory = await inspectLegacy(dataRoot, now);
  const baseReport = {
    dataRoot,
    namespaces: inventory.namespaces.length,
    projects: inventory.projects.length,
    imagenes: inventory.imagenes.length,
    blobs: inventory.blobs.length,
    manifests: inventory.manifests.length,
    warnings: inventory.warnings,
  };
  if (await exists(target)) return { status: 'already-applied', ...baseReport };
  if (options.dryRun) return { status: 'planned', ...baseReport };

  const backup = await backupLegacy(dataRoot);
  const stagingRoot = join(dataRoot, '.hypod-migration');
  const content = new ContentStore(stagingRoot);
  await content.initialize();
  const clockOptions = options.clock ? { clock: options.clock } : {};
  const metadata = await MetadataRepository.open(stagingRoot, clockOptions);
  const registry = new Registry(metadata, content, clockOptions);
  const failures: string[] = [];
  try {
    for (const namespace of inventory.namespaces) metadata.importNamespace(namespace);
    for (const project of inventory.projects) {
      try {
        metadata.importProject(project);
      } catch (error) {
        failures.push(`Could not import Project ${project.id}: ${(error as Error).message}`);
      }
    }
    for (const imagene of inventory.imagenes) metadata.importImagene(imagene);

    for (const legacy of inventory.blobs) {
      try {
        const bytes = await readFile(legacy.path);
        const descriptor = await content.putBlob(bytes, legacy.digest);
        metadata.recordBlob({
          ...descriptor,
          path: content.pathFor('blobs', descriptor.digest),
          generatedAt: now,
        });
      } catch (error) {
        failures.push(`Could not import Blob ${legacy.digest}: ${(error as Error).message}`);
      }
    }

    const ordered = [
      ...inventory.manifests.filter(({ isIndex }) => !isIndex),
      ...inventory.manifests.filter(({ isIndex }) => isIndex),
    ];
    for (const legacy of ordered) {
      try {
        const bytes = await readFile(legacy.path);
        // The legacy layout stores Blobs in one global tree with no repository
        // association. Publishing is repository-scoped, so the Blobs a Manifest
        // declares are linked to that Manifest's repository first.
        for (const blob of parseManifest(bytes).blobs) {
          if (metadata.getBlob(blob.digest)) {
            metadata.linkBlob(legacy.repository, 'owner', blob.digest);
          }
        }
        await registry.putManifest(legacy.repository, legacy.reference, bytes, undefined, 'owner');
      } catch (error) {
        failures.push(
          `Could not import Manifest ${legacy.repository}:${legacy.reference}: ${(error as Error).message}`,
        );
      }
    }
    for (const imagene of inventory.imagenes) {
      const imported = metadata.getImageneByName(imagene.name);
      if (imported) metadata.setImagenePublic(imported.id, imagene.isPublic);
    }
    failures.push(...(await validateStaging(metadata, content)));
  } finally {
    metadata.close();
  }
  if (failures.length) throw new MigrationValidationError(failures);

  await rename(join(stagingRoot, 'v2'), target);
  try {
    await rmdir(stagingRoot);
  } catch {
    // A resumability artifact may remain; it does not affect the active generation.
  }
  const markerTemporary = `${activeMarker}.tmp`;
  await writeFile(
    markerTemporary,
    `${JSON.stringify({ version: 2, activatedAt: new Date(now).toISOString(), backup })}\n`,
    { mode: 0o600 },
  );
  await rename(markerTemporary, activeMarker);
  return { status: 'applied', backup, ...baseReport };
};

/**
 * Migration rewrites the active data layout, so it holds the data-root lock for its
 * whole run and refuses to touch a data root that a Hypod process is serving.
 */
export const runMigration = async (options: MigrationOptions): Promise<MigrationReport> => {
  const lock = await DataRootLock.acquire(options.dataRoot);
  try {
    return await migrate(options);
  } finally {
    await lock.release();
  }
};
