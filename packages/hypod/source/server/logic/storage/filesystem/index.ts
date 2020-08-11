// #region imports
// #region libraries
import {
    promises as fs,
} from 'fs';

import path from 'path';
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
} from '#server/data/constants';

import {
    StorageUploadKind,
} from '#server/data/interfaces';
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



const storageDownload = async (
    filename: string,
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
            console.log(`[Hypod Error 500] :: Filesystem could not download ${filename}.`);
        }

        return;
    }
}


const storageUpload = async (
    filename: string,
    data: Buffer,
    kind?: StorageUploadKind,
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


const storageObliterate = async (
    filename: string,
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


const storageGenerateLocations = async () => {
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



const filesystemStorage = {
    download: storageDownload,
    upload: storageUpload,
    obliterate: storageObliterate,
    generateLocations: storageGenerateLocations,
};


export default filesystemStorage;
// #endregion module
