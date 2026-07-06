// The substrate computes at the quantum speed limit. Seth Lloyd's ultimate physical computer,
// and the Margolus-Levitin and Mandelstam-Tamm theorems, bound how fast any physical system can
// pass to a distinguishable state by its energy: the orthogonalization time obeys t >= pi h-bar
// / (2 E), with E the mean energy above the ground state (Margolus-Levitin) or the energy spread
// (Mandelstam-Tamm). This is the concrete form of the pancomputationalist claim (Lloyd, Zizzi),
// and the discrete-Noether energy several bridges rely on (Toffoli, Margolus, Baez).
//
// On the substrate's emergent Dirac quantum walk, a balanced two-mode superposition of energy
// eigenstates orthogonalizes at t = pi / dE (the dephasing time, E-QTM-0051). Its mean energy
// above the lower state is dE / 2, and its energy spread is also dE / 2. So the speed-limit bound
// is pi / (2 (dE / 2)) = pi / dE, exactly the measured orthogonalization time. The emergent
// quantum SATURATES both speed limits, it moves to a distinguishable state as fast as its energy
// allows and no faster, the balanced two-level state being the maximal-speed case.
//
// The bound is read two independent ways to keep it non-circular. The orthogonalization time is
// measured from the survival dynamics, while the energy spread is computed from the emergent
// dispersion energies, and the two agree to a fraction of a percent.
//
// The control is a single eigenmode: with no energy spread its speed-limit bound is infinite and
// it never orthogonalizes, so the speed is set by the energy spread and by nothing else.
//
// Depth L2. It reproduces the quantum speed limit on the substrate's emergent quantum, with the
// bound checked against the dispersion energies and a zero-spread control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { diracTwoModeSurvival } from '@/code/dynamics/quantum-walk'

const SIZE = 400
const MASS = 0.5
const BEATS = 2000
const PAIRS: [number, number][] = [
  [20, 40],
  [20, 60],
  [16, 80],
  [24, 56],
  [30, 50],
]

// the interpolated first minimum of a series (sub-beat precision)
function firstMinimumTime(series: number[]): number {
  for (let t = 1; t < series.length - 1; t++) {
    if (series[t]! <= series[t - 1]! && series[t]! <= series[t + 1]!) {
      const a = series[t - 1]!
      const b = series[t]!
      const c = series[t + 1]!
      const denominator = a - 2 * b + c

      return (
        t +
        (Math.abs(denominator) < 1e-12
          ? 0
          : (0.5 * (a - c)) / denominator)
      )
    }
  }

  return series.length
}

export default experiment({
  id: 'foundations/quantum-speed-limit-saturation',
  code: 'E-FND-0063',
  title:
    'the emergent quantum saturates the Margolus-Levitin and Mandelstam-Tamm speed limits, so the substrate computes at the quantum speed limit set by its energy',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    let maxSaturationDeviation = 0

    const perPair: Record<string, number> = {}

    for (const [indexA, indexB] of PAIRS) {
      const { survival, energyA, energyB } = diracTwoModeSurvival({
        indexA,
        indexB,
        size: SIZE,
        mass: MASS,
        beats: BEATS,
      })

      // orthogonalization time from the dynamics
      const orthogonalizationTime = firstMinimumTime(survival)

      // the energy spread and the mean energy above the ground of the balanced two-mode state,
      // both equal to half the gap, computed from the dispersion energies (independent of the time)
      const energyAboveGround = Math.abs(energyA - energyB) / 2
      const speedLimitBound = Math.PI / (2 * energyAboveGround)

      const saturation = orthogonalizationTime / speedLimitBound
      maxSaturationDeviation = Math.max(
        maxSaturationDeviation,
        Math.abs(saturation - 1),
      )
      perPair[`saturation_${indexA}_${indexB}`] = Number(
        saturation.toFixed(4),
      )
    }

    // control: a single eigenmode has no energy spread, an infinite bound, and never orthogonalizes
    const single = diracTwoModeSurvival({
      indexA: 30,
      indexB: 30,
      size: SIZE,
      mass: MASS,
      beats: BEATS,
    })

    const singleModeMinSurvival = Math.min(...single.survival)

    const saturates = maxSaturationDeviation < 0.01
    const controlNeverOrthogonalizes = singleModeMinSurvival > 0.9
    const ok = saturates && controlNeverOrthogonalizes

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the balanced two-mode superposition on the emergent Dirac walk orthogonalizes in exactly the Margolus-Levitin and Mandelstam-Tamm time pi h-bar / (2 E), with the orthogonalization time measured from the dynamics and the energy spread computed from the dispersion, saturating the quantum speed limit across a momentum sweep to under one percent, while a single eigenmode with no energy spread never orthogonalizes',
      metrics: {
        pairs: PAIRS.length,
        maxSaturationDeviation: Number(
          maxSaturationDeviation.toExponential(2),
        ),
        ...perPair,
      },
      // CONTROL: a single eigenmode (zero energy spread) never orthogonalizes.
      control: {
        singleModeMinSurvival: Number(singleModeMinSurvival.toFixed(4)),
      },
      notes:
        'The quantum speed limit (Lloyd, Margolus-Levitin, Mandelstam-Tamm, Zizzi, Toffoli). The substrate computes at the limit its energy allows. The count-based (tone-flip) definition of energy as the discrete-Noether charge is the intrinsic energy this bound reads, its identification with the dispersion energy the further step.',
    })
  },
})
