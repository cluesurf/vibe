// DOES R*'s OWN COLOUR HASH LOCALIZE A LONE THIRD, OR ONLY SLOW IT? (moving-matter item 0083, candidate P of
// research/outside-the-box.md 1.3 and 3.3, decision 017 point 3). A static colour field confines a lone third only by
// localization, so this reads the localization of the cage engine's own cycle (holonomy-caging cagingBeat, the operator
// color-gates-cage dockCageRead and E-SPN-0196 evolve: roleLinks on the weave's Weyl link start, section 'weyl', the
// colour triplet k 3, mixer u = ringUnit(-1, 4)) on bulk boxes of side 6, 8 and 10, from its level statistics and its
// Thouless number.
//
// THE REDUCTION, exact (cage-velocity's, here for any link field). One cycle is B = T P_D T P_S with P_S = 1 + (u - 1) S S^dag
// (S the slot-uniform register vectors at every dock and colour), P_D = 1 + (conj u - 1) E E^dag (partnerBasis E) and the
// stream T, which turns colour by the link matrix and satisfies T^2 = 1 because a link and its reverse are inverse. So
// B = (1 + (conj u - 1) F F^dag)(1 + (u - 1) S S^dag) with F = T E: B is 1 off span(S, F), and on it its levels are
// e^(+-i eps) with cos eps = cos mu + sigma^2 (1 - cos mu), sigma the singular values of the overlap X = S^dag F. X is a
// sparse dock operator: X(x, y) = sum over slots d with y + r_d = x of G_d (x) R(y, d), G_d[a][e] = E[(-d, a), e] / sqrt 24.
// The levels of B are therefore read from H = X X^dag (24 rows a dock: 8 register x 3 colours).
//
// THE SECTOR, exact. The real 8 x 8 blocks G_d have an 8-dimensional commutant, M_2(C) + M_2(C): the register splits into
// two inequivalent 2-dimensional irreps, each twice, and every level of H is exactly two-fold. One copy of one irrep (an
// eigenspace of a generic Hermitian element of the commutant, P 8 x 2) carries an operator of 6 rows a dock (2 register x
// 3 colours) with the same levels, each once. The colour links act on colour only, so they commute with the split.
//
// THE LEVELS. Lanczos without reorthogonalization on the sector's H (Cullum and Willoughby: copies of a converged level
// are kept once, a simple level of T that T-hat, T without its first row and column, also has is spurious), run until the
// good levels number the sector's dimension, which is the completeness witness. The quasienergy eps(x) is monotone in x, so
// the window levels and their global ranks come from the sorted x.
//
// GATES (fixed 2026-10-09 before any read): CUE <r> 0.5996, Poisson 0.3863. LOCALIZED when in at least two windows <r> at
// the largest side is at most 0.42 and falls with side, and g falls by at least 2 from the smallest side to the largest.
// DIFFUSE when <r> is at least 0.57 at every side in every window and g does not fall. OPEN otherwise. The brief's windows
// (eps 0, pi/2, pi) hold no dispersive level of this cycle, so the windows are the band's rank quantiles (QUANTILES).
//
// DETERMINISM: no Math.random; the Lanczos start is a murmur3-finalizer hash of the index. FLOAT: measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { partnerBasis } from '@/code/measure/register-meson'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { d4BoxCoordinates, d4BoxMesh } from '@/code/substrate/d4-box-integer'
import { gaugeField, ruleField, sigmaTable, type ColorField } from '@/code/measure/color-gates'
import { bulkBox } from '@/code/measure/color-slab'
import { cagingBeat, cagingEngine, type CagingState } from '@/code/measure/holonomy-caging'

const SLOTS = 24
const REG = 8

export const SIDES = [6, 8, 10] as const
export const THETA = 0.1
export const CUE_R = 0.5996
export const POISSON_R = 0.3863
export const LOCALIZED_R = 0.42
export const DIFFUSE_R = 0.57
export const WINDOW_LEVELS = 256
// The brief's windows (eps 0, pi/2, pi) hold no dispersive level: the dispersive band is eps in [2.24, 2.76] (side 4
// dense, x = sigma^2 <= 0.1585), eps 0 holds only the exactly flat levels off span(S, F) (B = 1 there), and pi/2 and pi
// hold nothing. The windows read are therefore at the band's rank quantiles 1/4, 1/2 and 3/4 (a deviation, logged).
export const QUANTILES = [0.25, 0.5, 0.75] as const

export const MU = unitAngle(ringUnit(-1, 4))
export const COS_MU = Math.cos(MU)

// ---- the register sector ----

export type Sector = {
  // P: 8 x 2 complex, column-major per vector: P[(v * 8 + a) * 2 + {0 re, 1 im}]
  P: Float64Array
  // G[d]: 2 x 2 complex row-major interleaved, P^dag G_d P
  G: Float64Array[]
  // max |G_d P - P G'_d| and |G_d^T P - P G'_d^dag| over d
  invarianceGap: number
  commutantDim: number
  // the generic commutant element's eigenvalues (four distinct, each two-fold)
  jValues: number[]
}

const gBlock = (E: Float64Array, d: number): number[][] =>
  Array.from({ length: REG }, (_, a) =>
    Array.from({ length: REG }, (_, e) => E[(OPPOSITE[d]! * REG + a) * REG + e]! / Math.sqrt(SLOTS)),
  )

function commutantBasis(Gs: number[][][]): number[][] {
  const n = 64
  const rows: number[][] = []

  for (const G of Gs) {
    for (const M of [G, G.map((_, i) => G.map(r => r[i]!))]) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const row = Array<number>(n).fill(0)

          for (let l = 0; l < 8; l++) {
            row[i * 8 + l]! += M[l]![j]!
            row[l * 8 + j]! -= M[i]![l]!
          }

          rows.push(row)
        }
      }
    }
  }

  const A = rows.map(r => r.slice())
  const pivots: number[] = []

  let rank = 0

  for (let c = 0; c < n; c++) {
    let p = -1
    let best = 1e-9

    for (let r = rank; r < A.length; r++) {
      if (Math.abs(A[r]![c]!) > best) {
        best = Math.abs(A[r]![c]!)
        p = r
      }
    }

    if (p < 0) {
      continue
    }

    ;[A[rank], A[p]] = [A[p]!, A[rank]!]

    const pv = A[rank]![c]!

    for (let q = 0; q < n; q++) {
      A[rank]![q]! /= pv
    }

    for (let r = 0; r < A.length; r++) {
      if (r !== rank) {
        const f = A[r]![c]!

        if (f !== 0) {
          for (let q = 0; q < n; q++) {
            A[r]![q]! -= f * A[rank]![q]!
          }
        }
      }
    }

    pivots.push(c)
    rank++
  }

  return Array.from({ length: n }, (_, c) => c)
    .filter(c => !pivots.includes(c))
    .map(f => {
      const v = Array<number>(n).fill(0)

      v[f] = 1
      pivots.forEach((c, r) => {
        v[c] = -A[r]![f]!
      })

      return v
    })
}

export function registerSector(which = 0): Sector {
  const E = partnerBasis()
  const Gs = Array.from({ length: SLOTS }, (_, d) => gBlock(E, d))
  const nulls = commutantBasis(Gs)
  const Jr = new Float64Array(64)
  const Ji = new Float64Array(64)

  nulls.forEach((v, i) =>
    v.forEach((x, q) => {
      Jr[q]! += Math.sin(1.3 * i + 0.7) * x
      Ji[q]! += Math.cos(2.1 * i + 0.3) * x
    }),
  )

  const Hr = new Float64Array(64)
  const Hi = new Float64Array(64)

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      Hr[i * 8 + j] = (Jr[i * 8 + j]! + Jr[j * 8 + i]!) / 2
      Hi[i * 8 + j] = (Ji[i * 8 + j]! - Ji[j * 8 + i]!) / 2
    }
  }

  const eig = hermitianEigenRows(8, Hr, Hi)
  const P = new Float64Array(32)

  for (let v = 0; v < 2; v++) {
    const row = 2 * which + v

    for (let a = 0; a < 8; a++) {
      P[(v * 8 + a) * 2] = eig.vectorsRe[row * 8 + a]!
      P[(v * 8 + a) * 2 + 1] = eig.vectorsIm[row * 8 + a]!
    }
  }

  // G'_d = P^dag G_d P, and the invariance gaps
  let gap = 0

  const G = Gs.map(Gd => {
    const out = new Float64Array(8)
    // GP[a][v] = sum_b Gd[a][b] P[b][v]
    const gp = (M: number[][], a: number, v: number): [number, number] => {
      let r = 0
      let m = 0

      for (let b = 0; b < 8; b++) {
        r += M[a]![b]! * P[(v * 8 + b) * 2]!
        m += M[a]![b]! * P[(v * 8 + b) * 2 + 1]!
      }

      return [r, m]
    }

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        let r = 0
        let m = 0

        for (let a = 0; a < 8; a++) {
          const [xr, xi] = gp(Gd, a, j)
          const pr = P[(i * 8 + a) * 2]!
          const pi = -P[(i * 8 + a) * 2 + 1]!

          r += pr * xr - pi * xi
          m += pr * xi + pi * xr
        }

        out[2 * (2 * i + j)] = r
        out[2 * (2 * i + j) + 1] = m
      }
    }

    const GT = Gd.map((_, i) => Gd.map(row => row[i]!))

    for (let a = 0; a < 8; a++) {
      for (let j = 0; j < 2; j++) {
        // (G P)[a][j] - sum_i P[a][i] G'[i][j]
        const [xr, xi] = gp(Gd, a, j)
        const [yr, yi] = gp(GT, a, j)

        let pr = 0
        let pm = 0
        let qr = 0
        let qm = 0

        for (let i = 0; i < 2; i++) {
          const ar = P[(i * 8 + a) * 2]!
          const ai = P[(i * 8 + a) * 2 + 1]!
          const gr = out[2 * (2 * i + j)]!
          const gi = out[2 * (2 * i + j) + 1]!
          // G'^dag[i][j] = conj G'[j][i]
          const hr = out[2 * (2 * j + i)]!
          const hi = -out[2 * (2 * j + i) + 1]!

          pr += ar * gr - ai * gi
          pm += ar * gi + ai * gr
          qr += ar * hr - ai * hi
          qm += ar * hi + ai * hr
        }

        gap = Math.max(gap, Math.hypot(xr - pr, xi - pm), Math.hypot(yr - qr, yi - qm))
      }
    }

    return out
  })

  return { P, G, invarianceGap: gap, commutantDim: nulls.length, jValues: Array.from(eig.values) }
}

// ---- the sector operator X ----

export type SectorOp = {
  side: number
  cells: number
  k: number
  // rows a dock
  dim: number
  n: number
  nb: Int32Array
  // per (y, d): a dim x dim complex block, row-major interleaved
  blk: Float64Array
}

// root steps in basis coordinates, read off the mesh at an interior dock
function rootSteps(side: number): number[][] {
  const mesh = d4BoxMesh({ side })
  const mid = Math.floor(side / 2)
  const x = mid * (1 + side + side * side + side ** 3)
  const c = d4BoxCoordinates({ cell: x, side })

  return Array.from({ length: SLOTS }, (_, d) => {
    const y = d4BoxCoordinates({ cell: mesh.neighbour(x, d), side })

    return y.map((v, q) => v - c[q]!)
  })
}

// link: Sigma(648) element per directed slot (null: identity links, one colour); twist[q]: the phase a link takes per
// wrap across the box seam of basis coordinate q (basis vector q is a root)
export function sectorOp(input: {
  side: number
  link: Int32Array | null
  sector: Sector
  twist: readonly number[]
}): SectorOp {
  const { side, link, sector, twist } = input
  const mesh = d4BoxMesh({ side })
  const cells = side ** 4
  const k = link ? 3 : 1
  const dim = 2 * k
  const steps = rootSteps(side)
  const mats = sigmaTable().lifts.floats
  const nb = new Int32Array(cells * SLOTS)
  const bs = dim * dim * 2
  const blk = new Float64Array(cells * SLOTS * bs)

  for (let y = 0; y < cells; y++) {
    const c = d4BoxCoordinates({ cell: y, side })

    for (let d = 0; d < SLOTS; d++) {
      const l = y * SLOTS + d

      nb[l] = mesh.neighbour(y, d)

      let ph = 0

      for (let q = 0; q < 4; q++) {
        ph += twist[q]! * Math.floor((c[q]! + steps[d]![q]!) / side)
      }

      const pr = Math.cos(ph)
      const pi = Math.sin(ph)
      const G = sector.G[d]!
      const R = link ? mats[link[l]!]! : Float64Array.from([1, 0])
      const o = l * bs

      for (let r = 0; r < 2; r++) {
        for (let r2 = 0; r2 < 2; r2++) {
          const gr0 = G[2 * (2 * r + r2)]!
          const gi0 = G[2 * (2 * r + r2) + 1]!
          const gr = gr0 * pr - gi0 * pi
          const gi = gr0 * pi + gi0 * pr

          for (let a = 0; a < k; a++) {
            for (let b = 0; b < k; b++) {
              const rr = R[2 * (k * a + b)]!
              const ri = R[2 * (k * a + b) + 1]!
              const row = r * k + a
              const col = r2 * k + b

              blk[o + 2 * (row * dim + col)] = gr * rr - gi * ri
              blk[o + 2 * (row * dim + col) + 1] = gr * ri + gi * rr
            }
          }
        }
      }
    }
  }

  return { side, cells, k, dim, n: cells * dim, nb, blk }
}

// out = X v
export function applyX(op: SectorOp, vr: Float64Array, vi: Float64Array, or: Float64Array, oi: Float64Array): void {
  const { cells, dim, nb, blk } = op
  const bs = dim * dim * 2

  or.fill(0)
  oi.fill(0)

  for (let y = 0; y < cells; y++) {
    const src = y * dim

    for (let d = 0; d < SLOTS; d++) {
      const l = y * SLOTS + d
      const dst = nb[l]! * dim
      const o = l * bs

      for (let i = 0; i < dim; i++) {
        let r = 0
        let m = 0
        const ro = o + 2 * i * dim

        for (let j = 0; j < dim; j++) {
          const br = blk[ro + 2 * j]!
          const bi = blk[ro + 2 * j + 1]!
          const xr = vr[src + j]!
          const xi = vi[src + j]!

          r += br * xr - bi * xi
          m += br * xi + bi * xr
        }

        or[dst + i]! += r
        oi[dst + i]! += m
      }
    }
  }
}

// out = X^dag v
export function applyXd(op: SectorOp, vr: Float64Array, vi: Float64Array, or: Float64Array, oi: Float64Array): void {
  const { cells, dim, nb, blk } = op
  const bs = dim * dim * 2

  for (let y = 0; y < cells; y++) {
    const dst = y * dim

    for (let j = 0; j < dim; j++) {
      let r = 0
      let m = 0

      for (let d = 0; d < SLOTS; d++) {
        const l = y * SLOTS + d
        const src = nb[l]! * dim
        const o = l * bs

        for (let i = 0; i < dim; i++) {
          // conj(B[i][j]) v[i]
          const br = blk[o + 2 * (i * dim + j)]!
          const bi = -blk[o + 2 * (i * dim + j) + 1]!
          const xr = vr[src + i]!
          const xi = vi[src + i]!

          r += br * xr - bi * xi
          m += br * xi + bi * xr
        }
      }

      or[dst + j] = r
      oi[dst + j] = m
    }
  }
}

// ---- Lanczos without reorthogonalization, resumable ----

const fmix = (h0: number): number => {
  let h = h0 >>> 0

  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16

  return (h >>> 0) / 2 ** 32 - 0.5
}

export type LanczosRun = {
  op: SectorOp
  alpha: number[]
  beta: number[]
  // current q_j, q_(j-1)
  qr: Float64Array
  qi: Float64Array
  pr: Float64Array
  pi: Float64Array
  tr: Float64Array
  ti: Float64Array
  wr: Float64Array
  wi: Float64Array
  seconds: number
}

export function lanczosStart(op: SectorOp): LanczosRun {
  const n = op.n
  const qr = new Float64Array(n)
  const qi = new Float64Array(n)

  let s = 0

  for (let i = 0; i < n; i++) {
    qr[i] = fmix(2 * i + 0x9e3779b9)
    qi[i] = fmix(2 * i + 1 + 0x7f4a7c15)
    s += qr[i]! ** 2 + qi[i]! ** 2
  }

  s = Math.sqrt(s)

  for (let i = 0; i < n; i++) {
    qr[i]! /= s
    qi[i]! /= s
  }

  return {
    op,
    alpha: [],
    beta: [0],
    qr,
    qi,
    pr: new Float64Array(n),
    pi: new Float64Array(n),
    tr: new Float64Array(n),
    ti: new Float64Array(n),
    wr: new Float64Array(n),
    wi: new Float64Array(n),
    seconds: 0,
  }
}

export function lanczosSteps(run: LanczosRun, steps: number): void {
  const started = Date.now()
  const { op, qr, qi, pr, pi, tr, ti, wr, wi } = run
  const n = op.n

  for (let s = 0; s < steps; s++) {
    applyXd(op, qr, qi, tr, ti)
    applyX(op, tr, ti, wr, wi)

    const b = run.beta[run.beta.length - 1]!

    let a = 0

    for (let i = 0; i < n; i++) {
      a += qr[i]! * wr[i]! + qi[i]! * wi[i]!
    }

    let nn = 0

    for (let i = 0; i < n; i++) {
      const xr = wr[i]! - a * qr[i]! - b * pr[i]!
      const xi = wi[i]! - a * qi[i]! - b * pi[i]!

      wr[i] = xr
      wi[i] = xi
      nn += xr * xr + xi * xi
    }

    const bn = Math.sqrt(nn)

    run.alpha.push(a)
    run.beta.push(bn)

    for (let i = 0; i < n; i++) {
      pr[i] = qr[i]!
      pi[i] = qi[i]!
      qr[i] = wr[i]! / bn
      qi[i] = wi[i]! / bn
    }
  }

  run.seconds += (Date.now() - started) / 1000
}

// eigenvalues of the symmetric tridiagonal (d, e), e[i] between i and i + 1 (tql1 with sqrt in place of hypot)
// the diagonal is shifted by 1 while iterating: the QL test is relative, and a cluster of levels at 0 (identity links'
// kernel) never meets it (side 8 identity stalled); the shift is removed at the end
export function tridiagonalValues(d0: ArrayLike<number>, e0: ArrayLike<number>): Float64Array {
  const n = d0.length
  const d = Float64Array.from(d0, v => v + 1)
  const e = new Float64Array(n)

  for (let i = 0; i < n - 1; i++) {
    e[i] = e0[i]!
  }

  for (let l = 0; l < n; l++) {
    let iter = 0

    for (;;) {
      let m = l

      for (; m < n - 1; m++) {
        if (Math.abs(e[m]!) <= Number.EPSILON * (Math.abs(d[m]!) + Math.abs(d[m + 1]!))) {
          break
        }
      }

      if (m === l) {
        break
      }

      if (++iter > 200) {
        throw new Error('tridiagonalValues: the QL iteration did not converge')
      }

      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.sqrt(g * g + 1)

      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? r : -r))

      let s = 1
      let c = 1
      let p = 0
      let i = m - 1

      for (; i >= l; i--) {
        const f = s * e[i]!
        const b = c * e[i]!

        r = Math.sqrt(f * f + g * g)
        e[i + 1] = r

        if (r === 0) {
          d[i + 1] = d[i + 1]! - p
          e[m] = 0
          break
        }

        s = f / r
        c = g / r
        g = d[i + 1]! - p
        r = (d[i]! - g) * s + 2 * c * b
        p = s * r
        d[i + 1] = g + p
        g = c * r - b
      }

      if (r === 0 && i >= l) {
        continue
      }

      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }

  return d.map(v => v - 1).sort()
}

export type GoodLevels = { m: number; good: Float64Array; spurious: number; copies: number }

// Cullum-Willoughby on the first m steps
export function goodLevels(run: LanczosRun, m: number, tol: number): GoodLevels {
  const a = run.alpha.slice(0, m)
  const b = run.beta.slice(1, m)
  const T = tridiagonalValues(a, b)
  const Th = tridiagonalValues(a.slice(1), b.slice(1))
  const good: number[] = []

  let spurious = 0
  let copies = 0
  let j = 0

  for (let i = 0; i < T.length; ) {
    let e = i + 1

    while (e < T.length && T[e]! - T[e - 1]! < tol) {
      e++
    }

    const v = T[i]!

    if (e - i > 1) {
      good.push((v + T[e - 1]!) / 2)
      copies += e - i - 1
    } else {
      while (j < Th.length && Th[j]! < v - tol) {
        j++
      }

      if (j < Th.length && Math.abs(Th[j]! - v) < tol) {
        spurious++
      } else {
        good.push(v)
      }
    }

    i = e
  }

  return { m, good: Float64Array.from(good), spurious, copies }
}

// ---- the reads ----

export const epsOf = (x: number): number => Math.acos(Math.min(1, Math.max(-1, COS_MU + x * (1 - COS_MU))))

export function meanRatio(levels: readonly number[]): number {
  const s = levels.slice(1).map((v, i) => v - levels[i]!)

  let t = 0

  for (let i = 0; i + 1 < s.length; i++) {
    const a = s[i]!
    const b = s[i + 1]!

    t += Math.min(a, b) / Math.max(a, b)
  }

  return t / (s.length - 1)
}

export type WindowRead = {
  center: number
  // levels in the window (eps, ascending) and their global rank in eps
  count: number
  first: number
  lo: number
  hi: number
  r: number
  spacing: number
}

// the WINDOW_LEVELS eps levels (eps >= 0 branch, sorted ascending) around the rank quantile; center is the eps there
export function windowOf(eps: Float64Array, quantile: number): WindowRead {
  const best = Math.round(quantile * (eps.length - 1))
  const center = eps[best]!
  const half = WINDOW_LEVELS / 2
  const first = Math.max(0, Math.min(eps.length - WINDOW_LEVELS, best - half))
  const levels = Array.from(eps.slice(first, first + WINDOW_LEVELS))

  return {
    center,
    count: levels.length,
    first,
    lo: levels[0]!,
    hi: levels[levels.length - 1]!,
    r: meanRatio(levels),
    spacing: (levels[levels.length - 1]! - levels[0]!) / (levels.length - 1),
  }
}

export function epsLevels(good: Float64Array): Float64Array {
  return Float64Array.from(good, epsOf).sort()
}

// mean |E_i(theta) - E_i(0)| over the window, by global rank, over the window's mean spacing
export function thouless(e0: Float64Array, e1: Float64Array, w: WindowRead): number {
  let s = 0

  for (let i = w.first; i < w.first + w.count; i++) {
    s += Math.abs(e1[i]! - e0[i]!)
  }

  return s / w.count / w.spacing
}

// ---- STEP 0: the field's spectrum ----

export type FieldSpectrum = {
  side: number
  // fraction of the non-mean power in the top 1, 10, 100 momenta, averaged over slots
  top1: number
  top10: number
  top100: number
  // the same for a hashed i.i.d. field (murmur3 per slot), the continuous reference
  refTop10: number
  refTop100: number
  // the hash frequency per dock index and its basis-coordinate wave vector (cycles per dock)
  beta: number
  q: number[]
  // the strongest momenta of slot 0 (in cycles, j / side) and their power fraction, and the nearest n q
  peaks: { j: number[]; frac: number; n: number; dist: number }[]
}

function powerSpectrum(f: Float64Array, side: number): Float64Array {
  // separable DFT over the four coordinates
  let re = Float64Array.from(f)
  let im = new Float64Array(f.length)
  const cs = Array.from({ length: side }, (_, t) => Math.cos((2 * Math.PI * t) / side))
  const sn = Array.from({ length: side }, (_, t) => -Math.sin((2 * Math.PI * t) / side))

  for (let q = 0; q < 4; q++) {
    const stride = side ** q
    const nr = new Float64Array(f.length)
    const ni = new Float64Array(f.length)

    for (let x = 0; x < f.length; x++) {
      const cq = Math.floor(x / stride) % side
      const base = x - cq * stride

      if (cq !== 0) {
        continue
      }

      for (let kq = 0; kq < side; kq++) {
        let r = 0
        let m = 0

        for (let t = 0; t < side; t++) {
          const c = cs[(kq * t) % side]!
          const s = sn[(kq * t) % side]!
          const vr = re[base + t * stride]!
          const vi = im[base + t * stride]!

          r += c * vr - s * vi
          m += c * vi + s * vr
        }

        nr[base + kq * stride] = r
        ni[base + kq * stride] = m
      }
    }

    re = nr
    im = ni
  }

  return Float64Array.from(re, (v, i) => v * v + im[i]! ** 2)
}

const topFractions = (p: Float64Array): number[] => {
  const s = Array.from(p.slice(1)).sort((a, b) => b - a)
  const tot = s.reduce((a, b) => a + b, 0)
  const sum = (n: number): number => s.slice(0, n).reduce((a, b) => a + b, 0) / tot

  return [sum(1), sum(10), sum(100)]
}

export function fieldSpectrum(side: number): FieldSpectrum {
  const t = sigmaTable()
  const link = ruleField('weyl').on(bulkBox(side), 'bulk')
  const cells = side ** 4
  const tops: number[][] = []
  const refs: number[][] = []

  let p0: Float64Array | undefined

  for (let d = 0; d < SLOTS; d++) {
    const f = Float64Array.from({ length: cells }, (_, x) => t.reTr[link[x * SLOTS + d]!]!)
    const p = powerSpectrum(f, side)

    if (d === 0) {
      p0 = p
    }

    tops.push(topFractions(p))

    const g = Float64Array.from({ length: cells }, (_, x) => t.reTr[Math.floor((fmix(x * SLOTS + d + 77) + 0.5) * 648)]!)

    refs.push(topFractions(powerSpectrum(g, side)))
  }

  const mean = (k: number, a: number[][]): number => a.reduce((s, v) => s + v[k]!, 0) / a.length
  const beta = ((SLOTS * 40503) % 65536) / 65536
  const q = [0, 1, 2, 3].map(i => (beta * side ** i) % 1)
  const order = Array.from(p0!.keys()).slice(1).sort((a, b) => p0![b]! - p0![a]!)
  const tot = p0!.slice(1).reduce((a, b) => a + b, 0)
  const circ = (v: number): number => Math.abs(v - Math.round(v))
  const peaks = order.slice(0, 12).map(i => {
    const j = d4BoxCoordinates({ cell: i, side }).map(v => v / side)
    // the nearest harmonic n q (|n| <= 12), distance in cycles (max over coordinates, mod 1)
    let bestN = 0
    let bestD = Infinity

    for (let nn = -12; nn <= 12; nn++) {
      if (nn === 0) {
        continue
      }

      const dist = Math.max(...q.map((qq, k) => circ(nn * qq - j[k]!)))

      if (dist < bestD) {
        bestD = dist
        bestN = nn
      }
    }

    return { j, frac: p0![i]! / tot, n: bestN, dist: bestD }
  })

  return {
    side,
    top1: mean(0, tops),
    top10: mean(1, tops),
    top100: mean(2, tops),
    refTop10: mean(1, refs),
    refTop100: mean(2, refs),
    beta,
    q,
    peaks,
  }
}

// The hash as a function of one phase. A link slot i = 24 x + d first met at (x, d) holds the lift
// lifts[floor(216 w / 2^16)][floor(3 w' / 2^16)] with w = (i + 1) 40503 mod 2^16 and w' = w + 27145 mod 2^16 (vibe-weave
// linkStart, section 'weyl'), so along the dock index x its Re Tr / 3 is a function of w alone, and w steps by
// 24 * 40503 mod 2^16 = 54568 = 8 * 6821: the field is exactly periodic in the dock index with period 8192 (a one-phase,
// pure-point field whose Bragg peaks sit at n q, q = beta (1, L, L^2, L^3)). Its harmonic powers over that period:
export type HashHarmonics = {
  period: number
  // the strongest harmonics n (cycles per period) with their power fraction
  top: { n: number; frac: number }[]
  top10: number
  top100: number
  // participation 1 / sum p^2 of the non-mean power over the period's harmonics
  participation: number
  // the same participation for a murmur3-hashed sequence of the same length (a continuous reference)
  refParticipation: number
}

function dft1Power(f: Float64Array): Float64Array {
  const n = f.length
  const out = new Float64Array(n)
  const cs = Float64Array.from({ length: n }, (_, t) => Math.cos((2 * Math.PI * t) / n))
  const sn = Float64Array.from({ length: n }, (_, t) => Math.sin((2 * Math.PI * t) / n))

  for (let k = 0; k < n; k++) {
    let r = 0
    let m = 0

    for (let t = 0; t < n; t++) {
      const j = (k * t) % n

      r += cs[j]! * f[t]!
      m -= sn[j]! * f[t]!
    }

    out[k] = r * r + m * m
  }

  return out
}

const participationOf = (p: Float64Array): number => {
  const s = p.slice(1)
  const tot = s.reduce((a, b) => a + b, 0)

  return 1 / s.reduce((a, b) => a + (b / tot) ** 2, 0)
}

export function hashHarmonics(d: number): HashHarmonics {
  const t = sigmaTable()
  const period = 8192
  const f = Float64Array.from({ length: period }, (_, x) => {
    const i = x * SLOTS + d
    const w = (Math.imul(i + 1, 40503) >>> 0) & 0xffff
    const w2 = (w + 27145) & 0xffff

    return t.reTr[t.lifts.lifts[(w * 216) >>> 16]![(w2 * 3) >>> 16]!]!
  })
  const p = dft1Power(f)
  const g = Float64Array.from({ length: period }, (_, x) => t.reTr[Math.floor((fmix(x * 31 + d + 5) + 0.5) * 648)]!)
  const tot = p.slice(1).reduce((a, b) => a + b, 0)
  const order = Array.from(p.keys()).slice(1).sort((a, b) => p[b]! - p[a]!)
  const sum = (k: number): number => order.slice(0, k).reduce((a, i) => a + p[i]!, 0) / tot

  return {
    period,
    top: order.slice(0, 10).map(n => ({ n: n > period / 2 ? n - period : n, frac: p[n]! / tot })),
    top10: sum(10),
    top100: sum(100),
    participation: participationOf(p),
    refParticipation: participationOf(dft1Power(g)),
  }
}

// ---- witnesses ----

// the cycle against (1 + (conj u - 1) F F^dag)(1 + (u - 1) S S^dag) on a hashed vector, and the sector X against
// P^dag S^dag T E P, on the full 8-register colour carriage of the cage engine
export function reductionWitness(side: number, field: ColorField, sector: Sector): { cycleGap: number; xGap: number; t2Gap: number } {
  const box = bulkBox(side)
  const weave = makeColorWeave({ side, table: 'bind' })
  const link = field.on(box, 'bulk')
  const mats = sigmaTable().lifts.floats
  const u: [number, number] = [Math.cos(MU), Math.sin(MU)]
  const eng = cagingEngine(weave, { k: 3, mats, link }, u)
  const tEng = cagingEngine(weave, { k: 3, mats, link }, [1, 0])
  const cells = box.cells
  const N = cells * SLOTS * REG * 3
  const E = partnerBasis()
  const T = (s: CagingState): CagingState => cagingBeat(tEng, { re: Float64Array.from(s.re), im: Float64Array.from(s.im) }, 0)
  const v: CagingState = { re: new Float64Array(N), im: new Float64Array(N) }

  for (let i = 0; i < N; i++) {
    v.re[i] = fmix(3 * i + 11)
    v.im[i] = fmix(3 * i + 12)
  }

  const idx = (x: number, d: number, a: number, c: number): number => ((x * SLOTS + d) * REG + a) * 3 + c
  // S^dag v: (x, a, c) -> sum_d v / sqrt 24 ; E^dag v: (x, e, c) -> sum_m E[m][e] v
  const sDag = (s: CagingState): CagingState => {
    const o = { re: new Float64Array(cells * 24), im: new Float64Array(cells * 24) }

    for (let x = 0; x < cells; x++) {
      for (let d = 0; d < SLOTS; d++) {
        for (let a = 0; a < REG; a++) {
          for (let c = 0; c < 3; c++) {
            o.re[(x * REG + a) * 3 + c]! += s.re[idx(x, d, a, c)]! / Math.sqrt(SLOTS)
            o.im[(x * REG + a) * 3 + c]! += s.im[idx(x, d, a, c)]! / Math.sqrt(SLOTS)
          }
        }
      }
    }

    return o
  }
  const sOf = (c8: CagingState): CagingState => {
    const o = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let x = 0; x < cells; x++) {
      for (let d = 0; d < SLOTS; d++) {
        for (let a = 0; a < REG; a++) {
          for (let c = 0; c < 3; c++) {
            o.re[idx(x, d, a, c)] = c8.re[(x * REG + a) * 3 + c]! / Math.sqrt(SLOTS)
            o.im[idx(x, d, a, c)] = c8.im[(x * REG + a) * 3 + c]! / Math.sqrt(SLOTS)
          }
        }
      }
    }

    return o
  }
  const eDag = (s: CagingState): CagingState => {
    const o = { re: new Float64Array(cells * 24), im: new Float64Array(cells * 24) }

    for (let x = 0; x < cells; x++) {
      for (let m = 0; m < SLOTS * REG; m++) {
        for (let e = 0; e < REG; e++) {
          const w = E[m * REG + e]!

          for (let c = 0; c < 3; c++) {
            o.re[(x * REG + e) * 3 + c]! += w * s.re[(x * SLOTS * REG + m) * 3 + c]!
            o.im[(x * REG + e) * 3 + c]! += w * s.im[(x * SLOTS * REG + m) * 3 + c]!
          }
        }
      }
    }

    return o
  }
  const eOf = (c8: CagingState): CagingState => {
    const o = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let x = 0; x < cells; x++) {
      for (let m = 0; m < SLOTS * REG; m++) {
        for (let e = 0; e < REG; e++) {
          const w = E[m * REG + e]!

          for (let c = 0; c < 3; c++) {
            o.re[(x * SLOTS * REG + m) * 3 + c]! += w * c8.re[(x * REG + e) * 3 + c]!
            o.im[(x * SLOTS * REG + m) * 3 + c]! += w * c8.im[(x * REG + e) * 3 + c]!
          }
        }
      }
    }

    return o
  }
  const axpy = (y: CagingState, x: CagingState, ar: number, ai: number): CagingState => ({
    re: Float64Array.from(y.re, (v0, i) => v0 + ar * x.re[i]! - ai * x.im[i]!),
    im: Float64Array.from(y.im, (v0, i) => v0 + ar * x.im[i]! + ai * x.re[i]!),
  })
  // cycle by the engine
  let w = cagingBeat(eng, { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }, 0)

  w = cagingBeat(eng, w, 1)

  // by the formula: w1 = v + (u - 1) S S^dag v ; w2 = w1 + (conj u - 1) F F^dag w1, F = T E
  const w1 = axpy(v, sOf(sDag(v)), u[0] - 1, u[1])
  const fw = T(eOf(eDag(T(w1))))
  const w2 = axpy(w1, fw, u[0] - 1, -u[1])

  let cycleGap = 0
  let t2Gap = 0

  const tt = T(T(v))

  for (let i = 0; i < N; i++) {
    cycleGap = Math.max(cycleGap, Math.abs(w.re[i]! - w2.re[i]!), Math.abs(w.im[i]! - w2.im[i]!))
    t2Gap = Math.max(t2Gap, Math.abs(tt.re[i]! - v.re[i]!), Math.abs(tt.im[i]! - v.im[i]!))
  }

  // the sector X against P^dag S^dag T E P: c (cells x 2 x 3) embedded by P into (x, e, c)
  const op = sectorOp({ side, link, sector, twist: [0, 0, 0, 0] })
  const cr = Float64Array.from({ length: op.n }, (_, i) => fmix(5 * i + 1))
  const ci = Float64Array.from({ length: op.n }, (_, i) => fmix(5 * i + 2))
  const c8: CagingState = { re: new Float64Array(cells * 24), im: new Float64Array(cells * 24) }

  for (let x = 0; x < cells; x++) {
    for (let e = 0; e < REG; e++) {
      for (let c = 0; c < 3; c++) {
        let r = 0
        let m = 0

        for (let s = 0; s < 2; s++) {
          const pr = sector.P[(s * 8 + e) * 2]!
          const pi = sector.P[(s * 8 + e) * 2 + 1]!
          const vr = cr[x * 6 + s * 3 + c]!
          const vi = ci[x * 6 + s * 3 + c]!

          r += pr * vr - pi * vi
          m += pr * vi + pi * vr
        }

        c8.re[(x * REG + e) * 3 + c] = r
        c8.im[(x * REG + e) * 3 + c] = m
      }
    }
  }

  const full = sDag(T(eOf(c8)))
  const or = new Float64Array(op.n)
  const oi = new Float64Array(op.n)

  applyX(op, cr, ci, or, oi)

  let xGap = 0

  for (let x = 0; x < cells; x++) {
    for (let s = 0; s < 2; s++) {
      for (let c = 0; c < 3; c++) {
        // P^dag full
        let r = 0
        let m = 0

        for (let a = 0; a < REG; a++) {
          const pr = sector.P[(s * 8 + a) * 2]!
          const pi = -sector.P[(s * 8 + a) * 2 + 1]!
          const vr = full.re[(x * REG + a) * 3 + c]!
          const vi = full.im[(x * REG + a) * 3 + c]!

          r += pr * vr - pi * vi
          m += pr * vi + pi * vr
        }

        xGap = Math.max(xGap, Math.abs(r - or[x * 6 + s * 3 + c]!), Math.abs(m - oi[x * 6 + s * 3 + c]!))
      }
    }
  }

  return { cycleGap, xGap, t2Gap }
}

// the dense H of a sector operator (small sides only)
export function denseLevels(op: SectorOp): Float64Array {
  const n = op.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const er = new Float64Array(n)
  const ei = new Float64Array(n)
  const tr = new Float64Array(n)
  const ti = new Float64Array(n)
  const or = new Float64Array(n)
  const oi = new Float64Array(n)

  for (let j = 0; j < n; j++) {
    er.fill(0)
    er[j] = 1
    applyXd(op, er, ei, tr, ti)
    applyX(op, tr, ti, or, oi)

    for (let i = 0; i < n; i++) {
      re[i * n + j] = or[i]!
      im[i * n + j] = oi[i]!
    }
  }

  return hermitianEigenRows(n, re, im, 0).values
}

export const fields = {
  rule: ruleField('weyl'),
  gauge: gaugeField(ruleField('weyl'), 1),
}

// ---- the verdict ----

export type SideRead = {
  side: number
  name: string
  theta: number
  n: number
  m: number
  goodCount: number
  spurious: number
  complete: boolean
  levels: Float64Array
  seconds: number
}

export type SideSummary = {
  side: number
  windows: WindowRead[]
  g: number[]
  complete: boolean
  missing: number
}

export function summarize(r0: SideRead, r1: SideRead): SideSummary {
  const e0 = epsLevels(r0.levels)
  const e1 = epsLevels(r1.levels)
  const windows = QUANTILES.map(q => windowOf(e0, q))

  return {
    side: r0.side,
    windows,
    g: windows.map(w => thouless(e0, e1, w)),
    // identity links: every level of the clean sector is two-fold (one Lanczos copy each), so the control is complete
    // when its distinct count is half the dimension at both twists (stable from 2n to 6n steps)
    complete:
      e0.length === e1.length &&
      (r0.name === 'identity'
        ? 2 * r0.goodCount === r0.n
        : (r0.complete && r1.complete) || (r0.n - r0.goodCount <= 1 && r1.n - r1.goodCount === r0.n - r0.goodCount)),
    // side 10 holds one level short at both twists from 4n to 6n steps with its windows unchanged (a merged pair or
    // the x = 0 edge); a rank slip inside a window would read g near 1, so g itself witnesses it
    missing: r0.n - r0.goodCount,
  }
}

export function localizationVerdict(rule: readonly SideSummary[], identityAll: readonly SideSummary[], gaugeGap: number): Verdict {
  // the clean control is read on its complete sides only (side 10 at theta 0.1 holds one more exact degeneracy, 9,999
  // distinct levels against 10,000 at theta 0, so its ranks may slip by one); it needs two sides
  const identity = identityAll.filter(s => s.complete)
  const identityDropped = identityAll.filter(s => !s.complete).map(s => s.side)
  const sides = rule.map(s => s.side)
  const nw = QUANTILES.length
  const notes: string[] = []
  const metrics: Record<string, number> = { gaugeGap }

  rule.forEach(s =>
    s.windows.forEach((w, i) => {
      metrics[`r_${s.side}_w${i}`] = w.r
      metrics[`g_${s.side}_w${i}`] = s.g[i]!
    }),
  )

  const complete = rule.every(s => s.complete) && identity.length >= 2

  if (identityDropped.length > 0) {
    notes.push(`identity control read on sides ${identity.map(s => s.side).join(', ')} (side ${identityDropped.join(', ')} incomplete)`)
  }
  const first = rule[0]!
  const last = rule[rule.length - 1]!
  const fallsR = (i: number): boolean => rule.every((s, j) => j === 0 || s.windows[i]!.r < rule[j - 1]!.windows[i]!.r)
  const locWin = Array.from({ length: nw }, (_, i) =>
    last.windows[i]!.r <= LOCALIZED_R && fallsR(i) && first.g[i]! / last.g[i]! >= 2,
  ).filter(Boolean).length
  const diffuse = rule.every(s => s.windows.every(w => w.r >= DIFFUSE_R)) &&
    Array.from({ length: nw }, (_, i) => last.g[i]! >= first.g[i]!).every(Boolean)
  const idGrows = Array.from({ length: nw }, (_, i) => identity[identity.length - 1]!.g[i]! > identity[0]!.g[i]!).every(Boolean)
  const gaugeOk = gaugeGap < 1e-10

  let status: Verdict['status'] = 'open'
  let word = 'OPEN'

  if (!complete) {
    notes.push('a level read is incomplete')
  } else if (!idGrows || !gaugeOk) {
    notes.push(`control failed: identity g grows ${idGrows}, gauge gap ${gaugeGap.toExponential(2)}`)
  } else if (locWin >= 2) {
    status = 'pass'
    word = 'LOCALIZED'
  } else if (diffuse) {
    status = 'fail'
    word = 'DIFFUSE'
  }

  const table = rule
    .map(s => `side ${s.side}: ${s.windows.map((w, i) => `eps ${w.center.toFixed(2)} <r> ${w.r.toFixed(4)} g ${s.g[i]!.toFixed(3)}`).join(', ')}`)
    .join('; ')

  return verdict({
    status,
    claim: `R*'s colour hash ${word} (lead predicted DIFFUSE): ${table}. Identity control g ${identity.map(s => s.g.map(g => g.toFixed(2)).join('/')).join(', ')} over sides ${sides.join(', ')}; gauge gap ${gaugeGap.toExponential(2)}.`,
    metrics,
    control: { gaugeGap, identityGrows: idGrows ? 1 : 0 },
    notes: [
      'The cycle is read through its exact reduction to H = X X^dag on one register sector. The brief windows eps 0, pi/2, pi hold no dispersive level (band eps 2.24 to 2.76), so the windows are the band rank quantiles 1/4, 1/2, 3/4.',
      ...notes,
    ].join(' '),
  })
}

export default experiment({
  id: 'gauge/hash-localization',
  code: 'E-FRC-0304',
  title: "explores whether R*'s own colour hash could localize a lone third, or only slows it, from level statistics and the Thouless number",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // hours: the stage runner deck/vibe/tmp/hloc.sh splits it (tmp/hloc-main.ts)
    return verdict({ status: 'open', claim: 'run by tmp/hloc-main.ts stages', metrics: {}, control: {}, notes: '' })
  },
})
