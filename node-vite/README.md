# Layerbase App Starter - Node + Vite

The todo app on the [Layerbase app contract](../README.md): a Hono server
serving its API and the built React frontend from one process.

Where each piece of the contract lives:

| Requirement | Where |
| --- | --- |
| `PORT` / `HOST` binding | `src/server/index.ts` |
| `DATABASE_URL` + idempotent boot migration | `src/server/db.ts` |
| `GET /health` | `src/server/index.ts` |
| `SIGTERM` draining | `src/server/index.ts` |
| Prebuilt image | `Dockerfile` (multi-stage; frontend built to `dist-web/`) |

```bash
spindb create todos --engine postgresql
echo 'DATABASE_URL=postgresql://...' > .env

pnpm install
pnpm dev       # API server (tsx watch)
pnpm dev:web   # Vite dev server with HMR, proxies /api to the server

pnpm build && pnpm start   # production mode: one process, one port
```
