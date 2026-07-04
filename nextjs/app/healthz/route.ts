// Liveness: no auth, no database, instant 200. The container's own Docker
// HEALTHCHECK probes THIS (see the Dockerfile), so keep it dependency-free -
// a database blip must never make a serving container report unhealthy (the
// failure mode that took down Layerbase's own session-replay app). Readiness,
// which pings the DB, is the separate app/health/route.ts.
export function GET() {
  return Response.json({ ok: true })
}
