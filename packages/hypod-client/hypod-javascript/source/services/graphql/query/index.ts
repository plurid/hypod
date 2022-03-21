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
                generatedAt
                name
                latest
                tags {
                    id
                    generatedAt
                    name
                    size
                    digest
                }
                isPublic
            }
        }
    }
`;
// #endregion module
