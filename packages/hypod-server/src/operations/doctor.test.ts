import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runDoctor } from './doctor';
import { ContentStore } from '../persistence/content-store';
import { MetadataRepository } from '../persistence/metadata-repository';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('doctor', () => {
  it('detects content whose bytes no longer match its digest', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-doctor-'));
    roots.push(root);
    const content = new ContentStore(root);
    await content.initialize();
    const metadata = await MetadataRepository.open(root);
    const blob = await content.putBlob(Buffer.from('healthy'));
    metadata.recordBlob({
      ...blob,
      path: content.pathFor('blobs', blob.digest),
      generatedAt: Date.now(),
    });
    metadata.linkBlob('team/app', 'owner', blob.digest);
    metadata.close();

    const healthy = await runDoctor({ dataRoot: root });
    expect(healthy.ok).toBe(true);
    expect(healthy.checks).toContainEqual(
      expect.objectContaining({ name: 'configuration', ok: true }),
    );

    const invalidConfiguration = await runDoctor({
      dataRoot: root,
      environment: { HYPOD_MODE: 'private' },
    });
    expect(invalidConfiguration.ok).toBe(false);
    expect(invalidConfiguration.checks).toContainEqual(
      expect.objectContaining({ name: 'configuration', ok: false }),
    );

    await writeFile(content.pathFor('blobs', blob.digest), Buffer.from('corrupt'));
    const report = await runDoctor({ dataRoot: root });

    expect(report.ok).toBe(false);
    expect(report.checks.some((check) => check.name === `blob:${blob.digest}` && !check.ok)).toBe(
      true,
    );
  });
});
