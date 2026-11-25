// L1 10-QUBIT BRICKWORK SCRAMBLER PAGE-CURVE BENCHMARK, BOSONIC BOGOLIUBOV TWO-MODE-SQUEEZER
// THERMAL-CONSISTENCY CHECK, AND L1 Z[w][1/2] SU(2) MITM GATE-SYNTHESIS BENCHMARK ON A PREPARED BELL SINGLET
// (E-QTM-0207).
//
// Scope and honest boundaries:
//   - Part A.1 is an L1 10-qubit unitary brickwork scrambler Page-curve benchmark using Z[zeta_9][1/6] gates
//     and M_pair(zeta_18) entanglers (deterministic schedule from [1, 18, 330, 6034]). It is a generic 10-qubit
//     scrambler, NOT a {3,4,3,4} honeycomb black hole, and does NOT resolve E-GRV-0134.
//   - Part A.2 is a bosonic Bogoliubov two-mode-squeezer thermal-consistency check verifying that Fock-space
//     unitary squeezing U_sq(r) = exp(r (a^dag b^dag - a b)) satisfies sinh^2(r) = 1 / (exp(omega / T_H) - 1)
//     when r = atanh(exp(-omega / (2 T_H))), evaluated at the benchmark input parameter kappa = ln(6034 / 330).
//     It does NOT derive Hawking temperature from {3,4,3,4} dynamics.
//   - Part B is an L1 Z[w][1/2] SU(2) Meet-in-the-Middle gate-synthesis convergence benchmark on a prepared Bell
//     singlet transported along an open 128-dock line. Because the spatial line walk commutes with uniform spin
//     analyzers uA (x) uB, this tests SU(2) gate approximation accuracy over L_word in {6, 10, 14, 18, 22}, while
//     dynamical open-line entanglement saturation (E-QTM-0202 / B-08) remains open.
//
// Zero Math.random, zero PRNGs, pure deterministic unitary state evolution and exact BigInt Z[w][1/2] arithmetic.

import { EXACT_COLUMN_SHELL_COUNTS } from '@/code/measure/pair-density-gravity-slope'

const SQ3 = Math.sqrt(3)
const SQ2 = Math.SQRT2
const TSIRELSON = 2 * SQ2

// ---- Exact Eisenstein integer Z[w][1/2] 2x2 matrix algebra (from E-QTM-0204) ----

type Eis = readonly [bigint, bigint] // a + b * w, w = e^(i 2 pi / 3)

const eAdd = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
const eSub = (x: Eis, y: Eis): Eis => [x[0] - y[0], x[1] - y[1]]
const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
const eConj = (x: Eis): Eis => [x[0] - x[1], -x[1]]
const eEq = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]

type EisMat2 = {
  readonly m00: Eis
  readonly m01: Eis
  readonly m10: Eis
  readonly m11: Eis
  readonly denPow2: number
}

const EIS_I2: EisMat2 = {
  m00: [1n, 0n],
  m01: [0n, 0n],
  m10: [0n, 0n],
  m11: [1n, 0n],
  denPow2: 0,
}

function reduceEisMat2(A: EisMat2): EisMat2 {
  let { m00, m01, m10, m11, denPow2 } = A
  while (
    denPow2 > 0 &&
    (m00[0] & 1n) === 0n &&
    (m00[1] & 1n) === 0n &&
    (m01[0] & 1n) === 0n &&
    (m01[1] & 1n) === 0n &&
    (m10[0] & 1n) === 0n &&
    (m10[1] & 1n) === 0n &&
    (m11[0] & 1n) === 0n &&
    (m11[1] & 1n) === 0n
  ) {
    m00 = [m00[0] >> 1n, m00[1] >> 1n]
    m01 = [m01[0] >> 1n, m01[1] >> 1n]
    m10 = [m10[0] >> 1n, m10[1] >> 1n]
    m11 = [m11[0] >> 1n, m11[1] >> 1n]
    denPow2--
  }
  return { m00, m01, m10, m11, denPow2 }
}

function mulEisMat2(A: EisMat2, B: EisMat2): EisMat2 {
  return reduceEisMat2({
    m00: eAdd(eMul(A.m00, B.m00), eMul(A.m01, B.m10)),
    m01: eAdd(eMul(A.m00, B.m01), eMul(A.m01, B.m11)),
    m10: eAdd(eMul(A.m10, B.m00), eMul(A.m11, B.m10)),
    m11: eAdd(eMul(A.m10, B.m01), eMul(A.m11, B.m11)),
    denPow2: A.denPow2 + B.denPow2,
  })
}

function dagEisMat2(A: EisMat2): EisMat2 {
  return {
    m00: eConj(A.m00),
    m01: eConj(A.m10),
    m10: eConj(A.m01),
    m11: eConj(A.m11),
    denPow2: A.denPow2,
  }
}

function scaleEisMat2(s: Eis, A: EisMat2): EisMat2 {
  return reduceEisMat2({
    m00: eMul(s, A.m00),
    m01: eMul(s, A.m01),
    m10: eMul(s, A.m10),
    m11: eMul(s, A.m11),
    denPow2: A.denPow2,
  })
}

function isExactSU2Eis(A: EisMat2): boolean {
  const detNum = eSub(eMul(A.m00, A.m11), eMul(A.m01, A.m10))
  const detScale = 1n << BigInt(2 * A.denPow2)
  if (!eEq(detNum, [detScale, 0n])) return false
  const prod = mulEisMat2(dagEisMat2(A), A)
  return (
    prod.denPow2 === 0 &&
    eEq(prod.m00, [1n, 0n]) &&
    eEq(prod.m01, [0n, 0n]) &&
    eEq(prod.m10, [0n, 0n]) &&
    eEq(prod.m11, [1n, 0n])
  )
}

// Float64 2x2 unitary [r00, i00, r01, i01, r10, i10, r11, i11]
type U2 = readonly [number, number, number, number, number, number, number, number]

function eisToU2(A: EisMat2): U2 {
  const s = 1 / 2 ** A.denPow2
  const toCx = (e: Eis): [number, number] => [
    (Number(e[0]) - 0.5 * Number(e[1])) * s,
    Number(e[1]) * (SQ3 / 2) * s,
  ]
  const [r00, i00] = toCx(A.m00)
  const [r01, i01] = toCx(A.m01)
  const [r10, i10] = toCx(A.m10)
  const [r11, i11] = toCx(A.m11)
  return [r00, i00, r01, i01, r10, i10, r11, i11]
}

function dagU2(u: U2): U2 {
  return [u[0], -u[1], u[4], -u[5], u[2], -u[3], u[6], -u[7]]
}

function unitarityErrU2(u: U2): number {
  const d00r = u[0] * u[0] + u[1] * u[1] + u[4] * u[4] + u[5] * u[5] - 1
  const d11r = u[2] * u[2] + u[3] * u[3] + u[6] * u[6] + u[7] * u[7] - 1
  const d01r = u[0] * u[2] + u[1] * u[3] + u[4] * u[6] + u[5] * u[7]
  const d01i = u[0] * u[3] - u[1] * u[2] + u[4] * u[7] - u[5] * u[6]
  return Math.max(Math.abs(d00r), Math.abs(d11r), Math.abs(d01r), Math.abs(d01i))
}

function blochZ(u: U2): readonly [number, number, number] {
  const nz = u[0] * u[0] + u[1] * u[1] - (u[4] * u[4] + u[5] * u[5])
  const z01r = u[0] * u[2] + u[1] * u[3] - (u[4] * u[6] + u[5] * u[7])
  const z01i = u[0] * u[3] - u[1] * u[2] - (u[4] * u[7] - u[5] * u[6])
  return [z01r, -z01i, nz]
}

function buildRuleSU2Generators(): {
  readonly C: EisMat2
  readonly D: EisMat2
  readonly Pw: EisMat2
  readonly Pw2: EisMat2
  readonly W1: EisMat2
  readonly W1Dag: EisMat2
  readonly W2: EisMat2
  readonly W2Dag: EisMat2
  readonly gensEis: readonly [EisMat2, EisMat2, EisMat2, EisMat2]
  readonly gensU2: readonly [U2, U2, U2, U2]
} {
  const C: EisMat2 = { m00: [1n, 1n], m01: [1n, -1n], m10: [1n, -1n], m11: [1n, 1n], denPow2: 1 }
  const D: EisMat2 = { m00: [2n, 1n], m01: [0n, -1n], m10: [0n, -1n], m11: [2n, 1n], denPow2: 1 }
  const Pw: EisMat2 = { m00: [1n, 0n], m01: [0n, 0n], m10: [0n, 0n], m11: [0n, 1n], denPow2: 0 }
  const Pw2: EisMat2 = { m00: [1n, 0n], m01: [0n, 0n], m10: [0n, 0n], m11: [-1n, -1n], denPow2: 0 }
  const w2: Eis = [-1n, -1n]
  const W1 = scaleEisMat2(w2, mulEisMat2(C, Pw))
  const W2 = mulEisMat2(mulEisMat2(Pw, W1), Pw2)
  const W1Dag = dagEisMat2(W1)
  const W2Dag = dagEisMat2(W2)
  const gensEis: readonly [EisMat2, EisMat2, EisMat2, EisMat2] = [W1, W1Dag, W2, W2Dag]
  const gensU2: readonly [U2, U2, U2, U2] = [
    eisToU2(W1),
    eisToU2(W1Dag),
    eisToU2(W2),
    eisToU2(W2Dag),
  ]
  return { C, D, Pw, Pw2, W1, W1Dag, W2, W2Dag, gensEis, gensU2 }
}

// ---- Exact Hermitian Jacobi Eigensolver (for reduced density matrices up to 32x32) ----

function hermitianEigenvalues(hr: Float64Array, hi: Float64Array, n: number): number[] {
  if (n === 1) return [hr[0]!]
  const m = 2 * n
  const z = new Float64Array(m * m)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const re = hr[i * n + j]!
      const im = hi[i * n + j]!
      z[i * m + j] = re
      z[(i + n) * m + (j + n)] = re
      z[i * m + (j + n)] = -im
      z[(i + n) * m + j] = im
    }
  }

  for (let sweep = 0; sweep < 80; sweep++) {
    let off = 0
    for (let p = 0; p < m; p++) {
      const pm = p * m
      for (let q = p + 1; q < m; q++) {
        const v = z[pm + q]!
        off += v * v
      }
    }
    if (off < 1e-30) break

    for (let p = 0; p < m; p++) {
      for (let q = p + 1; q < m; q++) {
        const apq = z[p * m + q]!
        if (Math.abs(apq) < 1e-18) continue
        const app = z[p * m + p]!
        const aqq = z[q * m + q]!
        const theta = (aqq - app) / (2 * apq)
        const t =
          (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < m; k++) {
          if (k === p || k === q) continue
          const zkp = z[k * m + p]!
          const zkq = z[k * m + q]!
          const np = c * zkp - s * zkq
          const nq = s * zkp + c * zkq
          z[k * m + p] = np
          z[p * m + k] = np
          z[k * m + q] = nq
          z[q * m + k] = nq
        }
        z[p * m + p] = c * c * app - 2 * s * c * apq + s * s * aqq
        z[q * m + q] = s * s * app + 2 * s * c * apq + c * c * aqq
        z[p * m + q] = 0
        z[q * m + p] = 0
      }
    }
  }

  const all = new Array<number>(m)
  for (let i = 0; i < m; i++) all[i] = z[i * m + i]!
  all.sort((a, b) => b - a)
  const out = new Array<number>(n)
  for (let i = 0; i < n; i++) out[i] = all[2 * i]!
  return out
}

function vonNeumannBits(evals: readonly number[]): number {
  let s = 0
  for (let i = 0; i < evals.length; i++) {
    const p = evals[i]!
    if (p > 1e-15) {
      s -= p * Math.log2(p)
    }
  }
  return s
}

// ============================================================================================================
// PART A: L1 10-QUBIT BRICKWORK SCRAMBLER PAGE-CURVE BENCHMARK & BOGOLIUBOV TWO-MODE-SQUEEZER CHECK
// ============================================================================================================

type GateOp =
  | { readonly kind: '1q'; readonly q: number; readonly gateIdx: number }
  | { readonly kind: '2q'; readonly q0: number; readonly q1: number; readonly power: number }

function apply1Q(re: Float64Array, im: Float64Array, nQubits: number, q: number, u: U2): void {
  const dim = 1 << nQubits
  const bit = 1 << q
  const step = bit << 1
  const r00 = u[0]
  const i00 = u[1]
  const r01 = u[2]
  const i01 = u[3]
  const r10 = u[4]
  const i10 = u[5]
  const r11 = u[6]
  const i11 = u[7]

  for (let base = 0; base < dim; base += step) {
    for (let off = 0; off < bit; off++) {
      const idx0 = base + off
      const idx1 = idx0 + bit
      const a0r = re[idx0]!
      const a0i = im[idx0]!
      const a1r = re[idx1]!
      const a1i = im[idx1]!

      re[idx0] = r00 * a0r - i00 * a0i + r01 * a1r - i01 * a1i
      im[idx0] = r00 * a0i + i00 * a0r + r01 * a1i + i01 * a1r
      re[idx1] = r10 * a0r - i10 * a0i + r11 * a1r - i11 * a1i
      im[idx1] = r10 * a0i + i10 * a0r + r11 * a1i + i11 * a1r
    }
  }
}

// Two-body M_pair(zeta_18^power) entangler on 2 qubits:
//   M_pair_4(u) = I_4 + ((u - 1) / 4) J_4, where u = zeta_18^power = e^(i power * pi / 9) in Z[zeta_9].
// Exact unitary in Z[zeta_9][1/4] subset Z[zeta_9][1/6]; adjoint is M_pair_4(zeta_18^(-power)).
function applyMPair2Q(
  re: Float64Array,
  im: Float64Array,
  nQubits: number,
  q0: number,
  q1: number,
  power: number,
): void {
  const dim = 1 << nQubits
  const b0 = 1 << q0
  const b1 = 1 << q1
  const theta = (power * Math.PI) / 9
  const hopR = (Math.cos(theta) - 1) * 0.25
  const hopI = Math.sin(theta) * 0.25

  for (let idx = 0; idx < dim; idx++) {
    if ((idx & b0) !== 0 || (idx & b1) !== 0) continue
    const i00 = idx
    const i01 = idx | b0
    const i10 = idx | b1
    const i11 = idx | b0 | b1

    const r00 = re[i00]!
    const im00 = im[i00]!
    const r01 = re[i01]!
    const im01 = im[i01]!
    const r10 = re[i10]!
    const im10 = im[i10]!
    const r11 = re[i11]!
    const im11 = im[i11]!

    const sr = r00 + r01 + r10 + r11
    const si = im00 + im01 + im10 + im11
    const dr = hopR * sr - hopI * si
    const di = hopR * si + hopI * sr

    re[i00] = r00 + dr
    im[i00] = im00 + di
    re[i01] = r01 + dr
    im[i01] = im01 + di
    re[i10] = r10 + dr
    im[i10] = im10 + di
    re[i11] = r11 + dr
    im[i11] = im11 + di
  }
}

function stateNormSq(re: Float64Array, im: Float64Array): number {
  let s = 0
  for (let i = 0; i < re.length; i++) {
    s += re[i]! * re[i]! + im[i]! * im[i]!
  }
  return s
}

function radiationEntropyBits(
  re: Float64Array,
  im: Float64Array,
  nQubits: number,
  kRad: number,
): { readonly entropyBits: number; readonly traceErr: number } {
  const norm = stateNormSq(re, im)
  if (kRad === 0 || kRad === nQubits) {
    // Pure global state on one side: sole nonzero eigenvalue is norm (= 1)
    const s = norm > 1e-15 ? -norm * Math.log2(norm) : 0
    return { entropyBits: Math.abs(s), traceErr: Math.abs(norm - 1) }
  }

  const dR = 1 << kRad
  const dB = 1 << (nQubits - kRad)

  if (dR <= dB) {
    // Direct rho_R = Tr_B(|psi><psi|) of size dR x dR (at most 32x32)
    const hr = new Float64Array(dR * dR)
    const hi = new Float64Array(dR * dR)
    for (let r1 = 0; r1 < dR; r1++) {
      for (let r2 = r1; r2 < dR; r2++) {
        let sr = 0
        let si = 0
        for (let b = 0; b < dB; b++) {
          const i1 = r1 + (b << kRad)
          const i2 = r2 + (b << kRad)
          const a1r = re[i1]!
          const a1i = im[i1]!
          const a2r = re[i2]!
          const a2i = im[i2]!
          sr += a1r * a2r + a1i * a2i
          si += a1i * a2r - a1r * a2i
        }
        hr[r1 * dR + r2] = sr
        hi[r1 * dR + r2] = si
        hr[r2 * dR + r1] = sr
        hi[r2 * dR + r1] = -si
      }
    }
    const evals = hermitianEigenvalues(hr, hi, dR)
    const tr = evals.reduce((acc, v) => acc + v, 0)
    return { entropyBits: vonNeumannBits(evals), traceErr: Math.abs(tr - 1) }
  } else {
    // Equivalent Schmidt spectrum via rho_B = Tr_R(|psi><psi|) of size dB x dB (at most 16x16)
    const hr = new Float64Array(dB * dB)
    const hi = new Float64Array(dB * dB)
    for (let b1 = 0; b1 < dB; b1++) {
      for (let b2 = b1; b2 < dB; b2++) {
        let sr = 0
        let si = 0
        const off1 = b1 << kRad
        const off2 = b2 << kRad
        for (let r = 0; r < dR; r++) {
          const a1r = re[off1 + r]!
          const a1i = im[off1 + r]!
          const a2r = re[off2 + r]!
          const a2i = im[off2 + r]!
          sr += a1r * a2r + a1i * a2i
          si += a1i * a2r - a1r * a2i
        }
        hr[b1 * dB + b2] = sr
        hi[b1 * dB + b2] = si
        hr[b2 * dB + b1] = sr
        hi[b2 * dB + b1] = -si
      }
    }
    const evals = hermitianEigenvalues(hr, hi, dB)
    const tr = evals.reduce((acc, v) => acc + v, 0)
    return { entropyBits: vonNeumannBits(evals), traceErr: Math.abs(tr - 1) }
  }
}

// Exact finite-dimensional Page formula for subsystem dimensions (dA, dB), in bits:
//   S_Page(m, n) = (sum_{j=n+1}^{m*n} 1/j - (m - 1) / (2 n)) / ln 2,  m = min(dA, dB), n = max(dA, dB)
function exactPageBits(nQubits: number, kRad: number): number {
  const m = 1 << Math.min(kRad, nQubits - kRad)
  const n = 1 << Math.max(kRad, nQubits - kRad)
  if (m <= 1) return 0
  let harm = 0
  for (let j = n + 1; j <= m * n; j++) {
    harm += 1 / j
  }
  return (harm - (m - 1) / (2 * n)) / Math.LN2
}

// Matrix-free unitary Fock-space two-mode squeezing evolution:
//   |Psi(r)> = exp(r (a^dag b^dag - a b)) |0_R, 0_B> on pair Fock basis {|m, m>, m = 0..mMax}.
// Skew-symmetric generator G: (G v)_m = m v_{m-1} - (m + 1) v_{m+1}.
function applyFockSqueeze(vIn: Float64Array, r: number): Float64Array {
  const n = vIn.length
  const v = Float64Array.from(vIn)
  if (r === 0) return v

  // Choose substeps so ||dt * G||_inf <= 0.25 -> 16th-order Taylor is machine-exact (< 1e-16)
  const normEst = Math.abs(r) * (2 * n)
  const subSteps = Math.max(1, Math.ceil(normEst * 4))
  const dt = r / subSteps
  const term = new Float64Array(n)
  const next = new Float64Array(n)

  for (let s = 0; s < subSteps; s++) {
    term.set(v)
    for (let k = 1; k <= 16; k++) {
      const fac = dt / k
      for (let m = 0; m < n; m++) {
        const up = m > 0 ? m * term[m - 1]! : 0
        const dn = m + 1 < n ? (m + 1) * term[m + 1]! : 0
        next[m] = fac * (up - dn)
      }
      let maxAbs = 0
      for (let m = 0; m < n; m++) {
        const val = next[m]!
        v[m] = v[m]! + val
        term[m] = val
        const a = Math.abs(val)
        if (a > maxAbs) maxAbs = a
      }
      if (maxAbs < 1e-18) break
    }
  }
  return v
}

export type PageStepRow = {
  readonly k: number
  readonly entropyBits: number
  readonly exactPageBits: number
  readonly controlEntropyBits: number
  readonly globalNormErr: number
  readonly globalEntropyBits: number
}

export type HawkingModeRow = {
  readonly omegaOverTH: number
  readonly omega: number
  readonly occupationFock: number
  readonly occupationPlanck: number
  readonly absErr: number
  readonly flatControlOccupation: number
  readonly bogoliubovUnitErr: number
  readonly fockReversalErr: number
  readonly modeEntropyBits: number
}

export type HorizonPageResult = {
  readonly nQubits: number
  readonly kPage: number
  readonly asymptoticPagePeakBits: number
  readonly exactPagePeakBits: number
  readonly pageCurve: readonly PageStepRow[]
  readonly sRadAt0: number
  readonly sRadAtPage: number
  readonly sRadAtEnd: number
  readonly peakDiffFromAsymptoticPage: number
  readonly peakDiffFromExactPage: number
  readonly earlyMonotoneRise: boolean
  readonly lateMonotoneFall: boolean
  readonly maxGlobalNormErr: number
  readonly maxGlobalEntropyBits: number
  readonly maxReducedTraceErr: number
  readonly backwardReversalErr: number
  readonly maxGateUnitarityErr: number
  readonly maxControlEntropyBits: number
  readonly cuspVolumeRatio: number
  readonly surfaceGravityKappa: number
  readonly hawkingTempTH: number
  readonly hawkingModes: readonly HawkingModeRow[]
  readonly maxPlanckAbsErr: number
  readonly planckFitTempTH: number
  readonly planckTempRelErr: number
  readonly planckFitR2: number
  readonly maxBogoliubovUnitErr: number
  readonly maxFockNormErr: number
  readonly maxFockReversalErr: number
  readonly maxFlatControlOccupation: number
}

function runHorizonPageAndHawking(ruleGens: ReturnType<typeof buildRuleSU2Generators>): HorizonPageResult {
  const nQubits = 10
  const dim = 1 << nQubits
  const kPage = nQubits >> 1

  // Exact Z[zeta_9][1/6] single-qubit gate bank from E-QTM-0204
  const z9r = Math.cos((2 * Math.PI) / 9)
  const z9i = Math.sin((2 * Math.PI) / 9)
  const Pz9: U2 = [1, 0, 0, 0, 0, 0, z9r, z9i]
  const Pz9Inv: U2 = [1, 0, 0, 0, 0, 0, z9r, -z9i]
  const gateBank: readonly U2[] = [
    ruleGens.gensU2[0], // W1
    ruleGens.gensU2[2], // W2
    eisToU2(ruleGens.C),
    eisToU2(ruleGens.D),
    Pz9,
    Pz9Inv,
    ruleGens.gensU2[1], // W1^dag
    ruleGens.gensU2[3], // W2^dag
  ]
  const gateBankDag: readonly U2[] = gateBank.map(dagU2)

  let maxGateUnitarityErr = 0
  for (const g of gateBank) {
    maxGateUnitarityErr = Math.max(maxGateUnitarityErr, unitarityErrU2(g))
  }

  // Verify M_pair_4(zeta_18^p) exact unitarity on 4x4 two-qubit basis
  const mPairPowers = [1, 5, 9, 7, 3] as const // powers of zeta_18 in Z[zeta_9], all exact
  for (const p of mPairPowers) {
    const theta = (p * Math.PI) / 9
    const hopR = (Math.cos(theta) - 1) * 0.25
    const hopI = Math.sin(theta) * 0.25
    // M^dag M = I check on diagonal and off-diagonal of 4x4 matrix I + hop * J_4
    const diagR = 1 + hopR
    const d00 = diagR * diagR + hopI * hopI + 3 * (hopR * hopR + hopI * hopI)
    const d01r = 2 * (diagR * hopR + hopI * hopI) + 2 * (hopR * hopR + hopI * hopI)
    maxGateUnitarityErr = Math.max(maxGateUnitarityErr, Math.abs(d00 - 1), Math.abs(d01r))
  }

  // Deterministic initial pure matter-shell basis state |0101010101> (index 0b0101010101 = 341)
  const initIdx = 0b0101010101
  const re = new Float64Array(dim)
  const im = new Float64Array(dim)
  re[initIdx] = 1

  // Non-scrambling (identity interior) control state
  const ctrlRe = new Float64Array(dim)
  const ctrlIm = new Float64Array(dim)
  ctrlRe[initIdx] = 1

  const ops: GateOp[] = []
  const run1Q = (q: number, gateIdx: number): void => {
    apply1Q(re, im, nQubits, q, gateBank[gateIdx]!)
    ops.push({ kind: '1q', q, gateIdx })
  }
  const run2Q = (q0: number, q1: number, power: number): void => {
    applyMPair2Q(re, im, nQubits, q0, q1, power)
    ops.push({ kind: '2q', q0, q1, power })
  }

  // Deterministic brickwork scrambler on active interior qubits [startQ .. nQubits - 1]
  // Uses EXACT_COLUMN_SHELL_COUNTS = [1, 18, 330, 6034] for deterministic non-degenerate layer scheduling
  const shellSeed = (layer: number, pos: number): number => {
    const s = EXACT_COLUMN_SHELL_COUNTS[(layer + pos) & 3]!
    return (s + layer * 17 + pos * 31) >>> 0
  }

  const scrambleInterior = (startQ: number, rounds: number, stepTag: number): void => {
    const activeCount = nQubits - startQ
    for (let r = 0; r < rounds; r++) {
      const layer = stepTag * 13 + r
      // Single-qubit Z[zeta_9][1/6] rotations on every active interior mode
      for (let j = 0; j < activeCount; j++) {
        const q = startQ + j
        const h = shellSeed(layer, j)
        run1Q(q, h % gateBank.length)
        run1Q(q, (h + 3 + (j & 1)) % gateBank.length)
      }
      if (activeCount < 2) continue
      // Even and odd brickwork bonds using M_pair_4(zeta_18^p) entanglers
      for (let parity = 0; parity < 2; parity++) {
        for (let j = parity; j + 1 < activeCount; j += 2) {
          const q0 = startQ + j
          const q1 = startQ + j + 1
          const p = mPairPowers[shellSeed(layer + parity, j) % mPairPowers.length]!
          run2Q(q0, q1, p)
        }
      }
      // Ring wrap bond across the interior horizon shell for fast all-to-all scrambling
      if (activeCount >= 3) {
        const p = mPairPowers[shellSeed(layer + 5, activeCount) % mPairPowers.length]!
        run2Q(startQ, nQubits - 1, p)
      }
    }
  }

  // Initial black-hole collapse scrambling on all N_tot interior modes (before any mode crosses horizon)
  scrambleInterior(0, 8, 0)

  const pageCurve: PageStepRow[] = []
  let maxGlobalNormErr = 0
  let maxGlobalEntropyBits = 0
  let maxReducedTraceErr = 0
  let maxControlEntropyBits = 0

  const recordStep = (k: number): void => {
    const norm = stateNormSq(re, im)
    const normErr = Math.abs(norm - 1)
    const globalS = Math.abs(norm > 1e-15 ? -norm * Math.log2(norm) : 0)
    const rad = radiationEntropyBits(re, im, nQubits, k)
    const ctrl = radiationEntropyBits(ctrlRe, ctrlIm, nQubits, k)

    maxGlobalNormErr = Math.max(maxGlobalNormErr, normErr)
    maxGlobalEntropyBits = Math.max(maxGlobalEntropyBits, globalS)
    maxReducedTraceErr = Math.max(maxReducedTraceErr, rad.traceErr)
    maxControlEntropyBits = Math.max(maxControlEntropyBits, ctrl.entropyBits)

    pageCurve.push({
      k,
      entropyBits: rad.entropyBits,
      exactPageBits: exactPageBits(nQubits, k),
      controlEntropyBits: ctrl.entropyBits,
      globalNormErr: normErr,
      globalEntropyBits: globalS,
    })
  }

  // k = 0: empty exterior radiation, pure interior
  recordStep(0)

  // Evaporation steps k = 1..N_tot: scramble remaining interior {k-1..N_tot-1}, then release mode k-1 to R
  for (let k = 1; k <= nQubits; k++) {
    scrambleInterior(k - 1, 4, k)
    recordStep(k)
  }

  // Exact backward U^dag reversal from |psi(N_tot)> back to |psi(0)>
  const revRe = Float64Array.from(re)
  const revIm = Float64Array.from(im)
  for (let idx = ops.length - 1; idx >= 0; idx--) {
    const op = ops[idx]!
    if (op.kind === '1q') {
      apply1Q(revRe, revIm, nQubits, op.q, gateBankDag[op.gateIdx]!)
    } else {
      applyMPair2Q(revRe, revIm, nQubits, op.q0, op.q1, -op.power)
    }
  }
  let revSq = 0
  for (let i = 0; i < dim; i++) {
    const tr = i === initIdx ? 1 : 0
    const dr = revRe[i]! - tr
    const di = revIm[i]!
    revSq += dr * dr + di * di
  }
  const backwardReversalErr = Math.sqrt(revSq)

  const asymptoticPagePeakBits = kPage - 1 / (2 * Math.LN2)
  const exactPagePeakBits = exactPageBits(nQubits, kPage)
  const sRadAt0 = pageCurve[0]!.entropyBits
  const sRadAtPage = pageCurve[kPage]!.entropyBits
  const sRadAtEnd = pageCurve[nQubits]!.entropyBits

  let earlyMonotoneRise = true
  for (let k = 0; k < kPage; k++) {
    if (!(pageCurve[k + 1]!.entropyBits > pageCurve[k]!.entropyBits)) earlyMonotoneRise = false
  }
  let lateMonotoneFall = true
  for (let k = kPage; k < nQubits; k++) {
    if (!(pageCurve[k + 1]!.entropyBits < pageCurve[k]!.entropyBits)) lateMonotoneFall = false
  }

  // ---- Part A.2: Bosonic Bogoliubov Two-Mode-Squeezer Thermal-Consistency Check ----
  // Evaluates Fock squeezing at r = atanh(exp(-omega / (2 T_H))) for the benchmark input kappa = ln(6034 / 330),
  // verifying sinh^2(r) = 1 / (exp(omega / T_H) - 1) (not a dynamical derivation of T_H from {3,4,3,4}).
  const cuspVolumeRatio = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]
  const surfaceGravityKappa = Math.log(cuspVolumeRatio)
  const hawkingTempTH = surfaceGravityKappa / (2 * Math.PI)

  const omegaGrid = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0] as const
  const fockDim = 97 // m = 0..96 pair Fock states
  const vac = new Float64Array(fockDim)
  vac[0] = 1

  const hawkingModes: HawkingModeRow[] = []
  let maxPlanckAbsErr = 0
  let maxBogoliubovUnitErr = 0
  let maxFockNormErr = 0
  let maxFockReversalErr = 0
  let maxFlatControlOccupation = 0

  for (const x of omegaGrid) {
    const omega = x * hawkingTempTH
    const r = Math.atanh(Math.exp((-Math.PI * omega) / surfaceGravityKappa))
    const alpha = Math.cosh(r)
    const beta = Math.sinh(r)
    const bogErr = Math.abs(alpha * alpha - beta * beta - 1)

    const psi = applyFockSqueeze(vac, r)
    const psiRev = applyFockSqueeze(psi, -r)

    let norm = 0
    let occ = 0
    let modeS = 0
    let revDiffSq = 0
    for (let m = 0; m < fockDim; m++) {
      const p = psi[m]! * psi[m]!
      norm += p
      occ += m * p
      if (p > 1e-18) modeS -= p * Math.log2(p)
      const d = psiRev[m]! - (m === 0 ? 1 : 0)
      revDiffSq += d * d
    }

    // Flat-horizon control (kappa = 0 => r = 0)
    const flatPsi = applyFockSqueeze(vac, 0)
    let flatOcc = 0
    for (let m = 0; m < fockDim; m++) {
      flatOcc += m * flatPsi[m]! * flatPsi[m]!
    }

    const planck = 1 / (Math.exp(omega / hawkingTempTH) - 1)
    const absErr = Math.abs(occ - planck)
    const fockRevErr = Math.sqrt(revDiffSq)

    maxPlanckAbsErr = Math.max(maxPlanckAbsErr, absErr)
    maxBogoliubovUnitErr = Math.max(maxBogoliubovUnitErr, bogErr)
    maxFockNormErr = Math.max(maxFockNormErr, Math.abs(norm - 1))
    maxFockReversalErr = Math.max(maxFockReversalErr, fockRevErr)
    maxFlatControlOccupation = Math.max(maxFlatControlOccupation, flatOcc)

    hawkingModes.push({
      omegaOverTH: x,
      omega,
      occupationFock: occ,
      occupationPlanck: planck,
      absErr,
      flatControlOccupation: flatOcc,
      bogoliubovUnitErr: bogErr,
      fockReversalErr: fockRevErr,
      modeEntropyBits: modeS,
    })
  }

  // Exact OLS linear fit of y(omega) = ln(1 + 1 / n(omega)) = omega / T_H
  const mCount = hawkingModes.length
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let syy = 0
  for (const row of hawkingModes) {
    const x = row.omega
    const y = Math.log(1 + 1 / row.occupationFock)
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
    syy += y * y
  }
  const slope = (mCount * sxy - sx * sy) / (mCount * sxx - sx * sx)
  const intercept = (sy - slope * sx) / mCount
  let ssRes = 0
  const yMean = sy / mCount
  let ssTot = 0
  for (const row of hawkingModes) {
    const y = Math.log(1 + 1 / row.occupationFock)
    const pred = intercept + slope * row.omega
    ssRes += (y - pred) * (y - pred)
    ssTot += (y - yMean) * (y - yMean)
  }
  const planckFitTempTH = 1 / slope
  const planckTempRelErr = Math.abs(planckFitTempTH - hawkingTempTH) / hawkingTempTH
  const planckFitR2 = 1 - ssRes / ssTot

  return {
    nQubits,
    kPage,
    asymptoticPagePeakBits,
    exactPagePeakBits,
    pageCurve,
    sRadAt0,
    sRadAtPage,
    sRadAtEnd,
    peakDiffFromAsymptoticPage: Math.abs(sRadAtPage - asymptoticPagePeakBits),
    peakDiffFromExactPage: Math.abs(sRadAtPage - exactPagePeakBits),
    earlyMonotoneRise,
    lateMonotoneFall,
    maxGlobalNormErr,
    maxGlobalEntropyBits,
    maxReducedTraceErr,
    backwardReversalErr,
    maxGateUnitarityErr,
    maxControlEntropyBits,
    cuspVolumeRatio,
    surfaceGravityKappa,
    hawkingTempTH,
    hawkingModes,
    maxPlanckAbsErr,
    planckFitTempTH,
    planckTempRelErr,
    planckFitR2,
    maxBogoliubovUnitErr,
    maxFockNormErr,
    maxFockReversalErr,
    maxFlatControlOccupation,
  }
}

// ============================================================================================================
// PART B: L1 Z[w][1/2] SU(2) MITM GATE-SYNTHESIS CONVERGENCE BENCHMARK ON A PREPARED BELL SINGLET
// ============================================================================================================

type SU2Tree = {
  readonly count: number
  readonly levelEnd: readonly number[]
  readonly ar: Float64Array
  readonly ai: Float64Array
  readonly br: Float64Array
  readonly bi: Float64Array
  readonly ux: Float64Array
  readonly uy: Float64Array
  readonly uz: Float64Array
  readonly parent: Int32Array
  readonly gen: Uint8Array
}

// Build reduced word tree up to half-length maxDepth over {W1, W1^dag, W2, W2^dag} (4 * 3^(d-1) per depth).
// Every U in SU(2) is represented by first row (a, b) with U = [[a, b], [-conj(b), conj(a)]].
function buildSU2HalfTree(gensU2: readonly [U2, U2, U2, U2], maxDepth: number): SU2Tree {
  const invGen = [1, 0, 3, 2] as const
  let total = 1
  let layerSize = 4
  const levelEnd: number[] = [1]
  for (let d = 1; d <= maxDepth; d++) {
    total += layerSize
    levelEnd.push(total)
    layerSize *= 3
  }

  const ar = new Float64Array(total)
  const ai = new Float64Array(total)
  const br = new Float64Array(total)
  const bi = new Float64Array(total)
  const ux = new Float64Array(total)
  const uy = new Float64Array(total)
  const uz = new Float64Array(total)
  const parent = new Int32Array(total)
  const gen = new Uint8Array(total)

  // Node 0: identity I
  ar[0] = 1
  uz[0] = 1
  parent[0] = -1
  gen[0] = 255

  const gar = gensU2.map(g => g[0])
  const gai = gensU2.map(g => g[1])
  const gbr = gensU2.map(g => g[2])
  const gbi = gensU2.map(g => g[3])

  let write = 1
  for (let d = 1; d <= maxDepth; d++) {
    const start = d === 1 ? 0 : levelEnd[d - 2]!
    const end = levelEnd[d - 1]!
    for (let p = start; p < end; p++) {
      const par = ar[p]!
      const pai = ai[p]!
      const pbr = br[p]!
      const pbi = bi[p]!
      const forbid = d === 1 ? 255 : invGen[gen[p]!]!

      for (let g = 0; g < 4; g++) {
        if (g === forbid) continue
        // Multiply right: U_new = U_parent * G_g
        // Row 0 of U_parent * G_g:
        //   a_new = a * ga + b * (-conj(gb)) = a * ga - b * conj(gb)
        //   b_new = a * gb + b * conj(ga)
        const cgar = gar[g]!
        const cgai = gai[g]!
        const cgbr = gbr[g]!
        const cgbi = gbi[g]!

        const nar = par * cgar - pai * cgai - (pbr * cgbr + pbi * cgbi)
        const nai = par * cgai + pai * cgar - (pbi * cgbr - pbr * cgbi)
        const nbr = par * cgbr - pai * cgbi + (pbr * cgar + pbi * cgai)
        const nbi = par * cgbi + pai * cgbr + (pbi * cgar - pbr * cgai)

        ar[write] = nar
        ai[write] = nai
        br[write] = nbr
        bi[write] = nbi

        // u(U) = bloch(U^dag Z U):
        //   nx = 2 (ar br + ai bi), ny = 2 (ai br - ar bi), nz = ar^2 + ai^2 - br^2 - bi^2
        ux[write] = 2 * (nar * nbr + nai * nbi)
        uy[write] = 2 * (nai * nbr - nar * nbi)
        uz[write] = nar * nar + nai * nai - nbr * nbr - nbi * nbi

        parent[write] = p
        gen[write] = g
        write++
      }
    }
  }

  return { count: total, levelEnd, ar, ai, br, bi, ux, uy, uz, parent, gen }
}

function reconstructWord(tree: SU2Tree, idx: number): number[] {
  const rev: number[] = []
  let cur = idx
  while (cur > 0) {
    rev.push(tree.gen[cur]!)
    cur = tree.parent[cur]!
  }
  rev.reverse()
  return rev
}

// Deterministic Meet-in-the-Middle exact search for U = A * B (length <= 2 * halfDepth) minimizing ||bloch(U^dag Z U) - t||:
//   bloch((A B)^dag Z (A B)) ~ t   <=>   u(A) = bloch(A^dag Z A) ~ v(B; t) = bloch(B (t . sigma) B^dag).
function mitmSearchTargets(
  tree: SU2Tree,
  halfDepth: number,
  targets: readonly (readonly [number, number, number])[],
  gensEis: readonly [EisMat2, EisMat2, EisMat2, EisMat2],
): {
  readonly gatesU2: U2[]
  readonly wordLengths: number[]
  readonly blochDists: number[]
  readonly exactRingOk: boolean
  readonly maxUnitarityErr: number
  readonly maxMitmConsistencyErr: number
} {
  const n = tree.levelEnd[halfDepth]!
  const { ar, ai, br, bi, ux, uy, uz } = tree

  const bestA = new Int32Array(targets.length)
  const bestB = new Int32Array(targets.length)
  const bestDot = new Float64Array(targets.length).fill(-2)

  if (n <= 600) {
    // Exact all-pairs scan for small L (L = 6, 10)
    for (let tIdx = 0; tIdx < targets.length; tIdx++) {
      const [tx, ty, tz] = targets[tIdx]!
      let bDot = -2
      let bA = 0
      let bB = 0
      for (let j = 0; j < n; j++) {
        const jar = ar[j]!
        const jai = ai[j]!
        const jbr = br[j]!
        const jbi = bi[j]!
        const a2 = jar * jar + jai * jai
        const b2 = jbr * jbr + jbi * jbi
        // a * conj(b)
        const acbr = jar * jbr + jai * jbi
        const acbi = jai * jbr - jar * jbi
        // vz = (|a|^2 - |b|^2) tz + 2 Re(a conj(b) (tx - i ty))
        const vz = (a2 - b2) * tz + 2 * (acbr * tx + acbi * ty)
        // vx - i vy = -2 a b tz + a^2 (tx - i ty) - b^2 (tx + i ty)
        const abr = jar * jbr - jai * jbi
        const abi = jar * jbi + jai * jbr
        const a2r = jar * jar - jai * jai
        const a2i = 2 * jar * jai
        const b2r = jbr * jbr - jbi * jbi
        const b2i = 2 * jbr * jbi
        const vx = -2 * abr * tz + (a2r * tx + a2i * ty) - (b2r * tx - b2i * ty)
        const vy = -(-2 * abi * tz + (a2i * tx - a2r * ty) - (b2r * ty + b2i * tx))

        for (let i = 0; i < n; i++) {
          const dot = ux[i]! * vx + uy[i]! * vy + uz[i]! * vz
          if (dot > bDot) {
            bDot = dot
            bA = i
            bB = j
          }
        }
      }
      bestDot[tIdx] = bDot
      bestA[tIdx] = bA
      bestB[tIdx] = bB
    }
  } else {
    // Zero-allocation linked-list 3D voxel hash grid on S^2
    const h = n <= 5000 ? 0.06 : n <= 50000 ? 0.02 : 0.006
    const invH = 1 / h
    const tableBits = n <= 50000 ? 17 : 20
    const tableSize = 1 << tableBits
    const mask = tableSize - 1
    const head = new Int32Array(tableSize).fill(-1)
    const next = new Int32Array(n)

    const hashCell = (ix: number, iy: number, iz: number): number =>
      (Math.imul(ix, 73856093) ^ Math.imul(iy, 19349663) ^ Math.imul(iz, 83492791)) & mask

    for (let i = 0; i < n; i++) {
      const ix = Math.floor(ux[i]! * invH)
      const iy = Math.floor(uy[i]! * invH)
      const iz = Math.floor(uz[i]! * invH)
      const slot = hashCell(ix, iy, iz)
      next[i] = head[slot]!
      head[slot] = i
    }

    for (let tIdx = 0; tIdx < targets.length; tIdx++) {
      const [tx, ty, tz] = targets[tIdx]!
      let bDot = -2
      let bA = 0
      let bB = 0
      for (let j = 0; j < n; j++) {
        const jar = ar[j]!
        const jai = ai[j]!
        const jbr = br[j]!
        const jbi = bi[j]!
        const a2 = jar * jar + jai * jai
        const b2 = jbr * jbr + jbi * jbi
        const acbr = jar * jbr + jai * jbi
        const acbi = jai * jbr - jar * jbi
        const vz = (a2 - b2) * tz + 2 * (acbr * tx + acbi * ty)
        const abr = jar * jbr - jai * jbi
        const abi = jar * jbi + jai * jbr
        const a2r = jar * jar - jai * jai
        const a2i = 2 * jar * jai
        const b2r = jbr * jbr - jbi * jbi
        const b2i = 2 * jbr * jbi
        const vx = -2 * abr * tz + (a2r * tx + a2i * ty) - (b2r * tx - b2i * ty)
        const vy = -(-2 * abi * tz + (a2i * tx - a2r * ty) - (b2r * ty + b2i * tx))

        const cx = Math.floor(vx * invH)
        const cy = Math.floor(vy * invH)
        const cz = Math.floor(vz * invH)

        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx
          for (let dy = -1; dy <= 1; dy++) {
            const ny = cy + dy
            for (let dz = -1; dz <= 1; dz++) {
              let i = head[hashCell(nx, ny, cz + dz)]!
              while (i !== -1) {
                const dot = ux[i]! * vx + uy[i]! * vy + uz[i]! * vz
                if (dot > bDot) {
                  bDot = dot
                  bA = i
                  bB = j
                }
                i = next[i]!
              }
            }
          }
        }
      }
      bestDot[tIdx] = bDot
      bestA[tIdx] = bA
      bestB[tIdx] = bB
    }
  }

  // Reconstruct winning words and evaluate in EXACT BigInt Z[w][1/2] arithmetic!
  const gatesU2: U2[] = []
  const wordLengths: number[] = []
  const blochDists: number[] = []
  let exactRingOk = true
  let maxUnitarityErr = 0
  let maxMitmConsistencyErr = 0

  for (let tIdx = 0; tIdx < targets.length; tIdx++) {
    const wordA = reconstructWord(tree, bestA[tIdx]!)
    const wordB = reconstructWord(tree, bestB[tIdx]!)
    const fullWord = [...wordA, ...wordB]
    let exactMat = EIS_I2
    for (const g of fullWord) {
      exactMat = mulEisMat2(exactMat, gensEis[g]!)
    }
    if (!isExactSU2Eis(exactMat)) exactRingOk = false
    const u = eisToU2(exactMat)
    maxUnitarityErr = Math.max(maxUnitarityErr, unitarityErrU2(u))

    const nVec = blochZ(u)
    const t = targets[tIdx]!
    const dist = Math.hypot(nVec[0] - t[0], nVec[1] - t[1], nVec[2] - t[2])
    // Compute exact cancellation-free Euclidean distance ||u(A) - v(B; t)||_2 directly
    const bIdx = bestB[tIdx]!
    const aIdx = bestA[tIdx]!
    const jar = ar[bIdx]!
    const jai = ai[bIdx]!
    const jbr = br[bIdx]!
    const jbi = bi[bIdx]!
    const a2 = jar * jar + jai * jai
    const b2 = jbr * jbr + jbi * jbi
    const acbr = jar * jbr + jai * jbi
    const acbi = jai * jbr - jar * jbi
    const vz = (a2 - b2) * t[2] + 2 * (acbr * t[0] + acbi * t[1])
    const abr = jar * jbr - jai * jbi
    const abi = jar * jbi + jai * jbr
    const a2r = jar * jar - jai * jai
    const a2i = 2 * jar * jai
    const b2r = jbr * jbr - jbi * jbi
    const b2i = 2 * jbr * jbi
    const vx = -2 * abr * t[2] + (a2r * t[0] + a2i * t[1]) - (b2r * t[0] - b2i * t[1])
    const vy = -(-2 * abi * t[2] + (a2i * t[0] - a2r * t[1]) - (b2r * t[1] + b2i * t[0]))
    const mitmDist = Math.hypot(ux[aIdx]! - vx, uy[aIdx]! - vy, uz[aIdx]! - vz)
    maxMitmConsistencyErr = Math.max(maxMitmConsistencyErr, Math.abs(dist - mitmDist))

    gatesU2.push(u)
    wordLengths.push(fullWord.length)
    blochDists.push(dist)
  }

  return {
    gatesU2,
    wordLengths,
    blochDists,
    exactRingOk,
    maxUnitarityErr,
    maxMitmConsistencyErr,
  }
}

// ---- Strictly Open, Non-Wrapping Honeycomb Line Two-Particle Bell State ----
// Docks x in [0, LINE_LEN - 1] (NO periodic wrap!). Mode m = 2 * x + dir (dir 0 = left, dir 1 = right).
// Stores unfactored joint 2-particle state over active (modeA, modeB) pairs with 4 complex spin amplitudes
// (|00>, |01>, |10>, |11>).

type OpenLineBellState = {
  readonly lineLen: number
  readonly pairs: Map<number, Float64Array> // key = modeA * 512 + modeB -> 8 floats [r00,i00,r01,i01,r10,i10,r11,i11]
  readonly boundaryHits: number
  readonly minDockA: number
  readonly maxDockA: number
  readonly minDockB: number
  readonly maxDockB: number
}

const LINE_KEY_STRIDE = 512

function makeOpenLineBellStart(
  lineLen: number,
  centerDock: number,
  spinBasis: 'singlet' | '01' | '10',
): OpenLineBellState {
  const modeA = 2 * centerDock // dir = 0 (left-moving)
  const modeB = 2 * centerDock + 1 // dir = 1 (right-moving)
  const amp = new Float64Array(8)
  if (spinBasis === 'singlet') {
    amp[2] = Math.SQRT1_2 // |01>
    amp[4] = -Math.SQRT1_2 // |10>
  } else if (spinBasis === '01') {
    amp[2] = 1
  } else {
    amp[4] = 1
  }
  const pairs = new Map<number, Float64Array>()
  pairs.set(modeA * LINE_KEY_STRIDE + modeB, amp)
  return {
    lineLen,
    pairs,
    boundaryHits: 0,
    minDockA: centerDock,
    maxDockA: centerDock,
    minDockB: centerDock,
    maxDockB: centerDock,
  }
}

function stepOpenLineStream(state: OpenLineBellState, reverse: boolean): OpenLineBellState {
  const { lineLen } = state
  const next = new Map<number, Float64Array>()
  let boundaryHits = state.boundaryHits
  let minDockA = lineLen
  let maxDockA = -1
  let minDockB = lineLen
  let maxDockB = -1

  for (const [key, amp] of state.pairs) {
    const modeA = (key / LINE_KEY_STRIDE) | 0
    const modeB = key % LINE_KEY_STRIDE
    const xA = modeA >> 1
    const dA = modeA & 1
    const xB = modeB >> 1
    const dB = modeB & 1

    const stepA = (dA === 1 ? 1 : -1) * (reverse ? -1 : 1)
    const stepB = (dB === 1 ? 1 : -1) * (reverse ? -1 : 1)
    const nxA = xA + stepA
    const nxB = xB + stepB

    if (nxA < 0 || nxA >= lineLen || nxB < 0 || nxB >= lineLen) {
      boundaryHits++
      continue
    }
    if (nxA < minDockA) minDockA = nxA
    if (nxA > maxDockA) maxDockA = nxA
    if (nxB < minDockB) minDockB = nxB
    if (nxB > maxDockB) maxDockB = nxB

    const nk = (2 * nxA + dA) * LINE_KEY_STRIDE + (2 * nxB + dB)
    let dst = next.get(nk)
    if (!dst) {
      dst = new Float64Array(8)
      next.set(nk, dst)
    }
    for (let s = 0; s < 8; s++) dst[s] = dst[s]! + amp[s]!
  }

  return { lineLen, pairs: next, boundaryHits, minDockA, maxDockA, minDockB, maxDockB }
}

// Apply working-rule directional coin (C or C^dag) independently on Alice's and Bob's open-line directions
function stepOpenLineCoin(state: OpenLineBellState, coin: U2): OpenLineBellState {
  const { lineLen } = state
  const next = new Map<number, Float64Array>()

  const getCoin = (outDir: number, inDir: number): [number, number] => [
    coin[outDir * 4 + inDir * 2]!,
    coin[outDir * 4 + inDir * 2 + 1]!,
  ]

  for (const [key, amp] of state.pairs) {
    const modeA = (key / LINE_KEY_STRIDE) | 0
    const modeB = key % LINE_KEY_STRIDE
    const xA = modeA >> 1
    const dA = modeA & 1
    const xB = modeB >> 1
    const dB = modeB & 1

    for (let odA = 0; odA < 2; odA++) {
      const [cAr, cAi] = getCoin(odA, dA)
      for (let odB = 0; odB < 2; odB++) {
        const [cBr, cBi] = getCoin(odB, dB)
        const fr = cAr * cBr - cAi * cBi
        const fi = cAr * cBi + cAi * cBr
        const nk = (2 * xA + odA) * LINE_KEY_STRIDE + (2 * xB + odB)
        let dst = next.get(nk)
        if (!dst) {
          dst = new Float64Array(8)
          next.set(nk, dst)
        }
        for (let s = 0; s < 4; s++) {
          const ar = amp[2 * s]!
          const ai = amp[2 * s + 1]!
          dst[2 * s] = dst[2 * s]! + (fr * ar - fi * ai)
          dst[2 * s + 1] = dst[2 * s + 1]! + (fr * ai + fi * ar)
        }
      }
    }
  }

  return {
    lineLen,
    pairs: next,
    boundaryHits: state.boundaryHits,
    minDockA: state.minDockA,
    maxDockA: state.maxDockA,
    minDockB: state.minDockB,
    maxDockB: state.maxDockB,
  }
}

// Apply comoving local spin analyzers U_A (x) U_B at every occupied open-line pair (modeA, modeB)
function applyOpenLineAnalyzers(state: OpenLineBellState, uA: U2, uB: U2): OpenLineBellState {
  const next = new Map<number, Float64Array>()
  // Precompute 4x4 Kronecker matrix K = uA (x) uB
  const kr = new Float64Array(16)
  const ki = new Float64Array(16)
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const aR = uA[i * 4 + j * 2]!
      const aI = uA[i * 4 + j * 2 + 1]!
      for (let p = 0; p < 2; p++) {
        for (let q = 0; q < 2; q++) {
          const bR = uB[p * 4 + q * 2]!
          const bI = uB[p * 4 + q * 2 + 1]!
          const row = i * 2 + p
          const col = j * 2 + q
          kr[row * 4 + col] = aR * bR - aI * bI
          ki[row * 4 + col] = aR * bI + aI * bR
        }
      }
    }
  }

  for (const [key, amp] of state.pairs) {
    const dst = new Float64Array(8)
    for (let row = 0; row < 4; row++) {
      let sr = 0
      let si = 0
      const base = row * 4
      for (let col = 0; col < 4; col++) {
        const mr = kr[base + col]!
        const mi = ki[base + col]!
        const vr = amp[2 * col]!
        const vi = amp[2 * col + 1]!
        sr += mr * vr - mi * vi
        si += mr * vi + mi * vr
      }
      dst[2 * row] = sr
      dst[2 * row + 1] = si
    }
    next.set(key, dst)
  }

  return {
    lineLen: state.lineLen,
    pairs: next,
    boundaryHits: state.boundaryHits,
    minDockA: state.minDockA,
    maxDockA: state.maxDockA,
    minDockB: state.minDockB,
    maxDockB: state.maxDockB,
  }
}

function openLineOutcomeStats(state: OpenLineBellState): {
  readonly p00: number
  readonly p01: number
  readonly p10: number
  readonly p11: number
  readonly sumP: number
  readonly corr: number
  readonly margA0: number
  readonly margB0: number
} {
  let p00 = 0
  let p01 = 0
  let p10 = 0
  let p11 = 0
  for (const amp of state.pairs.values()) {
    p00 += amp[0]! * amp[0]! + amp[1]! * amp[1]!
    p01 += amp[2]! * amp[2]! + amp[3]! * amp[3]!
    p10 += amp[4]! * amp[4]! + amp[5]! * amp[5]!
    p11 += amp[6]! * amp[6]! + amp[7]! * amp[7]!
  }
  const sumP = p00 + p01 + p10 + p11
  return {
    p00,
    p01,
    p10,
    p11,
    sumP,
    corr: p00 - p01 - p10 + p11,
    margA0: p00 + p01,
    margB0: p00 + p10,
  }
}

function openLineStateDiffL2(a: OpenLineBellState, b: OpenLineBellState): number {
  const allKeys = new Set<number>([...a.pairs.keys(), ...b.pairs.keys()])
  let sumSq = 0
  for (const k of allKeys) {
    const va = a.pairs.get(k)
    const vb = b.pairs.get(k)
    for (let s = 0; s < 8; s++) {
      const d = (va ? va[s]! : 0) - (vb ? vb[s]! : 0)
      sumSq += d * d
    }
  }
  return Math.sqrt(sumSq)
}

export type WordLengthChshRow = {
  readonly wordLength: number
  readonly chshOpen: number
  readonly gapToTsirelson: number
  readonly classicalControlChsh: number
  readonly maxBlochDist: number
  readonly maxNoSignalingDrift: number
  readonly maxNormErr: number
  readonly exactRingOk: boolean
  readonly maxUnitarityErr: number
  readonly realizedLengths: readonly [number, number, number, number]
}

export type OpenTsirelsonResult = {
  readonly lineLen: number
  readonly centerDock: number
  readonly totalBeats: number
  readonly boundaryHits: number
  readonly minDockA: number
  readonly maxDockA: number
  readonly minDockB: number
  readonly maxDockB: number
  readonly separationGapDocks: number
  readonly activeSpatialPairs: number
  readonly wordCurve: readonly WordLengthChshRow[]
  readonly strictlyMonotonicConvergence: boolean
  readonly bestChshOpen: number
  readonly bestGapToTsirelson: number
  readonly improvementOverE0202: number
  readonly maxClassicalControlChsh: number
  readonly maxNoSignalingDrift: number
  readonly maxUnitarityErr: number
  readonly maxMitmConsistencyErr: number
  readonly fullReversalErr: number
  readonly allExactRingOk: boolean
}

function runOpenLineTsirelson(
  ruleGens: ReturnType<typeof buildRuleSU2Generators>,
): OpenTsirelsonResult {
  const lineLen = 128
  const centerDock = 64
  const ballisticBeats = 24
  const walkBeats = 6
  const totalBeats = ballisticBeats + walkBeats

  const coinU2 = eisToU2(ruleGens.C)
  const coinDagU2 = dagU2(coinU2)

  // Evolve Bell singlet and classical dephased basis components on the strictly open non-wrapping line
  const evolveOpenLine = (basis: 'singlet' | '01' | '10'): {
    readonly initial: OpenLineBellState
    readonly evolved: OpenLineBellState
  } => {
    const initial = makeOpenLineBellStart(lineLen, centerDock, basis)
    let cur = initial
    for (let t = 0; t < ballisticBeats; t++) {
      cur = stepOpenLineStream(cur, false)
    }
    for (let t = 0; t < walkBeats; t++) {
      cur = stepOpenLineCoin(cur, coinU2)
      cur = stepOpenLineStream(cur, false)
    }
    return { initial, evolved: cur }
  }

  const singletRun = evolveOpenLine('singlet')
  const branch01Run = evolveOpenLine('01')
  const branch10Run = evolveOpenLine('10')

  const evolved = singletRun.evolved
  const separationGapDocks = evolved.minDockB - evolved.maxDockA

  // Build deterministic SU(2) half-word tree up to m = 11 (covers L_word up to 22)
  const tree = buildSU2HalfTree(ruleGens.gensU2, 11)
  const wordLengths = [6, 10, 14, 18, 22] as const

  // Optimal CHSH Bloch axes in the x-z plane for singlet |Psi^->:
  //   a0 = (0, 0, 1) (exact U = I), a1 = (1, 0, 0), b0 = (1/sqrt2, 0, 1/sqrt2), b1 = (-1/sqrt2, 0, 1/sqrt2)
  const targets: readonly (readonly [number, number, number])[] = [
    [1, 0, 0],
    [Math.SQRT1_2, 0, Math.SQRT1_2],
    [-Math.SQRT1_2, 0, Math.SQRT1_2],
  ]
  const uI: U2 = [1, 0, 0, 0, 0, 0, 1, 0]

  const wordCurve: WordLengthChshRow[] = []
  let maxClassicalControlChsh = 0
  let maxNoSignalingDrift = 0
  let maxUnitarityErr = unitarityErrU2(coinU2)
  let maxMitmConsistencyErr = 0
  let allExactRingOk = isExactSU2Eis(ruleGens.W1) && isExactSU2Eis(ruleGens.W2)
  let bestPairForReversal: readonly [U2, U2] = [uI, uI]

  for (const L of wordLengths) {
    const mitm = mitmSearchTargets(tree, L >> 1, targets, ruleGens.gensEis)
    const uA0 = uI
    const uA1 = mitm.gatesU2[0]!
    const uB0 = mitm.gatesU2[1]!
    const uB1 = mitm.gatesU2[2]!
    bestPairForReversal = [uA1, uB0]

    const q00 = openLineOutcomeStats(applyOpenLineAnalyzers(evolved, uA0, uB0))
    const q01 = openLineOutcomeStats(applyOpenLineAnalyzers(evolved, uA0, uB1))
    const q10 = openLineOutcomeStats(applyOpenLineAnalyzers(evolved, uA1, uB0))
    const q11 = openLineOutcomeStats(applyOpenLineAnalyzers(evolved, uA1, uB1))

    const chshOpen = Math.abs(q00.corr + q01.corr + q10.corr - q11.corr)
    const gapToTsirelson = Math.abs(TSIRELSON - chshOpen)

    // Classical dephased control on the exact same open-line wavepacket (50/50 mixture of |01><01| and |10><10|)
    const clCorr = (uA: U2, uB: U2): number => {
      const s01 = openLineOutcomeStats(applyOpenLineAnalyzers(branch01Run.evolved, uA, uB))
      const s10 = openLineOutcomeStats(applyOpenLineAnalyzers(branch10Run.evolved, uA, uB))
      return 0.5 * (s01.corr + s10.corr)
    }
    const classicalControlChsh = Math.abs(
      clCorr(uA0, uB0) + clCorr(uA0, uB1) + clCorr(uA1, uB0) - clCorr(uA1, uB1),
    )

    const nsDrift = Math.max(
      Math.abs(q00.margA0 - q01.margA0),
      Math.abs(q10.margA0 - q11.margA0),
      Math.abs(q00.margB0 - q10.margB0),
      Math.abs(q01.margB0 - q11.margB0),
    )
    const normErr = Math.max(
      Math.abs(q00.sumP - 1),
      Math.abs(q01.sumP - 1),
      Math.abs(q10.sumP - 1),
      Math.abs(q11.sumP - 1),
    )

    maxClassicalControlChsh = Math.max(maxClassicalControlChsh, classicalControlChsh)
    maxNoSignalingDrift = Math.max(maxNoSignalingDrift, nsDrift)
    maxUnitarityErr = Math.max(maxUnitarityErr, mitm.maxUnitarityErr)
    maxMitmConsistencyErr = Math.max(maxMitmConsistencyErr, mitm.maxMitmConsistencyErr)
    if (!mitm.exactRingOk) allExactRingOk = false

    wordCurve.push({
      wordLength: L,
      chshOpen,
      gapToTsirelson,
      classicalControlChsh,
      maxBlochDist: Math.max(...mitm.blochDists),
      maxNoSignalingDrift: nsDrift,
      maxNormErr: normErr,
      exactRingOk: mitm.exactRingOk,
      maxUnitarityErr: mitm.maxUnitarityErr,
      realizedLengths: [0, mitm.wordLengths[0]!, mitm.wordLengths[1]!, mitm.wordLengths[2]!],
    })
  }

  // Exact backward U^dag reversal of the ENTIRE open-line evolution + comoving L = 22 analyzer
  let rev = applyOpenLineAnalyzers(evolved, bestPairForReversal[0], bestPairForReversal[1])
  rev = applyOpenLineAnalyzers(rev, dagU2(bestPairForReversal[0]), dagU2(bestPairForReversal[1]))
  for (let t = 0; t < walkBeats; t++) {
    rev = stepOpenLineStream(rev, true)
    rev = stepOpenLineCoin(rev, coinDagU2)
  }
  for (let t = 0; t < ballisticBeats; t++) {
    rev = stepOpenLineStream(rev, true)
  }
  const fullReversalErr = openLineStateDiffL2(rev, singletRun.initial)

  let strictlyMonotonicConvergence = true
  for (let i = 0; i + 1 < wordCurve.length; i++) {
    if (!(wordCurve[i + 1]!.gapToTsirelson < wordCurve[i]!.gapToTsirelson)) {
      strictlyMonotonicConvergence = false
    }
  }

  const bestRow = wordCurve[wordCurve.length - 1]!
  const e0202StallGap = 7e-4

  return {
    lineLen,
    centerDock,
    totalBeats,
    boundaryHits: evolved.boundaryHits + rev.boundaryHits,
    minDockA: evolved.minDockA,
    maxDockA: evolved.maxDockA,
    minDockB: evolved.minDockB,
    maxDockB: evolved.maxDockB,
    separationGapDocks,
    activeSpatialPairs: evolved.pairs.size,
    wordCurve,
    strictlyMonotonicConvergence,
    bestChshOpen: bestRow.chshOpen,
    bestGapToTsirelson: bestRow.gapToTsirelson,
    improvementOverE0202: e0202StallGap / Math.max(1e-16, bestRow.gapToTsirelson),
    maxClassicalControlChsh,
    maxNoSignalingDrift,
    maxUnitarityErr,
    maxMitmConsistencyErr,
    fullReversalErr,
    allExactRingOk,
  }
}

export type HorizonPageAndOpenTsirelsonResult = {
  readonly partA: HorizonPageResult
  readonly partB: OpenTsirelsonResult
}

export function runHorizonPageAndOpenTsirelson(): HorizonPageAndOpenTsirelsonResult {
  const ruleGens = buildRuleSU2Generators()
  const partA = runHorizonPageAndHawking(ruleGens)
  const partB = runOpenLineTsirelson(ruleGens)
  return { partA, partB }
}
