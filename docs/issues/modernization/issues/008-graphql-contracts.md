# GraphQL compatibility and internal contracts

- Status: ready-for-agent

## Acceptance criteria

- [x] The GraphQL adapter delegates to Registry and AccessPolicy.
- [x] Existing route, names, inputs, response envelopes, and fields remain compatible.
- [x] Nullable relationships and assignment mutations are exposed.
- [x] Anonymous queries contain public Imagenes only; mutations require authorization.
- [x] SDL and typed documents live in a private contracts workspace package.

## Completion

Completed 2026-09-04.
