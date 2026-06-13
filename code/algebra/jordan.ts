// The Hermitian octonionic matrices and their Jordan product. The n = 3 case is the
// exceptional Jordan algebra J3(O), the 27-dimensional Albert algebra, whose automorphism
// group is F4, the symmetry group of the {3,4,3,4} substrate (its 24 directions are the
// F4 long roots). The point of this module is to COMPUTE, not assume, why the structure is
// three-fold: H_n(O) is a Jordan algebra (closed under the symmetrized product and obeying
// the Jordan identity) only for n <= 3, because the octonions are non-associative. So the
// rank-3 Jordan frame, the candidate for three fermion generations, is forced at n = 3 and
// fails at n = 4. The generation IDENTIFICATION (three slots = three Standard Model
// generations) stays Boyle's open conjecture, this module only nails the structural chain.

import {
  type Octonion,
  octonionAdd,
  octonionConjugate,
  octonionMultiply,
  octonionOne,
  octonionRealPart,
  octonionScale,
  octonionSubtract,
  octonionUnit,
  octonionZero,
} from '@/code/algebra/octonion'

// A matrix of octonions. A Hermitian one satisfies M[j][i] = conjugate(M[i][j]).
export type OctonionMatrix = Octonion[][]

// The real dimension of the Hermitian n-by-n octonion matrices: n real diagonal entries
// plus n(n-1)/2 octonionic off-diagonal entries, each carrying 8 reals.
export function hermitianOctonionDimension(n: number): number {
  return n + (8 * n * (n - 1)) / 2
}

export function octonionMatrixZero(n: number): OctonionMatrix {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => octonionZero()))
}

export function octonionMatrixIdentity(n: number): OctonionMatrix {
  const m = octonionMatrixZero(n)
  for (let i = 0; i < n; i++) m[i]![i] = octonionOne()
  return m
}

export function octonionMatrixAdd(a: OctonionMatrix, b: OctonionMatrix): OctonionMatrix {
  return a.map((row, i) => row.map((entry, j) => octonionAdd(entry, b[i]![j]!)))
}

export function octonionMatrixScale(a: OctonionMatrix, scalar: number): OctonionMatrix {
  return a.map((row) => row.map((entry) => octonionScale(entry, scalar)))
}

// Ordinary (non-associative) octonion matrix product. Order matters, since the octonions
// do not associate, so this is NOT generally Hermitian even for Hermitian inputs.
export function octonionMatrixMultiply(a: OctonionMatrix, b: OctonionMatrix): OctonionMatrix {
  const n = a.length
  const out = octonionMatrixZero(n)
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      let sum = octonionZero()
      for (let j = 0; j < n; j++) {
        sum = octonionAdd(sum, octonionMultiply(a[i]![j]!, b[j]![k]!))
      }
      out[i]![k] = sum
    }
  }
  return out
}

// The Jordan product A . B = (A B + B A) / 2. For Hermitian inputs this is again Hermitian,
// and for n <= 3 it makes the Hermitian octonion matrices into a Jordan algebra.
export function jordanProduct(a: OctonionMatrix, b: OctonionMatrix): OctonionMatrix {
  return octonionMatrixScale(
    octonionMatrixAdd(octonionMatrixMultiply(a, b), octonionMatrixMultiply(b, a)),
    0.5,
  )
}

// The Hermitian conjugate transpose: transpose and conjugate every entry.
export function octonionMatrixConjugateTranspose(a: OctonionMatrix): OctonionMatrix {
  const n = a.length
  const out = octonionMatrixZero(n)
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out[j]![i] = octonionConjugate(a[i]![j]!)
  return out
}

export function octonionMatrixMaxAbs(a: OctonionMatrix): number {
  let worst = 0
  for (const row of a) for (const entry of row) for (const x of entry) worst = Math.max(worst, Math.abs(x))
  return worst
}

export function octonionMatrixEquals(a: OctonionMatrix, b: OctonionMatrix, tolerance = 1e-9): boolean {
  return octonionMatrixMaxAbs(octonionMatrixSubtract(a, b)) <= tolerance
}

export function octonionMatrixSubtract(a: OctonionMatrix, b: OctonionMatrix): OctonionMatrix {
  return a.map((row, i) => row.map((entry, j) => octonionSubtract(entry, b[i]![j]!)))
}

export function isHermitian(a: OctonionMatrix, tolerance = 1e-9): boolean {
  return octonionMatrixEquals(a, octonionMatrixConjugateTranspose(a), tolerance)
}

// The trace, the real part of the sum of the diagonal (the diagonal of a Hermitian matrix
// is real).
export function octonionMatrixTrace(a: OctonionMatrix): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += octonionRealPart(a[i]![i]!)
  return sum
}

// An idempotent under the Jordan product: E . E = E.
export function isJordanIdempotent(e: OctonionMatrix, tolerance = 1e-9): boolean {
  return octonionMatrixEquals(jordanProduct(e, e), e, tolerance)
}

// Two idempotents are orthogonal when their Jordan product vanishes.
export function areJordanOrthogonal(e: OctonionMatrix, f: OctonionMatrix, tolerance = 1e-9): boolean {
  return octonionMatrixMaxAbs(jordanProduct(e, f)) <= tolerance
}

// The standard diagonal Jordan frame: the n primitive idempotents E_k = diag(0,..,1,..,0),
// each of trace 1, pairwise orthogonal, summing to the identity. For H_n(O) the maximal
// number of pairwise-orthogonal nonzero idempotents (the rank) is n, and this is the frame.
export function diagonalJordanFrame(n: number): OctonionMatrix[] {
  return Array.from({ length: n }, (_, k) => {
    const e = octonionMatrixZero(n)
    e[k]![k] = octonionOne()
    return e
  })
}

// A deterministic Hermitian octonion matrix for tests: real diagonal i+1, and off-diagonal
// (i<j) set to a basis imaginary unit chosen so the entries span several Fano lines (so the
// non-associativity is actually exercised, not hidden in one associative quaternion line).
// No randomness, the pattern is a fixed function of the indices and the variant.
export function deterministicHermitian(n: number, variant: number): OctonionMatrix {
  const m = octonionMatrixZero(n)
  for (let i = 0; i < n; i++) {
    m[i]![i] = octonionUnit(0).map((x) => x * (i + 1))
    for (let j = i + 1; j < n; j++) {
      const unit = ((i + 2 * j + 3 * variant) % 7) + 1 // one of e1..e7
      m[i]![j] = octonionUnit(unit)
      m[j]![i] = octonionConjugate(m[i]![j]!)
    }
  }
  return m
}

// The Jordan identity residual: the largest entry of (A . B) . (A . A) - A . (B . (A . A)).
// Zero (to rounding) means the Jordan identity holds. It holds for every n <= 3 and fails
// for n >= 4 over the octonions, which is the computed reason the structure is three-fold.
export function jordanIdentityResidual(a: OctonionMatrix, b: OctonionMatrix): number {
  const aa = jordanProduct(a, a)
  const left = jordanProduct(jordanProduct(a, b), aa)
  const right = jordanProduct(a, jordanProduct(b, aa))
  return octonionMatrixMaxAbs(octonionMatrixSubtract(left, right))
}

// The worst Jordan-identity residual over a few deterministic Hermitian pairs at size n.
// Small means H_n(O) behaves as a Jordan algebra on these elements, large means it does not.
export function maxJordanIdentityResidual(n: number): number {
  let worst = 0
  for (let variant = 0; variant < 4; variant++) {
    const a = deterministicHermitian(n, variant)
    const b = deterministicHermitian(n, variant + 1)
    worst = Math.max(worst, jordanIdentityResidual(a, b))
  }
  return worst
}
