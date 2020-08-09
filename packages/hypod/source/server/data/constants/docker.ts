/**
 * Docker Registry API https://docs.docker.com/registry/spec/api/#detail
 * 
 * GET /v2/<name>/tags/list
 * GET /v2/<name>/manifests/<reference>
 * GET /v2/<name>/blobs/<digest>
 * GET /v2/<name>/blobs/uploads/<uuid>
 * 
 * POST /v2/<name>/blobs/uploads/
 * 
 * PUT /v2/<name>/manifests/<reference>
 * PUT /v2/<name>/blobs/uploads/<uuid>
 * 
 * PATCH /v2/<name>/blobs/uploads/<uuid>	
 * 
 * DELETE /v2/<name>/blobs/<digest>
 * DELETE /v2/<name>/manifests/<reference>
 * DELETE /v2/<name>/blobs/uploads/<uuid>	
 */


export const DOCKER_ENDPOINT_API_VERSION_CHECK = '/v2';
export const DOCKER_ENDPOINT_API_CATALOG = '/v2/_catalog';
export const DOCKER_ENDPOINT_API_ALL = '/v2/*';


export const DOCKER_RE_NAME_TAGS_LIST = /^\/v2\/(.*)\/tags\/list$/;
export const DOCKER_RE_NAME_MANIFESTS_REFERENCE = /^\/v2\/(.*)\/manifests\/(.*)$/;
export const DOCKER_RE_NAME_BLOBS_DIGEST = /^\/v2\/(.*)\/blobs\/(?!uploads)(.*)$/;
export const DOCKER_RE_NAME_BLOBS_UPLOADS_UUID = /^\/v2\/(.*)\/blobs\/uploads\/(.*)$/;
export const DOCKER_RE_NAME_BLOBS_UPLOADS = /^\/v2\/(.*)\/blobs\/uploads$/;
