# Modernization review — 0.2 line

A review of the uncommitted 0.2 modernization: what it changed, whether the changes hold up
under adversarial use, and what was wrong with them.

- Reviewed at: 2026-09-05
- Scope: the full working tree against `HEAD` (`ba3451e`) — 85 changed files, 126 staged paths
- Method: read every source module, drove a live Hypod as an OCI and GraphQL client, then
  re-ran the upstream OCI Distribution conformance suite with every capability enabled

## 1. What the modernization did

The 2023 code was a Plurid server with hand-rolled filesystem persistence and a `HypodLogic`
seam. The rewrite keeps the outer contract and replaces the inside.

### Shape

A single-package server became a pnpm workspace of three packages plus a root toolchain:

| Package                   | Role                                                                          |
| ------------------------- | ----------------------------------------------------------------------------- |
| `@plurid/hypod-contracts` | GraphQL SDL, shared document nodes, and the domain types                      |
| `@plurid/hypod`           | Registry core, adapters, operations CLI, and the Plurid/React admin interface |
| `@plurid/hypod-client`    | Typed SDK over the GraphQL contract, plus a legacy factory wrapper            |

The toolchain moved to Node 24, ESM, pnpm catalogs, `tsdown` dual-format builds, Vite 8 for
the admin bundle, Vitest 5 across four configurations, Playwright for one end-to-end journey,
and ESLint 10 with Prettier. `pnpm verify` chains all of it.

### Architecture

The important structural win is that the registry stopped being HTTP-shaped. `Registry` owns
the Imagene lifecycle and knows nothing about Express; `MetadataRepository` (SQLite via
`node:sqlite`, `STRICT` tables, foreign keys on, WAL) owns relationships and transactions;
`ContentStore` owns immutable bytes under a content-addressed `v2/` tree with atomic
rename-based writes and directory fsync. The OCI and GraphQL adapters are two thin mappings
onto the same core, and `AccessPolicy` is the single authentication and authorization seam.

That separation is genuinely good, and it is why every defect below was fixable in one place
rather than scattered across handlers.

### Compatibility

The compatibility promise is kept honestly. `hypodSetup(logic?)` and the default export
survive as `LegacyHypodServer`, `HypodLogic` is adapted to `AccessPolicy` by
`LegacyHypodLogicAdapter`, every legacy environment variable is read (including the
misspelled `PERFORMER_CUSTOM_LOGIC_USAGE` and `HYPOD_QUITE`) and reported as a deprecation,
and the GraphQL envelopes are unchanged. `runMigration` treats legacy files as immutable
input, builds a new generation beside them, validates it, and only then activates.

### Evidence quality

The recorded conformance artifact in `.artifacts/oci-conformance/` was real: 723 tests,
0 failures. But **46 of its cases were skipped**, and a skip in this suite is not a pass — it
means the suite probed a capability, did not find it, and moved on. Six capabilities were
being reported as absent, four of which Hypod already implemented correctly and two of which
it did not implement at all. The completion note on issue 007 also says "672 tests" where the
stored artifact says 723; the note and the artifact are from different runs.

The deeper gap was density. Before this review the workspace had 21 assertions across
14 test files for roughly 7,000 lines of new code. Everything green, very little pinned down.
Every defect in sections 2 and 3 survived a passing `pnpm verify` and a passing conformance
run.

## 2. Defects — correctness, security, and operations

Eight, all reproduced against a running server before and after the fix.

### 2.1 File-descriptor leak on `HEAD` of a Blob — critical

`createOciRouter` handled `GET` and `HEAD` for `/v2/<name>/blobs/<digest>` in one branch,
calling `registry.openBlob()` for both. `openBlob` calls `createBlobReadStream`. On `HEAD`
the handler then called `response.end()` and dropped the stream, never reading or destroying
it, so the descriptor stayed open indefinitely.

Measured: 60 `HEAD` requests left exactly 60 open descriptors, none released.

`docker push` issues a `HEAD` per layer before deciding whether to upload it, and `docker
pull` does the same. A registry serving normal traffic walks into `EMFILE` and then fails
every request, including health checks — a denial of service reachable by ordinary,
well-behaved clients doing the most common operation there is.

_Fix:_ `Registry.describeBlob()` resolves the record without opening bytes, and the adapter
splits `HEAD` onto it. The `GET` path additionally destroys its stream in a `finally`.

### 2.2 Cross-repository content leak through manifest push — critical, security

`Registry.putManifest` validated referenced Blobs with `metadata.getBlob(digest)` and
`content.hasBlob(digest)`. Both are global lookups; neither asks whether the _target_
repository is entitled to that Blob.

Any principal who could push to `team/attacker` could publish a manifest naming a layer
digest that only ever existed in `team/private`, then pull those bytes from their own
repository — and, by flipping their own Imagene public, expose them to anonymous callers. The
same held for image-index children via `getManifestByDigest`.

Verified before the fix: a manifest referencing a Blob pushed only to `team/a` was accepted
into `team/b` with 201, and `GET /v2/team/b/blobs/<digest>` then returned 200.

This contradicts invariant 4 and is exactly the hole `mountBlob` exists to close — the mount
path authorizes a pull against the source repository first, and the test suite asserts that a
push-only token cannot mount. Manifest push bypassed that check entirely.

_Fix:_ both loops in `putManifest` require repository-scoped reachability —
`repositoryReferencesBlob` for Blobs and a new `repositoryReferencesManifest` for index
children — and return `MANIFEST_BLOB_UNKNOWN` otherwise. This matches the reference
implementation, where a Blob must be uploaded or mounted into a repository before a manifest
there may name it. Because legacy data stores Blobs in one global tree with no repository
association, `runMigration` now links each manifest's declared Blobs into that manifest's
repository before publishing it; without that the tightened check would have failed every
migrated manifest.

### 2.3 "Read-only" public mode accepted writes — critical

`resolveConfig` sets `readOnly` when the mode is public and owner credentials are incomplete,
`createHypod` logs _"Public Usage started read-only"_, `doctor` reports it — and nothing
enforced it. `config.readOnly` was read in exactly three places, all cosmetic.

The gap opens when `HYPOD_OWNER_IDENTONYM` and `HYPOD_OWNER_KEY` are set but
`HYPOD_TOKEN_SECRET` is not. `credentialsComplete` is false, so the registry declares itself
read-only; but `BuiltInAccessPolicy` still receives the owner credentials, still authenticates
Basic auth, and still adds that principal to `#unscopedOwners`, which grants unconditional
access.

Verified: `config.readOnly === true` and a Basic-authenticated blob push returned 201 and
wrote to disk.

_Fix:_ `BuiltInAccessPolicy` takes a `readOnly` flag, refuses `push` and `delete` for every
principal, and strips write actions from any token it mints. Administrative mutations are
writes too, so `guarded()` in the GraphQL adapter — which every mutation routes through — now
checks a write capability in addition to `manage` and returns a `ReadOnly` envelope. Admin
_reads_ still work, so a read-only registry stays browsable.

### 2.4 Migration ran without the data-root lock — high

`runGarbageCollection` and `runDoctor` both acquire `DataRootLock`. `runMigration` did not,
despite invariant 7 and ADR 0002 calling migration an offline operation. Nothing stopped
`hypod migrate` from building a staging generation and renaming it over `v2` underneath a live
server holding an open SQLite handle.

There was a trap in the obvious fix: `DataRootLock.acquire` created `<dataRoot>/v2` as a side
effect of placing the lock inside it, and `runMigration` uses `exists(<dataRoot>/v2)` as its
"already applied" test and `rename()` as its activation step. Locking first would have made
every migration report `already-applied`, and a lock file inside `v2` would have made the
atomic rename fail with `ENOTEMPTY`.

_Fix:_ the lock moved to `<dataRoot>/.hypod.lock`. A lock protecting the data root does not
belong inside the generation directory migration atomically replaces. `runMigration` now
wraps its whole run in it.

### 2.5 A crashed writer bricked the data root — high

`DataRootLock` was an exclusive-create file containing the owner's PID. Nothing released it on
abnormal exit, so a Hypod ended by `SIGKILL`, an OOM kill, or a hard crash left a lock that
made every subsequent start fail until an operator deleted the file by hand. For a container
that restarts automatically, that is an outage requiring manual intervention.

The tempting fix — check whether the recorded PID is still alive — is unsafe: after PID reuse
it steals a lock from a running process and admits two writers to one root, turning downtime
into corruption.

_Fix:_ the lock is now an open SQLite `BEGIN EXCLUSIVE` transaction against the lock file, so
the **operating system** owns it. The kernel drops the underlying record lock whenever the
holding process exits, for any reason, and no liveness heuristic is needed. Verified by
spawning a process that takes the lock and `SIGKILL`s itself: the next acquisition succeeds,
while a second acquisition against a _live_ holder — in the same process or another — is still
refused. A sibling `.hypod.owner` file names the current holder for diagnostics only; the lock
never depends on it being accurate.

### 2.6 Docker's wildcard token scope was rejected — high

`parseScopes` filtered scope actions against a fixed list and silently dropped anything else,
including `*`. The Docker CLI and `crane` request `registry:catalog:*`; that produced a token
with an empty action list and a 401 loop. `parseScopes` also assumed one scope per query
parameter, so the space-separated form went unparsed.

_Fix:_ `*` expands to every action on that resource, values are deduplicated, and each `scope`
parameter is split on whitespace. Only an authenticated Owner can obtain a token at all, so
expansion grants nothing new.

### 2.7 `NAME_INVALID` where the spec requires `NAME_UNKNOWN` — medium

`Registry.tags()` threw `NAME_INVALID` with status 404 for a repository the registry does not
have. `NAME_INVALID` means a _malformed_ name and is a 400-class code; `NAME_UNKNOWN` is the
code for an absent repository, and it was not even in the `RegistryErrorCode` union. Clients
that branch on the error code read "your request is malformed" instead of "no such
repository".

### 2.8 The built CLI started a server when imported — medium

`src/cli.ts` called `void runCli()` at module scope while also exporting `runCli`. `tsdown`
emits it as `build/cli.mjs` and `build/cli.cjs`, both reachable by `import()`, so importing
the module started a registry and took the data-root lock. Hit by accident during probing.

_Fix:_ the CLI runs only when it is the process entry point, compared by realpath. Verified
import-safe in both build formats.

## 3. Defects — unexercised and missing Distribution capabilities

Turning on the conformance capabilities the recorded run had disabled proved that four of them
already worked and were simply never tested. Probing the remaining skips found two features
that were genuinely missing and two authorization bugs behind them.

### 3.1 Byte-range Blob pulls were unimplemented — high

`GET /v2/<name>/blobs/<digest>` ignored `Range` entirely and advertised no `Accept-Ranges`.
Verified: `Range: bytes=10-19` on a 128-byte Blob returned 200 with all 128 bytes.

Returning the whole representation is legal, but it means a client resuming an interrupted
layer download silently re-fetches it from the start — and a client that assumes 206 semantics
and writes the body at the requested offset corrupts the file.

_Fix:_ single-range support per RFC 9110 — `bytes=a-b`, `bytes=a-`, and `bytes=-n`, with the
end clamped to the Blob, 206 plus `Content-Range` and a correct `Content-Length`, 416 with
`Content-Range: bytes */<size>` for a range that cannot be satisfied, and a fall back to the
full 200 response for multi-range or unparseable syntax. `Accept-Ranges: bytes` is advertised
on both `GET` and `HEAD`.

### 3.2 Manifest deletion by tag was rejected — medium

`DELETE /v2/<name>/manifests/<tag>` returned `400 DIGEST_INVALID`. The spec expects a registry
either to delete the reference or to answer `405`; 400 is neither, and it breaks `crane delete`
and `oras` against a tag.

_Fix:_ a tag reference deletes only that tag, leaving the Manifest addressable by digest; a
digest reference behaves as before. An unknown tag is `404 MANIFEST_UNKNOWN`, and an unknown
repository is `404 NAME_UNKNOWN`.

### 3.3 Cross-repository mounting could never succeed for real clients — high

Mounting requires push on the target _and_ pull on the source. The adapter checked both, but
when the caller's token lacked source pull it silently fell through to starting an ordinary
upload. The `WWW-Authenticate` challenge only ever named the target repository, so a client
following the standard token flow could never obtain a token that permitted the mount. Every
cross-repository mount therefore degraded to a full re-upload — defeating the entire point of
the feature. The conformance suite reported exactly this: _"registry returned status 202, fell
back to blob POST+PUT"_.

_Fix:_ when the principal cannot pull the source, the registry now challenges with both scopes
(`repository:<target>:pull,push repository:<source>:pull`) so the client can upgrade its token
and retry. The challenge depends only on the caller's own scopes, so it reveals nothing about
whether the source repository holds the Blob. A caller that _is_ authorized but whose Blob is
genuinely unmountable still falls back to a normal upload, as the spec requires.

The existing test asserted the old 202 fallback — that assertion encoded the bug and now
asserts the challenge instead.

### 3.4 The `tag` query parameter on manifest push was ignored — medium

`PUT /v2/<name>/manifests/<digest>?tag=1.2.3&tag=latest` published the manifest but created no
tags and returned no `OCI-Tag` header, so a client pushing a digest with tags in one request
silently got an untagged manifest.

_Fix:_ tag parameters are validated, applied inside the same transaction that publishes the
manifest, and echoed as `OCI-Tag`. More than 64 tags is `414`.

### 3.5 The conformance runner disabled capabilities Hypod implements

`scripts/oci-conformance.mjs` turned off blob and manifest digest headers, upload cancellation,
and tag parameters alongside the genuinely out-of-scope referrers and SHA-512. Only the latter
two are documented as out of scope; the rest were simply untested. All four pass.

_Fix:_ the runner now enables everything Hypod implements, so a regression in one of them fails
the run instead of being reported as unsupported.

## 4. Smaller corrections

- **`imagenes.latest` had two definitions.** `publishManifest` set it to the tag just pushed
  while `#refreshLatest` recomputed it as the newest tag by timestamp, so the two disagreed
  after a delete or an out-of-order push. Publication now uses `#refreshLatest` as well, giving
  one definition: the most recently generated tag.
- **`LegacyHypodLogicAdapter` mapped `manage` onto `checkOwnerCanPush()`,** so legacy custom
  logic needed push rights merely to _view_ the admin interface. Now that mutations are checked
  separately against `push`, `manage` maps to `checkOwnerCanPull()`.
- **`.artifacts/e2e-<uuid>/` data roots accumulated** — 19 at review time. Playwright now
  removes the disposable root it mints, via a `globalTeardown`.
- **`?n=0` returned a full page.** Distribution requires at most `n` entries; `positiveCount`
  accepted only `parsed > 0`, so `n=0` fell through to the default of 100, and `catalog` and
  `tags` each clamped with `Math.max(1, …)`. A shared `pageSize` helper now clamps to
  `[0, 1000]`, and an empty page emits no `Link` header.

## 5. Verification

| Gate                                | Before                    | After                    |
| ----------------------------------- | ------------------------- | ------------------------ |
| `pnpm verify`                       | pass                      | pass                     |
| Unit / integration / OCI assertions | 13 / 3 / 2                | 14 / 9 / 12              |
| Playwright journey                  | pass                      | pass                     |
| OCI conformance (`97274622`)        | 723 tests, **46 skipped** | 787 tests, **1 skipped** |
| Conformance failures                | 0                         | 0                        |

The single remaining skip is anonymous cross-repository mounting, which a registry requiring
credentials for push correctly does not offer. The four disabled cases are referrer discovery,
documented as outside the 0.2 scope.

New regression coverage, at least one test per defect:

- `packages/hypod-server/tests/oci/regression.test.ts` — descriptor discipline on `HEAD`,
  cross-repository Blob and index-child refusal, `NAME_UNKNOWN`, `n=0` on both listings, the
  wildcard catalog scope, byte ranges including both unsatisfiable forms and the multi-range
  fallback, tag deletion leaving the Manifest intact, tag query parameters, and a read-only
  registry that still serves public pulls.
- `packages/hypod-server/tests/integration/operations-safety.test.ts` — migration refused
  against a served data root, lock placement outside `v2`, recovery after a `SIGKILL`ed writer,
  refusal against a live holder, and import-safety of the CLI.
- `packages/hypod-server/tests/integration/graphql-access.test.ts` — a read-only Owner may
  browse but not mutate.
- `packages/hypod-server/src/registry/registry.test.ts` — one definition of `latest` across
  publication and deletion.

## 6. Assessment

The architecture is sound and the compatibility work is careful. The defects were not
structural; they were the class of thing a green pipeline hides — a resource leak on a path no
test measured, an authorization check applied on one route and forgotten on the one beside it,
a configuration flag computed and reported but never consulted, a lock placed inside the
directory it was meant to protect, and a conformance suite whose skips were being read as
passes.

Two of them, 2.2 and 2.3, would have shipped a registry that leaks private layers and accepts
writes it advertises as refused. Section 3 is the more instructive half: those capabilities
were invisible precisely because the tooling reported "not supported" rather than "failed".
The lesson for the remaining issues in `docs/issues/modernization/` is that a skip is a gap
until proven otherwise, and that adversarial use finds what conformance and typechecking
cannot — every defect here was found by driving the server as a hostile client, and none by
the 21 assertions that were passing.
