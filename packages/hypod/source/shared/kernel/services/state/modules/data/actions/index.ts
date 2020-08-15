// #region imports
    // #region external
    import * as Types from '../types';

    import {
        Imagene,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const removeEntity = (
    payload: Types.RemoveEntityPayload,
): Types.RemoveEntityAction => {
    return {
        type: Types.REMOVE_ENTITY,
        payload,
    };
}


export const setActiveProviderID = (
    providerID: string,
): Types.SetActiveProviderIDAction => {
    return {
        type: Types.SET_ACTIVE_PROVIDER_ID,
        payload: providerID,
    };
}


export const setImagenes = (
    imagenes: Imagene[],
): Types.SetImagenesAction => {
    return {
        type: Types.SET_IMAGENES,
        payload: imagenes,
    };
}


export const togglePublicImagene = (
    payload: Types.ToggleImagenePublicPayload,
): Types.ToggleImagenePublicAction => {
    return {
        type: Types.TOGGLE_IMAGENE_PUBLIC,
        payload,
    };
}



const actions = {
    removeEntity,
    setActiveProviderID,
    setImagenes,
    togglePublicImagene,
};
// #endregion module



// #region exports
export default actions;
// #endregion exports
