// #region imports
    // #region external
    import {
        AppState,
    } from '../../../store';
    // #endregion external
// #endregion imports



// #region module
const getActiveProviderID = (state: AppState) => state.data.activeProviderID;
const getImagenes = (state: AppState) => state.data.imagenes;
const getProjects = (state: AppState) => state.data.projects;


const selectors = {
    getActiveProviderID,
    getImagenes,
    getProjects,
};
// #endregion module



// #region exports
export default selectors;
// #endregion exports
