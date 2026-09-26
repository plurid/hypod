import { createHash, timingSafeEqual } from 'node:crypto';

import type { HypodMode, OwnerCredentials } from '../config/config';
import {
  TokenVerificationError,
  type TokenAccessClaim,
  type TokenClaims,
  type TokenIssuer,
} from './token-issuer';
import type {
  AccessPolicy,
  AuthenticationRequest,
  AuthorizationRequest,
  IssuedToken,
  Principal,
  TokenRequest,
} from './types';

export type RegistryTokenResponse = IssuedToken;

export interface BuiltInAccessPolicyOptions {
  mode: Exclude<HypodMode, 'custom'>;
  owner?: OwnerCredentials;
  tokenIssuer?: TokenIssuer;
  tokenTtlSeconds?: number;
  ownerID?: string;
  clock?: () => number;
  /** Refuses every mutating action, including for an authenticated Owner. */
  readOnly?: boolean;
}

const writeActions = new Set<AuthorizationRequest['action']>(['push', 'delete']);

const safeEqual = (left: string, right: string): boolean => {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
};

const basicCredentials = (
  authorization: string,
): { identonym: string; key: string } | undefined => {
  if (!authorization.startsWith('Basic ')) return undefined;
  try {
    const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 1) return undefined;
    return { identonym: decoded.slice(0, separator), key: decoded.slice(separator + 1) };
  } catch {
    return undefined;
  }
};

const bearerFromCookie = (cookie: string | undefined): string | undefined => {
  if (!cookie) return undefined;
  for (const item of cookie.split(';')) {
    const [rawName, ...rawValue] = item.trim().split('=');
    if (rawName === 'hypod_token') return decodeURIComponent(rawValue.join('='));
  }
  return undefined;
};

export class BuiltInAccessPolicy implements AccessPolicy {
  readonly #mode: Exclude<HypodMode, 'custom'>;
  readonly #owner: OwnerCredentials | undefined;
  readonly #tokenIssuer: TokenIssuer | undefined;
  readonly #tokenTtlSeconds: number;
  readonly #ownerID: string;
  readonly #clock: () => number;
  readonly #readOnly: boolean;
  readonly #claims = new WeakMap<Principal, TokenClaims>();
  readonly #unscopedOwners = new WeakSet<Principal>();

  public constructor(options: BuiltInAccessPolicyOptions) {
    this.#mode = options.mode;
    this.#owner = options.owner;
    this.#tokenIssuer = options.tokenIssuer;
    this.#tokenTtlSeconds = options.tokenTtlSeconds ?? 900;
    this.#ownerID = options.ownerID ?? 'owner';
    this.#clock = options.clock ?? Date.now;
    this.#readOnly = options.readOnly ?? false;
  }

  public get readOnly(): boolean {
    return this.#readOnly;
  }

  public async authenticate(request: AuthenticationRequest): Promise<Principal | null> {
    const authorization = request.authorization;
    if (authorization) {
      const basic = basicCredentials(authorization);
      if (basic && this.authenticateCredentials(basic.identonym, basic.key)) {
        const principal: Principal = {
          id: this.#ownerID,
          kind: 'owner',
          displayName: basic.identonym,
        };
        this.#unscopedOwners.add(principal);
        return principal;
      }
    }

    const bearer = authorization?.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : bearerFromCookie(request.cookie);
    if (!bearer || !this.#tokenIssuer) return null;
    try {
      const claims = this.#tokenIssuer.verify(bearer);
      const principal: Principal = {
        id: claims.sub,
        kind: claims.sub === this.#ownerID ? 'owner' : 'custom',
      };
      this.#claims.set(principal, claims);
      return principal;
    } catch (error) {
      if (error instanceof TokenVerificationError) return null;
      throw error;
    }
  }

  public async authorize(request: AuthorizationRequest): Promise<boolean> {
    const { principal, action, repository, isPublic } = request;
    // A read-only Hypod refuses writes for every principal, so that the startup
    // warning and the configuration report describe what the registry actually does.
    if (this.#readOnly && writeActions.has(action)) return false;
    if (!principal) {
      if (this.#mode !== 'public') return false;
      if (action === 'catalog') return true;
      return action === 'pull' && isPublic === true;
    }
    if (principal.kind !== 'owner' || principal.id !== this.#ownerID) return false;
    if (this.#unscopedOwners.has(principal)) return true;
    const claims = this.#claims.get(principal);
    return claims ? (this.#tokenIssuer?.allows(claims, action, repository) ?? false) : false;
  }

  public authenticateCredentials(identonym: string, key: string): boolean {
    return Boolean(
      this.#owner && safeEqual(identonym, this.#owner.identonym) && safeEqual(key, this.#owner.key),
    );
  }

  public issueOwnerToken(
    identonym: string,
    key: string,
    access: TokenAccessClaim[],
  ): RegistryTokenResponse | undefined {
    if (!this.authenticateCredentials(identonym, key) || !this.#tokenIssuer) return undefined;
    const granted = this.#readOnly
      ? access.map((scope) => ({
          ...scope,
          actions: scope.actions.filter((action) => !writeActions.has(action)),
        }))
      : access;
    const token = this.#tokenIssuer.issue(this.#ownerID, granted);
    return {
      token,
      access_token: token,
      expires_in: this.#tokenTtlSeconds,
      issued_at: new Date(this.#clock()).toISOString(),
    };
  }

  public issueToken(request: TokenRequest): RegistryTokenResponse | undefined {
    const credentials = request.authorization ? basicCredentials(request.authorization) : undefined;
    if (!credentials) return undefined;
    return this.issueOwnerToken(credentials.identonym, credentials.key, request.access);
  }
}
