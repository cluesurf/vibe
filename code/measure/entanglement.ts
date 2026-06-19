// Free-fermion entanglement measurements. The standard correlation-matrix method,
// the canonical way to get the ground-state entanglement entropy of a region of a
// quadratic (tight-binding) Hamiltonian without building the exponentially large
// many-body state. Used by the holography area-law / black-hole / RT experiments.
//
// Method: diagonalize the single-particle Hamiltonian, fill the lowest half of the
// modes (the half-filled Fermi sea), form the two-point correlation matrix
// C_ij = <c_i^dag c_j>, restrict it to a region, and read the entropy off the
// restricted eigenvalues zeta as S = -sum [ zeta ln zeta + (1-zeta) ln(1-zeta) ].

import { makeDense, DenseMatrix } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// The two-point correlation matrix C_ij = <c_i^dag c_j> of the half-filled
// free-fermion ground state of a single-particle hopping Hamiltonian h (n x n),
// returned in flat row-major order. Fills the lowest floor(n/2) modes.
export function freeFermionCorrelationMatrix(input: {
  h: DenseMatrix
  n: number
}): Float64Array {
  const { h, n } = input
  const eig = eigSymmetric({ matrix: h })
  const order = Array.from({ length: n }, (_, k) => k).sort(
    (a, b) => (eig.values[a] ?? 0) - (eig.values[b] ?? 0),
  )
  const occupied = order.slice(0, Math.floor(n / 2))
  const c = new Float64Array(n * n)
  for (const k of occupied) {
    for (let i = 0; i < n; i++) {
      const vik = eig.vectors[i * n + k] ?? 0
      if (vik === 0) {
        continue
      }
      for (let j = 0; j < n; j++) {
        c[i * n + j] =
          (c[i * n + j] ?? 0) + vik * (eig.vectors[j * n + k] ?? 0)
      }
    }
  }
  return c
}

// Entanglement entropy (nats) of a region, given a flat row-major correlation
// matrix c (n x n) and the region's node indices. Restricts c to the region,
// diagonalizes, and sums the single-mode binary entropies of the eigenvalues zeta:
// S = -sum [ zeta ln zeta + (1-zeta) ln(1-zeta) ], with zeta clamped to (0, 1).
export function regionEntanglementEntropy(input: {
  c: Float64Array
  n: number
  region: ReadonlyArray<number>
}): number {
  const m = input.region.length
  const sub = makeDense({ rows: m, cols: m })
  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      sub.data[a * m + b] =
        input.c[
          (input.region[a] ?? 0) * input.n + (input.region[b] ?? 0)
        ] ?? 0
    }
  }
  const eig = eigSymmetric({ matrix: sub })
  let s = 0
  for (let i = 0; i < m; i++) {
    const z = Math.min(1 - 1e-12, Math.max(1e-12, eig.values[i] ?? 0))
    s -= z * Math.log(z) + (1 - z) * Math.log(1 - z)
  }
  return s
}

// The Page average entanglement entropy (Page 1993) of a subsystem of Hilbert-space dimension m in a
// random pure state of an m * n bipartite system, S(m, n) = sum_{k=n+1}^{m n} 1/k - (m - 1) / (2 n)
// for m <= n (symmetric in m and n). For a black hole plus its radiation this rises while the
// radiation is the smaller side and falls once it is larger, the turnover at the Page time. Returns
// the entropy in nats.
export function pageAverageEntropy(input: {
  dimA: number
  dimB: number
}): number {
  let m = input.dimA
  let n = input.dimB
  if (m > n) {
    const t = m
    m = n
    n = t
  }
  let s = 0
  for (let k = n + 1; k <= m * n; k++) {
    s += 1 / k
  }
  return s - (m - 1) / (2 * n)
}
