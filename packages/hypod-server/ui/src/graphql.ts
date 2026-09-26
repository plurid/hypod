import { gql } from '@apollo/client';

export const GET_IMAGENES = gql`
  query GetImagenes {
    getImagenes {
      status
      error {
        path
        type
        message
      }
      data {
        id
        generatedAt
        name
        latest
        isPublic
        projectID
        tags {
          id
          generatedAt
          name
          size
          digest
        }
      }
    }
  }
`;

export const GET_NAMESPACES = gql`
  query GetNamespaces {
    getNamespaces {
      status
      error {
        path
        type
        message
      }
      data {
        id
        name
        generatedAt
        generatedBy
      }
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects {
    getProjects {
      status
      error {
        path
        type
        message
      }
      data {
        id
        name
        generatedAt
        generatedBy
        namespaceID
      }
    }
  }
`;

export const GET_OWNER = gql`
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

export const GET_USAGE = gql`
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

export const LOGIN = gql`
  mutation Login($input: InputLogin!) {
    login(input: $input) {
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

export const LOGOUT = gql`
  mutation Logout {
    logout {
      status
      error {
        path
        type
        message
      }
    }
  }
`;

export const TOGGLE_PUBLIC = gql`
  mutation TogglePublic($input: InputTogglePublicImagene!) {
    togglePublicImagene(input: $input) {
      status
      error {
        path
        type
        message
      }
    }
  }
`;

export const DELETE_IMAGENE = gql`
  mutation DeleteImagene($input: InputValueString!) {
    obliterateImagene(input: $input) {
      status
      error {
        path
        type
        message
      }
    }
  }
`;

export const CREATE_NAMESPACE = gql`
  mutation CreateNamespace($input: InputValueString!) {
    registerNamespace(input: $input) {
      status
      error {
        path
        type
        message
      }
    }
  }
`;

export const DELETE_NAMESPACE = gql`
  mutation DeleteNamespace($input: InputValueString!) {
    obliterateNamespace(input: $input) {
      status
      error {
        path
        type
        message
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: InputValueString!) {
    generateProject(input: $input) {
      status
      error {
        path
        type
        message
      }
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($input: InputValueString!) {
    obliterateProject(input: $input) {
      status
      error {
        path
        type
        message
      }
    }
  }
`;

export const SET_PROJECT_NAMESPACE = gql`
  mutation SetProjectNamespace($input: InputSetProjectNamespace!) {
    setProjectNamespace(input: $input) {
      status
      error {
        path
        type
        message
      }
      data {
        id
        namespaceID
      }
    }
  }
`;

export const SET_IMAGENE_PROJECT = gql`
  mutation SetImageneProject($input: InputSetImageneProject!) {
    setImageneProject(input: $input) {
      status
      error {
        path
        type
        message
      }
      data {
        id
        projectID
      }
    }
  }
`;
