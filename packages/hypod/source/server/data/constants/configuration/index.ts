// #region imports
    // #region external
    import {
        DatabaseType,
        StorageType,

        HypodFeatures,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const LOG_LEVEL = process.env.HYPOD_LOG_LEVEL || '7';
export const QUIET = process.env.HYPOD_QUIET === 'true';


export const LOG_LEVEL_NONE = 7;
export const LOG_LEVEL_FATAL = 6;
export const LOG_LEVEL_ERROR = 5;
export const LOG_LEVEL_WARN = 4;
export const LOG_LEVEL_INFO = 3;
export const LOG_LEVEL_DEBUG = 2;
export const LOG_LEVEL_TRACE = 1;
export const LOG_LEVEL_ALL = 0;

export const logLevels = {
    none: LOG_LEVEL_NONE,
    all: LOG_LEVEL_ALL,
    fatal: LOG_LEVEL_FATAL,
    error: LOG_LEVEL_ERROR,
    warn: LOG_LEVEL_WARN,
    info: LOG_LEVEL_INFO,
    debug: LOG_LEVEL_DEBUG,
    trace: LOG_LEVEL_TRACE,
};

export const logLevel = QUIET
    ? 0
    : parseInt(LOG_LEVEL);



export const DATABASE_TYPE = (process.env.HYPOD_DATABASE_TYPE as DatabaseType | undefined)
    || 'filesystem';

export const STORAGE_TYPE = (process.env.HYPOD_STORAGE_TYPE as StorageType | undefined)
    || 'filesystem';


export const DOCKER_REALM_BASE = process.env.HYPOD_DOCKER_REALM_BASE || '';
export const DOCKER_SERVICE = process.env.HYPOD_DOCKER_SERVICE || '';


export const CUSTOM_LOGIC_USAGE = process.env.PERFORMER_CUSTOM_LOGIC_USAGE === 'true';


export const PRIVATE_USAGE = process.env.HYPOD_PRIVATE_USAGE
    ? process.env.HYPOD_PRIVATE_USAGE === 'true'
    : false;
export const PRIVATE_OWNER_IDENTONYM = process.env.HYPOD_PRIVATE_OWNER_IDENTONYM || '';
export const PRIVATE_OWNER_KEY = process.env.HYPOD_PRIVATE_OWNER_KEY || '';
export const PRIVATE_TOKEN = process.env.HYPOD_PRIVATE_TOKEN || '';


export const USE_NAMESPACES = process.env.HYPOD_USE_NAMESPACES === 'true';
export const USE_PROJECTS = process.env.HYPOD_USE_PROJECTS === 'true';

export const hypodFeatures: HypodFeatures = {
    namespaces: USE_NAMESPACES,
    projects: USE_PROJECTS,
};


/**
 * Filesystem root path.
 */
export const STORAGE_ROOT_PATH = process.env.HYPOD_STORAGE_ROOT_PATH || process.cwd();
// #endregion module
