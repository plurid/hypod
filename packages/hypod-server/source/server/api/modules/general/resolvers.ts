// #region imports
    // #region libraries
    import merge from 'lodash.merge';
    // #endregion libraries

    // #region internal
    import imagenes from './imagenes/resolvers';
    import namespaces from './namespaces/resolvers';
    import owner from './owner/resolvers';
    import projects from './projects/resolvers';
    // #endregion internal
// #endregion imports



// #region module
const generateResolvers = (
    ...imports: any[]
) => {
    const resolvers = {};

    merge(
        resolvers,
        ...imports,
    );

    return resolvers;
}


const resolvers = generateResolvers(
    imagenes,
    namespaces,
    owner,
    projects,
);
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
