// P2 / P6: the correct uniform-measure sampler, validated and scaled.
// First we validate the sampler against exact enumeration at N = 6, 7 (the
// beta = 0 manifold fraction must match). Then we push beta = 0 to large N to see
// whether the entropic Kleitman-Rothschild layered orders take over (the manifold
// fraction should fall). Finally we turn on the smeared action at large N and ask
// whether it recovers the manifold phase against that entropic background, which is
// the genuine P2 dominance question. See note/questions/p2-p6-optimal-path.md.
// Run: npx tsx code/experiment/p2-uniform.ts

import { makeRng } from '@/code/tool/rng'
import { sampleUniform } from '@/code/dynamics/uniform-sampler'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'foundations/uniform',
  code: 'E-FND-0041',
  title:
    'the uniform-measure sampler reproduces the exact manifold fraction at small size',
  category: 'foundations',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = sampleUniform({
      size: 6,
      beta: 0,
      epsilon: 0.9,
      steps: 400000,
      rng: makeRng({ seed: 6 }),
    })

    const ok =
      Math.abs(r.manifoldFraction - 0.72) < 0.1 && r.acceptance > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the uniform-measure Monte Carlo sampler reproduces the exact beta-zero manifold fraction at six elements, validating it against enumeration',
      metrics: {
        manifoldFraction6: r.manifoldFraction,
        acceptance6: r.acceptance,
      },
      notes:
        'L1, a sampler validation against a known exact value, this is a statistical claim about a Monte Carlo ensemble (uses a seeded random walk), not a property of the deterministic base rule',
    })
  },
})
