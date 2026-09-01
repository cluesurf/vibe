// The Koide relation, a precise lepton-mass coincidence, and its geometric form.
//
// The three charged-lepton masses satisfy, to about one part in a hundred thousand,
//   Q = (m_e + m_mu + m_tau) / (sqrt(m_e) + sqrt(m_mu) + sqrt(m_tau))^2 = 2/3.
// This is Koide's relation. It is one of the sharpest unexplained numerical facts in
// particle physics, and it is exactly the kind of thing a geometric theory of the
// generations should have something to say about.
//
// Geometrically it is a statement about an ANGLE. Writing the square-root masses as a
// vector v = (sqrt m_e, sqrt m_mu, sqrt m_tau), the relation Q = 1/(3 cos^2 theta),
// where theta is the angle between v and the democratic axis (1,1,1). So Q = 2/3 is
// exactly theta = 45 degrees: the square-root-mass vector sits at 45 degrees to the
// triality-symmetric axis of the three generations.
//
// This experiment confirms the relation on the measured masses and states its
// geometric form. It is HONEST about what it is and is not:
//   - It VERIFIES the empirical relation (Tier B, masses are input), it does not
//     DERIVE the masses, which stay free.
//   - The specific value, 45 degrees / two-thirds, is NOT yet derived from the
//     {3,4,3,4} geometry. Why the square-root-mass vector sits at exactly 45 degrees
//     to the democratic axis is open, and is the real target that this frames.
// The control is that a generic mass triple does NOT satisfy the relation, so the
// leptons hitting 45 degrees is a special, non-random fact.
//
// Grade L1: a known empirical relation confirmed and put in geometric form, with a
// control that it is non-generic. It is not a derivation, and it is labeled so.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Charged-lepton masses in MeV (PDG). Empirical input, Tier B.
const M_E = 0.51099895
const M_MU = 105.6583755
const M_TAU = 1776.86

function koideQ(masses: number[]): number {
  const sum = masses.reduce((s, m) => s + m, 0)
  const rootSum = masses.reduce((s, m) => s + Math.sqrt(m), 0)

  return sum / (rootSum * rootSum)
}

// The angle (degrees) of the square-root-mass vector to the democratic axis, from
// Q = 1 / (3 cos^2 theta).
function democraticAngle(q: number): number {
  return (Math.acos(1 / Math.sqrt(3 * q)) * 180) / Math.PI
}

export default experiment({
  id: 'gauge/koide-lepton-relation',
  code: 'E-FRC-0057',
  title:
    'the charged leptons satisfy the Koide relation Q = 2/3 to one part in a hundred thousand, equivalently the square-root-mass vector at 45 degrees to the triality-symmetric axis, a sharp lepton coincidence whose geometric origin is the open target',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const q = koideQ([M_E, M_MU, M_TAU])
    const angle = democraticAngle(q)

    // a generic (non-lepton) mass triple, the control: it does not hit 2/3.
    const genericQ = koideQ([1, 4, 9])
    const genericAngle = democraticAngle(genericQ)

    // 1. the leptons satisfy Koide to high precision.
    const koideHolds = Math.abs(q - 2 / 3) < 1e-4

    // 2. equivalently the square-root-mass vector is at 45 degrees.
    const fortyFive = Math.abs(angle - 45) < 0.05

    // 3. the relation is non-generic: a generic mass triple misses it.
    const nonGeneric = Math.abs(genericQ - 2 / 3) > 0.03

    const solved = koideHolds && fortyFive && nonGeneric

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the measured charged-lepton masses satisfy the Koide relation Q = 2/3 to about one part in a hundred thousand, equivalent to the square-root-mass vector sitting at 45 degrees to the democratic (triality-symmetric) axis, while a generic mass triple does not, so the leptons hitting exactly 45 degrees is a sharp non-random coincidence whose geometric origin from the three-generation structure is the open target',
      metrics: {
        koideQ: q,
        target: 2 / 3,
        deviation: Math.abs(q - 2 / 3),
        democraticAngleDeg: angle,
        genericQ,
        genericAngleDeg: genericAngle,
      },
      control: {
        // A generic mass triple (1, 4, 9) is the control: its Koide value is far from
        // 2/3, so the leptons landing on 2/3 (45 degrees) is a special fact, not a
        // property of any three numbers. If the generic triple also gave 2/3, the
        // relation would be trivial.
        genericQ,
      },
      notes:
        'L1, Tier B (masses are empirical input, not derived). This CONFIRMS the Koide relation and states its geometric form (45 degrees to the democratic axis), it does NOT derive the masses or the angle. Why the square-root-mass vector sits at exactly 45 degrees to the triality-symmetric axis is the open piece, and is the real geometric target this frames. The masses are PDG values; the relation is stable under their uncertainties.',
    })
  },
})
