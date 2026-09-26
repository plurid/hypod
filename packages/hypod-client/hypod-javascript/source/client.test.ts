import { describe, expect, it, vi } from 'vitest';

import { HypodHttpError, createHypodClient } from './index';

describe('createHypodClient', () => {
  it('uses a fresh token provider, forwards cancellation, and classifies HTTP failures', async () => {
    const controller = new AbortController();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: { getImagenes: { status: true, data: [{ name: 'team/app' }] } } }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(new Response('unavailable', { status: 503 }));
    const tokenProvider = vi.fn(async () => 'short-lived-token');
    const client = createHypodClient({
      endpoint: 'https://registry.example.test/graphql',
      tokenProvider,
      fetch: fetchImplementation,
    });

    const result = await client.getImagenes({ signal: controller.signal });
    expect(result.data?.[0]?.name).toBe('team/app');
    expect(tokenProvider).toHaveBeenCalledOnce();
    expect(fetchImplementation.mock.calls[0]?.[1]).toMatchObject({
      signal: controller.signal,
      headers: expect.objectContaining({ authorization: 'Bearer short-lived-token' }),
    });
    await expect(client.getImagenes()).rejects.toBeInstanceOf(HypodHttpError);
  });
});
