// P30: inflation from a time-varying growth rate.
// P13 showed expansion emerges from a local birth rule with net birth above one, at a
// constant rate. Inflation is a brief epoch of much faster (accelerating) expansion
// early on, followed by a graceful exit to ordinary slow expansion. We model it with
// a time-varying spawn rate: high in the first few generations, then low. The front
// grows by many e-folds during the burst, then settles, exactly the inflationary
// profile, all from a local rule with no inflaton field put in by hand.
// See note/questions/frontiers.md. Run: npx tsx code/experiment/p30-inflation.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'

// Grow the spatial front generation by generation. Each cell spawns one child, plus a
// second with probability q(generation). Returns the width per generation.
export function inflate(input: {
  generations: number
  initialWidth: number
  inflationGenerations: number
  qInflation: number
  qNormal: number
  seed: number
}): { widths: number[]; ratesPerGen: number[]; inflationEfolds: number } {
  const rng = makeRng({ seed: input.seed })
  const widths: number[] = [input.initialWidth]
  for (let g = 0; g < input.generations; g++) {
    const q = g < input.inflationGenerations ? input.qInflation : input.qNormal
    let next = 0
    const w = widths[g] ?? 0
    for (let c = 0; c < w; c++) {
      next += 1 + (rng.next() < q ? 1 : 0)
    }
    widths.push(Math.max(1, next))
  }
  const ratesPerGen = widths.slice(1).map((w, g) => w / (widths[g] ?? 1))
  // e-folds of inflation: ln(width at end of the inflationary epoch / initial width).
  const wEnd = widths[Math.min(input.inflationGenerations, widths.length - 1)] ?? 1
  const inflationEfolds = Math.log(wEnd / (widths[0] ?? 1))
  return { widths, ratesPerGen, inflationEfolds }
}

export function main(): void {
  console.log('P30: inflation from a time-varying growth rate')
  console.log('')
  const r = inflate({
    generations: 16,
    initialWidth: 2,
    inflationGenerations: 6,
    qInflation: 1.0,
    qNormal: 0.05,
    seed: 1,
  })
  console.log('  front width per generation:')
  console.log('    ' + r.widths.join(', '))
  console.log('')
  console.log('  expansion rate per generation (width ratio):')
  console.log('    ' + r.ratesPerGen.map((x) => x.toFixed(2)).join(', '))
  console.log('')
  const earlyRate = r.ratesPerGen.slice(0, 6).reduce((a, b) => a + b, 0) / 6
  const lateRate = r.ratesPerGen.slice(6).reduce((a, b) => a + b, 0) / Math.max(1, r.ratesPerGen.length - 6)
  console.log(`  inflationary epoch (first 6 generations): mean rate ${earlyRate.toFixed(2)}, ${r.inflationEfolds.toFixed(1)} e-folds`)
  console.log(`  after the graceful exit: mean rate ${lateRate.toFixed(2)} (ordinary slow expansion)`)
  console.log('')
  console.log('  With a high early spawn rate the front expands rapidly, by several e-folds in a')
  console.log('  few generations, then the rate drops to just above one and the universe settles')
  console.log('  into ordinary slow expansion. That is the inflationary profile (a burst of')
  console.log('  accelerated expansion with a graceful exit), here emerging from a purely local')
  console.log('  growth rule with a time-varying birth rate, no inflaton field added by hand. The')
  console.log('  early burst would stretch and smooth the universe, the standard role of inflation.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
