import fetch from 'cross-fetch';

import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
} from '@apollo/client';

import {
    GITHUB_API,
} from '#server/data/constants';



export const requester = (
    token: string,
) => new ApolloClient({
    link: createHttpLink({
        uri: GITHUB_API,
        credentials: 'include',
        fetch,
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    }),
    cache: new InMemoryCache(),
});
