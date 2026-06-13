// P2 / P6: the correct uniform-measure sampler, validated and scaled.
// First we validate the sampler against exact enumeration at N = 6, 7 (the
// beta = 0 manifold fraction must match). Then we push beta = 0 to large N to see
// whether the entropic Kleitman-Rothschild layered orders take over (the manifold
// fraction should fall). Finally we turn on the smeared action at large N and ask
// whether it recovers the manifold phase against that entropic background, which is
// the genuine P2 dominance question. See note/questions/p2-p6-optimal-path.md.
// Run: npx tsx code/experiment/p2-uniform.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { sampleUniform } from '@/code/dynamics/uniform-sampler'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'

export function main(): void {
  // 1. Validation against exact enumeration (exact gave 72% at N=6, 84% at N=7).
  console.log('Validation vs exact enumeration (beta=0 manifold fraction)')
  for (const n of [6, 7]) {
    const r = sampleUniform({ size: n, beta: 0, epsilon: 0.9, steps: 400000, rng: makeRng({ seed: n }) })
    console.log(
      `  N=${n}: sampler ${(r.manifoldFraction * 100).toFixed(0)}%  (exact ${n === 6 ? '72' : '84'}%), acceptance ${(r.acceptance * 100).toFixed(0)}%`,
    )
  }

  // 2. beta=0 to large N: does the entropic (KR) regime take over?
  console.log('')
  console.log('Uniform measure (beta=0) versus N: onset of the entropic regime')
  console.log('  N     manifold fraction   mean height ratio')
  for (const n of [8, 16, 32, 64, 128, 256]) {
    const steps = Math.max(300000, 4000 * n)
    const r = sampleUniform({ size: n, beta: 0, epsilon: 0.9, steps, rng: makeRng({ seed: 100 + n }), sampleEvery: n })
    console.log(
      `  ${String(n).padStart(3)}   ${(r.manifoldFraction * 100).toFixed(0).padStart(15)}%   ${r.meanHeightRatio.toFixed(3).padStart(15)}`,
    )
  }

  // 3. The dominance test: at a large N where beta=0 is entropic, does the smeared
  // action recover the manifold phase?
  console.log('')
  console.log('Dominance test at N=128: smeared action versus the entropic background')
  console.log('  beta   manifold fraction   mean height ratio')
  for (const beta of [0, 0.5, 1, 2]) {
    const r = sampleUniform({ size: 128, beta, epsilon: 0.9, steps: 200000, rng: makeRng({ seed: 700 + Math.round(beta * 10) }), sampleEvery: 64 })
    console.log(
      `  ${beta.toFixed(1).padStart(4)}   ${(r.manifoldFraction * 100).toFixed(0).padStart(15)}%   ${r.meanHeightRatio.toFixed(3).padStart(15)}`,
    )
  }

  // 4. Coexistence discriminator: warm-start from a 2D sprinkling (manifold) and
  // see whether the smeared action HOLDS it. If a manifold start stays manifold
  // while a cold start stays layered at the same beta, that is coexistence, a
  // first-order transition. If the manifold start decays, the action does not
  // favor manifold at scale.
  console.log('')
  console.log('Coexistence test at N=128: warm-started from a 2D sprinkling')
  console.log('  beta   manifold fraction   mean height ratio  (warm start)')
  const sprinkle = sprinkleMinkowski({ dimension: 2, count: 128, rng: makeRng({ seed: 1 }) })
  for (const beta of [0, 1, 2, 4]) {
    const r = sampleUniform({
      size: 128,
      beta,
      epsilon: 0.9,
      steps: 200000,
      rng: makeRng({ seed: 800 + Math.round(beta * 10) }),
      sampleEvery: 64,
      startFuture: sprinkle.future,
    })
    console.log(
      `  ${beta.toFixed(1).padStart(4)}   ${(r.manifoldFraction * 100).toFixed(0).padStart(15)}%   ${r.meanHeightRatio.toFixed(3).padStart(15)}`,
    )
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
