import { describe, expect, it } from 'vitest';

import { BuiltInAccessPolicy } from './built-in-policy';
import { TokenIssuer } from './token-issuer';

describe('BuiltInAccessPolicy', () => {
  it('allows anonymous public pulls while protecting private data and every write', async () => {
    const policy = new BuiltInAccessPolicy({
      mode: 'public',
      owner: { identonym: 'owner', key: 'a-secret-owner-key' },
      tokenIssuer: new TokenIssuer({
        secret: 'a-secure-test-secret-with-at-least-32-bytes',
        audience: 'registry.test',
        ttlSeconds: 300,
      }),
    });

    await expect(
      policy.authorize({
        principal: null,
        action: 'pull',
        repository: 'team/public',
        isPublic: true,
      }),
    ).resolves.toBe(true);
    await expect(
      policy.authorize({
        principal: null,
        action: 'pull',
        repository: 'team/private',
        isPublic: false,
      }),
    ).resolves.toBe(false);
    await expect(
      policy.authorize({
        principal: null,
        action: 'push',
        repository: 'team/public',
        isPublic: true,
      }),
    ).resolves.toBe(false);

    const owner = await policy.authenticate({
      requestID: 'request',
      authorization: `Basic ${Buffer.from('owner:a-secret-owner-key').toString('base64')}`,
    });
    await expect(
      policy.authorize({ principal: owner, action: 'push', repository: 'team/private' }),
    ).resolves.toBe(true);
  });
});
