// #region imports
    // #region libraries
    import http from 'node:http';

    import {
        Application,
    } from 'express';

    import {
        ApolloServer,
    } from '@apollo/server';

    import { expressMiddleware } from '@apollo/server/express4';

    import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

    import {
        ApolloServerPluginLandingPageLocalDefault,
        ApolloServerPluginLandingPageProductionDefault,
    } from '@apollo/server/plugin/landingPage/default';
    // #endregion libraries


    // #region external
    import {
        resolvers,
        schemas,
    } from '~server/api';

    import {
        GRAPHQL_FAVICON,
        GRAPHQL_TITLE,
        GRAPHQL_ENDPOINT,

        CUSTOM_LOGIC_USAGE,
        PRIVATE_USAGE,

        logLevel,
        logLevels,
    } from '~server/data/constants';

    import {
        Context,
        HypodLogic,
    } from '~server/data/interfaces';

    import dataLoader from '~server/logic/loader';

    import defaultLogger from '~server/services/logger';

    import {
        getPrivateOwner,
    } from '~server/logic/privateUsage';

    import environment from '~kernel-services/utilities/environment';
    // #endregion external
// #endregion imports



// #region module
const graphqlHandler = async (
    instance: Application,
    logic?: HypodLogic,
) => {
    const playground = {
        faviconUrl: GRAPHQL_FAVICON,
        title: GRAPHQL_TITLE,
    };

    const customLogicUsage = CUSTOM_LOGIC_USAGE;
    const privateUsage = PRIVATE_USAGE;

    const logger = customLogicUsage && logic
        ? logic.logger
        : defaultLogger;

    const httpServer = http.createServer(instance);

    const graphQLServer = new ApolloServer({
        typeDefs: schemas,
        resolvers,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            environment.production
                ? ApolloServerPluginLandingPageProductionDefault({})
                // ? {}
                : ApolloServerPluginLandingPageLocalDefault({}),
        ],
    });

    const context = async ({
        req,
        res,
    }: any) => {
        const data = await dataLoader();

        const {
            namespaces,
            projects,
            imagenes,
        } = data;

        const privateOwnerIdentonym = privateUsage
            ? getPrivateOwner(req)
            : '';

        const context: Context = {
            request: req,
            response: res,

            instance,

            namespaces,
            projects,
            imagenes,

            customLogicUsage,

            privateUsage,
            privateOwnerIdentonym,

            logger,
            logLevel,
            logLevels,
        };

        return context;
    }

    await graphQLServer.start();

    instance.use(
        GRAPHQL_ENDPOINT,
        expressMiddleware(graphQLServer, {
            context,
        }),
    );
}
// #endregion module



// #region exports
export default graphqlHandler;
// #endregion exports
