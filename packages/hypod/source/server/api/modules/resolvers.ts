// #region imports
import General from './general/resolvers';

import dateResolver from './date';
// #endregion imports



// #region module
const resolvers = {
    ...General,
    ...dateResolver,
};


export default resolvers;
// #endregion module
