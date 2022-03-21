// #region imports
    // #region external
    import {
        Context,
        InputValueString,
        Imagene,
    } from '~server/data/interfaces';

    import {
        PRIVATE_USAGE,
    } from '~server/data/constants';

    import {
        getPrivateOwner,
    } from '~server/logic/privateUsage';
    // #endregion external
// #endregion imports



// #region module
const identifyImagene = async (
    input: InputValueString,
    context: Context,
) => {
    try {
        const {
            imagenes,
            request,
        } = context;

        const {
            value,
        } = input;

        const logic = request.hypodLogic;

        const findImagene = (
            imagenes: Imagene[],
        ) => {
            const imagene = imagenes.find(img => img.name === value);
            if (!imagene) {
                return {
                    status: false,
                };
            }

            return {
                status: true,
                data: imagene,
            };
        }


        if (logic) {
            const imagenes = await logic.getOwnerImagenes();
            return findImagene(imagenes);
        }


        if (PRIVATE_USAGE) {
            const privateOwnerIdentonym = getPrivateOwner(request);
            if (!privateOwnerIdentonym) {
                return {
                    status: false,
                };
            }

            return findImagene(imagenes);
        }


        return findImagene(imagenes);
    } catch (error) {
        return {
            status: false,
        };
    }
}
// #endregion module



// #region exports
export default identifyImagene;
// #endregion exports
