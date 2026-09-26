import type { Imagene, Owner } from '@plurid/hypod-contracts';

import type {
  AccessPolicy,
  AuthenticationRequest,
  AuthorizationRequest,
  IssuedToken,
  Principal,
  TokenRequest,
} from './types';

export interface LegacyLogger {
  log(data: string, level?: number, error?: unknown): void;
}

export interface LegacyOwnerToken {
  token: string;
  expires_in: number;
  issued_at: Date | string;
}

export interface HypodLogic {
  getCurrentOwner(): Promise<Owner>;
  getOwnerImagenes(): Promise<Imagene[]>;
  getOwnerCatalog(): Promise<{ repositories: string[] }>;
  obliterateOwnerImagene(id: string): Promise<boolean>;
  obliterateOwnerImageneTag(id: string, tag: string): Promise<boolean>;
  checkOwnerCanPush(): Promise<boolean>;
  checkOwnerCanPull(): Promise<boolean>;
  checkOwnerToken(token: string): Promise<boolean>;
  getOwnerToken(identonym: string, key: string): Promise<LegacyOwnerToken>;
  logger: LegacyLogger;
}

const tokenFromRequest = (request: AuthenticationRequest): string | undefined => {
  if (request.authorization?.startsWith('Bearer ')) return request.authorization.slice(7).trim();
  if (!request.cookie) return undefined;
  for (const value of request.cookie.split(';')) {
    const [name, ...parts] = value.trim().split('=');
    if (name === 'hypod_token') return decodeURIComponent(parts.join('='));
  }
  return undefined;
};

const credentials = (authorization: string | undefined) => {
  if (!authorization?.startsWith('Basic ')) return undefined;
  try {
    const value = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
    const separator = value.indexOf(':');
    return separator > 0
      ? { identonym: value.slice(0, separator), key: value.slice(separator + 1) }
      : undefined;
  } catch {
    return undefined;
  }
};

export class LegacyHypodLogicAdapter implements AccessPolicy {
  public constructor(public readonly logic: HypodLogic) {}

  public async authenticate(request: AuthenticationRequest): Promise<Principal | null> {
    const token = tokenFromRequest(request);
    if (!token || !(await this.logic.checkOwnerToken(token))) return null;
    return { id: 'owner', kind: 'custom' };
  }

  public async authorize(request: AuthorizationRequest): Promise<boolean> {
    if (!request.principal) return false;
    // `manage` gates reading administrative data; writes are checked separately against
    // `push` and `delete`, so viewing the admin interface does not require push rights.
    if (request.action === 'pull' || request.action === 'catalog' || request.action === 'manage') {
      return this.logic.checkOwnerCanPull();
    }
    return this.logic.checkOwnerCanPush();
  }

  public async issueToken(request: TokenRequest): Promise<IssuedToken | undefined> {
    const owner = credentials(request.authorization);
    if (!owner) return undefined;
    const response = await this.logic.getOwnerToken(owner.identonym, owner.key);
    const issuedAt =
      response.issued_at instanceof Date
        ? response.issued_at.toISOString()
        : new Date(response.issued_at).toISOString();
    return {
      token: response.token,
      access_token: response.token,
      expires_in: response.expires_in,
      issued_at: issuedAt,
    };
  }
}
