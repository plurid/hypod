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
            break;
        case 'google':
            break;
    }
}


const storageUpload = async (
    type: StorageType,
    filename: string,
) => {
    switch (type) {
        case 'filesystem':
            return filesystemStorage.upload(filename);
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
        await storageDownload(
            this.type,
            filename,
        );
    }

    public async upload(
        filename: string,
    ) {
        await storageUpload(
            this.type,
            filename,
        );
    }

    public async obliterate(
        filename: string,
    ) {
        await storageObliterate(
            this.type,
            filename,
        );
    }
}


export default Storage;
