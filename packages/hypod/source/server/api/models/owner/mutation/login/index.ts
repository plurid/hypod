// #region imports
    // #region external
    import {
        Context,
    } from '#server/data/interfaces';

    import {
        PRIVATE_USAGE,
        PRIVATE_OWNER_IDENTONYM,
        PRIVATE_OWNER_KEY,
        PRIVATE_TOKEN,

        COOKIE_PRIVATE_TOKEN,
    } from '#server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const login = async (
    input: any,
    context: Context,
) => {
    try {
        const {
            response,
        } = context;

        const {
            identonym,
            key,
        } = input;

        if (PRIVATE_USAGE) {
            if (
                identonym === PRIVATE_OWNER_IDENTONYM
                && key === PRIVATE_OWNER_KEY
            ) {
                const base64Token = Buffer
                    .from(PRIVATE_TOKEN)
                    .toString('base64');

                response.cookie(
                    COOKIE_PRIVATE_TOKEN,
                    base64Token,
                    {
                        httpOnly: true,
                    },
                );

                return {
                    status: true,
                };
            }
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
export default login;
// #endregion exports
