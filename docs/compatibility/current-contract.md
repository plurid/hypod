# Legacy compatibility inventory

This snapshot records behavior present before the 0.2 modernization. Characterization tests turn the supported portion into executable contracts.

## Package exports

`@plurid/hypod` exports a default preconstructed Plurid server, named `hypodSetup(logic?)`, and server interfaces including `HypodLogic`. Direct execution configures handlers and starts on `PORT` (historically defaulting to 56565).

`@plurid/hypod-client` exports its existing default factory and model methods. The package historically publishes CommonJS and declarations from `distribution/`.

## HTTP and GraphQL

- Admin interface: `/`
- GraphQL: `/graphql`
- Distribution: `/v2/`, `/v2/_catalog`, `/v2/<name>/tags/list`, Manifest routes, Blob routes, and upload routes
- Token realm: `/v2/token`

Existing GraphQL operations are `getImagenes`, `identifyImagene`, `obliterateImagene`, `obliterateImageneTag`, `togglePublicImagene`, `getNamespaces`, `registerNamespace`, `obliterateNamespace`, `getProjects`, `generateProject`, `obliterateProject`, `getCurrentOwner`, `getUsageType`, `login`, and `logout`. Responses use `{ status, error, data }` envelopes. Existing fields remain; modern fields are nullable additions.

## Legacy environment names

The old server reads `PORT`, `HYPOD_PRIVATE_USAGE`, `HYPOD_PRIVATE_OWNER_IDENTONYM`, `HYPOD_PRIVATE_OWNER_KEY`, `HYPOD_PRIVATE_TOKEN`, `HYPOD_STORAGE_ROOT_PATH`, `HYPOD_DATABASE_TYPE`, `HYPOD_STORAGE_TYPE`, `HYPOD_DOCKER_REALM_BASE`, `HYPOD_DOCKER_SERVICE`, `HYPOD_CUSTOM_LOGIC`, the misspelled internal `PERFORMER_CUSTOM_LOGIC_USAGE`, `HYPOD_USE_NAMESPACES`, `HYPOD_USE_PROJECTS`, `HYPOD_QUIET`, and the misspelled example `HYPOD_QUITE`. Cloud-related AWS, GCS, and bucket settings were advertised but their implementations were incomplete.

## Legacy data

Under `<storage-root>/data`, metadata is JSON beneath `metadata/namespaces`, `metadata/projects`, and `metadata/imagenes`; Blob, upload, Manifest, and digest material is stored in adjacent filesystem trees. Some paths and digests are inconsistent. The new migrator treats all legacy files as immutable input, builds a versioned data layout beside them, validates it, and changes the active marker only at completion.
