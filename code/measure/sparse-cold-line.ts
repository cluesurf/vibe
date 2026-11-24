// SPARSE COLD LINE (optimization #2 for cold-line / error-boundary).
//
// On-the-fly sparse state representation and beat/reading engine for B1's cold line (code/measure/cold-line).
// Stores ONLY nonzero configurations as parallel typed arrays (lo, hi, cut, re, im), keyed by packed BigInt
// `(BigInt(hi >>> 0) << 34n) | (BigInt(lo >>> 0) << 2n) | BigInt(cut & 3)`, without pre-allocating C(2L, n)
// sector tables.
//
// Exact semantics match code/measure/cold-line:
//   - drift-cost phase zeta_14^(-links) and full-dock phase w^2 (a = 28 of 42), constant across each dock-occupancy
//     group;
//   - half/full coin on every single-love dock, computed via an in-cache 2^m butterfly per canonical dock group;
//   - fermion stream sign and cyclic/open stream;
//   - bound-trio reading F = sum_X <B_X^dag B_X> over occupied configurations only.

import {
  FULL_COIN,
  HALF_COIN,
  mergeSign,
  modesOf,
  popcount,
  rankOf,
  type Amp,
  type Coin,
  type LineEngine,
  type LineReader,
  type Mask,
} from '@/code/measure/cold-line'
import type { Placed } from '@/code/measure/held-cluster'

const TURN = 42
const COS = Float64Array.from({ length: TURN }, (_, a) => Math.cos((2 * Math.PI * a) / TURN))
const SIN = Float64Array.from({ length: TURN }, (_, a) => Math.sin((2 * Math.PI * a) / TURN))
const MAX_SINGLE = 10

export type SparseAmp = {
  readonly lo: Int32Array
  readonly hi: Int32Array
  readonly cut: Uint8Array
  readonly re: Float64Array
  readonly im: Float64Array
  readonly size: number
}

export const packKey = (lo: number, hi: number, cut: number): bigint =>
  (BigInt(hi >>> 0) << 34n) | (BigInt(lo >>> 0) << 2n) | BigInt(cut & 3)

export const packMaskKey = (lo: number, hi: number): bigint =>
  (BigInt(hi >>> 0) << 32n) | BigInt(lo >>> 0)

export const emptySparseAmp = (): SparseAmp => ({
  lo: new Int32Array(0),
  hi: new Int32Array(0),
  cut: new Uint8Array(0),
  re: new Float64Array(0),
  im: new Float64Array(0),
  size: 0,
})

export const cloneSparseAmp = (a: SparseAmp): SparseAmp => ({
  lo: Int32Array.from(a.lo),
  hi: Int32Array.from(a.hi),
  cut: Uint8Array.from(a.cut),
  re: Float64Array.from(a.re),
  im: Float64Array.from(a.im),
  size: a.size,
})

// memory footprint of one SparseAmp's typed arrays in bytes (4 + 4 + 1 + 8 + 8 = 25 B / entry)
export const sparseBytes = (a: SparseAmp): number => a.size * 25

export function sparseWeightOf(a: SparseAmp): number {
  const { re, im, size } = a
  let w = 0

  for (let i = 0; i < size; i++) {
    const r = re[i]!
    const m = im[i]!

    w += r * r + m * m
  }

  return w
}

export const sparseNormOf = sparseWeightOf

export function sparseInner(a: SparseAmp, b: SparseAmp): [number, number] {
  if (a.size === 0 || b.size === 0) {
    return [0, 0]
  }

  const small = a.size <= b.size ? a : b
  const large = a.size <= b.size ? b : a
  const flipped = small === b
  const index = new Map<bigint, number>()

  for (let i = 0; i < small.size; i++) {
    index.set(packKey(small.lo[i]!, small.hi[i]!, small.cut[i]!), i)
  }

  let sr = 0
  let si = 0

  for (let j = 0; j < large.size; j++) {
    const i = index.get(packKey(large.lo[j]!, large.hi[j]!, large.cut[j]!))

    if (i === undefined) {
      continue
    }

    const ar = flipped ? large.re[j]! : small.re[i]!
    const ai = flipped ? large.im[j]! : small.im[i]!
    const br = flipped ? small.re[i]! : large.re[j]!
    const bi = flipped ? small.im[i]! : large.im[j]!

    sr += ar * br + ai * bi
    si += ar * bi - ai * br
  }

  return [sr, si]
}

export function sparseFromDense(e: LineEngine, a: Amp, dropTol = 0): SparseAmp {
  const { sp, cuts } = e
  const M = sp.count
  let count = 0

  for (let u = 0; u < a.re.length; u++) {
    const r = a.re[u]!
    const m = a.im[u]!

    if (dropTol === 0 ? r !== 0 || m !== 0 : r * r + m * m > dropTol) {
      count++
    }
  }

  const lo = new Int32Array(count)
  const hi = new Int32Array(count)
  const cut = new Uint8Array(count)
  const re = new Float64Array(count)
  const im = new Float64Array(count)
  let k = 0

  for (let r = 0; r < M; r++) {
    const rlo = sp.lo[r]!
    const rhi = sp.hi[r]!

    for (let c = 0; c < cuts; c++) {
      const u = r * cuts + c
      const ar = a.re[u]!
      const ai = a.im[u]!

      if (dropTol === 0 ? ar === 0 && ai === 0 : ar * ar + ai * ai <= dropTol) {
        continue
      }

      lo[k] = rlo
      hi[k] = rhi
      cut[k] = c
      re[k] = ar
      im[k] = ai
      k++
    }
  }

  return { lo, hi, cut, re, im, size: count }
}

export function denseFromSparse(e: LineEngine, a: SparseAmp): Amp {
  const { sp, cuts } = e
  const re = new Float64Array(sp.count * cuts)
  const im = new Float64Array(sp.count * cuts)

  for (let i = 0; i < a.size; i++) {
    const u = rankOf(sp.binom, a.lo[i]!, a.hi[i]!) * cuts + a.cut[i]!

    re[u] = a.re[i]!
    im[u] = a.im[i]!
  }

  return { re, im }
}

export function sparseMaxDifference(a: SparseAmp, b: SparseAmp): number {
  const mapA = new Map<bigint, number>()

  for (let i = 0; i < a.size; i++) {
    mapA.set(packKey(a.lo[i]!, a.hi[i]!, a.cut[i]!), i)
  }

  let worst = 0

  for (let j = 0; j < b.size; j++) {
    const k = packKey(b.lo[j]!, b.hi[j]!, b.cut[j]!)
    const i = mapA.get(k)

    if (i === undefined) {
      worst = Math.max(worst, Math.abs(b.re[j]!), Math.abs(b.im[j]!))
    } else {
      worst = Math.max(worst, Math.abs(a.re[i]! - b.re[j]!), Math.abs(a.im[i]! - b.im[j]!))
      mapA.delete(k)
    }
  }

  for (const i of mapA.values()) {
    worst = Math.max(worst, Math.abs(a.re[i]!), Math.abs(a.im[i]!))
  }

  return worst
}

// ---- bit helpers ----

function below(lo: number, hi: number, m: number): number {
  if (m <= 0) {
    return 0
  }

  if (m < 32) {
    return popcount(lo & ((1 << m) - 1))
  }

  if (m === 32) {
    return popcount(lo)
  }

  if (m >= 64) {
    return popcount(lo) + popcount(hi)
  }

  return popcount(lo) + popcount(hi & ((1 << (m - 32)) - 1))
}

function extract(lo: number, hi: number, s: number, len: number): number {
  let v: number

  if (s === 0) {
    v = lo
  } else if (s >= 32) {
    v = hi >>> (s - 32)
  } else {
    v = (lo >>> s) | (hi << (32 - s))
  }

  return v & ((1 << len) - 1)
}

function cyclic(lo: number, hi: number, modes: number, s: number, len: number): number {
  if (s + len <= modes) {
    return extract(lo, hi, s, len)
  }

  const first = modes - s

  return extract(lo, hi, s, first) | (extract(lo, hi, 0, len - first) << first)
}

const overlaps = (a: Mask, b: Mask): boolean => (a[0] & b[0]) !== 0 || (a[1] & b[1]) !== 0

// ---- sparse beat (reusable scratch buffers, single-threaded deterministic) ----

const BUF_MAX = 1 << MAX_SINGLE
const bufRe = new Float64Array(BUF_MAX)
const bufIm = new Float64Array(BUF_MAX)
const singleWord = new Uint8Array(MAX_SINGLE)
const singleFlip = new Int32Array(MAX_SINGLE)
const singleFront = new Int32Array(MAX_SINGLE)
const streamNbs = new Int32Array(32)

function applyCoinButterfly(m: number, coin: Coin, adjoint: boolean): void {
  const kr = coin[0][0]
  const ki = adjoint ? -coin[0][1] : coin[0][1]
  const cr = coin[1][0]
  const ci = adjoint ? -coin[1][1] : coin[1][1]
  const total = 1 << m

  for (let j = 0; j < m; j++) {
    const step = 1 << j
    const stride = step << 1

    for (let base = 0; base < total; base += stride) {
      for (let off = 0; off < step; off++) {
        const v = base + off
        const u = v + step
        const ar = bufRe[u]!
        const ai = bufIm[u]!
        const br = bufRe[v]!
        const bi = bufIm[v]!

        bufRe[u] = kr * ar - ki * ai + (cr * br - ci * bi)
        bufIm[u] = kr * ai + ki * ar + (cr * bi + ci * br)
        bufRe[v] = cr * ar - ci * ai + (kr * br - ki * bi)
        bufIm[v] = cr * ai + ci * ar + (kr * bi + ki * br)
      }
    }
  }
}

function applyGroupPhase(total: number, phaseIdx: number, conjugate: boolean): void {
  if (phaseIdx === 0) {
    return
  }

  const pr = COS[phaseIdx]!
  const pi = conjugate ? -SIN[phaseIdx]! : SIN[phaseIdx]!

  for (let idx = 0; idx < total; idx++) {
    const ar = bufRe[idx]!
    const ai = bufIm[idx]!

    if (ar === 0 && ai === 0) {
      continue
    }

    bufRe[idx] = pr * ar - pi * ai
    bufIm[idx] = pr * ai + pi * ar
  }
}

export type SparseBeatResult = {
  readonly amp: SparseAmp
  readonly crossing: number
}

// One exact beat on a sparse state without pre-allocating C(2L, n) sector tables.
// Groups entries by canonical dock occupancy (which is invariant under both phase and coin), runs the exact 2^m coin
// butterfly in L1 scratch buffers, applies the group phase, and streams each surviving state directly to its unique
// target configuration.
export function sparseLineBeat(
  L: number,
  closed: boolean,
  a: SparseAmp,
  split: boolean,
  dropTol = 0,
): SparseBeatResult {
  const N = a.size

  if (N === 0) {
    return { amp: emptySparseAmp(), crossing: 0 }
  }

  const cuts = closed ? 3 : 1
  const { lo: inLo, hi: inHi, cut: inCut, re: inRe, im: inIm } = a

  // Group occupied entries by canonical dock pattern (00 -> 00, 01/10 -> 01, 11 -> 11) and cut trit.
  const next = new Int32Array(N)
  const groupHead: number[] = []
  const groupCanonLo: number[] = []
  const groupCanonHi: number[] = []
  const groupCut: number[] = []
  const groupMap = new Map<bigint, number>()

  for (let i = 0; i < N; i++) {
    const lo = inLo[i]!
    const hi = inHi[i]!
    const c = closed ? inCut[i]! : 0

    const oddLo = lo & 0xaaaaaaaa
    const evenLo = lo & 0x55555555
    const bothLo = (oddLo >>> 1) & evenLo
    const anyLo = (oddLo >>> 1) | evenLo
    const canonLo = (anyLo | (bothLo << 1)) | 0

    const oddHi = hi & 0xaaaaaaaa
    const evenHi = hi & 0x55555555
    const bothHi = (oddHi >>> 1) & evenHi
    const anyHi = (oddHi >>> 1) | evenHi
    const canonHi = (anyHi | (bothHi << 1)) | 0

    const key = packKey(canonLo, canonHi, c)
    const g = groupMap.get(key)

    if (g === undefined) {
      const id = groupHead.length

      groupMap.set(key, id)
      groupHead.push(i)
      groupCanonLo.push(canonLo)
      groupCanonHi.push(canonHi)
      groupCut.push(c)
      next[i] = -1
    } else {
      next[i] = groupHead[g]!
      groupHead[g] = i
    }
  }

  let cap = Math.max(16, Math.ceil(N * 1.25))
  let outLo = new Int32Array(cap)
  let outHi = new Int32Array(cap)
  let outCut = new Uint8Array(cap)
  let outRe = new Float64Array(cap)
  let outIm = new Float64Array(cap)
  let outSize = 0
  let crossingWeight = 0

  const grow = (): void => {
    const nextCap = cap * 2
    const nLo = new Int32Array(nextCap)
    const nHi = new Int32Array(nextCap)
    const nCut = new Uint8Array(nextCap)
    const nRe = new Float64Array(nextCap)
    const nIm = new Float64Array(nextCap)

    nLo.set(outLo)
    nHi.set(outHi)
    nCut.set(outCut)
    nRe.set(outRe)
    nIm.set(outIm)
    outLo = nLo
    outHi = nHi
    outCut = nCut
    outRe = nRe
    outIm = nIm
    cap = nextCap
  }

  for (let g = 0; g < groupHead.length; g++) {
    const canonLo = groupCanonLo[g]!
    const canonHi = groupCanonHi[g]!
    const c = groupCut[g]!

    // From canonical masks: even bits of canon are `any` (dock occupied), odd bits shifted right are `both` (full dock).
    const anyLo = canonLo & 0x55555555
    const bothLo = (canonLo >>> 1) & 0x55555555
    const singleLo = anyLo ^ bothLo

    const anyHi = canonHi & 0x55555555
    const bothHi = (canonHi >>> 1) & 0x55555555
    const singleHi = anyHi ^ bothHi

    // Compute drift-cost links and full-dock count in O(n) over occupied docks.
    let prev = 0
    let Q = 0
    let links = 0
    let full = 0
    let scan = anyLo

    while (scan !== 0) {
      const low = scan & -scan
      const x = (31 - Math.clz32(low)) >>> 1

      if (x > prev && (c + Q) % 3 !== 0) {
        links += x - prev
      }

      if ((bothLo & low) !== 0) {
        Q += 2
        full++
      } else {
        Q += 1
      }

      prev = x
      scan ^= low
    }

    scan = anyHi

    while (scan !== 0) {
      const low = scan & -scan
      const x = 16 + ((31 - Math.clz32(low)) >>> 1)

      if (x > prev && (c + Q) % 3 !== 0) {
        links += x - prev
      }

      if ((bothHi & low) !== 0) {
        Q += 2
        full++
      } else {
        Q += 1
      }

      prev = x
      scan ^= low
    }

    if (L > prev && (c + Q) % 3 !== 0) {
      links += L - prev
    }

    const phaseIdx = (((-3 * links + 28 * full) % TURN) + TURN) % TURN

    // Enumerate single-love docks in ascending order.
    let m = 0

    scan = singleLo

    while (scan !== 0) {
      const low = scan & -scan
      const bitPos = 31 - Math.clz32(low)

      singleWord[m] = 0
      singleFlip[m] = 3 << bitPos
      singleFront[m] = 1 << (bitPos + 1)
      m++
      scan ^= low
    }

    scan = singleHi

    while (scan !== 0) {
      const low = scan & -scan
      const bitPos = 31 - Math.clz32(low)

      singleWord[m] = 1
      singleFlip[m] = 3 << bitPos
      singleFront[m] = 1 << (bitPos + 1)
      m++
      scan ^= low
    }

    if (m > MAX_SINGLE) {
      throw new Error(`sparse-cold-line: ${m} single-love docks exceeds MAX_SINGLE (${MAX_SINGLE})`)
    }

    const total = 1 << m

    bufRe.fill(0, 0, total)
    bufIm.fill(0, 0, total)

    // Scatter group entries into the 2^m buffer.
    for (let i = groupHead[g]!; i !== -1; i = next[i]!) {
      const elo = inLo[i]!
      const ehi = inHi[i]!
      let idx = 0

      for (let j = 0; j < m; j++) {
        const w = singleWord[j] === 0 ? elo : ehi

        if ((w & singleFront[j]!) !== 0) {
          idx |= 1 << j
        }
      }

      bufRe[idx] = inRe[i]!
      bufIm[idx] = inIm[i]!
    }

    // Exact phase + coin matching cold-line's lineBeat.
    if (split) {
      applyCoinButterfly(m, HALF_COIN, false)
      applyGroupPhase(total, phaseIdx, false)
      applyCoinButterfly(m, HALF_COIN, false)
    } else {
      applyGroupPhase(total, phaseIdx, false)
      applyCoinButterfly(m, FULL_COIN, false)
    }

    // Stream every surviving entry directly into output (stream is a bijection, so all targets are unique).
    for (let idx = 0; idx < total; idx++) {
      const re = bufRe[idx]!
      const im = bufIm[idx]!

      if (dropTol === 0 ? re === 0 && im === 0 : re * re + im * im <= dropTol) {
        continue
      }

      let slo = canonLo
      let shi = canonHi

      for (let j = 0; j < m; j++) {
        if ((idx & (1 << j)) !== 0) {
          if (singleWord[j] === 0) {
            slo ^= singleFlip[j]!
          } else {
            shi ^= singleFlip[j]!
          }
        }
      }

      // Stream ascending set bits of (slo, shi).
      let alo = 0
      let ahi = 0
      let inversions = 0
      let dcut = 0
      let crossing = 0
      let placed = 0

      let w = slo

      while (w !== 0) {
        const low = w & -w
        const b = 31 - Math.clz32(low)
        const x = b >>> 1
        const forward = (b & 1) === 1
        let y: number

        if (forward) {
          if (x === L - 1) {
            y = 0
            dcut--
            crossing = 1
          } else {
            y = x + 1
          }
        } else {
          if (x === 0) {
            y = L - 1
            dcut++
            crossing = 1
          } else {
            y = x - 1
          }
        }

        const nb = forward ? 2 * y + 1 : 2 * y

        for (let k = 0; k < placed; k++) {
          if (streamNbs[k]! > nb) {
            inversions++
          }
        }

        streamNbs[placed++] = nb

        if (nb < 32) {
          alo |= 1 << nb
        } else {
          ahi |= 1 << (nb - 32)
        }

        w ^= low
      }

      w = shi

      while (w !== 0) {
        const low = w & -w
        const b = 63 - Math.clz32(low)
        const x = b >>> 1
        const forward = (b & 1) === 1
        let y: number

        if (forward) {
          if (x === L - 1) {
            y = 0
            dcut--
            crossing = 1
          } else {
            y = x + 1
          }
        } else {
          if (x === 0) {
            y = L - 1
            dcut++
            crossing = 1
          } else {
            y = x - 1
          }
        }

        const nb = forward ? 2 * y + 1 : 2 * y

        for (let k = 0; k < placed; k++) {
          if (streamNbs[k]! > nb) {
            inversions++
          }
        }

        streamNbs[placed++] = nb

        if (nb < 32) {
          alo |= 1 << nb
        } else {
          ahi |= 1 << (nb - 32)
        }

        w ^= low
      }

      if (!closed && crossing === 1) {
        crossingWeight += re * re + im * im
      }

      if (outSize === cap) {
        grow()
      }

      const sg = (inversions & 1) === 0 ? 1 : -1

      outLo[outSize] = alo
      outHi[outSize] = ahi
      outCut[outSize] = closed ? (c + ((dcut % 3) + 3)) % cuts : 0
      outRe[outSize] = sg * re
      outIm[outSize] = sg * im
      outSize++
    }
  }

  const trimmed = outSize === cap

  return {
    amp: {
      lo: trimmed ? outLo : outLo.slice(0, outSize),
      hi: trimmed ? outHi : outHi.slice(0, outSize),
      cut: trimmed ? outCut : outCut.slice(0, outSize),
      re: trimmed ? outRe : outRe.slice(0, outSize),
      im: trimmed ? outIm : outIm.slice(0, outSize),
      size: outSize,
    },
    crossing: crossingWeight,
  }
}

// ---- sparse bound-trio reading ----

// Exact sparse equivalent of cold-line's boundCount: F = sum_X <B_X^dag B_X>, operating strictly on occupied entries
// and allocating only the nonzero (X, remaining-modes, left-cut) accumulator slots.
export function sparseBoundCount(
  L: number,
  n: number,
  closed: boolean,
  rd: LineReader,
  a: SparseAmp,
): number {
  if (n < 3 || a.size === 0) {
    return 0
  }

  const cuts = closed ? 3 : 1
  const modesAll = 2 * L
  const anchors = rd.anchors
  const anchored = rd.anchored
  const accMap = new Map<bigint, number>()
  const accRe: number[] = []
  const accIm: number[] = []
  const { lo: inLo, hi: inHi, cut: inCut, re: inRe, im: inIm, size } = a

  const visitAnchor = (lo: number, hi: number, c: number, ar: number, ai: number, X: number): void => {
    const w = rd.closed ? cyclic(lo, hi, modesAll, 2 * X, rd.width) : extract(lo, hi, 2 * X, rd.width)
    const list = rd.index[w]!

    if (list.length === 0) {
      return
    }

    const xPrefix = BigInt(X) << 66n

    for (let li = 0; li < list.length; li++) {
      const t = list[li]!
      const ms = rd.modes[t]!
      let olo = lo
      let ohi = hi
      let wrapped = 0

      for (let mi = 0; mi < ms.length; mi++) {
        const g = 2 * X + ms[mi]!

        if (g >= modesAll) {
          wrapped++
        }

        const pm = g >= modesAll ? g - modesAll : g

        if (pm < 32) {
          olo &= ~(1 << pm)
        } else {
          ohi &= ~(1 << (pm - 32))
        }
      }

      let parity = 0

      for (let mi = 0; mi < ms.length; mi++) {
        const g = 2 * X + ms[mi]!
        const pm = g >= modesAll ? g - modesAll : g

        parity += below(olo, ohi, pm)
      }

      const s = (parity & 1) === 0 ? 1 : -1
      const left = (c + wrapped) % cuts
      const tr = rd.re[t]!
      const ti = rd.im[t]!
      const dre = s * (tr * ar - ti * ai)
      const dim = s * (tr * ai + ti * ar)
      const key = xPrefix | packKey(olo, ohi, left)
      const slot = accMap.get(key)

      if (slot === undefined) {
        accMap.set(key, accRe.length)
        accRe.push(dre)
        accIm.push(dim)
      } else {
        accRe[slot]! += dre
        accIm[slot]! += dim
      }
    }
  }

  for (let i = 0; i < size; i++) {
    const ar = inRe[i]!
    const ai = inIm[i]!

    if (ar === 0 && ai === 0) {
      continue
    }

    const lo = inLo[i]!
    const hi = inHi[i]!
    const c = closed ? inCut[i]! : 0

    if (anchored) {
      let occLo = ((lo >>> 1) | lo) & 0x55555555

      while (occLo !== 0) {
        const low = occLo & -occLo
        const X = (31 - Math.clz32(low)) >>> 1

        if (X < anchors) {
          visitAnchor(lo, hi, c, ar, ai, X)
        }

        occLo ^= low
      }

      let occHi = ((hi >>> 1) | hi) & 0x55555555

      while (occHi !== 0) {
        const low = occHi & -occHi
        const X = 16 + ((31 - Math.clz32(low)) >>> 1)

        if (X < anchors) {
          visitAnchor(lo, hi, c, ar, ai, X)
        }

        occHi ^= low
      }
    } else {
      for (let X = 0; X < anchors; X++) {
        visitAnchor(lo, hi, c, ar, ai, X)
      }
    }
  }

  let total = 0

  for (let i = 0; i < accRe.length; i++) {
    const r = accRe[i]!
    const m = accIm[i]!

    total += r * r + m * m
  }

  return total
}

// ---- sparse start builders (no dense LineEngine needed) ----

export type SparseStart = { readonly amp: SparseAmp; readonly dropped: number }

export function sparseLineStart(input: {
  L: number
  closed: boolean
  W: number
  placed: readonly Placed[] | undefined
  bath: readonly (readonly [number, number])[]
  lift: boolean
  offset: number
}): SparseStart {
  const { L, closed, W, placed, bath, lift, offset } = input
  const cuts = closed ? 3 : 1
  const shift = (ts: readonly (readonly [number, number])[]) =>
    ts.map(([x, j]) => [x + offset, j] as const)
  const bathRing = modesOf(bath, W)
  const bathHere = modesOf(shift(bath), L)

  if (placed === undefined) {
    return {
      amp: {
        lo: Int32Array.of(bathHere[0]),
        hi: Int32Array.of(bathHere[1]),
        cut: Uint8Array.of(0),
        re: Float64Array.of(1),
        im: Float64Array.of(0),
        size: 1,
      },
      dropped: 0,
    }
  }

  const w = 1 / Math.sqrt(W)
  const map = new Map<bigint, number>()
  const los: number[] = []
  const his: number[] = []
  const cs: number[] = []
  const res: number[] = []
  const ims: number[] = []
  let dropped = 0

  for (let X = 0; X < W; X++) {
    for (const p of placed) {
      const ts = p.ts.map(([x, j]) => [x + X, j] as const)

      if (overlaps(modesOf(ts, W), bathRing)) {
        dropped += (p.re ** 2 + p.im ** 2) / W
        continue
      }

      if (lift && ts.some(([x]) => x + offset >= L)) {
        throw new Error('sparse-cold-line: a lifted translate leaves the line')
      }

      const m = modesOf(shift(ts), L)

      if (overlaps(m, bathHere) || popcount(m[0]) + popcount(m[1]) !== ts.length) {
        dropped += (p.re ** 2 + p.im ** 2) / W
        continue
      }

      const wrapped = lift ? 0 : ts.reduce((acc, [x]) => acc + Math.floor((x + offset) / L), 0)
      const s = mergeSign(m, bathHere)
      const bothLo = m[0] | bathHere[0]
      const bothHi = m[1] | bathHere[1]
      const c = cuts === 3 ? ((-wrapped % 3) + 3) % 3 : 0
      const key = packKey(bothLo, bothHi, c)
      const slot = map.get(key)

      if (slot === undefined) {
        map.set(key, los.length)
        los.push(bothLo)
        his.push(bothHi)
        cs.push(c)
        res.push(s * w * p.re)
        ims.push(s * w * p.im)
      } else {
        res[slot]! += s * w * p.re
        ims[slot]! += s * w * p.im
      }
    }
  }

  let norm2 = 0

  for (let i = 0; i < res.length; i++) {
    norm2 += res[i]! * res[i]! + ims[i]! * ims[i]!
  }

  const inv = 1 / Math.sqrt(norm2)
  let kept = 0

  for (let i = 0; i < res.length; i++) {
    if (res[i] !== 0 || ims[i] !== 0) {
      kept++
    }
  }

  const lo = new Int32Array(kept)
  const hi = new Int32Array(kept)
  const cut = new Uint8Array(kept)
  const re = new Float64Array(kept)
  const im = new Float64Array(kept)
  let k = 0

  for (let i = 0; i < res.length; i++) {
    if (res[i] === 0 && ims[i] === 0) {
      continue
    }

    lo[k] = los[i]!
    hi[k] = his[i]!
    cut[k] = cs[i]!
    re[k] = res[i]! * inv
    im[k] = ims[i]! * inv
    k++
  }

  return { amp: { lo, hi, cut, re, im, size: kept }, dropped }
}
