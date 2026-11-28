// Hardware circuit compilation, OpenQASM 3.0 export, exact 81x81 Gram-compressed
// Petz/fixed-Clifford recovery solver, realistic hardware noise channel, and
// deterministic finite-shot tomographic simulator for the [[12, 1, 4]]_3 qutrit
// holographic slice (the exact (u, v) symmetric sector of the W(F_4)-covariant
// [[24, 1, 8]]_3 stabilizer code on the 24-cell {3,4,3}).
//
// Strictly deterministic (zero Math.random; Mulberry32 PRNG only), zero external
// runtime dependencies beyond Node built-ins (fs/path used only in optional
// writeHardwareBundle), strict TypeScript (--strict --noUncheckedIndexedAccess).

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// ============================================================================
// 0. CONSTANTS, DETERMINISTIC PRNG & EXACT COMPLEX LINEAR ALGEBRA
// ============================================================================

export const QUTRIT_COUNT = 12
export const QUBIT_COUNT = 24
export const CODEWORD_TERM_COUNT = 2187 // 3^7
export const HILBERT_DIM_12 = 531441 // 3^12
export const ERASED_QUTRITS: readonly number[] = [0, 1, 2]
export const KEPT_QUTRITS: readonly number[] = [3, 4, 5, 6, 7, 8, 9, 10, 11]

// Two disjoint layers of 3 cross-cut two-qutrit gates between A^c={0,1,2} and A={3..11}
export const CROSS_CUT_PAIRS: readonly (readonly [number, number])[] = [
  [0, 3],
  [1, 4],
  [2, 5],
  [0, 6],
  [1, 7],
  [2, 8],
]

// Six Clifford-rotated ZX crosstalk pairs inside A={3..11}: Z acts on the kept
// support of zLA ({4,5,6,7,10,11}), X acts on its complement in A ({3,8,9}),
// mimicking coherent trapped-ion ZX crosstalk that fools fixed-Clifford decoders
// while collapsing identically under optimal Petz recovery.
export const ZX_MIMICRY_PAIRS: readonly (readonly [number, number])[] = [
  [4, 3],
  [5, 8],
  [6, 9],
  [7, 3],
  [10, 8],
  [11, 9],
]

export const TARGET_BACKENDS: readonly string[] = [
  'IonQ Forte-1 (36q)',
  'Quantinuum H2 (56q)',
  'Ba-137 Native Qutrit (12-ion)',
]

// Exact average leakage probability into |11> per 2-qubit depolarizing fault
// under uniform 15-Pauli depolarizing noise on valid qutrit states {|00>,|01>,|10>}:
//   inter-qutrit 2q fault: (3*(2/9) + 3*(2/9) + 9*(32/81)) / 15 = 44/135
//   intra-qutrit 2q fault: 4/15
export const LEAKAGE_RATE_INTER_2Q = 44 / 135
export const LEAKAGE_RATE_INTRA_2Q = 4 / 15

const PI = Math.PI
const SQRT3 = Math.sqrt(3)
const INV_SQRT2 = Math.SQRT1_2
const INV_SQRT3 = 1 / SQRT3

const OMEGA_RE: readonly number[] = [1, -0.5, -0.5]
const OMEGA_IM: readonly number[] = [0, SQRT3 / 2, -SQRT3 / 2]

export const POW3: readonly number[] = Array.from({ length: 13 }, (_, i) => 3 ** i)

export function mod3(x: number): number {
  return ((x % 3) + 3) % 3
}

export interface DeterministicPrng {
  readonly next: () => number
  readonly nextInt: (maxExclusive: number) => number
}

export function makeMulberry32(seed: number): DeterministicPrng {
  let state = seed >>> 0
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const nextInt = (maxExclusive: number): number => Math.floor(next() * maxExclusive)
  return { next, nextInt }
}

export interface ComplexMatrix {
  readonly n: number
  readonly re: Float64Array
  readonly im: Float64Array
}

export function cmatZero(n: number): ComplexMatrix {
  return { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
}

export function cmatEye(n: number): ComplexMatrix {
  const m = cmatZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
}

export function cmatMul(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  const n = a.n
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    const iOff = i * n
    for (let k = 0; k < n; k++) {
      const ar = a.re[iOff + k]!
      const ai = a.im[iOff + k]!
      if (ar === 0 && ai === 0) continue
      const kOff = k * n
      for (let j = 0; j < n; j++) {
        const br = b.re[kOff + j]!
        const bi = b.im[kOff + j]!
        out.re[iOff + j] = out.re[iOff + j]! + (ar * br - ai * bi)
        out.im[iOff + j] = out.im[iOff + j]! + (ar * bi + ai * br)
      }
    }
  }
  return out
}

export function cmatDag(a: ComplexMatrix): ComplexMatrix {
  const n = a.n
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[j * n + i] = a.re[i * n + j]!
      out.im[j * n + i] = -a.im[i * n + j]!
    }
  }
  return out
}

export interface HermitianEigenResult {
  readonly values: Float64Array
  readonly vecRe: Float64Array
  readonly vecIm: Float64Array
  readonly sweeps: number
}

// Cyclic Hermitian Jacobi eigensolver (exact to < 1e-14 on 3x3 through 81x81 matrices).
export function hermitianEigen(re: Float64Array, im: Float64Array, n: number): HermitianEigenResult {
  const ar = Float64Array.from(re)
  const ai = Float64Array.from(im)
  const vr = new Float64Array(n * n)
  const vi = new Float64Array(n * n)
  for (let i = 0; i < n; i++) vr[i * n + i] = 1

  let sweeps = 0
  for (let sweep = 0; sweep < 80; sweep++) {
    sweeps = sweep + 1
    let offSq = 0
    for (let p = 0; p < n; p++) {
      const pOff = p * n
      for (let q = p + 1; q < n; q++) {
        const x = ar[pOff + q]!
        const y = ai[pOff + q]!
        offSq += x * x + y * y
      }
    }
    if (offSq < 1e-29) break

    for (let p = 0; p < n; p++) {
      const pOff = p * n
      for (let q = p + 1; q < n; q++) {
        const x = ar[pOff + q]!
        const y = ai[pOff + q]!
        const mag = Math.hypot(x, y)
        if (mag < 1e-17) continue
        const cr = x / mag
        const ci = y / mag
        const app = ar[pOff + p]!
        const aqq = ar[q * n + q]!
        const tau = (aqq - app) / (2 * mag)
        const t = (tau >= 0 ? 1 : -1) / (Math.abs(tau) + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c

        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue
          const kOff = k * n
          const kpr = ar[kOff + p]!
          const kpi = ai[kOff + p]!
          const kqr = ar[kOff + q]!
          const kqi = ai[kOff + q]!
          const eqr = cr * kqr + ci * kqi
          const eqi = cr * kqi - ci * kqr
          const epr = cr * kpr - ci * kpi
          const epi = cr * kpi + ci * kpr
          const npr = c * kpr - s * eqr
          const npi = c * kpi - s * eqi
          const nqr = s * epr + c * kqr
          const nqi = s * epi + c * kqi
          ar[kOff + p] = npr
          ai[kOff + p] = npi
          ar[pOff + k] = npr
          ai[pOff + k] = -npi
          ar[kOff + q] = nqr
          ai[kOff + q] = nqi
          ar[q * n + k] = nqr
          ai[q * n + k] = -nqi
        }
        ar[pOff + p] = app - t * mag
        ar[q * n + q] = aqq + t * mag
        ar[pOff + q] = 0
        ai[pOff + q] = 0
        ar[q * n + p] = 0
        ai[q * n + p] = 0

        for (let k = 0; k < n; k++) {
          const kOff = k * n
          const vpr = vr[kOff + p]!
          const vpi = vi[kOff + p]!
          const vqr = vr[kOff + q]!
          const vqi = vi[kOff + q]!
          const eqr = cr * vqr + ci * vqi
          const eqi = cr * vqi - ci * vqr
          const epr = cr * vpr - ci * vpi
          const epi = cr * vpi + ci * vpr
          vr[kOff + p] = c * vpr - s * eqr
          vi[kOff + p] = c * vpi - s * eqi
          vr[kOff + q] = s * epr + c * vqr
          vi[kOff + q] = s * epi + c * vqi
        }
      }
    }
  }

  const values = new Float64Array(n)
  for (let i = 0; i < n; i++) values[i] = ar[i * n + i]!
  return { values, vecRe: vr, vecIm: vi, sweeps }
}

export function vonNeumannEntropy(eigenvalues: ArrayLike<number>): number {
  let s = 0
  for (let i = 0; i < eigenvalues.length; i++) {
    const v = eigenvalues[i]!
    if (v > 1e-15) s -= v * Math.log(v)
  }
  return s
}

// Fast Smolin-Gambetta-Smith Euclidean projection of 3 real eigenvalues onto the unit simplex.
export function projectSimplex3(raw: readonly [number, number, number]): [number, number, number] {
  const a = [raw[0], raw[1], raw[2]].sort((x, y) => y - x)
  let acc = 0
  for (let i = 2; i >= 0; i--) {
    const v = a[i]! + acc / (i + 1)
    if (v >= 0) {
      const shift = acc / (i + 1)
      for (let j = 0; j <= i; j++) a[j] = a[j]! + shift
      break
    } else {
      acc += a[i]!
      a[i] = 0
    }
  }
  const sum = a[0]! + a[1]! + a[2]!
  if (sum <= 0) return [1 / 3, 1 / 3, 1 / 3]
  return [a[0]! / sum, a[1]! / sum, a[2]! / sum]
}

// Complementary error function approximation (Abramowitz & Stegun 7.1.26, max error < 1.5e-7)
export function erfcApprox(x: number): number {
  const z = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * z)
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  const r = poly * Math.exp(-z * z)
  return x >= 0 ? r : 2 - r
}

export function twoSidedNormalPValue(zScore: number): number {
  return erfcApprox(Math.abs(zScore) * INV_SQRT2)
}

// ============================================================================
// 1. EXACT [[12, 1, 4]]_3 CODEWORD, STABILIZER & BINARY-QUBIT ENCODING MAP
// ============================================================================

export type QutritValue = 0 | 1 | 2
export type QubitPairBits = readonly [0 | 1, 0 | 1]

export const BINARY_QUTRIT_MAP: Readonly<Record<QutritValue, QubitPairBits>> = {
  0: [0, 0],
  1: [0, 1],
  2: [1, 0],
}

export const LEAKAGE_QUBIT_BITS: QubitPairBits = [1, 1]

export function encodeQutritToBits(trit: QutritValue): QubitPairBits {
  return BINARY_QUTRIT_MAP[trit]
}

export function decodeBitsToQutrit(b0: 0 | 1, b1: 0 | 1): QutritValue | 'leakage' {
  if (b0 === 0 && b1 === 0) return 0
  if (b0 === 0 && b1 === 1) return 1
  if (b0 === 1 && b1 === 0) return 2
  return 'leakage'
}

export function isLeakageBits(b0: 0 | 1, b1: 0 | 1): boolean {
  return b0 === 1 && b1 === 1
}

export function sympDot12(a: Uint8Array, b: Uint8Array): number {
  let s = 0
  for (let q = 0; q < QUTRIT_COUNT; q++) {
    s += a[q]! * b[QUTRIT_COUNT + q]! - a[QUTRIT_COUNT + q]! * b[q]!
  }
  return mod3(s)
}

export interface SliceCodeSpec {
  readonly nQutrits: number
  readonly nStabilizers: number
  readonly labels: readonly string[]
  readonly stabilizers: readonly Uint8Array[] // 11 x 24 GF(3) symplectic rows [x_0..x_11 | z_0..z_11]
  readonly xL: Uint8Array // length 24
  readonly zL: Uint8Array // length 24
  readonly xLA: Uint8Array // logical X supported strictly on A={3..11}
  readonly zLA: Uint8Array // logical Z supported strictly on A={3..11}
  readonly isoDefects: number
  readonly logicalCommuteDefects: number
  readonly xLzLCommutator: number
  readonly rank: number
}

// W_9 symmetric generators of [[24, 1, 8]]_3 projected onto the 12 antipodal lines (u-slice).
const W9_LINE_DEFS: readonly (readonly (readonly [number, number, number])[])[] = [
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

const FRAME_OF_LINE: readonly number[] = [0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0]

function gf3RankU8(rows: readonly Uint8Array[], nCols: number): number {
  const mat = rows.map(r => Uint8Array.from(r))
  let rk = 0
  for (let col = 0; col < nCols && rk < mat.length; col++) {
    let piv = -1
    for (let r = rk; r < mat.length; r++) {
      if (mat[r]![col]! !== 0) {
        piv = r
        break
      }
    }
    if (piv < 0) continue
    const tmp = mat[rk]!
    mat[rk] = mat[piv]!
    mat[piv] = tmp
    const pRow = mat[rk]!
    if (pRow[col]! === 2) {
      for (let j = col; j < nCols; j++) pRow[j] = (2 * pRow[j]!) % 3
    }
    for (let r = rk + 1; r < mat.length; r++) {
      const f = mat[r]![col]!
      if (f === 0) continue
      const row = mat[r]!
      for (let j = col; j < nCols; j++) row[j] = mod3(row[j]! - f * pRow[j]!)
    }
    rk++
  }
  return rk
}

function solveLogicalOnKeptA(stabilizers: readonly Uint8Array[], target: Uint8Array): Uint8Array {
  const eraseCols: readonly number[] = [0, 1, 2, 12, 13, 14]
  const nStab = stabilizers.length
  const mat = eraseCols.map(col => {
    const row = new Uint8Array(nStab + 1)
    for (let k = 0; k < nStab; k++) row[k] = stabilizers[k]![col]!
    row[nStab] = mod3(-target[col]!)
    return row
  })
  let rk = 0
  const pivCols: number[] = []
  for (let c = 0; c < nStab && rk < eraseCols.length; c++) {
    let piv = -1
    for (let r = rk; r < eraseCols.length; r++) {
      if (mat[r]![c]! !== 0) {
        piv = r
        break
      }
    }
    if (piv < 0) continue
    const tmp = mat[rk]!
    mat[rk] = mat[piv]!
    mat[piv] = tmp
    const pRow = mat[rk]!
    if (pRow[c]! === 2) {
      for (let j = c; j <= nStab; j++) pRow[j] = (2 * pRow[j]!) % 3
    }
    for (let r = 0; r < eraseCols.length; r++) {
      if (r === rk) continue
      const f = mat[r]![c]!
      if (f === 0) continue
      const row = mat[r]!
      for (let j = c; j <= nStab; j++) row[j] = mod3(row[j]! - f * pRow[j]!)
    }
    pivCols.push(c)
    rk++
  }
  const coeffs = new Uint8Array(nStab)
  for (let i = 0; i < rk; i++) coeffs[pivCols[i]!] = mat[i]![nStab]!
  const out = Uint8Array.from(target)
  for (let k = 0; k < nStab; k++) {
    const cf = coeffs[k]!
    if (cf === 0) continue
    const st = stabilizers[k]!
    for (let j = 0; j < 2 * QUTRIT_COUNT; j++) out[j] = (out[j]! + cf * st[j]!) % 3
  }
  return out
}

export function buildSliceCodeSpec(): SliceCodeSpec {
  const stabilizers: Uint8Array[] = []
  const labels: string[] = ['allX', 'allZ']

  const allX = new Uint8Array(24)
  for (let l = 0; l < 12; l++) allX[l] = 2
  const allZ = new Uint8Array(24)
  for (let l = 0; l < 12; l++) allZ[12 + l] = 1
  stabilizers.push(allX, allZ)

  W9_LINE_DEFS.forEach((entries, idx) => {
    const row = new Uint8Array(24)
    for (const [p, l, v] of entries) {
      row[p * 12 + l] = p === 0 ? mod3(2 * v) : v
    }
    stabilizers.push(row)
    labels.push(`w9_${idx}`)
  })

  const xL = new Uint8Array(24)
  const zL = new Uint8Array(24)
  for (let l = 0; l < 12; l++) {
    const f = FRAME_OF_LINE[l]!
    const v = f === 0 ? 1 : f === 1 ? 2 : 0
    xL[l] = mod3(2 * v)
    zL[12 + l] = v
  }

  let isoDefects = 0
  for (let i = 0; i < stabilizers.length; i++) {
    for (let j = i + 1; j < stabilizers.length; j++) {
      if (sympDot12(stabilizers[i]!, stabilizers[j]!) !== 0) isoDefects++
    }
  }
  let logicalCommuteDefects = 0
  for (const s of stabilizers) {
    if (sympDot12(s, xL) !== 0) logicalCommuteDefects++
    if (sympDot12(s, zL) !== 0) logicalCommuteDefects++
  }

  const xLA = solveLogicalOnKeptA(stabilizers, xL)
  const zLA = solveLogicalOnKeptA(stabilizers, zL)
  const rank = gf3RankU8(stabilizers, 24)

  return {
    nQutrits: QUTRIT_COUNT,
    nStabilizers: stabilizers.length,
    labels,
    stabilizers,
    xL,
    zL,
    xLA,
    zLA,
    isoDefects,
    logicalCommuteDefects,
    xLzLCommutator: sympDot12(xL, zL),
    rank,
  }
}

export interface DistanceCertificate {
  readonly weight3Correctable: number
  readonly weight3Total: number
  readonly weight4Correctable: number
  readonly weight4Total: number
  readonly exactDistance: number
}

export function verifySliceCodeDistance(spec: SliceCodeSpec): DistanceCertificate {
  const choi: Uint8Array[] = spec.stabilizers.map(r => {
    const s = new Uint8Array(26)
    for (let i = 0; i < 12; i++) {
      s[i] = r[i]!
      s[13 + i] = r[12 + i]!
    }
    return s
  })
  const sX = new Uint8Array(26)
  const sZ = new Uint8Array(26)
  for (let i = 0; i < 12; i++) {
    sX[i] = spec.xL[i]!
    sZ[13 + i] = spec.zL[12 + i]!
  }
  sX[12] = 2
  sZ[25] = 1
  choi.push(sX, sZ)

  const restrictRank = (rows: readonly Uint8Array[], nQ: number, sub: readonly number[]): number => {
    const k = sub.length
    const projected = rows.map(r => {
      const out = new Uint8Array(2 * k)
      for (let j = 0; j < k; j++) {
        const q = sub[j]!
        out[j] = r[q]!
        out[k + j] = r[nQ + q]!
      }
      return out
    })
    return gf3RankU8(projected, 2 * k)
  }

  let weight3Correctable = 0
  let weight3Total = 0
  for (let a = 0; a < 12; a++) {
    for (let b = a + 1; b < 12; b++) {
      for (let c = b + 1; c < 12; c++) {
        weight3Total++
        const sub = [a, b, c]
        if (restrictRank(choi, 13, sub) === restrictRank(spec.stabilizers, 12, sub)) {
          weight3Correctable++
        }
      }
    }
  }

  let weight4Correctable = 0
  let weight4Total = 0
  for (let a = 0; a < 12; a++) {
    for (let b = a + 1; b < 12; b++) {
      for (let c = b + 1; c < 12; c++) {
        for (let d = c + 1; d < 12; d++) {
          weight4Total++
          const sub = [a, b, c, d]
          if (restrictRank(choi, 13, sub) === restrictRank(spec.stabilizers, 12, sub)) {
            weight4Correctable++
          }
        }
      }
    }
  }

  const exactDistance = weight3Correctable === weight3Total && weight4Correctable < weight4Total ? 4 : -1
  return {
    weight3Correctable,
    weight3Total,
    weight4Correctable,
    weight4Total,
    exactDistance,
  }
}

export interface SparseCodeword {
  readonly indices: Int32Array
  readonly re: Float64Array
  readonly im: Float64Array
}

export interface LogicalCodewords {
  readonly sparse: readonly [SparseCodeword, SparseCodeword, SparseCodeword]
  readonly termCounts: readonly [number, number, number]
  readonly normErrors: readonly [number, number, number]
}

export function buildLogicalCodewords(spec: SliceCodeSpec): LogicalCodewords {
  const idx0 = new Int32Array(CODEWORD_TERM_COUNT)
  const re0 = new Float64Array(CODEWORD_TERM_COUNT)
  const im0 = new Float64Array(CODEWORD_TERM_COUNT)

  // The 7 X-containing stabilizers: allX (0) and w9_0..w9_5 (2..7)
  const xStabs: readonly Uint8Array[] = [
    spec.stabilizers[0]!,
    spec.stabilizers[2]!,
    spec.stabilizers[3]!,
    spec.stabilizers[4]!,
    spec.stabilizers[5]!,
    spec.stabilizers[6]!,
    spec.stabilizers[7]!,
  ]
  const invNorm = 1 / Math.sqrt(CODEWORD_TERM_COUNT)
  const u = new Uint8Array(12)
  let cursor = 0

  const dfs = (k: number, ph: number): void => {
    if (k === 7) {
      let idx = 0
      for (let q = 0; q < 12; q++) idx += u[q]! * POW3[q]!
      idx0[cursor] = idx
      re0[cursor] = invNorm * OMEGA_RE[ph]!
      im0[cursor] = invNorm * OMEGA_IM[ph]!
      cursor++
      return
    }
    const g = xStabs[k]!
    dfs(k + 1, ph)

    let ph1 = ph
    for (let q = 0; q < 12; q++) ph1 = (ph1 + g[12 + q]! * u[q]!) % 3
    for (let q = 0; q < 12; q++) u[q] = (u[q]! + g[q]!) % 3
    dfs(k + 1, ph1)

    let ph2 = ph1
    for (let q = 0; q < 12; q++) ph2 = (ph2 + g[12 + q]! * u[q]!) % 3
    for (let q = 0; q < 12; q++) u[q] = (u[q]! + g[q]!) % 3
    dfs(k + 1, ph2)

    for (let q = 0; q < 12; q++) u[q] = (u[q]! + g[q]!) % 3
  }
  dfs(0, 0)

  const idx1 = new Int32Array(CODEWORD_TERM_COUNT)
  const idx2 = new Int32Array(CODEWORD_TERM_COUNT)
  for (let t = 0; t < CODEWORD_TERM_COUNT; t++) {
    let rem = idx0[t]!
    let i1 = 0
    let i2 = 0
    for (let q = 0; q < 12; q++) {
      const d = rem % 3
      rem = (rem - d) / 3
      const xq = spec.xL[q]!
      i1 += ((d + xq) % 3) * POW3[q]!
      i2 += ((d + 2 * xq) % 3) * POW3[q]!
    }
    idx1[t] = i1
    idx2[t] = i2
  }

  const sparse: [SparseCodeword, SparseCodeword, SparseCodeword] = [
    { indices: idx0, re: re0, im: im0 },
    { indices: idx1, re: Float64Array.from(re0), im: Float64Array.from(im0) },
    { indices: idx2, re: Float64Array.from(re0), im: Float64Array.from(im0) },
  ]

  const counts: [number, number, number] = [0, 0, 0]
  const errs: [number, number, number] = [0, 0, 0]
  for (let c = 0; c < 3; c++) {
    const sp = sparse[c]!
    const seen = new Set<number>()
    // Kahan compensated summation eliminates O(N * eps) float64 drift across 2,187 terms
    let norm2 = 0
    let comp = 0
    for (let t = 0; t < sp.indices.length; t++) {
      seen.add(sp.indices[t]!)
      const r = sp.re[t]!
      const i = sp.im[t]!
      const v = r * r + i * i
      const y = v - comp
      const s = norm2 + y
      comp = s - norm2 - y
      norm2 = s
    }
    counts[c] = seen.size
    errs[c] = Math.abs(norm2 - 1)
  }

  return { sparse, termCounts: counts, normErrors: errs }
}

export function scatterSparseCodeword(
  sp: SparseCodeword,
  outRe: Float64Array,
  outIm: Float64Array,
): void {
  outRe.fill(0)
  outIm.fill(0)
  for (let t = 0; t < sp.indices.length; t++) {
    const idx = sp.indices[t]!
    outRe[idx] = sp.re[t]!
    outIm[idx] = sp.im[t]!
  }
}

// ============================================================================
// 2. EXACT 9x9 TWO-QUTRIT UNITARIES & 23-GATE CLIFFORD ENCODER VERIFICATION
// ============================================================================

export function makeQutritF3(): ComplexMatrix {
  const m = cmatZero(3)
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const p = (a * b) % 3
      m.re[a * 3 + b] = INV_SQRT3 * OMEGA_RE[p]!
      m.im[a * 3 + b] = INV_SQRT3 * OMEGA_IM[p]!
    }
  }
  return m
}

export function makeBareUDLambda(lambda: number): ComplexMatrix {
  const phi = (lambda * PI) / 3
  const cr = Math.cos(phi)
  const ci = Math.sin(phi)
  const dr = 0.5 * (1 + cr)
  const di = 0.5 * ci
  const or = 0.5 * (1 - cr)
  const oi = -0.5 * ci
  const m = cmatZero(9)
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const col = 3 * a + b
      if (a === 0 && b === 0) {
        m.re[col * 9 + col] = 1
      } else if (a > 0 && b > 0) {
        m.re[col * 9 + col] = cr
        m.im[col * 9 + col] = ci
      } else {
        m.re[col * 9 + col] = dr
        m.im[col * 9 + col] = di
        const row = 3 * b + a
        m.re[row * 9 + col] = or
        m.im[row * 9 + col] = oi
      }
    }
  }
  return m
}

export function makeCoherentZZ(eps: number): ComplexMatrix {
  const sz: readonly number[] = [1, 0, -1]
  const m = cmatZero(9)
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const ph = -eps * sz[a]! * sz[b]!
      const k = 3 * a + b
      m.re[k * 9 + k] = Math.cos(ph)
      m.im[k * 9 + k] = Math.sin(ph)
    }
  }
  return m
}

export function makeCoherentZX(eps: number): ComplexMatrix {
  const zz = makeCoherentZZ(eps)
  const f3 = makeQutritF3()
  const ixf = cmatZero(9)
  for (let a = 0; a < 3; a++) {
    for (let b1 = 0; b1 < 3; b1++) {
      for (let b2 = 0; b2 < 3; b2++) {
        ixf.re[(3 * a + b1) * 9 + (3 * a + b2)] = f3.re[b1 * 3 + b2]!
        ixf.im[(3 * a + b1) * 9 + (3 * a + b2)] = f3.im[b1 * 3 + b2]!
      }
    }
  }
  return cmatMul(ixf, cmatMul(zz, cmatDag(ixf)))
}

export function applyTwoQutritGate(
  re: Float64Array,
  im: Float64Array,
  qA: number,
  qB: number,
  u9: ComplexMatrix,
): void {
  const sA = POW3[qA]!
  const sB = POW3[qB]!
  const hi = Math.max(qA, qB)
  const lo = Math.min(qA, qB)
  const sHi = POW3[hi]!
  const sLo = POW3[lo]!
  const tmpR = new Float64Array(9)
  const tmpI = new Float64Array(9)

  for (let b2 = 0; b2 < HILBERT_DIM_12; b2 += 3 * sHi) {
    for (let b1 = 0; b1 < sHi; b1 += 3 * sLo) {
      for (let b0 = 0; b0 < sLo; b0++) {
        const base = b2 + b1 + b0
        let any = false
        for (let a = 0; a < 3; a++) {
          for (let b = 0; b < 3; b++) {
            const p = base + a * sA + b * sB
            const vr = re[p]!
            const vi = im[p]!
            tmpR[3 * a + b] = vr
            tmpI[3 * a + b] = vi
            if (vr !== 0 || vi !== 0) any = true
          }
        }
        if (!any) continue
        for (let r = 0; r < 9; r++) {
          let sr = 0
          let si = 0
          const rOff = r * 9
          for (let c = 0; c < 9; c++) {
            const ur = u9.re[rOff + c]!
            const ui = u9.im[rOff + c]!
            sr += ur * tmpR[c]! - ui * tmpI[c]!
            si += ur * tmpI[c]! + ui * tmpR[c]!
          }
          const a = (r / 3) | 0
          const b = r % 3
          const p = base + a * sA + b * sB
          re[p] = sr
          im[p] = si
        }
      }
    }
  }
}

// Simulate the exact 23-gate native qutrit Clifford encoder on |cInit>_0 |0>^11.
// Reuses optional caller buffers to keep peak RSS low.
export function simulateNativeCliffordEncoder(
  cInit: QutritValue,
  bufRe?: Float64Array,
  bufIm?: Float64Array,
): {
  readonly re: Float64Array
  readonly im: Float64Array
} {
  const re = bufRe ?? new Float64Array(HILBERT_DIM_12)
  const im = bufIm ?? new Float64Array(HILBERT_DIM_12)
  re.fill(0)
  im.fill(0)
  re[cInit] = 1

  const applyPlusFromZero = (q: number): void => {
    const s = POW3[q]!
    const blk = 3 * s
    for (let b = 0; b < HILBERT_DIM_12; b += blk) {
      for (let o = 0; o < s; o++) {
        const i0 = b + o
        const i1 = i0 + s
        const i2 = i1 + s
        const r0 = re[i0]!
        const m0 = im[i0]!
        if (r0 === 0 && m0 === 0) continue
        re[i0] = r0 * INV_SQRT3
        im[i0] = m0 * INV_SQRT3
        re[i1] = r0 * INV_SQRT3
        im[i1] = m0 * INV_SQRT3
        re[i2] = r0 * INV_SQRT3
        im[i2] = m0 * INV_SQRT3
      }
    }
  }

  const applyNeg = (q: number): void => {
    const s = POW3[q]!
    const blk = 3 * s
    for (let b = 0; b < HILBERT_DIM_12; b += blk) {
      for (let o = 0; o < s; o++) {
        const i1 = b + o + s
        const i2 = i1 + s
        const tr = re[i1]!
        const ti = im[i1]!
        re[i1] = re[i2]!
        im[i1] = im[i2]!
        re[i2] = tr
        im[i2] = ti
      }
    }
  }

  const applyCZ = (qA: number, qB: number, gamma: 1 | 2): void => {
    const sA = POW3[qA]!
    const sB = POW3[qB]!
    const hi = Math.max(qA, qB)
    const lo = Math.min(qA, qB)
    const sHi = POW3[hi]!
    const sLo = POW3[lo]!
    for (let b2 = 0; b2 < HILBERT_DIM_12; b2 += 3 * sHi) {
      for (let b1 = 0; b1 < sHi; b1 += 3 * sLo) {
        for (let b0 = 0; b0 < sLo; b0++) {
          const base = b2 + b1 + b0
          for (let a = 1; a < 3; a++) {
            for (let b = 1; b < 3; b++) {
              const p = base + a * sA + b * sB
              const vr = re[p]!
              const vi = im[p]!
              if (vr === 0 && vi === 0) continue
              const ph = (gamma * a * b) % 3
              const wr = OMEGA_RE[ph]!
              const wi = OMEGA_IM[ph]!
              re[p] = vr * wr - vi * wi
              im[p] = vr * wi + vi * wr
            }
          }
        }
      }
    }
  }

  const applySUM = (ctrl: number, tgt: number, mult: 1 | 2): void => {
    const sC = POW3[ctrl]!
    const sT = POW3[tgt]!
    const hi = Math.max(ctrl, tgt)
    const lo = Math.min(ctrl, tgt)
    const sHi = POW3[hi]!
    const sLo = POW3[lo]!
    for (let b2 = 0; b2 < HILBERT_DIM_12; b2 += 3 * sHi) {
      for (let b1 = 0; b1 < sHi; b1 += 3 * sLo) {
        for (let b0 = 0; b0 < sLo; b0++) {
          const base = b2 + b1 + b0
          for (let a = 1; a < 3; a++) {
            const sh = (mult * a) % 3
            const p0 = base + a * sC
            const p1 = p0 + sT
            const p2 = p1 + sT
            const r0 = re[p0]!
            const m0 = im[p0]!
            const r1 = re[p1]!
            const m1 = im[p1]!
            const r2 = re[p2]!
            const m2 = im[p2]!
            if (r0 === 0 && m0 === 0 && r1 === 0 && m1 === 0 && r2 === 0 && m2 === 0) continue
            if (sh === 1) {
              re[p1] = r0
              im[p1] = m0
              re[p2] = r1
              im[p2] = m1
              re[p0] = r2
              im[p0] = m2
            } else {
              re[p2] = r0
              im[p2] = m0
              re[p0] = r1
              im[p0] = m1
              re[p1] = r2
              im[p1] = m2
            }
          }
        }
      }
    }
  }

  for (const q of [4, 1, 3, 5, 7, 9, 11]) applyPlusFromZero(q)
  applyCZ(1, 11, 2)
  applyCZ(3, 9, 2)
  applyCZ(5, 7, 2)
  applySUM(0, 2, 1)
  applySUM(2, 8, 1)
  applyNeg(0)
  applySUM(0, 10, 1)
  applyNeg(4)
  applySUM(4, 6, 1)
  applySUM(4, 0, 1)
  applySUM(6, 2, 1)
  applySUM(4, 8, 1)
  applySUM(6, 10, 1)
  for (let k = 0; k < 6; k++) {
    const e = 2 * k
    const m = 2 * k + 1
    applySUM(e, m, 1)
    applyNeg(e)
    applySUM(m, e, 2)
  }

  return { re, im }
}

// ============================================================================
// 3. GATE-LEVEL BINARY-QUBIT COMPILATION, NATIVE Ba-137 SCHEDULE & OPENQASM 3.0
// ============================================================================

export type QubitGateOp =
  | { readonly op: 'x'; readonly q: number }
  | { readonly op: 'h'; readonly q: number }
  | { readonly op: 'ry'; readonly q: number; readonly theta: number }
  | { readonly op: 'rz'; readonly q: number; readonly phi: number }
  | {
      readonly op: 'u3'
      readonly q: number
      readonly theta: number
      readonly phi: number
      readonly lam: number
    }
  | { readonly op: 'cx'; readonly ctrl: number; readonly tgt: number }
  | { readonly op: 'rzz'; readonly q0: number; readonly q1: number; readonly angle: number }
  | { readonly op: 'gphase'; readonly angle: number }

export interface NativeQutritPulseOp {
  readonly gate: string
  readonly qutrits: readonly number[]
  readonly nativePrimitive: 'Givens_1q' | 'MS_2q'
  readonly param: number
  readonly comment: string
}

export type HardwareCircuitKind =
  | 'stabilizer_baseline'
  | 'bare_u_magic'
  | 'coherent_zz_control'
  | 'coherent_zx_mimicry'

export interface HardwareCircuitDescriptor {
  readonly kind: HardwareCircuitKind
  readonly label: string
  readonly theta: number
  readonly param: number
  readonly qubitCount: number
  readonly qutritCount: number
  readonly oneQubitGates: number
  readonly twoQubitGates: number
  readonly intraQutritTwoQubitGates: number
  readonly interQutritTwoQubitGates: number
  readonly circuitDepth: number
  readonly nativeQutritOneGates: number
  readonly nativeQutritTwoGates: number
  readonly nativeQutritDepth: number
  readonly nativeBa137Schedule: readonly NativeQutritPulseOp[]
  readonly targetBackends: readonly string[]
  readonly qasm3: string
}

// Exact ZYZ decomposition of a 2x2 unitary U = e^{i delta} Rz(alpha) Ry(beta) Rz(gamma)
function decomposeU2ZYZ(
  u00r: number,
  u00i: number,
  u01r: number,
  u01i: number,
  u10r: number,
  u10i: number,
  u11r: number,
  u11i: number,
): { readonly delta: number; readonly alpha: number; readonly beta: number; readonly gamma: number } {
  // det(U) = u00*u11 - u01*u10 = e^{2i delta}
  const detR = u00r * u11r - u00i * u11i - (u01r * u10r - u01i * u10i)
  const detI = u00r * u11i + u00i * u11r - (u01r * u10i + u01i * u10r)
  const delta = 0.5 * Math.atan2(detI, detR)
  const cd = Math.cos(-delta)
  const sd = Math.sin(-delta)
  const s00r = cd * u00r - sd * u00i
  const s00i = cd * u00i + sd * u00r
  const s01r = cd * u01r - sd * u01i
  const s01i = cd * u01i + sd * u01r
  const s10r = cd * u10r - sd * u10i
  const s10i = cd * u10i + sd * u10r
  const s11r = cd * u11r - sd * u11i
  const s11i = cd * u11i + sd * u11r

  const cHalf = Math.min(1, Math.hypot(s00r, s00i))
  const sHalf = Math.min(1, Math.hypot(s10r, s10i))
  const beta = 2 * Math.atan2(sHalf, cHalf)

  let alpha = 0
  let gamma = 0
  if (cHalf < 1e-12) {
    // beta = pi: s10 = e^{i (alpha - gamma)/2}, s01 = -e^{-i (alpha - gamma)/2}
    alpha = 2 * Math.atan2(s10i, s10r)
    gamma = 0
  } else if (sHalf < 1e-12) {
    // beta = 0: s11 = e^{i (alpha + gamma)/2}
    alpha = 2 * Math.atan2(s11i, s11r)
    gamma = 0
  } else {
    // s11 = e^{i (alpha + gamma)/2} cos(beta/2)
    // s10 = e^{i (alpha - gamma)/2} sin(beta/2)
    const sumHalf = Math.atan2(s11i, s11r)
    const diffHalf = Math.atan2(s10i, s10r)
    alpha = sumHalf + diffHalf
    gamma = sumHalf - diffHalf
  }
  return { delta, alpha, beta, gamma }
}

// Exact controlled-U(2) on (ctrl -> tgt) using Barenco Lemma 4.3 (2 CNOTs, zero approximation)
function emitControlledU2(
  ops: QubitGateOp[],
  ctrl: number,
  tgt: number,
  u00r: number,
  u00i: number,
  u01r: number,
  u01i: number,
  u10r: number,
  u10i: number,
  u11r: number,
  u11i: number,
): void {
  const { delta, alpha, beta, gamma } = decomposeU2ZYZ(
    u00r,
    u00i,
    u01r,
    u01i,
    u10r,
    u10i,
    u11r,
    u11i,
  )
  const cAng = 0.5 * (gamma - alpha)
  const bRz = -0.5 * (alpha + gamma)
  const bRy = -0.5 * beta
  const aRy = 0.5 * beta
  const aRz = alpha

  if (Math.abs(cAng) > 1e-14) ops.push({ op: 'rz', q: tgt, phi: cAng })
  ops.push({ op: 'cx', ctrl, tgt })
  if (Math.abs(bRz) > 1e-14) ops.push({ op: 'rz', q: tgt, phi: bRz })
  if (Math.abs(bRy) > 1e-14) ops.push({ op: 'ry', q: tgt, theta: bRy })
  ops.push({ op: 'cx', ctrl, tgt })
  if (Math.abs(aRy) > 1e-14) ops.push({ op: 'ry', q: tgt, theta: aRy })
  if (Math.abs(aRz) > 1e-14) ops.push({ op: 'rz', q: tgt, phi: aRz })
  if (Math.abs(delta) > 1e-14) {
    ops.push({ op: 'rz', q: ctrl, phi: delta })
    ops.push({ op: 'gphase', angle: 0.5 * delta })
  }
}

// Exact 2-qubit diagonal gate diag(e^{i p0}, e^{i p1}, e^{i p2}, e^{i p3}) on (q0, q1) (<= 2 CNOTs)
function emitDiag2Qubit(
  ops: QubitGateOp[],
  q0: number,
  q1: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number,
): void {
  // Phase on |b0 b1>: c0 + c1*(1-2*b1) + c2*(1-2*b0) + c3*(1-2*b0)*(1-2*b1)
  // Solve Walsh-Hadamard transform:
  const c0 = 0.25 * (p0 + p1 + p2 + p3)
  const cZ1 = 0.25 * (p0 - p1 + p2 - p3) // coeff of Z_q1
  const cZ0 = 0.25 * (p0 + p1 - p2 - p3) // coeff of Z_q0
  const cZZ = 0.25 * (p0 - p1 - p2 + p3) // coeff of Z_q0 Z_q1
  if (Math.abs(c0) > 1e-14) ops.push({ op: 'gphase', angle: c0 })
  if (Math.abs(cZ0) > 1e-14) ops.push({ op: 'rz', q: q0, phi: -2 * cZ0 })
  if (Math.abs(cZ1) > 1e-14) ops.push({ op: 'rz', q: q1, phi: -2 * cZ1 })
  if (Math.abs(cZZ) > 1e-14) {
    ops.push({ op: 'cx', ctrl: q0, tgt: q1 })
    ops.push({ op: 'rz', q: q1, phi: -2 * cZZ })
    ops.push({ op: 'cx', ctrl: q0, tgt: q1 })
  }
}

// Compile any exact 3x3 single-qutrit unitary U on {|00>,|01>,|10>} fixing |11> into 2-qubit gates.
export function compileSingleQutritU3Ops(
  q0: number,
  q1: number,
  u3: ComplexMatrix,
): QubitGateOp[] {
  // Decompose U = G_{01}^dag G_{02}^dag G_{12}^dag D via left-Givens elimination:
  // Step 1: zero (2, 0) using Givens on rows (1, 2) -> R12 * U has [*, *, *; *, *, *; 0, *, *]
  // Step 2: zero (1, 0) using Givens on rows (0, 1) -> R01 * R12 * U has [e^{i p0}, 0, 0; 0, *, *; 0, *, *]
  // Step 3: zero (2, 1) using Givens on rows (1, 2) -> R12b * R01 * R12 * U = diag(e^{i p0}, e^{i p1}, e^{i p2})
  // Therefore U = R12^dag * R01^dag * R12b^dag * D!
  const mr = Float64Array.from(u3.re)
  const mi = Float64Array.from(u3.im)

  interface GivensStep {
    readonly i: number
    readonly j: number
    readonly a00r: number
    readonly a00i: number
    readonly a01r: number
    readonly a01i: number
    readonly a10r: number
    readonly a10i: number
    readonly a11r: number
    readonly a11i: number
  }
  const steps: GivensStep[] = []

  const zeroEntry = (i: number, j: number, col: number): void => {
    const xr = mr[i * 3 + col]!
    const xi = mi[i * 3 + col]!
    const yr = mr[j * 3 + col]!
    const yi = mi[j * 3 + col]!
    const norm = Math.hypot(xr, xi, yr, yi)
    if (Math.hypot(yr, yi) < 1e-15 || norm < 1e-15) return
    // Left-multiply rows (i, j) by G = [[conj(x)/n, conj(y)/n], [-y/n, x/n]] so G*[x;y] = [n; 0]
    const g00r = xr / norm
    const g00i = -xi / norm
    const g01r = yr / norm
    const g01i = -yi / norm
    const g10r = -yr / norm
    const g10i = -yi / norm
    const g11r = xr / norm
    const g11i = xi / norm
    for (let c = 0; c < 3; c++) {
      const ar = mr[i * 3 + c]!
      const ai = mi[i * 3 + c]!
      const br = mr[j * 3 + c]!
      const bi = mi[j * 3 + c]!
      mr[i * 3 + c] = g00r * ar - g00i * ai + (g01r * br - g01i * bi)
      mi[i * 3 + c] = g00r * ai + g00i * ar + (g01r * bi + g01i * br)
      mr[j * 3 + c] = g10r * ar - g10i * ai + (g11r * br - g11i * bi)
      mi[j * 3 + c] = g10r * ai + g10i * ar + (g11r * bi + g11i * br)
    }
    // Store G^dag = [[x/n, -conj(y)/n], [y/n, conj(x)/n]] to reconstruct U = prod G^dag * D
    steps.push({
      i,
      j,
      a00r: g00r,
      a00i: -g00i,
      a01r: g10r,
      a01i: -g10i,
      a10r: g01r,
      a10i: -g01i,
      a11r: g11r,
      a11i: -g11i,
    })
  }

  zeroEntry(1, 2, 0)
  zeroEntry(0, 1, 0)
  zeroEntry(1, 2, 1)

  const p0 = Math.atan2(mi[0]!, mr[0]!)
  const p1 = Math.atan2(mi[4]!, mr[4]!)
  const p2 = Math.atan2(mi[8]!, mr[8]!)

  const ops: QubitGateOp[] = []
  // Apply D first, then steps in reverse (since U = steps[0] * steps[1] * steps[2] * D)
  emitDiag2Qubit(ops, q0, q1, p0, p1, p2, 0)
  for (let sIdx = steps.length - 1; sIdx >= 0; sIdx--) {
    const st = steps[sIdx]!
    if (st.i === 0 && st.j === 1) {
      // Acts on {|00>, |01>} -> controlled on q0=0 acting on q1
      ops.push({ op: 'x', q: q0 })
      emitControlledU2(
        ops,
        q0,
        q1,
        st.a00r,
        st.a00i,
        st.a01r,
        st.a01i,
        st.a10r,
        st.a10i,
        st.a11r,
        st.a11i,
      )
      ops.push({ op: 'x', q: q0 })
    } else if (st.i === 1 && st.j === 2) {
      // Acts on {|01>, |10>} -> cx(q0, q1) maps |01>->|01>, |10>->|11>, |00>->|00>, |11>->|10>
      // So on q0 controlled by q1=1: |0> corresponds to |01> (state 1), |1> corresponds to |11> (was |10>, state 2)!
      ops.push({ op: 'cx', ctrl: q0, tgt: q1 })
      emitControlledU2(
        ops,
        q1,
        q0,
        st.a00r,
        st.a00i,
        st.a01r,
        st.a01i,
        st.a10r,
        st.a10i,
        st.a11r,
        st.a11i,
      )
      ops.push({ op: 'cx', ctrl: q0, tgt: q1 })
    }
  }
  return ops
}

// Exact C^3 P(phi) on 4 qubits applying e^{i phi} exclusively to |1111> (14 CNOTs, zero ancillas)
function emitC3Phase(
  ops: QubitGateOp[],
  q0: number,
  q1: number,
  q2: number,
  q3: number,
  phi: number,
): void {
  const a = phi / 8
  ops.push({ op: 'gphase', angle: phi / 16 })
  ops.push(
    { op: 'rz', q: q0, phi: a },
    { op: 'rz', q: q1, phi: a },
    { op: 'rz', q: q2, phi: a },
    { op: 'rz', q: q3, phi: a },
  )
  ops.push({ op: 'cx', ctrl: q0, tgt: q3 }, { op: 'rz', q: q3, phi: -a })
  ops.push({ op: 'cx', ctrl: q1, tgt: q3 }, { op: 'rz', q: q3, phi: a })
  ops.push({ op: 'cx', ctrl: q0, tgt: q3 }, { op: 'rz', q: q3, phi: -a })
  ops.push({ op: 'cx', ctrl: q2, tgt: q3 }, { op: 'rz', q: q3, phi: a })
  ops.push({ op: 'cx', ctrl: q0, tgt: q3 }, { op: 'rz', q: q3, phi: -a })
  ops.push({ op: 'cx', ctrl: q1, tgt: q3 }, { op: 'rz', q: q3, phi: a })
  ops.push({ op: 'cx', ctrl: q0, tgt: q3 }, { op: 'rz', q: q3, phi: -a })
  ops.push({ op: 'cx', ctrl: q2, tgt: q3 })

  ops.push({ op: 'cx', ctrl: q0, tgt: q2 }, { op: 'rz', q: q2, phi: -a })
  ops.push({ op: 'cx', ctrl: q1, tgt: q2 }, { op: 'rz', q: q2, phi: a })
  ops.push({ op: 'cx', ctrl: q0, tgt: q2 }, { op: 'rz', q: q2, phi: -a })
  ops.push({ op: 'cx', ctrl: q1, tgt: q2 })

  ops.push({ op: 'cx', ctrl: q0, tgt: q1 }, { op: 'rz', q: q1, phi: -a })
  ops.push({ op: 'cx', ctrl: q0, tgt: q1 })
}

// Exact 4-qubit binary decomposition of bare-U fractional half-coin D^lambda:
//   - 38 CNOTs per two-qutrit gate, zero ancillas
//   - Exact identity on all 7 leakage states (zero leakage transitions)
//   - ||U_compiled - U_exact||_F < 1e-14
export function compileDLambdaQubitOps(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
  lambda: number,
): QubitGateOp[] {
  const phi = (lambda * PI) / 3
  const ops: QubitGateOp[] = []
  if (Math.abs(phi) < 1e-15) return ops

  // 1. Doubly-occupied block (6 CNOTs): phase e^{i phi} on (a0^a1) & (b0^b1)
  ops.push({ op: 'cx', ctrl: a0, tgt: a1 }, { op: 'cx', ctrl: b0, tgt: b1 })
  ops.push(
    { op: 'gphase', angle: phi / 4 },
    { op: 'rz', q: a1, phi: phi / 2 },
    { op: 'rz', q: b1, phi: phi / 2 },
    { op: 'cx', ctrl: a1, tgt: b1 },
    { op: 'rz', q: b1, phi: -phi / 2 },
    { op: 'cx', ctrl: a1, tgt: b1 },
  )
  ops.push({ op: 'cx', ctrl: b0, tgt: b1 }, { op: 'cx', ctrl: a0, tgt: a1 })

  // 2. Lone-excitation Block 1: |01,00> <-> |00,01> (16 CNOTs)
  ops.push(
    { op: 'cx', ctrl: a1, tgt: b1 },
    { op: 'h', q: a1 },
    { op: 'x', q: a0 },
    { op: 'x', q: b0 },
  )
  emitC3Phase(ops, a0, a1, b0, b1, phi)
  ops.push(
    { op: 'x', q: b0 },
    { op: 'x', q: a0 },
    { op: 'h', q: a1 },
    { op: 'cx', ctrl: a1, tgt: b1 },
  )

  // 3. Lone-excitation Block 2: |10,00> <-> |00,10> (16 CNOTs)
  ops.push(
    { op: 'cx', ctrl: a0, tgt: b0 },
    { op: 'h', q: a0 },
    { op: 'x', q: a1 },
    { op: 'x', q: b1 },
  )
  emitC3Phase(ops, a0, a1, b0, b1, phi)
  ops.push(
    { op: 'x', q: b1 },
    { op: 'x', q: a1 },
    { op: 'h', q: a0 },
    { op: 'cx', ctrl: a0, tgt: b0 },
  )

  return ops
}

// Exact 4-qubit binary decomposition of coherent ZZ(eps) = exp(-i eps S_z (x) S_z):
// 4 native RZZ gates + 4 RZ gates, strictly diagonal (zero leakage transitions).
export function compileZZQubitOps(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
  eps: number,
): QubitGateOp[] {
  const ops: QubitGateOp[] = []
  if (Math.abs(eps) < 1e-15) return ops
  ops.push({ op: 'gphase', angle: -0.25 * eps })
  ops.push(
    { op: 'rz', q: a0, phi: -eps },
    { op: 'rz', q: a1, phi: -0.5 * eps },
    { op: 'rz', q: b0, phi: -eps },
    { op: 'rz', q: b1, phi: -0.5 * eps },
  )
  ops.push(
    { op: 'rzz', q0: a0, q1: b0, angle: 2 * eps },
    { op: 'rzz', q0: a0, q1: b1, angle: eps },
    { op: 'rzz', q0: a1, q1: b0, angle: eps },
    { op: 'rzz', q0: a1, q1: b1, angle: 0.5 * eps },
  )
  return ops
}

// Exact 4-qubit binary decomposition of Clifford-rotated ZX(eps) = (I x F_3) ZZ(eps) (I x F_3^dag).
export function compileZXQubitOps(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
  eps: number,
): QubitGateOp[] {
  const f3 = makeQutritF3()
  const f3Dag = cmatDag(f3)
  const ops: QubitGateOp[] = []
  ops.push(...compileSingleQutritU3Ops(b0, b1, f3Dag))
  ops.push(...compileZZQubitOps(a0, a1, b0, b1, eps))
  ops.push(...compileSingleQutritU3Ops(b0, b1, f3))
  return ops
}

// Standard 6-CNOT exact Toffoli (ccx) decomposition into {h, rz, cx}
// Note: T = e^{i pi/8} Rz(pi/4) and T^dag = e^{-i pi/8} Rz(-pi/4); 4*T + 3*T^dag gives gphase(+pi/8).
function emitToffoli(ops: QubitGateOp[], c0: number, c1: number, tgt: number): void {
  const t = PI / 4
  ops.push(
    { op: 'gphase', angle: PI / 8 },
    { op: 'h', q: tgt },
    { op: 'cx', ctrl: c1, tgt },
    { op: 'rz', q: tgt, phi: -t },
    { op: 'cx', ctrl: c0, tgt },
    { op: 'rz', q: tgt, phi: t },
    { op: 'cx', ctrl: c1, tgt },
    { op: 'rz', q: tgt, phi: -t },
    { op: 'cx', ctrl: c0, tgt },
    { op: 'rz', q: c1, phi: t },
    { op: 'rz', q: tgt, phi: t },
    { op: 'h', q: tgt },
    { op: 'cx', ctrl: c0, tgt: c1 },
    { op: 'rz', q: c0, phi: t },
    { op: 'rz', q: c1, phi: -t },
    { op: 'cx', ctrl: c0, tgt: c1 },
  )
}

// Exact 4-qubit binary decomposition of 2-qutrit CZ_3(gamma) = omega^{gamma a b} (8 CNOTs)
export function compileCZ3QubitOps(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
  gamma: 1 | 2,
): QubitGateOp[] {
  // On valid states: a = a1 + 2 a0, b = b1 + 2 b0 (mod 3)
  // gamma * a * b mod 3 = gamma*a1*b1 + 2*gamma*a1*b0 + 2*gamma*a0*b1 + gamma*a0*b0
  const ops: QubitGateOp[] = []
  const emitCP = (qA: number, qB: number, multMod3: number): void => {
    const phi = (2 * PI * multMod3) / 3
    ops.push(
      { op: 'gphase', angle: phi / 4 },
      { op: 'rz', q: qA, phi: phi / 2 },
      { op: 'rz', q: qB, phi: phi / 2 },
      { op: 'cx', ctrl: qA, tgt: qB },
      { op: 'rz', q: qB, phi: -phi / 2 },
      { op: 'cx', ctrl: qA, tgt: qB },
    )
  }
  emitCP(a1, b1, gamma)
  emitCP(a1, b0, mod3(2 * gamma))
  emitCP(a0, b1, mod3(2 * gamma))
  emitCP(a0, b0, gamma)
  return ops
}

// Exact 4-qubit binary decomposition of 2-qutrit SUM_3(mult): |a, b> -> |a, (b + mult*a) mod 3>.
// Preserves |11> leakage states on target identically (28 CNOTs, zero ancillas).
export function compileSUM3QubitOps(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
  mult: 1 | 2,
): QubitGateOp[] {
  const ops: QubitGateOp[] = []
  // Controlled-X3 (ctrl -> b): CSWAP(ctrl; b0, b1) then CC0X(ctrl, b0 -> b1)
  const emitCtrlX3 = (ctrl: number): void => {
    ops.push({ op: 'cx', ctrl: b1, tgt: b0 })
    emitToffoli(ops, ctrl, b0, b1)
    ops.push({ op: 'cx', ctrl: b1, tgt: b0 })
    ops.push({ op: 'x', q: b0 })
    emitToffoli(ops, ctrl, b0, b1)
    ops.push({ op: 'x', q: b0 })
  }
  // Controlled-X3^2 (ctrl -> b): CC0X(ctrl, b0 -> b1) then CSWAP(ctrl; b0, b1)
  const emitCtrlX3Sq = (ctrl: number): void => {
    ops.push({ op: 'x', q: b0 })
    emitToffoli(ops, ctrl, b0, b1)
    ops.push({ op: 'x', q: b0 })
    ops.push({ op: 'cx', ctrl: b1, tgt: b0 })
    emitToffoli(ops, ctrl, b0, b1)
    ops.push({ op: 'cx', ctrl: b1, tgt: b0 })
  }
  if (mult === 1) {
    // a=1 (a1=1): X3; a=2 (a0=1): X3^2
    emitCtrlX3(a1)
    emitCtrlX3Sq(a0)
  } else {
    // a=1 (a1=1): X3^2; a=2 (a0=1): X3
    emitCtrlX3Sq(a1)
    emitCtrlX3(a0)
  }
  return ops
}

// Exact 16x16 unitary matrix simulator for 4-qubit compiled gate sequences (local wires 0,1,2,3).
export function simulate4QubitOps(ops: readonly QubitGateOp[]): ComplexMatrix {
  const m = cmatEye(16)
  const apply1 = (
    q: number,
    m00r: number,
    m00i: number,
    m01r: number,
    m01i: number,
    m10r: number,
    m10i: number,
    m11r: number,
    m11i: number,
  ): void => {
    const bit = 1 << (3 - q)
    for (let col = 0; col < 16; col++) {
      for (let r = 0; r < 16; r++) {
        if ((r & bit) !== 0) continue
        const r0 = r
        const r1 = r | bit
        const a0r = m.re[r0 * 16 + col]!
        const a0i = m.im[r0 * 16 + col]!
        const a1r = m.re[r1 * 16 + col]!
        const a1i = m.im[r1 * 16 + col]!
        m.re[r0 * 16 + col] = m00r * a0r - m00i * a0i + (m01r * a1r - m01i * a1i)
        m.im[r0 * 16 + col] = m00r * a0i + m00i * a0r + (m01r * a1i + m01i * a1r)
        m.re[r1 * 16 + col] = m10r * a0r - m10i * a0i + (m11r * a1r - m11i * a1i)
        m.im[r1 * 16 + col] = m10r * a0i + m10i * a0r + (m11r * a1i + m11i * a1r)
      }
    }
  }

  for (const op of ops) {
    if (op.op === 'x') {
      apply1(op.q, 0, 0, 1, 0, 1, 0, 0, 0)
    } else if (op.op === 'h') {
      apply1(op.q, INV_SQRT2, 0, INV_SQRT2, 0, INV_SQRT2, 0, -INV_SQRT2, 0)
    } else if (op.op === 'rz') {
      const c = Math.cos(0.5 * op.phi)
      const s = Math.sin(0.5 * op.phi)
      apply1(op.q, c, -s, 0, 0, 0, 0, c, s)
    } else if (op.op === 'ry') {
      const c = Math.cos(0.5 * op.theta)
      const s = Math.sin(0.5 * op.theta)
      apply1(op.q, c, 0, -s, 0, s, 0, c, 0)
    } else if (op.op === 'u3') {
      const ct = Math.cos(0.5 * op.theta)
      const st = Math.sin(0.5 * op.theta)
      const cp = Math.cos(op.phi)
      const sp = Math.sin(op.phi)
      const cl = Math.cos(op.lam)
      const sl = Math.sin(op.lam)
      const cpl = Math.cos(op.phi + op.lam)
      const spl = Math.sin(op.phi + op.lam)
      apply1(op.q, ct, 0, -cl * st, -sl * st, cp * st, sp * st, cpl * ct, spl * ct)
    } else if (op.op === 'cx') {
      const cb = 1 << (3 - op.ctrl)
      const tb = 1 << (3 - op.tgt)
      for (let col = 0; col < 16; col++) {
        for (let r = 0; r < 16; r++) {
          if ((r & cb) === 0 || (r & tb) !== 0) continue
          const r0 = r
          const r1 = r | tb
          const tr = m.re[r0 * 16 + col]!
          const ti = m.im[r0 * 16 + col]!
          m.re[r0 * 16 + col] = m.re[r1 * 16 + col]!
          m.im[r0 * 16 + col] = m.im[r1 * 16 + col]!
          m.re[r1 * 16 + col] = tr
          m.im[r1 * 16 + col] = ti
        }
      }
    } else if (op.op === 'rzz') {
      const b0 = 1 << (3 - op.q0)
      const b1 = 1 << (3 - op.q1)
      const c = Math.cos(0.5 * op.angle)
      const s = Math.sin(0.5 * op.angle)
      for (let r = 0; r < 16; r++) {
        const z0 = (r & b0) !== 0 ? -1 : 1
        const z1 = (r & b1) !== 0 ? -1 : 1
        const sign = z0 * z1
        const pr = c
        const pi = -sign * s
        const rOff = r * 16
        for (let col = 0; col < 16; col++) {
          const ar = m.re[rOff + col]!
          const ai = m.im[rOff + col]!
          m.re[rOff + col] = pr * ar - pi * ai
          m.im[rOff + col] = pr * ai + pi * ar
        }
      }
    } else if (op.op === 'gphase') {
      const c = Math.cos(op.angle)
      const s = Math.sin(op.angle)
      for (let i = 0; i < 256; i++) {
        const ar = m.re[i]!
        const ai = m.im[i]!
        m.re[i] = c * ar - s * ai
        m.im[i] = c * ai + s * ar
      }
    }
  }
  return m
}

export interface FourQubitParityReport {
  readonly validBlockFrobeniusError: number
  readonly leakageCouplingError: number
  readonly leakageBlockIdentityError: number
}

// Compare a 16x16 4-qubit compiled unitary against a 9x9 two-qutrit target unitary.
export function verify4QubitCompilationParity(
  compiled16: ComplexMatrix,
  exact9: ComplexMatrix,
  checkLeakageIdentity: boolean,
): FourQubitParityReport {
  let validErrSq = 0
  let couplingErrSq = 0
  let leakIdErrSq = 0

  for (let r = 0; r < 16; r++) {
    const ar = (r >> 2) & 3
    const br = r & 3
    const rLeak = ar === 3 || br === 3
    for (let c = 0; c < 16; c++) {
      const ac = (c >> 2) & 3
      const bc = c & 3
      const cLeak = ac === 3 || bc === 3
      const ur = compiled16.re[r * 16 + c]!
      const ui = compiled16.im[r * 16 + c]!

      if (!rLeak && !cLeak) {
        const r9 = 3 * ar + br
        const c9 = 3 * ac + bc
        const dr = ur - exact9.re[r9 * 9 + c9]!
        const di = ui - exact9.im[r9 * 9 + c9]!
        validErrSq += dr * dr + di * di
      } else if (rLeak !== cLeak) {
        couplingErrSq += ur * ur + ui * ui
      } else if (checkLeakageIdentity) {
        const dr = ur - (r === c ? 1 : 0)
        const di = ui
        leakIdErrSq += dr * dr + di * di
      }
    }
  }

  return {
    validBlockFrobeniusError: Math.sqrt(validErrSq),
    leakageCouplingError: Math.sqrt(couplingErrSq),
    leakageBlockIdentityError: Math.sqrt(leakIdErrSq),
  }
}

function buildEncoderQubitOps(theta: number): QubitGateOp[] {
  const ops: QubitGateOp[] = []
  const qb0 = (qutrit: number): number => 2 * qutrit
  const qb1 = (qutrit: number): number => 2 * qutrit + 1

  // Stage 0: Prepare bulk logical input |psi(theta)> = cos(theta)|00> + sin(theta)|01> on qutrit 0
  if (Math.abs(theta) > 1e-15) {
    ops.push({ op: 'u3', q: qb1(0), theta: 2 * theta, phi: 0, lam: 0 })
  }

  // Stage 1: Prepare uniform qutrit superpositions |+>_3 on qutrits [4, 1, 3, 5, 7, 9, 11]
  // |00> -> (|00> + |01> + |10>) / sqrt(3) in 2 CNOTs per qutrit, zero |11> leakage
  const prepAngle0 = 2 * Math.acos(Math.sqrt(2 / 3))
  for (const q of [4, 1, 3, 5, 7, 9, 11]) {
    const q0 = qb0(q)
    const q1 = qb1(q)
    ops.push(
      { op: 'ry', q: q0, theta: prepAngle0 },
      { op: 'x', q: q0 },
      { op: 'ry', q: q1, theta: PI / 4 },
      { op: 'cx', ctrl: q0, tgt: q1 },
      { op: 'ry', q: q1, theta: -PI / 4 },
      { op: 'cx', ctrl: q0, tgt: q1 },
      { op: 'x', q: q0 },
    )
  }

  // Stage 2: Three disjoint CZ_3^2 gates (depth 1 in native qutrits)
  for (const [qa, qb] of [
    [1, 11],
    [3, 9],
    [5, 7],
  ] as const) {
    ops.push(...compileCZ3QubitOps(qb0(qa), qb1(qa), qb0(qb), qb1(qb), 2))
  }

  // Helpers for NEG_3 (exact SWAP of (q0, q1)) and copy-to-zero SUM_3 (2 CNOTs when target=|00>)
  const emitNeg3 = (q: number): void => {
    const q0 = qb0(q)
    const q1 = qb1(q)
    ops.push(
      { op: 'cx', ctrl: q0, tgt: q1 },
      { op: 'cx', ctrl: q1, tgt: q0 },
      { op: 'cx', ctrl: q0, tgt: q1 },
    )
  }
  const emitCopyToZero = (src: number, dst: number): void => {
    ops.push(
      { op: 'cx', ctrl: qb0(src), tgt: qb0(dst) },
      { op: 'cx', ctrl: qb1(src), tgt: qb1(dst) },
    )
  }
  const emitSum3 = (ctrl: number, tgt: number, mult: 1 | 2): void => {
    ops.push(...compileSUM3QubitOps(qb0(ctrl), qb1(ctrl), qb0(tgt), qb1(tgt), mult))
  }

  // Stage 3a: Fan out bulk c and stabilizer m_0 onto the 6 even qutrits {0,2,4,6,8,10}
  emitCopyToZero(0, 2)
  emitCopyToZero(2, 8)
  emitNeg3(0)
  emitCopyToZero(0, 10)
  emitNeg3(4)
  emitCopyToZero(4, 6)
  emitSum3(4, 0, 1)
  emitSum3(6, 2, 1)
  emitSum3(4, 8, 1)
  emitSum3(6, 10, 1)

  // Stage 3b: Pair-local (e, m) -> (e + 2m, e + m) on all 6 antipodal pairs
  for (let k = 0; k < 6; k++) {
    const e = 2 * k
    const m = 2 * k + 1
    emitSum3(e, m, 1)
    emitNeg3(e)
    emitSum3(m, e, 2)
  }

  return ops
}

export function buildNativeBa137Schedule(
  kind: HardwareCircuitKind,
  param: number,
  theta: number,
): readonly NativeQutritPulseOp[] {
  const sched: NativeQutritPulseOp[] = []

  if (Math.abs(theta) > 1e-15) {
    sched.push({
      gate: 'Givens01',
      qutrits: [0],
      nativePrimitive: 'Givens_1q',
      param: 2 * theta,
      comment: 'Bulk logical state |psi(theta)> preparation on ion 0',
    })
  }

  for (const q of [4, 1, 3, 5, 7, 9, 11]) {
    sched.push({
      gate: 'PrepPlus3',
      qutrits: [q],
      nativePrimitive: 'Givens_1q',
      param: 2 * Math.acos(INV_SQRT3),
      comment: `Uniform qutrit |+>_3 preparation on ion ${q}`,
    })
  }

  for (const [a, b] of [
    [1, 11],
    [3, 9],
    [5, 7],
  ] as const) {
    sched.push({
      gate: 'CZ3_sq',
      qutrits: [a, b],
      nativePrimitive: 'MS_2q',
      param: (4 * PI) / 3,
      comment: `Stabilizer phase CZ_3^2(${a}, ${b})`,
    })
  }

  const pushSum = (c: number, t: number, mult: 1 | 2): void => {
    sched.push({
      gate: mult === 1 ? 'SUM3' : 'SUM3_sq',
      qutrits: [c, t],
      nativePrimitive: 'MS_2q',
      param: mult,
      comment: `Clifford encoder SUM_3^${mult}(${c} -> ${t})`,
    })
  }
  const pushNeg = (q: number): void => {
    sched.push({
      gate: 'NEG3',
      qutrits: [q],
      nativePrimitive: 'Givens_1q',
      param: PI,
      comment: `Qutrit tone inversion |1><->|2> on ion ${q}`,
    })
  }

  pushSum(0, 2, 1)
  pushSum(2, 8, 1)
  pushNeg(0)
  pushSum(0, 10, 1)
  pushNeg(4)
  pushSum(4, 6, 1)
  pushSum(4, 0, 1)
  pushSum(6, 2, 1)
  pushSum(4, 8, 1)
  pushSum(6, 10, 1)
  for (let k = 0; k < 6; k++) {
    const e = 2 * k
    const m = 2 * k + 1
    pushSum(e, m, 1)
    pushNeg(e)
    pushSum(m, e, 2)
  }

  if (kind === 'bare_u_magic') {
    for (const [a, b] of CROSS_CUT_PAIRS) {
      sched.push({
        gate: 'D_lambda',
        qutrits: [a, b],
        nativePrimitive: 'MS_2q',
        param,
        comment: `Cross-cut bare-U fractional half-coin D^${param.toFixed(2)}(${a}, ${b})`,
      })
    }
  } else if (kind === 'coherent_zz_control') {
    for (const [a, b] of CROSS_CUT_PAIRS) {
      sched.push({
        gate: 'ZZ_qutrit',
        qutrits: [a, b],
        nativePrimitive: 'MS_2q',
        param,
        comment: `Cross-cut diagonal coherent ZZ(${param.toFixed(2)}) control on (${a}, ${b})`,
      })
    }
  } else if (kind === 'coherent_zx_mimicry') {
    for (const [a, b] of ZX_MIMICRY_PAIRS) {
      sched.push({
        gate: 'F3_dag',
        qutrits: [b],
        nativePrimitive: 'Givens_1q',
        param: -PI / 3,
        comment: `Clifford rotation F_3^dag on ion ${b}`,
      })
      sched.push({
        gate: 'ZZ_qutrit',
        qutrits: [a, b],
        nativePrimitive: 'MS_2q',
        param,
        comment: `Coherent crosstalk kernel ZZ(${param.toFixed(2)}) on (${a}, ${b})`,
      })
      sched.push({
        gate: 'F3',
        qutrits: [b],
        nativePrimitive: 'Givens_1q',
        param: PI / 3,
        comment: `Clifford rotation F_3 on ion ${b}`,
      })
    }
  }

  return sched
}

function computeQubitCircuitStats(ops: readonly QubitGateOp[]): {
  readonly oneQubitGates: number
  readonly twoQubitGates: number
  readonly intraQutritTwoQubitGates: number
  readonly interQutritTwoQubitGates: number
  readonly circuitDepth: number
} {
  let oneQubitGates = 0
  let twoQubitGates = 0
  let intraQutritTwoQubitGates = 0
  let interQutritTwoQubitGates = 0
  const layerEnd = new Int32Array(QUBIT_COUNT)

  for (const op of ops) {
    if (op.op === 'gphase') continue
    if (op.op === 'cx' || op.op === 'rzz') {
      const a = op.op === 'cx' ? op.ctrl : op.q0
      const b = op.op === 'cx' ? op.tgt : op.q1
      twoQubitGates++
      if ((a >> 1) === (b >> 1)) intraQutritTwoQubitGates++
      else interQutritTwoQubitGates++
      const d = Math.max(layerEnd[a]!, layerEnd[b]!) + 1
      layerEnd[a] = d
      layerEnd[b] = d
    } else {
      oneQubitGates++
      layerEnd[op.q] = layerEnd[op.q]! + 1
    }
  }

  let circuitDepth = 0
  for (let i = 0; i < QUBIT_COUNT; i++) {
    if (layerEnd[i]! > circuitDepth) circuitDepth = layerEnd[i]!
  }

  return {
    oneQubitGates,
    twoQubitGates,
    intraQutritTwoQubitGates,
    interQutritTwoQubitGates,
    circuitDepth,
  }
}

function computeNativeQutritStats(sched: readonly NativeQutritPulseOp[]): {
  readonly oneGates: number
  readonly twoGates: number
  readonly depth: number
} {
  let oneGates = 0
  let twoGates = 0
  const layerEnd = new Int32Array(QUTRIT_COUNT)
  for (const op of sched) {
    if (op.qutrits.length === 1) {
      const q = op.qutrits[0]!
      oneGates++
      layerEnd[q] = layerEnd[q]! + 1
    } else {
      const a = op.qutrits[0]!
      const b = op.qutrits[1]!
      twoGates++
      const d = Math.max(layerEnd[a]!, layerEnd[b]!) + 1
      layerEnd[a] = d
      layerEnd[b] = d
    }
  }
  let depth = 0
  for (let i = 0; i < QUTRIT_COUNT; i++) {
    if (layerEnd[i]! > depth) depth = layerEnd[i]!
  }
  return { oneGates, twoGates, depth }
}

function fmtAngle(rad: number): string {
  return Number(rad.toFixed(12)).toString()
}

function formatOpenQasm3Program(
  label: string,
  ops: readonly QubitGateOp[],
): string {
  const lines: string[] = [
    'OPENQASM 3.0;',
    'include "stdgates.inc";',
    `// Circuit: ${label}`,
    '// Encoding: 12 qutrits -> 24 qubits (|0>_3=|00>, |1>_3=|01>, |2>_3=|10>, |11>=leakage)',
    'qubit[24] q;',
    'bit[24] c;',
  ]

  for (const op of ops) {
    if (op.op === 'gphase') continue
    if (op.op === 'x') {
      lines.push(`x q[${op.q}];`)
    } else if (op.op === 'h') {
      lines.push(`h q[${op.q}];`)
    } else if (op.op === 'ry') {
      lines.push(`ry(${fmtAngle(op.theta)}) q[${op.q}];`)
    } else if (op.op === 'rz') {
      lines.push(`rz(${fmtAngle(op.phi)}) q[${op.q}];`)
    } else if (op.op === 'u3') {
      lines.push(`u3(${fmtAngle(op.theta)}, ${fmtAngle(op.phi)}, ${fmtAngle(op.lam)}) q[${op.q}];`)
    } else if (op.op === 'cx') {
      lines.push(`cx q[${op.ctrl}], q[${op.tgt}];`)
    } else if (op.op === 'rzz') {
      lines.push(`rzz(${fmtAngle(op.angle)}) q[${op.q0}], q[${op.q1}];`)
    }
  }

  lines.push('c = measure q;')
  return `${lines.join('\n')}\n`
}

export interface ExportOpenQasm3Options {
  readonly theta?: number
  readonly param?: number
}

export function exportOpenQasm3(
  kind: HardwareCircuitKind,
  options: ExportOpenQasm3Options = {},
): HardwareCircuitDescriptor {
  const theta = options.theta ?? PI / 4
  const defaultParam =
    kind === 'stabilizer_baseline'
      ? 0
      : kind === 'bare_u_magic'
        ? 1.0
        : kind === 'coherent_zz_control'
          ? 0.5
          : 0.4
  const param = options.param ?? defaultParam

  const ops = buildEncoderQubitOps(theta)
  const qb0 = (q: number): number => 2 * q
  const qb1 = (q: number): number => 2 * q + 1

  let label = ''
  if (kind === 'stabilizer_baseline') {
    label = `stabilizer_baseline (lam=0, theta=${theta.toFixed(4)})`
  } else if (kind === 'bare_u_magic') {
    label = `bare_u_magic (D^${param.toFixed(2)}, 6 cross-cut gates, theta=${theta.toFixed(4)})`
    for (const [a, b] of CROSS_CUT_PAIRS) {
      ops.push(...compileDLambdaQubitOps(qb0(a), qb1(a), qb0(b), qb1(b), param))
    }
  } else if (kind === 'coherent_zz_control') {
    label = `coherent_zz_control (ZZ eps=${param.toFixed(2)}, 6 cross-cut gates, theta=${theta.toFixed(4)})`
    for (const [a, b] of CROSS_CUT_PAIRS) {
      ops.push(...compileZZQubitOps(qb0(a), qb1(a), qb0(b), qb1(b), param))
    }
  } else {
    label = `coherent_zx_mimicry (Clifford-rotated ZX eps=${param.toFixed(2)}, 6 gates, theta=${theta.toFixed(4)})`
    for (const [a, b] of ZX_MIMICRY_PAIRS) {
      ops.push(...compileZXQubitOps(qb0(a), qb1(a), qb0(b), qb1(b), param))
    }
  }

  const qStats = computeQubitCircuitStats(ops)
  const nativeSchedule = buildNativeBa137Schedule(kind, param, theta)
  const nStats = computeNativeQutritStats(nativeSchedule)
  const qasm3 = formatOpenQasm3Program(label, ops)

  return {
    kind,
    label,
    theta,
    param,
    qubitCount: QUBIT_COUNT,
    qutritCount: QUTRIT_COUNT,
    oneQubitGates: qStats.oneQubitGates,
    twoQubitGates: qStats.twoQubitGates,
    intraQutritTwoQubitGates: qStats.intraQutritTwoQubitGates,
    interQutritTwoQubitGates: qStats.interQutritTwoQubitGates,
    circuitDepth: qStats.circuitDepth,
    nativeQutritOneGates: nStats.oneGates,
    nativeQutritTwoGates: nStats.twoGates,
    nativeQutritDepth: nStats.depth,
    nativeBa137Schedule: nativeSchedule,
    targetBackends: TARGET_BACKENDS,
    qasm3,
  }
}

export interface QasmValidationReport {
  readonly valid: boolean
  readonly lineCount: number
  readonly instructionCount: number
  readonly maxQubitIndex: number
  readonly errors: readonly string[]
}

export function validateOpenQasm3(qasm3: string, expectedQubits = QUBIT_COUNT): QasmValidationReport {
  const rawLines = qasm3.split(/\r?\n/)
  const errors: string[] = []
  let hasHeader = false
  let hasInclude = false
  let hasQubitDecl = false
  let hasBitDecl = false
  let hasMeasure = false
  let instructionCount = 0
  let maxQubitIndex = -1

  const gate1NoParam = /^(x|h)\s+q\[(\d+)\];$/
  const gate1OneParam = /^(ry|rz)\(([-+0-9.eE]+)\)\s+q\[(\d+)\];$/
  const gate1U3 = /^u3\(([-+0-9.eE]+),\s*([-+0-9.eE]+),\s*([-+0-9.eE]+)\)\s+q\[(\d+)\];$/
  const gate2Cx = /^cx\s+q\[(\d+)\],\s*q\[(\d+)\];$/
  const gate2Rzz = /^rzz\(([-+0-9.eE]+)\)\s+q\[(\d+)\],\s*q\[(\d+)\];$/

  const checkIdx = (idx: number, lineNum: number): void => {
    if (!Number.isInteger(idx) || idx < 0 || idx >= expectedQubits) {
      errors.push(`Line ${lineNum}: illegal qubit index ${idx} (must be in 0..${expectedQubits - 1})`)
    } else if (idx > maxQubitIndex) {
      maxQubitIndex = idx
    }
  }
  const checkNum = (raw: string, lineNum: number): void => {
    const v = Number(raw)
    if (!Number.isFinite(v)) errors.push(`Line ${lineNum}: non-finite angle "${raw}"`)
  }

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i]!.trim()
    const lineNum = i + 1
    if (line.length === 0 || line.startsWith('//')) continue
    if (line === 'OPENQASM 3.0;') {
      hasHeader = true
      continue
    }
    if (line === 'include "stdgates.inc";') {
      hasInclude = true
      continue
    }
    if (line === `qubit[${expectedQubits}] q;`) {
      hasQubitDecl = true
      continue
    }
    if (line === `bit[${expectedQubits}] c;`) {
      hasBitDecl = true
      continue
    }
    if (line === 'c = measure q;') {
      hasMeasure = true
      instructionCount++
      continue
    }

    let m = gate1NoParam.exec(line)
    if (m) {
      checkIdx(Number(m[2]!), lineNum)
      instructionCount++
      continue
    }
    m = gate1OneParam.exec(line)
    if (m) {
      checkNum(m[2]!, lineNum)
      checkIdx(Number(m[3]!), lineNum)
      instructionCount++
      continue
    }
    m = gate1U3.exec(line)
    if (m) {
      checkNum(m[1]!, lineNum)
      checkNum(m[2]!, lineNum)
      checkNum(m[3]!, lineNum)
      checkIdx(Number(m[4]!), lineNum)
      instructionCount++
      continue
    }
    m = gate2Cx.exec(line)
    if (m) {
      const a = Number(m[1]!)
      const b = Number(m[2]!)
      checkIdx(a, lineNum)
      checkIdx(b, lineNum)
      if (a === b) errors.push(`Line ${lineNum}: cx control and target identical (${a})`)
      instructionCount++
      continue
    }
    m = gate2Rzz.exec(line)
    if (m) {
      checkNum(m[1]!, lineNum)
      const a = Number(m[2]!)
      const b = Number(m[3]!)
      checkIdx(a, lineNum)
      checkIdx(b, lineNum)
      if (a === b) errors.push(`Line ${lineNum}: rzz qubits identical (${a})`)
      instructionCount++
      continue
    }
    errors.push(`Line ${lineNum}: unrecognized OpenQASM 3.0 statement "${line}"`)
  }

  if (!hasHeader) errors.push('Missing OPENQASM 3.0; header')
  if (!hasInclude) errors.push('Missing include "stdgates.inc"; directive')
  if (!hasQubitDecl) errors.push(`Missing qubit[${expectedQubits}] q; declaration`)
  if (!hasBitDecl) errors.push(`Missing bit[${expectedQubits}] c; declaration`)
  if (!hasMeasure) errors.push('Missing c = measure q; readout')

  return {
    valid: errors.length === 0,
    lineCount: rawLines.filter(l => l.trim().length > 0).length,
    instructionCount,
    maxQubitIndex,
    errors,
  }
}

// ============================================================================
// 4. EXACT 81x81 GRAM-COMPRESSED PETZ & FIXED-CLIFFORD SOLVER
// ============================================================================

export interface DensityMatrix3 {
  readonly re: Float64Array // length 9
  readonly im: Float64Array // length 9
}

export interface ExactChannelResult {
  readonly label: string
  readonly gramRank: number
  readonly gramTrace: number
  readonly petzRho0: DensityMatrix3
  readonly petzRhoPi4: DensityMatrix3
  readonly clifRho0: DensityMatrix3
  readonly clifRhoPi4: DensityMatrix3
  readonly petzS0: number
  readonly petzSPi4: number
  readonly petzDeltaS: number
  readonly clifS0: number
  readonly clifSPi4: number
  readonly clifDeltaS: number
}

// Zero-allocation <bra | op | ket> inner product for a 12-qutrit Weyl-Heisenberg Pauli op
function pauliMatrixElement12(
  braRe: Float64Array,
  braIm: Float64Array,
  ketRe: Float64Array,
  ketIm: Float64Array,
  op: Uint8Array,
): readonly [number, number] {
  let sr = 0
  let si = 0
  for (let idx = 0; idx < HILBERT_DIM_12; idx++) {
    const kr = ketRe[idx]!
    const ki = ketIm[idx]!
    if (kr === 0 && ki === 0) continue
    let rem = idx
    let dst = 0
    let ph = 0
    for (let q = 0; q < 12; q++) {
      const d = rem % 3
      rem = (rem - d) / 3
      ph = (ph + op[12 + q]! * d) % 3
      dst += ((d + op[q]!) % 3) * POW3[q]!
    }
    const br = braRe[dst]!
    const bi = braIm[dst]!
    if (br === 0 && bi === 0) continue
    const wr = OMEGA_RE[ph]!
    const wi = OMEGA_IM[ph]!
    // val = omega^{ph} * ket[idx]
    const vr = kr * wr - ki * wi
    const vi = kr * wi + ki * wr
    // conj(bra[dst]) * val
    sr += br * vr + bi * vi
    si += br * vi - bi * vr
  }
  return [sr, si]
}

// Precompute the 9 kept-region logical Pauli operators and their exact code phases on |0_L>.
export interface KeptLogicalPauliBasis {
  readonly ops: readonly Uint8Array[]
  readonly phaseRe: Float64Array
  readonly phaseIm: Float64Array
}

export function buildKeptLogicalPauliBasis(
  spec: SliceCodeSpec,
  codewords: LogicalCodewords,
): KeptLogicalPauliBasis {
  const ops: Uint8Array[] = []
  const phaseRe = new Float64Array(9)
  const phaseIm = new Float64Array(9)
  const scratch = getChannelScratch()
  for (let c = 0; c < 3; c++) {
    scatterSparseCodeword(codewords.sparse[c]!, scratch.re[c]!, scratch.im[c]!)
  }
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const op = new Uint8Array(24)
      for (let j = 0; j < 24; j++) op[j] = (a * spec.xLA[j]! + b * spec.zLA[j]!) % 3
      const [phR, phI] = pauliMatrixElement12(
        scratch.re[a]!,
        scratch.im[a]!,
        scratch.re[0],
        scratch.im[0],
        op,
      )
      const idx = 3 * a + b
      ops.push(op)
      phaseRe[idx] = phR
      phaseIm[idx] = phI
    }
  }
  return { ops, phaseRe, phaseIm }
}

// Reusable scratch buffers (only 6 Float64Arrays = 25.5 MB total) keep peak RSS < 200 MB
let scratchRe: [Float64Array, Float64Array, Float64Array] | null = null
let scratchIm: [Float64Array, Float64Array, Float64Array] | null = null

export function getChannelScratch(): {
  readonly re: [Float64Array, Float64Array, Float64Array]
  readonly im: [Float64Array, Float64Array, Float64Array]
} {
  if (scratchRe === null || scratchIm === null) {
    scratchRe = [
      new Float64Array(HILBERT_DIM_12),
      new Float64Array(HILBERT_DIM_12),
      new Float64Array(HILBERT_DIM_12),
    ]
    scratchIm = [
      new Float64Array(HILBERT_DIM_12),
      new Float64Array(HILBERT_DIM_12),
      new Float64Array(HILBERT_DIM_12),
    ]
  }
  return { re: scratchRe, im: scratchIm }
}

// Evaluate exact 81x81 Gram-compressed optimal Petz recovery and fixed-Clifford recovery
// for a 12-qutrit unitary perturbation applied to the [[12, 1, 4]]_3 codewords.
export function computeExactChannel(
  label: string,
  codewords: LogicalCodewords,
  logicalBasis: KeptLogicalPauliBasis,
  applyPerturbation: (re: Float64Array, im: Float64Array) => void,
): ExactChannelResult {
  const { re, im } = getChannelScratch()
  for (let c = 0; c < 3; c++) {
    scatterSparseCodeword(codewords.sparse[c]!, re[c]!, im[c]!)
    applyPerturbation(re[c]!, im[c]!)
  }

  // 1. Assemble exact 81x81 Gram matrix G_{(c,e),(c',e')} = <w_{c,e} | w_{c',e'}>_A
  const nA = POW3[9]!
  const gRe = new Float64Array(81 * 81)
  const gIm = new Float64Array(81 * 81)
  const nzIdx = new Int32Array(81)
  const nzR = new Float64Array(81)
  const nzI = new Float64Array(81)

  for (let a = 0; a < nA; a++) {
    const base = a * 27
    let cnt = 0
    for (let c = 0; c < 3; c++) {
      const rc = re[c]!
      const ic = im[c]!
      for (let e = 0; e < 27; e++) {
        const vr = rc[base + e]!
        const vi = ic[base + e]!
        if (vr !== 0 || vi !== 0) {
          nzIdx[cnt] = c * 27 + e
          nzR[cnt] = vr
          nzI[cnt] = vi
          cnt++
        }
      }
    }
    for (let i = 0; i < cnt; i++) {
      const ii = nzIdx[i]!
      const ir = nzR[i]!
      const iim = nzI[i]!
      const rowOff = ii * 81
      for (let j = 0; j < cnt; j++) {
        const jj = nzIdx[j]!
        const jr = nzR[j]!
        const jim = nzI[j]!
        gRe[rowOff + jj] = gRe[rowOff + jj]! + (ir * jr + iim * jim)
        gIm[rowOff + jj] = gIm[rowOff + jj]! + (ir * jim - iim * jr)
      }
    }
  }

  let gramTrace = 0
  for (let i = 0; i < 81; i++) gramTrace += gRe[i * 81 + i]!

  // 2. Compute Q = G^{1/2}: exact Petz recovery map R_{I/3, N}(N(rho)) = sum_{e1,e2} Q_{e1,e2} rho Q_{e1,e2}^dag
  const eigG = hermitianEigen(gRe, gIm, 81)
  const keptIdx: number[] = []
  for (let k = 0; k < 81; k++) {
    if (eigG.values[k]! > 1e-12) keptIdx.push(k)
  }

  const qRe = new Float64Array(81 * 81)
  const qIm = new Float64Array(81 * 81)
  for (let i = 0; i < 81; i++) {
    for (let j = 0; j < 81; j++) {
      let sr = 0
      let si = 0
      for (let r = 0; r < keptIdx.length; r++) {
        const k = keptIdx[r]!
        const sq = Math.sqrt(eigG.values[k]!)
        const air = eigG.vecRe[i * 81 + k]!
        const aii = eigG.vecIm[i * 81 + k]!
        const bjr = eigG.vecRe[j * 81 + k]!
        const bji = eigG.vecIm[j * 81 + k]!
        sr += sq * (air * bjr + aii * bji)
        si += sq * (aii * bjr - air * bji)
      }
      qRe[i * 81 + j] = sr
      qIm[i * 81 + j] = si
    }
  }

  const evalPetzRho = (theta: number): DensityMatrix3 => {
    const a0 = Math.cos(theta)
    const a1 = Math.sin(theta)
    const rr = new Float64Array(9)
    const ri = new Float64Array(9)
    for (let e1 = 0; e1 < 27; e1++) {
      for (let e2 = 0; e2 < 27; e2++) {
        const vr: [number, number, number] = [0, 0, 0]
        const vi: [number, number, number] = [0, 0, 0]
        for (let c = 0; c < 3; c++) {
          const rOff = (c * 27 + e1) * 81
          vr[c] = qRe[rOff + e2]! * a0 + qRe[rOff + 27 + e2]! * a1
          vi[c] = qIm[rOff + e2]! * a0 + qIm[rOff + 27 + e2]! * a1
        }
        for (let c1 = 0; c1 < 3; c1++) {
          for (let c2 = 0; c2 < 3; c2++) {
            rr[c1 * 3 + c2] = rr[c1 * 3 + c2]! + (vr[c1]! * vr[c2]! + vi[c1]! * vi[c2]!)
            ri[c1 * 3 + c2] = ri[c1 * 3 + c2]! + (vi[c1]! * vr[c2]! - vr[c1]! * vi[c2]!)
          }
        }
      }
    }
    return { re: rr, im: ri }
  }

  // 3. Exact fixed-Clifford recovery via zero-allocation kept-region logical Pauli expectations
  // Reuse re[2]/im[2] (no longer needed after Gram assembly) to store |psi(theta)> = cos(th)|0> + sin(th)|1>
  const evalClifRho = (theta: number): DensityMatrix3 => {
    const a0 = Math.cos(theta)
    const a1 = Math.sin(theta)
    const pr = re[2]
    const pi = im[2]
    for (let k = 0; k < HILBERT_DIM_12; k++) {
      pr[k] = a0 * re[0][k]! + a1 * re[1][k]!
      pi[k] = a0 * im[0][k]! + a1 * im[1][k]!
    }
    const rr = new Float64Array(9)
    const ri = new Float64Array(9)
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const idx = 3 * a + b
        const [eR, eI] = pauliMatrixElement12(pr, pi, pr, pi, logicalBasis.ops[idx]!)
        const phR = logicalBasis.phaseRe[idx]!
        const phI = logicalBasis.phaseIm[idx]!
        const exR = phR * eR + phI * eI
        const exI = phR * eI - phI * eR
        const cxR = exR
        const cxI = -exI
        for (let col = 0; col < 3; col++) {
          const row = (col + a) % 3
          const p = (b * col) % 3
          const wr = OMEGA_RE[p]!
          const wi = OMEGA_IM[p]!
          rr[row * 3 + col] = rr[row * 3 + col]! + (cxR * wr - cxI * wi) / 3
          ri[row * 3 + col] = ri[row * 3 + col]! + (cxR * wi + cxI * wr) / 3
        }
      }
    }
    return { re: rr, im: ri }
  }

  const petzRho0 = evalPetzRho(0)
  const petzRhoPi4 = evalPetzRho(PI / 4)
  const clifRho0 = evalClifRho(0)
  const clifRhoPi4 = evalClifRho(PI / 4)

  const petzS0 = vonNeumannEntropy(hermitianEigen(petzRho0.re, petzRho0.im, 3).values)
  const petzSPi4 = vonNeumannEntropy(hermitianEigen(petzRhoPi4.re, petzRhoPi4.im, 3).values)
  const clifS0 = vonNeumannEntropy(hermitianEigen(clifRho0.re, clifRho0.im, 3).values)
  const clifSPi4 = vonNeumannEntropy(hermitianEigen(clifRhoPi4.re, clifRhoPi4.im, 3).values)

  return {
    label,
    gramRank: keptIdx.length,
    gramTrace,
    petzRho0,
    petzRhoPi4,
    clifRho0,
    clifRhoPi4,
    petzS0,
    petzSPi4,
    petzDeltaS: petzSPi4 - petzS0,
    clifS0,
    clifSPi4,
    clifDeltaS: clifSPi4 - clifS0,
  }
}

// ============================================================================
// 5. REALISTIC HARDWARE NOISE CHANNEL & FINITE-SHOT TOMOGRAPHY SIMULATOR
// ============================================================================

export type HardwareArchitecture = 'native_ba137' | 'binary_24q_perturbation' | 'binary_24q_full'

export interface HardwareNoiseConfig {
  readonly p2q: number
  readonly architecture: HardwareArchitecture
  readonly nativeTwoQutritGates: number
  readonly binaryIntraTwoQubitGates: number
  readonly binaryInterTwoQubitGates: number
}

export interface NoisyChannelPoint {
  readonly p2q: number
  readonly architecture: HardwareArchitecture
  readonly channelInfidelityEta: number
  readonly petzEffectiveDepolarizing: number
  readonly leakagePostselectRetention: number
  readonly heraldedLeakageDiscardFraction: number
  readonly petzRho0: DensityMatrix3
  readonly petzRhoPi4: DensityMatrix3
  readonly petzS0: number
  readonly petzSPi4: number
  readonly petzDeltaS: number
  readonly clifS0: number
  readonly clifSPi4: number
  readonly clifDeltaS: number
}

function depolarizeDensity3(rho: DensityMatrix3, dep: number): DensityMatrix3 {
  const keep = 1 - dep
  const re = new Float64Array(9)
  const im = new Float64Array(9)
  for (let i = 0; i < 9; i++) {
    re[i] = keep * rho.re[i]!
    im[i] = keep * rho.im[i]!
  }
  re[0] = re[0]! + dep / 3
  re[4] = re[4]! + dep / 3
  re[8] = re[8]! + dep / 3
  return { re, im }
}

// Compute exact depolarizing attenuation & heralded |11> leakage postselection for a noisy run.
// Under isotropic channel depolarizing rate eta, the exact CPTP Petz recovery theorem yields:
//   R_{I/3, N_eta}(N_eta(rho)) = (1 - eta)^2 R_{ideal}(N_{ideal}(rho)) + (1 - (1 - eta)^2) I_3 / 3.
export function evaluateNoisyChannel(
  channel: ExactChannelResult,
  cfg: HardwareNoiseConfig,
): NoisyChannelPoint {
  const p = cfg.p2q
  let channelInfidelityEta = 0
  let leakagePostselectRetention = 1

  if (cfg.architecture === 'native_ba137') {
    // Native Ba-137 12-ion qutrits: no binary |11> encoding overhead
    channelInfidelityEta = 1 - Math.pow(1 - p, cfg.nativeTwoQutritGates)
    leakagePostselectRetention = 1
  } else {
    // Binary-encoded 24-qubit hardware: ~32.6% inter-qutrit / 26.7% intra-qutrit faults
    // jump into |11> and are heralded + postselected out at measurement, leaving the
    // unheralded in-code fault rate (1 - r_leak) * p per 2-qubit gate.
    const nIntra = cfg.binaryIntraTwoQubitGates
    const nInter = cfg.binaryInterTwoQubitGates
    leakagePostselectRetention =
      Math.pow(1 - LEAKAGE_RATE_INTRA_2Q * p, nIntra) *
      Math.pow(1 - LEAKAGE_RATE_INTER_2Q * p, nInter)
    const pSilentIntra = (1 - LEAKAGE_RATE_INTRA_2Q) * p
    const pSilentInter = (1 - LEAKAGE_RATE_INTER_2Q) * p
    channelInfidelityEta =
      1 - Math.pow(1 - pSilentIntra, nIntra) * Math.pow(1 - pSilentInter, nInter)
  }

  const petzEffectiveDepolarizing = 1 - (1 - channelInfidelityEta) * (1 - channelInfidelityEta)
  const clifEffectiveDepolarizing = channelInfidelityEta

  const petzRho0 = depolarizeDensity3(channel.petzRho0, petzEffectiveDepolarizing)
  const petzRhoPi4 = depolarizeDensity3(channel.petzRhoPi4, petzEffectiveDepolarizing)
  const clifRho0 = depolarizeDensity3(channel.clifRho0, clifEffectiveDepolarizing)
  const clifRhoPi4 = depolarizeDensity3(channel.clifRhoPi4, clifEffectiveDepolarizing)

  const petzS0 = vonNeumannEntropy(hermitianEigen(petzRho0.re, petzRho0.im, 3).values)
  const petzSPi4 = vonNeumannEntropy(hermitianEigen(petzRhoPi4.re, petzRhoPi4.im, 3).values)
  const clifS0 = vonNeumannEntropy(hermitianEigen(clifRho0.re, clifRho0.im, 3).values)
  const clifSPi4 = vonNeumannEntropy(hermitianEigen(clifRhoPi4.re, clifRhoPi4.im, 3).values)

  return {
    p2q: p,
    architecture: cfg.architecture,
    channelInfidelityEta,
    petzEffectiveDepolarizing,
    leakagePostselectRetention,
    heraldedLeakageDiscardFraction: 1 - leakagePostselectRetention,
    petzRho0,
    petzRhoPi4,
    petzS0,
    petzSPi4,
    petzDeltaS: petzSPi4 - petzS0,
    clifS0,
    clifSPi4,
    clifDeltaS: clifSPi4 - clifS0,
  }
}

export interface ShotTrialStats {
  readonly requestedShots: number
  readonly effectivePostselectedShots: number
  readonly leakageRetention: number
  readonly trials: number
  readonly signalMeanDeltaS: number
  readonly signalStdDeltaS: number
  readonly nullMeanDeltaS: number
  readonly nullStdDeltaS: number
  readonly zxMeanDeltaS: number
  readonly zxStdDeltaS: number
  readonly zVsNull: number
  readonly pVsNull: number
  readonly zVsZx: number
  readonly pVsZx: number
  readonly estimatedShotsFor3Sigma: number
}

// Rotate a 3x3 bulk state into the known prepared eigenbasis U_theta^dag rho U_theta
// where U_theta |0> = cos(theta)|0> + sin(theta)|1>, and extract computational-basis
// measurement probabilities (quantum-Fisher-optimal readout near pure states).
function alignedBasisProbs(rho: DensityMatrix3, theta: number): readonly [number, number, number] {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const u: readonly (readonly [number, number, number])[] = [
    [c, s, 0],
    [-s, c, 0],
    [0, 0, 1],
  ]
  const probs: [number, number, number] = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    let p = 0
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        p += u[i]![a]! * rho.re[a * 3 + b]! * u[i]![b]!
      }
    }
    probs[i] = Math.max(0, p)
  }
  const sum = probs[0] + probs[1] + probs[2]
  return [probs[0] / sum, probs[1] / sum, probs[2] / sum]
}

function sampleAlignedEntropy(
  probs: readonly [number, number, number],
  nShots: number,
  prng: DeterministicPrng,
): number {
  const n = Math.max(1, nShots)
  const p0 = probs[0]
  const p01 = p0 + probs[1]
  let c0 = 0
  let c1 = 0
  let c2 = 0
  for (let i = 0; i < n; i++) {
    const u = prng.next()
    if (u < p0) c0++
    else if (u < p01) c1++
    else c2++
  }
  return vonNeumannEntropy([c0 / n, c1 / n, c2 / n])
}

// Deterministic Monte Carlo finite-shot tomographic power analysis.
export function runFiniteShotSweep(
  signalPoint: NoisyChannelPoint,
  nullPoint: NoisyChannelPoint,
  zxPoint: NoisyChannelPoint,
  shotCounts: readonly number[],
  trials = 400,
  seed = 0x51a9c0de,
): readonly ShotTrialStats[] {
  const pSig0 = alignedBasisProbs(signalPoint.petzRho0, 0)
  const pSig4 = alignedBasisProbs(signalPoint.petzRhoPi4, PI / 4)
  const pNull0 = alignedBasisProbs(nullPoint.petzRho0, 0)
  const pNull4 = alignedBasisProbs(nullPoint.petzRhoPi4, PI / 4)
  const pZx0 = alignedBasisProbs(zxPoint.petzRho0, 0)
  const pZx4 = alignedBasisProbs(zxPoint.petzRhoPi4, PI / 4)

  const retention = signalPoint.leakagePostselectRetention
  const results: ShotTrialStats[] = []

  for (const requestedShots of shotCounts) {
    const effShots = Math.max(10, Math.floor(requestedShots * retention))
    const prng = makeMulberry32((seed ^ (requestedShots * 2654435761)) >>> 0)

    let sumSig = 0
    let sumSig2 = 0
    let sumNull = 0
    let sumNull2 = 0
    let sumZx = 0
    let sumZx2 = 0

    for (let t = 0; t < trials; t++) {
      const dSig =
        sampleAlignedEntropy(pSig4, effShots, prng) - sampleAlignedEntropy(pSig0, effShots, prng)
      const dNull =
        sampleAlignedEntropy(pNull4, effShots, prng) - sampleAlignedEntropy(pNull0, effShots, prng)
      const dZx =
        sampleAlignedEntropy(pZx4, effShots, prng) - sampleAlignedEntropy(pZx0, effShots, prng)

      sumSig += dSig
      sumSig2 += dSig * dSig
      sumNull += dNull
      sumNull2 += dNull * dNull
      sumZx += dZx
      sumZx2 += dZx * dZx
    }

    const mSig = sumSig / trials
    const vSig = Math.max(0, (sumSig2 - trials * mSig * mSig) / (trials - 1))
    const sSig = Math.sqrt(vSig)

    const mNull = sumNull / trials
    const vNull = Math.max(0, (sumNull2 - trials * mNull * mNull) / (trials - 1))
    const sNull = Math.sqrt(vNull)

    const mZx = sumZx / trials
    const vZx = Math.max(0, (sumZx2 - trials * mZx * mZx) / (trials - 1))
    const sZx = Math.sqrt(vZx)

    const denomNull = Math.hypot(sSig, sNull)
    const denomZx = Math.hypot(sSig, sZx)
    const zVsNull = denomNull > 1e-15 ? (mSig - mNull) / denomNull : 0
    const zVsZx = denomZx > 1e-15 ? (mSig - mZx) / denomZx : 0

    // Scale N_3sigma from exact 1/sqrt(N) shot-noise law relative to true separation Delta S
    const trueGap = Math.max(1e-12, signalPoint.petzDeltaS - zxPoint.petzDeltaS)
    const empiricalZ = Math.max(1e-6, (trueGap / Math.max(1e-12, denomZx)))
    const estimatedShotsFor3Sigma = Math.ceil(requestedShots * Math.pow(3 / empiricalZ, 2))

    results.push({
      requestedShots,
      effectivePostselectedShots: effShots,
      leakageRetention: retention,
      trials,
      signalMeanDeltaS: mSig,
      signalStdDeltaS: sSig,
      nullMeanDeltaS: mNull,
      nullStdDeltaS: sNull,
      zxMeanDeltaS: mZx,
      zxStdDeltaS: sZx,
      zVsNull,
      pVsNull: twoSidedNormalPValue(zVsNull),
      zVsZx,
      pVsZx: twoSidedNormalPValue(zVsZx),
      estimatedShotsFor3Sigma,
    })
  }

  return results
}

// Optional helper to export all 4 OpenQASM 3.0 circuits + manifest to a directory.
// Never called automatically during verification tests unless --emit-qasm is explicitly passed.
export function writeHardwareBundle(outDir: string, theta = PI / 4): readonly string[] {
  mkdirSync(outDir, { recursive: true })
  const specs: readonly { readonly file: string; readonly desc: HardwareCircuitDescriptor }[] = [
    {
      file: 'stabilizer-baseline.qasm',
      desc: exportOpenQasm3('stabilizer_baseline', { theta, param: 0 }),
    },
    {
      file: 'bare-u-magic-lam-0.5.qasm',
      desc: exportOpenQasm3('bare_u_magic', { theta, param: 0.5 }),
    },
    {
      file: 'bare-u-magic-lam-0.8.qasm',
      desc: exportOpenQasm3('bare_u_magic', { theta, param: 0.8 }),
    },
    {
      file: 'bare-u-magic-lam-1.0.qasm',
      desc: exportOpenQasm3('bare_u_magic', { theta, param: 1.0 }),
    },
    {
      file: 'coherent-zz-control.qasm',
      desc: exportOpenQasm3('coherent_zz_control', { theta, param: 0.5 }),
    },
    {
      file: 'coherent-zx-mimicry.qasm',
      desc: exportOpenQasm3('coherent_zx_mimicry', { theta, param: 0.4 }),
    },
  ]

  const written: string[] = []
  for (const item of specs) {
    const absPath = join(outDir, item.file)
    writeFileSync(absPath, item.desc.qasm3, 'utf8')
    written.push(absPath)
  }

  const manifestPath = join(outDir, 'hardware-manifest.json')
  const manifest = specs.map(({ file, desc }) => ({
    file,
    kind: desc.kind,
    label: desc.label,
    qubitCount: desc.qubitCount,
    qutritCount: desc.qutritCount,
    oneQubitGates: desc.oneQubitGates,
    twoQubitGates: desc.twoQubitGates,
    circuitDepth: desc.circuitDepth,
    nativeQutritOneGates: desc.nativeQutritOneGates,
    nativeQutritTwoGates: desc.nativeQutritTwoGates,
    nativeQutritDepth: desc.nativeQutritDepth,
    targetBackends: desc.targetBackends,
  }))
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  written.push(manifestPath)
  return written
}
