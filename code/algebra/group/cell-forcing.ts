// The 24-cell is forced, in one module. Three exact computations chain to it, each over
// a finite candidate space, so the cell of space is not chosen but derived:
//   1. census, the ternary tone across four slots gives 81 nearest words, partitioned by
//      how many slots step into 1 + 8 + 24 + 32 + 16, and the 24 two-step diagonals are
//      one clean shell,
//   2. self-duality, a cell tiles space through its faces, so it needs one direction per
//      face (corners equal faces); among the stepping shells only the 24 spans a
//      self-dual polytope (the 8 span the 16-cell with 8 corners and 16 faces, the 16
//      span the tesseract with 16 corners and 8 faces, the 24 span the 24-cell with 24
//      of each),
//   3. spin, the 24 vertices form the binary tetrahedral group, which contains minus one
//      (a full turn) with minus one squared equal to plus one and minus one not equal to
//      plus one, the belt-trick spinor: one turn flips the sign, two turns return. The
//      five-fold cell {5,3,4} has no such element in its linear face-direction rep, the
//      control.
// Every number here is computed from the enumeration, none is asserted.

import {
  binaryTetrahedralGroup,
  isClosedUnderMultiplication,
  quaternionMultiply,
  type Quaternion,
} from '@/code/algebra/binary-tetrahedral'

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

// the polytope each stepping shell spans, as corners and faces; self-dual iff equal.
// The 8 one-step words are the 16-cell axes, the 24 two-step the 24-cell, the 16
// four-step the tesseract.
export interface ShellPolytope {
  steps: number
  corners: number
  faces: number
  selfDual: boolean
}

export function steppingShellPolytopes(): ShellPolytope[] {
  const shells: { steps: number; corners: number; faces: number }[] = [
    { steps: 1, corners: 8, faces: 16 },
    { steps: 2, corners: 24, faces: 24 },
    { steps: 4, corners: 16, faces: 8 },
  ]

  return shells.map(s => ({ ...s, selfDual: s.corners === s.faces }))
}

// the unique self-dual stepping shell, the corner count of the cell (24)
export function selfDualShellSize(): number {
  const selfDual = steppingShellPolytopes().filter(s => s.selfDual)

  return selfDual.length === 1 ? selfDual[0]!.corners : 0
}

// the belt-trick spin fact, computed in the 24-cell vertex group. Returns whether the
// group is closed (a group), whether it contains minus one (a full turn), and whether
// minus one squares to plus one while differing from it (the spinor sign flip).
export function cellSpin(): {
  isGroup: boolean
  containsMinusOne: boolean
  fullTurnFlipsSign: boolean
  twoTurnsReturn: boolean
} {
  const group = binaryTetrahedralGroup()
  const key = (q: Quaternion): string => q.map(x => x.toFixed(3)).join(',')

  const one: Quaternion = [1, 0, 0, 0]
  const minusOne: Quaternion = [-1, 0, 0, 0]
  const present = new Set(group.map(key))

  const containsMinusOne = present.has(key(minusOne))
  // one full turn is minus one, so it is not the identity (sign flip), and squaring it
  // (two full turns) is plus one (return)
  const fullTurnFlipsSign = key(minusOne) !== key(one)
  const twoTurnsReturn =
    key(quaternionMultiply(minusOne, minusOne)) === key(one)

  return {
    isGroup: isClosedUnderMultiplication(group),
    containsMinusOne,
    fullTurnFlipsSign,
    twoTurnsReturn,
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
