// #region imports
    // #region external
    import {
        DatabaseTypeData,
        DatabaseTypeFilesystem,
        DatabaseTypeAmazon,
        DatabaseTypeGoogle,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const databaseTypeFilesystem: DatabaseTypeFilesystem = 'filesystem';
export const databaseTypeAmazon: DatabaseTypeAmazon = 'amazon';
export const databaseTypeGoogle: DatabaseTypeGoogle = 'google';

export const databaseType: DatabaseTypeData = {
    filesystem: databaseTypeFilesystem,
    amazon: databaseTypeAmazon,
    google: databaseTypeGoogle,
};
// #endregion module
