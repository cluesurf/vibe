import type { Config } from '@react-router/dev/config'

// SPA mode: WebGPU is client-only, so there is no server rendering to do. `react-router dev` serves the app and
// `react-router build` prerenders the shell to a static index.
export default {
  appDirectory: '.',
  ssr: false,
} satisfies Config
