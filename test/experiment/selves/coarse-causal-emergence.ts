// E4 (multi-level-selves plan), causal emergence from a MEASURED transition matrix. The earlier funnel test
// hand-built a degenerate dynamics and so was circular (L0). Here the micro transition matrix is read off a
// real self trajectory, and we coarse-grain it two ways, a structured spatial map that merges adjacent
// position bins, and a random map of the same coarseness (the control). The effective information of the
// structured macro exceeds that of the random macro, because a structured grouping respects the dynamics and
// keeps the causal distinctions a random grouping averages away.
//
// Depth L2, the engine measures Hoel effective information on real dynamics with a control. We ALSO report
// whether the macro exceeds the micro (true causal emergence). For free self diffusion it does not, an
// honest negative recorded in the notes, since there is no degeneracy to remove. The structured-versus-random
// result is the positive measured claim.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  countMatrix,
  rowStochastic,
} from '@/code/coarse/transition-matrix'
import {
  effectiveInformation,
  coarseGrainTpm,
} from '@/code/coarse/causal-emergence'
import { selfTrajectory, makeRng } from '@/code/coarse/self-trajectory'

export default experiment({
  id: 'selves/coarse-causal-emergence',
  code: 'E-SLF-0023',
  title:
    'a structured coarse map keeps more effective information than a random one, measured on real self dynamics',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const fine = 16
    const macroCount = 4
    const traj = selfTrajectory({
      L: 64,
      beats: 800,
      bins: fine,
      seed: 24680,
    })

    const micro = rowStochastic(
      countMatrix({
        trajectory: traj.labels,
        stateCount: fine,
        lag: 1,
      }),
    )

    const eiMicro = effectiveInformation(micro)

    // structured map, merge each block of adjacent fine bins into one macro bin.
    const block = fine / macroCount
    const spatialGroups = Array.from({ length: fine }, (_, i) =>
      Math.floor(i / block),
    )

    const eiSpatial = effectiveInformation(
      coarseGrainTpm({ tpm: micro, groups: spatialGroups }),
    )

    // random map of the same coarseness, the control.
    const rng = makeRng(7777)
    const randomGroups = Array.from(
      { length: fine },
      (_, i) => i % macroCount,
    )

    for (let i = fine - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      const tmp = randomGroups[i]!

      randomGroups[i] = randomGroups[j]!
      randomGroups[j] = tmp
    }

    const eiRandom = effectiveInformation(
      coarseGrainTpm({ tpm: micro, groups: randomGroups }),
    )

    const ok = eiSpatial > eiRandom + 0.02

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a structured spatial coarse-graining of the measured self dynamics retains more effective information than a random coarse-graining of the same size',
      metrics: { eiMicro, eiSpatial, eiRandom, fine, macroCount },
      control: { eiRandom },
      notes:
        eiSpatial > eiMicro
          ? 'macro exceeds micro, a causal-emergence gain'
          : 'honest negative, macro does not exceed micro for free self diffusion (no degeneracy to remove), the structured-vs-random control is the positive result',
    })
  },
})
