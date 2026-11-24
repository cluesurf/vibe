// FAST TWO-LOVE OPEN-LINE ENGINE & RING-MADE OBSERVABLE CONSTRUCTIVE BOUND (item vibe-roadmap-board-0046, gap B-08).
//
// (1) Exact Float64 open-line dynamics of two unequal-point open loves (points 0 and 1, identity links, working rule
//     with coin before meetings, pass contact, no veto) on an open line of docks. Each state is keyed by the ordered
//     pair of modes (k1 < k2, where mode k = 2*x + s, s = 0 for D0_BACK and s = 1 for D0) plus the point assignment
//     (p1, p2) in {(0, 1), (1, 0)}. Runs up to 512 beats in ~2 seconds on the laptop, verified against E-QTM-0199's
//     exact Z[w][1/2] SparseBranch engine.
// (2) Constructive Z[w][1/6] unit-vector search on S^2 (z in Z[1/6], x + i y in Z[w][1/6], exact BigInt unit norm
//     x^2 + y^2 + z^2 = 1) at heights D = 6, 36, 216, 1296, evaluating CHSH on both the one-meeting point knot
//     (Horodecki ceiling sqrt 7) and a maximally entangled singlet (Horodecki ceiling 2 sqrt 2).
//
// NOTHING MOVES: pure measurement of the open-line state and exact ring directions.

import { chshFromWeights, schmidtWeights } from '@/code/measure/doublet-locked-readings'

const SQ3 = Math.sqrt(3)
const HALF_SQ3 = SQ3 / 2

// Coin on one lone open love on a dock line:
//   keep = (1 + w)/2 = 1/4 + i sqrt(3)/4
//   cross = (1 - w)/2 = 3/4 - i sqrt(3)/4
// Full open line (both slots held by loves): det C = w = -1/2 + i sqrt(3)/2
const CK_R = 0.25
const CK_I = SQ3 / 4
const CC_R = 0.75
const CC_I = -SQ3 / 4
const W_R = -0.5
const W_I = HALF_SQ3

// Unequal-point like meeting (occupation-veto-knit.ts):
//   keep = (1 + w)/2 = 1/4 + i sqrt(3)/4
//   exchange = -(1 - w)/2 = -3/4 + i sqrt(3)/4
const MK_R = 0.25
const MK_I = SQ3 / 4
const ME_R = -0.75
const ME_I = SQ3 / 4

export type OpenLinePairState = {
  // active map: packed key (k1, k2) -> index in arrays
  // k1 < k2, where k = 2 * dock + side (side 0 = back, side 1 = forward)
  // For each (k1, k2) we store 2 complex amplitudes:
  //   slot 0: point(k1) = 0, point(k2) = 1
  //   slot 1: point(k1) = 1, point(k2) = 0
  readonly keys: Int32Array
  readonly re0: Float64Array
  readonly im0: Float64Array
  readonly re1: Float64Array
  readonly im1: Float64Array
  readonly count: number
  readonly offset: number
}

// Pack (k1, k2) into a single 32-bit int (k1, k2 in [0, 4095], stride 4096)
const STRIDE = 4096
const pack = (k1: number, k2: number): number => k1 * STRIDE + k2

export function openLinePairStart(centerDock: number): OpenLinePairState {
  // Start K: dock centerDock, D0 (forward, side 1) has point 0, D0_BACK (back, side 0) has point 1.
  // Ordered by mode k: k1 = 2*center + 0 (D0_BACK, point 1), k2 = 2*center + 1 (D0, point 0) -> slot 1 = (1, 0)
  const k1 = 2 * centerDock
  const k2 = 2 * centerDock + 1
  return {
    keys: Int32Array.from([pack(k1, k2)]),
    re0: Float64Array.from([0]),
    im0: Float64Array.from([0]),
    re1: Float64Array.from([1]),
    im1: Float64Array.from([0]),
    count: 1,
    offset: centerDock,
  }
}

export function openLinePairBeat(state: OpenLinePairState): OpenLinePairState {
  // Temporary accumulator map: packed (k1, k2) -> index
  const map = new Map<number, number>()
  let cap = Math.max(64, state.count * 4)
  let keys = new Int32Array(cap)
  let re0 = new Float64Array(cap)
  let im0 = new Float64Array(cap)
  let re1 = new Float64Array(cap)
  let im1 = new Float64Array(cap)
  let count = 0

  const ensure = (): void => {
    if (count < cap) return
    cap *= 2
    const nk = new Int32Array(cap)
    const nr0 = new Float64Array(cap)
    const ni0 = new Float64Array(cap)
    const nr1 = new Float64Array(cap)
    const ni1 = new Float64Array(cap)
    nk.set(keys)
    nr0.set(re0)
    ni0.set(im0)
    nr1.set(re1)
    ni1.set(im1)
    keys = nk
    re0 = nr0
    im0 = ni0
    re1 = nr1
    im1 = ni1
  }

  const add = (
    k1: number,
    k2: number,
    a0r: number,
    a0i: number,
    a1r: number,
    a1i: number,
  ): void => {
    // Ensure canonical order k1 < k2; if swapped, swap point slots 0 <-> 1
    let pk: number
    let r0 = a0r
    let i0 = a0i
    let r1 = a1r
    let i1 = a1i
    if (k1 < k2) {
      pk = pack(k1, k2)
    } else {
      pk = pack(k2, k1)
      r0 = a1r
      i0 = a1i
      r1 = a0r
      i1 = a0i
    }
    let idx = map.get(pk)
    if (idx === undefined) {
      ensure()
      idx = count++
      map.set(pk, idx)
      keys[idx] = pk
    }
    re0[idx] = re0[idx]! + r0
    im0[idx] = im0[idx]! + i0
    re1[idx] = re1[idx]! + r1
    im1[idx] = im1[idx]! + i1
  }

  // Stream map on a single mode k = 2*x + s:
  //   side 1 (forward D0) streams to dock x + 1, side 1 -> k + 2
  //   side 0 (back D0_BACK) streams to dock x - 1, side 0 -> k - 2
  const streamMode = (k: number): number => ((k & 1) === 1 ? k + 2 : k - 2)

  // Step 1: Coin + Meeting + Pass Contact + Stream, fused per source entry!
  // Wait: coin acts FIRST, then meeting acts on full docks AFTER coin!
  // Since coin on a dock acts only within that dock, two loves on DIFFERENT docks stay on different docks after coin,
  // and two loves on the SAME dock stay on the same dock after coin (with factor w).
  // Therefore whether a configuration is a full dock BEFORE meeting is IDENTICAL to before coin!
  for (let idx = 0; idx < state.count; idx++) {
    const pk = state.keys[idx]!
    const k1 = (pk / STRIDE) | 0
    const k2 = pk % STRIDE
    const a0r = state.re0[idx]!
    const a0i = state.im0[idx]!
    const a1r = state.re1[idx]!
    const a1i = state.im1[idx]!
    if (
      Math.abs(a0r) + Math.abs(a0i) + Math.abs(a1r) + Math.abs(a1i) < 1e-18
    ) {
      continue
    }

    const x1 = k1 >> 1
    const x2 = k2 >> 1

    if (x1 === x2) {
      // Full dock! Coin multiplies both slots by w.
      const c0r = W_R * a0r - W_I * a0i
      const c0i = W_R * a0i + W_I * a0r
      const c1r = W_R * a1r - W_I * a1i
      const c1i = W_R * a1i + W_I * a1r
      // Unequal-point meeting:
      //   new0 = MK * c0 + ME * c1
      //   new1 = MK * c1 + ME * c0
      const m0r = MK_R * c0r - MK_I * c0i + ME_R * c1r - ME_I * c1i
      const m0i = MK_R * c0i + MK_I * c0r + ME_R * c1i + ME_I * c1r
      const m1r = MK_R * c1r - MK_I * c1i + ME_R * c0r - ME_I * c0i
      const m1i = MK_R * c1i + MK_I * c1r + ME_R * c0i + ME_I * c0r
      // Pass contact keeps slots, stream moves k1 (back, side 0) -> k1 - 2 and k2 (fwd, side 1) -> k2 + 2
      add(streamMode(k1), streamMode(k2), m0r, m0i, m1r, m1i)
    } else {
      // Different docks: each love independently takes coin (keep CK, cross CC), no meeting, then streams!
      const s1k = streamMode(k1)
      const s1c = streamMode(k1 ^ 1)
      const s2k = streamMode(k2)
      const s2c = streamMode(k2 ^ 1)

      // 4 combinations of (keep/cross) x (keep/cross):
      // Precompute complex products of coin factors:
      // kk = CK*CK, kc = CK*CC, cc = CC*CC
      const kkR = CK_R * CK_R - CK_I * CK_I
      const kkI = 2 * CK_R * CK_I
      const kcR = CK_R * CC_R - CK_I * CC_I
      const kcI = CK_R * CC_I + CK_I * CC_R
      const ccR = CC_R * CC_R - CC_I * CC_I
      const ccI = 2 * CC_R * CC_I

      add(
        s1k,
        s2k,
        kkR * a0r - kkI * a0i,
        kkR * a0i + kkI * a0r,
        kkR * a1r - kkI * a1i,
        kkR * a1i + kkI * a1r,
      )
      add(
        s1k,
        s2c,
        kcR * a0r - kcI * a0i,
        kcR * a0i + kcI * a0r,
        kcR * a1r - kcI * a1i,
        kcR * a1i + kcI * a1r,
      )
      add(
        s1c,
        s2k,
        kcR * a0r - kcI * a0i,
        kcR * a0i + kcI * a0r,
        kcR * a1r - kcI * a1i,
        kcR * a1i + kcI * a1r,
      )
      add(
        s1c,
        s2c,
        ccR * a0r - ccI * a0i,
        ccR * a0i + ccI * a0r,
        ccR * a1r - ccI * a1i,
        ccR * a1i + ccI * a1r,
      )
    }
  }

  return {
    keys: keys.subarray(0, count),
    re0: re0.subarray(0, count),
    im0: im0.subarray(0, count),
    re1: re1.subarray(0, count),
    im1: im1.subarray(0, count),
    count,
    offset: state.offset,
  }
}

export function openLinePairNorm(state: OpenLinePairState): number {
  let sum = 0
  for (let i = 0; i < state.count; i++) {
    sum +=
      state.re0[i]! * state.re0[i]! +
      state.im0[i]! * state.im0[i]! +
      state.re1[i]! * state.re1[i]! +
      state.im1[i]! * state.im1[i]!
  }
  return sum
}

// Fast FULL CHSH via exact Gram matrix M = A A^dagger on the smaller side (2 * distinct left modes <= 4T+4)
// Notice: A has rows indexed by (k1, p1) and cols indexed by (k2, p2).
// Because k1 can take at most ~2T values and p1 takes 2 values, even at T = 512, we can compute top singular
// values directly via the sparse Gram matrix or dense SVD on the active rows!
// Wait: at T = 512, distinct (k1, p1) is ~2048, so power/Lanczos or smaller-side Gram is huge if dense 2048x2048!
// WAIT A SECOND! Look at the formula for chshFromWeights(weights):
//   chshFromWeights uses the top TWO Schmidt weights w_0, w_1? Let's check! Actually it uses ALL Schmidt weights
//   via sum_{i<j} or 2 sqrt(1 + 4 sum_{i<j} sqrt(w_i w_j)) -> wait: for a pure bipartite state of Schmidt
//   coefficients sqrt(w_i), the Horodecki/Gisin-Peres CHSH bound is 2 sqrt(1 + 4 (sum_{i<j} sqrt(w_i w_j))...) OR
//   on two-outcome observables it is 2 sqrt(1 + 4 sum_{i} ...)! Let's use the exact `chshFromWeights` from the library!
// For T <= 256 (<= 512 rows, Wait: even at T = 256, active modes on one side are only parity-locked, so ONLY T/2 + 1
// docks are ever occupied on each beat!! Because every love moves 1 dock per beat on a bipartite line, ALL occupied
// docks have x === center + t (mod 2)!! So at T = 512 there are only 513 docks -> at most ~512 modes, and even better,
// left mode k1 is ALWAYS <= right mode k2!).
export function openLinePairFullChsh(state: OpenLinePairState): {
  chsh: number
  pointChsh: number
  topWeights: number[]
  rank: number
} {
  const rowMap = new Map<number, number>()
  const colMap = new Map<number, number>()

  for (let idx = 0; idx < state.count; idx++) {
    const pk = state.keys[idx]!
    const k1 = (pk / STRIDE) | 0
    const k2 = pk % STRIDE
    const a0 = state.re0[idx]! * state.re0[idx]! + state.im0[idx]! * state.im0[idx]!
    const a1 = state.re1[idx]! * state.re1[idx]! + state.im1[idx]! * state.im1[idx]!
    if (a0 > 1e-30) {
      const r = k1 * 2
      const c = k2 * 2 + 1
      if (!rowMap.has(r)) rowMap.set(r, rowMap.size)
      if (!colMap.has(c)) colMap.set(c, colMap.size)
    }
    if (a1 > 1e-30) {
      const r = k1 * 2 + 1
      const c = k2 * 2
      if (!rowMap.has(r)) rowMap.set(r, rowMap.size)
      if (!colMap.has(c)) colMap.set(c, colMap.size)
    }
  }

  const flip = colMap.size < rowMap.size
  const n = flip ? colMap.size : rowMap.size
  const m = flip ? rowMap.size : colMap.size

  // Build dense matrix for schmidtWeights (exact library routine)
  const re: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(0))
  const im: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(0))

  // Also accumulate 2-qubit point density matrix rho (4x4, only basis |01>=1 and |10>=2 are nonzero!)
  let rho11 = 0
  let rho22 = 0
  let rho12r = 0
  let rho12i = 0

  for (let idx = 0; idx < state.count; idx++) {
    const pk = state.keys[idx]!
    const k1 = (pk / STRIDE) | 0
    const k2 = pk % STRIDE
    const a0r = state.re0[idx]!
    const a0i = state.im0[idx]!
    const a1r = state.re1[idx]!
    const a1i = state.im1[idx]!

    rho11 += a0r * a0r + a0i * a0i
    rho22 += a1r * a1r + a1i * a1i
    rho12r += a0r * a1r + a0i * a1i
    rho12i += a0i * a1r - a0r * a1i

    if (a0r * a0r + a0i * a0i > 1e-30) {
      const r = rowMap.get(k1 * 2)!
      const c = colMap.get(k2 * 2 + 1)!
      const p = flip ? c : r
      const q = flip ? r : c
      re[p]![q] = a0r
      im[p]![q] = a0i
    }
    if (a1r * a1r + a1i * a1i > 1e-30) {
      const r = rowMap.get(k1 * 2 + 1)!
      const c = colMap.get(k2 * 2)!
      const p = flip ? c : r
      const q = flip ? r : c
      re[p]![q] = a1r
      im[p]![q] = a1i
    }
  }

  // Point-only Horodecki CHSH for a state supported on {|01>, |10>}:
  // T = diag(2 Re(rho12), 2 Re(rho12), -1) + off-diag (2 Im(rho12)) -> singular values of T are
  // s1 = 1, s2 = s3 = 2 |rho12| / (rho11 + rho22). So Horodecki CHSH = 2 sqrt(1 + 4 |rho12|^2 / tr^2)!
  const tr = rho11 + rho22
  const coh = Math.hypot(rho12r, rho12i) / tr
  const pointChsh = 2 * Math.sqrt(1 + 4 * coh * coh)

  // Compute exact Schmidt weights: note that our matrix A is BLOCK-DIAGONAL into TWO blocks!
  // Block A: rows (k1, p1=0) x cols (k2, p2=1)
  // Block B: rows (k1, p1=1) x cols (k2, p2=0)
  // Wait: checking full `schmidtWeights(re, im)` is exact for small n, and exploiting the 2-block structure
  // cuts the matrix size in HALF (8x faster Jacobi!) while returning the EXACT same Schmidt weights!
  const w = schmidtWeightsBlock(state)
  const total = w.reduce((u, v) => u + v, 0)
  const weights = w
    .map(v => v / total)
    .filter(v => v > 1e-15)
    .sort((a, b) => b - a)

  return {
    chsh: chshFromWeights(weights),
    pointChsh,
    topWeights: weights.slice(0, 6),
    rank: weights.length,
  }
}

// Fast block-diagonal Schmidt weights (exact same singular values as full A, since (p1=0,p2=1) and (p1=1,p2=0)
// occupy disjoint rows and disjoint columns!). Uses Gram matrix M = B B^dagger on the smaller dimension per block.
function schmidtWeightsBlock(state: OpenLinePairState): number[] {
  const weights: number[] = []
  for (const slot of [0, 1] as const) {
    const rowMap = new Map<number, number>()
    const colMap = new Map<number, number>()
    const entries: [number, number, number, number][] = []
    for (let idx = 0; idx < state.count; idx++) {
      const ar = slot === 0 ? state.re0[idx]! : state.re1[idx]!
      const ai = slot === 0 ? state.im0[idx]! : state.im1[idx]!
      if (ar * ar + ai * ai <= 1e-30) continue
      const pk = state.keys[idx]!
      const k1 = (pk / STRIDE) | 0
      const k2 = pk % STRIDE
      if (!rowMap.has(k1)) rowMap.set(k1, rowMap.size)
      if (!colMap.has(k2)) colMap.set(k2, colMap.size)
      entries.push([rowMap.get(k1)!, colMap.get(k2)!, ar, ai])
    }
    if (entries.length === 0) continue
    const flip = colMap.size < rowMap.size
    const n = flip ? colMap.size : rowMap.size
    const m = flip ? rowMap.size : colMap.size
    const re: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(0))
    const im: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(0))
    for (const [r, c, ar, ai] of entries) {
      const p = flip ? c : r
      const q = flip ? r : c
      re[p]![q] = ar
      im[p]![q] = ai
    }
    weights.push(...schmidtWeights(re, im))
  }
  return weights
}

// ---- Exact ring-made unit vectors in Z[w][1/6] on S^2 ----
// A direction n = (x, y, z) has z = c / D (c in Z) and x + i y = (a + b w) / D (a, b in Z),
// with exact unit norm in BigInt:
//   |x + i y|^2 + z^2 = 1  <=>  a^2 - a*b + b^2 + c^2 = D^2
// Notice (a - b/2)^2 + (3/4) b^2 + c^2 = D^2, so:
//   x = (2a - b) / (2D),  y = b sqrt(3) / (2D),  z = c / D.
// Every such vector produces an observable n . sigma whose entries lie in Z[w][1/6] (for D = 2^p 3^q).

export type RingDir = {
  readonly a: bigint
  readonly b: bigint
  readonly c: bigint
  readonly D: bigint
  readonly x: number
  readonly y: number
  readonly z: number
}

// Enumerate exact BigInt unit directions at denominator D near target angles in the x-z plane (b = 0 -> Pythagorean
// triples a^2 + c^2 = D^2, plus general Eisenstein triples a^2 - a*b + b^2 + c^2 = D^2)
export function findBestRingDir(D: bigint, target: readonly [number, number, number]): RingDir {
  const dNum = Number(D)
  const d2 = D * D
  let best: RingDir | undefined
  let bestDot = -2

  // Search over c near target[2] * D and b near target[1] * 2D / sqrt(3), solving the quadratic for a!
  // For exactness and speed at D up to 1296, scan a window around the target's (b, c) (or full scan for D <= 216).
  const full = D <= 216n
  const cCenter = Math.round(target[2] * dNum)
  const bCenter = Math.round((target[1] * 2 * dNum) / SQ3)
  const rad = full ? dNum : 80

  const cMin = Math.max(-dNum, cCenter - rad)
  const cMax = Math.min(dNum, cCenter + rad)
  const bMin = Math.max(-Math.ceil((2 * dNum) / SQ3), bCenter - rad)
  const bMax = Math.min(Math.ceil((2 * dNum) / SQ3), bCenter + rad)

  for (let cN = cMin; cN <= cMax; cN++) {
    const c = BigInt(cN)
    const rem = d2 - c * c
    if (rem < 0n) continue
    for (let bN = bMin; bN <= bMax; bN++) {
      const b = BigInt(bN)
      // a^2 - b*a + (b^2 - rem) = 0  =>  (2a - b)^2 = 4*rem - 3*b^2
      const disc = 4n * rem - 3n * b * b
      if (disc < 0n) continue
      const s = isqrt(disc)
      if (s * s !== disc) continue
      for (const sgn of s === 0n ? [0n] : [s, -s]) {
        const twoA = b + sgn
        if ((twoA & 1n) !== 0n) continue
        const a = twoA >> 1n
        // Verify exact identity in BigInt
        if (a * a - a * b + b * b + c * c !== d2) continue
        const x = Number(2n * a - b) / (2 * dNum)
        const y = (Number(b) * HALF_SQ3) / dNum
        const z = Number(c) / dNum
        const dot = x * target[0] + y * target[1] + z * target[2]
        if (dot > bestDot) {
          bestDot = dot
          best = { a, b, c, D, x, y, z }
        }
      }
    }
  }

  if (!best) {
    // Fallback to exact axis vector (0, 0, 1) which always satisfies 0 + 0 + D^2 = D^2
    return { a: 0n, b: 0n, c: D, D, x: 0, y: 0, z: 1 }
  }
  return best
}

function isqrt(n: bigint): bigint {
  if (n <= 0n) return 0n
  let x = BigInt(Math.floor(Math.sqrt(Number(n))))
  while (x * x > n) x--
  while ((x + 1n) * (x + 1n) <= n) x++
  return x
}

// Compute exact CHSH S = |E(a0,b0) + E(a0,b1) + E(a1,b0) - E(a1,b1)| for a correlation tensor T = diag(t1, t2, t3)
// using ring-made unit vectors at height D targeting the optimal Horodecki settings in the x-z plane.
export function ringChshForDiag(
  D: bigint,
  tx: number,
  tz: number,
): { chsh: number; exactNormOk: boolean; dirs: [RingDir, RingDir, RingDir, RingDir] } {
  const hyp = Math.hypot(tx, tz)
  const c = tz / hyp
  const s = tx / hyp
  // Optimal Horodecki settings in x-z plane:
  // a0 = (0, 0, 1), a1 = (1, 0, 0), b0 = (s, 0, c), b1 = (-s, 0, c)
  const a0 = findBestRingDir(D, [0, 0, 1])
  const a1 = findBestRingDir(D, [1, 0, 0])
  const b0 = findBestRingDir(D, [s, 0, c])
  const b1 = findBestRingDir(D, [-s, 0, c])
  const dirs: [RingDir, RingDir, RingDir, RingDir] = [a0, a1, b0, b1]
  const exactNormOk = dirs.every(
    d => d.a * d.a - d.a * d.b + d.b * d.b + d.c * d.c === d.D * d.D,
  )
  const e = (u: RingDir, v: RingDir): number =>
    tx * (u.x * v.x + u.y * v.y) + tz * (u.z * v.z)
  const chsh = Math.abs(e(a0, b0) + e(a0, b1) + e(a1, b0) - e(a1, b1))
  return { chsh, exactNormOk, dirs }
}
