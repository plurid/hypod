// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import {
        PluridPureButton,
    } from '@plurid/plurid-ui-react';
    // #endregion libraries


    // #region external
    import hypodLogo from '../../assets/hypod-logo.png';

    import {
        StyledPluridTextline,
    } from '#kernel-services/styled';
    // #endregion external


    // #region internal
    import {
        StyledPrivateView,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PrivateViewProperties {
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

const PrivateView: React.FC<PrivateViewProperties> = (
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
    } = properties;
    // #endregion properties


    // #region state
    const [
        identonym,
        setIdentonym
    ] = useState('');
    const [
        key,
        setKey
    ] = useState('');
    // #endregion state


    // #region handlers
    const login = async () => {
    }
    // #endregion handlers


    // #region render
    return (
        <StyledPrivateView>
            <div>
                <img
                    src={hypodLogo}
                    alt="hypod logo"
                    height={250}
                />
            </div>

            <h1>
                hypod private usage
            </h1>

            <div
                style={{
                    margin: '50px auto',
                }}
            >
                <StyledPluridTextline
                    text={identonym}
                    placeholder="identonym"
                    atChange={(event) => setIdentonym(event.target.value)}
                    level={2}
                />

                <StyledPluridTextline
                    text={key}
                    placeholder="key"
                    type="password"
                    atChange={(event) => setKey(event.target.value)}
                    level={2}
                />
            </div>

            <div
                style={{
                    width: '200px',
                    margin: '50px auto',
                }}
            >
                <PluridPureButton
                    text="Login"
                    atClick={() => login()}
                    level={2}
                />
            </div>
        </StyledPrivateView>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PrivateView;
// #endregion exports
