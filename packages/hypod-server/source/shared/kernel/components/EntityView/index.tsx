// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        universal,
    } from '@plurid/plurid-ui-components-react';
    // #endregion libraries


    // #region internal
    import {
        StyledEntityView,
        StyledEntityList,
        StyledEntityListItem,
        StyledActionButton,
        StyledNoRows,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    buttons: {
        PureButton: PluridPureButton,
    },
    inputs: {
        Textline: PluridTextline,
    },
} = universal;


export interface EntityViewProperties {
    // #region required
        // #region values
        generalTheme: Theme;
        interactionTheme: Theme;

        rowsHeader: JSX.Element;
        rowTemplate: string;
        rows: JSX.Element[];
        noRows: string;

        actionButtonText?: string;
        // #endregion values

        // #region methods
        actionButtonClick?: () => void;
        filterUpdate?: any;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const EntityView: React.FC<EntityViewProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            generalTheme,
            interactionTheme,

            rowsHeader,
            rowTemplate,
            rows,
            noRows,

            actionButtonText,
            // #endregion values

            // #region methods
            actionButtonClick,
            filterUpdate,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;
    // #endregion properties


    // #region state
    const [
        searchValue,
        setSearchValue,
    ] = useState('');
    // #endregion state


    // #region render
    return (
        <StyledEntityView
            theme={generalTheme}
        >
            <PluridTextline
                text={searchValue}
                placeholder="filter"
                atChange={(event) => {
                    const {
                        value,
                    } = event.target;

                    setSearchValue(value);

                    if (filterUpdate) {
                        filterUpdate(value);
                    }
                }}
                theme={interactionTheme}
                spellCheck={false}
                autoCapitalize="false"
                autoComplete="false"
                autoCorrect="false"
                level={2}
                style={{
                    width: '300px',
                    marginBottom: '30px',
                }}
            />

            {rows.length === 0 && (
                <StyledNoRows>
                    {noRows} {searchValue ? 'for this filter' : ''}
                </StyledNoRows>
            )}

            {rows.length !== 0 && (
                <StyledEntityList
                    theme={generalTheme}
                >
                    <ul>
                        <StyledEntityListItem
                            rowTemplate={rowTemplate}
                        >
                            {rowsHeader}
                        </StyledEntityListItem>

                        {rows.map(row => {
                            return (
                                <StyledEntityListItem
                                    key={Math.random() + ''}
                                    rowTemplate={rowTemplate}
                                >
                                    {row}
                                </StyledEntityListItem>
                            );
                        })}
                    </ul>
                </StyledEntityList>
            )}

            {actionButtonText && (
                <StyledActionButton>
                    <PluridPureButton
                        text={actionButtonText}
                        atClick={() => actionButtonClick
                            ? actionButtonClick() : undefined
                        }
                        theme={interactionTheme}
                        level={2}
                    />
                </StyledActionButton>
            )}
        </StyledEntityView>
    );
    // #endregion render
}
// #endregion module



// #region external
export default EntityView;
// #endregion external
