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
    // #endregion internal
// #endregion imports



// #region module
export interface PageOwnProperties {
}

export interface PageStateProperties {
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
    // const {
    //     // plurid,
    // } = properties;
    // #endregion properties


    // #region state
    const [
        view,
        setView,
    ] = useState('general');
    // #endregion state


    // #region render
    let renderView = (<></>);

    switch (view) {
        case 'initial':
            renderView = (
                <InitialView
                    setView={setView}
                />
            );
            break;
        case 'general':
            renderView = (
                <GeneralView />
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
