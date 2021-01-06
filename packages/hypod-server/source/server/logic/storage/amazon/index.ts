// #region imports
    // #region libraries
    import {
        promises as fs,
    } from 'fs';

    import path from 'path';

    import AWS from 'aws-sdk';
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
        StorageUpload,
        StorageObliterate,
        StorageGenerateLocations,
    } from '~server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const apiVersion = process.env.HYPOD_AWS_API_VERSION || '';
const region = process.env.HYPOD_AWS_REGION || '';
const accessKeyId = process.env.HYPOD_AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.HYPOD_AWS_SECRET_ACCESS_KEY || '';
const bucketName = process.env.HYPOD_STORAGE_BUCKET || '';

const s3 = new AWS.S3({
    apiVersion,
    region,
    accessKeyId,
    secretAccessKey,
});


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

        const fileParameters = {
            Bucket: bucketName,
            Key: filepath,
        };

        const readStream = s3
            .getObject(fileParameters)
            .createReadStream();

        const filedata = '';

        return filedata;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Error 500] :: Amazon could not download ${filename}.`);
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
            console.log(`[Hypod Error 500] :: Filesystem could not download ${directory}.`);
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

        const fileParameters = {
            Bucket: bucketName,
            Key: filepath,
        };


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
            console.log(`[Hypod Error 500] :: Amazon could not upload ${filename}.`);
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

        const fileParameters = {
            Bucket: bucketName,
            Key: filepath,
        };

        await fs.unlink(
            filepath,
        );

        return true;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Error 500] :: Amazon could not obliterate ${filename}.`);
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
            console.log('[Hypod Error 500] :: Amazon could not generate locations.');
        }

        return;
    }
}



const amazonStorage: Storage = {
    download: storageDownload,
    downloadAll: storageDownloadAll,
    upload: storageUpload,
    obliterate: storageObliterate,
    generateLocations: storageGenerateLocations,
};
// #endregion module



// #region exports
export default amazonStorage;
// #endregion exports
