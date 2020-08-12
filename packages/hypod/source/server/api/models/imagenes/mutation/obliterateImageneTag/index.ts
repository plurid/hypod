// #region imports
import fs from 'fs';

import path from 'path';

// import {
//     imagenesPath,
// } from '#server/data/constants';

import {
    Context,
} from '#server/data/interfaces';
// #endregion imports



// #region module
const deregisterImageneTag = async (
    id: string,
    tag: string,
) => {
    try {
        // const imagenePath = path.join(
        //     imagenesPath,
        //     id + '.json',
        // );

        // if (!fs.existsSync(imagenePath)) {
        //     return;
        // }

        // fs.promises.unlink(imagenePath);
    } catch (error) {
        return;
    }
}


const obliterateImageneTag = async (
    input: any,
    context: Context,
) => {
    const {
        id,
        tag,
    } = input;

    await deregisterImageneTag(
        id,
        tag,
    );

    return {
        status: true,
    };
}
// #endregion module



// #region exports
export default obliterateImageneTag;
// #endregion exports
