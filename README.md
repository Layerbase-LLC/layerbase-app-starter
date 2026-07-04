# Layerbase App Starter

Two complete, minimal Layerbase apps - the same todo list, implemented twice.
**Each folder is a self-contained repo**: copy one out and it comes with
everything, including its own publish workflow.

| Example | Stack |
| --- | --- |
| [`node-vite/`](node-vite/) | Hono server + React (Vite) frontend, one process |
| [`nextjs/`](nextjs/) | Next.js App Router, standalone output |

## Start with a prompt

Building with an AI coding assistant? Pick the prompt for your stack, fill in
the `[BRACKETED]` parts, and paste it in.

### Node app with a Vite frontend

```text
Bootstrap a Layerbase app for me.

1. Scaffold from the starter:
     pnpx tiged Layerbase-LLC/layerbase-app-starter/node-vite [APP_NAME]
2. The app I am building: [WHAT YOUR APP DOES, e.g. "a link shortener with
   click analytics"]. Replace the example todo feature (the /api routes in
   src/server/index.ts, the schema in src/server/db.ts, and the UI in
   src/web/) with it, keeping the same structure.
3. Frontend: it ships as Vite + React. I want [react | vue | svelte]; if not
   React, swap the Vite plugin and rewrite src/web accordingly.
4. Do NOT change the platform contract pieces: the PORT/HOST binding, the
   idempotent boot migration against DATABASE_URL (extend the schema, keep it
   idempotent), the GET /healthz (liveness) + GET /health (readiness) split,
   the Dockerfile HEALTHCHECK, SIGTERM draining, the multi-stage Dockerfile,
   and .github/workflows/publish.yml.
5. For local dev, create a Postgres with spindb
   (spindb create [APP_NAME] --engine postgresql) then copy .env.example to .env and
   set DATABASE_URL to its connection string.
6. Create a GitHub repository named [APP_NAME] and push to main - the bundled
   workflow publishes the image to my GHCR namespace automatically.

Hosting reference: https://layerbase.com/docs/apps - the app runs as one
stateless container with a managed database injected as DATABASE_URL; TLS,
domains, and self-healing are handled by the platform.
```

### Next.js app

```text
Bootstrap a Layerbase app for me.

1. Scaffold from the starter:
     pnpx tiged Layerbase-LLC/layerbase-app-starter/nextjs [APP_NAME]
2. The app I am building: [WHAT YOUR APP DOES, e.g. "a changelog page with an
   admin editor"]. Replace the example todo feature (the route handlers in
   app/api/todos/, the schema in lib/db.ts, and the UI in app/page.tsx +
   components/) with it, keeping the same structure.
3. Do NOT change the platform contract pieces: the standalone output config,
   the idempotent boot migration in lib/db.ts wired through
   instrumentation.ts (extend the schema, keep it idempotent),
   app/healthz/route.ts (liveness) + app/health/route.ts (readiness), the
   Dockerfile HEALTHCHECK, the multi-stage Dockerfile, and
   .github/workflows/publish.yml.
4. For local dev, create a Postgres with spindb
   (spindb create [APP_NAME] --engine postgresql) then copy .env.example to .env and
   set DATABASE_URL to its connection string.
5. Create a GitHub repository named [APP_NAME] and push to main - the bundled
   workflow publishes the image to my GHCR namespace automatically.

Hosting reference: https://layerbase.com/docs/apps - the app runs as one
stateless container with a managed database injected as DATABASE_URL; TLS,
domains, and self-healing are handled by the platform.
```

## Or by hand

```bash
pnpx tiged Layerbase-LLC/layerbase-app-starter/node-vite my-app
# or: pnpx tiged Layerbase-LLC/layerbase-app-starter/nextjs my-app

cd my-app && git init && git add -A && git commit -m "init from layerbase-app-starter"
```

Push it to your own GitHub repo and the bundled workflow
(`.github/workflows/publish.yml`) activates: every push to `main` builds the
image and publishes it to **your** GHCR namespace with the tags and OCI
version label the Layerbase platform expects. (Inside this monorepo the
per-folder workflows are dormant - GitHub only executes workflows at a repo
root, and this repo deliberately has none.)

Then replace the todo parts with your real app. The platform-facing plumbing
is already done.

## The contract

A Layerbase app is a container the platform can run without knowing anything
about it. That takes exactly five things, all demonstrated in both examples:

| Requirement | Why |
| --- | --- |
| Listen on `PORT`, bound to all interfaces | The platform's proxy terminates TLS and routes to your container |
| Persist ONLY to `DATABASE_URL`, migrate on boot, idempotently | The container is disposable - every redeploy replaces it |
| Answer `GET /healthz` (liveness) and `GET /health` (readiness) | Two probes with two jobs - see [Health checks](#health-checks) below |
| Exit cleanly on `SIGTERM` | Redeploys drain in-flight requests instead of dropping them |
| Ship as a prebuilt image with an OCI version label | Nothing builds on boot; the platform detects available updates |

Everything else - TLS, domains, DNS, the database itself, backups, restarts -
is the platform's job, not yours.

## Health checks

An app answers **two** health endpoints, and they must not be the same handler:

| Endpoint | Job | Touches the DB? | Who probes it |
| --- | --- | --- | --- |
| `GET /healthz` | Liveness - is the process serving HTTP at all? | **No.** Instant 200, no auth, no I/O | The **image's own `HEALTHCHECK`** in the `Dockerfile` (what `docker inspect` reports) |
| `GET /health` | Readiness - can it actually serve, DB and all? | **Yes.** Pings the database | The **Layerbase platform** reconciler, which recreates the container and can revive the backing store |

Why split them? The platform injects **no** Docker healthcheck, so your image's
`HEALTHCHECK` is what Docker reports on its own. If that healthcheck probes a
DB-dependent path, one database blip flips a container that is serving fine to
permanently "unhealthy". Keep liveness (`/healthz`) dependency-free so it only
fails when the process is genuinely wedged; let the platform's readiness probe
(`/health`) be the one that cares about the database, because its remediation
can revive that database.

Two rules the `HEALTHCHECK` lines in both examples follow, both learned the
hard way in production:

- **Read the port from `PORT`** (`http://127.0.0.1:${PORT}/healthz`), never a
  hardcoded literal. The platform allocates the port and injects it as `PORT`;
  a hardcoded port probes the wrong place and always reports unhealthy.
- **Use a dependency the runtime image actually has.** These slim images have
  no `curl`, so the probe uses Node's built-in global `fetch`
  (`node -e "fetch(...)"`), not `curl`.

## Run an example locally

```bash
cd node-vite   # or nextjs

# A local Postgres (Layerbase's spindb CLI, or bring your own)
spindb create todos --engine postgresql
cp .env.example .env   # then set DATABASE_URL to its connection string

pnpm install
pnpm dev
```

Each example's README has the stack-specific details.

## Hosting on Layerbase

Layerbase provisions the container, the hidden backing database, the
`DATABASE_URL` wiring, an HTTPS hostname, and optional custom domains - the
same machinery that runs [Session Replay](https://layerbase.com/docs/apps).
Listing a new app in the catalog is currently done with us rather than
self-serve: if you have an app that fits this contract,
[get in touch](https://layerbase.com/support).
