import express from 'express';

import {
    uuid,
} from '@plurid/plurid-functions';

import {
    getFromMatch,
} from './utilities';

import Storage from '#server/logic/storage';



const storage = new Storage('filesystem');

const getBufferData = (
    request: express.Request,
) => {
    const bufferData = Buffer.from((request as any).rawBody.toString('binary'), 'binary');
    return bufferData;
}



/** GET */
export const getNameTagsList = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }

    // console.log('getNameTagsList', name);
    // console.log(request.originalUrl);

    const tags: any[] = [];

    const responseData = {
        name,
        tags,
    };
    response.status(200).send(JSON.stringify(responseData));
}


export const getNameManifestsReference = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const reference = getFromMatch(match, 'reference');
    if (!reference) {
        response.status(400).end();
        return;
    }

    // console.log('getNameManifestsReference', name, reference);
    // console.log(request.originalUrl);
    // console.log('------');

    const location = 'manifest/' + name + '/' + reference;

    const file = await storage.download(
        location,
    );

    if (!file) {
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
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const digest = getFromMatch(match, 'digest');
    if (!digest) {
        response.status(400).end();
        return;
    }

    console.log('getNameBlobsDigest', name, digest);
    // console.log(request.originalUrl);
    console.log('------------------');

    const file = await storage.download(digest.replace(':', '/'));
    // console.log('file', file);

    if (!file) {
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
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const uuid = getFromMatch(match, 'uuid');
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

    if (!file) {
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
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
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
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const uuid = getFromMatch(match, 'uuid');
    if (!uuid) {
        response.status(400).end();
        return;
    }

    const location = request.originalUrl;

    const bufferData = getBufferData(request);

    // const bufferData = Buffer.from(request.body.toString('binary'), 'binary');

    // await storage.upload(
    //     uuid,
    //     bufferData,
    // );

    // const blobFilePath = path.join(
    //     __dirname,
    //     uuid,
    // );

    // await fs.appendFile(blobFilePath, bufferData.toString('binary'), 'utf-8');

    // console.log('patchNameBlobsUploadsUuid', name, uuid);
    // console.log(request.originalUrl);
    // console.log(request);
    // console.log('blobFilePath', blobFilePath);
    // console.log('request.body', request.body);
    // console.log('request.query', request.query);
    // console.log(JSON.stringify(request.headers));
    // console.log('bufferData', bufferData);
    // console.log('bufferData.length', bufferData.length);
    // const contentType = request.header('Content-Type');
    // console.log('contentType', contentType);
    // console.log('------------------');

    await storage.upload(
        uuid,
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
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const reference = getFromMatch(match, 'reference');
    if (!reference) {
        response.status(400).end();
        return;
    }

    const data = (request as any).rawBody;
    const location = 'manifest/' + name + '/' + reference;

    const parsedData = JSON.parse(data);
    const digest = parsedData?.config?.digest || '';

    // console.log('putNameManifestsReference', name, reference);
    // console.log(request.originalUrl);
    // console.log('request.query', request.query);
    // const digest = request.query.digest as string || '';

    // console.log('data', data);
    // console.log('------');

    await storage.upload(
        location,
        data,
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
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const uuid = getFromMatch(match, 'uuid');
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

    // console.log('putNameBlobsUploadsUuid', name, uuid);
    // console.log('request.originalUrl', request.originalUrl);
    // console.log('request.body', request.body);
    // console.log('request.query', request.query);
    // console.log('digest', digest);
    // console.log(JSON.stringify(request.headers));
    // const contentType = request.header('Content-Type');
    // console.log('contentType', contentType);
    // console.log('bufferData', bufferData);
    // console.log('bufferData.length', bufferData.length);
    // console.log('------------------');

    await storage.upload(
        uuid,
        bufferData,
        'append',
    );

    const tempFile = await storage.download(uuid);
    if (!tempFile) {
        response.status(400).end();
        return;
    }
    await storage.upload(
        digest.replace(':', '/'),
        Buffer.from(tempFile, 'binary'),
    );

    await storage.obliterate(
        uuid,
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
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const reference = getFromMatch(match, 'reference');
    if (!reference) {
        response.status(400).end();
        return;
    }

    // console.log('deleteNameManifestsReference', name, reference);
    // console.log(request.originalUrl);
    // console.log('------------');

    await storage.obliterate(
        'manifest/' + reference,
    );

    response.status(202).end();
}


export const deleteNameBlobsUploadsUuid = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const uuid = getFromMatch(match, 'uuid');
    if (!uuid) {
        response.status(400).end();
        return;
    }

    // console.log('deleteNameBlobsUploadsUuid', name, uuid);
    // console.log(request.originalUrl);
    // console.log('------------');

    await storage.obliterate(
        uuid,
    );

    response.status(202).end();
}


export const deleteNameBlobsDigest = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const digest = getFromMatch(match, 'digest');
    if (!digest) {
        response.status(400).end();
        return;
    }

    // console.log('deleteNameBlobsDigest', name, uuid);
    // console.log(request.originalUrl);
    // console.log('------------');

    await storage.obliterate(
        digest.replace(':', '/'),
    );

    response.status(202).end();
}
