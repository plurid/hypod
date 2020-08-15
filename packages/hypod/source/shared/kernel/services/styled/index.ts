// #region imports
// #region libraries
import styled from 'styled-components';

import {
    PluridTextline,
    PluridPureButton,
    PluridLinkButton,
} from '@plurid/plurid-ui-react';
// #endregion libraries
// #endregion imports



// #region module
export const StyledPluridTextline = styled(PluridTextline)`
    margin: 20px auto;
    width: 350px;
`;


export const StyledPluridPureButton = styled(PluridPureButton)`
    margin: 20px auto;
    width: 250px;
`;


export const StyledPluridLinkButton = styled(PluridLinkButton)`
    display: grid;
    place-content: center;
    margin: 30px auto;
`;


export const StyledElementsInLine = styled.div`
    display: grid;
    grid-template-columns: 16px auto;
    align-items: center;
    grid-gap: 0.5rem;
`;
// #endregion module
