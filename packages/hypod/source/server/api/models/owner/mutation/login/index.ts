// #region imports
    // #region external
    import {
        Context,
    } from '#server/data/interfaces';

    import {
        PRIVATE_USAGE,
        PRIVATE_OWNER_IDENTONYM,
        PRIVATE_OWNER_KEY,
    } from '#server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const login = async (
    input: any,
    context: Context,
) => {
    const {
        identonym,
        key,
    } = input;


    if (PRIVATE_USAGE) {
        if (
            identonym !== PRIVATE_OWNER_IDENTONYM
            || key !== PRIVATE_OWNER_KEY
        ) {
            // set cookie

            return {
                status: true,
            };
        }
    }

    return {
        status: false,
    };
}
// #endregion module



// #region exports
export default login;
// #endregion exports
