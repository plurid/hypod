# `@plurid/hypod`

Hypod 0.2.0 is a self-hosted OCI Distribution registry for Node.js 24. It includes a GraphQL administration API and a responsive Plurid administration interface.

## Install

```sh
pnpm add @plurid/hypod
```

The package publishes ESM, CommonJS, TypeScript declarations, and a `hypod` executable.

## Programmatic API

```ts
import { createHypod } from '@plurid/hypod';

const application = await createHypod({
  mode: 'private',
  host: '127.0.0.1',
  port: 56565,
  externalUrl: 'https://registry.example.com',
  dataRoot: '/var/lib/hypod',
  owner: {
    identonym: 'owner',
    key: process.env.HYPOD_OWNER_KEY!,
  },
  tokenSecret: process.env.HYPOD_TOKEN_SECRET!,
});

const address = await application.start();
console.log(address.url);

// Stop accepting work, close HTTP and SQLite, then release the data lock.
await application.stop();
```

`createHypod()` returns explicit lifecycle methods: `ready()`, `start()`, `address()`, and idempotent `stop()`. Importing the package has no listening or filesystem side effects. The default `hypodServer` export and `hypodSetup(logic?)` remain compatibility wrappers for 0.2 consumers.

Custom identity and authorization systems implement the exported `AccessPolicy` and use `{ mode: 'custom', accessPolicy }`. Custom Usage has no environment-only equivalent because the policy is executable code.

## CLI

```sh
hypod serve
hypod migrate --data-root /var/lib/hypod --dry-run
hypod migrate --data-root /var/lib/hypod
hypod doctor --data-root /var/lib/hypod
hypod gc --data-root /var/lib/hypod --dry-run
hypod gc --data-root /var/lib/hypod
```

`serve` owns the data-root lock until graceful shutdown. `migrate`, `doctor`, and `gc` are offline commands; stop the server first. Run migration and garbage collection in dry-run mode before applying them.

## Access modes

- `public`: anonymous catalog access and pulls for repositories marked public. With no complete owner configuration, the whole registry is read-only.
- `private`: owner authentication is required for reads and writes; incomplete credentials fail startup.
- `custom`: an application-provided `AccessPolicy` decides authentication, authorization, and optional token issuance.

Built-in credentials require `owner.identonym`, `owner.key`, and a `tokenSecret` of at least 32 UTF-8 bytes. Tokens are short-lived HMAC-SHA256 JWTs scoped by repository and action.

## Environment

The canonical variables are `HYPOD_MODE`, `HYPOD_HOST`, `HYPOD_PORT`, `HYPOD_EXTERNAL_URL`, `HYPOD_DATA_ROOT`, `HYPOD_TRUST_PROXY`, `HYPOD_OWNER_IDENTONYM`, `HYPOD_OWNER_KEY`, `HYPOD_TOKEN_SECRET`, `HYPOD_TOKEN_TTL_SECONDS`, `HYPOD_LOG_LEVEL`, and `HYPOD_SERVE_ADMIN`.

See [`environment/.env.example`](environment/.env.example) for a safe template and the repository [`docs/operations.md`](../../docs/operations.md) for exact semantics, proxying, backups, migration, tokens, healthchecks, and container hardening.

## Supported scope

- SQLite metadata and local content-addressed files
- one writer per data root
- OCI Distribution 1.1 core pulls, pushes, resumable and monolithic Blob uploads, mounts, Manifests and indexes, tags, catalog pagination, HEAD, and deletion by digest
- GraphQL compatibility operations and typed shared contracts
- streamed Blob uploads/downloads and exact SHA-256 verification

OCI referrers, SHA-512, S3/GCS, and multiple processes writing a shared volume are not supported in 0.2.

## Routes

| Route           | Purpose                    |
| --------------- | -------------------------- |
| `/`             | Admin interface            |
| `/graphql`      | GraphQL administration API |
| `/v2/`          | OCI Distribution API       |
| `/v2/token`     | OCI bearer token service   |
| `/health/live`  | Liveness probe             |
| `/health/ready` | Readiness probe            |

## License

See [`LICENSE`](LICENSE).
