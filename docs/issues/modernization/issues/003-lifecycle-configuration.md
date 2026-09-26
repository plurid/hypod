# Lifecycle and configuration

- Status: ready-for-agent

## Acceptance criteria

- [x] `createHypod(config)` returns an awaitable application with start, stop, ready, and address behavior.
- [x] Configuration has deterministic precedence and validated Usage requirements.
- [x] Startup awaits every Module and shutdown drains HTTP and releases the data-root lock.
- [x] Health, request IDs, structured redacted logging, proxy trust, and signal handling are covered.
- [x] The default export and `hypodSetup(logic?)` delegate compatibly.

## Completion

Completed 2026-09-04.
