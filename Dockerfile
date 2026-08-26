# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- deps ------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

# --------------------------------------------------------------- build ------
FROM node:24-alpine AS build
WORKDIR /app
# Deliberately NOT NODE_ENV=production: that would make Vite inline React's
# development build and skip its production optimisations.
# Bring the whole installed tree over (keeps workspace symlinks and any
# nested node_modules intact), then overlay the sources.
COPY --from=deps /app ./
COPY . .
RUN npm run build

# ------------------------------------------------------- production deps ----
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci --omit=dev --workspace @piccolo/server --include-workspace-root; \
    else npm install --omit=dev --workspace @piccolo/server --include-workspace-root; fi

# ------------------------------------------------------------- runtime ------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

RUN apk add --no-cache tini wget && \
    addgroup -g 1001 piccolo && \
    adduser -S -u 1001 -G piccolo piccolo

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/server/package.json ./apps/server/package.json
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist

USER piccolo
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=4s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/server/dist/index.js"]
