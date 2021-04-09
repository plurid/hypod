import fs from 'fs';

import express from 'express';



// #region module
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


export interface Storage {
    download: StorageDownload;
    downloadAll: StorageDownloadAll;
    upload: StorageUpload;
    stream: StorageStream;
    obliterate: StorageObliterate;
    generateLocations: StorageGenerateLocations;
}

export type StorageDownload = (
    filename: string,
) => Promise<string | undefined>;

export type StorageDownloadAll = (
    directory: string,
) => Promise<any[] | undefined>;

export type StorageUpload = (
    filename: string,
    data: Buffer,
    kind?: StorageUploadKind,
) => Promise<true | void>;

export type StorageStream = (
    filename: string,
    request: express.Request | fs.ReadStream,
) => Promise<fs.WriteStream | void>;

export type StorageObliterate = (
    filename: string,
) => Promise<true | undefined>;

export type StorageGenerateLocations = () => Promise<true | undefined>;


export type StorageUploadKind =
    | 'write'
    | 'append';
// #endregion module
