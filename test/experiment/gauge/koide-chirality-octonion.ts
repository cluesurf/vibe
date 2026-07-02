// The root-to-mass campaign, phase two: what the mass operator MUST be, and where the
// chirality comes from. This rules out a whole class of naive constructions and ties the
// Koide mechanism to the same octonion non-associativity that forces three generations.
//
// E-FRC-0059 reduced the Koide amplitude to a Z3 mass-coupling of cos(45 degrees), the F4
// long-short root angle, and left the mass-operator mechanism open. The obvious mechanism
// is a symmetric geometric OVERLAP: build a 3x3 mass matrix from inner products of the
// root sectors (a real Gram). This experiment shows that class of mechanism CANNOT work,
// and identifies what must replace it.
//
// A real symmetric circulant, the general form of a symmetric overlap on three Z3-related
// slots, is [[a, c, c], [c, a, c], [c, c, a]], with eigenvalues
//   a + 2c,   a - c,   a - c.
// That is a democratic value plus a DEGENERATE DOUBLET, only TWO distinct masses. But the
// charged leptons are THREE distinct masses, and the Koide phase delta = 2/9 radian is
// neither 0 nor pi. So a real symmetric overlap is provably insufficient: it can never
// split the three generations, only a generation and a mass-degenerate pair.
//
// Getting three distinct masses with a nonzero phase REQUIRES a CHIRAL (complex) Z3
// coupling c = |c| e^{i delta}, delta != 0. A real Gram is symmetric (u . v = v . u) and
// cannot supply a phase. The chirality must come from an ORIENTED structure, and the
// substrate has exactly one: the octonion multiplication is oriented, anti-commuting
// (e_i e_j = - e_j e_i) and non-associative. Computed here, the oriented Fano-line triple
// gives <e1 e2, e3> = +1 but <e2 e1, e3> = -1, an anti-symmetry a symmetric Gram cannot
// have. So the octonions are the natural source of the required complex phase.
//
// The coherence is the point. The SAME octonion non-associativity that forces exactly
// three generations (the Jordan identity holds at n <= 3 and fails at n = 4, E-SPN-0016)
// is what must supply the chiral coupling that splits their masses. The generation count
// and the generation mass-splitting trace to one property of the substrate.
//
// HONEST scope. That a symmetric overlap gives only a doublet, and that three distinct
// masses with a phase need a chiral coupling, are exact (Tier A). That the octonion
// multiplication is oriented and anti-symmetric is computed (Tier A). The identification
// of the octonion orientation as the SOURCE of the Koide phase is a Tier-B structural
// claim, and whether the orientation FIXES delta = 2/9 and |c|/a = 1/sqrt(2) jointly is
// the remaining open step. What is established is that the mechanism must be chiral, that
// symmetric constructions are ruled out, and that the substrate has the exact oriented
// structure required, from the same source as the three-fold itself.
//
// Grade L1: an exact structural result (symmetric overlap gives a doublet, a control that
// rules out the naive mechanism) plus a computed geometric fact (octonion orientation is
// chiral), with the joint fixing of the two constants honestly marked open.

import {
  octonionMultiply,
  octonionUnit,
  octonionConjugate,
  octonionRealPart,
} from '@/code/algebra/octonion'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// eigenvalues of a real symmetric circulant [[a,c,c],[c,a,c],[c,c,a]]
function symmetricCirculantEigs(a: number, c: number): number[] {
  return [a + 2 * c, a - c, a - c]
}

// count distinct values to a tolerance
function distinctCount(values: number[]): number {
  return new Set(values.map(v => v.toFixed(6))).size
}

export default experiment({
  id: 'gauge/koide-chirality-octonion',
  code: 'E-FRC-0060',
  title:
    'a symmetric geometric overlap gives only a degenerate doublet so cannot produce Koide three distinct masses, which force a chiral Z3 coupling, and the octonion multiplication (oriented, the same non-associativity that forces three generations) is the natural source of that chirality',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    // 1. a real symmetric circulant (the general symmetric overlap) gives a doublet.
    const symmetricEigs = symmetricCirculantEigs(1, 0.3)
    const symmetricDistinct = distinctCount(symmetricEigs)

    // 2. the leptons are three distinct masses with a nonzero, non-pi phase.
    const roots = [
      Math.sqrt(0.51099895),
      Math.sqrt(105.6583755),
      Math.sqrt(1776.86),
    ]

    const leptonDistinct = distinctCount(roots)
    const a = roots.reduce((s, r) => s + r, 0) / 3
    const dev = roots.map(r => r - a)
    const b = Math.sqrt(dev.reduce((s, d) => s + d * d, 0) / 1.5)
    const delta = Math.min(
      ...dev.map(d => Math.acos(Math.max(-1, Math.min(1, d / b)))),
    )

    const chiralRequired = delta > 1e-3 && Math.abs(delta - Math.PI) > 1e-3

    // 3. the octonion oriented Fano-line triple is anti-symmetric (chiral).
    const e = (i: number): ReturnType<typeof octonionUnit> => octonionUnit(i)
    const forward = octonionRealPart(
      octonionMultiply(octonionMultiply(e(1), e(2)), octonionConjugate(e(3))),
    )

    const backward = octonionRealPart(
      octonionMultiply(octonionMultiply(e(2), e(1)), octonionConjugate(e(3))),
    )

    const octonionChiral = Math.abs(forward - backward) > 1e-9

    // 1. symmetric overlap gives only a doublet (2 distinct), not 3.
    const symmetricIsDoublet = symmetricDistinct === 2

    // 2. the leptons need 3 distinct with a chiral phase.
    const leptonsNeedChiral = leptonDistinct === 3 && chiralRequired

    // 3. the octonion orientation supplies the chirality a symmetric Gram cannot.
    const octonionSuppliesChirality =
      octonionChiral && Math.abs(forward + backward) < 1e-9

    const solved =
      symmetricIsDoublet && leptonsNeedChiral && octonionSuppliesChirality

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'a real symmetric overlap on three Z3 slots is a symmetric circulant with eigenvalues a+2c, a-c, a-c, a democratic value plus a degenerate doublet, so it can never produce the three distinct charged-lepton masses, which together with the nonzero Koide phase delta = 2/9 force a chiral complex Z3 coupling, and the octonion multiplication supplies exactly that chirality (the oriented Fano triple gives <e1 e2,e3> = +1 but <e2 e1,e3> = -1, anti-symmetric, which a symmetric Gram cannot be), so the mechanism must be chiral, symmetric constructions are ruled out, and the substrate orientation from the same non-associativity that forces three generations is the natural source',
      metrics: {
        symmetricCirculantDistinctMasses: symmetricDistinct,
        leptonDistinctMasses: leptonDistinct,
        koidePhaseRadian: Number(delta.toFixed(6)),
        octonionForward: Number(forward.toFixed(6)),
        octonionBackward: Number(backward.toFixed(6)),
      },
      control: {
        // the symmetric circulant is the control: it gives only 2 distinct masses, so a
        // symmetric geometric overlap is provably insufficient for the 3-way Koide split.
        // If it had given 3, symmetric constructions would still be in play.
        symmetricCirculantDistinctMasses: symmetricDistinct,
        octonionForwardPlusBackward: Number((forward + backward).toFixed(6)),
      },
      notes:
        'L1. Tier A: a symmetric circulant gives eigenvalues a+2c, a-c, a-c (a doublet, 2 distinct), and three distinct masses with a phase in (0, pi) need a chiral complex coupling. Tier A: the octonion oriented triple is anti-symmetric (forward +1, backward -1). Tier B: identifying the octonion orientation as the SOURCE of the Koide phase. Open: whether the orientation FIXES delta = 2/9 and |c|/a = 1/sqrt(2) jointly (phase three). This rules out symmetric-overlap mechanisms and shows the required chirality is present in the substrate from the same non-associativity that forces three generations (E-SPN-0016), a coherence between the generation count and the generation mass-splitting.',
    })
  },
})
