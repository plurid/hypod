// #region imports
import {
    AppState,
} from '../store';
// #endregion imports



// #region module
const getActiveProviderID = (state: AppState) => state.data.activeProviderID;
const getImagenes = (state: AppState) => state.data.imagenes;


const selectors = {
    getActiveProviderID,
    getImagenes,
};
// #endregion module


// #region exports
export default selectors;
// #endregion exports
