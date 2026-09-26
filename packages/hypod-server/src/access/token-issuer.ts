import { createHmac, timingSafeEqual } from 'node:crypto';

import type { RegistryAction, RequestedAccess } from './types';

export type TokenAccessClaim = RequestedAccess;

export interface TokenClaims {
  sub: string;
  aud: string;
  iat: number;
  nbf: number;
  exp: number;
  access: TokenAccessClaim[];
}

export class TokenVerificationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'TokenVerificationError';
  }
}

export interface TokenIssuerOptions {
  secret: string;
  audience: string;
  ttlSeconds: number;
  clock?: () => number;
}

const header = { alg: 'HS256', typ: 'JWT' } as const;
const actionValues = new Set<RegistryAction>(['catalog', 'pull', 'push', 'delete', 'manage']);

const encode = (value: unknown): string => Buffer.from(JSON.stringify(value)).toString('base64url');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseAccess = (value: unknown): TokenAccessClaim[] => {
  if (!Array.isArray(value)) throw new TokenVerificationError('Token access claim is invalid.');
  return value.map((item) => {
    if (!isRecord(item)) throw new TokenVerificationError('Token scope is invalid.');
    const { type, name, actions } = item;
    if ((type !== 'repository' && type !== 'registry') || typeof name !== 'string') {
      throw new TokenVerificationError('Token scope target is invalid.');
    }
    if (
      !Array.isArray(actions) ||
      !actions.every((action) => actionValues.has(action as RegistryAction))
    ) {
      throw new TokenVerificationError('Token scope actions are invalid.');
    }
    return { type, name, actions: actions as RegistryAction[] };
  });
};

export class TokenIssuer {
  readonly #secret: Buffer;
  readonly #audience: string;
  readonly #ttlSeconds: number;
  readonly #clock: () => number;

  public constructor(options: TokenIssuerOptions) {
    this.#secret = Buffer.from(options.secret, 'utf8');
    if (this.#secret.byteLength < 32) {
      throw new Error('Token secret must contain at least 32 UTF-8 bytes.');
    }
    if (!options.audience) throw new Error('Token audience is required.');
    if (!Number.isSafeInteger(options.ttlSeconds) || options.ttlSeconds <= 0) {
      throw new Error('Token TTL must be a positive integer.');
    }
    this.#audience = options.audience;
    this.#ttlSeconds = options.ttlSeconds;
    this.#clock = options.clock ?? Date.now;
  }

  public issue(subject: string, access: TokenAccessClaim[]): string {
    if (!subject) throw new Error('Token subject is required.');
    const now = Math.floor(this.#clock() / 1_000);
    const claims: TokenClaims = {
      sub: subject,
      aud: this.#audience,
      iat: now,
      nbf: now,
      exp: now + this.#ttlSeconds,
      access,
    };
    const unsigned = `${encode(header)}.${encode(claims)}`;
    return `${unsigned}.${this.#sign(unsigned).toString('base64url')}`;
  }

  public verify(token: string): TokenClaims {
    const parts = token.split('.');
    if (parts.length !== 3) throw new TokenVerificationError('Token format is invalid.');
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new TokenVerificationError('Token format is invalid.');
    }
    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const expected = this.#sign(unsigned);
    let received: Buffer;
    try {
      received = Buffer.from(encodedSignature, 'base64url');
    } catch {
      throw new TokenVerificationError('Token signature is invalid.');
    }
    if (expected.byteLength !== received.byteLength || !timingSafeEqual(expected, received)) {
      throw new TokenVerificationError('Token signature is invalid.');
    }

    let parsedHeader: unknown;
    let payload: unknown;
    try {
      parsedHeader = JSON.parse(
        Buffer.from(encodedHeader, 'base64url').toString('utf8'),
      ) as unknown;
      payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as unknown;
    } catch {
      throw new TokenVerificationError('Token JSON is invalid.');
    }
    if (!isRecord(parsedHeader) || parsedHeader.alg !== 'HS256' || parsedHeader.typ !== 'JWT') {
      throw new TokenVerificationError('Token algorithm is invalid.');
    }
    if (!isRecord(payload)) throw new TokenVerificationError('Token claims are invalid.');
    const { sub, aud, iat, nbf, exp, access } = payload;
    if (
      typeof sub !== 'string' ||
      typeof aud !== 'string' ||
      typeof iat !== 'number' ||
      typeof nbf !== 'number' ||
      typeof exp !== 'number' ||
      !Number.isSafeInteger(iat) ||
      !Number.isSafeInteger(nbf) ||
      !Number.isSafeInteger(exp)
    ) {
      throw new TokenVerificationError('Token claims are invalid.');
    }
    if (aud !== this.#audience) throw new TokenVerificationError('Token audience is invalid.');
    const now = Math.floor(this.#clock() / 1_000);
    if (nbf > now) throw new TokenVerificationError('Token is not active yet.');
    if (exp <= now) throw new TokenVerificationError('Token has expired.');
    if (iat > now || exp <= iat) throw new TokenVerificationError('Token time claims are invalid.');
    return { sub, aud, iat, nbf, exp, access: parseAccess(access) };
  }

  public allows(claims: TokenClaims, action: RegistryAction, repository?: string): boolean {
    return claims.access.some((scope) => {
      if (!scope.actions.includes(action) && !scope.actions.includes('manage')) return false;
      if (scope.type === 'registry') return scope.name === '*' || scope.name === 'catalog';
      return repository !== undefined && (scope.name === repository || scope.name === '*');
    });
  }

  #sign(value: string): Buffer {
    return createHmac('sha256', this.#secret).update(value).digest();
  }
}
