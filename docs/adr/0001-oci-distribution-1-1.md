# ADR 0001: Target OCI Distribution 1.1 core behavior

- Status: accepted
- Date: 2026-09-04

## Context

The legacy Docker Registry v2 handler implements only part of the protocol and sometimes derives digests from transformed data.

## Decision

The OCI adapter targets core OCI Distribution Specification 1.1 behavior, including image indexes, content negotiation, resumable and monolithic uploads, pagination, HEAD, and deletion by digest. Artifact referrer discovery is deferred. Protocol behavior is exercised by an OCI conformance command in addition to focused integration tests.

## Consequences

Exact request bytes become part of the domain contract. The adapter stays thin and registry behavior is independently testable.
