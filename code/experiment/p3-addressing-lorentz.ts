// P3: the addressing versus Lorentz fork.
// Compare a regular tiling, a hyperbolic random graph, a Lorentzian lattice, and
// a Minkowski sprinkling on reach (ball growth) and Lorentz isotropy.
// Run: npx tsx code/experiment/p3-addressing-lorentz.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { Substrate } from '~/tool/substrate'
import { tilingPQ } from '~/substrate/tiling-pq'
import { hyperbolicGraph } from '~/substrate/hyperbolic-graph'
import { lattice } from '~/substrate/lattice'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'
import { ballGrowth, growthIsExponential } from '~/measure/dimension'
import { lorentzIsotropy } from '~/measure/lorentz'

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

export function main(): void {
  const rng = makeRng({ seed: 3 })
  const rows = [
    evaluate({
      name: 'tiling {5,4}',
      substrate: tilingPQ({ p: 5, q: 4, generations: 9 }),
    }),
    evaluate({
      name: 'hyperbolic random',
      substrate: hyperbolicGraph({
        count: 1500,
        radius: 7,
        connectThreshold: 1.0,
        rng,
      }),
    }),
    evaluate({
      name: 'lattice (lorentzian)',
      substrate: lattice({ dimension: 3, extent: 9, signature: 'lorentzian' }),
    }),
    evaluate({
      name: 'sprinkle minkowski',
      substrate: sprinkleMinkowski({ dimension: 3, count: 1200, rng }),
    }),
  ]

  console.log('P3 addressing versus Lorentz')
  console.log('  substrate            size  expReach  anisotropy  preferredFrame')
  for (const r of rows) {
    console.log(
      `  ${r.name.padEnd(20)} ${String(r.size).padStart(4)}  ${String(r.exponentialReach).padStart(7)}  ${r.anisotropy.toFixed(3).padStart(9)}  ${String(r.preferredFrame).padStart(13)}`,
    )
  }
  console.log(
    '  reading: the lattice should single out a frame (high anisotropy),',
  )
  console.log(
    '  the sprinkling should not, and the hyperbolic cases should have reach.',
  )
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
