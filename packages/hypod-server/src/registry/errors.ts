export type RegistryErrorCode =
  | 'BLOB_UNKNOWN'
  | 'BLOB_UPLOAD_INVALID'
  | 'BLOB_UPLOAD_UNKNOWN'
  | 'DENIED'
  | 'DIGEST_INVALID'
  | 'MANIFEST_BLOB_UNKNOWN'
  | 'MANIFEST_INVALID'
  | 'MANIFEST_UNKNOWN'
  | 'NAME_INVALID'
  | 'NAME_UNKNOWN'
  | 'SIZE_INVALID'
  | 'TAG_INVALID'
  | 'UNAUTHORIZED'
  | 'UNSUPPORTED';

export class RegistryError extends Error {
  public constructor(
    public readonly code: RegistryErrorCode,
    message: string,
    public readonly status: number,
    public readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'RegistryError';
  }
}
