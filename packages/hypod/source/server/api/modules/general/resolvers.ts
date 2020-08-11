// #region imports
import merge from 'lodash.merge';
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
);


export default resolvers;
// #endregion module
