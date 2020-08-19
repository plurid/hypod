// #region imports
    // #region external
    import {
        Database,
        DatabaseGet,
        DatabaseQuery,
        DatabaseStore,
        DatabaseUpdate,
        DatabaseObliterate,

        Imagene,
    } from '#server/data/interfaces';

    import {
        BASE_PATH_METADATA_NAMESPACES,
        BASE_PATH_METADATA_PROJECTS,
        BASE_PATH_METADATA_IMAGENES,
    } from '#server/data/constants';

    import filesystemStorage from '#server/logic/storage/filesystem';
    // #endregion external
// #endregion imports



// #region module
const get: DatabaseGet = async (
    entity,
    id,
) => {
    switch (entity) {
        case 'namespace': {
            const filepath = BASE_PATH_METADATA_NAMESPACES + id;

            const data = await filesystemStorage.download(
                filepath,
            );

            return data;
        }
        case 'project': {
            const filepath = BASE_PATH_METADATA_PROJECTS + id;

            const data = await filesystemStorage.download(
                filepath,
            );

            return data;
        }
        case 'imagene': {
            const filepath = BASE_PATH_METADATA_IMAGENES + id;

            const data = await filesystemStorage.download(
                filepath,
            );

            return data;
        }
        default:
            return;
    }
}


const query: DatabaseQuery = async (
    entity,
    field,
    value,
) => {
    switch (entity) {
        case 'namespace': {
            const namespaces: Imagene[] = await filesystemStorage.downloadAll(BASE_PATH_METADATA_NAMESPACES) || [];
            const namespace = namespaces.find(namespace => namespace[field] === value);

            return namespace;
        }
        case 'project': {
            const projects: Imagene[] = await filesystemStorage.downloadAll(BASE_PATH_METADATA_PROJECTS) || [];
            const project = projects.find(project => project[field] === value);

            return project;
        }
        case 'imagene': {
            const imagenes: Imagene[] = await filesystemStorage.downloadAll(BASE_PATH_METADATA_IMAGENES) || [];
            const imagene = imagenes.find(imagene => imagene[field] === value);

            return imagene;
        }
    }


    return;
}


const store: DatabaseStore = async (
    entity,
    id,
    data,
) => {
    switch (entity) {
        case 'namespace': {
            const filepath = BASE_PATH_METADATA_NAMESPACES + id;

            await filesystemStorage.upload(
                filepath,
                Buffer.from(JSON.stringify(data, null, 4), 'utf-8'),
            );

            return true;
        }
        case 'project': {
            const filepath = BASE_PATH_METADATA_PROJECTS + id;

            await filesystemStorage.upload(
                filepath,
                Buffer.from(JSON.stringify(data, null, 4), 'utf-8'),
            );

            return true;
        }
        case 'imagene': {
            const filepath = BASE_PATH_METADATA_IMAGENES + id;

            await filesystemStorage.upload(
                filepath,
                Buffer.from(JSON.stringify(data, null, 4), 'utf-8'),
            );

            return true;
        }
        default:
            return;
    }
}


const update: DatabaseUpdate = async (
    entity,
    id,
    field,
    value,
) => {
    switch (entity) {
        case 'namespace': {
            const filepath = BASE_PATH_METADATA_NAMESPACES + id;

            const namespaceData = await filesystemStorage.download(filepath);

            if (!namespaceData) {
                return;
            }

            const namespace = JSON.parse(namespaceData);

            namespace[field] = value;

            await filesystemStorage.upload(
                filepath,
                Buffer.from(JSON.stringify(namespace, null, 4), 'utf-8'),
            );

            return true;
        }
        case 'project': {
            const filepath = BASE_PATH_METADATA_PROJECTS + id;

            const projectData = await filesystemStorage.download(filepath);

            if (!projectData) {
                return;
            }

            const project = JSON.parse(projectData);

            project[field] = value;

            await filesystemStorage.upload(
                filepath,
                Buffer.from(JSON.stringify(project, null, 4), 'utf-8'),
            );

            return true;
        }
        case 'imagene': {
            const filepath = BASE_PATH_METADATA_IMAGENES + id;

            const imageneData = await filesystemStorage.download(filepath);

            if (!imageneData) {
                return;
            }

            const imagene = JSON.parse(imageneData);

            imagene[field] = value;

            await filesystemStorage.upload(
                filepath,
                Buffer.from(JSON.stringify(imagene, null, 4), 'utf-8'),
            );

            return true;
        }
    }

    return;
}


const obliterate: DatabaseObliterate = async (
    entity,
    id,
) => {
    switch (entity) {
        case 'namespace': {
            const filepath = BASE_PATH_METADATA_NAMESPACES + id;

            await filesystemStorage.obliterate(
                filepath,
            );
        }
        case 'project': {
            const filepath = BASE_PATH_METADATA_PROJECTS + id;

            await filesystemStorage.obliterate(
                filepath,
            );
        }
        case 'imagene': {
            const filepath = BASE_PATH_METADATA_IMAGENES + id;

            await filesystemStorage.obliterate(
                filepath,
            );
        }
    }

    return;
}


const filesystemDatabase: Database = {
    get,
    query,
    store,
    update,
    obliterate,
};
// #endregion module



// #region exports
export default filesystemDatabase;
// #endregion exports
