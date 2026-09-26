# OCI Distribution adapter

- Status: ready-for-agent

## Acceptance criteria

- [x] Core pull, push, list, HEAD, delete, mount, pagination, and content-negotiation behavior is implemented.
- [x] Monolithic and resumable uploads stream through Registry staging with correct offsets.
- [x] Errors, headers, status codes, Manifest digests, image indexes, and visibility match the specification.
- [x] Focused integration tests and an official conformance command exist.

## Completion

Completed 2026-09-04.

The upstream OCI Distribution 1.1 conformance suite at commit `97274622c11112caa21efb8c52acca3c6b8fa7f1` passed with 672 tests passing and no failures. Referrer discovery and SHA-512 content were disabled to match the documented 0.2 scope.
