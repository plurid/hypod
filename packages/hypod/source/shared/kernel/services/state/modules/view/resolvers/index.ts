// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
export const setViewLoading = (
    state: Types.State,
    action: Types.SetViewLoadingAction,
): Types.State => {
    return {
        ...state,
        loading: action.payload,
    };
}


export const setViewType = (
    state: Types.State,
    action: Types.SetViewTypeAction,
): Types.State => {
    const {
        type,
        value,
    } = action.payload;

    switch (type) {
        case 'indexGeneralSelector':
            return {
                ...state,
                indexGeneralSelector: value,
            };
        case 'indexGeneralView':
            return {
                ...state,
                indexGeneralView: value,
            };
        default:
            return {
                ...state,
            };
    }
}


export const setViewCompactSelectors = (
    state: Types.State,
    action: Types.SetViewCompactSelectorsAction,
): Types.State => {
    return {
        ...state,
        compactSelectors: action.payload,
    };
}


export const setViewOwnerID = (
    state: Types.State,
    action: Types.SetViewOwnerIDAction,
): Types.State => {
    return {
        ...state,
        ownerID: action.payload,
    };
}


export const setViewUsageType = (
    state: Types.State,
    action: Types.SetViewUsageTypeAction,
): Types.State => {
    return {
        ...state,
        usageType: action.payload,
    };
}



const resolvers = {
    setViewLoading,
    setViewType,
    setViewCompactSelectors,
    setViewOwnerID,
    setViewUsageType,
};
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
