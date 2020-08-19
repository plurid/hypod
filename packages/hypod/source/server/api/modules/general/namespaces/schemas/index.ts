// #region imports
    // #region libraries
    import gql from 'graphql-tag';
    // #endregion libraries
// #endregion imports



// #region module
export const queries = gql`
    extend type Query {
        getNamespaces: ResponseNamespaces!
    }
`;


export const mutations = gql`
    extend type Mutation {
        registerNamespace(input: InputValueString!): Response!
        obliterateNamespace(input: InputValueString!): Response!
    }
`;


export const types = gql`
    type ResponseNamespaces {
        status: Boolean!
        error: Error
        data: [Namespace!]
    }

    type Namespace {
        id: String!
        name: String!
    }
`;
// #endregion module



// #region exports
export default gql`
    ${queries}
    ${mutations}
    ${types}
`;
// #endregion exports
