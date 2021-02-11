// #region imports
    // #region libraries
    import crypto from 'crypto';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * https://stackoverflow.com/a/27970509
 *
 * @param message
 */
const sha256 = async (
    message: string,
) => {
    return crypto.createHash('sha256').update(message).digest('hex');
}
// #endregion module



// #region exports
export {
    sha256,
};
// #endregion exports
