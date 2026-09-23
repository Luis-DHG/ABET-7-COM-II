# syntax=docker/dockerfile:1

# BlogDPC · ISAC — imagen local (monorepo pnpm).
# El server Express sirve el frontend (apps/web/dist) de forma estática,
# así que un solo contenedor expone toda la página en :3000.
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:${PATH}" \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@11.19.0 --activate
WORKDIR /app

# ---- deps + build: instala todo (tsc necesita tipos) y construye ----
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --no-frozen-lockfile
COPY tsconfig.base.json ./
COPY packages/contracts ./packages/contracts
COPY apps/server ./apps/server
COPY apps/web ./apps/web
RUN pnpm --filter @blogdpc/contracts build \
 && pnpm --filter @blogdpc/web build \
 && pnpm --filter @blogdpc/server build

# ---- runner: build listo, solo expone la app ----
FROM deps AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/server
COPY --from=deps /app/apps/server/drizzle ./drizzle
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD ["node", "-e", "fetch('http://localhost:3000/api/health/live').then((r)=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
# Las migraciones drizzle corren antes de arrancar (equivale al `prestart`).
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/server.js"]
