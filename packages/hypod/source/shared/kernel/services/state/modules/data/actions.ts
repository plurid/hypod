import * as Types from './types';

import {
    ClientProvider,
    Repository,
    Webhook,
    Trigger,
    Build,
} from '#server/data/interfaces';



export const setActiveProviderID = (
    providerID: string,
): Types.SetActiveProviderIDAction => {
    return {
        type: Types.SET_ACTIVE_PROVIDER_ID,
        payload: providerID,
    };
}


export const setProviders = (
    providers: ClientProvider[],
): Types.SetProvidersAction => {
    return {
        type: Types.SET_PROVIDERS,
        payload: providers,
    };
}


export const setRepositories = (
    repositories: Repository[],
): Types.SetRepositoriesAction => {
    return {
        type: Types.SET_REPOSITORIES,
        payload: repositories,
    };
}


export const setWebhooks = (
    webhooks: Webhook[],
): Types.SetWebhooksAction => {
    return {
        type: Types.SET_WEBHOOKS,
        payload: webhooks,
    };
}


export const setTriggers = (
    triggers: Trigger[],
): Types.SetTriggersAction => {
    return {
        type: Types.SET_TRIGGERS,
        payload: triggers,
    };
}


export const setBuilds = (
    builds: Build[],
): Types.SetBuildsAction => {
    return {
        type: Types.SET_BUILDS,
        payload: builds,
    };
}



export const actions = {
    setActiveProviderID,
    setProviders,
    setRepositories,
    setWebhooks,
    setTriggers,
    setBuilds,
};
