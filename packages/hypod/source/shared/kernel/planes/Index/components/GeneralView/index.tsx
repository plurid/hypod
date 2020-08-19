// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconSpace,
        PluridIconTools,
        PluridIconApps,
        PluridIconArrowRight,
        PluridIconDocuments,
        PluridIconExternalLink,
        PluridIconExit,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import hypodLogo from '../../assets/hypod-logo.png';

    import {
        HYPOD_MANUAL_LINK,
    } from '#kernel-data/constants';

    import client from '#kernel-services/graphql/client';
    import {
        LOGOUT
    } from '#kernel-services/graphql/mutate';

    import { AppState } from '#kernel-services/state/store';
    import selectors from '#kernel-services/state/selectors';
    import actions from '#kernel-services/state/actions';
    // #endregion external


    // #region internal
    import NamespacesView from './components/NamespacesView';
    import ImagenesView from './components/ImagenesView';
    import ProjectsView from './components/ProjectsView';

    import {
        StyledGeneralView,
        StyledGeneralSelectors,
        StyledGeneralSelectorItem,
        StyledGeneralPeformer,
        StyledGeneralHelp,
        StyledGeneralHelpItem,
        StyledGeneralSelected,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const generalSelectors = [
    'namespaces',
    'projects',
    'imagenes',
];

const generalSelectorsIcons = {
    namespaces: PluridIconSpace,
    projects: PluridIconApps,
    imagenes: PluridIconTools,
};


export interface GeneralViewOwnProperties {
}

export interface GeneralViewStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
    stateActiveProviderID: string;
    stateIndexGeneralSelector: string;
    stateIndexGeneralView: string;
    stateViewCompactSelectors: boolean;
    stateViewOwnerID: string;
    stateViewUsageType: string,
}

export interface GeneralViewDispatchProperties {
    dispatchSetViewType: typeof actions.view.setViewType;
    dispatchSetViewCompactSelectors: typeof actions.view.setViewCompactSelectors;
}

export type GeneralViewProperties = GeneralViewOwnProperties
    & GeneralViewStateProperties
    & GeneralViewDispatchProperties;

const GeneralView: React.FC<GeneralViewProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateGeneralTheme,
        stateInteractionTheme,
        stateActiveProviderID,
        stateIndexGeneralSelector,
        stateIndexGeneralView,
        stateViewCompactSelectors,
        stateViewOwnerID,
        stateViewUsageType,
        // #endregion state

        // #region dispatch
        dispatchSetViewType,
        dispatchSetViewCompactSelectors,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region state
    const [
        mouseOverSelectors,
        setMouseOverSelectors,
    ] = useState(false);
    // #endregion state


    // #region handlers
    const openManual = () => {
        window.open(HYPOD_MANUAL_LINK, '_blank');
    }

    const logout = async () => {
        try {
            dispatchSetViewType({
                type: 'indexView',
                value: 'private',
            });

            await client.mutate({
                mutation: LOGOUT,
            });

            return;
        } catch (error) {
            return;
        }
    }

    const setSelectedView = (
        view: string,
    ) => {
        dispatchSetViewType({
            type: 'indexGeneralSelector',
            value: view,
        });
    }

    const setGeneralView = (
        view: string,
    ) => {
        dispatchSetViewType({
            type: 'indexGeneralView',
            value: view,
        });
    }

    const setCompactSelectors = (
        value: boolean,
    ) => {
        dispatchSetViewCompactSelectors(value);
    }
    // #endregion handlers


    // #region render
    let renderSelectedView = (<></>);
    switch (stateIndexGeneralSelector) {
        case 'namespaces':
            renderSelectedView = (
                <NamespacesView
                    setGeneralView={setGeneralView}
                />
            );
            break;
        case 'projects':
            renderSelectedView = (
                <ProjectsView
                    setGeneralView={setGeneralView}
                />
            );
            break;
        case 'imagenes':
            renderSelectedView = (
                <ImagenesView />
            );
            break;
    }

    switch (stateIndexGeneralView) {
        case 'general':
            return (
                <StyledGeneralView
                    compactSelectors={stateViewCompactSelectors}
                >
                    <StyledGeneralSelectors
                        onMouseEnter={() => setMouseOverSelectors(true)}
                        onMouseLeave={() => setMouseOverSelectors(false)}
                        theme={stateGeneralTheme}
                        compactSelectors={stateViewCompactSelectors}
                        viewUsageType={stateViewUsageType}
                    >
                        <StyledGeneralPeformer
                            compactSelectors={stateViewCompactSelectors}
                        >
                            {!stateViewCompactSelectors && (
                                <>
                                    <div>
                                        <img
                                            src={hypodLogo}
                                            alt="hypod"
                                            height={30}
                                            onClick={() => setCompactSelectors(true)}
                                        />
                                    </div>

                                    <div>
                                        hypod
                                    </div>
                                </>
                            )}

                            {stateViewCompactSelectors
                            && mouseOverSelectors
                            && (
                                <PluridIconArrowRight
                                    atClick={() => setCompactSelectors(false)}
                                />
                            )}
                        </StyledGeneralPeformer>

                        <ul>
                            {generalSelectors.map(selector => {
                                const Icon = generalSelectorsIcons[selector];

                                return (
                                    <StyledGeneralSelectorItem
                                        key={selector}
                                        onClick={() => setSelectedView(selector)}
                                        theme={stateGeneralTheme}
                                        selected={selector === stateIndexGeneralSelector}
                                        compactSelectors={stateViewCompactSelectors}
                                    >
                                        <Icon />

                                        {!stateViewCompactSelectors && (
                                            <div>
                                                {selector}
                                            </div>
                                        )}
                                    </StyledGeneralSelectorItem>
                                );
                            })}
                        </ul>

                        <StyledGeneralHelp>
                            {mouseOverSelectors && (
                                <ul>
                                    <StyledGeneralHelpItem
                                        onClick={() => openManual()}
                                        compactSelectors={stateViewCompactSelectors}
                                    >
                                        <PluridIconDocuments />

                                        {!stateViewCompactSelectors && (
                                            <>
                                                <div>
                                                    manual
                                                </div>

                                                <PluridIconExternalLink/>
                                            </>
                                        )}
                                    </StyledGeneralHelpItem>

                                    {stateViewUsageType === 'PRIVATE_USAGE' && (
                                        <StyledGeneralHelpItem
                                            onClick={() => logout()}
                                            compactSelectors={stateViewCompactSelectors}
                                        >
                                            <PluridIconExit />

                                            {!stateViewCompactSelectors && (
                                                <>
                                                    <div>
                                                        logout ({stateViewOwnerID})
                                                    </div>

                                                    <div />
                                                </>
                                            )}
                                        </StyledGeneralHelpItem>
                                    )}
                                </ul>
                            )}
                        </StyledGeneralHelp>
                    </StyledGeneralSelectors>

                    <StyledGeneralSelected>
                        {renderSelectedView}
                    </StyledGeneralSelected>
                </StyledGeneralView>
            );
        default:
            return (
                <></>
            );
    }
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): GeneralViewStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateActiveProviderID: selectors.data.getActiveProviderID(state),
    stateIndexGeneralSelector: selectors.view.getIndexGeneralSelector(state),
    stateIndexGeneralView: selectors.view.getIndexGeneralView(state),
    stateViewCompactSelectors: selectors.view.getViewCompactSelectors(state),
    stateViewOwnerID: selectors.view.getViewOwnerID(state),
    stateViewUsageType: selectors.view.getViewUsageType(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): GeneralViewDispatchProperties => ({
    dispatchSetViewType: (
        payload,
    ) => dispatch(
        actions.view.setViewType(payload),
    ),
    dispatchSetViewCompactSelectors: (
        payload,
    ) => dispatch(
        actions.view.setViewCompactSelectors(payload),
    ),
});
// #endregion module



// #region exports
export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(GeneralView);
// #endregion exports
