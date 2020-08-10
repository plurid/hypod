import express from 'express';

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

import * as dockerLogic from '#server/logic/docker';



const endpointApiVersionCheck = (
    request: express.Request,
    response: express.Response,
) => {
    response.status(200).end();
}


const endpointApiGetCatalog = (
    request: express.Request,
    response: express.Response,
) => {
    console.log('endpointApiGetCatalog');
}


const endpointApiGetAll = (
    request: express.Request,
    response: express.Response,
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
        dockerLogic.getNameTagsList(
            request,
            response,
            matchNameTagsList,
        );
        return;
    }

    if (matchNameManifestsReference) {
        dockerLogic.getNameManifestsReference(
            request,
            response,
            matchNameManifestsReference,
        );
        return;
    }

    if (matchNameBlobsDigest) {
        dockerLogic.getNameBlobsDigest(
            request,
            response,
            matchNameBlobsDigest,
        );
        return;
    }

    if (matchNameBlobsUploadsUuid) {
        dockerLogic.getNameBlobsUploadsUuid(
            request,
            response,
            matchNameBlobsUploadsUuid,
        );
        return;
    }

    response.status(404).end();
}


const endpointApiPostAll = (
    request: express.Request,
    response: express.Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiPostAll', url);
    // console.log(JSON.stringify(request.headers));
    // console.log('request.body', request.body);

    const matchNameBlobsUploads = url.match(DOCKER_RE_NAME_BLOBS_UPLOADS);

    if (matchNameBlobsUploads) {
        dockerLogic.postNameBlobsUploads(
            request,
            response,
            matchNameBlobsUploads,
        );
        return;
    }

    response.status(404).end();
}


const endpointApiPutAll = (
    request: express.Request,
    response: express.Response,
) => {
    const url = request.path;
    // console.log('endpointApiPutAll', url);
    // console.log(JSON.stringify(request.headers));
    // console.log('request.body', request.body);

    const matchNameManifestsReference = url.match(DOCKER_RE_NAME_MANIFESTS_REFERENCE);
    const matchNameBlobsUploadsUuid = url.match(DOCKER_RE_NAME_BLOBS_UPLOADS_UUID);

    if (matchNameManifestsReference) {
        dockerLogic.putNameManifestsReference(
            request,
            response,
            matchNameManifestsReference,
        );
        return;
    }

    if (matchNameBlobsUploadsUuid) {
        dockerLogic.putNameBlobsUploadsUuid(
            request,
            response,
            matchNameBlobsUploadsUuid,
        );
        return;
    }

    response.status(404).end();
}


const endpointApiPatchAll = (
    request: express.Request,
    response: express.Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiPatchAll', url);
    // console.log(JSON.stringify(request.headers));
    // console.log('request.body', request.body);
    // console.log('request.query', request.query);
    // console.log('request.body', request.body);

    const matchNameBlobsUploadsUuid = url.match(DOCKER_RE_NAME_BLOBS_UPLOADS_UUID);

    if (matchNameBlobsUploadsUuid) {
        dockerLogic.patchNameBlobsUploadsUuid(
            request,
            response,
            matchNameBlobsUploadsUuid,
        );
        return;
    }

    response.status(404).end();
}


const endpointApiDeleteAll = (
    request: express.Request,
    response: express.Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiDeleteAll', url);
    // console.log(JSON.stringify(request.headers));
    // console.log('request.body', request.body);

    const matchNameManifestsReference = url.match(DOCKER_RE_NAME_MANIFESTS_REFERENCE);
    const matchNameBlobsUploadsUuid = url.match(DOCKER_RE_NAME_BLOBS_UPLOADS_UUID);
    const matchNameBlobsDigest = url.match(DOCKER_RE_NAME_BLOBS_DIGEST);

    if (matchNameManifestsReference) {
        dockerLogic.deleteNameManifestsReference(
            request,
            response,
            matchNameManifestsReference,
        );
        return;
    }

    if (matchNameBlobsUploadsUuid) {
        dockerLogic.deleteNameBlobsUploadsUuid(
            request,
            response,
            matchNameBlobsUploadsUuid,
        );
        return;
    }

    if (matchNameBlobsDigest) {
        dockerLogic.deleteNameBlobsDigest(
            request,
            response,
            matchNameBlobsDigest,
        );
        return;
    }

    response.status(404).end();
}


const dockerHandlers = (
    instance: express.Application,
) => {
    instance.get(
        DOCKER_ENDPOINT_API_VERSION_CHECK,
        endpointApiVersionCheck,
    );

    instance.get(
        DOCKER_ENDPOINT_API_CATALOG,
        endpointApiGetCatalog,
    );

    instance.get(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiGetAll,
    );

    instance.head(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiGetAll,
    );

    instance.post(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiPostAll,
    );

    instance.put(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiPutAll,
    );

    instance.patch(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiPatchAll,
    );

    instance.delete(
        DOCKER_ENDPOINT_API_ALL,
        endpointApiDeleteAll,
    );
}


export default dockerHandlers;
