// #region imports
    // #region libraries
    import {
        graphql,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        HypodOptions,
    } from '~data/interfaces';

    import {
        IDENTIFY_IMAGENE,
    } from '~services/graphql/query';

    import {
        OBLITERATE_IMAGENE,
        OBLITERATE_IMAGENE_TAG,
        TOGGLE_PUBLIC_IMAGENE,
    } from '~services/graphql/mutate';
    // #endregion external


    // #region internal
    import Hypod from './Hypod';
    // #endregion internal
// #endregion imports



// #region module
const HypodTree = (
    endpoint: string,
    token: string,
    options: HypodOptions,
) => {
    const hypod = new Hypod(
        endpoint,
        token,
        options,
    );

    return {
        imagene: {
            identify: async (
                name: string,
            ) => {
                const result = await hypod.query(
                    {
                        value: name,
                    },
                    IDENTIFY_IMAGENE,
                    'identifyImagene',
                );

                if (!result || !result.status) {
                    return;
                }

                return graphql.deleteTypenames(result.data);
            },
            obliterate: async (
                id: string,
            ) => {
                const result = await hypod.execute(
                    {
                        value: id,
                    },
                    OBLITERATE_IMAGENE,
                    'obliterateImagene',
                );

                return result.status as boolean;
            },
            removeTag: async (
                imageneID: string,
                tagID: string,
            ) => {
                const result = await hypod.execute(
                    {
                        imageneID,
                        tagID,
                    },
                    OBLITERATE_IMAGENE_TAG,
                    'obliterateImageneTag',
                );

                return result.status as boolean;
            },
            togglePublic: async (
                id: string,
                isPublic: boolean,
            ) => {
                const result = await hypod.execute(
                    {
                        id,
                        value: isPublic,
                    },
                    TOGGLE_PUBLIC_IMAGENE,
                    'togglePublicImagene',
                );

                return result.status as boolean;
            },
        },
    };
}
// #endregion module



// #region exports
export default HypodTree;
// #endregion exports
