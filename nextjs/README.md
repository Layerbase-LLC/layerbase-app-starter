# Layerbase App Starter - Next.js

The todo app on the [Layerbase app contract](https://github.com/Layerbase-LLC/layerbase-app-starter#the-contract), Next.js edition
(App Router, standalone output).

Where each piece of the contract lives:

| Requirement | Where |
| --- | --- |
| `PORT` / bind all interfaces | Next standalone reads `PORT`; `HOSTNAME=0.0.0.0` pinned in the `Dockerfile` |
| `DATABASE_URL` + idempotent boot migration | `lib/db.ts`, run from `instrumentation.ts` (Next's boot hook) |
| `GET /health` | `app/health/route.ts` |
| `SIGTERM` draining | handled by Next's standalone server |
| Prebuilt image | `Dockerfile` (multi-stage, `output: 'standalone'`) |

```bash
spindb create todos --engine postgresql
cp .env.example .env   # then set DATABASE_URL to its connection string

pnpm install
pnpm dev          # Next dev server with the API routes inline
pnpm build && pnpm start   # production mode
```

Note: route handlers and the page are marked `force-dynamic` - todos change
per request, and it keeps `next build` from trying to prerender against a
database that does not exist on the build machine.

## Make it yours

This folder is a complete repo: `pnpx tiged Layerbase-LLC/layerbase-app-starter/nextjs my-app`,
push it to your own GitHub repository, and the bundled
`.github/workflows/publish.yml` starts publishing your image to your GHCR
namespace on every push to `main`.
