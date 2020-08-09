import PluridServer from '@plurid/plurid-react-server';

import setupGraphQLServer from './graphql';

import dockerHandlers from './docker';



export const setRouteHandlers = (
    server: PluridServer,
) => {
    const instance = server.instance();

    setupGraphQLServer(instance);

    dockerHandlers(instance);
}
