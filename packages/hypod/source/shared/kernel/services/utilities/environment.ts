// #region module
const environment = {
    local: process.env.ENV_MODE === 'local',
    localExternal: process.env.ENV_MODE === 'localExternal',
    development: process.env.ENV_MODE === 'development',
    production: process.env.ENV_MODE === 'production',
    customLogic: process.env.HYPOD_CUSTOM_LOGIC === 'true',
    privateUsage: process.env.HYPOD_PRIVATE_USAGE === 'true',
};
// #endregion module



// #region exports
export default environment;
// #endregion exports
