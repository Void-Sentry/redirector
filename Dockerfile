ARG IMAGE=node:lts-alpine

FROM ${IMAGE} AS builder

ARG SERVICE_BUILDTIME

WORKDIR /build

COPY . .

RUN npm ci && npm run build

FROM ${IMAGE}

ARG SERVICE_BUILDTIME

WORKDIR /bundle

COPY --chown=node:node --chmod=500 --from=builder /build/node_modules    node_modules
COPY --chown=node:node --chmod=500 --from=builder /build/dist            dist

RUN mkdir -p /redirector/logs && chown node:node -R /redirector

EXPOSE 3000

USER node

ENTRYPOINT ["node", "dist/main.js"]
