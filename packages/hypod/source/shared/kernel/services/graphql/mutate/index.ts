import gql from 'graphql-tag';



export const SETUP_PROVIDER = gql`
    mutation SetupProvider($input: InputSetupProvider!) {
        setupProvider(input: $input) {
            status
            error {
                type
                path
                message
            }
            data
        }
    }
`;


export const SETUP_WEBHOOK = gql`
    mutation SetupWebhook($input: InputSetupWebhook!) {
        setupWebhook(input: $input) {
            status
            error {
                type
                path
                message
            }
        }
    }
`;


export const ADD_TRIGGER = gql`
    mutation AddTrigger($input: InputAddTrigger!) {
        addTrigger(input: $input) {
            status
            error {
                type
                path
                message
            }
        }
    }
`;


export const LINK_REPOSITORY = gql`
    mutation LinkRepository($input: InputLinkRepository!) {
        linkRepository(input: $input) {
            status
            error {
                type
                path
                message
            }
        }
    }
`;
