// #region imports
    // #region libraries
    import {
        Response,
    } from 'express';
    // #endregion libraries
// #endregion imports



// #region module
const unauthorizedError = {
    errors: [
        {
            code: 'UNAUTHORIZED',
            message: 'Access is not authorized.',
        },
    ],
};

const sendUnauthorizedResponse = (
    response: Response,
) => {
    response
        .status(401)
        .send(JSON.stringify(unauthorizedError));

    return;
}
// #endregion module



// #region exports
export {
    sendUnauthorizedResponse,
};
// #endregion exports
