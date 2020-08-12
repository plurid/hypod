// #region imports
    // #region libraries
    import bodyParser from 'body-parser';

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
        DOCKER_ENDPOINT_API_VERSION_CHECK,
        DOCKER_ENDPOINT_IGNORE,
    } from './data/constants';

    import {
        HypodLogic,
    } from './data/interfaces';

    import preserves from './preserves';
    import setup from './setup';
    import {
        setupHandlers,
    } from './handlers';
    // #endregion internal
// #endregion imports



// #region module
/** ENVIRONMENT */
setup();

const watchMode = process.env.PLURID_WATCH_MODE === 'true';
const isProduction = process.env.ENV_MODE === 'production';
const buildDirectory = process.env.PLURID_BUILD_DIRECTORY || 'build';
const port = process.env.PORT || 56565;



/** CONSTANTS */
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



/** SERVER */
// generate server
const pluridServer = new PluridServer({
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


pluridServer.instance().use(
    (request, response, next) => {
        const url = request.originalUrl;

        if (!url.startsWith(DOCKER_ENDPOINT_API_VERSION_CHECK)) {
            next();
            return;
        }

        let data = '';
        request.setEncoding('binary');
        request.on('data', (chunk) => {
            data += chunk;
        });

        request.on('end', () => {
            (request as any).rawBody = data;
            next();
        });
    },
    bodyParser.json(),
);



const Hypod = (
    logic?: HypodLogic,
) => {
    setupHandlers(
        pluridServer,
        logic,
    );

    return pluridServer;
}




/**
 * If the file is called directly, as in `node build/index.js`,
 * it will run the server.
 *
 * The check is in place so that the server can also be imported
 * for programmatic usage.
 */
if (require.main === module) {
    Hypod();
    pluridServer.start(port);
}
// #endregion module



// #region exports
export * from './data/interfaces';

export {
    Hypod,
};

export default pluridServer;
// #endregion exports
