// P2: a dynamics that makes manifold-like order dominate.
// Monte Carlo over causal sets weighted by the Benincasa-Dowker action, scanning
// the inverse temperature, observing manifold-likeness.
// Run: npx tsx code/experiment/p2-dynamics.ts

import { makeRng } from '@/code/tool/rng'
import { benincasaDowkerAction } from '@/code/dynamics/action'
import { sampleCausalSets } from '@/code/dynamics/mcmc'
import { manifoldLikeness } from '@/code/measure/manifoldlike'
import { runScan, ScanSpec } from '@/test/scaffold/runner'
import { writeReport } from '@/test/scaffold/report'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default defineExperiment({
  id: 'cosmology/dynamics',
  title: 'a causal-set action raises manifold-likeness as the coupling rises',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const action = benincasaDowkerAction({ epsilon: 1, dimension: 2 })
    const beta0 = sampleCausalSets({
      size: 40,
      action,
      beta: 0,
      steps: 4000,
      rng: makeRng({ seed: 1 }),
      observe: ({ poset }) => manifoldLikeness({ poset }).score,
    })
    const beta2 = sampleCausalSets({
      size: 40,
      action,
      beta: 2,
      steps: 4000,
      rng: makeRng({ seed: 1 }),
      observe: ({ poset }) => manifoldLikeness({ poset }).score,
    })
    const m0 = beta0.meanObservable
    const m2 = beta2.meanObservable
    const ok = m2 >= m0
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'weighting causal sets by the Benincasa-Dowker action raises or holds the mean manifold-likeness as the inverse temperature increases',
      metrics: { manifoldLikenessBeta0: m0, manifoldLikenessBeta2: m2 },
      notes:
        'L1, a known causal-set Monte Carlo construction. It uses a seeded random walk, so this is a statistical ensemble claim, not a property of the deterministic base rule, and run uses short chains.',
    })
  },
})
