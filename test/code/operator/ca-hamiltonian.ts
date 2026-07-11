// Conformance for code/operator/ca-hamiltonian: the Hamiltonian H = i log U of a
// reversible CA (a permutation U), and its Pauli locality profile. Re-derivable
// facts:
//   - H is Hermitian (real part symmetric, imaginary part antisymmetric).
//   - A fixed point of the permutation contributes a zero row/column.
//   - For a transposition U = (0 1), H = (pi/2)(I - X) exactly.
//   - An odd cycle has a zero diagonal (the wrapped eigenphases sum to zero).
//   - Parseval for the Pauli expansion: the total interaction weight equals
//     ||H||_F^2 / n - |c_I|^2, and the range fractions sum to 1.

import { suite, check, ok, close } from '@/test/code/harness'
import {
  hamiltonianMatrix,
  pauliLocalityProfile,
} from '@/code/operator/ca-hamiltonian'
import { ComplexMatrix } from '@/code/algebra/linear/dense'

function perm(values: number[]): Int32Array {
  return Int32Array.from(values)
}

const cases: { name: string; perm: Int32Array }[] = [
  { name: 'transposition (0 1)', perm: perm([1, 0]) },
  { name: '3-cycle (0 1 2)', perm: perm([1, 2, 0]) },
  { name: '4-cycle (0 1 2 3)', perm: perm([1, 2, 3, 0]) },
  { name: 'double transposition', perm: perm([1, 0, 3, 2]) },
  { name: 'fixed point + swap', perm: perm([0, 2, 1]) },
]

suite('operator/ca-hamiltonian: Hermiticity', [
  ...cases.map(({ name, perm: p }) =>
    check(`H is Hermitian for ${name}`, () => {
      const h = hamiltonianMatrix({ perm: p })
      const n = h.rows

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          close(
            h.re[i * n + j] ?? 0,
            h.re[j * n + i] ?? 0,
            1e-12,
            `re sym (${i},${j})`,
          )

          close(
            h.im[i * n + j] ?? 0,
            -(h.im[j * n + i] ?? 0),
            1e-12,
            `im anti (${i},${j})`,
          )
        }
      }
    }),
  ),
])

suite('operator/ca-hamiltonian: exact small cases', [
  check('transposition gives H = (pi/2)(I - X) exactly', () => {
    const h = hamiltonianMatrix({ perm: perm([1, 0]) })
    const half = Math.PI / 2
    const expectedRe = [half, -half, -half, half]

    for (let k = 0; k < 4; k++) {
      close(h.re[k] ?? 0, expectedRe[k] ?? 0, 1e-12, `re[${k}]`)
      close(h.im[k] ?? 0, 0, 1e-12, `im[${k}]`)
    }
  }),
  check(
    'an odd cycle has a zero diagonal (wrapped phases sum to zero)',
    () => {
      const h = hamiltonianMatrix({ perm: perm([1, 2, 0]) })
      const n = h.rows

      for (let s = 0; s < n; s++) {
        close(h.re[s * n + s] ?? 0, 0, 1e-12, `diagonal ${s}`)
        close(h.im[s * n + s] ?? 0, 0, 1e-12, `diagonal im ${s}`)
      }
    },
  ),
  check('a fixed point gives a zero row and column', () => {
    // perm [0,2,1]: 0 is fixed, 1<->2 swap.
    const h = hamiltonianMatrix({ perm: perm([0, 2, 1]) })
    const n = h.rows

    for (let k = 0; k < n; k++) {
      close(h.re[0 * n + k] ?? 0, 0, 1e-12, `row 0 col ${k}`)
      close(h.re[k * n + 0] ?? 0, 0, 1e-12, `col 0 row ${k}`)
      close(h.im[0 * n + k] ?? 0, 0, 1e-12, `row 0 col ${k} im`)
      close(h.im[k * n + 0] ?? 0, 0, 1e-12, `col 0 row ${k} im`)
    }
  }),
])

// ||H||_F^2 and Tr(H) for the Parseval identity.
function frobeniusSquared(h: ComplexMatrix): number {
  let s = 0

  for (let k = 0; k < h.re.length; k++)
    s += (h.re[k] ?? 0) ** 2 + (h.im[k] ?? 0) ** 2

  return s
}

function trace(h: ComplexMatrix): number {
  let s = 0

  for (let i = 0; i < h.rows; i++) s += h.re[i * h.rows + i] ?? 0

  return s
}

suite('operator/ca-hamiltonian: Pauli locality profile', [
  check(
    'Parseval: total weight = ||H||_F^2 / n - c_I^2, and fractions sum to 1',
    () => {
      const h = hamiltonianMatrix({ perm: perm([1, 2, 3, 0]) }) // 4-cycle, n=4, cells=2
      const n = h.rows
      const profile = pauliLocalityProfile({ matrix: h, cells: 2 })

      const cIdentity = trace(h) / n
      const expectedTotal =
        frobeniusSquared(h) / n - cIdentity * cIdentity

      close(
        profile.totalWeight,
        expectedTotal,
        1e-9,
        'Parseval total weight',
      )

      let fractionSum = 0

      for (let r = 1; r <= 2; r++)
        fractionSum += profile.weightByRange[r] ?? 0

      close(fractionSum, 1, 1e-12, 'range fractions sum to 1')
      ok(
        profile.localityLength >= 1 && profile.localityLength <= 2,
        `locality length ${profile.localityLength} must lie in [1, 2]`,
      )
    },
  ),
])
