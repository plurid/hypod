// #region imports
import storage from '#server/services/storage';
// #endregion imports



// #region module
const setup = async () => {
    try {
        await storage.generateLocations();
    } catch (error) {
        return;
    }
}


export default setup;
// #endregion module
