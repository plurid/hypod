// #region imports
    // #region libraries
    import {
        Response,
    } from 'express';
    // #endregion libraries
// #endregion imports



// #region module
const sendUnauthorizedResponse = (
    response: Response,
) => {
    const unauthorizedError = {
        errors: [
            {
                code: 'UNAUTHORIZED',
                message: 'Access is not authorized.',
            },
        ],
    };

    response.status(401).send(JSON.stringify(unauthorizedError));
    return;
}
// #endregion module



// #region exports
export {
    sendUnauthorizedResponse,
};
// #endregion exports
