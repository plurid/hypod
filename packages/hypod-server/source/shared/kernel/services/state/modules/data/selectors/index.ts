// #region imports
    // #region external
    import {
        AppState,
    } from '../../../store';
    // #endregion external
// #endregion imports



// #region module
const getActiveProviderID = (state: AppState) => state.data.activeProviderID;
const getNamespaces = (state: AppState) => state.data.namespaces;
const getProjects = (state: AppState) => state.data.projects;
const getImagenes = (state: AppState) => state.data.imagenes;
const getNotFoundFace = (state: AppState) => state.data.notFoundFace;



const selectors = {
    getActiveProviderID,
    getNamespaces,
    getProjects,
    getImagenes,
    getNotFoundFace,
};
// #endregion module



// #region exports
export default selectors;
// #endregion exports
