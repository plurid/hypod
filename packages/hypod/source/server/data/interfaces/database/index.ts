export type DatabaseType =
    | DatabaseTypeFilesystem
    | DatabaseTypeAmazon
    | DatabaseTypeGoogle;

export type DatabaseTypeFilesystem = 'filesystem';
export type DatabaseTypeAmazon = 'amazon';
export type DatabaseTypeGoogle = 'google';

export interface DatabaseTypeData {
    filesystem: DatabaseTypeFilesystem;
    amazon: DatabaseTypeAmazon;
    google: DatabaseTypeGoogle;
}


export interface Database {
    get: DatabaseGet;
    query: DatabaseQuery;
    store: DatabaseStore;
    update: DatabaseUpdate;
    obliterate: DatabaseObliterate;
}

export type DatabaseGet = (
    entity: string,
    id: string,
) => Promise<any>;

export type DatabaseQuery = (
    entity: string,
    field: string,
    value: string,
) => Promise<any>;

export type DatabaseStore = (
    entity: string,
    id: string,
    data: any,
) => Promise<any>;

export type DatabaseUpdate = (
    entity: string,
    id: string,
    field: string,
    value: any,
) => Promise<any>;

export type DatabaseObliterate = (
    entity: string,
    id: string,
) => Promise<any>;
