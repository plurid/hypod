import { buildSchema } from 'graphql';
import { describe, expect, it } from 'vitest';

import { typeDefs } from './schema';

describe('GraphQL compatibility contract', () => {
  it('preserves legacy operations and exposes nullable administrative relationships', () => {
    const schema = buildSchema(typeDefs);
    const query = schema.getQueryType()?.getFields();
    const mutation = schema.getMutationType()?.getFields();
    const project = schema.getType('Project');
    const imagene = schema.getType('Imagene');

    expect(query).toHaveProperty('getImagenes');
    expect(query).toHaveProperty('getCurrentOwner');
    expect(mutation).toHaveProperty('togglePublicImagene');
    expect(mutation).toHaveProperty('setProjectNamespace');
    expect(mutation).toHaveProperty('setImageneProject');
    expect(project?.toString()).toBe('Project');
    expect(imagene?.toString()).toBe('Imagene');
    expect(typeDefs).toContain('namespaceID: ID');
    expect(typeDefs).toContain('projectID: ID');
  });
});
