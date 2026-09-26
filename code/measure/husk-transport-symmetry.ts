// Which transport tensors a point group forces isotropic on the husk, and at what order in k a knit's husk
// anisotropy can first appear (E-RLT-0058).
//
// A long-wave transport quantity of a lattice fluid is a function of the wave vector k (and, for a shear,
// of the polarization a across k) expanded in even degrees. The leading term is a tensor of rank n0: a
// diffusion coefficient D(k-hat) k^2 (a scalar function of degree 2), a sound speed c(k-hat)^2 k^2 (degree
// 2), a shear decay rate a . nu(k) a with a across k (degree 2 in a and 2 in k). The next term has two more
// powers of k. If the knit's symmetry group G forces every G-invariant function of the leading degree to be
// isotropic, the anisotropy of the quantity starts at the first degree where G stops forcing it, so its
// relative size falls as k^(n - n0).
//
// THE HUSK. The husk transport is the bulk transport restricted to k4 = 0 and a4 = 0 (code/measure/photon-husk).
// A G-invariant bulk function restricted to the husk can be more isotropic than the husk's own cubic group
// allows: W(F4)'s only quartic invariant is |k|^4 (E-MTH-0008), so its restriction is |k_husk|^4 while the
// cubic group admits k1^4 + k2^4 + k3^4 as well. So the test here restricts the invariants themselves.
//
// THE TEST. For a group G (4 by 4 matrices), a kind (scalar of degree n in k; transverse, degree 2 in a and
// n in k with a across k) and a region (husk or bulk), every G-invariant polynomial is the Reynolds average
// of a monomial, avg over g of m(g a, g k). Its values at a fixed set of points form one column of F; the
// restricted invariants are the column space of F. They are forced isotropic exactly when every column is
// a multiple of the isotropic function (|k|^n, or |a|^2 |k|^n for a across k) at the points: the residual
// after projecting F's columns on that function is zero. The points are deterministic (code/tool/weyl), and
// more of them than the restricted polynomial space has dimensions, so a zero residual is exact up to
// rounding.

import { makeWeyl } from '@/code/tool/weyl'
import { rootsD4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()

// a group element as a row-major 4 x 4 matrix (16 numbers)
export type Matrix4 = readonly number[]

// the linear map sending root d to root perm[d], from the 24 D4 roots: sum over d of r_perm(d) r_d^T / 12,
// since the roots' second moment is 12 I
export function matrixOfPermutation(perm: readonly number[]): Matrix4 {
  const m = new Array<number>(16).fill(0)

  ROOTS.forEach((r, d) => {
    const image = ROOTS[perm[d] ?? d] ?? r

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        m[i * 4 + j] = (m[i * 4 + j] ?? 0) + ((image[i] ?? 0) * (r[j] ?? 0)) / 12
      }
    }
  })

  return m
}

// whether a matrix really sends every root to the root the permutation names
export function permutationIsLinear(perm: readonly number[]): boolean {
  const m = matrixOfPermutation(perm)

  return ROOTS.every((r, d) => {
    const image = ROOTS[perm[d] ?? d] ?? r

    return [0, 1, 2, 3].every(i => Math.abs([0, 1, 2, 3].reduce((s, j) => s + (m[i * 4 + j] ?? 0) * (r[j] ?? 0), 0) - (image[i] ?? 0)) < 1e-12)
  })
}

export function doubledToMatrix(m: ArrayLike<number>): Matrix4 {
  return Array.from({ length: 16 }, (_, i) => (m[i] ?? 0) / 2)
}

const apply = (m: Matrix4, v: readonly number[]): number[] => [0, 1, 2, 3].map(i => [0, 1, 2, 3].reduce((s, j) => s + (m[i * 4 + j] ?? 0) * (v[j] ?? 0), 0))

// the exponent tuples of the monomials of a degree in four variables
function exponents(degree: number): number[][] {
  const out: number[][] = []

  for (let a = 0; a <= degree; a++) {
    for (let b = 0; a + b <= degree; b++) {
      for (let c = 0; a + b + c <= degree; c++) {
        out.push([a, b, c, degree - a - b - c])
      }
    }
  }

  return out
}

const monomial = (v: readonly number[], e: readonly number[]): number => (v[0] ?? 0) ** (e[0] ?? 0) * (v[1] ?? 0) ** (e[1] ?? 0) * (v[2] ?? 0) ** (e[2] ?? 0) * (v[3] ?? 0) ** (e[3] ?? 0)

export type IsotropyKind = 'scalar' | 'transverse'

export type ForcedReport = {
  // the number of independent restricted invariants of this kind and degree
  readonly invariants: number
  // the largest residual of an invariant after removing its isotropic part, relative to its size
  readonly residual: number
  // true when every restricted invariant is isotropic
  readonly forced: boolean
}

// deterministic sample points: k a unit vector, a a unit vector across k (transverse), both in the husk
// (fourth entry 0) or in the bulk
function samplePoints(input: { count: number; husk: boolean; start: number }): { k: number[]; a: number[] }[] {
  const stream = makeWeyl({ start: input.start })
  const dim = input.husk ? 3 : 4
  const unit = (): number[] => {
    const v = [0, 0, 0, 0].map((_, i) => (i < dim ? stream.nextGaussian() : 0))
    const n = Math.hypot(...v)

    return v.map(x => x / n)
  }

  return Array.from({ length: input.count }, () => {
    const k = unit()
    const raw = unit()
    const s = raw.reduce((acc, x, i) => acc + x * (k[i] ?? 0), 0)
    const a = raw.map((x, i) => x - s * (k[i] ?? 0))
    const n = Math.hypot(...a)

    return { k, a: a.map(x => x / n) }
  })
}

export function forcedIsotropic(input: { group: readonly Matrix4[]; kind: IsotropyKind; degree: number; husk: boolean; points?: number }): ForcedReport {
  const { group, kind, degree, husk } = input
  const kExps = exponents(degree)
  const aExps = kind === 'transverse' ? exponents(2) : [[0, 0, 0, 0]]
  const columns = aExps.length * kExps.length
  const count = input.points ?? Math.max(60, 3 * columns)
  const points = samplePoints({ count, husk, start: 7 + degree * 13 + (kind === 'transverse' ? 101 : 0) + (husk ? 1009 : 0) })
  const f = new Float64Array(count * columns)
  const iso = new Float64Array(count)

  points.forEach((p, row) => {
    for (const g of group) {
      const gk = apply(g, p.k)
      const ga = apply(g, p.a)
      const kv = kExps.map(e => monomial(gk, e))
      const av = aExps.map(e => monomial(ga, e))

      for (let i = 0; i < av.length; i++) {
        for (let j = 0; j < kv.length; j++) {
          f[row * columns + i * kv.length + j] = (f[row * columns + i * kv.length + j] ?? 0) + ((av[i] ?? 0) * (kv[j] ?? 0)) / group.length
        }
      }
    }

    // unit k and unit a: the isotropic function is 1 at every point
    iso[row] = 1
  })

  // residual of each column after projecting out the isotropic function, and the rank of F
  let worst = 0
  const basis: Float64Array[] = []
  let scale = 0

  for (let c = 0; c < columns; c++) {
    const col = Float64Array.from({ length: count }, (_, r) => f[r * columns + c] ?? 0)
    const norm = Math.hypot(...col)

    scale = Math.max(scale, norm)
  }

  for (let c = 0; c < columns; c++) {
    const col = Float64Array.from({ length: count }, (_, r) => f[r * columns + c] ?? 0)
    const norm = Math.hypot(...col)

    if (norm < 1e-12 * scale) {
      continue
    }

    const mean = col.reduce((s, x) => s + x, 0) / count
    const residual = Math.hypot(...col.map(x => x - mean))

    worst = Math.max(worst, residual / norm)

    // Gram-Schmidt for the rank
    const w = Float64Array.from(col)

    for (const b of basis) {
      let s = 0

      for (let i = 0; i < count; i++) s += (b[i] ?? 0) * (w[i] ?? 0)
      for (let i = 0; i < count; i++) w[i] = (w[i] ?? 0) - s * (b[i] ?? 0)
    }

    const wn = Math.hypot(...w)

    if (wn > 1e-9 * norm) {
      basis.push(w.map(x => x / wn))
    }
  }

  return { invariants: basis.length, residual: worst, forced: worst < 1e-9 }
}

// The lowest degree n >= n0, among the degrees tested, at which G stops forcing isotropy: the predicted
// order of the relative anisotropy is then n - n0. Undefined when G forces isotropy through every degree
// tested (the order is then at least the next even degree minus n0).
export function firstAnisotropicDegree(input: { group: readonly Matrix4[]; kind: IsotropyKind; husk: boolean; degrees: readonly number[] }): number | undefined {
  for (const degree of input.degrees) {
    if (!forcedIsotropic({ group: input.group, kind: input.kind, degree, husk: input.husk }).forced) {
      return degree
    }
  }

  return undefined
}
