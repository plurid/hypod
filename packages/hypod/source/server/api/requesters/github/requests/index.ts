import https from 'https';
import fs from 'fs';
import path from 'path';
import Zip from 'adm-zip';

import {
    BASE_PATH_REPOSITORIES,
} from '#server/data/constants';

import {
    Provider,
    Repository,
} from '#server/data/interfaces';

import {
    requester,
} from '../requester';

import {
    VIEWER_LOGIN,
    QUERY_REPOSITORIES,
    QUERY_REPOSITORY_BY_NAME_OWNER,
} from '../query';



export const getOwner = async (
    provider: Provider,
) => {
    const client = requester(provider.token);

    const query = await client.query({
        query: VIEWER_LOGIN,
    });

    const {
        data,
    } = query;

    if (!data) {
        return;
    }

    const {
        login,
    } = data.viewer;

    return {
        identonym: login,
    };
}


export const downloadRepository = async (
    url: string,
    filepath: string,
) => {
    return new Promise((resolve, reject) => {
        https.get(url, response => {
            response.on('data', (data) => {
                fs.appendFileSync(
                    filepath,
                    data,
                );
            });

            response.on('end', () => {
                resolve(filepath);
            });

            response.on('error', () => {
                reject(0);
            })
        });
    });
}


export const getRepository = async (
    url: string,
    name: string,
) => {
    const repositoryPath = BASE_PATH_REPOSITORIES + 'github/' + name;
    const resolvedRepositoryPath = path.join(process.cwd(), repositoryPath);
    const resolvedArchivePath = path.join(resolvedRepositoryPath, '/archive.zip');
    const resolvedDataPath = path.join(resolvedRepositoryPath, '/data');

    try {
        fs.mkdirSync(repositoryPath, {
            recursive: true,
        });

        fs.mkdirSync(resolvedDataPath, {
            recursive: true,
        });
    } catch (error) {
        return;
    }


    await downloadRepository(
        url,
        resolvedArchivePath,
    );


    const zip = new Zip(resolvedArchivePath);
    zip.extractAllTo(resolvedDataPath, true);
}


export const getRepositoriesData = async (
    provider: Provider,
) => {
    try {
        const client = requester(provider.token);

        const query = await client.query({
            query: QUERY_REPOSITORIES,
        });

        const {
            data,
        } = query;

        if (!data) {
            return;
        }

        const repositoriesData = data.viewer.repositories.nodes;

        const repositories: Repository[] = repositoriesData.map(
            (providerRepository: any) => {
                const {
                    nameWithOwner,
                    databaseId,
                    isPrivate,
                } = providerRepository;

                const repository: Repository = {
                    id: databaseId,
                    name: nameWithOwner,
                    isPrivate,
                };

                return repository;
            }
        );

        return repositories;
    } catch (error) {
        return;
    }
}


export const getRepositoryDataByNameWithOwner = async (
    provider: Provider,
    nameWithOwner: string,
) => {
    try {
        const client = requester(provider.token);

        const split = nameWithOwner.split('/');
        const owner = split[0];
        const name = split[1];

        const query = await client.query({
            query: QUERY_REPOSITORY_BY_NAME_OWNER,
            variables: {
                name,
                owner,
            },
        });

        const {
            data,
        } = query;

        if (!data) {
            return;
        }

        const {
            defaultBranchRef,
        } = data.repository;
        const url = defaultBranchRef.target.zipballUrl;

        const repositoryData: Repository = {
            id: data.repository.databaseId,
            isPrivate: data.repository.isPrivate,
            name: data.repository.nameWithOwner,
            zipURL: url,
        };

        return repositoryData;
    } catch (error) {
        return;
    }
}
