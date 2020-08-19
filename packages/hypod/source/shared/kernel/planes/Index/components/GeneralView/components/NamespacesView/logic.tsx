// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridIconDelete,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import {
        Namespace,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const namespaceRowRenderer = (
    namespace: Namespace,
    handleNamespaceObliterate: (
        id: string,
    ) => void,
) => {
    const {
        id,
        name
    } = namespace;

    return (
        <>
            <div>
                {name}
            </div>

            <PluridIconDelete
                atClick={() => handleNamespaceObliterate(id)}
            />
        </>
    );
}


export const createSearchTerms = (
    namespaces: Namespace[],
) => {
    const searchTerms = namespaces.map(
        namespace => {
            const {
                id,
                name
            } = namespace;

            const searchTerm = {
                id,
                data: [
                    name.toLowerCase(),
                ],
            };

            return searchTerm;
        },
    );

    return searchTerms;
}
// #endregion module
