import pg from 'pg'

// Lazy singleton: `next build` imports route modules for analysis, and a
// module-scope pool (or a hard DATABASE_URL check) would break builds on
// machines with no database. The pool exists only once something queries.
let pool: pg.Pool | null = null

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is required. Locally: spindb create todos --engine postgresql, then copy its connection string into .env',
      )
    }
    pool = new pg.Pool({ connectionString, max: 10 })
    // A dropped idle connection (DB restart, failover, network blip) surfaces
    // as a pool 'error' event; with no listener, Node treats it as uncaught and
    // kills the process over a transient DB blip - taking /healthz down with it.
    // Log and swallow: the pool reconnects on the next query, liveness stays up.
    pool.on('error', (error) => {
      console.error('postgres pool error (idle client):', error.message)
    })
  }
  return pool
}

// Runs on server boot (instrumentation.ts). Idempotent on purpose: Layerbase
// recreates the container on every redeploy, so boot must converge from any
// prior schema state without help.
export async function migrate(): Promise<void> {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS todo (
      id         serial PRIMARY KEY,
      title      text NOT NULL,
      done       boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `)
}
