// #region imports
    // #region libraries
    import React, {
        useRef,
    } from 'react';

    import {
        HelmetProvider,
    } from 'react-helmet-async';

    import {
        Provider as ReduxProvider,
    } from 'react-redux';

    import {
        ApolloProvider,
    } from '@apollo/client';

    import {
        PluridProvider,
        PluridRouterBrowser,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import helmetContext from '~kernel-services/helmet';

    import reduxStore from '~kernel-services/state/store';
    import reduxContext from '~kernel-services/state/context';

    import graphqlClient from '~kernel-services/graphql/client';
    // #endregion external


    // #region internal
    import {
        routes,
        shell,
    } from '../shared';
    // #endregion internal
// #endregion imports



// #region module
const reduxState = (window as any).__PRELOADED_REDUX_STATE__;
delete (window as any).__PRELOADED_REDUX_STATE__;

const pluridMetastate = (window as any).__PRELOADED_PLURID_METASTATE__;
delete (window as any).__PRELOADED_PLURID_METASTATE__;


const Client: React.FC<any> = () => {
    // #region references
    const store = useRef(reduxStore(reduxState));
    // #endregion references


    // #region render
    return (
        <HelmetProvider context={helmetContext}>
            <ReduxProvider
                store={store.current}
                context={reduxContext}
            >
                <ApolloProvider client={graphqlClient}>
                    <PluridProvider metastate={pluridMetastate}>
                        <PluridRouterBrowser
                            shell={shell}
                            routes={routes}
                        />
                    </PluridProvider>
                </ApolloProvider>
            </ReduxProvider>
        </HelmetProvider>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Client;
// #endregion exports
