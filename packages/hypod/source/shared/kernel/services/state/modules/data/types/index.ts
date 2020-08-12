// #region imports
    // #region external
    import {
        Imagene,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export type RemovableEntityType =
    | 'imagene';

export const REMOVE_ENTITY = 'REMOVE_ENTITY';
export interface RemoveEntityPayload {
    type: RemovableEntityType;
    id: string;
}
export interface RemoveEntityAction {
    type: typeof REMOVE_ENTITY;
    payload: RemoveEntityPayload;
}


export const SET_ACTIVE_PROVIDER_ID = 'SET_ACTIVE_PROVIDER_ID';
export interface SetActiveProviderIDAction {
    type: typeof SET_ACTIVE_PROVIDER_ID;
    payload: string;
}


export const SET_IMAGENES = 'SET_IMAGENES';
export interface SetImagenesAction {
    type: typeof SET_IMAGENES;
    payload: Imagene[];
}



export interface State {
    activeProviderID: string;
    imagenes: Imagene[];
}


export type Actions =
    | RemoveEntityAction
    | SetActiveProviderIDAction
    | SetImagenesAction;
// #endregion module
