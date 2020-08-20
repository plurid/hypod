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
                namespaces {
                    id
                    name
                    generatedAt
                    generatedBy
                }
                projects {
                    id
                    name
                    generatedAt
                    generatedBy
                }
                imagenes {
                    id
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
    }
`;


const GET_USAGE_TYPE = gql`
    query GetUsageType {
        getUsageType {
            status
            error {
                path
                type
                message
            }
            data
        }
    }
`;
// #endregion module



// #region exports
export {
    GET_IMAGENES,
    GET_CURRENT_OWNER,
    GET_USAGE_TYPE,
};
// #endregion exports
