// One depth per line class (idea 4a of the gravity roadmap): the mesh's 12 line classes, the metric their spans fix, and
// the linearized dynamics that could carry spin 2 on them. Theory only, real numbers, no rule state: every function
// takes a wavevector's lattice symbol or a small periodic field and returns numbers.
//
// THE 12 LINE CLASSES are the D4 first roots of code/rule/trit-column, one per root pair {r, -r}: e_i + e4 and e_i - e4
// cast the husk axis e_i (two classes over each axis link), and the six e_i +- e_j (no depth part) cast the husk's face
// diagonals. On the husk a class a has the unit direction n_a = u_a / |u_a|, u_a the husk vector it casts.
//
// THE SPAN RELATION (Regge, linearized). A class whose span reads its own depth d_a stretches its links by
// delta l / l = d_a. A spatial metric perturbation h_ij stretches a link along n by (1/2) n^i n^j h_ij, so the 12 spans
// of a dock that come from a metric are d = A h, with A the 12 x 6 matrix whose row a is vec((1/2) n_a n_a^T). vec is
// the Frobenius-orthonormal coordinate of a symmetric 3 x 3 matrix, [h_xx, h_yy, h_zz, r h_xy, r h_xz, r h_yz] with
// r = sqrt 2, so a Frobenius product is a dot product of vecs. The metric part of a 12-vector is A^+ d (least squares),
// its non-metric part (I - A A^+) d.
//
// THE DYNAMICS (linearized general relativity in synchronous gauge, N = 1, N_i = 0). The spatial equations R_ij = 0 of
// the 4d vacuum read d^2 h_ij / dt^2 = -2 R_ij(h), R_ij the spatial Ricci tensor linearized, which in momentum space is
// code/operator/linearized-curvature's linearizedRicci with the momentum k replaced by a LATTICE symbol q(p):
//   2 R_ij = |q|^2 h_ij - q_i (q.h)_j - q_j (q.h)_i + q_i q_j tr h.
// Every identity of the continuum operator is algebraic in k, so it holds exactly for any real vector q: the
// diffeomorphisms h -> h + q xi + xi q are annihilated exactly on the lattice. The time part of the 4d equations is not
// an evolution but two CONSTRAINTS, which the lapse and shift enforce:
//   Hamiltonian  q.h.q - |q|^2 tr h = (a multiple of) the source density                (one row, on h)
//   momentum     q_j (dh_ij/dt) - q_i (d tr h / dt) = (a multiple of) the momentum density  (three rows, on dh/dt)
// Two lattice symbols are offered, both local:
//   central    q_i = sin p_i: fields at the dock, q_i q_j (i != j) is exactly one quarter of the difference of the two
//              face-diagonal second differences of the husk ((D^2_(i+j) - D^2_(i-j)) / 4 has symbol -sin p_i sin p_j),
//              and q_i^2 is the axis second difference at spacing 2, which reaches two docks: range 2, not 1.
//   staggered  q_i = 2 sin(p_i / 2): the nearest-neighbor difference, exact only with the metric's components on
//              staggered positions (h_ij at the face center where the two face diagonals cross, h_ii at the dock, as the
//              Yee grid places them).
// The husk operator itself, lambda(p) = sum_h 2 g_h (1 - cos(u_h . p)) = 6 |p|^2 - |p|^4 / 2 (code/measure/husk-box
// huskSymbol), is not |q|^2 for either symbol; using it for the |q|^2 h_ij term alone breaks the gauge identity at
// order p^4 (the `huskShift` below measures exactly that).
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: values only.

import {
  buildTritBulk,
  TRIT_HUSK_VECTORS,
} from '@/code/rule/trit-column'
import { linearizedRicci } from '@/code/operator/linearized-curvature'
import { huskSymbol } from '@/code/measure/husk-box'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'

export type Matrix = number[][]

const ROOT2 = Math.SQRT2

// the (i, j) index of each vec slot
export const VEC_SLOTS: readonly (readonly [number, number])[] = [
  [0, 0],
  [1, 1],
  [2, 2],
  [0, 1],
  [0, 2],
  [1, 2],
]

export function vecOf(h: Matrix): number[] {
  return VEC_SLOTS.map(([i, j]) =>
    i === j ? h[i]![i]! : ROOT2 * h[i]![j]!,
  )
}

export function matrixOf(v: readonly number[]): Matrix {
  const h = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  VEC_SLOTS.forEach(([i, j], s) => {
    const x = i === j ? v[s]! : v[s]! / ROOT2

    h[i]![j] = x
    h[j]![i] = x
  })

  return h
}

export type LineClass = {
  // the D4 root (4 components)
  readonly root: readonly number[]
  // the husk vector it casts, and its unit direction
  readonly husk: readonly number[]
  readonly unit: readonly number[]
  // 'axis' (e_i +- e4) or 'diagonal' (e_i +- e_j)
  readonly kind: 'axis' | 'diagonal'
}

// the 12 line classes, in code/rule/trit-column's first-root order
export function lineClasses(): LineClass[] {
  const bulk = buildTritBulk({ side: 2, depth: 2 })

  return bulk.roots.map((root, a) => {
    const husk = TRIT_HUSK_VECTORS[bulk.firstHusk[a]!]!
    const norm = Math.hypot(husk[0]!, husk[1]!, husk[2]!)

    return {
      root,
      husk,
      unit: husk.map(x => x / norm),
      kind: root[3] === 0 ? 'diagonal' : 'axis',
    }
  })
}

// row a: vec((1/2) n_a n_a^T), the span of class a under a unit of each metric component
export function spanMap(classes: readonly LineClass[]): Matrix {
  return classes.map(c =>
    vecOf(c.unit.map(x => c.unit.map(y => 0.5 * x * y))),
  )
}

// the same in 4d: row a is the root's (1/2) r r^T / |r|^2 over the 10 components of a symmetric 4 x 4 matrix
// (Frobenius-orthonormal: diagonal, then sqrt 2 times each off-diagonal)
export function spanMap4(classes: readonly LineClass[]): Matrix {
  return classes.map(c => {
    const r = c.root
    const n2 = r.reduce((t, x) => t + x * x, 0)
    const row: number[] = []

    for (let i = 0; i < 4; i++) {
      row.push((0.5 * r[i]! * r[i]!) / n2)
    }

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        row.push((ROOT2 * 0.5 * r[i]! * r[j]!) / n2)
      }
    }

    return row
  })
}

export const transpose = (m: Matrix): Matrix =>
  m[0]!.map((_, j) => m.map(row => row[j]!))

export const multiply = (a: Matrix, b: Matrix): Matrix =>
  a.map(row =>
    b[0]!.map((_, j) => row.reduce((t, x, k) => t + x * b[k]![j]!, 0)),
  )

export const apply = (m: Matrix, v: readonly number[]): number[] =>
  m.map(row => row.reduce((t, x, k) => t + x * v[k]!, 0))

export const identity = (n: number): Matrix =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )

// the symmetric eigen-decomposition of a small symmetric matrix: values ascending, vectors as rows
export function symmetricEigen(m: Matrix): {
  values: number[]
  vectors: number[][]
} {
  const n = m.length
  const dense = makeDense({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      dense.data[i * n + j] = 0.5 * (m[i]![j]! + m[j]![i]!)
    }
  }

  const e = eigSymmetric({ matrix: dense })

  return {
    values: [...e.values],
    vectors: Array.from({ length: n }, (_, c) =>
      Array.from({ length: n }, (_, r) => e.vectors[r * n + c]!),
    ),
  }
}

// an orthonormal basis of the null space of m (rows x cols), by the eigenvectors of m^T m whose value is below
// `tolerance` times the largest (or times `floor`, when the caller knows the matrix's scale and it may be all zero);
// and the rank
// (the Jacobi solver resolves an eigenvalue of m^T m to about 1e-16 of its largest, so the default 1e-12 reads a
// singular value under 1e-6 of the largest as zero)
export function nullBasis(
  m: Matrix,
  cols: number,
  tolerance = 1e-12,
  floor = 0,
): { basis: number[][]; rank: number; values: number[] } {
  if (m.length === 0) {
    return { basis: identity(cols), rank: 0, values: [] }
  }

  const gram = multiply(transpose(m), m)
  const e = symmetricEigen(gram)
  const top = Math.max(...e.values.map(Math.abs), floor, 1e-300)
  const basis = e.vectors.filter(
    (_, i) => e.values[i]! <= tolerance * top,
  )

  return { basis, rank: cols - basis.length, values: e.values }
}

// the dimension of the intersection of the spans of two sets of vectors (each set independent)
export function intersectionDimension(
  a: readonly number[][],
  b: readonly number[][],
  tolerance = 1e-12,
): number {
  if (a.length === 0 || b.length === 0) {
    return 0
  }

  const joined = transpose([...a, ...b].map(v => [...v]))

  return (
    a.length +
    b.length -
    nullBasis(joined, a.length + b.length, tolerance, 1).rank
  )
}

// A^+ = (A^T A)^-1 A^T, from the symmetric eigen-decomposition of A^T A (A of full column rank)
export function pseudoInverse(a: Matrix): Matrix {
  const cols = a[0]!.length
  const e = symmetricEigen(multiply(transpose(a), a))
  const inverse = Array.from({ length: cols }, (_, i) =>
    Array.from({ length: cols }, (_, j) =>
      e.vectors.reduce(
        (t, v, k) => t + (v[i]! * v[j]!) / e.values[k]!,
        0,
      ),
    ),
  )

  return multiply(inverse, transpose(a))
}

// ---------------------------------------------------------------------------------------------------------
// lattice symbols and the metric sector

export type SymbolKind = 'central' | 'staggered'

export function latticeSymbol(
  kind: SymbolKind,
  p: readonly number[],
): number[] {
  return p.map(x =>
    kind === 'central' ? Math.sin(x) : 2 * Math.sin(x / 2),
  )
}

// 2 R(q) on vec coordinates: column b is vec(2 R(B_b)), B_b the vec basis
export function ricciEvolution(q: readonly number[]): Matrix {
  const columns = VEC_SLOTS.map((_, b) => {
    const unit = VEC_SLOTS.map((__, s) => (s === b ? 1 : 0))

    return vecOf(
      linearizedRicci(matrixOf(unit), [...q]).map(row =>
        row.map(x => 2 * x),
      ),
    )
  })

  return transpose(columns)
}

// lambda(p) / 6 less |q|^2: what replacing the |q|^2 h_ij term by the husk operator adds to every component
export function huskShift(
  q: readonly number[],
  p: readonly number[],
): number {
  return huskSymbol(p) / 6 - q.reduce((t, x) => t + x * x, 0)
}

// the four constraint rows on vec coordinates: the Hamiltonian q.h.q - |q|^2 tr h, then the momentum
// q_j h_ij - q_i tr h (applied to dh/dt, which for a mode of nonzero frequency is proportional to h)
export function constraintRows(q: readonly number[]): Matrix {
  const q2 = q.reduce((t, x) => t + x * x, 0)
  const row = (f: (h: Matrix) => number): number[] =>
    VEC_SLOTS.map((_, b) =>
      f(matrixOf(VEC_SLOTS.map((__, s) => (s === b ? 1 : 0)))),
    )
  const trace = (h: Matrix): number => h[0]![0]! + h[1]![1]! + h[2]![2]!
  const hamiltonian = row(h => {
    let s = 0

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        s += q[i]! * h[i]![j]! * q[j]!
      }
    }

    return s - q2 * trace(h)
  })
  const momentum = [0, 1, 2].map(i =>
    row(
      h =>
        q.reduce((t, x, j) => t + x * h[i]![j]!, 0) - q[i]! * trace(h),
    ),
  )

  return [hamiltonian, ...momentum]
}

// the three pure-gauge vecs q xi + xi q, xi the three unit vectors
export function gaugeVecs(q: readonly number[]): number[][] {
  return [0, 1, 2].map(m =>
    vecOf(
      [0, 1, 2].map(i =>
        [0, 1, 2].map(
          j => (i === m ? q[j]! : 0) + (j === m ? q[i]! : 0),
        ),
      ),
    ),
  )
}

// the transverse-traceless vecs for the unit direction n: two, orthonormal
export function transverseTracelessVecs(
  n: readonly number[],
): number[][] {
  // two unit vectors a, b orthogonal to n
  const helper = Math.abs(n[0]!) < 0.9 ? [1, 0, 0] : [0, 1, 0]
  const cross = (
    u: readonly number[],
    v: readonly number[],
  ): number[] => [
    u[1]! * v[2]! - u[2]! * v[1]!,
    u[2]! * v[0]! - u[0]! * v[2]!,
    u[0]! * v[1]! - u[1]! * v[0]!,
  ]
  const a0 = cross(n, helper)
  const na = Math.hypot(a0[0]!, a0[1]!, a0[2]!)
  const a = a0.map(x => x / na)
  const b = cross(n, a)
  const outer = (u: readonly number[], v: readonly number[]): Matrix =>
    [0, 1, 2].map(i =>
      [0, 1, 2].map(j => (u[i]! * v[j]! + v[i]! * u[j]!) / ROOT2),
    )
  const plus = [0, 1, 2].map(i =>
    [0, 1, 2].map(j => (a[i]! * a[j]! - b[i]! * b[j]!) / ROOT2),
  )

  return [vecOf(plus), vecOf(outer(a, b))]
}

// ---------------------------------------------------------------------------------------------------------
// the spectrum of a general real evolution matrix, as eigenspaces

export type Eigenspace = {
  // the eigenvalue (omega^2 up to the time scale) and its imaginary part (0 for a real spectrum)
  readonly value: number
  readonly imaginary: number
  // an orthonormal basis of the eigenspace
  readonly basis: number[][]
}

// eigenvalues by the shifted QR iteration, clustered to `cluster` of the largest magnitude, each cluster's eigenspace
// the null space of (M - value I)
// (`floor` is the scale below which an entry counts as rounding: a matrix that should be zero is read as zero, not
// normalized up into noise)
export function eigenspaces(
  m: Matrix,
  cluster = 1e-7,
  floor = 0,
): Eigenspace[] {
  const n = m.length
  const scale = Math.max(...m.flat().map(Math.abs), floor, 1e-300)
  const unit = m.map(row => row.map(x => x / scale))
  const raw = complexEigenvalues({
    re: unit.flat(),
    im: new Array<number>(n * n).fill(0),
    n,
  })
  const order = raw.re
    .map((re, i) => ({ re, im: raw.im[i]! }))
    .sort((x, y) => x.re - y.re)
  const groups: { re: number; im: number; count: number }[] = []

  for (const v of order) {
    const last = groups[groups.length - 1]

    if (
      last &&
      Math.abs(v.re - last.re / last.count) < cluster &&
      Math.abs(v.im) < cluster
    ) {
      last.re += v.re
      last.count++
    } else {
      groups.push({ re: v.re, im: v.im, count: 1 })
    }
  }

  return groups.map(g => {
    const value = g.re / g.count
    const shifted = unit.map((row, i) =>
      row.map((x, j) => x - (i === j ? value : 0)),
    )

    // 1e-14: a non-normal matrix's nearby eigenvalue can leave a singular value far under the eigenvalue gap, so the
    // floor sits just above the solver's 1e-16 noise
    return {
      value: value * scale,
      imaginary: g.im * scale,
      basis: nullBasis(shifted, n, 1e-14, 1).basis,
    }
  })
}

// ---------------------------------------------------------------------------------------------------------
// the same dynamics on a periodic box, in real space: a leapfrog on the 12 class depths of every dock
//
// THE BEAT. h = A^+ d at every dock (the metric part), then
//   d(t+1) = P [2 d(t) - d(t-1) - kappa A vec(2 R h)] + (I - P) d(t),   P = A A^+,
// with R h the spatial Ricci tensor by central differences (D_i f = (f(x + e_i) - f(x - e_i)) / 2, so D_i D_j has the
// symbol -sin p_i sin p_j and the beat's symbol is ricciEvolution(central)). The non-metric part (I - P) d is HELD: it
// has no dynamics of its own (the auxiliary reading of the extra edge variables, Rocek and Williams 1981, assumed here,
// not derived). Local: a dock reads docks at most two axis steps or one face diagonal away, and nothing else. Time
// reversible: swapping d(t) and d(t-1) runs it backward (floating point here, so to rounding).

export type ClassField = {
  readonly side: number
  readonly docks: number
  readonly map: Matrix
  readonly inverse: Matrix
  readonly project: Matrix
}

export function classField(side: number): ClassField {
  const map = spanMap(lineClasses())
  const inverse = pseudoInverse(map)

  return {
    side,
    docks: side ** 3,
    map,
    inverse,
    project: multiply(map, inverse),
  }
}

const shiftIndex = (
  side: number,
  y: number,
  axis: number,
  by: number,
): number => {
  const stride = axis === 0 ? 1 : axis === 1 ? side : side * side
  const c = Math.floor(y / stride) % side
  const moved = (((c + by) % side) + side) % side

  return y + (moved - c) * stride
}

// the metric vec of every dock (6 per dock)
export function metricOf(f: ClassField, d: Float64Array): Float64Array {
  const h = new Float64Array(f.docks * 6)

  for (let y = 0; y < f.docks; y++) {
    for (let s = 0; s < 6; s++) {
      let t = 0

      for (let a = 0; a < 12; a++) {
        t += f.inverse[s]![a]! * d[y * 12 + a]!
      }

      h[y * 6 + s] = t
    }
  }

  return h
}

// component (i, j) of the dock's metric from its vec
const SLOT_OF = [0, 1, 2].map(i =>
  [0, 1, 2].map(j =>
    VEC_SLOTS.findIndex(
      ([a, b]) => (a === i && b === j) || (a === j && b === i),
    ),
  ),
)

const at = (
  h: Float64Array,
  y: number,
  i: number,
  j: number,
): number => {
  const s = SLOT_OF[i]![j]!

  return i === j ? h[y * 6 + s]! : h[y * 6 + s]! / ROOT2
}

// D_a D_b of a per-dock scalar function g(y), central differences
const second = (
  f: ClassField,
  g: (y: number) => number,
  y: number,
  a: number,
  b: number,
): number => {
  const n = f.side
  const up = (z: number, axis: number): number =>
    shiftIndex(n, z, axis, 1)
  const down = (z: number, axis: number): number =>
    shiftIndex(n, z, axis, -1)

  return (
    (g(up(up(y, a), b)) -
      g(down(up(y, a), b)) -
      g(up(down(y, a), b)) +
      g(down(down(y, a), b))) /
    4
  )
}

// vec(2 R h) at every dock
export function ricciField(
  f: ClassField,
  h: Float64Array,
): Float64Array {
  const out = new Float64Array(f.docks * 6)
  const trace = (y: number): number =>
    at(h, y, 0, 0) + at(h, y, 1, 1) + at(h, y, 2, 2)

  for (let y = 0; y < f.docks; y++) {
    const r = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]

    for (let i = 0; i < 3; i++) {
      for (let j = i; j < 3; j++) {
        // symbol of -D_a D_b is q_a q_b: 2 R = |q|^2 h_ij - q_i (q.h)_j - q_j (q.h)_i + q_i q_j tr h
        let v = 0

        for (let k = 0; k < 3; k++) {
          v -= second(f, z => at(h, z, i, j), y, k, k)
          v += second(f, z => at(h, z, k, j), y, i, k)
          v += second(f, z => at(h, z, k, i), y, j, k)
        }

        v -= second(f, trace, y, i, j)
        r[i]![j] = v
        r[j]![i] = v
      }
    }

    vecOf(r).forEach((x, s) => (out[y * 6 + s] = x))
  }

  return out
}

// the Hamiltonian constraint q.h.q - |q|^2 tr h at every dock, in real space: -D_i D_j h_ij + sum_k D_k D_k tr h
export function hamiltonianField(
  f: ClassField,
  h: Float64Array,
): Float64Array {
  const out = new Float64Array(f.docks)
  const trace = (y: number): number =>
    at(h, y, 0, 0) + at(h, y, 1, 1) + at(h, y, 2, 2)

  for (let y = 0; y < f.docks; y++) {
    let v = 0

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        v -= second(f, z => at(h, z, i, j), y, i, j)
      }

      v += second(f, trace, y, i, i)
    }

    out[y] = v
  }

  return out
}

// one beat, returning the new d(t+1); `now` is d(t), `before` d(t-1)
export function classBeat(
  f: ClassField,
  kappa: number,
  now: Float64Array,
  before: Float64Array,
): Float64Array {
  const force = ricciField(f, metricOf(f, now))
  const next = new Float64Array(now.length)

  for (let y = 0; y < f.docks; y++) {
    const trial = new Array<number>(12)

    for (let a = 0; a < 12; a++) {
      let push = 0

      for (let s = 0; s < 6; s++) {
        push += f.map[a]![s]! * force[y * 6 + s]!
      }

      trial[a] =
        2 * now[y * 12 + a]! -
        before[y * 12 + a]! -
        kappa * push -
        now[y * 12 + a]!
    }

    // P (trial) + (I - P) now = now + P (trial - now); trial above already holds (trial - now)
    for (let a = 0; a < 12; a++) {
      let t = 0

      for (let b = 0; b < 12; b++) {
        t += f.project[a]![b]! * trial[b]!
      }

      next[y * 12 + a] = now[y * 12 + a]! + t
    }
  }

  return next
}
