// #region imports
    // #region libraries
    import PluridServer from '@plurid/plurid-react-server';
    // #endregion libraries

    // #region internal
    import graphqlHandler from './graphql';

    import dockerHandler from './docker';
    // #endregion internal
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
