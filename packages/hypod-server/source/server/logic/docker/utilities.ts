// #region imports
    // #region external
    import {
        dockerEntityMatchType,
    } from '~server/data/constants';

    import {
        DockerEntityMatchType,
        DockerManifestLayer,
    } from '~server/data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const getFromMatch = (
    match: RegExpMatchArray,
    type: DockerEntityMatchType,
) => {
    switch (type) {
        case dockerEntityMatchType.name:
            return match[1];
        case dockerEntityMatchType.reference:
            return match[2];
        case dockerEntityMatchType.digest:
            return match[2];
        case dockerEntityMatchType.uuid:
            return match[2];
        default:
            return;
    }
}


export const normalizeSize = (
    layers: DockerManifestLayer[],
) => {
    return layers.map(layer => {
        const {
            size,
        } = layer;

        return {
            ...layer,
            size: size - 1,
        };
    });
}
// #endregion module
