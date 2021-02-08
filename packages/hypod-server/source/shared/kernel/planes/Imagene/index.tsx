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
    } from '@plurid/plurid-icons-react';

    import {
        PluridComponentProperty,
    } from '@plurid/plurid-react';

    import {
        universal,
    } from '@plurid/plurid-ui-components-react';
    // #endregion libraries


    // #region external
    import {
        Project,
        Imagene,
        ImageneTag,
    } from '~server/data/interfaces';

    import {
        compareValues,
    } from '~server/utilities/general';

    import {
        getFilterIDs,
        formatBytes,
    } from '~kernel-services/utilities';

    import EntityView from '~kernel-components/EntityView';

    import { AppState } from '~kernel-services/state/store';
    import selectors from '~kernel-services/state/selectors';
    import actions from '~kernel-services/state/actions';

    import client from '~kernel-services/graphql/client';
    import {
        OBLITERATE_IMAGENE_TAG,
    } from '~kernel-services/graphql/mutate';

    import {
        StyledElementsInLine,
    } from '~kernel-services/styled';

    import environment from '~kernel-services/utilities/environment';
    // #endregion external


    // #region internal
    import {
        StyledImagene,
        StyledHeader,
        StyledHeaderProject,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    inputs: {
        Dropdown: PluridDropdown,
    },
} = universal;

const imageneTagRowRenderer = (
    imageneName: string,
    imageneTag: ImageneTag,
    handleImageneTagObliterate: (
        id: string,
    ) => void,
) => {
    const {
        id,
        name,
        digest,
        generatedAt,
        size,
    } = imageneTag;

    const imageneAddress = environment.dockerService + '/' + imageneName + ':' + name;

    const textDate = new Date(generatedAt * 1000).toLocaleString();
    const textSize = formatBytes(size);
    const shortDigest = digest.slice(0, 12) + '…';

    return (
        <>
            <StyledElementsInLine>
                <PluridIconCopy
                    atClick={() => clipboard.copy(imageneAddress)}
                />

                {name}
            </StyledElementsInLine>

            <div>
                {textDate}
            </div>

            <div>
                {textSize}
            </div>

            <StyledElementsInLine>
                <PluridIconCopy
                    atClick={() => clipboard.copy(digest)}
                />

                {shortDigest}
            </StyledElementsInLine>

            <PluridIconDelete
                atClick={() => handleImageneTagObliterate(id)}
            />
        </>
    );
}


const createSearchTerms = (
    imageneTags: ImageneTag[],
) => {
    const searchTerms = imageneTags.map(
        imageneTag => {
            const {
                id,
                name,
                generatedAt,
                size,
                digest,
            } = imageneTag;

            const textDate = new Date(generatedAt * 1000).toLocaleString();
            const textSize = formatBytes(size);

            const searchTerm = {
                id,
                data: [
                    name.toLowerCase(),
                    name.toLowerCase(),
                    textDate.toLowerCase(),
                    textSize.toLowerCase(),
                    digest.toLowerCase(),
                ],
            };

            return searchTerm;
        },
    );

    return searchTerms;
}


export interface ImageneOwnProperties {
    plurid: PluridComponentProperty;
}

export interface ImageneStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
    stateProjects: Project[];
    stateImagenes: Imagene[];
}

export interface ImageneDispatchProperties {
    dispatchObliterateImageneTag: typeof actions.data.obliterateImageneTag;
}

export type ImageneProperties = ImageneOwnProperties
    & ImageneStateProperties
    & ImageneDispatchProperties;

const Imagene: React.FC<ImageneProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        plurid,
        // #endregion own

        // #region state
        stateGeneralTheme,
        stateInteractionTheme,
        stateProjects,
        stateImagenes,
        // #endregion state

        // #region dispatch
        dispatchObliterateImageneTag,
        // #endregion dispatch
    } = properties;

    const imageneID = plurid.route.plane.parameters.id;

    const imagene = stateImagenes.find(imagene => imagene.id === imageneID);
    // #endregion properties


    // #region handlers
    const handleImageneTagObliterate = async (
        tagID: string,
    ) => {
        if (!imagene) {
            return;
        }

        dispatchObliterateImageneTag({
            imageneID: imagene.id,
            tagID,
        });

        try {
            const input = {
                imageneID: imagene.id,
                tagID,
            };

            await client.mutate({
                mutation: OBLITERATE_IMAGENE_TAG,
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
        selectedProject,
        setSelectedProject,
    ] = useState('project');

    const [
        searchTerms,
        setSearchTerms,
    ] = useState(
        imagene ? createSearchTerms(imagene.tags) : [],
    );

    const [
        filteredRows,
        setFilteredRows,
    ] = useState(
        imagene ? imagene.tags.map(
            imageneTag => imageneTagRowRenderer(
                imagene.name,
                imageneTag,
                handleImageneTagObliterate,
            ),
        ) : [],
    );
    // #endregion state


    // #region handlers
    const filterUpdate = (
        rawValue: string,
    ) => {
        if (!imagene) {
            return;
        }

        const value = rawValue.toLowerCase();

        const filterIDs = getFilterIDs(
            searchTerms,
            value,
        );

        const filteredImageneTags = imagene.tags.filter(stateImagene => {
            if (filterIDs.includes(stateImagene.id)) {
                return true;
            }

            return false;
        });

        const sortedImageneTags = filteredImageneTags.sort(
            compareValues('generatedAt', 'desc'),
        );

        setFilteredRows(
            sortedImageneTags.map(
                imageneTag => imageneTagRowRenderer(
                    imagene.name,
                    imageneTag,
                    handleImageneTagObliterate,
                ),
            ),
        );
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        if (imagene) {
            const searchTerms = createSearchTerms(
                imagene.tags,
            );
            const filteredRows = imagene.tags.map(
                imageneTag => imageneTagRowRenderer(
                    imagene.name,
                    imageneTag,
                    handleImageneTagObliterate,
                ),
            );

            setSearchTerms(searchTerms);
            setFilteredRows(filteredRows);
        }
    }, [
        imagene,
    ]);
    // #endregion effects


    // #region render
    const rowsHeader = (
        <>
            <div>
                tag
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
        </>
    );

    return (
        <StyledImagene>
            {imagene && (
                <div>
                    <StyledHeader>
                        <div>
                            <h1>
                                {imagene.name}
                            </h1>
                        </div>

                        <StyledHeaderProject>
                            <PluridDropdown
                                selected={selectedProject}
                                selectables={[
                                    'none',
                                    ...stateProjects.map(project => project.name)
                                ]}
                                atSelect={(projectName) => {
                                    if (typeof projectName === 'string') {
                                        if (projectName === 'none') {
                                            setSelectedProject('project');
                                        } else {
                                            setSelectedProject(projectName);
                                        }
                                    }
                                }}
                                selectAtHover={false}
                                style={{
                                    fontSize: '1rem',
                                }}
                                width={170}
                            />
                        </StyledHeaderProject>
                    </StyledHeader>

                    <EntityView
                        generalTheme={stateGeneralTheme}
                        interactionTheme={stateInteractionTheme}

                        rowTemplate="auto 180px 90px 160px 30px"
                        rowsHeader={rowsHeader}
                        rows={filteredRows}
                        noRows="no imagene tags"

                        filterUpdate={filterUpdate}
                    />
                </div>
            )}
        </StyledImagene>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): ImageneStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateProjects: selectors.data.getProjects(state),
    stateImagenes: selectors.data.getImagenes(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ImageneDispatchProperties => ({
    dispatchObliterateImageneTag: (
        payload,
    ) => dispatch(
        actions.data.obliterateImageneTag(payload),
    ),
});
// #endregion module



// #region exports
export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Imagene);
// #endregion exports
