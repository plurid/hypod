// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridComponent,
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


const shell: PluridComponent = {
    kind: 'react',
    element: Shell,
};
// #endregion module



// #region exports
export default shell;
// #endregion exports
