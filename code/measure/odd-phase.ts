// COVARIANT DOCK PIECES ON THE SWAP COIN, THE BAND-SUM RULE, AND WHERE A MESON'S WEIGHT SITS (E-SPN-0148).
//
//   covariantProjectors   the five W(F4)-invariant projectors on a dock's 24 one-vibe modes (the commutant of W(F4) on
//                         the D4 roots is five-dimensional, E-SPN-0141's census): Pi1 the uniform mode, Pi9 the
//                         traceless quadratics (r . a)^2, Pi2 the rest of the line-even sector, Pi4 the vector irrep
//                         (a . r), Pi8 the rest of the line-odd sector (code/rule/odd-phase ODD_OCTET_12 / 12)
//   covariantDock         X sum_k e^(i phi_k) Pi_k: every covariant dock unitary after the swap coin
//   withRankOne           P (I + (e^(i a) - 1) y y^T): a rank-one dock mixer on a fixed real unit vector y
//   lineSideVector        the line-odd uniform vector (sign +1 on each line's first slot, -1 on its second) / sqrt 24
//   traceMean, bandSumMean  the zone mean of tr U(K) (exact algebra: sum_d P_dd e^(-i K . r_d)) and of the sum of U(K)'s
//                         eigenvalues (the eigen solver's), on a G^4 grid of the zone
//   flatBands             the eigenphases shared by every sampled momentum, with their multiplicity
//   pairContent           a meson state (code/measure/swap-string, total K = 0) in momentum space: for each member,
//                         the weight OFF span(z, T(p) z), the span that holds the swap coin's moving pair S, D at every
//                         mixer angle (so the reading is the same at every string length of a mass string)
//
// THE BAND-SUM RULE. For U(K) = T(K) P, T = diag(e^(-i K . r_d)) the stream and P ANY K-independent 24 x 24 matrix (a
// dock-local piece), tr U(K) = sum_d P_dd e^(-i K . r_d) has no constant Fourier term (no root is 0), so its zone mean is
// 0: the eigenvalues e^(i phi_b(K)) of the 24 bands sum to zero on the zone average, whatever the piece.
//
// DETERMINISM: no random numbers; grids and the Weyl sequence. Floats, as measurement.

import { DOCK_ROOTS, eigenphases, wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { ODD_OCTET_12 } from '@/code/rule/odd-phase'
import { type Ball } from '@/code/measure/swap-sector'
import { type MesonState } from '@/code/measure/swap-string'

const N = 24
const R = DOCK_ROOTS
const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] as number), 0)

export type Projectors = { one: Float64Array; two: Float64Array; nine: Float64Array; four: Float64Array; eight: Float64Array }

const filled = (f: (i: number, j: number) => number): Float64Array => {
  const o = new Float64Array(N * N)

  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) o[i * N + j] = f(i, j)

  return o
}

export function covariantProjectors(): Projectors {
  const one = filled(() => 1 / N)
  const four = filled((i, j) => dot(R[i] as number[], R[j] as number[]) / 12)
  const eight = filled((i, j) => ((ODD_OCTET_12[i] as number[])[j] as number) / 12)
  // the quadratics r_a r_b, orthonormalized against the uniform mode (Gram-Schmidt in a fixed order)
  const basis: number[][] = [Array<number>(N).fill(1 / Math.sqrt(N))]

  for (let a = 0; a < 4; a++) {
    for (let b = a; b < 4; b++) {
      let v = R.map(r => (r[a] as number) * (r[b] as number))

      for (const e of basis) {
        const c = dot(v, e)

        v = v.map((x, i) => x - c * (e[i] as number))
      }

      const n = Math.hypot(...v)

      if (n > 1e-9) basis.push(v.map(x => x / n))
    }
  }

  const q = basis.slice(1)
  const nine = filled((i, j) => q.reduce((s, v) => s + (v[i] as number) * (v[j] as number), 0))
  const two = filled((i, j) => ((i === j ? 1 : 0) + (OPPOSITE[i] === j ? 1 : 0)) / 2 - (one[i * N + j] as number) - (nine[i * N + j] as number))

  return { one, two, nine, four, eight }
}

export const projectorList = (p: Projectors): Float64Array[] => [p.one, p.two, p.nine, p.four, p.eight]

// X sum_k e^(i phi_k) Pi_k, phases in the order (one, two, nine, four, eight); row-major [to][from]
export function covariantDock(p: Projectors, phases: readonly number[]): CMatrix {
  const re = new Float64Array(N * N)
  const im = new Float64Array(N * N)

  projectorList(p).forEach((P, k) => {
    const c = Math.cos(phases[k] as number)
    const s = Math.sin(phases[k] as number)

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = P[(OPPOSITE[i] as number) * N + j] as number

        re[i * N + j]! += c * x
        im[i * N + j]! += s * x
      }
    }
  })

  return { re, im }
}

export const lineSideVector = (): number[] => R.map((_, d) => (d < (OPPOSITE[d] as number) ? 1 : -1) / Math.sqrt(N))

// P (I + (e^(i a) - 1) y y^T)
export function withRankOne(P: CMatrix, y: readonly number[], a: number): CMatrix {
  const gr = Math.cos(a) - 1
  const gi = Math.sin(a)
  const re = Float64Array.from(P.re)
  const im = Float64Array.from(P.im)

  for (let i = 0; i < N; i++) {
    let sr = 0
    let si = 0

    for (let k = 0; k < N; k++) {
      sr += (P.re[i * N + k] as number) * (y[k] as number)
      si += (P.im[i * N + k] as number) * (y[k] as number)
    }

    // (P y)_i (e^(i a) - 1) y_j
    const ar = sr * gr - si * gi
    const ai = sr * gi + si * gr

    for (let j = 0; j < N; j++) {
      re[i * N + j]! += ar * (y[j] as number)
      im[i * N + j]! += ai * (y[j] as number)
    }
  }

  return { re, im }
}

const zoneGrid = (G: number, offset: readonly number[]): number[][] => {
  const out: number[][] = []

  for (let a = 0; a < G; a++) for (let b = 0; b < G; b++) for (let c = 0; c < G; c++) for (let d = 0; d < G; d++) out.push([a, b, c, d].map((j, k) => (2 * Math.PI * j) / G + (offset[k] as number)))

  return out
}

// the zone mean of tr U(K) = sum_d P_dd e^(-i K . r_d) on a G^4 grid (G >= 2 averages every e^(-i K . r_d) to 0)
export function traceMean(P: CMatrix, G: number, offset: readonly number[]): [number, number] {
  let sr = 0
  let si = 0
  const grid = zoneGrid(G, offset)

  for (const K of grid) {
    for (let d = 0; d < N; d++) {
      const ph = -dot(K, R[d] as number[])
      const pr = P.re[d * N + d] as number
      const pi = P.im[d * N + d] as number

      sr += Math.cos(ph) * pr - Math.sin(ph) * pi
      si += Math.cos(ph) * pi + Math.sin(ph) * pr
    }
  }

  return [sr / grid.length, si / grid.length]
}

// the zone mean of the sum of U(K)'s eigenvalues (from the eigen solver) on the same grid
export function bandSumMean(P: CMatrix, G: number, offset: readonly number[]): [number, number] {
  let sr = 0
  let si = 0
  const grid = zoneGrid(G, offset)

  for (const K of grid) {
    const re = new Float64Array(N * N)
    const im = new Float64Array(N * N)

    for (let r = 0; r < N; r++) {
      const ph = -dot(R[r] as number[], K)
      const c = Math.cos(ph)
      const s = Math.sin(ph)

      for (let q = 0; q < N; q++) {
        re[r * N + q] = c * (P.re[r * N + q] as number) - s * (P.im[r * N + q] as number)
        im[r * N + q] = c * (P.im[r * N + q] as number) + s * (P.re[r * N + q] as number)
      }
    }

    const e = complexEigenvalues({ re, im, n: N })

    e.re.forEach((x, i) => {
      sr += x
      si += e.im[i] as number
    })
  }

  return [sr / grid.length, si / grid.length]
}

// the phases present, within tol, at every sampled momentum, with the least multiplicity over the sample
export function flatBands(P: CMatrix, momenta: readonly (readonly number[])[], tol: number): { phase: number; count: number }[] {
  const phs = momenta.map(K => eigenphases(P, R, K))
  const out: { phase: number; count: number }[] = []

  for (const p of [...(phs[0] as number[])].sort((a, b) => a - b)) {
    if (out.some(o => Math.abs(wrap(o.phase - p)) <= tol)) continue

    const count = Math.min(...phs.map(ph => ph.filter(x => Math.abs(wrap(x - p)) <= tol).length))

    if (count > 0) out.push({ phase: p, count })
  }

  return out
}

// ---- a meson state in momentum space ----

// in-place radix-2 FFT (e^(-i 2 pi j k / n)) of n complex numbers at an offset and stride
function fft(re: Float64Array, im: Float64Array, off: number, stride: number, n: number, cosT: Float64Array, sinT: Float64Array): void {
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1

    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit

    if (i < j) {
      const a = off + i * stride
      const b = off + j * stride
      const tr = re[a] as number
      const ti = im[a] as number

      re[a] = re[b] as number
      im[a] = im[b] as number
      re[b] = tr
      im[b] = ti
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const step = n / len

    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = cosT[k * step] as number
        const wi = -(sinT[k * step] as number)
        const a = off + (i + k) * stride
        const b = off + (i + k + len / 2) * stride
        const xr = (re[b] as number) * wr - (im[b] as number) * wi
        const xi = (re[b] as number) * wi + (im[b] as number) * wr

        re[b] = (re[a] as number) - xr
        im[b] = (im[a] as number) - xi
        re[a] = (re[a] as number) + xr
        im[a] = (im[a] as number) + xi
      }
    }
  }
}

function fft4(re: Float64Array, im: Float64Array, L: number, cosT: Float64Array, sinT: Float64Array): void {
  const strides = [L * L * L, L * L, L, 1]

  for (let axis = 0; axis < 4; axis++) {
    const s = strides[axis] as number

    for (let base = 0; base < L ** 4; base++) {
      // a line starts where this axis's coordinate is 0
      if (Math.floor(base / s) % L !== 0) continue
      fft(re, im, base, s, L, cosT, sinT)
    }
  }
}

export type PairContent = { total: number; loveOff: number; fearOff: number; stores: number; parseval: number }

// the weight of each member OFF span(z, T(p) z) (love at momentum p, fear at -p; total K = 0), over the box torus of
// side L (a power of 2, at least 2 radius + 1, so no two ball sites alias), as fractions of the non-store weight;
// `parseval` is |sum_p |psi(p)|^2 / L^4 - sum_y |v(y)|^2| relative
export function pairContent(ball: Ball, v: MesonState, L: number): PairContent {
  if ((L & (L - 1)) !== 0 || L < 2 * ball.radius + 1) throw new Error('odd-phase: the box side must be a power of 2 over the ball')

  const L4 = L ** 4
  const at = ball.points.map(p => p.reduce((s, x) => s * L + (((x % L) + L) % L), 0))
  const cosT = Float64Array.from({ length: L }, (_, k) => Math.cos((2 * Math.PI * k) / L))
  const sinT = Float64Array.from({ length: L }, (_, k) => Math.sin((2 * Math.PI * k) / L))
  const n = ball.points.length
  // the integer phase index of p . r_d (mod L) for p = 2 pi j / L: j . r_d mod L, per momentum index and slot
  const coord = (idx: number, axis: number): number => Math.floor(idx / L ** (3 - axis)) % L
  const rootInt = R.map(r => r.map(x => Math.round(x)))
  const res = Array.from({ length: 24 }, () => new Float64Array(L4))
  const ims = Array.from({ length: 24 }, () => new Float64Array(L4))
  let total = 0
  let momentumTotal = 0
  let loveOff = 0
  let fearOff = 0
  const sz = 1 / Math.sqrt(24)

  // side 0: love (fixed fear slot, the love's 24-vector at p); side 1: fear (fixed love slot, the fear's at -p)
  for (const side of [0, 1]) {
    for (let fixed = 0; fixed < 24; fixed++) {
      for (let s = 0; s < 24; s++) {
        ;(res[s] as Float64Array).fill(0)
        ;(ims[s] as Float64Array).fill(0)
      }

      for (let i = 0; i < n; i++) {
        for (let s = 0; s < 24; s++) {
          const e = side === 0 ? i * 576 + s * 24 + fixed : i * 576 + fixed * 24 + s

          ;(res[s] as Float64Array)[at[i] as number] = v.re[e] as number
          ;(ims[s] as Float64Array)[at[i] as number] = v.im[e] as number
        }
      }

      for (let s = 0; s < 24; s++) fft4(res[s] as Float64Array, ims[s] as Float64Array, L, cosT, sinT)

      for (let idx = 0; idx < L4; idx++) {
        const j = [coord(idx, 0), coord(idx, 1), coord(idx, 2), coord(idx, 3)]
        let ar = 0
        let ai = 0
        let cr = 0
        let ci = 0
        let g = 0
        let w = 0

        for (let s = 0; s < 24; s++) {
          const xr = (res[s] as Float64Array)[idx] as number
          const xi = (ims[s] as Float64Array)[idx] as number
          const r = rootInt[s] as number[]
          // the member's momentum: p for the love, -p for the fear; (T(q) z)^dag psi = sum_s e^(+i q . r_s) psi_s / sqrt 24
          const m = ((((j[0] as number) * (r[0] as number) + (j[1] as number) * (r[1] as number) + (j[2] as number) * (r[2] as number) + (j[3] as number) * (r[3] as number)) % L) + L) % L
          const c = cosT[m] as number
          const sn = side === 0 ? (sinT[m] as number) : -(sinT[m] as number)

          ar += xr
          ai += xi
          cr += c * xr - sn * xi
          ci += c * xi + sn * xr
          g += c / 24
          w += xr * xr + xi * xi
        }

        ar *= sz
        ai *= sz
        cr *= sz
        ci *= sz

        const onA = ar * ar + ai * ai
        const d = 1 - g * g
        const br = cr - g * ar
        const bi = ci - g * ai
        const on = d > 1e-12 ? onA + (br * br + bi * bi) / d : onA

        if (side === 0) {
          loveOff += w - on
          momentumTotal += w
        } else fearOff += w - on
      }
    }
  }

  for (let i = 0; i < n; i++) for (let e = 0; e < 576; e++) total += (v.re[i * 576 + e] as number) ** 2 + (v.im[i * 576 + e] as number) ** 2

  let stores = 0

  for (let j = 0; j < 24; j++) stores += (v.re[n * 576 + j] as number) ** 2 + (v.im[n * 576 + j] as number) ** 2

  return { total, loveOff: loveOff / momentumTotal, fearOff: fearOff / momentumTotal, stores, parseval: Math.abs(momentumTotal / L4 - total) / total }
}
