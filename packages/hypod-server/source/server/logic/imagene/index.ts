// #region imports
    // #region libraries
    import zlib from 'zlib';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        BASE_PATH_METADATA,
        BASE_PATH_IMAGENES_MANIFEST,
        BASE_PATH_IMAGENES,
    } from '~server/data/constants';

    import {
        Imagene,
        ImageneTag,
    } from '~server/data/interfaces';

    import database from '~server/services/database';
    import storage from '~server/services/storage';
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


export const updateImageneManifest = async (
    imageneTag: ImageneTag,
    name: string,
    reference: string,
) => {
    const existingImagene = await database.query(
        'imagene',
        'name',
        name,
    );

    if (!existingImagene) {
        const imagene: Imagene = {
            id: uuid.generate(),
            generatedAt: Math.floor(Date.now() / 1000),
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

    const existingTags = existingImagene.tags.map((tag: ImageneTag) => {
        if (tag.name === imageneTag.name) {
            return {
                ...tag,
                name: '',
            };
        }

        return {
            ...tag,
        };
    });

    const updatedTags = [
        ...existingTags,
        imageneTag,
    ];

    await database.update(
        'imagene',
        existingImagene.id,
        'tags',
        updatedTags,
    );

    await database.update(
        'imagene',
        existingImagene.id,
        'latest',
        reference,
    );
}


export const updateImageneSize = async (
    size: number,
    id: string,
    name: string,
) => {
    const existingImagene = await database.query(
        'imagene',
        'name',
        name,
    );

    if (!existingImagene) {
        return;
    }

    const updatedTags: ImageneTag[] = existingImagene.tags.map((tag: ImageneTag) => {
        if (tag.id === id) {
            return {
                ...tag,
                size,
            };
        }

        return tag;
    });

    await database.update(
        'imagene',
        existingImagene.id,
        'tags',
        updatedTags,
    );
}


export const registerImageneManifest = async (
    manifest: any,
    name: string,
    reference: string,
    digest: string,
) => {
    const id = uuid.generate();
    let size = 0;
    let computedSizes = 0;

    const imageneTag: ImageneTag = {
        id,
        generatedAt: Math.floor(Date.now() / 1000),
        name: reference,
        size,
        digest,
    };

    await updateImageneManifest(
        imageneTag,
        name,
        reference,
    );

    for (const layer of manifest.layers) {
        try {
            const layerPath = layer.digest.replace(':', '/');
            const imageneLayerPath = BASE_PATH_IMAGENES + layerPath;

            const layerStream = await storage.streamRead(
                imageneLayerPath,
            );

            if (layerStream) {
                let layerSize = 0;

                const gunzip = zlib.createGunzip();
                layerStream.pipe(gunzip);

                gunzip.on('data', (data) => {
                    layerSize += data.length;
                }).on('end', () => {
                    size += layerSize;
                    computedSizes += 1;

                    if (computedSizes === manifest.layers.length) {
                        updateImageneSize(
                            size,
                            id,
                            name,
                        );
                    }
                }).on('error', (error) => {
                    console.log('[Hypod Error] :: registerImageneManifest', error);
                });
            }
        } catch (error) {
            continue;
        }
    }
}


export const checkImageneLayerUniqueness = async (
    digest: string,
) => {
    const manifests = await storage.downloadAll(
        BASE_PATH_IMAGENES_MANIFEST,
    );

    if (!manifests) {
        return;
    }

    let occurences = 0;

    for (const manifest of manifests) {
        try {
            for (const layer of manifest.layers) {
                if (layer.digest === digest) {
                    occurences += 1;
                }
            }

            if (occurences > 1) {
                return;
            }
        } catch (error) {
            continue;
        }
    }

    return true;
}


export const checkImageneConfigDigestUniqueness = async (
    digest: string,
) => {
    const manifests = await storage.downloadAll(
        BASE_PATH_IMAGENES_MANIFEST,
    );

    if (!manifests) {
        return;
    }

    let occurences = 0;

    for (const manifest of manifests) {
        if (manifest.config.digest === digest) {
            occurences += 1;
        }

        if (occurences > 1) {
            return;
        }
    }

    return true;
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
        const unique = await checkImageneLayerUniqueness(
            layer.digest,
        );

        if (!unique) {
            continue;
        }

        const digest = layer.digest.replace(':', '/');
        const layerPath = BASE_PATH_IMAGENES + digest;

        await storage.obliterate(
            layerPath,
        );
    }


    const uniqueConfigDigest = await checkImageneConfigDigestUniqueness(
        referenceManifest.config.digest,
    );
    if (uniqueConfigDigest) {
        const configDigest = referenceManifest.config.digest.replace(':', '/');
        const configPath = BASE_PATH_IMAGENES + configDigest;

        await storage.obliterate(
            configPath,
        );
    }


    await storage.obliterate(
        referenceManifestPath,
    );


    const tags = imagene.tags.filter(imageneTag => imageneTag.id !== tagID);

    imagene.tags = [
        ...tags,
    ];
    imagene.latest = imagene.tags[imagene.tags.length - 1]?.name || '';

    await database.store(
        'imagene',
        imageneID,
        imagene,
    );
}
// #endregion module
