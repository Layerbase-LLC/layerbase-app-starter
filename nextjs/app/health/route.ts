import { getPool } from '@/lib/db'

// The platform's reconciler probes GET /health and recreates the container
// when it stops answering. Include a database ping so "healthy" means
// "actually able to serve", not just "process exists".
export const dynamic = 'force-dynamic'

export async function GET() {
  await getPool().query('SELECT 1')
  return Response.json({ ok: true })
}
