// P5: the Hauptvermutung (does geometry recover uniquely).
// Sprinkle the same Minkowski region with many seeds, recover the dimension each
// time, and report the spread. Low variance is empirical support.
// Run: npx tsx code/experiment/p5-hauptvermutung.ts

import { makeRng, deriveSeed } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The recovered dimension is stable across sprinklings, empirical support for the
// Hauptvermutung (geometry recovers from a causal set up to small spread). We sprinkle the
// same 3D Minkowski region with several seeds, recover the Myrheim-Meyer dimension each
// time, and report a mean near 3 with a small standard deviation. This is the standard
// causal-set construction, so L2. It relies on random sprinklings, so it is a statistical
// claim about an ensemble, not a property of the deterministic base rule, and we say so.
export default defineExperiment({
  id: 'geometry/hauptvermutung',
  title: 'the recovered dimension is stable (near 3, low spread) across random sprinklings',
  category: 'geometry',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = main()
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
