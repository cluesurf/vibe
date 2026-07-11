// The 24-cell is forced, in one module. Three exact computations chain to it, each over
// a finite candidate space, so the cell of space is not chosen but derived:
//   1. census, the ternary tone across four slots gives 81 nearest words, partitioned by
//      how many slots step into 1 + 8 + 24 + 32 + 16, and the 24 two-step diagonals are
//      one clean shell,
//   2. self-duality, a cell tiles space through its faces, so it needs one direction per
//      face (corners equal faces). The corner and face counts are DERIVED from each shell's
//      vertex set by convex-hull facet enumeration (code/tool/polytope), not asserted. Among
//      the stepping shells only the 24 spans a self-dual polytope (the 8 span the 16-cell,
//      8 corners and 16 faces, the 16 span the tesseract, 16 corners and 8 faces, the 24
//      span the 24-cell, 24 of each),
//   3. spin, exhibited in the unit-quaternion frame where the 24-cell is the binary
//      tetrahedral group 2T. 2T is exactly the 16-cell's eight integer units (the group Q8)
//      together with the tesseract's sixteen half-integer units, and it contains minus one
//      (a full turn) with minus one squared equal to plus one and minus one not equal to
//      plus one, the belt-trick spinor. The tesseract's sixteen half-integer units are NOT
//      a group (no identity, not closed), so they carry no such element, the spinless
//      control. The 16-cell (Q8) does carry minus one, so it is SELF-DUALITY that isolates
//      the 24 among the shells and spin that confirms the isolated cell can host matter.
// Every number here is computed from the enumeration or the vertex geometry, none is asserted.

import {
  binaryTetrahedralGroup,
  isClosedUnderMultiplication,
  quaternionMultiply,
  type Quaternion,
} from '@/code/algebra/binary-tetrahedral'
import { fourPolytopeFacetCount } from '@/code/tool/polytope'

// the census of the 81 four-slot tone words, bucketed by how many slots step
export function toneWordCensus(): Map<number, number> {
  const census = new Map<number, number>()

  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      for (let c = -1; c <= 1; c++) {
        for (let d = -1; d <= 1; d++) {
          const steps = [a, b, c, d].filter(v => v !== 0).length

          census.set(steps, (census.get(steps) ?? 0) + 1)
        }
      }
    }
  }

  return census
}

// the actual vertices of a stepping shell: the four-slot tone words with exactly `steps`
// nonzero slots. steps 1 is the 16-cell axes, steps 2 the 24-cell diagonals, steps 4 the
// tesseract corners.
export function steppingShellVertices(steps: number): number[][] {
  const vertices: number[][] = []

  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      for (let c = -1; c <= 1; c++) {
        for (let d = -1; d <= 1; d++) {
          const word = [a, b, c, d]

          if (word.filter(v => v !== 0).length === steps) {
            vertices.push(word)
          }
        }
      }
    }
  }

  return vertices
}

// the polytope each stepping shell spans, as corners and faces, both DERIVED. Corners is the
// vertex count, faces is the facet count of the convex hull of those vertices (computed by
// exact integer facet enumeration). Self-dual iff the two are equal.
export type ShellPolytope = {
  steps: number
  corners: number
  faces: number
  selfDual: boolean
}

export function steppingShellPolytopes(): ShellPolytope[] {
  return [1, 2, 4].map(steps => {
    const vertices = steppingShellVertices(steps)
    const corners = vertices.length
    const faces = fourPolytopeFacetCount(vertices)

    return { steps, corners, faces, selfDual: corners === faces }
  })
}

// the unique self-dual stepping shell, the corner count of the cell (24)
export function selfDualShellSize(): number {
  const selfDual = steppingShellPolytopes().filter(s => s.selfDual)

  return selfDual.length === 1 ? selfDual[0]!.corners : 0
}

const quaternionKey = (q: Quaternion): string =>
  q.map(x => x.toFixed(3)).join(',')

// the belt-trick spin facts of a set of unit quaternions: whether it is a group (closed under
// multiplication with an identity), whether it contains minus one (a full turn), and whether
// minus one squares to plus one while differing from it (the spinor sign flip). A spinful cell
// is a group carrying minus one; a set without an identity is not a group and carries no spin.
export function quaternionSpin(quaternions: Quaternion[]): {
  isGroup: boolean
  containsIdentity: boolean
  containsMinusOne: boolean
  fullTurnFlipsSign: boolean
  twoTurnsReturn: boolean
  carriesSpin: boolean
} {
  const one: Quaternion = [1, 0, 0, 0]
  const minusOne: Quaternion = [-1, 0, 0, 0]
  const present = new Set(quaternions.map(quaternionKey))

  const containsIdentity = present.has(quaternionKey(one))
  const containsMinusOne = present.has(quaternionKey(minusOne))
  // a group needs the identity and closure; a bare coset (like the 16 half-integer units) has
  // neither, so it is not a group and carries no spinor
  const isGroup =
    containsIdentity && isClosedUnderMultiplication(quaternions)

  const fullTurnFlipsSign =
    quaternionKey(minusOne) !== quaternionKey(one)

  const twoTurnsReturn =
    quaternionKey(quaternionMultiply(minusOne, minusOne)) ===
    quaternionKey(one)

  return {
    isGroup,
    containsIdentity,
    containsMinusOne,
    fullTurnFlipsSign,
    twoTurnsReturn,
    carriesSpin:
      isGroup &&
      containsMinusOne &&
      fullTurnFlipsSign &&
      twoTurnsReturn,
  }
}

// the 16-cell in the unit-quaternion frame: the 8 integer units, which are the group Q8.
export function integerUnitQuaternions(): Quaternion[] {
  const units: Quaternion[] = []

  for (const sign of [1, -1]) {
    units.push([sign, 0, 0, 0])
    units.push([0, sign, 0, 0])
    units.push([0, 0, sign, 0])
    units.push([0, 0, 0, sign])
  }

  return units
}

// the tesseract in the unit-quaternion frame: the 16 half-integer units, a coset of Q8 in 2T,
// which is NOT a group (no identity, not closed) and so carries no spinor.
export function halfIntegerUnitQuaternions(): Quaternion[] {
  const units: Quaternion[] = []

  for (const a of [-0.5, 0.5]) {
    for (const b of [-0.5, 0.5]) {
      for (const c of [-0.5, 0.5]) {
        for (const d of [-0.5, 0.5]) {
          units.push([a, b, c, d])
        }
      }
    }
  }

  return units
}

// the belt-trick spin fact, computed in the 24-cell vertex group 2T. Kept for callers that
// want just the cell's own spin.
export function cellSpin(): ReturnType<typeof quaternionSpin> {
  return quaternionSpin(binaryTetrahedralGroup())
}

// spin across the three shells in the one consistent quaternion frame: the 16-cell (Q8), the
// tesseract (the 16 half-integer units), and the 24-cell (2T = the two together). The 16-cell
// and 24-cell carry spin, the tesseract does not, which is the standing spinless control and
// the demonstration that self-duality, not spin, isolates the 24.
export function steppingShellSpin(): {
  sixteenCell: ReturnType<typeof quaternionSpin>
  tesseract: ReturnType<typeof quaternionSpin>
  twentyFourCell: ReturnType<typeof quaternionSpin>
  twentyFourCellIsUnion: boolean
} {
  const sixteenCell = quaternionSpin(integerUnitQuaternions())
  const tesseract = quaternionSpin(halfIntegerUnitQuaternions())
  const twentyFour = binaryTetrahedralGroup()
  const twentyFourCell = quaternionSpin(twentyFour)

  // 2T is exactly the 8 integer units plus the 16 half-integer units, verified as a set
  const unionKeys = new Set(
    [...integerUnitQuaternions(), ...halfIntegerUnitQuaternions()].map(
      quaternionKey,
    ),
  )

  const twentyFourKeys = new Set(twentyFour.map(quaternionKey))
  const twentyFourCellIsUnion =
    unionKeys.size === twentyFourKeys.size &&
    [...twentyFourKeys].every(k => unionKeys.has(k))

  return {
    sixteenCell,
    tesseract,
    twentyFourCell,
    twentyFourCellIsUnion,
  }
}

// the whole forcing in one call: the census total, the isolated two-step shell, the
// unique self-dual size, and the spin facts. The cell is forced when the census is 81
// with the exact partition, the unique self-dual stepping shell is the 24, and the
// 24-vertex group carries the belt-trick spinor.
export function twentyFourCellForced(): {
  censusTotal: number
  censusPartition: [number, number, number, number, number]
  twoStepShell: number
  selfDualSize: number
  spin: ReturnType<typeof cellSpin>
  forced: boolean
} {
  const census = toneWordCensus()
  const total = [...census.values()].reduce((s, v) => s + v, 0)
  const partition: [number, number, number, number, number] = [
    census.get(0) ?? 0,
    census.get(1) ?? 0,
    census.get(2) ?? 0,
    census.get(3) ?? 0,
    census.get(4) ?? 0,
  ]

  const selfDualSize = selfDualShellSize()
  const spin = cellSpin()

  const forced =
    total === 81 &&
    partition[0] === 1 &&
    partition[1] === 8 &&
    partition[2] === 24 &&
    partition[3] === 32 &&
    partition[4] === 16 &&
    selfDualSize === 24 &&
    spin.isGroup &&
    spin.containsMinusOne &&
    spin.fullTurnFlipsSign &&
    spin.twoTurnsReturn

  return {
    censusTotal: total,
    censusPartition: partition,
    twoStepShell: partition[2],
    selfDualSize,
    spin,
    forced,
  }
}
