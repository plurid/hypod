// #region imports
    // #region external
    import {
        DatabaseType,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
class Database {
    private type: DatabaseType;

    constructor(
        type: DatabaseType,
    ) {
        this.type = type;
    }

    public getData(
        type: string,
        id: string,
    ) {
        switch (this.type) {
            case 'filesystem':
                break;
            case 'amazon':
                break;
            case 'google':
                break;
        }
    }
}
// #endregion module



// #region exports
export default Database;
// #endregion exports
