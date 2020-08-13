// #region imports
    // #region libraries
    import {
        Application,
        Response,
    } from 'express';
    // #endregion libraries


    // #region external
    import {
        DOCKER_ENDPOINT_API_VERSION_CHECK,
        DOCKER_ENDPOINT_API_CATALOG,
        DOCKER_ENDPOINT_API_ALL,

        DOCKER_RE_NAME_TAGS_LIST,
        DOCKER_RE_NAME_MANIFESTS_REFERENCE,
        DOCKER_RE_NAME_BLOBS_DIGEST,
        DOCKER_RE_NAME_BLOBS_UPLOADS,
        DOCKER_RE_NAME_BLOBS_UPLOADS_UUID,
    } from '#server/data/constants';

    import {
        HypodRequest,
    } from '#server/data/interfaces';

    import * as docker from '#server/logic/docker';
    // #endregion external
// #endregion imports



// #region module
/**
 * https://docs.docker.com/registry/spec/api/#api-version-check
 *
 * @param request
 * @param response
 */
const endpointApiVersionCheck = (
    request: HypodRequest,
    response: Response,
) => {
    response.status(200).end();
}


/**
 * https://docs.docker.com/registry/spec/api/#listing-repositories
 *
 * @param request
 * @param response
 */
const endpointApiGetCatalog = (
    request: HypodRequest,
    response: Response,
) => {
    console.log('endpointApiGetCatalog');
}


const endpointApiGetAll = (
    request: HypodRequest,
    response: Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiGetAll', url);
    // console.log(JSON.stringify(request.headers));
    // console.log('request.body', request.body);

    const matchNameTagsList = url.match(DOCKER_RE_NAME_TAGS_LIST);
    const matchNameManifestsReference = url.match(DOCKER_RE_NAME_MANIFESTS_REFERENCE);
    const matchNameBlobsDigest = url.match(DOCKER_RE_NAME_BLOBS_DIGEST);
    const matchNameBlobsUploadsUuid = url.match(DOCKER_RE_NAME_BLOBS_UPLOADS_UUID);

    if (matchNameTagsList) {
        docker.getNameTagsList(
            request,
            response,
            matchNameTagsList,
        );
        return;
    }

    if (matchNameManifestsReference) {
        docker.getNameManifestsReference(
            request,
            response,
            matchNameManifestsReference,
        );
        return;
    }

    if (matchNameBlobsDigest) {
        docker.getNameBlobsDigest(
            request,
            response,
            matchNameBlobsDigest,
        );
        return;
    }

    if (matchNameBlobsUploadsUuid) {
        docker.getNameBlobsUploadsUuid(
            request,
            response,
            matchNameBlobsUploadsUuid,
        );
        return;
    }

    response.status(404).end();
}


const endpointApiPostAll = (
    request: HypodRequest,
    response: Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiPostAll', url);
    // console.log(JSON.stringify(request.headers));
    // console.log('request.body', request.body);

    const matchNameBlobsUploads = url.match(DOCKER_RE_NAME_BLOBS_UPLOADS);

    if (matchNameBlobsUploads) {
        docker.postNameBlobsUploads(
            request,
            response,
            matchNameBlobsUploads,
        );
        return;
    }

    response.status(404).end();
}


const endpointApiPutAll = (
    request: HypodRequest,
    response: Response,
) => {
    const url = request.path;
    // console.log('endpointApiPutAll', url);
    // console.log(JSON.stringify(request.headers));
    // console.log('request.body', request.body);

    const matchNameManifestsReference = url.match(DOCKER_RE_NAME_MANIFESTS_REFERENCE);
    const matchNameBlobsUploadsUuid = url.match(DOCKER_RE_NAME_BLOBS_UPLOADS_UUID);

    if (matchNameManifestsReference) {
        docker.putNameManifestsReference(
            request,
            response,
            matchNameManifestsReference,
        );
        return;
    }

    if (matchNameBlobsUploadsUuid) {
        docker.putNameBlobsUploadsUuid(
            request,
            response,
            matchNameBlobsUploadsUuid,
        );
        return;
    }

    response.status(404).end();
}


const endpointApiPatchAll = (
    request: HypodRequest,
    response: Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiPatchAll', url);
    // console.log(JSON.stringify(request.headers));
    // console.log('request.body', request.body);
    // console.log('request.query', request.query);
    // console.log('request.body', request.body);

    const matchNameBlobsUploadsUuid = url.match(DOCKER_RE_NAME_BLOBS_UPLOADS_UUID);

    if (matchNameBlobsUploadsUuid) {
        docker.patchNameBlobsUploadsUuid(
            request,
            response,
            matchNameBlobsUploadsUuid,
        );
        return;
    }

    response.status(404).end();
}


const endpointApiDeleteAll = (
    request: HypodRequest,
    response: Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiDeleteAll', url);
    // console.log(JSON.stringify(request.headers));
    // console.log('request.body', request.body);

    const matchNameManifestsReference = url.match(DOCKER_RE_NAME_MANIFESTS_REFERENCE);
    const matchNameBlobsUploadsUuid = url.match(DOCKER_RE_NAME_BLOBS_UPLOADS_UUID);
    const matchNameBlobsDigest = url.match(DOCKER_RE_NAME_BLOBS_DIGEST);

    if (matchNameManifestsReference) {
        docker.deleteNameManifestsReference(
            request,
            response,
            matchNameManifestsReference,
        );
        return;
    }

    if (matchNameBlobsUploadsUuid) {
        docker.deleteNameBlobsUploadsUuid(
            request,
            response,
            matchNameBlobsUploadsUuid,
        );
        return;
    }

    if (matchNameBlobsDigest) {
        docker.deleteNameBlobsDigest(
            request,
            response,
            matchNameBlobsDigest,
        );
        return;
    }

    response.status(404).end();
}


const dockerHandler = (
    instance: Application,
) => {
    /**
     * instance methods use `as any` to account for the `HypodRequest`.
     */

    instance.get(
        DOCKER_ENDPOINT_API_VERSION_CHECK,
        endpointApiVersionCheck as any,
    );

    instance.get(
        DOCKER_ENDPOINT_API_CATALOG,
        endpointApiGetCatalog as any,
    );

    instance.get(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiGetAll as any,
    );

    instance.head(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiGetAll as any,
    );

    instance.post(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiPostAll as any,
    );

    instance.put(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiPutAll as any,
    );

    instance.patch(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiPatchAll as any,
    );

    instance.delete(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiDeleteAll as any,
    );
}
// #endregion module



// #region exports
export default dockerHandler;
// #endregion exports
