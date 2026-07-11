// Conformance for code/algebra/linear/power-iteration: lowest eigenPAIRS by shifted
// power iteration with deflation. Power iterating on cI - H converges to the lowest
// H eigenvalue once c bounds the spectrum above; deflation peels off the next.
// Checked on matrices with closed-form spectra: [[2,1],[1,2]] -> {1,3} and a 3x3
// block -> {1,3,5}. We verify the energies, that each returned state is a genuine
// eigenvector (H s = energy s), unit norm, and that distinct-eigenvalue states are
// orthogonal.

import { suite, check, close, ok } from '@/test/code/harness'
import { lowestEigenpairs } from '@/code/algebra/linear/power-iteration'
import {
  sparseFromTriplets,
  operatorFromSparse,
  Triplet,
  LinearOperator,
} from '@/code/algebra/linear/sparse'

function operatorFrom(rows: number[][]): LinearOperator {
  const n = rows.length
  const triplets: Triplet[] = []

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const v = rows[r]![c]!

      if (v !== 0) triplets.push({ row: r, col: c, value: v })
    }
  }

  return operatorFromSparse(
    sparseFromTriplets({ rows: n, cols: n, triplets }),
  )
}

function dot(a: Float64Array, b: Float64Array): number {
  let s = 0

  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!

  return s
}

suite('algebra/linear/power-iteration: lowest eigenpairs', [
  check(
    'lowest pair of [[2,1],[1,2]]: energy 1, eigenvector verified',
    () => {
      const op = operatorFrom([
        [2, 1],
        [1, 2],
      ])

      const [pair] = lowestEigenpairs({
        operator: op,
        count: 1,
        shift: 5, // above max eigenvalue 3
        seed: 1,
      })

      close(pair!.energy, 1, 1e-6, 'lowest energy')
      close(dot(pair!.state, pair!.state), 1, 1e-9, 'unit norm')

      // H s must equal energy * s
      const hs = op.apply({ x: pair!.state })

      for (let i = 0; i < hs.length; i++) {
        close(
          hs[i]!,
          pair!.energy * pair!.state[i]!,
          1e-6,
          `H s component ${i}`,
        )
      }
    },
  ),
  check(
    'deflation recovers {1, 3} from the 3x3 block, states orthogonal',
    () => {
      const op = operatorFrom([
        [2, 1, 0],
        [1, 2, 0],
        [0, 0, 5],
      ])

      const pairs = lowestEigenpairs({
        operator: op,
        count: 2,
        shift: 7, // above max eigenvalue 5
        seed: 2,
      })

      close(pairs[0]!.energy, 1, 1e-6, 'first energy')
      close(pairs[1]!.energy, 3, 1e-6, 'second energy')
      ok(
        Math.abs(dot(pairs[0]!.state, pairs[1]!.state)) < 1e-6,
        'distinct-eigenvalue states are orthogonal',
      )
    },
  ),
])
