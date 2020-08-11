// #region imports
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
        case 'name':
            return match[1];
        case 'reference':
            return match[2];
        case 'digest':
            return match[2];
        case 'uuid':
            return match[2];
        default:
            return;
    }
}
// #endregion module
