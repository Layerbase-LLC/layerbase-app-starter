# Layerbase App Starter - Node + Vite

The todo app on the [Layerbase app contract](https://github.com/Layerbase-LLC/layerbase-app-starter#the-contract): a Hono server
serving its API and the built React frontend from one process.

Where each piece of the contract lives:

| Requirement | Where |
| --- | --- |
| `PORT` / `HOST` binding | `src/server/index.ts` |
| `DATABASE_URL` + idempotent boot migration | `src/server/db.ts` |
| `GET /healthz` liveness (no DB) | `src/server/index.ts`, probed by the `Dockerfile` `HEALTHCHECK` |
| `GET /health` readiness (pings DB) | `src/server/index.ts`, probed by the platform |
| `SIGTERM` draining | `src/server/index.ts` |
| Prebuilt image | `Dockerfile` (multi-stage; frontend built to `dist-web/`) |

```bash
spindb create todos --engine postgresql
cp .env.example .env   # then set DATABASE_URL to its connection string

pnpm install
pnpm dev       # API server (tsx watch)
pnpm dev:web   # Vite dev server with HMR, proxies /api to the server

pnpm build && pnpm start   # production mode: one process, one port
```
