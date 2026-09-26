# ADR 0003: Modernize behind compatibility wrappers

- Status: accepted
- Date: 2026-09-04

## Context

Published consumers may import the default server, call `hypodSetup(logic?)`, query the existing GraphQL schema, use legacy environment names, or instantiate the original JavaScript client.

## Decision

Introduce `createHypod` and `createHypodClient` as the preferred interfaces while retaining legacy exports, operation names, response envelopes, and environment aliases throughout 0.2. Compatibility wrappers delegate to the new modules and emit redacted deprecation warnings where appropriate.

## Consequences

The old and new entry points share one implementation. Removal requires a later explicit breaking release.
