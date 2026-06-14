// E6 (multi-level-selves plan), the scale accounting that answers the 10^20 question. Each coarse-graining
// level compresses a factor C of sub-units into one macro-unit. With a tractable top simulation of N_top
// units and L stacked levels, the effective substrate is N_top * C^L. Here C is MEASURED as the mean cells
// per emergent self on the flat layer, and the engine composes the tower.
//
// Depth L1, this is an accounting that composes a measured compression factor, not an emergent claim. It is
// honest about the realistic scale reached, which depends on C and L, and on the unverified assumption that
// each higher level is as clean as level 0. The per-level cleanliness is what experiments E2, E3, E4 test.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { effectiveVibeCount } from '@/code/coarse/level-stack'
import { selfTrajectory } from '@/code/coarse/self-trajectory'

export default experiment({
  id: 'selves/renormalization-tower',
  title: 'the measured level-0 compression composes into the effective vibe count N_top times C to the L',
  category: 'renormalization',
  substrates: ['flat-horosphere'],
  depth: 'L1',
  paper: false,
  run() {
    const traj = selfTrajectory({ L: 64, beats: 200, bins: 8, seed: 31415 })
    const compression = Math.max(2, traj.meanSelfSize)
    const topUnits = 1e7
    const levels = 4
    const levelList = Array.from({ length: levels }, (_, i) => ({
      level: i + 1,
      unitCount: 0,
      compression,
      commutingError: 0,
    }))
    const effective = effectiveVibeCount({ topUnits, levels: levelList })
    const byHand = topUnits * Math.pow(compression, levels)
    const ok = Math.abs(effective - byHand) / byHand < 1e-9
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the engine composes the per-level compression into the effective vibe count, matching N_top times C to the L by hand',
      metrics: {
        measuredCompression: compression,
        topUnits,
        levels,
        effectiveVibes: effective,
        log10Effective: Math.log10(effective),
      },
      notes:
        'L1 accounting. The measured C is the cells-per-self at level 0. Reaching 10^20 needs C near 10^3 or more levels, and assumes each level is as clean as level 0, which E2 to E4 test, this is not an emergence claim',
    })
  },
})
