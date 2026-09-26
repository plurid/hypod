# Operating Hypod 0.2

Hypod 0.2 is a single-process registry backed by SQLite metadata and content-addressed files. Treat the configured data root as one consistency unit: one running writer, one backup, and one restore.

## Configuration

Programmatic settings override canonical environment variables, which override legacy aliases. Relative data paths resolve from the process working directory.

| Variable                  | Default            | Meaning                                                         |
| ------------------------- | ------------------ | --------------------------------------------------------------- |
| `HYPOD_MODE`              | `public`           | `public`, `private`, or programmatic `custom` access            |
| `HYPOD_HOST`              | `127.0.0.1`        | Listen address; use `0.0.0.0` in a container                    |
| `HYPOD_PORT`              | `56565`            | Listen port                                                     |
| `HYPOD_EXTERNAL_URL`      | Derived listen URL | Absolute client-facing HTTP(S) origin used for token challenges |
| `HYPOD_DATA_ROOT`         | `./data`           | SQLite, content, upload, lock, and migration root               |
| `HYPOD_TRUST_PROXY`       | `false`            | Express trust-proxy value: boolean, hop count, or subnet string |
| `HYPOD_OWNER_IDENTONYM`   | unset              | Built-in owner login name                                       |
| `HYPOD_OWNER_KEY`         | unset              | Built-in owner password/key                                     |
| `HYPOD_TOKEN_SECRET`      | unset              | HMAC secret of at least 32 UTF-8 bytes                          |
| `HYPOD_TOKEN_TTL_SECONDS` | `900`              | Token lifetime, from 1 through 86,400 seconds                   |
| `HYPOD_LOG_LEVEL`         | `info`             | `silent`, `error`, `warn`, `info`, or `debug` JSON logs         |
| `HYPOD_SERVE_ADMIN`       | `true`             | Serve the built admin assets                                    |

Private Usage fails closed unless the owner name, key, and token secret are all present. Public Usage without that complete set starts read-only: anonymous clients can pull only repositories marked public, and every write is refused for every principal, including an Owner presenting valid Basic credentials and including administrative mutations over GraphQL. Public Usage with credentials adds authenticated owner writes. Custom Usage is available only through `createHypod({ mode: 'custom', accessPolicy })`.

Legacy environment aliases remain for 0.2 migrations and emit redacted warnings. SQLite and local filesystem storage are the only supported backends; legacy cloud-backend selections fail during configuration rather than being silently ignored.

## TLS and reverse proxies

Terminate TLS at a reverse proxy and keep Hypod on a private network or loopback interface. Set `HYPOD_EXTERNAL_URL` to the exact public HTTPS origin, because OCI bearer challenges and token audiences derive from it. Set `HYPOD_TRUST_PROXY` only to the known proxy hop count or subnet; do not blindly trust arbitrary forwarded headers.

The proxy must:

- preserve request methods, authorization headers, query strings, and response `Location`, `Link`, and `Docker-Content-Digest` headers;
- stream request and response bodies instead of buffering Blob uploads or downloads;
- allow long-lived `PATCH` and `PUT` requests and set limits appropriate for expected Blob sizes;
- route `/v2/`, `/v2/token`, `/graphql`, `/health/live`, `/health/ready`, and `/` to the same Hypod process.

Hypod sets request IDs, `nosniff`, no-referrer, and frame-denial headers. TLS, network admission, rate limiting, and abuse controls remain deployment responsibilities.

## Owner credentials and tokens

Generate the signing secret from a cryptographically secure source, for example `openssl rand -hex 32`. Keep the owner key and token secret in a runtime secret manager. Do not bake them into an image, commit them, or write them to command output.

OCI clients obtain short-lived bearer tokens from `/v2/token` with HTTP Basic owner credentials. Issued tokens are HMAC-SHA256 signed, audience-bound, time-limited, and restricted to their requested repository actions. Changing `HYPOD_TOKEN_SECRET` immediately invalidates existing tokens; use that as the emergency revocation mechanism. Individual-token revocation is not available in the built-in policy.

Example token request:

```sh
curl --user "owner:${HYPOD_OWNER_KEY}" \
  'https://registry.example.com/v2/token?service=registry.example.com&scope=repository:team/app:pull,push'
```

The admin login uses the same credentials and stores its bearer token in an HTTP-only cookie.

## Data and process lifecycle

The active layout is under `<data-root>/v2`: SQLite metadata, immutable digest-addressed content, and resumable uploads. An exclusive lock at `<data-root>/.hypod.lock` prevents two Hypod processes or offline maintenance commands from writing the same root; it sits beside the generation directories rather than inside them, because migration renames a freshly built `v2` into place. The lock is an operating-system record lock, so the kernel releases it whenever the holding process exits, including after `SIGKILL` or a crash — a previous writer can never leave a lock that refuses every later start. The sibling `<data-root>/.hypod.owner` file names the current holder for diagnostics only. Shared-volume replicas are unsupported.

The server handles `SIGINT` and `SIGTERM`, stops accepting work, closes idle HTTP connections, stops GraphQL, closes SQLite, and releases the data-root lock. Give the process enough shutdown grace for active requests to finish.

A process killed without that shutdown needs no manual recovery: the kernel drops its lock as it dies, and the next start acquires the root normally. A start that still reports the root as locked means another Hypod or offline command genuinely holds it.

Use the health endpoints as follows:

- `/health/live`: restart the process when it fails.
- `/health/ready`: remove the process from traffic when it fails.

## Backups and restores

Back up the entire data root while Hypod is stopped. Copying only SQLite or only content can produce an unusable snapshot.

1. Stop Hypod and wait for its process to exit.
2. Run `hypod doctor --data-root /var/lib/hypod`.
3. Snapshot or archive the complete data root, preserving file modes.
4. Start Hypod and confirm `/health/ready`.

To restore, stop Hypod, move the current root aside, restore the complete snapshot to the configured path, run `doctor`, and only then restart. Practice this on a disposable copy before relying on it in production.

## Legacy migration and rollback

Migration is offline, dry-run-first, and idempotent. It holds the exclusive data-root lock for its whole run and therefore refuses to touch a root that a Hypod process is serving. It reads legacy files without mutating them, stages the v2 generation, verifies exact digests and references, then activates it atomically. It also creates `<data-root>/backups/legacy-before-v2` using hard links where possible and copies otherwise.

```sh
hypod migrate --data-root /var/lib/hypod --dry-run
hypod migrate --data-root /var/lib/hypod
hypod doctor --data-root /var/lib/hypod
```

Resolve every dry-run warning that indicates ambiguous or unreadable data. A validation failure leaves the legacy generation active. For rollback to 0.1, stop 0.2, move `v2` and `ACTIVE` aside without deleting them, and start the previous binary against the unchanged legacy tree. For rollback within 0.2, restore a complete offline snapshot. Never run both versions against the same root.

## Diagnostics and garbage collection

These commands are offline because they acquire the exclusive data-root lock, as `migrate` does:

```sh
hypod doctor --data-root /var/lib/hypod
hypod gc --data-root /var/lib/hypod --dry-run
hypod gc --data-root /var/lib/hypod
```

`doctor` checks the layout, SQLite integrity, foreign keys, schema migrations, referenced files, and exact digests. It reports the root as locked whenever a Hypod process is serving it. `gc` reports unreferenced Manifests and Blobs plus expired uploads; without `--dry-run`, it permanently deletes those unreachable objects. Take and verify a backup before applying garbage collection.

## Container hardening

The repository `Dockerfile` runs as UID/GID 10001, declares `/var/lib/hypod` as the data volume, exposes port 56565, and includes a readiness healthcheck. Run it with a read-only root filesystem, a small temporary filesystem, a persistent data mount, dropped Linux capabilities, and your platform's secret injection:

```sh
docker run --read-only --tmpfs /tmp:size=16m \
  --cap-drop ALL \
  --mount type=volume,source=hypod-data,target=/var/lib/hypod \
  --publish 56565:56565 \
  --env-file /secure/path/hypod.env \
  hypod:0.2.0
```

## OCI conformance

The focused local OCI tests run with `pnpm test:oci`. The official suite needs Go 1.24 or newer, a separate checkout of `opencontainers/distribution-spec`, a running disposable Hypod, and two disposable repository names.

```sh
OCI_CONFORMANCE_ROOT=/path/to/distribution-spec \
OCI_REGISTRY=127.0.0.1:56565 \
OCI_REPO1=conformance/repository-one \
OCI_REPO2=conformance/repository-two \
OCI_USERNAME=owner \
OCI_PASSWORD="$HYPOD_OWNER_KEY" \
pnpm test:oci:conformance
```

The wrapper runs the upstream checkout in place, defaults `OCI_VERSION=1.1`, `OCI_TLS=disabled`, `OCI_API_REFERRER=false`, and `OCI_DATA_SHA512=false`, and writes results under `.artifacts/oci-conformance`. Override those variables for a TLS deployment or a broader implementation. Conformance repositories are test data and may be mutated or deleted.

## Current limits

- OCI artifact referrer discovery is deferred.
- Only SHA-256 content is accepted.
- Manifests are buffered with a 16 MiB limit; Blobs stream to and from disk.
- There is no built-in rate limiter, malware scanner, retention scheduler, or individual-token revocation list.
- Horizontal writers and S3/GCS backends are unsupported.
