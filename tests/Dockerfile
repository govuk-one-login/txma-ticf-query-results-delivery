# syntax=docker/dockerfile:1
ARG ALPINE_VERSION=3.21
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS run-tests

# use opencontainer annotations https://github.com/opencontainers/image-spec/blob/main/annotations.md
ARG GIT_COMMIT=unspecified
LABEL org.opencontainers.image.revision=$GIT_COMMIT

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    bash \
    aws-cli \
    mandoc \
    curl

WORKDIR /test-app

COPY package.json package-lock.json tsconfig.json .npmrc ./
COPY tests ./tests
COPY common ./common
COPY tests/run-tests.sh /

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    NODE_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) \
    npm ci && chown -R node:node /test-app
RUN chmod +x /run-tests.sh

USER node

WORKDIR /test-app/tests

ENTRYPOINT ["/run-tests.sh"]
