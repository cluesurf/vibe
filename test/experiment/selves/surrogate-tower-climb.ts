// MS3 of the multiscale-self program, the tower climb with controlled error. A temporal renormalization
// tower, level L models the self at lag baseLag * 2^L (twice the time-coarseness each level up). The learned
// surrogate at every level keeps its forward accuracy clearly above a time-shuffled control and above chance,
// so the tower is climbable for several levels with bounded per-level error, the discrete realization of
// running the self at coarser and coarser scales without the error blowing up. Depth L2, a per-level
// forward-accuracy fidelity with a shuffled control at every level. Spec: note
// theory-v0.8.0/experiments/24-multiscale-self-simulation.md (MS3).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quantileLabels } from '@/code/coarse/transition-matrix'
import { selfUnitTrajectory } from '@/code/coarse/self-trajectory'
import { surrogateTower } from '@/code/coarse/surrogate-tower'

const bins = 6
const baseLag = 2
const levels = 6
const L = 64

// the learned surrogate must beat the shuffled control by at least this much at EVERY level (the per-level
// error stays controlled), and stay above chance by this much. The measured minimum gap is near 0.16.
const GAP_MIN = 0.1
const ABOVE_CHANCE_MIN = 0.03

export default experiment({
  id: 'selves/surrogate-tower-climb',
  code: 'E-SLF-0137',
  title:
    'a temporal surrogate tower climbs several levels with forward accuracy bounded above chance and the control',
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

    let minGap = Infinity
    let minAccuracy = Infinity

    for (const lvl of tower) {
      minGap = Math.min(minGap, lvl.accuracy - lvl.shuffledAccuracy)
      minAccuracy = Math.min(minAccuracy, lvl.accuracy)
    }

    const top = tower[tower.length - 1]!

    // every level beats its shuffled control by GAP_MIN and stays above chance, so all `levels` levels of the
    // tower carry real dynamics, not noise.
    const ok =
      minGap > GAP_MIN && minAccuracy - chance > ABOVE_CHANCE_MIN

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a temporal surrogate tower keeps its forward accuracy above the time-shuffled control and above chance at every one of six coarsening levels, so the self can be run at geometrically coarser time-scales with the per-level error staying bounded',
      metrics: {
        levels,
        chance,
        minGap,
        minAccuracy,
        baseAccuracy: tower[0]!.accuracy,
        topAccuracy: top.accuracy,
        topLag: top.lag,
        topShuffled: top.shuffledAccuracy,
      },
      control: { topShuffled: top.shuffledAccuracy, minGap },
      notes:
        'the gap is the learned surrogate accuracy minus the time-shuffled surrogate accuracy at each level, it staying positive across all levels is the controlled-error signal',
    })
  },
})
