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
        const stats = await fs.stat(filepath);

        return fs.readFile(filepath, 'binary');
    } catch (error) {
        return;
    }
}


const storageUpload = async (
    filename: string,
    data: Buffer,
) => {
    const filepath = path.join(
        imagenesPath,
        filename,
    );

    return fs.writeFile(filepath, data);
}


const storageObliterate = async (
    filename: string,
) => {
  
}


const filesystemStorage = {
    download: storageDownload,
    upload: storageUpload,
    obliterate: storageObliterate,
};


export default filesystemStorage;
