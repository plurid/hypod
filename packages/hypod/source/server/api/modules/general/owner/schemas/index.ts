// #region imports
    // #region libraries
    import gql from 'graphql-tag';
    // #endregion libraries
// #endregion imports



// #region module
export const queries = gql`
    extend type Query {
        getCurrentOwner: ResponseOwner!
        getUsageType: ResponseUsageType!
    }
`;


export const types = gql`
    type ResponseOwner {
        status: Boolean!
        error: Error
        data: Owner
    }

    type Owner {
        id: ID!
    }

    type ResponseUsageType {
        status: Boolean!
        error: Error
        data: String!
    }
`;
// #endregion module



// #region exports
export default gql`
    ${queries}
    ${types}
`;
// #endregion exports
