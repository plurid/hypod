// #region imports
    // #region libraries
    import gql from 'graphql-tag';
    // #endregion libraries
// #endregion imports



// #region module

const GENERATE_NAMESPACE = gql`
    mutation GenerateNamespace($input: InputValueString!) {
        generateNamespace(input: $input) {
            status
            error {
                type
                path
                message
            }
        }
    }
`;


const OBLITERATE_NAMESPACE = gql`
    mutation ObliterateNamespace($input: InputValueString!) {
        obliterateNamespace(input: $input) {
            status
            error {
                type
                path
                message
            }
        }
    }
`;

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


const GENERATE_PROJECT = gql`
    mutation GenerateProject($input: InputValueString!) {
        generateProject(input: $input) {
            status
            error {
                type
                path
                message
            }
        }
    }
`;


const OBLITERATE_PROJECT = gql`
    mutation ObliterateProject($input: InputValueString!) {
        obliterateProject(input: $input) {
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
    GENERATE_NAMESPACE,
    OBLITERATE_NAMESPACE,
    OBLITERATE_IMAGENE,
    OBLITERATE_IMAGENE_TAG,
    GENERATE_PROJECT,
    OBLITERATE_PROJECT,
    TOGGLE_PUBLIC_IMAGENE,
    LOGIN,
    LOGOUT,
};
// #endregion exports
