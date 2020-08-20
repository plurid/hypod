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

    import Head from '#kernel-components/Head';
    // #endregion libraries


    // #region external
    import {
        getImagenes,
        getCurrentOwner,
        getUsageType,
    } from '#kernel-services/logic/queries';

    import { AppState } from '#kernel-services/state/store';
    import selectors from '#kernel-services/state/selectors';
    import actions from '#kernel-services/state/actions';
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
    dispatchSetViewLoading: typeof actions.view.setViewLoading;
    dispatchSetViewType: typeof actions.view.setViewType;
    dispatchSetViewUsageType: typeof actions.view.setViewUsageType;
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
        dispatchSetViewLoading,
        dispatchSetViewType,
        dispatchSetViewUsageType,
        dispatchSetImagenes,
        dispatchSetViewOwnerID,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region effects
    useEffect(() => {
        const loadData = async () => {
            try {
                let indexView = '';

                /** Get usage type */
                const usageType = await getUsageType(dispatchSetViewUsageType);
                if (usageType) {
                    indexView = usageType;
                }

                /** Get imagenes */
                await getImagenes(dispatchSetImagenes);

                /** Get current owner */
                const ownerSet = await getCurrentOwner(dispatchSetViewOwnerID);
                if (ownerSet) {
                    indexView = 'general';
                }
                console.log('indexView', indexView);

                dispatchSetViewType({
                    type: 'indexView',
                    value: indexView,
                });
                dispatchSetViewLoading(false);
            } catch (error) {
                console.log(error);
                dispatchSetViewLoading(false);
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
    dispatchSetViewLoading: (
        loading,
    ) => dispatch(
        actions.view.setViewLoading(loading),
    ),
    dispatchSetViewType: (
        payload,
    ) => dispatch(
        actions.view.setViewType(payload),
    ),
    dispatchSetViewUsageType: (
        usageType,
    ) => dispatch(
        actions.view.setViewUsageType(usageType),
    ),
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
