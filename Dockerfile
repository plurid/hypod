# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.15.0

FROM node:${NODE_VERSION}-bookworm-slim AS toolchain
ARG PNPM_VERSION=11.25.0
ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
RUN corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate
WORKDIR /workspace

FROM toolchain AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY patches ./patches
COPY packages/hypod-contracts/package.json packages/hypod-contracts/package.json
COPY packages/hypod-server/package.json packages/hypod-server/package.json
COPY packages/hypod-client/hypod-javascript/package.json packages/hypod-client/hypod-javascript/package.json
RUN --mount=type=cache,id=hypod-pnpm,target=/pnpm/store pnpm --store-dir=/pnpm/store install --frozen-lockfile
COPY tsconfig.base.json ./
COPY about/identity/hypod-logo.png about/identity/hypod-logo.png
COPY packages ./packages
RUN pnpm build
RUN --mount=type=cache,id=hypod-pnpm,target=/pnpm/store pnpm --store-dir=/pnpm/store deploy --filter=@plurid/hypod --prod /opt/hypod

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HYPOD_HOST=0.0.0.0 \
    HYPOD_PORT=56565 \
    HYPOD_DATA_ROOT=/var/lib/hypod \
    HYPOD_LOG_LEVEL=info
WORKDIR /app
RUN groupadd --system --gid 10001 hypod \
    && useradd --system --uid 10001 --gid hypod --home-dir /nonexistent --shell /usr/sbin/nologin hypod \
    && mkdir -p /var/lib/hypod \
    && chown hypod:hypod /var/lib/hypod
COPY --from=build --chown=hypod:hypod /opt/hypod ./
USER 10001:10001
VOLUME ["/var/lib/hypod"]
EXPOSE 56565
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.HYPOD_PORT ?? '56565') + '/health/ready').then(response => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"]
ENTRYPOINT ["node", "build/cli.mjs"]
CMD ["serve"]
