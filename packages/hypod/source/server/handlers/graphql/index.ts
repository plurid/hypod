// #region imports
    // #region libraries
    import {
        Express,
    } from 'express';

    import {
        ApolloServer,
    } from 'apollo-server-express';
    // #endregion libraries


    // #region external
    import {
        resolvers,
        schemas,
    } from '#server/api';

    import {
        Context,
    } from '#server/data/interfaces';

    import dataLoader from '#server/logic/loader';
    // #endregion external
// #endregion imports



// #region module
const graphqlHandler = async (
    instance: Express,
) => {
    const playground = {
        faviconUrl: '/favicon.ico',
        title: 'API · hypod',
    };

    const graphQLServer = new ApolloServer({
        typeDefs: schemas,
        resolvers,
        playground,
        context: async ({
            req,
            res,
        }: any) => {
            const data = await dataLoader();

            const {
                imagenes,
            } = data;

            const context: Context = {
                request: req,
                response: res,
                instance,
                imagenes,
            };

            return context;
        },
    });

    graphQLServer.applyMiddleware({
        app: instance,
        path: '/graphql',
    });
}


export default graphqlHandler;
// #endregion module
