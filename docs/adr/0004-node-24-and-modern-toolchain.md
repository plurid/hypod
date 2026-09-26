# ADR 0004: Standardize on Node.js 24 and a pnpm workspace

- Status: accepted
- Date: 2026-09-04

## Context

The packages have separate lockfiles, divergent build scripts, and an obsolete Node.js baseline.

## Decision

Use Node.js 24 LTS, one root pnpm workspace and lockfile, strict native TypeScript 7, tsdown for Node/library outputs, Vite for browser assets, ESLint flat configuration, Vitest, Testing Library, and Playwright. Until TypeScript 7.1 exposes a compiler API, install Microsoft's TypeScript 6 compatibility package under the `typescript` name for API consumers such as typescript-eslint and expose TypeScript 7 as `@typescript/native` for the `tsc` executable. Repository-level scripts are CI-provider-neutral. Repository development requires Node.js 24.15 or newer so the dependency-audit toolchain remains supported.

## Consequences

Published libraries provide ESM, CommonJS, and declarations. Node 24 is the minimum supported runtime. tsdown is the maintained Rolldown/Oxc successor recommended by tsup and preserves the Node protocol imports required by `node:sqlite`. Type checks use native TypeScript 7 while current programmatic tooling uses the supported TypeScript 6 API side by side; the compatibility alias can be removed once that tooling supports the TypeScript 7 API.
