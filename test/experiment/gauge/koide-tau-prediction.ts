// Frontier 3, the sharp falsifiable number the Koide campaign earns: the derived relation
// Q = 2/3, taken as exact, PREDICTS the tau mass from the electron and muon alone, to about
// one part in ten thousand, where the Standard Model leaves the tau mass a free parameter.
//
// The campaign grounded Q = 2/3 in the 24-cell triality-sector geometry plus octonion
// chirality (E-FRC-0057 through 0062), for the charged leptons (E-FRC-0063 shows it is
// lepton-specific). Taking that Q = 2/3 as exact turns the relation predictive: given the two
// lighter lepton masses, it fixes the third.
//
// Solve Q = (m_e + m_mu + m_tau) / (sqrt m_e + sqrt m_mu + sqrt m_tau)^2 = 2/3 for m_tau. With
// x = sqrt(m_tau), A = m_e + m_mu, B = sqrt m_e + sqrt m_mu, this is a quadratic
//   x^2 - 4 B x + (3A - 2 B^2) = 0,   x = 2B + sqrt(6 B^2 - 3 A)  (the heavy root),
// giving m_tau = x^2. The prediction is 1776.97 MeV. The measured value is 1776.86 MeV, a
// relative deviation of about 6e-5. This is the historical Koide prediction (1982), made
// before the tau mass was precisely measured, and it has held as the measurement sharpened.
//
// Why this matters as a frontier-3 result: it is a sharp NUMBER the theory outputs where the
// SM has a free input, and it is falsifiable (a future tau-mass measurement moving by more
// than about a part in ten thousand, with fixed electron and muon masses, would break it). It
// is the leptonic Koide content made predictive, and via E-FRC-0062 that content is grounded
// in the geometry, so the tau mass is a geometrically-constrained number, not a free Yukawa.
//
// HONEST scope: the prediction uses the measured electron and muon masses as input (it fixes
// the THIRD lepton mass, not all three, and not the absolute scale), and it inherits the
// campaign's Tier-B assumptions (Boyle, the nearest-neighbour scale) for the Q = 2/3 it
// assumes. So it is a sharp intra-sector prediction, honestly one mass from two, not a
// from-nothing derivation of the spectrum. The phase delta = 2/9 (which the prediction does
// not need, since Q is phase-independent) still governs the individual e:mu:tau ratios and
// stays free.
//
// Grade L1: an exact prediction of m_tau from m_e, m_mu and Q = 2/3, matching the measured
// value to about 6e-5, with the light (unphysical) root as the control that the heavy root is
// the physical one.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const M_E = 0.51099895
const M_MU = 105.6583755
const M_TAU_MEASURED = 1776.86

// predict the heaviest mass from the two lighter ones using Q = 2/3
function predictHeaviest(
  m1: number,
  m2: number,
): { heavy: number; light: number } {
  const a = m1 + m2
  const b = Math.sqrt(m1) + Math.sqrt(m2)
  const disc = 6 * b * b - 3 * a
  const xHeavy = 2 * b + Math.sqrt(disc)
  const xLight = 2 * b - Math.sqrt(disc)

  return { heavy: xHeavy * xHeavy, light: xLight * xLight }
}

export default experiment({
  id: 'gauge/koide-tau-prediction',
  code: 'E-FRC-0064',
  title:
    'the derived Koide relation Q = 2/3 predicts the tau mass 1776.97 MeV from the electron and muon alone, matching the measured 1776.86 to about one part in ten thousand, a sharp falsifiable number where the Standard Model leaves the tau mass free',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const { heavy: mTauPredicted, light: mTauLight } = predictHeaviest(
      M_E,
      M_MU,
    )

    const relDeviation =
      Math.abs(mTauPredicted - M_TAU_MEASURED) / M_TAU_MEASURED

    // 1. the predicted tau mass matches the MEASURED value to about one part in ten
    //    thousand. This comparison to the measurement is the real test.
    const predictionSharp = relDeviation < 1e-3

    // 2. control: the light root is unphysical (a few MeV), so the heavy root is the tau.
    const lightRootUnphysical = mTauLight < 10

    const solved = predictionSharp && lightRootUnphysical

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'taking the geometrically grounded Koide relation Q = 2/3 as exact and solving for the tau mass from the electron and muon masses gives 1776.97 MeV, matching the measured 1776.86 MeV to a relative deviation of about six parts in a hundred thousand, a sharp falsifiable number the theory outputs where the Standard Model leaves the tau mass a free parameter, with the light quadratic root a few MeV being the unphysical branch, so the tau mass is a geometrically-constrained prediction not a free Yukawa',
      metrics: {
        mTauPredicted: Number(mTauPredicted.toFixed(3)),
        mTauMeasured: M_TAU_MEASURED,
        relativeDeviation: Number(relDeviation.toExponential(2)),
        lightRootMeV: Number(mTauLight.toFixed(3)),
      },
      control: {
        // the quadratic has two roots. The light one (a few MeV) is unphysical, so the heavy
        // root is unambiguously the tau. The prediction is not tuned: only m_e, m_mu and the
        // value 2/3 enter, and 2/3 is fixed by the geometry (E-FRC-0062), not fitted here.
        lightRootMeV: Number(mTauLight.toFixed(3)),
        mTauMeasured: M_TAU_MEASURED,
      },
      notes:
        'L1. Given m_e, m_mu and Q = 2/3, the tau mass is the heavy root of x^2 - 4Bx + (3A - 2B^2) = 0 (x = sqrt m_tau), predicting 1776.97 MeV against the measured 1776.86, deviation about 6e-5. This is the historical Koide prediction (1982), pre-dating the precise tau measurement. It uses the electron and muon masses as input, so it fixes the THIRD mass, not the absolute scale, and it assumes the Q = 2/3 the campaign grounds in the geometry (with the Tier-B Boyle and nearest-neighbour assumptions). The phase delta = 2/9 is not needed here because Q is phase-independent. This is the leptonic content made predictive: a sharp falsifiable number where the SM has a free parameter, and via E-FRC-0062 a geometrically-constrained one.',
    })
  },
})
