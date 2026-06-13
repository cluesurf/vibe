// The suite runner. Imports every experiment for its registration side effect,
// then runs the whole registry through runSuite and prints one line per verdict.
// Exits nonzero if any experiment fails. This replaces the old monolithic
// assert driver: the tests now live next to the science they check, and the
// catalog is the registry.

import { allExperiments, runSuite } from '@/test/scaffold/suite'
import { runConformance } from '@/test/suite/conformance'
import '@/test/experiment/all'

// The conformance battery first: the library primitives the experiments stand on.
const conformance = runConformance()

const results = runSuite(allExperiments(), { seed: 1 })

let pass = conformance.passed
let fail = conformance.failed
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

const conformanceCount = conformance.passed + conformance.failed
console.log(
  `\n${pass} pass, ${fail} fail, ${partial} partial, ${open} open  (${results.length} experiments + ${conformanceCount} conformance)`,
)

if (fail > 0) {
  process.exit(1)
}
