# Release and operational hardening

- Status: ready-for-agent

## Acceptance criteria

- [x] A Node 24 non-root container has a healthcheck, graceful shutdown, and only the data root writable.
- [x] Operator documentation covers reverse-proxy TLS, backup/migration/rollback, tokens, doctor, and GC.
- [x] Unit, contract, integration, E2E, migration, security, and package-build checks are runnable locally.
- [x] The root verification command passes and unsupported features are described honestly.

## Completion

Completed 2026-09-04.

`pnpm verify`, the final non-root/read-only container smoke test, package tarball checks, and the scoped upstream OCI Distribution 1.1 conformance suite all passed.
