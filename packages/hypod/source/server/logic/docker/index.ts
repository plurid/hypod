import syncFs, {
    promises as fs,
} from 'fs';

import path from 'path';
import crypto from 'crypto';

import express from 'express';

import {
    uuid,
} from '@plurid/plurid-functions';

import {
    getFromMatch,
} from './utilities';

import Storage from '#server/logic/storage';



const storage = new Storage('filesystem');


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

    console.log('getNameManifestsReference', name, reference);
    console.log(request.originalUrl);

    const responseData = {
        name,
        tag: reference,
        fsLayers: [],
        history: '',
        signature: '',
    };
    response.status(200).send(JSON.stringify(responseData));
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

    const file = await storage.download(digest.replace(':', '-'));
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

    console.log('getNameBlobsUploadsUuid', name, uuid);
    console.log(request.originalUrl);

    const location = `/v2/${name}/blobs/uploads/${uuid}`;

    response.setHeader(
        'Location',
        location,
    );
    response.setHeader(
        'Range',
        'bytes=0-1000',
    );
    response.setHeader(
        'Content-Length',
        '0',
    );
    response.setHeader(
        'Docker-Upload-UUID',
        uuid,
    );
    response.status(204).end();
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

    console.log('postNameBlobsUploads', name);
    // console.log(request.originalUrl);
    // console.log('request.query', request.query);
    // console.log(JSON.stringify(request.headers));
    console.log('------------------');

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


export const postNameBlobsUploadsUuid = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {
    const name = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }
    const uuid = getFromMatch(match, 'name');
    if (!name) {
        response.status(400).end();
        return;
    }

    console.log('postNameBlobsUploadsUuid', name, uuid);
    console.log(request.originalUrl);
    console.log(JSON.stringify(request.headers));
    console.log('------------------');
    
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

    console.log('putNameManifestsReference', name, reference);
    console.log(request.originalUrl);

    const responseData = {
        name,
        tag: reference,
        fsLayers: [],
        history: '',
        signature: '',
    };
    response.status(200).send(JSON.stringify(responseData));
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

    console.log('putNameBlobsUploadsUuid', name, uuid);
    console.log(request.originalUrl);
    console.log('request.body', request.body);
    console.log('request.query', request.query);
    console.log(JSON.stringify(request.headers));
    const bufferData = Buffer.from(request.body.toString('binary'), 'binary');

    await storage.upload(
        uuid,
        bufferData,
    );

    response.setHeader(
        'Location',
        location,
    );
    response.setHeader(
        'Range',
        '0-1000',
    );
    response.setHeader(
        'Content-Length',
        '1000',
    );
    response.setHeader(
        'Docker-Upload-UUID',
        uuid,
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

    console.log('patchNameBlobsUploadsUuid', name, uuid);
    console.log(request.originalUrl);
    // console.log(request);
    // console.log('blobFilePath', blobFilePath);
    console.log('request.body', request.body);
    console.log('request.query', request.query);
    console.log(JSON.stringify(request.headers));
    // console.log('bufferData', bufferData);
    console.log('------------------');


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
        `0-1000`,
    );
    response.setHeader(
        'Content-Length',
        `1000`,
    );
    response.setHeader(
        'Docker-Upload-UUID',
        uuid,
    );
    response.status(202).end();
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

    console.log('deleteNameManifestsReference', name, reference);
    console.log(request.originalUrl);

    response.status(200).end();
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

    console.log('deleteNameBlobsUploadsUuid', name, uuid);
    console.log(request.originalUrl);

    response.status(200).end();
}
