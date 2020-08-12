// #region imports
    // #region libraries
    import gql from 'graphql-tag';
    // #endregion libraries
// #endregion imports



// #region module
const OBLITERATE_IMAGENE = gql`
    mutation ObliterateImagene($input: InputValueString!) {
        obliterateImagene(input: $input) {
            status
            error {
                type
                path
                message
            }
        }
    }
`;


const OBLITERATE_IMAGENE_TAG = gql`
    mutation ObliterateImageneTag($input: InputObliterateImageneTag!) {
        obliterateImageneTag(input: $input) {
            status
            error {
                type
                path
                message
            }
        }
    }
`;
// #endregion module



// #region exports
export {
    OBLITERATE_IMAGENE,
    OBLITERATE_IMAGENE_TAG,
};
// #endregion exports
