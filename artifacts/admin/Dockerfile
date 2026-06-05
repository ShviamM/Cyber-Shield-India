# Netraksh admin dashboard (static SPA) — build context MUST be the repo root:
#   docker build -f artifacts/admin/Dockerfile -t netraksh-admin .
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /app
# Copy the whole monorepo (node_modules/dist are excluded via .dockerignore).
# pnpm needs every workspace manifest present to resolve the lockfile, so we
# copy the repo and then install only this package's dependency subgraph.
COPY . .
RUN pnpm install --frozen-lockfile --filter @workspace/admin...
# vite.config requires PORT and BASE_PATH at build time. Use "/" when the admin
# is served at the domain root; set a subpath (e.g. /admin/) if hosted under one.
ENV NODE_ENV=production PORT=5000 BASE_PATH=/admin/
RUN pnpm --filter @workspace/admin build

FROM nginx:alpine
COPY artifacts/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/artifacts/admin/dist/public /usr/share/nginx/html
EXPOSE 80
