// #region imports
import {
    AppState,
} from '../store';
// #endregion imports



// #region module
const getGeneralTheme = (state: AppState) => state.themes.general;
const getInteractionTheme = (state: AppState) => state.themes.interaction;


const selectors = {
    getGeneralTheme,
    getInteractionTheme,
};
// #endregion module


// #region exports
export default selectors;
// #endregion exports
