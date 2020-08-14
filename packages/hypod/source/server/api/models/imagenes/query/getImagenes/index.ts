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
const getImagenes = async (
    context: Context,
) => {
    try {
        const {
            imagenes,
            request,
        } = context;

        const logic = request.hypodLogic;

        if (logic) {
            const imagenes = await logic.getOwnerImagenes();

            return {
                status: true,
                data: [
                    ...imagenes,
                ],
            };
        }

        if (PRIVATE_USAGE) {
            return {
                status: true,
                data: [
                    ...imagenes,
                ],
            };
        }

        return {
            status: true,
            data: [
                ...imagenes,
            ],
        };
    } catch (error) {
        return {
            status: false,
        };
    }
}
// #endregion module



// #region exports
export default getImagenes;
// #endregion exports
