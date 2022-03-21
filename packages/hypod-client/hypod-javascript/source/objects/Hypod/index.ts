// #region imports
    // #region libraries
    import {
        ApolloClient,
        NormalizedCacheObject,
        DocumentNode,
    } from '@apollo/client/core';
    // #endregion libraries


    // #region external
    import {
        HypodOptions,
    } from '~data/interfaces';

    import {
        client,
    } from '~services/graphql';
    // #endregion external
// #endregion imports



// #region module
class Hypod {
    private client: ApolloClient<NormalizedCacheObject>;
    private options: HypodOptions;


    constructor(
        endpoint: string,
        token: string,
        options?: Partial<HypodOptions>,
    ) {
        this.client = client(endpoint, token);
        this.options = this.resolveOptions(options);
    }


    private resolveOptions(
        options?: Partial<HypodOptions>,
    ) {
        const resolvedOptions: HypodOptions = {
            log: options?.log ?? false,
        };

        return resolvedOptions;
    }

    private logError<E = any>(
        message: string,
        error?: E,
    ) {
        const messageText = 'hypod > ' + message;
        if (this.options.log) {
            console.log(messageText, error);
        }
    }


    public async execute<I = any>(
        input: I,
        mutation: DocumentNode,
        mutationName: string,
    ) {
        try {
            const request = await this.client.mutate({
                mutation,
                variables: {
                    input,
                },
            });

            return request.data[mutationName];
        } catch (error) {
            this.logError('execute failed', error);
            return;
        }
    }
}
// #endregion module



// #region exports
export default Hypod;
// #endregion exports
