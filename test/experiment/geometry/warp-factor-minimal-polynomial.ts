// The warp factor has an EXACT closed form, a cubic, derived memory-optimally by the cone-type
// transfer matrix. This closes the one piece the hardening left open.
//
// The problem. The {3,4,3,4} growth rate (the warp factor, the RG fixed point) was pinned only
// numerically, near 18.278, because enumerating shells to get more digits runs out of memory (shell
// six is fifty million cells). An earlier fit even suggested the value was algebraic of degree at
// least four.
//
// The solution. By Cannon's theorem the cells fall into finitely many CONE TYPES, and for {3,4,3,4}
// the type is just the back-degree (one, two, or three neighbours in the previous shell), which is
// complete at every shell. So a single build to shell four (about 162000 cells, no memory problem)
// gives the three type vectors, and they solve the 3x3 integer transfer matrix
//   M = [[15, 11, 9], [4, 4, 3], [0, 1, 2]],
// whose characteristic polynomial is the EXACT minimal polynomial of the warp factor:
//   lambda^3 - 21 lambda^2 + 51 lambda - 23 = 0.
// The warp factor is its largest root, 18.278707774..., and it is degree THREE (a cubic with no
// rational root, so irreducible), correcting the earlier degree-four guess, which was an artifact of
// fitting through the anomalous single-cell seed shell. The matrix gives the shell counts by the
// recurrence s(n) = 21 s(n-1) - 51 s(n-2) + 23 s(n-3), which reproduces the measured shell five
// (2800344) exactly and predicts shell six (51187080) with no enumeration at all.
//
// CONTROL: the recurrence must reproduce the independently measured shell counts. It reproduces
// shell four and shell five exactly (shell five was measured by a separate large build), so the
// matrix is the true transfer matrix, not a coincidental fit, and the cubic is the true minimal
// polynomial. A wrong matrix would miss shell five.
//
// Depth L2, the cone-type transfer matrix (a standard coordination-sequence technique) applied to
// the actual honeycomb to give the exact algebraic value of the warp factor, memory-optimally.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  shellTypeVectors,
  coneTypeTransferMatrix,
  characteristicPolynomialCubic,
  largestCubicRoot,
} from '@/code/measure/coordination-transfer'

const MAX_CELLS = 170000
// the independently measured shell counts (the last two by separate builds), the control the
// recurrence must reproduce
const MEASURED_SHELLS = [1, 24, 456, 8376, 153192, 2800344]

export default experiment({
  id: 'geometry/warp-factor-minimal-polynomial',
  code: 'E-GMT-0031',
  title:
    'the warp factor has an exact closed form, a cubic: the {3,4,3,4} cone-type transfer matrix [[15,11,9],[4,4,3],[0,1,2]] (read from one shell-four build) has characteristic polynomial lambda^3 - 21 lambda^2 + 51 lambda - 23 = 0, whose largest root 18.2787 is the growth rate, degree three (irreducible), and the recurrence 21,-51,23 reproduces shell five (2800344) and predicts shell six with no enumeration',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // one small build, then pure arithmetic
    const graph = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: MAX_CELLS })
    const vectors = shellTypeVectors({
      neighbors: graph.neighbors,
      throughShell: 4,
    })
    const matrix = coneTypeTransferMatrix(vectors)

    // the matrix is the expected integer transfer matrix
    const expectedMatrix = [
      [15, 11, 9],
      [4, 4, 3],
      [0, 1, 2],
    ]
    const matrixIsInteger = matrix.every(row =>
      row.every(x => Math.abs(x - Math.round(x)) < 1e-9),
    )
    const matrixMatches = matrix.every((row, i) =>
      row.every((x, j) => Math.round(x) === expectedMatrix[i]![j]),
    )

    // the characteristic polynomial, the exact minimal polynomial of the warp factor
    const poly = characteristicPolynomialCubic(matrix)
    const traceRounded = Math.round(poly.trace)
    const minorRounded = Math.round(poly.minorSum)
    const detRounded = Math.round(poly.determinant)
    const polyIsExpected =
      traceRounded === 21 && minorRounded === 51 && detRounded === 23

    // the largest root, the warp factor
    const warpFactor = largestCubicRoot({
      a: poly.trace,
      b: poly.minorSum,
      c: poly.determinant,
      seed: 18.3,
    })
    const warpNearKnown = Math.abs(warpFactor - 18.2787) < 0.001

    // irreducible: the cubic has no rational root (candidates divide 23: 1 and 23)
    const cubic = (x: number): number =>
      x ** 3 - traceRounded * x * x + minorRounded * x - detRounded
    const noRationalRoot = cubic(1) !== 0 && cubic(23) !== 0

    // the recurrence reproduces the measured shell counts (the control), including shell five
    const recurrence = (a: number, b: number, c: number): number =>
      traceRounded * a - minorRounded * b + detRounded * c
    const reproducedFour = recurrence(
      MEASURED_SHELLS[3]!,
      MEASURED_SHELLS[2]!,
      MEASURED_SHELLS[1]!,
    )
    const reproducedFive = recurrence(
      MEASURED_SHELLS[4]!,
      MEASURED_SHELLS[3]!,
      MEASURED_SHELLS[2]!,
    )
    const reproducesShells =
      reproducedFour === MEASURED_SHELLS[4]! &&
      reproducedFive === MEASURED_SHELLS[5]!
    const predictedShellSix = recurrence(
      MEASURED_SHELLS[5]!,
      MEASURED_SHELLS[4]!,
      MEASURED_SHELLS[3]!,
    )

    const solved =
      matrixIsInteger &&
      matrixMatches &&
      polyIsExpected &&
      warpNearKnown &&
      noRationalRoot &&
      reproducesShells

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the warp factor has an exact closed form, a cubic, found memory-optimally. The {3,4,3,4} cells fall into three cone types by back-degree, and one build to shell four (162000 cells, no memory problem) gives the integer transfer matrix [[15,11,9],[4,4,3],[0,1,2]], whose characteristic polynomial lambda^3 - 21 lambda^2 + 51 lambda - 23 = 0 is the exact minimal polynomial of the warp factor. The warp factor is its largest root, 18.2787..., degree three and irreducible (no rational root), correcting the earlier degree-four guess that came from fitting through the single-cell seed shell. The recurrence s(n) = 21 s(n-1) - 51 s(n-2) + 23 s(n-3) reproduces the independently measured shell four and shell five (2800344) exactly and predicts shell six (51187080) with no enumeration, so the matrix is the true transfer matrix and the cubic is the true minimal polynomial.',
      metrics: {
        transferTrace: traceRounded,
        transferMinorSum: minorRounded,
        transferDeterminant: detRounded,
        warpFactor: Number(warpFactor.toFixed(9)),
        reproducedShellFive: reproducedFive,
        predictedShellSix,
        matrixIsInteger: matrixIsInteger ? 1 : 0,
      },
      control: {
        // the recurrence reproduces the measured shell five exactly, so the matrix is real, not a
        // coincidental fit; a wrong matrix would miss it
        measuredShellFive: MEASURED_SHELLS[5]!,
        recurrenceShellFive: reproducedFive,
        recurrenceShellFour: reproducedFour,
      },
      notes:
        'L2, the cone-type transfer matrix (Cannon rationality, a standard coordination-sequence technique) applied to the honeycomb, reusing code/measure/coordination-transfer and code/substrate/coxeter. The warp factor is the largest root of lambda^3 - 21 lambda^2 + 51 lambda - 23, degree three, irreducible. This is memory-optimal: one shell-four build (about 162000 cells), then pure 3x3 arithmetic, versus the fifty-million-cell shell six that a direct enumeration would need. It resolves the open closed-form question (the value is a cubic surd, not degree four) and gives the exact minimal polynomial of the RG fixed point of E-GMT-0030. The recurrence reproduces the measured shell five, the control. Deterministic, no random.',
    })
  },
})
