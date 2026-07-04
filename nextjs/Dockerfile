# Multi-stage: the BUILDER runs `next build` (standalone output); the RUNTIME
# ships only the self-contained server - no next CLI, no pnpm, no full
# node_modules. Nothing builds on boot.

# ---- builder ----
FROM node:22-bookworm-slim AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---- runtime ----
FROM node:22-bookworm-slim AS runtime
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# The platform injects PORT and DATABASE_URL. Next's standalone server binds
# HOSTNAME (not HOST), so pin it to all interfaces here - required inside a
# container regardless of platform. PORT is defaulted to 4000 so EXPOSE, the
# bind, and the healthcheck all agree (Next would otherwise default to 3000);
# the platform overrides it with the port it allocated.
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=4000
EXPOSE 4000

# Docker LIVENESS check. The platform injects no healthcheck of its own, so
# THIS is what `docker inspect` reports. Probe /healthz (no DB, instant 200) on
# the REAL listen PORT via process.env.PORT - never a hardcoded port and never
# a DB-touching path, so a database blip can't flip a serving container to
# "unhealthy". curl isn't in this slim image; node's global fetch is. Platform
# readiness (which DOES hit the DB) is the separate GET /health.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD \
  node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
