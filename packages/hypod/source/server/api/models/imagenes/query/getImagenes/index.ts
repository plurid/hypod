// #region imports
import {
    Context,
} from '#server/data/interfaces';
// #endregion imports



// #region module
const getImagenes = async (
    context: Context,
) => {
    const {
        imagenes,
    } = context;

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
