import {
    Imagene,
} from '#server/data/interfaces';



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



export interface State {
    activeProviderID: string;
    imagenes: Imagene[];
}


export type Actions =
    | RemoveEntityAction
    | SetActiveProviderIDAction;
