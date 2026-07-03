import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { migrate, pool } from './db.ts'

// ─── The Layerbase app contract, in one file ─────────────────────────
// 1. Listen on PORT, bound to HOST (the platform sets HOST=0.0.0.0 so its
//    proxy can reach the container; TLS and domains are handled outside).
// 2. Persist ONLY to DATABASE_URL (src/server/db.ts) and migrate on boot.
// 3. Answer GET /health - the platform's reconciler probes it and recreates
//    the container when it stops answering.
// 4. Exit cleanly on SIGTERM so redeploys drain instead of dropping requests.

const port = Number(process.env.PORT ?? 4000)
const host = process.env.HOST ?? '127.0.0.1'

const app = new Hono()

app.get('/health', async (c) => {
  await pool.query('SELECT 1')
  return c.json({ ok: true })
})

app.get('/api/todos', async (c) => {
  const { rows } = await pool.query(
    'SELECT id, title, done FROM todo ORDER BY id',
  )
  return c.json(rows)
})

app.post('/api/todos', async (c) => {
  const body = await c.req.json<{ title?: string }>()
  const title = body.title?.trim()
  if (!title) return c.json({ error: 'title is required' }, 400)
  const { rows } = await pool.query(
    'INSERT INTO todo (title) VALUES ($1) RETURNING id, title, done',
    [title],
  )
  return c.json(rows[0], 201)
})

app.patch('/api/todos/:id', async (c) => {
  const { rows } = await pool.query(
    'UPDATE todo SET done = NOT done WHERE id = $1 RETURNING id, title, done',
    [c.req.param('id')],
  )
  if (rows.length === 0) return c.json({ error: 'not found' }, 404)
  return c.json(rows[0])
})

app.delete('/api/todos/:id', async (c) => {
  await pool.query('DELETE FROM todo WHERE id = $1', [c.req.param('id')])
  return c.json({ ok: true })
})

// The built frontend (vite build -> dist-web) is served by this same process:
// one container, one port. In dev, run `pnpm dev:web` for Vite's dev server
// instead - it proxies /api here (vite.config.ts).
app.use('*', serveStatic({ root: './dist-web' }))
app.use('*', serveStatic({ root: './dist-web', path: 'index.html' }))

await migrate()
const server = serve({ fetch: app.fetch, port, hostname: host }, () => {
  console.log(`todo app listening on http://${host}:${port}`)
})

// Graceful shutdown: stop accepting connections, let in-flight requests
// finish, close the pool. Layerbase sends SIGTERM on redeploy/stop.
process.on('SIGTERM', () => {
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
})
