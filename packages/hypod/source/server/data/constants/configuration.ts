// #region imports
import {
    StorageType,
} from '../interfaces';
// #endregion imports



// #region module
export const STORAGE_TYPE = (process.env.HYPOD_STORAGE_TYPE as StorageType | undefined)
    || 'filesystem';

/**
 * Filesystem root path.
 */
export const STORAGE_ROOT_PATH = process.env.HYPOD_STORAGE_ROOT_PATH || process.cwd();
// #endregion module
