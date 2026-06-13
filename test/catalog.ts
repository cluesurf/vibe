// Generate the experiment catalog from the registry, so the catalog file and the
// code are the same source of truth. Run with `npx tsx test/catalog.ts`. Writes
// test/catalog.csv, one row per registered experiment.

import { writeFileSync } from 'node:fs'
import { allExperiments } from '@/test/scaffold/suite'
import '@/test/experiment/all'

const header = 'id,category,depth,paper,substrates,title'

const rows = allExperiments()
  .slice()
  .sort((left, right) => left.id.localeCompare(right.id))
  .map((experiment) => {
    const substrates =
      experiment.substrates === 'any' ? 'any' : experiment.substrates.join('|')
    const title = experiment.title.replace(/"/g, '""')
    return `${experiment.id},${experiment.category},${experiment.depth},${experiment.paper},${substrates},"${title}"`
  })

const csv = [header, ...rows].join('\n') + '\n'
writeFileSync('test/catalog.csv', csv)
console.log(`wrote ${rows.length} experiments to test/catalog.csv`)
