// #region imports
    // #region external
    import {
        Namespace,
        Project,
        Imagene,
    } from '#server/data/interfaces';

    import database from '#server/services/database';

    import {
        compareValues,
    } from '#server/utilities/general';
    // #endregion external
// #endregion imports



// #region module
export const loadNamespaces = async () => {
    const namespaces: Namespace[] = await database.getAll('namespaces');

    return namespaces;
}


export const loadProjects = async () => {
    const projects: Project[] = await database.getAll('projects');

    return projects;
}


export const loadImagenes = async () => {
    const imagenes: Imagene[] = await database.getAll('imagenes');

    const sortedImagenes = imagenes.sort(
        compareValues('name'),
    );

    return sortedImagenes;
}


const loadData = async () => {
    const namespaces = await loadNamespaces();
    const projects = await loadProjects();
    const imagenes = await loadImagenes();

    const data = {
        namespaces,
        projects,
        imagenes,
    };

    return data;
}
// #endregion module



// #region exports
export default loadData;
// #endregion exports
