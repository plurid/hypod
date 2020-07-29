import React, {
    useEffect,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    graphql,
} from '@plurid/plurid-functions';

import {
    StyledHome,
} from './styled';

import Head from '#kernel-components/Head';

import client from '#kernel-services/graphql/client';
import {
    GET_SETUP,
} from '#kernel-services/graphql/query';

import { AppState } from '#kernel-services/state/store';
import selectors from '#kernel-services/state/selectors';
import actions from '#kernel-services/state/actions';



export interface HomeOwnProperties {
}

export interface HomeStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface HomeDispatchProperties {
    dispatchSetActiveProviderID: typeof actions.data.setActiveProviderID;
    dispatchSetProviders: typeof actions.data.setProviders;
    dispatchSetRepositories: typeof actions.data.setRepositories;
    dispatchSetWebhooks: typeof actions.data.setWebhooks;
    dispatchSetTriggers: typeof actions.data.setTriggers;
    dispatchSetBuilds: typeof actions.data.setBuilds;
}

export type HomeProperties = HomeOwnProperties
    & HomeStateProperties
    & HomeDispatchProperties;

const Home: React.FC<HomeProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        // stateGeneralTheme,
        // stateInteractionTheme,

        /** dispatch */
        dispatchSetActiveProviderID,
        dispatchSetProviders,
        dispatchSetRepositories,
        dispatchSetWebhooks,
        dispatchSetTriggers,
        dispatchSetBuilds,
    } = properties;


    /** effects */
    useEffect(() => {
        const getSetup = async () => {
            const setupQuery = await client.query({
                query: GET_SETUP,
            });

            const response = setupQuery.data.getSetup;

            if (!response.status) {
                return;
            }

            const {
                providers,
                repositories,
                webhooks,
                triggers,
                builds,
            } = graphql.deleteTypenames(response.data);

            if (providers.length > 0) {
                dispatchSetActiveProviderID(
                    providers[0].id,
                );
            }

            dispatchSetProviders(providers);
            dispatchSetRepositories(repositories);
            dispatchSetWebhooks(webhooks);
            dispatchSetTriggers(triggers);
            dispatchSetBuilds(builds);
        }

        getSetup();
    }, []);


    /** render */
    return (
        <StyledHome>
            <Head />
        </StyledHome>
    );
}


const mapStateToProperties = (
    state: AppState,
): HomeStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): HomeDispatchProperties => ({
    dispatchSetActiveProviderID: (
        providerID,
    ) => dispatch(
        actions.data.setActiveProviderID(providerID),
    ),
    dispatchSetProviders: (
        providers,
    ) => dispatch(
        actions.data.setProviders(providers),
    ),
    dispatchSetRepositories: (
        repositories,
    ) => dispatch(
        actions.data.setRepositories(repositories),
    ),
    dispatchSetWebhooks: (
        webhooks,
    ) => dispatch(
        actions.data.setWebhooks(webhooks),
    ),
    dispatchSetTriggers: (
        triggers,
    ) => dispatch(
        actions.data.setTriggers(triggers),
    ),
    dispatchSetBuilds: (
        builds,
    ) => dispatch(
        actions.data.setBuilds(builds),
    ),
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Home);
