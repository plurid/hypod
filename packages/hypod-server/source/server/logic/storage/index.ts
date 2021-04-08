// #region imports
    // #region libraries
    import fs from 'fs';

    import express from 'express';

    import {
        storageType,
    } from '~server/data/constants';

    import {
        StorageType,
        StorageUploadKind,
    } from '~server/data/interfaces';
    // #endregion libraries

    // #region internal
    import filesystemStorage from './filesystem';
    import amazonStorage from './amazon';
    import googleStorage from './google';
    // #endregion internal
// #endregion imports



// #region module
class Storage {
    private type: StorageType;

    constructor(
        type: StorageType,
    ) {
        this.type = type;
    }

    public async download(
        filename: string,
    ) {
        switch (this.type) {
            case storageType.filesystem:
                return filesystemStorage.download(
                    filename,
                );
            case storageType.amazon:
                return amazonStorage.download(
                    filename,
                );
            case storageType.google:
                return googleStorage.download(
                    filename,
                );
        }
    }

    public async downloadAll(
        directory: string,
    ) {
        switch (this.type) {
            case storageType.filesystem:
                return filesystemStorage.downloadAll(
                    directory,
                );
            case storageType.amazon:
                return amazonStorage.downloadAll(
                    directory,
                );
            case storageType.google:
                return googleStorage.downloadAll(
                    directory,
                );
        }
    }

    public async upload(
        filename: string,
        data: Buffer,
        kind?: StorageUploadKind,
    ) {
        switch (this.type) {
            case storageType.filesystem:
                return filesystemStorage.upload(
                    filename,
                    data,
                    kind,
                );
            case storageType.amazon:
                return amazonStorage.upload(
                    filename,
                    data,
                    kind,
                );
            case storageType.google:
                return googleStorage.upload(
                    filename,
                    data,
                    kind,
                );
        }
    }

    public async stream(
        filename: string,
        request: express.Request | fs.ReadStream,
    ) {
        switch (this.type) {
            case storageType.filesystem:
                return filesystemStorage.stream(
                    filename,
                    request,
                );
            case storageType.amazon:
                return amazonStorage.stream(
                    filename,
                    request,
                );
            case storageType.google:
                return googleStorage.stream(
                    filename,
                    request,
                );
        }
    }

    public async obliterate(
        filename: string,
    ) {
        switch (this.type) {
            case storageType.filesystem:
                return filesystemStorage.obliterate(
                    filename,
                );
            case storageType.amazon:
                return amazonStorage.obliterate(
                    filename,
                );
            case storageType.google:
                return googleStorage.obliterate(
                    filename,
                );
        }
    }

    public async generateLocations() {
        switch (this.type) {
            case storageType.filesystem:
                return filesystemStorage.generateLocations();
            case storageType.amazon:
                return amazonStorage.generateLocations();
            case storageType.google:
                return googleStorage.generateLocations();
        }
    }
}
// #endregion module



// #region exports
export default Storage;
// #endregion exports
