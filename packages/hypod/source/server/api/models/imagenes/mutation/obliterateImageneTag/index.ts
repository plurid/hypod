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
const deregisterImageneTag = async (
    id: string,
    tag: string,
) => {
    try {
        return;
    } catch (error) {
        return;
    }
}


const obliterateImageneTag = async (
    input: any,
    context: Context,
) => {
    try {
        const {
            request,
        } = context;

        const logic = request.hypodLogic;

        const {
            imageneID,
            tagID,
        } = input;

        if (logic) {
            const status = await logic.obliterateOwnerImageneTag(
                imageneID,
                tagID,
            );

            return {
                status,
            };
        }

        await deregisterImageneTag(
            imageneID,
            tagID,
        );

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
export default obliterateImageneTag;
// #endregion exports
