# ADR 0006: Retain Plurid during modernization

- Status: accepted
- Date: 2026-09-04

## Context

The admin interface is built around Plurid. Replacing it alongside storage and protocol work would combine unrelated product and migration risks.

## Decision

Retain current Plurid packages and upgrade them for React 19. Apollo owns remote GraphQL data; React owns local interface state; Redux remains only where Plurid integration requires it.

## Consequences

Interface work focuses on reliability, accessibility, clear states, stable rendering, and smaller client bundles rather than a framework rewrite.
