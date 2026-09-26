# SQLite persistence and Registry

- Status: ready-for-agent

## Acceptance criteria

- [x] SQLite migrations create all domain tables with foreign keys, WAL, and transactions.
- [x] ContentStore writes atomically and verifies exact-byte SHA-256 digests.
- [x] Registry owns Upload, Blob, Manifest, Tag, visibility, deletion, and reference calculation invariants.
- [x] Namespace and Project removal null child links.
- [x] One process owns a data root at a time; cloud configuration fails clearly.

## Completion

Completed 2026-09-04.
