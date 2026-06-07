// P2 fine sweep: map the manifold window of the smeared Benincasa-Dowker action.
// The coarse study showed the ensemble approaching the 2D reference as the
// smearing eps rises toward ~0.9, then collapsing to layered orders at the sharp
// limit (eps = 1). Here we sweep eps finely and repeat at two sizes to confirm
// the manifold window is real and not a small-N artifact.
// Run: npx tsx code/experiment/p2-epsilon.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { smearedBenincasaDowker, Action } from '~/dynamics/action'
import { sampleCausalSets } from '~/dynamics/mcmc'
import { orderStatistics } from '~/measure/order-stats'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'

function run(input: {
  action: Action
  size: number
  steps: number
  beta: number
  seed: number
}): { heightRatio: number; mmDimension: number } {
  const h = sampleCausalSets({
    size: input.size,
    action: input.action,
    beta: input.beta,
    steps: input.steps,
    rng: makeRng({ seed: input.seed }),
    observe: ({ poset }) => orderStatistics({ poset }).heightRatio,
  })
  const d = sampleCausalSets({
    size: input.size,
    action: input.action,
    beta: input.beta,
    steps: input.steps,
    rng: makeRng({ seed: input.seed }),
    observe: ({ poset }) => orderStatistics({ poset }).mmDimension,
  })
  return { heightRatio: h.meanObservable, mmDimension: d.meanObservable }
}

export function main(): void {
  const epsilons = [0.8, 0.85, 0.9, 0.95, 0.99]

  for (const size of [48, 72]) {
    const ref = orderStatistics({
      poset: sprinkleMinkowski({ dimension: 2, count: size, rng: makeRng({ seed: 1 }) }),
    })
    console.log(
      `N=${size}  reference 2D sprinkle: heightRatio ${ref.heightRatio.toFixed(2)}, mmDim ${ref.mmDimension.toFixed(2)}`,
    )
    console.log('  eps    heightRatio  mmDim')
    for (const eps of epsilons) {
      const r = run({
        action: smearedBenincasaDowker({ epsilon: eps, dimension: 2 }),
        size,
        steps: size <= 50 ? 3000 : 2200,
        beta: 2,
        seed: 200 + Math.round(eps * 100),
      })
      console.log(
        `  ${eps.toFixed(2)}  ${r.heightRatio.toFixed(2).padStart(10)}  ${r.mmDimension.toFixed(2).padStart(5)}`,
      )
    }
    console.log('')
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
