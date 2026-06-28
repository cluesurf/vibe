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

const header = 'code,id,category,depth,paper,substrates,title'

// Sort the most important results first: by depth (L3 the emergent-and-novel results first, down to
// L0 circular last), then by id, then by substrates.
const depthRank: Record<string, number> = { L3: 0, L2: 1, L1: 2, L0: 3 }
const substratesOf = (experiment: {
  substrates: 'any' | string[]
}): string =>
  experiment.substrates === 'any'
    ? 'any'
    : experiment.substrates.join('|')

const rows = allExperiments()
  .slice()
  .sort((left, right) => {
    const byDepth =
      (depthRank[left.depth] ?? 9) - (depthRank[right.depth] ?? 9)

    if (byDepth !== 0) {
      return byDepth
    }

    const byId = left.id.localeCompare(right.id)

    if (byId !== 0) {
      return byId
    }

    return substratesOf(left).localeCompare(substratesOf(right))
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
