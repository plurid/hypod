// #region imports
    // #region external
    import {
        databaseType,
    } from '~server/data/constants';

    import {
        DatabaseType,
    } from '~server/data/interfaces';
    // #endregion external

    // #region internal
    import filesystemDatabase from './filesystem';
    import amazonDatabase from './amazon';
    import googleDatabase from './google';
    // #endregion internal
// #endregion imports



// #region module
class Database {
    private type: DatabaseType;

    constructor(
        type: DatabaseType,
    ) {
        this.type = type;
    }

    public get(
        entity: string,
        id: string,
    ) {
        switch (this.type) {
            case databaseType.filesystem:
                return filesystemDatabase.get(
                    entity,
                    id,
                );
            case databaseType.amazon:
                return amazonDatabase.get(
                    entity,
                    id,
                );
            case databaseType.google:
                return googleDatabase.get(
                    entity,
                    id,
                );
        }
    }

    public getAll(
        entity: string,
    ) {
        switch (this.type) {
            case databaseType.filesystem:
                return filesystemDatabase.getAll(
                    entity,
                );
            case databaseType.amazon:
                return amazonDatabase.getAll(
                    entity,
                );
            case databaseType.google:
                return googleDatabase.getAll(
                    entity,
                );
        }
    }

    public query(
        entity: string,
        field: string,
        value: string,
    ) {
        switch (this.type) {
            case databaseType.filesystem:
                return filesystemDatabase.query(
                    entity,
                    field,
                    value,
                );
            case databaseType.amazon:
                return amazonDatabase.query(
                    entity,
                    field,
                    value,
                );
            case databaseType.google:
                return googleDatabase.query(
                    entity,
                    field,
                    value,
                );
        }
    }

    public store(
        entity: string,
        id: string,
        data: any,
    ) {
        switch (this.type) {
            case databaseType.filesystem:
                return filesystemDatabase.store(
                    entity,
                    id,
                    data,
                );
            case databaseType.amazon:
                return amazonDatabase.store(
                    entity,
                    id,
                    data,
                );
            case databaseType.google:
                return googleDatabase.store(
                    entity,
                    id,
                    data,
                );
        }
    }

    public update(
        entity: string,
        id: string,
        field: string,
        value: any,
    ) {
        switch (this.type) {
            case databaseType.filesystem:
                return filesystemDatabase.update(
                    entity,
                    id,
                    field,
                    value,
                );
            case databaseType.amazon:
                return amazonDatabase.update(
                    entity,
                    id,
                    field,
                    value,
                );
            case databaseType.google:
                return googleDatabase.update(
                    entity,
                    id,
                    field,
                    value,
                );
        }
    }

    public obliterate(
        entity: string,
        id: string,
    ) {
        switch (this.type) {
            case databaseType.filesystem:
                return filesystemDatabase.obliterate(
                    entity,
                    id,
                );
            case databaseType.amazon:
                return amazonDatabase.obliterate(
                    entity,
                    id,
                );
            case databaseType.google:
                return googleDatabase.obliterate(
                    entity,
                    id,
                );
        }
    }
}
// #endregion module



// #region exports
export default Database;
// #endregion exports
