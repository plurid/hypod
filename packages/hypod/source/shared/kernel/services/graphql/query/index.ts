import gql from 'graphql-tag';



export const GET_SETUP = gql`
    query GetSetup {
        getSetup {
            status
            error {
                type
                path
                message
            }
            data {
                webhooks {
                    id
                    path
                    provider
                }
                triggers {
                    id
                    name
                    repository
                    path
                    branch
                }
                repositories {
                    id
                    name
                    isPrivate
                }
                builds {
                    id
                    status
                    trigger
                    time
                    date
                }
                providers {
                    id
                    name
                    type
                }
            }
        }
    }
`;


export const GET_PROVIDER_REPOSITORIES = gql`
    query GetProviderRepositories($input: InputGetProviderRepositories!) {
        getProviderRepositories(input: $input) {
            status
            data {
                id
                name
                isPrivate
            }
        }
    }
`;
