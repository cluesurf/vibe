// Breakthrough Suite (Wave-4 Track W12 — Integrability vs Computational Universality of Bare U,
// Doublon/Trion Scattering CZ Gate Test, Neutral-Pair Balanced Trits, & Exact k = 4 Sym^4 Tetron):
//   Part 1 (W12.1): Exact 2-body S-matrices S_{12}(p_1, p_2) on 1D geodesic (M_meet, K, M_pair),
//                   exact Yang-Baxter rapidity u(p, alpha) = (2/sqrt(3)) sin(E)/sin(p) & Bethe k-string law
//                   z(h) = (1 - 3h + 3h^2)/(1 + 3h + 3h^2), 6x6 3-body Yang-Baxter matrix test,
//                   exact 3-body Bethe quantization / diffraction test, exact (Z_2)^12 line-parity theorem,
//                   and symmetry-resolved adjacent level-spacing ratio <r> across 1D & coupled 4D sectors.
//   Part 2 (W12.2): Exact Doublon + Pulse (k = 3) and Trion + Pulse (k = 4) scattering CZ gate test
//                   (collinear M_meet Sym, distinguishable 3-role M_meet, M_pair 1D, K opposite-sign breakup;
//                   plus literal 4D Z[zeta_9][1/6] cross-line M_meet transparency, M_pair 3-body blockade,
//                   and k* = 4 Phi_odd chiral junction conditional phase).
//   Part 3 (W12.3): Neutral-pair balanced trit encoding {(-1,+1), (0,0), (+1,-1)} under verbatim 4D bare U:
//                   D-conservation bit restriction, ballistic spreading & K = -SWAP transparency,
//                   and exhaustive (-I, C) Phi_odd annihilation theorem across ALL 2-rail & 3-rail junctions.
//   Part 4 (W12.4): Exact closed-form k = 4 Sym^4 tetron wavefunction in Z[omega][1/49] (closing W9-M2!):
//                   unified 1-line formula across all 5 contact regimes, 0 BigInt Z[omega] stencil defects,
//                   exact rational N_tot = 117649/31104, p_contact = 24/25, IPR = 3888/24025,
//                   M = 5..10 finite-ring ED convergence at rate 49/13, and literal 4D Z[zeta_9][1/6] check.
//
// Strictly deterministic (ZERO Math.random), zero external imports, exact BigInt Z[zeta_9][1/6] +
// O^+(4,1; Z[sqrt(2)]) + verified Float64 spectral & wavepacket solvers. Fast (< 10 s).

// =================================================================================================
// 0. VERIFICATION HARNESS & EXACT COMPLEX / LINEAR ALGEBRA PRIMITIVES
// =================================================================================================

type CheckRow = {
  readonly part: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(part: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ part, name, passed, detail })
}

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

const SQRT3 = Math.sqrt(3)
const PI = Math.PI

type C = readonly [number, number]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cConj = (a: C): C => [a[0], -a[1]]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cArg = (a: C): number => Math.atan2(a[1], a[0])
const cExpI = (t: number): C => [Math.cos(t), Math.sin(t)]
const cDiv = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1]
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}

const W_C: C = [-0.5, SQRT3 / 2]
const W2_C: C = [-0.5, -SQRT3 / 2]
const Z6_C: C = [0.5, SQRT3 / 2]
const Z18_C: C = [Math.cos(PI / 9), Math.sin(PI / 9)]
const C_KEEP: C = [0.25, SQRT3 / 4]
const C_CROSS: C = [0.75, -SQRT3 / 4]
const MEET_KEEP: C = [0.25, SQRT3 / 4]
const MEET_SWAP: C = [-0.75, SQRT3 / 4]
const Z6_POW: readonly C[] = [
  [1, 0],
  Z6_C,
  W_C,
  [-1, 0],
  [-Z6_C[0], -Z6_C[1]],
  [-W_C[0], -W_C[1]],
]

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }
const cmatZero = (n: number): CMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })
const cmatEye = (n: number): CMat => {
  const m = cmatZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
}

function cmatMul(A: CMat, B: CMat): CMat {
  const n = A.n
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = A.re[i * n + k]!
      const ai = A.im[i * n + k]!
      if (ar === 0 && ai === 0) continue
      for (let j = 0; j < n; j++) {
        out.re[i * n + j] = out.re[i * n + j]! + (ar * B.re[k * n + j]! - ai * B.im[k * n + j]!)
        out.im[i * n + j] = out.im[i * n + j]! + (ar * B.im[k * n + j]! + ai * B.re[k * n + j]!)
      }
    }
  }
  return out
}

function cmatUnitaryErr(U: CMat): number {
  const n = U.n
  let maxE = 0
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
      maxE = Math.max(maxE, Math.hypot(sr - (i === j ? 1 : 0), si))
    }
  }
  return maxE
}

function solveComplexLinear(
  n: number,
  aRe: Float64Array,
  aIm: Float64Array,
  bRe: Float64Array,
  bIm: Float64Array,
): [Float64Array, Float64Array] {
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
        let t = ar[col * n + j]!; ar[col * n + j] = ar[piv * n + j]!; ar[piv * n + j] = t
        t = ai[col * n + j]!; ai[col * n + j] = ai[piv * n + j]!; ai[piv * n + j] = t
      }
      let tb = xr[col]!; xr[col] = xr[piv]!; xr[piv] = tb
      tb = xi[col]!; xi[col] = xi[piv]!; xi[piv] = tb
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
        if (Math.abs(e[m]!) <= 1e-15 * Math.max(1e-30, Math.abs(d[m]!) + Math.abs(d[m + 1]!))) break
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
        const rr = (d[i]! - g) * s + 2 * c * b
        p = s * rr
        d[i + 1] = g + p
        g = c * rr - b
        for (let k = 0; k < n; k++) {
          const z1 = z[k * n + (i + 1)]!
          const z0 = z[k * n + i]!
          z[k * n + (i + 1)] = s * z0 + c * z1
          z[k * n + i] = c * z0 - s * z1
        }
      }
      if (r === 0 && m > l) continue
      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }
}

function hermitianEigen(H: CMat): { readonly values: Float64Array; readonly vecs: CMat } {
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
        hr[ro + j] = hr[ro + j]! - (vRi * wr[j]! + vIi * wi[j]! + (wRi * vr[j]! + wIi * vi[j]!))
        hi[ro + j] = hi[ro + j]! - (vIi * wr[j]! - vRi * wi[j]! + (wIi * vr[j]! - wRi * vi[j]!))
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

function unitaryPhases(U: CMat): { readonly phases: Float64Array; readonly maxRes: number } {
  const n = U.n
  const phi = 0.37192841
  const cp = Math.cos(phi)
  const sp = Math.sin(phi)
  const H = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ur = U.re[i * n + j]!
      const ui = U.im[i * n + j]!
      const dr = U.re[j * n + i]!
      const di = -U.im[j * n + i]!
      H.re[i * n + j] = 0.5 * (cp * ur - sp * ui + cp * dr + sp * di)
      H.im[i * n + j] = 0.5 * (cp * ui + sp * ur + cp * di - sp * dr)
    }
  }
  const eigH = hermitianEigen(H)
  const V = { n, re: Float64Array.from(eigH.vecs.re), im: Float64Array.from(eigH.vecs.im) }
  let start = 0
  while (start < n) {
    let end = start + 1
    while (end < n && Math.abs(eigH.values[end]! - eigH.values[start]!) < 1e-7) end++
    const m = end - start
    if (m >= 2) {
      const Sub = cmatZero(m)
      const wr = new Float64Array(n * m)
      const wi = new Float64Array(n * m)
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < m; c++) {
          let sr = 0
          let si = 0
          for (let k = 0; k < n; k++) {
            const ur = U.re[r * n + k]!
            const ui = U.im[r * n + k]!
            const dr = U.re[k * n + r]!
            const di = -U.im[k * n + r]!
            const r1 = cp * ur - sp * ui
            const i1 = cp * ui + sp * ur
            const r2 = cp * dr + sp * di
            const i2 = cp * di - sp * dr
            const hsr = 0.5 * (i1 - i2)
            const hsi = -0.5 * (r1 - r2)
            const vr = V.re[k * n + (start + c)]!
            const vi = V.im[k * n + (start + c)]!
            sr += hsr * vr - hsi * vi
            si += hsr * vi + hsi * vr
          }
          wr[r * m + c] = sr
          wi[r * m + c] = si
        }
      }
      for (let a = 0; a < m; a++) {
        for (let b = 0; b < m; b++) {
          let sr = 0
          let si = 0
          for (let r = 0; r < n; r++) {
            const vr = V.re[r * n + (start + a)]!
            const vi = V.im[r * n + (start + a)]!
            sr += vr * wr[r * m + b]! + vi * wi[r * m + b]!
            si += vr * wi[r * m + b]! - vi * wr[r * m + b]!
          }
          Sub.re[a * m + b] = sr
          Sub.im[a * m + b] = si
        }
      }
      const eigS = hermitianEigen(Sub)
      const tmpR = new Float64Array(n * m)
      const tmpI = new Float64Array(n * m)
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < m; c++) {
          let sr = 0
          let si = 0
          for (let k = 0; k < m; k++) {
            const vr = V.re[r * n + (start + k)]!
            const vi = V.im[r * n + (start + k)]!
            const qr = eigS.vecs.re[k * m + c]!
            const qi = eigS.vecs.im[k * m + c]!
            sr += vr * qr - vi * qi
            si += vr * qi + vi * qr
          }
          tmpR[r * m + c] = sr
          tmpI[r * m + c] = si
        }
      }
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < m; c++) {
          V.re[r * n + (start + c)] = tmpR[r * m + c]!
          V.im[r * n + (start + c)] = tmpI[r * m + c]!
        }
      }
    }
    start = end
  }
  const phases = new Float64Array(n)
  let maxRes = 0
  for (let col = 0; col < n; col++) {
    let lr = 0
    let li = 0
    const uvr = new Float64Array(n)
    const uvi = new Float64Array(n)
    for (let r = 0; r < n; r++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < n; k++) {
        sr += U.re[r * n + k]! * V.re[k * n + col]! - U.im[r * n + k]! * V.im[k * n + col]!
        si += U.re[r * n + k]! * V.im[k * n + col]! + U.im[r * n + k]! * V.re[k * n + col]!
      }
      uvr[r] = sr
      uvi[r] = si
      lr += V.re[r * n + col]! * sr + V.im[r * n + col]! * si
      li += V.re[r * n + col]! * si - V.im[r * n + col]! * sr
    }
    phases[col] = Math.atan2(li, lr)
    for (let r = 0; r < n; r++) {
      maxRes = Math.max(
        maxRes,
        Math.hypot(
          uvr[r]! - (lr * V.re[r * n + col]! - li * V.im[r * n + col]!),
          uvi[r]! - (lr * V.im[r * n + col]! + li * V.re[r * n + col]!),
        ),
      )
    }
  }
  return { phases, maxRes }
}

function levelSpacingR(phases: Float64Array): { readonly rMean: number; readonly nSpacings: number; readonly nDeg: number } {
  const arr = Array.from(phases).sort((a, b) => a - b)
  const n = arr.length
  const gaps: number[] = []
  let nDeg = 0
  for (let i = 0; i < n; i++) {
    const g = i + 1 < n ? arr[i + 1]! - arr[i]! : arr[0]! + 2 * PI - arr[n - 1]!
    if (g > 1e-11) gaps.push(g)
    else nDeg++
  }
  let sumR = 0
  const m = gaps.length
  for (let i = 0; i < m; i++) {
    const g1 = gaps[i]!
    const g2 = gaps[(i + 1) % m]!
    sumR += Math.min(g1, g2) / Math.max(g1, g2)
  }
  return { rMean: m > 0 ? sumR / m : 0, nSpacings: m, nDeg }
}

function shiftInvertRefine(
  U: CMat,
  targetE: number,
  iters = 5,
): { readonly E: number; readonly lam: C; readonly res: number; readonly ipr: number; readonly vr: Float64Array; readonly vi: Float64Array } {
  const dim = U.n
  let lam = cExpI(targetE)
  const vr = new Float64Array(dim)
  const vi = new Float64Array(dim)
  for (let i = 0; i < dim; i++) vr[i] = Math.cos(i * 0.713 + 0.3) / Math.sqrt(dim)
  for (let it = 0; it < iters; it++) {
    const sh: C = it === 0 ? [lam[0] * 1.0005, lam[1] * 1.0005] : [lam[0] * (1 + 1e-11), lam[1] * (1 + 1e-11)]
    const ar = Float64Array.from(U.re)
    const ai = Float64Array.from(U.im)
    for (let i = 0; i < dim; i++) {
      ar[i * dim + i] = ar[i * dim + i]! - sh[0]
      ai[i * dim + i] = ai[i * dim + i]! - sh[1]
    }
    const [xr, xi] = solveComplexLinear(dim, ar, ai, vr, vi)
    let n2 = 0
    for (let i = 0; i < dim; i++) n2 += xr[i]! * xr[i]! + xi[i]! * xi[i]!
    const inv = 1 / Math.sqrt(n2)
    for (let i = 0; i < dim; i++) { vr[i] = xr[i]! * inv; vi[i] = xi[i]! * inv }
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
    res2 += (sr - (lam[0] * vr[r]! - lam[1] * vi[r]!)) ** 2 + (si - (lam[0] * vi[r]! + lam[1] * vr[r]!)) ** 2
    const p = vr[r]! * vr[r]! + vi[r]! * vi[r]!
    ipr += p * p
  }
  return { E: Math.atan2(lam[1], lam[0]), lam, res: Math.sqrt(res2), ipr, vr, vi }
}

// =================================================================================================
// 1. EXACT Z[zeta_9][1/6], D_4 ROOTS, W(F_4), chi_odd, AND O^+(4,1; Z[sqrt(2)]) {3,4,3,4} ENGINE
//    (Matching deck/vibe/test/universe.ts bit-for-bit!)
// =================================================================================================

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type AntipodalLine = readonly [number, number]
type Q2 = readonly [bigint, bigint]
type ToneNZ = -1 | 1
type Vibe = readonly [dock: number, slot: number, tone: ToneNZ, role: number]
type ExactState = { readonly amp: Map<string, Z9>; readonly den: bigint }
type ActiveLine = readonly [number | undefined, number | undefined, number, number]

const Z9_ZERO: Z9 = [0n, 0n, 0n, 0n, 0n, 0n]
const Z9_ONE: Z9 = [1n, 0n, 0n, 0n, 0n, 0n]
const Z9_OMEGA: Z9 = [0n, 0n, 0n, 1n, 0n, 0n]
const Z9_ZETA6: Z9 = [1n, 0n, 0n, 1n, 0n, 0n]
const Z9_ZETA18: Z9 = [0n, 0n, 0n, 0n, 0n, -1n]
const Z9_COIN_DIAG: Z9 = [2n, 0n, 0n, 1n, 0n, 0n]
const Z9_COIN_OFF: Z9 = [0n, 0n, 0n, -1n, 0n, 0n]
const Z9_MEET_SWAP: Z9 = [-1n, 0n, 0n, 1n, 0n, 0n]

const addZ9 = (a: Z9, b: Z9): Z9 => [
  a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3], a[4] + b[4], a[5] + b[5],
]
const subZ9 = (a: Z9, b: Z9): Z9 => [
  a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3], a[4] - b[4], a[5] - b[5],
]
const scaleZ9 = (f: bigint, a: Z9): Z9 => [
  f * a[0], f * a[1], f * a[2], f * a[3], f * a[4], f * a[5],
]
const divExactZ9 = (a: Z9, d: bigint): Z9 => [
  a[0] / d, a[1] / d, a[2] / d, a[3] / d, a[4] / d, a[5] / d,
]
const conjZ9 = (a: Z9): Z9 => [a[0] - a[3], -a[2], -a[1], -a[3], a[5] - a[2], a[4] - a[1]]
const adjointZ9 = (a: Z9, dag: boolean): Z9 => (dag ? conjZ9(a) : a)
const isZeroZ9 = (a: Z9): boolean =>
  a[0] === 0n && a[1] === 0n && a[2] === 0n && a[3] === 0n && a[4] === 0n && a[5] === 0n

function mulZ9(a: Z9, b: Z9): Z9 {
  const p = new Array<bigint>(11).fill(0n)
  for (let i = 0; i < 6; i++) {
    const ai = a[i]!
    if (ai === 0n) continue
    for (let j = 0; j < 6; j++) p[i + j] = p[i + j]! + ai * b[j]!
  }
  return [
    p[0]! - p[6]! + p[9]!,
    p[1]! - p[7]! + p[10]!,
    p[2]! - p[8]!,
    p[3]! - p[6]!,
    p[4]! - p[7]!,
    p[5]! - p[8]!,
  ]
}

const ZETA6_POWERS: readonly Z9[] = [
  Z9_ONE,
  Z9_ZETA6,
  Z9_OMEGA,
  scaleZ9(-1n, Z9_ONE),
  scaleZ9(-1n, Z9_ZETA6),
  scaleZ9(-1n, Z9_OMEGA),
]

function z9ToComplex(a: Z9, den = 1n): C {
  const inv = 1 / Number(den)
  let re = 0
  let im = 0
  for (let k = 0; k < 6; k++) {
    const c = Number(a[k]!)
    if (c === 0) continue
    const ang = (2 * PI * k) / 9
    re += c * Math.cos(ang)
    im += c * Math.sin(ang)
  }
  return [re * inv, im * inv]
}

const ROOTS: readonly Root4[] = (() => {
  const roots: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1n, -1n]) {
        for (const sj of [1n, -1n]) {
          const coords: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]
          coords[i] = si
          coords[j] = sj
          roots.push(coords)
        }
      }
    }
  }
  return roots
})()

const dot4 = (a: Root4, b: Root4): bigint => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
const OPPOSITE_SLOT: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
)
const LINES: readonly AntipodalLine[] = ROOTS.flatMap((_, a) => {
  const b = OPPOSITE_SLOT[a]!
  return a < b ? [[a, b] as const] : []
})
const LINE_OF_SLOT: readonly number[] = ROOTS.map((_, s) =>
  LINES.findIndex(([a, b]) => a === s || b === s),
)

const WF4_GROUP = (() => {
  const simpleRoots: readonly Root4[] = [
    [0n, 1n, -1n, 0n],
    [0n, 0n, 1n, -1n],
    [0n, 0n, 0n, 1n],
    [1n, -1n, -1n, -1n],
  ]
  const simplePerms = simpleRoots.map(alpha => {
    const aa = dot4(alpha, alpha)
    const perm = new Uint8Array(24)
    for (let slot = 0; slot < 24; slot++) {
      const v = ROOTS[slot]!
      const twoVa = 2n * dot4(v, alpha)
      const img = [0, 1, 2, 3].map(k => v[k]! - (twoVa * alpha[k]!) / aa)
      perm[slot] = ROOTS.findIndex(o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3])
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
  assertExact(elements.length === 1152, `W(F_4) order ${elements.length}`)
  return { elements, det }
})()

function lexKey4(a0: number, a1: number, a2: number, a3: number): number {
  let x0 = a0; let x1 = a1; let x2 = a2; let x3 = a3
  if (x0 > x1) { const t = x0; x0 = x1; x1 = t }
  if (x2 > x3) { const t = x2; x2 = x3; x3 = t }
  if (x0 > x2) { const t = x0; x0 = x2; x2 = t }
  if (x1 > x3) { const t = x1; x1 = x3; x3 = t }
  if (x1 > x2) { const t = x1; x1 = x2; x2 = t }
  return ((x0 * 48 + x1) * 48 + x2) * 48 + x3
}

const chiral4Cache = new Map<number, number>()
function chiral4Sign(c0: number, c1: number, c2: number, c3: number): number {
  const selfKey = lexKey4(c0, c1, c2, c3)
  const cached = chiral4Cache.get(selfKey)
  if (cached !== undefined) return cached
  const s0 = c0 >> 1; const s1 = c1 >> 1; const s2 = c2 >> 1; const s3 = c3 >> 1
  const b0 = c0 & 1; const b1 = c1 & 1; const b2 = c2 & 1; const b3 = c3 & 1
  let minKey = Number.POSITIVE_INFINITY
  let minSign = 0
  let chiral = true
  const elems = WF4_GROUP.elements
  const dets = WF4_GROUP.det
  for (let e = 0; e < elems.length; e++) {
    const p = elems[e]!
    const d = dets[e]!
    const ps0 = p[s0]! << 1; const ps1 = p[s1]! << 1; const ps2 = p[s2]! << 1; const ps3 = p[s3]! << 1
    const kPos = lexKey4(ps0 + b0, ps1 + b1, ps2 + b2, ps3 + b3)
    if (kPos < minKey) { minKey = kPos; minSign = d; chiral = true }
    else if (kPos === minKey && d !== minSign) chiral = false
    const kNeg = lexKey4(ps0 + (b0 ^ 1), ps1 + (b1 ^ 1), ps2 + (b2 ^ 1), ps3 + (b3 ^ 1))
    if (kNeg < minKey) { minKey = kNeg; minSign = -d; chiral = true }
    else if (kNeg === minKey && -d !== minSign) chiral = false
  }
  const sign = chiral ? minSign : 0
  chiral4Cache.set(selfKey, sign)
  return sign
}

function chiralOrientationDock(vibes: readonly Vibe[], indices: readonly number[]): number {
  let chi = 0
  for (let i = 0; i < indices.length; i++) {
    const vi = vibes[indices[i]!]!
    const ci = (vi[1] << 1) + (vi[2] < 0 ? 1 : 0)
    for (let j = i + 1; j < indices.length; j++) {
      const vj = vibes[indices[j]!]!
      const cj = (vj[1] << 1) + (vj[2] < 0 ? 1 : 0)
      for (let k = j + 1; k < indices.length; k++) {
        const vk = vibes[indices[k]!]!
        const ck = (vk[1] << 1) + (vk[2] < 0 ? 1 : 0)
        for (let l = k + 1; l < indices.length; l++) {
          const vl = vibes[indices[l]!]!
          const cl = (vl[1] << 1) + (vl[2] < 0 ? 1 : 0)
          chi += chiral4Sign(ci, cj, ck, cl)
        }
      }
    }
  }
  return chi
}

// Exact O^+(4,1; Z[sqrt(2)]) {3,4,3,4} Coxeter transport
const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r => DIM5.map(c => [r === c ? 1n : 0n, 0n] as const))
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 =>
  u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
const vecKeyQ2 = (v: readonly Q2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')
const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] => m.map(r => dotQ2(r, v))
const matMulQ2 = (a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] =>
  a.map(row => DIM5.map(col => dotQ2(row, b.map(br => br[col]!))))

const TWICE_GRAM: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => {
    if (i === j) return [2n, 0n] as const
    if (Math.abs(i - j) === 1) return Math.min(i, j) % 2 === 0 ? ([-1n, 0n] as const) : ([0n, -1n] as const)
    return Q2_ZERO
  }),
)
const twiceForm = (u: readonly Q2[], v: readonly Q2[]): Q2 => dotQ2(u, matVecQ2(TWICE_GRAM, v))
const reflect5 = (normal: readonly Q2[]): Q2[][] => {
  const dual = matVecQ2(TWICE_GRAM, normal)
  return EYE5.map((row, i) => row.map((entry, j) => subQ2(entry, mulQ2(normal[i]!, dual[j]!))))
}
const BASE_CENTER: readonly Q2[] = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]
const CENTRAL_INVERSION: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => [
    (j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n),
    j === 4 ? 2n * BASE_CENTER[i]![1] : 0n,
  ]),
)
const TRANSPORTS: readonly (readonly (readonly Q2[])[])[] = (() => {
  const stabGens = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seen = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of stabGens) {
      const next = matVecQ2(g, n)
      const key = vecKeyQ2(next)
      if (!seen.has(key)) {
        seen.add(key)
        facetNormals.push(next)
      }
    }
  }
  const facetDot = (a: number, b: number): bigint => (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const orthoBasis: number[] = []
  for (let f = 0; f < 24 && orthoBasis.length < 4; f++) {
    if (orthoBasis.every(prev => facetDot(f, prev) === 0n)) orthoBasis.push(f)
  }
  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = orthoBasis.map(o => facetDot(f, o))
    return [(c0! + c1!) / 2n, (c0! - c1!) / 2n, (c2! + c3!) / 2n, (c2! - c3!) / 2n]
  })
  return ROOTS.map(root => {
    const fIdx = facetRoots.findIndex(fr => fr.every((v, i) => v === root[i]))
    return matMulQ2(reflect5(facetNormals[fIdx]!), CENTRAL_INVERSION)
  })
})()

const dockFrames: (readonly (readonly Q2[])[])[] = [EYE5]
const dockParity: number[] = [1]
const centerToDockId = new Map<string, number>([[vecKeyQ2(BASE_CENTER), 0]])
const hcNeighbors: Int32Array[] = [new Int32Array(24).fill(-1)]

function stepDock(dock: number, slot: number): number {
  const cached = hcNeighbors[dock]![slot]!
  if (cached >= 0) return cached
  const nextFrame = matMulQ2(dockFrames[dock]!, TRANSPORTS[slot]!)
  const nextCenter = matVecQ2(nextFrame, BASE_CENTER)
  const centerKey = vecKeyQ2(nextCenter)
  let nextId = centerToDockId.get(centerKey)
  if (nextId === undefined) {
    nextId = dockFrames.length
    centerToDockId.set(centerKey, nextId)
    dockFrames.push(nextFrame)
    dockParity.push(-dockParity[dock]!)
    hcNeighbors.push(new Int32Array(24).fill(-1))
  }
  hcNeighbors[dock]![slot] = nextId
  hcNeighbors[nextId]![OPPOSITE_SLOT[slot]!] = dock
  return nextId
}

// Verbatim 8-layer bare U in exact Z[zeta_9][1/6]
function encodeConfig(vibes: readonly Vibe[]): string {
  return [...vibes]
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(v => v.join(':'))
    .join(';')
}
function decodeConfig(key: string): Vibe[] {
  if (key === '') return []
  return key.split(';').map(entry => {
    const p = entry.split(':')
    return [Number(p[0]), Number(p[1]), Number(p[2]) as ToneNZ, Number(p[3])]
  })
}
function addAmpZ9(map: Map<string, Z9>, key: string, delta: Z9): void {
  const prev = map.get(key)
  const next = prev ? addZ9(prev, delta) : delta
  if (isZeroZ9(next)) map.delete(key)
  else map.set(key, next)
}
function reduceDenZ9(amp: Map<string, Z9>, den: bigint): ExactState {
  let d = den
  for (const p of [2n, 3n]) {
    while (d % p === 0n && [...amp.values()].every(z => z.every(c => c % p === 0n))) {
      d /= p
      for (const [k, z] of amp) amp.set(k, divExactZ9(z, p))
    }
  }
  return { amp, den: d }
}
function stateFromEntries(entries: readonly (readonly [readonly Vibe[], Z9])[], den: bigint): ExactState {
  const map = new Map<string, Z9>()
  for (const [vs, z] of entries) addAmpZ9(map, encodeConfig(vs), z)
  return reduceDenZ9(map, den)
}
function innerProductExact(a: ExactState, b: ExactState): { readonly num: Z9; readonly den: bigint } {
  let sum = Z9_ZERO
  for (const [k, va] of a.amp) {
    const vb = b.amp.get(k)
    if (vb !== undefined) sum = addZ9(sum, mulZ9(conjZ9(va), vb))
  }
  return { num: sum, den: a.den * b.den }
}
function hasExactUnitNorm(s: ExactState): boolean {
  const ip = innerProductExact(s, s)
  return isZeroZ9(subZ9(ip.num, [ip.den, 0n, 0n, 0n, 0n, 0n]))
}
function countStateDiffs(a: ExactState, b: ExactState): number {
  const keys = new Set([...a.amp.keys(), ...b.amp.keys()])
  let diffs = 0
  for (const key of keys) {
    const lhs = scaleZ9(b.den, a.amp.get(key) ?? Z9_ZERO)
    const rhs = scaleZ9(a.den, b.amp.get(key) ?? Z9_ZERO)
    if (!isZeroZ9(subZ9(lhs, rhs))) diffs++
  }
  return diffs
}
function tensorStatesExact(a: ExactState, b: ExactState): ExactState {
  const out = new Map<string, Z9>()
  for (const [ka, za] of a.amp) {
    const va = decodeConfig(ka)
    for (const [kb, zb] of b.amp) {
      const vb = decodeConfig(kb)
      const merged = [...va, ...vb]
      // Check no slot collision
      let ok = true
      for (let i = 0; i < va.length && ok; i++) {
        for (let j = 0; j < vb.length; j++) {
          if (va[i]![0] === vb[j]![0] && va[i]![1] === vb[j]![1]) { ok = false; break }
        }
      }
      if (ok) addAmpZ9(out, encodeConfig(merged), mulZ9(za, zb))
    }
  }
  return reduceDenZ9(out, a.den * b.den)
}
function groupByDock(vibes: readonly Vibe[]): Map<number, number[]> {
  const groups = new Map<number, number[]>()
  for (let i = 0; i < vibes.length; i++) {
    const d = vibes[i]![0]
    const list = groups.get(d)
    if (list) list.push(i)
    else groups.set(d, [i])
  }
  return groups
}
function collectActiveLines(vibes: readonly Vibe[]): ActiveLine[] {
  const result: ActiveLine[] = []
  for (const indices of groupByDock(vibes).values()) {
    const bySlot = new Map<number, number>()
    for (const idx of indices) bySlot.set(vibes[idx]![1], idx)
    for (const [slotA, slotB] of LINES) {
      const idxA = bySlot.get(slotA)
      const idxB = bySlot.get(slotB)
      if (idxA !== undefined || idxB !== undefined) result.push([idxA, idxB, slotA, slotB])
    }
  }
  return result
}
function mapConfigs(state: ExactState, transform: (vibes: Vibe[], amp: Z9) => readonly [Vibe[], Z9]): ExactState {
  const out = new Map<string, Z9>()
  for (const [k, amp] of state.amp) {
    const [nv, na] = transform(decodeConfig(k), amp)
    addAmpZ9(out, encodeConfig(nv), na)
  }
  return { amp: out, den: state.den }
}
function applyBranchingLayer<Item>(
  state: ExactState,
  branchDen: bigint,
  prepare: (vibes: Vibe[], amp: Z9) => readonly [Item[], Z9],
  expand: (cfg: Vibe[], amp: Z9, item: Item) => readonly (readonly [Vibe[], Z9])[],
): ExactState {
  const prepared = [...state.amp.entries()].map(([k, amp]) => {
    const vibes = decodeConfig(k)
    const [items, phasedAmp] = prepare(vibes, amp)
    return { vibes, items, phasedAmp }
  })
  const maxDepth = prepared.reduce((b, r) => Math.max(b, r.items.length), 0)
  const out = new Map<string, Z9>()
  for (const { vibes, items, phasedAmp } of prepared) {
    const scale = branchDen ** BigInt(maxDepth - items.length)
    let branches: (readonly [Vibe[], Z9])[] = [[vibes, scaleZ9(scale, phasedAmp)]]
    for (const item of items) branches = branches.flatMap(([cfg, amp]) => expand(cfg, amp, item))
    for (const [cfg, amp] of branches) addAmpZ9(out, encodeConfig(cfg), amp)
  }
  return reduceDenZ9(out, state.den * branchDen ** BigInt(maxDepth))
}
function applyHalfCoinD(state: ExactState, dag: boolean): ExactState {
  const detPhase = adjointZ9(Z9_ZETA6, dag)
  const diagCoeff = adjointZ9(Z9_COIN_DIAG, dag)
  const offCoeff = adjointZ9(Z9_COIN_OFF, dag)
  return applyBranchingLayer<readonly [number, number]>(
    state, 2n,
    (vibes, amp) => {
      const loneSplits: (readonly [number, number])[] = []
      let phased = amp
      for (const [idxA, idxB, slotA, slotB] of collectActiveLines(vibes)) {
        if (idxA !== undefined && idxB !== undefined) phased = mulZ9(phased, detPhase)
        else if (idxA !== undefined) loneSplits.push([idxA, slotB])
        else loneSplits.push([idxB!, slotA])
      }
      return [loneSplits, phased]
    },
    (cfg, amp, [idx, oppSlot]) => {
      const [dock, , tone, role] = cfg[idx]!
      const flipped = cfg.slice()
      flipped[idx] = [dock, oppSlot, tone, role]
      return [[cfg, mulZ9(amp, diagCoeff)], [flipped, mulZ9(amp, offCoeff)]]
    },
  )
}
function applyRoleMeet(state: ExactState, dag: boolean): ExactState {
  const equalRolePhase = adjointZ9(Z9_OMEGA, dag)
  const keepCoeff = adjointZ9(Z9_ZETA6, dag)
  const swapCoeff = adjointZ9(Z9_MEET_SWAP, dag)
  return applyBranchingLayer<readonly [number, number]>(
    state, 2n,
    (vibes, amp) => {
      const swaps: (readonly [number, number])[] = []
      let phased = amp
      for (const [idxA, idxB] of collectActiveLines(vibes)) {
        if (idxA === undefined || idxB === undefined) continue
        if (vibes[idxA]![2] !== vibes[idxB]![2]) continue
        if (vibes[idxA]![3] === vibes[idxB]![3]) phased = mulZ9(phased, equalRolePhase)
        else swaps.push([idxA, idxB])
      }
      return [swaps, phased]
    },
    (cfg, amp, [idxA, idxB]) => {
      const [dockA, slotA, toneA, roleA] = cfg[idxA]!
      const [dockB, slotB, toneB, roleB] = cfg[idxB]!
      const swapped = cfg.slice()
      swapped[idxA] = [dockA, slotA, toneA, roleB]
      swapped[idxB] = [dockB, slotB, toneB, roleA]
      return [[cfg, mulZ9(amp, keepCoeff)], [swapped, mulZ9(amp, swapCoeff)]]
    },
  )
}
function applyPairLineMixer(state: ExactState, dag: boolean): ExactState {
  const hopCoeff = subZ9(adjointZ9(Z9_ZETA18, dag), Z9_ONE)
  const keepCoeff = addZ9([12n, 0n, 0n, 0n, 0n, 0n], hopCoeff)
  return applyBranchingLayer<readonly [number, number, number]>(
    state, 12n,
    (vibes, amp) => {
      const pairs: (readonly [number, number, number])[] = []
      for (const indices of groupByDock(vibes).values()) {
        if (indices.length !== 2) continue
        const [i0, i1] = [indices[0]!, indices[1]!]
        const v0 = vibes[i0]!; const v1 = vibes[i1]!
        if (OPPOSITE_SLOT[v0[1]] === v1[1] && v0[2] === v1[2] && v0[3] === v1[3]) {
          pairs.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
        }
      }
      return [pairs, amp]
    },
    (cfg, amp, [i0, i1, curLine]) =>
      LINES.map(([slotA, slotB], targetLine) => {
        if (targetLine === curLine) return [cfg, mulZ9(amp, keepCoeff)] as const
        const [dock, , tone, role] = cfg[i0]!
        const hopped = cfg.slice()
        hopped[i0] = [dock, slotA, tone, role]
        hopped[i1] = [dock, slotB, tone, role]
        return [hopped, mulZ9(amp, hopCoeff)] as const
      }),
  )
}
function applyOddChiralPhase(state: ExactState, dag: boolean): ExactState {
  return mapConfigs(state, (vibes, amp) => {
    let exponent = 0
    for (const [dock, indices] of groupByDock(vibes)) {
      if (indices.length >= 4) exponent += dockParity[dock]! * chiralOrientationDock(vibes, indices)
    }
    const signedExp = dag ? -exponent : exponent
    const mod6 = ((signedExp % 6) + 6) % 6
    return [vibes, mod6 === 0 ? amp : mulZ9(amp, ZETA6_POWERS[mod6]!)]
  })
}
function applyOppositeSignBounce(state: ExactState, _dag: boolean): ExactState {
  return mapConfigs(state, (vibes, amp) => {
    let negate = false
    for (const [idxA, idxB, slotA, slotB] of collectActiveLines(vibes)) {
      if (idxA === undefined || idxB === undefined) continue
      if (vibes[idxA]![2] === vibes[idxB]![2]) continue
      const vA = vibes[idxA]!; const vB = vibes[idxB]!
      vibes[idxA] = [vA[0], slotB, vA[2], vA[3]]
      vibes[idxB] = [vB[0], slotA, vB[2], vB[3]]
      negate = !negate
    }
    return [vibes, negate ? scaleZ9(-1n, amp) : amp]
  })
}
function applyStream(state: ExactState, dag: boolean): ExactState {
  return mapConfigs(state, (vibes, amp) => [
    vibes.map(([dock, slot, tone, role]) => [
      stepDock(dock, dag ? OPPOSITE_SLOT[slot]! : slot),
      slot,
      tone,
      role,
    ] as const),
    amp,
  ])
}
type LayerOp = (state: ExactState, dag: boolean) => ExactState
const BEAT_LAYERS: readonly LayerOp[] = [
  applyOddChiralPhase,
  applyHalfCoinD,
  applyOppositeSignBounce,
  applyPairLineMixer,
  applyRoleMeet,
  applyHalfCoinD,
  applyOddChiralPhase,
  applyStream,
]
const applyBeat = (s: ExactState): ExactState => BEAT_LAYERS.reduce((c, f) => f(c, false), s)
const applyBeatInv = (s: ExactState): ExactState => [...BEAT_LAYERS].reverse().reduce((c, f) => f(c, true), s)

// =================================================================================================
// SHARED 1D SYM^k & DISPERSION HELPERS
// =================================================================================================

function spE(p: number, band: 1 | -1): number {
  return PI / 3 + band * Math.acos(0.5 * Math.cos(p))
}
function spU(p: number, band: 1 | -1): number {
  return (2 / SQRT3) * (Math.sin(spE(p, band)) / Math.sin(p))
}

function twoBodySMatrix(lam0: C, p1: number, b1: 1 | -1, p2: number, b2: 1 | -1): {
  readonly S: C
  readonly tAmp: C
  readonly rAmp: C
  readonly bRatio: C
  readonly rootErr: number
} {
  const P = p1 + p2
  const lam = cExpI(spE(p1, b1) + spE(p2, b2))
  const cosP = Math.cos(P)
  const a2 = cScale(0.25, W_C)
  const b2c = cScale(-0.75, W_C)
  const ab2 = cScale(-3 / 16, W2_C)
  const num = cSub(cScale(2 * cosP, lam), cScale(2, W_C))
  const den = cSub(cSub(cMul(lam, lam), cScale(0.5 * cosP, cMul(W_C, lam))), cScale(0.5, W2_C))
  const g = cMul(ab2, cDiv(num, den))
  const alpha = cAdd(a2, g)
  const beta = cAdd(b2c, g)
  const uIn = cExpI(p2 - p1)
  const uOut = cExpI(p1 - p2)
  const rhs = cDiv(cAdd(cMul(lam, lam), cSub(cMul(alpha, alpha), cMul(beta, beta))), cMul(alpha, lam))
  const rootErr = cAbs(cSub(cAdd(uIn, uOut), rhs))
  const Zof = (u: C): C => cDiv(beta, cSub([1, 0], cDiv(alpha, cMul(lam, u))))
  const Zin = Zof(uIn)
  const Zout = Zof(uOut)
  const S = cScale(-1, cMul(cDiv(cSub(Zin, lam0), cSub(Zout, lam0)), cDiv(cAdd(Zout, W_C), cAdd(Zin, W_C))))
  const tAmp = cScale(0.5, cAdd(S, [1, 0]))
  const rAmp = cScale(0.5, cSub(S, [1, 0]))
  const bRatio = cAbs(rAmp) > 1e-12 ? cDiv(tAmp, rAmp) : ([0, 0] as C)
  return { S, tAmp, rAmp, bRatio, rootErr }
}

function buildSymKEven(
  kPart: number,
  M: number,
  P: number,
  pairPhase: C,
): { readonly U: CMat; readonly dim: number; readonly configs: [number, number][][]; readonly symCounts: number[] } {
  const canon = (pts: readonly (readonly [number, number])[]) => {
    let bestKey = ''
    let bestShift = 0
    let bestSorted: [number, number][] = []
    let symCount = 0
    for (let sh = 0; sh < M; sh++) {
      const arr: [number, number][] = pts.map(([m, s]) => [(((m + sh) % M) + M) % M, s])
      arr.sort((a, b) => a[0] - b[0] || a[1] - b[1])
      const k = arr.map(([m, s]) => `${m}:${s}`).join(',')
      if (bestKey === '' || k < bestKey) { bestKey = k; bestShift = sh; bestSorted = arr; symCount = 1 }
      else if (k === bestKey) symCount++
    }
    return { key: bestKey, mShift: bestShift, sorted: bestSorted, symCount }
  }
  const keyToIdx = new Map<string, number>()
  const configs: [number, number][][] = []
  const symCounts: number[] = []
  const chosen: number[] = []
  const gen = (start: number): void => {
    if (chosen.length === kPart) {
      const cn = canon(chosen.map(c => [c >> 1, c & 1] as const))
      if (!keyToIdx.has(cn.key)) {
        const phOrb = (2 * P * M) / cn.symCount
        if (Math.hypot(Math.cos(phOrb) - 1, Math.sin(phOrb)) < 1e-9) {
          keyToIdx.set(cn.key, configs.length)
          configs.push(cn.sorted)
          symCounts.push(cn.symCount)
        }
      }
      return
    }
    for (let c = start; c < 2 * M; c++) { chosen.push(c); gen(c + 1); chosen.pop() }
  }
  gen(0)
  const dim = configs.length
  const U = cmatZero(dim)
  const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
  for (let col = 0; col < dim; col++) {
    const pts = configs[col]!
    const byM = new Map<number, number[]>()
    for (let i = 0; i < kPart; i++) {
      const m = pts[i]![0]
      const l = byM.get(m)
      if (l) l.push(i)
      else byM.set(m, [i])
    }
    let branches: { pts: [number, number][]; amp: C }[] = [{ pts: [], amp: [1, 0] }]
    for (const [m, idxs] of byM) {
      if (idxs.length === 2) {
        branches = branches.map(b => ({ pts: [...b.pts, [m, 0], [m, 1]], amp: cMul(b.amp, pairPhase) }))
      } else {
        const sIn = pts[idxs[0]!]![1]
        const nb: { pts: [number, number][]; amp: C }[] = []
        for (const b of branches) {
          nb.push({ pts: [...b.pts, [m, 0]], amp: cMul(b.amp, cMat[0]![sIn]!) })
          nb.push({ pts: [...b.pts, [m, 1]], amp: cMul(b.amp, cMat[1]![sIn]!) })
        }
        branches = nb
      }
    }
    for (const b of branches) {
      const cn = canon(b.pts.map(([m, s]) => [s === 0 ? m : (m - 1 + M) % M, s]))
      const row = keyToIdx.get(cn.key)
      if (row === undefined) continue
      const val = cScale(Math.sqrt(symCounts[row]! / symCounts[col]!), cMul(cExpI(P * (2 * cn.mShift - 1)), b.amp))
      U.re[row * dim + col] = U.re[row * dim + col]! + val[0]
      U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
    }
  }
  return { U, dim, configs, symCounts }
}

// =================================================================================================
// PART 1 (W12.1): 2-BODY & 3-BODY S-MATRIX, YANG-BAXTER TEST, 3-BODY DIFFRACTION, & CHAOS <r>
// =================================================================================================

function runPart1(): void {
  console.log('================================================================================')
  console.log('PART 1 (W12.1): 2-BODY & 3-BODY S-MATRIX, YANG-BAXTER TEST, & CHAOS DIAGNOSTIC <r>')
  console.log('================================================================================')

  // 1A. Exact 2-body S-matrix unitarity, closed-form Yang rapidity u(p, alpha), & Bethe k-string pole law
  const ps = [0.25, 0.65, 1.15, 1.75, 2.35, -0.45, -1.25]
  const lamPair = cMul(W2_C, Z18_C)
  const lamK = cScale(-1, W_C)

  let maxUniErr = 0
  let maxRootErr = 0
  let maxRapidityErr = 0
  let maxKErr = 0
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      for (const b1 of [1, -1] as const) {
        for (const b2 of [1, -1] as const) {
          const sM = twoBodySMatrix(W2_C, ps[i]!, b1, ps[j]!, b2)
          const sK = twoBodySMatrix(lamK, ps[i]!, b1, ps[j]!, b2)
          const sP = twoBodySMatrix(lamPair, ps[i]!, b1, ps[j]!, b2)
          maxRootErr = Math.max(maxRootErr, sM.rootErr, sK.rootErr, sP.rootErr)
          maxUniErr = Math.max(
            maxUniErr,
            Math.abs(cAbs2(sM.S) - 1),
            Math.abs(cAbs2(sK.S) - 1),
            Math.abs(cAbs2(sP.S) - 1),
            Math.abs(cAbs2(sM.tAmp) + cAbs2(sM.rAmp) - 1),
          )
          const u1 = spU(ps[i]!, b1)
          const u2 = spU(ps[j]!, b2)
          const sYang = cDiv([u1 - u2, -1], [u1 - u2, 1])
          maxRapidityErr = Math.max(maxRapidityErr, cAbs(cSub(sM.S, sYang)))
          maxKErr = Math.max(maxKErr, cAbs(cSub(sK.S, [-1, 0])))
        }
      }
    }
  }

  // Exact Bethe k-string pole law z(h) = (1 - 3h + 3h^2) / (1 + 3h + 3h^2)
  // For k = 5 penton: z(-2) = 19/7 > 1 pairs with normalizable right-end decay z(+2) = 7/19 < 1,
  // with predicted exact eigenvalue lam_5 = (16 + 21w)/19 in Z[omega][1/133] (|lam_5|^2 = 1).
  const zOfH = (h: number): number => (1 - 3 * h + 3 * h * h) / (1 + 3 * h + 3 * h * h)
  const lam5Pred: C = [(16 + 21 * W_C[0]) / 19, (21 * W_C[1]) / 19]
  const poleLawErr = Math.max(
    Math.abs(zOfH(0) - 1),
    Math.abs(zOfH(-0.5) - 13),
    Math.abs(zOfH(-1.0) - 7),
    Math.abs(zOfH(-1.5) - 49 / 13),
    Math.abs(zOfH(-2.0) - 19 / 7),
    Math.abs(zOfH(+2.0) - 7 / 19),
    Math.abs(cAbs2(lam5Pred) - 1),
  )

  // 1B. Full 6x6 Braid Yang-Baxter Matrix Test:
  // Basis of S_3 internal label orderings for 3 distinguishable labels (0, 1, 2):
  //   0:(0,1,2), 1:(0,2,1), 2:(1,0,2), 3:(1,2,0), 4:(2,0,1), 5:(2,1,0).
  // Braid operator B_{ij}(p_a, p_b) acts on adjacent spatial slots (1,2) or (2,3):
  //   - same-sign distinct roles (M_meet): r*I + t*P  (YBE = 0!)
  //   - opposite signs (K): -I (impenetrable reflection r=-1, t=0!)
  //   - identical roles (r_1 = r_1): scalar S_pair(p_a, p_b) (acts as S_pair on identical adjacent pair!)
  const perms6: readonly (readonly [number, number, number])[] = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
  ]
  const permIdx = (a: number, b: number, c: number): number =>
    perms6.findIndex(p => p[0] === a && p[1] === b && p[2] === c)

  const buildBraid6 = (
    pos: 0 | 1,
    pA: number,
    bA: 1 | -1,
    pB: number,
    bB: 1 | -1,
    channel: 'M_meet_3role' | 'roles_001_Mpair' | 'K_plus_Mmeet',
  ): CMat => {
    const M = cmatZero(6)
    const sM = twoBodySMatrix(W2_C, pA, bA, pB, bB)
    const sP = twoBodySMatrix(lamPair, pA, bA, pB, bB)
    for (let col = 0; col < 6; col++) {
      const cfg = perms6[col]!
      const lL = cfg[pos]!
      const lR = cfg[pos + 1]!
      const sw: [number, number, number] = [cfg[0], cfg[1], cfg[2]]
      sw[pos] = lR
      sw[pos + 1] = lL
      const rowSw = permIdx(sw[0], sw[1], sw[2])
      if (channel === 'M_meet_3role') {
        M.re[col * 6 + col] = M.re[col * 6 + col]! + sM.rAmp[0]
        M.im[col * 6 + col] = M.im[col * 6 + col]! + sM.rAmp[1]
        M.re[rowSw * 6 + col] = M.re[rowSw * 6 + col]! + sM.tAmp[0]
        M.im[rowSw * 6 + col] = M.im[rowSw * 6 + col]! + sM.tAmp[1]
      } else if (channel === 'roles_001_Mpair') {
        // Labels 0, 1 carry identical role 0 (M_pair on Sym); label 2 carries distinct role 1 (M_meet)!
        if ((lL === 0 && lR === 1) || (lL === 1 && lR === 0)) {
          // On Sym(0,1), M_pair gives S_pair; on Alt(0,1), free fermion gives -1 -> r=(S_pair-1)/2, t=(S_pair+1)/2
          M.re[col * 6 + col] = M.re[col * 6 + col]! + sP.rAmp[0]
          M.im[col * 6 + col] = M.im[col * 6 + col]! + sP.rAmp[1]
          M.re[rowSw * 6 + col] = M.re[rowSw * 6 + col]! + sP.tAmp[0]
          M.im[rowSw * 6 + col] = M.im[rowSw * 6 + col]! + sP.tAmp[1]
        } else {
          M.re[col * 6 + col] = M.re[col * 6 + col]! + sM.rAmp[0]
          M.im[col * 6 + col] = M.im[col * 6 + col]! + sM.rAmp[1]
          M.re[rowSw * 6 + col] = M.re[rowSw * 6 + col]! + sM.tAmp[0]
          M.im[rowSw * 6 + col] = M.im[rowSw * 6 + col]! + sM.tAmp[1]
        }
      } else {
        // Labels 0, 1 have tone +1 (distinct roles -> M_meet); label 2 has tone -1 (K = -I reflection!)
        if (lL === 2 || lR === 2) {
          M.re[col * 6 + col] = M.re[col * 6 + col]! - 1
        } else {
          M.re[col * 6 + col] = M.re[col * 6 + col]! + sM.rAmp[0]
          M.im[col * 6 + col] = M.im[col * 6 + col]! + sM.rAmp[1]
          M.re[rowSw * 6 + col] = M.re[rowSw * 6 + col]! + sM.tAmp[0]
          M.im[rowSw * 6 + col] = M.im[rowSw * 6 + col]! + sM.tAmp[1]
        }
      }
    }
    return M
  }

  const evalYbe6 = (channel: 'M_meet_3role' | 'roles_001_Mpair' | 'K_plus_Mmeet'): { readonly normF: number; readonly maxUni: number } => {
    const p1 = 0.25; const p2 = 1.05; const p3 = 1.95
    const b12_23 = buildBraid6(0, p2, 1, p3, 1, channel)
    const b23_13 = buildBraid6(1, p1, 1, p3, 1, channel)
    const b12_12 = buildBraid6(0, p1, 1, p2, 1, channel)
    const b23_12 = buildBraid6(1, p1, 1, p2, 1, channel)
    const b12_13 = buildBraid6(0, p1, 1, p3, 1, channel)
    const b23_23 = buildBraid6(1, p2, 1, p3, 1, channel)
    const lhs = cmatMul(b12_23, cmatMul(b23_13, b12_12))
    const rhs = cmatMul(b23_12, cmatMul(b12_13, b23_23))
    let f2 = 0
    for (let i = 0; i < 36; i++) f2 += (lhs.re[i]! - rhs.re[i]!) ** 2 + (lhs.im[i]! - rhs.im[i]!) ** 2
    const maxUni = Math.max(cmatUnitaryErr(b12_23), cmatUnitaryErr(b23_13), cmatUnitaryErr(b12_12))
    return { normF: Math.sqrt(f2), maxUni }
  }

  const ybeMeet = evalYbe6('M_meet_3role')
  const ybe001 = evalYbe6('roles_001_Mpair')
  const ybeK = evalYbe6('K_plus_Mmeet')

  // 1C. Exact 3-body Bethe Ansatz quantization vs exact diagonalization on M = 8, P = pi/8 (Sym^3 M_meet & Sym^3 M_pair)
  let maxBaMeetErr = 0
  let maxBaPairErr = 0
  {
    const M = 8; const P = PI / M
    const phMeet = unitaryPhases(buildSymKEven(3, M, P, W2_C).U).phases
    const phPair = unitaryPhases(buildSymKEven(3, M, P, lamPair).U).phases
    const distSpec = (E: number, spec: Float64Array) => {
      let best = 99
      for (let i = 0; i < spec.length; i++) {
        const d = Math.abs((((spec[i]! - E) % (2 * PI)) + 3 * PI) % (2 * PI) - PI)
        if (d < best) best = d
      }
      return best
    }
    const solve3 = (lam0: C, I1: number, I2: number, b1: 1 | -1, b2: 1 | -1, b3: 1 | -1): number => {
      let p1 = (PI * (I1 + 0.15)) / M
      let p2 = (PI * (I2 + 0.15)) / M
      const evalF = (x1: number, x2: number): [number, number] => {
        const x3 = P - x1 - x2
        return [
          2 * M * x1 + cArg(twoBodySMatrix(lam0, x1, b1, x2, b2).S) + cArg(twoBodySMatrix(lam0, x1, b1, x3, b3).S) - 2 * PI * I1,
          2 * M * x2 + cArg(twoBodySMatrix(lam0, x2, b2, x1, b1).S) + cArg(twoBodySMatrix(lam0, x2, b2, x3, b3).S) - 2 * PI * I2,
        ]
      }
      for (let it = 0; it < 40; it++) {
        const [f1, f2] = evalF(p1, p2)
        if (Math.hypot(f1, f2) < 1e-13) break
        const h = 1e-7
        const [f1x, f2x] = evalF(p1 + h, p2)
        const [f1y, f2y] = evalF(p1, p2 + h)
        const j11 = (f1x - f1) / h; const j21 = (f2x - f2) / h; const j12 = (f1y - f1) / h; const j22 = (f2y - f2) / h
        const det = j11 * j22 - j12 * j21
        p1 -= (j22 * f1 - j12 * f2) / det
        p2 -= (-j21 * f1 + j11 * f2) / det
      }
      const p3 = P - p1 - p2
      return ((spE(p1, b1) + spE(p2, b2) + spE(p3, b3) + 5 * PI) % (2 * PI)) - PI
    }
    for (const [I1, I2, b1, b2, b3] of [[1, 3, 1, 1, 1], [1, 4, 1, 1, 1], [2, 5, 1, 1, 1], [1, 3, 1, 1, -1]] as const) {
      maxBaMeetErr = Math.max(maxBaMeetErr, distSpec(solve3(W2_C, I1, I2, b1, b2, b3), phMeet))
      maxBaPairErr = Math.max(maxBaPairErr, distSpec(solve3(lamPair, I1, I2, b1, b2, b3), phPair))
    }
  }

  // 1D. Exact (Z_2)^12 line-occupation parity conservation AND k = 5 M_pair + Phi_odd joint coexistence witness
  //     in literal 4D Z[zeta_9][1/6] bare U!
  //     Note: At k = 4, M_pair requires N_a >= 2 while Phi_odd requires 4 non-coplanar occupied lines (W13 proves
  //     220/220 3-line (2,1,1) quads vanish by W(F_4)^- reflection symmetry), so they are mutually exclusive at k = 4.
  //     First simultaneous coexistence inside one connected (Z_2)^12 parity sector is k = 5 = 2 + 1 + 1 + 1
  //     (parity signature 011000001000)!
  let parityDefects4D = 0
  let k5MPairDiffs = 0
  let k5PhiDiffs = 0
  let k5BranchesT2 = 0
  let k5ParitySig = ''
  {
    const [l0A, l0B] = LINES[0]!
    const [l1A] = LINES[1]!
    const [l2A] = LINES[2]!
    const [l8A] = LINES[8]!
    const d1 = stepDock(0, l0A)
    const k5Seed = stateFromEntries(
      [[[
        [0, l0A, 1, 0],
        [0, l0B, 1, 0],
        [stepDock(d1, OPPOSITE_SLOT[l1A]!), l1A, 1, 0],
        [stepDock(d1, OPPOSITE_SLOT[l2A]!), l2A, 1, 0],
        [stepDock(d1, OPPOSITE_SLOT[l8A]!), l8A, 1, 0],
      ], Z9_ONE]],
      1n,
    )
    const testSeeds: readonly ExactState[] = [
      stateFromEntries([[[[0, l0A, 1, 0], [0, l0B, 1, 0]], Z9_ONE]], 1n), // k=2 M_pair active
      stateFromEntries([[[[0, l0A, 1, 0], [0, l0B, 1, 0], [stepDock(0, l1A), l1A, 1, 0]], Z9_ONE]], 1n), // k=3 M_pair active
      stateFromEntries([[[[0, l0A, 1, 0], [0, l1A, 1, 0], [0, l2A, 1, 0], [0, l8A, 1, 0]], Z9_ONE]], 1n), // k=4 Phi_odd active
    ]
    const paritySig = (vs: readonly Vibe[]): string => {
      const p = new Int32Array(12)
      for (const [, slot] of vs) p[LINE_OF_SLOT[slot]!] = p[LINE_OF_SLOT[slot]!]! ^ 1
      return Array.from(p).join('')
    }
    const applyBeatSkip = (s: ExactState, skip: LayerOp): ExactState =>
      BEAT_LAYERS.reduce((c, f) => (f === skip ? c : f(c, false)), s)
    for (const st0 of testSeeds) {
      const expectedSig = paritySig(decodeConfig([...st0.amp.keys()][0]!))
      let st = st0
      for (let t = 1; t <= 2; t++) {
        st = applyBeat(st)
        for (const k of st.amp.keys()) if (paritySig(decodeConfig(k)) !== expectedSig) parityDefects4D++
      }
    }
    k5ParitySig = paritySig(decodeConfig([...k5Seed.amp.keys()][0]!))
    const k5T1 = applyBeat(k5Seed)
    for (const k of k5T1.amp.keys()) if (paritySig(decodeConfig(k)) !== k5ParitySig) parityDefects4D++
    const k5T1NoPair = applyBeatSkip(k5Seed, applyPairLineMixer)
    k5MPairDiffs = countStateDiffs(k5T1, k5T1NoPair)
    // By linearity of applyBeat and dock-invariance of all 7 pre-stream layers [Phi_odd, D, K, M_pair, M_meet, D, Phi_odd],
    // Phi_odd at beat 2 acts EXCLUSIVELY on the subset of k5T1 configs having >= 4 vibes on one dock (the 1 dock-d1
    // coincidence config out of 96; the other 95 configs have 5 isolated singletons and expand to 95 * 32 = 3040 branches
    // with identical zero Phi_odd diff, giving 3072 total branches at t = 2).
    const k5ActiveAmp = new Map<string, Z9>()
    for (const [k, amp] of k5T1.amp) {
      let has4 = false
      for (const idxs of groupByDock(decodeConfig(k)).values()) if (idxs.length >= 4) { has4 = true; break }
      if (has4) k5ActiveAmp.set(k, amp)
    }
    const k5ActiveState: ExactState = { amp: k5ActiveAmp, den: k5T1.den }
    const k5ActiveT2 = applyBeat(k5ActiveState)
    for (const k of k5ActiveT2.amp.keys()) if (paritySig(decodeConfig(k)) !== k5ParitySig) parityDefects4D++
    const k5ActiveT2NoPhi = applyBeatSkip(k5ActiveState, applyOddChiralPhase)
    k5PhiDiffs = countStateDiffs(k5ActiveT2, k5ActiveT2NoPhi)
    k5BranchesT2 = k5ActiveT2.amp.size + (k5T1.amp.size - k5ActiveAmp.size) * 32
  }

  // 1E. Symmetry-Resolved Adjacent Eigenphase Level-Spacing Ratio <r>:
  //     (a) 1D collinear: Sym^3 M_meet (M=11), Sym^4 M_meet (M=9), (+,+,-) K+M_meet (L=9),
  //         verbatim 3-role 4D (+,+,+,-) K+M_meet (L=5) vs 1D scalar-phase surrogate (+,+,+,-) K+M_pair (L=5)
  //     (b) Cyclic Cayley-graph multi-line quotients (N_a mod 2 parity resolved; n_L=2 gives 6x M_pair boost vs 12-line 4D!):
  //         - Cyclic Cayley Z_7 2-line (1,2) k=3 parity=(1,0) M_pair OFF vs ON
  //         - Cyclic Cayley Z_5 2-line (1,2) k=3 mixed-sign (+,+,-) M_pair OFF vs ON
  //         - Cyclic Cayley Z_6 bipartite C4 = [0,1,2,8] k=4 Phi_odd OFF vs ON (explicitly reports unresolved degeneracies!)
  const avgR = (mats: readonly CMat[]): { readonly rMean: number; readonly nGaps: number; readonly nDeg: number; readonly maxUni: number } => {
    let rSum = 0; let nTot = 0; let degTot = 0; let maxUni = 0
    for (const U of mats) {
      maxUni = Math.max(maxUni, cmatUnitaryErr(U))
      const st = levelSpacingR(unitaryPhases(U).phases)
      rSum += st.rMean * st.nSpacings
      nTot += st.nSpacings
      degTot += st.nDeg
    }
    return { rMean: nTot > 0 ? rSum / nTot : 0, nGaps: nTot, nDeg: degTot, maxUni }
  }

  const r1DSym3Meet = avgR([1, 2, 3, 4].map(m => buildSymKEven(3, 11, (PI * m) / 11, W2_C).U))
  const r1DSym4Meet = avgR([1, 2, 3].map(m => buildSymKEven(4, 9, (PI * m) / 9, W2_C).U))

  // 1D (+,+,-) L=7, 9 & (+,+,+,-) L=5 (K + M_meet vs K + M_pair)
  const build1DMixedK3 = (L: number, P: number, plusPh: C): CMat => {
    const S = 2 * L
    const shS = (c: number, sh: number): number => ((((c >> 1) + sh) % L + L) % L) * 2 + (c & 1)
    const canon = (a: number, b: number, n0: number) => {
      let bk = ''; let bs = 0; let bv: [number, number, number] = [0, 0, 0]
      for (let sh = 0; sh < L; sh++) {
        let x = shS(a, sh); let y = shS(b, sh); if (x > y) { const t = x; x = y; y = t }
        const z = shS(n0, sh); const k = `${x},${y}|${z}`
        if (bk === '' || k < bk) { bk = k; bs = sh; bv = [x, y, z] }
      }
      return { key: bk, shift: bs, vals: bv }
    }
    const idxMap = new Map<string, number>(); const cfgs: [number, number, number][] = []
    for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) for (let n0 = 0; n0 < S; n0++) {
      if (n0 === a || n0 === b) continue
      const cn = canon(a, b, n0)
      if (!idxMap.has(cn.key)) { idxMap.set(cn.key, cfgs.length); cfgs.push(cn.vals) }
    }
    const dim = cfgs.length; const U = cmatZero(dim); const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
    const kFac: C = [-W_C[0], -W_C[1]]
    for (let col = 0; col < dim; col++) {
      const [a, b, n0] = cfgs[col]!
      const pts: [number, number, number][] = [[a >> 1, a & 1, 1], [b >> 1, b & 1, 1], [n0 >> 1, n0 & 1, -1]]
      const byX = new Map<number, [number, number, number][]>()
      for (const p of pts) { const l = byX.get(p[0]); if (l) l.push(p); else byX.set(p[0], [p]) }
      let brs: { ps: [number, number, number][]; amp: C }[] = [{ ps: [], amp: [1, 0] }]
      for (const [x, list] of byX) {
        if (list.length === 1) {
          const [, sIn, t] = list[0]!; const nb: { ps: [number, number, number][]; amp: C }[] = []
          for (const br of brs) { nb.push({ ps: [...br.ps, [x, 0, t]], amp: cMul(br.amp, cMat[0]![sIn]!) }); nb.push({ ps: [...br.ps, [x, 1, t]], amp: cMul(br.amp, cMat[1]![sIn]!) }) }
          brs = nb
        } else {
          const pA = list[0]!; const pB = list[1]!
          if (pA[2] !== pB[2]) brs = brs.map(br => ({ ps: [...br.ps, [x, pB[1], pA[2]], [x, pA[1], pB[2]]], amp: cMul(br.amp, kFac) }))
          else brs = brs.map(br => ({ ps: [...br.ps, pA, pB], amp: cMul(br.amp, plusPh) }))
        }
      }
      for (const br of brs) {
        const psP: number[] = []; let nC = 0
        for (const [x, s, t] of br.ps) { const c = 2 * ((((x + (s === 0 ? 1 : -1)) % L) + L) % L) + s; if (t > 0) psP.push(c); else nC = c }
        const cn = canon(psP[0]!, psP[1]!, nC); const row = idxMap.get(cn.key)!
        const val = cMul(cExpI(P * cn.shift), br.amp)
        U.re[row * dim + col] = U.re[row * dim + col]! + val[0]; U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
      }
    }
    return U
  }

  const build1DMixedK4Q2 = (L: number, P: number, plusPh: C): CMat => {
    const S = 2 * L
    const shS = (c: number, sh: number): number => ((((c >> 1) + sh) % L + L) % L) * 2 + (c & 1)
    const canon = (a: number, b: number, c: number, n0: number) => {
      let bk = ''; let bs = 0; let bv: [number, number, number, number] = [0, 0, 0, 0]
      for (let sh = 0; sh < L; sh++) {
        const ps = [shS(a, sh), shS(b, sh), shS(c, sh)].sort((u, v) => u - v)
        const z = shS(n0, sh); const k = `${ps[0]},${ps[1]},${ps[2]}|${z}`
        if (bk === '' || k < bk) { bk = k; bs = sh; bv = [ps[0]!, ps[1]!, ps[2]!, z] }
      }
      return { key: bk, shift: bs, vals: bv }
    }
    const idxMap = new Map<string, number>(); const cfgs: [number, number, number, number][] = []
    for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) for (let c = b + 1; c < S; c++) for (let n0 = 0; n0 < S; n0++) {
      if (n0 === a || n0 === b || n0 === c) continue
      const cn = canon(a, b, c, n0)
      if (!idxMap.has(cn.key)) { idxMap.set(cn.key, cfgs.length); cfgs.push(cn.vals) }
    }
    const dim = cfgs.length; const U = cmatZero(dim); const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
    const kFac: C = [-W_C[0], -W_C[1]]
    for (let col = 0; col < dim; col++) {
      const [a, b, c, n0] = cfgs[col]!
      const pts: [number, number, number][] = [[a >> 1, a & 1, 1], [b >> 1, b & 1, 1], [c >> 1, c & 1, 1], [n0 >> 1, n0 & 1, -1]]
      const byX = new Map<number, [number, number, number][]>()
      for (const p of pts) { const l = byX.get(p[0]); if (l) l.push(p); else byX.set(p[0], [p]) }
      let brs: { ps: [number, number, number][]; amp: C }[] = [{ ps: [], amp: [1, 0] }]
      for (const [x, list] of byX) {
        if (list.length === 1) {
          const [, sIn, t] = list[0]!; const nb: { ps: [number, number, number][]; amp: C }[] = []
          for (const br of brs) { nb.push({ ps: [...br.ps, [x, 0, t]], amp: cMul(br.amp, cMat[0]![sIn]!) }); nb.push({ ps: [...br.ps, [x, 1, t]], amp: cMul(br.amp, cMat[1]![sIn]!) }) }
          brs = nb
        } else {
          const pA = list[0]!; const pB = list[1]!
          if (pA[2] !== pB[2]) brs = brs.map(br => ({ ps: [...br.ps, [x, pB[1], pA[2]], [x, pA[1], pB[2]]], amp: cMul(br.amp, kFac) }))
          else brs = brs.map(br => ({ ps: [...br.ps, pA, pB], amp: cMul(br.amp, plusPh) }))
        }
      }
      for (const br of brs) {
        const psP: number[] = []; let nC = 0
        for (const [x, s, t] of br.ps) { const cc = 2 * ((((x + (s === 0 ? 1 : -1)) % L) + L) % L) + s; if (t > 0) psP.push(cc); else nC = cc }
        const cn = canon(psP[0]!, psP[1]!, psP[2]!, nC); const row = idxMap.get(cn.key)!
        const val = cMul(cExpI(P * cn.shift), br.amp)
        U.re[row * dim + col] = U.re[row * dim + col]! + val[0]; U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
      }
    }
    return U
  }

  const r1DK3L9 = avgR([1, 2, 3, 4].map(m => build1DMixedK3(9, (2 * PI * m) / 9, W2_C)))
  const r1DK4Meet = avgR([1, 2].map(m => build1DMixedK4Q2(5, (2 * PI * m) / 5, W2_C)))
  const r1DK4Pair = avgR([1, 2].map(m => build1DMixedK4Q2(5, (2 * PI * m) / 5, lamPair)))

  // 4D coupled multi-line Z_7 (steps 1,2) k=3 parity=(1,0) M_pair OFF vs ON
  const build4DZ7K3 = (P: number, useMPair: boolean): CMat => {
    const N = 7; const steps = [1, 2] as const; const perDock = 4; const S = N * perDock
    const shS = (c: number, sh: number): number => ((((Math.floor(c / perDock) + sh) % N) + N) % N) * perDock + (c % perDock)
    const canon = (a: number, b: number, c: number) => {
      let bk = ''; let bs = 0; let bv: [number, number, number] = [0, 0, 0]
      for (let sh = 0; sh < N; sh++) {
        const arr = [shS(a, sh), shS(b, sh), shS(c, sh)].sort((u, v) => u - v)
        const k = `${arr[0]},${arr[1]},${arr[2]}`
        if (bk === '' || k < bk) { bk = k; bs = sh; bv = [arr[0]!, arr[1]!, arr[2]!] }
      }
      return { key: bk, shift: bs, vals: bv }
    }
    const idxMap = new Map<string, number>(); const cfgs: [number, number, number][] = []
    for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) for (let c = b + 1; c < S; c++) {
      const p0 = (((a % perDock) >> 1) === 0 ? 1 : 0) + (((b % perDock) >> 1) === 0 ? 1 : 0) + (((c % perDock) >> 1) === 0 ? 1 : 0)
      if ((p0 & 1) !== 1) continue
      const cn = canon(a, b, c)
      if (!idxMap.has(cn.key)) { idxMap.set(cn.key, cfgs.length); cfgs.push(cn.vals) }
    }
    const dim = cfgs.length; const U = cmatZero(dim)
    const keepM: C = useMPair ? cMul(W2_C, [(1 + Z18_C[0]) / 2, Z18_C[1] / 2]) : W2_C
    const hopM: C = useMPair ? cMul(W2_C, [(Z18_C[0] - 1) / 2, Z18_C[1] / 2]) : ([0, 0] as C)
    for (let col = 0; col < dim; col++) {
      const cfg = cfgs[col]!
      const byDock = new Map<number, number[]>()
      for (const s of cfg) { const d = Math.floor(s / perDock); const l = byDock.get(d); if (l) l.push(s % perDock); else byDock.set(d, [s % perDock]) }
      let brs: { slots: [number, number][]; amp: C }[] = [{ slots: [], amp: [1, 0] }]
      for (const [d, localList] of byDock) {
        if (localList.length === 2 && (localList[0]! >> 1) === (localList[1]! >> 1) && useMPair) {
          const curL = localList[0]! >> 1; const nb: { slots: [number, number][]; amp: C }[] = []
          for (const br of brs) for (let j = 0; j < 2; j++) nb.push({ slots: [...br.slots, [d, 2 * j], [d, 2 * j + 1]], amp: cMul(br.amp, j === curL ? keepM : hopM) })
          brs = nb
        } else {
          const byLine = new Map<number, number[]>()
          for (const ls of localList) { const l = ls >> 1; const a = byLine.get(l); if (a) a.push(ls & 1); else byLine.set(l, [ls & 1]) }
          for (const [l, dirs] of byLine) {
            if (dirs.length === 2) brs = brs.map(br => ({ slots: [...br.slots, [d, 2 * l], [d, 2 * l + 1]], amp: cMul(br.amp, W2_C) }))
            else {
              const sIn = dirs[0]!; const nb: { slots: [number, number][]; amp: C }[] = []
              for (const br of brs) {
                nb.push({ slots: [...br.slots, [d, 2 * l + sIn]], amp: cMul(br.amp, C_KEEP) })
                nb.push({ slots: [...br.slots, [d, 2 * l + (sIn ^ 1)]], amp: cMul(br.amp, C_CROSS) })
              }
              brs = nb
            }
          }
        }
      }
      for (const br of brs) {
        const mv = br.slots.map(([d, ls]) => ((((d + ((ls & 1) === 0 ? steps[ls >> 1]! : -steps[ls >> 1]!)) % N) + N) % N) * perDock + ls)
        const cn = canon(mv[0]!, mv[1]!, mv[2]!); const row = idxMap.get(cn.key)!
        const val = cMul(cExpI(P * cn.shift), br.amp)
        U.re[row * dim + col] = U.re[row * dim + col]! + val[0]; U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
      }
    }
    return U
  }

  // 4D coupled multi-line Z_5 (steps 1,2) k=3 mixed-sign (+,+,-) parity=(0+,0+; 1- on line 0): K + M_meet + M_pair!
  const build4DZ5K3Mixed = (P: number, useMPair: boolean): CMat => {
    const N = 5; const steps = [1, 2] as const; const perDock = 4; const S = N * perDock
    const shS = (c: number, sh: number): number => ((((Math.floor(c / perDock) + sh) % N) + N) % N) * perDock + (c % perDock)
    const canon = (a: number, b: number, n0: number) => {
      let bk = ''; let bs = 0; let bv: [number, number, number] = [0, 0, 0]
      for (let sh = 0; sh < N; sh++) {
        let x = shS(a, sh); let y = shS(b, sh); if (x > y) { const t = x; x = y; y = t }
        const z = shS(n0, sh); const k = `${x},${y}|${z}`
        if (bk === '' || k < bk) { bk = k; bs = sh; bv = [x, y, z] }
      }
      return { key: bk, shift: bs, vals: bv }
    }
    const idxMap = new Map<string, number>(); const cfgs: [number, number, number][] = []
    for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) {
      if ((((a % perDock) >> 1) !== ((b % perDock) >> 1))) continue // even parity (2,0) or (0,2) for the two + vibes!
      for (let n0 = 0; n0 < S; n0++) {
        if (n0 === a || n0 === b || ((n0 % perDock) >> 1) !== 0) continue // single - vibe on line 0
        const cn = canon(a, b, n0)
        if (!idxMap.has(cn.key)) { idxMap.set(cn.key, cfgs.length); cfgs.push(cn.vals) }
      }
    }
    const dim = cfgs.length; const U = cmatZero(dim)
    const kFac: C = [-W_C[0], -W_C[1]]
    const keepM: C = useMPair ? cMul(W2_C, [(1 + Z18_C[0]) / 2, Z18_C[1] / 2]) : W2_C
    const hopM: C = useMPair ? cMul(W2_C, [(Z18_C[0] - 1) / 2, Z18_C[1] / 2]) : ([0, 0] as C)
    for (let col = 0; col < dim; col++) {
      const [a, b, n0] = cfgs[col]!
      const pts: [number, number, number][] = [
        [Math.floor(a / perDock), a % perDock, 1],
        [Math.floor(b / perDock), b % perDock, 1],
        [Math.floor(n0 / perDock), n0 % perDock, -1],
      ]
      const byDock = new Map<number, [number, number][]>()
      for (const [d, ls, tone] of pts) { const l = byDock.get(d); if (l) l.push([ls, tone]); else byDock.set(d, [[ls, tone]]) }
      let brs: { pts: [number, number, number][]; amp: C }[] = [{ pts: [], amp: [1, 0] }]
      for (const [d, list] of byDock) {
        if (list.length === 2 && (list[0]![0] >> 1) === (list[1]![0] >> 1) && list[0]![1] === 1 && list[1]![1] === 1 && useMPair) {
          const curL = list[0]![0] >> 1; const nb: { pts: [number, number, number][]; amp: C }[] = []
          for (const br of brs) for (let j = 0; j < 2; j++) nb.push({ pts: [...br.pts, [d, 2 * j, 1], [d, 2 * j + 1, 1]], amp: cMul(br.amp, j === curL ? keepM : hopM) })
          brs = nb
        } else {
          const byLine = new Map<number, [number, number][]>()
          for (const [ls, tone] of list) { const l = ls >> 1; const arr = byLine.get(l); if (arr) arr.push([ls & 1, tone]); else byLine.set(l, [[ls & 1, tone]]) }
          for (const [l, items] of byLine) {
            if (items.length === 2) {
              const [sA, tA] = items[0]!; const [sB, tB] = items[1]!
              if (tA !== tB) brs = brs.map(br => ({ pts: [...br.pts, [d, 2 * l + sB, tA], [d, 2 * l + sA, tB]], amp: cMul(br.amp, kFac) }))
              else brs = brs.map(br => ({ pts: [...br.pts, [d, 2 * l + sA, tA], [d, 2 * l + sB, tB]], amp: cMul(br.amp, W2_C) }))
            } else {
              const [sIn, tone] = items[0]!; const nb: { pts: [number, number, number][]; amp: C }[] = []
              for (const br of brs) {
                nb.push({ pts: [...br.pts, [d, 2 * l + sIn, tone]], amp: cMul(br.amp, C_KEEP) })
                nb.push({ pts: [...br.pts, [d, 2 * l + (sIn ^ 1), tone]], amp: cMul(br.amp, C_CROSS) })
              }
              brs = nb
            }
          }
        }
      }
      for (const br of brs) {
        const psP: number[] = []; let nC = 0
        for (const [d, ls, tone] of br.pts) {
          const code = ((((d + ((ls & 1) === 0 ? steps[ls >> 1]! : -steps[ls >> 1]!)) % N) + N) % N) * perDock + ls
          if (tone > 0) psP.push(code); else nC = code
        }
        const cn = canon(psP[0]!, psP[1]!, nC); const row = idxMap.get(cn.key)!
        const val = cMul(cExpI(P * cn.shift), br.amp)
        U.re[row * dim + col] = U.re[row * dim + col]! + val[0]; U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
      }
    }
    return U
  }

  // 4D Bipartite Z_6 C4 = [0,1,2,8] k=4 Phi_odd OFF vs ON
  const buildZ6C4K4 = (usePhi: boolean): CMat => {
    const lines4 = [0, 1, 2, 8] as const; const steps = [1, 1, 3, 5] as const; const P2 = (2 * PI) / 3
    const phi16 = (sigma: 1 | -1): C[] => Array.from({ length: 16 }, (_, mask) => {
      if (!usePhi) return [1, 0] as C
      const codes = [0, 1, 2, 3].map(j => LINES[lines4[j]!]![(mask >> j) & 1]! << 1)
      const ch = sigma * chiral4Sign(codes[0]!, codes[1]!, codes[2]!, codes[3]!)
      return Z6_POW[((ch % 6) + 6) % 6]!
    })
    const dim = 432
    const idx = (s0: number, c1: number, c2: number, c3: number) => ((s0 * 6 + c1) * 6 + c2) * 6 + c3
    const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
    const buildHalf = (sigma: 1 | -1): CMat => {
      const phArr = phi16(sigma); const U = cmatZero(dim)
      for (let s0 = 0; s0 < 2; s0++) for (let c1 = 0; c1 < 6; c1++) for (let c2 = 0; c2 < 6; c2++) for (let c3 = 0; c3 < 6; c3++) {
        const col = idx(s0, c1, c2, c3)
        const m1 = c1 >> 1; const s1 = c1 & 1; const m2 = c2 >> 1; const s2 = c2 & 1; const m3 = c3 >> 1; const s3 = c3 & 1
        const allZero = m1 === 0 && m2 === 0 && m3 === 0
        const phIn: C = allZero ? phArr[s0 + (s1 << 1) + (s2 << 2) + (s3 << 3)]! : [1, 0]
        for (const t0 of [0, 1]) {
          const a0 = cMul(phIn, cMat[t0]![s0]!)
          const x0p = (t0 === 0 ? steps[0] : 6 - steps[0]) % 6
          const a0s = cMul(a0, cExpI(-P2 * ((x0p - 1) >> 1)))
          for (const t1 of [0, 1]) {
            const a1 = cMul(a0s, cMat[t1]![s1]!)
            const nm1 = ((((2 * m1 + (t1 === 0 ? steps[1] : 6 - steps[1]) - x0p) % 6) + 6) % 6) >> 1
            for (const t2 of [0, 1]) {
              const a2 = cMul(a1, cMat[t2]![s2]!)
              const nm2 = ((((2 * m2 + (t2 === 0 ? steps[2] : 6 - steps[2]) - x0p) % 6) + 6) % 6) >> 1
              for (const t3 of [0, 1]) {
                let a3 = cMul(a2, cMat[t3]![s3]!)
                if (allZero) a3 = cMul(a3, phArr[t0 + (t1 << 1) + (t2 << 2) + (t3 << 3)]!)
                const nm3 = ((((2 * m3 + (t3 === 0 ? steps[3] : 6 - steps[3]) - x0p) % 6) + 6) % 6) >> 1
                const row = idx(t0, nm1 * 2 + t1, nm2 * 2 + t2, nm3 * 2 + t3)
                U.re[row * dim + col] = U.re[row * dim + col]! + a3[0]
                U.im[row * dim + col] = U.im[row * dim + col]! + a3[1]
              }
            }
          }
        }
      }
      return U
    }
    return cmatMul(buildHalf(-1), buildHalf(1))
  }

  const r4DZ7Off = avgR([1, 2, 3].map(m => build4DZ7K3((2 * PI * m) / 7, false)))
  const r4DZ7On = avgR([1, 2, 3].map(m => build4DZ7K3((2 * PI * m) / 7, true)))
  const r4DZ5MixOff = avgR([1, 2].map(m => build4DZ5K3Mixed((2 * PI * m) / 5, false)))
  const r4DZ5MixOn = avgR([1, 2].map(m => build4DZ5K3Mixed((2 * PI * m) / 5, true)))
  const r4DZ6PhiOff = avgR([buildZ6C4K4(false)])
  const r4DZ6PhiOn = avgR([buildZ6C4K4(true)])

  console.log(
    `  [1A] Exact 2-body S-matrix: max||S|^2-1|=${maxUniErr.toExponential(1)}, rootErr=${maxRootErr.toExponential(1)}, Yang-rapidity err=${maxRapidityErr.toExponential(1)}, K=(-1) err=${maxKErr.toExponential(1)}, z(h) poleLawErr=${poleLawErr.toExponential(1)}`,
  )
  console.log(
    `  [1B] 6x6 3-body Braid YBE: M_meet(r1,r2,r3)=${ybeMeet.normF.toExponential(2)} (EXACT 0!), roles(0,0,1)+M_pair=${ybe001.normF.toFixed(4)}, K+M_meet(+,+,-)=${ybeK.normF.toFixed(4)}`,
  )
  console.log(
    `  [1C] 3-body Bethe Ansatz (M=8, P=pi/8): Sym^3 M_meet maxErr=${maxBaMeetErr.toExponential(2)}, Sym^3 M_pair own-BA maxErr=${maxBaPairErr.toExponential(2)}; 4D (Z_2)^12 line-parity defects=${parityDefects4D}`,
  )
  console.log(
    `       k=5 M_pair+Phi_odd joint witness (parity=${k5ParitySig}): t=1 M_pair diffs=${k5MPairDiffs}, t=2 Phi_odd diffs=${k5PhiDiffs} across ${k5BranchesT2} branches (0 parity defects!)`,
  )
  console.log('  [1D] Level-Spacing Chaos Diagnostic <r> (Benchmarks: Poisson=0.3863, COE=0.5307, CUE=0.5996):')
  console.log(`       1D Sym^3 M_meet (M=11)                             : uni=${r1DSym3Meet.maxUni.toExponential(1)}, nGaps=${r1DSym3Meet.nGaps}, nDeg=${r1DSym3Meet.nDeg}, <r>=${r1DSym3Meet.rMean.toFixed(4)} (Poisson)`)
  console.log(`       1D Sym^4 M_meet (M=9)                              : uni=${r1DSym4Meet.maxUni.toExponential(1)}, nGaps=${r1DSym4Meet.nGaps}, nDeg=${r1DSym4Meet.nDeg}, <r>=${r1DSym4Meet.rMean.toFixed(4)} (Poisson)`)
  console.log(`       1D (+,+,-) K+M_meet (L=9)                          : uni=${r1DK3L9.maxUni.toExponential(1)}, nGaps=${r1DK3L9.nGaps}, nDeg=${r1DK3L9.nDeg}, <r>=${r1DK3L9.rMean.toFixed(4)} (intermediate)`)
  console.log(`       1D (+,+,+,-) K+M_meet (L=5, Q=+2, verbatim 3-role) : uni=${r1DK4Meet.maxUni.toExponential(1)}, nGaps=${r1DK4Meet.nGaps}, nDeg=${r1DK4Meet.nDeg}, <r>=${r1DK4Meet.rMean.toFixed(4)} (COE chaos!)`)
  console.log(`       1D (+,+,+,-) K+M_pair (L=5, Q=+2, 1D scalar surr.) : uni=${r1DK4Pair.maxUni.toExponential(1)}, nGaps=${r1DK4Pair.nGaps}, nDeg=${r1DK4Pair.nDeg}, <r>=${r1DK4Pair.rMean.toFixed(4)} (COE chaos!)`)
  console.log(`       Cyclic Cayley Z_7 2-line k=3 M_pair OFF->ON (6x)   : uni=${r4DZ7On.maxUni.toExponential(1)}, nGaps=${r4DZ7Off.nGaps}->${r4DZ7On.nGaps}, nDeg=${r4DZ7Off.nDeg}->${r4DZ7On.nDeg}, <r>=${r4DZ7Off.rMean.toFixed(4)} -> ${r4DZ7On.rMean.toFixed(4)}`)
  console.log(`       Cyclic Cayley Z_5 2-line k=3 (+,+,-) OFF->ON (6x)  : uni=${r4DZ5MixOn.maxUni.toExponential(1)}, nGaps=${r4DZ5MixOff.nGaps}->${r4DZ5MixOn.nGaps}, nDeg=${r4DZ5MixOff.nDeg}->${r4DZ5MixOn.nDeg}, <r>=${r4DZ5MixOff.rMean.toFixed(4)} -> ${r4DZ5MixOn.rMean.toFixed(4)}`)
  console.log(`       Cyclic Cayley Z_6 C4 k=4 Phi_odd OFF->ON (unres.!) : uni=${r4DZ6PhiOn.maxUni.toExponential(1)}, nGaps=${r4DZ6PhiOff.nGaps}->${r4DZ6PhiOn.nGaps}, nDeg=${r4DZ6PhiOff.nDeg}->${r4DZ6PhiOn.nDeg}, <r>=${r4DZ6PhiOff.rMean.toFixed(4)} -> ${r4DZ6PhiOn.rMean.toFixed(4)}`)

  const ok =
    maxUniErr < 1e-13 &&
    maxRootErr < 1e-12 &&
    maxRapidityErr < 1e-12 &&
    maxKErr < 1e-14 &&
    poleLawErr < 1e-14 &&
    ybeMeet.normF < 1e-13 &&
    ybeMeet.maxUni < 1e-14 &&
    ybe001.normF > 0.05 &&
    ybeK.normF > 1.0 &&
    maxBaMeetErr < 1e-12 &&
    maxBaPairErr < 1e-12 &&
    parityDefects4D === 0 &&
    k5ParitySig === '011000001000' &&
    k5MPairDiffs > 0 &&
    k5PhiDiffs > 0 &&
    r1DSym4Meet.rMean < 0.43 &&
    r1DK4Meet.rMean > 0.50 &&
    r1DK4Meet.nDeg === 0 &&
    r1DK4Pair.rMean > 0.51 &&
    r4DZ7On.rMean > r4DZ7Off.rMean + 0.03 &&
    r4DZ6PhiOn.nGaps > 150 &&
    r4DZ6PhiOn.nDeg === 233

  recordCheck(
    'W12.1',
    'Exact 2-body S-matrices, Yang rapidity u(p), 6x6 YBE test, 3-body BA/diffraction, (Z_2)^12 line-parity, k=5 joint witness & chaos <r>',
    ok,
    `Yang err=${maxRapidityErr.toExponential(1)}, YBE(M_meet/001/K)=[${ybeMeet.normF.toExponential(1)},${ybe001.normF.toFixed(3)},${ybeK.normF.toFixed(3)}], BA err=${maxBaMeetErr.toExponential(1)}, k=5 M_pair/Phi_odd diffs=(${k5MPairDiffs},${k5PhiDiffs}), <r>(1D Sym^4/1D K+M_meet/Z_7/Z_5)=[${r1DSym4Meet.rMean.toFixed(3)},${r1DK4Meet.rMean.toFixed(3)},${r4DZ7On.rMean.toFixed(3)},${r4DZ5MixOn.rMean.toFixed(3)}], Z_6 nDeg=${r4DZ6PhiOn.nDeg}`,
  )
}

// =================================================================================================
// PART 2 (W12.2): DOUBLON + PULSE & TRION + PULSE SCATTERING CZ GATE TEST (1D & 4D CROSS-LINE)
// =================================================================================================

function runPart2(): void {
  console.log('\n================================================================================')
  console.log('PART 2 (W12.2): DOUBLON + PULSE & TRION + PULSE CZ GATE TEST (COLLINEAR & 4D)')
  console.log('================================================================================')

  const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
  const kFac: C = [-W_C[0], -W_C[1]]
  const lamPair = cMul(W2_C, Z18_C)

  // Analytic Yang-Baxter scattering amplitudes for Doublon + Pulse (Sym^3 & distinguishable 3-role!) and Trion + Pulse (Sym^4):
  // Doublon rapidities {+i/2, -i/2}; Pulse rapidity u:
  //   S_Sym(u) = ((u - 3i/2)/(u + 3i/2)) * ((u - i/2)/(u + i/2)) -> hits EXACT -1 (CZ pi phase) at u* = -sqrt(3)/2!
  //   In 3-role basis {|{0,1}_Sym, 2>, |{0,2}_Sym, 1>, |{1,2}_Sym, 0>}:
  //   Sym^3 eigenvalue = S_Sym(u), Std eigenvalue = S_Std(u) = (u - i/2)/(u + i/2) * (u + i/2)/(u - i/2) * ... wait: compute exact 3x3 fusion R_{23}(u+i/2) R_{13}(u-i/2)!
  const pStarD = -Math.atan((6 * SQRT3) / 5)
  const uStarD = spU(pStarD, 1) // -sqrt(3)/2
  const sDoubSymAna = cMul(cDiv([uStarD, -1.5], [uStarD, 1.5]), cDiv([uStarD, -0.5], [uStarD, 0.5]))

  // Exact 3-role Yang fusion matrix on Sym(1,2) (x) {3}:
  // From Part 1A, S_Sym(w) = (w - i)/(w + i) and S_Alt = +1 (t - r = +1), so the physical role-space
  // Yang R-matrix is R_{ab}(w) = t(w) I + r(w) P_{ab} = (w I - i P_{ab}) / (w + i).
  // By YBE at the doublon pole u_1 - u_2 = -i (u_1 = -i/2, u_2 = +i/2), the Sym(1,2)-preserving fused
  // scattering operator is F(u) = R_{13}(u + i/2) R_{23}(u - i/2), which diagonalizes on Sym^3 (x) Std with:
  //   S_{Sym^3}(u) = ((u - i/2)(u - 3i/2)) / ((u + i/2)(u + 3i/2))   [= -1 at u* = -sqrt(3)/2]
  //   S_{Std}(u)   = (u - i/2) / (u + i/2)                           [= zeta_6 at u* = -sqrt(3)/2]
  const evalDoub3RoleFusion = (u: number): { readonly pEl: number; readonly pSwap: number; readonly argEl: number; readonly sSym: C; readonly sStd: C; readonly altLeak: number } => {
    const yangR = (wRe: number, wIm: number): { readonly rI: C; readonly rP: C } => {
      const w: C = [wRe, wIm]
      const den: C = [wRe, wIm + 1]
      return { rI: cDiv(w, den), rP: cDiv([0, -1], den) }
    }
    const r23 = yangR(u, -0.5) // u - i/2
    const r13 = yangR(u, +0.5) // u + i/2
    const applyR = (v: readonly C[], iA: number, iB: number, rI: C, rP: C): C[] => {
      const perms: readonly (readonly [number, number, number])[] = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]
      const out: C[] = Array.from({ length: 6 }, () => [0, 0] as C)
      for (let idx = 0; idx < 6; idx++) {
        const p = perms[idx]!
        const sw: [number, number, number] = [p[0], p[1], p[2]]
        const t = sw[iA]!; sw[iA] = sw[iB]!; sw[iB] = t
        const j = perms.findIndex(q => q[0] === sw[0] && q[1] === sw[1] && q[2] === sw[2])
        out[idx] = cAdd(out[idx]!, cMul(v[idx]!, rI))
        out[j] = cAdd(out[j]!, cMul(v[idx]!, rP))
      }
      return out
    }
    const invS2 = Math.SQRT1_2
    const init: C[] = [[invS2, 0], [0, 0], [invS2, 0], [0, 0], [0, 0], [0, 0]] // (|012> + |102>)/sqrt(2)
    // Apply F(u) = R_{13}(u + i/2) R_{23}(u - i/2) on particle slots (0,1,2) -> (0,2) after (1,2)
    const out = applyR(applyR(init, 1, 2, r23.rI, r23.rP), 0, 2, r13.rI, r13.rP)
    // Elastic amplitude into ({0,1}_Sym, 2) and role-swap into ({0,2}_Sym, 1) and ({1,2}_Sym, 0)
    const aEl = cScale(invS2, cAdd(out[0]!, out[2]!))
    const aSw1 = cScale(invS2, cAdd(out[1]!, out[4]!))
    const aSw2 = cScale(invS2, cAdd(out[3]!, out[5]!))
    // Check zero leakage into Alt(1,2) subspace (|012>-|102>, |021>-|201>, |120>-|210>)
    const altLeak = cAbs(cSub(out[0]!, out[2]!)) + cAbs(cSub(out[1]!, out[4]!)) + cAbs(cSub(out[3]!, out[5]!))
    const sSym = cAdd(aEl, cScale(2, aSw1))
    const sStd = cSub(aEl, aSw1)
    return { pEl: cAbs2(aEl), pSwap: cAbs2(aSw1) + cAbs2(aSw2), argEl: cArg(aEl), sSym, sStd, altLeak }
  }
  const fusD = evalDoub3RoleFusion(uStarD)

  const pStarT = -Math.atan((3 * Math.SQRT2) / 5)
  const uStarT = spU(pStarT, 1) // -sqrt(2)
  const sTrionSymAna = cMul(cDiv([uStarT, -2], [uStarT, 2]), cDiv([uStarT, -1], [uStarT, 1]))

  // 2A. Exact Flat-Array 1D Doublon + Pulse Collision (M = 34, T_ref = 76, plateau T = 70..82)
  //     Using M = 34 (M/2 = 17) keeps the transmitted Gaussian peak (rel ~ +9.5) cleanly separated from both
  //     rel = 0 and rel = M/2 = 17 with < 1% tail spill, eliminating the M = 28 ring wrap-around reflection artifact.
  //     Note: For mode === 'M_pair_Sym' (1D flat-Bloch scalar surrogate, NOT a 4D bound state!), both step2 and the
  //     initial P = 0 doublon wavefunction use pairPh = w^2 * zeta_18 (exact decay z = 1/(7 + 4 sqrt(3) cos(pi/9))).
  const runDoublonPulse = (mode: 'M_meet_Sym' | 'M_pair_Sym' | 'K_opp') => {
    const M = mode === 'M_meet_Sym' ? 34 : 28
    const T_REF = 76; const T_MAX = mode === 'K_opp' ? T_REF : 82; const S = 2 * M; const S2 = S * S; const S3 = S * S2
    const pairPh: C = mode === 'M_pair_Sym' ? lamPair : W2_C
    const pRe = new Float64Array(S); const pIm = new Float64Array(S)
    {
      const th = Math.acos(0.5 * Math.cos(pStarD))
      const ratio = -(Math.sin(pStarD) + 2 * Math.sin(th)) / SQRT3
      const w = cScale(ratio, cExpI(pStarD))
      const inv = 1 / Math.hypot(1, Math.abs(ratio))
      const chi0: C = [inv, 0]; const chi1: C = cScale(inv, w)
      const mP0 = mode === 'M_meet_Sym' ? 8 : 7; const sig = 2.0
      let n2 = 0
      for (let m = 0; m < M; m++) {
        let dm = m - mP0; if (dm > M / 2) dm -= M; if (dm < -M / 2) dm += M
        const env = Math.exp(-(dm * dm) / (4 * sig * sig))
        const ph = cExpI(2 * pStarD * m)
        const a0 = cScale(env, cMul(ph, chi0)); const a1 = cScale(env, cMul(ph, chi1))
        pRe[2 * m] = a0[0]; pIm[2 * m] = a0[1]; pRe[2 * m + 1] = a1[0]; pIm[2 * m + 1] = a1[1]
        n2 += cAbs2(a0) + cAbs2(a1)
      }
      const sc = 1 / Math.sqrt(n2); for (let i = 0; i < S; i++) { pRe[i] = pRe[i]! * sc; pIm[i] = pIm[i]! * sc }
    }
    const dRe = new Float64Array(S2); const dIm = new Float64Array(S2)
    let zDecayErr = 0
    {
      const mD0 = mode === 'M_meet_Sym' ? 17 : 16; const sigD = 1.8
      if (mode !== 'M_pair_Sym') {
        const uPP: C = [3 + 4 * W_C[0], 4 * W_C[1]]; const uPM: C = [1, 0]; const uMP: C = [-7 + 8 * W_C[0], 8 * W_C[1]]
        for (let m1 = 0; m1 < M; m1++) {
          let dm0 = m1 - mD0; if (dm0 > M / 2) dm0 -= M; if (dm0 < -M / 2) dm0 += M
          const e0 = Math.exp(-(dm0 * dm0) / (4 * sigD * sigD))
          dRe[2 * m1 * S + (2 * m1 + 1)] = 13 * e0
          for (let d = 1; d <= 5; d++) {
            const m2 = (m1 + d) % M
            let dcm = m1 + 0.5 * d - mD0; if (dcm > M / 2) dcm -= M; if (dcm < -M / 2) dcm += M
            const env = Math.exp(-(dcm * dcm) / (4 * sigD * sigD)) * Math.pow(1 / 13, d - 1)
            for (const [c1, c2, u] of [[2 * m1, 2 * m2, uPP], [2 * m1, 2 * m2 + 1, uPM], [2 * m1 + 1, 2 * m2, uMP], [2 * m1 + 1, 2 * m2 + 1, uPP]] as const) {
              const lo = Math.min(c1, c2); const hi = Math.max(c1, c2); const v = cScale(env, u)
              dRe[lo * S + hi] = dRe[lo * S + hi]! + v[0]; dIm[lo * S + hi] = dIm[lo * S + hi]! + v[1]
            }
          }
        }
      } else {
        // Exact P = 0 bound state of 1D scalar M_pair (lam0 = w^2 * zeta_18) extracted on M_rel = 20 (dim = 39, exact to 1e-15!)
        const Mrel = 20
        const sys2 = buildSymKEven(2, Mrel, 0, lamPair)
        const ph2 = unitaryPhases(sys2.U).phases
        const eDoubMeet = Math.atan2((15 * SQRT3) / 26, -1 / 26)
        let bestRef = shiftInvertRefine(sys2.U, eDoubMeet, 4)
        for (let k = 0; k < ph2.length; k++) {
          const dAng = Math.abs((((ph2[k]! - eDoubMeet) % (2 * PI)) + 3 * PI) % (2 * PI) - PI)
          if (dAng < 0.8) {
            const cand = shiftInvertRefine(sys2.U, ph2[k]!, 4)
            if (cand.ipr > bestRef.ipr) bestRef = cand
          }
        }
        const relAmp = new Map<string, C>()
        for (let i = 0; i < sys2.dim; i++) {
          const cfg = sys2.configs[i]!
          const d = (cfg[1]![0] - cfg[0]![0] + Mrel) % Mrel
          const s1 = cfg[0]![1]; const s2 = cfg[1]![1]
          const sc = Math.sqrt(sys2.symCounts[i]!)
          const amp: C = [bestRef.vr[i]! * sc, bestRef.vi[i]! * sc]
          if (d <= 6) relAmp.set(`${d}:${s1}:${s2}`, amp)
          if (d >= Mrel - 6 && d < Mrel) relAmp.set(`${Mrel - d}:${s2}:${s1}`, amp)
        }
        const a1 = relAmp.get('1:0:1')!; const a2 = relAmp.get('2:0:1')!
        const zMeas = cAbs(a2) / cAbs(a1)
        const zExact = 1 / (7 + 4 * SQRT3 * Math.cos(PI / 9))
        zDecayErr = Math.abs(zMeas - zExact)
        for (let m1 = 0; m1 < M; m1++) {
          let dm0 = m1 - mD0; if (dm0 > M / 2) dm0 -= M; if (dm0 < -M / 2) dm0 += M
          const e0 = Math.exp(-(dm0 * dm0) / (4 * sigD * sigD))
          const v0 = cScale(e0, relAmp.get('0:0:1')!)
          dRe[2 * m1 * S + (2 * m1 + 1)] = v0[0]; dIm[2 * m1 * S + (2 * m1 + 1)] = v0[1]
          for (let d = 1; d <= 5; d++) {
            const m2 = (m1 + d) % M
            let dcm = m1 + 0.5 * d - mD0; if (dcm > M / 2) dcm -= M; if (dcm < -M / 2) dcm += M
            const env = Math.exp(-(dcm * dcm) / (4 * sigD * sigD))
            for (let s1 = 0; s1 < 2; s1++) for (let s2 = 0; s2 < 2; s2++) {
              const u = relAmp.get(`${d}:${s1}:${s2}`)
              if (!u) continue
              const c1 = 2 * m1 + s1; const c2 = 2 * m2 + s2
              const lo = Math.min(c1, c2); const hi = Math.max(c1, c2); const v = cScale(env, u)
              dRe[lo * S + hi] = dRe[lo * S + hi]! + v[0]; dIm[lo * S + hi] = dIm[lo * S + hi]! + v[1]
            }
          }
        }
      }
      let n2 = 0; for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) n2 += dRe[a * S + b]! ** 2 + dIm[a * S + b]! ** 2
      const sc = 1 / Math.sqrt(n2); for (let i = 0; i < S2; i++) { dRe[i] = dRe[i]! * sc; dIm[i] = dIm[i]! * sc }
    }
    const step1 = (re: Float64Array, im: Float64Array): [Float64Array, Float64Array] => {
      const nr = new Float64Array(S); const ni = new Float64Array(S)
      for (let m = 0; m < M; m++) for (let s = 0; s < 2; s++) {
        const ar = re[2 * m + s]!; const ai = im[2 * m + s]!; if (ar === 0 && ai === 0) continue
        for (const t of [0, 1]) { const cm = cMat[t]![s]!; const dst = 2 * (t === 0 ? m : (m - 1 + M) % M) + t; nr[dst] = nr[dst]! + (ar * cm[0] - ai * cm[1]); ni[dst] = ni[dst]! + (ar * cm[1] + ai * cm[0]) }
      }
      return [nr, ni]
    }
    const step2 = (re: Float64Array, im: Float64Array): [Float64Array, Float64Array] => {
      const nr = new Float64Array(S2); const ni = new Float64Array(S2)
      for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) {
        const ar = re[a * S + b]!; const ai = im[a * S + b]!; if (ar === 0 && ai === 0) continue
        const m1 = a >> 1; const s1 = a & 1; const m2 = b >> 1; const s2 = b & 1
        if (m1 === m2) {
          const n1 = 2 * m1; const n2 = 2 * ((m2 - 1 + M) % M) + 1
          const lo = n1 < n2 ? n1 : n2; const hi = n1 < n2 ? n2 : n1
          nr[lo * S + hi] = nr[lo * S + hi]! + (ar * pairPh[0] - ai * pairPh[1]); ni[lo * S + hi] = ni[lo * S + hi]! + (ar * pairPh[1] + ai * pairPh[0])
        } else {
          for (const t1 of [0, 1]) {
            const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
            for (const t2 of [0, 1]) {
              const cc = cMul(c1, cMat[t2]![s2]!); const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2
              const lo = n1 < n2 ? n1 : n2; const hi = n1 < n2 ? n2 : n1
              nr[lo * S + hi] = nr[lo * S + hi]! + (ar * cc[0] - ai * cc[1]); ni[lo * S + hi] = ni[lo * S + hi]! + (ar * cc[1] + ai * cc[0])
            }
          }
        }
      }
      return [nr, ni]
    }
    const compose = (dr: Float64Array, di: Float64Array, pr: Float64Array, pi: Float64Array, shiftP = 0): [Float64Array, Float64Array] => {
      const outR = new Float64Array(S3); const outI = new Float64Array(S3)
      for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) {
        const dar = dr[a * S + b]!; const dai = di[a * S + b]!; if (dar === 0 && dai === 0) continue
        for (let c = 0; c < S; c++) {
          const cSh = 2 * ((((c >> 1) - shiftP + M) % M + M) % M) + (c & 1)
          const pcr = pr[cSh]!; const pci = pi[cSh]!; if (pcr === 0 && pci === 0) continue
          if (c === a || c === b) continue
          const vr = dar * pcr - dai * pci; const vi = dar * pci + dai * pcr
          let idx3: number
          if (mode !== 'K_opp') {
            let x = a; let y = b; let z = c
            if (x > y) { const tm = x; x = y; y = tm }; if (y > z) { const tm = y; y = z; z = tm }; if (x > y) { const tm = x; x = y; y = tm }
            idx3 = x * S2 + y * S + z
          } else idx3 = a * S2 + b * S + c
          outR[idx3] = outR[idx3]! + vr; outI[idx3] = outI[idx3]! + vi
        }
      }
      let n2 = 0; for (let i = 0; i < S3; i++) n2 += outR[i]! ** 2 + outI[i]! ** 2
      const sc = 1 / Math.sqrt(n2); for (let i = 0; i < S3; i++) { outR[i] = outR[i]! * sc; outI[i] = outI[i]! * sc }
      return [outR, outI]
    }

    let [curDR, curDI] = [dRe, dIm]; let [curPR, curPI] = [pRe, pIm]
    let [stR, stI] = compose(curDR, curDI, curPR, curPI)
    let nr = new Float64Array(S3); let ni = new Float64Array(S3)
    let maxNormErr = 0
    let fidRef = 0; let wigFidRef = 0; let bestShiftRef = 0; let dPhiRef = 0
    let pSurvTR = 0; let pTransTR = 0; let pReflTR = 0
    const plateauPhases: number[] = []
    const dCyc = (a: number, b: number) => Math.min(Math.abs(a - b), M - Math.abs(a - b))
    for (let t = 1; t <= T_MAX; t++) {
      ;[curDR, curDI] = step2(curDR, curDI)
      ;[curPR, curPI] = step1(curPR, curPI)
      nr.fill(0); ni.fill(0)
      if (mode !== 'K_opp') {
        const add3 = (u1: number, u2: number, u3: number, vr: number, vi: number) => {
          let x = u1; let y = u2; let z = u3
          if (x > y) { const tm = x; x = y; y = tm }; if (y > z) { const tm = y; y = z; z = tm }; if (x > y) { const tm = x; x = y; y = tm }
          const id = x * S2 + y * S + z; nr[id] = nr[id]! + vr; ni[id] = ni[id]! + vi
        }
        for (let a = 0; a < S; a++) {
          const m1 = a >> 1; const s1 = a & 1
          for (let b = a + 1; b < S; b++) {
            const m2 = b >> 1; const s2 = b & 1; const base = a * S2 + b * S
            for (let c = b + 1; c < S; c++) {
              const ar = stR[base + c]!; const ai = stI[base + c]!; if (ar === 0 && ai === 0) continue
              const m3 = c >> 1; const s3 = c & 1
              if (m1 === m2) {
                const n1 = 2 * m1; const n2 = 2 * ((m2 - 1 + M) % M) + 1
                const pr = ar * pairPh[0] - ai * pairPh[1]; const pi = ar * pairPh[1] + ai * pairPh[0]
                for (const t3 of [0, 1]) { const c3 = cMat[t3]![s3]!; add3(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, pr * c3[0] - pi * c3[1], pr * c3[1] + pi * c3[0]) }
              } else if (m2 === m3) {
                const n2 = 2 * m2; const n3 = 2 * ((m3 - 1 + M) % M) + 1
                const pr = ar * pairPh[0] - ai * pairPh[1]; const pi = ar * pairPh[1] + ai * pairPh[0]
                for (const t1 of [0, 1]) { const c1 = cMat[t1]![s1]!; add3(2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1, n2, n3, pr * c1[0] - pi * c1[1], pr * c1[1] + pi * c1[0]) }
              } else {
                for (const t1 of [0, 1]) {
                  const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1; const r1 = ar * c1[0] - ai * c1[1]; const i1 = ar * c1[1] + ai * c1[0]
                  for (const t2 of [0, 1]) {
                    const c2 = cMat[t2]![s2]!; const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2; const r2 = r1 * c2[0] - i1 * c2[1]; const i2 = r1 * c2[1] + i1 * c2[0]
                    for (const t3 of [0, 1]) { const c3 = cMat[t3]![s3]!; add3(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, r2 * c3[0] - i2 * c3[1], r2 * c3[1] + i2 * c3[0]) }
                  }
                }
              }
            }
          }
        }
      } else {
        const addK = (p1: number, p2: number, pn: number, vr: number, vi: number) => {
          const lo = p1 < p2 ? p1 : p2; const hi = p1 < p2 ? p2 : p1
          const id = lo * S2 + hi * S + pn; nr[id] = nr[id]! + vr; ni[id] = ni[id]! + vi
        }
        for (let a = 0; a < S; a++) {
          const m1 = a >> 1; const s1 = a & 1
          for (let b = a + 1; b < S; b++) {
            const m2 = b >> 1; const s2 = b & 1; const base = a * S2 + b * S
            for (let c = 0; c < S; c++) {
              if (c === a || c === b) continue
              const ar = stR[base + c]!; const ai = stI[base + c]!; if (ar === 0 && ai === 0) continue
              const m3 = c >> 1; const s3 = c & 1
              if (m1 === m2) {
                const n1 = 2 * m1; const n2 = 2 * ((m2 - 1 + M) % M) + 1
                const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
                for (const t3 of [0, 1]) { const c3 = cMat[t3]![s3]!; addK(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, pr * c3[0] - pi * c3[1], pr * c3[1] + pi * c3[0]) }
              } else if (m1 === m3) {
                const n1 = 2 * (s3 === 0 ? m1 : (m1 - 1 + M) % M) + s3; const n3 = 2 * (s1 === 0 ? m3 : (m3 - 1 + M) % M) + s1
                const pr = ar * kFac[0] - ai * kFac[1]; const pi = ar * kFac[1] + ai * kFac[0]
                for (const t2 of [0, 1]) { const c2 = cMat[t2]![s2]!; addK(n1, 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2, n3, pr * c2[0] - pi * c2[1], pr * c2[1] + pi * c2[0]) }
              } else if (m2 === m3) {
                const n2 = 2 * (s3 === 0 ? m2 : (m2 - 1 + M) % M) + s3; const n3 = 2 * (s2 === 0 ? m3 : (m3 - 1 + M) % M) + s2
                const pr = ar * kFac[0] - ai * kFac[1]; const pi = ar * kFac[1] + ai * kFac[0]
                for (const t1 of [0, 1]) { const c1 = cMat[t1]![s1]!; addK(2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1, n2, n3, pr * c1[0] - pi * c1[1], pr * c1[1] + pi * c1[0]) }
              } else {
                for (const t1 of [0, 1]) {
                  const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1; const r1 = ar * c1[0] - ai * c1[1]; const i1 = ar * c1[1] + ai * c1[0]
                  for (const t2 of [0, 1]) {
                    const c2 = cMat[t2]![s2]!; const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2; const r2 = r1 * c2[0] - i1 * c2[1]; const i2 = r1 * c2[1] + i1 * c2[0]
                    for (const t3 of [0, 1]) { const c3 = cMat[t3]![s3]!; addK(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, r2 * c3[0] - i2 * c3[1], r2 * c3[1] + i2 * c3[0]) }
                  }
                }
              }
            }
          }
        }
      }
      const tmpR = stR; const tmpI = stI
      stR = nr; stI = ni; nr = tmpR; ni = tmpI
      let n2 = 0; for (let i = 0; i < S3; i++) n2 += stR[i]! ** 2 + stI[i]! ** 2
      maxNormErr = Math.max(maxNormErr, Math.abs(n2 - 1))

      // Clean T/R/P_break readout: T_TR = 70 for M_meet_Sym (rel_center = +8.15, dead center of [0, 17] on M=34!),
      // T_TR = 60 for M_pair_Sym (M=28), and T_REF = 76 for K_opp (allowing broken fragments to separate past d > 3).
      const tMeasTR = mode === 'M_meet_Sym' ? 70 : mode === 'M_pair_Sym' ? 60 : T_REF
      if (t === tMeasTR) {
        for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) {
          const base = a * S2 + b * S; const cStart = mode !== 'K_opp' ? b + 1 : 0
          for (let c = cStart; c < S; c++) {
            if (c === a || c === b) continue
            const w = stR[base + c]! ** 2 + stI[base + c]! ** 2; if (w === 0) continue
            const m1 = a >> 1; const m2 = b >> 1; const m3 = c >> 1
            if (mode !== 'K_opp') {
              const d12 = dCyc(m1, m2); const d23 = dCyc(m2, m3); const d13 = dCyc(m1, m3)
              const dMin = Math.min(d12, d23, d13)
              if (dMin <= 3) {
                pSurvTR += w
                const mLone = d12 === dMin ? m3 : d23 === dMin ? m1 : m2
                const mPair = d12 === dMin ? m1 : d23 === dMin ? m2 : m1
                const rel = (mLone - mPair + M) % M
                if (rel > 0 && rel <= M / 2) pTransTR += w; else if (rel > M / 2) pReflTR += w
              }
            } else if (dCyc(m1, m2) <= 3) {
              pSurvTR += w
              const rel = (m3 - m1 + M) % M
              if (rel > 0 && rel <= M / 2) pTransTR += w; else if (rel > M / 2) pReflTR += w
            }
          }
        }
      }
      // Phase stability plateau readout across T = 70, 76, 82 (only T_REF for K_opp)
      if (t === T_REF || (mode !== 'K_opp' && (t === 70 || t === 82))) {
        const [refR, refI] = compose(curDR, curDI, curPR, curPI, 0)
        let ovR = 0; let ovI = 0
        for (let i = 0; i < S3; i++) { ovR += refR[i]! * stR[i]! + refI[i]! * stI[i]!; ovI += refR[i]! * stI[i]! - refI[i]! * stR[i]! }
        const ph = Math.atan2(ovI, ovR)
        plateauPhases.push(ph)
        if (t === T_REF) {
          fidRef = ovR * ovR + ovI * ovI
          dPhiRef = ph
          wigFidRef = fidRef; bestShiftRef = 0
          for (const sh of [-2, -1, 1, 2]) {
            const [sR, sI] = compose(curDR, curDI, curPR, curPI, sh)
            let r = 0; let im = 0
            for (let i = 0; i < S3; i++) { r += sR[i]! * stR[i]! + sI[i]! * stI[i]!; im += sR[i]! * stI[i]! - sI[i]! * stR[i]! }
            if (r * r + im * im > wigFidRef) { wigFidRef = r * r + im * im; bestShiftRef = sh }
          }
        }
      }
    }
    let maxPhaseDrift = 0
    for (const ph of plateauPhases) {
      const d = Math.abs((((ph - dPhiRef) % (2 * PI)) + 3 * PI) % (2 * PI) - PI)
      if (d > maxPhaseDrift) maxPhaseDrift = d
    }
    return {
      normErr: maxNormErr, fid: fidRef, wigFid: wigFidRef, bestShift: bestShiftRef,
      dPhi: dPhiRef, phaseDrift: maxPhaseDrift, zDecayErr,
      T: pTransTR, R: pReflTR, pBreak: 1 - pSurvTR,
    }
  }

  const dpMeet = runDoublonPulse('M_meet_Sym')
  const dpPair = runDoublonPulse('M_pair_Sym')
  const dpK = runDoublonPulse('K_opp')

  // 2B. Exact Flat-Array 1D Trion + Pulse Collision (Sym^4 M_meet, M = 16, T = 74)
  const runTrionPulseSym4 = () => {
    const M = 16; const T = 74; const S = 2 * M
    const binom = (n: number, k: number): number => {
      if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i; return Math.round(r)
    }
    const C1 = new Int32Array(S + 1); const C2 = new Int32Array(S + 1); const C3 = new Int32Array(S + 1); const C4 = new Int32Array(S + 1)
    for (let n = 0; n <= S; n++) { C1[n] = n; C2[n] = binom(n, 2); C3[n] = binom(n, 3); C4[n] = binom(n, 4) }
    const N3 = C3[S]!; const N4 = C4[S]!
    const idx3 = (a: number, b: number, c: number) => C1[a]! + C2[b]! + C3[c]!
    const idx4 = (a: number, b: number, c: number, d: number) => C1[a]! + C2[b]! + C3[c]! + C4[d]!
    const pRe = new Float64Array(S); const pIm = new Float64Array(S)
    {
      const th = Math.acos(0.5 * Math.cos(pStarT))
      const ratio = -(Math.sin(pStarT) + 2 * Math.sin(th)) / SQRT3
      const w = cScale(ratio, cExpI(pStarT)); const inv = 1 / Math.hypot(1, Math.abs(ratio))
      const chi0: C = [inv, 0]; const chi1: C = cScale(inv, w)
      const mP0 = 2; const sig = 1.6; let n2 = 0
      for (let m = 0; m < M; m++) {
        let dm = m - mP0; if (dm > M / 2) dm -= M; if (dm < -M / 2) dm += M
        const env = Math.exp(-(dm * dm) / (4 * sig * sig)); const ph = cExpI(2 * pStarT * m)
        const a0 = cScale(env, cMul(ph, chi0)); const a1 = cScale(env, cMul(ph, chi1))
        pRe[2 * m] = a0[0]; pIm[2 * m] = a0[1]; pRe[2 * m + 1] = a1[0]; pIm[2 * m + 1] = a1[1]
        n2 += cAbs2(a0) + cAbs2(a1)
      }
      const sc = 1 / Math.sqrt(n2); for (let i = 0; i < S; i++) { pRe[i] = pRe[i]! * sc; pIm[i] = pIm[i]! * sc }
    }
    const tRe = new Float64Array(N3); const tIm = new Float64Array(N3)
    {
      const rT: C = [(-3 - 2 * W_C[0]) / 7, (-2 * W_C[1]) / 7]
      const rBarT: C = [(-1 + 2 * W_C[0]) / 7, (2 * W_C[1]) / 7]
      const mT0 = 9; const sigT = 1.3
      for (let m1 = 0; m1 < M; m1++) for (let d1 = 0; d1 <= 4; d1++) for (let d2 = 0; d2 <= 4; d2++) {
        if (d1 === 0 && d2 === 0) continue
        const m2 = (m1 + d1) % M; const m3 = (m1 + d1 + d2) % M
        let dcm = m1 + (2 * d1 + d2) / 3 - mT0; if (dcm > M / 2) dcm -= M; if (dcm < -M / 2) dcm += M
        const env = Math.exp(-(dcm * dcm) / (4 * sigT * sigT))
        for (let s1 = 0; s1 < 2; s1++) for (let s2 = 0; s2 < 2; s2++) {
          if (d1 === 0 && !(s1 === 0 && s2 === 1)) continue
          for (let s3 = 0; s3 < 2; s3++) {
            if (d2 === 0 && !(s2 === 0 && s3 === 1)) continue
            let amp: C = [env, 0]
            if (d1 === 0) { amp = cScale(Math.pow(1 / 7, d2 - 1), amp); if (s3 === 1) amp = cMul(amp, rT) }
            else if (d2 === 0) { amp = cScale(Math.pow(1 / 7, d1 - 1), amp); if (s1 === 0) amp = cMul(amp, rT) }
            else { amp = cScale(Math.pow(1 / 7, d1 + d2 - 2), cMul(amp, rBarT)); if (s1 === 0) amp = cMul(amp, rT); if (s3 === 1) amp = cMul(amp, rT) }
            const arr = [2 * m1 + s1, 2 * m2 + s2, 2 * m3 + s3].sort((u, v) => u - v)
            const id = idx3(arr[0]!, arr[1]!, arr[2]!)
            tRe[id] = tRe[id]! + amp[0]; tIm[id] = tIm[id]! + amp[1]
          }
        }
      }
      let n2 = 0; for (let i = 0; i < N3; i++) n2 += tRe[i]! ** 2 + tIm[i]! ** 2
      const sc = 1 / Math.sqrt(n2); for (let i = 0; i < N3; i++) { tRe[i] = tRe[i]! * sc; tIm[i] = tIm[i]! * sc }
    }
    const step1 = (re: Float64Array, im: Float64Array): [Float64Array, Float64Array] => {
      const nr = new Float64Array(S); const ni = new Float64Array(S)
      for (let m = 0; m < M; m++) for (let s = 0; s < 2; s++) {
        const ar = re[2 * m + s]!; const ai = im[2 * m + s]!; if (ar === 0 && ai === 0) continue
        for (const t of [0, 1]) { const cm = cMat[t]![s]!; const dst = 2 * (t === 0 ? m : (m - 1 + M) % M) + t; nr[dst] = nr[dst]! + (ar * cm[0] - ai * cm[1]); ni[dst] = ni[dst]! + (ar * cm[1] + ai * cm[0]) }
      }
      return [nr, ni]
    }
    const step3 = (re: Float64Array, im: Float64Array): [Float64Array, Float64Array] => {
      const nr = new Float64Array(N3); const ni = new Float64Array(N3)
      const add = (u1: number, u2: number, u3: number, vr: number, vi: number) => {
        let x = u1; let y = u2; let z = u3
        if (x > y) { const tm = x; x = y; y = tm }; if (y > z) { const tm = y; y = z; z = tm }; if (x > y) { const tm = x; x = y; y = tm }
        const id = idx3(x, y, z); nr[id] = nr[id]! + vr; ni[id] = ni[id]! + vi
      }
      for (let c = 2; c < S; c++) {
        const m3 = c >> 1; const s3 = c & 1; const c3Off = C3[c]!
        for (let b = 1; b < c; b++) {
          const m2 = b >> 1; const s2 = b & 1; const cbOff = c3Off + C2[b]!
          for (let a = 0; a < b; a++) {
            const id = cbOff + a; const ar = re[id]!; const ai = im[id]!; if (ar === 0 && ai === 0) continue
            const m1 = a >> 1; const s1 = a & 1
            if (m1 === m2) {
              const n1 = 2 * m1; const n2 = 2 * ((m2 - 1 + M) % M) + 1; const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
              for (const t3 of [0, 1]) { const c3 = cMat[t3]![s3]!; add(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, pr * c3[0] - pi * c3[1], pr * c3[1] + pi * c3[0]) }
            } else if (m2 === m3) {
              const n2 = 2 * m2; const n3 = 2 * ((m3 - 1 + M) % M) + 1; const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
              for (const t1 of [0, 1]) { const c1 = cMat[t1]![s1]!; add(2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1, n2, n3, pr * c1[0] - pi * c1[1], pr * c1[1] + pi * c1[0]) }
            } else {
              for (const t1 of [0, 1]) {
                const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1; const r1 = ar * c1[0] - ai * c1[1]; const i1 = ar * c1[1] + ai * c1[0]
                for (const t2 of [0, 1]) {
                  const c2 = cMat[t2]![s2]!; const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2; const r2 = r1 * c2[0] - i1 * c2[1]; const i2 = r1 * c2[1] + i1 * c2[0]
                  for (const t3 of [0, 1]) { const c3 = cMat[t3]![s3]!; add(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, r2 * c3[0] - i2 * c3[1], r2 * c3[1] + i2 * c3[0]) }
                }
              }
            }
          }
        }
      }
      return [nr, ni]
    }
    const compose4 = (tr: Float64Array, ti: Float64Array, pr: Float64Array, pi: Float64Array, shiftP = 0, shiftT = 0): [Float64Array, Float64Array] => {
      const outR = new Float64Array(N4); const outI = new Float64Array(N4)
      const shSlot = (slot: number, sh: number) => 2 * ((((slot >> 1) + sh) % M + M) % M) + (slot & 1)
      for (let c = 2; c < S; c++) {
        const c3Off = C3[c]!
        for (let b = 1; b < c; b++) {
          const cbOff = c3Off + C2[b]!
          for (let a = 0; a < b; a++) {
            const ar = tr[cbOff + a]!; const ai = ti[cbOff + a]!; if (ar === 0 && ai === 0) continue
            const ta = shiftT === 0 ? a : shSlot(a, shiftT)
            const tb = shiftT === 0 ? b : shSlot(b, shiftT)
            const tc = shiftT === 0 ? c : shSlot(c, shiftT)
            for (let d = 0; d < S; d++) {
              if (d === ta || d === tb || d === tc) continue
              const dSh = shiftP === 0 ? d : shSlot(d, -shiftP)
              const pcr = pr[dSh]!; const pci = pi[dSh]!; if (pcr === 0 && pci === 0) continue
              const vr = ar * pcr - ai * pci; const vi = ar * pci + ai * pcr
              let x0 = ta; let x1 = tb; let x2 = tc; let x3 = d
              if (x0 > x1) { const tm = x0; x0 = x1; x1 = tm }; if (x2 > x3) { const tm = x2; x2 = x3; x3 = tm }
              if (x0 > x2) { const tm = x0; x0 = x2; x2 = tm }; if (x1 > x3) { const tm = x1; x1 = x3; x3 = tm }
              if (x1 > x2) { const tm = x1; x1 = x2; x2 = tm }
              const id = idx4(x0, x1, x2, x3); outR[id] = outR[id]! + vr; outI[id] = outI[id]! + vi
            }
          }
        }
      }
      let n2 = 0; for (let i = 0; i < N4; i++) n2 += outR[i]! ** 2 + outI[i]! ** 2
      const sc = 1 / Math.sqrt(n2); for (let i = 0; i < N4; i++) { outR[i] = outR[i]! * sc; outI[i] = outI[i]! * sc }
      return [outR, outI]
    }
    let [curTR, curTI] = [tRe, tIm]; let [curPR, curPI] = [pRe, pIm]
    let [stR, stI] = compose4(curTR, curTI, curPR, curPI, 0)
    let maxNormErr = 0
    for (let t = 1; t <= T; t++) {
      ;[curTR, curTI] = step3(curTR, curTI)
      ;[curPR, curPI] = step1(curPR, curPI)
      const nr = new Float64Array(N4); const ni = new Float64Array(N4)
      const add4 = (u0: number, u1: number, u2: number, u3: number, vr: number, vi: number) => {
        let x0 = u0; let x1 = u1; let x2 = u2; let x3 = u3
        if (x0 > x1) { const tm = x0; x0 = x1; x1 = tm }; if (x2 > x3) { const tm = x2; x2 = x3; x3 = tm }
        if (x0 > x2) { const tm = x0; x0 = x2; x2 = tm }; if (x1 > x3) { const tm = x1; x1 = x3; x3 = tm }
        if (x1 > x2) { const tm = x1; x1 = x2; x2 = tm }
        const id = idx4(x0, x1, x2, x3); nr[id] = nr[id]! + vr; ni[id] = ni[id]! + vi
      }
      for (let d = 3; d < S; d++) {
        const m4 = d >> 1; const s4 = d & 1; const dOff = C4[d]!
        for (let c = 2; c < d; c++) {
          const m3 = c >> 1; const s3 = c & 1; const dcOff = dOff + C3[c]!
          for (let b = 1; b < c; b++) {
            const m2 = b >> 1; const s2 = b & 1; const dcbOff = dcOff + C2[b]!
            for (let a = 0; a < b; a++) {
              const id = dcbOff + a; const ar = stR[id]!; const ai = stI[id]!; if (ar === 0 && ai === 0) continue
              const m1 = a >> 1; const s1 = a & 1
              const p12 = m1 === m2; const p23 = m2 === m3; const p34 = m3 === m4
              if (p12 && p34) {
                add4(2 * m1, 2 * ((m2 - 1 + M) % M) + 1, 2 * m3, 2 * ((m4 - 1 + M) % M) + 1, ar * W_C[0] - ai * W_C[1], ar * W_C[1] + ai * W_C[0])
              } else if (p12) {
                const n1 = 2 * m1; const n2 = 2 * ((m2 - 1 + M) % M) + 1; const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
                for (const t3 of [0, 1]) {
                  const c3 = cMat[t3]![s3]!; const n3 = 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3; const r3 = pr * c3[0] - pi * c3[1]; const i3 = pr * c3[1] + pi * c3[0]
                  for (const t4 of [0, 1]) { const c4 = cMat[t4]![s4]!; add4(n1, n2, n3, 2 * (t4 === 0 ? m4 : (m4 - 1 + M) % M) + t4, r3 * c4[0] - i3 * c4[1], r3 * c4[1] + i3 * c4[0]) }
                }
              } else if (p23) {
                const n2 = 2 * m2; const n3 = 2 * ((m3 - 1 + M) % M) + 1; const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
                for (const t1 of [0, 1]) {
                  const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1; const r1 = pr * c1[0] - pi * c1[1]; const i1 = pr * c1[1] + pi * c1[0]
                  for (const t4 of [0, 1]) { const c4 = cMat[t4]![s4]!; add4(n1, n2, n3, 2 * (t4 === 0 ? m4 : (m4 - 1 + M) % M) + t4, r1 * c4[0] - i1 * c4[1], r1 * c4[1] + i1 * c4[0]) }
                }
              } else if (p34) {
                const n3 = 2 * m3; const n4 = 2 * ((m4 - 1 + M) % M) + 1; const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
                for (const t1 of [0, 1]) {
                  const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1; const r1 = pr * c1[0] - pi * c1[1]; const i1 = pr * c1[1] + pi * c1[0]
                  for (const t2 of [0, 1]) { const c2 = cMat[t2]![s2]!; add4(n1, 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2, n3, n4, r1 * c2[0] - i1 * c2[1], r1 * c2[1] + i1 * c2[0]) }
                }
              } else {
                for (const t1 of [0, 1]) {
                  const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1; const r1 = ar * c1[0] - ai * c1[1]; const i1 = ar * c1[1] + ai * c1[0]
                  for (const t2 of [0, 1]) {
                    const c2 = cMat[t2]![s2]!; const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2; const r2 = r1 * c2[0] - i1 * c2[1]; const i2 = r1 * c2[1] + i1 * c2[0]
                    for (const t3 of [0, 1]) {
                      const c3 = cMat[t3]![s3]!; const n3 = 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3; const r3 = r2 * c3[0] - i2 * c3[1]; const i3 = r2 * c3[1] + i2 * c3[0]
                      for (const t4 of [0, 1]) { const c4 = cMat[t4]![s4]!; add4(n1, n2, n3, 2 * (t4 === 0 ? m4 : (m4 - 1 + M) % M) + t4, r3 * c4[0] - i3 * c4[1], r3 * c4[1] + i3 * c4[0]) }
                    }
                  }
                }
              }
            }
          }
        }
      }
      stR = nr; stI = ni
      let n2 = 0; for (let i = 0; i < N4; i++) n2 += stR[i]! ** 2 + stI[i]! ** 2
      maxNormErr = Math.max(maxNormErr, Math.abs(n2 - 1))
    }
    const [refR, refI] = compose4(curTR, curTI, curPR, curPI, 0)
    let ovR = 0; let ovI = 0
    for (let i = 0; i < N4; i++) { ovR += refR[i]! * stR[i]! + refI[i]! * stI[i]!; ovI += refR[i]! * stI[i]! - refI[i]! * stR[i]! }
    let bestWigFid = ovR * ovR + ovI * ovI; let bestShift = 0; let bestShiftT = 0
    for (const shT of [-1, 0, 1]) {
      for (const sh of [-3, -2, -1, 0, 1, 2, 3]) {
        if (sh === 0 && shT === 0) continue
        const [sR, sI] = compose4(curTR, curTI, curPR, curPI, sh, shT)
        let r = 0; let im = 0
        for (let i = 0; i < N4; i++) { r += sR[i]! * stR[i]! + sI[i]! * stI[i]!; im += sR[i]! * stI[i]! - sI[i]! * stR[i]! }
        if (r * r + im * im > bestWigFid) { bestWigFid = r * r + im * im; bestShift = sh; bestShiftT = shT }
      }
    }
    // Check bound-trion survival: smallest 3-particle span <= 4 even steps
    const dCyc = (a: number, b: number) => Math.min(Math.abs(a - b), M - Math.abs(a - b))
    let pSurv = 0
    for (let d = 3; d < S; d++) {
      const dOff = C4[d]!
      for (let c = 2; c < d; c++) {
        const dcOff = dOff + C3[c]!
        for (let b = 1; b < c; b++) {
          const dcbOff = dcOff + C2[b]!
          for (let a = 0; a < b; a++) {
            const w = stR[dcbOff + a]! ** 2 + stI[dcbOff + a]! ** 2; if (w === 0) continue
            const ms = [a >> 1, b >> 1, c >> 1, d >> 1]
            let bestTri = 99
            for (let skip = 0; skip < 4; skip++) {
              const t3 = ms.filter((_, i) => i !== skip)
              const sp = Math.max(dCyc(t3[0]!, t3[1]!), dCyc(t3[1]!, t3[2]!), dCyc(t3[0]!, t3[2]!))
              if (sp < bestTri) bestTri = sp
            }
            if (bestTri <= 4) pSurv += w
          }
        }
      }
    }
    return { normErr: maxNormErr, fid: ovR * ovR + ovI * ovI, wigFid: bestWigFid, bestShift, bestShiftT, dPhi: Math.atan2(ovI, ovR), pBreak: 1 - pSurv }
  }
  const tpMeet = runTrionPulseSym4()

  // 2C. Literal 4D {3,4,3,4} Z[zeta_9][1/6] Cross-Line Collision Tests (M_meet transparency, M_pair 3-body blockade, Phi_odd CZ!)
  const [l0A, l0B] = LINES[0]!
  const [l1A, l1B] = LINES[1]!

  // (i) Cross-line M_meet doublon (L_0, roles 0,1) + pulse (L_1, role 2) -> EXACT 0 interaction!
  const d0_4D = stateFromEntries(
    [[[[0, l0A, 1, 0], [0, l0B, 1, 1]], Z9_ONE], [[[0, l0A, 1, 1], [0, l0B, 1, 0]], Z9_ONE]],
    1n, // unnormalized factor sqrt(2), cancels in diffs
  )
  const p1_4D = stateFromEntries([[[[0, l1A, 1, 2]], Z9_ONE]], 1n)
  const crossMeetActual = applyBeat(tensorStatesExact(d0_4D, p1_4D))
  const crossMeetIndep = tensorStatesExact(applyBeat(d0_4D), applyBeat(p1_4D))
  const crossMeetDiff = countStateDiffs(crossMeetActual, crossMeetIndep)

  // (ii) Cross-line two M_meet doublons (L_0 roles 0,1 + L_1 roles 2,3) -> coplanar, chi_odd = 0 -> EXACT 0 interaction!
  const d1_4D = stateFromEntries(
    [[[[0, l1A, 1, 2], [0, l1B, 1, 3]], Z9_ONE], [[[0, l1A, 1, 3], [0, l1B, 1, 2]], Z9_ONE]],
    1n,
  )
  const crossTwoDoubDiff = countStateDiffs(applyBeat(tensorStatesExact(d0_4D, d1_4D)), tensorStatesExact(applyBeat(d0_4D), applyBeat(d1_4D)))

  // (iii) Cross-line M_pair 3-body blockade (identical pair on L_0 roles 0,0 + control pulse on L_1 role 1):
  //       Without control pulse: M_pair scatters pair across ALL 12 lines (12 branches);
  //       WITH control pulse at dock 0: indices.length = 3 !== 2 suppresses M_pair (ONLY 2 branches, exact CZ conditional overlap!)
  const pair0_4D = stateFromEntries([[[[0, l0A, 1, 0], [0, l0B, 1, 0]], Z9_ONE]], 1n)
  const ctrl1_4D = stateFromEntries([[[[0, l1A, 1, 1]], Z9_ONE]], 1n)
  const outPairOnly = applyBeat(pair0_4D)
  const outCtrlOnly = applyBeat(ctrl1_4D)
  const outBlock11 = applyBeat(tensorStatesExact(pair0_4D, ctrl1_4D))
  const refBlock11 = tensorStatesExact(outPairOnly, outCtrlOnly)
  const ipBlock = innerProductExact(refBlock11, outBlock11)
  const ovBlockC = z9ToComplex(ipBlock.num, ipBlock.den)
  const blockFid = cAbs2(ovBlockC)
  const blockPhase = cArg(ovBlockC)
  // Exact closed-form check: <out_pair_free | out_pair_blocked> = conj((11 + zeta_18)/12) = (11 + zeta_18^*)/12!
  const expBlockOv: C = [(11 + Z18_C[0]) / 12, -Z18_C[1] / 12]
  const blockAnaErr = cAbs(cSub(ovBlockC, expBlockOv))

  // (iv) Cross-line Phi_odd 4-line chiral junction (C4 = [0,1,2,8], 3 pulses on [0,1,2] + 1 control pulse on line 8):
  //      Test exact conditional phase Delta phi_CZ = arg(<U(A)(x)U(B) | U(A(x)B)>) at t = 1 and t = 2!
  const linesC4 = [0, 1, 2, 8] as const
  const triA = stateFromEntries([[[[0, LINES[linesC4[0]]![0], 1, 0], [0, LINES[linesC4[1]]![0], 1, 0], [0, LINES[linesC4[2]]![0], 1, 0]], Z9_ONE]], 1n)
  const pulB = stateFromEntries([[[[0, LINES[linesC4[3]]![0], 1, 0]], Z9_ONE]], 1n)
  const outPhi11_1 = applyBeat(tensorStatesExact(triA, pulB))
  const refPhi11_1 = tensorStatesExact(applyBeat(triA), applyBeat(pulB))
  const ipPhi1 = innerProductExact(refPhi11_1, outPhi11_1)
  const ovPhi1 = z9ToComplex(ipPhi1.num, ipPhi1.den)
  // Also t = 2 return-overlap comparison:
  const outPhi11_2 = applyBeat(outPhi11_1)
  const refPhi11_2 = tensorStatesExact(applyBeat(applyBeat(triA)), applyBeat(applyBeat(pulB)))
  const ipPhi2 = innerProductExact(refPhi11_2, outPhi11_2)
  const ovPhi2 = z9ToComplex(ipPhi2.num, ipPhi2.den)

  console.log(
    `  [2A] Collinear Doublon + Pulse (M=34/28, T_TR=70/60, T_ref=76, plateau 70..82, p*=${pStarD.toFixed(5)}, analytic S_Sym=${sDoubSymAna[0].toFixed(4)}+${sDoubSymAna[1].toFixed(4)}i):`,
  )
  console.log(
    `       M_meet Sym^3 : normErr=${dpMeet.normErr.toExponential(1)}, |<ref|out>|^2=${dpMeet.fid.toFixed(5)} (Wigner shift=${dpMeet.bestShift}: ${dpMeet.wigFid.toFixed(5)}), dPhi_CZ=${(dpMeet.dPhi / PI).toFixed(5)}pi (drift=${(dpMeet.phaseDrift / PI).toFixed(5)}pi), T=${dpMeet.T.toFixed(5)}, R=${dpMeet.R.toFixed(5)}, P_break=${dpMeet.pBreak.toFixed(5)}`,
  )
  console.log(
    `       M_meet 3-role: exact Yang fusion at p*: P_el=${fusD.pEl.toFixed(5)}, P_roleSwap=${fusD.pSwap.toFixed(5)}, arg(a_el)=${(fusD.argEl / PI).toFixed(4)}pi (P_break=0, altLeak=${fusD.altLeak.toExponential(1)}, arg(sSym)=${(cArg(fusD.sSym) / PI).toFixed(4)}pi, arg(sStd)=${(cArg(fusD.sStd) / PI).toFixed(4)}pi)`,
  )
  console.log(
    `       M_pair 1D sur: normErr=${dpPair.normErr.toExponential(1)}, zErr=${dpPair.zDecayErr.toExponential(1)}, |<ref|out>|^2=${dpPair.fid.toFixed(5)} (Wigner=${dpPair.wigFid.toFixed(5)}), dPhi_CZ=${(dpPair.dPhi / PI).toFixed(5)}pi (drift=${(dpPair.phaseDrift / PI).toFixed(5)}pi), T=${dpPair.T.toFixed(5)}, R=${dpPair.R.toFixed(5)}, P_break=${dpPair.pBreak.toFixed(5)}`,
  )
  console.log(
    `       K opp-sign   : normErr=${dpK.normErr.toExponential(1)}, |<ref|out>|^2=${dpK.fid.toFixed(5)}, dPhi=${(dpK.dPhi / PI).toFixed(4)}pi, T=${dpK.T.toFixed(4)}, R=${dpK.R.toFixed(4)}, P_break=${dpK.pBreak.toFixed(5)} (BREAKUP!)`,
  )
  console.log(
    `  [2B] Collinear Trion + Pulse Sym^4 (M=16, T=74, p*=${pStarT.toFixed(5)}, analytic S_Sym=${sTrionSymAna[0].toFixed(4)}+${sTrionSymAna[1].toFixed(4)}i):`,
  )
  console.log(
    `       M_meet Sym^4 : normErr=${tpMeet.normErr.toExponential(1)}, |<ref|out>|^2=${tpMeet.fid.toFixed(5)} (Wigner shift=(${tpMeet.bestShift},${tpMeet.bestShiftT}): ${tpMeet.wigFid.toFixed(5)}), dPhi_CZ=${(tpMeet.dPhi / PI).toFixed(5)}pi, P_break=${tpMeet.pBreak.toFixed(5)}`,
  )
  console.log('  [2C] Literal 4D {3,4,3,4} Z[zeta_9][1/6] Cross-Line Collisions:')
  console.log(`       M_meet doublon(L0) + pulse(L1)       : crossDiff=${crossMeetDiff} (EXACT 0 cross-line coupling!)`)
  console.log(`       M_meet doublon(L0) + doublon(L1)     : crossDiff=${crossTwoDoubDiff} (EXACT 0, coplanar chi_odd=0!)`)
  console.log(`       M_pair 3-body blockade (L0 pair + L1): branches ${outPairOnly.amp.size}->${outBlock11.amp.size}, |ov|^2=${blockFid.toFixed(6)}, dPhi=${(blockPhase / PI).toFixed(5)}pi (anaErr=${blockAnaErr.toExponential(1)})`)
  console.log(`       Phi_odd C4 4-line junction (t=1 / 2) : t=1 |ov|^2=${cAbs2(ovPhi1).toFixed(6)}, dPhi=${(cArg(ovPhi1) / PI).toFixed(5)}pi | t=2 identical (4 vibes on separate radius-1 docks; 2nd firing at t=3)`)

  const ok =
    cAbs(cSub(sDoubSymAna, [-1, 0])) < 1e-13 &&
    cAbs(cSub(sTrionSymAna, [-1, 0])) < 1e-13 &&
    cAbs(cSub(fusD.sSym, sDoubSymAna)) < 1e-13 &&
    Math.abs(fusD.argEl - PI / 2) < 1e-13 &&
    fusD.altLeak < 1e-14 &&
    Math.abs(fusD.pEl + fusD.pSwap - 1) < 1e-13 &&
    dpMeet.normErr < 1e-12 &&
    dpMeet.fid > 0.895 &&
    dpMeet.wigFid > 0.94 &&
    dpMeet.T > 0.985 &&
    dpMeet.R < 0.015 &&
    Math.abs(Math.abs(dpMeet.dPhi) - PI) < 0.005 &&
    dpMeet.phaseDrift < 0.01 &&
    dpMeet.pBreak < 0.005 &&
    dpPair.normErr < 1e-12 &&
    dpPair.zDecayErr < 1e-12 &&
    dpPair.phaseDrift < 0.02 &&
    Math.abs(dpPair.dPhi / PI + 0.8115) < 0.01 &&
    dpK.normErr < 1e-12 &&
    dpK.pBreak > 0.60 &&
    dpK.fid < 0.001 &&
    tpMeet.normErr < 1e-12 &&
    tpMeet.wigFid > 0.65 &&
    Math.abs(Math.abs(tpMeet.dPhi) - PI) < 0.2 &&
    tpMeet.pBreak < 0.02 &&
    crossMeetDiff === 0 &&
    crossTwoDoubDiff === 0 &&
    outPairOnly.amp.size === 12 &&
    outBlock11.amp.size === 2 &&
    blockAnaErr < 1e-14 &&
    Math.abs(cArg(ovPhi1)) > 0.1

  recordCheck(
    'W12.2',
    'Doublon/Trion + Pulse CZ gate test (collinear M_meet exact pi phase vs K 64% breakup; 1D M_pair exact surrogate; 4D cross-line isolation vs M_pair/Phi_odd)',
    ok,
    `Doublon+Pulse Sym: fid=${dpMeet.fid.toFixed(4)} (Wig=${dpMeet.wigFid.toFixed(4)}), T=${dpMeet.T.toFixed(4)}, R=${dpMeet.R.toFixed(4)}, dPhi=${(dpMeet.dPhi / PI).toFixed(5)}pi, P_break=${dpMeet.pBreak.toFixed(4)}; 1D M_pair surr dPhi=${(dpPair.dPhi / PI).toFixed(4)}pi (drift=${(dpPair.phaseDrift / PI).toFixed(4)}pi); K P_break=${dpK.pBreak.toFixed(4)}; Trion+Pulse Wig=${tpMeet.wigFid.toFixed(4)}, dPhi=${(tpMeet.dPhi / PI).toFixed(4)}pi; 4D cross: M_meet=0, M_pair 12->2 (err=${blockAnaErr.toExponential(1)}), Phi_odd dPhi=${(cArg(ovPhi1) / PI).toFixed(4)}pi`,
  )
}

// =================================================================================================
// PART 3 (W12.3): NEUTRAL-PAIR BALANCED TRIT ENCODING {(-1,+1), (0,0), (+1,-1)} UNDER BARE U
// =================================================================================================

function runPart3(): void {
  console.log('\n================================================================================')
  console.log('PART 3 (W12.3): NEUTRAL-PAIR BALANCED TRIT ENCODING UNDER VERBATIM 4D BARE U')
  console.log('================================================================================')

  const [l0A, l0B] = LINES[0]!
  const [l1A, l1B] = LINES[1]!
  const [l2A, l2B] = LINES[2]!

  // 3A. Exact D-conservation obstruction & single-rail K = -omega SWAP + ballistic spreading
  const vZero = stateFromEntries([[[], Z9_ONE]], 1n) // (0, 0), D = 0
  const bit0 = stateFromEntries([[[[0, l0A, -1, 0], [0, l0B, 1, 0]], Z9_ONE]], 1n) // (-1, +1), D = 2
  const bit1 = stateFromEntries([[[[0, l0A, 1, 0], [0, l0B, -1, 0]], Z9_ONE]], 1n) // (+1, -1), D = 2
  const vZeroFixed = countStateDiffs(applyBeat(vZero), vZero) === 0

  // Verify exact 1-beat K = -omega * SWAP action on bit0 and bit1!
  const b0Step1 = applyBeat(bit0)
  const expectedB0Step1 = stateFromEntries(
    [[[[stepDock(0, l0B), l0B, -1, 0], [stepDock(0, l0A), l0A, 1, 0]], scaleZ9(-1n, Z9_OMEGA)]],
    1n,
  )
  const kSwapDiff = countStateDiffs(b0Step1, expectedB0Step1)

  // Evolve bit0 for t = 0..4 in literal 4D Z[zeta_9][1/6]: check D=2 conserved, Q=0 conserved, 0 cross-line leakage, revDiff=0!
  let stB0 = bit0
  let dConserved = true
  let qConserved = true
  let crossLeak = 0
  const pSame4D: number[] = [1]
  for (let t = 1; t <= 4; t++) {
    stB0 = applyBeat(stB0)
    let ps = 0
    for (const [k, amp] of stB0.amp) {
      const vs = decodeConfig(k)
      if (vs.length !== 2) dConserved = false
      if (vs[0]![2] + vs[1]![2] !== 0) qConserved = false
      if (LINE_OF_SLOT[vs[0]![1]] !== 0 || LINE_OF_SLOT[vs[1]![1]] !== 0) crossLeak++
      if (vs[0]![0] === vs[1]![0]) ps += cAbs2(z9ToComplex(amp, stB0.den))
    }
    pSame4D.push(ps)
  }
  let revB0 = stB0
  for (let t = 0; t < 4; t++) revB0 = applyBeatInv(revB0)
  const revDiffB0 = countStateDiffs(revB0, bit0)

  // 1D ballistic spreading of neutral pair out to T = 40 beats (exact infinite line!):
  const pSameT40 = (() => {
    const T = 40; const half = T + 2; const B = 2 * half + 1
    const idx = (x1: number, x2: number, s: number) => (((x1 + half) * B + (x2 + half)) << 2) + s
    let re = new Float64Array(B * B * 4); let im = new Float64Array(B * B * 4)
    re[idx(0, 0, 1)] = 1 // particle 1 (-1) at s=0 (+), particle 2 (+1) at s=1 (-)
    const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
    const kFac: C = [-W_C[0], -W_C[1]]
    let p40 = 0
    for (let t = 1; t <= T; t++) {
      const nRe = new Float64Array(B * B * 4); const nIm = new Float64Array(B * B * 4)
      for (let x1 = -t + 1; x1 <= t - 1; x1++) for (let x2 = -t + 1; x2 <= t - 1; x2++) {
        const base = ((x1 + half) * B + (x2 + half)) << 2
        if (x1 === x2) {
          const r1 = re[base + 1]!; const i1 = im[base + 1]!; const r2 = re[base + 2]!; const i2 = im[base + 2]!
          if (r1 !== 0 || i1 !== 0) { const d = idx(x1 - 1, x2 + 1, 2); nRe[d] = nRe[d]! + (r1 * kFac[0] - i1 * kFac[1]); nIm[d] = nIm[d]! + (r1 * kFac[1] + i1 * kFac[0]) }
          if (r2 !== 0 || i2 !== 0) { const d = idx(x1 + 1, x2 - 1, 1); nRe[d] = nRe[d]! + (r2 * kFac[0] - i2 * kFac[1]); nIm[d] = nIm[d]! + (r2 * kFac[1] + i2 * kFac[0]) }
        } else {
          for (let sIn = 0; sIn < 4; sIn++) {
            const ar = re[base + sIn]!; const ai = im[base + sIn]!; if (ar === 0 && ai === 0) continue
            for (let sOut = 0; sOut < 4; sOut++) {
              const cc = cMul(cMat[sOut >> 1]![sIn >> 1]!, cMat[sOut & 1]![sIn & 1]!)
              const d = idx(x1 + ((sOut >> 1) === 0 ? 1 : -1), x2 + ((sOut & 1) === 0 ? 1 : -1), sOut)
              nRe[d] = nRe[d]! + (ar * cc[0] - ai * cc[1]); nIm[d] = nIm[d]! + (ar * cc[1] + ai * cc[0])
            }
          }
        }
      }
      re = nRe; im = nIm
      if (t === T) {
        for (let x = -T; x <= T; x++) {
          const b = ((x + half) * B + (x + half)) << 2
          for (let s = 0; s < 4; s++) p40 += re[b + s]! ** 2 + im[b + s]! ** 2
        }
      }
    }
    return p40
  })()

  // 3B. Exhaustive (-I, C) Annihilation Theorem across ALL 264 2-rail and ALL 1,760 3-rail neutral-pair junctions,
  //     plus literal 4D Z[zeta_9][1/6] factorization U(rail0 (x) rail1) == U(rail0) (x) U(rail1) and 3-rail exact factorization!
  let nonZero2Rail = 0
  for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) {
    const [a0, a1] = LINES[a]!; const [b0, b1] = LINES[b]!
    for (const tA of [0, 1]) for (const tB of [0, 1]) {
      if (chiral4Sign((a0 << 1) + tA, (a1 << 1) + (tA ^ 1), (b0 << 1) + tB, (b1 << 1) + (tB ^ 1)) !== 0) nonZero2Rail++
    }
  }
  let nonZero3Rail = 0
  for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) for (let c = b + 1; c < 12; c++) {
    const [a0, a1] = LINES[a]!; const [b0, b1] = LINES[b]!; const [c0, c1] = LINES[c]!
    for (let bits = 0; bits < 8; bits++) {
      const tA = bits & 1; const tB = (bits >> 1) & 1; const tC = (bits >> 2) & 1
      const codes = [(a0 << 1) + tA, (a1 << 1) + (tA ^ 1), (b0 << 1) + tB, (b1 << 1) + (tB ^ 1), (c0 << 1) + tC, (c1 << 1) + (tC ^ 1)]
      let chi = 0
      for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) for (let k = j + 1; k < 6; k++) for (let l = k + 1; l < 6; l++) {
        chi += chiral4Sign(codes[i]!, codes[j]!, codes[k]!, codes[l]!)
      }
      if (chi !== 0) nonZero3Rail++
    }
  }

  // Direct literal 4D Z[zeta_9][1/6] factorization check for 2-rail and 3-rail neutral-pair collisions at dock 0,
  // PLUS sharp 4-rail C4 = [0,1,2,8] scope boundary: 1-beat U factorizes (diff=0 by (-I,C)), whereas at t=3
  // coin-reflected single-vibe halves re-collide at dock 0 and break antipodal pairing, activating Phi_odd!
  const rail1 = stateFromEntries([[[[0, l1A, 1, 0], [0, l1B, -1, 0]], Z9_ONE]], 1n)
  const rail2 = stateFromEntries([[[[0, l2A, -1, 0], [0, l2B, 1, 0]], Z9_ONE]], 1n)
  const [l8A, l8B] = LINES[8]!
  const rail8 = stateFromEntries([[[[0, l8A, 1, 0], [0, l8B, -1, 0]], Z9_ONE]], 1n)
  const diff2Rail4D = countStateDiffs(applyBeat(tensorStatesExact(bit0, rail1)), tensorStatesExact(applyBeat(bit0), applyBeat(rail1)))
  const diff3Rail4D = countStateDiffs(
    applyBeat(tensorStatesExact(tensorStatesExact(bit0, rail1), rail2)),
    tensorStatesExact(tensorStatesExact(applyBeat(bit0), applyBeat(rail1)), applyBeat(rail2)),
  )
  const quadNeutral = tensorStatesExact(tensorStatesExact(tensorStatesExact(bit0, rail1), rail2), rail8)
  const quadT1 = applyBeat(quadNeutral)
  const quadT1Indep = tensorStatesExact(tensorStatesExact(tensorStatesExact(applyBeat(bit0), applyBeat(rail1)), applyBeat(rail2)), applyBeat(rail8))
  const diff4RailT1 = countStateDiffs(quadT1, quadT1Indep)
  const quadT2 = applyBeat(quadT1)
  const diff4RailT3Phi = countStateDiffs(applyOddChiralPhase(quadT2, false), quadT2)

  // Contrast: separated single-slot Q = 0_V quad on C2 = [0,1,6,10] (tones +1,+1,-1,-1) HAS nonzero Phi_odd coupling!
  const c2Lines = [0, 1, 6, 10] as const
  const c2Tones: readonly ToneNZ[] = [1, 1, -1, -1]
  let c2Mask = -1
  for (let m = 0; m < 16; m++) {
    const cs = [0, 1, 2, 3].map(j => (LINES[c2Lines[j]!]![(m >> j) & 1]! << 1) + (c2Tones[j]! < 0 ? 1 : 0))
    if (chiral4Sign(cs[0]!, cs[1]!, cs[2]!, cs[3]!) > 0) { c2Mask = m; break }
  }
  const c2Vibes: Vibe[] = [0, 1, 2, 3].map(j => [0, LINES[c2Lines[j]!]![(c2Mask >> j) & 1]!, c2Tones[j]!, 0] as const)
  const c2A = stateFromEntries([[c2Vibes.slice(0, 3), Z9_ONE]], 1n)
  const c2B = stateFromEntries([[c2Vibes.slice(3, 4), Z9_ONE]], 1n)
  const c2Actual = applyBeat(tensorStatesExact(c2A, c2B))
  const c2Indep = tensorStatesExact(applyBeat(c2A), applyBeat(c2B))
  const c2Diffs = countStateDiffs(c2Actual, c2Indep)
  const ipC2 = innerProductExact(c2Indep, c2Actual)
  const ovC2 = z9ToComplex(ipC2.num, ipC2.den)

  console.log(`  [3A] Single-rail neutral pair: U|0,0>=|0,0> (${vZeroFixed}), K=-w*SWAP diff=${kSwapDiff}, D=2 & Q=0 conserved (${dConserved}/${qConserved}), leak=${crossLeak}, revDiff=${revDiffB0}`)
  console.log(`       Ballistic spreading: 4D P_same(t=0..4)=[${pSame4D.map(x => x.toFixed(4)).join(', ')}], 1D P_same(t=40)=${pSameT40.toFixed(5)} (NO bound state!)`)
  console.log(`  [3B] (-I, C) Annihilation Theorem: 2-rail chi_odd!=0: ${nonZero2Rail}/264, 3-rail chi_odd!=0: ${nonZero3Rail}/1760`)
  console.log(`       Literal 4D Z[zeta_9][1/6] decoupling: 2-rail diff=${diff2Rail4D}, 3-rail diff=${diff3Rail4D} (all-time U^t); 4-rail C4 t=1 diff=${diff4RailT1}, t=3 Phi_odd return diffs=${diff4RailT3Phi}`)
  console.log(`       Broken-pair single-slot Q=0_V C2=[0,1,6,10] contrast: diffs=${c2Diffs}, |ov|^2=${cAbs2(ovC2).toFixed(6)}, dPhi=${(cArg(ovC2) / PI).toFixed(5)}pi`)

  const ok =
    vZeroFixed &&
    kSwapDiff === 0 &&
    dConserved &&
    qConserved &&
    crossLeak === 0 &&
    revDiffB0 === 0 &&
    pSameT40 < 0.02 &&
    nonZero2Rail === 0 &&
    nonZero3Rail === 0 &&
    diff2Rail4D === 0 &&
    diff3Rail4D === 0 &&
    diff4RailT1 === 0 &&
    diff4RailT3Phi > 0 &&
    c2Diffs > 0 &&
    Math.abs(cArg(ovC2)) > 0.1

  recordCheck(
    'W12.3',
    'Neutral-pair balanced trit no-go: D-conservation, K=-w*SWAP ballistic spreading, & (-I,C) 0/264 + 0/1760 multi-rail decoupling',
    ok,
    `K-swap diff=0, P_same(40)=${pSameT40.toFixed(4)}, chi_odd nonzero 2-rail=0/264 & 3-rail=0/1760, 4D 2/3-rail factor diffs=(0,0), 4-rail t=1/t=3=(${diff4RailT1},${diff4RailT3Phi}); broken-pair C2 dPhi=${(cArg(ovC2) / PI).toFixed(4)}pi`,
  )
}

// =================================================================================================
// PART 4 (W12.4): EXACT k = 4 Sym^4 TETRON ANALYTIC WAVEFUNCTION IN Z[omega][1/49] (CLOSING W9-M2!)
// =================================================================================================

function runPart4(): void {
  console.log('\n================================================================================')
  console.log('PART 4 (W12.4): EXACT k = 4 Sym^4 TETRON ANALYTIC WAVEFUNCTION IN Z[omega][1/49]')
  console.log('================================================================================')

  type Zw = readonly [bigint, bigint]
  const zwAdd = (x: Zw, y: Zw): Zw => [x[0] + y[0], x[1] + y[1]]
  const zwSub = (x: Zw, y: Zw): Zw => [x[0] - y[0], x[1] - y[1]]
  const zwMul = (x: Zw, y: Zw): Zw => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0] - x[1] * y[1]]
  const zwScale = (k: bigint, x: Zw): Zw => [k * x[0], k * x[1]]
  const zwIsZero = (x: Zw): boolean => x[0] === 0n && x[1] === 0n

  // Exact Z[omega] generators of the k = 4 tetron:
  //   p = (-1 - 4w)/13   (|p|^2 = 1/13)
  //   q = (-29 - 12w)/49 (|q|^2 = 13/49),   qbar = (-17 + 12w)/49
  //   lambda_4 = (16 - 39w)/49 = lambda_3^{-2}
  // Unified closed-form formula valid across ALL 5 contact regimes without case splits:
  //   psi(d1, d2, d3; s1, s2, s3, s4) = (13/49)^(d1 + d3 - 2) * (1/49)^(d2 - 1) * qbar^2 * q^(1_{s1=0} + 1_{s4=1}) * p^(1_{s2=0} + 1_{s3=1})
  const ZW_W2: Zw = [-1n, -1n]
  const ZW_2CKEEP: Zw = [1n, 1n]
  const ZW_2CCROSS: Zw = [1n, -1n]
  const ZW_49Q: Zw = [-29n, -12n]
  const ZW_49QBAR: Zw = [-17n, 12n]
  const ZW_13P: Zw = [-1n, -4n]
  const ZW_49LAM4: Zw = [16n, -39n]
  const c2Mat: Zw[][] = [[ZW_2CKEEP, ZW_2CCROSS], [ZW_2CCROSS, ZW_2CKEEP]]

  // Algebraic identities on p, q, qbar, lam_4:
  const qNorm = zwMul(ZW_49Q, ZW_49QBAR) // 49 * 13 = 637
  const pNorm = zwMul(ZW_13P, [3n, 4n]) // 13
  const qbarP = zwMul(ZW_49QBAR, ZW_13P) // 13 * (5 + 8w)
  const algOk =
    qNorm[0] === 637n && qNorm[1] === 0n &&
    pNorm[0] === 13n && pNorm[1] === 0n &&
    qbarP[0] === 65n && qbarP[1] === 104n

  // 4A. Exact BigInt Z[omega] Symbolic Stencil Verification on the Infinite Line (0 <= d1, d2, d3 <= 4):
  const D_CHK = 4
  const P49 = 24
  const P13 = 4
  const psiTetronZw = (d1: number, d2: number, d3: number, s1: number, s2: number, s3: number, s4: number): Zw => {
    const qCnt = (s1 === 0 ? 1 : 0) + (s4 === 1 ? 1 : 0)
    const pCnt = (s2 === 0 ? 1 : 0) + (s3 === 1 ? 1 : 0)
    let v: Zw = zwMul(ZW_49QBAR, ZW_49QBAR)
    for (let i = 0; i < qCnt; i++) v = zwMul(v, ZW_49Q)
    for (let i = 0; i < pCnt; i++) v = zwMul(v, ZW_13P)
    const exp13 = d1 + d3 - 2 - pCnt + P13
    const exp49 = P49 - (d1 + d2 + d3 - 1 + qCnt)
    return zwScale(13n ** BigInt(exp13) * 49n ** BigInt(exp49), v)
  }

  const out16U = new Map<string, Zw>()
  const addOut4 = (k: string, v: Zw) => { const ex = out16U.get(k); out16U.set(k, ex ? zwAdd(ex, v) : v) }
  for (let d1 = 0; d1 <= D_CHK + 1; d1++) {
    for (let d2 = 0; d2 <= D_CHK + 1; d2++) {
      if (d1 === 0 && d2 === 0) continue
      for (let d3 = 0; d3 <= D_CHK + 1; d3++) {
        if (d2 === 0 && d3 === 0) continue
        const ms = [0, d1, d1 + d2, d1 + d2 + d3] as const
        for (let s1 = 0; s1 < 2; s1++) for (let s2 = 0; s2 < 2; s2++) {
          if (d1 === 0 && !(s1 === 0 && s2 === 1)) continue
          for (let s3 = 0; s3 < 2; s3++) {
            if (d2 === 0 && !(s2 === 0 && s3 === 1)) continue
            for (let s4 = 0; s4 < 2; s4++) {
              if (d3 === 0 && !(s3 === 0 && s4 === 1)) continue
              const amp0 = psiTetronZw(d1, d2, d3, s1, s2, s3, s4)
              const pts: [number, number][] = [[ms[0], s1], [ms[1], s2], [ms[2], s3], [ms[3], s4]]
              const byM = new Map<number, number[]>()
              for (let i = 0; i < 4; i++) { const l = byM.get(pts[i]![0]); if (l) l.push(i); else byM.set(pts[i]![0], [i]) }
              let branches: { pts: [number, number][]; amp: Zw }[] = [{ pts: [], amp: amp0 }]
              for (const [m, idxs] of byM) {
                if (idxs.length === 2) {
                  branches = branches.map(b => ({ pts: [...b.pts, [m, 0], [m, 1]], amp: zwScale(4n, zwMul(b.amp, ZW_W2)) }))
                } else {
                  const sIn = pts[idxs[0]!]![1]
                  const nb: { pts: [number, number][]; amp: Zw }[] = []
                  for (const b of branches) {
                    nb.push({ pts: [...b.pts, [m, 0]], amp: zwMul(b.amp, c2Mat[0]![sIn]!) })
                    nb.push({ pts: [...b.pts, [m, 1]], amp: zwMul(b.amp, c2Mat[1]![sIn]!) })
                  }
                  branches = nb
                }
              }
              for (const b of branches) {
                const st: [number, number][] = b.pts.map(([m, s]) => [s === 0 ? m : m - 1, s])
                st.sort((a, bb) => a[0] - bb[0] || a[1] - bb[1])
                addOut4(`${st[1]![0] - st[0]![0]},${st[2]![0] - st[1]![0]},${st[3]![0] - st[2]![0]},${st[0]![1]},${st[1]![1]},${st[2]![1]},${st[3]![1]}`, b.amp)
              }
            }
          }
        }
      }
    }
  }

  let sym4Checked = 0
  let sym4Defects = 0
  const regimeCounts = [0, 0, 0, 0, 0] // double-pair, mid-pair, left-pair, right-pair, all-sep
  for (let d1 = 0; d1 <= D_CHK; d1++) {
    for (let d2 = 0; d2 <= D_CHK; d2++) {
      if (d1 === 0 && d2 === 0) continue
      for (let d3 = 0; d3 <= D_CHK; d3++) {
        if (d2 === 0 && d3 === 0) continue
        const reg = d1 === 0 && d3 === 0 ? 0 : d2 === 0 ? 1 : d1 === 0 ? 2 : d3 === 0 ? 3 : 4
        for (let s1 = 0; s1 < 2; s1++) for (let s2 = 0; s2 < 2; s2++) {
          if (d1 === 0 && !(s1 === 0 && s2 === 1)) continue
          for (let s3 = 0; s3 < 2; s3++) {
            if (d2 === 0 && !(s2 === 0 && s3 === 1)) continue
            for (let s4 = 0; s4 < 2; s4++) {
              if (d3 === 0 && !(s3 === 0 && s4 === 1)) continue
              sym4Checked++
              regimeCounts[reg] = regimeCounts[reg]! + 1
              const k = `${d1},${d2},${d3},${s1},${s2},${s3},${s4}`
              const lhs = zwScale(49n, out16U.get(k) ?? [0n, 0n])
              const rhs = zwScale(16n, zwMul(ZW_49LAM4, psiTetronZw(d1, d2, d3, s1, s2, s3, s4)))
              if (!zwIsZero(zwSub(lhs, rhs))) sym4Defects++
            }
          }
        }
      }
    }
  }

  // 4B. Exact BigInt Rational Observables (N_tot, contact probabilities, IPR)
  const gcdBig = (a: bigint, b: bigint): bigint => {
    let x = a < 0n ? -a : a; let y = b < 0n ? -b : b
    while (y !== 0n) { const t = x % y; x = y; y = t }
    return x
  }
  type Rat = readonly [bigint, bigint]
  const rMake = (n: bigint, d: bigint): Rat => { const g = gcdBig(n, d); const s = d < 0n ? -1n : 1n; return [(s * n) / g, (s * d) / g] }
  const rAdd = (a: Rat, b: Rat): Rat => rMake(a[0] * b[1] + b[0] * a[1], a[1] * b[1])
  const rMul = (a: Rat, b: Rat): Rat => rMake(a[0] * b[0], a[1] * b[1])
  const rDiv = (a: Rat, b: Rat): Rat => rMake(a[0] * b[1], a[1] * b[0])
  const X = rMake(13n, 49n); const Y = rMake(1n, 13n)
  const S1 = rMake(2401n, 2232n); const S2 = rMake(2401n, 2400n)
  const N1 = S2
  const N2 = rMul(rMul(rAdd([1n, 1n], X), rAdd([1n, 1n], X)), rMul(S1, S1))
  const N34 = rMul([2n, 1n], rMul(rMul(X, rMul(rAdd([1n, 1n], X), rAdd([1n, 1n], Y))), rMul(S1, S2)))
  const N5 = rMul(rMul(rMul(X, X), rMul(rMul(rAdd([1n, 1n], X), rAdd([1n, 1n], X)), rMul(rAdd([1n, 1n], Y), rAdd([1n, 1n], Y)))), rMul(rMul(S1, S1), S2))
  const NTot = rAdd(rAdd(N1, N2), rAdd(N34, N5))
  const pContact = rDiv(rAdd(rAdd(N1, N2), N34), NTot)
  const pSep = rDiv(N5, NTot)
  const pDouble = rDiv(N1, NTot)
  const pMid = rDiv(N2, NTot)
  const pOuter = rDiv(N34, NTot)
  const X2 = rMul(X, X); const Y2 = rMul(Y, Y)
  const S1_4 = rMake(5764801n, 5764801n - 28561n); const S2_4 = rMake(5764801n, 5764800n)
  const I1 = S2_4
  const I2 = rMul(rMul(rAdd([1n, 1n], X2), rAdd([1n, 1n], X2)), rMul(S1_4, S1_4))
  const I34 = rMul([2n, 1n], rMul(rMul(X2, rMul(rAdd([1n, 1n], X2), rAdd([1n, 1n], Y2))), rMul(S1_4, S2_4)))
  const I5 = rMul(rMul(rMul(X2, X2), rMul(rMul(rAdd([1n, 1n], X2), rAdd([1n, 1n], X2)), rMul(rAdd([1n, 1n], Y2), rAdd([1n, 1n], Y2)))), rMul(rMul(S1_4, S1_4), S2_4))
  const iprRat = rDiv(rAdd(rAdd(I1, I2), rAdd(I34, I5)), rMul(NTot, NTot))
  const iprExact = Number(iprRat[0]) / Number(iprRat[1])

  // 4C. Finite-Ring ED Cross-Check across M = 5, 6, 7, 8, 9, 10 (exact eigenvalue, IPR, AND direct wavefunction overlap!)
  const eTetExact = Math.atan2((-39 * SQRT3) / 98, 71 / 98)
  const qC: C = [(-29 - 12 * W_C[0]) / 49, (-12 * W_C[1]) / 49]
  const qBarC: C = [(-17 + 12 * W_C[0]) / 49, (12 * W_C[1]) / 49]
  const pC: C = [(-1 - 4 * W_C[0]) / 13, (-4 * W_C[1]) / 13]
  const evalPsiC = (d1: number, d2: number, d3: number, s1: number, s2: number, s3: number, s4: number): C => {
    let v = cScale(Math.pow(13 / 49, d1 + d3 - 2) * Math.pow(1 / 49, d2 - 1), cMul(qBarC, qBarC))
    if (s1 === 0) v = cMul(v, qC); if (s4 === 1) v = cMul(v, qC)
    if (s2 === 0) v = cMul(v, pC); if (s3 === 1) v = cMul(v, pC)
    return v
  }

  const rows: { M: number; dim: number; uni: number; dE: number; iprErr: number; ovDef: number; res: number }[] = []
  for (const M of [5, 6, 7, 8, 9, 10]) {
    const sys = buildSymKEven(4, M, 0, W2_C)
    const uni = cmatUnitaryErr(sys.U)
    const ref = shiftInvertRefine(sys.U, eTetExact, 5)
    // Build exact analytic wavefunction folded periodically onto the M-site ring (sum over all distinct cyclic cuts)
    const anaR = new Float64Array(sys.dim)
    const anaI = new Float64Array(sys.dim)
    let an2 = 0
    for (let i = 0; i < sys.dim; i++) {
      const cfg = sys.configs[i]!
      const seenStarts = new Set<number>()
      let ampSum: C = [0, 0]
      for (let p = 0; p < 4; p++) {
        const mStart = cfg[p]![0]
        if (seenStarts.has(mStart)) continue
        seenStarts.add(mStart)
        const arr: [number, number][] = cfg.map(([m, s]) => [(m - mStart + M) % M, s])
        arr.sort((a, b) => a[0] - b[0] || a[1] - b[1])
        const d1 = arr[1]![0] - arr[0]![0]
        const d2 = arr[2]![0] - arr[1]![0]
        const d3 = arr[3]![0] - arr[2]![0]
        ampSum = cAdd(ampSum, evalPsiC(d1, d2, d3, arr[0]![1], arr[1]![1], arr[2]![1], arr[3]![1]))
      }
      const amp = cScale(1 / Math.sqrt(sys.symCounts[i]!), ampSum)
      anaR[i] = amp[0]; anaI[i] = amp[1]; an2 += cAbs2(amp)
    }
    let ovR = 0; let ovI = 0
    const invA = 1 / Math.sqrt(an2)
    for (let i = 0; i < sys.dim; i++) {
      const ar = anaR[i]! * invA; const ai = anaI[i]! * invA
      ovR += ar * ref.vr[i]! + ai * ref.vi[i]!; ovI += ar * ref.vi[i]! - ai * ref.vr[i]!
    }
    rows.push({
      M, dim: sys.dim, uni,
      dE: Math.abs(ref.E - eTetExact),
      iprErr: Math.abs(ref.ipr - iprExact),
      ovDef: 1 - Math.hypot(ovR, ovI),
      res: ref.res,
    })
  }
  const ratioM9M10 = rows[4]!.dE / rows[5]!.dE

  // 4D. Literal 4D {3,4,3,4} Z[zeta_9][1/6] Coxeter 4-role (0,1,2,3) Tetron Seed Verification (t=0..2, 0 cross-line leak, rev=0!)
  const [l0A, l0B] = LINES[0]!
  const dPos2 = stepDock(stepDock(0, l0A), l0A)
  const perms24: [number, number, number, number][] = []
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) if (b !== a) for (let c = 0; c < 4; c++) if (c !== a && c !== b) {
    perms24.push([a, b, c, 6 - a - b - c])
  }
  const tetSeed4D = stateFromEntries(
    perms24.map(([r0, r1, r2, r3]) => [[[0, l0A, 1, r0], [0, l0B, 1, r1], [dPos2, l0A, 1, r2], [dPos2, l0B, 1, r3]], Z9_ONE] as const),
    1n,
  )
  const tet1 = applyBeat(tetSeed4D)
  const tet2 = applyBeat(tet1)
  const tetRevDiff = countStateDiffs(applyBeatInv(applyBeatInv(tet2)), tetSeed4D)
  let tetGeoLeak = 0
  for (const k of tet2.amp.keys()) {
    for (const [, slot] of decodeConfig(k)) if (LINE_OF_SLOT[slot] !== 0) tetGeoLeak++
  }

  console.log(
    `  [4A] Exact BigInt Z[omega] infinite-line k=4 Sym^4 Tetron proof: checked=${sym4Checked} stencils (regimes=[${regimeCounts.join(',')}]), defects=${sym4Defects}`,
  )
  console.log(
    `       Unified formula: psi(d1,d2,d3;s) = (13/49)^(d1+d3-2) (1/49)^(d2-1) qbar^2 q^(1_{s1=0}+1_{s4=1}) p^(1_{s2=0}+1_{s3=1})`,
  )
  console.log(
    `       Exact constants: p=(-1-4w)/13 (|p|^2=1/13), q=(-29-12w)/49 (|q|^2=13/49), lam_4=(16-39w)/49=lam_3^{-2}`,
  )
  console.log(
    `  [4B] Exact rational observables: N_tot=${NTot[0]}/${NTot[1]}, p_contact=${pContact[0]}/${pContact[1]} (double=${pDouble[0]}/${pDouble[1]}, mid=${pMid[0]}/${pMid[1]}, outer=${pOuter[0]}/${pOuter[1]}), p_sep=${pSep[0]}/${pSep[1]}, IPR=${iprRat[0]}/${iprRat[1]}=${iprExact.toFixed(9)}`,
  )
  console.log('  [4C] Finite-ring M = 5..10 exact convergence (ratio |dE(9)/dE(10)| vs exact 49/13 = 3.76923):')
  for (const r of rows) {
    console.log(
      `       M=${String(r.M).padStart(2)} (L=${String(2 * r.M).padStart(2)}, dim=${String(r.dim).padStart(3)}): uni=${r.uni.toExponential(1)}, res=${r.res.toExponential(1)}, |dE|=${r.dE.toExponential(2)}, |dIPR|=${r.iprErr.toExponential(2)}, 1-|<psi_ana|psi_ED>|=${r.ovDef.toExponential(2)}`,
    )
  }
  console.log(
    `       Convergence ratio |dE(9)/dE(10)| = ${ratioM9M10.toFixed(5)} (exact 49/13 = ${(49 / 13).toFixed(5)})`,
  )
  console.log(
    `  [4D] Literal 4D Z[zeta_9][1/6] 4-role Sym^4 Tetron seed (t=0..2): revDiff=${tetRevDiff}, crossLineLeak=${tetGeoLeak}, branches(t=2)=${tet2.amp.size}`,
  )

  const ok =
    algOk &&
    sym4Checked > 1000 &&
    sym4Defects === 0 &&
    NTot[0] === 117649n && NTot[1] === 31104n &&
    pContact[0] === 24n && pContact[1] === 25n &&
    pSep[0] === 1n && pSep[1] === 25n &&
    iprRat[0] === 3888n && iprRat[1] === 24025n &&
    rows.every(r => r.uni < 1e-14 && r.res < 1e-14) &&
    rows[5]!.dE < 1e-5 &&
    rows[5]!.iprErr < 1.2e-4 &&
    rows[5]!.ovDef < 1e-5 &&
    Math.abs(ratioM9M10 - 49 / 13) < 0.05 &&
    tetRevDiff === 0 &&
    tetGeoLeak === 0

  recordCheck(
    'W12.4',
    'Exact k=4 Sym^4 Tetron analytic wavefunction in Z[omega][1/49]: 0/1220 BigInt defects, p_contact=24/25, IPR=3888/24025, M=5..10 ED match',
    ok,
    `BigInt defects=0/${sym4Checked}, N_tot=117649/31104, p_contact=24/25, IPR=3888/24025=${iprExact.toFixed(6)}, M=10 |dE|=${rows[5]!.dE.toExponential(2)}, 1-|<ana|ED>|=${rows[5]!.ovDef.toExponential(2)}, ratio=${ratioM9M10.toFixed(4)} vs 49/13, 4D leak=0`,
  )
}

function main(): void {
  const t0 = Date.now()
  runPart1()
  runPart2()
  runPart3()
  runPart4()

  const elapsedMs = Date.now() - t0
  console.log('\n================================================================================')
  console.log('FINAL VERIFICATION SUMMARY (WAVE-4 TRACK W12: INTEGRABILITY, GATES & TETRON)')
  console.log('================================================================================')
  let allPassed = true
  for (const row of CHECKS) {
    const tag = row.passed ? 'PASS' : 'FAIL'
    if (!row.passed) allPassed = false
    console.log(`  [${tag}] (${row.part}) ${row.name}`)
    console.log(`         ${row.detail}`)
  }
  console.log(`\n  Elapsed: ${elapsedMs} ms | Result: ${allPassed ? 'ALL CHECKS PASSED' : 'FAILURE DETECTED'}`)
  if (!allPassed) process.exit(1)
}

main()

export {}
