// Wave-5 Verification Suite:
//   Arbitrary-n M_pair = I Marin Lie-Algebraic Universality, Zero-w=0 Exchange-Gate Compilation,
//   1D K-Mirror Crossing-Count Bounds, & Exact 3-Pass Disentangling 4D CZ
//
// Strictly under verbatim time-independent 8-layer bare quantum U:
//   U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd
// over exact BigInt Z[zeta_9][1/6] on O^+(4,1; Z[sqrt(2)]) {3,4,3,4} + exact Float64 unitary solvers:
//
//   PILLAR T1: Exact S_6 Role-Block No-Go & Alternating S_3(2,1) | S_5(3,2) 8-Role Arbitrary-n Marin Universality
//     - T1a: Direct C^{720} = C[S_6] evolution of U4d's 53-step CZ on localized disjoint blocks Q_0={0,1,2} (2,1)
//            and Q_1={3,4,5} (2,1) -> P_stay(|0,0>) = P_stay(|1,1>) = 169/1024 = 0.165039 (83.5% role leakage)
//            and P_stay(|0,1>) = 841/1024 = 0.821289 (negative control proving naive 3-spin 2-coloring fails)
//     - T1b: Exact Lie algebra closure dims dim Lie({i P_{p,p+1}}) in C[S_N]: S_3 -> 4, S_4 -> 12, S_5 -> 40,
//            S_6 -> 249, plus exact leakage-kernel stabilizer of W=(2,1)x(2,1) in g_6 -> exact 6 = su(2)+su(2)
//            effective action dims (0 non-local entangling dims, proving Theorem 1B directly)
//     - T1c: Exact Murnaghan-Nakayama character tables & Littlewood-Richardson decomposition (Lie-algebraic
//            existence in the externally scheduled exchange-gate model; no explicit S_8 pulse sequence is
//            synthesized here, and T2a's explicit pulses use S_3(2,1) | S_3(2,1)):
//              * S_3(2,1) | S_5(3,2) in S_8 (8 <= 9 roles): dim = 560, 9 irreps, 0 hooks, W perp tau(W),
//                10*m(W) + 10*m(tau(W)) <= dim(V_lambda) on 9/9 irreps -> Marin stabilizer in g_8 is u(10)
//                (100 dims, containing all 99 dims of su(10)) -> arbitrary n -> inf with M_pair = I
//              * S_4(2,2) | S_5(3,2) in S_9 (9 roles): dim = 1260, 9 irreps, 0 hooks, 0 self-conjugate, ALL m(W)=1
//
//   PILLAR T2: Complete Elimination of w = 0 in the Externally Scheduled Exchange-Gate Model
//     (Note: replacing E(1) by E(1/2)^2 requires colliding the same pair twice, which remains impossible on a
//      single-pass infinite ballistic line without mirrors. Conventions: verbatim bare M_meet = omega * E(-2/3),
//      so M_meet^dag = M_meet^2 = omega^2 * E(+2/3), i.e., E(+2/3) = omega * M_meet^dag = omega * M_meet^2;
//      worldline R(w_R) uses w_R = cot(pi alpha / 2), related to spatial-crossing S_sp(w_sp) = P R(w_sp) in
//      bare-u-periodic-mirrors-and-bounds.ts by w_sp = -tan(pi alpha / 2) = -1 / w_R.)
//     - T2a: Exact zero-w=0 continuous-rapidity universal gate set (strictly adjacent, all finite nonzero w_R):
//              * 76-pulse spin-independent CZ (err < 1e-13, leak < 1e-14, min|w_R| > 0.20, min|dv_sym| > 0.34)
//              * 77-pulse spin-independent CNOT (err < 1e-13, min|w_R| = 1/sqrt(3), min|dv_sym| = 0.536555)
//              * 547-pulse full 9-spin C^{126} linear-chain Toffoli (||U16 - Toff(x)I2|| < 1e-13, min|dv_sym| = 0.536555)
//     - T2b: Strictly-positive 2-rapidity set w_R in {+1/sqrt(3), +1} (alpha in {+2/3, +1/2}) spin-independent CZ
//            (294 pulses, 0 w=0, 0 negative w_R, 0 continuous angles; leak < 1e-4, ||U4-CZ|| < 0.025, procFid > 0.9995)
//     - T2c: Single-rapidity bare on-dock M_meet alone (E(+2/3) = omega * M_meet^2, w_R = +1/sqrt(3) ONLY) on
//            5 spins C(5,2)=10 -> exact 39/39 = 15 + 24 = su(4) + su(5) Lie closure (alpha=1 SWAP negative control -> 0)
//     - T2d: Exact closed-form Sym^2 doublon dispersion E_2(U), P(U), v_2(U) cross-checked against live M=16
//            2-body exact Bloch diagonalization (< 1e-12 for |k|<=4), breakdown of v_1(U)=v_2(U) at w=0
//            (dv=0.278365 at U=1/2; global peak 0.283301 at U=0.428432), and exact Householder involution F(0)
//
//   PILLAR T3: 1D K-Mirror Crossing-Count Bounds (104 vs C(9,2)=36) & Exact 3-Pass Disentangling 4D CZ
//     - T3a: Verbatim 4D BigInt 18-species (all 9+9 distinct (tone,role)) M_pair = I proof (diff=0, offLine=0, revDiff=0)
//            + exact deterministic 1D point-particle crossing-count bound (4|9|5 -> 104 (+1/+1) crossings on 9 +1
//            particles vs C(9,2)=36; 4|6|5 -> 58 < 77 on 6 +1 particles vs 15; 0-mirror negative controls <= 36, 15).
//            (Crossing-count ceiling only; autonomous circuit compilation remains obstructed by YBE parameter collapse
//             and wavepacket dispersion.)
//     - T3b: Exact 3-pass disentangling 4D CZ identity F(+-sqrt(3)/2)^3 = -I_3 (< 1e-14), live time-domain 3-role (0,1,2)
//            wavepacket evolution over 3 consecutive passes (S_vN: 0.02 -> 1.58 -> 1.58 -> returns to ~0.69 bits,
//            87% elastic recovery, phase 0.95 pi on M = 20), and leading-order / single-beat same-role Sym^2 4D M_pair
//            decay rate gamma = (6/13) * P_off = 0.0042525/beat (tau=235; P_{d=0}=6/13 and P_off are individually exact;
//            multi-beat corrections are O(P_off^2) ~ 8e-5)
//
// Strictly deterministic (zero Math.random()), zero external imports, strict tsc clean, laptop-safe (< 12 s, < 400 MB).

// =================================================================================================
// 0. HARNESS, COMPLEX/REAL LINEAR ALGEBRA, JACOBI EIGENSOLVER, & EXACT 4D Z[zeta_9][1/6] KERNEL
// =================================================================================================

interface CheckRow {
  readonly pillar: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(pillar: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ pillar, name, passed, detail })
}

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

const PI = Math.PI
const SQRT2 = Math.SQRT2
const SQRT3 = Math.sqrt(3)
const ISQ2 = Math.SQRT1_2
const ISQ6 = 1 / Math.sqrt(6)

type C = readonly [number, number]
const C_ZERO: C = [0, 0]
const C_ONE: C = [1, 0]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cConj = (a: C): C => [a[0], -a[1]]
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cArg = (a: C): number => Math.atan2(a[1], a[0])
const cExpI = (th: number): C => [Math.cos(th), Math.sin(th)]
const cDiv = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1]
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
const wrapPi = (ang: number): number => ((((ang + PI) % (2 * PI)) + 2 * PI) % (2 * PI)) - PI

const W_C: C = [-0.5, SQRT3 / 2]
const W2_C: C = [-0.5, -SQRT3 / 2]
const C_KEEP: C = [0.25, SQRT3 / 4]
const C_CROSS: C = [0.75, -SQRT3 / 4]
const MEET_KEEP: C = [0.25, SQRT3 / 4]
const MEET_SWAP: C = [-0.75, SQRT3 / 4]
const C_MAT: readonly (readonly [C, C])[] = [
  [C_KEEP, C_CROSS],
  [C_CROSS, C_KEEP],
]

type CMat = C[][]

function matEye(n: number): CMat {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? C_ONE : C_ZERO)),
  )
}

function matMul(A: CMat, B: CMat): CMat {
  const n = A.length
  const m = B[0]!.length
  const p = B.length
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => {
      let s: C = C_ZERO
      for (let k = 0; k < p; k++) s = cAdd(s, cMul(A[i]![k]!, B[k]![j]!))
      return s
    }),
  )
}

function matDag(A: CMat): CMat {
  const n = A.length
  const m = A[0]!.length
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => cConj(A[j]![i]!)),
  )
}

function matTrace(A: CMat): C {
  let s: C = C_ZERO
  for (let i = 0; i < A.length; i++) s = cAdd(s, A[i]![i]!)
  return s
}

function matFrobDiff(A: CMat, B: CMat): number {
  let s = 0
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0]!.length; j++) s += cAbs2(cSub(A[i]![j]!, B[i]![j]!))
  }
  return Math.sqrt(s)
}

function matFrobDiffUpToPhase(A: CMat, B: CMat): number {
  let ip: C = C_ZERO
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0]!.length; j++) ip = cAdd(ip, cMul(cConj(A[i]![j]!), B[i]![j]!))
  }
  const ph = cAbs(ip) > 1e-15 ? cExpI(-cArg(ip)) : C_ONE
  let s = 0
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0]!.length; j++) s += cAbs2(cSub(A[i]![j]!, cMul(ph, B[i]![j]!)))
  }
  return Math.sqrt(s)
}

function matUnitaryErr(U: CMat): number {
  return matFrobDiff(matMul(matDag(U), U), matEye(U.length))
}

function toSU2(M: CMat): CMat {
  const det = cSub(cMul(M[0]![0]!, M[1]![1]!), cMul(M[0]![1]!, M[1]![0]!))
  const p = cExpI(-cArg(det) / 2)
  return [
    [cMul(p, M[0]![0]!), cMul(p, M[0]![1]!)],
    [cMul(p, M[1]![0]!), cMul(p, M[1]![1]!)],
  ]
}

const I2: CMat = matEye(2)
const H2: CMat = [[[ISQ2, 0], [ISQ2, 0]], [[ISQ2, 0], [-ISQ2, 0]]]
const T2: CMat = [[C_ONE, C_ZERO], [C_ZERO, cExpI(PI / 4)]]
const Td2: CMat = [[C_ONE, C_ZERO], [C_ZERO, cExpI(-PI / 4)]]
const CZ_EXACT: CMat = [
  [C_ONE, C_ZERO, C_ZERO, C_ZERO],
  [C_ZERO, C_ONE, C_ZERO, C_ZERO],
  [C_ZERO, C_ZERO, C_ONE, C_ZERO],
  [C_ZERO, C_ZERO, C_ZERO, [-1, 0]],
]
const CNOT_EXACT: CMat = [
  [C_ONE, C_ZERO, C_ZERO, C_ZERO],
  [C_ZERO, C_ONE, C_ZERO, C_ZERO],
  [C_ZERO, C_ZERO, C_ZERO, C_ONE],
  [C_ZERO, C_ZERO, C_ONE, C_ZERO],
]

// Exact real symmetric Jacobi eigensolver (returns eigenvalues and columns of V = eigenvectors)
function jacobiSymReal(n: number, Ainit: Float64Array): { readonly evals: Float64Array; readonly evecs: Float64Array } {
  const A = Float64Array.from(Ainit)
  const V = new Float64Array(n * n)
  for (let i = 0; i < n; i++) V[i * n + i] = 1
  const maxSweeps = 80
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let offNorm = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = A[p * n + q]!
        offNorm += apq * apq
      }
    }
    if (offNorm < 1e-26) break
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = A[p * n + q]!
        if (Math.abs(apq) < 1e-15) continue
        const app = A[p * n + p]!
        const aqq = A[q * n + q]!
        const tau = (aqq - app) / (2 * apq)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        A[p * n + p] = app - t * apq
        A[q * n + q] = aqq + t * apq
        A[p * n + q] = 0
        A[q * n + p] = 0
        for (let r = 0; r < n; r++) {
          if (r === p || r === q) continue
          const arp = A[r * n + p]!
          const arq = A[r * n + q]!
          const nrp = c * arp - s * arq
          const nrq = s * arp + c * arq
          A[r * n + p] = nrp; A[p * n + r] = nrp
          A[r * n + q] = nrq; A[q * n + r] = nrq
        }
        for (let r = 0; r < n; r++) {
          const vrp = V[r * n + p]!
          const vrq = V[r * n + q]!
          V[r * n + p] = c * vrp - s * vrq
          V[r * n + q] = s * vrp + c * vrq
        }
      }
    }
  }
  const evals = new Float64Array(n)
  for (let i = 0; i < n; i++) evals[i] = A[i * n + i]!
  return { evals, evecs: V }
}

// Exact Hermitian Jacobi eigensolver (via 2n x 2n real embedding [[Re H, -Im H], [Im H, Re H]] -> exact complex eigenpairs)
function eigenUnitary(n: number, U: CMat): { readonly evals: C[]; readonly evecs: C[][] } {
  // Build Hermitian H = cos(th) * (U + U^dag)/2 + sin(th) * (U - U^dag)/(2i) with non-degenerate generic th = 0.37123
  const ct = Math.cos(0.37123)
  const st = Math.sin(0.37123)
  const R2 = new Float64Array((2 * n) * (2 * n))
  const m2 = 2 * n
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const urc = U[r]![c]!
      const ucr = U[c]![r]!
      // A = (U + U^dag)/2 -> Re: (urc[0]+ucr[0])/2, Im: (urc[1]-ucr[1])/2
      const aRe = 0.5 * (urc[0] + ucr[0])
      const aIm = 0.5 * (urc[1] - ucr[1])
      // B = (U - U^dag)/(2i) -> Re: (urc[1]+ucr[1])/2, Im: -(urc[0]-ucr[0])/2
      const bRe = 0.5 * (urc[1] + ucr[1])
      const bIm = -0.5 * (urc[0] - ucr[0])
      const hRe = ct * aRe + st * bRe
      const hIm = ct * aIm + st * bIm
      R2[r * m2 + c] = hRe
      R2[r * m2 + (n + c)] = -hIm
      R2[(n + r) * m2 + c] = hIm
      R2[(n + r) * m2 + (n + c)] = hRe
    }
  }
  const { evals: ev2, evecs: vec2 } = jacobiSymReal(m2, R2)
  // Extract n orthonormal complex eigenvectors from the 2n doubled real eigenvectors
  const order = Array.from({ length: m2 }, (_, i) => i).sort((a, b) => ev2[a]! - ev2[b]!)
  const basis: C[][] = []
  for (const col of order) {
    if (basis.length === n) break
    const v: C[] = Array.from({ length: n }, (_, r) => [vec2[r * m2 + col]!, vec2[(n + r) * m2 + col]!])
    // Complex Gram-Schmidt against already extracted eigenvectors
    for (const u of basis) {
      let ip: C = C_ZERO
      for (let r = 0; r < n; r++) ip = cAdd(ip, cMul(cConj(u[r]!), v[r]!))
      for (let r = 0; r < n; r++) v[r] = cSub(v[r]!, cMul(ip, u[r]!))
    }
    let n2 = 0
    for (let r = 0; r < n; r++) n2 += cAbs2(v[r]!)
    if (n2 > 0.25) {
      const inv = 1 / Math.sqrt(n2)
      for (let r = 0; r < n; r++) v[r] = cScale(inv, v[r]!)
      basis.push(v)
    }
  }
  assertExact(basis.length === n, `eigenUnitary extracted ${basis.length}/${n} eigenvectors`)
  const evals: C[] = basis.map(v => {
    let lam: C = C_ZERO
    for (let r = 0; r < n; r++) {
      let uv: C = C_ZERO
      for (let c = 0; c < n; c++) uv = cAdd(uv, cMul(U[r]![c]!, v[c]!))
      lam = cAdd(lam, cMul(cConj(v[r]!), uv))
    }
    return lam
  })
  return { evals, evecs: basis }
}

// =================================================================================================
// VERBATIM EXACT Z[zeta_9][1/6], D_4 ROOTS, W(F_4), chi_odd, & O^+(4,1; Z[sqrt(2)]) {3,4,3,4} KERNEL
// =================================================================================================

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type AntipodalLine = readonly [number, number]
type Q2 = readonly [bigint, bigint]
type ToneNZ = -1 | 1
type Vibe = readonly [dock: number, slot: number, tone: ToneNZ, role: number]
interface ExactState {
  readonly amp: Map<string, Z9>
  readonly den: bigint
}
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
      perm[slot] = ROOTS.findIndex(
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
      if (!seen.has(key)) { seen.add(key); facetNormals.push(next) }
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
const dockCenters: (readonly Q2[])[] = [BASE_CENTER]
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
    dockCenters.push(nextCenter)
    dockParity.push(-dockParity[dock]!)
    hcNeighbors.push(new Int32Array(24).fill(-1))
  }
  hcNeighbors[dock]![slot] = nextId
  hcNeighbors[nextId]![OPPOSITE_SLOT[slot]!] = dock
  return nextId
}

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
function basisKet(vibes: readonly Vibe[]): ExactState {
  const map = new Map<string, Z9>()
  addAmpZ9(map, encodeConfig(vibes), Z9_ONE)
  return { amp: map, den: 1n }
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
const applyBeatSkip = (s: ExactState, skip: LayerOp): ExactState =>
  BEAT_LAYERS.reduce((c, f) => (f === skip ? c : f(c, false)), s)

// =================================================================================================
// VERBATIM 3-SPIN DFS EXCHANGE GENERATORS & U4d 53/54-STEP SPIN-INDEPENDENT CZ/CNOT BUILDERS
// =================================================================================================

type PairPulse1Q = readonly [0 | 1, number]
type AdjPulse = readonly [number, number, number]

function rotAxis(nx: number, ny: number, nz: number, ang: number): CMat {
  const c = Math.cos(ang / 2)
  const s = Math.sin(ang / 2)
  return [
    [[c, -s * nz], [-s * ny, -s * nx]],
    [[s * ny, -s * nx], [c, s * nz]],
  ]
}
const dfsGen12 = (a: number): CMat => rotAxis(0, 0, -1, PI * a)
const dfsGen01 = (b: number): CMat => rotAxis(SQRT3 / 2, 0, 0.5, PI * b)

function synth1Q_DFS(Uin: CMat, betaOrder: readonly number[]): readonly PairPulse1Q[] {
  const U = toSU2(Uin)
  const try3 = (T: CMat): PairPulse1Q[] | null => {
    if (cAbs(T[0]![1]!) < 1e-13) {
      const a = wrapPi(2 * cArg(T[0]![0]!)) / PI
      return Math.abs(a) < 1e-13 ? [] : [[1, a]]
    }
    const s2 = cAbs2(T[0]![1]!) / 0.75
    if (s2 > 1 + 1e-12) return null
    const b = (2 / PI) * Math.asin(Math.sqrt(Math.min(1, s2)))
    const M = dfsGen01(b)
    const apc = wrapPi(cArg(T[0]![0]!) - cArg(M[0]![0]!)) * (2 / PI)
    const amc = wrapPi(cArg(T[0]![1]!) - cArg(M[0]![1]!)) * (2 / PI)
    const a = 0.5 * (apc + amc)
    const c = 0.5 * (apc - amc)
    const seq: PairPulse1Q[] = []
    if (Math.abs(c) > 1e-13) seq.push([1, c])
    if (Math.abs(b) > 1e-13) seq.push([0, b])
    if (Math.abs(a) > 1e-13) seq.push([1, a])
    return seq
  }
  const r3 = try3(U)
  if (r3) return r3
  for (const beta of betaOrder) {
    const r = try3(matMul(dfsGen01(beta), U))
    if (r) return [...r, [0, -beta]]
  }
  throw new Error('synth1Q_DFS failed')
}

const bQB = (2 / PI) * Math.asin(1 / Math.sqrt(6))
const aQB = (() => {
  const wL0: C = [-Math.sqrt(6) / 4, SQRT2 / 2]
  const wL1: C = [-1 / (2 * SQRT2), 0]
  const E34 = dfsGen01(bQB)
  const qNum = cMul(E34[1]![1]!, wL1)
  const qDen = cMul(E34[1]![0]!, wL0)
  return cArg(cDiv([-qNum[0], -qNum[1]], qDen)) / PI
})()
const Rn_B: CMat = [
  [[9 / 16, 0], [(-5 * SQRT3) / 16, 5 / 8]],
  [[(-5 * SQRT3) / 16, -5 / 8], [-9 / 16, 0]],
]
const Q_cz_B: CMat = (() => {
  const th = Math.acos(9 / 16)
  const ph = Math.atan2(-5 / 8, (-5 * SQRT3) / 16)
  const vP: readonly [C, C] = [[Math.cos(th / 2), 0], cScale(Math.sin(th / 2), cExpI(ph))]
  const vM: readonly [C, C] = [[-Math.sin(th / 2), 0], cScale(Math.cos(th / 2), cExpI(ph))]
  return [
    [cConj(vP[0]), cConj(vP[1])],
    [cConj(vM[0]), cConj(vM[1])],
  ]
})()
const Q_cnot_B = matMul(H2, Q_cz_B)
const Q_B_MAT = matMul(dfsGen01(bQB), dfsGen12(aQB))

function buildSpinIndep2Q(
  s1: number, s2: number, s3: number, s4: number, s5: number,
  right1Q: readonly PairPulse1Q[], left1Q: readonly PairPulse1Q[],
  replaceSwapsWithHalfSq: boolean,
): readonly AdjPulse[] {
  const expandSwap = (p: number, q: number, a: number): readonly AdjPulse[] => {
    if (replaceSwapsWithHalfSq && Math.abs(Math.abs(a) - 1) < 1e-12) {
      return [[p, q, 0.5], [p, q, 0.5]]
    }
    return [[p, q, a]]
  }
  const w0Raw: readonly AdjPulse[] = [
    [s2, s3, 1],
    [s3, s4, 2 / 3],
    [s4, s5, 1],
    [s3, s4, -2 / 3],
    [s2, s3, 1],
  ]
  const w0: AdjPulse[] = w0Raw.flatMap(([p, q, a]) => expandSwap(p, q, a))
  const w0Dag: AdjPulse[] = w0Raw.slice().reverse().flatMap(([p, q, a]) => expandSwap(p, q, -a))
  const mapB = (seq: readonly PairPulse1Q[]): AdjPulse[] =>
    seq.flatMap(([w, a]) => expandSwap(w === 1 ? s4 : s3, w === 1 ? s5 : s4, a))
  const u4: readonly AdjPulse[] = [
    ...w0,
    [s4, s5, aQB],
    [s3, s4, bQB],
    ...expandSwap(s4, s5, 1),
    [s3, s4, -bQB],
    [s4, s5, -aQB],
    ...w0Dag,
  ]
  const raw: AdjPulse[] = [
    ...mapB(right1Q),
    ...u4,
    ...expandSwap(s1, s2, 1),
    ...u4,
    ...expandSwap(s1, s2, 1),
    ...u4,
    ...mapB(left1Q),
  ]
  for (const [p, q] of raw) assertExact(q === p + 1, `Non-adjacent pulse [${p},${q}]`)
  return raw
}

// =================================================================================================
// PILLAR T1: EXACT S_6 ROLE-BLOCK NO-GO & ALTERNATING S_3(2,1) | S_5(3,2) ARBITRARY-n UNIVERSALITY
// =================================================================================================

// Exact symmetric group enumeration (permutations stored as Uint8Array(N), perm[pos] = role)
interface SymGroup {
  readonly n: number
  readonly order: number
  readonly perms: readonly Uint8Array[]
  readonly parity: Int8Array // +1 even, -1 odd
  readonly keyToIdx: Map<string, number>
  readonly adjLeft: readonly Int32Array[] // left-swap spatial positions (k, k+1)
  readonly adjRight: readonly Int32Array[] // right-swap role labels (k, k+1)
}

function buildSymGroup(n: number): SymGroup {
  const perms: Uint8Array[] = []
  const parityArr: number[] = []
  const cur = new Uint8Array(n)
  const used = new Uint8Array(n)
  const rec = (depth: number, inv: number): void => {
    if (depth === n) {
      perms.push(Uint8Array.from(cur))
      parityArr.push(inv % 2 === 0 ? 1 : -1)
      return
    }
    for (let v = 0; v < n; v++) {
      if (used[v]) continue
      let addInv = 0
      for (let prev = 0; prev < depth; prev++) if (cur[prev]! > v) addInv++
      used[v] = 1
      cur[depth] = v
      rec(depth + 1, inv + addInv)
      used[v] = 0
    }
  }
  rec(0, 0)
  const order = perms.length
  const keyToIdx = new Map<string, number>()
  for (let i = 0; i < order; i++) keyToIdx.set(perms[i]!.join(','), i)
  const adjLeft: Int32Array[] = []
  const adjRight: Int32Array[] = []
  for (let k = 0; k < n - 1; k++) {
    const tblL = new Int32Array(order)
    const tblR = new Int32Array(order)
    for (let i = 0; i < order; i++) {
      const p = perms[i]!
      const qL = Uint8Array.from(p)
      const tmp = qL[k]!; qL[k] = qL[k + 1]!; qL[k + 1] = tmp
      tblL[i] = keyToIdx.get(qL.join(','))!
      const qR = Uint8Array.from(p)
      for (let pos = 0; pos < n; pos++) {
        if (qR[pos] === k) qR[pos] = k + 1
        else if (qR[pos] === k + 1) qR[pos] = k
      }
      tblR[i] = keyToIdx.get(qR.join(','))!
    }
    adjLeft.push(tblL)
    adjRight.push(tblR)
  }
  return { n, order, perms, parity: Int8Array.from(parityArr), keyToIdx, adjLeft, adjRight }
}

// Compute exact Lie algebra closure Lie_R({i P_{k,k+1}}) inside C[S_N]:
// Every element has purely REAL coeff on even perms and purely IMAG coeff on odd perms,
// stored as a single Float64Array(N!) where value(sigma) = (parity===1 ? v : i*v).
// Commutator [X, i P_k] in C[S_N] (left multiplication vs right multiplication in group algebra):
//   In C[S_N], (X * (i P_k) - (i P_k) * X) on basis element sigma:
//     (sigma) * (i P_k) = i * (sigma o s_k)  [adjLeft? Wait: s_k(pos) swaps positions k,k+1!]
//     Check: let tau = s_k act on left (swapping positions -> adjLeft) vs right (swapping values -> adjRight).
//     Specifically, if sigma represents permutation pos -> sigma(pos), then:
//       (s_k o sigma)(pos) = s_k(sigma(pos)) = adjRight[k][sigma],
//       (sigma o s_k)(pos) = sigma(s_k(pos)) = adjLeft[k][sigma].
//     And signs when multiplying X_sigma * (i s_k):
//       - If sigma is EVEN (real r): (r sigma)(i s_k) = i r (sigma s_k) [odd, imag +r]
//       - If sigma is ODD (i m):     (i m sigma)(i s_k) = -m (sigma s_k) [even, real -m]!
//     Wait: both X * (i s_k) and (i s_k) * X obey the EXACT same real/imag rule!
function computeGroupAlgLieClosure(G: SymGroup): {
  readonly basisEven: readonly Float64Array[]
  readonly basisOdd: readonly Float64Array[]
  readonly totalDim: number
} {
  const N = G.order
  const par = G.parity
  const evenBasis: Float64Array[] = []
  const oddBasis: Float64Array[] = []
  const queue: { readonly vec: Float64Array; readonly isOdd: boolean }[] = []

  const addVec = (raw: Float64Array, isOdd: boolean): void => {
    const target = isOdd ? oddBasis : evenBasis
    const v = Float64Array.from(raw)
    for (const b of target) {
      let dot = 0
      for (let i = 0; i < N; i++) dot += b[i]! * v[i]!
      if (dot !== 0) for (let i = 0; i < N; i++) v[i] = v[i]! - dot * b[i]!
    }
    let n2 = 0
    for (let i = 0; i < N; i++) n2 += v[i]! * v[i]!
    if (n2 > 1e-12) {
      const inv = 1 / Math.sqrt(n2)
      for (let i = 0; i < N; i++) v[i] = v[i]! * inv
      target.push(v)
      queue.push({ vec: v, isOdd })
    }
  }

  // Generators: i * s_k (k = 0..n-2), where s_k is the transposition (k, k+1)
  const idIdx = G.keyToIdx.get(Array.from({ length: G.n }, (_, i) => i).join(','))!
  for (let k = 0; k < G.n - 1; k++) {
    const skIdx = G.adjLeft[k]![idIdx]!
    assertExact(par[skIdx] === -1, `s_${k} parity`)
    const g = new Float64Array(N)
    g[skIdx] = 1
    addVec(g, true)
  }

  // Commute BFS queue with all generators i * s_k
  for (let head = 0; head < queue.length; head++) {
    const { vec, isOdd } = queue[head]!
    const multSign = isOdd ? -1 : 1
    for (let k = 0; k < G.n - 1; k++) {
      const tblL = G.adjLeft[k]!
      const tblR = G.adjRight[k]!
      const out = new Float64Array(N)
      for (let i = 0; i < N; i++) {
        const val = vec[i]!
        if (val === 0) continue
        // [vec, i s_k] = vec * (i s_k) - (i s_k) * vec
        // sigma * s_k = tblL[sigma], s_k * sigma = tblR[sigma]
        const sVal = multSign * val
        out[tblL[i]!] = out[tblL[i]!]! + sVal
        out[tblR[i]!] = out[tblR[i]!]! - sVal
      }
      addVec(out, !isOdd)
    }
  }
  return { basisEven: evenBasis, basisOdd: oddBasis, totalDim: evenBasis.length + oddBasis.length }
}

// Exact Integer Murnaghan-Nakayama Character Table Engine (via beta-number abacus)
type Partition = readonly number[]

function generatePartitions(n: number): Partition[] {
  const res: Partition[] = []
  const rec = (rem: number, maxPart: number, cur: number[]): void => {
    if (rem === 0) { res.push(cur.slice()); return }
    for (let p = Math.min(rem, maxPart); p >= 1; p--) {
      cur.push(p)
      rec(rem - p, p, cur)
      cur.pop()
    }
  }
  rec(n, n, [])
  return res
}

function conjugatePartition(p: Partition): Partition {
  if (p.length === 0) return []
  const cols = p[0]!
  const out: number[] = []
  for (let c = 1; c <= cols; c++) {
    let h = 0
    for (const row of p) if (row >= c) h++
    out.push(h)
  }
  return out
}

function isHookPartition(p: Partition): boolean {
  return p.length <= 1 || p[1]! <= 1
}

function partKey(p: Partition): string {
  return p.join(',')
}

function factorial(n: number): number {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function conjugacyClassSize(n: number, mu: Partition): number {
  const counts = new Map<number, number>()
  for (const c of mu) counts.set(c, (counts.get(c) ?? 0) + 1)
  let denom = 1
  for (const [len, m] of counts) denom *= Math.pow(len, m) * factorial(m)
  return Math.round(factorial(n) / denom)
}

interface CharTable {
  readonly n: number
  readonly fact: number
  readonly parts: readonly Partition[]
  readonly partToIdx: Map<string, number>
  readonly classSizes: readonly number[]
  readonly table: readonly (readonly number[])[] // table[irrepIdx][classIdx]
  readonly dims: readonly number[]
}

function buildCharTable(n: number): CharTable {
  const parts = generatePartitions(n)
  const partToIdx = new Map<string, number>()
  parts.forEach((p, i) => partToIdx.set(partKey(p), i))
  const classSizes = parts.map(mu => conjugacyClassSize(n, mu))
  const fact = factorial(n)

  const mnMemo = new Map<string, number>()
  const evalMN = (beta: readonly number[], mu: Partition, muPos: number): number => {
    if (muPos === mu.length) return 1
    const key = `${beta.join(',')}|${mu.slice(muPos).join(',')}`
    const cached = mnMemo.get(key)
    if (cached !== undefined) return cached
    const k = mu[muPos]!
    let sum = 0
    const occ = new Set<number>(beta)
    for (let i = 0; i < beta.length; i++) {
      const b = beta[i]!
      const target = b - k
      if (target < 0 || occ.has(target)) continue
      let ht = 0
      for (let j = 0; j < beta.length; j++) {
        const bj = beta[j]!
        if (bj > target && bj < b) ht++
      }
      const nextBeta = beta.slice()
      nextBeta[i] = target
      nextBeta.sort((x, y) => y - x)
      const sub = evalMN(nextBeta, mu, muPos + 1)
      sum += ht % 2 === 0 ? sub : -sub
    }
    mnMemo.set(key, sum)
    return sum
  }

  const table: number[][] = parts.map(lam => {
    // Pad partition to length n for beta-numbers beta_i = lam_i + n - 1 - i
    const beta: number[] = []
    for (let i = 0; i < n; i++) beta.push((lam[i] ?? 0) + (n - 1 - i))
    return parts.map(mu => evalMN(beta, mu, 0))
  })
  const idClassIdx = partToIdx.get(Array.from({ length: n }, () => 1).join(','))!
  const dims = table.map(row => row[idClassIdx]!)

  // Self-certify exact character row orthogonality!
  for (let a = 0; a < parts.length; a++) {
    for (let b = a; b < parts.length; b++) {
      let ip = 0
      for (let c = 0; c < parts.length; c++) ip += classSizes[c]! * table[a]![c]! * table[b]![c]!
      assertExact(ip === (a === b ? fact : 0), `S_${n} char ortho fail (${a},${b}): ${ip}`)
    }
  }
  return { n, fact, parts, partToIdx, classSizes, table, dims }
}

interface InducedIrrepRow {
  readonly lambda: Partition
  readonly dim: number
  readonly isHook: boolean
  readonly isSelfConj: boolean
  readonly mW: number
  readonly mTauW: number
}

function decomposeInduced(
  ctA: CharTable, lamA: Partition,
  ctB: CharTable, lamB: Partition,
  ctAB: CharTable,
): {
  readonly dimW: number
  readonly dimInd: number
  readonly wOrthogonalTauW: boolean
  readonly rows: readonly InducedIrrepRow[]
  readonly hookCount: number
  readonly selfConjCount: number
  readonly allFitMarin: boolean
  readonly allMultOne: boolean
} {
  assertExact(ctA.n + ctB.n === ctAB.n, 'induced group sizes')
  const iA = ctA.partToIdx.get(partKey(lamA))!
  const iB = ctB.partToIdx.get(partKey(lamB))!
  const conjA = conjugatePartition(lamA)
  const conjB = conjugatePartition(lamB)
  const iAc = ctA.partToIdx.get(partKey(conjA))!
  const iBc = ctB.partToIdx.get(partKey(conjB))!
  const dimW = ctA.dims[iA]! * ctB.dims[iB]!
  const wOrthogonalTauW = iA !== iAc || iB !== iBc
  const denom = ctA.fact * ctB.fact

  const rows: InducedIrrepRow[] = []
  let dimInd = 0
  for (let lIdx = 0; lIdx < ctAB.parts.length; lIdx++) {
    let sumW = 0
    let sumTau = 0
    for (let ca = 0; ca < ctA.parts.length; ca++) {
      const szA = ctA.classSizes[ca]!
      const chiA = ctA.table[iA]![ca]!
      const chiAc = ctA.table[iAc]![ca]!
      const muA = ctA.parts[ca]!
      for (let cb = 0; cb < ctB.parts.length; cb++) {
        const szB = ctB.classSizes[cb]!
        const muAB = [...muA, ...ctB.parts[cb]!].sort((x, y) => y - x)
        const cAB = ctAB.partToIdx.get(partKey(muAB))!
        const chiL = ctAB.table[lIdx]![cAB]!
        const w = szA * szB * chiL
        sumW += w * chiA * ctB.table[iB]![cb]!
        sumTau += w * chiAc * ctB.table[iBc]![cb]!
      }
    }
    assertExact(sumW % denom === 0 && sumTau % denom === 0, `exact LR divisibility fail at ${partKey(ctAB.parts[lIdx]!)}`)
    const mW = sumW / denom
    const mTauW = sumTau / denom
    if (mW > 0) {
      const lam = ctAB.parts[lIdx]!
      const dim = ctAB.dims[lIdx]!
      dimInd += mW * dim
      rows.push({
        lambda: lam,
        dim,
        isHook: isHookPartition(lam),
        isSelfConj: partKey(lam) === partKey(conjugatePartition(lam)),
        mW,
        mTauW,
      })
    }
  }
  const hookCount = rows.filter(r => r.isHook).length
  const selfConjCount = rows.filter(r => r.isSelfConj).length
  const allFitMarin = rows.every(r =>
    wOrthogonalTauW ? dimW * r.mW + dimW * r.mTauW <= r.dim : dimW * r.mW <= r.dim,
  )
  const allMultOne = rows.every(r => r.mW === 1)
  return { dimW, dimInd, wOrthogonalTauW, rows, hookCount, selfConjCount, allFitMarin, allMultOne }
}

function runPillarT1(): void {
  console.log('================================================================================')
  console.log('PILLAR T1: S_6 ROLE-BLOCK NO-GO & ALTERNATING S_3(2,1) | S_5(3,2) MARIN UNIVERSALITY')
  console.log('================================================================================')

  // -----------------------------------------------------------------------------------------------
  // T1a: Direct C^{720} = C[S_6] Evolution of U4d's 53-Step CZ on Localized Q_0={0,1,2}, Q_1={3,4,5}
  // -----------------------------------------------------------------------------------------------
  const S6 = buildSymGroup(6)
  // Build localized orthonormal states |a>_A (x) |b>_B inside C[S_3({0,1,2}) x S_3({3,4,5})] subset C[S_6]:
  // Inside S_3({0,1,2}) (6 perms): marker role 0 symmetrized over roles {1,2}:
  //   |pos0> = (|0,1,2> + |0,2,1>)/sqrt(2), |pos1> = (|1,0,2> + |2,0,1>)/sqrt(2), |pos2> = (|1,2,0> + |2,1,0>)/sqrt(2)
  //   |0_A> = (|pos1> - |pos2>)/sqrt(2),  |1_A> = (2|pos0> - |pos1> - |pos2>)/sqrt(6)
  const makeBlock3 = (roles: readonly [number, number, number]): readonly (readonly (readonly [readonly [number, number, number], number])[])[] => {
    const [r0, r1, r2] = roles
    const p0: readonly (readonly [readonly [number, number, number], number])[] = [[[r0, r1, r2], ISQ2], [[r0, r2, r1], ISQ2]]
    const p1: readonly (readonly [readonly [number, number, number], number])[] = [[[r1, r0, r2], ISQ2], [[r2, r0, r1], ISQ2]]
    const p2: readonly (readonly [readonly [number, number, number], number])[] = [[[r1, r2, r0], ISQ2], [[r2, r1, r0], ISQ2]]
    const state0: (readonly [readonly [number, number, number], number])[] = [
      ...p1.map(([t, c]) => [t, c * ISQ2] as const),
      ...p2.map(([t, c]) => [t, -c * ISQ2] as const),
    ]
    const state1: (readonly [readonly [number, number, number], number])[] = [
      ...p0.map(([t, c]) => [t, c * 2 * ISQ6] as const),
      ...p1.map(([t, c]) => [t, -c * ISQ6] as const),
      ...p2.map(([t, c]) => [t, -c * ISQ6] as const),
    ]
    return [state0, state1]
  }
  const blockA = makeBlock3([0, 1, 2])
  const blockB = makeBlock3([3, 4, 5])
  const wKets720: Float64Array[] = []
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const v = new Float64Array(720)
      for (const [pA, cA] of blockA[a]!) {
        for (const [pB, cB] of blockB[b]!) {
          const idx = S6.keyToIdx.get(`${pA[0]},${pA[1]},${pA[2]},${pB[0]},${pB[1]},${pB[2]}`)!
          v[idx] = v[idx]! + cA * cB
        }
      }
      wKets720.push(v)
    }
  }
  // Verify exact orthonormality of W_0 = (2,1) x (2,1) inside C^{720}
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let d = 0
      for (let k = 0; k < 720; k++) d += wKets720[i]![k]! * wKets720[j]![k]!
      assertExact(Math.abs(d - (i === j ? 1 : 0)) < 1e-13, `W0 ortho (${i},${j})=${d}`)
    }
  }

  // Precompute indicator of block-preserving permutations: sigma({0,1,2}) = {0,1,2}
  const inBlock6 = new Uint8Array(720)
  for (let i = 0; i < 720; i++) {
    const p = S6.perms[i]!
    if (p[0]! < 3 && p[1]! < 3 && p[2]! < 3) inBlock6[i] = 1
  }

  const rightCZ_orig = synth1Q_DFS(matDag(Q_cz_B), [1, 0.5, -0.5])
  const leftCZ_orig = synth1Q_DFS(matMul(Q_cz_B, Rn_B), [1, 0.5, -0.5])
  const cz53 = buildSpinIndep2Q(1, 2, 3, 4, 5, rightCZ_orig, leftCZ_orig, false)
  assertExact(cz53.length === 53, `U4d CZ pulse count ${cz53.length}`)

  // Evolve all 4 basis states of W_0 directly on C^{720} under U4d's 53-step CZ
  const stRe = new Float64Array(4 * 720)
  const stIm = new Float64Array(4 * 720)
  for (let c = 0; c < 4; c++) for (let i = 0; i < 720; i++) stRe[c * 720 + i] = wKets720[c]![i]!
  for (const [p, _q, alpha] of cz53) {
    const perm = S6.adjLeft[p]!
    const ph = cExpI(PI * alpha)
    const cIr = 0.5 * (1 + ph[0]); const cIi = 0.5 * ph[1]
    const cPr = 0.5 * (1 - ph[0]); const cPi = -0.5 * ph[1]
    for (let c = 0; c < 4; c++) {
      const off = c * 720
      for (let i = 0; i < 720; i++) {
        const j = perm[i]!
        if (j <= i) continue
        const ir = stRe[off + i]!; const ii = stIm[off + i]!
        const jr = stRe[off + j]!; const ji = stIm[off + j]!
        stRe[off + i] = cIr * ir - cIi * ii + cPr * jr - cPi * ji
        stIm[off + i] = cIr * ii + cIi * ir + cPr * ji + cPi * jr
        stRe[off + j] = cIr * jr - cIi * ji + cPr * ir - cPi * ii
        stIm[off + j] = cIr * ji + cIi * jr + cPr * ii + cPi * ir
      }
    }
  }
  const pStay: number[] = []
  const pNorm720: number[] = []
  for (let c = 0; c < 4; c++) {
    const off = c * 720
    let stay = 0; let tot = 0
    for (let i = 0; i < 720; i++) {
      const w = stRe[off + i]! ** 2 + stIm[off + i]! ** 2
      tot += w
      if (inBlock6[i]) stay += w
    }
    pStay.push(stay)
    pNorm720.push(tot)
    assertExact(Math.abs(tot - 1) < 1e-12, `C720 norm err ${tot}`)
  }

  // -----------------------------------------------------------------------------------------------
  // T1b: Exact Lie Algebra Closure Dims in C[S_N] (S_3, S_4, S_5, S_6) & Exact S_6 Stabilizer Theorem 1B
  // -----------------------------------------------------------------------------------------------
  const lieS3 = computeGroupAlgLieClosure(buildSymGroup(3))
  const lieS4 = computeGroupAlgLieClosure(buildSymGroup(4))
  const lieS5 = computeGroupAlgLieClosure(buildSymGroup(5))
  const lieS6 = computeGroupAlgLieClosure(S6)

  // Compute exact leakage-free stabilizer of W_0 = (2,1) x (2,1) inside the 249-dim Lie algebra g_6:
  // Because W_0 is real, EVEN basis elements produce real vectors B|w_c> and ODD basis elements produce purely
  // imaginary vectors i * (B|w_c>), so the leakage constraint decouples strictly into EVEN and ODD sectors!
  const findStabilizerEffDim = (basis: readonly Float64Array[], isOdd: boolean) => {
    const m = basis.length
    // Compute B_a |w_c> on C^{720}: for B_a = sum_tau coeff(tau) * tau (left action: (tau * v)[sigma] = v[tau^{-1} sigma])
    // Wait: left action of group algebra element X = sum_tau c_tau tau on v = sum_pi v_pi |pi> is:
    //   (X v)[rho] = sum_tau c_tau v[tau^{-1} rho] = sum_pi c_{rho pi^{-1}} v_pi!
    // Let's precompute inverse perm and composition for S_6 (720) — NO, only 36 nonzero entries in |w_c>!
    // EVEN BETTER: wKets720[c] has ONLY 12 or 18 nonzero entries!!
    // Build compact nonzero lists for wKets720[0..3]!
    const nzW: (readonly (readonly [number, number])[])[] = wKets720.map(v => {
      const list: (readonly [number, number])[] = []
      for (let i = 0; i < 720; i++) if (Math.abs(v[i]!) > 1e-15) list.push([i, v[i]!])
      return list
    })
    // Compute left-multiplication product table only for the 36 permutations in S_3 x S_3:
    // For tau in S_6 and pi in S_3 x S_3: (tau o pi)(pos) = tau(pi(pos))!
    // Wait: in S6, adjLeft[k] swapped spatial positions (k, k+1), which is RIGHT multiplication (pi o s_k)(pos) = pi(s_k(pos))!
    // So the spatial exchange algebra acts by RIGHT multiplication on perm[pos] = role:
    //   (E_{pq} acts on spatial positions -> pi |-> pi o s_k -> in C[S_6], basis element tau acts by pi |-> pi o tau)!
    //   Verify: (pi o (tau_1 o tau_2))(pos) = pi(tau_1(tau_2(pos))), so applying tau_2 then tau_1 multiplies on the right by tau_1 o tau_2!
    // Collect the unique indices pi appearing in W_0 (<= 36)
    const activePi = new Set<number>()
    for (const list of nzW) for (const [idx] of list) activePi.add(idx)
    const piList = [...activePi]
    const piPosMap = new Map<number, number>()
    piList.forEach((p, idx) => piPosMap.set(p, idx))
    // Precompute rightMul[piSlot * 720 + tau] = idx(pi o tau), where (pi o tau)(pos) = pi[tau[pos]]
    const rightMul = new Int32Array(piList.length * 720)
    for (let ps = 0; ps < piList.length; ps++) {
      const pi = S6.perms[piList[ps]!]!
      for (let t = 0; t < 720; t++) {
        const tau = S6.perms[t]!
        const k = `${pi[tau[0]!]!},${pi[tau[1]!]!},${pi[tau[2]!]!},${pi[tau[3]!]!},${pi[tau[4]!]!},${pi[tau[5]!]!}`
        rightMul[ps * 720 + t] = S6.keyToIdx.get(k)!
      }
    }

    // For each basis element a = 0..m-1, compute:
    //   1) its 4x4 projection M_a[r, c] = <w_r | B_a | w_c> (stored as 16 real numbers; multiply by i if isOdd)
    //   2) its leakage vector L_a in R^{4 * 720} = (I - Pi_{W_0}) B_a |w_c>
    const Mproj = new Float64Array(m * 16)
    const Lvecs = new Float64Array(m * 4 * 720)
    const tmp = new Float64Array(720)
    for (let a = 0; a < m; a++) {
      const ba = basis[a]!
      const nzB: number[] = []
      for (let t = 0; t < 720; t++) if (Math.abs(ba[t]!) > 1e-15) nzB.push(t)
      for (let c = 0; c < 4; c++) {
        tmp.fill(0)
        for (const [piIdx, wVal] of nzW[c]!) {
          const psOff = piPosMap.get(piIdx)! * 720
          for (const t of nzB) {
            const dst = rightMul[psOff + t]!
            tmp[dst] = tmp[dst]! + wVal * ba[t]!
          }
        }
        // Project onto W_0 and subtract to obtain exact leakage vector
        for (let r = 0; r < 4; r++) {
          let ip = 0
          for (const [idx, wVal] of nzW[r]!) ip += wVal * tmp[idx]!
          Mproj[a * 16 + r * 4 + c] = ip
          for (const [idx, wVal] of nzW[r]!) tmp[idx] = tmp[idx]! - ip * wVal
        }
        Lvecs.set(tmp, a * 2880 + c * 720)
      }
    }

    // Gram matrix G_{ab} = L_a . L_b (m x m real symmetric PSD)
    const G = new Float64Array(m * m)
    for (let a = 0; a < m; a++) {
      const oa = a * 2880
      for (let b = a; b < m; b++) {
        const ob = b * 2880
        let s = 0
        for (let i = 0; i < 2880; i++) s += Lvecs[oa + i]! * Lvecs[ob + i]!
        G[a * m + b] = s
        G[b * m + a] = s
      }
    }
    const { evals, evecs } = jacobiSymReal(m, G)
    const effBasis: Float64Array[] = []
    let kerDim = 0
    for (let col = 0; col < m; col++) {
      if (evals[col]! > 1e-9) continue
      kerDim++
      const M16 = new Float64Array(16)
      for (let a = 0; a < m; a++) {
        const coeff = evecs[a * m + col]!
        if (Math.abs(coeff) < 1e-15) continue
        for (let k = 0; k < 16; k++) M16[k] = M16[k]! + coeff * Mproj[a * 16 + k]!
      }
      // Orthonormalize effective 4x4 matrices
      for (const b of effBasis) {
        let dot = 0
        for (let k = 0; k < 16; k++) dot += b[k]! * M16[k]!
        for (let k = 0; k < 16; k++) M16[k] = M16[k]! - dot * b[k]!
      }
      let n2 = 0
      for (let k = 0; k < 16; k++) n2 += M16[k]! * M16[k]!
      if (n2 > 1e-10) {
        const inv = 1 / Math.sqrt(n2)
        for (let k = 0; k < 16; k++) M16[k] = M16[k]! * inv
        effBasis.push(M16)
      }
    }
    // Verify EVERY effective matrix is strictly local (zero projection onto all 9 non-local Pauli tensors!)
    const paulis: readonly CMat[] = [
      I2,
      [[C_ZERO, C_ONE], [C_ONE, C_ZERO]],
      [[C_ZERO, [0, -1]], [[0, 1], C_ZERO]],
      [[C_ONE, C_ZERO], [C_ZERO, [-1, 0]]],
    ]
    let maxNonLocal = 0
    for (const M16 of effBasis) {
      for (let pa = 1; pa <= 3; pa++) {
        for (let pb = 1; pb <= 3; pb++) {
          let trR = 0; let trI = 0
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              const pVal = cMul(paulis[pa]![r >> 1]![c >> 1]!, paulis[pb]![r & 1]![c & 1]!)
              // M_mat[c, r] * P[r, c] (M is real if !isOdd, i*real if isOdd)
              const mv = M16[c * 4 + r]!
              const mr = isOdd ? 0 : mv
              const mi = isOdd ? mv : 0
              trR += mr * pVal[0] - mi * pVal[1]
              trI += mr * pVal[1] + mi * pVal[0]
            }
          }
          maxNonLocal = Math.max(maxNonLocal, Math.hypot(trR, trI))
        }
      }
    }
    return { kerDim, effDim: effBasis.length, maxNonLocal }
  }

  const stabEven = findStabilizerEffDim(lieS6.basisEven, false)
  const stabOdd = findStabilizerEffDim(lieS6.basisOdd, true)
  const s6EffDim = stabEven.effDim + stabOdd.effDim
  const s6MaxNonLocal = Math.max(stabEven.maxNonLocal, stabOdd.maxNonLocal)

  // -----------------------------------------------------------------------------------------------
  // T1c: Exact Murnaghan-Nakayama & Littlewood-Richardson for S_6, S_8 (8-role!), and S_9 (9-role!)
  // -----------------------------------------------------------------------------------------------
  const ct3 = buildCharTable(3)
  const ct4 = buildCharTable(4)
  const ct5 = buildCharTable(5)
  const ct6 = buildCharTable(6)
  const ct8 = buildCharTable(8)
  const ct9 = buildCharTable(9)

  const decS6 = decomposeInduced(ct3, [2, 1], ct3, [2, 1], ct6)
  const decS8 = decomposeInduced(ct3, [2, 1], ct5, [3, 2], ct8)
  const decS9 = decomposeInduced(ct4, [2, 2], ct5, [3, 2], ct9)

  const expectedS8Irreps = [
    '5,3', '5,2,1', '4,4', '4,3,1', '4,2,2', '4,2,1,1', '3,3,2', '3,3,1,1', '3,2,2,1',
  ]
  const gotS8Irreps = decS8.rows.map(r => partKey(r.lambda))
  const s8IrrepMatch =
    gotS8Irreps.length === expectedS8Irreps.length &&
    expectedS8Irreps.every(k => gotS8Irreps.includes(k))

  console.log(`  [T1a] Negative Control — U4d 53-Step CZ Directly on Full C^{720} = C[S_6] (Localized Q_0={0,1,2}, Q_1={3,4,5}):`)
  console.log(`        P_stay(|0,0>)=${pStay[0]!.toFixed(6)} (exact 169/1024=${(169 / 1024).toFixed(6)}, 83.5% role leakage!), P_stay(|0,1>)=${pStay[1]!.toFixed(6)} (exact 841/1024=${(841 / 1024).toFixed(6)})`)
  console.log(`        P_stay(|1,0>)=${pStay[2]!.toFixed(6)}, P_stay(|1,1>)=${pStay[3]!.toFixed(6)} (all C^{720} norms=${pNorm720.map(x => x.toFixed(12)).join(', ')})`)
  console.log(`  [T1b] Exact Lie Algebra Closure dim Lie({i P_{p,p+1}}) in C[S_N] & Theorem 1B Stabilizer in S_6:`)
  console.log(`        S_3 -> ${lieS3.totalDim} | S_4 -> ${lieS4.totalDim} | S_5 -> ${lieS5.totalDim} | S_6 -> ${lieS6.totalDim} (${lieS6.basisEven.length} even + ${lieS6.basisOdd.length} odd)`)
  console.log(`        S_6 block-preserving stabilizer of W=(2,1)x(2,1): kerDim=(${stabEven.kerDim}+${stabOdd.kerDim}), effective action dim=${s6EffDim} (${stabEven.effDim} even + ${stabOdd.effDim} odd = su(2)+su(2)!), maxNonLocalPauli=${s6MaxNonLocal.toExponential(2)} (0 entangling dims!)`)
  console.log(`        Obstruction check via Murnaghan-Nakayama: Ind_{S_3xS_3}^{S_6}((2,1)x(2,1)) dim=${decS6.dimInd}, irreps=${decS6.rows.length}, HOOK IRREPS=${decS6.hookCount} (${decS6.rows.filter(r => r.isHook).map(r => `(${partKey(r.lambda)})`).join(', ')}), W perp tau(W)=${decS6.wOrthogonalTauW}`)
  console.log(`  [T1c] Alternating S_3(2,1) | S_5(3,2) 8-Role 2-Coloring in S_8 (3+5=8 <= 9 roles; Lie-algebraic existence in externally scheduled exchange-gate model):`)
  console.log(`        Ind_{S_3xS_5}^{S_8}((2,1)x(3,2)): dim=${decS8.dimInd}, dim(W)=${decS8.dimW}, W perp tau(W)=${decS8.wOrthogonalTauW}, irreps=${decS8.rows.length}/9, hooks=${decS8.hookCount}, all 10*m(W)+10*m(tau(W))<=dim: ${decS8.allFitMarin}`)
  for (const r of decS8.rows) {
    console.log(`          (${partKey(r.lambda).padEnd(7)}) dim=${String(r.dim).padStart(2)} | m(W)=${r.mW}, m(tauW)=${r.mTauW} | 10*(mW+mTauW)=${String(10 * (r.mW + r.mTauW)).padStart(2)} <= ${r.dim} | hook=${r.isHook}, selfConj=${r.isSelfConj}`)
  }
  console.log(`        -> By Marin's Theorem (2007): exact stabilizer of W in g_8 is u(10) (100 dims, containing all 99 dims of su(10))`)
  console.log(`           (Scope: Lie-algebraic existence in externally scheduled exchange-gate model; no explicit S_8 pulse sequence synthesized here; T2a uses S_3(2,1)|S_3(2,1).)`)
  console.log(`        9-Role Variant S_4(2,2) | S_5(3,2) in S_9: dim=${decS9.dimInd}, irreps=${decS9.rows.length}, hooks=${decS9.hookCount}, selfConj=${decS9.selfConjCount}, all m(W)=1: ${decS9.allMultOne}, W perp tau(W)=${decS9.wOrthogonalTauW}, allFitMarin=${decS9.allFitMarin}`)

  const ok =
    Math.abs(pStay[0]! - 169 / 1024) < 1e-6 &&
    Math.abs(pStay[3]! - 169 / 1024) < 1e-6 &&
    Math.abs(pStay[1]! - 841 / 1024) < 1e-6 &&
    lieS3.totalDim === 4 &&
    lieS4.totalDim === 12 &&
    lieS5.totalDim === 40 &&
    lieS6.totalDim === 249 &&
    s6EffDim === 6 &&
    s6MaxNonLocal < 1e-11 &&
    decS6.dimInd === 80 &&
    decS6.hookCount === 2 &&
    !decS6.wOrthogonalTauW &&
    decS8.dimW === 10 &&
    decS8.dimInd === 560 &&
    decS8.wOrthogonalTauW &&
    decS8.rows.length === 9 &&
    s8IrrepMatch &&
    decS8.hookCount === 0 &&
    decS8.allFitMarin &&
    decS9.dimInd === 1260 &&
    decS9.rows.length === 9 &&
    decS9.hookCount === 0 &&
    decS9.selfConjCount === 0 &&
    decS9.allMultOne &&
    decS9.wOrthogonalTauW &&
    decS9.allFitMarin

  recordCheck(
    'T1',
    'Exact S_6 role-block no-go (83.5% leak, Lie=12/40/249, stab=6=su(2)+su(2)) & S_3(2,1)|S_5(3,2) S_8 / S_4(2,2)|S_5(3,2) S_9 Marin u(10)/su(10) existence',
    ok,
    `P_stay(00,11)=${pStay[0]!.toFixed(6)}, P_stay(01)=${pStay[1]!.toFixed(6)}, Lie=(${lieS4.totalDim},${lieS5.totalDim},${lieS6.totalDim}), S6_eff=${s6EffDim}, S8=(560,9 irr,0 hooks,u(10)/su(10)), S9=(1260,9 irr,0 hooks,0 sc,m=1)`,
  )
}

// =================================================================================================
// PILLAR T2: COMPLETE ELIMINATION OF w = 0 IN THE EXTERNALLY SCHEDULED EXCHANGE-GATE MODEL
// =================================================================================================
// Rapidity convention bridge:
//   - Worldline Yang operator R(w_R) = (w_R I - i P)/(w_R + i) matches E(alpha) = (1+e^{i pi alpha})/2 I + (1-e^{i pi alpha})/2 P
//     up to global phase e^{i pi alpha} with w_R = cot(pi alpha / 2) (so alpha=1 -> w_R=0, alpha=1/2 -> w_R=+1, alpha=2/3 -> w_R=+1/sqrt(3)).
//   - Spatial-crossing operator S_sp(w_sp) = P R(w_sp) (used in bare-u-periodic-mirrors-and-bounds.ts) satisfies
//     w_sp = -tan(pi alpha / 2) = -1 / w_R.
//   - Verbatim bare on-dock M_meet acts as omega on P=+1 (Sym) and 1 on P=-1 (Alt), so M_meet = omega * E(-2/3),
//     hence M_meet^dag = M_meet^2 = omega^2 * E(+2/3), equivalently E(+2/3) = omega * M_meet^dag = omega * M_meet^2
//     (and E(-2/3) = omega^2 * M_meet).

function v1OfU(u: number): number {
  return (SQRT3 * u) / (3 * u * u + 1)
}
function rapidityOfAlpha(alpha: number): number {
  // Worldline rapidity w_R = cot(pi alpha / 2); spatial-crossing convention is w_sp = -tan(pi alpha / 2) = -1 / w_R.
  // Normalize alpha into (-1, 1]
  let a = ((alpha + 1) % 2 + 2) % 2 - 1
  if (Math.abs(a + 1) < 1e-12) a = 1
  if (Math.abs(Math.abs(a) - 1) < 1e-12) return 0
  return 1 / Math.tan((PI * a) / 2)
}
function dvSymOfW(w: number): number {
  return Math.abs(v1OfU(w / 2) - v1OfU(-w / 2))
}

function pulseKinematicStats(pulses: readonly AdjPulse[]): {
  readonly count: number
  readonly w0Count: number
  readonly negWCount: number
  readonly minAbsW: number
  readonly maxAbsW: number
  readonly minDvSym: number
} {
  let w0Count = 0
  let negWCount = 0
  let minAbsW = Number.POSITIVE_INFINITY
  let maxAbsW = 0
  let minDvSym = Number.POSITIVE_INFINITY
  for (const [, , a] of pulses) {
    const w = rapidityOfAlpha(a)
    const aw = Math.abs(w)
    if (aw < 1e-12) w0Count++
    if (w < -1e-12) negWCount++
    minAbsW = Math.min(minAbsW, aw)
    maxAbsW = Math.max(maxAbsW, aw)
    minDvSym = Math.min(minDvSym, dvSymOfW(w))
  }
  return { count: pulses.length, w0Count, negWCount, minAbsW, maxAbsW, minDvSym }
}

function runPillarT2(): void {
  console.log('\n================================================================================')
  console.log('PILLAR T2: ZERO-w=0 GATE COMPILATION (EXTERNALLY SCHEDULED EXCHANGE-GATE MODEL)')
  console.log('================================================================================')
  // Machine-check exact M_meet / E(+-2/3) phase convention and worldline vs spatial-crossing rapidity bridge:
  //   M_meet = (zeta_6/2) I + ((omega-1)/2) P => Sym (+1): omega, Alt (-1): 1
  //   E(alpha) = (1+e^{i pi alpha})/2 I + (1-e^{i pi alpha})/2 P => Sym (+1): 1, Alt (-1): e^{i pi alpha}
  //   => M_meet = omega * E(-2/3), and M_meet^dag = M_meet^2 = omega^2 * E(+2/3), so E(+2/3) = omega * M_meet^dag = omega * M_meet^2.
  const mMeetSym = cAdd(MEET_KEEP, MEET_SWAP)
  const mMeetAlt = cSub(MEET_KEEP, MEET_SWAP)
  assertExact(cAbs(cSub(mMeetSym, W_C)) < 1e-14 && cAbs(cSub(mMeetAlt, C_ONE)) < 1e-14, 'M_meet Sym/Alt eigenvalues')
  const ePlus23Sym = C_ONE
  const ePlus23Alt = cExpI((2 * PI) / 3) // omega
  assertExact(
    cAbs(cSub(ePlus23Sym, cMul(W_C, cConj(mMeetSym)))) < 1e-14 &&
      cAbs(cSub(ePlus23Alt, cMul(W_C, cConj(mMeetAlt)))) < 1e-14 &&
      cAbs(cSub(cMul(W2_C, ePlus23Sym), cMul(mMeetSym, mMeetSym))) < 1e-14 &&
      cAbs(cSub(cMul(W2_C, ePlus23Alt), cMul(mMeetAlt, mMeetAlt))) < 1e-14,
    'E(+2/3) = omega * M_meet^dag = omega * M_meet^2 identity',
  )
  // Cross-check w_R = cot(pi alpha / 2) vs w_sp = -tan(pi alpha / 2) = -1 / w_R at alpha = 2/3 and 1/2
  for (const aTest of [2 / 3, 0.5, -2 / 3, 0.25]) {
    const wR = rapidityOfAlpha(aTest)
    const wSp = -Math.tan((PI * aTest) / 2)
    assertExact(Math.abs(wSp + 1 / wR) < 1e-14, `w_sp = -1/w_R check at alpha=${aTest}`)
  }

  // Build C(6,3) = 20 basis & singlet/triplet logical DFS kets (verbatim from U4d)
  const basis20: [number, number, number][] = []
  const idx20 = new Map<string, number>()
  for (let i = 0; i < 6; i++) {
    for (let j = i + 1; j < 6; j++) {
      for (let k = j + 1; k < 6; k++) {
        idx20.set(`${i},${j},${k}`, basis20.length)
        basis20.push([i, j, k])
      }
    }
  }
  const exch20Alpha = (p: number, q: number, alpha: number): CMat => {
    const ph = cExpI(PI * alpha)
    const cI = cScale(0.5, cAdd(C_ONE, ph))
    const cP = cScale(0.5, cSub(C_ONE, ph))
    const M: CMat = Array.from({ length: 20 }, () => Array.from({ length: 20 }, () => C_ZERO))
    for (let col = 0; col < 20; col++) {
      const [i, j, k] = basis20[col]!
      const mp = (x: number) => (x === p ? q : x === q ? p : x)
      const arr = [mp(i), mp(j), mp(k)].sort((a, b) => a - b)
      const row = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
      M[col]![col] = cAdd(M[col]![col]!, cI)
      M[row]![col] = cAdd(M[row]![col]!, cP)
    }
    return M
  }
  const runPulses20 = (pulses: readonly AdjPulse[]): CMat => {
    let U = matEye(20)
    for (const [p, q, a] of pulses) U = matMul(exch20Alpha(p, q, a), U)
    return U
  }
  const dfsUpA: readonly (readonly (readonly [readonly [number], number])[])[] = [
    [[[1], ISQ2], [[2], -ISQ2]],
    [[[0], 2 * ISQ6], [[1], -ISQ6], [[2], -ISQ6]],
  ]
  const dfsDnA: readonly (readonly (readonly [readonly [number, number], number])[])[] = [
    [[[0, 1], ISQ2], [[0, 2], -ISQ2]],
    [[[0, 1], ISQ6], [[0, 2], ISQ6], [[1, 2], -2 * ISQ6]],
  ]
  const dfsUpB: readonly (readonly (readonly [readonly [number], number])[])[] = [
    [[[4], ISQ2], [[5], -ISQ2]],
    [[[3], 2 * ISQ6], [[4], -ISQ6], [[5], -ISQ6]],
  ]
  const dfsDnB: readonly (readonly (readonly [readonly [number, number], number])[])[] = [
    [[[3, 4], ISQ2], [[3, 5], -ISQ2]],
    [[[3, 4], ISQ6], [[3, 5], ISQ6], [[4, 5], -2 * ISQ6]],
  ]
  const buildKets20 = (sign: 1 | -1): number[][] => {
    const out: number[][] = []
    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        const v = new Array<number>(20).fill(0)
        for (const [pa, ca] of dfsUpA[a]!) {
          for (const [pb, cb] of dfsDnB[b]!) {
            const arr = [pa[0], pb[0], pb[1]].sort((x, y) => x - y)
            const id = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
            v[id] = v[id]! + ISQ2 * ca * cb
          }
        }
        for (const [pa, ca] of dfsDnA[a]!) {
          for (const [pb, cb] of dfsUpB[b]!) {
            const arr = [pa[0], pa[1], pb[0]].sort((x, y) => x - y)
            const id = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
            v[id] = v[id]! + sign * ISQ2 * ca * cb
          }
        }
        out.push(v)
      }
    }
    return out
  }
  const singletKets20 = buildKets20(-1)
  const tripletKets20 = buildKets20(1)
  const proj20Kets = (U20: CMat, kets: readonly (readonly number[])[]): { readonly U4: CMat; readonly leak: number } => {
    const U4: CMat = Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => {
        let s: C = C_ZERO
        for (let i = 0; i < 20; i++) {
          const ri = kets[r]![i]!
          if (ri === 0) continue
          for (let j = 0; j < 20; j++) {
            const cj = kets[c]![j]!
            if (cj === 0) continue
            s = cAdd(s, cScale(ri * cj, U20[i]![j]!))
          }
        }
        return s
      }),
    )
    const leak = Math.max(0, 4 - matTrace(matMul(matDag(U4), U4))[0]) / 4
    return { U4, leak }
  }

  // -----------------------------------------------------------------------------------------------
  // T2a: Zero-w=0 Continuous-Rapidity Universal Gate Set (76-Pulse CZ, 77-Pulse CNOT, 547-Pulse Toffoli)
  // -----------------------------------------------------------------------------------------------
  const noW0Order = [0.5, -0.5, 2 / 3, -2 / 3] as const
  const rightCZ_noW0 = synth1Q_DFS(matDag(Q_cz_B), noW0Order)
  const leftCZ_noW0 = synth1Q_DFS(matMul(Q_cz_B, Rn_B), noW0Order)
  const rightCNOT_noW0 = synth1Q_DFS(matDag(Q_cnot_B), noW0Order)
  const leftCNOT_noW0 = synth1Q_DFS(matMul(Q_cnot_B, Rn_B), noW0Order)
  const seqH_noW0 = synth1Q_DFS(H2, noW0Order)
  const seqT_noW0 = synth1Q_DFS(T2, noW0Order)
  const seqTd_noW0 = synth1Q_DFS(Td2, noW0Order)

  // Negative control: original U4d 53-pulse CZ & 54-pulse CNOT contain w = 0 SWAPs
  const origCNOT_54 = buildSpinIndep2Q(1, 2, 3, 4, 5, synth1Q_DFS(matDag(Q_cnot_B), [1, 0.5, -0.5]), synth1Q_DFS(matMul(Q_cnot_B, Rn_B), [1, 0.5, -0.5]), false)
  const origStats54 = pulseKinematicStats(origCNOT_54)

  const cz76 = buildSpinIndep2Q(1, 2, 3, 4, 5, rightCZ_noW0, leftCZ_noW0, true)
  const cnot77 = buildSpinIndep2Q(1, 2, 3, 4, 5, rightCNOT_noW0, leftCNOT_noW0, true)
  const statsCZ76 = pulseKinematicStats(cz76)
  const statsCNOT77 = pulseKinematicStats(cnot77)
  assertExact(cz76.length === 76 && cnot77.length === 77, `zero-w0 counts (${cz76.length}, ${cnot77.length})`)

  const U_CZ76 = runPulses20(cz76)
  const U_CNOT77 = runPulses20(cnot77)
  const cz76_S0 = proj20Kets(U_CZ76, singletKets20)
  const cz76_S1 = proj20Kets(U_CZ76, tripletKets20)
  const cz76_err0 = matFrobDiffUpToPhase(cz76_S0.U4, CZ_EXACT)
  const cz76_err1 = matFrobDiffUpToPhase(cz76_S1.U4, CZ_EXACT)
  const cz76_match = matFrobDiff(cz76_S0.U4, cz76_S1.U4)

  const cnot77_S0 = proj20Kets(U_CNOT77, singletKets20)
  const cnot77_S1 = proj20Kets(U_CNOT77, tripletKets20)
  const cnot77_err0 = matFrobDiffUpToPhase(cnot77_S0.U4, CNOT_EXACT)
  const cnot77_err1 = matFrobDiffUpToPhase(cnot77_S1.U4, CNOT_EXACT)
  const cnot77_match = matFrobDiff(cnot77_S0.U4, cnot77_S1.U4)

  // Full 9-spin C(9,4) = 126 linear-chain 547-pulse zero-w=0 Toffoli (verbatim basis126 & kets126 from U4d)
  const basis126: [number, number, number, number][] = []
  const idx126 = new Map<string, number>()
  for (let a = 0; a < 9; a++) {
    for (let b = a + 1; b < 9; b++) {
      for (let c = b + 1; c < 9; c++) {
        for (let d = c + 1; d < 9; d++) {
          idx126.set(`${a},${b},${c},${d}`, basis126.length)
          basis126.push([a, b, c, d])
        }
      }
    }
  }
  const swapPerm126 = (p: number, q: number): Int32Array => {
    const perm = new Int32Array(126)
    for (let i = 0; i < 126; i++) {
      const [a, b, c, d] = basis126[i]!
      const mp = (x: number) => (x === p ? q : x === q ? p : x)
      const arr = [mp(a), mp(b), mp(c), mp(d)].sort((x, y) => x - y)
      perm[i] = idx126.get(`${arr[0]},${arr[1]},${arr[2]},${arr[3]}`)!
    }
    return perm
  }
  const adjPerms126: readonly Int32Array[] = Array.from({ length: 8 }, (_, k) => swapPerm126(k, k + 1))
  const applyAdj126 = (re: Float64Array, im: Float64Array, nCols: number, k: number, alpha: number): void => {
    const perm = adjPerms126[k]!
    const ph = cExpI(PI * alpha)
    const cIr = 0.5 * (1 + ph[0]); const cIi = 0.5 * ph[1]
    const cPr = 0.5 * (1 - ph[0]); const cPi = -0.5 * ph[1]
    for (let col = 0; col < nCols; col++) {
      const off = col * 126
      for (let i = 0; i < 126; i++) {
        const j = perm[i]!
        if (j <= i) continue
        const ir = re[off + i]!; const ii = im[off + i]!
        const jr = re[off + j]!; const ji = im[off + j]!
        re[off + i] = cIr * ir - cIi * ii + cPr * jr - cPi * ji
        im[off + i] = cIr * ii + cIi * ir + cPr * ji + cPi * jr
        re[off + j] = cIr * jr - cIi * ji + cPr * ir - cPi * ii
        im[off + j] = cIr * ji + cIi * jr + cPr * ii + cPi * ir
      }
    }
  }
  const qUp126 = (q: number, bit: number): readonly (readonly [readonly number[], number])[] =>
    bit === 0
      ? [[[3 * q + 1], ISQ2], [[3 * q + 2], -ISQ2]]
      : [[[3 * q], 2 * ISQ6], [[3 * q + 1], -ISQ6], [[3 * q + 2], -ISQ6]]
  const qDn126 = (q: number, bit: number): readonly (readonly [readonly number[], number])[] =>
    bit === 0
      ? [[[3 * q, 3 * q + 1], ISQ2], [[3 * q, 3 * q + 2], -ISQ2]]
      : [[[3 * q, 3 * q + 1], ISQ6], [[3 * q, 3 * q + 2], ISQ6], [[3 * q + 1, 3 * q + 2], -2 * ISQ6]]
  const addProd126 = (
    v: Float64Array, coeff: number,
    tA: readonly (readonly [readonly number[], number])[],
    tB: readonly (readonly [readonly number[], number])[],
    tC: readonly (readonly [readonly number[], number])[],
  ): void => {
    for (const [dA, cA] of tA) {
      for (const [dB, cB] of tB) {
        for (const [dC, cC] of tC) {
          const arr = [...dA, ...dB, ...dC].sort((x, y) => x - y)
          const id = idx126.get(`${arr[0]},${arr[1]},${arr[2]},${arr[3]}`)!
          v[id] = v[id]! + coeff * cA * cB * cC
        }
      }
    }
  }
  const kets126: Float64Array[] = []
  for (let g = 0; g < 2; g++) {
    for (let idx = 0; idx < 8; idx++) {
      const a = (idx >> 2) & 1; const b = (idx >> 1) & 1; const c = idx & 1
      const v = new Float64Array(126)
      if (g === 0) {
        addProd126(v, ISQ2, qUp126(0, a), qDn126(1, b), qUp126(2, c))
        addProd126(v, -ISQ2, qDn126(0, a), qUp126(1, b), qUp126(2, c))
      } else {
        addProd126(v, 2 * ISQ6, qUp126(0, a), qUp126(1, b), qDn126(2, c))
        addProd126(v, -ISQ6, qUp126(0, a), qDn126(1, b), qUp126(2, c))
        addProd126(v, -ISQ6, qDn126(0, a), qUp126(1, b), qUp126(2, c))
      }
      kets126.push(v)
    }
  }
  // 18-pulse zero-w=0 adjacent qubit SWAP between Q0=(0,1,2) and Q1=(3,4,5) using E_{p,p+1}(1/2)^2
  const qubitSwap01_18: readonly AdjPulse[] = [
    [2, 3, 1], [3, 4, 1], [4, 5, 1],
    [1, 2, 1], [2, 3, 1], [3, 4, 1],
    [0, 1, 1], [1, 2, 1], [2, 3, 1],
  ].flatMap(([p, q]): AdjPulse[] => [[p!, q!, 0.5], [p!, q!, 0.5]])
  const map1Q_9 = (q: 0 | 1 | 2, seq: readonly PairPulse1Q[]): AdjPulse[] =>
    seq.map(([w, a]) => (w === 1 ? [3 * q + 1, 3 * q + 2, a] : [3 * q, 3 * q + 1, a]))
  const cnot77_12 = buildSpinIndep2Q(4, 5, 6, 7, 8, rightCNOT_noW0, leftCNOT_noW0, true)
  const cnot77_02: readonly AdjPulse[] = [...qubitSwap01_18, ...cnot77_12, ...qubitSwap01_18.slice().reverse()]
  const toff547Pulses: AdjPulse[] = [
    ...map1Q_9(2, seqH_noW0),
    ...cnot77_12,
    ...map1Q_9(2, seqTd_noW0),
    ...cnot77_02,
    ...map1Q_9(2, seqT_noW0),
    ...cnot77_12,
    ...map1Q_9(2, seqTd_noW0),
    ...cnot77_02,
    ...map1Q_9(1, seqT_noW0),
    ...map1Q_9(2, seqT_noW0),
    ...cnot77,
    ...map1Q_9(2, seqH_noW0),
    ...map1Q_9(0, seqT_noW0),
    ...map1Q_9(1, seqTd_noW0),
    ...cnot77,
  ]
  const statsToff547 = pulseKinematicStats(toff547Pulses)
  assertExact(toff547Pulses.length === 547 && statsToff547.w0Count === 0, `Toff547 count=${toff547Pulses.length}, w0=${statsToff547.w0Count}`)

  const Toffoli_exact: CMat = matEye(8)
  Toffoli_exact[6]![6] = C_ZERO; Toffoli_exact[7]![7] = C_ZERO
  Toffoli_exact[6]![7] = C_ONE; Toffoli_exact[7]![6] = C_ONE
  const Toffoli16_exact: CMat = matEye(16)
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    Toffoli16_exact[r]![c] = Toffoli_exact[r]![c]!
    Toffoli16_exact[r + 8]![c + 8] = Toffoli_exact[r]![c]!
  }

  const st126Re = new Float64Array(16 * 126)
  const st126Im = new Float64Array(16 * 126)
  for (let col = 0; col < 16; col++) for (let i = 0; i < 126; i++) st126Re[col * 126 + i] = kets126[col]![i]!
  for (const [p, q, a] of toff547Pulses) {
    assertExact(q === p + 1, `Non-adjacent Toff547 [${p},${q}]`)
    applyAdj126(st126Re, st126Im, 16, p, a)
  }
  const U16_toff: CMat = Array.from({ length: 16 }, (_, r) =>
    Array.from({ length: 16 }, (_, c) => {
      let re = 0; let im = 0
      const off = c * 126
      for (let i = 0; i < 126; i++) {
        const w = kets126[r]![i]!
        if (w !== 0) { re += w * st126Re[off + i]!; im += w * st126Im[off + i]! }
      }
      return [re, im] as C
    }),
  )
  let tr16 = 0
  for (let r = 0; r < 16; r++) for (let c = 0; c < 16; c++) tr16 += cAbs2(U16_toff[r]![c]!)
  const toffLeak16 = Math.max(0, 16 - tr16) / 16
  const U8_g0 = U16_toff.slice(0, 8).map(row => row.slice(0, 8))
  const U8_g1 = U16_toff.slice(8, 16).map(row => row.slice(8, 16))
  const toffErr16 = matFrobDiffUpToPhase(U16_toff, Toffoli16_exact)
  const toffMatch01 = matFrobDiff(U8_g0, U8_g1)
  // Full 126 x 126 unitarity check on C(9,4) = 126
  const toffUni126Err = (() => {
    const fRe = new Float64Array(126 * 126)
    const fIm = new Float64Array(126 * 126)
    for (let col = 0; col < 126; col++) fRe[col * 126 + col] = 1
    for (const [p, _q, a] of toff547Pulses) applyAdj126(fRe, fIm, 126, p, a)
    let e2 = 0
    for (let c1 = 0; c1 < 126; c1++) {
      const o1 = c1 * 126
      for (let c2 = 0; c2 < 126; c2++) {
        const o2 = c2 * 126
        let re = 0; let im = 0
        for (let i = 0; i < 126; i++) {
          re += fRe[o1 + i]! * fRe[o2 + i]! + fIm[o1 + i]! * fIm[o2 + i]!
          im += fRe[o1 + i]! * fIm[o2 + i]! - fIm[o1 + i]! * fRe[o2 + i]!
        }
        if (c1 === c2) re -= 1
        e2 += re * re + im * im
      }
    }
    return Math.sqrt(e2)
  })()

  // -----------------------------------------------------------------------------------------------
  // T2b: Strictly-Positive 2-Rapidity Set w in {+1/sqrt(3), +1} (alpha in {+2/3, +1/2}) Spin-Indep CZ
  // -----------------------------------------------------------------------------------------------
  const M01_DFS = dfsGen01(2 / 3)
  const M12_DFS = dfsGen12(2 / 3)
  const mitm2Rap = (() => {
    const gens: readonly { readonly pair: 0 | 1; readonly alpha: number; readonly U: CMat }[] = [
      { pair: 0, alpha: 2 / 3, U: M01_DFS },
      { pair: 0, alpha: -2 / 3, U: matDag(M01_DFS) },
      { pair: 1, alpha: 2 / 3, U: M12_DFS },
      { pair: 1, alpha: -2 / 3, U: matDag(M12_DFS) },
    ]
    const key4 = (U: CMat): string => {
      let a = U[0]![0]!; let b = U[0]![1]!
      if (a[0] < -1e-6 || (Math.abs(a[0]) <= 1e-6 && a[1] < -1e-6)) { a = [-a[0], -a[1]]; b = [-b[0], -b[1]] }
      return `${a[0].toFixed(4)},${a[1].toFixed(4)},${b[0].toFixed(4)},${b[1].toFixed(4)}`
    }
    interface PoolItem { readonly seq: readonly PairPulse1Q[]; readonly U: CMat; readonly lastPair: -1 | 0 | 1 }
    const pool: PoolItem[] = [{ seq: [], U: I2, lastPair: -1 }]
    const seen = new Set<string>([key4(I2)])
    let front: PoolItem[] = pool.slice()
    for (let d = 1; d <= 10; d++) {
      const next: PoolItem[] = []
      for (const cur of front) {
        for (const g of gens) {
          if (g.pair === cur.lastPair) continue
          const U = matMul(g.U, cur.U)
          const k = key4(U)
          if (!seen.has(k)) {
            seen.add(k)
            const item: PoolItem = { seq: [...cur.seq, [g.pair, g.alpha]], U, lastPair: g.pair }
            pool.push(item); next.push(item)
          }
        }
      }
      front = next
    }
    const nP = pool.length
    assertExact(nP === 4093, `MITM pool size ${nP} !== 4093`)
    const l0 = new Float64Array(nP); const l1 = new Float64Array(nP)
    const l2 = new Float64Array(nP); const l3 = new Float64Array(nP)
    for (let i = 0; i < nP; i++) {
      const U = pool[i]!.U
      l0[i] = U[0]![0]![0]; l1[i] = U[0]![0]![1]; l2[i] = U[0]![1]![0]; l3[i] = U[0]![1]![1]
    }
    const findBest = (target: CMat) => {
      const T_SU2 = toSU2(target)
      const r0 = new Float64Array(nP); const r1 = new Float64Array(nP)
      const r2 = new Float64Array(nP); const r3 = new Float64Array(nP)
      for (let i = 0; i < nP; i++) {
        const M = matMul(T_SU2, matDag(pool[i]!.U))
        r0[i] = M[0]![0]![0]; r1[i] = M[0]![0]![1]; r2[i] = M[0]![1]![0]; r3[i] = M[0]![1]![1]
      }
      let bestDot = -1; let bi = 0; let bj = 0
      for (let i = 0; i < nP; i++) {
        const a0 = l0[i]!; const a1 = l1[i]!; const a2 = l2[i]!; const a3 = l3[i]!
        for (let j = 0; j < nP; j++) {
          const d = Math.abs(a0 * r0[j]! + a1 * r1[j]! + a2 * r2[j]! + a3 * r3[j]!)
          if (d > bestDot) { bestDot = d; bi = i; bj = j }
        }
      }
      const seq: PairPulse1Q[] = [...pool[bj]!.seq, ...pool[bi]!.seq]
      const Ubest = matMul(pool[bi]!.U, pool[bj]!.U)
      return { seq, err: matFrobDiffUpToPhase(Ubest, target) }
    }
    const wQB = findBest(Q_B_MAT)
    const wRightCZ = findBest(matDag(Q_cz_B))
    const wLeftCZ = findBest(matMul(Q_cz_B, Rn_B))

    // Expand signed +-2/3 letters strictly into positive +2/3 pulses on spins (3,4,5) (since E(+2/3)^2 === E(-2/3) identically!)
    const expandPosB = (seq: readonly PairPulse1Q[]): AdjPulse[] => {
      const out: AdjPulse[] = []
      for (const [w, a] of seq) {
        const p = w === 1 ? 4 : 3
        const q = p + 1
        if (a > 0) out.push([p, q, 2 / 3])
        else { out.push([p, q, 2 / 3]); out.push([p, q, 2 / 3]) }
      }
      return out
    }
    const wQBDagSeq: readonly PairPulse1Q[] = wQB.seq.slice().reverse().map(([w, a]) => [w, -a])
    const w0Pos: readonly AdjPulse[] = [
      [2, 3, 0.5], [2, 3, 0.5],
      [3, 4, 2 / 3],
      [4, 5, 0.5], [4, 5, 0.5],
      [3, 4, 2 / 3], [3, 4, 2 / 3],
      [2, 3, 0.5], [2, 3, 0.5],
    ]
    const w0DagPos: readonly AdjPulse[] = [
      [2, 3, 0.5], [2, 3, 0.5],
      [3, 4, 2 / 3],
      [4, 5, 0.5], [4, 5, 0.5],
      [3, 4, 2 / 3], [3, 4, 2 / 3],
      [2, 3, 0.5], [2, 3, 0.5],
    ]
    const u4Pos: readonly AdjPulse[] = [
      ...w0Pos,
      ...expandPosB(wQB.seq),
      [4, 5, 0.5], [4, 5, 0.5],
      ...expandPosB(wQBDagSeq),
      ...w0DagPos,
    ]
    const czPosPulses: AdjPulse[] = [
      ...expandPosB(wRightCZ.seq),
      ...u4Pos,
      [1, 2, 0.5], [1, 2, 0.5],
      ...u4Pos,
      [1, 2, 0.5], [1, 2, 0.5],
      ...u4Pos,
      ...expandPosB(wLeftCZ.seq),
    ]
    for (const [p, q, a] of czPosPulses) {
      assertExact(q === p + 1 && (Math.abs(a - 2 / 3) < 1e-12 || Math.abs(a - 0.5) < 1e-12), `Non-2-rapidity pulse [${p},${q},${a}]`)
    }
    const U20 = runPulses20(czPosPulses)
    const s0 = proj20Kets(U20, singletKets20)
    const s1 = proj20Kets(U20, tripletKets20)
    const err0 = matFrobDiffUpToPhase(s0.U4, CZ_EXACT)
    const err1 = matFrobDiffUpToPhase(s1.U4, CZ_EXACT)
    const match01 = matFrobDiff(s0.U4, s1.U4)
    const fid0 = (cAbs(matTrace(matMul(matDag(s0.U4), CZ_EXACT))) / 4) ** 2
    const fid1 = (cAbs(matTrace(matMul(matDag(s1.U4), CZ_EXACT))) / 4) ** 2
    return {
      poolSize: nP, pulses: czPosPulses.length, stats: pulseKinematicStats(czPosPulses),
      qbErr: wQB.err, rErr: wRightCZ.err, lErr: wLeftCZ.err,
      leak0: s0.leak, leak1: s1.leak, err0, err1, match01, fid0, fid1,
    }
  })()

  // -----------------------------------------------------------------------------------------------
  // T2c: Single-Rapidity Bare On-Dock M_meet Alone (w = +1/sqrt(3) ONLY) on 5 Spins C(5,2)=10 -> 39/39
  // -----------------------------------------------------------------------------------------------
  const singleRapMmeet = (() => {
    const basis10: [number, number][] = []
    const idx10 = new Map<string, number>()
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        idx10.set(`${i},${j}`, basis10.length)
        basis10.push([i, j])
      }
    }
    const makeExch10 = (p: number, q: number, alpha: number): CMat => {
      const ph = cExpI(PI * alpha)
      const cI = cScale(0.5, cAdd(C_ONE, ph))
      const cP = cScale(0.5, cSub(C_ONE, ph))
      const M: CMat = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => C_ZERO))
      for (let col = 0; col < 10; col++) {
        const [i, j] = basis10[col]!
        const ni = i === p ? q : i === q ? p : i
        const nj = j === p ? q : j === q ? p : j
        const row = idx10.get(`${Math.min(ni, nj)},${Math.max(ni, nj)}`)!
        M[col]![col] = cAdd(M[col]![col]!, cI)
        M[row]![col] = cAdd(M[row]![col]!, cP)
      }
      return M
    }

    const computeClosure = (alpha: number) => {
      const Ms: CMat[] = [0, 1, 2, 3].map(j => makeExch10(j, j + 1, alpha))
      const MsDag: CMat[] = Ms.map(matDag)
      const basis: Float64Array[] = [] // 200 real entries per 10x10 complex matrix
      const matToVec = (M: CMat): Float64Array => {
        const v = new Float64Array(200)
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            v[r * 10 + c] = M[r]![c]![0]
            v[100 + r * 10 + c] = M[r]![c]![1]
          }
        }
        return v
      }
      const vecToMat = (v: Float64Array): CMat =>
        Array.from({ length: 10 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => [v[r * 10 + c]!, v[100 + r * 10 + c]!] as C),
        )
      const addMat = (M: CMat): void => {
        const v = matToVec(M)
        for (const b of basis) {
          let dot = 0
          for (let i = 0; i < 200; i++) dot += b[i]! * v[i]!
          for (let i = 0; i < 200; i++) v[i] = v[i]! - dot * b[i]!
        }
        let n2 = 0
        for (let i = 0; i < 200; i++) n2 += v[i]! * v[i]!
        if (n2 > 1e-10) {
          const inv = 1 / Math.sqrt(n2)
          for (let i = 0; i < 200; i++) v[i] = v[i]! * inv
          basis.push(v)
        }
      }
      const comm10 = (A: CMat, B: CMat): CMat => {
        const AB = matMul(A, B)
        const BA = matMul(B, A)
        return Array.from({ length: 10 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => cSub(AB[r]![c]!, BA[r]![c]!)),
        )
      }
      // Initial generators: A_k = (M_k M_{k+1})^3 - ((M_k M_{k+1})^3)^dag (k = 0..2)
      for (let k = 0; k < 3; k++) {
        const X = matMul(Ms[k]!, Ms[k + 1]!)
        const X3 = matMul(X, matMul(X, X))
        const X3d = matDag(X3)
        const Ak: CMat = Array.from({ length: 10 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => cSub(X3[r]![c]!, X3d[r]![c]!)),
        )
        addMat(Ak)
      }
      // Close under Ad(M_j) conjugation AND Lie commutators [B_a, B_b]
      for (let head = 0; head < basis.length && basis.length < 45; head++) {
        const Bh = vecToMat(basis[head]!)
        for (let j = 0; j < 4; j++) addMat(matMul(Ms[j]!, matMul(Bh, MsDag[j]!)))
        for (let prev = 0; prev < head; prev++) addMat(comm10(Bh, vecToMat(basis[prev]!)))
      }
      return { dim: basis.length, basis, vecToMat }
    }

    const posRes = computeClosure(2 / 3)
    const negSwapRes = computeClosure(1) // negative control: SWAP has (P_k P_{k+1})^3 = I => A_k = 0!
    // Verify decomposition into (5) [dim 1 -> 0], (4,1) [dim 4 -> 15], (3,2) [dim 5 -> 24]
    const sym5Vec = Array.from({ length: 10 }, () => 1 / Math.sqrt(10))
    let maxOnSym5 = 0
    for (const bv of posRes.basis) {
      const M = posRes.vecToMat(bv)
      for (let r = 0; r < 10; r++) {
        let s: C = C_ZERO
        for (let c = 0; c < 10; c++) s = cAdd(s, cScale(sym5Vec[c]!, M[r]![c]!))
        maxOnSym5 = Math.max(maxOnSym5, cAbs(s))
      }
    }
    return { dim: posRes.dim, negSwapDim: negSwapRes.dim, maxOnSym5 }
  })()

  // -----------------------------------------------------------------------------------------------
  // T2d: Exact Closed-Form Sym^2 Doublon Dispersion (M=16 Exact Diag) & w=0 Breakdown + Householder F(0)
  // -----------------------------------------------------------------------------------------------
  const sym2Disp = (() => {
    const M = 16
    const e2Ana = (U: number): number => PI / 3 + Math.atan((4 * SQRT3) / (12 * U * U + 11))
    const pAna = (U: number): number => -Math.atan2(24 * U, 13 - 12 * U * U)
    const v2Ana = (U: number): number => (4 * SQRT3 * U) / (12 * U * U + 13)
    const uOfP = (P: number): number => {
      if (Math.abs(P) < 1e-14) return 0
      const sp = Math.sin(P)
      if (Math.abs(sp) < 1e-14) return Number.POSITIVE_INFINITY
      return (12 * Math.cos(P) - Math.sqrt(144 + 12 * sp * sp)) / (12 * sp)
    }

    // Build exact Bloch block U_2(K) for each momentum K = 2 pi k / M (k = 0..M-1)
    // A 2-body Sym^2 basis state on ring of M even-sites is an orbit of {(0, s1), (d, s2)}:
    //   - d = 0: {(0, 0), (0, 1)} (norm 1)
    //   - 1 <= d < M/2: {(0, s1), (d, s2)} for s1,s2 in {0,1} (4 orbits, norm 1)
    //   - d = M/2:
    //       * (0,0) and (1,1): translation by M/2 returns to same state with phase e^{i K M/2} = (-1)^k -> exists iff k even!
    //       * (0,1): translation by M/2 gives (1,0), so 1 orbit of size M!
    interface Orbit { readonly d: number; readonly s1: number; readonly s2: number; readonly normFac: number }
    let maxE2Err = 0
    let maxE2ErrLowK = 0
    let maxV2FdErr = 0
    let pOnSiteK0 = 0
    const blochE2: number[] = []
    const blochP: number[] = []

    for (let k = 0; k < M; k++) {
      // Even-site Bloch momentum K = 2 pi k / M = 2 P_tot; step2EvenSym includes a -1 dock/beat even-sublattice
      // frame shift, so the symmetric bare-U energy is E_sym = E_even - P_tot!
      const kSigned = k <= M / 2 ? k : k - M
      const K = (2 * PI * kSigned) / M
      const P_tot = K / 2
      const orbits: Orbit[] = [{ d: 0, s1: 0, s2: 1, normFac: 1 }]
      const orbitIdx = new Map<string, number>([['0,0,1', 0]])
      for (let d = 1; d < M / 2; d++) {
        for (const s1 of [0, 1] as const) {
          for (const s2 of [0, 1] as const) {
            orbitIdx.set(`${d},${s1},${s2}`, orbits.length)
            orbits.push({ d, s1, s2, normFac: 1 })
          }
        }
      }
      const half = M / 2
      if (k % 2 === 0) {
        orbitIdx.set(`${half},0,0`, orbits.length); orbits.push({ d: half, s1: 0, s2: 0, normFac: ISQ2 })
        orbitIdx.set(`${half},1,1`, orbits.length); orbits.push({ d: half, s1: 1, s2: 1, normFac: ISQ2 })
      }
      orbitIdx.set(`${half},0,1`, orbits.length); orbits.push({ d: half, s1: 0, s2: 1, normFac: 1 })

      const dim = orbits.length
      const Umat: CMat = Array.from({ length: dim }, () => Array.from({ length: dim }, () => C_ZERO))
      const addToCol = (col: number, mA: number, sA: number, mB: number, sB: number, amp: C, srcNorm: number): void => {
        const a = ((mA % M) + M) % M
        const b = ((mB % M) + M) % M
        const diff = (b - a + M) % M
        let shift: number; let dOrb: number; let os1: number; let os2: number
        if (diff === 0) {
          shift = a; dOrb = 0; os1 = 0; os2 = 1
        } else if (diff < half) {
          shift = a; dOrb = diff; os1 = sA; os2 = sB
        } else if (diff > half) {
          shift = b; dOrb = M - diff; os1 = sB; os2 = sA
        } else {
          if (sA === sB) {
            if (k % 2 !== 0) return
            shift = a; dOrb = half; os1 = sA; os2 = sB
          } else if (sA === 0 && sB === 1) {
            shift = a; dOrb = half; os1 = 0; os2 = 1
          } else {
            shift = b; dOrb = half; os1 = 0; os2 = 1
          }
        }
        const row = orbitIdx.get(`${dOrb},${os1},${os2}`)!
        const dstNorm = orbits[row]!.normFac
        const ph = cExpI(-K * shift)
        const scale = srcNorm / dstNorm
        Umat[row]![col] = cAdd(Umat[row]![col]!, cScale(scale, cMul(amp, ph)))
      }

      for (let col = 0; col < dim; col++) {
        const orb = orbits[col]!
        if (orb.d === 0) {
          addToCol(col, 0, 0, M - 1, 1, W2_C, orb.normFac)
        } else {
          const m1 = 0; const m2 = orb.d
          for (const t1 of [0, 1] as const) {
            const c1 = C_MAT[t1]![orb.s1]!
            const nm1 = t1 === 0 ? m1 : m1 - 1
            for (const t2 of [0, 1] as const) {
              const cc = cMul(c1, C_MAT[t2]![orb.s2]!)
              const nm2 = t2 === 0 ? m2 : m2 - 1
              addToCol(col, nm1, t1, nm2, t2, cc, orb.normFac)
            }
          }
        }
      }
      assertExact(matUnitaryErr(Umat) < 1e-12, `M=16 Bloch U_2(k=${k}) unitary err`)
      const { evals, evecs } = eigenUnitary(dim, Umat)
      const U = uOfP(P_tot)
      const E_exp = Number.isFinite(U) ? e2Ana(U) : PI / 3
      // Identify localized doublon bound state(s) with peak on-site weight w0 > 0.22
      // (At k = M/2, P = +pi/2 and P = -pi/2 share the same K = pi block with identical w0 = 3/13!)
      let bestW0 = -1
      for (let i = 0; i < dim; i++) bestW0 = Math.max(bestW0, cAbs2(evecs[i]![0]!))
      if (k === 0) pOnSiteK0 = bestW0
      let errK = Number.POSITIVE_INFINITY
      let E_sym = 0
      for (let i = 0; i < dim; i++) {
        if (cAbs2(evecs[i]![0]!) < bestW0 - 1e-4) continue
        const candE = wrapPi(cArg(evals[i]!) - P_tot)
        const candErr = Math.abs(wrapPi(candE - E_exp))
        if (candErr < errK) { errK = candErr; E_sym = candE }
      }
      maxE2Err = Math.max(maxE2Err, errK)
      if (Math.abs(kSigned) <= 4) maxE2ErrLowK = Math.max(maxE2ErrLowK, errK)
      blochP.push(P_tot)
      blochE2.push(E_sym)
    }

    // Verify exact dE_2/dP = v_2(U) numerically across 20 rapidities
    for (let i = -10; i <= 10; i++) {
      const U = 0.25 * i
      const h = 1e-6
      const dE = e2Ana(U + h) - e2Ana(U - h)
      const dP = pAna(U + h) - pAna(U - h)
      maxV2FdErr = Math.max(maxV2FdErr, Math.abs(dE / dP - v2Ana(U)))
    }

    // Certify v_1(U) - v_2(U) = 9 sqrt(3) U / ((3 U^2 + 1)(12 U^2 + 13)) at w = u - U = 0:
    //   - At U = 1/2: exact 9*sqrt(3)/56 = 0.2783654...
    //   - Exact global maximum: U_* = sqrt((-51 + sqrt(8217))/216) = 0.428432 -> max|dv| = 0.283301!
    let maxDvFormulaErr = 0
    let gridMaxDv = 0; let gridArgMax = 0
    for (let i = 0; i <= 4000; i++) {
      const U = i * 0.001
      const dvDirect = v1OfU(U) - v2Ana(U)
      const dvClosed = (9 * SQRT3 * U) / ((3 * U * U + 1) * (12 * U * U + 13))
      maxDvFormulaErr = Math.max(maxDvFormulaErr, Math.abs(dvDirect - dvClosed))
      if (Math.abs(dvDirect) > gridMaxDv) { gridMaxDv = Math.abs(dvDirect); gridArgMax = U }
    }
    const dvAtHalf = v1OfU(0.5) - v2Ana(0.5)
    const dvAtHalfExact = (9 * SQRT3) / 56
    const uPeakExact = Math.sqrt((-51 + Math.sqrt(8217)) / 216)
    const maxDvExact = v1OfU(uPeakExact) - v2Ana(uPeakExact)

    // Exact 6D Yang fusion F(w) = R_{13}(w + i/2) R_{23}(w - i/2) projected onto 3D role-partition basis!
    const perms3: readonly (readonly [number, number, number])[] = [
      [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
    ]
    const applyR6 = (v: readonly C[], iA: number, iB: number, wRe: number, wIm: number): C[] => {
      const rI = cDiv([wRe, wIm], [wRe, wIm + 1])
      const rP = cDiv([0, -1], [wRe, wIm + 1])
      const out: C[] = Array.from({ length: 6 }, () => C_ZERO)
      for (let idx = 0; idx < 6; idx++) {
        const p = perms3[idx]!
        const sw: [number, number, number] = [p[0], p[1], p[2]]
        const t = sw[iA]!; sw[iA] = sw[iB]!; sw[iB] = t
        const j = perms3.findIndex(q => q[0] === sw[0] && q[1] === sw[1] && q[2] === sw[2])
        out[idx] = cAdd(out[idx]!, cMul(v[idx]!, rI))
        out[j] = cAdd(out[j]!, cMul(v[idx]!, rP))
      }
      return out
    }
    // 3 orthonormal Sym^2(pos 0,1) x pulse(pos 2) basis vectors in C[S_3]:
    //   e0 = |{0,1}, 2> = (|0,1,2> + |1,0,2>)/sqrt(2) [indices 0, 2]
    //   e1 = |{0,2}, 1> = (|0,2,1> + |2,0,1>)/sqrt(2) [indices 1, 4]
    //   e2 = |{1,2}, 0> = (|1,2,0> + |2,1,0>)/sqrt(2) [indices 3, 5]
    const sym3Pairs: readonly (readonly [number, number])[] = [[0, 2], [1, 4], [3, 5]]
    const buildF3 = (w: number): { readonly F: CMat; readonly altLeak: number } => {
      const F: CMat = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => C_ZERO))
      let altLeak = 0
      for (let col = 0; col < 3; col++) {
        const v: C[] = Array.from({ length: 6 }, () => C_ZERO)
        const [a, b] = sym3Pairs[col]!
        v[a] = [ISQ2, 0]; v[b] = [ISQ2, 0]
        const out = applyR6(applyR6(v, 1, 2, w, -0.5), 0, 2, w, +0.5)
        for (let row = 0; row < 3; row++) {
          const [ra, rb] = sym3Pairs[row]!
          F[row]![col] = cScale(ISQ2, cAdd(out[ra]!, out[rb]!))
          altLeak += cAbs(cSub(out[ra]!, out[rb]!))
        }
      }
      return { F, altLeak }
    }
    const f0Res = buildF3(0)
    const F0_target: CMat = [
      [[-1 / 3, 0], [2 / 3, 0], [2 / 3, 0]],
      [[2 / 3, 0], [-1 / 3, 0], [2 / 3, 0]],
      [[2 / 3, 0], [2 / 3, 0], [-1 / 3, 0]],
    ]
    const f0Err = matFrobDiff(f0Res.F, F0_target)
    const f0InvErr = matFrobDiff(matMul(f0Res.F, f0Res.F), matEye(3))
    const pEl0 = cAbs2(f0Res.F[0]![0]!)
    const pSwap0 = cAbs2(f0Res.F[1]![0]!) + cAbs2(f0Res.F[2]![0]!)

    return {
      maxE2Err, maxE2ErrLowK, maxV2FdErr, pOnSiteK0, maxDvFormulaErr,
      dvAtHalf, dvAtHalfExact, uPeakExact, gridMaxDv, gridArgMax, maxDvExact,
      f0AltLeak: f0Res.altLeak, f0Err, f0InvErr, pEl0, pSwap0,
    }
  })()

  console.log(`  [T2a] Zero-w=0 Continuous-Rapidity Universal Gate Set (externally scheduled exchange-gate model; S_3(2,1)|S_3(2,1)):`)
  console.log(`        Scope note: replacing E(1) by E(1/2)^2 requires colliding the same pair twice (impossible on a single-pass infinite ballistic line without mirrors).`)
  console.log(`        Conventions: w_R = cot(pi alpha / 2) (worldline R(w_R)) vs w_sp = -tan(pi alpha / 2) = -1 / w_R (spatial S_sp = P R); M_meet = omega * E(-2/3) => E(+2/3) = omega * M_meet^dag = omega * M_meet^2.`)
  console.log(`        Negative control: U4d 54-pulse CNOT had ${origStats54.w0Count} w=0 SWAPs, min|dv|=${origStats54.minDvSym.toFixed(4)}.`)
  console.log(`        76-pulse CZ  (0 w=0): err(S0)=${cz76_err0.toExponential(2)}, err(S1)=${cz76_err1.toExponential(2)}, ||U(0)-U(1)||=${cz76_match.toExponential(2)}, leak=(${cz76_S0.leak.toExponential(1)},${cz76_S1.leak.toExponential(1)}), min|w_R|=${statsCZ76.minAbsW.toFixed(6)}, min|dv_sym|=${statsCZ76.minDvSym.toFixed(6)}`)
  console.log(`        77-pulse CNOT(0 w=0): err(S0)=${cnot77_err0.toExponential(2)}, err(S1)=${cnot77_err1.toExponential(2)}, ||U(0)-U(1)||=${cnot77_match.toExponential(2)}, leak=(${cnot77_S0.leak.toExponential(1)},${cnot77_S1.leak.toExponential(1)}), min|w_R|=${statsCNOT77.minAbsW.toFixed(6)} (=1/sqrt(3)), min|dv_sym|=${statsCNOT77.minDvSym.toFixed(6)}`)
  console.log(`        547-pulse C^{126} Toffoli (13+6*77+4*18, 0 w=0, uni126Err=${toffUni126Err.toExponential(1)}): ||U16-Toff(x)I2||=${toffErr16.toExponential(2)}, leak16=${toffLeak16.toExponential(2)}, ||U8(0)-U8(1)||=${toffMatch01.toExponential(2)}, min|w_R|=${statsToff547.minAbsW.toFixed(6)}, min|dv_sym|=${statsToff547.minDvSym.toFixed(6)} (>53% c)`)
  console.log(`  [T2b] Strictly-Positive 2-Rapidity Set w_R in {+1/sqrt(3), +1} (alpha in {+2/3, +1/2}; w_sp in {-sqrt(3), -1}) Spin-Independent CZ:`)
  console.log(`        MITM pool=${mitm2Rap.poolSize}, total=${mitm2Rap.pulses} strictly-positive pulses (w0=${mitm2Rap.stats.w0Count}, negW=${mitm2Rap.stats.negWCount})`)
  console.log(`        S_AB=0: leak=${mitm2Rap.leak0.toExponential(2)}, ||U4-CZ||=${mitm2Rap.err0.toFixed(6)}, procFid=${mitm2Rap.fid0.toFixed(6)} | S_AB=1: leak=${mitm2Rap.leak1.toExponential(2)}, ||U4-CZ||=${mitm2Rap.err1.toFixed(6)}, procFid=${mitm2Rap.fid1.toFixed(6)} | ||U(0)-U(1)||=${mitm2Rap.match01.toExponential(2)}`)
  console.log(`  [T2c] Single-Rapidity Bare On-Dock M_meet Alone (E(+2/3) = omega * M_meet^dag = omega * M_meet^2, w_R = +1/sqrt(3) ONLY) on 5 Spins C(5,2)=10:`)
  console.log(`        Exact Lie closure dim = ${singleRapMmeet.dim} / 39 (= 15 + 24 = su(4) + su(5)), max action on (5)=${singleRapMmeet.maxOnSym5.toExponential(2)} | Negative control (alpha=1 SWAPs): dim=${singleRapMmeet.negSwapDim}`)
  console.log(`  [T2d] Exact Sym^2 Doublon Dispersion (M=16 Exact Bloch Diag) & w=0 Kinematic Breakdown + Householder F(0):`)
  console.log(`        M=16 exact diag: |k|<=4 (9/16 momenta) max|E_2 - E_2_ana|=${sym2Disp.maxE2ErrLowK.toExponential(2)} (< 1e-12!), all 16/16 (incl. P=+-pi/2 finite-size tail)=${sym2Disp.maxE2Err.toExponential(2)}`)
  console.log(`        max|dE_2/dP - v_2|=${sym2Disp.maxV2FdErr.toExponential(2)}, K=0 on-site P_{d=0}=${sym2Disp.pOnSiteK0.toFixed(12)} (exact 6/13=${(6 / 13).toFixed(12)})`)
  console.log(`        v_1(U)-v_2(U) at w=0: maxFormulaErr=${sym2Disp.maxDvFormulaErr.toExponential(2)}, at U=1/2: dv=${sym2Disp.dvAtHalf.toFixed(6)} (exact 9*sqrt(3)/56=${sym2Disp.dvAtHalfExact.toFixed(6)}), global peak max|dv|=${sym2Disp.maxDvExact.toFixed(6)} at U_*=${sym2Disp.uPeakExact.toFixed(6)} (grid ${sym2Disp.gridMaxDv.toFixed(6)} at ${sym2Disp.gridArgMax.toFixed(3)})`)
  console.log(`        Householder F(0) = -1/3 I + 2/3(P13+P23): altLeak=${sym2Disp.f0AltLeak.toExponential(1)}, err=${sym2Disp.f0Err.toExponential(2)}, ||F(0)^2-I||=${sym2Disp.f0InvErr.toExponential(2)}, P_el=${sym2Disp.pEl0.toFixed(6)} (1/9), P_swap=${sym2Disp.pSwap0.toFixed(6)} (8/9)`)

  const ok =
    origStats54.w0Count === 24 &&
    statsCZ76.w0Count === 0 &&
    statsCZ76.minAbsW > 0.20 &&
    statsCZ76.minDvSym > 0.34 &&
    cz76_err0 < 1e-13 &&
    cz76_err1 < 1e-13 &&
    cz76_match < 1e-13 &&
    cz76_S0.leak < 1e-14 &&
    cz76_S1.leak < 1e-14 &&
    statsCNOT77.w0Count === 0 &&
    Math.abs(statsCNOT77.minAbsW - 1 / SQRT3) < 1e-12 &&
    Math.abs(statsCNOT77.minDvSym - 0.536555) < 1e-5 &&
    cnot77_err0 < 1e-13 &&
    cnot77_err1 < 1e-13 &&
    cnot77_match < 1e-13 &&
    cnot77_S0.leak < 1e-14 &&
    cnot77_S1.leak < 1e-14 &&
    toff547Pulses.length === 547 &&
    statsToff547.w0Count === 0 &&
    Math.abs(statsToff547.minDvSym - 0.536555) < 1e-5 &&
    toffErr16 < 1e-13 &&
    toffLeak16 < 1e-13 &&
    toffMatch01 < 1e-13 &&
    toffUni126Err < 1e-12 &&
    mitm2Rap.stats.w0Count === 0 &&
    mitm2Rap.stats.negWCount === 0 &&
    mitm2Rap.leak0 < 1e-4 &&
    mitm2Rap.leak1 < 1e-4 &&
    mitm2Rap.err0 < 0.025 &&
    mitm2Rap.err1 < 0.025 &&
    mitm2Rap.fid0 > 0.9995 &&
    mitm2Rap.fid1 > 0.9995 &&
    mitm2Rap.match01 < 2e-4 &&
    singleRapMmeet.dim === 39 &&
    singleRapMmeet.negSwapDim === 0 &&
    singleRapMmeet.maxOnSym5 < 1e-13 &&
    sym2Disp.maxE2ErrLowK < 1e-12 &&
    sym2Disp.maxE2Err < 5e-6 &&
    sym2Disp.maxV2FdErr < 1e-8 &&
    Math.abs(sym2Disp.pOnSiteK0 - 6 / 13) < 1e-12 &&
    sym2Disp.maxDvFormulaErr < 1e-14 &&
    Math.abs(sym2Disp.dvAtHalf - sym2Disp.dvAtHalfExact) < 1e-14 &&
    Math.abs(sym2Disp.gridMaxDv - sym2Disp.maxDvExact) < 1e-6 &&
    sym2Disp.f0AltLeak < 1e-14 &&
    sym2Disp.f0Err < 1e-14 &&
    sym2Disp.f0InvErr < 1e-14 &&
    Math.abs(sym2Disp.pEl0 - 1 / 9) < 1e-14 &&
    Math.abs(sym2Disp.pSwap0 - 8 / 9) < 1e-14

  recordCheck(
    'T2',
    'Zero-w=0 exchange-gate compilation (externally scheduled): 76-CZ/77-CNOT/547-Toffoli, 2-rapidity +CZ, 1-rapidity M_meet su(4)+su(5)=39/39, & Sym^2 dispersion + F(0)',
    ok,
    `76-CZ=${cz76_err0.toExponential(1)}, 77-CNOT(dv=${statsCNOT77.minDvSym.toFixed(4)}), 547-Toff=${toffErr16.toExponential(1)}, 2-rap(${mitm2Rap.pulses}p,fid=${mitm2Rap.fid0.toFixed(5)}), M_meet=${singleRapMmeet.dim}/39, E2_err(|k|<=4)=${sym2Disp.maxE2ErrLowK.toExponential(1)}, F(0)^2=I`,
  )
}

// =================================================================================================
// PILLAR T3: 1D K-MIRROR CROSSING-COUNT BOUNDS (104 vs C(9,2)=36) & 3-PASS DISENTANGLING 4D CZ
// =================================================================================================

function buildPulse1D(M: number, p: number, m0: number, sig: number): [Float64Array, Float64Array] {
  const S = 2 * M
  const re = new Float64Array(S)
  const im = new Float64Array(S)
  const th = Math.acos(0.5 * Math.cos(p))
  const ratio = -(Math.sin(p) + 2 * Math.sin(th)) / SQRT3
  const w = cScale(ratio, cExpI(p))
  const inv = 1 / Math.hypot(1, Math.abs(ratio))
  const chi0: C = [inv, 0]
  const chi1: C = cScale(inv, w)
  let n2 = 0
  for (let m = 0; m < M; m++) {
    let dm = m - m0
    if (dm > M / 2) dm -= M
    if (dm < -M / 2) dm += M
    const env = Math.exp(-(dm * dm) / (4 * sig * sig))
    const ph = cExpI(2 * p * m)
    const a0 = cScale(env, cMul(ph, chi0))
    const a1 = cScale(env, cMul(ph, chi1))
    re[2 * m] = a0[0]; im[2 * m] = a0[1]
    re[2 * m + 1] = a1[0]; im[2 * m + 1] = a1[1]
    n2 += cAbs2(a0) + cAbs2(a1)
  }
  const sc = 1 / Math.sqrt(n2)
  for (let i = 0; i < S; i++) { re[i] = re[i]! * sc; im[i] = im[i]! * sc }
  return [re, im]
}

function buildDoublon1D(M: number, m0: number, sigD: number, maxD = 4): [Float64Array, Float64Array] {
  const S = 2 * M
  const re = new Float64Array(S * S)
  const im = new Float64Array(S * S)
  const uPP: C = [3 + 4 * W_C[0], 4 * W_C[1]]
  const uPM: C = [1, 0]
  const uMP: C = [-7 + 8 * W_C[0], 8 * W_C[1]]
  for (let m1 = 0; m1 < M; m1++) {
    let dm0 = m1 - m0
    if (dm0 > M / 2) dm0 -= M
    if (dm0 < -M / 2) dm0 += M
    const e0 = Math.exp(-(dm0 * dm0) / (4 * sigD * sigD))
    re[2 * m1 * S + (2 * m1 + 1)] = 13 * e0
    for (let d = 1; d <= maxD; d++) {
      const m2 = (m1 + d) % M
      let dcm = m1 + 0.5 * d - m0
      if (dcm > M / 2) dcm -= M
      if (dcm < -M / 2) dcm += M
      const env = Math.exp(-(dcm * dcm) / (4 * sigD * sigD)) * Math.pow(1 / 13, d - 1)
      for (const [c1, c2, u] of [
        [2 * m1, 2 * m2, uPP],
        [2 * m1, 2 * m2 + 1, uPM],
        [2 * m1 + 1, 2 * m2, uMP],
        [2 * m1 + 1, 2 * m2 + 1, uPP],
      ] as const) {
        const lo = Math.min(c1, c2)
        const hi = Math.max(c1, c2)
        const v = cScale(env, u)
        re[lo * S + hi] = re[lo * S + hi]! + v[0]
        im[lo * S + hi] = im[lo * S + hi]! + v[1]
      }
    }
  }
  let n2 = 0
  for (let a = 0; a < S; a++) {
    for (let b = a + 1; b < S; b++) n2 += re[a * S + b]! ** 2 + im[a * S + b]! ** 2
  }
  const sc = 1 / Math.sqrt(n2)
  for (let i = 0; i < S * S; i++) { re[i] = re[i]! * sc; im[i] = im[i]! * sc }
  return [re, im]
}

function step1Even(M: number, re: Float64Array, im: Float64Array): [Float64Array, Float64Array] {
  const S = 2 * M
  const nr = new Float64Array(S)
  const ni = new Float64Array(S)
  for (let m = 0; m < M; m++) {
    for (let s = 0; s < 2; s++) {
      const ar = re[2 * m + s]!
      const ai = im[2 * m + s]!
      if (ar === 0 && ai === 0) continue
      for (const t of [0, 1] as const) {
        const cm = C_MAT[t]![s]!
        const dst = 2 * (t === 0 ? m : (m - 1 + M) % M) + t
        nr[dst] = nr[dst]! + (ar * cm[0] - ai * cm[1])
        ni[dst] = ni[dst]! + (ar * cm[1] + ai * cm[0])
      }
    }
  }
  return [nr, ni]
}

function step2EvenSym(M: number, re: Float64Array, im: Float64Array): [Float64Array, Float64Array] {
  const S = 2 * M
  const nr = new Float64Array(S * S)
  const ni = new Float64Array(S * S)
  for (let a = 0; a < S; a++) {
    const m1 = a >> 1; const s1 = a & 1
    for (let b = a + 1; b < S; b++) {
      const ar = re[a * S + b]!
      const ai = im[a * S + b]!
      if (ar === 0 && ai === 0) continue
      const m2 = b >> 1; const s2 = b & 1
      if (m1 === m2) {
        const n1 = 2 * m1
        const n2 = 2 * ((m2 - 1 + M) % M) + 1
        const lo = n1 < n2 ? n1 : n2
        const hi = n1 < n2 ? n2 : n1
        nr[lo * S + hi] = nr[lo * S + hi]! + (ar * W2_C[0] - ai * W2_C[1])
        ni[lo * S + hi] = ni[lo * S + hi]! + (ar * W2_C[1] + ai * W2_C[0])
      } else {
        for (const t1 of [0, 1] as const) {
          const c1 = C_MAT[t1]![s1]!
          const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
          for (const t2 of [0, 1] as const) {
            const cc = cMul(c1, C_MAT[t2]![s2]!)
            const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2
            const lo = n1 < n2 ? n1 : n2
            const hi = n1 < n2 ? n2 : n1
            nr[lo * S + hi] = nr[lo * S + hi]! + (ar * cc[0] - ai * cc[1])
            ni[lo * S + hi] = ni[lo * S + hi]! + (ar * cc[1] + ai * cc[0])
          }
        }
      }
    }
  }
  return [nr, ni]
}

function runPillarT3(): void {
  console.log('\n================================================================================')
  console.log('PILLAR T3: 18-SPECIES 1D K-MIRROR CROSSING BOUNDS (104 vs 36) & 3-PASS DISENTANGLING CZ')
  console.log('================================================================================')

  // -----------------------------------------------------------------------------------------------
  // T3a(i): Verbatim 4D BigInt 18-Species M_pair = I Proof (All 9+9 Distinct (tone, role) Labels!)
  // -----------------------------------------------------------------------------------------------
  const [l0A, l0B] = LINES[0]!
  const docks9: number[] = [0]
  for (let i = 1; i < 9; i++) docks9.push(stepDock(docks9[i - 1]!, l0A))
  // All 18 distinct (tone, role) labels on one geodesic:
  //   docks 0..1: (+1,0)/(+1,1), (+1,2)/(+1,3) [active M_meet on tone +1]
  //   docks 2..3: (-1,0)/(-1,1), (-1,2)/(-1,3) [active M_meet on tone -1]
  //   docks 4..8: (+1,r)/(-1,r) for r = 4..8   [active K bounces between tone +1 and tone -1]
  const vibes18: Vibe[] = [
    [docks9[0]!, l0A, 1, 0], [docks9[0]!, l0B, 1, 1],
    [docks9[1]!, l0A, 1, 2], [docks9[1]!, l0B, 1, 3],
    [docks9[2]!, l0A, -1, 0], [docks9[2]!, l0B, -1, 1],
    [docks9[3]!, l0A, -1, 2], [docks9[3]!, l0B, -1, 3],
    [docks9[4]!, l0A, 1, 4], [docks9[4]!, l0B, -1, 4],
    [docks9[5]!, l0A, 1, 5], [docks9[5]!, l0B, -1, 5],
    [docks9[6]!, l0A, 1, 6], [docks9[6]!, l0B, -1, 6],
    [docks9[7]!, l0A, 1, 7], [docks9[7]!, l0B, -1, 7],
    [docks9[8]!, l0A, 1, 8], [docks9[8]!, l0B, -1, 8],
  ]
  const labelSet18 = new Set(vibes18.map(v => `${v[2]}:${v[3]}`))
  assertExact(vibes18.length === 18 && labelSet18.size === 18, `18 distinct species check`)
  const seed18 = basisKet(vibes18)
  const t1_18 = applyBeat(seed18)
  const t1_18_noPair = applyBeatSkip(seed18, applyPairLineMixer)
  const diff18_mPair = countStateDiffs(t1_18, t1_18_noPair)
  const rev18_diff = countStateDiffs(applyBeatInv(t1_18), seed18)
  let offLine18 = 0
  for (const k of t1_18.amp.keys()) {
    for (const [, sl] of decodeConfig(k)) if (LINE_OF_SLOT[sl] !== 0) offLine18++
  }
  assertExact(hasExactUnitNorm(t1_18), 'T3a 18-species unit norm')

  // Negative control & same-role 4D decay check: same-role (+1, 0)/(+1, 0) vs distinct-role (+1, 0)/(+1, 1)
  const sameRolePair = basisKet([[0, l0A, 1, 0], [0, l0B, 1, 0]])
  const sameRoleT1 = applyBeat(sameRolePair)
  const sameRoleNoPair = applyBeatSkip(sameRolePair, applyPairLineMixer)
  const sameRolePairDiff = countStateDiffs(sameRoleT1, sameRoleNoPair)
  let sameRoleOffProb = 0
  for (const [k, z] of sameRoleT1.amp) {
    const vs = decodeConfig(k)
    if (LINE_OF_SLOT[vs[0]![1]] !== 0) sameRoleOffProb += cAbs2(z9ToComplex(z, sameRoleT1.den))
  }
  const pOffExact = (11 * Math.sin(PI / 18) ** 2) / 36
  const gammaDecay = (6 / 13) * sameRoleOffProb
  const gammaExact = (6 / 13) * pOffExact
  const tauDecay = 1 / gammaDecay

  const distRolePair = basisKet([[0, l0A, 1, 0], [0, l0B, 1, 1]])
  const distRoleDiff = countStateDiffs(applyBeat(distRolePair), applyBeatSkip(distRolePair, applyPairLineMixer))

  // -----------------------------------------------------------------------------------------------
  // T3a(ii): Exact Deterministic 1D K-Mirror Billiard (4|9|5 -> 104, 4|6|5 -> 58, 0|9|0 -> 36, 0|6|0 -> 15)
  // -----------------------------------------------------------------------------------------------
  const runBilliard = (L: number, N: number, R: number) => {
    const M = L + N + R
    const pos: number[] = []
    const vel: number[] = []
    const tone: ToneNZ[] = []
    const role: number[] = []
    // All velocities strictly inside bare U's physical group-velocity band (-0.5, +0.5)!
    for (let i = 0; i < L; i++) {
      const k = L - 1 - i
      pos.push(-500 - 2000 * k - 0.13 * i * i * i)
      vel.push(0.49 - 0.01 * k)
      tone.push(-1)
      role.push(i)
    }
    for (let i = 0; i < N; i++) {
      pos.push(i * 5 + 0.07 * i * i * i)
      vel.push(0.05 - 0.011 * i)
      tone.push(1)
      role.push(i)
    }
    for (let i = 0; i < R; i++) {
      pos.push(1500 + 2000 * i + 0.19 * i * i * i)
      vel.push(-0.49 + 0.01 * i)
      tone.push(-1)
      role.push(L + i)
    }
    // Verify all (tone, role) labels are distinct and |v| < 0.5
    const seenLab = new Set<string>()
    for (let i = 0; i < M; i++) {
      assertExact(Math.abs(vel[i]!) < 0.5, `velocity out of bare-U band: ${vel[i]}`)
      seenLab.add(`${tone[i]}:${role[i]}`)
    }
    assertExact(seenLab.size === M, `duplicate (tone,role) label in ${L}|${N}|${R}`)

    // Method 1: Exact event-driven 1D particle simulation (S_K = -1 swaps velocities on (+1)/(-1) bounce!)
    const x = pos.slice()
    const v = vel.slice()
    let pp = 0; let mm = 0; let pm = 0
    let lastA = -1; let lastB = -1
    for (let iter = 0; iter < 50000; iter++) {
      let bestDt = Number.POSITIVE_INFINITY
      let bi = -1; let bj = -1
      for (let i = 0; i < M; i++) {
        for (let j = i + 1; j < M; j++) {
          if (i === lastA && j === lastB) continue
          const dx = x[j]! - x[i]!
          const dv = v[i]! - v[j]!
          if (dx * dv <= 0) continue
          const dt = dx / dv
          if (dt >= 0 && dt < bestDt) { bestDt = dt; bi = i; bj = j }
        }
      }
      if (bi < 0) break
      for (let i = 0; i < M; i++) x[i] = x[i]! + v[i]! * bestDt
      lastA = bi; lastB = bj
      if (tone[bi] === 1 && tone[bj] === 1) pp++
      else if (tone[bi] === -1 && tone[bj] === -1) mm++
      else { pm++; const tmp = v[bi]!; v[bi] = v[bj]!; v[bj] = tmp }
    }

    // Method 2: Independent cross-check via exact straight-line rank theorem
    let ppLines = 0; let mmLines = 0; let pmLines = 0
    for (let i = 0; i < M; i++) {
      for (let j = i + 1; j < M; j++) {
        const dx = pos[j]! - pos[i]!
        const dv = vel[i]! - vel[j]!
        if (dx * dv <= 0) continue
        const tc = dx / dv
        const xc = pos[i]! + vel[i]! * tc
        let leftCount = 0
        for (let k = 0; k < M; k++) {
          if (k === i || k === j) continue
          if (pos[k]! + vel[k]! * tc < xc) leftCount++
        }
        if (leftCount >= L && leftCount <= L + N - 2) ppLines++
        else if (leftCount === L - 1 || leftCount === L + N - 1) pmLines++
        else mmLines++
      }
    }
    assertExact(pp === ppLines && mm === mmLines && pm === pmLines, `billiard vs lines mismatch (${pp}/${ppLines})`)
    return { pp, mm, pm }
  }

  const bil495 = runBilliard(4, 9, 5)
  const bil465 = runBilliard(4, 6, 5)
  const bil090 = runBilliard(0, 9, 0)
  const bil060 = runBilliard(0, 6, 0)

  // -----------------------------------------------------------------------------------------------
  // T3b: Exact 3-Pass Disentangling 4D CZ Identity F(+-sqrt(3)/2)^3 = -I_3 & Live 3-Pass Wavepacket
  // -----------------------------------------------------------------------------------------------
  const buildF3Analytic = (w: number): { readonly F: CMat; readonly cubeErr: number; readonly altLeak: number } => {
    const perms3: readonly (readonly [number, number, number])[] = [
      [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
    ]
    const applyR6 = (v: readonly C[], iA: number, iB: number, wRe: number, wIm: number): C[] => {
      const rI = cDiv([wRe, wIm], [wRe, wIm + 1])
      const rP = cDiv([0, -1], [wRe, wIm + 1])
      const out: C[] = Array.from({ length: 6 }, () => C_ZERO)
      for (let idx = 0; idx < 6; idx++) {
        const p = perms3[idx]!
        const sw: [number, number, number] = [p[0], p[1], p[2]]
        const t = sw[iA]!; sw[iA] = sw[iB]!; sw[iB] = t
        const j = perms3.findIndex(q => q[0] === sw[0] && q[1] === sw[1] && q[2] === sw[2])
        out[idx] = cAdd(out[idx]!, cMul(v[idx]!, rI))
        out[j] = cAdd(out[j]!, cMul(v[idx]!, rP))
      }
      return out
    }
    const sym3Pairs: readonly (readonly [number, number])[] = [[0, 2], [1, 4], [3, 5]]
    const F: CMat = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => C_ZERO))
    let altLeak = 0
    for (let col = 0; col < 3; col++) {
      const v: C[] = Array.from({ length: 6 }, () => C_ZERO)
      const [a, b] = sym3Pairs[col]!
      v[a] = [ISQ2, 0]; v[b] = [ISQ2, 0]
      const out = applyR6(applyR6(v, 1, 2, w, -0.5), 0, 2, w, +0.5)
      for (let row = 0; row < 3; row++) {
        const [ra, rb] = sym3Pairs[row]!
        F[row]![col] = cScale(ISQ2, cAdd(out[ra]!, out[rb]!))
        altLeak += cAbs(cSub(out[ra]!, out[rb]!))
      }
    }
    const F3 = matMul(F, matMul(F, F))
    const negI3: CMat = [
      [[-1, 0], C_ZERO, C_ZERO],
      [C_ZERO, [-1, 0], C_ZERO],
      [C_ZERO, C_ZERO, [-1, 0]],
    ]
    return { F, cubeErr: matFrobDiff(F3, negI3), altLeak }
  }
  const fPlus = buildF3Analytic(+SQRT3 / 2)
  const fMinus = buildF3Analytic(-SQRT3 / 2)

  // Live Time-Domain 3-Role (0, 1, 2) 3-Pass Wavepacket Evolution on M = 20 Periodic Ring!
  // Stationary doublon |{0,1}_Sym> at m = 11, flying pulse |2> at m = 2 with p* = -atan(6*sqrt(3)/5) (u* = -sqrt(3)/2, v_g = 6/13 docks/beat = 3/13 even-sites/beat)
  // Lap period = 20 / (3/13) = 86.67 beats:
  //   Pass 1 ~ t = 39  -> clean separation at t = 76
  //   Pass 2 ~ t = 126 -> clean separation at t = 164
  //   Pass 3 ~ t = 213 -> clean separation at t = 248 (disentangled elastic recovery + phase ~ pi!)
  const threePassSim = (() => {
    const M = 20
    const S = 2 * M // 40
    const S2 = S * S
    const S3 = S * S2 // 64,000
    const pStar = -Math.atan((6 * SQRT3) / 5)
    const [dR0, dI0] = buildDoublon1D(M, 11, 2.0, 5)
    const [pR0, pI0] = buildPulse1D(M, pStar, 2, 2.4)

    let stR = new Float64Array(S3)
    let stI = new Float64Array(S3)
    for (let a = 0; a < S; a++) {
      for (let b = a + 1; b < S; b++) {
        const dar = dR0[a * S + b]!; const dai = dI0[a * S + b]!
        if (dar === 0 && dai === 0) continue
        for (let c = 0; c < S; c++) {
          if (c === a || c === b) continue
          const pcr = pR0[c]!; const pci = pI0[c]!
          if (pcr === 0 && pci === 0) continue
          const vr = ISQ2 * (dar * pcr - dai * pci)
          const vi = ISQ2 * (dar * pci + dai * pcr)
          stR[a * S2 + b * S + c] = vr; stI[a * S2 + b * S + c] = vi
          stR[b * S2 + a * S + c] = vr; stI[b * S2 + a * S + c] = vi
        }
      }
    }
    let n2Init = 0
    for (let i = 0; i < S3; i++) n2Init += stR[i]! ** 2 + stI[i]! ** 2
    const sc0 = 1 / Math.sqrt(n2Init)
    for (let i = 0; i < S3; i++) { stR[i] = stR[i]! * sc0; stI[i] = stI[i]! * sc0 }

    let nr = new Float64Array(S3)
    let ni = new Float64Array(S3)
    let refDR = dR0; let refDI = dI0
    let refPR = pR0; let refPI = pI0

    const mkKeep = cMul(W_C, MEET_KEEP)
    const mkSwap = cMul(W_C, MEET_SWAP)
    const dCyc = (a: number, b: number) => Math.min(Math.abs(a - b), M - Math.abs(a - b))

    interface PassSnap {
      readonly t: number
      readonly pEl: number
      readonly pSw1: number
      readonly pSw0: number
      readonly pSurv: number
      readonly sVN: number
      readonly argEl: number
      readonly bestWigFid: number
      readonly bestWigArg: number
      readonly bestSh: number
    }

    const measureSnap = (t: number): PassSnap => {
      let pEl = 0; let pSw1 = 0; let pSw0 = 0
      for (let a = 0; a < S; a++) {
        const m0 = a >> 1
        for (let b = 0; b < S; b++) {
          if (b === a) continue
          const m1 = b >> 1
          const base = a * S2 + b * S
          for (let c = 0; c < S; c++) {
            if (c === a || c === b) continue
            const vr = stR[base + c]!; const vi = stI[base + c]!
            const w = vr * vr + vi * vi
            if (w === 0) continue
            const m2 = c >> 1
            const d01 = dCyc(m0, m1); const d02 = dCyc(m0, m2); const d12 = dCyc(m1, m2)
            const dMin = Math.min(d01, d02, d12)
            if (dMin > 3) continue
            if (d01 === dMin && d01 < d02 && d01 < d12) pEl += w
            else if (d02 === dMin && d02 < d01 && d02 < d12) pSw1 += w
            else if (d12 === dMin && d12 < d01 && d12 < d02) pSw0 += w
          }
        }
      }
      const pSurv = pEl + pSw1 + pSw0
      const ent = (p: number) => (p > 1e-12 ? -p * Math.log2(p) : 0)
      const sVN = ent(pEl / pSurv) + ent(pSw1 / pSurv) + ent(pSw0 / pSurv)

      const evalOvShift = (sh: number) => {
        let ovR = 0; let ovI = 0
        for (let a = 0; a < S; a++) {
          for (let b = a + 1; b < S; b++) {
            const dar = refDR[a * S + b]!; const dai = refDI[a * S + b]!
            if (dar === 0 && dai === 0) continue
            for (let c = 0; c < S; c++) {
              if (c === a || c === b) continue
              const cSh = 2 * ((((c >> 1) - sh + M) % M + M) % M) + (c & 1)
              const pcr = refPR[cSh]!; const pci = refPI[cSh]!
              if (pcr === 0 && pci === 0) continue
              const rr = ISQ2 * (dar * pcr - dai * pci)
              const ri = ISQ2 * (dar * pci + dai * pcr)
              const s1r = stR[a * S2 + b * S + c]!; const s1i = stI[a * S2 + b * S + c]!
              const s2r = stR[b * S2 + a * S + c]!; const s2i = stI[b * S2 + a * S + c]!
              ovR += rr * (s1r + s2r) + ri * (s1i + s2i)
              ovI += rr * (s1i + s2i) - ri * (s1r + s2r)
            }
          }
        }
        return { fid: ovR * ovR + ovI * ovI, arg: Math.atan2(ovI, ovR) }
      }
      const baseOv = evalOvShift(0)
      let bestWigFid = baseOv.fid; let bestWigArg = baseOv.arg; let bestSh = 0
      for (const sh of [-4, -3, -2, -1, 1, 2, 3, 4]) {
        const cand = evalOvShift(sh)
        if (cand.fid > bestWigFid) { bestWigFid = cand.fid; bestWigArg = cand.arg; bestSh = sh }
      }
      return { t, pEl, pSw1, pSw0, pSurv, sVN, argEl: baseOv.arg, bestWigFid, bestWigArg, bestSh }
    }

    const snap0 = measureSnap(0)
    const T_MAX = 248
    const checkTimes = new Set<number>([76, 164, 248])
    const snaps = new Map<number, PassSnap>()
    let maxNormErr = 0

    for (let t = 1; t <= T_MAX; t++) {
      ;[refDR, refDI] = step2EvenSym(M, refDR, refDI)
      ;[refPR, refPI] = step1Even(M, refPR, refPI)
      nr.fill(0); ni.fill(0)
      for (let a = 0; a < S; a++) {
        const m0 = a >> 1; const s0 = a & 1
        for (let b = 0; b < S; b++) {
          if (b === a) continue
          const m1 = b >> 1; const s1 = b & 1
          const base = a * S2 + b * S
          for (let c = 0; c < S; c++) {
            if (c === a || c === b) continue
            const ar = stR[base + c]!; const ai = stI[base + c]!
            if (ar === 0 && ai === 0) continue
            const m2 = c >> 1; const s2 = c & 1
            if (m0 === m1) {
              const dst0 = 2 * (s0 === 0 ? m0 : (m0 - 1 + M) % M) + s0
              const dst1 = 2 * (s1 === 0 ? m1 : (m1 - 1 + M) % M) + s1
              const kr = ar * mkKeep[0] - ai * mkKeep[1]; const ki = ar * mkKeep[1] + ai * mkKeep[0]
              const sr = ar * mkSwap[0] - ai * mkSwap[1]; const si = ar * mkSwap[1] + ai * mkSwap[0]
              for (const t2 of [0, 1] as const) {
                const cm = C_MAT[t2]![s2]!
                const dst2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2
                const idxK = dst0 * S2 + dst1 * S + dst2
                const idxS = dst1 * S2 + dst0 * S + dst2
                nr[idxK] = nr[idxK]! + (kr * cm[0] - ki * cm[1]); ni[idxK] = ni[idxK]! + (kr * cm[1] + ki * cm[0])
                nr[idxS] = nr[idxS]! + (sr * cm[0] - si * cm[1]); ni[idxS] = ni[idxS]! + (sr * cm[1] + si * cm[0])
              }
            } else if (m0 === m2) {
              const dst0 = 2 * (s0 === 0 ? m0 : (m0 - 1 + M) % M) + s0
              const dst2 = 2 * (s2 === 0 ? m2 : (m2 - 1 + M) % M) + s2
              const kr = ar * mkKeep[0] - ai * mkKeep[1]; const ki = ar * mkKeep[1] + ai * mkKeep[0]
              const sr = ar * mkSwap[0] - ai * mkSwap[1]; const si = ar * mkSwap[1] + ai * mkSwap[0]
              for (const t1 of [0, 1] as const) {
                const cm = C_MAT[t1]![s1]!
                const dst1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
                const idxK = dst0 * S2 + dst1 * S + dst2
                const idxS = dst2 * S2 + dst1 * S + dst0
                nr[idxK] = nr[idxK]! + (kr * cm[0] - ki * cm[1]); ni[idxK] = ni[idxK]! + (kr * cm[1] + ki * cm[0])
                nr[idxS] = nr[idxS]! + (sr * cm[0] - si * cm[1]); ni[idxS] = ni[idxS]! + (sr * cm[1] + si * cm[0])
              }
            } else if (m1 === m2) {
              const dst1 = 2 * (s1 === 0 ? m1 : (m1 - 1 + M) % M) + s1
              const dst2 = 2 * (s2 === 0 ? m2 : (m2 - 1 + M) % M) + s2
              const kr = ar * mkKeep[0] - ai * mkKeep[1]; const ki = ar * mkKeep[1] + ai * mkKeep[0]
              const sr = ar * mkSwap[0] - ai * mkSwap[1]; const si = ar * mkSwap[1] + ai * mkSwap[0]
              for (const t0 of [0, 1] as const) {
                const cm = C_MAT[t0]![s0]!
                const dst0 = 2 * (t0 === 0 ? m0 : (m0 - 1 + M) % M) + t0
                const idxK = dst0 * S2 + dst1 * S + dst2
                const idxS = dst0 * S2 + dst2 * S + dst1
                nr[idxK] = nr[idxK]! + (kr * cm[0] - ki * cm[1]); ni[idxK] = ni[idxK]! + (kr * cm[1] + ki * cm[0])
                nr[idxS] = nr[idxS]! + (sr * cm[0] - si * cm[1]); ni[idxS] = ni[idxS]! + (sr * cm[1] + si * cm[0])
              }
            } else {
              for (const t0 of [0, 1] as const) {
                const c0 = C_MAT[t0]![s0]!; const d0 = 2 * (t0 === 0 ? m0 : (m0 - 1 + M) % M) + t0
                const r0 = ar * c0[0] - ai * c0[1]; const i0 = ar * c0[1] + ai * c0[0]
                for (const t1 of [0, 1] as const) {
                  const c1 = C_MAT[t1]![s1]!; const d1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
                  const r1 = r0 * c1[0] - i0 * c1[1]; const i1 = r0 * c1[1] + i0 * c1[0]
                  for (const t2 of [0, 1] as const) {
                    const c2 = C_MAT[t2]![s2]!; const d2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2
                    const idx = d0 * S2 + d1 * S + d2
                    nr[idx] = nr[idx]! + (r1 * c2[0] - i1 * c2[1])
                    ni[idx] = ni[idx]! + (r1 * c2[1] + i1 * c2[0])
                  }
                }
              }
            }
          }
        }
      }
      const tr = stR; const ti = stI; stR = nr; stI = ni; nr = tr; ni = ti
      if (checkTimes.has(t)) {
        let n2 = 0
        for (let i = 0; i < S3; i++) n2 += stR[i]! ** 2 + stI[i]! ** 2
        maxNormErr = Math.max(maxNormErr, Math.abs(n2 - 1))
        snaps.set(t, measureSnap(t))
      }
    }
    return { maxNormErr, snap0, snap1: snaps.get(76)!, snap2: snaps.get(164)!, snap3: snaps.get(248)! }
  })()

  console.log(`  [T3a] Verbatim 4D BigInt 18-Species M_pair = I Proof & 1D Point-Particle K-Mirror Crossing-Count Bounds:`)
  console.log(`        18 distinct (tone,role) species on 1 geodesic: branches=${t1_18.amp.size}, M_pair diff=${diff18_mPair}, off-line=${offLine18}, revDiff=${rev18_diff} (exact M_pair = I)`)
  console.log(`        Negative control (same-role pair): M_pair diff=${sameRolePairDiff}, P_off=${sameRoleOffProb.toFixed(8)} (exact 11*sin^2(pi/18)/36=${pOffExact.toFixed(8)}) | distinct-role pair diff=${distRoleDiff}`)
  console.log(`        4|9|5 1D Point-Particle Crossing Bound (9 +1 particles): (+1/+1) crossings = ${bil495.pp} (${(bil495.pp / 36).toFixed(2)}x above C(9,2)=36), pm=${bil495.pm}, mm=${bil495.mm}`)
  console.log(`        4|6|5 1D Point-Particle Crossing Bound (6 +1 particles): (+1/+1) crossings = ${bil465.pp} (${(bil465.pp / 15).toFixed(2)}x above C(6,2)=15; note 58 < 77 for 6 +1 particles), pm=${bil465.pm}, mm=${bil465.mm}`)
  console.log(`        0-Mirror Negative Controls: 0|9|0 -> ${bil090.pp} (<= 36 = C(9,2)), 0|6|0 -> ${bil060.pp} (<= 15 = C(6,2))`)
  console.log(`        Scope note: 104 and 58 are 1D point-particle crossing-count bounds only; autonomous circuit compilation remains obstructed by YBE parameter collapse and wavepacket dispersion.`)
  console.log(`  [T3b] Exact 3-Pass Disentangling 4D CZ Identity F(+-sqrt(3)/2)^3 = -I_3 & Same-Role 4D Decay:`)
  console.log(`        Analytic: ||F(+sqrt(3)/2)^3 + I_3||_F=${fPlus.cubeErr.toExponential(2)} (altLeak=${fPlus.altLeak.toExponential(1)}), ||F(-sqrt(3)/2)^3 + I_3||_F=${fMinus.cubeErr.toExponential(2)} (altLeak=${fMinus.altLeak.toExponential(1)})`)
  console.log(`        Live 3-Role (0,1,2) Wavepacket 3-Pass Evolution (M=20 ring, uninterrupted bare U^t, normErr=${threePassSim.maxNormErr.toExponential(1)}):`)
  for (const [lbl, s] of [
    ['Pass 0 (t=  0)', threePassSim.snap0],
    ['Pass 1 (t= 76)', threePassSim.snap1],
    ['Pass 2 (t=164)', threePassSim.snap2],
    ['Pass 3 (t=248)', threePassSim.snap3],
  ] as const) {
    console.log(`          ${lbl}: P_el=${s.pEl.toFixed(5)} (rel ${(s.pEl / s.pSurv).toFixed(4)}), P_sw=(${s.pSw1.toFixed(5)}, ${s.pSw0.toFixed(5)}), pSurv=${s.pSurv.toFixed(5)}, S_vN=${s.sVN.toFixed(5)} b, argEl=${(s.argEl / PI).toFixed(4)} pi (wigFid=${s.bestWigFid.toFixed(4)} @ sh=${s.bestSh})`)
  }
  console.log(`        Same-Role Sym^2 4D M_pair Leading-Order / Single-Beat Decay Rate: gamma = (6/13) * P_off = ${gammaDecay.toFixed(7)}/beat (exact single-beat ${gammaExact.toFixed(7)}, tau_{1/e} = ${tauDecay.toFixed(2)} beats; P_{d=0}=6/13 and P_off are individually exact, multi-beat corrections O(P_off^2) ~ 8e-5; vs gamma=0 for distinct roles)`)

  const ok =
    diff18_mPair === 0 &&
    offLine18 === 0 &&
    rev18_diff === 0 &&
    sameRolePairDiff > 0 &&
    distRoleDiff === 0 &&
    Math.abs(sameRoleOffProb - pOffExact) < 1e-13 &&
    Math.abs(gammaDecay - gammaExact) < 1e-13 &&
    Math.abs(tauDecay - 235.16) < 0.05 &&
    bil495.pp === 104 &&
    bil465.pp >= 50 &&
    bil090.pp <= 36 &&
    bil060.pp <= 15 &&
    fPlus.cubeErr < 1e-14 &&
    fMinus.cubeErr < 1e-14 &&
    fPlus.altLeak < 1e-14 &&
    fMinus.altLeak < 1e-14 &&
    threePassSim.maxNormErr < 1e-12 &&
    threePassSim.snap0.sVN < 0.02 &&
    threePassSim.snap1.sVN > 1.55 &&
    threePassSim.snap2.sVN > 1.55 &&
    threePassSim.snap3.sVN < 0.75 &&
    threePassSim.snap3.pEl / threePassSim.snap3.pSurv > 0.85 &&
    Math.abs(Math.abs(threePassSim.snap3.argEl) - PI) < 0.10 * PI

  recordCheck(
    'T3',
    '18-species 4D M_pair=I, 1D point-particle K-mirror crossing bounds (4|9|5=104 vs 36, 4|6|5=58 vs 15), F(+-sqrt(3)/2)^3=-I_3 3-pass CZ, & single-beat decay',
    ok,
    `18-sp diff=0, 4|9|5=${bil495.pp}, 4|6|5=${bil465.pp}, 0|9|0=${bil090.pp}, F^3+I=${fPlus.cubeErr.toExponential(1)}, S_vN=(${threePassSim.snap0.sVN.toFixed(2)}->${threePassSim.snap1.sVN.toFixed(2)}->${threePassSim.snap2.sVN.toFixed(2)}->${threePassSim.snap3.sVN.toFixed(2)}b), gamma_1beat=${gammaDecay.toFixed(7)} (tau=${tauDecay.toFixed(1)})`,
  )
}

function main(): void {
  const startNs = process.hrtime.bigint()
  runPillarT1()
  runPillarT2()
  runPillarT3()

  const elapsedMs = Number(process.hrtime.bigint() - startNs) / 1e6
  const rssMb = process.memoryUsage().rss / (1024 * 1024)
  const passedCount = CHECKS.filter(c => c.passed).length

  console.log('\n================================================================================')
  console.log('FINAL VERIFICATION LEDGER (WAVE-5: ARBITRARY-n MARIN & ZERO-w=0 UNIVERSALITY)')
  console.log('================================================================================')
  for (const row of CHECKS) {
    console.log(`  [${row.passed ? 'PASS' : 'FAIL'}] ${row.pillar.padEnd(4)} | ${row.name}`)
    console.log(`         -> ${row.detail}`)
  }
  console.log(`  SUMMARY: ${passedCount}/${CHECKS.length} CHECKS PASSED | runtime = ${(elapsedMs / 1000).toFixed(2)} s | peak RSS = ${rssMb.toFixed(1)} MB`)
  assertExact(passedCount === CHECKS.length, `Only ${passedCount}/${CHECKS.length} checks passed`)
}

main()

export {}
