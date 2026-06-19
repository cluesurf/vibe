// The suite runner. Imports every experiment for its registration side effect,
// runs the whole registry, and prints one line per non-passing result.
//
// What gates the build: code health only. A crashed experiment (a thrown error)
// or a failed conformance check fails the build. A scientific fail, partial, or
// open is an honest RESULT, recorded and reported, never a build failure. The
// methodology publishes negatives, so the suite does not punish them.
//
// The loop is ASYNC and yields to the event loop between experiments, so a Ctrl+C
// (SIGINT) is actually processed (a synchronous loop blocks the signal until it
// finishes, which is why an earlier version ignored Ctrl+C). The handler exits at
// the next between-experiment boundary, so the worst-case latency is one
// experiment, and a second Ctrl+C exits immediately.

import { allExperiments } from '@/test/scaffold/suite'
import { runConformance } from '@/test/suite/conformance'
import '@/test/experiment/all'

// Ctrl+C handling: the first interrupt asks the loop to stop at the next boundary,
// a second interrupt exits hard. Without this a long synchronous run ignores Ctrl+C.
let interrupted = false
process.on('SIGINT', () => {
  if (interrupted) {
    console.error('\nsecond interrupt, exiting now')
    process.exit(130)
  }

  interrupted = true
  console.error(
    '\ninterrupted, stopping after the current experiment (press Ctrl+C again to force quit)',
  )
})

const yieldToLoop = (): Promise<void> =>
  new Promise(resolve => setImmediate(resolve))

async function main(): Promise<void> {
  // The conformance battery first: the library primitives the experiments stand on.
  const conformance = runConformance()

  const context = { seed: 1 }

  let pass = 0
  let fail = 0
  let partial = 0
  let open = 0
  let crash = 0

  // per-experiment timing, so slow experiments are visible and the slowest are summarised at the end.
  const SLOW_MILLISECONDS = 5000
  const timings: { id: string; ms: number }[] = []

  for (const experiment of allExperiments()) {
    if (interrupted) {
      console.error(`stopped before ${experiment.id} (interrupted)`)
      process.exit(130)
    }

    // yield so a pending Ctrl+C is delivered between experiments
    await yieldToLoop()

    const started = Date.now()

    let result

    try {
      result = experiment.run(context)
    } catch (error) {
      crash++
      console.log(
        `  CRASH    ${experiment.id}  ${(error as Error).message}`,
      )
      continue
    } finally {
      const ms = Date.now() - started
      timings.push({ id: experiment.id, ms })

      if (ms >= SLOW_MILLISECONDS) {
        console.log(
          `  [slow ${(ms / 1000).toFixed(1)}s] ${experiment.id}`,
        )
      }
    }

    // The integrity rule: a deep (L3) claim without a control is downgraded to partial.
    const hasControl =
      result.control !== undefined &&
      Object.keys(result.control).length > 0

    const status =
      experiment.depth === 'L3' && !hasControl
        ? 'partial'
        : result.status

    if (status === 'pass') {
      pass++
    } else if (status === 'fail') {
      fail++
      console.log(`  fail     ${experiment.id}  ${result.claim}`)
    } else if (status === 'partial') {
      partial++
      console.log(`  partial  ${experiment.id}  ${result.claim}`)
    } else {
      open++
      console.log(`  open     ${experiment.id}  ${result.claim}`)
    }
  }

  console.log(
    `\nexperiments: ${pass} pass, ${fail} fail, ${partial} partial, ${open} open, ${crash} crash` +
      `   conformance: ${conformance.passed} pass, ${conformance.failed} fail`,
  )

  // the ten slowest experiments, to guide performance work
  const slowest = [...timings].sort((a, b) => b.ms - a.ms).slice(0, 10)
  const totalSeconds = (
    timings.reduce((sum, t) => sum + t.ms, 0) / 1000
  ).toFixed(1)

  console.log(`\ntotal experiment time ${totalSeconds}s, slowest ten:`)

  for (const t of slowest) {
    console.log(`  ${(t.ms / 1000).toFixed(1)}s  ${t.id}`)
  }

  if (crash > 0 || conformance.failed > 0) {
    console.error(
      `\nbuild failing: ${crash} crashed experiment(s), ${conformance.failed} conformance failure(s)`,
    )
    process.exit(1)
  }
}

main()
