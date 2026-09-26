import { ContentStore, type Digest } from '../persistence/content-store';
import { DataRootLock } from '../persistence/data-root-lock';
import { MetadataRepository } from '../persistence/metadata-repository';

export interface GarbageCollectionOptions {
  dataRoot: string;
  dryRun: boolean;
  clock?: () => number;
}

export interface GarbageCollectionReport {
  dryRun: boolean;
  manifests: Digest[];
  blobs: Digest[];
  expiredUploads: string[];
  reclaimableBytes: number;
  deletedManifests: number;
  deletedBlobs: number;
  deletedUploads: number;
}

export const runGarbageCollection = async (
  options: GarbageCollectionOptions,
): Promise<GarbageCollectionReport> => {
  const lock = await DataRootLock.acquire(options.dataRoot);
  const metadata = await MetadataRepository.open(options.dataRoot);
  const content = new ContentStore(options.dataRoot);
  try {
    await content.initialize();
    const referenced = metadata.referencedContent();
    const allManifests = await content.list('manifests');
    const allBlobs = await content.list('blobs');
    const manifests = allManifests.filter(({ digest }) => !referenced.manifests.has(digest));
    const blobs = allBlobs.filter(({ digest }) => !referenced.blobs.has(digest));
    const expiredUploads = metadata.expiredUploads(options.clock?.() ?? Date.now());
    const report: GarbageCollectionReport = {
      dryRun: options.dryRun,
      manifests: manifests.map(({ digest }) => digest),
      blobs: blobs.map(({ digest }) => digest),
      expiredUploads: expiredUploads.map(({ id }) => id),
      reclaimableBytes:
        manifests.reduce((total, item) => total + item.size, 0) +
        blobs.reduce((total, item) => total + item.size, 0),
      deletedManifests: 0,
      deletedBlobs: 0,
      deletedUploads: 0,
    };
    if (options.dryRun) return report;

    const pending = new Set(manifests.map(({ digest }) => digest));
    while (pending.size > 0) {
      let progressed = false;
      for (const digest of [...pending]) {
        try {
          metadata.deleteManifestRecord(digest);
          await content.delete('manifests', digest);
          pending.delete(digest);
          report.deletedManifests += 1;
          progressed = true;
        } catch {
          // A parent Manifest may still refer to this child. Delete parents first.
        }
      }
      if (!progressed) {
        throw new Error(
          `Could not remove unreferenced Manifest records: ${[...pending].join(', ')}`,
        );
      }
    }

    for (const { digest } of blobs) {
      metadata.deleteBlobRecord(digest);
      await content.delete('blobs', digest);
      report.deletedBlobs += 1;
    }
    for (const upload of expiredUploads) {
      metadata.deleteUpload(upload.id);
      await content.discardUpload(upload.id);
      report.deletedUploads += 1;
    }
    return report;
  } finally {
    metadata.close();
    await lock.release();
  }
};
