// #region imports
    // #region external
    import {
        AppState,
    } from '#kernel-services/state/store';
    // #endregion external
// #endregion imports



// #region module
const getLoading = (state: AppState) => state.view.loading;
const getIndexGeneralSelector = (state: AppState) => state.view.indexGeneralSelector;
const getIndexGeneralView = (state: AppState) => state.view.indexGeneralView;
const getViewCompactSelectors = (state: AppState) => state.view.compactSelectors;


const selectors = {
    getLoading,
    getIndexGeneralSelector,
    getIndexGeneralView,
    getViewCompactSelectors,
};
// #endregion module



// #region exports
export default selectors;
// #endregion exports
