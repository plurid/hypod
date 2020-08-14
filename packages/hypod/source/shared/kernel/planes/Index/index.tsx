// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';
    // #endregion libraries


    // #region external
    import { AppState } from '#kernel-services/state/store';
    import selectors from '#kernel-services/state/selectors';
    import actions from '#kernel-services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPage,
    } from './styled';

    import InitialView from './components/InitialView';
    import GeneralView from './components/GeneralView';
    import PrivateView from './components/PrivateView';
    // #endregion internal
// #endregion imports



// #region module
export interface PageOwnProperties {
}

export interface PageStateProperties {
    stateViewLoading: boolean;
    stateIndexGeneralView: string;
}

export interface PageDispatchProperties {
}

export type PageProperties = PageOwnProperties
    & PageStateProperties
    & PageDispatchProperties;

const Page: React.FC<PageProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateViewLoading,
        stateIndexGeneralView,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region render
    if (stateViewLoading) {
        return (<></>);
    }

    let renderView = (<></>);

    switch (stateIndexGeneralView) {
        case 'initial':
            renderView = (
                <InitialView />
            );
            break;
        case 'general':
            renderView = (
                <GeneralView />
            );
            break;
        case 'private':
            renderView = (
                <PrivateView />
            );
            break;
    }

    return (
        <StyledPage>
            {renderView}
        </StyledPage>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PageStateProperties => ({
    stateViewLoading: selectors.view.getLoading(state),
    stateIndexGeneralView: selectors.view.getIndexGeneralView(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PageDispatchProperties => ({
});
// #endregion module



// #region exports
export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Page);
// #endregion exports
