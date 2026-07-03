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
// A cross-root-system control keeps the identification honest: B2, with roots (+-1, 0),
// (0, +-1), (+-1, +-1), ALSO has a 45-degree long-short angle, computed here. The 45-degree
// long-short angle is common to the non-simply-laced families (B/C/F), so the identification
// places the Koide coupling at the two-length root angle generally, with F4 being the
// theory's instance, not a uniquely F4 fact.
//
// HONEST scope. The reduction (Koide <=> |c|/a = 1/sqrt(2)) is an algebraic identity true
// by construction of the circulant, kept computed as a sanity check, not evidence. The
// identification of 1/sqrt(2) with the long-short angle is a Tier-B geometric match, a
// genuine and specific one (the SAME 45 degrees, with the naive long-long coupling ruled
// out), but it is a two-length-family fact (B2 shares it), and it is NOT yet the full
// derivation. The remaining step, phase two, is a mechanism that BUILDS the mass-amplitude
// circulant from the long and short roots so its off-diagonal IS the long-short overlap.
// That mechanism is open. What this establishes is that the target is now a located,
// non-arbitrary angle, the two-length root angle, not a free parameter, and that the naive
// coupling is excluded.
//
// Grade L1: an identity-checked reduction plus a specific, controlled geometric
// identification, with the long-long angle as the control that rules out the naive coupling,
// the B2 cross control showing the angle is a family fact, and the mechanism honestly
// marked open.

import { rootsD4, rootsF4 } from '@/code/algebra/group/root-system'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// eigenvalues of a 3x3 complex circulant, diagonal a and off-diagonal |c| e^{i phi}
function circulantAmplitude(
  a: number,
  cAbs: number,
  phi: number,
): number {
  const eigs = [0, 1, 2].map(
    k => a + 2 * cAbs * Math.cos(phi + (2 * Math.PI * k) / 3),
  )

  const mean = eigs.reduce((s, e) => s + e, 0) / 3
  const dev = eigs.map(e => e - mean)
  const b = Math.sqrt(dev.reduce((s, d) => s + d * d, 0) / 1.5)

  return b / mean // b/a
}

// the distinct |cos| angle between a reference root and the given set
function cosAngles(
  ref: number[],
  set: number[][],
  refNorm: number,
  setNorm: number,
): number[] {
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

// the B2 root system: short roots (+-1, 0), (0, +-1) and long roots (+-1, +-1)
function rootsB2(): number[][] {
  return [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]
}

export default experiment({
  id: 'gauge/koide-coupling-f4-angle',
  code: 'E-FRC-0059',
  title:
    'the Koide amplitude b/a = sqrt(2) reduces exactly to a Z3 mass-coupling of 1/sqrt(2) = cos(45 degrees), and that 45 degrees is the long-short root angle of the two-length (non-simply-laced) root families generally (B2 also has it, the cross control), with F4 being the theory instance (the long-long angle is 60 degrees, the control), locating the Koide sqrt(2) at the two-length root angle rather than as a free parameter',
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
    const norm2 = (r: number[]): number =>
      r.reduce((s, x) => s + x * x, 0)

    const longs = f4.filter(r => Math.abs(norm2(r) - 2) < 1e-9)
    const shorts = f4.filter(r => Math.abs(norm2(r) - 1) < 1e-9)
    const refLong = longs[0]!

    const longShortCos = cosAngles(refLong, shorts, Math.SQRT2, 1)
    const d4 = rootsD4()
    const longLongCos = cosAngles(refLong, d4, Math.SQRT2, Math.SQRT2)

    // the cross-root-system control: the B2 long-short angle is ALSO 45 degrees, so the
    // two-length angle is a non-simply-laced family fact (B/C/F), not uniquely F4
    const b2 = rootsB2()
    const b2Longs = b2.filter(r => Math.abs(norm2(r) - 2) < 1e-9)
    const b2Shorts = b2.filter(r => Math.abs(norm2(r) - 1) < 1e-9)
    const b2LongShortCos = cosAngles(
      b2Longs[0]!,
      b2Shorts,
      Math.SQRT2,
      1,
    )

    const b2Has45 = b2LongShortCos.some(
      c => Math.abs(c - target) < 1e-4,
    )

    // does the long-short set contain exactly the 1/sqrt(2) = cos(45 deg) coupling?
    const longShortHas45 = longShortCos.some(
      c => Math.abs(c - target) < 1e-4,
    )

    // the control: the long-long angles do NOT contain 1/sqrt(2) (they are 1/2, cos 60 deg)
    const longLongNo45 = !longLongCos.some(
      c => Math.abs(c - target) < 1e-4,
    )

    const longLongIsHalf = longLongCos.some(
      c => Math.abs(c - 0.5) < 1e-4,
    )

    // 1. identity check, not a finding: |c|/a = 1/sqrt(2) gives b/a = sqrt(2). This is an
    //    algebraic identity true by construction of the circulant, kept computed as a sanity
    //    check on the code, and carries no evidential weight.
    const reductionExact =
      Math.abs(amplitudeFromCoupling - Math.SQRT2) < 1e-6

    // 2. the F4 long-short angle is exactly 45 degrees (cos 1/sqrt(2)).
    const angleIs45 = longShortHas45

    // 3. the control: the long-long angle is 60 degrees (cos 1/2), NOT the Koide coupling.
    const controlIsWrong = longLongNo45 && longLongIsHalf

    // 4. the cross-root-system control: B2 also has a 45-degree long-short angle, so the
    //    identification is a two-length (non-simply-laced) family fact, not uniquely F4.
    const b2Also45 = b2Has45

    const solved =
      reductionExact && angleIs45 && controlIsWrong && b2Also45

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the Koide amplitude b/a = sqrt(2) is exactly equivalent to a Z3 mass-amplitude circulant whose off-diagonal coupling is 1/sqrt(2) = cos(45 degrees) of its diagonal (an algebraic identity, kept as a sanity check), and that 45 degrees is the angle between a long root and a short root of the substrate F4 root system (verified), while the long-long angle is 60 degrees (cos 1/2), the control that rules out the naive same-length coupling, and the B2 long-short angle is ALSO 45 degrees (the cross-root-system control), so the 45-degree long-short angle is common to the non-simply-laced families (B/C/F) and the identification places the Koide coupling at the two-length root angle generally, with F4 being the theory instance, not a uniquely F4 fact, and with the mechanism that builds the mass operator from these roots the remaining open step',
      metrics: {
        amplitudeFromCoupling: Number(amplitudeFromCoupling.toFixed(6)),
        sqrt2: Number(Math.SQRT2.toFixed(6)),
        couplingTarget: Number(target.toFixed(6)),
        longShortCos45: Number(
          (
            longShortCos.find(c => Math.abs(c - target) < 1e-4) ?? -1
          ).toFixed(5),
        ),
        longShortDistinctAngles: longShortCos.length,
        longLongCosHalf: Number(
          (
            longLongCos.find(c => Math.abs(c - 0.5) < 1e-4) ?? -1
          ).toFixed(5),
        ),
        longLongDistinctAngles: longLongCos.length,
        b2LongShortCos45: Number(
          (
            b2LongShortCos.find(c => Math.abs(c - target) < 1e-4) ?? -1
          ).toFixed(5),
        ),
      },
      control: {
        // the D4 long-long angle is cos 1/2 (60 degrees), which does NOT equal the Koide
        // coupling 1/sqrt(2). So the required 1/sqrt(2) is specifically the long-short
        // angle, not a generic root angle. If the long-long angle had also been 45
        // degrees, the identification would be unremarkable. And the cross-root-system
        // control: B2 also has a 45-degree long-short angle, so the two-length angle is
        // a non-simply-laced family fact (B/C/F), not uniquely F4.
        longLongCosContainsHalf: longLongIsHalf ? 1 : 0,
        longLongCosContains45: longLongCos.some(
          c => Math.abs(c - target) < 1e-4,
        )
          ? 1
          : 0,
        b2LongShortContains45: b2Has45 ? 1 : 0,
      },
      notes:
        'L1. The reduction (Koide Q=2/3 <=> |c|/a = 1/sqrt(2) for a Z3 circulant mass-amplitude) is an algebraic identity true by construction, kept computed as a sanity check on the code, not as a finding. Tier B for the geometric identification (1/sqrt(2) = cos 45 degrees = the F4 long-short root angle, with the long-long 60-degree angle as the control that excludes the naive coupling). Cross-root-system control: the B2 long-short angle is ALSO 45 degrees, so the 45-degree long-short angle is common to the non-simply-laced families (B/C/F), and the identification places the Koide coupling at the two-length root angle generally, with F4 being the theory instance, not a uniquely F4 fact. This is NOT the full derivation: a mechanism that constructs the mass-amplitude operator from the long and short roots, so its off-diagonal IS the long-short overlap, is the open phase-two step. What is established is that the Koide sqrt(2) sits at the located two-length root angle rather than being a free parameter, and that the naive same-length coupling is ruled out. Masses remain empirical input, this constrains their FORM, not their scale.',
    })
  },
})
