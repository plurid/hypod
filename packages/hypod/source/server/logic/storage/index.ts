// #region imports
// #region libraries
import {
    storageType,
} from '#server/data/constants';

import {
    StorageType,
    StorageUploadKind,
} from '#server/data/interfaces';
// #endregion libraries

// #region imports
import filesystemStorage from './filesystem';
// #endregion imports
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
                return;
            case storageType.google:
                return;
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
                console.log('[Hypod Error] :: Not implemented.');
                return;
            case storageType.google:
                console.log('[Hypod Error] :: Not implemented.');
                return;
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
                console.log('[Hypod Error] :: Not implemented.');
                return;
            case storageType.google:
                console.log('[Hypod Error] :: Not implemented.');
                return;
        }
    }

    public async generateLocations() {
        switch (this.type) {
            case storageType.filesystem:
                return filesystemStorage.generateLocations();
            case storageType.amazon:
                console.log('[Hypod Error] :: Not implemented.');
                return;
            case storageType.google:
                console.log('[Hypod Error] :: Not implemented.');
                return;
        }
    }
}


export default Storage;
// #endregion module
