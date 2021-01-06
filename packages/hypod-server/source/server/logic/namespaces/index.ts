// #region imports
    // #region libraries
    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        Namespace,
    } from '~server/data/interfaces';

    import database from '~server/services/database';
    // #endregion external
// #endregion imports



// #region module
const registerNamespace = async (
    name: string,
    identonym: string,
) => {
    const id = uuid.generate();

    const namespace: Namespace = {
        id,
        name,
        generatedAt: Math.floor(Date.now() / 1000),
        generatedBy: identonym,
    };

    await database.store(
        'namespace',
        id,
        namespace,
    );
}


const deregisterNamespace = async (
    id: string,
) => {
    try {
        await database.obliterate(
            'namespace',
            id,
        );
    } catch (error) {
        return;
    }
}
// #endregion module



// #region exports
export {
    registerNamespace,
    deregisterNamespace,
};
// #endregion exports
