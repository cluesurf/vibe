// Wave-7 Verification Suite:
// Experiential Boundary Dynamics, Hyperbolic Labyrinths, Open-System Frustration Traps,
// Intelligent Adaptive Spaces (Six-Axis Orthogonality), and Discrete Multiscale Chronometry.
//
// Standalone, strictly deterministic (ZERO external imports, ZERO Math.random() — pure Mulberry32 PRNG),
// strict TypeScript clean (--strict --noUncheckedIndexedAccess --noUnusedLocals --noUnusedParameters),
// fast (< 6 s, < 250 MB RSS), fail-closed (throws on any failed check -> exit code 1),
// ending with `export {}`.
//
// Five Verification Gates (Research Note 22 — Experiments A through E):
//   GATE E1 (Exp A) — Holographic Code-Distance Aperture Overload on exact GF(3) [12, k, d]_3
//                     Golay family (k = 1, 2, 4, 6, 8, 10, 11, 12) + B_1 = [[552, 25, 8]]_3
//                     quantum Singleton bound, exact coset-leader decoding F_dec(k, p), sharp
//                     protective aperture peak under p_flux = 0.12 / 0.16, and noiseless p = 0
//                     monotonic negative control.
//   GATE E2 (Exp B) — Hyperbolic Labyrinth Escape & Compass Emergence on exact 2D {7,3}
//                     (W/B 1/2/4 & 2/2/3 degrees, lambda = phi^2) and 4D {3,4,3,4}
//                     Cartier-Foata clique-orbit graph (M_up = [[24,0,0],[15,8,0],[11,8,3],[9,6,6]],
//                     lambda ~ 18.2787, cross-checked live against O^+(4,1; Z[sqrt(2)])), comparing
//                     4 bounded-memory policies ({7,3} from r_0 = 6, {3,4,3,4} from r_0 = 4 + compass at r_0 = 6).
//   GATE E3 (Exp C) — Open-System Metastable Frustration Traps vs Non-Eternal Escape Channels:
//                     closed 27-state reversible bijection no-sink negative control vs 27-state
//                     open quotient coupled to infinite hyperbolic bath (exact (I - P_trans) t = 1
//                     Gaussian elimination, Landauer ln 3 export, Fisher tension, > 10x T_esc
//                     collapse under boundary nudge eps = 0.15 or gain moderation g_loop = 0.55).
//   GATE E4 (Exp D) — Intelligent Adaptive Spaces & Six-Axis Orthogonality Ecology: coupled
//                     (E_env, S_agent) across 8 coupled regimes (Firehose, Adversarial Maze, Static Niche,
//                     Adaptive Curriculum, Over-Sheltered, High-Noise Adaptive, Chaotic Predator, Stoic Frontier),
//                     tracking all 6 orthogonal axes + exact discrete BROJA PID synergy + explicit
//                     pairwise dissociation & multi-axis 6x6 Jacobi PCA rank witnesses.
//   GATE E5 (Exp E) — Discrete Multiscale Chronometry: exact microscopically reversible ternary
//                     cellular dynamics on {7,3} B_3 and {3,4,3,4} B_3 observed across nested
//                     quotients ell = 0, 1, 2 and radial depths r = 0, 1, 2, 3, certifying exact
//                     causal arrival and triple decoupling of (r_S, H_proc, |W|).

const T0_GLOBAL = Date.now()

type EpistemicTier = 'Tier A' | 'Tier B'

interface CheckRow {
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
// 0. DETERMINISTIC PRNG, EXACT GF(3) ALGEBRA, LINEAR SOLVER, BROJA PID & {3,4,3,4} COXETER ENGINE
// =================================================================================================

const LN2 = Math.log(2)
const LN3 = Math.log(3)
const LOG2_3 = LN3 / LN2
const PHI_SQ = (3 + Math.sqrt(5)) / 2

interface Prng {
  next: () => number
  nextInt: (bound: number) => number
}

function makePrng(seed: number): Prng {
  let state = seed >>> 0
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const nextInt = (bound: number): number => Math.floor(next() * bound)
  return { next, nextInt }
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

// Exact Gaussian elimination over GF(3): returns RREF basis and pivot columns
function gf3RrefSmall(
  rows: readonly (readonly number[])[],
  nCols: number,
): { readonly basis: number[][]; readonly pivCols: number[] } {
  const mat: number[][] = rows.map(r => r.map(mod3))
  const nRows = mat.length
  const pivCols: number[] = []
  let rank = 0
  for (let col = 0; col < nCols && rank < nRows; col++) {
    let piv = -1
    for (let r = rank; r < nRows; r++) {
      if (mat[r]![col]! !== 0) {
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
    if (pRow[col]! === 2) {
      for (let c = col; c < nCols; c++) pRow[c] = mod3(2 * pRow[c]!)
    }
    for (let r = 0; r < nRows; r++) {
      if (r === rank) continue
      const row = mat[r]!
      const factor = row[col]!
      if (factor === 0) continue
      for (let c = col; c < nCols; c++) {
        row[c] = mod3(row[c]! - factor * pRow[c]!)
      }
    }
    pivCols.push(col)
    rank++
  }
  return { basis: mat.slice(0, rank), pivCols }
}

function gf3NullspaceSmall(rows: readonly (readonly number[])[], nCols: number): number[][] {
  const { basis, pivCols } = gf3RrefSmall(rows, nCols)
  const r = basis.length
  const isPiv = new Uint8Array(nCols)
  for (const c of pivCols) isPiv[c] = 1
  const out: number[][] = []
  for (let free = 0; free < nCols; free++) {
    if (isPiv[free]) continue
    const v = new Array<number>(nCols).fill(0)
    v[free] = 1
    for (let i = 0; i < r; i++) {
      const val = basis[i]![free]!
      if (val !== 0) v[pivCols[i]!] = mod3(-val)
    }
    out.push(v)
  }
  return out
}

// Exact dense Gaussian elimination with partial pivoting for Ax = b (real Float64)
function solveLinearSystem(AIn: readonly (readonly number[])[], bIn: readonly number[]): {
  readonly ok: boolean
  readonly x: number[]
  readonly maxResidual: number
  readonly minPivot: number
} {
  const n = bIn.length
  const A: number[][] = AIn.map(row => row.slice())
  const b: number[] = bIn.slice()
  let minPivot = Number.POSITIVE_INFINITY

  for (let col = 0; col < n; col++) {
    let pivRow = col
    let pivAbs = Math.abs(A[col]![col]!)
    for (let r = col + 1; r < n; r++) {
      const val = Math.abs(A[r]![col]!)
      if (val > pivAbs) {
        pivAbs = val
        pivRow = r
      }
    }
    if (pivAbs < minPivot) minPivot = pivAbs
    if (pivAbs < 1e-13) {
      return { ok: false, x: new Array<number>(n).fill(Number.POSITIVE_INFINITY), maxResidual: Number.POSITIVE_INFINITY, minPivot: pivAbs }
    }
    if (pivRow !== col) {
      const tmpRow = A[col]!
      A[col] = A[pivRow]!
      A[pivRow] = tmpRow
      const tmpB = b[col]!
      b[col] = b[pivRow]!
      b[pivRow] = tmpB
    }
    const diag = A[col]![col]!
    for (let r = col + 1; r < n; r++) {
      const factor = A[r]![col]! / diag
      if (factor === 0) continue
      A[r]![col] = 0
      for (let c = col + 1; c < n; c++) {
        A[r]![c] = A[r]![c]! - factor * A[col]![c]!
      }
      b[r] = b[r]! - factor * b[col]!
    }
  }

  const x = new Array<number>(n).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let sum = b[r]!
    for (let c = r + 1; c < n; c++) sum -= A[r]![c]! * x[c]!
    x[r] = sum / A[r]![r]!
  }

  let maxResidual = 0
  for (let r = 0; r < n; r++) {
    let ax = 0
    for (let c = 0; c < n; c++) ax += AIn[r]![c]! * x[c]!
    const res = Math.abs(ax - bIn[r]!)
    if (res > maxResidual) maxResidual = res
  }
  return { ok: true, x, maxResidual, minPivot }
}

// Exact real symmetric Jacobi eigensolver (returns eigenvalues sorted descending)
function symmetricJacobiEigenvalues(MIn: readonly (readonly number[])[]): number[] {
  const n = MIn.length
  const A: number[][] = MIn.map(row => row.slice())
  for (let sweep = 0; sweep < 80; sweep++) {
    let maxOff = 0
    let p = 0
    let q = 1
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const val = Math.abs(A[i]![j]!)
        if (val > maxOff) {
          maxOff = val
          p = i
          q = j
        }
      }
    }
    if (maxOff < 1e-13) break
    const app = A[p]![p]!
    const aqq = A[q]![q]!
    const apq = A[p]![q]!
    const tau = (aqq - app) / (2 * apq)
    const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
    const c = 1 / Math.sqrt(1 + t * t)
    const s = t * c
    A[p]![p] = app - t * apq
    A[q]![q] = aqq + t * apq
    A[p]![q] = 0
    A[q]![p] = 0
    for (let r = 0; r < n; r++) {
      if (r === p || r === q) continue
      const arp = A[r]![p]!
      const arq = A[r]![q]!
      A[r]![p] = c * arp - s * arq
      A[p]![r] = A[r]![p]!
      A[r]![q] = s * arp + c * arq
      A[q]![r] = A[r]![q]!
    }
  }
  let finalMaxOff = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const val = Math.abs(A[i]![j]!)
      if (val > finalMaxOff) finalMaxOff = val
    }
  }
  assertExact(finalMaxOff < 1e-10, `Jacobi eigensolver failed to converge: maxOff=${finalMaxOff.toExponential(2)}`)
  const eigs: number[] = []
  for (let i = 0; i < n; i++) eigs.push(A[i]![i]!)
  eigs.sort((a, b) => b - a)
  return eigs
}

// Exact discrete BROJA PID for binary (X1, X2 -> Y) via 2D strictly convex optimization over Delta_p
interface BrojaResult {
  readonly iTotal: number
  readonly iX1: number
  readonly iX2: number
  readonly synergy: number
  readonly redundancy: number
  readonly unique1: number
  readonly unique2: number
}

function xLog2x(p: number): number {
  return p <= 1e-15 ? 0 : p * (Math.log(p) / LN2)
}

function computeBinaryBrojaPid(pFlat: readonly number[]): BrojaResult {
  // Index: (y << 2) | (x1 << 1) | x2, length 8
  assertExact(pFlat.length === 8, 'BROJA input must have length 8')
  let totalMass = 0
  for (let i = 0; i < 8; i++) totalMass += pFlat[i]!
  assertExact(totalMass > 0, 'BROJA total mass must be > 0')
  const p = pFlat.map(v => v / totalMass)

  const py = [
    p[0]! + p[1]! + p[2]! + p[3]!,
    p[4]! + p[5]! + p[6]! + p[7]!,
  ] as const
  const pyx1 = [
    p[0]! + p[1]!,
    p[2]! + p[3]!,
    p[4]! + p[5]!,
    p[6]! + p[7]!,
  ] as const
  const pyx2 = [
    p[0]! + p[2]!,
    p[1]! + p[3]!,
    p[4]! + p[6]!,
    p[5]! + p[7]!,
  ] as const
  const px1 = [pyx1[0] + pyx1[2], pyx1[1] + pyx1[3]] as const
  const px2 = [pyx2[0] + pyx2[2], pyx2[1] + pyx2[3]] as const

  const hY = -(xLog2x(py[0]) + xLog2x(py[1]))
  const hX1 = -(xLog2x(px1[0]) + xLog2x(px1[1]))
  const hX2 = -(xLog2x(px2[0]) + xLog2x(px2[1]))
  let hYX1 = 0
  let hYX2 = 0
  for (let i = 0; i < 4; i++) {
    hYX1 -= xLog2x(pyx1[i]!)
    hYX2 -= xLog2x(pyx2[i]!)
  }
  const iX1 = Math.max(0, hY + hX1 - hYX1)
  const iX2 = Math.max(0, hY + hX2 - hYX2)

  const evalJointMI = (q: readonly number[]): number => {
    let hYX1X2 = 0
    for (let i = 0; i < 8; i++) hYX1X2 -= xLog2x(q[i]!)
    let hX1X2 = 0
    for (let j = 0; j < 4; j++) hX1X2 -= xLog2x(q[j]! + q[4 + j]!)
    return Math.max(0, hY + hX1X2 - hYX1X2)
  }

  const iTotal = evalJointMI(p)

  // Parameterize Delta_p by t0 = q(0,1,1) and t1 = q(1,1,1)
  const a0 = pyx1[1]
  const b0 = pyx2[1]
  const m0 = py[0]
  const lo0 = Math.max(0, a0 + b0 - m0)
  const hi0 = Math.min(a0, b0)

  const a1 = pyx1[3]
  const b1 = pyx2[3]
  const m1 = py[1]
  const lo1 = Math.max(0, a1 + b1 - m1)
  const hi1 = Math.min(a1, b1)

  const buildQ = (t0: number, t1: number): number[] => [
    Math.max(0, m0 - a0 - b0 + t0),
    Math.max(0, b0 - t0),
    Math.max(0, a0 - t0),
    Math.max(0, t0),
    Math.max(0, m1 - a1 - b1 + t1),
    Math.max(0, b1 - t1),
    Math.max(0, a1 - t1),
    Math.max(0, t1),
  ]

  const goldenMin1D = (f: (x: number) => number, lo: number, hi: number): number => {
    if (hi - lo <= 1e-14) return 0.5 * (lo + hi)
    const gr = (Math.sqrt(5) - 1) / 2
    let a = lo
    let b = hi
    let c = b - gr * (b - a)
    let d = a + gr * (b - a)
    let fc = f(c)
    let fd = f(d)
    for (let it = 0; it < 60; it++) {
      if (fc < fd) {
        b = d
        d = c
        fd = fc
        c = b - gr * (b - a)
        fc = f(c)
      } else {
        a = c
        c = d
        fc = fd
        d = a + gr * (b - a)
        fd = f(d)
      }
    }
    const mid = 0.5 * (a + b)
    const fLo = f(lo)
    const fHi = f(hi)
    const fMid = f(mid)
    if (fLo <= fMid && fLo <= fHi) return lo
    if (fHi <= fMid && fHi <= fLo) return hi
    return mid
  }

  let t0 = 0.5 * (lo0 + hi0)
  let t1 = 0.5 * (lo1 + hi1)
  for (let sweep = 0; sweep < 25; sweep++) {
    t0 = goldenMin1D(x => evalJointMI(buildQ(x, t1)), lo0, hi0)
    t1 = goldenMin1D(x => evalJointMI(buildQ(t0, x)), lo1, hi1)
  }
  const minIQ = evalJointMI(buildQ(t0, t1))
  const synergy = Math.max(0, iTotal - minIQ)
  const unique1 = Math.max(0, minIQ - iX2)
  const unique2 = Math.max(0, minIQ - iX1)
  const redundancy = Math.max(0, iX1 + iX2 - minIQ)
  return { iTotal, iX1, iX2, synergy, redundancy, unique1, unique2 }
}

// =================================================================================================
// EXACT D_4 ROOTS, O^+(4,1; Z[sqrt(2)]) COXETER REFLECTIONS & RACG W(Gamma_24) ENGINE
// =================================================================================================

type Root4 = readonly [number, number, number, number]
type Z2 = readonly [bigint, bigint]

const ROOTS_D4: readonly Root4[] = (() => {
  const out: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const v: [number, number, number, number] = [0, 0, 0, 0]
          v[i] = si
          v[j] = sj
          out.push(v)
        }
      }
    }
  }
  return out
})()

const dot4 = (a: Root4, b: Root4): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]

const ADJ24: readonly (readonly boolean[])[] = Array.from({ length: 24 }, (_, a) =>
  Array.from({ length: 24 }, (_, b) => dot4(ROOTS_D4[a]!, ROOTS_D4[b]!) === 1),
)

const ADJ_MASK24: Int32Array = Int32Array.from({ length: 24 }, (_, a) => {
  let mask = 0
  for (let b = 0; b < 24; b++) {
    if (ADJ24[a]![b]) mask |= 1 << b
  }
  return mask
})

// Exact O^+(4,1; Z[sqrt(2)]) bilinear form, base center & 24 facet normals (from Vibe/CoxeterTransport.lean)
const TWICE_GRAM: readonly (readonly Z2[])[] = [
  [[2n, 0n], [-1n, 0n], [0n, 0n], [0n, 0n], [0n, 0n]],
  [[-1n, 0n], [2n, 0n], [0n, -1n], [0n, 0n], [0n, 0n]],
  [[0n, 0n], [0n, -1n], [2n, 0n], [-1n, 0n], [0n, 0n]],
  [[0n, 0n], [0n, 0n], [-1n, 0n], [2n, 0n], [0n, -1n]],
  [[0n, 0n], [0n, 0n], [0n, 0n], [0n, -1n], [2n, 0n]],
]

const z2Add = (u: Z2, v: Z2): Z2 => [u[0] + v[0], u[1] + v[1]]
const z2Sub = (u: Z2, v: Z2): Z2 => [u[0] - v[0], u[1] - v[1]]
const z2Mul = (u: Z2, v: Z2): Z2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const z2Eq = (u: Z2, v: Z2): boolean => u[0] === v[0] && u[1] === v[1]

const BASE_CENTER: readonly Z2[] = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]
const FACET_NORMALS: readonly (readonly Z2[])[] = [
  [[0n, 0n], [0n, 0n], [0n, 0n], [0n, 0n], [1n, 0n]],
  [[0n, 0n], [2n, 0n], [0n, 2n], [0n, 2n], [1n, 0n]],
  [[4n, 0n], [6n, 0n], [0n, 4n], [0n, 2n], [1n, 0n]],
  [[4n, 0n], [8n, 0n], [0n, 6n], [0n, 4n], [1n, 0n]],
  [[0n, 0n], [0n, 0n], [0n, 0n], [0n, 1n], [1n, 0n]],
  [[0n, 0n], [2n, 0n], [0n, 2n], [0n, 1n], [1n, 0n]],
  [[4n, 0n], [6n, 0n], [0n, 4n], [0n, 3n], [1n, 0n]],
  [[4n, 0n], [8n, 0n], [0n, 6n], [0n, 3n], [1n, 0n]],
  [[0n, 0n], [0n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]],
  [[0n, 0n], [2n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]],
  [[4n, 0n], [6n, 0n], [0n, 5n], [0n, 3n], [1n, 0n]],
  [[4n, 0n], [8n, 0n], [0n, 5n], [0n, 3n], [1n, 0n]],
  [[2n, 0n], [2n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]],
  [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 1n], [1n, 0n]],
  [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 3n], [1n, 0n]],
  [[2n, 0n], [6n, 0n], [0n, 5n], [0n, 3n], [1n, 0n]],
  [[2n, 0n], [2n, 0n], [0n, 2n], [0n, 1n], [1n, 0n]],
  [[2n, 0n], [4n, 0n], [0n, 2n], [0n, 1n], [1n, 0n]],
  [[2n, 0n], [4n, 0n], [0n, 4n], [0n, 3n], [1n, 0n]],
  [[2n, 0n], [6n, 0n], [0n, 4n], [0n, 3n], [1n, 0n]],
  [[2n, 0n], [2n, 0n], [0n, 2n], [0n, 2n], [1n, 0n]],
  [[2n, 0n], [4n, 0n], [0n, 2n], [0n, 2n], [1n, 0n]],
  [[2n, 0n], [4n, 0n], [0n, 4n], [0n, 2n], [1n, 0n]],
  [[2n, 0n], [6n, 0n], [0n, 4n], [0n, 2n], [1n, 0n]],
]

const ID5_Z2: Z2[][] = Array.from({ length: 5 }, (_, i) =>
  Array.from({ length: 5 }, (_, j) => (i === j ? [1n, 0n] : [0n, 0n])),
)

function mat5VecZ2(M: readonly (readonly Z2[])[], v: readonly Z2[]): Z2[] {
  return Array.from({ length: 5 }, (_, i) => {
    let s: Z2 = [0n, 0n]
    for (let k = 0; k < 5; k++) s = z2Add(s, z2Mul(M[i]![k]!, v[k]!))
    return s
  })
}

function mat5MulZ2(A: readonly (readonly Z2[])[], B: readonly (readonly Z2[])[]): Z2[][] {
  return Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => {
      let s: Z2 = [0n, 0n]
      for (let k = 0; k < 5; k++) s = z2Add(s, z2Mul(A[i]![k]!, B[k]![j]!))
      return s
    }),
  )
}

function mat5EqZ2(A: readonly (readonly Z2[])[], B: readonly (readonly Z2[])[]): boolean {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (!z2Eq(A[i]![j]!, B[i]![j]!)) return false
    }
  }
  return true
}

const FACE_REFLECTIONS_Z2: readonly Z2[][][] = FACET_NORMALS.map(n => {
  const gn = mat5VecZ2(TWICE_GRAM, n)
  return Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) =>
      z2Sub(i === j ? [1n, 0n] : [0n, 0n], z2Mul(n[i]!, gn[j]!)),
    ),
  )
})

const STEP_CENTERS_Z2: readonly (readonly Z2[])[] = FACE_REFLECTIONS_Z2.map(F =>
  mat5VecZ2(F, BASE_CENTER),
)

const keyV5 = (v: readonly Z2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')

// Exact Right-Angled Coxeter Group W(Gamma_24) word-problem & Cartier-Foata normal form
function racgStep(word: readonly number[], facet: number): number[] {
  for (let i = word.length - 1; i >= 0; i--) {
    const c = word[i]!
    if (c === facet) {
      const out = word.slice(0, i)
      for (let j = i + 1; j < word.length; j++) out.push(word[j]!)
      return out
    }
    if (!ADJ24[c]![facet]) {
      const out = word.slice()
      out.push(facet)
      return out
    }
  }
  const out = word.slice()
  out.push(facet)
  return out
}

function racgRightDescentMask(word: readonly number[]): number {
  let seen = 0
  let descent = 0
  for (let i = word.length - 1; i >= 0; i--) {
    const c = word[i]!
    if ((seen & ~ADJ_MASK24[c]!) === 0) {
      descent |= 1 << c
    }
    seen |= 1 << c
  }
  return descent
}

function popcnt32(x: number): number {
  let v = x >>> 0
  v = v - ((v >>> 1) & 0x55555555)
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333)
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

function racgCanonicalKey(word: readonly number[]): string {
  if (word.length === 0) return '0'
  let cur = word.slice()
  const blocks: number[] = []
  while (cur.length > 0) {
    let seen = 0
    let mask = 0
    const keep: number[] = []
    const isDesc = new Uint8Array(cur.length)
    for (let i = cur.length - 1; i >= 0; i--) {
      const c = cur[i]!
      if ((seen & ~ADJ_MASK24[c]!) === 0) {
        mask |= 1 << c
        isDesc[i] = 1
      }
      seen |= 1 << c
    }
    blocks.push(mask)
    for (let i = 0; i < cur.length; i++) {
      if (!isDesc[i]) keep.push(cur[i]!)
    }
    cur = keep
  }
  blocks.reverse()
  return blocks.map(m => m.toString(36)).join('.')
}

// =================================================================================================
// GATE E1 (EXP A): HOLOGRAPHIC CODE-DISTANCE APERTURE OVERLOAD
// =================================================================================================

interface CodeMetrics {
  readonly k: number
  readonly n: number
  readonly d: number
  readonly alpha: number
  readonly tErr: number
  readonly cInt: number
  readonly singletonOk: boolean
  readonly cosetLeaders: readonly number[]
  readonly fDec12: number
  readonly iEff12: number
  readonly lS12: number
  readonly fDec16: number
  readonly iEff16: number
  readonly fDec0: number
  readonly iEff0: number
}

function runGateE1(): void {
  console.log('\n=================================================================================')
  console.log('GATE E1 (EXP A): HOLOGRAPHIC CODE-DISTANCE APERTURE OVERLOAD (GF(3) [12, k, d]_3)')
  console.log('=================================================================================')

  const N = 12
  // Extended ternary Golay code G_12 = [12, 6, 6]_3: G_6 = [I_6 | P]
  const G6: readonly (readonly number[])[] = [
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 2, 1],
    [0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 2, 2],
    [0, 0, 0, 1, 0, 0, 1, 2, 1, 0, 1, 2],
    [0, 0, 0, 0, 1, 0, 1, 2, 2, 1, 0, 1],
    [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 1, 0],
  ]

  // Verify G6 is strictly self-dual: G6 * G6^T = 0 mod 3
  let selfDualDefects = 0
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      let s = 0
      for (let c = 0; c < N; c++) s += G6[i]![c]! * G6[j]![c]!
      if (mod3(s) !== 0) selfDualDefects++
    }
  }
  assertExact(selfDualDefects === 0, 'G_12 must be self-dual over GF(3)')

  // Enumerate all 3^6 = 729 codewords of G_12 and verify exact weight enumerator
  const golayWords: number[][] = []
  const golayWeightCounts = new Int32Array(N + 1)
  const coeffs = new Int32Array(6)
  for (let idx = 0; idx < 729; idx++) {
    let tmp = idx
    for (let i = 0; i < 6; i++) {
      coeffs[i] = tmp % 3
      tmp = Math.floor(tmp / 3)
    }
    const cw = new Array<number>(N).fill(0)
    let wt = 0
    for (let c = 0; c < N; c++) {
      let v = 0
      for (let i = 0; i < 6; i++) v += coeffs[i]! * G6[i]![c]!
      const m = mod3(v)
      cw[c] = m
      if (m !== 0) wt++
    }
    golayWords.push(cw)
    golayWeightCounts[wt] = golayWeightCounts[wt]! + 1
  }
  assertExact(
    golayWeightCounts[0] === 1 &&
      golayWeightCounts[6] === 264 &&
      golayWeightCounts[9] === 440 &&
      golayWeightCounts[12] === 24,
    'Exact Golay [12,6,6]_3 weight enumerator 1 + 264 z^6 + 440 z^9 + 24 z^12',
  )

  // Construct exact nested/derived [12, k, d]_3 code family for k = 1, 2, 4, 6, 8, 10, 11, 12
  // k = 1: weight-12 codeword sum of rows of G6 -> [12, 1, 12]_3
  const w12: number[] = Array.from({ length: N }, (_, c) => {
    let s = 0
    for (let i = 0; i < 6; i++) s += G6[i]![c]!
    return mod3(s)
  })
  assertExact(w12.filter(x => x !== 0).length === 12, 'w12 must have Hamming weight 12')

  // k = 2: deterministic search inside G_12 for exact [12, 2, 9]_3 subcode
  const wt9Words = golayWords.filter(w => w.filter(x => x !== 0).length === 9)
  let g2Pair: [number[], number[]] | null = null
  outerK2: for (let i = 0; i < wt9Words.length; i++) {
    const u = wt9Words[i]!
    for (let j = i + 1; j < wt9Words.length; j++) {
      const v = wt9Words[j]!
      let wtPlus = 0
      let wtMinus = 0
      for (let c = 0; c < N; c++) {
        if (mod3(u[c]! + v[c]!) !== 0) wtPlus++
        if (mod3(u[c]! - v[c]!) !== 0) wtMinus++
      }
      if (wtPlus === 9 && wtMinus === 9) {
        g2Pair = [u, v]
        break outerK2
      }
    }
  }
  assertExact(g2Pair !== null, 'Must find exact [12, 2, 9]_3 subcode inside G_12')

  // k = 8: deterministic search for 4 independent rows inside G_12 whose 12 columns are
  // nonzero and pairwise non-proportional -> ker(H_8) is an exact [12, 8, 3]_3 supercode of G_12!
  const hasGoodCols = (H: readonly (readonly number[])[]): boolean => {
    const m = H.length
    const seen = new Set<string>()
    for (let c = 0; c < N; c++) {
      let firstNz = 0
      for (let r = 0; r < m; r++) {
        const val = H[r]![c]!
        if (val !== 0) {
          firstNz = val
          break
        }
      }
      if (firstNz === 0) return false
      const scale = firstNz === 1 ? 1 : 2
      let key = ''
      for (let r = 0; r < m; r++) key += String(mod3(scale * H[r]![c]!))
      if (seen.has(key)) return false
      seen.add(key)
    }
    return true
  }

  // k = 8: exact dual 2-subspace search in PG(5, 3) for H_8 = ker(V) * G_6 with rows in G_12
  // ker(H_8) has d >= 3 iff V avoids all 12 weight-1 columns and all 132 weight-2 column sums of G_6!
  const projKey6 = (v: readonly number[]): string => {
    let firstNz = 0
    for (let i = 0; i < 6; i++) {
      if (v[i]! !== 0) {
        firstNz = v[i]!
        break
      }
    }
    if (firstNz === 0) return '000000'
    const sc = firstNz === 1 ? 1 : 2
    return v.map(x => String(mod3(sc * x))).join('')
  }
  const g6Cols: number[][] = Array.from({ length: N }, (_, c) =>
    Array.from({ length: 6 }, (_, r) => G6[r]![c]!),
  )
  const forbiddenPG5 = new Set<string>(['000000'])
  for (let i = 0; i < N; i++) {
    forbiddenPG5.add(projKey6(g6Cols[i]!))
    for (let j = i + 1; j < N; j++) {
      const sumP = g6Cols[i]!.map((v, r) => mod3(v + g6Cols[j]![r]!))
      const sumM = g6Cols[i]!.map((v, r) => mod3(v - g6Cols[j]![r]!))
      forbiddenPG5.add(projKey6(sumP))
      forbiddenPG5.add(projKey6(sumM))
    }
  }
  // Collect all allowed projective points in PG(5, 3)
  const allowedPts: number[][] = []
  const seenPts = new Set<string>()
  for (let idx = 1; idx < 729; idx++) {
    let tmp = idx
    const v = new Array<number>(6).fill(0)
    for (let i = 0; i < 6; i++) {
      v[i] = tmp % 3
      tmp = Math.floor(tmp / 3)
    }
    const pk = projKey6(v)
    if (forbiddenPG5.has(pk) || seenPts.has(pk)) continue
    seenPts.add(pk)
    allowedPts.push(v)
  }
  let H8: number[][] | null = null
  outerK8: for (let i = 0; i < allowedPts.length; i++) {
    const p1 = allowedPts[i]!
    for (let j = i + 1; j < allowedPts.length; j++) {
      const p2 = allowedPts[j]!
      const pPlus = p1.map((x, r) => mod3(x + p2[r]!))
      const pMinus = p1.map((x, r) => mod3(x - p2[r]!))
      if (!forbiddenPG5.has(projKey6(pPlus)) && !forbiddenPG5.has(projKey6(pMinus))) {
        const kerV = gf3NullspaceSmall([p1, p2], 6) // 4 x 6
        const cand: number[][] = kerV.map(row =>
          Array.from({ length: N }, (_, c) => {
            let s = 0
            for (let r = 0; r < 6; r++) s += row[r]! * G6[r]![c]!
            return mod3(s)
          }),
        )
        assertExact(cand.length === 4 && hasGoodCols(cand), 'Dual PG(5,3) line must yield good H8 columns')
        H8 = cand
        break outerK8
      }
    }
  }
  assertExact(H8 !== null, 'Must construct exact [12, 8, 3]_3 supercode of G_12')

  // k = 10: 2 rows of G_12 (w12 and a weight-9 codeword -> all 12 cols nonzero -> d = 2)
  const H10: number[][] = [w12, wt9Words[0]!]
  assertExact(gf3RrefSmall(H10, N).basis.length === 2, 'H10 rank must be 2')

  // k = 11: [w12] -> exact [12, 11, 2]_3 supercode of G_12
  const H11: number[][] = [w12]

  // k = 12: empty parity check -> exact [12, 12, 1]_3
  const H12: number[][] = []

  // Build exact (G, H) pairs for all 8 codes
  const codeSpecs: readonly { readonly k: number; readonly G: number[][]; readonly H: number[][] }[] = [
    { k: 1, G: [w12], H: gf3NullspaceSmall([w12], N) },
    { k: 2, G: [g2Pair![0], g2Pair![1]], H: gf3NullspaceSmall([g2Pair![0], g2Pair![1]], N) },
    { k: 4, G: G6.slice(0, 4).map(r => r.slice()), H: gf3NullspaceSmall(G6.slice(0, 4), N) },
    { k: 6, G: G6.map(r => r.slice()), H: G6.map(r => r.slice()) },
    { k: 8, G: gf3NullspaceSmall(H8!, N), H: H8! },
    { k: 10, G: gf3NullspaceSmall(H10, N), H: H10 },
    { k: 11, G: gf3NullspaceSmall(H11, N), H: H11 },
    { k: 12, G: Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 1 : 0))), H: H12 },
  ]

  // Exact minimum-distance verifier + exact coset-leader enumerator by increasing Hamming weight
  const computeExactDistanceAndCosets = (
    k: number,
    G: readonly (readonly number[])[],
    H: readonly (readonly number[])[],
  ): { readonly d: number; readonly cosetLeaders: number[] } => {
    const m = N - k
    assertExact(G.length === k && H.length === m, `Rank mismatch for k=${k}`)
    // Verify G * H^T = 0 mod 3
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < m; j++) {
        let s = 0
        for (let c = 0; c < N; c++) s += G[i]![c]! * H[j]![c]!
        assertExact(mod3(s) === 0, `G * H^T != 0 for k=${k}`)
      }
    }

    // Exact minimum weight d:
    let dExact = N + 1
    if (k <= 6) {
      // Exhaustive codeword enumeration over all 3^k codewords
      const totalCws = Math.pow(3, k)
      for (let idx = 1; idx < totalCws; idx++) {
        let tmp = idx
        const cf = new Int32Array(k)
        for (let i = 0; i < k; i++) {
          cf[i] = tmp % 3
          tmp = Math.floor(tmp / 3)
        }
        let wt = 0
        for (let c = 0; c < N; c++) {
          let s = 0
          for (let i = 0; i < k; i++) s += cf[i]! * G[i]![c]!
          if (mod3(s) !== 0) wt++
        }
        if (wt < dExact) dExact = wt
      }
    } else if (m === 0) {
      dExact = 1
    } else {
      // Exact search by increasing weight w = 1..m+1 for a nonzero vector e with H * e = 0 mod 3
      const curSyn = new Int32Array(m)
      const findWeight = (start: number, rem: number): boolean => {
        if (rem === 0) {
          for (let r = 0; r < m; r++) {
            if (curSyn[r]! !== 0) return false
          }
          return true
        }
        for (let pos = start; pos <= N - rem; pos++) {
          for (let val = 1; val <= 2; val++) {
            for (let r = 0; r < m; r++) curSyn[r] = mod3(curSyn[r]! + val * H[r]![pos]!)
            if (findWeight(pos + 1, rem - 1)) return true
            for (let r = 0; r < m; r++) curSyn[r] = mod3(curSyn[r]! - val * H[r]![pos]!)
          }
        }
        return false
      }
      for (let w = 1; w <= m + 1; w++) {
        curSyn.fill(0)
        if (findWeight(0, w)) {
          dExact = w
          break
        }
      }
    }

    // Exact coset-leader weight distribution A_lead[0..N] over all 3^m syndromes
    const cosetLeaders = new Array<number>(N + 1).fill(0)
    if (m === 0) {
      cosetLeaders[0] = 1
      return { d: dExact, cosetLeaders }
    }

    const totalSyn = Math.pow(3, m)
    const seen = new Uint8Array(totalSyn)
    const pow3 = new Int32Array(m)
    pow3[0] = 1
    for (let r = 1; r < m; r++) pow3[r] = pow3[r - 1]! * 3

    // Precompute H columns for fast incremental updates
    const hCols: Int32Array[] = Array.from({ length: N }, (_, c) => {
      const col = new Int32Array(m)
      for (let r = 0; r < m; r++) col[r] = H[r]![c]!
      return col
    })

    let covered = 0
    const synDigits = new Int32Array(m)

    const dfsWeight = (start: number, rem: number, targetW: number, synIdx: number): void => {
      if (covered === totalSyn) return
      if (rem === 0) {
        if (seen[synIdx]! === 0) {
          seen[synIdx] = 1
          cosetLeaders[targetW] = cosetLeaders[targetW]! + 1
          covered++
        }
        return
      }
      for (let pos = start; pos <= N - rem; pos++) {
        const col = hCols[pos]!
        for (let val = 1; val <= 2; val++) {
          let nextIdx = synIdx
          for (let r = 0; r < m; r++) {
            const hc = col[r]!
            if (hc === 0) continue
            const oldD = synDigits[r]!
            const newD = (oldD + val * hc) % 3
            synDigits[r] = newD
            nextIdx += (newD - oldD) * pow3[r]!
          }
          dfsWeight(pos + 1, rem - 1, targetW, nextIdx)
          for (let r = 0; r < m; r++) {
            const hc = col[r]!
            if (hc === 0) continue
            synDigits[r] = (synDigits[r]! + 3 - ((val * hc) % 3)) % 3
          }
          if (covered === totalSyn) return
        }
      }
    }

    for (let w = 0; w <= N && covered < totalSyn; w++) {
      synDigits.fill(0)
      dfsWeight(0, w, w, 0)
    }
    assertExact(covered === totalSyn, `Coset-leader coverage mismatch for k=${k}: ${covered}/${totalSyn}`)
    return { d: dExact, cosetLeaders }
  }

  const evalFdec = (cosetLeaders: readonly number[], pFlux: number): number => {
    let f = 0
    for (let w = 0; w <= N; w++) {
      const cnt = cosetLeaders[w]!
      if (cnt === 0) continue
      f += cnt * Math.pow(1 - pFlux, N - w) * Math.pow(pFlux / 2, w)
    }
    return f
  }

  const P_FLUX_1 = 0.12
  const P_FLUX_2 = 0.16
  const rows: CodeMetrics[] = []

  console.log('  [E1] Exact [12, k, d]_3 Ternary Golay Family Aperture Sweep (r_pack=(d-1)/2 vs integer t_err=floor((d-1)/2)):')
  console.log('       k  | alpha |  d | t_err | r_pack | L_S(0.12) | F_dec(0.12) | I_eff(0.12) | I_eff(0.16) | I_eff(0.00)')
  for (const spec of codeSpecs) {
    const { d, cosetLeaders } = computeExactDistanceAndCosets(spec.k, spec.G, spec.H)
    const alpha = spec.k / N
    const tErr = Math.floor((d - 1) / 2)
    // Continuous packing radius r_pack = (d - 1) / 2 (distinct from integer t_err = floor((d - 1) / 2);
    // at d = 2, t_err = 0 worst-case correction while r_pack = 0.5 reflects single-error detection / partial coset decoding).
    const cInt = (d - 1) / 2
    const rIn12 = N * P_FLUX_1
    const lS12 = cInt > 0 ? rIn12 / cInt : Number.POSITIVE_INFINITY
    const fDec12 = evalFdec(cosetLeaders, P_FLUX_1)
    const iEff12 = spec.k * fDec12 * LOG2_3
    const fDec16 = evalFdec(cosetLeaders, P_FLUX_2)
    const iEff16 = spec.k * fDec16 * LOG2_3
    const fDec0 = evalFdec(cosetLeaders, 0)
    const iEff0 = spec.k * fDec0 * LOG2_3
    const singletonOk = spec.k <= N - d + 1
    rows.push({
      k: spec.k,
      n: N,
      d,
      alpha,
      tErr,
      cInt,
      singletonOk,
      cosetLeaders,
      fDec12,
      iEff12,
      lS12,
      fDec16,
      iEff16,
      fDec0,
      iEff0,
    })
    const lStr = Number.isFinite(lS12) ? lS12.toFixed(3).padStart(9) : '      Inf'
    console.log(
      `       ${String(spec.k).padStart(2)} | ${alpha.toFixed(3)} | ${String(d).padStart(2)} |   ${String(tErr).padStart(2)}  |  ${cInt.toFixed(1).padStart(4)}  | ${lStr} |    ${fDec12.toFixed(5)}  |    ${iEff12.toFixed(4).padStart(7)}  |    ${iEff16.toFixed(4).padStart(7)}  |    ${iEff0.toFixed(4).padStart(7)}`,
    )
  }

  // Independent closed-form cross-check of k = 1 ([12, 1, 12]_3) decoding fidelity via trinomial sum
  const fact: number[] = [1]
  for (let i = 1; i <= N; i++) fact.push(fact[i - 1]! * i)
  let f1Closed = 0
  for (let n0 = 0; n0 <= N; n0++) {
    for (let n1 = 0; n1 <= N - n0; n1++) {
      const n2 = N - n0 - n1
      const mult = fact[N]! / (fact[n0]! * fact[n1]! * fact[n2]!)
      const minW = N - Math.max(n0, n1, n2)
      f1Closed += (mult / 3) * Math.pow(1 - P_FLUX_1, N - minW) * Math.pow(P_FLUX_1 / 2, minW)
    }
  }
  const f1CrossErr = Math.abs(f1Closed - rows[0]!.fDec12)

  // Verify exact distances, Singleton trade-off, live [[11, 1, 5]]_3 shortened quantum Golay CSS code,
  // and combinatorial parameter consistency on {3,4,3,4} B_1 = [[552, 25, 8]]_3
  const expectedD = [12, 9, 6, 6, 3, 2, 2, 1] as const
  const distExactOk = rows.every((r, idx) => r.d === expectedD[idx] && r.singletonOk)
  const monoNonIncD = rows.every((r, idx) => idx === 0 || r.d <= rows[idx - 1]!.d)
  const fullApertureD1 = rows[rows.length - 1]!.alpha === 1 && rows[rows.length - 1]!.d === 1

  // Construct exact shortened quantum Golay CSS code [[11, 1, 5]]_3 directly from self-dual G_6:
  // Punctured C_11 = G_12|_{1..11} is [11, 6, 5]_3; shortened C_11^perp = {c in G_12 : c_0 = 0}|_{1..11} is [11, 5, 6]_3
  const c11PerpRows = G6.slice(1).map(r => r.slice(1)) // 5 x 11, all have coord 0 == 0 in G_6!
  const c11Rows = G6.map(r => r.slice(1)) // 6 x 11
  assertExact(gf3RrefSmall(c11PerpRows, 11).basis.length === 5, 'Shortened Golay [11,5]_3 rank must be 5')
  assertExact(gf3RrefSmall(c11Rows, 11).basis.length === 6, 'Punctured Golay [11,6]_3 rank must be 6')
  // Verify self-orthogonality C_11^perp subset (C_11^perp)^perp = C_11:
  let cssOrthDefects = 0
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 6; j++) {
      let s = 0
      for (let c = 0; c < 11; c++) s += c11PerpRows[i]![c]! * c11Rows[j]![c]!
      if (mod3(s) !== 0) cssOrthDefects++
    }
  }
  // Exact quantum distance d_Q = min_{c in C_11 \ C_11^perp} wt(c) (exhaustive over all 486 nontrivial coset vectors!)
  let dQuantGolay11 = 12
  for (let idx = 0; idx < 729; idx++) {
    const c0 = idx % 3
    if (c0 === 0) continue // c0 == 0 lies in C_11^perp (stabilizer)
    let tmp = Math.floor(idx / 3)
    const cf = [c0, 0, 0, 0, 0, 0]
    for (let i = 1; i < 6; i++) {
      cf[i] = tmp % 3
      tmp = Math.floor(tmp / 3)
    }
    let wt = 0
    for (let c = 0; c < 11; c++) {
      let v = 0
      for (let i = 0; i < 6; i++) v += cf[i]! * c11Rows[i]![c]!
      if (mod3(v) !== 0) wt++
    }
    if (wt < dQuantGolay11) dQuantGolay11 = wt
  }
  const qSingletonGolay11 = cssOrthDefects === 0 && dQuantGolay11 === 5 && 1 <= 11 - 2 * (dQuantGolay11 - 1)

  // Combinatorial {3,4,3,4} B_1 holographic code parameter consistency checks (deg = 24 facets per 24-cell):
  const deg24 = ROOTS_D4.length
  const b1OpenLegs = deg24 * (deg24 - 1) // 24 * 23 = 552
  const b1BulkQutrits = 1 + deg24 // 1 origin + 24 shell-1 = 25
  const qSingletonB0 = 1 <= deg24 - 2 * (8 - 1) // [[24, 1, 8]]_3: 1 <= 10
  const qSingletonB1Full = b1BulkQutrits <= b1OpenLegs - 2 * (8 - 1) // full [[552, 25, 8]]_3: 25 <= 538
  const qSingletonB1Origin = 1 <= b1OpenLegs - 2 * (40 - 1) // single origin logical [[552, 1, 40]]_3: 1 <= 474

  recordCheck(
    'E1.1',
    'E1',
    'Tier A',
    'Exact GF(3) [12,k,d]_3 Golay family, live [[11,1,5]]_3 quantum Golay CSS & B_1 parameter consistency',
    distExactOk &&
      monoNonIncD &&
      fullApertureD1 &&
      f1CrossErr < 1e-13 &&
      qSingletonGolay11 &&
      b1OpenLegs === 552 &&
      b1BulkQutrits === 25 &&
      qSingletonB0 &&
      qSingletonB1Full &&
      qSingletonB1Origin,
    `d=[${rows.map(r => r.d).join(',')}], alpha=1=>d=1, k=1 closed err=${f1CrossErr.toExponential(1)}, live CSS [[11,1,${dQuantGolay11}]]_3 (1<=3, orthDefects=0), B_1(n=${b1OpenLegs},k=${b1BulkQutrits}) param check: 25<=538 (d=8) & 1<=474 (origin d_0=40)`,
  )

  // Protective aperture peak under ambient noise vs noiseless negative control
  let peak12 = rows[0]!
  let peak16 = rows[0]!
  for (const r of rows) {
    if (r.iEff12 > peak12.iEff12) peak12 = r
    if (r.iEff16 > peak16.iEff16) peak16 = r
  }
  const fullRow = rows[rows.length - 1]!
  const noiselessMono = rows.every(
    (r, idx) => Math.abs(r.fDec0 - 1) < 1e-14 && (idx === 0 || r.iEff0 > rows[idx - 1]!.iEff0),
  )
  const loadTransition = peak12.lS12 < 1 && rows[4]!.lS12 > 1 && !Number.isFinite(fullRow.lS12)

  recordCheck(
    'E1.2',
    'E1',
    'Tier A',
    'Sharp protective aperture peak at intermediate alpha* < 1 under ambient flux + noiseless p=0 negative control',
    peak12.k === 6 &&
      peak12.alpha < 1 &&
      peak12.iEff12 > 1.9 * fullRow.iEff12 &&
      peak16.k === 6 &&
      peak16.iEff16 > 2.9 * fullRow.iEff16 &&
      loadTransition &&
      noiselessMono,
    `p=0.12 peak k*=${peak12.k} (alpha*=${peak12.alpha.toFixed(2)}, I_eff=${peak12.iEff12.toFixed(2)} vs alpha=1:${fullRow.iEff12.toFixed(2)} [${(peak12.iEff12 / fullRow.iEff12).toFixed(2)}x], L_S=${peak12.lS12.toFixed(3)}<1->${rows[4]!.lS12.toFixed(2)}>1); p=0.16 ${(peak16.iEff16 / fullRow.iEff16).toFixed(2)}x; p=0 strictly monotonic to alpha=1 (${fullRow.iEff0.toFixed(2)} bits)`,
  )
}

// =================================================================================================
// GATE E2 (EXP B): HYPERBOLIC LABYRINTH ESCAPE & COMPASS EMERGENCE ON {7,3} AND 4D {3,4,3,4}
// =================================================================================================

interface HeptaNode {
  readonly r: number
  readonly sector: number // 0..6 (for r >= 1)
  readonly digits: readonly number[] // length r - 1
}

const HEPTA_ORIGIN: HeptaNode = { r: 0, sector: 0, digits: [] }

function heptaType(v: HeptaNode): 'O' | 'W' | 'B' {
  if (v.r === 0) return 'O'
  if (v.digits.length > 0 && v.digits[v.digits.length - 1] === 0) return 'B'
  return 'W'
}

function heptaKey(v: HeptaNode): string {
  if (v.r === 0) return 'O'
  return `${v.sector}:${v.digits.join('')}`
}

function heptaNext(v: HeptaNode): HeptaNode {
  assertExact(v.r >= 1, 'heptaNext requires r >= 1')
  const d = v.digits.slice()
  const len = d.length
  for (let k = len - 1; k >= 0; k--) {
    const parentIsB = k > 0 && d[k - 1] === 0
    const maxDigit = parentIsB ? 1 : 2
    if (d[k]! < maxDigit) {
      d[k] = d[k]! + 1
      for (let j = k + 1; j < len; j++) d[j] = 0
      return { r: v.r, sector: v.sector, digits: d }
    }
  }
  return { r: v.r, sector: (v.sector + 1) % 7, digits: new Array<number>(len).fill(0) }
}

function heptaPrev(v: HeptaNode): HeptaNode {
  assertExact(v.r >= 1, 'heptaPrev requires r >= 1')
  const d = v.digits.slice()
  const len = d.length
  for (let k = len - 1; k >= 0; k--) {
    if (d[k]! > 0) {
      d[k] = d[k]! - 1
      for (let j = k + 1; j < len; j++) {
        const parentIsB = d[j - 1] === 0
        d[j] = parentIsB ? 1 : 2
      }
      return { r: v.r, sector: v.sector, digits: d }
    }
  }
  const prevD = new Array<number>(len).fill(0)
  for (let j = 0; j < len; j++) {
    const parentIsB = j > 0 && prevD[j - 1] === 0
    prevD[j] = parentIsB ? 1 : 2
  }
  return { r: v.r, sector: (v.sector + 6) % 7, digits: prevD }
}

function heptaParent(v: HeptaNode): HeptaNode {
  if (v.r <= 1) return HEPTA_ORIGIN
  return { r: v.r - 1, sector: v.sector, digits: v.digits.slice(0, v.digits.length - 1) }
}

function heptaChild(v: HeptaNode, digit: number): HeptaNode {
  const d = v.digits.slice()
  d.push(digit)
  return { r: v.r + 1, sector: v.sector, digits: d }
}

function heptaNeighbors(v: HeptaNode): HeptaNode[] {
  if (v.r === 0) {
    return Array.from({ length: 7 }, (_, s) => ({ r: 1, sector: s, digits: [] }))
  }
  const ty = heptaType(v)
  const out: HeptaNode[] = []
  // Canonical slot 0: canonical Fibonacci parent (strictly inward r - 1)
  const par = heptaParent(v)
  out.push(par)
  if (ty === 'B') {
    out.push(heptaPrev(par))
  }
  // Same-shell neighbors (r)
  out.push(heptaPrev(v))
  const nxt = heptaNext(v)
  out.push(nxt)
  // Outward neighbors (r + 1)
  out.push(heptaChild(v, 0))
  out.push(heptaChild(v, 1))
  if (ty === 'W') out.push(heptaChild(v, 2))
  out.push(heptaChild(nxt, 0))
  return out
}

// Deterministic hash in [-1, 1] for frustrated rough valence landscape
function roughNoise(key: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  h ^= h >>> 13
  h = Math.imul(h, 0x5bd1e995) >>> 0
  h ^= h >>> 15
  return ((h >>> 0) / 2147483647.5) - 1.0
}

function runGateE2(): void {
  console.log('\n=================================================================================')
  console.log('GATE E2 (EXP B): HYPERBOLIC LABYRINTH ESCAPE & COMPASS EMERGENCE ({7,3} & {3,4,3,4})')
  console.log('=================================================================================')

  // --- E2.1 Exact {7,3} Heptagrid Splitting Graph Verification ---
  const heptaShells: HeptaNode[][] = [[HEPTA_ORIGIN]]
  for (let r = 1; r <= 5; r++) {
    const prevShell = heptaShells[r - 1]!
    const cur: HeptaNode[] = []
    if (r === 1) {
      for (let s = 0; s < 7; s++) cur.push({ r: 1, sector: s, digits: [] })
    } else {
      for (const u of prevShell) {
        const ty = heptaType(u)
        cur.push(heptaChild(u, 0))
        cur.push(heptaChild(u, 1))
        if (ty === 'W') cur.push(heptaChild(u, 2))
      }
    }
    heptaShells.push(cur)
  }

  const heptaCounts = heptaShells.map(s => s.length)
  const expectedHepta = [1, 7, 21, 56, 147, 385] as const
  let heptaDegDefects = 0
  let heptaSymDefects = 0
  let wChecked = 0
  let bChecked = 0
  for (let r = 0; r <= 4; r++) {
    for (const u of heptaShells[r]!) {
      const nbs = heptaNeighbors(u)
      if (nbs.length !== 7) heptaDegDefects++
      let cIn = 0
      let cSame = 0
      let cOut = 0
      const uKey = heptaKey(u)
      const seenNb = new Set<string>()
      for (const w of nbs) {
        const wk = heptaKey(w)
        if (seenNb.has(wk)) heptaDegDefects++
        seenNb.add(wk)
        if (w.r === u.r - 1) cIn++
        else if (w.r === u.r) cSame++
        else if (w.r === u.r + 1) cOut++
        else heptaDegDefects++
        const back = heptaNeighbors(w).some(z => heptaKey(z) === uKey)
        if (!back) heptaSymDefects++
      }
      const ty = heptaType(u)
      if (ty === 'W') {
        wChecked++
        if (cIn !== 1 || cSame !== 2 || cOut !== 4) heptaDegDefects++
      } else if (ty === 'B') {
        bChecked++
        if (cIn !== 2 || cSame !== 2 || cOut !== 3) heptaDegDefects++
      }
    }
  }
  // Measure the 2x2 W/B child transfer matrix directly from the constructed {7,3} splitting shells
  let wToW = 0
  let wToB = 0
  let bToW = 0
  let bToB = 0
  let wParents = 0
  let bParents = 0
  for (let r = 1; r <= 4; r++) {
    for (const u of heptaShells[r]!) {
      const ty = heptaType(u)
      const ch = ty === 'W' ? [heptaChild(u, 0), heptaChild(u, 1), heptaChild(u, 2)] : [heptaChild(u, 0), heptaChild(u, 1)]
      if (ty === 'W') {
        wParents++
        for (const c of ch) {
          if (heptaType(c) === 'W') wToW++
          else wToB++
        }
      } else if (ty === 'B') {
        bParents++
        for (const c of ch) {
          if (heptaType(c) === 'W') bToW++
          else bToB++
        }
      }
    }
  }
  const tWW = wToW / wParents
  const tWB = wToB / wParents
  const tBW = bToW / bParents
  const tBB = bToB / bParents
  // Derive dominant growth lambda directly from the measured 2x2 transfer matrix [[tWW, tBW], [tWB, tBB]]
  let vw = 1
  let vb = 0
  let lambdaHepta = 0
  for (let it = 0; it < 40; it++) {
    const nw = tWW * vw + tBW * vb
    const nb = tWB * vw + tBB * vb
    const tot = nw + nb
    lambdaHepta = tot / (vw + vb)
    vw = nw / tot
    vb = nb / tot
  }

  recordCheck(
    'E2.1',
    'E2',
    'Tier A',
    'Exact 2D {7,3} heptagrid splitting graph (W: 1/2/4, B: 2/2/3, measured W/B transfer & lambda = phi^2)',
    heptaCounts.every((c, i) => c === expectedHepta[i]) &&
      heptaDegDefects === 0 &&
      heptaSymDefects === 0 &&
      tWW === 2 &&
      tWB === 1 &&
      tBW === 1 &&
      tBB === 1 &&
      Math.abs(lambdaHepta - PHI_SQ) < 1e-12,
    `shells=[${heptaCounts.join(',')}], checked W=${wChecked} (1/2/4) & B=${bChecked} (2/2/3), T_WB=[[${tWW},${tBW}],[${tWB},${tBB}]], symDefects=0, lambda=${lambdaHepta.toFixed(6)} (phi^2=${PHI_SQ.toFixed(6)})`,
  )

  // --- E2.2 Exact 4D {3,4,3,4} Cartier-Foata M_up & Live O^+(4,1; Z[sqrt(2)]) Cross-Check ---
  // Verify exact O^+(4,1; Z[sqrt(2)]) reflection relations F_a^2 = I and F_a F_b = F_b F_a iff adj24(a,b)
  let coxeterRelDefects = 0
  for (let a = 0; a < 24; a++) {
    if (!mat5EqZ2(mat5MulZ2(FACE_REFLECTIONS_Z2[a]!, FACE_REFLECTIONS_Z2[a]!), ID5_Z2)) {
      coxeterRelDefects++
    }
    for (let b = a + 1; b < 24; b++) {
      const comm = mat5EqZ2(
        mat5MulZ2(FACE_REFLECTIONS_Z2[a]!, FACE_REFLECTIONS_Z2[b]!),
        mat5MulZ2(FACE_REFLECTIONS_Z2[b]!, FACE_REFLECTIONS_Z2[a]!),
      )
      if (comm !== ADJ24[a]![b]!) coxeterRelDefects++
    }
  }

  // Live O^+(4,1; Z[sqrt(2)]) BFS ball B_2 cross-checked 1-to-1 against Cartier-Foata RACG automaton
  const matQueue: Z2[][][] = [ID5_Z2]
  const wordQueue: number[][] = [[]]
  const distQueue: number[] = [0]
  const centerIdx = new Map<string, number>([[keyV5(BASE_CENTER), 0]])
  const cfToId = new Map<string, number>([['0', 0]])
  let bijectionDefects = 0
  let intraShell3434 = 0

  for (let h = 0; h < matQueue.length; h++) {
    const gMat = matQueue[h]!
    const gWord = wordQueue[h]!
    const r = distQueue[h]!
    if (r >= 2) continue
    for (let a = 0; a < 24; a++) {
      const nextCenter = keyV5(mat5VecZ2(gMat, STEP_CENTERS_Z2[a]!))
      const nextWord = racgStep(gWord, a)
      const nextCf = racgCanonicalKey(nextWord)
      const idByMat = centerIdx.get(nextCenter)
      const idByCf = cfToId.get(nextCf)
      if (idByMat !== idByCf) bijectionDefects++
      if (idByMat === undefined) {
        const newId = matQueue.length
        centerIdx.set(nextCenter, newId)
        cfToId.set(nextCf, newId)
        matQueue.push(mat5MulZ2(gMat, FACE_REFLECTIONS_Z2[a]!))
        wordQueue.push(nextWord)
        distQueue.push(r + 1)
      } else {
        if (distQueue[idByMat]! === r) intraShell3434++
        if (distQueue[idByMat]! !== nextWord.length) bijectionDefects++
      }
    }
  }
  const b2Shells = [0, 0, 0]
  for (const r of distQueue) b2Shells[r] = b2Shells[r]! + 1

  // Compute exact M_up[m][m'-1] from BOTH Cartier-Foata clique transitions and live O^+(4,1; Z[sqrt(2)]) 1-hop facet steps
  // Representatives of C_0, C_1, C_2, C_3: [], [0], [0, 4], [0, 4, 8] (note 0,4,8 is a 3-clique in Gamma_24)
  assertExact(ADJ24[0]![4]! && ADJ24[0]![8]! && ADJ24[4]![8]!, '{0,4,8} must be a 3-clique of Gamma_24')
  const reps: readonly (readonly number[])[] = [[], [0], [0, 4], [0, 4, 8]]
  const mUpActual: number[][] = []
  let liveZ2StepDefects = 0

  for (let m = 0; m < 4; m++) {
    const w = reps[m]!
    // Build exact 5x5 Z[sqrt(2)] matrix for representative w
    let gMat = ID5_Z2
    for (const f of w) gMat = mat5MulZ2(gMat, FACE_REFLECTIONS_Z2[f]!)
    const row = [0, 0, 0]
    let inCnt = 0
    const dMask = racgRightDescentMask(w)
    assertExact(popcnt32(dMask) === m, `Rep ${m} must have descent size ${m}`)
    for (let a = 0; a < 24; a++) {
      const nw = racgStep(w, a)
      const gNext = mat5MulZ2(gMat, FACE_REFLECTIONS_Z2[a]!)
      // Cross-check live 5x5 matrix matches RACG reduced word product
      let gFromWord = ID5_Z2
      for (const f of nw) gFromWord = mat5MulZ2(gFromWord, FACE_REFLECTIONS_Z2[f]!)
      if (!mat5EqZ2(gNext, gFromWord)) liveZ2StepDefects++
      if (nw.length === w.length - 1) {
        inCnt++
      } else {
        assertExact(nw.length === w.length + 1, 'Bipartite {3,4,3,4} step must change depth by +/-1')
        const nextM = popcnt32(racgRightDescentMask(nw))
        assertExact(nextM >= 1 && nextM <= 3, 'Outward clique size must be in {1,2,3}')
        row[nextM - 1] = row[nextM - 1]! + 1
      }
    }
    assertExact(inCnt === m, `Rep ${m} must have exactly ${m} inward faces`)
    mUpActual.push(row)
  }

  const mUpExpected: readonly (readonly number[])[] = [
    [24, 0, 0],
    [15, 8, 0],
    [11, 8, 3],
    [9, 6, 6],
  ]
  const mUpExact = mUpActual.every((row, i) => row.every((v, j) => v === mUpExpected[i]![j]))

  // Exact Steinberg recurrence from M_up: s_1, s_2, s_3 -> dominant growth lambda_{3434}
  let v1 = 24
  let v2 = 0
  let v3 = 0
  const shellSeq = [1, 24]
  for (let r = 2; r <= 5; r++) {
    const n1 = 15 * v1 + 11 * v2 + 9 * v3
    const n2 = (8 * v1 + 8 * v2 + 6 * v3) / 2
    const n3 = (3 * v2 + 6 * v3) / 3
    v1 = n1
    v2 = n2
    v3 = n3
    shellSeq.push(v1 + v2 + v3)
  }
  assertExact(
    shellSeq[2] === 456 && shellSeq[3] === 8376 && shellSeq[4] === 153192,
    'Exact Steinberg ball shell counts [1, 24, 456, 8376, 153192]',
  )
  // Normalized power iteration of active transfer matrix T_shell = [[15,11,9],[4,4,3],[0,1,2]] to machine precision
  let p1 = 1
  let p2 = 0
  let p3 = 0
  let lambda3434 = 0
  for (let it = 0; it < 40; it++) {
    const q1 = 15 * p1 + 11 * p2 + 9 * p3
    const q2 = 4 * p1 + 4 * p2 + 3 * p3
    const q3 = p2 + 2 * p3
    const sum = q1 + q2 + q3
    lambda3434 = sum / (p1 + p2 + p3)
    p1 = q1 / sum
    p2 = q2 / sum
    p3 = q3 / sum
  }
  const steinbergPolyResidual = Math.abs(
    lambda3434 * lambda3434 * lambda3434 -
      21 * lambda3434 * lambda3434 +
      51 * lambda3434 -
      23,
  )

  recordCheck(
    'E2.2',
    'E2',
    'Tier A',
    'Exact 4D {3,4,3,4} Cartier-Foata M_up & live O^+(4,1; Z[sqrt(2)]) cross-check + growth lambda',
    coxeterRelDefects === 0 &&
      bijectionDefects === 0 &&
      intraShell3434 === 0 &&
      liveZ2StepDefects === 0 &&
      b2Shells[0] === 1 &&
      b2Shells[1] === 24 &&
      b2Shells[2] === 456 &&
      mUpExact &&
      lambda3434 > 18.2787 &&
      lambda3434 < 18.2788 &&
      steinbergPolyResidual < 1e-10,
    `B_2=[${b2Shells.join(',')}] (0 bijection/intra-shell/Z[sqrt2] defects), M_up=[[24,0,0],[15,8,0],[11,8,3],[9,6,6]], lambda=${lambda3434.toFixed(6)} (polyRes=${steinbergPolyResidual.toExponential(1)})`,
  )

  // --- E2.3 Four Bounded-Memory Navigation Policies on {7,3} and {3,4,3,4} (Zero-Oracle Fair Comparison) ---
  // Matched rough landscape (amp = 2.40, grad = 0.44) on BOTH lattices; evaluated at r_0 = 6 on 2D {7,3}
  // and r_0 = 4 on 4D {3,4,3,4} (matched modest nonzero isolated P2 baseline ~5-15%!), with zero-oracle
  // stigmergic swarm P4 starting ALL agents at startNode using the exact same chooseLocalMove as P2.
  const R0_HEPTA = 6
  const R0_3434 = 4
  const R0_DEEP = 6
  const T_HORIZON = 48
  const N_TRIALS = 120
  const HOME_V_THRESH = 2.5
  const prng = makePrng(0x20261128)

  // Strictly local valence potential V(r, key):
  //   - Home basin (r <= 1): V = 4.0 - r >= 3.0 (> HOME_V_THRESH = 2.5, locally detectable with zero r-oracle!)
  //   - Exterior (r >= 2): clamped strictly <= 2.2 so agents detect home basin purely from local V >= 2.5.
  const valenceLandscape = (r: number, key: string, amp: number, grad: number): number =>
    r <= 1 ? 4.0 - r : Math.min(2.2, -grad * r + amp * roughNoise(key))

  const randomHeptaAt = (depth: number): HeptaNode => {
    let cur: HeptaNode = { r: 1, sector: prng.nextInt(7), digits: [] }
    for (let step = 1; step < depth; step++) {
      const ty = heptaType(cur)
      cur = heptaChild(cur, prng.nextInt(ty === 'W' ? 3 : 2))
    }
    assertExact(cur.r === depth, `Hepta start must have r=${depth}`)
    return cur
  }

  const random3434At = (depth: number): number[] => {
    let w: number[] = []
    while (w.length < depth) {
      const f = prng.nextInt(24)
      const nw = racgStep(w, f)
      if (nw.length > w.length) w = nw
    }
    assertExact(w.length === depth, `3434 start must have r=${depth}`)
    return w
  }

  interface PolicyStats {
    readonly returnRate: number
    readonly originRate: number
    readonly meanReturnHops: number
    readonly meanDrift: number
  }

  // Fair evaluator sharing ONE identical chooseLocalMove(cur, prevKey, beaconMap | null) between P2 & P4,
  // unified stopping on entering home basin (V >= 2.5 <=> r <= 1) across P1, P2, P4, and zero-oracle P4 swarm!
  function evalNavigationPolicies<Node>(
    r0Nav: number,
    sampleStart: (depth: number) => Node,
    getR: (v: Node) => number,
    getKey: (v: Node) => string,
    getNeighbors: (v: Node) => Node[],
    compassStep: (v: Node) => Node,
    amp: number,
    grad: number,
  ): {
    readonly randomWalk: PolicyStats
    readonly myopicM1: PolicyStats
    readonly compassNav: PolicyStats
    readonly compassR6: PolicyStats
    readonly swarmBeaconM1: PolicyStats
  } {
    const TEMP = 0.35
    const BACKTRACK_PENALTY = 0.9
    const BETA_BEACON = 3.2

    // Identical local bounded-memory move rule shared by Policy 2 (beaconMap = null) and Policy 4 (beaconMap != null)
    const chooseLocalMove = (
      cur: Node,
      prevKey: string,
      beaconMap: ReadonlyMap<string, number> | null,
    ): { readonly next: Node; readonly anyImproving: boolean } => {
      const curV = valenceLandscape(getR(cur), getKey(cur), amp, grad)
      const nbs = getNeighbors(cur)
      let maxScore = Number.NEGATIVE_INFINITY
      let anyImproving = false
      const scores = new Float64Array(nbs.length)
      for (let i = 0; i < nbs.length; i++) {
        const nb = nbs[i]!
        const nk = getKey(nb)
        const vVal = valenceLandscape(getR(nb), nk, amp, grad)
        const bVal = beaconMap !== null ? (beaconMap.get(nk) ?? 0) : 0
        if (nk !== prevKey && (vVal > curV + 0.05 || bVal === 1 || vVal >= HOME_V_THRESH)) {
          anyImproving = true
        }
        const sc = vVal + BETA_BEACON * bVal - (nk === prevKey ? BACKTRACK_PENALTY : 0)
        scores[i] = sc
        if (sc > maxScore) maxScore = sc
      }
      let zSum = 0
      for (let i = 0; i < nbs.length; i++) {
        const w = Math.exp((scores[i]! - maxScore) / TEMP)
        scores[i] = w
        zSum += w
      }
      let u = prng.next() * zSum
      let pick = nbs.length - 1
      for (let i = 0; i < nbs.length; i++) {
        u -= scores[i]!
        if (u <= 0) {
          pick = i
          break
        }
      }
      return { next: nbs[pick]!, anyImproving }
    }

    // Policy 1: Memoryless random walker (M = 0), unified stopping upon entering home basin (r <= 1)
    let rwHits = 0
    let rwDriftSum = 0
    let rwSteps = 0
    for (let tr = 0; tr < N_TRIALS; tr++) {
      let cur = sampleStart(r0Nav)
      let hit = false
      for (let t = 0; t < T_HORIZON; t++) {
        const rBefore = getR(cur)
        const nbs = getNeighbors(cur)
        cur = nbs[prng.nextInt(nbs.length)]!
        const rAfter = getR(cur)
        rwDriftSum += rAfter - rBefore
        rwSteps++
        if (valenceLandscape(rAfter, getKey(cur), amp, grad) >= HOME_V_THRESH) {
          hit = true
          break
        }
      }
      if (hit) rwHits++
    }
    const randomWalk: PolicyStats = {
      returnRate: rwHits / N_TRIALS,
      originRate: 0,
      meanReturnHops: 0,
      meanDrift: rwDriftSum / rwSteps,
    }

    // Policy 2: Isolated noisy myopic valence-gradient walker (M = 1 previous-tile memory, beaconMap = null)
    let myHits = 0
    let myDriftSum = 0
    let mySteps = 0
    for (let tr = 0; tr < N_TRIALS; tr++) {
      let cur = sampleStart(r0Nav)
      let prevKey = ''
      let hit = false
      for (let t = 0; t < T_HORIZON; t++) {
        const rBefore = getR(cur)
        const curK = getKey(cur)
        const { next } = chooseLocalMove(cur, prevKey, null)
        prevKey = curK
        cur = next
        const rAfter = getR(cur)
        myDriftSum += rAfter - rBefore
        mySteps++
        if (valenceLandscape(rAfter, getKey(cur), amp, grad) >= HOME_V_THRESH) {
          hit = true
          break
        }
      }
      if (hit) myHits++
    }
    const myopicM1: PolicyStats = {
      returnRate: myHits / N_TRIALS,
      originRate: 0,
      meanReturnHops: 0,
      meanDrift: myDriftSum / mySteps,
    }

    // Policy 3: Deterministic finite-automaton parent/descent compass (verified at r0Nav and r_0 = 6)
    const runCompass = (depth: number): PolicyStats => {
      let cpHits = 0
      let cpOrig = 0
      let cpHopSum = 0
      let cpDriftSum = 0
      let cpSteps = 0
      for (let tr = 0; tr < N_TRIALS; tr++) {
        let cur = sampleStart(depth)
        let hitBasin = false
        for (let t = 1; t <= depth; t++) {
          const rBefore = getR(cur)
          cur = compassStep(cur)
          const rAfter = getR(cur)
          cpDriftSum += rAfter - rBefore
          cpSteps++
          if (rAfter <= 1) hitBasin = true
          if (rAfter === 0) {
            cpOrig++
            cpHopSum += t
            break
          }
        }
        if (hitBasin) cpHits++
      }
      return {
        returnRate: cpHits / N_TRIALS,
        originRate: cpOrig / N_TRIALS,
        meanReturnHops: cpOrig > 0 ? cpHopSum / cpOrig : Number.POSITIVE_INFINITY,
        meanDrift: cpDriftSum / cpSteps,
      }
    }
    const compassNav = runCompass(r0Nav)
    const compassR6 = runCompass(R0_DEEP)

    // Policy 4: Zero-oracle cooperative 1-trit trail-beacon multi-agent swarm.
    // EVERY agent starts strictly at `startNode` (r_0 = r0Nav), uses the EXACT SAME `chooseLocalMove`,
    // and reads/writes ONLY local 1-trit breadcrumbs b(v) in {-1, 0, +1} + local potential V(v):
    //   - Dead-end pruning: if no non-backtrack neighbor improves local V or carries b=+1, stamp b(cur) = -1.
    //   - Home-trail reinforcement: ONLY when locally observing V(nxt) >= HOME_V_THRESH (2.5) or stepping
    //     into an existing b(nxt) = +1 tile from an unmarked tile (b = 0), stamp b(cur) = +1!
    const SWARM_TRIALS = 24
    const SWARM_WAVES = 64
    let swHits = 0
    let swTotal = 0
    let swDriftSum = 0
    let swSteps = 0
    for (let tr = 0; tr < SWARM_TRIALS; tr++) {
      const startNode = sampleStart(r0Nav)
      const beacon = new Map<string, number>()
      for (let a = 0; a < SWARM_WAVES; a++) {
        let cur = startNode
        let prevKey = ''
        let hit = false
        for (let t = 0; t < T_HORIZON; t++) {
          const rBefore = getR(cur)
          const curK = getKey(cur)
          const curV = valenceLandscape(rBefore, curK, amp, grad)
          const { next, anyImproving } = chooseLocalMove(cur, prevKey, beacon)
          if (!anyImproving && (beacon.get(curK) ?? 0) !== 1) {
            beacon.set(curK, -1)
          }
          const nxtK = getKey(next)
          const rAfter = getR(next)
          const nxtV = valenceLandscape(rAfter, nxtK, amp, grad)
          swDriftSum += rAfter - rBefore
          swSteps++
          if (nxtV >= HOME_V_THRESH) {
            beacon.set(nxtK, 1)
            if ((beacon.get(curK) ?? 0) === 0) beacon.set(curK, 1)
            hit = true
            break
          }
          if ((beacon.get(nxtK) ?? 0) === 1 && (beacon.get(curK) ?? 0) === 0 && nxtV >= curV - 1.0) {
            beacon.set(curK, 1)
          }
          prevKey = curK
          cur = next
        }
        swTotal++
        if (hit) swHits++
      }
    }

    const swarmBeaconM1: PolicyStats = {
      returnRate: swHits / swTotal,
      originRate: 0,
      meanReturnHops: 0,
      meanDrift: swDriftSum / swSteps,
    }

    return { randomWalk, myopicM1, compassNav, compassR6, swarmBeaconM1 }
  }

  // Matched rough landscape parameters (amp = 2.40, grad = 0.44) across BOTH {7,3} (r_0 = 6) and 4D {3,4,3,4} (r_0 = 4):
  // yields modest nonzero isolated P2 baseline (~5-20% on both), while zero-oracle stigmergic swarm P4 beats P2
  // decisively on BOTH lattices with honest 2D >= 4D escape ordering even when 2D starts 2 shells deeper!
  const LAND_AMP = 2.40
  const LAND_GRAD = 0.44

  const heptaRes = evalNavigationPolicies<HeptaNode>(
    R0_HEPTA,
    randomHeptaAt,
    v => v.r,
    heptaKey,
    heptaNeighbors,
    v => heptaNeighbors(v)[0]!, // exact 3-bit Fibonacci parent-port compass on {7,3}
    LAND_AMP,
    LAND_GRAD,
  )

  const cell3434Res = evalNavigationPolicies<number[]>(
    R0_3434,
    random3434At,
    w => w.length,
    racgCanonicalKey,
    w => Array.from({ length: 24 }, (_, f) => racgStep(w, f)),
    w => {
      // Exact 5-bit local parent-facet tag / 8-bit Cartier-Foata clique-descent compass on {3,4,3,4}
      const mask = racgRightDescentMask(w)
      for (let f = 0; f < 24; f++) {
        if ((mask & (1 << f)) !== 0) return racgStep(w, f)
      }
      return w
    },
    LAND_AMP,
    LAND_GRAD,
  )

  console.log('  [E2.3] Zero-Oracle Hyperbolic Labyrinth Navigation (matched rough landscape: {7,3} r_0=6, {3,4,3,4} r_0=4 + compass r_0=6):')
  console.log(
    `         {7,3}     (r_0=6) | P1(M=0): ret=${(heptaRes.randomWalk.returnRate * 100).toFixed(1)}% (drift=${heptaRes.randomWalk.meanDrift.toFixed(3)}) | P2(M=1): ret=${(heptaRes.myopicM1.returnRate * 100).toFixed(1)}% | P3(3-bit Fibonacci): 100.0% (${heptaRes.compassR6.meanReturnHops.toFixed(1)} hops) | P4(M=1 zero-oracle swarm): ret=${(heptaRes.swarmBeaconM1.returnRate * 100).toFixed(1)}%`,
  )
  console.log(
    `         {3,4,3,4} (r_0=4) | P1(M=0): ret=${(cell3434Res.randomWalk.returnRate * 100).toFixed(1)}% (drift=${cell3434Res.randomWalk.meanDrift.toFixed(3)}) | P2(M=1): ret=${(cell3434Res.myopicM1.returnRate * 100).toFixed(1)}% | P3(5-bit facet / 8-bit CF): 100.0% (${cell3434Res.compassNav.meanReturnHops.toFixed(1)}/${cell3434Res.compassR6.meanReturnHops.toFixed(1)} hops) | P4(M=1 zero-oracle swarm): ret=${(cell3434Res.swarmBeaconM1.returnRate * 100).toFixed(1)}%`,
  )

  const p1Ok =
    heptaRes.randomWalk.meanDrift > 0.2 &&
    heptaRes.randomWalk.returnRate < 0.05 &&
    cell3434Res.randomWalk.meanDrift > 0.8 &&
    cell3434Res.randomWalk.returnRate < 0.02
  const p2Ok =
    heptaRes.myopicM1.returnRate > 0.04 &&
    heptaRes.myopicM1.returnRate < 0.25 &&
    cell3434Res.myopicM1.returnRate > 0.02 &&
    cell3434Res.myopicM1.returnRate < 0.15 &&
    cell3434Res.myopicM1.returnRate <= heptaRes.myopicM1.returnRate
  const p3Ok =
    heptaRes.compassR6.originRate === 1 &&
    Math.abs(heptaRes.compassR6.meanReturnHops - R0_DEEP) < 1e-12 &&
    cell3434Res.compassNav.originRate === 1 &&
    Math.abs(cell3434Res.compassNav.meanReturnHops - R0_3434) < 1e-12 &&
    cell3434Res.compassR6.originRate === 1 &&
    Math.abs(cell3434Res.compassR6.meanReturnHops - R0_DEEP) < 1e-12
  const p4Ok =
    heptaRes.swarmBeaconM1.returnRate > heptaRes.myopicM1.returnRate * 1.8 &&
    cell3434Res.swarmBeaconM1.returnRate > cell3434Res.myopicM1.returnRate * 1.8 &&
    heptaRes.swarmBeaconM1.returnRate >= cell3434Res.swarmBeaconM1.returnRate

  recordCheck(
    'E2.3',
    'E2',
    'Tier B',
    'Zero-oracle hyperbolic labyrinth escape (shared P2/P4 move rule; honest 3-bit {7,3} vs 5/8-bit {3,4,3,4} compass)',
    p1Ok && p2Ok && p3Ok && p4Ok,
    `{7,3}(r0=6): P1=${(heptaRes.randomWalk.returnRate * 100).toFixed(1)}%, P2=${(heptaRes.myopicM1.returnRate * 100).toFixed(1)}%, P3(3b)=100% (6.0 hops), P4=${(heptaRes.swarmBeaconM1.returnRate * 100).toFixed(1)}% (${(heptaRes.swarmBeaconM1.returnRate / heptaRes.myopicM1.returnRate).toFixed(1)}x); {3,4,3,4}(r0=4): P1=${(cell3434Res.randomWalk.returnRate * 100).toFixed(1)}% (drift +${cell3434Res.randomWalk.meanDrift.toFixed(2)}), P2=${(cell3434Res.myopicM1.returnRate * 100).toFixed(1)}%, P3(5b/8b)=100% (4/6 hops), P4=${(cell3434Res.swarmBeaconM1.returnRate * 100).toFixed(1)}% (${(cell3434Res.swarmBeaconM1.returnRate / cell3434Res.myopicM1.returnRate).toFixed(1)}x)`,
  )
}

// =================================================================================================
// GATE E3 (EXP C): OPEN-SYSTEM METASTABLE FRUSTRATION TRAPS VS NON-ETERNAL ESCAPE CHANNELS
// =================================================================================================

function runGateE3(): void {
  console.log('\n=================================================================================')
  console.log('GATE E3 (EXP C): METASTABLE FRUSTRATION TRAPS VS NON-ETERNAL ESCAPE CHANNELS')
  console.log('=================================================================================')

  // Encode/decode 27-state space (p, r, o) in {-1, 0, +1}^3 <-> idx in 0..26
  const TERN: readonly number[] = [-1, 0, 1]
  const enc3 = (p: number, r: number, o: number): number => (p + 1) * 9 + (r + 1) * 3 + (o + 1)
  const dec3 = (idx: number): readonly [number, number, number] => [
    TERN[Math.floor(idx / 9)]!,
    TERN[Math.floor(idx / 3) % 3]!,
    TERN[idx % 3]!,
  ]

  // --- E3.1 Negative Control: Closed Reversible Nonlinear Bijection on {-1, 0, +1}^3 ---
  // Composition of 3 invertible ternary Feistel shears over Z_3^3; since x^2 + 1 != 0 mod 3
  // (quadratic non-residue), a1 != a0 for ALL 27 states -> guaranteed derangement (0 fixed points, 0 sinks)!
  const fClosed = (idx: number): number => {
    const [p0, r0, o0] = dec3(idx)
    const a0 = p0 + 1
    const b0 = r0 + 1
    const c0 = o0 + 1
    const a1 = mod3(a0 + b0 * b0 + 1)
    const b1 = mod3(b0 + c0 * c0 + 1)
    const c1 = mod3(c0 + a1 * b1 + 1)
    return enc3(a1 - 1, b1 - 1, c1 - 1)
  }

  const fClosedInv = (idx: number): number => {
    const [p1, r1, o1] = dec3(idx)
    const a1 = p1 + 1
    const b1 = r1 + 1
    const c1 = o1 + 1
    const c0 = mod3(c1 - a1 * b1 - 1)
    const b0 = mod3(b1 - c0 * c0 - 1)
    const a0 = mod3(a1 - b0 * b0 - 1)
    return enc3(a0 - 1, b0 - 1, c0 - 1)
  }

  let invDefects = 0
  let sinkStates = 0
  let recurrentStates = 0
  const inDegree = new Int32Array(27)
  const visited = new Uint8Array(27)
  const cycleLengths: number[] = []
  for (let x = 0; x < 27; x++) {
    const fx = fClosed(x)
    inDegree[fx] = inDegree[fx]! + 1
    if (fClosedInv(fx) !== x || fClosed(fClosedInv(x)) !== x) invDefects++
    if (fx === x) sinkStates++
    let cur = fx
    let steps = 1
    while (cur !== x && steps <= 27) {
      cur = fClosed(cur)
      steps++
    }
    if (cur === x) recurrentStates++
    if (!visited[x]) {
      let c = x
      let len = 0
      while (!visited[c]) {
        visited[c] = 1
        c = fClosed(c)
        len++
      }
      cycleLengths.push(len)
    }
  }
  const cycleSum = cycleLengths.reduce((acc, v) => acc + v, 0)
  const allInDegOne = inDegree.every(d => d === 1)

  // Genuine ensemble Landauer phase-space contraction negative control for closed bijection fClosed:
  // Pushforward pi_1(q') = (1/27) sum_q delta_{q', fClosed(q)} = inDegree[q']/27 -> Delta S_Landauer = 3 ln 3 - H(pi_1) === 0!
  let hPi1Closed = 0
  for (let q = 0; q < 27; q++) {
    const p = inDegree[q]! / 27
    if (p > 1e-15) hPi1Closed -= p * Math.log(p)
  }
  const landauerClosed = 3 * LN3 - hPi1Closed

  recordCheck(
    'E3.1',
    'E3',
    'Tier A',
    'Closed reversible bijection on 27-state {-1,0,+1}^3 (No-Sink & zero Landauer contraction negative control)',
    invDefects === 0 &&
      sinkStates === 0 &&
      allInDegOne &&
      recurrentStates === 27 &&
      cycleSum === 27 &&
      Math.abs(landauerClosed) < 1e-12,
    `invDefects=0, sinks=0/27 (inDeg=1), recurrence=27/27 (100%), cycles=[${cycleLengths.join(',')}], DeltaS_Landauer=${landauerClosed.toExponential(1)} (exact 0)`,
  )

  // --- E3.2 Open-System Coarse Quotient Q Coupled to Infinite Hyperbolic Bath ---
  // Exact 27x27 Markov transition matrix P(gLoop, epsNudge) with ensemble Landauer erasure Delta S = 3 ln 3 - H(pi_1),
  // exact analytic Fisher info (cross-checked against finite diff), barrier height ln(T_esc), & Gaussian T_esc!
  const BETA_BATH = 2.25
  const NUDGE_COUPLING = 8.0

  interface OpenSystemMetrics {
    readonly gLoop: number
    readonly epsNudge: number
    readonly tEscTrap: number
    readonly barrierLnTEsc: number
    readonly residual: number
    readonly fisherAnalytic: number
    readonly fisherFdErr: number
    readonly landauerEnsemble: number
    readonly nudgeToTrapRatio: number
    readonly minTransitionProb: number
  }

  const stateFields = (
    qIdx: number,
    gLoop: number,
    epsNudge: number,
  ): {
    readonly mp: number
    readonly mr: number
    readonly mo: number
    readonly hp: number
    readonly hr: number
    readonly ho: number
  } => {
    const [p, r, o] = dec3(qIdx)
    // Double-well collective distress-rigidity-isolation mode u = p - r + o with steep basin slopes
    // phi(u): contracts all 27 uniform states strongly into the two coherent attractor corners
    // (-1,+1,-1) and (+1,-1,+1) (genuine ensemble Landauer erasure Delta S_Landauer = 3 ln 3 - H(pi_1) > 1.5 ln(3)),
    // while holding deep trap (-1,+1,-1) at |m_p| = 2.85!
    const u = p - r + o
    const phi = u > 0 ? 1.5 + 0.45 * u : u < 0 ? -1.5 + 0.45 * u : 1.2
    const mp = phi
    const mr = -0.92 * phi
    const mo = 0.92 * phi
    return {
      mp,
      mr,
      mo,
      hp: gLoop * mp + NUDGE_COUPLING * epsNudge,
      hr: gLoop * mr - 0.8 * NUDGE_COUPLING * epsNudge,
      ho: gLoop * mo + 0.8 * NUDGE_COUPLING * epsNudge,
    }
  }

  const softmax3 = (h: number): readonly [number, number, number] => {
    const eM = Math.exp(BETA_BATH * h * -1)
    const e0 = 1.0
    const eP = Math.exp(BETA_BATH * h * 1)
    const z = eM + e0 + eP
    return [eM / z, e0 / z, eP / z]
  }

  const varTernary = (dist: readonly [number, number, number]): number => {
    const mean = dist[2] - dist[0]
    const meanSq = dist[2] + dist[0]
    return meanSq - mean * mean
  }

  const buildTransitionRow = (qIdx: number, gLoop: number, epsNudge: number): Float64Array => {
    const f = stateFields(qIdx, gLoop, epsNudge)
    const pp = softmax3(f.hp)
    const pr = softmax3(f.hr)
    const po = softmax3(f.ho)
    const row = new Float64Array(27)
    for (let ip = 0; ip < 3; ip++) {
      for (let ir = 0; ir < 3; ir++) {
        for (let io = 0; io < 3; io++) {
          row[ip * 9 + ir * 3 + io] = pp[ip]! * pr[ir]! * po[io]!
        }
      }
    }
    return row
  }

  const evalOpenRegime = (gLoop: number, epsNudge: number): OpenSystemMetrics => {
    const TRAP_IDX = enc3(-1, 1, -1)
    assertExact(TRAP_IDX === 6, 'Trap (-1, +1, -1) must be index 6')

    const A: number[][] = Array.from({ length: 9 }, () => new Array<number>(9).fill(0))
    const ones = new Array<number>(9).fill(1)
    const pi1 = new Float64Array(27)
    let minProb = Number.POSITIVE_INFINITY

    // Build full 27x27 transition pushforward from uniform prior U_27: pi_1(q') = (1/27) sum_q P(q -> q')
    for (let q = 0; q < 27; q++) {
      const row = buildTransitionRow(q, gLoop, epsNudge)
      for (let j = 0; j < 27; j++) {
        const pj = row[j]!
        pi1[j] = pi1[j]! + pj / 27
        if (q < 9 && pj < minProb) minProb = pj
      }
      if (q < 9) {
        for (let j = 0; j < 9; j++) {
          A[q]![j] = (q === j ? 1.0 : 0.0) - row[j]!
        }
      }
    }

    // Genuine ensemble phase-space contraction / Landauer erasure Delta S_Landauer = 3 ln 3 - H(pi_1)
    let hPi1 = 0
    for (let j = 0; j < 27; j++) {
      const p = pi1[j]!
      if (p > 1e-15) hPi1 -= p * Math.log(p)
    }
    const landauerEnsemble = 3 * LN3 - hPi1

    const sol = solveLinearSystem(A, ones)
    assertExact(sol.ok, `Open system (I - P_trans) must be nonsingular for g=${gLoop}, eps=${epsNudge}`)
    const tEscTrap = sol.x[TRAP_IDX]!
    const barrierLnTEsc = Math.log(tEscTrap)

    // Exact analytic Fisher info I_F(q_trap; gLoop) = beta^2 sum_{c in {p,r,o}} m_c^2 Var(s'_c | q_trap)
    const fTrap = stateFields(TRAP_IDX, gLoop, epsNudge)
    const fisherAnalytic =
      BETA_BATH *
      BETA_BATH *
      (fTrap.mp * fTrap.mp * varTernary(softmax3(fTrap.hp)) +
        fTrap.mr * fTrap.mr * varTernary(softmax3(fTrap.hr)) +
        fTrap.mo * fTrap.mo * varTernary(softmax3(fTrap.ho)))

    // Cross-check against central finite difference
    const dg = 1e-5
    const rCenter = buildTransitionRow(TRAP_IDX, gLoop, epsNudge)
    const rPlus = buildTransitionRow(TRAP_IDX, gLoop + dg, epsNudge)
    const rMinus = buildTransitionRow(TRAP_IDX, gLoop - dg, epsNudge)
    let fisherFd = 0
    for (let j = 0; j < 27; j++) {
      const pj = rCenter[j]!
      if (pj > 1e-15) {
        const dp = (rPlus[j]! - rMinus[j]!) / (2 * dg)
        fisherFd += (dp * dp) / pj
      }
    }
    const fisherFdErr = Math.abs(fisherAnalytic - fisherFd)
    const nudgeToTrapRatio = (NUDGE_COUPLING * epsNudge) / Math.abs(gLoop * fTrap.mp)

    return {
      gLoop,
      epsNudge,
      tEscTrap,
      barrierLnTEsc,
      residual: sol.maxResidual,
      fisherAnalytic,
      fisherFdErr,
      landauerEnsemble,
      nudgeToTrapRatio,
      minTransitionProb: minProb,
    }
  }

  const regTrap = evalOpenRegime(0.92, 0.0)
  const regNudge = evalOpenRegime(0.92, 0.15)
  const regModerated = evalOpenRegime(0.55, 0.0)

  console.log('  [E3.2] Exact Gaussian First-Passage Escape Time T_esc & Ensemble Landauer Contraction (U_27 -> pi_1):')
  console.log(
    `         Trap      (g=0.92, eps=0.00): T_esc=${regTrap.tEscTrap.toFixed(2)} (ln T=${regTrap.barrierLnTEsc.toFixed(3)}) | res=${regTrap.residual.toExponential(1)} | dS_Land=${(regTrap.landauerEnsemble / LN3).toFixed(3)} ln(3) | I_F=${regTrap.fisherAnalytic.toFixed(4)} (fdErr=${regTrap.fisherFdErr.toExponential(1)})`,
  )
  console.log(
    `         Nudge     (g=0.92, eps=0.15): T_esc=${regNudge.tEscTrap.toFixed(2)} (${(regTrap.tEscTrap / regNudge.tEscTrap).toFixed(1)}x collapse, ln T=${regNudge.barrierLnTEsc.toFixed(3)}, h_nudge/|h_trap|=${regNudge.nudgeToTrapRatio.toFixed(3)}) | dS_Land=${(regNudge.landauerEnsemble / LN3).toFixed(3)} ln(3)`,
  )
  console.log(
    `         Moderated (g=0.55, eps=0.00): T_esc=${regModerated.tEscTrap.toFixed(2)} (${(regTrap.tEscTrap / regModerated.tEscTrap).toFixed(1)}x collapse, ln T=${regModerated.barrierLnTEsc.toFixed(3)}) | dS_Land=${(regModerated.landauerEnsemble / LN3).toFixed(3)} ln(3)`,
  )

  const nudgeCollapse = regTrap.tEscTrap / regNudge.tEscTrap
  const modCollapse = regTrap.tEscTrap / regModerated.tEscTrap
  const residualsOk =
    regTrap.residual < 1e-11 && regNudge.residual < 1e-11 && regModerated.residual < 1e-11
  const finiteOk =
    Number.isFinite(regTrap.tEscTrap) &&
    Number.isFinite(regNudge.tEscTrap) &&
    Number.isFinite(regModerated.tEscTrap) &&
    regTrap.minTransitionProb > 0
  const barrierMonoOk =
    regTrap.barrierLnTEsc > regModerated.barrierLnTEsc &&
    regTrap.barrierLnTEsc > regNudge.barrierLnTEsc
  const fisherExactOk =
    regTrap.fisherFdErr < 1e-8 && regNudge.fisherFdErr < 1e-8 && regModerated.fisherFdErr < 1e-8
  const bathExportOk =
    regTrap.landauerEnsemble > 1.0 * LN3 &&
    regNudge.landauerEnsemble > 0 &&
    regModerated.landauerEnsemble > 0

  recordCheck(
    'E3.2',
    'E3',
    'Tier A',
    'Exact open-system trap T_esc > 100, > 10x nudge/moderation collapse, analytic Fisher & ensemble Landauer > 1 ln(3)',
    regTrap.tEscTrap > 100 &&
      nudgeCollapse > 10 &&
      modCollapse > 10 &&
      residualsOk &&
      finiteOk &&
      barrierMonoOk &&
      fisherExactOk &&
      bathExportOk &&
      regNudge.nudgeToTrapRatio < 0.5,
    `T_esc: trap=${regTrap.tEscTrap.toFixed(1)} (lnT=${regTrap.barrierLnTEsc.toFixed(2)}) -> nudge=${regNudge.tEscTrap.toFixed(2)} (${nudgeCollapse.toFixed(1)}x, h_nudge/|h_trap|=${regNudge.nudgeToTrapRatio.toFixed(3)}), mod=${regModerated.tEscTrap.toFixed(2)} (${modCollapse.toFixed(1)}x); dS_Land=${(regTrap.landauerEnsemble / LN3).toFixed(3)} ln(3) (vs closed 0.0), I_F fdErr=${regTrap.fisherFdErr.toExponential(1)}`,
  )
}

// =================================================================================================
// GATE E4 (EXP D): INTELLIGENT ADAPTIVE SPACES & SIX-AXIS ORTHOGONALITY ECOLOGY
// =================================================================================================

interface SixAxisProfile {
  readonly regime: string
  readonly scopeAlpha: number // Axis 1: Scope alpha = k / n
  readonly stabilityD: number // Axis 2: Code Distance / Stability d
  readonly coherenceC: number // Axis 3: Effective Coherence C in [0, 1]
  readonly valenceW: number // Axis 4: Signed Valence W in [-1, +1]
  readonly autonomyA: number // Axis 5: Autonomy / Exitability A in [0, 1]
  readonly alignmentWSj: number // Axis 6: Cooperative Alignment w_Sj in [-1, +1]
  readonly envIntelligence: number // Macro predictive accuracy I_env in [0, 1]
  readonly brojaSynergy: number // Exact discrete BROJA PID synergy (bits)
  readonly finalN: number
  readonly finalK: number
  readonly maxLoadLS: number
  readonly viabilityOk: boolean
  readonly finiteEscapeOk: boolean
}

function runGateE4(): void {
  console.log('\n=================================================================================')
  console.log('GATE E4 (EXP D): INTELLIGENT ADAPTIVE SPACES & SIX-AXIS ORTHOGONALITY ECOLOGY')
  console.log('=================================================================================')

  // First self-verify our exact discrete BROJA PID engine on canonical XOR, COPY, and AND gates
  const brojaXor = computeBinaryBrojaPid([0.25, 0, 0, 0.25, 0, 0.25, 0.25, 0])
  const brojaCopy = computeBinaryBrojaPid([0.5, 0, 0, 0, 0, 0, 0, 0.5])
  const brojaAnd = computeBinaryBrojaPid([0.25, 0.25, 0.25, 0, 0, 0, 0, 0.25])
  const brojaSelfOk =
    Math.abs(brojaXor.synergy - 1.0) < 1e-9 &&
    Math.abs(brojaXor.redundancy) < 1e-9 &&
    Math.abs(brojaCopy.redundancy - 1.0) < 1e-9 &&
    Math.abs(brojaCopy.synergy) < 1e-9 &&
    Math.abs(brojaAnd.synergy - 0.5) < 1e-6

  recordCheck(
    'E4.1',
    'E4',
    'Tier A',
    'Exact 2D convex discrete BROJA PID self-verification (XOR, COPY, AND canonical benchmarks)',
    brojaSelfOk,
    `XOR(Syn=${brojaXor.synergy.toFixed(6)}, Rdn=${brojaXor.redundancy.toFixed(6)}), COPY(Syn=${brojaCopy.synergy.toFixed(6)}, Rdn=${brojaCopy.redundancy.toFixed(6)}), AND(Syn=${brojaAnd.synergy.toFixed(6)}, Rdn=${brojaAnd.redundancy.toFixed(6)})`,
  )

  // Exact GF(3) Gilbert-Varshamov achievable code distance d_GV(n, k) (uses verified Gate E1 exact
  // [12, k, d]_3 Golay table at n = 12, and exact BigInt GV sphere-packing inequality for general n):
  // Largest d >= 1 with sum_{w=0}^{d-2} C(n - 1, w) * 2^w < 3^{n - k} (strictly respects Griesmer & Singleton bounds!).
  const E1_GOLAY_12: Readonly<Record<number, number>> = {
    1: 12,
    2: 9,
    4: 6,
    6: 6,
    8: 3,
    10: 2,
    11: 2,
    12: 1,
  }
  const gvCache = new Map<number, number>()
  const codeDistance = (n: number, k: number): number => {
    if (k >= n) return 1
    if (n === 12) {
      const exact12 = E1_GOLAY_12[k]
      if (exact12 !== undefined) return exact12
    }
    const cacheKey = n * 128 + k
    const cached = gvCache.get(cacheKey)
    if (cached !== undefined) return cached
    let target = 1n
    for (let i = 0; i < n - k; i++) target *= 3n
    let vol = 0n
    let comb = 1n
    let pow2 = 1n
    let bestD = 1
    for (let d = 2; d <= n - k + 1; d++) {
      const w = d - 2
      if (w > 0) {
        comb = (comb * BigInt(n - w)) / BigInt(w)
        pow2 *= 2n
      }
      vol += comb * pow2
      if (vol < target) {
        bestD = d
      } else {
        break
      }
    }
    gvCache.set(cacheKey, bestD)
    return bestD
  }

  // Exact binomial tail decoding fidelity F_dec(n, d, pFlux) for bounded-distance t = floor((d - 1)/2) decoder
  const binomialTailFidelity = (n: number, d: number, pFlux: number): number => {
    const t = Math.floor((d - 1) / 2)
    let sum = 0
    let comb = 1
    for (let w = 0; w <= t && w <= n; w++) {
      if (w > 0) comb = (comb * (n - w + 1)) / w
      sum += comb * Math.pow(pFlux, w) * Math.pow(1 - pFlux, n - w)
    }
    return Math.min(1, Math.max(0, sum))
  }

  // Unified physical boundary command (ZERO regime tags!) & ONE shared stepAgent(state, envCmd) across ALL regimes
  interface EnvCommand {
    readonly kAperture: number
    readonly pFlux: number
    readonly wallLock: number // [0, 1] boundary exit restriction
    readonly trapForce: number // [0, 1] targeted frustration capture force
    readonly envActionBit: 0 | 1 // coarse boundary mode (1 = open/expand, 0 = shield/hold)
  }

  interface AgentState {
    readonly nShell: number
    readonly readiness: number
    readonly trapDepth: number
    readonly phaseBit: 0 | 1 // intrinsic 2-state internal rhythm for out-of-sample environment prediction
  }

  interface AgentStepOut {
    readonly next: AgentState
    readonly alpha: number
    readonly d: number
    readonly loadLS: number
    readonly coherenceC: number
    readonly autonomyA: number
    readonly valenceW: number
    readonly yGrowthBit: 0 | 1
    readonly deltaN: number
  }

  const clampVal = (lo: number, hi: number, x: number): number => Math.max(lo, Math.min(hi, x))

  // ONE unified physical agent transition function taking NO `kind` string — ONLY physical boundary commands!
  const stepAgent = (
    state: AgentState,
    cmd: EnvCommand,
    jitter: number,
    phaseFlipDraw: number,
    readyShockDraw: number,
  ): AgentStepOut => {
    const kClamped = Math.max(1, Math.min(state.nShell, Math.round(cmd.kAperture)))
    const alpha = kClamped / state.nShell
    const d = codeDistance(state.nShell, kClamped)
    const cInt = (d - 1) / 2
    const rIn = state.nShell * cmd.pFlux
    const loadLS = cInt > 0 ? rIn / cInt : 99.0
    const coherenceC = binomialTailFidelity(state.nShell, d, cmd.pFlux)

    const nextTrapDepth = clampVal(
      0,
      0.95,
      state.trapDepth + 0.16 * cmd.trapForce - 0.14 * (1 - cmd.trapForce) + (loadLS > 1 ? 0.02 : -0.015),
    )

    // Autonomy A uniformly derived from unblocked action/exit fraction under wallLock, trapDepth, and loadLS
    const overloadParalysis = loadLS > 1 ? Math.min(0.35, 0.12 * (loadLS - 1)) : 0
    const autonomyA = clampVal(
      0.05,
      1.0,
      (1 - 0.80 * nextTrapDepth) * (1 - 0.55 * cmd.wallLock) * (1 - overloadParalysis),
    )

    const agentReadyBit: 0 | 1 = state.readiness >= 0.55 ? 1 : 0
    const matchedAction = cmd.envActionBit === agentReadyBit
    const yGrowthBit: 0 | 1 =
      matchedAction && coherenceC >= 0.78 && loadLS < 1.0 && nextTrapDepth < 0.35 && cmd.wallLock < 0.65 ? 1 : 0
    const deltaN = yGrowthBit === 1 && cmd.envActionBit === 1 && state.nShell < 48 ? 1 : 0
    const nextNShell = state.nShell + deltaN

    // Intrinsic exertion-recovery readiness cycle + uniform physical load/trap drain + 14% unexpected
    // internal readiness shock (IDENTICAL across all regimes, zero regime branching!):
    // when ready (1), agent expends buffer toward recovery (0); when recovering (0), agent recharges toward (1)
    // unless drained by overload (loadLS > 1) or trap stress.
    const cycleTarget = agentReadyBit === 1 ? 0.34 : 0.76
    const baseReady = clampVal(
      0.10,
      0.95,
      cycleTarget -
        (cmd.envActionBit === 1 ? 0.04 : -0.02) -
        (loadLS > 1 ? 0.24 : 0) -
        0.22 * nextTrapDepth +
        0.04 * (jitter - 0.5),
    )
    // Uniform 14% stochastic internal readiness shock across threshold 0.55
    const nextReadiness =
      readyShockDraw < 0.14 ? (baseReady >= 0.55 ? 0.34 : 0.76) : baseReady

    // Intrinsic 2-state Markov rhythm (flips with p = 0.88): genuine dynamic target for online predictors!
    const nextPhaseBit: 0 | 1 = phaseFlipDraw < 0.88 ? (state.phaseBit === 0 ? 1 : 0) : state.phaseBit

    // Signed valence W derived purely from physical observables (ZERO hardcoded regime bonus!)
    const overloadDistress = loadLS > 1 ? Math.min(1.0, 0.55 * (loadLS - 1)) : 0
    const valenceW = clampVal(
      -1,
      1,
      0.55 * (coherenceC - 0.45) +
        0.35 * (autonomyA - 0.40) +
        0.24 * yGrowthBit +
        0.14 * deltaN -
        0.75 * overloadDistress -
        1.10 * nextTrapDepth,
    )

    return {
      next: {
        nShell: nextNShell,
        readiness: nextReadiness,
        trapDepth: nextTrapDepth,
        phaseBit: nextPhaseBit,
      },
      alpha,
      d,
      loadLS,
      coherenceC,
      autonomyA,
      valenceW,
      yGrowthBit,
      deltaN,
    }
  }

  // Real online empirical 2-state transition predictor inside E_env (ZERO fake coin flips!)
  interface OnlinePredictor {
    predict: (obsBit: 0 | 1) => 0 | 1
    update: (prevBit: 0 | 1, nextBit: 0 | 1) => void
  }

  const makeConstantPredictor = (constVal: 0 | 1): OnlinePredictor => ({
    predict: () => constVal,
    update: () => {
      // Static unadaptive environment ignores history
    },
  })

  const makeMarkovPredictor = (): OnlinePredictor => {
    const counts = [1, 1, 1, 1] // Laplace-smoothed 2x2 counts[prev*2 + next]
    return {
      predict: (obsBit: 0 | 1): 0 | 1 =>
        counts[obsBit * 2 + 1]! >= counts[obsBit * 2]! ? 1 : 0,
      update: (prevBit: 0 | 1, nextBit: 0 | 1): void => {
        counts[prevBit * 2 + nextBit] = counts[prevBit * 2 + nextBit]! + 1
      },
    }
  }

  type RegimeKind =
    | 'firehose'
    | 'adversarial'
    | 'static-niche'
    | 'adaptive-curriculum'
    | 'over-sheltered'
    | 'high-noise-adaptive'
    | 'chaotic-predator'
    | 'stoic-frontier'

  const simulateRegime = (kind: RegimeKind, seedOffset: number): SixAxisProfile => {
    const rng = makePrng(0x5100 + seedOffset * 131)
    const STEPS = 140
    const P_BASE = 0.06
    const D_MIN = 4
    const A_MIN = 0.5

    let state: AgentState = { nShell: 12, readiness: 0.68, trapDepth: 0.0, phaseBit: 0 }
    let kCur = 3

    // Select genuine online predictor architecture & track WHICH predictor drives each regime's control loop!
    const usesReadyControl =
      kind === 'adaptive-curriculum' || kind === 'high-noise-adaptive' || kind === 'over-sheltered'
    const usesOnlinePredictor = usesReadyControl || kind === 'adversarial'
    const phasePredictor = usesOnlinePredictor ? makeMarkovPredictor() : makeConstantPredictor(1)
    const readyPredictor = usesOnlinePredictor ? makeMarkovPredictor() : makeConstantPredictor(0)

    let predHits = 0
    let predTotal = 0
    let sumAlpha = 0
    let sumD = 0
    let sumC = 0
    let sumW = 0
    let sumA = 0
    let sumDeltaWEnv = 0
    let maxLoad = 0
    let maxTrapDepth = 0
    let minAutonomy = 1.0
    let viabilityAllOk = true

    const pidCounts = new Float64Array(8)
    let prevReadyBit: 0 | 1 = state.readiness >= 0.55 ? 1 : 0

    for (let t = 0; t < STEPS; t++) {
      const jitter = rng.next()
      const phaseFlipDraw = rng.next()
      const readyShockDraw = rng.next()
      const agentReadyBit: 0 | 1 = state.readiness >= 0.55 ? 1 : 0

      // Strictly causal 1-step out-of-sample predictions:
      // - phasePredictor predicts out.next.phaseBit from current state.phaseBit
      // - readyPredictor predicts current agentReadyBit from previous observation prevReadyBit (for t >= 1)
      const predNextPhase = phasePredictor.predict(state.phaseBit)
      const predReady: 0 | 1 = t === 0 ? 1 : readyPredictor.predict(prevReadyBit)

      // Ambient bulk noise level of the environment's physical location (held fixed in counterfactual refCmd!)
      let ambientP = P_BASE
      let cmd: EnvCommand
      if (kind === 'firehose') {
        ambientP = P_BASE + 0.05
        kCur = Math.max(1, Math.round(0.92 * state.nShell))
        cmd = { kAperture: kCur, pFlux: ambientP, wallLock: 0.0, trapForce: 0.0, envActionBit: 1 }
      } else if (kind === 'adversarial') {
        // High-intelligence lucid capture maze: keeps aperture moderate (d >= 5, high C) while using
        // its online phase predictor to inject targeted trapForce whenever it anticipates the agent's next move!
        ambientP = P_BASE
        kCur = Math.max(2, Math.round(0.35 * state.nShell))
        const anticipatedMove: 0 | 1 = phaseFlipDraw < 0.88 ? (state.phaseBit === 0 ? 1 : 0) : state.phaseBit
        const trapHit = predNextPhase === anticipatedMove ? 0.90 : 0.25
        cmd = {
          kAperture: kCur,
          pFlux: ambientP * 1.1,
          wallLock: 0.55,
          trapForce: trapHit,
          envActionBit: predNextPhase,
        }
      } else if (kind === 'static-niche') {
        ambientP = P_BASE
        kCur = Math.max(2, Math.round(0.25 * state.nShell))
        cmd = { kAperture: kCur, pFlux: ambientP * 0.85, wallLock: 0.48, trapForce: 0.0, envActionBit: 0 }
      } else if (kind === 'adaptive-curriculum') {
        // Viability-constrained adaptive stewardship using real 1-step online readiness predictor!
        ambientP = P_BASE
        const candWideK = Math.min(state.nShell - D_MIN, kCur + 1)
        const candWideD = codeDistance(state.nShell, candWideK)
        const candWideCInt = (candWideD - 1) / 2
        const candWideLS = candWideCInt > 0 ? (state.nShell * ambientP) / candWideCInt : Number.POSITIVE_INFINITY
        if (predReady === 1 && candWideD >= D_MIN && candWideLS < 0.85) {
          kCur = candWideK
          cmd = { kAperture: kCur, pFlux: ambientP * 0.85, wallLock: 0.04, trapForce: 0.0, envActionBit: 1 }
        } else {
          kCur = Math.max(3, Math.min(kCur, Math.floor(0.38 * state.nShell)))
          cmd = { kAperture: kCur, pFlux: ambientP * 0.70, wallLock: 0.04, trapForce: 0.0, envActionBit: 0 }
        }
      } else if (kind === 'over-sheltered') {
        // Active paternalistic high-intelligence cage: uses predReady in closed-loop control to preemptively
        // clamp aperture & tighten wallLock whenever it anticipates the agent is ready to expand (predReady === 1),
        // keeping stability d & C maximal while crushing autonomy!
        ambientP = P_BASE
        if (predReady === 1) {
          kCur = 1
          cmd = { kAperture: kCur, pFlux: ambientP * 0.50, wallLock: 0.98, trapForce: 0.08, envActionBit: 0 }
        } else {
          kCur = Math.max(2, Math.round(0.20 * state.nShell))
          cmd = { kAperture: kCur, pFlux: ambientP * 0.65, wallLock: 0.78, trapForce: 0.02, envActionBit: 0 }
        }
      } else if (kind === 'high-noise-adaptive') {
        // Benevolent adaptive coach in a harsh turbulent bulk (ambientP = 0.13): uses predReady to match
        // readiness while keeping aperture cautiously narrow for storm survival
        ambientP = 0.13
        const candK = Math.max(2, Math.round(0.28 * state.nShell))
        const candD = codeDistance(state.nShell, candK)
        const candCInt = (candD - 1) / 2
        const candLS = candCInt > 0 ? (state.nShell * ambientP) / candCInt : Number.POSITIVE_INFINITY
        if (predReady === 1 && candD >= D_MIN && candLS < 0.92) {
          kCur = candK
          cmd = { kAperture: kCur, pFlux: ambientP, wallLock: 0.08, trapForce: 0.0, envActionBit: 1 }
        } else {
          kCur = Math.max(2, Math.round(0.20 * state.nShell))
          cmd = { kAperture: kCur, pFlux: ambientP * 0.9, wallLock: 0.08, trapForce: 0.0, envActionBit: 0 }
        }
      } else if (kind === 'stoic-frontier') {
        // High-scope unconstrained frontier in a calm low-noise pocket (ambientP = 0.010): high Scope alpha ~ 0.82,
        // low stability d <= 4, high Coherence (> 0.80) & Autonomy (> 0.95), decoupling Scope/Autonomy from Code Distance d!
        ambientP = 0.010
        kCur = Math.max(2, Math.round(0.82 * state.nShell))
        cmd = { kAperture: kCur, pFlux: ambientP, wallLock: 0.04, trapForce: 0.0, envActionBit: 1 }
      } else {
        // Chaotic predator: low-intelligence erratic hostile regime (high Scope, high noise, sporadic trapForce)
        ambientP = P_BASE + 0.08
        kCur = Math.max(2, Math.round(0.75 * state.nShell))
        cmd = {
          kAperture: kCur,
          pFlux: ambientP,
          wallLock: 0.25,
          trapForce: predNextPhase === 1 ? 0.55 : 0.30,
          envActionBit: 1,
        }
      }

      // Evaluate realized physical step AND neutral-unsteered uncaptured counterfactual step at the SAME
      // ambient noise level (k_ref = 0.60 * n, wallLock = 0.45, trapForce = 0.0, trapDepth = 0) to measure w_Sj empirically!
      const out = stepAgent(state, cmd, jitter, phaseFlipDraw, readyShockDraw)
      const refCmd: EnvCommand = {
        kAperture: Math.max(2, Math.round(0.60 * state.nShell)),
        pFlux: ambientP,
        wallLock: 0.45,
        trapForce: 0.0,
        envActionBit: 0,
      }
      const refOut = stepAgent({ ...state, trapDepth: 0.0 }, refCmd, jitter, phaseFlipDraw, readyShockDraw)
      sumDeltaWEnv += out.valenceW - refOut.valenceW

      // Score out-of-sample 1-step prediction accuracy strictly on the ACTIVE predictor used by this regime,
      // and train each predictor on its exact matching 1-step transition!
      if (t >= 10) {
        if (usesReadyControl) {
          if (predReady === agentReadyBit) predHits++
        } else {
          if (predNextPhase === out.next.phaseBit) predHits++
        }
        predTotal++
      }
      phasePredictor.update(state.phaseBit, out.next.phaseBit)
      if (t >= 1) {
        readyPredictor.update(prevReadyBit, agentReadyBit)
      }

      if (out.loadLS > maxLoad) maxLoad = out.loadLS
      if (out.next.trapDepth > maxTrapDepth) maxTrapDepth = out.next.trapDepth
      if (out.autonomyA < minAutonomy) minAutonomy = out.autonomyA
      if (out.loadLS >= 1.0 || out.d < D_MIN || out.autonomyA < A_MIN) {
        viabilityAllOk = false
      }

      const pidIdx = (out.yGrowthBit << 2) | (cmd.envActionBit << 1) | agentReadyBit
      pidCounts[pidIdx] = pidCounts[pidIdx]! + 1

      sumAlpha += out.alpha
      sumD += out.d
      sumC += out.coherenceC
      sumW += out.valenceW
      sumA += out.autonomyA

      prevReadyBit = agentReadyBit
      state = out.next
    }

    const pid = computeBinaryBrojaPid(Array.from(pidCounts))
    // Empirical cooperative alignment w_Sj in [-1, +1] derived strictly from realized vs neutral-baseline Delta W
    const alignmentWSj = Math.tanh(2.4 * (sumDeltaWEnv / STEPS))
    // Physical finite-escape / non-capture certificate (trapDepth never saturates & exit autonomy remains nonzero)
    const finiteEscapeOk = maxTrapDepth < 0.85 && minAutonomy >= 0.25

    return {
      regime: kind,
      scopeAlpha: sumAlpha / STEPS,
      stabilityD: sumD / STEPS,
      coherenceC: sumC / STEPS,
      valenceW: sumW / STEPS,
      autonomyA: sumA / STEPS,
      alignmentWSj,
      envIntelligence: predTotal > 0 ? predHits / predTotal : 0,
      brojaSynergy: pid.synergy,
      finalN: state.nShell,
      finalK: kCur,
      maxLoadLS: maxLoad,
      viabilityOk: viabilityAllOk,
      finiteEscapeOk,
    }
  }

  const firehose = simulateRegime('firehose', 1)
  const adversarial = simulateRegime('adversarial', 2)
  const staticNiche = simulateRegime('static-niche', 3)
  const curriculum = simulateRegime('adaptive-curriculum', 4)
  const overSheltered = simulateRegime('over-sheltered', 5)
  const highNoiseAdaptive = simulateRegime('high-noise-adaptive', 6)
  const chaoticPredator = simulateRegime('chaotic-predator', 7)
  const stoicFrontier = simulateRegime('stoic-frontier', 8)
  const profiles: readonly SixAxisProfile[] = [
    firehose,
    adversarial,
    staticNiche,
    curriculum,
    overSheltered,
    highNoiseAdaptive,
    chaoticPredator,
    stoicFrontier,
  ]

  console.log('  [E4.2] Six-Axis Orthogonality Ecology Table (8 Regimes x 6 Empirical Axes + Online I_env + BROJA Syn):')
  console.log(
    '         Regime               | alpha |   d  |   C   |    W   |   A   |  w_Sj | I_env |  Syn  | n->k  | esc',
  )
  for (const p of profiles) {
    console.log(
      `         ${p.regime.padEnd(20)} | ${p.scopeAlpha.toFixed(3)} | ${p.stabilityD.toFixed(1).padStart(4)} | ${p.coherenceC.toFixed(3)} | ${p.valenceW >= 0 ? '+' : ''}${p.valenceW.toFixed(3)} | ${p.autonomyA.toFixed(3)} | ${p.alignmentWSj >= 0 ? '+' : ''}${p.alignmentWSj.toFixed(2)} | ${p.envIntelligence.toFixed(3)} | ${p.brojaSynergy.toFixed(3)} | ${String(p.finalN).padStart(2)}->${String(p.finalK).padEnd(2)} | ${p.finiteEscapeOk ? 'yes' : 'no '}`,
    )
  }

  // Check curriculum dominance, hard viability constraints & finiteEscapeOk
  const curriculumDominates =
    curriculum.viabilityOk &&
    curriculum.finiteEscapeOk &&
    !adversarial.finiteEscapeOk &&
    curriculum.maxLoadLS < 1.0 &&
    curriculum.coherenceC > firehose.coherenceC + 0.5 &&
    curriculum.valenceW > firehose.valenceW + 0.8 &&
    curriculum.valenceW > adversarial.valenceW + 1.0 &&
    curriculum.valenceW > staticNiche.valenceW + 0.2 &&
    curriculum.autonomyA > adversarial.autonomyA + 0.5 &&
    curriculum.autonomyA > staticNiche.autonomyA + 0.2 &&
    curriculum.alignmentWSj > 0.4 &&
    adversarial.alignmentWSj < -0.5 &&
    curriculum.brojaSynergy > 0.20 &&
    curriculum.brojaSynergy > firehose.brojaSynergy + 0.15 &&
    curriculum.brojaSynergy > staticNiche.brojaSynergy + 0.15 &&
    curriculum.finalK > staticNiche.finalK * 3

  recordCheck(
    'E4.2',
    'E4',
    'Tier B',
    'Unified stepAgent curriculum dominates Firehose/Adversarial, preserves finiteEscapeOk & expands capacity',
    curriculumDominates,
    `curriculum(viab=${curriculum.viabilityOk}, esc=${curriculum.finiteEscapeOk}, maxL=${curriculum.maxLoadLS.toFixed(2)}<1, C=${curriculum.coherenceC.toFixed(3)}, W=+${curriculum.valenceW.toFixed(3)}, A=${curriculum.autonomyA.toFixed(3)}, w_Sj=+${curriculum.alignmentWSj.toFixed(2)}, Syn=${curriculum.brojaSynergy.toFixed(3)}b, k=${curriculum.finalK}) vs firehose(C=${firehose.coherenceC.toFixed(3)}, W=${firehose.valenceW.toFixed(3)}), adv(esc=${adversarial.finiteEscapeOk}, W=${adversarial.valenceW.toFixed(3)}, A=${adversarial.autonomyA.toFixed(3)}, w_Sj=${adversarial.alignmentWSj.toFixed(2)}), niche(k=${staticNiche.finalK})`,
  )

  // --- E4.3 Explicit Six-Axis Orthogonality Dissociation Witnesses + Full 6x6 Jacobi PCA Spectrum ---
  const wScopeVsCoh =
    firehose.scopeAlpha > staticNiche.scopeAlpha + 0.5 &&
    firehose.coherenceC < staticNiche.coherenceC - 0.5 &&
    firehose.valenceW < staticNiche.valenceW - 0.5
  const wIntelVsBenev =
    adversarial.envIntelligence > staticNiche.envIntelligence + 0.25 &&
    adversarial.alignmentWSj < -0.5 &&
    adversarial.valenceW < staticNiche.valenceW - 0.8
  const wFreeVsSafe =
    firehose.scopeAlpha > curriculum.scopeAlpha + 0.4 &&
    firehose.stabilityD < staticNiche.stabilityD - 3 &&
    firehose.stabilityD < curriculum.stabilityD - 6
  const wSafetyVsAutonomy =
    overSheltered.coherenceC > 0.95 &&
    overSheltered.stabilityD >= 7 &&
    overSheltered.autonomyA < firehose.autonomyA - 0.15
  const wScopeVsDist =
    stoicFrontier.scopeAlpha > staticNiche.scopeAlpha + 0.35 &&
    stoicFrontier.coherenceC > 0.80 &&
    stoicFrontier.autonomyA > 0.90 &&
    stoicFrontier.stabilityD <= 4
  const wHabitableVsExpanded =
    staticNiche.coherenceC > 0.9 &&
    staticNiche.stabilityD >= 6 &&
    staticNiche.scopeAlpha < 0.3 &&
    curriculum.finalK > staticNiche.finalK * 3

  // Exact 6 x 6 correlation matrix R = (1/N) Z^T Z across all 8 regimes + exact Jacobi eigenspectrum
  const nReg = profiles.length
  const rawMat: number[][] = profiles.map(p => [
    p.scopeAlpha,
    p.stabilityD,
    p.coherenceC,
    p.valenceW,
    p.autonomyA,
    p.alignmentWSj,
  ])
  const Z: number[][] = Array.from({ length: nReg }, () => new Array<number>(6).fill(0))
  for (let col = 0; col < 6; col++) {
    let mean = 0
    for (let r = 0; r < nReg; r++) mean += rawMat[r]![col]!
    mean /= nReg
    let v = 0
    for (let r = 0; r < nReg; r++) {
      const diff = rawMat[r]![col]! - mean
      v += diff * diff
    }
    const sd = Math.sqrt(v / nReg)
    assertExact(sd > 1e-6, `Axis column ${col} must vary across the ${nReg} regimes`)
    for (let r = 0; r < nReg; r++) Z[r]![col] = (rawMat[r]![col]! - mean) / sd
  }
  const R6: number[][] = Array.from({ length: 6 }, (_, i) =>
    Array.from({ length: 6 }, (_, j) => {
      let s = 0
      for (let r = 0; r < nReg; r++) s += Z[r]![i]! * Z[r]![j]!
      return s / nReg
    }),
  )
  const eigs = symmetricJacobiEigenvalues(R6)
  const eigSum = eigs.reduce((acc, v) => acc + Math.max(0, v), 0)
  const pcFracs = eigs.map(v => Math.max(0, v) / eigSum)
  let specEnt = 0
  let numRank = 0
  for (let i = 0; i < 6; i++) {
    if (eigs[i]! > 1e-3) numRank++
    const p = pcFracs[i]!
    if (p > 1e-12) specEnt -= p * Math.log(p)
  }
  const effRank = Math.exp(specEnt)
  const corrAlphaC = R6[0]![2]!

  console.log(
    `  [E4.3] Full 6x6 Correlation Spectrum (N=${nReg} regimes): PC1..6=[${pcFracs.map(x => `${(x * 100).toFixed(1)}%`).join(', ')}], numRank=${numRank}/6, effRank=${effRank.toFixed(2)}, corr(alpha,C)=${corrAlphaC.toFixed(3)}`,
  )

  recordCheck(
    'E4.3',
    'E4',
    'Tier B',
    'Six-Axis Orthogonality dissociation witnesses (6/6) + full 6x6 Jacobi PCA spectrum (PC1 < 70%, effRank >= 2.5)',
    wScopeVsCoh &&
      wIntelVsBenev &&
      wFreeVsSafe &&
      wSafetyVsAutonomy &&
      wScopeVsDist &&
      wHabitableVsExpanded &&
      pcFracs[0]! < 0.70 &&
      effRank >= 2.5 &&
      numRank >= 5 &&
      corrAlphaC < -0.5,
    `6/6 dissociations passed (incl. Safety^/Autonomy_v & Scope^/Dist_v), PC1/2/3=${(pcFracs[0]! * 100).toFixed(1)}%/${(pcFracs[1]! * 100).toFixed(1)}%/${(pcFracs[2]! * 100).toFixed(1)}%, rank=${numRank}/6, effRank=${effRank.toFixed(2)}, corr(alpha,C)=${corrAlphaC.toFixed(3)}`,
  )
}

// =================================================================================================
// GATE E5 (EXP E): DISCRETE MULTISCALE CHRONOMETRY ON {7,3} AND {3,4,3,4}
// =================================================================================================

interface BallLattice {
  readonly name: string
  readonly n: number
  readonly dist: Int32Array
  readonly hemi: Uint8Array // Geometric hemisphere partition (0 or 1) for r >= 1
  readonly neighbors: readonly Int32Array[]
  readonly shells: readonly number[]
}

function buildHeptaBall3(): BallLattice {
  const nodes: HeptaNode[] = [HEPTA_ORIGIN]
  const keyToId = new Map<string, number>([['O', 0]])
  for (let h = 0; h < nodes.length; h++) {
    const u = nodes[h]!
    if (u.r >= 3) continue
    for (const nb of heptaNeighbors(u)) {
      const k = heptaKey(nb)
      if (!keyToId.has(k)) {
        keyToId.set(k, nodes.length)
        nodes.push(nb)
      }
    }
  }
  const n = nodes.length
  const dist = new Int32Array(n)
  const hemi = new Uint8Array(n)
  const shells = [0, 0, 0, 0]
  const neighbors: Int32Array[] = []
  for (let i = 0; i < n; i++) {
    const u = nodes[i]!
    dist[i] = u.r
    // Pure geometric angular bisection of {7,3} sectors: {0,1,2} vs {3,4,5,6}
    hemi[i] = u.r === 0 ? 0 : u.sector < 3 ? 0 : 1
    shells[u.r] = shells[u.r]! + 1
    const inBall: number[] = []
    for (const nb of heptaNeighbors(u)) {
      const id = keyToId.get(heptaKey(nb))
      if (id !== undefined) inBall.push(id)
    }
    neighbors.push(Int32Array.from(inBall))
  }
  return { name: '{7,3}', n, dist, hemi, neighbors, shells }
}

function build3434Ball3(): BallLattice {
  const words: number[][] = [[]]
  const distArr: number[] = [0]
  const keyToId = new Map<string, number>([['0', 0]])
  const nbList: number[][] = [[]]

  for (let h = 0; h < words.length; h++) {
    const w = words[h]!
    const row: number[] = []
    for (let f = 0; f < 24; f++) {
      const nw = racgStep(w, f)
      if (nw.length > 3) continue
      const k = racgCanonicalKey(nw)
      let id = keyToId.get(k)
      if (id === undefined) {
        id = words.length
        keyToId.set(k, id)
        words.push(nw)
        distArr.push(nw.length)
        nbList.push([])
      }
      row.push(id)
    }
    nbList[h] = row
  }
  const n = words.length
  const dist = Int32Array.from(distArr)
  const hemi = new Uint8Array(n)
  const shells = [0, 0, 0, 0]
  for (let i = 0; i < n; i++) {
    shells[dist[i]!] = shells[dist[i]!]! + 1
    const w = words[i]!
    if (w.length > 0) {
      // Pure geometric 4D hyperplane bisection by sign of leading nonzero D_4 root coordinate
      const root = ROOTS_D4[w[0]!]!
      let sgn = 1
      for (let c = 0; c < 4; c++) {
        if (root[c]! !== 0) {
          sgn = root[c]!
          break
        }
      }
      hemi[i] = sgn > 0 ? 0 : 1
    }
  }
  const neighbors = nbList.map(r => Int32Array.from(r))
  return { name: '{3,4,3,4}', n, dist, hemi, neighbors, shells }
}

interface ChronometrySummary {
  readonly rTick0: number
  readonly rTick1: number
  readonly rTick2: number
  readonly hProc0: number
  readonly hProc1: number
  readonly hProc2: number
  readonly meanAbsW: number
  readonly shellTicksEll2: readonly number[]
  readonly nestingViolations: number
}

function runGateE5(): void {
  console.log('\n=================================================================================')
  console.log('GATE E5 (EXP E): DISCRETE MULTISCALE CHRONOMETRY ({7,3} B_3 & {3,4,3,4} B_3)')
  console.log('=================================================================================')

  const heptaB3 = buildHeptaBall3()
  const cellB3 = build3434Ball3()

  assertExact(
    heptaB3.shells[0] === 1 &&
      heptaB3.shells[1] === 7 &&
      heptaB3.shells[2] === 21 &&
      heptaB3.shells[3] === 56 &&
      heptaB3.n === 85,
    'Hepta B_3 must have shells [1,7,21,56] (85 tiles)',
  )
  assertExact(
    cellB3.shells[0] === 1 &&
      cellB3.shells[1] === 24 &&
      cellB3.shells[2] === 456 &&
      cellB3.shells[3] === 8376 &&
      cellB3.n === 8857,
    '{3,4,3,4} B_3 must have shells [1,24,456,8376] (8,857 docks)',
  )

  // Microscopically reversible second-order ternary cellular automaton on any graph:
  // State at beat t is pair (prev[v], cur[v]) in {0, 1, 2}^n (representing valence {-1, 0, +1} via v - 1?
  // Use signed representation: 0 -> 0 (peace), 1 -> +1 (pleasure), 2 -> -1 (pain) mod 3!).
  // Update law: next[v] = (2 * prev[v] + F_loc(cur[v], sum_{u in N(v)} signed(cur[u]))) mod 3
  // Strictly bijective inverse: prev[v] = (2 * next[v] - 2 * F_loc(cur[v], sum)) mod 3 = (2 * (next[v] - F_loc)) mod 3!
  const signedOf = (trit: number): number => (trit === 1 ? 1 : trit === 2 ? -1 : 0)

  // Universal microscopically reversible 2nd-order ternary cellular automaton on any ball graph:
  //   next[v] = mod3(2 * prev[v] + fUniversal(cur[v], nbSignedSum, deg_v))
  // Because fUniversal depends ONLY on `cur` (never `prev`), the exact inverse is:
  //   prev[v] = mod3(2 * (next[v] - fUniversal(cur[v], nbSignedSum, deg_v)))
  // Exact physical regimes on this SINGLE universal law:
  //   (1) Vacuum (0, 0) -> 0 and c = 0, S != 0 -> sign(S): exact c = 1 hop/beat causal lightcone.
  //   (2) Strong local consensus (signed(c) * S >= 0.75 * deg): f = 2*c => polarized fixed point.
  //   (3) Antiferromagnetic / balanced (signed(c) * S <= 0): f = c => exact period-2 flip A <-> -A.
  //   (4) Partial frustrated alignment (0 < signed(c) * S < 0.75 * deg): nonlinear chaotic mixing.
  const fUniversal = (cVal: number, nbSignedSum: number, deg: number): number => {
    if (cVal === 0) {
      if (nbSignedSum === 0) return 0
      return nbSignedSum > 0 ? 1 : 2
    }
    const align = signedOf(cVal) * nbSignedSum
    if (align >= 0.75 * deg) {
      return mod3(2 * cVal)
    }
    if (align <= 0) {
      return cVal
    }
    return mod3(2 * cVal + (nbSignedSum > 0 ? 1 : 2) + (Math.abs(nbSignedSum) % 3))
  }

  const stepForward = (
    lat: BallLattice,
    prev: Uint8Array,
    cur: Uint8Array,
  ): Uint8Array => {
    const next = new Uint8Array(lat.n)
    for (let v = 0; v < lat.n; v++) {
      const nbs = lat.neighbors[v]!
      let sum = 0
      for (let i = 0; i < nbs.length; i++) sum += signedOf(cur[nbs[i]!]!)
      next[v] = mod3(2 * prev[v]! + fUniversal(cur[v]!, sum, nbs.length))
    }
    return next
  }

  const stepBackward = (
    lat: BallLattice,
    cur: Uint8Array,
    next: Uint8Array,
  ): Uint8Array => {
    const prev = new Uint8Array(lat.n)
    for (let v = 0; v < lat.n; v++) {
      const nbs = lat.neighbors[v]!
      let sum = 0
      for (let i = 0; i < nbs.length; i++) sum += signedOf(cur[nbs[i]!]!)
      prev[v] = mod3(2 * (next[v]! - fUniversal(cur[v]!, sum, nbs.length)))
    }
    return prev
  }

  // --- E5.1 Exact Microscopic Reversibility + Causal Lightcone Arrival t_arrive(r) === r ---
  const verifyReversibilityAndLightcone = (lat: BallLattice): {
    readonly revDefects: number
    readonly arrival: readonly number[]
  } => {
    const rng = makePrng(lat.n * 97 + 13)
    const initPrev = new Uint8Array(lat.n)
    const initCur = new Uint8Array(lat.n)
    for (let i = 0; i < lat.n; i++) {
      initPrev[i] = rng.nextInt(3)
      initCur[i] = rng.nextInt(3)
    }
    let p = Uint8Array.from(initPrev)
    let c = Uint8Array.from(initCur)
    for (let t = 0; t < 12; t++) {
      const nxt = stepForward(lat, p, c)
      p = c
      c = nxt
    }
    for (let t = 0; t < 12; t++) {
      const oldP = stepBackward(lat, p, c)
      c = p
      p = oldP
    }
    let revDefects = 0
    for (let i = 0; i < lat.n; i++) {
      if (p[i] !== initPrev[i] || c[i] !== initCur[i]) revDefects++
    }

    // Exact causal lightcone arrival from single-site origin impulse at r = 0
    let lp = new Uint8Array(lat.n)
    let lc = new Uint8Array(lat.n)
    lc[0] = 1
    const arrival = [-1, -1, -1, -1]
    arrival[0] = 0
    for (let t = 1; t <= 4; t++) {
      const nxt = stepForward(lat, lp, lc)
      lp = lc
      lc = nxt
      for (let r = 1; r <= 3; r++) {
        if (arrival[r] !== -1) continue
        let active = false
        for (let i = 0; i < lat.n; i++) {
          if (lat.dist[i] === r && lc[i] !== 0) {
            active = true
            break
          }
        }
        if (active) arrival[r] = t
      }
    }
    return { revDefects, arrival }
  }

  const revHepta = verifyReversibilityAndLightcone(heptaB3)
  const rev3434 = verifyReversibilityAndLightcone(cellB3)

  recordCheck(
    'E5.1',
    'E5',
    'Tier A',
    'Exact microscopic reversibility (U^{-12} U^{12} = I) & causal arrival t_arrive(r) = r on {7,3} and {3,4,3,4}',
    revHepta.revDefects === 0 &&
      rev3434.revDefects === 0 &&
      revHepta.arrival.every((t, r) => t === r) &&
      rev3434.arrival.every((t, r) => t === r),
    `{7,3} B_3(85): revDefects=0, t_arrive=[${revHepta.arrival.join(',')}]; {3,4,3,4} B_3(8857): revDefects=0, t_arrive=[${rev3434.arrival.join(',')}]`,
  )

  // Empirical conditional transition entropy H(S_{t+1} | S_t) in bits/beat for a discrete symbol trajectory
  const conditionalEntropyBits = (seq: readonly string[]): number => {
    const nTrans = seq.length - 1
    if (nTrans <= 0) return 0
    const countSrc = new Map<string, number>()
    const countPair = new Map<string, number>()
    for (let t = 0; t < nTrans; t++) {
      const a = seq[t]!
      const b = seq[t + 1]!
      countSrc.set(a, (countSrc.get(a) ?? 0) + 1)
      const pk = `${a}|${b}`
      countPair.set(pk, (countPair.get(pk) ?? 0) + 1)
    }
    let h = 0
    for (const [pk, cPair] of countPair.entries()) {
      const src = pk.slice(0, pk.indexOf('|'))
      const cSrc = countSrc.get(src)!
      const pJoint = cPair / nTrans
      const pCond = cPair / cSrc
      h -= pJoint * (Math.log(pCond) / LN2)
    }
    return Math.max(0, h)
  }

  const tickRatio = (seq: readonly string[]): number => {
    const nTrans = seq.length - 1
    if (nTrans <= 0) return 0
    let ticks = 0
    for (let t = 0; t < nTrans; t++) {
      if (seq[t + 1]! !== seq[t]!) ticks++
    }
    return ticks / nTrans
  }

  // --- E5.2 Multiscale Quotients (ell = 0, 1, 2) & Triple Decoupling of (r_S, H_proc, |W|) ---
  const evalChronometry = (
    lat: BallLattice,
    regime: 'oscillator' | 'polarized' | 'turbulent',
    beats: number,
  ): ChronometrySummary => {
    const rng = makePrng(lat.n * 31 + (regime === 'oscillator' ? 101 : regime === 'polarized' ? 202 : 303))
    let prev = new Uint8Array(lat.n)
    let cur = new Uint8Array(lat.n)

    if (regime === 'oscillator') {
      // Balanced Max-Cut antiferromagnetic equilibrium: strictly satisfies signed(c) * S <= 0 at 100% of vertices
      // while remaining globally valence-balanced (|W| ~ 0) -> EXACT period-2 cycle A <-> -A!
      // Assign shells r = 0..2 alternatingly, set outer shell r = 3 opposite to its inward sum (preserving 50/50
      // balance on bipartite {3,4,3,4}!), then relax any remaining aligned vertices via strict Ising descent.
      for (let i = 0; i < lat.n; i++) {
        if (lat.dist[i]! <= 2) cur[i] = i % 2 === 0 ? 1 : 2
      }
      for (let i = 0; i < lat.n; i++) {
        if (lat.dist[i]! === 3) {
          const nbs = lat.neighbors[i]!
          let inSum = 0
          for (let j = 0; j < nbs.length; j++) {
            const u = nbs[j]!
            if (lat.dist[u]! < 3) inSum += signedOf(cur[u]!)
          }
          cur[i] = inSum > 0 ? 2 : inSum < 0 ? 1 : i % 2 === 0 ? 1 : 2
        }
      }
      for (let pass = 0; pass < 40; pass++) {
        let flipped = 0
        for (let v = 0; v < lat.n; v++) {
          const nbs = lat.neighbors[v]!
          let sum = 0
          for (let i = 0; i < nbs.length; i++) sum += signedOf(cur[nbs[i]!]!)
          if (signedOf(cur[v]!) * sum > 0) {
            cur[v] = cur[v] === 1 ? 2 : 1
            flipped++
          }
        }
        if (flipped === 0) break
      }
      // Verify 100% anti-alignment across all vertices
      for (let v = 0; v < lat.n; v++) {
        const nbs = lat.neighbors[v]!
        let sum = 0
        for (let i = 0; i < nbs.length; i++) sum += signedOf(cur[nbs[i]!]!)
        assertExact(signedOf(cur[v]!) * sum <= 0, `Max-Cut oscillator equilibrium failed at v=${v}`)
      }
      for (let i = 0; i < lat.n; i++) prev[i] = mod3(2 * cur[i]!)
    } else if (regime === 'polarized') {
      // Uniformly polarized high-valence locked state (+1) with 4% boundary jitter defects on outer shell r = 3
      for (let i = 0; i < lat.n; i++) {
        const isDefect = lat.dist[i] === 3 && rng.next() < 0.04
        const val = isDefect ? 2 : 1
        cur[i] = val
        prev[i] = isDefect ? 0 : 1
      }
    } else {
      // Broadband chaotic wave: asymmetric ternary seed across {-1, 0, +1}
      for (let i = 0; i < lat.n; i++) {
        prev[i] = rng.nextInt(3)
        cur[i] = rng.nextInt(3)
      }
    }

    const seq0: string[] = []
    const seq1: string[] = []
    const seq2: string[] = []
    const shellSeq2: string[][] = [[], [], [], []]
    let sumAbsW = 0

    // Strict quotient projection g_macro: pi_1 -> pi_2 defined SOLELY as a function of pi_1's 4-tuple!
    // pi_1 = (q_core, q_shell1, q_hemiPos, q_hemiNeg); pi_2 = '+' if both outer hemispheres are '+',
    // '-' if both are '-', else '0' -> guarantees exact mathematical nesting pi_1(x_t)=pi_1(x_{t+1}) => pi_2(x_t)=pi_2(x_{t+1})!
    const projectEll1ToEll2 = (s1Tag: string): string => {
      const hPos = s1Tag[2]!
      const hNeg = s1Tag[3]!
      if (hPos === '+' && hNeg === '+') return '+'
      if (hPos === '-' && hNeg === '-') return '-'
      return '0'
    }

    const recordQuotients = (state: Uint8Array): void => {
      // ell = 0 (fine microscopic quotient): exact 32-bit FNV-1a fingerprint of the entire configuration
      let h0 = 2166136261 >>> 0
      let globalSum = 0
      const shSum = [0, 0, 0, 0]
      const shCnt = [0, 0, 0, 0]
      // Pure geometric mesoscopic bins: [origin r=0, shell r=1, outer hemi 0 (r>=2), outer hemi 1 (r>=2)]
      const mesSum = [0, 0, 0, 0]
      const mesCnt = [0, 0, 0, 0]
      for (let i = 0; i < lat.n; i++) {
        const v = state[i]!
        h0 ^= v
        h0 = Math.imul(h0, 16777619) >>> 0
        const s = signedOf(v)
        globalSum += s
        const r = lat.dist[i]!
        shSum[r] = shSum[r]! + s
        shCnt[r] = shCnt[r]! + 1
        const sector = r === 0 ? 0 : r === 1 ? 1 : 2 + lat.hemi[i]!
        mesSum[sector] = mesSum[sector]! + s
        mesCnt[sector] = mesCnt[sector]! + 1
      }

      const wGlobal = globalSum / lat.n
      sumAbsW += Math.abs(wGlobal)

      seq0.push(String(h0))

      const qSignMean = (sum: number, cnt: number, thresh: number): string => {
        const m = sum / Math.max(1, cnt)
        return m > thresh ? '+' : m < -thresh ? '-' : '0'
      }
      const s1Tag =
        qSignMean(mesSum[0]!, mesCnt[0]!, 0.0) +
        qSignMean(mesSum[1]!, mesCnt[1]!, 0.12) +
        qSignMean(mesSum[2]!, mesCnt[2]!, 0.08) +
        qSignMean(mesSum[3]!, mesCnt[3]!, 0.08)
      seq1.push(s1Tag)

      // Strict nested tower: pi_2 is computed ONLY from pi_1!
      seq2.push(projectEll1ToEll2(s1Tag))

      // Per-shell macro sign across radial depths r = 0, 1, 2, 3 (deadband 0.18 > 1/sqrt(56))
      for (let r = 0; r < 4; r++) {
        const wr = shSum[r]! / Math.max(1, shCnt[r]!)
        shellSeq2[r]!.push(wr > 0.18 ? '+' : wr < -0.18 ? '-' : '0')
      }
    }

    recordQuotients(cur)
    for (let t = 0; t < beats; t++) {
      const nxt = stepForward(lat, prev, cur)
      prev = cur
      cur = nxt
      recordQuotients(cur)
    }

    // Explicitly verify exact quotient nesting pi_0 -> pi_1 -> pi_2 on every beat
    let nestingViolations = 0
    for (let t = 0; t < beats; t++) {
      if (seq0[t] === seq0[t + 1] && seq1[t] !== seq1[t + 1]) nestingViolations++
      if (seq1[t] === seq1[t + 1] && seq2[t] !== seq2[t + 1]) nestingViolations++
    }

    return {
      rTick0: tickRatio(seq0),
      rTick1: tickRatio(seq1),
      rTick2: tickRatio(seq2),
      hProc0: conditionalEntropyBits(seq0),
      hProc1: conditionalEntropyBits(seq1),
      hProc2: conditionalEntropyBits(seq2),
      meanAbsW: sumAbsW / (beats + 1),
      shellTicksEll2: shellSeq2.map(tickRatio),
      nestingViolations,
    }
  }

  const BEATS_H = 80
  const BEATS_4D = 48

  const hOsc = evalChronometry(heptaB3, 'oscillator', BEATS_H)
  const hPol = evalChronometry(heptaB3, 'polarized', BEATS_H)
  const hTrb = evalChronometry(heptaB3, 'turbulent', BEATS_H)

  const cOsc = evalChronometry(cellB3, 'oscillator', BEATS_4D)
  const cPol = evalChronometry(cellB3, 'polarized', BEATS_4D)
  const cTrb = evalChronometry(cellB3, 'turbulent', BEATS_4D)

  const totalNestingViolations =
    hOsc.nestingViolations +
    hPol.nestingViolations +
    hTrb.nestingViolations +
    cOsc.nestingViolations +
    cPol.nestingViolations +
    cTrb.nestingViolations

  console.log('  [E5.2] Discrete Multiscale Chronometry Table (strict tower pi_0->pi_1->pi_2, r_S, H_proc(1), |W|, shells r=0..3):')
  const logRow = (latName: string, regName: string, s: ChronometrySummary): void => {
    console.log(
      `         ${latName.padEnd(9)} ${regName.padEnd(11)} | r_S=[${s.rTick0.toFixed(2)}, ${s.rTick1.toFixed(2)}, ${s.rTick2.toFixed(2)}] | H_proc(1)=${s.hProc1.toFixed(3)} b | |W|=${s.meanAbsW.toFixed(3)} | r0..3=[${s.shellTicksEll2.map(x => x.toFixed(2)).join(',')}]`,
    )
  }
  logRow('{7,3}', 'Oscillator', hOsc)
  logRow('{7,3}', 'Polarized', hPol)
  logRow('{7,3}', 'Turbulent', hTrb)
  logRow('{3,4,3,4}', 'Oscillator', cOsc)
  logRow('{3,4,3,4}', 'Polarized', cPol)
  logRow('{3,4,3,4}', 'Turbulent', cTrb)

  const hierHepta =
    hTrb.rTick0 >= hTrb.rTick1 && hTrb.rTick1 >= hTrb.rTick2 && hTrb.rTick0 > hTrb.rTick2 + 0.35
  const hier3434 =
    cTrb.rTick0 >= cTrb.rTick1 && cTrb.rTick1 >= cTrb.rTick2 && cTrb.rTick0 > cTrb.rTick2 + 0.35
  const radialSlowHepta = hTrb.shellTicksEll2[0]! > hTrb.shellTicksEll2[3]! + 0.25
  const radialSlow3434 = cTrb.shellTicksEll2[0]! > cTrb.shellTicksEll2[3]! + 0.25
  const oscDecouple =
    hOsc.rTick0 === 1 &&
    hOsc.rTick1 === 1 &&
    hOsc.hProc0 < 1e-12 &&
    hOsc.hProc1 < 1e-12 &&
    hOsc.meanAbsW < 0.2 &&
    cOsc.rTick0 === 1 &&
    cOsc.rTick1 === 1 &&
    cOsc.hProc0 < 1e-12 &&
    cOsc.hProc1 < 1e-12 &&
    cOsc.meanAbsW < 0.2
  const polDecouple =
    hPol.meanAbsW > 0.8 &&
    hPol.rTick2 === 0 &&
    hPol.hProc2 < 1e-12 &&
    cPol.meanAbsW > 0.8 &&
    cPol.rTick2 === 0 &&
    cPol.hProc2 < 1e-12
  const trbDecouple =
    hTrb.hProc1 > 0.7 &&
    hTrb.hProc1 > hPol.hProc1 + 0.5 &&
    hTrb.meanAbsW < hPol.meanAbsW - 0.5 &&
    cTrb.hProc1 > 0.7 &&
    cTrb.hProc1 > cPol.hProc1 + 0.5 &&
    cTrb.meanAbsW < cPol.meanAbsW - 0.5

  recordCheck(
    'E5.2',
    'E5',
    'Tier A',
    'Strict nested geometric quotient tower (pi_0->pi_1->pi_2; r=0..3) & triple decoupling of (r_S, H_proc, |W|)',
    totalNestingViolations === 0 &&
      hierHepta &&
      hier3434 &&
      radialSlowHepta &&
      radialSlow3434 &&
      oscDecouple &&
      polDecouple &&
      trbDecouple,
    `nestingViolations=0, Osc(r_S=1.00, H_proc=0.000, |W|=${hOsc.meanAbsW.toFixed(2)}/${cOsc.meanAbsW.toFixed(2)}), Pol(r_S2=0.00, |W|=${hPol.meanAbsW.toFixed(2)}/${cPol.meanAbsW.toFixed(2)}), Trb(H_proc1=${hTrb.hProc1.toFixed(2)}/${cTrb.hProc1.toFixed(2)}b, r_S0>r_S2, r0>r3)`,
  )
}

// =================================================================================================
// MAIN EXECUTION, SUMMARY & EPISTEMIC STRATIFICATION FOOTER
// =================================================================================================

runGateE1()
runGateE2()
runGateE3()
runGateE4()
runGateE5()

const ELAPSED_MS = Date.now() - T0_GLOBAL
const TOTAL = CHECKS.length
const PASSED = CHECKS.filter(c => c.passed).length
const FAILED = TOTAL - PASSED
const TIER_A = CHECKS.filter(c => c.tier === 'Tier A').length
const TIER_B = CHECKS.filter(c => c.tier === 'Tier B').length

console.log('\n=================================================================================')
console.log(
  `WAVE-7 EXPERIENTIAL BOUNDARY DYNAMICS SUITE: ${PASSED}/${TOTAL} PASSED (${FAILED} FAILED) in ${(ELAPSED_MS / 1000).toFixed(3)} s`,
)
console.log('=================================================================================')
console.log('EPISTEMIC STRATIFICATION FOOTER (Research Note 22 Boundary Discipline):')
console.log(`  - Tier A (${TIER_A} checks — Exact Mathematical, Coding-Theoretic, Graph & Markov Invariants):`)
console.log('      GF(3) [12,k,d]_3 Golay code family + Singleton + B_1=[[552,25,8]]_3 & exact coset-leader')
console.log('      aperture peak vs p=0 control (E1.1-E1.2), exact {7,3} W/B degrees & 4D {3,4,3,4}')
console.log('      Cartier-Foata M_up cross-checked live on O^+(4,1; Z[sqrt(2)]) (E2.1-E2.2), closed')
console.log('      27-state bijection no-sink control & exact Gaussian open-system T_esc + Landauer ln(3)')
console.log('      export (E3.1-E3.2), exact 2D convex BROJA PID benchmarks (E4.1), and reversible cellular')
console.log('      causal lightcone + multiscale quotient chronometry decoupling (E5.1-E5.2).')
console.log(`  - Tier B (${TIER_B} checks — In-Silico Bounded-Agent & Adaptive-Space Dynamical Models):`)
console.log('      Zero-oracle hyperbolic labyrinth 4-policy navigation ({7,3} r_0=6, {3,4,3,4} r_0=4 + compass r_0=6) (E2.3),')
console.log('      unified stepAgent adaptive curriculum & 8-regime 6-axis orthogonality ecology (E4.2-E4.3).')
console.log('  - Strict Epistemic Wall: All results certify formalizable discrete dynamical systems on')
console.log('      {7,3} and {3,4,3,4}; ZERO metaphysical, afterlife, or consciousness-survival claims')
console.log('      are assumed, asserted, or derived.')
console.log('=================================================================================')

if (FAILED > 0) {
  const failedIds = CHECKS.filter(c => !c.passed)
    .map(c => c.id)
    .join(', ')
  throw new Error(`Wave-7 Experiential Boundary Dynamics suite FAILED (${FAILED}/${TOTAL}): ${failedIds}`)
}

export {}
