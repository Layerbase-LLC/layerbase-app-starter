// Load .env for local dev (Node's built-in loader - no dependency). Imported
// FIRST by index.ts so it runs before db.ts reads process.env. In the
// container there is no .env file - the platform injects real env vars - so
// the missing-file error is expected and ignored.
try {
  process.loadEnvFile()
} catch {
  // no .env present (production container) - env comes from the platform
}
