// #region module
const environment = {
    local: process.env.ENV_MODE === 'local',
    localExternal: process.env.ENV_MODE === 'localExternal',
    development: process.env.ENV_MODE === 'development',
    production: process.env.ENV_MODE === 'production',
    dockerService: process.env.HYPOD_DOCKER_SERVICE || '',
};
// #endregion module



// #region exports
export default environment;
// #endregion exports
