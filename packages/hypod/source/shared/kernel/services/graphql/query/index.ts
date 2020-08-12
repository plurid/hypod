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
// #endregion module



// #region exports
export {
    GET_IMAGENES,
};
// #endregion exports
