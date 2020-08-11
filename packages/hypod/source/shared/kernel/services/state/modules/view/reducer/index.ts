// #region imports
import initialState from '../initial';
import resolvers from '../resolvers';
import * as Types from '../types';
// #endregion imports



// #region module
const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case Types.SET_VIEW_LOADING:
            return resolvers.setViewLoading(state, action);
        case Types.SET_VIEW_TYPE:
            return resolvers.setViewType(state, action);
        case Types.SET_VIEW_COMPACT_SELECTORS:
            return resolvers.setViewCompactSelectors(state, action);
        default:
            return {
                ...state,
            };
    }
}
// #endregion module



// #region exports
export default reducer;
// #endregion exports
