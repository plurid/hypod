// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';

    import {
        Response,
    } from 'express';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        STORAGE_ROOT_PATH,
        BASE_PATH_DATA,

        BASE_PATH_BLOBS,
        BASE_PATH_IMAGENES_MANIFEST,
        BASE_PATH_IMAGENES,
        dockerEntityMatchType,
    } from '~server/data/constants';

    import {
        HypodRequest,
        Imagene,
    } from '~server/data/interfaces';

    import database from '~server/services/database';
    import storage from '~server/services/storage';

    import {
        getBufferData,
    } from '~server/utilities/buffer';

    import {
        registerImageneManifest,
    } from '../imagene';

    import {
        sha256,
    } from '../../utilities';
    // #endregion external


    // #region internal
    import {
        getFromMatch,
    } from './utilities';
    // #endregion internal
// #endregion imports



// #region module
const BASE_PATH = path.join(
    STORAGE_ROOT_PATH,
    BASE_PATH_DATA,
);


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

    // console.log('getNameManifestsReference');
    // console.log('name', name);
    // console.log('reference', reference);
    // console.log('----------------');


    // const imagene: Imagene | undefined = await database.query(
    //     'imagene',
    //     'name',
    //     name,
    // );

    // if (!imagene) {
    //     response.status(404).end();
    //     return;
    // }

    // if (!imagene.isPublic) {
    //     response.status(404).end();
    //     return;
    // }


    if (reference.startsWith('sha256:')) {
        const imageLocation = BASE_PATH_IMAGENES_MANIFEST + name + '/';
        // console.log('imageLocation', imageLocation);

        const referenceFilesData = await storage.downloadAll(imageLocation);
        // console.log('referenceFilesData', referenceFilesData);

        if (!referenceFilesData) {
            response.status(400).end();
            return;
        }

        let matchData;
        for (const fileData of referenceFilesData) {
            const stringedValue = JSON.stringify(fileData, null, 3);
            // console.log('stringedValue', stringedValue);
            const shaValue = await sha256(stringedValue);
            // console.log('shaValue', shaValue);

            if (shaValue === reference.replace('sha256:', '')) {
                matchData = fileData;
                break;
            }
        }

        // console.log('matchData', matchData);
        if (!matchData) {
            response.status(400).end();
            return;
        }

        const mediaType = matchData.mediaType || '';

        response.setHeader(
            'Content-Type',
            mediaType,
        );
        response.status(200).send(
            JSON.stringify(matchData, null, 3),
        );
        return;
    }


    const location = BASE_PATH_IMAGENES_MANIFEST + name + '/' + reference;
    // console.log('location ref', location);

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

    // console.log('getNameBlobsDigest');
    // console.log('name', name);
    // console.log('digest', digest);
    // console.log('request.originalUrl', request.originalUrl);
    // console.log('request.method', request.method);
    // console.log('------------------');

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

    if (request.method === 'HEAD') {
        response.status(200).end();
        return;
    }

    response.setHeader(
        'Content-Type',
        'application/octet-stream',
    );
    response.status(200).send(Buffer.from(file, 'binary'));
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

    console.log('patchNameBlobsUploadsUuid', name);
    console.log('request.originalUrl', request.originalUrl);
    console.log('------------------');

    const location = request.originalUrl;
    // const bufferData = getBufferData(request);
    const blobPath = BASE_PATH_BLOBS + uuid;

    // const someStream = fs.createWriteStream('./some-random' + Math.random());

    const stream = await storage.stream(
        blobPath,
        request,
    );

    if (!stream) {
        response
            .status(500)
            .end();

        return;
    }

    stream.on('finish', () => {
        response.setHeader(
            'Location',
            location,
        );
        response.setHeader(
            'Range',
            `0-1000000`,
            // '0-' + length,
        );
        response.setHeader(
            'Content-Length',
            // `${bufferData.length}`,
            '0',
            // length + '',
            // '0',
        );
        response.setHeader(
            'Docker-Upload-UUID',
            uuid,
        );
        response.status(202).end();
    });

    // request.pipe(someStream);

    // let length = 0;

    // request.on('data', (chunk) => {
    //     length += chunk.length;
    //     console.log('patchNameBlobsUploadsUuid request.originalUrl', request.originalUrl);
    //     console.log('length', length);
    //     console.log('------------------');
    // });

    // request.on('end', async () => {
        // response.setHeader(
        //     'Location',
        //     location,
        // );
        // response.setHeader(
        //     'Range',
        //     `0-1000000`,
        //     // '0-' + length,
        // );
        // response.setHeader(
        //     'Content-Length',
        //     // `${bufferData.length}`,
        //     '0',
        //     // length + '',
        //     // '0',
        // );
        // response.setHeader(
        //     'Docker-Upload-UUID',
        //     uuid,
        // );
        // response.status(202).end();
    // });



    // response.setHeader(
    //     'Location',
    //     location,
    // );
    // response.setHeader(
    //     'Range',
    //     `0-1000000`,
    //     // '0-' + length,
    // );
    // response.setHeader(
    //     'Content-Length',
    //     // `${bufferData.length}`,
    //     // '0',
    //     // length + '',
    //     '0',
    // );
    // response.setHeader(
    //     'Docker-Upload-UUID',
    //     uuid,
    // );
    // response.status(202).end();



    // await storage.upload(
    //     blobPath,
    //     bufferData,
    //     'append',
    // );

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

    // response.setHeader(
    //     'Location',
    //     location,
    // );
    // response.setHeader(
    //     'Range',
    //     `0-1000000`,
    // );
    // response.setHeader(
    //     'Content-Length',
    //     // `${bufferData.length}`,
    //     '0',
    // );
    // response.setHeader(
    //     'Docker-Upload-UUID',
    //     uuid,
    // );
    // response.status(202).end();
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

    // console.log('putNameManifestsReference', name);
    // console.log('request.originalUrl', request.originalUrl);
    // console.log('------------------');

    const data = (request as any).rawBody;
    const location = BASE_PATH_IMAGENES_MANIFEST + name + '/' + reference;

    const parsedData = JSON.parse(data);
    const digest = parsedData?.config?.digest || '';

    await storage.upload(
        location,
        data,
    );

    registerImageneManifest(
        parsedData,
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

    console.log('putNameBlobsUploadsUuid', name);
    console.log('request.originalUrl', request.originalUrl);
    console.log('------------------');

    const location = request.originalUrl;
    const digest = request.query.digest as string || '';

    if (!digest) {
        response.status(400).end();
        return;
    }

    // const bufferData = getBufferData(request);
    const blobPath = BASE_PATH_BLOBS + uuid;



    const stream = await storage.stream(
        blobPath,
        request,
    );

    if (!stream) {
        response
            .status(500)
            .end();

        return;
    }

    stream.on('finish', () => {
        const digestValue = digest.replace(':', '/');
        const digestPath = BASE_PATH_IMAGENES + digestValue;
        // await storage.upload(
        //     digestPath,
        //     Buffer.from(tempFile, 'binary'),
        // );

        const blobRelativePath = path.join(
            BASE_PATH,
            blobPath,
        );

        const readStream = fs.createReadStream(blobRelativePath);
        storage.stream(
            digestPath,
            readStream,
        );

        readStream.on('finish', () => {
            console.log('read stream end putNameBlobsUploadsUuid', request.originalUrl)
            // storage.obliterate(
            //     blobPath,
            // );

            response.setHeader(
                'Location',
                location,
            );
            // response.setHeader(
            //     'Range',
            //     '0-1000000',
            //     // '0-' + length,
            // );
            response.setHeader(
                'Content-Length',
                // `${tempFile.length}`,
                // length,
                '0',
            );
            response.setHeader(
                'Docker-Content-Digest',
                digest,
            );
            response.status(201).end();
        });
    });



    // let length = 0;

    // console.log('Content-Length', request.get('Content-Length'));

    // request.on('data', (chunk) => {
    //     length += chunk.length;
    //     console.log('putNameBlobsUploadsUuid request.originalUrl', request.originalUrl);
    //     console.log('length', length);
    //     console.log('------------------');
    // });

    // request.on('end', async () => {
    //     // const tempFile = await storage.download(blobPath);
    //     // if (!tempFile || typeof tempFile !== 'string') {
    //     //     response.status(400).end();
    //     //     return;
    //     // }

    //     const digestValue = digest.replace(':', '/');
    //     const digestPath = BASE_PATH_IMAGENES + digestValue;
    //     // await storage.upload(
    //     //     digestPath,
    //     //     Buffer.from(tempFile, 'binary'),
    //     // );

    //     const blobRelativePath = path.join(
    //         BASE_PATH,
    //         blobPath,
    //     );

    //     const readStream = fs.createReadStream(blobRelativePath);
    //     storage.stream(
    //         digestPath,
    //         readStream,
    //     );

    //     readStream.on('end', () => {
    //         console.log('read stream end putNameBlobsUploadsUuid', request.originalUrl)
    //         // storage.obliterate(
    //         //     blobPath,
    //         // );

    //         response.setHeader(
    //             'Location',
    //             location,
    //         );
    //         // response.setHeader(
    //         //     'Range',
    //         //     '0-1000000',
    //         //     // '0-' + length,
    //         // );
    //         response.setHeader(
    //             'Content-Length',
    //             // `${tempFile.length}`,
    //             length,
    //             // '0',
    //         );
    //         response.setHeader(
    //             'Docker-Content-Digest',
    //             digest,
    //         );
    //         response.status(201).end();
    //     });
    // });



    // await storage.upload(
    //     blobPath,
    //     bufferData,
    //     'append',
    // );

    // const tempFile = await storage.download(blobPath);
    // if (!tempFile || typeof tempFile !== 'string') {
    //     response.status(400).end();
    //     return;
    // }

    // const digestValue = digest.replace(':', '/');
    // const digestPath = BASE_PATH_IMAGENES + digestValue;
    // await storage.upload(
    //     digestPath,
    //     Buffer.from(tempFile, 'binary'),
    // );

    // await storage.obliterate(
    //     blobPath,
    // );

    // response.setHeader(
    //     'Location',
    //     location,
    // );
    // response.setHeader(
    //     'Range',
    //     '0-1000000',
    // );
    // response.setHeader(
    //     'Content-Length',
    //     `${tempFile.length}`,
    // );
    // response.setHeader(
    //     'Docker-Content-Digest',
    //     digest,
    // );
    // response.status(201).end();
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
