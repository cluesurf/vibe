// MS6 of the multiscale-self program, the speedup-versus-fidelity benchmark. On the temporal surrogate tower,
// the op-count to simulate a fixed span of base beats falls geometrically up the tower (each level covers
// twice the time per step), so the speedup over base resolution grows geometrically, while the forward
// accuracy (fidelity) stays above chance. The trade-off has a floor, an over-compressed surrogate (a lag
// beyond the climbable tower) collapses to chance, so the cost cannot be cut for free. Depth L2, a
// deterministic op-count benchmark with an over-compression control. Spec: note
// theory-v0.8.0/experiments/24-multiscale-self-simulation.md (MS6).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quantileLabels } from '@/code/coarse/transition-matrix'
import { selfUnitTrajectory } from '@/code/coarse/self-trajectory'
import {
  surrogateTower,
  towerAccuracyAtLag,
} from '@/code/coarse/surrogate-tower'

const bins = 6
const baseLag = 2
const levels = 6
const L = 64

// the top-to-base speedup must reach at least this fraction of the ideal geometric factor 2^(levels-1), the
// fidelity at the top must stay this far above chance, and the over-compressed control must fall this close to
// chance. The measured speedup ratio is near 31 against an ideal 32.
const GEOMETRIC_FRACTION = 0.75
const ABOVE_CHANCE_MIN = 0.03

export default experiment({
  id: 'selves/surrogate-speedup',
  code: 'E-SLF-0136',
  title:
    'the surrogate tower speedup grows geometrically at bounded fidelity, over-compression collapses it',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const chance = 1 / bins
    const traj = selfUnitTrajectory({ L, beats: 4000, seed: 56789 })
    const labels = quantileLabels({ series: traj.centroids, bins })
    const tower = surrogateTower({
      labels,
      bins,
      baseLag,
      levels,
      cellCount: L * L,
      span: 2000,
    })

    const base = tower[0]!
    const top = tower[tower.length - 1]!
    const speedupRatio = top.speedup / base.speedup
    const geometricTarget = 2 ** (levels - 1)

    // the over-compression control, a lag two doublings beyond the top of the tower, where the fidelity should
    // collapse toward chance (the cost cannot be cut without limit).
    const overCompressedLag = baseLag * 2 ** (levels + 1)
    const overCompressedAccuracy = towerAccuracyAtLag({
      labels,
      bins,
      lag: overCompressedLag,
    })

    const ok =
      speedupRatio > GEOMETRIC_FRACTION * geometricTarget &&
      top.accuracy - chance > ABOVE_CHANCE_MIN &&
      overCompressedAccuracy - chance < ABOVE_CHANCE_MIN

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'up the surrogate tower the speedup over base resolution grows geometrically (near a factor two per level) while the forward fidelity stays above chance, and an over-compressed surrogate beyond the tower collapses to chance, so the cost falls geometrically only down to a real fidelity floor',
      metrics: {
        levels,
        chance,
        speedupBase: base.speedup,
        speedupTop: top.speedup,
        speedupRatio,
        geometricTarget,
        fidelityBase: base.accuracy,
        fidelityTop: top.accuracy,
        overCompressedLag,
        overCompressedAccuracy,
      },
      control: { overCompressedAccuracy },
      notes:
        'the cost is a deterministic op-count, base resolution touches every cell each beat, a surrogate step costs bins squared, the over-compression control shows the fidelity floor that bounds the speedup',
    })
  },
})
