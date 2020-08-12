// #region imports
    // #region external
    import {
        Context,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const getCurrentOwner = async (
    context: Context,
) => {
    const {
        logic,
    } = context;

    if (logic?.getCurrentOwner) {
        const owner = await logic.getCurrentOwner();

        return {
            status: true,
            data: owner,
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
