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
    // import client from '#kernel-services/graphql/client';
    // import {
    // } from '#kernel-services/graphql/mutate';

    import {
        StyledPluridTextline,
        StyledPluridPureButton,
        StyledPluridLinkButton,
    } from '#kernel-services/styled';
    // #endregion external


    // #region internal
    import {
        StyledImagene,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface ImageneProperties {
    // #region required
        // #region values
        theme: Theme;
        providerID: string;
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

const Imagene: React.FC<ImageneProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
                theme,
                providerID,
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
        imageneName,
        setImageneName,
    ] = useState('');
    // #endregion state


    // #region handlers
    const addImagene = async () => {
        if (!imageneName) {
            return;
        }

        // const input = {
        //     value: imageneName,
        // };

        // const mutation = await client.mutate({
        //     mutation: ADD_IMAGENE,
        //     variables: {
        //         input,
        //     },
        // });
        // console.log('mutation', mutation);
    }
    // #endregion handlers


    // #region render
    return (
        <StyledImagene
            theme={theme}
        >
            <div>
                <h1>
                    add imagene
                </h1>

                <div>
                    <StyledPluridTextline
                        text={imageneName}
                        placeholder="name"
                        atChange={(event) => setImageneName(event.target.value)}
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
                        text="Add Imagene"
                        atClick={() => {
                            action();
                            addImagene();
                        }}
                        level={2}
                        disabled={!imageneName}
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
        </StyledImagene>
    );
    // #endregion render
}
// #endregion module



// #region external
export default Imagene;
// #endregion external
