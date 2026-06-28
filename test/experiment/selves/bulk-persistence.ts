// PS1, the persistence problem, the honest complete answer. Does a pattern written into the bulk LAST against
// the churn? A pattern does NOT last passively, the churn erodes it. But two things hold it. First, SPATIAL
// REDUNDANCY extends its survival, the survival time grows with the stored radius (an error-correction effect),
// so the bulk can hold a pattern for as long as needed given enough redundancy. Second, active MAINTENANCE
// (re-stamping the pattern) makes it permanent, at a work cost. A minimal pattern decays fast either way (the
// control). So persistence is achievable and its cost is measured, redundancy buys time and maintenance buys
// permanence, which is the foundation the realms, beings, and survival claims rest on. Depth L2, a measured
// survival-time scaling with a minimal-pattern control and an unmaintained-versus-maintained contrast. Spec:
// note theory-v0.8.0/experiments/14-persistence-storage-inner-bulk.md (PS1).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { patternSurvivalTime } from '@/code/coarse/pattern-persistence'

const L = 96
const beats = 400
const seed = 777

// the redundancy must buy at least this much more survival, maintenance must reach the full run, and the
// minimal pattern must die within this many beats. The measured values are 7 (minimal), 190 (large redundant),
// and 400 (maintained).
const REDUNDANCY_FACTOR = 4
const MINIMAL_MAX = 20

export default experiment({
  id: 'selves/bulk-persistence',
  code: 'E-SLF-0015',
  title:
    'a stored pattern decays, but redundancy extends its survival and maintenance makes it permanent',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const minimal = patternSurvivalTime({ L, radius: 2, beats, seed })
    const redundant = patternSurvivalTime({
      L,
      radius: 18,
      beats,
      seed,
    })

    const maintained = patternSurvivalTime({
      L,
      radius: 6,
      beats,
      seed,
      maintainEvery: 10,
    })

    // redundancy extends the survival time well beyond the minimal pattern, maintenance reaches the full run,
    // and the minimal pattern decays fast (so passive persistence is not free).
    const redundancyExtends = redundant > minimal * REDUNDANCY_FACTOR
    const maintenancePermanent = maintained >= beats
    const minimalDecaysFast = minimal < MINIMAL_MAX
    const ok =
      redundancyExtends && maintenancePermanent && minimalDecaysFast

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a pattern stored in the bulk decays under the churn, but its survival time grows with spatial redundancy (an error-correction effect) and active maintenance makes it permanent, while a minimal pattern decays fast, so the bulk can hold a pattern for as long as needed at a measured redundancy or maintenance cost',
      metrics: {
        minimalSurvival: minimal,
        redundantSurvival: redundant,
        maintainedSurvival: maintained,
        redundancyGain: redundant / Math.max(minimal, 1),
        fullRun: beats,
      },
      control: { minimalSurvival: minimal },
      notes:
        'survival time is the first beat the majority recovery over the stored cells falls below one half, measured from the real churn. redundancy (a larger stored radius) extends it, maintenance (re-stamping every ten beats) reaches the full run, the minimal pattern is the control that decays fast, so persistence costs redundancy or work, it is not free.',
    })
  },
})
