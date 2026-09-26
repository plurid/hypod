# JavaScript SDK and admin interface

- Status: ready-for-agent

## Acceptance criteria

- [x] `createHypodClient` supports typed operations, abort signals, a token provider, and classified errors.
- [x] The legacy client factory and return shapes remain supported.
- [x] Apollo owns remote state and interface mutations recover through rollback or refetch.
- [x] Independent loading is parallel, keys are stable, and expensive planes are lazy.
- [x] Loading, empty, authentication, failure, confirmation, and accessible interaction states are covered.

## Completion

Completed 2026-09-04.
