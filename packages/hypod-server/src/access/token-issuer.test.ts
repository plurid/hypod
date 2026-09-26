import { describe, expect, it } from 'vitest';

import { TokenIssuer, TokenVerificationError } from './token-issuer';

describe('TokenIssuer', () => {
  it('signs short-lived repository scopes and rejects tampering or expiry', () => {
    let now = 1_800_000_000_000;
    const issuer = new TokenIssuer({
      secret: 'a-secure-test-secret-with-at-least-32-bytes',
      audience: 'registry.example.test',
      ttlSeconds: 60,
      clock: () => now,
    });
    const token = issuer.issue('owner', [
      { type: 'repository', name: 'team/app', actions: ['pull'] },
    ]);

    const claims = issuer.verify(token);
    expect(claims.sub).toBe('owner');
    expect(claims.access[0]).toEqual({
      type: 'repository',
      name: 'team/app',
      actions: ['pull'],
    });

    expect(() => issuer.verify(`${token.slice(0, -1)}x`)).toThrow(TokenVerificationError);
    now += 61_000;
    expect(() => issuer.verify(token)).toThrow(TokenVerificationError);
  });
});
