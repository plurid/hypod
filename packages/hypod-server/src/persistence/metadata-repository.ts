import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { DatabaseSync, type StatementSync } from 'node:sqlite';

import type { Imagene, ImageneTag, Namespace, Owner, Project } from '@plurid/hypod-contracts';

import { asDigest, type ContentDescriptor, type Digest } from './content-store';

interface NamespaceRow {
  id: string;
  name: string;
  owner_id: string;
  generated_at: number;
}

interface ProjectRow extends NamespaceRow {
  namespace_id: string | null;
}

interface ImageneRow {
  id: string;
  name: string;
  owner_id: string;
  project_id: string | null;
  visibility: 'public' | 'private';
  latest: string;
  generated_at: number;
}

interface TagRow {
  id: string;
  imagene_id: string;
  name: string;
  manifest_digest: string;
  size: number;
  generated_at: number;
}

export interface ManifestRecord {
  digest: Digest;
  mediaType: string;
  size: number;
  path: string;
  generatedAt: number;
}

interface ManifestRow {
  digest: string;
  media_type: string;
  size: number;
  path: string;
  generated_at: number;
}

export interface BlobRecord extends ContentDescriptor {
  path: string;
  generatedAt: number;
}

interface BlobRow {
  digest: string;
  size: number;
  path: string;
  generated_at: number;
}

export interface ManifestBlobInput extends ContentDescriptor {
  mediaType: string;
  kind: 'config' | 'layer';
  position: number;
}

export interface ManifestChildInput extends ContentDescriptor {
  mediaType: string;
  position: number;
}

export interface UploadRecord {
  id: string;
  repository: string;
  offset: number;
  temporaryPath: string;
  generatedAt: number;
  expiresAt: number;
}

interface UploadRow {
  id: string;
  repository: string;
  offset: number;
  temporary_path: string;
  generated_at: number;
  expires_at: number;
}

export interface ReferencedContent {
  manifests: Set<Digest>;
  blobs: Set<Digest>;
}

export class MetadataConflictError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'MetadataConflictError';
  }
}

const initialMigration = `
  CREATE TABLE IF NOT EXISTS migrations (
    version INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS namespaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    generated_at INTEGER NOT NULL,
    UNIQUE(owner_id, name)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    namespace_id TEXT,
    generated_at INTEGER NOT NULL,
    UNIQUE(owner_id, name),
    FOREIGN KEY(namespace_id) REFERENCES namespaces(id) ON DELETE SET NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS imagenes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL,
    project_id TEXT,
    visibility TEXT NOT NULL CHECK(visibility IN ('public', 'private')),
    latest TEXT NOT NULL DEFAULT '',
    generated_at INTEGER NOT NULL,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS manifests (
    digest TEXT PRIMARY KEY,
    media_type TEXT NOT NULL,
    size INTEGER NOT NULL CHECK(size >= 0),
    path TEXT NOT NULL,
    generated_at INTEGER NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS blobs (
    digest TEXT PRIMARY KEY,
    size INTEGER NOT NULL CHECK(size >= 0),
    path TEXT NOT NULL,
    generated_at INTEGER NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS imagene_manifests (
    imagene_id TEXT NOT NULL,
    manifest_digest TEXT NOT NULL,
    generated_at INTEGER NOT NULL,
    PRIMARY KEY(imagene_id, manifest_digest),
    FOREIGN KEY(imagene_id) REFERENCES imagenes(id) ON DELETE CASCADE,
    FOREIGN KEY(manifest_digest) REFERENCES manifests(digest) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS imagene_blobs (
    imagene_id TEXT NOT NULL,
    blob_digest TEXT NOT NULL,
    generated_at INTEGER NOT NULL,
    PRIMARY KEY(imagene_id, blob_digest),
    FOREIGN KEY(imagene_id) REFERENCES imagenes(id) ON DELETE CASCADE,
    FOREIGN KEY(blob_digest) REFERENCES blobs(digest) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    imagene_id TEXT NOT NULL,
    name TEXT NOT NULL,
    manifest_digest TEXT NOT NULL,
    size INTEGER NOT NULL CHECK(size >= 0),
    generated_at INTEGER NOT NULL,
    UNIQUE(imagene_id, name),
    FOREIGN KEY(imagene_id) REFERENCES imagenes(id) ON DELETE CASCADE,
    FOREIGN KEY(manifest_digest) REFERENCES manifests(digest) ON DELETE RESTRICT
  ) STRICT;

  CREATE TABLE IF NOT EXISTS manifest_blobs (
    manifest_digest TEXT NOT NULL,
    blob_digest TEXT NOT NULL,
    position INTEGER NOT NULL,
    kind TEXT NOT NULL CHECK(kind IN ('config', 'layer')),
    media_type TEXT NOT NULL,
    declared_size INTEGER NOT NULL CHECK(declared_size >= 0),
    PRIMARY KEY(manifest_digest, kind, position),
    FOREIGN KEY(manifest_digest) REFERENCES manifests(digest) ON DELETE CASCADE,
    FOREIGN KEY(blob_digest) REFERENCES blobs(digest) ON DELETE RESTRICT
  ) STRICT;

  CREATE TABLE IF NOT EXISTS manifest_children (
    parent_digest TEXT NOT NULL,
    child_digest TEXT NOT NULL,
    position INTEGER NOT NULL,
    media_type TEXT NOT NULL,
    declared_size INTEGER NOT NULL CHECK(declared_size >= 0),
    PRIMARY KEY(parent_digest, position),
    FOREIGN KEY(parent_digest) REFERENCES manifests(digest) ON DELETE CASCADE,
    FOREIGN KEY(child_digest) REFERENCES manifests(digest) ON DELETE RESTRICT
  ) STRICT;

  CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    repository TEXT NOT NULL,
    offset INTEGER NOT NULL CHECK(offset >= 0),
    temporary_path TEXT NOT NULL,
    generated_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  ) STRICT;

  CREATE INDEX IF NOT EXISTS idx_imagenes_visibility_name ON imagenes(visibility, name);
  CREATE INDEX IF NOT EXISTS idx_projects_namespace ON projects(namespace_id);
  CREATE INDEX IF NOT EXISTS idx_imagenes_project ON imagenes(project_id);
  CREATE INDEX IF NOT EXISTS idx_tags_manifest ON tags(manifest_digest);
  CREATE INDEX IF NOT EXISTS idx_imagene_blobs_blob ON imagene_blobs(blob_digest);
  CREATE INDEX IF NOT EXISTS idx_manifest_blobs_blob ON manifest_blobs(blob_digest);
  CREATE INDEX IF NOT EXISTS idx_manifest_children_child ON manifest_children(child_digest);
  CREATE INDEX IF NOT EXISTS idx_uploads_expiry ON uploads(expires_at);
`;

const namespaceFromRow = (row: NamespaceRow): Namespace => ({
  id: row.id,
  name: row.name,
  generatedAt: row.generated_at,
  generatedBy: row.owner_id,
});

const projectFromRow = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  generatedAt: row.generated_at,
  generatedBy: row.owner_id,
  namespaceID: row.namespace_id,
});

const tagFromRow = (row: TagRow): ImageneTag => ({
  id: row.id,
  generatedAt: row.generated_at,
  name: row.name,
  size: row.size,
  digest: row.manifest_digest,
});

export class MetadataRepository {
  readonly #database: DatabaseSync;
  readonly #clock: () => number;

  private constructor(database: DatabaseSync, clock: () => number) {
    this.#database = database;
    this.#clock = clock;
  }

  public static async open(
    dataRoot: string,
    options: { clock?: () => number; readOnly?: boolean } = {},
  ): Promise<MetadataRepository> {
    const versionRoot = join(dataRoot, 'v2');
    await mkdir(versionRoot, { recursive: true });
    const database = new DatabaseSync(join(versionRoot, 'metadata.sqlite'), {
      enableForeignKeyConstraints: true,
      readOnly: options.readOnly ?? false,
      timeout: 5_000,
    });
    const repository = new MetadataRepository(database, options.clock ?? Date.now);
    if (!(options.readOnly ?? false)) repository.#migrate();
    return repository;
  }

  public close(): void {
    this.#database.close();
  }

  public createNamespace(name: string, ownerID: string): Namespace {
    const namespace: Namespace = {
      id: randomUUID(),
      name,
      generatedAt: this.#clock(),
      generatedBy: ownerID,
    };
    this.#run(
      'INSERT INTO namespaces (id, name, owner_id, generated_at) VALUES (?, ?, ?, ?)',
      namespace.id,
      namespace.name,
      namespace.generatedBy,
      namespace.generatedAt,
    );
    return namespace;
  }

  public importNamespace(namespace: Namespace): Namespace {
    this.#run(
      `INSERT INTO namespaces (id, name, owner_id, generated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, owner_id = excluded.owner_id,
         generated_at = excluded.generated_at`,
      namespace.id,
      namespace.name,
      namespace.generatedBy,
      namespace.generatedAt,
    );
    return namespace;
  }

  public listNamespaces(ownerID?: string): Namespace[] {
    const rows = ownerID
      ? this.#all<NamespaceRow>(
          'SELECT id, name, owner_id, generated_at FROM namespaces WHERE owner_id = ? ORDER BY name',
          ownerID,
        )
      : this.#all<NamespaceRow>(
          'SELECT id, name, owner_id, generated_at FROM namespaces ORDER BY name',
        );
    return rows.map(namespaceFromRow);
  }

  public deleteNamespace(id: string): boolean {
    return this.#run('DELETE FROM namespaces WHERE id = ?', id).changes > 0;
  }

  public createProject(name: string, ownerID: string, namespaceID: string | null = null): Project {
    const project: Project = {
      id: randomUUID(),
      name,
      generatedAt: this.#clock(),
      generatedBy: ownerID,
      namespaceID,
    };
    this.#run(
      'INSERT INTO projects (id, name, owner_id, namespace_id, generated_at) VALUES (?, ?, ?, ?, ?)',
      project.id,
      project.name,
      project.generatedBy,
      project.namespaceID,
      project.generatedAt,
    );
    return project;
  }

  public importProject(project: Project): Project {
    this.#run(
      `INSERT INTO projects (id, name, owner_id, namespace_id, generated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, owner_id = excluded.owner_id,
         namespace_id = excluded.namespace_id, generated_at = excluded.generated_at`,
      project.id,
      project.name,
      project.generatedBy,
      project.namespaceID,
      project.generatedAt,
    );
    return project;
  }

  public getProject(id: string): Project | undefined {
    const row = this.#get<ProjectRow>(
      'SELECT id, name, owner_id, namespace_id, generated_at FROM projects WHERE id = ?',
      id,
    );
    return row ? projectFromRow(row) : undefined;
  }

  public listProjects(ownerID?: string): Project[] {
    const rows = ownerID
      ? this.#all<ProjectRow>(
          'SELECT id, name, owner_id, namespace_id, generated_at FROM projects WHERE owner_id = ? ORDER BY name',
          ownerID,
        )
      : this.#all<ProjectRow>(
          'SELECT id, name, owner_id, namespace_id, generated_at FROM projects ORDER BY name',
        );
    return rows.map(projectFromRow);
  }

  public setProjectNamespace(projectID: string, namespaceID: string | null): Project | undefined {
    this.#run('UPDATE projects SET namespace_id = ? WHERE id = ?', namespaceID, projectID);
    return this.getProject(projectID);
  }

  public deleteProject(id: string): boolean {
    return this.#run('DELETE FROM projects WHERE id = ?', id).changes > 0;
  }

  public ensureImagene(name: string, ownerID: string, projectID: string | null = null): Imagene {
    const existing = this.getImageneByName(name);
    if (existing) return existing;
    const id = randomUUID();
    const generatedAt = this.#clock();
    this.#run(
      `INSERT INTO imagenes
        (id, name, owner_id, project_id, visibility, latest, generated_at)
       VALUES (?, ?, ?, ?, 'private', '', ?)`,
      id,
      name,
      ownerID,
      projectID,
      generatedAt,
    );
    return {
      id,
      name,
      generatedAt,
      latest: '',
      tags: [],
      isPublic: false,
      projectID,
    };
  }

  public importImagene(imagene: Imagene, ownerID = 'owner'): Imagene {
    this.#run(
      `INSERT INTO imagenes
        (id, name, owner_id, project_id, visibility, latest, generated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, owner_id = excluded.owner_id,
         project_id = excluded.project_id, visibility = excluded.visibility,
         latest = excluded.latest, generated_at = excluded.generated_at`,
      imagene.id,
      imagene.name,
      ownerID,
      imagene.projectID,
      imagene.isPublic ? 'public' : 'private',
      imagene.latest,
      imagene.generatedAt,
    );
    return this.getImageneByID(imagene.id) ?? imagene;
  }

  public getImageneByID(id: string): Imagene | undefined {
    const row = this.#get<ImageneRow>(
      `SELECT id, name, owner_id, project_id, visibility, latest, generated_at
       FROM imagenes WHERE id = ?`,
      id,
    );
    return row ? this.#imageneFromRow(row) : undefined;
  }

  public getImageneByName(name: string): Imagene | undefined {
    const row = this.#get<ImageneRow>(
      `SELECT id, name, owner_id, project_id, visibility, latest, generated_at
       FROM imagenes WHERE name = ?`,
      name,
    );
    return row ? this.#imageneFromRow(row) : undefined;
  }

  public listImagenes(options: { ownerID?: string; publicOnly?: boolean } = {}): Imagene[] {
    const predicates: string[] = [];
    const parameters: string[] = [];
    if (options.ownerID) {
      predicates.push('owner_id = ?');
      parameters.push(options.ownerID);
    }
    if (options.publicOnly) predicates.push("visibility = 'public'");
    const where = predicates.length ? ` WHERE ${predicates.join(' AND ')}` : '';
    return this.#all<ImageneRow>(
      `SELECT id, name, owner_id, project_id, visibility, latest, generated_at
       FROM imagenes${where} ORDER BY name`,
      ...parameters,
    ).map((row) => this.#imageneFromRow(row));
  }

  public setImageneProject(imageneID: string, projectID: string | null): Imagene | undefined {
    this.#run('UPDATE imagenes SET project_id = ? WHERE id = ?', projectID, imageneID);
    return this.getImageneByID(imageneID);
  }

  public setImagenePublic(imageneID: string, isPublic: boolean): Imagene | undefined {
    this.#run(
      'UPDATE imagenes SET visibility = ? WHERE id = ?',
      isPublic ? 'public' : 'private',
      imageneID,
    );
    return this.getImageneByID(imageneID);
  }

  public deleteImagene(id: string): boolean {
    return this.#run('DELETE FROM imagenes WHERE id = ?', id).changes > 0;
  }

  public listCatalog(publicOnly: boolean): string[] {
    const rows = publicOnly
      ? this.#all<{ name: string }>(
          "SELECT name FROM imagenes WHERE visibility = 'public' ORDER BY name",
        )
      : this.#all<{ name: string }>('SELECT name FROM imagenes ORDER BY name');
    return rows.map(({ name }) => name);
  }

  public recordBlob(record: BlobRecord): void {
    this.#run(
      `INSERT INTO blobs (digest, size, path, generated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(digest) DO UPDATE SET size = excluded.size, path = excluded.path`,
      record.digest,
      record.size,
      record.path,
      record.generatedAt,
    );
  }

  public getBlob(digest: string): BlobRecord | undefined {
    const row = this.#get<BlobRow>(
      'SELECT digest, size, path, generated_at FROM blobs WHERE digest = ?',
      asDigest(digest),
    );
    return row
      ? {
          digest: asDigest(row.digest),
          size: row.size,
          path: row.path,
          generatedAt: row.generated_at,
        }
      : undefined;
  }

  public linkBlob(repository: string, ownerID: string, digest: string): void {
    const imagene = this.ensureImagene(repository, ownerID);
    this.#run(
      `INSERT OR IGNORE INTO imagene_blobs (imagene_id, blob_digest, generated_at)
       VALUES (?, ?, ?)`,
      imagene.id,
      asDigest(digest),
      this.#clock(),
    );
  }

  public mountBlob(
    sourceRepository: string,
    targetRepository: string,
    ownerID: string,
    digest: string,
  ): boolean {
    if (!this.repositoryReferencesBlob(sourceRepository, digest)) return false;
    this.linkBlob(targetRepository, ownerID, digest);
    return true;
  }

  public publishManifest(input: {
    repository: string;
    ownerID: string;
    /** Tag names to point at this Manifest. Empty when it is published by digest alone. */
    references: readonly string[];
    manifest: ManifestRecord;
    blobs: ManifestBlobInput[];
    children?: ManifestChildInput[];
    projectID?: string | null;
  }): Imagene {
    return this.#transaction(() => {
      const imagene = this.ensureImagene(input.repository, input.ownerID, input.projectID ?? null);
      this.#run(
        `INSERT INTO manifests (digest, media_type, size, path, generated_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(digest) DO UPDATE SET media_type = excluded.media_type,
           size = excluded.size, path = excluded.path`,
        input.manifest.digest,
        input.manifest.mediaType,
        input.manifest.size,
        input.manifest.path,
        input.manifest.generatedAt,
      );
      this.#run(
        `INSERT OR IGNORE INTO imagene_manifests (imagene_id, manifest_digest, generated_at)
         VALUES (?, ?, ?)`,
        imagene.id,
        input.manifest.digest,
        input.manifest.generatedAt,
      );
      this.#run('DELETE FROM manifest_blobs WHERE manifest_digest = ?', input.manifest.digest);
      for (const blob of input.blobs) {
        this.#run(
          `INSERT INTO manifest_blobs
            (manifest_digest, blob_digest, position, kind, media_type, declared_size)
           VALUES (?, ?, ?, ?, ?, ?)`,
          input.manifest.digest,
          blob.digest,
          blob.position,
          blob.kind,
          blob.mediaType,
          blob.size,
        );
      }
      this.#run('DELETE FROM manifest_children WHERE parent_digest = ?', input.manifest.digest);
      for (const child of input.children ?? []) {
        this.#run(
          `INSERT INTO manifest_children
            (parent_digest, child_digest, position, media_type, declared_size)
           VALUES (?, ?, ?, ?, ?)`,
          input.manifest.digest,
          child.digest,
          child.position,
          child.mediaType,
          child.size,
        );
      }
      if (input.references.length > 0) {
        const layerSize = input.blobs
          .filter(({ kind }) => kind === 'layer')
          .reduce((total, blob) => total + blob.size, 0);
        for (const reference of input.references) {
          this.#run(
            `INSERT INTO tags (id, imagene_id, name, manifest_digest, size, generated_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(imagene_id, name) DO UPDATE SET
               manifest_digest = excluded.manifest_digest,
               size = excluded.size,
               generated_at = excluded.generated_at`,
            `${imagene.id}:${reference}`,
            imagene.id,
            reference,
            input.manifest.digest,
            layerSize,
            input.manifest.generatedAt,
          );
        }
        // `latest` has a single definition, shared with tag and Manifest deletion:
        // the most recently generated Tag of this Imagene.
        this.#refreshLatest(imagene.id);
      }
      const published = this.getImageneByID(imagene.id);
      if (!published) throw new MetadataConflictError('Published Imagene could not be read back.');
      return published;
    });
  }

  public getManifest(repository: string, reference: string): ManifestRecord | undefined {
    const row = reference.startsWith('sha256:')
      ? this.#get<ManifestRow>(
          `SELECT m.digest, m.media_type, m.size, m.path, m.generated_at
           FROM manifests m
           JOIN imagene_manifests im ON im.manifest_digest = m.digest
           JOIN imagenes i ON i.id = im.imagene_id
           WHERE i.name = ? AND m.digest = ?`,
          repository,
          asDigest(reference),
        )
      : this.#get<ManifestRow>(
          `SELECT m.digest, m.media_type, m.size, m.path, m.generated_at
           FROM manifests m
           JOIN tags t ON t.manifest_digest = m.digest
           JOIN imagenes i ON i.id = t.imagene_id
           WHERE i.name = ? AND t.name = ?`,
          repository,
          reference,
        );
    return row
      ? {
          digest: asDigest(row.digest),
          mediaType: row.media_type,
          size: row.size,
          path: row.path,
          generatedAt: row.generated_at,
        }
      : undefined;
  }

  public getManifestByDigest(digest: string): ManifestRecord | undefined {
    const row = this.#get<ManifestRow>(
      'SELECT digest, media_type, size, path, generated_at FROM manifests WHERE digest = ?',
      asDigest(digest),
    );
    return row
      ? {
          digest: asDigest(row.digest),
          mediaType: row.media_type,
          size: row.size,
          path: row.path,
          generatedAt: row.generated_at,
        }
      : undefined;
  }

  public repositoryReferencesManifest(repository: string, digest: string): boolean {
    return (
      this.#get<{ present: number }>(
        `SELECT 1 AS present
         FROM imagene_manifests im
         JOIN imagenes i ON i.id = im.imagene_id
         WHERE i.name = ? AND im.manifest_digest = ?
         LIMIT 1`,
        repository,
        asDigest(digest),
      ) !== undefined
    );
  }

  public repositoryReferencesBlob(repository: string, digest: string): boolean {
    const row = this.#get<{ present: number }>(
      `WITH RECURSIVE reachable(digest) AS (
         SELECT im.manifest_digest
         FROM imagene_manifests im
         JOIN imagenes i ON i.id = im.imagene_id
         WHERE i.name = ?
         UNION
         SELECT mc.child_digest
         FROM manifest_children mc
         JOIN reachable r ON r.digest = mc.parent_digest
       )
       SELECT 1 AS present FROM (
         SELECT ib.blob_digest AS digest
         FROM imagene_blobs ib
         JOIN imagenes i ON i.id = ib.imagene_id
         WHERE i.name = ?
         UNION
         SELECT mb.blob_digest AS digest
         FROM manifest_blobs mb
         JOIN reachable r ON r.digest = mb.manifest_digest
       ) referenced
       WHERE referenced.digest = ?
       LIMIT 1`,
      repository,
      repository,
      asDigest(digest),
    );
    return row !== undefined;
  }

  public deleteManifest(repository: string, digest: string): boolean {
    return this.#transaction(() => {
      const imagene = this.getImageneByName(repository);
      if (!imagene) return false;
      this.#run(
        'DELETE FROM tags WHERE imagene_id = ? AND manifest_digest = ?',
        imagene.id,
        asDigest(digest),
      );
      const changed = this.#run(
        'DELETE FROM imagene_manifests WHERE imagene_id = ? AND manifest_digest = ?',
        imagene.id,
        asDigest(digest),
      ).changes;
      this.#refreshLatest(imagene.id);
      return changed > 0;
    });
  }

  public deleteTag(imageneID: string, tagIDOrName: string): boolean {
    const changed = this.#run(
      'DELETE FROM tags WHERE imagene_id = ? AND (id = ? OR name = ?)',
      imageneID,
      tagIDOrName,
      tagIDOrName,
    ).changes;
    if (changed > 0) this.#refreshLatest(imageneID);
    return changed > 0;
  }

  public createUpload(record: UploadRecord): void {
    this.#run(
      `INSERT INTO uploads
        (id, repository, offset, temporary_path, generated_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      record.id,
      record.repository,
      record.offset,
      record.temporaryPath,
      record.generatedAt,
      record.expiresAt,
    );
  }

  public getUpload(id: string): UploadRecord | undefined {
    const row = this.#get<UploadRow>(
      `SELECT id, repository, offset, temporary_path, generated_at, expires_at
       FROM uploads WHERE id = ?`,
      id,
    );
    return row
      ? {
          id: row.id,
          repository: row.repository,
          offset: row.offset,
          temporaryPath: row.temporary_path,
          generatedAt: row.generated_at,
          expiresAt: row.expires_at,
        }
      : undefined;
  }

  public updateUploadOffset(id: string, offset: number): boolean {
    return this.#run('UPDATE uploads SET offset = ? WHERE id = ?', offset, id).changes > 0;
  }

  public deleteUpload(id: string): boolean {
    return this.#run('DELETE FROM uploads WHERE id = ?', id).changes > 0;
  }

  public expiredUploads(now = this.#clock()): UploadRecord[] {
    return this.#all<UploadRow>(
      `SELECT id, repository, offset, temporary_path, generated_at, expires_at
       FROM uploads WHERE expires_at <= ? ORDER BY expires_at`,
      now,
    ).map((row) => ({
      id: row.id,
      repository: row.repository,
      offset: row.offset,
      temporaryPath: row.temporary_path,
      generatedAt: row.generated_at,
      expiresAt: row.expires_at,
    }));
  }

  public referencedContent(): ReferencedContent {
    const manifests = new Set(
      this.#all<{ digest: string }>(
        `WITH RECURSIVE reachable(digest) AS (
           SELECT manifest_digest FROM imagene_manifests
           UNION
           SELECT mc.child_digest
           FROM manifest_children mc
           JOIN reachable r ON r.digest = mc.parent_digest
         )
         SELECT DISTINCT digest FROM reachable`,
      ).map(({ digest }) => asDigest(digest)),
    );
    const blobs = new Set(
      this.#all<{ digest: string }>(
        `WITH RECURSIVE reachable(digest) AS (
           SELECT manifest_digest FROM imagene_manifests
           UNION
           SELECT mc.child_digest
           FROM manifest_children mc
           JOIN reachable r ON r.digest = mc.parent_digest
         )
         SELECT blob_digest AS digest FROM imagene_blobs
         UNION
         SELECT mb.blob_digest AS digest
         FROM manifest_blobs mb
         JOIN reachable r ON r.digest = mb.manifest_digest`,
      ).map(({ digest }) => asDigest(digest)),
    );
    return { manifests, blobs };
  }

  public deleteBlobRecord(digest: string): boolean {
    return this.#run('DELETE FROM blobs WHERE digest = ?', asDigest(digest)).changes > 0;
  }

  public unlinkBlob(repository: string, digest: string): boolean {
    return (
      this.#run(
        `DELETE FROM imagene_blobs
         WHERE imagene_id = (SELECT id FROM imagenes WHERE name = ?) AND blob_digest = ?`,
        repository,
        asDigest(digest),
      ).changes > 0
    );
  }

  public blobHasManifestReferences(digest: string): boolean {
    return (
      this.#get<{ present: number }>(
        'SELECT 1 AS present FROM manifest_blobs WHERE blob_digest = ? LIMIT 1',
        asDigest(digest),
      ) !== undefined
    );
  }

  public deleteManifestRecord(digest: string): boolean {
    return this.#run('DELETE FROM manifests WHERE digest = ?', asDigest(digest)).changes > 0;
  }

  public owner(ownerID: string, publicOnly = false): Owner {
    return {
      id: ownerID,
      namespaces: publicOnly ? [] : this.listNamespaces(ownerID),
      projects: publicOnly ? [] : this.listProjects(ownerID),
      imagenes: this.listImagenes(publicOnly ? { publicOnly: true } : { ownerID }),
    };
  }

  public integrityCheck(): string[] {
    return this.#all<{ integrity_check: string }>('PRAGMA integrity_check').map(
      ({ integrity_check }) => integrity_check,
    );
  }

  public foreignKeyViolations(): Record<string, unknown>[] {
    return this.#all<Record<string, unknown>>('PRAGMA foreign_key_check');
  }

  public migrationVersions(): number[] {
    return this.#all<{ version: number }>('SELECT version FROM migrations ORDER BY version').map(
      ({ version }) => version,
    );
  }

  #migrate(): void {
    this.#database.exec(
      'PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL; PRAGMA foreign_keys = ON;',
    );
    this.#database.exec('BEGIN IMMEDIATE');
    try {
      this.#database.exec(initialMigration);
      this.#run(
        'INSERT OR IGNORE INTO migrations (version, applied_at) VALUES (?, ?)',
        1,
        this.#clock(),
      );
      this.#database.exec('COMMIT');
    } catch (error) {
      this.#database.exec('ROLLBACK');
      throw error;
    }
  }

  #imageneFromRow(row: ImageneRow): Imagene {
    const tags = this.#all<TagRow>(
      `SELECT id, imagene_id, name, manifest_digest, size, generated_at
       FROM tags WHERE imagene_id = ? ORDER BY name`,
      row.id,
    ).map(tagFromRow);
    return {
      id: row.id,
      name: row.name,
      generatedAt: row.generated_at,
      latest: row.latest,
      tags,
      isPublic: row.visibility === 'public',
      projectID: row.project_id,
    };
  }

  #refreshLatest(imageneID: string): void {
    const latest = this.#get<{ name: string }>(
      'SELECT name FROM tags WHERE imagene_id = ? ORDER BY generated_at DESC, name LIMIT 1',
      imageneID,
    );
    this.#run('UPDATE imagenes SET latest = ? WHERE id = ?', latest?.name ?? '', imageneID);
  }

  #transaction<T>(operation: () => T): T {
    this.#database.exec('BEGIN IMMEDIATE');
    try {
      const result = operation();
      this.#database.exec('COMMIT');
      return result;
    } catch (error) {
      this.#database.exec('ROLLBACK');
      throw error;
    }
  }

  #prepare(sql: string): StatementSync {
    return this.#database.prepare(sql);
  }

  #run(sql: string, ...parameters: (string | number | null)[]): { changes: number | bigint } {
    return this.#prepare(sql).run(...parameters);
  }

  #get<T>(sql: string, ...parameters: (string | number | null)[]): T | undefined {
    return this.#prepare(sql).get(...parameters) as T | undefined;
  }

  #all<T>(sql: string, ...parameters: (string | number | null)[]): T[] {
    return this.#prepare(sql).all(...parameters) as T[];
  }
}
