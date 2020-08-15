// #region imports
    // #region external
    import initialState from '../initial';
    import resolvers from '../resolvers';
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case Types.REMOVE_ENTITY:
            return resolvers.removeEntity(state, action);
        case Types.SET_ACTIVE_PROVIDER_ID:
            return resolvers.setActiveProviderID(state, action);
        case Types.SET_IMAGENES:
            return resolvers.setImagenes(state, action);
        case Types.TOGGLE_IMAGENE_PUBLIC:
            return resolvers.togglePublicImagene(state, action);
        case Types.OBLITERATE_IMAGENE_TAG:
            return resolvers.obliterateImageneTag(state, action);
        default:
            return {
                ...state,
            };
    }
}
// #endregion module



// #region exports
export default reducer;
// #endregion exports
