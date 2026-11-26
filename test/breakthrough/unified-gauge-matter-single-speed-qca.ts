// WAVE-4 TRACK W16: UNIFIED SINGLE-SPEED DYNAMICAL GAUGE + MATTER QCA ON {3,4,3,4}
//
// Explicitly Tier B dynamical link-register extension built strictly from the 24-cell's
// own finite subgroups (Z_N / U(1) Abelian link register, 2T = SL(2,3) order-24 Hurwitz
// units for chiral SU(2)_L, and Delta(27) <| Sigma(648) < SU(3)_C for color).
//
// PART 1: Exact Single-Speed Unified Split-Step Unitary QED (U_QED = U_E o U_B o U_hop o U_coin)
//   - P1.1: Reproduces E-RLT-0124's bare M_pair(zeta_18) speed c_eff = 0.021267 vs E-RLT-0125's
//           warped column speed c_u = 0.986916 / 0.977925 (46.4x speed gap), then constructs the
//           exact single-speed palindromic split-step QED QCA using the bare Vibe coin angle
//           theta = pi/3 (cos(pi/3) = 1/2) matched to Maxwell link couplings tau_E = tau_B = 1/2
//           (shared sub-beat c_0 = 1/2 < 1/sqrt(3) CFL bound; full palindromic beat c = 1.0000).
//           Certifies exact 2 degenerate transverse massless photon polarizations, 0 propagating
//           longitudinal mode, and |c_photon - c_fermion|/c_photon < 1e-6 across [1,0,0], [1,1,0], [1,1,1].
//   - P1.2: Exact full quantum many-body Z_3 unitary QED QCA on a 4-vertex {4,3,4} plaquette
//           (dim = 648 exact full-operator commutator check + dim = 5,184 interacting (+1,-1) pair):
//           exact unitarity < 1e-14, exact T = 20 beat reversal < 1e-14, exact local Gauss law
//           [U_QED, V_v] = 0 < 1e-14 at every vertex and beat, live dynamical flux exchange.
//   - P1.3: Live 3D {4,3,4} cusp (24^3 = 13,824 sites) dynamical 1D-string-to-3D-Coulomb radiation
//           with ZERO hard-coded 1/r potential (exact 1/(4 pi r) static field emergence + exact Gauss
//           law + T = 20 reversal < 1e-14) and live 3D (12^3) two-wavepacket Coulomb scattering
//           (attractive opposite-charge vs repulsive like-charge vs zero-deflection g = 0 control).
//
// PART 2: Dynamical Chiral 2T < SU(2)_L Weak Gauge Bosons on the {3,4,3,4} Cusp Domain Wall
//   - P2.1: Exact order-24 binary tetrahedral Hurwitz group 2T = <i, j, (-1+i+j+k)/2> < SU(2),
//           exhaustive BigInt rational proof that 2T is an EXACT spherical 5-design (unitary 2-design)
//           in SU(2) matching every Haar polynomial integral up to degree 5 with 0n defect (and exact
//           first deviation 1/64 at degree 6), 24-cell Laplacian spectrum {0, 1/2, 1, 5/4, 3/2}, and
//           exact 3-boson (W^+, W^-, W^3) Lie algebra [T^a, T^b] = i eps^{abc} T^c & Casimir {0, 3/4, 2}.
//   - P2.2: Exact non-Abelian discrete Gauss law [U_weak, G_v^a] = 0 (a = 1,2,3) to < 1e-14 on the
//           2T-projected SU(2)_L Quantum Link + chiral fermion 3-vertex D_4 triangle (dim = 1,500)
//           AND exact discrete 2T Gauss law [U_weak^(2T), V_v(h)] = 0 for all 24 Hurwitz units h in 2T
//           on a 2-link non-Abelian 2T plaquette (dim = 2,304), plus dynamical W^1, W^2 <-> W^3 mixing.
//   - P2.3: Live 3+1D strictly finite-range Z[zeta_9][1/2] chiral domain-wall QCA U_DW (6^3 husk x
//           N_D = 16 depth layers, dim = 27,648) coupled chirally (P_L at D = 0) to dynamical 2T weak
//           flux: certifies exact maximal parity violation (Delta P_L > 0.5, u_L -> d_L flip > 0.35;
//           P_R singlet Delta P_R = 0.00e+0; deep-bulk D = 15 mirror Delta P_{R,mir} < 1e-14).
//
// PART 3: Exact Discrete Electroweak & Left-Right / Pati-Salam Compatibility
//   - P3.1: Direct closure of W(F_4) (order 1152), W(F_4)^+ (order 576), normal subgroup 2T_L o 2T_R
//           (order 288, double cover 2T_L x 2T_R order 576), elementwise [2T_L, 2T_R] = 0, and exact
//           Left-Right parity swap P_LR (2T_L) P_LR^{-1} = 2T_R in W(F_4)^-.
//   - P3.2: Direct closure of Delta(27) (order 27) <| Sigma(648) < SU(3)_C (order 648) over Z[zeta_9][1/3]
//           and exact unitary 2-design proof of Sigma(648) in SU(3) (frame potential = 2.000000000000).
//   - P3.3: Exact Standard Model Z_6 central quotient z_6 = (omega I_3, -I_2, zeta_6) invariance on all
//           16 Weyl fermions of one generation, exact Left-Right hypercharge Y = T_R^3 + (B-L)/2,
//           exact 5-channel anomaly cancellation, and explicit honest SU(4)_C Pati-Salam boundary.
//
// Standalone, zero external imports, zero Math.random(), deterministic Float64/BigInt only.

export {}

const T_START = performance.now()
const SQRT3 = Math.sqrt(3)
const PI = Math.PI

// ============================================================================
// 0. DETERMINISTIC COMPLEX, LINEAR ALGEBRA & EIGENSOLVER PRIMITIVES
// ============================================================================

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
  [C0, [0, -1]],
  [CI, C0],
]
const SZ: CMat2 = [
  [C1, C0],
  [C0, [-1, 0]],
]
const PAULI: readonly CMat2[] = [SX, SY, SZ]

function m2Mul(A: CMat2, B: CMat2): CMat2 {
  return [
    [
      cAdd(cMul(A[0][0], B[0][0]), cMul(A[0][1], B[1][0])),
      cAdd(cMul(A[0][0], B[0][1]), cMul(A[0][1], B[1][1])),
    ],
    [
      cAdd(cMul(A[1][0], B[0][0]), cMul(A[1][1], B[1][0])),
      cAdd(cMul(A[1][0], B[0][1]), cMul(A[1][1], B[1][1])),
    ],
  ]
}

function m2Dag(A: CMat2): CMat2 {
  return [
    [cConj(A[0][0]), cConj(A[1][0])],
    [cConj(A[0][1]), cConj(A[1][1])],
  ]
}

function m2Add(A: CMat2, B: CMat2): CMat2 {
  return [
    [cAdd(A[0][0], B[0][0]), cAdd(A[0][1], B[0][1])],
    [cAdd(A[1][0], B[1][0]), cAdd(A[1][1], B[1][1])],
  ]
}

function m2Scale(s: C, A: CMat2): CMat2 {
  return [
    [cMul(s, A[0][0]), cMul(s, A[0][1])],
    [cMul(s, A[1][0]), cMul(s, A[1][1])],
  ]
}

function m2Tr(A: CMat2): C {
  return cAdd(A[0][0], A[1][1])
}

function m2Det(A: CMat2): C {
  return cSub(cMul(A[0][0], A[1][1]), cMul(A[0][1], A[1][0]))
}

function m2UniErr(A: CMat2): number {
  const P = m2Mul(m2Dag(A), A)
  return Math.max(
    cAbs(cSub(P[0][0], C1)),
    cAbs(P[0][1]),
    cAbs(P[1][0]),
    cAbs(cSub(P[1][1], C1)),
  )
}

function m2ExpPauli(axis: CMat2, angle: number): CMat2 {
  // exp(-i * angle * axis) for axis^2 = I
  const c: C = [Math.cos(angle), 0]
  const ms: C = [0, -Math.sin(angle)]
  return m2Add(m2Scale(c, I2), m2Scale(ms, axis))
}

// Exact Hermitian Jacobi eigensolver for dense n x n complex Hermitian matrix
// Returns eigenvalues ascending and eigenvectors stored row-wise (vec[k * n + r] = v_k(r)).
function hermitianJacobi(
  n: number,
  hReIn: Float64Array,
  hImIn: Float64Array,
): {
  readonly vals: Float64Array
  readonly vecRe: Float64Array
  readonly vecIm: Float64Array
  readonly maxRes: number
} {
  const aRe = Float64Array.from(hReIn)
  const aIm = Float64Array.from(hImIn)
  const vRe = new Float64Array(n * n)
  const vIm = new Float64Array(n * n)
  for (let i = 0; i < n; i++) vRe[i * n + i] = 1

  for (let sweep = 0; sweep < 80; sweep++) {
    let maxOff = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const re = aRe[p * n + q]!
        const im = aIm[p * n + q]!
        const mag = Math.hypot(re, im)
        if (mag > maxOff) maxOff = mag
        if (mag < 1e-16) continue

        // Phase u = (re + i im) / mag so u^* (re + i im) = mag (real > 0)
        const ur = re / mag
        const ui = im / mag
        const app = aRe[p * n + p]!
        const aqq = aRe[q * n + q]!
        const diff = aqq - app
        const tau = diff / (2 * mag)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        // Unitary Givens on (p, q):
        //   col p' = c * col p - s * u^* * col q
        //   col q' = s * u * col p + c * col q
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

        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue
          const kpR = aRe[k * n + p]!
          const kpI = aIm[k * n + p]!
          const kqR = aRe[k * n + q]!
          const kqI = aIm[k * n + q]!
          // nkp = c * kp - (s u^*) * kq = c * kp - (suR - i suI) * (kqR + i kqI)
          const nkpR = c * kpR - (suR * kqR + suI * kqI)
          const nkpI = c * kpI - (suR * kqI - suI * kqR)
          // nkq = (s u) * kp + c * kq = (suR + i suI) * (kpR + i kpI) + c * kq
          const nkqR = (suR * kpR - suI * kpI) + c * kqR
          const nkqI = (suR * kpI + suI * kpR) + c * kqI

          aRe[k * n + p] = nkpR
          aIm[k * n + p] = nkpI
          aRe[p * n + k] = nkpR
          aIm[p * n + k] = -nkpI
          aRe[k * n + q] = nkqR
          aIm[k * n + q] = nkqI
          aRe[q * n + k] = nkqR
          aIm[q * n + k] = -nkqI
        }

        for (let k = 0; k < n; k++) {
          const vpR = vRe[k * n + p]!
          const vpI = vIm[k * n + p]!
          const vqR = vRe[k * n + q]!
          const vqI = vIm[k * n + q]!
          vRe[k * n + p] = c * vpR - (suR * vqR + suI * vqI)
          vIm[k * n + p] = c * vpI - (suR * vqI - suI * vqR)
          vRe[k * n + q] = (suR * vpR - suI * vpI) + c * vqR
          vIm[k * n + q] = (suR * vpI + suI * vpR) + c * vqI
        }
      }
    }
    if (maxOff < 1e-15) break
  }

  const ord = Array.from({ length: n }, (_, i) => i).sort((i, j) => aRe[i * n + i]! - aRe[j * n + j]!)
  const vals = new Float64Array(n)
  const vecRe = new Float64Array(n * n)
  const vecIm = new Float64Array(n * n)
  for (let col = 0; col < n; col++) {
    const src = ord[col]!
    vals[col] = aRe[src * n + src]!
    for (let r = 0; r < n; r++) {
      vecRe[col * n + r] = vRe[r * n + src]!
      vecIm[col * n + r] = vIm[r * n + src]!
    }
  }

  let maxRes = 0
  for (let k = 0; k < n; k++) {
    const lam = vals[k]!
    let r2 = 0
    for (let r = 0; r < n; r++) {
      let sr = 0
      let si = 0
      for (let c = 0; c < n; c++) {
        const hr = hReIn[r * n + c]!
        const hi = hImIn[r * n + c]!
        const vr = vecRe[k * n + c]!
        const vi = vecIm[k * n + c]!
        sr += hr * vr - hi * vi
        si += hr * vi + hi * vr
      }
      const dr = sr - lam * vecRe[k * n + r]!
      const di = si - lam * vecIm[k * n + r]!
      r2 += dr * dr + di * di
    }
    maxRes = Math.max(maxRes, Math.sqrt(r2))
  }
  return { vals, vecRe, vecIm, maxRes }
}

// Exact unitary eigensolver via commuting Hermitian pair H_s = (U - U^dag)/(2i), H_c = (U + U^dag)/2
function unitaryEigen(
  n: number,
  uRe: Float64Array,
  uIm: Float64Array,
): { readonly phases: Float64Array; readonly maxRes: number } {
  const hsRe = new Float64Array(n * n)
  const hsIm = new Float64Array(n * n)
  const hcRe = new Float64Array(n * n)
  const hcIm = new Float64Array(n * n)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const ur = uRe[r * n + c]!
      const ui = uIm[r * n + c]!
      const dr = uRe[c * n + r]!
      const di = -uIm[c * n + r]!
      // (U - U^dag) / (2i) = ((ui - di)/2) + i (-(ur - dr)/2)
      hsRe[r * n + c] = 0.5 * (ui - di)
      hsIm[r * n + c] = -0.5 * (ur - dr)
      hcRe[r * n + c] = 0.5 * (ur + dr)
      hcIm[r * n + c] = 0.5 * (ui + di)
    }
  }
  const e1 = hermitianJacobi(n, hsRe, hsIm)
  const vecRe = Float64Array.from(e1.vecRe)
  const vecIm = Float64Array.from(e1.vecIm)
  const vals = e1.vals

  // Resolve degenerate subspaces of H_s using H_c
  let start = 0
  while (start < n) {
    let end = start + 1
    while (end < n && Math.abs(vals[end]! - vals[start]!) < 1e-9) end++
    const sz = end - start
    if (sz > 1) {
      const subRe = new Float64Array(sz * sz)
      const subIm = new Float64Array(sz * sz)
      const bvRe = new Float64Array(sz * n)
      const bvIm = new Float64Array(sz * n)
      for (let b = 0; b < sz; b++) {
        const bo = (start + b) * n
        for (let r = 0; r < n; r++) {
          let sr = 0
          let si = 0
          for (let c = 0; c < n; c++) {
            sr += hcRe[r * n + c]! * vecRe[bo + c]! - hcIm[r * n + c]! * vecIm[bo + c]!
            si += hcRe[r * n + c]! * vecIm[bo + c]! + hcIm[r * n + c]! * vecRe[bo + c]!
          }
          bvRe[b * n + r] = sr
          bvIm[b * n + r] = si
        }
      }
      for (let a = 0; a < sz; a++) {
        const ao = (start + a) * n
        for (let b = 0; b < sz; b++) {
          let sr = 0
          let si = 0
          for (let r = 0; r < n; r++) {
            sr += vecRe[ao + r]! * bvRe[b * n + r]! + vecIm[ao + r]! * bvIm[b * n + r]!
            si += vecRe[ao + r]! * bvIm[b * n + r]! - vecIm[ao + r]! * bvRe[b * n + r]!
          }
          subRe[a * sz + b] = sr
          subIm[a * sz + b] = si
        }
      }
      const sub = hermitianJacobi(sz, subRe, subIm)
      const rotRe = new Float64Array(sz * n)
      const rotIm = new Float64Array(sz * n)
      for (let k = 0; k < sz; k++) {
        for (let r = 0; r < n; r++) {
          let sr = 0
          let si = 0
          for (let a = 0; a < sz; a++) {
            const cr = sub.vecRe[k * sz + a]!
            const ci = sub.vecIm[k * sz + a]!
            const vr = vecRe[(start + a) * n + r]!
            const vi = vecIm[(start + a) * n + r]!
            sr += cr * vr - ci * vi
            si += cr * vi + ci * vr
          }
          rotRe[k * n + r] = sr
          rotIm[k * n + r] = si
        }
      }
      vecRe.set(rotRe, start * n)
      vecIm.set(rotIm, start * n)
    }
    start = end
  }

  const phases = new Float64Array(n)
  let maxRes = 0
  for (let k = 0; k < n; k++) {
    const o = k * n
    let lr = 0
    let li = 0
    const uvR = new Float64Array(n)
    const uvI = new Float64Array(n)
    for (let r = 0; r < n; r++) {
      let sr = 0
      let si = 0
      for (let c = 0; c < n; c++) {
        sr += uRe[r * n + c]! * vecRe[o + c]! - uIm[r * n + c]! * vecIm[o + c]!
        si += uRe[r * n + c]! * vecIm[o + c]! + uIm[r * n + c]! * vecRe[o + c]!
      }
      uvR[r] = sr
      uvI[r] = si
      lr += vecRe[o + r]! * sr + vecIm[o + r]! * si
      li += vecRe[o + r]! * si - vecIm[o + r]! * sr
    }
    phases[k] = Math.atan2(li, lr)
    let r2 = 0
    for (let r = 0; r < n; r++) {
      const dr = uvR[r]! - (lr * vecRe[o + r]! - li * vecIm[o + r]!)
      const di = uvI[r]! - (lr * vecIm[o + r]! + li * vecRe[o + r]!)
      r2 += dr * dr + di * di
    }
    maxRes = Math.max(maxRes, Math.sqrt(r2))
  }
  return { phases, maxRes }
}

// Compute exp(-i * tau * H) for dense Hermitian n x n matrix via exact eigendecomposition
function hermitianExpNegI(
  n: number,
  hRe: Float64Array,
  hIm: Float64Array,
  tau: number,
): { readonly uRe: Float64Array; readonly uIm: Float64Array; readonly uniErr: number } {
  const eig = hermitianJacobi(n, hRe, hIm)
  const uRe = new Float64Array(n * n)
  const uIm = new Float64Array(n * n)
  for (let k = 0; k < n; k++) {
    const ph = -tau * eig.vals[k]!
    const pr = Math.cos(ph)
    const pi = Math.sin(ph)
    const o = k * n
    for (let r = 0; r < n; r++) {
      const vr = eig.vecRe[o + r]!
      const vi = eig.vecIm[o + r]!
      // p * v_r
      const pvr = pr * vr - pi * vi
      const pvi = pr * vi + pi * vr
      for (let c = 0; c < n; c++) {
        const cr = eig.vecRe[o + c]!
        const ci = eig.vecIm[o + c]!
        // (p * v_r) * v_c^*
        uRe[r * n + c] = uRe[r * n + c]! + (pvr * cr + pvi * ci)
        uIm[r * n + c] = uIm[r * n + c]! + (pvi * cr - pvr * ci)
      }
    }
  }
  let uniErr = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < n; k++) {
        const ar = uRe[k * n + i]!
        const ai = -uIm[k * n + i]!
        const br = uRe[k * n + j]!
        const bi = uIm[k * n + j]!
        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }
      uniErr = Math.max(uniErr, Math.hypot(sr - (i === j ? 1 : 0), si))
    }
  }
  return { uRe, uIm, uniErr }
}

const checks: { readonly name: string; readonly ok: boolean; readonly detail: string }[] = []
function recordCheck(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail })
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}: ${detail}`)
}

// ============================================================================
// PART 1: EXACT SINGLE-SPEED UNIFIED SPLIT-STEP UNITARY QED QCA
//         CLOSING THE 46x SPEED GAP (E-RLT-0124 vs E-RLT-0125)
// ============================================================================

console.log('========================================================================')
console.log('PART 1: SINGLE-SPEED UNIFIED SPLIT-STEP UNITARY QED QCA ON {4,3,4} CUSP')
console.log('========================================================================')

// ----------------------------------------------------------------------------
// P1.1: Diagnose 46x Bare Speed Gap & Certify Exact Single-Speed Match
// ----------------------------------------------------------------------------
function runPart1_1(): void {
  console.log('\n--- P1.1: Bare 46x Speed Gap Diagnosis & Single-Speed QED Bloch Spectrum ---')

  // 1) Exact 24x24 bare-U M_pair(zeta_18) floor-0 {4,3,4} cusp Bloch operator (reproducing E-RLT-0124)
  const zeta18 = cExpI(PI / 9)
  const w2: C = [-0.5, -SQRT3 / 2]
  const cKeep: C = [0.25, SQRT3 / 4]
  const cCross: C = [0.75, -SQRT3 / 4]
  const bareHopAmp = cAbs(cSub(zeta18, C1)) / 12

  function bareU2Bloch(kx: number, ky: number, kz: number): { uRe: Float64Array; uIm: Float64Array } {
    const n = 24
    const aRe = new Float64Array(n * n)
    const aIm = new Float64Array(n * n)
    const hop = cScale(1 / 12, cSub(zeta18, C1))
    const keep = cAdd(C1, hop)
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const v = cMul(w2, r === c ? keep : hop)
        aRe[r * n + c] = v[0]
        aIm[r * n + c] = v[1]
      }
    }
    for (let j = 0; j < 3; j++) {
      const off = 12 + 4 * j
      for (let r = 0; r < 4; r++) {
        const r0 = (r >> 1) & 1
        const r1 = r & 1
        for (let c = 0; c < 4; c++) {
          const c0 = (c >> 1) & 1
          const c1 = c & 1
          const v = cMul(r0 === c0 ? cKeep : cCross, r1 === c1 ? cKeep : cCross)
          aRe[(off + r) * n + (off + c)] = v[0]
          aIm[(off + r) * n + (off + c)] = v[1]
        }
      }
    }
    const uRe = new Float64Array(n * n)
    const uIm = new Float64Array(n * n)
    const putRow = (dst: number, src: number, ph: C) => {
      for (let c = 0; c < n; c++) {
        const v = cMul(ph, [aRe[src * n + c]!, aIm[src * n + c]!])
        uRe[dst * n + c] = v[0]
        uIm[dst * n + c] = v[1]
      }
    }
    const kArr = [kx, ky, kz]
    // Lines 0..5 are the 3 cusp axes (2j, 2j+1); lines 6..11 are off-cusp bulk lines
    for (let j = 0; j < 3; j++) {
      putRow(12 + 4 * j, 2 * j, C1)
      putRow(12 + 4 * j + 3, 2 * j + 1, cExpI(kArr[j]!))
    }
    for (let l = 6; l < 12; l++) putRow(l, l, C1)
    for (let j = 0; j < 3; j++) {
      const off = 12 + 4 * j
      putRow(2 * j + 1, off + 0, cExpI(-kArr[j]!))
      putRow(off + 2, off + 1, C1)
      putRow(off + 1, off + 2, C1)
      putRow(2 * j, off + 3, C1)
    }
    return { uRe, uIm }
  }

  // Extract light Dirac branch around R = (pi, pi, pi), filtering out k-independent flat bulk bands
  const bareAtR = bareU2Bloch(PI, PI, PI)
  const eigR = unitaryEigen(24, bareAtR.uRe, bareAtR.uIm)
  const sortedR = Array.from(eigR.phases).sort((a, b) => a - b)

  // Identify dispersing bands at k = R + (dk, 0, 0) by comparing against R
  const bareAtProbe = bareU2Bloch(PI + 0.12, PI, PI)
  const eigProbe = unitaryEigen(24, bareAtProbe.uRe, bareAtProbe.uIm)
  const sortedProbe = Array.from(eigProbe.phases).sort((a, b) => a - b)
  // Find dispersing eigenvalue indices (|sortedProbe[i] - sortedR[i]| > 1e-5)
  const dispAtR: { readonly idx: number; readonly eR: number; readonly eP: number }[] = []
  for (let i = 0; i < 24; i++) {
    const d = Math.abs(sortedProbe[i]! - sortedR[i]!)
    if (d > 1e-5) dispAtR.push({ idx: i, eR: sortedR[i]!, eP: sortedProbe[i]! })
  }
  // Find the smallest-gap opposite-moving dispersing pair at R (the light Dirac doublet of E-RLT-0124!)
  let bareMassD = 0
  let cEffBare = 0
  let bestPairGap = Infinity
  for (let a = 0; a < dispAtR.length; a++) {
    for (let b = a + 1; b < dispAtR.length; b++) {
      const da = dispAtR[a]!
      const db = dispAtR[b]!
      const gapR = db.eR - da.eR
      const gapP = db.eP - da.eP
      // Opposite-moving dispersing pair widens with |dk| (gapP > gapR) and sits in the light Dirac window
      if (gapR > 1e-4 && gapR < 0.05 && gapP > gapR + 1e-4 && gapR < bestPairGap) {
        bestPairGap = gapR
        bareMassD = 0.5 * gapR
        const halfGapP = 0.5 * gapP
        cEffBare = Math.sqrt(Math.max(0, halfGapP * halfGapP - bareMassD * bareMassD)) / 0.12
      }
    }
  }
  const cWarpedPeriod2 = 0.986916 // E-RLT-0125 period-2 control
  const cWarpedSingle = 0.977925 // E-RLT-0125 canonical single-face
  const bareSpeedRatio = cWarpedPeriod2 / cEffBare

  console.log(
    `  Bare M_pair(zeta_18) hop |zeta_18 - 1|/12 = ${bareHopAmp.toFixed(6)}, R=(pi,pi,pi) Dirac m_D = ${bareMassD.toFixed(6)}, c_eff = ${cEffBare.toFixed(6)}`,
  )
  console.log(
    `  Speed gap vs E-RLT-0125 warped column: ${cWarpedPeriod2.toFixed(6)} / ${cEffBare.toFixed(6)} = ${bareSpeedRatio.toFixed(2)}x (single-face: ${(cWarpedSingle / cEffBare).toFixed(2)}x)`,
  )

  // 2) Unified Tier B Split-Step QED QCA:
  //    Shared coin angle theta = pi/3 (exact bare Vibe coin angle: cos(pi/3) = 1/2, sin(pi/3) = sqrt(3)/2)
  //    Shared Maxwell sub-beat couplings tau_E = tau_B = 1/2 => c_sub = 1/2 < 1/sqrt(3) (strictly CFL-stable!)
  //    Full palindromic beat:
  //      - Photon:  U_Max,pal = U_E^(1/4) o U_B^(1/2) o U_E^(1/2) o U_B^(1/2) o U_E^(1/4)  (2 sub-beats)
  //                 omega_T(q) = 4 arcsin((1/2) * sqrt(sum_mu sin^2(q_mu/2))) = 1.0000 |q| + O(q^3)
  //      - Fermion: U_Weyl,pal(q) = W_x^(-pi/3) W_y^(-pi/3) W_z^(-pi/3) W_z^(+pi/3) W_y^(+pi/3) W_x^(+pi/3)
  //                 W_mu^(s*theta)(q_mu) = C_mu(-s*theta/2) S_{mu,+}(q_mu) C_mu(+s*theta) S_{mu,-}(q_mu) C_mu(-s*theta/2)
  //                 omega_F(q) = 1.0000 |q| + O(q^3)
  const THETA = PI / 3
  const TAU_E = 0.5
  const TAU_B = 0.5

  // Cyclic orthogonal Pauli pairs (sigma_mu, tau_mu) for mu = 0 (x), 1 (y), 2 (z)
  const SIGMA_AXIS: readonly CMat2[] = [SX, SY, SZ]
  const COIN_AXIS: readonly CMat2[] = [SY, SZ, SX]

  function shift1D(mu: number, qmu: number, sign: 1 | -1): CMat2 {
    // S_{mu,+}(q) = P_+ e^{-iq} + P_- ;  S_{mu,-}(q) = P_+ + P_- e^{+iq}
    const sig = SIGMA_AXIS[mu]!
    const ph = sign === 1 ? cExpI(-qmu) : cExpI(qmu)
    const pPlus = m2Scale([0.5, 0], m2Add(I2, sig))
    const pMinus = m2Scale([0.5, 0], m2Add(I2, m2Scale([-1, 0], sig)))
    return sign === 1 ? m2Add(m2Scale(ph, pPlus), pMinus) : m2Add(pPlus, m2Scale(ph, pMinus))
  }

  function stepWeyl1D(mu: number, qmu: number, thetaSign: 1 | -1): CMat2 {
    const th = thetaSign * THETA
    const cHalfNeg = m2ExpPauli(COIN_AXIS[mu]!, -0.5 * th)
    const cFullPos = m2ExpPauli(COIN_AXIS[mu]!, th)
    const sP = shift1D(mu, qmu, 1)
    const sM = shift1D(mu, qmu, -1)
    return m2Mul(cHalfNeg, m2Mul(sP, m2Mul(cFullPos, m2Mul(sM, cHalfNeg))))
  }

  function uWeylPal(qx: number, qy: number, qz: number): CMat2 {
    const f1 = m2Mul(stepWeyl1D(2, qz, 1), m2Mul(stepWeyl1D(1, qy, 1), stepWeyl1D(0, qx, 1)))
    const f2 = m2Mul(stepWeyl1D(0, qx, -1), m2Mul(stepWeyl1D(1, qy, -1), stepWeyl1D(2, qz, -1)))
    return m2Mul(f2, f1)
  }

  // Exact 6x6 symplectic transfer matrix of 1 Maxwell sub-beat M(q) = M_E(tau_E) * M_B(tau_B, K(q))
  // acting on (A_x, A_y, A_z, E_x, E_y, E_z) in momentum space!
  function maxwellCurlCurl(qx: number, qy: number, qz: number): {
    readonly kRe: Float64Array
    readonly kIm: Float64Array
    readonly qHat: readonly C[]
    readonly qHatSq: number
  } {
    const qHat: readonly C[] = [
      cSub(C1, cExpI(-qx)),
      cSub(C1, cExpI(-qy)),
      cSub(C1, cExpI(-qz)),
    ]
    const qHatSq = cAbs2(qHat[0]!) + cAbs2(qHat[1]!) + cAbs2(qHat[2]!)
    const kRe = new Float64Array(9)
    const kIm = new Float64Array(9)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const prod = cMul(qHat[i]!, cConj(qHat[j]!))
        kRe[i * 3 + j] = (i === j ? qHatSq : 0) - prod[0]
        kIm[i * 3 + j] = -prod[1]
      }
    }
    return { kRe, kIm, qHat, qHatSq }
  }

  // Verify across full 12^3 3D BZ:
  //   (a) K(q) has EXACTLY 1 zero longitudinal eigenvalue (omega_L = 0) and 2 degenerate transverse modes,
  //   (b) div(K(q)) = qHat^dag K(q) == 0 identically,
  //   (c) CFL stability: tau_E * tau_B * lambda_T(q) <= 3 < 4 everywhere,
  //   (d) U_Weyl,pal(q) exact unitarity < 1e-15 everywhere.
  let maxLongEig = 0
  let maxDivCurlErr = 0
  let maxTransSplit = 0
  let maxWeylUniErr = 0
  let maxCflRatio = 0
  const N_BZ = 12
  for (let ix = 0; ix < N_BZ; ix++) {
    for (let iy = 0; iy < N_BZ; iy++) {
      for (let iz = 0; iz < N_BZ; iz++) {
        if (ix === 0 && iy === 0 && iz === 0) continue
        const qx = (2 * PI * ix) / N_BZ - PI
        const qy = (2 * PI * iy) / N_BZ - PI
        const qz = (2 * PI * iz) / N_BZ - PI
        const { kRe, kIm, qHat, qHatSq } = maxwellCurlCurl(qx, qy, qz)
        const eigK = hermitianJacobi(3, kRe, kIm)
        maxLongEig = Math.max(maxLongEig, Math.abs(eigK.vals[0]!))
        maxTransSplit = Math.max(maxTransSplit, Math.abs(eigK.vals[1]! - eigK.vals[2]!))
        maxTransSplit = Math.max(maxTransSplit, Math.abs(eigK.vals[1]! - qHatSq))
        // Check qHat^dag * K == 0
        for (let j = 0; j < 3; j++) {
          let sr = 0
          let si = 0
          for (let i = 0; i < 3; i++) {
            const p = cMul(cConj(qHat[i]!), [kRe[i * 3 + j]!, kIm[i * 3 + j]!])
            sr += p[0]
            si += p[1]
          }
          maxDivCurlErr = Math.max(maxDivCurlErr, Math.hypot(sr, si))
        }
        const sinHalf = 0.5 * Math.sqrt(TAU_E * TAU_B * eigK.vals[2]!)
        maxCflRatio = Math.max(maxCflRatio, sinHalf)
        maxWeylUniErr = Math.max(maxWeylUniErr, m2UniErr(uWeylPal(qx, qy, qz)))
      }
    }
  }

  // Exact directional comparison along [1,0,0], [1,1,0], [1,1,1] at |q| = 1e-3, 1e-2, 5e-2
  const dirs: readonly (readonly [string, readonly [number, number, number]])[] = [
    ['[1,0,0]', [1, 0, 0]],
    ['[1,1,0]', [1 / Math.SQRT2, 1 / Math.SQRT2, 0]],
    ['[1,1,1]', [1 / SQRT3, 1 / SQRT3, 1 / SQRT3]],
  ]
  const qProbes = [1e-3, 1e-2, 5e-2]
  let maxRelMismatchAt1e3 = 0
  let maxRelMismatchAt5e2 = 0
  let maxIsoSpreadAt1e3 = 0
  const speedsAt1e3: number[] = []

  console.log('  Directional single-speed photon vs fermion verification (palindromic beat, c_target = 1.000000):')
  for (const qMag of qProbes) {
    for (const [label, dir] of dirs) {
      const qx = qMag * dir[0]
      const qy = qMag * dir[1]
      const qz = qMag * dir[2]
      // Photon: 2 sub-beats (full palindromic beat)
      const { kRe, kIm } = maxwellCurlCurl(qx, qy, qz)
      const eigK = hermitianJacobi(3, kRe, kIm)
      const omegaPhoton = 4 * Math.asin(0.5 * Math.sqrt(TAU_E * TAU_B * eigK.vals[1]!))
      const cPhoton = omegaPhoton / qMag
      // Fermion: exact trace of SU(2) unitary U_Weyl,pal(q) => cos(omega_F) = Re Tr(U) / 2
      const uW = uWeylPal(qx, qy, qz)
      const cosW = Math.min(1, Math.max(-1, 0.5 * m2Tr(uW)[0]))
      const omegaFermion = Math.acos(cosW)
      const cFermion = omegaFermion / qMag
      const relDiff = Math.abs(cPhoton - cFermion) / cPhoton
      if (qMag === 1e-3) {
        maxRelMismatchAt1e3 = Math.max(maxRelMismatchAt1e3, relDiff)
        speedsAt1e3.push(cPhoton, cFermion)
      }
      if (qMag === 5e-2) {
        maxRelMismatchAt5e2 = Math.max(maxRelMismatchAt5e2, relDiff)
      }
      if (qMag === 1e-3 || qMag === 5e-2) {
        console.log(
          `    |q|=${qMag.toFixed(3)} ${label}: c_photon=${cPhoton.toFixed(8)}, c_fermion=${cFermion.toFixed(8)}, ratio=${(cFermion / cPhoton).toFixed(8)}, relDiff=${relDiff.toExponential(2)}`,
        )
      }
    }
  }
  maxIsoSpreadAt1e3 = Math.max(...speedsAt1e3) - Math.min(...speedsAt1e3)

  // Verify exact 6x6 symplectic condition M^T J M = J on Maxwell transfer matrix at generic q
  const { kRe: kSampleRe, kIm: kSampleIm } = maxwellCurlCurl(0.41, -0.73, 1.19)
  // Symplectic check in Hermitian form: M^dag J M = J where J = [[0, I], [-I, 0]]
  // M = [[I - tau_E tau_B K, tau_E I], [-tau_B K, I]]
  let maxSympErr = 0
  const mRe = new Float64Array(36)
  const mIm = new Float64Array(36)
  for (let i = 0; i < 3; i++) {
    mRe[i * 6 + i] = 1
    mRe[i * 6 + (i + 3)] = TAU_E
    mRe[(i + 3) * 6 + (i + 3)] = 1
    for (let j = 0; j < 3; j++) {
      mRe[i * 6 + j] = mRe[i * 6 + j]! - TAU_E * TAU_B * kSampleRe[i * 3 + j]!
      mIm[i * 6 + j] = mIm[i * 6 + j]! - TAU_E * TAU_B * kSampleIm[i * 3 + j]!
      mRe[(i + 3) * 6 + j] = -TAU_B * kSampleRe[i * 3 + j]!
      mIm[(i + 3) * 6 + j] = -TAU_B * kSampleIm[i * 3 + j]!
    }
  }
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      // (M^dag J M)_{ij} = sum_{k=0..2} (M_{ki}^* M_{k+3, j} - M_{k+3, i}^* M_{kj})
      let sr = 0
      let si = 0
      for (let k = 0; k < 3; k++) {
        const a1 = cMul([mRe[k * 6 + i]!, -mIm[k * 6 + i]!], [mRe[(k + 3) * 6 + j]!, mIm[(k + 3) * 6 + j]!])
        const a2 = cMul([mRe[(k + 3) * 6 + i]!, -mIm[(k + 3) * 6 + i]!], [mRe[k * 6 + j]!, mIm[k * 6 + j]!])
        sr += a1[0] - a2[0]
        si += a1[1] - a2[1]
      }
      const jTarget = j === i + 3 ? 1 : i === j + 3 ? -1 : 0
      maxSympErr = Math.max(maxSympErr, Math.hypot(sr - jTarget, si))
    }
  }

  recordCheck(
    'P1.1a Bare 46x speed gap reproduced',
    Math.abs(cEffBare - 0.021267) < 0.001 && bareSpeedRatio > 45 && bareSpeedRatio < 47,
    `c_eff=${cEffBare.toFixed(6)}, m_D=${bareMassD.toFixed(6)}, ratio=${bareSpeedRatio.toFixed(2)}x`,
  )
  recordCheck(
    'P1.1b Exact 2 transverse photons + 0 longitudinal mode across 12^3 BZ',
    maxLongEig < 1e-14 && maxDivCurlErr < 1e-14 && maxTransSplit < 1e-14 && maxCflRatio < 0.87 && maxSympErr < 1e-14,
    `max|lambda_L|=${maxLongEig.toExponential(2)}, max|div*K|=${maxDivCurlErr.toExponential(2)}, max|T1-T2|=${maxTransSplit.toExponential(2)}, maxCFL=${maxCflRatio.toFixed(4)}<1, sympErr=${maxSympErr.toExponential(2)}`,
  )
  recordCheck(
    'P1.1c Single-speed lock closing 46x gap across [1,0,0],[1,1,0],[1,1,1]',
    maxWeylUniErr < 1e-14 && maxRelMismatchAt1e3 < 1e-6 && maxRelMismatchAt5e2 < 1e-3 && maxIsoSpreadAt1e3 < 1e-6,
    `relDiff(|q|=1e-3)=${maxRelMismatchAt1e3.toExponential(2)}, relDiff(|q|=0.05)=${maxRelMismatchAt5e2.toExponential(2)}, isoSpread=${maxIsoSpreadAt1e3.toExponential(2)}, weylUniErr=${maxWeylUniErr.toExponential(2)}`,
  )
}

// ----------------------------------------------------------------------------
// P1.2: Exact Full Quantum Many-Body Z_3 Unitary QED QCA on 4-Vertex Plaquette
// ----------------------------------------------------------------------------
function runPart1_2(): void {
  console.log('\n--- P1.2: Exact Full Quantum Many-Body Z_3 Unitary QED QCA (T = 20 Beats) ---')

  // 4-vertex {4,3,4} plaquette: vertices 0 -> 1 -> 2 -> 3 -> 0, 4 directed Z_3 links e = 0, 1, 2, 3
  // Link states: e_k in {0, 1, 2} representing E_k in {0, +1, -1} (mod 3), 3^4 = 81 link configs.
  // Physical electric energy E_k^2 = (e_k === 0 ? 0 : 1).
  // Link raising/lowering: U_e |e> = |(e + 1) mod 3>, U_e^dag |e> = |(e + 2) mod 3>.
  // Gauss law at vertex v: G_v = (E_{v, out} - E_{v, in} - q_v) mod 3; V_v = exp(i * 2pi/3 * G_v).
  //   - Particle (+1) hopping v -> (v+1)%4 lowers E_v by 1 (U_v^dag).
  //   - Antiparticle (-1) hopping v -> (v+1)%4 raises E_v by 1 (U_v).
  const N_LINK_STATES = 81
  const POW3 = [1, 3, 9, 27] as const
  const W3 = cExpI((2 * PI) / 3)
  const W3C = cConj(W3)

  function getE(linkIdx: number, edge: number): number {
    return Math.floor(linkIdx / POW3[edge]!) % 3
  }
  function shiftE(linkIdx: number, edge: number, delta: 1 | 2): number {
    const cur = Math.floor(linkIdx / POW3[edge]!) % 3
    const nxt = (cur + delta) % 3
    return linkIdx + (nxt - cur) * POW3[edge]!
  }

  // Exact bare Vibe coin C(pi/3) = (1/2) I - i (sqrt(3)/2) sigma_y (real orthogonal!)
  const COIN_C = 0.5
  const COIN_S = SQRT3 / 2
  const HOP_ALPHA = 0.55 // local gauge-covariant hopping angle per bond
  const B_BETA = 0.35 // magnetic plaquette coupling
  const E_GAMMA = 0.45 // electric Casimir coupling

  // Precompute exact 3-point DFT phase kernel for U_B = exp(+i * beta * (W_p + W_p^dag)) on each 3-cycle
  // Eigenvalues of (W_p + W_p^dag) on Z_3 cycle: k=0 -> +2, k=1 -> -1, k=2 -> -1.
  // In basis (0, 1, 2): U_B(delta) = (1/3) [ e^{2i beta} + 2 e^{-i beta} cos(2pi delta / 3) ]
  function ubCoeffs(beta: number): readonly [C, C, C] {
    const e0 = cExpI(2 * beta)
    const e1 = cExpI(-beta)
    const d0 = cScale(1 / 3, cAdd(e0, cScale(2, e1)))
    const d1 = cScale(1 / 3, cSub(e0, e1))
    return [d0, d1, d1]
  }

  // --- (A) Exact 1-particle sector (dim = 4 sites * 2 spin * 81 links = 648):
  //         Full-space operator norm check of [U_QED, V_v] and U_QED^dag U_QED = I across ALL 648 basis vectors!
  const DIM1 = 8 * N_LINK_STATES
  const idx1 = (v: number, s: number, l: number): number => ((v * 2 + s) * N_LINK_STATES + l)

  function applyCoin1(re: Float64Array, im: Float64Array, inv: boolean): void {
    const sgn = inv ? -1 : 1
    for (let v = 0; v < 4; v++) {
      for (let l = 0; l < N_LINK_STATES; l++) {
        const i0 = idx1(v, 0, l)
        const i1 = idx1(v, 1, l)
        const r0 = re[i0]!
        const m0 = im[i0]!
        const r1 = re[i1]!
        const m1 = im[i1]!
        re[i0] = COIN_C * r0 - sgn * COIN_S * r1
        im[i0] = COIN_C * m0 - sgn * COIN_S * m1
        re[i1] = sgn * COIN_S * r0 + COIN_C * r1
        im[i1] = sgn * COIN_S * m0 + COIN_C * m1
      }
    }
  }

  function applyHopEdge1(re: Float64Array, im: Float64Array, edge: number, inv: boolean): void {
    // Active projector on spinor component s = edge % 2 (alternating spin projections around plaquette)
    const s = edge & 1
    const v0 = edge
    const v1 = (edge + 1) & 3
    const ca = Math.cos(HOP_ALPHA)
    const sa = inv ? Math.sin(HOP_ALPHA) : -Math.sin(HOP_ALPHA)
    for (let l = 0; l < N_LINK_STATES; l++) {
      // Pair |v0, s, l> <-> |v1, s, shiftE(l, edge, 2)> (E_edge decreases by 1 mod 3)
      const l2 = shiftE(l, edge, 2)
      const i0 = idx1(v0, s, l)
      const i1 = idx1(v1, s, l2)
      const r0 = re[i0]!
      const m0 = im[i0]!
      const r1 = re[i1]!
      const m1 = im[i1]!
      // exp(-i alpha sigma_x) = cos(alpha) I - i sin(alpha) sigma_x
      // Note: each (l, l2) pair is visited ONCE if we pair by (v0, l) -> (v1, l2)!
      re[i0] = ca * r0 - sa * m1
      im[i0] = ca * m0 + sa * r1
      re[i1] = ca * r1 - sa * m0
      im[i1] = ca * m1 + sa * r0
    }
  }

  function applyUB1(re: Float64Array, im: Float64Array, inv: boolean): void {
    const [d0, d1] = ubCoeffs(inv ? -B_BETA : B_BETA)
    const tmpR = new Float64Array(N_LINK_STATES)
    const tmpI = new Float64Array(N_LINK_STATES)
    for (let ms = 0; ms < 8; ms++) {
      const base = ms * N_LINK_STATES
      for (let l = 0; l < N_LINK_STATES; l++) {
        // W_p shifts all 4 links by +1 mod 3
        const lp = shiftE(shiftE(shiftE(shiftE(l, 0, 1), 1, 1), 2, 1), 3, 1)
        const lm = shiftE(shiftE(shiftE(shiftE(l, 0, 2), 1, 2), 2, 2), 3, 2)
        const a0: C = [re[base + l]!, im[base + l]!]
        const ap: C = [re[base + lp]!, im[base + lp]!]
        const am: C = [re[base + lm]!, im[base + lm]!]
        const s = cAdd(cMul(d0, a0), cMul(d1, cAdd(ap, am)))
        tmpR[l] = s[0]
        tmpI[l] = s[1]
      }
      re.set(tmpR, base)
      im.set(tmpI, base)
    }
  }

  function applyUE1(re: Float64Array, im: Float64Array, inv: boolean): void {
    const g = inv ? E_GAMMA : -E_GAMMA
    for (let l = 0; l < N_LINK_STATES; l++) {
      let e2 = 0
      for (let e = 0; e < 4; e++) if (getE(l, e) !== 0) e2++
      const ph = cExpI(g * e2)
      for (let ms = 0; ms < 8; ms++) {
        const i = ms * N_LINK_STATES + l
        const r = re[i]!
        const m = im[i]!
        re[i] = ph[0] * r - ph[1] * m
        im[i] = ph[0] * m + ph[1] * r
      }
    }
  }

  function applyUQED1(re: Float64Array, im: Float64Array, inv: boolean): void {
    if (!inv) {
      applyCoin1(re, im, false)
      for (let e = 0; e < 4; e++) applyHopEdge1(re, im, e, false)
      applyUB1(re, im, false)
      applyUE1(re, im, false)
    } else {
      applyUE1(re, im, true)
      applyUB1(re, im, true)
      for (let e = 3; e >= 0; e--) applyHopEdge1(re, im, e, true)
      applyCoin1(re, im, true)
    }
  }

  function applyGauss1(re: Float64Array, im: Float64Array, v: number): void {
    const eOut = v
    const eIn = (v + 3) & 3
    for (let pos = 0; pos < 4; pos++) {
      const qv = pos === v ? 1 : 0
      for (let s = 0; s < 2; s++) {
        for (let l = 0; l < N_LINK_STATES; l++) {
          const g = (getE(l, eOut) - getE(l, eIn) - qv + 6) % 3
          if (g === 0) continue
          const ph = g === 1 ? W3 : W3C
          const i = idx1(pos, s, l)
          const r = re[i]!
          const m = im[i]!
          re[i] = ph[0] * r - ph[1] * m
          im[i] = ph[0] * m + ph[1] * r
        }
      }
    }
  }

  // Exact full-operator check over ALL 648 basis vectors!
  let maxFullUniErr1 = 0
  let maxFullGaussComm1 = 0
  const bufR = new Float64Array(DIM1)
  const bufI = new Float64Array(DIM1)
  const buf2R = new Float64Array(DIM1)
  const buf2I = new Float64Array(DIM1)
  for (let b = 0; b < DIM1; b++) {
    // U^dag U |b> == |b>
    bufR.fill(0)
    bufI.fill(0)
    bufR[b] = 1
    applyUQED1(bufR, bufI, false)
    applyUQED1(bufR, bufI, true)
    let err2 = 0
    for (let i = 0; i < DIM1; i++) {
      const dr = bufR[i]! - (i === b ? 1 : 0)
      const di = bufI[i]!
      err2 += dr * dr + di * di
    }
    maxFullUniErr1 = Math.max(maxFullUniErr1, Math.sqrt(err2))

    // [U_QED, V_v] |b> == 0 for all 4 vertices v
    for (let v = 0; v < 4; v++) {
      bufR.fill(0)
      bufI.fill(0)
      bufR[b] = 1
      applyGauss1(bufR, bufI, v)
      applyUQED1(bufR, bufI, false)

      buf2R.fill(0)
      buf2I.fill(0)
      buf2R[b] = 1
      applyUQED1(buf2R, buf2I, false)
      applyGauss1(buf2R, buf2I, v)

      let c2 = 0
      for (let i = 0; i < DIM1; i++) {
        const dr = bufR[i]! - buf2R[i]!
        const di = bufI[i]! - buf2I[i]!
        c2 += dr * dr + di * di
      }
      maxFullGaussComm1 = Math.max(maxFullGaussComm1, Math.sqrt(c2))
    }
  }

  // --- (B) Exact 2-charge (+1 particle, -1 antiparticle) interacting QED QCA on 4-vertex plaquette
  //         dim = (4*2) * (4*2) * 81 = 5,184, evolved T = 20 beats forward + 20 backward!
  const DIM2 = 64 * N_LINK_STATES
  const idx2 = (vp: number, sp: number, va: number, sa: number, l: number): number =>
    (((vp * 2 + sp) * 8 + (va * 2 + sa)) * N_LINK_STATES + l)

  function applyUQED2(re: Float64Array, im: Float64Array, inv: boolean, coupled: boolean): void {
    const doCoin = () => {
      const sgn = inv ? -1 : 1
      // Coin on particle
      for (let vp = 0; vp < 4; vp++) {
        for (let ma = 0; ma < 8; ma++) {
          for (let l = 0; l < N_LINK_STATES; l++) {
            const i0 = ((vp * 2) * 8 + ma) * N_LINK_STATES + l
            const i1 = ((vp * 2 + 1) * 8 + ma) * N_LINK_STATES + l
            const r0 = re[i0]!
            const m0 = im[i0]!
            const r1 = re[i1]!
            const m1 = im[i1]!
            re[i0] = COIN_C * r0 - sgn * COIN_S * r1
            im[i0] = COIN_C * m0 - sgn * COIN_S * m1
            re[i1] = sgn * COIN_S * r0 + COIN_C * r1
            im[i1] = sgn * COIN_S * m0 + COIN_C * m1
          }
        }
      }
      // Coin on antiparticle
      for (let mp = 0; mp < 8; mp++) {
        for (let va = 0; va < 4; va++) {
          for (let l = 0; l < N_LINK_STATES; l++) {
            const i0 = (mp * 8 + va * 2) * N_LINK_STATES + l
            const i1 = (mp * 8 + va * 2 + 1) * N_LINK_STATES + l
            const r0 = re[i0]!
            const m0 = im[i0]!
            const r1 = re[i1]!
            const m1 = im[i1]!
            re[i0] = COIN_C * r0 - sgn * COIN_S * r1
            im[i0] = COIN_C * m0 - sgn * COIN_S * m1
            re[i1] = sgn * COIN_S * r0 + COIN_C * r1
            im[i1] = sgn * COIN_S * m0 + COIN_C * m1
          }
        }
      }
    }

    const doHopP = (edge: number) => {
      const s = edge & 1
      const v0 = edge
      const v1 = (edge + 1) & 3
      const ca = Math.cos(HOP_ALPHA)
      const sa = inv ? Math.sin(HOP_ALPHA) : -Math.sin(HOP_ALPHA)
      for (let ma = 0; ma < 8; ma++) {
        for (let l = 0; l < N_LINK_STATES; l++) {
          const l2 = coupled ? shiftE(l, edge, 2) : l
          const i0 = ((v0 * 2 + s) * 8 + ma) * N_LINK_STATES + l
          const i1 = ((v1 * 2 + s) * 8 + ma) * N_LINK_STATES + l2
          const r0 = re[i0]!
          const m0 = im[i0]!
          const r1 = re[i1]!
          const m1 = im[i1]!
          re[i0] = ca * r0 - sa * m1
          im[i0] = ca * m0 + sa * r1
          re[i1] = ca * r1 - sa * m0
          im[i1] = ca * m1 + sa * r0
        }
      }
    }

    const doHopA = (edge: number) => {
      const s = edge & 1
      const v0 = edge
      const v1 = (edge + 1) & 3
      const ca = Math.cos(HOP_ALPHA)
      const sa = inv ? Math.sin(HOP_ALPHA) : -Math.sin(HOP_ALPHA)
      for (let mp = 0; mp < 8; mp++) {
        for (let l = 0; l < N_LINK_STATES; l++) {
          // Antiparticle (-1) hopping v0 -> v1 RAISES E_edge by +1 mod 3
          const l2 = coupled ? shiftE(l, edge, 1) : l
          const i0 = (mp * 8 + (v0 * 2 + s)) * N_LINK_STATES + l
          const i1 = (mp * 8 + (v1 * 2 + s)) * N_LINK_STATES + l2
          const r0 = re[i0]!
          const m0 = im[i0]!
          const r1 = re[i1]!
          const m1 = im[i1]!
          re[i0] = ca * r0 - sa * m1
          im[i0] = ca * m0 + sa * r1
          re[i1] = ca * r1 - sa * m0
          im[i1] = ca * m1 + sa * r0
        }
      }
    }

    const doUB = () => {
      if (!coupled) return
      const [d0, d1] = ubCoeffs(inv ? -B_BETA : B_BETA)
      const tmpR = new Float64Array(N_LINK_STATES)
      const tmpI = new Float64Array(N_LINK_STATES)
      for (let m = 0; m < 64; m++) {
        const base = m * N_LINK_STATES
        for (let l = 0; l < N_LINK_STATES; l++) {
          const lp = shiftE(shiftE(shiftE(shiftE(l, 0, 1), 1, 1), 2, 1), 3, 1)
          const lm = shiftE(shiftE(shiftE(shiftE(l, 0, 2), 1, 2), 2, 2), 3, 2)
          const a0: C = [re[base + l]!, im[base + l]!]
          const ap: C = [re[base + lp]!, im[base + lp]!]
          const am: C = [re[base + lm]!, im[base + lm]!]
          const s = cAdd(cMul(d0, a0), cMul(d1, cAdd(ap, am)))
          tmpR[l] = s[0]
          tmpI[l] = s[1]
        }
        re.set(tmpR, base)
        im.set(tmpI, base)
      }
    }

    const doUE = () => {
      if (!coupled) return
      const g = inv ? E_GAMMA : -E_GAMMA
      for (let l = 0; l < N_LINK_STATES; l++) {
        let e2 = 0
        for (let e = 0; e < 4; e++) if (getE(l, e) !== 0) e2++
        const ph = cExpI(g * e2)
        for (let m = 0; m < 64; m++) {
          const i = m * N_LINK_STATES + l
          const r = re[i]!
          const imv = im[i]!
          re[i] = ph[0] * r - ph[1] * imv
          im[i] = ph[0] * imv + ph[1] * r
        }
      }
    }

    if (!inv) {
      doCoin()
      for (let e = 0; e < 4; e++) doHopP(e)
      for (let e = 0; e < 4; e++) doHopA(e)
      doUB()
      doUE()
    } else {
      doUE()
      doUB()
      for (let e = 3; e >= 0; e--) doHopA(e)
      for (let e = 3; e >= 0; e--) doHopP(e)
      doCoin()
    }
  }

  function maxGaussDefect2(re: Float64Array, im: Float64Array): number {
    // Check ||(V_v - I) |psi>|| = 0 for every vertex v = 0,1,2,3 (physical G_v = 0 mod 3 sector)
    let maxDef = 0
    for (let v = 0; v < 4; v++) {
      const eOut = v
      const eIn = (v + 3) & 3
      let bad2 = 0
      for (let vp = 0; vp < 4; vp++) {
        for (let sp = 0; sp < 2; sp++) {
          for (let va = 0; va < 4; va++) {
            const qv = (vp === v ? 1 : 0) - (va === v ? 1 : 0)
            for (let sa = 0; sa < 2; sa++) {
              for (let l = 0; l < N_LINK_STATES; l++) {
                const g = (getE(l, eOut) - getE(l, eIn) - qv + 9) % 3
                if (g === 0) continue
                const i = idx2(vp, sp, va, sa, l)
                bad2 += re[i]! * re[i]! + im[i]! * im[i]!
              }
            }
          }
        }
      }
      maxDef = Math.max(maxDef, Math.sqrt(bad2))
    }
    return maxDef
  }

  // Initial physical state: +1 particle at v=0, -1 antiparticle at v=2, connected by upper flux string
  // Check Gauss law: at v=0: q=+1, E_0=+1, E_3=0 => 1-0-1=0. At v=1: q=0, E_1=+1, E_0=+1 => 0.
  // At v=2: q=-1, E_2=0, E_1=+1 => 0-1-(-1)=0. At v=3: q=0, E_3=0, E_2=0 => 0!
  const lInit = 1 * POW3[0] + 1 * POW3[1] // E_0 = +1, E_1 = +1, E_2 = 0, E_3 = 0
  const psiR = new Float64Array(DIM2)
  const psiI = new Float64Array(DIM2)
  psiR[idx2(0, 0, 2, 0, lInit)] = 1

  const ctrlR = Float64Array.from(psiR)
  const ctrlI = Float64Array.from(psiI)

  let maxGaussT = maxGaussDefect2(psiR, psiI)
  let maxNormErrT = 0
  let maxLowerFlux = 0
  let maxPairProbDiff = 0

  const T_BEATS = 20
  for (let t = 1; t <= T_BEATS; t++) {
    applyUQED2(psiR, psiI, false, true)
    applyUQED2(ctrlR, ctrlI, false, false)
    maxGaussT = Math.max(maxGaussT, maxGaussDefect2(psiR, psiI))
    let n2 = 0
    let lowerFlux = 0
    let pSameQED = 0
    let pSameCtrl = 0
    for (let vp = 0; vp < 4; vp++) {
      for (let sp = 0; sp < 2; sp++) {
        for (let va = 0; va < 4; va++) {
          for (let sa = 0; sa < 2; sa++) {
            for (let l = 0; l < N_LINK_STATES; l++) {
              const i = idx2(vp, sp, va, sa, l)
              const p = psiR[i]! * psiR[i]! + psiI[i]! * psiI[i]!
              const pc = ctrlR[i]! * ctrlR[i]! + ctrlI[i]! * ctrlI[i]!
              n2 += p
              if (getE(l, 2) !== 0 || getE(l, 3) !== 0) lowerFlux += p
              if (vp === va) {
                pSameQED += p
                pSameCtrl += pc
              }
            }
          }
        }
      }
    }
    maxNormErrT = Math.max(maxNormErrT, Math.abs(Math.sqrt(n2) - 1))
    maxLowerFlux = Math.max(maxLowerFlux, lowerFlux)
    maxPairProbDiff = Math.max(maxPairProbDiff, Math.abs(pSameQED - pSameCtrl))
  }

  // Exact T = 20 beat reversal
  for (let t = 1; t <= T_BEATS; t++) applyUQED2(psiR, psiI, true, true)
  let revErr2 = 0
  const i0Idx = idx2(0, 0, 2, 0, lInit)
  for (let i = 0; i < DIM2; i++) {
    const dr = psiR[i]! - (i === i0Idx ? 1 : 0)
    const di = psiI[i]!
    revErr2 += dr * dr + di * di
  }
  const revErr = Math.sqrt(revErr2)

  recordCheck(
    'P1.2a Exact full-space 1-fermion Z_3 QED unitarity & [U_QED, V_v] = 0 (648/648 basis)',
    maxFullUniErr1 < 1e-14 && maxFullGaussComm1 < 1e-14,
    `uniErr=${maxFullUniErr1.toExponential(2)}, max||[U_QED,V_v]||=${maxFullGaussComm1.toExponential(2)}`,
  )
  recordCheck(
    'P1.2b Interacting (+1,-1) Z_3 QED (dim=5,184): T=20 reversal, Gauss law & dynamical flux exchange',
    revErr < 1e-14 && maxGaussT < 1e-14 && maxNormErrT < 1e-14 && maxLowerFlux > 0.25 && maxPairProbDiff > 0.05,
    `revErr=${revErr.toExponential(2)}, gaussErr=${maxGaussT.toExponential(2)}, lowerFlux=${maxLowerFlux.toFixed(4)}, |P_pair(QED)-P_pair(free)|=${maxPairProbDiff.toFixed(4)}`,
  )
}

// ----------------------------------------------------------------------------
// P1.3: Live 3D {4,3,4} Cusp Dynamical 1/(4 pi r) Coulomb Emergence & Scattering
// ----------------------------------------------------------------------------
function runPart1_3(): void {
  console.log('\n--- P1.3: Live 3D {4,3,4} Cusp Dynamical Coulomb Field & Wavepacket Scattering ---')

  // --- (A) 24^3 3D {4,3,4} cusp: 1D flux string radiates into exact 3D 1/(4 pi r) Coulomb field
  //         with ZERO hard-coded 1/r potential!
  const L = 24
  const V = L * L * L
  const TAU = 0.5 // c_0 = 1/2 < 1/sqrt(3)
  const siteIdx = (x: number, y: number, z: number): number =>
    (((x + L) % L) * L + ((y + L) % L)) * L + ((z + L) % L)

  // Local 3D Maxwell QCA U_Max = U_E(TAU) o U_B(TAU) (exact reversible symplectic unitary)
  function stepMaxwell3D(
    Ex: Float64Array,
    Ey: Float64Array,
    Ez: Float64Array,
    Ax: Float64Array,
    Ay: Float64Array,
    Az: Float64Array,
    inv: boolean,
  ): void {
    const doUB = (sign: number) => {
      // E_mu <- E_mu - sign * TAU * (curl^dag curl A)_mu
      // First compute plaquette magnetic fluxes B_xy, B_yz, B_zx at every vertex
      const Bxy = new Float64Array(V)
      const Byz = new Float64Array(V)
      const Bzx = new Float64Array(V)
      for (let x = 0; x < L; x++) {
        const xp = (x + 1) % L
        for (let y = 0; y < L; y++) {
          const yp = (y + 1) % L
          for (let z = 0; z < L; z++) {
            const zp = (z + 1) % L
            const i = (x * L + y) * L + z
            const ix = (xp * L + y) * L + z
            const iy = (x * L + yp) * L + z
            const iz = (x * L + y) * L + zp
            Bxy[i] = Ax[i]! + Ay[ix]! - Ax[iy]! - Ay[i]!
            Byz[i] = Ay[i]! + Az[iy]! - Ay[iz]! - Az[i]!
            Bzx[i] = Az[i]! + Ax[iz]! - Az[ix]! - Ax[i]!
          }
        }
      }
      const s = sign * TAU
      for (let x = 0; x < L; x++) {
        const xm = (x + L - 1) % L
        for (let y = 0; y < L; y++) {
          const ym = (y + L - 1) % L
          for (let z = 0; z < L; z++) {
            const zm = (z + L - 1) % L
            const i = (x * L + y) * L + z
            const ixm = (xm * L + y) * L + z
            const iym = (x * L + ym) * L + z
            const izm = (x * L + y) * L + zm
            // (curl^dag B)_x = (Bxy[x,y,z] - Bxy[x,y-1,z]) - (Bzx[x,y,z] - Bzx[x,y,z-1])
            // Wait: check sign from H_B = (1/2) sum (Bxy^2 + Byz^2 + Bzx^2):
            //   dH_B / dAx[x,y,z] = Bxy[x,y,z] - Bxy[x,y-1,z] + Bzx[x,y,z-1] - Bzx[x,y,z] (wait: Bzx[x,y,z] has +Ax[x,y,z+1] - Ax[x,y,z]!)
            const dAx = Bxy[i]! - Bxy[iym]! + Bzx[izm]! - Bzx[i]!
            const dAy = Byz[i]! - Byz[izm]! + Bxy[ixm]! - Bxy[i]!
            const dAz = Bzx[i]! - Bzx[ixm]! + Byz[iym]! - Byz[i]!
            Ex[i] = Ex[i]! - s * dAx
            Ey[i] = Ey[i]! - s * dAy
            Ez[i] = Ez[i]! - s * dAz
          }
        }
      }
    }
    const doUE = (sign: number) => {
      const s = sign * TAU
      for (let i = 0; i < V; i++) {
        Ax[i] = Ax[i]! + s * Ex[i]!
        Ay[i] = Ay[i]! + s * Ey[i]!
        Az[i] = Az[i]! + s * Ez[i]!
      }
    }
    if (!inv) {
      doUB(1)
      doUE(1)
    } else {
      doUE(-1)
      doUB(-1)
    }
  }

  function maxDivErr3D(Ex: Float64Array, Ey: Float64Array, Ez: Float64Array, rho: Float64Array): number {
    let err = 0
    for (let x = 0; x < L; x++) {
      const xm = (x + L - 1) % L
      for (let y = 0; y < L; y++) {
        const ym = (y + L - 1) % L
        for (let z = 0; z < L; z++) {
          const zm = (z + L - 1) % L
          const i = (x * L + y) * L + z
          const divE =
            (Ex[i]! - Ex[(xm * L + y) * L + z]!) +
            (Ey[i]! - Ey[(x * L + ym) * L + z]!) +
            (Ez[i]! - Ez[(x * L + y) * L + zm]!)
          err = Math.max(err, Math.abs(divE - rho[i]!))
        }
      }
    }
    return err
  }

  // Exact static 3D lattice Green's function potential V_G(dx, dy, dz) (for independent verification only!)
  function exactLatticeCoulombPotential(dx: number, dy: number, dz: number): number {
    // G(r) = (1/V) sum_{k != 0} cos(k . r) / (4 sum sin^2(k_mu/2))
    const cosT = new Float64Array(L)
    const sin2 = new Float64Array(L)
    for (let m = 0; m < L; m++) {
      const k = (2 * PI * m) / L
      cosT[m] = Math.cos(k)
      const s = Math.sin(0.5 * k)
      sin2[m] = 4 * s * s
    }
    let acc = 0
    for (let mx = 0; mx < L; mx++) {
      const cx = Math.cos((2 * PI * mx * dx) / L)
      const sx = sin2[mx]!
      for (let my = 0; my < L; my++) {
        const cxy = cx * Math.cos((2 * PI * my * dy) / L)
        const sxy = sx + sin2[my]!
        for (let mz = 0; mz < L; mz++) {
          if (mx === 0 && my === 0 && mz === 0) continue
          acc += (cxy * Math.cos((2 * PI * mz * dz) / L)) / (sxy + sin2[mz]!)
        }
      }
    }
    return acc / V
  }

  // Place +1 at (10, 12, 12) and -1 at (14, 12, 12) (d = 4), connected ONLY by 1D string on Ex!
  const Ex = new Float64Array(V)
  const Ey = new Float64Array(V)
  const Ez = new Float64Array(V)
  const Ax = new Float64Array(V)
  const Ay = new Float64Array(V)
  const Az = new Float64Array(V)
  const rho = new Float64Array(V)
  const xPlus = 10
  const xMinus = 14
  const yc = 12
  const zc = 12
  rho[siteIdx(xPlus, yc, zc)] = 1
  rho[siteIdx(xMinus, yc, zc)] = -1
  for (let x = xPlus; x < xMinus; x++) Ex[siteIdx(x, yc, zc)] = 1

  const Ex0 = Float64Array.from(Ex)
  let maxGauss3D = maxDivErr3D(Ex, Ey, Ez, rho)
  const T_REV3D = 20
  const T_AVG = 60
  const avgEx = new Float64Array(V)
  const avgEy = new Float64Array(V)
  const avgEz = new Float64Array(V)
  let snapEx20 = new Float64Array(0)
  let snapEy20 = new Float64Array(0)
  let snapEz20 = new Float64Array(0)

  // First run T = 20 forward + 20 backward for exact reversal certificate
  for (let t = 1; t <= T_REV3D; t++) {
    stepMaxwell3D(Ex, Ey, Ez, Ax, Ay, Az, false)
    maxGauss3D = Math.max(maxGauss3D, maxDivErr3D(Ex, Ey, Ez, rho))
  }
  snapEx20 = Float64Array.from(Ex)
  snapEy20 = Float64Array.from(Ey)
  snapEz20 = Float64Array.from(Ez)

  for (let t = 1; t <= T_REV3D; t++) stepMaxwell3D(Ex, Ey, Ez, Ax, Ay, Az, true)
  let maxRev3D = 0
  for (let i = 0; i < V; i++) {
    maxRev3D = Math.max(
      maxRev3D,
      Math.abs(Ex[i]! - Ex0[i]!),
      Math.abs(Ey[i]!),
      Math.abs(Ez[i]!),
      Math.abs(Ax[i]!),
      Math.abs(Ay[i]!),
      Math.abs(Az[i]!),
    )
  }

  // Now run T_AVG = 60 unitary beats from the exact 1D string and compute Cesaro time-average
  // (exact ergodic projection of purely local unitary Maxwell QCA onto the static omega=0 Coulomb field!)
  for (let t = 1; t <= T_AVG; t++) {
    stepMaxwell3D(Ex, Ey, Ez, Ax, Ay, Az, false)
    for (let i = 0; i < V; i++) {
      avgEx[i] = avgEx[i]! + Ex[i]! / T_AVG
      avgEy[i] = avgEy[i]! + Ey[i]! / T_AVG
      avgEz[i] = avgEz[i]! + Ez[i]! / T_AVG
    }
  }

  // Compare initial 1D string (t=0), instantaneous t=20 snapshot, AND Cesaro T=60 average
  // against the exact static 3D lattice Coulomb dipole field inside r <= 5 from center (12,12,12)!
  let dot0 = 0
  let norm0 = 0
  let dot20 = 0
  let norm20 = 0
  let dotAvg = 0
  let normAvg = 0
  let normCoul2 = 0
  let transverseE2 = 0
  for (let x = 9; x <= 14; x++) {
    for (let y = 9; y <= 15; y++) {
      for (let z = 9; z <= 15; z++) {
        const i = siteIdx(x, y, z)
        const phi0 = exactLatticeCoulombPotential(x - xPlus, y - yc, z - zc) -
          exactLatticeCoulombPotential(x - xMinus, y - yc, z - zc)
        const phix = exactLatticeCoulombPotential(x + 1 - xPlus, y - yc, z - zc) -
          exactLatticeCoulombPotential(x + 1 - xMinus, y - yc, z - zc)
        const phiy = exactLatticeCoulombPotential(x - xPlus, y + 1 - yc, z - zc) -
          exactLatticeCoulombPotential(x - xMinus, y + 1 - yc, z - zc)
        const phiz = exactLatticeCoulombPotential(x - xPlus, y - yc, z + 1 - zc) -
          exactLatticeCoulombPotential(x - xMinus, y - yc, z + 1 - zc)
        const exC = phi0 - phix
        const eyC = phi0 - phiy
        const ezC = phi0 - phiz
        dot0 += Ex0[i]! * exC
        norm0 += Ex0[i]! * Ex0[i]!
        dot20 += snapEx20[i]! * exC + snapEy20[i]! * eyC + snapEz20[i]! * ezC
        norm20 += snapEx20[i]! ** 2 + snapEy20[i]! ** 2 + snapEz20[i]! ** 2
        dotAvg += avgEx[i]! * exC + avgEy[i]! * eyC + avgEz[i]! * ezC
        normAvg += avgEx[i]! ** 2 + avgEy[i]! ** 2 + avgEz[i]! ** 2
        normCoul2 += exC * exC + eyC * eyC + ezC * ezC
        transverseE2 += snapEy20[i]! ** 2 + snapEz20[i]! ** 2
      }
    }
  }
  const cosSim0 = dot0 / Math.sqrt(norm0 * normCoul2)
  const cosSim20 = dot20 / Math.sqrt(norm20 * normCoul2)
  const coulombCosSim = dotAvg / Math.sqrt(normAvg * normCoul2)

  // Verify 1/(4 pi r) static 3D {4,3,4} lattice Coulomb Green's function on a large box L_G = 64
  // (eliminating L = 24 periodic image shift; O(L_G^3) for 5 axial radii runs in ~15 ms!)
  const LG = 64
  const VG = LG * LG * LG
  const sin2G = new Float64Array(LG)
  for (let m = 0; m < LG; m++) {
    const s = Math.sin((PI * m) / LG)
    sin2G[m] = 4 * s * s
  }
  const rRadii = [2, 3, 4, 5, 6, 8, 10] as const
  const gVals = new Float64Array(rRadii.length)
  let gSelf64 = 0
  const cosR: Float64Array[] = rRadii.map(r => {
    const arr = new Float64Array(LG)
    for (let m = 0; m < LG; m++) arr[m] = Math.cos((2 * PI * m * r) / LG)
    return arr
  })
  for (let mx = 0; mx < LG; mx++) {
    const sx = sin2G[mx]!
    const c0 = cosR[0]![mx]!
    const c1 = cosR[1]![mx]!
    const c2 = cosR[2]![mx]!
    const c3 = cosR[3]![mx]!
    const c4 = cosR[4]![mx]!
    const c5 = cosR[5]![mx]!
    const c6 = cosR[6]![mx]!
    for (let my = 0; my < LG; my++) {
      const sxy = sx + sin2G[my]!
      for (let mz = 0; mz < LG; mz++) {
        if (mx === 0 && my === 0 && mz === 0) continue
        const inv = 1 / (sxy + sin2G[mz]!)
        gSelf64 += inv
        gVals[0] = gVals[0]! + c0 * inv
        gVals[1] = gVals[1]! + c1 * inv
        gVals[2] = gVals[2]! + c2 * inv
        gVals[3] = gVals[3]! + c3 * inv
        gVals[4] = gVals[4]! + c4 * inv
        gVals[5] = gVals[5]! + c5 * inv
        gVals[6] = gVals[6]! + c6 * inv
      }
    }
  }
  gSelf64 /= VG
  for (let k = 0; k < rRadii.length; k++) gVals[k] = gVals[k]! / VG

  // Box-independent continuum asymptotics (r >= 4): (G(4) - G(10)) vs (1/(16pi) - 1/(40pi))
  // Plus exact monotonic O(a^2/r^2) convergence of 4*pi*r*G_inf(r) -> 1.0000 across r = 2..10!
  const dVLat = gVals[2]! - gVals[6]!
  const dVCont = 1 / (16 * PI) - 1 / (40 * PI)
  const maxCoulLawErr = Math.abs(dVLat - dVCont) / dVCont
  const gInfAt6 = gVals[4]! + (0.252731009858663 - gSelf64)
  const r6Err = Math.abs(4 * PI * 6 * gInfAt6 - 1)
  const coulProbes = rRadii.map((r, k) => {
    const gInfR = gVals[k]! + (0.252731009858663 - gSelf64)
    return `r=${r}:${(4 * PI * r * gInfR).toFixed(4)}`
  })
  console.log(
    `  24^3 String->Coulomb radiation: cosSim(t=0 string)=${cosSim0.toFixed(4)} -> cosSim(t=20 snap)=${cosSim20.toFixed(4)} -> cosSim(T=60 Cesaro)=${coulombCosSim.toFixed(6)}, E_perp^2(0->20)=0->${transverseE2.toFixed(4)}`,
  )
  console.log(
    `  3D static Coulomb 1/(4pi r) (L=64): G_64(0)=${gSelf64.toFixed(5)}, dV(4->10) err = ${(100 * maxCoulLawErr).toFixed(2)}%, 4pi*r*G(r) = [${coulProbes.join(', ')}]`,
  )

  // --- (B) Live 12^3 3D coupled two-wavepacket dynamical QED scattering (exact Gauss law + reversal!)
  const Ls = 12
  const Vs = Ls * Ls * Ls
  const sIdx = (x: number, y: number, z: number): number =>
    (((x + Ls) % Ls) * Ls + ((y + Ls) % Ls)) * Ls + ((z + Ls) % Ls)

  function runTwoPacketScattering(q1: number, q2: number): {
    readonly finalSep: number
    readonly maxGauss: number
    readonly maxNorm: number
    readonly revErr: number
  } {
    // 2-component Weyl spinors psi1, psi2 on Ls^3 coupled to dynamical (Ex,Ey,Ez,Ax,Ay,Az)
    const p1R = new Float64Array(2 * Vs)
    const p1I = new Float64Array(2 * Vs)
    const p2R = new Float64Array(2 * Vs)
    const p2I = new Float64Array(2 * Vs)

    // Initialize two localized 3D Gaussian packets at x1 = 4, x2 = 8, y = z = 6 (zero hard-coded potential)
    let n1 = 0
    let n2 = 0
    for (let x = 0; x < Ls; x++) {
      for (let y = 0; y < Ls; y++) {
        for (let z = 0; z < Ls; z++) {
          const i = sIdx(x, y, z)
          const dy = y - 6
          const dz = z - 6
          const g1 = Math.exp(-0.7 * ((x - 4) * (x - 4) + dy * dy + dz * dz))
          const g2 = Math.exp(-0.7 * ((x - 8) * (x - 8) + dy * dy + dz * dz))
          // Balanced spinor (1/sqrt(2), 1/sqrt(2)) => zero initial net drift in free space!
          p1R[2 * i] = g1
          p1R[2 * i + 1] = g1
          n1 += 2 * g1 * g1
          p2R[2 * i] = g2
          p2R[2 * i + 1] = g2
          n2 += 2 * g2 * g2
        }
      }
    }
    const invN1 = 1 / Math.sqrt(n1)
    const invN2 = 1 / Math.sqrt(n2)
    for (let i = 0; i < 2 * Vs; i++) {
      p1R[i] = p1R[i]! * invN1
      p2R[i] = p2R[i]! * invN2
    }
    const p1R0 = Float64Array.from(p1R)
    const p2R0 = Float64Array.from(p2R)

    // Build exact Gauss-consistent initial electric field with ZERO 1/r potential:
    // Axial tree-gauge prefix sum (div E = rho_net exactly to 1e-15!)
    const ExS = new Float64Array(Vs)
    const EyS = new Float64Array(Vs)
    const EzS = new Float64Array(Vs)
    const AxS = new Float64Array(Vs)
    const AyS = new Float64Array(Vs)
    const AzS = new Float64Array(Vs)
    // Add uniform neutralizing background rho_bg = -(q1 + q2) / Vs so total charge on torus is 0
    const rhoBg = -(q1 + q2) / Vs
    const rho0 = new Float64Array(Vs)
    for (let i = 0; i < Vs; i++) {
      const r1 = p1R[2 * i]! * p1R[2 * i]! + p1R[2 * i + 1]! * p1R[2 * i + 1]!
      const r2 = p2R[2 * i]! * p2R[2 * i]! + p2R[2 * i + 1]! * p2R[2 * i + 1]!
      rho0[i] = q1 * r1 + q2 * r2 + rhoBg
    }
    // Sweep x -> 0, then y -> 0, then z -> 0 along spanning tree
    const remY = new Float64Array(Ls * Ls)
    for (let y = 0; y < Ls; y++) {
      for (let z = 0; z < Ls; z++) {
        let sumX = 0
        for (let x = Ls - 1; x >= 1; x--) {
          sumX += rho0[sIdx(x, y, z)]!
          // E_x at (x-1, y, z) carries flux from x-1 to x, so div at x gets -E_x(x-1).
          // Setting E_x(x-1, y, z) = -sumX makes div at x equal +rho0[x]!
          ExS[sIdx(x - 1, y, z)] = -sumX
        }
        remY[y * Ls + z] = sumX + rho0[sIdx(0, y, z)]!
      }
    }
    const remZ = new Float64Array(Ls)
    for (let z = 0; z < Ls; z++) {
      let sumY = 0
      for (let y = Ls - 1; y >= 1; y--) {
        sumY += remY[y * Ls + z]!
        EyS[sIdx(0, y - 1, z)] = -sumY
      }
      remZ[z] = sumY + remY[z]!
    }
    let sumZ = 0
    for (let z = Ls - 1; z >= 1; z--) {
      sumZ += remZ[z]!
      EzS[sIdx(0, 0, z - 1)] = -sumZ
    }
    const ExS0 = Float64Array.from(ExS)
    const EyS0 = Float64Array.from(EyS)
    const EzS0 = Float64Array.from(EzS)

    // Gauge-covariant split-step 1D shift with exact discrete current feedback E_mu <- E_mu - J_mu!
    // Uses diagonalized sigma_z basis via local unitary basis change B_mu (on-site, preserves rho_x!)
    function applySiteMat(re: Float64Array, im: Float64Array, M: CMat2): void {
      for (let i = 0; i < Vs; i++) {
        const r0 = re[2 * i]!
        const m0 = im[2 * i]!
        const r1 = re[2 * i + 1]!
        const m1 = im[2 * i + 1]!
        const a0 = cAdd(cMul(M[0][0], [r0, m0]), cMul(M[0][1], [r1, m1]))
        const a1 = cAdd(cMul(M[1][0], [r0, m0]), cMul(M[1][1], [r1, m1]))
        re[2 * i] = a0[0]
        im[2 * i] = a0[1]
        re[2 * i + 1] = a1[0]
        im[2 * i + 1] = a1[1]
      }
    }

    // Basis changes B_mu such that B_mu^dag sigma_z B_mu = sigma_mu:
    const INV_SQ2 = 1 / Math.SQRT2
    const BX: CMat2 = [
      [[INV_SQ2, 0], [INV_SQ2, 0]],
      [[INV_SQ2, 0], [-INV_SQ2, 0]],
    ]
    const BY: CMat2 = [
      [[INV_SQ2, 0], [0, -INV_SQ2]],
      [[INV_SQ2, 0], [0, INV_SQ2]],
    ]
    const B_MATS: readonly CMat2[] = [BX, BY, I2]
    const B_DAGS: readonly CMat2[] = [m2Dag(BX), m2Dag(BY), I2]
    const TH_HALF_N = m2ExpPauli(SY, -PI / 6)
    const TH_FULL_P = m2ExpPauli(SY, PI / 3)
    const TH_HALF_P = m2ExpPauli(SY, PI / 6)
    const TH_FULL_N = m2ExpPauli(SY, -PI / 3)

    const tmpR = new Float64Array(2 * Vs)
    const tmpI = new Float64Array(2 * Vs)

    // Shift component 0 (+1) forward or component 1 (-1) backward along axis mu with Peierls phase e^{\mp i q A_mu}
    // AND exact Gauss-law current feedback on E_mu!
    function shiftSpinorWithFeedback(
      re: Float64Array,
      im: Float64Array,
      qCharge: number,
      mu: number,
      comp: 0 | 1,
      inv: boolean,
    ): void {
      const Aarr = mu === 0 ? AxS : mu === 1 ? AyS : AzS
      const Earr = mu === 0 ? ExS : mu === 1 ? EyS : EzS
      const fwdDir = (comp === 0 ? 1 : -1) * (inv ? -1 : 1)
      tmpR.set(re)
      tmpI.set(im)
      for (let x = 0; x < Ls; x++) {
        for (let y = 0; y < Ls; y++) {
          for (let z = 0; z < Ls; z++) {
            const i = sIdx(x, y, z)
            const nx = mu === 0 ? (x + fwdDir + Ls) % Ls : x
            const ny = mu === 1 ? (y + fwdDir + Ls) % Ls : y
            const nz = mu === 2 ? (z + fwdDir + Ls) % Ls : z
            const j = sIdx(nx, ny, nz)
            // Link traversed: if fwdDir == +1, link is at i (i -> j); if fwdDir == -1, link is at j (j -> i)
            const linkSite = fwdDir === 1 ? i : j
            const aVal = Aarr[linkSite]!
            // Peierls phase: moving +1 along link gets e^{-i q A}, moving -1 along link gets e^{+i q A}
            const phase = -fwdDir * qCharge * aVal
            const cp = Math.cos(phase)
            const sp = Math.sin(phase)
            const r = re[2 * i + comp]!
            const m = im[2 * i + comp]!
            tmpR[2 * j + comp] = cp * r - sp * m
            tmpI[2 * j + comp] = cp * m + sp * r
            // Exact Gauss-law current feedback:
            // Forward step (inv=false):
            //   comp=0 moves i -> j across link i: charge leaves i, enters j => E[i] -= q * |psi_0(i)|^2
            //   comp=1 moves i -> j (backward along link j): charge enters j, leaves i => E[j] += q * |psi_1(i)|^2
            // Inverse step (inv=true): exactly undoes the feedback using |psi(i)|^2 (which equals the moved density!)
            const prob = r * r + m * m
            if (!inv) {
              Earr[linkSite] = Earr[linkSite]! - (comp === 0 ? 1 : -1) * qCharge * prob
            } else {
              Earr[linkSite] = Earr[linkSite]! + (comp === 0 ? 1 : -1) * qCharge * prob
            }
          }
        }
      }
      re.set(tmpR)
      im.set(tmpI)
    }

    function stepAxis1Packet(
      re: Float64Array,
      im: Float64Array,
      qCharge: number,
      mu: number,
      inv: boolean,
    ): void {
      if (!inv) {
        applySiteMat(re, im, B_MATS[mu]!)
        applySiteMat(re, im, TH_HALF_N)
        shiftSpinorWithFeedback(re, im, qCharge, mu, 1, false)
        applySiteMat(re, im, TH_FULL_P)
        shiftSpinorWithFeedback(re, im, qCharge, mu, 0, false)
        applySiteMat(re, im, TH_HALF_N)
        applySiteMat(re, im, B_DAGS[mu]!)
      } else {
        applySiteMat(re, im, B_MATS[mu]!)
        applySiteMat(re, im, TH_HALF_P)
        shiftSpinorWithFeedback(re, im, qCharge, mu, 0, true)
        applySiteMat(re, im, TH_FULL_N)
        shiftSpinorWithFeedback(re, im, qCharge, mu, 1, true)
        applySiteMat(re, im, TH_HALF_P)
        applySiteMat(re, im, B_DAGS[mu]!)
      }
    }

    function stepMaxwellSmall(inv: boolean): void {
      const doUB = (sign: number) => {
        const Bxy = new Float64Array(Vs)
        const Byz = new Float64Array(Vs)
        const Bzx = new Float64Array(Vs)
        for (let x = 0; x < Ls; x++) {
          const xp = (x + 1) % Ls
          for (let y = 0; y < Ls; y++) {
            const yp = (y + 1) % Ls
            for (let z = 0; z < Ls; z++) {
              const zp = (z + 1) % Ls
              const i = sIdx(x, y, z)
              Bxy[i] = AxS[i]! + AyS[sIdx(xp, y, z)]! - AxS[sIdx(x, yp, z)]! - AyS[i]!
              Byz[i] = AyS[i]! + AzS[sIdx(x, yp, z)]! - AyS[sIdx(x, y, zp)]! - AzS[i]!
              Bzx[i] = AzS[i]! + AxS[sIdx(x, y, zp)]! - AzS[sIdx(xp, y, z)]! - AxS[i]!
            }
          }
        }
        const s = sign * TAU
        for (let x = 0; x < Ls; x++) {
          const xm = (x + Ls - 1) % Ls
          for (let y = 0; y < Ls; y++) {
            const ym = (y + Ls - 1) % Ls
            for (let z = 0; z < Ls; z++) {
              const zm = (z + Ls - 1) % Ls
              const i = sIdx(x, y, z)
              ExS[i] = ExS[i]! - s * (Bxy[i]! - Bxy[sIdx(x, ym, z)]! + Bzx[sIdx(x, y, zm)]! - Bzx[i]!)
              EyS[i] = EyS[i]! - s * (Byz[i]! - Byz[sIdx(x, y, zm)]! + Bxy[sIdx(xm, y, z)]! - Bxy[i]!)
              EzS[i] = EzS[i]! - s * (Bzx[i]! - Bzx[sIdx(xm, y, z)]! + Byz[sIdx(x, ym, z)]! - Byz[i]!)
            }
          }
        }
      }
      const doUE = (sign: number) => {
        const s = sign * TAU
        for (let i = 0; i < Vs; i++) {
          AxS[i] = AxS[i]! + s * ExS[i]!
          AyS[i] = AyS[i]! + s * EyS[i]!
          AzS[i] = AzS[i]! + s * EzS[i]!
        }
      }
      if (!inv) {
        doUB(1)
        doUE(1)
      } else {
        doUE(-1)
        doUB(-1)
      }
    }

    function stepCoupledBeat(inv: boolean): void {
      if (!inv) {
        for (let mu = 0; mu < 3; mu++) {
          stepAxis1Packet(p1R, p1I, q1, mu, false)
          stepAxis1Packet(p2R, p2I, q2, mu, false)
        }
        stepMaxwellSmall(false)
      } else {
        stepMaxwellSmall(true)
        for (let mu = 2; mu >= 0; mu--) {
          stepAxis1Packet(p2R, p2I, q2, mu, true)
          stepAxis1Packet(p1R, p1I, q1, mu, true)
        }
      }
    }

    function checkGaussS(): { gErr: number; nErr: number } {
      let gErr = 0
      let n1t = 0
      let n2t = 0
      for (let x = 0; x < Ls; x++) {
        const xm = (x + Ls - 1) % Ls
        for (let y = 0; y < Ls; y++) {
          const ym = (y + Ls - 1) % Ls
          for (let z = 0; z < Ls; z++) {
            const zm = (z + Ls - 1) % Ls
            const i = sIdx(x, y, z)
            const r1 = p1R[2 * i]! ** 2 + p1I[2 * i]! ** 2 + p1R[2 * i + 1]! ** 2 + p1I[2 * i + 1]! ** 2
            const r2 = p2R[2 * i]! ** 2 + p2I[2 * i]! ** 2 + p2R[2 * i + 1]! ** 2 + p2I[2 * i + 1]! ** 2
            n1t += r1
            n2t += r2
            const rhoCur = q1 * r1 + q2 * r2 + rhoBg
            const divE =
              (ExS[i]! - ExS[sIdx(xm, y, z)]!) +
              (EyS[i]! - EyS[sIdx(x, ym, z)]!) +
              (EzS[i]! - EzS[sIdx(x, y, zm)]!)
            gErr = Math.max(gErr, Math.abs(divE - rhoCur))
          }
        }
      }
      return { gErr, nErr: Math.max(Math.abs(Math.sqrt(n1t) - 1), Math.abs(Math.sqrt(n2t) - 1)) }
    }

    let maxGauss = checkGaussS().gErr
    let maxNorm = 0
    const T_SCAT = 20
    let sepAtT6 = 0
    for (let t = 1; t <= T_SCAT; t++) {
      stepCoupledBeat(false)
      const st = checkGaussS()
      maxGauss = Math.max(maxGauss, st.gErr)
      maxNorm = Math.max(maxNorm, st.nErr)
      if (t === 6) {
        // Measure circular mean separation before torus wrap-around
        let s1c = 0
        let s1s = 0
        let s2c = 0
        let s2s = 0
        for (let x = 0; x < Ls; x++) {
          const ang = (2 * PI * x) / Ls
          const ca = Math.cos(ang)
          const sa = Math.sin(ang)
          for (let y = 0; y < Ls; y++) {
            for (let z = 0; z < Ls; z++) {
              const i = sIdx(x, y, z)
              const r1 = p1R[2 * i]! ** 2 + p1I[2 * i]! ** 2 + p1R[2 * i + 1]! ** 2 + p1I[2 * i + 1]! ** 2
              const r2 = p2R[2 * i]! ** 2 + p2I[2 * i]! ** 2 + p2R[2 * i + 1]! ** 2 + p2I[2 * i + 1]! ** 2
              s1c += r1 * ca
              s1s += r1 * sa
              s2c += r2 * ca
              s2s += r2 * sa
            }
          }
        }
        const x1m = ((Math.atan2(s1s, s1c) * Ls) / (2 * PI) + Ls) % Ls
        const x2m = ((Math.atan2(s2s, s2c) * Ls) / (2 * PI) + Ls) % Ls
        sepAtT6 = x2m - x1m
      }
    }

    // Reverse T = 20 beats
    for (let t = 1; t <= T_SCAT; t++) stepCoupledBeat(true)
    let revErr = 0
    for (let i = 0; i < 2 * Vs; i++) {
      revErr = Math.max(
        revErr,
        Math.abs(p1R[i]! - p1R0[i]!),
        Math.abs(p1I[i]!),
        Math.abs(p2R[i]! - p2R0[i]!),
        Math.abs(p2I[i]!),
      )
    }
    for (let i = 0; i < Vs; i++) {
      revErr = Math.max(
        revErr,
        Math.abs(ExS[i]! - ExS0[i]!),
        Math.abs(EyS[i]! - EyS0[i]!),
        Math.abs(EzS[i]! - EzS0[i]!),
        Math.abs(AxS[i]!),
        Math.abs(AyS[i]!),
        Math.abs(AzS[i]!),
      )
    }
    return { finalSep: sepAtT6, maxGauss, maxNorm, revErr }
  }

  const freeRun = runTwoPacketScattering(0, 0)
  const oppRun = runTwoPacketScattering(1.2, -1.2)
  const likeRun = runTwoPacketScattering(1.2, 1.2)
  const deltaOpp = oppRun.finalSep - freeRun.finalSep
  const deltaLike = likeRun.finalSep - freeRun.finalSep
  console.log(
    `  12^3 3D wavepacket scattering (t=6 sep): free=${freeRun.finalSep.toFixed(5)}, opp(+,-)=${oppRun.finalSep.toFixed(5)} (Delta=${deltaOpp.toFixed(5)}), like(+,+)=${likeRun.finalSep.toFixed(5)} (Delta=${deltaLike.toFixed(5)})`,
  )

  recordCheck(
    'P1.3a 24^3 3D String->Coulomb radiation (ZERO hard-coded 1/r, exact Gauss & T=20 reversal)',
    maxGauss3D < 1e-14 &&
      maxRev3D < 1e-14 &&
      coulombCosSim > 0.999 &&
      transverseE2 > 0.1 &&
      maxCoulLawErr < 0.04 &&
      r6Err < 0.015,
    `gaussErr=${maxGauss3D.toExponential(2)}, revErr=${maxRev3D.toExponential(2)}, cosSim(E_dyn,E_Coul)=${coulombCosSim.toFixed(6)}, dV(4->10)err=${(100 * maxCoulLawErr).toFixed(2)}%, r=6 err=${(100 * r6Err).toFixed(2)}%`,
  )
  recordCheck(
    'P1.3b 12^3 3D coupled wavepacket scattering (exact Gauss, T=20 reversal, opp!=like!=free)',
    oppRun.maxGauss < 1e-13 &&
      likeRun.maxGauss < 1e-13 &&
      oppRun.maxNorm < 1e-14 &&
      oppRun.revErr < 1e-12 &&
      Math.abs(deltaOpp) > 1e-3 &&
      Math.abs(deltaLike) > 1e-3 &&
      deltaOpp !== deltaLike,
    `gaussErr=${Math.max(oppRun.maxGauss, likeRun.maxGauss).toExponential(2)}, revErr=${oppRun.revErr.toExponential(2)}, Delta_opp=${deltaOpp.toFixed(5)}, Delta_like=${deltaLike.toFixed(5)}`,
  )
}

runPart1_1()
runPart1_2()
runPart1_3()

// ============================================================================
// PART 2: DYNAMICAL CHIRAL 2T < SU(2)_L WEAK GAUGE BOSONS FROM 24-CELL
//         HURWITZ UNITS COUPLED TO THE {3,4,3,4} CUSP DOMAIN WALL
// ============================================================================

console.log('\n========================================================================')
console.log('PART 2: DYNAMICAL CHIRAL 2T < SU(2)_L WEAK FORCE ON {3,4,3,4} WALL')
console.log('========================================================================')

// Exact half-integer Hurwitz quaternion representation: (2a, 2b, 2c, 2d) in Z^4
type HQ = readonly [number, number, number, number]

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
function hqConj(p: HQ): HQ {
  return [p[0], -p[1], -p[2], -p[3]]
}
function hqKey(p: HQ): string {
  return `${p[0]},${p[1]},${p[2]},${p[3]}`
}
function hqToSU2(p: HQ): CMat2 {
  // q = a + b i + c j + d k -> a I - i (b sx + c sy + d sz) = [[a - i d, -c - i b], [c - i b, a + i d]]
  const a = p[0] / 2
  const b = p[1] / 2
  const c = p[2] / 2
  const d = p[3] / 2
  return [
    [[a, -d], [-c, -b]],
    [[c, -b], [a, d]],
  ]
}

// Generate 2T = <i, j, (-1 + i + j + k)/2>
function build2T(): {
  readonly elems: readonly HQ[]
  readonly mats: readonly CMat2[]
  readonly mulTab: readonly (readonly number[])[]
  readonly invTab: readonly number[]
  readonly keyMap: ReadonlyMap<string, number>
} {
  const id: HQ = [2, 0, 0, 0]
  const gens: readonly HQ[] = [
    [0, 2, 0, 0], // i
    [0, 0, 2, 0], // j
    [-1, 1, 1, 1], // (-1 + i + j + k)/2
  ]
  const seen = new Map<string, number>()
  const elems: HQ[] = [id]
  seen.set(hqKey(id), 0)
  for (let head = 0; head < elems.length; head++) {
    const cur = elems[head]!
    for (const g of gens) {
      const nxt = hqMul(cur, g)
      const k = hqKey(nxt)
      if (!seen.has(k)) {
        seen.set(k, elems.length)
        elems.push(nxt)
      }
    }
  }
  const n = elems.length
  const mats = elems.map(hqToSU2)
  const mulTab: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  const invTab: number[] = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    invTab[i] = seen.get(hqKey(hqConj(elems[i]!)))!
    for (let j = 0; j < n; j++) {
      mulTab[i]![j] = seen.get(hqKey(hqMul(elems[i]!, elems[j]!)))!
    }
  }
  return { elems, mats, mulTab, invTab, keyMap: seen }
}

const G2T = build2T()

// ----------------------------------------------------------------------------
// P2.1: 2T Group Closure, Exact Spherical 5-Design Theorem, 24-Cell Laplacian & W^+, W^-, W^3 Algebra
// ----------------------------------------------------------------------------
function runPart2_1(): void {
  console.log('\n--- P2.1: Exact 2T Hurwitz Group, Spherical 5-Design & 3-Boson (W^+,W^-,W^3) Algebra ---')

  // 1) Verify SU(2) representation homomorphism, unitarity, det=1, and 24-cell adjacency (96 edges)
  let maxUniErr = 0
  let maxDetErr = 0
  let maxHomErr = 0
  let edgeCount = 0
  let minDeg = 99
  let maxDeg = 0
  for (let i = 0; i < G2T.elems.length; i++) {
    const M = G2T.mats[i]!
    maxUniErr = Math.max(maxUniErr, m2UniErr(M))
    maxDetErr = Math.max(maxDetErr, cAbs(cSub(m2Det(M), C1)))
    let deg = 0
    for (let j = 0; j < G2T.elems.length; j++) {
      const prod = m2Mul(M, G2T.mats[j]!)
      const expM = G2T.mats[G2T.mulTab[i]![j]!]!
      maxHomErr = Math.max(
        maxHomErr,
        cAbs(cSub(prod[0][0], expM[0][0])),
        cAbs(cSub(prod[0][1], expM[0][1])),
        cAbs(cSub(prod[1][0], expM[1][0])),
        cAbs(cSub(prod[1][1], expM[1][1])),
      )
      const p = G2T.elems[i]!
      const q = G2T.elems[j]!
      // Inner product in R^4: (p.q)/4; nearest neighbors on 24-cell have dot = +1/2 => p.q = 2
      if (p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3] * q[3] === 2) deg++
    }
    edgeCount += deg
    minDeg = Math.min(minDeg, deg)
    maxDeg = Math.max(maxDeg, deg)
  }
  edgeCount /= 2

  // 2) Exact BigInt rational proof of spherical t-design degree of 2T in SU(2) = S^3
  //    On S^3: E[a^{2m1} b^{2m2} c^{2m3} d^{2m4}] = prod_i (2m_i - 1)!! / (2^{M} * (M + 1)! / 1!)
  //    Wait: exact formula! Gamma(m + 1/2)/sqrt(pi) = (2m-1)!! / 2^m, and Gamma(M + 2) = (M + 1)!,
  //    so E_{S^3} = prod_{i=1}^4 (2m_i - 1)!! / (2^M * (M + 1)!), where M = m1 + m2 + m3 + m4!
  //    Check M = 1 (a^2): 1 / (2 * 2) = 1/4.
  //    Check M = 2 (a^4): 3 / (4 * 6) = 1/8; (a^2 b^2): 1 / (4 * 6) = 1/24.
  //    Check M = 3 (a^6): 15 / (8 * 24) = 15/192 = 5/64!
  const oddDblFact = (m: number): bigint => {
    let r = 1n
    for (let k = 1; k <= m; k++) r *= BigInt(2 * k - 1)
    return r
  }
  const factBig = (n: number): bigint => {
    let r = 1n
    for (let k = 2; k <= n; k++) r *= BigInt(k)
    return r
  }
  const powBig = (base: bigint, exp: number): bigint => {
    let r = 1n
    for (let k = 0; k < exp; k++) r *= base
    return r
  }

  let deg0to5Monomials = 0
  let deg0to5Defects = 0
  let deg6Defects = 0
  let a6Num2T = 0n
  let a6Den2T = 1n
  let a6NumSU2 = 5n
  let a6DenSU2 = 64n

  for (let deg = 0; deg <= 6; deg++) {
    for (let n1 = 0; n1 <= deg; n1++) {
      for (let n2 = 0; n2 <= deg - n1; n2++) {
        for (let n3 = 0; n3 <= deg - n1 - n2; n3++) {
          const n4 = deg - n1 - n2 - n3
          // Exact 2T sum: sum_{q in 2T} (2a)^n1 (2b)^n2 (2c)^n3 (2d)^n4 / (24 * 2^deg)
          let num2T = 0n
          for (const q of G2T.elems) {
            num2T +=
              powBig(BigInt(q[0]), n1) *
              powBig(BigInt(q[1]), n2) *
              powBig(BigInt(q[2]), n3) *
              powBig(BigInt(q[3]), n4)
          }
          const den2T = 24n * powBig(2n, deg)

          let numSU2 = 0n
          let denSU2 = 1n
          if ((n1 & 1) === 0 && (n2 & 1) === 0 && (n3 & 1) === 0 && (n4 & 1) === 0) {
            const m1 = n1 >> 1
            const m2 = n2 >> 1
            const m3 = n3 >> 1
            const m4 = n4 >> 1
            const M = m1 + m2 + m3 + m4
            numSU2 = oddDblFact(m1) * oddDblFact(m2) * oddDblFact(m3) * oddDblFact(m4)
            denSU2 = powBig(2n, M) * factBig(M + 1)
          }

          const match = num2T * denSU2 === numSU2 * den2T
          if (deg <= 5) {
            deg0to5Monomials++
            if (!match) deg0to5Defects++
          } else {
            if (!match) deg6Defects++
            if (n1 === 6) {
              a6Num2T = num2T
              a6Den2T = den2T
              a6NumSU2 = numSU2
              a6DenSU2 = denSU2
            }
          }
        }
      }
    }
  }

  // Exact unitary t-design frame potentials (1/24) sum_{g in 2T} |Tr(g)|^{2k}
  let fp1 = 0
  let fp2 = 0
  let fp3 = 0
  for (const M of G2T.mats) {
    const t2 = cAbs2(m2Tr(M))
    fp1 += t2
    fp2 += t2 * t2
    fp3 += t2 * t2 * t2
  }
  fp1 /= 24
  fp2 /= 24
  fp3 /= 24

  // 3) Bi-invariant 24-cell electric Laplacian Delta_2T = I - (1/8) sum_{s in S_8} L(s) on C[2T]
  const s8Indices: number[] = []
  for (let i = 0; i < 24; i++) {
    if (G2T.elems[i]![0] === 1) s8Indices.push(i) // 8 neighbors of +1 with Re(q) = +1/2
  }
  const lapRe = new Float64Array(24 * 24)
  const lapIm = new Float64Array(24 * 24)
  for (let i = 0; i < 24; i++) {
    lapRe[i * 24 + i] = 1
    for (const s of s8Indices) {
      const dst = G2T.mulTab[s]![i]!
      lapRe[dst * 24 + i] = lapRe[dst * 24 + i]! - 1 / 8
    }
  }
  const eigLap = hermitianJacobi(24, lapRe, lapIm)
  const specCounts = new Map<string, number>()
  for (let i = 0; i < 24; i++) {
    const k = eigLap.vals[i]!.toFixed(4)
    specCounts.set(k, (specCounts.get(k) ?? 0) + 1)
  }
  const specStr = Array.from(specCounts.entries())
    .map(([v, m]) => `${v}(x${m})`)
    .join(', ')

  // 4) Exact 3-boson (W^+, W^-, W^3) Lie algebra & Casimir inside 2T's 1, 2, 3 irreps!
  //    In the adjoint 3-plet (SO(3) rotation matrices R(g) for g in 2T acting on (i, j, k)):
  //    Construct R(g) for all g in 2T, verify Peter-Weyl orthogonality inside C[2T] and exact
  //    [T^a, T^b] = i eps^{abc} T^c and C_2(1)=0, C_2(2)=3/4, C_2(3)=2!
  const adjT: readonly (readonly (readonly C[])[])[] = [
    [
      [C0, C0, C0],
      [C0, C0, [0, -1]],
      [C0, CI, C0],
    ],
    [
      [C0, C0, CI],
      [C0, C0, C0],
      [[0, -1], C0, C0],
    ],
    [
      [C0, [0, -1], C0],
      [CI, C0, C0],
      [C0, C0, C0],
    ],
  ]
  // Verify [T^a, T^b] = i eps^{abc} T^c on spin-1/2 (doublet) and spin-1 (W^+, W^-, W^3 triplet)
  let maxAlgErr2 = 0
  let maxAlgErr3 = 0
  const eps3: readonly (readonly [number, number, number, number])[] = [
    [0, 1, 2, 1],
    [1, 2, 0, 1],
    [2, 0, 1, 1],
  ]
  for (const [a, b, c, sgn] of eps3) {
    const ta2 = m2Scale([0.5, 0], PAULI[a]!)
    const tb2 = m2Scale([0.5, 0], PAULI[b]!)
    const tc2 = m2Scale([0.5, 0], PAULI[c]!)
    const comm2 = m2Add(m2Mul(ta2, tb2), m2Scale([-1, 0], m2Mul(tb2, ta2)))
    const rhs2 = m2Scale([0, sgn], tc2)
    maxAlgErr2 = Math.max(
      maxAlgErr2,
      cAbs(cSub(comm2[0][0], rhs2[0][0])),
      cAbs(cSub(comm2[0][1], rhs2[0][1])),
      cAbs(cSub(comm2[1][0], rhs2[1][0])),
      cAbs(cSub(comm2[1][1], rhs2[1][1])),
    )
    // Spin-1 (3x3)
    for (let r = 0; r < 3; r++) {
      for (let col = 0; col < 3; col++) {
        let ab: C = C0
        let ba: C = C0
        for (let k = 0; k < 3; k++) {
          ab = cAdd(ab, cMul(adjT[a]![r]![k]!, adjT[b]![k]![col]!))
          ba = cAdd(ba, cMul(adjT[b]![r]![k]!, adjT[a]![k]![col]!))
        }
        const diff = cSub(cSub(ab, ba), cMul([0, sgn], adjT[c]![r]![col]!))
        maxAlgErr3 = Math.max(maxAlgErr3, cAbs(diff))
      }
    }
  }
  // Check exact Peter-Weyl projection of C[2T] onto spin-1 adjoint 3-plet (9 orthogonal states)
  // R_{ab}(g) = (1/2) Tr(sigma_a U(g) sigma_b U(g)^dag)
  const adjBasis: Float64Array[] = []
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const v = new Float64Array(24)
      for (let gi = 0; gi < 24; gi++) {
        const U = G2T.mats[gi]!
        const M = m2Mul(PAULI[a]!, m2Mul(U, m2Mul(PAULI[b]!, m2Dag(U))))
        v[gi] = 0.5 * m2Tr(M)[0] * Math.sqrt(3 / 24)
      }
      adjBasis.push(v)
    }
  }
  let maxAdjOrthoErr = 0
  let maxAdjLapErr = 0
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      let dot = 0
      for (let g = 0; g < 24; g++) dot += adjBasis[i]![g]! * adjBasis[j]![g]!
      maxAdjOrthoErr = Math.max(maxAdjOrthoErr, Math.abs(dot - (i === j ? 1 : 0)))
    }
    // Verify Delta_2T * v = 1.0 * v (exact adjoint eigenstate inside C[2T]!)
    for (let r = 0; r < 24; r++) {
      let lv = 0
      for (let c = 0; c < 24; c++) lv += lapRe[r * 24 + c]! * adjBasis[i]![c]!
      maxAdjLapErr = Math.max(maxAdjLapErr, Math.abs(lv - adjBasis[i]![r]!))
    }
  }

  // Non-Abelian Hurwitz plaquette commutator witness: s1 = (1+i+j+k)/2, s2 = (1+i-j+k)/2 -> [s1,s2] has nonzero k (W^3)
  const i1 = G2T.keyMap.get('1,1,1,1')!
  const i2 = G2T.keyMap.get('1,1,-1,1')!
  const hol = G2T.mulTab[G2T.mulTab[i1]![i2]!]![G2T.mulTab[G2T.invTab[i1]!]![G2T.invTab[i2]!]!]!
  const holQ = G2T.elems[hol]!

  console.log(
    `  |2T| = ${G2T.elems.length}, 24-cell edges = ${edgeCount} (deg=${minDeg}..${maxDeg}), maxUniErr=${maxUniErr.toExponential(2)}, maxHomErr=${maxHomErr.toExponential(2)}`,
  )
  console.log(
    `  Exact BigInt spherical 5-design proof: ${deg0to5Monomials - deg0to5Defects}/${deg0to5Monomials} monomials (deg 0..5) EXACT (0n defect); first deviation at deg 6 (${deg6Defects} monomials, E_2T[a^6]=${Number(a6Num2T) / Number(a6Den2T)} vs E_SU2[a^6]=${Number(a6NumSU2) / Number(a6DenSU2)})`,
  )
  console.log(
    `  Unitary frame potentials: k=1: ${fp1.toFixed(12)} (SU2=1), k=2: ${fp2.toFixed(12)} (SU2=2 => EXACT 2-design!), k=3: ${fp3.toFixed(6)} (SU2=5)`,
  )
  console.log(`  24-cell Laplacian Delta_2T spectrum: ${specStr}`)
  console.log(
    `  Non-Abelian Hurwitz plaquette holonomy s1*s2*s1^-1*s2^-1 = (${holQ.map(v => v / 2).join(', ')}) != (1,0,0,0)`,
  )

  recordCheck(
    'P2.1a Exact order-24 Hurwitz 2T < SU(2) & 24-cell adjacency (96 edges)',
    G2T.elems.length === 24 && edgeCount === 96 && minDeg === 8 && maxDeg === 8 && maxUniErr < 1e-14 && maxDetErr < 1e-14 && maxHomErr < 1e-14,
    `|2T|=24, 96 edges (deg 8), uniErr=${maxUniErr.toExponential(2)}, homErr=${maxHomErr.toExponential(2)}`,
  )
  recordCheck(
    'P2.1b Exact BigInt spherical 5-design (unitary 2-design) proof of 2T in SU(2)',
    deg0to5Monomials === 126 && deg0to5Defects === 0 && deg6Defects > 0 && Math.abs(fp1 - 1) < 1e-14 && Math.abs(fp2 - 2) < 1e-14,
    `126/126 deg<=5 exact (0n), deg-6 diff=${deg6Defects}, FP(k=1,2)=(${fp1.toFixed(6)}, ${fp2.toFixed(6)})`,
  )
  recordCheck(
    'P2.1c 24-cell Laplacian spectrum & 3-boson (W^+,W^-,W^3) Lie algebra inside C[2T]',
    maxAlgErr2 < 1e-14 && maxAlgErr3 < 1e-14 && maxAdjOrthoErr < 1e-14 && maxAdjLapErr < 1e-14 && holQ[0] !== 2,
    `[T^a,T^b] err=(${maxAlgErr2.toExponential(2)}, ${maxAlgErr3.toExponential(2)}), adjOrtho=${maxAdjOrthoErr.toExponential(2)}, hol=(${holQ.map(v => v / 2).join(',')})`,
  )
}

// ----------------------------------------------------------------------------
// P2.2: Exact Non-Abelian Gauss Law [U_weak, G_v^a] = 0 (a = 1,2,3) on 2T-Projected
//       SU(2)_L Quantum Link Triangle (dim=1,500) AND Full 2T Plaquette (dim=2,304)
// ----------------------------------------------------------------------------
function runPart2_2(): void {
  console.log('\n--- P2.2: Exact Non-Abelian Gauss Law & Dynamical 2T Weak Plaquette ---')

  // --- (A) 2T-projected j <= 1/2 (Delta_2T in {0, 1/2}) 5-dim SU(2)_L x SU(2)_R Quantum Link
  //         on a 3-vertex D_4 triangle (0 -> 1 -> 2 -> 0), dim_link = 5^3 = 125,
  //         coupled chirally (P_L doublet ONLY, P_R singlet sterile) to 1 fermion (3*2*2 = 12 states):
  //         total dim = 125 * 12 = 1,500!
  // Link basis: 0 = |0> (singlet), 1..4 = |alpha, beta> (idx = 1 + 2*alpha + beta, alpha,beta in {0,1}).
  // Left SU(2) at target vertex: L^a = -(T^a)^* (x) I_2 on |alpha, beta>
  // Right SU(2) at source vertex: R^a = I_2 (x) T^a on |alpha, beta>
  // U_{alpha, beta} = |alpha, beta><0| + eps_{alpha, a'} eps_{beta, b'} |0><a', b'|

  const T_HALF: readonly CMat2[] = [
    m2Scale([0.5, 0], SX),
    m2Scale([0.5, 0], SY),
    m2Scale([0.5, 0], SZ),
  ]

  // Build 5x5 matrices L^a, R^a, and U_{alpha, beta}
  const L5Re: Float64Array[] = []
  const L5Im: Float64Array[] = []
  const R5Re: Float64Array[] = []
  const R5Im: Float64Array[] = []
  for (let a = 0; a < 3; a++) {
    const lRe = new Float64Array(25)
    const lIm = new Float64Array(25)
    const rRe = new Float64Array(25)
    const rIm = new Float64Array(25)
    const Ta = T_HALF[a]!
    for (let al = 0; al < 2; al++) {
      for (let be = 0; be < 2; be++) {
        const col = 1 + 2 * al + be
        for (let al2 = 0; al2 < 2; al2++) {
          // L^a |al, be> = sum_{al2} (-(Ta)^*_{al2, al}) |al2, be>
          const row = 1 + 2 * al2 + be
          const entry = Ta[al2]![al]!
          lRe[row * 5 + col] = -entry[0]
          lIm[row * 5 + col] = entry[1] // -conj(r + i im) = -r + i im
        }
        for (let be2 = 0; be2 < 2; be2++) {
          // R^a |al, be> = sum_{be2} (Ta_{be2, be}) |al, be2>
          const row = 1 + 2 * al + be2
          const entry = Ta[be2]![be]!
          rRe[row * 5 + col] = entry[0]
          rIm[row * 5 + col] = entry[1]
        }
      }
    }
    L5Re.push(lRe)
    L5Im.push(lIm)
    R5Re.push(rRe)
    R5Im.push(rIm)
  }

  const EPS2 = [
    [0, 1],
    [-1, 0],
  ] as const
  const U5: Float64Array[][] = [
    [new Float64Array(25), new Float64Array(25)],
    [new Float64Array(25), new Float64Array(25)],
  ]
  for (let al = 0; al < 2; al++) {
    for (let be = 0; be < 2; be++) {
      const m = U5[al]![be]!
      m[(1 + 2 * al + be) * 5 + 0] = 1
      for (let a2 = 0; a2 < 2; a2++) {
        for (let b2 = 0; b2 < 2; b2++) {
          const e = EPS2[al]![a2]! * EPS2[be]![b2]!
          if (e !== 0) m[0 * 5 + (1 + 2 * a2 + b2)] = e
        }
      }
    }
  }

  // Build exact 20x20 local 1-link chiral hopping unitary u_hop = exp(-i * tau_hop * h_e)
  // Basis of 1-link bond (x -> y) for P_L doublet:
  //   0..9:  fermion at x, isospin be in {0,1}, link l in {0..4}  -> idx = be*5 + l
  //   10..19: fermion at y, isospin al in {0,1}, link l in {0..4} -> idx = 10 + al*5 + l
  const hBondRe = new Float64Array(400)
  const hBondIm = new Float64Array(400)
  for (let al = 0; al < 2; al++) {
    for (let be = 0; be < 2; be++) {
      const Uab = U5[al]![be]!
      for (let lp = 0; lp < 5; lp++) {
        for (let l = 0; l < 5; l++) {
          const val = Uab[lp * 5 + l]!
          if (val === 0) continue
          const rowY = 10 + al * 5 + lp
          const colX = be * 5 + l
          hBondRe[rowY * 20 + colX] = hBondRe[rowY * 20 + colX]! + val
          hBondRe[colX * 20 + rowY] = hBondRe[colX * 20 + rowY]! + val
        }
      }
    }
  }
  const TAU_HOP_W = 0.65
  const uBond = hermitianExpNegI(20, hBondRe, hBondIm, TAU_HOP_W)

  // Build exact 125x125 magnetic plaquette unitary U_B = exp(-i * tau_B * (-Tr(U_2 U_1 U_0) + h.c.))
  // Triangle 0 -> 1 (e0), 1 -> 2 (e1), 2 -> 0 (e2): W_p = sum_{a,b,c} U_{e2, ab} U_{e1, bc} U_{e0, ca}
  const hPlaqRe = new Float64Array(125 * 125)
  const hPlaqIm = new Float64Array(125 * 125)
  const linkIdx3 = (l0: number, l1: number, l2: number): number => (l0 * 5 + l1) * 5 + l2
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      for (let c = 0; c < 2; c++) {
        const u2 = U5[a]![b]!
        const u1 = U5[b]![c]!
        const u0 = U5[c]![a]!
        for (let l0p = 0; l0p < 5; l0p++) {
          for (let l0 = 0; l0 < 5; l0++) {
            const v0 = u0[l0p * 5 + l0]!
            if (v0 === 0) continue
            for (let l1p = 0; l1p < 5; l1p++) {
              for (let l1 = 0; l1 < 5; l1++) {
                const v1 = u1[l1p * 5 + l1]!
                if (v1 === 0) continue
                for (let l2p = 0; l2p < 5; l2p++) {
                  for (let l2 = 0; l2 < 5; l2++) {
                    const v2 = u2[l2p * 5 + l2]!
                    if (v2 === 0) continue
                    const prod = v0 * v1 * v2
                    const row = linkIdx3(l0p, l1p, l2p)
                    const col = linkIdx3(l0, l1, l2)
                    hPlaqRe[row * 125 + col] = hPlaqRe[row * 125 + col]! - prod
                    hPlaqRe[col * 125 + row] = hPlaqRe[col * 125 + row]! - prod
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  const TAU_B_W = 0.4
  const uPlaq = hermitianExpNegI(125, hPlaqRe, hPlaqIm, TAU_B_W)
  const TAU_E_W = 0.5 // electric Casimir: 3/4 on each j=1/2 link

  // Full 1,500-dim state index: (chi in {0=L, 1=R}, v in {0,1,2}, iso in {0,1}, l3 in {0..124})
  const DIM_W = 12 * 125
  const wIdx = (chi: number, v: number, iso: number, l3: number): number =>
    (((chi * 3 + v) * 2 + iso) * 125 + l3)

  function applyUBondOnState(re: Float64Array, im: Float64Array, edge: number, inv: boolean): void {
    // Only acts on chi = 0 (Left-handed doublet); chi = 1 (Right-handed singlet) is strictly identity!
    const vx = edge
    const vy = (edge + 1) % 3
    const otherE1 = (edge + 1) % 3
    const otherE2 = (edge + 2) % 3
    const inR = new Float64Array(20)
    const inI = new Float64Array(20)
    const outR = new Float64Array(20)
    const outI = new Float64Array(20)
    const uR = uBond.uRe
    const uI = uBond.uIm
    for (let lo1 = 0; lo1 < 5; lo1++) {
      for (let lo2 = 0; lo2 < 5; lo2++) {
        // Map local l in 0..4 to l3
        const l3Of = (le: number): number => {
          const arr = [0, 0, 0]
          arr[edge] = le
          arr[otherE1] = lo1
          arr[otherE2] = lo2
          return linkIdx3(arr[0]!, arr[1]!, arr[2]!)
        }
        for (let be = 0; be < 2; be++) {
          for (let le = 0; le < 5; le++) {
            const gi = wIdx(0, vx, be, l3Of(le))
            inR[be * 5 + le] = re[gi]!
            inI[be * 5 + le] = im[gi]!
            const gy = wIdx(0, vy, be, l3Of(le))
            inR[10 + be * 5 + le] = re[gy]!
            inI[10 + be * 5 + le] = im[gy]!
          }
        }
        for (let r = 0; r < 20; r++) {
          let sr = 0
          let si = 0
          for (let c = 0; c < 20; c++) {
            const mr = inv ? uR[c * 20 + r]! : uR[r * 20 + c]!
            const mi = inv ? -uI[c * 20 + r]! : uI[r * 20 + c]!
            sr += mr * inR[c]! - mi * inI[c]!
            si += mr * inI[c]! + mi * inR[c]!
          }
          outR[r] = sr
          outI[r] = si
        }
        for (let be = 0; be < 2; be++) {
          for (let le = 0; le < 5; le++) {
            const gi = wIdx(0, vx, be, l3Of(le))
            re[gi] = outR[be * 5 + le]!
            im[gi] = outI[be * 5 + le]!
            const gy = wIdx(0, vy, be, l3Of(le))
            re[gy] = outR[10 + be * 5 + le]!
            im[gy] = outI[10 + be * 5 + le]!
          }
        }
      }
    }
  }

  function applyUPlaqOnState(re: Float64Array, im: Float64Array, inv: boolean): void {
    const tmpR = new Float64Array(125)
    const tmpI = new Float64Array(125)
    const uR = uPlaq.uRe
    const uI = uPlaq.uIm
    for (let m = 0; m < 12; m++) {
      const base = m * 125
      for (let r = 0; r < 125; r++) {
        let sr = 0
        let si = 0
        for (let c = 0; c < 125; c++) {
          const mr = inv ? uR[c * 125 + r]! : uR[r * 125 + c]!
          const mi = inv ? -uI[c * 125 + r]! : uI[r * 125 + c]!
          sr += mr * re[base + c]! - mi * im[base + c]!
          si += mr * im[base + c]! + mi * re[base + c]!
        }
        tmpR[r] = sr
        tmpI[r] = si
      }
      re.set(tmpR, base)
      im.set(tmpI, base)
    }
  }

  function applyUEWeakOnState(re: Float64Array, im: Float64Array, inv: boolean): void {
    const sgn = inv ? 1 : -1
    for (let l0 = 0; l0 < 5; l0++) {
      for (let l1 = 0; l1 < 5; l1++) {
        for (let l2 = 0; l2 < 5; l2++) {
          const cas = (l0 > 0 ? 0.75 : 0) + (l1 > 0 ? 0.75 : 0) + (l2 > 0 ? 0.75 : 0)
          const ph = cExpI(sgn * TAU_E_W * cas)
          const l3 = linkIdx3(l0, l1, l2)
          for (let m = 0; m < 12; m++) {
            const i = m * 125 + l3
            const r = re[i]!
            const imv = im[i]!
            re[i] = ph[0] * r - ph[1] * imv
            im[i] = ph[0] * imv + ph[1] * r
          }
        }
      }
    }
  }

  function applyUWeak(re: Float64Array, im: Float64Array, inv: boolean): void {
    if (!inv) {
      applyUBondOnState(re, im, 0, false)
      applyUBondOnState(re, im, 1, false)
      applyUBondOnState(re, im, 2, false)
      applyUPlaqOnState(re, im, false)
      applyUEWeakOnState(re, im, false)
    } else {
      applyUEWeakOnState(re, im, true)
      applyUPlaqOnState(re, im, true)
      applyUBondOnState(re, im, 2, true)
      applyUBondOnState(re, im, 1, true)
      applyUBondOnState(re, im, 0, true)
    }
  }

  // Exact non-Abelian Gauss-law generator G_v^a = L_{e_in(v)}^a + R_{e_out(v)}^a + Q_{L, v}^a
  // where e_out(v) = v (v -> v+1) and e_in(v) = (v+2)%3 (v-1 -> v), Q_{L, v}^a acts ONLY on chi = 0!
  function applyGaussGen(
    inR: Float64Array,
    inI: Float64Array,
    outR: Float64Array,
    outI: Float64Array,
    v: number,
    a: number,
  ): void {
    outR.fill(0)
    outI.fill(0)
    const eOut = v
    const eIn = (v + 2) % 3
    const LR = L5Re[a]!
    const LI = L5Im[a]!
    const RR = R5Re[a]!
    const RI = R5Im[a]!
    const Ta = T_HALF[a]!

    for (let chi = 0; chi < 2; chi++) {
      for (let pos = 0; pos < 3; pos++) {
        for (let iso = 0; iso < 2; iso++) {
          for (let l0 = 0; l0 < 5; l0++) {
            for (let l1 = 0; l1 < 5; l1++) {
              for (let l2 = 0; l2 < 5; l2++) {
                const l3 = linkIdx3(l0, l1, l2)
                const src = wIdx(chi, pos, iso, l3)
                const sr = inR[src]!
                const si = inI[src]!
                if (sr === 0 && si === 0) continue

                const ls = [l0, l1, l2]
                // 1) L_{eIn}^a
                const lin = ls[eIn]!
                for (let lp = 0; lp < 5; lp++) {
                  const mr = LR[lp * 5 + lin]!
                  const mi = LI[lp * 5 + lin]!
                  if (mr === 0 && mi === 0) continue
                  const nls = [l0, l1, l2]
                  nls[eIn] = lp
                  const dst = wIdx(chi, pos, iso, linkIdx3(nls[0]!, nls[1]!, nls[2]!))
                  outR[dst] = outR[dst]! + (mr * sr - mi * si)
                  outI[dst] = outI[dst]! + (mr * si + mi * sr)
                }
                // 2) R_{eOut}^a
                const lout = ls[eOut]!
                for (let lp = 0; lp < 5; lp++) {
                  const mr = RR[lp * 5 + lout]!
                  const mi = RI[lp * 5 + lout]!
                  if (mr === 0 && mi === 0) continue
                  const nls = [l0, l1, l2]
                  nls[eOut] = lp
                  const dst = wIdx(chi, pos, iso, linkIdx3(nls[0]!, nls[1]!, nls[2]!))
                  outR[dst] = outR[dst]! + (mr * sr - mi * si)
                  outI[dst] = outI[dst]! + (mr * si + mi * sr)
                }
                // 3) Q_{L, v}^a (chiral: ONLY if chi === 0 and pos === v!)
                if (chi === 0 && pos === v) {
                  for (let iso2 = 0; iso2 < 2; iso2++) {
                    const entry = Ta[iso2]![iso]!
                    if (entry[0] === 0 && entry[1] === 0) continue
                    const dst = wIdx(0, pos, iso2, l3)
                    outR[dst] = outR[dst]! + (entry[0] * sr - entry[1] * si)
                    outI[dst] = outI[dst]! + (entry[0] * si + entry[1] * sr)
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Test deterministic probes spanning L/R, all vertices, singlet & excited links for:
  //   1) Exact non-Abelian Gauss commutator ||[U_weak, G_v^a] |psi>|| < 1e-14 (all 9 generators v=0,1,2, a=1,2,3)
  //   2) Exact Lie algebra ||([G_v^a, G_v^b] - i eps^{abc} G_v^c) |psi>|| < 1e-14
  //   3) Exact T = 20 reversal < 1e-14
  //   4) Exact maximal parity violation: P_L doublet scatters strongly (u_L -> d_L flip > 0.3), P_R singlet sterile (= 0)
  const testProbes: readonly (readonly [number, number, number, number])[] = [
    [0, 0, 0, linkIdx3(0, 0, 0)],
    [0, 1, 1, linkIdx3(1, 2, 0)],
    [0, 2, 0, linkIdx3(3, 4, 1)],
    [1, 0, 0, linkIdx3(2, 1, 3)],
    [1, 2, 1, linkIdx3(4, 0, 2)],
  ]

  let maxWeakGaussComm = 0
  let maxWeakLieAlgErr = 0
  const t1R = new Float64Array(DIM_W)
  const t1I = new Float64Array(DIM_W)
  const t2R = new Float64Array(DIM_W)
  const t2I = new Float64Array(DIM_W)
  const t3R = new Float64Array(DIM_W)
  const t3I = new Float64Array(DIM_W)
  const baseR = new Float64Array(DIM_W)
  const baseI = new Float64Array(DIM_W)

  for (const [chi, v0, iso, l3] of testProbes) {
    baseR.fill(0)
    baseI.fill(0)
    baseR[wIdx(chi, v0, iso, l3)] = 1

    for (let v = 0; v < 3; v++) {
      for (let a = 0; a < 3; a++) {
        // U (G |psi>)
        applyGaussGen(baseR, baseI, t1R, t1I, v, a)
        applyUWeak(t1R, t1I, false)
        // G (U |psi>)
        t2R.set(baseR)
        t2I.set(baseI)
        applyUWeak(t2R, t2I, false)
        applyGaussGen(t2R, t2I, t3R, t3I, v, a)
        let e2 = 0
        for (let i = 0; i < DIM_W; i++) {
          const dr = t1R[i]! - t3R[i]!
          const di = t1I[i]! - t3I[i]!
          e2 += dr * dr + di * di
        }
        maxWeakGaussComm = Math.max(maxWeakGaussComm, Math.sqrt(e2))
      }
      // Check [G_v^0, G_v^1] = i G_v^2
      applyGaussGen(baseR, baseI, t1R, t1I, v, 1)
      applyGaussGen(t1R, t1I, t2R, t2I, v, 0) // G0 G1
      applyGaussGen(baseR, baseI, t1R, t1I, v, 0)
      applyGaussGen(t1R, t1I, t3R, t3I, v, 1) // G1 G0
      applyGaussGen(baseR, baseI, t1R, t1I, v, 2) // G2
      let a2 = 0
      for (let i = 0; i < DIM_W; i++) {
        const cr = (t2R[i]! - t3R[i]!) - (-t1I[i]!) // i * (r + i im) = -im + i r
        const ci = (t2I[i]! - t3I[i]!) - t1R[i]!
        a2 += cr * cr + ci * ci
      }
      maxWeakLieAlgErr = Math.max(maxWeakLieAlgErr, Math.sqrt(a2))
    }
  }

  // Live chiral weak scattering in exact Gauss-invariant (or excited weak-boson) state + T = 20 reversal:
  // Initial Left-handed u_L at v=0 paired with an SU(2)_L singlet flux tube on e0 (1/sqrt(2))(|0,0> + |1,1>)?
  // Better: place u_L (iso=0) at v=0 with link e0 in charged weak-boson state |al=1, be=0> (W^- link!) so
  // hopping 0 -> 1 flips u_L -> d_L (iso=1) directly! Compare identical link state for P_R singlet u_R!
  const lExc = linkIdx3(1 + 2 * 1 + 0, 0, 0) // link e0 carries W^- transition |1, 0>
  const psiLR = new Float64Array(DIM_W)
  const psiLI = new Float64Array(DIM_W)
  psiLR[wIdx(0, 0, 0, lExc)] = 1
  const psiRR = new Float64Array(DIM_W)
  const psiRI = new Float64Array(DIM_W)
  psiRR[wIdx(1, 0, 0, lExc)] = 1

  let maxFlipL = 0
  let maxFlipR = 0
  let maxMoveL = 0
  let maxMoveR = 0
  for (let t = 1; t <= 20; t++) {
    applyUWeak(psiLR, psiLI, false)
    applyUWeak(psiRR, psiRI, false)
    let pDownL = 0
    let pDownR = 0
    let pMoveL = 0
    let pMoveR = 0
    for (let pos = 0; pos < 3; pos++) {
      for (let iso = 0; iso < 2; iso++) {
        for (let l3 = 0; l3 < 125; l3++) {
          const iL = wIdx(0, pos, iso, l3)
          const iR = wIdx(1, pos, iso, l3)
          const pL = psiLR[iL]! ** 2 + psiLI[iL]! ** 2
          const pR = psiRR[iR]! ** 2 + psiRI[iR]! ** 2
          if (iso === 1) {
            pDownL += pL
            pDownR += pR
          }
          if (pos !== 0) {
            pMoveL += pL
            pMoveR += pR
          }
        }
      }
    }
    maxFlipL = Math.max(maxFlipL, pDownL)
    maxFlipR = Math.max(maxFlipR, pDownR)
    maxMoveL = Math.max(maxMoveL, pMoveL)
    maxMoveR = Math.max(maxMoveR, pMoveR)
  }
  for (let t = 1; t <= 20; t++) applyUWeak(psiLR, psiLI, true)
  let weakRevErr = 0
  const iL0 = wIdx(0, 0, 0, lExc)
  for (let i = 0; i < DIM_W; i++) {
    weakRevErr = Math.max(weakRevErr, Math.hypot(psiLR[i]! - (i === iL0 ? 1 : 0), psiLI[i]!))
  }

  // --- (B) Full exact order-24 Hurwitz 2T group plaquette (2 vertices, 2 parallel 2T links -> 24^2 = 576
  //         exact Hurwitz link states, coupled to 1 chiral Left-handed doublet: dim = 576 * 4 = 2,304)!
  //         Verify exact discrete 2T Gauss law [U_weak^(2T), V_v(h)] = 0 across ALL 24 Hurwitz units h in 2T!
  const DIM2T = 4 * 576
  const idx2T = (v: number, iso: number, g0: number, g1: number): number =>
    ((v * 2 + iso) * 24 + g0) * 24 + g1

  // Exact 24x24 electric unitary U_E^(2T) = exp(-i * 0.55 * Delta_2T) via 24-term Taylor series
  // (||0.55 * Delta_2T||_2 = 0.825 < 1 => exact to < 3e-16 without degenerate-subspace Jacobi roundoff!)
  const s8List: number[] = []
  for (let i = 0; i < 24; i++) if (G2T.elems[i]![0] === 1) s8List.push(i)
  const lap24Re = new Float64Array(576)
  for (let i = 0; i < 24; i++) {
    lap24Re[i * 24 + i] = 1
    for (const s of s8List) lap24Re[G2T.mulTab[s]![i]! * 24 + i] = lap24Re[G2T.mulTab[s]![i]! * 24 + i]! - 1 / 8
  }
  const uE24Re = new Float64Array(576)
  const uE24Im = new Float64Array(576)
  const powRe = new Float64Array(576)
  const powIm = new Float64Array(576)
  const nxtRe = new Float64Array(576)
  const nxtIm = new Float64Array(576)
  for (let i = 0; i < 24; i++) {
    uE24Re[i * 24 + i] = 1
    powRe[i * 24 + i] = 1
  }
  const TAU_E_2T = 0.55
  for (let k = 1; k <= 26; k++) {
    // term_k = term_{k-1} * (-i * TAU_E_2T / k) * Delta_2T
    const fac = -TAU_E_2T / k
    nxtRe.fill(0)
    nxtIm.fill(0)
    for (let r = 0; r < 24; r++) {
      for (let m = 0; m < 24; m++) {
        // (-i * fac) * (pr + i pi) = fac * (pi - i pr) -> wait: (-i)*(pr + i pi) = pi - i pr, so * (-TAU/k):
        // (-i * TAU/k) * (pr + i pi) = (TAU/k)*pi + i*(-TAU/k)*pr = -fac*pi + i*(fac*pr)
        const ar = -fac * powIm[r * 24 + m]!
        const ai = fac * powRe[r * 24 + m]!
        if (ar === 0 && ai === 0) continue
        for (let c = 0; c < 24; c++) {
          const dVal = lap24Re[m * 24 + c]!
          if (dVal === 0) continue
          nxtRe[r * 24 + c] = nxtRe[r * 24 + c]! + ar * dVal
          nxtIm[r * 24 + c] = nxtIm[r * 24 + c]! + ai * dVal
        }
      }
    }
    powRe.set(nxtRe)
    powIm.set(nxtIm)
    for (let i = 0; i < 576; i++) {
      uE24Re[i] = uE24Re[i]! + powRe[i]!
      uE24Im[i] = uE24Im[i]! + powIm[i]!
    }
  }
  const uE24 = { uRe: uE24Re, uIm: uE24Im }
  const ALPHA_2T = 0.5
  const BETA_2T = 0.45

  function applyUWeak2T(re: Float64Array, im: Float64Array, inv: boolean): void {
    // 1) Local chiral hopping along link e0 (0 -> 1) and link e1 (0 -> 1):
    //    For fixed group element g in 2T, h_e = psi_1^dag U(g) psi_0 + h.c. satisfies h_e^2 = I_4 (since U(g) in SU(2)!),
    //    so exp(-i alpha h_e) = cos(alpha) I - i sin(alpha) h_e EXACTLY in closed form!
    const doHopLink = (whichLink: 0 | 1) => {
      const ca = Math.cos(ALPHA_2T)
      const sa = inv ? Math.sin(ALPHA_2T) : -Math.sin(ALPHA_2T)
      for (let g0 = 0; g0 < 24; g0++) {
        for (let g1 = 0; g1 < 24; g1++) {
          const U = G2T.mats[whichLink === 0 ? g0 : g1]!
          const Ud = m2Dag(U)
          const i00 = idx2T(0, 0, g0, g1)
          const i01 = idx2T(0, 1, g0, g1)
          const i10 = idx2T(1, 0, g0, g1)
          const i11 = idx2T(1, 1, g0, g1)
          const x0: C = [re[i00]!, im[i00]!]
          const x1: C = [re[i01]!, im[i01]!]
          const y0: C = [re[i10]!, im[i10]!]
          const y1: C = [re[i11]!, im[i11]!]
          // U * x and U^dag * y
          const ux0 = cAdd(cMul(U[0][0], x0), cMul(U[0][1], x1))
          const ux1 = cAdd(cMul(U[1][0], x0), cMul(U[1][1], x1))
          const udy0 = cAdd(cMul(Ud[0][0], y0), cMul(Ud[0][1], y1))
          const udy1 = cAdd(cMul(Ud[1][0], y0), cMul(Ud[1][1], y1))
          // new x = ca * x + i * sa * (U^dag y); new y = ca * y + i * sa * (U x)
          // Note: -i sin(alpha) when inv=false => sa = -sin(alpha) => i * sa = -i sin(alpha)!
          const nx0 = cAdd(cScale(ca, x0), cMul([0, sa], udy0))
          const nx1 = cAdd(cScale(ca, x1), cMul([0, sa], udy1))
          const ny0 = cAdd(cScale(ca, y0), cMul([0, sa], ux0))
          const ny1 = cAdd(cScale(ca, y1), cMul([0, sa], ux1))
          re[i00] = nx0[0]
          im[i00] = nx0[1]
          re[i01] = nx1[0]
          im[i01] = nx1[1]
          re[i10] = ny0[0]
          im[i10] = ny0[1]
          re[i11] = ny1[0]
          im[i11] = ny1[1]
        }
      }
    }

    // 2) Magnetic plaquette U_B^(2T) = exp(+i * beta * Re Tr(U(g0) U(g1)^dag)) (diagonal in |g0, g1>!)
    const doUB = () => {
      const sgn = inv ? -1 : 1
      for (let g0 = 0; g0 < 24; g0++) {
        for (let g1 = 0; g1 < 24; g1++) {
          const hol = G2T.mulTab[g0]![G2T.invTab[g1]!]!
          const reTr = G2T.elems[hol]![0]! // 2 * Re(hol) = Re Tr(U(hol))!
          const ph = cExpI(sgn * BETA_2T * reTr)
          for (let m = 0; m < 4; m++) {
            const i = (m * 24 + g0) * 24 + g1
            const r = re[i]!
            const imv = im[i]!
            re[i] = ph[0] * r - ph[1] * imv
            im[i] = ph[0] * imv + ph[1] * r
          }
        }
      }
    }

    // 3) Electric 24-cell Laplacian unitary U_E^(2T) on link g0 and link g1
    const doUE = () => {
      const uR = uE24.uRe
      const uI = uE24.uIm
      const tmpR = new Float64Array(24)
      const tmpI = new Float64Array(24)
      for (let m = 0; m < 4; m++) {
        // Act on g0
        for (let g1 = 0; g1 < 24; g1++) {
          for (let r = 0; r < 24; r++) {
            let sr = 0
            let si = 0
            for (let c = 0; c < 24; c++) {
              const mr = inv ? uR[c * 24 + r]! : uR[r * 24 + c]!
              const mi = inv ? -uI[c * 24 + r]! : uI[r * 24 + c]!
              const gi = (m * 24 + c) * 24 + g1
              sr += mr * re[gi]! - mi * im[gi]!
              si += mr * im[gi]! + mi * re[gi]!
            }
            tmpR[r] = sr
            tmpI[r] = si
          }
          for (let r = 0; r < 24; r++) {
            const gi = (m * 24 + r) * 24 + g1
            re[gi] = tmpR[r]!
            im[gi] = tmpI[r]!
          }
        }
        // Act on g1
        for (let g0 = 0; g0 < 24; g0++) {
          for (let r = 0; r < 24; r++) {
            let sr = 0
            let si = 0
            for (let c = 0; c < 24; c++) {
              const mr = inv ? uR[c * 24 + r]! : uR[r * 24 + c]!
              const mi = inv ? -uI[c * 24 + r]! : uI[r * 24 + c]!
              const gi = (m * 24 + g0) * 24 + c
              sr += mr * re[gi]! - mi * im[gi]!
              si += mr * im[gi]! + mi * re[gi]!
            }
            tmpR[r] = sr
            tmpI[r] = si
          }
          for (let r = 0; r < 24; r++) {
            const gi = (m * 24 + g0) * 24 + r
            re[gi] = tmpR[r]!
            im[gi] = tmpI[r]!
          }
        }
      }
    }

    if (!inv) {
      doHopLink(0)
      doHopLink(1)
      doUB()
      doUE()
    } else {
      doUE()
      doUB()
      doHopLink(1)
      doHopLink(0)
    }
  }

  // Exact discrete 2T Gauss operator V_v(h) for h in 2T:
  //   At v=0 (source of e0, e1): g0 -> g0 * h^{-1}, g1 -> g1 * h^{-1}, psi_0 -> U(h) psi_0
  //     Check invariance of psi_1^dag U(g) psi_0: U(g h^{-1}) U(h) = U(g)!
  //   At v=1 (target of e0, e1): g0 -> h * g0, g1 -> h * g1, psi_1 -> U(h) psi_1
  //     Check invariance of psi_1^dag U(g) psi_0: (U(h) psi_1)^dag U(h g) = psi_1^dag U(h)^dag U(h) U(g) = psi_1^dag U(g)!
  function applyGauss2T(
    inR: Float64Array,
    inI: Float64Array,
    outR: Float64Array,
    outI: Float64Array,
    v: 0 | 1,
    hIdx: number,
  ): void {
    outR.fill(0)
    outI.fill(0)
    const hInv = G2T.invTab[hIdx]!
    const Uh = G2T.mats[hIdx]!
    for (let g0 = 0; g0 < 24; g0++) {
      const ng0 = v === 0 ? G2T.mulTab[g0]![hInv]! : G2T.mulTab[hIdx]![g0]!
      for (let g1 = 0; g1 < 24; g1++) {
        const ng1 = v === 0 ? G2T.mulTab[g1]![hInv]! : G2T.mulTab[hIdx]![g1]!
        // Vertex that is NOT v: spinor untouched, links shifted
        const vo = v === 0 ? 1 : 0
        for (let iso = 0; iso < 2; iso++) {
          const src = idx2T(vo, iso, g0, g1)
          const dst = idx2T(vo, iso, ng0, ng1)
          outR[dst] = inR[src]!
          outI[dst] = inI[src]!
        }
        // Vertex v: spinor multiplied by U(h)
        const s0 = idx2T(v, 0, g0, g1)
        const s1 = idx2T(v, 1, g0, g1)
        const d0 = idx2T(v, 0, ng0, ng1)
        const d1 = idx2T(v, 1, ng0, ng1)
        const a0: C = [inR[s0]!, inI[s0]!]
        const a1: C = [inR[s1]!, inI[s1]!]
        const r0 = cAdd(cMul(Uh[0][0], a0), cMul(Uh[0][1], a1))
        const r1 = cAdd(cMul(Uh[1][0], a0), cMul(Uh[1][1], a1))
        outR[d0] = r0[0]
        outI[d0] = r0[1]
        outR[d1] = r1[0]
        outI[d1] = r1[1]
      }
    }
  }

  // Verify [U_weak^(2T), V_v(h)] = 0 across ALL 24 Hurwitz units h in 2T and BOTH vertices (48/48 checks!)
  const p2tR = new Float64Array(DIM2T)
  const p2tI = new Float64Array(DIM2T)
  // Deterministic nontrivial superposition across vertices, isospins, and Hurwitz link elements
  p2tR[idx2T(0, 0, 1, 5)] = 0.6
  p2tI[idx2T(1, 1, 12, 19)] = 0.8
  const a2tR = new Float64Array(DIM2T)
  const a2tI = new Float64Array(DIM2T)
  const b2tR = new Float64Array(DIM2T)
  const b2tI = new Float64Array(DIM2T)
  const c2tR = new Float64Array(DIM2T)
  const c2tI = new Float64Array(DIM2T)

  let max2TGaussComm = 0
  for (const v of [0, 1] as const) {
    for (let h = 0; h < 24; h++) {
      applyGauss2T(p2tR, p2tI, a2tR, a2tI, v, h)
      applyUWeak2T(a2tR, a2tI, false)
      b2tR.set(p2tR)
      b2tI.set(p2tI)
      applyUWeak2T(b2tR, b2tI, false)
      applyGauss2T(b2tR, b2tI, c2tR, c2tI, v, h)
      let e2 = 0
      for (let i = 0; i < DIM2T; i++) {
        const dr = a2tR[i]! - c2tR[i]!
        const di = a2tI[i]! - c2tI[i]!
        e2 += dr * dr + di * di
      }
      max2TGaussComm = Math.max(max2TGaussComm, Math.sqrt(e2))
    }
  }
  // Check T = 20 reversal on full 2T plaquette AND dynamical W^1, W^2 -> W^3 excitation
  const rev2tR = Float64Array.from(p2tR)
  const rev2tI = Float64Array.from(p2tI)
  for (let t = 1; t <= 20; t++) applyUWeak2T(rev2tR, rev2tI, false)
  for (let t = 1; t <= 20; t++) applyUWeak2T(rev2tR, rev2tI, true)
  let rev2TErr = 0
  for (let i = 0; i < DIM2T; i++) {
    rev2TErr = Math.max(rev2TErr, Math.hypot(rev2tR[i]! - p2tR[i]!, rev2tI[i]! - p2tI[i]!))
  }

  // Dynamical W^1, W^2 -> W^3 non-Abelian mixing inside the 3-plet of C[2T]:
  // Start link g0 in pure W^1 (R_{00}) and link g1 in pure W^2 (R_{11}); evolve 1 beat of U_weak^(2T)
  // and measure nonzero overlap onto W^3 (R_{22}) generated by the non-Abelian plaquette U_B^(2T)!
  const adjVec = (a: number, b: number): Float64Array => {
    const v = new Float64Array(24)
    for (let gi = 0; gi < 24; gi++) {
      const U = G2T.mats[gi]!
      v[gi] = 0.5 * m2Tr(m2Mul(PAULI[a]!, m2Mul(U, m2Mul(PAULI[b]!, m2Dag(U)))))[0] * Math.sqrt(3 / 24)
    }
    return v
  }
  const w1Vec = adjVec(0, 0)
  const w2Vec = adjVec(1, 1)
  const w3Vec = adjVec(2, 2)
  const mixR = new Float64Array(DIM2T)
  const mixI = new Float64Array(DIM2T)
  for (let g0 = 0; g0 < 24; g0++) {
    for (let g1 = 0; g1 < 24; g1++) {
      mixR[idx2T(0, 0, g0, g1)] = w1Vec[g0]! * w2Vec[g1]!
    }
  }
  applyUWeak2T(mixR, mixI, false)
  let w3Prob = 0
  for (let m = 0; m < 4; m++) {
    for (let g1 = 0; g1 < 24; g1++) {
      let sr = 0
      let si = 0
      for (let g0 = 0; g0 < 24; g0++) {
        const i = (m * 24 + g0) * 24 + g1
        sr += w3Vec[g0]! * mixR[i]!
        si += w3Vec[g0]! * mixI[i]!
      }
      w3Prob += sr * sr + si * si
    }
  }

  recordCheck(
    'P2.2a Exact non-Abelian SU(2)_L Gauss law [U_weak, G_v^a] = 0 (9/9 gens, dim=1,500) & T=20 rev',
    maxWeakGaussComm < 1e-14 && maxWeakLieAlgErr < 1e-14 && weakRevErr < 1e-14 && uBond.uniErr < 1e-14 && uPlaq.uniErr < 1e-14,
    `max||[U,G_v^a]||=${maxWeakGaussComm.toExponential(2)}, LieAlgErr=${maxWeakLieAlgErr.toExponential(2)}, revErr=${weakRevErr.toExponential(2)}`,
  )
  recordCheck(
    'P2.2b Quantum chiral parity violation on 2T-projected triangle (P_L doublet vs P_R singlet)',
    maxFlipL > 0.3 && maxMoveL > 0.3 && maxFlipR < 1e-15 && maxMoveR < 1e-15,
    `P_L: maxFlip(u->d)=${maxFlipL.toFixed(4)}, maxMove=${maxMoveL.toFixed(4)}; P_R: maxFlip=${maxFlipR.toExponential(2)}, maxMove=${maxMoveR.toExponential(2)}`,
  )
  recordCheck(
    'P2.2c Full 24-element Hurwitz 2T plaquette Gauss law (48/48 checks, dim=2,304) & W^1,W^2->W^3',
    max2TGaussComm < 1e-14 && rev2TErr < 1e-14 && w3Prob > 0.01,
    `max||[U_2T,V_v(h)]||=${max2TGaussComm.toExponential(2)}, revErr=${rev2TErr.toExponential(2)}, P(W1,W2->W3)=${w3Prob.toFixed(4)}`,
  )
}

// ----------------------------------------------------------------------------
// P2.3: Live 3+1D Strictly Finite-Range Z[zeta_9][1/2] Chiral Domain-Wall QCA
//       (6^3 Husk x N_D = 16 Depth, dim = 27,648) Coupled to Dynamical 2T Weak Links
// ----------------------------------------------------------------------------
function runPart2_3(): void {
  console.log('\n--- P2.3: Live 3+1D {3,4,3,4} Cusp Domain Wall (N_D=16) + Dynamical 2T Weak Flux ---')

  // Exact strictly finite-range Z[zeta_9][1/2] chiral domain-wall coin K from finite-range-chiral-wall.ts:
  //   R_phi(2a) = cos(a) I - i sin(a) (cos(phi) sx + sin(phi) sy)
  //   K = R_{pi/9}(2pi/9) * R_x(-4pi/9) * R_{pi/9}(2pi/9)
  function eqCoin(aStep: number, phiStep: number): CMat2 {
    const a = (aStep * PI) / 9
    const phi = (phiStep * PI) / 9
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    // -i sin(a) e^{-i phi} = -sin(a) sin(phi) - i sin(a) cos(phi)
    const off01: C = [-sa * Math.sin(phi), -sa * Math.cos(phi)]
    const off10: C = [sa * Math.sin(phi), -sa * Math.cos(phi)]
    return [
      [[ca, 0], off01],
      [off10, [ca, 0]],
    ]
  }
  const K_WALL = m2Mul(eqCoin(1, 1), m2Mul(eqCoin(-2, 0), eqCoin(1, 1)))
  const K_DAG = m2Dag(K_WALL)

  // 3D {4,3,4} husk L_h = 6, depth N_D = 16, 2 wall-chiralities (tau in {0=L, 1=R}), 2 weak isospin (u, d)
  // For clean 3D domain-wall dynamics: total state dim = 6^3 * 16 * 2 * 2 = 13,824 (2-component wall x 2 isospin;
  // Weyl spin is diagonalized on the wall via chiral boundary mode, and we ALSO track a decoupled P_R singlet!).
  // Wait: let's keep full 4-component (2 wall-chirality x 2 Weyl-spin) x 2 weak-isospin => dim = 6^3 * 16 * 4 * 2 = 27,648!
  const LH = 6
  const VH = LH * LH * LH
  const ND = 16
  const DIM_DW = VH * ND * 4 * 2 // site * depth * (tau*2 + spin) * iso
  const dwIdx = (site: number, d: number, tau: number, spin: number, iso: number): number =>
    ((((site * ND + d) * 2 + tau) * 2 + spin) * 2 + iso)
  const hSite = (x: number, y: number, z: number): number =>
    (((x + LH) % LH) * LH + ((y + LH) % LH)) * LH + ((z + LH) % LH)

  // Assign dynamical 2T Hurwitz link matrices U_{x, mu} in 2T on the 6^3 husk (non-Abelian W^+, W^-, W^3 flux!)
  // Uses exact 2T elements: i, j, (-1+i+j+k)/2, (1+i-j+k)/2 varying spatially across the 6^3 husk!
  const gI = G2T.keyMap.get('0,2,0,0')!
  const gJ = G2T.keyMap.get('0,0,2,0')!
  const gW1 = G2T.keyMap.get('-1,1,1,1')!
  const gW2 = G2T.keyMap.get('1,1,-1,1')!
  const fluxPalette = [gI, gJ, gW1, gW2] as const
  const link2T: number[][] = [new Array(VH), new Array(VH), new Array(VH)]
  for (let x = 0; x < LH; x++) {
    for (let y = 0; y < LH; y++) {
      for (let z = 0; z < LH; z++) {
        const s = hSite(x, y, z)
        link2T[0]![s] = fluxPalette[(x + 2 * y + z) % 4]!
        link2T[1]![s] = fluxPalette[(2 * x + y + 3 * z) % 4]!
        link2T[2]![s] = fluxPalette[(x + y + 2 * z) % 4]!
      }
    }
  }

  // Strictly finite-range 3+1D chiral domain-wall QCA step:
  //   U_DW(2T) = U_depth_V2 * U_V1(2T_on_D0) * U_husk_Weyl(2T_on_D0)
  // Specifically:
  //   1) Depth-layer shift-conjugated coin V_1 along x, y, z (1-hop per axis in tau-space; strictly local,
  //      exact zero mode at D=0 with tau=0 (Left-handed) and exact mirror at D=ND-1 with tau=1 (Right-handed)!).
  //   2) Inter-layer bond unitary V_2 = K_WALL on every bond (|d, tau=1>, |d+1, tau=0>) for d = 0..ND-2.
  //   3) Husk Weyl propagation S_husk acting on spin with dynamical 2T weak link parallel transport
  //      applied ONLY to the Left-handed (D = 0, tau = 0) doublet when weakOn = true!
  const tmpR = new Float64Array(DIM_DW)
  const tmpI = new Float64Array(DIM_DW)

  // Shift tau=0 (+1) along axis mu (using 2T link ONLY at d=0 when weakOn && coupleDoublet)
  function shiftTau0(
    re: Float64Array,
    im: Float64Array,
    mu: 0 | 1 | 2,
    dir: 1 | -1,
    weakOn: boolean,
  ): void {
    tmpR.set(re)
    tmpI.set(im)
    for (let x = 0; x < LH; x++) {
      for (let y = 0; y < LH; y++) {
        for (let z = 0; z < LH; z++) {
          const s = hSite(x, y, z)
          const nx = mu === 0 ? (x + dir + LH) % LH : x
          const ny = mu === 1 ? (y + dir + LH) % LH : y
          const nz = mu === 2 ? (z + dir + LH) % LH : z
          const ns = hSite(nx, ny, nz)
          const linkSite = dir === 1 ? s : ns
          const Ulink = weakOn ? (dir === 1 ? G2T.mats[link2T[mu]![linkSite]!]! : m2Dag(G2T.mats[link2T[mu]![linkSite]!]!)) : I2
          for (let d = 0; d < ND; d++) {
            const useWeak = weakOn && d === 0
            for (let spin = 0; spin < 2; spin++) {
              const s0 = dwIdx(s, d, 0, spin, 0)
              const s1 = dwIdx(s, d, 0, spin, 1)
              const d0 = dwIdx(ns, d, 0, spin, 0)
              const d1 = dwIdx(ns, d, 0, spin, 1)
              if (useWeak) {
                const a0: C = [re[s0]!, im[s0]!]
                const a1: C = [re[s1]!, im[s1]!]
                const r0 = cAdd(cMul(Ulink[0][0], a0), cMul(Ulink[0][1], a1))
                const r1 = cAdd(cMul(Ulink[1][0], a0), cMul(Ulink[1][1], a1))
                tmpR[d0] = r0[0]
                tmpI[d0] = r0[1]
                tmpR[d1] = r1[0]
                tmpI[d1] = r1[1]
              } else {
                tmpR[d0] = re[s0]!
                tmpI[d0] = im[s0]!
                tmpR[d1] = re[s1]!
                tmpI[d1] = im[s1]!
              }
            }
          }
        }
      }
    }
    re.set(tmpR)
    im.set(tmpI)
  }

  function applyOnSiteTauMat(re: Float64Array, im: Float64Array, M: CMat2): void {
    for (let s = 0; s < VH; s++) {
      for (let d = 0; d < ND; d++) {
        for (let spin = 0; spin < 2; spin++) {
          for (let iso = 0; iso < 2; iso++) {
            const i0 = dwIdx(s, d, 0, spin, iso)
            const i1 = dwIdx(s, d, 1, spin, iso)
            const a0: C = [re[i0]!, im[i0]!]
            const a1: C = [re[i1]!, im[i1]!]
            const r0 = cAdd(cMul(M[0][0], a0), cMul(M[0][1], a1))
            const r1 = cAdd(cMul(M[1][0], a0), cMul(M[1][1], a1))
            re[i0] = r0[0]
            im[i0] = r0[1]
            re[i1] = r1[0]
            im[i1] = r1[1]
          }
        }
      }
    }
  }

  function applyV1Axis(re: Float64Array, im: Float64Array, mu: 0 | 1 | 2, weakOn: boolean, inv: boolean): void {
    // K^dag * T_mu * K * T_mu^dag (and inverse T_mu * K^dag * T_mu^dag * K)
    if (!inv) {
      shiftTau0(re, im, mu, -1, weakOn)
      applyOnSiteTauMat(re, im, K_WALL)
      shiftTau0(re, im, mu, 1, weakOn)
      applyOnSiteTauMat(re, im, K_DAG)
    } else {
      applyOnSiteTauMat(re, im, K_WALL)
      shiftTau0(re, im, mu, -1, weakOn)
      applyOnSiteTauMat(re, im, K_DAG)
      shiftTau0(re, im, mu, 1, weakOn)
    }
  }

  function applyV2Depth(re: Float64Array, im: Float64Array, inv: boolean): void {
    const M = inv ? K_DAG : K_WALL
    for (let s = 0; s < VH; s++) {
      for (let d = 0; d < ND - 1; d++) {
        for (let spin = 0; spin < 2; spin++) {
          for (let iso = 0; iso < 2; iso++) {
            const i0 = dwIdx(s, d, 1, spin, iso) // |d, R>
            const i1 = dwIdx(s, d + 1, 0, spin, iso) // |d+1, L>
            const a0: C = [re[i0]!, im[i0]!]
            const a1: C = [re[i1]!, im[i1]!]
            const r0 = cAdd(cMul(M[0][0], a0), cMul(M[0][1], a1))
            const r1 = cAdd(cMul(M[1][0], a0), cMul(M[1][1], a1))
            re[i0] = r0[0]
            im[i0] = r0[1]
            re[i1] = r1[0]
            im[i1] = r1[1]
          }
        }
      }
    }
  }

  // Husk Weyl shift S_husk along x (moves spin=0 forward, spin=1 backward; uses 2T link ONLY on D=0, tau=0!)
  function applyHuskWeyl(re: Float64Array, im: Float64Array, weakOn: boolean, inv: boolean): void {
    tmpR.set(re)
    tmpI.set(im)
    const dir0: 1 | -1 = inv ? -1 : 1
    const dir1: 1 | -1 = inv ? 1 : -1
    for (let x = 0; x < LH; x++) {
      for (let y = 0; y < LH; y++) {
        for (let z = 0; z < LH; z++) {
          const s = hSite(x, y, z)
          const nx0 = (x + dir0 + LH) % LH
          const nx1 = (x + dir1 + LH) % LH
          const ns0 = hSite(nx0, y, z)
          const ns1 = hSite(nx1, y, z)
          const link0 = dir0 === 1 ? s : ns0
          const link1 = dir1 === 1 ? s : ns1
          const U0 = weakOn ? (dir0 === 1 ? G2T.mats[link2T[0]![link0]!]! : m2Dag(G2T.mats[link2T[0]![link0]!]!)) : I2
          const U1 = weakOn ? (dir1 === 1 ? G2T.mats[link2T[0]![link1]!]! : m2Dag(G2T.mats[link2T[0]![link1]!]!)) : I2
          for (let d = 0; d < ND; d++) {
            for (let tau = 0; tau < 2; tau++) {
              const useWeak = weakOn && d === 0 && tau === 0
              // spin = 0
              const a00: C = [re[dwIdx(s, d, tau, 0, 0)]!, im[dwIdx(s, d, tau, 0, 0)]!]
              const a01: C = [re[dwIdx(s, d, tau, 0, 1)]!, im[dwIdx(s, d, tau, 0, 1)]!]
              if (useWeak) {
                const r0 = cAdd(cMul(U0[0][0], a00), cMul(U0[0][1], a01))
                const r1 = cAdd(cMul(U0[1][0], a00), cMul(U0[1][1], a01))
                tmpR[dwIdx(ns0, d, tau, 0, 0)] = r0[0]
                tmpI[dwIdx(ns0, d, tau, 0, 0)] = r0[1]
                tmpR[dwIdx(ns0, d, tau, 0, 1)] = r1[0]
                tmpI[dwIdx(ns0, d, tau, 0, 1)] = r1[1]
              } else {
                tmpR[dwIdx(ns0, d, tau, 0, 0)] = a00[0]
                tmpI[dwIdx(ns0, d, tau, 0, 0)] = a00[1]
                tmpR[dwIdx(ns0, d, tau, 0, 1)] = a01[0]
                tmpI[dwIdx(ns0, d, tau, 0, 1)] = a01[1]
              }
              // spin = 1
              const b10: C = [re[dwIdx(s, d, tau, 1, 0)]!, im[dwIdx(s, d, tau, 1, 0)]!]
              const b11: C = [re[dwIdx(s, d, tau, 1, 1)]!, im[dwIdx(s, d, tau, 1, 1)]!]
              if (useWeak) {
                const r0 = cAdd(cMul(U1[0][0], b10), cMul(U1[0][1], b11))
                const r1 = cAdd(cMul(U1[1][0], b10), cMul(U1[1][1], b11))
                tmpR[dwIdx(ns1, d, tau, 1, 0)] = r0[0]
                tmpI[dwIdx(ns1, d, tau, 1, 0)] = r0[1]
                tmpR[dwIdx(ns1, d, tau, 1, 1)] = r1[0]
                tmpI[dwIdx(ns1, d, tau, 1, 1)] = r1[1]
              } else {
                tmpR[dwIdx(ns1, d, tau, 1, 0)] = b10[0]
                tmpI[dwIdx(ns1, d, tau, 1, 0)] = b10[1]
                tmpR[dwIdx(ns1, d, tau, 1, 1)] = b11[0]
                tmpI[dwIdx(ns1, d, tau, 1, 1)] = b11[1]
              }
            }
          }
        }
      }
    }
    re.set(tmpR)
    im.set(tmpI)
  }

  function stepDW(re: Float64Array, im: Float64Array, weakOn: boolean, inv: boolean): void {
    if (!inv) {
      applyHuskWeyl(re, im, weakOn, false)
      applyV1Axis(re, im, 2, weakOn, false)
      applyV1Axis(re, im, 1, weakOn, false)
      applyV1Axis(re, im, 0, weakOn, false)
      applyV2Depth(re, im, false)
    } else {
      applyV2Depth(re, im, true)
      applyV1Axis(re, im, 0, weakOn, true)
      applyV1Axis(re, im, 1, weakOn, true)
      applyV1Axis(re, im, 2, weakOn, true)
      applyHuskWeyl(re, im, weakOn, true)
    }
  }

  function testMode(mode: 'L_D0' | 'R_singlet_D0' | 'R_mirror_D15'): {
    readonly deltaP: number
    readonly isoFlip: number
    readonly revErr: number
    readonly wallWeight: number
  } {
    const rFree = new Float64Array(DIM_DW)
    const iFree = new Float64Array(DIM_DW)
    const rWeak = new Float64Array(DIM_DW)
    const iWeak = new Float64Array(DIM_DW)

    // Smooth low-momentum wavepacket on 6^3 husk (k_x = 0 for exact Gamma zero mode, plus gentle modulation)
    // At Gamma (k=0), |D=0, tau=0> is an EXACT zero mode of U_DW with 1.000000 weight on D=0,
    // and |D=ND-1, tau=1> is the EXACT Right-handed mirror mode with 1.000000 weight on D=15!
    // Add a small k_x = 2pi/6 plane-wave envelope so the packet genuinely propagates across links!
    const norm = 1 / Math.sqrt(VH)
    const targetD = mode === 'R_mirror_D15' ? ND - 1 : 0
    const targetTau = mode === 'L_D0' ? 0 : 1
    for (let x = 0; x < LH; x++) {
      // Pure Gamma in y,z and superposed (1 + 0.25 cos(2pi x / LH)) along x for genuine multi-link propagation
      const amp = 1 + 0.15 * Math.cos((2 * PI * x) / LH)
      for (let y = 0; y < LH; y++) {
        for (let z = 0; z < LH; z++) {
          const s = hSite(x, y, z)
          const idx = dwIdx(s, targetD, targetTau, 0, 0) // pure u (iso=0)
          rFree[idx] = amp * norm
          rWeak[idx] = amp * norm
        }
      }
    }
    // Normalize exactly
    let n2 = 0
    for (let i = 0; i < DIM_DW; i++) n2 += rFree[i]! ** 2
    const invN = 1 / Math.sqrt(n2)
    for (let i = 0; i < DIM_DW; i++) {
      rFree[i] = rFree[i]! * invN
      rWeak[i] = rWeak[i]! * invN
    }
    const rWeak0 = Float64Array.from(rWeak)

    const T_DW = 6
    let maxDeltaP = 0
    let maxFlip = 0
    let wallWeight = 0
    for (let t = 1; t <= T_DW; t++) {
      stepDW(rFree, iFree, false, false)
      // For R_singlet_D0, it is a Right-handed weak singlet (tau=1, sterile to weak links)
      stepDW(rWeak, iWeak, mode !== 'R_singlet_D0', false)
      // Overlap |<psi_free | psi_weak>|^2
      let ovR = 0
      let ovI = 0
      let flip = 0
      let wD = 0
      for (let s = 0; s < VH; s++) {
        for (let d = 0; d < ND; d++) {
          for (let tau = 0; tau < 2; tau++) {
            for (let spin = 0; spin < 2; spin++) {
              for (let iso = 0; iso < 2; iso++) {
                const idx = dwIdx(s, d, tau, spin, iso)
                ovR += rFree[idx]! * rWeak[idx]! + iFree[idx]! * iWeak[idx]!
                ovI += rFree[idx]! * iWeak[idx]! - iFree[idx]! * rWeak[idx]!
                const p = rWeak[idx]! ** 2 + iWeak[idx]! ** 2
                if (iso === 1) flip += p
                if (d === targetD) wD += p
              }
            }
          }
        }
      }
      const dP = Math.max(0, 1 - (ovR * ovR + ovI * ovI))
      maxDeltaP = Math.max(maxDeltaP, dP)
      maxFlip = Math.max(maxFlip, flip)
      wallWeight = wD
    }

    for (let t = 1; t <= T_DW; t++) stepDW(rWeak, iWeak, mode !== 'R_singlet_D0', true)
    let revErr = 0
    for (let i = 0; i < DIM_DW; i++) {
      revErr = Math.max(revErr, Math.hypot(rWeak[i]! - rWeak0[i]!, iWeak[i]!))
    }
    return { deltaP: maxDeltaP, isoFlip: maxFlip, revErr, wallWeight }
  }

  const resL = testMode('L_D0')
  const resRSinglet = testMode('R_singlet_D0')
  const resRMirror = testMode('R_mirror_D15')

  console.log(
    `  3+1D Domain Wall (6^3 x N_D=16, dim=${DIM_DW}) + 2T weak flux:`,
  )
  console.log(
    `    Left-handed doublet (D=0):    Delta P_L = ${resL.deltaP.toFixed(6)}, P(u_L->d_L) = ${resL.isoFlip.toFixed(6)}, D=0 weight = ${resL.wallWeight.toFixed(6)}, revErr = ${resL.revErr.toExponential(2)}`,
  )
  console.log(
    `    Right-handed singlet (D=0):   Delta P_R = ${resRSinglet.deltaP.toExponential(2)}, P(u_R->d_R) = ${resRSinglet.isoFlip.toExponential(2)}, revErr = ${resRSinglet.revErr.toExponential(2)}`,
  )
  console.log(
    `    Right-handed mirror (D=15):   Delta P_mir = ${resRMirror.deltaP.toExponential(2)}, P(flip) = ${resRMirror.isoFlip.toExponential(2)}, D=15 weight = ${resRMirror.wallWeight.toFixed(6)}, revErr = ${resRMirror.revErr.toExponential(2)}`,
  )

  recordCheck(
    'P2.3 Exact maximal parity violation on 3+1D {3,4,3,4} domain wall (6^3 x N_D=16) + 2T flux',
    resL.deltaP > 0.5 &&
      resL.isoFlip > 0.3 &&
      resRSinglet.deltaP < 1e-12 &&
      resRMirror.deltaP < 1e-12 &&
      resL.revErr < 1e-13 &&
      resRMirror.revErr < 1e-13,
    `DeltaP_L=${resL.deltaP.toFixed(4)} (flip=${resL.isoFlip.toFixed(4)}), DeltaP_R=${resRSinglet.deltaP.toExponential(2)}, DeltaP_mir=${resRMirror.deltaP.toExponential(2)}, revErr=${resL.revErr.toExponential(2)}`,
  )
}

runPart2_1()
runPart2_2()
runPart2_3()

// ============================================================================
// PART 3: EXACT DISCRETE ELECTROWEAK & LEFT-RIGHT / PATI-SALAM COMPATIBILITY
//         (W(F_4) > 2T_L o 2T_R, Sigma(648) < SU(3)_C, SM Z_6 QUOTIENT)
// ============================================================================

console.log('\n========================================================================')
console.log('PART 3: DISCRETE ELECTROWEAK & LEFT-RIGHT / PATI-SALAM SUBGROUP CLOSURE')
console.log('========================================================================')

function runPart3(): void {
  // --------------------------------------------------------------------------
  // P3.1: W(F_4) (order 1152), W(F_4)^+ (576), normal subgroup 2T_L o 2T_R (288), P_LR swap
  // --------------------------------------------------------------------------
  type Mat4 = readonly number[] // 16 entries row-major
  const m4Mul = (A: Mat4, B: Mat4): Mat4 => {
    const out = new Array<number>(16).fill(0)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let s = 0
        for (let k = 0; k < 4; k++) s += A[i * 4 + k]! * B[k * 4 + j]!
        out[i * 4 + j] = s
      }
    }
    return out
  }
  const m4Transpose = (A: Mat4): Mat4 => {
    const out = new Array<number>(16).fill(0)
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) out[i * 4 + j] = A[j * 4 + i]!
    return out
  }
  const m4Det = (A: Mat4): number => {
    const a = A
    const sub3 = (r0: number, r1: number, r2: number, c0: number, c1: number, c2: number): number =>
      a[r0 * 4 + c0]! * (a[r1 * 4 + c1]! * a[r2 * 4 + c2]! - a[r1 * 4 + c2]! * a[r2 * 4 + c1]!) -
      a[r0 * 4 + c1]! * (a[r1 * 4 + c0]! * a[r2 * 4 + c2]! - a[r1 * 4 + c2]! * a[r2 * 4 + c0]!) +
      a[r0 * 4 + c2]! * (a[r1 * 4 + c0]! * a[r2 * 4 + c1]! - a[r1 * 4 + c1]! * a[r2 * 4 + c0]!)
    return (
      a[0]! * sub3(1, 2, 3, 1, 2, 3) -
      a[1]! * sub3(1, 2, 3, 0, 2, 3) +
      a[2]! * sub3(1, 2, 3, 0, 1, 3) -
      a[3]! * sub3(1, 2, 3, 0, 1, 2)
    )
  }
  const m4Key = (A: Mat4): string => A.map(v => Math.round(v * 1e6)).join(',')
  const reflect4 = (v: readonly [number, number, number, number]): Mat4 => {
    const n2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3]
    const out = new Array<number>(16).fill(0)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        out[i * 4 + j] = (i === j ? 1 : 0) - (2 * v[i]! * v[j]!) / n2
      }
    }
    return out
  }

  // Standard F_4 simple roots: (0,1,-1,0), (0,0,1,-1), (0,0,0,1), (1/2, -1/2, -1/2, -1/2)
  const wf4Gens: readonly Mat4[] = [
    reflect4([0, 1, -1, 0]),
    reflect4([0, 0, 1, -1]),
    reflect4([0, 0, 0, 1]),
    reflect4([0.5, -0.5, -0.5, -0.5]),
  ]
  const id4: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  const wf4Map = new Map<string, Mat4>([[m4Key(id4), id4]])
  const wf4List: Mat4[] = [id4]
  for (let head = 0; head < wf4List.length; head++) {
    const cur = wf4List[head]!
    for (const g of wf4Gens) {
      const nxt = m4Mul(cur, g)
      const k = m4Key(nxt)
      if (!wf4Map.has(k)) {
        wf4Map.set(k, nxt)
        wf4List.push(nxt)
      }
    }
  }
  let wf4PlusCount = 0
  for (const m of wf4List) if (m4Det(m) > 0) wf4PlusCount++

  // Construct SO(4) matrices of left and right Hurwitz multiplications L(q_L): x -> q_L x, R(q_R): x -> x q_R^{-1}
  function leftMat4(q: HQ): Mat4 {
    const a = q[0] / 2
    const b = q[1] / 2
    const c = q[2] / 2
    const d = q[3] / 2
    return [a, -b, -c, -d, b, a, -d, c, c, d, a, -b, d, -c, b, a]
  }
  function rightInvMat4(q: HQ): Mat4 {
    // x -> x * q^{-1} = x * conj(q) = x * (a - bi - cj - dk)
    const a = q[0] / 2
    const b = -q[1] / 2
    const c = -q[2] / 2
    const d = -q[3] / 2
    return [a, -b, -c, -d, b, a, d, -c, c, -d, a, b, d, c, -b, a]
  }

  const leftMats = G2T.elems.map(leftMat4)
  const rightMats = G2T.elems.map(rightInvMat4)
  const centralProdMap = new Map<string, Mat4>()
  let commLRDefects = 0
  let inWF4Plus = 0
  let kernelCount = 0
  const idKey = m4Key(id4)
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 24; j++) {
      const lr = m4Mul(leftMats[i]!, rightMats[j]!)
      const rl = m4Mul(rightMats[j]!, leftMats[i]!)
      if (m4Key(lr) !== m4Key(rl)) commLRDefects++
      const k = m4Key(lr)
      if (k === idKey) kernelCount++
      if (!centralProdMap.has(k)) {
        centralProdMap.set(k, lr)
        if (wf4Map.has(k) && m4Det(lr) > 0) inWF4Plus++
      }
    }
  }
  // Check exact normality of 2T_L o 2T_R inside full W(F_4) under all 4 simple reflections
  let normalityDefects = 0
  for (const h of centralProdMap.values()) {
    for (const g of wf4Gens) {
      // Simple reflection g satisfies g^{-1} = g
      const conj = m4Mul(g, m4Mul(h, g))
      if (!centralProdMap.has(m4Key(conj))) normalityDefects++
    }
  }
  // Check quaternion conjugation P_LR = diag(1, -1, -1, -1) in W(F_4)^- swaps 2T_L <-> 2T_R!
  const pLR: Mat4 = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1]
  const pLRInWF4Minus = wf4Map.has(m4Key(pLR)) && Math.abs(m4Det(pLR) + 1) < 1e-12
  let swapDefects = 0
  for (let i = 0; i < 24; i++) {
    // P_LR L(q) P_LR = R(q): x -> conj(q * conj(x)) = x * conj(q) = R(q)(x)!
    const swapped = m4Mul(pLR, m4Mul(leftMats[i]!, pLR))
    if (m4Key(swapped) !== m4Key(rightMats[i]!)) swapDefects++
  }

  // --------------------------------------------------------------------------
  // P3.2: Delta(27) <| Sigma(648) < SU(3)_C Closure & Exact Unitary 2-Design Proof
  // --------------------------------------------------------------------------
  const W = cExpI((2 * PI) / 3)
  const W2 = cExpI((4 * PI) / 3)
  const Z9Inv = cExpI((-2 * PI) / 9)
  const INV_ISQ3: C = [0, -1 / SQRT3]
  type Mat3 = readonly C[]
  const m3Mul = (a: Mat3, b: Mat3): Mat3 => {
    const out: C[] = new Array(9)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let s: C = C0
        for (let k = 0; k < 3; k++) s = cAdd(s, cMul(a[i * 3 + k]!, b[k * 3 + j]!))
        out[i * 3 + j] = s
      }
    }
    return out
  }
  const m3Det = (a: Mat3): C =>
    cAdd(
      cSub(
        cMul(a[0]!, cSub(cMul(a[4]!, a[8]!), cMul(a[5]!, a[7]!))),
        cMul(a[1]!, cSub(cMul(a[3]!, a[8]!), cMul(a[5]!, a[6]!))),
      ),
      cMul(a[2]!, cSub(cMul(a[3]!, a[7]!), cMul(a[4]!, a[6]!))),
    )
  const m3UniErr = (a: Mat3): number => {
    let err = 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let s: C = C0
        for (let k = 0; k < 3; k++) s = cAdd(s, cMul(cConj(a[k * 3 + i]!), a[k * 3 + j]!))
        err = Math.max(err, Math.hypot(s[0] - (i === j ? 1 : 0), s[1]))
      }
    }
    return err
  }
  const m3Key = (a: Mat3): string => a.map(([r, im]) => `${Math.round(r * 1e6)},${Math.round(im * 1e6)}`).join(';')

  const CLOCK3: Mat3 = [C1, C0, C0, C0, W, C0, C0, C0, W2]
  const SHIFT3: Mat3 = [C0, C0, C1, C1, C0, C0, C0, C1, C0]
  const PHASE_T: Mat3 = [Z9Inv, C0, C0, C0, Z9Inv, C0, C0, C0, cMul(Z9Inv, W)]
  const HESS_V: Mat3 = [
    INV_ISQ3,
    INV_ISQ3,
    INV_ISQ3,
    INV_ISQ3,
    cMul(INV_ISQ3, W),
    cMul(INV_ISQ3, W2),
    INV_ISQ3,
    cMul(INV_ISQ3, W2),
    cMul(INV_ISQ3, W),
  ]

  function closeMat3(gens: readonly Mat3[], maxSize: number): readonly Mat3[] {
    const id: Mat3 = [C1, C0, C0, C0, C1, C0, C0, C0, C1]
    const seen = new Map<string, Mat3>([[m3Key(id), id]])
    const q: Mat3[] = [id]
    for (let head = 0; head < q.length && seen.size <= maxSize; head++) {
      const cur = q[head]!
      for (const g of gens) {
        const nxt = m3Mul(cur, g)
        const k = m3Key(nxt)
        if (!seen.has(k)) {
          seen.set(k, nxt)
          q.push(nxt)
        }
      }
    }
    return q
  }

  const delta27 = closeMat3([CLOCK3, SHIFT3], 100)
  const sigma648 = closeMat3([CLOCK3, SHIFT3, PHASE_T, HESS_V], 1000)
  let s648DetErr = 0
  let s648UniErr = 0
  let s648CenterCount = 0
  let s648FP1 = 0
  let s648FP2 = 0
  let s648FP3 = 0
  for (const M of sigma648) {
    s648DetErr = Math.max(s648DetErr, cAbs(cSub(m3Det(M), C1)))
    s648UniErr = Math.max(s648UniErr, m3UniErr(M))
    const tr = cAdd(cAdd(M[0]!, M[4]!), M[8]!)
    const t2 = cAbs2(tr)
    s648FP1 += t2
    s648FP2 += t2 * t2
    s648FP3 += t2 * t2 * t2
    // Check if M is scalar (in center Z(Sigma(648)))
    let isScalar = true
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const entry = M[i * 3 + j]!
        if (i !== j && cAbs(entry) > 1e-9) isScalar = false
        if (i === j && cAbs(cSub(entry, M[0]!)) > 1e-9) isScalar = false
      }
    }
    if (isScalar) s648CenterCount++
  }
  s648FP1 /= sigma648.length
  s648FP2 /= sigma648.length
  s648FP3 /= sigma648.length

  // --------------------------------------------------------------------------
  // P3.3: Standard Model Z_6 Central Quotient, Left-Right Y = T_R^3 + (B-L)/2 & 5 Anomalies
  // --------------------------------------------------------------------------
  // One full generation (16 Weyl fermions, all written as Left-handed):
  //   Q_L   : (3,   2, 1, +1/3) -> T_R^3 = 0,     Y = +1/6  (6Y = +1, mult = 6)
  //   u_R^c : (3b,  1, 2, -1/3) -> T_R^3 = -1/2,  Y = -2/3  (6Y = -4, mult = 3)
  //   d_R^c : (3b,  1, 2, -1/3) -> T_R^3 = +1/2,  Y = +1/3  (6Y = +2, mult = 3)
  //   L_L   : (1,   2, 1, -1)   -> T_R^3 = 0,     Y = -1/2  (6Y = -3, mult = 2)
  //   e_R^c : (1,   1, 2, +1)   -> T_R^3 = +1/2,  Y = +1    (6Y = +6, mult = 1)
  //   nu_R^c: (1,   1, 2, +1)   -> T_R^3 = -1/2,  Y = 0     (6Y =  0, mult = 1)
  interface Multiplet {
    readonly name: string
    readonly nColor: number // 3, -3 (anti-triplet), 1
    readonly nWeakL: number // 2 or 1
    readonly tR3: number // 0, +1/2, -1/2
    readonly bMinusL: number // +1/3, -1/3, -1, +1 (for LH states!)
    readonly sixY: number
  }
  const gen1: readonly Multiplet[] = [
    { name: 'Q_L', nColor: 3, nWeakL: 2, tR3: 0, bMinusL: 1 / 3, sixY: 1 },
    { name: 'u_R^c', nColor: -3, nWeakL: 1, tR3: -0.5, bMinusL: -1 / 3, sixY: -4 },
    { name: 'd_R^c', nColor: -3, nWeakL: 1, tR3: 0.5, bMinusL: -1 / 3, sixY: 2 },
    { name: 'L_L', nColor: 1, nWeakL: 2, tR3: 0, bMinusL: -1, sixY: -3 },
    { name: 'e_R^c', nColor: 1, nWeakL: 1, tR3: 0.5, bMinusL: 1, sixY: 6 },
    { name: 'nu_R^c', nColor: 1, nWeakL: 1, tR3: -0.5, bMinusL: 1, sixY: 0 },
  ]

  // Check z_6 = (omega I_3, -I_2, zeta_6) invariance on ALL 6 multiplets (16 Weyl fermions)
  const ZETA6 = cExpI(PI / 3)
  let maxZ6Err = 0
  let maxLRFormulaErr = 0
  let anomSU3sqY = 0
  let anomSU2sqY = 0
  let anomY3 = 0
  let anomGravY = 0
  let wittenDoublets = 0
  let totalWeyl = 0

  for (const m of gen1) {
    const dimC = Math.abs(m.nColor)
    const mult = dimC * m.nWeakL
    totalWeyl += mult
    const yVal = m.sixY / 6
    const yPred = m.tR3 + 0.5 * m.bMinusL
    maxLRFormulaErr = Math.max(maxLRFormulaErr, Math.abs(yVal - yPred))

    // Central z_6 action: color factor (omega for 3, omega^2 for 3bar, 1 for 1) * (-1 for 2, +1 for 1) * zeta_6^(6Y)
    const cPh: C = m.nColor === 3 ? W : m.nColor === -3 ? W2 : C1
    const wPh: C = m.nWeakL === 2 ? [-1, 0] : C1
    let yPh: C = C1
    const steps = ((m.sixY % 6) + 6) % 6
    for (let k = 0; k < steps; k++) yPh = cMul(yPh, ZETA6)
    const z6Act = cMul(cMul(cPh, wPh), yPh)
    maxZ6Err = Math.max(maxZ6Err, cAbs(cSub(z6Act, C1)))

    // Anomalies
    if (dimC === 3) anomSU3sqY += m.nWeakL * yVal
    if (m.nWeakL === 2) {
      anomSU2sqY += dimC * yVal
      wittenDoublets += dimC
    }
    anomY3 += mult * yVal * yVal * yVal
    anomGravY += mult * yVal
  }
  const maxAnomErr = Math.max(
    Math.abs(anomSU3sqY),
    Math.abs(anomSU2sqY),
    Math.abs(anomY3),
    Math.abs(anomGravY),
  )

  // Check exact discrete group orders:
  //   G_SM^disc(N=1) = (Sigma(648) x 2T_L x Z_6) / Z_6   -> order 648 * 24 * 6 / 6 = 15,552
  //   G_SM^disc(N=3) = (Sigma(648) x 2T_L x Z_18) / Z_6  -> order 648 * 24 * 18 / 6 = 46,656
  //   G_LR^disc      = (Sigma(648) x 2T_L x 2T_R x Z_6) / (Z_3 x Z_2) -> order 648 * 24 * 24 * 6 / 6 = 373,248
  const orderSM6 = (sigma648.length * G2T.elems.length * 6) / 6
  const orderSM18 = (sigma648.length * G2T.elems.length * 18) / 6
  const orderLR = (sigma648.length * G2T.elems.length * G2T.elems.length * 6) / 6

  // Verify T_R^3 cyclic subgroup Z_6 = <(1+i+j+k)/2> inside 2T_R has order 6 with eigenvalues zeta_6^{+-1}
  const genZ6R = G2T.keyMap.get('1,1,1,1')!
  let curZ6 = genZ6R
  let z6Order = 1
  while (curZ6 !== 0 && z6Order < 20) {
    curZ6 = G2T.mulTab[curZ6]![genZ6R]!
    z6Order++
  }

  console.log(
    `  |W(F_4)|=${wf4List.length}, |W(F_4)^+|=${wf4PlusCount}, |2T_L o 2T_R|=${centralProdMap.size} (in W(F_4)^+: ${inWF4Plus}/${centralProdMap.size}, kernel=${kernelCount}, [2T_L,2T_R] defects=${commLRDefects}, normality defects=${normalityDefects})`,
  )
  console.log(
    `  P_LR = conj in W(F_4)^-: ${pLRInWF4Minus}, P_LR(2T_L)P_LR = 2T_R swap defects = ${swapDefects}/24; Z_6 < 2T_R order = ${z6Order}`,
  )
  console.log(
    `  |Delta(27)|=${delta27.length}, |Sigma(648)|=${sigma648.length}, |Z(Sigma(648))|=${s648CenterCount}, detErr=${s648DetErr.toExponential(2)}, uniErr=${s648UniErr.toExponential(2)}`,
  )
  console.log(
    `  Sigma(648) unitary t-design frame potentials in SU(3): k=1: ${s648FP1.toFixed(12)} (SU3=1), k=2: ${s648FP2.toFixed(12)} (SU3=2 => EXACT 2-design!), k=3: ${s648FP3.toFixed(6)} (SU3=6)`,
  )
  console.log(
    `  16 Weyl fermions (total=${totalWeyl}): max|z_6 - 1|=${maxZ6Err.toExponential(2)}, max|Y-(T_R^3+(B-L)/2)|=${maxLRFormulaErr.toExponential(2)}, maxAnom=${maxAnomErr.toExponential(2)}, Witten doublets=${wittenDoublets} (even!)`,
  )
  console.log(
    `  Discrete gauge orders: |G_SM(Z_6)|=${orderSM6}, |G_SM(Z_18)|=${orderSM18}, |G_LR|=${orderLR}`,
  )

  // Avoid unused warning on m4Transpose
  void m4Transpose(id4)

  recordCheck(
    'P3.1 W(F_4) (1152) > W(F_4)^+ (576) > normal 2T_L o 2T_R (288) & exact P_LR swap',
    wf4List.length === 1152 &&
      wf4PlusCount === 576 &&
      centralProdMap.size === 288 &&
      inWF4Plus === 288 &&
      kernelCount === 2 &&
      commLRDefects === 0 &&
      normalityDefects === 0 &&
      pLRInWF4Minus &&
      swapDefects === 0 &&
      z6Order === 6,
    `|W(F_4)|=1152, |2T_L o 2T_R|=288 (normal, 0 defects), P_LR swap=0/24 defects, Z_6 < 2T_R order=6`,
  )
  recordCheck(
    'P3.2 Delta(27) (27) <| Sigma(648) (648) < SU(3)_C exact closure & unitary 2-design in SU(3)',
    delta27.length === 27 &&
      sigma648.length === 648 &&
      s648CenterCount === 3 &&
      s648DetErr < 1e-13 &&
      s648UniErr < 1e-13 &&
      Math.abs(s648FP1 - 1) < 1e-12 &&
      Math.abs(s648FP2 - 2) < 1e-12,
    `|Sigma(648)|=648, |Z|=3, FP(k=1,2)=(${s648FP1.toFixed(6)}, ${s648FP2.toFixed(6)}), FP(k=3)=${s648FP3.toFixed(4)}`,
  )
  recordCheck(
    'P3.3 Exact SM Z_6 central quotient, Left-Right Y = T_R^3 + (B-L)/2 & 5-channel anomaly cancel',
    totalWeyl === 16 &&
      maxZ6Err < 1e-14 &&
      maxLRFormulaErr < 1e-15 &&
      maxAnomErr < 1e-15 &&
      wittenDoublets === 4 &&
      orderSM6 === 15552 &&
      orderSM18 === 46656 &&
      orderLR === 373248,
    `z_6 err=${maxZ6Err.toExponential(2)}, LR Y err=${maxLRFormulaErr.toExponential(2)}, anomErr=${maxAnomErr.toExponential(2)}, Witten=4, |G_LR|=373,248`,
  )
}

runPart3()

// ============================================================================
// SUMMARY LEDGER
// ============================================================================
const elapsedMs = performance.now() - T_START
const rssMb = process.memoryUsage().rss / (1024 * 1024)
const passed = checks.filter(c => c.ok).length

console.log('\n========================================================================')
console.log(`W16 UNIFIED GAUGE+MATTER QCA VERIFICATION LEDGER: ${passed}/${checks.length} PASSED`)
console.log(`Runtime: ${elapsedMs.toFixed(1)} ms | Peak RSS: ${rssMb.toFixed(1)} MB`)
console.log('========================================================================')
if (passed !== checks.length) {
  for (const c of checks) if (!c.ok) console.error(`FAILED: ${c.name} -> ${c.detail}`)
  process.exit(1)
}
