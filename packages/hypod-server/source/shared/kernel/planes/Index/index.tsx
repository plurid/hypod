// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';
    // #endregion libraries


    // #region external
    import { AppState } from '~kernel-services/state/store';
    import selectors from '~kernel-services/state/selectors';
    // import actions from '~kernel-services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledIndex,
    } from './styled';

    import InitialView from './components/InitialView';
    import GeneralView from './components/GeneralView';
    import PrivateView from './components/PrivateView';
    // #endregion internal
// #endregion imports



// #region module
export interface IndexOwnProperties {
}

export interface IndexStateProperties {
    stateViewLoading: boolean;
    stateIndexView: string;
}

export interface IndexDispatchProperties {
}

export type IndexProperties = IndexOwnProperties
    & IndexStateProperties
    & IndexDispatchProperties;

const Index: React.FC<IndexProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateViewLoading,
        stateIndexView,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region render
    if (stateViewLoading) {
        return (<></>);
    }

    let renderView = (<></>);

    switch (stateIndexView) {
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
        <StyledIndex>
            {renderView}
        </StyledIndex>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): IndexStateProperties => ({
    stateViewLoading: selectors.view.getLoading(state),
    stateIndexView: selectors.view.getIndexView(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): IndexDispatchProperties => ({
});
// #endregion module



// #region exports
export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Index);
// #endregion exports
