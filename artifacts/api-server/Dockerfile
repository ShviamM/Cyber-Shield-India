# Netraksh API server — build context MUST be the repo root:
#   docker build -f artifacts/api-server/Dockerfile -t netraksh-api .
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /app
# Copy the whole monorepo (node_modules/dist are excluded via .dockerignore).
# pnpm needs every workspace manifest present to resolve the lockfile, so we
# copy the repo and then install only this package's dependency subgraph.
COPY . .
RUN pnpm install --frozen-lockfile --filter @workspace/api-server...
RUN pnpm --filter @workspace/api-server build

FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# esbuild bundles the server into a single self-contained file.
COPY --from=build /app/artifacts/api-server/dist ./dist
EXPOSE 8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
