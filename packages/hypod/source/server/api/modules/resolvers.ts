import General from './general/resolvers';

import dateResolver from './date';



const resolvers = {
    ...General,
    ...dateResolver,
};


export default resolvers;
