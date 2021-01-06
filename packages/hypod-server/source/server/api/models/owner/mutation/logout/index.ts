// #region imports
    // #region external
    import {
        Context,
    } from '~server/data/interfaces';

    import {
        PRIVATE_USAGE,

        COOKIE_PRIVATE_TOKEN,
    } from '~server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const logout = async (
    context: Context,
) => {
    try {
        const {
            response,
        } = context;

        if (PRIVATE_USAGE) {
            response.cookie(
                COOKIE_PRIVATE_TOKEN,
                '',
                {
                    httpOnly: true,
                },
            );

            return {
                status: true,
            };
        }

        return {
            status: false,
        };
    } catch (error) {
        return {
            status: false,
        };
    }
}
// #endregion module



// #region exports
export default logout;
// #endregion exports
