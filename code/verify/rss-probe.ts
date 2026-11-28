// Tiny Node `--import` preload emitting a single structured telemetry line on exit.
// Uses process.memoryUsage().rss, process.memoryUsage().heapUsed, and performance.now()
// so it behaves identically on macOS and Linux with zero temp files.

const METRICS_PREFIX = '__VIBE_METRICS__='
const START_MS = performance.now()
let emitted = false

function emitVibeMetrics(): void {
  if (emitted) return
  emitted = true
  const mem = process.memoryUsage()
  const peakRssMb = Math.max(
    mem.rss / (1024 * 1024),
    process.resourceUsage().maxRSS / 1024,
  )
  const payload = {
    rssMb: Number(peakRssMb.toFixed(2)),
    heapMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(2)),
    ms: Number((performance.now() - START_MS).toFixed(2)),
  }
  process.stdout.write(`\n${METRICS_PREFIX}${JSON.stringify(payload)}\n`)
}

process.on('beforeExit', emitVibeMetrics)
process.on('exit', emitVibeMetrics)

export {}
