// #region imports
    // #region libraries
    import {
        Application,
        Response,
    } from 'express';
    // #endregion libraries


    // #region external
    import {
        DOCKER_REALM_BASE,
        DOCKER_SERVICE,
        PRIVATE_OWNER_IDENTONYM,
        PRIVATE_OWNER_KEY,
        PRIVATE_TOKEN,

        privateUsage,

        DOCKER_ENDPOINT_API_VERSION_CHECK,
        DOCKER_ENDPOINT_API_CATALOG,
        DOCKER_ENDPOINT_API_TOKEN,
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

    import {
        getAuthorizationHeader,
    } from '#server/utilities/authorization';

    import {
        sendUnauthorizedResponse,
    } from '#server/utilities/response';
    // #endregion external
// #endregion imports



// #region module
const realm = DOCKER_REALM_BASE + DOCKER_ENDPOINT_API_TOKEN;


/**
 * https://docs.docker.com/registry/spec/api/#api-version-check
 *
 * @param request
 * @param response
 */
const endpointApiVersionCheck = async (
    request: HypodRequest,
    response: Response,
) => {
    const logic = request.hypodLogic;

    response.setHeader(
        'Docker-Distribution-API-Version',
        'registry/2.0',
    );

    if (logic) {
        const authorizationHeader = request.header('Authorization') || '';
        const authorizationToken = authorizationHeader.replace('Bearer ', '');

        const validAuthorizationToken = await logic?.checkOwnerToken(
            authorizationToken,
        );

        response.setHeader(
            'WWW-Authenticate',
            `Bearer realm="${realm}",service="${DOCKER_SERVICE}"`,
        );

        if (!validAuthorizationToken) {
            sendUnauthorizedResponse(response);
            return;
        }

        response.status(200).end();
        return;
    }

    if (privateUsage) {
        const authorizationHeader = request.header('Authorization') || '';
        const authorizationToken = authorizationHeader.replace('Bearer ', '');

        const validAuthorizationToken = authorizationToken === PRIVATE_TOKEN;

        response.setHeader(
            'WWW-Authenticate',
            `Bearer realm="${realm}",service="${DOCKER_SERVICE}"`,
        );

        if (!validAuthorizationToken) {
            sendUnauthorizedResponse(response);
            return;
        }

        response.status(200).end();
        return;
    }

    response.status(200).end();
}


/**
 * https://docs.docker.com/registry/spec/api/#listing-repositories
 *
 * @param request
 * @param response
 */
const endpointApiGetCatalog = async (
    request: HypodRequest,
    response: Response,
) => {
    const logic = request.hypodLogic;

    if (logic) {
        const ownerCatalog = await logic.getOwnerCatalog();

        response.status(200).send(JSON.stringify(ownerCatalog));
        return;
    }

    const data = {
        repositories: [],
    };

    response.status(200).send(JSON.stringify(data));
    return;
}


const endpointApiGetToken = async (
    request: HypodRequest,
    response: Response,
) => {
    const logic = request.hypodLogic;

    if (logic) {
        const authorization = getAuthorizationHeader(request);

        if (!authorization) {
            sendUnauthorizedResponse(response);
            return;
        }

        const {
            identonym,
            key,
        } = authorization;

        const tokenResponse = await logic?.getOwnerToken(
            identonym,
            key,
        );

        response.status(200).send(JSON.stringify(tokenResponse));
        return;
    }

    if (privateUsage) {
        const authorization = getAuthorizationHeader(request);

        if (!authorization) {
            sendUnauthorizedResponse(response);
            return;
        }

        const {
            identonym,
            key,
        } = authorization;

        if (
            identonym !== PRIVATE_OWNER_IDENTONYM
            || key !== PRIVATE_OWNER_KEY
        ) {
            sendUnauthorizedResponse(response);
            return;
        }

        const tokenResponse = {
            token: PRIVATE_TOKEN,
            expires_in: 3600,
            issued_at: new Date(),
        };

        response.status(200).send(JSON.stringify(tokenResponse));
        return;
    }

    sendUnauthorizedResponse(response);
    return;
}


const endpointApiGetAll = async (
    request: HypodRequest,
    response: Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiGetAll', url);
    // console.log(JSON.stringify(request.headers));

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


const endpointApiPostAll = async (
    request: HypodRequest,
    response: Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiPostAll');
    // console.log('endpointApiPostAll', request);
    // console.log('endpointApiPostAll', url);

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


const endpointApiPutAll = async (
    request: HypodRequest,
    response: Response,
) => {
    const url = request.path;
    // console.log('endpointApiPutAll', url);
    // console.log('endpointApiPutAll', JSON.stringify(request.headers));

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


const endpointApiPatchAll = async (
    request: HypodRequest,
    response: Response,
) => {
    const url = request.originalUrl;
    // console.log('endpointApiPatchAll', url);
    // console.log(JSON.stringify(request.headers));

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


const dockerHandler = async (
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
        DOCKER_ENDPOINT_API_TOKEN,
        endpointApiGetToken as any,
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
