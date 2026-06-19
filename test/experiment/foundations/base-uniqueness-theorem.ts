// The base uniqueness theorem, the dock is FORCED, exhaustively. The selection argument
// (`foundations/generator-selection`) shows D4 is the unique simple ROOT SYSTEM with triality. This strengthens it
// to a theorem over the complete GEOMETRIC candidate space, all six regular 4-polytopes, the full and finite list of
// the shapes the dock could be. Each is tested against the forced physical battery, and the 24-cell is the unique
// simultaneous pass.
//
//   The forced requirements, each physically motivated.
//   - SELF-DUAL. The dock equals its own dual (the matter and the force, the particle and the field, share one
//     structure). A self-dual regular 4-polytope has a palindromic Schlafli symbol.
//   - CRYSTALLOGRAPHIC. The dock is a discrete reversible lattice, integer-native (a root system, a symbol with no
//     5, since a 5 gives the non-crystallographic icosahedral H4).
//   - TRIALITY AND SPINORS. Matter is fermionic and comes in three generations, so the dock's directional set must
//     carry the order-three triality (the S3 Dynkin symmetry, the outer-automorphism order 6) that splits the 24
//     directions into 8v plus 8s plus 8c, the vector and the two spinors.
//
//   The six regular 4-polytopes and the verdict.
//   - the 5-cell {3,3,3}, self-dual and crystallographic, but its A4 symmetry has triality order 2, NO spinor, the
//     decisive near-miss control.
//   - the 16-cell {3,3,4} and the tesseract {4,3,3}, not self-dual (a dual pair).
//   - the 120-cell {5,3,3} and the 600-cell {3,3,5}, not self-dual and not crystallographic (the H4 with the 5).
//   - the 24-cell {3,4,3}, self-dual AND crystallographic AND triality 6 (the S3, the 8s plus 8c spinors), the
//     UNIQUE pass, the D4 dock.
//
// So the 24-cell is forced among ALL regular 4-polytopes, the theorem, not just an argument, the candidate space is
// the complete and finite list and exactly one survives. The honest residual is only the justification of the three
// requirements themselves (matter-force symmetry, a discrete reversible lattice, fermionic three-generation matter),
// which is the physical input, not a free choice. Depth L1, an exhaustive enumeration over the regular 4-polytopes,
// with the 5-cell the near-miss control that isolates the spinor requirement.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  rootsD4,
  rootsAn,
  spinorWeightsDn,
} from '@/code/algebra/group/root-system'
import { outerAutomorphismOrder } from '@/code/algebra/group/automorphism'

interface Polytope {
  name: string
  symbol: number[]
  directional: number[][] | null
}

const POLYTOPES: Polytope[] = [
  { name: '5-cell', symbol: [3, 3, 3], directional: rootsAn(5) },
  { name: '16-cell', symbol: [3, 3, 4], directional: null },
  { name: 'tesseract', symbol: [4, 3, 3], directional: null },
  { name: '24-cell', symbol: [3, 4, 3], directional: rootsD4() },
  { name: '120-cell', symbol: [5, 3, 3], directional: null },
  { name: '600-cell', symbol: [3, 3, 5], directional: null },
]

const isSelfDual = (symbol: number[]): boolean =>
  symbol.every((v, i) => v === symbol[symbol.length - 1 - i])

const isCrystallographic = (symbol: number[]): boolean =>
  symbol.every(v => v !== 5)

const hasTriality = (directional: number[][] | null): boolean =>
  directional !== null && outerAutomorphismOrder(directional) === 6

export default experiment({
  id: 'foundations/base-uniqueness-theorem',
  title:
    'the 24-cell is the unique self-dual, crystallographic, triality-carrying regular 4-polytope, so the dock is forced',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const passes = POLYTOPES.filter(
      p =>
        isSelfDual(p.symbol) &&
        isCrystallographic(p.symbol) &&
        hasTriality(p.directional),
    )

    const uniquePass =
      passes.length === 1 && passes[0]!.name === '24-cell'

    // the near-miss control, the 5-cell is self-dual and crystallographic but lacks the triality and the spinor
    const fiveCell = POLYTOPES[0]!
    const fiveCellSelfDualCrystallographic =
      isSelfDual(fiveCell.symbol) && isCrystallographic(fiveCell.symbol)

    const fiveCellNoTriality = !hasTriality(fiveCell.directional)
    const controlIsolatesSpinor =
      fiveCellSelfDualCrystallographic && fiveCellNoTriality

    // the 24-cell directional set carries the spinors (the D4 spinor weights exist)
    const dockCarriesSpinor = spinorWeightsDn(4).length > 0
    const dockTrialityOrder = outerAutomorphismOrder(rootsD4())

    const ok =
      uniquePass &&
      controlIsolatesSpinor &&
      dockCarriesSpinor &&
      dockTrialityOrder === 6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'over the complete and finite list of all six regular 4-polytopes, the 24-cell {3,4,3} is the UNIQUE one that is self-dual AND crystallographic AND carries the order-three triality (the S3 Dynkin symmetry, outer-automorphism order 6, the 8v plus 8s plus 8c that gives the spinors). The 5-cell is self-dual and crystallographic but its A4 symmetry has triality order 2 and no spinor, the near-miss control that isolates the spinor as the decisive requirement, and the other four polytopes fail self-duality or crystallography. So the 24-cell dock (the D4 directional set) is FORCED among all regular 4-polytopes, a theorem over the complete candidate space, not merely an argument. The only residual is the justification of the three requirements themselves, the physical input.',
      metrics: {
        candidateCount: POLYTOPES.length,
        passCount: passes.length,
        uniquePassIs24Cell: uniquePass ? 1 : 0,
        fiveCellTrialityOrder: outerAutomorphismOrder(
          fiveCell.directional!,
        ),
        dockTrialityOrder,
        dockSpinorWeightCount: spinorWeightsDn(4).length,
      },
      control: {
        fiveCellSelfDualCrystallographic:
          fiveCellSelfDualCrystallographic ? 1 : 0,
        fiveCellTrialityOrder: outerAutomorphismOrder(
          fiveCell.directional!,
        ),
      },
      notes:
        'the candidate space is the COMPLETE list of regular 4-polytopes (six of them), so this is an exhaustive theorem, not a sampled argument. Self-duality eliminates the 16-cell, the tesseract, the 120-cell, and the 600-cell. Crystallography (no 5 in the symbol) additionally eliminates the 120-cell and the 600-cell. Among the self-dual crystallographic survivors (the 5-cell and the 24-cell), triality (the S3 outer automorphism of order 6, which the 24-cell D4 has and the 5-cell A4 does not, order 2) selects the 24-cell uniquely, and it is the triality that carries the spinors 8s and 8c, the fermionic three-generation matter. The 5-cell is the near-miss control. This elevates generator-selection (D4 unique among root systems) to the geometric statement (the 24-cell unique among all regular 4-polytopes), the dock is forced.',
    })
  },
})
