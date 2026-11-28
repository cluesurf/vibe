// ============================================================================
// RETIREMENT NOTICE (G4 RETIRED — HISTORICAL NEGATIVE-CONTROL ARCHIVE):
//   Part G4 below (the bolted-on range-3 B_3 6-parameter Bloch-Toeplitz existence
//   hack) is RETIRED and replaced by the zero-hack, strictly 1-hop native D_4
//   outer-triality orbifold derivation (T^4_{D_4} / <L(q_3)> + unique primitive
//   Kaehler flux F_prim, Pf = 6, ind = (0, 3, 3), 2T_R = SL(2,3) -> 1 (+) 2'')
//   certified in `test/verify/sm-native-three-generations.ts` (gates N1.1..N5.1).
//   This file is preserved untouched and runnable as the historical G1..G3
//   negative-control archive and G4 retirement reference.
// ============================================================================
//
// STANDARD MODEL CLOSURE TRACK 2 — THREE GENERATIONS INDEX & NO-GO AUDIT (G1..G4)
//
// Strictly deterministic (ZERO Math.random), zero external imports, strict TypeScript,
// fast (< 6 s, < 250 MB RAM), hard assert() checks (exits non-zero on any failure).
//
// Parts certified:
//   G1: 24 = 8 + 8 + 8 Three 16-Cell Negative Control
//       - Exact BigInt |W(F_4)| = 1152 and |Stab(v_cusp)| = 48 (= O_h).
//       - Cusp-Triality Breaking: 0 outer D_4 triality elements fix v_cusp.
//       - Exact 10-conjugacy-class O_h character table proving 3_frame = A_{1g} (+) E_g
//         (NOT 3 * A_{1g}), ||chi_frame||^2 = 2.
//       - Explicit A4 coupled inter-frame chiral bond B_6 = sum_q P_q (x) V_2^(q):
//         proves ||[R_90, B_6]|| > 0.1 (explicitly breaks 90 deg O_h isotropy) AND
//         exact constant-DFT decoupling F_3 B_6 F_3^dag = diag(V_2^(0), V_2^(1), V_2^(2)),
//         plus bare untwisted 24-slot bulk Bloch winding = 0 (non-chiral).
//   G2: 9 = 3 x 3 Qutrit Grid / ASL(2,3) Negative Control (No-Double-Counting Theorem)
//       - Exhaustive 216-element ASL(2,3) = SL(2,3) (x|) Z_3^2 action on Z_3^2 (9 points).
//       - Exact 2-transitivity (1 orbit on all 72 ordered distinct pairs), primitivity
//         (0 invariant 3-block partitions among all 4 affine line foliations), and
//         Burnside character proof C^9 = 1 (+) 8 (irreducible octet, NEVER 3_C (x) 3_gen).
//       - Exact 648-element Sigma(648) < SU(3) closure, exact 3:1 quotient onto ASL(2,3)
//         via discrete Wigner phase-point operators A(a,b), and exact Fourier conjugation
//         HESS_V * CLOCK3 * HESS_V^dag = SHIFT3 swapping role <-> tilt axes.
//   G3: Spatial Z_3 Horosphere Twist / Domain-Wall Pocket Negative Control
//       - Narrow-pocket BT4 wall (r_pocket = 0.8258 rad < 2*pi/3 = 2.0944 rad): N_gen = 1.
//       - Wide-pocket Wilson domain wall (M_0 / r = 7/4 in (3/2, 2), r_pocket = 2.419 rad):
//         N_gen = 3 across k_x = 2*pi*q/3 (q = 0, 1, 2) with 0 at all 7 TRIM doublers.
//       - Explicit 3D -> 2D dimensional-loss and k_x <-> -k_x parity-degeneracy obstruction
//         (q = 1, 2 acquire identical UV-scale 2+1D Dirac mass |sin(2*pi/3)| = sqrt(3)/2
//         and identical depth decay rates, with continuous k_x lost).
//   G4: [TIER B EFFECTIVE BLOCH-TOEPLITZ EXISTENCE PROOF — NOT DERIVED FROM BARE {3,4,3,4}]
//       100% O_h-Isotropic 1-Flavor Period-3 Chiral Depth Toeplitz Wall W_3
//       - Single 1-flavor 4-component Dirac spinor on D = 0..18 (76 x 76 full unitary,
//         ZERO I_3 (x) U tensoring!), period-3 chiral depth palindrome
//         U_depth(k) = C_0(k) B_1 B_2 B_3(2 b_3) B_2 B_1 C_0(k) with exact chiral symmetry.
//       - EXPLICIT TIER B CONSTRUCTION DISCLOSURE:
//         (1) N_gen = 3 is engineered by an explicit range-3 depth-hopping bond B_3
//             (|d,R> <-> |d+3,L>) with 6 continuous non-Z[omega] real parameters
//             (T1=-0.05, T2=0.12, T3=0.36, T_GAMMA=-0.01, c_W=1.40, c_D=0.35) in an
//             inverted hierarchy |T_3| > |T_2| > |T_1| (replacing range-3 with range-M
//             yields N_gen = M).
//         (2) U_Weyl(k) = exp(-i * 0.5 * sin(k) . sigma) (Weyl speed ALPHA_WEYL = 0.5,
//             NOT W16's c = 1.0) and rational tan(theta_0(k)) are infinite-range
//             real-space 3D operators (not finite-range split-step QCA gates), which is
//             why W_3 achieves 0.000000 O_h rotational defect (whereas finite-range
//             split-step Weyl QCAs like W16 have O(k^3) axis-ordering anisotropy).
//         (3) Y_ab = <e_a | 1/N_D | e_b> in G4.4 is a Left-Left projection assuming a
//             matched RH husk wall (e_R = e_L, since W_3's own RH mirrors live on the
//             far floor D = 18) and inherits its 1 : 1/18 : 1/330 hierarchy
//             (y_3 / y_1 ~ 391.3) primarily from Gram-Schmidt shell projection against
//             Phi(D) = 1/N_D (Cauchy interlacing), using the exact {3,4,3,4} Steinberg
//             shell recurrence N_d = 21 N_{d-1} - 51 N_{d-2} + 23 N_{d-3} (d >= 4).
//       - Certifies exact bulk topological winding (nu_0, nu_pi) = (3, 0) at Gamma,
//         (0, 0) at all 7 TRIM doublers, nu_pi = 0 across full 8^3 BZ_3 scan,
//         EXACTLY 6 Left-handed husk zero modes (N_gen = 3 Weyl doublets, 0 RH husk
//         zero modes, 0 4th generation, next bulk gap > 0.15 rad), 3 strictly distinct
//         exponential depth decay roots 0 < |z_1| < |z_2| < |z_3| < 1, and y_3/y_1 > 10^2.

const T_START_MS = performance.now()
const PI = Math.PI
const SQRT3 = Math.sqrt(3)

// ============================================================================
// 0. HARD ASSERTION & VERIFICATION LEDGER
// ============================================================================

type CheckRow = {
  readonly id: string
  readonly name: string
  readonly pass: boolean
  readonly metric: string
}

const CHECKS: CheckRow[] = []

function assert(cond: boolean, msg: string): asserts cond {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`)
  }
}

function recordCheck(id: string, name: string, pass: boolean, metric: string): void {
  CHECKS.push({ id, name, pass, metric })
  assert(pass, `[${id}] ${name} — ${metric}`)
}

// ============================================================================
// 1. COMPLEX ARITHMETIC, DENSE MATRIX ENGINE & UNITARY JACOBI EIGENSOLVER
// ============================================================================

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
const cArg = (a: C): number => Math.atan2(a[1], a[0])
const cExpI = (t: number): C => [Math.cos(t), Math.sin(t)]

function wrapDiff(a: number, b: number): number {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b))
}

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }

function cmatZero(n: number): CMat {
  return { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
}

function cmatEye(n: number): CMat {
  const m = cmatZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
}

function cmatClone(A: CMat): CMat {
  return { n: A.n, re: Float64Array.from(A.re), im: Float64Array.from(A.im) }
}

function cmatDag(A: CMat): CMat {
  const n = A.n
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[i * n + j] = A.re[j * n + i]!
      out.im[i * n + j] = -A.im[j * n + i]!
    }
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

function cmatSub(A: CMat, B: CMat): CMat {
  const n = A.n
  const out = cmatZero(n)
  for (let i = 0; i < n * n; i++) {
    out.re[i] = A.re[i]! - B.re[i]!
    out.im[i] = A.im[i]! - B.im[i]!
  }
  return out
}

function cmatFrob(A: CMat): number {
  let s = 0
  for (let i = 0; i < A.re.length; i++) {
    const r = A.re[i]!
    const im = A.im[i]!
    s += r * r + im * im
  }
  return Math.sqrt(s)
}

function cmatMaxAbs(A: CMat): number {
  let m = 0
  for (let i = 0; i < A.re.length; i++) {
    const a = Math.hypot(A.re[i]!, A.im[i]!)
    if (a > m) m = a
  }
  return m
}

function cmatUnitaryErr(U: CMat): number {
  return cmatFrob(cmatSub(cmatMul(cmatDag(U), U), cmatEye(U.n)))
}

function complexDet(M: CMat): C {
  const n = M.n
  const re = Float64Array.from(M.re)
  const im = Float64Array.from(M.im)
  let det: C = [1, 0]
  for (let col = 0; col < n; col++) {
    let piv = col
    let maxA = Math.hypot(re[col * n + col]!, im[col * n + col]!)
    for (let r = col + 1; r < n; r++) {
      const a = Math.hypot(re[r * n + col]!, im[r * n + col]!)
      if (a > maxA) {
        maxA = a
        piv = r
      }
    }
    if (maxA < 1e-30) return [0, 0]
    if (piv !== col) {
      det = [-det[0], -det[1]]
      for (let j = col; j < n; j++) {
        const tr = re[col * n + j]!
        const ti = im[col * n + j]!
        re[col * n + j] = re[piv * n + j]!
        im[col * n + j] = im[piv * n + j]!
        re[piv * n + j] = tr
        im[piv * n + j] = ti
      }
    }
    const pr = re[col * n + col]!
    const pi = im[col * n + col]!
    det = cMul(det, [pr, pi])
    const p2 = pr * pr + pi * pi
    for (let r = col + 1; r < n; r++) {
      const ar = re[r * n + col]!
      const ai = im[r * n + col]!
      if (ar === 0 && ai === 0) continue
      const fr = (ar * pr + ai * pi) / p2
      const fi = (ai * pr - ar * pi) / p2
      for (let j = col + 1; j < n; j++) {
        const br = re[col * n + j]!
        const bi = im[col * n + j]!
        re[r * n + j] = re[r * n + j]! - (fr * br - fi * bi)
        im[r * n + j] = im[r * n + j]! - (fr * bi + fi * br)
      }
    }
  }
  return det
}

// Cyclic Jacobi eigensolver for complex Hermitian n x n matrix H
// Returns eigenvalues ascending and eigenvectors stored row-wise: vec[k * n + r]
function hermitianJacobi(
  n: number,
  hReIn: Float64Array,
  hImIn: Float64Array,
): { values: Float64Array; vecRe: Float64Array; vecIm: Float64Array } {
  const aRe = Float64Array.from(hReIn)
  const aIm = Float64Array.from(hImIn)
  // Force exact Hermiticity
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
  const vRe = new Float64Array(n * n)
  const vIm = new Float64Array(n * n)
  for (let i = 0; i < n; i++) vRe[i * n + i] = 1

  const maxSweeps = 40
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let offNorm2 = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const rr = aRe[p * n + q]!
        const ii = aIm[p * n + q]!
        offNorm2 += rr * rr + ii * ii
      }
    }
    if (offNorm2 < 1e-29 * n * n) break
    const thresh = sweep < 3 ? Math.sqrt(offNorm2) / (5 * n) : 0

    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const gr = aRe[p * n + q]!
        const gi = aIm[p * n + q]!
        const mag = Math.hypot(gr, gi)
        if (mag <= thresh || mag < 1e-16) continue

        // Phase e^{i phi} = a_pq / |a_pq| so e^{-i phi} a_pq = mag (real > 0)
        const pr = gr / mag
        const pi = gi / mag
        const app = aRe[p * n + p]!
        const aqq = aRe[q * n + q]!
        const tau = (aqq - app) / (2 * mag)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.sqrt(1 + t * t)
        const s = t * c
        // Unitary 2x2 J acting on rows/cols (p, q):
        //   J = [[c, s * e^{i phi}], [-s * e^{-i phi}, c]]  (so J^dag H J zeros (p, q))
        // Wait: check (J^dag H J)_pq = c^2 a_pq - s^2 e^{2i phi} a_qp + c s e^{i phi} (a_qq - a_pp)?
        // Let u_p' = c u_p - s e^{-i phi} u_q, u_q' = s e^{i phi} u_p + c u_q.
        // Then <u_p' | H | u_q'> = (c^2 - s^2) mag e^{i phi} + c s e^{i phi} (a_pp - a_qq) -> wait:
        // Want (c^2 - s^2) mag + c s (a_pp - a_qq) = 0 => (a_qq - a_pp)/(2 mag) = (c^2 - s^2)/(2 c s) = (1 - t^2)/(2 t) = tau!
        // YES! So u_p' = c u_p - s e^{-i phi} u_q and u_q' = s e^{i phi} u_p + c u_q!
        // Wait: in row-vector convention V_row[k, r] = u_k(r):
        //   V_p' = c V_p - s e^{-i phi} V_q
        //   V_q' = s e^{i phi} V_p + c V_q
        // And for matrix entries A' = J^dag A J where column p of J is [c, -s e^{-i phi}]^T and col q is [s e^{i phi}, c]^T:
        //   Left multiply by J^dag: row p' = c row_p - s e^{+i phi} row_q; row q' = s e^{-i phi} row_p + c row_q
        //   Right multiply by J:    col p' = c col_p - s e^{-i phi} col_q; col q' = s e^{+i phi} col_p + c col_q
        const srP = s * pr
        const siP = s * pi // s e^{i phi} = (srP, siP); s e^{-i phi} = (srP, -siP)

        // Update rows p and q (left multiply by J^dag)
        for (let k = 0; k < n; k++) {
          const apr = aRe[p * n + k]!
          const api = aIm[p * n + k]!
          const aqr = aRe[q * n + k]!
          const aqi = aIm[q * n + k]!
          // row p' = c * row_p - (srP + i siP) * row_q
          aRe[p * n + k] = c * apr - (srP * aqr - siP * aqi)
          aIm[p * n + k] = c * api - (srP * aqi + siP * aqr)
          // row q' = (srP - i siP) * row_p + c * row_q
          aRe[q * n + k] = srP * apr + siP * api + c * aqr
          aIm[q * n + k] = srP * api - siP * apr + c * aqi
        }
        // Update cols p and q (right multiply by J)
        for (let k = 0; k < n; k++) {
          const akpR = aRe[k * n + p]!
          const akpI = aIm[k * n + p]!
          const akqR = aRe[k * n + q]!
          const akqI = aIm[k * n + q]!
          // col p' = c * col_p - (srP - i siP) * col_q
          aRe[k * n + p] = c * akpR - (srP * akqR + siP * akqI)
          aIm[k * n + p] = c * akpI - (srP * akqI - siP * akqR)
          // col q' = (srP + i siP) * col_p + c * col_q
          aRe[k * n + q] = srP * akpR - siP * akpI + c * akqR
          aIm[k * n + q] = srP * akpI + siP * akpR + c * akqI
        }
        aRe[p * n + q] = 0
        aIm[p * n + q] = 0
        aRe[q * n + p] = 0
        aIm[q * n + p] = 0
        aIm[p * n + p] = 0
        aIm[q * n + q] = 0

        // Update eigenvectors (stored row-wise: row k of V is column k of eigenvector matrix!)
        // col p' = c col_p - (srP - i siP) col_q; col q' = (srP + i siP) col_p + c col_q
        const po = p * n
        const qo = q * n
        for (let r = 0; r < n; r++) {
          const vpr = vRe[po + r]!
          const vpi = vIm[po + r]!
          const vqr = vRe[qo + r]!
          const vqi = vIm[qo + r]!
          vRe[po + r] = c * vpr - (srP * vqr + siP * vqi)
          vIm[po + r] = c * vpi - (srP * vqi - siP * vqr)
          vRe[qo + r] = srP * vpr - siP * vpi + c * vqr
          vIm[qo + r] = srP * vpi + siP * vpr + c * vqi
        }
      }
    }
  }

  const rawVals = new Float64Array(n)
  for (let i = 0; i < n; i++) rawVals[i] = aRe[i * n + i]!
  const ord = Array.from({ length: n }, (_, i) => i).sort((i, j) => rawVals[i]! - rawVals[j]!)
  const values = new Float64Array(n)
  const vecRe = new Float64Array(n * n)
  const vecIm = new Float64Array(n * n)
  ord.forEach((from, to) => {
    values[to] = rawVals[from]!
    vecRe.set(vRe.subarray(from * n, from * n + n), to * n)
    vecIm.set(vIm.subarray(from * n, from * n + n), to * n)
  })
  return { values, vecRe, vecIm }
}

// Exact unitary spectrum via commuting Hermitian decomposition U = A + i B:
//   A = (U + U^dag)/2, B = (U - U^dag)/(2i), [A, B] = 0.
function unitarySpectrum(U: CMat): {
  quasi: Float64Array
  vecRe: Float64Array
  vecIm: Float64Array
  maxRes: number
  maxUnitErr: number
} {
  const n = U.n
  const uRe = U.re
  const uIm = U.im
  const maxUnitErr = cmatUnitaryErr(U)

  const aRe = new Float64Array(n * n)
  const aIm = new Float64Array(n * n)
  const bRe = new Float64Array(n * n)
  const bIm = new Float64Array(n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ur = uRe[i * n + j]!
      const ui = uIm[i * n + j]!
      const vr = uRe[j * n + i]!
      const vi = uIm[j * n + i]!
      aRe[i * n + j] = 0.5 * (ur + vr)
      aIm[i * n + j] = 0.5 * (ui - vi)
      bRe[i * n + j] = 0.5 * (ui + vi)
      bIm[i * n + j] = -0.5 * (ur - vr)
    }
  }

  const eigA = hermitianJacobi(n, aRe, aIm)
  const vecRe = Float64Array.from(eigA.vecRe)
  const vecIm = Float64Array.from(eigA.vecIm)

  // Refine degenerate eigenspaces of A using B
  let start = 0
  while (start < n) {
    let end = start + 1
    while (end < n && Math.abs(eigA.values[end]! - eigA.values[start]!) <= 1e-5) end++
    const sz = end - start
    if (sz > 1) {
      const bvRe = new Float64Array(sz * n)
      const bvIm = new Float64Array(sz * n)
      for (let b = 0; b < sz; b++) {
        const vo = (start + b) * n
        for (let r = 0; r < n; r++) {
          let sr = 0
          let si = 0
          for (let c = 0; c < n; c++) {
            sr += bRe[r * n + c]! * vecRe[vo + c]! - bIm[r * n + c]! * vecIm[vo + c]!
            si += bRe[r * n + c]! * vecIm[vo + c]! + bIm[r * n + c]! * vecRe[vo + c]!
          }
          bvRe[b * n + r] = sr
          bvIm[b * n + r] = si
        }
      }
      const subRe = new Float64Array(sz * sz)
      const subIm = new Float64Array(sz * sz)
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
      const subEig = hermitianJacobi(sz, subRe, subIm)
      const rotRe = new Float64Array(sz * n)
      const rotIm = new Float64Array(sz * n)
      for (let k = 0; k < sz; k++) {
        for (let r = 0; r < n; r++) {
          let sr = 0
          let si = 0
          for (let a = 0; a < sz; a++) {
            const cr = subEig.vecRe[k * sz + a]!
            const ci = subEig.vecIm[k * sz + a]!
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

  const rawQ = new Float64Array(n)
  let maxRes = 0
  for (let i = 0; i < n; i++) {
    const o = i * n
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
    rawQ[i] = Math.atan2(li, lr)
    let r2 = 0
    for (let r = 0; r < n; r++) {
      const dr = uvR[r]! - (lr * vecRe[o + r]! - li * vecIm[o + r]!)
      const di = uvI[r]! - (lr * vecIm[o + r]! + li * vecRe[o + r]!)
      r2 += dr * dr + di * di
    }
    maxRes = Math.max(maxRes, Math.sqrt(r2))
  }

  const ord = Array.from({ length: n }, (_, i) => i).sort((i, j) => rawQ[i]! - rawQ[j]!)
  const quasi = new Float64Array(n)
  const outVR = new Float64Array(n * n)
  const outVI = new Float64Array(n * n)
  ord.forEach((from, to) => {
    quasi[to] = rawQ[from]!
    outVR.set(vecRe.subarray(from * n, from * n + n), to * n)
    outVI.set(vecIm.subarray(from * n, from * n + n), to * n)
  })
  return { quasi, vecRe: outVR, vecIm: outVI, maxRes, maxUnitErr }
}

// Fast 2x2 complex matrix helpers (for BT4 & winding checks in G1 and G3)
type C2 = {
  readonly a00r: number; readonly a00i: number; readonly a01r: number; readonly a01i: number
  readonly a10r: number; readonly a10i: number; readonly a11r: number; readonly a11i: number
}

const mul2 = (x: C2, y: C2): C2 => ({
  a00r: x.a00r * y.a00r - x.a00i * y.a00i + x.a01r * y.a10r - x.a01i * y.a10i,
  a00i: x.a00r * y.a00i + x.a00i * y.a00r + x.a01r * y.a10i + x.a01i * y.a10r,
  a01r: x.a00r * y.a01r - x.a00i * y.a01i + x.a01r * y.a11r - x.a01i * y.a11i,
  a01i: x.a00r * y.a01i + x.a00i * y.a01r + x.a01r * y.a11i + x.a01i * y.a11r,
  a10r: x.a10r * y.a00r - x.a10i * y.a00i + x.a11r * y.a10r - x.a11i * y.a10i,
  a10i: x.a10r * y.a00i + x.a10i * y.a00r + x.a11r * y.a10i + x.a11i * y.a10r,
  a11r: x.a10r * y.a01r - x.a10i * y.a01i + x.a11r * y.a11r - x.a11i * y.a11i,
  a11i: x.a10r * y.a01i + x.a10i * y.a01r + x.a11r * y.a11i + x.a11i * y.a11r,
})

const dag2 = (x: C2): C2 => ({
  a00r: x.a00r, a00i: -x.a00i, a01r: x.a10r, a01i: -x.a10i,
  a10r: x.a01r, a10i: -x.a01i, a11r: x.a11r, a11i: -x.a11i,
})

const eqCoin2 = (step: number, phiStep: number): C2 => {
  const th = (step * PI) / 9
  const ph = (phiStep * PI) / 9
  const c = Math.cos(th)
  const s = Math.sin(th)
  return {
    a00r: c, a00i: 0,
    a01r: -s * Math.sin(ph), a01i: -s * Math.cos(ph),
    a10r: s * Math.sin(ph), a10i: -s * Math.cos(ph),
    a11r: c, a11i: 0,
  }
}

const shiftConj2 = (K: C2, k: number): C2 => {
  const ck = Math.cos(k)
  const sk = Math.sin(k)
  return {
    a00r: K.a00r, a00i: K.a00i,
    a01r: K.a01r * ck + K.a01i * sk, a01i: K.a01i * ck - K.a01r * sk,
    a10r: K.a10r * ck - K.a10i * sk, a10i: K.a10i * ck + K.a10r * sk,
    a11r: K.a11r, a11i: K.a11i,
  }
}

const TRIM_LIST: readonly (readonly [string, number, number, number])[] = [
  ['Gamma', 0, 0, 0],
  ['X', PI, 0, 0],
  ['Y', 0, PI, 0],
  ['Z', 0, 0, PI],
  ['XY', PI, PI, 0],
  ['XZ', PI, 0, PI],
  ['YZ', 0, PI, PI],
  ['R', PI, PI, PI],
]

// ============================================================================
// PART G1: 24 = 8 + 8 + 8 THREE 16-CELL NEGATIVE CONTROL (O_h / W(F_4))
// ============================================================================

function runG1(): void {
  console.log('========================================================================')
  console.log('G1: 24 = 8 + 8 + 8 THREE 16-CELL NEGATIVE CONTROL (W(F_4) / O_h AUDIT)')
  console.log('========================================================================')

  type Root4 = readonly [bigint, bigint, bigint, bigint]
  type Mat4 = readonly (readonly [bigint, bigint, bigint, bigint])[]

  // 24 long D_4 roots partitioned into 3 disjoint 8-slot inscribed 16-cells (F_0, F_1, F_2)
  const roots: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1n, -1n] as const) {
        for (const sj of [1n, -1n] as const) {
          const c: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]
          c[i] = si
          c[j] = sj
          roots.push(c)
        }
      }
    }
  }
  assert(roots.length === 24, 'Expected 24 D_4 roots')

  const frameOfSlot: number[] = roots.map(r => {
    const nz: number[] = []
    for (let i = 0; i < 4; i++) if (r[i] !== 0n) nz.push(i)
    const a = nz[0]!
    const b = nz[1]!
    if ((a === 0 && b === 1) || (a === 2 && b === 3)) return 0
    if ((a === 0 && b === 2) || (a === 1 && b === 3)) return 1
    return 2
  })
  const frames: number[][] = [0, 1, 2].map(f => roots.map((_, s) => s).filter(s => frameOfSlot[s] === f))
  assert(frames.every(fr => fr.length === 8), '24 roots must split as 8 + 8 + 8')

  // 24 doubled short F_4 roots = 8_v + 8_s + 8_c
  const shortRoots2: { v: Root4; rep: 0 | 1 | 2 }[] = []
  for (let i = 0; i < 4; i++) {
    for (const s of [2n, -2n] as const) {
      const c: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]
      c[i] = s
      shortRoots2.push({ v: c, rep: 0 })
    }
  }
  for (let mask = 0; mask < 16; mask++) {
    let negs = 0
    const c: [bigint, bigint, bigint, bigint] = [1n, 1n, 1n, 1n]
    for (let i = 0; i < 4; i++) {
      if ((mask >> i) & 1) {
        c[i] = -1n
        negs++
      }
    }
    shortRoots2.push({ v: c, rep: negs % 2 === 0 ? 1 : 2 })
  }
  const vCusp: Root4 = [2n, 0n, 0n, 0n] // Representative cusp ideal vertex in 8_v
  const dot4 = (a: Root4, b: Root4): bigint => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
  const lateralSlots = roots.map((_, s) => s).filter(s => dot4(vCusp, roots[s]!) === 2n)
  const lateralPerFrame = [0, 0, 0]
  for (const s of lateralSlots) {
    const f = frameOfSlot[s]!
    lateralPerFrame[f] = lateralPerFrame[f]! + 1
  }
  assert(
    lateralSlots.length === 6 && lateralPerFrame[0] === 2 && lateralPerFrame[1] === 2 && lateralPerFrame[2] === 2,
    '6 lateral cusp slots must split 2 + 2 + 2 across F_0, F_1, F_2',
  )

  // Exact BigInt generation of W(F_4) (1152 elements) in doubled 4x4 matrices 2*M
  const mat4Mul2 = (A: Mat4, B: Mat4): Mat4 =>
    [0, 1, 2, 3].map(r =>
      [0, 1, 2, 3].map(c => {
        let s = 0n
        for (let k = 0; k < 4; k++) s += A[r]![k]! * B[k]![c]!
        return s / 2n
      }) as [bigint, bigint, bigint, bigint],
    )
  const mat4Key = (A: Mat4): string => A.map(r => r.join(',')).join(';')
  const mat4Vec2 = (A: Mat4, v: Root4): Root4 =>
    [0, 1, 2, 3].map(
      r => (A[r]![0] * v[0] + A[r]![1] * v[1] + A[r]![2] * v[2] + A[r]![3] * v[3]) / 2n,
    ) as [bigint, bigint, bigint, bigint]
  const mat4Det16 = (A: Mat4): bigint => {
    const det3 = (m: readonly (readonly bigint[])[]): bigint =>
      m[0]![0]! * (m[1]![1]! * m[2]![2]! - m[1]![2]! * m[2]![1]!) -
      m[0]![1]! * (m[1]![0]! * m[2]![2]! - m[1]![2]! * m[2]![0]!) +
      m[0]![2]! * (m[1]![0]! * m[2]![1]! - m[1]![1]! * m[2]![0]!)
    let d = 0n
    for (let c = 0; c < 4; c++) {
      const sub = [1, 2, 3].map(r => [0, 1, 2, 3].filter(j => j !== c).map(j => A[r]![j]!))
      d += (c % 2 === 0 ? 1n : -1n) * A[0]![c]! * det3(sub)
    }
    return d
  }

  const EYE4_2: Mat4 = [
    [2n, 0n, 0n, 0n],
    [0n, 2n, 0n, 0n],
    [0n, 0n, 2n, 0n],
    [0n, 0n, 0n, 2n],
  ]
  const wf4Gens: Mat4[] = [
    [[0n, 2n, 0n, 0n], [2n, 0n, 0n, 0n], [0n, 0n, 2n, 0n], [0n, 0n, 0n, 2n]],
    [[2n, 0n, 0n, 0n], [0n, 0n, 2n, 0n], [0n, 2n, 0n, 0n], [0n, 0n, 0n, 2n]],
    [[2n, 0n, 0n, 0n], [0n, 2n, 0n, 0n], [0n, 0n, 0n, 2n], [0n, 0n, 2n, 0n]],
    [[2n, 0n, 0n, 0n], [0n, 2n, 0n, 0n], [0n, 0n, 2n, 0n], [0n, 0n, 0n, -2n]],
    [[1n, 1n, 1n, 1n], [1n, -1n, 1n, -1n], [1n, 1n, -1n, -1n], [1n, -1n, -1n, 1n]],
  ]
  const wf4: Mat4[] = [EYE4_2]
  const seenW = new Set<string>([mat4Key(EYE4_2)])
  for (let i = 0; i < wf4.length; i++) {
    const cur = wf4[i]!
    for (const g of wf4Gens) {
      const nx = mat4Mul2(g, cur)
      const k = mat4Key(nx)
      if (!seenW.has(k)) {
        seenW.add(k)
        wf4.push(nx)
      }
    }
  }
  assert(wf4.length === 1152, `Expected |W(F_4)| = 1152, got ${wf4.length}`)

  const shortMap = new Map<string, 0 | 1 | 2>()
  for (const sr of shortRoots2) shortMap.set(sr.v.join(','), sr.rep)
  const rootMap = new Map<string, number>()
  for (let s = 0; s < 24; s++) rootMap.set(roots[s]!.join(','), s)

  const shortPerm = (g: Mat4): [number, number, number] => {
    const reps: [number, number, number] = [0, 0, 0]
    for (const rep of [0, 1, 2] as const) {
      const sample = shortRoots2.find(sr => sr.rep === rep)!
      reps[rep] = shortMap.get(mat4Vec2(g, sample.v).join(','))!
    }
    return reps
  }
  const framePerm = (g: Mat4): [number, number, number] => {
    const out: [number, number, number] = [0, 0, 0]
    for (let f = 0; f < 3; f++) {
      const sample = roots[frames[f]![0]!]!
      const img = rootMap.get(mat4Vec2(g, sample).join(','))!
      out[f] = frameOfSlot[img]!
    }
    return out
  }
  const is3Cycle = (p: [number, number, number]): boolean =>
    p[0] !== 0 && p[1] !== 1 && p[2] !== 2 && p[0] !== p[1] && p[1] !== p[2] && p[0] !== p[2]

  const stabElements: Mat4[] = []
  let globalOuterTrialityAll = 0
  let globalProperOuterTriality = 0
  let stabOuterTriality = 0
  let stabInnerFrame3Cycles = 0

  for (const g of wf4) {
    const sp = shortPerm(g)
    const fp = framePerm(g)
    const g3 = mat4Mul2(mat4Mul2(g, g), g)
    const order3 = mat4Key(g) !== mat4Key(EYE4_2) && mat4Key(g3) === mat4Key(EYE4_2)
    const proper = mat4Det16(g) === 16n
    if (is3Cycle(sp)) globalOuterTrialityAll++
    if (order3 && proper && is3Cycle(sp) && is3Cycle(fp)) globalProperOuterTriality++
    const img = mat4Vec2(g, vCusp)
    if (img[0] === vCusp[0] && img[1] === vCusp[1] && img[2] === vCusp[2] && img[3] === vCusp[3]) {
      stabElements.push(g)
      if (is3Cycle(sp)) stabOuterTriality++
      if (order3 && proper && is3Cycle(fp)) stabInnerFrame3Cycles++
    }
  }
  assert(stabElements.length === 48, `Expected |Stab(v_cusp)| = 48 (O_h), got ${stabElements.length}`)
  assert(globalOuterTrialityAll === 384, `Expected 384 outer triality coset elements in W(F_4), got ${globalOuterTrialityAll}`)
  assert(globalProperOuterTriality === 16, `Expected 16 proper order-3 outer+frame triality elements in W(F_4), got ${globalProperOuterTriality}`)
  assert(stabOuterTriality === 0, `Expected 0 outer triality elements in Stab(v_cusp), got ${stabOuterTriality}`)
  assert(stabInnerFrame3Cycles === 8, `Expected 8 proper inner 3-cycles (8 C_3) in O_h, got ${stabInnerFrame3Cycles}`)

  // Compute exact conjugacy classes of Stab(v_cusp) = O_h directly by conjugation h g h^{-1}
  const stabIdx = new Map<string, number>()
  stabElements.forEach((g, i) => stabIdx.set(mat4Key(g), i))
  const stabInv: number[] = stabElements.map(g => {
    // Orthogonal matrix: M^{-1} = M^T
    const tr: Mat4 = [0, 1, 2, 3].map(r => [g[0]![r]!, g[1]![r]!, g[2]![r]!, g[3]![r]!] as const)
    const idx = stabIdx.get(mat4Key(tr))
    assert(idx !== undefined, 'Inverse missing in O_h')
    return idx
  })

  const classIdOf = new Int32Array(48).fill(-1)
  const classes: { members: number[]; name: string; det: number; tr3: number; ord: number; chiFrame: number }[] = []

  const mat3Order = (g: Mat4): number => {
    let cur = g
    for (let k = 1; k <= 6; k++) {
      if (mat4Key(cur) === mat4Key(EYE4_2)) return k
      cur = mat4Mul2(cur, g)
    }
    throw new Error('Unexpected element order > 6 in O_h')
  }

  for (let i = 0; i < 48; i++) {
    if (classIdOf[i] !== -1) continue
    const cid = classes.length
    const members = new Set<number>()
    const g = stabElements[i]!
    for (let hIdx = 0; hIdx < 48; hIdx++) {
      const h = stabElements[hIdx]!
      const hInv = stabElements[stabInv[hIdx]!]!
      const conj = mat4Mul2(mat4Mul2(h, g), hInv)
      const cIdx = stabIdx.get(mat4Key(conj))
      assert(cIdx !== undefined, 'Conjugate missing in O_h')
      members.add(cIdx)
    }
    for (const m of members) classIdOf[m] = cid
    const det = Number(mat4Det16(g) / 16n)
    const tr3 = Number((g[1]![1] + g[2]![2] + g[3]![3]) / 2n)
    const ord = mat3Order(g)
    const fp = framePerm(g)
    const chiFrame = (fp[0] === 0 ? 1 : 0) + (fp[1] === 1 ? 1 : 0) + (fp[2] === 2 ? 1 : 0)
    // Verify chiFrame is class-invariant
    for (const m of members) {
      const fpm = framePerm(stabElements[m]!)
      const cm = (fpm[0] === 0 ? 1 : 0) + (fpm[1] === 1 ? 1 : 0) + (fpm[2] === 2 ? 1 : 0)
      assert(cm === chiFrame, 'chiFrame must be constant on conjugacy class')
    }
    let name = '?'
    if (det === 1 && ord === 1) name = 'E'
    else if (det === 1 && ord === 3) name = '8C3'
    else if (det === 1 && ord === 4) name = '6C4'
    else if (det === 1 && ord === 2 && chiFrame === 3) name = '3C2'
    else if (det === 1 && ord === 2 && chiFrame === 1) name = "6C2'"
    else if (det === -1 && tr3 === -3) name = 'i'
    else if (det === -1 && ord === 6) name = '8S6'
    else if (det === -1 && ord === 4) name = '6S4'
    else if (det === -1 && ord === 2 && chiFrame === 3) name = '3sh'
    else if (det === -1 && ord === 2 && chiFrame === 1) name = '6sd'
    classes.push({ members: [...members], name, det, tr3, ord, chiFrame })
  }
  assert(classes.length === 10, `Expected exactly 10 conjugacy classes in O_h, got ${classes.length}`)

  // Canonical class order for exact O_h character table
  const CLASS_ORDER = ['E', '8C3', "6C2'", '6C4', '3C2', 'i', '8S6', '6sd', '6S4', '3sh'] as const
  const EXPECTED_SIZES = [1, 8, 6, 6, 3, 1, 8, 6, 6, 3] as const
  const orderedClasses = CLASS_ORDER.map((nm, idx) => {
    const found = classes.find(c => c.name === nm)
    assert(found !== undefined, `Missing O_h conjugacy class ${nm}`)
    assert(found.members.length === EXPECTED_SIZES[idx], `Class ${nm} size mismatch`)
    return found
  })

  // Complete 10 x 10 irreducible character table of O_h
  const OH_IRREPS: readonly { readonly name: string; readonly chi: readonly number[] }[] = [
    { name: 'A1g', chi: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { name: 'A2g', chi: [1, 1, -1, -1, 1, 1, 1, -1, -1, 1] },
    { name: 'Eg',  chi: [2, -1, 0, 0, 2, 2, -1, 0, 0, 2] },
    { name: 'T1g', chi: [3, 0, -1, 1, -1, 3, 0, -1, 1, -1] },
    { name: 'T2g', chi: [3, 0, 1, -1, -1, 3, 0, 1, -1, -1] },
    { name: 'A1u', chi: [1, 1, 1, 1, 1, -1, -1, -1, -1, -1] },
    { name: 'A2u', chi: [1, 1, -1, -1, 1, -1, -1, 1, 1, -1] },
    { name: 'Eu',  chi: [2, -1, 0, 0, 2, -2, 1, 0, 0, -2] },
    { name: 'T1u', chi: [3, 0, -1, 1, -1, -3, 0, 1, -1, 1] },
    { name: 'T2u', chi: [3, 0, 1, -1, -1, -3, 0, -1, 1, 1] },
  ]

  // Verify exact character table row orthogonality: sum_c |C_c| chi_a(c) chi_b(c) == 48 delta_ab
  for (let a = 0; a < 10; a++) {
    for (let b = 0; b < 10; b++) {
      let sum = 0
      for (let c = 0; c < 10; c++) {
        sum += orderedClasses[c]!.members.length * OH_IRREPS[a]!.chi[c]! * OH_IRREPS[b]!.chi[c]!
      }
      assert(sum === (a === b ? 48 : 0), `O_h character orthogonality failed for (${a},${b}): ${sum}`)
    }
  }

  // Exact decomposition of chi_frame on {F_0, F_1, F_2}
  const chiFrameVec = orderedClasses.map(c => c.chiFrame)
  let chiFrameNormNum = 0
  for (let c = 0; c < 10; c++) {
    chiFrameNormNum += orderedClasses[c]!.members.length * chiFrameVec[c]! * chiFrameVec[c]!
  }
  assert(chiFrameNormNum % 48 === 0 && chiFrameNormNum / 48 === 2, `Expected ||chi_frame||^2 = 2, got ${chiFrameNormNum / 48}`)

  const mults = new Map<string, number>()
  for (const ir of OH_IRREPS) {
    let ip = 0
    for (let c = 0; c < 10; c++) {
      ip += orderedClasses[c]!.members.length * chiFrameVec[c]! * ir.chi[c]!
    }
    assert(ip % 48 === 0, `Non-integer irrep multiplicity for ${ir.name}`)
    mults.set(ir.name, ip / 48)
  }
  const decompStr = OH_IRREPS.filter(ir => (mults.get(ir.name) ?? 0) > 0)
    .map(ir => `${mults.get(ir.name) === 1 ? '' : `${mults.get(ir.name)}*`}${ir.name}`)
    .join(' + ')
  assert(mults.get('A1g') === 1 && mults.get('Eg') === 1, `Expected A1g + Eg, got ${decompStr}`)
  for (const ir of OH_IRREPS) {
    if (ir.name !== 'A1g' && ir.name !== 'Eg') {
      assert(mults.get(ir.name) === 0, `Unexpected nonzero multiplicity in ${ir.name}`)
    }
  }

  // Explicit A4 inter-frame coupled bond B_6 = sum_{q=0}^2 P_q (x) V_2^(q)
  const Ksmall = mul2(eqCoin2(1, 1), mul2(eqCoin2(-2, 0), eqCoin2(1, 1)))
  const V2_0 = Ksmall
  const V2_1 = eqCoin2(1, 5)
  const V2_2 = mul2(eqCoin2(1, 1), mul2(eqCoin2(-1, 0), eqCoin2(1, 1)))
  const V2_LIST: readonly C2[] = [V2_0, V2_1, V2_2]

  const buildTrialityP = (q: number): C[][] => {
    const omInv = q === 0 ? C_ONE : q === 1 ? C_W2 : C_W
    const omInv2 = cMul(omInv, omInv)
    const P: C[][] = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => C_ZERO))
    for (let i = 0; i < 3; i++) {
      P[i]![i] = cScale(1 / 3, C_ONE)
      P[(i + 1) % 3]![i] = cScale(1 / 3, omInv)
      P[(i + 2) % 3]![i] = cScale(1 / 3, omInv2)
    }
    return P
  }

  const B6 = cmatZero(6)
  for (let q = 0; q < 3; q++) {
    const Pq = buildTrialityP(q)
    const v = V2_LIST[q]!
    const ent: [[C, C], [C, C]] = [
      [[v.a00r, v.a00i], [v.a01r, v.a01i]],
      [[v.a10r, v.a10i], [v.a11r, v.a11i]],
    ]
    for (let f1 = 0; f1 < 3; f1++) {
      for (let f2 = 0; f2 < 3; f2++) {
        const p = Pq[f1]![f2]!
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 2; c++) {
            const val = cMul(p, ent[r]![c]!)
            const rr = 2 * f1 + r
            const cc = 2 * f2 + c
            B6.re[rr * 6 + cc] = B6.re[rr * 6 + cc]! + val[0]
            B6.im[rr * 6 + cc] = B6.im[rr * 6 + cc]! + val[1]
          }
        }
      }
    }
  }
  const b6UnitErr = cmatUnitaryErr(B6)
  assert(b6UnitErr < 1e-13, `B6 not unitary: err=${b6UnitErr}`)

  // Test 90-degree cubic spatial rotation R_90 in O_h (x -> y, y -> -x, z -> z) which swaps F_0 <-> F_1!
  const R90_6 = cmatZero(6)
  const swap01 = [1, 0, 2] as const
  for (let f = 0; f < 3; f++) {
    const dst = swap01[f]!
    for (let r = 0; r < 2; r++) {
      R90_6.re[(2 * dst + r) * 6 + (2 * f + r)] = 1
    }
  }
  const commR90B6 = cmatSub(cmatMul(R90_6, B6), cmatMul(B6, R90_6))
  const commR90Frob = cmatFrob(commR90B6)
  const commR90Max = cmatMaxAbs(commR90B6)

  // Count how many of the 48 elements of O_h commute with B_6 vs break it
  let ohCommutingWithB6 = 0
  let ohBreakingB6 = 0
  for (const g of stabElements) {
    const fp = framePerm(g)
    const Rg = cmatZero(6)
    for (let f = 0; f < 3; f++) {
      for (let r = 0; r < 2; r++) Rg.re[(2 * fp[f]! + r) * 6 + (2 * f + r)] = 1
    }
    const err = cmatFrob(cmatSub(cmatMul(Rg, B6), cmatMul(B6, Rg)))
    if (err < 1e-12) ohCommutingWithB6++
    else ohBreakingB6++
  }

  // Constant 3x3 DFT F_3 (x) I_2 decouples B_6 exactly into diag(V_2^(0), V_2^(1), V_2^(2))
  const F3_6 = cmatZero(6)
  const invS3 = 1 / SQRT3
  for (let q = 0; q < 3; q++) {
    for (let f = 0; f < 3; f++) {
      const ph = cExpI((-2 * PI * q * f) / 3)
      for (let r = 0; r < 2; r++) {
        F3_6.re[(2 * q + r) * 6 + (2 * f + r)] = invS3 * ph[0]
        F3_6.im[(2 * q + r) * 6 + (2 * f + r)] = invS3 * ph[1]
      }
    }
  }
  const B6Diag = cmatMul(F3_6, cmatMul(B6, cmatDag(F3_6)))
  let maxOffBlockAfterDFT = 0
  for (let q1 = 0; q1 < 3; q1++) {
    for (let q2 = 0; q2 < 3; q2++) {
      if (q1 === q2) continue
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          const idx = (2 * q1 + r) * 6 + (2 * q2 + c)
          maxOffBlockAfterDFT = Math.max(maxOffBlockAfterDFT, Math.hypot(B6Diag.re[idx]!, B6Diag.im[idx]!))
        }
      }
    }
  }

  // Bare untwisted 24-slot bulk Bloch symbol winding check (R_VOL = 6034/330, C(b) = P_+ + omega (I - P_+))
  const rVol = 6034 / 330
  const invB = 1 / (1 + rVol)
  const sb = Math.sqrt(rVol)
  const cuu = cScale(invB, cAdd(C_ONE, cScale(rVol, C_W)))
  const cdd = cScale(invB, cAdd([rVol, 0], C_W))
  const cud = cScale(sb * invB, cSub(C_ONE, C_W))
  let barePrevPh = 0
  let bareTotPh = 0
  const WIND_N = 128
  for (let i = 0; i <= WIND_N; i++) {
    const q = (i / WIND_N) * 2 * PI - PI
    const ep = cExpI(q)
    const em = cExpI(-q)
    // All 12 antipodal lines in bare untwisted U_24 decouple identically: det(U_24) = det(U_2)^12
    const U2 = cmatZero(2)
    // U2 = S_edge(q) * C(b), S_edge = [[0, e^{-iq}], [e^{+iq}, 0]]
    const e00 = cMul(em, cud)
    const e01 = cMul(em, cdd)
    const e10 = cMul(ep, cuu)
    const e11 = cMul(ep, cud)
    U2.re[0] = e00[0]; U2.im[0] = e00[1]
    U2.re[1] = e01[0]; U2.im[1] = e01[1]
    U2.re[2] = e10[0]; U2.im[2] = e10[1]
    U2.re[3] = e11[0]; U2.im[3] = e11[1]
    const d2 = complexDet(U2)
    // Raise to 12th power for 24-slot symbol
    let d24: C = C_ONE
    for (let k = 0; k < 12; k++) d24 = cMul(d24, d2)
    const ph = cArg(d24)
    if (i > 0) bareTotPh += wrapDiff(ph, barePrevPh)
    barePrevPh = ph
  }
  const bareBulkWind = Math.round(bareTotPh / (2 * PI))

  console.log(`  |W(F_4)| = ${wf4.length}, |Stab(v_cusp)| = ${stabElements.length} (exact O_h), 6 lateral slots = [${lateralPerFrame.join('+')}]`)
  console.log(`  Outer D_4 triality: ${globalOuterTrialityAll} coset elems (${globalProperOuterTriality} order-3 proper dual) in W(F_4) -> ${stabOuterTriality} in Stab(v_cusp) (Cusp-Triality Breaking!)`)
  console.log(`  O_h character vector on {F_0,F_1,F_2}: [${chiFrameVec.join(', ')}] across [${CLASS_ORDER.join(', ')}]`)
  console.log(`  Exact O_h decomposition: 3_frame = ${decompStr} (||chi_frame||^2 = ${chiFrameNormNum / 48}, NOT 3*A1g!)`)
  console.log(`  A4 B_6 90 deg O_h isotropy violation: ||[R_90, B_6]||_F = ${commR90Frob.toFixed(6)} (maxEntry=${commR90Max.toFixed(6)}), O_h broken=${ohBreakingB6}/48`)
  console.log(`  Constant DFT decoupling max off-block = ${maxOffBlockAfterDFT.toExponential(2)}; bare 24-slot bulk winding = ${bareBulkWind}`)

  recordCheck(
    'G1.1',
    'W(F_4) & Stab(v_cusp)=O_h exact orders + Cusp-Triality Breaking (0 outer triality)',
    wf4.length === 1152 && stabElements.length === 48 && stabOuterTriality === 0 && stabInnerFrame3Cycles === 8,
    `|W(F_4)|=${wf4.length}, |O_h|=${stabElements.length}, outerInStab=${stabOuterTriality}, inner3Cycles=${stabInnerFrame3Cycles}`,
  )
  recordCheck(
    'G1.2',
    'Exact 10-class O_h character decomposition: 3_frame = A1g (+) Eg (anisotropic, NOT 3*A1g)',
    decompStr === 'A1g + Eg' && chiFrameNormNum / 48 === 2 && mults.get('A1g') === 1 && mults.get('Eg') === 1,
    `3_frame=${decompStr}, ||chi||^2=${chiFrameNormNum / 48}`,
  )
  recordCheck(
    'G1.3',
    'A4 frame-split bond B_6 breaks O_h 90-deg isotropy (||[R_90, B_6]|| > 0.1) & DFT-decouples',
    b6UnitErr < 1e-13 && commR90Frob > 0.1 && ohBreakingB6 === 24 && maxOffBlockAfterDFT < 1e-14 && bareBulkWind === 0,
    `||[R_90,B_6]||_F=${commR90Frob.toFixed(5)}, broken=${ohBreakingB6}/48, dftOffBlock=${maxOffBlockAfterDFT.toExponential(1)}, bareWind=${bareBulkWind}`,
  )
}

// ============================================================================
// PART G2: 9 = 3 x 3 QUTRIT GRID / ASL(2,3) NEGATIVE CONTROL
// ============================================================================

function runG2(): void {
  console.log('\n========================================================================')
  console.log('G2: 9 = 3 x 3 QUTRIT GRID / ASL(2,3) & SIGMA(648) NEGATIVE CONTROL')
  console.log('========================================================================')

  // Build SL(2, 3) (all 2x2 matrices over F_3 with ad - bc === 1 mod 3)
  type Mat2F3 = readonly [number, number, number, number]
  const sl23: Mat2F3[] = []
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      for (let c = 0; c < 3; c++) {
        for (let d = 0; d < 3; d++) {
          if ((((a * d - b * c) % 3) + 3) % 3 === 1) sl23.push([a, b, c, d])
        }
      }
    }
  }
  assert(sl23.length === 24, `Expected |SL(2,3)| = 24, got ${sl23.length}`)

  // Build all 216 elements of ASL(2,3) = SL(2,3) (x|) Z_3^2 acting on p = 3*r + t in {0..8}
  const aslPerms: Uint8Array[] = []
  const aslSet = new Set<string>()
  for (const [a, b, c, d] of sl23) {
    for (let vr = 0; vr < 3; vr++) {
      for (let vt = 0; vt < 3; vt++) {
        const perm = new Uint8Array(9)
        for (let r = 0; r < 3; r++) {
          for (let t = 0; t < 3; t++) {
            const nr = (a * r + b * t + vr) % 3
            const nt = (c * r + d * t + vt) % 3
            perm[3 * r + t] = 3 * nr + nt
          }
        }
        const key = Array.from(perm).join('')
        assert(!aslSet.has(key), `Duplicate permutation in ASL(2,3): ${key}`)
        aslSet.add(key)
        aslPerms.push(perm)
      }
    }
  }
  assert(aslPerms.length === 216, `Expected |ASL(2,3)| = 216, got ${aslPerms.length}`)

  // Verify group closure under composition
  for (let i = 0; i < 216; i += 9) {
    const p1 = aslPerms[i]!
    for (let j = 0; j < 216; j++) {
      const p2 = aslPerms[j]!
      const comp = new Uint8Array(9)
      for (let x = 0; x < 9; x++) comp[x] = p1[p2[x]!]!
      assert(aslSet.has(Array.from(comp).join('')), 'ASL(2,3) closure failure')
    }
  }

  // Exact 2-transitivity check on all 9 * 8 = 72 ordered distinct pairs (p, q)
  const hitPair = new Uint8Array(81)
  const pairCounts = new Int32Array(81)
  for (const perm of aslPerms) {
    const idx = perm[0]! * 9 + perm[1]!
    hitPair[idx] = 1
    pairCounts[idx] = pairCounts[idx]! + 1
  }
  let distinctPairsHit = 0
  let uniformStab = true
  for (let p = 0; p < 9; p++) {
    for (let q = 0; q < 9; q++) {
      if (p === q) continue
      if (hitPair[p * 9 + q] === 1) distinctPairsHit++
      if (pairCounts[p * 9 + q] !== 3) uniformStab = false
    }
  }
  assert(distinctPairsHit === 72 && uniformStab, `2-transitivity failed: hit=${distinctPairsHit}/72`)

  // Burnside / Frobenius character norm of permutation representation pi_9: C^9 = 1 (+) 8
  let sumFix = 0
  let sumFixSq = 0
  for (const perm of aslPerms) {
    let fix = 0
    for (let x = 0; x < 9; x++) if (perm[x] === x) fix++
    sumFix += fix
    sumFixSq += fix * fix
  }
  assert(sumFix === 216, `Expected <chi_9, 1> = 1, got ${sumFix / 216}`)
  assert(sumFixSq === 432, `Expected <chi_9, chi_9> = 2, got ${sumFixSq / 216}`)
  const multTrivial = sumFix / 216 // 1
  const normSqPi9 = sumFixSq / 216 // 2 => chi_8 = chi_9 - 1 has <chi_8, chi_8> = 1 (STRICTLY IRREDUCIBLE!)

  // Primitivity test: none of the 4 parallel 3-line foliations of Z_3^2 is ASL(2,3)-invariant
  // Lines: (0) r=const, (1) t=const, (2) r+t=const, (3) r-t=const
  const foliationKey = (blocks: number[][]): string =>
    blocks.map(b => b.slice().sort((x, y) => x - y).join(',')).sort().join('|')
  const foliations: number[][][] = [
    [[0, 1, 2], [3, 4, 5], [6, 7, 8]], // r = 0, 1, 2 (role)
    [[0, 3, 6], [1, 4, 7], [2, 5, 8]], // t = 0, 1, 2 (tilt)
    [[0, 5, 7], [1, 3, 8], [2, 4, 6]], // r + t = 0, 1, 2
    [[0, 4, 8], [1, 5, 6], [2, 3, 7]], // r - t = 0, 1, 2
  ]
  const folKeys = new Set(foliations.map(foliationKey))
  let invariantFoliations = 0
  const roleOrbit = new Set<string>()
  for (let f = 0; f < foliations.length; f++) {
    const baseKey = foliationKey(foliations[f]!)
    let inv = true
    for (const perm of aslPerms) {
      const img = foliations[f]!.map(blk => blk.map(x => perm[x]!))
      const k = foliationKey(img)
      if (f === 0) roleOrbit.add(k)
      if (k !== baseKey) inv = false
    }
    if (inv) invariantFoliations++
  }
  assert(invariantFoliations === 0, `Expected 0 ASL(2,3)-invariant 3-block partitions, got ${invariantFoliations}`)
  assert(roleOrbit.size === 4 && [...roleOrbit].every(k => folKeys.has(k)), 'ASL(2,3) must act transitively on all 4 foliations')

  // Build exact 3x3 generators of Sigma(648) < SU(3): CLOCK3, SHIFT3, HESS_V, NINTH
  const CLOCK3 = cmatZero(3)
  CLOCK3.re[0] = 1
  CLOCK3.re[4] = C_W[0]; CLOCK3.im[4] = C_W[1]
  CLOCK3.re[8] = C_W2[0]; CLOCK3.im[8] = C_W2[1]

  const SHIFT3 = cmatZero(3)
  SHIFT3.re[0 * 3 + 1] = 1
  SHIFT3.re[1 * 3 + 2] = 1
  SHIFT3.re[2 * 3 + 0] = 1

  // HESS_V = (-i / sqrt(3)) * [omega^(j*k)]
  const HESS_V = cmatZero(3)
  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      const om = cExpI((2 * PI * j * k) / 3)
      const val = cMul([0, -1 / SQRT3], om)
      HESS_V.re[j * 3 + k] = val[0]
      HESS_V.im[j * 3 + k] = val[1]
    }
  }

  const eps1 = cExpI((4 * PI) / 9)
  const NINTH = cmatZero(3)
  NINTH.re[0] = eps1[0]; NINTH.im[0] = eps1[1]
  NINTH.re[4] = eps1[0]; NINTH.im[4] = eps1[1]
  const epsW = cMul(eps1, C_W)
  NINTH.re[8] = epsW[0]; NINTH.im[8] = epsW[1]

  // Verify exact Fourier conjugation swapping role <-> tilt:
  //   HESS_V * CLOCK3 * HESS_V^dag == SHIFT3
  //   HESS_V * SHIFT3 * HESS_V^dag == CLOCK3^dag
  const vClockVdag = cmatMul(HESS_V, cmatMul(CLOCK3, cmatDag(HESS_V)))
  const vShiftVdag = cmatMul(HESS_V, cmatMul(SHIFT3, cmatDag(HESS_V)))
  const errRoleToTilt = cmatFrob(cmatSub(vClockVdag, SHIFT3))
  const errTiltToRoleDag = cmatFrob(cmatSub(vShiftVdag, cmatDag(CLOCK3)))
  const commVClockNorm = cmatFrob(cmatSub(cmatMul(HESS_V, CLOCK3), cmatMul(CLOCK3, HESS_V)))
  assert(errRoleToTilt < 1e-14, `HESS_V CLOCK3 HESS_V^dag != SHIFT3: err=${errRoleToTilt}`)
  assert(errTiltToRoleDag < 1e-14, `HESS_V SHIFT3 HESS_V^dag != CLOCK3^dag: err=${errTiltToRoleDag}`)

  // Generate full Sigma(648) by exact matrix closure
  const mat3Key = (M: CMat): string => {
    const parts: string[] = []
    for (let i = 0; i < 9; i++) {
      const r = Math.round(M.re[i]! * 1e6)
      const im = Math.round(M.im[i]! * 1e6)
      parts.push(`${r === 0 ? 0 : r},${im === 0 ? 0 : im}`)
    }
    return parts.join(';')
  }
  const gens = [CLOCK3, SHIFT3, HESS_V, NINTH]
  const sigma648: CMat[] = [cmatEye(3)]
  const seenS = new Set<string>([mat3Key(cmatEye(3))])
  for (let i = 0; i < sigma648.length; i++) {
    const cur = sigma648[i]!
    for (const g of gens) {
      const nx = cmatMul(g, cur)
      const k = mat3Key(nx)
      if (!seenS.has(k)) {
        seenS.add(k)
        sigma648.push(nx)
      }
    }
  }
  assert(sigma648.length === 648, `Expected |Sigma(648)| = 648, got ${sigma648.length}`)

  // Build the 9 discrete Wigner phase-point operators A(a, b) = D(a, b) P D(a, b)^dag (Wootters/Gross):
  //   D(a, b) = omega^{2*a*b} * X^a * Z^b with X|j> = |j+1>, Z|j> = omega^j |j>, P|j> = |-j>.
  const PARITY3 = cmatZero(3)
  for (let j = 0; j < 3; j++) PARITY3.re[((3 - j) % 3) * 3 + j] = 1

  const phasePts: CMat[] = []
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const D = cmatZero(3)
      const ph = cExpI((2 * PI * ((2 * a * b) % 3)) / 3)
      for (let j = 0; j < 3; j++) {
        const z = cMul(ph, cExpI((2 * PI * ((b * j) % 3)) / 3))
        const row = (j + a) % 3
        D.re[row * 3 + j] = z[0]
        D.im[row * 3 + j] = z[1]
      }
      phasePts.push(cmatMul(D, cmatMul(PARITY3, cmatDag(D))))
    }
  }

  // Verify Sigma(648) acts on {A(r,t)} by EXACTLY the 216 permutations of ASL(2,3) with 3-element center kernel!
  const inducedCounts = new Map<string, number>()
  let maxAdjointErr = 0
  for (const g of sigma648) {
    const gDag = cmatDag(g)
    const perm = new Uint8Array(9)
    for (let p = 0; p < 9; p++) {
      const conj = cmatMul(g, cmatMul(phasePts[p]!, gDag))
      let bestIdx = -1
      let bestErr = Infinity
      for (let q = 0; q < 9; q++) {
        const err = cmatFrob(cmatSub(conj, phasePts[q]!))
        if (err < bestErr) {
          bestErr = err
          bestIdx = q
        }
      }
      maxAdjointErr = Math.max(maxAdjointErr, bestErr)
      perm[p] = bestIdx
    }
    const key = Array.from(perm).join('')
    inducedCounts.set(key, (inducedCounts.get(key) ?? 0) + 1)
  }
  const exactQuotientMatch =
    inducedCounts.size === 216 &&
    [...inducedCounts.keys()].every(k => aslSet.has(k)) &&
    [...inducedCounts.values()].every(c => c === 3)
  const centerKernel = inducedCounts.get('012345678') ?? 0

  console.log(`  |ASL(2,3)| = ${aslPerms.length}, 2-transitive pairs = ${distinctPairsHit}/72 (uniform stab = 3)`)
  console.log(`  Burnside character norms: <chi_9, 1> = ${multTrivial}, <chi_9, chi_9> = ${normSqPi9} => C^9 = 1 (+) 8 (8 strictly irreducible!)`)
  console.log(`  Primitivity: ${invariantFoliations}/4 parallel 3-line foliations invariant (ASL(2,3) acts transitively on all ${roleOrbit.size} foliations)`)
  console.log(`  |Sigma(648)| = ${sigma648.length}, exact quotient onto ASL(2,3) = ${inducedCounts.size} perms (kernel Z_3 = ${centerKernel}, maxErr=${maxAdjointErr.toExponential(1)})`)
  console.log(`  Fourier swap: ||HESS_V*CLOCK3*HESS_V^dag - SHIFT3|| = ${errRoleToTilt.toExponential(2)}, ||[HESS_V, CLOCK3]||_F = ${commVClockNorm.toFixed(5)}`)

  recordCheck(
    'G2.1',
    'ASL(2,3) (order 216) 2-transitivity, primitivity & Burnside C^9 = 1 (+) 8 proof',
    aslPerms.length === 216 &&
      distinctPairsHit === 72 &&
      multTrivial === 1 &&
      normSqPi9 === 2 &&
      invariantFoliations === 0 &&
      roleOrbit.size === 4,
    `|ASL(2,3)|=${aslPerms.length}, pairs=${distinctPairsHit}/72, <chi,chi>=${normSqPi9} (1+8 irred), invFoliations=${invariantFoliations}/4`,
  )
  recordCheck(
    'G2.2',
    'Sigma(648) -> ASL(2,3) exact 3:1 Wigner quotient & HESS_V Fourier swap of role <-> tilt',
    sigma648.length === 648 &&
      exactQuotientMatch &&
      centerKernel === 3 &&
      maxAdjointErr < 1e-12 &&
      errRoleToTilt < 1e-14 &&
      errTiltToRoleDag < 1e-14 &&
      commVClockNorm > 2.0,
    `|Sigma|=${sigma648.length}, img=${inducedCounts.size}, ker=${centerKernel}, swapErr=${errRoleToTilt.toExponential(1)}, ||[V,C]||=${commVClockNorm.toFixed(4)}`,
  )
}

// ============================================================================
// PART G3: SPATIAL Z_3 HOROSPHERE TWIST / DOMAIN-WALL POCKET NEGATIVE CONTROL
// ============================================================================

function runG3(): void {
  console.log('\n========================================================================')
  console.log('G3: SPATIAL Z_3 HOROSPHERE TWIST / DOMAIN-WALL POCKET NEGATIVE CONTROL')
  console.log('========================================================================')

  // Part 3A: Narrow-pocket BT4 chiral wall (exact V1(k) and V2 = R_{5*pi/9}(2*pi/9))
  const Ksmall = mul2(eqCoin2(1, 1), mul2(eqCoin2(-2, 0), eqCoin2(1, 1)))
  const KsmallDag = dag2(Ksmall)
  const V2_BT4 = eqCoin2(1, 5)

  const evalBT4V1 = (kx: number, ky: number, kz: number): { v1: C2; v1Rev: C2 } => {
    const rx = shiftConj2(Ksmall, kx)
    const ry = shiftConj2(Ksmall, ky)
    const rz = shiftConj2(Ksmall, kz)
    const v1 = mul2(mul2(KsmallDag, rx), mul2(mul2(KsmallDag, ry), mul2(KsmallDag, rz)))
    const v1Rev = mul2(mul2(rz, KsmallDag), mul2(mul2(ry, KsmallDag), mul2(rx, KsmallDag)))
    return { v1, v1Rev }
  }

  const windingBT4 = (kx: number, ky: number, kz: number, samples = 128): { nu0: number; nuPi: number; gap0: number } => {
    const { v1, v1Rev } = evalBT4V1(kx, ky, kz)
    const v1RevV1 = mul2(v1Rev, v1)
    let p1 = 0
    let t1 = 0
    let p2 = 0
    let t2 = 0
    let gap0 = Infinity
    for (let i = 0; i <= samples; i++) {
      const q = (i / samples) * 2 * PI - PI
      const cq = Math.cos(q)
      const sq = Math.sin(q)
      const b2: C2 = {
        a00r: V2_BT4.a11r, a00i: V2_BT4.a11i,
        a01r: V2_BT4.a10r * cq + V2_BT4.a10i * sq, a01i: V2_BT4.a10i * cq - V2_BT4.a10r * sq,
        a10r: V2_BT4.a01r * cq - V2_BT4.a01i * sq, a10i: V2_BT4.a01i * cq + V2_BT4.a01r * sq,
        a11r: V2_BT4.a00r, a11i: V2_BT4.a00i,
      }
      const u1 = mul2(v1, mul2(b2, v1Rev))
      const d0 = Math.max(-1, Math.min(1, 0.5 * (u1.a00r + u1.a11r)))
      gap0 = Math.min(gap0, Math.acos(d0))
      const ph1 = Math.atan2(-u1.a01r, -u1.a01i)
      const cB = Math.max(-1, Math.min(1, b2.a00r))
      const bx = -b2.a01i
      const by = -b2.a01r
      const bn = Math.hypot(bx, by)
      const bHalf: C2 =
        bn < 1e-14
          ? cB >= 0
            ? { a00r: 1, a00i: 0, a01r: 0, a01i: 0, a10r: 0, a10i: 0, a11r: 1, a11i: 0 }
            : { a00r: 0, a00i: 0, a01r: 0, a01i: -1, a10r: 0, a10i: -1, a11r: 0, a11i: 0 }
          : (() => {
              const ch = Math.sqrt(0.5 * (1 + cB))
              const sh = Math.sqrt(0.5 * (1 - cB))
              const nx = bx / bn
              const ny = by / bn
              return {
                a00r: ch, a00i: 0,
                a01r: -sh * ny, a01i: -sh * nx,
                a10r: sh * ny, a10i: -sh * nx,
                a11r: ch, a11i: 0,
              }
            })()
      const u2 = mul2(bHalf, mul2(v1RevV1, bHalf))
      const ph2 = Math.atan2(-u2.a01r, -u2.a01i)
      if (i > 0) {
        t1 += wrapDiff(ph1, p1)
        t2 += wrapDiff(ph2, p2)
      }
      p1 = ph1
      p2 = ph2
    }
    const nu1 = Math.round(t1 / (2 * PI))
    const nu2 = Math.round(t2 / (2 * PI))
    return { nu0: Math.round((nu1 + nu2) / 2), nuPi: Math.round((nu1 - nu2) / 2), gap0 }
  }

  // Bisect exact topological pocket radius r_pocket of BT4 along (k_x, 0, 0)
  let lo = 0
  let hi = PI
  for (let it = 0; it < 20; it++) {
    const mid = 0.5 * (lo + hi)
    const w = windingBT4(mid, 0, 0, 96)
    if (w.nu0 === 1) lo = mid
    else hi = mid
  }
  const rPocketBT4 = 0.5 * (lo + hi)
  const bt4TwistWinds = [0, 1, 2].map(q => windingBT4((2 * PI * q) / 3, 0, 0, 128))
  const bt4Ngen = bt4TwistWinds.reduce((s, w) => s + w.nu0, 0)
  const bt4DoublersZero = TRIM_LIST.slice(1).every(([, kx, ky, kz]) => {
    const w = windingBT4(kx, ky, kz, 96)
    return w.nu0 === 0 && w.nuPi === 0
  })

  // Part 3B: Wide-pocket 4D Wilson domain wall (M_0 / r = 7/4 in (3/2, 2))
  // Bulk 1D depth chiral symbol: Q_W(q_D; k) = (M_0 - r*P(k) - r*(1 - cos q_D)) + i*r*sin q_D
  // Exact zero mode decays as psi_D = (1 - m_eff(k)/r)^D when |1 - m_eff(k)/r| < 1 <=> 0 < m_eff(k)/r < 2!
  const M0 = 7 / 4
  const R_WILSON = 1
  const wilsonMeff = (kx: number, ky: number, kz: number): number =>
    M0 - R_WILSON * ((1 - Math.cos(kx)) + (1 - Math.cos(ky)) + (1 - Math.cos(kz)))

  const wilsonWinding = (kx: number, ky: number, kz: number, samples = 256): { nu: number; decayRoot: number; minGap: number } => {
    const mEff = wilsonMeff(kx, ky, kz)
    let prev = 0
    let tot = 0
    let minGap = Infinity
    for (let i = 0; i <= samples; i++) {
      const q = (i / samples) * 2 * PI - PI
      const re = mEff - R_WILSON * (1 - Math.cos(q))
      const im = R_WILSON * Math.sin(q)
      minGap = Math.min(minGap, Math.hypot(re, im))
      const ph = Math.atan2(im, re)
      if (i > 0) tot += wrapDiff(ph, prev)
      prev = ph
    }
    return { nu: Math.round(tot / (2 * PI)), decayRoot: 1 - mEff / R_WILSON, minGap }
  }

  const rPocketWide = Math.acos(1 - M0 / R_WILSON) // arccos(-3/4) = 2.418858 rad > 2*pi/3 = 2.094395 rad
  const wideTwist = [0, 1, 2].map(q => {
    const kx = (2 * PI * q) / 3
    const w = wilsonWinding(kx, 0, 0)
    // 2+1D effective Dirac mass from compactified x-momentum sin(k_x) at k_y = k_z = 0
    const m2D = Math.abs(Math.sin(kx))
    return { q, kx, ...w, m2D }
  })
  const wideNgen = wideTwist.reduce((s, w) => s + w.nu, 0)
  const wideDoublers = TRIM_LIST.slice(1).map(([name, kx, ky, kz]) => ({ name, ...wilsonWinding(kx, ky, kz) }))
  const wideDoublersAllZero = wideDoublers.every(d => d.nu === 0)

  // Explicit 3D -> 2D dimensional loss & parity degeneracy on compactified L_x = 3 slab:
  //   q = 1 (k_x = +2*pi/3) and q = 2 (k_x = +4*pi/3 === -2*pi/3) have:
  //   (1) ZERO continuous k_x propagation (x compactified to 3 lattice sites => 2+1D IR theory!)
  //   (2) Identical depth decay rates |z(q=1)| === |z(q=2)| = 0.75 (forced by k_x <-> -k_x parity!)
  //   (3) Identical UV-scale 2+1D Dirac mass |sin(+-2*pi/3)| = sqrt(3)/2 = 0.866025 (gapped out of IR!)
  const decayDiffQ1Q2 = Math.abs(Math.abs(wideTwist[1]!.decayRoot) - Math.abs(wideTwist[2]!.decayRoot))
  const massQ1 = wideTwist[1]!.m2D
  const massQ2 = wideTwist[2]!.m2D
  const massDiffQ1Q2 = Math.abs(massQ1 - massQ2)

  console.log(`  Narrow BT4 wall: r_pocket = ${rPocketBT4.toFixed(4)} rad < 2*pi/3 = ${(2 * PI / 3).toFixed(4)} rad`)
  console.log(`    Spatial Z_3 twist (q=0,1,2) windings = [${bt4TwistWinds.map(w => `(${w.nu0},${w.nuPi})`).join(', ')}] => N_gen = ${bt4Ngen} (NO-GO!), 7 doublers trivial=${bt4DoublersZero}`)
  console.log(`  Wide-pocket Wilson wall (M_0/r = 7/4): r_pocket = ${rPocketWide.toFixed(4)} rad > 2*pi/3 = ${(2 * PI / 3).toFixed(4)} rad`)
  console.log(`    Spatial Z_3 twist (q=0,1,2) windings = [${wideTwist.map(w => w.nu).join(', ')}] => N_gen = ${wideNgen}, all 7 TRIM doublers = [${wideDoublers.map(d => d.nu).join(',')}]`)
  console.log(`    3D -> 2D OBSTRUCTION: compactified x (L_x = 3) destroys continuous k_x; q=1,2 parity-locked:`)
  console.log(`      decay roots = [${wideTwist.map(w => w.decayRoot.toFixed(4)).join(', ')}] (|z_1|-|z_2|=${decayDiffQ1Q2.toExponential(1)}),`)
  console.log(`      2+1D KK Dirac masses |sin(2*pi*q/3)| = [${wideTwist.map(w => w.m2D.toFixed(6)).join(', ')}] (sqrt(3)/2 = ${(SQRT3 / 2).toFixed(6)})!`)

  recordCheck(
    'G3.1',
    'Narrow-pocket BT4 spatial Z_3 twist no-go (r_pocket < 2*pi/3 => N_gen = 1)',
    rPocketBT4 > 0.5 && rPocketBT4 < (2 * PI) / 3 && bt4Ngen === 1 && bt4DoublersZero,
    `r_pocket=${rPocketBT4.toFixed(4)} rad < ${(2 * PI / 3).toFixed(4)}, N_gen=${bt4Ngen}, doublersZero=${bt4DoublersZero}`,
  )
  recordCheck(
    'G3.2',
    'Wide-pocket M_0/r=7/4 achieves N_gen=3 (0 at all 7 doublers) BUT hits 3D->2D & parity obstruction',
    rPocketWide > (2 * PI) / 3 &&
      wideNgen === 3 &&
      wideDoublersAllZero &&
      decayDiffQ1Q2 < 1e-14 &&
      massDiffQ1Q2 < 1e-14 &&
      Math.abs(massQ1 - SQRT3 / 2) < 1e-14,
    `r_pocket=${rPocketWide.toFixed(4)}, N_gen=${wideNgen}, 7-doublers=0, |z1-z2|=${decayDiffQ1Q2.toExponential(1)}, m2D(q=1,2)=${massQ1.toFixed(5)}`,
  )
}

// ============================================================================
// PART G4: [TIER B EFFECTIVE BLOCH-TOEPLITZ EXISTENCE PROOF — NOT BARE {3,4,3,4}]
//          100% O_h-ISOTROPIC 1-FLAVOR PERIOD-3 CHIRAL DEPTH TOEPLITZ WALL W_3
//          (FULL 4(D_max+1) x 4(D_max+1), D_max = 18)
// ============================================================================

function runG4(): void {
  console.log('\n========================================================================')
  console.log('G4 [TIER B EFFECTIVE BLOCH-TOEPLITZ EXISTENCE PROOF]: 1-FLAVOR WALL W_3')
  console.log('========================================================================')

  // TIER B SCOPE & CONSTRUCTION DISCLOSURE (NOT yet derived from bare {3,4,3,4}):
  //   1. Range-3 depth bond B_3 (|d,R> <-> |d+3,L>) with 6 continuous non-Z[omega] real
  //      parameters (T1=-0.05, T2=0.12, T3=0.36, T_GAMMA=-0.01, c_W=1.40, c_D=0.35) in an
  //      inverted hierarchy |T_3| > |T_2| > |T_1| drives N_gen = 3 (replacing range-3 with
  //      range-M yields N_gen = M).
  //   2. U_Weyl(k) = exp(-i * 0.5 * sin(k) . sigma) (Weyl speed ALPHA_WEYL = 0.5, NOT
  //      W16's c = 1.0) and rational tan(theta_0(k)) are infinite-range real-space 3D
  //      operators (not finite-range split-step QCA gates), which is why W_3 achieves
  //      0.000000 O_h defect (finite-range split-step Weyl QCAs like W16 have O(k^3)
  //      axis-ordering anisotropy).
  //   3. Y_ab = <e_a | 1/N_D | e_b> in G4.4 is a Left-Left projection assuming a matched
  //      RH husk wall (e_R = e_L, since W_3's own RH mirrors live on floor D = 18) and
  //      inherits its 1 : 1/18 : 1/330 hierarchy primarily from Gram-Schmidt shell
  //      projection against Phi(D) = 1/N_D (Cauchy interlacing).
  //
  // Period-3 chiral depth palindrome for ONE single 4-component Dirac spinor (ZERO I_3 (x) U!):
  //   G(k)       = C_0(theta_0(k)) * B_1(beta_1) * B_2(beta_2) * B_3(beta_3)
  //   U_depth(k) = G(k) * sigma_z * G(k)^dag * sigma_z
  //              = C_0(k) * B_1(beta_1) * B_2(beta_2) * B_3(2*beta_3) * B_2(beta_2) * B_1(beta_1) * C_0(k)
  //   W_3(k)     = (U_depth(k) (x) I_2^spin) * S_husk(k)
  // where:
  //   - B_m(beta) couples (|d+m, L>, |d, R>) by exp(-i beta sigma_x) for 0 <= d <= D_max - m,
  //     and +1 on unpaired endpoints (exact finite-slab unitarity & sigma_z B_m sigma_z = B_m^dag).
  //   - theta_0(k) depends ONLY on the exact O_h-invariant cubic Laplacian W(k) = 1 - (cos kx + cos ky + cos kz)/3:
  //       tan(theta_0(k)) = T_GAMMA + C_W * W(k) / (1 + C_D * W(k))  [infinite-range real-space Bloch operator]
  //   - S_husk(k) = I_{D_max+1} (x) diag(U_Weyl(k), U_Weyl(k)^dag) with
  //       U_Weyl(k) = exp(-i * ALPHA_WEYL * (sin kx sigma_x + sin ky sigma_y + sin kz sigma_z)),
  //       ALPHA_WEYL = 0.5 (infinite-range real-space Bloch operator; speed 0.5 != W16's c = 1.0).
  const D_MAX = 18
  const L_DEPTH = D_MAX + 1 // 19 depth layers -> 4 * 19 = 76 total 1-flavor spinor states
  const DIM_2 = 2 * L_DEPTH // 38 chiral depth states (per spin)
  const DIM_4 = 4 * L_DEPTH // 76 full 1-flavor Dirac states

  // 6 continuous non-Z[omega] real Tier B parameters (inverted range hierarchy |T3| > |T2| > |T1|)
  const T1 = -0.05
  const T2 = 0.12
  const T3 = 0.36
  const T_GAMMA = -0.01
  const C_W = 1.4
  const C_D = 0.35
  const ALPHA_WEYL = 0.5 // Effective Weyl speed of W_3 (distinct from W16's c = 1.0)

  const BETA_1 = Math.atan(T1)
  const BETA_2 = Math.atan(T2)
  const BETA_3 = Math.atan(T3)

  const cubicW = (kx: number, ky: number, kz: number): number =>
    1 - (Math.cos(kx) + Math.cos(ky) + Math.cos(kz)) / 3

  const tanTheta0 = (kx: number, ky: number, kz: number): number => {
    const w = cubicW(kx, ky, kz)
    return T_GAMMA + (C_W * w) / (1 + C_D * w)
  }

  const theta0Of = (kx: number, ky: number, kz: number): number => Math.atan(tanTheta0(kx, ky, kz))

  // Build finite-slab 2*L x 2*L bond operator B_m(beta) in basis idx(d, c) = 2*d + c (c=0: L, c=1: R)
  const buildBondM = (L: number, m: number, beta: number): CMat => {
    const dim = 2 * L
    const B = cmatEye(dim)
    const c = Math.cos(beta)
    const s = Math.sin(beta)
    for (let d = 0; d <= L - 1 - m; d++) {
      const iL = 2 * (d + m) + 0
      const iR = 2 * d + 1
      B.re[iL * dim + iL] = c; B.im[iL * dim + iL] = 0
      B.re[iL * dim + iR] = 0; B.im[iL * dim + iR] = -s
      B.re[iR * dim + iL] = 0; B.im[iR * dim + iL] = -s
      B.re[iR * dim + iR] = c; B.im[iR * dim + iR] = 0
    }
    return B
  }

  const B1_SLAB = buildBondM(L_DEPTH, 1, BETA_1)
  const B2_SLAB = buildBondM(L_DEPTH, 2, BETA_2)
  const B3_2SLAB = buildBondM(L_DEPTH, 3, 2 * BETA_3)
  const B_CORE = cmatMul(B1_SLAB, cmatMul(B2_SLAB, cmatMul(B3_2SLAB, cmatMul(B2_SLAB, B1_SLAB))))

  const buildUDepth = (kx: number, ky: number, kz: number, L = L_DEPTH): CMat => {
    const th0 = theta0Of(kx, ky, kz)
    const C0 = buildBondM(L, 0, th0)
    if (L === L_DEPTH) return cmatMul(C0, cmatMul(B_CORE, C0))
    const b1 = buildBondM(L, 1, BETA_1)
    const b2 = buildBondM(L, 2, BETA_2)
    const b32 = buildBondM(L, 3, 2 * BETA_3)
    return cmatMul(C0, cmatMul(b1, cmatMul(b2, cmatMul(b32, cmatMul(b2, cmatMul(b1, C0))))))
  }

  // Exact 2x2 O_h-isotropic Weyl unitary U_Weyl(k) = exp(-i alpha * d(k) . sigma)
  const buildUWeyl2 = (kx: number, ky: number, kz: number): CMat => {
    const dx = Math.sin(kx)
    const dy = Math.sin(ky)
    const dz = Math.sin(kz)
    const dn = Math.hypot(dx, dy, dz)
    const U = cmatZero(2)
    if (dn < 1e-15) {
      U.re[0] = 1
      U.re[3] = 1
      return U
    }
    const c = Math.cos(ALPHA_WEYL * dn)
    const s = Math.sin(ALPHA_WEYL * dn) / dn
    // cos I - i s (dx sx + dy sy + dz sz)
    // (0,0) = c - i s dz; (0,1) = -s dy - i s dx; (1,0) = +s dy - i s dx; (1,1) = c + i s dz
    U.re[0] = c;       U.im[0] = -s * dz
    U.re[1] = -s * dy; U.im[1] = -s * dx
    U.re[2] = s * dy;  U.im[2] = -s * dx
    U.re[3] = c;       U.im[3] = s * dz
    return U
  }

  // Full 4*(D_max+1) x 4*(D_max+1) 1-flavor unitary W_3(k) = (U_depth(k) (x) I_2) * S_husk(k)
  // Basis index: idx(d, c, s) = 4*d + 2*c + s, where c in {0=L, 1=R}, s in {0=up, 1=dn}.
  const buildW3 = (kx: number, ky: number, kz: number): CMat => {
    const Ud = buildUDepth(kx, ky, kz, L_DEPTH)
    const Uw = buildUWeyl2(kx, ky, kz)
    const UwDag = cmatDag(Uw)
    const W = cmatZero(DIM_4)
    for (let d1 = 0; d1 < L_DEPTH; d1++) {
      for (let c1 = 0; c1 < 2; c1++) {
        const r2 = 2 * d1 + c1
        for (let d2 = 0; d2 < L_DEPTH; d2++) {
          for (let c2 = 0; c2 < 2; c2++) {
            const col2 = 2 * d2 + c2
            const ur = Ud.re[r2 * DIM_2 + col2]!
            const ui = Ud.im[r2 * DIM_2 + col2]!
            if (ur === 0 && ui === 0) continue
            const S2 = c2 === 0 ? Uw : UwDag
            for (let s1 = 0; s1 < 2; s1++) {
              const row4 = 4 * d1 + 2 * c1 + s1
              for (let s2 = 0; s2 < 2; s2++) {
                const col4 = 4 * d2 + 2 * c2 + s2
                const sr = S2.re[s1 * 2 + s2]!
                const si = S2.im[s1 * 2 + s2]!
                W.re[row4 * DIM_4 + col4] = W.re[row4 * DIM_4 + col4]! + (ur * sr - ui * si)
                W.im[row4 * DIM_4 + col4] = W.im[row4 * DIM_4 + col4]! + (ur * si + ui * sr)
              }
            }
          }
        }
      }
    }
    return W
  }

  // Exact finite-slab chiral symmetry Gamma_5 U_depth Gamma_5 = U_depth^dag
  const Gamma2 = cmatZero(DIM_2)
  for (let d = 0; d < L_DEPTH; d++) {
    Gamma2.re[(2 * d + 0) * DIM_2 + (2 * d + 0)] = 1
    Gamma2.re[(2 * d + 1) * DIM_2 + (2 * d + 1)] = -1
  }
  const UdGamma = buildUDepth(0, 0, 0, L_DEPTH)
  const chiralErrGamma = cmatFrob(cmatSub(cmatMul(Gamma2, cmatMul(UdGamma, Gamma2)), cmatDag(UdGamma)))
  const UdGen = buildUDepth(0.37, 0.71, 1.13, L_DEPTH)
  const chiralErrGen = cmatFrob(cmatSub(cmatMul(Gamma2, cmatMul(UdGen, Gamma2)), cmatDag(UdGen)))
  assert(chiralErrGamma < 1e-13 && chiralErrGen < 1e-13, `Chiral symmetry failed: ${chiralErrGamma}, ${chiralErrGen}`)

  // --------------------------------------------------------------------------
  // G4.1: Exact 0.000000 O_h Rotational Defect Across All 48 Elements of O_h
  // --------------------------------------------------------------------------
  type Mat3R = readonly (readonly [number, number, number])[]
  const mat3Mul = (A: Mat3R, B: Mat3R): Mat3R =>
    [0, 1, 2].map(r =>
      [0, 1, 2].map(c => A[r]![0] * B[0]![c]! + A[r]![1] * B[1]![c]! + A[r]![2] * B[2]![c]!) as [number, number, number],
    )
  const mat3Key = (A: Mat3R): string => A.map(r => r.join(',')).join(';')
  const mat3Vec = (A: Mat3R, k: readonly [number, number, number]): [number, number, number] => [
    A[0]![0] * k[0] + A[0]![1] * k[1] + A[0]![2] * k[2],
    A[1]![0] * k[0] + A[1]![1] * k[1] + A[1]![2] * k[2],
    A[2]![0] * k[0] + A[2]![1] * k[1] + A[2]![2] * k[2],
  ]

  // Generate all 24 proper rotations R in O together with exact SU(2) spinor lifts S(R)
  const Rz90: Mat3R = [[0, -1, 0], [1, 0, 0], [0, 0, 1]]
  const Rx90: Mat3R = [[1, 0, 0], [0, 0, -1], [0, 1, 0]]
  const Sz90 = cmatZero(2)
  Sz90.re[0] = Math.SQRT1_2; Sz90.im[0] = -Math.SQRT1_2
  Sz90.re[3] = Math.SQRT1_2; Sz90.im[3] = Math.SQRT1_2
  const Sx90 = cmatZero(2)
  Sx90.re[0] = Math.SQRT1_2; Sx90.im[1] = -Math.SQRT1_2
  Sx90.im[2] = -Math.SQRT1_2; Sx90.re[3] = Math.SQRT1_2

  const properO: { R: Mat3R; S: CMat }[] = [{ R: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], S: cmatEye(2) }]
  const seenO = new Set<string>([mat3Key(properO[0]!.R)])
  const oGens: readonly { R: Mat3R; S: CMat }[] = [
    { R: Rz90, S: Sz90 },
    { R: Rx90, S: Sx90 },
  ]
  for (let i = 0; i < properO.length; i++) {
    const cur = properO[i]!
    for (const g of oGens) {
      const nxR = mat3Mul(g.R, cur.R)
      const key = mat3Key(nxR)
      if (!seenO.has(key)) {
        seenO.add(key)
        properO.push({ R: nxR, S: cmatMul(g.S, cur.S) })
      }
    }
  }
  assert(properO.length === 24, `Expected 24 proper rotations in O, got ${properO.length}`)

  // Build all 48 elements of O_h = O U (-O)
  const allOh: Mat3R[] = [
    ...properO.map(x => x.R),
    ...properO.map(x => x.R.map(row => [-row[0], -row[1], -row[2]] as const)),
  ]
  assert(allOh.length === 48, 'Expected 48 elements in O_h')

  const kProbe: readonly [number, number, number] = [0.37, 0.71, 1.13]
  const W3Probe = buildW3(kProbe[0], kProbe[1], kProbe[2])
  const w3ProbeUnitErr = cmatUnitaryErr(W3Probe)
  const spProbe = unitarySpectrum(W3Probe)

  // Check exact covariance R(R) W_3(k) R(R)^dag == W_3(R k) for ALL 24 proper rotations R in O
  let maxProperCovDefect = 0
  for (const { R, S } of properO) {
    const rk = mat3Vec(R, kProbe)
    const Wrk = buildW3(rk[0], rk[1], rk[2])
    const R76 = cmatZero(DIM_4)
    for (let d = 0; d < L_DEPTH; d++) {
      for (let c = 0; c < 2; c++) {
        for (let s1 = 0; s1 < 2; s1++) {
          for (let s2 = 0; s2 < 2; s2++) {
            const rr = 4 * d + 2 * c + s1
            const cc = 4 * d + 2 * c + s2
            R76.re[rr * DIM_4 + cc] = S.re[s1 * 2 + s2]!
            R76.im[rr * DIM_4 + cc] = S.im[s1 * 2 + s2]!
          }
        }
      }
    }
    const conj = cmatMul(R76, cmatMul(W3Probe, cmatDag(R76)))
    maxProperCovDefect = Math.max(maxProperCovDefect, cmatFrob(cmatSub(conj, Wrk)))
  }

  // Check exact O_h invariance of U_depth(g k) == U_depth(k) across ALL 48 elements g in O_h,
  // AND check full 76x76 spectral invariance spec(W_3(g k)) == spec(W_3(k)) for proper + improper generators
  let maxDepthOhDefect = 0
  for (const g of allOh) {
    const gk = mat3Vec(g, kProbe)
    const UdG = buildUDepth(gk[0], gk[1], gk[2], L_DEPTH)
    maxDepthOhDefect = Math.max(maxDepthOhDefect, cmatFrob(cmatSub(UdG, UdGen)))
  }
  // Check full 76x76 spectrum under inversion (-k), mirror (-kx, ky, kz), and 90 deg rotation (-ky, kx, kz)
  const symProbes: readonly [number, number, number][] = [
    [-kProbe[0], -kProbe[1], -kProbe[2]], // inversion i
    [-kProbe[0], kProbe[1], kProbe[2]],   // mirror sigma_h
    [kProbe[1], kProbe[0], kProbe[2]],    // diagonal mirror sigma_d
    [-kProbe[1], kProbe[0], kProbe[2]],   // 90 deg C_4
    [kProbe[1], kProbe[2], kProbe[0]],    // 120 deg C_3
  ]
  let maxSpecOhDefect = 0
  for (const sk of symProbes) {
    const spS = unitarySpectrum(buildW3(sk[0], sk[1], sk[2]))
    for (let i = 0; i < DIM_4; i++) {
      maxSpecOhDefect = Math.max(maxSpecOhDefect, Math.abs(spS.quasi[i]! - spProbe.quasi[i]!))
    }
  }

  // --------------------------------------------------------------------------
  // G4.2: Exact Bulk Chiral Toeplitz Symbol Q_3(z; k), Winding (nu_0, nu_pi)
  //       at Gamma, ALL 7 TRIM Doublers, and Full 8^3 BZ_3 Scan
  // --------------------------------------------------------------------------
  // Bulk 2x2 symbol G(q_D; k) = C_0(theta_0(k)) * B_1(beta_1, q_D) * B_2(beta_2, q_D) * B_3(beta_3, q_D)
  //   where B_m(beta, q_D) = [[cos beta, -i sin beta e^{-i m q_D}], [-i sin beta e^{+i m q_D}, cos beta]].
  //   Exact Toeplitz chiral windings:
  //     nu_0(k)  = Wind_{q_D in [-pi,pi]}( (i * G_{0,1}(q_D; k))^* ) = # roots of Q_3(z; k) inside |z| < 1
  //     nu_pi(k) = Wind_{q_D in [-pi,pi]}( G_{0,0}(q_D; k) )        = # roots of R_3(z; k) inside |z| < 1
  const evalBulkSymbolG = (kx: number, ky: number, kz: number, qD: number): { g00: C; g01: C; gap0: number; gapPi: number } => {
    const th0 = theta0Of(kx, ky, kz)
    const mkB = (m: number, beta: number): C2 => {
      const c = Math.cos(beta)
      const s = Math.sin(beta)
      const cm = Math.cos(m * qD)
      const sm = Math.sin(m * qD)
      // -i s e^{-i m qD} = -i s (cm - i sm) = -s sm - i s cm
      // -i s e^{+i m qD} = -i s (cm + i sm) = +s sm - i s cm
      return {
        a00r: c, a00i: 0,
        a01r: -s * sm, a01i: -s * cm,
        a10r: s * sm, a10i: -s * cm,
        a11r: c, a11i: 0,
      }
    }
    const G = mul2(mkB(0, th0), mul2(mkB(1, BETA_1), mul2(mkB(2, BETA_2), mkB(3, BETA_3))))
    const g00: C = [G.a00r, G.a00i]
    const g01: C = [G.a01r, G.a01i]
    // Bulk eigenvalues of U_depth = G sigma_z G^dag sigma_z satisfy sin(E/2) = |g01|, cos(E/2) = |g00|
    const gap0 = 2 * Math.asin(Math.min(1, cAbs(g01)))
    const gapPi = 2 * Math.asin(Math.min(1, cAbs(g00)))
    return { g00, g01, gap0, gapPi }
  }

  const bulkWindingW3 = (
    kx: number,
    ky: number,
    kz: number,
    samples = 256,
  ): { nu0: number; nuPi: number; minGap0: number; minGapPi: number } => {
    let prev0 = 0
    let tot0 = 0
    let prevPi = 0
    let totPi = 0
    let minGap0 = Infinity
    let minGapPi = Infinity
    for (let i = 0; i <= samples; i++) {
      const qD = (i / samples) * 2 * PI - PI
      const { g00, g01, gap0, gapPi } = evalBulkSymbolG(kx, ky, kz, qD)
      minGap0 = Math.min(minGap0, gap0)
      minGapPi = Math.min(minGapPi, gapPi)
      // Q_3(e^{i q_D}) = (i * g01)^* = (-g01_im) - i * g01_re
      const q3Re = -g01[1]
      const q3Im = -g01[0]
      const ph0 = Math.atan2(q3Im, q3Re)
      const phPi = Math.atan2(g00[1], g00[0])
      if (i > 0) {
        tot0 += wrapDiff(ph0, prev0)
        totPi += wrapDiff(phPi, prevPi)
      }
      prev0 = ph0
      prevPi = phPi
    }
    return {
      nu0: Math.round(tot0 / (2 * PI)),
      nuPi: Math.round(totPi / (2 * PI)),
      minGap0,
      minGapPi,
    }
  }

  const trimWindings = TRIM_LIST.map(([name, kx, ky, kz]) => ({ name, ...bulkWindingW3(kx, ky, kz, 256) }))
  const gammaWind = trimWindings[0]!
  const doublerWindsAllZero = trimWindings.slice(1).every(w => w.nu0 === 0 && w.nuPi === 0)
  const minDoublerBulkGap = Math.min(...trimWindings.slice(1).map(w => w.minGap0))

  // Full 8^3 = 512 BZ_3 scan verifying nu_pi == 0 everywhere (zero spurious pi-pockets)
  let bzMaxAbsNuPi = 0
  let bzMinNuPiGap = Infinity
  for (let ix = 0; ix < 8; ix++) {
    const kx = (ix * PI) / 4
    for (let iy = 0; iy < 8; iy++) {
      const ky = (iy * PI) / 4
      for (let iz = 0; iz < 8; iz++) {
        const kz = (iz * PI) / 4
        const w = bulkWindingW3(kx, ky, kz, 64)
        bzMaxAbsNuPi = Math.max(bzMaxAbsNuPi, Math.abs(w.nuPi))
        bzMinNuPiGap = Math.min(bzMinNuPiGap, w.minGapPi)
      }
    }
  }

  // Analytic cubic polynomial Q_3(zeta; 0) = zeta^3 + p2*zeta^2 + p1*zeta + p0 = 0
  const p0G = T_GAMMA / T3
  const p1G = T1 / T3 - T_GAMMA * T2 * (T1 / T3 + 1)
  const p2G = T2 / T3 - T1 * T2 - T_GAMMA * T1
  const evalQ3 = (z: number): number => ((z + p2G) * z + p1G) * z + p0G
  const evalQ3d = (z: number): number => (3 * z + 2 * p2G) * z + p1G

  // Find all 3 real roots of Q_3(zeta; 0) via exact trigonometric Cardano formula + Newton polish
  const qP = p1G - (p2G * p2G) / 3
  const qQ = (2 * p2G * p2G * p2G) / 27 - (p2G * p1G) / 3 + p0G
  const disc = (qQ * qQ) / 4 + (qP * qP * qP) / 27
  assert(disc < 0, `Expected 3 strictly real distinct roots (disc < 0), got disc=${disc}`)
  const rho = Math.sqrt((-qP * qP * qP) / 27)
  const phiC = Math.acos(Math.max(-1, Math.min(1, -qQ / (2 * rho))))
  const rC = 2 * Math.cbrt(rho)
  const analyticRoots = [0, 1, 2]
    .map(m => {
      let z = rC * Math.cos((phiC + 2 * PI * m) / 3) - p2G / 3
      for (let it = 0; it < 12; it++) z -= evalQ3(z) / evalQ3d(z)
      return z
    })
    .sort((a, b) => Math.abs(a) - Math.abs(b))

  for (const r of analyticRoots) {
    assert(Math.abs(evalQ3(r)) < 1e-14, `Analytic root residual too large: ${evalQ3(r)}`)
  }
  const absRoots = analyticRoots.map(Math.abs)
  assert(
    absRoots[0]! > 0.05 &&
      absRoots[0]! + 0.05 < absRoots[1]! &&
      absRoots[1]! + 0.05 < absRoots[2]! &&
      absRoots[2]! < 0.75,
    `Roots not strictly separated inside unit disk: ${absRoots.join(', ')}`,
  )

  // --------------------------------------------------------------------------
  // G4.3: Full 76 x 76 Unitary Spectrum of W_3 at Gamma & All 7 TRIM Doublers
  // --------------------------------------------------------------------------
  const W3Gamma = buildW3(0, 0, 0)
  const spGamma = unitarySpectrum(W3Gamma)
  assert(spGamma.maxUnitErr < 1e-13 && spGamma.maxRes < 1e-11, `W3(Gamma) diag error: u=${spGamma.maxUnitErr}, r=${spGamma.maxRes}`)

  // Sort eigenvalues by |E|
  const byAbsE = Array.from({ length: DIM_4 }, (_, i) => i).sort(
    (i, j) => Math.abs(spGamma.quasi[i]!) - Math.abs(spGamma.quasi[j]!),
  )
  const zeroIndices = byAbsE.filter(i => Math.abs(spGamma.quasi[i]!) < 0.01)
  const nextBulkGapGamma = Math.abs(spGamma.quasi[byAbsE[zeroIndices.length]!]!)
  const maxZeroModeEnergy = Math.max(...zeroIndices.map(i => Math.abs(spGamma.quasi[i]!)))
  assert(zeroIndices.length === 12, `Expected 12 near-zero slab states (6 husk L + 6 floor R), got ${zeroIndices.length}`)

  // Diagonalize chirality Gamma_5 = diag(+1 on L, -1 on R) inside the 12-dim zero-mode subspace V_0
  const nZ = zeroIndices.length
  const g5SubRe = new Float64Array(nZ * nZ)
  const g5SubIm = new Float64Array(nZ * nZ)
  for (let a = 0; a < nZ; a++) {
    const oa = zeroIndices[a]! * DIM_4
    for (let b = 0; b < nZ; b++) {
      const ob = zeroIndices[b]! * DIM_4
      let sr = 0
      let si = 0
      for (let d = 0; d < L_DEPTH; d++) {
        for (let c = 0; c < 2; c++) {
          const sign = c === 0 ? 1 : -1
          for (let s = 0; s < 2; s++) {
            const idx = 4 * d + 2 * c + s
            const ar = spGamma.vecRe[oa + idx]!
            const ai = spGamma.vecIm[oa + idx]!
            const br = spGamma.vecRe[ob + idx]!
            const bi = spGamma.vecIm[ob + idx]!
            sr += sign * (ar * br + ai * bi)
            si += sign * (ar * bi - ai * br)
          }
        }
      }
      g5SubRe[a * nZ + b] = sr
      g5SubIm[a * nZ + b] = si
    }
  }
  const eigG5 = hermitianJacobi(nZ, g5SubRe, g5SubIm)

  // Reconstruct the 12 chirality-resolved zero modes and measure husk weight (D <= 6) & |W3 v - v|
  let leftHuskZeroCount = 0
  let rightHuskZeroCount = 0
  let rightFloorMirrorCount = 0
  let minLeftHuskWeight = 1
  let maxRightHuskWeight = 0
  let maxLeftZeroActionErr = 0

  const leftModesRe: Float64Array[] = []
  const leftModesIm: Float64Array[] = []

  for (let k = 0; k < nZ; k++) {
    const chiVal = eigG5.values[k]!
    const vr = new Float64Array(DIM_4)
    const vi = new Float64Array(DIM_4)
    for (let a = 0; a < nZ; a++) {
      const cr = eigG5.vecRe[k * nZ + a]!
      const ci = eigG5.vecIm[k * nZ + a]!
      const oa = zeroIndices[a]! * DIM_4
      for (let idx = 0; idx < DIM_4; idx++) {
        const xr = spGamma.vecRe[oa + idx]!
        const xi = spGamma.vecIm[oa + idx]!
        vr[idx] = vr[idx]! + (cr * xr - ci * xi)
        vi[idx] = vi[idx]! + (cr * xi + ci * xr)
      }
    }
    let wHusk = 0
    let wFloor = 0
    for (let d = 0; d < L_DEPTH; d++) {
      let wd = 0
      for (let m = 0; m < 4; m++) {
        const idx = 4 * d + m
        wd += vr[idx]! * vr[idx]! + vi[idx]! * vi[idx]!
      }
      if (d <= 6) wHusk += wd
      if (d >= D_MAX - 6) wFloor += wd
    }
    // Check ||W3(0) v - v||
    let err2 = 0
    for (let r = 0; r < DIM_4; r++) {
      let sr = 0
      let si = 0
      for (let c = 0; c < DIM_4; c++) {
        sr += W3Gamma.re[r * DIM_4 + c]! * vr[c]! - W3Gamma.im[r * DIM_4 + c]! * vi[c]!
        si += W3Gamma.re[r * DIM_4 + c]! * vi[c]! + W3Gamma.im[r * DIM_4 + c]! * vr[c]!
      }
      err2 += (sr - vr[r]!) ** 2 + (si - vi[r]!) ** 2
    }
    const actErr = Math.sqrt(err2)

    if (chiVal > 0.999) {
      if (wHusk > 0.5) {
        leftHuskZeroCount++
        minLeftHuskWeight = Math.min(minLeftHuskWeight, wHusk)
        maxLeftZeroActionErr = Math.max(maxLeftZeroActionErr, actErr)
        leftModesRe.push(vr)
        leftModesIm.push(vi)
      }
    } else if (chiVal < -0.999) {
      maxRightHuskWeight = Math.max(maxRightHuskWeight, wHusk)
      if (wHusk > 0.5) rightHuskZeroCount++
      if (wFloor > 0.5) rightFloorMirrorCount++
    }
  }

  // Verify ALL 7 TRIM doublers have EXACTLY 0 zero modes on the full 76 x 76 unitary W_3
  let totalDoublerZeroModes = 0
  let minDoublerSlabGap = Infinity
  for (let t = 1; t < TRIM_LIST.length; t++) {
    const [, kx, ky, kz] = TRIM_LIST[t]!
    const spD = unitarySpectrum(buildW3(kx, ky, kz))
    for (let i = 0; i < DIM_4; i++) {
      const e = Math.abs(spD.quasi[i]!)
      if (e < 0.05) totalDoublerZeroModes++
      minDoublerSlabGap = Math.min(minDoublerSlabGap, e)
    }
  }

  // Verify 3D isotropic Weyl dispersion at small k along (1,0,0), (1,1,0)/sqrt(2), (1,1,1)/sqrt(3)
  const kSmallMag = 0.02
  const kDirs: readonly [string, number, number, number][] = [
    ['(1,0,0)', kSmallMag, 0, 0],
    ['(1,1,0)/s2', kSmallMag * Math.SQRT1_2, kSmallMag * Math.SQRT1_2, 0],
    ['(1,1,1)/s3', kSmallMag / SQRT3, kSmallMag / SQRT3, kSmallMag / SQRT3],
  ]
  const weylVelocities: number[] = []
  for (const [, kx, ky, kz] of kDirs) {
    const spK = unitarySpectrum(buildW3(kx, ky, kz))
    const small6 = Array.from(spK.quasi)
      .map(Math.abs)
      .sort((a, b) => a - b)
      .slice(0, 12)
    // All 12 low-energy modes (6 L + 6 R) have |E| = ALPHA_WEYL * |d(k)| = 0.5 * kSmallMag
    // (NOTE: W_3's effective Weyl speed is ALPHA_WEYL = 0.5, distinct from W16's c = 1.0!)
    const vMean = small6.reduce((s, e) => s + e, 0) / (small6.length * kSmallMag)
    weylVelocities.push(vMean)
  }
  const weylIsoErr = Math.max(...weylVelocities.map(v => Math.abs(v - ALPHA_WEYL)))

  // --------------------------------------------------------------------------
  // G4.4: Extract 3 Strictly Distinct Exponential Depth Profiles Directly from
  //       the 76 x 76 Left-Handed Eigenspace & Certify > 10^2 Yukawa Hierarchy
  // --------------------------------------------------------------------------
  // Project the 6 Left-handed husk zero modes onto spin-up (s = 0) via sigma_z^spin to get an
  // exact orthonormal basis {e_0(D), e_1(D), e_2(D)} of the 3-generation spatial subspace V_L!
  const szRe = new Float64Array(36)
  const szIm = new Float64Array(36)
  for (let a = 0; a < 6; a++) {
    for (let b = 0; b < 6; b++) {
      let sr = 0
      let si = 0
      for (let d = 0; d < L_DEPTH; d++) {
        for (let s = 0; s < 2; s++) {
          const sign = s === 0 ? 1 : -1
          const idx = 4 * d + 0 + s
          sr += sign * (leftModesRe[a]![idx]! * leftModesRe[b]![idx]! + leftModesIm[a]![idx]! * leftModesIm[b]![idx]!)
          si += sign * (leftModesRe[a]![idx]! * leftModesIm[b]![idx]! - leftModesIm[a]![idx]! * leftModesRe[b]![idx]!)
        }
      }
      szRe[a * 6 + b] = sr
      szIm[a * 6 + b] = si
    }
  }
  const eigSz = hermitianJacobi(6, szRe, szIm)
  // Top 3 eigenvalues are +1 (spin-up), bottom 3 are -1 (spin-down)
  const spinUpCount = Array.from(eigSz.values).filter(v => v > 0.999).length
  const spinDnCount = Array.from(eigSz.values).filter(v => v < -0.999).length
  assert(spinUpCount === 3 && spinDnCount === 3, `Expected 3 spin-up + 3 spin-down doublets, got ${spinUpCount}+${spinDnCount}`)

  // Build 3 orthonormal depth profiles E[a][d] (complex, a in 0..2, d in 0..D_MAX) for the 3 spin-up L zero modes
  const basisRe: Float64Array[] = []
  const basisIm: Float64Array[] = []
  for (let k = 3; k < 6; k++) {
    const er = new Float64Array(L_DEPTH)
    const ei = new Float64Array(L_DEPTH)
    for (let a = 0; a < 6; a++) {
      const cr = eigSz.vecRe[k * 6 + a]!
      const ci = eigSz.vecIm[k * 6 + a]!
      for (let d = 0; d < L_DEPTH; d++) {
        const idx = 4 * d + 0 + 0 // (d, L, up)
        const xr = leftModesRe[a]![idx]!
        const xi = leftModesIm[a]![idx]!
        er[d] = er[d]! + (cr * xr - ci * xi)
        ei[d] = ei[d]! + (cr * xi + ci * xr)
      }
    }
    let norm2 = 0
    for (let d = 0; d < L_DEPTH; d++) norm2 += er[d]! * er[d]! + ei[d]! * ei[d]!
    const invN = 1 / Math.sqrt(norm2)
    for (let d = 0; d < L_DEPTH; d++) {
      er[d] = er[d]! * invN
      ei[d] = ei[d]! * invN
    }
    basisRe.push(er)
    basisIm.push(ei)
  }

  // Extract the 3 exponential decay eigenvalues directly from E via depth-shift operator S_3 = (E_0^dag E_0)^{-1} (E_0^dag E_1)
  // on interior layers d = 0..D_MAX - 5 (away from the far floor)
  const M_FIT = D_MAX - 4
  const G0 = cmatZero(3)
  const G1 = cmatZero(3)
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      let s0r = 0, s0i = 0, s1r = 0, s1i = 0
      for (let d = 0; d < M_FIT; d++) {
        const ar = basisRe[a]![d]!
        const ai = basisIm[a]![d]!
        const br0 = basisRe[b]![d]!
        const bi0 = basisIm[b]![d]!
        const br1 = basisRe[b]![d + 1]!
        const bi1 = basisIm[b]![d + 1]!
        s0r += ar * br0 + ai * bi0
        s0i += ar * bi0 - ai * br0
        s1r += ar * br1 + ai * bi1
        s1i += ar * bi1 - ai * br1
      }
      G0.re[a * 3 + b] = s0r; G0.im[a * 3 + b] = s0i
      G1.re[a * 3 + b] = s1r; G1.im[a * 3 + b] = s1i
    }
  }
  // Invert 3x3 Hermitian Gram matrix G0 via eigendecomposition
  const eigG0 = hermitianJacobi(3, G0.re, G0.im)
  const G0Inv = cmatZero(3)
  for (let k = 0; k < 3; k++) {
    const invL = 1 / eigG0.values[k]!
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const vrI = eigG0.vecRe[k * 3 + i]!
        const viI = eigG0.vecIm[k * 3 + i]!
        const vrJ = eigG0.vecRe[k * 3 + j]!
        const viJ = eigG0.vecIm[k * 3 + j]!
        G0Inv.re[i * 3 + j] = G0Inv.re[i * 3 + j]! + invL * (vrI * vrJ + viI * viJ)
        G0Inv.im[i * 3 + j] = G0Inv.im[i * 3 + j]! + invL * (viI * vrJ - vrI * viJ)
      }
    }
  }
  const S3 = cmatMul(G0Inv, G1)

  // Characteristic polynomial of 3x3 shift matrix S_3: lambda^3 - tr(S3) lambda^2 + c1 lambda - det(S3) = 0
  const trS3 = S3.re[0]! + S3.re[4]! + S3.re[8]!
  const detS3 = complexDet(S3)[0]
  const S3Sq = cmatMul(S3, S3)
  const trS3Sq = S3Sq.re[0]! + S3Sq.re[4]! + S3Sq.re[8]!
  const c1S3 = 0.5 * (trS3 * trS3 - trS3Sq)
  // Solve real characteristic polynomial of S_3 (matching analytic roots!)
  const evalCharS3 = (z: number): number => ((z - trS3) * z + c1S3) * z - detS3
  const evalCharS3d = (z: number): number => (3 * z - 2 * trS3) * z + c1S3
  const extractedRoots = analyticRoots
    .map(z0 => {
      let z = z0
      for (let it = 0; it < 12; it++) z -= evalCharS3(z) / evalCharS3d(z)
      return z
    })
    .sort((a, b) => Math.abs(a) - Math.abs(b))
  const maxRootExtractErr = Math.max(...extractedRoots.map((z, i) => Math.abs(z - analyticRoots[i]!)))
  const maxCharRes = Math.max(...extractedRoots.map(z => Math.abs(evalCharS3(z))))

  // Verify each analytic exponential profile psi_a(D) = z_a^D lies strictly INSIDE the extracted 76x76 eigenspace!
  const subspaceProjectErrs = analyticRoots.map(za => {
    const pr = new Float64Array(L_DEPTH)
    let n2 = 0
    for (let d = 0; d < L_DEPTH; d++) {
      pr[d] = za ** d
      n2 += pr[d]! * pr[d]!
    }
    const invN = 1 / Math.sqrt(n2)
    for (let d = 0; d < L_DEPTH; d++) pr[d] = pr[d]! * invN
    // Compute projection norm^2 onto span{basis[0..2]}
    let proj2 = 0
    for (let a = 0; a < 3; a++) {
      let ir = 0
      let ii = 0
      for (let d = 0; d < L_DEPTH; d++) {
        ir += basisRe[a]![d]! * pr[d]!
        ii += -basisIm[a]![d]! * pr[d]!
      }
      proj2 += ir * ir + ii * ii
    }
    return Math.sqrt(Math.max(0, 1 - proj2))
  })
  const maxSubspaceErr = Math.max(...subspaceProjectErrs)

  // Exact 3 x 3 Left-Left husk projection matrix Y_{ab} = <e_a | Phi_husk(D) | e_b>
  // DISCLOSURE (Tier B matched-wall assumption):
  //   - W_3's own RH mirror zero modes live on the opposite floor D = 18; forming a husk Yukawa
  //     matrix Y_{ab} = <e_a | 1/N_D | e_b> assumes a matched RH husk wall (e_R = e_L) and
  //     inherits its 1 : 1/18 : 1/330 hierarchy primarily from Gram-Schmidt shell projection
  //     against Phi_husk(D) = 1 / N_D (Cauchy interlacing).
  //   - Exact {3,4,3,4} Steinberg cubic shell recurrence (certified in CuspGrowth.lean):
  //       N_0 = 1, N_1 = 18, N_2 = 330, N_3 = 6034,
  //       N_d = 21 * N_{d-1} - 51 * N_{d-2} + 23 * N_{d-3}   for all d >= 4.
  const shellBig: bigint[] = [1n, 18n, 330n, 6034n]
  for (let d = 4; d <= D_MAX; d++) {
    shellBig.push(21n * shellBig[d - 1]! - 51n * shellBig[d - 2]! + 23n * shellBig[d - 3]!)
  }
  assert(shellBig.length === L_DEPTH, `Expected ${L_DEPTH} exact {3,4,3,4} shell counts`)
  assert(shellBig[4] === 110298n, `Expected N_4 = 21*6034 - 51*330 + 23*18 = 110298, got ${shellBig[4]}`)
  const exactShells: readonly number[] = shellBig.map(v => Number(v))
  const phiHusk = (d: number): number => 1 / exactShells[d]!

  const Yre = new Float64Array(9)
  const Yim = new Float64Array(9)
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      let sr = 0
      let si = 0
      for (let d = 0; d < L_DEPTH; d++) {
        const w = phiHusk(d)
        const ar = basisRe[a]![d]!
        const ai = basisIm[a]![d]!
        const br = basisRe[b]![d]!
        const bi = basisIm[b]![d]!
        sr += w * (ar * br + ai * bi)
        si += w * (ar * bi - ai * br)
      }
      Yre[a * 3 + b] = sr
      Yim[a * 3 + b] = si
    }
  }
  const eigY = hermitianJacobi(3, Yre, Yim)
  const y1 = eigY.values[0]!
  const y2 = eigY.values[1]!
  const y3 = eigY.values[2]!
  const yukawaRatio31 = y3 / y1
  const yukawaRatio32 = y3 / y2
  const yukawaRatio21 = y2 / y1

  console.log(`  [TIER B DISCLOSURE] Effective Bloch-Toeplitz existence proof (NOT derived from bare {3,4,3,4}):`)
  console.log(`    (1) N_gen=3 uses range-3 bond B_3 (|d,R><->|d+3,L>) & 6 real non-Z[omega] params (|T3|=0.36>|T2|=0.12>|T1|=0.05; range-M => N_gen=M).`)
  console.log(`    (2) U_Weyl(k)=exp(-i*0.5*sin(k).sigma) & rational tan(theta_0(k)) are infinite-range 3D Bloch ops (explaining 0.000000 O_h defect vs W16 O(k^3)).`)
  console.log(`    (3) Y_ab=<e_a|1/N_D|e_b> is an L-L projection (matched RH husk wall e_R=e_L; W_3's RH mirrors sit at D=${D_MAX}); hierarchy via Cauchy interlacing.`)
  console.log(`  1-flavor spinor slab: D_max = ${D_MAX}, dim = ${DIM_4} x ${DIM_4} (ZERO I_3 tensoring!)`)
  console.log(`  Exact unitarity err = ${spGamma.maxUnitErr.toExponential(2)}, chiral symmetry err = ${chiralErrGamma.toExponential(2)}`)
  console.log(`  O_h rotational defect (48 elems, infinite-range Bloch op): U_depth = ${maxDepthOhDefect.toExponential(2)}, 24 proper R(R) W_3 R(R)^dag = ${maxProperCovDefect.toExponential(2)}, spec = ${maxSpecOhDefect.toExponential(2)}`)
  console.log(`  Bulk winding: Gamma = (${gammaWind.nu0}, ${gammaWind.nuPi}) (bulkGap0=${gammaWind.minGap0.toFixed(4)} rad), 7 TRIM doublers = all (0,0) (minBulkGap=${minDoublerBulkGap.toFixed(4)} rad)`)
  console.log(`  Full 8^3 BZ_3 scan: max |nu_pi| = ${bzMaxAbsNuPi} (minPiGap=${bzMinNuPiGap.toFixed(4)} rad)`)
  console.log(`  76x76 spectrum at Gamma: ${leftHuskZeroCount} Left-handed husk zero modes (N_gen = ${leftHuskZeroCount / 2} Weyl doublets, W_husk>=${minLeftHuskWeight.toFixed(6)}, |E|<=${maxZeroModeEnergy.toExponential(2)})`)
  console.log(`    Right-handed husk zero modes = ${rightHuskZeroCount} (6 mirror R modes trapped at floor D=${D_MAX}, max W_husk=${maxRightHuskWeight.toExponential(2)})`)
  console.log(`    0 4th generation: next bulk eigenvalue |E_13| = ${nextBulkGapGamma.toFixed(6)} rad (> 0.15 rad!), 7 doublers zero modes = ${totalDoublerZeroModes} (minGap=${minDoublerSlabGap.toFixed(4)} rad)`)
  console.log(`  3D isotropic Weyl cones at |k|=${kSmallMag} (W_3 speed ALPHA_WEYL=${ALPHA_WEYL}, not W16 c=1.0): velocities = [${weylVelocities.map(v => v.toFixed(6)).join(', ')}] (isoErr=${weylIsoErr.toExponential(2)})`)
  console.log(`  3 distinct exponential depth roots:`)
  console.log(`    analytic Q_3(z;0)=0: [${analyticRoots.map(r => r.toFixed(6)).join(', ')}] => |z| = [${absRoots.map(r => r.toFixed(6)).join(', ')}]`)
  console.log(`    extracted from 76x76: [${extractedRoots.map(r => r.toFixed(6)).join(', ')}] (maxDiff=${maxRootExtractErr.toExponential(2)}, subspaceErr=${maxSubspaceErr.toExponential(2)})`)
  console.log(`  Left-Left husk projection Y_ab = <e_a | 1/N_D | e_b> (exact recurrence N_d=21N_{d-1}-51N_{d-2}+23N_{d-3}; N_4=${shellBig[4]}):`)
  console.log(`    (y_1, y_2, y_3) = (${y1.toExponential(4)}, ${y2.toExponential(4)}, ${y3.toExponential(4)})`)
  console.log(`    Hierarchies (Cauchy interlacing against 1:1/18:1/330): y_3/y_1 = ${yukawaRatio31.toFixed(2)} (> 10^2), y_3/y_2 = ${yukawaRatio32.toFixed(2)}, y_2/y_1 = ${yukawaRatio21.toFixed(2)}`)

  recordCheck(
    'G4.1',
    '[Tier B Bloch-Toeplitz] 76x76 1-flavor W_3 unitarity, chiral sym & 0.000000 O_h defect (inf-range 3D ops)',
    spGamma.maxUnitErr < 1e-13 &&
      w3ProbeUnitErr < 1e-13 &&
      chiralErrGamma < 1e-13 &&
      chiralErrGen < 1e-13 &&
      maxDepthOhDefect < 1e-13 &&
      maxProperCovDefect < 1e-13 &&
      maxSpecOhDefect < 1e-12,
    `uErr=${spGamma.maxUnitErr.toExponential(1)}, chiErr=${chiralErrGamma.toExponential(1)}, OhDepth=${maxDepthOhDefect.toExponential(1)}, OhCov24=${maxProperCovDefect.toExponential(1)}, OhSpec=${maxSpecOhDefect.toExponential(1)}`,
  )
  recordCheck(
    'G4.2',
    '[Tier B range-3 B_3] Bulk Toeplitz winding (3,0) at Gamma, (0,0) at 7 TRIM doublers, nu_pi=0 across BZ_3',
    gammaWind.nu0 === 3 &&
      gammaWind.nuPi === 0 &&
      doublerWindsAllZero &&
      bzMaxAbsNuPi === 0 &&
      minDoublerBulkGap > 0.15,
    `Gamma=(${gammaWind.nu0},${gammaWind.nuPi}), 7-doublers=(0,0) (minGap=${minDoublerBulkGap.toFixed(4)}), BZ_max|nu_pi|=${bzMaxAbsNuPi}`,
  )
  recordCheck(
    'G4.3',
    '[Tier B] 76x76 spectrum: 6 L husk zero modes (N_gen=3), 0 R husk, 0 4th gen (gap>0.15), v=ALPHA_WEYL=0.5',
    leftHuskZeroCount === 6 &&
      rightHuskZeroCount === 0 &&
      rightFloorMirrorCount === 6 &&
      minLeftHuskWeight > 0.999 &&
      maxRightHuskWeight < 1e-4 &&
      maxLeftZeroActionErr < 1e-4 &&
      nextBulkGapGamma > 0.15 &&
      totalDoublerZeroModes === 0 &&
      minDoublerSlabGap > 0.15 &&
      weylIsoErr < 1e-3,
    `L_husk=${leftHuskZeroCount}, R_husk=${rightHuskZeroCount}, nextGap=${nextBulkGapGamma.toFixed(4)} rad, doublers=${totalDoublerZeroModes} (minGap=${minDoublerSlabGap.toFixed(4)}), v=${ALPHA_WEYL} (isoErr=${weylIsoErr.toExponential(1)})`,
  )
  recordCheck(
    'G4.4',
    '[Tier B L-L matched-wall] 3 distinct decay roots |z_1|<|z_2|<|z_3|<1 & >10^2 exact-recurrence 1/N_D hierarchy',
    absRoots[0]! < absRoots[1]! &&
      absRoots[1]! < absRoots[2]! &&
      absRoots[2]! < 1 &&
      maxRootExtractErr < 1e-4 &&
      maxCharRes < 1e-12 &&
      maxSubspaceErr < 1e-4 &&
      y1 > 0 &&
      y2 > y1 &&
      y3 > y2 &&
      yukawaRatio31 > 100,
    `|z|=[${absRoots.map(r => r.toFixed(4)).join('<')}], extErr=${maxRootExtractErr.toExponential(1)}, y3/y1=${yukawaRatio31.toFixed(1)} (y3/y2=${yukawaRatio32.toFixed(1)}, y2/y1=${yukawaRatio21.toFixed(1)}, exact N_d)`,
  )
}

// ============================================================================
// MAIN EXECUTION & FINAL CERTIFICATION SUMMARY
// ============================================================================

runG1()
runG2()
runG3()
runG4()

const elapsedSec = (performance.now() - T_START_MS) / 1000
const rssMb = process.memoryUsage().rss / (1024 * 1024)
const allPass = CHECKS.every(c => c.pass)

console.log('\n========================================================================')
console.log('FINAL CERTIFICATION LEDGER — THREE GENERATIONS INDEX AUDIT (G1..G4)')
console.log('  Scope: G1..G3 = exact algebraic/topological negative controls;')
console.log('         G4     = Tier B effective Bloch-Toeplitz existence proof (range-3 B_3,')
console.log('                  6 real params, inf-range 3D ops, v=0.5, L-L matched-wall 1/N_D).')
console.log('========================================================================')
for (const row of CHECKS) {
  console.log(`  [${row.pass ? 'PASS' : 'FAIL'}] ${row.id.padEnd(4)} | ${row.name}`)
  console.log(`         -> ${row.metric}`)
}
console.log('------------------------------------------------------------------------')
console.log(`  Total checks: ${CHECKS.filter(c => c.pass).length}/${CHECKS.length} PASSED`)
console.log(`  Runtime:      ${elapsedSec.toFixed(3)} s (limit < 6.0 s)`)
console.log(`  RSS Memory:   ${rssMb.toFixed(1)} MB (limit < 250 MB)`)
console.log('========================================================================')

assert(allPass, 'One or more verification checks failed')
assert(elapsedSec < 6.0, `Runtime ${elapsedSec.toFixed(3)}s exceeded 6.0s budget`)
assert(rssMb < 250, `RSS ${rssMb.toFixed(1)} MB exceeded 250 MB budget`)

export {}
