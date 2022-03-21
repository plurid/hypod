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
        clipboard,
    } from '@plurid/plurid-functions';

    import {
        PluridIconDelete,
        PluridIconCopy,
        PluridIconLocked,
        PluridIconUnlocked,
    } from '@plurid/plurid-icons-react';

    import {
        PluridLink,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        compareValues,
    } from '~server/utilities/general';

    import {
        Imagene,
        ImageneTag,
    } from '~server/data/interfaces';

    import EntityView from '~kernel-components/EntityView';

    import client from '~kernel-services/graphql/client';
    import {
        OBLITERATE_IMAGENE,
        TOGGLE_PUBLIC_IMAGENE,
    } from '~kernel-services/graphql/mutate';

    import { AppState } from '~kernel-services/state/store';
    import StateContext from '~kernel-services/state/context';
    import selectors from '~kernel-services/state/selectors';
    import actions from '~kernel-services/state/actions';

    import {
        StyledElementsInLine,
    } from '~kernel-services/styled';

    import {
        getFilterIDs,
        formatBytes,
    } from '~kernel-services/utilities';

    import environment from '~kernel-services/utilities/environment';
    // #endregion external


    // #region internal
    // #endregion internal
// #endregion imports



// #region module
const findLatestTag = (
    latest: string,
    tags: ImageneTag[],
) => {
    if (tags.length === 0) {
        return;
    }

    const latestTag = tags.find(tag => tag.name === latest);

    return latestTag;
}


const imageneRowRenderer = (
    imagene: Imagene,
    handleImageneObliterate: (
        id: string,
    ) => void,
    handleToggleImagePublic: (
        id: string,
        value: boolean,
    ) => void,
) => {
    const {
        id,
        name,
        latest,
        tags,
        isPublic,
    } = imagene;

    const imageneAddress = environment.dockerService + '/' + name + ':' + latest;

    const latestTag = findLatestTag(
        latest,
        tags,
    );

    if (!latestTag) {
        return (
            <>
                <StyledElementsInLine>
                    <PluridIconCopy
                        atClick={() => clipboard.copy(imageneAddress)}
                    />

                    <div>
                        <PluridLink
                            route={'/imagene/' + id}
                            key={id}
                        >
                            {name}
                        </PluridLink>
                    </div>
                </StyledElementsInLine>

                <div />

                <div />

                <div />

                <div />

                <div>
                    {isPublic ? (
                        <PluridIconUnlocked
                            atClick={() => handleToggleImagePublic(id, false)}
                        />
                    ) : (
                        <PluridIconLocked
                            atClick={() => handleToggleImagePublic(id, true)}
                        />
                    )}
                </div>

                <PluridIconDelete
                    atClick={() => handleImageneObliterate(id)}
                />
            </>
        );
    }

    const textDate = new Date(latestTag.generatedAt * 1000).toLocaleString();
    const textSize = formatBytes(latestTag.size);
    const shortDigest = latestTag.digest.slice(0, 12) + '…';

    return (
        <>
            <StyledElementsInLine>
                <PluridIconCopy
                    atClick={() => clipboard.copy(imageneAddress)}
                />

                <div>
                    <PluridLink
                        route={'/imagene/' + id}
                    >
                        {name}
                    </PluridLink>
                </div>
            </StyledElementsInLine>

            <div>
                {latest}
            </div>

            <div>
                {textDate}
            </div>

            <div>
                {textSize}
            </div>

            <StyledElementsInLine>
                <PluridIconCopy
                    atClick={() => clipboard.copy(latestTag.digest)}
                />

                {shortDigest}
            </StyledElementsInLine>

            <div>
                {isPublic ? (
                    <PluridIconUnlocked
                        atClick={() => handleToggleImagePublic(id, false)}
                    />
                ) : (
                    <PluridIconLocked
                        atClick={() => handleToggleImagePublic(id, true)}
                    />
                )}
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
                tags,
                isPublic,
            } = imagene;

            const textPublic = isPublic ? 'public' : 'private';

            const latestTag = findLatestTag(
                latest,
                tags,
            );

            if (!latestTag) {
                const searchTerm = {
                    id,
                    data: [
                        name.toLowerCase(),
                        textPublic,
                    ],
                };

                return searchTerm;
            }

            const textDate = new Date(latestTag.generatedAt * 1000).toLocaleString();
            const textSize = formatBytes(latestTag.size);

            const searchTerm = {
                id,
                data: [
                    name.toLowerCase(),
                    latest.toLowerCase(),
                    textDate.toLowerCase(),
                    textSize.toLowerCase(),
                    latestTag.digest.toLowerCase(),
                    textPublic,
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
    dispatchTogglePublicImagene: typeof actions.data.togglePublicImagene;
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
        dispatchTogglePublicImagene,
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

    const handleToggleImagePublic = async (
        id: string,
        value: boolean,
    ) => {
        dispatchTogglePublicImagene({
            id,
            value,
        });

        try {
            const input = {
                id,
                value,
            };

            await client.mutate({
                mutation: TOGGLE_PUBLIC_IMAGENE,
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
    const [
        searchTerms,
        setSearchTerms,
    ] = useState(
        createSearchTerms(stateImagenes),
    );

    const [
        filteredRows,
        setFilteredRows,
    ] = useState(
        stateImagenes.map(
            imagene => imageneRowRenderer(
                imagene,
                handleImageneObliterate,
                handleToggleImagePublic,
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
            compareValues('name', 'desc'),
        );

        setFilteredRows(
            sortedImagenes.map(
                imagene => imageneRowRenderer(
                    imagene,
                    handleImageneObliterate,
                    handleToggleImagePublic,
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
                handleToggleImagePublic,
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
                generated on
            </div>

            <div>
                size
            </div>

            <div>
                digest
            </div>

            <div />

            <div />
        </>
    );

    return (
        <EntityView
            generalTheme={stateGeneralTheme}
            interactionTheme={stateInteractionTheme}

            rowTemplate="auto 90px 180px 90px 160px 30px 30px"
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
    dispatchTogglePublicImagene: (
        payload,
    ) => dispatch(
        actions.data.togglePublicImagene(payload),
    ),
});
// #endregion module



// #region exports
export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(ImagenesView);
// #endregion exports
