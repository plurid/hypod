export const getFromMatch = (
    match: RegExpMatchArray,
    type: 'name' | 'reference' | 'digest' | 'uuid',
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
