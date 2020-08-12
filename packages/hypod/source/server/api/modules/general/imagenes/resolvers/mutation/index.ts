// #region imports
    // #region external
    import {
        Context,
    } from '#server/data/interfaces';

    import {
        Imagenes,
    } from '#server/api/models';
    // #endregion external
// #endregion imports



// #region module
const Mutation = {
    obliterateImagene: (
        _: any,
        { input }: any,
        context: Context,
    ) => Imagenes.Mutation.obliterateImagene(
        input,
        context,
    ),
    obliterateImageneTag: (
        _: any,
        { input }: any,
        context: Context,
    ) => Imagenes.Mutation.obliterateImageneTag(
        input,
        context,
    ),
};
// #endregion module



// #region exports
export default Mutation;
// #endregion exports
