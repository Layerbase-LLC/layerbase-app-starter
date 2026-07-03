# Multi-stage: the BUILDER compiles the frontend; the RUNTIME ships production
# deps (+ tsx, which runs the server) and the prebuilt assets - no build
# toolchain in the image, nothing builds on boot. Same shape as Layerbase's
# own session-replay app image.

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
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Create /app node-owned up front and drop privileges BEFORE installing, so
# nothing needs a recursive chown (which would duplicate layers).
RUN corepack enable && mkdir -p /app /pnpm && chown node:node /app /pnpm
USER node
WORKDIR /app

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --chown=node:node src/server ./src/server
COPY --from=builder --chown=node:node /app/dist-web ./dist-web

# The platform injects PORT / HOST / DATABASE_URL; these are dev-only defaults.
ENV NODE_ENV=production
EXPOSE 4000
CMD ["pnpm", "start"]
