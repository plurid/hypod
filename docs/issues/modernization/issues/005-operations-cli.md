# Migration, doctor, and garbage collection CLI

- Status: ready-for-agent

## Acceptance criteria

- [x] `hypod migrate --dry-run` reports an immutable legacy-data plan.
- [x] Applied migration is resumable/idempotent, builds beside legacy data, validates, and activates last.
- [x] `hypod doctor` reports configuration, layout, database, and content integrity.
- [x] `hypod gc --dry-run` reports unreferenced content and apply mode works only offline.

## Completion

Completed 2026-09-04.
