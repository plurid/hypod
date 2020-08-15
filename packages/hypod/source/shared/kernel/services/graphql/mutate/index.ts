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


const TOGGLE_PUBLIC_IMAGENE = gql`
    mutation TogglePublicImagene($input: InputTogglePublicImagene!) {
        togglePublicImagene(input: $input) {
            status
            error {
                type
                path
                message
            }
        }
    }
`;


const LOGIN = gql`
    mutation Login($input: InputLogin!) {
        login(input: $input) {
            status
            error {
                type
                path
                message
            }
            data {
                id
            }
        }
    }
`;


const LOGOUT = gql`
    mutation Logout {
        logout {
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
    TOGGLE_PUBLIC_IMAGENE,
    LOGIN,
    LOGOUT,
};
// #endregion exports
