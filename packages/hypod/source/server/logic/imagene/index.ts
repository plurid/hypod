// #region imports
    // #region external
    import {
        BASE_PATH_METADATA,
    } from '#server/data/constants';

    import {
        Imagene,
    } from '#server/data/interfaces';

    import storage from '#server/services/storage';
    // #endregion external
// #endregion imports



// #region module
export const registerImagene = async (
    data: Imagene,
) => {
    const metadataPath = BASE_PATH_METADATA + data.id;

    const buffer = Buffer.from(JSON.stringify(data, null, 4));

    await storage.upload(
        metadataPath,
        buffer,
    );
}


export const deregisterImagene = async (
    id: string,
) => {
    const metadataPath = BASE_PATH_METADATA + id;

    await storage.obliterate(
        metadataPath,
    );
}
// #endregion module
