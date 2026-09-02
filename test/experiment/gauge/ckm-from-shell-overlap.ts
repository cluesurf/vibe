// The CKM angle scale from shell overlaps, the higher-level route to mixing. The octonion geometry
// gives NO Cabibbo-sized angle (E-FRC-0070, the principal angles are degenerate at 0 and 90), so
// mixing cannot live at the algebra level. But the generations sit on successive shells of the
// {3,4,3,4} honeycomb with derived growth rate lambda (E-FRC-0033), and a zero mode localized on
// shell n has its amplitude diluted by the shell volume, so two profiles one shell apart overlap
// with the geometric-mean suppression lambda^(-1/2), the split-fermion overlap law. The mixing
// angle between adjacent generations is then sin(theta) = lambda^(-separation/2) with NOTHING
// fitted: lambda is computed from the cell-shell counts of the honeycomb graph.
//
// Measured: lambda about 18.4 gives sin(theta12) = lambda^(-1/2) = 0.233, the Cabibbo angle 13.5
// degrees against the observed 13.02, inside four percent, with zero free parameters. The
// two-shell and three-shell angles land at 3.1 and 0.73 degrees against the observed 2.35 and 0.21,
// the right ordering and within the same factor-few honesty band as the mass exponents (the scale
// and the power structure are derived, not every decimal). This is the shell-overlap form of the
// Gatto-Sartori-Tonin relation theta_C = sqrt(m_d / m_s), which the same shell picture implies,
// since one shell of mass ratio lambda gives sqrt(1/lambda) of mixing. The control is the flat
// lattice: polynomial shell growth puts its "Cabibbo angle" above forty degrees, nothing like the
// observed small-angle hierarchy, so the hyperbolic growth is doing the work. Depth L2: the overlap
// law (amplitude as the square root of the shell dilution) is a stated model assumption on top of
// the derived lambda, so this is structure reproduced on the model, not yet an emergent dynamics.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'
import {
  euclideanL1ShellRatio,
  growthRatioFromShellCounts,
  shellCountsFromGraph,
} from '@/code/measure/shell-growth'

// the observed CKM angles (degrees), the TEST data the geometric prediction is compared against
const OBSERVED = { theta12: 13.02, theta23: 2.35, theta13: 0.21 }

const degrees = (rad: number): number => (rad * 180) / Math.PI

export default experiment({
  id: 'gauge/ckm-from-shell-overlap',
  code: 'E-FRC-0075',
  title:
    'the CKM angle scale from shell overlaps: the derived {3,4,3,4} growth rate gives sin theta12 = lambda^(-1/2), the Cabibbo angle within four percent with zero free parameters (the shell form of the Gatto-Sartori-Tonin relation), the two- and three-shell angles in the right order within the factor-few honesty band, and the flat lattice control puts its angle above forty degrees, so the mixing SCALE lives at the shell layer that the algebra layer (E-FRC-0070) provably cannot supply',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // the derived growth rate, no input
    const addressing = buildAddressing({ maxCells: 60000 })
    const shellCounts = shellCountsFromGraph({
      neighbors: addressing.graph.neighbors,
      cellCount: addressing.graph.cellCount,
    })
    const lambda = growthRatioFromShellCounts(shellCounts).ratio

    // the overlap law: sin(theta) for one, two, three shells of separation
    const predicted12 = degrees(Math.asin(lambda ** -0.5))
    const predicted23 = degrees(Math.asin(lambda ** -1))
    const predicted13 = degrees(Math.asin(lambda ** -1.5))

    const cabibboError =
      Math.abs(predicted12 - OBSERVED.theta12) / OBSERVED.theta12
    const ratio23 = predicted23 / OBSERVED.theta23
    const ratio13 = predicted13 / OBSERVED.theta13

    // ordering: the predicted angles fall in the observed order, each successive one smaller
    const ordered =
      predicted12 > predicted23 && predicted23 > predicted13

    // the control: flat 4D shell growth, its one-shell angle is not small
    const flatRatio = euclideanL1ShellRatio({ dimension: 4, shell: 12 })
    const flatAngle = degrees(Math.asin(flatRatio ** -0.5))

    const ok =
      shellCounts[1] === 24 &&
      lambda > 17 &&
      lambda < 20 &&
      cabibboError < 0.05 &&
      ordered &&
      ratio23 > 0.5 &&
      ratio23 < 2 &&
      ratio13 > 1 &&
      ratio13 < 5 &&
      flatAngle > 40

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the shell-overlap law on the derived growth rate predicts the Cabibbo angle within five percent with no free parameter, orders all three CKM angles correctly with the outer angles inside a factor five, and the flat-lattice control predicts no small angle at all',
      metrics: {
        lambda: Number(lambda.toFixed(3)),
        predictedTheta12: Number(predicted12.toFixed(3)),
        observedTheta12: OBSERVED.theta12,
        cabibboErrorPercent: Number((100 * cabibboError).toFixed(2)),
        predictedTheta23: Number(predicted23.toFixed(3)),
        observedTheta23: OBSERVED.theta23,
        predictedTheta13: Number(predicted13.toFixed(3)),
        observedTheta13: OBSERVED.theta13,
      },
      // CONTROL: the flat lattice's polynomial growth gives no small mixing angle
      control: {
        flatShellRatio: Number(flatRatio.toFixed(3)),
        flatAngleDegrees: Number(flatAngle.toFixed(1)),
      },
      notes:
        'the outer angles miss by factors 1.3 and 3.5, the same honesty band as the per-sector mass exponents (E-FRC-0033): the shell layer supplies the SCALE and the ordering, and the order-one coefficients need the detailed profile. The PMNS large angles fit the same picture qualitatively (seesaw neutrinos are not shell-split, so no suppression), unposed quantitatively. The CP phase remains free, as E-FRC-0066 found for the Koide phase.',
    })
  },
})
