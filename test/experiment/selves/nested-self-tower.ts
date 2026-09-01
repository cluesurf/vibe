// A6 (chunk 1) / MS3 (chunk 24) at L3, the SPATIAL self of selves. The earlier tower was temporal (coarsening
// in time). This is the spatial nesting, TWO levels of recursive coarse-graining of the measured self dynamics.
// The micro transition matrix is read off a real self trajectory, then coarse-grained to a meso model (a self),
// then the meso model is coarse-grained AGAIN to a macro model (a self of selves). At EACH level a STRUCTURED
// map (merging adjacent bins, respecting the dynamics) keeps more effective information than a RANDOM map of the
// same size. The structured advantage SURVIVES the second coarsening, so the cluster of meso-selves is itself a
// higher-order self, the causal structure climbing two levels, while the random tower averages it away. This is
// the recursion of life, a self of selves, with a control that fails at the higher level.

import { scaled } from '@/test/scaffold/scale'
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
import { selfTrajectory } from '@/code/coarse/self-trajectory'
import { hashRand } from '@/code/dynamics/conserving-sweep'

export default experiment({
  id: 'selves/nested-self-tower',
  code: 'E-SLF-0079',
  title:
    'a self of selves, the structured causal map keeps effective information across TWO recursive coarse-grainings, a random tower loses it',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L3',
  paper: true,
  scales: true,
  run(context) {
    const scale = context.scale ?? 1
    const fine = 36
    const traj = selfTrajectory({
      L: scaled(64, scale),
      beats: scaled(1200, scale),
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

    // STRUCTURED tower, fine 36 -> meso 12 -> macro 4, each level merging adjacent (dynamics-respecting) blocks
    const meso = coarseGrainTpm({
      tpm: micro,
      groups: Array.from({ length: fine }, (_, i) => Math.floor(i / 3)),
    })

    const eiMeso = effectiveInformation(meso)
    const macro = coarseGrainTpm({
      tpm: meso,
      groups: Array.from({ length: 12 }, (_, i) => Math.floor(i / 3)),
    })

    const eiMacro = effectiveInformation(macro)

    // RANDOM tower of the same sizes, the control (a loose aggregate, no respect for the dynamics)

    const shuffle = (n: number, m: number): number[] => {
      const g = Array.from({ length: n }, (_, i) => i % m)

      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(hashRand(i, 0, 3) * (i + 1))
        const t = g[i]!

        g[i] = g[j]!
        g[j] = t
      }

      return g
    }

    const mesoR = coarseGrainTpm({
      tpm: micro,
      groups: shuffle(fine, 12),
    })

    const eiMesoR = effectiveInformation(mesoR)
    const macroR = coarseGrainTpm({
      tpm: mesoR,
      groups: shuffle(12, 4),
    })

    const eiMacroR = effectiveInformation(macroR)

    const gapLevel1 = eiMeso - eiMesoR
    const gapLevel2 = eiMacro - eiMacroR
    const climbsLevel1 = gapLevel1 > 0.05 // the meso self beats the random meso
    const climbsLevel2 = gapLevel2 > 0.05 // the macro self of selves STILL beats the random macro, the tower climbs
    const macroRetainsSelf = eiMacro > 1.0 // the higher-order self carries real effective information
    const ok = climbsLevel1 && climbsLevel2 && macroRetainsSelf

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'recursively coarse-graining the measured self dynamics twice, a structured map that merges adjacent bins keeps more effective information than a random map at BOTH levels, so the structured advantage survives the second coarsening and the cluster of meso-selves is itself a higher-order self, a self of selves climbing two levels, while the random tower averages the causal structure away at the higher level',
      metrics: {
        fine,
        eiMicro: Number(eiMicro.toFixed(3)),
        eiMeso: Number(eiMeso.toFixed(3)),
        eiMacro: Number(eiMacro.toFixed(3)),
        gapLevel1: Number(gapLevel1.toFixed(3)),
        gapLevel2: Number(gapLevel2.toFixed(3)),
      },
      // CONTROL: the RANDOM tower (loose aggregate) keeps less effective information at each level, and the structured advantage at level 2 is the higher-order binding the random map lacks.
      control: {
        eiMesoRandom: Number(eiMesoR.toFixed(3)),
        eiMacroRandom: Number(eiMacroR.toFixed(3)),
      },
      notes:
        'AUDIT 2026-08-31: the initial condition here is a hashed or seeded pseudo-random fill (hashRand, makeRng or a sprinkling), which the methodology does not admit as a foundational initial condition. Read this as an ensemble-style claim whose robustness comes from the size sweep, not from varying seeds. Replacing the fill with a structured pattern is roadmap item 0013. ' +
        'A6 / MS3 spatial, the self of selves at L3, two recursive coarse-grainings with the structured-vs-random control at each level.',
    })
  },
})
