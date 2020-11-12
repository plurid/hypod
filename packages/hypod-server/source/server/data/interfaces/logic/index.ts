// #region imports
    // #region external
    import {
        Imagene,
        HypodOwner,
        OwnerToken,
    } from '../general';

    import {
        Logger,
    } from '../logger';
    // #endregion external
// #endregion imports



// #region module
export interface HypodLogic {
    getCurrentOwner: () => Promise<HypodOwner>;
    getOwnerImagenes: () => Promise<Imagene[]>;
    getOwnerCatalog: () => Promise<any>;
    obliterateOwnerImagene: (
        id: string,
    ) => Promise<boolean>;
    obliterateOwnerImageneTag: (
        id: string,
        tag: string,
    ) => Promise<boolean>;
    checkOwnerCanPush: () => Promise<boolean>;
    checkOwnerCanPull: () => Promise<boolean>;
    checkOwnerToken: (
        token: string,
    ) => Promise<boolean>;
    getOwnerToken: (
        identonym: string,
        key: string,
    ) => Promise<OwnerToken>;
    logger: Logger;
}
// #endregion module
