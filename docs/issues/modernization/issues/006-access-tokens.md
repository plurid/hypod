# Access policy and scoped tokens

- Status: ready-for-agent

## Acceptance criteria

- [x] `AccessPolicy` separates authentication from action/repository authorization.
- [x] Built-in owner authentication and custom implementations are supported.
- [x] Short-lived HMAC bearer tokens contain validated subject, audience, time, and access claims.
- [x] Public, Private, and Custom Usage behavior is enforced below transports.
- [x] Legacy `HypodLogic` delegates through an adapter.

## Completion

Completed 2026-09-04.
