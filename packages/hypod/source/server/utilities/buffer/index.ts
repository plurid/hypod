// #region imports
    // #region external
    import {
        HypodRequest,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const getBufferData = (
    request: HypodRequest,
) => {
    const rawBody = request.rawBody || '';

    const bufferData = Buffer.from(
        rawBody,
        'binary',
    );

    return bufferData;
}
// #endregion module



// #region exports
export {
    getBufferData,
};
// #endregion exports
