import type { Imagene, Namespace, Project } from '@plurid/hypod-contracts';
import type { Readable } from 'node:stream';

import {
  ContentDigestMismatchError,
  ContentStore,
  InvalidDigestError,
  UploadLengthMismatchError,
  UploadOffsetMismatchError,
  asDigest,
  type ContentDescriptor,
  type Digest,
} from '../persistence/content-store';
import type {
  MetadataRepository,
  BlobRecord,
  ManifestRecord,
  UploadRecord,
} from '../persistence/metadata-repository';
import { RegistryError } from './errors';
import { acceptsManifest, parseManifest } from './manifest';

const repositoryPattern = /^[a-z0-9]+(?:(?:[._-]|\/[a-z0-9])[a-z0-9._-]*)*$/;
const tagPattern = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;

/**
 * Distribution requires a registry to return at most `n` entries, so a caller asking
 * for zero entries receives an empty page rather than the default page size.
 */
const pageSize = (count: number): number => Math.min(Math.max(count, 0), 1_000);

export interface RegistryManifest extends ManifestRecord {
  bytes: Buffer;
}

export interface RegistryBlob extends BlobRecord {
  bytes: Buffer;
}

export interface ByteRange {
  start: number;
  end: number;
}

export interface RegistryBlobStream extends BlobRecord {
  stream: Readable;
  range?: ByteRange;
}

export interface CatalogPage {
  repositories: string[];
  next?: string;
}

export interface TagsPage {
  name: string;
  tags: string[];
  next?: string;
}

export class Registry {
  readonly #clock: () => number;

  public constructor(
    public readonly metadata: MetadataRepository,
    public readonly content: ContentStore,
    options: { clock?: () => number; uploadTtlMilliseconds?: number } = {},
  ) {
    this.#clock = options.clock ?? Date.now;
    this.uploadTtlMilliseconds = options.uploadTtlMilliseconds ?? 24 * 60 * 60 * 1_000;
  }

  public readonly uploadTtlMilliseconds: number;

  public async putBlob(
    repository: string,
    bytes: Uint8Array,
    expectedDigest?: string,
    ownerID = 'owner',
  ): Promise<BlobRecord> {
    this.assertRepositoryName(repository);
    try {
      const descriptor = await this.content.putBlob(bytes, expectedDigest);
      const record: BlobRecord = {
        ...descriptor,
        path: this.content.pathFor('blobs', descriptor.digest),
        generatedAt: this.#clock(),
      };
      this.metadata.recordBlob(record);
      this.metadata.linkBlob(repository, ownerID, record.digest);
      return record;
    } catch (error) {
      if (error instanceof ContentDigestMismatchError || error instanceof InvalidDigestError) {
        throw new RegistryError('DIGEST_INVALID', error.message, 400);
      }
      throw error;
    }
  }

  public async beginUpload(repository: string): Promise<UploadRecord> {
    this.assertRepositoryName(repository);
    const id = ContentStore.newUploadID();
    await this.content.createUpload(id);
    const generatedAt = this.#clock();
    const record: UploadRecord = {
      id,
      repository,
      offset: 0,
      temporaryPath: `v2/uploads/${id}/data`,
      generatedAt,
      expiresAt: generatedAt + this.uploadTtlMilliseconds,
    };
    try {
      this.metadata.createUpload(record);
      return record;
    } catch (error) {
      await this.content.discardUpload(id);
      throw error;
    }
  }

  public async appendUpload(
    repository: string,
    uploadID: string,
    source: AsyncIterable<Uint8Array>,
    expectedOffset?: number,
    expectedLength?: number,
  ): Promise<UploadRecord> {
    const upload = this.#activeUpload(repository, uploadID);
    try {
      const offset = await this.content.appendUpload(
        uploadID,
        source,
        expectedOffset ?? upload.offset,
        expectedLength,
      );
      this.metadata.updateUploadOffset(uploadID, offset);
      return { ...upload, offset };
    } catch (error) {
      if (
        error instanceof UploadOffsetMismatchError ||
        error instanceof UploadLengthMismatchError
      ) {
        throw new RegistryError('BLOB_UPLOAD_INVALID', error.message, 416);
      }
      throw error;
    }
  }

  public async completeUpload(
    repository: string,
    uploadID: string,
    expectedDigest: string,
    source?: AsyncIterable<Uint8Array>,
    expectedOffset?: number,
    ownerID = 'owner',
    expectedLength?: number,
  ): Promise<BlobRecord> {
    let upload = this.#activeUpload(repository, uploadID);
    if (source) {
      upload = await this.appendUpload(
        repository,
        uploadID,
        source,
        expectedOffset,
        expectedLength,
      );
    }
    try {
      const descriptor = await this.content.promoteUpload(uploadID, expectedDigest);
      const record: BlobRecord = {
        ...descriptor,
        path: this.content.pathFor('blobs', descriptor.digest),
        generatedAt: this.#clock(),
      };
      this.metadata.recordBlob(record);
      this.metadata.linkBlob(repository, ownerID, record.digest);
      this.metadata.deleteUpload(upload.id);
      return record;
    } catch (error) {
      if (error instanceof ContentDigestMismatchError || error instanceof InvalidDigestError) {
        throw new RegistryError('DIGEST_INVALID', error.message, 400);
      }
      throw error;
    }
  }

  public async cancelUpload(repository: string, uploadID: string): Promise<void> {
    this.#activeUpload(repository, uploadID);
    await this.content.discardUpload(uploadID);
    this.metadata.deleteUpload(uploadID);
  }

  public upload(repository: string, uploadID: string): UploadRecord {
    return this.#activeUpload(repository, uploadID);
  }

  public async putManifest(
    repository: string,
    reference: string,
    bytes: Uint8Array,
    contentType?: string,
    ownerID = 'owner',
    additionalTags: readonly string[] = [],
  ): Promise<ManifestRecord> {
    this.assertRepositoryName(repository);
    this.assertReference(reference);
    for (const tag of additionalTags) {
      if (!tagPattern.test(tag)) {
        throw new RegistryError('TAG_INVALID', 'Manifest tag is invalid.', 400, { tag });
      }
    }
    // A digest reference names no tag of its own; a tag reference is one of the tags applied.
    const references = [
      ...new Set(reference.startsWith('sha256:') ? additionalTags : [reference, ...additionalTags]),
    ];
    const parsed = parseManifest(bytes, contentType);

    for (const blob of parsed.blobs) {
      const record = this.metadata.getBlob(blob.digest);
      if (
        !record ||
        !this.metadata.repositoryReferencesBlob(repository, blob.digest) ||
        !(await this.content.hasBlob(blob.digest)) ||
        record.size !== blob.size
      ) {
        throw new RegistryError(
          'MANIFEST_BLOB_UNKNOWN',
          `Manifest references a Blob unavailable to this repository: ${blob.digest}.`,
          400,
          { digest: blob.digest },
        );
      }
    }
    for (const child of parsed.children) {
      const record = this.metadata.getManifestByDigest(child.digest);
      if (
        !record ||
        !this.metadata.repositoryReferencesManifest(repository, child.digest) ||
        !(await this.content.hasManifest(child.digest)) ||
        record.size !== child.size
      ) {
        throw new RegistryError(
          'MANIFEST_BLOB_UNKNOWN',
          `Image index references a Manifest unavailable to this repository: ${child.digest}.`,
          400,
          { digest: child.digest },
        );
      }
    }

    let descriptor: ContentDescriptor;
    try {
      descriptor = await this.content.putManifest(
        bytes,
        reference.startsWith('sha256:') ? reference : undefined,
      );
    } catch (error) {
      if (error instanceof ContentDigestMismatchError || error instanceof InvalidDigestError) {
        throw new RegistryError('DIGEST_INVALID', error.message, 400);
      }
      throw error;
    }
    const manifest: ManifestRecord = {
      ...descriptor,
      mediaType: parsed.mediaType,
      path: this.content.pathFor('manifests', descriptor.digest),
      generatedAt: this.#clock(),
    };
    this.metadata.publishManifest({
      repository,
      ownerID,
      references,
      manifest,
      blobs: parsed.blobs,
      children: parsed.children,
    });
    return manifest;
  }

  public async getManifest(
    repository: string,
    reference: string,
    accept?: string,
  ): Promise<RegistryManifest> {
    this.assertRepositoryName(repository);
    this.assertReference(reference);
    const record = this.metadata.getManifest(repository, reference);
    if (!record || !(await this.content.hasManifest(record.digest))) {
      throw new RegistryError('MANIFEST_UNKNOWN', 'Manifest is unknown.', 404, { reference });
    }
    if (!acceptsManifest(accept, record.mediaType)) {
      throw new RegistryError(
        'MANIFEST_UNKNOWN',
        'No acceptable Manifest representation exists.',
        404,
        {
          reference,
        },
      );
    }
    return { ...record, bytes: await this.content.readManifest(record.digest) };
  }

  public async deleteManifest(repository: string, reference: string): Promise<boolean> {
    this.assertRepositoryName(repository);
    this.assertReference(reference);
    if (!reference.startsWith('sha256:')) {
      // Deleting by tag removes only that reference; the Manifest stays addressable by digest.
      const imagene = this.metadata.getImageneByName(repository);
      if (!imagene) {
        throw new RegistryError('NAME_UNKNOWN', 'Repository is unknown to this registry.', 404, {
          name: repository,
        });
      }
      if (!this.metadata.deleteTag(imagene.id, reference)) {
        throw new RegistryError('MANIFEST_UNKNOWN', 'Manifest tag is unknown.', 404, { reference });
      }
      return true;
    }
    const changed = this.metadata.deleteManifest(repository, asDigest(reference));
    if (!changed) throw new RegistryError('MANIFEST_UNKNOWN', 'Manifest is unknown.', 404);
    return true;
  }

  public async getBlob(repository: string, digest: string): Promise<RegistryBlob> {
    const record = await this.#blobRecord(repository, digest);
    return { ...record, bytes: await this.content.readBlob(record.digest) };
  }

  public async openBlob(
    repository: string,
    digest: string,
    range?: ByteRange,
  ): Promise<RegistryBlobStream> {
    const record = await this.#blobRecord(repository, digest);
    return {
      ...record,
      stream: this.content.createBlobReadStream(record.digest, range),
      ...(range ? { range } : {}),
    };
  }

  /**
   * Resolves Blob metadata without opening the stored bytes, so that a HEAD request
   * never holds a file descriptor for a body it does not send.
   */
  public async describeBlob(repository: string, digest: string): Promise<BlobRecord> {
    return this.#blobRecord(repository, digest);
  }

  async #blobRecord(repository: string, digest: string): Promise<BlobRecord> {
    this.assertRepositoryName(repository);
    let validDigest: Digest;
    try {
      validDigest = asDigest(digest);
    } catch {
      throw new RegistryError('DIGEST_INVALID', 'Blob digest is invalid.', 400);
    }
    const record = this.metadata.getBlob(validDigest);
    if (
      !record ||
      !this.metadata.repositoryReferencesBlob(repository, validDigest) ||
      !(await this.content.hasBlob(validDigest))
    ) {
      throw new RegistryError('BLOB_UNKNOWN', 'Blob is unknown to this repository.', 404, {
        digest: validDigest,
      });
    }
    return record;
  }

  public hasBlobForPush(digest: string): boolean {
    try {
      return this.metadata.getBlob(asDigest(digest)) !== undefined;
    } catch {
      return false;
    }
  }

  public async mountBlob(
    sourceRepository: string,
    targetRepository: string,
    digest: string,
    ownerID = 'owner',
  ): Promise<boolean> {
    this.assertRepositoryName(sourceRepository);
    this.assertRepositoryName(targetRepository);
    let validDigest: Digest;
    try {
      validDigest = asDigest(digest);
    } catch {
      throw new RegistryError('DIGEST_INVALID', 'Mounted Blob digest is invalid.', 400);
    }
    if (!(await this.content.hasBlob(validDigest))) return false;
    return this.metadata.mountBlob(sourceRepository, targetRepository, ownerID, validDigest);
  }

  public async deleteBlob(repository: string, digest: string): Promise<boolean> {
    this.assertRepositoryName(repository);
    const validDigest = asDigest(digest);
    if (!this.metadata.unlinkBlob(repository, validDigest)) {
      throw new RegistryError('BLOB_UNKNOWN', 'Blob is unknown to this repository.', 404);
    }
    if (!this.metadata.blobHasManifestReferences(validDigest)) {
      const stillReferenced = this.metadata
        .listCatalog(false)
        .some((name) => this.metadata.repositoryReferencesBlob(name, validDigest));
      if (!stillReferenced) {
        this.metadata.deleteBlobRecord(validDigest);
        await this.content.delete('blobs', validDigest);
      }
    }
    return true;
  }

  public catalog(publicOnly: boolean, count = 100, after?: string): CatalogPage {
    const all = this.metadata.listCatalog(publicOnly);
    const start = after ? all.findIndex((name) => name > after) : 0;
    const normalizedStart = start < 0 ? all.length : start;
    const repositories = all.slice(normalizedStart, normalizedStart + pageSize(count));
    const next = all[normalizedStart + repositories.length];
    return {
      repositories,
      ...(next !== undefined && repositories.at(-1) !== undefined
        ? { next: repositories.at(-1) as string }
        : {}),
    };
  }

  public tags(repository: string, count = 100, after?: string): TagsPage {
    this.assertRepositoryName(repository);
    const imagene = this.metadata.getImageneByName(repository);
    if (!imagene) {
      throw new RegistryError('NAME_UNKNOWN', 'Repository is unknown to this registry.', 404, {
        name: repository,
      });
    }
    const all = imagene.tags.map(({ name }) => name).sort();
    const start = after ? all.findIndex((name) => name > after) : 0;
    const normalizedStart = start < 0 ? all.length : start;
    const tags = all.slice(normalizedStart, normalizedStart + pageSize(count));
    const next = all[normalizedStart + tags.length];
    return {
      name: repository,
      tags,
      ...(next !== undefined && tags.at(-1) !== undefined ? { next: tags.at(-1) as string } : {}),
    };
  }

  public listImagenes(publicOnly: boolean): Imagene[] {
    return this.metadata.listImagenes(publicOnly ? { publicOnly: true } : {});
  }

  public identifyImagene(idOrName: string, publicOnly: boolean): Imagene | undefined {
    const imagene =
      this.metadata.getImageneByID(idOrName) ?? this.metadata.getImageneByName(idOrName);
    return imagene && (!publicOnly || imagene.isPublic) ? imagene : undefined;
  }

  public setImagenePublic(id: string, value: boolean): Imagene | undefined {
    return this.metadata.setImagenePublic(id, value);
  }

  public deleteImagene(id: string): boolean {
    return this.metadata.deleteImagene(id);
  }

  public deleteTag(imageneID: string, tagIDOrName: string): boolean {
    return this.metadata.deleteTag(imageneID, tagIDOrName);
  }

  public createNamespace(name: string, ownerID: string): Namespace {
    return this.metadata.createNamespace(name, ownerID);
  }

  public deleteNamespace(id: string): boolean {
    return this.metadata.deleteNamespace(id);
  }

  public createProject(name: string, ownerID: string, namespaceID: string | null = null): Project {
    return this.metadata.createProject(name, ownerID, namespaceID);
  }

  public deleteProject(id: string): boolean {
    return this.metadata.deleteProject(id);
  }

  public setProjectNamespace(projectID: string, namespaceID: string | null): Project | undefined {
    return this.metadata.setProjectNamespace(projectID, namespaceID);
  }

  public setImageneProject(imageneID: string, projectID: string | null): Imagene | undefined {
    return this.metadata.setImageneProject(imageneID, projectID);
  }

  public assertRepositoryName(repository: string): void {
    if (repository.length > 255 || !repositoryPattern.test(repository)) {
      throw new RegistryError('NAME_INVALID', 'Repository name is invalid.', 400, {
        name: repository,
      });
    }
  }

  public assertReference(reference: string): void {
    if (reference.startsWith('sha256:')) {
      try {
        asDigest(reference);
        return;
      } catch {
        throw new RegistryError('DIGEST_INVALID', 'Manifest digest is invalid.', 400);
      }
    }
    if (!tagPattern.test(reference)) {
      throw new RegistryError('TAG_INVALID', 'Manifest tag is invalid.', 400, { tag: reference });
    }
  }

  #activeUpload(repository: string, uploadID: string): UploadRecord {
    this.assertRepositoryName(repository);
    const upload = this.metadata.getUpload(uploadID);
    if (!upload || upload.repository !== repository || upload.expiresAt <= this.#clock()) {
      throw new RegistryError('BLOB_UPLOAD_UNKNOWN', 'Blob upload is unknown or expired.', 404, {
        uploadID,
      });
    }
    return upload;
  }
}
