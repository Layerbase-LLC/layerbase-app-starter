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
# container regardless of platform.
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
EXPOSE 4000
CMD ["node", "server.js"]
