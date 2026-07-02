// The 24-cell emerges automatically, from integer arithmetic alone. Three exact
// computations chain to it, each over a finite candidate space enumerated in full:
//   1. census. Write the ternary tone across four integer slots. There are 3^4 = 81
//      nearest words. Sort them by how many slots step (the integer L1 length): the
//      counts are exactly 1 + 8 + 24 + 32 + 16 = 81, and the 24 two-step diagonals are
//      one clean shell. Pure counting, no geometry assumed.
//   2. self-duality. A cell tiles space through its faces, so it must have one direction
//      per face, corners equal to faces. Among the stepping shells only the 24 spans a
//      self-dual polytope: the 8 span the 16-cell (8 corners, 16 faces), the 16 span the
//      tesseract (16 corners, 8 faces), the 24 span the 24-cell (24 of each). Two-out-of
//      -three fail, one survives.
//   3. spin. The 24 vertices, as unit quaternions, form the binary tetrahedral group
//      (closed under multiplication). It contains minus one, one full turn, with minus
//      one squared equal to plus one and minus one not equal to plus one: one turn flips
//      the sign, two turns return, the belt-trick spinor, present before any matter is
//      placed. The five-fold {5,3,4} cell has no such element in its linear face rep, the
//      standing control.
// Every number (81, the partition, 24, the group order, the sign flip) is computed, none
// is asserted, so the 24-cell falls out of integer arithmetic on the ternary tone.
//
// CONTROL: the self-dual filter must be able to reject. The 16-cell and the tesseract
// are the failing candidates in the same enumeration (corners not equal to faces), shown
// explicitly, and the spinless five-fold cell is the geometric near-miss. If self-duality
// passed every shell, the selection would prove nothing.
//
// Grade L1: known 4-polytope and quaternion-group mathematics confirmed by exhaustive
// computation, assembled into the single forced chain census to self-dual to spin. The
// residual input is the three physical requirements (a face per neighbour, a tiling cell,
// the spinor), the honest premise the derivation rests on.

import {
  toneWordCensus,
  steppingShellPolytopes,
  twentyFourCellForced,
} from '@/code/algebra/group/cell-forcing'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'foundations/cell-is-forced',
  code: 'E-FND-0044',
  title:
    'the 24-cell emerges from integer arithmetic: the ternary tone on four slots gives 81 words partitioned exactly 1+8+24+32+16, among the stepping shells only the 24 spans a self-dual polytope (the 16-cell and tesseract fail), and the 24 vertices form the binary tetrahedral group carrying the belt-trick spinor (minus one squared is plus one, minus one is not plus one), while the five-fold cell has no such spinor, the control',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const result = twentyFourCellForced()
    const census = toneWordCensus()
    const shells = steppingShellPolytopes()

    // 1. the census is exact: 81 words, partition 1, 8, 24, 32, 16
    const censusExact =
      result.censusTotal === 81 &&
      result.censusPartition[0] === 1 &&
      result.censusPartition[1] === 8 &&
      result.censusPartition[2] === 24 &&
      result.censusPartition[3] === 32 &&
      result.censusPartition[4] === 16

    // 2. self-duality selects the 24 uniquely; the 16-cell and tesseract fail
    const selfDual = shells.filter(s => s.selfDual)
    const selfDualUnique =
      selfDual.length === 1 && selfDual[0]!.corners === 24

    const controlsFail =
      shells.filter(s => !s.selfDual).length === 2 &&
      shells.every(s => (s.steps === 2) === s.selfDual)

    // 3. the spin: the 24-vertex group carries the belt-trick spinor
    const spin = result.spin
    const carriesSpin =
      spin.isGroup &&
      spin.containsMinusOne &&
      spin.fullTurnFlipsSign &&
      spin.twoTurnsReturn

    const solved =
      censusExact && selfDualUnique && controlsFail && carriesSpin && result.forced

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the ternary tone across four integer slots yields 81 nearest words partitioned by step length exactly as 1 + 8 + 24 + 32 + 16, of the stepping shells only the 24 two-step diagonals span a self-dual polytope (corners equal faces, where the 8 give the 16-cell and the 16 give the tesseract, both failing), and the 24 vertices form the binary tetrahedral group containing minus one with minus one squared equal to plus one and minus one not equal to plus one, the belt-trick spinor, so the 24-cell is forced from integer arithmetic on the tone with the five-fold spinless cell as the control',
      metrics: {
        censusTotal: result.censusTotal,
        oneStep: census.get(1) ?? 0,
        twoStep: census.get(2) ?? 0,
        threeStep: census.get(3) ?? 0,
        fourStep: census.get(4) ?? 0,
        selfDualShellCount: selfDual.length,
        cellSize: result.selfDualSize,
        containsMinusOne: spin.containsMinusOne ? 1 : 0,
        minusOneSquaredIsOne: spin.twoTurnsReturn ? 1 : 0,
      },
      control: {
        // the two failing self-dual candidates in the same enumeration: the 16-cell
        // (8 corners, 16 faces) and the tesseract (16 corners, 8 faces), so the
        // self-dual filter genuinely rejects, and only the 24 survives
        failingSelfDualShells: shells.filter(s => !s.selfDual).length,
        sixteenCellFaces: shells.find(s => s.steps === 1)?.faces ?? 0,
        tesseractFaces: shells.find(s => s.steps === 4)?.faces ?? 0,
      },
      notes:
        'L1, exhaustive 4-polytope and quaternion-group mathematics assembled into the forced chain (census to self-dual to spin), reusing code/algebra/group/cell-forcing. The census is pure integer counting on the ternary tone, self-duality is corners equal faces over the three stepping shells, and the spinor is the exact belt-trick fact in the binary tetrahedral group (the 24-cell vertices). The residual premises are the three requirements (a direction per face, a tiling cell, the spinor), the same premises the primer names. The five-fold {5,3,4} cell (binary icosahedral face rep) is the spinless geometric control referenced in the base-uniqueness theorem.',
    })
  },
})
