# Post-modernization defect sweep

- Status: ready-for-agent

Adversarial review of the 0.2 working tree, driving a live Hypod as an OCI and GraphQL client
and re-running the upstream conformance suite with every capability enabled. Full findings and
evidence in `docs/modernization-analysis.md`. Every defect below survived a passing
`pnpm verify` and the recorded conformance run.

## Acceptance criteria

### Correctness, security, and operations

- [x] `HEAD` on a Blob no longer leaks a file descriptor per request (`Registry.describeBlob`).
- [x] A Manifest may only reference Blobs and index children its own repository already
      references, closing the cross-repository content leak; `runMigration` links legacy Blobs
      per repository so migration still succeeds.
- [x] Read-only Public Usage refuses every write, over OCI and over GraphQL, including for an
      Owner presenting Basic credentials, and mints tokens without write actions.
- [x] `runMigration` holds the exclusive data-root lock; the lock moved to
      `<data-root>/.hypod.lock` so it no longer sits inside the generation `v2` that migration
      renames into place.
- [x] The data-root lock is an operating-system record lock, so a writer killed with `SIGKILL`
      releases it and the next start succeeds, while a live holder is still refused.
- [x] The `*` action in a token scope grants every action on that resource, and space-separated
      scopes in one parameter are parsed, so `registry:catalog:*` works for the Docker CLI.
- [x] An unknown repository returns `NAME_UNKNOWN`, not `NAME_INVALID`.
- [x] Importing the built CLI module does not start a registry or take the lock.

### Distribution capabilities

- [x] Byte-range Blob pulls: `Accept-Ranges`, 206 with `Content-Range`, 416 for unsatisfiable
      ranges, and a full-response fall back for multi-range syntax.
- [x] `DELETE` of a Manifest by tag removes only the tag; the Manifest stays addressable by
      digest.
- [x] A mount the caller cannot authorize is challenged with both the target and source scopes
      instead of silently re-uploading the Blob.
- [x] `?tag=` parameters on a push by digest create the tags and are echoed as `OCI-Tag`.
- [x] `?n=0` returns an empty page on `/v2/_catalog` and `/v2/<name>/tags/list`.
- [x] `scripts/oci-conformance.mjs` enables every capability Hypod implements, so a regression
      fails the run rather than being reported as unsupported.

### Smaller corrections

- [x] `imagenes.latest` has one definition, shared by publication and deletion.
- [x] `LegacyHypodLogicAdapter` maps `manage` to `checkOwnerCanPull()`, so viewing the admin
      interface no longer requires push rights.
- [x] The end-to-end run removes its disposable data root instead of accumulating one per run.

### Evidence

- [x] At least one regression test per defect; `pnpm verify` passes end to end.
- [x] Conformance skips reduced from 46 to 1, with 0 failures.

## Dependencies

Amends 004 (persistence), 005 (operations CLI), 006 (access tokens), 007 (OCI adapter),
008 (GraphQL contracts). Related: ADR 0002, ADR 0005.

## Notes

Issue 007's completion note records 672 conformance tests; the stored artifact in
`.artifacts/oci-conformance/` records 723 with 46 skipped. A skip in that suite is not a pass —
it means the capability was probed and not found. Six capabilities were being reported absent:
blob and manifest digest headers, upload cancellation, and tag parameters already worked and
were simply disabled in the runner; byte-range pulls and tag deletion were genuinely missing;
cross-repository mounting was implemented but unreachable through the token flow.

Remaining conformance gaps are deliberate: referrer discovery and SHA-512 content are outside
the documented 0.2 scope, and anonymous cross-repository mounting is not offered by a registry
that requires credentials for push.

## Completion

Completed 2026-09-05.

`pnpm verify` passes end to end. Assertions went from 13/3/2 to 14/9/12 across the unit,
integration, and OCI suites. The upstream OCI Distribution conformance suite at commit
`97274622c11112caa21efb8c52acca3c6b8fa7f1` reports 787 tests, 0 failures, 1 skipped — against
723 tests, 0 failures, 46 skipped before.
