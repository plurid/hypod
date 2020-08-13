// #region imports
    // #region external
    import {
        Context,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const getImagenes = async (
    context: Context,
) => {
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

    return {
        status: true,
        data: [
            ...imagenes,
        ],
    };
}
// #endregion module



// #region exports
export default getImagenes;
// #endregion exports
