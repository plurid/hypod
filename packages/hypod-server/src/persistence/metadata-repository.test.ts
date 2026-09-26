import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { MetadataRepository } from './metadata-repository';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('MetadataRepository relationships', () => {
  it('nulls optional child relationships without deleting the Imagene', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hypod-metadata-'));
    roots.push(root);
    const repository = await MetadataRepository.open(root);

    try {
      const namespace = repository.createNamespace('platform', 'owner');
      const project = repository.createProject('runtime', 'owner', namespace.id);
      const imagene = repository.ensureImagene('platform/runtime/app', 'owner', project.id);

      expect(repository.deleteNamespace(namespace.id)).toBe(true);
      expect(repository.getProject(project.id)?.namespaceID).toBeNull();
      expect(repository.deleteProject(project.id)).toBe(true);
      expect(repository.getImageneByID(imagene.id)?.projectID).toBeNull();
      expect(repository.getImageneByID(imagene.id)?.name).toBe('platform/runtime/app');
    } finally {
      repository.close();
    }
  });
});
