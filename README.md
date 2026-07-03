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
   idempotent), GET /health, SIGTERM draining, the multi-stage Dockerfile,
   and .github/workflows/publish.yml.
5. For local dev, create a Postgres with spindb
   (spindb create [APP_NAME] --engine postgresql) and put its connection
   string in .env as DATABASE_URL.
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
   app/health/route.ts, the multi-stage Dockerfile, and
   .github/workflows/publish.yml.
4. For local dev, create a Postgres with spindb
   (spindb create [APP_NAME] --engine postgresql) and put its connection
   string in .env as DATABASE_URL.
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
| Answer `GET /health` | The platform probes it and self-heals your app when it stops answering |
| Exit cleanly on `SIGTERM` | Redeploys drain in-flight requests instead of dropping them |
| Ship as a prebuilt image with an OCI version label | Nothing builds on boot; the platform detects available updates |

Everything else - TLS, domains, DNS, the database itself, backups, restarts -
is the platform's job, not yours.

## Run an example locally

```bash
cd node-vite   # or nextjs

# A local Postgres (Layerbase's spindb CLI, or bring your own)
spindb create todos --engine postgresql
echo 'DATABASE_URL=postgresql://...' > .env

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
