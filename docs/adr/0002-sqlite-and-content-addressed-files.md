# ADR 0002: Store metadata in SQLite and content in files

- Status: accepted
- Date: 2026-09-04

## Context

Scattered JSON metadata cannot provide transactions or reliable reference calculation. The existing cloud implementations are incomplete.

## Decision

Use Node.js 24's built-in `node:sqlite` module in WAL mode with foreign keys for metadata. Store immutable Blobs and Manifests in a content-addressed filesystem layout. Allow exactly one writer process per data root through a lock held at `<data-root>/.hypod.lock`, outside the generation directory that migration renames into place, and taken by the server and by every offline operation. Hold it as an open SQLite exclusive transaction so the operating system owns the lock and releases it when the holding process dies, rather than as a file whose staleness would have to be guessed from process liveness. Remove S3/GCS implementations and reject their legacy configuration explicitly.

## Consequences

Hypod has no native database dependency and supports local, single-process deployments. Shared-volume multi-process deployment is unsupported. `node:sqlite` warnings are accepted for this release line and covered by integration tests.
