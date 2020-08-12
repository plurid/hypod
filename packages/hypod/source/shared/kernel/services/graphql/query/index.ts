// #region imports
    // #region libraries
    import gql from 'graphql-tag';
    // #endregion libraries
// #endregion imports



// #region module
const GET_IMAGENES = gql`
    query GetImagenes {
        getImagenes {
            status
            data {
                id
                name
                latest
                tags
                size
                digest
            }
        }
    }
`;


const GET_CURRENT_OWNER = gql`
    query GetCurrentOwner {
        getCurrentOwner {
            status
            error {
                path
                type
                message
            }
            data {
                id
            }
        }
    }
`;
// #endregion module



// #region exports
export {
    GET_IMAGENES,
    GET_CURRENT_OWNER,
};
// #endregion exports
