# Hypod

Hypod 0.2.0 is a self-hosted OCI Distribution registry with a GraphQL administration API, a responsive Plurid administration interface, and a typed JavaScript client.

The 0.2 runtime is deliberately focused: it stores metadata in SQLite and exact content bytes on the local filesystem, permits one writer per data root, and targets core OCI Distribution 1.1 workflows. S3/GCS storage, shared-volume multi-process operation, and OCI referrer discovery are not supported.

## Requirements

- Node.js 24.15 or newer for repository development
- pnpm 11.25.0, pinned by `packageManager`
- Docker or another OCI client when exercising registry workflows

## Quick start

Install and build all workspaces:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm build
```

Start a local read-only Public Usage registry:

```sh
HYPOD_DATA_ROOT=./data \
HYPOD_EXTERNAL_URL=http://127.0.0.1:56565 \
node packages/hypod-server/build/cli.mjs serve
```

The admin interface is at `http://127.0.0.1:56565/`, GraphQL is at `/graphql`, and the OCI API is below `/v2/`. Liveness and readiness probes are `/health/live` and `/health/ready`.

Public Usage is read-only until all owner credentials are configured. To enable authenticated writes, set `HYPOD_OWNER_IDENTONYM`, `HYPOD_OWNER_KEY`, and a random `HYPOD_TOKEN_SECRET` containing at least 32 UTF-8 bytes. Private Usage additionally requires authentication for reads:

```sh
export HYPOD_MODE=private
export HYPOD_OWNER_IDENTONYM=owner
export HYPOD_OWNER_KEY='replace-with-a-long-random-password'
export HYPOD_TOKEN_SECRET="$(openssl rand -hex 32)"
export HYPOD_EXTERNAL_URL=http://127.0.0.1:56565
node packages/hypod-server/build/cli.mjs serve
```

Do not place real credentials in committed environment files. The canonical, secret-free template is [`packages/hypod-server/environment/.env.example`](packages/hypod-server/environment/.env.example).

## Container

Build the Node 24 image from the repository root:

```sh
docker build --tag hypod:0.2.0 .
```

Run it as the built-in unprivileged user with an immutable root filesystem and a writable data volume:

```sh
docker volume create hypod-data
docker run --name hypod --read-only --tmpfs /tmp:size=16m \
  --mount type=volume,source=hypod-data,target=/var/lib/hypod \
  --publish 56565:56565 \
  --env HYPOD_EXTERNAL_URL=http://127.0.0.1:56565 \
  hypod:0.2.0
```

Supply owner secrets with a runtime secret mechanism or an untracked `--env-file`, never as image build arguments. The image includes a readiness healthcheck and uses the Node process directly so `SIGTERM` reaches Hypod's graceful-shutdown handler.

## Programmatic server

```ts
import { createHypod } from '@plurid/hypod';

const hypod = await createHypod({
  mode: 'private',
  owner: { identonym: 'owner', key: process.env.HYPOD_OWNER_KEY! },
  tokenSecret: process.env.HYPOD_TOKEN_SECRET!,
  externalUrl: 'https://registry.example.com',
  dataRoot: '/var/lib/hypod',
});

await hypod.start();
// Later: await hypod.stop();
```

The old default server export and `hypodSetup()` remain as compatibility wrappers in 0.2. New integrations should use `createHypod()` and an `AccessPolicy` for custom identity systems.

## Workspace

| Package                   | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `@plurid/hypod`           | Registry server, CLI, GraphQL API, and admin interface             |
| `@plurid/hypod-client`    | Typed Fetch-based GraphQL client plus the legacy default factory   |
| `@plurid/hypod-contracts` | Private shared GraphQL schema, documents, and TypeScript contracts |

Useful root commands:

```sh
pnpm test
pnpm test:integration
pnpm test:oci
pnpm typecheck
pnpm lint
pnpm build
pnpm pack:check
pnpm verify
```

Dependency updates are reproducible through npm-check-updates:

```sh
pnpm deps:check
pnpm deps:update
pnpm install
```

`.ncurc.mjs` retains GraphQL 16 for Apollo Server 5 peer compatibility and Node 24 typings for the supported runtime. These are compatibility ceilings, not missed updates.

## OCI conformance

Start a disposable, write-enabled Hypod, obtain a local checkout of `opencontainers/distribution-spec`, then run:

```sh
OCI_CONFORMANCE_ROOT=/path/to/distribution-spec \
OCI_REGISTRY=127.0.0.1:56565 \
OCI_REPO1=conformance/repository-one \
OCI_REPO2=conformance/repository-two \
OCI_USERNAME=owner \
OCI_PASSWORD="$HYPOD_OWNER_KEY" \
pnpm test:oci:conformance
```

The wrapper defaults to OCI 1.1 with TLS, referrer discovery, and SHA-512 content disabled for the supported 0.2 scope, and enables every other capability Hypod implements — blob and manifest digest headers, upload cancellation, byte-range blob pulls, cross-repository mounting, tag deletion, and manifest tag parameters — so a regression in one of them fails the run rather than being reported as unsupported. Results are written to `.artifacts/oci-conformance`. It does not download or modify the upstream suite.

## Operations and compatibility

See [`docs/operations.md`](docs/operations.md) for reverse-proxy TLS, access modes, token handling, backups, migration, rollback, diagnostics, garbage collection, and conformance testing. The supported legacy surface is recorded in [`docs/compatibility/current-contract.md`](docs/compatibility/current-contract.md), and architectural decisions live in [`docs/adr`](docs/adr).

Project work is tracked as local Markdown under [`docs/issues/modernization`](docs/issues/modernization); this repository does not depend on GitHub Issues.

## License

See [`LICENSE`](LICENSE).
