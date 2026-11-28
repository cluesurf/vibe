// 4D M_pair(zeta_18) s-WAVE SELF SPECTRAL FILTER ON THE EXACT {3,4,3,4} BALL (E-SLF-0200).
//
// Clean sparse Float64 2-love evolution engine on the cached exact R = 3 honeycomb ball (8,857 docks) under:
//   U_pair(theta) = S * D * M_pair(theta) * K_pass * P_meet * D
// against the bare working rule (no M_pair) and the bare free 2-love null (Lambda^2(S * D^2), no P_meet, K, M_pair).
//
// Key spectral property of M_pair(zeta_18) on a dock's 12 full-line basis states |full_l>:
//   - Unique W(F4)-invariant 4D s-wave |s> = (1/sqrt 12) sum_l |full_l> has exact eigenvalue u = zeta_18 = e^{i pi/9}.
//   - All 11 orthogonal transverse modes |t_k> have exact eigenvalue 1.
//   - Spectral gap |zeta_18 - 1| = 2 sin(pi/18) = 0.3472963553338607 separates |s> from every transverse perturbation.
//
// Also includes a memory-safe wrapper for the fast L = 32, nMax = 5 sparse error-boundary bath survival check
// built on code/measure/sparse-error-boundary.ts. Deterministic only (zero Math.random).

import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import { LINE_SECONDS } from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { pairLineMixMatrix, pairLineScatterAmps } from '@/code/rule/pair-line-mixer'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { fastBallClosure } from '@/code/measure/fast-self-reader'
import type { BallTerm, Closure } from '@/code/measure/self-reader'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import { lineReader } from '@/code/measure/cold-line'
import { sparseLineStart } from '@/code/measure/sparse-cold-line'
import { runSparseBoundary } from '@/code/measure/sparse-error-boundary'
import type { Arm, Arrival, RunResult } from '@/code/measure/error-boundary'

const SLOTS = 24
const LINES = 12
const STRIDE = 262144 // 2^18 > 8857 * 24 = 212568 (exact IEEE-754 safe integer key s0 * STRIDE + s1)
const SQ3 = Math.sqrt(3)
const DROP_EPS = 1e-30

// Half-coin D = C^(1/2) on a single love: keep = (2 + w)/2, cross = -w/2; full-line det D = 1 + w = zeta_6.
const D_KEEP_RE = 0.75
const D_KEEP_IM = SQ3 / 4
const D_CROSS_RE = 0.25
const D_CROSS_IM = -SQ3 / 4
const D_DET_RE = 0.5
const D_DET_IM = SQ3 / 2

// Full-coin C = D^2 on a single love: keep = (1 + w)/2, cross = (1 - w)/2.
const C_KEEP_RE = 0.25
const C_KEEP_IM = SQ3 / 4
const C_CROSS_RE = 0.75
const C_CROSS_IM = -SQ3 / 4

// Meeting phase w = e^{i 2 pi / 3} on a full-line pair of like loves.
const W_RE = -0.5
const W_IM = SQ3 / 2

export type PairMixerSpectrum = {
  readonly theta: number
  readonly unitarityErr: number
  readonly sWaveEigenRe: number
  readonly sWaveEigenIm: number
  readonly sWaveEigenErr: number
  readonly maxTransverseEigenErr: number
  readonly maxOrthoErr: number
  readonly spectralGap: number
  readonly keepWeight: number
  readonly hopWeight: number
}

// Deterministic Helmert orthonormal basis for the 11 transverse modes orthogonal to |s> = (1/sqrt 12)(1,...,1).
function helmertTransverseBasis(): Float64Array[] {
  const basis: Float64Array[] = []

  for (let k = 1; k < LINES; k++) {
    const v = new Float64Array(LINES)
    const inv = 1 / Math.sqrt(k * (k + 1))

    for (let j = 0; j < k; j++) {
      v[j] = inv
    }

    v[k] = -k * inv
    basis.push(v)
  }

  return basis
}

export function inspectPairMixerSpectrum(theta = Math.PI / 9): PairMixerSpectrum {
  const mat = pairLineMixMatrix(theta)
  const amps = pairLineScatterAmps(theta)

  let unitarityErr = 0

  for (let i = 0; i < LINES; i++) {
    for (let j = 0; j < LINES; j++) {
      let rr = 0
      let ii = 0

      for (let k = 0; k < LINES; k++) {
        const a = mat[k * LINES + i]!
        const b = mat[k * LINES + j]!

        rr += a[0] * b[0] + a[1] * b[1]
        ii += a[0] * b[1] - a[1] * b[0]
      }

      const target = i === j ? 1 : 0

      unitarityErr = Math.max(unitarityErr, Math.abs(rr - target), Math.abs(ii))
    }
  }

  const ur = Math.cos(theta)
  const ui = Math.sin(theta)
  const invSq12 = 1 / Math.sqrt(LINES)
  let sWaveEigenErr = 0
  let sRayRe = 0
  let sRayIm = 0

  for (let i = 0; i < LINES; i++) {
    let sr = 0
    let si = 0

    for (let j = 0; j < LINES; j++) {
      sr += mat[i * LINES + j]![0] * invSq12
      si += mat[i * LINES + j]![1] * invSq12
    }

    sRayRe += invSq12 * sr
    sRayIm += invSq12 * si
    sWaveEigenErr = Math.max(sWaveEigenErr, Math.abs(sr - ur * invSq12), Math.abs(si - ui * invSq12))
  }

  const transverse = helmertTransverseBasis()
  let maxTransverseEigenErr = 0
  let maxOrthoErr = 0

  for (let a = 0; a < transverse.length; a++) {
    const va = transverse[a]!
    let dotS = 0

    for (let j = 0; j < LINES; j++) {
      dotS += invSq12 * va[j]!
    }

    maxOrthoErr = Math.max(maxOrthoErr, Math.abs(dotS))

    for (let b = a; b < transverse.length; b++) {
      const vb = transverse[b]!
      let dot = 0

      for (let j = 0; j < LINES; j++) {
        dot += va[j]! * vb[j]!
      }

      maxOrthoErr = Math.max(maxOrthoErr, Math.abs(dot - (a === b ? 1 : 0)))
    }

    for (let i = 0; i < LINES; i++) {
      let tr = 0
      let ti = 0

      for (let j = 0; j < LINES; j++) {
        tr += mat[i * LINES + j]![0] * va[j]!
        ti += mat[i * LINES + j]![1] * va[j]!
      }

      maxTransverseEigenErr = Math.max(maxTransverseEigenErr, Math.abs(tr - va[i]!), Math.abs(ti))
    }
  }

  return {
    theta,
    unitarityErr,
    sWaveEigenRe: sRayRe,
    sWaveEigenIm: sRayIm,
    sWaveEigenErr,
    maxTransverseEigenErr,
    maxOrthoErr,
    spectralGap: Math.hypot(ur - 1, ui),
    keepWeight: amps.keep[0] ** 2 + amps.keep[1] ** 2,
    hopWeight: amps.hop[0] ** 2 + amps.hop[1] ** 2,
  }
}

// ---- exact R = 3 ball 2-love sparse tables and engine ----

export type Ball2LoveTables = {
  readonly radius: number
  readonly cells: number
  readonly distance: Int32Array
  readonly neighbourTable: Int32Array
  readonly target: Int32Array
  readonly streamBijective: boolean
  // precomputed 24 x 24 same-dock 'pass' collision image: packed (img0 << 5) | img1 for (d0, d1)
  readonly sameDockPass: Int16Array
  // r = 1 neighbor dock for each slot d = 0..23 of dock 0
  readonly originNeighbors: Int32Array
  // r = 2 dock along slot d = 0..23 from dock 0: nb(nb(0, d), d)
  readonly originRing2: Int32Array
}

export function buildBall2LoveTables(radius = 3): Ball2LoveTables {
  const m = exactBallMesh({ radius })
  const cells = m.cells
  const totalSlots = cells * SLOTS

  if (totalSlots >= STRIDE) {
    throw new Error(`swave-self-filter: totalSlots ${totalSlots} exceeds key stride ${STRIDE}`)
  }

  const target = new Int32Array(totalSlots)
  const hit = new Uint8Array(totalSlots)
  let streamBijective = true

  for (let x = 0; x < cells; x++) {
    const base = x * SLOTS

    for (let d = 0; d < SLOTS; d++) {
      const y = m.ball.table[base + d]!
      const to = y < 0 ? base + OPPOSITE[d]! : y * SLOTS + d

      if (to < 0 || to >= totalSlots || hit[to] === 1) {
        streamBijective = false
      } else {
        hit[to] = 1
      }

      target[base + d] = to
    }
  }

  const sameDockPass = new Int16Array(SLOTS * SLOTS)
  const dock = new Int8Array(SLOTS)
  const perm = new Int32Array(SLOTS)

  for (let d0 = 0; d0 < SLOTS; d0++) {
    for (let d1 = 0; d1 < SLOTS; d1++) {
      if (d0 === d1) {
        sameDockPass[d0 * SLOTS + d1] = (d0 << 5) | d1
        continue
      }

      dock.fill(0)
      dock[d0] = 1
      dock[d1] = 1
      const kind = bouncePermutation(BOUNCE_TABLE, 'pass', dock, 0, perm)
      const q0 = kind === 0 ? d0 : perm[d0]!
      const q1 = kind === 0 ? d1 : perm[d1]!

      sameDockPass[d0 * SLOTS + d1] = q0 < q1 ? (q0 << 5) | q1 : (q1 << 5) | q0
    }
  }

  const originNeighbors = new Int32Array(SLOTS)
  const originRing2 = new Int32Array(SLOTS)

  for (let d = 0; d < SLOTS; d++) {
    const y1 = m.ball.table[d]!

    originNeighbors[d] = y1
    originRing2[d] = y1 >= 0 ? m.ball.table[y1 * SLOTS + d]! : -1
  }

  return {
    radius,
    cells,
    distance: m.ball.distance,
    neighbourTable: m.ball.table,
    target,
    streamBijective,
    sameDockPass,
    originNeighbors,
    originRing2,
  }
}

// Sparse 2-love state: key = s0 * STRIDE + s1 with 0 <= s0 < s1 < cells * 24, value = [re, im].
export type TwoLoveState = Map<number, [number, number]>

function addAmp(out: TwoLoveState, s0: number, s1: number, re: number, im: number): void {
  if (re === 0 && im === 0) {
    return
  }

  const a = s0 < s1 ? s0 : s1
  const b = s0 < s1 ? s1 : s0
  const key = a * STRIDE + b
  const prev = out.get(key)

  if (prev === undefined) {
    out.set(key, [re, im])
  } else {
    prev[0] += re
    prev[1] += im
  }
}

function pruneState(s: TwoLoveState): TwoLoveState {
  for (const [k, amp] of s) {
    if (amp[0] * amp[0] + amp[1] * amp[1] <= DROP_EPS) {
      s.delete(k)
    }
  }

  return s
}

export function twoLoveNorm(state: TwoLoveState): number {
  let sum = 0

  for (const amp of state.values()) {
    sum += amp[0] * amp[0] + amp[1] * amp[1]
  }

  return sum
}

export function twoLoveInner(a: TwoLoveState, b: TwoLoveState): readonly [number, number] {
  const [small, large, flipped] = a.size <= b.size ? [a, b, false] : [b, a, true]
  let sr = 0
  let si = 0

  for (const [key, sa] of small) {
    const lb = large.get(key)

    if (lb === undefined) {
      continue
    }

    const ar = flipped ? lb[0] : sa[0]
    const ai = flipped ? lb[1] : sa[1]
    const br = flipped ? sa[0] : lb[0]
    const bi = flipped ? sa[1] : lb[1]

    sr += ar * br + ai * bi
    si += ar * bi - ai * br
  }

  return [sr, si]
}

export function twoLoveToBallTerms(state: TwoLoveState): BallTerm[] {
  const out: BallTerm[] = []

  for (const [key, amp] of state) {
    const s1 = key % STRIDE
    const s0 = (key - s1) / STRIDE

    out.push({
      slots: Int32Array.of(s0, s1),
      values: Int8Array.of(1, 1),
      re: amp[0],
      im: amp[1],
    })
  }

  return out
}

function applyHalfCoin(state: TwoLoveState): TwoLoveState {
  const out: TwoLoveState = new Map()

  for (const [key, amp] of state) {
    const ar = amp[0]
    const ai = amp[1]

    if (ar === 0 && ai === 0) {
      continue
    }

    const s1 = key % STRIDE
    const s0 = (key - s1) / STRIDE
    const x0 = Math.floor(s0 / SLOTS)
    const x1 = Math.floor(s1 / SLOTS)
    const d0 = s0 - x0 * SLOTS
    const d1 = s1 - x1 * SLOTS

    // Full-line pair on one dock: D acts as det(D) = 1 + w = zeta_6.
    if (x0 === x1 && d1 === OPPOSITE[d0]) {
      addAmp(out, s0, s1, ar * D_DET_RE - ai * D_DET_IM, ar * D_DET_IM + ai * D_DET_RE)
      continue
    }

    // Two loves on distinct lines (same or different docks): D acts independently on each love.
    const o0 = x0 * SLOTS + OPPOSITE[d0]!
    const o1 = x1 * SLOTS + OPPOSITE[d1]!

    // (keep, keep)
    const kkR = D_KEEP_RE * D_KEEP_RE - D_KEEP_IM * D_KEEP_IM
    const kkI = 2 * D_KEEP_RE * D_KEEP_IM
    addAmp(out, s0, s1, ar * kkR - ai * kkI, ar * kkI + ai * kkR)

    // (keep, cross) and (cross, keep)
    const kcR = D_KEEP_RE * D_CROSS_RE - D_KEEP_IM * D_CROSS_IM
    const kcI = D_KEEP_RE * D_CROSS_IM + D_KEEP_IM * D_CROSS_RE
    addAmp(out, s0, o1, ar * kcR - ai * kcI, ar * kcI + ai * kcR)
    addAmp(out, o0, s1, ar * kcR - ai * kcI, ar * kcI + ai * kcR)

    // (cross, cross)
    const ccR = D_CROSS_RE * D_CROSS_RE - D_CROSS_IM * D_CROSS_IM
    const ccI = 2 * D_CROSS_RE * D_CROSS_IM
    addAmp(out, o0, o1, ar * ccR - ai * ccI, ar * ccI + ai * ccR)
  }

  return pruneState(out)
}

function applyInteraction(
  tables: Ball2LoveTables,
  state: TwoLoveState,
  pairTheta: number | null,
): TwoLoveState {
  const out: TwoLoveState = new Map()
  const amps = pairTheta === null ? undefined : pairLineScatterAmps(pairTheta)

  for (const [key, amp] of state) {
    const ar = amp[0]
    const ai = amp[1]

    if (ar === 0 && ai === 0) {
      continue
    }

    const s1 = key % STRIDE
    const s0 = (key - s1) / STRIDE
    const x0 = Math.floor(s0 / SLOTS)
    const x1 = Math.floor(s1 / SLOTS)

    if (x0 !== x1) {
      addAmp(out, s0, s1, ar, ai)
      continue
    }

    const d0 = s0 - x0 * SLOTS
    const d1 = s1 - x1 * SLOTS

    // Full-line pair: meeting phase w + optional M_pair(theta).
    if (d1 === OPPOSITE[d0]) {
      const pr = ar * W_RE - ai * W_IM
      const pi = ar * W_IM + ai * W_RE

      if (amps === undefined) {
        addAmp(out, s0, s1, pr, pi)
        continue
      }

      const l0 = LINE_OF[d0]!
      const base = x0 * SLOTS

      for (let m = 0; m < LINES; m++) {
        const coeff = m === l0 ? amps.keep : amps.hop
        const cr = coeff[0]
        const ci = coeff[1]
        const q0 = base + LINE_FIRSTS[m]!
        const q1 = base + LINE_SECONDS[m]!

        addAmp(out, q0, q1, pr * cr - pi * ci, pr * ci + pi * cr)
      }

      continue
    }

    // Two loves on distinct lines of the same dock: exact 'pass' collision K.
    const packed = tables.sameDockPass[d0 * SLOTS + d1]!
    const q0 = packed >> 5
    const q1 = packed & 31
    const base = x0 * SLOTS

    addAmp(out, base + q0, base + q1, ar, ai)
  }

  return pruneState(out)
}

function applyStream(tables: Ball2LoveTables, state: TwoLoveState): TwoLoveState {
  const out: TwoLoveState = new Map()
  const target = tables.target

  for (const [key, amp] of state) {
    const ar = amp[0]
    const ai = amp[1]

    if (ar === 0 && ai === 0) {
      continue
    }

    const s1 = key % STRIDE
    const s0 = (key - s1) / STRIDE

    addAmp(out, target[s0]!, target[s1]!, ar, ai)
  }

  return pruneState(out)
}

export type TwoLoveBeatOptions = {
  // true: include P_meet + 'pass' collision + optional M_pair(pairTheta); false: bare free 2-love walk Lambda^2(S C)
  readonly interacting: boolean
  readonly pairTheta: number | null
}

export function twoLoveBeat(
  tables: Ball2LoveTables,
  state: TwoLoveState,
  opts: TwoLoveBeatOptions,
): TwoLoveState {
  let cur = applyHalfCoin(state)

  if (opts.interacting) {
    cur = applyInteraction(tables, cur, opts.pairTheta)
  }

  cur = applyHalfCoin(cur)

  return applyStream(tables, cur)
}

// ---- initial 2-love state constructors on dock 0 and r = 2 shell ----

export function dock0LineCoeffsState(coeffs: readonly (readonly [number, number])[]): TwoLoveState {
  const out: TwoLoveState = new Map()

  for (let l = 0; l < LINES; l++) {
    const c = coeffs[l]!

    addAmp(out, LINE_FIRSTS[l]!, LINE_SECONDS[l]!, c[0], c[1])
  }

  return pruneState(out)
}

export function sWaveCoeffs(): [number, number][] {
  const v = 1 / Math.sqrt(LINES)

  return Array.from({ length: LINES }, () => [v, 0])
}

export function singleLineCoeffs(lineIdx = 0): [number, number][] {
  return Array.from({ length: LINES }, (_, l) => [l === lineIdx ? 1 : 0, 0])
}

// First Helmert transverse mode (|full_0> - |full_1>) / sqrt 2: strictly orthogonal to |s>, M_pair eigenvalue 1.
export function transverseModeCoeffs(): [number, number][] {
  const inv = 1 / Math.SQRT2

  return Array.from({ length: LINES }, (_, l) => [l === 0 ? inv : l === 1 ? -inv : 0, 0])
}

export function perturbedSWaveCoeffs(eps: number): [number, number][] {
  const s = sWaveCoeffs()
  const t = transverseModeCoeffs()
  const norm = Math.sqrt(1 + eps * eps)

  return Array.from({ length: LINES }, (_, l) => [(s[l]![0] + eps * t[l]![0]) / norm, 0])
}

// Phase-matched 2-shell interferometer packet supported on dock 0 (r = 0) and inward-pointing antipodal r = 2 pairs:
//   |psi_0(coeffs)> = cos(alpha) |r=0, full(coeffs)> + sin(alpha) e^{i phi*} |r=2_in, coeffs>
// where phi* aligns the r=2 -> r=1 -> r=0 free-inward path (keep_C^4) constructively with the r=0 -> r=1 -> r=0
// returning s-wave path (w^2 * e^{i pairTheta} * cross_C^2) at beat t = 2!
export function twoShellResonantState(
  tables: Ball2LoveTables,
  coeffs: readonly (readonly [number, number])[],
  pairTheta: number,
  cosAlpha = Math.SQRT1_2,
): TwoLoveState {
  const sinAlpha = Math.sqrt(Math.max(0, 1 - cosAlpha * cosAlpha))

  // Path A amplitude at t = 2 on |0, full_l> for s-wave: (det D)^2 * w * e^{i theta} * cross_C^2 = w^2 * e^{i theta} * cross_C^2.
  const cCross2R = C_CROSS_RE * C_CROSS_RE - C_CROSS_IM * C_CROSS_IM
  const cCross2I = 2 * C_CROSS_RE * C_CROSS_IM
  // w^2 = e^{i 4 pi / 3} = [-0.5, -sqrt(3)/2]
  const w2R = -0.5
  const w2I = -SQ3 / 2
  const ur = Math.cos(pairTheta)
  const ui = Math.sin(pairTheta)
  const w2uR = w2R * ur - w2I * ui
  const w2uI = w2R * ui + w2I * ur
  const pathAR = w2uR * cCross2R - w2uI * cCross2I
  const pathAI = w2uR * cCross2I + w2uI * cCross2R

  // Path B amplitude at t = 2 on |0, full_l>: keep_C^4.
  const cKeep2R = C_KEEP_RE * C_KEEP_RE - C_KEEP_IM * C_KEEP_IM
  const cKeep2I = 2 * C_KEEP_RE * C_KEEP_IM
  const pathBR = cKeep2R * cKeep2R - cKeep2I * cKeep2I
  const pathBI = 2 * cKeep2R * cKeep2I

  const phiStar = Math.atan2(pathAI, pathAR) - Math.atan2(pathBI, pathBR)
  const pR = sinAlpha * Math.cos(phiStar)
  const pI = sinAlpha * Math.sin(phiStar)

  const out: TwoLoveState = new Map()

  for (let l = 0; l < LINES; l++) {
    const cr = coeffs[l]![0]
    const ci = coeffs[l]![1]

    if (cr === 0 && ci === 0) {
      continue
    }

    const f = LINE_FIRSTS[l]!
    const s = LINE_SECONDS[l]!

    // Dock 0 full-line pair
    addAmp(out, f, s, cosAlpha * cr, cosAlpha * ci)

    // Inward-pointing antipodal pair at r = 2 along line l
    const x2Pos = tables.originRing2[f]!
    const x2Neg = tables.originRing2[s]!
    const slotPosIn = x2Pos * SLOTS + s
    const slotNegIn = x2Neg * SLOTS + f

    addAmp(out, slotPosIn, slotNegIn, cr * pR - ci * pI, cr * pI + ci * pR)
  }

  return pruneState(out)
}

// ---- observables on the R = 3 ball ----

export type NeighborIsotropy = {
  readonly weights: Float64Array
  readonly min: number
  readonly max: number
  readonly mean: number
  readonly spread: number
}

// Love occupancy weight per r = 1 neighbor dock of dock 0 (sum over 24 docks = expected loves on shell r = 1).
export function neighborDockIsotropy(tables: Ball2LoveTables, state: TwoLoveState): NeighborIsotropy {
  const dockToIdx = new Map<number, number>()

  for (let d = 0; d < SLOTS; d++) {
    dockToIdx.set(tables.originNeighbors[d]!, d)
  }

  const weights = new Float64Array(SLOTS)

  for (const [key, amp] of state) {
    const w = amp[0] * amp[0] + amp[1] * amp[1]

    if (w === 0) {
      continue
    }

    const s1 = key % STRIDE
    const s0 = (key - s1) / STRIDE
    const i0 = dockToIdx.get(Math.floor(s0 / SLOTS))
    const i1 = dockToIdx.get(Math.floor(s1 / SLOTS))

    if (i0 !== undefined) {
      weights[i0] = weights[i0]! + w
    }

    if (i1 !== undefined) {
      weights[i1] = weights[i1]! + w
    }
  }

  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let sum = 0

  for (let d = 0; d < SLOTS; d++) {
    const v = weights[d]!

    if (v < min) min = v
    if (v > max) max = v
    sum += v
  }

  return {
    weights,
    min,
    max,
    mean: sum / SLOTS,
    spread: max - min,
  }
}

export type LineDispersion = {
  readonly lineWeights: Float64Array
  readonly line0Fraction: number
  readonly offLine0Fraction: number
  readonly activeLines: number
}

export function lineDispersionOf(state: TwoLoveState): LineDispersion {
  const lineWeights = new Float64Array(LINES)
  let total = 0

  for (const [key, amp] of state) {
    const w = amp[0] * amp[0] + amp[1] * amp[1]

    if (w === 0) {
      continue
    }

    const s1 = key % STRIDE
    const s0 = (key - s1) / STRIDE
    const l0 = LINE_OF[s0 % SLOTS]!
    const l1 = LINE_OF[s1 % SLOTS]!

    lineWeights[l0] = lineWeights[l0]! + w
    lineWeights[l1] = lineWeights[l1]! + w
    total += 2 * w
  }

  let activeLines = 0

  for (let l = 0; l < LINES; l++) {
    if (lineWeights[l]! > 1e-12) {
      activeLines++
    }
  }

  const line0Fraction = total > 0 ? lineWeights[0]! / total : 0

  return {
    lineWeights,
    line0Fraction,
    offLine0Fraction: 1 - line0Fraction,
    activeLines,
  }
}

// Computes the exact s-wave purity on the dock-0 full-line core (at even beats) or r = 1 outward antipodal core (at odd beats).
export function sWaveCoreCoherence(
  tables: Ball2LoveTables,
  state: TwoLoveState,
  shell: 0 | 1,
): { readonly coreWeight: number; readonly sWaveFraction: number; readonly phaseRad: number } {
  let coreWeight = 0
  let sumRe = 0
  let sumIm = 0
  const invSq12 = 1 / Math.sqrt(LINES)

  for (let l = 0; l < LINES; l++) {
    const f = LINE_FIRSTS[l]!
    const s = LINE_SECONDS[l]!
    const slotA = shell === 0 ? f : tables.originNeighbors[f]! * SLOTS + f
    const slotB = shell === 0 ? s : tables.originNeighbors[s]! * SLOTS + s
    const a = slotA < slotB ? slotA : slotB
    const b = slotA < slotB ? slotB : slotA
    const amp = state.get(a * STRIDE + b)

    if (amp === undefined) {
      continue
    }

    coreWeight += amp[0] * amp[0] + amp[1] * amp[1]
    sumRe += amp[0] * invSq12
    sumIm += amp[1] * invSq12
  }

  const sWeight = sumRe * sumRe + sumIm * sumIm

  return {
    coreWeight,
    sWaveFraction: coreWeight > 0 ? sWeight / coreWeight : 0,
    phaseRad: Math.atan2(sumIm, sumRe),
  }
}

export function ballClosureByRadius(
  tables: Ball2LoveTables,
  state: TwoLoveState,
  maxRadius: number,
): Closure {
  const dist = tables.distance
  const terms = twoLoveToBallTerms(state)

  return fastBallClosure(terms, slot => dist[Math.floor(slot / SLOTS)]! <= maxRadius)
}

export function line0ClosureByRadius(
  tables: Ball2LoveTables,
  state: TwoLoveState,
  maxRadius: number,
): Closure {
  const f = LINE_FIRSTS[0]!
  const s = LINE_SECONDS[0]!
  const docks = new Set<number>([0])

  for (const dir of [f, s]) {
    let cur = 0

    for (let step = 1; step <= maxRadius; step++) {
      const next = tables.neighbourTable[cur * SLOTS + dir]!

      if (next < 0) {
        break
      }

      docks.add(next)
      cur = next
    }
  }

  const terms = twoLoveToBallTerms(state)

  return fastBallClosure(terms, slot => docks.has(Math.floor(slot / SLOTS)))
}

// ---- Part B: fast L = 32, nMax = 5 sparse error-boundary bath survival wrapper ----

export type BathArmSummary = {
  readonly arm: Arm
  readonly F0: number
  readonly FEnd: number
  readonly REnd: number
  readonly RupEnd: number
  readonly RAfter1: number
  readonly RAfter2: number
  readonly lovesEnd: number
  readonly entered: number
  readonly exported: number
  readonly outflowMinusArrivals: number
  readonly broken: number
  readonly trunc: number
  readonly cap: number
  readonly peakWeightN5: number
  readonly weightN3End: number
  readonly weightN5End: number
  readonly traceOff: number
  readonly mergeOff: number
  readonly maxColumns: number
  readonly seconds: number
  readonly result: RunResult
}

export type FastBathCheckResult = {
  readonly L: number
  readonly d: number
  readonly nMax: number
  readonly box: number
  readonly beats: number
  readonly arrivals: readonly Arrival[]
  readonly levelOff: number
  readonly setupSeconds: number
  readonly arms: {
    readonly boundary: BathArmSummary
    readonly swap: BathArmSummary
    readonly none: BathArmSummary
  }
  readonly totalSeconds: number
}

const RECORDED_LEVEL_ENERGY = 0.33001851839229945
const FMAX_BOUND = 10

export function runFastBathSurvivalCheck(input?: {
  beats?: number
  box?: number
  arrivals?: readonly Arrival[]
  cap?: readonly number[]
  keep?: readonly number[]
  log?: (what: string) => void
}): FastBathCheckResult {
  const started = Date.now()
  const L = 32
  const d = 8
  const nMax = 5
  const readWindow = 7
  const box = input?.box ?? 8
  const beats = input?.beats ?? 28
  const arrivals: readonly Arrival[] = input?.arrivals ?? [
    { beat: 16, dock: 16, label: 0 },
    { beat: 22, dock: 23, label: 1 },
  ]

  const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box, unit: 0 })
  const level = lineLightest(basis, wholeBasis(basis)).lightest
  const placed = levelPlacement(basis, level.cre, level.cim)
  const levelOff = Math.abs(level.unwrapped - RECORDED_LEVEL_ENERGY)
  const fit = fitRing(placed, L).kept
  const start = sparseLineStart({ L, closed: true, W: L, placed: fit, bath: [], lift: false, offset: 0 }).amp
  const reader = lineReader(placed, L, readWindow, true)
  const setupSeconds = (Date.now() - started) / 1000

  const b1 = arrivals[0]!.beat
  const b2 = arrivals[1]!.beat
  const readAt = [...new Set([0, 4, b1, b1 + 2, b2, b2 + 1, b2 + 4, beats])]
    .filter(t => t <= beats)
    .sort((a, b) => a - b)

  const cap = input?.cap ?? [0, 0, 16, 28, 14, 6]
  const keep = input?.keep ?? [0, 0, 8, 14, 7, 3]
  const logFn = input?.log ?? (() => {})

  const runArm = (arm: Arm): BathArmSummary => {
    const res = runSparseBoundary(
      {
        L,
        d,
        nMax,
        arm,
        arrivals,
        beats,
        cap,
        keep,
        floor: 1e-12,
        readAt,
        tvAt: [],
        tvWindow: 4,
        stream: true,
        dropTol: 1e-30,
      },
      start,
      reader,
      logFn,
    )
    const r0 = res.readings.find(r => r.beat === 0)!
    const rEnd = res.readings[res.readings.length - 1]!
    const rAfter1 = res.readings.find(r => r.beat === b1 + 2) ?? rEnd
    const rAfter2 = res.readings.find(r => r.beat === b2 + 1) ?? rEnd
    let peakWeightN5 = 0

    for (const r of res.readings) {
      const w5 = r.weightBy[5] ?? 0

      if (w5 > peakWeightN5) {
        peakWeightN5 = w5
      }
    }

    return {
      arm,
      F0: r0.F,
      FEnd: rEnd.F,
      REnd: rEnd.F / r0.F,
      RupEnd: (rEnd.F + FMAX_BOUND * (rEnd.trunc + rEnd.cap) + rEnd.broken) / r0.F,
      RAfter1: rAfter1.F / r0.F,
      RAfter2: rAfter2.F / r0.F,
      lovesEnd: rEnd.loves,
      entered: rEnd.entered,
      exported: rEnd.exported,
      outflowMinusArrivals: rEnd.exported - rEnd.entered,
      broken: rEnd.broken,
      trunc: rEnd.trunc,
      cap: rEnd.cap,
      peakWeightN5,
      weightN3End: rEnd.weightBy[3] ?? 0,
      weightN5End: rEnd.weightBy[5] ?? 0,
      traceOff: res.traceOff,
      mergeOff: res.mergeOff,
      maxColumns: res.maxColumns,
      seconds: res.seconds,
      result: res,
    }
  }

  const boundary = runArm('boundary')
  const swap = runArm('swap')
  const none = runArm('none')

  return {
    L,
    d,
    nMax,
    box,
    beats,
    arrivals,
    levelOff,
    setupSeconds,
    arms: { boundary, swap, none },
    totalSeconds: (Date.now() - started) / 1000,
  }
}
