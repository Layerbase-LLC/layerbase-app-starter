/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output = a self-contained server.js the container runs with
  // plain node - no next CLI, no node_modules tree at runtime. The Layerbase
  // contract's PORT is read natively; HOSTNAME is pinned to 0.0.0.0 in the
  // Dockerfile so the platform proxy can reach the container.
  output: 'standalone',
}

export default nextConfig
