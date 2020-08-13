// #region imports
    // #region external
    // import {
    //     imagenesPath,
    // } from '#server/data/constants';

    import {
        Context,
    } from '#server/data/interfaces';

    import {
        privateUsage,
    } from '#server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const deregisterImagene = async (
    id: string,
) => {
    try {

    } catch (error) {
        return;
    }
}


const obliterateImagene = async (
    input: any,
    context: Context,
) => {
    const {
        request,
    } = context;

    const logic = request.hypodLogic;

    const {
        value
    } = input;

    if (logic) {
        const status = await logic.obliterateOwnerImagene(
            value,
        );

        return {
            status,
        };
    }

    await deregisterImagene(value);

    return {
        status: true,
    };
}
// #endregion module



// #region exports
export default obliterateImagene;
// #endregion exports
