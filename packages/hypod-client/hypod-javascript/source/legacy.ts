import type { DocumentNode } from 'graphql';

import type { Imagene } from '@plurid/hypod-contracts';

import { createHypodClient } from './client';
import type { HypodClient } from './client';

export interface HypodOptions {
  log: boolean;
}

export class LegacyHypodTransport {
  readonly #client: HypodClient;
  readonly #log: boolean;

  public constructor(endpoint: string, token: string, options: Partial<HypodOptions> = {}) {
    this.#client = createHypodClient({ endpoint, token });
    this.#log = options.log ?? false;
  }

  public async execute<I extends Record<string, unknown>, T>(
    input: I,
    mutation: string | DocumentNode,
    mutationName: string,
  ): Promise<T | undefined> {
    return this.#legacyRequest(input, mutation, mutationName);
  }

  public async query<I extends Record<string, unknown>, T>(
    input: I,
    query: string | DocumentNode,
    queryName: string,
  ): Promise<T | undefined> {
    return this.#legacyRequest(input, query, queryName);
  }

  async #legacyRequest<I extends Record<string, unknown>, T>(
    input: I,
    operation: string | DocumentNode,
    operationName: string,
  ): Promise<T | undefined> {
    try {
      const data = await this.#client.request<Record<string, T>, { input: I }>(operation, {
        input,
      });
      return data[operationName];
    } catch (error) {
      if (this.#log) console.error('hypod > request failed', error);
      return undefined;
    }
  }
}

const HypodTree = (endpoint: string, token: string, options: Partial<HypodOptions> = {}) => {
  const client = createHypodClient({ endpoint, token });
  const logError = (error: unknown) => {
    if (options.log) console.error('hypod > request failed', error);
  };
  const identify = async (name: string): Promise<Imagene | undefined> => {
    try {
      const result = await client.identifyImagene(name);
      return result.status ? (result.data ?? undefined) : undefined;
    } catch (error) {
      logError(error);
      return undefined;
    }
  };
  return {
    imagene: {
      identify,
      obliterate: async (id: string): Promise<boolean> => {
        try {
          return (await client.obliterateImagene(id)).status;
        } catch (error) {
          logError(error);
          return false;
        }
      },
      identifyTag: async (name: string) => {
        const separator = name.lastIndexOf(':');
        if (separator < 1) return undefined;
        const imagene = await identify(name.slice(0, separator));
        const tag = imagene?.tags.find(
          ({ name: tagName }) => tagName === name.slice(separator + 1),
        );
        return imagene && tag ? { imageneID: imagene.id, tagID: tag.id } : undefined;
      },
      obliterateTag: async (imageneID: string, tagID: string): Promise<boolean> => {
        try {
          return (await client.obliterateImageneTag(imageneID, tagID)).status;
        } catch (error) {
          logError(error);
          return false;
        }
      },
      togglePublic: async (id: string, isPublic: boolean): Promise<boolean> => {
        try {
          return (await client.togglePublicImagene(id, isPublic)).status;
        } catch (error) {
          logError(error);
          return false;
        }
      },
    },
  };
};

export default HypodTree;
