import styled from 'styled-components';



export interface IStyledInitialView {
}

export const StyledInitialView = styled.div<IStyledInitialView>`
    padding: 3rem;
    display: grid;
    place-content: center;
    text-align: center;

    h1 {
        font-size: 1.3rem;
        margin: 1.5rem;
    }

    h2 {
        font-size: 1.1rem;
        margin: 1.5rem;
    }
`;
