// #region imports
import {
    dockerEntityMatchType,
} from '#server/data/constants';

import {
    DockerEntityMatchType,
} from '#server/data/interfaces';
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
// #endregion module
