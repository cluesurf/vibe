// WAVE-5 STANDARD MODEL CLOSURE — TRACK 2c (M1..M4):
// INFRARED LIGHT-MASS GENERATION FROM PURE Z[omega][1/2] O(1) ANGLES & DIRECT E = mc^2 CLOSURE
//
//   M1: Pure-Z[omega][1/2] Finite-Slab Chiral Walk Mass Hierarchy (D_* = 0..10)
//       - Exact BigInt (0n error!) unitarity & chiral symmetry sigma_z U_depth sigma_z = U_depth^dag
//         of U_depth(D_*) = C_1(pi/3) B_2(2pi/3) C_1(pi/3) strictly over Z[omega][1/2] (ZERO small inputs!)
//       - Certifies m_eff(0) = pi/3, exact closed form m_eff(1) = arccos((1 + 3 sqrt(5))/8) = 0.270919 (< 1e-14),
//         exact bulk gap E_2(1) = arccos((1 - 3 sqrt(5))/8) = 2.365314 (< 1e-14), exact decay ratio
//         m_eff(D+1)/m_eff(D) -> 1/3, plus exact unitary warped {3,4,3,4} Steinberg branching comparison.
//   M2: Zero-Leakage 1+1D & 3+1D Massive Dirac Dispersion
//       - Full 4(D_* + 1) x 4(D_* + 1) 3+1D slab spectrum coupled to W16's c = 1.0000 single-speed Weyl QCA
//         across BZ_3 (plus 1+1D slab verification): certifies |cos E(k) - cos(m_eff(D_*)) cos(omega_Weyl(k))| < 1e-14,
//         0.000000 bulk leakage, and R_1: 1.653987 (D_* = 0) -> 1.000273 (D_* = 3).
//   M3: Direct Closure of W18's R_2 = 7.14 -> 1.00 & Live 1/gamma Clock on Bare M_meet(omega)
//       - Feeds emergent m_eff(D_*) directly (D_* = 0..5, ZERO manual mass tuning) into exact bare M_meet(omega)
//         2-body CM unitary U_2(P) (cross-checked dense vs exact banded LU): certifies R_2: 7.1406 (D_* = 0) ->
//         1.0256 (D_* = 3) -> 1.00831 (D_* = 4) -> 1.00272 (D_* = 5; warped D_* = 3: 1.00168), Delta m_inert / E_bind -> 1.00,
//         live real-space 2-body moving clock 1/gamma dilation < 1.5% (0.866%) at emergent D_* = 2 (m_eff(2) = 0.086322),
//         and prints the honest opposite-wall contact-overlap caveat (linking Pillars 1 & 3).
//   M4: E-SPN-0180 Curvature Protection Control
//       - Static disordered 2T Hurwitz gauge field on exact 4D D_4 torus (D_4 / 3 D_4, N = 81 sites, 24 roots):
//         certifies exact 2T group closure, local gauge covariance, flat/pure-gauge controls, and confirms
//         chiral zero-mode m_eff stays light (< 1e-3 drift!) in strongly curved disordered 2T fields while
//         a non-chiral scalar hop in the exact same field jumps to O(1) Kesten cutoff mass (> 1.10 rad).
//
// HONEST TIER A vs TIER B SCOPE BOUNDARIES:
//   - M1 uses bare O(1) Z[omega][1/2] angles (pi/3, 2pi/3) on an open finite radial slab (plus a Tier-B
//     unitary radial branching comparison on {3,4,3,4} Steinberg shells N_D).
//   - M2 couples U_depth(D_*) to W16's Tier-B single-speed 3D Weyl QCA via a flat depth-uniform husk shift
//     S_husk(k) = I_{D_*+1} (x) diag(U_Weyl(k), U_Weyl(k)^dag); exact 0.000000 bulk leakage relies on this
//     depth-uniformity of S_husk(k).
//   - M3.1 uses verbatim bare M_meet(omega) (phi = 2pi/3) with emergent m_eff(D_*) (zero manual mass tuning).
//     M3.2 uses emergent m_eff(2) = 0.086322 (zero manual mass tuning) inside W18's Tier-B two-channel
//     flavor-switched Thirring clock probe (phi_A = 0.47 pi, phi_B = 0.53 pi) to measure live 1/gamma dilation.
//   - M4 injects emergent m_eff(2) = 0.086322 (and E-SPN-0180's m_0 = 0.190126) into E-SPN-0180's exact
//     analytic Jordan dispersion laws evaluated on the exact numerical spectrum of a naive covariant 4D D_4
//     Clifford operator C = c_0 sum_d L(r_d) R(g_{y,d}) T_d versus the non-chiral averaged hop T.
//
// Strictly standalone (zero external imports), strictly deterministic (zero Math.random),
// strict TypeScript (noUncheckedIndexedAccess-safe), laptop-safe (< 6 s, < 250 MB RAM).

const T0_GLOBAL = performance.now()
const PI = Math.PI
const TWO_PI = 2 * PI
const SQRT2 = Math.SQRT2
const SQRT3 = Math.sqrt(3)
const SQRT5 = Math.sqrt(5)

// ============================================================================
// 0. ASSERTION HARNESS, COMPLEX/MATRIX PRIMITIVES & EXACT EIGENSOLVERS
// ============================================================================

type CheckRow = {
  readonly id: string
  readonly name: string
  readonly ok: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function assert(cond: boolean, msg: string): asserts cond {
  if (!cond) {
    throw new Error(`Hard assertion failed: ${msg}`)
  }
}

function recordCheck(id: string, name: string, cond: boolean, detail: string): void {
  CHECKS.push({ id, name, ok: cond, detail })
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${id.padEnd(6)} | ${name}: ${detail}`)
  assert(cond, `[${id} ${name}] ${detail}`)
}

type C = readonly [number, number]
const C0: C = [0, 0]
const C1: C = [1, 0]
const CM1: C = [-1, 0]
const CI: C = [0, 1]
const CMI: C = [0, -1]
const W_C: C = [-0.5, SQRT3 / 2] // omega = e^{2 pi i / 3}

const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConj = (a: C): C => [a[0], -a[1]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cExpI = (t: number): C => [Math.cos(t), Math.sin(t)]

function wrapPi(x: number): number {
  let y = (((x + PI) % TWO_PI) + TWO_PI) % TWO_PI - PI
  if (y <= -PI) y += TWO_PI
  return y
}

function phaseDist(a: number, b: number): number {
  return Math.abs(wrapPi(a - b))
}

type CMat2 = readonly [readonly [C, C], readonly [C, C]]
const I2: CMat2 = [
  [C1, C0],
  [C0, C1],
]
const SX: CMat2 = [
  [C0, C1],
  [C1, C0],
]
const SY: CMat2 = [
  [C0, CMI],
  [CI, C0],
]
const SZ: CMat2 = [
  [C1, C0],
  [C0, CM1],
]

const m2Add = (a: CMat2, b: CMat2): CMat2 => [
  [cAdd(a[0][0], b[0][0]), cAdd(a[0][1], b[0][1])],
  [cAdd(a[1][0], b[1][0]), cAdd(a[1][1], b[1][1])],
]
const m2Scale = (s: C, a: CMat2): CMat2 => [
  [cMul(s, a[0][0]), cMul(s, a[0][1])],
  [cMul(s, a[1][0]), cMul(s, a[1][1])],
]
const m2Mul = (a: CMat2, b: CMat2): CMat2 => [
  [
    cAdd(cMul(a[0][0], b[0][0]), cMul(a[0][1], b[1][0])),
    cAdd(cMul(a[0][0], b[0][1]), cMul(a[0][1], b[1][1])),
  ],
  [
    cAdd(cMul(a[1][0], b[0][0]), cMul(a[1][1], b[1][0])),
    cAdd(cMul(a[1][0], b[0][1]), cMul(a[1][1], b[1][1])),
  ],
]
const m2Dag = (a: CMat2): CMat2 => [
  [cConj(a[0][0]), cConj(a[1][0])],
  [cConj(a[0][1]), cConj(a[1][1])],
]
const m2Tr = (a: CMat2): C => cAdd(a[0][0], a[1][1])
const m2ExpPauli = (axis: CMat2, angle: number): CMat2 =>
  m2Add(m2Scale([Math.cos(angle), 0], I2), m2Scale([0, -Math.sin(angle)], axis))

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }

const cmatZero = (n: number): CMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })

const cmatEye = (n: number): CMat => {
  const m = cmatZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
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
      const err = Math.hypot(sr - (i === j ? 1 : 0), si)
      if (err > maxE) maxE = err
    }
  }
  return maxE
}

function tridiagQL(d: Float64Array, eIn: Float64Array, z: Float64Array | null, n: number): void {
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
      if (m === l) break
      iter++
      if (iter > 100) break
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
        if (z !== null) {
          for (let k = 0; k < n; k++) {
            const zki1 = z[k * n + (i + 1)]!
            const zki = z[k * n + i]!
            z[k * n + (i + 1)] = s * zki + c * zki1
            z[k * n + i] = c * zki - s * zki1
          }
        }
      }
      if (r === 0 && m > l) continue
      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }
}

// Fast exact real symmetric eigenvalues via Householder tridiagonalization + implicit QL
function realSymmetricEigenvalues(H: Float64Array, n: number): Float64Array {
  if (n === 1) return new Float64Array([H[0]!])
  const a = Float64Array.from(H)
  const d = new Float64Array(n)
  const e = new Float64Array(n)
  const p = new Float64Array(n)
  for (let i = n - 1; i >= 1; i--) {
    const l = i - 1
    let scale = 0
    for (let k = 0; k <= l; k++) scale += Math.abs(a[i * n + k]!)
    if (scale === 0 || l === 0) {
      e[i] = a[i * n + l]!
      continue
    }
    let h = 0
    for (let k = 0; k <= l; k++) {
      const v = a[i * n + k]! / scale
      a[i * n + k] = v
      h += v * v
    }
    const f = a[i * n + l]!
    const g = f >= 0 ? -Math.sqrt(h) : Math.sqrt(h)
    e[i] = scale * g
    h -= f * g
    a[i * n + l] = f - g
    let fDot = 0
    for (let j = 0; j <= l; j++) {
      let s = 0
      const jOff = j * n
      for (let k = 0; k <= j; k++) s += a[jOff + k]! * a[i * n + k]!
      for (let k = j + 1; k <= l; k++) s += a[k * n + j]! * a[i * n + k]!
      const pj = s / h
      p[j] = pj
      fDot += pj * a[i * n + j]!
    }
    const hh = fDot / (h + h)
    for (let j = 0; j <= l; j++) p[j] = p[j]! - hh * a[i * n + j]!
    for (let j = 0; j <= l; j++) {
      const aj = a[i * n + j]!
      const pj = p[j]!
      const jOff = j * n
      for (let k = 0; k <= j; k++) {
        a[jOff + k] = a[jOff + k]! - (aj * p[k]! + pj * a[i * n + k]!)
      }
    }
  }
  for (let i = 0; i < n; i++) d[i] = a[i * n + i]!
  e[0] = 0
  tridiagQL(d, e, null, n)
  d.sort()
  return d
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

function unitaryEigen(U: CMat): { readonly phases: Float64Array; readonly vecs: CMat; readonly maxRes: number } {
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
      const vr = V.re[r * n + col]!
      const vi = V.im[r * n + col]!
      const err = Math.hypot(uvr[r]! - (lr * vr - li * vi), uvi[r]! - (lr * vi + li * vr))
      if (err > maxRes) maxRes = err
    }
  }
  return { phases, vecs: V, maxRes }
}

// Exact banded complex matrix storage (lower bandwidth kl, upper bandwidth ku) + exact partial-pivoting LU solver!
type BandedCMat = {
  readonly n: number
  readonly kl: number
  readonly ku: number
  readonly w: number // 2 * kl + ku + 1
  readonly re: Float64Array
  readonly im: Float64Array
}

function bandedZero(n: number, kl: number, ku: number): BandedCMat {
  const w = 2 * kl + ku + 1
  return { n, kl, ku, w, re: new Float64Array(n * w), im: new Float64Array(n * w) }
}

function bandedAdd(B: BandedCMat, r: number, c: number, val: C): void {
  const off = c - r + B.kl
  assert(off >= 0 && off < B.w, `Banded out of range: r=${r}, c=${c}, kl=${B.kl}, ku=${B.ku}`)
  const idx = r * B.w + off
  B.re[idx] = B.re[idx]! + val[0]
  B.im[idx] = B.im[idx]! + val[1]
}

function bandedMatVec(B: BandedCMat, vr: Float64Array, vi: Float64Array): readonly [Float64Array, Float64Array] {
  const { n, kl, ku, w, re, im } = B
  const or = new Float64Array(n)
  const oi = new Float64Array(n)
  for (let r = 0; r < n; r++) {
    const cLo = Math.max(0, r - kl)
    const cHi = Math.min(n - 1, r + ku)
    let sr = 0
    let si = 0
    const rowOff = r * w
    for (let c = cLo; c <= cHi; c++) {
      const idx = rowOff + (c - r + kl)
      const ar = re[idx]!
      const ai = im[idx]!
      const xr = vr[c]!
      const xi = vi[c]!
      sr += ar * xr - ai * xi
      si += ar * xi + ai * xr
    }
    or[r] = sr
    oi[r] = si
  }
  return [or, oi]
}

function solveBandedComplex(
  B: BandedCMat,
  shift: C,
  bRe: Float64Array,
  bIm: Float64Array,
  arBuf?: Float64Array,
  aiBuf?: Float64Array,
  xrBuf?: Float64Array,
  xiBuf?: Float64Array,
): readonly [Float64Array, Float64Array] {
  const { n, kl, ku, w } = B
  const ar = arBuf && arBuf.length === B.re.length ? arBuf : new Float64Array(B.re.length)
  const ai = aiBuf && aiBuf.length === B.im.length ? aiBuf : new Float64Array(B.im.length)
  const xr = xrBuf && xrBuf.length === n ? xrBuf : new Float64Array(n)
  const xi = xiBuf && xiBuf.length === n ? xiBuf : new Float64Array(n)
  ar.set(B.re)
  ai.set(B.im)
  xr.set(bRe)
  xi.set(bIm)
  for (let i = 0; i < n; i++) {
    const idx = i * w + kl
    ar[idx] = ar[idx]! - shift[0]
    ai[idx] = ai[idx]! - shift[1]
  }
  const maxBand = kl + ku
  for (let col = 0; col < n; col++) {
    const rMax = Math.min(n - 1, col + kl)
    const cMax = Math.min(n - 1, col + maxBand)
    let piv = col
    let best = Math.hypot(ar[col * w + kl]!, ai[col * w + kl]!)
    for (let r = col + 1; r <= rMax; r++) {
      const idx = r * w + (col - r + kl)
      const v = Math.hypot(ar[idx]!, ai[idx]!)
      if (v > best) {
        best = v
        piv = r
      }
    }
    if (best < 1e-30) continue
    if (piv !== col) {
      for (let j = col; j <= cMax; j++) {
        const i1 = col * w + (j - col + kl)
        const i2 = piv * w + (j - piv + kl)
        let t = ar[i1]!
        ar[i1] = ar[i2]!
        ar[i2] = t
        t = ai[i1]!
        ai[i1] = ai[i2]!
        ai[i2] = t
      }
      let tb = xr[col]!
      xr[col] = xr[piv]!
      xr[piv] = tb
      tb = xi[col]!
      xi[col] = xi[piv]!
      xi[piv] = tb
    }
    const pIdx = col * w + kl
    const pr = ar[pIdx]!
    const pi = ai[pIdx]!
    const denom = pr * pr + pi * pi
    for (let r = col + 1; r <= rMax; r++) {
      const cIdx = r * w + (col - r + kl)
      const fr0 = ar[cIdx]!
      const fi0 = ai[cIdx]!
      if (fr0 === 0 && fi0 === 0) continue
      const fr = (fr0 * pr + fi0 * pi) / denom
      const fi = (fi0 * pr - fr0 * pi) / denom
      ar[cIdx] = 0
      ai[cIdx] = 0
      for (let j = col + 1; j <= cMax; j++) {
        const dst = r * w + (j - r + kl)
        const src = col * w + (j - col + kl)
        const sr = ar[src]!
        const si = ai[src]!
        ar[dst] = ar[dst]! - (fr * sr - fi * si)
        ai[dst] = ai[dst]! - (fr * si + fi * sr)
      }
      xr[r] = xr[r]! - (fr * xr[col]! - fi * xi[col]!)
      xi[r] = xi[r]! - (fr * xi[col]! + fi * xr[col]!)
    }
  }
  for (let r = n - 1; r >= 0; r--) {
    let sr = xr[r]!
    let si = xi[r]!
    const cMax = Math.min(n - 1, r + maxBand)
    for (let j = r + 1; j <= cMax; j++) {
      const idx = r * w + (j - r + kl)
      sr -= ar[idx]! * xr[j]! - ai[idx]! * xi[j]!
      si -= ar[idx]! * xi[j]! + ai[idx]! * xr[j]!
    }
    const pIdx = r * w + kl
    const pr = ar[pIdx]!
    const pi = ai[pIdx]!
    const denom = pr * pr + pi * pi
    xr[r] = (sr * pr + si * pi) / denom
    xi[r] = (si * pr - sr * pi) / denom
  }
  return [xr, xi]
}

function bandedShiftInvert(
  B: BandedCMat,
  targetE: number,
  seedRe?: Float64Array,
  seedIm?: Float64Array,
  iters = 7,
): {
  readonly E: number
  readonly res: number
  readonly p0: number
  readonly pEdge: number
  readonly vr: Float64Array
  readonly vi: Float64Array
} {
  const dim = B.n
  let lam = cExpI(targetE)
  const vr = new Float64Array(dim)
  const vi = new Float64Array(dim)
  if (seedRe && seedIm && seedRe.length === dim) {
    vr.set(seedRe)
    vi.set(seedIm)
  } else {
    vr[0] = 1
    for (let r = 1; r < Math.min(dim, 40); r++) {
      vr[r] = Math.exp(-0.08 * r)
    }
  }
  const arBuf = new Float64Array(B.re.length)
  const aiBuf = new Float64Array(B.im.length)
  const xrBuf = new Float64Array(dim)
  const xiBuf = new Float64Array(dim)
  for (let it = 0; it < iters; it++) {
    const eps = it === 0 ? 3e-4 : 1e-11
    const sh: C = [lam[0] * (1 + eps), lam[1] * (1 + eps)]
    const [xr, xi] = solveBandedComplex(B, sh, vr, vi, arBuf, aiBuf, xrBuf, xiBuf)
    let n2 = 0
    for (let i = 0; i < dim; i++) n2 += xr[i]! * xr[i]! + xi[i]! * xi[i]!
    const inv = 1 / Math.sqrt(n2)
    for (let i = 0; i < dim; i++) {
      vr[i] = xr[i]! * inv
      vi[i] = xi[i]! * inv
    }
    const [uvr, uvi] = bandedMatVec(B, vr, vi)
    let lr = 0
    let li = 0
    for (let i = 0; i < dim; i++) {
      lr += vr[i]! * uvr[i]! + vi[i]! * uvi[i]!
      li += vr[i]! * uvi[i]! - vi[i]! * uvr[i]!
    }
    const la = Math.hypot(lr, li)
    lam = [lr / la, li / la]
  }
  const [uvr, uvi] = bandedMatVec(B, vr, vi)
  let res2 = 0
  for (let i = 0; i < dim; i++) {
    const dr = uvr[i]! - (lam[0] * vr[i]! - lam[1] * vi[i]!)
    const di = uvi[i]! - (lam[0] * vi[i]! + lam[1] * vr[i]!)
    res2 += dr * dr + di * di
  }
  const p0 = vr[0]! ** 2 + vi[0]! ** 2
  const idxH = dim - 3
  const pEdge =
    vr[idxH]! ** 2 +
    vi[idxH]! ** 2 +
    vr[idxH + 1]! ** 2 +
    vi[idxH + 1]! ** 2 +
    vr[idxH + 2]! ** 2 +
    vi[idxH + 2]! ** 2
  return { E: Math.atan2(lam[1], lam[0]), res: Math.sqrt(res2), p0, pEdge, vr, vi }
}

// ============================================================================
// PART M1: PURE-Z[omega][1/2] FINITE-SLAB CHIRAL WALK MASS HIERARCHY
// ============================================================================

// Exact Eisenstein integer a + b * omega (omega^2 + omega + 1 = 0, conj(omega) = -1 - omega)
type ZO = readonly [bigint, bigint]
const ZO_0: ZO = [0n, 0n]
const zoAdd = (x: ZO, y: ZO): ZO => [x[0] + y[0], x[1] + y[1]]
const zoNeg = (x: ZO): ZO => [-x[0], -x[1]]
const zoConj = (x: ZO): ZO => [x[0] - x[1], -x[1]] // conj(a + b w) = a + b(-1 - w) = (a-b) - b w
const zoMul = (x: ZO, y: ZO): ZO => {
  // (a + b w)(c + d w) = (ac - bd) + (ad + bc - bd) w
  const bd = x[1] * y[1]
  return [x[0] * y[0] - bd, x[0] * y[1] + x[1] * y[0] - bd]
}
const zoToC = (x: ZO, scale: number): C => [
  scale * (Number(x[0]) - 0.5 * Number(x[1])),
  scale * (0.5 * SQRT3 * Number(x[1])),
]

// Exact BigInt matrix 8 * U_depth(D_*) strictly inside Z[omega] (so U_depth in (1/8) Z[omega] subset Z[omega][1/2]!):
//   Basis: index 2*d = |d, L>, index 2*d + 1 = |d, R>, d = 0..D_* (dim = 2*(D_* + 1))
//   2 * (i C_1(pi/3)) = [[2w + 1, 1], [1, 2w + 1]] on each (|d, L>, |d, R>)
//   2 * B_2(2pi/3)    = [[-1, -(2w + 1)], [-(2w + 1), -1]] on each bond (|d, R>, |d+1, L>), and +2 on |0, L>, |D_*, R>
//   8 * U_depth(D_*)  = - (2 i C_1) * (2 B_2) * (2 i C_1)  (EXACT BigInt Z[omega]!)
function buildExactSlabDepthBigInt(Dstar: number): { readonly dim: number; readonly M8: ZO[] } {
  const dim = 2 * (Dstar + 1)
  const A2: ZO[] = Array.from({ length: dim * dim }, () => ZO_0)
  const B2: ZO[] = Array.from({ length: dim * dim }, () => ZO_0)
  const W2P1: ZO = [1n, 2n] // 2*omega + 1 = i * sqrt(3)
  const MW2P1: ZO = [-1n, -2n] // -(2*omega + 1) = -i * sqrt(3)
  const ONE: ZO = [1n, 0n]
  const MONE: ZO = [-1n, 0n]
  const TWO: ZO = [2n, 0n]

  for (let d = 0; d <= Dstar; d++) {
    const l = 2 * d
    const r = 2 * d + 1
    A2[l * dim + l] = W2P1
    A2[l * dim + r] = ONE
    A2[r * dim + l] = ONE
    A2[r * dim + r] = W2P1
  }
  // Open endpoints |0, L> and |D_*, R> get identity (+2 in 2*B_2)
  B2[0 * dim + 0] = TWO
  B2[(dim - 1) * dim + (dim - 1)] = TWO
  // Inter-layer bonds (|d, R>, |d+1, L>)
  for (let d = 0; d < Dstar; d++) {
    const r = 2 * d + 1
    const lNext = 2 * (d + 1)
    B2[r * dim + r] = MONE
    B2[r * dim + lNext] = MW2P1
    B2[lNext * dim + r] = MW2P1
    B2[lNext * dim + lNext] = MONE
  }

  const mulZO = (X: readonly ZO[], Y: readonly ZO[]): ZO[] => {
    const out: ZO[] = Array.from({ length: dim * dim }, () => ZO_0)
    for (let i = 0; i < dim; i++) {
      for (let k = 0; k < dim; k++) {
        const xik = X[i * dim + k]!
        if (xik[0] === 0n && xik[1] === 0n) continue
        for (let j = 0; j < dim; j++) {
          const ykj = Y[k * dim + j]!
          if (ykj[0] === 0n && ykj[1] === 0n) continue
          out[i * dim + j] = zoAdd(out[i * dim + j]!, zoMul(xik, ykj))
        }
      }
    }
    return out
  }

  const tmp = mulZO(B2, A2)
  const prod = mulZO(A2, tmp)
  const M8 = prod.map(zoNeg)
  return { dim, M8 }
}

function slabBigIntToCMat(dim: number, M8: readonly ZO[]): CMat {
  const U = cmatZero(dim)
  for (let i = 0; i < dim * dim; i++) {
    const c = zoToC(M8[i]!, 0.125)
    U.re[i] = c[0]
    U.im[i] = c[1]
  }
  return U
}

// General unitary radial chiral slab (used for warped {3,4,3,4} Steinberg branching comparison):
//   C_1 = exp(-i (pi/6) sigma_x) on each layer d = 0..D_*
//   B_branch(b_d) = [[-(b_d - 1)/(b_d + 1), -i 2 sqrt(b_d)/(b_d + 1)], [-i 2 sqrt(b_d)/(b_d + 1), -(b_d - 1)/(b_d + 1)]]
//   Notice at b_d = 3: -(3-1)/(3+1) = -1/2 = cos(2pi/3), -i 2 sqrt(3)/4 = -i sqrt(3)/2 = -i sin(2pi/3) -> EXACTLY B_2(2pi/3)!
function buildWarpedSlabDepth(branchFactors: readonly number[]): CMat {
  const Dstar = branchFactors.length
  const dim = 2 * (Dstar + 1)
  const c1 = Math.cos(PI / 6)
  const s1 = Math.sin(PI / 6)

  const C1 = cmatZero(dim)
  const B = cmatZero(dim)
  for (let d = 0; d <= Dstar; d++) {
    const l = 2 * d
    const r = 2 * d + 1
    C1.re[l * dim + l] = c1
    C1.re[r * dim + r] = c1
    C1.im[l * dim + r] = -s1
    C1.im[r * dim + l] = -s1
  }
  B.re[0 * dim + 0] = 1
  B.re[(dim - 1) * dim + (dim - 1)] = 1
  for (let d = 0; d < Dstar; d++) {
    const b = branchFactors[d]!
    const cosA = -(b - 1) / (b + 1)
    const sinA = (2 * Math.sqrt(b)) / (b + 1)
    const r = 2 * d + 1
    const lNext = 2 * (d + 1)
    B.re[r * dim + r] = cosA
    B.re[lNext * dim + lNext] = cosA
    B.im[r * dim + lNext] = -sinA
    B.im[lNext * dim + r] = -sinA
  }
  const mulC = (X: CMat, Y: CMat): CMat => {
    const out = cmatZero(dim)
    for (let i = 0; i < dim; i++) {
      for (let k = 0; k < dim; k++) {
        const xr = X.re[i * dim + k]!
        const xi = X.im[i * dim + k]!
        if (xr === 0 && xi === 0) continue
        for (let j = 0; j < dim; j++) {
          const yr = Y.re[k * dim + j]!
          const yi = Y.im[k * dim + j]!
          out.re[i * dim + j] = out.re[i * dim + j]! + (xr * yr - xi * yi)
          out.im[i * dim + j] = out.im[i * dim + j]! + (xr * yi + xi * yr)
        }
      }
    }
    return out
  }
  return mulC(C1, mulC(B, C1))
}

type SlabModeData = {
  readonly Dstar: number
  readonly dim: number
  readonly U: CMat
  readonly mEff: number
  readonly eBulkMin: number
  readonly psiLRe: Float64Array
  readonly psiLIm: Float64Array
  readonly psiRRe: Float64Array
  readonly psiRIm: Float64Array
  readonly chiralLeakL: number
  readonly chiralLeakR: number
  readonly overlapLL: number
  readonly overlapLR: number
}

function extractSlabChiralModes(Dstar: number, U: CMat): SlabModeData {
  const dim = U.n
  const eig = unitaryEigen(U)
  // Find positive-phase eigenstate with smallest |E| -> |psi_-> (eigenvalue e^{+i mEff})
  // and its exact chiral partner |psi_+> = sigma_z |psi_-> (eigenvalue e^{-i mEff})
  let bestPosIdx = -1
  let bestPosE = Infinity
  let eBulkMin = Infinity
  const posPhases: number[] = []
  for (let c = 0; c < dim; c++) {
    const ph = eig.phases[c]!
    if (ph > 0) posPhases.push(ph)
    if (ph > 0 && ph < bestPosE) {
      bestPosE = ph
      bestPosIdx = c
    }
  }
  posPhases.sort((a, b) => a - b)
  eBulkMin = posPhases.length >= 2 ? posPhases[1]! : PI
  assert(bestPosIdx >= 0, `Failed to find positive light eigenvalue at D_*=${Dstar}`)

  // Build |psi_-> from eigenvector bestPosIdx, and |psi_+> = sigma_z |psi_-> (exact partner!)
  // Check that U |psi_+> = e^{-i mEff} |psi_+>, then define:
  //   |psi_L> = (|psi_+> + |psi_->) / sqrt(2)   (sigma_z = +1)
  //   |psi_R> = (|psi_+> - |psi_->) / sqrt(2)   (sigma_z = -1)
  const pmR = new Float64Array(dim)
  const pmI = new Float64Array(dim)
  const ppR = new Float64Array(dim)
  const ppI = new Float64Array(dim)
  for (let r = 0; r < dim; r++) {
    const vr = eig.vecs.re[r * dim + bestPosIdx]!
    const vi = eig.vecs.im[r * dim + bestPosIdx]!
    pmR[r] = vr
    pmI[r] = vi
    const sgn = r % 2 === 0 ? 1 : -1 // sigma_z: +1 on L (even), -1 on R (odd)
    ppR[r] = sgn * vr
    ppI[r] = sgn * vi
  }

  // Fix overall phase so |psi_L> has positive real amplitude on |0, L>
  const psiLRe = new Float64Array(dim)
  const psiLIm = new Float64Array(dim)
  const psiRRe = new Float64Array(dim)
  const psiRIm = new Float64Array(dim)
  const invS2 = 1 / SQRT2
  for (let r = 0; r < dim; r++) {
    psiLRe[r] = invS2 * (ppR[r]! + pmR[r]!)
    psiLIm[r] = invS2 * (ppI[r]! + pmI[r]!)
    psiRRe[r] = invS2 * (ppR[r]! - pmR[r]!)
    psiRIm[r] = invS2 * (ppI[r]! - pmI[r]!)
  }

  let chiralLeakL = 0
  let chiralLeakR = 0
  let overlapLL = 0
  let overlapLR = 0
  for (let d = 0; d <= Dstar; d++) {
    const pLL = psiLRe[2 * d]! ** 2 + psiLIm[2 * d]! ** 2
    const pLR = psiLRe[2 * d + 1]! ** 2 + psiLIm[2 * d + 1]! ** 2
    const pRL = psiRRe[2 * d]! ** 2 + psiRIm[2 * d]! ** 2
    const pRR = psiRRe[2 * d + 1]! ** 2 + psiRIm[2 * d + 1]! ** 2
    chiralLeakL += pLR
    chiralLeakR += pRL
    overlapLL += pLL * pLL
    overlapLR += pLL * pRR
  }

  return {
    Dstar,
    dim,
    U,
    mEff: bestPosE,
    eBulkMin,
    psiLRe,
    psiLIm,
    psiRRe,
    psiRIm,
    chiralLeakL,
    chiralLeakR,
    overlapLL,
    overlapLR,
  }
}

function solveSteinbergLambda(): number {
  let x = 18.28
  for (let i = 0; i < 40; i++) {
    const f = ((x - 21) * x + 51) * x - 23
    const df = (3 * x - 42) * x + 51
    x -= f / df
  }
  return x
}

function runM1(): { readonly slabs: SlabModeData[]; readonly warpedMasses: number[]; readonly steinbergLam: number } {
  console.log('================================================================================')
  console.log('PART M1: PURE-Z[omega][1/2] FINITE-SLAB CHIRAL WALK MASS HIERARCHY (D_* = 0..10)')
  console.log('================================================================================')

  let maxBigIntUniErr = 0n
  let maxBigIntChiralErr = 0n
  let exactD1TraceOk = false
  const slabs: SlabModeData[] = []

  console.log('\n  [M1.1] Exact BigInt Z[omega][1/2] Verification & Emergent IR Mass Ladder (ZERO small parameters!):')
  console.log('         D_* | dim | BigInt Uni/Chi | m_eff(D_*)  | m(D)/m(D-1) | (4s3/9)*3^-D | E_bulk_min | R_1=tan(m)/m')

  for (let Dstar = 0; Dstar <= 10; Dstar++) {
    const { dim, M8 } = buildExactSlabDepthBigInt(Dstar)
    // Exact BigInt unitarity: (8 U)^dag (8 U) == 64 I (0n error!)
    for (let i = 0; i < dim; i++) {
      for (let j = i; j < dim; j++) {
        let sum: ZO = ZO_0
        for (let k = 0; k < dim; k++) {
          sum = zoAdd(sum, zoMul(zoConj(M8[k * dim + i]!), M8[k * dim + j]!))
        }
        const target0 = i === j ? 64n : 0n
        const e0 = sum[0] >= target0 ? sum[0] - target0 : target0 - sum[0]
        const e1 = sum[1] >= 0n ? sum[1] : -sum[1]
        if (e0 > maxBigIntUniErr) maxBigIntUniErr = e0
        if (e1 > maxBigIntUniErr) maxBigIntUniErr = e1
      }
    }
    // Exact BigInt chiral symmetry: sigma_z (8 U) sigma_z == (8 U)^dag (0n error!)
    for (let i = 0; i < dim; i++) {
      const si = i % 2 === 0 ? 1n : -1n
      for (let j = 0; j < dim; j++) {
        const sj = j % 2 === 0 ? 1n : -1n
        const sgn = si * sj
        const lhs = M8[i * dim + j]!
        const rhs = zoConj(M8[j * dim + i]!)
        const d0 = sgn * lhs[0] - rhs[0]
        const d1 = sgn * lhs[1] - rhs[1]
        const ad0 = d0 >= 0n ? d0 : -d0
        const ad1 = d1 >= 0n ? d1 : -d1
        if (ad0 > maxBigIntChiralErr) maxBigIntChiralErr = ad0
        if (ad1 > maxBigIntChiralErr) maxBigIntChiralErr = ad1
      }
    }
    if (Dstar === 1) {
      // Exact BigInt trace check: Tr(8 U_depth(1)) = 4 (= 8 * 1/2), Tr((8 U_depth(1))^2) = 112 (= 64 * 7/4)
      let tr1: ZO = ZO_0
      let tr2: ZO = ZO_0
      for (let i = 0; i < dim; i++) {
        tr1 = zoAdd(tr1, M8[i * dim + i]!)
        for (let k = 0; k < dim; k++) {
          tr2 = zoAdd(tr2, zoMul(M8[i * dim + k]!, M8[k * dim + i]!))
        }
      }
      exactD1TraceOk = tr1[0] === 4n && tr1[1] === 0n && tr2[0] === 112n && tr2[1] === 0n
    }

    const U = slabBigIntToCMat(dim, M8)
    const data = extractSlabChiralModes(Dstar, U)
    slabs.push(data)

    const prevM = Dstar > 0 ? slabs[Dstar - 1]!.mEff : NaN
    const ratioStr = Dstar > 0 ? (data.mEff / prevM).toFixed(6) : '   ---  '
    const asym = ((4 * SQRT3) / 9) * 3 ** -Dstar
    const r1 = Math.tan(data.mEff) / data.mEff
    console.log(
      `          ${String(Dstar).padStart(2)} | ${String(dim).padStart(3)} |   0n / 0n      | ` +
        `${data.mEff.toFixed(9)} | ${ratioStr.padStart(11)} | ${asym.toFixed(9)}  | ` +
        `${data.eBulkMin.toFixed(6)}   | ${r1.toFixed(6)}`,
    )
  }

  const m0Err = Math.abs(slabs[0]!.mEff - PI / 3)
  const exactM1 = Math.acos((1 + 3 * SQRT5) / 8)
  const exactE2D1 = Math.acos((1 - 3 * SQRT5) / 8)
  const m1Err = Math.abs(slabs[1]!.mEff - exactM1)
  const e2D1Err = Math.abs(slabs[1]!.eBulkMin - exactE2D1)
  const ratio10 = slabs[10]!.mEff / slabs[9]!.mEff
  const ratio10Err = Math.abs(ratio10 - 1 / 3)
  const asym10RelErr = Math.abs(slabs[10]!.mEff - ((4 * SQRT3) / 9) * 3 ** -10) / slabs[10]!.mEff

  // Exact zero-mode decay profile check on D_* = 6: psi_L(d+1) / psi_L(d) -> -1/3
  const s6 = slabs[6]!
  const profRatio01 = s6.psiLRe[2]! / s6.psiLRe[0]!
  const profRatio12 = s6.psiLRe[4]! / s6.psiLRe[2]!

  console.log(
    `         Exact analytic checks: m_eff(0)-pi/3 = ${m0Err.toExponential(2)}, ` +
      `m_eff(1)-acos((1+3s5)/8) = ${m1Err.toExponential(2)} (${exactM1.toFixed(6)}), ` +
      `E_bulk(1)-acos((1-3s5)/8) = ${e2D1Err.toExponential(2)} (${exactE2D1.toFixed(6)})`,
  )
  console.log(
    `         Exact decay ratio: m(10)/m(9) = ${ratio10.toFixed(9)} (|diff - 1/3| = ${ratio10Err.toExponential(2)}), ` +
      `asym(D=10) relErr = ${asym10RelErr.toExponential(2)}, psi_L(1)/psi_L(0) = ${profRatio01.toFixed(6)}, psi_L(2)/psi_L(1) = ${profRatio12.toFixed(6)}`,
  )

  // --- M1.2: Warped {3,4,3,4} Steinberg Branching Comparison ---
  const steinbergLam = solveSteinbergLambda()
  const a1Warp = Math.cbrt(steinbergLam)
  const nShell = [1, 18, 330, 6034]
  for (let d = 4; d <= 9; d++) {
    nShell.push(21 * nShell[d - 1]! - 51 * nShell[d - 2]! + 23 * nShell[d - 3]!)
  }
  const rWarpedAsym = 1 / Math.sqrt(3 * steinbergLam)
  console.log('\n  [M1.2] Warped {3,4,3,4} Steinberg Cusp Branching Comparison (exact unitary radial walk B_branch(N_{d+1}/N_d)):')
  console.log(
    `         Steinberg lambda = ${steinbergLam.toFixed(9)}, a_1 = lambda^(1/3) = ${a1Warp.toFixed(6)}, ` +
      `flat r = 1/3 = 0.333333 vs warped r = 1/sqrt(3 lambda) = ${rWarpedAsym.toFixed(6)}`,
  )
  let maxWarpUniErr = 0
  let maxWarpChiErr = 0
  const warpedMasses: number[] = []
  for (let Dstar = 0; Dstar <= 6; Dstar++) {
    const bArr: number[] = []
    for (let d = 0; d < Dstar; d++) bArr.push(nShell[d + 1]! / nShell[d]!)
    const Uw = buildWarpedSlabDepth(bArr)
    maxWarpUniErr = Math.max(maxWarpUniErr, cmatUnitaryErr(Uw))
    // Check sigma_z Uw sigma_z == Uw^dag
    for (let i = 0; i < Uw.n; i++) {
      const si = i % 2 === 0 ? 1 : -1
      for (let j = 0; j < Uw.n; j++) {
        const sj = j % 2 === 0 ? 1 : -1
        const err = Math.hypot(
          si * sj * Uw.re[i * Uw.n + j]! - Uw.re[j * Uw.n + i]!,
          si * sj * Uw.im[i * Uw.n + j]! + Uw.im[j * Uw.n + i]!,
        )
        if (err > maxWarpChiErr) maxWarpChiErr = err
      }
    }
    const md = extractSlabChiralModes(Dstar, Uw)
    warpedMasses.push(md.mEff)
    const prevW = Dstar > 0 ? warpedMasses[Dstar - 1]! : NaN
    const ratStr = Dstar > 0 ? (md.mEff / prevW).toFixed(6) : '   ---  '
    console.log(
      `         D_*=${Dstar} (N_D=${String(nShell[Dstar]!).padStart(8)}): ` +
        `m_warped = ${md.mEff.toExponential(5)} (ratio = ${ratStr}), ` +
        `m_flat = ${slabs[Dstar]!.mEff.toExponential(5)}, speedup = ${(slabs[Dstar]!.mEff / md.mEff).toFixed(2)}x`,
    )
  }
  const warpRatio6 = warpedMasses[6]! / warpedMasses[5]!
  const warpRatioErr = Math.abs(warpRatio6 - rWarpedAsym)
  const dStarFlatEW = Math.ceil(17 / Math.log10(3))
  const dStarWarpEW = Math.ceil(17 / -Math.log10(rWarpedAsym))
  const dStarWarpFullEW = Math.ceil(17 / -Math.log10(rWarpedAsym / a1Warp))
  console.log(
    `         Depth to reach v_EW/M_Pl ~ 10^-17: flat Z[w][1/2] (r=1/3) -> D_*=${dStarFlatEW}; ` +
      `warped radial branching (r=0.1350) -> D_*=${dStarWarpEW}; with a_1^-D husk redshift -> D_*=${dStarWarpFullEW}`,
  )

  recordCheck(
    'M1.1',
    'Exact BigInt Z[omega][1/2] unitarity & chiral symmetry across D_* = 0..10 (ZERO small inputs)',
    maxBigIntUniErr === 0n && maxBigIntChiralErr === 0n && exactD1TraceOk,
    `BigInt uniErr=${maxBigIntUniErr}n, chiralErr=${maxBigIntChiralErr}n, D_*=1 exact Tr(8U)=4n & Tr(64U^2)=112n`,
  )
  recordCheck(
    'M1.2',
    'Exact closed forms m_eff(0)=pi/3, m_eff(1)=acos((1+3s5)/8), E_bulk(1)=acos((1-3s5)/8) & r -> 1/3',
    m0Err < 1e-14 && m1Err < 1e-14 && e2D1Err < 1e-14 && ratio10Err < 1e-7 && asym10RelErr < 1e-6,
    `m(0) err=${m0Err.toExponential(1)}, m(1)=${slabs[1]!.mEff.toFixed(6)} (err=${m1Err.toExponential(1)}), E_bulk(1)=${slabs[1]!.eBulkMin.toFixed(6)} (err=${e2D1Err.toExponential(1)}), m(10)/m(9)=${ratio10.toFixed(8)}`,
  )
  recordCheck(
    'M1.3',
    'Exact unitary warped {3,4,3,4} Steinberg radial branching comparison (b_d = N_{d+1}/N_d -> lambda)',
    maxWarpUniErr < 1e-14 && maxWarpChiErr < 1e-14 && warpRatioErr < 2e-3 && warpedMasses[6]! < slabs[6]!.mEff / 100,
    `uniErr=${maxWarpUniErr.toExponential(1)}, chiErr=${maxWarpChiErr.toExponential(1)}, r_warped(6)=${warpRatio6.toFixed(6)} vs 1/sqrt(3 lam)=${rWarpedAsym.toFixed(6)}, D_*=6 suppression ${(slabs[6]!.mEff / warpedMasses[6]!).toFixed(1)}x faster`,
  )

  return { slabs, warpedMasses, steinbergLam }
}

// ============================================================================
// PART M2: ZERO-LEAKAGE 1+1D & 3+1D MASSIVE DIRAC DISPERSION (W16 WEYL QCA)
// ============================================================================

// Verbatim W16 c = 1.0000 single-speed palindromic 3D Weyl QCA U_Weyl,pal(qx, qy, qz) in SU(2)
// using bare Vibe coin angle theta = pi/3:
const SIGMA_AXIS: readonly CMat2[] = [SX, SY, SZ]
const COIN_AXIS: readonly CMat2[] = [SY, SZ, SX]

function shiftWeyl1D(mu: number, qmu: number, sign: 1 | -1): CMat2 {
  const sig = SIGMA_AXIS[mu]!
  const ph = sign === 1 ? cExpI(-qmu) : cExpI(qmu)
  const pPlus = m2Scale([0.5, 0], m2Add(I2, sig))
  const pMinus = m2Scale([0.5, 0], m2Add(I2, m2Scale([-1, 0], sig)))
  return sign === 1 ? m2Add(m2Scale(ph, pPlus), pMinus) : m2Add(pPlus, m2Scale(ph, pMinus))
}

function stepWeyl1D(mu: number, qmu: number, thetaSign: 1 | -1): CMat2 {
  const th = thetaSign * (PI / 3)
  const cHalfNeg = m2ExpPauli(COIN_AXIS[mu]!, -0.5 * th)
  const cFullPos = m2ExpPauli(COIN_AXIS[mu]!, th)
  const sP = shiftWeyl1D(mu, qmu, 1)
  const sM = shiftWeyl1D(mu, qmu, -1)
  return m2Mul(cHalfNeg, m2Mul(sP, m2Mul(cFullPos, m2Mul(sM, cHalfNeg))))
}

function uWeylPal(qx: number, qy: number, qz: number): CMat2 {
  const f1 = m2Mul(stepWeyl1D(2, qz, 1), m2Mul(stepWeyl1D(1, qy, 1), stepWeyl1D(0, qx, 1)))
  const f2 = m2Mul(stepWeyl1D(0, qx, -1), m2Mul(stepWeyl1D(1, qy, -1), stepWeyl1D(2, qz, -1)))
  return m2Mul(f2, f1)
}

// Build full 4(D_* + 1) x 4(D_* + 1) 3+1D slab unitary U_{3+1D}(k; D_*) = S_husk(k) * (U_depth(D_*) (x) I_2)
// Index ordering: (2 * depthIdx + spin), where depthIdx = 2*d (L) or 2*d + 1 (R), spin in {0, 1}.
function buildSlab3D(Udepth: CMat, qx: number, qy: number, qz: number): { readonly U: CMat; readonly omegaWeyl: number } {
  const nD = Udepth.n
  const dim = 2 * nD
  const uW = uWeylPal(qx, qy, qz)
  const uWDag = m2Dag(uW)
  const cosW = Math.max(-1, Math.min(1, 0.5 * m2Tr(uW)[0]))
  const omegaWeyl = Math.acos(cosW)

  const U = cmatZero(dim)
  for (let iD = 0; iD < nD; iD++) {
    const W = iD % 2 === 0 ? uW : uWDag // L (even) gets U_Weyl(k); R (odd) gets U_Weyl(k)^dag
    for (let jD = 0; jD < nD; jD++) {
      const dr = Udepth.re[iD * nD + jD]!
      const di = Udepth.im[iD * nD + jD]!
      if (dr === 0 && di === 0) continue
      const uVal: C = [dr, di]
      for (let sOut = 0; sOut < 2; sOut++) {
        for (let sIn = 0; sIn < 2; sIn++) {
          const val = cMul(W[sOut]![sIn]!, uVal)
          const r = 2 * iD + sOut
          const c = 2 * jD + sIn
          U.re[r * dim + c] = U.re[r * dim + c]! + val[0]
          U.im[r * dim + c] = U.im[r * dim + c]! + val[1]
        }
      }
    }
  }
  return { U, omegaWeyl }
}

// Build full 2(D_* + 1) x 2(D_* + 1) 1+1D slab unitary U_{1+1D}(k; D_*) = diag(e^{-ik}, e^{+ik}) * U_depth(D_*)
function buildSlab1D(Udepth: CMat, k: number): CMat {
  const nD = Udepth.n
  const U = cmatZero(nD)
  const eN = cExpI(-k)
  const eP = cExpI(k)
  for (let i = 0; i < nD; i++) {
    const ph = i % 2 === 0 ? eN : eP
    for (let j = 0; j < nD; j++) {
      const v = cMul(ph, [Udepth.re[i * nD + j]!, Udepth.im[i * nD + j]!])
      U.re[i * nD + j] = v[0]
      U.im[i * nD + j] = v[1]
    }
  }
  return U
}

function runM2(slabs: readonly SlabModeData[]): void {
  console.log('\n================================================================================')
  console.log('PART M2: ZERO-LEAKAGE 1+1D & 3+1D MASSIVE DIRAC DISPERSION (W16 WEYL QCA)')
  console.log('================================================================================')

  // 1) 1+1D exact slab dispersion across D_* = 0..4 and k in [-pi, pi)
  let max1DDispErr = 0
  let max1DLeak = 0
  for (let Dstar = 0; Dstar <= 4; Dstar++) {
    const s = slabs[Dstar]!
    const m = s.mEff
    const cm = Math.cos(m)
    for (let ik = 0; ik < 8; ik++) {
      const k = -PI + (TWO_PI * ik) / 8 + 0.13
      const U1 = buildSlab1D(s.U, k)
      const eig = unitaryEigen(U1)
      const predCos = cm * Math.cos(k)
      // Find the two eigenvalues closest in cos(E) to predCos (must match exact +-E pair!)
      const errs = Array.from(eig.phases, ph => Math.abs(Math.cos(ph) - predCos)).sort((a, b) => a - b)
      max1DDispErr = Math.max(max1DDispErr, errs[0]!, errs[1]!)
      // Direct zero-leakage check: norm of (I - P_light) U1 |psi_L> and (I - P_light) U1 |psi_R>
      for (const [vr, vi] of [
        [s.psiLRe, s.psiLIm],
        [s.psiRRe, s.psiRIm],
      ] as const) {
        const wr = new Float64Array(s.dim)
        const wi = new Float64Array(s.dim)
        for (let r = 0; r < s.dim; r++) {
          let sr = 0
          let si = 0
          for (let c = 0; c < s.dim; c++) {
            sr += U1.re[r * s.dim + c]! * vr[c]! - U1.im[r * s.dim + c]! * vi[c]!
            si += U1.re[r * s.dim + c]! * vi[c]! + U1.im[r * s.dim + c]! * vr[c]!
          }
          wr[r] = sr
          wi[r] = si
        }
        // Project onto span{|psi_L>, |psi_R>}
        const dot = (ar: Float64Array, ai: Float64Array, br: Float64Array, bi: Float64Array): C => {
          let sr = 0
          let si = 0
          for (let i = 0; i < s.dim; i++) {
            sr += ar[i]! * br[i]! + ai[i]! * bi[i]!
            si += ar[i]! * bi[i]! - ai[i]! * br[i]!
          }
          return [sr, si]
        }
        const cL = dot(s.psiLRe, s.psiLIm, wr, wi)
        const cR = dot(s.psiRRe, s.psiRIm, wr, wi)
        let resSq = 0
        for (let i = 0; i < s.dim; i++) {
          const pR =
            cL[0] * s.psiLRe[i]! - cL[1] * s.psiLIm[i]! + (cR[0] * s.psiRRe[i]! - cR[1] * s.psiRIm[i]!)
          const pI =
            cL[0] * s.psiLIm[i]! + cL[1] * s.psiLRe[i]! + (cR[0] * s.psiRIm[i]! + cR[1] * s.psiRRe[i]!)
          const dr = wr[i]! - pR
          const di = wi[i]! - pI
          resSq += dr * dr + di * di
        }
        const leak = Math.sqrt(resSq)
        if (leak > max1DLeak) max1DLeak = leak
      }
    }
  }

  // 2) Full 4(D_* + 1) x 4(D_* + 1) 3+1D slab spectrum across BZ_3 for D_* = 0, 1, 2, 3
  console.log('\n  [M2.1] Full 4(D_*+1) x 4(D_*+1) 3+1D Slab Spectrum Coupled to W16 Weyl QCA Across BZ_3:')
  console.log('         D_* | 4(D+1) | m_eff(D_*) | max |cos E - cos m cos w| | bulkLeak   | R_1([100],[110],[111])')

  let max3DUniErr = 0
  let max3DDispErr = 0
  let max3DLeak = 0
  const r1Table: number[] = []
  const dirs3D: readonly (readonly [string, readonly [number, number, number]])[] = [
    ['[1,0,0]', [1, 0, 0]],
    ['[1,1,0]', [1 / SQRT2, 1 / SQRT2, 0]],
    ['[1,1,1]', [1 / SQRT3, 1 / SQRT3, 1 / SQRT3]],
  ]

  for (let Dstar = 0; Dstar <= 3; Dstar++) {
    const s = slabs[Dstar]!
    const dim3 = 2 * s.dim
    const cm = Math.cos(s.mEff)
    let dMaxDisp = 0
    let dMaxLeak = 0

    // 4-vector orthonormal light basis |psi_L, 0>, |psi_L, 1>, |psi_R, 0>, |psi_R, 1> in C^{4(D_*+1)}
    const basisR: Float64Array[] = []
    const basisI: Float64Array[] = []
    for (const [vr, vi] of [
      [s.psiLRe, s.psiLIm],
      [s.psiRRe, s.psiRIm],
    ] as const) {
      for (let sp = 0; sp < 2; sp++) {
        const br = new Float64Array(dim3)
        const bi = new Float64Array(dim3)
        for (let iD = 0; iD < s.dim; iD++) {
          br[2 * iD + sp] = vr[iD]!
          bi[2 * iD + sp] = vi[iD]!
        }
        basisR.push(br)
        basisI.push(bi)
      }
    }

    // Sweep 4^3 = 64 momenta across full 3D BZ (off-grid shifted + TRIM points)
    const nGrid = 4
    for (let ix = 0; ix < nGrid; ix++) {
      for (let iy = 0; iy < nGrid; iy++) {
        for (let iz = 0; iz < nGrid; iz++) {
          const qx = (TWO_PI * ix) / nGrid - PI + (ix === 0 ? 0 : 0.17)
          const qy = (TWO_PI * iy) / nGrid - PI + (iy === 0 ? 0 : 0.23)
          const qz = (TWO_PI * iz) / nGrid - PI + (iz === 0 ? 0 : 0.31)
          const { U, omegaWeyl } = buildSlab3D(s.U, qx, qy, qz)
          const uni = cmatUnitaryErr(U)
          if (uni > max3DUniErr) max3DUniErr = uni
          const eig = unitaryEigen(U)
          const predCos = cm * Math.cos(omegaWeyl)
          // All 4 light Dirac states (2 positive + 2 negative, Kramers-degenerate) must match predCos!
          const errs = Array.from(eig.phases, ph => Math.abs(Math.cos(ph) - predCos)).sort((a, b) => a - b)
          const worst4 = errs[3]!
          if (worst4 > dMaxDisp) dMaxDisp = worst4

          // Exact bulk-leakage operator norm ||(I - P_light) U P_light||_F on all 4 light basis vectors
          let leakSq = 0
          for (let b = 0; b < 4; b++) {
            const vr = basisR[b]!
            const vi = basisI[b]!
            const wr = new Float64Array(dim3)
            const wi = new Float64Array(dim3)
            for (let r = 0; r < dim3; r++) {
              let sr = 0
              let si = 0
              for (let c = 0; c < dim3; c++) {
                sr += U.re[r * dim3 + c]! * vr[c]! - U.im[r * dim3 + c]! * vi[c]!
                si += U.re[r * dim3 + c]! * vi[c]! + U.im[r * dim3 + c]! * vr[c]!
              }
              wr[r] = sr
              wi[r] = si
            }
            const remR = Float64Array.from(wr)
            const remI = Float64Array.from(wi)
            for (let a = 0; a < 4; a++) {
              let sr = 0
              let si = 0
              const br = basisR[a]!
              const bi = basisI[a]!
              for (let r = 0; r < dim3; r++) {
                sr += br[r]! * wr[r]! + bi[r]! * wi[r]!
                si += br[r]! * wi[r]! - bi[r]! * wr[r]!
              }
              for (let r = 0; r < dim3; r++) {
                remR[r] = remR[r]! - (sr * br[r]! - si * bi[r]!)
                remI[r] = remI[r]! - (sr * bi[r]! + si * br[r]!)
              }
            }
            for (let r = 0; r < dim3; r++) {
              leakSq += remR[r]! * remR[r]! + remI[r]! * remI[r]!
            }
          }
          const leak = Math.sqrt(leakSq)
          if (leak > dMaxLeak) dMaxLeak = leak
        }
      }
    }
    max3DDispErr = Math.max(max3DDispErr, dMaxDisp)
    max3DLeak = Math.max(max3DLeak, dMaxLeak)

    // Measure 3D directional inertial mass m_inert & R_1 = m_inert / m_eff along [1,0,0], [1,1,0], [1,1,1]
    // directly from full 4(D_*+1) x 4(D_*+1) eigenvalues via Richardson (dk, 2*dk) eliminating O(k^4)!
    const dk = 1e-3
    const r1Dirs: number[] = []
    for (const [, dir] of dirs3D) {
      const eAt = (mag: number): number => {
        const { U } = buildSlab3D(s.U, mag * dir[0], mag * dir[1], mag * dir[2])
        const eig = unitaryEigen(U)
        const pos = Array.from(eig.phases)
          .filter(p => p > 0)
          .sort((a, b) => a - b)
        return pos[0]!
      }
      const y1 = (eAt(dk) - s.mEff) / (dk * dk)
      const y2 = (eAt(2 * dk) - s.mEff) / (4 * dk * dk)
      const a2 = (4 * y1 - y2) / 3
      const mInertDir = 1 / (2 * a2)
      r1Dirs.push(mInertDir / s.mEff)
    }
    r1Table.push(r1Dirs[0]!)
    console.log(
      `          ${Dstar}  |   ${String(dim3).padStart(2)}   | ${s.mEff.toFixed(6)}   | ` +
        `${dMaxDisp.toExponential(2).padStart(25)} | ${dMaxLeak.toExponential(2)}   | ` +
        `[${r1Dirs.map(x => x.toFixed(6)).join(', ')}]`,
    )
  }

  const r1At0 = r1Table[0]!
  const r1At3 = r1Table[3]!
  recordCheck(
    'M2.1',
    'Zero-leakage 1+1D & 3+1D massive Dirac dispersion |cos E(k) - cos(m_eff) cos(w_Weyl)| < 1e-14',
    max3DUniErr < 1e-14 && max1DDispErr < 1e-14 && max1DLeak < 1e-13 && max3DDispErr < 1e-14 && max3DLeak < 1e-13,
    `uniErr=${max3DUniErr.toExponential(1)}, 1D dispErr=${max1DDispErr.toExponential(1)} (leak=${max1DLeak.toExponential(1)}), 3D dispErr=${max3DDispErr.toExponential(1)} (leak=${max3DLeak.toExponential(1)})`,
  )
  recordCheck(
    'M2.2',
    '3D slab single-particle E = mc^2 ratio R_1 drops 1.6540 (D_* = 0) -> 1.00027 (D_* = 3)',
    Math.abs(r1At0 - (3 * SQRT3) / PI) < 1e-4 && Math.abs(r1At3 - 1.000271) < 5e-5,
    `R_1(D_*=0)=${r1At0.toFixed(6)} (exact 3s3/pi=${((3 * SQRT3) / PI).toFixed(6)}) -> R_1(D_*=3)=${r1At3.toFixed(6)}`,
  )
}

// ============================================================================
// PART M3: DIRECT CLOSURE OF W18's R_2 = 7.14 -> 1.00 & LIVE 1/gamma CLOCK
// ============================================================================

function diracCoin(m: number, detPhase = 0): readonly [readonly [C, C], readonly [C, C]] {
  const ph = cExpI(detPhase)
  const k = cScale(Math.cos(m), ph)
  const x = cMul(ph, [0, -Math.sin(m)])
  return [
    [k, x],
    [x, k],
  ] as const
}

// Exact banded bare-U M_meet / Massive Thirring 2-body CM symmetric operator U_2^{sym}(P)
// Verbatim match to W18's buildU2SymCM (detPhase = 0, meetPhase = omega = e^{2 pi i / 3} for bare M_meet!)
function buildU2SymBanded(H: number, P: number, mCoin: number, meetPhase: C): BandedCMat {
  const dim = 4 * H
  const B = bandedZero(dim, 6, 6)
  const coin = diracCoin(mCoin, 0)
  const c00 = coin[0][0]
  const c01 = coin[0][1]
  const cc: C[][] = Array.from({ length: 4 }, (_, o) =>
    Array.from({ length: 4 }, (_, i) => cMul(coin[o >> 1]![i >> 1]!, coin[o & 1]![i & 1]!)),
  )
  const eNegP = cExpI(-P)
  const ePosP = cExpI(P)
  const idxBulk = (r: number, s: number): number => 1 + 4 * (r - 1) + s
  const idxH = 1 + 4 * (H - 1)

  // r = 0 -> (1, +-)_sym
  bandedAdd(B, H > 1 ? idxBulk(1, 1) : idxH + 2, 0, meetPhase)

  // Bulk r = 1..H-1
  for (let r = 1; r < H; r++) {
    for (let sIn = 0; sIn < 4; sIn++) {
      const col = idxBulk(r, sIn)
      for (let sOut = 0; sOut < 4; sOut++) {
        const amp = cc[sOut]![sIn]!
        if (sOut === 0) {
          bandedAdd(B, idxBulk(r, 0), col, cMul(eNegP, amp))
        } else if (sOut === 3) {
          bandedAdd(B, idxBulk(r, 3), col, cMul(ePosP, amp))
        } else if (sOut === 1) {
          bandedAdd(B, r + 1 < H ? idxBulk(r + 1, 1) : idxH + 2, col, amp)
        } else {
          bandedAdd(B, r - 1 > 0 ? idxBulk(r - 1, 2) : 0, col, amp)
        }
      }
    }
  }

  // Boundary r = H
  const c00Sq = cMul(c00, c00)
  const c01Sq = cMul(c01, c01)
  const c00c01 = cMul(c00, c01)
  const mH: readonly (readonly [C, C, C])[] = [
    [c00Sq, c01Sq, cScale(SQRT2, c00c01)],
    [c01Sq, c00Sq, cScale(SQRT2, c00c01)],
    [cScale(SQRT2, c00c01), cScale(SQRT2, c00c01), cAdd(c00Sq, c01Sq)],
  ]
  for (let a = 0; a < 3; a++) {
    const col = idxH + a
    bandedAdd(B, idxH + 0, col, cMul(eNegP, mH[0]![a]!))
    bandedAdd(B, idxH + 1, col, cMul(ePosP, mH[1]![a]!))
    bandedAdd(B, H > 1 ? idxBulk(H - 1, 2) : 0, col, mH[2]![a]!)
  }
  return B
}

function bandedToDense(B: BandedCMat): CMat {
  const M = cmatZero(B.n)
  for (let r = 0; r < B.n; r++) {
    const cLo = Math.max(0, r - B.kl)
    const cHi = Math.min(B.n - 1, r + B.ku)
    for (let c = cLo; c <= cHi; c++) {
      const idx = r * B.w + (c - r + B.kl)
      M.re[r * B.n + c] = B.re[idx]!
      M.im[r * B.n + c] = B.im[idx]!
    }
  }
  return M
}

// Exact real-space 2-body CM unitary evolution (X in [0, LX), r in [0, H]) — zero per-chunk allocations!
function evolveRealSpace2BodyCM(
  LX: number,
  H: number,
  mCoin: number,
  meetPhase: C,
  reIn: Float64Array,
  imIn: Float64Array,
  scratchRe: Float64Array,
  scratchIm: Float64Array,
  steps: number,
): { readonly re: Float64Array; readonly im: Float64Array; readonly normErr: number; readonly xCm0: number; readonly xCmF: number } {
  const stride = 4 * H
  let re = reIn
  let im = imIn
  let nRe = scratchRe
  let nIm = scratchIm

  const coin = diracCoin(mCoin, 0)
  const c00 = coin[0][0]
  const c01 = coin[0][1]
  const ccR = new Float64Array(16)
  const ccI = new Float64Array(16)
  for (let o = 0; o < 4; o++) {
    for (let i = 0; i < 4; i++) {
      const v = cMul(coin[o >> 1]![i >> 1]!, coin[o & 1]![i & 1]!)
      ccR[o * 4 + i] = v[0]
      ccI[o * 4 + i] = v[1]
    }
  }
  const c00Sq = cMul(c00, c00)
  const c01Sq = cMul(c01, c01)
  const c00c01 = cMul(c00, c01)
  const mHR = new Float64Array(9)
  const mHI = new Float64Array(9)
  const mH: readonly (readonly [C, C, C])[] = [
    [c00Sq, c01Sq, cScale(SQRT2, c00c01)],
    [c01Sq, c00Sq, cScale(SQRT2, c00c01)],
    [cScale(SQRT2, c00c01), cScale(SQRT2, c00c01), cAdd(c00Sq, c01Sq)],
  ]
  for (let o = 0; o < 3; o++) {
    for (let i = 0; i < 3; i++) {
      mHR[o * 3 + i] = mH[o]![i]![0]
      mHI[o * 3 + i] = mH[o]![i]![1]
    }
  }

  const idxH = 1 + 4 * (H - 1)
  let maxNormErr = 0

  const measureX = (): number => {
    let norm = 0
    let cSum = 0
    let sSum = 0
    for (let X = 0; X < LX; X++) {
      const off = X * stride
      let wX = 0
      for (let k = 0; k < stride; k++) wX += re[off + k]! ** 2 + im[off + k]! ** 2
      norm += wX
      const ang = (TWO_PI * X) / LX
      cSum += wX * Math.cos(ang)
      sSum += wX * Math.sin(ang)
    }
    const err = Math.abs(norm - 1)
    if (err > maxNormErr) maxNormErr = err
    const angMean = Math.atan2(sSum, cSum)
    return ((angMean < 0 ? angMean + TWO_PI : angMean) * LX) / TWO_PI
  }

  const xCm0 = measureX()
  for (let t = 0; t < steps; t++) {
    nRe.fill(0)
    nIm.fill(0)
    for (let X = 0; X < LX; X++) {
      const off = X * stride
      const offPlus = ((X + 1) % LX) * stride
      const offMinus = ((X - 1 + LX) % LX) * stride

      const r0 = re[off]!
      const i0 = im[off]!
      if (r0 !== 0 || i0 !== 0) {
        const dst = off + (H > 1 ? 2 : idxH + 2)
        nRe[dst] = nRe[dst]! + (meetPhase[0] * r0 - meetPhase[1] * i0)
        nIm[dst] = nIm[dst]! + (meetPhase[0] * i0 + meetPhase[1] * r0)
      }

      for (let r = 1; r < H; r++) {
        const b = off + 1 + 4 * (r - 1)
        const a0r = re[b]!, a0i = im[b]!
        const a1r = re[b + 1]!, a1i = im[b + 1]!
        const a2r = re[b + 2]!, a2i = im[b + 2]!
        const a3r = re[b + 3]!, a3i = im[b + 3]!
        if (a0r === 0 && a0i === 0 && a1r === 0 && a1i === 0 && a2r === 0 && a2i === 0 && a3r === 0 && a3i === 0) {
          continue
        }
        for (let o = 0; o < 4; o++) {
          const ro = o * 4
          const sr =
            ccR[ro]! * a0r - ccI[ro]! * a0i +
            ccR[ro + 1]! * a1r - ccI[ro + 1]! * a1i +
            ccR[ro + 2]! * a2r - ccI[ro + 2]! * a2i +
            ccR[ro + 3]! * a3r - ccI[ro + 3]! * a3i
          const si =
            ccR[ro]! * a0i + ccI[ro]! * a0r +
            ccR[ro + 1]! * a1i + ccI[ro + 1]! * a1r +
            ccR[ro + 2]! * a2i + ccI[ro + 2]! * a2r +
            ccR[ro + 3]! * a3i + ccI[ro + 3]! * a3r
          let dst = 0
          if (o === 0) dst = offPlus + 1 + 4 * (r - 1)
          else if (o === 3) dst = offMinus + 1 + 4 * (r - 1) + 3
          else if (o === 1) dst = off + (r + 1 < H ? 1 + 4 * r + 1 : idxH + 2)
          else dst = off + (r - 1 > 0 ? 1 + 4 * (r - 2) + 2 : 0)
          nRe[dst] = nRe[dst]! + sr
          nIm[dst] = nIm[dst]! + si
        }
      }

      const bH = off + idxH
      const h0r = re[bH]!, h0i = im[bH]!
      const h1r = re[bH + 1]!, h1i = im[bH + 1]!
      const h2r = re[bH + 2]!, h2i = im[bH + 2]!
      if (h0r !== 0 || h0i !== 0 || h1r !== 0 || h1i !== 0 || h2r !== 0 || h2i !== 0) {
        for (let o = 0; o < 3; o++) {
          const ro = o * 3
          const sr =
            mHR[ro]! * h0r - mHI[ro]! * h0i +
            mHR[ro + 1]! * h1r - mHI[ro + 1]! * h1i +
            mHR[ro + 2]! * h2r - mHI[ro + 2]! * h2i
          const si =
            mHR[ro]! * h0i + mHI[ro]! * h0r +
            mHR[ro + 1]! * h1i + mHI[ro + 1]! * h1r +
            mHR[ro + 2]! * h2i + mHI[ro + 2]! * h2r
          const dst =
            o === 0 ? offPlus + idxH : o === 1 ? offMinus + idxH + 1 : off + (H > 1 ? 1 + 4 * (H - 2) + 2 : 0)
          nRe[dst] = nRe[dst]! + sr
          nIm[dst] = nIm[dst]! + si
        }
      }
    }
    const tr = re
    const ti = im
    re = nRe
    im = nIm
    nRe = tr
    nIm = ti
  }
  const xCmF = measureX()
  return { re, im, normErr: maxNormErr, xCm0, xCmF }
}

function buildBoosted2BodyPacket(
  LX: number,
  H: number,
  X0: number,
  sigmaX: number,
  P: number,
  phiRe: Float64Array,
  phiIm: Float64Array,
): { readonly re: Float64Array; readonly im: Float64Array } {
  const stride = 4 * H
  const re = new Float64Array(LX * stride)
  const im = new Float64Array(LX * stride)
  let norm2 = 0
  for (let X = 0; X < LX; X++) {
    let dx = X - X0
    if (dx > LX / 2) dx -= LX
    if (dx < -LX / 2) dx += LX
    const env = Math.exp(-(dx * dx) / (2 * sigmaX * sigmaX))
    if (env < 1e-14) continue
    const cP = Math.cos(P * X) * env
    const sP = Math.sin(P * X) * env
    const off = X * stride
    for (let k = 0; k < stride; k++) {
      const pr = phiRe[k]!
      const pi = phiIm[k]!
      const vr = cP * pr - sP * pi
      const vi = cP * pi + sP * pr
      re[off + k] = vr
      im[off + k] = vi
      norm2 += vr * vr + vi * vi
    }
  }
  const inv = 1 / Math.sqrt(norm2)
  for (let i = 0; i < re.length; i++) {
    re[i] = re[i]! * inv
    im[i] = im[i]! * inv
  }
  return { re, im }
}

function runM3(slabs: readonly SlabModeData[], warpedMasses: readonly number[]): void {
  console.log('\n================================================================================')
  console.log("PART M3: DIRECT CLOSURE OF W18's R_2 = 7.14 -> 1.00 & LIVE 1/gamma CLOCK")
  console.log('================================================================================')

  // Cross-check banded solver vs dense unitaryEigen at D_* = 0 (m = pi/3, H = 24)
  const bCheck = buildU2SymBanded(24, 0, PI / 3, W_C)
  const denseU0 = bandedToDense(bCheck)
  const uniDense0 = cmatUnitaryErr(denseU0)
  const eigDense0 = unitaryEigen(denseU0)
  const targetBare0 = -(2 * PI / 3 - Math.atan2((15 * SQRT3) / 26, -1 / 26)) // -0.485128135...
  let denseE0 = 0
  let bestD = Infinity
  for (let c = 0; c < eigDense0.phases.length; c++) {
    const d = phaseDist(eigDense0.phases[c]!, targetBare0)
    if (d < bestD) {
      bestD = d
      denseE0 = eigDense0.phases[c]!
    }
  }
  const bandRef0 = bandedShiftInvert(bCheck, targetBare0, undefined, undefined, 7)
  const bandCrossErr = phaseDist(bandRef0.E, denseE0)

  console.log('\n  [M3.1] Direct Injection of Emergent Slab Mass m_eff(D_*) into Bare M_meet(omega) 2-Body CM Unitary U_2(P):')
  console.log(
    `         (Cross-check dense vs banded at D_*=0, H=24: uniErr=${uniDense0.toExponential(1)}, |E_band - E_dense|=${bandCrossErr.toExponential(2)})`,
  )
  console.log(
    '         D_* | m_eff(D_*) |   H | M_2(0)     | m_inert    |   R_2    | c_eff    | rho_2    | dM_in/E_b | pEdge',
  )

  const hForD = [24, 36, 64, 160, 420, 1200] as const
  const r2Vals: number[] = []
  const cEffVals: number[] = []
  const rho2Vals: number[] = []
  const defectRatios: number[] = []
  let maxRes2Body = 0

  for (let Dstar = 0; Dstar <= 5; Dstar++) {
    const m = slabs[Dstar]!.mEff
    const H = hForD[Dstar]!
    const dim = 4 * H
    // Localized seed near r = 0
    const sRe = new Float64Array(dim)
    const sIm = new Float64Array(dim)
    sRe[0] = 1
    const decRate = Math.max(0.005, 1.5 * m)
    for (let r = 1; r < Math.min(H, Math.ceil(12 / decRate)); r++) {
      const dec = Math.exp(-decRate * r)
      sRe[1 + 4 * (r - 1) + 1] = dec
      sRe[1 + 4 * (r - 1) + 2] = dec
    }
    const guessE0 = Dstar === 0 ? targetBare0 : -m * (1 - 0.866 * m)
    const B0 = buildU2SymBanded(H, 0, m, W_C)
    const ref0 = bandedShiftInvert(B0, guessE0, sRe, sIm, 8)
    maxRes2Body = Math.max(maxRes2Body, ref0.res)

    const evalOm = (P: number): number => {
      const BP = buildU2SymBanded(H, P, m, W_C)
      const rP = bandedShiftInvert(BP, ref0.E, ref0.vr, ref0.vi, 7)
      maxRes2Body = Math.max(maxRes2Body, rP.res)
      return -rP.E
    }

    const f0 = -ref0.E
    const hh = Math.min(0.01, 0.05 * m)
    const f1 = evalOm(hh)
    const f2 = evalOm(2 * hh)
    const f3 = evalOm(3 * hh)
    const u1 = (f1 - f0) / (hh * hh)
    const u2 = (f2 - f0) / (4 * hh * hh)
    const u3 = (f3 - f0) / (9 * hh * hh)
    const a2 = 1.5 * u1 - 0.6 * u2 + 0.1 * u3
    const a4 = (-(13 / 24) * u1 + (10 / 15) * u2 - (5 / 40) * u3) / (hh * hh)
    const mInert = 1 / (2 * a2)
    const R2 = mInert / f0
    const cEff = Math.sqrt(2 * f0 * a2)
    const rho2 = (-2 * f0 * a4) / (a2 * a2)
    const eBind = 2 * m - f0
    const dMInert = 2 * Math.tan(m) - mInert
    const defectRatio = dMInert / eBind

    r2Vals.push(R2)
    cEffVals.push(cEff)
    rho2Vals.push(rho2)
    defectRatios.push(defectRatio)

    console.log(
      `          ${Dstar}  | ${m.toFixed(6)}   | ${String(H).padStart(4)} | ${f0.toFixed(7)}  | ` +
        `${mInert.toFixed(7)}  | ${R2.toFixed(5)}  | ${cEff.toFixed(5)}  | ${rho2.toFixed(5)}  | ` +
        `${defectRatio.toFixed(5)}   | ${ref0.pEdge.toExponential(1)}`,
    )
  }
  const slope5 = (r2Vals[5]! - 1) / slabs[5]!.mEff
  console.log(
    `         Exact O(m) bare-M_meet(omega) scaling: (R_2(D_*=5) - 1) / m_eff(5) = ${slope5.toFixed(5)} (exact sqrt(3)/2 = ${(SQRT3 / 2).toFixed(5)})`,
  )

  // Also test warped {3,4,3,4} Steinberg slab at D_* = 3 (m_warped(3) = 0.00210618, H = 1600): R_2 < 1.002 at D_* = 3!
  const mWarp3 = warpedMasses[3]!
  const hWarp3 = 1600
  const swRe = new Float64Array(4 * hWarp3)
  const swIm = new Float64Array(4 * hWarp3)
  swRe[0] = 1
  for (let r = 1; r < hWarp3; r++) {
    const dec = Math.exp(-1.5 * mWarp3 * r)
    swRe[1 + 4 * (r - 1) + 1] = dec
    swRe[1 + 4 * (r - 1) + 2] = dec
  }
  const refW3 = bandedShiftInvert(buildU2SymBanded(hWarp3, 0, mWarp3, W_C), -mWarp3 * (1 - 0.866 * mWarp3), swRe, swIm, 8)
  const fW0 = -refW3.E
  const hhW = 0.05 * mWarp3
  const evalOmW = (P: number): number =>
    -bandedShiftInvert(buildU2SymBanded(hWarp3, P, mWarp3, W_C), refW3.E, refW3.vr, refW3.vi, 7).E
  const uw1 = (evalOmW(hhW) - fW0) / (hhW * hhW)
  const uw2 = (evalOmW(2 * hhW) - fW0) / (4 * hhW * hhW)
  const uw3 = (evalOmW(3 * hhW) - fW0) / (9 * hhW * hhW)
  const a2W = 1.5 * uw1 - 0.6 * uw2 + 0.1 * uw3
  const mInW = 1 / (2 * a2W)
  const r2Warp3 = mInW / fW0
  const defWarp3 = (2 * Math.tan(mWarp3) - mInW) / (2 * mWarp3 - fW0)
  console.log(
    `         Warped {3,4,3,4} D_*=3 (m=${mWarp3.toFixed(6)}, H=${hWarp3}): M_2=${fW0.toFixed(7)}, m_in=${mInW.toFixed(7)}, R_2=${r2Warp3.toFixed(5)} (< 1.002!), dM_in/E_b=${defWarp3.toFixed(5)}, pEdge=${refW3.pEdge.toExponential(1)}`,
  )

  // --- M3.2: Live Real-Space 2-Body Moving Clock at Emergent D_* = 2 (m = m_eff(2) = 0.086322, ZERO manual mass tuning!) ---
  const mD2 = slabs[2]!.mEff
  const H_CLK = 44
  const LX_CLK = 320
  const T_CLK = 60
  const phiA = 0.47 * PI
  const phiB = 0.53 * PI
  const meetA = cExpI(phiA)
  const meetB = cExpI(phiB)
  const cLightD2 = Math.cos(mD2) // universal light-cone speed cos(m_eff(2)) = 0.996277
  console.log(
    `\n  [M3.2] Live Real-Space 2-Body Moving Composite Clock at Emergent D_* = 2 (m_eff(2) = ${mD2.toFixed(6)}, ZERO manual mass tuning; two-channel clock probe phi_A = 0.47 pi, phi_B = 0.53 pi):`,
  )

  const findBoundClockState = (meetPh: C, phiVal: number) => {
    const dim = 4 * H_CLK
    const sRe = new Float64Array(dim)
    const sIm = new Float64Array(dim)
    sRe[0] = 1
    for (let r = 1; r < 24; r++) {
      const dec = Math.exp(-0.12 * r)
      sRe[1 + 4 * (r - 1) + 1] = dec
      sRe[1 + 4 * (r - 1) + 2] = dec
    }
    const guess = -2 * mD2 * Math.cos(0.5 * phiVal)
    return bandedShiftInvert(buildU2SymBanded(H_CLK, 0, mD2, meetPh), guess, sRe, sIm, 8)
  }

  const bA0 = findBoundClockState(meetA, phiA)
  const bB0 = findBoundClockState(meetB, phiB)
  const Ma0 = -bA0.E
  const Mb0 = -bB0.E
  const omClock0 = Ma0 - Mb0

  const solvePForSpeed = (
    meetPh: C,
    M0: number,
    b0: typeof bA0,
    vTarget: number,
  ): { P: number; om: number; vg: number; vr: Float64Array; vi: Float64Array } => {
    if (vTarget === 0) return { P: 0, om: M0, vg: 0, vr: b0.vr, vi: b0.vi }
    let P = (M0 * vTarget) / Math.sqrt(1 - vTarget * vTarget)
    let curE = -Math.hypot(M0, P)
    let curVr = b0.vr
    let curVi = b0.vi
    const evalSt = (pVal: number) => {
      const ref = bandedShiftInvert(buildU2SymBanded(H_CLK, pVal, mD2, meetPh), curE, curVr, curVi, 6)
      const dP = 1e-4
      const eP = bandedShiftInvert(buildU2SymBanded(H_CLK, pVal + dP, mD2, meetPh), ref.E, ref.vr, ref.vi, 5).E
      const eM = bandedShiftInvert(buildU2SymBanded(H_CLK, pVal - dP, mD2, meetPh), ref.E, ref.vr, ref.vi, 5).E
      return { om: -ref.E, vg: (eM - eP) / (2 * dP), ref }
    }
    for (let it = 0; it < 7; it++) {
      const st = evalSt(P)
      curE = st.ref.E
      curVr = st.ref.vr
      curVi = st.ref.vi
      const err = st.vg - vTarget
      if (Math.abs(err) < 1e-7) return { P, om: st.om, vg: st.vg, vr: curVr, vi: curVi }
      const dvdp = (M0 * M0) / (st.om * st.om * st.om)
      P -= err / dvdp
    }
    const st = evalSt(P)
    return { P, om: st.om, vg: st.vg, vr: st.ref.vr, vi: st.ref.vi }
  }

  let maxClockErr = 0
  let maxClockFixPErr = 0
  let maxClockNormErr = 0
  let omLiveRest = 0
  console.log(
    `         Emergent m_eff(2)=${mD2.toFixed(6)}, phi_A=0.47pi, phi_B=0.53pi, c_light=cos(m)=${cLightD2.toFixed(6)}, M_a=${Ma0.toFixed(6)}, M_b=${Mb0.toFixed(6)}, w_0=${omClock0.toFixed(6)}`,
  )
  console.log('         v/c     | 1/gamma  | v_live_A | v_live_B | w_live/w(0) | err_live | w_fixP/w0 | err_fixP')
  const stride = 4 * H_CLK
  const scratchAR = new Float64Array(LX_CLK * stride)
  const scratchAI = new Float64Array(LX_CLK * stride)
  const scratchBR = new Float64Array(LX_CLK * stride)
  const scratchBI = new Float64Array(LX_CLK * stride)
  for (const beta of [0, 0.2, 0.4, 0.6, 0.8]) {
    const vT = beta * cLightD2
    const invGam = Math.sqrt(1 - beta * beta)
    const stA = solvePForSpeed(meetA, Ma0, bA0, vT)
    const stB = solvePForSpeed(meetB, Mb0, bB0, vT)

    const pMid = 0.5 * (stA.P + stB.P)
    const eAmid = -bandedShiftInvert(buildU2SymBanded(H_CLK, pMid, mD2, meetA), -stA.om, stA.vr, stA.vi, 6).E
    const eBmid = -bandedShiftInvert(buildU2SymBanded(H_CLK, pMid, mD2, meetB), -stB.om, stB.vr, stB.vi, 6).E
    const ratioFixP = (eAmid - eBmid) / omClock0
    const errFixP = Math.abs(ratioFixP - invGam) / invGam
    maxClockFixPErr = Math.max(maxClockFixPErr, errFixP)

    const pktA = buildBoosted2BodyPacket(LX_CLK, H_CLK, 80, 42, stA.P, stA.vr, stA.vi)
    const pktB = buildBoosted2BodyPacket(LX_CLK, H_CLK, 80, 42, stB.P, stB.vr, stB.vi)
    const dPab = stA.P - stB.P

    const crossPhase = (aR: Float64Array, aI: Float64Array, bR: Float64Array, bI: Float64Array): number => {
      let cS = 0
      let sS = 0
      for (let X = 0; X < LX_CLK; X++) {
        const off = X * stride
        let w = 0
        for (let k = 0; k < stride; k++) w += aR[off + k]! ** 2 + aI[off + k]! ** 2
        const ang = (TWO_PI * X) / LX_CLK
        cS += w * Math.cos(ang)
        sS += w * Math.sin(ang)
      }
      const angM = Math.atan2(sS, cS)
      const xCm = ((angM < 0 ? angM + TWO_PI : angM) * LX_CLK) / TWO_PI
      let sr = 0
      let si = 0
      for (let X = 0; X < LX_CLK; X++) {
        let dx = X - xCm
        if (dx > LX_CLK / 2) dx -= LX_CLK
        if (dx < -LX_CLK / 2) dx += LX_CLK
        const phR = Math.cos(-dPab * dx)
        const phI = Math.sin(-dPab * dx)
        const off = X * stride
        let lr = 0
        let li = 0
        for (let k = 0; k < stride; k++) {
          lr += bR[off + k]! * aR[off + k]! + bI[off + k]! * aI[off + k]!
          li += bR[off + k]! * aI[off + k]! - bI[off + k]! * aR[off + k]!
        }
        sr += phR * lr - phI * li
        si += phR * li + phI * lr
      }
      return Math.atan2(si, sr)
    }

    let curAR = pktA.re
    let curAI = pktA.im
    let curBR = pktB.re
    let curBI = pktB.im
    let tmpAR = scratchAR
    let tmpAI = scratchAI
    let tmpBR = scratchBR
    let tmpBI = scratchBI
    const phi0 = crossPhase(curAR, curAI, curBR, curBI)
    let unwrapped = phi0
    let prevPhi = phi0
    let xA0 = 0
    let xB0 = 0
    let xAF = 0
    let xBF = 0
    const chunk = 10
    for (let c = 0; c < T_CLK / chunk; c++) {
      const evA = evolveRealSpace2BodyCM(LX_CLK, H_CLK, mD2, meetA, curAR, curAI, tmpAR, tmpAI, chunk)
      const evB = evolveRealSpace2BodyCM(LX_CLK, H_CLK, mD2, meetB, curBR, curBI, tmpBR, tmpBI, chunk)
      if (c === 0) {
        xA0 = evA.xCm0
        xB0 = evB.xCm0
      }
      xAF = evA.xCmF
      xBF = evB.xCmF
      maxClockNormErr = Math.max(maxClockNormErr, evA.normErr, evB.normErr)
      if (evA.re !== curAR) {
        tmpAR = curAR
        tmpAI = curAI
        curAR = evA.re
        curAI = evA.im
      }
      if (evB.re !== curBR) {
        tmpBR = curBR
        tmpBI = curBI
        curBR = evB.re
        curBI = evB.im
      }
      const phNow = crossPhase(curAR, curAI, curBR, curBI)
      unwrapped += wrapPi(phNow - prevPhi)
      prevPhi = phNow
    }
    const omLive = Math.abs(unwrapped - phi0) / T_CLK
    if (beta === 0) omLiveRest = omLive
    const ratioLive = omLive / omLiveRest
    const errLive = Math.abs(ratioLive - invGam) / invGam
    maxClockErr = Math.max(maxClockErr, errLive)
    const vLiveA = (xAF - xA0) / T_CLK
    const vLiveB = (xBF - xB0) / T_CLK
    console.log(
      `         ${beta.toFixed(1)}c    | ${invGam.toFixed(6)} | ${vLiveA.toFixed(6)} | ${vLiveB.toFixed(6)} | ` +
        `${ratioLive.toFixed(6).padStart(11)} | ${(100 * errLive).toFixed(3).padStart(7)}% | ` +
        `${ratioFixP.toFixed(6).padStart(9)} | ${(100 * errFixP).toFixed(3).padStart(7)}%`,
    )
  }

  // --- M3.3: Honest Opposite-Wall Contact-Overlap Caveat (Linking Pillars 1 & 3!) ---
  console.log('\n  [M3.3] HONEST LOCALITY CAVEAT — Opposite-Wall Contact-Overlap Audit:')
  console.log('         D_* | O_LL = sum |psi_L(d)|^4 (same wall) | O_LR = sum |psi_L(d)|^2 |psi_R(d)|^2 (opp wall)')
  for (let Dstar = 0; Dstar <= 4; Dstar++) {
    const s = slabs[Dstar]!
    console.log(
      `          ${Dstar}  | ${s.overlapLL.toFixed(6).padStart(37)} | ${s.overlapLR.toExponential(4)}`,
    )
  }
  console.log(
    '         CAVEAT: For opposite-wall modes (L at d=0, R at d=D_*), strictly local d_1=d_2 contact suppresses',
  )
  console.log(
    '                 L-R scattering overlap by O(3^-D_*) in amplitude (O(9^-D_*) in probability, while O_LL -> 0.8000).',
  )
  console.log(
    '         LINKING PILLARS 1 & 3: Placing BOTH L (weak doublet) and R (weak singlet) on the SAME husk d=0',
  )
  console.log(
    '                 with warped Yukawa mass m_eff = y_f v_EW preserves O(1) local M_meet contact overlap (~0.80)',
  )
  console.log(
    '                 while keeping the emergent infrared fermion mass m_eff << 1!',
  )

  recordCheck(
    'M3.1',
    'Direct closure of W18 R_2 = 7.1406 (D_*=0) -> 1.0256 (D_*=3) -> 1.0083 (D_*=4) -> 1.0027 (D_*=5; warped D_*=3: 1.00168) & dM_in/E_b -> 1.00',
    uniDense0 < 1e-13 &&
      bandCrossErr < 1e-12 &&
      maxRes2Body < 1e-10 &&
      Math.abs(r2Vals[0]! - 7.140591) < 1e-4 &&
      r2Vals[3]! < 1.03 &&
      r2Vals[4]! < 1.01 &&
      r2Vals[5]! < 1.003 &&
      r2Warp3 < 1.002 &&
      Math.abs(slope5 - SQRT3 / 2) < 0.01 &&
      Math.abs(cEffVals[5]! - 1) < 0.002 &&
      Math.abs(rho2Vals[5]! - 1) < 0.005 &&
      Math.abs(defectRatios[5]! - 1) < 0.005 &&
      Math.abs(defWarp3 - 1) < 0.003,
    `R_2: ${r2Vals[0]!.toFixed(4)} (D=0) -> ${r2Vals[1]!.toFixed(4)} (D=1) -> ${r2Vals[2]!.toFixed(4)} (D=2) -> ${r2Vals[3]!.toFixed(4)} (D=3) -> ${r2Vals[4]!.toFixed(5)} (D=4) -> ${r2Vals[5]!.toFixed(5)} (D=5), warped D=3: ${r2Warp3.toFixed(5)}; c_eff=${cEffVals[5]!.toFixed(5)}, rho_2=${rho2Vals[5]!.toFixed(5)}, dM_in/E_bind=${defectRatios[5]!.toFixed(5)} (warped=${defWarp3.toFixed(5)})`,
  )
  recordCheck(
    'M3.2',
    'Live real-space 2-body moving composite clock obeys 1/gamma (< 1.5%) at emergent D_* = 2 (m_eff(2), phi_A=0.47pi, phi_B=0.53pi)',
    maxClockNormErr < 1e-12 && maxClockErr < 0.015 && maxClockFixPErr < 0.015,
    `m_eff(2)=${mD2.toFixed(6)} (phi_A=0.47pi, phi_B=0.53pi): max live 1/gamma err=${(100 * maxClockErr).toFixed(3)}%, fixP err=${(100 * maxClockFixPErr).toFixed(3)}%, normErr=${maxClockNormErr.toExponential(1)}`,
  )
  recordCheck(
    'M3.3',
    'Opposite-wall contact-overlap audit verifies O_LL -> 4/5 = 0.8000 vs O_LR ~ 9^-D_* caveat',
    Math.abs(slabs[4]!.overlapLL - 0.8) < 2e-3 && slabs[4]!.overlapLR < 1e-3,
    `D_*=4: O_LL=${slabs[4]!.overlapLL.toFixed(5)} (same-husk O(1)), O_LR=${slabs[4]!.overlapLR.toExponential(2)} (opposite-wall suppressed)`,
  )
}

// ============================================================================
// PART M4: E-SPN-0180 CURVATURE PROTECTION CONTROL (DISORDERED 2T ON 4D D_4)
// ============================================================================

type Q4 = readonly [number, number, number, number]

function qMul(a: Q4, b: Q4): Q4 {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ]
}

// 4x4 left-multiplication matrix L(q): (L(q) v) = q * v
function qLeftMat(q: Q4): Float64Array {
  const [w, x, y, z] = q
  return new Float64Array([
    w, -x, -y, -z,
    x,  w, -z,  y,
    y,  z,  w, -x,
    z, -y,  x,  w,
  ])
}

// 4x4 right-multiplication matrix R(q): (R(q) v) = v * q
function qRightMat(q: Q4): Float64Array {
  const [w, x, y, z] = q
  return new Float64Array([
    w, -x, -y, -z,
    x,  w,  z, -y,
    y, -z,  w,  x,
    z,  y, -x,  w,
  ])
}

// Exact 24-element binary tetrahedral Hurwitz group 2T < SU(2) (stored as doubled integer quadruples 2*q)
function build2TGroup(): {
  readonly order: number
  readonly doubled: readonly Q4[]
  readonly quats: readonly Q4[]
  readonly rightMats: readonly Float64Array[]
  readonly table: Int16Array
  readonly inverse: Int16Array
  readonly identity: number
  readonly nearest8: readonly number[]
} {
  const doubled: Q4[] = []
  for (let axis = 0; axis < 4; axis++) {
    for (const s of [2, -2]) {
      const v: [number, number, number, number] = [0, 0, 0, 0]
      v[axis] = s
      doubled.push(v)
    }
  }
  for (let mask = 0; mask < 16; mask++) {
    doubled.push([
      mask & 1 ? -1 : 1,
      mask & 2 ? -1 : 1,
      mask & 4 ? -1 : 1,
      mask & 8 ? -1 : 1,
    ])
  }
  const order = doubled.length
  assert(order === 24, `2T order must be 24, got ${order}`)
  const keyToIdx = new Map<string, number>()
  for (let i = 0; i < order; i++) keyToIdx.set(doubled[i]!.join(','), i)

  const quats: Q4[] = doubled.map(d => [0.5 * d[0], 0.5 * d[1], 0.5 * d[2], 0.5 * d[3]])
  const rightMats = quats.map(qRightMat)
  const table = new Int16Array(order * order)
  const inverse = new Int16Array(order)
  const identity = keyToIdx.get('2,0,0,0')!

  for (let a = 0; a < order; a++) {
    const qa = doubled[a]!
    const invKey = `${qa[0]},${-qa[1]},${-qa[2]},${-qa[3]}`
    inverse[a] = keyToIdx.get(invKey)!
    for (let b = 0; b < order; b++) {
      const p = qMul(qa, doubled[b]!)
      // p is 4 * (q_a * q_b), so divide by 2 to get doubled unit!
      const key = `${p[0] / 2},${p[1] / 2},${p[2] / 2},${p[3] / 2}`
      const idx = keyToIdx.get(key)
      assert(idx !== undefined, `2T closure failed at (${a}, ${b})`)
      table[a * order + b] = idx
    }
  }
  // 8 nearest elements to identity: w = +1/2 (doubled[i][0] === 1)
  const nearest8: number[] = []
  for (let i = 0; i < order; i++) {
    if (doubled[i]![0] === 1) nearest8.push(i)
  }
  return { order, doubled, quats, rightMats, table, inverse, identity, nearest8 }
}

// Exact 4D D_4 torus D_4 / (3 D_4): N = 3^4 = 81 sites, all 24 D_4 roots, collision-free, 96 triangles per site!
function buildD4Torus3(): {
  readonly N: number
  readonly roots: readonly Q4[]
  readonly opposite: Int16Array
  readonly nb: Int32Array
  readonly triangles: readonly (readonly [number, number, number])[]
} {
  // D_4 simple-root-like Z-basis: b0=(1,1,0,0), b1=(1,-1,0,0), b2=(0,1,1,0), b3=(0,0,1,1)
  // Inverse mapping from any v = (v0,v1,v2,v3) in D_4 to integer basis coordinates (c0, c1, c2, c3):
  //   c3 = v3
  //   c2 = v2 - v3
  //   c0 = (v0 + v1 - c2) / 2
  //   c1 = (v0 - v1 + c2) / 2
  const toBasis = (v: Q4): readonly [number, number, number, number] => {
    const c3 = v[3]
    const c2 = v[2] - v[3]
    const s0 = v[0] + v[1] - c2
    const s1 = v[0] - v[1] + c2
    assert(s0 % 2 === 0 && s1 % 2 === 0, `Vector ${v} not in D_4`)
    return [s0 / 2, s1 / 2, c2, c3]
  }
  const roots: Q4[] = []
  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      for (const sa of [1, -1]) {
        for (const sb of [1, -1]) {
          const r: [number, number, number, number] = [0, 0, 0, 0]
          r[a] = sa
          r[b] = sb
          roots.push(r)
        }
      }
    }
  }
  assert(roots.length === 24, 'D_4 must have 24 roots')
  const rootKey = new Map<string, number>()
  roots.forEach((r, i) => rootKey.set(r.join(','), i))
  const opposite = new Int16Array(24)
  for (let d = 0; d < 24; d++) {
    const r = roots[d]!
    opposite[d] = rootKey.get(`${-r[0]},${-r[1]},${-r[2]},${-r[3]}`)!
  }
  // Exact triangles (d1, d2, d3) with r_{d1} + r_{d2} + r_{d3} = 0 (oriented triangles at each vertex)
  const triangles: [number, number, number][] = []
  for (let d1 = 0; d1 < 24; d1++) {
    for (let d2 = d1 + 1; d2 < 24; d2++) {
      const r1 = roots[d1]!
      const r2 = roots[d2]!
      const d3 = rootKey.get(`${-(r1[0] + r2[0])},${-(r1[1] + r2[1])},${-(r1[2] + r2[2])},${-(r1[3] + r2[3])}`)
      if (d3 !== undefined && d3 > d2) triangles.push([d1, d2, d3])
    }
  }

  const L = 3
  const N = L ** 4 // 81
  const rootShift = roots.map(toBasis)
  const mod3 = (x: number): number => ((x % 3) + 3) % 3
  const siteIdx = (c0: number, c1: number, c2: number, c3: number): number =>
    ((c0 * 3 + c1) * 3 + c2) * 3 + c3
  const nb = new Int32Array(N * 24)
  for (let c0 = 0; c0 < 3; c0++) {
    for (let c1 = 0; c1 < 3; c1++) {
      for (let c2 = 0; c2 < 3; c2++) {
        for (let c3 = 0; c3 < 3; c3++) {
          const x = siteIdx(c0, c1, c2, c3)
          for (let d = 0; d < 24; d++) {
            const sh = rootShift[d]!
            nb[x * 24 + d] = siteIdx(mod3(c0 + sh[0]), mod3(c1 + sh[1]), mod3(c2 + sh[2]), mod3(c3 + sh[3]))
          }
        }
      }
    }
  }
  return { N, roots, opposite, nb, triangles }
}

function runM4(slabs: readonly SlabModeData[]): void {
  console.log('\n================================================================================')
  console.log('PART M4: E-SPN-0180 CURVATURE PROTECTION CONTROL (DISORDERED 2T ON 4D D_4)')
  console.log('================================================================================')

  const G = build2TGroup()
  const T4 = buildD4Torus3()
  const GOLDEN = (SQRT5 - 1) / 2
  const weylSeq = (k: number, offset: number): number => (((offset + k * GOLDEN) % 1) + 1) % 1

  // Exact homomorphism & commutativity check: R(g1) * R(g2) == R(g2 * g1) (right action!),
  // and [L(r_d), R(g)] == 0 identically for all 24 roots and all 24 elements of 2T!
  let maxCommErr = 0
  let maxRightHomErr = 0
  const leftRootMats = T4.roots.map(qLeftMat)
  for (let a = 0; a < 24; a++) {
    const Ra = G.rightMats[a]!
    for (let d = 0; d < 24; d++) {
      const Ld = leftRootMats[d]!
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let lr = 0
          let rl = 0
          for (let k = 0; k < 4; k++) {
            lr += Ld[i * 4 + k]! * Ra[k * 4 + j]!
            rl += Ra[i * 4 + k]! * Ld[k * 4 + j]!
          }
          maxCommErr = Math.max(maxCommErr, Math.abs(lr - rl))
        }
      }
    }
    for (let b = 0; b < 24; b++) {
      const Rb = G.rightMats[b]!
      const Rba = G.rightMats[G.table[b * 24 + a]!]! // (v * b) * a = v * (b * a) => R(a) R(b) = R(b a)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let p = 0
          for (let k = 0; k < 4; k++) p += Ra[i * 4 + k]! * Rb[k * 4 + j]!
          maxRightHomErr = Math.max(maxRightHomErr, Math.abs(p - Rba[i * 4 + j]!))
        }
      }
    }
  }

  // Precompute 4x4 hop blocks c_0 * L(r_d) * R(g) for each (d, g)
  // Exact E-SPN-0180 normalization: c_0 = 1 / (2 sqrt(288))
  const C0_DIRAC = 1 / (2 * Math.sqrt(288))
  const diracBlocks: Float64Array[] = []
  for (let d = 0; d < 24; d++) {
    const Ld = leftRootMats[d]!
    for (let g = 0; g < 24; g++) {
      const Rg = G.rightMats[g]!
      const B = new Float64Array(16)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let s = 0
          for (let k = 0; k < 4; k++) s += Ld[i * 4 + k]! * Rg[k * 4 + j]!
          B[i * 4 + j] = C0_DIRAC * s
        }
      }
      diracBlocks.push(B)
    }
  }

  type FieldKind = 'flat' | 'pure-gauge' | 'weyl' | 'dilute'
  const buildField = (kind: FieldKind, offset: number, density = 1): Int16Array => {
    const link = new Int16Array(T4.N * 24)
    const h = Int16Array.from({ length: T4.N }, (_, x) => Math.floor(weylSeq(7919 + x, offset) * 24) % 24)
    let k = 0
    for (let x = 0; x < T4.N; x++) {
      for (let d = 0; d < 24; d++) {
        const to = T4.nb[x * 24 + d]!
        const back = to * 24 + T4.opposite[d]!
        if (back < x * 24 + d) continue
        let v = G.identity
        if (kind === 'weyl') {
          v = Math.floor(weylSeq(k++, offset) * 24) % 24
        } else if (kind === 'dilute') {
          const w = weylSeq(k, offset)
          const pick = Math.floor(weylSeq(k, offset + 0.37) * G.nearest8.length) % G.nearest8.length
          k++
          v = w < density ? G.nearest8[pick]! : G.identity
        } else if (kind === 'pure-gauge') {
          // Right-action pure gauge: g(x -> to) = h(x)^{-1} * h(to)
          v = G.table[G.inverse[h[x]!]! * 24 + h[to]!]!
        }
        link[x * 24 + d] = v
        link[back] = G.inverse[v]!
      }
    }
    return link
  }

  const gaugeTransformField = (link: Int16Array, offset: number): Int16Array => {
    const h = Int16Array.from({ length: T4.N }, (_, x) => Math.floor(weylSeq(3571 + x, offset) * 24) % 24)
    const out = new Int16Array(link.length)
    for (let x = 0; x < T4.N; x++) {
      for (let d = 0; d < 24; d++) {
        const to = T4.nb[x * 24 + d]!
        // g'(x -> to) = h(x)^{-1} * g(x -> to) * h(to)
        const tmp = G.table[G.inverse[h[x]!]! * 24 + link[x * 24 + d]!]!
        out[x * 24 + d] = G.table[tmp * 24 + h[to]!]!
      }
    }
    return out
  }

  const triangleCurvatureFrac = (link: Int16Array): number => {
    let curved = 0
    let total = 0
    for (let x = 0; x < T4.N; x++) {
      for (const [d1, d2, d3] of T4.triangles) {
        const y = T4.nb[x * 24 + d1]!
        const z = T4.nb[y * 24 + d2]!
        const g1 = link[x * 24 + d1]!
        const g2 = link[y * 24 + d2]!
        const g3 = link[z * 24 + d3]!
        const hol = G.table[G.table[g1 * 24 + g2]! * 24 + g3]!
        if (hol !== G.identity) curved++
        total++
      }
    }
    return curved / total
  }

  const N4 = T4.N
  const n4 = 4 * N4
  const Cmat = new Float64Array(n4 * n4)
  const Tmat = new Float64Array(n4 * n4)
  const Hmat = new Float64Array(n4 * n4)

  // Exact E-SPN-0180 operators on 4N = 324 real vector space:
  //   Chiral covariant Clifford hop C: (C psi)_x = c_0 sum_{y + r_d = x} L(r_d) R(g_{y, d}) psi_y -> H = C^T C
  //   Non-chiral scalar averaged hop T: (T psi)_x = (1/24) sum_{y + r_d = x} R(g_{y, d}) psi_y
  const analyzeField = (link: Int16Array): {
    readonly curvedFrac: number
    readonly muMin: number
    readonly muMax: number
    readonly muCenterCount: number
    readonly lambdaTop: number
    readonly trErrH: number
    readonly trErrT: number
    readonly muSpec: Float64Array
  } => {
    const N = N4
    const n = n4
    Cmat.fill(0)
    Tmat.fill(0)
    Hmat.fill(0)
    for (let y = 0; y < N; y++) {
      for (let d = 0; d < 24; d++) {
        const x = T4.nb[y * 24 + d]!
        const g = link[y * 24 + d]!
        const B = diracBlocks[d * 24 + g]!
        const Rg = G.rightMats[g]!
        const xOff = 4 * x
        const yOff = 4 * y
        for (let i = 0; i < 4; i++) {
          const rOff = (xOff + i) * n + yOff
          for (let j = 0; j < 4; j++) {
            Cmat[rOff + j] = Cmat[rOff + j]! + B[i * 4 + j]!
            Tmat[rOff + j] = Tmat[rOff + j]! + Rg[i * 4 + j]! / 24
          }
        }
      }
    }
    // H = C^T C (real symmetric 324 x 324)
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        let s = 0
        for (let k = 0; k < n; k++) {
          s += Cmat[k * n + i]! * Cmat[k * n + j]!
        }
        Hmat[i * n + j] = s
        Hmat[j * n + i] = s
      }
    }
    const muSpec = realSymmetricEigenvalues(Hmat, n)
    const tSpec = realSymmetricEigenvalues(Tmat, n)
    // Self-check trace identity sum(eig) == Tr(M)
    let trH = 0
    let trT = 0
    let sumH = 0
    let sumT = 0
    for (let i = 0; i < n; i++) {
      trH += Hmat[i * n + i]!
      trT += Tmat[i * n + i]!
      sumH += muSpec[i]!
      sumT += tSpec[i]!
    }
    const muMin = Math.max(0, muSpec[0]!)
    const muMax = muSpec[n - 1]!
    let muCenterCount = 0
    for (let i = 0; i < n; i++) if (muSpec[i]! < 1e-3) muCenterCount++
    const lambdaTop = Math.max(Math.abs(tSpec[0]!), Math.abs(tSpec[n - 1]!))
    return {
      curvedFrac: triangleCurvatureFrac(link),
      muMin,
      muMax,
      muCenterCount,
      lambdaTop,
      trErrH: Math.abs(trH - sumH),
      trErrT: Math.abs(trT - sumT),
      muSpec,
    }
  }

  // Exact E-SPN-0180 analytic Jordan dispersion laws injected with exact spectra of the naive 4D D_4
  // covariant Clifford operator C (H = C^T C) versus the non-chiral averaged hop T in static 2T fields:
  //   Chiral register/Dirac member: cos(2 m_chiral) = cos(2 m_0) - 2 cos^2(m_0) * mu_min
  //   Non-chiral scalar hop (E-SPN-0161): m_scalar = arccos(cos(m_0) * lambda_top)
  const chiralMass = (m0: number, muMin: number): number => {
    const c = Math.max(-1, Math.min(1, Math.cos(2 * m0) - 2 * Math.cos(m0) ** 2 * muMin))
    return 0.5 * Math.acos(c)
  }
  const scalarMass = (m0: number, lamTop: number): number => Math.acos(Math.max(-1, Math.min(1, Math.cos(m0) * lamTop)))

  const mSlab2 = slabs[2]!.mEff // emergent D_* = 2 slab mass 0.086322
  const mRef180 = 0.190126 // E-SPN-0180 reference light mass

  const fFlat = buildField('flat', 0.5)
  const fPure = buildField('pure-gauge', 0.29)
  const fWeyl1 = buildField('weyl', 0.5)
  const fWeyl2 = buildField('weyl', 0.29)
  const fWeyl1G = gaugeTransformField(fWeyl1, 0.73)
  const fDilute = buildField('dilute', 0.5, 0.5)

  const cases: readonly (readonly [string, Int16Array])[] = [
    ['flat (trivial)', fFlat],
    ['pure-gauge 2T', fPure],
    ['dilute 2T (p=0.5)', fDilute],
    ['disordered 2T Weyl #1', fWeyl1],
    ['disordered 2T Weyl #2', fWeyl2],
    ['gauged Weyl #1', fWeyl1G],
  ]

  console.log('\n  [M4.1] Exact 4D D_4 / (3 D_4) (N = 81, dim = 324) Static 2T Gauge Field Curvature Protection Audit:')
  console.log(
    `         2T algebra: order=${G.order}, [L(r_d), R(g)] err=${maxCommErr.toExponential(1)}, R(a)R(b)=R(ba) err=${maxRightHomErr.toExponential(1)}, D_4 triangles/site=${T4.triangles.length}`,
  )
  console.log(
    '         Field                 | curved% |  mu_min   | lam_top | m_chi(D2) [drift]   | m_sca(D2) | m_chi(0180) | m_sca(0180)',
  )

  const results = new Map<string, ReturnType<typeof analyzeField>>()
  let maxTrErr = 0
  for (const [label, field] of cases) {
    const res = analyzeField(field)
    results.set(label, res)
    maxTrErr = Math.max(maxTrErr, res.trErrH, res.trErrT)
    const mc2 = chiralMass(mSlab2, res.muMin)
    const ms2 = scalarMass(mSlab2, res.lambdaTop)
    const mc180 = chiralMass(mRef180, res.muMin)
    const ms180 = scalarMass(mRef180, res.lambdaTop)
    console.log(
      `         ${label.padEnd(21)} | ${(100 * res.curvedFrac).toFixed(1).padStart(6)}% | ${res.muMin.toExponential(2)} | ` +
        `${res.lambdaTop.toFixed(5)} | ${mc2.toFixed(6)} [${(mc2 - mSlab2).toExponential(1)}] | ${ms2.toFixed(5)}   | ` +
        `${mc180.toFixed(6)}    | ${ms180.toFixed(5)}`,
    )
  }

  const rFlat = results.get('flat (trivial)')!
  const rPure = results.get('pure-gauge 2T')!
  const rW1 = results.get('disordered 2T Weyl #1')!
  const rW2 = results.get('disordered 2T Weyl #2')!
  const rW1G = results.get('gauged Weyl #1')!

  // Exact gauge-invariance of C^T C spectrum: |spec(W1) - spec(gauged W1)| < 1e-12
  let maxGaugeSpecErr = 0
  let maxPureFlatSpecErr = 0
  for (let i = 0; i < rW1.muSpec.length; i++) {
    maxGaugeSpecErr = Math.max(maxGaugeSpecErr, Math.abs(rW1.muSpec[i]! - rW1G.muSpec[i]!))
    maxPureFlatSpecErr = Math.max(maxPureFlatSpecErr, Math.abs(rFlat.muSpec[i]! - rPure.muSpec[i]!))
  }

  const driftD2W1 = Math.abs(chiralMass(mSlab2, rW1.muMin) - mSlab2)
  const driftD2W2 = Math.abs(chiralMass(mSlab2, rW2.muMin) - mSlab2)
  const drift180W1 = Math.abs(chiralMass(mRef180, rW1.muMin) - mRef180)
  const drift180W2 = Math.abs(chiralMass(mRef180, rW2.muMin) - mRef180)
  const mScaD2W1 = scalarMass(mSlab2, rW1.lambdaTop)
  const mScaD2W2 = scalarMass(mSlab2, rW2.lambdaTop)
  const mSca180W1 = scalarMass(mRef180, rW1.lambdaTop)

  recordCheck(
    'M4.1',
    'Exact 2T algebra, local gauge covariance, flat/pure-gauge controls & eigensolver trace check',
    maxCommErr === 0 &&
      maxRightHomErr === 0 &&
      maxTrErr < 1e-11 &&
      rFlat.curvedFrac === 0 &&
      rPure.curvedFrac === 0 &&
      maxPureFlatSpecErr < 1e-12 &&
      maxGaugeSpecErr < 1e-12,
    `[L,R]=0, pure<->flat specErr=${maxPureFlatSpecErr.toExponential(1)}, gauged Weyl specErr=${maxGaugeSpecErr.toExponential(1)}, trErr=${maxTrErr.toExponential(1)}`,
  )
  recordCheck(
    'M4.2',
    'E-SPN-0180 Curvature Protection: chiral zero-mode stays light (< 1e-3 drift) vs O(1) Kesten scalar mass',
    rW1.curvedFrac > 0.9 &&
      rW2.curvedFrac > 0.9 &&
      driftD2W1 < 1e-3 &&
      driftD2W2 < 1e-3 &&
      drift180W1 < 1e-3 &&
      drift180W2 < 1e-3 &&
      mScaD2W1 > 1.0 &&
      mScaD2W2 > 1.0 &&
      mSca180W1 > 1.0,
    `curved=${(100 * rW1.curvedFrac).toFixed(1)}%/${(100 * rW2.curvedFrac).toFixed(1)}%: chiral drift(D2)=${Math.max(driftD2W1, driftD2W2).toExponential(2)} (0180: ${Math.max(drift180W1, drift180W2).toExponential(2)}) << 1e-3, while non-chiral scalar jumps ${mSlab2.toFixed(4)} -> ${mScaD2W1.toFixed(4)} / ${mScaD2W2.toFixed(4)} rad (Kesten O(1)!)`,
  )
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  const { slabs, warpedMasses } = runM1()
  runM2(slabs)
  runM3(slabs, warpedMasses)
  runM4(slabs)

  const elapsedSec = (performance.now() - T0_GLOBAL) / 1000
  const memMB = process.memoryUsage().rss / (1024 * 1024)

  console.log('\n================================================================================')
  console.log('WAVE-5 TRACK 2c (M1..M4): IR LIGHT MASS & E = mc^2 CLOSURE SUMMARY')
  console.log('================================================================================')
  let passed = 0
  for (const c of CHECKS) {
    if (c.ok) passed++
    console.log(`  [${c.ok ? 'PASS' : 'FAIL'}] ${c.id.padEnd(6)} | ${c.name}`)
    console.log(`         -> ${c.detail}`)
  }
  console.log('================================================================================')
  console.log(
    `OVERALL: ${passed}/${CHECKS.length} CHECKS PASSED | runtime = ${elapsedSec.toFixed(3)} s | RSS = ${memMB.toFixed(1)} MB`,
  )
  assert(passed === CHECKS.length, `Only ${passed}/${CHECKS.length} checks passed`)
}

main()

export {}
