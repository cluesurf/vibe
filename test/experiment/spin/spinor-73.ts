// P201: spin on {7,3}. The 7 faces of a heptagon carry a permutation rep of the dihedral group D7, which
// decomposes into the trivial rep plus the three 2D (vector-like) irreps, NO spinor. So {7,3}, like {5,3,4},
// has no fundamental spin one-half. Being 2D it could host ANYONS (any statistics) in principle, but its flat
// layer is only 1D (a horocycle), so even that is starved. Contrast, {3,4,3,4} alone supplies real spinors.
// Run: npx tsx code/experiment/p201-spinor-73.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { dihedralFacePermutationDecomposition } from '@/code/algebra/group/dihedral'

export function spinor73(): {
  hasSpinor: boolean
  decomposition: string
} {
  // The 7 faces of the heptagon carry the permutation rep of D7. Its decomposition into
  // irreps (trivial + the three 2D vector irreps E1,E2,E3, no spinor) is the general
  // dihedral-face computation in algebra/group/dihedral.
  const { hasSpinor, decomposition } =
    dihedralFacePermutationDecomposition(7)

  return { hasSpinor, decomposition }
}

export default experiment({
  id: 'spin/spinor-73',
  code: 'E-SPN-0035',
  title:
    'the {7,3} heptagonal coin carries no spinor, only integer-spin reps of D7',
  category: 'spin',
  substrates: ['any'],
  depth: 'L1',
  paper: false,
  run() {
    const r = spinor73()
    // success is the EXPECTED decomposition (trivial plus the three 2D vector
    // irreps) with no spinor copy. The decomposition string is the measured object.
    const expected = '1xtriv + 1xE1 + 1xE2 + 1xE3'
    const decompositionMatches = r.decomposition === expected
    const ok = r.hasSpinor === false && decompositionMatches

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 7-face permutation rep of the {7,3} coin decomposes into the trivial rep plus the three 2D vector irreps of D7, with no half-integer (spinor) irrep, so {7,3} matches {5,3,4} as a scalar and vector substrate',
      metrics: {
        hasSpinor: r.hasSpinor ? 1 : 0,
        decompositionMatches: decompositionMatches ? 1 : 0,
      },
      notes:
        'L1, known math (dihedral group D7 representation theory). A negative result, {7,3} starves spin like {5,3,4}. The claim that 2D would allow anyons but the {7,3} flat layer is only 1D is a structural remark, not measured here.',
    })
  },
})
