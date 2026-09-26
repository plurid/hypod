import { describe, expect, it } from 'vitest';

import { resolveConfig } from './config';

describe('resolveConfig', () => {
  it('reads the canonical network settings from the environment', () => {
    const config = resolveConfig(
      {},
      {
        HYPOD_HOST: '0.0.0.0',
        HYPOD_PORT: '56565',
        HYPOD_EXTERNAL_URL: 'https://registry.example.test',
        HYPOD_LOG_LEVEL: 'warn',
        HYPOD_SERVE_ADMIN: 'false',
      },
    );

    expect(config.host).toBe('0.0.0.0');
    expect(config.port).toBe(56_565);
    expect(config.externalUrl.href).toBe('https://registry.example.test/');
    expect(config.logLevel).toBe('warn');
    expect(config.serveAdmin).toBe(false);
  });

  it('prefers programmatic values, accepts legacy aliases, and never exposes secrets in warnings', () => {
    const config = resolveConfig(
      {
        mode: 'public',
        owner: { identonym: 'programmatic-owner', key: 'programmatic-key' },
        tokenSecret: 'programmatic-secret-with-enough-entropy',
      },
      {
        HYPOD_PRIVATE_USAGE: 'true',
        HYPOD_PRIVATE_OWNER_IDENTONYM: 'legacy-owner',
        HYPOD_PRIVATE_OWNER_KEY: 'legacy-key-that-must-not-leak',
        HYPOD_PRIVATE_TOKEN: 'legacy-token-that-must-not-leak',
      },
    );

    expect(config.mode).toBe('public');
    expect(config.owner?.identonym).toBe('programmatic-owner');
    expect(config.readOnly).toBe(false);
    expect(config.deprecations.join(' ')).toContain('HYPOD_PRIVATE_USAGE');
    expect(config.deprecations.join(' ')).not.toContain('legacy-key-that-must-not-leak');
    expect(config.deprecations.join(' ')).not.toContain('legacy-token-that-must-not-leak');
  });

  it('rejects token secrets that are too short for HMAC signing', () => {
    expect(() => resolveConfig({ tokenSecret: 'too-short' }, {})).toThrow(
      'Token secret must contain at least 32 UTF-8 bytes.',
    );
  });
});
