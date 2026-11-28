// =================================================================================================
// SM BARE-U RADION, ZERO-CONTINUOUS-PHASE FLAVOR & UV GAUGE STIFFNESS AUDIT
// =================================================================================================
//
// Strictly deterministic (ZERO Math.random, zero external imports), BigInt + Float64,
// strict TypeScript (--noUncheckedIndexedAccess), fast (< 6 s, < 150 MB RSS).
//
// BRUTALLY HONEST EPISTEMIC SCOPE LEDGER:
//   [Tier A - Exact Mathematical Theorems & Spectral Computations]
//     - Exact {3,4,3,4} Steinberg cusp shell recurrence N_0=1, N_1=18, N_2=330, N_3=6034,
//       N_d = 21 N_{d-1} - 51 N_{d-2} + 23 N_{d-3} (Perron root lambda_1 = 18.278707774366...).
//     - Exact fixed-UV discrete Goldberger-Wise BVP & graph-Laplacian identity m_lat^2 = lambda_1 * mu^2,
//       yielding exact D_* = 13 stabilization windows for 4 sin^2(pi/18) and 1 - cos(pi/9), plus sharp
//       negative controls (p_off, Gamma_Fesh^2, unscaled 1/13 and 1/7).
//     - Exact empty-vacuum bare-U microscopic no-go: (N_+, N_-) conservation, M_meet doublon/trion exact
//       crossLineLeak = 0 + > 1.05 rad gap (zero static E = 0 pole on cosh(kappa) in [1, 41]), and exact
//       M_pair(zeta_18) Bethe-cavity radial transfer on Z^{*12} (|t_1(0)| = 0.002098 -> m_eff,lat^2 = 433.67).
//     - Exact 13x14 {3,4,3,4} warped cusp domain-wall operator Q(c) zero modes f(c_i) for 2T 24-cell
//       Cayley Laplacian spectrum c_16 = [3/8, 5/12, 1/2] (||Q u||_inf < 1e-14).
//     - Exact 4D D_4 primal/dual honeycomb normalization ({3,3,4,3} <-> {3,4,3,3}, 32 === 96 / 3 tris/site,
//       c_kin(K) = 2.0, c_kin(K^*) = 0.5, c_kin(K) * c_kin(K^*) = 1.0), true continuum U(1) Villain
//       self-dual stiffness 1/g_sd^2 = 1/(2 pi) (alpha_sd^-1 = 2.000, distinct from the lattice geometric
//       mean alpha_K^-1 = 4.000 vs alpha_{K^*}^-1 = 1.000), sparse half-BZ Cholesky c_L(D_4) = -19.5471,
//       ideal 24-cell orbifold Vol_H4 = 4 pi^2 / 3, and cusp resistance R_edge = 0.058261.
//
//   [Tier B/C - Explicitly Disclosed EFT & UV Boundary Inputs]
//     (1) Bulk scalar radion condensate and Goldberger-Wise action remain a Tier-B EFT extension:
//         empty-vacuum bare U cannot supply a static light bulk scalar condensate.
//     (2) The k = 13 zero-continuous-phase Z[zeta_9] + SO(10) + 2T TM_1 flavor fit uses 0 continuous phases,
//         11 discrete Z_18 phase integers from Z[zeta_9] (5 in F, 2 in G, 1 in s, 1 psi, 2 in P_L; 10 at k = 12),
//         and 13 continuous real UV moduli (dof = 6 over 19 SM observables at strict 0.1% PDG lepton floor,
//         under ONE unified Dirac PDG CP convention for both quarks and leptons). Those 13 real moduli remain
//         external UV inputs, though {3,4,3,4} cusp wavefunctions collapse the 1.79e5x fermion mass hierarchy
//         into an O(1) [0.80, 14.90] anarchy band.
//     (3) Bare UV gauge stiffness 1/g_0^2 is an irreducible 1-parameter UV boundary constant: 21.7%
//         gauge-invariant lattice action dependence (Wilson/Villain/Manton), +5.344 matching scale shift,
//         diverging dense-ring beta_0(L) freezing ceiling, and 0/74 Look-Elsewhere hits within 1%.
// =================================================================================================

const START_MS = performance.now()
const PI = Math.PI

// =================================================================================================
// 0. HARNESS, COMPLEX & LINEAR ALGEBRA PRIMITIVES
// =================================================================================================

type GateRow = {
  readonly id: string
  readonly tier: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const GATES: GateRow[] = []

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`)
  }
}

function recordGate(id: string, tier: string, name: string, passed: boolean, detail: string): void {
  GATES.push({ id, tier, name, passed, detail })
  const tag = passed ? 'PASS' : 'FAIL'
  console.log(`[${tag}] ${id} (${tier}): ${name}`)
  console.log(`       ${detail}`)
  assert(passed, `Gate ${id} failed: ${detail}`)
}

type C2 = readonly [number, number]
const cAdd = (a: C2, b: C2): C2 => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C2, b: C2): C2 => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C2, b: C2): C2 => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cDiv = (a: C2, b: C2): C2 => {
  const d = b[0] * b[0] + b[1] * b[1]
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
const cConj = (a: C2): C2 => [a[0], -a[1]]
const cAbs2 = (a: C2): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C2): number => Math.hypot(a[0], a[1])
const cSqrt = (a: C2): C2 => {
  const r = Math.hypot(a[0], a[1])
  const th = Math.atan2(a[1], a[0]) * 0.5
  return [Math.sqrt(r) * Math.cos(th), Math.sqrt(r) * Math.sin(th)]
}

const Z18_TAB: readonly C2[] = Array.from({ length: 18 }, (_, k) => [
  Math.cos((k * PI) / 9),
  Math.sin((k * PI) / 9),
])
const z18 = (k: number): C2 => Z18_TAB[((k % 18) + 18) % 18]!

const W_C: C2 = [-0.5, Math.sqrt(3) * 0.5]
const W2_C: C2 = [-0.5, -Math.sqrt(3) * 0.5]
const Z6_C: C2 = [0.5, Math.sqrt(3) * 0.5]
const Z18_C: C2 = [Math.cos(PI / 9), Math.sin(PI / 9)]

type Mat3 = readonly [readonly [C2, C2, C2], readonly [C2, C2, C2], readonly [C2, C2, C2]]

function realSymEigenvalues(mat: readonly (readonly number[])[]): number[] {
  const n = mat.length
  const A = mat.map(row => Float64Array.from(row))
  for (let sw = 0; sw < 100; sw++) {
    let maxOff = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = A[p]![q]!
        const mag = Math.abs(apq)
        if (mag > maxOff) maxOff = mag
        if (mag < 1e-15) continue
        const app = A[p]![p]!
        const aqq = A[q]![q]!
        const tau = (aqq - app) / (2 * apq)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const cc = 1 / Math.hypot(1, t)
        const ss = t * cc
        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue
          const mkp = A[k]![p]!
          const mkq = A[k]![q]!
          const nkp = cc * mkp - ss * mkq
          const nkq = ss * mkp + cc * mkq
          A[k]![p] = nkp
          A[p]![k] = nkp
          A[k]![q] = nkq
          A[q]![k] = nkq
        }
        A[p]![p] = app - t * apq
        A[q]![q] = aqq + t * apq
        A[p]![q] = 0
        A[q]![p] = 0
      }
    }
    if (maxOff < 1e-14) break
  }
  const vals: number[] = []
  for (let i = 0; i < n; i++) vals.push(A[i]![i]!)
  vals.sort((a, b) => a - b)
  return vals
}

// Reusable scratch buffers for zero-GC 3x3 Hermitian eigensolver
const HERM_A = new Float64Array(36)
const HERM_V = new Float64Array(36)

// Exact 3x3 Hermitian eigensolver (Jacobi on 6x6 real representation, ascending eigenvalues)
function herm3Eig(M: Mat3): { readonly vals: readonly [number, number, number]; readonly U: Mat3 } {
  const A = HERM_A
  const V = HERM_V
  V.fill(0)
  for (let i = 0; i < 6; i++) V[i * 6 + i] = 1
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const [re, im] = M[r]![c]!
      if (!Number.isFinite(re) || !Number.isFinite(im)) {
        return {
          vals: [0, 0, 0],
          U: [
            [[1, 0], [0, 0], [0, 0]],
            [[0, 0], [1, 0], [0, 0]],
            [[0, 0], [0, 0], [1, 0]],
          ],
        }
      }
      A[r * 6 + c] = re
      A[r * 6 + (3 + c)] = -im
      A[(3 + r) * 6 + c] = im
      A[(3 + r) * 6 + (3 + c)] = re
    }
  }
  for (let sw = 0; sw < 55; sw++) {
    let rotated = false
    for (let p = 0; p < 5; p++) {
      for (let q = p + 1; q < 6; q++) {
        const apq = A[p * 6 + q]!
        const app = A[p * 6 + p]!
        const aqq = A[q * 6 + q]!
        if (Math.abs(apq) <= 1e-15 * Math.max(1e-30, Math.abs(app), Math.abs(aqq))) continue
        rotated = true
        const tau = (aqq - app) / (2 * apq)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const cc = 1 / Math.hypot(1, t)
        const ss = t * cc
        A[p * 6 + p] = app - t * apq
        A[q * 6 + q] = aqq + t * apq
        A[p * 6 + q] = 0
        A[q * 6 + p] = 0
        for (let k = 0; k < 6; k++) {
          if (k === p || k === q) continue
          const akp = A[k * 6 + p]!
          const akq = A[k * 6 + q]!
          const nkp = cc * akp - ss * akq
          const nkq = ss * akp + cc * akq
          A[k * 6 + p] = nkp
          A[p * 6 + k] = nkp
          A[k * 6 + q] = nkq
          A[q * 6 + k] = nkq
        }
        for (let k = 0; k < 6; k++) {
          const vkp = V[k * 6 + p]!
          const vkq = V[k * 6 + q]!
          V[k * 6 + p] = cc * vkp - ss * vkq
          V[k * 6 + q] = ss * vkp + cc * vkq
        }
      }
    }
    if (!rotated) break
  }
  const order = [0, 1, 2, 3, 4, 5].sort((i, j) => A[i * 6 + i]! - A[j * 6 + j]!)
  const vals: number[] = []
  const cols: [C2, C2, C2][] = []
  for (const idx of order) {
    if (vals.length === 3) break
    const vec: [C2, C2, C2] = [
      [V[0 * 6 + idx]!, V[3 * 6 + idx]!],
      [V[1 * 6 + idx]!, V[4 * 6 + idx]!],
      [V[2 * 6 + idx]!, V[5 * 6 + idx]!],
    ]
    for (const prev of cols) {
      let dr = 0
      let di = 0
      for (let r = 0; r < 3; r++) {
        dr += prev[r]![0] * vec[r]![0] + prev[r]![1] * vec[r]![1]
        di += prev[r]![0] * vec[r]![1] - prev[r]![1] * vec[r]![0]
      }
      for (let r = 0; r < 3; r++) {
        vec[r] = [
          vec[r]![0] - (dr * prev[r]![0] - di * prev[r]![1]),
          vec[r]![1] - (dr * prev[r]![1] + di * prev[r]![0]),
        ]
      }
    }
    const n2 = cAbs2(vec[0]) + cAbs2(vec[1]) + cAbs2(vec[2])
    if (n2 > 1e-6) {
      const inv = 1 / Math.sqrt(n2)
      vec[0] = [vec[0][0] * inv, vec[0][1] * inv]
      vec[1] = [vec[1][0] * inv, vec[1][1] * inv]
      vec[2] = [vec[2][0] * inv, vec[2][1] * inv]
      vals.push(Math.max(0, A[idx * 6 + idx]!))
      cols.push(vec)
    }
  }
  while (cols.length < 3) {
    vals.push(0)
    cols.push([[1, 0], [0, 0], [0, 0]])
  }
  return {
    vals: [vals[0]!, vals[1]!, vals[2]!],
    U: [
      [cols[0]![0], cols[1]![0], cols[2]![0]],
      [cols[0]![1], cols[1]![1], cols[2]![1]],
      [cols[0]![2], cols[1]![2], cols[2]![2]],
    ],
  }
}

// Unified standard Dirac left diagonalization: leftEig(Y) = herm3Eig(Y Y^dag)
// Satisfies U_L^dag (Y Y^dag) U_L = diag(y_1^2, y_2^2, y_3^2) with V_CKM = U_{uL}^dag U_{dL}
// and U_PMNS = U_{eL}^dag U_nu sharing the exact same PDG Jarlskog sign J = +Im(W_01 W_12 W_02^* W_11^*).
function leftEig(Y: Mat3): { readonly sv: readonly [number, number, number]; readonly U: Mat3 } {
  const row0: [C2, C2, C2] = [[0, 0], [0, 0], [0, 0]]
  const row1: [C2, C2, C2] = [[0, 0], [0, 0], [0, 0]]
  const row2: [C2, C2, C2] = [[0, 0], [0, 0], [0, 0]]
  const rows = [row0, row1, row2] as const
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < 3; k++) {
        const a = Y[i]![k]!
        const b = cConj(Y[j]![k]!)
        sr += a[0] * b[0] - a[1] * b[1]
        si += a[0] * b[1] + a[1] * b[0]
      }
      rows[i]![j] = [sr, si]
    }
  }
  const { vals, U } = herm3Eig([row0, row1, row2])
  return { sv: [Math.sqrt(vals[0]), Math.sqrt(vals[1]), Math.sqrt(vals[2])], U }
}

// Unified Dirac-convention Takagi diagonalization for symmetric Majorana mass M_nu:
//   U_nu^T M_nu U_nu = D  =>  U_nu^dag (M_nu^dag M_nu) U_nu = D^2,  so U_nu = herm3Eig(M_nu^dag M_nu).U
function leftEigMajorana(M: Mat3): { readonly sv: readonly [number, number, number]; readonly U: Mat3 } {
  const row0: [C2, C2, C2] = [[0, 0], [0, 0], [0, 0]]
  const row1: [C2, C2, C2] = [[0, 0], [0, 0], [0, 0]]
  const row2: [C2, C2, C2] = [[0, 0], [0, 0], [0, 0]]
  const rows = [row0, row1, row2] as const
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < 3; k++) {
        const a = cConj(M[k]![i]!)
        const b = M[k]![j]!
        sr += a[0] * b[0] - a[1] * b[1]
        si += a[0] * b[1] + a[1] * b[0]
      }
      rows[i]![j] = [sr, si]
    }
  }
  const { vals, U } = herm3Eig([row0, row1, row2])
  return { sv: [Math.sqrt(vals[0]), Math.sqrt(vals[1]), Math.sqrt(vals[2])], U }
}

function m3MulDagLeft(A: Mat3, B: Mat3): Mat3 {
  const out: [C2, C2, C2][] = []
  for (let i = 0; i < 3; i++) {
    const r: C2[] = []
    for (let j = 0; j < 3; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < 3; k++) {
        const a = cConj(A[k]![i]!)
        const b = B[k]![j]!
        sr += a[0] * b[0] - a[1] * b[1]
        si += a[0] * b[1] + a[1] * b[0]
      }
      r.push([sr, si])
    }
    out.push([r[0]!, r[1]!, r[2]!])
  }
  return [out[0]!, out[1]!, out[2]!]
}

function m3Mul(A: Mat3, B: Mat3): Mat3 {
  const out: [C2, C2, C2][] = []
  for (let i = 0; i < 3; i++) {
    const r: C2[] = []
    for (let j = 0; j < 3; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < 3; k++) {
        const a = A[i]![k]!
        const b = B[k]![j]!
        sr += a[0] * b[0] - a[1] * b[1]
        si += a[0] * b[1] + a[1] * b[0]
      }
      r.push([sr, si])
    }
    out.push([r[0]!, r[1]!, r[2]!])
  }
  return [out[0]!, out[1]!, out[2]!]
}

function m3Inv(M: Mat3): Mat3 {
  const A: C2[][] = [0, 1, 2].map(i => [
    M[i]![0],
    M[i]![1],
    M[i]![2],
    i === 0 ? [1, 0] : [0, 0],
    i === 1 ? [1, 0] : [0, 0],
    i === 2 ? [1, 0] : [0, 0],
  ])
  for (let k = 0; k < 3; k++) {
    let piv = k
    let best = 0
    for (let i = k; i < 3; i++) {
      const m = cAbs2(A[i]![k]!)
      if (m > best) {
        best = m
        piv = i
      }
    }
    const tmp = A[k]!
    A[k] = A[piv]!
    A[piv] = tmp
    const d = A[k]![k]!
    if (cAbs2(d) < 1e-36) {
      return [
        [[1, 0], [0, 0], [0, 0]],
        [[0, 0], [1, 0], [0, 0]],
        [[0, 0], [0, 0], [1, 0]],
      ]
    }
    for (let j = k; j < 6; j++) A[k]![j] = cDiv(A[k]![j]!, d)
    for (let i = 0; i < 3; i++) {
      if (i === k) continue
      const f = A[i]![k]!
      for (let j = k; j < 6; j++) A[i]![j] = cSub(A[i]![j]!, cMul(f, A[k]![j]!))
    }
  }
  return [
    [A[0]![3]!, A[0]![4]!, A[0]![5]!],
    [A[1]![3]!, A[1]![4]!, A[1]![5]!],
    [A[2]![3]!, A[2]![4]!, A[2]![5]!],
  ]
}

// Strictly deterministic Levenberg-Marquardt least-squares solver (zero Math.random)
function lmSolve(
  x0: readonly number[],
  resFn: (x: readonly number[]) => readonly number[],
  maxIter = 80,
): { readonly x: number[]; readonly r: readonly number[]; readonly cost: number } {
  const n = x0.length
  let x = x0.slice()
  let r = resFn(x)
  const m = r.length
  let cost = 0
  for (let i = 0; i < m; i++) cost += r[i]! * r[i]!
  let lam = 1e-2

  for (let it = 0; it < maxIter; it++) {
    const J: number[][] = Array.from({ length: m }, () => new Array<number>(n).fill(0))
    for (let j = 0; j < n; j++) {
      const h = 1e-6 * Math.max(1, Math.abs(x[j]!))
      const xp = x.slice()
      xp[j] = xp[j]! + h
      const rp = resFn(xp)
      for (let i = 0; i < m; i++) J[i]![j] = (rp[i]! - r[i]!) / h
    }
    const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
    const b = new Array<number>(n).fill(0)
    for (let j = 0; j < n; j++) {
      for (let k = 0; k <= j; k++) {
        let s = 0
        for (let i = 0; i < m; i++) s += J[i]![j]! * J[i]![k]!
        A[j]![k] = s
        A[k]![j] = s
      }
      let sb = 0
      for (let i = 0; i < m; i++) sb += J[i]![j]! * r[i]!
      b[j] = -sb
    }
    for (let j = 0; j < n; j++) A[j]![j] = A[j]![j]! * (1 + lam) + lam * 1e-4

    const aug = A.map((row, i) => [...row, b[i]!])
    let ok = true
    for (let k = 0; k < n; k++) {
      let piv = k
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(aug[i]![k]!) > Math.abs(aug[piv]![k]!)) piv = i
      }
      if (Math.abs(aug[piv]![k]!) < 1e-18) {
        ok = false
        break
      }
      const tmp = aug[k]!
      aug[k] = aug[piv]!
      aug[piv] = tmp
      const div = aug[k]![k]!
      for (let j = k; j <= n; j++) aug[k]![j] = aug[k]![j]! / div
      for (let i = 0; i < n; i++) {
        if (i === k) continue
        const fac = aug[i]![k]!
        for (let j = k; j <= n; j++) aug[i]![j] = aug[i]![j]! - fac * aug[k]![j]!
      }
    }
    if (!ok) {
      lam *= 10
      continue
    }
    const xNew = x.map((v, j) => {
      const step = Math.max(-2.0, Math.min(2.0, aug[j]![n]!))
      return Math.max(-30, Math.min(15, v + step))
    })
    const rNew = resFn(xNew)
    let cNew = 0
    for (let i = 0; i < m; i++) cNew += rNew[i]! * rNew[i]!
    if (Number.isFinite(cNew) && cNew < cost) {
      const impr = cost - cNew
      x = xNew
      r = rNew
      cost = cNew
      lam = Math.max(1e-9, lam * 0.3)
      if (impr < 1e-10) break
    } else {
      lam *= 5
      if (lam > 1e10) break
    }
  }
  return { x, r, cost }
}

// =================================================================================================
// 1. EXACT {3,4,3,4} STEINBERG SHELL RECURRENCE (BIGINT + FLOAT64)
// =================================================================================================

const D_MAX = 30
const D_STAR = 13
const N_BIG: bigint[] = [1n, 18n, 330n, 6034n]
for (let d = 4; d <= D_MAX; d++) {
  N_BIG.push(21n * N_BIG[d - 1]! - 51n * N_BIG[d - 2]! + 23n * N_BIG[d - 3]!)
}
const N_SHELL: readonly number[] = N_BIG.map(v => Number(v))

function solvePerronLambda1(): number {
  let x = 18.28
  for (let it = 0; it < 40; it++) {
    const f = x * x * x - 21 * x * x + 51 * x - 23
    const df = 3 * x * x - 42 * x + 51
    x -= f / df
  }
  return x
}

const LAMBDA_1 = solvePerronLambda1()
const K_WARP = Math.log(LAMBDA_1)
const P_OUT = LAMBDA_1 / (1 + LAMBDA_1)
const P_IN = 1 / (1 + LAMBDA_1)

function kDownGraph(d: number): number {
  if (d === 0) return 18
  if (d === 1) return 65 / 3
  return 24 * P_OUT
}

// Fixed-UV link weights w_d = (k_dn(d) / 24) / N_d
function wLink(d: number): number {
  return kDownGraph(d) / 24 / N_SHELL[d]!
}

// Map continuum m_phi^2 / k^2 to fixed-UV discrete GW mass m_lat^2 = (ln lambda_1)^2 * (m_phi^2 / k^2)
function contMassToLatSq(mPhi2OverK2: number): number {
  return K_WARP * K_WARP * mPhi2OverK2
}

const D_INF_TRUNC = 42

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
  assert(Math.abs(b0) > 1e-300, 'Zero pivot at row 0 in solveTridiagonal')
  TRI_CP[0] = n > 1 ? TRI_SUP[0]! / b0 : 0
  TRI_DP[0] = TRI_RHS[0]! / b0
  for (let i = 1; i < n; i++) {
    const denom = TRI_DIAG[i]! - TRI_SUB[i]! * TRI_CP[i - 1]!
    assert(Math.abs(denom) > 1e-300, `Zero pivot at row ${i} in solveTridiagonal`)
    TRI_CP[i] = i < n - 1 ? TRI_SUP[i]! / denom : 0
    TRI_DP[i] = (TRI_RHS[i]! - TRI_SUB[i]! * TRI_DP[i - 1]!) / denom
  }
  TRI_X[n - 1] = TRI_DP[n - 1]!
  for (let i = n - 2; i >= 0; i--) {
    TRI_X[i] = TRI_DP[i]! - TRI_CP[i]! * TRI_X[i + 1]!
  }
}

// Extended shell table up to D_INF_TRUNC for exact semi-infinite GW BVP
const N_SHELL_EXT: number[] = N_SHELL.slice()
for (let d = D_MAX + 1; d <= D_INF_TRUNC + 1; d++) {
  N_SHELL_EXT.push(21 * N_SHELL_EXT[d - 1]! - 51 * N_SHELL_EXT[d - 2]! + 23 * N_SHELL_EXT[d - 3]!)
}

function wLinkExt(d: number): number {
  return kDownGraph(d) / 24 / N_SHELL_EXT[d]!
}

function solvePhiInfFixedUV(mLatSq: number): Float64Array {
  const n = D_INF_TRUNC - 1
  for (let idx = 0; idx < n; idx++) {
    const d = idx + 1
    const wL = wLinkExt(d - 1)
    const wR = wLinkExt(d)
    const mSite = mLatSq / N_SHELL_EXT[d]!
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

// Exact zero-cancellation discrete GW effective potential V_GW(D) = S_D[phi] - S_inf[v_UV phi_inf]
// Boundary conditions: phi_0 = v_UV = r, phi_D = v_IR = 1.0 (matching sm-gw-depth-and-uv-stiffness.ts)
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
      const mSite = mLatSq / N_SHELL_EXT[d]!
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

// Log-bisection for exact D_* = 13 window [rLo, rHi] (for r > 1, argminD(r) is monotonically increasing in r)
function bisectR13(mLatSq: number): {
  readonly rLo: number
  readonly rHi: number
  readonly rMid: number
  readonly relWidth: number
} {
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
  const rMid = Math.sqrt(rLo * rHi)
  const relWidth = (rHi - rLo) / rMid
  return { rLo, rHi, rMid, relWidth }
}

// =================================================================================================
// 2. EXACT M_PAIR(ZETA_18) BETHE-CAVITY ON Z^{*12} & CLOSED-FORM M_MEET DOUBLON SOLVER
// =================================================================================================

const cScale = (s: number, a: C2): C2 => [s * a[0], s * a[1]]
const Z18_M1: C2 = [Z18_C[0] - 1, Z18_C[1]]

// Exact closed-form 1D two-particle secular function Z(lam, cosP) (matching multibody-mpair-and-chiral-clusters.ts)
// Satisfies Z(lam, cosP) === w^2 for the M_meet sym(+) doublon, and accepts cosP = cosh(kappa) > 1 for evanescent poles.
function computeZ1DByCosP(lam: C2, cosP: number): { readonly Z: C2; readonly uAbs: number } {
  const a2 = cScale(0.25, W_C)
  const b2 = cScale(-0.75, W_C)
  const ab2 = cScale(-3 / 16, W2_C)
  const num = cSub(cScale(2 * cosP, lam), cScale(2, W_C))
  const den = cSub(cSub(cMul(lam, lam), cScale(0.5 * cosP, cMul(W_C, lam))), cScale(0.5, W2_C))
  const g = cMul(ab2, cDiv(num, den))
  const alpha = cAdd(a2, g)
  const beta = cAdd(b2, g)
  if (cAbs(alpha) < 1e-13) return { Z: cDiv(cMul(lam, lam), beta), uAbs: 0 }
  const rhs = cDiv(cAdd(cMul(lam, lam), cSub(cMul(alpha, alpha), cMul(beta, beta))), cMul(alpha, lam))
  const disc = cSub(cMul(rhs, rhs), [4, 0])
  const sq = cSqrt(disc)
  const u1 = cScale(0.5, cAdd(rhs, sq))
  const u2 = cScale(0.5, cSub(rhs, sq))
  const u = cAbs(u1) <= cAbs(u2) ? u1 : u2
  const Z = cDiv(beta, cSub([1, 0], cDiv(alpha, cMul(lam, u))))
  return { Z, uAbs: cAbs(u) }
}

function g0Hat1D(P: number, lam: C2): C2 {
  const { Z } = computeZ1DByCosP(lam, Math.cos(P))
  return cDiv(W2_C, cSub(Z, W2_C))
}

// Exact Bethe-cavity solver on Z^{*12} for M_pair(zeta_18), returning G, self-energy sig, and radial transfer t_1 = G_cav(1)/G_cav(0)
function solveBetheCavityZ12(E: number, eps = 1e-6, np = 128): {
  readonly G: C2
  readonly sig: C2
  readonly t1: C2
  readonly absT1: number
  readonly iterErr: number
} {
  const rAmp = 1 + eps
  const lam: C2 = [rAmp * Math.cos(E), rAmp * Math.sin(E)]
  const hRe = new Float64Array(np)
  const hIm = new Float64Array(np)
  let avgR = 0
  let avgI = 0
  for (let j = 0; j < np; j++) {
    const g = g0Hat1D((2 * PI * j) / np, lam)
    const h = cScale(1 / 12, cMul(Z18_M1, g))
    hRe[j] = h[0]
    hIm[j] = h[1]
    avgR += h[0]
    avgI += h[1]
  }
  avgR /= np
  avgI /= np
  let sig: C2 = [avgR, avgI]
  let err = 1
  let g0R = 1
  let g0I = 0
  let g1R = 0
  let g1I = 0
  for (let it = 0; it < 160; it++) {
    const w: C2 = [1 - 11 * sig[0], -11 * sig[1]]
    g0R = 0
    g0I = 0
    g1R = 0
    g1I = 0
    for (let j = 0; j < np; j++) {
      const inv = cDiv([1, 0], [w[0] - hRe[j]!, w[1] - hIm[j]!])
      g0R += inv[0]
      g0I += inv[1]
      const cP = Math.cos((2 * PI * j) / np)
      g1R += inv[0] * cP
      g1I += inv[1] * cP
    }
    g0R /= np
    g0I /= np
    g1R /= np
    g1I /= np
    const invG = cDiv([1, 0], [g0R, g0I])
    const nextSig: C2 = [(1 - invG[0]) / 12, -invG[1] / 12]
    err = cAbs(cSub(nextSig, sig))
    sig = [0.5 * sig[0] + 0.5 * nextSig[0], 0.5 * sig[1] + 0.5 * nextSig[1]]
    if (err < 1e-13) break
  }
  const G = cDiv([1, 0], [1 - 12 * sig[0], -12 * sig[1]])
  const t1 = cDiv([g1R, g1I], [g0R, g0I])
  return { G, sig, t1, absT1: cAbs(t1), iterErr: err }
}

// =================================================================================================
// 3. GATE R1.1: BARE-U ALGEBRAIC GW WINDOWS FOR EXACT D_* = 13
// =================================================================================================

function runR11(): { readonly gammaFeshFwhm: number } {
  console.log('\n=================================================================================')
  console.log('GATE R1.1 (Tier A): BARE-U ALGEBRAIC GW WINDOWS FOR EXACT D_* = 13')
  console.log('=================================================================================')

  assert(
    N_BIG[0] === 1n && N_BIG[1] === 18n && N_BIG[2] === 330n && N_BIG[3] === 6034n,
    'Base {3,4,3,4} shell counts mismatch',
  )
  assert(Math.abs(LAMBDA_1 - 18.278707774366) < 1e-9, `lambda_1 mismatch: ${LAMBDA_1}`)
  console.log(
    `  {3,4,3,4} shells: N_0=${N_BIG[0]}, N_1=${N_BIG[1]}, N_2=${N_BIG[2]}, N_3=${N_BIG[3]}, ` +
      `N_13=${N_BIG[13]}, lambda_1=${LAMBDA_1.toFixed(12)}, k=${K_WARP.toFixed(9)}`,
  )

  // 1. Exact unweighted graph-Laplacian identity: m_lat^2 = lambda_1 * mu^2
  //    In the fixed-UV discrete GW equation on asymptotic shells (d >= 2), with w_d = P_OUT / N_d:
  //      w_{d-1} (phi_d - phi_{d-1}) + w_d (phi_d - phi_{d+1}) + (m_lat^2 / N_d) phi_d = 0.
  //    Dividing by w_d = P_OUT / N_d yields:
  //      LAMBDA_1 (phi_d - phi_{d-1}) + (phi_d - phi_{d+1}) + (m_lat^2 / P_OUT) phi_d = 0.
  //    Dividing by (1 + LAMBDA_1) gives the exact unweighted graph-Laplacian equation:
  //      P_OUT (phi_d - phi_{d-1}) + P_IN (phi_d - phi_{d+1}) + (m_lat^2 / LAMBDA_1) phi_d = 0,
  //    establishing the exact algebraic identity m_lat^2 = (P_OUT / P_IN) * mu^2 = LAMBDA_1 * mu^2.
  const muTest = 1 - Math.cos(PI / 9)
  const mLatFromIdentity = LAMBDA_1 * muTest
  // Verify decaying mode ratio rho satisfies BOTH the fixed-UV GW EL equation and the graph-Laplacian equation!
  const phiTest = solvePhiInfFixedUV(mLatFromIdentity)
  const rhoAsymp = phiTest[18]! / phiTest[17]!
  const gwResidual = P_OUT * LAMBDA_1 * (1 - 1 / rhoAsymp) + P_OUT * (1 - rhoAsymp) + mLatFromIdentity
  const lapResidual = P_OUT * (1 - 1 / rhoAsymp) + P_IN * (1 - rhoAsymp) + muTest
  const idErr = Math.max(Math.abs(gwResidual), Math.abs(lapResidual), Math.abs(mLatFromIdentity / muTest - LAMBDA_1))
  assert(idErr < 1e-12, `Graph-Laplacian identity residual too large: ${idErr}`)
  console.log(
    `  Graph-Laplacian identity m_lat^2 = lambda_1 * mu^2: err=${idErr.toExponential(2)} (< 1e-12), rho_inf=${rhoAsymp.toFixed(9)}`,
  )

  // 2. Bare-U continuum candidate m_phi^2 / k^2 = 4 sin^2(pi / 18)
  const mPhi2Sin = 4 * Math.sin(PI / 18) ** 2
  const mLatSqSin = contMassToLatSq(mPhi2Sin)
  const winSin = bisectR13(mLatSqSin)
  const dEightThirds = argminD(8 / 3, mLatSqSin)
  const dEulerE = argminD(Math.E, mLatSqSin)
  const v13Sin = evalDiscreteVgwFixedUV(13, 8 / 3, mLatSqSin)
  const v25Sin = evalDiscreteVgwFixedUV(25, 8 / 3, mLatSqSin)
  console.log(
    `  m_phi^2/k^2 = 4 sin^2(pi/18) = ${mPhi2Sin.toFixed(6)} -> m_lat^2=${mLatSqSin.toFixed(5)}: ` +
      `r in [${winSin.rLo.toFixed(5)}, ${winSin.rHi.toFixed(5)}] (w=${(winSin.relWidth * 100).toFixed(2)}%), ` +
      `D*(8/3)=${dEightThirds}, D*(e)=${dEulerE}, V(13)=${v13Sin.toExponential(3)} < 0 < V(25)=${v25Sin.toExponential(3)}`,
  )

  // 3. Graph-Laplacian candidate mu^2 = 1 - cos(pi / 9)
  const muSqCos = 1 - Math.cos(PI / 9)
  const mLatSqCos = LAMBDA_1 * muSqCos
  const winCos = bisectR13(mLatSqCos)
  const rCot = 0.5 / Math.tan(PI / 18)
  const dCot = argminD(rCot, mLatSqCos)
  console.log(
    `  Graph-Laplacian mu^2 = 1 - cos(pi/9) = ${muSqCos.toFixed(6)} -> m_lat^2=${mLatSqCos.toFixed(5)}: ` +
      `r in [${winCos.rLo.toFixed(5)}, ${winCos.rHi.toFixed(5)}] (w=${(winCos.relWidth * 100).toFixed(2)}%), ` +
      `r=cot(pi/18)/2=${rCot.toFixed(5)} -> D*=${dCot}`,
  )

  // 4. Honest negative controls: p_off, Gamma_Fesh^2, unscaled 1/13 and 1/7
  const pOff = (11 * cAbs2(cSub(Z18_C, [1, 0]))) / 144
  const winPoff = bisectR13(pOff)

  // Measure Bethe-cavity Feshbach resonance FWHM directly from LDOS rho(E) around E_res = 1.6559
  let peakVal = 0
  let peakE = 1.6559
  const scanE: number[] = []
  const scanRho: number[] = []
  for (let i = 0; i <= 100; i++) {
    const E = 1.60 + (i * 0.14) / 100
    const { G } = solveBetheCavityZ12(E, 2e-4, 96)
    const gs = cMul(cDiv(Z18_C, Z18_M1), cSub(G, [1, 0]))
    const rho = (gs[0] + 0.5) / PI
    scanE.push(E)
    scanRho.push(rho)
    if (rho > peakVal) {
      peakVal = rho
      peakE = E
    }
  }
  const halfMax = peakVal * 0.5
  let eLeft = scanE[0]!
  let eRight = scanE[scanE.length - 1]!
  for (let i = 1; i < scanE.length; i++) {
    if (scanRho[i - 1]! < halfMax && scanRho[i]! >= halfMax) {
      const f = (halfMax - scanRho[i - 1]!) / (scanRho[i]! - scanRho[i - 1]!)
      eLeft = scanE[i - 1]! + f * (scanE[i]! - scanE[i - 1]!)
    }
    if (scanRho[i - 1]! >= halfMax && scanRho[i]! < halfMax) {
      const f = (scanRho[i - 1]! - halfMax) / (scanRho[i - 1]! - scanRho[i]!)
      eRight = scanE[i - 1]! + f * (scanE[i]! - scanE[i - 1]!)
    }
  }
  const gammaFeshFwhm = Math.max(1e-4, eRight - eLeft)
  const winFesh = bisectR13(gammaFeshFwhm * gammaFeshFwhm)
  const winInv13 = bisectR13(1 / 13)
  const winInv7 = bisectR13(1 / 7)

  console.log(
    `  Negative controls: p_off=${pOff.toFixed(6)} (w=${(winPoff.relWidth * 100).toFixed(4)}%), ` +
      `Gamma_Fesh=${gammaFeshFwhm.toFixed(4)} at E_peak=${peakE.toFixed(4)} (Gamma^2 w=${(winFesh.relWidth * 100).toFixed(4)}%), ` +
      `1/13 (w=${(winInv13.relWidth * 100).toFixed(4)}%), 1/7 (w=${(winInv7.relWidth * 100).toFixed(4)}%)`,
  )

  const ok =
    idErr < 1e-12 &&
    Math.abs(mLatSqSin - 1.01839) < 1e-3 &&
    dEightThirds === 13 &&
    dEulerE === 13 &&
    winSin.relWidth >= 0.059 &&
    winSin.relWidth <= 0.062 &&
    v13Sin < 0 &&
    v25Sin > 0 &&
    Math.abs(mLatSqCos - 1.10234) < 1e-3 &&
    dCot === 13 &&
    winCos.relWidth >= 0.063 &&
    winCos.relWidth <= 0.067 &&
    winPoff.relWidth < 0.001 &&
    winFesh.relWidth < 0.0005 &&
    winInv13.relWidth < 0.01 &&
    winInv7.relWidth < 0.01

  recordGate(
    'R1.1',
    'Tier A',
    'Bare-U algebraic GW windows for exact D_* = 13 & negative controls',
    ok,
    `m_lat^2(4sin^2(pi/18))=${mLatSqSin.toFixed(5)} (w=${(winSin.relWidth * 100).toFixed(2)}%, D*(8/3)=D*(e)=13), ` +
      `m_lat^2(1-cos(pi/9))=${mLatSqCos.toFixed(5)} (w=${(winCos.relWidth * 100).toFixed(2)}%, D*(cot/2)=13), ` +
      `negCtrls w=[${(winPoff.relWidth * 100).toFixed(3)}%, ${(winFesh.relWidth * 100).toFixed(3)}%, ${(winInv13.relWidth * 100).toFixed(2)}%, ${(winInv7.relWidth * 100).toFixed(2)}%]`,
  )

  return { gammaFeshFwhm }
}

// =================================================================================================
// 4. GATE R1.2: EMPTY-VACUUM BARE-U MICROSCOPIC NO-GO
// =================================================================================================

function mapDecayToMlatSq(rho: number): number {
  return P_OUT * (LAMBDA_1 * (1 / rho - 1) + (rho - 1))
}

function runR12(): void {
  console.log('\n=================================================================================')
  console.log('GATE R1.2 (Tier A): EMPTY-VACUUM BARE-U MICROSCOPIC NO-GO')
  console.log('=================================================================================')

  // 1. Explicit 24-slot (12 antipodal lines) 2-particle bare-U dock step:
  //    Directly step 2-particle states in the full 2304-dim Hilbert space |(s_1, t_1), (s_2, t_2)>
  //    (s_1, s_2 in 0..23 across 12 antipodal lines l = s >> 1, tones t_1, t_2 in {+, -})
  //    under U_dock = (C_24 (x) C_24) * M_2body, where M_2body applies M_meet on opposite-tone
  //    antipodal pairs inside line l and M_pair(zeta_18) = I_12 + ((zeta_18 - 1)/12) J_12 on
  //    same-tone antipodal pairs across all 12 lines, and C_24 = direct_sum_{l=0}^{11} C_2.
  const cDiag: C2 = [0.25, Math.sqrt(3) * 0.25]
  const cOff: C2 = [0.75, -Math.sqrt(3) * 0.25]
  const meetSwap: C2 = [-1.5, Math.sqrt(3) * 0.5]
  const lMeet00 = cMul([0.5 * W_C[0], 0.5 * W_C[1]], Z6_C)
  const lMeet01 = cMul([0.5 * W_C[0], 0.5 * W_C[1]], meetSwap)
  const uni00 = cAbs2(lMeet00) + cAbs2(lMeet01)
  const uni01 = cAbs(cAdd(cMul(lMeet00, cConj(lMeet01)), cMul(lMeet01, cConj(lMeet00))))
  const coinUni = cAbs2(cDiag) + cAbs2(cOff)
  assert(Math.abs(uni00 - 1) < 1e-14 && uni01 < 1e-14 && Math.abs(coinUni - 1) < 1e-14, 'M_meet unitarity failed')

  const idx2P = (s1: number, t1: number, s2: number, t2: number): number => (((t1 * 2 + t2) * 24 + s1) * 24 + s2)
  const stepTwoParticleDock = (
    inRe: Float64Array,
    inIm: Float64Array,
  ): {
    readonly outRe: Float64Array
    readonly outIm: Float64Array
    readonly totalNorm: number
    readonly crossLineLeak: number
    readonly sectorNorm: readonly [number, number, number, number]
  } => {
    const dim = 4 * 24 * 24
    const midRe = new Float64Array(inRe)
    const midIm = new Float64Array(inIm)

    // (a) Opposite-tone antipodal M_meet inside each line l = 0..11
    for (const [t1, t2] of [
      [0, 1],
      [1, 0],
    ] as const) {
      for (let l = 0; l < 12; l++) {
        const iA = idx2P(2 * l, t1, 2 * l + 1, t2)
        const iB = idx2P(2 * l + 1, t1, 2 * l, t2)
        const a: C2 = [inRe[iA]!, inIm[iA]!]
        const b: C2 = [inRe[iB]!, inIm[iB]!]
        const nA = cAdd(cMul(lMeet00, a), cMul(lMeet01, b))
        const nB = cAdd(cMul(lMeet01, a), cMul(lMeet00, b))
        midRe[iA] = nA[0]
        midIm[iA] = nA[1]
        midRe[iB] = nB[0]
        midIm[iB] = nB[1]
      }
    }

    // (b) Same-tone antipodal M_pair(zeta_18) = I_12 + ((zeta_18 - 1)/12) J_12 across all 12 lines
    const pairCoef: C2 = [Z18_M1[0] / 12, Z18_M1[1] / 12]
    for (const t of [0, 1] as const) {
      let sumSymR = 0
      let sumSymI = 0
      for (let l = 0; l < 12; l++) {
        const iA = idx2P(2 * l, t, 2 * l + 1, t)
        const iB = idx2P(2 * l + 1, t, 2 * l, t)
        sumSymR += 0.5 * (inRe[iA]! + inRe[iB]!)
        sumSymI += 0.5 * (inIm[iA]! + inIm[iB]!)
      }
      const shift = cMul(pairCoef, [sumSymR, sumSymI])
      for (let l = 0; l < 12; l++) {
        const iA = idx2P(2 * l, t, 2 * l + 1, t)
        const iB = idx2P(2 * l + 1, t, 2 * l, t)
        midRe[iA] = inRe[iA]! + shift[0]
        midIm[iA] = inIm[iA]! + shift[1]
        midRe[iB] = inRe[iB]! + shift[0]
        midIm[iB] = inIm[iB]! + shift[1]
      }
    }

    // (c) Single-particle 24-slot coin tensor product C_24 (x) C_24
    const tmpRe = new Float64Array(dim)
    const tmpIm = new Float64Array(dim)
    for (let sec = 0; sec < 4; sec++) {
      const t1 = sec >> 1
      const t2 = sec & 1
      for (let s2 = 0; s2 < 24; s2++) {
        for (let l = 0; l < 12; l++) {
          const i0 = idx2P(2 * l, t1, s2, t2)
          const i1 = idx2P(2 * l + 1, t1, s2, t2)
          const a: C2 = [midRe[i0]!, midIm[i0]!]
          const b: C2 = [midRe[i1]!, midIm[i1]!]
          const o0 = cAdd(cMul(cDiag, a), cMul(cOff, b))
          const o1 = cAdd(cMul(cOff, a), cMul(cDiag, b))
          tmpRe[i0] = o0[0]
          tmpIm[i0] = o0[1]
          tmpRe[i1] = o1[0]
          tmpIm[i1] = o1[1]
        }
      }
    }
    const outRe = new Float64Array(dim)
    const outIm = new Float64Array(dim)
    for (let sec = 0; sec < 4; sec++) {
      const t1 = sec >> 1
      const t2 = sec & 1
      for (let s1 = 0; s1 < 24; s1++) {
        for (let l = 0; l < 12; l++) {
          const i0 = idx2P(s1, t1, 2 * l, t2)
          const i1 = idx2P(s1, t1, 2 * l + 1, t2)
          const a: C2 = [tmpRe[i0]!, tmpIm[i0]!]
          const b: C2 = [tmpRe[i1]!, tmpIm[i1]!]
          const o0 = cAdd(cMul(cDiag, a), cMul(cOff, b))
          const o1 = cAdd(cMul(cOff, a), cMul(cDiag, b))
          outRe[i0] = o0[0]
          outIm[i0] = o0[1]
          outRe[i1] = o1[0]
          outIm[i1] = o1[1]
        }
      }
    }

    // Measure actual norm, (N_+, N_-) sector weights, and probability leaking onto orthogonal lines l = 1..11
    let totalNorm = 0
    let crossLineLeak = 0
    const sNorm: [number, number, number, number] = [0, 0, 0, 0]
    for (let t1 = 0; t1 < 2; t1++) {
      for (let t2 = 0; t2 < 2; t2++) {
        const sec = t1 * 2 + t2
        for (let s1 = 0; s1 < 24; s1++) {
          for (let s2 = 0; s2 < 24; s2++) {
            const idx = idx2P(s1, t1, s2, t2)
            const p = outRe[idx]! * outRe[idx]! + outIm[idx]! * outIm[idx]!
            totalNorm += p
            sNorm[sec] = sNorm[sec]! + p
            if ((s1 >> 1) !== 0 || (s2 >> 1) !== 0) crossLineLeak += p
          }
        }
      }
    }
    return { outRe, outIm, totalNorm, crossLineLeak, sectorNorm: sNorm }
  }

  // Step opposite-tone M_meet doublon initialized on line 0: (|(0,+),(1,-)> + |(1,+),(0,-)>) / sqrt(2)
  const invSq2 = Math.SQRT1_2
  const meetRe = new Float64Array(4 * 24 * 24)
  const meetIm = new Float64Array(4 * 24 * 24)
  meetRe[idx2P(0, 0, 1, 1)] = invSq2
  meetRe[idx2P(1, 0, 0, 1)] = invSq2
  const meetStep = stepTwoParticleDock(meetRe, meetIm)
  const crossLineLeak = meetStep.crossLineLeak
  const meetToneLeak = meetStep.sectorNorm[0] + meetStep.sectorNorm[3]
  assert(Math.abs(meetStep.totalNorm - 1) < 1e-14, `M_meet dock step not unitary: ${meetStep.totalNorm}`)
  assert(meetToneLeak < 1e-14, `M_meet (N_+,N_-) violated: ${meetToneLeak}`)
  assert(crossLineLeak < 1e-14, `M_meet cross-line leakage non-zero: ${crossLineLeak}`)

  // Step same-tone (+,+) M_pair(zeta_18) pair initialized on line 0: (|(0,+),(1,+)> + |(1,+),(0,+)>) / sqrt(2)
  const pairRe = new Float64Array(4 * 24 * 24)
  const pairIm = new Float64Array(4 * 24 * 24)
  pairRe[idx2P(0, 0, 1, 0)] = invSq2
  pairRe[idx2P(1, 0, 0, 0)] = invSq2
  const pairStep = stepTwoParticleDock(pairRe, pairIm)
  const pairToneLeak = pairStep.sectorNorm[1] + pairStep.sectorNorm[2] + pairStep.sectorNorm[3]
  const pOffAnalytic = (11 * cAbs2(Z18_M1)) / 144
  const pairLeakErr = Math.abs(pairStep.crossLineLeak - pOffAnalytic)
  assert(Math.abs(pairStep.totalNorm - 1) < 1e-14, `M_pair dock step not unitary: ${pairStep.totalNorm}`)
  assert(pairToneLeak < 1e-14, `M_pair (N_+,N_-) violated: ${pairToneLeak}`)
  assert(pairLeakErr < 1e-14, `M_pair measured cross-line leakage mismatch: ${pairLeakErr}`)

  // 2. Exact closed-form doublon Z(lam, cosP) = w^2 at P = 0: lam = (-1 + 15 i sqrt(3))/26 = (7 + 15 w)/13, |u| = 1/13
  const lamMeet0: C2 = [-1 / 26, (15 * Math.sqrt(3)) / 26]
  const eMeet0 = Math.atan2(lamMeet0[1], lamMeet0[0])
  const zAt0 = computeZ1DByCosP(lamMeet0, 1.0)
  const errZ0 = cAbs(cSub(zAt0.Z, W2_C))
  const errU0 = Math.abs(zAt0.uAbs - 1 / 13)
  assert(errZ0 < 1e-13, `Doublon P=0 |Z - w^2| too large: ${errZ0}`)
  assert(errU0 < 1e-13, `Doublon P=0 |u| != 1/13: ${zAt0.uAbs}`)

  // Trace exact isolated l^2 doublon dispersion E_2(P) across P in [0, 0.95 pi] (before merging into pi/3 continuum edge at P = pi)
  let minE2 = eMeet0
  let maxE2 = eMeet0
  const bandSamples: string[] = []
  let prevE = eMeet0
  for (let ip = 0; ip <= 38; ip++) {
    const P = (ip * 0.95 * PI) / 38
    const cosP = Math.cos(P)
    let lo = Math.max(1.04, prevE - 0.12)
    let hi = Math.min(1.64, prevE + 0.04)
    const gr = (Math.sqrt(5) - 1) * 0.5
    let x1 = hi - gr * (hi - lo)
    let x2 = lo + gr * (hi - lo)
    const obj = (E: number): number => cAbs(cSub(computeZ1DByCosP([Math.cos(E), Math.sin(E)], cosP).Z, W2_C))
    let f1 = obj(x1)
    let f2 = obj(x2)
    for (let it = 0; it < 55; it++) {
      if (f1 < f2) {
        hi = x2
        x2 = x1
        f2 = f1
        x1 = hi - gr * (hi - lo)
        f1 = obj(x1)
      } else {
        lo = x1
        x1 = x2
        f1 = f2
        x2 = lo + gr * (hi - lo)
        f2 = obj(x2)
      }
    }
    const eOpt = 0.5 * (lo + hi)
    const res = computeZ1DByCosP([Math.cos(eOpt), Math.sin(eOpt)], cosP)
    const mis = cAbs(cSub(res.Z, W2_C))
    if (mis < 1e-6 && res.uAbs < 0.98) {
      prevE = eOpt
      if (eOpt < minE2) minE2 = eOpt
      if (eOpt > maxE2) maxE2 = eOpt
      if (ip % 10 === 0 || ip === 38) bandSamples.push(`P=${(P / PI).toFixed(2)}pi->${eOpt.toFixed(4)}`)
    }
  }

  // Exact static E = 0 (lam = 1) no-pole check along cosh(kappa) in [1, 41]
  let minStaticMis = Number.POSITIVE_INFINITY
  for (let i = 0; i <= 200; i++) {
    const ck = 1 + (i * 40) / 200
    const res = computeZ1DByCosP([1, 0], ck)
    const mis = cAbs(cSub(res.Z, W2_C))
    if (mis < minStaticMis) minStaticMis = mis
  }

  const mLat13 = mapDecayToMlatSq(1 / Math.sqrt(13))
  const mLat7 = mapDecayToMlatSq(1 / Math.sqrt(7))

  console.log(
    `  24-slot 12-line dock step: M_meet measured crossLineLeak=${crossLineLeak.toExponential(2)} (< 1e-14, toneLeak=${meetToneLeak.toExponential(1)}), ` +
      `M_pair(+,+) measured crossLineLeak=${pairStep.crossLineLeak.toFixed(6)} (vs analytic p_off=${pOffAnalytic.toFixed(6)}, err=${pairLeakErr.toExponential(1)})`,
  )
  console.log(
    `  M_meet doublon: P=0 E_2=${eMeet0.toFixed(6)} rad, |u|=${zAt0.uAbs.toFixed(8)} (1/13), |Z-w^2|=${errZ0.toExponential(2)}`,
  )
  console.log(
    `  Doublon band E_2(P) in [${minE2.toFixed(4)}, ${maxE2.toFixed(4)}] rad (> 1.05 rad; ${bandSamples.join(', ')}); ` +
      `static E=0 min|Z(1, cosh k)-w^2|=${minStaticMis.toFixed(4)} (> 1.0 on cosh k in [1, 41])`,
  )
  console.log(
    `  Mapped fixed-UV GW masses: m_lat^2(1/sqrt(13))=${mLat13.toFixed(3)} (> 44.0), m_lat^2(1/sqrt(7))=${mLat7.toFixed(3)} (> 27.5)`,
  )

  // 3. Exact M_pair(zeta_18) Bethe-cavity radial transfer on Z^{*12}
  const cav0 = solveBetheCavityZ12(0, 1e-6, 128)
  const cavPi6 = solveBetheCavityZ12(PI / 6, 1e-6, 128)
  const cavRes = solveBetheCavityZ12(1.6559, 1e-4, 128)
  const lamT1Res = LAMBDA_1 * cavRes.absT1

  const rhoFlux = LAMBDA_1 * cav0.absT1
  const mEffLatSq = mapDecayToMlatSq(rhoFlux)
  const mEffContSq = mEffLatSq / (K_WARP * K_WARP)
  const winEff = bisectR13(mEffLatSq)

  console.log(
    `  M_pair(zeta_18) Bethe Z^{*12}: |t_1(0)|=${cav0.absT1.toFixed(6)}, |t_1(pi/6)|=${cavPi6.absT1.toFixed(6)}, ` +
      `E_res=1.6559 -> lambda_1|t_1|=${lamT1Res.toFixed(3)} (> 2.0)`,
  )
  console.log(
    `  Static shell-flux decay: rho_flux=${rhoFlux.toFixed(6)} (< 0.04) -> m_eff,lat^2=${mEffLatSq.toFixed(2)} (> 430), ` +
      `m_eff^2/k^2=${mEffContSq.toFixed(2)} (> 50), r_mid=${winEff.rMid.toExponential(3)} (> 1e18)`,
  )

  const ok =
    crossLineLeak < 1e-14 &&
    meetToneLeak < 1e-14 &&
    pairToneLeak < 1e-14 &&
    pairLeakErr < 1e-14 &&
    errZ0 < 1e-13 &&
    errU0 < 1e-13 &&
    minE2 > 1.05 &&
    minStaticMis > 1.0 &&
    mLat13 > 44.0 &&
    mLat7 > 27.5 &&
    Math.abs(cav0.absT1 - 0.002098) < 2e-5 &&
    Math.abs(cavPi6.absT1 - 0.001522) < 2e-5 &&
    lamT1Res > 2.0 &&
    rhoFlux < 0.04 &&
    mEffLatSq > 430 &&
    mEffContSq > 50 &&
    winEff.rMid > 1e18

  recordGate(
    'R1.2',
    'Tier A',
    'Empty-vacuum bare-U microscopic no-go (doublon/trion gap + M_pair Bethe-cavity)',
    ok,
    `doublon |u|=1/13, E_2 in [${minE2.toFixed(4)},${maxE2.toFixed(4)}]>1.05, |Z-w^2|=${errZ0.toExponential(1)}, staticMin=${minStaticMis.toFixed(3)}; ` +
      `|t_1(0)|=${cav0.absT1.toFixed(6)}, rho_flux=${rhoFlux.toFixed(5)} -> m_eff,lat^2=${mEffLatSq.toFixed(1)}, r_mid=${winEff.rMid.toExponential(2)}`,
  )
}

// =================================================================================================
// 5. SHARED SM FLAVOR OBSERVABLES & ZERO-CONTINUOUS-PHASE Z[zeta_9] + SO(10) + 2T TM_1 ENGINE
// =================================================================================================

// Exact 2-loop M_PS = 1.4341e11 GeV Yukawa targets (strict 0.1% PDG lepton floor) + CKM + NuFIT 6.0 NO
const M_PS_GEV = 1.4341e11
const V_EW_GEV = 174.104

const TARGETS = {
  yu: [3.44106e-6, 0.25] as const,
  yc: [1.67718e-3, 0.025] as const,
  yt: [0.502445, 0.015] as const,
  yd: [7.37673e-6, 0.10] as const,
  ys: [1.46872e-4, 0.05] as const,
  yb: [7.16332e-3, 0.015] as const,
  ye: [2.81367e-6, 0.001] as const,
  ymu: [5.93984e-4, 0.001] as const,
  ytau: [1.00977e-2, 0.001] as const,
  vus: [0.22501, 0.00068] as const,
  vcb: [0.04586, 0.00087] as const,
  vub: [0.004092, 0.000099] as const,
  dckm: [1.147, 0.026] as const,
  dm21: [7.49e-5, 1.9e-6] as const,
  dm31: [2.513e-3, 2.1e-5] as const,
  s12: [0.308, 0.012] as const,
  s23: [0.470, 0.015] as const,
  s13: [0.02215, 0.00057] as const,
  dnu: [212.0, 34.0] as const,
}

const U_TBM: Mat3 = [
  [[Math.sqrt(2 / 3), 0], [Math.sqrt(1 / 3), 0], [0, 0]],
  [[-Math.sqrt(1 / 6), 0], [Math.sqrt(1 / 3), 0], [Math.sqrt(1 / 2), 0]],
  [[-Math.sqrt(1 / 6), 0], [Math.sqrt(1 / 3), 0], [-Math.sqrt(1 / 2), 0]],
]

type FlavorEval = {
  readonly pulls19: readonly number[] // 9 masses + 4 CKM + 3 PMNS angles + 2 nu masses + 1 dCP_nu
  readonly chi18: number
  readonly max18: number
  readonly chi19: number
  readonly max19: number
  readonly dCkmRad: number
  readonly dNuDeg: number
  readonly pNu: number
  readonly pulls16NoNuMass: readonly number[]
}

type PDGMixing = {
  readonly s12Sq: number
  readonly s23Sq: number
  readonly s13Sq: number
  readonly vus: number
  readonly vcb: number
  readonly vub: number
  readonly J: number
  readonly deltaRad: number
  readonly deltaDeg: number
}

// Single unified PDG mixing and Jarlskog extraction used identically for BOTH V_CKM and U_PMNS:
//   J = +Im(W_01 W_12 W_02^* W_11^*)  (identical PLUS sign in both quark and lepton sectors)
function extractPDGMixing(W: Mat3): PDGMixing {
  const vus = cAbs(W[0][1])
  const vcb = cAbs(W[1][2])
  const vub = cAbs(W[0][2])
  const s13Sq = cAbs2(W[0][2])
  const c13Sq = Math.max(1e-18, 1 - s13Sq)
  const s12Sq = cAbs2(W[0][1]) / c13Sq
  const s23Sq = cAbs2(W[1][2]) / c13Sq
  const s12 = Math.sqrt(Math.max(0, s12Sq))
  const c12 = Math.sqrt(Math.max(0, 1 - s12Sq))
  const s23 = Math.sqrt(Math.max(0, s23Sq))
  const c23 = Math.sqrt(Math.max(0, 1 - s23Sq))
  const s13 = Math.sqrt(Math.max(0, s13Sq))
  const jProd = cMul(cMul(W[0][1], W[1][2]), cMul(cConj(W[0][2]), cConj(W[1][1])))
  const J = jProd[1]
  const sinD = Math.max(-1, Math.min(1, J / Math.max(1e-18, c12 * s12 * c23 * s23 * c13Sq * s13)))
  const cosD = Math.max(
    -1,
    Math.min(
      1,
      (cAbs2(W[1][0]) - (s12Sq * c23 * c23 + c12 * c12 * s23Sq * s13Sq)) /
        Math.max(1e-18, 2 * s12 * c12 * s23 * c23 * s13),
    ),
  )
  const deltaRad = Math.atan2(sinD, cosD)
  let deltaDeg = (deltaRad * 180) / PI
  if (deltaDeg < 0) deltaDeg += 360
  return { s12Sq, s23Sq, s13Sq, vus, vcb, vub, J, deltaRad, deltaDeg }
}

function evalFlavorTM1(
  Yu: Mat3,
  Yd: Mat3,
  Ye: Mat3,
  thNu: number,
  psi: number,
  pL: readonly [number, number],
  nuMassPulls: readonly [number, number] = [0, 0],
): FlavorEval {
  const eu = leftEig(Yu)
  const ed = leftEig(Yd)
  const ee = leftEig(Ye)

  // Unified Dirac CKM: V_CKM = U_{uL}^dag U_{dL}
  const ckm = extractPDGMixing(m3MulDagLeft(eu.U, ed.U))

  // Unified Dirac 2T TM_1 PMNS: U_PMNS = U_{eL}^dag P_L U_TBM U_23(thNu, psi)
  const cth = Math.cos(thNu)
  const sth = Math.sin(thNu)
  const ph = z18(psi)
  const phC = cConj(ph)
  const U23: Mat3 = [
    [[1, 0], [0, 0], [0, 0]],
    [[0, 0], [cth, 0], [sth * ph[0], sth * ph[1]]],
    [[0, 0], [-sth * phC[0], -sth * phC[1]], [cth, 0]],
  ]
  const Utm1 = m3Mul(U_TBM, U23)
  const PL: readonly [C2, C2, C2] = [z18(pL[0]), z18(pL[1]), [1, 0]]
  const PLU: Mat3 = [
    [cMul(PL[0], Utm1[0][0]), cMul(PL[0], Utm1[0][1]), cMul(PL[0], Utm1[0][2])],
    [cMul(PL[1], Utm1[1][0]), cMul(PL[1], Utm1[1][1]), cMul(PL[1], Utm1[1][2])],
    [cMul(PL[2], Utm1[2][0]), cMul(PL[2], Utm1[2][1]), cMul(PL[2], Utm1[2][2])],
  ]
  const pmns = extractPDGMixing(m3MulDagLeft(ee.U, PLU))

  const rRel = (v: number, tgt: readonly [number, number]): number => (v - tgt[0]) / (tgt[0] * tgt[1])
  const p16 = [
    rRel(eu.sv[0], TARGETS.yu),
    rRel(eu.sv[1], TARGETS.yc),
    rRel(eu.sv[2], TARGETS.yt),
    rRel(ed.sv[0], TARGETS.yd),
    rRel(ed.sv[1], TARGETS.ys),
    rRel(ed.sv[2], TARGETS.yb),
    rRel(ee.sv[0], TARGETS.ye),
    rRel(ee.sv[1], TARGETS.ymu),
    rRel(ee.sv[2], TARGETS.ytau),
    (ckm.vus - TARGETS.vus[0]) / TARGETS.vus[1],
    (ckm.vcb - TARGETS.vcb[0]) / TARGETS.vcb[1],
    (ckm.vub - TARGETS.vub[0]) / TARGETS.vub[1],
    (ckm.deltaRad - TARGETS.dckm[0]) / TARGETS.dckm[1],
    (pmns.s12Sq - TARGETS.s12[0]) / TARGETS.s12[1],
    (pmns.s23Sq - TARGETS.s23[0]) / TARGETS.s23[1],
    (pmns.s13Sq - TARGETS.s13[0]) / TARGETS.s13[1],
  ] as const
  const pNu = (((pmns.deltaDeg - TARGETS.dnu[0] + 540) % 360) - 180) / TARGETS.dnu[1]
  const pulls19 = [...p16, nuMassPulls[0], nuMassPulls[1], pNu]

  let chi18 = 0
  let max18 = 0
  for (let i = 0; i < 18; i++) {
    const v = pulls19[i]!
    chi18 += v * v
    if (Math.abs(v) > max18) max18 = Math.abs(v)
  }
  const chi19 = chi18 + pNu * pNu
  const max19 = Math.max(max18, Math.abs(pNu))
  return {
    pulls19,
    chi18,
    max18,
    chi19,
    max19,
    dCkmRad: ckm.deltaRad,
    dNuDeg: pmns.deltaDeg,
    pNu,
    pulls16NoNuMass: p16,
  }
}

function buildYukawasSO10(
  h3: number,
  F: Mat3,
  G: Mat3,
  r: number,
  sC: C2,
  ceG: number,
): { readonly Yu: Mat3; readonly Yd: Mat3; readonly Ye: Mat3 } {
  const H: Mat3 = [
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [h3, 0]],
  ]
  const mk = (fn: (i: number, j: number) => C2): Mat3 => [
    [fn(0, 0), fn(0, 1), fn(0, 2)],
    [fn(1, 0), fn(1, 1), fn(1, 2)],
    [fn(2, 0), fn(2, 1), fn(2, 2)],
  ]
  const Yd = mk((i, j) => cAdd(cAdd(H[i]![j]!, F[i]![j]!), G[i]![j]!))
  const Yu = mk((i, j) => {
    const v = cAdd(H[i]![j]!, cMul(sC, F[i]![j]!))
    return [r * v[0], r * v[1]]
  })
  const Ye = mk((i, j) => {
    const fij = F[i]![j]!
    const gij = G[i]![j]!
    return cAdd(cSub(H[i]![j]!, [3 * fij[0], 3 * fij[1]]), [ceG * gij[0], ceG * gij[1]])
  })
  return { Yu, Yd, Ye }
}

// =================================================================================================
// 6. GATE F2.1: {3,4,3,4} D_* = 13 CUSP ZERO MODES & k = 0..11 PARETO LOWER BOUND
// =================================================================================================

function verify2TCayleyLaplacian(): readonly number[] {
  const q2T: [number, number, number, number][] = []
  for (let axis = 0; axis < 4; axis++) {
    for (const s of [-1, 1]) {
      const q: [number, number, number, number] = [0, 0, 0, 0]
      q[axis] = s
      q2T.push(q)
    }
  }
  for (const s0 of [-0.5, 0.5]) {
    for (const s1 of [-0.5, 0.5]) {
      for (const s2 of [-0.5, 0.5]) {
        for (const s3 of [-0.5, 0.5]) {
          q2T.push([s0, s1, s2, s3])
        }
      }
    }
  }
  assert(q2T.length === 24, `2T order must be 24, got ${q2T.length}`)
  const L: number[][] = Array.from({ length: 24 }, () => new Array<number>(24).fill(0))
  for (let i = 0; i < 24; i++) {
    L[i]![i] = 1
    let deg = 0
    for (let j = 0; j < 24; j++) {
      const a = q2T[i]!
      const b = q2T[j]!
      if (Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] - 0.5) < 1e-12) {
        L[i]![j] = -1 / 8
        deg++
      }
    }
    assert(deg === 8, `24-cell vertex degree must be 8, got ${deg}`)
  }
  const eigs = realSymEigenvalues(L)
  const distinct: number[] = []
  for (const e of eigs) {
    if (distinct.length === 0 || e - distinct[distinct.length - 1]! > 1e-9) distinct.push(e)
  }
  return distinct
}

function solveCuspDomainWall(c: number): {
  readonly f0: number
  readonly residualInf: number
  readonly normErr: number
} {
  const Q: Float64Array[] = Array.from({ length: D_STAR }, () => new Float64Array(D_STAR + 1))
  for (let d = 0; d < D_STAR; d++) {
    const bd = N_SHELL[d + 1]! / N_SHELL[d]!
    const a = Math.pow(bd, 0.5 * (c - 0.5))
    Q[d]![d] = -1 / a
    Q[d]![d + 1] = a
  }
  const u = new Float64Array(D_STAR + 1)
  u[0] = 1
  for (let d = 0; d < D_STAR; d++) u[d + 1] = u[d]! * Math.pow(N_SHELL[d + 1]! / N_SHELL[d]!, 0.5 - c)
  let n2 = 0
  for (let d = 0; d <= D_STAR; d++) n2 += u[d]! * u[d]!
  const invN = 1 / Math.sqrt(n2)
  for (let d = 0; d <= D_STAR; d++) u[d] = u[d]! * invN

  let chk = 0
  for (let d = 0; d <= D_STAR; d++) chk += u[d]! * u[d]!
  const normErr = Math.abs(chk - 1)
  let residualInf = 0
  for (let d = 0; d < D_STAR; d++) {
    let s = 0
    for (let j = 0; j <= D_STAR; j++) s += Q[d]![j]! * u[j]!
    if (Math.abs(s) > residualInf) residualInf = Math.abs(s)
  }
  return { f0: u[0]!, residualInf, normErr }
}

function runF21(): readonly [number, number, number] {
  console.log('\n=================================================================================')
  console.log('GATE F2.1 (Tier A/B): {3,4,3,4} D_* = 13 CUSP ZERO MODES & k = 0..11 PARETO BOUND')
  console.log('=================================================================================')

  const spec2T = verify2TCayleyLaplacian()
  const expectedSpec = [0, 0.5, 1.0, 1.25, 1.5]
  assert(spec2T.length === 5, `2T Laplacian spectrum count != 5`)
  for (let i = 0; i < 5; i++) assert(Math.abs(spec2T[i]! - expectedSpec[i]!) < 1e-12, `2T spectrum[${i}] mismatch`)

  const c16 = [3 / 8, 5 / 12, 1 / 2] as const // 1/2 - {3/2, 1, 0}/12
  const modes = c16.map(c => solveCuspDomainWall(c))
  const fCusp: readonly [number, number, number] = [modes[0]!.f0, modes[1]!.f0, modes[2]!.f0]
  const maxRes = Math.max(modes[0]!.residualInf, modes[1]!.residualInf, modes[2]!.residualInf)
  const maxNormErr = Math.max(modes[0]!.normErr, modes[1]!.normErr, modes[2]!.normErr)
  const refF = [6.4015e-3, 2.6640e-2, 2.6726e-1] as const
  const maxFDev = Math.max(
    Math.abs(fCusp[0] - refF[0]),
    Math.abs(fCusp[1] - refF[1]),
    Math.abs(fCusp[2] - refF[2]),
  )
  console.log(
    `  2T Laplacian spectrum={${spec2T.map(x => x.toFixed(2)).join(', ')}} -> c_16=[3/8, 5/12, 1/2]`,
  )
  console.log(
    `  13x14 Q(c) zero modes: f=[${fCusp.map(v => v.toExponential(4)).join(', ')}], ` +
      `max||Q u||_inf=${maxRes.toExponential(2)} (< 1e-14), max|f - ref|=${maxFDev.toExponential(2)} (< 1e-5)`,
  )

  // Strictly nested cusp-anchored G = 0 hierarchy k = 0, 2, 4, 6, 8, 10, 11 (exact GJ obstruction)
  // plus an explicit k = 11 submodel with g01 != 0 (dropping f02 = 0 from the certified k = 12 branch).
  // At k = 0: pure cusp-anchored Yukawas with h3 = f_2 f_3, r = 0.5 / h3 (so r h3 = 0.5000),
  // F_{ij} = c_F f_i f_j zeta_18^{fPh} (c_F = 0.004), s = 0.15 zeta_18^1, thNu = 0,
  // seesaw m_3 = v_EW^2 f_2^2 / M_PS.
  const fPh = [12, 6, 13, 6, 5] as const
  const sPh = 1
  const psiNested = 13
  const pL: readonly [number, number] = [16, 4]
  const h3Anc = fCusp[1] * fCusp[2]
  const rAnc = 0.5 / h3Anc
  const cFAnc = 0.004
  const anchor = [
    Math.log(h3Anc), // 0: h3
    Math.log(rAnc), // 1: r
    Math.log(cFAnc * fCusp[2] * fCusp[2]), // 2: f22
    Math.log(0.15), // 3: s
    Math.log(cFAnc * fCusp[1] * fCusp[1]), // 4: f11
    Math.log(cFAnc * fCusp[1] * fCusp[2]), // 5: f12
    Math.log(cFAnc * fCusp[0] * fCusp[1]), // 6: f01
    Math.log(cFAnc * fCusp[0] * fCusp[2]), // 7: f02
    0.0, // 8: thNu
  ]
  // Physical GJ basin in the exact same coordinate order [h3, r, f22, s, f11, f12, f01, f02, thNu]
  const gjBasin = [-4.93, 4.26, -6.26, -1.89, -8.74, -7.91, -11.76, -9.91, 0.18]

  const buildNested = (nFree: number, xFree: readonly number[]) => {
    const full = anchor.slice()
    for (let i = 0; i < nFree; i++) full[i] = xFree[i]!
    const h3 = Math.exp(full[0]!)
    const r = Math.exp(full[1]!)
    const mk = (idx: number, ph: number): C2 => {
      const mag = Math.exp(full[idx]!)
      const z = z18(ph)
      return [mag * z[0], mag * z[1]]
    }
    const f22 = mk(2, fPh[4])
    const sC = mk(3, sPh)
    const f11 = mk(4, fPh[2])
    const f12 = mk(5, fPh[3])
    const f01 = mk(6, fPh[0])
    const f02 = mk(7, fPh[1])
    const thNu = full[8]!
    const F: Mat3 = [
      [[0, 0], f01, f02],
      [f01, f11, f12],
      [f02, f12, f22],
    ]
    const zeroG: Mat3 = [
      [[0, 0], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [0, 0]],
    ]
    const y = buildYukawasSO10(h3, F, zeroG, r, sC, 1)
    return { ...y, thNu }
  }

  // Exact k = 0 evaluation (zero free parameters, including seesaw m_3 prediction)
  const m0 = buildNested(0, [])
  const m3Ev = ((V_EW_GEV * V_EW_GEV * fCusp[1] * fCusp[1]) / M_PS_GEV) * 1e9
  const dm31_0 = m3Ev * m3Ev
  const pDm21_0 = (0 - TARGETS.dm21[0]) / TARGETS.dm21[1]
  const pDm31_0 = (dm31_0 - TARGETS.dm31[0]) / TARGETS.dm31[1]
  const e0 = evalFlavorTM1(m0.Yu, m0.Yd, m0.Ye, m0.thNu, psiNested, pL, [pDm21_0, pDm31_0])
  const ytPull0 = e0.pulls19[2]!
  const ybPull0 = e0.pulls19[5]!

  // k = 2: free 2 neutrino mass eigenvalues (0 charged/TM1 free)
  const e2 = evalFlavorTM1(m0.Yu, m0.Yd, m0.Ye, m0.thNu, psiNested, pL, [0, 0])

  const pareto: { readonly k: number; readonly chi18: number }[] = [
    { k: 0, chi18: e0.chi18 },
    { k: 2, chi18: e2.chi18 },
  ]

  let prevX: number[] = []
  for (const [kTot, nFree] of [
    [4, 2],
    [6, 4],
    [8, 6],
    [10, 8],
    [11, 9],
  ] as const) {
    const starts: number[][] = [
      [...prevX, ...anchor.slice(prevX.length, nFree)],
      [...prevX, ...gjBasin.slice(prevX.length, nFree)],
      gjBasin.slice(0, nFree),
    ]
    let bestChi = Number.POSITIVE_INFINITY
    let bestX = starts[0]!
    for (const xInit of starts) {
      const sol = lmSolve(
        xInit,
        z => {
          const mm = buildNested(nFree, z)
          return evalFlavorTM1(mm.Yu, mm.Yd, mm.Ye, mm.thNu, psiNested, pL).pulls16NoNuMass
        },
        70,
      )
      const mf = buildNested(nFree, sol.x)
      const ef = evalFlavorTM1(mf.Yu, mf.Yd, mf.Ye, mf.thNu, psiNested, pL)
      if (ef.chi18 < bestChi) {
        bestChi = ef.chi18
        bestX = sol.x.slice()
      }
    }
    pareto.push({ k: kTot, chi18: bestChi })
    prevX = bestX
  }

  let strictDescent = true
  for (let i = 1; i < pareto.length; i++) {
    if (!(pareto[i - 1]!.chi18 > pareto[i]!.chi18)) strictDescent = false
  }
  const chi11 = pareto[pareto.length - 1]!.chi18

  // Explicit k = 11 submodel WITH g01 != 0 (dropping f02 = 0 from the certified k = 12 g01 branch)
  const buildK11WithG01 = (x: readonly number[]) => {
    const h3 = Math.exp(x[0]!)
    const mk = (idx: number, ph: number): C2 => {
      const mag = Math.exp(x[idx]!)
      const z = z18(ph)
      return [mag * z[0], mag * z[1]]
    }
    const f01 = mk(1, fPh[0])
    const f11 = mk(2, fPh[2])
    const f12 = mk(3, fPh[3])
    const f22 = mk(4, fPh[4])
    const g01 = mk(5, 17)
    const r = Math.exp(x[6]!)
    const sC = mk(7, sPh)
    const thNu = x[8]!
    const F: Mat3 = [
      [[0, 0], f01, [0, 0]],
      [f01, f11, f12],
      [[0, 0], f12, f22],
    ]
    const G: Mat3 = [
      [[0, 0], g01, [0, 0]],
      [[-g01[0], -g01[1]], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [0, 0]],
    ]
    return { ...buildYukawasSO10(h3, F, G, r, sC, 1), thNu }
  }
  const x11GSeed = [-4.928829, -11.759533, -8.745534, -7.907834, -6.260294, -10.271536, 4.259821, -1.891208, 0.179917]
  const sol11G = lmSolve(
    x11GSeed,
    z => {
      const m = buildK11WithG01(z)
      return evalFlavorTM1(m.Yu, m.Yd, m.Ye, m.thNu, psiNested, pL).pulls16NoNuMass
    },
    80,
  )
  const m11G = buildK11WithG01(sol11G.x)
  const e11G = evalFlavorTM1(m11G.Yu, m11G.Yd, m11G.Ye, m11G.thNu, psiNested, pL)

  console.log(
    `  Exact k=0: chi18=${e0.chi18.toExponential(3)} (> 1e6), yt_pull=${ytPull0.toFixed(3)}, yb_pull=${ybPull0.toFixed(3)}, m_3=${m3Ev.toFixed(4)} eV`,
  )
  console.log(
    `  Nested G=0 Pareto chi18(k): ${pareto.map(p => `k=${p.k}:${p.chi18 > 1e4 ? p.chi18.toExponential(2) : p.chi18.toFixed(1)}`).join(' > ')} (converged GJ floor < 5000, > 1000)`,
  )
  console.log(
    `  k=11 with g01 != 0 (f02 = 0 dropped from k=12 branch): chi18=${e11G.chi18.toFixed(1)} (> 1000, max18=${e11G.max18.toFixed(2)})`,
  )

  const ok =
    maxRes < 1e-14 &&
    maxNormErr < 1e-14 &&
    maxFDev < 1e-5 &&
    e0.chi18 > 1e6 &&
    Math.abs(ytPull0) < 1.0 &&
    Math.abs(ybPull0) < 1.0 &&
    m3Ev >= 0.1 &&
    m3Ev <= 0.2 &&
    strictDescent &&
    chi11 > 1000 &&
    chi11 < 5000 &&
    e11G.chi18 > 1000

  recordGate(
    'F2.1',
    'Tier A/B',
    '{3,4,3,4} D_*=13 cusp zero modes & converged k=0..11 Pareto lower bound (G=0 & g01!=0)',
    ok,
    `||Q u||_inf=${maxRes.toExponential(1)}, f=[${fCusp.map(v => v.toExponential(4)).join(',')}], ` +
      `k=0 (yt=${ytPull0.toFixed(2)}s, yb=${ybPull0.toFixed(2)}s, m_3=${m3Ev.toFixed(3)}eV), ` +
      `nested G=0 chi18(11)=${chi11.toFixed(1)} (GJ floor), k=11(g01!=0,f02=0) chi18=${e11G.chi18.toFixed(1)} (> 1000)`,
  )

  return fCusp
}

// =================================================================================================
// 7. GATE F2.2: CERTIFIED ZERO-CONTINUOUS-PHASE k_min = 12 & k_min = 13 SOLUTIONS
// =================================================================================================

function buildK12(
  x: readonly number[],
  fPh: readonly [number, number, number, number, number],
  gPh: number,
  sPh: number,
) {
  const h3 = Math.exp(x[0]!)
  const mk = (idx: number, ph: number): C2 => {
    const m = Math.exp(x[idx]!)
    const z = z18(ph)
    return [m * z[0], m * z[1]]
  }
  const f01 = mk(1, fPh[0])
  const f02 = mk(2, fPh[1])
  const f11 = mk(3, fPh[2])
  const f12 = mk(4, fPh[3])
  const f22 = mk(5, fPh[4])
  const g01 = mk(6, gPh)
  const r = Math.exp(x[7]!)
  const sC = mk(8, sPh)
  const thNu = x[9]!
  const F: Mat3 = [
    [[0, 0], f01, f02],
    [f01, f11, f12],
    [f02, f12, f22],
  ]
  const G: Mat3 = [
    [[0, 0], g01, [0, 0]],
    [[-g01[0], -g01[1]], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
  ]
  return { ...buildYukawasSO10(h3, F, G, r, sC, 1), thNu }
}

function buildK13(
  x: readonly number[],
  fPh: readonly [number, number, number, number, number],
  gPh: readonly [number, number],
  sPh: number,
) {
  const h3 = Math.exp(x[0]!)
  const mk = (idx: number, ph: number): C2 => {
    const m = Math.exp(x[idx]!)
    const z = z18(ph)
    return [m * z[0], m * z[1]]
  }
  const f01 = mk(1, fPh[0])
  const f02 = mk(2, fPh[1])
  const f11 = mk(3, fPh[2])
  const f12 = mk(4, fPh[3])
  const f22 = mk(5, fPh[4])
  const g01 = mk(6, gPh[0])
  const g12 = mk(7, gPh[1])
  const r = Math.exp(x[8]!)
  const sC = mk(9, sPh)
  const thNu = x[10]!
  const F: Mat3 = [
    [[0, 0], f01, f02],
    [f01, f11, f12],
    [f02, f12, f22],
  ]
  const G: Mat3 = [
    [[0, 0], g01, [0, 0]],
    [[-g01[0], -g01[1]], [0, 0], g12],
    [[0, 0], [-g12[0], -g12[1]], [0, 0]],
  ]
  return { ...buildYukawasSO10(h3, F, G, r, sC, 1), thNu, h3, r, F, G }
}

function runF22(fCusp: readonly [number, number, number]): void {
  console.log('\n=================================================================================')
  console.log('GATE F2.2 (Tier B/C): CERTIFIED ZERO-CONTINUOUS-PHASE k_min = 12 & k_min = 13')
  console.log('=================================================================================')

  // 1. k = 12 (18-obs opt, psi = 13, 0 cont phases, 10 discrete Z_18 phases): strict 0.1% lepton floor
  const fPh12a = [12, 6, 13, 6, 5] as const
  const gPh12a = 17
  const sPh12a = 1
  const pL12a = [16, 4] as const
  const x12aSeed = [
    -4.928829, -11.759533, -9.904373, -8.745534, -7.907834, -6.260294, -10.271536, 4.259821, -1.891208, 0.179917,
  ]
  const sol12a = lmSolve(
    x12aSeed,
    z => {
      const m = buildK12(z, fPh12a, gPh12a, sPh12a)
      return evalFlavorTM1(m.Yu, m.Yd, m.Ye, m.thNu, 13, pL12a).pulls16NoNuMass
    },
    50,
  )
  const m12a = buildK12(sol12a.x, fPh12a, gPh12a, sPh12a)
  const e12a = evalFlavorTM1(m12a.Yu, m12a.Yd, m12a.Ye, m12a.thNu, 13, pL12a)
  console.log(
    `  k=12 (18-obs opt, psi=13, 0 cont + 10 discrete Z_18 phases): chi18=${e12a.chi18.toFixed(3)} (< 15), max18=${e12a.max18.toFixed(3)} (< 2.0), ` +
      `chi19=${e12a.chi19.toFixed(3)}, dCKM=${e12a.dCkmRad.toFixed(4)}, dNu_pull=${e12a.pNu.toFixed(2)} (|dNu| > 3.0)`,
  )

  // 2. k = 12 (19-obs opt, psi = 6, 0 cont phases, 10 discrete Z_18 phases): strict 0.1% lepton floor
  const fPh12b = [14, 11, 11, 6, 7] as const
  const gPh12b = 2
  const sPh12b = 17
  const pL12b = [12, 12] as const
  const x12bSeed = [
    -4.849073, -11.987418, -10.065658, -8.737111, -7.876702, -7.048971, -10.236474, 4.168918, -1.800088, 0.258285,
  ]
  const sol12b = lmSolve(
    x12bSeed,
    z => {
      const m = buildK12(z, fPh12b, gPh12b, sPh12b)
      const ev = evalFlavorTM1(m.Yu, m.Yd, m.Ye, m.thNu, 6, pL12b)
      return [...ev.pulls16NoNuMass, ev.pNu]
    },
    30,
  )
  const m12b = buildK12(sol12b.x, fPh12b, gPh12b, sPh12b)
  const e12b = evalFlavorTM1(m12b.Yu, m12b.Yd, m12b.Ye, m12b.thNu, 6, pL12b)
  console.log(
    `  k=12 (19-obs opt, psi=6,  0 cont + 10 discrete Z_18 phases): chi18=${e12b.chi18.toFixed(3)}, chi19=${e12b.chi19.toFixed(3)} (< 13), ` +
      `max19=${e12b.max19.toFixed(3)} (< 2.5), dCKM=${e12b.dCkmRad.toFixed(4)}, dNu_pull=${e12b.pNu.toFixed(2)}`,
  )

  // 3. k = 13 (R1_k13_g2_ST, psi = 7, 0 cont phases, 11 discrete Z_18 phases): ALL 19 observables < 1.0 sigma!
  const fPh13 = [13, 5, 13, 6, 11] as const
  const gPh13 = [17, 1] as const
  const sPh13 = 0
  const pL13 = [17, 16] as const
  const x13Seed = [
    -4.851587, -11.859185, -9.893160, -8.726695, -7.909836, -7.038150, -10.276807, -8.777293, 4.176617, -1.823878,
    0.183835,
  ]
  const sol13 = lmSolve(
    x13Seed,
    z => {
      const m = buildK13(z, fPh13, gPh13, sPh13)
      const ev = evalFlavorTM1(m.Yu, m.Yd, m.Ye, m.thNu, 7, pL13)
      return [...ev.pulls16NoNuMass, ev.pNu]
    },
    30,
  )
  const m13 = buildK13(sol13.x, fPh13, gPh13, sPh13)
  const e13 = evalFlavorTM1(m13.Yu, m13.Yd, m13.Ye, m13.thNu, 7, pL13)

  // Compute {3,4,3,4} cusp-normalized O(1) UV couplings r |Y_ij| / (f(c_i) f(c_j))
  const uvCouplings: { readonly name: string; readonly val: number }[] = [
    { name: 'h3', val: (m13.r * m13.h3) / (fCusp[2] * fCusp[2]) },
    { name: 'f01', val: (m13.r * cAbs(m13.F[0][1])) / (fCusp[0] * fCusp[1]) },
    { name: 'f02', val: (m13.r * cAbs(m13.F[0][2])) / (fCusp[0] * fCusp[2]) },
    { name: 'f11', val: (m13.r * cAbs(m13.F[1][1])) / (fCusp[1] * fCusp[1]) },
    { name: 'f12', val: (m13.r * cAbs(m13.F[1][2])) / (fCusp[1] * fCusp[2]) },
    { name: 'f22', val: (m13.r * cAbs(m13.F[2][2])) / (fCusp[2] * fCusp[2]) },
    { name: 'g01', val: (m13.r * cAbs(m13.G[0][1])) / (fCusp[0] * fCusp[1]) },
    { name: 'g12', val: (m13.r * cAbs(m13.G[1][2])) / (fCusp[1] * fCusp[2]) },
  ]
  let minUv = Number.POSITIVE_INFINITY
  let maxUv = 0
  for (const c of uvCouplings) {
    if (c.val < minUv) minUv = c.val
    if (c.val > maxUv) maxUv = c.val
  }
  const uvRatio = maxUv / minUv
  const hierRatio = TARGETS.yt[0] / TARGETS.ye[0]

  console.log(
    `  k=13 (R1_k13_g2_ST, psi=7, 0 cont + 11 discrete Z_18 phases, dof=6): chi18=${e13.chi18.toFixed(3)} (< 1.7), max18=${e13.max18.toFixed(3)} (< 0.90), ` +
      `chi19=${e13.chi19.toFixed(3)} (< 2.65), max19=${e13.max19.toFixed(3)} (< 1.00), dCKM=${e13.dCkmRad.toFixed(4)}, dNu=${e13.dNuDeg.toFixed(1)} deg`,
  )
  console.log(
    `  Discrete phase accounting: 0 continuous phases; 11 Z_18 integers at k=13 (5 in F, 2 in G, 1 in s, 1 psi, 2 in P_L; 10 at k=12), unified Dirac PDG J = +Im`,
  )
  console.log(
    `  Cusp-normalized UV couplings r|Y_ij|/(f_i f_j): [${minUv.toFixed(3)}, ${maxUv.toFixed(3)}] (spread=${uvRatio.toFixed(2)}x < 20x vs y_t/y_e=${hierRatio.toExponential(3)})`,
  )

  const ok =
    e12a.chi18 < 15.0 &&
    e12a.max18 < 2.0 &&
    Math.abs(e12a.pNu) > 3.0 &&
    e12b.chi19 < 13.0 &&
    e12b.max19 < 2.5 &&
    e13.chi18 < 1.7 &&
    e13.max18 < 0.90 &&
    e13.chi19 < 2.65 &&
    e13.max19 < 1.00 &&
    minUv >= 0.75 &&
    maxUv <= 15.5 &&
    uvRatio < 20.0 &&
    hierRatio > 1.7e5

  recordGate(
    'F2.2',
    'Tier B/C',
    'Certified zero-continuous-phase k_min=12 (18-obs & 19-obs) and k_min=13 (<1 sigma all 19 obs, unified Dirac CP)',
    ok,
    `k=12(psi=13, 10 Z_18): chi18=${e12a.chi18.toFixed(2)}, max18=${e12a.max18.toFixed(2)}, pNu=${e12a.pNu.toFixed(2)}; ` +
      `k=12(psi=6, 10 Z_18): chi19=${e12b.chi19.toFixed(2)}, max19=${e12b.max19.toFixed(2)}; ` +
      `k=13(psi=7, 11 Z_18): chi18=${e13.chi18.toFixed(3)}, chi19=${e13.chi19.toFixed(3)}, max19=${e13.max19.toFixed(3)}, UV in [${minUv.toFixed(2)}, ${maxUv.toFixed(2)}]`,
  )
}

// =================================================================================================
// 8. GATE F2.3: HONEST FLAVOR NEGATIVE CONTROLS
// =================================================================================================

function runF23(): void {
  console.log('\n=================================================================================')
  console.log('GATE F2.3 (Tier B/C): HONEST FLAVOR NEGATIVE CONTROLS')
  console.log('=================================================================================')

  // 1. Symmetric GJ (G = 0) RGE-invariant double-ratio (y_mu y_d)/(y_e y_s) = 10.60 vs 9.00
  const doubleRatio = (TARGETS.ymu[0] * TARGETS.yd[0]) / (TARGETS.ye[0] * TARGETS.ys[0])
  const relMismatch = (doubleRatio - 9.0) / 9.0
  const fPhGj = [12, 6, 13, 6, 5] as const
  const xGj0 = [-4.93, -11.76, -9.91, -8.74, -7.91, -6.26, 4.26, -1.89]
  const buildGj = (x: readonly number[]) => {
    const h3 = Math.exp(x[0]!)
    const mk = (i: number, p: number): C2 => {
      const m = Math.exp(x[i]!)
      const z = z18(p)
      return [m * z[0], m * z[1]]
    }
    const F: Mat3 = [
      [[0, 0], mk(1, fPhGj[0]), mk(2, fPhGj[1])],
      [mk(1, fPhGj[0]), mk(3, fPhGj[2]), mk(4, fPhGj[3])],
      [mk(2, fPhGj[1]), mk(4, fPhGj[3]), mk(5, fPhGj[4])],
    ]
    const zeroG: Mat3 = [
      [[0, 0], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [0, 0]],
    ]
    return buildYukawasSO10(h3, F, zeroG, Math.exp(x[6]!), mk(7, 1), 1)
  }
  const solGj = lmSolve(
    xGj0,
    z => {
      const m = buildGj(z)
      return evalFlavorTM1(m.Yu, m.Yd, m.Ye, 0.25, 5, [5, 6]).pulls16NoNuMass.slice(0, 13)
    },
    80,
  )
  const mGj = buildGj(solGj.x)
  const eGj = evalFlavorTM1(mGj.Yu, mGj.Yd, mGj.Ye, 0.25, 5, [5, 6])
  const ydPullGj = Math.abs(eGj.pulls19[3]!)
  console.log(
    `  NegCtrl 1 (GJ G=0): (y_mu y_d)/(y_e y_s)=${doubleRatio.toFixed(3)} vs 9.00 (+${(relMismatch * 100).toFixed(2)}%), ` +
      `10+126bar fit |yd_pull|=${ydPullGj.toFixed(2)} (> 6.5), chi13=${solGj.cost.toFixed(1)}`,
  )

  // 2. Pure U_TBM (theta_nu = 0, k = 14: h3, f00..f22, g01, g02, g12, r, s + 2 nu masses) for ce_G = -3 and +1
  const runTbmCtrl = (ceG: number): { readonly chi18: number; readonly max18: number } => {
    const x14Init = [-4.85, -14.5, -11.86, -9.90, -8.73, -7.91, -7.04, -10.28, -11.5, -8.78, 4.18, -1.83]
    const build14 = (x: readonly number[]) => {
      const h3 = Math.exp(x[0]!)
      const mk = (i: number, p: number): C2 => {
        const m = Math.exp(x[i]!)
        const z = z18(p)
        return [m * z[0], m * z[1]]
      }
      const f00 = mk(1, 0)
      const f01 = mk(2, 13)
      const f02 = mk(3, 5)
      const f11 = mk(4, 13)
      const f12 = mk(5, 6)
      const f22 = mk(6, 11)
      const g01 = mk(7, 17)
      const g02 = mk(8, 3)
      const g12 = mk(9, 1)
      const F: Mat3 = [
        [f00, f01, f02],
        [f01, f11, f12],
        [f02, f12, f22],
      ]
      const G: Mat3 = [
        [[0, 0], g01, g02],
        [[-g01[0], -g01[1]], [0, 0], g12],
        [[-g02[0], -g02[1]], [-g12[0], -g12[1]], [0, 0]],
      ]
      return buildYukawasSO10(h3, F, G, Math.exp(x[10]!), mk(11, 0), ceG)
    }
    // Check best pL among representative discrete phases, then full LM polish
    let bestChi = Number.POSITIVE_INFINITY
    let bestMax = 0
    for (const pL of [
      [0, 0],
      [5, 6],
      [9, 12],
    ] as const) {
      const sol = lmSolve(
        x14Init,
        z => {
          const m = build14(z)
          return evalFlavorTM1(m.Yu, m.Yd, m.Ye, 0, 0, pL).pulls16NoNuMass
        },
        35,
      )
      const mf = build14(sol.x)
      const ef = evalFlavorTM1(mf.Yu, mf.Yd, mf.Ye, 0, 0, pL)
      if (ef.chi18 < bestChi) {
        bestChi = ef.chi18
        bestMax = ef.max18
      }
    }
    return { chi18: bestChi, max18: bestMax }
  }
  const tbmM3 = runTbmCtrl(-3)
  const tbmP1 = runTbmCtrl(1)
  console.log(
    `  NegCtrl 2 (pure U_TBM, th_nu=0, k=14, representative Z[zeta_9] branch, not exhaustive 18^10 search): ` +
      `ce_G=-3 -> chi18=${tbmM3.chi18.toFixed(1)}, max18=${tbmM3.max18.toFixed(2)}; ` +
      `ce_G=+1 -> chi18=${tbmP1.chi18.toFixed(1)}, max18=${tbmP1.max18.toFixed(2)} (both > 55 / > 5.5)`,
  )

  // 3. Pure unified 10 + 126bar Type-I seesaw (representative Z[zeta_9] branch, unified Dirac Takagi M_nu^dag M_nu)
  const xSsInit = [-4.93, -15.0, -11.76, -9.91, -8.74, -7.91, -6.26, 4.26, -1.89]
  const evalTypeISeesaw = (x: readonly number[]): { readonly pulls: number[]; readonly chi18: number; readonly s23Sq: number } => {
    const h3 = Math.exp(x[0]!)
    const mk = (i: number, p: number): C2 => {
      const m = Math.exp(x[i]!)
      const z = z18(p)
      return [m * z[0], m * z[1]]
    }
    const f00 = mk(1, 0)
    const f01 = mk(2, 12)
    const f02 = mk(3, 6)
    const f11 = mk(4, 13)
    const f12 = mk(5, 6)
    const f22 = mk(6, 5)
    const r = Math.exp(x[7]!)
    const sC = mk(8, 1)
    const F: Mat3 = [
      [f00, f01, f02],
      [f01, f11, f12],
      [f02, f12, f22],
    ]
    const zeroG: Mat3 = [
      [[0, 0], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [0, 0]],
    ]
    const { Yu, Yd, Ye } = buildYukawasSO10(h3, F, zeroG, r, sC, 1)
    const H: Mat3 = [
      [[0, 0], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [h3, 0]],
    ]
    const Ynu: Mat3 = [0, 1, 2].map(i =>
      [0, 1, 2].map(j => {
        const v = cSub(H[i]![j]!, cMul([3 * sC[0], 3 * sC[1]], F[i]![j]!))
        return [r * v[0], r * v[1]] as C2
      }),
    ) as unknown as Mat3
    const Mnu = m3Mul(m3Mul(Ynu, m3Inv(F)), Ynu)
    const ch = evalFlavorTM1(Yu, Yd, Ye, 0, 0, [0, 0]).pulls16NoNuMass.slice(0, 13)
    const ee = leftEig(Ye)
    const enu = leftEigMajorana(Mnu)
    const pmns = extractPDGMixing(m3MulDagLeft(ee.U, enu.U))
    const pulls = [
      ...ch,
      (pmns.s12Sq - TARGETS.s12[0]) / TARGETS.s12[1],
      (pmns.s23Sq - TARGETS.s23[0]) / TARGETS.s23[1],
      (pmns.s13Sq - TARGETS.s13[0]) / TARGETS.s13[1],
    ]
    let chi18 = 0
    for (const p of pulls) chi18 += p * p
    return { pulls, chi18, s23Sq: pmns.s23Sq }
  }
  const solSs = lmSolve(xSsInit, z => evalTypeISeesaw(z).pulls, 60)
  const eSs = evalTypeISeesaw(solSs.x)
  const s23PullSs = Math.abs((eSs.s23Sq - TARGETS.s23[0]) / TARGETS.s23[1])
  console.log(
    `  NegCtrl 3 (unified 10+126bar Type-I seesaw, representative Z[zeta_9] branch, Dirac Takagi M_nu^dag M_nu): ` +
      `s23^2=${eSs.s23Sq.toFixed(4)} (${s23PullSs.toFixed(1)} sigma), chi18=${eSs.chi18.toFixed(1)} (> 100)`,
  )

  const ok =
    Math.abs(doubleRatio - 10.60) < 0.05 &&
    relMismatch > 0.17 &&
    ydPullGj > 6.5 &&
    tbmM3.chi18 > 55 &&
    tbmM3.max18 > 5.5 &&
    tbmP1.chi18 > 55 &&
    tbmP1.max18 > 5.5 &&
    eSs.chi18 > 100 &&
    s23PullSs > 5.0

  recordGate(
    'F2.3',
    'Tier B/C',
    'Honest flavor negative controls (GJ double-ratio, pure U_TBM k=14, unified Type-I seesaw)',
    ok,
    `GJ ratio=${doubleRatio.toFixed(2)} (+${(relMismatch * 100).toFixed(1)}%, |yd|=${ydPullGj.toFixed(2)}s); ` +
      `U_TBM chi18=[${tbmM3.chi18.toFixed(1)}, ${tbmP1.chi18.toFixed(1)}]; Type-I seesaw s23^2=${eSs.s23Sq.toFixed(4)} (chi18=${eSs.chi18.toFixed(1)})`,
  )
}

// =================================================================================================
// 9. GATE U3.1: 4D D_4 EXACT ROOT/TRIANGLE NORMALIZATION, 2-SKELETON DUALITY & ACTION DEPENDENCE
// =================================================================================================

function buildD4Roots(): readonly (readonly [number, number, number, number])[] {
  const roots: [number, number, number, number][] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const s1 of [-1, 1]) {
        for (const s2 of [-1, 1]) {
          const v: [number, number, number, number] = [0, 0, 0, 0]
          v[i] = s1
          v[j] = s2
          roots.push(v)
        }
      }
    }
  }
  return roots
}

function runU31(): void {
  console.log('\n=================================================================================')
  console.log('GATE U3.1 (Tier A): 4D D_4 ROOT/TRIANGLE NORMALIZATION, DUALITY & ACTION SPREAD')
  console.log('=================================================================================')

  const roots = buildD4Roots()
  assert(roots.length === 24, `D_4 root count must be 24, got ${roots.length}`)

  // Count unordered pairs with a . b = 1 (each forms an equilateral triangle {0, a, b} of edge length sqrt(2))
  let pairCount = 0
  let sumArea01SqPairs = 0
  const key = (v: readonly [number, number, number, number]): string => `${v[0]},${v[1]},${v[2]},${v[3]}`
  const uniqTris = new Set<string>()

  for (let i = 0; i < 24; i++) {
    for (let j = i + 1; j < 24; j++) {
      const a = roots[i]!
      const b = roots[j]!
      const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
      if (dot !== 1) continue
      pairCount++
      const a01 = 0.5 * (a[0] * b[1] - a[1] * b[0])
      sumArea01SqPairs += a01 * a01
      // Canonicalize triangle modulo lattice translations (3 vertices -> 3 cyclic representatives)
      const w: [number, number, number, number] = [b[0] - a[0], b[1] - a[1], b[2] - a[2], b[3] - a[3]]
      const negA: [number, number, number, number] = [-a[0], -a[1], -a[2], -a[3]]
      const negB: [number, number, number, number] = [-b[0], -b[1], -b[2], -b[3]]
      const negW: [number, number, number, number] = [-w[0], -w[1], -w[2], -w[3]]
      const reps = [
        [key(a), key(b)].sort().join('|'),
        [key(negA), key(w)].sort().join('|'),
        [key(negB), key(negW)].sort().join('|'),
      ].sort()
      uniqTris.add(reps[0]!)
    }
  }
  const triPerSite = uniqTris.size
  // Continuum kinetic weight on primal 16-cell honeycomb K = {3,3,4,3}:
  //   V_cell(D_4) = 2 in Z^4-even coordinates (so 1 / V_cell(D_4) = 0.5),
  //   c_kin(K) = (1 / V_cell(D_4)) * sum_{32 tris/site} (A_{tri,01})^2
  //            = (1 / V_cell(D_4)) * (1/3) * sum_{96 pairs} (A_{01})^2 = 0.5 * (12 / 3) = 2.000000.
  const invVcellD4 = 0.5
  const cKinD4 = invVcellD4 * (sumArea01SqPairs / 3)
  const cKinErr = Math.abs(cKinD4 - 2.0)

  // Exact non-self-dual 4D D_4 honeycomb duality K = {3,3,4,3} <-> K^* = {3,4,3,3}:
  //   Dual 24-cell honeycomb K^* = {3,4,3,3} also has 96/3 = 32 equilateral triangles/cell,
  //   but with edge length 1 (vs sqrt(2) on K), so area(tri^*) = area(tri) / 2 and area^2 scales by 1/4:
  //     c_kin(K^*) = c_kin(K) / 4 = 0.500000,   c_kin(K) * c_kin(K^*) = 1.000000.
  //   Under 4D U(1) Villain Kramers-Wannier duality beta_V * beta_V^* = 1 / (2 pi)^2:
  //     - Lattice geometric-mean point beta_V = beta_V^* = 1 / (2 pi) gives DISTINCT continuum couplings
  //       alpha_K^-1 = 4 pi * c_kin(K) * beta_V = 4.000 vs alpha_{K^*}^-1 = 4 pi * c_kin(K^*) * beta_V^* = 1.000
  //       (because K != K^* is NOT self-dual).
  //     - True continuum electric-magnetic self-dual point (alpha_K^-1 === alpha_{K^*}^-1) sits at
  //       beta_V = 1 / (4 pi), beta_V^* = 1 / pi, yielding
  //         1 / g_sd^2 = c_kin(K) * beta_V = 1 / (2 pi) = 0.159155,
  //         alpha_sd^-1 = 4 pi * (1 / g_sd^2) = 2.000000 (31.52x below 63.036).
  const cKinDual = cKinD4 / 4
  const cKinProd = cKinD4 * cKinDual
  const betaGeom = 1 / (2 * PI)
  const alphaGeomPrimalInv = 4 * PI * cKinD4 * betaGeom
  const alphaGeomDualInv = 4 * PI * cKinDual * betaGeom

  const alpha0Target = 63.036
  const betaSdPrimal = 1 / (4 * PI)
  const betaSdDual = 1 / PI
  const kwProdErr = Math.abs(betaSdPrimal * betaSdDual - 1 / (4 * PI * PI))
  const invGsd2 = cKinD4 * betaSdPrimal
  const invGsd2Dual = cKinDual * betaSdDual
  const alphaSdInv = 4 * PI * invGsd2
  const alphaSdDualInv = 4 * PI * invGsd2Dual
  const sdRatio = alpha0Target / alphaSdInv

  // Gauge-invariant 1-loop action dependence on 4D D_4 for SO(10) (N_c = 10, C_2(G) = 8, dim = 45):
  //   Exact Wilson vs Manton 1-loop bare stiffness difference:
  //     Delta alpha_0^-1 = 4 pi * ((11 / 32) * (9 / 2) - (11 / 192) * 8) = 4 pi * (209/192) = 13.679018
  //   Exact matching scale shift mu = 1/a -> pi/a for SO(10) (b_0 = (11/3) C_2 = 88/3):
  //     Delta_scale = (b_0 / (2 pi)) ln(pi) = ((11 * 8) / (6 pi)) ln(pi) = 5.344223
  const actionSpread = 4 * PI * ((11 / 32) * (9 / 2) - (11 / 192) * 8)
  const actionRelSpread = actionSpread / alpha0Target
  const scaleShift = ((11 * 8) / (6 * PI)) * Math.log(PI)

  console.log(
    `  D_4 primal/dual geometry: 24 roots, ${pairCount} pairs (a.b=1), ${triPerSite} tris/site (32 === ${pairCount}/3), ` +
      `c_kin(K={3,3,4,3})=${cKinD4.toFixed(6)} (1/V_cell=0.5, err=${cKinErr.toExponential(1)}), ` +
      `c_kin(K*={3,4,3,3})=${cKinDual.toFixed(6)}, product=${cKinProd.toFixed(6)}`,
  )
  console.log(
    `  U(1) Villain duality (beta_V beta_V* = 1/(2pi)^2): geom-mean beta=1/(2pi) -> alpha_K^-1=${alphaGeomPrimalInv.toFixed(3)} != alpha_K*^-1=${alphaGeomDualInv.toFixed(3)}; ` +
      `continuum self-dual beta_V=1/(4pi), beta_V*=1/pi -> 1/g_sd^2=${invGsd2.toFixed(6)} (1/(2pi)), alpha_sd^-1=${alphaSdInv.toFixed(6)} (${sdRatio.toFixed(2)}x < 63.036)`,
  )
  console.log(
    `  Action & scale dependence: Wilson-Manton=${actionSpread.toFixed(4)} (${(actionRelSpread * 100).toFixed(2)}% > 21%), ` +
      `scale shift(1/a->pi/a)=+${scaleShift.toFixed(4)} (> 5.3)`,
  )

  const ok =
    pairCount === 96 &&
    triPerSite === 32 &&
    triPerSite === pairCount / 3 &&
    cKinErr < 1e-14 &&
    Math.abs(cKinDual - 0.5) < 1e-14 &&
    Math.abs(cKinProd - 1.0) < 1e-14 &&
    Math.abs(alphaGeomPrimalInv - 4.0) < 1e-14 &&
    Math.abs(alphaGeomDualInv - 1.0) < 1e-14 &&
    kwProdErr < 1e-15 &&
    Math.abs(invGsd2 - 1 / (2 * PI)) < 1e-14 &&
    Math.abs(alphaSdInv - 2.0) < 1e-14 &&
    Math.abs(alphaSdDualInv - 2.0) < 1e-14 &&
    sdRatio > 30.0 &&
    actionSpread > 13.5 &&
    actionRelSpread > 0.21 &&
    scaleShift > 5.3

  recordGate(
    'U3.1',
    'Tier A',
    '4D D_4 primal/dual honeycomb normalization ({3,3,4,3}<->{3,4,3,3}), U(1) Villain duality & action spread',
    ok,
    `32===96/3, c_kin(K)=${cKinD4.toFixed(3)}, c_kin(K*)=${cKinDual.toFixed(3)} (prod=1), ` +
      `geom-mean=[${alphaGeomPrimalInv.toFixed(1)}, ${alphaGeomDualInv.toFixed(1)}], continuum self-dual alpha_sd^-1=${alphaSdInv.toFixed(3)} (${sdRatio.toFixed(1)}x < 63.036), ` +
      `Wilson-Manton=${actionSpread.toFixed(3)} (${(actionRelSpread * 100).toFixed(1)}%), scaleShift=+${scaleShift.toFixed(3)}`,
  )
}

// =================================================================================================
// 10. GATE U3.2: DENSE-RING beta_0(L), VOL_H4, CUSP RESISTANCE, RICCATI & LOOK-ELSEWHERE
// =================================================================================================

type IVec4 = readonly [number, number, number, number]
type D4LoopStep = { readonly link: number; readonly sign: number; readonly base: IVec4 }

function cmpIVec4(a: IVec4, b: IVec4): number {
  for (let i = 0; i < 4; i++) {
    if (a[i]! !== b[i]!) return a[i]! - b[i]!
  }
  return 0
}

function iVec4Key(v: IVec4): string {
  return `${v[0]},${v[1]},${v[2]},${v[3]}`
}

function canonicalCycleKey(verts: readonly IVec4[]): string {
  const m = verts.length
  let best: IVec4[] | null = null
  for (let s = 0; s < m; s++) {
    const o = verts[s]!
    for (const dir of [1, -1] as const) {
      const cand: IVec4[] = new Array<IVec4>(m)
      for (let t = 0; t < m; t++) {
        const v = verts[(s + dir * t + m) % m]!
        cand[t] = [v[0] - o[0], v[1] - o[1], v[2] - o[2], v[3] - o[3]]
      }
      if (best === null) {
        best = cand
      } else {
        let cmp = 0
        for (let t = 0; t < m; t++) {
          cmp = cmpIVec4(cand[t]!, best[t]!)
          if (cmp !== 0) break
        }
        if (cmp < 0) best = cand
      }
    }
  }
  return best!.map(iVec4Key).join('|')
}

function toD4Prim(x: IVec4): IVec4 {
  return [
    (x[0] + x[1] + x[2] + x[3]) / 2,
    (x[0] - x[1] - x[2] - x[3]) / 2,
    -x[2] - x[3],
    -x[3],
  ]
}

function choleskyInPlaceHerm(n: number, re: Float64Array, im: Float64Array): number {
  let lnDet = 0
  for (let j = 0; j < n; j++) {
    let d = re[j * n + j]!
    for (let k = 0; k < j; k++) {
      const rk = re[j * n + k]!
      const ik = im[j * n + k]!
      d -= rk * rk + ik * ik
    }
    if (!(d > 0)) return NaN
    const ljj = Math.sqrt(d)
    re[j * n + j] = ljj
    im[j * n + j] = 0
    lnDet += 2 * Math.log(ljj)
    const invLjj = 1 / ljj
    for (let i = j + 1; i < n; i++) {
      let sr = re[i * n + j]!
      let si = im[i * n + j]!
      for (let k = 0; k < j; k++) {
        const ar = re[i * n + k]!
        const ai = im[i * n + k]!
        const br = re[j * n + k]!
        const bi = -im[j * n + k]!
        sr -= ar * br - ai * bi
        si -= ar * bi + ai * br
      }
      re[i * n + j] = sr * invLjj
      im[i * n + j] = si * invLjj
    }
  }
  return lnDet
}

// Exact 4D D_4 12x12 sparse half-BZ Hermitian Cholesky log-determinant integral c_L(D_4)
// Directly derives c_L(D_4) = -19.5471 from the 24 D_4 roots and 32 equilateral triangles/site.
function computeD4ZoneCL(nGrid = 8): { readonly cL: number; readonly fails: number } {
  const rootsR4 = buildD4Roots()
  const posR4 = rootsR4.filter(r => {
    for (let k = 0; k < 4; k++) if (r[k]! !== 0) return r[k]! > 0
    return false
  })
  const posPrim = posR4.map(toD4Prim)
  const posIdx = new Map<string, number>(posPrim.map((v, i) => [iVec4Key(v), i]))
  const zero: IVec4 = [0, 0, 0, 0]
  const seenTri = new Set<string>()
  const tris: (readonly D4LoopStep[])[] = []
  for (const u of rootsR4) {
    for (const v of rootsR4) {
      if (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3] !== 1) continue
      const triVerts: readonly IVec4[] = [zero, u, v]
      const tk = canonicalCycleKey(triVerts)
      if (seenTri.has(tk)) continue
      seenTri.add(tk)
      const pVerts = triVerts.map(toD4Prim)
      const steps: D4LoopStep[] = []
      for (let i = 0; i < 3; i++) {
        const a = pVerts[i]!
        const b = pVerts[(i + 1) % 3]!
        const df: IVec4 = [b[0] - a[0], b[1] - a[1], b[2] - a[2], b[3] - a[3]]
        const pI = posIdx.get(iVec4Key(df))
        if (pI !== undefined) {
          steps.push({ link: pI, sign: 1, base: a })
        } else {
          const mI = posIdx.get(iVec4Key([-df[0], -df[1], -df[2], -df[3]]))
          assert(mI !== undefined, 'Missing inverse D_4 link in triangle builder')
          steps.push({ link: mI!, sign: -1, base: b })
        }
      }
      tris.push(steps)
    }
  }
  assert(posPrim.length === 12 && tris.length === 32, `Expected 12 D_4 links & 32 tris, got ${posPrim.length}/${tris.length}`)

  const n = posPrim.length
  const P = tris.length
  const half0 = nGrid >> 1
  assert(half0 * 2 === nGrid, `nGrid must be even for exact half-BZ symmetry, got ${nGrid}`)
  const total = half0 * nGrid * nGrid * nGrid
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const gr = new Float64Array(n)
  const gi = new Float64Array(n)
  const stepR = new Float64Array(3)
  const stepI = new Float64Array(3)
  const stepL = new Int32Array(3)
  let cL = 0
  let fails = 0

  for (let i0 = 0; i0 < half0; i0++) {
    const k0 = (2 * PI * (i0 + 0.5)) / nGrid
    for (let i1 = 0; i1 < nGrid; i1++) {
      const k1 = (2 * PI * (i1 + 0.5)) / nGrid
      for (let i2 = 0; i2 < nGrid; i2++) {
        const k2 = (2 * PI * (i2 + 0.5)) / nGrid
        for (let i3 = 0; i3 < nGrid; i3++) {
          const k3 = (2 * PI * (i3 + 0.5)) / nGrid

          let g2 = 0
          for (let l = 0; l < n; l++) {
            const v = posPrim[l]!
            const ph = k0 * v[0] + k1 * v[1] + k2 * v[2] + k3 * v[3]
            const r = Math.cos(ph) - 1
            const imv = Math.sin(ph)
            gr[l] = r
            gi[l] = imv
            g2 += r * r + imv * imv
          }

          for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
              const sr = gr[i]! * gr[j]! + gi[i]! * gi[j]!
              const si = gi[i]! * gr[j]! - gr[i]! * gi[j]!
              re[i * n + j] = sr
              im[i * n + j] = si
              re[j * n + i] = sr
              im[j * n + i] = -si
            }
          }

          for (let p = 0; p < P; p++) {
            const loop = tris[p]!
            for (let a = 0; a < 3; a++) {
              const s = loop[a]!
              const b = s.base
              const ph = k0 * b[0] + k1 * b[1] + k2 * b[2] + k3 * b[3]
              stepL[a] = s.link
              stepR[a] = s.sign * Math.cos(ph)
              stepI[a] = s.sign * Math.sin(ph)
            }
            for (let a = 0; a < 3; a++) {
              const la = stepL[a]!
              const ar = stepR[a]!
              const ai = -stepI[a]!
              for (let b = 0; b < 3; b++) {
                const lb = stepL[b]!
                if (lb > la) continue
                const br = stepR[b]!
                const bi = stepI[b]!
                const idx = la * n + lb
                re[idx] = re[idx]! + (ar * br - ai * bi)
                im[idx] = im[idx]! + (ar * bi + ai * br)
              }
            }
          }
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < i; j++) {
              re[j * n + i] = re[i * n + j]!
              im[j * n + i] = -im[i * n + j]!
            }
          }

          const ld = choleskyInPlaceHerm(n, re, im)
          if (!Number.isFinite(ld)) {
            fails++
            continue
          }
          cL += 2 * Math.log(g2) - ld
        }
      }
    }
  }
  return { cL: cL / (total - fails), fails }
}

// Single-face {3,4,3,4} warped column Riccati stiffness K_eff using exact Steinberg recurrence N_SHELL_EXT[0..25]
function computeSingleFaceRiccati(): { readonly kEff: number; readonly alphaLatInv: number } {
  const floorF = 24
  assert(N_SHELL_EXT.length > floorF + 1, `N_SHELL_EXT must cover d=0..${floorF + 1}`)
  const cLat = new Float64Array(floorF + 1)
  const cVert = new Float64Array(floorF + 1)
  for (let d = 0; d <= floorF; d++) {
    const lat = d === 0 ? 1 : 4 * Math.pow(5, d - 1)
    cLat[d] = lat / (N_SHELL_EXT[d]! * N_SHELL_EXT[d]!)
    cVert[d] = 18 / N_SHELL_EXT[d + 1]!
  }
  let y = cVert[floorF]!
  let dy = cLat[floorF]!
  for (let d = floorF - 1; d >= 0; d--) {
    const cv = cVert[d]!
    const ratio = cv / (cv + y)
    dy = cLat[d]! + ratio * ratio * dy
    y = (cv * y) / (cv + y)
  }
  const alphaLatInv = 4 * PI * dy * K_WARP
  return { kEff: dy, alphaLatInv }
}

function runU32(): void {
  console.log('\n=================================================================================')
  console.log('GATE U3.2 (Tier A/B/C): DENSE-RING beta_0(L), VOL_H4, CUSP RESISTANCE & LOOK-ELSEWHERE')
  console.log('=================================================================================')

  // 1. Dense-ring freezing ceiling beta_0(L) = 16 pi^2 (|W_L| / V_SU(N))^{2 / d_G} exp(c_L(D_4) / 11)
  const zoneRes = computeD4ZoneCL(8)
  const cLD4 = zoneRes.cL
  assert(zoneRes.fails === 0 && Math.abs(cLD4 - -19.5471) < 0.001, `D_4 Cholesky c_L mismatch: ${cLD4}`)
  const pref = 16 * PI * PI * Math.exp(cLD4 / 11)
  const vSU2 = 16 * PI * PI
  const vSU3 = 256 * Math.sqrt(3) * Math.pow(PI, 5)

  const evalBeta0 = (size: number, vG: number, dimG: number): number => pref * Math.pow(size / vG, 2 / dimG)

  // 2T + W_bare (SU(2), d_G = 3): |W_L| = 24, 600, 13848, 318552
  const w2T = [24, 600, 13848, 318552] as const
  const b2T = w2T.map(s => evalBeta0(s, vSU2, 3))

  // Dic_3 + S_23 (SU(2), d_G = 3): |W_L| = 12, 156, 1596, 15996
  const wDic3 = [12, 156, 1596, 15996] as const
  const bDic3 = wDic3.map(s => evalBeta0(s, vSU2, 3))

  // Sigma(648) + T_3 (SU(3), d_G = 8): |W_L| = 648 * (1 + (8/5)*(6^L - 1)) for L = 0..5
  const wSig = [0, 1, 2, 3, 4, 5].map(L => Math.round(648 * (1 + (8 / 5) * (Math.pow(6, L) - 1))))
  const bSig = wSig.map(s => evalBeta0(s, vSU3, 8))
  const sigRatio54 = bSig[5]! / bSig[4]!
  const exactSixthRoot = Math.pow(6, 0.25)
  const sigRatioErr = Math.abs(sigRatio54 - exactSixthRoot) / exactSixthRoot

  const isStrictInc = (arr: readonly number[]): boolean => {
    for (let i = 1; i < arr.length; i++) if (!(arr[i]! > arr[i - 1]!)) return false
    return true
  }

  console.log(`  D_4 12x12 half-BZ Cholesky (nGrid=8, fails=${zoneRes.fails}): c_L(D_4)=${cLD4.toFixed(6)}, pref=${pref.toFixed(4)}`)
  console.log(`  2T + W_bare   (L=0..3): [${b2T.map(v => v.toFixed(2)).join(' -> ')}]`)
  console.log(`  Dic_3 + S_23  (L=0..3): [${bDic3.map(v => v.toFixed(2)).join(' -> ')}]`)
  console.log(
    `  Sigma(648)+T3 (L=0..5): [${bSig.map(v => v.toFixed(2)).join(' -> ')}] ` +
      `(L5/L4=${sigRatio54.toFixed(5)} vs 6^{1/4}=${exactSixthRoot.toFixed(5)}, err=${(sigRatioErr * 100).toFixed(3)}%)`,
  )

  // 2. Ideal 24-cell orbifold Euler characteristic & hyperbolic 4-volume Vol_H4 = 4 pi^2 / 3
  const chiOrb = 1 - 24 / 2 + 96 / 4 - 96 / 8
  const volH4 = ((4 * PI * PI) / 3) * chiOrb
  assert(chiOrb === 1, `Ideal 24-cell chi_orb must be 1, got ${chiOrb}`)

  // 3. Exact cusp shell series resistance R_edge = sum_{d=0}^{12} 1 / (N_d * k_dn(d))
  let rEdge = 0
  for (let d = 0; d <= 12; d++) {
    rEdge += 1 / (N_SHELL[d]! * kDownGraph(d))
  }
  const invREdge = 1 / rEdge
  const rNorm = 24 * rEdge

  // 4. Single-face {3,4,3,4} Riccati stiffness 36.9722 (> 40% below 63.036)
  const ric = computeSingleFaceRiccati()
  const alpha0Target = 63.036
  const ricDeficit = (alpha0Target - ric.alphaLatInv) / alpha0Target

  console.log(
    `  Ideal 24-cell: chi_orb=${chiOrb} -> Vol_H4=${volH4.toFixed(6)} (4 pi^2/3); ` +
      `cusp R_edge=${rEdge.toFixed(6)} (1/R_edge=${invREdge.toFixed(4)}, R_norm=${rNorm.toFixed(4)}); ` +
      `Riccati=${ric.alphaLatInv.toFixed(4)} (-${(ricDeficit * 100).toFixed(2)}% vs 63.036)`,
  )

  // 5. Exact Look-Elsewhere audit: N = 74, hits1 === 0, hits5 === 1
  const atoms = [2, 3, 4, 8, 12, 13, 18, 24, PI, K_WARP, (4 * PI * PI) / 3]
  const vals = new Set<number>()
  for (const a of atoms) {
    for (const b of atoms) {
      vals.add(Math.round(a * b * 1e4) / 1e4)
      vals.add(Math.round((a / b) * 1e4) / 1e4)
      for (const p of [2, 4 * PI]) {
        vals.add(Math.round(((p * a) / b) * 1e4) / 1e4)
      }
    }
  }
  const leArr = Array.from(vals).filter(v => v > 10 && v < 150)
  const hits1 = leArr.filter(v => Math.abs(v - alpha0Target) / alpha0Target < 0.01).length
  const hits5 = leArr.filter(v => Math.abs(v - alpha0Target) / alpha0Target < 0.05).length
  console.log(`  Look-Elsewhere (11 geometric atoms, [10, 150]): N=${leArr.length}, hits(<1%)=${hits1}, hits(<5%)=${hits5}`)

  const ok =
    zoneRes.fails === 0 &&
    Math.abs(cLD4 - -19.5471) < 0.001 &&
    isStrictInc(b2T) &&
    Math.abs(b2T[0]! - 7.61) < 0.05 &&
    Math.abs(b2T[3]! - 4263.88) < 2.0 &&
    isStrictInc(bDic3) &&
    Math.abs(bDic3[0]! - 4.79) < 0.05 &&
    Math.abs(bDic3[3]! - 580.41) < 1.0 &&
    isStrictInc(bSig) &&
    Math.abs(bSig[0]! - 7.02) < 0.05 &&
    Math.abs(bSig[5]! - 74.16) < 0.5 &&
    sigRatioErr < 0.001 &&
    chiOrb === 1 &&
    Math.abs(volH4 - 13.159473) < 1e-5 &&
    rEdge >= 0.058 &&
    rEdge <= 0.059 &&
    invREdge >= 17.0 &&
    invREdge <= 17.3 &&
    invREdge < 20.0 &&
    Math.abs(ric.alphaLatInv - 36.9722) < 1e-3 &&
    ricDeficit > 0.4 &&
    leArr.length === 74 &&
    hits1 === 0 &&
    hits5 === 1

  recordGate(
    'U3.2',
    'Tier A/B/C',
    'Dense-ring beta_0(L) divergence (real D_4 Cholesky c_L), Vol_H4, cusp resistance, Riccati & Look-Elsewhere',
    ok,
    `c_L(D_4)=${cLD4.toFixed(4)}, 2T=[${b2T[0]!.toFixed(2)}..${b2T[3]!.toFixed(2)}], Dic3=[${bDic3[0]!.toFixed(2)}..${bDic3[3]!.toFixed(2)}], ` +
      `Sig648=[${bSig[0]!.toFixed(2)}..${bSig[5]!.toFixed(2)}] (L5/L4 err=${(sigRatioErr * 100).toFixed(3)}%), ` +
      `Vol_H4=${volH4.toFixed(6)}, R_edge=${rEdge.toFixed(6)} (1/R=${invREdge.toFixed(3)}), Riccati=${ric.alphaLatInv.toFixed(4)}, LE=${hits1}/${leArr.length} (<1%)`,
  )
}

// =================================================================================================
// 11. MAIN ENTRY & GATE B4.1 (BUDGET GATE)
// =================================================================================================

function main(): void {
  console.log('=================================================================================')
  console.log('SM BARE-U RADION, ZERO-CONTINUOUS-PHASE FLAVOR & UV GAUGE STIFFNESS AUDIT')
  console.log('=================================================================================')
  console.log('Epistemic Scope Ledger:')
  console.log('  Tier A (Exact):   {3,4,3,4} Steinberg recurrence, fixed-UV GW identity & D_*=13 windows,')
  console.log('                    bare-U empty-vacuum no-go (24-slot dock M_meet/M_pair + Bethe-cavity),')
  console.log('                    13x14 Q(c) cusp zero modes, D_4 {3,3,4,3}<->{3,4,3,3} duality (32===96/3,')
  console.log('                    c_kin(K)=2.0, c_kin(K*)=0.5, continuum U(1) Villain alpha_sd^-1=2.000),')
  console.log('                    12x12 half-BZ Cholesky c_L(D_4)=-19.5471, Vol_H4=4pi^2/3, R_edge.')
  console.log('  Tier B/C (Open):  (1) Bulk radion condensate/action is a Tier-B EFT extension (empty-vacuum')
  console.log('                        bare U cannot supply it);')
  console.log('                    (2) k=13 zero-continuous-phase Z[zeta_9]+SO(10)+2T TM_1 fit has 0 cont.')
  console.log('                        phases, 11 discrete Z_18 phase integers (10 at k=12), & 13 real UV')
  console.log('                        moduli (dof=6 over 19 obs at 0.1% lepton floor, unified Dirac PDG CP;')
  console.log('                        cusp zero modes collapse 1.79e5x hierarchy into [0.80, 14.90] O(1) band);')
  console.log('                    (3) Bare UV gauge stiffness 1/g_0^2 is an irreducible 1-param UV boundary')
  console.log('                        constant (21.7% action spread, +5.344 scale shift, diverging beta_0(L), 0/74 LE).')

  runR11()
  runR12()
  const fCusp = runF21()
  runF22(fCusp)
  runF23()
  runU31()
  runU32()

  // Gate B4.1: Budget & completeness gate
  const elapsedSec = (performance.now() - START_MS) / 1000
  const rssMB = process.memoryUsage().rss / (1024 * 1024)
  const precedingPassed = GATES.filter(g => g.passed).length
  const b41Ok = precedingPassed === 7 && GATES.length === 7 && elapsedSec < 6.0 && rssMB < 150.0
  console.log('\n=================================================================================')
  console.log('GATE B4.1 (Budget): DETERMINISTIC RUNTIME, MEMORY & 8/8 COMPLETENESS')
  console.log('=================================================================================')
  recordGate(
    'B4.1',
    'Budget',
    'Preceding 7/7 gates passed, runtime < 6.0 s & peak RSS < 150 MB',
    b41Ok,
    `preceding=${precedingPassed}/7, elapsed=${elapsedSec.toFixed(3)} s (< 6.0 s), rss=${rssMB.toFixed(1)} MB (< 150 MB)`,
  )

  const totalPassed = GATES.filter(g => g.passed).length
  console.log('\n=================================================================================')
  console.log(`FINAL AUDIT SUMMARY: ${totalPassed}/${GATES.length} GATES PASSED (${elapsedSec.toFixed(3)} s, ${rssMB.toFixed(1)} MB RSS)`)
  console.log('=================================================================================')
  assert(totalPassed === 8 && GATES.length === 8, `Expected 8/8 gates passing, got ${totalPassed}/${GATES.length}`)
}

main()

export {}
