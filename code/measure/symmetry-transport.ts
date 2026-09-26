// A symmetry-adapted reader of the exact periodic husk transport of a dock-varying medium (E-RLT-0086). MEASUREMENT:
// floats throughout.
//
// WHY A NEW READER. code/measure/bounce-transport reads the slow modes of a periodic cell by subspace iteration and
// names each by its CONTENT, the squared projection of its right eigenvector on cell-uniform invariant vectors. On a
// side-4 cell of the D4 gas that fails twice over (E-RLT-0085): the cell folds 12 exact STAGGERED invariants onto
// k = 0 beside the 6 physical ones, and on a medium whose docks differ the physical right eigenvectors are not
// cell-uniform, so a content threshold cannot tell a physical mode from a folded one.
//
// THE 18 LEFT INVARIANTS, in closed form. A left vector l(x, i) of the cell is kept by the two-beat period map when
// every dock's collision keeps its dock part and the stream carries it to itself. The 6 physical ones are the dock
// invariants (charge, energy, momentum) repeated on every dock. The 12 STAGGERED ones: for each of the 12 lines w of
// the 24 minimal vectors of the dual lattice D4* (the axes e_a and the half vectors (+-1, +-1, +-1, +-1) / 2, the three
// frames of D4's triality), l_w(x, (d, s)) = e^(i pi w . x) (w . r_d) on the slot indices and 0 on the stores. w . r_d
// is 0 or +-1 for every root, so where it is not 0 the stream multiplies the phase by e^(i pi w . r_d) = -1: one beat
// sends l_w to -l_w and the period map (two beats) keeps it. The dock part is a momentum component, which every
// collision keeps. e^(i pi w . x) is +-1 on D4 and 1 on 4 D4, so all 12 are real and live on the side-4 cell.
//
// THE READER. With L the 18 left invariants and R the matching right eigenvectors at k = 0 (L R = I, R = lim M0^n X),
// the period map M(k) = M0 - i k N1 - k^2 N2 + O(k^3) (N1, N2 real: the stream's phase e^(-i k u . r_d) expanded) has
// its 18 slow eigenvalues equal, to O(k^3), to those of the effective matrix
//      H(k) = I - i k L N1 R - k^2 (L N2 R + L N1 S N1 R),     S = Q (1 - Q M0 Q)^(-1) Q = sum_n M0^n Q,  Q = 1 - R L
// (the Feshbach reduction). H1 = L N1 R and H2 = L N2 R + L N1 S N1 R are 18 x 18 and name every slow mode by its
// coordinates on L, never by a content. The physical-staggered blocks of H1 and H2 say whether the medium couples the
// two families at all. THE SYMMETRY: every element g of the medium's space group (the vacuum's own) is an index
// permutation D(g) of the cell commuting with M0 and carrying M(k) to M(g k); on the invariant space it is the 18 x 18
// matrix L D(g) R. The isotypic components of the little group of a direction u, found as the eigenspaces of a generic
// class sum, are kept by M(k u) for every k, so a mode is read inside its own component.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { STORE_N } from '@/code/measure/token-store-linearization'
import { pairIndexPermutation } from '@/code/measure/pair-knit-linearization'
import { type PeriodicMedium } from '@/code/measure/bounce-transport'
import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'

const ROOTS = rootsD4()
const N = STORE_N

// the 12 lines of D4*'s minimal vectors, one vector per line: e_1 .. e_4, then (1, +-1, +-1, +-1) / 2
export const DUAL_LINES: readonly (readonly number[])[] = (() => {
  const out: number[][] = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]

  for (let m = 0; m < 8; m++) out.push([0.5, m & 1 ? -0.5 : 0.5, m & 2 ? -0.5 : 0.5, m & 4 ? -0.5 : 0.5])

  return out
})()

// ---- the cell operators ----

// one beat: collide every dock with the beat's matrices, then stream with each slot index weighted by (u . r_d)^power
// (power 0: the plain stream; stores stay, weight 1 at power 0 and 0 otherwise). Real vectors, out of place.
export function beat(medium: PeriodicMedium, which: number, v: Float64Array, out: Float64Array, u: readonly number[], power: number, scratch: Float64Array): void {
  const mats = medium.beats[which] as readonly Float64Array[]
  const cells = medium.cells

  for (let x = 0; x < cells; x++) {
    const a = mats[x] as Float64Array
    const vo = x * N

    for (let r = 0; r < N; r++) {
      let s = 0
      const row = r * N

      for (let c = 0; c < N; c++) {
        const w = a[row + c] as number

        if (w !== 0) s += w * (v[vo + c] as number)
      }

      scratch[vo + r] = s
    }
  }

  const weight = new Float64Array(24)

  for (let d = 0; d < 24; d++) {
    const r = ROOTS[d] as number[]
    const p = (r[0] as number) * (u[0] ?? 0) + (r[1] as number) * (u[1] ?? 0) + (r[2] as number) * (u[2] ?? 0) + (r[3] as number) * (u[3] ?? 0)

    weight[d] = power === 0 ? 1 : p ** power
  }

  for (let x = 0; x < cells; x++) {
    const from = x * N

    for (let i = 48; i < N; i++) out[from + i] = power === 0 ? (scratch[from + i] as number) : 0

    for (let d = 0; d < 24; d++) {
      const to = (medium.target[x * 24 + d] as number) * N
      const w = weight[d] as number

      out[to + 2 * d] = w * (scratch[from + 2 * d] as number)
      out[to + 2 * d + 1] = w * (scratch[from + 2 * d + 1] as number)
    }
  }
}

// the transpose of one beat (power 0): gather along the stream, then the transposed collisions
export function beatTranspose(medium: PeriodicMedium, which: number, v: Float64Array, out: Float64Array, scratch: Float64Array): void {
  const mats = medium.beats[which] as readonly Float64Array[]
  const cells = medium.cells

  for (let x = 0; x < cells; x++) {
    const from = x * N

    for (let i = 48; i < N; i++) scratch[from + i] = v[from + i] as number

    for (let d = 0; d < 24; d++) {
      const to = (medium.target[x * 24 + d] as number) * N

      scratch[from + 2 * d] = v[to + 2 * d] as number
      scratch[from + 2 * d + 1] = v[to + 2 * d + 1] as number
    }
  }

  for (let x = 0; x < cells; x++) {
    const a = mats[x] as Float64Array
    const vo = x * N

    for (let c = 0; c < N; c++) {
      let s = 0

      for (let r = 0; r < N; r++) {
        const w = a[r * N + c] as number

        if (w !== 0) s += w * (scratch[vo + r] as number)
      }

      out[vo + c] = s
    }
  }
}

export type CellOps = {
  readonly size: number
  // M0 v
  period: (v: Float64Array) => Float64Array
  // v M0 (as a column: M0^T v)
  periodTranspose: (v: Float64Array) => Float64Array
  // N1 v and N2 v along u (M(k u) = M0 - i k N1 - k^2 N2 + O(k^3))
  first: (v: Float64Array, u: readonly number[]) => Float64Array
  second: (v: Float64Array, u: readonly number[]) => Float64Array
}

export function cellOps(medium: PeriodicMedium): CellOps {
  const size = medium.cells * N
  const scratch = new Float64Array(size)
  const a = new Float64Array(size)
  const b = new Float64Array(size)
  const zero = [0, 0, 0, 0]
  const twoBeats = (v: Float64Array, p0: number, p1: number, u: readonly number[]): Float64Array => {
    const out = new Float64Array(size)

    beat(medium, 0, v, a, u, p0, scratch)
    beat(medium, 1, a, out, u, p1, scratch)

    return out
  }

  return {
    size,
    period: v => twoBeats(v, 0, 0, zero),
    periodTranspose: v => {
      const out = new Float64Array(size)

      beatTranspose(medium, 1, v, b, scratch)
      beatTranspose(medium, 0, b, out, scratch)

      return out
    },
    first: (v, u) => {
      const x = twoBeats(v, 1, 0, u)
      const y = twoBeats(v, 0, 1, u)

      for (let i = 0; i < size; i++) x[i] = (x[i] as number) + (y[i] as number)

      return x
    },
    second: (v, u) => {
      const x = twoBeats(v, 2, 0, u)
      const y = twoBeats(v, 0, 2, u)
      const z = twoBeats(v, 1, 1, u)

      for (let i = 0; i < size; i++) x[i] = ((x[i] as number) + (y[i] as number)) / 2 + (z[i] as number)

      return x
    },
  }
}

// ---- the invariants ----

// per dock of the cell, the stagger sign e^(i pi w . x) of each dual line, by walking the stream from dock 0
// (e^(i pi w . r_d) = -1 exactly when w . r_d != 0); `consistent` is false if a closed walk disagrees
export function staggerSigns(medium: PeriodicMedium): { signs: Int8Array; consistent: boolean } {
  const cells = medium.cells
  const signs = new Int8Array(cells * 12)
  let consistent = true

  for (let w = 0; w < 12; w++) {
    const vec = DUAL_LINES[w] as number[]
    const flip = ROOTS.map(r => (Math.abs(r.reduce((s, x, k) => s + x * (vec[k] as number), 0)) > 0.5 ? -1 : 1))
    const seen = new Int8Array(cells)
    const queue = [0]

    signs[w] = 1
    seen[0] = 1

    while (queue.length > 0) {
      const x = queue.pop() as number
      const s = signs[x * 12 + w] as number

      for (let d = 0; d < 24; d++) {
        const y = medium.target[x * 24 + d] as number
        const t = s * (flip[d] as number)

        if (seen[y] === 0) {
          seen[y] = 1
          signs[y * 12 + w] = t
          queue.push(y)
        } else if (signs[y * 12 + w] !== t) consistent = false
      }
    }
  }

  return { signs, consistent }
}

// the 18 left invariants: the 6 dock invariants repeated (in the order given), then the 12 staggered ones, each
// normalized to unit length
export function leftInvariants(medium: PeriodicMedium, dockInvariants: readonly Float64Array[]): { vectors: Float64Array[]; consistent: boolean } {
  const cells = medium.cells
  const size = cells * N
  const out: Float64Array[] = []
  const unit = (v: Float64Array): Float64Array => {
    let n = 0

    for (const x of v) n += x * x

    n = Math.sqrt(n)

    return v.map(x => x / n)
  }

  for (const d of dockInvariants) {
    const v = new Float64Array(size)

    for (let x = 0; x < cells; x++) for (let i = 0; i < N; i++) v[x * N + i] = d[i] as number

    out.push(unit(v))
  }

  const { signs, consistent } = staggerSigns(medium)

  for (let w = 0; w < 12; w++) {
    const vec = DUAL_LINES[w] as number[]
    const v = new Float64Array(size)

    for (let x = 0; x < cells; x++) {
      const s = signs[x * 12 + w] as number

      for (let d = 0; d < 24; d++) {
        const p = (ROOTS[d] as number[]).reduce((acc, c, k) => acc + c * (vec[k] as number), 0)

        v[x * N + 2 * d] = s * p
        v[x * N + 2 * d + 1] = s * p
      }
    }

    out.push(unit(v))
  }

  return { vectors: out, consistent }
}

const dot = (a: Float64Array, b: Float64Array): number => {
  let s = 0

  for (let i = 0; i < a.length; i++) s += (a[i] as number) * (b[i] as number)

  return s
}

// the largest |l M0 - l| over the left vectors (relative to |l|)
export function leftResidual(ops: CellOps, left: readonly Float64Array[]): number {
  let worst = 0

  for (const l of left) {
    const m = ops.periodTranspose(l)
    let r = 0
    let n = 0

    for (let i = 0; i < l.length; i++) {
      r += ((m[i] as number) - (l[i] as number)) ** 2
      n += (l[i] as number) ** 2
    }

    worst = Math.max(worst, Math.sqrt(r / n))
  }

  return worst
}

// small dense helpers (row-major n x n)
export function solve(a: Float64Array, b: Float64Array, n: number, m: number): Float64Array {
  // solve A X = B, A n x n, B n x m, by partial pivoting
  const A = Float64Array.from(a)
  const B = Float64Array.from(b)

  for (let c = 0; c < n; c++) {
    let p = c

    for (let r = c + 1; r < n; r++) if (Math.abs(A[r * n + c] as number) > Math.abs(A[p * n + c] as number)) p = r

    if (p !== c) {
      for (let j = 0; j < n; j++) {
        const t = A[c * n + j] as number

        A[c * n + j] = A[p * n + j] as number
        A[p * n + j] = t
      }

      for (let j = 0; j < m; j++) {
        const t = B[c * m + j] as number

        B[c * m + j] = B[p * m + j] as number
        B[p * m + j] = t
      }
    }

    const d = A[c * n + c] as number

    for (let r = 0; r < n; r++) {
      if (r === c) continue

      const f = (A[r * n + c] as number) / d

      if (f === 0) continue

      for (let j = 0; j < n; j++) A[r * n + j] = (A[r * n + j] as number) - f * (A[c * n + j] as number)
      for (let j = 0; j < m; j++) B[r * m + j] = (B[r * m + j] as number) - f * (B[c * m + j] as number)
    }
  }

  for (let r = 0; r < n; r++) for (let j = 0; j < m; j++) B[r * m + j] = (B[r * m + j] as number) / (A[r * n + r] as number)

  return B
}

// The right eigenvectors R of the invariant space (L R = I): x_j = lim M0^n X e_j with X = L^T (L L^T)^-1, iterated
// until the largest change per iteration falls below `tolerance`
export function rightInvariants(
  ops: CellOps,
  left: readonly Float64Array[],
  tolerance = 1e-10,
  limit = 4000,
  log?: (what: string) => void,
): { vectors: Float64Array[]; iterations: number; change: number } {
  const n = left.length
  const gram = new Float64Array(n * n)

  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) gram[i * n + j] = dot(left[i] as Float64Array, left[j] as Float64Array)

  const eye = new Float64Array(n * n)

  for (let i = 0; i < n; i++) eye[i * n + i] = 1

  const inv = solve(gram, eye, n, n)
  let xs = Array.from({ length: n }, (_, j) => {
    const v = new Float64Array(ops.size)

    for (let i = 0; i < n; i++) {
      const c = inv[i * n + j] as number
      const l = left[i] as Float64Array

      for (let k = 0; k < v.length; k++) v[k] = (v[k] as number) + c * (l[k] as number)
    }

    return v
  })
  let iterations = 0
  let change = Infinity

  while (iterations < limit && change > tolerance) {
    change = 0
    xs = xs.map(x => {
      const y = ops.period(x)
      let d = 0
      let s = 0

      for (let k = 0; k < y.length; k++) {
        d = Math.max(d, Math.abs((y[k] as number) - (x[k] as number)))
        s = Math.max(s, Math.abs(y[k] as number))
      }

      change = Math.max(change, d / s)

      return y
    })
    iterations++

    if (iterations % 100 === 0) log?.(`right invariants: ${iterations} iterations, change ${change.toExponential(2)}`)
  }

  return { vectors: xs, iterations, change }
}

// the n x n matrix L A R for an operator A given as a function on vectors
export function reduced(left: readonly Float64Array[], right: readonly Float64Array[], apply: (v: Float64Array) => Float64Array): Float64Array {
  const n = left.length
  const out = new Float64Array(n * n)

  right.forEach((r, j) => {
    const a = apply(r)

    left.forEach((l, i) => {
      out[i * n + j] = dot(l, a)
    })
  })

  return out
}

// Q v = v - R (L v)
export function projectOut(left: readonly Float64Array[], right: readonly Float64Array[], v: Float64Array): Float64Array {
  const out = Float64Array.from(v)

  left.forEach((l, i) => {
    const c = dot(l, v)
    const r = right[i] as Float64Array

    for (let k = 0; k < out.length; k++) out[k] = (out[k] as number) - c * (r[k] as number)
  })

  return out
}

// S b = sum_n M0^n Q b, until the term falls below `tolerance` relative to the sum
export function reducedResolvent(ops: CellOps, left: readonly Float64Array[], right: readonly Float64Array[], b: Float64Array, tolerance = 1e-12, limit = 6000): { value: Float64Array; terms: number } {
  let term = projectOut(left, right, b)
  const sum = Float64Array.from(term)
  let terms = 1

  while (terms < limit) {
    term = ops.period(term)

    // re-project every few terms so rounding in the invariant directions cannot grow
    if (terms % 16 === 0) term = projectOut(left, right, term)

    let t = 0
    let s = 0

    for (let k = 0; k < sum.length; k++) {
      sum[k] = (sum[k] as number) + (term[k] as number)
      t = Math.max(t, Math.abs(term[k] as number))
      s = Math.max(s, Math.abs(sum[k] as number))
    }

    terms++

    if (t < tolerance * s) break
  }

  return { value: projectOut(left, right, sum), terms }
}

// H1(u) = L N1 R and H2(u) = L N2 R + L N1 S N1 R
export function effectiveMatrices(ops: CellOps, left: readonly Float64Array[], right: readonly Float64Array[], u: readonly number[]): { h1: Float64Array; h2: Float64Array; terms: number } {
  const n = left.length
  const h1 = new Float64Array(n * n)
  const h2 = new Float64Array(n * n)
  let terms = 0

  right.forEach((r, j) => {
    const a = ops.first(r, u)
    const s = reducedResolvent(ops, left, right, a)
    const b = ops.first(s.value, u)
    const c = ops.second(r, u)

    terms = Math.max(terms, s.terms)
    left.forEach((l, i) => {
      h1[i * n + j] = dot(l, a)
      h2[i * n + j] = dot(l, c) + dot(l, b)
    })
  })

  return { h1, h2, terms }
}

// ---- the group ----

// an element of the medium's space group as an index permutation of the cell: out[map[x] * 72 + p[i]] = v[x * 72 + i]
export type CellSymmetry = { readonly map: Int32Array; readonly index: Int32Array; readonly matrix: readonly number[] }

export function cellSymmetry(map: Int32Array, slotPermutation: readonly number[], matrix: readonly number[]): CellSymmetry {
  return { map, index: pairIndexPermutation(slotPermutation), matrix }
}

export function actOn(g: CellSymmetry, v: Float64Array): Float64Array {
  const out = new Float64Array(v.length)
  const cells = g.map.length

  for (let x = 0; x < cells; x++) {
    const to = (g.map[x] as number) * N

    for (let i = 0; i < N; i++) out[to + (g.index[i] as number)] = v[x * N + i] as number
  }

  return out
}

// the largest |D M0 v - M0 D v| / |v| over the given vectors (a symmetry of the medium reads 0)
export function commutationDefect(ops: CellOps, g: CellSymmetry, vectors: readonly Float64Array[]): number {
  let worst = 0

  for (const v of vectors) {
    const a = actOn(g, ops.period(v))
    const b = ops.period(actOn(g, v))
    let r = 0
    let n = 0

    for (let i = 0; i < a.length; i++) {
      r = Math.max(r, Math.abs((a[i] as number) - (b[i] as number)))
      n = Math.max(n, Math.abs(v[i] as number))
    }

    worst = Math.max(worst, r / n)
  }

  return worst
}

// The characters of the invariant representation, EXACT from the geometry: an element g (linear about a dock, its
// 4 x 4 matrix R) fixes the charge and the energy and turns the momentum by R, so chi_P(g) = 2 + tr R; it carries the
// staggered invariant of dual line w onto that of R w with the sign of R w against the line's chosen vector (the
// stagger phase e^(i pi w . x) goes to e^(i pi (R w) . x) with no translation), so chi_S(g) = sum over the lines w with
// R w = +-w of that sign. Returned: the inner products <chi_P, chi_S> (the dimension of the G-maps from the physical
// representation to the staggered one: 0 would forbid every physical-staggered coupling), <chi_V, chi_S> for the
// momentum alone, <chi_S, chi_S> and <chi_P, chi_P> (sums of squared multiplicities).
export function invariantCharacters(matrices: readonly (readonly number[])[]): { physicalStaggered: number; momentumStaggered: number; staggeredSquare: number; physicalSquare: number } {
  let ps = 0
  let vs = 0
  let ss = 0
  let pp = 0

  for (const m of matrices) {
    const trace = (m[0] as number) + (m[5] as number) + (m[10] as number) + (m[15] as number)
    let stagger = 0

    for (const w of DUAL_LINES) {
      const image = applyMatrix(m, w)
      const plus = image.every((x, k) => Math.abs(x - (w[k] as number)) < 1e-9)
      const minus = image.every((x, k) => Math.abs(x + (w[k] as number)) < 1e-9)

      stagger += plus ? 1 : minus ? -1 : 0
    }

    const physical = 2 + trace

    ps += physical * stagger
    vs += trace * stagger
    ss += stagger * stagger
    pp += physical * physical
  }

  const n = matrices.length

  return { physicalStaggered: ps / n, momentumStaggered: vs / n, staggeredSquare: ss / n, physicalSquare: pp / n }
}

// the 4 x 4 matrix of an element applied to u
export const applyMatrix = (m: readonly number[], u: readonly number[]): number[] => [0, 1, 2, 3].map(i => [0, 1, 2, 3].reduce((s, j) => s + (m[i * 4 + j] as number) * (u[j] ?? 0), 0))

// ---- the exact reading at finite k: the Bloch effective operator in the coordinates of the left invariants ----
//
// V(k) is the exact slow invariant subspace of M(k) (subspace iteration on an 18-vector complex block started from
// R, or from a nearby k's block). The Bloch effective operator H(k) = (L M(k) V) (L V)^-1 is the matrix of M(k) on V
// in the basis R(k) = V (L V)^-1, whose left-invariant coordinates are the identity: its eigenvalues are the exact
// slow eigenvalues, and its eigenvectors are each mode's coordinates on L, a naming that needs no content. Because
// every symmetry of the medium maps physical invariants to physical ones and staggered to staggered, D_L(g) =
// L D(g) R is block diagonal and H(g k) = D_L(g) H(k) D_L(g)^-1: the physical block H_PP(k) is a G-covariant 6 x 6
// function of k, and the forcing theorems of a uniform six-mode medium apply to it unchanged.

export type ComplexBlock = { re: Float64Array; im: Float64Array; count: number }

// M(k) on a complex block of vectors (block * size), in place
export function periodComplex(medium: PeriodicMedium, k: readonly number[], re: Float64Array, im: Float64Array, count: number): void {
  const cells = medium.cells
  const size = cells * N
  const cr = new Float64Array(24)
  const ci = new Float64Array(24)

  for (let d = 0; d < 24; d++) {
    const r = ROOTS[d] as number[]
    const phase = -((r[0] as number) * (k[0] ?? 0) + (r[1] as number) * (k[1] ?? 0) + (r[2] as number) * (k[2] ?? 0) + (r[3] as number) * (k[3] ?? 0))

    cr[d] = Math.cos(phase)
    ci[d] = Math.sin(phase)
  }

  const tr = new Float64Array(size)
  const ti = new Float64Array(size)

  for (let b = 0; b < count; b++) {
    const off = b * size

    for (const mats of medium.beats) {
      for (let x = 0; x < cells; x++) {
        const a = mats[x] as Float64Array
        const vo = off + x * N
        const to = x * N

        for (let r = 0; r < N; r++) {
          let sr = 0
          let si = 0
          const row = r * N

          for (let c = 0; c < N; c++) {
            const w = a[row + c] as number

            if (w === 0) continue

            sr += w * (re[vo + c] as number)
            si += w * (im[vo + c] as number)
          }

          tr[to + r] = sr
          ti[to + r] = si
        }
      }

      for (let x = 0; x < cells; x++) {
        const from = x * N

        for (let i = 48; i < N; i++) {
          re[off + from + i] = tr[from + i] as number
          im[off + from + i] = ti[from + i] as number
        }

        for (let d = 0; d < 24; d++) {
          const to = off + (medium.target[x * 24 + d] as number) * N
          const c = cr[d] as number
          const s = ci[d] as number

          for (let sign = 0; sign < 2; sign++) {
            const i = d * 2 + sign
            const xr = tr[from + i] as number
            const xi = ti[from + i] as number

            re[to + i] = c * xr - s * xi
            im[to + i] = c * xi + s * xr
          }
        }
      }
    }
  }
}

function orthonormalizeComplex(re: Float64Array, im: Float64Array, count: number, size: number): void {
  for (let b = 0; b < count; b++) {
    const ob = b * size

    for (let p = 0; p < b; p++) {
      const op = p * size
      let sr = 0
      let si = 0

      for (let i = 0; i < size; i++) {
        const pr = re[op + i] as number
        const pi = im[op + i] as number
        const br = re[ob + i] as number
        const bi = im[ob + i] as number

        sr += pr * br + pi * bi
        si += pr * bi - pi * br
      }

      for (let i = 0; i < size; i++) {
        const pr = re[op + i] as number
        const pi = im[op + i] as number

        re[ob + i] = (re[ob + i] as number) - (sr * pr - si * pi)
        im[ob + i] = (im[ob + i] as number) - (sr * pi + si * pr)
      }
    }

    let norm = 0

    for (let i = 0; i < size; i++) norm += (re[ob + i] as number) ** 2 + (im[ob + i] as number) ** 2

    norm = Math.sqrt(norm)

    for (let i = 0; i < size; i++) {
      re[ob + i] = (re[ob + i] as number) / norm
      im[ob + i] = (im[ob + i] as number) / norm
    }
  }
}

// L times a complex block: an n x count complex matrix (row i, column b)
function leftTimes(left: readonly Float64Array[], re: Float64Array, im: Float64Array, count: number, size: number): { re: Float64Array; im: Float64Array } {
  const n = left.length
  const outR = new Float64Array(n * count)
  const outI = new Float64Array(n * count)

  left.forEach((l, i) => {
    for (let b = 0; b < count; b++) {
      let sr = 0
      let si = 0
      const off = b * size

      for (let k = 0; k < size; k++) {
        const w = l[k] as number

        if (w === 0) continue

        sr += w * (re[off + k] as number)
        si += w * (im[off + k] as number)
      }

      outR[i * count + b] = sr
      outI[i * count + b] = si
    }
  })

  return { re: outR, im: outI }
}

// X = B A^-1 for n x n complex A, B (row-major), through the real embedding of A^T X^T = B^T
export function rightDivide(b: { re: Float64Array; im: Float64Array }, a: { re: Float64Array; im: Float64Array }, n: number): { re: Float64Array; im: Float64Array } {
  const m = 2 * n
  const big = new Float64Array(m * m)

  // A^T = P + i Q with P = a.re^T, Q = a.im^T; real embedding [[P, -Q], [Q, P]]
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const p = a.re[j * n + i] as number
      const q = a.im[j * n + i] as number

      big[i * m + j] = p
      big[i * m + n + j] = -q
      big[(n + i) * m + j] = q
      big[(n + i) * m + n + j] = p
    }
  }

  // right-hand sides: columns of B^T, each column c of B^T is row c of B; stacked as [re; im]
  const cols = n
  const rhsMat = new Float64Array(m * cols)

  for (let c = 0; c < cols; c++) {
    for (let i = 0; i < n; i++) {
      rhsMat[i * cols + c] = b.re[c * n + i] as number
      rhsMat[(n + i) * cols + c] = b.im[c * n + i] as number
    }
  }

  const x = solve(big, rhsMat, m, cols)
  const outR = new Float64Array(n * n)
  const outI = new Float64Array(n * n)

  // X^T column c holds row c of X
  for (let c = 0; c < cols; c++) {
    for (let i = 0; i < n; i++) {
      outR[c * n + i] = x[i * cols + c] as number
      outI[c * n + i] = x[(n + i) * cols + c] as number
    }
  }

  return { re: outR, im: outI }
}

export type BlochReading = { h: { re: Float64Array; im: Float64Array }; iterations: number; change: number; block: ComplexBlock }

// the Bloch effective operator of the slow space at wave vector k
export function blochOperator(input: {
  medium: PeriodicMedium
  left: readonly Float64Array[]
  k: readonly number[]
  start: ComplexBlock
  tolerance?: number
  limit?: number
}): BlochReading {
  const { medium, left, k } = input
  const n = left.length
  const size = medium.cells * N
  const count = input.start.count
  const re = Float64Array.from(input.start.re)
  const im = Float64Array.from(input.start.im)
  const tolerance = input.tolerance ?? 1e-12
  const limit = input.limit ?? 1000
  let previous: Float64Array | undefined
  let change = Infinity
  let iterations = 0
  let h = { re: new Float64Array(n * n), im: new Float64Array(n * n) }

  orthonormalizeComplex(re, im, count, size)

  while (iterations < limit) {
    const mr = Float64Array.from(re)
    const mi = Float64Array.from(im)

    periodComplex(medium, k, mr, mi, count)
    iterations++

    if (iterations % 5 === 0) {
      const lv = leftTimes(left, re, im, count, size)
      const lmv = leftTimes(left, mr, mi, count, size)

      h = rightDivide(lmv, lv, n)

      const flat = new Float64Array(2 * n * n)

      flat.set(h.re)
      flat.set(h.im, n * n)

      if (previous) {
        change = 0

        for (let i = 0; i < flat.length; i++) change = Math.max(change, Math.abs((flat[i] as number) - (previous[i] as number)))
      }

      previous = flat

      if (change < tolerance) break
    }

    re.set(mr)
    im.set(mi)
    orthonormalizeComplex(re, im, count, size)
  }

  return { h, iterations, change, block: { re, im, count } }
}

// a real block (vectors) as a complex block
export function complexBlock(vectors: readonly Float64Array[]): ComplexBlock {
  const size = (vectors[0] as Float64Array).length
  const re = new Float64Array(size * vectors.length)

  vectors.forEach((v, b) => re.set(v, b * size))

  return { re, im: new Float64Array(size * vectors.length), count: vectors.length }
}

// the leading principal block (the first m rows and columns) of an n x n complex matrix
export function principal(h: { re: Float64Array; im: Float64Array }, n: number, from: number, to: number): { re: Float64Array; im: Float64Array } {
  const m = to - from
  const re = new Float64Array(m * m)
  const im = new Float64Array(m * m)

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      re[i * m + j] = h.re[(from + i) * n + from + j] as number
      im[i * m + j] = h.im[(from + i) * n + from + j] as number
    }
  }

  return { re, im }
}

// ---- the named dock invariants and the reading ----

// charge, energy (count + 2 sum |tau|) and the four momentum components as 72-index left vectors, each unit length
export function namedDockInvariants(): Float64Array[] {
  const unit = (v: Float64Array): Float64Array => {
    let n = 0

    for (const x of v) n += x * x

    return v.map(x => x / Math.sqrt(n))
  }
  const charge = Float64Array.from({ length: N }, (_, i) => (i < 48 ? (i % 2 === 0 ? 1 : -1) : 0))
  const energy = Float64Array.from({ length: N }, (_, i) => (i < 48 ? 1 : 2))
  const momenta = [0, 1, 2, 3].map(a => Float64Array.from({ length: N }, (_, i) => (i < 48 ? ((ROOTS[i >> 1] as number[])[a] as number) : 0)))

  return [charge, energy, ...momenta].map(unit)
}

// how far a list of 72-index vectors lies outside the span of an orthonormal list (largest residual norm)
export function outsideSpan(vectors: readonly Float64Array[], basis: readonly Float64Array[]): number {
  let worst = 0

  for (const v of vectors) {
    const r = Float64Array.from(v)

    for (const b of basis) {
      const s = dot(b, v)

      for (let i = 0; i < r.length; i++) r[i] = (r[i] as number) - s * (b[i] as number)
    }

    worst = Math.max(worst, Math.sqrt(dot(r, r)))
  }

  return worst
}

type ModeRead = { gamma: number; omega: number; weights: { charge: number; energy: number; longitudinal: number; shear: number; depth: number; staggered: number } }

// eigen-decompose an m x m complex block whose coordinates are (charge, energy, p1, p2, p3, p4[, 12 staggered])
function modesOf(h: { re: Float64Array; im: Float64Array }, m: number, u: readonly number[]): ModeRead[] {
  const ev = complexEigenvalues({ re: h.re, im: h.im, n: m })

  return ev.re.map((r, i) => {
    const value: [number, number] = [r, ev.im[i] ?? 0]
    const y = complexEigenvector({ re: h.re, im: h.im, n: m, value })
    const w = (j: number): number => (y.re[j] ?? 0) ** 2 + (y.im[j] ?? 0) ** 2
    let lr = 0
    let li = 0

    for (let a = 0; a < 4; a++) {
      lr += (u[a] ?? 0) * (y.re[2 + a] ?? 0)
      li += (u[a] ?? 0) * (y.im[2 + a] ?? 0)
    }

    const momentum = w(2) + w(3) + w(4) + w(5)
    const longitudinal = lr * lr + li * li
    const depth = w(5) - (u[3] ?? 0) ** 2 * w(5)
    let staggered = 0

    for (let j = 6; j < m; j++) staggered += w(j)

    return {
      gamma: -Math.log(Math.hypot(value[0], value[1])) / 2,
      omega: Math.abs(Math.atan2(value[1], value[0])) / 2,
      weights: { charge: w(0), energy: w(1), longitudinal, shear: Math.max(0, momentum - longitudinal - depth), depth, staggered },
    }
  })
}

// the husk quantities of the six physical modes at one k (|k| = k): charge, the momentum-sector trace, the sound
// speed, the two shear rates and the depth rate
export function physicalQuantities(modes: readonly ModeRead[], k: number): { charge: number; trace: number; sound: number; shear: number[]; depth: number; soundOk: boolean } {
  const byCharge = [...modes].sort((a, b) => b.weights.charge - a.weights.charge)
  const chargeMode = byCharge[0] as ModeRead
  const rest = byCharge.slice(1)
  const bySpeed = [...rest].sort((a, b) => b.omega - a.omega)
  const sound = bySpeed.slice(0, 2)
  const transverse = bySpeed.slice(2)
  const byDepth = [...transverse].sort((a, b) => b.weights.depth - a.weights.depth)
  const depth = byDepth[0] as ModeRead
  const shear = byDepth.slice(1)

  return {
    charge: chargeMode.gamma / (k * k),
    trace: rest.reduce((s, m) => s + m.gamma, 0) / (k * k),
    sound: Math.max(...sound.map(m => m.omega)) / k,
    shear: shear.map(m => m.gamma / (k * k)),
    depth: depth.gamma / (k * k),
    soundOk: sound.every(m => m.omega / k > 1e-3) && transverse.every(m => m.omega / k < 1e-6),
  }
}

export type SymmetricReading = {
  // per quantity, per rung: the values over the directions (and polarizations)
  readonly values: Record<string, number[][]>
  readonly anisotropy: Record<string, number[]>
  readonly exponent: Record<string, number>
  readonly means: Record<string, number>
  readonly iterations: number
  readonly worstChange: number
  // largest |H_PS| and |H_SP| (Frobenius) over the solves, divided by k^2, and |H_PP - I| / k^2 for scale
  readonly couplingPS: number
  readonly couplingSP: number
  readonly physicalScale: number
  // the sound and transverse sectors separated cleanly at every solve
  readonly sectorsClean: boolean
}

const QUANTITIES = ['charge', 'trace', 'sound', 'shear', 'depth', 'slowTrace', 'mixedShear'] as const

// The reading. For each husk direction u and each |k| of `rungs`: H(k u) exactly; the PHYSICAL block's six modes
// give charge, trace, sound, shear, depth; the whole 18-mode block gives slowTrace (the sum of Gamma / k^2 over all 18
// slow modes, a G-invariant function of k) and mixedShear (the Gamma / k^2 of the two modes of the whole block with the
// largest shear weight, what an eigenvalue reader that ignores the staggered block sees). The anisotropy of each at
// one |k| is (max - min) / mean over the directions and polarizations; the exponent is the log slope between the
// first two rungs.
export function readSymmetricTransport(input: {
  medium: PeriodicMedium
  left: readonly Float64Array[]
  right: readonly Float64Array[]
  directions: readonly (readonly number[])[]
  rungs: readonly number[]
  tolerance?: number
  log?: (what: string) => void
}): SymmetricReading {
  const { medium, left, right, directions, rungs } = input
  const n = left.length
  const values: Record<string, number[][]> = Object.fromEntries(QUANTITIES.map(q => [q, rungs.map(() => [] as number[])]))
  let iterations = 0
  let worstChange = 0
  let couplingPS = 0
  let couplingSP = 0
  let physicalScale = 0
  let sectorsClean = true
  const start = complexBlock(right)

  directions.forEach((u, index) => {
    let warm = start

    rungs.forEach((k, rung) => {
      const r = blochOperator({ medium, left, k: u.map(x => x * k), start: warm, tolerance: input.tolerance })

      warm = r.block
      iterations += r.iterations
      worstChange = Math.max(worstChange, r.change)

      const block = (r0: number, r1: number, c0: number, c1: number, minusIdentity: boolean): number => {
        let s = 0

        for (let i = r0; i < r1; i++) {
          for (let j = c0; j < c1; j++) s += ((r.h.re[i * n + j] as number) - (minusIdentity && i === j ? 1 : 0)) ** 2 + (r.h.im[i * n + j] as number) ** 2
        }

        return Math.sqrt(s) / (k * k)
      }

      couplingPS = Math.max(couplingPS, block(0, 6, 6, n, false))
      couplingSP = Math.max(couplingSP, block(6, n, 0, 6, false))
      physicalScale = Math.max(physicalScale, block(0, 6, 0, 6, true))

      const physical = modesOf(principal(r.h, n, 0, 6), 6, u)
      const q = physicalQuantities(physical, k)

      sectorsClean = sectorsClean && q.soundOk
      values.charge![rung]!.push(q.charge)
      values.trace![rung]!.push(q.trace)
      values.sound![rung]!.push(q.sound)
      values.shear![rung]!.push(...q.shear)
      values.depth![rung]!.push(q.depth)

      const whole = modesOf(r.h, n, u)

      values.slowTrace![rung]!.push(whole.reduce((s, m) => s + m.gamma, 0) / (k * k))
      values.mixedShear![rung]!.push(
        ...[...whole]
          .sort((a, b) => b.weights.shear - a.weights.shear)
          .slice(0, 2)
          .map(m => m.gamma / (k * k)),
      )

      input.log?.(`symmetric direction ${index} rung ${rung}: ${r.iterations} iterations, change ${r.change.toExponential(2)}`)
    })
  })

  const anisotropy: Record<string, number[]> = {}
  const exponent: Record<string, number> = {}
  const means: Record<string, number> = {}

  for (const q of QUANTITIES) {
    const a = values[q]!.map(v => (v.length > 1 ? (Math.max(...v) - Math.min(...v)) / Math.abs(v.reduce((s, x) => s + x, 0) / v.length) : Number.NaN))

    anisotropy[q] = a
    exponent[q] = Math.log((a[0] ?? 1) / (a[1] ?? 1)) / Math.log((rungs[0] ?? 1) / (rungs[1] ?? 1))

    const first = values[q]![0] ?? []

    means[q] = first.length > 0 ? first.reduce((s, x) => s + x, 0) / first.length : Number.NaN
  }

  return { values, anisotropy, exponent, means, iterations, worstChange, couplingPS, couplingSP, physicalScale, sectorsClean }
}
