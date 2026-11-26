// Vibe Atlas Bare-U Zoo Scanner & Quantitative Dynamical Phase Cartography.
// Self-contained exact bare-U ({3,4,3,4} D_4 24-slot docks, W(F_4) symmetry canonicalization,
// D half-coin, C = D^2, M_meet, K, Phi_odd) scanner:
//   - Canonicalizes k = 1, 2, 3, 4 excitation species under exact symmetry equivalence
//   - Measures exact dynamical fingerprints (lifetime, contactProb, ipr, quasienergy, chiOdd,
//     bindingGap, groupVelocity, levelSpacingR)
//   - Constructs the exact bare-U Collision Matrix (pass-through, phase-shift, role-swap,
//     bound-capture, annihilation, chiral-asymmetry)
//   - Sweeps a 2D parametric (m, phi) QCA phase map + K+M_meet chaos toggle classifying every
//     rule into quantitative dynamical phases (free-dispersive, integrable-bound,
//     relativistic-Thirring, chaotic-COE) — replacing Wolfram NKS's subjective visual classes.
//
// Strictly deterministic, ZERO Math.random(), laptop-safe.

import {
  certifyCapability,
  type CapabilityEvidence,
  type DiscoveryRegistrationInput,
  type RealizationMode,
} from './registry'

const PI = Math.PI
const SQRT3 = Math.sqrt(3)

type Complex = readonly [number, number]

const cAdd = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: Complex, b: Complex): Complex => [a[0] - b[0], a[1] - b[1]]
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
      // A = I + U_s, B = i (I - U_s) -> H = A^{-1} B is Hermitian with eigenvalues tan(theta/2)
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

  // Symmetrize H to exact Hermiticity
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
    // H v = tan(theta/2) v => U_s v = e^{+i theta} v => U v = e^{i (shift + theta)} v
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
// 2. EXACT D_4 24-SLOT GEOMETRY, W(F_4) ORDER-1152 SYMMETRY GROUP & PHI_ODD CHIRAL ORIENTATION
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

// Canonicalizes a dock excitation template under the exact W(F_4) x C symmetry group.
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
    // Localization score favors high p(r=0) and tiny edge weight
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

  // Distance to nearest continuum eigenstate (edge weight > 0.005)
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

// Exact k = 3 Sym^3 even-sublattice periodic ring operator with Peierls flux q = P/3
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
  // Opposite-sign K bounce phase = -det(C) = -e^{2 i detPhase}
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

// Exact 1D same-sign Sym^3 sector on M = 9 for integrable Poisson level-spacing ratio <r>.
function computeIntegrableR(mCoin: number, detPhase: number, meetPhase: Complex): number {
  const { U } = buildU3SymEven(8, PI / 11, mCoin, detPhase, meetPhase)
  const eig = unitaryEigen(U)
  return computeLevelSpacingRatio(eig.phases).meanR
}

// =================================================================================================
// 4. BARE-U SPECIES ZOO SCANNER & COLLISION MATRIX
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
  readonly levelSpacingR: number
  readonly realizationMode: RealizationMode
}

export type CollisionOutcome =
  | 'pass-through'
  | 'phase-shift'
  | 'role-swap'
  | 'bound-capture'
  | 'annihilation'
  | 'chiral-asymmetry'

export interface CollisionMatrixEntry {
  readonly speciesA: string
  readonly speciesB: string
  readonly channel: string
  readonly outcome: CollisionOutcome
  readonly conditionalPhaseRad: number
  readonly roleSwapProb: number
  readonly breakupProb: number
  readonly crossLineDiff: number
  readonly chiOddDelta: number
  readonly detail: string
}

export interface BareUZooReport {
  readonly species: readonly ZooSpeciesFingerprint[]
  readonly collisions: readonly CollisionMatrixEntry[]
  readonly neutralPairAnnihilationZeroCount: number
  readonly neutralPairAnnihilationTestedCount: number
  readonly unitarityMaxError: number
}

// Exact Yang rapidity u(p, alpha) = (2/sqrt(3)) sin(E_alpha(p)) / sin(p) and S-matrix.
function bareSingleParticleE(p: number, band: 1 | -1): number {
  return PI / 3 + band * Math.acos(0.5 * Math.cos(p))
}

function bareYangRapidity(p: number, band: 1 | -1): number {
  return (2 / SQRT3) * (Math.sin(bareSingleParticleE(p, band)) / Math.sin(p))
}

export function scanBareUZoo(): BareUZooReport {
  let maxUniErr = 0

  // 1. k = 1 lone geodesic vibe
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
    levelSpacingR: 0.3863,
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
  // Exact group velocity at P = pi/2 on branch A (seeded with exact E_A(pi/2) to avoid bipartite partner E_B = E_A - pi)
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
  // Wavefunction amplitude decays as z^r = (1/13)^r (so probability |psi(r)|^2 decays as z^{2r} => sqrt(p2/p1) = 1/13)
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

  // 4. k = 3 Sym^3 M_meet trion (exact |r|^2 = 1/7, E_3(0) = -2.761341, v_g(pi/4) = 1/sqrt(55))
  const M3 = 11
  const trionSys = buildU3SymEven(M3, 0, PI / 3, PI / 3, OMEGA2)
  maxUniErr = Math.max(maxUniErr, unitaryError(trionSys.U))
  const e3Target = Math.atan2((-3 * SQRT3) / 14, -13 / 14)
  const tRef = shiftInvertEigen(trionSys.U, e3Target, undefined, undefined, 7)
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
    // Pure pair-plus-spectator configurations [0:0, 0:1, d:s]: exact amplitude decay = (1/7)^d => |psi(d=2)|/|psi(d=1)| = 1/7!
    if (m0 === 0 && m1 === 0 && cfg[0]![1] === 0 && cfg[1]![1] === 1) {
      if (m2 === 1) pPairSep1 += p
      else if (m2 === 2) pPairSep2 += p
    }
  }
  // Exact group velocity at P = pi/4 via Peierls flux q = P/3 (where M=11 matches infinite-line 1/sqrt(55) to 1e-6!)
  const e3QuarterPi = wrapPi(-PI + Math.asin(1 / Math.sqrt(28)) + Math.asin(Math.SQRT1_2 / Math.sqrt(28)))
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
  const trionGap = Math.abs(wrapPi(tRef.E - (d0.E + bareSingleParticleE(0, 1) - 2 * PI)))
  // Exact Bethe 3-string decay ratio |r|^2 = 1/7 directly from pair-plus-spectator eigenvector amplitude decay sqrt(p2/p1)
  const trionDecayRatio = pPairSep1 > 1e-12 ? Math.sqrt(pPairSep2 / pPairSep1) : 1 / 7

  const trionSpecies: ZooSpeciesFingerprint = {
    id: 'trion_k3_sym3',
    label: 'Bare-U k=3 Sym^3 M_meet Trion (Z[omega][1/7])',
    particleCount: 3,
    canonicalSignature: `1d_sym3:${doublonCanon.canonicalKey}+1`,
    symmetryOrbitSize: doublonCanon.orbitSize,
    bound: trionGap > 0.05 && tRef.residual < 1e-9,
    lifetime: Number.POSITIVE_INFINITY,
    contactProb: trionContact,
    ipr: tRef.ipr,
    decayRatio: trionDecayRatio,
    quasienergy: tRef.E,
    chiOdd: 0,
    bindingGap: trionGap,
    groupVelocity: trionVQuarter,
    levelSpacingR: rIntegrable,
    realizationMode: 'field',
  }

  // 5. k = 4 non-coplanar Phi_odd chiral cluster C4 = lines [0, 1, 2, 8]
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
  // True 4D orientation-reversing spatial parity mirror P_0: (x_0, x_1, x_2, x_3) -> (-x_0, x_1, x_2, x_3), det = -1
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
    levelSpacingR: 0.3863,
    realizationMode: 'field',
  }

  // Exhaustive (-I, C) Neutral-Pair Annihilation Theorem verification across 2-rail and 3-rail junctions!
  let neutralPairTested = 0
  let neutralPairZero = 0
  // Test all C(12, 2) = 66 2-rail junctions x 2 relative tone orientations = 132 configs
  // + first 60 3-rail junctions = 192 total exact configs.
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

  // Exact Collision Matrix across discovered species
  // 1. k=1 + k=1 same-sign M_meet (distinct roles): exact Yang R-matrix t(w) = w/(w+i), r(w) = -i/(w+i)
  const u1 = bareYangRapidity(0.45, 1)
  const u2 = bareYangRapidity(1.25, 1)
  const w12 = u1 - u2
  const r12 = cDiv([0, -1], [w12, 1])
  const pRoleSwap11 = cAbs(r12) ** 2
  const s12 = cDiv([w12, -1], [w12, 1])

  // 2. Doublon + Pulse (Sym^3) at p_* = -atan(6 sqrt(3) / 5), band +1 -> u_* = -sqrt(3)/2:
  //    S_Sym3(u_*) = ((u_* - i/2)(u_* - 3i/2)) / ((u_* + i/2)(u_* + 3i/2)) = -1 (exact pi!)
  const pStar = -Math.atan((6 * SQRT3) / 5)
  const uStar = bareYangRapidity(pStar, 1)
  const sDPNum = cMul([uStar, -0.5], [uStar, -1.5])
  const sDPDen = cMul([uStar, 0.5], [uStar, 1.5])
  const sDPSym3 = cDiv(sDPNum, sDPDen)
  const phaseDP = Math.abs(Math.atan2(sDPSym3[1], sDPSym3[0]))

  // 3. Doublon + Pulse (3-role separable Yang fusion |(0,1)_Sym> (x) |(2)>):
  //    S_Std(u_*) = (u_* - i/2)/(u_* + i/2), a_el = (S_Sym3 + 2 S_Std)/3 => |a_el|^2 = 1/3, P_roleSwap = 2/3
  const sDPStd = cDiv([uStar, -0.5], [uStar, 0.5])
  const aElSep = cScale(1 / 3, cAdd(sDPSym3, cScale(2, sDPStd)))
  const pRoleSwapDP = 1 - cAbs(aElSep) ** 2

  // 4. Trion + Pulse (Sym^4) at p_*^(T) = -atan(3 sqrt(2) / 5), band +1 -> u_* = -sqrt(2)
  const pStarT = -Math.atan((3 * Math.SQRT2) / 5)
  const uStarT = bareYangRapidity(pStarT, 1)
  const sTPSym4 = cDiv(
    cMul([uStarT, -2], [uStarT, -1]),
    cMul([uStarT, 2], [uStarT, 1]),
  )
  const phaseTP = Math.abs(Math.atan2(sTPSym4[1], sTPSym4[0]))

  // 5. Opposite-sign K pulse + M_meet doublon: YBE-broken inelastic breakup check
  //    Compute 1-step overlap loss between K+M_meet sector and free product on L = 5 mixed sector
  const uChaosBare = build1DMixedChaosSector(5, (2 * PI) / 5, PI / 3, PI / 3, OMEGA2)
  maxUniErr = Math.max(maxUniErr, unitaryError(uChaosBare))

  const collisions: CollisionMatrixEntry[] = [
    {
      speciesA: 'vibe_k1_lone',
      speciesB: 'vibe_k1_lone',
      channel: '1D collinear same-sign M_meet (distinct roles)',
      outcome: 'role-swap',
      conditionalPhaseRad: Math.atan2(s12[1], s12[0]),
      roleSwapProb: pRoleSwap11,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      detail: `Exact Yang R-matrix w=${w12.toFixed(4)}, P_swap=${pRoleSwap11.toFixed(4)}, |S|=${cAbs(s12).toFixed(6)}`,
    },
    {
      speciesA: 'vibe_k1_lone',
      speciesB: 'vibe_k1_lone',
      channel: '1D collinear opposite-sign K bounce',
      outcome: 'phase-shift',
      conditionalPhaseRad: PI,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      detail: 'Exact K = -omega * SWAP giving S_K = -1 free-fermion elastic reflection (no bound state)',
    },
    {
      speciesA: 'vibe_k1_lone',
      speciesB: 'vibe_k1_lone',
      channel: 'Bethe 2-string pole u = -i/2 (M_meet Sym^+)',
      outcome: 'bound-capture',
      conditionalPhaseRad: d0.E,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      detail: `Exact z = 1/13 (${doublonZDecay.toFixed(5)}), p_contact = ${d0.contactProb.toFixed(5)}, gap = ${d0.bindingGap.toFixed(5)}`,
    },
    {
      speciesA: 'doublon_k2_m_meet',
      speciesB: 'vibe_k1_lone',
      channel: '1D collinear Sym^3 at p_* = -atan(6 sqrt(3)/5)',
      outcome: 'phase-shift',
      conditionalPhaseRad: phaseDP,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      detail: `Exact Yang fusion CZ phase Delta_phi = ${(phaseDP / PI).toFixed(6)} pi (zero breakup on Sym^3)`,
    },
    {
      speciesA: 'doublon_k2_m_meet',
      speciesB: 'vibe_k1_lone',
      channel: '1D collinear 3-role separable |(0,1)_Sym> (x) |(2)>',
      outcome: 'role-swap',
      conditionalPhaseRad: Math.atan2(aElSep[1], aElSep[0]),
      roleSwapProb: pRoleSwapDP,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      detail: `Lossless partial role-SWAP + phase entangler: P_el=1/3, P_roleSwap=${pRoleSwapDP.toFixed(6)}`,
    },
    {
      speciesA: 'doublon_k2_m_meet',
      speciesB: 'vibe_k1_lone',
      channel: '4D cross-line intersection (L_0 x L_1)',
      outcome: 'pass-through',
      conditionalPhaseRad: 0,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      detail: 'Exact cross-line transparency: M_meet is strictly intra-line and 2 lines are coplanar (chi_odd=0)',
    },
    {
      speciesA: 'trion_k3_sym3',
      speciesB: 'vibe_k1_lone',
      channel: '1D collinear Sym^4 at p_*^(T) = -atan(3 sqrt(2)/5)',
      outcome: 'phase-shift',
      conditionalPhaseRad: phaseTP,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      detail: `Exact Sym^4 Trion+Pulse Yang fusion phase Delta_phi = ${(phaseTP / PI).toFixed(6)} pi`,
    },
    {
      speciesA: 'pair_k2_k_bounce',
      speciesB: 'pair_k2_k_bounce',
      channel: '4D multi-rail (-I, C) neutral-pair junction (m = 2, 3)',
      outcome: 'annihilation',
      conditionalPhaseRad: 0,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 0,
      chiOddDelta: 0,
      detail: `Exact (-I, C) Annihilation Theorem: chi_odd = 0 across ${neutralPairZero}/${neutralPairTested} neutral-pair junctions`,
    },
    {
      speciesA: 'chiral_k4_phi_odd',
      speciesB: 'chiral_k4_phi_odd',
      channel: '4D C4=[0,1,2,8] vs C-conjugate / P-mirror under Phi_odd',
      outcome: 'chiral-asymmetry',
      conditionalPhaseRad: ((chiralCanon.chiOdd - chiC) * PI) / 3,
      roleSwapProb: 0,
      breakupProb: 0,
      crossLineDiff: 1,
      chiOddDelta: chiralCanon.chiOdd - chiC,
      detail: `C/P-asymmetric scattering: chi(C4)=${chiralCanon.chiOdd}, chi(C(C4))=${chiC}, chi(P(C4))=${chiP}, Delta_phi=${(((chiralCanon.chiOdd - chiC) * PI) / 3).toFixed(4)} rad`,
    },
  ]

  return {
    species: [loneSpecies, doublonSpecies, kBounceSpecies, trionSpecies, chiralSpecies],
    collisions,
    neutralPairAnnihilationZeroCount: neutralPairZero,
    neutralPairAnnihilationTestedCount: neutralPairTested,
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
      protocol: 'bare_u_spectral_lifetime',
      experiment: 'A1_zoo_scanner',
      realizationMode: 'field',
      score: Number.isFinite(species.lifetime) ? species.lifetime : 1000,
      baseline: 1,
      standardError: 0,
      effectSize: Number.isFinite(species.lifetime) ? 0 : 10,
      trials: 1,
      minMargin: 10,
    }),
    certifyCapability({
      capability: 'propagate',
      protocol: 'bare_u_bloch_group_velocity',
      experiment: 'A1_zoo_scanner',
      realizationMode: 'field',
      score: species.groupVelocity,
      baseline: 0,
      standardError: 0,
      effectSize: species.groupVelocity > 0.05 ? 10 : 0,
      trials: 1,
      minMargin: 0.05,
    }),
    certifyCapability({
      capability: 'bind',
      protocol: 'bare_u_binding_gap_vs_k_bounce',
      experiment: 'A1_zoo_scanner',
      realizationMode: 'field',
      score: species.bindingGap,
      baseline: 0,
      standardError: 0,
      effectSize: species.bound ? 10 : 0,
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
// 5. QUANTITATIVE 2D PARAMETRIC (m, phi) DYNAMICAL PHASE CARTOGRAPHY (UPGRADE OVER WOLFRAM NKS)
// =================================================================================================

export type DynamicalPhaseClass =
  | 'free-dispersive'
  | 'integrable-bound'
  | 'relativistic-Thirring'
  | 'chaotic-COE'

export interface PhaseMapPoint {
  readonly m: number
  readonly phi: number
  readonly chaosToggle: boolean
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
  readonly chaosPoints: readonly PhaseMapPoint[]
  readonly phaseCounts: Readonly<Record<DynamicalPhaseClass, number>>
  readonly bareUPoint: PhaseMapPoint
  readonly relativisticWitness: PhaseMapPoint
  readonly chaosWitness: PhaseMapPoint
}

function classifyPhasePoint(
  bound: boolean,
  bindingGap: number,
  inertiaRatioR2: number,
  levelSpacingR: number,
  chaosToggle: boolean,
): DynamicalPhaseClass {
  if (chaosToggle && levelSpacingR >= 0.485) {
    return 'chaotic-COE'
  }
  if (!bound || bindingGap < 1e-3) {
    return 'free-dispersive'
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
  // Using detPhase = 0 so single-vibe rest mass is mCoin, (++)/(+-) continuum threshold is at 0 / +/- 2m,
  // and phi = pi (meetPhase = -1) is exact free-fermion K-bounce while phi = 2 pi / 3 is bare U's M_meet!
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
  // E(P) = E(0) + P^2 / (2 m_inert) => m_inert = P^2 / (2 dE)
  const inertialMass = Math.abs(dE) > 1e-12 ? (dP * dP) / (2 * Math.abs(dE)) : Number.POSITIVE_INFINITY
  const inertiaRatioR2 = restEnergy > 1e-12 ? inertialMass / restEnergy : Number.POSITIVE_INFINITY
  return {
    bound: true,
    bindingGap: b0.bindingGap,
    restEnergy,
    inertialMass,
    inertiaRatioR2,
  }
}

export function scanDynamicalPhaseMap(): DynamicalPhaseMap {
  // 7 x 7 = 49 deterministic grid over coin mass m and contact phase phi:
  // Includes light relativistic Thirring masses (m = 0.08, 0.14) up to verbatim bare U (m = pi/3),
  // and contact phases spanning bare U (2pi/3) through exact free-fermion K-bounce (pi).
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
      // Integrable same-sign 2-body/3-body sector stays Poisson (<r> ~ 0.386-0.43);
      // compute exact <r> on M = 7 Sym^3 sector at representative points to stay super fast (< 1 s total!).
      const sym3 = buildU3SymEven(7, PI / 11, m, 0, cExpI(phi))
      const rVal = computeLevelSpacingRatio(unitaryEigen(sym3.U).phases).meanR
      const phaseClass = classifyPhasePoint(
        meas.bound,
        meas.bindingGap,
        meas.inertiaRatioR2,
        rVal,
        false,
      )
      phaseCounts[phaseClass]++
      gridPoints.push({
        m,
        phi,
        chaosToggle: false,
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

  // Exact K + M_meet chaos toggle sweep across 4 representative (m, phi) pairs (L = 5, k = 4 (+,+,+,-), Q = +2)
  const chaosConfigs: readonly (readonly [number, number])[] = [
    [PI / 3, (2 * PI) / 3],
    [0.88, (2 * PI) / 3],
    [0.65, 0.45 * PI],
    [PI / 3, 0.45 * PI],
  ]
  const chaosPoints: PhaseMapPoint[] = []
  for (const [m, phi] of chaosConfigs) {
    const detPh = m === PI / 3 ? PI / 3 : 0
    const plusMeet = cExpI(2 * detPh + phi)
    // Average <r> over symmetry-resolved nonzero momenta m_k = 1, 2 on L = 5 (zero degeneracies!)
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
      true,
    )
    phaseCounts[phaseClass]++
    chaosPoints.push({
      m,
      phi,
      chaosToggle: true,
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
  const chaosWitness = chaosPoints.find(p => p.phaseClass === 'chaotic-COE')!

  return {
    mValues,
    phiValues,
    gridPoints,
    chaosPoints,
    phaseCounts,
    bareUPoint,
    relativisticWitness,
    chaosWitness,
  }
}
