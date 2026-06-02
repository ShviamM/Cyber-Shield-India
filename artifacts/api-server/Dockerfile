# Netraksh API server — build context MUST be the repo root:
#   docker build -f artifacts/api-server/Dockerfile -t netraksh-api .
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /app
# Workspace manifests first (better layer caching).
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc tsconfig.base.json tsconfig.json ./
COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/api-server build

FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# esbuild bundles the server into a single self-contained file.
COPY --from=build /app/artifacts/api-server/dist ./dist
EXPOSE 8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
