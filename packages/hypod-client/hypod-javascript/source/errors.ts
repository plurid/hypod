export type HypodClientErrorKind = 'abort' | 'graphql' | 'http' | 'network' | 'response';

export class HypodClientError extends Error {
  public constructor(
    public readonly kind: HypodClientErrorKind,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'HypodClientError';
  }
}

export class HypodAbortError extends HypodClientError {
  public constructor(options?: ErrorOptions) {
    super('abort', 'The Hypod request was aborted.', options);
    this.name = 'HypodAbortError';
  }
}

export class HypodNetworkError extends HypodClientError {
  public constructor(options?: ErrorOptions) {
    super('network', 'The Hypod endpoint could not be reached.', options);
    this.name = 'HypodNetworkError';
  }
}

export class HypodHttpError extends HypodClientError {
  public constructor(
    public readonly status: number,
    public readonly responseBody: string,
  ) {
    super('http', `Hypod returned HTTP ${status}.`);
    this.name = 'HypodHttpError';
  }
}

export interface GraphqlErrorData {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, unknown>;
}

export class HypodGraphqlError extends HypodClientError {
  public constructor(public readonly errors: GraphqlErrorData[]) {
    super('graphql', errors.map(({ message }) => message).join('; ') || 'GraphQL request failed.');
    this.name = 'HypodGraphqlError';
  }
}

export class HypodResponseError extends HypodClientError {
  public constructor(message = 'Hypod returned an invalid GraphQL response.') {
    super('response', message);
    this.name = 'HypodResponseError';
  }
}
