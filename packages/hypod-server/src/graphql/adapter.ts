import { randomUUID } from 'node:crypto';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { typeDefs } from '@plurid/hypod-contracts';
import express, { Router, type Request, type Response } from 'express';

import type { AccessPolicy, Principal } from '../access/types';
import type { HypodMode } from '../config/config';
import type { Logger } from '../logging/logger';
import type { Registry } from '../registry/registry';

interface GraphqlContext {
  request: Request;
  response: Response;
  principal: Principal | null;
}

export interface GraphqlAdapterOptions {
  registry: Registry;
  accessPolicy: AccessPolicy;
  mode: HypodMode;
  externalUrl: URL;
  service: string;
  logger: Logger;
}

export interface GraphqlAdapter {
  router: Router;
  stop(): Promise<void>;
}

interface ValueInput {
  value: string;
}

interface ToggleInput {
  id: string;
  value: boolean;
}

interface DeleteTagInput {
  imageneID: string;
  tagID: string;
}

interface LoginInput {
  identonym: string;
  key: string;
}

interface ProjectNamespaceInput {
  projectID: string;
  namespaceID: string | null;
}

interface ImageneProjectInput {
  imageneID: string;
  projectID: string | null;
}

const success = <T>(data?: T) => ({ status: true, ...(data === undefined ? {} : { data }) });

const failure = (path: string, type: string, message: string) => ({
  status: false,
  error: { path, type, message },
});

const requestID = (request: Request): string => {
  const value = request.header('x-request-id');
  return value && /^[A-Za-z0-9._:-]{1,128}$/.test(value) ? value : randomUUID();
};

export const createGraphqlAdapter = async (
  options: GraphqlAdapterOptions,
): Promise<GraphqlAdapter> => {
  const { registry, accessPolicy, mode, externalUrl, service, logger } = options;

  const canManage = (context: GraphqlContext) =>
    accessPolicy.authorize({ principal: context.principal, action: 'manage' });

  // Administrative mutations are writes, so they are additionally checked against the
  // write capability. This is what keeps a read-only Hypod read-only through GraphQL.
  const canWrite = (context: GraphqlContext) =>
    accessPolicy.authorize({ principal: context.principal, action: 'push' });

  const guarded = async <T>(
    context: GraphqlContext,
    path: string,
    operation: (ownerID: string) => T | Promise<T>,
  ) => {
    if (!(await canManage(context)))
      return failure(path, 'Unauthorized', 'Owner access is required.');
    if (!(await canWrite(context)))
      return failure(path, 'ReadOnly', 'This Hypod does not accept writes.');
    try {
      return success(await operation(context.principal?.id ?? 'owner'));
    } catch (error) {
      logger.warn('GraphQL mutation failed', {
        requestID: requestID(context.request),
        path,
        error,
      });
      return failure(path, 'OperationError', 'The operation could not be completed.');
    }
  };

  const resolvers = {
    Query: {
      getImagenes: async (_parent: unknown, _arguments: unknown, context: GraphqlContext) =>
        success(registry.listImagenes(!(await canManage(context)))),
      identifyImagene: async (
        _parent: unknown,
        arguments_: { input: ValueInput },
        context: GraphqlContext,
      ) => {
        const imagene = registry.identifyImagene(
          arguments_.input.value,
          !(await canManage(context)),
        );
        return imagene
          ? success(imagene)
          : failure('identifyImagene', 'NotFound', 'Imagene was not found.');
      },
      getNamespaces: async (_parent: unknown, _arguments: unknown, context: GraphqlContext) =>
        success((await canManage(context)) ? registry.metadata.listNamespaces() : []),
      getProjects: async (_parent: unknown, _arguments: unknown, context: GraphqlContext) =>
        success((await canManage(context)) ? registry.metadata.listProjects() : []),
      getCurrentOwner: async (_parent: unknown, _arguments: unknown, context: GraphqlContext) => {
        if (!(await canManage(context))) {
          return failure('getCurrentOwner', 'Unauthorized', 'Owner access is required.');
        }
        return success(registry.metadata.owner(context.principal?.id ?? 'owner'));
      },
      getUsageType: () => success(mode),
    },
    Mutation: {
      obliterateImagene: (
        _parent: unknown,
        arguments_: { input: ValueInput },
        context: GraphqlContext,
      ) =>
        guarded(context, 'obliterateImagene', () => registry.deleteImagene(arguments_.input.value)),
      obliterateImageneTag: (
        _parent: unknown,
        arguments_: { input: DeleteTagInput },
        context: GraphqlContext,
      ) =>
        guarded(context, 'obliterateImageneTag', () =>
          registry.deleteTag(arguments_.input.imageneID, arguments_.input.tagID),
        ),
      togglePublicImagene: (
        _parent: unknown,
        arguments_: { input: ToggleInput },
        context: GraphqlContext,
      ) =>
        guarded(context, 'togglePublicImagene', () => {
          const imagene = registry.setImagenePublic(arguments_.input.id, arguments_.input.value);
          if (!imagene) throw new Error('Imagene not found.');
          return imagene;
        }),
      registerNamespace: (
        _parent: unknown,
        arguments_: { input: ValueInput },
        context: GraphqlContext,
      ) =>
        guarded(context, 'registerNamespace', (ownerID) =>
          registry.createNamespace(arguments_.input.value, ownerID),
        ),
      obliterateNamespace: (
        _parent: unknown,
        arguments_: { input: ValueInput },
        context: GraphqlContext,
      ) =>
        guarded(context, 'obliterateNamespace', () =>
          registry.deleteNamespace(arguments_.input.value),
        ),
      generateProject: (
        _parent: unknown,
        arguments_: { input: ValueInput },
        context: GraphqlContext,
      ) =>
        guarded(context, 'generateProject', (ownerID) =>
          registry.createProject(arguments_.input.value, ownerID),
        ),
      obliterateProject: (
        _parent: unknown,
        arguments_: { input: ValueInput },
        context: GraphqlContext,
      ) =>
        guarded(context, 'obliterateProject', () => registry.deleteProject(arguments_.input.value)),
      setProjectNamespace: (
        _parent: unknown,
        arguments_: { input: ProjectNamespaceInput },
        context: GraphqlContext,
      ) =>
        guarded(context, 'setProjectNamespace', () => {
          const project = registry.setProjectNamespace(
            arguments_.input.projectID,
            arguments_.input.namespaceID,
          );
          if (!project) throw new Error('Project not found.');
          return project;
        }),
      setImageneProject: (
        _parent: unknown,
        arguments_: { input: ImageneProjectInput },
        context: GraphqlContext,
      ) =>
        guarded(context, 'setImageneProject', () => {
          const imagene = registry.setImageneProject(
            arguments_.input.imageneID,
            arguments_.input.projectID,
          );
          if (!imagene) throw new Error('Imagene not found.');
          return imagene;
        }),
      login: async (
        _parent: unknown,
        arguments_: { input: LoginInput },
        context: GraphqlContext,
      ) => {
        if (!accessPolicy.issueToken) {
          return failure('login', 'Unsupported', 'This AccessPolicy does not support login.');
        }
        const authorization = `Basic ${Buffer.from(
          `${arguments_.input.identonym}:${arguments_.input.key}`,
        ).toString('base64')}`;
        const token = await accessPolicy.issueToken({
          authorization,
          service,
          access: [
            {
              type: 'repository',
              name: '*',
              actions: ['pull', 'push', 'delete', 'manage'],
            },
            { type: 'registry', name: 'catalog', actions: ['catalog', 'manage'] },
          ],
        });
        if (!token) return failure('login', 'Unauthorized', 'Owner credentials are invalid.');
        context.response.setHeader(
          'Set-Cookie',
          `hypod_token=${encodeURIComponent(token.token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${token.expires_in}${
            externalUrl.protocol === 'https:' ? '; Secure' : ''
          }`,
        );
        return success(registry.metadata.owner('owner'));
      },
      logout: (_parent: unknown, _arguments: unknown, context: GraphqlContext) => {
        context.response.setHeader(
          'Set-Cookie',
          `hypod_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${
            externalUrl.protocol === 'https:' ? '; Secure' : ''
          }`,
        );
        return success();
      },
    },
  };

  const server = new ApolloServer<GraphqlContext>({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: false,
  });
  await server.start();
  const router = Router();
  router.use(express.json({ limit: '1mb' }));
  router.use(
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const authorization = req.header('authorization');
        const cookie = req.header('cookie');
        const principal = await accessPolicy.authenticate({
          requestID: requestID(req),
          ...(authorization ? { authorization } : {}),
          ...(cookie ? { cookie } : {}),
        });
        return { request: req, response: res, principal };
      },
    }),
  );

  return { router, stop: () => server.stop() };
};
