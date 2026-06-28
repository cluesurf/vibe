// Conformance for code/coarse/pattern-persistence: survival time of a redundantly-stored pattern under
// the churn. The clean derivable fact: a pattern re-stamped EVERY beat (maintainEvery 1) is restored to
// full strength after each erosion, so its majority recovery never drops below one half and it survives
// the entire run (survival time = beats). The unmaintained run is checked for reproducibility. The
// physics claim (redundancy extends survival) is an experiment, not a math identity.

import { suite, check, equal, ok } from '@/test/code/harness'
import { patternSurvivalTime } from '@/code/coarse/pattern-persistence'

suite('coarse/pattern-persistence: active maintenance', [
  // Re-stamping every beat restores the disk to all-plus before each majority check, so majority stays
  // 1 >= 0.5 and the loop runs to completion, returning `beats`.
  check('a fully maintained pattern survives the whole run', () => {
    const beats = 30
    const t = patternSurvivalTime({
      L: 30,
      radius: 4,
      beats,
      seed: 1,
      arrow: 0.2,
      maintainEvery: 1,
    })
    equal(t, beats, 'maintenance every beat survives the full run')
  }),
])

suite('coarse/pattern-persistence: reproducibility and bounds', [
  check('survival time is reproducible and within [0,beats]', () => {
    const opts = { L: 30, radius: 3, beats: 40, seed: 7, arrow: 0.1 }
    const a = patternSurvivalTime(opts)
    const b = patternSurvivalTime(opts)
    equal(a, b, 'same seed, same survival time')
    ok(a >= 0 && a <= 40, 'survival time is within the run length')
  }),
])
