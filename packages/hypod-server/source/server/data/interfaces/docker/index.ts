// #region module
export type DockerEntityMatchType =
    | DockerEntityMatchName
    | DockerEntityMatchReference
    | DockerEntityMatchDigest
    | DockerEntityMatchUuid;

export type DockerEntityMatchName = 'name';
export type DockerEntityMatchReference = 'reference';
export type DockerEntityMatchDigest = 'digest';
export type DockerEntityMatchUuid = 'uuid';

export interface DockerEntityMatchTypeData {
    name: DockerEntityMatchName;
    reference: DockerEntityMatchReference;
    digest: DockerEntityMatchDigest;
    uuid: DockerEntityMatchUuid;
}


export interface DockerManifest {
    schemaVersion: number;
    mediaType: string;
    config: DockerManifestLayer;
    layers: DockerManifestLayer[];
}

export interface DockerManifestLayer {
    mediaType: string;
    size: number;
    digest: string;
}
// #endregion module
