// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        Namespace,
    } from '#server/data/interfaces';

    import {
        compareValues,
    } from '#server/utilities/general';

    import EntityView from '#kernel-components/EntityView';

    import client from '#kernel-services/graphql/client';
    import {
        OBLITERATE_NAMESPACE,
    } from '#kernel-services/graphql/mutate';

    import { AppState } from '#kernel-services/state/store';
    import selectors from '#kernel-services/state/selectors';
    import actions from '#kernel-services/state/actions';

    import {
        getFilterIDs,
    } from '#kernel-services/utilities';
    // #endregion external


    // #region internal
    import {
        namespaceRowRenderer,
        createSearchTerms,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
export interface NamespacesViewOwnProperties {
    // #region required
        // #region values
        // #endregion values

        // #region methods
        setGeneralView: any;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

export interface NamespacesViewStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
    stateNamespaces: Namespace[];
}

export interface NamespacesViewDispatchProperties {
    dispatchRemoveEntity: typeof actions.data.removeEntity;
}

export type NamespacesViewProperties = NamespacesViewOwnProperties
    & NamespacesViewStateProperties
    & NamespacesViewDispatchProperties;

const NamespacesView: React.FC<NamespacesViewProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            // #endregion values

            // #region methods
            setGeneralView,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional

        // #region state
        stateGeneralTheme,
        stateInteractionTheme,
        stateNamespaces,
        // #endregion state

        // #region dispatch
        dispatchRemoveEntity,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region handlers
    const handleNamespaceObliterate = async (
        id: string,
    ) => {
        try {
            dispatchRemoveEntity({
                type: 'namespace',
                id,
            });

            const input = {
                value: id,
            };

            await client.mutate({
                mutation: OBLITERATE_NAMESPACE,
                variables: {
                    input,
                },
            });
        } catch (error) {
            return;
        }
    }
    // #endregion handlers


    // #region state
    const [searchTerms, setSearchTerms] = useState(
        createSearchTerms(stateNamespaces),
    );

    const [filteredRows, setFilteredRows] = useState(
        stateNamespaces.map(
            namespace => namespaceRowRenderer(
                namespace,
                handleNamespaceObliterate,
            ),
        ),
    );
    // #endregion state


    // #region handlers
    const filterUpdate = (
        rawValue: string,
    ) => {
        const value = rawValue.toLowerCase();

        const filterIDs = getFilterIDs(
            searchTerms,
            value,
        );

        const filteredNamespaces = stateNamespaces.filter(stateNamespace => {
            if (filterIDs.includes(stateNamespace.id)) {
                return true;
            }

            return false;
        });

        const sortedNamespaces = filteredNamespaces.sort(
            compareValues('name'),
        );

        setFilteredRows(
            sortedNamespaces.map(
                namespace => namespaceRowRenderer(
                    namespace,
                    handleNamespaceObliterate,
                ),
            ),
        );
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        const searchTerms = createSearchTerms(
            stateNamespaces,
        );
        const filteredRows = stateNamespaces.map(
            namespace => namespaceRowRenderer(
                namespace,
                handleNamespaceObliterate,
            ),
        );

        setSearchTerms(searchTerms);
        setFilteredRows(filteredRows);
    }, [
        stateNamespaces,
    ]);
    // #endregion effects


    // #region render
    const rowsHeader = (
        <>
            <div>
                name
            </div>

            <div>
                registered on
            </div>

            <div />
        </>
    );

    return (
        <EntityView
            generalTheme={stateGeneralTheme}
            interactionTheme={stateInteractionTheme}

            rowTemplate="auto 200px 30px"
            rowsHeader={rowsHeader}
            rows={filteredRows}
            noRows="no namespaces"

            actionButtonText="Register Namespace"
            actionButtonClick={() => {
                setGeneralView('register-namespace');
            }}

            filterUpdate={filterUpdate}
        />
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): NamespacesViewStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateNamespaces: selectors.data.getNamespaces(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): NamespacesViewDispatchProperties => ({
    dispatchRemoveEntity: (
        payload,
    ) => dispatch (
        actions.data.removeEntity(payload),
    ),
});


const ConnectedNamespacesView = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(NamespacesView);
// #endregion module



// #region exports
export default ConnectedNamespacesView;
// #endregion exports
