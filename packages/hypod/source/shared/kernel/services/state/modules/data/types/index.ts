// #region imports
    // #region external
    import {
        Namespace,
        Project,
        Imagene,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export type RemovableEntityType =
    | 'namespace'
    | 'project'
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


export const TOGGLE_IMAGENE_PUBLIC = 'TOGGLE_IMAGENE_PUBLIC';
export interface ToggleImagenePublicPayload {
    id: string;
    value: boolean;
}
export interface ToggleImagenePublicAction {
    type: typeof TOGGLE_IMAGENE_PUBLIC;
    payload: ToggleImagenePublicPayload;
}


export const OBLITERATE_IMAGENE_TAG = 'OBLITERATE_IMAGENE_TAG';
export interface ObliterateImageneTagPayload {
    imageneID: string;
    tagID: string;
}
export interface ObliterateImageneTagAction {
    type: typeof OBLITERATE_IMAGENE_TAG;
    payload: ObliterateImageneTagPayload;
}



export interface State {
    activeProviderID: string;
    namespaces: Namespace[];
    projects: Project[];
    imagenes: Imagene[];
}


export type Actions =
    | RemoveEntityAction
    | SetActiveProviderIDAction
    | SetImagenesAction
    | ToggleImagenePublicAction
    | ObliterateImageneTagAction;
// #endregion module
