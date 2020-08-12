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


export const setImagenes = (
    state: Types.State,
    action: Types.SetImagenesAction,
): Types.State => {
    return {
        ...state,
        imagenes: [
            ...action.payload,
        ],
    };
}



const resolvers = {
    removeEntity,
    setActiveProviderID,
    setImagenes,
};
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
