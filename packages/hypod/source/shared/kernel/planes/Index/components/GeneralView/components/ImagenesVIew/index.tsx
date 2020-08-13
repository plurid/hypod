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

    import {
        PluridIconDelete,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import {
        compareValues,
    } from '#server/utilities/general';

    import {
        Imagene,
    } from '#server/data/interfaces';

    import EntityView from '#kernel-components/EntityView';

    import client from '#kernel-services/graphql/client';
    import {
        OBLITERATE_IMAGENE,
    } from '#kernel-services/graphql/mutate';

    import { AppState } from '#kernel-services/state/store';
    import selectors from '#kernel-services/state/selectors';
    import actions from '#kernel-services/state/actions';

    import {
        getFilterIDs,
    } from '#kernel-services/utilities';
    // #endregion external
// #endregion imports



// #region module
const imageneRowRenderer = (
    imagene: Imagene,
    handleImageneObliterate: any,
) => {
    const {
        id,
        name,
        latest,
        size,
        digest,
    } = imagene;

    const shortDigest = digest.slice(0, 12) + '…';

    return (
        <>
            <div>
                {name}
            </div>

            <div>
                {latest}
            </div>

            <div>
                {size} MB
            </div>

            <div>
                {shortDigest}
            </div>

            <PluridIconDelete
                atClick={() => handleImageneObliterate(id)}
            />
        </>
    );
}


const createSearchTerms = (
    imagenes: Imagene[],
) => {
    const searchTerms = imagenes.map(
        imagene => {
            const {
                id,
                name,
                latest,
                size,
                digest,
            } = imagene;

            const searchTerm = {
                id,
                data: [
                    name.toLowerCase(),
                    latest.toLowerCase(),
                    size + '',
                    digest.toLowerCase(),
                ],
            };

            return searchTerm;
        },
    );

    return searchTerms;
}


export interface ImagenesViewOwnProperties {
    // #region required
        // #region values
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

export interface ImagenesViewStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
    stateImagenes: Imagene[];
}

export interface ImagenesViewDispatchProperties {
    dispatchRemoveEntity: typeof actions.data.removeEntity;
}

export type ImagenesViewProperties = ImagenesViewOwnProperties
    & ImagenesViewStateProperties
    & ImagenesViewDispatchProperties;

const ImagenesView: React.FC<ImagenesViewProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            // #endregion values

            // #region methods
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
        stateImagenes,
        // #endregion state

        // #region dispatch
        dispatchRemoveEntity,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region handlers
    const handleImageneObliterate = async (
        id: string,
    ) => {
        try {
            dispatchRemoveEntity({
                id,
                type: 'imagene',
            });

            const input = {
                value: id,
            };

            await client.mutate({
                mutation: OBLITERATE_IMAGENE,
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
        createSearchTerms(stateImagenes),
    );

    const [filteredRows, setFilteredRows] = useState(
        stateImagenes.map(
            imagene => imageneRowRenderer(
                imagene,
                handleImageneObliterate,
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

        const filteredImagenes = stateImagenes.filter(stateImagene => {
            if (filterIDs.includes(stateImagene.id)) {
                return true;
            }

            return false;
        });

        const sortedImagenes = filteredImagenes.sort(
            compareValues('date', 'desc'),
        );

        setFilteredRows(
            sortedImagenes.map(
                imagene => imageneRowRenderer(
                    imagene,
                    handleImageneObliterate,
                ),
            ),
        );
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        const searchTerms = createSearchTerms(
            stateImagenes,
        );
        const filteredRows = stateImagenes.map(
            imagene => imageneRowRenderer(
                imagene,
                handleImageneObliterate,
            ),
        );

        setSearchTerms(searchTerms);
        setFilteredRows(filteredRows);
    }, [
        stateImagenes,
    ]);
    // #endregion effects


    // #region render
    const rowsHeader = (
        <>
            <div>
                name
            </div>

            <div>
                latest
            </div>

            <div>
                size
            </div>

            <div>
                digest
            </div>

            <div />
        </>
    );

    return (
        <EntityView
            generalTheme={stateGeneralTheme}
            interactionTheme={stateInteractionTheme}

            rowTemplate="auto 120px 120px 120px 30px"
            rowsHeader={rowsHeader}
            rows={filteredRows}
            noRows="no imagenes"

            filterUpdate={filterUpdate}
        />
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): ImagenesViewStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateImagenes: selectors.data.getImagenes(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ImagenesViewDispatchProperties => ({
    dispatchRemoveEntity: (
        payload,
    ) => dispatch(
        actions.data.removeEntity(payload),
    ),
});
// #endregion module



// #region exports
export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(ImagenesView);
// #endregion exports
