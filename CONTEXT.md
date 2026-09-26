# Hypod domain context

Hypod is a self-hosted OCI Distribution registry with an administrative web interface, GraphQL contract, and JavaScript SDK. It calls stored OCI repositories **Imagenes** to avoid confusing runnable software images with visual images.

## Domain language

- **Hypod** — one running registry and its administration surface.
- **Imagene** — an OCI repository, identified by its registry name. It may optionally belong to a Project and has a derived Namespace through that Project.
- **Tag** — a mutable human-readable reference from an Imagene to a Manifest digest.
- **Manifest** — immutable OCI or Docker distribution JSON, addressed by the SHA-256 digest of its exact bytes. An image index is a supported Manifest kind.
- **Blob** — immutable content-addressed bytes used by one or more Manifests.
- **Upload** — temporary, resumable Blob ingestion state with a current byte offset and expiry.
- **Namespace** — owner-scoped administrative grouping for Projects.
- **Project** — owner-scoped administrative grouping for Imagenes. Its Namespace relationship is nullable.
- **Owner** — the built-in administrative identity. A custom access adapter may represent more principals without changing the core registry.
- **Public Usage** — anonymous clients may discover and pull public Imagenes; writes and private data require the Owner.
- **Private Usage** — every registry operation requires the Owner.
- **Custom Usage** — authentication and authorization are delegated to an `AccessPolicy` implementation.

## Invariants

1. Blob and Manifest digests are computed from the exact stored bytes and verified before promotion.
2. Tags point to Manifest digests; they never contain a configuration-blob digest.
3. A Manifest is visible only after its referenced content and metadata transaction are valid.
4. Anonymous callers never learn private Imagene names or metadata.
5. Removing a Namespace or Project clears child relationships rather than removing Imagenes.
6. Only one Hypod process may write a data root at a time.
7. Garbage collection and legacy-data migration are explicit offline operations with a dry-run mode.

## Modules

- **Registry** owns the Imagene lifecycle: uploads, verified promotion, Manifests, Tags, visibility, deletion, and reference calculation.
- **MetadataRepository** persists searchable relationships and transaction state in SQLite.
- **ContentStore** persists immutable bytes and upload staging files beneath the data root.
- **AccessPolicy** authenticates a request and authorizes an action against an Imagene name.
- **TokenIssuer** creates and verifies short-lived, scoped bearer tokens for registry clients.
- **OCI adapter** maps Distribution HTTP requests and errors onto Registry operations.
- **GraphQL adapter** maps the compatibility schema onto Registry operations.
- **Admin interface** presents GraphQL data through Plurid and React.
- **JavaScript SDK** exposes the GraphQL compatibility contract and a typed modern client.
- **Operations CLI** owns migration, diagnosis, and offline garbage collection.

## Compatibility promise

The modernization is compatibility-first. The default `@plurid/hypod` export and `hypodSetup(logic?)`, `/graphql`, existing GraphQL operation names and response envelopes, legacy environment aliases, and the JavaScript SDK factory remain available during the 0.2 line. New code should use `createHypod`, canonical environment names, and `createHypodClient`.

## Scope

The supported deployment is one Node.js 24 process per local filesystem data root, normally behind a reverse proxy that terminates TLS. S3/GCS persistence, shared multi-process volumes, OCI referrers, and replacing Plurid are not part of the 0.2 modernization.
