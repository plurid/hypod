// #region imports
    // #region libraries
    import merge from 'lodash.merge';
    // #endregion libraries

    // #region internal
    import imagenes from './imagenes/resolvers';
    // #endregion internal
// #endregion imports



// #region module
const generateResolvers = <T>(
    ...imports: T[]
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
);
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
