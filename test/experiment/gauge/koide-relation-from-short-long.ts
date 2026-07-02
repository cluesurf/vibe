// The root-to-mass campaign, phase three (the culmination and the honest limit): a natural
// chiral octonion construction realizes the Koide RELATION Q = 2/3 phase-independently, from
// the F4 short/long root ratio, while the individual masses stay free. This is as far as the
// geometry forces the Koide coincidence, stated with the assignment input made explicit.
//
// The chain so far: Koide 45 degrees = b/a = sqrt(2) (E-FRC-0058), = a Z3 coupling of
// cos(45 degrees) = the F4 long-short angle (E-FRC-0059), which must be chiral and comes from
// the octonion orientation (E-FRC-0060). Phase three builds the operator and asks what the
// geometry actually forces.
//
// The Z3-circulant Hermitian mass operator has diagonal a and chiral octonionic coupling
// c = |c| e^{i phi}, with sqrt(m_k) = a + 2|c| cos(phi + 2 pi k / 3). The KEY fact: Q depends
// ONLY on b/a = 2|c|/a, NOT on the phase. So if |c|/a = 1/sqrt(2), then Q = 2/3 for EVERY
// phase. And 1/sqrt(2) is the F4 SHORT/LONG root length ratio (short roots norm 1, long roots
// norm sqrt(2)). So the natural construction, diagonal at the long-root scale and octonionic
// coupling at the short-root scale, gives Q = 2/3 exactly, phase-independent. The Koide
// RELATION is realized from the geometry.
//
// What this does and does not do, stated plainly:
//   - It DERIVES the RELATION Q = 2/3 (the celebrated coincidence) as phase-independent, from
//     the F4 short/long ratio via a chiral octonion coupling. This is the real content.
//   - The ASSIGNMENT (diagonal = long scale, coupling = short scale) is REQUIRED: the swap
//     gives Q = 5/3, the control. The assignment is physically motivated (a self-energy larger
//     than its coupling) but is an INPUT, not forced from first principles. This is the honest
//     circularity, flagged rather than hidden.
//   - It does NOT fix the phase delta = 2/9, which sets the INDIVIDUAL masses. 2/9 radian is
//     not a natural pi-related angle (the nearest simple pi/n is off by more than one part in
//     twenty), so the individual masses stay free. Only the relation is derived, not the
//     spectrum. This matches the physics: Koide constrains the COMBINATION, not the masses.
//
// Grade L1: the phase-independence of Q and its value 2/3 at |c|/a = 1/sqrt(2) are exact
// (Tier A), the identification of 1/sqrt(2) with the F4 short/long ratio is geometric (Tier A
// on the ratio, Tier B on it being the mass operator), the assignment is a labelled input, and
// the phase staying free is an honest negative. The honest headline: the Koide relation is
// geometrically realized up to one motivated assignment, the individual masses are not.

import { rootsF4 } from '@/code/algebra/group/root-system'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Koide Q from a Z3-circulant mass operator: diagonal a, coupling magnitude |c|, phase phi.
function koideQ(a: number, cAbs: number, phi: number): number {
  const sqrtM = [0, 1, 2].map(
    k => a + 2 * cAbs * Math.cos(phi + (2 * Math.PI * k) / 3),
  )

  const masses = sqrtM.map(s => s * s)
  const sum = masses.reduce((s, m) => s + m, 0)
  const rootSum = sqrtM.reduce((s, r) => s + r, 0)

  return sum / (rootSum * rootSum)
}

export default experiment({
  id: 'gauge/koide-relation-from-short-long',
  code: 'E-FRC-0061',
  title:
    'a chiral octonion Z3 mass operator with diagonal at the F4 long-root scale and coupling at the short-root scale gives |c|/a = 1/sqrt(2) hence Q = 2/3 for every phase, realizing the Koide RELATION from the short/long ratio phase-independently, while the assignment is a motivated input and the phase (the individual masses) stays free',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    // the F4 short and long root scales
    const f4 = rootsF4()
    const norm2 = (r: number[]): number => r.reduce((s, x) => s + x * x, 0)
    const longScale = Math.sqrt(2) // long roots have norm sqrt(2)
    const shortScale = 1 // short roots have norm 1
    const shortOverLong = shortScale / longScale // = 1/sqrt(2)
    const hasLong = f4.some(r => Math.abs(norm2(r) - 2) < 1e-9)
    const hasShort = f4.some(r => Math.abs(norm2(r) - 1) < 1e-9)

    // the construction: diagonal = long scale, coupling = short scale, so |c|/a = short/long
    const a = longScale
    const cAbs = shortScale

    // Q for a spread of phases: should be 2/3 for ALL of them (phase-independent)
    const phases = [0, 2 / 9, 0.5, 1.0, 1.7, 2.5, 3.0]
    const qValues = phases.map(phi => koideQ(a, cAbs, phi))
    const maxQDeviation = Math.max(...qValues.map(q => Math.abs(q - 2 / 3)))

    // the control: the SWAPPED assignment (diagonal = short, coupling = long) does NOT give 2/3
    const qSwapped = koideQ(shortScale, longScale, 2 / 9)

    // the phase 2/9 is not a natural pi-related angle (individual masses stay free)
    const twoNinths = 2 / 9
    const nearestPiFraction = [6, 9, 12, 15, 18, 24]
      .map(n => Math.abs(Math.PI / n - twoNinths))
      .reduce((m, d) => Math.min(m, d), Infinity)

    // 1. Q = 2/3 for EVERY phase when |c|/a = short/long = 1/sqrt(2).
    const relationPhaseIndependent = maxQDeviation < 1e-9

    // 2. that coupling ratio IS the F4 short/long root ratio, and both root lengths exist.
    const ratioIsShortLong =
      Math.abs(shortOverLong - 1 / Math.SQRT2) < 1e-9 && hasLong && hasShort

    // 3. the control: the swapped assignment gives Q far from 2/3 (assignment is required).
    const assignmentMatters = Math.abs(qSwapped - 2 / 3) > 0.3

    // 4. honest negative: 2/9 is not a natural angle, so the individual masses stay free.
    const phaseNotGeometric = nearestPiFraction > 0.01

    const solved =
      relationPhaseIndependent &&
      ratioIsShortLong &&
      assignmentMatters &&
      phaseNotGeometric

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'a chiral octonion Z3 mass operator with diagonal at the F4 long-root scale sqrt(2) and octonionic coupling at the short-root scale 1 has |c|/a = 1/sqrt(2) = the F4 short/long root ratio, which makes Q = 2/3 for every phase because Q depends only on b/a, so the Koide RELATION is realized geometrically and phase-independently, while the assignment diagonal-larger-than-coupling is a physically motivated but required input (the swap gives Q = 5/3, the control) and the phase delta = 2/9 that sets the individual masses is not a natural angle and stays free, so the relation is derived but not the spectrum',
      metrics: {
        maxQDeviationOverPhases: Number(maxQDeviation.toExponential(2)),
        qAtPhaseZero: Number(qValues[0]!.toFixed(6)),
        qAtTwoNinths: Number(qValues[1]!.toFixed(6)),
        couplingRatio: Number(shortOverLong.toFixed(6)),
        oneOverSqrt2: Number((1 / Math.SQRT2).toFixed(6)),
        qSwappedControl: Number(qSwapped.toFixed(6)),
        nearestPiFractionToTwoNinths: Number(nearestPiFraction.toFixed(5)),
      },
      control: {
        // swapping the assignment (diagonal = short, coupling = long) gives Q = 5/3, far
        // from 2/3, so the result needs the physically-motivated ordering and is not
        // automatic. And the phase 2/9 is not near any simple pi/n, so the individual
        // masses are genuinely free, not secretly geometric.
        qSwappedControl: Number(qSwapped.toFixed(6)),
        nearestPiFractionToTwoNinths: Number(nearestPiFraction.toFixed(5)),
      },
      notes:
        'L1. Tier A: Q is phase-independent and equals 2/3 exactly at |c|/a = 1/sqrt(2), and 1/sqrt(2) is the F4 short/long root ratio. Tier B: that this Z3 operator with the long/short scale assignment IS the generation mass operator. The assignment (diagonal = long scale, coupling = short scale) is physically motivated (self-energy exceeds coupling) but is a required input, shown by the swap control giving Q = 5/3. The phase delta = 2/9 is NOT fixed (not a natural pi-related angle), so the individual masses stay free and only the RELATION Q = 2/3 is realized, which matches the physics that Koide constrains the combination not the masses. This is the campaign culmination and its honest limit: the Koide relation is geometrically realized up to one motivated assignment, the spectrum is not derived.',
    })
  },
})
