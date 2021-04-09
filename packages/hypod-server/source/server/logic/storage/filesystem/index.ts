// #region imports
    // #region libraries
    import fsSync, {
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
        BASE_PATH_METADATA_NAMESPACES,
        BASE_PATH_METADATA_PROJECTS,
        BASE_PATH_METADATA_IMAGENES,
        BASE_PATH_IMAGENES_MANIFEST,
        BASE_PATH_IMAGENES_SHA256,
    } from '~server/data/constants';

    import {
        Storage,
        StorageDownload,
        StorageDownloadAll,
        StorageUpload,
        StorageStream,
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

const metadataNamespacesPath = path.join(
    BASE_PATH,
    BASE_PATH_METADATA_NAMESPACES,
);

const metadataProjectsPath = path.join(
    BASE_PATH,
    BASE_PATH_METADATA_PROJECTS,
);

const metadataImagenesPath = path.join(
    BASE_PATH,
    BASE_PATH_METADATA_IMAGENES,
);


const makeDirectory = async (
    path: string,
) => {
    await fs.mkdir(path, {
        recursive: true,
    });
}


const loadDataFromFile = async (
    filepath: string,
) => {
    try {
        const data = await fs.readFile(filepath, 'utf-8');
        const item = JSON.parse(data);

        return item;
    } catch (error) {
        return;
    }
}


const getFiles = async (
    path: string,
) => {
    const entries = await fs.readdir(path, { withFileTypes: true });

    // Get files within the current directory and add a path key to the file objects
    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => ({ ...file, path: path + file.name }));

    // Get folders within the current directory
    const folders = entries.filter(folder => folder.isDirectory());

    for (const folder of folders) {
        /*
          Add the found files within the subdirectory to the files array by calling the
          current function itself
        */
        files.push(...await getFiles(`${path}${folder.name}/`));
    }

    return files;
}


const loadDataFromFiles = async <T>(
    filespath: string,
): Promise<T[]> => {
    try {
        const files = await getFiles(filespath);

        const items: T[] = [];

        for (const file of files) {
            // const filepath = path.join(filespath, file);
            const item = await loadDataFromFile(file.path);
            if (item) {
                items.push(item);
            }
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


const storageStream: StorageStream = async (
    filename,
    readStream,
) => {
    try {
        console.log('storage stream', filename);

        const filepath = path.join(
            BASE_PATH,
            filename,
        );

        const directoryPath = path.dirname(filepath);

        await makeDirectory(directoryPath);

        const writeStream = fsSync.createWriteStream(filepath, {
            flags: 'a+',
        });
        readStream.pipe(writeStream, {
            // end: false,

        });

        // readStream.on('data', (chunk) => {
        //     console.log('read stream', filepath, chunk.length);
        //     writeStream.write(chunk);
        // });

        return writeStream;
    } catch (error) {
        if (!QUIET) {
            console.log(`[Hypod Error 500] :: Filesystem could not upload ${filename}.`);
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
        await makeDirectory(metadataNamespacesPath);
        await makeDirectory(metadataProjectsPath);
        await makeDirectory(metadataImagenesPath);

        return true;
    } catch (error) {
        if (!QUIET) {
            console.log('[Hypod Error 500] :: Filesystem could not generate locations.');
        }

        return;
    }
}



const filesystemStorage: Storage = {
    download: storageDownload,
    downloadAll: storageDownloadAll,
    upload: storageUpload,
    stream: storageStream,
    obliterate: storageObliterate,
    generateLocations: storageGenerateLocations,
};
// #endregion module



// #region exports
export default filesystemStorage;
// #endregion exports
