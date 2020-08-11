// #region imports
import PluridServer from '@plurid/plurid-react-server';

import graphqlHandler from './graphql';

import dockerHandler from './docker';
// #endregion imports



// #region module
export const setupHandlers = (
    server: PluridServer,
) => {
    const instance = server.instance();

    graphqlHandler(instance);

    dockerHandler(instance);
}
// #endregion module
