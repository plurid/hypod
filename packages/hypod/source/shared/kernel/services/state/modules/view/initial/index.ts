// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
const initialState: Types.State = {
    loading: true,
    indexGeneralSelector: 'imagenes',
    indexGeneralView: 'general',
    compactSelectors: false,
    ownerID: '',
    usageType: '',
};
// #endregion module



// #region exports
export default initialState;
// #endregion exports
