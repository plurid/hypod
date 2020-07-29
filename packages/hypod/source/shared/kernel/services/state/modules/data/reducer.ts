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
        case Types.SET_ACTIVE_PROVIDER_ID:
            return resolvers.setActiveProviderID(state, action);
        case Types.SET_PROVIDERS:
            return resolvers.setProviders(state, action);
        case Types.SET_REPOSITORIES:
            return resolvers.setRepositories(state, action);
        case Types.SET_WEBHOOKS:
            return resolvers.setWebhooks(state, action);
        case Types.SET_TRIGGERS:
            return resolvers.setTriggers(state, action);
        case Types.SET_BUILDS:
            return resolvers.setBuilds(state, action);
        default:
            return {
                ...state,
            };
    }
}
