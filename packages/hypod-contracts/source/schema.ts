export const typeDefs = /* GraphQL */ `
  type Query {
    getImagenes: ResponseImagenes!
    identifyImagene(input: InputValueString!): ResponseImagene!
    getNamespaces: ResponseNamespaces!
    getProjects: ResponseProjects!
    getCurrentOwner: ResponseOwner!
    getUsageType: ResponseUsageType!
  }

  type Mutation {
    obliterateImagene(input: InputValueString!): Response!
    obliterateImageneTag(input: InputObliterateImageneTag!): Response!
    togglePublicImagene(input: InputTogglePublicImagene!): Response!
    registerNamespace(input: InputValueString!): Response!
    obliterateNamespace(input: InputValueString!): Response!
    generateProject(input: InputValueString!): Response!
    obliterateProject(input: InputValueString!): Response!
    setProjectNamespace(input: InputSetProjectNamespace!): ResponseProject!
    setImageneProject(input: InputSetImageneProject!): ResponseImagene!
    login(input: InputLogin!): ResponseOwner!
    logout: Response!
  }

  type Error {
    path: String!
    type: String!
    message: String!
  }

  type Response {
    status: Boolean!
    error: Error
  }

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

  type ResponseNamespaces {
    status: Boolean!
    error: Error
    data: [Namespace!]
  }

  type ResponseProjects {
    status: Boolean!
    error: Error
    data: [Project!]
  }

  type ResponseProject {
    status: Boolean!
    error: Error
    data: Project
  }

  type ResponseOwner {
    status: Boolean!
    error: Error
    data: Owner
  }

  type ResponseUsageType {
    status: Boolean!
    error: Error
    data: String!
  }

  type Owner {
    id: ID!
    namespaces: [Namespace!]
    projects: [Project!]
    imagenes: [Imagene!]
  }

  type Namespace {
    id: ID!
    name: String!
    generatedAt: Float!
    generatedBy: String!
  }

  type Project {
    id: ID!
    name: String!
    generatedAt: Float!
    generatedBy: String!
    namespaceID: ID
  }

  type Imagene {
    id: ID!
    generatedAt: Float!
    name: String!
    latest: String!
    tags: [ImageneTag!]!
    isPublic: Boolean!
    projectID: ID
  }

  type ImageneTag {
    id: ID!
    generatedAt: Float!
    name: String!
    size: Float!
    digest: String!
  }

  input InputValueString {
    value: String!
  }

  input InputLogin {
    identonym: String!
    key: String!
  }

  input InputObliterateImageneTag {
    imageneID: String!
    tagID: String!
  }

  input InputTogglePublicImagene {
    id: String!
    value: Boolean!
  }

  input InputSetProjectNamespace {
    projectID: ID!
    namespaceID: ID
  }

  input InputSetImageneProject {
    imageneID: ID!
    projectID: ID
  }
`;
