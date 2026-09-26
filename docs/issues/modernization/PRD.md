# Hypod 0.2 modernization

- Status: ready-for-agent
- Started: 2026-09-04
- Finished: 2026-09-04

## Outcome

Ship a compatibility-first, production-shaped Hypod on Node.js 24: a correct OCI Distribution 1.1 registry, transactional local persistence, secure owner and custom access, a reliable admin interface, and typed JavaScript SDK.

## Success criteria

- Existing supported package and GraphQL contracts continue through wrappers.
- OCI core workflows pass focused integration tests and the official conformance command.
- Metadata mutations are transactional and exact content digests are verified.
- Legacy filesystem data has a dry-run-first, idempotent, validated offline migration.
- Public, Private, and Custom Usage expose only authorized data and actions.
- One root `verify` command exercises formatting, lint, types, unit/contract/integration tests, builds, and package checks.
- Documentation states the supported local-filesystem scope without S3/GCS claims.

## Delivery

Implementation checkpoints are workspace/lifecycle, persistence/migration, access/OCI, and interface/SDK/docs. They ship together as 0.2.0 without prerelease version suffixes.

## Out of scope

S3/GCS, hosted CI configuration, GitHub Issues, multi-process shared-volume operation, OCI referrers, and replacing Plurid.

## Work items

See `issues/001-repository-context.md` through `issues/010-release-hardening.md`.
