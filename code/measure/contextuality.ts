// The Peres-Mermin magic square: state-independent quantum contextuality, computed on the two-qubit Pauli
// algebra (which is the {3,4,3,4} cell's own quaternion algebra, the binary tetrahedral group). Nine two-qubit
// observables in a 3x3 grid, each an involution with +-1 outcomes. Within each row and each column the three
// observables commute and multiply to +I, except the third column which multiplies to -I. That single sign makes
// any noncontextual value assignment (one fixed +-1 per observable, shared across its contexts) unable to satisfy
// all six contexts: the best classical magic-square value is 4, while quantum mechanics reaches 6. Both numbers
// are COMPUTED here, the 6 from the actual operator products, the 4 by brute force over the 512 assignments, so
// nothing is assumed. Reused by the contextuality experiment, kept here so the experiment stays thin.

import {
  pauli,
  cmKron,
  cmMultiply,
  cmCommutator,
  cmIsScalar,
  type ComplexMatrix,
} from '@/code/algebra/group/clifford'
import { complex } from '@/code/algebra/linear/complex'

const PAULI = pauli()
const I2 = PAULI[0]!
const X = PAULI[1]!
const Y = PAULI[2]!
const Z = PAULI[3]!

// the 3x3 Peres-Mermin grid of two-qubit observables
function square(): ComplexMatrix[][] {
  return [
    [cmKron(X, I2), cmKron(I2, X), cmKron(X, X)],
    [cmKron(I2, Y), cmKron(Y, I2), cmKron(Y, Y)],
    [cmKron(X, Y), cmKron(Y, X), cmKron(Z, Z)],
  ]
}

// the product of three two-qubit observables, then its scalar sign (+1 if the product is +I, -1 if -I)
function contextSign(ops: ComplexMatrix[]): number {
  const product = cmMultiply(cmMultiply(ops[0]!, ops[1]!), ops[2]!)

  if (cmIsScalar(product, complex({ re: 1, im: 0 }))) {
    return 1
  }

  if (cmIsScalar(product, complex({ re: -1, im: 0 }))) {
    return -1
  }

  return 0 // not a scalar multiple of the identity (should not happen in this square)
}

const ZERO_MATRIX = complex({ re: 0, im: 0 })

export function peresMerminSquare(): {
  allInvolutions: boolean
  rowsCommute: boolean
  colsCommute: boolean
  rowSigns: number[]
  colSigns: number[]
  quantumValue: number
  noncontextualBound: number
} {
  const grid = square()
  const rows = grid
  const cols = [0, 1, 2].map(j => [
    grid[0]![j]!,
    grid[1]![j]!,
    grid[2]![j]!,
  ])

  // every observable squares to the identity (an involution, +-1 spectrum)
  const allInvolutions = grid
    .flat()
    .every(o => cmIsScalar(cmMultiply(o, o), complex({ re: 1, im: 0 })))

  // observables within each context commute (so they are jointly measurable)
  const commute = (ctx: ComplexMatrix[]): boolean =>
    cmIsScalar(cmCommutator(ctx[0]!, ctx[1]!), ZERO_MATRIX) &&
    cmIsScalar(cmCommutator(ctx[0]!, ctx[2]!), ZERO_MATRIX) &&
    cmIsScalar(cmCommutator(ctx[1]!, ctx[2]!), ZERO_MATRIX)

  const rowsCommute = rows.every(commute)
  const colsCommute = cols.every(commute)

  const rowSigns = rows.map(contextSign)
  const colSigns = cols.map(contextSign)

  // the magic-square value: sum of the six context products, with the third column entering with the sign that
  // makes the quantum value maximal. We use the column signs directly so the formula is symmetric: the quantum
  // value is the sum of (each context's QM product = its operator sign), arranged as rows plus columns where the
  // third column's -I is what forbids a consistent classical assignment.
  // quantum: each context product equals its operator sign (+-1)
  const quantumValue =
    rowSigns.reduce((s, v) => s + v, 0) +
    colSigns[0]! +
    colSigns[1]! -
    colSigns[2]!

  // noncontextual bound: brute force over all 2^9 assignments of +-1 to the nine observables (one value per
  // observable, shared across the contexts it sits in), maximizing the same magic-square combination. The QM
  // value 6 is unreachable classically; the maximum comes out 4.
  let noncontextualBound = -Infinity

  const value = new Array<number>(9)

  for (let mask = 0; mask < 512; mask++) {
    for (let b = 0; b < 9; b++) {
      value[b] = (mask >> b) & 1 ? 1 : -1
    }

    const at = (r: number, col: number): number => value[r * 3 + col]!
    const rowProd = (r: number): number =>
      at(r, 0) * at(r, 1) * at(r, 2)

    const colProd = (col: number): number =>
      at(0, col) * at(1, col) * at(2, col)

    const score =
      rowProd(0) +
      rowProd(1) +
      rowProd(2) +
      colProd(0) +
      colProd(1) -
      colProd(2)

    if (score > noncontextualBound) {
      noncontextualBound = score
    }
  }

  return {
    allInvolutions,
    rowsCommute,
    colsCommute,
    rowSigns,
    colSigns,
    quantumValue,
    noncontextualBound,
  }
}
