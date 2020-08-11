// #region imports
// #region libraries
import {
    promises as fs,
} from 'fs';

import path from 'path';
// #endregion libraries


// #region external
import {
    BASE_PATH_BLOBS,
    BASE_PATH_IMAGENES,
    BASE_PATH_METADATA,
    BASE_PATH_IMAGENES_MANIFEST,
    BASE_PATH_IMAGENES_SHA256,
} from '#server/data/constants';
// #endregion external
// #endregion imports



// #region module
const BASE_PATH = path.join(
    process.cwd(),
    '/data',
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
    const filepath = path.join(
        imagenesPath,
        filename,
    );

    try {
        await fs.stat(filepath);

        return fs.readFile(filepath, 'binary');
    } catch (error) {
        return;
    }
}


const storageUpload = async (
    filename: string,
    data: Buffer,
    kind?: 'write' | 'append',
) => {
    const filepath = path.join(
        imagenesPath,
        filename,
    );

    const directoryPath = path.dirname(filepath);

    await fs.mkdir(directoryPath, {
        recursive: true,
    });

    if (kind === 'append') {
        return fs.appendFile(filepath, data);
    }

    return fs.writeFile(filepath, data);
}


const storageObliterate = async (
    filename: string,
) => {
    const filepath = path.join(
        imagenesPath,
        filename,
    );

    return fs.unlink(filepath);
}


const storageGenerateLocations = async () => {
    try {
        await makeDirectory(blobsPath);
        await makeDirectory(imagenesPath);
        await makeDirectory(imagenesManifestPath);
        await makeDirectory(imagenesSha256Path);
        await makeDirectory(metadataPath);
    } catch (error) {
        console.log('[Hypod Error 500] :: Filesystem could not generate locations.');
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
