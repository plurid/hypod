// #region imports
// #region libraries
import {
    StorageType,
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
            case 'filesystem':
                return filesystemStorage.download(
                    filename,
                );
            case 'amazon':
                return;
            case 'google':
                return;
        }
    }

    public async upload(
        filename: string,
        data: Buffer,
        kind?: 'write' | 'append',
    ) {
        switch (this.type) {
            case 'filesystem':
                return filesystemStorage.upload(
                    filename,
                    data,
                    kind,
                );
            case 'amazon':
                break;
            case 'google':
                break;
        }
    }

    public async obliterate(
        filename: string,
    ) {
        switch (this.type) {
            case 'filesystem':
                return filesystemStorage.obliterate(
                    filename,
                );
            case 'amazon':
                break;
            case 'google':
                break;
        }
    }

    public async generateLocations() {
        switch (this.type) {
            case 'filesystem':
                return filesystemStorage.generateLocations();
            case 'amazon':
                break;
            case 'google':
                break;
        }
    }
}


export default Storage;
// #endregion module
