// #region imports
    // #region external
    // import {
    //     imagenesPath,
    // } from '#server/data/constants';

    import {
        Context,
    } from '#server/data/interfaces';

    import {
        PRIVATE_USAGE,
    } from '#server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const deregisterImagene = async (
    id: string,
) => {
    try {
        return;
    } catch (error) {
        return;
    }
}


const obliterateImagene = async (
    input: any,
    context: Context,
) => {
    try {
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
    } catch (error) {
        return {
            status: false,
        };
    }
}
// #endregion module



// #region exports
export default obliterateImagene;
// #endregion exports
