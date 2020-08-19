// #region imports
    // #region external
    import {
        StorageTypeData,
        StorageTypeFilesystem,
        StorageTypeAmazon,
        StorageTypeGoogle,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const BASE_PATH_DATA = '/data/';
export const BASE_PATH_IMAGENES = '/imagenes/';
export const BASE_PATH_IMAGENES_MANIFEST = '/imagenes/manifest/';
export const BASE_PATH_IMAGENES_SHA256 = '/imagenes/sha256/';
export const BASE_PATH_BLOBS = '/blobs/';
export const BASE_PATH_METADATA = '/metadata/';
export const BASE_PATH_METADATA_NAMESPACES = '/metadata/namespaces/';
export const BASE_PATH_METADATA_PROJECTS = '/metadata/projects/';
export const BASE_PATH_METADATA_IMAGENES = '/metadata/imagenes/';


export const storageTypeFilesystem: StorageTypeFilesystem = 'filesystem';
export const storageTypeAmazon: StorageTypeAmazon = 'amazon';
export const storageTypeGoogle: StorageTypeGoogle = 'google';

export const storageType: StorageTypeData = {
    filesystem: storageTypeFilesystem,
    amazon: storageTypeAmazon,
    google: storageTypeGoogle,
};
// #endregion module
