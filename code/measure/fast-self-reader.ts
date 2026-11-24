// PACKED INTEGER-KEY SELF-READER (optimization #4 over code/measure/self-reader.ts).
// Replaces string keys (`${s}+`, `outside.join(',')`) and nested `Map<string, Map<string, Cx>>`
// with zero-string packed canonical keys (`number` fast-path + `BigInt` arbitrary-width fallback),
// flat typed-array bucket arenas, and a fused single/two-pass `fastBallClosure`.

import { eachConfiguration, type ConeStore } from '@/code/measure/cone-line'
import type { BallTerm, Closure, Cx } from '@/code/measure/self-reader'

export type FastKey = number | bigint

// Canonical empty-configuration key (vacuum complement or empty region).
export const VACUUM_KEY: FastKey = 0

// Exact IEEE-754 safe-integer fast-path constants.
// All five `number` key ranges are pairwise disjoint inside [-(2^53 - 1), 2^53 - 1]:
//   len === 0:                       0
//   len === 1, 0 <= s < 2^25:        [1, 2^26]
//   len === 2, 0 <= s < 2^25:        [2^26 + 1, 2^52 + 2^26]
//   len === 3, 0 <= s < 2^16:        [-2^51, -1]
//   len === 4, 0 <= s < 2^12:        [-3 * 2^51, -(2^51 + 1)]
// Any larger length or out-of-range slot falls back seamlessly to `BigInt`, which
// never collides with `number` under Map's SameValueZero equality.
const BALL_LIMIT_1_2 = 33554432 // 2^25
const BALL_BASE_2 = 67108864 // 2^26
const BALL_OFFSET_2 = 67108865 // 2^26 + 1

const BALL_LIMIT_3 = 65536 // 2^16
const BALL_BASE_3_1 = 131072 // 2^17
const BALL_BASE_3_2 = 17179869184 // 2^34

const BALL_LIMIT_4 = 4096 // 2^12
const BALL_BASE_4_1 = 8192 // 2^13
const BALL_BASE_4_2 = 67108864 // 2^26
const BALL_BASE_4_3 = 549755813888 // 2^39
const BALL_OFFSET_4 = 2251799813685249 // 2^51 + 1

// Mode fast-path limits (modes already pack dock and direction bit: md = 2*x + dir).
const MODE_LIMIT_1_2 = 67108864 // 2^26
const MODE_LIMIT_3 = 131072 // 2^17
const MODE_LIMIT_4 = 8192 // 2^13

const BUCKET_INDEX_THRESHOLD = 12

// ---- canonical key packing ----

function packBallKeyInt32(slots: Int32Array, vals: Int8Array, len: number): FastKey {
  if (len === 0) {
    return 0
  }

  if (len === 1) {
    const s0 = slots[0]!

    if (s0 >>> 0 < BALL_LIMIT_1_2) {
      return ((s0 << 1) | (vals[0]! > 0 ? 1 : 0)) + 1
    }
  } else if (len === 2) {
    const s0 = slots[0]!
    const s1 = slots[1]!

    if ((s0 | s1) >>> 0 < BALL_LIMIT_1_2) {
      const c0 = (s0 << 1) | (vals[0]! > 0 ? 1 : 0)
      const c1 = (s1 << 1) | (vals[1]! > 0 ? 1 : 0)

      return BALL_OFFSET_2 + c0 + c1 * BALL_BASE_2
    }
  } else if (len === 3) {
    const s0 = slots[0]!
    const s1 = slots[1]!
    const s2 = slots[2]!

    if ((s0 | s1 | s2) >>> 0 < BALL_LIMIT_3) {
      const c0 = (s0 << 1) | (vals[0]! > 0 ? 1 : 0)
      const c1 = (s1 << 1) | (vals[1]! > 0 ? 1 : 0)
      const c2 = (s2 << 1) | (vals[2]! > 0 ? 1 : 0)

      return -(1 + c0 + c1 * BALL_BASE_3_1 + c2 * BALL_BASE_3_2)
    }
  } else if (len === 4) {
    const s0 = slots[0]!
    const s1 = slots[1]!
    const s2 = slots[2]!
    const s3 = slots[3]!

    if ((s0 | s1 | s2 | s3) >>> 0 < BALL_LIMIT_4) {
      const c0 = (s0 << 1) | (vals[0]! > 0 ? 1 : 0)
      const c1 = (s1 << 1) | (vals[1]! > 0 ? 1 : 0)
      const c2 = (s2 << 1) | (vals[2]! > 0 ? 1 : 0)
      const c3 = (s3 << 1) | (vals[3]! > 0 ? 1 : 0)

      return -(
        BALL_OFFSET_4 +
        c0 +
        c1 * BALL_BASE_4_1 +
        c2 * BALL_BASE_4_2 +
        c3 * BALL_BASE_4_3
      )
    }
  }

  // Arbitrary length / arbitrary 32-bit slot fallback: 34-bit strictly positive lane per entry.
  // Each lane holds ((uint32(slot) << 1) | signBit) + 1 in [1n, 2^33n], so length and values
  // are uniquely encoded without colliding with empty or shorter sequences.
  let acc = 0n

  for (let i = 0; i < len; i++) {
    const code = ((BigInt(slots[i]! >>> 0) << 1n) | (vals[i]! > 0 ? 1n : 0n)) + 1n

    acc = (acc << 34n) | code
  }

  return acc
}

// Public canonical ball key packer (accepts Int32Array/Int8Array or plain arrays).
export function packBallKey(
  slots: ArrayLike<number>,
  values: ArrayLike<number>,
  len = slots.length,
): FastKey {
  if (slots instanceof Int32Array && values instanceof Int8Array) {
    return packBallKeyInt32(slots, values, len)
  }

  if (len === 0) {
    return 0
  }

  if (len === 1) {
    const s0 = slots[0]!

    if (s0 >= 0 && s0 < BALL_LIMIT_1_2) {
      return ((s0 << 1) | (values[0]! > 0 ? 1 : 0)) + 1
    }
  } else if (len === 2) {
    const s0 = slots[0]!
    const s1 = slots[1]!

    if (s0 >= 0 && s1 >= 0 && s0 < BALL_LIMIT_1_2 && s1 < BALL_LIMIT_1_2) {
      const c0 = (s0 << 1) | (values[0]! > 0 ? 1 : 0)
      const c1 = (s1 << 1) | (values[1]! > 0 ? 1 : 0)

      return BALL_OFFSET_2 + c0 + c1 * BALL_BASE_2
    }
  } else if (len === 3) {
    const s0 = slots[0]!
    const s1 = slots[1]!
    const s2 = slots[2]!

    if (s0 >= 0 && s1 >= 0 && s2 >= 0 && s0 < BALL_LIMIT_3 && s1 < BALL_LIMIT_3 && s2 < BALL_LIMIT_3) {
      const c0 = (s0 << 1) | (values[0]! > 0 ? 1 : 0)
      const c1 = (s1 << 1) | (values[1]! > 0 ? 1 : 0)
      const c2 = (s2 << 1) | (values[2]! > 0 ? 1 : 0)

      return -(1 + c0 + c1 * BALL_BASE_3_1 + c2 * BALL_BASE_3_2)
    }
  } else if (len === 4) {
    const s0 = slots[0]!
    const s1 = slots[1]!
    const s2 = slots[2]!
    const s3 = slots[3]!

    if (
      s0 >= 0 &&
      s1 >= 0 &&
      s2 >= 0 &&
      s3 >= 0 &&
      s0 < BALL_LIMIT_4 &&
      s1 < BALL_LIMIT_4 &&
      s2 < BALL_LIMIT_4 &&
      s3 < BALL_LIMIT_4
    ) {
      const c0 = (s0 << 1) | (values[0]! > 0 ? 1 : 0)
      const c1 = (s1 << 1) | (values[1]! > 0 ? 1 : 0)
      const c2 = (s2 << 1) | (values[2]! > 0 ? 1 : 0)
      const c3 = (s3 << 1) | (values[3]! > 0 ? 1 : 0)

      return -(
        BALL_OFFSET_4 +
        c0 +
        c1 * BALL_BASE_4_1 +
        c2 * BALL_BASE_4_2 +
        c3 * BALL_BASE_4_3
      )
    }
  }

  let acc = 0n

  for (let i = 0; i < len; i++) {
    const code = ((BigInt(slots[i]! >>> 0) << 1n) | (values[i]! > 0 ? 1n : 0n)) + 1n

    acc = (acc << 34n) | code
  }

  return acc
}

function packModesKeyInt32(modes: Int32Array, len: number): FastKey {
  if (len === 0) {
    return 0
  }

  if (len === 1) {
    const m0 = modes[0]!

    if (m0 >>> 0 < MODE_LIMIT_1_2) {
      return m0 + 1
    }
  } else if (len === 2) {
    const m0 = modes[0]!
    const m1 = modes[1]!

    if ((m0 | m1) >>> 0 < MODE_LIMIT_1_2) {
      return BALL_OFFSET_2 + m0 + m1 * BALL_BASE_2
    }
  } else if (len === 3) {
    const m0 = modes[0]!
    const m1 = modes[1]!
    const m2 = modes[2]!

    if ((m0 | m1 | m2) >>> 0 < MODE_LIMIT_3) {
      return -(1 + m0 + m1 * BALL_BASE_3_1 + m2 * BALL_BASE_3_2)
    }
  } else if (len === 4) {
    const m0 = modes[0]!
    const m1 = modes[1]!
    const m2 = modes[2]!
    const m3 = modes[3]!

    if ((m0 | m1 | m2 | m3) >>> 0 < MODE_LIMIT_4) {
      return -(
        BALL_OFFSET_4 +
        m0 +
        m1 * BALL_BASE_4_1 +
        m2 * BALL_BASE_4_2 +
        m3 * BALL_BASE_4_3
      )
    }
  }

  // Even BigInt (bit 0 = 0) so it never collides with envId > 0 keys (odd BigInt).
  let acc = 0n

  for (let i = 0; i < len; i++) {
    acc = (acc << 33n) | (BigInt(modes[i]! >>> 0) + 1n)
  }

  return acc << 1n
}

export function packModesKey(modes: ArrayLike<number>, len = modes.length): FastKey {
  if (modes instanceof Int32Array) {
    return packModesKeyInt32(modes, len)
  }

  if (len === 0) {
    return 0
  }

  if (len === 1) {
    const m0 = modes[0]!

    if (m0 >= 0 && m0 < MODE_LIMIT_1_2) {
      return m0 + 1
    }
  } else if (len === 2) {
    const m0 = modes[0]!
    const m1 = modes[1]!

    if (m0 >= 0 && m1 >= 0 && m0 < MODE_LIMIT_1_2 && m1 < MODE_LIMIT_1_2) {
      return BALL_OFFSET_2 + m0 + m1 * BALL_BASE_2
    }
  } else if (len === 3) {
    const m0 = modes[0]!
    const m1 = modes[1]!
    const m2 = modes[2]!

    if (m0 >= 0 && m1 >= 0 && m2 >= 0 && m0 < MODE_LIMIT_3 && m1 < MODE_LIMIT_3 && m2 < MODE_LIMIT_3) {
      return -(1 + m0 + m1 * BALL_BASE_3_1 + m2 * BALL_BASE_3_2)
    }
  } else if (len === 4) {
    const m0 = modes[0]!
    const m1 = modes[1]!
    const m2 = modes[2]!
    const m3 = modes[3]!

    if (
      m0 >= 0 &&
      m1 >= 0 &&
      m2 >= 0 &&
      m3 >= 0 &&
      m0 < MODE_LIMIT_4 &&
      m1 < MODE_LIMIT_4 &&
      m2 < MODE_LIMIT_4 &&
      m3 < MODE_LIMIT_4
    ) {
      return -(
        BALL_OFFSET_4 +
        m0 +
        m1 * BALL_BASE_4_1 +
        m2 * BALL_BASE_4_2 +
        m3 * BALL_BASE_4_3
      )
    }
  }

  let acc = 0n

  for (let i = 0; i < len; i++) {
    acc = (acc << 33n) | (BigInt(modes[i]! >>> 0) + 1n)
  }

  return acc << 1n
}

function packEnvModesKeyInt32(envId: number, modes: Int32Array, len: number): FastKey {
  if (envId === 0) {
    return packModesKeyInt32(modes, len)
  }

  // Odd BigInt: bit 0 = 1, bits 1..32 = envId, bits 33.. = 33-bit positive mode chunks.
  let acc = 0n

  for (let i = 0; i < len; i++) {
    acc = (acc << 33n) | (BigInt(modes[i]! >>> 0) + 1n)
  }

  return (((acc << 32n) | BigInt(envId >>> 0)) << 1n) | 1n
}

// ---- flat arena parts store ----

export type FastParts = {
  // complement key -> dense bucket id (0 .. numBuckets - 1)
  buckets: Map<FastKey, number>
  numBuckets: number
  bucketHead: Int32Array
  bucketLen: Int32Array
  bucketIndex: (Map<FastKey, number> | undefined)[]
  // flat entry arena (zero inner Maps for small buckets, zero [re, im] tuple allocations)
  numEntries: number
  entryRk: FastKey[]
  entryRe: Float64Array
  entryIm: Float64Array
  entryNext: Int32Array
}

export type FastLineParts = FastParts & {
  envIds: Map<string, number>
}

function createFastParts(initialBuckets = 256, initialEntries = 512): FastParts {
  return {
    buckets: new Map(),
    numBuckets: 0,
    bucketHead: new Int32Array(initialBuckets),
    bucketLen: new Int32Array(initialBuckets),
    bucketIndex: [],
    numEntries: 0,
    entryRk: [],
    entryRe: new Float64Array(initialEntries),
    entryIm: new Float64Array(initialEntries),
    entryNext: new Int32Array(initialEntries),
  }
}

function growBuckets(parts: FastParts): void {
  const nextCap = parts.bucketHead.length * 2
  const nextHead = new Int32Array(nextCap)
  const nextLen = new Int32Array(nextCap)

  nextHead.set(parts.bucketHead)
  nextLen.set(parts.bucketLen)
  parts.bucketHead = nextHead
  parts.bucketLen = nextLen
}

function growEntries(parts: FastParts): void {
  const nextCap = parts.entryRe.length * 2
  const nextRe = new Float64Array(nextCap)
  const nextIm = new Float64Array(nextCap)
  const nextNext = new Int32Array(nextCap)

  nextRe.set(parts.entryRe)
  nextIm.set(parts.entryIm)
  nextNext.set(parts.entryNext)
  parts.entryRe = nextRe
  parts.entryIm = nextIm
  parts.entryNext = nextNext
}

function addPartEntry(parts: FastParts, ek: FastKey, rk: FastKey, re: number, im: number): void {
  let bid = parts.buckets.get(ek)

  if (bid === undefined) {
    bid = parts.numBuckets++

    if (bid >= parts.bucketHead.length) {
      growBuckets(parts)
    }

    parts.buckets.set(ek, bid)

    const eid = parts.numEntries++

    if (eid >= parts.entryRe.length) {
      growEntries(parts)
    }

    parts.entryRk.push(rk)
    parts.entryRe[eid] = re
    parts.entryIm[eid] = im
    parts.entryNext[eid] = -1
    parts.bucketHead[bid] = eid
    parts.bucketLen[bid] = 1
    parts.bucketIndex.push(undefined)

    return
  }

  const idxMap = parts.bucketIndex[bid]

  if (idxMap !== undefined) {
    const existing = idxMap.get(rk)

    if (existing !== undefined) {
      parts.entryRe[existing] = parts.entryRe[existing]! + re
      parts.entryIm[existing] = parts.entryIm[existing]! + im

      return
    }

    const eid = parts.numEntries++

    if (eid >= parts.entryRe.length) {
      growEntries(parts)
    }

    parts.entryRk.push(rk)
    parts.entryRe[eid] = re
    parts.entryIm[eid] = im
    parts.entryNext[eid] = parts.bucketHead[bid]!
    parts.bucketHead[bid] = eid
    parts.bucketLen[bid] = parts.bucketLen[bid]! + 1
    idxMap.set(rk, eid)

    return
  }

  for (let cur = parts.bucketHead[bid]!; cur !== -1; cur = parts.entryNext[cur]!) {
    if (parts.entryRk[cur] === rk) {
      parts.entryRe[cur] = parts.entryRe[cur]! + re
      parts.entryIm[cur] = parts.entryIm[cur]! + im

      return
    }
  }

  const eid = parts.numEntries++

  if (eid >= parts.entryRe.length) {
    growEntries(parts)
  }

  parts.entryRk.push(rk)
  parts.entryRe[eid] = re
  parts.entryIm[eid] = im
  parts.entryNext[eid] = parts.bucketHead[bid]!
  parts.bucketHead[bid] = eid
  const newLen = parts.bucketLen[bid]! + 1
  parts.bucketLen[bid] = newLen

  if (newLen > BUCKET_INDEX_THRESHOLD) {
    const built = new Map<FastKey, number>()

    for (let cur = eid; cur !== -1; cur = parts.entryNext[cur]!) {
      built.set(parts.entryRk[cur]!, cur)
    }

    parts.bucketIndex[bid] = built
  }
}

// ---- flat complex vector accumulator ----

type CxAccum = {
  index: Map<FastKey, number>
  count: number
  re: Float64Array
  im: Float64Array
}

function createCxAccum(initialCap = 256): CxAccum {
  return {
    index: new Map(),
    count: 0,
    re: new Float64Array(initialCap),
    im: new Float64Array(initialCap),
  }
}

function addCxAccum(acc: CxAccum, key: FastKey, re: number, im: number): void {
  const existing = acc.index.get(key)

  if (existing !== undefined) {
    acc.re[existing] = acc.re[existing]! + re
    acc.im[existing] = acc.im[existing]! + im

    return
  }

  const idx = acc.count++

  if (idx >= acc.re.length) {
    const nextCap = acc.re.length * 2
    const nextRe = new Float64Array(nextCap)
    const nextIm = new Float64Array(nextCap)

    nextRe.set(acc.re)
    nextIm.set(acc.im)
    acc.re = nextRe
    acc.im = nextIm
  }

  acc.index.set(key, idx)
  acc.re[idx] = re
  acc.im[idx] = im
}

// ---- fast closure ----

// Closure of packed `FastParts` against optional self-free complement `eps`
// (undefined: vacuum complement on VACUUM_KEY = 0 with amplitude [1, 0]).
export function fastClosureOf(parts: FastParts, eps?: ReadonlyMap<FastKey, Cx>): Closure {
  const { numBuckets, bucketHead, bucketIndex, entryRk, entryRe, entryIm, entryNext } = parts

  // Zero-copy fast path for vacuum complement.
  if (eps === undefined) {
    const vacBid = parts.buckets.get(VACUUM_KEY)

    if (vacBid === undefined) {
      return { c: 0, r: 0 }
    }

    let r = 0
    let vacLookup = bucketIndex[vacBid]

    if (vacLookup !== undefined) {
      for (let eid = bucketHead[vacBid]!; eid !== -1; eid = entryNext[eid]!) {
        const x = entryRe[eid]!
        const y = entryIm[eid]!

        r += x * x + y * y
      }
    } else {
      vacLookup = new Map<FastKey, number>()

      for (let eid = bucketHead[vacBid]!; eid !== -1; eid = entryNext[eid]!) {
        const x = entryRe[eid]!
        const y = entryIm[eid]!

        r += x * x + y * y
        vacLookup.set(entryRk[eid]!, eid)
      }
    }

    if (r === 0) {
      return { c: 0, r: 0 }
    }

    let c = r * r

    for (let b = 0; b < numBuckets; b++) {
      if (b === vacBid) {
        continue
      }

      let pr = 0
      let pi = 0

      for (let eid = bucketHead[b]!; eid !== -1; eid = entryNext[eid]!) {
        const aeid = vacLookup.get(entryRk[eid]!)

        if (aeid === undefined) {
          continue
        }

        const br = entryRe[aeid]!
        const bi = entryIm[aeid]!
        const ar = entryRe[eid]!
        const ai = entryIm[eid]!

        // conj(b) * a
        pr += br * ar + bi * ai
        pi += br * ai - bi * ar
      }

      c += pr * pr + pi * pi
    }

    return { c, r }
  }

  // General non-vacuum complement path.
  const aEps = createCxAccum(256)

  for (const [ek, ep] of eps) {
    const bid = parts.buckets.get(ek)

    if (bid === undefined) {
      continue
    }

    const er = ep[0]
    const ei = ep[1]

    for (let eid = bucketHead[bid]!; eid !== -1; eid = entryNext[eid]!) {
      const ar = entryRe[eid]!
      const ai = entryIm[eid]!

      // conj(eps_k) * a
      addCxAccum(aEps, entryRk[eid]!, er * ar + ei * ai, er * ai - ei * ar)
    }
  }

  let r = 0
  const aRe = aEps.re
  const aIm = aEps.im
  const aCount = aEps.count

  for (let i = 0; i < aCount; i++) {
    const x = aRe[i]!
    const y = aIm[i]!

    r += x * x + y * y
  }

  if (r === 0) {
    return { c: 0, r: 0 }
  }

  const aIndex = aEps.index
  let c = 0

  for (let b = 0; b < numBuckets; b++) {
    let pr = 0
    let pi = 0

    for (let eid = bucketHead[b]!; eid !== -1; eid = entryNext[eid]!) {
      const idx = aIndex.get(entryRk[eid]!)

      if (idx === undefined) {
        continue
      }

      const br = aRe[idx]!
      const bi = aIm[idx]!
      const ar = entryRe[eid]!
      const ai = entryIm[eid]!

      // conj(b) * a
      pr += br * ar + bi * ai
      pi += br * ai - bi * ar
    }

    c += pr * pr + pi * pi
  }

  return { c, r }
}

// ---- fast ball parts, retention, and fused closure ----

export function fastBallParts(
  terms: Iterable<BallTerm>,
  inRegion: (slot: number) => boolean,
): FastParts {
  const hint = Array.isArray(terms) ? Math.max(256, terms.length >> 1) : 256
  const parts = createFastParts(Math.min(hint, 65536), Math.min(hint * 2, 131072))

  let cap = 16
  let inSlots = new Int32Array(cap)
  let inVals = new Int8Array(cap)
  let outSlots = new Int32Array(cap)
  let outVals = new Int8Array(cap)

  for (const t of terms) {
    const re = t.re
    const im = t.im

    if (re === 0 && im === 0) {
      continue
    }

    const slots = t.slots
    const vals = t.values
    const len = slots.length

    if (len > cap) {
      cap = len * 2
      inSlots = new Int32Array(cap)
      inVals = new Int8Array(cap)
      outSlots = new Int32Array(cap)
      outVals = new Int8Array(cap)
    }

    let inLen = 0
    let outLen = 0

    for (let i = 0; i < len; i++) {
      const s = slots[i]!

      if (inRegion(s)) {
        inSlots[inLen] = s
        inVals[inLen] = vals[i]!
        inLen++
      } else {
        outSlots[outLen] = s
        outVals[outLen] = vals[i]!
        outLen++
      }
    }

    const ek = packBallKeyInt32(outSlots, outVals, outLen)
    const rk = packBallKeyInt32(inSlots, inVals, inLen)

    addPartEntry(parts, ek, rk, re, im)
  }

  return parts
}

// Fused ball closure directly from `Iterable<BallTerm>` without constructing nested maps.
// For arrays (the common case), avoids intermediate bucket/entry storage entirely.
export function fastBallClosure(
  terms: Iterable<BallTerm>,
  inRegion: (slot: number) => boolean,
  eps?: ReadonlyMap<FastKey, Cx>,
): Closure {
  if (Array.isArray(terms)) {
    const list = terms as readonly BallTerm[]
    const n = list.length

    let cap = 16
    let inSlots = new Int32Array(cap)
    let inVals = new Int8Array(cap)
    let outSlots = new Int32Array(cap)
    let outVals = new Int8Array(cap)

    const aEps = createCxAccum(256)
    let aEpsLenMask = 0
    let hasLongInLen = false

    if (eps === undefined) {
      // Pass 1 (vacuum): accumulate only all-inside terms into aEps.
      for (let ti = 0; ti < n; ti++) {
        const t = list[ti]!
        const re = t.re
        const im = t.im

        if (re === 0 && im === 0) {
          continue
        }

        const slots = t.slots
        const len = slots.length
        let allIn = true

        for (let i = 0; i < len; i++) {
          if (!inRegion(slots[i]!)) {
            allIn = false
            break
          }
        }

        if (!allIn) {
          continue
        }

        const rk = packBallKeyInt32(slots, t.values, len)

        addCxAccum(aEps, rk, re, im)

        if (len < 31) {
          aEpsLenMask |= 1 << len
        } else {
          hasLongInLen = true
        }
      }

      let r = 0
      const aRe = aEps.re
      const aIm = aEps.im
      const aCount = aEps.count

      for (let i = 0; i < aCount; i++) {
        const x = aRe[i]!
        const y = aIm[i]!

        r += x * x + y * y
      }

      if (r === 0) {
        return { c: 0, r: 0 }
      }

      // Pass 2 (vacuum): accumulate <aEps | a_e> linearly over non-vacuum terms.
      const aIndex = aEps.index
      let innerProd: CxAccum | undefined

      for (let ti = 0; ti < n; ti++) {
        const t = list[ti]!
        const re = t.re
        const im = t.im

        if (re === 0 && im === 0) {
          continue
        }

        const slots = t.slots
        const vals = t.values
        const len = slots.length

        if (len > cap) {
          cap = len * 2
          inSlots = new Int32Array(cap)
          inVals = new Int8Array(cap)
          outSlots = new Int32Array(cap)
          outVals = new Int8Array(cap)
        }

        let inLen = 0
        let outLen = 0

        for (let i = 0; i < len; i++) {
          const s = slots[i]!

          if (inRegion(s)) {
            inSlots[inLen] = s
            inVals[inLen] = vals[i]!
            inLen++
          } else {
            outSlots[outLen] = s
            outVals[outLen] = vals[i]!
            outLen++
          }
        }

        if (outLen === 0) {
          continue
        }

        if (inLen < 31 ? (aEpsLenMask & (1 << inLen)) === 0 : !hasLongInLen) {
          continue
        }

        const rk = packBallKeyInt32(inSlots, inVals, inLen)
        const idx = aIndex.get(rk)

        if (idx === undefined) {
          continue
        }

        const ek = packBallKeyInt32(outSlots, outVals, outLen)
        const br = aRe[idx]!
        const bi = aIm[idx]!

        if (innerProd === undefined) {
          innerProd = createCxAccum(256)
        }

        addCxAccum(innerProd, ek, br * re + bi * im, br * im - bi * re)
      }

      let c = r * r

      if (innerProd !== undefined) {
        const pRe = innerProd.re
        const pIm = innerProd.im
        const pCount = innerProd.count

        for (let i = 0; i < pCount; i++) {
          const x = pRe[i]!
          const y = pIm[i]!

          c += x * x + y * y
        }
      }

      return { c, r }
    }

    // Pass 1 (non-vacuum eps): accumulate terms whose complement key is in eps.
    for (let ti = 0; ti < n; ti++) {
      const t = list[ti]!
      const re = t.re
      const im = t.im

      if (re === 0 && im === 0) {
        continue
      }

      const slots = t.slots
      const vals = t.values
      const len = slots.length

      if (len > cap) {
        cap = len * 2
        inSlots = new Int32Array(cap)
        inVals = new Int8Array(cap)
        outSlots = new Int32Array(cap)
        outVals = new Int8Array(cap)
      }

      let inLen = 0
      let outLen = 0

      for (let i = 0; i < len; i++) {
        const s = slots[i]!

        if (inRegion(s)) {
          inSlots[inLen] = s
          inVals[inLen] = vals[i]!
          inLen++
        } else {
          outSlots[outLen] = s
          outVals[outLen] = vals[i]!
          outLen++
        }
      }

      const ek = packBallKeyInt32(outSlots, outVals, outLen)
      const ep = eps.get(ek)

      if (ep === undefined) {
        continue
      }

      const rk = packBallKeyInt32(inSlots, inVals, inLen)
      const er = ep[0]
      const ei = ep[1]

      addCxAccum(aEps, rk, er * re + ei * im, er * im - ei * re)

      if (inLen < 31) {
        aEpsLenMask |= 1 << inLen
      } else {
        hasLongInLen = true
      }
    }

    let r = 0
    const aRe = aEps.re
    const aIm = aEps.im
    const aCount = aEps.count

    for (let i = 0; i < aCount; i++) {
      const x = aRe[i]!
      const y = aIm[i]!

      r += x * x + y * y
    }

    if (r === 0) {
      return { c: 0, r: 0 }
    }

    // Pass 2 (non-vacuum eps): accumulate <aEps | a_e> linearly into flat single-level map.
    const aIndex = aEps.index
    const innerProd = createCxAccum(256)

    for (let ti = 0; ti < n; ti++) {
      const t = list[ti]!
      const re = t.re
      const im = t.im

      if (re === 0 && im === 0) {
        continue
      }

      const slots = t.slots
      const vals = t.values
      const len = slots.length

      if (len > cap) {
        cap = len * 2
        inSlots = new Int32Array(cap)
        inVals = new Int8Array(cap)
        outSlots = new Int32Array(cap)
        outVals = new Int8Array(cap)
      }

      let inLen = 0
      let outLen = 0

      for (let i = 0; i < len; i++) {
        const s = slots[i]!

        if (inRegion(s)) {
          inSlots[inLen] = s
          inVals[inLen] = vals[i]!
          inLen++
        } else {
          outSlots[outLen] = s
          outVals[outLen] = vals[i]!
          outLen++
        }
      }

      if (inLen < 31 ? (aEpsLenMask & (1 << inLen)) === 0 : !hasLongInLen) {
        continue
      }

      const rk = packBallKeyInt32(inSlots, inVals, inLen)
      const idx = aIndex.get(rk)

      if (idx === undefined) {
        continue
      }

      const ek = packBallKeyInt32(outSlots, outVals, outLen)
      const br = aRe[idx]!
      const bi = aIm[idx]!

      addCxAccum(innerProd, ek, br * re + bi * im, br * im - bi * re)
    }

    let c = 0
    const pRe = innerProd.re
    const pIm = innerProd.im
    const pCount = innerProd.count

    for (let i = 0; i < pCount; i++) {
      const x = pRe[i]!
      const y = pIm[i]!

      c += x * x + y * y
    }

    return { c, r }
  }

  // Single-pass streaming path for non-array Iterables.
  if (eps !== undefined) {
    return fastClosureOf(fastBallParts(terms, inRegion), eps)
  }

  let cap = 16
  let inSlots = new Int32Array(cap)
  let inVals = new Int8Array(cap)
  let outSlots = new Int32Array(cap)
  let outVals = new Int8Array(cap)

  const aEps = createCxAccum(256)
  let aEpsLenMask = 0
  let hasLongInLen = false

  let stageCap = 256
  let stageCount = 0
  const stageEk: FastKey[] = []
  const stageRk: FastKey[] = []
  let stageInLen = new Int32Array(stageCap)
  let stageRe = new Float64Array(stageCap)
  let stageIm = new Float64Array(stageCap)

  for (const t of terms) {
    const re = t.re
    const im = t.im

    if (re === 0 && im === 0) {
      continue
    }

    const slots = t.slots
    const vals = t.values
    const len = slots.length

    if (len > cap) {
      cap = len * 2
      inSlots = new Int32Array(cap)
      inVals = new Int8Array(cap)
      outSlots = new Int32Array(cap)
      outVals = new Int8Array(cap)
    }

    let inLen = 0
    let outLen = 0

    for (let i = 0; i < len; i++) {
      const s = slots[i]!

      if (inRegion(s)) {
        inSlots[inLen] = s
        inVals[inLen] = vals[i]!
        inLen++
      } else {
        outSlots[outLen] = s
        outVals[outLen] = vals[i]!
        outLen++
      }
    }

    const rk = packBallKeyInt32(inSlots, inVals, inLen)

    if (outLen === 0) {
      addCxAccum(aEps, rk, re, im)

      if (inLen < 31) {
        aEpsLenMask |= 1 << inLen
      } else {
        hasLongInLen = true
      }
    } else {
      const ek = packBallKeyInt32(outSlots, outVals, outLen)
      const si = stageCount++

      if (si >= stageCap) {
        stageCap *= 2
        const nextInLen = new Int32Array(stageCap)
        const nextRe = new Float64Array(stageCap)
        const nextIm = new Float64Array(stageCap)

        nextInLen.set(stageInLen)
        nextRe.set(stageRe)
        nextIm.set(stageIm)
        stageInLen = nextInLen
        stageRe = nextRe
        stageIm = nextIm
      }

      stageEk.push(ek)
      stageRk.push(rk)
      stageInLen[si] = inLen
      stageRe[si] = re
      stageIm[si] = im
    }
  }

  let r = 0
  const aRe = aEps.re
  const aIm = aEps.im
  const aCount = aEps.count

  for (let i = 0; i < aCount; i++) {
    const x = aRe[i]!
    const y = aIm[i]!

    r += x * x + y * y
  }

  if (r === 0) {
    return { c: 0, r: 0 }
  }

  let c = r * r

  if (stageCount === 0) {
    return { c, r }
  }

  const aIndex = aEps.index
  let innerProd: CxAccum | undefined

  for (let i = 0; i < stageCount; i++) {
    const inLen = stageInLen[i]!

    if (inLen < 31 ? (aEpsLenMask & (1 << inLen)) === 0 : !hasLongInLen) {
      continue
    }

    const idx = aIndex.get(stageRk[i]!)

    if (idx === undefined) {
      continue
    }

    const br = aRe[idx]!
    const bi = aIm[idx]!
    const re = stageRe[i]!
    const im = stageIm[i]!

    if (innerProd === undefined) {
      innerProd = createCxAccum(256)
    }

    addCxAccum(innerProd, stageEk[i]!, br * re + bi * im, br * im - bi * re)
  }

  if (innerProd !== undefined) {
    const pRe = innerProd.re
    const pIm = innerProd.im
    const pCount = innerProd.count

    for (let i = 0; i < pCount; i++) {
      const x = pRe[i]!
      const y = pIm[i]!

      c += x * x + y * y
    }
  }

  return { c, r }
}

// Zero-allocation retention weight for ball terms with every occupied slot inside the region.
export function fastBallRetention(
  terms: Iterable<BallTerm>,
  inRegion: (slot: number) => boolean,
): number {
  let w = 0

  for (const t of terms) {
    const slots = t.slots
    const len = slots.length
    let allIn = true

    for (let i = 0; i < len; i++) {
      if (!inRegion(slots[i]!)) {
        allIn = false
        break
      }
    }

    if (allIn) {
      w += t.re * t.re + t.im * t.im
    }
  }

  return w
}

// ---- fast line parts & eps ----

const EMPTY_INT32 = new Int32Array(0)

// Zero-string line parts for ConeStore maps keyed by env outcome string.
// Returns a FastLineParts (usable directly with fastClosureOf + fastLineEps).
export function fastLineParts(
  stores: ReadonlyMap<string, ConeStore>,
  lo: number,
  hi: number,
  existingEnvIds?: Map<string, number>,
): FastLineParts {
  const envIds = existingEnvIds ?? new Map<string, number>()

  if (envIds.size === 0 && stores.has('')) {
    envIds.set('', 0)
  }

  const base = createFastParts(256, 512)
  const parts: FastLineParts = Object.assign(base, { envIds })

  let cap = 16
  let inside = new Int32Array(cap)
  let outside = new Int32Array(cap)

  for (const [envKey, s] of stores) {
    let envId = envIds.get(envKey)

    if (envId === undefined) {
      envId = envIds.size
      envIds.set(envKey, envId)
    }

    const curEnvId = envId

    eachConfiguration(s, (modes, re, im) => {
      if (re === 0 && im === 0) {
        return
      }

      const len = modes.length

      if (len > cap) {
        cap = len * 2
        inside = new Int32Array(cap)
        outside = new Int32Array(cap)
      }

      let inLen = 0
      let outLen = 0
      let left = 0

      for (let i = 0; i < len; i++) {
        const md = modes[i]!
        const x = md >> 1

        if (x >= lo && x <= hi) {
          inside[inLen++] = md
        } else {
          outside[outLen++] = md

          if (x < lo) {
            left++
          }
        }
      }

      const sg = ((inLen * left) & 1) === 1 ? -1 : 1
      const ek = packEnvModesKeyInt32(curEnvId, outside, outLen)
      const rk = packModesKeyInt32(inside, inLen)

      addPartEntry(parts, ek, rk, sg * re, sg * im)
    })
  }

  return parts
}

// Self-free complement map matching `fastLineParts`'s packed env keys.
export function fastLineEps(
  env: ReadonlyMap<string, Cx>,
  envIds: ReadonlyMap<string, number>,
): Map<FastKey, Cx> {
  const out = new Map<FastKey, Cx>()
  let nextMissingId = envIds.size

  for (const [k, a] of env) {
    let id = envIds.get(k)

    if (id === undefined) {
      id = nextMissingId++
    }

    out.set(packEnvModesKeyInt32(id, EMPTY_INT32, 0), a)
  }

  return out
}
