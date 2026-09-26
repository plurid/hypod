export type PrincipalKind = 'owner' | 'custom';

export interface Principal {
  id: string;
  kind: PrincipalKind;
  displayName?: string;
}

export type RegistryAction = 'catalog' | 'pull' | 'push' | 'delete' | 'manage';

export interface AuthenticationRequest {
  authorization?: string;
  cookie?: string;
  requestID: string;
}

export interface AuthorizationRequest {
  principal: Principal | null;
  action: RegistryAction;
  repository?: string;
  isPublic?: boolean;
}

export interface RequestedAccess {
  type: 'repository' | 'registry';
  name: string;
  actions: RegistryAction[];
}

export interface TokenRequest {
  authorization?: string;
  service: string;
  access: RequestedAccess[];
}

export interface IssuedToken {
  token: string;
  access_token: string;
  expires_in: number;
  issued_at: string;
}

export interface AccessPolicy {
  authenticate(request: AuthenticationRequest): Promise<Principal | null>;
  authorize(request: AuthorizationRequest): Promise<boolean>;
  issueToken?(request: TokenRequest): Promise<IssuedToken | undefined> | IssuedToken | undefined;
}
