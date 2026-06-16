import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// The '@' alias points at the vibe package root (two levels up from test/site), so the engine's own
// '@/code/...' imports resolve when the app bundles it. The whole hyperbolic renderer is pulled straight from
// code/render, the app only instantiates it.
const vibeRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    alias: { '@': vibeRoot },
  },
  server: { port: 5180 },
})
