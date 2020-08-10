import {
    promises as fs,
} from 'fs';

import path from 'path';

import {
    BASE_PATH_IMAGENES,
} from '#server/data/constants';



const BASE_PATH = path.join(
    process.cwd(),
    '/data',
);

const imagenesPath = path.join(
    BASE_PATH,
    BASE_PATH_IMAGENES,
);


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


const filesystemStorage = {
    download: storageDownload,
    upload: storageUpload,
    obliterate: storageObliterate,
};


export default filesystemStorage;
