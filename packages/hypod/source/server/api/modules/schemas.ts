// #region imports
import {
    gql,
} from 'apollo-server-express';

import General from './general/schemas';
// #endregion imports



// #region module
const baseSchema = gql`
    # default
    type Query {
        _: Boolean
    }

    type Mutation {
        _: Boolean
    }

    type Subscription {
        _: Boolean
    }

    # extras
    type Response {
        status: Boolean!
        error: Error
    }

    type Error {
        path: String!
        type: String!
        message: String!
    }

    scalar Date
`;


const schemas = [
    baseSchema,

    ...General,
];


export default schemas;
// #endregion module
