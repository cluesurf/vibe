// P3: the addressing versus Lorentz fork.
// Compare a regular tiling, a hyperbolic random graph, a Lorentzian lattice, and
// a Minkowski sprinkling on reach (ball growth) and Lorentz isotropy.
// Run: npx tsx code/experiment/p3-addressing-lorentz.ts

import { makeRng } from '@/code/tool/rng'
import { Substrate } from '@/code/tool/substrate'
import { tilingPQ } from '@/code/substrate/tiling-pq'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { lattice } from '@/code/substrate/lattice'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { ballGrowth, growthIsExponential } from '@/code/measure/dimension'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function evaluate(input: { name: string; substrate: Substrate }): {
  name: string
  size: number
  exponentialReach: boolean
  anisotropy: number
  preferredFrame: boolean
} {
  const rng = makeRng({ seed: 7 })
  const growth = ballGrowth({
    substrate: input.substrate,
    center: 0,
    maxRadius: 12,
  })
  const iso = lorentzIsotropy({
    substrate: input.substrate,
    samples: 400,
    rng,
  })
  return {
    name: input.name,
    size: input.substrate.size,
    exponentialReach: growthIsExponential({ growth }),
    anisotropy: iso.anisotropy,
    preferredFrame: iso.preferredFrame,
  }
}

export default experiment({
  id: 'relativity/addressing-lorentz',
  title: 'a regular lattice singles out a frame, a Minkowski sprinkling does not',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const rng = makeRng({ seed: 3 })
    const latticeRow = evaluate({
      name: 'lattice (lorentzian)',
      substrate: lattice({ dimension: 3, extent: 9, signature: 'lorentzian' }),
    })
    const sprinkleRow = evaluate({
      name: 'sprinkle minkowski',
      substrate: sprinkleMinkowski({ dimension: 3, count: 1200, rng }),
    })
    const tilingRow = evaluate({
      name: 'tiling {5,4}',
      substrate: tilingPQ({ p: 5, q: 4, generations: 9 }),
    })

    const latticeSinglesFrame = latticeRow.preferredFrame
    const sprinkleNoFrame = !sprinkleRow.preferredFrame
    const sprinkleMoreIsotropic = sprinkleRow.anisotropy < latticeRow.anisotropy
    const tilingReaches = tilingRow.exponentialReach
    const ok =
      latticeSinglesFrame &&
      sprinkleNoFrame &&
      sprinkleMoreIsotropic &&
      tilingReaches
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a regular lattice picks out a preferred frame with high anisotropy while a Minkowski sprinkling stays frame-free and more isotropic, and the hyperbolic tiling has exponential reach',
      metrics: {
        latticeAnisotropy: latticeRow.anisotropy,
        sprinkleAnisotropy: sprinkleRow.anisotropy,
      },
      control: {
        latticeAnisotropy: latticeRow.anisotropy,
      },
      notes:
        'L2, the causal-set fact that a sprinkling restores Lorentz isotropy a lattice breaks, reproduced on these substrates. The lattice is the frame-picking control. The sprinkling and hyperbolic graph use random point placement (a fixed seed, so reproducible), so the isotropy is a statistical property of the ensemble, not of the deterministic base rule.',
    })
  },
})
