// The root-to-mass campaign, phase one: locate the Koide sqrt(2) in a specific angle of
// the theory's own root system, non-circularly, and rule out the naive coupling.
//
// E-FRC-0058 reduced the Koide 45 degrees to b/a = sqrt(2), the oscillation amplitude of
// the square-root-mass vector being sqrt(2) times its democratic mean. This goes one step
// further toward a derivation.
//
// The three generations are three slots with a cyclic Z3 among them (the triality of the
// D4 inside F4). The natural mass object on three Z3-related slots is a complex circulant,
// a Hermitian operator whose diagonal a is the democratic (self) term and whose
// off-diagonal c = |c| e^{i phi} is the Z3 coupling. Its eigenvalues are
//   sqrt(m_k) = a + 2 |c| cos(phi + 2 pi k / 3),   k = 0, 1, 2,
// which is exactly the Koide form, with b = 2|c| and delta = phi. So
//   Koide Q = 2/3   <=>   b/a = sqrt(2)   <=>   |c| / a = 1 / sqrt(2).
// The Koide amplitude is therefore equivalent to ONE geometric ratio: the Z3 coupling is
// 1/sqrt(2) of the self term. And 1/sqrt(2) = cos(45 degrees).
//
// Now the geometry answers where that 45 degrees lives. The substrate's 24 directions are
// the F4 LONG roots (norm squared 2), and F4 also has 24 SHORT roots (norm squared 1). The
// angle between a long root and a short root it touches is exactly 45 degrees (cos =
// 1/sqrt(2)), computed here. The long-to-long angle is 60 degrees (cos = 1/2), the WRONG
// value, which is the control. So the coupling the Koide amplitude needs is precisely the
// long-short angle of the theory's root system, and it equals the Koide angle exactly,
// 45 degrees to 45 degrees, not an arbitrary sqrt(2) sighting and not the naive same-length
// coupling (which would give 1/2, a Koide value of 1/3 + (2*(1/2))^2... i.e. the wrong Q).
//
// HONEST scope. The reduction (Koide <=> |c|/a = 1/sqrt(2)) is exact algebra, Tier A. The
// identification of 1/sqrt(2) with the F4 long-short angle is a Tier-B geometric match, a
// genuine and specific one (the SAME 45 degrees, in the theory's own roots, with the naive
// long-long coupling ruled out), but it is NOT yet the full derivation. The remaining step,
// phase two, is a mechanism that BUILDS the mass-amplitude circulant from the long and short
// roots so its off-diagonal IS the long-short overlap. That mechanism is open. What this
// establishes is that the target is now a single, located, non-arbitrary angle, not a free
// parameter, and that the naive coupling is excluded.
//
// Grade L1: an exact reduction plus a specific, controlled geometric identification, with
// the long-long angle as the control that rules out the naive coupling, and the mechanism
// honestly marked open.

import { rootsD4, rootsF4 } from '@/code/algebra/group/root-system'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// eigenvalues of a 3x3 complex circulant, diagonal a and off-diagonal |c| e^{i phi}
function circulantAmplitude(a: number, cAbs: number, phi: number): number {
  const eigs = [0, 1, 2].map(
    k => a + 2 * cAbs * Math.cos(phi + (2 * Math.PI * k) / 3),
  )

  const mean = eigs.reduce((s, e) => s + e, 0) / 3
  const dev = eigs.map(e => e - mean)
  const b = Math.sqrt(dev.reduce((s, d) => s + d * d, 0) / 1.5)

  return b / mean // b/a
}

// the distinct |cos| angle between a reference root and the given set
function cosAngles(ref: number[], set: number[][], refNorm: number, setNorm: number): number[] {
  const out = new Set<number>()

  for (const r of set) {
    const dot = r.reduce((s, x, i) => s + x * ref[i]!, 0)
    const cos = dot / (refNorm * setNorm)

    if (Math.abs(cos) > 1e-9 && Math.abs(cos) < 1 - 1e-9) {
      out.add(Number(Math.abs(cos).toFixed(6)))
    }
  }

  return [...out].sort((x, y) => x - y)
}

export default experiment({
  id: 'gauge/koide-coupling-f4-angle',
  code: 'E-FRC-0059',
  title:
    'the Koide amplitude b/a = sqrt(2) reduces exactly to a Z3 mass-coupling of 1/sqrt(2) = cos(45 degrees), and that 45 degrees is precisely the F4 long-short root angle of the substrate (the long-long angle is 60 degrees, the control), locating the Koide sqrt(2) in the theory root system rather than as a free parameter',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const target = 1 / Math.SQRT2

    // the exact reduction: a Z3 circulant with |c|/a = 1/sqrt(2) reproduces b/a = sqrt(2)
    const amplitudeFromCoupling = circulantAmplitude(1, target, 2 / 9)

    // the F4 long-short angle vs the D4 long-long angle
    const f4 = rootsF4()
    const norm2 = (r: number[]): number => r.reduce((s, x) => s + x * x, 0)
    const longs = f4.filter(r => Math.abs(norm2(r) - 2) < 1e-9)
    const shorts = f4.filter(r => Math.abs(norm2(r) - 1) < 1e-9)
    const refLong = longs[0]!

    const longShortCos = cosAngles(refLong, shorts, Math.SQRT2, 1)
    const d4 = rootsD4()
    const longLongCos = cosAngles(refLong, d4, Math.SQRT2, Math.SQRT2)

    // does the long-short set contain exactly the 1/sqrt(2) = cos(45 deg) coupling?
    const longShortHas45 = longShortCos.some(c => Math.abs(c - target) < 1e-4)
    // the control: the long-long angles do NOT contain 1/sqrt(2) (they are 1/2, cos 60 deg)
    const longLongNo45 = !longLongCos.some(c => Math.abs(c - target) < 1e-4)
    const longLongIsHalf = longLongCos.some(c => Math.abs(c - 0.5) < 1e-4)

    // 1. the reduction is exact: |c|/a = 1/sqrt(2) gives b/a = sqrt(2).
    const reductionExact = Math.abs(amplitudeFromCoupling - Math.SQRT2) < 1e-6

    // 2. the F4 long-short angle is exactly 45 degrees (cos 1/sqrt(2)).
    const angleIs45 = longShortHas45

    // 3. the control: the long-long angle is 60 degrees (cos 1/2), NOT the Koide coupling.
    const controlIsWrong = longLongNo45 && longLongIsHalf

    const solved = reductionExact && angleIs45 && controlIsWrong

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the Koide amplitude b/a = sqrt(2) is exactly equivalent to a Z3 mass-amplitude circulant whose off-diagonal coupling is 1/sqrt(2) = cos(45 degrees) of its diagonal, and that 45 degrees is precisely the angle between a long root and a short root of the substrate F4 root system (verified), while the long-long angle is 60 degrees (cos 1/2), the control that rules out the naive same-length coupling, so the Koide sqrt(2) is located in a specific non-arbitrary angle of the theory own roots rather than being a free parameter, with the mechanism that builds the mass operator from these roots the remaining open step',
      metrics: {
        amplitudeFromCoupling: Number(amplitudeFromCoupling.toFixed(6)),
        sqrt2: Number(Math.SQRT2.toFixed(6)),
        couplingTarget: Number(target.toFixed(6)),
        longShortCos: longShortCos.map(c => Number(c.toFixed(5))),
        longLongCos: longLongCos.map(c => Number(c.toFixed(5))),
      },
      control: {
        // the D4 long-long angle is cos 1/2 (60 degrees), which does NOT equal the Koide
        // coupling 1/sqrt(2). So the required 1/sqrt(2) is specifically the long-short
        // angle, not a generic root angle. If the long-long angle had also been 45
        // degrees, the identification would be unremarkable.
        longLongCosContainsHalf: longLongIsHalf ? 1 : 0,
        longLongCosContains45: longLongCos.some(c => Math.abs(c - target) < 1e-4) ? 1 : 0,
      },
      notes:
        'L1. Tier A for the reduction (Koide Q=2/3 <=> |c|/a = 1/sqrt(2) for a Z3 circulant mass-amplitude, exact). Tier B for the geometric identification (1/sqrt(2) = cos 45 degrees = the F4 long-short root angle, with the long-long 60-degree angle as the control that excludes the naive coupling). This is NOT the full derivation: a mechanism that constructs the mass-amplitude operator from the long and short roots, so its off-diagonal IS the long-short overlap, is the open phase-two step. What is established is that the Koide sqrt(2) sits at a single located non-arbitrary angle of the substrate root system, the same 45 degrees as the Koide angle itself, and that the naive same-length coupling is ruled out. Masses remain empirical input, this constrains their FORM, not their scale.',
    })
  },
})
