// #region imports
    // #region libraries
    import {
        Request,
        Response,
        Application,
    } from 'express';
    // #endregion libraries
// #endregion imports



// #region module
export interface Context {
    request: HypodRequest;
    response: Response;
    instance: Application;
    imagenes: Imagene[];
}


export type HypodRequest = Request & {
    hypodLogic: HypodLogic | undefined;
    rawBody: string | undefined;
}


export type StorageType =
    | StorageTypeFilesystem
    | StorageTypeAmazon
    | StorageTypeGoogle;

export type StorageTypeFilesystem = 'filesystem';
export type StorageTypeAmazon = 'amazon';
export type StorageTypeGoogle = 'google';

export interface StorageTypeData {
    filesystem: StorageTypeFilesystem;
    amazon: StorageTypeAmazon;
    google: StorageTypeGoogle;
}


export type DatabaseType =
    | DatabaseTypeFilesystem
    | DatabaseTypeAmazon
    | DatabaseTypeGoogle;

export type DatabaseTypeFilesystem = 'filesystem';
export type DatabaseTypeAmazon = 'amazon';
export type DatabaseTypeGoogle = 'google';

export interface DatabaseTypeData {
    filesystem: DatabaseTypeFilesystem;
    amazon: DatabaseTypeAmazon;
    google: DatabaseTypeGoogle;
}


export type StorageUploadKind =
    | 'write'
    | 'append';


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


export interface Imagene {
    id: string;
    name: string;
    latest: string;
    tags: string[];
    size: number;
    digest: string;
    isPublic: boolean;
}



export interface HypodOwner {
    id: string;
}


export interface OwnerToken {
    token: string;
    expires_in: number;
    issued_at: Date;
}


export interface HypodLogic {
    getCurrentOwner: () => Promise<HypodOwner>;
    getOwnerImagenes: () => Promise<Imagene[]>;
    getOwnerCatalog: () => Promise<any>;
    obliterateOwnerImagene: (
        id: string,
    ) => Promise<boolean>;
    obliterateOwnerImageneTag: (
        id: string,
        tag: string,
    ) => Promise<boolean>;
    checkOwnerCanPush: () => Promise<boolean>;
    checkOwnerCanPull: () => Promise<boolean>;
    checkOwnerToken: (
        token: string,
    ) => Promise<boolean>;
    getOwnerToken: (
        identonym: string,
        key: string,
    ) => Promise<OwnerToken>;
}
// #endregion module
