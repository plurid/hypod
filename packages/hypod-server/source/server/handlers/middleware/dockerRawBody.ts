// #region imports
    // #region libraries
    import express from 'express';
    // #endregion libraries


    // #region external
    import {
        DOCKER_ENDPOINT_API_VERSION_CHECK,
    } from '~server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const dockerRawBody = (
    request: express.Request,
    _: express.Response,
    next: express.NextFunction,
) => {
    const isDockerJson = request.is('application/vnd.docker.distribution.manifest.v2+json');

    if (isDockerJson) {
        let data = '';
        request.setEncoding('binary');
        request.on('data', (chunk) => {
            if (data.length < 250_000_000) {
                data += chunk;
            }
        });

        request.on('end', () => {
            (request as any).rawBody = data;
            next();
        });

        return;
    }

    next();

    // if (
    //     request.method === 'PATCH'
    //     || request.method === 'PUT'
    // ) {
    //     next();
    //     return;
    // }

    // const url = request.originalUrl;

    // if (!url.startsWith(DOCKER_ENDPOINT_API_VERSION_CHECK)) {
    //     next();
    //     return;
    // }
}
// #endregion module



// #region exports
export default dockerRawBody;
// #endregion exports
