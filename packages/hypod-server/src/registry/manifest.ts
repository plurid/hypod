import { asDigest, type Digest } from '../persistence/content-store';
import type { ManifestBlobInput, ManifestChildInput } from '../persistence/metadata-repository';
import { RegistryError } from './errors';

export const OCI_IMAGE_MANIFEST = 'application/vnd.oci.image.manifest.v1+json';
export const OCI_IMAGE_INDEX = 'application/vnd.oci.image.index.v1+json';
export const DOCKER_IMAGE_MANIFEST = 'application/vnd.docker.distribution.manifest.v2+json';
export const DOCKER_MANIFEST_LIST = 'application/vnd.docker.distribution.manifest.list.v2+json';

export const supportedManifestMediaTypes = [
  OCI_IMAGE_MANIFEST,
  OCI_IMAGE_INDEX,
  DOCKER_IMAGE_MANIFEST,
  DOCKER_MANIFEST_LIST,
] as const;

interface DescriptorObject {
  mediaType: string;
  digest: Digest;
  size: number;
  external: boolean;
}

export interface ParsedManifest {
  mediaType: (typeof supportedManifestMediaTypes)[number];
  blobs: ManifestBlobInput[];
  children: ManifestChildInput[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const descriptor = (value: unknown, context: string): DescriptorObject => {
  if (!isRecord(value)) {
    throw new RegistryError('MANIFEST_INVALID', `${context} must be a descriptor.`, 400);
  }
  const { mediaType, digest, size, urls } = value;
  if (typeof mediaType !== 'string' || mediaType.length === 0) {
    throw new RegistryError('MANIFEST_INVALID', `${context}.mediaType must be a string.`, 400);
  }
  if (typeof digest !== 'string') {
    throw new RegistryError('MANIFEST_INVALID', `${context}.digest must be a string.`, 400);
  }
  let validDigest: Digest;
  try {
    validDigest = asDigest(digest);
  } catch {
    throw new RegistryError('DIGEST_INVALID', `${context}.digest is not a SHA-256 digest.`, 400);
  }
  if (typeof size !== 'number' || !Number.isSafeInteger(size) || size < 0) {
    throw new RegistryError(
      'MANIFEST_INVALID',
      `${context}.size must be a non-negative integer.`,
      400,
    );
  }
  if (
    urls !== undefined &&
    (!Array.isArray(urls) || !urls.every((url) => typeof url === 'string' && url.trim().length > 0))
  ) {
    throw new RegistryError(
      'MANIFEST_INVALID',
      `${context}.urls must be an array of non-empty strings.`,
      400,
    );
  }
  return {
    mediaType,
    digest: validDigest,
    size,
    external: Array.isArray(urls) && urls.length > 0,
  };
};

const contentDescriptor = ({ mediaType, digest, size }: DescriptorObject) => ({
  mediaType,
  digest,
  size,
});

const mediaTypeOf = (
  value: Record<string, unknown>,
  contentType?: string,
): ParsedManifest['mediaType'] => {
  const declared =
    typeof value.mediaType === 'string' ? value.mediaType : contentType?.split(';')[0]?.trim();
  if (!declared || !supportedManifestMediaTypes.includes(declared as ParsedManifest['mediaType'])) {
    throw new RegistryError('MANIFEST_INVALID', 'The Manifest media type is unsupported.', 400, {
      mediaType: declared,
    });
  }
  if (
    typeof value.mediaType === 'string' &&
    contentType &&
    contentType.split(';')[0]?.trim() !== value.mediaType
  ) {
    throw new RegistryError(
      'MANIFEST_INVALID',
      'Content-Type does not match Manifest mediaType.',
      400,
    );
  }
  return declared as ParsedManifest['mediaType'];
};

export const parseManifest = (bytes: Uint8Array, contentType?: string): ParsedManifest => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(bytes).toString('utf8')) as unknown;
  } catch {
    throw new RegistryError('MANIFEST_INVALID', 'Manifest body must be valid JSON.', 400);
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== 2) {
    throw new RegistryError('MANIFEST_INVALID', 'Manifest schemaVersion must be 2.', 400);
  }
  const mediaType = mediaTypeOf(parsed, contentType);
  const isIndex = mediaType === OCI_IMAGE_INDEX || mediaType === DOCKER_MANIFEST_LIST;
  if (isIndex) {
    if (!Array.isArray(parsed.manifests)) {
      throw new RegistryError('MANIFEST_INVALID', 'An image index must contain manifests.', 400);
    }
    return {
      mediaType,
      blobs: [],
      children: parsed.manifests.map((item, position) => ({
        ...contentDescriptor(descriptor(item, `manifests[${position}]`)),
        position,
      })),
    };
  }
  const configuration = descriptor(parsed.config, 'config');
  if (!Array.isArray(parsed.layers)) {
    throw new RegistryError('MANIFEST_INVALID', 'An image Manifest must contain layers.', 400);
  }
  const layers = parsed.layers.map((item, position) => ({
    descriptor: descriptor(item, `layers[${position}]`),
    position,
  }));
  return {
    mediaType,
    blobs: [
      { ...contentDescriptor(configuration), kind: 'config', position: 0 },
      ...layers
        .filter(({ descriptor: layer }) => !layer.external)
        .map(({ descriptor: layer, position }) => ({
          ...contentDescriptor(layer),
          kind: 'layer' as const,
          position,
        })),
    ],
    children: [],
  };
};

export const acceptsManifest = (accept: string | undefined, mediaType: string): boolean => {
  if (!accept || accept.trim() === '' || accept.includes('*/*')) return true;
  return accept
    .split(',')
    .map((part) => part.split(';')[0]?.trim())
    .includes(mediaType);
};
