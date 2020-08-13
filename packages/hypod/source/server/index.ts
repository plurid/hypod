// #region imports
    // #region libraries
    import PluridServer, {
        PluridServerMiddleware,
        PluridServerService,
        PluridServerServicesData,
        PluridServerPartialOptions,
        PluridServerTemplateConfiguration,
    } from '@plurid/plurid-react-server';
    // #endregion libraries


    // #region external
    import helmet from '#kernel-services/helmet';

    import reduxStore from '#kernel-services/state/store';
    import apolloClient from '#kernel-services/graphql/client';

    import {
        routes,
        shell,
    } from '../shared';
    // #endregion external


    // #region internal
    import {
        DOCKER_ENDPOINT_IGNORE,
    } from './data/constants';

    import {
        HypodLogic,
    } from './data/interfaces';

    import mockLogic from './logic/mock';

    import preserves from './preserves';
    import {
        setupHandlers,
    } from './handlers';
    // #endregion internal
// #endregion imports



// #region module
// #region environment
const watchMode = process.env.PLURID_WATCH_MODE === 'true';
const isProduction = process.env.ENV_MODE === 'production';
const buildDirectory = process.env.PLURID_BUILD_DIRECTORY || 'build';
const port = process.env.PORT || 56565;
// #endregion environment



// #region constants
const applicationRoot = 'hypod-application';
const openAtStart = watchMode
    ? false
    : isProduction
        ? false
        : true;
const debug = isProduction
    ? 'info'
    : 'error';


/** Custom styles to be loaded into the template. */
const styles: string[] = [
    //
];


/** Express-like middleware. */
const middleware: PluridServerMiddleware[] = [
    //
];


/** Services to be used in the application. */
const services: PluridServerService[] = [
    'Apollo',
    'Redux',
];


const servicesData: PluridServerServicesData = {
    apolloClient,
    reduxStore,
    reduxStoreValue: {},
};


const options: PluridServerPartialOptions = {
    serverName: 'Hypod Server',
    buildDirectory,
    open: openAtStart,
    debug,
    ignore: [
        '/graphql',
        DOCKER_ENDPOINT_IGNORE,
    ],
};


const template: PluridServerTemplateConfiguration = {
    root: applicationRoot,
};
// #endregion constants



// #region server
const hypodServer = new PluridServer({
    helmet,
    routes,
    preserves,
    shell,
    styles,
    middleware,
    services,
    servicesData,
    options,
    template,
});


const Hypod = (
    logic?: HypodLogic,
) => {
    setupHandlers(
        hypodServer,
        logic,
    );

    return hypodServer;
}
// #endregion server
// #endregion module



// #region run
/**
 * If the file is called directly, as in `node build/index.js`,
 * it will run the server.
 *
 * The check is in place so that the server can also be imported
 * for programmatic usage.
 */
if (require.main === module) {
    Hypod(
        /** mock logic for testing */
        mockLogic,
    );
    hypodServer.start(port);
}
// #endregion run



// #region exports
export * from './data/interfaces';

export {
    Hypod,
};

export default hypodServer;
// #endregion exports
