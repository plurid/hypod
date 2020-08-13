// #region imports
    // #region external
    import {
        Context,
    } from '#server/data/interfaces';

    import {
        PRIVATE_USAGE,
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
        return {
            status: false,
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
