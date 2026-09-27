// The order in k at which a knit's transport anisotropy falls, read on the husk and in the bulk from the
// exact linear lattice Boltzmann equation (E-RLT-0059).
//
// A knit's linearized collisions A_t (code/measure/exact-linear-collision, exact at the uniform background)
// and the stream give, for a plane wave of wave vector k, the period map M(k) = prod_t S(k) A_t
// (code/coarse/knit-boltzmann periodMap). Its eigenvalues near 1 are the hydrodynamic modes: modulus
// e^(-24 Gamma), argument -24 omega. Each slow mode is named by where its right eigenvector sits among the
// exact invariants of the schedule (the left vectors l with l A_t = l at every beat): the charge Q, the
// momentum P split along k (longitudinal), across k inside the husk (the husk shear), along the depth, and
// whatever else the schedule keeps (the line-momentum sum S of the scatter weave, for one).
//
// THE HUSK. Physical space is the husk, the depth-constant part of the bulk (code/measure/photon-husk,
// code/measure/husk-hydro): a husk wave has k4 = 0, its momentum a husk vector, and a husk density is the
// column sum, which for a k4 = 0 wave equals the bulk density exactly. So the husk transport is the bulk
// transport restricted to husk wave vectors and husk polarizations, and husk isotropy means isotropy over
// husk directions only. The depth momentum P4 is a scalar on the husk, reported apart.
//
// THE ANISOTROPY of a quantity q(k-hat, |k|) (Gamma / k^2 of a mode family, or omega / k of a sound mode) at
// one |k| is (max - min) / mean over the direction set (and over the polarizations, for the shear). Its
// order is the log-log slope of the anisotropy against |k| over the smallest wavelengths: 0 when the
// anisotropy stays finite as k goes to 0 (the leading tensor itself is anisotropic), 2 or 4 when it falls.

import { periodMap } from '@/code/coarse/knit-boltzmann'
import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { rootsD4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()
const N = 48

// ---- the exact invariants of a schedule ----

// An orthonormal basis of the left vectors kept by every matrix (l A_t = l), by Gaussian elimination on the
// stacked (A_t - I)^T with a relative pivot floor. Exact rational matrices give exact rank.
export function invariantBasis(matrices: readonly Float64Array[], floor = 1e-9): Float64Array[] {
  // rows: for each t and each column c, the equation sum_r l_r (A_t[r][c] - delta) = 0
  const rows: Float64Array[] = []

  for (const a of matrices) {
    for (let c = 0; c < N; c++) {
      rows.push(Float64Array.from({ length: N }, (_, r) => (a[r * N + c] ?? 0) - (r === c ? 1 : 0)))
    }
  }

  // row-reduce
  const pivots: number[] = []
  let rank = 0

  for (let col = 0; col < N && rank < rows.length; col++) {
    let best = rank
    let size = 0

    for (let i = rank; i < rows.length; i++) {
      const v = Math.abs(rows[i]?.[col] ?? 0)

      if (v > size) {
        size = v
        best = i
      }
    }

    if (size < floor) {
      continue
    }

    const swap = rows[rank] ?? new Float64Array(N)

    rows[rank] = rows[best] ?? new Float64Array(N)
    rows[best] = swap

    const pivot = rows[rank] ?? new Float64Array(N)
    const p = pivot[col] ?? 1

    for (let j = 0; j < N; j++) pivot[j] = (pivot[j] ?? 0) / p

    for (let i = 0; i < rows.length; i++) {
      if (i === rank) continue

      const row = rows[i] ?? new Float64Array(N)
      const f = row[col] ?? 0

      if (f !== 0) {
        for (let j = 0; j < N; j++) row[j] = (row[j] ?? 0) - f * (pivot[j] ?? 0)
      }
    }

    pivots.push(col)
    rank++
  }

  // null space: one vector per free column
  const free = Array.from({ length: N }, (_, i) => i).filter(i => !pivots.includes(i))
  const basis = free.map(f => {
    const v = new Float64Array(N)

    v[f] = 1
    pivots.forEach((col, i) => {
      v[col] = -(rows[i]?.[f] ?? 0)
    })

    return v
  })

  return orthonormalize(basis)
}

export function orthonormalize(vectors: readonly Float64Array[], floor = 1e-10): Float64Array[] {
  const out: Float64Array[] = []

  for (const v of vectors) {
    const w = Float64Array.from(v)

    for (const u of out) {
      let s = 0

      for (let i = 0; i < w.length; i++) s += (u[i] ?? 0) * (w[i] ?? 0)
      for (let i = 0; i < w.length; i++) w[i] = (w[i] ?? 0) - s * (u[i] ?? 0)
    }

    let norm = 0

    for (let i = 0; i < w.length; i++) norm += (w[i] ?? 0) ** 2

    norm = Math.sqrt(norm)

    if (norm > floor) out.push(w.map(x => x / norm))
  }

  return out
}

// the dimension of the span of `inner` inside the span of `outer` (both orthonormal lists): how many of the
// named densities are exact invariants
export function spanInside(inner: readonly Float64Array[], outer: readonly Float64Array[]): number {
  let kept = 0

  for (const v of inner) {
    let norm = 0
    let projected = 0

    for (let i = 0; i < v.length; i++) norm += (v[i] ?? 0) ** 2

    for (const u of outer) {
      let s = 0

      for (let i = 0; i < v.length; i++) s += (u[i] ?? 0) * (v[i] ?? 0)

      projected += s * s
    }

    kept += Math.abs(projected - norm) < 1e-9 * norm ? 1 : 0
  }

  return kept
}

// the named one-body densities as left vectors
export const CHARGE: Float64Array = Float64Array.from({ length: N }, (_, i) => (i % 2 === 0 ? 1 : -1))
export const COUNT: Float64Array = Float64Array.from({ length: N }, () => 1)

export function momentumAlong(u: readonly number[]): Float64Array {
  return Float64Array.from({ length: N }, (_, i) => (ROOTS[Math.floor(i / 2)] ?? []).reduce((s, x, k) => s + x * (u[k] ?? 0), 0))
}

// ---- the slow modes at one wave vector ----

export type Mode = {
  // decay rate and angular frequency per beat
  readonly gamma: number
  readonly omega: number
  // the named family the mode's eigenvector sits in most, and that share
  readonly family: string
  readonly share: number
}

// Named families for a direction u (unit 4-vector): the invariant space split into charge, the momentum
// along u, the momentum across u inside the husk (x4 = 0), the depth momentum (if u lies in the husk) and
// the rest of the invariants (other). For a bulk direction, across-u is every momentum direction across u.
export function familiesFor(input: { u: readonly number[]; invariants: readonly Float64Array[]; husk: boolean }): Record<string, Float64Array[]> {
  const { u, invariants, husk } = input
  const across: Float64Array[] = []
  const basis4 = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]

  // an orthonormal basis of the directions across u (inside the husk when husk is true)
  const candidates = (husk ? basis4.slice(0, 3) : basis4).map(e => {
    const s = e.reduce((acc, x, k) => acc + x * (u[k] ?? 0), 0)

    return e.map((x, k) => x - s * (u[k] ?? 0))
  })
  const acrossVectors: number[][] = []

  for (const c of candidates) {
    const w = [...c]

    for (const a of acrossVectors) {
      const s = w.reduce((acc, x, k) => acc + x * (a[k] ?? 0), 0)

      for (let k = 0; k < 4; k++) w[k] = (w[k] ?? 0) - s * (a[k] ?? 0)
    }

    const norm = Math.hypot(...w)

    if (norm > 1e-9) acrossVectors.push(w.map(x => x / norm))
  }

  for (const a of acrossVectors) across.push(momentumAlong(a))

  const named: [string, Float64Array[]][] = [
    ['charge', [CHARGE]],
    ['longitudinal', [momentumAlong(u)]],
    ['shear', across],
  ]

  if (husk) named.push(['depth', [momentumAlong([0, 0, 0, 1])]])

  // restrict each named family to its part inside the invariant space, then orthonormalize in order
  const project = (v: Float64Array): Float64Array => {
    const out = new Float64Array(N)

    for (const b of invariants) {
      let s = 0

      for (let i = 0; i < N; i++) s += (b[i] ?? 0) * (v[i] ?? 0)
      for (let i = 0; i < N; i++) out[i] = (out[i] ?? 0) + s * (b[i] ?? 0)
    }

    return out
  }
  const ordered: Float64Array[] = []
  const labels: string[] = []

  for (const [name, list] of named) {
    for (const v of list) {
      const before = ordered.length
      const next = orthonormalize([...ordered, project(v)])

      if (next.length > before) {
        ordered.push(next[next.length - 1] ?? new Float64Array(N))
        labels.push(name)
      }
    }
  }

  // the rest of the invariants
  const all = orthonormalize([...ordered, ...invariants])

  for (let i = ordered.length; i < all.length; i++) {
    ordered.push(all[i] ?? new Float64Array(N))
    labels.push('other')
  }

  const out: Record<string, Float64Array[]> = {}

  ordered.forEach((v, i) => {
    const name = labels[i] ?? 'other'

    out[name] = [...(out[name] ?? []), v]
  })

  return out
}

// The slow modes at wave vector k (4-vector): the `count` eigenvalues of largest modulus of the period
// map, each named by the family holding most of its eigenvector's invariant content
export function slowModesAt(input: {
  matrices: readonly Float64Array[]
  wave: readonly number[]
  count: number
  families: Record<string, Float64Array[]>
}): Mode[] {
  const period = input.matrices.length
  const map = periodMap({ matrices: input.matrices, wave: input.wave })
  const ev = complexEigenvalues({ re: map.re, im: map.im, n: N })
  const order = ev.re.map((_, i) => i).sort((a, b) => Math.hypot(ev.re[b] ?? 0, ev.im[b] ?? 0) - Math.hypot(ev.re[a] ?? 0, ev.im[a] ?? 0))

  return order.slice(0, input.count).map(i => {
    const re = ev.re[i] ?? 0
    const im = ev.im[i] ?? 0
    const x = complexEigenvector({ re: map.re, im: map.im, n: N, value: [re, im] })
    const weights: Record<string, number> = {}
    let total = 0

    for (const [name, list] of Object.entries(input.families)) {
      let w = 0

      for (const l of list) {
        let sr = 0
        let si = 0

        for (let j = 0; j < N; j++) {
          sr += (l[j] ?? 0) * (x.re[j] ?? 0)
          si += (l[j] ?? 0) * (x.im[j] ?? 0)
        }

        w += sr * sr + si * si
      }

      weights[name] = w
      total += w
    }

    const [family, weight] = Object.entries(weights).reduce((best, e) => (e[1] > best[1] ? e : best), ['none', -1] as [string, number])

    return {
      gamma: -Math.log(Math.hypot(re, im)) / period,
      omega: Math.abs(Math.atan2(im, re)) / period,
      family,
      share: total > 0 ? weight / total : 0,
    }
  })
}

// ---- directions ----

// the husk directions (x4 = 0): 3 axes, 6 face diagonals, 4 body diagonals, and `extra` golden-spiral
// directions on the upper half sphere
export function huskDirections(extra: number): number[][] {
  const out: number[][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [1, -1, 0],
    [1, 0, 1],
    [1, 0, -1],
    [0, 1, 1],
    [0, 1, -1],
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [-1, 1, 1],
  ]
  const golden = (1 + Math.sqrt(5)) / 2

  for (let i = 0; i < extra; i++) {
    const z = (i + 0.5) / extra
    const r = Math.sqrt(1 - z * z)
    const phi = (2 * Math.PI * i) / golden

    out.push([r * Math.cos(phi), r * Math.sin(phi), z])
  }

  return out.map(v => {
    const n = Math.hypot(...v)

    return [...v.map(x => x / n), 0]
  })
}

// bulk directions: the 4 axes, the 12 D4 root directions (up to sign), the 8 (1, 1, 1, 1) / 2 type (up to
// sign), and `extra` Weyl points on the 3-sphere (golden and silver rotations through Hopf coordinates)
export function bulkDirections(extra: number): number[][] {
  const out: number[][] = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const s of [1, -1]) {
        const v = [0, 0, 0, 0]

        v[i] = 1
        v[j] = s
        out.push(v)
      }
    }
  }

  for (let m = 0; m < 8; m++) {
    out.push([1, m & 1 ? -1 : 1, m & 2 ? -1 : 1, m & 4 ? -1 : 1])
  }

  const a = (Math.sqrt(5) - 1) / 2
  const b = Math.SQRT2 - 1
  const c = Math.sqrt(3) - 1

  for (let i = 0; i < extra; i++) {
    const u = ((i + 0.5) * a) % 1
    const p = 2 * Math.PI * (((i + 0.5) * b) % 1)
    const q = 2 * Math.PI * (((i + 0.5) * c) % 1)
    const r1 = Math.sqrt(u)
    const r2 = Math.sqrt(1 - u)

    out.push([r1 * Math.cos(p), r1 * Math.sin(p), r2 * Math.cos(q), r2 * Math.sin(q)])
  }

  return out.map(v => {
    const n = Math.hypot(...v)

    return v.map(x => x / n)
  })
}

// (max - min) / mean
export function spread(values: readonly number[]): number {
  const mean = values.reduce((s, x) => s + x, 0) / values.length

  return (Math.max(...values) - Math.min(...values)) / Math.abs(mean)
}

// the log-log slope of ys against xs with its standard error (ordinary least squares)
export function logSlope(xs: readonly number[], ys: readonly number[]): { slope: number; error: number } {
  const x = xs.map(Math.log)
  const y = ys.map(v => Math.log(Math.max(v, 1e-300)))
  const n = x.length
  const mx = x.reduce((s, v) => s + v, 0) / n
  const my = y.reduce((s, v) => s + v, 0) / n
  const sxx = x.reduce((s, v) => s + (v - mx) ** 2, 0)
  const slope = x.reduce((s, v, i) => s + (v - mx) * ((y[i] ?? 0) - my), 0) / sxx
  const residual = y.reduce((s, v, i) => s + (v - my - slope * ((x[i] ?? 0) - mx)) ** 2, 0)
  const error = n > 2 ? Math.sqrt(residual / (n - 2) / sxx) : Number.NaN

  return { slope, error }
}
