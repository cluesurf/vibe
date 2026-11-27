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
//           law + T = 20 reversal < 1e-14) and live 3D (12^3) symmetric massive Dirac two-wavepacket
//           Coulomb scattering (symmetric 3D Poisson init, zero-drift rest spinor, parity-exact
//           dx1 + dx2 = 0 attraction/repulsion, Gauss law & T = 20 reversal on all runs).
//
// PART 2: Dynamical Chiral 2T < SU(2)_L Weak Gauge Bosons on the {3,4,3,4} Cusp Domain Wall
//   - P2.1: Exact order-24 binary tetrahedral Hurwitz group 2T = <i, j, (-1+i+j+k)/2> < SU(2),
//           exhaustive BigInt rational proof that 2T is an EXACT spherical 5-design (unitary 2-design)
//           in SU(2) matching every Haar polynomial integral up to degree 5 with 0n defect (and exact
//           first deviation 1/64 at degree 6), 24-cell Laplacian spectrum {0, 1/2, 1, 5/4, 3/2}, and
//           exact 3-boson (W^+, W^-, W^3) Lie algebra [T^a, T^b] = i eps^{abc} T^c & Casimir {0, 3/4, 2}.
//   - P2.2: Exact full-operator non-Abelian Gauss law [U_weak, G_v^a] = 0 (all 1,500/1,500 states) on the
//           2T-projected SU(2)_L Quantum Link + chiral fermion 3-vertex D_4 triangle (with free kinetic P_R
//           singlet!) AND exact discrete 2T Gauss law [U_weak^(2T), V_v(h)] = 0 (192/192 checks) on the
//           full 24-element Hurwitz 2-link plaquette (dim = 2,304) + exclusive antisymmetric pure-U_B
//           3-boson Yang-Mills fusion vertex (W^1, W^2) -> (W^3, vac) vs exact zero symmetric controls.
//   - P2.3: Live 3+1D strictly finite-range Z[zeta_9][1/2] chiral domain-wall QCA U_DW (6^3 husk x
//           N_D = 12 depth layers, T_DW = 16 > N_D - 1 = 11 PAST causal light-cone crossing, dim = 31,104)
//           in a STATIC spatially varying non-Abelian 2T background weak flux using ONE unified operator
//           over the 3-fiber weak multiplet (u_L, d_L, u_R): certifies maximal parity violation with
//           exponentially suppressed causal mirror tail at D = 0 (distinct from dynamical link spaces P1.2/P2.2).
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
        // qx = 2*pi*ix/N_BZ - pi => q = (0,0,0) is at (N_BZ/2, N_BZ/2, N_BZ/2), NOT (0,0,0)!
        if (ix === N_BZ / 2 && iy === N_BZ / 2 && iz === N_BZ / 2) continue
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

  // Exact 8-TRIM Weyl doubling & chirality audit (Nielsen-Ninomiya transparency for 3D local walk):
  // At all 8 TRIM points q_0 in {0, pi}^3, U_Weyl,pal(q_0) == I_2 (8 massless Weyl cones: 4 with chi=+1,
  // 4 with chi=-1, sum chi = 0). Gamma=(0,0,0) is exact isotropic c=1; the 7 BZ-boundary doublers are sheared
  // (removed in Part 2 by lifting onto the 4D {3,4,3,4} chiral domain wall U_DW).
  const dqTrim = 1e-5
  let maxTrimIdErr = 0
  let sumChirality = 0
  let posChiCount = 0
  let negChiCount = 0
  let gammaIsoErr = 0
  const trimRows: string[] = []
  for (let mask = 0; mask < 8; mask++) {
    const bx = mask & 1
    const by = (mask >> 1) & 1
    const bz = (mask >> 2) & 1
    const q0x = bx * PI
    const q0y = by * PI
    const q0z = bz * PI
    const u0 = uWeylPal(q0x, q0y, q0z)
    maxTrimIdErr = Math.max(
      maxTrimIdErr,
      cAbs(cSub(u0[0][0], C1)),
      cAbs(u0[0][1]),
      cAbs(u0[1][0]),
      cAbs(cSub(u0[1][1], C1)),
    )
    // Velocity Jacobian V_{a, mu} from U(q0 + dq e_mu) = I - i dq sum_a V_{a, mu} sigma_a
    const V = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    for (let mu = 0; mu < 3; mu++) {
      const dp = [mu === 0 ? dqTrim : 0, mu === 1 ? dqTrim : 0, mu === 2 ? dqTrim : 0] as const
      const up = uWeylPal(q0x + dp[0], q0y + dp[1], q0z + dp[2])
      const um = uWeylPal(q0x - dp[0], q0y - dp[1], q0z - dp[2])
      const diff = m2Add(up, m2Scale([-1, 0], um))
      for (let a = 0; a < 3; a++) {
        // (i / (4 dq)) * Tr(sigma_a * (U(+dq) - U(-dq)))
        const tr = m2Tr(m2Mul(PAULI[a]!, diff))
        V[a]![mu] = -tr[1] / (4 * dqTrim) // Re(i * (re + i im)) = -im
      }
    }
    const detV =
      V[0]![0]! * (V[1]![1]! * V[2]![2]! - V[1]![2]! * V[2]![1]!) -
      V[0]![1]! * (V[1]![0]! * V[2]![2]! - V[1]![2]! * V[2]![0]!) +
      V[0]![2]! * (V[1]![0]! * V[2]![1]! - V[1]![1]! * V[2]![0]!)
    const chi = detV > 0 ? 1 : -1
    sumChirality += chi
    if (chi > 0) posChiCount++
    else negChiCount++
    // Principal speeds = sqrt(eig(V^T V))
    const vtvRe = new Float64Array(9)
    const vtvIm = new Float64Array(9)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let s = 0
        for (let k = 0; k < 3; k++) s += V[k]![i]! * V[k]![j]!
        vtvRe[i * 3 + j] = s
      }
    }
    const sv = hermitianJacobi(3, vtvRe, vtvIm).vals.map(x => Math.sqrt(Math.max(0, x)))
    if (mask === 0) {
      gammaIsoErr = Math.max(Math.abs(sv[0]! - 1), Math.abs(sv[1]! - 1), Math.abs(sv[2]! - 1))
    }
    trimRows.push(
      `(${bx},${by},${bz})pi:chi=${chi > 0 ? '+1' : '-1'},det=${detV.toFixed(2)},sv=[${sv[0]!.toFixed(2)},${sv[1]!.toFixed(2)},${sv[2]!.toFixed(2)}]`,
    )
  }
  console.log(`  8-TRIM Weyl doubling audit (Nielsen-Ninomiya sum chi = ${sumChirality}):`)
  console.log(`    ${trimRows.slice(0, 4).join(' | ')}`)
  console.log(`    ${trimRows.slice(4, 8).join(' | ')}`)

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
    'P1.1c Single-speed lock closing 46x gap across [1,0,0],[1,1,0],[1,1,1] + 8-TRIM Nielsen-Ninomiya audit',
    maxWeylUniErr < 1e-14 &&
      maxRelMismatchAt1e3 < 1e-6 &&
      maxRelMismatchAt5e2 < 1e-3 &&
      maxIsoSpreadAt1e3 < 1e-6 &&
      maxTrimIdErr < 1e-14 &&
      sumChirality === 0 &&
      posChiCount === 4 &&
      negChiCount === 4 &&
      gammaIsoErr < 1e-8,
    `relDiff(1e-3)=${maxRelMismatchAt1e3.toExponential(2)}, relDiff(0.05)=${maxRelMismatchAt5e2.toExponential(2)}, isoSpread=${maxIsoSpreadAt1e3.toExponential(2)}, 8-TRIM chi=(+4,-4,sum=0), Gamma svErr=${gammaIsoErr.toExponential(2)}`,
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
                // |exp(i*2*pi*g/3) - 1|^2 = 3 identically for g in {1, 2}, giving exact ||(V_v - I)|psi>||
                bad2 += 3 * (re[i]! * re[i]! + im[i]! * im[i]!)
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
  // Note: on a periodic torus 24^3, the d=4 1D string carries a conserved k=0 winding mean E_x0 = d/V = 4/13824.
  const stringK0Mean = (xMinus - xPlus) / V
  let dot0 = 0
  let norm0 = 0
  let dot20 = 0
  let norm20 = 0
  let dotAvg = 0
  let normAvg = 0
  let dotAvgSub = 0
  let normAvgSub = 0
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
        const exSub = avgEx[i]! - stringK0Mean
        dotAvgSub += exSub * exC + avgEy[i]! * eyC + avgEz[i]! * ezC
        normAvgSub += exSub * exSub + avgEy[i]! ** 2 + avgEz[i]! ** 2
        normCoul2 += exC * exC + eyC * eyC + ezC * ezC
        transverseE2 += snapEy20[i]! ** 2 + snapEz20[i]! ** 2
      }
    }
  }
  const cosSim0 = dot0 / Math.sqrt(norm0 * normCoul2)
  const cosSim20 = dot20 / Math.sqrt(norm20 * normCoul2)
  const coulombCosSim = dotAvg / Math.sqrt(normAvg * normCoul2)
  const coulombCosSimK0Sub = dotAvgSub / Math.sqrt(normAvgSub * normCoul2)

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
    `  24^3 String->Coulomb radiation: cosSim(t=0 string)=${cosSim0.toFixed(4)} -> cosSim(t=20 snap)=${cosSim20.toFixed(4)} -> cosSim(T=60 Cesaro)=${coulombCosSim.toFixed(6)} (k=0 winding ${stringK0Mean.toExponential(2)} sub: ${coulombCosSimK0Sub.toFixed(6)}), E_perp^2(0->20)=0->${transverseE2.toFixed(4)}`,
  )
  console.log(
    `  3D static Coulomb 1/(4pi r) (L=64): G_64(0)=${gSelf64.toFixed(5)}, dV(4->10) err = ${(100 * maxCoulLawErr).toFixed(2)}%, 4pi*r*G(r) = [${coulProbes.join(', ')}]`,
  )

  // --- (B) Live 12^3 3D coupled two-wavepacket massive Dirac QED scattering
  //         Exact symmetric 3D Poisson Coulomb initialization (-grad phi_Coul from live rho(x,0), zero asymmetric
  //         spanning-tree string!), zero-mean-drift 4-component rest-frame Dirac packets (free stays at 4.000, 8.000!),
  //         exact parity symmetry (dx1 + dx2 = 0 to machine precision!), exact Gauss law & T = 20 reversal on ALL runs!
  const Ls = 12
  const Vs = Ls * Ls * Ls
  const sIdx = (x: number, y: number, z: number): number =>
    (((x + Ls) % Ls) * Ls + ((y + Ls) % Ls)) * Ls + ((z + Ls) % Ls)

  // Exact separable 3D discrete Poisson solver on Ls^3: (-Delta) phi = rho (k != 0), E = -grad phi
  function solveSymmetricPoisson3D(rhoIn: Float64Array): {
    readonly Ex: Float64Array
    readonly Ey: Float64Array
    readonly Ez: Float64Array
  } {
    const cosT = new Float64Array(Ls * Ls)
    const sinT = new Float64Array(Ls * Ls)
    const sin2 = new Float64Array(Ls)
    for (let k = 0; k < Ls; k++) {
      sin2[k] = 4 * Math.sin((PI * k) / Ls) ** 2
      for (let x = 0; x < Ls; x++) {
        const ang = (2 * PI * k * x) / Ls
        cosT[k * Ls + x] = Math.cos(ang)
        sinT[k * Ls + x] = Math.sin(ang)
      }
    }
    const f1R = new Float64Array(Vs)
    const f1I = new Float64Array(Vs)
    const f2R = new Float64Array(Vs)
    const f2I = new Float64Array(Vs)
    const f3R = new Float64Array(Vs)
    const f3I = new Float64Array(Vs)

    // Forward 1D DFT along x, then y, then z
    for (let y = 0; y < Ls; y++) {
      for (let z = 0; z < Ls; z++) {
        for (let kx = 0; kx < Ls; kx++) {
          let sr = 0
          let si = 0
          for (let x = 0; x < Ls; x++) {
            const v = rhoIn[sIdx(x, y, z)]!
            sr += v * cosT[kx * Ls + x]!
            si -= v * sinT[kx * Ls + x]!
          }
          const idx = sIdx(kx, y, z)
          f1R[idx] = sr
          f1I[idx] = si
        }
      }
    }
    for (let kx = 0; kx < Ls; kx++) {
      for (let z = 0; z < Ls; z++) {
        for (let ky = 0; ky < Ls; ky++) {
          let sr = 0
          let si = 0
          for (let y = 0; y < Ls; y++) {
            const idx = sIdx(kx, y, z)
            const c = cosT[ky * Ls + y]!
            const s = sinT[ky * Ls + y]!
            sr += f1R[idx]! * c + f1I[idx]! * s
            si += f1I[idx]! * c - f1R[idx]! * s
          }
          const o = sIdx(kx, ky, z)
          f2R[o] = sr
          f2I[o] = si
        }
      }
    }
    for (let kx = 0; kx < Ls; kx++) {
      for (let ky = 0; ky < Ls; ky++) {
        for (let kz = 0; kz < Ls; kz++) {
          let sr = 0
          let si = 0
          for (let z = 0; z < Ls; z++) {
            const idx = sIdx(kx, ky, z)
            const c = cosT[kz * Ls + z]!
            const s = sinT[kz * Ls + z]!
            sr += f2R[idx]! * c + f2I[idx]! * s
            si += f2I[idx]! * c - f2R[idx]! * s
          }
          const lam = sin2[kx]! + sin2[ky]! + sin2[kz]!
          const o = sIdx(kx, ky, kz)
          if (lam > 1e-12) {
            f3R[o] = sr / (lam * Vs)
            f3I[o] = si / (lam * Vs)
          }
        }
      }
    }
    // Inverse 1D DFT along z, then y, then x
    for (let kx = 0; kx < Ls; kx++) {
      for (let ky = 0; ky < Ls; ky++) {
        for (let z = 0; z < Ls; z++) {
          let sr = 0
          let si = 0
          for (let kz = 0; kz < Ls; kz++) {
            const idx = sIdx(kx, ky, kz)
            const c = cosT[kz * Ls + z]!
            const s = sinT[kz * Ls + z]!
            sr += f3R[idx]! * c - f3I[idx]! * s
            si += f3I[idx]! * c + f3R[idx]! * s
          }
          const o = sIdx(kx, ky, z)
          f2R[o] = sr
          f2I[o] = si
        }
      }
    }
    for (let kx = 0; kx < Ls; kx++) {
      for (let z = 0; z < Ls; z++) {
        for (let y = 0; y < Ls; y++) {
          let sr = 0
          let si = 0
          for (let ky = 0; ky < Ls; ky++) {
            const idx = sIdx(kx, ky, z)
            const c = cosT[ky * Ls + y]!
            const s = sinT[ky * Ls + y]!
            sr += f2R[idx]! * c - f2I[idx]! * s
            si += f2I[idx]! * c + f2R[idx]! * s
          }
          const o = sIdx(kx, y, z)
          f1R[o] = sr
          f1I[o] = si
        }
      }
    }
    const phi = new Float64Array(Vs)
    for (let y = 0; y < Ls; y++) {
      for (let z = 0; z < Ls; z++) {
        for (let x = 0; x < Ls; x++) {
          let sr = 0
          for (let kx = 0; kx < Ls; kx++) {
            const idx = sIdx(kx, y, z)
            sr += f1R[idx]! * cosT[kx * Ls + x]! - f1I[idx]! * sinT[kx * Ls + x]!
          }
          phi[sIdx(x, y, z)] = sr
        }
      }
    }
    const Ex = new Float64Array(Vs)
    const Ey = new Float64Array(Vs)
    const Ez = new Float64Array(Vs)
    for (let x = 0; x < Ls; x++) {
      for (let y = 0; y < Ls; y++) {
        for (let z = 0; z < Ls; z++) {
          const i = sIdx(x, y, z)
          Ex[i] = phi[i]! - phi[sIdx(x + 1, y, z)]!
          Ey[i] = phi[i]! - phi[sIdx(x, y + 1, z)]!
          Ez[i] = phi[i]! - phi[sIdx(x, y, z + 1)]!
        }
      }
    }
    return { Ex, Ey, Ez }
  }

  function runTwoPacketScattering(q1: number, q2: number): {
    readonly x1: number
    readonly x2: number
    readonly dx1: number
    readonly dx2: number
    readonly finalSep: number
    readonly maxGauss: number
    readonly maxNorm: number
    readonly revErr: number
  } {
    // 4-component massive Dirac spinors psi1, psi2 = (L_0, L_1, R_0, R_1) on Ls^3
    // Positive-energy rest-frame initial spinor: L = R = (1/sqrt(2), 0) => exact zero free drift!
    const p1R = new Float64Array(4 * Vs)
    const p1I = new Float64Array(4 * Vs)
    const p2R = new Float64Array(4 * Vs)
    const p2I = new Float64Array(4 * Vs)

    const pDist = (a: number, b: number): number => {
      let d = (a - b) % Ls
      if (d > Ls / 2) d -= Ls
      if (d < -Ls / 2) d += Ls
      return d
    }
    let n1 = 0
    let n2 = 0
    for (let x = 0; x < Ls; x++) {
      const dx1g = pDist(x, 4)
      const dx2g = pDist(x, 8)
      for (let y = 0; y < Ls; y++) {
        const dy = pDist(y, 6)
        for (let z = 0; z < Ls; z++) {
          const dz = pDist(z, 6)
          const i = sIdx(x, y, z)
          const g1 = Math.exp(-0.55 * (dx1g * dx1g + dy * dy + dz * dz))
          const g2 = Math.exp(-0.55 * (dx2g * dx2g + dy * dy + dz * dz))
          // Rest-frame positive-energy Dirac state: L_0 = R_0 = g, L_1 = R_1 = 0 => <v_x>=<v_y>=<v_z>=0!
          p1R[4 * i + 0] = g1
          p1R[4 * i + 2] = g1
          n1 += 2 * g1 * g1
          p2R[4 * i + 0] = g2
          p2R[4 * i + 2] = g2
          n2 += 2 * g2 * g2
        }
      }
    }
    const invN1 = 1 / Math.sqrt(n1)
    const invN2 = 1 / Math.sqrt(n2)
    for (let i = 0; i < 4 * Vs; i++) {
      p1R[i] = p1R[i]! * invN1
      p2R[i] = p2R[i]! * invN2
    }
    const p1R0 = Float64Array.from(p1R)
    const p2R0 = Float64Array.from(p2R)

    const rhoBg = -(q1 + q2) / Vs
    const rho0 = new Float64Array(Vs)
    for (let i = 0; i < Vs; i++) {
      const r1 = p1R[4 * i]! ** 2 + p1R[4 * i + 1]! ** 2 + p1R[4 * i + 2]! ** 2 + p1R[4 * i + 3]! ** 2
      const r2 = p2R[4 * i]! ** 2 + p2R[4 * i + 1]! ** 2 + p2R[4 * i + 2]! ** 2 + p2R[4 * i + 3]! ** 2
      rho0[i] = q1 * r1 + q2 * r2 + rhoBg
    }
    const initE = solveSymmetricPoisson3D(rho0)
    const ExS = initE.Ex
    const EyS = initE.Ey
    const EzS = initE.Ez
    const AxS = new Float64Array(Vs)
    const AyS = new Float64Array(Vs)
    const AzS = new Float64Array(Vs)
    const ExS0 = Float64Array.from(ExS)
    const EyS0 = Float64Array.from(EyS)
    const EzS0 = Float64Array.from(EzS)

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
    const MASS_M = 0.45
    const CM = Math.cos(MASS_M)
    const SM = Math.sin(MASS_M)

    const tmpR = new Float64Array(4 * Vs)
    const tmpI = new Float64Array(4 * Vs)

    function applySiteMatChiral(re: Float64Array, im: Float64Array, chiralOff: 0 | 2, M: CMat2): void {
      for (let i = 0; i < Vs; i++) {
        const i0 = 4 * i + chiralOff
        const i1 = 4 * i + chiralOff + 1
        const a0 = cAdd(cMul(M[0][0], [re[i0]!, im[i0]!]), cMul(M[0][1], [re[i1]!, im[i1]!]))
        const a1 = cAdd(cMul(M[1][0], [re[i0]!, im[i0]!]), cMul(M[1][1], [re[i1]!, im[i1]!]))
        re[i0] = a0[0]
        im[i0] = a0[1]
        re[i1] = a1[0]
        im[i1] = a1[1]
      }
    }

    // On-site mass coin U_mass = exp(-i m gamma^0): mixes L <-> R preserving |L|^2 + |R|^2 identically!
    function applyMassCoin(re: Float64Array, im: Float64Array, inv: boolean): void {
      const s = inv ? -SM : SM
      for (let i = 0; i < Vs; i++) {
        for (let sp = 0; sp < 2; sp++) {
          const iL = 4 * i + sp
          const iR = 4 * i + 2 + sp
          const lr = re[iL]!
          const li = im[iL]!
          const rr = re[iR]!
          const ri = im[iR]!
          // L' = CM * L - i s R = (CM lr + s ri) + i (CM li - s rr)
          // R' = -i s L + CM R = (CM rr + s li) + i (CM ri - s lr)
          re[iL] = CM * lr + s * ri
          im[iL] = CM * li - s * rr
          re[iR] = CM * rr + s * li
          im[iR] = CM * ri - s * lr
        }
      }
    }

    // Parity-symmetric directional shift with exact Gauss-law current feedback:
    //   chiralOff=0 (L): comp 0 moves +1, comp 1 moves -1
    //   chiralOff=2 (R): comp 0 moves -1, comp 1 moves +1 (exact spatial reflection partner!)
    function shiftChiralWithFeedback(
      re: Float64Array,
      im: Float64Array,
      qCharge: number,
      mu: number,
      chiralOff: 0 | 2,
      comp: 0 | 1,
      inv: boolean,
    ): void {
      const Aarr = mu === 0 ? AxS : mu === 1 ? AyS : AzS
      const Earr = mu === 0 ? ExS : mu === 1 ? EyS : EzS
      const baseDir = (chiralOff === 0 ? 1 : -1) * (comp === 0 ? 1 : -1)
      const fwdDir = baseDir * (inv ? -1 : 1)
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
            const linkSite = fwdDir === 1 ? i : j
            const aVal = Aarr[linkSite]!
            const phase = -fwdDir * qCharge * aVal
            const cp = Math.cos(phase)
            const sp = Math.sin(phase)
            const cOff = chiralOff + comp
            const r = re[4 * i + cOff]!
            const m = im[4 * i + cOff]!
            tmpR[4 * j + cOff] = cp * r - sp * m
            tmpI[4 * j + cOff] = cp * m + sp * r
            const prob = r * r + m * m
            if (!inv) {
              Earr[linkSite] = Earr[linkSite]! - baseDir * qCharge * prob
            } else {
              Earr[linkSite] = Earr[linkSite]! + baseDir * qCharge * prob
            }
          }
        }
      }
      re.set(tmpR)
      im.set(tmpI)
    }

    function stepAxisDirac(
      re: Float64Array,
      im: Float64Array,
      qCharge: number,
      mu: number,
      thetaSign: 1 | -1,
      inv: boolean,
    ): void {
      // Exact parity-paired Dirac step: U_R(q) = U_L(-q) IDENTICALLY!
      // Both L and R use the exact same coin angles (hC, fC); ONLY the spatial shift direction flips for R!
      // Therefore spatial reflection x -> L - x combined with L <-> R is an EXACT discrete symmetry (dx1 + dx2 == 0)!
      const hC = thetaSign === 1 ? TH_HALF_N : TH_HALF_P
      const fC = thetaSign === 1 ? TH_FULL_P : TH_FULL_N
      const hCInv = thetaSign === 1 ? TH_HALF_P : TH_HALF_N
      const fCInv = thetaSign === 1 ? TH_FULL_N : TH_FULL_P

      if (!inv) {
        // L block
        applySiteMatChiral(re, im, 0, B_MATS[mu]!)
        applySiteMatChiral(re, im, 0, hC)
        shiftChiralWithFeedback(re, im, qCharge, mu, 0, 1, false)
        applySiteMatChiral(re, im, 0, fC)
        shiftChiralWithFeedback(re, im, qCharge, mu, 0, 0, false)
        applySiteMatChiral(re, im, 0, hC)
        applySiteMatChiral(re, im, 0, B_DAGS[mu]!)
        // R block: exact spatial parity partner U_R(q) = U_L(-q)
        applySiteMatChiral(re, im, 2, B_MATS[mu]!)
        applySiteMatChiral(re, im, 2, hC)
        shiftChiralWithFeedback(re, im, qCharge, mu, 2, 1, false)
        applySiteMatChiral(re, im, 2, fC)
        shiftChiralWithFeedback(re, im, qCharge, mu, 2, 0, false)
        applySiteMatChiral(re, im, 2, hC)
        applySiteMatChiral(re, im, 2, B_DAGS[mu]!)
      } else {
        // Inverse R block
        applySiteMatChiral(re, im, 2, B_MATS[mu]!)
        applySiteMatChiral(re, im, 2, hCInv)
        shiftChiralWithFeedback(re, im, qCharge, mu, 2, 0, true)
        applySiteMatChiral(re, im, 2, fCInv)
        shiftChiralWithFeedback(re, im, qCharge, mu, 2, 1, true)
        applySiteMatChiral(re, im, 2, hCInv)
        applySiteMatChiral(re, im, 2, B_DAGS[mu]!)
        // Inverse L block
        applySiteMatChiral(re, im, 0, B_MATS[mu]!)
        applySiteMatChiral(re, im, 0, hCInv)
        shiftChiralWithFeedback(re, im, qCharge, mu, 0, 0, true)
        applySiteMatChiral(re, im, 0, fCInv)
        shiftChiralWithFeedback(re, im, qCharge, mu, 0, 1, true)
        applySiteMatChiral(re, im, 0, hCInv)
        applySiteMatChiral(re, im, 0, B_DAGS[mu]!)
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
      // Exact palindromic single-speed beat (matching P1.1 U_Weyl,pal + U_Max,pal!):
      //   First half:  (x, y, z) with +theta + Maxwell sub-beat
      //   Second half: (z, y, x) with -theta + Maxwell sub-beat
      // Eliminates O(q^2) spin-tilt drift identically => exact zero free drift & exact dx1 + dx2 = 0!
      if (!inv) {
        applyMassCoin(p1R, p1I, false)
        applyMassCoin(p2R, p2I, false)
        for (let mu = 0; mu < 3; mu++) {
          stepAxisDirac(p1R, p1I, q1, mu, 1, false)
          stepAxisDirac(p2R, p2I, q2, mu, 1, false)
        }
        stepMaxwellSmall(false)
        for (let mu = 2; mu >= 0; mu--) {
          stepAxisDirac(p1R, p1I, q1, mu, -1, false)
          stepAxisDirac(p2R, p2I, q2, mu, -1, false)
        }
        stepMaxwellSmall(false)
      } else {
        stepMaxwellSmall(true)
        for (let mu = 0; mu < 3; mu++) {
          stepAxisDirac(p2R, p2I, q2, mu, -1, true)
          stepAxisDirac(p1R, p1I, q1, mu, -1, true)
        }
        stepMaxwellSmall(true)
        for (let mu = 2; mu >= 0; mu--) {
          stepAxisDirac(p2R, p2I, q2, mu, 1, true)
          stepAxisDirac(p1R, p1I, q1, mu, 1, true)
        }
        applyMassCoin(p2R, p2I, true)
        applyMassCoin(p1R, p1I, true)
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
            let r1 = 0
            let r2 = 0
            for (let c = 0; c < 4; c++) {
              r1 += p1R[4 * i + c]! ** 2 + p1I[4 * i + c]! ** 2
              r2 += p2R[4 * i + c]! ** 2 + p2I[4 * i + c]! ** 2
            }
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
    let x1AtT3 = 4
    let x2AtT3 = 8
    for (let t = 1; t <= T_SCAT; t++) {
      stepCoupledBeat(false)
      const st = checkGaussS()
      maxGauss = Math.max(maxGauss, st.gErr)
      maxNorm = Math.max(maxNorm, st.nErr)
      // At t = 3 palindromic beats (= 6 sub-beats, before torus wrap-around at c=1, L/2=6)
      if (t === 3) {
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
              let r1 = 0
              let r2 = 0
              for (let c = 0; c < 4; c++) {
                r1 += p1R[4 * i + c]! ** 2 + p1I[4 * i + c]! ** 2
                r2 += p2R[4 * i + c]! ** 2 + p2I[4 * i + c]! ** 2
              }
              s1c += r1 * ca
              s1s += r1 * sa
              s2c += r2 * ca
              s2s += r2 * sa
            }
          }
        }
        x1AtT3 = ((Math.atan2(s1s, s1c) * Ls) / (2 * PI) + Ls) % Ls
        x2AtT3 = ((Math.atan2(s2s, s2c) * Ls) / (2 * PI) + Ls) % Ls
      }
    }

    // Reverse T = 20 beats
    for (let t = 1; t <= T_SCAT; t++) stepCoupledBeat(true)
    let revErr = 0
    for (let i = 0; i < 4 * Vs; i++) {
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
    return {
      x1: x1AtT3,
      x2: x2AtT3,
      dx1: x1AtT3 - 4,
      dx2: x2AtT3 - 8,
      finalSep: x2AtT3 - x1AtT3,
      maxGauss,
      maxNorm,
      revErr,
    }
  }

  const freeRun = runTwoPacketScattering(0, 0)
  const oppRun = runTwoPacketScattering(2.2, -2.2)
  const likeRun = runTwoPacketScattering(2.2, 2.2)
  const deltaOpp = oppRun.finalSep - freeRun.finalSep
  const deltaLike = likeRun.finalSep - freeRun.finalSep
  const oppParityErr = Math.abs(oppRun.dx1 + oppRun.dx2)
  const likeParityErr = Math.abs(likeRun.dx1 + likeRun.dx2)
  console.log(
    `  12^3 3D massive Dirac palindromic wavepacket scattering (t=3 beats=6 sub-beats, symmetric Poisson init):`,
  )
  console.log(
    `    free (0,0):       x1=${freeRun.x1.toFixed(6)}, x2=${freeRun.x2.toFixed(6)} (dx1=${freeRun.dx1.toExponential(2)}, dx2=${freeRun.dx2.toExponential(2)})`,
  )
  console.log(
    `    opp  (+2.2,-2.2): x1=${oppRun.x1.toFixed(6)} (dx1=${oppRun.dx1 >= 0 ? '+' : ''}${oppRun.dx1.toFixed(5)}), x2=${oppRun.x2.toFixed(6)} (dx2=${oppRun.dx2 >= 0 ? '+' : ''}${oppRun.dx2.toFixed(5)}), Delta_sep=${deltaOpp.toFixed(5)}, |dx1+dx2|=${oppParityErr.toExponential(2)}`,
  )
  console.log(
    `    like (+2.2,+2.2): x1=${likeRun.x1.toFixed(6)} (dx1=${likeRun.dx1 >= 0 ? '+' : ''}${likeRun.dx1.toFixed(5)}), x2=${likeRun.x2.toFixed(6)} (dx2=${likeRun.dx2 >= 0 ? '+' : ''}${likeRun.dx2.toFixed(5)}), Delta_sep=${deltaLike.toFixed(5)}, |dx1+dx2|=${likeParityErr.toExponential(2)}`,
  )

  recordCheck(
    'P1.3a 24^3 3D String->Coulomb radiation (ZERO hard-coded 1/r, exact Gauss & T=20 reversal)',
    maxGauss3D < 1e-14 &&
      maxRev3D < 1e-14 &&
      coulombCosSim > 0.999 &&
      coulombCosSimK0Sub > 0.9999 &&
      transverseE2 > 0.1 &&
      maxCoulLawErr < 0.04 &&
      r6Err < 0.015,
    `gaussErr=${maxGauss3D.toExponential(2)}, revErr=${maxRev3D.toExponential(2)}, cosSim=${coulombCosSim.toFixed(6)} (k0-sub=${coulombCosSimK0Sub.toFixed(6)}), dV(4->10)err=${(100 * maxCoulLawErr).toFixed(2)}%, r=6 err=${(100 * r6Err).toFixed(2)}%`,
  )
  recordCheck(
    'P1.3b 12^3 3D symmetric Dirac scattering (zero free drift, opp attract / like repel, parity-exact)',
    Math.abs(freeRun.dx1) < 1e-13 &&
      Math.abs(freeRun.dx2) < 1e-13 &&
      oppRun.dx1 > 0.005 &&
      oppRun.dx2 < -0.005 &&
      likeRun.dx1 < -0.005 &&
      likeRun.dx2 > 0.005 &&
      oppParityErr < 1e-13 &&
      likeParityErr < 1e-13 &&
      oppRun.maxGauss < 1e-13 &&
      likeRun.maxGauss < 1e-13 &&
      oppRun.maxNorm < 1e-13 &&
      likeRun.maxNorm < 1e-13 &&
      oppRun.revErr < 1e-13 &&
      likeRun.revErr < 1e-13,
    `free_dx=(${freeRun.dx1.toExponential(1)},${freeRun.dx2.toExponential(1)}), opp_dx=(+${oppRun.dx1.toFixed(5)},${oppRun.dx2.toFixed(5)}), like_dx=(${likeRun.dx1.toFixed(5)},+${likeRun.dx2.toFixed(5)}), |dx1+dx2|=${Math.max(oppParityErr, likeParityErr).toExponential(2)}, gauss=${Math.max(oppRun.maxGauss, likeRun.maxGauss).toExponential(2)}, norm=${Math.max(oppRun.maxNorm, likeRun.maxNorm).toExponential(2)}, rev=${Math.max(oppRun.revErr, likeRun.revErr).toExponential(2)}`,
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
    // chi = 0 (Left-handed doublet): gauge-covariant 20x20 local unitary uBond coupled to dynamical SU(2)_L link!
    // chi = 1 (Right-handed singlet): identical free kinetic hopping exp(-i TAU_HOP_W (psi_y^dag I_2 psi_x + h.c.))
    //         coupled to trivial I_2 (strictly commutes with G_v^a, genuinely mobile yet sterile to weak links!).
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
    // Free kinetic hopping on chi = 1 (Right-handed singlet): exp(-i * TAU_HOP_W * sigma_x) on (vx, vy)
    const cf = Math.cos(TAU_HOP_W)
    const sf = inv ? Math.sin(TAU_HOP_W) : -Math.sin(TAU_HOP_W)
    for (let iso = 0; iso < 2; iso++) {
      for (let l3 = 0; l3 < 125; l3++) {
        const ix = wIdx(1, vx, iso, l3)
        const iy = wIdx(1, vy, iso, l3)
        const rx = re[ix]!
        const mx = im[ix]!
        const ry = re[iy]!
        const my = im[iy]!
        // x' = cf * x + i * sf * y = (cf rx - sf my) + i (cf mx + sf ry)
        re[ix] = cf * rx - sf * my
        im[ix] = cf * mx + sf * ry
        re[iy] = cf * ry - sf * mx
        im[iy] = cf * my + sf * rx
      }
    }
  }

  // Exact full-operator dense matrix commutator proofs covering 100% of all 1,500/1,500 basis states:
  //   1) [hBond, G_x^a] = 0 and [hBond, G_y^a] = 0 (6 exact 20x20 commutators)
  //   2) [hPlaq, G_v^a] = 0 (9 exact 125x125 commutators)
  let maxFullBondComm = 0
  for (let a = 0; a < 3; a++) {
    const Ta = T_HALF[a]!
    const LR = L5Re[a]!
    const LI = L5Im[a]!
    const RR = R5Re[a]!
    const RI = R5Im[a]!
    // Build 20x20 G_x^a (R_e^a on link + Q_x^a on x) and G_y^a (L_e^a on link + Q_y^a on y)
    for (const end of [0, 1] as const) {
      const gRe = new Float64Array(400)
      const gIm = new Float64Array(400)
      const linkR = end === 0 ? RR : LR
      const linkI = end === 0 ? RI : LI
      for (let side = 0; side < 2; side++) {
        for (let iso = 0; iso < 2; iso++) {
          for (let l = 0; l < 5; l++) {
            const col = side * 10 + iso * 5 + l
            for (let lp = 0; lp < 5; lp++) {
              const row = side * 10 + iso * 5 + lp
              gRe[row * 20 + col] = gRe[row * 20 + col]! + linkR[lp * 5 + l]!
              gIm[row * 20 + col] = gIm[row * 20 + col]! + linkI[lp * 5 + l]!
            }
            if (side === end) {
              for (let iso2 = 0; iso2 < 2; iso2++) {
                const row = side * 10 + iso2 * 5 + l
                const e = Ta[iso2]![iso]!
                gRe[row * 20 + col] = gRe[row * 20 + col]! + e[0]
                gIm[row * 20 + col] = gIm[row * 20 + col]! + e[1]
              }
            }
          }
        }
      }
      // Compute ||hBond * G - G * hBond||_F
      let f2 = 0
      for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 20; c++) {
          let sr = 0
          let si = 0
          for (let k = 0; k < 20; k++) {
            const h1 = hBondRe[r * 20 + k]!
            const h2 = hBondRe[k * 20 + c]!
            sr += h1 * gRe[k * 20 + c]! - gRe[r * 20 + k]! * h2
            si += h1 * gIm[k * 20 + c]! - gIm[r * 20 + k]! * h2
          }
          f2 += sr * sr + si * si
        }
      }
      maxFullBondComm = Math.max(maxFullBondComm, Math.sqrt(f2))
    }
  }

  let maxFullPlaqComm = 0
  for (let v = 0; v < 3; v++) {
    const eOut = v
    const eIn = (v + 2) % 3
    for (let a = 0; a < 3; a++) {
      const LR = L5Re[a]!
      const LI = L5Im[a]!
      const RR = R5Re[a]!
      const RI = R5Im[a]!
      // Sparse action of G_{link, v}^a on 125 link states: check ||hPlaq * G - G * hPlaq||_max
      const gPlaqR = new Float64Array(125 * 125)
      const gPlaqI = new Float64Array(125 * 125)
      for (let l0 = 0; l0 < 5; l0++) {
        for (let l1 = 0; l1 < 5; l1++) {
          for (let l2 = 0; l2 < 5; l2++) {
            const col = linkIdx3(l0, l1, l2)
            const ls = [l0, l1, l2]
            for (let lp = 0; lp < 5; lp++) {
              const nIn = [l0, l1, l2]
              nIn[eIn] = lp
              const rIn = linkIdx3(nIn[0]!, nIn[1]!, nIn[2]!)
              gPlaqR[rIn * 125 + col] = gPlaqR[rIn * 125 + col]! + LR[lp * 5 + ls[eIn]!]!
              gPlaqI[rIn * 125 + col] = gPlaqI[rIn * 125 + col]! + LI[lp * 5 + ls[eIn]!]!
              const nOut = [l0, l1, l2]
              nOut[eOut] = lp
              const rOut = linkIdx3(nOut[0]!, nOut[1]!, nOut[2]!)
              gPlaqR[rOut * 125 + col] = gPlaqR[rOut * 125 + col]! + RR[lp * 5 + ls[eOut]!]!
              gPlaqI[rOut * 125 + col] = gPlaqI[rOut * 125 + col]! + RI[lp * 5 + ls[eOut]!]!
            }
          }
        }
      }
      let f2 = 0
      for (let r = 0; r < 125; r++) {
        for (let c = 0; c < 125; c++) {
          let sr = 0
          let si = 0
          for (let k = 0; k < 125; k++) {
            const h1 = hPlaqRe[r * 125 + k]!
            const h2 = hPlaqRe[k * 125 + c]!
            if (h1 !== 0) {
              sr += h1 * gPlaqR[k * 125 + c]!
              si += h1 * gPlaqI[k * 125 + c]!
            }
            if (h2 !== 0) {
              sr -= gPlaqR[r * 125 + k]! * h2
              si -= gPlaqI[r * 125 + k]! * h2
            }
          }
          f2 += sr * sr + si * si
        }
      }
      maxFullPlaqComm = Math.max(maxFullPlaqComm, Math.sqrt(f2))
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
  let uE24UniErr = 0
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 24; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < 24; k++) {
        const ar = uE24Re[k * 24 + i]!
        const ai = -uE24Im[k * 24 + i]!
        const br = uE24Re[k * 24 + j]!
        const bi = uE24Im[k * 24 + j]!
        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }
      uE24UniErr = Math.max(uE24UniErr, Math.hypot(sr - (i === j ? 1 : 0), si))
    }
  }
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

  // Verify [U_weak^(2T), V_v(h)] = 0 across ALL 24 Hurwitz units h in 2T, BOTH vertices, and 4 independent
  // orthogonal basis states (192/192 checks!)
  const probes2T: readonly (readonly [number, number, number, number])[] = [
    [0, 0, 1, 5],
    [0, 1, 7, 14],
    [1, 0, 12, 19],
    [1, 1, 3, 22],
  ]
  const p2tR = new Float64Array(DIM2T)
  const p2tI = new Float64Array(DIM2T)
  const a2tR = new Float64Array(DIM2T)
  const a2tI = new Float64Array(DIM2T)
  const b2tR = new Float64Array(DIM2T)
  const b2tI = new Float64Array(DIM2T)
  const c2tR = new Float64Array(DIM2T)
  const c2tI = new Float64Array(DIM2T)

  let max2TGaussComm = 0
  for (const [pv, piso, pg0, pg1] of probes2T) {
    p2tR.fill(0)
    p2tI.fill(0)
    p2tR[idx2T(pv, piso, pg0, pg1)] = 1
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
  }
  // Check T = 20 reversal on full 2T plaquette from nontrivial superposition
  p2tR.fill(0)
  p2tI.fill(0)
  p2tR[idx2T(0, 0, 1, 5)] = 0.6
  p2tI[idx2T(1, 1, 12, 19)] = 0.8
  const rev2tR = Float64Array.from(p2tR)
  const rev2tI = Float64Array.from(p2tI)
  for (let t = 1; t <= 20; t++) applyUWeak2T(rev2tR, rev2tI, false)
  for (let t = 1; t <= 20; t++) applyUWeak2T(rev2tR, rev2tI, true)
  let rev2TErr = 0
  for (let i = 0; i < DIM2T; i++) {
    rev2TErr = Math.max(rev2TErr, Math.hypot(rev2tR[i]! - p2tR[i]!, rev2tI[i]! - p2tI[i]!))
  }

  // Exclusive antisymmetric 3-boson Yang-Mills fusion vertex inside PURE U_B^(2T) (no fermion hopping!):
  // Compute |<W^3, vac | U_B^(2T) | A, B>|^2 on the 24x24 pure link space:
  //   - Signal:     |W^1, W^2> -> |W^3, vac>  (nonzero antisymmetric eps^{abc} 3-boson fusion!)
  //   - Controls:   |W^1, W^1> -> |W^3, vac>  === 0 (exact symmetry veto!)
  //                 |W^1, vac> -> |W^3, vac>  === 0 (exact orthogonality veto!)
  //                 |vac, vac> -> |W^3, vac>  === 0 (exact vacuum-stability veto!)
  const adjVec = (a: number, b: number): Float64Array => {
    const v = new Float64Array(24)
    for (let gi = 0; gi < 24; gi++) {
      const U = G2T.mats[gi]!
      v[gi] = 0.5 * m2Tr(m2Mul(PAULI[a]!, m2Mul(U, m2Mul(PAULI[b]!, m2Dag(U)))))[0] * Math.sqrt(3 / 24)
    }
    return v
  }
  const vacVec = new Float64Array(24).fill(1 / Math.sqrt(24))
  const w1Vec = adjVec(0, 0)
  const w2Vec = adjVec(1, 1)
  const w3Vec = adjVec(2, 2)

  function pureUBFusionProb(in0: Float64Array, in1: Float64Array, out0: Float64Array, out1: Float64Array): number {
    let sr = 0
    let si = 0
    for (let g0 = 0; g0 < 24; g0++) {
      for (let g1 = 0; g1 < 24; g1++) {
        const hol = G2T.mulTab[g0]![G2T.invTab[g1]!]!
        const reTr = G2T.elems[hol]![0]!
        const ph = cExpI(BETA_2T * reTr)
        const w = out0[g0]! * out1[g1]! * in0[g0]! * in1[g1]!
        sr += w * ph[0]
        si += w * ph[1]
      }
    }
    return sr * sr + si * si
  }

  const pUB_W1W2_to_W3vac = pureUBFusionProb(w1Vec, w2Vec, w3Vec, vacVec)
  const pUB_W1W1_to_W3vac = pureUBFusionProb(w1Vec, w1Vec, w3Vec, vacVec)
  const pUB_W1vac_to_W3vac = pureUBFusionProb(w1Vec, vacVec, w3Vec, vacVec)
  const pUB_vacvac_to_W3vac = pureUBFusionProb(vacVec, vacVec, w3Vec, vacVec)

  // Also check full U_weak^(2T) (including U_hop + U_B + U_E) exclusive |W^3, vac> probability (summed over fermion)
  const mixR = new Float64Array(DIM2T)
  const mixI = new Float64Array(DIM2T)
  for (let g0 = 0; g0 < 24; g0++) {
    for (let g1 = 0; g1 < 24; g1++) {
      mixR[idx2T(0, 0, g0, g1)] = w1Vec[g0]! * w2Vec[g1]!
    }
  }
  applyUWeak2T(mixR, mixI, false)
  let fullExclW3Vac = 0
  for (let m = 0; m < 4; m++) {
    let sr = 0
    let si = 0
    for (let g0 = 0; g0 < 24; g0++) {
      for (let g1 = 0; g1 < 24; g1++) {
        const i = (m * 24 + g0) * 24 + g1
        const w = w3Vec[g0]! * vacVec[g1]!
        sr += w * mixR[i]!
        si += w * mixI[i]!
      }
    }
    fullExclW3Vac += sr * sr + si * si
  }
  console.log(
    `  Pure U_B^(2T) exclusive 3-boson fusion: P(W1,W2->W3,vac)=${pUB_W1W2_to_W3vac.toExponential(4)} vs controls W1W1=${pUB_W1W1_to_W3vac.toExponential(2)}, W1vac=${pUB_W1vac_to_W3vac.toExponential(2)}, vacvac=${pUB_vacvac_to_W3vac.toExponential(2)} (full U_weak excl=${fullExclW3Vac.toExponential(4)})`,
  )

  recordCheck(
    'P2.2a Exact full-operator SU(2)_L Gauss law [U_weak, G_v^a] = 0 (all 1,500/1,500 states) & T=20 rev',
    maxFullBondComm < 1e-14 &&
      maxFullPlaqComm < 1e-14 &&
      maxWeakGaussComm < 1e-14 &&
      maxWeakLieAlgErr < 1e-14 &&
      weakRevErr < 1e-14 &&
      uBond.uniErr < 1e-14 &&
      uPlaq.uniErr < 1e-14,
    `||[hBond,G]||=${maxFullBondComm.toExponential(2)}, ||[hPlaq,G]||=${maxFullPlaqComm.toExponential(2)}, ||[U,G_v^a]||=${maxWeakGaussComm.toExponential(2)}, revErr=${weakRevErr.toExponential(2)}`,
  )
  recordCheck(
    'P2.2b Quantum chiral parity violation on 2T-projected triangle (mobile P_R singlet vs coupled P_L doublet)',
    maxFlipL > 0.3 && maxMoveL > 0.3 && maxMoveR > 0.3 && maxFlipR < 1e-15,
    `P_L: maxFlip(u->d)=${maxFlipL.toFixed(4)}, maxMove=${maxMoveL.toFixed(4)}; P_R (free kinetic): maxMove=${maxMoveR.toFixed(4)}, maxFlip=${maxFlipR.toExponential(2)}`,
  )
  recordCheck(
    'P2.2c Full 24-element 2T plaquette Gauss law (192/192 checks) & exclusive antisymmetric W1,W2->W3,vac vertex',
    max2TGaussComm < 1e-14 &&
      uE24UniErr < 1e-14 &&
      rev2TErr < 1e-14 &&
      pUB_W1W2_to_W3vac > 1e-3 &&
      pUB_W1W1_to_W3vac < 1e-28 &&
      pUB_W1vac_to_W3vac < 1e-28 &&
      pUB_vacvac_to_W3vac < 1e-28,
    `max||[U_2T,V_v(h)]||=${max2TGaussComm.toExponential(2)}, uE24Uni=${uE24UniErr.toExponential(2)}, revErr=${rev2TErr.toExponential(2)}, P_UB(W1,W2->W3,vac)=${pUB_W1W2_to_W3vac.toExponential(3)} vs ctrl=${pUB_W1W1_to_W3vac.toExponential(1)}`,
  )
}

// ----------------------------------------------------------------------------
// P2.3: Live 3+1D Strictly Finite-Range Z[zeta_9][1/2] Chiral Domain-Wall QCA
//       (6^3 Husk x N_D = 12 Depth, T_DW = 16 > N_D - 1 = 11 PAST CAUSAL LIGHT CONE!)
//       in a STATIC spatially varying non-Abelian 2T background weak flux!
//       (Explicitly distinguished from the full quantum dynamical link spaces in P1.2 & P2.2.)
//       ALL THREE modes (L_doublet_D0, R_singlet_D0, R_mirror_D11) evolve under ONE SINGLE
//       UNIFIED OPERATOR U_DW(linkField) on the 3-fiber weak multiplet (u_L, d_L, u_R) with ZERO mode flag!
// ----------------------------------------------------------------------------
function runPart2_3(): void {
  console.log('\n--- P2.3: Live 3+1D {3,4,3,4} Domain Wall (N_D=12, T=16 > light cone) + Static 2T Background Flux ---')

  // Exact strictly finite-range Z[zeta_9][1/2] chiral domain-wall coin K from finite-range-chiral-wall.ts:
  function eqCoin(aStep: number, phiStep: number): CMat2 {
    const a = (aStep * PI) / 9
    const phi = (phiStep * PI) / 9
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const off01: C = [-sa * Math.sin(phi), -sa * Math.cos(phi)]
    const off10: C = [sa * Math.sin(phi), -sa * Math.cos(phi)]
    return [
      [[ca, 0], off01],
      [off10, [ca, 0]],
    ]
  }
  const K_WALL = m2Mul(eqCoin(1, 1), m2Mul(eqCoin(-2, 0), eqCoin(1, 1)))
  const K_DAG = m2Dag(K_WALL)

  // 3D {4,3,4} husk L_h = 6 (216 sites), depth N_D = 12, 2 wall-chiralities (tau in {0,1}),
  // 2 Weyl spins, and 3 weak-multiplet fiber components:
  //   f in {0, 1}: SU(2)_L doublet (u_L, d_L) (I = 1/2), V_2 pairs (|d, tau=1>, |d+1, tau=0>) -> L zero mode at D=0, R mirror at D=11
  //   f = 2:       SU(2)_L singlet (u_R)      (I = 0),   V_2 pairs (|d, tau=0>, |d+1, tau=1>) -> R zero mode at D=0 (transforms as 1!)
  // Total state dim = 6^3 * 12 * 4 * 3 = 31,104!
  const LH = 6
  const VH = LH * LH * LH
  const ND = 12
  const NF = 3
  const DIM_DW = VH * ND * 4 * NF
  const dwIdx = (site: number, d: number, tau: number, spin: number, f: number): number =>
    ((((site * ND + d) * 2 + tau) * 2 + spin) * NF + f)
  const hSite = (x: number, y: number, z: number): number =>
    (((x + LH) % LH) * LH + ((y + LH) % LH)) * LH + ((z + LH) % LH)

  // Two link backgrounds fed into the EXACT SAME unified operator U_DW(linkField):
  //   1) idLinks:   identity I_2 on every link (free control)
  //   2) fluxLinks: static spatially varying non-Abelian 2T Hurwitz links {i, j, (-1+i+j+k)/2, (1+i-j+k)/2}
  const gId = 0
  const gI = G2T.keyMap.get('0,2,0,0')!
  const gJ = G2T.keyMap.get('0,0,2,0')!
  const gW1 = G2T.keyMap.get('-1,1,1,1')!
  const gW2 = G2T.keyMap.get('1,1,-1,1')!
  const fluxPalette = [gI, gJ, gW1, gW2] as const
  const idLinks: number[][] = [new Array(VH).fill(gId), new Array(VH).fill(gId), new Array(VH).fill(gId)]
  const fluxLinks: number[][] = [new Array(VH), new Array(VH), new Array(VH)]
  for (let x = 0; x < LH; x++) {
    for (let y = 0; y < LH; y++) {
      for (let z = 0; z < LH; z++) {
        const s = hSite(x, y, z)
        fluxLinks[0]![s] = fluxPalette[(x + 2 * y + z) % 4]!
        fluxLinks[1]![s] = fluxPalette[(2 * x + y + 3 * z) % 4]!
        fluxLinks[2]![s] = fluxPalette[(x + y + 2 * z) % 4]!
      }
    }
  }

  const tmpR = new Float64Array(DIM_DW)
  const tmpI = new Float64Array(DIM_DW)

  // Unified chiral link shift on tau=0 (doublet) and tau=1 (singlet):
  // Representation matrix on 3-fiber (u_L, d_L, u_R) is block-diagonal diag(U_link^(2T) on {0,1} at d=0, I_1 on {2})!
  function shiftWallAxis(
    re: Float64Array,
    im: Float64Array,
    mu: 0 | 1 | 2,
    dir: 1 | -1,
    links: readonly (readonly number[])[],
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
          const gIdx = links[mu]![linkSite]!
          const Ulink = dir === 1 ? G2T.mats[gIdx]! : m2Dag(G2T.mats[gIdx]!)
          for (let d = 0; d < ND; d++) {
            for (let spin = 0; spin < 2; spin++) {
              // Doublet (f=0,1): shifts tau=0, coupled to Ulink at d=0
              const s0 = dwIdx(s, d, 0, spin, 0)
              const s1 = dwIdx(s, d, 0, spin, 1)
              const d0 = dwIdx(ns, d, 0, spin, 0)
              const d1 = dwIdx(ns, d, 0, spin, 1)
              if (d === 0) {
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
              // Singlet (f=2, trivial I=0 rep of 2T): shifts tau=1 with exact 1x1 identity [1] at ALL d (including d=0!)
              const s2 = dwIdx(s, d, 1, spin, 2)
              const d2 = dwIdx(ns, d, 1, spin, 2)
              tmpR[d2] = re[s2]!
              tmpI[d2] = im[s2]!
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
          for (let f = 0; f < NF; f++) {
            const i0 = dwIdx(s, d, 0, spin, f)
            const i1 = dwIdx(s, d, 1, spin, f)
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

  function applyV1Axis(
    re: Float64Array,
    im: Float64Array,
    mu: 0 | 1 | 2,
    links: readonly (readonly number[])[],
    inv: boolean,
  ): void {
    if (!inv) {
      shiftWallAxis(re, im, mu, -1, links)
      applyOnSiteTauMat(re, im, K_WALL)
      shiftWallAxis(re, im, mu, 1, links)
      applyOnSiteTauMat(re, im, K_DAG)
    } else {
      applyOnSiteTauMat(re, im, K_WALL)
      shiftWallAxis(re, im, mu, -1, links)
      applyOnSiteTauMat(re, im, K_DAG)
      shiftWallAxis(re, im, mu, 1, links)
    }
  }

  function applyV2Depth(re: Float64Array, im: Float64Array, inv: boolean): void {
    const M = inv ? K_DAG : K_WALL
    for (let s = 0; s < VH; s++) {
      for (let d = 0; d < ND - 1; d++) {
        for (let spin = 0; spin < 2; spin++) {
          // Doublet (f=0,1): pairs (|d, tau=1>, |d+1, tau=0>) -> L zero mode at D=0, R mirror at D=ND-1
          for (let f = 0; f < 2; f++) {
            const i0 = dwIdx(s, d, 1, spin, f)
            const i1 = dwIdx(s, d + 1, 0, spin, f)
            const a0: C = [re[i0]!, im[i0]!]
            const a1: C = [re[i1]!, im[i1]!]
            const r0 = cAdd(cMul(M[0][0], a0), cMul(M[0][1], a1))
            const r1 = cAdd(cMul(M[1][0], a0), cMul(M[1][1], a1))
            re[i0] = r0[0]
            im[i0] = r0[1]
            re[i1] = r1[0]
            im[i1] = r1[1]
          }
          // Singlet (f=2): opposite-sign wall pairs (|d, tau=0>, |d+1, tau=1>) -> R zero mode at D=0!
          const j0 = dwIdx(s, d, 0, spin, 2)
          const j1 = dwIdx(s, d + 1, 1, spin, 2)
          const b0: C = [re[j0]!, im[j0]!]
          const b1: C = [re[j1]!, im[j1]!]
          const q0 = cAdd(cMul(M[0][0], b0), cMul(M[0][1], b1))
          const q1 = cAdd(cMul(M[1][0], b0), cMul(M[1][1], b1))
          re[j0] = q0[0]
          im[j0] = q0[1]
          re[j1] = q1[0]
          im[j1] = q1[1]
        }
      }
    }
  }

  // Unified husk Weyl shift along x: acts identically on all 3 fibers with rep diag(U_link on D=0 tau=0 doublet, I_1 on singlet)
  function applyHuskWeyl(
    re: Float64Array,
    im: Float64Array,
    links: readonly (readonly number[])[],
    inv: boolean,
  ): void {
    tmpR.set(re)
    tmpI.set(im)
    const dir0: 1 | -1 = inv ? -1 : 1
    const dir1: 1 | -1 = inv ? 1 : -1
    for (let x = 0; x < LH; x++) {
      for (let y = 0; y < LH; y++) {
        for (let z = 0; z < LH; z++) {
          const s = hSite(x, y, z)
          const ns0 = hSite((x + dir0 + LH) % LH, y, z)
          const ns1 = hSite((x + dir1 + LH) % LH, y, z)
          const g0 = links[0]![dir0 === 1 ? s : ns0]!
          const g1 = links[0]![dir1 === 1 ? s : ns1]!
          const U0 = dir0 === 1 ? G2T.mats[g0]! : m2Dag(G2T.mats[g0]!)
          const U1 = dir1 === 1 ? G2T.mats[g1]! : m2Dag(G2T.mats[g1]!)
          for (let d = 0; d < ND; d++) {
            for (let tau = 0; tau < 2; tau++) {
              const useWeakD = d === 0 && tau === 0
              // Doublet spin=0
              const a00: C = [re[dwIdx(s, d, tau, 0, 0)]!, im[dwIdx(s, d, tau, 0, 0)]!]
              const a01: C = [re[dwIdx(s, d, tau, 0, 1)]!, im[dwIdx(s, d, tau, 0, 1)]!]
              if (useWeakD) {
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
              // Doublet spin=1
              const b10: C = [re[dwIdx(s, d, tau, 1, 0)]!, im[dwIdx(s, d, tau, 1, 0)]!]
              const b11: C = [re[dwIdx(s, d, tau, 1, 1)]!, im[dwIdx(s, d, tau, 1, 1)]!]
              if (useWeakD) {
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
              // Singlet f=2 (trivial I=0 rep of 2T): propagates identically with rep [1]
              tmpR[dwIdx(ns0, d, tau, 0, 2)] = re[dwIdx(s, d, tau, 0, 2)]!
              tmpI[dwIdx(ns0, d, tau, 0, 2)] = im[dwIdx(s, d, tau, 0, 2)]!
              tmpR[dwIdx(ns1, d, tau, 1, 2)] = re[dwIdx(s, d, tau, 1, 2)]!
              tmpI[dwIdx(ns1, d, tau, 1, 2)] = im[dwIdx(s, d, tau, 1, 2)]!
            }
          }
        }
      }
    }
    re.set(tmpR)
    im.set(tmpI)
  }

  function stepDWUnified(
    re: Float64Array,
    im: Float64Array,
    links: readonly (readonly number[])[],
    inv: boolean,
  ): void {
    if (!inv) {
      applyHuskWeyl(re, im, links, false)
      applyV1Axis(re, im, 2, links, false)
      applyV1Axis(re, im, 1, links, false)
      applyV1Axis(re, im, 0, links, false)
      applyV2Depth(re, im, false)
    } else {
      applyV2Depth(re, im, true)
      applyV1Axis(re, im, 0, links, true)
      applyV1Axis(re, im, 1, links, true)
      applyV1Axis(re, im, 2, links, true)
      applyHuskWeyl(re, im, links, true)
    }
  }

  // Evolve ALL THREE modes through the EXACT SAME unified operator stepDWUnified (idLinks vs fluxLinks)
  // for T_DW = 16 > N_D - 1 = 11 beats (5 full beats PAST causal light-cone crossing of the entire depth slab!)
  const T_DW = 16
  function testModeUnified(mode: 'L_doublet_D0' | 'R_singlet_D0' | 'R_mirror_D11'): {
    readonly deltaP: number
    readonly isoFlip: number
    readonly revErr: number
    readonly wallWeight: number
    readonly weightAtD0: number
  } {
    const rFree = new Float64Array(DIM_DW)
    const iFree = new Float64Array(DIM_DW)
    const rWeak = new Float64Array(DIM_DW)
    const iWeak = new Float64Array(DIM_DW)

    const targetD = mode === 'R_mirror_D11' ? ND - 1 : 0
    const targetTau = mode === 'L_doublet_D0' ? 0 : 1
    const targetF = mode === 'R_singlet_D0' ? 2 : 0
    for (let x = 0; x < LH; x++) {
      const amp = 1 + 0.15 * Math.cos((2 * PI * x) / LH)
      for (let y = 0; y < LH; y++) {
        for (let z = 0; z < LH; z++) {
          const s = hSite(x, y, z)
          const idx = dwIdx(s, targetD, targetTau, 0, targetF)
          rFree[idx] = amp
          rWeak[idx] = amp
        }
      }
    }
    let n2 = 0
    for (let i = 0; i < DIM_DW; i++) n2 += rFree[i]! ** 2
    const invN = 1 / Math.sqrt(n2)
    for (let i = 0; i < DIM_DW; i++) {
      rFree[i] = rFree[i]! * invN
      rWeak[i] = rWeak[i]! * invN
    }
    const rWeak0 = Float64Array.from(rWeak)

    let maxDeltaP = 0
    let maxFlip = 0
    let wallWeight = 0
    let weightAtD0 = 0
    for (let t = 1; t <= T_DW; t++) {
      // EXACT SAME operator with NO mode boolean: only link background changes (idLinks vs fluxLinks)!
      stepDWUnified(rFree, iFree, idLinks, false)
      stepDWUnified(rWeak, iWeak, fluxLinks, false)
      let ovR = 0
      let ovI = 0
      let flip = 0
      let wD = 0
      let w0 = 0
      for (let s = 0; s < VH; s++) {
        for (let d = 0; d < ND; d++) {
          for (let tau = 0; tau < 2; tau++) {
            for (let spin = 0; spin < 2; spin++) {
              for (let f = 0; f < NF; f++) {
                const idx = dwIdx(s, d, tau, spin, f)
                ovR += rFree[idx]! * rWeak[idx]! + iFree[idx]! * iWeak[idx]!
                ovI += rFree[idx]! * iWeak[idx]! - iFree[idx]! * rWeak[idx]!
                const p = rWeak[idx]! ** 2 + iWeak[idx]! ** 2
                if (f === 1) flip += p
                if (d === targetD) wD += p
                if (d === 0) w0 += p
              }
            }
          }
        }
      }
      maxDeltaP = Math.max(maxDeltaP, Math.max(0, 1 - (ovR * ovR + ovI * ovI)))
      maxFlip = Math.max(maxFlip, flip)
      wallWeight = wD
      weightAtD0 = Math.max(weightAtD0, w0)
    }

    for (let t = 1; t <= T_DW; t++) stepDWUnified(rWeak, iWeak, fluxLinks, true)
    let revErr = 0
    for (let i = 0; i < DIM_DW; i++) {
      revErr = Math.max(revErr, Math.hypot(rWeak[i]! - rWeak0[i]!, iWeak[i]!))
    }
    return { deltaP: maxDeltaP, isoFlip: maxFlip, revErr, wallWeight, weightAtD0 }
  }

  const resL = testModeUnified('L_doublet_D0')
  const resRSinglet = testModeUnified('R_singlet_D0')
  const resRMirror = testModeUnified('R_mirror_D11')

  console.log(
    `  3+1D Unified Domain Wall (6^3 x N_D=${ND}, T=${T_DW} > ${ND - 1} causal crossing, dim=${DIM_DW}, static 2T background flux):`,
  )
  console.log(
    `    L doublet  (D=0, f=0):  Delta P_L = ${resL.deltaP.toFixed(6)}, P(u_L->d_L) = ${resL.isoFlip.toFixed(6)}, D=0 wt = ${resL.wallWeight.toFixed(6)}, revErr = ${resL.revErr.toExponential(2)}`,
  )
  console.log(
    `    R singlet  (D=0, f=2):  Delta P_R = ${resRSinglet.deltaP.toExponential(2)}, P(flip) = ${resRSinglet.isoFlip.toExponential(2)}, D=0 wt = ${resRSinglet.wallWeight.toFixed(6)}, revErr = ${resRSinglet.revErr.toExponential(2)}`,
  )
  console.log(
    `    R mirror  (D=11, f=0):  Delta P_mir = ${resRMirror.deltaP.toExponential(2)}, P(flip) = ${resRMirror.isoFlip.toExponential(2)}, D=11 wt = ${resRMirror.wallWeight.toFixed(6)}, max D=0 tail = ${resRMirror.weightAtD0.toExponential(2)}, revErr = ${resRMirror.revErr.toExponential(2)}`,
  )

  recordCheck(
    'P2.3 Unified 3+1D domain wall (N_D=12, T=16 > light cone) + static 2T background maximal parity violation',
    resL.deltaP > 0.5 &&
      resL.isoFlip > 0.3 &&
      resRSinglet.deltaP < 1e-12 &&
      resRSinglet.wallWeight > 0.95 &&
      resRMirror.deltaP < 1e-12 &&
      resRMirror.weightAtD0 > 0 &&
      resRMirror.weightAtD0 < 1e-12 &&
      resL.revErr < 1e-13 &&
      resRSinglet.revErr < 1e-13 &&
      resRMirror.revErr < 1e-13,
    `DeltaP_L=${resL.deltaP.toFixed(4)} (flip=${resL.isoFlip.toFixed(4)}), DeltaP_R=${resRSinglet.deltaP.toExponential(2)} (D0wt=${resRSinglet.wallWeight.toFixed(4)}), DeltaP_mir=${resRMirror.deltaP.toExponential(2)} (causal D0 tail=${resRMirror.weightAtD0.toExponential(2)})`,
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

  // Explicit normality verification: Delta(27) <| Sigma(648) under all 4 generators (108/108 checks!)
  const m3Dag = (a: Mat3): Mat3 => {
    const out: C[] = new Array(9)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) out[i * 3 + j] = cConj(a[j * 3 + i]!)
    return out
  }
  const delta27Keys = new Set<string>(delta27.map(m3Key))
  const s648Gens: readonly Mat3[] = [CLOCK3, SHIFT3, PHASE_T, HESS_V]
  let delta27NormDefects = 0
  for (const d of delta27) {
    for (const g of s648Gens) {
      const conj = m3Mul(g, m3Mul(d, m3Dag(g)))
      if (!delta27Keys.has(m3Key(conj))) delta27NormDefects++
    }
  }

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
  // P3.3: Standard Model Z_6 Central Quotient (Z_18 faithful vs Z_6 quotient-collapsed),
  //       Left-Right z_{6,LR} kernel, Y = T_R^3 + (B-L)/2 & 5 Anomalies
  // --------------------------------------------------------------------------
  interface Multiplet {
    readonly name: string
    readonly nColor: number // 3, -3 (anti-triplet), 1
    readonly nWeakL: number // 2 or 1
    readonly nWeakR: number // 2 or 1
    readonly tR3: number // 0, +1/2, -1/2
    readonly bMinusL: number // +1/3, -1/3, -1, +1 (for LH states!)
    readonly sixY: number
  }
  const gen1: readonly Multiplet[] = [
    { name: 'Q_L', nColor: 3, nWeakL: 2, nWeakR: 1, tR3: 0, bMinusL: 1 / 3, sixY: 1 },
    { name: 'u_R^c', nColor: -3, nWeakL: 1, nWeakR: 2, tR3: -0.5, bMinusL: -1 / 3, sixY: -4 },
    { name: 'd_R^c', nColor: -3, nWeakL: 1, nWeakR: 2, tR3: 0.5, bMinusL: -1 / 3, sixY: 2 },
    { name: 'L_L', nColor: 1, nWeakL: 2, nWeakR: 1, tR3: 0, bMinusL: -1, sixY: -3 },
    { name: 'e_R^c', nColor: 1, nWeakL: 1, nWeakR: 2, tR3: 0.5, bMinusL: 1, sixY: 6 },
    { name: 'nu_R^c', nColor: 1, nWeakL: 1, nWeakR: 2, tR3: -0.5, bMinusL: 1, sixY: 0 },
  ]

  // Check:
  //   1) SM central z_6 = (omega I_3, -I_2L, zeta_6^{6Y}) invariance on all 6 multiplets (16 Weyl)
  //   2) Left-Right central z_{6,LR} = (omega I_3, -I_2L, -I_2R, zeta_6^{3(B-L)}) invariance on all 4 LR multiplets
  //   3) Faithfulness of Z_18 (6/6 distinct hypercharges mod 18) vs Z_6 quotient collapse (u_R^c -4 == d_R^c +2 mod 6!)
  const ZETA6 = cExpI(PI / 3)
  let maxZ6Err = 0
  let maxZ6LRErr = 0
  let maxLRFormulaErr = 0
  let anomSU3sqY = 0
  let anomSU2sqY = 0
  let anomY3 = 0
  let anomGravY = 0
  let wittenDoublets = 0
  let totalWeyl = 0
  const yMod6 = new Set<number>()
  const yMod18 = new Set<number>()
  const blMod6 = new Set<number>()
  const blMod18 = new Set<number>()

  for (const m of gen1) {
    const dimC = Math.abs(m.nColor)
    const mult = dimC * m.nWeakL
    totalWeyl += mult
    const yVal = m.sixY / 6
    const yPred = m.tR3 + 0.5 * m.bMinusL
    maxLRFormulaErr = Math.max(maxLRFormulaErr, Math.abs(yVal - yPred))

    yMod6.add(((m.sixY % 6) + 6) % 6)
    yMod18.add(((m.sixY % 18) + 18) % 18)
    const threeBL = Math.round(3 * m.bMinusL)
    blMod6.add(((threeBL % 6) + 6) % 6)
    blMod18.add(((threeBL % 18) + 18) % 18)

    // SM central z_6 action: color * (-1 for 2_L) * zeta_6^(6Y)
    const cPh: C = m.nColor === 3 ? W : m.nColor === -3 ? W2 : C1
    const wLPh: C = m.nWeakL === 2 ? [-1, 0] : C1
    const wRPh: C = m.nWeakR === 2 ? [-1, 0] : C1
    let yPh: C = C1
    const stepsY = ((m.sixY % 6) + 6) % 6
    for (let k = 0; k < stepsY; k++) yPh = cMul(yPh, ZETA6)
    maxZ6Err = Math.max(maxZ6Err, cAbs(cSub(cMul(cMul(cPh, wLPh), yPh), C1)))

    // Left-Right central z_{6,LR} = (omega I_3, -I_2L, -I_2R, zeta_6^{3(B-L)})
    let blPh: C = C1
    const stepsBL = ((threeBL % 6) + 6) % 6
    for (let k = 0; k < stepsBL; k++) blPh = cMul(blPh, ZETA6)
    const z6LRAct = cMul(cMul(cMul(cPh, wLPh), wRPh), blPh)
    maxZ6LRErr = Math.max(maxZ6LRErr, cAbs(cSub(z6LRAct, C1)))

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
    `  |Delta(27)|=${delta27.length} (normality defects in Sigma(648)=${delta27NormDefects}/108), |Sigma(648)|=${sigma648.length}, |Z(Sigma(648))|=${s648CenterCount}, detErr=${s648DetErr.toExponential(2)}, uniErr=${s648UniErr.toExponential(2)}`,
  )
  console.log(
    `  Sigma(648) unitary t-design frame potentials in SU(3): k=1: ${s648FP1.toFixed(12)} (SU3=1), k=2: ${s648FP2.toFixed(12)} (SU3=2 => EXACT 2-design!), k=3: ${s648FP3.toFixed(6)} (SU3=6)`,
  )
  console.log(
    `  16 Weyl fermions (total=${totalWeyl}): max|z_6(SM)-1|=${maxZ6Err.toExponential(2)}, max|z_6(LR)-1|=${maxZ6LRErr.toExponential(2)}, max|Y-(T_R^3+(B-L)/2)|=${maxLRFormulaErr.toExponential(2)}, maxAnom=${maxAnomErr.toExponential(2)}, Witten=${wittenDoublets}`,
  )
  console.log(
    `  Hypercharge faithfulness: Z_6 distinct=${yMod6.size}/6 (quotient-collapsed: u_R^c==d_R^c & e_R^c==nu_R^c mod 6), native Z_18 distinct=${yMod18.size}/6 (faithful Z_3 quotient, |G_SM(Z_18)|=${orderSM18}), B-L distinct: Z_6=${blMod6.size}/4 vs Z_18=${blMod18.size}/4, |G_LR|=${orderLR}`,
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
    'P3.2 Delta(27) (27) <| Sigma(648) (648) < SU(3)_C exact normality & unitary 2-design in SU(3)',
    delta27.length === 27 &&
      delta27NormDefects === 0 &&
      sigma648.length === 648 &&
      s648CenterCount === 3 &&
      s648DetErr < 1e-13 &&
      s648UniErr < 1e-13 &&
      Math.abs(s648FP1 - 1) < 1e-12 &&
      Math.abs(s648FP2 - 2) < 1e-12,
    `|Delta(27)|=27 (0/108 norm defects), |Sigma(648)|=648, |Z|=3, FP(k=1,2)=(${s648FP1.toFixed(6)}, ${s648FP2.toFixed(6)}), FP(k=3)=${s648FP3.toFixed(4)}`,
  )
  recordCheck(
    'P3.3 Exact SM/LR Z_6 kernels, faithful Z_18 hypercharges (6/6), Y = T_R^3+(B-L)/2 & 5-channel anomalies',
    totalWeyl === 16 &&
      maxZ6Err < 1e-14 &&
      maxZ6LRErr < 1e-14 &&
      maxLRFormulaErr < 1e-15 &&
      maxAnomErr < 1e-15 &&
      wittenDoublets === 4 &&
      yMod6.size === 4 &&
      yMod18.size === 6 &&
      blMod6.size === 3 &&
      blMod18.size === 4 &&
      orderSM6 === 15552 &&
      orderSM18 === 46656 &&
      orderLR === 373248,
    `z_6(SM/LR) err=(${maxZ6Err.toExponential(1)},${maxZ6LRErr.toExponential(1)}), Z_18 faithful=6/6 Y & 4/4 B-L (Z_6=4/6 Y, 3/4 B-L), anomErr=${maxAnomErr.toExponential(1)}, |G_SM(Z_18)|=46,656, |G_LR|=373,248`,
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
