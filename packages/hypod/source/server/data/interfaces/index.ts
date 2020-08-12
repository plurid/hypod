// #region imports
import express from 'express';
// #endregion imports



// #region module
export interface Context {
    request: express.Request;
    response: express.Response;
    instance: express.Application;
    imagenes: Imagene[];
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
}
// #endregion module
