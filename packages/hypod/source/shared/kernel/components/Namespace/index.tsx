// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import client from '#kernel-services/graphql/client';
    import {
        GENERATE_NAMESPACE,
    } from '#kernel-services/graphql/mutate';

    import {
        StyledPluridTextline,
        StyledPluridPureButton,
        StyledPluridLinkButton,
    } from '#kernel-services/styled';
    // #endregion external


    // #region internal
    import {
        StyledNamespace,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface NamespaceProperties {
    // #region required
        // #region values
        theme: Theme;
        // #endregion values

        // #region methods
        action: () => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        // #endregion values

        // #region methods
        cancel?: () => void;
        // #endregion methods
    // #endregion optional
}

const Namespace: React.FC<NamespaceProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            theme,
            // #endregion values

            // #region methods
            action,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            // #endregion values

            // #region methods
            cancel,
            // #endregion methods
        // #endregion optional
    } = properties;
    // #endregion properties


    // #region state
    const [
        namespaceName,
        setNamespaceName,
    ] = useState('');
    // #endregion state


    // #region handlers
    const setNamespace = async () => {
        if (!namespaceName) {
            return;
        }

        const input = {
            value: namespaceName,
        };

        await client.mutate({
            mutation: GENERATE_NAMESPACE,
            variables: {
                input,
            },
        });
    }
    // #endregion handlers


    // #region render
    return (
        <StyledNamespace
            theme={theme}
        >
            <div>
                <h1>
                    register namespace
                </h1>

                <div>
                    <StyledPluridTextline
                        text={namespaceName}
                        placeholder="name"
                        atChange={(event) => setNamespaceName(event.target.value)}
                        spellCheck={false}
                        autoCapitalize="false"
                        autoComplete="false"
                        autoCorrect="false"
                        theme={theme}
                        level={2}
                    />
                </div>

                <div>
                    <StyledPluridPureButton
                        text="Register Namespace"
                        atClick={() => {
                            action();
                            setNamespace();
                        }}
                        level={2}
                        disabled={!namespaceName}
                    />
                </div>

                {cancel && (
                    <div>
                        <StyledPluridLinkButton
                            text="cancel"
                            atClick={() => cancel()}
                            theme={theme}
                            level={2}
                        />
                    </div>
                )}
            </div>
        </StyledNamespace>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Namespace;
// #endregion exports
