// #region imports
    // #region libraries
    import {
        Request,
    } from 'express';
    // #endregion libraries


    // #region external
    import {
        COOKIE_PRIVATE_TOKEN,

        PRIVATE_TOKEN,
        PRIVATE_OWNER_IDENTONYM,
    } from '#server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const getPrivateOwner = (
    request: Request,
) => {
    const cookiePrivateToken = request.cookies[COOKIE_PRIVATE_TOKEN];

    const token = Buffer
        .from(cookiePrivateToken, 'base64')
        .toString('utf-8');

    if (token !== PRIVATE_TOKEN) {
        return PRIVATE_OWNER_IDENTONYM;
    }

    return;
}
// #endregion module



// #region exports
export {
    getPrivateOwner,
};
// #endregion exports
