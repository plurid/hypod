import * as Types from './types';



export const removeEntity = (
    state: Types.State,
    action: Types.RemoveEntityAction,
): Types.State => {
    const {
        id,
        type,
    } = action.payload;

    const newState = {
        ...state,
    };


    return {
        ...newState,
    };
}


export const setActiveProviderID = (
    state: Types.State,
    action: Types.SetActiveProviderIDAction,
): Types.State => {
    return {
        ...state,
        activeProviderID: action.payload,
    };
}



export const resolvers = {
    removeEntity,
    setActiveProviderID,
};
