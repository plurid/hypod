// #region imports
    // #region external
    import {
        DatabaseType,
        StorageType,
    } from '../interfaces';
    // #endregion external
// #endregion imports



// #region module
export const QUIET = process.env.HYPOD_QUIET ?? true;

export const DATABASE_TYPE = (process.env.HYPOD_DATABASE_TYPE as DatabaseType | undefined)
    || 'filesystem';

export const STORAGE_TYPE = (process.env.HYPOD_STORAGE_TYPE as StorageType | undefined)
    || 'filesystem';


export const DOCKER_REALM_BASE = process.env.HYPOD_DOCKER_REALM_BASE || '';
export const DOCKER_SERVICE = process.env.HYPOD_DOCKER_SERVICE || '';

export const PRIVATE_OWNER_IDENTONYM = process.env.HYPOD_PRIVATE_OWNER_IDENTONYM || '';
export const PRIVATE_OWNER_KEY = process.env.HYPOD_PRIVATE_OWNER_KEY || '';


/**
 * Filesystem root path.
 */
export const STORAGE_ROOT_PATH = process.env.HYPOD_STORAGE_ROOT_PATH || process.cwd();
// #endregion module
