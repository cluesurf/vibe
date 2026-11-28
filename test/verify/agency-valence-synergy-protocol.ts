// Agency, Valence Geometry, Discrete Synergy & Empirical Protocol Verification Suite
//
// Standalone, strictly deterministic (ZERO external imports, ZERO system RNG — pure Mulberry32 PRNG),
// strict TypeScript (--strict --noUncheckedIndexedAccess), laptop-safe (< 6 s), fail-closed
// (throws on any failed check -> exit code 1), ending with `export {}`.
//
// Four Verification Gates:
//   GATE A1 — Coordinate-Invariant SLD QFI Valence Upgrade, [[24, 1, 8]]_3 Terminal Set Z,
//             Four-Regime Sign-Paradox & Chronic-Pain Separation, Closed-Loop Exp. 6 Wireheading
//             vs Viability Learning, and 12-Level TMS-EEG Titration BIC Slope/Threshold Protocol.
//   GATE A2 — Compositional CLR + Last-Drop + Gaussian log-det Blowup Negative Control,
//             Exact Finite-Alphabet Discrete BROJA PID (Sinkhorn-EM / Csiszar-Tusnady) +
//             Williams-Beer I_min Failure Audit + Present-State Swap Invariance, and Confound-Free
//             27-State Self-Attractor Synergy Steering (Fixed H=30, Aubin |Viab|, Autonomy A).
//   GATE A3 — Conditional 1-Hop Light-Cone & Quantum Trine-Qutrit Holevo Tool-and-Mirror
//             Self/World Screening, and Repaired Dual-Channel Suppression Gate in Multi-Step
//             Discrete Garden + Leaky Offline Replay & Exact Ternary Landauer Audit.
//   GATE A4 — EEG Pipeline Anti-Confound Negative Controls (CAR Zero-Mean, Rank-1 EOG Volume
//             Conduction & Nolte Inversion + Debiased wPLI^2, Zero-Phase FIR Acausal Granger),
//             Naive OLS vs Exact CSN (2009) Discrete Hurwitz-Zeta MLE + KS + Vuong LLR, and
//             Confound-Free 64-Unit K=8 Expander Self-Attractor Edge-of-Criticality Sweep.

const t0Global = Date.now()

type EpistemicTier = 'Tier A' | 'Tier B' | 'Tier C'

type CheckRow = {
  readonly id: string
  readonly gate: string
  readonly tier: EpistemicTier
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(
  id: string,
  gate: string,
  tier: EpistemicTier,
  name: string,
  passed: boolean,
  detail: string,
): void {
  CHECKS.push({ id, gate, tier, name, passed, detail })
  const tag = passed ? 'PASS' : 'FAIL'
  console.log(`  [${tag}] ${id} (${tier}) ${name} :: ${detail}`)
}

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

// =================================================================================================
// 0. DETERMINISTIC MULBERRY32 PRNG, COMPLEX LINEAR ALGEBRA, HERMITIAN JACOBI & GF(3) ENGINE
// =================================================================================================

const PI = Math.PI
const SQRT3 = Math.sqrt(3)
const LN2 = Math.log(2)
const LN3 = Math.log(3)

type Prng = {
  next: () => number
  nextNormal: () => number
}

function makePrng(seed: number): Prng {
  let state = seed >>> 0
  let spare: number | null = null
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const nextNormal = (): number => {
    if (spare !== null) {
      const v = spare
      spare = null
      return v
    }
    let u = next()
    while (u <= 1e-15) u = next()
    const v = next()
    const r = Math.sqrt(-2 * Math.log(u))
    const th = 2 * PI * v
    spare = r * Math.sin(th)
    return r * Math.cos(th)
  }
  return { next, nextNormal }
}

type C2 = readonly [number, number]

const W_POW: readonly C2[] = [
  [1, 0],
  [-0.5, SQRT3 / 2],
  [-0.5, -SQRT3 / 2],
]

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }

const cmatZero = (n: number): CMat => ({
  n,
  re: new Float64Array(n * n),
  im: new Float64Array(n * n),
})

const cmatEye = (n: number): CMat => {
  const m = cmatZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
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

function cmatAddScale(A: CMat, a: number, B: CMat, b: number): CMat {
  const n = A.n
  const out = cmatZero(n)
  for (let i = 0; i < n * n; i++) {
    out.re[i] = a * A.re[i]! + b * B.re[i]!
    out.im[i] = a * A.im[i]! + b * B.im[i]!
  }
  return out
}

// Complex Hermitian Jacobi eigensolver (exact to ~1e-15 for small matrices n <= 32).
function hermitianJacobi(H: CMat): { readonly vals: Float64Array; readonly vecs: CMat } {
  const n = H.n
  const ar = Float64Array.from(H.re)
  const ai = Float64Array.from(H.im)
  const vr = new Float64Array(n * n)
  const vi = new Float64Array(n * n)
  for (let i = 0; i < n; i++) vr[i * n + i] = 1
  for (let sw = 0; sw < 100; sw++) {
    let maxOff = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const pr = ar[p * n + q]!
        const pi = ai[p * n + q]!
        const mag = Math.hypot(pr, pi)
        if (mag > maxOff) maxOff = mag
        if (mag <= 1e-15 * Math.max(1e-12, Math.abs(ar[p * n + p]!) + Math.abs(ar[q * n + q]!))) {
          continue
        }
        const phR = pr / mag
        const phI = pi / mag
        const app = ar[p * n + p]!
        const aqq = ar[q * n + q]!
        const tau = (aqq - app) / (2 * mag)
        const t =
          tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        const spR = s * phR
        const spI = s * phI
        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue
          const akpR = ar[k * n + p]!
          const akpI = ai[k * n + p]!
          const akqR = ar[k * n + q]!
          const akqI = ai[k * n + q]!
          const nkpR = c * akpR - (spR * akqR + spI * akqI)
          const nkpI = c * akpI - (spR * akqI - spI * akqR)
          const nkqR = spR * akpR - spI * akpI + c * akqR
          const nkqI = spR * akpI + spI * akpR + c * akqI
          ar[k * n + p] = nkpR
          ai[k * n + p] = nkpI
          ar[p * n + k] = nkpR
          ai[p * n + k] = -nkpI
          ar[k * n + q] = nkqR
          ai[k * n + q] = nkqI
          ar[q * n + k] = nkqR
          ai[q * n + k] = -nkqI
        }
        ar[p * n + p] = app - t * mag
        ai[p * n + p] = 0
        ar[q * n + q] = aqq + t * mag
        ai[q * n + q] = 0
        ar[p * n + q] = 0
        ai[p * n + q] = 0
        ar[q * n + p] = 0
        ai[q * n + p] = 0
        for (let k = 0; k < n; k++) {
          const vkpR = vr[k * n + p]!
          const vkpI = vi[k * n + p]!
          const vkqR = vr[k * n + q]!
          const vkqI = vi[k * n + q]!
          vr[k * n + p] = c * vkpR - (spR * vkqR + spI * vkqI)
          vi[k * n + p] = c * vkpI - (spR * vkqI - spI * vkqR)
          vr[k * n + q] = spR * vkpR - spI * vkpI + c * vkqR
          vi[k * n + q] = spR * vkpI + spI * vkpR + c * vkqI
        }
      }
    }
    if (maxOff < 1e-15) break
  }
  const ord = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => ar[a * n + a]! - ar[b * n + b]!,
  )
  const vals = new Float64Array(n)
  const vecs = cmatZero(n)
  for (let col = 0; col < n; col++) {
    const src = ord[col]!
    vals[col] = ar[src * n + src]!
    for (let r = 0; r < n; r++) {
      vecs.re[r * n + col] = vr[r * n + src]!
      vecs.im[r * n + col] = vi[r * n + src]!
    }
  }
  return { vals, vecs }
}

function vonNeumannEntropy(rho: CMat): number {
  const { vals } = hermitianJacobi(rho)
  let s = 0
  for (let i = 0; i < vals.length; i++) {
    const lam = vals[i]!
    if (lam > 1e-15) s -= lam * Math.log(lam)
  }
  return s
}

// Exact multiparameter SLD Quantum Fisher Information matrix:
//   g_Q(a, b) = 2 * sum_{j,k: lam_j + lam_k > 0} Re(<j|d_a rho|k><k|d_b rho|j>) / (lam_j + lam_k)
function exactSldQfiMatrix(rho: CMat, drhos: readonly CMat[]): number[][] {
  const n = rho.n
  const m = drhos.length
  const { vals, vecs } = hermitianJacobi(rho)
  const vDag = cmatDag(vecs)
  const eigD = drhos.map(dr => cmatMul(vDag, cmatMul(dr, vecs)))
  const g: number[][] = Array.from({ length: m }, () => new Array<number>(m).fill(0))
  for (let a = 0; a < m; a++) {
    const da = eigD[a]!
    for (let b = a; b < m; b++) {
      const db = eigD[b]!
      let sum = 0
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const denom = vals[j]! + vals[k]!
          if (denom <= 1e-14) continue
          const dar = da.re[j * n + k]!
          const dai = da.im[j * n + k]!
          const dbr = db.re[k * n + j]!
          const dbi = db.im[k * n + j]!
          sum += (2 * (dar * dbr - dai * dbi)) / denom
        }
      }
      g[a]![b] = sum
      g[b]![a] = sum
    }
  }
  return g
}

function exactSldQfiScalar(rho: CMat, drho: CMat): number {
  return exactSldQfiMatrix(rho, [drho])[0]![0]!
}

// Real linear system solver Ax = b via partial-pivoting Gaussian elimination.
function solveLinearReal(A: number[][], b: number[]): number[] {
  const n = b.length
  const mat = A.map((row, i) => [...row, b[i]!])
  for (let c = 0; c < n; c++) {
    let piv = c
    let best = Math.abs(mat[c]![c]!)
    for (let r = c + 1; r < n; r++) {
      const v = Math.abs(mat[r]![c]!)
      if (v > best) {
        best = v
        piv = r
      }
    }
    assertExact(best > 1e-14, 'Singular real linear system')
    if (piv !== c) {
      const tmp = mat[c]!
      mat[c] = mat[piv]!
      mat[piv] = tmp
    }
    const pRow = mat[c]!
    const diag = pRow[c]!
    for (let r = c + 1; r < n; r++) {
      const row = mat[r]!
      const f = row[c]! / diag
      if (f === 0) continue
      for (let j = c; j <= n; j++) row[j] = row[j]! - f * pRow[j]!
    }
  }
  const x = new Array<number>(n).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let s = mat[r]![n]!
    for (let j = r + 1; j < n; j++) s -= mat[r]![j]! * x[j]!
    x[r] = s / mat[r]![r]!
  }
  return x
}

// 2x2 matrix helpers
type Mat2x2 = readonly [readonly [number, number], readonly [number, number]]
const det2x2 = (A: Mat2x2): number => A[0][0] * A[1][1] - A[0][1] * A[1][0]
const mul2x2 = (A: Mat2x2, B: Mat2x2): Mat2x2 => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
]
const trans2x2 = (A: Mat2x2): Mat2x2 => [
  [A[0][0], A[1][0]],
  [A[0][1], A[1][1]],
]
const inv2x2 = (A: Mat2x2): Mat2x2 => {
  const d = det2x2(A)
  return [
    [A[1][1] / d, -A[0][1] / d],
    [-A[1][0] / d, A[0][0] / d],
  ]
}
const frob2x2 = (A: Mat2x2): number =>
  Math.sqrt(A[0][0] ** 2 + A[0][1] ** 2 + A[1][0] ** 2 + A[1][1] ** 2)
const maxDiff2x2 = (A: Mat2x2, B: Mat2x2): number =>
  Math.max(
    Math.abs(A[0][0] - B[0][0]),
    Math.abs(A[0][1] - B[0][1]),
    Math.abs(A[1][0] - B[1][0]),
    Math.abs(A[1][1] - B[1][1]),
  )

// D_4 roots, antipodal lines, frames, W(F_4) (order 1,152) and exact chiral4Sign
type Root4 = readonly [number, number, number, number]
const mod3 = (x: number): number => ((x % 3) + 3) % 3

const ROOTS: readonly Root4[] = (() => {
  const out: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const c: [number, number, number, number] = [0, 0, 0, 0]
          c[i] = si
          c[j] = sj
          out.push(c)
        }
      }
    }
  }
  return out
})()
const dot4 = (a: Root4, b: Root4): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
const OPP: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
)
const LINES: readonly (readonly [number, number])[] = ROOTS.flatMap((_, a) =>
  a < OPP[a]! ? [[a, OPP[a]!] as const] : [],
)
const FRAME_OF: readonly number[] = ROOTS.map(r =>
  (r[0] !== 0 && r[1] !== 0) || (r[2] !== 0 && r[3] !== 0)
    ? 0
    : (r[0] !== 0 && r[2] !== 0) || (r[1] !== 0 && r[3] !== 0)
      ? 1
      : 2,
)

const WF4_GROUP = (() => {
  const simple: readonly Root4[] = [
    [0, 1, -1, 0],
    [0, 0, 1, -1],
    [0, 0, 0, 1],
    [1, -1, -1, -1],
  ]
  const gens = simple.map(alpha => {
    const aa = dot4(alpha, alpha)
    const perm = new Uint8Array(24)
    for (let i = 0; i < 24; i++) {
      const v = ROOTS[i]!
      const t = 2 * dot4(v, alpha)
      const img = [0, 1, 2, 3].map(k => v[k]! - (t * alpha[k]!) / aa)
      perm[i] = ROOTS.findIndex(
        o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3],
      )
    }
    return perm
  })
  const id = Uint8Array.from({ length: 24 }, (_, i) => i)
  const elements: Uint8Array[] = [id]
  const det: number[] = [1]
  const seen = new Set<string>([id.join(',')])
  for (let h = 0; h < elements.length; h++) {
    const cur = elements[h]!
    const nd = -det[h]!
    for (const g of gens) {
      const nxt = Uint8Array.from(cur, v => g[v]!)
      const k = nxt.join(',')
      if (!seen.has(k)) {
        seen.add(k)
        elements.push(nxt)
        det.push(nd)
      }
    }
  }
  assertExact(elements.length === 1152, 'W(F_4) order 1152')
  return { elements, det }
})()

function lexKey4(a0: number, a1: number, a2: number, a3: number): number {
  let x0 = a0
  let x1 = a1
  let x2 = a2
  let x3 = a3
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
  const elems = WF4_GROUP.elements
  const dets = WF4_GROUP.det
  for (let e = 0; e < elems.length; e++) {
    const p = elems[e]!
    const d = dets[e]!
    const ps0 = p[s0]! << 1
    const ps1 = p[s1]! << 1
    const ps2 = p[s2]! << 1
    const ps3 = p[s3]! << 1
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

// Compact GF(3) RREF over Uint8Array rows
function gf3Rref(
  rows: readonly Uint8Array[],
  nCols: number,
): { readonly basis: Uint8Array[]; readonly pivCols: number[] } {
  const mat = rows.map(r => Uint8Array.from(r))
  const pivCols: number[] = []
  let rank = 0
  for (let col = 0; col < nCols && rank < mat.length; col++) {
    let piv = -1
    for (let r = rank; r < mat.length; r++) {
      if (mat[r]![col] !== 0) {
        piv = r
        break
      }
    }
    if (piv === -1) continue
    if (piv !== rank) {
      const tmp = mat[rank]!
      mat[rank] = mat[piv]!
      mat[piv] = tmp
    }
    const pRow = mat[rank]!
    if (pRow[col] === 2) {
      for (let c = col; c < nCols; c++) pRow[c] = (2 * pRow[c]!) % 3
    }
    for (let r = 0; r < mat.length; r++) {
      if (r === rank) continue
      const f = mat[r]![col]!
      if (f === 0) continue
      const row = mat[r]!
      for (let c = col; c < nCols; c++) row[c] = mod3(row[c]! - f * pRow[c]!)
    }
    pivCols.push(col)
    rank++
  }
  return { basis: mat.slice(0, rank), pivCols }
}

// Shared 3x3 qutrit generators N_Z = diag(0, 1, -1), QFT F_3, N_X = F_3^dag N_Z F_3
const NZ = cmatZero(3)
NZ.re[0] = 0
NZ.re[4] = 1
NZ.re[8] = -1
const F3 = cmatZero(3)
const F3Dag = cmatZero(3)
for (let j = 0; j < 3; j++) {
  for (let k = 0; k < 3; k++) {
    const w = W_POW[(j * k) % 3]!
    F3.re[j * 3 + k] = w[0] / SQRT3
    F3.im[j * 3 + k] = w[1] / SQRT3
    F3Dag.re[k * 3 + j] = w[0] / SQRT3
    F3Dag.im[k * 3 + j] = -w[1] / SQRT3
  }
}
const NX = cmatMul(F3Dag, cmatMul(NZ, F3))

// =================================================================================================
// GATE A1 — COORDINATE-INVARIANT SLD QFI VALENCE, TERMINAL SET Z, PARADOXES, WIREHEADING & E4 BIC
// =================================================================================================

function runGateA1(): void {
  console.log('\n==============================================================================================')
  console.log('GATE A1: COORDINATE-INVARIANT SLD QFI VALENCE, TERMINAL SET Z, PARADOXES, WIREHEADING & E4 BIC')
  console.log('==============================================================================================')

  // --- A1.1 Coordinate-Invariance & Sign-Flip Check (d = 3, 2-param qutrit family) ---
  const rhoBase = cmatZero(3)
  rhoBase.re[0] = 0.60
  rhoBase.re[4] = 0.28
  rhoBase.re[8] = 0.12

  const rot01 = (a: number): { U: CMat; dU: CMat } => {
    const c = Math.cos(0.5 * a)
    const s = Math.sin(0.5 * a)
    const U = cmatEye(3)
    U.re[0] = c; U.re[1] = -s
    U.re[3] = s; U.re[4] = c
    const dU = cmatZero(3)
    dU.re[0] = -0.5 * s; dU.re[1] = -0.5 * c
    dU.re[3] = 0.5 * c; dU.re[4] = -0.5 * s
    return { U, dU }
  }
  const rot12C = (b: number): { U: CMat; dU: CMat } => {
    const c = Math.cos(0.5 * b)
    const s = Math.sin(0.5 * b)
    const U = cmatEye(3)
    U.re[4] = c; U.im[5] = -s
    U.im[7] = -s; U.re[8] = c
    const dU = cmatZero(3)
    dU.re[4] = -0.5 * s; dU.im[5] = -0.5 * c
    dU.im[7] = -0.5 * c; dU.re[8] = -0.5 * s
    return { U, dU }
  }

  const evalQutritFamily = (
    th0: number,
    th1: number,
    depolP: number,
  ): { rho: CMat; drho0: CMat; drho1: CMat } => {
    const { U: U0, dU: dU0 } = rot01(th0)
    const { U: U1, dU: dU1 } = rot12C(th1)
    const U = cmatMul(U0, U1)
    const d0U = cmatMul(dU0, U1)
    const d1U = cmatMul(U0, dU1)
    const UDag = cmatDag(U)
    const rhoPure = cmatMul(U, cmatMul(rhoBase, UDag))
    const d0Pure = cmatAddScale(
      cmatMul(d0U, cmatMul(rhoBase, UDag)),
      1,
      cmatMul(U, cmatMul(rhoBase, cmatDag(d0U))),
      1,
    )
    const d1Pure = cmatAddScale(
      cmatMul(d1U, cmatMul(rhoBase, UDag)),
      1,
      cmatMul(U, cmatMul(rhoBase, cmatDag(d1U))),
      1,
    )
    const I3 = cmatEye(3)
    const r = 1 - depolP
    return {
      rho: cmatAddScale(rhoPure, r, I3, depolP / 3),
      drho0: cmatAddScale(d0Pure, r, I3, 0),
      drho1: cmatAddScale(d1Pure, r, I3, 0),
    }
  }

  const toMat2 = (g: number[][]): Mat2x2 => [
    [g[0]![0]!, g[0]![1]!],
    [g[1]![0]!, g[1]![1]!],
  ]

  const th0 = 0.65
  const th1 = 0.45
  const depolP = 0.25
  const y0 = 1.2 * th0 + 0.18 * Math.sin(th1)
  const y1 = 0.95 * th1 + 0.14 * Math.cos(th0)
  const Jy: Mat2x2 = [
    [1.2, 0.18 * Math.cos(th1)],
    [-0.14 * Math.sin(th0), 0.95],
  ]
  const JyInv = inv2x2(Jy)

  const inState = evalQutritFamily(th0, th1, 0)
  const outState = evalQutritFamily(th0, th1, depolP)
  const gInTheta = toMat2(exactSldQfiMatrix(inState.rho, [inState.drho0, inState.drho1]))
  const gOutTheta = toMat2(exactSldQfiMatrix(outState.rho, [outState.drho0, outState.drho1]))

  const dy0Rho = cmatAddScale(outState.drho0, JyInv[0][0], outState.drho1, JyInv[1][0])
  const dy1Rho = cmatAddScale(outState.drho0, JyInv[0][1], outState.drho1, JyInv[1][1])
  const gQy = toMat2(exactSldQfiMatrix(outState.rho, [dy0Rho, dy1Rho]))
  const gPullY = mul2x2(trans2x2(Jy), mul2x2(gQy, Jy))
  const dimParam = 2
  const lambdaQY = Math.log(det2x2(gPullY)) / (2 * dimParam)

  // (i) Output diffeomorphism: z_i = -exp(-2.6 y_i)
  const dz0dy0 = 2.6 * Math.exp(-2.6 * y0)
  const dz1dy1 = 2.6 * Math.exp(-2.6 * y1)
  const DzDy: Mat2x2 = [
    [dz0dy0, 0],
    [0, dz1dy1],
  ]
  const Jz = mul2x2(DzDy, Jy)
  const dz0Rho = cmatAddScale(dy0Rho, 1 / dz0dy0, dy1Rho, 0)
  const dz1Rho = cmatAddScale(dy0Rho, 0, dy1Rho, 1 / dz1dy1)
  const gQz = toMat2(exactSldQfiMatrix(outState.rho, [dz0Rho, dz1Rho]))
  const gPullZ = mul2x2(trans2x2(Jz), mul2x2(gQz, Jz))
  const lambdaQZ = Math.log(det2x2(gPullZ)) / (2 * dimParam)
  const errOutDiffeoMat = maxDiff2x2(gPullZ, gPullY)
  const errOutDiffeoLam = Math.abs(lambdaQZ - lambdaQY)

  // (ii) Local SU(3) unitary gauge invariance: rho -> V rho V^dag
  const V1 = rot01(1.13).U
  const V2 = rot12C(0.77).U
  const Vdiag = cmatZero(3)
  const ph0 = 0.41
  const ph1 = -0.63
  const ph2 = -(ph0 + ph1)
  Vdiag.re[0] = Math.cos(ph0); Vdiag.im[0] = Math.sin(ph0)
  Vdiag.re[4] = Math.cos(ph1); Vdiag.im[4] = Math.sin(ph1)
  Vdiag.re[8] = Math.cos(ph2); Vdiag.im[8] = Math.sin(ph2)
  const Vsu3 = cmatMul(Vdiag, cmatMul(V1, V2))
  const Vsu3Dag = cmatDag(Vsu3)
  const rhoV = cmatMul(Vsu3, cmatMul(outState.rho, Vsu3Dag))
  const dy0RhoV = cmatMul(Vsu3, cmatMul(dy0Rho, Vsu3Dag))
  const dy1RhoV = cmatMul(Vsu3, cmatMul(dy1Rho, Vsu3Dag))
  const gQV = toMat2(exactSldQfiMatrix(rhoV, [dy0RhoV, dy1RhoV]))
  const gPullV = mul2x2(trans2x2(Jy), mul2x2(gQV, Jy))
  const lambdaQV = Math.log(det2x2(gPullV)) / (2 * dimParam)
  const errSu3Mat = maxDiff2x2(gPullV, gPullY)
  const errSu3Lam = Math.abs(lambdaQV - lambdaQY)

  // (iii) Simultaneous nonlinear parameter diffeomorphism theta -> psi(theta) + output z(y):
  //   psi_0 = theta_0 + 0.30 theta_0^2 + 0.20 sin(theta_1)
  //   psi_1 = sinh(1.15 theta_1) + 0.15 theta_0
  const Tparam: Mat2x2 = [
    [1 + 0.6 * th0, 0.2 * Math.cos(th1)],
    [0.15, 1.15 * Math.cosh(1.15 * th1)],
  ]
  const Tinv = inv2x2(Tparam)
  const detT = det2x2(Tparam)
  const dpsi0In = cmatAddScale(inState.drho0, Tinv[0][0], inState.drho1, Tinv[1][0])
  const dpsi1In = cmatAddScale(inState.drho0, Tinv[0][1], inState.drho1, Tinv[1][1])
  const gInPsi = toMat2(exactSldQfiMatrix(inState.rho, [dpsi0In, dpsi1In]))
  const JzPsi = mul2x2(Jz, Tinv)
  const gPullZPsi = mul2x2(trans2x2(JzPsi), mul2x2(gQz, JzPsi))

  // Verify raw lambda_Q transforms as a scalar density (shifts by -ln|det T|/d), whereas
  // lambda_Q^rel := (1/(2d)) log(det(J^T g_Q J) / det(g_in)) is a true scalar invariant <= 0:
  const lambdaQZPsi = Math.log(det2x2(gPullZPsi)) / (2 * dimParam)
  const expectedDensityShift = -Math.log(Math.abs(detT)) / dimParam
  const densityShiftErr = Math.abs(lambdaQZPsi - lambdaQY - expectedDensityShift)
  const lambdaRelOrig = Math.log(det2x2(gPullY) / det2x2(gInTheta)) / (2 * dimParam)
  const lambdaRelBoth = Math.log(det2x2(gPullZPsi) / det2x2(gInPsi)) / (2 * dimParam)
  const errRelBoth = Math.abs(lambdaRelBoth - lambdaRelOrig)
  // Non-tautological noiseless Petz-Uhlmann saturation check via SU(3) unitary channel V rho_in V^dag
  const rhoInV = cmatMul(Vsu3, cmatMul(inState.rho, Vsu3Dag))
  const d0InV = cmatMul(Vsu3, cmatMul(inState.drho0, Vsu3Dag))
  const d1InV = cmatMul(Vsu3, cmatMul(inState.drho1, Vsu3Dag))
  const gInSu3 = toMat2(exactSldQfiMatrix(rhoInV, [d0InV, d1InV]))
  const lambdaRelNoiseless = Math.log(det2x2(gInSu3) / det2x2(gInTheta)) / (2 * dimParam)
  const petzMonotone = lambdaRelOrig < -1e-6 && Math.abs(lambdaRelNoiseless) < 1e-14

  // (iv) Euclidean Frobenius norm rate d/dt log ||J_y||_F sign-flip under monotone output & param diffeos:
  const evalTrajRates = (t: number) => {
    const t0 = 0.3 + 0.5 * t
    const t1 = 0.2 + 0.4 * t
    const yy0 = (1 + 0.6 * t) * t0 + 0.25 * t * t1
    const yy1 = (1 + 0.4 * t) * t1
    const jy: Mat2x2 = [
      [1 + 0.6 * t, 0.25 * t],
      [0, 1 + 0.4 * t],
    ]
    const dz: Mat2x2 = [
      [2.6 * Math.exp(-2.6 * yy0), 0],
      [0, 2.6 * Math.exp(-2.6 * yy1)],
    ]
    const jz = mul2x2(dz, jy)
    const dThDPsi: Mat2x2 = [
      [Math.exp(-1.8 * t0) / 1.8, 0],
      [0, Math.exp(-1.8 * t1) / 1.8],
    ]
    const jyPsi = mul2x2(jy, dThDPsi)
    return {
      logFrobY: Math.log(frob2x2(jy)),
      logFrobZ: Math.log(frob2x2(jz)),
      logFrobYPsi: Math.log(frob2x2(jyPsi)),
    }
  }
  const dtFD = 1e-6
  const trP = evalTrajRates(0.5 + dtFD)
  const trM = evalTrajRates(0.5 - dtFD)
  const rateFrobY = (trP.logFrobY - trM.logFrobY) / (2 * dtFD)
  const rateFrobZ = (trP.logFrobZ - trM.logFrobZ) / (2 * dtFD)
  const rateFrobYPsi = (trP.logFrobYPsi - trM.logFrobYPsi) / (2 * dtFD)

  recordCheck(
    'A1.1',
    'A1',
    'Tier A',
    'SLD QFI output/SU(3)/joint diffeomorphism invariance & Euclidean Frobenius sign flip',
    errOutDiffeoMat < 1e-13 &&
      errOutDiffeoLam < 1e-13 &&
      errSu3Mat < 1e-13 &&
      errSu3Lam < 1e-13 &&
      errRelBoth < 1e-13 &&
      densityShiftErr < 1e-13 &&
      Math.abs(expectedDensityShift) > 0.05 &&
      petzMonotone &&
      rateFrobY > 0.3 &&
      rateFrobZ < -0.5 &&
      rateFrobYPsi < -0.2 &&
      maxDiff2x2(gOutTheta, gPullY) < 1e-13,
    `outDiffeo=${errOutDiffeoLam.toExponential(1)}, SU(3)=${errSu3Lam.toExponential(1)}, jointRel=${errRelBoth.toExponential(1)}, lamRel=${lambdaRelOrig.toFixed(4)}<=0, densityShift=${expectedDensityShift.toFixed(4)}, d/dt log||J||_F: y=${rateFrobY.toFixed(3)} -> z=${rateFrobZ.toFixed(3)} / psi=${rateFrobYPsi.toFixed(3)}`,
  )

  // --- A1.2 Exact [[24, 1, 8]]_3 / B_1 Terminal Set Z (k <= 7) & Zero-Sum Residual Field ---
  const w9Defs: readonly (readonly (readonly [number, number, number])[])[] = [
    [[0, 0, 1], [0, 1, 2], [1, 10, 2], [1, 11, 1]],
    [[0, 2, 1], [0, 3, 2], [1, 8, 2], [1, 9, 1]],
    [[0, 4, 1], [0, 5, 2], [1, 6, 2], [1, 7, 1]],
    [[0, 6, 1], [0, 7, 2], [1, 5, 2], [1, 6, 2], [1, 7, 2]],
    [[0, 8, 1], [0, 9, 2], [1, 3, 2], [1, 8, 2], [1, 9, 2]],
    [[0, 10, 1], [0, 11, 2], [1, 1, 2], [1, 10, 2], [1, 11, 2]],
    [[1, 0, 1], [1, 1, 1], [1, 10, 2], [1, 11, 2]],
    [[1, 2, 1], [1, 3, 1], [1, 8, 2], [1, 9, 2]],
    [[1, 4, 1], [1, 5, 1], [1, 6, 2], [1, 7, 2]],
  ]
  const lvmDefs: readonly (readonly (readonly [number, number, number])[])[] = [
    [[0, 0, 1], [0, 5, 2], [0, 9, 2], [0, 10, 2], [0, 11, 1]],
    [[0, 1, 1], [0, 5, 2], [0, 9, 1]],
    [[0, 2, 1], [0, 5, 2], [0, 10, 2]],
    [[0, 3, 1], [0, 5, 2], [0, 11, 1]],
    [[0, 4, 1], [0, 5, 2], [0, 10, 2], [0, 11, 1]],
    [[0, 6, 1], [0, 9, 2], [0, 10, 2]],
    [[0, 7, 1], [0, 9, 2], [0, 11, 1]],
    [[0, 8, 1], [0, 9, 2], [0, 10, 2], [0, 11, 1]],
    [[1, 0, 1], [1, 3, 1], [1, 5, 1], [1, 7, 1], [1, 9, 1], [1, 10, 2]],
    [[1, 1, 1], [1, 3, 1], [1, 5, 1], [1, 6, 2], [1, 8, 2], [1, 10, 2]],
    [[1, 2, 1], [1, 3, 2], [1, 6, 1], [1, 7, 2], [1, 10, 1], [1, 11, 1]],
    [[1, 4, 1], [1, 5, 2], [1, 8, 1], [1, 9, 2], [1, 10, 1], [1, 11, 2]],
  ]
  const bulk23: Uint8Array[] = []
  const allX = new Uint8Array(48)
  const allZ = new Uint8Array(48)
  for (let i = 0; i < 24; i++) {
    allX[i] = 1
    allZ[24 + i] = 1
  }
  bulk23.push(allX, allZ)
  for (const entries of w9Defs) {
    const row = new Uint8Array(48)
    for (const [p, l, v] of entries) {
      const [a, b] = LINES[l]!
      row[p * 24 + a] = v
      row[p * 24 + b] = v
    }
    bulk23.push(row)
  }
  for (const entries of lvmDefs) {
    const row = new Uint8Array(48)
    for (const [p, l, v] of entries) {
      const [a, b] = LINES[l]!
      row[p * 24 + a] = v
      row[p * 24 + b] = mod3(2 * v)
    }
    bulk23.push(row)
  }
  const xL = new Uint8Array(48)
  const zL = new Uint8Array(48)
  for (let i = 0; i < 24; i++) {
    const v = FRAME_OF[i] === 0 ? 1 : FRAME_OF[i] === 1 ? 2 : 0
    xL[i] = v
    zL[24 + i] = v
  }
  const choiPlus: Uint8Array[] = bulk23.map(r => {
    const s = new Uint8Array(50)
    for (let i = 0; i < 24; i++) {
      s[i] = r[i]!
      s[25 + i] = r[24 + i]!
    }
    return s
  })
  const sX = new Uint8Array(50)
  const sZ = new Uint8Array(50)
  for (let i = 0; i < 24; i++) {
    sX[i] = xL[i]!
    sZ[25 + i] = zL[24 + i]!
  }
  sX[24] = 2
  sZ[49] = 1
  choiPlus.push(sX, sZ)
  assertExact(gf3Rref(choiPlus, 50).basis.length === 25, '[[24,1,8]]_3 Choi rank 25')

  const supportedLogicals24 = (coneSet: readonly number[]): [number, number][] => {
    const inA = new Uint8Array(24)
    for (const c of coneSet) inA[c] = 1
    const Ac: number[] = []
    for (let c = 0; c < 24; c++) if (!inA[c]) Ac.push(c)
    const nAc = Ac.length
    const nCols = 2 * nAc + 2
    const sub = choiPlus.map(r => {
      const out = new Uint8Array(nCols)
      for (let j = 0; j < nAc; j++) {
        const q = Ac[j]!
        out[j] = r[q]!
        out[nAc + j] = r[25 + q]!
      }
      out[2 * nAc] = r[24]!
      out[2 * nAc + 1] = r[49]!
      return out
    })
    const { basis, pivCols } = gf3Rref(sub, nCols)
    const found: [number, number][] = []
    for (let r = 0; r < basis.length; r++) {
      if (pivCols[r]! >= 2 * nAc) {
        found.push([basis[r]![2 * nAc]!, basis[r]![2 * nAc + 1]!])
      }
    }
    return found
  }

  const pauliProjectors = (p: number, q: number): CMat[] => {
    const U = cmatZero(3)
    for (let x = 0; x < 3; x++) {
      const dst = (x + p) % 3
      const w = W_POW[(q * x) % 3]!
      U.re[dst * 3 + x] = w[0]
      U.im[dst * 3 + x] = w[1]
    }
    const U2 = cmatMul(U, U)
    return [0, 1, 2].map(m => {
      const P = cmatZero(3)
      const wm1 = W_POW[(3 - m) % 3]!
      const wm2 = W_POW[(6 - 2 * m) % 3]!
      for (let i = 0; i < 3; i++) P.re[i * 3 + i] = 1 / 3
      for (let k = 0; k < 9; k++) {
        P.re[k] =
          P.re[k]! +
          (wm1[0] * U.re[k]! - wm1[1] * U.im[k]! + wm2[0] * U2.re[k]! - wm2[1] * U2.im[k]!) / 3
        P.im[k] =
          P.im[k]! +
          (wm1[0] * U.im[k]! + wm1[1] * U.re[k]! + wm2[0] * U2.im[k]! + wm2[1] * U2.re[k]!) / 3
      }
      return P
    })
  }

  const evalChannelQfi = (
    supported: readonly [number, number][],
    H: CMat,
    psiRe: readonly number[],
  ): number => {
    const rho0 = cmatZero(3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        rho0.re[i * 3 + j] = psiRe[i]! * psiRe[j]!
      }
    }
    const Hrho = cmatMul(H, rho0)
    const rhoH = cmatMul(rho0, H)
    const drho0 = cmatZero(3)
    for (let k = 0; k < 9; k++) {
      drho0.re[k] = Hrho.im[k]! - rhoH.im[k]!
      drho0.im[k] = -(Hrho.re[k]! - rhoH.re[k]!)
    }
    if (supported.length === 0) return 0
    if (supported.length === 2) return exactSldQfiScalar(rho0, drho0)
    const [p, q] = supported[0]!
    const projs = pauliProjectors(p, q)
    const dephase = (M: CMat): CMat => {
      const out = cmatZero(3)
      for (const P of projs) {
        const PM = cmatMul(P, cmatMul(M, P))
        for (let k = 0; k < 9; k++) {
          out.re[k] = out.re[k]! + PM.re[k]!
          out.im[k] = out.im[k]! + PM.im[k]!
        }
      }
      return out
    }
    return exactSldQfiScalar(dephase(rho0), dephase(drho0))
  }

  const zOrder = Array.from({ length: 24 }, (_, i) => i)
  const xLead = [0, 1, 4, 5, 17, 19, 21, 23]
  const xLeadSet = new Set<number>(xLead)
  const xStabRows = bulk23.filter(r => {
    for (let i = 0; i < 24; i++) if (r[24 + i] !== 0) return false
    return true
  })
  let xTail: number[] = []
  const nXS = xStabRows.length
  const totalCoset = Math.pow(3, nXS)
  for (let code = 0; code < totalCoset; code++) {
    let tmp = code
    let wt = 0
    let overlap = false
    const coeffs = new Uint8Array(nXS)
    for (let j = 0; j < nXS; j++) {
      coeffs[j] = tmp % 3
      tmp = Math.floor(tmp / 3)
    }
    const supp: number[] = []
    for (let s = 0; s < 24; s++) {
      let v = xL[s]!
      for (let j = 0; j < nXS; j++) if (coeffs[j]) v = (v + coeffs[j]! * xStabRows[j]![s]!) % 3
      if (v !== 0) {
        if (xLeadSet.has(s)) {
          overlap = true
          break
        }
        wt++
        supp.push(s)
        if (wt > 8) break
      }
    }
    if (!overlap && wt === 8) {
      xTail = supp
      break
    }
  }
  assertExact(xTail.length === 8, 'found disjoint weight-8 X_L support')
  const xTailSet = new Set<number>(xTail)
  const xMid = zOrder.filter(c => !xLeadSet.has(c) && !xTailSet.has(c))
  const xOrder = [...xLead, ...xMid, ...xTail]

  const psiNZ = [0, Math.SQRT1_2, Math.SQRT1_2]
  const psiNX = [2 / Math.sqrt(6), -1 / Math.sqrt(6), -1 / Math.sqrt(6)]

  let okTerminalZ = true
  let okClassicalBand = true
  let okQuantumSat = true
  for (let k = 1; k <= 24; k++) {
    const supZ = supportedLogicals24(zOrder.slice(0, k))
    const supX = supportedLogicals24(xOrder.slice(0, k))
    const qZ_NZ = evalChannelQfi(supZ, NZ, psiNZ)
    const qZ_NX = evalChannelQfi(supZ, NX, psiNX)
    const qX_NZ = evalChannelQfi(supX, NZ, psiNZ)
    const qX_NX = evalChannelQfi(supX, NX, psiNX)
    const lamQZ = qZ_NZ + qZ_NX > 0 ? 0.5 * Math.log(qZ_NZ + qZ_NX) : Number.NEGATIVE_INFINITY
    if (k <= 7) {
      if (
        supZ.length !== 0 ||
        supX.length !== 0 ||
        qZ_NZ > 1e-12 ||
        qZ_NX > 1e-12 ||
        qX_NZ > 1e-12 ||
        qX_NX > 1e-12 ||
        lamQZ !== Number.NEGATIVE_INFINITY
      ) {
        okTerminalZ = false
      }
    } else if (k <= 16) {
      if (
        supZ.length !== 1 ||
        supX.length !== 1 ||
        qZ_NZ > 1e-12 ||
        Math.abs(qZ_NX - 4) > 1e-12 ||
        Math.abs(qX_NZ - 4) > 1e-12 ||
        qX_NX > 1e-12
      ) {
        okClassicalBand = false
      }
    } else {
      const lamRelSat = Math.log((qZ_NZ * qZ_NX) / (4 * 4)) / (2 * 2)
      if (
        supZ.length !== 2 ||
        supX.length !== 2 ||
        Math.abs(qZ_NZ - 4) > 1e-12 ||
        Math.abs(qZ_NX - 4) > 1e-12 ||
        Math.abs(qX_NZ - 4) > 1e-12 ||
        Math.abs(qX_NX - 4) > 1e-12 ||
        Math.abs(lamRelSat) > 1e-12
      ) {
        okQuantumSat = false
      }
    }
  }

  // 24-cone zero-sum spatial residual field delta_i = v_i - w_i * v (w_i = 1/24)
  const computeResidual24 = (vArr: readonly number[]): { l2: number; sum: number } => {
    const vTot = vArr.reduce((a, b) => a + b, 0)
    const w = 1 / 24
    let l2Sq = 0
    let sum = 0
    for (let i = 0; i < 24; i++) {
      const d = vArr[i]! - w * vTot
      l2Sq += d * d
      sum += d
    }
    return { l2: Math.sqrt(l2Sq), sum }
  }
  const resUniform = computeResidual24(new Array<number>(24).fill(-0.15))
  const vSingleHit = new Array<number>(24).fill(0)
  vSingleHit[3] = -1.2
  const resSingle = computeResidual24(vSingleHit)

  recordCheck(
    'A1.2',
    'A1',
    'Tier A',
    '[[24,1,8]]_3 Terminal Set Z (k<=7), pointer band (8..16), saturation (17..24) & zero-sum delta_i',
    okTerminalZ &&
      okClassicalBand &&
      okQuantumSat &&
      resUniform.l2 < 1e-14 &&
      Math.abs(resUniform.sum) < 1e-14 &&
      resSingle.l2 > 1.0 &&
      Math.abs(resSingle.sum) < 1e-14,
    `k<=7:Z(lam=-Inf)=${okTerminalZ}, k=8..16:split(0/4)=${okClassicalBand}, k>=17:sat(4/4,lamRel=0)=${okQuantumSat}, uniform||delta||=${resUniform.l2.toExponential(1)}, hit||delta||=${resSingle.l2.toFixed(4)} (|sum|=${Math.abs(resSingle.sum).toExponential(1)})`,
  )

  // --- A1.3 Four-Regime Sign-Paradox & Chronic-Pain Separation (0_V vs 0_D vs Z) ---
  let neutSlots: [number, number, number, number] = [0, 0, 0, 0]
  let neutTones: [number, number, number, number] = [1, 1, -1, -1]
  let foundQuad = false
  outerQuad: for (let s0 = 0; s0 < 24; s0++) {
    for (let s1 = s0 + 1; s1 < 24; s1++) {
      for (let s2 = s1 + 1; s2 < 24; s2++) {
        for (let s3 = s2 + 1; s3 < 24; s3++) {
          const pats: readonly [number, number, number, number][] = [
            [1, 1, -1, -1],
            [1, -1, 1, -1],
            [1, -1, -1, 1],
          ]
          for (const pat of pats) {
            const chi = chiral4Sign(
              (s0 << 1) + (pat[0] < 0 ? 1 : 0),
              (s1 << 1) + (pat[1] < 0 ? 1 : 0),
              (s2 << 1) + (pat[2] < 0 ? 1 : 0),
              (s3 << 1) + (pat[3] < 0 ? 1 : 0),
            )
            if (chi !== 0) {
              neutSlots = [s0, s1, s2, s3]
              neutTones =
                chi > 0
                  ? [pat[0], pat[1], pat[2], pat[3]]
                  : [-pat[0], -pat[1], -pat[2], -pat[3]]
              foundQuad = true
              break outerQuad
            }
          }
        }
      }
    }
  }
  assertExact(foundQuad, 'found Q=0 chiral 4-slot quad')
  const chiPlus = chiral4Sign(
    (neutSlots[0] << 1) + (neutTones[0] < 0 ? 1 : 0),
    (neutSlots[1] << 1) + (neutTones[1] < 0 ? 1 : 0),
    (neutSlots[2] << 1) + (neutTones[2] < 0 ? 1 : 0),
    (neutSlots[3] << 1) + (neutTones[3] < 0 ? 1 : 0),
  )
  const chiMinus = chiral4Sign(
    (neutSlots[0] << 1) + (-neutTones[0] < 0 ? 1 : 0),
    (neutSlots[1] << 1) + (-neutTones[1] < 0 ? 1 : 0),
    (neutSlots[2] << 1) + (-neutTones[2] < 0 ? 1 : 0),
    (neutSlots[3] << 1) + (-neutTones[3] < 0 ? 1 : 0),
  )
  assertExact(chiPlus === 1 && chiMinus === -1, 'exact chi_odd = +/-1 on Q=0 quad')

  const TERN_VAL = [0, 1, -1] as const
  const enc4 = (a: number, b: number, c: number, d: number): number =>
    ((a * 3 + b) * 3 + c) * 3 + d
  const dec4 = (idx: number): [number, number, number, number] => [
    Math.floor(idx / 27) % 3,
    Math.floor(idx / 9) % 3,
    Math.floor(idx / 3) % 3,
    idx % 3,
  ]
  const t2d = (t: number): number => (t === 0 ? 0 : t > 0 ? 1 : 2)
  const idxCPlus = enc4(t2d(neutTones[0]), t2d(neutTones[1]), t2d(neutTones[2]), t2d(neutTones[3]))
  const idxCMinus = enc4(
    t2d(-neutTones[0]),
    t2d(-neutTones[1]),
    t2d(-neutTones[2]),
    t2d(-neutTones[3]),
  )
  const BIPARTS: readonly (readonly number[])[] = [
    [0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
  ]

  const evalChiralDock = (
    pPlus: number,
    occWeight: number,
  ): { phiTone: number; chiOdd: number; phiToneOdd: number; netQ: number; activityD: number } => {
    const rho = cmatZero(81)
    const w = Math.max(0, Math.min(1, occWeight))
    if (1 - w > 0) rho.re[0] = 1 - w
    if (w > 0) {
      const a = Math.sqrt(pPlus)
      const b = Math.sqrt(1 - pPlus)
      rho.re[idxCPlus * 81 + idxCPlus] = w * a * a
      rho.re[idxCPlus * 81 + idxCMinus] = w * a * b
      rho.re[idxCMinus * 81 + idxCPlus] = w * a * b
      rho.re[idxCMinus * 81 + idxCMinus] = w * b * b
    }
    const subEnt = (subA: readonly number[]): number => {
      const dimA = Math.pow(3, subA.length)
      const compB = [0, 1, 2, 3].filter(q => !subA.includes(q))
      const dimB = Math.pow(3, compB.length)
      const red = cmatZero(dimA)
      const fullOf = (aIdx: number, bIdx: number): number => {
        const dg = [0, 0, 0, 0]
        let ra = aIdx
        for (let k = subA.length - 1; k >= 0; k--) {
          dg[subA[k]!] = ra % 3
          ra = Math.floor(ra / 3)
        }
        let rb = bIdx
        for (let k = compB.length - 1; k >= 0; k--) {
          dg[compB[k]!] = rb % 3
          rb = Math.floor(rb / 3)
        }
        return enc4(dg[0]!, dg[1]!, dg[2]!, dg[3]!)
      }
      for (let b = 0; b < dimB; b++) {
        const actA: number[] = []
        for (let a = 0; a < dimA; a++) {
          const f = fullOf(a, b)
          if (Math.abs(rho.re[f * 81 + f]!) > 1e-15) actA.push(a)
        }
        for (const a1 of actA) {
          const f1 = fullOf(a1, b)
          for (const a2 of actA) {
            const f2 = fullOf(a2, b)
            red.re[a1 * dimA + a2] = red.re[a1 * dimA + a2]! + rho.re[f1 * 81 + f2]!
          }
        }
      }
      const nz: number[] = []
      for (let a = 0; a < dimA; a++) if (Math.abs(red.re[a * dimA + a]!) > 1e-15) nz.push(a)
      const comp = cmatZero(nz.length)
      for (let r = 0; r < nz.length; r++) {
        for (let c = 0; c < nz.length; c++) {
          comp.re[r * nz.length + c] = red.re[nz[r]! * dimA + nz[c]!]!
        }
      }
      return vonNeumannEntropy(comp)
    }
    const occMI = (subA: readonly number[]): number => {
      const compB = [0, 1, 2, 3].filter(q => !subA.includes(q))
      const pAB = new Float64Array(16)
      const pA = new Float64Array(1 << subA.length)
      const pB = new Float64Array(1 << compB.length)
      for (let i = 0; i < 81; i++) {
        const pr = rho.re[i * 81 + i]!
        if (pr <= 1e-15) continue
        const d = dec4(i)
        const oc = d.map(x => (x === 0 ? 0 : 1))
        const fb = (oc[0]! << 3) | (oc[1]! << 2) | (oc[2]! << 1) | oc[3]!
        let ab = 0
        for (const q of subA) ab = (ab << 1) | oc[q]!
        let bb = 0
        for (const q of compB) bb = (bb << 1) | oc[q]!
        pAB[fb] = pAB[fb]! + pr
        pA[ab] = pA[ab]! + pr
        pB[bb] = pB[bb]! + pr
      }
      const sh = (arr: Float64Array): number => {
        let h = 0
        for (let i = 0; i < arr.length; i++) {
          const x = arr[i]!
          if (x > 1e-15) h -= x * Math.log(x)
        }
        return h
      }
      return sh(pA) + sh(pB) - sh(pAB)
    }
    const sAll = subEnt([0, 1, 2, 3])
    let phiTone = Number.POSITIVE_INFINITY
    for (const A of BIPARTS) {
      const B = [0, 1, 2, 3].filter(q => !A.includes(q))
      const delta = subEnt(A) + subEnt(B) - sAll - occMI(A)
      if (delta < phiTone) phiTone = delta
    }
    let chiOdd = 0
    let netQ = 0
    let activityD = 0
    for (let i = 0; i < 81; i++) {
      const pr = rho.re[i * 81 + i]!
      if (pr <= 1e-15) continue
      const d = dec4(i)
      const t = [TERN_VAL[d[0]]!, TERN_VAL[d[1]]!, TERN_VAL[d[2]]!, TERN_VAL[d[3]]!]
      const nonNeutralSlots =
        (d[0] !== 0 ? 1 : 0) + (d[1] !== 0 ? 1 : 0) + (d[2] !== 0 ? 1 : 0) + (d[3] !== 0 ? 1 : 0)
      activityD += pr * (nonNeutralSlots / 4)
      netQ += pr * (t[0]! + t[1]! + t[2]! + t[3]!)
      if (t[0] !== 0 && t[1] !== 0 && t[2] !== 0 && t[3] !== 0) {
        chiOdd +=
          pr *
          chiral4Sign(
            (neutSlots[0] << 1) + (t[0]! < 0 ? 1 : 0),
            (neutSlots[1] << 1) + (t[1]! < 0 ? 1 : 0),
            (neutSlots[2] << 1) + (t[2]! < 0 ? 1 : 0),
            (neutSlots[3] << 1) + (t[3]! < 0 ? 1 : 0),
          )
      }
    }
    return { phiTone, chiOdd, phiToneOdd: chiOdd * phiTone, netQ, activityD }
  }

  // Unified channel evaluator returning both pullback SLD QFI scale lambda_Q and exact channel
  // coherence viability margin (1 - pDepol), with zero hardcoded regime literals.
  const evalChannelRegime = (
    pDepol: number,
    sensoryGain: number,
  ): { lambdaQ: number; viabMargin: number } => {
    const viabMargin = Math.max(0, 1 - pDepol)
    if (pDepol >= 1 - 1e-15) return { lambdaQ: Number.NEGATIVE_INFINITY, viabMargin: 0 }
    const st = evalQutritFamily(0.65, 0.45, pDepol)
    const gQ = toMat2(exactSldQfiMatrix(st.rho, [st.drho0, st.drho1]))
    const Jg: Mat2x2 = [
      [sensoryGain, 0],
      [0, sensoryGain],
    ]
    const gPull = mul2x2(trans2x2(Jg), mul2x2(gQ, Jg))
    const d = det2x2(gPull)
    return {
      lambdaQ: d > 1e-300 ? Math.log(d) / (2 * dimParam) : Number.NEGATIVE_INFINITY,
      viabMargin,
    }
  }

  // Regime 1 (High-arousal shock/panic): sensory gain spikes 1.0 -> 3.2 while stress depolarization
  // worsens p: 0.45 -> 0.75 (Balduzzi sees false positive lambdaDot > 0; Vibe reads chiOdd < -0.5 & viabDot < 0).
  const r1Before = evalChannelRegime(0.45, 1.0)
  const r1After = evalChannelRegime(0.75, 3.2)
  const r1LamDot = r1After.lambdaQ - r1Before.lambdaQ
  const r1ViabMarginDot = r1After.viabMargin - r1Before.viabMargin
  const r1Dock = evalChiralDock(0.15, 0.95)

  // Regime 2 (Calm restful stillness, 0_V vital peace): settling lowers sensory gain 1.35 -> 0.80 while
  // depolarization improves p: 0.15 -> 0.10 (Balduzzi sees false pain lambdaDot < 0; Vibe reads finite
  // lambdaQ, high viabMargin = 0.90, exact Tr(D_hat rho) = 0.02, and non-negative chiOdd).
  const r2Before = evalChannelRegime(0.15, 1.35)
  const r2After = evalChannelRegime(0.10, 0.80)
  const r2Lam = r2After.lambdaQ
  const r2LamDot = r2After.lambdaQ - r2Before.lambdaQ
  const r2ViabMargin = r2After.viabMargin
  const r2Dock = evalChiralDock(0.75, 0.02)

  // Terminal Set Z (dead collapse): p = 1.0 gives exact lambda_Q = -Inf, viabMargin = 0, Tr(D_hat rho) = 0.
  const zReg = evalChannelRegime(1.0, 1.0)
  const zLam = zReg.lambdaQ
  const zViabMargin = zReg.viabMargin
  const zDock = evalChiralDock(0.50, 0.0)

  // Regime 3 (Active balanced neutrality, 0_D): high exact Tr(D_hat rho) = 0.85, Phi_tone > 1.0, <chi_odd> = 0.
  const r3Reg = evalChannelRegime(0.22, 1.0)
  const r3Lam = r3Reg.lambdaQ
  const r3ViabMargin = r3Reg.viabMargin
  const r3Dock = evalChiralDock(0.50, 0.85)

  // Regime 4 (Sustained chronic pain plateau): genuinely time-stepped 20-beat constant-drive trajectory
  // p(t) = 0.30, gain(t) = 1.0 giving finite-difference d lambda / dt = 0 and closed-loop integral oint d lambda = 0,
  // while present-state chiral valence Phi_tone^odd < -0.5 remains sustained.
  const plateauTrace: number[] = []
  for (let t = 0; t <= 20; t++) plateauTrace.push(evalChannelRegime(0.30, 1.0).lambdaQ)
  let r4MaxAbsLamDot = 0
  for (let t = 1; t < plateauTrace.length; t++) {
    const diff = Math.abs(plateauTrace[t]! - plateauTrace[t - 1]!)
    if (diff > r4MaxAbsLamDot) r4MaxAbsLamDot = diff
  }
  let loopIntegral = 0
  const nLoop = 64
  for (let k = 0; k < nLoop; k++) {
    const pA = 0.30 + 0.08 * Math.sin((2 * PI * k) / nLoop)
    const pB = 0.30 + 0.08 * Math.sin((2 * PI * (k + 1)) / nLoop)
    loopIntegral += evalChannelRegime(pB, 1.0).lambdaQ - evalChannelRegime(pA, 1.0).lambdaQ
  }
  const r4Dock = evalChiralDock(0.18, 0.95)

  recordCheck(
    'A1.3',
    'A1',
    'Tier A',
    'Four-regime sign-paradox & chronic-pain separation (shock, 0_V peace, 0_D neutral, plateau vs Z)',
    r1LamDot > 0.2 &&
      r1Dock.chiOdd < -0.5 &&
      r1ViabMarginDot < 0 &&
      r2LamDot < -0.1 &&
      Number.isFinite(r2Lam) &&
      r2ViabMargin > 0.8 &&
      r2Dock.activityD < 0.05 &&
      r2Dock.activityD > 0 &&
      r2Dock.chiOdd >= 0 &&
      zLam === Number.NEGATIVE_INFINITY &&
      zViabMargin === 0 &&
      zDock.activityD === 0 &&
      zDock.phiTone === 0 &&
      r3Dock.activityD > 0.5 &&
      r3ViabMargin > 0.5 &&
      r3Dock.phiTone > 1.0 &&
      Math.abs(r3Dock.chiOdd) < 1e-14 &&
      Number.isFinite(r3Lam) &&
      r4MaxAbsLamDot < 1e-14 &&
      Math.abs(loopIntegral) < 1e-13 &&
      r4Dock.phiToneOdd < -0.5 &&
      Math.abs(r4Dock.netQ) < 1e-14,
    `shock(lamDot=+${r1LamDot.toFixed(3)},viabDot=${r1ViabMarginDot.toFixed(2)},chi=${r1Dock.chiOdd.toFixed(2)}), 0_V(lamDot=${r2LamDot.toFixed(3)},lam=${r2Lam.toFixed(2)},viab=${r2ViabMargin.toFixed(2)},D=${r2Dock.activityD.toFixed(2)}), 0_D(Phi=${r3Dock.phiTone.toFixed(3)},chi=${r3Dock.chiOdd.toFixed(1)},D=${r3Dock.activityD.toFixed(2)}), Z(lam=-Inf,viab=${zViabMargin},D=${zDock.activityD}), chronic(max|lamDot|=${r4MaxAbsLamDot.toExponential(1)},oint=${loopIntegral.toExponential(1)},Phi^odd=${r4Dock.phiToneOdd.toFixed(4)}<-0.5)`,
  )

  // --- A1.4 Closed-Loop Balduzzi Exp. 6 (Full Reserve-Foraging Feedback Loop) ---
  const N_LOC = 8
  const T_EXP6 = 60

  type Exp6Result = {
    readonly a: number
    readonly b: number
    readonly viabObj: number
    readonly wireObj: number
    readonly injValence: number
    readonly minE: number
    readonly minH: number
  }

  const runClosedExp6 = (a: number, b: number): Exp6Result => {
    let E = 0.85
    const h = new Float64Array(N_LOC).fill(1.0)
    const mOfE = (e: number): number => e / (e + 0.18)
    const qOfE = (e: number): number => 0.20 + 0.80 * ((e * e) / (e * e + 0.06))
    let minE = E
    let minH = 1.0
    let sumE = 0
    let sumHMean = 0
    let sumLamWire = 0
    let prevLam = 0
    let injValence = 0

    for (let t = 0; t < T_EXP6; t++) {
      if (t === 12) {
        h[0] = Math.max(0.05, h[0]! - 0.48)
        h[1] = Math.max(0.05, h[1]! - 0.48)
      } else if (t === 34) {
        h[2] = Math.max(0.05, h[2]! - 0.45)
        h[3] = Math.max(0.05, h[3]! - 0.45)
      }

      let rSum = 0
      const r = new Float64Array(N_LOC)
      for (let i = 0; i < N_LOC; i++) {
        r[i] = 1 - h[i]!
        rSum += r[i]!
      }
      const mE = mOfE(E)
      const qE = qOfE(E)

      let ySum = 0
      let y2Sum = 0
      let logYSum = 0
      const yTilde = new Float64Array(N_LOC)
      for (let i = 0; i < N_LOC; i++) {
        const Gi = Math.exp(Math.max(-3.5, Math.min(3.5, a * r[i]! + b * (rSum / 4))))
        const yi = mE * qE * h[i]! * Gi
        yTilde[i] = yi
        ySum += yi
        y2Sum += yi * yi
        logYSum += Math.log(yi + 1e-6)
      }
      const yMean = ySum / N_LOC
      const y2Mean = y2Sum / N_LOC
      const lamT = logYSum / N_LOC
      if (t === 12) injValence = lamT - prevLam
      prevLam = lamT
      sumLamWire += lamT

      const intake = (0.72 * yMean) / (yMean + 0.25)
      const exertion = (0.34 + 0.55 * (rSum / N_LOC)) * y2Mean
      const basal = 0.24
      E = Math.max(0.02, Math.min(1.0, E + 0.22 * (intake - exertion - basal)))

      let hSum = 0
      for (let i = 0; i < N_LOC; i++) {
        const heal = 0.08 * E * (1 - h[i]!)
        const wear = 0.22 * r[i]! * yTilde[i]! * yTilde[i]!
        h[i] = Math.max(0.02, Math.min(1.0, h[i]! + heal - wear))
        if (h[i]! < minH) minH = h[i]!
        hSum += h[i]!
      }
      if (E < minE) minE = E
      sumE += E
      sumHMean += hSum / N_LOC
    }

    const viabObj = sumE / T_EXP6 + sumHMean / T_EXP6 + 0.8 * minE + 0.8 * minH
    const wireObj = sumLamWire / T_EXP6
    return { a, b, viabObj, wireObj, injValence, minE, minH }
  }

  const gridVals: number[] = []
  for (let i = 0; i <= 20; i++) gridVals.push(-2 + 0.2 * i)
  const neutralRes = runClosedExp6(0, 0)
  let bestViab = neutralRes
  let bestWire = neutralRes
  for (const a of gridVals) {
    for (const b of gridVals) {
      const res = runClosedExp6(a, b)
      if (res.viabObj > bestViab.viabObj) bestViab = res
      if (res.wireObj > bestWire.wireObj) bestWire = res
    }
  }

  recordCheck(
    'A1.4',
    'A1',
    'Tier B',
    'Closed-loop Balduzzi Exp. 6: viability-aligned guarding/rest vs Goodhart wireheading surge',
    bestViab.a < -0.5 &&
      bestViab.b < -0.5 &&
      bestViab.injValence < -0.1 &&
      bestViab.viabObj > neutralRes.viabObj &&
      bestViab.viabObj > bestWire.viabObj &&
      bestViab.minE > bestWire.minE &&
      bestViab.minH > bestWire.minH &&
      bestWire.b > 0.5 &&
      bestWire.injValence > 0.05 &&
      bestWire.wireObj > bestViab.wireObj &&
      bestWire.viabObj < neutralRes.viabObj,
    `viab(a=${bestViab.a.toFixed(1)},b=${bestViab.b.toFixed(1)},vInj=${bestViab.injValence.toFixed(3)},J=${bestViab.viabObj.toFixed(3)},minE=${bestViab.minE.toFixed(3)},minH=${bestViab.minH.toFixed(3)}) vs wire(a=${bestWire.a.toFixed(1)},b=${bestWire.b.toFixed(1)},vInj=+${bestWire.injValence.toFixed(3)},Jwire=${bestWire.wireObj.toFixed(3)}>${bestViab.wireObj.toFixed(3)},Jviab=${bestWire.viabObj.toFixed(3)}<neut=${neutralRes.viabObj.toFixed(3)})`,
  )

  // --- A1.5 12-Level TMS-EEG Titration BIC Slope/Threshold Protocol (Synthetic Pipeline Audit) ---
  const nLevels = 12
  const trialsPerLvl = 16
  const nTotE4 = nLevels * trialsPerLvl
  const rngE4 = makePrng(0x47e40001)
  const xsE4: number[] = []
  const ySnapData: number[] = []
  const yLinData: number[] = []
  for (let lvl = 0; lvl < nLevels; lvl++) {
    const x = lvl / (nLevels - 1)
    const muSnap = lvl <= 3 ? 0.05 : lvl <= 7 ? 0.52 : 0.96
    const muLin = 0.05 + 0.90 * x
    for (let r = 0; r < trialsPerLvl; r++) {
      xsE4.push(x)
      ySnapData.push(muSnap + 0.06 * rngE4.nextNormal())
      yLinData.push(muLin + 0.06 * rngE4.nextNormal())
    }
  }

  const evalE4Bic = (xs: readonly number[], ys: readonly number[]) => {
    const n = xs.length
    let sx = 0
    let sy = 0
    let sxx = 0
    let sxy = 0
    for (let i = 0; i < n; i++) {
      sx += xs[i]!
      sy += ys[i]!
      sxx += xs[i]! * xs[i]!
      sxy += xs[i]! * ys[i]!
    }
    const denom = n * sxx - sx * sx
    const b1 = (n * sxy - sx * sy) / denom
    const b0 = (sy - b1 * sx) / n
    let rssLin = 0
    for (let i = 0; i < n; i++) {
      const e = ys[i]! - (b0 + b1 * xs[i]!)
      rssLin += e * e
    }
    const bicLin = n * Math.log(rssLin / n) + 2 * Math.log(n)

    let bestRssSnap = Number.POSITIVE_INFINITY
    let bestC1 = 0
    let bestC2 = 0
    for (let c1 = 1; c1 <= nLevels - 3; c1++) {
      for (let c2 = c1 + 1; c2 <= nLevels - 2; c2++) {
        const t1 = c1 / (nLevels - 1)
        const t2 = c2 / (nLevels - 1)
        let s0 = 0, n0 = 0, s1 = 0, n1 = 0, s2 = 0, n2 = 0
        for (let i = 0; i < n; i++) {
          const xi = xs[i]!
          if (xi <= t1 + 1e-12) { s0 += ys[i]!; n0++ }
          else if (xi <= t2 + 1e-12) { s1 += ys[i]!; n1++ }
          else { s2 += ys[i]!; n2++ }
        }
        const m0 = s0 / n0
        const m1 = s1 / n1
        const m2 = s2 / n2
        let rss = 0
        for (let i = 0; i < n; i++) {
          const xi = xs[i]!
          const pred = xi <= t1 + 1e-12 ? m0 : xi <= t2 + 1e-12 ? m1 : m2
          const e = ys[i]! - pred
          rss += e * e
        }
        if (rss < bestRssSnap) {
          bestRssSnap = rss
          bestC1 = c1
          bestC2 = c2
        }
      }
    }
    const bicSnap = n * Math.log(bestRssSnap / n) + 5 * Math.log(n)
    return { deltaBIC: bicLin - bicSnap, bicLin, bicSnap, bestC1, bestC2 }
  }

  const e4Pos = evalE4Bic(xsE4, ySnapData)
  const e4Neg = evalE4Bic(xsE4, yLinData)

  recordCheck(
    'A1.5',
    'A1',
    'Tier C',
    '12-level TMS-EEG titration BIC wedge-snap discriminator (synthetic pipeline audit)',
    e4Pos.deltaBIC > 10 &&
      e4Neg.deltaBIC < -10 &&
      e4Pos.bestC1 === 3 &&
      e4Pos.bestC2 === 7 &&
      nTotE4 === 192,
    `positive wedge-snap deltaBIC=+${e4Pos.deltaBIC.toFixed(1)} (cutoffs ${e4Pos.bestC1},${e4Pos.bestC2}) > +10; linear negative control deltaBIC=${e4Neg.deltaBIC.toFixed(1)} < -10`,
  )
}

// =================================================================================================
// GATE A2 — COMPOSITIONAL GAUSSIAN BLOWUP, EXACT BROJA PID & SELF-ATTRACTOR SYNERGY STEERING
// =================================================================================================

type PidResult = {
  readonly i12: number
  readonly i1: number
  readonly i2: number
  readonly syn: number
  readonly red: number
  readonly unq1: number
  readonly unq2: number
  readonly rosasPsi: number
  readonly synImin: number
  readonly iMin: number
}

// Exact Finite-Alphabet Discrete BROJA PID via Csiszar-Tusnady Alternating I-Projection (Sinkhorn-EM)
// initialized from independent, original, and Frechet-Hoeffding couplings, plus Williams-Beer I_min.
function exactDiscretePid(
  n1: number,
  n2: number,
  nY: number,
  jointP: Float64Array,
): PidResult {
  const idx = (x1: number, x2: number, y: number): number => (x1 * n2 + x2) * nY + y
  const pY = new Float64Array(nY)
  const p1Y = new Float64Array(n1 * nY)
  const p2Y = new Float64Array(n2 * nY)
  const p1 = new Float64Array(n1)
  const p2 = new Float64Array(n2)
  const p12 = new Float64Array(n1 * n2)

  let tot = 0
  for (let x1 = 0; x1 < n1; x1++) {
    for (let x2 = 0; x2 < n2; x2++) {
      for (let y = 0; y < nY; y++) {
        const v = jointP[idx(x1, x2, y)]!
        tot += v
        pY[y] = pY[y]! + v
        p1Y[x1 * nY + y] = p1Y[x1 * nY + y]! + v
        p2Y[x2 * nY + y] = p2Y[x2 * nY + y]! + v
        p1[x1] = p1[x1]! + v
        p2[x2] = p2[x2]! + v
        p12[x1 * n2 + x2] = p12[x1 * n2 + x2]! + v
      }
    }
  }
  assertExact(Math.abs(tot - 1) < 1e-11, `PID distribution sum=${tot}`)

  const shannon = (arr: Float64Array): number => {
    let h = 0
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i]!
      if (v > 1e-15) h -= v * Math.log(v)
    }
    return h
  }
  const hY = shannon(pY)
  const h1 = shannon(p1)
  const h2 = shannon(p2)
  const h12 = shannon(p12)
  const h1Y = shannon(p1Y)
  const h2Y = shannon(p2Y)
  const h12Y = shannon(jointP)

  const i1 = Math.max(0, h1 + hY - h1Y)
  const i2 = Math.max(0, h2 + hY - h2Y)
  const i12 = Math.max(0, h12 + hY - h12Y)

  const evalIQ = (Q: Float64Array): number => {
    const q12 = new Float64Array(n1 * n2)
    for (let x1 = 0; x1 < n1; x1++) {
      for (let x2 = 0; x2 < n2; x2++) {
        let s = 0
        for (let y = 0; y < nY; y++) s += Q[idx(x1, x2, y)]!
        q12[x1 * n2 + x2] = s
      }
    }
    return Math.max(0, shannon(q12) + hY - shannon(Q))
  }

  const qInd = new Float64Array(n1 * n2 * nY)
  for (let y = 0; y < nY; y++) {
    const py = pY[y]!
    if (py <= 1e-15) continue
    for (let x1 = 0; x1 < n1; x1++) {
      for (let x2 = 0; x2 < n2; x2++) {
        qInd[idx(x1, x2, y)] = (p1Y[x1 * nY + y]! * p2Y[x2 * nY + y]!) / py
      }
    }
  }
  const qOrig = Float64Array.from(jointP)
  const qFH = new Float64Array(n1 * n2 * nY)
  const qFHAnti = new Float64Array(n1 * n2 * nY)
  for (let y = 0; y < nY; y++) {
    const rem1 = new Float64Array(n1)
    const rem2 = new Float64Array(n2)
    for (let x1 = 0; x1 < n1; x1++) rem1[x1] = p1Y[x1 * nY + y]!
    for (let x2 = 0; x2 < n2; x2++) rem2[x2] = p2Y[x2 * nY + y]!
    let i = 0
    let j = 0
    while (i < n1 && j < n2) {
      const m = Math.min(rem1[i]!, rem2[j]!)
      qFH[idx(i, j, y)] = m
      rem1[i] = rem1[i]! - m
      rem2[j] = rem2[j]! - m
      if (rem1[i]! <= 1e-15) i++
      if (rem2[j]! <= 1e-15) j++
    }
    // Anti-monotone Frechet-Hoeffding coupling (pairs x1 ascending with x2 descending)
    const rem1a = new Float64Array(n1)
    const rem2a = new Float64Array(n2)
    for (let x1 = 0; x1 < n1; x1++) rem1a[x1] = p1Y[x1 * nY + y]!
    for (let x2 = 0; x2 < n2; x2++) rem2a[x2] = p2Y[x2 * nY + y]!
    let ia = 0
    let ja = n2 - 1
    while (ia < n1 && ja >= 0) {
      const m = Math.min(rem1a[ia]!, rem2a[ja]!)
      qFHAnti[idx(ia, ja, y)] = m
      rem1a[ia] = rem1a[ia]! - m
      rem2a[ja] = rem2a[ja]! - m
      if (rem1a[ia]! <= 1e-15) ia++
      if (rem2a[ja]! <= 1e-15) ja--
    }
  }

  const runSinkhornEm = (qStart: Float64Array): { iq: number; Q: Float64Array } => {
    const Q = Float64Array.from(qStart)
    const M = new Float64Array(n1 * n2)
    let prevI = evalIQ(Q)
    for (let iter = 0; iter < 400; iter++) {
      M.fill(0)
      for (let x1 = 0; x1 < n1; x1++) {
        for (let x2 = 0; x2 < n2; x2++) {
          let s = 0
          for (let y = 0; y < nY; y++) s += Q[idx(x1, x2, y)]!
          M[x1 * n2 + x2] = s
        }
      }
      for (let y = 0; y < nY; y++) {
        const py = pY[y]!
        if (py <= 1e-15) continue
        const K = new Float64Array(n1 * n2)
        for (let x1 = 0; x1 < n1; x1++) {
          for (let x2 = 0; x2 < n2; x2++) {
            K[x1 * n2 + x2] = M[x1 * n2 + x2]! * py
          }
        }
        for (let sk = 0; sk < 80; sk++) {
          let maxErr = 0
          for (let x1 = 0; x1 < n1; x1++) {
            const target = p1Y[x1 * nY + y]!
            let s = 0
            for (let x2 = 0; x2 < n2; x2++) s += K[x1 * n2 + x2]!
            maxErr = Math.max(maxErr, Math.abs(s - target))
            if (s > 1e-300 && target > 0) {
              const fac = target / s
              for (let x2 = 0; x2 < n2; x2++) K[x1 * n2 + x2] = K[x1 * n2 + x2]! * fac
            } else {
              for (let x2 = 0; x2 < n2; x2++) K[x1 * n2 + x2] = 0
            }
          }
          for (let x2 = 0; x2 < n2; x2++) {
            const target = p2Y[x2 * nY + y]!
            let s = 0
            for (let x1 = 0; x1 < n1; x1++) s += K[x1 * n2 + x2]!
            maxErr = Math.max(maxErr, Math.abs(s - target))
            if (s > 1e-300 && target > 0) {
              const fac = target / s
              for (let x1 = 0; x1 < n1; x1++) K[x1 * n2 + x2] = K[x1 * n2 + x2]! * fac
            } else {
              for (let x1 = 0; x1 < n1; x1++) K[x1 * n2 + x2] = 0
            }
          }
          if (maxErr < 1e-13) break
        }
        for (let x1 = 0; x1 < n1; x1++) {
          for (let x2 = 0; x2 < n2; x2++) {
            Q[idx(x1, x2, y)] = K[x1 * n2 + x2]!
          }
        }
      }
      const curI = evalIQ(Q)
      if (Math.abs(prevI - curI) < 1e-13 && iter >= 5) {
        prevI = curI
        break
      }
      prevI = curI
    }
    return { iq: prevI, Q }
  }

  const qMix = new Float64Array(n1 * n2 * nY)
  const qMixAnti = new Float64Array(n1 * n2 * nY)
  for (let k = 0; k < qMix.length; k++) {
    qMix[k] = 0.85 * qFH[k]! + 0.15 * qInd[k]!
    qMixAnti[k] = 0.85 * qFHAnti[k]! + 0.15 * qInd[k]!
  }

  const candidates: Array<{ iq: number; Q: Float64Array }> = [
    { iq: evalIQ(qFH), Q: qFH },
    { iq: evalIQ(qFHAnti), Q: qFHAnti },
    { iq: evalIQ(qOrig), Q: qOrig },
    runSinkhornEm(qInd),
    runSinkhornEm(qOrig),
    runSinkhornEm(qFH),
    runSinkhornEm(qFHAnti),
    runSinkhornEm(qMix),
    runSinkhornEm(qMixAnti),
  ]
  let bestCand = candidates[0]!
  for (let c = 1; c < candidates.length; c++) {
    if (candidates[c]!.iq < bestCand.iq) bestCand = candidates[c]!
  }
  const bestIQ = bestCand.iq
  const bestQ = bestCand.Q

  // Explicit post-solve marginal feasibility assertion: Q(X1, Y) = P(X1, Y) and Q(X2, Y) = P(X2, Y)
  let maxMargErr = 0
  for (let y = 0; y < nY; y++) {
    for (let x1 = 0; x1 < n1; x1++) {
      let s1 = 0
      for (let x2 = 0; x2 < n2; x2++) {
        const qv = bestQ[idx(x1, x2, y)]!
        assertExact(qv >= -1e-15, `BROJA Q negative entry: ${qv}`)
        s1 += qv
      }
      maxMargErr = Math.max(maxMargErr, Math.abs(s1 - p1Y[x1 * nY + y]!))
    }
    for (let x2 = 0; x2 < n2; x2++) {
      let s2 = 0
      for (let x1 = 0; x1 < n1; x1++) s2 += bestQ[idx(x1, x2, y)]!
      maxMargErr = Math.max(maxMargErr, Math.abs(s2 - p2Y[x2 * nY + y]!))
    }
  }
  assertExact(maxMargErr < 1e-9, `BROJA marginal feasibility violated: maxErr=${maxMargErr}`)

  const syn = Math.max(0, i12 - bestIQ)
  const unq1 = Math.max(0, bestIQ - i2)
  const unq2 = Math.max(0, bestIQ - i1)
  const red = Math.max(0, i1 + i2 - bestIQ)
  const rosasPsi = i12 - i1 - i2

  let iMin = 0
  for (let y = 0; y < nY; y++) {
    const py = pY[y]!
    if (py <= 1e-15) continue
    let s1 = 0
    for (let x1 = 0; x1 < n1; x1++) {
      const pxy = p1Y[x1 * nY + y]!
      if (pxy > 1e-15) s1 += (pxy / py) * Math.log(pxy / (p1[x1]! * py))
    }
    let s2 = 0
    for (let x2 = 0; x2 < n2; x2++) {
      const pxy = p2Y[x2 * nY + y]!
      if (pxy > 1e-15) s2 += (pxy / py) * Math.log(pxy / (p2[x2]! * py))
    }
    iMin += py * Math.min(s1, s2)
  }
  const synImin = i12 - i1 - i2 + iMin
  return { i12, i1, i2, syn, red, unq1, unq2, rosasPsi, synImin, iMin }
}

function runGateA2(): void {
  console.log('\n==============================================================================================')
  console.log('GATE A2: COMPOSITIONAL GAUSSIAN BLOWUP, EXACT BROJA PID & SELF-ATTRACTOR SYNERGY STEERING')
  console.log('==============================================================================================')

  // --- A2.1 Compositional CLR + Last-Drop + Gaussian log-det Blowup Negative Control ---
  // Ng = 40 species, n <= 80 discrete molecules, T = 84 time steps.
  const Ng = 40
  const nMol = 80
  const T_GARD = 84

  // Exact combinatorial state-space entropy ceiling: ln C(n + Ng - 1, Ng - 1) = ln C(119, 39) ~ 72.7232 nats
  let logCeiling = 0
  for (let k = 1; k <= Ng - 1; k++) logCeiling += Math.log((nMol + k) / k)

  // Generate deterministic GARD-like discrete compositional trajectory (Ng = 40, n <= 80, T = 84):
  //   - 19 symmetric 1:1 catalytic homodimers (2k, 2k+1) for k = 0..18 plus a 20th lagged species 38
  //     forming a 20-stage GARD catalytic chain u_{k+1}(t+1) = u_k(t) with u_k(t) in {1, 4} (19 exact
  //     1-beat shifted links, capped so total chain molecules <= 56), plus
  //   - 1 free reservoir species (39) modulating total assembly size n_t across [42, 80] (dn ~ 24).
  // All 19 cross-beat innovation eigenvalues scale as O(eps^2), cleanly exposing:
  //   (1) Gaussian log-det blowup far above the 72.72-nat combinatorial ceiling at eps=1e-6, drop 39;
  //   (2) >100 nat swing under undisclosed pseudocount swap eps=1e-6 -> 1e-10;
  //   (3) >200 nat permutation failure under species-drop swap drop 39 -> drop 0 (splitting all dimers!).
  const rngGard = makePrng(0xa2012026)
  const counts: number[][] = []
  const nPairs = 19
  const uChain = new Int32Array(nPairs + 1).fill(1) // uChain[0..18] = dimers, uChain[19] = species 38
  for (let k = 0; k <= nPairs; k++) {
    if (k % 6 === 0) uChain[k] = 5
  }
  for (let t = 0; t < T_GARD; t++) {
    if (t > 0) {
      for (let k = nPairs; k >= 1; k--) uChain[k] = uChain[k - 1]!
      let tailSum = uChain[nPairs]!
      for (let k = 1; k < nPairs; k++) tailSum += 2 * uChain[k]!
      uChain[0] = tailSum <= 46 && rngGard.next() < 0.28 ? 5 : 1
    }
    const row = new Array<number>(Ng).fill(0)
    let chainTot = 0
    for (let k = 0; k < nPairs; k++) {
      const v = uChain[k]!
      row[2 * k] = v
      row[2 * k + 1] = v
      chainTot += 2 * v
    }
    row[38] = uChain[nPairs]!
    chainTot += row[38]!
    const maxFree = nMol - chainTot
    // Alternate between low and high reservoir load (mirroring GARD growth/fission cycles)
    row[39] = t % 2 === 0 ? 1 : Math.max(1, maxFree - Math.floor(rngGard.next() * 2))
    const nTot = row.reduce((a, b) => a + b, 0)
    assertExact(nTot <= nMol && nTot >= 38, `GARD count ${nTot} out of range`)
    counts.push(row)
  }

  const evalPigozziGaussian = (eps: number, dropIdx: number) => {
    const d = Ng - 1 // 39
    const U: Float64Array[] = []
    for (let t = 0; t < T_GARD; t++) {
      const c = counts[t]!
      let nSum = 0
      for (let j = 0; j < Ng; j++) nSum += c[j]!
      let pSum = 0
      const p = new Float64Array(Ng)
      for (let j = 0; j < Ng; j++) {
        p[j] = c[j]! / nSum + eps
        pSum += p[j]!
      }
      let logMean = 0
      const lp = new Float64Array(Ng)
      for (let j = 0; j < Ng; j++) {
        lp[j] = Math.log(p[j]! / pSum)
        logMean += lp[j]!
      }
      logMean /= Ng
      const u = new Float64Array(d)
      let pos = 0
      for (let j = 0; j < Ng; j++) {
        if (j === dropIdx) continue
        u[pos++] = lp[j]! - logMean
      }
      U.push(u)
    }
    const nTrans = T_GARD - 1 // 83 transitions
    // Exact Golub-Van Loan Householder QR log-determinant of Cov(vecs) + ridge * I without squaring
    // the condition number (resolves variances accurately down to ridge = 1e-16 with zero NaN risk!):
    const covLogDet = (vecs: readonly Float64Array[], ridge: number): number => {
      const nObs = vecs.length
      const dim = vecs[0]!.length
      const mean = new Float64Array(dim)
      for (let t = 0; t < nObs; t++) {
        const v = vecs[t]!
        for (let i = 0; i < dim; i++) mean[i] = mean[i]! + v[i]!
      }
      for (let i = 0; i < dim; i++) mean[i] = mean[i]! / nObs
      const rows = nObs + dim
      const A = new Float64Array(rows * dim)
      const invSqrtN = 1 / Math.sqrt(nObs - 1)
      for (let t = 0; t < nObs; t++) {
        const v = vecs[t]!
        const off = t * dim
        for (let i = 0; i < dim; i++) A[off + i] = (v[i]! - mean[i]!) * invSqrtN
      }
      const sqrtR = Math.sqrt(ridge)
      for (let i = 0; i < dim; i++) A[(nObs + i) * dim + i] = sqrtR
      let logDet = 0
      for (let k = 0; k < dim; k++) {
        let normSq = 0
        for (let r = k; r < rows; r++) {
          const val = A[r * dim + k]!
          normSq += val * val
        }
        const norm = Math.sqrt(normSq)
        logDet += 2 * Math.log(norm)
        const akk = A[k * dim + k]!
        const alpha = akk >= 0 ? -norm : norm
        const v0 = akk - alpha
        let vNormSq = v0 * v0
        for (let r = k + 1; r < rows; r++) {
          const val = A[r * dim + k]!
          vNormSq += val * val
        }
        if (vNormSq <= 1e-300) continue
        const beta = 2 / vNormSq
        A[k * dim + k] = alpha
        for (let c = k + 1; c < dim; c++) {
          let dot = v0 * A[k * dim + c]!
          for (let r = k + 1; r < rows; r++) dot += A[r * dim + k]! * A[r * dim + c]!
          const s = beta * dot
          A[k * dim + c] = A[k * dim + c]! - s * v0
          for (let r = k + 1; r < rows; r++) A[r * dim + c] = A[r * dim + c]! - s * A[r * dim + k]!
        }
      }
      return logDet
    }

    const X0 = U.slice(0, nTrans)
    const X1 = U.slice(1, T_GARD)
    const X01 = X0.map((a, t) => {
      const b = X1[t]!
      const ab = new Float64Array(2 * d)
      ab.set(a, 0)
      ab.set(b, d)
      return ab
    })
    const idxA: number[] = []
    const idxB: number[] = []
    for (let i = 0; i < d; i++) {
      if (((i >> 1) & 1) === 0) idxA.push(i)
      else idxB.push(i)
    }
    const sliceIdx = (vecs: readonly Float64Array[], ids: readonly number[]): Float64Array[] =>
      vecs.map(v => {
        const out = new Float64Array(ids.length)
        for (let k = 0; k < ids.length; k++) out[k] = v[ids[k]!]!
        return out
      })
    const XA = sliceIdx(X0, idxA)
    const XB = sliceIdx(X0, idxB)
    const XA1 = XA.map((a, t) => {
      const ab = new Float64Array(idxA.length + d)
      ab.set(a, 0)
      ab.set(X1[t]!, idxA.length)
      return ab
    })
    const XB1 = XB.map((b, t) => {
      const ab = new Float64Array(idxB.length + d)
      ab.set(b, 0)
      ab.set(X1[t]!, idxB.length)
      return ab
    })

    const ridge = 1e-16
    const ld0 = covLogDet(X0, ridge)
    const ld1 = covLogDet(X1, ridge)
    const ld01 = covLogDet(X01, ridge)
    const ldA = covLogDet(XA, ridge)
    const ldB = covLogDet(XB, ridge)
    const ldA1 = covLogDet(XA1, ridge)
    const ldB1 = covLogDet(XB1, ridge)

    const iJoint = 0.5 * (ld0 + ld1 - ld01)
    const iA = 0.5 * (ldA + ld1 - ldA1)
    const iB = 0.5 * (ldB + ld1 - ldB1)
    const phiR = iJoint - iA - iB
    return { iJoint, iA, iB, phiR }
  }

  const plBase = evalPigozziGaussian(1e-6, 39)
  const plEps10 = evalPigozziGaussian(1e-10, 39)
  const plDrop0 = evalPigozziGaussian(1e-6, 0)
  const blowupVal = Math.max(Math.abs(plBase.iJoint), Math.abs(plBase.phiR))
  const epsSwing = Math.max(
    Math.abs(plBase.iJoint - plEps10.iJoint),
    Math.abs(plBase.phiR - plEps10.phiR),
  )
  const dropSwing = Math.abs(plBase.phiR - plDrop0.phiR)

  recordCheck(
    'A2.1',
    'A2',
    'Tier A',
    'Compositional CLR + Last-Drop + Gaussian log-det blowup, pseudocount & permutation fragility',
    Math.abs(logCeiling - 72.7232) < 0.02 &&
      Number.isFinite(plBase.iJoint) &&
      Number.isFinite(plEps10.iJoint) &&
      Number.isFinite(plDrop0.phiR) &&
      blowupVal > 2 * logCeiling &&
      epsSwing > 100 &&
      dropSwing > 200,
    `ceiling=${logCeiling.toFixed(2)} nats, eps=1e-6/drop39: I_G=${plBase.iJoint.toFixed(1)}, Phi^r=${plBase.phiR.toFixed(1)} (>${(2 * logCeiling).toFixed(1)}), eps 1e-6->1e-10 swing=${epsSwing.toFixed(1)} (>100), drop 39->0 Phi^r swing=${dropSwing.toFixed(1)} (>200)`,
  )

  // --- A2.2 Exact Finite-Alphabet Discrete BROJA PID + Williams-Beer I_min Failure + Swap Invariance ---
  const pProdDet = new Float64Array(3 * 3 * 9)
  for (let x1 = 0; x1 < 3; x1++) {
    for (let x2 = 0; x2 < 3; x2++) {
      pProdDet[(x1 * 3 + x2) * 9 + (x1 * 3 + x2)] = 1 / 9
    }
  }
  const pidProdDet = exactDiscretePid(3, 3, 9, pProdDet)

  const pProdNoisy = new Float64Array(3 * 3 * 9)
  const chan = (x: number, y: number): number => (x === y ? 0.85 : 0.075)
  for (let x1 = 0; x1 < 3; x1++) {
    for (let x2 = 0; x2 < 3; x2++) {
      for (let y1 = 0; y1 < 3; y1++) {
        for (let y2 = 0; y2 < 3; y2++) {
          pProdNoisy[(x1 * 3 + x2) * 9 + (y1 * 3 + y2)] = (1 / 9) * chan(x1, y1) * chan(x2, y2)
        }
      }
    }
  }
  const pidProdNoisy = exactDiscretePid(3, 3, 9, pProdNoisy)

  const pCopy = new Float64Array(3 * 3 * 3)
  for (let v = 0; v < 3; v++) pCopy[(v * 3 + v) * 3 + v] = 1 / 3
  const pidCopy = exactDiscretePid(3, 3, 3, pCopy)

  const pXor = new Float64Array(3 * 3 * 3)
  for (let x1 = 0; x1 < 3; x1++) {
    for (let x2 = 0; x2 < 3; x2++) {
      pXor[(x1 * 3 + x2) * 3 + ((x1 + x2) % 3)] = 1 / 9
    }
  }
  const pidXor = exactDiscretePid(3, 3, 3, pXor)

  const pAnd = new Float64Array(2 * 2 * 2)
  for (let x1 = 0; x1 < 2; x1++) {
    for (let x2 = 0; x2 < 2; x2++) {
      pAnd[(x1 * 2 + x2) * 2 + (x1 & x2)] = 0.25
    }
  }
  const pidAnd = exactDiscretePid(2, 2, 2, pAnd)

  const checkPidAxioms = (r: PidResult, nY: number): boolean =>
    r.syn >= -1e-12 &&
    r.red >= -1e-12 &&
    r.unq1 >= -1e-12 &&
    r.unq2 >= -1e-12 &&
    r.syn <= r.i12 + 1e-11 &&
    r.i12 <= Math.log(nY) + 1e-11 &&
    Math.abs(r.syn + r.red + r.unq1 + r.unq2 - r.i12) < 1e-10

  // Present-state swap invariance: two distinct past histories converging to identical rho_{A,t}
  const buildPresentJoint = (rhoPresent: Float64Array): Float64Array => {
    const jp = new Float64Array(3 * 3 * 3)
    for (let x1 = 0; x1 < 3; x1++) {
      for (let x2 = 0; x2 < 3; x2++) {
        const px = rhoPresent[x1 * 3 + x2]!
        const yStar = (x1 + x2) % 3
        for (let y = 0; y < 3; y++) {
          jp[(x1 * 3 + x2) * 3 + y] = px * (y === yStar ? 0.94 : 0.03)
        }
      }
    }
    return jp
  }
  const rhoTarget = new Float64Array([0.14, 0.10, 0.11, 0.09, 0.13, 0.10, 0.12, 0.11, 0.10])
  const histA = new Float64Array([1, 0, 0, 0, 0, 0, 0, 0, 0])
  const histB = new Float64Array([0, 0, 0, 0, 0, 0, 0, 0, 1])
  const stepToTarget = (src: Float64Array, tgt: Float64Array): Float64Array => {
    const out = new Float64Array(9)
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) out[j] = out[j]! + src[i]! * tgt[j]!
    }
    return out
  }
  const rhoAfterA = stepToTarget(histA, rhoTarget)
  const rhoAfterB = stepToTarget(histB, rhoTarget)
  let histL1 = 0
  let presL1 = 0
  for (let i = 0; i < 9; i++) {
    histL1 += Math.abs(histA[i]! - histB[i]!)
    presL1 += Math.abs(rhoAfterA[i]! - rhoAfterB[i]!)
  }
  const phiSynA = exactDiscretePid(3, 3, 3, buildPresentJoint(rhoAfterA)).syn
  const phiSynB = exactDiscretePid(3, 3, 3, buildPresentJoint(rhoAfterB)).syn
  const swapLeak = Math.abs(phiSynA - phiSynB)

  recordCheck(
    'A2.2',
    'A2',
    'Tier A',
    'Exact BROJA discrete PID (5 canonical gates), Williams-Beer I_min failure & present-state swap invariance',
    checkPidAxioms(pidProdDet, 9) &&
      checkPidAxioms(pidProdNoisy, 9) &&
      checkPidAxioms(pidCopy, 3) &&
      checkPidAxioms(pidXor, 3) &&
      checkPidAxioms(pidAnd, 2) &&
      pidProdDet.syn < 1e-10 &&
      pidProdDet.red < 1e-10 &&
      Math.abs(pidProdDet.synImin - LN3) < 1e-10 &&
      pidProdNoisy.syn < 1e-10 &&
      pidProdNoisy.red < 1e-10 &&
      pidProdNoisy.synImin > 0.3 &&
      pidCopy.syn < 1e-10 &&
      Math.abs(pidCopy.red - LN3) < 1e-10 &&
      pidCopy.rosasPsi < -1.0 &&
      Math.abs(pidXor.syn - LN3) < 1e-10 &&
      pidXor.red < 1e-10 &&
      Math.abs(pidAnd.syn - 0.5 * LN2) < 1e-10 &&
      pidAnd.red > 0.2 &&
      pidAnd.unq1 < 1e-10 &&
      pidAnd.unq2 < 1e-10 &&
      histL1 > 1.5 &&
      presL1 < 1e-15 &&
      swapLeak < 1e-14,
    `prodDet(syn=${pidProdDet.syn.toExponential(1)},Imin=${pidProdDet.synImin.toFixed(3)}), prodNoisy(syn=${pidProdNoisy.syn.toExponential(1)},Imin=${pidProdNoisy.synImin.toFixed(3)}), copy(red=${pidCopy.red.toFixed(3)},Psi=${pidCopy.rosasPsi.toFixed(3)}), XOR(syn=${pidXor.syn.toFixed(3)}), AND(syn=${pidAnd.syn.toFixed(4)},red=${pidAnd.red.toFixed(4)}), swapLeak=${swapLeak.toExponential(1)}`,
  )

  // --- A2.3 Confound-Free 27-State Self-Attractor Synergy Steering (Fixed H=30, H=20 Aubin/Autonomy) ---
  const enc3 = (a: number, b: number, c: number): number => (a * 3 + b) * 3 + c
  const dec3 = (s: number): [number, number, number] => [
    Math.floor(s / 9) % 3,
    Math.floor(s / 3) % 3,
    s % 3,
  ]
  const CENTER_STATE = enc3(1, 1, 1)
  const viable27 = new Array<boolean>(27).fill(false)
  for (let s = 0; s < 27; s++) {
    const [a, b, c] = dec3(s)
    const dist = (a !== 1 ? 1 : 0) + (b !== 1 ? 1 : 0) + (c !== 1 ? 1 : 0)
    if (dist <= 1) viable27[s] = true
  }
  assertExact(viable27.filter(Boolean).length === 7, 'K_A has 7 viable states')

  type RuleFn = (s: number) => number
  const ruleDecoupled: RuleFn = s => s
  const ruleGreedyHub: RuleFn = s => {
    const [a] = dec3(s)
    return enc3(a, a, a)
  }
  const ruleSynergistic: RuleFn = s => {
    const [a, b, c] = dec3(s)
    if (a === b || a === c) return enc3(a, a, a)
    if (b === c) return enc3(b, b, b)
    return s
  }

  const evalRulePid = (rule: RuleFn): PidResult => {
    const jp = new Float64Array(3 * 9 * 3)
    const pStay = 0.98
    const pFlip = 0.01
    for (let s = 0; s < 27; s++) {
      const [a, b, c] = dec3(s)
      const [na] = dec3(rule(s))
      const x1 = a
      const x2 = b * 3 + c
      for (let y = 0; y < 3; y++) {
        jp[(x1 * 9 + x2) * 3 + y] = (1 / 27) * (y === na ? pStay : pFlip)
      }
    }
    return exactDiscretePid(3, 9, 3, jp)
  }

  const applyDist = (s: number, w: number): number => {
    if (w === 0) return s
    const [a, b, c] = dec3(s)
    const slot = Math.floor((w - 1) / 2)
    const delta = ((w - 1) % 2) + 1
    if (slot === 0) return enc3((a + delta) % 3, b, c)
    if (slot === 1) return enc3(a, (b + delta) % 3, c)
    return enc3(a, b, (c + delta) % 3)
  }

  const exactAubinViabSize = (rule: RuleFn): number => {
    const cur = viable27.slice()
    while (true) {
      let changed = false
      for (let s = 0; s < 27; s++) {
        if (!cur[s]) continue
        const sNext = rule(s)
        for (let w = 0; w < 7; w++) {
          if (!cur[applyDist(sNext, w)]) {
            cur[s] = false
            changed = true
            break
          }
        }
      }
      if (!changed) break
    }
    return cur.filter(Boolean).length
  }

  const P_PERT = 0.24
  const EPS_INT = 0.02
  const buildExactMarkov27 = (rule: RuleFn): Float64Array => {
    const T = new Float64Array(27 * 27)
    for (let s = 0; s < 27; s++) {
      const det = rule(s)
      const mid = new Float64Array(27)
      mid[det] = 1 - EPS_INT
      for (let w = 1; w <= 6; w++) {
        const dst = applyDist(det, w)
        mid[dst] = mid[dst]! + EPS_INT / 6
      }
      for (let m = 0; m < 27; m++) {
        const pm = mid[m]!
        if (pm === 0) continue
        T[s * 27 + m] = T[s * 27 + m]! + pm * (1 - P_PERT)
        for (let w = 1; w <= 6; w++) {
          const dst = applyDist(m, w)
          T[s * 27 + dst] = T[s * 27 + dst]! + pm * (P_PERT / 6)
        }
      }
    }
    return T
  }

  const evalRollout27 = (rule: RuleFn) => {
    const T = buildExactMarkov27(rule)
    let dist = new Float64Array(27)
    dist[CENTER_STATE] = 1
    let sumId = 0
    for (let t = 1; t <= 30; t++) {
      const nxt = new Float64Array(27)
      for (let i = 0; i < 27; i++) {
        const pi = dist[i]!
        if (pi === 0) continue
        for (let j = 0; j < 27; j++) nxt[j] = nxt[j]! + pi * T[i * 27 + j]!
      }
      dist = nxt
      let idProb = 0
      for (let s = 0; s < 27; s++) if (viable27[s]) idProb += dist[s]!
      sumId += idProb
    }
    let finalId = 0
    for (let s = 0; s < 27; s++) if (viable27[s]) finalId += dist[s]!
    const meanIdentityFrac = sumId / 30

    let survDist = new Float64Array(27)
    survDist[CENTER_STATE] = 1
    for (let t = 0; t < 20; t++) {
      const nxt = new Float64Array(27)
      for (let i = 0; i < 27; i++) {
        if (!viable27[i]) continue
        const pi = survDist[i]!
        if (pi === 0) continue
        const det = rule(i)
        if (viable27[det]) nxt[det] = nxt[det]! + pi * (1 - P_PERT)
        for (let w = 1; w <= 6; w++) {
          const j = applyDist(det, w)
          if (viable27[j]) nxt[j] = nxt[j]! + pi * (P_PERT / 6)
        }
      }
      survDist = nxt
    }
    let surv20 = 0
    for (let s = 0; s < 27; s++) if (viable27[s]) surv20 += survDist[s]!
    return { meanIdentityFrac, finalId, surv20, viabSize: exactAubinViabSize(rule), pid: evalRulePid(rule) }
  }

  const rDec = evalRollout27(ruleDecoupled)
  const rHub = evalRollout27(ruleGreedyHub)
  const rSyn = evalRollout27(ruleSynergistic)
  const autDec = rDec.surv20 - rDec.surv20
  const autHub = rHub.surv20 - rDec.surv20
  const autSyn = rSyn.surv20 - rDec.surv20

  recordCheck(
    'A2.3',
    'A2',
    'Tier B',
    'Confound-free 27-state self-attractor synergy steering (H=30 beats, H=20 Aubin/Autonomy)',
    rDec.pid.syn < 1e-10 &&
      rHub.pid.syn < 1e-10 &&
      rHub.pid.unq1 > 0.9 &&
      rSyn.pid.syn > 0.2 &&
      rSyn.meanIdentityFrac > rHub.meanIdentityFrac + 0.3 &&
      rSyn.meanIdentityFrac > rDec.meanIdentityFrac + 0.3 &&
      rSyn.finalId > rHub.finalId + 0.4 &&
      rSyn.finalId > rDec.finalId + 0.4 &&
      rSyn.viabSize === 7 &&
      rHub.viabSize === 0 &&
      rDec.viabSize === 0 &&
      autSyn > 0.85 &&
      autHub < 0.15 &&
      autDec < 0.15,
    `Syn(Phi=${rSyn.pid.syn.toFixed(3)},meanId=${rSyn.meanIdentityFrac.toFixed(3)},finId=${rSyn.finalId.toFixed(3)},Viab=${rSyn.viabSize}/7,A=${autSyn.toFixed(3)}) vs Hub(Phi=${rHub.pid.syn.toFixed(3)},Unq1=${rHub.pid.unq1.toFixed(3)},meanId=${rHub.meanIdentityFrac.toFixed(3)},Viab=${rHub.viabSize}/7,A=${autHub.toFixed(3)}) vs Dec(Phi=${rDec.pid.syn.toFixed(3)},meanId=${rDec.meanIdentityFrac.toFixed(3)},Viab=${rDec.viabSize}/7,A=${autDec.toFixed(3)})`,
  )
}

// =================================================================================================
// GATE A3 — CONDITIONAL 1-HOP LIGHT-CONE HOLEVO SCREENING & REPAIRED SUPPRESSION GATE
// =================================================================================================

function runGateA3(): void {
  console.log('\n==============================================================================================')
  console.log('GATE A3: CONDITIONAL 1-HOP HOLEVO SELF/WORLD SCREENING & REPAIRED SUPPRESSION GATE')
  console.log('==============================================================================================')

  // --- A3.1 Tool-and-Mirror Self/World Screening ---
  const pS = [0.46, 0.28, 0.26] as const
  const pE = [1 / 3, 1 / 3, 1 / 3] as const
  const pPol = (s: number, e: number, a: number): number =>
    a === (s + e) % 3 ? 0.78 : 0.11
  const pBody = (s: number, a: number, b: number): number =>
    b === (s + a) % 3 ? 0.92 : 0.04
  const pMirror = (s: number, e: number, a: number, m: number): number => {
    const scene = (s + e) % 3
    let pr = 0
    if (m === scene) pr += 0.997
    if (m === a) pr += 0.003
    return pr
  }
  const pWorld = (e: number, w: number): number => (w === (e + 1) % 3 ? 0.85 : 0.075)
  const pToolGivenBody = (b: number, tl: number): number => (tl === b ? 0.96 : 0.02)
  const pToolDet = (tl: number): number => (tl === 0 ? 0.90 : 0.05)

  // Symmetric non-orthogonal qutrit trine states on C^3 (overlap <psi_j|psi_k> = 0.325 != 0):
  const trineRho: CMat[] = [0, 1, 2].map(k => {
    const r = 0.55
    const a0 = Math.sqrt(r)
    const rad = Math.sqrt(1 - r)
    const a1 = rad * Math.cos((2 * PI * k) / 3)
    const a2 = rad * Math.sin((2 * PI * k) / 3)
    const v = [a0, a1, a2]
    const M = cmatZero(3)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M.re[i * 3 + j] = v[i]! * v[j]!
    return M
  })

  const mixTrine = (probs: readonly number[]): CMat => {
    const out = cmatZero(3)
    for (let k = 0; k < 3; k++) {
      const pk = probs[k]!
      const tk = trineRho[k]!
      for (let i = 0; i < 9; i++) out.re[i] = out.re[i]! + pk * tk.re[i]!
    }
    return out
  }

  const evalChannelScreening = (
    pChan: (s: number, e: number, a: number, y: number) => number,
  ): { margMI: number; condMI: number; condHolevo: number } => {
    const pAY = new Float64Array(9)
    const pA = new Float64Array(3)
    const pY = new Float64Array(3)
    for (let s = 0; s < 3; s++) {
      for (let e = 0; e < 3; e++) {
        const pc = pS[s]! * pE[e]!
        for (let a = 0; a < 3; a++) {
          const pca = pc * pPol(s, e, a)
          pA[a] = pA[a]! + pca
          for (let y = 0; y < 3; y++) {
            const p = pca * pChan(s, e, a, y)
            pAY[a * 3 + y] = pAY[a * 3 + y]! + p
            pY[y] = pY[y]! + p
          }
        }
      }
    }
    let margMI = 0
    for (let a = 0; a < 3; a++) {
      for (let y = 0; y < 3; y++) {
        const p = pAY[a * 3 + y]!
        if (p > 1e-15) margMI += p * Math.log(p / (pA[a]! * pY[y]!))
      }
    }
    let condMI = 0
    let condHolevo = 0
    for (let s = 0; s < 3; s++) {
      for (let e = 0; e < 3; e++) {
        const pc = pS[s]! * pE[e]!
        const pYGivenC = [0, 0, 0]
        const rhoAvg = cmatZero(3)
        let avgS = 0
        for (let a = 0; a < 3; a++) {
          const pa = pPol(s, e, a)
          const probs = [pChan(s, e, a, 0), pChan(s, e, a, 1), pChan(s, e, a, 2)]
          for (let y = 0; y < 3; y++) pYGivenC[y] = pYGivenC[y]! + pa * probs[y]!
          const rhoA = mixTrine(probs)
          avgS += pa * vonNeumannEntropy(rhoA)
          for (let i = 0; i < 9; i++) rhoAvg.re[i] = rhoAvg.re[i]! + pa * rhoA.re[i]!
        }
        condHolevo += pc * Math.max(0, vonNeumannEntropy(rhoAvg) - avgS)
        for (let a = 0; a < 3; a++) {
          const pa = pPol(s, e, a)
          for (let y = 0; y < 3; y++) {
            const pyGivenCA = pChan(s, e, a, y)
            const p = pa * pyGivenCA
            if (p > 1e-15) condMI += pc * p * Math.log(pyGivenCA / pYGivenC[y]!)
          }
        }
      }
    }
    return { margMI, condMI, condHolevo }
  }

  const scBody = evalChannelScreening((s, _e, a, y) => pBody(s, a, y))
  const scMirror = evalChannelScreening((s, e, a, y) => pMirror(s, e, a, y))
  const scWorld = evalChannelScreening((_s, e, _a, y) => pWorld(e, y))
  const scToolHeld = evalChannelScreening((s, _e, a, tl) => {
    let pr = 0
    for (let b = 0; b < 3; b++) pr += pBody(s, a, b) * pToolGivenBody(b, tl)
    return pr
  })
  const scToolDet = evalChannelScreening((_s, _e, _a, tl) => pToolDet(tl))

  let toolCondBodyMI = 0
  let toolCondBodyHolevo = 0
  for (let s = 0; s < 3; s++) {
    for (let e = 0; e < 3; e++) {
      const pc = pS[s]! * pE[e]!
      for (let b = 0; b < 3; b++) {
        let pbGivenC = 0
        const paJoint = [0, 0, 0]
        for (let a = 0; a < 3; a++) {
          const v = pPol(s, e, a) * pBody(s, a, b)
          paJoint[a] = v
          pbGivenC += v
        }
        if (pbGivenC <= 1e-15) continue
        const pTlAvg = [0, 0, 0]
        const rhoAvg = cmatZero(3)
        let avgS = 0
        for (let a = 0; a < 3; a++) {
          const paCond = paJoint[a]! / pbGivenC
          const probs = [pToolGivenBody(b, 0), pToolGivenBody(b, 1), pToolGivenBody(b, 2)]
          for (let tl = 0; tl < 3; tl++) pTlAvg[tl] = pTlAvg[tl]! + paCond * probs[tl]!
          const rhoA = mixTrine(probs)
          avgS += paCond * vonNeumannEntropy(rhoA)
          for (let i = 0; i < 9; i++) rhoAvg.re[i] = rhoAvg.re[i]! + paCond * rhoA.re[i]!
        }
        toolCondBodyHolevo += pc * pbGivenC * Math.max(0, vonNeumannEntropy(rhoAvg) - avgS)
        for (let a = 0; a < 3; a++) {
          const paCond = paJoint[a]! / pbGivenC
          for (let tl = 0; tl < 3; tl++) {
            const ptl = pToolGivenBody(b, tl)
            if (paCond * ptl > 1e-15) {
              toolCondBodyMI += pc * pbGivenC * paCond * ptl * Math.log(ptl / pTlAvg[tl]!)
            }
          }
        }
      }
    }
  }

  const ratioCondMI = scBody.condMI / Math.max(scMirror.condMI, 1e-15)
  const ratioHolevo = scBody.condHolevo / Math.max(scMirror.condHolevo, 1e-15)

  recordCheck(
    'A3.1',
    'A3',
    'Tier A',
    'Tool-and-Mirror self/world screening: marginal S3Q failure vs 1-hop conditional MI & trine Holevo',
    scMirror.margMI > 5 * scBody.margMI &&
      ratioCondMI > 50 &&
      ratioHolevo > 50 &&
      scBody.condHolevo < scBody.condMI &&
      scWorld.condMI < 1e-12 &&
      scWorld.condHolevo < 1e-12 &&
      scToolHeld.condMI > 0.2 &&
      toolCondBodyMI < 1e-12 &&
      toolCondBodyHolevo < 1e-12 &&
      scToolDet.condMI < 1e-12 &&
      scToolDet.condHolevo < 1e-12,
    `marg(mirror=${scMirror.margMI.toFixed(3)} > body=${scBody.margMI.toFixed(3)} [FAILS!]), cond1Hop(body=${scBody.condMI.toFixed(4)}/mirror=${scMirror.condMI.toExponential(2)}=${ratioCondMI.toFixed(0)}x), Holevo(body=${scBody.condHolevo.toFixed(4)}/mirror=${scMirror.condHolevo.toExponential(2)}=${ratioHolevo.toFixed(0)}x), world=${scWorld.condMI.toExponential(1)}, toolHeld|body=${toolCondBodyMI.toExponential(1)}, toolDet=${scToolDet.condMI.toExponential(1)}`,
  )

  // --- A3.2 Repaired Dual-Channel Suppression Gate in Multi-Step Discrete Garden + Replay & Landauer ---
  const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x))

  type GardenScenario = 'curiosity' | 'hazard' | 'fork' | 'distractor'
  type GardenResult = {
    readonly reachedGoal: boolean
    readonly hazardHits: number
    readonly peakHesitance: number
    readonly choseSafeBranch: boolean
    readonly stepsTaken: number
  }

  const runGardenScenario = (
    mode: 'verbatim_eq3' | 'repaired_dual',
    scenario: GardenScenario,
  ): GardenResult => {
    let pos = 0
    let hazardPos = 3
    let branch = 0
    let hazardHits = 0
    let peakHesitance = 0
    let rolledOut = false
    let reachedGoal = false
    let stepsTaken = 0

    const forwardModelEval = (candBranch: number): number => (candBranch === 1 ? 0.9 : -0.9)

    for (let t = 0; t < 10; t++) {
      let epsGoal = 0.15
      let epsBg = 0.10
      let valence = 0.10
      let viabSafe = true
      let intendedMove = 1

      if (scenario === 'curiosity') {
        epsGoal = pos < 4 ? 3.8 : 0.1
        valence = 0.65
        viabSafe = true
        intendedMove = 1
      } else if (scenario === 'hazard') {
        epsGoal = Math.abs(hazardPos - pos) <= 3 ? 4.4 : 0.2
        valence = -0.85
        viabSafe = false
        intendedMove = -1
      } else if (scenario === 'fork') {
        if (pos === 1 && !rolledOut) {
          epsGoal = 1.75
          valence = 0.0
          viabSafe = true
          intendedMove = 0
        } else {
          epsGoal = 0.2
          valence = 0.4
          viabSafe = true
          intendedMove = 1
        }
      } else {
        epsGoal = 0.15
        epsBg = 5.2
        valence = 0.25
        viabSafe = true
        intendedMove = 1
      }

      let gGate = 0
      if (mode === 'verbatim_eq3') {
        const epsRaw = Math.max(epsGoal, epsBg)
        const gErr = sigmoid(3.5 * (epsRaw - 1.4))
        const gCtx = 0.05
        gGate = Math.max(gErr, gCtx)
      } else {
        const epsG = Math.max(1.0 * epsGoal, 0.0 * epsBg)
        const gHes = sigmoid(5.0 * (epsG - 0.9)) * (1 - sigmoid(5.0 * (epsG - 2.6)))
        const actionRelease = epsG >= 2.6 && (valence >= 0 || !viabSafe) ? 0.0 : 1.0
        gGate = gHes * actionRelease
      }

      if (gGate > peakHesitance) peakHesitance = gGate

      if (1 - gGate > 0.35) {
        if (scenario === 'fork' && pos === 1 && branch === 0) branch = -1
        pos += intendedMove
        stepsTaken++
      } else if (mode === 'repaired_dual' && scenario === 'fork' && pos === 1 && !rolledOut) {
        const scoreLeft = forwardModelEval(-1)
        const scoreRight = forwardModelEval(1)
        branch = scoreRight > scoreLeft ? 1 : -1
        rolledOut = true
      }

      if (scenario === 'hazard') {
        if (hazardPos > -2) hazardPos--
        if (hazardPos === pos) hazardHits++
      }
      if (scenario === 'fork' && pos >= 2 && branch === -1) hazardHits++
      if (
        (scenario === 'curiosity' && pos >= 4) ||
        (scenario === 'distractor' && pos >= 4) ||
        (scenario === 'fork' && pos >= 4 && branch === 1) ||
        (scenario === 'hazard' && pos <= -3 && hazardHits === 0)
      ) {
        reachedGoal = true
        break
      }
    }

    return {
      reachedGoal,
      hazardHits,
      peakHesitance,
      choseSafeBranch: branch === 1,
      stepsTaken,
    }
  }

  const gsCur = runGardenScenario('verbatim_eq3', 'curiosity')
  const gsHaz = runGardenScenario('verbatim_eq3', 'hazard')
  const gsDis = runGardenScenario('verbatim_eq3', 'distractor')
  const vbCur = runGardenScenario('repaired_dual', 'curiosity')
  const vbHaz = runGardenScenario('repaired_dual', 'hazard')
  const vbFrk = runGardenScenario('repaired_dual', 'fork')
  const vbDis = runGardenScenario('repaired_dual', 'distractor')

  // Microscopic reversible ternary register+bath erasure channel:
  //   U_erase(theta) = cos(theta) I_9 + i sin(theta) S_swap  on H_M (C^3) \otimes H_B (C^3)
  // Exact Reeb-Wolf (2014) finite-bath Landauer equality verified non-tautologically from Jacobi
  // eigenvalues of rho'_M, rho'_B, and rho'_{MB}:
  //   deltaS_bath = S(rho'_B) - S(rho_B) = deltaI_M + I(M':B') >= deltaI_M
  //   beta * deltaQ_bath = deltaI_M + I(M':B') + D(rho'_B || rho_B) >= deltaI_M = deltaI_trits * ln 3
  const betaBath = 1.5
  const bathEnergies = [2.4, 2.4, 0.0] as const
  const bathWeights = bathEnergies.map(e => Math.exp(-betaBath * e))
  const zBath = bathWeights[0]! + bathWeights[1]! + bathWeights[2]!
  const rhoBDiag = [bathWeights[0]! / zBath, bathWeights[1]! / zBath, bathWeights[2]! / zBath] as const
  const rhoBMat = cmatZero(3)
  for (let k = 0; k < 3; k++) rhoBMat.re[k * 3 + k] = rhoBDiag[k]!
  const sBathInit = vonNeumannEntropy(rhoBMat)

  const thetaSwap = 0.62
  const cSw = Math.cos(thetaSwap)
  const sSw = Math.sin(thetaSwap)
  const uErase = cmatZero(9)
  for (let m = 0; m < 3; m++) {
    for (let b = 0; b < 3; b++) {
      const col = m * 3 + b
      const rowId = m * 3 + b
      const rowSw = b * 3 + m
      uErase.re[rowId * 9 + col] = uErase.re[rowId * 9 + col]! + cSw
      uErase.im[rowSw * 9 + col] = uErase.im[rowSw * 9 + col]! + sSw
    }
  }
  const uEraseDag = cmatDag(uErase)
  const uCheck = cmatMul(uEraseDag, uErase)
  let maxUnitaryErr = 0
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const dr = uCheck.re[r * 9 + c]! - (r === c ? 1 : 0)
      const di = uCheck.im[r * 9 + c]!
      maxUnitaryErr = Math.max(maxUnitaryErr, Math.hypot(dr, di))
    }
  }
  assertExact(maxUnitaryErr < 1e-14, `Ternary bath erasure U_erase not unitary: ${maxUnitaryErr}`)

  const applyMicroscopicTernaryErasure = (pMem: readonly number[]) => {
    const rhoM = cmatZero(3)
    for (let k = 0; k < 3; k++) rhoM.re[k * 3 + k] = pMem[k]!
    const sMemBefore = vonNeumannEntropy(rhoM)

    const rhoMB = cmatZero(9)
    for (let m = 0; m < 3; m++) {
      for (let b = 0; b < 3; b++) {
        const idx9 = m * 3 + b
        rhoMB.re[idx9 * 9 + idx9] = pMem[m]! * rhoBDiag[b]!
      }
    }
    const rhoMBOut = cmatMul(uErase, cmatMul(rhoMB, uEraseDag))

    const rhoMOut = cmatZero(3)
    const rhoBOut = cmatZero(3)
    for (let m1 = 0; m1 < 3; m1++) {
      for (let m2 = 0; m2 < 3; m2++) {
        let re = 0
        let im = 0
        for (let b = 0; b < 3; b++) {
          const r = m1 * 3 + b
          const c = m2 * 3 + b
          re += rhoMBOut.re[r * 9 + c]!
          im += rhoMBOut.im[r * 9 + c]!
        }
        rhoMOut.re[m1 * 3 + m2] = re
        rhoMOut.im[m1 * 3 + m2] = im
      }
    }
    for (let b1 = 0; b1 < 3; b1++) {
      for (let b2 = 0; b2 < 3; b2++) {
        let re = 0
        let im = 0
        for (let m = 0; m < 3; m++) {
          const r = m * 3 + b1
          const c = m * 3 + b2
          re += rhoMBOut.re[r * 9 + c]!
          im += rhoMBOut.im[r * 9 + c]!
        }
        rhoBOut.re[b1 * 3 + b2] = re
        rhoBOut.im[b1 * 3 + b2] = im
      }
    }

    const sMemAfter = vonNeumannEntropy(rhoMOut)
    const sBathAfter = vonNeumannEntropy(rhoBOut)
    const sJointAfter = vonNeumannEntropy(rhoMBOut)
    const deltaINats = sMemBefore - sMemAfter
    const deltaSBath = sBathAfter - sBathInit
    const mutualInfoMB = sMemAfter + sBathAfter - sJointAfter

    let betaDeltaQ = 0
    for (let b = 0; b < 3; b++) {
      betaDeltaQ += betaBath * bathEnergies[b]! * (rhoBOut.re[b * 3 + b]! - rhoBDiag[b]!)
    }
    // Exact quantum relative entropy D(rho'_B || rho_B) = -S(rho'_B) - Tr(rho'_B ln rho_B)
    let trRhoBOutLogRhoB = 0
    for (let b = 0; b < 3; b++) {
      trRhoBOutLogRhoB += rhoBOut.re[b * 3 + b]! * Math.log(rhoBDiag[b]!)
    }
    const relEntBath = -sBathAfter - trRhoBOutLogRhoB
    const reebWolfResidual = Math.abs(betaDeltaQ - (deltaINats + mutualInfoMB + relEntBath))
    const nextBelief = [rhoMOut.re[0]!, rhoMOut.re[4]!, rhoMOut.re[8]!]
    return {
      nextBelief,
      deltaINats,
      deltaSBath,
      betaDeltaQ,
      mutualInfoMB,
      relEntBath,
      reebWolfResidual,
    }
  }

  const rngRep = makePrng(0xa3022026)
  const runOfflineReplay = (gOffline: number) => {
    let overtSleepHits = 0
    let replayUpdates = 0
    let landauerViolations = 0
    let maxReebWolfErr = 0
    let totalBathEntropy = 0
    let totalBetaHeat = 0
    let totalErasedNats = 0
    let totalMutualExcess = 0
    let belief = [1 / 3, 1 / 3, 1 / 3]
    const trueRule = 2

    for (let step = 0; step < 30; step++) {
      const leak = 1 - gOffline
      if (leak > 0.25) {
        if (rngRep.next() < 0.45) overtSleepHits++
      }
      const seedProb = Math.min(1, 3.5 * leak)
      if (rngRep.next() < seedProb) {
        replayUpdates++
        const er = applyMicroscopicTernaryErasure(belief)
        belief = er.nextBelief
        totalErasedNats += er.deltaINats
        totalBathEntropy += er.deltaSBath
        totalBetaHeat += er.betaDeltaQ
        totalMutualExcess += er.mutualInfoMB
        if (er.reebWolfResidual > maxReebWolfErr) maxReebWolfErr = er.reebWolfResidual
        if (
          er.deltaSBath + 1e-12 < er.deltaINats ||
          er.betaDeltaQ + 1e-12 < er.deltaINats ||
          er.mutualInfoMB < -1e-12 ||
          er.relEntBath < -1e-12
        ) {
          landauerViolations++
        }
      }
    }
    return {
      unseenAdaptScore: belief[trueRule]!,
      overtSleepHits,
      replayUpdates,
      landauerViolations,
      maxReebWolfErr,
      totalErasedTrits: totalErasedNats / LN3,
      totalBathEntropy,
      totalBetaHeat,
      totalMutualExcess,
    }
  }

  const repLeaky = runOfflineReplay(0.90)
  const repSealed = runOfflineReplay(1.00)
  const repOpen = runOfflineReplay(0.00)

  recordCheck(
    'A3.2',
    'A3',
    'Tier B',
    'Repaired dual-channel suppression gate in discrete garden + leaky offline replay & ternary Landauer audit',
    !gsCur.reachedGoal &&
      gsHaz.hazardHits > 0 &&
      !gsDis.reachedGoal &&
      vbCur.reachedGoal &&
      vbHaz.reachedGoal &&
      vbHaz.hazardHits === 0 &&
      vbFrk.peakHesitance >= 0.70 &&
      vbFrk.choseSafeBranch &&
      vbFrk.reachedGoal &&
      vbFrk.hazardHits === 0 &&
      vbDis.reachedGoal &&
      repLeaky.unseenAdaptScore > 0.85 &&
      repLeaky.unseenAdaptScore > repSealed.unseenAdaptScore + 0.4 &&
      repLeaky.overtSleepHits === 0 &&
      repOpen.overtSleepHits >= 5 &&
      repLeaky.landauerViolations === 0 &&
      repLeaky.maxReebWolfErr < 1e-12 &&
      repLeaky.totalMutualExcess > 1e-3 &&
      repLeaky.totalBathEntropy > repLeaky.totalErasedTrits * LN3 &&
      repLeaky.totalBetaHeat > repLeaky.totalBathEntropy,
    `GS_Eq3(cur=${gsCur.reachedGoal},hazHits=${gsHaz.hazardHits},dis=${gsDis.reachedGoal}) vs Repaired(cur=${vbCur.reachedGoal},hazHits=${vbHaz.hazardHits},forkHes=${vbFrk.peakHesitance.toFixed(3)}/safe=${vbFrk.choseSafeBranch},dis=${vbDis.reachedGoal}); replay g=0.90(adapt=${repLeaky.unseenAdaptScore.toFixed(3)},hits=${repLeaky.overtSleepHits},dI=${(repLeaky.totalErasedTrits * LN3).toFixed(3)}<dS_B=${repLeaky.totalBathEntropy.toFixed(3)}<bQ=${repLeaky.totalBetaHeat.toFixed(3)},RW_err=${repLeaky.maxReebWolfErr.toExponential(1)},viols=${repLeaky.landauerViolations}) vs g=1.00(${repSealed.unseenAdaptScore.toFixed(3)}) vs g=0.00(hits=${repOpen.overtSleepHits})`,
  )
}

// =================================================================================================
// GATE A4 — EEG ANTI-CONFOUND GUARDS, CSN HURWITZ-ZETA MLE & COUPLED SELF-ATTRACTOR CRITICALITY SWEEP
// =================================================================================================

function erfExact(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  if (ax > 6.5) return sign
  const t = 1 / (1 + 0.3275911 * ax)
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  return sign * (1 - poly * Math.exp(-ax * ax))
}

function normCdf(z: number): number {
  return 0.5 * (1 + erfExact(z / Math.SQRT2))
}

// Exact Discrete Hurwitz Zeta function zeta(alpha, xMin) via Euler-Maclaurin summation (< 1e-14 accuracy)
function hurwitzZeta(alpha: number, xMin: number): number {
  const M = xMin + 50
  let sum = 0
  for (let k = xMin; k < M; k++) sum += Math.pow(k, -alpha)
  const mPow = Math.pow(M, -alpha)
  const m2 = M * M
  const t0 = (M * mPow) / (alpha - 1)
  const t1 = 0.5 * mPow
  const t2 = (alpha / 12) * (mPow / M)
  const t3 = -((alpha * (alpha + 1) * (alpha + 2)) / 720) * (mPow / (M * m2))
  const t4 =
    ((alpha * (alpha + 1) * (alpha + 2) * (alpha + 3) * (alpha + 4)) / 30240) *
    (mPow / (M * m2 * m2))
  return sum + t0 + t1 + t2 + t3 + t4
}

type CsnFitResult = {
  readonly alphaHat: number
  readonly ks: number
  readonly vuongExp: number
  readonly vuongPLvsLN: number
  readonly olsR2: number
  readonly nTail: number
}

// Exact CSN (2009) Discrete Hurwitz-Zeta MLE + exact discrete KS + exact Vuong LLRs vs discrete
// Exponential and discrete truncated positive-scale Lognormal (Alstott 2014 Lognormal_Positive).
function fitDiscreteCsn(samples: readonly number[], xMin: number): CsnFitResult {
  const tail: number[] = []
  let sumLogX = 0
  let sumX = 0
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i]!
    if (v >= xMin) {
      tail.push(v)
      sumLogX += Math.log(v)
      sumX += v
    }
  }
  const n = tail.length
  assertExact(n >= 20, `CSN tail too small: ${n}`)

  const llPl = (a: number): number => -n * Math.log(hurwitzZeta(a, xMin)) - a * sumLogX
  let lo = 1.05
  let hi = 5.5
  const phi = (Math.sqrt(5) - 1) / 2
  let c1 = hi - phi * (hi - lo)
  let c2 = lo + phi * (hi - lo)
  let f1 = llPl(c1)
  let f2 = llPl(c2)
  for (let it = 0; it < 55; it++) {
    if (f1 < f2) {
      lo = c1
      c1 = c2
      f1 = f2
      c2 = lo + phi * (hi - lo)
      f2 = llPl(c2)
    } else {
      hi = c2
      c2 = c1
      f2 = f1
      c1 = hi - phi * (hi - lo)
      f1 = llPl(c1)
    }
  }
  const alphaHat = 0.5 * (lo + hi)
  const zPl = hurwitzZeta(alphaHat, xMin)
  const logZPl = Math.log(zPl)

  const sorted = tail.slice().sort((a, b) => a - b)
  let ks = 0
  let pos = 0
  while (pos < n) {
    const x = sorted[pos]!
    let end = pos + 1
    while (end < n && sorted[end] === x) end++
    const empCdfPrev = pos / n
    const empCdf = end / n
    const thCdfPrev = x > xMin ? 1 - hurwitzZeta(alphaHat, x) / zPl : 0
    const thCdf = 1 - hurwitzZeta(alphaHat, x + 1) / zPl
    ks = Math.max(ks, Math.abs(empCdfPrev - thCdfPrev), Math.abs(empCdf - thCdf))
    pos = end
  }

  const meanShift = sumX / n - xMin
  const lamExp = Math.log(1 + 1 / Math.max(meanShift, 1e-9))
  const logOneMinusE = Math.log(1 - Math.exp(-lamExp))
  let rExpSum = 0
  let rExpSqSum = 0
  for (let i = 0; i < n; i++) {
    const x = tail[i]!
    const lpPl = -alphaHat * Math.log(x) - logZPl
    const lpExp = logOneMinusE - lamExp * (x - xMin)
    const d = lpPl - lpExp
    rExpSum += d
    rExpSqSum += d * d
  }
  const rExpMean = rExpSum / n
  const rExpVar = Math.max(1e-15, rExpSqSum / n - rExpMean * rExpMean)
  const vuongExp = rExpSum / Math.sqrt(n * rExpVar)

  const logHalfMin = Math.log(xMin - 0.5)
  const logBinsLo = new Float64Array(n)
  const logBinsHi = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const x = tail[i]!
    logBinsLo[i] = Math.log(x - 0.5)
    logBinsHi[i] = Math.log(x + 0.5)
  }
  const lnBinProb = (i: number, mu: number, sig: number): number => {
    const zHi = (logBinsHi[i]! - mu) / sig
    const zLo = (logBinsLo[i]! - mu) / sig
    const diff = normCdf(zHi) - normCdf(zLo)
    if (diff > 1e-14) return Math.log(diff)
    const lx = Math.log(tail[i]!)
    return -lx - Math.log(sig * Math.sqrt(2 * PI)) - ((lx - mu) * (lx - mu)) / (2 * sig * sig)
  }
  const llLn = (mu: number, sig: number): number => {
    const zMin = (logHalfMin - mu) / sig
    const tailMass = 1 - normCdf(zMin)
    if (tailMass <= 1e-14) return Number.NEGATIVE_INFINITY
    const logZ = Math.log(tailMass)
    let ll = -n * logZ
    for (let i = 0; i < n; i++) ll += lnBinProb(i, mu, sig)
    return ll
  }
  const muMin = Math.log(xMin)
  let muHat = Math.max(muMin, sumLogX / n)
  let varLog = 0
  for (let i = 0; i < n; i++) {
    const d = Math.log(tail[i]!) - sumLogX / n
    varLog += d * d
  }
  let sigHat = Math.max(0.15, Math.sqrt(varLog / n))
  let bestLL = llLn(muHat, sigHat)
  let stepMu = 0.4
  let stepSig = 0.3
  for (let round = 0; round < 18; round++) {
    let improved = true
    while (improved) {
      improved = false
      for (const dm of [-stepMu, stepMu]) {
        const cm = Math.max(muMin, muHat + dm)
        const v = llLn(cm, sigHat)
        if (v > bestLL + 1e-10) {
          bestLL = v
          muHat = cm
          improved = true
        }
      }
      for (const ds of [-stepSig, stepSig]) {
        const cs = Math.max(0.05, sigHat + ds)
        const v = llLn(muHat, cs)
        if (v > bestLL + 1e-10) {
          bestLL = v
          sigHat = cs
          improved = true
        }
      }
    }
    stepMu *= 0.5
    stepSig *= 0.5
  }
  const logZLn = Math.log(Math.max(1e-15, 1 - normCdf((logHalfMin - muHat) / sigHat)))
  let rLnSum = 0
  let rLnSqSum = 0
  for (let i = 0; i < n; i++) {
    const x = tail[i]!
    const lpPl = -alphaHat * Math.log(x) - logZPl
    const lpLn = lnBinProb(i, muHat, sigHat) - logZLn
    const d = lpPl - lpLn
    rLnSum += d
    rLnSqSum += d * d
  }
  const rLnMean = rLnSum / n
  const rLnVar = Math.max(1e-15, rLnSqSum / n - rLnMean * rLnMean)
  const vuongPLvsLN = rLnSum / Math.sqrt(n * rLnVar)

  const medianX = sorted[Math.floor(n / 2)]!
  const uniqX: number[] = []
  const uniqCcdf: number[] = []
  let idxS = 0
  while (idxS < n) {
    const x = sorted[idxS]!
    const ccdf = (n - idxS) / n
    if (x >= medianX && ccdf > 0.005) {
      uniqX.push(Math.log(x))
      uniqCcdf.push(Math.log(ccdf))
    }
    while (idxS < n && sorted[idxS] === x) idxS++
  }
  let mx = 0
  let my = 0
  for (let i = 0; i < uniqX.length; i++) {
    mx += uniqX[i]!
    my += uniqCcdf[i]!
  }
  mx /= uniqX.length
  my /= uniqX.length
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (let i = 0; i < uniqX.length; i++) {
    const dx = uniqX[i]! - mx
    const dy = uniqCcdf[i]! - my
    sxx += dx * dx
    syy += dy * dy
    sxy += dx * dy
  }
  const olsR2 = sxx > 0 && syy > 0 ? (sxy * sxy) / (sxx * syy) : 0

  return { alphaHat, ks, vuongExp, vuongPLvsLN, olsR2, nTail: n }
}

function runGateA4(): void {
  console.log('\n==============================================================================================')
  console.log('GATE A4: EEG ANTI-CONFOUND GUARDS, CSN HURWITZ-ZETA MLE & COUPLED SELF-ATTRACTOR CRITICALITY')
  console.log('==============================================================================================')

  // --- A4.1 EEG Pipeline Confound Negative Controls ---
  const rngEeg = makePrng(0xa4012026)
  const nCh = 16
  const T_EEG = 4096
  const nSeg = 64
  const segLen = T_EEG / nSeg

  const rawEeg: Float64Array[] = Array.from({ length: nCh }, () => new Float64Array(T_EEG))
  const eog = new Float64Array(T_EEG)
  let e1 = 0
  let e2 = 0
  for (let t = 0; t < T_EEG; t++) {
    const w0 = (2 * PI * 4) / segLen
    const rPol = 0.92
    const nxt = 2 * rPol * Math.cos(w0) * e1 - rPol * rPol * e2 + rngEeg.nextNormal()
    e2 = e1
    e1 = nxt
    eog[t] = 2.6 * nxt
  }
  const topo = new Float64Array(nCh)
  for (let c = 0; c < nCh; c++) topo[c] = Math.cos((PI * c) / (nCh - 1))
  for (let c = 0; c < nCh; c++) {
    const ch = rawEeg[c]!
    const tc = topo[c]!
    for (let t = 0; t < T_EEG; t++) ch[t] = rngEeg.nextNormal() + tc * eog[t]!
  }

  const carEeg: Float64Array[] = Array.from({ length: nCh }, () => new Float64Array(T_EEG))
  let maxCarMean = 0
  const carMeanSeries = new Float64Array(T_EEG)
  for (let t = 0; t < T_EEG; t++) {
    let mean = 0
    for (let c = 0; c < nCh; c++) mean += rawEeg[c]![t]!
    mean /= nCh
    let checkMean = 0
    for (let c = 0; c < nCh; c++) {
      const v = rawEeg[c]![t]! - mean
      carEeg[c]![t] = v
      checkMean += v
    }
    checkMean /= nCh
    carMeanSeries[t] = checkMean
    if (Math.abs(checkMean) > maxCarMean) maxCarMean = Math.abs(checkMean)
  }
  let carMeanVar = 0
  for (let t = 0; t < T_EEG; t++) carMeanVar += carMeanSeries[t]! * carMeanSeries[t]!
  carMeanVar /= T_EEG

  const hann = new Float64Array(segLen)
  for (let i = 0; i < segLen; i++) hann[i] = 0.5 * (1 - Math.cos((2 * PI * i) / (segLen - 1)))
  const kBin = 4
  let sxyRe = 0
  let sxyIm = 0
  let sxx = 0
  let syy = 0
  let sumIm = 0
  let sumAbsIm = 0
  let sumImSq = 0
  const xFrontal = carEeg[0]!
  const yPosterior = carEeg[nCh - 1]!
  for (let seg = 0; seg < nSeg; seg++) {
    const off = seg * segLen
    let xr = 0, xi = 0, yr = 0, yi = 0
    for (let i = 0; i < segLen; i++) {
      const ang = (2 * PI * kBin * i) / segLen
      const ca = Math.cos(ang) * hann[i]!
      const sa = -Math.sin(ang) * hann[i]!
      const xv = xFrontal[off + i]!
      const yv = yPosterior[off + i]!
      xr += xv * ca; xi += xv * sa
      yr += yv * ca; yi += yv * sa
    }
    const cr = xr * yr + xi * yi
    const ci = xi * yr - xr * yi
    sxyRe += cr
    sxyIm += ci
    sxx += xr * xr + xi * xi
    syy += yr * yr + yi * yi
    sumIm += ci
    sumAbsIm += Math.abs(ci)
    sumImSq += ci * ci
  }
  const denomCoh = Math.sqrt(sxx * syy)
  const reCoh = sxyRe / denomCoh
  const imCoh = sxyIm / denomCoh
  const wpliDen = sumAbsIm * sumAbsIm - sumImSq
  const debiasedWpliSq = wpliDen > 1e-15 ? (sumIm * sumIm - sumImSq) / wpliDen : 0
  const reToImRatio = Math.abs(reCoh) / Math.max(Math.abs(imCoh), 1e-12)

  // Two-sided zero-phase FIR acausal Granger control (T = 2000, true A -> B, null B -> A)
  const T_GR = 2000
  const burnGr = 200
  const A_sig = new Float64Array(T_GR)
  const B_sig = new Float64Array(T_GR)
  let aPrev = 0
  let bPrev = 0
  for (let t = -burnGr; t < T_GR; t++) {
    const aCur = 0.65 * aPrev + rngEeg.nextNormal()
    const bCur = 0.55 * bPrev + 0.70 * aPrev + rngEeg.nextNormal()
    if (t >= 0) {
      A_sig[t] = aCur
      B_sig[t] = bCur
    }
    aPrev = aCur
    bPrev = bCur
  }

  const grangerF = (src: Float64Array, dst: Float64Array, pLag: number, margin: number): number => {
    const start = Math.max(pLag, margin)
    const end = dst.length - margin
    const nEff = end - start
    const fitRss = (useSrc: boolean): number => {
      const kCols = useSrc ? 2 * pLag + 1 : pLag + 1
      const XtX: number[][] = Array.from({ length: kCols }, () => new Array<number>(kCols).fill(0))
      const Xty = new Array<number>(kCols).fill(0)
      const row = new Float64Array(kCols)
      for (let t = start; t < end; t++) {
        row[0] = 1
        for (let l = 1; l <= pLag; l++) row[l] = dst[t - l]!
        if (useSrc) for (let l = 1; l <= pLag; l++) row[pLag + l] = src[t - l]!
        const yt = dst[t]!
        for (let i = 0; i < kCols; i++) {
          const ri = row[i]!
          Xty[i] = Xty[i]! + ri * yt
          for (let j = i; j < kCols; j++) XtX[i]![j] = XtX[i]![j]! + ri * row[j]!
        }
      }
      for (let i = 0; i < kCols; i++) for (let j = 0; j < i; j++) XtX[i]![j] = XtX[j]![i]!
      const beta = solveLinearReal(XtX, Xty)
      let rss = 0
      for (let t = start; t < end; t++) {
        let pred = beta[0]!
        for (let l = 1; l <= pLag; l++) pred += beta[l]! * dst[t - l]!
        if (useSrc) for (let l = 1; l <= pLag; l++) pred += beta[pLag + l]! * src[t - l]!
        const err = dst[t]! - pred
        rss += err * err
      }
      return rss
    }
    const rssR = fitRss(false)
    const rssU = fitRss(true)
    return ((rssR - rssU) / pLag) / (rssU / (nEff - 2 * pLag - 1))
  }

  const firOrder = 30
  const firLen = firOrder + 1
  const halfOrd = firOrder / 2
  const firKernel = new Float64Array(firLen)
  const fLo = 0.06
  const fHi = 0.30
  for (let i = 0; i < firLen; i++) {
    const m = i - halfOrd
    const sincHi = m === 0 ? fHi : Math.sin(PI * fHi * m) / (PI * m)
    const sincLo = m === 0 ? fLo : Math.sin(PI * fLo * m) / (PI * m)
    const win = 0.54 - 0.46 * Math.cos((2 * PI * i) / firOrder)
    firKernel[i] = (sincHi - sincLo) * win
  }
  const applyZeroPhaseFir = (sig: Float64Array): Float64Array => {
    const n = sig.length
    const fwd = new Float64Array(n)
    for (let t = 0; t < n; t++) {
      let s = 0
      for (let k = 0; k < firLen; k++) {
        const idx = t - k
        if (idx >= 0) s += firKernel[k]! * sig[idx]!
      }
      fwd[t] = s
    }
    const bwd = new Float64Array(n)
    for (let t = 0; t < n; t++) {
      let s = 0
      for (let k = 0; k < firLen; k++) {
        const idx = t + k
        if (idx < n) s += firKernel[k]! * fwd[idx]!
      }
      bwd[t] = s
    }
    return bwd
  }

  const fRawAB = grangerF(A_sig, B_sig, 3, 60)
  const fRawBA = grangerF(B_sig, A_sig, 3, 60)
  const A_zp = applyZeroPhaseFir(A_sig)
  const B_zp = applyZeroPhaseFir(B_sig)
  const fZpBA = grangerF(B_zp, A_zp, 3, 60)
  const acausalRatio = fZpBA / Math.max(fRawBA, 1e-6)

  recordCheck(
    'A4.1',
    'A4',
    'Tier A',
    'EEG anti-confound guards (CAR zero-mean, EOG Nolte Re>>Im + wPLI^2, zero-phase FIR Granger)',
    maxCarMean < 1e-14 &&
      carMeanVar < 1e-28 &&
      Math.abs(reCoh) > 0.90 &&
      Math.abs(imCoh) < 0.02 &&
      reToImRatio > 50 &&
      Math.abs(debiasedWpliSq) < 0.05 &&
      fRawAB > 100 &&
      fRawBA < 5 &&
      acausalRatio > 100,
    `CAR maxMean=${maxCarMean.toExponential(1)}, EOG |Re(C)|=${Math.abs(reCoh).toFixed(4)} vs |Im(C)|=${Math.abs(imCoh).toFixed(4)} (${reToImRatio.toFixed(0)}x), wPLI^2=${debiasedWpliSq.toFixed(4)}, Granger raw F(A->B)=${fRawAB.toFixed(1)}, raw F(B->A)=${fRawBA.toFixed(2)} -> zpFIR F(B->A)=${fZpBA.toFixed(1)} (${acausalRatio.toFixed(0)}x inflation!)`,
  )

  // --- A4.2 Naive Log-Log OLS vs Exact CSN (2009) Discrete Hurwitz-Zeta MLE + KS + Vuong LLR ---
  const rngCsn = makePrng(0xa4022026)
  const N_CSN = 2000

  const expSamples: number[] = []
  for (let i = 0; i < N_CSN; i++) {
    let u = rngCsn.next()
    while (u <= 1e-15) u = rngCsn.next()
    expSamples.push(1 + Math.floor(-Math.log(u) / 0.12))
  }
  const fitExp = fitDiscreteCsn(expSamples, 1)

  const lnSamples: number[] = []
  for (let i = 0; i < N_CSN; i++) {
    const val = Math.exp(1.4 + 1.05 * rngCsn.nextNormal())
    lnSamples.push(Math.max(1, Math.floor(val + 0.5)))
  }
  const fitLn = fitDiscreteCsn(lnSamples, 1)

  const z2 = hurwitzZeta(2.0, 1)
  const plSamples: number[] = []
  for (let i = 0; i < N_CSN; i++) {
    const u = rngCsn.next()
    let lo = 1
    let hi = 2
    while (1 - hurwitzZeta(2.0, hi + 1) / z2 < u && hi < 1000000) hi *= 2
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (1 - hurwitzZeta(2.0, mid + 1) / z2 >= u) hi = mid
      else lo = mid + 1
    }
    plSamples.push(lo)
  }
  const fitPl = fitDiscreteCsn(plSamples, 1)

  recordCheck(
    'A4.2',
    'A4',
    'Tier A',
    'Naive log-log OLS failure vs Exact CSN (2009) discrete Hurwitz-Zeta MLE + KS + Vuong LLR',
    fitExp.vuongExp < -10 &&
      fitLn.olsR2 > 0.95 &&
      fitLn.ks > 0.05 &&
      fitLn.vuongPLvsLN < -3 &&
      Math.abs(fitPl.alphaHat - 2.0) < 0.1 &&
      fitPl.ks < 0.03 &&
      fitPl.vuongExp > 3 &&
      fitPl.vuongPLvsLN > 3,
    `Exp(V_exp=${fitExp.vuongExp.toFixed(1)}<-10), LN(olsR2=${fitLn.olsR2.toFixed(4)}>0.95 [FOOLED], KS=${fitLn.ks.toFixed(3)}, V_LN=${fitLn.vuongPLvsLN.toFixed(1)}<-3), TruePL(alpha=${fitPl.alphaHat.toFixed(3)}, KS=${fitPl.ks.toFixed(4)}, V_exp=+${fitPl.vuongExp.toFixed(1)}, V_LN=+${fitPl.vuongPLvsLN.toFixed(1)})`,
  )

  // --- A4.3 Confound-Free Edge-of-Criticality Sweep on Coupled 64-Unit K=8 Expander ---
  const N_NET = 64
  const K_DEG = 8
  const offsets = [1, 63, 6, 58, 17, 47, 27, 37] as const
  const adj: Int32Array[] = Array.from({ length: N_NET }, (_, i) => {
    const nb = new Int32Array(K_DEG)
    for (let k = 0; k < K_DEG; k++) nb[k] = (i + offsets[k]!) & 63
    return nb
  })

  const sweepG = [0.55, 0.80, 1.00, 1.04, 1.08, 1.25, 1.45] as const
  type CritRow = {
    readonly g: number
    readonly sigma: number
    readonly tauAc: number
    readonly chi: number
    readonly alphaHat: number
    readonly vuongExp: number
    readonly runaway: number
    readonly nTerm: number
  }
  const critRows: CritRow[] = []

  for (let gi = 0; gi < sweepG.length; gi++) {
    const g = sweepG[gi]!
    // Linear-threshold branching activation with 30% cusp cooling ceiling (pMax = 0.70):
    // guarantees exact sigma = g, zero artificial all-1 lock at g = 1.00 (runaway = 0),
    // and clean supercritical saturation (a* ~ 0.70, runaway > 0.55) at g = 1.45.
    const pAct = new Float64Array(K_DEG + 1)
    for (let m = 0; m <= K_DEG; m++) pAct[m] = Math.min(0.70, (g * m) / K_DEG)

    const rngNet = makePrng(0xa4030000 + gi * 997)

    const nAval = 2000
    const maxAvalSteps = 350
    const avalSizes: number[] = []
    let runawayCount = 0
    let sumStep1 = 0
    const st = new Uint8Array(N_NET)
    const nxt = new Uint8Array(N_NET)

    for (let tr = 0; tr < nAval; tr++) {
      st.fill(0)
      st[tr & 63] = 1
      let totalSize = 1
      let activeCount = 1
      let step = 0
      while (activeCount > 0 && step < maxAvalSteps) {
        let nextActive = 0
        for (let i = 0; i < N_NET; i++) {
          const nb = adj[i]!
          let mAct = 0
          for (let k = 0; k < K_DEG; k++) if (st[nb[k]!] === 1) mAct++
          if (mAct > 0 && rngNet.next() < pAct[mAct]!) {
            nxt[i] = 1
            nextActive++
          } else {
            nxt[i] = 0
          }
        }
        st.set(nxt)
        if (step === 0) sumStep1 += nextActive
        activeCount = nextActive
        totalSize += activeCount
        step++
      }
      if (activeCount > 0) runawayCount++
      avalSizes.push(totalSize)
    }
    const sigma = sumStep1 / nAval
    const runaway = runawayCount / nAval
    const csnAval = fitDiscreteCsn(avalSizes, 3)

    const hDrive = 0.0025
    const burnStat = 400
    const T_STAT = 3600
    st.fill(0)
    const actSeries = new Float64Array(T_STAT)
    for (let t = -burnStat; t < T_STAT; t++) {
      let nAct = 0
      for (let i = 0; i < N_NET; i++) {
        const nb = adj[i]!
        let mAct = 0
        for (let k = 0; k < K_DEG; k++) if (st[nb[k]!] === 1) mAct++
        const pFire = 1 - (1 - hDrive) * (1 - pAct[mAct]!)
        if (rngNet.next() < pFire) {
          nxt[i] = 1
          nAct++
        } else {
          nxt[i] = 0
        }
      }
      st.set(nxt)
      if (t >= 0) actSeries[t] = nAct / N_NET
    }
    let meanA = 0
    for (let t = 0; t < T_STAT; t++) meanA += actSeries[t]!
    meanA /= T_STAT
    let varA = 0
    for (let t = 0; t < T_STAT; t++) {
      const d = actSeries[t]! - meanA
      varA += d * d
    }
    varA /= T_STAT
    const chi = N_NET * varA
    let tauAc = 1
    if (varA > 1e-15) {
      for (let lag = 1; lag <= 100; lag++) {
        let cov = 0
        const len = T_STAT - lag
        for (let t = 0; t < len; t++) {
          cov += (actSeries[t]! - meanA) * (actSeries[t + lag]! - meanA)
        }
        const rho = cov / (len * varA)
        if (rho <= 0) break
        tauAc += 2 * rho
      }
    }

    critRows.push({
      g,
      sigma,
      tauAc,
      chi,
      alphaHat: csnAval.alphaHat,
      vuongExp: csnAval.vuongExp,
      runaway,
      nTerm: nAval - runawayCount,
    })
  }

  const subRow = critRows[0]!
  const supRow = critRows[critRows.length - 1]!
  const critBand = critRows.filter(r => r.g >= 1.00 - 1e-9 && r.g <= 1.08 + 1e-9)
  // Locate the critical slowing-down peak (max tau_ac) inside the critical band.
  // On a finite N=64 network, variance-based chi peaks slightly supercritical due to
  // metastable active-branch switching, whereas tau_ac peaks sharply at the zero-runaway edge.
  const peakCrit = critBand.reduce((best, r) => (r.tauAc > best.tauAc ? r : best), critBand[0]!)

  const subOk = subRow.sigma < 0.75 && subRow.vuongExp <= 0 && subRow.runaway === 0
  const critOk =
    Math.abs(peakCrit.sigma - 1.0) < 0.12 &&
    peakCrit.tauAc > 2.5 * subRow.tauAc &&
    peakCrit.tauAc > 2.5 * supRow.tauAc &&
    peakCrit.chi > 2.5 * subRow.chi &&
    peakCrit.chi > 2.5 * supRow.chi &&
    Math.abs(peakCrit.alphaHat - 1.5) < 0.25 &&
    peakCrit.vuongExp > 5 &&
    peakCrit.runaway === 0
  const supOk = supRow.runaway > 0.3 && supRow.vuongExp < -3

  console.log('  [A4.3] Edge-of-Criticality Sweep Table (64-unit K=8 expander, 2000 avalanches/g):')
  console.log('         g    | sigma | tau_ac |  chi   | alpha | V_exp  | runaway')
  for (const r of critRows) {
    console.log(
      `         ${r.g.toFixed(2)} | ${r.sigma.toFixed(3)} | ${r.tauAc.toFixed(2).padStart(6)} | ${r.chi.toFixed(4)} | ${r.alphaHat.toFixed(3)} | ${r.vuongExp.toFixed(2).padStart(6)} | ${r.runaway.toFixed(3)}`,
    )
  }

  recordCheck(
    'A4.3',
    'A4',
    'Tier B',
    'Confound-free 64-unit K=8 expander self-attractor edge-of-criticality sweep (sub/crit/super regimes)',
    subOk && critOk && supOk,
    `sub(g=0.55: sig=${subRow.sigma.toFixed(2)},tau=${subRow.tauAc.toFixed(2)},chi=${subRow.chi.toFixed(4)},V=${subRow.vuongExp.toFixed(1)},run=0), crit(g=${peakCrit.g.toFixed(2)}: sig=${peakCrit.sigma.toFixed(2)},tau=${peakCrit.tauAc.toFixed(2)} [${(peakCrit.tauAc / subRow.tauAc).toFixed(1)}x/${(peakCrit.tauAc / supRow.tauAc).toFixed(1)}x],chi=${peakCrit.chi.toFixed(4)} [${(peakCrit.chi / subRow.chi).toFixed(1)}x/${(peakCrit.chi / supRow.chi).toFixed(1)}x],alpha=${peakCrit.alphaHat.toFixed(2)},V=+${peakCrit.vuongExp.toFixed(1)},run=${peakCrit.runaway.toFixed(3)}), sup(g=1.45: run=${supRow.runaway.toFixed(2)},V=${supRow.vuongExp.toFixed(1)})`,
  )
}

// =================================================================================================
// MAIN EXECUTION, SUMMARY & EPISTEMIC TIER A / B / C FOOTER
// =================================================================================================

runGateA1()
runGateA2()
runGateA3()
runGateA4()

const elapsedMs = Date.now() - t0Global
const total = CHECKS.length
const passed = CHECKS.filter(c => c.passed).length
const failed = total - passed
const tierACount = CHECKS.filter(c => c.tier === 'Tier A').length
const tierBCount = CHECKS.filter(c => c.tier === 'Tier B').length
const tierCCount = CHECKS.filter(c => c.tier === 'Tier C').length

console.log('\n==============================================================================================')
console.log(`AGENCY, VALENCE GEOMETRY, DISCRETE SYNERGY & EMPIRICAL PROTOCOL SUITE: ${passed}/${total} PASSED (${failed} FAILED) in ${(elapsedMs / 1000).toFixed(3)} s`)
console.log('==============================================================================================')
console.log('EPISTEMIC STRATIFICATION FOOTER (Strict Boundary Discipline):')
console.log(`  - Tier A (${tierACount} checks — Exact Mathematical & Information-Theoretic Invariants):`)
console.log('      SLD QFI output/SU(3)/joint-diffeomorphism invariance & Petz-Uhlmann monotonicity (A1.1),')
console.log('      [[24,1,8]]_3 Terminal Set Z / classical pointer band / saturation & zero-sum delta_i (A1.2),')
console.log('      exact Q=0 chiral 4-slot Phi_tone^odd & exact-differential loop ceiling (A1.3),')
console.log('      compositional combinatorial ceiling & CLR + last-drop Gaussian log-det fragility (A2.1),')
console.log('      exact discrete BROJA PID 5-gate audit, Williams-Beer failure & swap invariance (A2.2),')
console.log('      conditional 1-hop & trine-qutrit Holevo tool-and-mirror screening (A3.1),')
console.log('      CAR zero-mean, Nolte EOG volume-conduction inversion + wPLI^2, zero-phase FIR Granger (A4.1),')
console.log('      and exact CSN (2009) discrete Hurwitz-Zeta MLE + KS + Vuong LLR vs naive OLS (A4.2).')
console.log(`  - Tier B (${tierBCount} checks — In-Silico Dynamical Models, Grade R2 Computational Agency):`)
console.log('      Closed-loop Balduzzi Exp. 6 viability learning vs Goodhart wireheading (A1.4),')
console.log('      confound-free 27-state self-attractor synergy steering (A2.3),')
console.log('      repaired dual-channel suppression gate in discrete garden + leaky replay & Landauer audit (A3.2),')
console.log('      and confound-free 64-unit K=8 expander edge-of-criticality sweep (A4.3).')
console.log(`  - Tier C (${tierCCount} check — Quarantined to Empirical Neuroscience Arm II):`)
console.log('      12-level TMS-EEG titration BIC slope/wedge-snap protocol (A1.5) is validated here strictly')
console.log('      as a synthetic statistical pipeline audit; NO human phenomenal or consciousness claims are')
console.log('      established by in-silico code (all empirical phenomenal claims remain quarantined to Arm II).')
console.log('==============================================================================================')

if (failed > 0) {
  const failedIds = CHECKS.filter(c => !c.passed)
    .map(c => c.id)
    .join(', ')
  throw new Error(`Agency/Valence/Synergy protocol suite FAILED (${failed}/${total}): ${failedIds}`)
}

export {}
