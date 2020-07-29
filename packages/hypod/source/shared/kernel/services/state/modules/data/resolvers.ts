import * as Types from './types';



export const setActiveProviderID = (
    state: Types.State,
    action: Types.SetActiveProviderIDAction,
): Types.State => {
    return {
        ...state,
        activeProviderID: action.payload,
    };
}


export const setProviders = (
    state: Types.State,
    action: Types.SetProvidersAction,
): Types.State => {
    return {
        ...state,
        providers: [
            ...action.payload,
        ],
    };
}


export const setRepositories = (
    state: Types.State,
    action: Types.SetRepositoriesAction,
): Types.State => {
    return {
        ...state,
        repositories: [
            ...action.payload,
        ],
    };
}


export const setWebhooks = (
    state: Types.State,
    action: Types.SetWebhooksAction,
): Types.State => {
    return {
        ...state,
        webhooks: [
            ...action.payload,
        ],
    };
}


export const setTriggers = (
    state: Types.State,
    action: Types.SetTriggersAction,
): Types.State => {
    return {
        ...state,
        triggers: [
            ...action.payload,
        ],
    };
}


export const setBuilds = (
    state: Types.State,
    action: Types.SetBuildsAction,
): Types.State => {
    return {
        ...state,
        builds: [
            ...action.payload,
        ],
    };
}



export const resolvers = {
    setActiveProviderID,
    setProviders,
    setRepositories,
    setWebhooks,
    setTriggers,
    setBuilds,
};
