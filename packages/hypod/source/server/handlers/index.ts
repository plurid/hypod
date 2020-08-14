// #region imports
    // #region libraries
    import bodyParser from 'body-parser';
    import cookieParser from 'cookie-parser';

    import PluridServer from '@plurid/plurid-react-server';
    // #endregion libraries


    // #region external
    import {
        HypodLogic,
        HypodRequest,
    } from '#server/data/interfaces';
    // #endregion external


    // #region internal
    import setup from './setup';

    import dockerRawBody from './middleware/dockerRawBody';

    import graphqlHandler from './graphql';

    import dockerHandler from './docker';
    // #endregion internal
// #endregion imports



// #region module
const setupHandlers = (
    server: PluridServer,
    logic: HypodLogic | undefined,
) => {
    setup();

    const instance = server.instance();

    instance.use(
        cookieParser(),
        /** Attach logic */
        (request, _, next) => {
            if (logic) {
                (request as HypodRequest).hypodLogic = {
                    ...logic,
                };
            }

            next();
        },
        dockerRawBody,
        bodyParser.json(),
    );

    graphqlHandler(
        instance,
    );

    dockerHandler(
        instance,
    );
}
// #endregion module



// #region exports
export {
    setupHandlers,
};
// #endregion exports
