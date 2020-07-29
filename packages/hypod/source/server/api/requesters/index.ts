import github from './github';

import {
    loadProviders,
} from '#server/logic/loader';

import {
    BITBUCKET_PROVIDER,
    GITHUB_PROVIDER,
} from '#server/data/constants';



export const getProvider = async (
    providerID: string,
) => {
    const providers = await loadProviders();
    const provider = providers.find(
        provider => provider.id === providerID,
    );

    return provider;
}


export const getRepositoriesData = async (
    providerID: string,
) => {
    const provider = await getProvider(providerID);
    if (!provider) {
        return;
    }

    switch (provider.type) {
        case BITBUCKET_PROVIDER:
            return;
        case GITHUB_PROVIDER:
            return github.getRepositoriesData(
                provider,
            );
    }
}


export const getRepositoryDataByNameWithOwner = async (
    providerID: string,
    nameWithOwner: string,
) => {
    const provider = await getProvider(providerID);
    if (!provider) {
        return;
    }

    switch (provider.type) {
        case BITBUCKET_PROVIDER:
            return;
        case GITHUB_PROVIDER:
            return github.getRepositoryDataByNameWithOwner(
                provider,
                nameWithOwner,
            );
    }
}


export const getRepository = async (
    providerID: string,
    url: string,
    name: string,
) => {
    const provider = await getProvider(providerID);
    if (!provider) {
        return;
    }

    switch (provider.type) {
        case BITBUCKET_PROVIDER:
            return;
        case GITHUB_PROVIDER:
            return github.getRepository(
                url,
                name,
            );
    }
}


export const getOwner = async (
    providerID: string,
) => {
    const provider = await getProvider(providerID);
    if (!provider) {
        return;
    }

    switch (provider.type) {
        case BITBUCKET_PROVIDER:
            return;
        case GITHUB_PROVIDER:
            return github.getOwner(
                provider,
            );
    }
}
