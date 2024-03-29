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
    } from '~server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const getPrivateOwnerFromCookies = (
    request: Request,
) => {
    try {
        const cookiePrivateToken = request.cookies[COOKIE_PRIVATE_TOKEN];

        const token = Buffer
            .from(cookiePrivateToken, 'base64')
            .toString('utf-8');

        if (token !== PRIVATE_TOKEN) {
            return;
        }

        return PRIVATE_OWNER_IDENTONYM;
    } catch (error) {
        return;
    }
}


const getPrivateOwnerFromHeader = (
    request: Request,
) => {
    try {
        const header = request.header('Authorization');
        if (!header) {
            return;
        }

        const tokenValue = header.replace('Bearer ', '');
        if (tokenValue !== PRIVATE_OWNER_IDENTONYM + ':' + PRIVATE_TOKEN) {
            return;
        }

        return PRIVATE_OWNER_IDENTONYM;
    } catch (error) {
        return;
    }
}


const getPrivateOwner = (
    request: Request,
) => {
    try {
        const cookieOwner = getPrivateOwnerFromCookies(request);
        if (cookieOwner) {
            return cookieOwner;
        }

        const headerOwner = getPrivateOwnerFromHeader(request);
        if (headerOwner) {
            return headerOwner;
        }

        return;
    } catch (error) {
        return;
    }
}
// #endregion module



// #region exports
export {
    getPrivateOwner,
};
// #endregion exports
