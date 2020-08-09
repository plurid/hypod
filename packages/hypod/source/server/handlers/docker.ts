import express from 'express';

import {
    DOCKER_ENDPOINT_API_VERSION_CHECK,
} from '#server/data/constants';



const endpointApiVersionCheck = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => {
    response.status(200).end();
}


const dockerHandlers = (
    instance: express.Application,
) => {
    instance.get(
        DOCKER_ENDPOINT_API_VERSION_CHECK,
        endpointApiVersionCheck,
    );
}


export default dockerHandlers;
