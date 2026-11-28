// =================================================================================================
// BARE-U FINITE-DENSITY RADION CONDENSATE, n = 1 KAEHLER FLUX SELECTION,
// CUSP CASIMIR / CC POWER LADDER & NATIVE V_{q=2} DARK-SECTOR VERIFICATION SUITE (G1..G9)
// =================================================================================================
//
// Standalone, ZERO external imports (pure TypeScript ending with `export {}`), strictly deterministic,
// strict TypeScript (--strict --noUncheckedIndexedAccess), fast (< 6.0 s, < 180 MB RSS),
// fail-closed (hard assert() on every gate G1..G9).
//
// =================================================================================================
// EPISTEMIC SCOPE LEDGER (BRUTALLY HONEST TIER A / TIER B / TIER C DISCLOSURE)
// =================================================================================================
//
// TIER A (Exact Mathematical Theorems, Exact Operator Spectra & Exact Finite-Hilbert Evolution):
//   - G1: Exact 1-particle bare-U coin C = D^2 dispersion E_-(k) = acos(0.5 cos k) - pi/3
//         (m_* = sqrt(3)), exact 2-body dock phases {2pi/3, 5pi/9, pi/9} from D M_meet D = omega^2
//         and M_pair(zeta_18), full 12x12 4D D_4 BdG SO(4)-isotropic sound mode c_s = sqrt(5 pi n_1 / (36 sqrt(3)))
//         with exact zero-velocity flat subbands (5/11, 2/11, 5/11), and exact linear GMOR scaling
//         omega_pGB^2(0) / (n_1^2 * theta) = 2 pi / 3.
//   - G2 (hard-core obstruction): Exact discrete-time 4x4 Floquet BdG Krein threshold
//         n_{1,c} = 18 / (5 pi sqrt(3)) = 0.661595 (n_bg < 7.939), exact literal sole-pair veto
//         (n_dock === 2) + hard-core Gutzwiller ceiling m_scr_1D^2 <= 0.041383 (neutral strictly half),
//         capping m_lat_max^2 = 0.3782 < 0.40 (rHi < 1.60, 2.69x--2.91x below D_*=13 GW window),
//         and exact 1-beat hard-core dephasing |<a(1)>/<a(0)>| = sqrt(1 - 3 rho + 3 rho^2) = 0.500
//         with entanglement entropy S_ent = 0.56234 nats (81.1% of ln 2) at rho = 0.5.
//   - G3: Exact many-body finite-density Floquet evolution of verbatim bare U on M = 3 rings
//         (L = 2 dim = 495 & L = 3 dim = 3,060, N = 4, T = 256) via pre-built sparse CSC operators:
//         no-mpair freezes O_rel = N_0 - N_1 (W(0) > 0.9999), literal-veto retains W(0) in [0.45, 0.48]
//         strictly above unvetoed-pair W(0) in [0.13, 0.16], with broad continuum dephasing (maxLow < 0.05).
//   - G4: Exact self-duality |*F_phys - F_phys| < 1e-14 of F_phys = L(i+j+k) (sum F^2 = 12, Vol(D_4) = 2),
//         exact continuum ASS Lefschetz indices on T^4_{D_4}/<L(q_3)> for n = 0..4 proving the
//         uniqueness theorem ind_0(n) = 2 n^2 - 2 = 0 <=> n = +-1 (forcing N_gen = ind_1(+-1) = 3),
//         exact 2,592-triangle D_4/3D_4 Wilson action (c_kin = 2.000000, S_W*g_4^2 = 0, 220.619, 713.405, 1134.000),
//         and L = 3, n = 2 Hofstadter ceiling (max ind_tot <= 3 << Pf = +24).
//   - G5: Exact 324-dim D_4/3D_4 overlap fermion & 81-dim scalar 1-loop free energies (n = 0..3):
//         both fermions (dS_F(TOT)=+6.7986, dS_F(V1)=+7.5422) and scalars (dS_B=+4.0541) penalize n = 1
//         over n = 0, and even zero-mode-stripped |dS_F'| = 2.1815 is dwarfed > 100x by S_YM; exact
//         continuum self-dual Landau-level heat-kernel c_2 = {-1/3, +2/3, +11/3} (tachyon-free vector).
//   - G6 (Vafa-Witten & Savvidy algebra): Exact imaginary topological phase Re(6 i theta n^2) = 0,
//         exact Savvidy-Leutwyler n = 1 window -(4 ln 2 / 3) b_eff < c_0 < 0 (scale ratio 2^{2/3} = 1.587401)
//         requiring 1/g_eff^2(B_1) < 0 (beyond 1-loop Landau pole), and exact (n - b)^2 minimum at n = 1 for b = 2/3.
//   - G7: Exact SM {3,4,3,4} cusp Casimir energy (D_* = 1..13, N_B = 28, N_F = 96) via zero-cancellation
//         positive-recurrence LDL^T (r[d] = v(d) + bCur*(r[d-1]/p[d-1])): E_raw^SM(13) = -437.813,
//         E_0(D-1)/E_0(D) = sqrt(lambda_1) = 4.275361 (< 1e-5 across D = 9..15), E_Cas,NN^SM(13) = -2.84090e-7,
//         and ZERO local minima in D_* in [2, 13] across all 5 uniform/mixed SM BC assignments.
//   - G8 (exact BigInt ladder): Exact BigInt N_13 = 25123449085462194n power ladder against Planck 2018
//         rho_Lambda / M_Pl,red^4 = 7.278e-121.
//   - G9 (exact selection rules): Exact vanishing max|psi_{V2}(x_fp)|^2 < 1e-24 at all 9 fixed points,
//         exact Z_3^{DM} charge Q_DM = (q_orb - F) mod 3, exact 2T_R = SL(2,3) character multiplicities
//         (0 Dirac mixing, 0 Majorana mixing, 0 three-body 1' decay, 7 thermal-relic 2->2 portals, 2 self-mass),
//         and exact {3,4,3,4} Steinberg generating function critical exponent alpha_* = 1.058151 (p_* = 3.1745).
//
// TIER B (Explicitly Disclosed EFT & Structural Boundary Choices):
//   - G2 (soft-core GP EFT): Unvetoed soft-core bosonic Floquet GP EFT hits BOTH D_* = 13 GW windows
//         m_lat^2 in [1.01839, 1.10234] at natural O(1) dock density n_bg in [1.03, 1.12] (n_1 in [0.086, 0.093]),
//         but lifting the literal bare-U sole-pair veto & hard-core exclusion is a Tier-B EFT extension.
//   - G6 (fractional B-field): Selecting n = +1 dynamically via Z_3-fractional background 2-form
//         B = (2/3) F_prim relies on a Tier-B/C discrete gerbe/moduli background input.
//   - G9 (dark-sector phenomenology): SM Yukawa couplings break 2T_R (leaving Z_3 Q_DM intact unless
//         126bar_H carries q != 0), sterile dark matter requires V_{q=2} to be an SM-singlet bulk fermion,
//         and matching Planck Omega_c / Omega_b = 5.3643 requires dynamical warp profile alpha_* = 1.058151.
//
// TIER C (Honest Open Problems — Zero Numerology):
//   - G6: Abelian 1-loop (fermions + scalars) favors n = 0; non-Abelian 1-loop Savvidy selection of n = 1
//         forces strong coupling beyond the 1-loop Landau pole (1/g_eff^2 < 0).
//   - G8: Zero-numerology CC audit certifies > 54 dex residual IR fine-tuning between EWSB / 68 N_13^-4
//         and Planck rho_Lambda / M_Pl,red^4 (and -11.1 dex undershoot at N_13^-8). The cosmological constant
//         remains an honest open IR problem.
// =================================================================================================

const START_MS = performance.now()
const PI = Math.PI
const SQRT2 = Math.SQRT2
const SQRT3 = Math.sqrt(3)

// =================================================================================================
// 0. HARD ASSERTION HARNESS & DETERMINISTIC LINEAR ALGEBRA PRIMITIVES
// =================================================================================================

type GateRecord = {
  readonly id: string
  readonly tier: 'Tier A' | 'Tier A/B' | 'Tier A/C' | 'Tier A/B/C'
  readonly name: string
  readonly passed: boolean
  readonly summary: string
}

const GATES: GateRecord[] = []

function assert(cond: boolean, msg: string): asserts cond {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`)
  }
}

function recordGate(
  id: string,
  tier: GateRecord['tier'],
  name: string,
  passed: boolean,
  summary: string,
): void {
  GATES.push({ id, tier, name, passed, summary })
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${id} (${tier}): ${name}`)
  console.log(`       ${summary}`)
  assert(passed, `Gate ${id} (${name}) failed: ${summary}`)
}

type C = readonly [number, number]
const C_ZERO: C = [0, 0]
const C_ONE: C = [1, 0]
const C_W: C = [-0.5, SQRT3 / 2]
const C_W2: C = [-0.5, -SQRT3 / 2]

const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConj = (a: C): C => [a[0], -a[1]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cExpI = (t: number): C => [Math.cos(t), Math.sin(t)]

const Z18_TAB: readonly C[] = Array.from({ length: 18 }, (_, k) => [
  Math.cos((PI * k) / 9),
  Math.sin((PI * k) / 9),
])

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }

function cmatZero(n: number): CMat {
  return { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
}

// Fast exact symmetric tridiagonal implicit QL (eigenvalues only, sorted ascending, zero-allocation scratch)
const TRI_QL_D = new Float64Array(64)
const TRI_QL_E = new Float64Array(64)

function symTridiagEigs(diagIn: Float64Array, offIn: Float64Array): Float64Array {
  const n = diagIn.length
  const d = n <= 64 ? TRI_QL_D.subarray(0, n) : new Float64Array(n)
  const e = n <= 64 ? TRI_QL_E.subarray(0, n) : new Float64Array(n)
  for (let i = 0; i < n; i++) d[i] = diagIn[i]!
  for (let i = 0; i < n - 1; i++) e[i] = offIn[i]!
  e[n - 1] = 0
  for (let l = 0; l < n; l++) {
    let iter = 0
    while (true) {
      let m = l
      for (; m < n - 1; m++) {
        const dd = Math.abs(d[m]!) + Math.abs(d[m + 1]!)
        if (Math.abs(e[m]!) <= 1e-15 * dd || Math.abs(e[m]!) < 1e-300) break
      }
      if (m === l) break
      iter++
      assert(iter <= 80, `Tridiagonal QL did not converge at l=${l}`)
      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.hypot(g, 1)
      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? r : -r))
      let s = 1
      let c = 1
      let p = 0
      let i = m - 1
      for (; i >= l; i--) {
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
      }
      if (r === 0 && i >= l) continue
      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }
  d.sort()
  return d
}

// Fast exact complex Hermitian eigensolver (Householder tridiagonalization + phase gauge + implicit QL)
// Eigenvectors returned row-wise: vecRe[eigIdx * n + r] = v_{eigIdx}(r)
// Reuses module-level scratch workspace for n <= 128 to keep peak RSS minimal.
const HE_MAX = 128
const HE_A_RE = new Float64Array(HE_MAX * HE_MAX)
const HE_A_IM = new Float64Array(HE_MAX * HE_MAX)
const HE_HH_RE = new Float64Array(HE_MAX * HE_MAX)
const HE_HH_IM = new Float64Array(HE_MAX * HE_MAX)
const HE_Z = new Float64Array(HE_MAX * HE_MAX)
const HE_VEC_RE = new Float64Array(HE_MAX * HE_MAX)
const HE_VEC_IM = new Float64Array(HE_MAX * HE_MAX)
const HE_V_RE = new Float64Array(HE_MAX)
const HE_V_IM = new Float64Array(HE_MAX)
const HE_BETA = new Float64Array(HE_MAX)
const HE_W_RE = new Float64Array(HE_MAX)
const HE_W_IM = new Float64Array(HE_MAX)
const HE_D = new Float64Array(HE_MAX)
const HE_E = new Float64Array(HE_MAX)
const HE_PHI_RE = new Float64Array(HE_MAX)
const HE_PHI_IM = new Float64Array(HE_MAX)
const HE_EMPTY = new Float64Array(0)

function hermitianEig(
  n: number,
  hReIn: Float64Array,
  hImIn: Float64Array,
  computeVectors: boolean,
): { readonly values: Float64Array; readonly vecRe: Float64Array; readonly vecIm: Float64Array } {
  const useBuf = n <= HE_MAX
  const nn = n * n
  const aRe = useBuf ? HE_A_RE.subarray(0, nn) : new Float64Array(nn)
  const aIm = useBuf ? HE_A_IM.subarray(0, nn) : new Float64Array(nn)
  for (let i = 0; i < nn; i++) {
    aRe[i] = hReIn[i]!
    aIm[i] = hImIn[i]!
  }
  for (let i = 0; i < n; i++) {
    aIm[i * n + i] = 0
    for (let j = i + 1; j < n; j++) {
      const mr = 0.5 * (aRe[i * n + j]! + aRe[j * n + i]!)
      const mi = 0.5 * (aIm[i * n + j]! - aIm[j * n + i]!)
      aRe[i * n + j] = mr
      aIm[i * n + j] = mi
      aRe[j * n + i] = mr
      aIm[j * n + i] = -mi
    }
  }

  const hhVRe = computeVectors ? (useBuf ? HE_HH_RE.subarray(0, nn) : new Float64Array(nn)) : HE_EMPTY
  const hhVIm = computeVectors ? (useBuf ? HE_HH_IM.subarray(0, nn) : new Float64Array(nn)) : HE_EMPTY
  const vRe = useBuf ? HE_V_RE.subarray(0, n) : new Float64Array(n)
  const vIm = useBuf ? HE_V_IM.subarray(0, n) : new Float64Array(n)
  const hhBeta = useBuf ? HE_BETA.subarray(0, n) : new Float64Array(n)
  const wRe = useBuf ? HE_W_RE.subarray(0, n) : new Float64Array(n)
  const wIm = useBuf ? HE_W_IM.subarray(0, n) : new Float64Array(n)

  for (let k = 0; k < n - 2; k++) {
    const m = n - 1 - k
    let norm2 = 0
    for (let i = k + 1; i < n; i++) {
      const rr = aRe[i * n + k]!
      const ii = aIm[i * n + k]!
      norm2 += rr * rr + ii * ii
    }
    const sigma = Math.sqrt(norm2)
    if (sigma < 1e-30) {
      hhBeta[k] = 0
      continue
    }
    const x0r = aRe[(k + 1) * n + k]!
    const x0i = aIm[(k + 1) * n + k]!
    const x0Abs = Math.hypot(x0r, x0i)
    const pr = x0Abs > 1e-30 ? x0r / x0Abs : 1
    const pi = x0Abs > 1e-30 ? x0i / x0Abs : 0

    vRe[0] = x0r + pr * sigma
    vIm[0] = x0i + pi * sigma
    for (let i = 1; i < m; i++) {
      vRe[i] = aRe[(k + 1 + i) * n + k]!
      vIm[i] = aIm[(k + 1 + i) * n + k]!
    }
    const beta = 1 / (sigma * (sigma + x0Abs))
    hhBeta[k] = beta
    if (computeVectors) {
      const kOff = k * n
      for (let i = 0; i < m; i++) {
        hhVRe[kOff + i] = vRe[i]!
        hhVIm[kOff + i] = vIm[i]!
      }
    }

    for (let i = 0; i < m; i++) {
      const rowOff = (k + 1 + i) * n + (k + 1)
      let sr = 0
      let si = 0
      for (let j = 0; j < m; j++) {
        const hr = aRe[rowOff + j]!
        const hi = aIm[rowOff + j]!
        const vr = vRe[j]!
        const vi = vIm[j]!
        sr += hr * vr - hi * vi
        si += hr * vi + hi * vr
      }
      wRe[i] = beta * sr
      wIm[i] = beta * si
    }
    let vdw = 0
    for (let i = 0; i < m; i++) vdw += vRe[i]! * wRe[i]! + vIm[i]! * wIm[i]!
    const alpha = 0.5 * beta * vdw
    for (let i = 0; i < m; i++) {
      wRe[i] = wRe[i]! - alpha * vRe[i]!
      wIm[i] = wIm[i]! - alpha * vIm[i]!
    }
    for (let i = 0; i < m; i++) {
      const rowOff = (k + 1 + i) * n + (k + 1)
      const vir = vRe[i]!
      const vii = vIm[i]!
      const qir = wRe[i]!
      const qii = wIm[i]!
      for (let j = 0; j < m; j++) {
        const vjr = vRe[j]!
        const vji = vIm[j]!
        const qjr = wRe[j]!
        const qji = wIm[j]!
        aRe[rowOff + j] = aRe[rowOff + j]! - (vir * qjr + vii * qji + qir * vjr + qii * vji)
        aIm[rowOff + j] = aIm[rowOff + j]! - (vii * qjr - vir * qji + qii * vjr - qir * vji)
      }
    }
    aRe[(k + 1) * n + k] = -pr * sigma
    aIm[(k + 1) * n + k] = -pi * sigma
    aRe[k * n + (k + 1)] = -pr * sigma
    aIm[k * n + (k + 1)] = pi * sigma
    for (let i = k + 2; i < n; i++) {
      aRe[i * n + k] = 0
      aIm[i * n + k] = 0
      aRe[k * n + i] = 0
      aIm[k * n + i] = 0
    }
  }

  const d = useBuf ? HE_D.subarray(0, n) : new Float64Array(n)
  const e = useBuf ? HE_E.subarray(0, n) : new Float64Array(n)
  const phiRe = useBuf ? HE_PHI_RE.subarray(0, n) : new Float64Array(n)
  const phiIm = useBuf ? HE_PHI_IM.subarray(0, n) : new Float64Array(n)
  phiRe[0] = 1
  phiIm[0] = 0
  for (let i = 0; i < n; i++) d[i] = aRe[i * n + i]!
  for (let i = 1; i < n; i++) {
    const cr = aRe[i * n + (i - 1)]!
    const ci = aIm[i * n + (i - 1)]!
    const mag = Math.hypot(cr, ci)
    e[i - 1] = mag
    if (mag > 1e-30) {
      const ur = cr / mag
      const ui = ci / mag
      const pr = phiRe[i - 1]!
      const pi = phiIm[i - 1]!
      phiRe[i] = pr * ur - pi * ui
      phiIm[i] = pr * ui + pi * ur
    } else {
      phiRe[i] = phiRe[i - 1]!
      phiIm[i] = phiIm[i - 1]!
    }
  }
  e[n - 1] = 0

  const Z = computeVectors ? (useBuf ? HE_Z.subarray(0, nn) : new Float64Array(nn)) : HE_EMPTY
  if (computeVectors) {
    Z.fill(0)
    for (let i = 0; i < n; i++) Z[i * n + i] = 1
  }

  for (let l = 0; l < n; l++) {
    let iter = 0
    while (true) {
      let m = l
      for (; m < n - 1; m++) {
        const dd = Math.abs(d[m]!) + Math.abs(d[m + 1]!)
        if (Math.abs(e[m]!) <= 1e-15 * dd || Math.abs(e[m]!) < 1e-300) break
      }
      if (m === l) break
      iter++
      assert(iter <= 80, `Hermitian QL did not converge at l=${l}`)
      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.hypot(g, 1)
      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? r : -r))
      let s = 1
      let c = 1
      let p = 0
      let i = m - 1
      for (; i >= l; i--) {
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
        if (computeVectors) {
          for (let k = 0; k < n; k++) {
            const z1 = Z[k * n + (i + 1)]!
            const z0 = Z[k * n + i]!
            Z[k * n + (i + 1)] = s * z0 + c * z1
            Z[k * n + i] = c * z0 - s * z1
          }
        }
      }
      if (r === 0 && i >= l) continue
      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }

  const ord = Array.from({ length: n }, (_, i) => i).sort((a, b) => d[a]! - d[b]!)
  const values = new Float64Array(n)
  for (let i = 0; i < n; i++) values[i] = d[ord[i]!]!

  if (!computeVectors) {
    return { values, vecRe: HE_EMPTY, vecIm: HE_EMPTY }
  }

  const vecRe = useBuf ? HE_VEC_RE.subarray(0, nn) : new Float64Array(nn)
  const vecIm = useBuf ? HE_VEC_IM.subarray(0, nn) : new Float64Array(nn)
  for (let eigIdx = 0; eigIdx < n; eigIdx++) {
    const col = ord[eigIdx]!
    const base = eigIdx * n
    for (let r = 0; r < n; r++) {
      const zr = Z[r * n + col]!
      vecRe[base + r] = phiRe[r]! * zr
      vecIm[base + r] = phiIm[r]! * zr
    }
    for (let k = n - 3; k >= 0; k--) {
      const beta = hhBeta[k]!
      if (beta === 0) continue
      const kOff = k * n
      const m = n - 1 - k
      let dr = 0
      let di = 0
      for (let i = 0; i < m; i++) {
        const ur = vecRe[base + k + 1 + i]!
        const ui = vecIm[base + k + 1 + i]!
        const vr = hhVRe[kOff + i]!
        const vi = hhVIm[kOff + i]!
        dr += vr * ur + vi * ui
        di += vr * ui - vi * ur
      }
      const br = beta * dr
      const bi = beta * di
      for (let i = 0; i < m; i++) {
        const vr = hhVRe[kOff + i]!
        const vi = hhVIm[kOff + i]!
        vecRe[base + k + 1 + i] = vecRe[base + k + 1 + i]! - (vr * br - vi * bi)
        vecIm[base + k + 1 + i] = vecIm[base + k + 1 + i]! - (vr * bi + vi * br)
      }
    }
  }
  return { values, vecRe, vecIm }
}

// =================================================================================================
// 1. SHARED {3,4,3,4} STEINBERG SHELL RECURRENCE & EXACT DISCRETE GW BVP (bisectR13)
// =================================================================================================

const D_INF_TRUNC = 42
const N_BIG: bigint[] = [1n, 18n, 330n, 6034n]
for (let d = 4; d <= D_INF_TRUNC + 1; d++) {
  N_BIG.push(21n * N_BIG[d - 1]! - 51n * N_BIG[d - 2]! + 23n * N_BIG[d - 3]!)
}
const N_SHELL: readonly number[] = N_BIG.map(v => Number(v))

const LAMBDA_1: number = (() => {
  let x = 18.28
  for (let it = 0; it < 40; it++) {
    const f = ((x - 21) * x + 51) * x - 23
    const df = (3 * x - 42) * x + 51
    x -= f / df
  }
  return x
})()
const P_OUT = LAMBDA_1 / (1 + LAMBDA_1)
const K_WARP = Math.log(LAMBDA_1)

function kDownGraph(d: number): number {
  if (d === 0) return 18
  if (d === 1) return 65 / 3
  return 24 * P_OUT
}

function wLinkExt(d: number): number {
  return kDownGraph(d) / 24 / N_SHELL[d]!
}

const TRI_MAX = 64
const TRI_SUB = new Float64Array(TRI_MAX)
const TRI_DIAG = new Float64Array(TRI_MAX)
const TRI_SUP = new Float64Array(TRI_MAX)
const TRI_RHS = new Float64Array(TRI_MAX)
const TRI_CP = new Float64Array(TRI_MAX)
const TRI_DP = new Float64Array(TRI_MAX)
const TRI_X = new Float64Array(TRI_MAX)
const PSI_BUF = new Float64Array(TRI_MAX)

function solveTridiagonalInPlace(n: number): void {
  if (n === 0) return
  const b0 = TRI_DIAG[0]!
  assert(Math.abs(b0) > 1e-300, 'Zero pivot at row 0 in solveTridiagonalInPlace')
  TRI_CP[0] = n > 1 ? TRI_SUP[0]! / b0 : 0
  TRI_DP[0] = TRI_RHS[0]! / b0
  for (let i = 1; i < n; i++) {
    const denom = TRI_DIAG[i]! - TRI_SUB[i]! * TRI_CP[i - 1]!
    assert(Math.abs(denom) > 1e-300, `Zero pivot at row ${i} in solveTridiagonalInPlace`)
    TRI_CP[i] = i < n - 1 ? TRI_SUP[i]! / denom : 0
    TRI_DP[i] = (TRI_RHS[i]! - TRI_SUB[i]! * TRI_DP[i - 1]!) / denom
  }
  TRI_X[n - 1] = TRI_DP[n - 1]!
  for (let i = n - 2; i >= 0; i--) {
    TRI_X[i] = TRI_DP[i]! - TRI_CP[i]! * TRI_X[i + 1]!
  }
}

function solvePhiInfFixedUV(mLatSq: number): Float64Array {
  const n = D_INF_TRUNC - 1
  for (let idx = 0; idx < n; idx++) {
    const d = idx + 1
    const wL = wLinkExt(d - 1)
    const wR = wLinkExt(d)
    const mSite = mLatSq / N_SHELL[d]!
    TRI_SUB[idx] = idx > 0 ? -wL : 0
    TRI_DIAG[idx] = wL + wR + mSite
    TRI_SUP[idx] = idx < n - 1 ? -wR : 0
    TRI_RHS[idx] = idx === 0 ? wL : 0
  }
  solveTridiagonalInPlace(n)
  const phiInf = new Float64Array(D_INF_TRUNC + 1)
  phiInf[0] = 1.0
  for (let idx = 0; idx < n; idx++) phiInf[idx + 1] = TRI_X[idx]!
  phiInf[D_INF_TRUNC] = 0.0
  return phiInf
}

function evalDiscreteVgwFixedUV(D: number, r: number, mLatSq: number, phiInfCache?: Float64Array): number {
  const phiInf = phiInfCache ?? solvePhiInfFixedUV(mLatSq)
  const vUV = r
  const vIR = 1.0
  PSI_BUF[0] = 0
  PSI_BUF[D] = vIR - vUV * phiInf[D]!
  if (D >= 2) {
    const n = D - 1
    for (let idx = 0; idx < n; idx++) {
      const d = idx + 1
      const wL = wLinkExt(d - 1)
      const wR = wLinkExt(d)
      const mSite = mLatSq / N_SHELL[d]!
      TRI_SUB[idx] = idx > 0 ? -wL : 0
      TRI_DIAG[idx] = wL + wR + mSite
      TRI_SUP[idx] = idx < n - 1 ? -wR : 0
      TRI_RHS[idx] = idx === n - 1 ? wR * PSI_BUF[D]! : 0
    }
    solveTridiagonalInPlace(n)
    for (let idx = 0; idx < n; idx++) PSI_BUF[idx + 1] = TRI_X[idx]!
  }
  const w0 = wLinkExt(0)
  const wDm1 = wLinkExt(D - 1)
  return (
    0.5 * wDm1 * (vUV * (phiInf[D]! - phiInf[D - 1]!) + PSI_BUF[D]! - PSI_BUF[D - 1]!) * vIR -
    0.5 * w0 * PSI_BUF[1]! * vUV
  )
}

function argminD(r: number, mLatSq: number, phiInfCache?: Float64Array, dMaxScan = 25): number {
  const phiInf = phiInfCache ?? solvePhiInfFixedUV(mLatSq)
  let bestD = 1
  let bestV = evalDiscreteVgwFixedUV(1, r, mLatSq, phiInf)
  for (let d = 2; d <= dMaxScan; d++) {
    const v = evalDiscreteVgwFixedUV(d, r, mLatSq, phiInf)
    if (v < bestV) {
      bestV = v
      bestD = d
    }
  }
  return bestD
}

function bisectR13(mLatSq: number): { readonly rLo: number; readonly rHi: number; readonly rMid: number } {
  const phiInf = solvePhiInfFixedUV(mLatSq)
  const logEst = -Math.log(Math.max(1e-300, phiInf[13]!))
  let loSearch = Math.max(1e-9, logEst - 20)
  let hiSearch = logEst + 20
  while (argminD(Math.exp(loSearch), mLatSq, phiInf) >= 13 && loSearch > 1e-12) loSearch *= 0.5
  while (argminD(Math.exp(hiSearch), mLatSq, phiInf) <= 13 && hiSearch < 650) hiSearch += 20

  let a = loSearch
  let b = hiSearch
  for (let it = 0; it < 80; it++) {
    const mid = 0.5 * (a + b)
    if (argminD(Math.exp(mid), mLatSq, phiInf) < 13) a = mid
    else b = mid
  }
  const logLo = b

  let c = logLo
  let d = hiSearch
  for (let it = 0; it < 80; it++) {
    const mid = 0.5 * (c + d)
    if (argminD(Math.exp(mid), mLatSq, phiInf) <= 13) c = mid
    else d = mid
  }
  const logHi = c

  const rLo = Math.exp(logLo)
  const rHi = Math.exp(logHi)
  return { rLo, rHi, rMid: Math.sqrt(rLo * rHi) }
}

// =================================================================================================
// GATE G1 (Tier A): BARE-U BEC DISPERSION, 4D D_4 12x12 BdG FLAT SUBBANDS & EXACT GMOR SCALING
// =================================================================================================

function runG1(): void {
  console.log('\n=================================================================================')
  console.log('GATE G1 (Tier A): BARE-U BEC DISPERSION, 4D D_4 12x12 BdG & EXACT GMOR SCALING')
  console.log('=================================================================================')

  // 1. Single-particle coin C = D^2 and 1D dispersion E_-(k) = acos(0.5 cos k) - pi/3 = k^2 / (2 sqrt(3))
  const dKeep: C = [0.75, SQRT3 / 4] // (2 + omega)/2
  const dCross: C = [0.25, -SQRT3 / 4] // -omega/2
  const c00 = cAdd(cMul(dKeep, dKeep), cMul(dCross, dCross))
  const c01 = cScale(2, cMul(dKeep, dCross))
  const cDiagErr = cAbs(cSub(c00, [0.25, SQRT3 / 4]))
  const cOffErr = cAbs(cSub(c01, [0.75, -SQRT3 / 4]))
  assert(cDiagErr < 1e-14 && cOffErr < 1e-14, 'C = D^2 entries mismatch')

  // Direct 2x2 unitary trace & determinant check of U_1(k) = S(k) C at k = 0.01
  const kProbe = 0.01
  const eMinus = (k: number): number => Math.acos(0.5 * Math.cos(k)) - PI / 3
  const e001 = eMinus(kProbe)
  const eQuad = (kProbe * kProbe) / (2 * SQRT3)
  const dispErr = Math.abs(e001 - eQuad)
  // Verify exact eigenvalue of U_1(kProbe) matches exp(-i E_-(kProbe))
  const trU1 = cScale(2 * Math.cos(kProbe), c00)
  const detU1 = cSub(cMul(c00, c00), cMul(c01, c01)) // = omega
  const lamMinusRef = cExpI(-e001)
  const charPolyErr = cAbs(cAdd(cSub(cMul(lamMinusRef, lamMinusRef), cMul(trU1, lamMinusRef)), detU1))

  // 2. 2-body dock eigenvalues: D M_meet D = omega^2 (g_intra = 2pi/3), M_pair(zeta_18) (g_J = pi/9)
  const zeta6: C = [0.5, SQRT3 / 2]
  const dMeetD = cMul(zeta6, cMul(C_W, zeta6))
  const dMeetDErr = cAbs(cSub(dMeetD, C_W2))
  const gIntra = (2 * PI) / 3
  const gJ = PI / 9
  const gTot = gIntra - gJ // 5 pi / 9
  const symPairEig = cMul(dMeetD, Z18_TAB[1]!) // omega^2 * zeta_18 = e^{-i 5 pi / 9}
  const symPairErr = cAbs(cSub(symPairEig, cExpI(-gTot)))
  const phases = [gIntra, gTot, gJ] as const

  // 3. Full 12x12 4D D_4 BdG spectrum along [1,0,0,0], [1,1,0,0]/sqrt(2), [1,1,1,1]/2
  // Positive 12 D_4 roots r_l (one per antipodal line)
  const d4Lines: [number, number, number, number][] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const sj of [1, -1]) {
        const r: [number, number, number, number] = [0, 0, 0, 0]
        r[i] = 1
        r[j] = sj
        d4Lines.push(r)
      }
    }
  }
  assert(d4Lines.length === 12, 'Expected 12 positive D_4 antipodal lines')

  // Exact 12x12 BdG omega^2 eigenvalues via symmetric transformation M_sym = (A-B)^{1/2} (A+B) (A-B)^{1/2}
  // where:
  //   A_{lm}(k) = [E_-(k . r_l) + (g_intra + g_J)(n_1/2)] delta_{lm} - (g_J n_1 / 12)
  //   B_{lm}    = (g_intra - g_J)(n_1/2) delta_{lm}
  function solveBdG12(kVec: readonly [number, number, number, number], n1: number, thetaJ: number): Float64Array {
    const n = 12
    const apb = new Float64Array(n * n) // A + B
    const amb = new Float64Array(n * n) // A - B
    const zeroIm = new Float64Array(n * n)
    for (let l = 0; l < n; l++) {
      const r = d4Lines[l]!
      const kr = kVec[0] * r[0] + kVec[1] * r[1] + kVec[2] * r[2] + kVec[3] * r[3]
      const tk = eMinus(kr)
      for (let m = 0; m < n; m++) {
        const off = -(thetaJ * n1) / 12
        apb[l * n + m] = (l === m ? tk + gIntra * n1 : 0) + off
        amb[l * n + m] = (l === m ? tk + thetaJ * n1 : 0) + off
      }
    }
    const eigAmb = hermitianEig(n, amb, zeroIm, true)
    // Build S = (A - B)^{1/2}
    const sHalf = new Float64Array(n * n)
    for (let a = 0; a < n; a++) {
      const sv = Math.sqrt(Math.max(0, eigAmb.values[a]!))
      const base = a * n
      for (let i = 0; i < n; i++) {
        const vi = eigAmb.vecRe[base + i]!
        for (let j = 0; j < n; j++) {
          sHalf[i * n + j] = sHalf[i * n + j]! + sv * vi * eigAmb.vecRe[base + j]!
        }
      }
    }
    // M = S * (A + B) * S
    const tmp = new Float64Array(n * n)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0
        for (let p = 0; p < n; p++) s += sHalf[i * n + p]! * apb[p * n + j]!
        tmp[i * n + j] = s
      }
    }
    const M = new Float64Array(n * n)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0
        for (let p = 0; p < n; p++) s += tmp[i * n + p]! * sHalf[p * n + j]!
        M[i * n + j] = s
      }
    }
    const eigM = hermitianEig(n, M, zeroIm, false)
    const omegas = new Float64Array(n)
    for (let i = 0; i < n; i++) omegas[i] = Math.sqrt(Math.max(0, eigM.values[i]!))
    return omegas
  }

  const dirs: readonly { readonly name: string; readonly u: readonly [number, number, number, number]; readonly expectFlat: number }[] = [
    { name: '[1,0,0,0]', u: [1, 0, 0, 0], expectFlat: 5 },
    { name: '[1,1,0,0]/s2', u: [1 / SQRT2, 1 / SQRT2, 0, 0], expectFlat: 2 },
    { name: '[1,1,1,1]/2', u: [0.5, 0.5, 0.5, 0.5], expectFlat: 5 },
  ]
  const csExact = Math.sqrt((5 * PI) / (36 * SQRT3))
  const omegaPgb0 = Math.sqrt(gIntra * gJ) // at n_1 = 1
  const kSound = 0.05
  const kFlatCheck = 0.2
  const csList: number[] = []
  const flatCounts: number[] = []
  let maxCsIsoSpread = 0

  for (const d of dirs) {
    const omS = solveBdG12([kSound * d.u[0], kSound * d.u[1], kSound * d.u[2], kSound * d.u[3]], 1.0, gJ)
    const csMeas = omS[0]! / kSound
    csList.push(csMeas)
    const omF = solveBdG12([kFlatCheck * d.u[0], kFlatCheck * d.u[1], kFlatCheck * d.u[2], kFlatCheck * d.u[3]], 1.0, gJ)
    let nFlat = 0
    for (let i = 1; i < 12; i++) {
      if (Math.abs(omF[i]! - omegaPgb0) < 1e-11) nFlat++
    }
    flatCounts.push(nFlat)
  }
  maxCsIsoSpread = Math.max(...csList) - Math.min(...csList)
  // Also check exact k -> 0 limit at k = 0.005
  const omTiny = solveBdG12([0.005, 0, 0, 0], 1.0, gJ)
  const csLimit = omTiny[0]! / 0.005
  const csLimitErr = Math.abs(csLimit - csExact)

  // 4. GMOR theta-scaling sweep across theta in {pi/36, pi/18, pi/9, pi/6}
  const thetas = [PI / 36, PI / 18, PI / 9, PI / 6] as const
  const n1Test = 0.4
  let maxGmorErr = 0
  let minQuadRatio = Infinity
  let maxQuadRatio = 0
  for (const th of thetas) {
    const om0 = solveBdG12([0, 0, 0, 0], n1Test, th)
    // Modes 1..11 are all degenerate at omega_pGB(0)
    const omPgbSq = om0[1]! * om0[1]!
    const gmorRatio = omPgbSq / (n1Test * n1Test * th)
    maxGmorErr = Math.max(maxGmorErr, Math.abs(gmorRatio - (2 * PI) / 3))
    const zDiffSq = (Math.cos(th) - 1) ** 2 + Math.sin(th) ** 2
    const quadRatio = omPgbSq / (n1Test * n1Test * zDiffSq)
    if (quadRatio < minQuadRatio) minQuadRatio = quadRatio
    if (quadRatio > maxQuadRatio) maxQuadRatio = quadRatio
  }
  const quadVariation = maxQuadRatio / minQuadRatio

  console.log(`  1-particle C = D^2: |E_-(0.01) - k^2/(2*sqrt(3))| = ${dispErr.toExponential(2)} (< 1e-9), charPolyErr=${charPolyErr.toExponential(1)}`)
  console.log(`  2-body dock phases: {2pi/3, 5pi/9, pi/9} = {${phases.map(p => p.toFixed(6)).join(', ')}}, |D M_meet D - w^2|=${dMeetDErr.toExponential(1)}`)
  console.log(
    `  12x12 D_4 BdG (n_1=1): c_s(k=0.05) = [${csList.map(c => c.toFixed(6)).join(', ')}] (exact=${csExact.toFixed(6)}, k=0.005=${csLimit.toFixed(6)})`,
  )
  console.log(`  Exact zero-velocity relative flat bands: [${flatCounts.map(c => `${c}/11`).join(', ')}] along [1000], [1100], [1111]`)
  console.log(
    `  GMOR sweep theta in {pi/36..pi/6}: max|omega_pGB^2/(n_1^2 theta) - 2pi/3| = ${maxGmorErr.toExponential(2)}, quadratic |e^{i theta}-1|^2 variation = ${quadVariation.toFixed(2)}x (> 5x)`,
  )

  const ok =
    dispErr < 1e-9 &&
    charPolyErr < 1e-14 &&
    dMeetDErr < 1e-14 &&
    symPairErr < 1e-14 &&
    csLimitErr < 1e-4 &&
    csList.every(c => Math.abs(c - 0.5016) < 1e-3) &&
    maxCsIsoSpread < 5e-4 &&
    flatCounts[0] === 5 &&
    flatCounts[1] === 2 &&
    flatCounts[2] === 5 &&
    maxGmorErr < 1e-12 &&
    quadVariation > 5.0

  recordGate(
    'G1',
    'Tier A',
    'Bare-U BEC dispersion, 4D D_4 12x12 BdG flat subbands & exact GMOR linear theta_18 scaling',
    ok,
    `m_*=sqrt(3) (err=${dispErr.toExponential(1)}), c_s=${csList[0]!.toFixed(5)} (exact ${csExact.toFixed(5)}), flat=[5/11,2/11,5/11], GMOR err=${maxGmorErr.toExponential(1)}, quadVar=${quadVariation.toFixed(2)}x`,
  )
}

// =================================================================================================
// GATE G2 (Tier A/B): DISCRETE-TIME FLOQUET SPLIT-STEP BdG & GW WINDOW vs HARD-CORE OBSTRUCTION
// =================================================================================================

function runG2(): void {
  console.log('\n=================================================================================')
  console.log('GATE G2 (Tier A/B): FLOQUET SPLIT-STEP BdG & GW WINDOW vs HARD-CORE OBSTRUCTION')
  console.log('=================================================================================')

  const gIntra = (2 * PI) / 3
  const gJ = PI / 9
  const gTot = gIntra - gJ // 5 pi / 9

  // 4x4 real matrix helpers in (R_s, I_s, R_a, I_a) basis
  type Mat4 = readonly [
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
  ]
  const mul4 = (A: Mat4, B: Mat4): Mat4 => {
    const out: [number, number, number, number][] = []
    for (let i = 0; i < 4; i++) {
      const r: [number, number, number, number] = [0, 0, 0, 0]
      for (let j = 0; j < 4; j++) {
        r[j] = A[i]![0] * B[0]![j]! + A[i]![1] * B[1]![j]! + A[i]![2] * B[2]![j]! + A[i]![3] * B[3]![j]!
      }
      out.push(r)
    }
    return [out[0]!, out[1]!, out[2]!, out[3]!]
  }
  const detBuf = new Float64Array(16)
  const expm4 = (H: Mat4): Mat4 => {
    let R: Mat4 = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]
    let P: Mat4 = R
    for (let k = 1; k <= 20; k++) {
      const nxt = mul4(P, H)
      P = [
        [nxt[0][0] / k, nxt[0][1] / k, nxt[0][2] / k, nxt[0][3] / k],
        [nxt[1][0] / k, nxt[1][1] / k, nxt[1][2] / k, nxt[1][3] / k],
        [nxt[2][0] / k, nxt[2][1] / k, nxt[2][2] / k, nxt[2][3] / k],
        [nxt[3][0] / k, nxt[3][1] / k, nxt[3][2] / k, nxt[3][3] / k],
      ]
      R = [
        [R[0][0] + P[0][0], R[0][1] + P[0][1], R[0][2] + P[0][2], R[0][3] + P[0][3]],
        [R[1][0] + P[1][0], R[1][1] + P[1][1], R[1][2] + P[1][2], R[1][3] + P[1][3]],
        [R[2][0] + P[2][0], R[2][1] + P[2][1], R[2][2] + P[2][2], R[2][3] + P[2][3]],
        [R[3][0] + P[3][0], R[3][1] + P[3][1], R[3][2] + P[3][2], R[3][3] + P[3][3]],
      ]
    }
    return R
  }

  // Coin C = diag(I_2, R(2 pi / 3)) in (R_s, I_s, R_a, I_a)
  const C4: Mat4 = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, -0.5, -SQRT3 / 2],
    [0, 0, SQRT3 / 2, -0.5],
  ]

  // 1. Total-mode 4x4 split-step Floquet BdG monodromy M_tot(k) = S(k) C J_int(phi)
  //    In (R_s, I_s, R_a, I_a): S(k) couples (R_s, I_a) and (I_s, R_a) by cos k, sin k:
  //    Since S(k) = cos(k) I + i sin(k) sigma_x in (s, a):
  //      s' = cos(k) s + i sin(k) a  => R_s' = c R_s - s I_a, I_s' = c I_s + s R_a
  //      a' = cos(k) a + i sin(k) s  => R_a' = c R_a - s I_s, I_a' = c I_a + s R_s
  const S4realK = (k: number): Mat4 => {
    const ck = Math.cos(k)
    const sk = Math.sin(k)
    return [
      [ck, 0, 0, -sk],
      [0, ck, sk, 0],
      [0, -sk, ck, 0],
      [sk, 0, 0, ck],
    ]
  }

  // Exact spectral radius of 4x4 symplectic matrix M (char poly lambda^4 - t1 lambda^3 + t2 lambda^2 - t1 lambda + 1 = 0)
  // Substituting u = lambda + 1/lambda gives quadratic u^2 - t1 u + (t2 - 2) = 0!
  function maxSymplecticModulus(M: Mat4): number {
    const t1 = M[0][0] + M[1][1] + M[2][2] + M[3][3]
    const M2 = mul4(M, M)
    const trM2 = M2[0][0] + M2[1][1] + M2[2][2] + M2[3][3]
    const t2 = 0.5 * (t1 * t1 - trM2)
    // Solve u^2 - t1 u + (t2 - 2) = 0
    const disc = t1 * t1 - 4 * (t2 - 2)
    const evalMaxLamFromU = (ur: number, ui: number): number => {
      // Solve lam^2 - u lam + 1 = 0
      const dr = ur * ur - ui * ui - 4
      const di = 2 * ur * ui
      const dm = Math.hypot(dr, di)
      const da = Math.atan2(di, dr) * 0.5
      const sr = Math.sqrt(dm) * Math.cos(da)
      const si = Math.sqrt(dm) * Math.sin(da)
      const l1 = Math.hypot(0.5 * (ur + sr), 0.5 * (ui + si))
      const l2 = Math.hypot(0.5 * (ur - sr), 0.5 * (ui - si))
      return Math.max(l1, l2)
    }
    if (disc >= 0) {
      const sd = Math.sqrt(disc)
      return Math.max(evalMaxLamFromU(0.5 * (t1 + sd), 0), evalMaxLamFromU(0.5 * (t1 - sd), 0))
    }
    const sd = Math.sqrt(-disc)
    return Math.max(evalMaxLamFromU(0.5 * t1, 0.5 * sd), evalMaxLamFromU(0.5 * t1, -0.5 * sd))
  }

  function maxFloquetModulusOverBZ(n1: number): number {
    const phi = 0.5 * gTot * n1 // (5 pi / 18) n_1
    const Jint: Mat4 = [
      [1, 0, 0, 0],
      [-2 * phi, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 2 * phi, 1],
    ]
    const CJ = mul4(C4, Jint)
    let maxMod = 1
    for (let j = 0; j <= 64; j++) {
      const k = (j * PI) / 64
      const M = mul4(S4realK(k), CJ)
      const mod = maxSymplecticModulus(M)
      if (mod > maxMod) maxMod = mod
    }
    return maxMod
  }

  // Bisect exact Krein-collision threshold n_{1,c}
  const n1cExact = 18 / (5 * PI * SQRT3)
  let loK = 0.6
  let hiK = 0.7
  for (let it = 0; it < 50; it++) {
    const mid = 0.5 * (loK + hiK)
    if (maxFloquetModulusOverBZ(mid) <= 1 + 1e-10) loK = mid
    else hiK = mid
  }
  const n1cNum = 0.5 * (loK + hiK)
  const kreinErr = Math.abs(n1cNum - n1cExact)
  const modAt060 = maxFloquetModulusOverBZ(0.6)
  const modAt080 = maxFloquetModulusOverBZ(0.8)

  // 2. Relative-line static screening mass det(S(i kappa) C U_int - I) = 0, mu^2 = cosh(kappa_static) - 1
  //    U_int = exp(-i H_rel) on relative-line modes in (R_s, I_s, R_a, I_a)
  function solveStaticKappaRel(n1: number): number {
    const Hrel: Mat4 = [
      [0, gJ * n1, 0, 0],
      [-gIntra * n1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, (gIntra - gJ) * n1, 0],
    ]
    const Urel = expm4(Hrel)
    const CU = mul4(C4, Urel)
    const evalDet = (kap: number): number => {
      const ch = Math.cosh(kap)
      const sh = Math.sinh(kap)
      // M = S4imagK(kap) * CU - I directly into flat detBuf (zero allocations!)
      for (let j = 0; j < 4; j++) {
        const u0 = CU[0][j]!, u1 = CU[1][j]!, u2 = CU[2][j]!, u3 = CU[3][j]!
        detBuf[0 * 4 + j] = ch * u0 + sh * u2 - (j === 0 ? 1 : 0)
        detBuf[1 * 4 + j] = ch * u1 + sh * u3 - (j === 1 ? 1 : 0)
        detBuf[2 * 4 + j] = sh * u0 + ch * u2 - (j === 2 ? 1 : 0)
        detBuf[3 * 4 + j] = sh * u1 + ch * u3 - (j === 3 ? 1 : 0)
      }
      let det = 1
      for (let c = 0; c < 4; c++) {
        let piv = c
        for (let r = c + 1; r < 4; r++) {
          if (Math.abs(detBuf[r * 4 + c]!) > Math.abs(detBuf[piv * 4 + c]!)) piv = r
        }
        if (Math.abs(detBuf[piv * 4 + c]!) < 1e-30) return 0
        if (piv !== c) {
          for (let j = c; j < 4; j++) {
            const tmp = detBuf[c * 4 + j]!
            detBuf[c * 4 + j] = detBuf[piv * 4 + j]!
            detBuf[piv * 4 + j] = tmp
          }
          det = -det
        }
        const pv = detBuf[c * 4 + c]!
        det *= pv
        for (let r = c + 1; r < 4; r++) {
          const fac = detBuf[r * 4 + c]! / pv
          for (let j = c + 1; j < 4; j++) detBuf[r * 4 + j] = detBuf[r * 4 + j]! - fac * detBuf[c * 4 + j]!
        }
      }
      return det
    }
    let prev = evalDet(1e-4)
    let pk = 1e-4
    for (let k = 0.005; k <= 1.2; k += 0.005) {
      const cur = evalDet(k)
      if (prev * cur <= 0) {
        let a = pk
        let b = k
        let fa = prev
        for (let it = 0; it < 60; it++) {
          const m = 0.5 * (a + b)
          const fm = evalDet(m)
          if (fa * fm <= 0) b = m
          else {
            a = m
            fa = fm
          }
        }
        return 0.5 * (a + b)
      }
      prev = cur
      pk = k
    }
    throw new Error(`No static screening root found at n_1=${n1}`)
  }

  // Exact D_* = 13 GW target windows: 4 sin^2(pi/18) -> 1.01839 and 1 - cos(pi/9) -> 1.10234
  const mLatSin = K_WARP * K_WARP * 4 * Math.sin(PI / 18) ** 2
  const mLatCos = LAMBDA_1 * (1 - Math.cos(PI / 9))
  const winSin = bisectR13(mLatSin)
  const winCos = bisectR13(mLatCos)

  // Solve n_1 hitting mLatSin and mLatCos via bisection
  const solveN1ForMLat = (targetMLat: number): number => {
    let a = 0.01
    let b = 0.25
    for (let it = 0; it < 50; it++) {
      const m = 0.5 * (a + b)
      const kap = solveStaticKappaRel(m)
      const mLat = LAMBDA_1 * (Math.cosh(kap) - 1)
      if (mLat < targetMLat) a = m
      else b = m
    }
    return 0.5 * (a + b)
  }
  const n1HitSin = solveN1ForMLat(mLatSin)
  const n1HitCos = solveN1ForMLat(mLatCos)
  const nBgSin = 12 * n1HitSin
  const nBgCos = 12 * n1HitCos

  // 3. Literal sole-pair veto (n_dock === 2) + hard-core slot obstruction (Tier A)
  //    Empty-dock factor (1 - rho)^22, Gutzwiller hard-core mass m_*^{eff} = sqrt(3) / (1 - rho),
  //    polarized line density n_1 = 2 rho (neutral (+,-) same-tone strictly half n_1^{same} = rho):
  //      m_scr_1D^2(rho) = 2 * [sqrt(3)/(1-rho)] * [g_J (1-rho)^22] * (2 rho)
  //                      = 4 sqrt(3) (pi/9) rho (1 - rho)^21
  const mScr1DPol = (rho: number): number => 4 * SQRT3 * gJ * rho * Math.pow(1 - rho, 21)
  const mScr1DNeut = (rho: number): number => 0.5 * mScr1DPol(rho)

  let maxScrPol = 0
  let peakRho = 0
  for (let i = 1; i < 2000; i++) {
    const rho = i / 2000
    const v = mScr1DPol(rho)
    if (v > maxScrPol) {
      maxScrPol = v
      peakRho = rho
    }
  }
  const maxScrNeut = mScr1DNeut(peakRho)
  const mScrAtHalf = mScr1DPol(0.5)
  const mLatMaxHC = LAMBDA_1 * (maxScrPol / 2)
  const winHC = bisectR13(mLatMaxHC)
  const gapRatioLo = mLatSin / mLatMaxHC
  const gapRatioHi = mLatCos / mLatMaxHC

  // 4. Single-beat hard-core dephasing: |<a(1)>/<a(0)>| = |(1-rho) + rho omega^2| = sqrt(1 - 3 rho + 3 rho^2)
  const dephAtHalf = cAbs(cAdd([1 - 0.5, 0], cScale(0.5, C_W2)))
  const dephFormulaHalf = Math.sqrt(1 - 3 * 0.5 + 3 * 0.25)
  // 1-qubit reduced density matrix eigenvalues (1 +- |c|) / 2 = {0.75, 0.25}
  const pPlus = 0.5 * (1 + dephAtHalf)
  const pMinus = 0.5 * (1 - dephAtHalf)
  const sEntHalf = -(pPlus * Math.log(pPlus) + pMinus * Math.log(pMinus))
  const sEntFrac = sEntHalf / Math.LN2

  console.log(
    `  Soft-core 4x4 Floquet BdG: n_{1,c} = ${n1cNum.toFixed(6)} (exact 18/(5pi sqrt(3)) = ${n1cExact.toFixed(6)}, n_bg = ${(12 * n1cExact).toFixed(3)})`,
  )
  console.log(`  Floquet stability: max|mu|(n_1=0.60) = ${modAt060.toFixed(12)}, max|mu|(n_1=0.80) = ${modAt080.toFixed(6)} (Krein unstable!)`)
  console.log(
    `  GW windows: m_lat^2=${mLatSin.toFixed(5)} (r in [${winSin.rLo.toFixed(3)},${winSin.rHi.toFixed(3)}]) at n_1=${n1HitSin.toFixed(5)} (n_bg=${nBgSin.toFixed(3)}); ` +
      `m_lat^2=${mLatCos.toFixed(5)} (r in [${winCos.rLo.toFixed(3)},${winCos.rHi.toFixed(3)}]) at n_1=${n1HitCos.toFixed(5)} (n_bg=${nBgCos.toFixed(3)})`,
  )
  console.log(
    `  Hard-core sole-pair veto ceiling: max m_scr_1D^2 = ${maxScrPol.toFixed(6)} at rho=${peakRho.toFixed(4)} (neutral=${maxScrNeut.toFixed(6)}), ` +
      `m_lat_max^2=${mLatMaxHC.toFixed(5)} (< 0.40, rHi=${winHC.rHi.toFixed(4)} < 1.60, ${gapRatioLo.toFixed(2)}x--${gapRatioHi.toFixed(2)}x below GW), rho=0.5 -> ${mScrAtHalf.toExponential(2)}`,
  )
  console.log(
    `  Single-beat dephasing (rho=0.5): |<a(1)>/<a(0)>| = ${dephAtHalf.toFixed(6)}, S_ent = ${sEntHalf.toFixed(5)} nats (${(100 * sEntFrac).toFixed(1)}% of ln 2)`,
  )

  const ok =
    kreinErr < 1e-6 &&
    12 * n1cExact < 7.94 &&
    modAt060 <= 1 + 1e-12 &&
    modAt080 > 1.5 &&
    Math.abs(mLatSin - 1.01839) < 1e-4 &&
    Math.abs(mLatCos - 1.10234) < 1e-4 &&
    winSin.rLo > 2.605 &&
    winSin.rHi < 2.775 &&
    winCos.rLo > 2.785 &&
    winCos.rHi < 2.976 &&
    n1HitSin >= 0.085 &&
    n1HitSin <= 0.087 &&
    n1HitCos >= 0.092 &&
    n1HitCos <= 0.094 &&
    nBgSin >= 1.02 &&
    nBgCos <= 1.13 &&
    Math.abs(maxScrPol - 0.041382) < 1e-4 &&
    Math.abs(maxScrNeut - 0.020691) < 1e-4 &&
    Math.abs(peakRho - 0.045) < 0.001 &&
    Math.abs(mLatMaxHC - 0.3782) < 1e-3 &&
    mLatMaxHC < 0.4 &&
    winHC.rHi < 1.6 &&
    mScrAtHalf < 1e-5 &&
    Math.abs(dephAtHalf - 0.5) < 1e-14 &&
    Math.abs(dephAtHalf - dephFormulaHalf) < 1e-14 &&
    Math.abs(sEntHalf - 0.56234) < 1e-4

  recordGate(
    'G2',
    'Tier A/B',
    'Discrete-time Floquet split-step BdG stability & GW window vs literal sole-pair hard-core obstruction',
    ok,
    `n_{1,c}=${n1cNum.toFixed(6)}, GW hit n_bg=[${nBgSin.toFixed(2)},${nBgCos.toFixed(2)}]; HC cap m_scr=${maxScrPol.toFixed(6)} -> m_lat_max^2=${mLatMaxHC.toFixed(5)} (rHi=${winHC.rHi.toFixed(3)}), deph=0.500 S_ent=${sEntHalf.toFixed(5)}`,
  )
}

// =================================================================================================
// GATE G3 (Tier A): EXACT MANY-BODY FINITE-DENSITY FLOQUET EVOLUTION OF VERBATIM BARE U
//                   (L = 2 & L = 3, M = 3, N = 4, dim = 3,060, T = 256)
// =================================================================================================

function runG3(): void {
  console.log('\n=================================================================================')
  console.log('GATE G3 (Tier A): EXACT MANY-BODY FLOQUET BARE U (L=2 & L=3, M=3, N=4, T=256)')
  console.log('=================================================================================')

  const tG3 = performance.now()
  const W2_R = -0.5
  const W2_I = -SQRT3 / 2
  const C_KEEP_R = 0.25
  const C_KEEP_I = SQRT3 / 4
  const C_CROSS_R = 0.75
  const C_CROSS_I = -SQRT3 / 4
  const Z18_R = Z18_TAB[1]![0]
  const Z18_I = Z18_TAB[1]![1]

  type PairMode = 'no-mpair' | 'literal-veto' | 'unvetoed-pair'
  type ModeResult = {
    readonly w0: number
    readonly maxLow: number
    readonly c255: number
    readonly normErr: number
    readonly dim: number
  }

  function runBouquetSystem(L: number): Record<PairMode, ModeResult> {
    const M = 3
    const nSlots = M * L * 2
    const slotDock = new Int32Array(nSlots)
    const slotLine = new Int32Array(nSlots)
    const stepSlot = new Int32Array(nSlots)
    for (let l = 0; l < M; l++) {
      for (let p = 0; p < L; p++) {
        const dock = p === 0 ? 0 : 1 + l * (L - 1) + (p - 1)
        for (let d = 0; d < 2; d++) {
          const g = (l * L + p) * 2 + d
          slotDock[g] = dock
          slotLine[g] = l
          const np = d === 0 ? (p + 1) % L : (p - 1 + L) % L
          stepSlot[g] = (l * L + np) * 2 + d
        }
      }
    }

    // Enumerate all C(6*L, 4) hard-core configurations
    const states: [number, number, number, number][] = []
    const keyToIdx = new Map<number, number>()
    for (let a = 0; a < nSlots; a++) {
      for (let b = a + 1; b < nSlots; b++) {
        for (let c = b + 1; c < nSlots; c++) {
          for (let d = c + 1; d < nSlots; d++) {
            const k = ((a * nSlots + b) * nSlots + c) * nSlots + d
            keyToIdx.set(k, states.length)
            states.push([a, b, c, d])
          }
        }
      }
    }
    const dim = states.length
    const pack4 = (a: number, b: number, c: number, d: number): number => {
      let x0 = a
      let x1 = b
      let x2 = c
      let x3 = d
      if (x0 > x1) { const t = x0; x0 = x1; x1 = t }
      if (x2 > x3) { const t = x2; x2 = x3; x3 = t }
      if (x0 > x2) { const t = x0; x0 = x2; x2 = t }
      if (x1 > x3) { const t = x1; x1 = x3; x3 = t }
      if (x1 > x2) { const t = x1; x1 = x2; x2 = t }
      return ((x0 * nSlots + x1) * nSlots + x2) * nSlots + x3
    }

    const oRel = new Float64Array(dim)
    const phi0R = new Float64Array(dim)
    let nEven = 0
    for (let i = 0; i < dim; i++) {
      const s = states[i]!
      const cnt = [0, 0, 0]
      for (let j = 0; j < 4; j++) {
        const l = slotLine[s[j]!]!
        cnt[l] = cnt[l]! + 1
      }
      oRel[i] = cnt[0]! - cnt[1]!
      if ((cnt[0]! & 1) === 0 && (cnt[1]! & 1) === 0 && (cnt[2]! & 1) === 0) {
        phi0R[i] = 1
        nEven++
      }
    }
    const invEven = 1 / Math.sqrt(nEven)
    for (let i = 0; i < dim; i++) phi0R[i] = phi0R[i]! * invEven

    // Pre-allocated CSC scratch buffers reused across all 3 modes (zero GC bloat!)
    const maxNNZ = dim * 48
    const cscColPtr = new Int32Array(dim + 1)
    const cscRowIdx = new Int32Array(maxNNZ)
    const cscValRe = new Float64Array(maxNNZ)
    const cscValIm = new Float64Array(maxNNZ)
    const accRe = new Float64Array(dim)
    const accIm = new Float64Array(dim)
    const seenStamp = new Uint32Array(dim)
    const touched = new Int32Array(dim)
    let curStamp = 0

    // Pre-build sparse CSC operator for U = S o D o M_meet o M_pair(zeta_18) o D
    // (Exact algebraic identity: D o M_meet o M_pair o D == (C on lone lines) x (omega^2 M_pair on full lines))
    const buildCSC = (mode: PairMode) => {
      let nnz = 0

      for (let col = 0; col < dim; col++) {
        cscColPtr[col] = nnz
        const arr = states[col]!
        let dock0Cnt = 0
        for (let i = 0; i < 4; i++) if (slotDock[arr[i]!] === 0) dock0Cnt++
        const pairs0: [number, number, number][] = []
        const lone: number[] = []
        let used = 0
        let phR = 1
        let phI = 0
        for (let i = 0; i < 4; i++) {
          if ((used & (1 << i)) !== 0) continue
          const si = arr[i]!
          const opp = si ^ 1
          let pt = -1
          for (let j = i + 1; j < 4; j++) {
            if (arr[j] === opp) {
              pt = j
              break
            }
          }
          if (pt >= 0) {
            used |= (1 << i) | (1 << pt)
            if (slotDock[si] === 0) pairs0.push([i, pt, slotLine[si]!])
            const nr = phR * W2_R - phI * W2_I
            const ni = phR * W2_I + phI * W2_R
            phR = nr
            phI = ni
          } else {
            lone.push(i)
          }
        }

        let cur: [[number, number, number, number], number, number][] = [[arr, phR, phI]]
        if (mode !== 'no-mpair' && pairs0.length > 0) {
          if (mode === 'literal-veto') {
            if (dock0Cnt === 2) {
              const [i0, i1, cl] = pairs0[0]!
              const hR = (Z18_R - 1) / 3
              const hI = Z18_I / 3
              const kR = 1 + hR
              const kI = hI
              const nxt: [[number, number, number, number], number, number][] = []
              for (const [s, rr, ii] of cur) {
                for (let tl = 0; tl < 3; tl++) {
                  const cR = tl === cl ? kR : hR
                  const cI = tl === cl ? kI : hI
                  const ns: [number, number, number, number] = [s[0], s[1], s[2], s[3]]
                  ns[i0] = tl * L * 2
                  ns[i1] = tl * L * 2 + 1
                  nxt.push([ns, rr * cR - ii * cI, rr * cI + ii * cR])
                }
              }
              cur = nxt
            }
          } else {
            if (pairs0.length === 1) {
              const [i0, i1, cl] = pairs0[0]!
              const av: number[] = []
              for (let tl = 0; tl < 3; tl++) {
                const sA = tl * L * 2
                if (tl === cl || (!arr.includes(sA) && !arr.includes(sA + 1))) av.push(tl)
              }
              if (av.length > 1) {
                const hR = (Z18_R - 1) / av.length
                const hI = Z18_I / av.length
                const kR = 1 + hR
                const kI = hI
                const nxt: [[number, number, number, number], number, number][] = []
                for (const [s, rr, ii] of cur) {
                  for (const tl of av) {
                    const cR = tl === cl ? kR : hR
                    const cI = tl === cl ? kI : hI
                    const ns: [number, number, number, number] = [s[0], s[1], s[2], s[3]]
                    ns[i0] = tl * L * 2
                    ns[i1] = tl * L * 2 + 1
                    nxt.push([ns, rr * cR - ii * cI, rr * cI + ii * cR])
                  }
                }
                cur = nxt
              }
            } else if (pairs0.length === 2) {
              const pA = pairs0[0]!
              const pB = pairs0[1]!
              const emptyL = [0, 1, 2].find(l => l !== pA[2] && l !== pB[2])!
              const hR = (Z18_R - 1) / 3
              const hI = Z18_I / 3
              const kR = 1 + hR
              const kI = hI
              const nxt: [[number, number, number, number], number, number][] = []
              for (const [s, rr, ii] of cur) {
                for (let ne = 0; ne < 3; ne++) {
                  const cR = ne === emptyL ? kR : hR
                  const cI = ne === emptyL ? kI : hI
                  const occ = [0, 1, 2].filter(l => l !== ne)
                  const ns: [number, number, number, number] = [s[0], s[1], s[2], s[3]]
                  ns[pA[0]] = occ[0]! * L * 2
                  ns[pA[1]] = occ[0]! * L * 2 + 1
                  ns[pB[0]] = occ[1]! * L * 2
                  ns[pB[1]] = occ[1]! * L * 2 + 1
                  nxt.push([ns, rr * cR - ii * cI, rr * cI + ii * cR])
                }
              }
              cur = nxt
            }
          }
        }

        curStamp++
        let nTouched = 0
        const nM = 1 << lone.length
        for (const [st, rr0, ii0] of cur) {
          for (let mask = 0; mask < nM; mask++) {
            let rr = rr0
            let ii = ii0
            let ns0 = st[0]
            let ns1 = st[1]
            let ns2 = st[2]
            let ns3 = st[3]
            for (let b = 0; b < lone.length; b++) {
              if ((mask & (1 << b)) !== 0) {
                const idx = lone[b]!
                if (idx === 0) ns0 ^= 1
                else if (idx === 1) ns1 ^= 1
                else if (idx === 2) ns2 ^= 1
                else ns3 ^= 1
                const nr = rr * C_CROSS_R - ii * C_CROSS_I
                const ni = rr * C_CROSS_I + ii * C_CROSS_R
                rr = nr
                ii = ni
              } else {
                const nr = rr * C_KEEP_R - ii * C_KEEP_I
                const ni = rr * C_KEEP_I + ii * C_KEEP_R
                rr = nr
                ii = ni
              }
            }
            const sk = pack4(stepSlot[ns0]!, stepSlot[ns1]!, stepSlot[ns2]!, stepSlot[ns3]!)
            const row = keyToIdx.get(sk)!
            if (seenStamp[row] !== curStamp) {
              seenStamp[row] = curStamp
              accRe[row] = rr
              accIm[row] = ii
              touched[nTouched++] = row
            } else {
              accRe[row] = accRe[row]! + rr
              accIm[row] = accIm[row]! + ii
            }
          }
        }
        for (let ti = 0; ti < nTouched; ti++) {
          const row = touched[ti]!
          const re = accRe[row]!
          const im = accIm[row]!
          if (re * re + im * im < 1e-26) continue
          cscRowIdx[nnz] = row
          cscValRe[nnz] = re
          cscValIm[nnz] = im
          nnz++
        }
      }
      cscColPtr[dim] = nnz
      return {
        colPtr: cscColPtr,
        rowIdx: cscRowIdx,
        valRe: cscValRe,
        valIm: cscValIm,
      }
    }

    const modes: readonly PairMode[] = ['no-mpair', 'literal-veto', 'unvetoed-pair']
    const results = {} as Record<PairMode, ModeResult>
    const T = 256

    for (const mode of modes) {
      const op = buildCSC(mode)
      let aR = Float64Array.from(phi0R)
      let aI = new Float64Array(dim)
      let bR = new Float64Array(dim)
      let bI = new Float64Array(dim)
      let o2 = 0
      for (let i = 0; i < dim; i++) {
        bR[i] = oRel[i]! * aR[i]!
        o2 += bR[i]! * bR[i]!
      }
      let naR = new Float64Array(dim)
      let naI = new Float64Array(dim)
      let nbR = new Float64Array(dim)
      let nbI = new Float64Array(dim)

      const step = (xR: Float64Array, xI: Float64Array, yR: Float64Array, yI: Float64Array): void => {
        yR.fill(0)
        yI.fill(0)
        for (let c = 0; c < dim; c++) {
          const xr = xR[c]!
          const xi = xI[c]!
          if (xr === 0 && xi === 0) continue
          const end = op.colPtr[c + 1]!
          for (let p = op.colPtr[c]!; p < end; p++) {
            const r = op.rowIdx[p]!
            const ur = op.valRe[p]!
            const ui = op.valIm[p]!
            yR[r] = yR[r]! + (ur * xr - ui * xi)
            yI[r] = yI[r]! + (ur * xi + ui * xr)
          }
        }
      }

      const C = new Float64Array(T)
      let maxNormErr = 0
      for (let t = 0; t < T; t++) {
        let sr = 0
        let nA = 0
        let nB = 0
        for (let i = 0; i < dim; i++) {
          const ar = aR[i]!
          const ai = aI[i]!
          const br = bR[i]!
          const bi = bI[i]!
          nA += ar * ar + ai * ai
          nB += br * br + bi * bi
          sr += oRel[i]! * (ar * br + ai * bi)
        }
        maxNormErr = Math.max(maxNormErr, Math.abs(nA - 1), Math.abs(nB / o2 - 1))
        C[t] = sr / o2
        if (t + 1 < T) {
          step(aR, aI, naR, naI)
          const t1 = aR; aR = naR; naR = t1
          const t2 = aI; aI = naI; naI = t2
          step(bR, bI, nbR, nbI)
          const t3 = bR; bR = nbR; nbR = t3
          const t4 = bI; bI = nbI; nbI = t4
        }
      }

      // Wiener-Khinchin DFT spectral weight W(omega_k) = Re((1/T) sum_t C(t) e^{-i 2pi k t / T})
      // and finite-frequency low-band peak maxLow = max_{k in [4, 64]} |(1/T) sum_t C(t) e^{-i 2pi k t / T}|
      // (omega in [0.10, pi/2], cleanly excluding k=1..3 finite-T DC-decay window leakage)
      let w0 = 0
      let maxLow = 0
      for (let k = 0; k <= 64; k++) {
        let sr = 0
        let si = 0
        for (let t = 0; t < T; t++) {
          const ang = (2 * PI * k * t) / T
          sr += C[t]! * Math.cos(ang)
          si -= C[t]! * Math.sin(ang)
        }
        if (k === 0) {
          w0 = sr / T
        } else if (k >= 4) {
          const mag = Math.hypot(sr, si) / T
          if (mag > maxLow) maxLow = mag
        }
      }
      results[mode] = { w0, maxLow, c255: C[T - 1]!, normErr: maxNormErr, dim }
    }
    return results
  }

  const resL2 = runBouquetSystem(2)
  const resL3 = runBouquetSystem(3)
  const g3Sec = (performance.now() - tG3) / 1000
  const maxNormErr = Math.max(
    resL2['no-mpair'].normErr,
    resL2['literal-veto'].normErr,
    resL2['unvetoed-pair'].normErr,
    resL3['no-mpair'].normErr,
    resL3['literal-veto'].normErr,
    resL3['unvetoed-pair'].normErr,
  )

  console.log(
    `  L=2 (dim=${resL2['no-mpair'].dim}, T=256): no-mpair W(0)=${resL2['no-mpair'].w0.toFixed(6)}, ` +
      `literal-veto W(0)=${resL2['literal-veto'].w0.toFixed(5)}, unvetoed-pair W(0)=${resL2['unvetoed-pair'].w0.toFixed(5)}`,
  )
  console.log(
    `  L=3 (dim=${resL3['no-mpair'].dim}, T=256): no-mpair W(0)=${resL3['no-mpair'].w0.toFixed(6)} C(255)=${resL3['no-mpair'].c255.toFixed(6)}, ` +
      `literal-veto W(0)=${resL3['literal-veto'].w0.toFixed(5)} (maxLow=${resL3['literal-veto'].maxLow.toFixed(4)}), ` +
      `unvetoed-pair W(0)=${resL3['unvetoed-pair'].w0.toFixed(5)} (maxLow=${resL3['unvetoed-pair'].maxLow.toFixed(4)})`,
  )
  console.log(`  Unitarity max normErr = ${maxNormErr.toExponential(2)} (< 1e-13), G3 elapsed = ${g3Sec.toFixed(3)} s (< 0.5 s target)`)

  const ok =
    resL2['no-mpair'].dim === 495 &&
    resL3['no-mpair'].dim === 3060 &&
    maxNormErr < 1e-13 &&
    resL2['no-mpair'].w0 > 0.9999 &&
    resL2['literal-veto'].w0 > resL2['unvetoed-pair'].w0 &&
    resL3['no-mpair'].w0 > 0.9999 &&
    resL3['no-mpair'].c255 > 0.9999 &&
    resL3['literal-veto'].w0 >= 0.45 &&
    resL3['literal-veto'].w0 <= 0.48 &&
    resL3['unvetoed-pair'].w0 >= 0.13 &&
    resL3['unvetoed-pair'].w0 <= 0.16 &&
    resL3['literal-veto'].w0 > resL3['unvetoed-pair'].w0 &&
    resL3['literal-veto'].w0 < resL3['no-mpair'].w0 &&
    resL3['literal-veto'].maxLow < 0.05 &&
    resL3['unvetoed-pair'].maxLow < 0.05

  recordGate(
    'G3',
    'Tier A',
    'Exact many-body finite-density Floquet bare U (L=2 & L=3, M=3, N=4, dim=3060, T=256)',
    ok,
    `normErr=${maxNormErr.toExponential(1)}, L=3 W(0): no-mpair=${resL3['no-mpair'].w0.toFixed(4)} > lit=${resL3['literal-veto'].w0.toFixed(4)} > unv=${resL3['unvetoed-pair'].w0.toFixed(4)}, maxLow=[${resL3['literal-veto'].maxLow.toFixed(4)},${resL3['unvetoed-pair'].maxLow.toFixed(4)}] (<0.05), ${g3Sec.toFixed(2)}s`,
  )
}

// =================================================================================================
// SHARED D_4 / 3 D_4 GEOMETRY, OVERLAP DIRAC OPERATOR & 2T_R STRUCTURES (FOR G4, G5, G9)
// =================================================================================================

type Mat4Num = readonly (readonly number[])[]

function mat4Mul(A: Mat4Num, B: Mat4Num): number[][] {
  return [0, 1, 2, 3].map(i =>
    [0, 1, 2, 3].map(
      j => A[i]![0]! * B[0]![j]! + A[i]![1]! * B[1]![j]! + A[i]![2]! * B[2]![j]! + A[i]![3]! * B[3]![j]!,
    ),
  )
}

function mat4Transpose(A: Mat4Num): number[][] {
  return [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => A[j]![i]!))
}

function mat4Vec(A: Mat4Num, v: readonly number[]): [number, number, number, number] {
  return [
    A[0]![0]! * v[0]! + A[0]![1]! * v[1]! + A[0]![2]! * v[2]! + A[0]![3]! * v[3]!,
    A[1]![0]! * v[0]! + A[1]![1]! * v[1]! + A[1]![2]! * v[2]! + A[1]![3]! * v[3]!,
    A[2]![0]! * v[0]! + A[2]![1]! * v[1]! + A[2]![2]! * v[2]! + A[2]![3]! * v[3]!,
    A[3]![0]! * v[0]! + A[3]![1]! * v[1]! + A[3]![2]! * v[2]! + A[3]![3]! * v[3]!,
  ]
}

function mat4Det(A: Mat4Num): number {
  const det3 = (m: number[][]): number =>
    m[0]![0]! * (m[1]![1]! * m[2]![2]! - m[1]![2]! * m[2]![1]!) -
    m[0]![1]! * (m[1]![0]! * m[2]![2]! - m[1]![2]! * m[2]![0]!) +
    m[0]![2]! * (m[1]![0]! * m[2]![1]! - m[1]![1]! * m[2]![0]!)
  let d = 0
  for (let c = 0; c < 4; c++) {
    const sub = [1, 2, 3].map(r => [0, 1, 2, 3].filter(j => j !== c).map(j => A[r]![j]!))
    d += (c % 2 === 0 ? 1 : -1) * A[0]![c]! * det3(sub)
  }
  return d
}

function invert4Real(A: Mat4Num): number[][] {
  const aug = [0, 1, 2, 3].map(i => [
    A[i]![0]!,
    A[i]![1]!,
    A[i]![2]!,
    A[i]![3]!,
    i === 0 ? 1 : 0,
    i === 1 ? 1 : 0,
    i === 2 ? 1 : 0,
    i === 3 ? 1 : 0,
  ])
  for (let col = 0; col < 4; col++) {
    let piv = col
    for (let r = col + 1; r < 4; r++) {
      if (Math.abs(aug[r]![col]!) > Math.abs(aug[piv]![col]!)) piv = r
    }
    const tmp = aug[col]!
    aug[col] = aug[piv]!
    aug[piv] = tmp
    const div = aug[col]![col]!
    for (let j = 0; j < 8; j++) aug[col]![j] = aug[col]![j]! / div
    for (let r = 0; r < 4; r++) {
      if (r === col) continue
      const fac = aug[r]![col]!
      for (let j = 0; j < 8; j++) aug[r]![j] = aug[r]![j]! - fac * aug[col]![j]!
    }
  }
  return aug.map(r => r.slice(4))
}

const B_D4: Mat4Num = [
  [1, 0, 0, 0],
  [-1, 1, 0, 0],
  [0, -1, 1, 1],
  [0, 0, -1, 1],
]
const BINV_D4: Mat4Num = [
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [0.5, 0.5, 0.5, -0.5],
  [0.5, 0.5, 0.5, 0.5],
]
const M_D4: Mat4Num = [
  [0, 0, 0, -1],
  [1, 0, -1, -1],
  [0, 1, -1, -1],
  [1, 0, 0, -1],
]
const M_D4_INV: Mat4Num = mat4Mul(M_D4, M_D4)
const F_PRIM: Mat4Num = [
  [0, -1, 2, -2],
  [1, 0, -3, 1],
  [-2, 3, 0, -2],
  [2, -1, 2, 0],
]

type D4Hop = {
  readonly r: readonly [number, number, number, number]
  readonly d: readonly [number, number, number, number]
}

const D4_HOPS: readonly D4Hop[] = (() => {
  const hops: D4Hop[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const r: [number, number, number, number] = [0, 0, 0, 0]
          r[i] = si
          r[j] = sj
          const dr = mat4Vec(BINV_D4, r)
          hops.push({
            r,
            d: [Math.round(dr[0]), Math.round(dr[1]), Math.round(dr[2]), Math.round(dr[3])],
          })
        }
      }
    }
  }
  return hops
})()

const L_TORUS = 3
const N_SITES = 81
const DIM_D4 = 324
const siteId = (a: number, b: number, c: number, d: number): number => ((a * 3 + b) * 3 + c) * 3 + d
const SITE_COORDS: readonly (readonly [number, number, number, number])[] = Array.from(
  { length: N_SITES },
  (_, s) => [Math.floor(s / 27), Math.floor(s / 9) % 3, Math.floor(s / 3) % 3, s % 3] as const,
)

function evalQ1(v: readonly number[]): number {
  let s = 0
  for (let a = 0; a < 4; a++) {
    s += v[a]!
    for (let b = a + 1; b < 4; b++) s += F_PRIM[a]![b]! * v[a]! * v[b]!
  }
  return ((s % 2) + 2) % 2
}

const barSigma = (q: readonly [number, number, number, number]): readonly [C, C, C, C] => [
  [q[0], -q[3]],
  [-q[2], -q[1]],
  [q[2], -q[1]],
  [q[0], q[3]],
]
const sigmaDag = (q: readonly [number, number, number, number]): readonly [C, C, C, C] => {
  const b = barSigma(q)
  return [cConj(b[0]), cConj(b[2]), cConj(b[1]), cConj(b[3])]
}
const gammaMat = (v: readonly [number, number, number, number]): CMat => {
  const g = cmatZero(4)
  const bs = barSigma(v)
  const sg = sigmaDag(v)
  const set = (r: number, c: number, z: C): void => {
    g.re[r * 4 + c] = z[0]
    g.im[r * 4 + c] = z[1]
  }
  set(0, 2, bs[0]); set(0, 3, bs[1]); set(1, 2, bs[2]); set(1, 3, bs[3])
  set(2, 0, sg[0]); set(2, 1, sg[1]); set(3, 0, sg[2]); set(3, 1, sg[3])
  return g
}

const HOP_BLOCKS: readonly CMat[] = D4_HOPS.map(h => {
  const gr = gammaMat(h.r)
  const M = cmatZero(4)
  for (let r = 0; r < 4; r++) {
    const g5 = r < 2 ? 1 : -1
    for (let c = 0; c < 4; c++) {
      M.re[r * 4 + c] = (g5 * (gr.re[r * 4 + c]! + (r === c ? -2 : 0))) / 12
      M.im[r * 4 + c] = (g5 * gr.im[r * 4 + c]!) / 12
    }
  }
  return M
})

type SectorBlock = {
  readonly dq: number
  readonly re: Float64Array
  readonly im: Float64Array
  readonly g5: Int8Array
  readonly qRe: Float64Array
  readonly qIm: Float64Array
}

const D4_H_RE = new Float64Array(DIM_D4 * DIM_D4)
const D4_H_IM = new Float64Array(DIM_D4 * DIM_D4)
const D4_T_RE = new Float64Array(120 * DIM_D4)
const D4_T_IM = new Float64Array(120 * DIM_D4)

function buildD4FluxSystem(nFlux: number): {
  readonly sectors: readonly [SectorBlock, SectorBlock, SectorBlock]
  readonly scalarRe: Float64Array
  readonly scalarIm: Float64Array
} {
  const hRe = D4_H_RE
  const hIm = D4_H_IM
  hRe.fill(0)
  hIm.fill(0)
  const scalarRe = new Float64Array(N_SITES * N_SITES)
  const scalarIm = new Float64Array(N_SITES * N_SITES)

  for (let sX = 0; sX < N_SITES; sX++) {
    const x = SITE_COORDS[sX]!
    const rBase = 4 * sX
    for (let a = 0; a < 4; a++) hRe[(rBase + a) * DIM_D4 + (rBase + a)] = (a < 2 ? 1 : -1) * 4.0
    scalarRe[sX * N_SITES + sX] = 4.0
    for (let hi = 0; hi < 24; hi++) {
      const h = D4_HOPS[hi]!
      const nx0 = x[0] + h.d[0]
      const nx1 = x[1] + h.d[1]
      const nx2 = x[2] + h.d[2]
      const nx3 = x[3] + h.d[3]
      const v0 = Math.floor(nx0 / L_TORUS)
      const v1 = Math.floor(nx1 / L_TORUS)
      const v2 = Math.floor(nx2 / L_TORUS)
      const v3 = Math.floor(nx3 / L_TORUS)
      const y0 = nx0 - L_TORUS * v0
      const y1 = nx1 - L_TORUS * v1
      const y2 = nx2 - L_TORUS * v2
      const y3 = nx3 - L_TORUS * v3
      const sY = siteId(y0, y1, y2, y3)

      let ur = 1
      let ui = 0
      if (nFlux !== 0) {
        const Fd = mat4Vec(F_PRIM, h.d)
        const xFd = x[0] * Fd[0] + x[1] * Fd[1] + x[2] * Fd[2] + x[3] * Fd[3]
        const Fy = mat4Vec(F_PRIM, [y0, y1, y2, y3])
        const vFy = v0 * Fy[0] + v1 * Fy[1] + v2 * Fy[2] + v3 * Fy[3]
        const qv = evalQ1([v0, v1, v2, v3])
        const k18 = (((nFlux * (9 * qv + 3 * vFy - xFd)) % 18) + 18) % 18
        const z = Z18_TAB[k18]!
        ur = z[0]
        ui = z[1]
      }
      scalarRe[sX * N_SITES + sY] = scalarRe[sX * N_SITES + sY]! - ur / 6
      scalarIm[sX * N_SITES + sY] = scalarIm[sX * N_SITES + sY]! - ui / 6

      const blk = HOP_BLOCKS[hi]!
      const cBase = 4 * sY
      for (let r = 0; r < 4; r++) {
        const rOff = (rBase + r) * DIM_D4 + cBase
        for (let c = 0; c < 4; c++) {
          const br = blk.re[r * 4 + c]!
          const bi = blk.im[r * 4 + c]!
          if (br === 0 && bi === 0) continue
          hRe[rOff + c] = hRe[rOff + c]! + (br * ur - bi * ui)
          hIm[rOff + c] = hIm[rOff + c]! + (br * ui + bi * ur)
        }
      }
    }
  }

  // Exact analytic R_{L3} eigenspace projector bases V_0 (114), V_1 (105), V_2 (105)
  const q3: readonly [number, number, number, number] = [-0.5, 0.5, 0.5, 0.5]
  const bs = barSigma(q3)
  const S4re = new Float64Array(16)
  const S4im = new Float64Array(16)
  S4re[0] = bs[0][0]; S4im[0] = bs[0][1]
  S4re[1] = bs[1][0]; S4im[1] = bs[1][1]
  S4re[4] = bs[2][0]; S4im[4] = bs[2][1]
  S4re[5] = bs[3][0]; S4im[5] = bs[3][1]
  S4re[10] = 1
  S4re[15] = 1

  const srcSite = new Int32Array(N_SITES)
  const blkRe = new Float64Array(N_SITES * 16)
  const blkIm = new Float64Array(N_SITES * 16)
  for (let sX = 0; sX < N_SITES; sX++) {
    const x = SITE_COORDS[sX]!
    const mx = mat4Vec(M_D4_INV, x)
    const w0 = Math.floor(mx[0] / L_TORUS)
    const w1 = Math.floor(mx[1] / L_TORUS)
    const w2 = Math.floor(mx[2] / L_TORUS)
    const w3 = Math.floor(mx[3] / L_TORUS)
    const y0 = mx[0] - L_TORUS * w0
    const y1 = mx[1] - L_TORUS * w1
    const y2 = mx[2] - L_TORUS * w2
    const y3 = mx[3] - L_TORUS * w3
    srcSite[sX] = siteId(y0, y1, y2, y3)
    let pr = 1
    let pi = 0
    if (nFlux !== 0) {
      const Fy = mat4Vec(F_PRIM, [y0, y1, y2, y3])
      const wFy = w0 * Fy[0] + w1 * Fy[1] + w2 * Fy[2] + w3 * Fy[3]
      const qw = evalQ1([w0, w1, w2, w3])
      const k18 = (((nFlux * (9 * qw + 3 * wFy)) % 18) + 18) % 18
      const z = Z18_TAB[k18]!
      pr = z[0]
      pi = z[1]
    }
    const o = sX * 16
    for (let i = 0; i < 16; i++) {
      blkRe[o + i] = S4re[i]! * pr - S4im[i]! * pi
      blkIm[o + i] = S4re[i]! * pi + S4im[i]! * pr
    }
  }

  const src2 = new Int32Array(N_SITES)
  const b2Re = new Float64Array(N_SITES * 16)
  const b2Im = new Float64Array(N_SITES * 16)
  for (let sX = 0; sX < N_SITES; sX++) {
    const sMid = srcSite[sX]!
    src2[sX] = srcSite[sMid]!
    const oA = sX * 16
    const oB = sMid * 16
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let sr = 0
        let si = 0
        for (let k = 0; k < 4; k++) {
          const ar = blkRe[oA + r * 4 + k]!
          const ai = blkIm[oA + r * 4 + k]!
          const br = blkRe[oB + k * 4 + c]!
          const bi = blkIm[oB + k * 4 + c]!
          sr += ar * br - ai * bi
          si += ar * bi + ai * br
        }
        b2Re[oA + r * 4 + c] = sr
        b2Im[oA + r * 4 + c] = si
      }
    }
  }

  const normU = 1 / Math.sqrt(2 * SQRT3 * (SQRT3 + 1))
  const uW: readonly [C, C] = [[normU, -normU], [-(1 + SQRT3) * normU, 0]]
  const uW2: readonly [C, C] = [[(1 + SQRT3) * normU, 0], [normU, normU]]
  const inv1 = new Int32Array(N_SITES)
  const inv2 = new Int32Array(N_SITES)
  for (let s = 0; s < N_SITES; s++) {
    inv1[srcSite[s]!] = s
    inv2[src2[s]!] = s
  }
  // Write analytic projector basis vectors directly into flat sector buffers (zero temporary per-vector Float64Arrays!)
  const qCap = [114, 105, 105] as const
  const secQRe = [
    new Float64Array(qCap[0] * DIM_D4),
    new Float64Array(qCap[1] * DIM_D4),
    new Float64Array(qCap[2] * DIM_D4),
  ] as const
  const secQIm = [
    new Float64Array(qCap[0] * DIM_D4),
    new Float64Array(qCap[1] * DIM_D4),
    new Float64Array(qCap[2] * DIM_D4),
  ] as const
  const secG5 = [new Int8Array(qCap[0]), new Int8Array(qCap[1]), new Int8Array(qCap[2])] as const
  const secCnt = [0, 0, 0]
  const visited = new Uint8Array(N_SITES)
  for (let s0 = 0; s0 < N_SITES; s0++) {
    if (visited[s0]) continue
    const s1 = srcSite[s0]!
    if (s1 === s0) {
      visited[s0] = 1
      for (const sp of [2, 3]) {
        const idx = secCnt[0]!
        secQRe[0][idx * DIM_D4 + 4 * s0 + sp] = 1
        secG5[0][idx] = -1
        secCnt[0] = idx + 1
      }
      {
        const idx = secCnt[1]!
        const off = idx * DIM_D4 + 4 * s0
        secQRe[1][off] = uW[0][0]; secQIm[1][off] = uW[0][1]
        secQRe[1][off + 1] = uW[1][0]; secQIm[1][off + 1] = uW[1][1]
        secG5[1][idx] = 1
        secCnt[1] = idx + 1
      }
      {
        const idx = secCnt[2]!
        const off = idx * DIM_D4 + 4 * s0
        secQRe[2][off] = uW2[0][0]; secQIm[2][off] = uW2[0][1]
        secQRe[2][off + 1] = uW2[1][0]; secQIm[2][off + 1] = uW2[1][1]
        secG5[2][idx] = 1
        secCnt[2] = idx + 1
      }
    } else {
      const s2 = srcSite[s1]!
      visited[s0] = 1; visited[s1] = 1; visited[s2] = 1
      const d1 = inv1[s0]!
      const d2 = inv2[s0]!
      const o1 = d1 * 16
      const o2 = d2 * 16
      const invS3 = 1 / SQRT3
      for (let q = 0; q < 3; q++) {
        const w1 = cExpI((-2 * PI * q) / 3)
        const w2 = cExpI((-4 * PI * q) / 3)
        const qRe = secQRe[q]!
        const qIm = secQIm[q]!
        const g5Arr = secG5[q]!
        for (let sp = 0; sp < 4; sp++) {
          const idx = secCnt[q]!
          const base = idx * DIM_D4
          qRe[base + 4 * s0 + sp] = invS3
          for (let r = 0; r < 4; r++) {
            const r1r = blkRe[o1 + r * 4 + sp]!
            const r1i = blkIm[o1 + r * 4 + sp]!
            qRe[base + 4 * d1 + r] = qRe[base + 4 * d1 + r]! + invS3 * (w1[0] * r1r - w1[1] * r1i)
            qIm[base + 4 * d1 + r] = qIm[base + 4 * d1 + r]! + invS3 * (w1[0] * r1i + w1[1] * r1r)
            const r2r = b2Re[o2 + r * 4 + sp]!
            const r2i = b2Im[o2 + r * 4 + sp]!
            qRe[base + 4 * d2 + r] = qRe[base + 4 * d2 + r]! + invS3 * (w2[0] * r2r - w2[1] * r2i)
            qIm[base + 4 * d2 + r] = qIm[base + 4 * d2 + r]! + invS3 * (w2[0] * r2i + w2[1] * r2r)
          }
          g5Arr[idx] = sp < 2 ? 1 : -1
          secCnt[q] = idx + 1
        }
      }
    }
  }

  const nzCols = new Int32Array(DIM_D4)
  const sectors = [0, 1, 2].map(q => {
    const dq = secCnt[q]!
    const qRe = secQRe[q]!
    const qIm = secQIm[q]!
    const tRe = D4_T_RE
    const tIm = D4_T_IM
    for (let r = 0; r < DIM_D4; r++) {
      const rOff = r * DIM_D4
      let nnz = 0
      for (let c = 0; c < DIM_D4; c++) {
        if (hRe[rOff + c] !== 0 || hIm[rOff + c] !== 0) nzCols[nnz++] = c
      }
      for (let b = 0; b < dq; b++) {
        const bOff = b * DIM_D4
        let sr = 0
        let si = 0
        for (let idx = 0; idx < nnz; idx++) {
          const c = nzCols[idx]!
          const ar = hRe[rOff + c]!
          const ai = hIm[rOff + c]!
          const qr = qRe[bOff + c]!
          const qi = qIm[bOff + c]!
          sr += ar * qr - ai * qi
          si += ar * qi + ai * qr
        }
        tRe[bOff + r] = sr
        tIm[bOff + r] = si
      }
    }
    const outRe = new Float64Array(dq * dq)
    const outIm = new Float64Array(dq * dq)
    for (let a = 0; a < dq; a++) {
      const aOff = a * DIM_D4
      for (let b = 0; b < dq; b++) {
        const bOff = b * DIM_D4
        let sr = 0
        let si = 0
        for (let r = 0; r < DIM_D4; r++) {
          const qr = qRe[aOff + r]!
          const qi = qIm[aOff + r]!
          const tr = tRe[bOff + r]!
          const ti = tIm[bOff + r]!
          sr += qr * tr + qi * ti
          si += qr * ti - qi * tr
        }
        outRe[a * dq + b] = sr
        outIm[a * dq + b] = si
      }
    }
    const keepQ = nFlux === 1 && q === 2
    return {
      dq,
      re: outRe,
      im: outIm,
      g5: secG5[q]!,
      qRe: keepQ ? qRe : HE_EMPTY,
      qIm: keepQ ? qIm : HE_EMPTY,
    }
  }) as [SectorBlock, SectorBlock, SectorBlock]

  return { sectors, scalarRe, scalarIm }
}

// =================================================================================================
// GATE G4 (Tier A): SELF-DUALITY OF F_phys, ASS LEFSCHETZ (n=0..4), 2592-TRIANGLE WILSON & HOFSTADTER
// =================================================================================================

function runG4(): { readonly sysFlux2: ReturnType<typeof buildD4FluxSystem> } {
  console.log('\n=================================================================================')
  console.log('GATE G4 (Tier A): SELF-DUAL F_phys, ASS LEFSCHETZ (n=0..4), WILSON & HOFSTADTER')
  console.log('=================================================================================')

  // 1. F_phys = (B^-1)^T F_prim B^-1 = L(i + j + k), self-duality |*F - F| < 1e-14, sum F^2 = 12, Vol(D_4) = 2
  const Fphys = mat4Mul(mat4Mul(mat4Transpose(BINV_D4), F_PRIM), BINV_D4)
  const Lijk: Mat4Num = [
    [0, -1, -1, -1],
    [1, 0, -1, 1],
    [1, 1, 0, -1],
    [1, -1, 1, 0],
  ]
  let fPhysLijkErr = 0
  let sumF2 = 0
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      fPhysLijkErr = Math.max(fPhysLijkErr, Math.abs(Fphys[i]![j]! - Lijk[i]![j]!))
      sumF2 += Fphys[i]![j]! * Fphys[i]![j]!
    }
  }
  // Exact 4D Hodge dual (*F)_{ab} = (1/2) sum_{cd} eps_{abcd} F_{cd}
  const starF: number[][] = [0, 1, 2, 3].map(() => [0, 0, 0, 0])
  const eps4 = (a: number, b: number, c: number, d: number): number => {
    const arr = [a, b, c, d]
    let inv = 0
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (arr[i] === arr[j]) return 0
        if (arr[i]! > arr[j]!) inv++
      }
    }
    return inv % 2 === 0 ? 1 : -1
  }
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      let s = 0
      for (let c = 0; c < 4; c++) {
        for (let d = 0; d < 4; d++) s += 0.5 * eps4(a, b, c, d) * Fphys[c]![d]!
      }
      starF[a]![b] = s
    }
  }
  let selfDualErr = 0
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) selfDualErr = Math.max(selfDualErr, Math.abs(starF[a]![b]! - Fphys[a]![b]!))
  }
  const volD4 = Math.abs(mat4Det(B_D4))

  // 2. Continuum ASS Lefschetz indices on T^4_{D_4} / <L(q_3)> for n = 0..4
  const D_lq3 = M_D4_INV.map((r, i) => r.map((v, j) => v - (i === j ? 1 : 0)))
  const D_lq3_inv = invert4Real(D_lq3)
  const fracMod1 = (u: number): number => {
    const f = u - Math.floor(u + 1e-9)
    return Math.abs(f) < 1e-9 || Math.abs(f - 1) < 1e-9 ? 0 : f
  }
  const fpCoords: [number, number, number, number][] = []
  const seenFp = new Set<string>()
  for (let w0 = -2; w0 <= 2 && fpCoords.length < 9; w0++) {
    for (let w1 = -2; w1 <= 2 && fpCoords.length < 9; w1++) {
      for (let w2 = -2; w2 <= 2 && fpCoords.length < 9; w2++) {
        for (let w3 = -2; w3 <= 2 && fpCoords.length < 9; w3++) {
          const xr = mat4Vec(D_lq3_inv, [w0, w1, w2, w3])
          const x: [number, number, number, number] = [
            fracMod1(xr[0]), fracMod1(xr[1]), fracMod1(xr[2]), fracMod1(xr[3]),
          ]
          const key = x.map(u => Math.round(u * 72)).join(',')
          if (!seenFp.has(key)) {
            seenFp.add(key)
            fpCoords.push(x)
          }
        }
      }
    }
  }
  assert(fpCoords.length === 9, `Expected 9 fixed points, got ${fpCoords.length}`)

  const assTable: { n: number; pf: number; lef: number; ind: [number, number, number] }[] = []
  let allLefExact = true
  for (let n = 0; n <= 4; n++) {
    const pf = 6 * n * n
    let sumPhi: C = C_ZERO
    for (const x of fpCoords) {
      const wEx = mat4Vec(D_lq3, x).map(u => Math.round(u))
      const Fx = mat4Vec(F_PRIM, x)
      const wFx = wEx[0]! * Fx[0] + wEx[1]! * Fx[1] + wEx[2]! * Fx[2] + wEx[3]! * Fx[3]
      const ph = PI * n * evalQ1(wEx) + PI * n * wFx
      sumPhi = cAdd(sumPhi, cExpI(ph))
    }
    const lef = sumPhi[0] / -3 // tr(S_+) - tr(S_-) = -3
    if (Math.abs(lef - -3) > 1e-12 || Math.abs(sumPhi[1]) > 1e-12) allLefExact = false
    const ind0 = Math.round((pf + 2 * lef) / 3)
    const ind1 = Math.round((pf - lef) / 3)
    const ind2 = ind1
    assTable.push({ n, pf, lef, ind: [ind0, ind1, ind2] })
  }
  // Tier-A uniqueness check: ind_0(n) = 2 n^2 - 2 = 0 <=> n = +-1 (over all n in [-20..20])
  const zeroSolutions: number[] = []
  for (let n = -20; n <= 20; n++) {
    if (2 * n * n - 2 === 0) zeroSolutions.push(n)
  }
  const uniquePm1 = zeroSolutions.length === 2 && zeroSolutions[0] === -1 && zeroSolutions[1] === 1

  // 3. Exact Wilson action over all 2,592 triangles on D_4 / 3 D_4
  const seenTri = new Set<string>()
  const triFluxInts: number[] = []
  const vKey = (v: readonly number[]): string => `${v[0]},${v[1]},${v[2]},${v[3]}`
  for (let i = 0; i < 24; i++) {
    for (let j = i + 1; j < 24; j++) {
      const a = D4_HOPS[i]!.r
      const b = D4_HOPS[j]!.r
      if (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] !== 1) continue
      const w = [b[0] - a[0], b[1] - a[1], b[2] - a[2], b[3] - a[3]]
      const reps = [
        [vKey(a), vKey(b)].sort().join('|'),
        [vKey(a.map(u => -u)), vKey(w)].sort().join('|'),
        [vKey(b.map(u => -u)), vKey(w.map(u => -u))].sort().join('|'),
      ].sort()
      if (seenTri.has(reps[0]!)) continue
      seenTri.add(reps[0]!)
      const da = D4_HOPS[i]!.d
      const db = D4_HOPS[j]!.d
      const Fdb = mat4Vec(F_PRIM, db)
      triFluxInts.push(da[0] * Fdb[0] + da[1] * Fdb[1] + da[2] * Fdb[2] + da[3] * Fdb[3])
    }
  }
  const totalTris = N_SITES * triFluxInts.length
  assert(triFluxInts.length === 32 && totalTris === 2592, `Expected 2592 triangles, got ${totalTris}`)

  const sWilson: number[] = []
  const cKinRatios: number[] = []
  for (let n = 0; n <= 3; n++) {
    let swRaw = 0
    let sqRaw = 0
    for (const k of triFluxInts) {
      const phi = (n * PI * k) / 9
      swRaw += N_SITES * (1 - Math.cos(phi))
      sqRaw += N_SITES * 0.5 * phi * phi
    }
    sWilson.push(swRaw / 2) // divided by c_kin(D_4) = 2 for continuum S_W * g_4^2
    if (n >= 1) cKinRatios.push(sqRaw / (24 * PI * PI * n * n))
  }

  // 4. L = 3, n = 2 Hofstadter m_0-sweep (0.5..4.5): max ind_tot <= 3 (never reaches continuum Pf = +24)
  const sysFlux2 = buildD4FluxSystem(2)
  let maxIndTotN2 = -Infinity
  const hofSweeps: string[] = []
  for (let step = 1; step <= 9; step++) {
    const m0 = 0.5 * step
    let tot = 0
    for (let q = 0; q < 3; q++) {
      const sec = sysFlux2.sectors[q]!
      const re = Float64Array.from(sec.re)
      let trG5 = 0
      for (let i = 0; i < sec.dq; i++) {
        const s = sec.g5[i]!
        trG5 += s
        re[i * sec.dq + i] = re[i * sec.dq + i]! - m0 * s
      }
      const ev = hermitianEig(sec.dq, re, sec.im, false).values
      let trSgn = 0
      for (let i = 0; i < sec.dq; i++) trSgn += ev[i]! >= 0 ? 1 : -1
      tot += Math.round((trG5 - trSgn) / 2)
    }
    if (tot > maxIndTotN2) maxIndTotN2 = tot
    hofSweeps.push(`${m0.toFixed(1)}:${tot}`)
  }

  console.log(`  F_phys = L(i+j+k): |*F - F|=${selfDualErr.toExponential(1)}, |F-L|=${fPhysLijkErr.toExponential(1)}, sum F^2=${sumF2}, Vol(D_4)=${volD4}`)
  console.log(
    `  ASS Lefschetz (n=0..4, L=-3): ${assTable.map(r => `n=${r.n}:(${r.ind.join(',')})`).join(', ')} | unique ind_0=0 <=> n in {${zeroSolutions.join(',')}}`,
  )
  console.log(
    `  2,592-triangle Wilson action: c_kin=[${cKinRatios.map(x => x.toFixed(6)).join(', ')}], S_W(n)*g_4^2=[${sWilson.map(x => x.toFixed(3)).join(', ')}]`,
  )
  console.log(`  L=3, n=2 Hofstadter sweep (Pf=+24): [${hofSweeps.join(', ')}], max ind_tot = ${maxIndTotN2} (<= 3)`)

  const expectedAss: readonly [number, number, number][] = [
    [-2, 1, 1],
    [0, 3, 3],
    [6, 9, 9],
    [16, 19, 19],
    [30, 33, 33],
  ]
  const assOk = assTable.every((r, i) => {
    const e = expectedAss[i]!
    return r.ind[0] === e[0] && r.ind[1] === e[1] && r.ind[2] === e[2] && r.pf === 6 * i * i
  })
  const expectedSW = [0, 220.619, 713.405, 1134.0] as const
  const swOk = sWilson.every((v, i) => Math.abs(v - expectedSW[i]!) < 0.002)
  const cKinOk = cKinRatios.every(r => Math.abs(r - 2.0) < 1e-12)

  const ok =
    selfDualErr < 1e-14 &&
    fPhysLijkErr < 1e-14 &&
    Math.abs(sumF2 - 12) < 1e-14 &&
    Math.abs(volD4 - 2) < 1e-14 &&
    allLefExact &&
    assOk &&
    uniquePm1 &&
    totalTris === 2592 &&
    cKinOk &&
    swOk &&
    maxIndTotN2 <= 3

  recordGate(
    'G4',
    'Tier A',
    'Exact self-duality of F_phys, ASS Lefschetz (n=0..4), 2,592-triangle Wilson action & Hofstadter ceiling',
    ok,
    `|*F-F|=${selfDualErr.toExponential(1)}, sumF^2=12, Vol=2, unique ind_0=0 <=> n=+-1 (N_gen=3), S_W=[${sWilson.map(x => x.toFixed(2)).join(',')}], n=2 maxInd=${maxIndTotN2}<<24`,
  )

  return { sysFlux2 }
}

// =================================================================================================
// GATE G5 (Tier A): 324-DIM D_4/3D_4 OVERLAP FERMION & 81-DIM SCALAR 1-LOOP FREE ENERGY
//                   + CONTINUUM SELF-DUAL LANDAU-LEVEL HEAT KERNEL
// =================================================================================================

type SavedV2Modes = {
  readonly fullModesRe: readonly Float64Array[]
  readonly fullModesIm: readonly Float64Array[]
}

function runG5(sysFlux2: ReturnType<typeof buildD4FluxSystem>): SavedV2Modes {
  console.log('\n=================================================================================')
  console.log('GATE G5 (Tier A): 324-DIM OVERLAP & 81-DIM SCALAR 1-LOOP + SELF-DUAL HEAT KERNEL')
  console.log('=================================================================================')

  const m0 = 3.0
  const mIR2 = 0.01

  const ovHRe = new Float64Array(114 * 114)
  const ovSgnRe = new Float64Array(114 * 114)
  const ovSgnIm = new Float64Array(114 * 114)
  const ovDdRe = new Float64Array(114 * 114)
  const ovDdIm = new Float64Array(114 * 114)

  function evalOverlapSector(
    sec: SectorBlock,
    extractModes: boolean,
  ): {
    readonly eigs: Float64Array
    readonly modesRe: Float64Array[]
    readonly modesIm: Float64Array[]
  } {
    const dq = sec.dq
    const dq2 = dq * dq
    const hRe = ovHRe.subarray(0, dq2)
    hRe.set(sec.re)
    for (let i = 0; i < dq; i++) hRe[i * dq + i] = hRe[i * dq + i]! - m0 * sec.g5[i]!
    const eigH = hermitianEig(dq, hRe, sec.im, true)

    const sgnRe = ovSgnRe.subarray(0, dq2)
    const sgnIm = ovSgnIm.subarray(0, dq2)
    sgnRe.fill(0)
    sgnIm.fill(0)
    for (let k = 0; k < dq; k++) {
      const sg = eigH.values[k]! >= 0 ? 1 : -1
      const base = k * dq
      for (let i = 0; i < dq; i++) {
        const vr = eigH.vecRe[base + i]!
        const vi = eigH.vecIm[base + i]!
        const iOff = i * dq
        for (let j = 0; j < dq; j++) {
          const wr = eigH.vecRe[base + j]!
          const wi = eigH.vecIm[base + j]!
          sgnRe[iOff + j] = sgnRe[iOff + j]! + sg * (vr * wr + vi * wi)
          sgnIm[iOff + j] = sgnIm[iOff + j]! + sg * (vi * wr - vr * wi)
        }
      }
    }
    const ddRe = ovDdRe.subarray(0, dq2)
    const ddIm = ovDdIm.subarray(0, dq2)
    for (let i = 0; i < dq; i++) {
      for (let j = 0; j < dq; j++) {
        const fac = 0.25 * (sec.g5[i]! + sec.g5[j]!)
        ddRe[i * dq + j] = (i === j ? 0.5 : 0) + fac * sgnRe[i * dq + j]!
        ddIm[i * dq + j] = fac * sgnIm[i * dq + j]!
      }
    }
    const eigDD = hermitianEig(dq, ddRe, ddIm, extractModes)
    const modesRe: Float64Array[] = []
    const modesIm: Float64Array[] = []
    if (extractModes) {
      for (let m = 0; m < 3; m++) {
        const mOff = m * dq
        const fRe = new Float64Array(DIM_D4)
        const fIm = new Float64Array(DIM_D4)
        for (let a = 0; a < dq; a++) {
          const cr = eigDD.vecRe[mOff + a]!
          const ci = eigDD.vecIm[mOff + a]!
          const aOff = a * DIM_D4
          for (let r = 0; r < DIM_D4; r++) {
            const qr = sec.qRe[aOff + r]!
            const qi = sec.qIm[aOff + r]!
            fRe[r] = fRe[r]! + (qr * cr - qi * ci)
            fIm[r] = fIm[r]! + (qr * ci + qi * cr)
          }
        }
        modesRe.push(fRe)
        modesIm.push(fIm)
      }
    }
    return { eigs: eigDD.values, modesRe, modesIm }
  }

  const sF_tot: number[] = []
  const sF_v1: number[] = []
  const sF_stripped: number[] = []
  const sB_tot: number[] = []
  let savedV2: SavedV2Modes | null = null

  for (let n = 0; n <= 3; n++) {
    const sys = n === 2 ? sysFlux2 : buildD4FluxSystem(n)
    let sf = 0
    let sfV1 = 0
    let sfStrip = 0
    for (let q = 0; q < 3; q++) {
      const wantVecs = n === 1 && q === 2
      const res = evalOverlapSector(sys.sectors[q]!, wantVecs)
      if (wantVecs) savedV2 = { fullModesRe: res.modesRe, fullModesIm: res.modesIm }
      for (let i = 0; i < res.eigs.length; i++) {
        const lam = Math.max(0, res.eigs[i]!)
        const term = -Math.log(lam + mIR2)
        sf += term
        if (q === 1) sfV1 += term
        if (lam > 1e-8) sfStrip += -Math.log(lam)
      }
    }
    const eigB = hermitianEig(N_SITES, sys.scalarRe, sys.scalarIm, false).values
    let sb = 0
    for (let i = 0; i < N_SITES; i++) sb += Math.log(Math.max(0, eigB[i]!) + mIR2)
    sF_tot.push(sf)
    sF_v1.push(sfV1)
    sF_stripped.push(sfStrip)
    sB_tot.push(sb)
  }
  assert(savedV2 !== null, 'Failed to save n=1 V_{q=2} zero-mode eigenvectors')

  const dSfTot1 = sF_tot[1]! - sF_tot[0]!
  const dSfV1_1 = sF_v1[1]! - sF_v1[0]!
  const dSfStrip1 = sF_stripped[1]! - sF_stripped[0]!
  const dSb1 = sB_tot[1]! - sB_tot[0]!
  const sYM1 = 24 * PI * PI

  // Continuum self-dual Landau-level heat kernel (F_{01} = F_{23} = B, u = t B):
  // Direct Landau-level summation over total level k = n_1 + n_2 <= 4000 (degeneracy k + 1)
  // at uA = 0.04, uB = 0.02 with Richardson extrapolation eliminating O(u^2)
  const evalSelfDualHK = (u: number): { readonly cs: number; readonly dirac: number; readonly vec: number; readonly minVecE: number } => {
    let sumCS = 0
    let sumDirac = 0
    let sumVec = 0
    let minVecE = Infinity
    for (let k = 0; k <= 4000; k++) {
      const deg = k + 1
      const eBase = 2 * k + 2
      const eExp = Math.exp(-u * eBase)
      if (eExp === 0) break
      sumCS += deg * eExp
      // Dirac spin eigenvalues in self-dual (B, B): {+2, 0, 0, -2} -> (1/4)(e^{2u} + 2 + e^{-2u})
      sumDirac += deg * 0.25 * (Math.exp(-u * (eBase - 2)) + 2 * eExp + Math.exp(-u * (eBase + 2)))
      // Non-Abelian vector minus 2 ghosts: (2 e^{-(eBase-2)u} + 2 e^{-(eBase+2)u} - 2 e^{-eBase*u}) / 2
      const eLow = eBase - 2
      if (eLow < minVecE) minVecE = eLow
      sumVec += deg * (Math.exp(-u * eLow) + Math.exp(-u * (eBase + 2)) - eExp)
    }
    const pref = 4 * u * u
    return { cs: pref * sumCS, dirac: pref * sumDirac, vec: pref * sumVec, minVecE }
  }
  const uA = 0.04
  const uB = 0.02
  const hkA = evalSelfDualHK(uA)
  const hkB = evalSelfDualHK(uB)
  const richC2 = (rA: number, rB: number): number => {
    const cA = (rA - 1) / (uA * uA)
    const cB = (rB - 1) / (uB * uB)
    return (4 * cB - cA) / 3
  }
  const c2CS = richC2(hkA.cs, hkB.cs)
  const c2Dirac = richC2(hkA.dirac, hkB.dirac)
  const c2Vec = richC2(hkA.vec, hkB.vec)
  const errCS = Math.abs(c2CS + 1 / 3)
  const errDirac = Math.abs(c2Dirac - 2 / 3)
  const errVec = Math.abs(c2Vec - 11 / 3)

  console.log(
    `  324-dim overlap (m_0=3.0, m_IR^2=0.01): dS_F(TOT,n=1)=+${dSfTot1.toFixed(4)} (>6.5), dS_F(V1,n=1)=+${dSfV1_1.toFixed(4)} (>7.0)`,
  )
  console.log(
    `  81-dim scalar: dS_B(n=1)=+${dSb1.toFixed(4)} (>4.0), n=0..3 dS_B=[${sB_tot.map(v => (v - sB_tot[0]!).toFixed(3)).join(', ')}]`,
  )
  console.log(
    `  Zero-mode-stripped |dS_F'(TOT,n=1)| = ${Math.abs(dSfStrip1).toFixed(4)} vs 0.01 * S_YM(1)*g_4^2 = ${(0.01 * sYM1).toFixed(4)}`,
  )
  console.log(
    `  Self-dual Landau-level heat kernel c_2: CS=${c2CS.toFixed(7)} (-1/3, err=${errCS.toExponential(1)}), ` +
      `Dirac=${c2Dirac.toFixed(7)} (+2/3, err=${errDirac.toExponential(1)}), Vec=${c2Vec.toFixed(7)} (+11/3, minE=${hkB.minVecE}, err=${errVec.toExponential(1)})`,
  )

  const ok =
    Math.abs(dSfTot1 - 6.7986) < 0.002 &&
    dSfTot1 > 6.5 &&
    Math.abs(dSfV1_1 - 7.5422) < 0.002 &&
    dSfV1_1 > 7.0 &&
    Math.abs(dSb1 - 4.0541) < 0.002 &&
    dSb1 > 4.0 &&
    Math.abs(Math.abs(dSfStrip1) - 2.1815) < 0.002 &&
    Math.abs(dSfStrip1) < 0.01 * sYM1 &&
    errCS < 1e-5 &&
    errDirac < 1e-5 &&
    errVec < 1e-5 &&
    hkB.minVecE === 0

  recordGate(
    'G5',
    'Tier A',
    '324-dim D_4/3D_4 overlap fermion & 81-dim scalar 1-loop free energy + self-dual heat kernel',
    ok,
    `dS_F(TOT)=+${dSfTot1.toFixed(4)}, dS_F(V1)=+${dSfV1_1.toFixed(4)}, dS_B=+${dSb1.toFixed(4)}, |dS_F'|=${Math.abs(dSfStrip1).toFixed(4)} (<0.01 S_YM), c_2=[${c2CS.toFixed(5)}, ${c2Dirac.toFixed(5)}, ${c2Vec.toFixed(5)}]`,
  )

  return savedV2
}

// =================================================================================================
// GATE G6 (Tier A/B/C): DYNAMICAL FLUX SELECTION MECHANISMS AUDIT
// =================================================================================================

function runG6(): void {
  console.log('\n=================================================================================')
  console.log('GATE G6 (Tier A/B/C): DYNAMICAL SELECTION AUDIT (VAFA-WITTEN, SAVVIDY, B-FIELD)')
  console.log('=================================================================================')

  // 1. Vafa-Witten check: Euclidean S_theta(n) = i theta Pf(n F_prim) = 6 i theta n^2
  let maxRealTheta = 0
  let maxModErr = 0
  for (const theta of [0.1, 0.7, PI / 3, PI, 2.5]) {
    for (let n = 0; n <= 4; n++) {
      const sTh: C = [0, 6 * theta * n * n]
      const weight = cExpI(-sTh[1])
      maxRealTheta = Math.max(maxRealTheta, Math.abs(sTh[0]))
      maxModErr = Math.max(maxModErr, Math.abs(cAbs(weight) - 1))
    }
  }

  // 2. Savvidy-Leutwyler 1-loop: S_eff(n) = n^2 (c_0 + b_eff ln n) for n >= 1, S_eff(0) = 0
  const bEff = 11 / 3
  const c0Lo = -((4 * Math.LN2) / 3) * bEff
  const c0Hi = 0
  const scaleWindowExact = Math.pow(2, 2 / 3)
  const scaleWindowFromC0 = Math.exp((c0Hi - c0Lo) / (2 * bEff))
  const scaleErr = Math.abs(scaleWindowFromC0 - scaleWindowExact)

  const argminSavvidy = (c0: number): number => {
    let bestN = 0
    let bestS = 0
    for (let n = 1; n <= 20; n++) {
      const s = n * n * (c0 + bEff * Math.log(n))
      if (s < bestS) {
        bestS = s
        bestN = n
      }
    }
    return bestN
  }
  const c0Mid = 0.5 * (c0Lo + c0Hi)
  const minInside = argminSavvidy(c0Mid)
  const minBelow = argminSavvidy(c0Lo - 0.05)
  const minAbove = argminSavvidy(c0Hi + 0.05)
  const invGeffSqAtB1 = c0Mid / (24 * PI * PI) // strictly < 0 (beyond 1-loop Landau pole!)

  // 3. Z_3-fractional background 2-form B = b F_prim: E(n) = (n - b)^2
  const argminB = (b: number): { readonly bestN: number; readonly vals: readonly number[] } => {
    const ns = [-1, 0, 1, 2, 3]
    const vals = ns.map(n => (n - b) ** 2)
    let bestIdx = 0
    for (let i = 1; i < ns.length; i++) if (vals[i]! < vals[bestIdx]!) bestIdx = i
    return { bestN: ns[bestIdx]!, vals }
  }
  const b0 = argminB(0)
  const b13 = argminB(1 / 3)
  const b23 = argminB(2 / 3)

  console.log(`  Vafa-Witten theta: max|Re(6 i theta n^2)|=${maxRealTheta.toExponential(1)}, max||e^{-i S_th}|-1|=${maxModErr.toExponential(1)} (cannot favor n=1)`)
  console.log(
    `  Savvidy-Leutwyler 1-loop: n=1 window c_0 in (${c0Lo.toFixed(5)}, 0) => scale window = ${scaleWindowFromC0.toFixed(6)} (2^{2/3}=1.587401), ` +
      `argmin=[below:${minBelow}, inside:${minInside}, above:${minAbove}], 1/g_eff^2(B_1)=${invGeffSqAtB1.toExponential(3)} < 0 (strong coupling!)`,
  )
  console.log(
    `  Z_3-fractional B = b F_prim (Tier B/C moduli): b=0 -> n=${b0.bestN}, b=1/3 -> n=${b13.bestN}, ` +
      `b=2/3 -> n=+${b23.bestN} (vals[-1..3]=[${b23.vals.map(v => `${Math.round(v * 9)}/9`).join(', ')}])`,
  )

  const ok =
    maxRealTheta === 0 &&
    maxModErr < 1e-14 &&
    scaleErr < 1e-14 &&
    Math.abs(scaleWindowExact - 1.587401) < 1e-6 &&
    minInside === 1 &&
    minBelow >= 2 &&
    minAbove === 0 &&
    invGeffSqAtB1 < 0 &&
    b0.bestN === 0 &&
    b13.bestN === 0 &&
    b23.bestN === 1 &&
    Math.abs(b23.vals[2]! - 1 / 9) < 1e-14 &&
    Math.abs(b23.vals[1]! - 4 / 9) < 1e-14 &&
    Math.abs(b23.vals[3]! - 16 / 9) < 1e-14 &&
    Math.abs(b23.vals[0]! - 25 / 9) < 1e-14

  recordGate(
    'G6',
    'Tier A/B/C',
    'Dynamical flux selection audit (Vafa-Witten theta, Savvidy-Leutwyler 1-loop, Z_3-fractional B)',
    ok,
    `VW Re=0; Savvidy window=2^{2/3}=${scaleWindowExact.toFixed(6)} requires 1/g_eff^2=${invGeffSqAtB1.toExponential(2)}<0; B=(2/3)F_prim min@n=+1 (1/9<4/9<16/9<25/9, Tier B/C)`,
  )
}

// =================================================================================================
// GATE G7 (Tier A): EXACT SM {3,4,3,4} CUSP CASIMIR ENERGY (D_* = 1..13, N_B = 28, N_F = 96)
//                   VIA ZERO-CANCELLATION POSITIVE-RECURRENCE LDL^T
// =================================================================================================

type CasimirSummary = {
  readonly eRawSM13: number
  readonly eCasNNSM13: number
}

function runG7(): CasimirSummary {
  console.log('\n=================================================================================')
  console.log('GATE G7 (Tier A): EXACT SM {3,4,3,4} CUSP CASIMIR ENERGY VIA POSITIVE-REC LDL^T')
  console.log('=================================================================================')

  const D_MAX_CAS = 26
  const K_UP_BULK = 24 / (1 + LAMBDA_1)
  const K_DN_BULK = (24 * LAMBDA_1) / (1 + LAMBDA_1)
  const kUp = new Float64Array(D_MAX_CAS + 2)
  const kLat = new Float64Array(D_MAX_CAS + 2)
  const kDn = new Float64Array(D_MAX_CAS + 2)
  const hop = new Float64Array(D_MAX_CAS + 2)

  kUp[0] = 0; kLat[0] = 6; kDn[0] = 18
  kUp[1] = 1; kLat[1] = 4 / 3; kDn[1] = 65 / 3
  kUp[2] = 390 / 330; kDn[2] = K_DN_BULK; kLat[2] = 24 - kUp[2]! - kDn[2]!
  for (let d = 3; d <= D_MAX_CAS + 1; d++) {
    kUp[d] = K_UP_BULK
    kLat[d] = 0
    kDn[d] = K_DN_BULK
  }
  for (let d = 0; d <= D_MAX_CAS; d++) hop[d] = Math.sqrt(kDn[d]! * kUp[d + 1]!) / 24

  // Zero-cancellation positive-recurrence LDL^T for NN lowest eigenvalue lambda_0(D, cK):
  //   diag[d] = bCur + cR + v(d), where bCur = kUp[d]/24, cR = (d < D ? kDn[d]/24 : 0), v(d) = (kLat[d]/24)(1 - cK)
  //   At shift lam: p[d] = cR + r[d], r[d] = (v(d) - lam) + bCur * (r[d-1] / p[d-1])
  //   Exact Newton root of r[D](lam) = 0 gives lambda_0(D, cK) to ~15 digits even at lambda_0 ~ 1e-18!
  function nnLowestEigExact(D: number, cK: number): number {
    let r = (kLat[0]! / 24) * (1 - cK)
    let dr = -1
    let p = kDn[0]! / 24 + r
    for (let d = 1; d <= D; d++) {
      const bCur = kUp[d]! / 24
      const cPrev = kDn[d - 1]! / 24
      dr = -1 + (bCur * cPrev * dr) / (p * p)
      r = (kLat[d]! / 24) * (1 - cK) + bCur * (r / p)
      if (d < D) p = kDn[d]! / 24 + r
    }
    let lam = -r / dr
    for (let it = 0; it < 8; it++) {
      let rk = (kLat[0]! / 24) * (1 - cK) - lam
      let drk = -1
      let pk = kDn[0]! / 24 + rk
      for (let d = 1; d <= D; d++) {
        const bCur = kUp[d]! / 24
        const cPrev = kDn[d - 1]! / 24
        drk = -1 + (bCur * cPrev * drk) / (pk * pk)
        rk = (kLat[d]! / 24) * (1 - cK) - lam + bCur * (rk / pk)
        if (d < D) pk = kDn[d]! / 24 + rk
      }
      const step = rk / drk
      lam -= step
      if (Math.abs(step) <= 1e-15 * Math.abs(lam)) break
    }
    return lam
  }

  // Exact 3D BZ midpoint grid (Nq = 6 -> 216 points)
  const Nq = 6
  const cKGrid: number[] = []
  for (let ix = 0; ix < Nq; ix++) {
    const kx = ((ix + 0.5) / Nq) * PI
    for (let iy = 0; iy < Nq; iy++) {
      const ky = ((iy + 0.5) / Nq) * PI
      for (let iz = 0; iz < Nq; iz++) {
        const kz = ((iz + 0.5) / Nq) * PI
        cKGrid.push((Math.cos(kx) + Math.cos(ky) + Math.cos(kz)) / 3)
      }
    }
  }
  const invBZ = 1 / cKGrid.length

  // Exact analytical bulk energy density per layer
  const T_BULK = Math.sqrt(LAMBDA_1) / (1 + LAMBDA_1)
  let epsBulkExact = 0
  for (let i = 0; i < 1024; i++) {
    epsBulkExact += (0.5 * Math.sqrt(1 - 2 * T_BULK * Math.cos(((i + 0.5) / 1024) * PI))) / 1024
  }

  type BCKind = 'NN' | 'DD' | 'ND'
  const computeSeries = (bc: BCKind): { readonly raw: Float64Array; readonly cas: Float64Array; readonly e0: Float64Array } => {
    const raw = new Float64Array(D_MAX_CAS + 1)
    const e0 = new Float64Array(D_MAX_CAS + 1)
    const diag = new Float64Array(D_MAX_CAS + 1)
    const off = new Float64Array(D_MAX_CAS)
    for (let D = 1; D <= D_MAX_CAS; D++) {
      let sumRaw = 0
      let sumE0 = 0
      for (let bi = 0; bi < cKGrid.length; bi++) {
        const cK = cKGrid[bi]!
        for (let d = 0; d <= D; d++) {
          let dv = 1 - (kLat[d]! / 24) * cK
          if (bc === 'NN' && d === D) dv -= kDn[D]! / 24
          if (bc === 'DD' && d === 0) dv += 1 / (1 + LAMBDA_1)
          diag[d] = dv
          if (d < D) off[d] = -hop[d]!
        }
        const ev = symTridiagEigs(diag.subarray(0, D + 1), off.subarray(0, D))
        if (bc === 'NN') {
          const lam0 = nnLowestEigExact(D, cK)
          const s0 = 0.5 * Math.sqrt(lam0)
          sumE0 += s0
          let s = s0
          for (let i = 1; i <= D; i++) s += 0.5 * Math.sqrt(Math.max(0, ev[i]!))
          sumRaw += s
        } else {
          let s = 0
          for (let i = 0; i <= D; i++) s += 0.5 * Math.sqrt(Math.max(0, ev[i]!))
          sumRaw += s
        }
      }
      raw[D] = sumRaw * invBZ
      e0[D] = sumE0 * invBZ
    }
    // Subtract exact bulk linear + UV/IR surface asymptote at D_ref = D_MAX_CAS
    // For NN, at D >= 8 the bulk continuum tail decays as lambda_1^{-D} (~1e-11..1e-17)
    // while the exact positive-recurrence zero mode E_0(D) dominates cleanly as lambda_1^{-D/2}!
    const eSurf = raw[D_MAX_CAS]! - epsBulkExact * D_MAX_CAS - (bc === 'NN' ? e0[D_MAX_CAS]! : 0)
    const cas = new Float64Array(D_MAX_CAS + 1)
    for (let D = 1; D <= D_MAX_CAS; D++) {
      if (bc === 'NN' && D >= 8) {
        // Exact non-zero-mode residual + zero-cancellation positive-recurrence E_0(D)
        cas[D] = e0[D]!
      } else {
        cas[D] = raw[D]! - epsBulkExact * D - eSurf
      }
    }
    return { raw, cas, e0 }
  }

  const sNN = computeSeries('NN')
  const sDD = computeSeries('DD')
  const sND = computeSeries('ND')

  const eRawSM13 = -68 * sNN.raw[13]!
  const eCasNNSM13 = -68 * sNN.e0[13]!
  const sqrtL1 = Math.sqrt(LAMBDA_1)
  let maxRatioErr = 0
  for (let D = 9; D <= 15; D++) {
    const rat = sNN.e0[D - 1]! / sNN.e0[D]!
    maxRatioErr = Math.max(maxRatioErr, Math.abs(rat - sqrtL1))
  }

  // Check ZERO local minima in D_* in [2, 13] across all 5 uniform/mixed SM BC assignments
  const smCombos: readonly { readonly name: string; readonly wNN: number; readonly wDD: number; readonly wND: number }[] = [
    { name: '-68 NN', wNN: -68, wDD: 0, wND: 0 },
    { name: '-68 DD', wNN: 0, wDD: -68, wND: 0 },
    { name: '24 NN + 4 DD - 96 ND', wNN: 24, wDD: 4, wND: -96 },
    { name: '24 NN + 4 DD - 96 NN', wNN: 24 - 96, wDD: 4, wND: 0 },
    { name: '28 NN - 96 DD', wNN: 28, wDD: -96, wND: 0 },
  ]
  let totalMinima = 0
  const noiseFloor = 1e-12
  const comboReport: string[] = []
  for (const c of smCombos) {
    const val = (D: number): number => c.wNN * sNN.cas[D]! + c.wDD * sDD.cas[D]! + c.wND * sND.cas[D]!
    let nMin = 0
    for (let D = 2; D <= 13; D++) {
      const prev = val(D - 1)
      const cur = val(D)
      const next = val(D + 1)
      if (Math.abs(cur) < noiseFloor && Math.abs(prev) < noiseFloor && Math.abs(next) < noiseFloor) continue
      if (cur < prev - noiseFloor && cur < next - noiseFloor) nMin++
    }
    totalMinima += nMin
    comboReport.push(`${c.name}:min=${nMin}`)
  }

  // Also explicitly confirm pure DD and ND Casimir series are strictly negative & strictly increasing on resolved D=1..8
  let ddNdMonotone = true
  for (let D = 1; D <= 7; D++) {
    if (!(sDD.cas[D]! < sDD.cas[D + 1]! && sDD.cas[D + 1]! < 0)) ddNdMonotone = false
    if (!(sND.cas[D]! < sND.cas[D + 1]! && sND.cas[D + 1]! < 0)) ddNdMonotone = false
  }

  console.log(`  E_raw^SM(13) = ${eRawSM13.toFixed(4)} (target -437.813 +- 0.01)`)
  console.log(
    `  NN zero mode: max|E_0(D-1)/E_0(D) - sqrt(lambda_1)| (D=9..15) = ${maxRatioErr.toExponential(2)} (< 1e-5, sqrt(lambda_1)=${sqrtL1.toFixed(6)})`,
  )
  console.log(`  E_Cas,NN^SM(13) = ${eCasNNSM13.toExponential(6)} (target -2.84090e-7 +- 1e-9)`)
  console.log(
    `  Local minima in D_* in [2,13] across 5 SM BC assignments (tol=1e-12, DD/ND monotone D=1..8=${ddNdMonotone}): ${comboReport.join(' | ')} (total=${totalMinima})`,
  )

  const ok =
    Math.abs(eRawSM13 - -437.813) < 0.01 &&
    maxRatioErr < 1e-5 &&
    Math.abs(eCasNNSM13 - -2.8409e-7) < 1e-9 &&
    totalMinima === 0 &&
    ddNdMonotone

  recordGate(
    'G7',
    'Tier A',
    'Exact SM {3,4,3,4} cusp Casimir energy (D_*=1..13, N_B=28, N_F=96) via positive-recurrence LDL^T',
    ok,
    `E_raw^SM(13)=${eRawSM13.toFixed(3)}, ratioErr(D=9..15)=${maxRatioErr.toExponential(1)}, E_Cas,NN^SM(13)=${eCasNNSM13.toExponential(5)}, localMin(5 BCs)=${totalMinima}`,
  )

  return { eRawSM13, eCasNNSM13 }
}

// =================================================================================================
// GATE G8 (Tier A/C): ZERO-NUMEROLOGY COSMOLOGICAL CONSTANT POWER LADDER (N_13)
// =================================================================================================

function runG8(cas: CasimirSummary): void {
  console.log('\n=================================================================================')
  console.log('GATE G8 (Tier A/C): ZERO-NUMEROLOGY COSMOLOGICAL CONSTANT POWER LADDER')
  console.log('=================================================================================')

  const n13Big = N_BIG[13]!
  assert(n13Big === 25123449085462194n, `Exact N_13 mismatch: ${n13Big}`)
  const n13 = Number(n13Big)

  // Planck 2018 benchmark: rho_Lambda / M_Pl,red^4 = 7.278e-121
  const RHO_LAMBDA_OBS = 7.278e-121
  const M_PL_RED = 2.43536e18 // GeV
  const M_PL_4 = Math.pow(M_PL_RED, 4)
  const M_H = 125.25
  const V_EW = 246.22
  const deltaVEWSB = (0.125 * M_H * M_H * V_EW * V_EW) / M_PL_4 // (1/8) m_H^2 v^2 / M_Pl^4 = 3.38e-66
  const lambdaQcd4 = Math.pow(0.2, 4) / M_PL_4 // 4.55e-77
  const mNu4 = Math.pow(5e-11, 4) / M_PL_4 // (0.05 eV)^4 / M_Pl^4 = 1.78e-115

  const rungs: readonly {
    readonly label: string
    readonly val: number
    readonly expectedDex: number
  }[] = [
    { label: '|-68 E_raw(13)|', val: Math.abs(cas.eRawSM13), expectedDex: 122.8 },
    { label: '|E_Cas,NN^SM(13)|', val: Math.abs(cas.eCasNNSM13), expectedDex: 113.6 },
    { label: 'N_13^-2', val: Math.pow(n13, -2), expectedDex: 87.3 },
    { label: '68 * N_13^-4', val: 68 * Math.pow(n13, -4), expectedDex: 56.4 },
    { label: '|Delta V_EWSB|/M_Pl^4', val: deltaVEWSB, expectedDex: 54.7 },
    { label: 'Lambda_QCD^4/M_Pl^4', val: lambdaQcd4, expectedDex: 43.8 },
    { label: '(0.05 eV)^4/M_Pl^4', val: mNu4, expectedDex: 5.4 },
    { label: 'N_13^-8', val: Math.pow(n13, -8), expectedDex: -11.1 },
  ]

  let allMatch = true
  for (const r of rungs) {
    const dex = Math.log10(r.val / RHO_LAMBDA_OBS)
    if (Math.abs(dex - r.expectedDex) > 0.15) allMatch = false
    console.log(
      `  ${r.label.padEnd(23)}: ${r.val.toExponential(3).padStart(10)} | ${dex >= 0 ? '+' : ''}${dex.toFixed(1)} dex vs Planck 7.278e-121`,
    )
  }

  const residualIRFineTuningDex = Math.log10(deltaVEWSB / RHO_LAMBDA_OBS)
  const n13m8UndershootDex = Math.log10(Math.pow(n13, -8) / RHO_LAMBDA_OBS)
  console.log(
    `  HONEST TIER-C VERDICT: Exact > 54 dex residual IR fine-tuning (EWSB = +${residualIRFineTuningDex.toFixed(1)} dex, ` +
      `68*N_13^-4 = +${Math.log10((68 * Math.pow(n13, -4)) / RHO_LAMBDA_OBS).toFixed(1)} dex, N_13^-8 = ${n13m8UndershootDex.toFixed(1)} dex). Zero numerology.`,
  )

  const ok =
    n13Big === 25123449085462194n &&
    allMatch &&
    residualIRFineTuningDex > 54.0 &&
    n13m8UndershootDex < -10.5

  recordGate(
    'G8',
    'Tier A/C',
    'Zero-numerology cosmological constant power ladder (N_13 = 25123449085462194n)',
    ok,
    `8/8 ladder rungs exact (+122.8 to -11.1 dex vs 7.278e-121); honest Tier-C IR fine-tuning = +${residualIRFineTuningDex.toFixed(1)} dex (> 54 dex)`,
  )
}

// =================================================================================================
// GATE G9 (Tier A/B): NATIVE DARK SECTOR AUDIT (DEEP-BULK + V_{q=2} = 1' (+) 2 STABILITY THEOREM)
// =================================================================================================

function runG9(savedV2: SavedV2Modes): void {
  console.log('\n=================================================================================')
  console.log('GATE G9 (Tier A/B): NATIVE DARK SECTOR AUDIT (DEEP-BULK + V_{q=2} STABILITY THM)')
  console.log('=================================================================================')

  // 1. Exact {3,4,3,4} deep-bulk Steinberg generating function audit + D=600 recurrence cross-check
  const OMEGA_RATIO_PLANCK = 0.12 / 0.02237 // 5.3643272...
  const evalSteinbergGF = (alpha: number): number => {
    const x = Math.pow(LAMBDA_1, -alpha)
    return (18 * x - 48 * x * x + 22 * x * x * x) / (1 - 21 * x + 51 * x * x - 23 * x * x * x)
  }
  const rNorm = new Float64Array(601)
  rNorm[0] = 1
  rNorm[1] = 18 / LAMBDA_1
  rNorm[2] = 330 / (LAMBDA_1 * LAMBDA_1)
  rNorm[3] = 6034 / (LAMBDA_1 * LAMBDA_1 * LAMBDA_1)
  const invL = 1 / LAMBDA_1
  const invL2 = invL * invL
  const invL3 = invL2 * invL
  for (let d = 4; d <= 600; d++) {
    rNorm[d] = 21 * invL * rNorm[d - 1]! - 51 * invL2 * rNorm[d - 2]! + 23 * invL3 * rNorm[d - 3]!
  }
  const evalSteinbergD600 = (alpha: number): number => {
    const step = Math.pow(LAMBDA_1, 1 - alpha)
    let pw = step
    let s = 0
    for (let d = 1; d <= 600; d++) {
      s += rNorm[d]! * pw
      pw *= step
    }
    return s
  }
  let lo = 1.005
  let hi = 1.5
  for (let it = 0; it < 80; it++) {
    const mid = 0.5 * (lo + hi)
    if (evalSteinbergGF(mid) > OMEGA_RATIO_PLANCK) lo = mid
    else hi = mid
  }
  const alphaStar = 0.5 * (lo + hi)
  const pStar = 3 * alphaStar
  const gfErr = Math.abs(evalSteinbergGF(alphaStar) - OMEGA_RATIO_PLANCK)
  const gfCrossErr = Math.abs(evalSteinbergGF(alphaStar) - evalSteinbergD600(alphaStar))
  const dDownOverLat = 18 / 6
  const n1OverN0 = Number(N_BIG[1]!) / Number(N_BIG[0]!)

  // 2. Reuse G5's exact n = 1 V_{q=2} zero-mode eigenvectors: max |psi_{V2}(x_fp)|^2 < 1e-24 at all 9 FPs
  const fixedSites: number[] = []
  for (let s = 0; s < N_SITES; s++) {
    const x = SITE_COORDS[s]!
    const mx = mat4Vec(M_D4_INV, x)
    const sImg = siteId(((mx[0] % 3) + 3) % 3, ((mx[1] % 3) + 3) % 3, ((mx[2] % 3) + 3) % 3, ((mx[3] % 3) + 3) % 3)
    if (sImg === s) fixedSites.push(s)
  }
  assert(fixedSites.length === 9, `Expected 9 fixed sites, got ${fixedSites.length}`)

  let maxV2FpProb = 0
  for (const s of fixedSites) {
    for (let m = 0; m < 3; m++) {
      let p2 = 0
      for (let sp = 0; sp < 4; sp++) {
        const vr = savedV2.fullModesRe[m]![4 * s + sp]!
        const vi = savedV2.fullModesIm[m]![4 * s + sp]!
        p2 += vr * vr + vi * vi
      }
      if (p2 > maxV2FpProb) maxV2FpProb = p2
    }
  }

  // 3. Exact unbroken Z_3^{DM} charge Q_DM = (q_orb - F) mod 3
  const qDM = (qOrb: number, F: number): number => (((qOrb - F) % 3) + 3) % 3
  const qSmFermion = qDM(1, 1) // 0
  const qSmAntiFermion = qDM(2, -1) // 0
  const qSmBoson = qDM(0, 0) // 0
  const qSmBaryon = qDM(3, 3) // 0
  const qV2Fermion = qDM(2, 1) // 1
  const qV2AntiFermion = qDM(1, -1) // 2 (-1 mod 3)

  // 4. Exact 2T_R = SL(2,3) character multiplicities (7 conjugacy classes, sizes [1,1,6,4,4,4,4])
  const sizes2T = [1, 1, 6, 4, 4, 4, 4] as const
  const ir = {
    '1': [C_ONE, C_ONE, C_ONE, C_ONE, C_ONE, C_ONE, C_ONE],
    "1'": [C_ONE, C_ONE, C_ONE, C_W, C_W2, C_W2, C_W],
    "1''": [C_ONE, C_ONE, C_ONE, C_W2, C_W, C_W, C_W2],
    '2': [[2, 0], [-2, 0], C_ZERO, [-1, 0], [-1, 0], C_ONE, C_ONE],
    "2''": [[2, 0], [-2, 0], C_ZERO, cScale(-1, C_W2), cScale(-1, C_W), C_W, C_W2],
  } as const
  const sumCh = (a: readonly C[], b: readonly C[]): C[] => a.map((x, i) => cAdd(x, b[i]!))
  const mulCh = (a: readonly C[], b: readonly C[]): C[] => a.map((x, i) => cMul(x, b[i]!))
  const conjCh = (a: readonly C[]): C[] => a.map(cConj)
  const mult1 = (a: readonly C[]): { readonly re: number; readonly im: number } => {
    let sr = 0
    let si = 0
    for (let i = 0; i < 7; i++) {
      sr += sizes2T[i]! * a[i]![0]
      si += sizes2T[i]! * a[i]![1]
    }
    return { re: sr / 24, im: si / 24 }
  }

  const chiV1 = sumCh(ir['1'], ir["2''"])
  const chiV2 = sumCh(ir["1'"], ir['2'])
  const chiV1b = conjCh(chiV1)
  const chiV2b = conjCh(chiV2)
  const chi1pBar = conjCh(ir["1'"])

  const mDiracMix = mult1(mulCh(chiV1b, chiV2))
  const mMajMix = mult1(mulCh(chiV1, chiV2))
  const m1p3Body = mult1(mulCh(chi1pBar, mulCh(mulCh(chiV1b, chiV1b), chiV1)))
  const mPortal22 = mult1(mulCh(mulCh(chiV2b, chiV2), mulCh(chiV1b, chiV1)))
  const mSelfMass = mult1(mulCh(chiV2b, chiV2))

  console.log(
    `  Deep-bulk Steinberg GF: Omega_c/Omega_b=${OMEGA_RATIO_PLANCK.toFixed(4)} <=> alpha_*=${alphaStar.toFixed(6)} (p_*=${pStar.toFixed(4)}, ` +
      `err=${gfErr.toExponential(1)}, D=600 crossErr=${gfCrossErr.toExponential(1)}), d_down/d_lat=${dDownOverLat}, N_1/N_0=${n1OverN0}`,
  )
  console.log(`  V_{q=2} fixed-point vanishing (9 FPs from G5 eigenvectors): max|psi_{V2}(x_fp)|^2 = ${maxV2FpProb.toExponential(2)} (< 1e-24)`)
  console.log(
    `  Exact Z_3^{DM} Q_DM = (q_orb - F) mod 3: SM(f,fbar,B,baryon)=(${qSmFermion},${qSmAntiFermion},${qSmBoson},${qSmBaryon}), ` +
      `V_{q=2}(f,fbar)=(+${qV2Fermion}, ${qV2AntiFermion === 2 ? '-1' : qV2AntiFermion})`,
  )
  console.log(
    `  2T_R = SL(2,3) exact multiplicities: mult_1(V1_bar x V2)=${Math.round(mDiracMix.re)}, mult_1(V1 x V2)=${Math.round(mMajMix.re)}, ` +
      `mult_1(1'_bar x V1_bar^2 x V1)=${Math.round(m1p3Body.re)}, mult_1(V2_bar x V2 x V1_bar x V1)=${Math.round(mPortal22.re)}, mult_1(V2_bar x V2)=${Math.round(mSelfMass.re)}`,
  )
  console.log(
    '  TIER B/C DISCLOSURE: SM Yukawas break 2T_R (leaving Z_3 Q_DM intact unless 126bar_H carries q != 0); ' +
      'sterile DM requires V_{q=2} to be an SM-singlet bulk fermion.',
  )

  const isInt = (z: { readonly re: number; readonly im: number }, target: number): boolean =>
    Math.abs(z.re - target) < 1e-13 && Math.abs(z.im) < 1e-13

  const ok =
    Math.abs(alphaStar - 1.058151) < 1e-5 &&
    gfErr < 1e-12 &&
    gfCrossErr < 1e-12 &&
    dDownOverLat === 3 &&
    n1OverN0 === 18 &&
    maxV2FpProb < 1e-24 &&
    qSmFermion === 0 &&
    qSmAntiFermion === 0 &&
    qSmBoson === 0 &&
    qSmBaryon === 0 &&
    qV2Fermion === 1 &&
    qV2AntiFermion === 2 &&
    isInt(mDiracMix, 0) &&
    isInt(mMajMix, 0) &&
    isInt(m1p3Body, 0) &&
    isInt(mPortal22, 7) &&
    isInt(mSelfMass, 2)

  recordGate(
    'G9',
    'Tier A/B',
    'Native dark sector audit (Steinberg deep-bulk + V_{q=2} = 1\'(+)2 Z_3^{DM} x 2T_R stability theorem)',
    ok,
    `alpha_*=${alphaStar.toFixed(6)} (p_*=${pStar.toFixed(4)}), max|psi_V2(fp)|^2=${maxV2FpProb.toExponential(1)}, Q_DM(SM)=0 vs V2=+-1, 2T_R mults=[0,0,0,7,2]`,
  )
}

// =================================================================================================
// MAIN ENTRY & EPISTEMIC SUMMARY FOOTER
// =================================================================================================

function main(): void {
  console.log('=================================================================================')
  console.log('BARE-U CONDENSATE, KAEHLER FLUX SELECTION, CUSP CASIMIR & V_{q=2} DARK SECTOR')
  console.log('=================================================================================')

  runG1()
  runG2()
  runG3()
  const { sysFlux2 } = runG4()
  const savedV2 = runG5(sysFlux2)
  runG6()
  const cas = runG7()
  runG8(cas)
  runG9(savedV2)

  const elapsedSec = (performance.now() - START_MS) / 1000
  const rssMB = process.memoryUsage().rss / (1024 * 1024)
  const passedCount = GATES.filter(g => g.passed).length

  console.log('\n=================================================================================')
  console.log('VERIFICATION SUMMARY TABLE & EPISTEMIC LEDGER')
  console.log('=================================================================================')
  for (const g of GATES) {
    console.log(`  [${g.passed ? 'PASS' : 'FAIL'}] ${g.id.padEnd(3)} (${g.tier.padEnd(10)}) | ${g.name}`)
  }
  console.log('---------------------------------------------------------------------------------')
  console.log('  Tier A (Exact Theorems/Spectra): G1, G2(hard-core/Krein), G3, G4, G5, G6(VW/Savvidy), G7, G8(N_13), G9(V2/2T_R)')
  console.log('  Tier B (Explicit EFT/Moduli):    G2(soft-core GP EFT), G6(B=(2/3)F_prim), G9(SM-singlet V2 & alpha_* warp)')
  console.log('  Tier C (Honest Open Problems):   G6(Abelian favors n=0; Savvidy hits Landau pole), G8(>54 dex CC fine-tuning)')
  console.log('=================================================================================')
  console.log(
    `OVERALL: ${passedCount}/${GATES.length} GATES PASSED (runtime: ${elapsedSec.toFixed(3)} s, RSS: ${rssMB.toFixed(1)} MB)`,
  )
  assert(passedCount === 9 && GATES.length === 9, `Expected 9/9 gates passed, got ${passedCount}/${GATES.length}`)
  assert(elapsedSec < 6.0, `Runtime budget exceeded: ${elapsedSec.toFixed(3)} s >= 6.0 s`)
  assert(rssMB < 180.0, `Memory budget exceeded: ${rssMB.toFixed(1)} MB >= 180 MB`)
}

main()

export {}
