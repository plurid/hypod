export interface ContractError {
  path: string;
  type: string;
  message: string;
}

export interface ContractResponse<T = undefined> {
  status: boolean;
  error?: ContractError | null;
  data?: T | null;
}

export interface Namespace {
  id: string;
  name: string;
  generatedAt: number;
  generatedBy: string;
}

export interface Project {
  id: string;
  name: string;
  generatedAt: number;
  generatedBy: string;
  namespaceID: string | null;
}

export interface ImageneTag {
  id: string;
  generatedAt: number;
  name: string;
  size: number;
  digest: string;
}

export interface Imagene {
  id: string;
  generatedAt: number;
  name: string;
  latest: string;
  tags: ImageneTag[];
  isPublic: boolean;
  projectID: string | null;
}

export interface Owner {
  id: string;
  namespaces: Namespace[];
  projects: Project[];
  imagenes: Imagene[];
}

export interface OwnerToken {
  token: string;
  access_token: string;
  expires_in: number;
  issued_at: string;
}

export interface InputValueString {
  value: string;
}

export interface InputLogin {
  identonym: string;
  key: string;
}

export interface InputSetProjectNamespace {
  projectID: string;
  namespaceID: string | null;
}

export interface InputSetImageneProject {
  imageneID: string;
  projectID: string | null;
}
