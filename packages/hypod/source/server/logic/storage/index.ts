import filesystemStorage from './filesystem';



export type StorageType =
    | 'filesystem'
    | 'amazon'
    | 'google';


const storageDownload = async (
    type: StorageType,
    filename: string,
) => {
    switch (type) {
        case 'filesystem':
            return filesystemStorage.download(filename);
        case 'amazon':
            return;
        case 'google':
            return;
    }
}


const storageUpload = async (
    type: StorageType,
    filename: string,
    data: Buffer,
    kind?: 'write' | 'append',
) => {
    switch (type) {
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


const storageObliterate = async (
    type: StorageType,
    filename: string,
) => {
    switch (type) {
        case 'filesystem':
            return filesystemStorage.obliterate(filename);
        case 'amazon':
            break;
        case 'google':
            break;
    }
}


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
        return storageDownload(
            this.type,
            filename,
        );
    }

    public async upload(
        filename: string,
        data: Buffer,
        kind?: 'write' | 'append',
    ) {
        return storageUpload(
            this.type,
            filename,
            data,
            kind,
        );
    }

    public async obliterate(
        filename: string,
    ) {
        return storageObliterate(
            this.type,
            filename,
        );
    }
}


export default Storage;
