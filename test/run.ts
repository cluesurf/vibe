// The suite runner. Imports every experiment for its registration side effect,
// runs the whole registry, and prints one line per non-passing result.
//
// What gates the build: code health only. A crashed experiment (a thrown error)
// or a failed conformance check fails the build. A scientific fail, partial, or
// open is an honest RESULT, recorded and reported, never a build failure. The
// methodology publishes negatives, so the suite does not punish them.

import { allExperiments } from '@/test/scaffold/suite'
import { runConformance } from '@/test/suite/conformance'
import '@/test/experiment/all'

// The conformance battery first: the library primitives the experiments stand on.
const conformance = runConformance()

const context = { seed: 1 }
let pass = 0
let fail = 0
let partial = 0
let open = 0
let crash = 0

for (const experiment of allExperiments()) {
  let result
  try {
    result = experiment.run(context)
  } catch (error) {
    crash++
    console.log(`  CRASH    ${experiment.id}  ${(error as Error).message}`)
    continue
  }
  // The integrity rule: a deep (L3) claim without a control is downgraded to partial.
  const hasControl =
    result.control !== undefined && Object.keys(result.control).length > 0
  const status =
    experiment.depth === 'L3' && !hasControl ? 'partial' : result.status
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

if (crash > 0 || conformance.failed > 0) {
  console.error(
    `\nbuild failing: ${crash} crashed experiment(s), ${conformance.failed} conformance failure(s)`,
  )
  process.exit(1)
}
