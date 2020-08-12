// #region imports
    // #region external
    import {
        StorageType,
    } from '../interfaces';
    // #endregion external
// #endregion imports



// #region module
export const QUIET = process.env.HYPOD_QUIET ?? true;

export const STORAGE_TYPE = (process.env.HYPOD_STORAGE_TYPE as StorageType | undefined)
    || 'filesystem';

/**
 * Filesystem root path.
 */
export const STORAGE_ROOT_PATH = process.env.HYPOD_STORAGE_ROOT_PATH || process.cwd();
// #endregion module
