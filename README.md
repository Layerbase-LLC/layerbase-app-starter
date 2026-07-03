# Layerbase App Starter

Two complete, minimal Layerbase apps - the same todo list, implemented twice.
**Each folder is a self-contained repo-in-waiting**: copy one out and it comes
with everything, including its own publish workflow.

| Example | Stack |
| --- | --- |
| [`node-vite/`](node-vite/) | Hono server + React (Vite) frontend, one process |
| [`nextjs/`](nextjs/) | Next.js App Router, standalone output |

## Make one yours

Grab just the folder you want (no monorepo, no git history):

```bash
pnpx tiged Layerbase-LLC/layerbase-app-starter/node-vite my-app
# or: pnpx tiged Layerbase-LLC/layerbase-app-starter/nextjs my-app

cd my-app && git init && git add -A && git commit -m "init from layerbase-app-starter"
```

Push it to your own GitHub repo and the bundled workflow
(`.github/workflows/publish.yml`) activates on its own: every push to `main`
builds the image and publishes it to **your** GHCR namespace with the tags and
OCI version label the Layerbase platform expects. (Inside this monorepo those
per-folder workflows are dormant - GitHub only runs workflows at a repo root;
the root workflow here builds our demo images.)

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
