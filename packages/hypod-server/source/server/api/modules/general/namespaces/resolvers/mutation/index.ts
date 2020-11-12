// #region imports
    // #region external
    import {
        Context,
        InputOf,
        InputValueString,
    } from '#server/data/interfaces';

    import {
        Namespaces,
    } from '#server/api/models';
    // #endregion external
// #endregion imports



// #region exports
export default {
    registerNamespace: (
        _: any,
        { input }: InputOf<InputValueString>,
        context: Context,
    ) => Namespaces.Mutation.registerNamespace(
        input,
        context,
    ),
    obliterateNamespace: (
        _: any,
        { input }: InputOf<InputValueString>,
        context: Context,
    ) => Namespaces.Mutation.obliterateNamespace(
        input,
        context,
    ),
};
// #endregion exports
