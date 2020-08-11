import * as Types from './types';



export const setViewLoading = (
    payload: boolean,
): Types.SetViewLoadingAction => {
    return {
        type: Types.SET_VIEW_LOADING,
        payload,
    };
}


export const setViewType = (
    payload: Types.SetViewTypePayload,
): Types.SetViewTypeAction => {
    return {
        type: Types.SET_VIEW_TYPE,
        payload,
    };
}


export const setViewCompactSelectors = (
    payload: boolean,
): Types.SetViewCompactSelectorsAction => {
    return {
        type: Types.SET_VIEW_COMPACT_SELECTORS,
        payload,
    };
}



export const actions = {
    setViewLoading,
    setViewType,
    setViewCompactSelectors,
};
