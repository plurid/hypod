import express from 'express';

import {
    getFromMatch,
} from './utilities';



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

    console.log(name);
    console.log(request.originalUrl);
    console.log(match);
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

    console.log(name);
    console.log(reference);
    console.log(request.originalUrl);
    console.log(match);
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

    console.log(request.originalUrl);
    console.log(match);
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

    console.log(request.originalUrl);
    console.log(match);
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
   
    console.log(request.originalUrl);
    console.log(match);
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

    console.log(request.originalUrl);
    console.log(match);
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

    console.log(request.originalUrl);
    console.log(match);
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

    console.log(request.originalUrl);
    console.log(match);
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

    console.log(request.originalUrl);
    console.log(match);
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

    console.log(request.originalUrl);
    console.log(match);
    response.status(200).end();
}
