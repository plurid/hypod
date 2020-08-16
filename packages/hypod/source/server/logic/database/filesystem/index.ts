// #region imports
    // #region external
    import {
        Database,
        DatabaseGet,
        DatabaseQuery,
        DatabaseStore,
        DatabaseUpdate,
        DatabaseObliterate,

        Imagene,
    } from '#server/data/interfaces';

    import {
        BASE_PATH_METADATA,
    } from '#server/data/constants';

    import filesystemStorage from '#server/logic/storage/filesystem';
    // #endregion external
// #endregion imports



// #region module
const get: DatabaseGet = async (
    entity,
    id,
) => {
    return;
}


const query: DatabaseQuery = async (
    entity,
    field,
    value,
) => {
    switch (entity) {
        case 'imagene': {
            const imagenes: Imagene[] = await filesystemStorage.downloadAll(BASE_PATH_METADATA) || [];
            const imagene = imagenes.find(imagene => imagene[field] === value);

            return imagene;
        }
    }


    return;
}


const store: DatabaseStore = async (
    entity,
    id,
    data,
) => {
    switch (entity) {
        case 'imagene': {
            const filepath = BASE_PATH_METADATA + id;

            await filesystemStorage.upload(
                filepath,
                Buffer.from(JSON.stringify(data, null, 4), 'utf-8'),
            );

            return true;
        }
    }

    return;
}


const update: DatabaseUpdate = async (
    entity,
    id,
    field,
    value,
) => {
    switch (entity) {
        case 'imagene': {
            const filepath = BASE_PATH_METADATA + id;

            const imageneData = await filesystemStorage.download(filepath);

            if (!imageneData) {
                return;
            }

            const imagene = JSON.parse(imageneData);

            imagene[field] = value;

            await filesystemStorage.upload(
                filepath,
                Buffer.from(JSON.stringify(imagene, null, 4), 'utf-8'),
            );

            return true;
        }
    }

    return;
}


const obliterate: DatabaseObliterate = async (
    entity,
    id,
) => {
    switch (entity) {
        case 'imagene': {
            const filepath = BASE_PATH_METADATA + id;

            await filesystemStorage.obliterate(
                filepath,
            );
        }
    }

    return;
}


const filesystemDatabase: Database = {
    get,
    query,
    store,
    update,
    obliterate,
};
// #endregion module



// #region exports
export default filesystemDatabase;
// #endregion exports
