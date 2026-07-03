import pg from 'pg'

// The ONLY stateful thing an app gets on Layerbase is its backing store,
// injected as DATABASE_URL. Everything the app persists lives there - the
// container itself is disposable (redeploys replace it wholesale).
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error(
    'DATABASE_URL is required. Locally: spindb create todos --engine postgresql, then copy its connection string into .env',
  )
  process.exit(1)
}

export const pool = new pg.Pool({ connectionString, max: 10 })

// Migrations run on boot and must be idempotent: Layerbase recreates the
// container on every redeploy and the reconciler may restart it, so boot has
// to converge from any prior schema state without help.
export async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todo (
      id         serial PRIMARY KEY,
      title      text NOT NULL,
      done       boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `)
}
