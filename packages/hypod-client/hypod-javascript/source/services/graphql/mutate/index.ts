// #region imports
    // #region libraries
    import {
        gql,
    } from '@apollo/client/core';
    // #endregion libraries
// #endregion imports



// #region module
const IMAGENE_OBLITERATE = gql`
    mutation HypodMutationImageneObliterate($input: InputValueString!) {
        hypodMutationImageneObliterate(input: $input) {
            status
        }
    }
`;
// #endregion module



// #region exports
export {
    IMAGENE_OBLITERATE,
};
// #endregion exports
