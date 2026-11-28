// WAVE-5 STANDARD MODEL CLOSURE — ROUTE A / B / C EWSB & HIGGS VERIFICATION SUITE
//
// Self-contained, zero-external-import, zero-Math.random, deterministic Float64/BigInt,
// fast (< 6 s, < 250 MB RAM) verification suite.
//
// TIER A vs TIER B SCOPE:
//   - Tier A (bare substrate / exact internal-group baseline):
//       * Exact center-parity obstruction (E-FRC-0279) on 2T, 2O, 2T_L x 2T_R, 2T_L o 2T_R (0 center-odd);
//       * Exact bare-mass Gauss-law obstruction (E-FRC-0273) on a chiral dock;
//       * Exact {3,4,3,4} radial cusp shell geometry (R_VOL = 18.2787077744).
//   - Tier B (explicit electroweak gauge/Higgs extensions beyond bare U):
//       * Route A: compact unifying SO(5) x U(1)_X bulk gauge extension + c_f = 0 scalar orbifold Laplacian
//         1-loop Hosotani potential (stabilizing integer depth D_* ~ 13 still requires IR/UV brane tension);
//       * Route B: linearized (quadratic, free-field) 3D {4,3,4} Stueckelberg / Anderson-Higgs split-step QCA
//         (no non-Abelian [W,W] self-interactions or nonlinear Higgs potential);
//       * Route C: 2T-projected 5-dim center-odd custodial bidoublet H_v + 3-state U(1)_Y quantum link V_e
//         on a 2-link plaquette (5,625 full states; plus 625-state g_Y = 0 pure-SU(2)_L custodial control)
//         and 20-dim single-dock Yukawa coupling.
//
//   ROUTE A (SO(5) x U(1)_X minimal custodial GHU + {3,4,3,4} 1-loop Hosotani potential):
//     - A1: Exact SO(5) x U(1)_X Lie algebra containing 2T_L o 2T_R (order 288) inside SO(4) < SO(5);
//           exact zero photon mass m_gamma = 0 and exact custodial rho = m_W / (m_Z cos theta_W) = 1.000000
//           for ALL Wilson-line angles theta_H and all couplings (g, g');
//           honest negative controls: 2T / 2O / 2T_L x 2T_R / 2T_L o 2T_R have 0 center-odd components
//           (E-FRC-0279), and SU(3)_W gives sin^2(theta_W) = 3/4 and finite-theta_H rho = 1/cos(theta_H/2) != 1.
//     - A2: Exact discrete UV-finite 1-loop Hosotani effective potential V_eff(theta_H) on the {3,4,3,4}
//           warped cusp radial spectrum (c_f = 0 scalar orbifold Laplacian, plus flat S^1/Z_2 control):
//           certifies zero quadratic UV divergence, exact link-distribution gauge invariance, unbroken
//           theta_H^* = 0 for pure gauge, radiatively generated nontrivial EWSB minimum 0 < theta_H^* < pi/2
//           with strictly positive curvature proxy m_H(f_H=1) = sqrt(V''(theta_H^*)) > 0 for gauge + bulk
//           5/4 fermions, AND honest negative control proving monotonic decay in cusp depth D_*
//           (fixing D_* ~ 13 requires IR/UV brane-tension stabilization).
//
//   ROUTE B (Tier B linearized 3D {4,3,4} single-speed c = 1 unitary split-step Stueckelberg / Anderson-Higgs QCA):
//     - Quadratic free-field split-step QCA (no non-Abelian [W,W] self-interactions or nonlinear Higgs potential).
//     - Genuine QCA results: exact U^dag U = I unitarity (< 1e-13) on both Gauss-physical energy-norm unitary
//       U_EW,pal(q) and Riemann-Silberstein unitary U_RS(q), exact symplecticity M^dag Omega M = Omega (< 1e-14),
//       exact local Gauss-law commutation [M_EW,pal, G^a] = [M_EW,pal, G^Y] = 0 (< 1e-14), full 12^3 3D BZ
//       eaten-Goldstone mode count (4 gauge zero modes, 2 massless c=1 photons, 6 degenerate W^+- polarizations,
//       3 degenerate Z^0 polarizations, 1 physical Higgs H), discrete Floquet dispersion ratio rho_QCA = 0.999976,
//       and live 8^3 real-space T = 16 evolution with < 1e-14 time-reversibility & Gauss conservation.
//     - Input consistency check: rho_K = m_W / (m_Z cos theta_W) = 1.000000 at q = 0 is inherited from Route A1's
//       SO(5) custodial theorem (M_W = M_Z cos theta_W supplied as input to the linearized QCA).
//
//   ROUTE C (Exact quantum 2T_L x U(1)_Y bidoublet plaquette — Elitzur, FMS & Gauge-Invariant Yukawa):
//     - Exact 375 x 375 bond Gauss commutators (< 1e-14);
//     - Exhaustive projection of all 5,625 plaquette states onto the exact 14-dim gauge-invariant subspace;
//     - Exact Elitzur's theorem (<H_v> = 0 identically across all kappa_H);
//     - Nonzero gauge-invariant FMS composites: Higgs O_H singlet condensate + 0^{++} gap, Z^0 O_Z singlet
//       with massive gap, W^+- charged composites with exact W^+/W^- charge-conjugation degeneracy, neutral
//       W^+W^- singlet, and active U(1)_Y photon plaquette loop.
//       Note on g_Y = 0 vs g_Y^2 = 0.35 splitting:
//         * Explicit pure-SU(2)_L custodial control (g_Y = 0, 625 -> 10-dim SU(2)_L singlet subspace, V_e off)
//           certifies EXACT custodial triplet degeneracy dE_{W^+} = dE_{W^-} = dE_{Z^0} (< 1e-12)!
//         * At g_Y^2 = 0.35 with the truncated 3-state U(1)_Y quantum link V_e on a 2-vertex plaquette,
//           the Q_em = +-1 (G_0^Y = G_1^Y = +-1/2) sector forces N_H = 2 occupation and blocks vacuum hopping,
//           lifting dE_{W^+-} = 8.9168 above the neutral-sector dE_Z = 3.3532 (while keeping dE_{W^+} = dE_{W^-}).
//     - Exact gauge-invariant Yukawa operator ||[H_Yuk, G_v]||_F < 1e-13 generating split FMS Dirac masses
//       (m_u = sqrt(2) y_u, m_d = sqrt(2) y_d), contrasted against the bare-mass E-FRC-0273 negative control.

const globalAny = globalThis as {
  readonly performance?: { readonly now: () => number }
  readonly process?: {
    readonly memoryUsage?: () => { readonly rss: number; readonly heapUsed: number }
  }
}

const nowMs = (): number => (globalAny.performance ? globalAny.performance.now() : Date.now())
const T_START = nowMs()
const PI = Math.PI
const SQRT2 = Math.SQRT2
const SQRT3 = Math.sqrt(3)

// ============================================================================
// 0. ASSERTION HARNESS, COMPLEX ARITHMETIC & EXACT DENSE EIGENSOLVERS
// ============================================================================

type CheckRow = {
  readonly id: string
  readonly name: string
  readonly pass: boolean
  readonly metric: string
}
const CHECKS: CheckRow[] = []

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`)
  }
}

function recordCheck(id: string, name: string, pass: boolean, metric: string): void {
  CHECKS.push({ id, name, pass, metric })
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${id} | ${name}: ${metric}`)
  assert(pass, `${id} (${name}): ${metric}`)
}

type C = readonly [number, number]
const C0: C = [0, 0]
const C1: C = [1, 0]
const CI: C = [0, 1]

const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConj = (a: C): C => [a[0], -a[1]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cExpI = (th: number): C => [Math.cos(th), Math.sin(th)]

interface CMat {
  readonly n: number
  readonly re: Float64Array
  readonly im: Float64Array
}

function cmatZero(n: number): CMat {
  return { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
}

function cmatEye(n: number): CMat {
  const m = cmatZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
}

function cmatAdd(A: CMat, B: CMat, scaleB = 1): CMat {
  const n = A.n
  const out = cmatZero(n)
  for (let i = 0; i < n * n; i++) {
    out.re[i] = A.re[i]! + scaleB * B.re[i]!
    out.im[i] = A.im[i]! + scaleB * B.im[i]!
  }
  return out
}

function cmatMul(A: CMat, B: CMat): CMat {
  const n = A.n
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    const iOff = i * n
    for (let k = 0; k < n; k++) {
      const ar = A.re[iOff + k]!
      const ai = A.im[iOff + k]!
      if (ar === 0 && ai === 0) continue
      const kOff = k * n
      for (let j = 0; j < n; j++) {
        const br = B.re[kOff + j]!
        const bi = B.im[kOff + j]!
        out.re[iOff + j] = out.re[iOff + j]! + (ar * br - ai * bi)
        out.im[iOff + j] = out.im[iOff + j]! + (ar * bi + ai * br)
      }
    }
  }
  return out
}

function cmatDag(A: CMat): CMat {
  const n = A.n
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[j * n + i] = A.re[i * n + j]!
      out.im[j * n + i] = -A.im[i * n + j]!
    }
  }
  return out
}

function cmatFrob(A: CMat): number {
  let s = 0
  for (let i = 0; i < A.re.length; i++) {
    s += A.re[i]! * A.re[i]! + A.im[i]! * A.im[i]!
  }
  return Math.sqrt(s)
}

function cmatCommFrob(A: CMat, B: CMat): number {
  const AB = cmatMul(A, B)
  const BA = cmatMul(B, A)
  return cmatFrob(cmatAdd(AB, BA, -1))
}

function cmatTr(A: CMat): C {
  let sr = 0
  let si = 0
  for (let i = 0; i < A.n; i++) {
    sr += A.re[i * A.n + i]!
    si += A.im[i * A.n + i]!
  }
  return [sr, si]
}

function cmatUnitaryErr(U: CMat): number {
  const P = cmatMul(cmatDag(U), U)
  for (let i = 0; i < U.n; i++) P.re[i * U.n + i] = P.re[i * U.n + i]! - 1
  return cmatFrob(P)
}

// Exact Hermitian Jacobi eigensolver (returns eigenvalues ascending, eigenvectors row-wise).
function hermitianJacobi(
  n: number,
  hReIn: Float64Array,
  hImIn: Float64Array,
  wantVecs = true,
): {
  readonly vals: Float64Array
  readonly vecRe: Float64Array
  readonly vecIm: Float64Array
  readonly maxRes: number
} {
  const aRe = Float64Array.from(hReIn)
  const aIm = Float64Array.from(hImIn)
  const vRe = wantVecs ? new Float64Array(n * n) : new Float64Array(0)
  const vIm = wantVecs ? new Float64Array(n * n) : new Float64Array(0)
  if (wantVecs) {
    for (let i = 0; i < n; i++) vRe[i * n + i] = 1
  }

  for (let sweep = 0; sweep < 80; sweep++) {
    let maxOff = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const re = aRe[p * n + q]!
        const im = aIm[p * n + q]!
        const mag = Math.hypot(re, im)
        if (mag > maxOff) maxOff = mag
        if (mag < 1e-16) continue

        const ur = re / mag
        const ui = im / mag
        const app = aRe[p * n + p]!
        const aqq = aRe[q * n + q]!
        const tau = (aqq - app) / (2 * mag)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        const suR = s * ur
        const suI = s * ui

        aRe[p * n + p] = app - t * mag
        aIm[p * n + p] = 0
        aRe[q * n + q] = aqq + t * mag
        aIm[q * n + q] = 0
        aRe[p * n + q] = 0
        aIm[p * n + q] = 0
        aRe[q * n + p] = 0
        aIm[q * n + p] = 0

        for (let r = 0; r < n; r++) {
          if (r === p || r === q) continue
          const rpR = aRe[r * n + p]!
          const rpI = aIm[r * n + p]!
          const rqR = aRe[r * n + q]!
          const rqI = aIm[r * n + q]!
          // col p' = c * col p - s * u^* * col q
          const npR = c * rpR - (suR * rqR + suI * rqI)
          const npI = c * rpI - (suR * rqI - suI * rqR)
          // col q' = s * u * col p + c * col q
          const nqR = (suR * rpR - suI * rpI) + c * rqR
          const nqI = (suR * rpI + suI * rpR) + c * rqI
          aRe[r * n + p] = npR
          aIm[r * n + p] = npI
          aRe[p * n + r] = npR
          aIm[p * n + r] = -npI
          aRe[r * n + q] = nqR
          aIm[r * n + q] = nqI
          aRe[q * n + r] = nqR
          aIm[q * n + r] = -nqI
        }

        if (wantVecs) {
          for (let r = 0; r < n; r++) {
            const vpR = vRe[r * n + p]!
            const vpI = vIm[r * n + p]!
            const vqR = vRe[r * n + q]!
            const vqI = vIm[r * n + q]!
            vRe[r * n + p] = c * vpR - (suR * vqR + suI * vqI)
            vIm[r * n + p] = c * vpI - (suR * vqI - suI * vqR)
            vRe[r * n + q] = (suR * vpR - suI * vpI) + c * vqR
            vIm[r * n + q] = (suR * vpI + suI * vpR) + c * vqI
          }
        }
      }
    }
    if (maxOff < 1e-15) break
  }

  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => aRe[i * n + i]! - aRe[j * n + j]!)
  const vals = new Float64Array(n)
  const outRe = wantVecs ? new Float64Array(n * n) : new Float64Array(0)
  const outIm = wantVecs ? new Float64Array(n * n) : new Float64Array(0)
  for (let k = 0; k < n; k++) {
    const idx = order[k]!
    vals[k] = aRe[idx * n + idx]!
    if (wantVecs) {
      for (let r = 0; r < n; r++) {
        outRe[k * n + r] = vRe[r * n + idx]!
        outIm[k * n + r] = vIm[r * n + idx]!
      }
    }
  }

  let maxRes = 0
  if (wantVecs) {
    for (let k = 0; k < n; k++) {
      const lam = vals[k]!
      let r2 = 0
      for (let r = 0; r < n; r++) {
        let sr = 0
        let si = 0
        for (let c = 0; c < n; c++) {
          const hr = hReIn[r * n + c]!
          const hi = hImIn[r * n + c]!
          const vr = outRe[k * n + c]!
          const vi = outIm[k * n + c]!
          sr += hr * vr - hi * vi
          si += hr * vi + hi * vr
        }
        const dr = sr - lam * outRe[k * n + r]!
        const di = si - lam * outIm[k * n + r]!
        r2 += dr * dr + di * di
      }
      maxRes = Math.max(maxRes, Math.sqrt(r2))
    }
  }
  return { vals, vecRe: outRe, vecIm: outIm, maxRes }
}

// Fast real symmetric Jacobi eigensolver (ascending eigenvalues).
function realSymJacobi(n: number, aIn: Float64Array): Float64Array {
  const a = Float64Array.from(aIn)
  for (let sweep = 0; sweep < 60; sweep++) {
    let maxOff = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q]!
        const mag = Math.abs(apq)
        if (mag > maxOff) maxOff = mag
        if (mag < 1e-16) continue
        const app = a[p * n + p]!
        const aqq = a[q * n + q]!
        const tau = (aqq - app) / (2 * apq)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        a[p * n + p] = app - t * apq
        a[q * n + q] = aqq + t * apq
        a[p * n + q] = 0
        a[q * n + p] = 0
        for (let r = 0; r < n; r++) {
          if (r === p || r === q) continue
          const arp = a[r * n + p]!
          const arq = a[r * n + q]!
          const nrp = c * arp - s * arq
          const nrq = s * arp + c * arq
          a[r * n + p] = nrp
          a[p * n + r] = nrp
          a[r * n + q] = nrq
          a[q * n + r] = nrq
        }
      }
    }
    if (maxOff < 1e-15) break
  }
  const vals = new Float64Array(n)
  for (let i = 0; i < n; i++) vals[i] = a[i * n + i]!
  vals.sort()
  return vals
}

function hermitianExpNegI(H: CMat, tau: number): CMat {
  const n = H.n
  const eig = hermitianJacobi(n, H.re, H.im, true)
  const U = cmatZero(n)
  for (let k = 0; k < n; k++) {
    const ph = -tau * eig.vals[k]!
    const pr = Math.cos(ph)
    const pi = Math.sin(ph)
    const o = k * n
    for (let r = 0; r < n; r++) {
      const vr = eig.vecRe[o + r]!
      const vi = eig.vecIm[o + r]!
      const pvr = pr * vr - pi * vi
      const pvi = pr * vi + pi * vr
      for (let c = 0; c < n; c++) {
        const cr = eig.vecRe[o + c]!
        const ci = eig.vecIm[o + c]!
        U.re[r * n + c] = U.re[r * n + c]! + (pvr * cr + pvi * ci)
        U.im[r * n + c] = U.im[r * n + c]! + (pvi * cr - pvr * ci)
      }
    }
  }
  return U
}

// ============================================================================
// ROUTE A (PART 1): CENTER-PARITY NO-GO (E-FRC-0279), SU(3)_W NEGATIVE CONTROL,
//                   AND EXACT SO(5) x U(1)_X MINIMAL CUSTODIAL GHU
// ============================================================================

console.log('========================================================================')
console.log('ROUTE A1: CENTER-PARITY AUDIT, SU(3)_W NO-GO & SO(5) x U(1)_X CUSTODIAL GHU')
console.log('========================================================================')

type HQ = readonly [number, number, number, number] // (2a, 2b, 2c, 2d) in Z^4 for 2T

function hqMul(p: HQ, q: HQ): HQ {
  const [a1, b1, c1, d1] = p
  const [a2, b2, c2, d2] = q
  return [
    (a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2) / 2,
    (a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2) / 2,
    (a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2) / 2,
    (a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2) / 2,
  ]
}
const hqConj = (p: HQ): HQ => [p[0], -p[1], -p[2], -p[3]]
const hqKey = (p: HQ): string => `${p[0]},${p[1]},${p[2]},${p[3]}`

function build2T(): readonly HQ[] {
  const id: HQ = [2, 0, 0, 0]
  const gens: readonly HQ[] = [
    [0, 2, 0, 0],
    [0, 0, 2, 0],
    [-1, 1, 1, 1],
  ]
  const seen = new Set<string>([hqKey(id)])
  const elems: HQ[] = [id]
  for (let head = 0; head < elems.length; head++) {
    const cur = elems[head]!
    for (const g of gens) {
      const nxt = hqMul(cur, g)
      const k = hqKey(nxt)
      if (!seen.has(k)) {
        seen.add(k)
        elems.push(nxt)
      }
    }
  }
  return elems
}

function runRouteA1(): void {
  // --------------------------------------------------------------------------
  // A1.1 Negative Control (E-FRC-0279): 2T, 2O, 2T_L x 2T_R, 2T_L o 2T_R
  //      all leave z_L central => 0 center-odd link components!
  // --------------------------------------------------------------------------
  const G2T = build2T()
  assert(G2T.length === 24, `Expected |2T|=24, got ${G2T.length}`)
  const z2T: HQ = [-2, 0, 0, 0]

  // 2T centralizer of z = -1
  let c2T = 0
  for (const g of G2T) {
    if (hqKey(hqMul(z2T, g)) === hqKey(hqMul(g, z2T))) c2T++
  }
  const odd2T = (G2T.length - c2T) / 2

  // 2O (order 48): add (1 + i)/sqrt(2) represented over Z[sqrt(2)] / 2 via Float64 quaternion closure
  type FQ = readonly [number, number, number, number]
  const fqMul = (p: FQ, q: FQ): FQ => [
    p[0] * q[0] - p[1] * q[1] - p[2] * q[2] - p[3] * q[3],
    p[0] * q[1] + p[1] * q[0] + p[2] * q[3] - p[3] * q[2],
    p[0] * q[2] - p[1] * q[3] + p[2] * q[0] + p[3] * q[1],
    p[0] * q[3] + p[1] * q[2] - p[2] * q[1] + p[3] * q[0],
  ]
  const fqKey = (p: FQ): string =>
    `${Math.round(p[0] * 1e6)},${Math.round(p[1] * 1e6)},${Math.round(p[2] * 1e6)},${Math.round(p[3] * 1e6)}`
  const g2O: FQ[] = [[1, 0, 0, 0]]
  const seen2O = new Set<string>([fqKey([1, 0, 0, 0])])
  const gens2O: readonly FQ[] = [
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [-0.5, 0.5, 0.5, 0.5],
    [1 / SQRT2, 1 / SQRT2, 0, 0],
  ]
  for (let head = 0; head < g2O.length; head++) {
    for (const gen of gens2O) {
      const nxt = fqMul(g2O[head]!, gen)
      const k = fqKey(nxt)
      if (!seen2O.has(k)) {
        seen2O.add(k)
        g2O.push(nxt)
      }
    }
  }
  const z2O: FQ = [-1, 0, 0, 0]
  let c2O = 0
  for (const g of g2O) {
    if (fqKey(fqMul(z2O, g)) === fqKey(fqMul(g, z2O))) c2O++
  }
  const odd2O = (g2O.length - c2O) / 2

  // 2T_L x 2T_R (order 576) and central quotient 2T_L o 2T_R (order 288)
  const id2T: HQ = [2, 0, 0, 0]
  const zProd: readonly [HQ, HQ] = [z2T, id2T]
  const zProdInv: readonly [HQ, HQ] = [hqConj(z2T), hqConj(id2T)]
  const mulProd = (a: readonly [HQ, HQ], b: readonly [HQ, HQ]): readonly [HQ, HQ] => [
    hqMul(a[0], b[0]),
    hqMul(a[1], b[1]),
  ]
  const keyProd = (p: readonly [HQ, HQ]): string => `${hqKey(p[0])}|${hqKey(p[1])}`
  const ordProd = G2T.length * G2T.length
  let cProd = 0
  for (const gL of G2T) {
    for (const gR of G2T) {
      const g: readonly [HQ, HQ] = [gL, gR]
      const conjG = mulProd(mulProd(zProd, g), zProdInv)
      if (keyProd(conjG) === keyProd(g)) cProd++
    }
  }
  const oddProd = (ordProd - cProd) / 2

  // Embed 2T_L o 2T_R directly as 4x4 SO(4) matrices acting on H = (i, j, k, 1): x -> q_L x q_R^{-1}
  // Basis e0 = i, e1 = j, e2 = k, e3 = 1
  const quatToSO4 = (qL: HQ, qR: HQ): Float64Array => {
    const qRinv = hqConj(qR)
    const basis: readonly HQ[] = [
      [0, 2, 0, 0], // i
      [0, 0, 2, 0], // j
      [0, 0, 0, 2], // k
      [2, 0, 0, 0], // 1
    ]
    const M = new Float64Array(16)
    for (let col = 0; col < 4; col++) {
      const img = hqMul(hqMul(qL, basis[col]!), qRinv)
      // img is (2*x3, 2*x0, 2*x1, 2*x2)
      M[0 * 4 + col] = img[1] / 2
      M[1 * 4 + col] = img[2] / 2
      M[2 * 4 + col] = img[3] / 2
      M[3 * 4 + col] = img[0] / 2
    }
    return M
  }
  const mat4Mul = (A: Float64Array, B: Float64Array): Float64Array => {
    const out = new Float64Array(16)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let s = 0
        for (let k = 0; k < 4; k++) s += A[r * 4 + k]! * B[k * 4 + c]!
        out[r * 4 + c] = s
      }
    }
    return out
  }
  const mat4Key = (m: Float64Array): string => Array.from(m, v => Math.round(v * 1e4)).join(',')
  const so4Set = new Map<string, Float64Array>()
  for (const qL of G2T) {
    for (const qR of G2T) {
      const M = quatToSO4(qL, qR)
      const k = mat4Key(M)
      if (!so4Set.has(k)) so4Set.set(k, M)
    }
  }
  // Explicitly construct zL4 = quatToSO4((-1, +1)) and compute actual matrix commutator zL4 * M - M * zL4!
  const zL4 = quatToSO4(z2T, id2T)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      assert(Math.abs(zL4[r * 4 + c]! - (r === c ? -1 : 0)) < 1e-14, 'zL4 must equal -I_4')
    }
  }
  let cQuot = 0
  for (const M of so4Set.values()) {
    const lhs = mat4Mul(zL4, M)
    const rhs = mat4Mul(M, zL4)
    let maxDiff = 0
    for (let i = 0; i < 16; i++) {
      maxDiff = Math.max(maxDiff, Math.abs(lhs[i]! - rhs[i]!))
    }
    if (maxDiff < 1e-12) cQuot++
  }
  const oddQuot = (so4Set.size - cQuot) / 2

  recordCheck(
    'A1.1',
    'Negative control (E-FRC-0279): 2T, 2O, 2T_L x 2T_R, 2T_L o 2T_R have 0 center-odd components',
    G2T.length === 24 &&
      g2O.length === 48 &&
      ordProd === 576 &&
      so4Set.size === 288 &&
      odd2T === 0 &&
      odd2O === 0 &&
      oddProd === 0 &&
      oddQuot === 0,
    `|2T|=24(odd=${odd2T}), |2O|=48(odd=${odd2O}), |2T_Lx2T_R|=576(odd=${oddProd}), |2T_Lo2T_R|=288(odd=${oddQuot})`,
  )

  // --------------------------------------------------------------------------
  // A1.2 Negative Control: SU(3)_W lacks custodial SU(2)_R lock
  //      => 4 center-odd components, m_gamma = 0, BUT tree sin^2(theta_W) = 3/4
  //         AND finite-theta_H rho(theta_H) = 1 / cos(theta_H / 2) != 1!
  // --------------------------------------------------------------------------
  const mkMat3 = (entries: readonly (readonly [number, number, number, number])[]): CMat => {
    const M = cmatZero(3)
    for (const [r, c, re, im] of entries) {
      M.re[r * 3 + c] = re
      M.im[r * 3 + c] = im
    }
    return M
  }
  const T3_1 = mkMat3([[0, 1, 0.5, 0], [1, 0, 0.5, 0]])
  const T3_2 = mkMat3([[0, 1, 0, -0.5], [1, 0, 0, 0.5]])
  const T3_3 = mkMat3([[0, 0, 0.5, 0], [1, 1, -0.5, 0]])
  const T3_4 = mkMat3([[0, 2, 0.5, 0], [2, 0, 0.5, 0]])
  const T3_5 = mkMat3([[0, 2, 0, -0.5], [2, 0, 0, 0.5]])
  const T3_6 = mkMat3([[1, 2, 0.5, 0], [2, 1, 0.5, 0]])
  const T3_7 = mkMat3([[1, 2, 0, -0.5], [2, 1, 0, 0.5]])
  const T3_8 = mkMat3([
    [0, 0, 1 / (2 * SQRT3), 0],
    [1, 1, 1 / (2 * SQRT3), 0],
    [2, 2, -2 / (2 * SQRT3), 0],
  ])
  const su3Gens = [T3_1, T3_2, T3_3, T3_4, T3_5, T3_6, T3_7, T3_8]
  const zL3 = mkMat3([[0, 0, -1, 0], [1, 1, -1, 0], [2, 2, 1, 0]])

  let su3OddCount = 0
  for (const T of su3Gens) {
    const conj = cmatMul(cmatMul(zL3, T), zL3)
    const errPlus = cmatFrob(cmatAdd(conj, T, -1))
    const errMinus = cmatFrob(cmatAdd(conj, T, 1))
    if (errMinus < 1e-14) su3OddCount++
    else assert(errPlus < 1e-14, 'SU(3)_W generator must have definite z_L parity')
  }

  // Hypercharge Y = T_8 / sqrt(3) => g' = sqrt(3) g => tree sin^2(theta_W) = 3/4
  const Y3 = mkMat3([
    [0, 0, 1 / 6, 0],
    [1, 1, 1 / 6, 0],
    [2, 2, -1 / 3, 0],
  ])
  const trT3Sq = cmatTr(cmatMul(T3_3, T3_3))[0]
  const trYSq = cmatTr(cmatMul(Y3, Y3))[0]
  // In single-coupling SU(3)_W: g W^3 T_3 + g' B Y = g_3 (W^3 T_3 + B T_8) => g'/g = sqrt(Tr(T_3^2)/Tr(Y^2)) = sqrt(3)
  const sin2ThW_SU3 = (trT3Sq / trYSq) / (1 + trT3Sq / trYSq)
  const cosThW_SU3 = Math.sqrt(1 - sin2ThW_SU3)

  // Finite Wilson line U_3(theta_H) = exp(i * theta_H * lambda_6) along neutral Higgs component T_6
  // Photon generator A_gen = (sqrt(3)/2) T_3 + (1/2) T_8 (canonical Tr(A_gen^2) = 1/2)
  const A3_gen = cmatAdd(
    (() => {
      const m = cmatZero(3)
      for (let i = 0; i < 9; i++) m.re[i] = (SQRT3 / 2) * T3_3.re[i]!
      return m
    })(),
    (() => {
      const m = cmatZero(3)
      for (let i = 0; i < 9; i++) m.re[i] = 0.5 * T3_8.re[i]!
      return m
    })(),
    1,
  )
  const su3TestAngles = [PI / 6, PI / 4, PI / 3, PI / 2]
  let maxSu3RhoFormulaErr = 0
  let maxSu3PhotonM2 = 0
  let maxSu3PhotonMass = 0
  let rhoSu3AtPi3 = 0
  let rhoSu3PureG0AtPi3 = 0
  for (const th of su3TestAngles) {
    const c = Math.cos(th)
    const s = Math.sin(th)
    const U3 = mkMat3([
      [0, 0, 1, 0],
      [1, 1, c, 0],
      [1, 2, 0, s],
      [2, 1, 0, s],
      [2, 2, c, 0],
    ])
    const U3d = cmatDag(U3)
    // Canonically normalized EW generators: T_1, T_2, T_3, T_8 (each Tr(T^2) = 1/2)
    const ewGens3 = [T3_1, T3_2, T3_3, T3_8]
    const deltas = ewGens3.map(T => cmatAdd(cmatMul(cmatMul(U3d, T), U3), T, -1))
    const deltaA3 = cmatAdd(cmatMul(cmatMul(U3d, A3_gen), U3), A3_gen, -1)
    const M2 = new Float64Array(16)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        // M^2_{ij} = 2 Tr(Delta_i^dag Delta_j)
        M2[i * 4 + j] = 2 * cmatTr(cmatMul(cmatDag(deltas[i]!), deltas[j]!))[0]
      }
    }
    const evals = realSymJacobi(4, M2)
    // Ascending: [0 (gamma), M_W^2, M_W^2, M_Z^2]
    const mGam2 = Math.abs(evals[0]!)
    const mGamDirect = SQRT2 * cmatFrob(deltaA3)
    const mW = Math.sqrt(Math.max(0, evals[1]!))
    const mZ = Math.sqrt(Math.max(0, evals[3]!))
    const rho = mW / (mZ * cosThW_SU3)
    const expectedRho = 1 / Math.cos(th / 2)
    maxSu3PhotonM2 = Math.max(maxSu3PhotonM2, mGam2)
    maxSu3PhotonMass = Math.max(maxSu3PhotonMass, mGamDirect)
    maxSu3RhoFormulaErr = Math.max(maxSu3RhoFormulaErr, Math.abs(rho - expectedRho))
    if (Math.abs(th - PI / 3) < 1e-12) {
      rhoSu3AtPi3 = rho
      // Also check pure SU(2)_L (g' = 0) M_{W^1} / M_{W^3}: STILL 1/cos(theta_H/2) != 1!
      const mW1 = Math.sqrt(M2[0]!)
      const mW3 = Math.sqrt(M2[2 * 4 + 2]!)
      rhoSu3PureG0AtPi3 = mW1 / mW3
    }
  }

  recordCheck(
    'A1.2',
    'Negative control (SU(3)_W): 4 center-odd modes & m_gamma=0, BUT sin^2(theta_W)=3/4 & rho=1/cos(theta_H/2)!=1',
    su3OddCount === 4 &&
      Math.abs(sin2ThW_SU3 - 0.75) < 1e-14 &&
      maxSu3PhotonM2 < 1e-14 &&
      maxSu3PhotonMass < 1e-14 &&
      maxSu3RhoFormulaErr < 1e-13 &&
      Math.abs(rhoSu3AtPi3 - 2 / SQRT3) < 1e-13 &&
      Math.abs(rhoSu3PureG0AtPi3 - 2 / SQRT3) < 1e-13,
    `odd=${su3OddCount}, sin^2(thW)=${sin2ThW_SU3.toFixed(6)}, m_g=${maxSu3PhotonMass.toExponential(1)} (m_g^2=${maxSu3PhotonM2.toExponential(1)}), rho(pi/3)=${rhoSu3AtPi3.toFixed(6)} (g'=0: ${rhoSu3PureG0AtPi3.toFixed(6)}, exact 2/sqrt(3)=${(2 / SQRT3).toFixed(6)})`,
  )

  // --------------------------------------------------------------------------
  // A1.3 Exact SO(5) x U(1)_X Minimal Custodial GHU
  //      Construct 6x6 representation (5 of SO(5) (+) 1 of U(1)_X),
  //      verify su(2)_L x su(2)_R, 2T_L o 2T_R embedding, 4 center-odd T^{i5},
  //      exact m_gamma = 0 AND exact rho = 1.000000 for ALL theta_H and (g, g')!
  // --------------------------------------------------------------------------
  const mkJ6 = (a: number, b: number): CMat => {
    const M = cmatZero(6)
    // (J^{ab})_{jk} = -i (delta_{aj} delta_{bk} - delta_{ak} delta_{bj})
    M.im[a * 6 + b] = -1
    M.im[b * 6 + a] = 1
    return M
  }
  const cmatScaleReal = (s: number, A: CMat): CMat => {
    const out = cmatZero(A.n)
    for (let i = 0; i < A.re.length; i++) {
      out.re[i] = s * A.re[i]!
      out.im[i] = s * A.im[i]!
    }
    return out
  }

  // Self-dual SU(2)_L and anti-self-dual SU(2)_R generators inside SO(4) < SO(5)
  const J01 = mkJ6(0, 1)
  const J12 = mkJ6(1, 2)
  const J20 = mkJ6(2, 0)
  const J03 = mkJ6(0, 3)
  const J13 = mkJ6(1, 3)
  const J23 = mkJ6(2, 3)
  const TL: readonly CMat[] = [
    cmatScaleReal(0.5, cmatAdd(J12, J03, 1)),
    cmatScaleReal(0.5, cmatAdd(J20, J13, 1)),
    cmatScaleReal(0.5, cmatAdd(J01, J23, 1)),
  ]
  const TR: readonly CMat[] = [
    cmatScaleReal(0.5, cmatAdd(J12, J03, -1)),
    cmatScaleReal(0.5, cmatAdd(J20, J13, -1)),
    cmatScaleReal(0.5, cmatAdd(J01, J23, -1)),
  ]
  const TCoset: readonly CMat[] = [0, 1, 2, 3].map(i => cmatScaleReal(1 / SQRT2, mkJ6(i, 4)))
  const X6 = cmatZero(6)
  X6.re[5 * 6 + 5] = 1 // U(1)_X generator commuting with all of SO(5), Tr(X^2) = 1

  // Verify exact su(2)_L x su(2)_R Lie algebra & Tr(T_A T_B) = delta_{AB} across all 10 so(5) generators
  const allSO5: readonly CMat[] = [...TL, ...TR, ...TCoset]
  let maxTrOrthoErr = 0
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const tr = cmatTr(cmatMul(allSO5[i]!, allSO5[j]!))
      maxTrOrthoErr = Math.max(maxTrOrthoErr, cAbs(cSub(tr, i === j ? C1 : C0)))
    }
  }
  let maxSu2AlgErr = 0
  const cyc: readonly [number, number, number][] = [
    [0, 1, 2],
    [1, 2, 0],
    [2, 0, 1],
  ]
  for (const [a, b, c] of cyc) {
    // [TL^a, TL^b] = i TL^c, [TR^a, TR^b] = i TR^c
    const cL = cmatAdd(cmatMul(TL[a]!, TL[b]!), cmatMul(TL[b]!, TL[a]!), -1)
    const cR = cmatAdd(cmatMul(TR[a]!, TR[b]!), cmatMul(TR[b]!, TR[a]!), -1)
    for (let k = 0; k < 36; k++) {
      // i * T has re = -T.im, im = T.re
      maxSu2AlgErr = Math.max(
        maxSu2AlgErr,
        Math.hypot(cL.re[k]! - -TL[c]!.im[k]!, cL.im[k]! - TL[c]!.re[k]!),
        Math.hypot(cR.re[k]! - -TR[c]!.im[k]!, cR.im[k]! - TR[c]!.re[k]!),
      )
    }
  }
  let maxLRCommErr = 0
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      maxLRCommErr = Math.max(maxLRCommErr, cmatCommFrob(TL[a]!, TR[b]!))
    }
  }

  // Verify 2T_L o 2T_R (all 288 elements) embeds into exp(so(4)) < SO(5) with exact orthogonality & det=+1
  // Check exact match between quaternion exp and Lie algebra exp on the 2T generators (i, j, (-1+i+j+k)/2)!
  // Note: on basis (i, j, k, 1), left-mult by q = cos(a) + sin(a) (n.I) has matrix exp(+i * 2a * n.T_R) or (-n.T_L);
  // let's check directly that every 2T generator matrix M_L(q) commutes with all T_R^a, and every M_R(q) commutes with all T_L^a!
  let max2TCommErr = 0
  let max2TOrthoErr = 0
  const idQ: HQ = [2, 0, 0, 0]
  for (const q of G2T) {
    // Left-action M_L(q) embeds in top-left 4x4 of 6x6; check whether it commutes with T_L or T_R
    const m4L = quatToSO4(q, idQ)
    const m4R = quatToSO4(idQ, q)
    const M6L = cmatEye(6)
    const M6R = cmatEye(6)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        M6L.re[r * 6 + c] = m4L[r * 4 + c]!
        M6R.re[r * 6 + c] = m4R[r * 4 + c]!
      }
    }
    max2TOrthoErr = Math.max(max2TOrthoErr, cmatUnitaryErr(M6L), cmatUnitaryErr(M6R))
    // On basis (i,j,k,1): M_L(q) generates anti-self-dual (commutes with TL), M_R(q) generates self-dual (commutes with TR)!
    for (let a = 0; a < 3; a++) {
      max2TCommErr = Math.max(max2TCommErr, cmatCommFrob(M6L, TL[a]!), cmatCommFrob(M6R, TR[a]!))
    }
  }

  // Check z_L = diag(-1,-1,-1,-1,+1,+1) in SO(4) < SO(5) splits so(5) into 6 even + 4 center-odd bidoublet generators
  const zL6 = cmatEye(6)
  for (let i = 0; i < 4; i++) zL6.re[i * 6 + i] = -1
  let so5Even = 0
  let so5Odd = 0
  for (const T of allSO5) {
    const conj = cmatMul(cmatMul(zL6, T), zL6)
    if (cmatFrob(cmatAdd(conj, T, -1)) < 1e-14) so5Even++
    else if (cmatFrob(cmatAdd(conj, T, 1)) < 1e-14) so5Odd++
  }

  // Sweep 25 Wilson-line angles theta_H in (0, pi) and 3 electroweak coupling regimes:
  //   (1) Physical sin^2(theta_W) = 0.2312
  //   (2) Pati-Salam g_X^2 = (3/2) g_5^2 => sin^2(theta_W) = g_X^2 / (g_5^2 + 2 g_X^2) = 3/8 = 0.375
  //   (3) Small-mixing sin^2(theta_W) = 0.10
  const Vcust = [0, 1, 2].map(a => cmatAdd(TL[a]!, TR[a]!, 1))
  const Qem6 = cmatAdd(Vcust[2]!, X6, 1) // Q_em = T_L^3 + T_R^3 + X
  const Y6 = cmatAdd(TR[2]!, X6, 1) // Y = T_R^3 + X

  const g5PS = 0.65
  const gXPS = g5PS * Math.sqrt(1.5)
  const gpPS = (g5PS * gXPS) / Math.sqrt(g5PS * g5PS + gXPS * gXPS)
  const sin2PS = (gpPS * gpPS) / (g5PS * g5PS + gpPS * gpPS)
  assert(Math.abs(sin2PS - 3 / 8) < 1e-14, `Expected Pati-Salam sin^2(thW)=3/8, got ${sin2PS}`)

  const couplingCases: readonly { readonly label: string; readonly g: number; readonly gp: number }[] = [
    { label: 'physical(0.2312)', g: 0.652, gp: 0.652 * Math.sqrt(0.2312 / (1 - 0.2312)) },
    { label: 'Pati-Salam(3/8)', g: g5PS, gp: gpPS },
    { label: 'small(0.10)', g: 0.65, gp: 0.65 * Math.sqrt(0.1 / 0.9) },
  ]

  let maxSO5CustCommErr = 0
  let maxSO5QemCommErr = 0
  let maxSO5PhotonM2 = 0
  let maxSO5PhotonMass = 0
  let maxSO5RhoErr = 0
  let maxSO5FormulaErr = 0
  let totalAngleCouplingChecks = 0

  for (let k = 1; k <= 25; k++) {
    const th = (k / 26) * PI
    // Single-pass U_D(th) = exp(i th J^{34}) and orbifold round-trip W(th) = U_D(2 th)
    const mkUD = (ang: number): CMat => {
      const U = cmatEye(6)
      const c = Math.cos(ang)
      const s = Math.sin(ang)
      U.re[3 * 6 + 3] = c
      U.re[3 * 6 + 4] = s
      U.re[4 * 6 + 3] = -s
      U.re[4 * 6 + 4] = c
      return U
    }
    const UD = mkUD(th)
    const W = mkUD(2 * th)
    const Wd = cmatDag(W)

    for (let a = 0; a < 3; a++) {
      maxSO5CustCommErr = Math.max(maxSO5CustCommErr, cmatCommFrob(UD, Vcust[a]!))
    }
    maxSO5QemCommErr = Math.max(maxSO5QemCommErr, cmatCommFrob(UD, Qem6))

    for (const cc of couplingCases) {
      const { g, gp } = cc
      const cosW = g / Math.hypot(g, gp)
      const sinW = gp / Math.hypot(g, gp)
      // Gauge fields coupled as g W^a T_L^a + g' B (T_R^3 + X)
      const ewOps: readonly CMat[] = [
        cmatScaleReal(g, TL[0]!),
        cmatScaleReal(g, TL[1]!),
        cmatScaleReal(g, TL[2]!),
        cmatScaleReal(gp, Y6),
      ]
      const deltas = ewOps.map(T => cmatAdd(cmatMul(cmatMul(Wd, T), W), T, -1))
      // Direct photon generator A_gen = sin(thW) g T_L^3 + cos(thW) g' Y = e Q_em
      const AemOp = cmatAdd(cmatScaleReal(sinW * g, TL[2]!), cmatScaleReal(cosW * gp, Y6), 1)
      const deltaAem = cmatAdd(cmatMul(cmatMul(Wd, AemOp), W), AemOp, -1)
      const M2 = new Float64Array(16)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          // Canonical normalization f_H = 1 => M^2_{ij} = (1/8) Tr(Delta_i^dag Delta_j)
          // Check: Tr(Delta(T_L^a)^2) = 2 sin^2(th) => (1/8)*2 = 1/4 => M_W^2 = (g^2 / 4) sin^2(th)!
          M2[i * 4 + j] = 0.125 * cmatTr(cmatMul(cmatDag(deltas[i]!), deltas[j]!))[0]
        }
      }
      const ev = realSymJacobi(4, M2)
      const mGam2 = Math.abs(ev[0]!)
      const mGamDirect = Math.sqrt(0.125) * cmatFrob(deltaAem)
      const mW1 = Math.sqrt(Math.max(0, ev[1]!))
      const mW2 = Math.sqrt(Math.max(0, ev[2]!))
      const mZ = Math.sqrt(Math.max(0, ev[3]!))
      const mWExact = 0.5 * g * Math.sin(th)
      const mZExact = 0.5 * Math.hypot(g, gp) * Math.sin(th)
      const rho = mW1 / (mZ * cosW)

      maxSO5PhotonM2 = Math.max(maxSO5PhotonM2, mGam2)
      maxSO5PhotonMass = Math.max(maxSO5PhotonMass, mGamDirect)
      maxSO5RhoErr = Math.max(maxSO5RhoErr, Math.abs(rho - 1))
      maxSO5FormulaErr = Math.max(
        maxSO5FormulaErr,
        Math.abs(mW1 - mWExact),
        Math.abs(mW2 - mWExact),
        Math.abs(mZ - mZExact),
      )
      totalAngleCouplingChecks++
    }
  }

  recordCheck(
    'A1.3',
    'SO(5) x U(1)_X algebra, 2T_L o 2T_R embedding & 4 center-odd bidoublet generators',
    maxTrOrthoErr < 1e-14 &&
      maxSu2AlgErr < 1e-14 &&
      maxLRCommErr < 1e-14 &&
      max2TOrthoErr < 1e-14 &&
      max2TCommErr < 1e-14 &&
      so5Even === 6 &&
      so5Odd === 4,
    `trOrtho=${maxTrOrthoErr.toExponential(1)}, su2Alg=${maxSu2AlgErr.toExponential(1)}, [L,R]=${maxLRCommErr.toExponential(1)}, 2T_comm=${max2TCommErr.toExponential(1)}, parity=6_even+4_odd`,
  )
  recordCheck(
    'A1.4',
    'SO(5) x U(1)_X exact m_gamma=0 & exact custodial rho=1.000000 across all theta_H & (g,g\')',
    totalAngleCouplingChecks === 75 &&
      maxSO5CustCommErr < 1e-14 &&
      maxSO5QemCommErr < 1e-14 &&
      maxSO5PhotonM2 < 1e-14 &&
      maxSO5PhotonMass < 1e-14 &&
      maxSO5RhoErr < 1e-14 &&
      maxSO5FormulaErr < 1e-14,
    `${totalAngleCouplingChecks}/75 points: [U_D,Q_em]=${maxSO5QemCommErr.toExponential(1)}, max_m_g=${maxSO5PhotonMass.toExponential(1)} (m_g^2=${maxSO5PhotonM2.toExponential(1)}), max|rho-1|=${maxSO5RhoErr.toExponential(1)}, PS_sin2=${sin2PS.toFixed(6)}`,
  )
}

runRouteA1()

// ============================================================================
// ROUTE A (PART 2): UV-FINITE 1-LOOP HOSOTANI POTENTIAL V_eff(theta_H) ON
//                   {3,4,3,4} CUSP SPECTRUM + HONEST D_* STABILIZATION AUDIT
// ============================================================================

console.log('\n========================================================================')
console.log('ROUTE A2: UV-FINITE 1-LOOP {3,4,3,4} CUSP HOSOTANI POTENTIAL & D_* AUDIT')
console.log('========================================================================')

function runRouteA2(): void {
  // Exact {3,4,3,4} cusp radial shell degrees (matching cusp-index-casimir-noether.ts Part B1)
  const R_VOL = 18.2787077744
  const D_TAB = 12
  const kUpTab = new Float64Array(D_TAB + 2)
  const kLatTab = new Float64Array(D_TAB + 2)
  const kDnTab = new Float64Array(D_TAB + 2)
  const K_UP_BULK = 24 / (1 + R_VOL)
  const K_DN_BULK = (24 * R_VOL) / (1 + R_VOL)
  kUpTab[0] = 0
  kLatTab[0] = 6
  kDnTab[0] = 18
  kUpTab[1] = 1
  kLatTab[1] = 4 / 3
  kDnTab[1] = 65 / 3
  kUpTab[2] = 390 / 330
  kDnTab[2] = K_DN_BULK
  kLatTab[2] = 24 - kUpTab[2]! - kDnTab[2]!
  for (let d = 3; d <= D_TAB + 1; d++) {
    kUpTab[d] = K_UP_BULK
    kLatTab[d] = 0
    kDnTab[d] = K_DN_BULK
  }

  // Exact orbifold-interval operator L_q(alphas; Dstar, cK, warped, twistedIR) on a charge-q SO(2) doublet:
  //   - Site d = 0:      phi_{+, 0} only (Neumann +, Dirichlet -);
  //   - Interior 1..D-1: (phi_{+, d}, phi_{-, d});
  //   - Site d = Dstar:  phi_{+, Dstar} (twistedIR=false, i.e. (+,+)) OR phi_{-, Dstar} (twistedIR=true, (+,-)).
  //   Total dimension = 2 * Dstar.
  //   Quadratic form:
  //     E[Psi] = sum_{d=0}^{D*-1} || sqrt(a_d) Psi_{d+1} - sqrt(b_d) R(q * alpha_d) Psi_d ||^2
  //              + sum_{d=0}^{D*} latW(d) * (1 - cK) * ||Psi_d||^2
  //   where for warped {3,4,3,4} cusp: b_d = kDn[d]/24, a_d = kUp[d+1]/24, latW(d) = kLat[d]/24;
  //   and for flat S^1/Z_2 control:    b_d = a_d = 1/4, latW(d) = 1/4.
  function buildOrbifoldLaplacian(
    Dstar: number,
    alphas: readonly number[],
    qCharge: number,
    cK: number,
    warped: boolean,
    twistedIR: boolean,
  ): Float64Array {
    const dim = 2 * Dstar
    const L = new Float64Array(dim * dim)
    // Index map:
    //   d = 0:          comp 0 -> idx 0 (comp 1 absent)
    //   1 <= d <= D*-1: comp 0 -> 1 + 2*(d-1), comp 1 -> 2 + 2*(d-1)
    //   d = D*:         activeComp (= twistedIR ? 1 : 0) -> dim - 1
    const idxOf = (d: number, comp: 0 | 1): number => {
      if (d === 0) return comp === 0 ? 0 : -1
      if (d === Dstar) return comp === (twistedIR ? 1 : 0) ? dim - 1 : -1
      return 1 + 2 * (d - 1) + comp
    }

    for (let d = 0; d < Dstar; d++) {
      const bd = warped ? kDnTab[d]! / 24 : 0.25
      const ad = warped ? kUpTab[d + 1]! / 24 : 0.25
      const sA = Math.sqrt(ad)
      const sB = Math.sqrt(bd)
      const phi = qCharge * alphas[d]!
      const cp = Math.cos(phi)
      const sp = Math.sin(phi)
      // R(phi) = [[cp, -sp], [sp, cp]]
      const R00 = cp
      const R01 = -sp
      const R10 = sp
      const R11 = cp
      // Two residual rows r in {0, 1}: res_r = sA * Psi_{d+1, r} - sB * (R_{r,0} Psi_{d,0} + R_{r,1} Psi_{d,1})
      for (let r = 0; r < 2; r++) {
        const i0 = idxOf(d + 1, r as 0 | 1)
        const w0 = sA
        const i1 = idxOf(d, 0)
        const w1 = -sB * (r === 0 ? R00 : R10)
        const i2 = idxOf(d, 1)
        const w2 = -sB * (r === 0 ? R01 : R11)
        if (i0 >= 0) {
          L[i0 * dim + i0] = L[i0 * dim + i0]! + w0 * w0
          if (i1 >= 0) {
            const p = w0 * w1
            L[i0 * dim + i1] = L[i0 * dim + i1]! + p
            L[i1 * dim + i0] = L[i1 * dim + i0]! + p
          }
          if (i2 >= 0) {
            const p = w0 * w2
            L[i0 * dim + i2] = L[i0 * dim + i2]! + p
            L[i2 * dim + i0] = L[i2 * dim + i0]! + p
          }
        }
        if (i1 >= 0) {
          L[i1 * dim + i1] = L[i1 * dim + i1]! + w1 * w1
          if (i2 >= 0) {
            const p = w1 * w2
            L[i1 * dim + i2] = L[i1 * dim + i2]! + p
            L[i2 * dim + i1] = L[i2 * dim + i1]! + p
          }
        }
        if (i2 >= 0) {
          L[i2 * dim + i2] = L[i2 * dim + i2]! + w2 * w2
        }
      }
    }

    for (let d = 0; d <= Dstar; d++) {
      const latW = warped ? kLatTab[d]! / 24 : 0.25
      const addDiag = latW * (1 - cK)
      if (addDiag === 0) continue
      const idx0 = idxOf(d, 0)
      if (idx0 >= 0) L[idx0 * dim + idx0] = L[idx0 * dim + idx0]! + addDiag
      const idx1 = idxOf(d, 1)
      if (idx1 >= 0) L[idx1 * dim + idx1] = L[idx1 * dim + idx1]! + addDiag
    }
    return L
  }

  function uniformAlphas(Dstar: number, th: number): number[] {
    return new Array<number>(Dstar).fill(th / Dstar)
  }
  function localizedAlphas(Dstar: number, th: number): number[] {
    const a = new Array<number>(Dstar).fill(0)
    a[0] = th
    return a
  }

  // 1) Certify exact theta_H = 0 Neumann zero mode, exact link-distribution gauge invariance,
  //    exact UV trace invariance (zero quadratic divergence), and exact pi / 2pi periodicities!
  const LzeroWarped = buildOrbifoldLaplacian(4, uniformAlphas(4, 0), 1, 1.0, true, false)
  const evZeroWarped = realSymJacobi(8, LzeroWarped)
  const zeroModeErr = Math.abs(evZeroWarped[0]!)

  const thProbe = 0.73
  const Lunif = buildOrbifoldLaplacian(5, uniformAlphas(5, thProbe), 1, 0.4, true, false)
  const Lloc = buildOrbifoldLaplacian(5, localizedAlphas(5, thProbe), 1, 0.4, true, false)
  const Lref0 = buildOrbifoldLaplacian(5, uniformAlphas(5, 0), 1, 0.4, true, false)
  const evUnif = realSymJacobi(10, Lunif)
  const evLoc = realSymJacobi(10, Lloc)
  let maxGaugeSpecDiff = 0
  for (let i = 0; i < 10; i++) maxGaugeSpecDiff = Math.max(maxGaugeSpecDiff, Math.abs(evUnif[i]! - evLoc[i]!))

  let trUnif = 0
  let trRef0 = 0
  for (let i = 0; i < 10; i++) {
    trUnif += Lunif[i * 10 + i]!
    trRef0 += Lref0[i * 10 + i]!
  }
  const uvTraceErr = Math.abs(trUnif - trRef0)

  // Periodicity check: q=1 spectrum invariant under th -> th + pi; q=1/2 invariant under th -> th + 2*pi
  const evQ1Shift = realSymJacobi(10, buildOrbifoldLaplacian(5, uniformAlphas(5, thProbe + PI), 1, 0.4, true, false))
  let maxPerPiErr = 0
  for (let i = 0; i < 10; i++) maxPerPiErr = Math.max(maxPerPiErr, Math.abs(evUnif[i]! - evQ1Shift[i]!))

  const evQHalf0 = realSymJacobi(10, buildOrbifoldLaplacian(5, uniformAlphas(5, thProbe), 0.5, 0.4, true, true))
  const evQHalf2Pi = realSymJacobi(10, buildOrbifoldLaplacian(5, uniformAlphas(5, thProbe + 2 * PI), 0.5, 0.4, true, true))
  let maxPer2PiErr = 0
  for (let i = 0; i < 10; i++) maxPer2PiErr = Math.max(maxPer2PiErr, Math.abs(evQHalf0[i]! - evQHalf2Pi[i]!))

  recordCheck(
    'A2.1',
    '{3,4,3,4} orbifold cusp operator: exact zero mode, link-gauge invariance, UV trace invariance & periodicity',
    zeroModeErr < 1e-14 &&
      maxGaugeSpecDiff < 1e-13 &&
      uvTraceErr < 1e-14 &&
      maxPerPiErr < 1e-13 &&
      maxPer2PiErr < 1e-13,
    `lam0(0)=${zeroModeErr.toExponential(1)}, gaugeSpecDiff=${maxGaugeSpecDiff.toExponential(1)}, |dTr(L)|=${uvTraceErr.toExponential(1)}, per(pi)=${maxPerPiErr.toExponential(1)}, per(2pi)=${maxPer2PiErr.toExponential(1)}`,
  )

  // 2) Exact 3D BZ quadrature for 1-loop Hosotani effective potential:
  //    F_q(theta_H) = (1/2) * (1/|BZ|) sum_k sum_n [ sqrt(lambda_n(k, theta_H)) - sqrt(lambda_n(k, 0)) ]
  //    Using exact integer SO(5) x SU(3)_C representation multiplicities:
  //      N_B5 = 9  (SO(5) 5D gauge bosons: 3 charge-1 doublets x 3 polarizations)
  //      N_F5 = 12 (1 color-triplet Dirac 5-plet top quark: 3 x 4 = 12)
  //      N_F4 = 8  (1 Dirac 4-plet spinor with (+,-) IR parity: 2 x 4 = 8)
  function makeBZ(Nq: number): { readonly cK: number; readonly w: number }[] {
    // Exploiting cubic symmetry: compute over [0, pi]^3 midpoint grid, collapsing equal cK?
    // Even Nq = 4 (64 pts) or Nq = 6 (216 pts) with 8x8..12x12 Jacobi is tiny (< 5 ms)!
    // Exploit 6-fold permutation symmetry of (ix, iy, iz) to cut work by ~4x with zero error!
    const pts: { cK: number; w: number }[] = []
    const invN3 = 1 / (Nq * Nq * Nq)
    for (let ix = 0; ix < Nq; ix++) {
      const cx = Math.cos(((ix + 0.5) / Nq) * PI)
      for (let iy = ix; iy < Nq; iy++) {
        const cy = Math.cos(((iy + 0.5) / Nq) * PI)
        for (let iz = iy; iz < Nq; iz++) {
          const cz = Math.cos(((iz + 0.5) / Nq) * PI)
          const mult = ix === iy && iy === iz ? 1 : ix === iy || iy === iz ? 3 : 6
          pts.push({ cK: (cx + cy + cz) / 3, w: mult * invN3 })
        }
      }
    }
    return pts
  }

  const bz4 = makeBZ(4)
  const bz6 = makeBZ(6)
  const bz8 = makeBZ(8)

  function oneLoopModeEnergy(
    Dstar: number,
    th: number,
    qCharge: number,
    warped: boolean,
    twistedIR: boolean,
    bz: readonly { readonly cK: number; readonly w: number }[],
  ): number {
    const dim = 2 * Dstar
    const alphas = uniformAlphas(Dstar, th)
    let tot = 0
    for (const pt of bz) {
      const L = buildOrbifoldLaplacian(Dstar, alphas, qCharge, pt.cK, warped, twistedIR)
      const ev = realSymJacobi(dim, L)
      let s = 0
      for (let i = 0; i < dim; i++) s += 0.5 * Math.sqrt(Math.max(0, ev[i]!))
      tot += pt.w * s
    }
    return tot
  }

  const NB5 = 9
  const NF5 = 12
  const NF4 = 8

  function evalVeff(
    Dstar: number,
    th: number,
    warped: boolean,
    bz: readonly { readonly cK: number; readonly w: number }[],
    refE: { readonly e1_0: number; readonly eHalf_0: number },
    pureGauge: boolean,
  ): number {
    const f1 = oneLoopModeEnergy(Dstar, th, 1, warped, false, bz) - refE.e1_0
    if (pureGauge) return NB5 * f1
    const fHalf = oneLoopModeEnergy(Dstar, th, 0.5, warped, true, bz) - refE.eHalf_0
    return (NB5 - NF5) * f1 - NF4 * fHalf
  }

  function analyzeVeff(
    Dstar: number,
    warped: boolean,
    bz: readonly { readonly cK: number; readonly w: number }[],
  ): {
    readonly pureGaugeMinAtZero: boolean
    readonly pureGaugePi2: number
    readonly thStar: number
    readonly vMin: number
    readonly vDoublePrime: number
    readonly mHProxy: number
  } {
    const refE = {
      e1_0: oneLoopModeEnergy(Dstar, 0, 1, warped, false, bz),
      eHalf_0: oneLoopModeEnergy(Dstar, 0, 0.5, warped, true, bz),
    }

    // Check pure gauge: must be strictly positive on (0, pi) and minimized at theta_H = 0
    let pureGaugeMinAtZero = true
    for (let k = 1; k <= 12; k++) {
      const th = (k / 13) * PI
      const vg = evalVeff(Dstar, th, warped, bz, refE, true)
      if (vg <= 0) pureGaugeMinAtZero = false
    }
    const pureGaugePi2 = evalVeff(Dstar, PI / 2, warped, bz, refE, true)

    // Coarse scan on [0, pi] then golden-section refinement to < 1e-10
    const Nscan = 32
    let bestIdx = 0
    let bestVal = 0
    for (let i = 1; i <= Nscan; i++) {
      const th = (i / Nscan) * PI
      const v = evalVeff(Dstar, th, warped, bz, refE, false)
      if (v < bestVal) {
        bestVal = v
        bestIdx = i
      }
    }
    let lo = Math.max(0, ((bestIdx - 1) / Nscan) * PI)
    let hi = Math.min(PI, ((bestIdx + 1) / Nscan) * PI)
    const gr = (Math.sqrt(5) - 1) / 2
    let x1 = hi - gr * (hi - lo)
    let x2 = lo + gr * (hi - lo)
    let f1 = evalVeff(Dstar, x1, warped, bz, refE, false)
    let f2 = evalVeff(Dstar, x2, warped, bz, refE, false)
    for (let it = 0; it < 42; it++) {
      if (f1 < f2) {
        hi = x2
        x2 = x1
        f2 = f1
        x1 = hi - gr * (hi - lo)
        f1 = evalVeff(Dstar, x1, warped, bz, refE, false)
      } else {
        lo = x1
        x1 = x2
        f1 = f2
        x2 = lo + gr * (hi - lo)
        f2 = evalVeff(Dstar, x2, warped, bz, refE, false)
      }
    }
    const thStar = 0.5 * (lo + hi)
    const vMin = evalVeff(Dstar, thStar, warped, bz, refE, false)
    const h = 2e-3
    const vPlus = evalVeff(Dstar, thStar + h, warped, bz, refE, false)
    const vMinus = evalVeff(Dstar, thStar - h, warped, bz, refE, false)
    const vDoublePrime = (vPlus - 2 * vMin + vMinus) / (h * h)
    // Lattice curvature proxy m_H(f_H=1) = sqrt(V''(theta_H^*)) from the c_f = 0 scalar orbifold Laplacian
    // (proving strictly positive curvature m_H^2 > 0; physical m_H/m_W requires fixing f_H & bulk fermion masses c_f)
    const mHProxy = Math.sqrt(Math.max(0, vDoublePrime))
    return { pureGaugeMinAtZero, pureGaugePi2, thStar, vMin, vDoublePrime, mHProxy }
  }

  // UV-convergence check on D_* = 4 warped cusp across Nq = 4, 6, 8
  const conv4 = analyzeVeff(4, true, bz4)
  const conv6 = analyzeVeff(4, true, bz6)
  const conv8 = analyzeVeff(4, true, bz8)
  const uvConvRelDiff = Math.abs(conv8.vMin - conv6.vMin) / Math.abs(conv8.vMin)
  const uvThDiff = Math.abs(conv8.thStar - conv6.thStar)

  // Flat S^1/Z_2 control at D_* = 4
  const flat4 = analyzeVeff(4, false, bz6)

  // Warped {3,4,3,4} cusp scan across D_* = 2, 3, 4, 5, 6 (using bz6)
  const cuspDepths = [2, 3, 4, 5, 6]
  const cuspRuns = cuspDepths.map(D => ({ D, res: analyzeVeff(D, true, bz6) }))

  console.log('  1-Loop Hosotani V_eff(theta_H) on {3,4,3,4} cusp (c_f=0 scalar orbifold Laplacian; N_B5=9, N_F5=12, N_F4=8):')
  console.log(
    `    Flat S^1/Z_2 (D*=4):   pureGauge(pi/2)=+${flat4.pureGaugePi2.toExponential(3)}, th*=${flat4.thStar.toFixed(6)} rad, V_min=${flat4.vMin.toExponential(4)}, V''=${flat4.vDoublePrime.toExponential(4)}, m_H(f_H=1)=${flat4.mHProxy.toExponential(4)}`,
  )
  for (const row of cuspRuns) {
    console.log(
      `    Cusp {3,4,3,4} (D*=${row.D}): pureGauge(pi/2)=+${row.res.pureGaugePi2.toExponential(3)}, th*=${row.res.thStar.toFixed(6)} rad, V_min=${row.res.vMin.toExponential(4)}, V''=${row.res.vDoublePrime.toExponential(4)}, m_H(f_H=1)=${row.res.mHProxy.toExponential(4)}`,
    )
  }

  // Verify every D_* has unbroken pure gauge AND nontrivial EWSB 0 < th* < pi/2 with m_H > 0
  const allEWSBValid =
    flat4.pureGaugeMinAtZero &&
    flat4.thStar > 0.1 &&
    flat4.thStar < PI / 2 - 0.05 &&
    flat4.vMin < 0 &&
    flat4.vDoublePrime > 0 &&
    cuspRuns.every(
      r =>
        r.res.pureGaugeMinAtZero &&
        r.res.thStar > 0.1 &&
        r.res.thStar < PI / 2 - 0.05 &&
        r.res.vMin < 0 &&
        r.res.vDoublePrime > 0,
    )

  // Honest negative control: |V_min(D_*)| decays strictly monotonically across D_* = 2..6
  let monoDecay = true
  const decayRatios: number[] = []
  for (let i = 1; i < cuspRuns.length; i++) {
    const prev = Math.abs(cuspRuns[i - 1]!.res.vMin)
    const cur = Math.abs(cuspRuns[i]!.res.vMin)
    if (!(cur < prev)) monoDecay = false
    decayRatios.push(prev / cur)
  }
  const fittedDecayRate = Math.log(Math.abs(cuspRuns[1]!.res.vMin) / Math.abs(cuspRuns[4]!.res.vMin)) / 3
  const expectedHalfLogLambda = 0.5 * Math.log(R_VOL)
  console.log(
    `  HONEST D_* STABILIZATION BOUNDARY: |V_min(D*)| decays strictly monotonically across D*=2..6 ` +
      `(ratios: [${decayRatios.map(r => r.toFixed(3)).join(', ')}], fitted rate=${fittedDecayRate.toFixed(4)} vs (1/2)ln(lambda)=${expectedHalfLogLambda.toFixed(4)}; ` +
      `stabilizing D*~13 for v_EW/M_Pl~1e-16 requires explicit IR/UV brane-tension balance).`,
  )

  recordCheck(
    'A2.2',
    'UV-finite 1-loop Hosotani EWSB (c_f=0 orbifold): pure gauge unbroken, gauge+5/4 fermions yield 0 < th* < pi/2 & m_H(f_H=1) > 0',
    allEWSBValid && uvConvRelDiff < 0.05 && uvThDiff < 0.01 && conv4.vMin < 0,
    `Cusp D*=4: th*=${conv6.thStar.toFixed(5)} rad, V_min=${conv6.vMin.toExponential(3)}, m_H(f_H=1)=${conv6.mHProxy.toExponential(3)}, BZ(6->8) dTh=${uvThDiff.toExponential(1)}, dV/V=${uvConvRelDiff.toExponential(1)}`,
  )
  recordCheck(
    'A2.3',
    'Honest negative control (D_* stabilization): |V_eff(theta_H^*; D_*)| decays monotonically (needs brane tension)',
    monoDecay && decayRatios.every(r => r > 3.0) && Math.abs(fittedDecayRate - expectedHalfLogLambda) < 0.5,
    `monotonicDecay=${monoDecay}, stepRatios=[${decayRatios.map(r => r.toFixed(2)).join(',')}], rate=${fittedDecayRate.toFixed(3)} vs (1/2)ln(lam)=${expectedHalfLogLambda.toFixed(3)}`,
  )
}

runRouteA2()

// ============================================================================
// ROUTE B: TIER B LINEARIZED 3D {4,3,4} SINGLE-SPEED c = 1 UNITARY SPLIT-STEP
//          STUECKELBERG / ANDERSON-HIGGS QCA (FREE-FIELD QUADRATIC SECTOR)
// ============================================================================

console.log('\n========================================================================')
console.log('ROUTE B: TIER B LINEARIZED 3D {4,3,4} c=1 STUECKELBERG / ANDERSON-HIGGS QCA')
console.log('========================================================================')

function runRouteB(): void {
  // Linearized (quadratic, free-field) Stueckelberg / Anderson-Higgs QCA:
  //   - No non-Abelian [W, W] self-interactions and no nonlinear Higgs potential.
  //   - Input mass parameters inherit the SO(5) custodial relation M_W = M_Z cos(theta_W)
  //     proved in Route A1 (A1.4); rho_K = 1.000000 at q = 0 is an input consistency check,
  //     while exact U^dag U = I, symplecticity, local Gauss conservation, 12^3 BZ eaten-Goldstone
  //     mode counting (4 zero, 2 photon, 6 W^+-, 3 Z^0, 1 H), and Floquet rho_QCA are genuine QCA outputs.
  const SIN2_THW = 0.2312
  const COS_THW = Math.sqrt(1 - SIN2_THW)
  const SIN_THW = Math.sqrt(SIN2_THW)
  const M_Z = 0.1
  const M_W = M_Z * COS_THW
  const M_B = M_Z * SIN_THW
  const M_H = 0.137 // physical m_H / m_Z = 125.1 / 91.19 = 1.372
  const TAU = 0.5 // W16 single-speed CFL-stable coupling tau_E = tau_B = 1/2 => c = 1.000000

  // 16 canonical coordinates per 3D site:
  //   0..2:   W_x^1, W_y^1, W_z^1
  //   3..5:   W_x^2, W_y^2, W_z^2
  //   6..8:   W_x^3, W_y^3, W_z^3
  //   9..11:  B_x,   B_y,   B_z
  //   12..14: pi^1,  pi^2,  pi^3
  //   15:     h
  // Build exact 25 x 16 field-strength factorization D(q) such that K(q) = D(q)^dag D(q) identically:
  //   rows 0..11:  4 curls (B_xy, B_yz, B_zx) of W^1, W^2, W^3, B
  //   rows 12..14: D_mu pi^1 = d_mu pi^1 - m_W W_mu^1
  //   rows 15..17: D_mu pi^2 = d_mu pi^2 - m_W W_mu^2
  //   rows 18..20: D_mu pi^3 = d_mu pi^3 - m_W W_mu^3 + m_B B_mu
  //   rows 21..23: d_mu h
  //   row  24:     m_H h
  function buildEWOperatorDAndK(qx: number, qy: number, qz: number): {
    readonly dRe: Float64Array
    readonly dIm: Float64Array
    readonly K: CMat
    readonly qHatSq: number
    readonly dVec: readonly C[]
  } {
    const dVec: readonly C[] = [cSub(cExpI(qx), C1), cSub(cExpI(qy), C1), cSub(cExpI(qz), C1)]
    const qHatSq = cAbs2(dVec[0]!) + cAbs2(dVec[1]!) + cAbs2(dVec[2]!)
    const dRe = new Float64Array(25 * 16)
    const dIm = new Float64Array(25 * 16)
    const setD = (r: number, c: number, val: C) => {
      dRe[r * 16 + c] = val[0]
      dIm[r * 16 + c] = val[1]
    }
    // 4 gauge fields curls: (xy: d_0 A_1 - d_1 A_0), (yz: d_1 A_2 - d_2 A_1), (zx: d_2 A_0 - d_0 A_2)
    for (let g = 0; g < 4; g++) {
      const cOff = 3 * g
      const rOff = 3 * g
      setD(rOff + 0, cOff + 1, dVec[0]!)
      setD(rOff + 0, cOff + 0, cScale(-1, dVec[1]!))
      setD(rOff + 1, cOff + 2, dVec[1]!)
      setD(rOff + 1, cOff + 1, cScale(-1, dVec[2]!))
      setD(rOff + 2, cOff + 0, dVec[2]!)
      setD(rOff + 2, cOff + 2, cScale(-1, dVec[0]!))
    }
    // Goldstone covariant derivatives
    for (let mu = 0; mu < 3; mu++) {
      // D_mu pi^1 = d_mu pi^1 - m_W W_mu^1
      setD(12 + mu, 12, dVec[mu]!)
      setD(12 + mu, 0 + mu, [-M_W, 0])
      // D_mu pi^2 = d_mu pi^2 - m_W W_mu^2
      setD(15 + mu, 13, dVec[mu]!)
      setD(15 + mu, 3 + mu, [-M_W, 0])
      // D_mu pi^3 = d_mu pi^3 - m_W W_mu^3 + m_B B_mu
      setD(18 + mu, 14, dVec[mu]!)
      setD(18 + mu, 6 + mu, [-M_W, 0])
      setD(18 + mu, 9 + mu, [M_B, 0])
      // d_mu h
      setD(21 + mu, 15, dVec[mu]!)
    }
    setD(24, 15, [M_H, 0])

    // K = D^dag * D (16 x 16 Hermitian PSD)
    const K = cmatZero(16)
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        let sr = 0
        let si = 0
        for (let r = 0; r < 25; r++) {
          const ar = dRe[r * 16 + i]!
          const ai = -dIm[r * 16 + i]!
          const br = dRe[r * 16 + j]!
          const bi = dIm[r * 16 + j]!
          sr += ar * br - ai * bi
          si += ar * bi + ai * br
        }
        K.re[i * 16 + j] = sr
        K.im[i * 16 + j] = si
      }
    }
    return { dRe, dIm, K, qHatSq, dVec }
  }

  // Exact 32x32 palindromic split-step symplectic transfer matrix:
  //   M_EW,pal(q) = M_E(1/4) M_B(1/2) M_E(1/2) M_B(1/2) M_E(1/4)
  function buildSymplecticM(K: CMat): CMat {
    const mkME = (dt: number): CMat => {
      const M = cmatEye(32)
      for (let i = 0; i < 16; i++) M.re[i * 32 + (16 + i)] = dt
      return M
    }
    const mkMB = (dt: number): CMat => {
      const M = cmatEye(32)
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
          M.re[(16 + r) * 32 + c] = -dt * K.re[r * 16 + c]!
          M.im[(16 + r) * 32 + c] = -dt * K.im[r * 16 + c]!
        }
      }
      return M
    }
    const E1 = mkME(TAU / 2)
    const E2 = mkME(TAU)
    const B1 = mkMB(TAU)
    return cmatMul(E1, cmatMul(B1, cmatMul(E2, cmatMul(B1, E1))))
  }

  // Symplectic form Omega = [[0, I_16], [-I_16, 0]]
  const Omega32 = cmatZero(32)
  for (let i = 0; i < 16; i++) {
    Omega32.re[i * 32 + (16 + i)] = 1
    Omega32.re[(16 + i) * 32 + i] = -1
  }

  // 1) Certify exact U^dag U = I unitarity (< 1e-13), symplecticity, and exact local Gauss commutation
  //    at a rich set of generic 3D momenta (including corners, axes, diagonals, and general irrational-like BZ points)
  const unitarityTestPts: readonly (readonly [number, number, number])[] = [
    [0.37, 0.51, 0.89],
    [1.1, 0, 0],
    [1.2, 1.2, 0],
    [PI / 2, PI / 3, PI / 4],
    [PI, PI, PI],
    [0.15, 0.25, 0.35],
  ]
  let maxSympErr = 0
  let maxGaussCommErr = 0
  let maxUEWPalUniErr = 0
  let maxURsUniErr = 0
  let maxFloquetPhaseErr = 0

  for (const [qx, qy, qz] of unitarityTestPts) {
    const { dRe, dIm, K, dVec } = buildEWOperatorDAndK(qx, qy, qz)
    const M = buildSymplecticM(K)

    // Symplectic check: ||M^dag Omega M - Omega||_F
    const sympDiff = cmatAdd(cmatMul(cmatDag(M), cmatMul(Omega32, M)), Omega32, -1)
    maxSympErr = Math.max(maxSympErr, cmatFrob(sympDiff))

    // Exact local Gauss law functionals g_alpha^dag P:
    //   G^a(q) = sum_mu d_mu^* E_mu^a + m_W Pi_pi^a  (a = 1, 2, 3)
    //   G^Y(q) = sum_mu d_mu^* E_mu^B - m_B Pi_pi^3
    // Verify g_alpha^dag * M = g_alpha^dag identically (exact conservation [M, G] = 0 for all 4 generators!)
    const gaussRows: C[][] = [0, 1, 2, 3].map(() => new Array<C>(32).fill(C0))
    for (let a = 0; a < 3; a++) {
      for (let mu = 0; mu < 3; mu++) gaussRows[a]![16 + 3 * a + mu] = cConj(dVec[mu]!)
      gaussRows[a]![16 + 12 + a] = [M_W, 0]
    }
    for (let mu = 0; mu < 3; mu++) gaussRows[3]![16 + 9 + mu] = cConj(dVec[mu]!)
    gaussRows[3]![16 + 14] = [-M_B, 0]
    for (let gIdx = 0; gIdx < 4; gIdx++) {
      const row = gaussRows[gIdx]!
      let err2 = 0
      for (let c = 0; c < 32; c++) {
        let sr = 0
        let si = 0
        for (let r = 0; r < 32; r++) {
          const gr = row[r]![0]
          const gi = row[r]![1]
          const mr = M.re[r * 32 + c]!
          const mi = M.im[r * 32 + c]!
          sr += gr * mr - gi * mi
          si += gr * mi + gi * mr
        }
        err2 += (sr - row[c]![0]) ** 2 + (si - row[c]![1]) ** 2
      }
      maxGaussCommErr = Math.max(maxGaussCommErr, Math.sqrt(err2))
    }

    // Exact 28 x 28 Gauss-physical unitary lift U_EW,pal(q):
    //   Diagonalize K = V diag(lam_0..lam_15) V^dag.
    //   The 4 zero modes (lam < 1e-12) act as I_4 on static pure-gauge configurations (P_gauge = 0).
    //   On the 12 physical modes (lam_n > 0), exact modified energy metric H_mod = diag(lam, 1 - (tau^2/4) lam)
    //   transforms M_EW,pal into an EXACT 24x24 unitary matrix U_phys = H_mod^{1/2} M_phys H_mod^{-1/2}!
    //   Combined with I_4 on the 4 gauge zero modes => exact 28x28 unitary U_EW,pal(q) with U^dag U = I!
    const eigK = hermitianJacobi(16, K.re, K.im, true)
    // Build V_phys (16 x 12) for the 12 physical eigenmodes
    const physIdx: number[] = []
    for (let k = 0; k < 16; k++) if (eigK.vals[k]! > 1e-11) physIdx.push(k)
    assert(physIdx.length === 12, `Expected 12 physical modes at (${qx},${qy},${qz}), got ${physIdx.length}`)

    // Project M into the 24-dim physical eigenbasis: M_eig = (I_2 (x) V_phys^dag) M (I_2 (x) V_phys),
    // then conjugate by S = diag(sqrt(lam_n), sqrt(1 - (tau^2/4) lam_n))
    const U28 = cmatEye(28) // indices 0..23 = U_phys, 24..27 = I_4 (gauge zero modes)
    const sqLam = new Float64Array(12)
    const sqAlp = new Float64Array(12)
    for (let a = 0; a < 12; a++) {
      const lam = eigK.vals[physIdx[a]!]!
      sqLam[a] = Math.sqrt(lam)
      sqAlp[a] = Math.sqrt(1 - 0.25 * TAU * TAU * lam)
    }
    // Transform 16x16 blocks of M: M = [[A, B], [C, D]]
    for (let a = 0; a < 12; a++) {
      const ka = physIdx[a]!
      for (let b = 0; b < 12; b++) {
        const kb = physIdx[b]!
        // Compute (V^dag Block V)_{a, b} for all 4 blocks of M
        let aR = 0, aI = 0, bR = 0, bI = 0, cR = 0, cI = 0, dR2 = 0, dI2 = 0
        for (let r = 0; r < 16; r++) {
          const uar = eigK.vecRe[ka * 16 + r]!
          const uai = -eigK.vecIm[ka * 16 + r]! // conj
          for (let c = 0; c < 16; c++) {
            const vbr = eigK.vecRe[kb * 16 + c]!
            const vbi = eigK.vecIm[kb * 16 + c]!
            const wR = uar * vbr - uai * vbi
            const wI = uar * vbi + uai * vbr
            // Block (0,0)
            aR += wR * M.re[r * 32 + c]! - wI * M.im[r * 32 + c]!
            aI += wR * M.im[r * 32 + c]! + wI * M.re[r * 32 + c]!
            // Block (0,1)
            bR += wR * M.re[r * 32 + (16 + c)]! - wI * M.im[r * 32 + (16 + c)]!
            bI += wR * M.im[r * 32 + (16 + c)]! + wI * M.re[r * 32 + (16 + c)]!
            // Block (1,0)
            cR += wR * M.re[(16 + r) * 32 + c]! - wI * M.im[(16 + r) * 32 + c]!
            cI += wR * M.im[(16 + r) * 32 + c]! + wI * M.re[(16 + r) * 32 + c]!
            // Block (1,1)
            dR2 += wR * M.re[(16 + r) * 32 + (16 + c)]! - wI * M.im[(16 + r) * 32 + (16 + c)]!
            dI2 += wR * M.im[(16 + r) * 32 + (16 + c)]! + wI * M.re[(16 + r) * 32 + (16 + c)]!
          }
        }
        // Apply similarity S * Block * S^{-1}
        const sLa = sqLam[a]!
        const sLb = sqLam[b]!
        const sAa = sqAlp[a]!
        const sAb = sqAlp[b]!
        U28.re[a * 28 + b] = (sLa / sLb) * aR
        U28.im[a * 28 + b] = (sLa / sLb) * aI
        U28.re[a * 28 + (12 + b)] = (sLa / sAb) * bR
        U28.im[a * 28 + (12 + b)] = (sLa / sAb) * bI
        U28.re[(12 + a) * 28 + b] = (sAa / sLb) * cR
        U28.im[(12 + a) * 28 + b] = (sAa / sLb) * cI
        U28.re[(12 + a) * 28 + (12 + b)] = (sAa / sAb) * dR2
        U28.im[(12 + a) * 28 + (12 + b)] = (sAa / sAb) * dI2
      }
      // Verify exact Floquet eigenvalue cos(omega_a) = Re(U_{a,a}) matches cos(4 arcsin(sqrt(lam)/4))!
      const lam = eigK.vals[ka]!
      const omExact = 4 * Math.asin(0.25 * Math.sqrt(lam))
      maxFloquetPhaseErr = Math.max(maxFloquetPhaseErr, Math.abs(U28.re[a * 28 + a]! - Math.cos(omExact)))
    }
    maxUEWPalUniErr = Math.max(maxUEWPalUniErr, cmatUnitaryErr(U28))

    // Also build exact 41 x 41 Riemann-Silberstein Hermitian H_EW = [[0, i D^dag], [-i D, 0]] and U_RS = exp(-i H_EW)
    const HRS = cmatZero(41)
    for (let r = 0; r < 25; r++) {
      for (let c = 0; c < 16; c++) {
        // (-i D)_{r, c} = (dIm, -dRe) at row 16+r, col c
        const dr = dRe[r * 16 + c]!
        const di = dIm[r * 16 + c]!
        HRS.re[(16 + r) * 41 + c] = di
        HRS.im[(16 + r) * 41 + c] = -dr
        // (i D^dag)_{c, r} = (dIm, +dRe) at row c, col 16+r
        HRS.re[c * 41 + (16 + r)] = di
        HRS.im[c * 41 + (16 + r)] = dr
      }
    }
    const URS = hermitianExpNegI(HRS, 1.0)
    maxURsUniErr = Math.max(maxURsUniErr, cmatUnitaryErr(URS))
  }

  recordCheck(
    'B1',
    '3D {4,3,4} Anderson-Higgs QCA: exact U^dag U = I (<1e-13), symplecticity & local Gauss commutation',
    maxUEWPalUniErr < 1e-13 &&
      maxURsUniErr < 1e-13 &&
      maxSympErr < 1e-14 &&
      maxGaussCommErr < 1e-14 &&
      maxFloquetPhaseErr < 1e-13,
    `||U_EW,pal^dag U - I||=${maxUEWPalUniErr.toExponential(1)}, ||U_RS^dag U - I||=${maxURsUniErr.toExponential(1)}, symp=${maxSympErr.toExponential(1)}, [M,G]=${maxGaussCommErr.toExponential(1)}, floquet=${maxFloquetPhaseErr.toExponential(1)}`,
  )

  // 2) Full 12^3 = 1,728 3D Brillouin Zone Sweep:
  //    Certify at EVERY q in BZ_3:
  //      4 gauge zero modes, 2 massless photons, 6 degenerate W^+- polarizations,
  //      3 degenerate Z^0 polarizations, 1 physical Higgs H, and exact custodial rho_K = 1.000000!
  const NBZ = 12
  let bzPointsChecked = 0
  let maxZeroErr = 0
  let maxPhotonDispErr = 0
  let maxWDispErr = 0
  let maxWSplitErr = 0
  let maxZDispErr = 0
  let maxZSplitErr = 0
  let maxHDispErr = 0
  let modeCountOk = true

  for (let ix = 0; ix < NBZ; ix++) {
    const qx = (2 * PI * ix) / NBZ
    for (let iy = 0; iy < NBZ; iy++) {
      const qy = (2 * PI * iy) / NBZ
      for (let iz = 0; iz < NBZ; iz++) {
        const qz = (2 * PI * iz) / NBZ
        const { K, qHatSq } = buildEWOperatorDAndK(qx, qy, qz)
        const eig = hermitianJacobi(16, K.re, K.im, false)
        const v = eig.vals

        // Expected sorted spectrum of K(q):
        //   0..3:   0 (x4)            — 4 gauge zero modes (Wait: at q=0, qHatSq=0 so photons also hit 0; handled cleanly!)
        //   4..5:   qHatSq (x2)       — 2 massless transverse photons
        //   6..11:  qHatSq + M_W^2 (x6) — 6 degenerate W^+- polarizations (2T + 1L per charge)
        //   12..14: qHatSq + M_Z^2 (x3) — 3 degenerate Z^0 polarizations (2T + 1L)
        //   15:     qHatSq + M_H^2 (x1) — 1 physical Higgs H
        // Note: at q=0, exact expected spectrum is 0(x6), M_W^2(x6), M_Z^2(x3), M_H^2(x1) (since photons are massless!).
        const expected = [
          0, 0, 0, 0,
          qHatSq, qHatSq,
          qHatSq + M_W * M_W, qHatSq + M_W * M_W, qHatSq + M_W * M_W,
          qHatSq + M_W * M_W, qHatSq + M_W * M_W, qHatSq + M_W * M_W,
          qHatSq + M_Z * M_Z, qHatSq + M_Z * M_Z, qHatSq + M_Z * M_Z,
          qHatSq + M_H * M_H,
        ]
        // Exact mode-by-mode check
        for (let i = 0; i < 4; i++) maxZeroErr = Math.max(maxZeroErr, Math.abs(v[i]!))
        for (let i = 4; i < 6; i++) maxPhotonDispErr = Math.max(maxPhotonDispErr, Math.abs(v[i]! - expected[i]!))
        for (let i = 6; i < 12; i++) maxWDispErr = Math.max(maxWDispErr, Math.abs(v[i]! - expected[i]!))
        maxWSplitErr = Math.max(maxWSplitErr, v[11]! - v[6]!)
        for (let i = 12; i < 15; i++) maxZDispErr = Math.max(maxZDispErr, Math.abs(v[i]! - expected[i]!))
        maxZSplitErr = Math.max(maxZSplitErr, v[14]! - v[12]!)
        maxHDispErr = Math.max(maxHDispErr, Math.abs(v[15]! - expected[15]!))

        if (qHatSq > 1e-10) {
          let nZero = 0
          for (let i = 0; i < 16; i++) if (Math.abs(v[i]!) < 1e-11) nZero++
          if (nZero !== 4) modeCountOk = false
        }
        bzPointsChecked++
      }
    }
  }

  // Exact rest masses at q = 0 and speed of light c_gamma along [1,0,0], [1,1,0], [1,1,1]
  const atZero = buildEWOperatorDAndK(0, 0, 0)
  const eig0 = hermitianJacobi(16, atZero.K.re, atZero.K.im, false)
  const mGamma0Sq = Math.abs(eig0.vals[5]!)
  // Direct linear photon mass norm ||D(0) v_photon||_2 on photon polarization A_mu = sin(thW) W_mu^3 + cos(thW) B_mu
  let mGamma0Direct2 = 0
  for (let mu = 0; mu < 3; mu++) {
    for (let r = 0; r < 25; r++) {
      const vr = atZero.dRe[r * 16 + (6 + mu)]! * SIN_THW + atZero.dRe[r * 16 + (9 + mu)]! * COS_THW
      const vi = atZero.dIm[r * 16 + (6 + mu)]! * SIN_THW + atZero.dIm[r * 16 + (9 + mu)]! * COS_THW
      mGamma0Direct2 += vr * vr + vi * vi
    }
  }
  const mGamma0 = Math.sqrt(mGamma0Direct2)
  const mW0 = Math.sqrt(Math.max(0, eig0.vals[6]!))
  const mZ0 = Math.sqrt(Math.max(0, eig0.vals[12]!))
  const mH0 = Math.sqrt(Math.max(0, eig0.vals[15]!))
  // Input consistency check inherited from Route A1's SO(5) custodial theorem (M_W = M_Z cos theta_W):
  const rhoK = mW0 / (mZ0 * COS_THW)
  // Genuine QCA Floquet dispersion ratio (O(m_Z^2/96) lattice discretization shift):
  const omW0 = 4 * Math.asin(0.25 * mW0)
  const omZ0 = 4 * Math.asin(0.25 * mZ0)
  const rhoQCA = omW0 / (omZ0 * COS_THW)

  const dirs: readonly [number, number, number][] = [
    [1, 0, 0],
    [1 / SQRT2, 1 / SQRT2, 0],
    [1 / SQRT3, 1 / SQRT3, 1 / SQRT3],
  ]
  const epsQ = 1e-4
  let maxSpeedErr = 0
  for (const [dx, dy, dz] of dirs) {
    const { K } = buildEWOperatorDAndK(epsQ * dx, epsQ * dy, epsQ * dz)
    const ev = hermitianJacobi(16, K.re, K.im, false).vals
    const omGam = 4 * Math.asin(0.25 * Math.sqrt(Math.max(0, ev[4]!)))
    const cGam = omGam / epsQ
    maxSpeedErr = Math.max(maxSpeedErr, Math.abs(cGam - 1))
  }

  recordCheck(
    'B2',
    '12^3 3D BZ linearized Stueckelberg QCA: 4 zero, 2 photon (c=1), 6 W^+-, 3 Z^0, 1 H, Floquet rho_QCA & input-consistent rho_K',
    bzPointsChecked === 1728 &&
      modeCountOk &&
      maxZeroErr < 1e-13 &&
      maxPhotonDispErr < 1e-13 &&
      maxWDispErr < 1e-13 &&
      maxWSplitErr < 1e-13 &&
      maxZDispErr < 1e-13 &&
      maxZSplitErr < 1e-13 &&
      maxHDispErr < 1e-13 &&
      mGamma0Sq < 1e-14 &&
      mGamma0 < 1e-15 &&
      maxSpeedErr < 1e-7 &&
      Math.abs(rhoK - 1) < 1e-14 &&
      Math.abs(rhoQCA - 1) < 1e-4,
    `1728/1728 BZ pts: m_g=${mGamma0.toExponential(1)} (m_g^2=${mGamma0Sq.toExponential(1)}), c_g=1+-${maxSpeedErr.toExponential(1)}, W6_split=${maxWSplitErr.toExponential(1)}, Z3_split=${maxZSplitErr.toExponential(1)}, rho_K(A1-input)=${rhoK.toFixed(12)}, rho_QCA=${rhoQCA.toFixed(6)}`,
  )

  // 3) Live 8^3 = 512-site 3D {4,3,4} real-space T = 16 beat evolution of M_EW,pal:
  //    Certify exact <1e-14 reversibility and <1e-14 local Gauss conservation across all 512 sites!
  const L = 8
  const V = L * L * L
  const idx3 = (x: number, y: number, z: number): number => ((x * L + y) * L + z)

  // 16 Q fields + 16 P fields over V sites
  const Q = new Float64Array(16 * V)
  const P = new Float64Array(16 * V)

  // Deterministic gauge-consistent initial wavepacket (compact support inside 8^3):
  //   Excite transverse W^1_y, B_z, Higgs h, AND longitudinal W^1_x balanced by Pi_pi^1 so G^a = G^Y = 0!
  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        const s = idx3(x, y, z)
        const sx = Math.sin((2 * PI * x) / L)
        const cy = Math.cos((2 * PI * y) / L)
        const cz = Math.cos((2 * PI * z) / L)
        // Transverse W^1_y(x,z) (independent of y => div = 0)
        Q[1 * V + s] = 0.25 * sx * cz
        // Transverse B_z(x,y) (independent of z => div = 0)
        Q[11 * V + s] = 0.2 * sx * cy
        // Higgs scalar excitation
        Q[15 * V + s] = 0.3 * sx * cy * cz
        // Nonzero electric W^1_x compensated exactly by Pi_pi^1 so G^1 = div^- E^1 - m_W Pi_pi^1 = 0!
        P[0 * V + s] = 0.15 * sx * cy * cz
      }
    }
  }
  for (let x = 0; x < L; x++) {
    const xm = (x + L - 1) % L
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        const s = idx3(x, y, z)
        const divE1 = P[0 * V + s]! - P[0 * V + idx3(xm, y, z)]!
        // With G^1(x) = div^- E^1(x) - m_W Pi_pi^1(x) = 0 => Pi_pi^1(x) = div^- E^1(x) / m_W
        P[12 * V + s] = divE1 / M_W
      }
    }
  }
  const Q0 = Float64Array.from(Q)
  const P0 = Float64Array.from(P)

  const doStepE = (dt: number) => {
    for (let i = 0; i < 16 * V; i++) Q[i] = Q[i]! + dt * P[i]!
  }

  // Reusable scratch buffers for magnetic curls & Goldstone covariant derivatives
  const Bxy = new Float64Array(4 * V)
  const Byz = new Float64Array(4 * V)
  const Bzx = new Float64Array(4 * V)
  const Dpi = new Float64Array(9 * V) // 3 Goldstones x 3 dirs
  const Dh = new Float64Array(3 * V)

  const doStepB = (dt: number) => {
    // Compute forward differences B_{mu nu}, D_mu pi^a, d_mu h
    for (let x = 0; x < L; x++) {
      const xp = (x + 1) % L
      for (let y = 0; y < L; y++) {
        const yp = (y + 1) % L
        for (let z = 0; z < L; z++) {
          const zp = (z + 1) % L
          const i = idx3(x, y, z)
          const ix = idx3(xp, y, z)
          const iy = idx3(x, yp, z)
          const iz = idx3(x, y, zp)
          for (let g = 0; g < 4; g++) {
            const c0 = (3 * g + 0) * V
            const c1 = (3 * g + 1) * V
            const c2 = (3 * g + 2) * V
            Bxy[g * V + i] = (Q[c1 + ix]! - Q[c1 + i]!) - (Q[c0 + iy]! - Q[c0 + i]!)
            Byz[g * V + i] = (Q[c2 + iy]! - Q[c2 + i]!) - (Q[c1 + iz]! - Q[c1 + i]!)
            Bzx[g * V + i] = (Q[c0 + iz]! - Q[c0 + i]!) - (Q[c2 + ix]! - Q[c2 + i]!)
          }
          // D_mu pi^1 = d_mu pi^1 - m_W W_mu^1
          Dpi[0 * V + i] = Q[12 * V + ix]! - Q[12 * V + i]! - M_W * Q[0 * V + i]!
          Dpi[1 * V + i] = Q[12 * V + iy]! - Q[12 * V + i]! - M_W * Q[1 * V + i]!
          Dpi[2 * V + i] = Q[12 * V + iz]! - Q[12 * V + i]! - M_W * Q[2 * V + i]!
          // D_mu pi^2
          Dpi[3 * V + i] = Q[13 * V + ix]! - Q[13 * V + i]! - M_W * Q[3 * V + i]!
          Dpi[4 * V + i] = Q[13 * V + iy]! - Q[13 * V + i]! - M_W * Q[4 * V + i]!
          Dpi[5 * V + i] = Q[13 * V + iz]! - Q[13 * V + i]! - M_W * Q[5 * V + i]!
          // D_mu pi^3 = d_mu pi^3 - m_W W_mu^3 + m_B B_mu
          Dpi[6 * V + i] = Q[14 * V + ix]! - Q[14 * V + i]! - M_W * Q[6 * V + i]! + M_B * Q[9 * V + i]!
          Dpi[7 * V + i] = Q[14 * V + iy]! - Q[14 * V + i]! - M_W * Q[7 * V + i]! + M_B * Q[10 * V + i]!
          Dpi[8 * V + i] = Q[14 * V + iz]! - Q[14 * V + i]! - M_W * Q[8 * V + i]! + M_B * Q[11 * V + i]!
          // d_mu h
          Dh[0 * V + i] = Q[15 * V + ix]! - Q[15 * V + i]!
          Dh[1 * V + i] = Q[15 * V + iy]! - Q[15 * V + i]!
          Dh[2 * V + i] = Q[15 * V + iz]! - Q[15 * V + i]!
        }
      }
    }

    // Update P = P - dt * (D^dag D Q)
    for (let x = 0; x < L; x++) {
      const xm = (x + L - 1) % L
      for (let y = 0; y < L; y++) {
        const ym = (y + L - 1) % L
        for (let z = 0; z < L; z++) {
          const zm = (z + L - 1) % L
          const i = idx3(x, y, z)
          const ixm = idx3(xm, y, z)
          const iym = idx3(x, ym, z)
          const izm = idx3(x, y, zm)

          // Curl^dag B for all 4 gauge fields
          for (let g = 0; g < 4; g++) {
            const go = g * V
            // dV/dA_x = (Bxy(x,y,z) - Bxy(x,ym,z)) + (Bzx(x,y,zm) - Bzx(x,y,z))
            const fx = (Bxy[go + i]! - Bxy[go + iym]!) + (Bzx[go + izm]! - Bzx[go + i]!)
            const fy = (Byz[go + i]! - Byz[go + izm]!) + (Bxy[go + ixm]! - Bxy[go + i]!)
            const fz = (Bzx[go + i]! - Bzx[go + ixm]!) + (Byz[go + iym]! - Byz[go + i]!)
            P[(3 * g + 0) * V + i] = P[(3 * g + 0) * V + i]! - dt * fx
            P[(3 * g + 1) * V + i] = P[(3 * g + 1) * V + i]! - dt * fy
            P[(3 * g + 2) * V + i] = P[(3 * g + 2) * V + i]! - dt * fz
          }
          // Goldstone mass/covariant force on W^1, W^2, W^3, B
          for (let mu = 0; mu < 3; mu++) {
            P[(0 + mu) * V + i] = P[(0 + mu) * V + i]! - dt * (-M_W * Dpi[(0 + mu) * V + i]!)
            P[(3 + mu) * V + i] = P[(3 + mu) * V + i]! - dt * (-M_W * Dpi[(3 + mu) * V + i]!)
            P[(6 + mu) * V + i] = P[(6 + mu) * V + i]! - dt * (-M_W * Dpi[(6 + mu) * V + i]!)
            P[(9 + mu) * V + i] = P[(9 + mu) * V + i]! - dt * (M_B * Dpi[(6 + mu) * V + i]!)
          }
          // Goldstone divergence force: dV/dpi^a = -div^- (D pi^a)
          for (let a = 0; a < 3; a++) {
            const ao = 3 * a * V
            const fpi =
              -(Dpi[ao + 0 * V + i]! - Dpi[ao + 0 * V + ixm]!) -
              (Dpi[ao + 1 * V + i]! - Dpi[ao + 1 * V + iym]!) -
              (Dpi[ao + 2 * V + i]! - Dpi[ao + 2 * V + izm]!)
            P[(12 + a) * V + i] = P[(12 + a) * V + i]! - dt * fpi
          }
          // Higgs scalar force: -div^- (d h) + m_H^2 h
          const fh =
            -(Dh[0 * V + i]! - Dh[0 * V + ixm]!) -
            (Dh[1 * V + i]! - Dh[1 * V + iym]!) -
            (Dh[2 * V + i]! - Dh[2 * V + izm]!) +
            M_H * M_H * Q[15 * V + i]!
          P[15 * V + i] = P[15 * V + i]! - dt * fh
        }
      }
    }
  }

  const stepPal = (dir: 1 | -1) => {
    const s = dir * TAU
    doStepE(0.5 * s)
    doStepB(s)
    doStepE(s)
    doStepB(s)
    doStepE(0.5 * s)
  }

  const maxGaussRealSpace = (): { readonly exactErr: number; readonly negCtrlNoGoldstone: number } => {
    let exactErr = 0
    let negCtrl = 0
    for (let x = 0; x < L; x++) {
      const xm = (x + L - 1) % L
      for (let y = 0; y < L; y++) {
        const ym = (y + L - 1) % L
        for (let z = 0; z < L; z++) {
          const zm = (z + L - 1) % L
          const i = idx3(x, y, z)
          const ixm = idx3(xm, y, z)
          const iym = idx3(x, ym, z)
          const izm = idx3(x, y, zm)
          for (let a = 0; a < 3; a++) {
            const divE =
              (P[(3 * a + 0) * V + i]! - P[(3 * a + 0) * V + ixm]!) +
              (P[(3 * a + 1) * V + i]! - P[(3 * a + 1) * V + iym]!) +
              (P[(3 * a + 2) * V + i]! - P[(3 * a + 2) * V + izm]!)
            const gVal = divE - M_W * P[(12 + a) * V + i]!
            exactErr = Math.max(exactErr, Math.abs(gVal))
            negCtrl = Math.max(negCtrl, Math.abs(divE))
          }
          const divEB =
            (P[9 * V + i]! - P[9 * V + ixm]!) +
            (P[10 * V + i]! - P[10 * V + iym]!) +
            (P[11 * V + i]! - P[11 * V + izm]!)
          exactErr = Math.max(exactErr, Math.abs(divEB + M_B * P[14 * V + i]!))
        }
      }
    }
    return { exactErr, negCtrlNoGoldstone: negCtrl }
  }

  let maxRealGauss = maxGaussRealSpace().exactErr
  let maxNegCtrlGauss = 0
  const T_EVOL = 16
  for (let t = 0; t < T_EVOL; t++) {
    stepPal(1)
    const st = maxGaussRealSpace()
    maxRealGauss = Math.max(maxRealGauss, st.exactErr)
    maxNegCtrlGauss = Math.max(maxNegCtrlGauss, st.negCtrlNoGoldstone)
  }
  for (let t = 0; t < T_EVOL; t++) stepPal(-1)
  let maxRevErr = 0
  for (let i = 0; i < 16 * V; i++) {
    maxRevErr = Math.max(maxRevErr, Math.abs(Q[i]! - Q0[i]!), Math.abs(P[i]! - P0[i]!))
  }

  recordCheck(
    'B3',
    'Live 8^3 real-space T=16 electroweak QCA: <1e-14 reversibility, Gauss conservation & no-Goldstone negative control',
    maxRealGauss < 1e-14 && maxRevErr < 1e-14 && maxNegCtrlGauss > 0.05,
    `gaussErr=${maxRealGauss.toExponential(1)}, revErr(T=16)=${maxRevErr.toExponential(1)}, negCtrl_noGoldstone=${maxNegCtrlGauss.toFixed(4)}`,
  )
}

runRouteB()

// ============================================================================
// ROUTE C: EXACT QUANTUM 2T_L x U(1)_Y BIDOUBLET PLAQUETTE — ELITZUR & FMS
//          + EXACT GAUGE-INVARIANT YUKAWA OPERATOR
// ============================================================================

console.log('\n========================================================================')
console.log('ROUTE C: QUANTUM 2T_L x U(1)_Y BIDOUBLET PLAQUETTE (ELITZUR, FMS, YUKAWA)')
console.log('========================================================================')

function runRouteC(): void {
  // 5-dim 2T-projected j <= 1/2 SU(2)_L x SU(2)_R bidoublet / quantum link basis:
  //   0 = |0> (singlet), 1..4 = |alpha, beta> (idx = 1 + 2*alpha + beta, alpha, beta in {0, 1})
  //   L^a |alpha, beta> = sum_{a'} (-(T^a)^*)_{a', a} |a', beta>
  //   R^a |alpha, beta> = sum_{b'} (T^a)_{b', b} |alpha, b'>
  //   U_{alpha, beta} = |alpha, beta><0| + eps_{alpha, a'} eps_{beta, b'} |0><a', b'|
  // Exact algebra:
  //   [L^a, U_{al, be}] = -(T^a U)_{al, be},   [R^a, U_{al, be}] = +(U T^a)_{al, be}
  const T_HALF: readonly (readonly (readonly [C, C])[])[] = [
    [
      [C0, [0.5, 0]],
      [[0.5, 0], C0],
    ],
    [
      [C0, [0, -0.5]],
      [[0, 0.5], C0],
    ],
    [
      [[0.5, 0], C0],
      [C0, [-0.5, 0]],
    ],
  ]

  const L5: CMat[] = []
  const R5: CMat[] = []
  for (let a = 0; a < 3; a++) {
    const lm = cmatZero(5)
    const rm = cmatZero(5)
    const Ta = T_HALF[a]!
    for (let al = 0; al < 2; al++) {
      for (let be = 0; be < 2; be++) {
        const col = 1 + 2 * al + be
        for (let al2 = 0; al2 < 2; al2++) {
          const row = 1 + 2 * al2 + be
          const e = Ta[al2]![al]!
          lm.re[row * 5 + col] = -e[0]
          lm.im[row * 5 + col] = e[1] // -conj(e)
        }
        for (let be2 = 0; be2 < 2; be2++) {
          const row = 1 + 2 * al + be2
          const e = Ta[be2]![be]!
          rm.re[row * 5 + col] = e[0]
          rm.im[row * 5 + col] = e[1]
        }
      }
    }
    L5.push(lm)
    R5.push(rm)
  }

  const EPS2 = [
    [0, 1],
    [-1, 0],
  ] as const
  const U5: CMat[][] = [
    [cmatZero(5), cmatZero(5)],
    [cmatZero(5), cmatZero(5)],
  ]
  for (let al = 0; al < 2; al++) {
    for (let be = 0; be < 2; be++) {
      const m = U5[al]![be]!
      m.re[(1 + 2 * al + be) * 5 + 0] = 1
      for (let a2 = 0; a2 < 2; a2++) {
        for (let b2 = 0; b2 < 2; b2++) {
          const e = EPS2[al]![a2]! * EPS2[be]![b2]!
          if (e !== 0) m.re[0 * 5 + (1 + 2 * a2 + b2)] = e
        }
      }
    }
  }
  const U5Dag: CMat[][] = [
    [cmatDag(U5[0]![0]!), cmatDag(U5[0]![1]!)],
    [cmatDag(U5[1]![0]!), cmatDag(U5[1]![1]!)],
  ]

  // Check center-oddness of H_v under z_L = diag(+1, -1, -1, -1, -1)
  const zL5 = cmatEye(5)
  for (let i = 1; i < 5; i++) zL5.re[i * 5 + i] = -1
  let maxCenterOddErr = 0
  for (let al = 0; al < 2; al++) {
    for (let be = 0; be < 2; be++) {
      const conj = cmatMul(cmatMul(zL5, U5[al]![be]!), zL5)
      maxCenterOddErr = Math.max(maxCenterOddErr, cmatFrob(cmatAdd(conj, U5[al]![be]!, 1)))
    }
  }

  // Hypercharge Y_H = R5[2] = diag(0, +1/2, -1/2, +1/2, -1/2) on 5-dim bidoublet
  const YH5 = new Float64Array([0, 0.5, -0.5, 0.5, -0.5])

  // Compact U(1)_Y 3-state Quantum Link (spin-1 S_z in {-1, 0, +1}, E_e^Y = (1/2) S_z in {-1/2, 0, +1/2}):
  //   V_e = S^+ / sqrt(2): |-1> -> |0>, |0> -> |+1>, |+1> -> 0
  //   [E_e^Y, V_e] = +(1/2) V_e, [E_e^Y, V_e^dag] = -(1/2) V_e^dag EXACTLY on all 3 states!
  const EY3 = new Float64Array([-0.5, 0, 0.5])
  const V3 = cmatZero(3)
  V3.re[1 * 3 + 0] = 1
  V3.re[2 * 3 + 1] = 1
  const V3Dag = cmatDag(V3)
  const V3MatDag: readonly CMat[] = [V3Dag, V3] // beta=0 -> V^dag (Y=-1/2), beta=1 -> V (Y=+1/2)

  // --------------------------------------------------------------------------
  // C1: Exact 375 x 375 Single-Bond (H_x, H_y, U_e, V_e) Gauss Commutators
  //     O_kin(e) = sum_{al, ga, be} (H_y^dag)_{be, al} (U_e)_{al, ga} (H_x)_{ga, be} (V_e^{mat,dag})_{be, be}
  // --------------------------------------------------------------------------
  const DIM_BOND = 375 // 5 * 5 * 5 * 3
  const bIdx = (hx: number, hy: number, u: number, v: number): number => ((hx * 5 + hy) * 5 + u) * 3 + v

  // Build sparse edge list of O_kin (375 x 375 real symmetric!)
  const buildBondOp = (pauliBeta: readonly (readonly [C, C])[], includeV: boolean): {
    readonly rows: number[]
    readonly cols: number[]
    readonly valRe: number[]
    readonly valIm: number[]
  } => {
    const mapRe = new Map<number, number>()
    const mapIm = new Map<number, number>()
    for (let b1 = 0; b1 < 2; b1++) {
      for (let b2 = 0; b2 < 2; b2++) {
        const sig = pauliBeta[b1]![b2]!
        if (sig[0] === 0 && sig[1] === 0) continue
        for (let al = 0; al < 2; al++) {
          for (let ga = 0; ga < 2; ga++) {
            const hyOp = U5Dag[al]![b1]!
            const uOp = U5[al]![ga]!
            const hxOp = U5[ga]![b2]!
            const vOp = includeV ? V3MatDag[b2]! : cmatEye(3)
            for (let hxP = 0; hxP < 5; hxP++) {
              for (let hx = 0; hx < 5; hx++) {
                const vx = hxOp.re[hxP * 5 + hx]!
                if (vx === 0) continue
                for (let hyP = 0; hyP < 5; hyP++) {
                  for (let hy = 0; hy < 5; hy++) {
                    const vy = hyOp.re[hyP * 5 + hy]!
                    if (vy === 0) continue
                    for (let uP = 0; uP < 5; uP++) {
                      for (let u = 0; u < 5; u++) {
                        const vu = uOp.re[uP * 5 + u]!
                        if (vu === 0) continue
                        for (let vP = 0; vP < 3; vP++) {
                          for (let v = 0; v < 3; v++) {
                            const vv = vOp.re[vP * 3 + v]!
                            if (vv === 0) continue
                            const coef = vx * vy * vu * vv
                            const r = bIdx(hxP, hyP, uP, vP)
                            const c = bIdx(hx, hy, u, v)
                            const key = r * DIM_BOND + c
                            mapRe.set(key, (mapRe.get(key) ?? 0) + coef * sig[0])
                            mapIm.set(key, (mapIm.get(key) ?? 0) + coef * sig[1])
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const rows: number[] = []
    const cols: number[] = []
    const valRe: number[] = []
    const valIm: number[] = []
    for (const [key, vr] of mapRe.entries()) {
      const vi = mapIm.get(key) ?? 0
      if (Math.hypot(vr, vi) < 1e-14) continue
      rows.push(Math.floor(key / DIM_BOND))
      cols.push(key % DIM_BOND)
      valRe.push(vr)
      valIm.push(vi)
    }
    return { rows, cols, valRe, valIm }
  }

  const I2Mat: readonly (readonly [C, C])[] = [
    [C1, C0],
    [C0, C1],
  ]
  // Hermitian Z^0 vector composite: O_Z = i * Tr(sigma_3 H_y^dag U_e H_x V_e^{mat,dag}) (= -Im Tr(...))
  // Under H^dag = eps H eps^T, beta=0 <-> beta=1 flips sigma_3 -> -sigma_3, so i*sigma_3 makes O_Z^dag = +O_Z!
  const ISZMat: readonly (readonly [C, C])[] = [
    [CI, C0],
    [C0, [0, -1]],
  ]
  const bondOkin = buildBondOp(I2Mat, true)
  const bondOZ = buildBondOp(ISZMat, true)

  // Check Hermiticity & full 375x375 Gauss commutators [O, G_x^a], [O, G_y^a], [O, G_x^Y], [O, G_y^Y]
  const checkBondCommutators = (op: ReturnType<typeof buildBondOp>): {
    readonly hermErr: number
    readonly maxSu2Comm: number
    readonly maxU1Comm: number
  } => {
    // Hermiticity check via lookup
    const lookup = new Map<number, C>()
    for (let k = 0; k < op.rows.length; k++) {
      lookup.set(op.rows[k]! * DIM_BOND + op.cols[k]!, [op.valRe[k]!, op.valIm[k]!])
    }
    let herm2 = 0
    for (let k = 0; k < op.rows.length; k++) {
      const r = op.rows[k]!
      const c = op.cols[k]!
      const t = lookup.get(c * DIM_BOND + r) ?? C0
      herm2 += (op.valRe[k]! - t[0]) ** 2 + (op.valIm[k]! + t[1]) ** 2
    }

    // U(1)_Y commutators (diagonal G_x^Y = Y_{Hx} + E^Y, G_y^Y = Y_{Hy} - E^Y)
    let u1_2 = 0
    for (let k = 0; k < op.rows.length; k++) {
      const r = op.rows[k]!
      const c = op.cols[k]!
      const vr = r % 3
      const ur = Math.floor(r / 3) % 5
      const hyr = Math.floor(r / 15) % 5
      const hxr = Math.floor(r / 75)
      const vc = c % 3
      const hyc = Math.floor(c / 15) % 5
      const hxc = Math.floor(c / 75)
      void ur
      const dGxY = (YH5[hxr]! + EY3[vr]!) - (YH5[hxc]! + EY3[vc]!)
      const dGyY = (YH5[hyr]! - EY3[vr]!) - (YH5[hyc]! - EY3[vc]!)
      const mag2 = op.valRe[k]! ** 2 + op.valIm[k]! ** 2
      u1_2 += (dGxY * dGxY + dGyY * dGyY) * mag2
    }

    // SU(2)_L commutators: apply sparse O * G - G * O on all 375 basis columns!
    let maxSu2 = 0
    const applyG = (end: 0 | 1, a: number, inR: Float64Array, inI: Float64Array, outR: Float64Array, outI: Float64Array) => {
      outR.fill(0)
      outI.fill(0)
      const hOp = L5[a]!
      const uOp = end === 0 ? R5[a]! : L5[a]!
      for (let hx = 0; hx < 5; hx++) {
        for (let hy = 0; hy < 5; hy++) {
          for (let u = 0; u < 5; u++) {
            for (let v = 0; v < 3; v++) {
              const col = bIdx(hx, hy, u, v)
              const xr = inR[col]!
              const xi = inI[col]!
              if (xr === 0 && xi === 0) continue
              // Action on H_x (end=0) or H_y (end=1)
              const hCur = end === 0 ? hx : hy
              for (let hp = 0; hp < 5; hp++) {
                const mr = hOp.re[hp * 5 + hCur]!
                const mi = hOp.im[hp * 5 + hCur]!
                if (mr === 0 && mi === 0) continue
                const row = end === 0 ? bIdx(hp, hy, u, v) : bIdx(hx, hp, u, v)
                outR[row] = outR[row]! + (mr * xr - mi * xi)
                outI[row] = outI[row]! + (mr * xi + mi * xr)
              }
              // Action on U_e
              for (let up = 0; up < 5; up++) {
                const mr = uOp.re[up * 5 + u]!
                const mi = uOp.im[up * 5 + u]!
                if (mr === 0 && mi === 0) continue
                const row = bIdx(hx, hy, up, v)
                outR[row] = outR[row]! + (mr * xr - mi * xi)
                outI[row] = outI[row]! + (mr * xi + mi * xr)
              }
            }
          }
        }
      }
    }
    const applyO = (inR: Float64Array, inI: Float64Array, outR: Float64Array, outI: Float64Array) => {
      outR.fill(0)
      outI.fill(0)
      for (let k = 0; k < op.rows.length; k++) {
        const r = op.rows[k]!
        const c = op.cols[k]!
        const xr = inR[c]!
        const xi = inI[c]!
        if (xr === 0 && xi === 0) continue
        const vr = op.valRe[k]!
        const vi = op.valIm[k]!
        outR[r] = outR[r]! + (vr * xr - vi * xi)
        outI[r] = outI[r]! + (vr * xi + vi * xr)
      }
    }

    const eColR = new Float64Array(DIM_BOND)
    const eColI = new Float64Array(DIM_BOND)
    const t1R = new Float64Array(DIM_BOND)
    const t1I = new Float64Array(DIM_BOND)
    const t2R = new Float64Array(DIM_BOND)
    const t2I = new Float64Array(DIM_BOND)
    const t3R = new Float64Array(DIM_BOND)
    const t3I = new Float64Array(DIM_BOND)

    for (const end of [0, 1] as const) {
      for (let a = 0; a < 3; a++) {
        let f2 = 0
        for (let col = 0; col < DIM_BOND; col++) {
          eColR[col] = 1
          applyG(end, a, eColR, eColI, t1R, t1I)
          applyO(t1R, t1I, t2R, t2I) // O G e_col
          applyO(eColR, eColI, t1R, t1I)
          applyG(end, a, t1R, t1I, t3R, t3I) // G O e_col
          for (let r = 0; r < DIM_BOND; r++) {
            f2 += (t2R[r]! - t3R[r]!) ** 2 + (t2I[r]! - t3I[r]!) ** 2
          }
          eColR[col] = 0
        }
        maxSu2 = Math.max(maxSu2, Math.sqrt(f2))
      }
    }
    return { hermErr: Math.sqrt(herm2), maxSu2Comm: maxSu2, maxU1Comm: Math.sqrt(u1_2) }
  }

  const commOkin = checkBondCommutators(bondOkin)
  const commOZ = checkBondCommutators(bondOZ)

  recordCheck(
    'C1',
    'Exact 375x375 bond Gauss commutators [O_H, G_v]=0, [O_Z, G_v]=0 & center-odd bidoublet H_v',
    maxCenterOddErr < 1e-14 &&
      commOkin.hermErr < 1e-14 &&
      commOkin.maxSu2Comm < 1e-13 &&
      commOkin.maxU1Comm < 1e-14 &&
      commOZ.hermErr < 1e-14 &&
      commOZ.maxSu2Comm < 1e-13 &&
      commOZ.maxU1Comm < 1e-14,
    `centerOdd=${maxCenterOddErr.toExponential(1)}, O_H:[SU2]=${commOkin.maxSu2Comm.toExponential(1)},[U1]=${commOkin.maxU1Comm.toExponential(1)}; O_Z:[SU2]=${commOZ.maxSu2Comm.toExponential(1)},[U1]=${commOZ.maxU1Comm.toExponential(1)}`,
  )

  // --------------------------------------------------------------------------
  // C2: Exact 2-Link 2T_L x U(1)_Y Bidoublet Plaquette (5,625 full states)
  //     Vertices 0, 1; edges e_0: 0 -> 1, e_1: 1 -> 0.
  //     State index: pIdx(h0, h1, u0, u1, v0, v1) in 0..5624.
  //     Exhaustively project onto ker(G^2) => exact 14-dim physical subspace!
  // --------------------------------------------------------------------------
  const DIM_PLAQ = 5625 // 5 * 5 * 5 * 5 * 3 * 3
  const pIdx = (h0: number, h1: number, u0: number, u1: number, v0: number, v1: number): number =>
    ((((h0 * 5 + h1) * 5 + u0) * 5 + u1) * 3 + v0) * 3 + v1

  // Exhaustive block-by-block kernel extraction of G^2 across ALL 5,625 states!
  // Because G_0^Y = Y_{H0} + E_0 - E_1 and G_1^Y = Y_{H1} - E_0 + E_1 are diagonal, AND
  // (h0_j, h1_j, u0_j, u1_j, beta_h0, beta_h1, v0, v1) are conserved by SU(2)_L Gauss generators
  // G_0^a = L_{H0}^a + R_{u0}^a + L_{u1}^a and G_1^a = L_{H1}^a + L_{u0}^a + R_{u1}^a!
  // Let's group ALL states with G_0^Y = qY0, G_1^Y = qY1 by (j_h0, j_h1, j_u0, j_u1, bh0, bh1, v0, v1)!
  // Each block has size <= 16 (2^4) — exact Jacobi gives the COMPLETE kernel in < 5 ms!
  function extractExactGaugeSubspace(qY0: number, qY1: number): {
    readonly basis: Float64Array[] // each length 5625 (real orthonormal in this basis!)
    readonly basisIm: Float64Array[]
    readonly maxGaussNorm: number
  } {
    const blocks = new Map<string, number[]>()
    for (let h0 = 0; h0 < 5; h0++) {
      for (let h1 = 0; h1 < 5; h1++) {
        for (let v0 = 0; v0 < 3; v0++) {
          for (let v1 = 0; v1 < 3; v1++) {
            const g0y = YH5[h0]! + EY3[v0]! - EY3[v1]!
            const g1y = YH5[h1]! - EY3[v0]! + EY3[v1]!
            if (Math.abs(g0y - qY0) > 1e-12 || Math.abs(g1y - qY1) > 1e-12) continue
            const jh0 = h0 === 0 ? 0 : 1
            const bh0 = h0 === 0 ? -1 : (h0 - 1) & 1
            const jh1 = h1 === 0 ? 0 : 1
            const bh1 = h1 === 0 ? -1 : (h1 - 1) & 1
            for (let u0 = 0; u0 < 5; u0++) {
              const ju0 = u0 === 0 ? 0 : 1
              for (let u1 = 0; u1 < 5; u1++) {
                const ju1 = u1 === 0 ? 0 : 1
                const key = `${jh0},${bh0},${jh1},${bh1},${ju0},${ju1},${v0},${v1}`
                let arr = blocks.get(key)
                if (!arr) {
                  arr = []
                  blocks.set(key, arr)
                }
                arr.push(pIdx(h0, h1, u0, u1, v0, v1))
              }
            }
          }
        }
      }
    }

    const decode = (idx: number): [number, number, number, number, number, number] => {
      const v1 = idx % 3
      const t1 = Math.floor(idx / 3)
      const v0 = t1 % 3
      const t2 = Math.floor(t1 / 3)
      const u1 = t2 % 5
      const t3 = Math.floor(t2 / 5)
      const u0 = t3 % 5
      const t4 = Math.floor(t3 / 5)
      const h1 = t4 % 5
      const h0 = Math.floor(t4 / 5)
      return [h0, h1, u0, u1, v0, v1]
    }

    const basis: Float64Array[] = []
    const basisIm: Float64Array[] = []
    let maxGaussNorm = 0

    for (const states of blocks.values()) {
      const m = states.length
      const posOf = new Map<number, number>()
      for (let i = 0; i < m; i++) posOf.set(states[i]!, i)

      // Build sum_{v=0,1} sum_{a=0,1,2} (G_v^a)^2 inside this block
      const G2 = cmatZero(m)
      for (const vtx of [0, 1] as const) {
        for (let a = 0; a < 3; a++) {
          const Ga = cmatZero(m)
          for (let col = 0; col < m; col++) {
            const [h0, h1, u0, u1, v0, v1] = decode(states[col]!)
            if (vtx === 0) {
              // L_{H0}^a + R_{u0}^a + L_{u1}^a
              for (let hp = 0; hp < 5; hp++) {
                const mr = L5[a]!.re[hp * 5 + h0]!
                const mi = L5[a]!.im[hp * 5 + h0]!
                if (mr === 0 && mi === 0) continue
                const r = posOf.get(pIdx(hp, h1, u0, u1, v0, v1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
              for (let up = 0; up < 5; up++) {
                const mr = R5[a]!.re[up * 5 + u0]!
                const mi = R5[a]!.im[up * 5 + u0]!
                if (mr === 0 && mi === 0) continue
                const r = posOf.get(pIdx(h0, h1, up, u1, v0, v1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
              for (let up = 0; up < 5; up++) {
                const mr = L5[a]!.re[up * 5 + u1]!
                const mi = L5[a]!.im[up * 5 + u1]!
                if (mr === 0 && mi === 0) continue
                const r = posOf.get(pIdx(h0, h1, u0, up, v0, v1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
            } else {
              // L_{H1}^a + L_{u0}^a + R_{u1}^a
              for (let hp = 0; hp < 5; hp++) {
                const mr = L5[a]!.re[hp * 5 + h1]!
                const mi = L5[a]!.im[hp * 5 + h1]!
                if (mr === 0 && mi === 0) continue
                const r = posOf.get(pIdx(h0, hp, u0, u1, v0, v1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
              for (let up = 0; up < 5; up++) {
                const mr = L5[a]!.re[up * 5 + u0]!
                const mi = L5[a]!.im[up * 5 + u0]!
                if (mr === 0 && mi === 0) continue
                const r = posOf.get(pIdx(h0, h1, up, u1, v0, v1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
              for (let up = 0; up < 5; up++) {
                const mr = R5[a]!.re[up * 5 + u1]!
                const mi = R5[a]!.im[up * 5 + u1]!
                if (mr === 0 && mi === 0) continue
                const r = posOf.get(pIdx(h0, h1, u0, up, v0, v1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
            }
          }
          const Ga2 = cmatMul(Ga, Ga)
          for (let i = 0; i < m * m; i++) {
            G2.re[i] = G2.re[i]! + Ga2.re[i]!
            G2.im[i] = G2.im[i]! + Ga2.im[i]!
          }
        }
      }

      const eig = hermitianJacobi(m, G2.re, G2.im, true)
      for (let k = 0; k < m; k++) {
        if (eig.vals[k]! < 1e-11) {
          maxGaussNorm = Math.max(maxGaussNorm, Math.sqrt(Math.max(0, eig.vals[k]!)))
          const vr = new Float64Array(DIM_PLAQ)
          const vi = new Float64Array(DIM_PLAQ)
          for (let r = 0; r < m; r++) {
            vr[states[r]!] = eig.vecRe[k * m + r]!
            vi[states[r]!] = eig.vecIm[k * m + r]!
          }
          basis.push(vr)
          basisIm.push(vi)
        }
      }
    }
    return { basis, basisIm, maxGaussNorm }
  }

  const physSub = extractExactGaugeSubspace(0, 0)
  const NPHYS = physSub.basis.length
  assert(NPHYS === 14, `Expected exact 14-dim gauge-invariant subspace inside 5,625 states, got ${NPHYS}`)

  // Also extract exact Q_em = +1 (G_0^Y = +1/2, G_1^Y = +1/2) and Q_em = -1 (-1/2, -1/2) SU(2)_L-invariant W^+- sectors!
  const wpSub = extractExactGaugeSubspace(0.5, 0.5)
  const wmSub = extractExactGaugeSubspace(-0.5, -0.5)
  assert(wpSub.basis.length > 0 && wpSub.basis.length === wmSub.basis.length, 'W^+- sectors must match')

  // Helper: apply plaquette operators directly on a 5,625-state vector (fast sparse action!)
  function applyDiagPlaq(
    inR: Float64Array,
    inI: Float64Array,
    outR: Float64Array,
    outI: Float64Array,
    gL2: number,
    gY2: number,
    muH2: number,
  ): void {
    for (let h0 = 0; h0 < 5; h0++) {
      const nh0 = h0 === 0 ? 0 : 1
      for (let h1 = 0; h1 < 5; h1++) {
        const nh1 = h1 === 0 ? 0 : 1
        for (let u0 = 0; u0 < 5; u0++) {
          const c0 = u0 === 0 ? 0 : 0.75
          for (let u1 = 0; u1 < 5; u1++) {
            const c1 = u1 === 0 ? 0 : 0.75
            for (let v0 = 0; v0 < 3; v0++) {
              const e0 = EY3[v0]! * EY3[v0]!
              for (let v1 = 0; v1 < 3; v1++) {
                const e1 = EY3[v1]! * EY3[v1]!
                const idx = pIdx(h0, h1, u0, u1, v0, v1)
                const w = gL2 * (c0 + c1) + gY2 * (e0 + e1) + muH2 * (nh0 + nh1)
                outR[idx] = outR[idx]! + w * inR[idx]!
                outI[idx] = outI[idx]! + w * inI[idx]!
              }
            }
          }
        }
      }
    }
  }

  // Apply magnetic SU(2)_L plaquette: W_L = Tr(U_1 U_0) = sum_{a,b} U_1[a][b] U_0[b][a]
  function applyWL(inR: Float64Array, inI: Float64Array, outR: Float64Array, outI: Float64Array, coef: number): void {
    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        const op1 = U5[a]![b]!
        const op0 = U5[b]![a]!
        for (let u0 = 0; u0 < 5; u0++) {
          for (let u0p = 0; u0p < 5; u0p++) {
            const m0 = op0.re[u0p * 5 + u0]!
            if (m0 === 0) continue
            for (let u1 = 0; u1 < 5; u1++) {
              for (let u1p = 0; u1p < 5; u1p++) {
                const m1 = op1.re[u1p * 5 + u1]!
                if (m1 === 0) continue
                const w = coef * m0 * m1
                for (let h0 = 0; h0 < 5; h0++) {
                  for (let h1 = 0; h1 < 5; h1++) {
                    for (let v0 = 0; v0 < 3; v0++) {
                      for (let v1 = 0; v1 < 3; v1++) {
                        const c = pIdx(h0, h1, u0, u1, v0, v1)
                        const r = pIdx(h0, h1, u0p, u1p, v0, v1)
                        outR[r] = outR[r]! + w * inR[c]!
                        outI[r] = outI[r]! + w * inI[c]!
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Apply magnetic U(1)_Y plaquette: W_B = V_1 V_0 + V_0^dag V_1^dag
  function applyWB(inR: Float64Array, inI: Float64Array, outR: Float64Array, outI: Float64Array, coef: number): void {
    for (let h0 = 0; h0 < 5; h0++) {
      for (let h1 = 0; h1 < 5; h1++) {
        for (let u0 = 0; u0 < 5; u0++) {
          for (let u1 = 0; u1 < 5; u1++) {
            for (let v0 = 0; v0 < 3; v0++) {
              for (let v1 = 0; v1 < 3; v1++) {
                const c = pIdx(h0, h1, u0, u1, v0, v1)
                const xr = inR[c]!
                const xi = inI[c]!
                if (xr === 0 && xi === 0) continue
                if (v0 < 2 && v1 < 2) {
                  const r = pIdx(h0, h1, u0, u1, v0 + 1, v1 + 1)
                  outR[r] = outR[r]! + coef * xr
                  outI[r] = outI[r]! + coef * xi
                }
                if (v0 > 0 && v1 > 0) {
                  const r = pIdx(h0, h1, u0, u1, v0 - 1, v1 - 1)
                  outR[r] = outR[r]! + coef * xr
                  outI[r] = outI[r]! + coef * xi
                }
              }
            }
          }
        }
      }
    }
  }

  // Apply edge-e (0: 0->1, 1: 1->0) Higgs-gauge composite Tr(pauliBeta * H_y^dag U_e H_x V_e^{mat,dag?})
  function applyEdgeComposite(
    edge: 0 | 1,
    pauliBeta: readonly (readonly [C, C])[],
    includeV: boolean,
    inR: Float64Array,
    inI: Float64Array,
    outR: Float64Array,
    outI: Float64Array,
    coef: number,
  ): void {
    for (let b1 = 0; b1 < 2; b1++) {
      for (let b2 = 0; b2 < 2; b2++) {
        const sig = pauliBeta[b1]![b2]!
        if (sig[0] === 0 && sig[1] === 0) continue
        const sr = coef * sig[0]
        const si = coef * sig[1]
        for (let al = 0; al < 2; al++) {
          for (let ga = 0; ga < 2; ga++) {
            const hyOp = U5Dag[al]![b1]!
            const uOp = U5[al]![ga]!
            const hxOp = U5[ga]![b2]!
            const vOp = includeV ? V3MatDag[b2]! : cmatEye(3)
            for (let hx = 0; hx < 5; hx++) {
              for (let hxP = 0; hxP < 5; hxP++) {
                const vx = hxOp.re[hxP * 5 + hx]!
                if (vx === 0) continue
                for (let hy = 0; hy < 5; hy++) {
                  for (let hyP = 0; hyP < 5; hyP++) {
                    const vy = hyOp.re[hyP * 5 + hy]!
                    if (vy === 0) continue
                    for (let ue = 0; ue < 5; ue++) {
                      for (let ueP = 0; ueP < 5; ueP++) {
                        const vu = uOp.re[ueP * 5 + ue]!
                        if (vu === 0) continue
                        for (let ve = 0; ve < 3; ve++) {
                          for (let veP = 0; veP < 3; veP++) {
                            const vv = vOp.re[veP * 3 + ve]!
                            if (vv === 0) continue
                            const w = vx * vy * vu * vv
                            const wr = w * sr
                            const wi = w * si
                            for (let uOth = 0; uOth < 5; uOth++) {
                              for (let vOth = 0; vOth < 3; vOth++) {
                                const c =
                                  edge === 0
                                    ? pIdx(hx, hy, ue, uOth, ve, vOth)
                                    : pIdx(hy, hx, uOth, ue, vOth, ve)
                                const r =
                                  edge === 0
                                    ? pIdx(hxP, hyP, ueP, uOth, veP, vOth)
                                    : pIdx(hyP, hxP, uOth, ueP, vOth, veP)
                                const xr = inR[c]!
                                const xi = inI[c]!
                                if (xr === 0 && xi === 0) continue
                                outR[r] = outR[r]! + (wr * xr - wi * xi)
                                outI[r] = outI[r]! + (wr * xi + wi * xr)
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Project any plaquette operator A onto a gauge subspace basis {phi_i}
  function projectOp(
    sub: { readonly basis: Float64Array[]; readonly basisIm: Float64Array[] },
    applyFn: (inR: Float64Array, inI: Float64Array, outR: Float64Array, outI: Float64Array) => void,
  ): CMat {
    const m = sub.basis.length
    const M = cmatZero(m)
    const tmpR = new Float64Array(DIM_PLAQ)
    const tmpI = new Float64Array(DIM_PLAQ)
    for (let j = 0; j < m; j++) {
      tmpR.fill(0)
      tmpI.fill(0)
      applyFn(sub.basis[j]!, sub.basisIm[j]!, tmpR, tmpI)
      for (let i = 0; i < m; i++) {
        const br = sub.basis[i]!
        const bi = sub.basisIm[i]!
        let sr = 0
        let si = 0
        for (let k = 0; k < DIM_PLAQ; k++) {
          sr += br[k]! * tmpR[k]! + bi[k]! * tmpI[k]!
          si += br[k]! * tmpI[k]! - bi[k]! * tmpR[k]!
        }
        M.re[i * m + j] = sr
        M.im[i * m + j] = si
      }
    }
    return M
  }

  // Precompute the 14x14 projected building-block operators once (super fast!)
  const pDiagGL = projectOp(physSub, (ir, ii, or, oi) => applyDiagPlaq(ir, ii, or, oi, 1, 0, 0))
  const pDiagGY = projectOp(physSub, (ir, ii, or, oi) => applyDiagPlaq(ir, ii, or, oi, 0, 1, 0))
  const pDiagMu = projectOp(physSub, (ir, ii, or, oi) => applyDiagPlaq(ir, ii, or, oi, 0, 0, 1))
  const pWL = projectOp(physSub, (ir, ii, or, oi) => applyWL(ir, ii, or, oi, 1))
  const pWB = projectOp(physSub, (ir, ii, or, oi) => applyWB(ir, ii, or, oi, 1))
  const pOH0 = projectOp(physSub, (ir, ii, or, oi) => applyEdgeComposite(0, I2Mat, true, ir, ii, or, oi, 1))
  const pOH1 = projectOp(physSub, (ir, ii, or, oi) => applyEdgeComposite(1, I2Mat, true, ir, ii, or, oi, 1))
  const pOZ0 = projectOp(physSub, (ir, ii, or, oi) => applyEdgeComposite(0, ISZMat, true, ir, ii, or, oi, 1))

  // Also project H_EW onto the Q_em = +1 and Q_em = -1 sectors for W^+ and W^- masses!
  const wpDiagGL = projectOp(wpSub, (ir, ii, or, oi) => applyDiagPlaq(ir, ii, or, oi, 1, 0, 0))
  const wpDiagGY = projectOp(wpSub, (ir, ii, or, oi) => applyDiagPlaq(ir, ii, or, oi, 0, 1, 0))
  const wpDiagMu = projectOp(wpSub, (ir, ii, or, oi) => applyDiagPlaq(ir, ii, or, oi, 0, 0, 1))
  const wpWL = projectOp(wpSub, (ir, ii, or, oi) => applyWL(ir, ii, or, oi, 1))
  const wpWB = projectOp(wpSub, (ir, ii, or, oi) => applyWB(ir, ii, or, oi, 1))
  const wpOH0 = projectOp(wpSub, (ir, ii, or, oi) => applyEdgeComposite(0, I2Mat, true, ir, ii, or, oi, 1))
  const wpOH1 = projectOp(wpSub, (ir, ii, or, oi) => applyEdgeComposite(1, I2Mat, true, ir, ii, or, oi, 1))

  const wmDiagGL = projectOp(wmSub, (ir, ii, or, oi) => applyDiagPlaq(ir, ii, or, oi, 1, 0, 0))
  const wmDiagGY = projectOp(wmSub, (ir, ii, or, oi) => applyDiagPlaq(ir, ii, or, oi, 0, 1, 0))
  const wmDiagMu = projectOp(wmSub, (ir, ii, or, oi) => applyDiagPlaq(ir, ii, or, oi, 0, 0, 1))
  const wmWL = projectOp(wmSub, (ir, ii, or, oi) => applyWL(ir, ii, or, oi, 1))
  const wmWB = projectOp(wmSub, (ir, ii, or, oi) => applyWB(ir, ii, or, oi, 1))
  const wmOH0 = projectOp(wmSub, (ir, ii, or, oi) => applyEdgeComposite(0, I2Mat, true, ir, ii, or, oi, 1))
  const wmOH1 = projectOp(wmSub, (ir, ii, or, oi) => applyEdgeComposite(1, I2Mat, true, ir, ii, or, oi, 1))

  const SPlusMat: readonly (readonly [C, C])[] = [
    [C0, C1],
    [C0, C0],
  ]
  const SMinusMat: readonly (readonly [C, C])[] = [
    [C0, C0],
    [C1, C0],
  ]

  // Solve H_EW(kappa_H) across kappa_H in {0, 0.5, 1.0, 2.0, 4.0}
  const gL2 = 1.0
  const gY2 = 0.35
  const muH2 = 0.6
  const kappas = [0, 0.5, 1.0, 2.0, 4.0]

  let maxElitzurErr = 0
  const ohCondensates: number[] = []
  let ozNormAt2 = 0
  let ozGapAt2 = 0
  let ohGapAt2 = 0
  let wpNormAt2 = 0
  let wmNormAt2 = 0
  let wpGapAt2 = 0
  let wmGapAt2 = 0
  let wbExpectAt2 = 0
  let wwNeutralNormAt2 = 0

  const liftToFull = (
    sub: { readonly basis: Float64Array[]; readonly basisIm: Float64Array[] },
    cRe: Float64Array,
    cIm: Float64Array,
  ): { readonly re: Float64Array; readonly im: Float64Array } => {
    const outR = new Float64Array(DIM_PLAQ)
    const outI = new Float64Array(DIM_PLAQ)
    for (let k = 0; k < sub.basis.length; k++) {
      const cr = cRe[k]!
      const ci = cIm[k]!
      const br = sub.basis[k]!
      const bi = sub.basisIm[k]!
      for (let i = 0; i < DIM_PLAQ; i++) {
        outR[i] = outR[i]! + (cr * br[i]! - ci * bi[i]!)
        outI[i] = outI[i]! + (cr * bi[i]! + ci * br[i]!)
      }
    }
    return { re: outR, im: outI }
  }

  for (const kap of kappas) {
    const H14 = cmatZero(NPHYS)
    for (let i = 0; i < NPHYS * NPHYS; i++) {
      H14.re[i] =
        gL2 * pDiagGL.re[i]! +
        gY2 * pDiagGY.re[i]! +
        muH2 * pDiagMu.re[i]! -
        (0.5 / gL2) * pWL.re[i]! -
        0.5 * pWB.re[i]! -
        kap * (pOH0.re[i]! + pOH1.re[i]!)
      H14.im[i] =
        gL2 * pDiagGL.im[i]! +
        gY2 * pDiagGY.im[i]! +
        muH2 * pDiagMu.im[i]! -
        (0.5 / gL2) * pWL.im[i]! -
        0.5 * pWB.im[i]! -
        kap * (pOH0.im[i]! + pOH1.im[i]!)
    }
    const eig = hermitianJacobi(NPHYS, H14.re, H14.im, true)
    const gsRe = eig.vecRe.subarray(0, NPHYS)
    const gsIm = eig.vecIm.subarray(0, NPHYS)
    const fullGS = liftToFull(physSub, gsRe, gsIm)

    // 1) Exact Elitzur's theorem: <Omega| (H_v)_{al, be} |Omega> = 0 for ALL v in {0,1}, al, be in {0,1}!
    for (const vtx of [0, 1] as const) {
      for (let al = 0; al < 2; al++) {
        for (let be = 0; be < 2; be++) {
          const op = U5[al]![be]!
          let er = 0
          let ei = 0
          for (let h0 = 0; h0 < 5; h0++) {
            for (let h1 = 0; h1 < 5; h1++) {
              const curH = vtx === 0 ? h0 : h1
              for (let hp = 0; hp < 5; hp++) {
                const mv = op.re[hp * 5 + curH]!
                if (mv === 0) continue
                for (let u0 = 0; u0 < 5; u0++) {
                  for (let u1 = 0; u1 < 5; u1++) {
                    for (let v0 = 0; v0 < 3; v0++) {
                      for (let v1 = 0; v1 < 3; v1++) {
                        const c = pIdx(h0, h1, u0, u1, v0, v1)
                        const r = vtx === 0 ? pIdx(hp, h1, u0, u1, v0, v1) : pIdx(h0, hp, u0, u1, v0, v1)
                        er += mv * (fullGS.re[r]! * fullGS.re[c]! + fullGS.im[r]! * fullGS.im[c]!)
                        ei += mv * (fullGS.re[r]! * fullGS.im[c]! - fullGS.im[r]! * fullGS.re[c]!)
                      }
                    }
                  }
                }
              }
            }
          }
          maxElitzurErr = Math.max(maxElitzurErr, Math.hypot(er, ei))
        }
      }
    }

    // 2) Gauge-invariant FMS Higgs condensate <Omega| O_H(e_0) |Omega>
    let ohExp = 0
    for (let i = 0; i < NPHYS; i++) {
      for (let j = 0; j < NPHYS; j++) {
        const mr = pOH0.re[i * NPHYS + j]!
        const mi = pOH0.im[i * NPHYS + j]!
        const gIr = gsRe[i]!
        const gIi = -gsIm[i]!
        const gJr = gsRe[j]!
        const gJi = gsIm[j]!
        // conj(g_i) * M_ij * g_j
        const mJr = mr * gJr - mi * gJi
        const mJi = mr * gJi + mi * gJr
        ohExp += gIr * mJr - gIi * mJi
      }
    }
    ohCondensates.push(ohExp)

    if (Math.abs(kap - 2.0) < 1e-12) {
      // FMS Higgs 0^{++} excitation gap (connected overlap with excited states)
      let ohExcGap = Infinity
      for (let k = 1; k < NPHYS; k++) {
        let ovR = 0
        let ovI = 0
        for (let i = 0; i < NPHYS; i++) {
          for (let j = 0; j < NPHYS; j++) {
            const mr = pOH0.re[i * NPHYS + j]!
            const mi = pOH0.im[i * NPHYS + j]!
            const er = eig.vecRe[k * NPHYS + i]!
            const ei = -eig.vecIm[k * NPHYS + i]!
            const gr = gsRe[j]!
            const gi = gsIm[j]!
            const tR = mr * gr - mi * gi
            const tI = mr * gi + mi * gr
            ovR += er * tR - ei * tI
            ovI += er * tI + ei * tR
          }
        }
        if (Math.hypot(ovR, ovI) > 1e-4) {
          ohExcGap = eig.vals[k]! - eig.vals[0]!
          break
        }
      }
      ohGapAt2 = ohExcGap

      // FMS Z^0 singlet O_Z |Omega>: compute ||O_Z |Omega>||^2 and variational / spectral gap!
      let ozN2 = 0
      let ozExcGap = Infinity
      for (let k = 0; k < NPHYS; k++) {
        let ovR = 0
        let ovI = 0
        for (let i = 0; i < NPHYS; i++) {
          for (let j = 0; j < NPHYS; j++) {
            const mr = pOZ0.re[i * NPHYS + j]!
            const mi = pOZ0.im[i * NPHYS + j]!
            const er = eig.vecRe[k * NPHYS + i]!
            const ei = -eig.vecIm[k * NPHYS + i]!
            const gr = gsRe[j]!
            const gi = gsIm[j]!
            const tR = mr * gr - mi * gi
            const tI = mr * gi + mi * gr
            ovR += er * tR - ei * tI
            ovI += er * tI + ei * tR
          }
        }
        const p2 = ovR * ovR + ovI * ovI
        ozN2 += p2
        if (k > 0 && p2 > 1e-8 && ozExcGap === Infinity) ozExcGap = eig.vals[k]! - eig.vals[0]!
      }
      ozNormAt2 = ozN2
      ozGapAt2 = ozExcGap

      // Photon U(1)_Y loop expectation <Omega| W_B |Omega>
      let wbExp = 0
      for (let i = 0; i < NPHYS; i++) {
        for (let j = 0; j < NPHYS; j++) {
          const mr = pWB.re[i * NPHYS + j]!
          wbExp += (gsRe[i]! * gsRe[j]! + gsIm[i]! * gsIm[j]!) * mr
        }
      }
      wbExpectAt2 = wbExp

      // FMS W^+ and W^- composites: apply O_{W^+} = Tr(sigma^- H_1^dag U_0 H_0) and O_{W^-} = Tr(sigma^+ H_1^dag U_0 H_0)
      // to |Omega>, verify they land inside the SU(2)_L-invariant Q_em = +-1 sectors wpSub / wmSub, and compute gaps!
      const wpR = new Float64Array(DIM_PLAQ)
      const wpI = new Float64Array(DIM_PLAQ)
      applyEdgeComposite(0, SMinusMat, false, fullGS.re, fullGS.im, wpR, wpI, 1)
      const wmR = new Float64Array(DIM_PLAQ)
      const wmI = new Float64Array(DIM_PLAQ)
      applyEdgeComposite(0, SPlusMat, false, fullGS.re, fullGS.im, wmR, wmI, 1)

      let wpFullN2 = 0
      let wmFullN2 = 0
      for (let i = 0; i < DIM_PLAQ; i++) {
        wpFullN2 += wpR[i]! ** 2 + wpI[i]! ** 2
        wmFullN2 += wmR[i]! ** 2 + wmI[i]! ** 2
      }
      wpNormAt2 = wpFullN2
      wmNormAt2 = wmFullN2

      // Verify 100% of O_{W^+-}|Omega> weight lies in the SU(2)_L-invariant Q_em = +-1 subspaces!
      const projNorm = (sub: typeof wpSub, rV: Float64Array, iV: Float64Array): number => {
        let s = 0
        for (let k = 0; k < sub.basis.length; k++) {
          let dr = 0
          let di = 0
          const br = sub.basis[k]!
          const bi = sub.basisIm[k]!
          for (let i = 0; i < DIM_PLAQ; i++) {
            dr += br[i]! * rV[i]! + bi[i]! * iV[i]!
            di += br[i]! * iV[i]! - bi[i]! * rV[i]!
          }
          s += dr * dr + di * di
        }
        return s
      }
      const wpLeak = Math.abs(wpFullN2 - projNorm(wpSub, wpR, wpI))
      const wmLeak = Math.abs(wmFullN2 - projNorm(wmSub, wmR, wmI))
      assert(wpLeak < 1e-13 && wmLeak < 1e-13, `W^+- must stay strictly inside SU(2)_L singlet Q_em=+-1: leak=${wpLeak},${wmLeak}`)

      // Diagonalize H_EW in Q_em = +-1 sectors to get exact W^+ and W^- masses
      const mkSectorE0 = (
        m: number,
        dGL: CMat,
        dGY: CMat,
        dMu: CMat,
        wL: CMat,
        wB: CMat,
        o0: CMat,
        o1: CMat,
      ): number => {
        const Hm = cmatZero(m)
        for (let i = 0; i < m * m; i++) {
          Hm.re[i] =
            gL2 * dGL.re[i]! +
            gY2 * dGY.re[i]! +
            muH2 * dMu.re[i]! -
            (0.5 / gL2) * wL.re[i]! -
            0.5 * wB.re[i]! -
            kap * (o0.re[i]! + o1.re[i]!)
          Hm.im[i] =
            gL2 * dGL.im[i]! +
            gY2 * dGY.im[i]! +
            muH2 * dMu.im[i]! -
            (0.5 / gL2) * wL.im[i]! -
            0.5 * wB.im[i]! -
            kap * (o0.im[i]! + o1.im[i]!)
        }
        return hermitianJacobi(m, Hm.re, Hm.im, false).vals[0]!
      }
      wpGapAt2 = mkSectorE0(wpSub.basis.length, wpDiagGL, wpDiagGY, wpDiagMu, wpWL, wpWB, wpOH0, wpOH1) - eig.vals[0]!
      wmGapAt2 = mkSectorE0(wmSub.basis.length, wmDiagGL, wmDiagGY, wmDiagMu, wmWL, wmWB, wmOH0, wmOH1) - eig.vals[0]!

      // Strictly neutral SU(2)_L x U(1)_Y singlet W^+ W^- composite: O_{W^-}(e_1) O_{W^+}(e_0) |Omega>
      const wwR = new Float64Array(DIM_PLAQ)
      const wwI = new Float64Array(DIM_PLAQ)
      applyEdgeComposite(1, SPlusMat, false, wpR, wpI, wwR, wwI, 1)
      let wwFullN2 = 0
      for (let i = 0; i < DIM_PLAQ; i++) wwFullN2 += wwR[i]! ** 2 + wwI[i]! ** 2
      const wwLeak = Math.abs(wwFullN2 - projNorm(physSub, wwR, wwI))
      assert(wwLeak < 1e-13, `Neutral W^+W^- singlet must remain in 14-dim physSub: leak=${wwLeak}`)
      wwNeutralNormAt2 = wwFullN2
    }
  }

  // Verify monotonic increase of <O_H> with kappa_H
  let ohMono = ohCondensates[0]! < 1e-12 && ohCondensates[1]! > 0
  for (let i = 2; i < ohCondensates.length; i++) {
    if (!(ohCondensates[i]! > ohCondensates[i - 1]!)) ohMono = false
  }
  console.log(
    `  Plaquette (5,625 -> exact ${NPHYS}-dim gauge-invariant subspace, g_Y^2=${gY2}): <O_H>(kappa=0..4) = [${ohCondensates.map(x => x.toFixed(4)).join(', ')}]`,
  )
  console.log(
    `  At kappa_H=2.0 (g_Y^2=${gY2}, truncated 3-state V_e): max|<H_v>|=${maxElitzurErr.toExponential(1)} (Elitzur!), dE_H=${ohGapAt2.toFixed(4)}, dE_Z=${ozGapAt2.toFixed(4)} (||O_Z|Om>||^2=${ozNormAt2.toFixed(4)}), dE_W+=${wpGapAt2.toFixed(4)}, dE_W-=${wmGapAt2.toFixed(4)} (Q_em=+-1 forces N_H=2 on 2-site plaquette), ||O_W+W-|Om>||^2=${wwNeutralNormAt2.toFixed(4)}, <W_B>=${wbExpectAt2.toFixed(4)}`,
  )

  recordCheck(
    'C2a',
    'Exact 5,625->14 plaquette (g_Y^2=0.35): Elitzur <H_v>=0 + nonzero FMS H, Z^0, W^+-, W^+W^- & exact W+/W- degeneracy',
    NPHYS === 14 &&
      physSub.maxGaussNorm < 1e-13 &&
      maxElitzurErr < 1e-14 &&
      ohMono &&
      ohGapAt2 > 0.1 &&
      ozNormAt2 > 0.1 &&
      ozGapAt2 > 0.1 &&
      wpNormAt2 > 0.1 &&
      Math.abs(wpNormAt2 - wmNormAt2) < 1e-13 &&
      wpGapAt2 > 0.1 &&
      Math.abs(wpGapAt2 - wmGapAt2) < 1e-13 &&
      wwNeutralNormAt2 > 0.1 &&
      wbExpectAt2 > 0.1,
    `dim=${NPHYS}, max|<H_v>|=${maxElitzurErr.toExponential(1)}, <O_H>(2)=${ohCondensates[3]!.toFixed(4)}, dE_H=${ohGapAt2.toFixed(3)}, dE_Z=${ozGapAt2.toFixed(3)}, dE_W+-=${wpGapAt2.toFixed(3)} (|W+-W-|=${Math.abs(wpGapAt2 - wmGapAt2).toExponential(1)})`,
  )

  // --------------------------------------------------------------------------
  // C2b: Pure-SU(2)_L Custodial Control (g_Y = 0, V_e turned off => 5^4 = 625 states)
  //      Exhaustively project all 625 states (H_0, H_1, U_0, U_1) onto ker(G_L^2)
  //      => exact 10-dim SU(2)_L gauge-invariant subspace (4 J_R=0 singlets + 2x3 J_R=1 triplets).
  //      Certify EXACT custodial triplet degeneracy dE_{W^+} = dE_{W^-} = dE_{Z^0} (< 1e-12)
  //      and identical transition norms ||O_{W^a}|Omega>||^2 across a = +, -, 3!
  // --------------------------------------------------------------------------
  const DIM_CUST = 625 // 5 * 5 * 5 * 5
  const cIdx = (h0: number, h1: number, u0: number, u1: number): number => ((h0 * 5 + h1) * 5 + u0) * 5 + u1

  const custBlocks = new Map<string, number[]>()
  for (let h0 = 0; h0 < 5; h0++) {
    const jh0 = h0 === 0 ? 0 : 1
    const bh0 = h0 === 0 ? -1 : (h0 - 1) & 1
    for (let h1 = 0; h1 < 5; h1++) {
      const jh1 = h1 === 0 ? 0 : 1
      const bh1 = h1 === 0 ? -1 : (h1 - 1) & 1
      for (let u0 = 0; u0 < 5; u0++) {
        const ju0 = u0 === 0 ? 0 : 1
        for (let u1 = 0; u1 < 5; u1++) {
          const ju1 = u1 === 0 ? 0 : 1
          const key = `${jh0},${bh0},${jh1},${bh1},${ju0},${ju1}`
          let arr = custBlocks.get(key)
          if (!arr) {
            arr = []
            custBlocks.set(key, arr)
          }
          arr.push(cIdx(h0, h1, u0, u1))
        }
      }
    }
  }
  const decodeCust = (idx: number): [number, number, number, number] => {
    const u1 = idx % 5
    const t1 = Math.floor(idx / 5)
    const u0 = t1 % 5
    const t2 = Math.floor(t1 / 5)
    const h1 = t2 % 5
    const h0 = Math.floor(t2 / 5)
    return [h0, h1, u0, u1]
  }

  const custBasisRe: Float64Array[] = []
  const custBasisIm: Float64Array[] = []
  let maxCustGaussNorm = 0
  for (const states of custBlocks.values()) {
    const m = states.length
    const posOf = new Map<number, number>()
    for (let i = 0; i < m; i++) posOf.set(states[i]!, i)
    const G2 = cmatZero(m)
    for (const vtx of [0, 1] as const) {
      for (let a = 0; a < 3; a++) {
        const Ga = cmatZero(m)
        for (let col = 0; col < m; col++) {
          const [h0, h1, u0, u1] = decodeCust(states[col]!)
          if (vtx === 0) {
            for (let hp = 0; hp < 5; hp++) {
              const mr = L5[a]!.re[hp * 5 + h0]!
              const mi = L5[a]!.im[hp * 5 + h0]!
              if (mr !== 0 || mi !== 0) {
                const r = posOf.get(cIdx(hp, h1, u0, u1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
            }
            for (let up = 0; up < 5; up++) {
              const mr = R5[a]!.re[up * 5 + u0]!
              const mi = R5[a]!.im[up * 5 + u0]!
              if (mr !== 0 || mi !== 0) {
                const r = posOf.get(cIdx(h0, h1, up, u1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
              const mr2 = L5[a]!.re[up * 5 + u1]!
              const mi2 = L5[a]!.im[up * 5 + u1]!
              if (mr2 !== 0 || mi2 !== 0) {
                const r = posOf.get(cIdx(h0, h1, u0, up))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr2
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi2
              }
            }
          } else {
            for (let hp = 0; hp < 5; hp++) {
              const mr = L5[a]!.re[hp * 5 + h1]!
              const mi = L5[a]!.im[hp * 5 + h1]!
              if (mr !== 0 || mi !== 0) {
                const r = posOf.get(cIdx(h0, hp, u0, u1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
            }
            for (let up = 0; up < 5; up++) {
              const mr = L5[a]!.re[up * 5 + u0]!
              const mi = L5[a]!.im[up * 5 + u0]!
              if (mr !== 0 || mi !== 0) {
                const r = posOf.get(cIdx(h0, h1, up, u1))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi
              }
              const mr2 = R5[a]!.re[up * 5 + u1]!
              const mi2 = R5[a]!.im[up * 5 + u1]!
              if (mr2 !== 0 || mi2 !== 0) {
                const r = posOf.get(cIdx(h0, h1, u0, up))!
                Ga.re[r * m + col] = Ga.re[r * m + col]! + mr2
                Ga.im[r * m + col] = Ga.im[r * m + col]! + mi2
              }
            }
          }
        }
        const Ga2 = cmatMul(Ga, Ga)
        for (let i = 0; i < m * m; i++) {
          G2.re[i] = G2.re[i]! + Ga2.re[i]!
          G2.im[i] = G2.im[i]! + Ga2.im[i]!
        }
      }
    }
    const eig = hermitianJacobi(m, G2.re, G2.im, true)
    for (let k = 0; k < m; k++) {
      if (eig.vals[k]! < 1e-11) {
        maxCustGaussNorm = Math.max(maxCustGaussNorm, Math.sqrt(Math.max(0, eig.vals[k]!)))
        const vr = new Float64Array(DIM_CUST)
        const vi = new Float64Array(DIM_CUST)
        for (let r = 0; r < m; r++) {
          vr[states[r]!] = eig.vecRe[k * m + r]!
          vi[states[r]!] = eig.vecIm[k * m + r]!
        }
        custBasisRe.push(vr)
        custBasisIm.push(vi)
      }
    }
  }
  const NCUST = custBasisRe.length
  assert(NCUST === 10, `Expected exact 10-dim pure-SU(2)_L custodial subspace inside 625 states, got ${NCUST}`)

  // Build exact 10x10 custodial Hamiltonian H_cust (kappa_H = 2.0, g_Y = 0) & FMS triplet ops O_{W^+}, O_{W^-}, O_{Z^0}
  const applyCustEdge = (
    edge: 0 | 1,
    pauliBeta: readonly (readonly [C, C])[],
    inR: Float64Array,
    inI: Float64Array,
    outR: Float64Array,
    outI: Float64Array,
    coef: number,
  ): void => {
    for (let b1 = 0; b1 < 2; b1++) {
      for (let b2 = 0; b2 < 2; b2++) {
        const sig = pauliBeta[b1]![b2]!
        if (sig[0] === 0 && sig[1] === 0) continue
        const sr = coef * sig[0]
        const si = coef * sig[1]
        for (let al = 0; al < 2; al++) {
          for (let ga = 0; ga < 2; ga++) {
            const hyOp = U5Dag[al]![b1]!
            const uOp = U5[al]![ga]!
            const hxOp = U5[ga]![b2]!
            for (let hx = 0; hx < 5; hx++) {
              for (let hxP = 0; hxP < 5; hxP++) {
                const vx = hxOp.re[hxP * 5 + hx]!
                if (vx === 0) continue
                for (let hy = 0; hy < 5; hy++) {
                  for (let hyP = 0; hyP < 5; hyP++) {
                    const vy = hyOp.re[hyP * 5 + hy]!
                    if (vy === 0) continue
                    for (let ue = 0; ue < 5; ue++) {
                      for (let ueP = 0; ueP < 5; ueP++) {
                        const vu = uOp.re[ueP * 5 + ue]!
                        if (vu === 0) continue
                        const w = vx * vy * vu
                        const wr = w * sr
                        const wi = w * si
                        for (let uOth = 0; uOth < 5; uOth++) {
                          const c = edge === 0 ? cIdx(hx, hy, ue, uOth) : cIdx(hy, hx, uOth, ue)
                          const r = edge === 0 ? cIdx(hxP, hyP, ueP, uOth) : cIdx(hyP, hxP, uOth, ueP)
                          const xr = inR[c]!
                          const xi = inI[c]!
                          if (xr === 0 && xi === 0) continue
                          outR[r] = outR[r]! + (wr * xr - wi * xi)
                          outI[r] = outI[r]! + (wr * xi + wi * xr)
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const projectCustOp = (
    fn: (inR: Float64Array, inI: Float64Array, outR: Float64Array, outI: Float64Array) => void,
  ): CMat => {
    const M = cmatZero(NCUST)
    const tr = new Float64Array(DIM_CUST)
    const ti = new Float64Array(DIM_CUST)
    for (let j = 0; j < NCUST; j++) {
      tr.fill(0)
      ti.fill(0)
      fn(custBasisRe[j]!, custBasisIm[j]!, tr, ti)
      for (let i = 0; i < NCUST; i++) {
        let sr = 0
        let si = 0
        const br = custBasisRe[i]!
        const bi = custBasisIm[i]!
        for (let k = 0; k < DIM_CUST; k++) {
          sr += br[k]! * tr[k]! + bi[k]! * ti[k]!
          si += br[k]! * ti[k]! - bi[k]! * tr[k]!
        }
        M.re[i * NCUST + j] = sr
        M.im[i * NCUST + j] = si
      }
    }
    return M
  }

  const kapCust = 2.0
  const HCust10 = projectCustOp((ir, ii, or, oi) => {
    // Diagonal electric + Higgs mass
    for (let h0 = 0; h0 < 5; h0++) {
      const nh0 = h0 === 0 ? 0 : 1
      for (let h1 = 0; h1 < 5; h1++) {
        const nh1 = h1 === 0 ? 0 : 1
        for (let u0 = 0; u0 < 5; u0++) {
          const c0 = u0 === 0 ? 0 : 0.75
          for (let u1 = 0; u1 < 5; u1++) {
            const c1 = u1 === 0 ? 0 : 0.75
            const id = cIdx(h0, h1, u0, u1)
            const w = gL2 * (c0 + c1) + muH2 * (nh0 + nh1)
            or[id] = or[id]! + w * ir[id]!
            oi[id] = oi[id]! + w * ii[id]!
          }
        }
      }
    }
    // Magnetic SU(2)_L plaquette -0.5/gL2 * Tr(U_1 U_0)
    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        const op1 = U5[a]![b]!
        const op0 = U5[b]![a]!
        for (let u0 = 0; u0 < 5; u0++) {
          for (let u0p = 0; u0p < 5; u0p++) {
            const m0 = op0.re[u0p * 5 + u0]!
            if (m0 === 0) continue
            for (let u1 = 0; u1 < 5; u1++) {
              for (let u1p = 0; u1p < 5; u1p++) {
                const m1 = op1.re[u1p * 5 + u1]!
                if (m1 === 0) continue
                const w = (-0.5 / gL2) * m0 * m1
                for (let h0 = 0; h0 < 5; h0++) {
                  for (let h1 = 0; h1 < 5; h1++) {
                    const c = cIdx(h0, h1, u0, u1)
                    const r = cIdx(h0, h1, u0p, u1p)
                    or[r] = or[r]! + w * ir[c]!
                    oi[r] = oi[r]! + w * ii[c]!
                  }
                }
              }
            }
          }
        }
      }
    }
    // Custodial Higgs hopping -kap * (O_kin(e_0) + O_kin(e_1)) with V_e = I
    applyCustEdge(0, I2Mat, ir, ii, or, oi, -kapCust)
    applyCustEdge(1, I2Mat, ir, ii, or, oi, -kapCust)
  })

  const eigCust = hermitianJacobi(NCUST, HCust10.re, HCust10.im, true)
  const cGsRe = eigCust.vecRe.subarray(0, NCUST)
  const cGsIm = eigCust.vecIm.subarray(0, NCUST)

  // Normalized custodial vector triplet operators (W^+, W^-, Z^0):
  //   sigma_+/sqrt(2) * sqrt(2) -> T_+, T_-, T_3 all have Tr(T^dag T) = 2:
  //   W^+: sqrt(2) * SMinusMat,  W^-: sqrt(2) * SPlusMat,  Z^0: ISZMat (all Frobenius norm sqrt(2)!)
  const CustWpMat: readonly (readonly [C, C])[] = [
    [C0, C0],
    [[SQRT2, 0], C0],
  ]
  const CustWmMat: readonly (readonly [C, C])[] = [
    [C0, [SQRT2, 0]],
    [C0, C0],
  ]
  const custOps: readonly { readonly label: string; readonly mat: CMat }[] = [
    { label: 'W+', mat: projectCustOp((ir, ii, or, oi) => applyCustEdge(0, CustWpMat, ir, ii, or, oi, 1)) },
    { label: 'W-', mat: projectCustOp((ir, ii, or, oi) => applyCustEdge(0, CustWmMat, ir, ii, or, oi, 1)) },
    { label: 'Z0', mat: projectCustOp((ir, ii, or, oi) => applyCustEdge(0, ISZMat, ir, ii, or, oi, 1)) },
  ]

  const custRes = custOps.map(op => {
    let norm2 = 0
    let firstGap = Infinity
    let rayleighNum = 0
    for (let k = 0; k < NCUST; k++) {
      let ovR = 0
      let ovI = 0
      for (let i = 0; i < NCUST; i++) {
        for (let j = 0; j < NCUST; j++) {
          const mr = op.mat.re[i * NCUST + j]!
          const mi = op.mat.im[i * NCUST + j]!
          const er = eigCust.vecRe[k * NCUST + i]!
          const ei = -eigCust.vecIm[k * NCUST + i]!
          const gr = cGsRe[j]!
          const gi = cGsIm[j]!
          const tR = mr * gr - mi * gi
          const tI = mr * gi + mi * gr
          ovR += er * tR - ei * tI
          ovI += er * tI + ei * tR
        }
      }
      const p2 = ovR * ovR + ovI * ovI
      norm2 += p2
      rayleighNum += p2 * (eigCust.vals[k]! - eigCust.vals[0]!)
      if (k > 0 && p2 > 1e-8 && firstGap === Infinity) firstGap = eigCust.vals[k]! - eigCust.vals[0]!
    }
    return { label: op.label, norm2, firstGap, rayleighGap: rayleighNum / norm2 }
  })

  const dECustWp = custRes[0]!.firstGap
  const dECustWm = custRes[1]!.firstGap
  const dECustZ0 = custRes[2]!.firstGap
  const maxCustGapSplit = Math.max(Math.abs(dECustWp - dECustZ0), Math.abs(dECustWm - dECustZ0))
  const maxCustNormSplit = Math.max(
    Math.abs(custRes[0]!.norm2 - custRes[2]!.norm2),
    Math.abs(custRes[1]!.norm2 - custRes[2]!.norm2),
  )
  const maxCustRaySplit = Math.max(
    Math.abs(custRes[0]!.rayleighGap - custRes[2]!.rayleighGap),
    Math.abs(custRes[1]!.rayleighGap - custRes[2]!.rayleighGap),
  )
  console.log(
    `  Pure-SU(2)_L custodial control (g_Y=0, 625 -> ${NCUST}-dim): dE_W+=${dECustWp.toFixed(6)}, dE_W-=${dECustWm.toFixed(6)}, dE_Z0=${dECustZ0.toFixed(6)} (maxSplit=${maxCustGapSplit.toExponential(1)}), ||O|Om>||^2=${custRes[2]!.norm2.toFixed(4)} (normSplit=${maxCustNormSplit.toExponential(1)})`,
  )

  recordCheck(
    'C2b',
    'Pure-SU(2)_L custodial control (g_Y=0, 625->10): exact triplet degeneracy dE_W+ = dE_W- = dE_Z^0 (<1e-12)',
    NCUST === 10 &&
      maxCustGaussNorm < 1e-13 &&
      dECustZ0 > 0.1 &&
      custRes[2]!.norm2 > 0.1 &&
      maxCustGapSplit < 1e-12 &&
      maxCustNormSplit < 1e-12 &&
      maxCustRaySplit < 1e-12,
    `dim=${NCUST}, dE_(W+,W-,Z0)=${dECustZ0.toFixed(6)} (maxSplit=${maxCustGapSplit.toExponential(1)}), normSplit=${maxCustNormSplit.toExponential(1)}, rayleighSplit=${maxCustRaySplit.toExponential(1)}`,
  )

  // --------------------------------------------------------------------------
  // C3: Exact Gauge-Invariant Yukawa Operator H_Yuk on 20-dim Dock (Fermion (x) H_v)
  //     Fermion states: 0=u_L (Y=+1/6), 1=d_L (Y=+1/6), 2=u_R (Y=+2/3), 3=d_R (Y=-1/3)
  //     H_Yuk = y_u sum_al (|al_L><u_R| (x) H_{al, 0} + h.c.)
  //           + y_d sum_al (|al_L><d_R| (x) H_{al, 1} + h.c.)
  //     Certify ||[H_Yuk, G_v^a]||_F < 1e-13, ||[H_Yuk, G_v^Y]||_F < 1e-13,
  //     exact split FMS Dirac masses m_u = sqrt(2) y_u, m_d = sqrt(2) y_d,
  //     AND negative control: bare mass |u_L><u_R| + h.c. breaks Gauss law (E-FRC-0273)!
  // --------------------------------------------------------------------------
  const DIM_YUK = 20 // 4 fermion states x 5 bidoublet states
  const yIdx = (f: number, h: number): number => f * 5 + h
  const yU = 1.0
  const yD = 0.25

  const HYuk = cmatZero(DIM_YUK)
  for (let al = 0; al < 2; al++) {
    const hu = U5[al]![0]! // Y = +1/2, pairs with u_L^dag u_R (Y_L - Y_uR = -1/2)
    const hd = U5[al]![1]! // Y = -1/2, pairs with d_L^dag d_R (Y_L - Y_dR = +1/2)
    for (let hp = 0; hp < 5; hp++) {
      for (let h = 0; h < 5; h++) {
        const vu = hu.re[hp * 5 + h]!
        if (vu !== 0) {
          const r = yIdx(al, hp)
          const c = yIdx(2, h)
          HYuk.re[r * DIM_YUK + c] = HYuk.re[r * DIM_YUK + c]! + yU * vu
          HYuk.re[c * DIM_YUK + r] = HYuk.re[c * DIM_YUK + r]! + yU * vu
        }
        const vd = hd.re[hp * 5 + h]!
        if (vd !== 0) {
          const r = yIdx(al, hp)
          const c = yIdx(3, h)
          HYuk.re[r * DIM_YUK + c] = HYuk.re[r * DIM_YUK + c]! + yD * vd
          HYuk.re[c * DIM_YUK + r] = HYuk.re[c * DIM_YUK + r]! + yD * vd
        }
      }
    }
  }

  // Build 20x20 local Gauss generators G_v^a (a=1,2,3) and G_v^Y
  const YFerm = [1 / 6, 1 / 6, 2 / 3, -1 / 3] as const
  const GvY = cmatZero(DIM_YUK)
  for (let f = 0; f < 4; f++) {
    for (let h = 0; h < 5; h++) {
      const i = yIdx(f, h)
      GvY.re[i * DIM_YUK + i] = YFerm[f]! + YH5[h]!
    }
  }
  const GvSu2: CMat[] = [0, 1, 2].map(a => {
    const G = cmatZero(DIM_YUK)
    const Ta = T_HALF[a]!
    const La = L5[a]!
    for (let f = 0; f < 4; f++) {
      for (let h = 0; h < 5; h++) {
        const col = yIdx(f, h)
        // Fermion SU(2)_L doublet action on f in {0, 1}
        if (f < 2) {
          for (let f2 = 0; f2 < 2; f2++) {
            const row = yIdx(f2, h)
            G.re[row * DIM_YUK + col] = G.re[row * DIM_YUK + col]! + Ta[f2]![f]![0]
            G.im[row * DIM_YUK + col] = G.im[row * DIM_YUK + col]! + Ta[f2]![f]![1]
          }
        }
        // Higgs bidoublet SU(2)_L action
        for (let hp = 0; hp < 5; hp++) {
          const row = yIdx(f, hp)
          G.re[row * DIM_YUK + col] = G.re[row * DIM_YUK + col]! + La.re[hp * 5 + h]!
          G.im[row * DIM_YUK + col] = G.im[row * DIM_YUK + col]! + La.im[hp * 5 + h]!
        }
      }
    }
    return G
  })

  let maxYukComm = cmatCommFrob(HYuk, GvY)
  for (let a = 0; a < 3; a++) maxYukComm = Math.max(maxYukComm, cmatCommFrob(HYuk, GvSu2[a]!))

  // Negative control (E-FRC-0273): bare mass |u_L><u_R| + h.c. (x) I_5 breaks Gauss law!
  const HBare = cmatZero(DIM_YUK)
  for (let h = 0; h < 5; h++) {
    HBare.re[yIdx(0, h) * DIM_YUK + yIdx(2, h)] = 1
    HBare.re[yIdx(2, h) * DIM_YUK + yIdx(0, h)] = 1
  }
  let bareComm = cmatCommFrob(HBare, GvY)
  for (let a = 0; a < 3; a++) bareComm = Math.max(bareComm, cmatCommFrob(HBare, GvSu2[a]!))

  // Verify exact FMS Dirac fermion mass eigenvalues +-sqrt(2)*y_u and +-sqrt(2)*y_d inside the SU(2)_L singlet subspace!
  const eigYuk = hermitianJacobi(DIM_YUK, HYuk.re, HYuk.im, true)
  const singletMasses: number[] = []
  for (let k = 0; k < DIM_YUK; k++) {
    // Check if eigenstate k is an SU(2)_L singlet (||G_v^a |psi_k>|| < 1e-12)
    let g2 = 0
    for (let a = 0; a < 3; a++) {
      const Ga = GvSu2[a]!
      for (let r = 0; r < DIM_YUK; r++) {
        let sr = 0
        let si = 0
        for (let c = 0; c < DIM_YUK; c++) {
          sr += Ga.re[r * DIM_YUK + c]! * eigYuk.vecRe[k * DIM_YUK + c]! - Ga.im[r * DIM_YUK + c]! * eigYuk.vecIm[k * DIM_YUK + c]!
          si += Ga.re[r * DIM_YUK + c]! * eigYuk.vecIm[k * DIM_YUK + c]! + Ga.im[r * DIM_YUK + c]! * eigYuk.vecRe[k * DIM_YUK + c]!
        }
        g2 += sr * sr + si * si
      }
    }
    if (g2 < 1e-12) singletMasses.push(eigYuk.vals[k]!)
  }
  singletMasses.sort((a, b) => a - b)
  const expectedSingletMasses = [-SQRT2 * yU, -SQRT2 * yD, SQRT2 * yD, SQRT2 * yU]
  let maxYukMassErr = singletMasses.length === 4 ? 0 : Infinity
  if (singletMasses.length === 4) {
    for (let i = 0; i < 4; i++) maxYukMassErr = Math.max(maxYukMassErr, Math.abs(singletMasses[i]! - expectedSingletMasses[i]!))
  }

  recordCheck(
    'C3',
    'Exact gauge-invariant Yukawa ||[H_Yuk, G_v]||_F < 1e-13, split FMS Dirac masses & E-FRC-0273 bare-mass negative control',
    maxYukComm < 1e-13 &&
      maxYukMassErr < 1e-13 &&
      bareComm > 1.0,
    `||[H_Yuk,G_v]||_F=${maxYukComm.toExponential(1)}, FMS_masses=[${singletMasses.map(m => m.toFixed(4)).join(',')}], negCtrl_bareComm=${bareComm.toFixed(4)}`,
  )
}

runRouteC()

// ============================================================================
// SUMMARY LEDGER, TIMING & MEMORY CERTIFICATE
// ============================================================================

const elapsedMs = nowMs() - T_START
const mem = globalAny.process?.memoryUsage?.()
const rssMB = mem ? mem.rss / (1024 * 1024) : 0
const heapMB = mem ? mem.heapUsed / (1024 * 1024) : 0
const passed = CHECKS.filter(c => c.pass).length

console.log('\n========================================================================')
console.log(`CERTIFICATION SUMMARY: ${passed}/${CHECKS.length} CHECKS PASSED`)
console.log(`Runtime: ${(elapsedMs / 1000).toFixed(3)} s | RSS: ${rssMB.toFixed(1)} MB | Heap: ${heapMB.toFixed(1)} MB`)
console.log('========================================================================')

assert(passed === CHECKS.length, `Only ${passed}/${CHECKS.length} checks passed`)
assert(elapsedMs < 6000, `Exceeded 6 s fast budget: ${elapsedMs.toFixed(1)} ms`)
if (rssMB > 0) {
  assert(rssMB < 250, `Exceeded 250 MB RAM budget: ${rssMB.toFixed(1)} MB`)
}

export {}
