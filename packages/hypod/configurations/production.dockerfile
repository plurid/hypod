# Building stage

FROM mhart/alpine-node:12 AS builder


WORKDIR /app


COPY . .


ENV ENV_MODE production
ENV NODE_ENV production


RUN yarn install --production false

RUN yarn build.production



# Launch stage

FROM mhart/alpine-node:12


WORKDIR /app


ENV ENV_MODE production
ENV NODE_ENV production

ENV PORT=56565

ENV HYPOD_QUIET=true

ENV HYPOD_DATABASE_TYPE=filesystem
ENV HYPOD_STORAGE_TYPE=filesystem
ENV HYPOD_STORAGE_BUCKET=bucket_name
ENV HYPOD_STORAGE_ROOT_PATH=./

ENV HYPOD_DOCKER_REALM_BASE=
ENV HYPOD_DOCKER_SERVICE=

ENV HYPOD_AWS_API_VERSION=api_version
ENV HYPOD_AWS_REGION=region
ENV HYPOD_AWS_ACCESS_KEY_ID=aws_access_key_id
ENV HYPOD_AWS_SECRET_ACCESS_KEY=aws_secret_access_key

ENV HYPOD_CUSTOM_LOGIC=false

ENV HYPOD_PRIVATE_OWNER_IDENTONYM=
ENV HYPOD_PRIVATE_OWNER_KEY=
ENV HYPOD_PRIVATE_TOKEN=


COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts


RUN yarn install --production


CMD ["yarn", "start"]
