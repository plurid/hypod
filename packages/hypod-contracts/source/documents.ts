export const documents = {
  getImagenes: /* GraphQL */ `
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
  `,
  getNamespaces: /* GraphQL */ `
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
  `,
  getProjects: /* GraphQL */ `
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
  `,
  getCurrentOwner: /* GraphQL */ `
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
  `,
  getUsageType: /* GraphQL */ `
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
  `,
  login: /* GraphQL */ `
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
  `,
  logout: /* GraphQL */ `
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
  `,
  setProjectNamespace: /* GraphQL */ `
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
          name
          generatedAt
          generatedBy
          namespaceID
        }
      }
    }
  `,
  setImageneProject: /* GraphQL */ `
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
  `,
} as const;

export type DocumentName = keyof typeof documents;
