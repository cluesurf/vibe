// The joint mass factorization: the Kac band and the warp ladder together account for the
// charged-lepton hierarchy pattern, resolving the honest negative E-FRC-0067 recorded.
// That experiment found the lepton Yukawas do NOT sit at integer warp depths under a
// UNIFORM prefactor (depths 8.77, 5.10, 3.16, residuals up to 0.23). The joint formula
// y equals A times kappa times lambda to the minus d over two, with kappa a species
// prefactor REQUIRED TO LIE IN THE MEASURED KAC BAND (0.086 to 0.179 lattice units,
// spread two point zero seven, E-FND-0135), changes the verdict:
//
//   - INTEGER DEPTHS (9, 5, 3) FIT: the required prefactors are 1.402, 0.868, 0.798, a
//     spread of one point seven six, INSIDE the measured band.
//   - THE RELATIVE PATTERN IS UNIQUELY SELECTED: every single-step deviation from the
//     pattern (any one depth moved by one) pushes the required spread to between two
//     point six five and seven point five one, OUTSIDE the band. Only the uniform shifts
//     (8,4,2) and (10,6,4) also fit, with identical spread, and a uniform shift is
//     degenerate with the overall scale A, so only the relative pattern (four steps from
//     electron to muon, two from muon to tau) is physical, and it is forced.
//
// Honest scope: this is a CONSISTENCY and a UNIQUENESS-OF-PATTERN result, not a
// derivation. Which Kac species supplies which prefactor is unassigned, the origin of
// the depth pattern (4, 2) is unexplained, and the overall scale is set by hand. What it
// establishes: the two measured mechanisms (zitterbewegung inertia and warp
// localization) jointly have exactly the freedom the observed lepton hierarchy needs,
// no more, and the E-FRC-0067 negative was the shadow of the missing Kac factor.
// Depth L1 (arithmetic on measured constants), the excluded deviations the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const LAMBDA = 18.278
const V_HIGGS = 246000
const MASSES = [0.51099895, 105.6583755, 1776.86]
const KAC_MIN = 0.0864
const KAC_MAX = 0.179

export default experiment({
  id: 'foundations/joint-mass-factorization',
  code: 'E-FND-0136',
  title:
    'the Kac band and the warp ladder jointly account for the charged-lepton hierarchy pattern: with species prefactors required to lie in the measured Kac band, the integer depth assignment nine, five, three fits (required spread one point seven six against the band two point zero seven) and every single-step deviation is excluded (spreads two point six five to seven point five one), so the relative depth pattern of four then two steps is uniquely selected up to the scale-degenerate uniform shift, resolving the E-FRC-0067 negative as the shadow of the missing Kac factor, stated as consistency and uniqueness of pattern rather than derivation',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const band = KAC_MAX / KAC_MIN
    const yukawas = MASSES.map(m => (Math.SQRT2 * m) / V_HIGGS)
    const spreadOf = (depths: number[]): number => {
      const prefactors = yukawas.map(
        (y, i) => y * Math.pow(LAMBDA, depths[i]! / 2),
      )

      return Math.max(...prefactors) / Math.min(...prefactors)
    }

    const exactDepths = yukawas.map(
      y => (-2 * Math.log(y)) / Math.log(LAMBDA),
    )
    const residualsSmall = exactDepths.every(
      (d, i) => Math.abs(d - [9, 5, 3][i]!) < 0.25,
    )

    const patternSpread = spreadOf([9, 5, 3])
    const patternFits = patternSpread <= band

    const deviations = [
      [8, 5, 3],
      [10, 5, 3],
      [9, 4, 3],
      [9, 6, 3],
      [9, 5, 2],
      [9, 5, 4],
    ]
    let deviationsExcluded = 0

    for (const d of deviations) {
      if (spreadOf(d) > band) {
        deviationsExcluded++
      }
    }

    const shiftDegenerate =
      Math.abs(spreadOf([8, 4, 2]) - patternSpread) < 1e-9 &&
      Math.abs(spreadOf([10, 6, 4]) - patternSpread) < 1e-9

    const ok =
      residualsSmall &&
      patternFits &&
      deviationsExcluded === deviations.length &&
      shiftDegenerate

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the exact depths sit within a quarter step of the integer pattern, the pattern fits inside the measured Kac band, all six single-step deviations are excluded, and the uniform shifts are exactly scale-degenerate',
      metrics: {
        patternSpread: Number(patternSpread.toFixed(3)),
        kacBand: Number(band.toFixed(3)),
        deviationsExcluded,
        worstResidual: Number(
          Math.max(
            ...exactDepths.map((d, i) =>
              Math.abs(d - [9, 5, 3][i]!),
            ),
          ).toFixed(3),
        ),
      },
      // CONTROL: the six excluded deviations, the same arithmetic rejecting every
      // neighbouring pattern
      control: {
        deviationsTested: deviations.length,
      },
      notes:
        'the assignment of Kac species to lepton and the origin of the depth pattern four then two remain open, and the overall scale is set by hand, all stated. The measured inputs are the warp factor (E-GMT-0003, E-FRC-0052), the Kac band (E-FND-0135), and the PDG lepton masses. A future measurement narrowing the Kac band below one point seven six would falsify the joint account, which is the number to watch. STATUS UPDATE, same day: the side-twenty-one precision table narrowed the well-measured band to one point seven one, BELOW the line, with flip-count statistics near twenty percent, so the joint account is under direct tension but not yet killed, the masses are still moving with lattice size (convergence undemonstrated), and the third-size run decides. This gate uses the frozen side-seventeen inputs and remains a record of the original arithmetic.',
    })
  },
})
