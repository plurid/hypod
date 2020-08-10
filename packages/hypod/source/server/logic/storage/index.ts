import filesystemStorage from './filesystem';



export type StorageType =
    | 'filesystem'
    | 'amazon'
    | 'google';


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
                return filesystemStorage.obliterate(filename);
            case 'amazon':
                break;
            case 'google':
                break;
        }
    }
}


export default Storage;
