# Netraksh public marketing website (static SPA) — build context MUST be the repo root:
#   docker build -f artifacts/website/Dockerfile -t netraksh-website .
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /app
# Copy the whole monorepo (node_modules/dist are excluded via .dockerignore).
# pnpm needs every workspace manifest present to resolve the lockfile, so we
# copy the repo and then install only this package's dependency subgraph.
COPY . .
RUN pnpm install --frozen-lockfile --filter @workspace/website...
# vite.config requires PORT and BASE_PATH at build time. The marketing site is
# served at the domain root, so BASE_PATH is "/".
# The MSG91 OTP widget credentials are client-public (they ship in the bundle by
# design) and must be present at build time so Vite inlines them; DigitalOcean
# passes the matching BUILD_TIME env vars in as Docker build args.
ARG VITE_MSG91_WIDGET_ID
ARG VITE_MSG91_TOKEN_AUTH
ENV NODE_ENV=production PORT=5000 BASE_PATH=/ \
    VITE_MSG91_WIDGET_ID=$VITE_MSG91_WIDGET_ID \
    VITE_MSG91_TOKEN_AUTH=$VITE_MSG91_TOKEN_AUTH
RUN pnpm --filter @workspace/website build

FROM nginx:alpine
COPY artifacts/website/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/artifacts/website/dist/public /usr/share/nginx/html
EXPOSE 80
