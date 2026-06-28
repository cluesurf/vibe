// The runner for the code/ math-conformance tree. Imports every suite from the
// barrel, runs each check, and prints one line per failure. Exits non-zero if any
// check fails, so it gates like the other suites.
//
//   pnpm call test/code/run.ts        run the whole math-conformance tree
//
// A failure here means a code/ math implementation is wrong, which would quietly
// corrupt every experiment that uses it. So this is the hardest gate in the repo.

import { allSuites } from '@/test/code/harness'
import '@/test/code/all'

function main(): void {
  let passed = 0
  let failed = 0
  const failures: string[] = []

  const suites = allSuites()

  for (const s of suites) {
    for (const c of s.checks) {
      try {
        c.run()
        passed += 1
      } catch (error) {
        failed += 1
        failures.push(`  FAIL  ${s.name} :: ${c.name}\n        ${(error as Error).message}`)
      }
    }
  }

  if (failures.length > 0) {
    console.log(failures.join('\n'))
  }

  console.log(`\nmath conformance: ${passed} pass, ${failed} fail across ${suites.length} suites`)

  if (failed > 0) {
    process.exit(1)
  }
}

main()
