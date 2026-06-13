// The suite runner. Imports every experiment for its registration side effect,
// then runs the whole registry through runSuite and prints one line per verdict.
// Exits nonzero if any experiment fails. This replaces the old monolithic
// assert driver: the tests now live next to the science they check, and the
// catalog is the registry.

import { allExperiments, runSuite } from '@/test/scaffold/suite'
import '@/test/experiment/all'

const results = runSuite(allExperiments(), { seed: 1 })

let pass = 0
let fail = 0
let partial = 0
let open = 0

for (const { id, verdict } of results) {
  if (verdict.status === 'pass') {
    pass++
    console.log(`  ok       ${id}  ${verdict.claim}`)
  } else if (verdict.status === 'fail') {
    fail++
    console.log(`  FAIL     ${id}  ${verdict.claim}${verdict.notes ? `  (${verdict.notes})` : ''}`)
  } else if (verdict.status === 'partial') {
    partial++
    console.log(`  partial  ${id}  ${verdict.claim}${verdict.notes ? `  (${verdict.notes})` : ''}`)
  } else {
    open++
    console.log(`  open     ${id}  ${verdict.claim}`)
  }
}

console.log(
  `\n${pass} pass, ${fail} fail, ${partial} partial, ${open} open  (of ${results.length} experiments)`,
)

if (fail > 0) {
  process.exit(1)
}
