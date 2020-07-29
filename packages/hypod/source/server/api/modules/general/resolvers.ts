import merge from 'lodash.merge';




const generateResolvers = (...imports: any[]) => {
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
