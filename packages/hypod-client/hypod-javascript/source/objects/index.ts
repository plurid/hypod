// #region imports
    // #region external
    import {
        IMAGENE_OBLITERATE,
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
) => {
    const hypod = new Hypod(
        endpoint,
        token,
    );

    return {
        imagene: {
            obliterate: async (
                name: string,
            ) => {
                const result = await hypod.execute(
                    {
                        value: name,
                    },
                    IMAGENE_OBLITERATE,
                    'hypodMutationImageneObliterate',
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
