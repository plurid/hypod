import type {
  ContractResponse,
  Imagene,
  InputLogin,
  InputSetImageneProject,
  InputSetProjectNamespace,
  Namespace,
  Owner,
  Project,
} from '@plurid/hypod-contracts';
import { documents } from '@plurid/hypod-contracts';
import { print, type DocumentNode } from 'graphql';

import {
  HypodAbortError,
  HypodGraphqlError,
  HypodHttpError,
  HypodNetworkError,
  HypodResponseError,
  type GraphqlErrorData,
} from './errors';

export interface HypodClientOptions {
  endpoint: string | URL;
  token?: string;
  tokenProvider?: () => Promise<string | undefined> | string | undefined;
  fetch?: typeof fetch;
}

export interface RequestOptions {
  signal?: AbortSignal;
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: GraphqlErrorData[];
}

const operations = {
  identifyImagene: /* GraphQL */ `
    query IdentifyImagene($input: InputValueString!) {
      identifyImagene(input: $input) {
        status
        error {
          path
          type
          message
        }
        data {
          id
          generatedAt
          name
          latest
          isPublic
          projectID
          tags {
            id
            generatedAt
            name
            size
            digest
          }
        }
      }
    }
  `,
  obliterateImagene: /* GraphQL */ `
    mutation ObliterateImagene($input: InputValueString!) {
      obliterateImagene(input: $input) {
        status
        error {
          path
          type
          message
        }
      }
    }
  `,
  obliterateImageneTag: /* GraphQL */ `
    mutation ObliterateImageneTag($input: InputObliterateImageneTag!) {
      obliterateImageneTag(input: $input) {
        status
        error {
          path
          type
          message
        }
      }
    }
  `,
  togglePublicImagene: /* GraphQL */ `
    mutation TogglePublicImagene($input: InputTogglePublicImagene!) {
      togglePublicImagene(input: $input) {
        status
        error {
          path
          type
          message
        }
      }
    }
  `,
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const operationText = (operation: string | DocumentNode): string =>
  typeof operation === 'string' ? operation : print(operation);

const endpointUrl = (endpoint: string | URL): URL => {
  const text = endpoint.toString();
  const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(text) ? text : `http://${text}`;
  const url = new URL(withProtocol);
  if (url.pathname === '/' || url.pathname === '') url.pathname = '/graphql';
  return url;
};

export class HypodClient {
  readonly #endpoint: URL;
  readonly #token: string | undefined;
  readonly #tokenProvider: HypodClientOptions['tokenProvider'];
  readonly #fetch: typeof fetch;

  public constructor(options: HypodClientOptions) {
    this.#endpoint = endpointUrl(options.endpoint);
    this.#token = options.token;
    this.#tokenProvider = options.tokenProvider;
    this.#fetch = options.fetch ?? globalThis.fetch;
    if (!this.#fetch) throw new Error('A Fetch API implementation is required.');
  }

  public async request<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
    operation: string | DocumentNode,
    variables?: TVariables,
    options: RequestOptions = {},
  ): Promise<TData> {
    const token = (await this.#tokenProvider?.()) ?? this.#token;
    let response: Response;
    try {
      response = await this.#fetch(this.#endpoint, {
        method: 'POST',
        headers: {
          accept: 'application/graphql-response+json, application/json',
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: operationText(operation), variables: variables ?? {} }),
        ...(options.signal ? { signal: options.signal } : {}),
      });
    } catch (error) {
      if (options.signal?.aborted || (error as Error).name === 'AbortError') {
        throw new HypodAbortError({ cause: error });
      }
      throw new HypodNetworkError({ cause: error });
    }
    const text = await response.text();
    if (!response.ok) throw new HypodHttpError(response.status, text);
    let decoded: unknown;
    try {
      decoded = JSON.parse(text) as unknown;
    } catch (error) {
      throw new HypodResponseError(`Hypod returned non-JSON data: ${(error as Error).message}`);
    }
    if (!isRecord(decoded)) throw new HypodResponseError();
    const result = decoded as GraphqlResponse<TData>;
    if (Array.isArray(result.errors) && result.errors.length > 0) {
      throw new HypodGraphqlError(result.errors);
    }
    if (result.data === undefined) throw new HypodResponseError();
    return result.data;
  }

  public async getImagenes(options?: RequestOptions): Promise<ContractResponse<Imagene[]>> {
    const result = await this.request<{ getImagenes: ContractResponse<Imagene[]> }>(
      documents.getImagenes,
      undefined,
      options,
    );
    return result.getImagenes;
  }

  public async identifyImagene(
    value: string,
    options?: RequestOptions,
  ): Promise<ContractResponse<Imagene>> {
    const result = await this.request<
      { identifyImagene: ContractResponse<Imagene> },
      { input: { value: string } }
    >(operations.identifyImagene, { input: { value } }, options);
    return result.identifyImagene;
  }

  public async getNamespaces(options?: RequestOptions): Promise<ContractResponse<Namespace[]>> {
    const result = await this.request<{ getNamespaces: ContractResponse<Namespace[]> }>(
      documents.getNamespaces,
      undefined,
      options,
    );
    return result.getNamespaces;
  }

  public async getProjects(options?: RequestOptions): Promise<ContractResponse<Project[]>> {
    const result = await this.request<{ getProjects: ContractResponse<Project[]> }>(
      documents.getProjects,
      undefined,
      options,
    );
    return result.getProjects;
  }

  public async getCurrentOwner(options?: RequestOptions): Promise<ContractResponse<Owner>> {
    const result = await this.request<{ getCurrentOwner: ContractResponse<Owner> }>(
      documents.getCurrentOwner,
      undefined,
      options,
    );
    return result.getCurrentOwner;
  }

  public async getUsageType(options?: RequestOptions): Promise<ContractResponse<string>> {
    const result = await this.request<{ getUsageType: ContractResponse<string> }>(
      documents.getUsageType,
      undefined,
      options,
    );
    return result.getUsageType;
  }

  public async login(
    input: InputLogin,
    options?: RequestOptions,
  ): Promise<ContractResponse<Owner>> {
    const result = await this.request<{ login: ContractResponse<Owner> }, { input: InputLogin }>(
      documents.login,
      { input },
      options,
    );
    return result.login;
  }

  public async logout(options?: RequestOptions): Promise<ContractResponse> {
    const result = await this.request<{ logout: ContractResponse }>(
      documents.logout,
      undefined,
      options,
    );
    return result.logout;
  }

  public async setProjectNamespace(
    input: InputSetProjectNamespace,
    options?: RequestOptions,
  ): Promise<ContractResponse<Project>> {
    const result = await this.request<
      { setProjectNamespace: ContractResponse<Project> },
      { input: InputSetProjectNamespace }
    >(documents.setProjectNamespace, { input }, options);
    return result.setProjectNamespace;
  }

  public async setImageneProject(
    input: InputSetImageneProject,
    options?: RequestOptions,
  ): Promise<ContractResponse<Imagene>> {
    const result = await this.request<
      { setImageneProject: ContractResponse<Imagene> },
      { input: InputSetImageneProject }
    >(documents.setImageneProject, { input }, options);
    return result.setImageneProject;
  }

  public async obliterateImagene(id: string, options?: RequestOptions): Promise<ContractResponse> {
    const result = await this.request<
      { obliterateImagene: ContractResponse },
      { input: { value: string } }
    >(operations.obliterateImagene, { input: { value: id } }, options);
    return result.obliterateImagene;
  }

  public async obliterateImageneTag(
    imageneID: string,
    tagID: string,
    options?: RequestOptions,
  ): Promise<ContractResponse> {
    const result = await this.request<
      { obliterateImageneTag: ContractResponse },
      { input: { imageneID: string; tagID: string } }
    >(operations.obliterateImageneTag, { input: { imageneID, tagID } }, options);
    return result.obliterateImageneTag;
  }

  public async togglePublicImagene(
    id: string,
    value: boolean,
    options?: RequestOptions,
  ): Promise<ContractResponse> {
    const result = await this.request<
      { togglePublicImagene: ContractResponse },
      { input: { id: string; value: boolean } }
    >(operations.togglePublicImagene, { input: { id, value } }, options);
    return result.togglePublicImagene;
  }
}

export const createHypodClient = (options: HypodClientOptions): HypodClient =>
  new HypodClient(options);
