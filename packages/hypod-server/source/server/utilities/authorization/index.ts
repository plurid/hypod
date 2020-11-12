// #region imports
    // #region external
    import {
        HypodRequest,
    } from '#server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const getAuthorizationHeader = (
    request: HypodRequest,
) => {
    const authorizationHeader = request.header('Authorization') || '';

    if (!authorizationHeader) {
        return;
    }

    const authorizationValueBase64 = authorizationHeader.replace('Basic ', '');
    const base64Buffer = Buffer.from(authorizationValueBase64, 'base64');
    const authorizationValue = base64Buffer.toString('utf-8');
    const split = authorizationValue.split(':');
    const identonym = split[0] || '';
    const key = split[1] || '';

    if (!identonym || !key) {
        return;
    }

    return {
        identonym,
        key,
    };
}
// #endregion module



// #region exports
export {
    getAuthorizationHeader,
};
// #endregion exports
