// #region imports
    // #region libraries
    import gql from 'graphql-tag';
    // #endregion libraries
// #endregion imports



// #region module
export const queries = gql`
    extend type Query {
        getProjects: ResponseProjects!
    }
`;


export const mutations = gql`
    extend type Mutation {
        generateProject(input: InputValueString!): Response!
        obliterateProject(input: InputValueString!): Response!
    }
`;


export const types = gql`
    type ResponseProjects {
        status: Boolean!
        error: Error
        data: [Project!]
    }

    type Project {
        id: String!
        name: String!
        generatedAt: Int!
        generatedBy: String!
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
