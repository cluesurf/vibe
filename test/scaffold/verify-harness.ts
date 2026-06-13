// Verifies the harness end to end: load a migrated test, run the suite, and check
// the verdict. Proves the test/experiment + scaffold + code/* pattern works.
// Run: npx tsx test/scaffold/verify-harness.ts

import lightCone from '@/test/experiment/relativity/light-cone'
import { runSuite } from '@/test/scaffold/suite'

const results = runSuite([lightCone], { seed: 1 })
for (const result of results) {
  console.log(
    `  ${result.verdict.status === 'pass' ? 'ok  ' : 'FAIL'} ${result.id}: ${result.verdict.claim} (final radius ${result.verdict.metrics.finalRadius})`,
  )
}
const allPassed = results.every((result) => result.verdict.status === 'pass')
console.log(allPassed ? 'OK' : 'FAILED')
if (!allPassed) process.exit(1)
