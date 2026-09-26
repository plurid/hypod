# `@plurid/hypod-client`

A typed, Fetch-based GraphQL client for Hypod 0.2.0. It publishes ESM, CommonJS, and TypeScript declarations and works with Node.js 24 or modern browsers.

## Install

```sh
pnpm add @plurid/hypod-client
```

## Preferred API

```ts
import { createHypodClient } from '@plurid/hypod-client';

const hypod = createHypodClient({
  endpoint: 'https://registry.example.com/graphql',
  tokenProvider: () => sessionStorage.getItem('hypod-token') ?? undefined,
});

const response = await hypod.identifyImagene('team/application');
if (!response.status || !response.data) {
  throw new Error(response.error?.message ?? 'Imagene was not found.');
}

console.log(response.data.tags);
```

If the endpoint has no path, the client appends `/graphql`. Pass a static `token`, an asynchronous `tokenProvider`, or neither for anonymous public queries. You can also inject a compatible `fetch` implementation.

Every convenience method returns Hypod's stable `{ status, data, error }` contract envelope. Available methods include:

- `getImagenes`, `identifyImagene`, `getNamespaces`, `getProjects`, `getCurrentOwner`, and `getUsageType`;
- `login` and `logout`;
- `setProjectNamespace`, `setImageneProject`, `togglePublicImagene`, `obliterateImagene`, and `obliterateImageneTag`;
- `request` for another GraphQL document or operation string.

All requests accept an optional `{ signal }` for cancellation.

```ts
const controller = new AbortController();
const pending = hypod.getImagenes({ signal: controller.signal });
controller.abort();
await pending;
```

Transport failures are typed as `HypodAbortError`, `HypodNetworkError`, `HypodHttpError`, `HypodGraphqlError`, or `HypodResponseError`, all extending `HypodClientError`.

## Legacy factory

The original default factory remains available for 0.2 compatibility:

```ts
import Hypod from '@plurid/hypod-client';

const hypod = Hypod('https://registry.example.com/graphql', token, { log: true });
const imagene = await hypod.imagene.identify('team/application');
```

It preserves the legacy behavior of returning `undefined` or `false` when a request fails. New code should prefer `createHypodClient()`, which keeps errors observable and exposes the complete typed response.

## License

See [`LICENSE`](LICENSE).
