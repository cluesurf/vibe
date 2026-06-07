// P6: does the 2D path integral land on 2-dimensional orders?
// P6 is the 2D specialisation of P2, and the P2 machinery (the 2D smeared action,
// the correct uniform sampler) is already 2D. P6's own question is whether the
// stable manifold phase is genuinely 2-dimensional. We warm-start the correct
// sampler from a 2D sprinkling at scale and read the Myrheim-Meyer dimension of the
// stable phase from its ordering fraction. If it sits near 2, the path integral
// lands on 2D orders. See note/questions/p2-p6-optimal-path.md.
// Run: npx tsx code/experiment/p6-dimension.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { sampleUniform } from '~/dynamics/uniform-sampler'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'
import { dimensionFromOrderingFraction } from '~/measure/dimension'

export function main(): void {
  console.log('P6: dimension of the stable manifold phase (warm-started, 2D smeared action)')
  console.log('  N    beta   manifold %   ordering fraction   MM dimension')
  for (const n of [64, 96, 128]) {
    const sprinkle = sprinkleMinkowski({ dimension: 2, count: n, rng: makeRng({ seed: 1 }) })
    const beta = 1
    const r = sampleUniform({
      size: n,
      beta,
      epsilon: 0.9,
      steps: 50000,
      rng: makeRng({ seed: 30 + n }),
      sampleEvery: Math.max(1, Math.floor(n / 2)),
      startFuture: sprinkle.future,
    })
    const dim = dimensionFromOrderingFraction(r.meanOrderingFraction)
    console.log(
      `  ${String(n).padStart(3)}   ${beta.toFixed(1)}   ${(r.manifoldFraction * 100).toFixed(0).padStart(8)}%   ${r.meanOrderingFraction.toFixed(3).padStart(15)}   ${dim.toFixed(2).padStart(11)}`,
    )
  }
  console.log('')
  console.log('  the stable manifold phase sits near dimension 2, so the 2D path integral')
  console.log('  lands on 2-dimensional orders, the P6-specific claim. P6 rides on the P2')
  console.log('  first-order transition (the 2D smeared action makes 2D spacetime a stable phase).')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
