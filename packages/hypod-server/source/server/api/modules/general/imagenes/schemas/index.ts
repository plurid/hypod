// #region imports
    // #region libraries
    import gql from 'graphql-tag';
    // #endregion libraries
// #endregion imports



// #region module
export const queries = gql`
    extend type Query {
        getImagenes: ResponseImagenes!
        identifyImagene(input: InputValueString!): ResponseImagene!
    }
`;


export const mutations = gql`
    extend type Mutation {
        obliterateImagene(input: InputValueString!): Response!
        obliterateImageneTag(input: InputObliterateImageneTag!): Response!
        togglePublicImagene(input: InputTogglePublicImagene!): Response!
    }
`;


export const types = gql`
    type ResponseImagenes {
        status: Boolean!
        error: Error
        data: [Imagene!]
    }

    type ResponseImagene {
        status: Boolean!
        error: Error
        data: Imagene
    }

    type Imagene {
        id: ID!
        name: String!
        latest: String!
        tags: [ImageneTag!]!
        isPublic: Boolean!
    }

    type ImageneTag {
        id: ID!
        generatedAt: Float!
        name: String!
        size: Float!
        digest: String!
    }
`;


export const inputs = gql`
    input InputObliterateImageneTag {
        imageneID: String!
        tagID: String!
    }

    input InputTogglePublicImagene {
        id: String!
        value: Boolean!
    }
`;
// #endregion module



// #region exports
export default gql`
    ${queries}
    ${mutations}
    ${types}
    ${inputs}
`;
// #endregion exports
