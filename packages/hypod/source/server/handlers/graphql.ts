import {
    Express,
} from 'express';

import {
    ApolloServer,
} from 'apollo-server-express';

import {
    resolvers,
    schemas,
} from '#server/api';

import {
    Context,
} from '#server/data/interfaces';



const setupGraphQLServer = async (
    instance: Express,
) => {
    const playground = {
        faviconUrl: '/favicon.ico',
        title: 'API · performer',
    };

    const graphQLServer = new ApolloServer({
        typeDefs: schemas,
        resolvers,
        playground,
        context: async ({
            req,
            res,
        }: any) => {
            const context: Context = {
                request: req,
                response: res,
                instance,
            };

            return context;
        },
    });

    graphQLServer.applyMiddleware({
        app: instance,
        path: '/perform',
    });
}


export default setupGraphQLServer;
