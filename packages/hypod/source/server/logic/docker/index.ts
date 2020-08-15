// #region imports
    // #region libraries
    import {
        Response,
    } from 'express';

    import {
        ungzip,
    } from 'node-gzip';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        BASE_PATH_BLOBS,
        BASE_PATH_IMAGENES_MANIFEST,
        BASE_PATH_IMAGENES,
        dockerEntityMatchType,
    } from '#server/data/constants';

    import {
        Imagene,
        ImageneTag,
        HypodRequest,
    } from '#server/data/interfaces';

    import storage from '#server/services/storage';

    import {
        getBufferData,
    } from '#server/utilities/buffer';

    import {
        registerImagene,
    } from '../imagene';
    // #endregion external


    // #region internal
    import {
        getFromMatch,
    } from './utilities';
    // #endregion internal
// #endregion imports



// #region module
const registerImageneManifest = async (
    name: string,
    reference: string,
    digest: string,
) => {
    const manifestPath = BASE_PATH_IMAGENES_MANIFEST + name + '/' + reference;

    const manifestData = await storage.download(
        manifestPath,
    );
    
    if (!manifestData) {
        return;
    }

    const manifest = JSON.parse(manifestData);

    let size = 0;

    for (const layer of manifest.layers) {
        try {
            const layerPath = layer.digest.replace(':', '/');
            const imageneLayerPath = BASE_PATH_IMAGENES + layerPath;
    
            const layerData = await storage.download(
                imageneLayerPath,
            );
                
            if (layerData) {
                const decompressed = await ungzip(Buffer.from(layerData, 'binary'));
                const byteLength = Buffer.byteLength(decompressed);
                size += byteLength;
            }
        } catch (error) {
            continue;
        }
    }

    const imageneTag: ImageneTag = {
        id: uuid.generate(),
        generatedAt: Math.floor(Date.now() / 1000),
        name: reference,
        size,
        digest,
    };

    const imagene: Imagene = {
        id: uuid.generate(),
        name,
        latest: reference,
        tags: [
            imageneTag,
        ],
        isPublic: false,
    };
    registerImagene(imagene);
}


/** GET */
export const getNameTagsList = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }

    // check if name exists


    // get tags
    const tags: string[] = [];

    const responseData = {
        name,
        tags,
    };

    response.setHeader(
        'Content-Type',
        'application/json',
    );

    response.status(200).send(JSON.stringify(responseData));
}


export const getNameManifestsReference = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }
    const reference = getFromMatch(
        match,
        dockerEntityMatchType.reference,
    );
    if (!reference) {
        response.status(400).end();
        return;
    }

    const location = BASE_PATH_IMAGENES_MANIFEST + name + '/' + reference;

    const file = await storage.download(
        location,
    );

    if (typeof file !== 'string') {
        return response.status(404).end();
    }

    const parsedData = JSON.parse(file);
    const mediaType = parsedData.mediaType || '';

    response.setHeader(
        'Content-Type',
        mediaType,
    );
    response.status(200).send(file);
}


export const getNameBlobsDigest = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }
    const digest = getFromMatch(
        match,
        dockerEntityMatchType.digest,
    );
    if (!digest) {
        response.status(400).end();
        return;
    }


    const digestValue = digest.replace(':', '/');
    const digestPath = BASE_PATH_IMAGENES + digestValue;

    const file = await storage.download(
        digestPath,
    );

    if (typeof file !== 'string') {
        response.status(404).end();
        return;
    }

    response.setHeader(
        'Content-Length',
        file.length,
    );
    response.setHeader(
        'Docker-Content-Digest',
        digest,
    );
    response.status(200).end();
}


export const getNameBlobsUploadsUuid = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }
    const uuid = getFromMatch(
        match,
        dockerEntityMatchType.uuid,
    );
    if (!uuid) {
        response.status(400).end();
        return;
    }

    // console.log('getNameBlobsUploadsUuid', name, uuid);
    // console.log(request.originalUrl);

    const location = `/v2/${name}/blobs/uploads/${uuid}`;

    const file = await storage.download(
        uuid,
    );

    response.setHeader(
        'Location',
        location,
    );
    response.setHeader(
        'Docker-Upload-UUID',
        uuid,
    );

    if (typeof file !== 'string') {
        response.setHeader(
            'Range',
            '0-0',
        );
        response.setHeader(
            'Content-Length',
            '0',
        );
        response.status(204).end();
        return;
    }

    response.setHeader(
        'Range',
        '0-0',
    );
    response.setHeader(
        'Content-Length',
        file.length,
    );
    response.status(200).end();
}



/** POST */
export const postNameBlobsUploads = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }

    const blobUuid = uuid.generate() + uuid.generate();
    const location = `/v2/${name}/blobs/uploads/${blobUuid}`;

    // const bufferData = getBufferData(request);

    // console.log('postNameBlobsUploads', name);
    // // console.log(request.originalUrl);
    // console.log('request.body', request.body);
    // console.log('request.query', request.query);
    // console.log(JSON.stringify(request.headers));
    // console.log('bufferData', bufferData);
    // console.log('bufferData.length', bufferData.length);
    // console.log('------------------');

    response.setHeader(
        'Location',
        location,
    );
    response.setHeader(
        'Range',
        '0-0',
    );
    response.setHeader(
        'Content-Length',
        '0',
    );
    response.setHeader(
        'Docker-Upload-UUID',
        blobUuid,
    );
    response.status(202).end();
}



/** PATCH */
export const patchNameBlobsUploadsUuid = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }
    const uuid = getFromMatch(
        match,
        dockerEntityMatchType.uuid,
    );
    if (!uuid) {
        response.status(400).end();
        return;
    }

    const location = request.originalUrl;
    const bufferData = getBufferData(request);
    const blobPath = BASE_PATH_BLOBS + uuid;

    await storage.upload(
        blobPath,
        bufferData,
        'append',
    );

    // if (true) {
    //     const errorResponse = {
    //         errors: [
    //             {
    //                 code: "UNAUTHORIZED",
    //                 message: "Unauthorized",
    //                 detail: "Log in."
    //             },
    //         ],
    //     };

    //     response.status(400).send(JSON.stringify(errorResponse));
    //     return;
    // }

    response.setHeader(
        'Location',
        location,
    );
    response.setHeader(
        'Range',
        `0-1000000`,
    );
    response.setHeader(
        'Content-Length',
        `${bufferData.length}`,
    );
    response.setHeader(
        'Docker-Upload-UUID',
        uuid,
    );
    response.status(202).end();
}



/** PUT */
export const putNameManifestsReference = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }
    const reference = getFromMatch(
        match,
        dockerEntityMatchType.reference,
    );
    if (!reference) {
        response.status(400).end();
        return;
    }

    const data = (request as any).rawBody;
    const location = BASE_PATH_IMAGENES_MANIFEST + name + '/' + reference;

    const parsedData = JSON.parse(data);
    const digest = parsedData?.config?.digest || '';

    await storage.upload(
        location,
        data,
    );

    registerImageneManifest(
        name,
        reference,
        digest,
    );

    response.setHeader(
        'Location',
        location,
    );
    response.setHeader(
        'Content-Length',
        '0',
    );
    response.setHeader(
        'Docker-Content-Digest',
        digest,
    );

    response.status(201).end();
}


export const putNameBlobsUploadsUuid = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }
    const uuid = getFromMatch(
        match,
        dockerEntityMatchType.uuid,
    );
    if (!uuid) {
        response.status(400).end();
        return;
    }

    const location = request.originalUrl;
    const digest = request.query.digest as string || '';

    if (!digest) {
        response.status(400).end();
        return;
    }

    const bufferData = getBufferData(request);
    const blobPath = BASE_PATH_BLOBS + uuid;

    await storage.upload(
        blobPath,
        bufferData,
        'append',
    );

    const tempFile = await storage.download(blobPath);
    if (!tempFile || typeof tempFile !== 'string') {
        response.status(400).end();
        return;
    }

    const digestValue = digest.replace(':', '/');
    const digestPath = BASE_PATH_IMAGENES + digestValue;
    await storage.upload(
        digestPath,
        Buffer.from(tempFile, 'binary'),
    );

    await storage.obliterate(
        blobPath,
    );

    response.setHeader(
        'Location',
        location,
    );
    response.setHeader(
        'Range',
        '0-1000000',
    );
    response.setHeader(
        'Content-Length',
        `${tempFile.length}`,
    );
    response.setHeader(
        'Docker-Content-Digest',
        digest,
    );
    response.status(201).end();
}



/** DELETE */
export const deleteNameManifestsReference = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }
    const reference = getFromMatch(
        match,
        dockerEntityMatchType.reference,
    );
    if (!reference) {
        response.status(400).end();
        return;
    }

    const manifestPath = BASE_PATH_IMAGENES_MANIFEST + reference;

    await storage.obliterate(
        manifestPath,
    );

    response.status(202).end();
}


export const deleteNameBlobsUploadsUuid = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }
    const uuid = getFromMatch(
        match,
        dockerEntityMatchType.uuid,
    );
    if (!uuid) {
        response.status(400).end();
        return;
    }

    const blobPath = BASE_PATH_BLOBS + uuid;

    await storage.obliterate(
        blobPath,
    );

    response.status(202).end();
}


export const deleteNameBlobsDigest = async (
    request: HypodRequest,
    response: Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(
        match,
        dockerEntityMatchType.name,
    );
    if (!name) {
        response.status(400).end();
        return;
    }
    const digest = getFromMatch(
        match,
        dockerEntityMatchType.digest,
    );
    if (!digest) {
        response.status(400).end();
        return;
    }

    await storage.obliterate(
        digest.replace(':', '/'),
    );

    response.status(202).end();
}
// #endregion module
