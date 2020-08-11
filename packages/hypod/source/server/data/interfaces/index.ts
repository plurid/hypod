// #region imports
import express from 'express';
// #endregion imports



// #region module
export interface Context {
    request: express.Request;
    response: express.Response;
    instance: express.Application;
}


export type StorageType =
    | StorageTypeFilesystem
    | StorageTypeAmazon
    | StorageTypeGoogle;

export interface StorageTypeData {
    filesystem: StorageTypeFilesystem;
    amazon: StorageTypeAmazon;
    google: StorageTypeGoogle;
}

export type StorageTypeFilesystem = 'filesystem';
export type StorageTypeAmazon = 'amazon';
export type StorageTypeGoogle = 'google';


export type StorageUploadKind =
    | 'write'
    | 'append';


export type DockerEntityMatchType =
    | 'name'
    | 'reference'
    | 'digest'
    | 'uuid';
// #endregion module
