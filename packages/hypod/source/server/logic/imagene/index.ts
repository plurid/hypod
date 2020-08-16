// #region imports
    // #region libraries
    import {
        ungzip,
    } from 'node-gzip';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        BASE_PATH_METADATA,
        BASE_PATH_IMAGENES_MANIFEST,
        BASE_PATH_IMAGENES,
    } from '#server/data/constants';

    import {
        Imagene,
        ImageneTag,
    } from '#server/data/interfaces';

    import database from '#server/services/database';
    import storage from '#server/services/storage';
    // #endregion external
// #endregion imports



// #region module
export const registerImagene = async (
    data: Imagene,
) => {
    const metadataPath = BASE_PATH_METADATA + data.id;

    const buffer = Buffer.from(JSON.stringify(data, null, 4));

    await storage.upload(
        metadataPath,
        buffer,
    );
}


export const deregisterImagene = async (
    id: string,
) => {
    const imagene: Imagene | undefined = await database.query(
        'imagene',
        'id',
        id,
    );

    if (!imagene) {
        return;
    }

    for (const tag of imagene.tags) {
        await deregisterImageneTag(
            id,
            tag.id,
        );
    }

    await database.obliterate(
        'imagene',
        id,
    );
}


export const registerImageneManifest = async (
    manifest: any,
    name: string,
    reference: string,
    digest: string,
) => {
    let size = 0;

    for (const layer of manifest.layers) {
        try {
            const layerPath = layer.digest.replace(':', '/');
            const imageneLayerPath = BASE_PATH_IMAGENES + layerPath;

            const layerData = await storage.download(
                imageneLayerPath,
            );

            if (layerData) {
                const decompressed = await ungzip(Buffer.from(layerData, 'binary'));
                const byteLength = Buffer.byteLength(decompressed);
                size += byteLength;
            }
        } catch (error) {
            continue;
        }
    }

    const imageneTag: ImageneTag = {
        id: uuid.generate(),
        generatedAt: Math.floor(Date.now() / 1000),
        name: reference,
        size,
        digest,
    };

    const existingImagene = await database.query(
        'imagene',
        'name',
        name,
    );

    if (!existingImagene) {
        const imagene: Imagene = {
            id: uuid.generate(),
            name,
            latest: reference,
            tags: [
                imageneTag,
            ],
            isPublic: false,
        };

        await database.store(
            'imagene',
            imagene.id,
            imagene,
        );

        return;
    }

    const updatedTags = [
        ...existingImagene.tags,
        imageneTag,
    ];

    await database.update(
        'imagene',
        existingImagene.id,
        'tags',
        updatedTags,
    );
}


export const deregisterImageneTag = async (
    imageneID: string,
    tagID: string,
) => {
    const imagene: Imagene | undefined = await database.query(
        'imagene',
        'id',
        imageneID,
    );

    if (!imagene) {
        return;
    }

    const deregisteredTag = imagene.tags.find(imageneTag => imageneTag.id === tagID);

    if (!deregisteredTag) {
        return;
    }


    const name = imagene.name;
    const reference = deregisteredTag.name;

    const referenceManifestPath = BASE_PATH_IMAGENES_MANIFEST + name + '/' + reference;

    const referenceManifestData = await storage.download(
        referenceManifestPath,
    );

    if (!referenceManifestData) {
        return;
    }

    const referenceManifest = JSON.parse(referenceManifestData);

    for (const layer of referenceManifest.layers) {
        // check if the layer is not used by any other imagene

        const digest = layer.digest.replace(':', '/');
        const layerPath = BASE_PATH_IMAGENES + digest;

        await storage.obliterate(
            layerPath,
        );
    }

    const configDigest = referenceManifest.config.digest.replace(':', '/');
    const configPath = BASE_PATH_IMAGENES + configDigest;

    await storage.obliterate(
        configPath,
    );

    await storage.obliterate(
        referenceManifestPath,
    );


    const tags = imagene.tags.filter(imageneTag => imageneTag.id !== tagID);

    imagene.tags = [
        ...tags,
    ];

    await database.store(
        'imagene',
        imageneID,
        imagene,
    );
}
// #endregion module
