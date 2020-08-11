import * as Types from './types';

import {
    initialState,
} from './initial';

import {
    resolvers,
} from './resolvers';



export const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case Types.REMOVE_ENTITY:
            return resolvers.removeEntity(state, action);
        case Types.SET_ACTIVE_PROVIDER_ID:
            return resolvers.setActiveProviderID(state, action);
        default:
            return {
                ...state,
            };
    }
}
