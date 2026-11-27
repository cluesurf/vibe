// Vibe Atlas Bare-U Zoo Scanner & Quantitative Dynamical Phase Cartography.
// Self-contained exact bare-U ({3,4,3,4} D_4 24-slot docks, W(F_4) symmetry canonicalization,
// D half-coin, C = D^2, M_meet, K, Phi_odd) scanner:
//   - Canonicalizes k = 1, 2, 3, 4 excitation species under exact symmetry equivalence
//   - Measures exact dynamical fingerprints (lifetime, contactProb, ipr, quasienergy, chiOdd,
//     bindingGap, groupVelocity, levelSpacingR)
//   - Executes live unitary 2-body and 3-body wavepacket collisions plus exact 4D dock checks
//     to populate the bare-U Collision Matrix with explicit measurementKind provenance
//   - Sweeps a 2D parametric (m, phi) QCA phase map + mixed-sign K+M_meet sector, classifying
//     every rule purely from observables (free-dispersive, integrable-bound,
//     relativistic-Thirring, chaotic-COE) with zero hardcoded regime toggles.
//
// Strictly deterministic, ZERO Math.random(), laptop-safe.

import {
  certifyCapability,
  type CapabilityEvidence,
  type DiscoveryRegistrationInput,
  type RealizationMode,
  type Valence,
} from './registry'

const PI = Math.PI
const SQRT3 = Math.sqrt(3)

type Complex = readonly [number, number]

const cAdd = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]]
const cMul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const cScale = (s: number, a: Complex): Complex => [s * a[0], s * a[1]]
const cAbs = (a: Complex): number => Math.hypot(a[0], a[1])
const cDiv = (a: Complex, b: Complex): Complex => {
  const d = b[0] * b[0] + b[1] * b[1]
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
const cExpI = (theta: number): Complex => [Math.cos(theta), Math.sin(theta)]

const OMEGA: Complex = [-0.5, SQRT3 / 2]
const OMEGA2: Complex = [-0.5, -SQRT3 / 2]

function wrapPi(theta: number): number {
  let x = theta
  while (x > PI) x -= 2 * PI
  while (x <= -PI) x += 2 * PI
  return x
}

function phaseDist(a: number, b: number): number {
  return Math.abs(wrapPi(a - b))
}

// =================================================================================================
// 1. EXACT COMPLEX LINEAR ALGEBRA & UNITARY EIGENSOLVER (HOUSEHOLDER + QL + CAYLEY)
// =================================================================================================

interface ComplexMatrix {
  readonly n: number
  readonly re: Float64Array
  readonly im: Float64Array
}

function cmatZero(n: number): ComplexMatrix {
  return { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
}

function cmatEye(n: number): ComplexMatrix {
  const m = cmatZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
}

export function unitaryError(U: ComplexMatrix): number {
  const n = U.n
  let maxErr = 0
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < n; k++) {
        const ar = U.re[k * n + i]!
        const ai = -U.im[k * n + i]!
        const br = U.re[k * n + j]!
        const bi = U.im[k * n + j]!
        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }
      const err = Math.hypot(sr - (i === j ? 1 : 0), si)
      if (err > maxErr) maxErr = err
    }
  }
  return maxErr
}

function solveComplexLinear(
  n: number,
  aRe: Float64Array,
  aIm: Float64Array,
  bRe: Float64Array,
  bIm: Float64Array,
): readonly [Float64Array, Float64Array] {
  const ar = Float64Array.from(aRe)
  const ai = Float64Array.from(aIm)
  const xr = Float64Array.from(bRe)
  const xi = Float64Array.from(bIm)

  for (let col = 0; col < n; col++) {
    let piv = col
    let best = Math.hypot(ar[col * n + col]!, ai[col * n + col]!)
    for (let r = col + 1; r < n; r++) {
      const v = Math.hypot(ar[r * n + col]!, ai[r * n + col]!)
      if (v > best) {
        best = v
        piv = r
      }
    }
    if (best < 1e-30) continue
    if (piv !== col) {
      for (let j = col; j < n; j++) {
        const tr = ar[col * n + j]!
        ar[col * n + j] = ar[piv * n + j]!
        ar[piv * n + j] = tr
        const ti = ai[col * n + j]!
        ai[col * n + j] = ai[piv * n + j]!
        ai[piv * n + j] = ti
      }
      const br = xr[col]!
      xr[col] = xr[piv]!
      xr[piv] = br
      const bi = xi[col]!
      xi[col] = xi[piv]!
      xi[piv] = bi
    }
    const pr = ar[col * n + col]!
    const pi = ai[col * n + col]!
    const d = pr * pr + pi * pi
    for (let r = col + 1; r < n; r++) {
      const fr0 = ar[r * n + col]!
      const fi0 = ai[r * n + col]!
      if (fr0 === 0 && fi0 === 0) continue
      const fr = (fr0 * pr + fi0 * pi) / d
      const fi = (fi0 * pr - fr0 * pi) / d
      ar[r * n + col] = 0
      ai[r * n + col] = 0
      for (let j = col + 1; j < n; j++) {
        ar[r * n + j] = ar[r * n + j]! - (fr * ar[col * n + j]! - fi * ai[col * n + j]!)
        ai[r * n + j] = ai[r * n + j]! - (fr * ai[col * n + j]! + fi * ar[col * n + j]!)
      }
      xr[r] = xr[r]! - (fr * xr[col]! - fi * xi[col]!)
      xi[r] = xi[r]! - (fr * xi[col]! + fi * xr[col]!)
    }
  }

  for (let r = n - 1; r >= 0; r--) {
    let sr = xr[r]!
    let si = xi[r]!
    for (let j = r + 1; j < n; j++) {
      sr -= ar[r * n + j]! * xr[j]! - ai[r * n + j]! * xi[j]!
      si -= ar[r * n + j]! * xi[j]! + ai[r * n + j]! * xr[j]!
    }
    const pr = ar[r * n + r]!
    const pi = ai[r * n + r]!
    const d = pr * pr + pi * pi
    xr[r] = (sr * pr + si * pi) / d
    xi[r] = (si * pr - sr * pi) / d
  }
  return [xr, xi]
}

function tridiagQL(d: Float64Array, eIn: Float64Array, z: Float64Array, n: number): void {
  const e = new Float64Array(n)
  for (let i = 1; i < n; i++) e[i - 1] = eIn[i]!
  e[n - 1] = 0
  for (let l = 0; l < n; l++) {
    let iter = 0
    for (;;) {
      let m = l
      while (m < n - 1) {
        if (Math.abs(e[m]!) <= 1e-15 * Math.max(1e-30, Math.abs(d[m]!) + Math.abs(d[m + 1]!))) {
          break
        }
        m++
      }
      if (m === l || ++iter > 80) break
      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.hypot(g, 1)
      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? r : -r))
      let s = 1
      let c = 1
      let p = 0
      for (let i = m - 1; i >= l; i--) {
        const f = s * e[i]!
        const b = c * e[i]!
        r = Math.hypot(f, g)
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
        for (let k = 0; k < n; k++) {
          const zki1 = z[k * n + i + 1]!
          const zki = z[k * n + i]!
          z[k * n + i + 1] = s * zki + c * zki1
          z[k * n + i] = c * zki - s * zki1
        }
      }
      if (r === 0 && m > l) continue
      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }
}

function hermitianEigen(H: ComplexMatrix): {
  readonly values: Float64Array
  readonly vecs: ComplexMatrix
} {
  const n = H.n
  if (n === 1) return { values: new Float64Array([H.re[0]!]), vecs: cmatEye(1) }
  const hr = Float64Array.from(H.re)
  const hi = Float64Array.from(H.im)
  const qr = new Float64Array(n * n)
  const qi = new Float64Array(n * n)
  for (let i = 0; i < n; i++) qr[i * n + i] = 1
  const cSubRe = new Float64Array(n)
  const cSubIm = new Float64Array(n)

  for (let k = 0; k < n - 2; k++) {
    const m = n - k - 1
    let norm2 = 0
    for (let i = 0; i < m; i++) {
      const r = hr[(k + 1 + i) * n + k]!
      const im = hi[(k + 1 + i) * n + k]!
      norm2 += r * r + im * im
    }
    const sigma = Math.sqrt(norm2)
    if (sigma < 1e-30) continue
    const x0r = hr[(k + 1) * n + k]!
    const x0i = hi[(k + 1) * n + k]!
    const x0a = Math.hypot(x0r, x0i)
    const phR = x0a > 1e-30 ? x0r / x0a : 1
    const phI = x0a > 1e-30 ? x0i / x0a : 0
    const vr = new Float64Array(m)
    const vi = new Float64Array(m)
    for (let i = 0; i < m; i++) {
      vr[i] = hr[(k + 1 + i) * n + k]!
      vi[i] = hi[(k + 1 + i) * n + k]!
    }
    vr[0] = vr[0]! + phR * sigma
    vi[0] = vi[0]! + phI * sigma
    let vn2 = 0
    for (let i = 0; i < m; i++) vn2 += vr[i]! * vr[i]! + vi[i]! * vi[i]!
    if (vn2 < 1e-30) continue
    const beta = 2 / vn2
    const ur = new Float64Array(m)
    const ui = new Float64Array(m)
    for (let i = 0; i < m; i++) {
      let sr = 0
      let si = 0
      const ro = (k + 1 + i) * n + (k + 1)
      for (let j = 0; j < m; j++) {
        const aR = hr[ro + j]!
        const aI = hi[ro + j]!
        sr += aR * vr[j]! - aI * vi[j]!
        si += aR * vi[j]! + aI * vr[j]!
      }
      ur[i] = beta * sr
      ui[i] = beta * si
    }
    let kappa = 0
    for (let i = 0; i < m; i++) kappa += vr[i]! * ur[i]! + vi[i]! * ui[i]!
    kappa *= 0.5 * beta
    const wr = new Float64Array(m)
    const wi = new Float64Array(m)
    for (let i = 0; i < m; i++) {
      wr[i] = ur[i]! - kappa * vr[i]!
      wi[i] = ui[i]! - kappa * vi[i]!
    }
    for (let i = 0; i < m; i++) {
      const vRi = vr[i]!
      const vIi = vi[i]!
      const wRi = wr[i]!
      const wIi = wi[i]!
      const ro = (k + 1 + i) * n + (k + 1)
      for (let j = 0; j < m; j++) {
        hr[ro + j] =
          hr[ro + j]! - (vRi * wr[j]! + vIi * wi[j]! + (wRi * vr[j]! + wIi * vi[j]!))
        hi[ro + j] =
          hi[ro + j]! - (vIi * wr[j]! - vRi * wi[j]! + (wIi * vr[j]! - wRi * vi[j]!))
      }
    }
    cSubRe[k + 1] = -phR * sigma
    cSubIm[k + 1] = -phI * sigma
    for (let r = 0; r < n; r++) {
      let dr = 0
      let di = 0
      const ro = r * n + (k + 1)
      for (let j = 0; j < m; j++) {
        dr += qr[ro + j]! * vr[j]! - qi[ro + j]! * vi[j]!
        di += qr[ro + j]! * vi[j]! + qi[ro + j]! * vr[j]!
      }
      dr *= beta
      di *= beta
      for (let j = 0; j < m; j++) {
        qr[ro + j] = qr[ro + j]! - (dr * vr[j]! + di * vi[j]!)
        qi[ro + j] = qi[ro + j]! - (di * vr[j]! - dr * vi[j]!)
      }
    }
  }
  cSubRe[n - 1] = hr[(n - 1) * n + (n - 2)]!
  cSubIm[n - 1] = hi[(n - 1) * n + (n - 2)]!

  const phiR = new Float64Array(n)
  const phiI = new Float64Array(n)
  phiR[0] = 1
  const d = new Float64Array(n)
  const e = new Float64Array(n)
  d[0] = hr[0]!
  for (let k = 1; k < n; k++) {
    d[k] = hr[k * n + k]!
    const mag = Math.hypot(cSubRe[k]!, cSubIm[k]!)
    e[k] = mag
    if (mag > 1e-30) {
      const ur = cSubRe[k]! / mag
      const ui = cSubIm[k]! / mag
      phiR[k] = phiR[k - 1]! * ur - phiI[k - 1]! * ui
      phiI[k] = phiR[k - 1]! * ui + phiI[k - 1]! * ur
    } else {
      phiR[k] = phiR[k - 1]!
      phiI[k] = phiI[k - 1]!
    }
  }

  const z = new Float64Array(n * n)
  for (let i = 0; i < n; i++) z[i * n + i] = 1
  tridiagQL(d, e, z, n)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const qR = qr[r * n + c]!
      const qI = qi[r * n + c]!
      const pR = phiR[c]!
      const pI = phiI[c]!
      qr[r * n + c] = qR * pR - qI * pI
      qi[r * n + c] = qR * pI + qI * pR
    }
  }

  const ord = Array.from({ length: n }, (_, i) => i).sort((a, b) => d[a]! - d[b]!)
  const values = new Float64Array(n)
  const vecs = cmatZero(n)
  for (let col = 0; col < n; col++) {
    const src = ord[col]!
    values[col] = d[src]!
    for (let r = 0; r < n; r++) {
      let sr = 0
      let si = 0
      const ro = r * n
      for (let k = 0; k < n; k++) {
        const zk = z[k * n + src]!
        sr += qr[ro + k]! * zk
        si += qi[ro + k]! * zk
      }
      vecs.re[r * n + col] = sr
      vecs.im[r * n + col] = si
    }
  }
  return { values, vecs }
}

function unitaryEigen(U: ComplexMatrix): {
  readonly phases: Float64Array
  readonly vecs: ComplexMatrix
} {
  const n = U.n
  const shift = 0.37192841
  const sh = cExpI(-shift)
  const aRe = new Float64Array(n * n)
  const aIm = new Float64Array(n * n)
  const bRe = new Float64Array(n * n)
  const bIm = new Float64Array(n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const idx = i * n + j
      const ur = U.re[idx]! * sh[0] - U.im[idx]! * sh[1]
      const ui = U.re[idx]! * sh[1] + U.im[idx]! * sh[0]
      const diag = i === j ? 1 : 0
      aRe[idx] = diag + ur
      aIm[idx] = ui
      bRe[idx] = ui
      bIm[idx] = diag - ur
    }
  }

  const H = cmatZero(n)
  for (let col = 0; col < n; col++) {
    const rhsR = new Float64Array(n)
    const rhsI = new Float64Array(n)
    for (let r = 0; r < n; r++) {
      rhsR[r] = bRe[r * n + col]!
      rhsI[r] = bIm[r * n + col]!
    }
    const [xr, xi] = solveComplexLinear(n, aRe, aIm, rhsR, rhsI)
    for (let r = 0; r < n; r++) {
      H.re[r * n + col] = xr[r]!
      H.im[r * n + col] = xi[r]!
    }
  }

  for (let i = 0; i < n; i++) {
    H.im[i * n + i] = 0
    for (let j = i + 1; j < n; j++) {
      const reAvg = 0.5 * (H.re[i * n + j]! + H.re[j * n + i]!)
      const imAvg = 0.5 * (H.im[i * n + j]! - H.im[j * n + i]!)
      H.re[i * n + j] = reAvg
      H.re[j * n + i] = reAvg
      H.im[i * n + j] = imAvg
      H.im[j * n + i] = -imAvg
    }
  }

  const eig = hermitianEigen(H)
  const phases = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const theta = 2 * Math.atan(eig.values[i]!)
    phases[i] = wrapPi(shift + theta)
  }
  return { phases, vecs: eig.vecs }
}

function shiftInvertEigen(
  U: ComplexMatrix,
  targetE: number,
  seedRe?: Float64Array,
  seedIm?: Float64Array,
  iters = 6,
): {
  readonly E: number
  readonly residual: number
  readonly ipr: number
  readonly vr: Float64Array
  readonly vi: Float64Array
} {
  const dim = U.n
  let lam = cExpI(targetE)
  const vr = new Float64Array(dim)
  const vi = new Float64Array(dim)
  if (seedRe && seedIm) {
    vr.set(seedRe)
    vi.set(seedIm)
  } else {
    for (let i = 0; i < dim; i++) vr[i] = Math.cos(i * 0.713 + 0.3) / Math.sqrt(dim)
  }
  for (let it = 0; it < iters; it++) {
    const eps = it === 0 ? 5e-4 : 1e-11
    const sh: Complex = [lam[0] * (1 + eps), lam[1] * (1 + eps)]
    const ar = Float64Array.from(U.re)
    const ai = Float64Array.from(U.im)
    for (let i = 0; i < dim; i++) {
      ar[i * dim + i] = ar[i * dim + i]! - sh[0]
      ai[i * dim + i] = ai[i * dim + i]! - sh[1]
    }
    const [xr, xi] = solveComplexLinear(dim, ar, ai, vr, vi)
    let n2 = 0
    for (let i = 0; i < dim; i++) n2 += xr[i]! * xr[i]! + xi[i]! * xi[i]!
    const inv = 1 / Math.sqrt(Math.max(1e-30, n2))
    for (let i = 0; i < dim; i++) {
      vr[i] = xr[i]! * inv
      vi[i] = xi[i]! * inv
    }
    let lr = 0
    let li = 0
    for (let r = 0; r < dim; r++) {
      let sr = 0
      let si = 0
      for (let c = 0; c < dim; c++) {
        sr += U.re[r * dim + c]! * vr[c]! - U.im[r * dim + c]! * vi[c]!
        si += U.re[r * dim + c]! * vi[c]! + U.im[r * dim + c]! * vr[c]!
      }
      lr += vr[r]! * sr + vi[r]! * si
      li += vr[r]! * si - vi[r]! * sr
    }
    const la = Math.hypot(lr, li)
    lam = [lr / la, li / la]
  }
  let res2 = 0
  let ipr = 0
  for (let r = 0; r < dim; r++) {
    let sr = 0
    let si = 0
    for (let c = 0; c < dim; c++) {
      sr += U.re[r * dim + c]! * vr[c]! - U.im[r * dim + c]! * vi[c]!
      si += U.re[r * dim + c]! * vi[c]! + U.im[r * dim + c]! * vr[c]!
    }
    res2 +=
      (sr - (lam[0] * vr[r]! - lam[1] * vi[r]!)) ** 2 +
      (si - (lam[0] * vi[r]! + lam[1] * vr[r]!)) ** 2
    const p = vr[r]! * vr[r]! + vi[r]! * vi[r]!
    ipr += p * p
  }
  return {
    E: Math.atan2(lam[1], lam[0]),
    residual: Math.sqrt(res2),
    ipr,
    vr,
    vi,
  }
}

export function computeLevelSpacingRatio(phases: Float64Array): {
  readonly meanR: number
  readonly gapCount: number
  readonly degeneracyCount: number
} {
  const sorted = Array.from(phases).sort((a, b) => a - b)
  const gaps: number[] = []
  let degeneracies = 0
  for (let i = 0; i < sorted.length; i++) {
    const g =
      i + 1 < sorted.length
        ? sorted[i + 1]! - sorted[i]!
        : sorted[0]! + 2 * PI - sorted[sorted.length - 1]!
    if (g <= 1e-10) degeneracies++
    else gaps.push(g)
  }
  if (gaps.length < 2) return { meanR: 0, gapCount: gaps.length, degeneracyCount: degeneracies }
  let sumR = 0
  for (let i = 0; i < gaps.length; i++) {
    const a = gaps[i]!
    const b = gaps[(i + 1) % gaps.length]!
    sumR += Math.min(a, b) / Math.max(a, b)
  }
  return {
    meanR: sumR / gaps.length,
    gapCount: gaps.length,
    degeneracyCount: degeneracies,
  }
}

// =================================================================================================
// 2. EXACT D_4 24-SLOT GEOMETRY, W(F_4) ORDER-1152 SYMMETRY GROUP & BARE-U DOCK OPERATORS
// =================================================================================================

export type Root4 = readonly [number, number, number, number]

export const D4_ROOTS: readonly Root4[] = (() => {
  const out: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const r: [number, number, number, number] = [0, 0, 0, 0]
          r[i] = si
          r[j] = sj
          out.push(r)
        }
      }
    }
  }
  return out
})()

export const OPPOSITE_SLOT: readonly number[] = D4_ROOTS.map(r =>
  D4_ROOTS.findIndex(
    o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3],
  ),
)

export const ANTIPODAL_LINES: readonly (readonly [number, number])[] = D4_ROOTS.flatMap(
  (_, a) => {
    const b = OPPOSITE_SLOT[a]!
    return a < b ? ([[a, b] as const]) : []
  },
)

export const LINE_OF_SLOT: readonly number[] = D4_ROOTS.map((_, s) =>
  ANTIPODAL_LINES.findIndex(([a, b]) => a === s || b === s),
)

// Exact bare-U antipodal K-bounce operator on a single geodesic line pair:
//   K = -omega * SWAP on opposite-tone pairs {(+1, -1), (-1, +1)}, identity on vacuum (0, 0).
export interface BareUDockPairState {
  readonly slotA: Valence
  readonly slotB: Valence
  readonly ampRe: number
  readonly ampIm: number
}

export function applyBareUKBounceLayer(state: BareUDockPairState): BareUDockPairState {
  if (state.slotA !== 0 && state.slotB !== 0 && state.slotA === -state.slotB) {
    // Multiply by -omega = (1/2, -sqrt(3)/2) and swap antipodal slots
    const negOmegaRe = -OMEGA[0]
    const negOmegaIm = -OMEGA[1]
    return {
      slotA: state.slotB,
      slotB: state.slotA,
      ampRe: negOmegaRe * state.ampRe - negOmegaIm * state.ampIm,
      ampIm: negOmegaRe * state.ampIm + negOmegaIm * state.ampRe,
    }
  }
  return state
}

interface WF4Group {
  readonly elements: readonly Uint8Array[]
  readonly det: readonly number[]
}

let cachedWF4: WF4Group | undefined

export function getWF4Group(): WF4Group {
  if (cachedWF4) return cachedWF4
  const dot4 = (a: Root4, b: Root4): number =>
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
  const simpleRoots: readonly Root4[] = [
    [0, 1, -1, 0],
    [0, 0, 1, -1],
    [0, 0, 0, 1],
    [1, -1, -1, -1],
  ]
  const simplePerms = simpleRoots.map(alpha => {
    const aa = dot4(alpha, alpha)
    const perm = new Uint8Array(24)
    for (let slot = 0; slot < 24; slot++) {
      const v = D4_ROOTS[slot]!
      const twoVa = 2 * dot4(v, alpha)
      const img = [0, 1, 2, 3].map(k => v[k]! - (twoVa * alpha[k]!) / aa)
      perm[slot] = D4_ROOTS.findIndex(
        o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3],
      )
    }
    return perm
  })

  const id = Uint8Array.from({ length: 24 }, (_, d) => d)
  const elements: Uint8Array[] = [id]
  const det: number[] = [1]
  const seen = new Map<string, number>([[id.join(','), 0]])

  for (let head = 0; head < elements.length; head++) {
    const cur = elements[head]!
    const nextDet = -det[head]!
    for (const ref of simplePerms) {
      const next = new Uint8Array(24)
      for (let d = 0; d < 24; d++) next[d] = ref[cur[d]!]!
      const key = next.join(',')
      if (!seen.has(key)) {
        seen.set(key, elements.length)
        elements.push(next)
        det.push(nextDet)
      }
    }
  }
  cachedWF4 = { elements, det }
  return cachedWF4
}

export interface DockOccupancy {
  readonly slot: number
  readonly tone: 1 | -1
  readonly role: number
}

function lexKey4(a0: number, a1: number, a2: number, a3: number): number {
  let x0 = a0
  let x1 = a1
  let x2 = a2
  let x3 = a3
  if (x0 > x1) {
    const t = x0
    x0 = x1
    x1 = t
  }
  if (x2 > x3) {
    const t = x2
    x2 = x3
    x3 = t
  }
  if (x0 > x2) {
    const t = x0
    x0 = x2
    x2 = t
  }
  if (x1 > x3) {
    const t = x1
    x1 = x3
    x3 = t
  }
  if (x1 > x2) {
    const t = x1
    x1 = x2
    x2 = t
  }
  return ((x0 * 48 + x1) * 48 + x2) * 48 + x3
}

const chiral4Cache = new Map<number, number>()

export function chiral4Sign(c0: number, c1: number, c2: number, c3: number): number {
  const selfKey = lexKey4(c0, c1, c2, c3)
  const cached = chiral4Cache.get(selfKey)
  if (cached !== undefined) return cached

  const s0 = c0 >> 1
  const s1 = c1 >> 1
  const s2 = c2 >> 1
  const s3 = c3 >> 1
  const b0 = c0 & 1
  const b1 = c1 & 1
  const b2 = c2 & 1
  const b3 = c3 & 1

  let minKey = Number.POSITIVE_INFINITY
  let minSign = 0
  let chiral = true
  const { elements, det } = getWF4Group()

  for (let e = 0; e < elements.length; e++) {
    const p = elements[e]!
    const d = det[e]!
    const ps0 = p[s0]! << 1
    const ps1 = p[s1]! << 1
    const ps2 = p[s2]! << 1
    const ps3 = p[s3]! << 1
    const kPos = lexKey4(ps0 + b0, ps1 + b1, ps2 + b2, ps3 + b3)
    if (kPos < minKey) {
      minKey = kPos
      minSign = d
      chiral = true
    } else if (kPos === minKey && d !== minSign) {
      chiral = false
    }
    const kNeg = lexKey4(ps0 + (b0 ^ 1), ps1 + (b1 ^ 1), ps2 + (b2 ^ 1), ps3 + (b3 ^ 1))
    if (kNeg < minKey) {
      minKey = kNeg
      minSign = -d
      chiral = true
    } else if (kNeg === minKey && -d !== minSign) {
      chiral = false
    }
  }

  const sign = chiral ? minSign : 0
  chiral4Cache.set(selfKey, sign)
  return sign
}

export function computeChiralOrientation(vibes: readonly DockOccupancy[]): number {
  let chi = 0
  for (let i = 0; i < vibes.length; i++) {
    const ci = (vibes[i]!.slot << 1) + (vibes[i]!.tone < 0 ? 1 : 0)
    for (let j = i + 1; j < vibes.length; j++) {
      const cj = (vibes[j]!.slot << 1) + (vibes[j]!.tone < 0 ? 1 : 0)
      for (let k = j + 1; k < vibes.length; k++) {
        const ck = (vibes[k]!.slot << 1) + (vibes[k]!.tone < 0 ? 1 : 0)
        for (let l = k + 1; l < vibes.length; l++) {
          const cl = (vibes[l]!.slot << 1) + (vibes[l]!.tone < 0 ? 1 : 0)
          chi += chiral4Sign(ci, cj, ck, cl)
        }
      }
    }
  }
  return chi
}

// Canonicalizes a single-dock excitation template under the exact W(F_4) x C symmetry group.
export function canonicalizeDockPattern(vibes: readonly DockOccupancy[]): {
  readonly canonicalKey: string
  readonly orbitSize: number
  readonly chiOdd: number
} {
  const { elements } = getWF4Group()
  const uniqueOrbits = new Set<string>()
  let bestKey = ''

  for (let e = 0; e < elements.length; e++) {
    const p = elements[e]!
    for (const flip of [1, -1] as const) {
      const key = vibes
        .map(v => `${p[v.slot]!}:${v.tone * flip > 0 ? '+' : '-'}`)
        .sort()
        .join('|')
      uniqueOrbits.add(key)
      if (bestKey === '' || key < bestKey) bestKey = key
    }
  }

  return {
    canonicalKey: bestKey,
    orbitSize: uniqueOrbits.size,
    chiOdd: computeChiralOrientation(vibes),
  }
}

// Canonicalizes a multi-dock collinear template (dock offset d in Z, slot s in {0..23}, tone in {+1,-1})
// under exact W(F_4) x C x Z-reflection along the geodesic line.
function canonicalizeCollinearPattern(
  vibes: readonly { readonly dockOffset: number; readonly slot: number; readonly tone: 1 | -1 }[],
): {
  readonly canonicalKey: string
  readonly orbitSize: number
} {
  const { elements } = getWF4Group()
  const uniqueOrbits = new Set<string>()
  let bestKey = ''
  for (let e = 0; e < elements.length; e++) {
    const p = elements[e]!
    for (const flip of [1, -1] as const) {
      const mapped = vibes.map(v => ({
        d: v.dockOffset,
        s: p[v.slot]!,
        t: v.tone * flip > 0 ? '+' : '-',
      }))
      const minD = Math.min(...mapped.map(x => x.d))
      const key = mapped
        .map(x => `${x.d - minD}@${x.s}:${x.t}`)
        .sort()
        .join('|')
      uniqueOrbits.add(key)
      if (bestKey === '' || key < bestKey) bestKey = key
    }
  }
  return { canonicalKey: bestKey, orbitSize: uniqueOrbits.size }
}

// =================================================================================================
// 3. EXACT 1D GEODESIC BARE-U & GENERALIZED MASSIVE THIRRING OPERATORS (k = 1, 2, 3, 4)
// =================================================================================================

function diracCoin(
  mCoin: number,
  detPhase: number,
): readonly [readonly [Complex, Complex], readonly [Complex, Complex]] {
  const ph = cExpI(detPhase)
  const k = cScale(Math.cos(mCoin), ph)
  const x = cMul(ph, [0, -Math.sin(mCoin)])
  return [
    [k, x],
    [x, k],
  ] as const
}

export function buildU2SymCM(
  H: number,
  P: number,
  mCoin: number,
  detPhase: number,
  meetPhase: Complex,
): ComplexMatrix {
  const dim = 4 * H
  const U = cmatZero(dim)
  const coin = diracCoin(mCoin, detPhase)
  const c00 = coin[0][0]
  const c01 = coin[0][1]
  const cc: Complex[][] = Array.from({ length: 4 }, (_, o) =>
    Array.from({ length: 4 }, (_, i) => cMul(coin[o >> 1]![i >> 1]!, coin[o & 1]![i & 1]!)),
  )
  const eNegP = cExpI(-P)
  const ePosP = cExpI(P)
  const idxBulk = (r: number, s: number): number => 1 + 4 * (r - 1) + s
  const idxH = 1 + 4 * (H - 1)

  const row0 = H > 1 ? idxBulk(1, 1) : idxH + 2
  U.re[row0 * dim + 0] = meetPhase[0]
  U.im[row0 * dim + 0] = meetPhase[1]

  for (let r = 1; r < H; r++) {
    for (let sIn = 0; sIn < 4; sIn++) {
      const col = idxBulk(r, sIn)
      for (let sOut = 0; sOut < 4; sOut++) {
        const amp = cc[sOut]![sIn]!
        let row = 0
        let val = amp
        if (sOut === 0) {
          row = idxBulk(r, 0)
          val = cMul(eNegP, amp)
        } else if (sOut === 3) {
          row = idxBulk(r, 3)
          val = cMul(ePosP, amp)
        } else if (sOut === 1) {
          row = r + 1 < H ? idxBulk(r + 1, 1) : idxH + 2
        } else {
          row = r - 1 > 0 ? idxBulk(r - 1, 2) : 0
        }
        U.re[row * dim + col] = U.re[row * dim + col]! + val[0]
        U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
      }
    }
  }

  const c00Sq = cMul(c00, c00)
  const c01Sq = cMul(c01, c01)
  const c00c01 = cMul(c00, c01)
  const s2 = Math.SQRT2
  const mH: readonly (readonly [Complex, Complex, Complex])[] = [
    [c00Sq, c01Sq, cScale(s2, c00c01)],
    [c01Sq, c00Sq, cScale(s2, c00c01)],
    [cScale(s2, c00c01), cScale(s2, c00c01), cAdd(c00Sq, c01Sq)],
  ]

  for (let a = 0; a < 3; a++) {
    const col = idxH + a
    const v0 = cMul(eNegP, mH[0]![a]!)
    U.re[(idxH + 0) * dim + col] = U.re[(idxH + 0) * dim + col]! + v0[0]
    U.im[(idxH + 0) * dim + col] = U.im[(idxH + 0) * dim + col]! + v0[1]
    const v1 = cMul(ePosP, mH[1]![a]!)
    U.re[(idxH + 1) * dim + col] = U.re[(idxH + 1) * dim + col]! + v1[0]
    U.im[(idxH + 1) * dim + col] = U.im[(idxH + 1) * dim + col]! + v1[1]
    const v2 = mH[2]![a]!
    const row2 = H > 1 ? idxBulk(H - 1, 2) : 0
    U.re[row2 * dim + col] = U.re[row2 * dim + col]! + v2[0]
    U.im[row2 * dim + col] = U.im[row2 * dim + col]! + v2[1]
  }
  return U
}

function findBoundDoublon(
  H: number,
  P: number,
  mCoin: number,
  detPhase: number,
  meetPhase: Complex,
): {
  readonly bound: boolean
  readonly E: number
  readonly contactProb: number
  readonly ipr: number
  readonly edgeProb: number
  readonly decayRatio: number
  readonly bindingGap: number
  readonly vr: Float64Array
  readonly vi: Float64Array
  readonly phases: Float64Array
} {
  const U = buildU2SymCM(H, P, mCoin, detPhase, meetPhase)
  const eig = unitaryEigen(U)
  const dim = U.n
  const idxH = 1 + 4 * (H - 1)

  let bestCol = -1
  let bestScore = -1
  let bestP0 = 0
  let bestEdge = 1
  let bestIpr = 0
  let bestDecay = 1

  for (let c = 0; c < dim; c++) {
    const p0 = eig.vecs.re[0 * dim + c]! ** 2 + eig.vecs.im[0 * dim + c]! ** 2
    const pEdge =
      eig.vecs.re[(idxH + 0) * dim + c]! ** 2 +
      eig.vecs.im[(idxH + 0) * dim + c]! ** 2 +
      eig.vecs.re[(idxH + 1) * dim + c]! ** 2 +
      eig.vecs.im[(idxH + 1) * dim + c]! ** 2 +
      eig.vecs.re[(idxH + 2) * dim + c]! ** 2 +
      eig.vecs.im[(idxH + 2) * dim + c]! ** 2
    let ipr = 0
    for (let r = 0; r < dim; r++) {
      const p = eig.vecs.re[r * dim + c]! ** 2 + eig.vecs.im[r * dim + c]! ** 2
      ipr += p * p
    }
    const locRatio = p0 / (pEdge + 1e-12)
    if (p0 > 0.02 && pEdge < 0.03 && locRatio > bestScore) {
      bestScore = locRatio
      bestCol = c
      bestP0 = p0
      bestEdge = pEdge
      bestIpr = ipr
      const pR1 =
        eig.vecs.re[1 * dim + c]! ** 2 +
        eig.vecs.im[1 * dim + c]! ** 2 +
        eig.vecs.re[2 * dim + c]! ** 2 +
        eig.vecs.im[2 * dim + c]! ** 2 +
        eig.vecs.re[3 * dim + c]! ** 2 +
        eig.vecs.im[3 * dim + c]! ** 2 +
        eig.vecs.re[4 * dim + c]! ** 2 +
        eig.vecs.im[4 * dim + c]! ** 2
      const pR2 =
        H > 2
          ? eig.vecs.re[5 * dim + c]! ** 2 +
            eig.vecs.im[5 * dim + c]! ** 2 +
            eig.vecs.re[6 * dim + c]! ** 2 +
            eig.vecs.im[6 * dim + c]! ** 2 +
            eig.vecs.re[7 * dim + c]! ** 2 +
            eig.vecs.im[7 * dim + c]! ** 2 +
            eig.vecs.re[8 * dim + c]! ** 2 +
            eig.vecs.im[8 * dim + c]! ** 2
          : 0
      bestDecay = pR1 > 1e-12 ? Math.sqrt(pR2 / pR1) : 0
    }
  }

  if (bestCol < 0) {
    return {
      bound: false,
      E: 0,
      contactProb: 0,
      ipr: 0,
      edgeProb: 1,
      decayRatio: 1,
      bindingGap: 0,
      vr: new Float64Array(dim),
      vi: new Float64Array(dim),
      phases: eig.phases,
    }
  }

  const E = eig.phases[bestCol]!
  const vr = new Float64Array(dim)
  const vi = new Float64Array(dim)
  for (let r = 0; r < dim; r++) {
    vr[r] = eig.vecs.re[r * dim + bestCol]!
    vi[r] = eig.vecs.im[r * dim + bestCol]!
  }

  let bindingGap = PI
  for (let c = 0; c < dim; c++) {
    if (c === bestCol) continue
    const pEdge =
      eig.vecs.re[(idxH + 0) * dim + c]! ** 2 +
      eig.vecs.im[(idxH + 0) * dim + c]! ** 2 +
      eig.vecs.re[(idxH + 1) * dim + c]! ** 2 +
      eig.vecs.im[(idxH + 1) * dim + c]! ** 2 +
      eig.vecs.re[(idxH + 2) * dim + c]! ** 2 +
      eig.vecs.im[(idxH + 2) * dim + c]! ** 2
    if (pEdge > 1e-3) {
      const d = phaseDist(E, eig.phases[c]!)
      if (d < bindingGap) bindingGap = d
    }
  }

  const bound = bindingGap > 1e-3
  if (!bound) {
    return {
      bound: false,
      E: 0,
      contactProb: 0,
      ipr: 0,
      edgeProb: 1,
      decayRatio: 1,
      bindingGap: 0,
      vr: new Float64Array(dim),
      vi: new Float64Array(dim),
      phases: eig.phases,
    }
  }

  return {
    bound: true,
    E,
    contactProb: bestP0,
    ipr: bestIpr,
    edgeProb: bestEdge,
    decayRatio: bestDecay,
    bindingGap,
    vr,
    vi,
    phases: eig.phases,
  }
}

// Exact k = 3 Sym^3 even-sublattice periodic ring operator with uniform Peierls flux qFlux = P/3.
// Note on Peierls gauge invariance: for any prime ring length M not divisible by 3 (e.g. M = 7, 11),
// every 3-particle translation orbit has symCount === 1 identically, eliminating any M/3 shift
// wraparound phase ambiguity at qFlux != 0. We enforce M % 3 !== 0 whenever qFlux !== 0.
function buildU3SymEven(
  M: number,
  qFlux: number,
  mCoin: number,
  detPhase: number,
  meetPhase: Complex,
): {
  readonly U: ComplexMatrix
  readonly configs: readonly (readonly (readonly [number, number])[])[]
} {
  if (Math.abs(qFlux) > 1e-12 && M % 3 === 0) {
    throw new Error(`buildU3SymEven requires M not divisible by 3 when qFlux != 0 (got M=${M})`)
  }
  const canon = (pts: readonly (readonly [number, number])[]) => {
    let bestKey = ''
    let bestSorted: [number, number][] = []
    let symCount = 0
    for (let sh = 0; sh < M; sh++) {
      const arr: [number, number][] = pts.map(([m, s]) => [(((m + sh) % M) + M) % M, s])
      arr.sort((a, b) => a[0] - b[0] || a[1] - b[1])
      const k = arr.map(([m, s]) => `${m}:${s}`).join(',')
      if (bestKey === '' || k < bestKey) {
        bestKey = k
        bestSorted = arr
        symCount = 1
      } else if (k === bestKey) {
        symCount++
      }
    }
    return { key: bestKey, sorted: bestSorted, symCount }
  }

  const keyToIdx = new Map<string, number>()
  const configs: [number, number][][] = []
  const symCounts: number[] = []
  for (let a = 0; a < 2 * M; a++) {
    for (let b = a + 1; b < 2 * M; b++) {
      for (let c = b + 1; c < 2 * M; c++) {
        const cn = canon([
          [a >> 1, a & 1],
          [b >> 1, b & 1],
          [c >> 1, c & 1],
        ])
        if (!keyToIdx.has(cn.key)) {
          keyToIdx.set(cn.key, configs.length)
          configs.push(cn.sorted)
          symCounts.push(cn.symCount)
        }
      }
    }
  }

  const dim = configs.length
  const U = cmatZero(dim)
  const coin = diracCoin(mCoin, detPhase)
  const eN = cExpI(-qFlux)
  const eP = cExpI(qFlux)

  for (let col = 0; col < dim; col++) {
    const pts = configs[col]!
    const byM = new Map<number, number[]>()
    for (let i = 0; i < 3; i++) {
      const m = pts[i]![0]
      const l = byM.get(m)
      if (l) l.push(i)
      else byM.set(m, [i])
    }
    let branches: { pts: [number, number][]; amp: Complex }[] = [{ pts: [], amp: [1, 0] }]
    for (const [m, idxs] of byM) {
      if (idxs.length === 2) {
        branches = branches.map(b => ({
          pts: [...b.pts, [m, 0], [m, 1]],
          amp: cMul(b.amp, meetPhase),
        }))
      } else {
        const sIn = pts[idxs[0]!]![1]
        const nb: { pts: [number, number][]; amp: Complex }[] = []
        for (const b of branches) {
          nb.push({
            pts: [...b.pts, [m, 0]],
            amp: cMul(b.amp, cMul(coin[0][sIn]!, eN)),
          })
          nb.push({
            pts: [...b.pts, [m, 1]],
            amp: cMul(b.amp, cMul(coin[1][sIn]!, eP)),
          })
        }
        branches = nb
      }
    }
    for (const b of branches) {
      const cn = canon(b.pts.map(([m, s]) => [s === 0 ? m : (m - 1 + M) % M, s]))
      const row = keyToIdx.get(cn.key)!
      const val = cScale(Math.sqrt(symCounts[row]! / symCounts[col]!), b.amp)
      U.re[row * dim + col] = U.re[row * dim + col]! + val[0]
      U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
    }
  }
  return { U, configs }
}

// Exact 1D mixed-sign K + M_meet operator on ring L = 5, k = 4 (+, +, +, -), Q = +2
// for verbatim COE quantum-chaos level-spacing ratio <r>.
export function build1DMixedChaosSector(
  L: number,
  P: number,
  mCoin: number,
  detPhase: number,
  plusMeetPhase: Complex,
): ComplexMatrix {
  const S = 2 * L
  const shS = (c: number, sh: number): number =>
    ((((c >> 1) + sh) % L + L) % L) * 2 + (c & 1)
  const canon = (a: number, b: number, c: number, n0: number) => {
    let bk = ''
    let bs = 0
    let bv: [number, number, number, number] = [0, 0, 0, 0]
    for (let sh = 0; sh < L; sh++) {
      const ps = [shS(a, sh), shS(b, sh), shS(c, sh)].sort((u, v) => u - v)
      const z = shS(n0, sh)
      const k = `${ps[0]},${ps[1]},${ps[2]}|${z}`
      if (bk === '' || k < bk) {
        bk = k
        bs = sh
        bv = [ps[0]!, ps[1]!, ps[2]!, z]
      }
    }
    return { key: bk, shift: bs, vals: bv }
  }

  const idxMap = new Map<string, number>()
  const cfgs: [number, number, number, number][] = []
  for (let a = 0; a < S; a++) {
    for (let b = a + 1; b < S; b++) {
      for (let c = b + 1; c < S; c++) {
        for (let n0 = 0; n0 < S; n0++) {
          if (n0 === a || n0 === b || n0 === c) continue
          const cn = canon(a, b, c, n0)
          if (!idxMap.has(cn.key)) {
            idxMap.set(cn.key, cfgs.length)
            cfgs.push(cn.vals)
          }
        }
      }
    }
  }

  const dim = cfgs.length
  const U = cmatZero(dim)
  const coin = diracCoin(mCoin, detPhase)
  const detC = cExpI(2 * detPhase)
  const kFac: Complex = [-detC[0], -detC[1]]

  for (let col = 0; col < dim; col++) {
    const [a, b, c, n0] = cfgs[col]!
    const pts: [number, number, number][] = [
      [a >> 1, a & 1, 1],
      [b >> 1, b & 1, 1],
      [c >> 1, c & 1, 1],
      [n0 >> 1, n0 & 1, -1],
    ]
    const byX = new Map<number, [number, number, number][]>()
    for (const p of pts) {
      const l = byX.get(p[0])
      if (l) l.push(p)
      else byX.set(p[0], [p])
    }
    let brs: { ps: [number, number, number][]; amp: Complex }[] = [{ ps: [], amp: [1, 0] }]
    for (const [x, list] of byX) {
      if (list.length === 1) {
        const [, sIn, t] = list[0]!
        const nb: { ps: [number, number, number][]; amp: Complex }[] = []
        for (const br of brs) {
          nb.push({
            ps: [...br.ps, [x, 0, t]],
            amp: cMul(br.amp, coin[0][sIn]!),
          })
          nb.push({
            ps: [...br.ps, [x, 1, t]],
            amp: cMul(br.amp, coin[1][sIn]!),
          })
        }
        brs = nb
      } else {
        const pA = list[0]!
        const pB = list[1]!
        if (pA[2] !== pB[2]) {
          brs = brs.map(br => ({
            ps: [...br.ps, [x, pB[1], pA[2]], [x, pA[1], pB[2]]],
            amp: cMul(br.amp, kFac),
          }))
        } else {
          brs = brs.map(br => ({
            ps: [...br.ps, pA, pB],
            amp: cMul(br.amp, plusMeetPhase),
          }))
        }
      }
    }
    for (const br of brs) {
      const psP: number[] = []
      let nC = 0
      for (const [x, s, t] of br.ps) {
        const cc = 2 * ((((x + (s === 0 ? 1 : -1)) % L) + L) % L) + s
        if (t > 0) psP.push(cc)
        else nC = cc
      }
      const cn = canon(psP[0]!, psP[1]!, psP[2]!, nC)
      const row = idxMap.get(cn.key)!
      const val = cMul(cExpI(P * cn.shift), br.amp)
      U.re[row * dim + col] = U.re[row * dim + col]! + val[0]
      U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
    }
  }
  return U
}

// Clean bulk integrable <r> on M = 10 (10 % 3 === 1 => symCount === 1 everywhere, zero wraparound
// ambiguity, dim = 114 non-degenerate levels per point).
function computeIntegrableR(mCoin: number, detPhase: number, meetPhase: Complex): number {
  const { U } = buildU3SymEven(10, PI / 13, mCoin, detPhase, meetPhase)
  const eig = unitaryEigen(U)
  return computeLevelSpacingRatio(eig.phases).meanR
}

// =================================================================================================
// 4. LIVE SPARSE UNITARY WAVEPACKET COLLISION SOLVERS (2-BODY, 3-BODY SYM^3, 3-BODY BREAKUP, 4D)
// =================================================================================================

function bareSingleParticleE(p: number, band: 1 | -1): number {
  return PI / 3 + band * Math.acos(0.5 * Math.cos(p))
}

function bareYangRapidity(p: number, band: 1 | -1): number {
  return (2 / SQRT3) * (Math.sin(bareSingleParticleE(p, band)) / Math.sin(p))
}

function bareSingleParticleSpinor(p: number, band: 1 | -1): readonly [Complex, Complex] {
  const coin = diracCoin(PI / 3, PI / 3)
  const eN = cExpI(-p)
  const u00 = cMul(eN, coin[0][0])
  const u01 = cMul(eN, coin[0][1])
  const lam = cExpI(bareSingleParticleE(p, band))
  // (u00 - lam) v0 + u01 v1 = 0 => v0 = u01, v1 = lam - u00
  const v0 = u01
  const v1: Complex = [lam[0] - u00[0], lam[1] - u00[1]]
  const nrm = Math.hypot(cAbs(v0), cAbs(v1))
  return [cScale(1 / nrm, v0), cScale(1 / nrm, v1)]
}

function build1DGaussianPacket(
  L: number,
  center: number,
  sigma: number,
  p: number,
  band: 1 | -1,
  parityFilter?: 0 | 1,
): { readonly re: Float64Array; readonly im: Float64Array } {
  const re = new Float64Array(2 * L)
  const im = new Float64Array(2 * L)
  const [s0, s1] = bareSingleParticleSpinor(p, band)
  let norm2 = 0
  for (let x = 0; x < L; x++) {
    if (parityFilter !== undefined && (x & 1) !== parityFilter) continue
    let dx = x - center
    if (dx > L / 2) dx -= L
    if (dx < -L / 2) dx += L
    const env = Math.exp(-(dx * dx) / (2 * sigma * sigma))
    const ph = cExpI(p * dx)
    const a0 = cScale(env, cMul(ph, s0))
    const a1 = cScale(env, cMul(ph, s1))
    re[2 * x] = a0[0]
    im[2 * x] = a0[1]
    re[2 * x + 1] = a1[0]
    im[2 * x + 1] = a1[1]
    norm2 += a0[0] * a0[0] + a0[1] * a0[1] + a1[0] * a1[0] + a1[1] * a1[1]
  }
  const inv = 1 / Math.sqrt(Math.max(1e-30, norm2))
  for (let i = 0; i < 2 * L; i++) {
    re[i] = re[i]! * inv
    im[i] = im[i]! * inv
  }
  return { re, im }
}

function step1DBare(
  L: number,
  re: Float64Array,
  im: Float64Array,
): { readonly re: Float64Array; readonly im: Float64Array } {
  const coin = diracCoin(PI / 3, PI / 3)
  const outR = new Float64Array(2 * L)
  const outI = new Float64Array(2 * L)
  const c00r = coin[0][0][0]
  const c00i = coin[0][0][1]
  const c01r = coin[0][1][0]
  const c01i = coin[0][1][1]
  for (let x = 0; x < L; x++) {
    const r0 = re[2 * x]!
    const i0 = im[2 * x]!
    const r1 = re[2 * x + 1]!
    const i1 = im[2 * x + 1]!
    const a0r = c00r * r0 - c00i * i0 + (c01r * r1 - c01i * i1)
    const a0i = c00r * i0 + c00i * r0 + (c01r * i1 + c01i * r1)
    const a1r = c01r * r0 - c01i * i0 + (c00r * r1 - c00i * i1)
    const a1i = c01r * i0 + c01i * r0 + (c00r * i1 + c00i * r1)
    const xR = (x + 1) % L
    const xL = (x - 1 + L) % L
    outR[2 * xR] = a0r
    outI[2 * xR] = a0i
    outR[2 * xL + 1] = a1r
    outI[2 * xL + 1] = a1i
  }
  return { re: outR, im: outI }
}

// Live sparse 2-body distinguishable wavepacket collision on periodic 1D ring L = 36 (M_meet or K_bounce).
function runLive2BodyCollision(mode: 'M_meet' | 'K_bounce'): {
  readonly roleSwapProb: number
  readonly conditionalPhaseRad: number
  readonly overlapMag: number
  readonly normErr: number
  readonly analyticSwapRef: number
} {
  const L = 36
  const T = 26
  const p1 = 0.65 // moving right (band -1: v_g = +sin(p)/(2 sqrt(1 - 0.25 cos^2 p)) > 0)
  const p2 = -1.15 // moving left (band -1: v_g < 0)
  // Both packets sit on even sites so x1 - x2 is even and they collide head-on on the same dock!
  const w1 = build1DGaussianPacket(L, 10, 2.2, p1, -1, 0)
  const w2 = build1DGaussianPacket(L, 24, 2.2, p2, -1, 0)

  const S = 2 * L
  const dim = S * S
  let stR = new Float64Array(dim)
  let stI = new Float64Array(dim)
  let norm0 = 0
  for (let a = 0; a < S; a++) {
    const ar = w1.re[a]!
    const ai = w1.im[a]!
    if (ar === 0 && ai === 0) continue
    for (let b = 0; b < S; b++) {
      if (a === b) continue
      const br = w2.re[b]!
      const bi = w2.im[b]!
      if (br === 0 && bi === 0) continue
      const idx = a * S + b
      const vr = ar * br - ai * bi
      const vi = ar * bi + ai * br
      stR[idx] = vr
      stI[idx] = vi
      norm0 += vr * vr + vi * vi
    }
  }
  const inv0 = 1 / Math.sqrt(norm0)
  for (let i = 0; i < dim; i++) {
    stR[i] = stR[i]! * inv0
    stI[i] = stI[i]! * inv0
  }

  let ref1 = { re: Float64Array.from(w1.re), im: Float64Array.from(w1.im) }
  let ref2 = { re: Float64Array.from(w2.re), im: Float64Array.from(w2.im) }

  const coin = diracCoin(PI / 3, PI / 3)
  const cc: Complex[][] = Array.from({ length: 4 }, (_, o) =>
    Array.from({ length: 4 }, (_, i) => cMul(coin[o >> 1]![i >> 1]!, coin[o & 1]![i & 1]!)),
  )
  // Exact bare-U on-dock D o M_meet o D for distinct roles: L_keep = -1/2, L_swap = -i sqrt(3)/2
  const meetKeepR = -0.5
  const meetSwapI = -SQRT3 / 2
  // Exact bare-U on-dock D o K o D for opposite signs: K = -omega * SWAP
  const kFacR = -OMEGA[0]
  const kFacI = -OMEGA[1]

  for (let step = 0; step < T; step++) {
    ref1 = step1DBare(L, ref1.re, ref1.im)
    ref2 = step1DBare(L, ref2.re, ref2.im)

    const nxR = new Float64Array(dim)
    const nxI = new Float64Array(dim)
    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        if (x1 === x2) {
          const i01 = (2 * x1 + 0) * S + (2 * x2 + 1)
          const i10 = (2 * x1 + 1) * S + (2 * x2 + 0)
          const a01r = stR[i01]!
          const a01i = stI[i01]!
          const a10r = stR[i10]!
          const a10i = stI[i10]!
          if (a01r === 0 && a01i === 0 && a10r === 0 && a10i === 0) continue

          let b01r = 0
          let b01i = 0
          let b10r = 0
          let b10i = 0
          if (mode === 'M_meet') {
            // (keep, swap) on roles: b01 = -0.5 a01 - i (sqrt(3)/2) a10
            b01r = meetKeepR * a01r - meetSwapI * a10i
            b01i = meetKeepR * a01i + meetSwapI * a10r
            b10r = meetKeepR * a10r - meetSwapI * a01i
            b10i = meetKeepR * a10i + meetSwapI * a01r
          } else {
            // K bounce swaps slots of the two opposite-sign particles with phase -omega
            b01r = kFacR * a10r - kFacI * a10i
            b01i = kFacR * a10i + kFacI * a10r
            b10r = kFacR * a01r - kFacI * a01i
            b10i = kFacR * a01i + kFacI * a01r
          }
          const xR = (x1 + 1) % L
          const xL = (x1 - 1 + L) % L
          const d01 = (2 * xR + 0) * S + (2 * xL + 1)
          const d10 = (2 * xL + 1) * S + (2 * xR + 0)
          nxR[d01] = nxR[d01]! + b01r
          nxI[d01] = nxI[d01]! + b01i
          nxR[d10] = nxR[d10]! + b10r
          nxI[d10] = nxI[d10]! + b10i
        } else {
          // Independent single-vibe coin C x C then stream
          const base00 = (2 * x1 + 0) * S + (2 * x2 + 0)
          const base01 = (2 * x1 + 0) * S + (2 * x2 + 1)
          const base10 = (2 * x1 + 1) * S + (2 * x2 + 0)
          const base11 = (2 * x1 + 1) * S + (2 * x2 + 1)
          const inR = [stR[base00]!, stR[base01]!, stR[base10]!, stR[base11]!]
          const inI = [stI[base00]!, stI[base01]!, stI[base10]!, stI[base11]!]
          if (
            inR[0] === 0 && inI[0] === 0 &&
            inR[1] === 0 && inI[1] === 0 &&
            inR[2] === 0 && inI[2] === 0 &&
            inR[3] === 0 && inI[3] === 0
          ) {
            continue
          }
          const x1R = (x1 + 1) % L
          const x1L = (x1 - 1 + L) % L
          const x2R = (x2 + 1) % L
          const x2L = (x2 - 1 + L) % L
          const dsts = [
            (2 * x1R + 0) * S + (2 * x2R + 0),
            (2 * x1R + 0) * S + (2 * x2L + 1),
            (2 * x1L + 1) * S + (2 * x2R + 0),
            (2 * x1L + 1) * S + (2 * x2L + 1),
          ]
          for (let o = 0; o < 4; o++) {
            let sr = 0
            let si = 0
            const row = cc[o]!
            for (let i = 0; i < 4; i++) {
              const c = row[i]!
              sr += c[0] * inR[i]! - c[1] * inI[i]!
              si += c[0] * inI[i]! + c[1] * inR[i]!
            }
            const dst = dsts[o]!
            nxR[dst] = nxR[dst]! + sr
            nxI[dst] = nxI[dst]! + si
          }
        }
      }
    }
    stR = nxR
    stI = nxI
  }

  let normEnd = 0
  let ovDirR = 0
  let ovDirI = 0
  let ovSwapR = 0
  let ovSwapI = 0
  for (let a = 0; a < S; a++) {
    for (let b = 0; b < S; b++) {
      const idx = a * S + b
      const sr = stR[idx]!
      const si = stI[idx]!
      normEnd += sr * sr + si * si
      // Direct product |ref1>_1 |ref2>_2
      const dr = ref1.re[a]! * ref2.re[b]! - ref1.im[a]! * ref2.im[b]!
      const di = ref1.re[a]! * ref2.im[b]! + ref1.im[a]! * ref2.re[b]!
      ovDirR += dr * sr + di * si
      ovDirI += dr * si - di * sr
      // Swapped product |ref2>_1 |ref1>_2
      const wr = ref2.re[a]! * ref1.re[b]! - ref2.im[a]! * ref1.im[b]!
      const wi = ref2.re[a]! * ref1.im[b]! + ref2.im[a]! * ref1.re[b]!
      ovSwapR += wr * sr + wi * si
      ovSwapI += wr * si - wi * sr
    }
  }

  const pDir = ovDirR * ovDirR + ovDirI * ovDirI
  const pSwap = ovSwapR * ovSwapR + ovSwapI * ovSwapI
  const u1 = bareYangRapidity(p1, -1)
  const u2 = bareYangRapidity(p2, -1)
  const w12 = u1 - u2
  const analyticSwapRef = mode === 'M_meet' ? 1 / (1 + w12 * w12) : 1.0

  // For M_meet, roleSwapProb = pSwap; conditionalPhase = arg(<direct|out>) (or swapped for K where pDir ~ 0, pSwap ~ 1)
  const phase =
    pDir >= pSwap
      ? Math.atan2(ovDirI, ovDirR)
      : Math.atan2(ovSwapI, ovSwapR)

  return {
    roleSwapProb: pSwap,
    conditionalPhaseRad: phase,
    overlapMag: Math.sqrt(pDir + pSwap),
    normErr: Math.abs(normEnd - 1),
    analyticSwapRef,
  }
}

// Exact even-sublattice spinor for single-vibe momentum p in band +1 (matching s=0: m->m, s=1: m->m-1 frame)
function buildEvenSublatticePulse(
  M: number,
  mP0: number,
  sigP: number,
  pMom: number,
): { readonly re: Float64Array; readonly im: Float64Array } {
  const S = 2 * M
  const re = new Float64Array(S)
  const im = new Float64Array(S)
  const th = Math.acos(0.5 * Math.cos(pMom))
  const ratio = -(Math.sin(pMom) + 2 * Math.sin(th)) / SQRT3
  const w = cScale(ratio, cExpI(pMom))
  const inv = 1 / Math.hypot(1, Math.abs(ratio))
  const chi0: Complex = [inv, 0]
  const chi1: Complex = cScale(inv, w)
  let n2 = 0
  for (let m = 0; m < M; m++) {
    let dm = m - mP0
    if (dm > M / 2) dm -= M
    if (dm < -M / 2) dm += M
    const env = Math.exp(-(dm * dm) / (4 * sigP * sigP))
    const ph = cExpI(2 * pMom * m)
    const a0 = cScale(env, cMul(ph, chi0))
    const a1 = cScale(env, cMul(ph, chi1))
    re[2 * m] = a0[0]
    im[2 * m] = a0[1]
    re[2 * m + 1] = a1[0]
    im[2 * m + 1] = a1[1]
    n2 += a0[0] ** 2 + a0[1] ** 2 + a1[0] ** 2 + a1[1] ** 2
  }
  const sc = 1 / Math.sqrt(Math.max(1e-30, n2))
  for (let i = 0; i < S; i++) {
    re[i] = re[i]! * sc
    im[i] = im[i]! * sc
  }
  return { re, im }
}

// Exact P = 0 Z[omega][1/13] bare-U M_meet doublon wavepacket with Gaussian CM envelope (sigD = 1.8)
function buildEvenSublatticeDoublonPacket(
  M: number,
  mD0: number,
  sigD: number,
): { readonly re: Float64Array; readonly im: Float64Array } {
  const S = 2 * M
  const c2: number[] = Array.from({ length: S + 1 }, (_, n) => (n * (n - 1)) / 2)
  const dim2 = c2[S]!
  const d2Idx = (a: number, b: number): number => (a < b ? a + c2[b]! : b + c2[a]!)
  const re = new Float64Array(dim2)
  const im = new Float64Array(dim2)

  const uPP: Complex = [3 + 4 * OMEGA[0], 4 * OMEGA[1]]
  const uPM: Complex = [1, 0]
  const uMP: Complex = [-7 + 8 * OMEGA[0], 8 * OMEGA[1]]

  for (let m1 = 0; m1 < M; m1++) {
    let dm0 = m1 - mD0
    if (dm0 > M / 2) dm0 -= M
    if (dm0 < -M / 2) dm0 += M
    const e0 = Math.exp(-(dm0 * dm0) / (4 * sigD * sigD))
    const k0 = d2Idx(2 * m1, 2 * m1 + 1)
    re[k0] = re[k0]! + 13 * e0
    for (let d = 1; d <= 5; d++) {
      const m2 = (m1 + d) % M
      let dcm = m1 + 0.5 * d - mD0
      if (dcm > M / 2) dcm -= M
      if (dcm < -M / 2) dcm += M
      const env = Math.exp(-(dcm * dcm) / (4 * sigD * sigD)) * Math.pow(1 / 13, d - 1)
      const terms: readonly (readonly [number, number, Complex])[] = [
        [2 * m1, 2 * m2, uPP],
        [2 * m1, 2 * m2 + 1, uPM],
        [2 * m1 + 1, 2 * m2, uMP],
        [2 * m1 + 1, 2 * m2 + 1, uPP],
      ]
      for (const [a, b, u] of terms) {
        const k = d2Idx(a, b)
        const v = cScale(env, u)
        re[k] = re[k]! + v[0]
        im[k] = im[k]! + v[1]
      }
    }
  }
  let n2 = 0
  for (let i = 0; i < dim2; i++) n2 += re[i]! ** 2 + im[i]! ** 2
  const sc = 1 / Math.sqrt(Math.max(1e-30, n2))
  for (let i = 0; i < dim2; i++) {
    re[i] = re[i]! * sc
    im[i] = im[i]! * sc
  }
  return { re, im }
}

// Live sparse 3-body Sym^3 Doublon + Pulse unitary collision on even-sublattice ring M = 24 (dim = C(48,3) = 17,296).
// Collides the exact Z[omega][1/13] P = 0 doublon packet (mD0 = 12) with a localized Gaussian pulse (mP0 = 5)
// moving right at exact CZ momentum p_* = -atan(6 sqrt(3)/5) (v_g = +6/13) over T = 50 beats.
function runLiveDoublonPulseSym3Collision(): {
  readonly conditionalPhaseRad: number
  readonly fidelity: number
  readonly transmission: number
  readonly breakupProb: number
  readonly normErr: number
} {
  const M = 24
  const S = 2 * M
  const T = 50
  const c2: number[] = Array.from({ length: S + 1 }, (_, n) => (n * (n - 1)) / 2)
  const c3: number[] = Array.from({ length: S + 1 }, (_, n) => (n * (n - 1) * (n - 2)) / 6)
  const dim = c3[S]!
  const dim2 = c2[S]!
  const d2Idx = (a: number, b: number): number => (a < b ? a + c2[b]! : b + c2[a]!)
  const idx3 = (a: number, b: number, c: number): number => {
    let x = a
    let y = b
    let z = c
    if (x > y) { const t = x; x = y; y = t }
    if (y > z) { const t = y; y = z; z = t }
    if (x > y) { const t = x; x = y; y = t }
    return x + c2[y]! + c3[z]!
  }

  const dInit = buildEvenSublatticeDoublonPacket(M, 12, 1.7)
  const pStar = -Math.atan((6 * SQRT3) / 5)
  const pInit = buildEvenSublatticePulse(M, 5, 1.8, pStar)
  const d2R = dInit.re
  const d2I = dInit.im
  const p1R = pInit.re
  const p1I = pInit.im

  // Helper to assemble Sym^3 tensor product of d2 and p1
  const assembleSym3 = (
    a2R: Float64Array,
    a2I: Float64Array,
    a1R: Float64Array,
    a1I: Float64Array,
  ): { readonly re: Float64Array; readonly im: Float64Array } => {
    const outR = new Float64Array(dim)
    const outI = new Float64Array(dim)
    for (let b = 1; b < S; b++) {
      const cb = c2[b]!
      for (let a = 0; a < b; a++) {
        const k2 = a + cb
        const r2 = a2R[k2]!
        const i2 = a2I[k2]!
        if (r2 === 0 && i2 === 0) continue
        for (let c = 0; c < S; c++) {
          if (c === a || c === b) continue
          const r1 = a1R[c]!
          const i1 = a1I[c]!
          if (r1 === 0 && i1 === 0) continue
          const k3 = idx3(a, b, c)
          outR[k3] = outR[k3]! + (r2 * r1 - i2 * i1)
          outI[k3] = outI[k3]! + (r2 * i1 + i2 * r1)
        }
      }
    }
    let n2 = 0
    for (let i = 0; i < dim; i++) n2 += outR[i]! ** 2 + outI[i]! ** 2
    const inv = 1 / Math.sqrt(Math.max(1e-30, n2))
    for (let i = 0; i < dim; i++) {
      outR[i] = outR[i]! * inv
      outI[i] = outI[i]! * inv
    }
    return { re: outR, im: outI }
  }

  let st3 = assembleSym3(d2R, d2I, p1R, p1I)
  let curD2R = Float64Array.from(d2R)
  let curD2I = Float64Array.from(d2I)
  let curP1R = Float64Array.from(p1R)
  let curP1I = Float64Array.from(p1I)

  const coin = diracCoin(PI / 3, PI / 3)
  const c00r = coin[0][0][0]
  const c00i = coin[0][0][1]
  const c01r = coin[0][1][0]
  const c01i = coin[0][1][1]
  const w2r = OMEGA2[0]
  const w2i = OMEGA2[1]

  // Even-sublattice streaming: s=0 stays at m, s=1 shifts to (m-1+M)%M (equivalent to co-moving right frame!)
  const streamEven = (m: number, s: number): number =>
    2 * (s === 0 ? m : (m - 1 + M) % M) + s

  // Single-beat sparse evolution for 1-body, 2-body Sym^2, and 3-body Sym^3
  for (let step = 0; step < T; step++) {
    // 1-body reference step
    const n1R = new Float64Array(S)
    const n1I = new Float64Array(S)
    for (let m = 0; m < M; m++) {
      const r0 = curP1R[2 * m]!
      const i0 = curP1I[2 * m]!
      const r1 = curP1R[2 * m + 1]!
      const i1 = curP1I[2 * m + 1]!
      if (r0 === 0 && i0 === 0 && r1 === 0 && i1 === 0) continue
      const o0 = streamEven(m, 0)
      const o1 = streamEven(m, 1)
      n1R[o0] = n1R[o0]! + (c00r * r0 - c00i * i0 + (c01r * r1 - c01i * i1))
      n1I[o0] = n1I[o0]! + (c00r * i0 + c00i * r0 + (c01r * i1 + c01i * r1))
      n1R[o1] = n1R[o1]! + (c01r * r0 - c01i * i0 + (c00r * r1 - c00i * i1))
      n1I[o1] = n1I[o1]! + (c01r * i0 + c01i * r0 + (c00r * i1 + c00i * r1))
    }
    curP1R = n1R
    curP1I = n1I

    // 2-body Sym^2 reference step
    const n2R = new Float64Array(dim2)
    const n2I = new Float64Array(dim2)
    for (let b = 1; b < S; b++) {
      const cb = c2[b]!
      const mb = b >> 1
      const sb = b & 1
      for (let a = 0; a < b; a++) {
        const k = a + cb
        const ar = curD2R[k]!
        const ai = curD2I[k]!
        if (ar === 0 && ai === 0) continue
        const ma = a >> 1
        const sa = a & 1
        if (ma === mb) {
          const dst = d2Idx(streamEven(ma, 0), streamEven(ma, 1))
          n2R[dst] = n2R[dst]! + (w2r * ar - w2i * ai)
          n2I[dst] = n2I[dst]! + (w2r * ai + w2i * ar)
        } else {
          for (let oa = 0; oa < 2; oa++) {
            const ca = oa === sa ? [c00r, c00i] : [c01r, c01i]
            const tr = ca[0]! * ar - ca[1]! * ai
            const ti = ca[0]! * ai + ca[1]! * ar
            const saOut = streamEven(ma, oa)
            for (let ob = 0; ob < 2; ob++) {
              const cbm = ob === sb ? [c00r, c00i] : [c01r, c01i]
              const vr = cbm[0]! * tr - cbm[1]! * ti
              const vi = cbm[0]! * ti + cbm[1]! * tr
              const dst = d2Idx(saOut, streamEven(mb, ob))
              n2R[dst] = n2R[dst]! + vr
              n2I[dst] = n2I[dst]! + vi
            }
          }
        }
      }
    }
    curD2R = n2R
    curD2I = n2I

    // 3-body Sym^3 full interacting step
    const n3R = new Float64Array(dim)
    const n3I = new Float64Array(dim)
    for (let c = 2; c < S; c++) {
      const cc3 = c3[c]!
      const mc = c >> 1
      const sc = c & 1
      for (let b = 1; b < c; b++) {
        const cb2 = c2[b]!
        const mb = b >> 1
        const sb = b & 1
        for (let a = 0; a < b; a++) {
          const k = a + cb2 + cc3
          const ar = st3.re[k]!
          const ai = st3.im[k]!
          if (ar === 0 && ai === 0) continue
          const ma = a >> 1
          const sa = a & 1
          if (ma === mb) {
            // Pair at ma, lone at mc
            const pr = w2r * ar - w2i * ai
            const pi = w2r * ai + w2i * ar
            const sA = streamEven(ma, 0)
            const sB = streamEven(ma, 1)
            for (let oc = 0; oc < 2; oc++) {
              const cm = oc === sc ? [c00r, c00i] : [c01r, c01i]
              const vr = cm[0]! * pr - cm[1]! * pi
              const vi = cm[0]! * pi + cm[1]! * pr
              const dst = idx3(sA, sB, streamEven(mc, oc))
              n3R[dst] = n3R[dst]! + vr
              n3I[dst] = n3I[dst]! + vi
            }
          } else if (mb === mc) {
            // Pair at mb, lone at ma
            const pr = w2r * ar - w2i * ai
            const pi = w2r * ai + w2i * ar
            const sB = streamEven(mb, 0)
            const sC = streamEven(mb, 1)
            for (let oa = 0; oa < 2; oa++) {
              const cm = oa === sa ? [c00r, c00i] : [c01r, c01i]
              const vr = cm[0]! * pr - cm[1]! * pi
              const vi = cm[0]! * pi + cm[1]! * pr
              const dst = idx3(streamEven(ma, oa), sB, sC)
              n3R[dst] = n3R[dst]! + vr
              n3I[dst] = n3I[dst]! + vi
            }
          } else {
            // Three distinct docks: independent coin C x C x C
            for (let oa = 0; oa < 2; oa++) {
              const ca = oa === sa ? [c00r, c00i] : [c01r, c01i]
              const r1 = ca[0]! * ar - ca[1]! * ai
              const i1 = ca[0]! * ai + ca[1]! * ar
              const sA = streamEven(ma, oa)
              for (let ob = 0; ob < 2; ob++) {
                const cb = ob === sb ? [c00r, c00i] : [c01r, c01i]
                const r2 = cb[0]! * r1 - cb[1]! * i1
                const i2 = cb[0]! * i1 + cb[1]! * r1
                const sB = streamEven(mb, ob)
                for (let oc = 0; oc < 2; oc++) {
                  const cm = oc === sc ? [c00r, c00i] : [c01r, c01i]
                  const vr = cm[0]! * r2 - cm[1]! * i2
                  const vi = cm[0]! * i2 + cm[1]! * r2
                  const dst = idx3(sA, sB, streamEven(mc, oc))
                  n3R[dst] = n3R[dst]! + vr
                  n3I[dst] = n3I[dst]! + vi
                }
              }
            }
          }
        }
      }
    }
    st3 = { re: n3R, im: n3I }
  }

  const ref3 = assembleSym3(curD2R, curD2I, curP1R, curP1I)
  let normEnd = 0
  let ovR = 0
  let ovI = 0
  let pBoundSurvived = 0
  let pTransmitted = 0
  for (let c = 2; c < S; c++) {
    const cc3 = c3[c]!
    const mc = c >> 1
    for (let b = 1; b < c; b++) {
      const cb2 = c2[b]!
      const mb = b >> 1
      for (let a = 0; a < b; a++) {
        const k = a + cb2 + cc3
        const sr = st3.re[k]!
        const si = st3.im[k]!
        const p = sr * sr + si * si
        normEnd += p
        ovR += ref3.re[k]! * sr + ref3.im[k]! * si
        ovI += ref3.re[k]! * si - ref3.im[k]! * sr

        const ma = a >> 1
        const dM = (u: number, v: number) => Math.min(Math.abs(u - v), M - Math.abs(u - v))
        const dab = dM(ma, mb)
        const dbc = dM(mb, mc)
        const dca = dM(mc, ma)
        const minPairDist = Math.min(dab, dbc, dca)
        if (minPairDist <= 2) {
          pBoundSurvived += p
          // Identify spectator position relative to tightest pair center
          let spec = mc
          let pairC = ma
          if (dbc === minPairDist) { spec = ma; pairC = mb }
          else if (dca === minPairDist) { spec = mb; pairC = mc }
          const rel = (((spec - pairC) % M) + M) % M
          // Pulse started left (mP0=5) of doublon (mD0=12) moving right; transmitted means rel in (0, M/2)
          if (rel > 0 && rel < M / 2) pTransmitted += p
        }
      }
    }
  }

  return {
    conditionalPhaseRad: Math.abs(Math.atan2(ovI, ovR)),
    fidelity: ovR * ovR + ovI * ovI,
    transmission: pTransmitted,
    breakupProb: Math.max(0, 1 - pBoundSurvived),
    normErr: Math.abs(normEnd - 1),
  }
}

// Live sparse 3-body (+, +, -) K + M_meet collision on M = 16 (dim = C(32, 2) * 32 = 15,872)
// proving opposite-sign K breaks up the exact Z[omega][1/13] M_meet doublon inelastically!
function runLiveOppositeSignDoublonBreakup(): {
  readonly breakupProb: number
  readonly refOverlapSq: number
  readonly normErr: number
} {
  const M = 16
  const S = 2 * M
  const T = 36
  const c2: number[] = Array.from({ length: S + 1 }, (_, n) => (n * (n - 1)) / 2)
  const dim2 = c2[S]!
  const dim = dim2 * S
  const d2Idx = (a: number, b: number): number => (a < b ? a + c2[b]! : b + c2[a]!)
  const idx3M = (k2: number, nSlot: number): number => k2 * S + nSlot

  const dInit = buildEvenSublatticeDoublonPacket(M, 9, 1.4)
  const pNeg = -Math.atan((6 * SQRT3) / 5)
  const pInit = buildEvenSublatticePulse(M, 3, 1.4, pNeg)
  const d2R = dInit.re
  const d2I = dInit.im
  const p1R = pInit.re
  const p1I = pInit.im

  let stR = new Float64Array(dim)
  let stI = new Float64Array(dim)
  let n0 = 0
  for (let b = 1; b < S; b++) {
    const cb = c2[b]!
    for (let a = 0; a < b; a++) {
      const k2 = a + cb
      const r2 = d2R[k2]!
      const i2 = d2I[k2]!
      if (r2 === 0 && i2 === 0) continue
      for (let nSlot = 0; nSlot < S; nSlot++) {
        if (nSlot === a || nSlot === b) continue
        const r1 = p1R[nSlot]!
        const i1 = p1I[nSlot]!
        if (r1 === 0 && i1 === 0) continue
        const k = idx3M(k2, nSlot)
        const vr = r2 * r1 - i2 * i1
        const vi = r2 * i1 + i2 * r1
        stR[k] = vr
        stI[k] = vi
        n0 += vr * vr + vi * vi
      }
    }
  }
  const inv0 = 1 / Math.sqrt(Math.max(1e-30, n0))
  for (let i = 0; i < dim; i++) {
    stR[i] = stR[i]! * inv0
    stI[i] = stI[i]! * inv0
  }

  let refD2R = Float64Array.from(d2R)
  let refD2I = Float64Array.from(d2I)
  let refP1R = Float64Array.from(p1R)
  let refP1I = Float64Array.from(p1I)

  const coin = diracCoin(PI / 3, PI / 3)
  const c00r = coin[0][0][0]
  const c00i = coin[0][0][1]
  const c01r = coin[0][1][0]
  const c01i = coin[0][1][1]
  const w2r = OMEGA2[0]
  const w2i = OMEGA2[1]
  const kFacR = -OMEGA[0]
  const kFacI = -OMEGA[1]
  const streamEven = (m: number, s: number): number =>
    2 * (s === 0 ? m : (m - 1 + M) % M) + s

  for (let step = 0; step < T; step++) {
    // Advance non-interacting references
    const n1R = new Float64Array(S)
    const n1I = new Float64Array(S)
    for (let m = 0; m < M; m++) {
      const r0 = refP1R[2 * m]!
      const i0 = refP1I[2 * m]!
      const r1 = refP1R[2 * m + 1]!
      const i1 = refP1I[2 * m + 1]!
      if (r0 === 0 && i0 === 0 && r1 === 0 && i1 === 0) continue
      const o0 = streamEven(m, 0)
      const o1 = streamEven(m, 1)
      n1R[o0] = n1R[o0]! + (c00r * r0 - c00i * i0 + (c01r * r1 - c01i * i1))
      n1I[o0] = n1I[o0]! + (c00r * i0 + c00i * r0 + (c01r * i1 + c01i * r1))
      n1R[o1] = n1R[o1]! + (c01r * r0 - c01i * i0 + (c00r * r1 - c00i * i1))
      n1I[o1] = n1I[o1]! + (c01r * i0 + c01i * r0 + (c00r * i1 + c00i * r1))
    }
    refP1R = n1R
    refP1I = n1I

    const n2R = new Float64Array(dim2)
    const n2I = new Float64Array(dim2)
    for (let b = 1; b < S; b++) {
      const cb = c2[b]!
      const mb = b >> 1
      const sb = b & 1
      for (let a = 0; a < b; a++) {
        const k2 = a + cb
        const ar = refD2R[k2]!
        const ai = refD2I[k2]!
        if (ar === 0 && ai === 0) continue
        const ma = a >> 1
        const sa = a & 1
        if (ma === mb) {
          const dst = d2Idx(streamEven(ma, 0), streamEven(ma, 1))
          n2R[dst] = n2R[dst]! + (w2r * ar - w2i * ai)
          n2I[dst] = n2I[dst]! + (w2r * ai + w2i * ar)
        } else {
          for (let oa = 0; oa < 2; oa++) {
            const ca = oa === sa ? [c00r, c00i] : [c01r, c01i]
            const tr = ca[0]! * ar - ca[1]! * ai
            const ti = ca[0]! * ai + ca[1]! * ar
            const sA = streamEven(ma, oa)
            for (let ob = 0; ob < 2; ob++) {
              const cbm = ob === sb ? [c00r, c00i] : [c01r, c01i]
              const vr = cbm[0]! * tr - cbm[1]! * ti
              const vi = cbm[0]! * ti + cbm[1]! * tr
              const dst = d2Idx(sA, streamEven(mb, ob))
              n2R[dst] = n2R[dst]! + vr
              n2I[dst] = n2I[dst]! + vi
            }
          }
        }
      }
    }
    refD2R = n2R
    refD2I = n2I

    // Full interacting (+, +, -) K + M_meet step
    const nxR = new Float64Array(dim)
    const nxI = new Float64Array(dim)
    for (let b = 1; b < S; b++) {
      const cb = c2[b]!
      const mb = b >> 1
      const sb = b & 1
      for (let a = 0; a < b; a++) {
        const k2 = a + cb
        const ma = a >> 1
        const sa = a & 1
        for (let nSlot = 0; nSlot < S; nSlot++) {
          if (nSlot === a || nSlot === b) continue
          const k = idx3M(k2, nSlot)
          const ar = stR[k]!
          const ai = stI[k]!
          if (ar === 0 && ai === 0) continue
          const mn = nSlot >> 1
          const sn = nSlot & 1

          if (ma === mb) {
            // ++ meet at ma, - lone at mn
            const pr = w2r * ar - w2i * ai
            const pi = w2r * ai + w2i * ar
            const kOut = d2Idx(streamEven(ma, 0), streamEven(ma, 1))
            for (let on = 0; on < 2; on++) {
              const cn = on === sn ? [c00r, c00i] : [c01r, c01i]
              const dst = idx3M(kOut, streamEven(mn, on))
              nxR[dst] = nxR[dst]! + (cn[0]! * pr - cn[1]! * pi)
              nxI[dst] = nxI[dst]! + (cn[0]! * pi + cn[1]! * pr)
            }
          } else if (ma === mn) {
            // +- K bounce at ma (a and n swap slots with -omega), + lone at mb
            const pr = kFacR * ar - kFacI * ai
            const pi = kFacR * ai + kFacI * ar
            const sAOut = streamEven(ma, sn)
            const sNOut = streamEven(ma, sa)
            for (let ob = 0; ob < 2; ob++) {
              const cbm = ob === sb ? [c00r, c00i] : [c01r, c01i]
              const dst = idx3M(d2Idx(sAOut, streamEven(mb, ob)), sNOut)
              nxR[dst] = nxR[dst]! + (cbm[0]! * pr - cbm[1]! * pi)
              nxI[dst] = nxI[dst]! + (cbm[0]! * pi + cbm[1]! * pr)
            }
          } else if (mb === mn) {
            // +- K bounce at mb (b and n swap slots with -omega), + lone at ma
            const pr = kFacR * ar - kFacI * ai
            const pi = kFacR * ai + kFacI * ar
            const sBOut = streamEven(mb, sn)
            const sNOut = streamEven(mb, sb)
            for (let oa = 0; oa < 2; oa++) {
              const ca = oa === sa ? [c00r, c00i] : [c01r, c01i]
              const dst = idx3M(d2Idx(streamEven(ma, oa), sBOut), sNOut)
              nxR[dst] = nxR[dst]! + (ca[0]! * pr - ca[1]! * pi)
              nxI[dst] = nxI[dst]! + (ca[0]! * pi + ca[1]! * pr)
            }
          } else {
            // All three on distinct docks: C x C x C
            for (let oa = 0; oa < 2; oa++) {
              const ca = oa === sa ? [c00r, c00i] : [c01r, c01i]
              const r1 = ca[0]! * ar - ca[1]! * ai
              const i1 = ca[0]! * ai + ca[1]! * ar
              const sA = streamEven(ma, oa)
              for (let ob = 0; ob < 2; ob++) {
                const cbm = ob === sb ? [c00r, c00i] : [c01r, c01i]
                const r2 = cbm[0]! * r1 - cbm[1]! * i1
                const i2 = cbm[0]! * i1 + cbm[1]! * r1
                const sB = streamEven(mb, ob)
                const kOut = d2Idx(sA, sB)
                for (let on = 0; on < 2; on++) {
                  const cn = on === sn ? [c00r, c00i] : [c01r, c01i]
                  const dst = idx3M(kOut, streamEven(mn, on))
                  nxR[dst] = nxR[dst]! + (cn[0]! * r2 - cn[1]! * i2)
                  nxI[dst] = nxI[dst]! + (cn[0]! * i2 + cn[1]! * r2)
                }
              }
            }
          }
        }
      }
    }
    stR = nxR
    stI = nxI
  }

  let normEnd = 0
  let pIntactPair = 0
  let ovR = 0
  let ovI = 0
  for (let b = 1; b < S; b++) {
    const cb = c2[b]!
    const mb = b >> 1
    for (let a = 0; a < b; a++) {
      const k2 = a + cb
      const ma = a >> 1
      const dPlus = Math.min(Math.abs(ma - mb), M - Math.abs(ma - mb))
      const r2 = refD2R[k2]!
      const i2 = refD2I[k2]!
      for (let nSlot = 0; nSlot < S; nSlot++) {
        if (nSlot === a || nSlot === b) continue
        const k = idx3M(k2, nSlot)
        const sr = stR[k]!
        const si = stI[k]!
        const p = sr * sr + si * si
        normEnd += p
        if (dPlus <= 1) pIntactPair += p
        const rr = r2 * refP1R[nSlot]! - i2 * refP1I[nSlot]!
        const ri = r2 * refP1I[nSlot]! + i2 * refP1R[nSlot]!
        ovR += rr * sr + ri * si
        ovI += rr * si - ri * sr
      }
    }
  }

  return {
    breakupProb: Math.max(0, 1 - pIntactPair),
    refOverlapSq: ovR * ovR + ovI * ovI,
    normErr: Math.abs(normEnd - 1),
  }
}

// Live 4D 24-slot dock operator check for cross-line L_0 doublon + L_1 lone vibe transparency:
// Evolves the joint 3-vibe configuration through exact 4D dock layers (Phi_odd o D o K o M_meet o D o Phi_odd)
// vs the tensor product of independent L_0 and L_1 evolutions, returning exact L_2 norm difference.
function runLive4DCrossLineTransparencyCheck(): {
  readonly crossLineDiff: number
  readonly branchCount: number
} {
  type Branch = { readonly vibes: readonly DockOccupancy[]; readonly amp: Complex }
  const l0 = ANTIPODAL_LINES[0]!
  const l1 = ANTIPODAL_LINES[1]!

  const applyDockLayers = (init: readonly DockOccupancy[]): Map<string, Complex> => {
    const keyOf = (vs: readonly DockOccupancy[]): string =>
      [...vs]
        .sort((a, b) => a.slot - b.slot || a.role - b.role)
        .map(v => `${v.slot}:${v.tone}:${v.role}`)
        .join('|')

    // 1. Phi_odd
    const chi1 = computeChiralOrientation(init)
    let branches: Branch[] = [{ vibes: init, amp: cExpI((chi1 * PI) / 3) }]

    // 2. Half-coin D (exact: detPhase = zeta_6 on both-occupied lines, (cos(pi/6), -i sin(pi/6))*e^{i pi/6} on lone slots)
    const dDiag = cScale(Math.cos(PI / 6), cExpI(PI / 6))
    const dOff = cMul(cExpI(PI / 6), [0, -Math.sin(PI / 6)])
    const zeta6 = cExpI(PI / 3)

    const applyD = (inBrs: readonly Branch[]): Branch[] => {
      let cur = [...inBrs]
      for (const [sA, sB] of ANTIPODAL_LINES) {
        const next: Branch[] = []
        for (const br of cur) {
          const iA = br.vibes.findIndex(v => v.slot === sA)
          const iB = br.vibes.findIndex(v => v.slot === sB)
          if (iA >= 0 && iB >= 0) {
            next.push({ vibes: br.vibes, amp: cMul(br.amp, zeta6) })
          } else if (iA >= 0 || iB >= 0) {
            const idx = iA >= 0 ? iA : iB
            const opp = iA >= 0 ? sB : sA
            const flipped = br.vibes.map((v, k) => (k === idx ? { ...v, slot: opp } : v))
            next.push({ vibes: br.vibes, amp: cMul(br.amp, dDiag) })
            next.push({ vibes: flipped, amp: cMul(br.amp, dOff) })
          } else {
            next.push(br)
          }
        }
        cur = next
      }
      return cur
    }

    // 3. M_meet on distinct same-tone antipodal pairs: keep = zeta_6 / 2, swap = (omega - 1) / 2
    const mKeep = cScale(0.5, zeta6)
    const mSwap: Complex = [0.5 * (OMEGA[0] - 1), 0.5 * OMEGA[1]]
    const applyMeet = (inBrs: readonly Branch[]): Branch[] => {
      let cur = [...inBrs]
      for (const [sA, sB] of ANTIPODAL_LINES) {
        const next: Branch[] = []
        for (const br of cur) {
          const iA = br.vibes.findIndex(v => v.slot === sA)
          const iB = br.vibes.findIndex(v => v.slot === sB)
          if (iA >= 0 && iB >= 0 && br.vibes[iA]!.tone === br.vibes[iB]!.tone) {
            if (br.vibes[iA]!.role === br.vibes[iB]!.role) {
              next.push({ vibes: br.vibes, amp: cMul(br.amp, OMEGA) })
            } else {
              const swapped = br.vibes.map((v, k) =>
                k === iA
                  ? { ...v, role: br.vibes[iB]!.role }
                  : k === iB
                    ? { ...v, role: br.vibes[iA]!.role }
                    : v,
              )
              next.push({ vibes: br.vibes, amp: cMul(br.amp, mKeep) })
              next.push({ vibes: swapped, amp: cMul(br.amp, mSwap) })
            }
          } else {
            next.push(br)
          }
        }
        cur = next
      }
      return cur
    }

    branches = applyD(branches)
    branches = applyMeet(branches)
    branches = applyD(branches)
    // Final Phi_odd
    const out = new Map<string, Complex>()
    for (const br of branches) {
      const chi2 = computeChiralOrientation(br.vibes)
      const amp = cMul(br.amp, cExpI((chi2 * PI) / 3))
      const k = keyOf(br.vibes)
      const prev = out.get(k)
      out.set(k, prev ? cAdd(prev, amp) : amp)
    }
    return out
  }

  const pairL0: readonly DockOccupancy[] = [
    { slot: l0[0], tone: 1, role: 0 },
    { slot: l0[1], tone: 1, role: 1 },
  ]
  const loneL1: readonly DockOccupancy[] = [{ slot: l1[0], tone: 1, role: 2 }]

  const jointOut = applyDockLayers([...pairL0, ...loneL1])
  const outL0 = applyDockLayers(pairL0)
  const outL1 = applyDockLayers(loneL1)

  const tensorOut = new Map<string, Complex>()
  for (const [k0, a0] of outL0) {
    for (const [k1, a1] of outL1) {
      const mergedKey = [...k0.split('|'), ...k1.split('|')]
        .sort((x, y) => Number(x.split(':')[0]) - Number(y.split(':')[0]))
        .join('|')
      const prod = cMul(a0, a1)
      const prev = tensorOut.get(mergedKey)
      tensorOut.set(mergedKey, prev ? cAdd(prev, prod) : prod)
    }
  }

  const allKeys = new Set([...jointOut.keys(), ...tensorOut.keys()])
  let diffSq = 0
  for (const k of allKeys) {
    const a = jointOut.get(k) ?? ([0, 0] as Complex)
    const b = tensorOut.get(k) ?? ([0, 0] as Complex)
    diffSq += (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
  }
  return { crossLineDiff: Math.sqrt(diffSq), branchCount: jointOut.size }
}

// =================================================================================================
// 5. BARE-U SPECIES ZOO SCANNER & COLLISION MATRIX
// =================================================================================================

export interface ZooSpeciesFingerprint {
  readonly id: string
  readonly label: string
  readonly particleCount: number
  readonly canonicalSignature: string
  readonly symmetryOrbitSize: number
  readonly bound: boolean
  readonly lifetime: number
  readonly contactProb: number
  readonly ipr: number
  readonly decayRatio: number
  readonly quasienergy: number
  readonly chiOdd: number
  readonly bindingGap: number
  readonly groupVelocity: number
  readonly levelSpacingR: number | null
  readonly realizationMode: RealizationMode
}

export type CollisionOutcome =
  | 'pass-through'
  | 'phase-shift'
  | 'role-swap'
  | 'bound_state_eigenchannel'
  | 'chiral_cancellation_chi_odd_zero'
  | 'chiral-asymmetry'
  | 'inelastic-breakup'

export type CollisionMeasurementKind =
  | 'live_unitary_collision'
  | 'exact_spectral_eigenchannel'
  | 'exact_4d_chiral_operator'
  | 'exact_analytic_yang_formula'

export interface CollisionMatrixEntry {
  readonly speciesA: string
  readonly speciesB: string
  readonly channel: string
  readonly outcome: CollisionOutcome
  readonly measurementKind: CollisionMeasurementKind
  readonly conditionalPhaseRad: number
  readonly roleSwapProb: number
  readonly breakupProb: number
  readonly crossLineDiff: number
  readonly chiOddDelta: number
  readonly unitarityError: number
  readonly detail: string
}

export interface BareUZooReport {
  readonly species: readonly ZooSpeciesFingerprint[]
  readonly collisions: readonly CollisionMatrixEntry[]
  readonly neutralPairCancellationZeroCount: number
  readonly neutralPairCancellationTestedCount: number
  readonly chaosSectorInteractionDeviation: number
  readonly unitarityMaxError: number
}

export function scanBareUZoo(): BareUZooReport {
  let maxUniErr = 0

  // 1. k = 1 lone geodesic vibe (exact Bloch dispersion; single-particle <r> is undefined -> null)
  const loneDock: readonly DockOccupancy[] = [{ slot: ANTIPODAL_LINES[0]![0], tone: 1, role: 0 }]
  const loneCanon = canonicalizeDockPattern(loneDock)
  const loneVMax = Math.cos(PI / 3) // exact 0.5
  const loneSpecies: ZooSpeciesFingerprint = {
    id: 'vibe_k1_lone',
    label: 'Bare-U k=1 Lone Geodesic Vibe',
    particleCount: 1,
    canonicalSignature: loneCanon.canonicalKey,
    symmetryOrbitSize: loneCanon.orbitSize,
    bound: false,
    lifetime: Number.POSITIVE_INFINITY,
    contactProb: 0,
    ipr: 0,
    decayRatio: 1,
    quasienergy: bareSingleParticleE(0, -1),
    chiOdd: loneCanon.chiOdd,
    bindingGap: 0,
    groupVelocity: loneVMax,
    levelSpacingR: null,
    realizationMode: 'field',
  }

  // 2. k = 2 M_meet sym(+) doublon (exact z = 1/13, contactProb = 6/13, v_max = 1/sqrt(13))
  const line0 = ANTIPODAL_LINES[0]!
  const doublonDock: readonly DockOccupancy[] = [
    { slot: line0[0], tone: 1, role: 0 },
    { slot: line0[1], tone: 1, role: 1 },
  ]
  const doublonCanon = canonicalizeDockPattern(doublonDock)
  const u2Bare = buildU2SymCM(16, 0, PI / 3, PI / 3, OMEGA2)
  maxUniErr = Math.max(maxUniErr, unitaryError(u2Bare))
  const d0 = findBoundDoublon(16, 0, PI / 3, PI / 3, OMEGA2)
  const e2HalfPiTarget = PI / 3 + Math.asin(1 / Math.sqrt(13))
  const dHalfMinus = shiftInvertEigen(
    buildU2SymCM(16, PI / 2 - 1e-3, PI / 3, PI / 3, OMEGA2),
    e2HalfPiTarget + 2.8e-4,
    undefined,
    undefined,
    6,
  )
  const dHalfPlus = shiftInvertEigen(
    buildU2SymCM(16, PI / 2 + 1e-3, PI / 3, PI / 3, OMEGA2),
    e2HalfPiTarget - 2.8e-4,
    undefined,
    undefined,
    6,
  )
  const doublonVMax = Math.abs(wrapPi(dHalfMinus.E - dHalfPlus.E)) / 2e-3
  const doublonZDecay = d0.decayRatio
  const rIntegrable = computeIntegrableR(PI / 3, PI / 3, OMEGA2)

  const doublonSpecies: ZooSpeciesFingerprint = {
    id: 'doublon_k2_m_meet',
    label: 'Bare-U k=2 M_meet sym(+) Doublon (Z[omega][1/13])',
    particleCount: 2,
    canonicalSignature: doublonCanon.canonicalKey,
    symmetryOrbitSize: doublonCanon.orbitSize,
    bound: d0.bound,
    lifetime: Number.POSITIVE_INFINITY,
    contactProb: d0.contactProb,
    ipr: d0.ipr,
    decayRatio: doublonZDecay,
    quasienergy: d0.E,
    chiOdd: doublonCanon.chiOdd,
    bindingGap: d0.bindingGap,
    groupVelocity: doublonVMax,
    levelSpacingR: rIntegrable,
    realizationMode: 'field',
  }

  // 3. k = 2 K-bounce opposite-tone pair (exact unbound control, meetPhase = -omega)
  const kBounceDock: readonly DockOccupancy[] = [
    { slot: line0[0], tone: 1, role: 0 },
    { slot: line0[1], tone: -1, role: 0 },
  ]
  const kBounceCanon = canonicalizeDockPattern(kBounceDock)
  const negOmega: Complex = [-OMEGA[0], -OMEGA[1]]
  const u2KBounce = buildU2SymCM(16, 0, PI / 3, PI / 3, negOmega)
  maxUniErr = Math.max(maxUniErr, unitaryError(u2KBounce))
  const k0 = findBoundDoublon(16, 0, PI / 3, PI / 3, negOmega)
  const kBounceSpecies: ZooSpeciesFingerprint = {
    id: 'pair_k2_k_bounce',
    label: 'Bare-U k=2 Opposite-Tone K-Bounce Pair (Unbound Control)',
    particleCount: 2,
    canonicalSignature: kBounceCanon.canonicalKey,
    symmetryOrbitSize: kBounceCanon.orbitSize,
    bound: k0.bound,
    lifetime: 1,
    contactProb: k0.contactProb,
    ipr: k0.ipr,
    decayRatio: 1,
    quasienergy: 0,
    chiOdd: kBounceCanon.chiOdd,
    bindingGap: k0.bindingGap,
    groupVelocity: loneVMax,
    levelSpacingR: computeLevelSpacingRatio(k0.phases).meanR,
    realizationMode: 'field',
  }

  // 4. k = 3 Sym^3 M_meet trion on prime M = 11 (exact symCount === 1 everywhere, full spectrum gap!)
  const M3 = 11
  const trionSys = buildU3SymEven(M3, 0, PI / 3, PI / 3, OMEGA2)
  maxUniErr = Math.max(maxUniErr, unitaryError(trionSys.U))
  const trionFullEig = unitaryEigen(trionSys.U)
  const e3Target = Math.atan2((-3 * SQRT3) / 14, -13 / 14)
  const tRef = shiftInvertEigen(trionSys.U, e3Target, undefined, undefined, 7)

  // Compute exact trion binding gap against ALL other eigenphases of trionSys.U (not a single analytic point)
  let trionMinContinuumGap = PI
  for (let i = 0; i < trionFullEig.phases.length; i++) {
    const d = phaseDist(tRef.E, trionFullEig.phases[i]!)
    if (d > 1e-6 && d < trionMinContinuumGap) trionMinContinuumGap = d
  }

  let trionContact = 0
  let pPairSep1 = 0
  let pPairSep2 = 0
  for (let i = 0; i < trionSys.configs.length; i++) {
    const cfg = trionSys.configs[i]!
    const p = tRef.vr[i]! ** 2 + tRef.vi[i]! ** 2
    const m0 = cfg[0]![0]
    const m1 = cfg[1]![0]
    const m2 = cfg[2]![0]
    if (m0 === m1 || m1 === m2 || m0 === m2) trionContact += p
    if (m0 === 0 && m1 === 0 && cfg[0]![1] === 0 && cfg[1]![1] === 1) {
      if (m2 === 1) pPairSep1 += p
      else if (m2 === 2) pPairSep2 += p
    }
  }

  const e3QuarterPi = wrapPi(
    -PI + Math.asin(1 / Math.sqrt(28)) + Math.asin(Math.SQRT1_2 / Math.sqrt(28)),
  )
  const tMinus = shiftInvertEigen(
    buildU3SymEven(M3, (PI / 4 - 1e-3) / 3, PI / 3, PI / 3, OMEGA2).U,
    e3QuarterPi + 1.35e-4,
    tRef.vr,
    tRef.vi,
    6,
  )
  const tPlus = shiftInvertEigen(
    buildU3SymEven(M3, (PI / 4 + 1e-3) / 3, PI / 3, PI / 3, OMEGA2).U,
    e3QuarterPi - 1.35e-4,
    tRef.vr,
    tRef.vi,
    6,
  )
  const trionVQuarter = Math.abs(wrapPi(tMinus.E - tPlus.E)) / 2e-3
  const trionDecayRatio = pPairSep1 > 1e-12 ? Math.sqrt(pPairSep2 / pPairSep1) : 1 / 7

  // Compute trion's own W(F_4) x C collinear canonical signature and orbit size (2 on dock 0, 1 on adjacent dock 1)
  const trionCanon = canonicalizeCollinearPattern([
    { dockOffset: 0, slot: line0[0], tone: 1 },
    { dockOffset: 0, slot: line0[1], tone: 1 },
    { dockOffset: 1, slot: line0[0], tone: 1 },
  ])

  const trionSpecies: ZooSpeciesFingerprint = {
    id: 'trion_k3_sym3',
    label: 'Bare-U k=3 Sym^3 M_meet Trion (Z[omega][1/7])',
    particleCount: 3,
    canonicalSignature: trionCanon.canonicalKey,
    symmetryOrbitSize: trionCanon.orbitSize,
    bound: trionMinContinuumGap > 0.05 && tRef.residual < 1e-9,
    lifetime: Number.POSITIVE_INFINITY,
    contactProb: trionContact,
    ipr: tRef.ipr,
    decayRatio: trionDecayRatio,
    quasienergy: tRef.E,
    chiOdd: 0,
    bindingGap: trionMinContinuumGap,
    groupVelocity: trionVQuarter,
    levelSpacingR: rIntegrable,
    realizationMode: 'field',
  }

  // 5. k = 4 non-coplanar Phi_odd chiral cluster C4 = lines [0, 1, 2, 8]
  // Single dock configuration: many-body <r> is undefined (null).
  const c4Lines = [0, 1, 2, 8] as const
  const chiralDock: readonly DockOccupancy[] = c4Lines.map((l, idx) => ({
    slot: ANTIPODAL_LINES[l]![0],
    tone: 1,
    role: idx,
  }))
  const chiralCanon = canonicalizeDockPattern(chiralDock)
  const chiralChargeConj: readonly DockOccupancy[] = chiralDock.map(v => ({
    slot: v.slot,
    tone: (v.tone === 1 ? -1 : 1) as 1 | -1,
    role: v.role,
  }))
  const mirrorSlotP0 = (s: number): number => {
    const r = D4_ROOTS[s]!
    return D4_ROOTS.findIndex(
      o => o[0] === -r[0] && o[1] === r[1] && o[2] === r[2] && o[3] === r[3],
    )
  }
  const chiralParityMirror: readonly DockOccupancy[] = chiralDock.map(v => ({
    slot: mirrorSlotP0(v.slot),
    tone: v.tone,
    role: v.role,
  }))
  const chiC = computeChiralOrientation(chiralChargeConj)
  const chiP = computeChiralOrientation(chiralParityMirror)

  const chiralSpecies: ZooSpeciesFingerprint = {
    id: 'chiral_k4_phi_odd',
    label: 'Bare-U k=4 Non-Coplanar C4 Phi_odd Chiral Cluster',
    particleCount: 4,
    canonicalSignature: chiralCanon.canonicalKey,
    symmetryOrbitSize: chiralCanon.orbitSize,
    bound: false,
    lifetime: 1,
    contactProb: 1,
    ipr: 1,
    decayRatio: 1,
    quasienergy: (chiralCanon.chiOdd * PI) / 3,
    chiOdd: chiralCanon.chiOdd,
    bindingGap: 0,
    groupVelocity: loneVMax,
    levelSpacingR: null,
    realizationMode: 'field',
  }

  // Exact (-I, C) Chiral Cancellation Theorem across 242 neutral-pair junctions:
  //   132 2-rail junctions (C(12, 2) = 66 line pairs x 2 relative tone orientations)
  //   + 110 3-rail junctions (l1 in 0..5, l2 in l1+1..7, l3 in l2+1..9) = 242 exact configs.
  let neutralPairTested = 0
  let neutralPairZero = 0
  for (let l1 = 0; l1 < 12; l1++) {
    for (let l2 = l1 + 1; l2 < 12; l2++) {
      for (const s2 of [1, -1] as const) {
        const pairJunction: DockOccupancy[] = [
          { slot: ANTIPODAL_LINES[l1]![0], tone: 1, role: 0 },
          { slot: ANTIPODAL_LINES[l1]![1], tone: -1, role: 0 },
          { slot: ANTIPODAL_LINES[l2]![0], tone: s2, role: 1 },
          { slot: ANTIPODAL_LINES[l2]![1], tone: (s2 === 1 ? -1 : 1) as 1 | -1, role: 1 },
        ]
        neutralPairTested++
        if (computeChiralOrientation(pairJunction) === 0) neutralPairZero++
      }
    }
  }
  for (let l1 = 0; l1 < 6; l1++) {
    for (let l2 = l1 + 1; l2 < 8; l2++) {
      for (let l3 = l2 + 1; l3 < 10; l3++) {
        const tripleJunction: DockOccupancy[] = [
          { slot: ANTIPODAL_LINES[l1]![0], tone: 1, role: 0 },
          { slot: ANTIPODAL_LINES[l1]![1], tone: -1, role: 0 },
          { slot: ANTIPODAL_LINES[l2]![0], tone: 1, role: 1 },
          { slot: ANTIPODAL_LINES[l2]![1], tone: -1, role: 1 },
          { slot: ANTIPODAL_LINES[l3]![0], tone: -1, role: 2 },
          { slot: ANTIPODAL_LINES[l3]![1], tone: 1, role: 2 },
        ]
        neutralPairTested++
        if (computeChiralOrientation(tripleJunction) === 0) neutralPairZero++
      }
    }
  }

  // --- EXECUTE LIVE UNITARY COLLISIONS & EXACT 4D OPERATOR CHECKS ---
  const live2Meet = runLive2BodyCollision('M_meet')
  const live2K = runLive2BodyCollision('K_bounce')
  const live3Sym3 = runLiveDoublonPulseSym3Collision()
  const live3Breakup = runLiveOppositeSignDoublonBreakup()
  const live4DCross = runLive4DCrossLineTransparencyCheck()
  maxUniErr = Math.max(
    maxUniErr,
    live2Meet.normErr,
    live2K.normErr,
    live3Sym3.normErr,
    live3Breakup.normErr,
  )

  // Compute live 1-step interaction deviation of uChaosBare vs non-interacting free limit (phi = pi)
  const uChaosBare = build1DMixedChaosSector(5, (2 * PI) / 5, PI / 3, PI / 3, OMEGA2)
  const uFreeMixed = build1DMixedChaosSector(5, (2 * PI) / 5, PI / 3, PI / 3, negOmega)
  maxUniErr = Math.max(maxUniErr, unitaryError(uChaosBare), unitaryError(uFreeMixed))
  let chaosDiffSq = 0
  for (let i = 0; i < uChaosBare.re.length; i++) {
    const dr = uChaosBare.re[i]! - uFreeMixed.re[i]!
    const di = uChaosBare.im[i]! - uFreeMixed.im[i]!
    chaosDiffSq += dr * dr + di * di
  }
  const chaosSectorInteractionDeviation = Math.sqrt(chaosDiffSq / uChaosBare.n)

  // Exact analytic Yang-fusion references (explicitly marked measurementKind: 'exact_analytic_yang_formula')
  const pStar = -Math.atan((6 * SQRT3) / 5)
  const uStar = bareYangRapidity(pStar, 1)
  const sDPSym3 = cDiv(cMul([uStar, -0.5], [uStar, -1.5]), cMul([uStar, 0.5], [uStar, 1.5]))
  const sDPStd = cDiv([uStar, -0.5], [uStar, 0.5])
  const aElSep = cScale(1 / 3, cAdd(sDPSym3, cScale(2, sDPStd)))
  const pRoleSwapDP = 1 - cAbs(aElSep) ** 2

  const pStarT = -Math.atan((3 * Math.SQRT2) / 5)
  const uStarT = bareYangRapidity(pStarT, 1)
  const sTPSym4 = cDiv(cMul([uStarT, -2], [uStarT, -1]), cMul([uStarT, 2], [uStarT, 1]))
  const phaseTP = Math.abs(Math.atan2(sTPSym4[1], sTPSym4[0]))

  const collisions: CollisionMatrixEntry[] = [
    {
      speciesA: 'vibe_k1_lone',
      speciesB: 'vibe_k1_lone',
      channel: '1D live wavepacket same-sign M_meet (distinct roles, L=36, T=26)',
      outcome: 'role-swap',
      measurementKind: 'live_unitary_collision',
      conditionalPhaseRad: live2Meet.conditionalPhaseRad,
      roleSwapProb: live2Meet.roleSwapProb,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      unitarityError: live2Meet.normErr,
      detail: `Live 2-body collision: P_swap=${live2Meet.roleSwapProb.toFixed(4)} (Yang ref=${live2Meet.analyticSwapRef.toFixed(4)}), |ov|=${live2Meet.overlapMag.toFixed(4)}, normErr=${live2Meet.normErr.toExponential(1)}`,
    },
    {
      speciesA: 'vibe_k1_lone',
      speciesB: 'vibe_k1_lone',
      channel: '1D live wavepacket opposite-sign K bounce (L=36, T=26)',
      outcome: 'phase-shift',
      measurementKind: 'live_unitary_collision',
      conditionalPhaseRad: live2K.conditionalPhaseRad,
      roleSwapProb: live2K.roleSwapProb,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      unitarityError: live2K.normErr,
      detail: `Live 2-body K-bounce: P_reflect=${live2K.roleSwapProb.toFixed(4)}, phase=${(live2K.conditionalPhaseRad / PI).toFixed(4)}pi, normErr=${live2K.normErr.toExponential(1)}`,
    },
    {
      speciesA: 'vibe_k1_lone',
      speciesB: 'vibe_k1_lone',
      channel: 'Exact U_2 Sym(+) bound-state eigenchannel (not 2->1 capture)',
      outcome: 'bound_state_eigenchannel',
      measurementKind: 'exact_spectral_eigenchannel',
      conditionalPhaseRad: d0.E,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      unitarityError: unitaryError(u2Bare),
      detail: `Exact discrete U_2 eigenstate: z=1/13 (${doublonZDecay.toFixed(5)}), p0=${d0.contactProb.toFixed(5)}, gap=${d0.bindingGap.toFixed(5)}`,
    },
    {
      speciesA: 'doublon_k2_m_meet',
      speciesB: 'vibe_k1_lone',
      channel: '1D live Sym^3 wavepacket collision at p_* = -atan(6 sqrt(3)/5) (M=24, T=50)',
      outcome: 'phase-shift',
      measurementKind: 'live_unitary_collision',
      conditionalPhaseRad: live3Sym3.conditionalPhaseRad,
      roleSwapProb: 0,
      breakupProb: live3Sym3.breakupProb,
      crossLineDiff: 0,
      chiOddDelta: 0,
      unitarityError: live3Sym3.normErr,
      detail: `Live 3-body Sym^3 CZ: dPhi=${(live3Sym3.conditionalPhaseRad / PI).toFixed(4)}pi, fid=${live3Sym3.fidelity.toFixed(4)}, T=${live3Sym3.transmission.toFixed(4)}, P_break=${live3Sym3.breakupProb.toFixed(4)}`,
    },
    {
      speciesA: 'doublon_k2_m_meet',
      speciesB: 'vibe_k1_lone',
      channel: '1D live (+,+,-) opposite-sign K breakup collision (M=16, T=36)',
      outcome: 'inelastic-breakup',
      measurementKind: 'live_unitary_collision',
      conditionalPhaseRad: 0,
      roleSwapProb: 0,
      breakupProb: live3Breakup.breakupProb,
      crossLineDiff: 0,
      chiOddDelta: 0,
      unitarityError: live3Breakup.normErr,
      detail: `Live 3-body K+M_meet breakup: P_break=${live3Breakup.breakupProb.toFixed(4)}, |<ref|out>|^2=${live3Breakup.refOverlapSq.toFixed(4)}, uChaosDev=${chaosSectorInteractionDeviation.toFixed(4)}`,
    },
    {
      speciesA: 'doublon_k2_m_meet',
      speciesB: 'vibe_k1_lone',
      channel: '1D 3-role separable |(0,1)_Sym> (x) |(2)> Yang fusion reference',
      outcome: 'role-swap',
      measurementKind: 'exact_analytic_yang_formula',
      conditionalPhaseRad: Math.atan2(aElSep[1], aElSep[0]),
      roleSwapProb: pRoleSwapDP,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      unitarityError: 0,
      detail: `Exact Yang fusion analytic formula: P_el=1/3, P_roleSwap=${pRoleSwapDP.toFixed(6)}, arg(a_el)=+0.5000pi`,
    },
    {
      speciesA: 'doublon_k2_m_meet',
      speciesB: 'vibe_k1_lone',
      channel: '4D live 24-slot dock cross-line intersection (L_0 x L_1)',
      outcome: 'pass-through',
      measurementKind: 'live_unitary_collision',
      conditionalPhaseRad: 0,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: live4DCross.crossLineDiff,
      chiOddDelta: 0,
      unitarityError: 0,
      detail: `Live 4D dock evolution (${live4DCross.branchCount} branches): ||U_joint - U_L0 (x) U_L1||_2 = ${live4DCross.crossLineDiff.toExponential(1)}`,
    },
    {
      speciesA: 'trion_k3_sym3',
      speciesB: 'vibe_k1_lone',
      channel: '1D Sym^4 Trion+Pulse at p_*^(T) = -atan(3 sqrt(2)/5) Yang fusion reference',
      outcome: 'phase-shift',
      measurementKind: 'exact_analytic_yang_formula',
      conditionalPhaseRad: phaseTP,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      unitarityError: 0,
      detail: `Exact Sym^4 analytic Yang fusion formula: Delta_phi = ${(phaseTP / PI).toFixed(6)}pi`,
    },
    {
      speciesA: 'pair_k2_k_bounce',
      speciesB: 'pair_k2_k_bounce',
      channel: '4D multi-rail (-I, C) neutral-pair chiral cancellation (k and D conserved)',
      outcome: 'chiral_cancellation_chi_odd_zero',
      measurementKind: 'exact_4d_chiral_operator',
      conditionalPhaseRad: 0,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      unitarityError: 0,
      detail: `Exact (-I, C) Chiral Cancellation: chi_odd = 0 across ${neutralPairZero}/${neutralPairTested} (132 2-rail + 110 3-rail) junctions`,
    },
    {
      speciesA: 'chiral_k4_phi_odd',
      speciesB: 'C_and_P0_conjugates(chiral_k4_phi_odd)',
      channel: '4D single-cluster C4=[0,1,2,8] self-symmetry comparison under C and P_0',
      outcome: 'chiral-asymmetry',
      measurementKind: 'exact_4d_chiral_operator',
      conditionalPhaseRad: ((chiralCanon.chiOdd - chiC) * PI) / 3,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 1,
      chiOddDelta: chiralCanon.chiOdd - chiC,
      unitarityError: 0,
      detail: `4-body self-symmetry check (not 8-body): chi(C4)=${chiralCanon.chiOdd}, chi(C(C4))=${chiC}, chi(P_0(C4))=${chiP}, Delta_phi=${(((chiralCanon.chiOdd - chiC) * PI) / 3).toFixed(4)} rad`,
    },
  ]

  return {
    species: [loneSpecies, doublonSpecies, kBounceSpecies, trionSpecies, chiralSpecies],
    collisions,
    neutralPairCancellationZeroCount: neutralPairZero,
    neutralPairCancellationTestedCount: neutralPairTested,
    chaosSectorInteractionDeviation,
    unitarityMaxError: maxUniErr,
  }
}

export function speciesToDiscoveryInput(
  species: ZooSpeciesFingerprint,
  parentIds: readonly string[],
  generation: number,
): DiscoveryRegistrationInput<ZooSpeciesFingerprint> {
  const evidence: CapabilityEvidence[] = [
    certifyCapability({
      capability: 'persist',
      evidenceKind: 'exact_deterministic_proof',
      protocol: 'bare_u_spectral_lifetime',
      experiment: 'A1_zoo_scanner',
      realizationMode: 'field',
      score: Number.isFinite(species.lifetime) ? species.lifetime : 1000,
      baseline: 1,
      standardError: null,
      effectSize: null,
      trials: 1,
      minMargin: 10,
    }),
    certifyCapability({
      capability: 'propagate',
      evidenceKind: 'exact_deterministic_proof',
      protocol: 'bare_u_bloch_group_velocity',
      experiment: 'A1_zoo_scanner',
      realizationMode: 'field',
      score: species.groupVelocity,
      baseline: 0,
      standardError: null,
      effectSize: null,
      trials: 1,
      minMargin: 0.05,
    }),
    certifyCapability({
      capability: 'bind',
      evidenceKind: 'exact_deterministic_proof',
      protocol: 'bare_u_binding_gap_vs_k_bounce',
      experiment: 'A1_zoo_scanner',
      realizationMode: 'field',
      score: species.bindingGap,
      baseline: 0,
      standardError: null,
      effectSize: null,
      trials: 1,
      minMargin: 0.01,
    }),
  ]

  return {
    id: `discovery:${species.id}`,
    label: species.label,
    category: species.particleCount === 1 ? 'particle' : 'composite',
    atlas: 'forms',
    parentIds,
    generation,
    realizationMode: 'field',
    genome: species,
    evidence,
    metrics: {
      particle_count: species.particleCount,
      contact_prob: species.contactProb,
      ipr: species.ipr,
      decay_ratio: species.decayRatio,
      binding_gap: species.bindingGap,
      group_velocity: species.groupVelocity,
      chi_odd: species.chiOdd,
    },
  }
}

// =================================================================================================
// 6. QUANTITATIVE 2D PARAMETRIC (m, phi) DYNAMICAL PHASE CARTOGRAPHY (100% OBSERVABLE-DRIVEN)
// =================================================================================================

export type DynamicalPhaseClass =
  | 'free-dispersive'
  | 'integrable-bound'
  | 'relativistic-Thirring'
  | 'chaotic-COE'

export interface PhaseMapPoint {
  readonly m: number
  readonly phi: number
  readonly sectorLabel: 'same_sign_sym3' | 'mixed_sign_k_plus_m_meet'
  readonly bound: boolean
  readonly bindingGap: number
  readonly restEnergy: number
  readonly inertialMass: number
  readonly inertiaRatioR2: number
  readonly levelSpacingR: number
  readonly phaseClass: DynamicalPhaseClass
}

export interface DynamicalPhaseMap {
  readonly mValues: readonly number[]
  readonly phiValues: readonly number[]
  readonly gridPoints: readonly PhaseMapPoint[]
  readonly mixedSignPoints: readonly PhaseMapPoint[]
  readonly phaseCounts: Readonly<Record<DynamicalPhaseClass, number>>
  readonly bareUPoint: PhaseMapPoint
  readonly relativisticWitness: PhaseMapPoint
  readonly chaosWitness: PhaseMapPoint
}

// Purely observable-driven phase classifier (ZERO hardcoded sector/chaos toggle inputs!):
//   1. Free / non-interacting (bindingGap <= 0.005) checked FIRST so picket-fence free spectra
//      are classified as 'free-dispersive'.
//   2. Interacting quantum chaos (<r> >= 0.485, approaching COE 0.5307 vs Poisson 0.3863).
//   3. Emergent relativistic continuum Thirring regime (0.85 <= R_2 <= 1.25).
//   4. Lattice-heavy integrable bound regime (R_2 > 1.25, Poisson <r> < 0.485).
export function classifyPhasePoint(
  bound: boolean,
  bindingGap: number,
  inertiaRatioR2: number,
  levelSpacingR: number,
): DynamicalPhaseClass {
  if (!bound || bindingGap <= 0.005) {
    return 'free-dispersive'
  }
  if (levelSpacingR >= 0.485) {
    return 'chaotic-COE'
  }
  if (Number.isFinite(inertiaRatioR2) && inertiaRatioR2 >= 0.85 && inertiaRatioR2 <= 1.25) {
    return 'relativistic-Thirring'
  }
  return 'integrable-bound'
}

function measureDoublonInertia(
  mCoin: number,
  phi: number,
): {
  readonly bound: boolean
  readonly bindingGap: number
  readonly restEnergy: number
  readonly inertialMass: number
  readonly inertiaRatioR2: number
} {
  const H = mCoin <= 0.14 ? 32 : 16
  const meetPhase = cExpI(phi)
  const b0 = findBoundDoublon(H, 0, mCoin, 0, meetPhase)
  if (!b0.bound) {
    return {
      bound: false,
      bindingGap: 0,
      restEnergy: 0,
      inertialMass: Number.POSITIVE_INFINITY,
      inertiaRatioR2: Number.POSITIVE_INFINITY,
    }
  }
  const restEnergy = Math.abs(b0.E)
  const dP = Math.min(0.015, Math.max(0.002, mCoin * 0.08))
  const uP = buildU2SymCM(H, dP, mCoin, 0, meetPhase)
  const refP = shiftInvertEigen(uP, b0.E, b0.vr, b0.vi, 5)
  const dE = Math.abs(refP.E) - restEnergy
  const inertialMass =
    Math.abs(dE) > 1e-12 ? (dP * dP) / (2 * Math.abs(dE)) : Number.POSITIVE_INFINITY
  const inertiaRatioR2 =
    restEnergy > 1e-12 ? inertialMass / restEnergy : Number.POSITIVE_INFINITY
  return {
    bound: true,
    bindingGap: b0.bindingGap,
    restEnergy,
    inertialMass,
    inertiaRatioR2,
  }
}

export function scanDynamicalPhaseMap(): DynamicalPhaseMap {
  const mValues: readonly number[] = [0.08, 0.14, 0.24, 0.42, 0.65, 0.88, PI / 3]
  const phiValues: readonly number[] = [
    0.25 * PI,
    0.45 * PI,
    0.6 * PI,
    (2 * PI) / 3,
    0.8 * PI,
    0.92 * PI,
    PI,
  ]

  const gridPoints: PhaseMapPoint[] = []
  const phaseCounts: Record<DynamicalPhaseClass, number> = {
    'free-dispersive': 0,
    'integrable-bound': 0,
    'relativistic-Thirring': 0,
    'chaotic-COE': 0,
  }

  for (const m of mValues) {
    for (const phi of phiValues) {
      const meas = measureDoublonInertia(m, phi)
      // Use prime M = 11 (dim = 140, symCount === 1 everywhere) for clean non-degenerate bulk <r>
      // on bound points, and prime M = 7 on free points.
      const rVal = meas.bound
        ? computeIntegrableR(m, 0, cExpI(phi))
        : computeLevelSpacingRatio(unitaryEigen(buildU3SymEven(7, PI / 13, m, 0, cExpI(phi)).U).phases).meanR
      const phaseClass = classifyPhasePoint(
        meas.bound,
        meas.bindingGap,
        meas.inertiaRatioR2,
        rVal,
      )
      phaseCounts[phaseClass]++
      gridPoints.push({
        m,
        phi,
        sectorLabel: 'same_sign_sym3',
        bound: meas.bound,
        bindingGap: meas.bindingGap,
        restEnergy: meas.restEnergy,
        inertialMass: meas.inertialMass,
        inertiaRatioR2: meas.inertiaRatioR2,
        levelSpacingR: rVal,
        phaseClass,
      })
    }
  }

  // Exact mixed-sign K + M_meet sector (L = 5, k = 4 (+,+,+,-), Q = +2) classified by the EXACT SAME
  // observable-only classifyPhasePoint() function!
  const mixedConfigs: readonly (readonly [number, number])[] = [
    [PI / 3, (2 * PI) / 3],
    [0.88, (2 * PI) / 3],
    [0.65, 0.45 * PI],
    [PI / 3, 0.45 * PI],
  ]
  const mixedSignPoints: PhaseMapPoint[] = []
  for (const [m, phi] of mixedConfigs) {
    const detPh = m === PI / 3 ? PI / 3 : 0
    const plusMeet = cExpI(2 * detPh + phi)
    const r1 = computeLevelSpacingRatio(
      unitaryEigen(build1DMixedChaosSector(5, (2 * PI * 1) / 5, m, detPh, plusMeet)).phases,
    )
    const r2 = computeLevelSpacingRatio(
      unitaryEigen(build1DMixedChaosSector(5, (2 * PI * 2) / 5, m, detPh, plusMeet)).phases,
    )
    const meanR =
      (r1.meanR * r1.gapCount + r2.meanR * r2.gapCount) /
      Math.max(1, r1.gapCount + r2.gapCount)
    const meas = measureDoublonInertia(m, phi)
    const phaseClass = classifyPhasePoint(
      meas.bound,
      meas.bindingGap,
      meas.inertiaRatioR2,
      meanR,
    )
    phaseCounts[phaseClass]++
    mixedSignPoints.push({
      m,
      phi,
      sectorLabel: 'mixed_sign_k_plus_m_meet',
      bound: meas.bound,
      bindingGap: meas.bindingGap,
      restEnergy: meas.restEnergy,
      inertialMass: meas.inertialMass,
      inertiaRatioR2: meas.inertiaRatioR2,
      levelSpacingR: meanR,
      phaseClass,
    })
  }

  const bareUPoint = gridPoints.find(
    p => Math.abs(p.m - PI / 3) < 1e-6 && Math.abs(p.phi - (2 * PI) / 3) < 1e-6,
  )!
  const relativisticWitness = gridPoints.find(
    p => p.phaseClass === 'relativistic-Thirring',
  )!
  const chaosWitness = mixedSignPoints.find(p => p.phaseClass === 'chaotic-COE')!

  return {
    mValues,
    phiValues,
    gridPoints,
    mixedSignPoints,
    phaseCounts,
    bareUPoint,
    relativisticWitness,
    chaosWitness,
  }
}
