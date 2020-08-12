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
// #endregion module



// #region exports
export {
    OBLITERATE_IMAGENE,
};
// #endregion exports
