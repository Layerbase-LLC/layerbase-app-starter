import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The frontend builds to dist-web/, which the server serves statically in
// production (one container, one port). In dev, Vite serves the frontend with
// HMR and proxies /api + /health to the tsx server (`pnpm dev`).
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist-web' },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/health': 'http://localhost:4000',
    },
  },
})
