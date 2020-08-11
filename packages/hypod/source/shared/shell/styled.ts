// #region imports
import {
    createGlobalStyle,
} from 'styled-components';
// #endregion imports



// #region module
export const GlobalStyle = createGlobalStyle`
    *, *::after, *::before {
        box-sizing: border-box;
    }

    html {
        height: 100%;
    }

    body {
        height: 100%;
        overflow: hidden;
        margin: 0;
        padding: 0;
        font-family: 'Ubuntu', 'Work Sans', -apple-system, BlinkMacSystemFont, 'Roboto',
            'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: white;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    #hypod-application {
        height: 100%;
        overflow: auto;
    }
`;
// #endregion module
