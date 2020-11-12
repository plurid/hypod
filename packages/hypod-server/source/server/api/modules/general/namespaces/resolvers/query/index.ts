// #region imports
    // #region external
    import {
        Context,
    } from '#server/data/interfaces';

    import {
        Namespaces,
    } from '#server/api/models';
    // #endregion external
// #endregion imports



// #region exports
export default {
    getNamespaces: (
        _: any,
        __: any,
        context: Context,
    ) => Namespaces.Query.getNamespaces(
        context,
    ),
};
// #endregion exports
