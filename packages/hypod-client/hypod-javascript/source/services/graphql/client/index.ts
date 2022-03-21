// #region imports
    // #region libraries
    import fetch from 'cross-fetch';

    import {
        ApolloClient,
        HttpLink,
        InMemoryCache,
    } from '@apollo/client/core';
    // #endregion libraries
// #endregion imports



// #region module
const client = (
    uri: string,
    token: string,
) => {
    const httpLink = new HttpLink({
        uri,
        credentials: 'include',
        fetch,
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    return new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
    });
};
// #endregion module



// #region exports
export default client;
// #endregion exports
