import express from 'express';

import {
    uuid,
} from '@plurid/plurid-functions';

import {
    getFromMatch,
} from './utilities';



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

    console.log('getNameTagsList', name);
    console.log(request.originalUrl);

    response.status(200).end();
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
    
    response.status(200).end();
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
    console.log(request.originalUrl);

    response.status(404).end();
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

    console.log('postNameBlobsUploads', name);
    console.log(request.originalUrl);

    response.setHeader(
        'Location',
        location,
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

    
    response.status(200).end();
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

    response.status(200).end();
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

    console.log('putNameBlobsUploadsUuid', name, uuid);
    console.log(request.originalUrl);

    response.status(200).end();
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

    console.log('patchNameBlobsUploadsUuid', name, uuid);
    console.log(request.originalUrl);

    response.status(200).end();
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
