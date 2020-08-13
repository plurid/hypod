// #region imports
    // #region libraries
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

    import Head from '#kernel-components/Head';
    // #endregion libraries


    // #region external
    import client from '#kernel-services/graphql/client';
    import {
        GET_IMAGENES,
        GET_CURRENT_OWNER,
    } from '#kernel-services/graphql/query';

    import { AppState } from '#kernel-services/state/store';
    import selectors from '#kernel-services/state/selectors';
    import actions from '#kernel-services/state/actions';

    import environment from '#kernel-services/utilities/environment';
    // #endregion external


    // #region internal
    import {
        StyledHome,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface HomeOwnProperties {
}

export interface HomeStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface HomeDispatchProperties {
    dispatchSetImagenes: typeof actions.data.setImagenes;
    dispatchSetViewOwnerID: typeof actions.view.setViewOwnerID;
}

export type HomeProperties = HomeOwnProperties
    & HomeStateProperties
    & HomeDispatchProperties;

const Home: React.FC<HomeProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        // stateGeneralTheme,
        // stateInteractionTheme,
        // #endregion state

        // #region dispatch
        dispatchSetImagenes,
        dispatchSetViewOwnerID,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region effects
    useEffect(() => {
        const loadData = async () => {
            try {
                const query = await client.query({
                    query: GET_IMAGENES,
                });

                const response = query.data.getImagenes;

                if (!response.status) {
                    return;
                }

                const imagenes = graphql.deleteTypenames(
                    response.data,
                );

                dispatchSetImagenes(imagenes);

                if (environment.customLogic) {
                    const query = await client.query({
                        query: GET_CURRENT_OWNER,
                    });

                    const response = query.data.getCurrentOwner;

                    if (!response.status) {
                        return;
                    }

                    const owner = graphql.deleteTypenames(
                        response.data,
                    );

                    dispatchSetViewOwnerID(owner.id);
                }
            } catch (error) {
                return;
            }
        }

        loadData();
    }, []);
    // #endregion effects


    // #region render
    return (
        <StyledHome>
            <Head />
        </StyledHome>
    );
    // #endregion render
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
    dispatchSetImagenes: (
        imagenes,
    ) => dispatch(
        actions.data.setImagenes(imagenes),
    ),
    dispatchSetViewOwnerID: (
        id,
    ) => dispatch(
        actions.view.setViewOwnerID(id),
    ),
});
// #endregion module



// #region exports
export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Home);
// #endregion exports
