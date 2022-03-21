// #region imports
    // #region libraries
    import {
        gql,
    } from '@apollo/client/core';
    // #endregion libraries
// #endregion imports



// #region module
export const OBLITERATE_IMAGENE = gql`
    mutation ObliterateImagene($input: InputValueString!) {
        obliterateImagene(input: $input) {
            status
        }
    }
`;

export const OBLITERATE_IMAGENE_TAG = gql`
    mutation ObliterateImageneTag($input: InputObliterateImageneTag!) {
        obliterateImageneTag(input: $input) {
            status
        }
    }
`;

export const TOGGLE_PUBLIC_IMAGENE = gql`
    mutation TogglePublicImagene($input: InputTogglePublicImagene!) {
        togglePublicImagene(input: $input) {
            status
        }
    }
`;
// #endregion module
