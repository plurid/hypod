// #region imports
    // #region libraries
    import fs from 'fs';

    import path from 'path';
    // #endregion libraries

    // #region external
    // import {
    //     imagenesPath,
    // } from '#server/data/constants';

    import {
        Context,
    } from '#server/data/interfaces';
    // #endregion external
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
        logic,
    } = context;

    const {
        id,
        tag,
    } = input;

    if (logic?.obliterateOwnerImageneTag) {
        const status = await logic.obliterateOwnerImageneTag(
            id,
            tag,
        );

        return {
            status,
        };
    }

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
