// Next's boot hook: runs once when the server starts - the right place for
// the contract's migrate-on-boot step (the platform recreates the container
// on every redeploy; the schema must converge before traffic arrives).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { migrate } = await import('./lib/db')
    await migrate()
  }
}
