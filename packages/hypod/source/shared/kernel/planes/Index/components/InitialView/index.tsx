// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridPureButton,
    } from '@plurid/plurid-ui-react';
    // #endregion libraries


    // #region external
    import hypodLogo from '../../assets/hypod-logo.png';
    // #endregion external


    // #region internal
    import {
        StyledInitialView,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface InitialViewProperties {
    // #region required
        // #region values
        // #endregion values

        // #region methods
        setView: React.Dispatch<React.SetStateAction<string>>;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const InitialView: React.FC<InitialViewProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            // #endregion values

            // #region methods
            setView,
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


    // #region render
    return (
        <StyledInitialView>
            <div>
                <img
                    src={hypodLogo}
                    alt="hypod logo"
                    height={250}
                />
            </div>

            <h1>
                hypod
            </h1>

            <h2>
                Cloud-Native Imagene Registry
            </h2>

            <div
                style={{
                    width: '200px',
                    margin: '50px auto',
                }}
            >
                <PluridPureButton
                    text="Initial Setup"
                    atClick={() => {
                        setView('setup')
                    }}
                    level={2}
                />
            </div>
        </StyledInitialView>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default InitialView;
// #endregion exports
