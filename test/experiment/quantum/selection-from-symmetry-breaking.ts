// The frontier 1 and 6 obstruction, reframed with its resolution DIRECTION: how a symmetric
// deterministic law yields a definite single outcome (measurement selection), which is the same
// question as how the three symmetric generation slots get distinguished. E-QTM-0043 showed the
// finite reversible rule does NOT select, and named the obstruction (no conserved order parameter,
// spontaneous symmetry breaking forbidden at finite size). This adds the missing half: selection
// IS possible, by spontaneous symmetry breaking below a critical point, and that is exactly what
// the finite-size no-selection of E-QTM-0043 was missing, the SYMMETRIC phase.
//
// The mechanism, demonstrated deterministically on the Curie-Weiss self-consistency (the mean-field
// order parameter m = tanh(beta J m + beta h), solved by iteration, no random):
//   - ABOVE the critical point (beta J < 1): the only solution at zero bias is m = 0, so an
//     infinitesimal bias selects nothing. This is the symmetric phase, and it is the phase the
//     small finite reversible system of E-QTM-0043 sits in, which is why it did not select.
//   - BELOW the critical point (beta J > 1): there are two spontaneous solutions, plus and minus
//     m_s, and an infinitesimal bias picks a DEFINITE one: m(h -> 0+) = +m_s, m(h -> 0-) = -m_s.
//     A vanishing environment bias selects a definite branch. That is the single outcome.
//   - the SUSCEPTIBILITY dm/dh diverges as the critical point is approached (chi = beta/(1 - beta J)
//     grows without bound as beta J -> 1), the signature that an ever-smaller bias suffices.
//
// So the resolution of frontier 1 (why one measurement outcome) and frontier 6 (why the three
// generations are distinguished) is the same standard physics: spontaneous symmetry breaking in the
// broken phase, where an infinitesimal bias from the environment selects a definite branch, and the
// deterministic microscopic law is preserved (the symmetry is broken by the state, not the law).
// And the model HAS such a transition: E-GRV-0035 measured a susceptibility peak and an order
// parameter, so the broken phase exists on the substrate.
//
// HONEST scope: this demonstrates the resolution MECHANISM and shows the model has the required
// transition. It does NOT yet show the SPECIFIC committed-rule measurement pointer, or the specific
// generation order parameter, sits in the broken phase and inherits this selection, which is the
// remaining step (the tie between E-GRV-0035's transition and the E-QTM-0043 pointer). So the
// obstruction is reframed, not fully closed: selection is possible in principle and the ingredients
// are present, the specific realisation on the pointer is open. This is the honest resolution
// DIRECTION, the analogue of locating a mechanism before realising it.
//
// Grade L1: the spontaneous-symmetry-breaking selection mechanism demonstrated deterministically
// (definite branch below the critical point, diverging susceptibility), with the symmetric phase
// above the critical point as the control that reproduces E-QTM-0043's no-selection. It is pure
// Curie-Weiss mean-field mathematics with no substrate involvement, known physics run as a
// mechanism demonstration, so it grades L1.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// mean-field order parameter m = tanh(beta J m + beta h), solved by deterministic iteration.
// The iteration always STARTS at m = 0 (the symmetric point), so only the bias h can break
// the tie. A start on one side would itself select the branch and mask what the bias does.
function orderParameter(betaJ: number, betaH: number): number {
  let m = 0

  for (let i = 0; i < 5000; i++) {
    m = Math.tanh(betaJ * m + betaH)
  }

  return m
}

// susceptibility chi = dm/dh at zero bias, from the self-consistent solution
function susceptibility(betaJ: number): number {
  const eps = 1e-5
  const mPlus = orderParameter(betaJ, eps)
  const mMinus = orderParameter(betaJ, -eps)

  return (mPlus - mMinus) / (2 * eps)
}

export default experiment({
  id: 'quantum/selection-from-symmetry-breaking',
  code: 'E-QTM-0044',
  title:
    'the measurement-selection obstruction (shared with the three-generation distinction) is resolved in principle by spontaneous symmetry breaking: below a critical point an infinitesimal bias selects a definite branch and the susceptibility diverges, while above it (the symmetric phase E-QTM-0043 tested) nothing is selected, and the model has such a transition (E-GRV-0035)',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    // susceptibility grows toward divergence as the critical point (beta J = 1) is approached
    const chiSequence = [0.5, 0.8, 0.9, 0.95, 0.99].map(susceptibility)
    const chiGrows =
      chiSequence.every((c, i) => i === 0 || c > chiSequence[i - 1]!) &&
      chiSequence[chiSequence.length - 1]! > 50

    // ABOVE the critical point: no selection (the symmetric phase, E-QTM-0043's regime).
    // Every iteration starts at m = 0, so the infinitesimal bias is the only tie-breaker.
    const mAbovePlus = orderParameter(0.8, 1e-8)
    const mAboveMinus = orderParameter(0.8, -1e-8)
    const noSelectionAbove =
      Math.abs(mAbovePlus) < 1e-3 && Math.abs(mAboveMinus) < 1e-3

    // BELOW the critical point: from the symmetric start m = 0, an infinitesimal bias
    // alone selects a definite branch
    const mBelowPlus = orderParameter(1.5, 1e-8)
    const mBelowMinus = orderParameter(1.5, -1e-8)
    const definiteSelectionBelow =
      mBelowPlus > 0.5 && mBelowMinus < -0.5

    // 1. the susceptibility diverges toward the critical point.
    const susceptibilityDiverges = chiGrows

    // 2. above the critical point there is no selection (matches E-QTM-0043).
    const symmetricPhaseNoSelection = noSelectionAbove

    // 3. below the critical point an infinitesimal bias picks a definite branch.
    const brokenPhaseSelects = definiteSelectionBelow

    const solved =
      susceptibilityDiverges &&
      symmetricPhaseNoSelection &&
      brokenPhaseSelects

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'spontaneous symmetry breaking resolves the measurement-selection obstruction (and the identical three-generation distinction): starting the iteration at the symmetric point m = 0 so only the bias can break the tie, above the critical point an infinitesimal bias selects nothing (m stays near zero, the phase the finite reversible system of E-QTM-0043 sits in), while below the critical point the same infinitesimal bias of 1e-8 selects a definite branch (m goes to plus 0.8586 for a positive bias and minus 0.8586 for a negative one) and the susceptibility diverges as the critical point is approached, so a definite single outcome arises from a symmetric deterministic law by breaking the symmetry in the STATE not the law, and the substrate has such a transition (E-GRV-0035), leaving only the tie between that transition and the specific pointer open',
      metrics: {
        chiAt0p5: Number(chiSequence[0]!.toFixed(2)),
        chiAt0p9: Number(chiSequence[2]!.toFixed(2)),
        chiAt0p99: Number(chiSequence[4]!.toFixed(2)),
        mAboveTcAtZeroBias: Number(mAbovePlus.toFixed(4)),
        mBelowTcPositiveBias: Number(mBelowPlus.toFixed(4)),
        mBelowTcNegativeBias: Number(mBelowMinus.toFixed(4)),
      },
      control: {
        // above the critical point (symmetric phase) an infinitesimal bias selects nothing,
        // m -> 0, exactly reproducing E-QTM-0043's finite-size no-selection. So the selection
        // below the critical point is a genuine phase effect, not an artefact: the same
        // infinitesimal bias does nothing above Tc and picks a definite branch below it.
        mAboveTcAtZeroBias: Number(mAbovePlus.toFixed(4)),
        mBelowTcPositiveBias: Number(mBelowPlus.toFixed(4)),
      },
      notes:
        'L1. Deterministic (Curie-Weiss self-consistency solved by iteration, no random). Every iteration starts at the symmetric point m = 0, so the infinitesimal bias is the only tie-breaker (a start on one side would itself select the branch). The susceptibility chi = beta/(1 - beta J) diverges as beta J -> 1 (measured 2, 5, 10, 20, 100). Above Tc a bias of 1e-8 gives m -> 0 (no selection, the symmetric phase, reproducing E-QTM-0043). Below Tc the same bias gives m -> +/- 0.8586, a definite branch. So spontaneous symmetry breaking is the selection mechanism, resolving frontier 1 (single measurement outcome) and frontier 6 (three-generation distinction) together, since E-QTM-0043 established they are the same obstruction. The substrate has the required transition (E-GRV-0035, susceptibility peak and order parameter). This is the same mechanism as the Curie-Weiss measurement model of Allahverdyan, Balian, and Nieuwenhuizen (Understanding quantum measurement from the solution of dynamical models, Phys. Rep. 525 (2013) 1-166), where the apparatus is a Curie-Weiss magnet whose broken phase registers the outcome. Graded L1 because it is pure Curie-Weiss mean-field mathematics with no substrate involvement, known physics run as a mechanism demonstration. Honest scope: this shows the mechanism and that the ingredients are present, it does not yet show the specific committed-rule measurement pointer or generation order parameter sits in the broken phase, which is the remaining tie. The resolution direction, not the full realisation.',
    })
  },
})
