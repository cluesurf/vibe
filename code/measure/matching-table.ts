// THE REGISTER MEMBER'S ONE-BODY MATCHING TABLE (E-SPN-0195, moving-matter item 0017, Key 1). The nonrelativistic
// expansion of the register member's exact cycle (E-SPN-0160), read as the coefficients of NRQED:
//
//   E = M1 + p^2 / (2 M2) - p^4 / (8 M4^3) - c_F (q / 2 M2) sigma . B + c_D-term + ...
//
// and the parameter-free kinetic mass of a hydrogenic pair built from them (Kronfeld's binding-energy inconsistency,
// first order in the bound state). Measurement only, in doubles, on exact pieces.
//
//   UNITS          per BEAT (half a cycle), with the member's speed c^2 = 1/8 (lattice momenta K on the D4 roots): the
//                  continuum Dirac member sqrt(m^2 + c^2 K^2) then has M1 = M2 = M4 = m, and R = M2 / M1 is E-SPN-0183's R
//                  (its C_STAR2 = 1/2 per cycle). The member of half gap M0 = 2m per cycle has u = e^(i (pi + 2m))
//   closedForm     the exact small-K expansion of diracPhase (E-SPN-0160's band, spinor-register): the D4 roots make
//                  sum_r r_i (K . r)^3 = 12 K_i K^2, so g^2 = |s(K)|^2 / 4 = K^2 / 8 - K^4 / 24 + O(K^6), isotropic to
//                  fourth order, and cos 2 eps = cos 2m - 2 cos^2 m g^2 gives, per beat,
//                    eps = m + K^2 / (16 tan m) - [1 / (48 tan m) + cos 2m cos m / (512 sin^3 m)] K^4 + O(K^6)
//                  so M1 = m, M2 = tan m, (M2 / M4)^3 = (32 / 3) tan^2 m + cos 2m / cos^2 m
//   fitCoefficients the same two coefficients fitted from diracPhase along a direction (K = h, 2h, 3h, 4h; four powers)
//   cycleGap       memberCycle's (register-meson) 16 eigenphases against diracPhase's +-E around pi
//   landau         the member in a weak uniform field B_z (Landau gauge A_y = B x, the exact Peierls phase
//                  e^(i q B x_mid r_y) on the stream, as E-FRC-0252 and E-SPN-0169 couple the light): Bloch in y, z, w,
//                  a chain of slices in x. The register-link-field law (cos E = cos M - 2 cos^2(M / 2) mu, mu an
//                  eigenvalue of C C^dag, C = Q_S T Q_D the covariant Clifford hop) holds in ANY static field, so the
//                  levels come from the Hermitian 8 n x 8 n matrix C C^dag. The spin is the spinor lift's (decision
//                  0006): sigma_z = i L(b), L(s) = cos(phi / 2) + sin(phi / 2) L(b) the lift of the turn e1 -> e2. The
//                  doubler valley at K_x = pi is separated by the slice-shift operator (T + T^dag) / 2
//   coordinateCycle the 16 n coordinate cycle in the field (register-meson's beat formulas with the dressed C), for the
//                  witness that the law holds on the chain
//   kineticMass    the pair's kinetic mass from M1, M2, M4 (and the Darwin exchange at the state's own S)
//
// DETERMINISM: no random numbers.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import { memberCycle, overlapMatrices } from '@/code/measure/register-meson'
import { diracPhase, structureVector } from '@/code/measure/spinor-register'
import {
  leftMultiplication,
  spinLift,
} from '@/code/measure/register-statistics'

const REG = 8
const ROOTS = DOCK_ROOTS
const NR = ROOTS.length

// ---- the member ----

export const memberU = (m: number): [number, number] => [
  Math.cos(Math.PI + 2 * m),
  Math.sin(Math.PI + 2 * m),
]

export type Coefficients = {
  m: number
  M1: number
  M2: number
  M4: number
  // (M2 / M4)^3, the factor the pair's (5/3) E_b carries
  cube: number
  // eps - m = c2 K^2 - c4 K^4 per beat, raw lattice K
  c2: number
  c4: number
}

const C2 = 1 / 8

export function closedForm(m: number): Coefficients {
  const t = Math.tan(m)
  const c2 = 1 / (16 * t)
  const c4 =
    1 / (48 * t) +
    (Math.cos(2 * m) * Math.cos(m)) / (512 * Math.sin(m) ** 3)

  return fromSeries(m, c2, c4)
}

// M2 = c^2 / (2 c2), M4^3 = c^4 / (8 c4)
export function fromSeries(m: number, c2: number, c4: number): Coefficients {
  const M2 = C2 / (2 * c2)
  const M43 = (C2 * C2) / (8 * c4)

  return { m, M1: m, M2, M4: Math.cbrt(M43), cube: M2 ** 3 / M43, c2, c4 }
}

// eps(K) per beat from diracPhase (per cycle)
export const bandPhase = (K: readonly number[], m: number): number =>
  diracPhase(K, 2 * m) / 2

// eps(K) - m per beat without the cancellation of acos near cos 2m: the same law, cos 2m - cos 2 eps = x, written as
// sin(eps - m) = x / (2 sin(eps + m)), x = 2 cos^2 m g^2, solved by iteration (full relative precision at small K)
export function bandExcess(K: readonly number[], m: number): number {
  const g2 = structureVector(K).reduce((a, x) => a + x * x, 0) / 4
  const x = 2 * Math.cos(m) ** 2 * g2

  let d = 0

  for (let i = 0; i < 200; i++) {
    const next = Math.asin(x / (2 * Math.sin(2 * m + d)))

    if (next === d) {
      break
    }

    d = next
  }

  return d
}

function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((r, i) => [...r, b[i]!])

  for (let c = 0; c < n; c++) {
    let p = c

    for (let r = c + 1; r < n; r++) {
      if (Math.abs(M[r]![c]!) > Math.abs(M[p]![c]!)) {
        p = r
      }
    }

    ;[M[c], M[p]] = [M[p]!, M[c]!]

    for (let r = 0; r < n; r++) {
      if (r === c) {
        continue
      }

      const f = M[r]![c]! / M[c]![c]!

      for (let k = c; k <= n; k++) {
        M[r]![k]! -= f * M[c]![k]!
      }
    }
  }

  return M.map((r, i) => r[n]! / r[i]!)
}

// fit eps - m = a1 K^2 + a2 K^4 + a3 K^6 + a4 K^8 at K = h, 2h, 3h, 4h along the unit direction n
export function fitCoefficients(
  m: number,
  n: readonly number[],
  h: number,
): Coefficients {
  const ks = [1, 2, 3, 4].map(j => j * h)
  const A = ks.map(k => [k ** 2, k ** 4, k ** 6, k ** 8])
  const b = ks.map(k => bandExcess(n.map(x => x * k), m))
  const a = solve(A, b)

  return fromSeries(m, a[0]!, -a[1]!)
}

// the largest gap between memberCycle's 16 eigenphases and diracPhase's +-E around pi
export function cycleGap(m: number, K: readonly number[]): number {
  const c = memberCycle(memberU(m), K)
  const ev = complexEigenvalues({ re: c.re, im: c.im, n: 16 })
  const ph = ev.re.map((x, i) => Math.atan2(ev.im[i]!, x)).sort((a, b) => a - b)
  const E = diracPhase(K, 2 * m)
  const want = [
    ...Array<number>(8).fill(wrap(Math.PI + E)),
    ...Array<number>(8).fill(wrap(Math.PI - E)),
  ].sort((a, b) => a - b)

  return Math.max(...ph.map((x, i) => Math.abs(wrap(x - want[i]!))))
}

// ---- the chain in a uniform field ----

export type Chain = {
  n: number
  half: number
  qB: number
  ky: number
  // C, 8 n x 8 n, row-major, [x * 8 + a][y * 8 + eta] (a even, eta odd)
  re: Float64Array
  im: Float64Array
}

// (C b)_x = sum_d c0 gamma(r_d)^T e^(i q B (x - r_d1 / 2) r_d2) e^(-i k_y r_d2) b_(x - r_d1); slices -half .. half, a hop
// out of the chain dropped. kPerp = (ky, kz, kw) the Bloch momenta of the slices (kz = kw = 0 here); kx, if given, makes
// the chain periodic with that twist (the zero-field witness)
export function chain(input: {
  half: number
  qB: number
  ky: number
  periodicKx?: number
}): Chain {
  const { half, qB, ky } = input
  const n = 2 * half + 1
  const N = REG * n
  const re = new Float64Array(N * N)
  const im = new Float64Array(N * N)
  const { dense } = overlapMatrices()

  for (let xi = 0; xi < n; xi++) {
    const x = xi - half

    ROOTS.forEach((r, d) => {
      let yi = xi - r[0]!
      let twist = 0

      if (input.periodicKx !== undefined) {
        if (yi < 0 || yi >= n) {
          // b_(x - r) = b_(x - r +- n) e^(-+ i kx n) for a Bloch state e^(i kx x)
          twist = yi < 0 ? -input.periodicKx * n : input.periodicKx * n
          yi = (yi + n) % n
        }
      } else if (yi < 0 || yi >= n) {
        return
      }

      const ph =
        qB * (x - r[0]! / 2) * r[1]! - ky * r[1]! + twist
      const c = Math.cos(ph)
      const s = Math.sin(ph)
      const g = dense[d]!

      for (let a = 0; a < REG; a++) {
        for (let e = 0; e < REG; e++) {
          const v = g[a]![e]!

          if (v === 0) {
            continue
          }

          const at = (xi * REG + a) * N + yi * REG + e

          re[at]! += c * v
          im[at]! += s * v
        }
      }
    })
  }

  return { n, half, qB, ky, re, im }
}

// H = C C^dag, Hermitian 8 n square, by the band (C couples slices within one)
export function chainSquare(ch: Chain): { re: Float64Array; im: Float64Array } {
  const N = REG * ch.n
  const re = new Float64Array(N * N)
  const im = new Float64Array(N * N)
  const periodic = false

  for (let i = 0; i < N; i++) {
    const xi = Math.floor(i / REG)

    for (let j = i; j < N; j++) {
      const xj = Math.floor(j / REG)

      if (!periodic && Math.abs(xi - xj) > 2) {
        continue
      }

      let sr = 0
      let si = 0
      const lo = Math.max(0, Math.min(xi, xj) - 1) * REG
      const hi = Math.min(ch.n, Math.max(xi, xj) + 2) * REG

      for (let k = lo; k < hi; k++) {
        const ar = ch.re[i * N + k]!
        const ai = ch.im[i * N + k]!
        const br = ch.re[j * N + k]!
        const bi = -ch.im[j * N + k]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      re[i * N + j] = sr
      im[i * N + j] = si
      re[j * N + i] = sr
      im[j * N + i] = -si
    }
  }

  return { re, im }
}

// the 16 n coordinate cycle: a' = u a + (u - 1) C b, b' = conj(u) b + (conj(u) - 1) C^dag a'
export function coordinateCycle(
  ch: Chain,
  u: readonly [number, number],
): { re: Float64Array; im: Float64Array; dim: number } {
  const N = REG * ch.n
  const D = 2 * N
  const M1r = new Float64Array(D * D)
  const M1i = new Float64Array(D * D)
  const M2r = new Float64Array(D * D)
  const M2i = new Float64Array(D * D)
  const [ur, ui] = u

  for (let i = 0; i < N; i++) {
    M1r[i * D + i] = ur
    M1i[i * D + i] = ui
    M1r[(N + i) * D + N + i] = 1
    M2r[i * D + i] = 1
    M2r[(N + i) * D + N + i] = ur
    M2i[(N + i) * D + N + i] = -ui

    for (let j = 0; j < N; j++) {
      const cr = ch.re[i * N + j]!
      const ci = ch.im[i * N + j]!

      // (u - 1) C at [i][N + j]
      M1r[i * D + N + j] = (ur - 1) * cr - ui * ci
      M1i[i * D + N + j] = (ur - 1) * ci + ui * cr
      // (conj u - 1) C^dag at [N + j][i]: C^dag[j][i] = conj C[i][j]
      M2r[(N + j) * D + i] = (ur - 1) * cr - ui * ci
      M2i[(N + j) * D + i] = -(ur - 1) * ci - ui * cr
    }
  }

  const re = new Float64Array(D * D)
  const im = new Float64Array(D * D)

  for (let i = 0; i < D; i++) {
    for (let k = 0; k < D; k++) {
      const ar = M2r[i * D + k]!
      const ai = M2i[i * D + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < D; j++) {
        const br = M1r[k * D + j]!
        const bi = M1i[k * D + j]!

        re[i * D + j]! += ar * br - ai * bi
        im[i * D + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im, dim: D }
}

// cos E = cos M - 2 cos^2(M / 2) mu, per cycle, M = 2m
export const lawPhase = (mu: number, m: number): number =>
  Math.acos(Math.cos(2 * m) - 2 * Math.cos(m) ** 2 * mu)

// ---- small complex helpers on row-major (re, im) square matrices ----

type CVec = { re: Float64Array; im: Float64Array }

function project(
  basis: readonly CVec[],
  apply: (v: CVec) => CVec,
): { re: Float64Array; im: Float64Array } {
  const D = basis.length
  const re = new Float64Array(D * D)
  const im = new Float64Array(D * D)
  const images = basis.map(apply)

  for (let i = 0; i < D; i++) {
    for (let j = 0; j < D; j++) {
      // <v_i | A v_j>
      const a = basis[i]!
      const b = images[j]!

      let sr = 0
      let si = 0

      for (let k = 0; k < a.re.length; k++) {
        sr += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
        si += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
      }

      re[i * D + j] = sr
      im[i * D + j] = si
    }
  }

  // symmetrize (the operators are Hermitian; rounding only)
  for (let i = 0; i < D; i++) {
    for (let j = i; j < D; j++) {
      const r = (re[i * D + j]! + re[j * D + i]!) / 2
      const m = (im[i * D + j]! - im[j * D + i]!) / 2

      re[i * D + j] = r
      re[j * D + i] = r
      im[i * D + j] = m
      im[j * D + i] = -m
    }
  }

  return { re, im }
}

// a sub-basis: the combinations of `basis` given by the small eigenvectors (rows) chosen
function combine(
  basis: readonly CVec[],
  small: { vectorsRe: Float64Array; vectorsIm: Float64Array },
  pick: readonly number[],
): CVec[] {
  const D = basis.length
  const len = basis[0]!.re.length

  return pick.map(p => {
    const re = new Float64Array(len)
    const im = new Float64Array(len)

    for (let j = 0; j < D; j++) {
      const cr = small.vectorsRe[p * D + j]!
      const ci = small.vectorsIm[p * D + j]!
      const v = basis[j]!

      for (let k = 0; k < len; k++) {
        re[k]! += cr * v.re[k]! - ci * v.im[k]!
        im[k]! += cr * v.im[k]! + ci * v.re[k]!
      }
    }

    return { re, im }
  })
}

function matVec(
  M: { re: Float64Array; im: Float64Array },
  N: number,
  v: CVec,
): CVec {
  const re = new Float64Array(N)
  const im = new Float64Array(N)
  const lo = (i: number): number => Math.max(0, (Math.floor(i / REG) - 2) * REG)
  const hi = (i: number): number =>
    Math.min(N, (Math.floor(i / REG) + 3) * REG)

  for (let i = 0; i < N; i++) {
    let sr = 0
    let si = 0

    for (let k = lo(i); k < hi(i); k++) {
      const ar = M.re[i * N + k]!
      const ai = M.im[i * N + k]!

      sr += ar * v.re[k]! - ai * v.im[k]!
      si += ar * v.im[k]! + ai * v.re[k]!
    }

    re[i] = sr
    im[i] = si
  }

  return { re, im }
}

// ---- the spin: the spinor lift's generator of the turn e1 -> e2 ----

// sigma_z = i L(b) on the even register, [row][col] as (re, im); L(s) = cos(phi / 2) + sin(phi / 2) L(b)
export function spinZ(): { re: number[][]; im: number[][]; b: number[] } {
  // the quarter turn e1 -> e2: g e1 = e2, g e2 = -e1 (columns are images)
  const g = [
    [0, -1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]
  const s = spinLift(g)
  const b = s.map((x, k) => (k === 0 ? 0 : x * Math.SQRT2))
  const L = leftMultiplication(b)

  return {
    re: L.map(r => r.map(() => 0)),
    im: L.map(r => [...r]),
    b,
  }
}

export type LandauRead = {
  qB: number
  ky: number
  n: number
  // the low subspace (mu < 3 alpha, alpha = qB / 8): its size and the valley-0 share
  low: number
  valley0: number
  valleyGap: number
  spinGap: number
  up: number
  down: number
  // mu levels of valley 0: (n = 0, sigma +), (n = 0, sigma -), (n = 1, sigma +), each the mean of its cluster, and the
  // spread within each cluster
  mu0Up: number
  mu0Down: number
  mu1Up: number
  spread: number
}

// the Landau levels of valley 0, spin resolved
export function landau(input: {
  qB: number
  ky: number
  half: number
}): LandauRead {
  const ch = chain(input)
  const N = REG * ch.n
  const H = chainSquare(ch)
  const eig = hermitianEigenRows(N, H.re, H.im)
  const alpha = input.qB / 8
  const lowIdx: number[] = []

  for (let i = 0; i < N; i++) {
    if (eig.values[i]! < 3 * alpha) {
      lowIdx.push(i)
    }
  }

  const basis: CVec[] = lowIdx.map(i => ({
    re: eig.vectorsRe.slice(i * N, i * N + N),
    im: eig.vectorsIm.slice(i * N, i * N + N),
  }))

  // the valley: (T + T^dag) / 2, T the slice shift, register kept
  const shift = (v: CVec): CVec => {
    const re = new Float64Array(N)
    const im = new Float64Array(N)

    for (let xi = 0; xi < ch.n; xi++) {
      for (const o of [-1, 1]) {
        const yi = xi + o

        if (yi < 0 || yi >= ch.n) {
          continue
        }

        for (let a = 0; a < REG; a++) {
          re[xi * REG + a]! += v.re[yi * REG + a]! / 2
          im[xi * REG + a]! += v.im[yi * REG + a]! / 2
        }
      }
    }

    return { re, im }
  }
  const Av = project(basis, shift)
  const D = basis.length
  const aEig = hermitianEigenRows(D, Av.re, Av.im)
  const v0 = Array.from({ length: D }, (_, i) => i).filter(
    i => aEig.values[i]! > 0,
  )
  const valleyGap = Math.max(
    ...Array.from(aEig.values, x => 1 - Math.abs(x)),
  )
  const q0 = combine(basis, aEig, v0)

  // the spin in valley 0
  const sz = spinZ()
  const spin = (v: CVec): CVec => {
    const re = new Float64Array(N)
    const im = new Float64Array(N)

    for (let xi = 0; xi < ch.n; xi++) {
      for (let a = 0; a < REG; a++) {
        let sr = 0
        let si = 0

        for (let b = 0; b < REG; b++) {
          const mr = sz.re[a]![b]!
          const mi = sz.im[a]![b]!
          const xr = v.re[xi * REG + b]!
          const xm = v.im[xi * REG + b]!

          sr += mr * xr - mi * xm
          si += mr * xm + mi * xr
        }

        re[xi * REG + a] = sr
        im[xi * REG + a] = si
      }
    }

    return { re, im }
  }
  const Sv = project(q0, spin)
  const D0 = q0.length
  const sEig = hermitianEigenRows(D0, Sv.re, Sv.im)
  const ups = Array.from({ length: D0 }, (_, i) => i).filter(
    i => sEig.values[i]! > 0,
  )
  const downs = Array.from({ length: D0 }, (_, i) => i).filter(
    i => sEig.values[i]! <= 0,
  )
  const spinGap = Math.max(
    ...Array.from(sEig.values, x => Math.abs(1 - Math.abs(x))),
  )
  const qUp = combine(q0, sEig, ups)
  const qDown = combine(q0, sEig, downs)
  const levels = (q: CVec[]): number[] => {
    const P = project(q, v => matVec(H, N, v))

    return Array.from(hermitianEigenRows(q.length, P.re, P.im).values)
  }
  const lUp = levels(qUp)
  const lDown = levels(qDown)
  const d = lDown.length
  const mean = (xs: number[]): number =>
    xs.reduce((s, x) => s + x, 0) / xs.length
  const span = (xs: number[]): number => Math.max(...xs) - Math.min(...xs)
  const c0 = lUp.slice(0, d)
  const c1 = lUp.slice(d, 2 * d)

  return {
    qB: input.qB,
    ky: input.ky,
    n: ch.n,
    low: D,
    valley0: D0,
    valleyGap,
    spinGap,
    up: ups.length,
    down: d,
    mu0Up: mean(c0),
    mu0Down: mean(lDown),
    mu1Up: mean(c1),
    spread: Math.max(span(c0), span(c1), span(lDown)),
  }
}

// c_F at mass m from one field's levels: (E(0, -) - E(0, +)) / (E(1, +) - E(0, +)), and the Landau spacing over its
// continuum value q B / (4 tan m) per cycle
export function cFAt(r: LandauRead, m: number): { cF: number; spacing: number } {
  const e0u = lawPhase(r.mu0Up, m)
  const e0d = lawPhase(r.mu0Down, m)
  const e1u = lawPhase(r.mu1Up, m)

  return {
    cF: (e0d - e0u) / (e1u - e0u),
    spacing: (e1u - e0u) / (r.qB / (4 * Math.tan(m))),
  }
}

// the value at B = 0 of the parabola through three (B, y)
export function extrapolate(xs: readonly number[], ys: readonly number[]): number {
  let s = 0

  for (let i = 0; i < 3; i++) {
    let w = 1

    for (let j = 0; j < 3; j++) {
      if (j !== i) {
        w *= (0 - xs[j]!) / (xs[i]! - xs[j]!)
      }
    }

    s += w * ys[i]!
  }

  return s
}

// ---- the pair's kinetic mass (first order in the bound state) ----

// R of a hydrogenic pair of two members with coefficients k, bound by E_b per beat (measured), the Darwin exchange at
// the state's own S (0 for the static R): (2 M2 + (5/3) E_b (M2 / M4)^3 - (8/3) E_b S) / (2 M1 - E_b)
export const kineticR = (
  k: Pick<Coefficients, 'M1' | 'M2' | 'cube'>,
  Eb: number,
  S: number,
): number =>
  (2 * k.M2 + (5 / 3) * Eb * k.cube - (8 / 3) * Eb * S) / (2 * k.M1 - Eb)

export { NR }
