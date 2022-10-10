// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        GlobalStyle,
    } from './styled';
    // #endregion external
// #endregion imports



// #region module
export interface ShellProperties {
    children: React.ReactNode;
}

const Shell: React.FC<ShellProperties> = (
    properties,
) => {
    /** properties */
    const {
        children,
    } = properties;


    /** render */
    return (
        <>
            <GlobalStyle />

            {children}
        </>
    );
}


const shell: PluridReactComponent = Shell;
// #endregion module



// #region exports
export default shell;
// #endregion exports
