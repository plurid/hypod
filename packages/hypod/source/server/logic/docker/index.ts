import express from 'express';



export const getNameTagsList = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {

    console.log(request.originalUrl);
    console.log(match);
    response.status(200).end();
    
}


export const getNameManifestsReference = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {

    console.log(request.originalUrl);
    console.log(match);
    response.status(200).end();

}


export const getNameBlobsDigest = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {

    console.log(request.originalUrl);
    console.log(match);
    response.status(200).end();

}


export const getNameBlobsUploads = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {

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

    console.log(request.originalUrl);
    console.log(match);
    response.status(200).end();

}


export const putNameBlobsUploadsUuid = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {

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

    console.log(request.originalUrl);
    console.log(match);
    response.status(200).end();

}

export const deleteNameBlobsUploadsUuid = async (
    request: express.Request,
    response: express.Response,
    match: RegExpMatchArray,
) => {

    console.log(request.originalUrl);
    console.log(match);
    response.status(200).end();

}
