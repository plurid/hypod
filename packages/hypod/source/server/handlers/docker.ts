import express from 'express';

import {
    DOCKER_ENDPOINT_API_VERSION_CHECK,
    DOCKER_ENDPOINT_API_CATALOG,
    DOCKER_ENDPOINT_API_ALL,
} from '#server/data/constants';



const endpointApiVersionCheck = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => {
    response.status(200).end();
}

const endpointApiGetAll = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => {
    console.log(request.originalUrl);

    response.status(200).end();
}

const endpointApiPostAll = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => {
    console.log(request.originalUrl);

    response.status(200).end();
}

const endpointApiPutAll = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => {
    console.log(request.originalUrl);

    response.status(200).end();
}

const endpointApiPatchAll = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => {
    console.log(request.originalUrl);

    response.status(200).end();
}

const endpointApiDeleteAll = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => {
    console.log(request.originalUrl);

    response.status(200).end();
}


const dockerHandlers = (
    instance: express.Application,
) => {
    instance.get(
        DOCKER_ENDPOINT_API_VERSION_CHECK,
        endpointApiVersionCheck,
    );

    instance.get(
        DOCKER_ENDPOINT_API_CATALOG,
        endpointApiGetAll,
    );

    instance.get(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiGetAll,
    );

    instance.post(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiPostAll,
    );

    instance.put(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiPutAll,
    );

    instance.patch(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiPatchAll,
    );

    instance.delete(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiDeleteAll,
    );
}


export default dockerHandlers;
