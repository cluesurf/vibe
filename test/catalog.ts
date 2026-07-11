// Generate the experiment catalog from the registry, so the catalog file and the
// code are the same source of truth. Run with `npx tsx test/catalog.ts`. Writes
// test/catalog.csv, one row per registered experiment.
//
// The `depth` column grades what each experiment establishes (sorted strongest first):
//   L3 = emergent and novel (one rule, a measured consequence, with a control). The target.
//   L2 = known physics reproduced on the substrate.
//   L1 = known math correctly confirmed.
//   L0 = circular, the answer put in by hand, kept only as an honest consistency note.
// The full rubric is in note/experimental-methodology.md and the package readme.

import { writeFileSync } from 'node:fs'
import { allExperiments } from '@/test/scaffold/suite'
import '@/test/experiment/all'

const header = 'code,test,category,depth,paper,substrates,title'

// Sort by the experiment code in the first column (E-<arena>-<number>), so the catalog groups by arena
// then by number. Codeless experiments sort last, falling back to id for a stable order.
const substratesOf = (experiment: {
  substrates: 'any' | string[]
}): string =>
  experiment.substrates === 'any'
    ? 'any'
    : experiment.substrates.join('|')

const codeOf = (experiment: { code?: string }): string =>
  experiment.code ?? ''

const rows = allExperiments()
  .slice()
  .sort((left, right) => {
    const leftCode = codeOf(left)
    const rightCode = codeOf(right)

    // Codeless experiments sort after coded ones.
    if (leftCode === '' || rightCode === '') {
      if (leftCode !== rightCode) {
        return leftCode === '' ? 1 : -1
      }
    } else {
      const byCode = leftCode.localeCompare(rightCode)

      if (byCode !== 0) {
        return byCode
      }
    }

    return left.id.localeCompare(right.id)
  })
  .map(experiment => {
    const substrates = substratesOf(experiment)
    const title = experiment.title.replace(/"/g, '""')
    const code = experiment.code ?? ''

    return `${code},${experiment.id},${experiment.category},${experiment.depth},${experiment.paper},${substrates},"${title}"`
  })

const csv = [header, ...rows].join('\n') + '\n'

writeFileSync('test/catalog.csv', csv)
console.log(`wrote ${rows.length} experiments to test/catalog.csv`)
