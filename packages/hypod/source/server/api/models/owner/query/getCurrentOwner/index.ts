// #region imports
    // #region external
    import {
        Context,
    } from '#server/data/interfaces';

    import {
        PRIVATE_USAGE,
        PRIVATE_TOKEN,

        COOKIE_PRIVATE_TOKEN,
    } from '#server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const getCurrentOwner = async (
    context: Context,
) => {
    const {
        request,
    } = context;

    const logic = request.hypodLogic;

    if (logic) {
        const owner = await logic.getCurrentOwner();

        return {
            status: true,
            data: owner,
        };
    }

    if (PRIVATE_USAGE) {
        console.log('request.cookies', request.cookies);

        const cookiePrivateToken = request.cookies[COOKIE_PRIVATE_TOKEN];

        const token = Buffer
            .from(cookiePrivateToken, 'base64')
            .toString('utf-8');

        console.log('cookiePrivateToken', cookiePrivateToken);
        console.log('token', token);

        if (token !== PRIVATE_TOKEN) {
            return {
                status: false,
            };
        }

        return {
            status: true,
        };
    }

    return {
        status: false,
    };
}
// #endregion module



// #region exports
export default getCurrentOwner;
// #endregion exports
