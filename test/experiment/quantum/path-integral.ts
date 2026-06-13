// P6: a computable Lorentzian path integral (2D).
// Run the causal-set Monte Carlo in 2D and report the mean recovered dimension
// of the sampled orders, the tractable end of the sum over histories.
// Run: npx tsx code/experiment/p6-path-integral.ts

import { makeRng } from '@/code/tool/rng'
import { benincasaDowkerAction } from '@/code/dynamics/action'
import { sampleCausalSets } from '@/code/dynamics/mcmc'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default defineExperiment({
  id: 'quantum/path-integral',
  title: 'a 2D Lorentzian causal-set path integral recovers a mean dimension near two',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = main()
    // The estimator returns a finite small dimension, but at this size and step
    // count the thermalized ensemble does not settle cleanly on the 2D value, so
    // the honest report is a finite-dimensional recovery, not a sharp dimension = 2.
    const finiteDimension =
      Number.isFinite(r.meanDimension) &&
      r.meanDimension > 1 &&
      r.meanDimension < 5
    const acceptanceHealthy = r.acceptance > 0.05 && r.acceptance < 0.95
    const sharplyTwoDimensional = Math.abs(r.meanDimension - 2) < 0.6
    const ok = finiteDimension && acceptanceHealthy
    return verdict({
      status: ok ? (sharplyTwoDimensional ? 'pass' : 'partial') : 'fail',
      claim:
        'a Monte Carlo sum over causal sets weighted by the Benincasa-Dowker action recovers a finite small Myrheim-Meyer dimension, of order the 2D target, with a healthy acceptance rate',
      metrics: {
        meanDimension: r.meanDimension,
        acceptance: r.acceptance,
      },
      notes:
        'L2, the causal-set Lorentzian path integral reproduced, the tractable end of the sum over histories. The dimension is MEASURED from the sampled posets via the Myrheim-Meyer ordering-fraction estimator, not assumed. It uses a random Metropolis walk at a fixed seed, so the mean dimension is a Monte Carlo estimate over the ensemble, a statistical result, not a property of a deterministic rule. At this size (48 elements, 6000 steps) the estimate sits near 3, not a sharp 2, so the verdict is partial, the recovery is finite-dimensional but not cleanly 2D. No null control, so this is a confirmation of a known construction, not an emergent claim.',
    })
  },
})
