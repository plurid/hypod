// #region imports
    // #region libraries
    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        HypodLogic,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const hypodLogic: HypodLogic = {
    getCurrentOwner: async () => {
        return {
            id: uuid.generate(),
        };
    },
    getOwnerImagenes: async () => {
        return [];
    },
    obliterateOwnerImagene: async (
        id,
    ) => {
        return true;
    },
    obliterateOwnerImageneTag: async (
        id,
        tag,
    ) => {
        return true;
    },
};
// #endregion module



// #region exports
export default hypodLogic;
// #endregion exports
