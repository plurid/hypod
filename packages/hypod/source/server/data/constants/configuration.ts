// #region imports
import {
    StorageType,
} from '../interfaces';
// #endregion imports



// #region module
export const STORAGE_TYPE = (process.env.HYPOD_STORAGE_TYPE as StorageType | undefined)
    || 'filesystem';
// #endregion module
