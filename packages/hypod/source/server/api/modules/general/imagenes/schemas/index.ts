// #region imports
import gql from 'graphql-tag';
// #endregion imports



// #region module
export const queries = gql`
    extend type Query {
        getImagenes: ResponseImagenes!
    }
`;


export const mutations = gql`
    extend type Mutation {
        obliterateImagene(input: InputValueString!): Response!
    }
`;


export const inputs = gql`
    input InputValueString {
        value: String!
    }
`;


export const types = gql`
    type ResponseImagenes {
        status: Boolean!
        error: Error
        data: [Imagene!]
    }

    type Imagene {
        id: String!
        name: String!
        latest: String!
        tags: [String!]!
        size: Float!
        digest: String!
    }
`;
// #endregion module



// #region exports
export default gql`
    ${queries}
    ${mutations}
    ${inputs}
    ${types}
`;
// #endregion exports
