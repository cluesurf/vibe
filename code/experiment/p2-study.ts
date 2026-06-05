// P2 study: can a causal-set action make manifold-like orders dominate?
// We compare the sharp Benincasa-Dowker action, the smeared BD action at several
// smearing scales, a random baseline, and a constructed dimension-target control,
// against a true 2D sprinkling as the reference. The discriminant is the height
// ratio (height / sqrt N): about 1 for a 2D manifold, near 0 for a layered
// Kleitman-Rothschild order. See note/questions/p2-dynamics-spec.md.
// Run: npx tsx code/experiment/p2-study.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import {
  benincasaDowkerAction,
  smearedBenincasaDowker,
  dimensionTargetAction,
  Action,
} from '~/dynamics/action'
import { sampleCausalSets } from '~/dynamics/mcmc'
import { orderStatistics } from '~/measure/order-stats'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'

const SIZE = 48
const STEPS = 3000

function runConfig(input: {
  label: string
  action: Action
  beta: number
  seed: number
}): { label: string; heightRatio: number; mmDimension: number; acceptance: number } {
  // Two chains with the same seed (so the same trajectory) let us read two
  // observables without threading them through one return value.
  const heightRun = sampleCausalSets({
    size: SIZE,
    action: input.action,
    beta: input.beta,
    steps: STEPS,
    rng: makeRng({ seed: input.seed }),
    observe: ({ poset }) => orderStatistics({ poset }).heightRatio,
  })
  const dimRun = sampleCausalSets({
    size: SIZE,
    action: input.action,
    beta: input.beta,
    steps: STEPS,
    rng: makeRng({ seed: input.seed }),
    observe: ({ poset }) => orderStatistics({ poset }).mmDimension,
  })
  return {
    label: input.label,
    heightRatio: heightRun.meanObservable,
    mmDimension: dimRun.meanObservable,
    acceptance: heightRun.acceptanceRate,
  }
}

export function main(): void {
  // Reference: a true 2D sprinkling of the same size.
  const refStats = orderStatistics({
    poset: sprinkleMinkowski({ dimension: 2, count: SIZE, rng: makeRng({ seed: 1 }) }),
  })

  const rows = [
    runConfig({
      label: 'random (beta=0)',
      action: benincasaDowkerAction({ epsilon: 1, dimension: 2 }),
      beta: 0,
      seed: 10,
    }),
    runConfig({
      label: 'sharp BD (beta=2)',
      action: benincasaDowkerAction({ epsilon: 1, dimension: 2 }),
      beta: 2,
      seed: 11,
    }),
    runConfig({
      label: 'smeared BD eps=0.2',
      action: smearedBenincasaDowker({ epsilon: 0.2, dimension: 2 }),
      beta: 2,
      seed: 12,
    }),
    runConfig({
      label: 'smeared BD eps=0.5',
      action: smearedBenincasaDowker({ epsilon: 0.5, dimension: 2 }),
      beta: 2,
      seed: 13,
    }),
    runConfig({
      label: 'smeared BD eps=0.9',
      action: smearedBenincasaDowker({ epsilon: 0.9, dimension: 2 }),
      beta: 2,
      seed: 14,
    }),
    runConfig({
      label: 'dimension-target d=2',
      action: dimensionTargetAction({ target: 2 }),
      beta: 6,
      seed: 15,
    }),
  ]

  console.log(`P2 study (N=${SIZE}, steps=${STEPS})`)
  console.log(
    `  reference 2D sprinkle: heightRatio ${refStats.heightRatio.toFixed(2)}, mmDim ${refStats.mmDimension.toFixed(2)}`,
  )
  console.log('  ensemble                heightRatio  mmDim  acceptance')
  for (const r of rows) {
    console.log(
      `  ${r.label.padEnd(22)} ${r.heightRatio.toFixed(2).padStart(10)}  ${r.mmDimension.toFixed(2).padStart(5)}  ${r.acceptance.toFixed(2).padStart(9)}`,
    )
  }
  console.log('')
  console.log('  manifold-like target: heightRatio near the reference, mmDim near 2.')
  console.log('  Kleitman-Rothschild (layered) orders have heightRatio near 0.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
