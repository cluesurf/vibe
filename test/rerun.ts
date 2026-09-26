// Rerun single experiments by code or id, and print everything the verdict holds.
//
//   pnpm rerun E-FRC-0092
//   pnpm rerun E-FRC-0093 E-FRC-0094 gauge/rule-coin-symmetry
//
// The full suite takes about half an hour. A reader checking one result should not have to
// run all of it, and should see the measured numbers, the control and the caveats, not only a
// pass line. This is the command every result page on the site quotes.
//
// It goes through `runSuite`, so the integrity rule applies here exactly as in the suite: an
// L3 claim without a control is printed as partial.

import { allExperiments, runSuite } from '@/test/scaffold/suite'
import '@/test/experiment/all'

const requested = process.argv.slice(2)

if (requested.length === 0) {
  console.error(
    'name at least one experiment, by code (E-FRC-0092) or id (gauge/gluon-count)',
  )
  process.exit(1)
}

const experiments = allExperiments()
const missing = requested.filter(
  name => !experiments.some(e => e.code === name || e.id === name),
)

if (missing.length > 0) {
  console.error(
    `no experiment with the code or id: ${missing.join(', ')}`,
  )
  process.exit(1)
}

const chosen = experiments.filter(
  e =>
    requested.includes(e.id) ||
    (e.code !== undefined && requested.includes(e.code)),
)

for (const experiment of chosen) {
  const started = Date.now()
  const [result] = runSuite([experiment], {})
  const seconds = ((Date.now() - started) / 1000).toFixed(1)
  const { verdict } = result!

  console.log(
    `\n${experiment.code ?? ''} ${experiment.id}  ${experiment.depth}  ${seconds}s`,
  )
  console.log(`status   ${verdict.status}`)
  console.log(`claim    ${verdict.claim}`)
  console.log('metrics')

  for (const [name, value] of Object.entries(verdict.metrics)) {
    console.log(`  ${name}  ${value}`)
  }

  console.log('control')

  for (const [name, value] of Object.entries(verdict.control ?? {})) {
    console.log(`  ${name}  ${value}`)
  }

  if (verdict.notes) {
    console.log(`notes    ${verdict.notes}`)
  }
}
