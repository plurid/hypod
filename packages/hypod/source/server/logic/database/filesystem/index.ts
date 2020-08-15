// #region imports
    // #region external
    import {
        Database,
        DatabaseGet,
        DatabaseStore,
        DatabaseUpdate,
        DatabaseObliterate,
    } from '#server/data/interfaces';
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
) => {
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
