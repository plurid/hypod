import {
    AppState,
} from '../store';



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


export default selectors;
