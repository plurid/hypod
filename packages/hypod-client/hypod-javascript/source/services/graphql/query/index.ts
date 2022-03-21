// #region imports
    // #region libraries
    import {
        gql,
    } from '@apollo/client/core';
    // #endregion libraries
// #endregion imports



// #region module
export const IDENTIFY_IMAGENE = gql`
    query IdentifyImagene($input: InputValueString!) {
        identifyImagene(input: $input) {
            status
            data {
                id
                tags {
                    id
                    name
                }
            }
        }
    }
`;
// #endregion module
