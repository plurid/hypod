// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
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


const resolvers = {
    removeEntity,
    setActiveProviderID,
};
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
