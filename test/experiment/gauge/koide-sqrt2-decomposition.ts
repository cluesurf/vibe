// The Koide relation, decomposed into the two numbers a geometric derivation must
// produce, and one of them placed in the theory's own polytope.
//
// E-FRC-0057 confirmed Q = 2/3, equivalently the square-root-mass vector at 45 degrees
// to the democratic axis, and left "why 45 degrees" open. This sharpens that target by
// decomposing the square-root-mass vector exactly.
//
// Write the three square-root masses as a democratic mean plus a traceless oscillation,
//   sqrt(m_k) = a + b cos(delta + 2 pi k / 3),   k = 0, 1, 2.
// The mean a is the democratic (1,1,1) component, and b, delta are the amplitude and
// phase of the traceless part (the part that splits the generations). A short
// calculation gives Q = 1/3 + b^2 / (6 a^2), so
//   Q = 2/3   <=>   b / a = sqrt(2)   <=>   |traceless part| = |democratic part|.
// The 45 degrees is EXACTLY the statement that the traceless part of the square-root-mass
// vector has the same norm as its democratic part, and that happens exactly when the
// oscillation amplitude is sqrt(2) times the mean.
//
// Two facts then stand out on the measured masses:
//   1. b / a = sqrt(2) to about one part in a hundred thousand. This is Q = 2/3 restated,
//      but it puts the coincidence on sqrt(2), and sqrt(2) is the characteristic ratio of
//      the theory's generation polytope: the 24-cell / D4 has vertices (±1, ±1, 0, 0) of
//      norm sqrt(2). So the amplitude side of Koide has a natural home in the SAME
//      polytope that carries the three generations, rather than being an arbitrary number.
//   2. the phase delta = 2/9 radian to about one part in a hundred thousand, a sharp
//      rational the amplitude does not fix. This is the part that sets the individual
//      mass splittings.
//
// HONEST scope, stated plainly. This is NOT a derivation of the masses. It is an exact
// decomposition (Tier A, pure algebra on the definition) plus two geometric observations
// (Tier B, suggestive): that the amplitude ratio equals the D4 sqrt(2) and the phase
// equals 2/9. Neither is yet forced from the generation dynamics, and showing that the
// three-slot structure MAKES b/a = sqrt(2) is the open step. But the decomposition turns
// the vague "why 45 degrees" into two concrete, separately attackable targets, one of
// which (the sqrt(2)) already lives in the right polytope.
//
// The control is a generic mass triple, which gives neither b/a = sqrt(2) nor delta = 2/9,
// so the lepton values are special, not a property of any three numbers.
//
// Grade L1: an exact algebraic decomposition confirmed on the data, with a control, and
// with the two residual constants (sqrt(2), 2/9) named honestly as Tier-B geometric
// observations, not derivations.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Charged-lepton masses in MeV (PDG). Empirical input, Tier B.
const M_E = 0.51099895
const M_MU = 105.6583755
const M_TAU = 1776.86

// Decompose (sqrt m_0, sqrt m_1, sqrt m_2) into democratic mean a, oscillation amplitude
// b, and phase delta (the smallest branch angle). Returns a, b, delta and the two norms.
function decompose(masses: number[]): {
  a: number
  b: number
  delta: number
  democraticNorm2: number
  tracelessNorm2: number
} {
  const roots = masses.map(Math.sqrt)
  const a = roots.reduce((s, r) => s + r, 0) / 3
  const dev = roots.map(r => r - a)

  const democraticNorm2 = 3 * a * a
  const tracelessNorm2 = dev.reduce((s, d) => s + d * d, 0)

  // Σ (b cos)^2 over three equally spaced phases = 1.5 b^2 = tracelessNorm2
  const b = Math.sqrt(tracelessNorm2 / 1.5)

  // the branch angles arccos(dev_k / b), delta is the smallest (the heavy generation)
  const angles = dev.map(d =>
    Math.acos(Math.max(-1, Math.min(1, d / b))),
  )

  const delta = Math.min(...angles)

  return { a, b, delta, democraticNorm2, tracelessNorm2 }
}

export default experiment({
  id: 'gauge/koide-sqrt2-decomposition',
  code: 'E-FRC-0058',
  title:
    'the Koide 45 degrees decomposes exactly into b/a = sqrt(2) (the traceless part of the square-root-mass vector has equal norm to its democratic part, and sqrt(2) is the 24-cell / D4 characteristic ratio) plus a free phase delta = 2/9 radian, isolating the two numbers a geometric derivation must produce',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const { a, b, delta, democraticNorm2, tracelessNorm2 } = decompose([
      M_E,
      M_MU,
      M_TAU,
    ])

    const amplitudeRatio = b / a
    const normRatio = tracelessNorm2 / democraticNorm2

    // the D4 / 24-cell characteristic ratio, the vertex norm of (±1, ±1, 0, 0)
    const d4Ratio = Math.hypot(1, 1) // = sqrt(2)

    // control: a generic mass triple gives neither sqrt(2) nor 2/9
    const control = decompose([1, 4, 9])
    const controlAmplitude = control.b / control.a

    // 1. the exact decomposition: traceless norm equals democratic norm (this IS 45 deg).
    //    The 1e-4 gate is tight enough that a wrong tau of 1780 MeV (miss about 5e-4) fails.
    const equalNorm = Math.abs(normRatio - 1) < 1e-4

    // 2. the amplitude ratio is the D4 sqrt(2) to high precision (PDG miss about 1.3e-5,
    //    a wrong tau of 1780 MeV misses by about 3.6e-4 and fails the 1e-4 gate).
    const amplitudeIsD4 = Math.abs(amplitudeRatio - d4Ratio) < 1e-4

    // 3. the phase is 2/9 radian to high precision (the sharp rational the amplitude
    //    does not fix). PDG miss about 7e-6, a wrong tau of 1780 MeV misses by about
    //    2e-4 and fails the 2e-5 gate.
    const phaseIsTwoNinths = Math.abs(delta - 2 / 9) < 2e-5

    // 4. the control (generic triple) misses the sqrt(2), so the lepton value is special.
    const controlMisses = Math.abs(controlAmplitude - d4Ratio) > 0.1

    const solved =
      equalNorm && amplitudeIsD4 && phaseIsTwoNinths && controlMisses

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the Koide 45 degrees is exactly the statement that the traceless part of the square-root-mass vector has the same norm as its democratic part, which holds exactly when the oscillation amplitude is sqrt(2) times the mean, and on the measured leptons b/a = sqrt(2) to about one part in a hundred thousand where sqrt(2) is the 24-cell / D4 characteristic vertex-norm ratio, while the residual phase delta = 2/9 radian to about one part in a hundred thousand, so the Koide coincidence splits into a sqrt(2) amplitude that already lives in the generation polytope and a 2/9 phase, the two concrete numbers a geometric derivation must produce, with a generic mass triple hitting neither',
      metrics: {
        a: Number(a.toFixed(6)),
        b: Number(b.toFixed(6)),
        amplitudeRatio: Number(amplitudeRatio.toFixed(6)),
        sqrt2: Number(d4Ratio.toFixed(6)),
        normRatioTracelessOverDemocratic: Number(normRatio.toFixed(6)),
        deltaRadian: Number(delta.toFixed(6)),
        twoNinths: Number((2 / 9).toFixed(6)),
        controlAmplitudeRatio: Number(controlAmplitude.toFixed(6)),
      },
      control: {
        // A generic triple (1, 4, 9) gives amplitude ratio far from sqrt(2), so b/a =
        // sqrt(2) is a special lepton fact, not a property of any three numbers. If the
        // generic triple also gave sqrt(2), the decomposition would be trivial.
        controlAmplitudeRatio: Number(controlAmplitude.toFixed(6)),
        sqrt2: Number(d4Ratio.toFixed(6)),
      },
      notes:
        'L1, Tier A for the algebra (Q = 1/3 + b^2/(6 a^2), so Q=2/3 <=> b/a=sqrt(2) <=> equal traceless and democratic norms, exact), Tier B for the two geometric observations (that b/a equals the D4 sqrt(2) vertex ratio, and that delta = 2/9 radian). The sqrt(m_k) = a + b cos(delta + 2 pi k/3) parametrization is due to Brannen. The pass gates are 1e-4 on the amplitude and norm booleans and 2e-5 on the phase boolean, tight enough that a wrong tau of 1780 MeV fails all three (misses of about 3.6e-4, 5.1e-4, and 2.1e-4), while the PDG values pass with room (misses of about 1.3e-5, 1.8e-5, and 7e-6). Neither residual is yet DERIVED from the three-slot generation structure, and forcing b/a = sqrt(2) from the dynamics is the open step this isolates. The masses are PDG input. This sharpens E-FRC-0057 (which confirmed 45 degrees) by decomposing it into a sqrt(2) amplitude with a natural home in the 24-cell and a free 2/9 phase, rather than adding a new claim of derivation.',
    })
  },
})
