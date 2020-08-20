// #region imports
    // #region external
    import {
        Imagene,
    } from '#server/data/interfaces';

    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
export const removeEntity = (
    state: Types.State,
    action: Types.RemoveEntityAction,
): Types.State => {
    const {
        id,
        type,
    } = action.payload;

    const newState = {
        ...state,
    };

    let imagenes = [
        ...newState.imagenes,
    ];

    let projects = [
        ...newState.projects,
    ];

    switch (type) {
        case 'imagene':
            imagenes = imagenes.filter(
                imagene => imagene.id !== id
            );
            break;
        case 'project':
            projects = projects.filter(
                project => project.id !== id
            );
            break;
    }

    return {
        ...newState,
        imagenes: [
            ...imagenes,
        ],
        projects: [
            ...projects,
        ],
    };
}


export const setActiveProviderID = (
    state: Types.State,
    action: Types.SetActiveProviderIDAction,
): Types.State => {
    return {
        ...state,
        activeProviderID: action.payload,
    };
}


export const setData = (
    state: Types.State,
    action: Types.SetDataAction,
): Types.State => {
    const {
        type,
        data,
    } = action.payload;

    switch (type) {
        case 'namespaces':
            return {
                ...state,
                namespaces: [
                    ...data as any,
                ],
            };
        case 'projects':
            return {
                ...state,
                projects: [
                    ...data as any,
                ],
            };
        case 'imagenes':
            return {
                ...state,
                imagenes: [
                    ...data as any,
                ],
            };
        default:
            return {
                ...state,
            };
    }
}


export const setImagenes = (
    state: Types.State,
    action: Types.SetImagenesAction,
): Types.State => {
    return {
        ...state,
        imagenes: [
            ...action.payload,
        ],
    };
}


export const togglePublicImagene = (
    state: Types.State,
    action: Types.ToggleImagenePublicAction,
): Types.State => {
    const {
        id,
        value,
    } = action.payload;

    const imagenes = state.imagenes.map(imagene => {
        if (imagene.id !== id) {
            return {
                ...imagene,
            };
        }

        const updatedImagene: Imagene = {
            ...imagene,
            isPublic: value,
        };

        return updatedImagene;
    });

    return {
        ...state,
        imagenes,
    };
}


export const obliterateImageneTag = (
    state: Types.State,
    action: Types.ObliterateImageneTagAction,
): Types.State => {
    const {
        imageneID,
        tagID,
    } = action.payload;

    const imagenes = state.imagenes.map(imagene => {
        if (imagene.id !== imageneID) {
            return {
                ...imagene,
            };
        }

        const tags = imagene.tags.filter(imageneTag => imageneTag.id !== tagID);

        const updatedImagene: Imagene = {
            ...imagene,
            tags: tags || [],
        };

        return updatedImagene;
    });

    return {
        ...state,
        imagenes,
    };
}



const resolvers = {
    removeEntity,
    setActiveProviderID,
    setData,
    setImagenes,
    togglePublicImagene,
    obliterateImageneTag,
};
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
