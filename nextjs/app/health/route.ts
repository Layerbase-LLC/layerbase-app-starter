import { getPool } from '@/lib/db'

// Readiness: the platform's reconciler probes GET /health and recreates the
// container - and revives the backing store - when it stops answering. The
// database ping makes "healthy" mean "actually able to serve", not just
// "process exists". Pure liveness for the container's own Docker HEALTHCHECK
// lives in app/healthz/route.ts (no DB, so a DB blip can't report unhealthy).
export const dynamic = 'force-dynamic'

export async function GET() {
  await getPool().query('SELECT 1')
  return Response.json({ ok: true })
}
