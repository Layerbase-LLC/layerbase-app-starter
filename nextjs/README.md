# Layerbase App Starter - Next.js

The todo app on the [Layerbase app contract](../README.md), Next.js edition
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
echo 'DATABASE_URL=postgresql://...' > .env

pnpm install
pnpm dev          # Next dev server with the API routes inline
pnpm build && pnpm start   # production mode
```

Note: route handlers and the page are marked `force-dynamic` - todos change
per request, and it keeps `next build` from trying to prerender against a
database that does not exist on the build machine.
