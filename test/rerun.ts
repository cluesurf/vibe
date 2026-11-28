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
//
// Exit status, so a proof of the form "rerun.ts E-CMP-xxxx" fails on its own:
//   0  every chosen experiment passed
//   1  at least one read fail, or crashed (a gate threw)
//   2  none failed or crashed, but at least one read partial or open

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

const failed: string[] = []
const unfinished: string[] = []

for (const experiment of chosen) {
  const started = Date.now()
  const name = experiment.code ?? experiment.id

  let result: ReturnType<typeof runSuite>[number] | undefined

  try {
    result = runSuite([experiment], {})[0]
  } catch (error) {
    const seconds = ((Date.now() - started) / 1000).toFixed(1)

    console.log(
      `\n${experiment.code ?? ''} ${experiment.id}  ${experiment.depth}  ${seconds}s`,
    )
    console.log(`status   crash`)
    console.log(`error    ${(error as Error).message}`)
    failed.push(`${name} crash`)
    continue
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1)
  const { verdict } = result!

  if (verdict.status === 'fail') {
    failed.push(`${name} fail`)
  } else if (verdict.status !== 'pass') {
    unfinished.push(`${name} ${verdict.status}`)
  }

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

if (failed.length > 0) {
  console.error(
    `\nrerun FAILED: ${[...failed, ...unfinished].join(', ')}`,
  )
  process.exit(1)
}

if (unfinished.length > 0) {
  console.error(`\nrerun not all pass: ${unfinished.join(', ')}`)
  process.exit(2)
}
