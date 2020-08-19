// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
const initialState: Types.State = {
    loading: true,
    indexView: '',
    indexGeneralView: 'general',
    indexGeneralSelector: 'imagenes',
    compactSelectors: false,
    ownerID: '',
    usageType: '',
};
// #endregion module



// #region exports
export default initialState;
// #endregion exports
