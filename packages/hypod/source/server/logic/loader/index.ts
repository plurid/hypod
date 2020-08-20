// #region imports
    // #region external
    import {
        Imagene,
    } from '#server/data/interfaces';

    import {
        BASE_PATH_METADATA_IMAGENES,
    } from '#server/data/constants';

    import {
        compareValues,
    } from '#server/utilities/general';

    import database from '#server/services/database';
    import storage from '#server/services/storage';
    // #endregion external
// #endregion imports



// #region module
export const loadImagenes = async () => {
    const imagenes: Imagene[] = await database.getAll('imagenes');

    const sortedImagenes = imagenes.sort(
        compareValues('name'),
    );

    return sortedImagenes;
}


const loadData = async () => {
    const imagenes = await loadImagenes();

    const data = {
        imagenes,
    };

    return data;
}
// #endregion module



// #region exports
export default loadData;
// #endregion exports
