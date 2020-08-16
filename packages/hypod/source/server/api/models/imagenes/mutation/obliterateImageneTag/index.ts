// #region imports
    // #region external
    import {
        PRIVATE_USAGE,
    } from '#server/data/constants';

    import {
        Context,
    } from '#server/data/interfaces';

    import {
        deregisterImageneTag,
    } from '#server/logic/imagene';

    import {
        getPrivateOwner,
    } from '#server/logic/privateUsage';
    // #endregion external
// #endregion imports



// #region module
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

        if (PRIVATE_USAGE) {
            const privateOwnerIdentonym = getPrivateOwner(request);

            if (!privateOwnerIdentonym) {
                return {
                    status: false,
                };
            }

            await deregisterImageneTag(
                imageneID,
                tagID,
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
export default obliterateImageneTag;
// #endregion exports
