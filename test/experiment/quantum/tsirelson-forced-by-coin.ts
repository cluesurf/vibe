// Is the quantum value forced by the coin, or fine-tuned?
//
// The routes-to-flat survey left one sub-problem on the origin channel: a
// correlation set at the origin is flat (E-QTM-0036) and the rule preserves it
// (E-QTM-0030), but is the origin's correlation forced by the geometry or tuned by
// hand? This separates the question into two parts and answers the sharp one.
//
// The MAXIMUM strength a quantum correlation can reach, the Tsirelson bound 2 root
// 2, follows from ANTICOMMUTATION, in any qubit theory (Tsirelson 1980, Landau
// 1987): observables that anticommute reach the CHSH value 2 root 2, the quantum
// maximum, and observables that COMMUTE reach only the classical bound 2. The 24
// directions of {3,4,3,4} are the binary tetrahedral group 2T, the unit Hurwitz
// quaternions, and its units anticommute (i times j is k, j times i is minus k), so
// the committed coin PROVIDES an anticommuting pair. The coin is not load-bearing
// for the bound itself, any structure with an anticommuting pair would do. What is
// shown is that the coin has the required pair, so the quantum maximum is available
// to it without tuning.
//
// What is NOT forced, and is reported honestly: WHICH correlation the origin imprints
// is free, because the reversible rule preserves any imprinted pattern (E-QTM-0030).
// So the fine-tuning, if there is any, lives in the choice of the origin pattern, not
// in the maximum strength.
//
// Grade L1: it verifies the known anticommutation-to-Tsirelson relation (standard
// quantum mathematics) and checks the committed coin contains an anticommuting
// pair, with a commuting control that gives the classical bound. Exact.

import {
  quaternion,
  multiply,
  binaryTetrahedral,
  Quaternion,
} from '@/code/algebra/group/quaternion'
import { jacobiEigenvalues } from '@/code/algebra/linear/eig-jacobi'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const TSIRELSON = 2 * Math.SQRT2

type Matrix = number[][]

function kron(a: Matrix, b: Matrix): Matrix {
  const n = a.length
  const m = b.length
  const out: Matrix = Array.from({ length: n * m }, () =>
    new Array<number>(n * m).fill(0),
  )

  for (let p = 0; p < n; p++) {
    for (let q = 0; q < n; q++) {
      for (let r = 0; r < m; r++) {
        for (let s = 0; s < m; s++) {
          out[p * m + r]![q * m + s] =
            (a[p]?.[q] ?? 0) * (b[r]?.[s] ?? 0)
        }
      }
    }
  }

  return out
}

function combine(parts: { matrix: Matrix; weight: number }[]): Matrix {
  const size = parts[0]!.matrix.length
  const out: Matrix = Array.from({ length: size }, () =>
    new Array<number>(size).fill(0),
  )

  for (const part of parts) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++)
        out[i]![j]! += part.weight * (part.matrix[i]?.[j] ?? 0)
    }
  }

  return out
}

// The CHSH operator C = A x B + A x B' + A' x B - A' x B', and its operator norm
// (the largest absolute eigenvalue), the maximal CHSH value the observables reach.
function chshNorm(a: Matrix, aPrime: Matrix): number {
  const s = 1 / Math.SQRT2
  const b: Matrix = [
    [s, s],
    [s, -s],
  ] // (sz + sx)/root2

  const bPrime: Matrix = [
    [s, -s],
    [-s, -s],
  ] // (sz - sx)/root2

  const operator = combine([
    { matrix: kron(a, b), weight: 1 },
    { matrix: kron(a, bPrime), weight: 1 },
    { matrix: kron(aPrime, b), weight: 1 },
    { matrix: kron(aPrime, bPrime), weight: -1 },
  ])

  return Math.max(...jacobiEigenvalues(operator).map(Math.abs))
}

function anticommute(left: Quaternion, right: Quaternion): boolean {
  const a = multiply(left, right)
  const b = multiply(right, left)

  return (
    Math.abs(a.w + b.w) < 1e-12 &&
    Math.abs(a.x + b.x) < 1e-12 &&
    Math.abs(a.y + b.y) < 1e-12 &&
    Math.abs(a.z + b.z) < 1e-12 &&
    a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w > 0.5
  )
}

export default experiment({
  id: 'quantum/tsirelson-forced-by-coin',
  code: 'E-QTM-0038',
  title:
    'the Tsirelson bound 2 root 2 follows from anticommutation in any qubit theory (Tsirelson 1980, Landau 1987), commuting structure gives only the classical bound 2, and the {3,4,3,4} coin quaternion units provide an anticommuting pair, so the quantum maximum is available to the coin without tuning',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    // The committed coin is the 24 binary-tetrahedral quaternion units. Confirm two
    // of them anticommute (the i and j units), the geometric fact behind 2 root 2.
    const units = binaryTetrahedral()
    const i = quaternion(0, 1, 0, 0)
    const j = quaternion(0, 0, 1, 0)
    const haveI = units.some(
      u =>
        Math.abs(u.x - 1) < 1e-9 &&
        Math.abs(u.w) < 1e-9 &&
        Math.abs(u.y) < 1e-9 &&
        Math.abs(u.z) < 1e-9,
    )

    const haveJ = units.some(
      u =>
        Math.abs(u.y - 1) < 1e-9 &&
        Math.abs(u.w) < 1e-9 &&
        Math.abs(u.x) < 1e-9 &&
        Math.abs(u.z) < 1e-9,
    )

    const coinUnitsAnticommute = haveI && haveJ && anticommute(i, j)

    // Anticommuting observables (the 2x2 reps of two anticommuting coin units) reach
    // the Tsirelson value.
    const sz: Matrix = [
      [1, 0],
      [0, -1],
    ]

    const sx: Matrix = [
      [0, 1],
      [1, 0],
    ]

    const anticommutingChsh = chshNorm(sz, sx)

    // Commuting observables (the same observable twice) reach only the classical bound.
    const commutingChsh = chshNorm(sz, sz)

    const tsirelsonForced =
      Math.abs(anticommutingChsh - TSIRELSON) < 1e-6

    const classicalWhenCommuting = Math.abs(commutingChsh - 2) < 1e-6

    const solved =
      coinUnitsAnticommute && tsirelsonForced && classicalWhenCommuting

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the maximal quantum correlation, the Tsirelson bound 2 root 2, follows from anticommutation in any qubit theory: anticommuting observables reach 2 root 2 while commuting observables reach only the classical bound 2, and the committed coin quaternion units (24-cell, binary tetrahedral) contain an anticommuting pair, so the quantum maximum is available to the coin without a fine-tuned input',
      metrics: {
        anticommutingChsh,
        commutingChsh,
        tsirelson: TSIRELSON,
        classicalBound: 2,
        coinUnitsAnticommute: coinUnitsAnticommute ? 1 : 0,
      },
      control: {
        // The commuting case is the control: without the coin anticommutation the
        // CHSH cannot exceed the classical bound 2. The quantum value appears only
        // with the anticommuting structure the coin supplies. If commuting
        // observables also reached 2 root 2, the value would not be the coin's doing.
        commutingChsh,
      },
      notes:
        'L1, exact. The bound is standard quantum mathematics: Tsirelson (Lett. Math. Phys. 4, 93 (1980)) proved 2 root 2 is the quantum CHSH maximum, and Landau (Phys. Lett. A 120, 54 (1987)) showed it follows from the anticommutation structure of the observables in any qubit theory, so anticommuting observables reach it and commuting ones stay at the classical 2. The substrate content here is only that the 24 directions of {3,4,3,4}, the binary tetrahedral quaternion units, CONTAIN an anticommuting pair (i j = k, j i = minus k), so the coin provides the required structure rather than forcing the bound, any anticommuting pair would give the same value. The CHSH operator norm is computed by Jacobi eigenvalues. This concerns the maximal STRENGTH (2 root 2). It does NOT force WHICH correlation the origin imprints, which is free because the reversible rule preserves any imprinted pattern (E-QTM-0030). So the fine-tuning, if any, lives in the origin pattern choice, not in the maximum strength.',
    })
  },
})
