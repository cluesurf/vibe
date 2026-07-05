// The 24-cell emerges automatically, from integer arithmetic alone. Three exact
// computations chain to it, each over a finite candidate space enumerated in full:
//   1. census. Write the ternary tone across four integer slots. There are 3^4 = 81
//      nearest words. Sort them by how many slots step (the integer L1 length): the
//      counts are exactly 1 + 8 + 24 + 32 + 16 = 81, and the 24 two-step diagonals are
//      one clean shell. Pure counting, no geometry assumed.
//   2. self-duality. A cell tiles space through its faces, so it must have one direction
//      per face, corners equal to faces. Corner and face counts are DERIVED from each
//      shell's vertex set by exact convex-hull facet enumeration (no hardcoded table).
//      Among the stepping shells only the 24 spans a self-dual polytope: the 8 span the
//      16-cell (8 corners, 16 faces), the 16 span the tesseract (16 corners, 8 faces), the
//      24 span the 24-cell (24 of each). Two of three fail, one survives.
//   3. spin. In the unit-quaternion frame the 24-cell is the binary tetrahedral group 2T,
//      which is exactly the 16-cell (the 8 integer units, Q8) together with the tesseract
//      (the 16 half-integer units). 2T is a group containing minus one with minus one
//      squared equal to plus one and minus one not equal to plus one, the belt-trick
//      spinor. The tesseract's 16 half-integer units are NOT a group (no identity, not
//      closed), the spinless control. The 16-cell (Q8) also carries minus one, so it is
//      SELF-DUALITY that isolates the 24 among the shells, and spin that confirms the
//      isolated cell can host matter (which the tesseract cannot).
// Every number (81, the partition, the face vectors, the group order, the sign flip) is
// computed, none is asserted, so the 24-cell falls out of integer arithmetic on the tone.
//
// CONTROLS, two, both run. The self-dual filter must reject: the 16-cell and the tesseract
// fail corners-equal-faces in the same enumeration, from derived face counts. The spin
// filter must reject: the tesseract's half-integer units are not a group and carry no minus
// one. If self-duality passed every shell, or spin held for every shell, the selection would
// prove nothing.
//
// Grade L1: known 4-polytope and quaternion-group mathematics confirmed by exhaustive
// computation, assembled into the single forced chain census to self-dual to spin.

import {
  toneWordCensus,
  steppingShellPolytopes,
  steppingShellSpin,
  twentyFourCellForced,
} from '@/code/algebra/group/cell-forcing'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the known face vectors of the three regular 4-polytopes, the oracle the derived facet
// counts are checked against (16-cell 8/16, 24-cell 24/24, tesseract 16/8)
const KNOWN_FACE_VECTOR: Record<number, { corners: number; faces: number }> = {
  1: { corners: 8, faces: 16 },
  2: { corners: 24, faces: 24 },
  4: { corners: 16, faces: 8 },
}

export default experiment({
  id: 'foundations/cell-is-forced',
  code: 'E-FND-0044',
  title:
    'the 24-cell emerges from integer arithmetic: the ternary tone on four slots gives 81 words partitioned exactly 1+8+24+32+16, among the stepping shells only the 24 spans a self-dual polytope (corners equal faces, DERIVED by facet enumeration, the 16-cell and tesseract fail), and the 24 vertices form the binary tetrahedral group 2T carrying the belt-trick spinor, while the tesseract carries no spinor, the control',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const result = twentyFourCellForced()
    const census = toneWordCensus()
    const shells = steppingShellPolytopes()
    const spin = steppingShellSpin()

    // 1. the census is exact: 81 words, partition 1, 8, 24, 32, 16
    const censusExact =
      result.censusTotal === 81 &&
      result.censusPartition[0] === 1 &&
      result.censusPartition[1] === 8 &&
      result.censusPartition[2] === 24 &&
      result.censusPartition[3] === 32 &&
      result.censusPartition[4] === 16

    // 2. self-duality selects the 24 uniquely; the 16-cell and tesseract fail. The corner
    // and face counts are derived, and they match the known face vectors (the oracle).
    const selfDual = shells.filter(s => s.selfDual)
    const selfDualUnique =
      selfDual.length === 1 && selfDual[0]!.corners === 24
    const facetsMatchOracle = shells.every(
      s =>
        s.corners === KNOWN_FACE_VECTOR[s.steps]!.corners &&
        s.faces === KNOWN_FACE_VECTOR[s.steps]!.faces,
    )
    const selfDualControlRejects =
      shells.filter(s => !s.selfDual).length === 2

    // 3. spin. The 24-cell (2T) carries the belt-trick spinor and is exactly the union of
    // the 16-cell and the tesseract. The tesseract carries no spinor, the spin control.
    const cellCarriesSpin = spin.twentyFourCell.carriesSpin
    const twentyFourIsUnion = spin.twentyFourCellIsUnion
    const spinControlRejects = !spin.tesseract.carriesSpin
    // self-duality, not spin, isolates the 24: the 16-cell is spinful yet not self-dual
    const spinAloneDoesNotIsolate =
      spin.sixteenCell.carriesSpin &&
      !shells.find(s => s.steps === 1)!.selfDual

    const solved =
      censusExact &&
      selfDualUnique &&
      facetsMatchOracle &&
      selfDualControlRejects &&
      cellCarriesSpin &&
      twentyFourIsUnion &&
      spinControlRejects &&
      spinAloneDoesNotIsolate &&
      result.forced

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the ternary tone across four integer slots yields 81 nearest words partitioned by step length exactly as 1 + 8 + 24 + 32 + 16, and of the stepping shells only the 24 two-step diagonals span a self-dual polytope with corners equal to faces, where the corner and face counts are derived from the vertices by exact facet enumeration (the 8 give the 16-cell 8/16 and the 16 give the tesseract 16/8, both failing). In the unit-quaternion frame the 24-cell is the binary tetrahedral group 2T, exactly the 16-cell (Q8) united with the tesseract (the half-integer units), and it carries the belt-trick spinor (minus one, minus one squared plus one, minus one not plus one), while the tesseract alone is not a group and carries no spinor. So the 24-cell is forced from integer arithmetic on the tone: self-duality isolates it and spin confirms it hosts matter, with the tesseract the spinless control.',
      metrics: {
        censusTotal: result.censusTotal,
        oneStep: census.get(1) ?? 0,
        twoStep: census.get(2) ?? 0,
        threeStep: census.get(3) ?? 0,
        fourStep: census.get(4) ?? 0,
        selfDualShellCount: selfDual.length,
        cellSize: result.selfDualSize,
        sixteenCellFaces: shells.find(s => s.steps === 1)?.faces ?? 0,
        cellFaces: shells.find(s => s.steps === 2)?.faces ?? 0,
        tesseractFaces: shells.find(s => s.steps === 4)?.faces ?? 0,
        cellCarriesSpin: cellCarriesSpin ? 1 : 0,
        sixteenCellCarriesSpin: spin.sixteenCell.carriesSpin ? 1 : 0,
        tesseractCarriesSpin: spin.tesseract.carriesSpin ? 1 : 0,
      },
      control: {
        // the two failing self-dual candidates in the same enumeration (derived faces),
        // and the spinless tesseract, so both filters genuinely reject
        failingSelfDualShells: shells.filter(s => !s.selfDual).length,
        tesseractIsGroup: spin.tesseract.isGroup ? 1 : 0,
        tesseractContainsMinusOne: spin.tesseract.containsMinusOne ? 1 : 0,
      },
      notes:
        'L1, exhaustive 4-polytope and quaternion-group mathematics assembled into the forced chain (census to self-dual to spin), reusing code/algebra/group/cell-forcing and code/tool/polytope. The corner and face counts are now DERIVED from each shell vertex set by convex-hull facet enumeration and cross-checked against the known face vectors, not read from a table. Self-duality is the isolating filter (only the two-step 24-cell has corners equal faces); spin is a confirming property (the 16-cell also carries the quaternion minus one, but fails self-duality, and the tesseract fails both), so the honest logical structure is self-duality isolates, spin confirms, tesseract controls. The residual premises are the three requirements (a direction per face, a tiling cell, the spinor).',
    })
  },
})
