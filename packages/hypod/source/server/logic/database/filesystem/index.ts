// #region imports
    // #region external
    import {
        Database,
        DatabaseGet,
        DatabaseStore,
        DatabaseUpdate,
        DatabaseObliterate,
    } from '#server/data/interfaces';

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


const store: DatabaseStore = async (
    entity,
    id,
    data,
) => {
    switch (entity) {
        case 'metadata':
            // filesystemStorage.upload(
            //     '',
            //     '',
            // );
            break;
    }

    return;
}


const update: DatabaseUpdate = async (
    entity,
    id,
    field,
    value,
) => {
    return;
}


const obliterate: DatabaseObliterate = async (
    entity,
    id,
) => {
    return;
}


const filesystemDatabase: Database = {
    get,
    store,
    update,
    obliterate,
};
// #endregion module



// #region exports
export default filesystemDatabase;
// #endregion exports
