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
        return [
            // {
            //     id: 'one',
            //     digest: 'sha:2567902',
            //     latest: 'latest',
            //     name: 'one',
            //     size: 234,
            //     tags: [
            //         'latest',
            //     ],
            // },
        ];
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
    checkOwnerCanPush: async (
        // id,
        // tag,
    ) => {
        return true;
    },
    checkOwnerCanPull: async (
        // id,
        // tag,
    ) => {
        return true;
    },
    checkOwnerToken: async (
        token: string,
    ) => {
        if (!token) {
            return false;
        }

        return true;
    },
    getOwnerToken: async (
        identonym,
        key,
    ) => {
        return {
            token: 'owner-token',
            issued_at: new Date(),
            expires_in: 3600,
        };
    },
};
// #endregion module



// #region exports
export default hypodLogic;
// #endregion exports
