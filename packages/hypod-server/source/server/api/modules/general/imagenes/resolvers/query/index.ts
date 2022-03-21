// #region imports
    // #region external
    import {
        Context,
        InputOf,
        InputValueString,
    } from '~server/data/interfaces';

    import {
        Imagenes,
    } from '~server/api/models';
    // #endregion external
// #endregion imports



// #region module
const Query = {
    getImagenes: (
        _: any,
        __: any,
        context: Context,
    ) => Imagenes.Query.getImagenes(
        context,
    ),
    identifyImagene: (
        _: any,
        { input }: InputOf<InputValueString>,
        context: Context,
    ) => Imagenes.Query.identifyImagene(
        input,
        context,
    ),
};
// #endregion module



// #region exports
export default Query;
// #endregion exports
