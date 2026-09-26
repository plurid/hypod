import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, mkdir, open, readFile, readdir, rename, rm, stat, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Readable } from 'node:stream';

export type Digest = `sha256:${string}`;
export type ContentKind = 'blobs' | 'manifests';

export interface ContentDescriptor {
  digest: Digest;
  size: number;
}

export class InvalidDigestError extends Error {
  public constructor(digest: string) {
    super(`Invalid SHA-256 digest: ${digest}`);
    this.name = 'InvalidDigestError';
  }
}

export class ContentDigestMismatchError extends Error {
  public constructor(
    public readonly expected: Digest,
    public readonly actual: Digest,
  ) {
    super(`Content digest mismatch: expected ${expected}, received ${actual}.`);
    this.name = 'ContentDigestMismatchError';
  }
}

export class UploadOffsetMismatchError extends Error {
  public constructor(
    public readonly expected: number,
    public readonly actual: number,
  ) {
    super(`Upload offset mismatch: expected ${expected}, current offset is ${actual}.`);
    this.name = 'UploadOffsetMismatchError';
  }
}

export class UploadLengthMismatchError extends Error {
  public constructor(
    public readonly expected: number,
    public readonly actual: number,
  ) {
    super(`Upload length mismatch: expected ${expected} bytes, received ${actual}.`);
    this.name = 'UploadLengthMismatchError';
  }
}

const digestPattern = /^sha256:([a-f0-9]{64})$/;
const safeUploadIDPattern = /^[A-Za-z0-9_-]{1,128}$/;

export const asDigest = (value: string): Digest => {
  if (!digestPattern.test(value)) throw new InvalidDigestError(value);
  return value as Digest;
};

export const digestBytes = (bytes: Uint8Array): Digest =>
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

const ensureUploadID = (uploadID: string): string => {
  if (!safeUploadIDPattern.test(uploadID)) throw new Error('Invalid upload identifier.');
  return uploadID;
};

const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const syncDirectory = async (path: string): Promise<void> => {
  try {
    const directory = await open(path, 'r');
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  } catch {
    // Some filesystems do not allow directory fsync. The file itself is still synced.
  }
};

export class ContentStore {
  readonly #versionRoot: string;
  readonly #uploadRoot: string;

  public constructor(public readonly dataRoot: string) {
    this.#versionRoot = join(dataRoot, 'v2');
    this.#uploadRoot = join(this.#versionRoot, 'uploads');
  }

  public async initialize(): Promise<void> {
    await Promise.all([
      mkdir(join(this.#versionRoot, 'blobs', 'sha256'), { recursive: true }),
      mkdir(join(this.#versionRoot, 'manifests', 'sha256'), { recursive: true }),
      mkdir(this.#uploadRoot, { recursive: true }),
      mkdir(join(this.#versionRoot, 'tmp'), { recursive: true }),
    ]);
  }

  public pathFor(kind: ContentKind, digest: Digest): string {
    const match = digestPattern.exec(digest);
    if (!match) throw new InvalidDigestError(digest);
    const hexadecimal = match[1];
    if (!hexadecimal) throw new InvalidDigestError(digest);
    return join(this.#versionRoot, kind, 'sha256', hexadecimal.slice(0, 2), hexadecimal, 'data');
  }

  public async putBlob(bytes: Uint8Array, expectedDigest?: string): Promise<ContentDescriptor> {
    return this.#put('blobs', bytes, expectedDigest);
  }

  public async putManifest(bytes: Uint8Array, expectedDigest?: string): Promise<ContentDescriptor> {
    return this.#put('manifests', bytes, expectedDigest);
  }

  async #put(
    kind: ContentKind,
    bytes: Uint8Array,
    expectedDigest?: string,
  ): Promise<ContentDescriptor> {
    const actual = digestBytes(bytes);
    if (expectedDigest !== undefined) {
      const expected = asDigest(expectedDigest);
      if (actual !== expected) throw new ContentDigestMismatchError(expected, actual);
    }
    await this.#writeAtomically(this.pathFor(kind, actual), bytes);
    return { digest: actual, size: bytes.byteLength };
  }

  public async hasBlob(digest: string): Promise<boolean> {
    return exists(this.pathFor('blobs', asDigest(digest)));
  }

  public async hasManifest(digest: string): Promise<boolean> {
    return exists(this.pathFor('manifests', asDigest(digest)));
  }

  public async readBlob(digest: string): Promise<Buffer> {
    return readFile(this.pathFor('blobs', asDigest(digest)));
  }

  public async readManifest(digest: string): Promise<Buffer> {
    return readFile(this.pathFor('manifests', asDigest(digest)));
  }

  public createBlobReadStream(digest: string, range?: { start: number; end: number }): Readable {
    const path = this.pathFor('blobs', asDigest(digest));
    return range ? createReadStream(path, range) : createReadStream(path);
  }

  public createManifestReadStream(digest: string): Readable {
    return createReadStream(this.pathFor('manifests', asDigest(digest)));
  }

  public async contentSize(kind: ContentKind, digest: string): Promise<number> {
    const details = await stat(this.pathFor(kind, asDigest(digest)));
    return details.size;
  }

  public async createUpload(uploadID: string): Promise<void> {
    const path = this.#uploadPath(ensureUploadID(uploadID));
    await mkdir(dirname(path), { recursive: true });
    const file = await open(path, 'wx', 0o600);
    await file.close();
  }

  public async appendUpload(
    uploadID: string,
    source: AsyncIterable<Uint8Array>,
    expectedOffset?: number,
    expectedLength?: number,
  ): Promise<number> {
    const path = this.#uploadPath(ensureUploadID(uploadID));
    const file = await open(path, 'r+');
    try {
      const details = await file.stat();
      if (expectedOffset !== undefined && details.size !== expectedOffset) {
        throw new UploadOffsetMismatchError(expectedOffset, details.size);
      }
      const originalSize = details.size;
      let offset = originalSize;
      try {
        for await (const rawChunk of source) {
          const chunk = Buffer.from(rawChunk);
          let written = 0;
          while (written < chunk.byteLength) {
            const result = await file.write(chunk, written, chunk.byteLength - written, offset);
            written += result.bytesWritten;
            offset += result.bytesWritten;
          }
          const appended = offset - originalSize;
          if (expectedLength !== undefined && appended > expectedLength) {
            throw new UploadLengthMismatchError(expectedLength, appended);
          }
        }
        const appended = offset - originalSize;
        if (expectedLength !== undefined && appended !== expectedLength) {
          throw new UploadLengthMismatchError(expectedLength, appended);
        }
        await file.sync();
        return offset;
      } catch (error) {
        await file.truncate(originalSize);
        await file.sync();
        throw error;
      }
    } finally {
      await file.close();
    }
  }

  public async uploadSize(uploadID: string): Promise<number> {
    return (await stat(this.#uploadPath(ensureUploadID(uploadID)))).size;
  }

  public async promoteUpload(uploadID: string, expectedDigest: string): Promise<ContentDescriptor> {
    const expected = asDigest(expectedDigest);
    const source = this.#uploadPath(ensureUploadID(uploadID));
    const hash = createHash('sha256');
    let size = 0;
    for await (const chunk of createReadStream(source) as AsyncIterable<Uint8Array>) {
      hash.update(chunk);
      size += chunk.byteLength;
    }
    const actual = asDigest(`sha256:${hash.digest('hex')}`);
    if (actual !== expected) throw new ContentDigestMismatchError(expected, actual);

    const destination = this.pathFor('blobs', actual);
    await mkdir(dirname(destination), { recursive: true });
    if (await exists(destination)) {
      await this.discardUpload(uploadID);
      return { digest: actual, size };
    }
    await rename(source, destination);
    await syncDirectory(dirname(destination));
    await rm(dirname(source), { recursive: true, force: true });
    return { digest: actual, size };
  }

  public async discardUpload(uploadID: string): Promise<void> {
    await rm(dirname(this.#uploadPath(ensureUploadID(uploadID))), { recursive: true, force: true });
  }

  public async delete(kind: ContentKind, digest: string): Promise<void> {
    const path = this.pathFor(kind, asDigest(digest));
    try {
      await unlink(path);
      await rm(dirname(path), { recursive: true, force: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  public async list(kind: ContentKind): Promise<ContentDescriptor[]> {
    const root = join(this.#versionRoot, kind, 'sha256');
    const prefixes = await readdir(root, { withFileTypes: true });
    const descriptors: ContentDescriptor[] = [];
    for (const prefix of prefixes) {
      if (!prefix.isDirectory()) continue;
      const digestDirectories = await readdir(join(root, prefix.name), { withFileTypes: true });
      for (const entry of digestDirectories) {
        if (!entry.isDirectory() || !/^[a-f0-9]{64}$/.test(entry.name)) continue;
        const digest = asDigest(`sha256:${entry.name}`);
        const path = this.pathFor(kind, digest);
        if (await exists(path)) descriptors.push({ digest, size: (await stat(path)).size });
      }
    }
    return descriptors;
  }

  async #writeAtomically(destination: string, bytes: Uint8Array): Promise<void> {
    if (await exists(destination)) return;
    const directory = dirname(destination);
    await mkdir(directory, { recursive: true });
    const temporary = join(directory, `.tmp-${randomUUID()}`);
    const file = await open(temporary, 'wx', 0o600);
    try {
      await file.writeFile(bytes);
      await file.sync();
    } finally {
      await file.close();
    }
    try {
      await rename(temporary, destination);
    } catch (error) {
      await rm(temporary, { force: true });
      if (!(await exists(destination))) throw error;
    }
    await syncDirectory(directory);
  }

  #uploadPath(uploadID: string): string {
    return join(this.#uploadRoot, uploadID, 'data');
  }

  public static newUploadID(): string {
    return randomUUID();
  }
}
