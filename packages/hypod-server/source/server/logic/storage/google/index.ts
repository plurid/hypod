// #region imports
    // #region libraries
    import {
        promises as fs,
    } from 'fs';

    import path from 'path';

    import cloudStorage from '@google-cloud/storage';
    // #endregion libraries


    // #region external
    import {
        QUIET,
        STORAGE_ROOT_PATH,

        BASE_PATH_DATA,
        BASE_PATH_BLOBS,
        BASE_PATH_IMAGENES,
        BASE_PATH_METADATA,
        BASE_PATH_IMAGENES_MANIFEST,
        BASE_PATH_IMAGENES_SHA256,
    } from '~server/data/constants';

    import {
        Storage,
        StorageDownload,
        StorageDownloadAll,
        StorageStatistics,
        StorageUpload,
        StorageStreamWrite,
        StorageStreamRead,
        StorageObliterate,
        StorageGenerateLocations,
    } from '~server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const BASE_PATH = path.join(
    STORAGE_ROOT_PATH,
    BASE_PATH_DATA,
);

const blobsPath = path.join(
    BASE_PATH,
    BASE_PATH_BLOBS,
);

const imagenesPath = path.join(
    BASE_PATH,
    BASE_PATH_IMAGENES,
);

const imagenesManifestPath = path.join(
    BASE_PATH,
    BASE_PATH_IMAGENES_MANIFEST,
);

const imagenesSha256Path = path.join(
    BASE_PATH,
    BASE_PATH_IMAGENES_SHA256,
);

const metadataPath = path.join(
    BASE_PATH,
    BASE_PATH_METADATA,
);


const makeDirectory = async (
    path: string,
) => {
    await fs.mkdir(path, {
        recursive: true,
    });
}


const loadDataFromFiles = async <T>(
    filespath: string,
): Promise<T[]> => {
    try {
        const files = await fs.readdir(filespath);
        const items: T[] = [];

        for (const file of files) {
            const filepath = path.join(filespath, file);
            const data = await fs.readFile(filepath, 'utf-8');
            const item = JSON.parse(data);
            items.push(item);
        }

        return items;
    } catch (error) {
        return [];
    }
}


const storageDownload: StorageDownload = async (
    filename,
) => {
    try {
        const filepath = path.join(
            BASE_PATH,
            filename,
        );

        await fs.stat(
            filepath,
        );

        const filedata = await fs.readFile(
            filepath,
            'binary',
        );

        return filedata;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Warn 500] :: Filesystem could not download ${filename}.`);
        }

        return;
    }
}


const storageDownloadAll: StorageDownloadAll = async (
    directory,
) => {
    try {
        const filespath = path.join(
            BASE_PATH,
            directory,
        );

        const items: any[] = await loadDataFromFiles(filespath);

        return items;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Warn 500] :: Filesystem could not download ${directory}.`);
        }

        return;
    }
}


const storageStatistics: StorageStatistics = async (
    filename,
) => {
    try {
        return {} as any;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Warn 500] :: Could not read ${filename}.`, error);
        }

        return;
    }
}


const storageUpload: StorageUpload = async (
    filename,
    data,
    kind?,
) => {
    try {
        const filepath = path.join(
            BASE_PATH,
            filename,
        );

        const directoryPath = path.dirname(filepath);

        await makeDirectory(directoryPath);

        if (kind === 'append') {
            return fs.appendFile(
                filepath,
                data,
            );
        }

        await fs.writeFile(
            filepath,
            data,
        );

        return true;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Error 500] :: Filesystem could not upload ${filename}.`);
        }

        return;
    }
}


const storageStreamWrite: StorageStreamWrite = async (
    filename,
    fileStream,
) => {
    try {

        return;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Error 500] :: Could not upload ${filename}.`);
        }

        return;
    }
}


const storageStreamRead: StorageStreamRead = async (
    filename,
) => {
    try {

        return;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Error 500] :: Could not read ${filename}.`);
        }

        return;
    }
}


const storageObliterate: StorageObliterate = async (
    filename,
) => {
    try {
        const filepath = path.join(
            BASE_PATH,
            filename,
        );

        await fs.unlink(
            filepath,
        );

        return true;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Error 500] :: Filesystem could not obliterate ${filename}.`);
        }

        return;
    }
}


const storageGenerateLocations: StorageGenerateLocations = async () => {
    try {
        await makeDirectory(blobsPath);
        await makeDirectory(imagenesPath);
        await makeDirectory(imagenesManifestPath);
        await makeDirectory(imagenesSha256Path);
        await makeDirectory(metadataPath);

        return true;
    } catch (error) {
        if (!QUIET) {
            console.log('[Hypod Error 500] :: Filesystem could not generate locations.');
        }

        return;
    }
}



const googleStorage: Storage = {
    download: storageDownload,
    downloadAll: storageDownloadAll,
    statistics: storageStatistics,
    upload: storageUpload,
    streamWrite: storageStreamWrite,
    streamRead: storageStreamRead,
    obliterate: storageObliterate,
    generateLocations: storageGenerateLocations,
};
// #endregion module



// #region exports
export default googleStorage;
// #endregion exports
