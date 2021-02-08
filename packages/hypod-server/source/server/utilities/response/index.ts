// #region imports
    // #region libraries
    import {
        Response,
    } from 'express';
    // #endregion libraries


    // #region external
    import {
        DOCKER_SERVICE,
    } from '~server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const sendUnauthorizedResponse = (
    response: Response,
    realm: string,
) => {
    const unauthorizedError = {
        errors: [
            {
                code: 'UNAUTHORIZED',
                message: 'Access is not authorized.',
            },
        ],
    };

    // response.setHeader(
    //     'Www-Authenticate',
    //     `realm="${realm}",service="${DOCKER_SERVICE}"`,
    // );

    response.status(401).send(JSON.stringify(unauthorizedError));
    return;
}
// #endregion module



// #region exports
export {
    sendUnauthorizedResponse,
};
// #endregion exports
