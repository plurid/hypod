// #region imports
    // #region libraries
    import PluridServer from '@plurid/plurid-react-server';
    // #endregion libraries


    // #region external
    import {
        HypodLogic,
    } from '#server/data/interfaces';
    // #endregion external


    // #region internal
    import graphqlHandler from './graphql';

    import dockerHandler from './docker';
    // #endregion internal
// #endregion imports



// #region module
export const setupHandlers = (
    server: PluridServer,
    hypodLogic?: HypodLogic,
) => {
    const instance = server.instance();

    graphqlHandler(
        instance,
        hypodLogic,
    );

    dockerHandler(
        instance,
    );
}
// #endregion module
