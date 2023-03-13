// Edit file based on the project requirements.


const esModules = [
    // add dependencies to be bundled as ES modules
    // string or (dependency: string): string
];


const externals = [
    // add dependencies to be left as external to the server
    // string or (dependency: string): string
];


const environment = {
    // add environment variables replacements for frontend, e.g.
    // 'process.env.ENV_NAME': JSON.stringify(process.env.ENV_NAME || ''),
    'process.env.PLURID_LIVE_SERVER': JSON.stringify(''),
    'process.env.HYPOD_DOCKER_SERVICE': JSON.stringify(process.env.HYPOD_DOCKER_SERVICE),
};



exports.esModules = esModules;
exports.externals = externals;
exports.environment = environment;
