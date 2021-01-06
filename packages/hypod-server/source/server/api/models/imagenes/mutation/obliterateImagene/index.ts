// #region imports
    // #region external
    import {
        Context,
    } from '~server/data/interfaces';

    import {
        PRIVATE_USAGE,
    } from '~server/data/constants';

    import {
        deregisterImagene,
    } from '~server/logic/imagene';

    import {
        getPrivateOwner,
    } from '~server/logic/privateUsage';
    // #endregion external
// #endregion imports



// #region module
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

        if (PRIVATE_USAGE) {
            const privateOwnerIdentonym = getPrivateOwner(request);

            if (!privateOwnerIdentonym) {
                return {
                    status: false,
                };
            }

            await deregisterImagene(value);
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
export default obliterateImagene;
// #endregion exports
