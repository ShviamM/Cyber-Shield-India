# Netraksh admin dashboard (static SPA) — build context MUST be the repo root:
#   docker build -f artifacts/admin/Dockerfile -t netraksh-admin .
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc tsconfig.base.json tsconfig.json ./
COPY lib ./lib
COPY artifacts/admin ./artifacts/admin
RUN pnpm install --frozen-lockfile
# vite.config requires PORT and BASE_PATH at build time. Use "/" when the admin
# is served at the domain root; set a subpath (e.g. /admin/) if hosted under one.
ENV NODE_ENV=production PORT=5000 BASE_PATH=/
RUN pnpm --filter @workspace/admin build

FROM nginx:alpine
COPY artifacts/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/artifacts/admin/dist/public /usr/share/nginx/html
EXPOSE 80
