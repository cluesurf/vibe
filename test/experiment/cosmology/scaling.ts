// B1 down-payment: finite-size scaling of the P2 first-order transition.
// The continuum dominance proof is open in mathematics, but we can strengthen the
// evidence: if the manifold/layered coexistence survives and sharpens as N grows,
// the transition is heading for the continuum, not a small-system artefact. We
// measure, at fixed coupling, the manifold fraction from a warm (sprinkling) start
// and a cold start at several sizes. A persistent, sharp gap that holds as N grows
// is the finite-size signature of a genuine first-order transition. See
// note/questions/remaining-frontier-spec.md (B1) and p2-uniform.md.
// Run: npx tsx code/experiment/p2-scaling.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { sampleUniform } from '@/code/dynamics/uniform-sampler'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'

export function main(): void {
  const beta = 2
  console.log('B1: finite-size scaling of the P2 transition (smeared action, beta=2)')
  console.log('  N     cold-start manifold %   warm-start manifold %   gap')
  let gapHolds = true
  for (const n of [48, 96, 160]) {
    const steps = 40000
    const cold = sampleUniform({
      size: n,
      beta,
      epsilon: 0.9,
      steps,
      rng: makeRng({ seed: 10 + n }),
      sampleEvery: Math.max(1, Math.floor(n / 2)),
    })
    const sprinkle = sprinkleMinkowski({ dimension: 2, count: n, rng: makeRng({ seed: 1 }) })
    const warm = sampleUniform({
      size: n,
      beta,
      epsilon: 0.9,
      steps,
      rng: makeRng({ seed: 20 + n }),
      sampleEvery: Math.max(1, Math.floor(n / 2)),
      startFuture: sprinkle.future,
    })
    const gap = warm.manifoldFraction - cold.manifoldFraction
    if (gap < 0.5) {
      gapHolds = false
    }
    console.log(
      `  ${String(n).padStart(3)}   ${(cold.manifoldFraction * 100).toFixed(0).padStart(18)}%   ${(warm.manifoldFraction * 100).toFixed(0).padStart(18)}%   ${(gap * 100).toFixed(0).padStart(4)}%`,
    )
  }
  console.log('')
  console.log(`  coexistence gap persists across sizes: ${gapHolds ? 'YES' : 'no'}`)
  console.log('  a wide, persistent gap as N grows is finite-size evidence that the')
  console.log('  first-order transition (and the manifold phase) survives toward the')
  console.log('  continuum, the strongest reachable evidence for B1.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
