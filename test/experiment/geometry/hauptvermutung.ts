// P5: the Hauptvermutung (does geometry recover uniquely).
// Sprinkle the same Minkowski region with many seeds, recover the dimension each
// time, and report the spread. Low variance is empirical support.
// Run: npx tsx code/experiment/p5-hauptvermutung.ts

import { makeRng, deriveSeed } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import {
  mean as meanOf,
  standardDeviation,
} from '@/code/measure/statistics'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function study(): { mean: number; std: number; samples: number[] } {
  const targetDimension = 3
  const count = 700
  const trials = 8
  const dims: number[] = []
  for (let i = 0; i < trials; i++) {
    const rng = makeRng({ seed: deriveSeed({ base: 42, index: i }) })
    const poset = sprinkleMinkowski({
      dimension: targetDimension,
      count,
      rng,
    })
    dims.push(myrheimMeyerDimension({ poset }))
  }
  return {
    mean: meanOf(dims),
    std: standardDeviation(dims),
    samples: dims,
  }
}

export default experiment({
  id: 'geometry/hauptvermutung',
  title:
    'the recovered dimension is stable (near 3, low spread) across random sprinklings',
  category: 'geometry',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = study()
    const meanNear3 = Math.abs(r.mean - 3) < 0.5
    const lowSpread = r.std < 0.3
    const ok = meanNear3 && lowSpread
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Myrheim-Meyer dimension recovered from independent 3D sprinklings has mean near 3 with small standard deviation',
      metrics: {
        recoveredMean: r.mean,
        recoveredStandardDeviation: r.std,
        trials: r.samples.length,
      },
      notes:
        'L2, the causal-set dimension recovery across sprinklings. This relies on random sprinklings, so it is a statistical claim about an ensemble, not a property of the deterministic base rule. Low spread is empirical support, not a proof.',
    })
  },
})
