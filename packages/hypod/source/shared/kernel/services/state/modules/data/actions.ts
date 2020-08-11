import * as Types from './types';

import {

} from '#server/data/interfaces';



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



export const actions = {
    removeEntity,
    setActiveProviderID,
};
