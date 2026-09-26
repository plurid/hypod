# ADR 0005: Protect writes in public mode

- Status: accepted
- Date: 2026-09-04

## Context

A public registry still needs protection from anonymous mutation while allowing deliberate public distribution.

## Decision

In Public Usage, anonymous callers may ping, discover, and pull only public Imagenes. Every write and all private data require the Owner. If Public Usage starts without owner credentials it is intentionally read-only. Private Usage requires owner credentials. Custom Usage requires an `AccessPolicy` implementation.

## Consequences

Visibility is enforced below HTTP and GraphQL adapters. The built-in token issuer grants short-lived repository scopes rather than a permanent shared token.

Read-only is a property of the `AccessPolicy`, not only of the configuration report: `BuiltInAccessPolicy` refuses `push` and `delete` for every principal and strips write actions from the tokens it mints, and administrative GraphQL mutations are checked against the write capability in addition to `manage`. A read-only Hypod therefore stays browsable while refusing every write it advertises as refused.

Content is repository-scoped. A Manifest may only name Blobs and index children that its own repository already references, so a Blob reaches a second repository through an authorized cross-repository mount rather than through a Manifest that merely knows its digest.
