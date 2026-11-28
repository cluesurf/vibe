// Batch driver: the E-CMP-0043 particle census on chosen spaces and scales, so the 4D
// pair {3,4,3,3}/{3,4,3,4} reads seed radius 2 at scale 1.5 like every other geometry.
//
//   pnpm call task/batch/particle-census.ts [--scales 1,1.5] [--spaces 3.4.3.3,3.4.3.4]
//
// Spaces are written with dots ({3,4,3,4} is 3.4.3.4). Each census cell prints one JSON line, each scale its
// comparisons, and the closing SUMMARY line the per-scale species and collision totals.
import { particleCensus } from '@/test/experiment/computation/particle-census'
import { flags, listFlag, seconds, summary } from './args'

const f = flags()
const scales = listFlag(f, 'scales', ['1', '1.5']).map(Number)
const only = listFlag(f, 'spaces', ['3.4.3.3', '3.4.3.4']).map(s => `{${s.replaceAll('.', ',')}}`)
const start = performance.now()
const totals: object[] = []

console.log(`scales ${scales.join(',')}, spaces ${only.join(' ')}`)

for (const scale of scales) {
  const t0 = performance.now()
  const r = particleCensus({ scale, only })

  for (const c of r.cells) {
    console.log(
      JSON.stringify({
        scale,
        space: c.space,
        className: c.className,
        background: c.background,
        order: c.order,
        seedRadius: c.seedRadius,
        seeds: c.seeds,
        species: c.species.length,
        openSpecies: c.openSpecies.length,
        collisions: c.collisions.length,
        counts: c.counts,
      }),
    )
  }

  console.log(JSON.stringify({ scale, comparisons: r.comparisons }))

  for (const [space, order] of only.flatMap(s => (['forward', 'reverse'] as const).map(o => [s, o] as const))) {
    const cells = r.cells.filter(c => c.space === space && c.order === order)

    if (cells.length === 0) {
      continue
    }

    totals.push({
      scale,
      space,
      order,
      seedRadius: [...new Set(cells.map(c => c.seedRadius))],
      cells: cells.length,
      seeds: cells.reduce((n, c) => n + c.seeds, 0),
      species: cells.reduce((n, c) => n + c.species.length, 0),
      openSpecies: cells.reduce((n, c) => n + c.openSpecies.length, 0),
      collisions: cells.reduce((n, c) => n + c.collisions.length, 0),
      scatter: cells.reduce((n, c) => n + c.counts.scatter, 0),
      transparent: cells.reduce((n, c) => n + c.counts.transparent, 0),
      seconds: seconds(t0),
    })
  }
}

summary({ driver: 'particle-census', scales, spaces: only, seconds: seconds(start), totals })
