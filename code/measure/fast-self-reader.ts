// PACKED INTEGER-KEY SELF-READER (optimization #4 over code/measure/self-reader.ts).
// Replaces string keys (`${s}+`, `outside.join(',')`) and nested `Map<string, Map<string, Cx>>`
// with zero-string packed canonical keys (`number` fast-path + `BigInt` arbitrary-width fallback),
// unboxed Float64Array open-addressed hash tables, flat typed-array bucket arenas,
// and a fused single/two-pass `fastBallClosure`.

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
const BALL_MIN_3 = -2251799813685248 // -2^51

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
const INV_2_32 = 1 / 4294967296

// ---- unboxed open-addressed hash table for FastKey -> int32 (>= 0, -1 = missing) ----

export type FastKeyTable = {
  keys: Float64Array
  vals: Int32Array
  mask: number
  numCount: number
  big: Map<bigint, number> | undefined
}

function nextPow2(n: number): number {
  let p = 16

  while (p < n) {
    p <<= 1
  }

  return p
}

function hashNumKey(k: number): number {
  const lo = k | 0
  const hi = Math.floor(k * INV_2_32) | 0
  let h = Math.imul(lo ^ Math.imul(hi, 0x9e3779b1), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)

  return h ^ (h >>> 16)
}

function createFastKeyTable(initialCap = 256): FastKeyTable {
  const cap = nextPow2(initialCap)
  const vals = new Int32Array(cap)

  vals.fill(-1)

  return {
    keys: new Float64Array(cap),
    vals,
    mask: cap - 1,
    numCount: 0,
    big: undefined,
  }
}

function growFastKeyTable(t: FastKeyTable): void {
  const oldKeys = t.keys
  const oldVals = t.vals
  const oldCap = oldVals.length
  const newCap = oldCap * 2
  const newKeys = new Float64Array(newCap)
  const newVals = new Int32Array(newCap)
  const newMask = newCap - 1

  newVals.fill(-1)

  for (let i = 0; i < oldCap; i++) {
    const v = oldVals[i]!

    if (v === -1) {
      continue
    }

    const k = oldKeys[i]!
    let slot = hashNumKey(k) & newMask

    while (newVals[slot] !== -1) {
      slot = (slot + 1) & newMask
    }

    newKeys[slot] = k
    newVals[slot] = v
  }

  t.keys = newKeys
  t.vals = newVals
  t.mask = newMask
}

function getNumKey(t: FastKeyTable, k: number): number {
  const keys = t.keys
  const vals = t.vals
  const mask = t.mask
  let slot = hashNumKey(k) & mask

  while (true) {
    const v = vals[slot]!

    if (v === -1) {
      return -1
    }

    if (keys[slot] === k) {
      return v
    }

    slot = (slot + 1) & mask
  }
}

function setNumKey(t: FastKeyTable, k: number, val: number): void {
  if ((t.numCount + 1) * 10 >= (t.mask + 1) * 7) {
    growFastKeyTable(t)
  }

  const keys = t.keys
  const vals = t.vals
  const mask = t.mask
  let slot = hashNumKey(k) & mask

  while (true) {
    const v = vals[slot]!

    if (v === -1) {
      keys[slot] = k
      vals[slot] = val
      t.numCount++

      return
    }

    if (keys[slot] === k) {
      vals[slot] = val

      return
    }

    slot = (slot + 1) & mask
  }
}

function getFastKey(t: FastKeyTable, k: FastKey): number {
  if (typeof k === 'number') {
    return getNumKey(t, k)
  }

  if (t.big === undefined) {
    return -1
  }

  const v = t.big.get(k)

  return v === undefined ? -1 : v
}

function setFastKey(t: FastKeyTable, k: FastKey, val: number): void {
  if (typeof k === 'number') {
    setNumKey(t, k, val)

    return
  }

  if (t.big === undefined) {
    t.big = new Map()
  }

  t.big.set(k, val)
}

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
  let acc = BigInt((slots[0]! >>> 0) * 2 + (vals[0]! > 0 ? 1 : 0) + 1)

  for (let i = 1; i < len; i++) {
    acc = (acc << 34n) | BigInt((slots[i]! >>> 0) * 2 + (vals[i]! > 0 ? 1 : 0) + 1)
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

  let acc = BigInt((slots[0]! >>> 0) * 2 + (values[0]! > 0 ? 1 : 0) + 1)

  for (let i = 1; i < len; i++) {
    acc = (acc << 34n) | BigInt((slots[i]! >>> 0) * 2 + (values[i]! > 0 ? 1 : 0) + 1)
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

// Recover exact packed length (0..4) for any numeric FastKey.
function fastNumKeyLen(k: number): number {
  if (k === 0) {
    return 0
  }

  if (k > 0) {
    return k <= BALL_BASE_2 ? 1 : 2
  }

  return k >= BALL_MIN_3 ? 3 : 4
}

// ---- flat arena parts store (zero inner Maps, zero boxed HeapNumbers on fast path) ----

export type FastParts = {
  // complement key -> dense bucket id (0 .. numBuckets - 1)
  buckets: FastKeyTable
  numBuckets: number
  bucketHead: Int32Array
  bucketLen: Int32Array
  // lazy per-bucket lookup table, allocated only when a bucket exceeds BUCKET_INDEX_THRESHOLD
  bucketIndex: Map<number, FastKeyTable> | undefined
  // flat entry arena
  numEntries: number
  // numeric rk stored unboxed; NaN sentinel indicates bigint key in entryRkBig
  entryRkNum: Float64Array
  entryRkBig: Map<number, bigint> | undefined
  entryRe: Float64Array
  entryIm: Float64Array
  entryNext: Int32Array
}

export type FastLineParts = FastParts & {
  envIds: Map<string, number>
}

function createFastParts(initialBuckets = 256, initialEntries = 512): FastParts {
  return {
    buckets: createFastKeyTable(Math.max(256, initialBuckets * 2)),
    numBuckets: 0,
    bucketHead: new Int32Array(initialBuckets),
    bucketLen: new Int32Array(initialBuckets),
    bucketIndex: undefined,
    numEntries: 0,
    entryRkNum: new Float64Array(initialEntries),
    entryRkBig: undefined,
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
  const nextRkNum = new Float64Array(nextCap)
  const nextRe = new Float64Array(nextCap)
  const nextIm = new Float64Array(nextCap)
  const nextNext = new Int32Array(nextCap)

  nextRkNum.set(parts.entryRkNum)
  nextRe.set(parts.entryRe)
  nextIm.set(parts.entryIm)
  nextNext.set(parts.entryNext)
  parts.entryRkNum = nextRkNum
  parts.entryRe = nextRe
  parts.entryIm = nextIm
  parts.entryNext = nextNext
}

function storeEntryRk(parts: FastParts, eid: number, rk: FastKey): void {
  if (typeof rk === 'number') {
    parts.entryRkNum[eid] = rk
  } else {
    parts.entryRkNum[eid] = Number.NaN

    if (parts.entryRkBig === undefined) {
      parts.entryRkBig = new Map()
    }

    parts.entryRkBig.set(eid, rk)
  }
}

function promoteBucketIndex(parts: FastParts, bid: number, headEid: number): void {
  const tbl = createFastKeyTable(32)
  const rkNum = parts.entryRkNum
  const rkBig = parts.entryRkBig
  const next = parts.entryNext

  for (let cur = headEid; cur !== -1; cur = next[cur]!) {
    const kn = rkNum[cur]!

    if (kn === kn) {
      setNumKey(tbl, kn, cur)
    } else {
      setFastKey(tbl, rkBig!.get(cur)!, cur)
    }
  }

  if (parts.bucketIndex === undefined) {
    parts.bucketIndex = new Map()
  }

  parts.bucketIndex.set(bid, tbl)
}

function addPartEntry(parts: FastParts, ek: FastKey, rk: FastKey, re: number, im: number): void {
  let bid = getFastKey(parts.buckets, ek)

  if (bid === -1) {
    bid = parts.numBuckets++

    if (bid >= parts.bucketHead.length) {
      growBuckets(parts)
    }

    setFastKey(parts.buckets, ek, bid)

    const eid = parts.numEntries++

    if (eid >= parts.entryRe.length) {
      growEntries(parts)
    }

    storeEntryRk(parts, eid, rk)
    parts.entryRe[eid] = re
    parts.entryIm[eid] = im
    parts.entryNext[eid] = -1
    parts.bucketHead[bid] = eid
    parts.bucketLen[bid] = 1

    return
  }

  const idxTbl = parts.bucketIndex !== undefined ? parts.bucketIndex.get(bid) : undefined

  if (idxTbl !== undefined) {
    const existing = getFastKey(idxTbl, rk)

    if (existing !== -1) {
      parts.entryRe[existing] = parts.entryRe[existing]! + re
      parts.entryIm[existing] = parts.entryIm[existing]! + im

      return
    }

    const eid = parts.numEntries++

    if (eid >= parts.entryRe.length) {
      growEntries(parts)
    }

    storeEntryRk(parts, eid, rk)
    parts.entryRe[eid] = re
    parts.entryIm[eid] = im
    parts.entryNext[eid] = parts.bucketHead[bid]!
    parts.bucketHead[bid] = eid
    parts.bucketLen[bid] = parts.bucketLen[bid]! + 1
    setFastKey(idxTbl, rk, eid)

    return
  }

  const rkNum = parts.entryRkNum
  const next = parts.entryNext

  if (typeof rk === 'number') {
    for (let cur = parts.bucketHead[bid]!; cur !== -1; cur = next[cur]!) {
      if (rkNum[cur] === rk) {
        parts.entryRe[cur] = parts.entryRe[cur]! + re
        parts.entryIm[cur] = parts.entryIm[cur]! + im

        return
      }
    }
  } else {
    const rkBig = parts.entryRkBig

    if (rkBig !== undefined) {
      for (let cur = parts.bucketHead[bid]!; cur !== -1; cur = next[cur]!) {
        const kn = rkNum[cur]!

        if (kn !== kn && rkBig.get(cur) === rk) {
          parts.entryRe[cur] = parts.entryRe[cur]! + re
          parts.entryIm[cur] = parts.entryIm[cur]! + im

          return
        }
      }
    }
  }

  const eid = parts.numEntries++

  if (eid >= parts.entryRe.length) {
    growEntries(parts)
  }

  storeEntryRk(parts, eid, rk)
  parts.entryRe[eid] = re
  parts.entryIm[eid] = im
  parts.entryNext[eid] = parts.bucketHead[bid]!
  parts.bucketHead[bid] = eid
  const newLen = parts.bucketLen[bid]! + 1
  parts.bucketLen[bid] = newLen

  if (newLen > BUCKET_INDEX_THRESHOLD) {
    promoteBucketIndex(parts, bid, eid)
  }
}

// ---- flat unboxed complex vector accumulator ----

type CxAccum = {
  table: FastKeyTable
  count: number
  re: Float64Array
  im: Float64Array
}

function createCxAccum(initialCap = 256): CxAccum {
  return {
    table: createFastKeyTable(Math.max(256, initialCap * 2)),
    count: 0,
    re: new Float64Array(initialCap),
    im: new Float64Array(initialCap),
  }
}

function addCxAccum(acc: CxAccum, key: FastKey, re: number, im: number): void {
  const existing = getFastKey(acc.table, key)

  if (existing !== -1) {
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

  setFastKey(acc.table, key, idx)
  acc.re[idx] = re
  acc.im[idx] = im
}

// ---- fast closure ----

// Closure of packed `FastParts` against optional self-free complement `eps`
// (undefined: vacuum complement on VACUUM_KEY = 0 with amplitude [1, 0]).
export function fastClosureOf(parts: FastParts, eps?: ReadonlyMap<FastKey, Cx>): Closure {
  const { numBuckets, bucketHead, bucketIndex, entryRkNum, entryRkBig, entryRe, entryIm, entryNext } = parts

  // Zero-copy fast path for vacuum complement.
  if (eps === undefined) {
    const vacBid = getNumKey(parts.buckets, 0)

    if (vacBid === -1) {
      return { c: 0, r: 0 }
    }

    let r = 0
    let vacLookup = bucketIndex !== undefined ? bucketIndex.get(vacBid) : undefined

    if (vacLookup !== undefined) {
      for (let eid = bucketHead[vacBid]!; eid !== -1; eid = entryNext[eid]!) {
        const x = entryRe[eid]!
        const y = entryIm[eid]!

        r += x * x + y * y
      }
    } else {
      vacLookup = createFastKeyTable(32)

      for (let eid = bucketHead[vacBid]!; eid !== -1; eid = entryNext[eid]!) {
        const x = entryRe[eid]!
        const y = entryIm[eid]!

        r += x * x + y * y
        const kn = entryRkNum[eid]!

        if (kn === kn) {
          setNumKey(vacLookup, kn, eid)
        } else {
          setFastKey(vacLookup, entryRkBig!.get(eid)!, eid)
        }
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
        const kn = entryRkNum[eid]!
        const aeid = kn === kn ? getNumKey(vacLookup, kn) : getFastKey(vacLookup, entryRkBig!.get(eid)!)

        if (aeid === -1) {
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
    const bid = getFastKey(parts.buckets, ek)

    if (bid === -1) {
      continue
    }

    const er = ep[0]
    const ei = ep[1]

    for (let eid = bucketHead[bid]!; eid !== -1; eid = entryNext[eid]!) {
      const ar = entryRe[eid]!
      const ai = entryIm[eid]!
      const kn = entryRkNum[eid]!
      const rk: FastKey = kn === kn ? kn : entryRkBig!.get(eid)!

      // conj(eps_k) * a
      addCxAccum(aEps, rk, er * ar + ei * ai, er * ai - ei * ar)
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

  const aTable = aEps.table
  let c = 0

  for (let b = 0; b < numBuckets; b++) {
    let pr = 0
    let pi = 0

    for (let eid = bucketHead[b]!; eid !== -1; eid = entryNext[eid]!) {
      const kn = entryRkNum[eid]!
      const idx = kn === kn ? getNumKey(aTable, kn) : getFastKey(aTable, entryRkBig!.get(eid)!)

      if (idx === -1) {
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
  const isArr = Array.isArray(terms)
  const hintEntries = isArr ? Math.min(Math.max(512, terms.length), 65536) : 512
  const hintBuckets = isArr ? Math.min(Math.max(256, terms.length), 65536) : 256
  const parts = createFastParts(hintBuckets, hintEntries)

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
// Uses unboxed typed-array hash tables and avoids intermediate bucket storage.
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

    const aEps = createCxAccum(Math.min(Math.max(256, n >> 2), 16384))
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
      const aTable = aEps.table
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
        let inMask = 0

        if (len <= 31) {
          for (let i = 0; i < len; i++) {
            const s = slots[i]!

            if (inRegion(s)) {
              inMask |= 1 << i
              inSlots[inLen] = s
              inVals[inLen] = vals[i]!
              inLen++
            }
          }
        } else {
          for (let i = 0; i < len; i++) {
            const s = slots[i]!

            if (inRegion(s)) {
              inSlots[inLen] = s
              inVals[inLen] = vals[i]!
              inLen++
            }
          }
        }

        // Skip vacuum terms (already accounted for by r * r).
        if (inLen === len) {
          continue
        }

        if (inLen < 31 ? (aEpsLenMask & (1 << inLen)) === 0 : !hasLongInLen) {
          continue
        }

        const rk = packBallKeyInt32(inSlots, inVals, inLen)
        const idx = getFastKey(aTable, rk)

        if (idx === -1) {
          continue
        }

        let outLen = 0

        if (len <= 31) {
          for (let i = 0; i < len; i++) {
            if ((inMask & (1 << i)) === 0) {
              outSlots[outLen] = slots[i]!
              outVals[outLen] = vals[i]!
              outLen++
            }
          }
        } else {
          for (let i = 0; i < len; i++) {
            const s = slots[i]!

            if (!inRegion(s)) {
              outSlots[outLen] = s
              outVals[outLen] = vals[i]!
              outLen++
            }
          }
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

    // Index eps into an unboxed FastKeyTable + track possible outside lengths.
    const epsCount = eps.size

    if (epsCount === 0) {
      return { c: 0, r: 0 }
    }

    const epsTable = createFastKeyTable(Math.max(32, epsCount * 4))
    const epsRe = new Float64Array(epsCount)
    const epsIm = new Float64Array(epsCount)
    let epsOutMask = 0
    let epsHasBig = false
    let eiIdx = 0

    for (const [ek, ep] of eps) {
      setFastKey(epsTable, ek, eiIdx)
      epsRe[eiIdx] = ep[0]
      epsIm[eiIdx] = ep[1]
      eiIdx++

      if (typeof ek === 'number') {
        epsOutMask |= 1 << fastNumKeyLen(ek)
      } else {
        epsHasBig = true
      }
    }

    // Pass 1 (non-vacuum eps): collect only terms whose complement key exists in eps.
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

      let outLen = 0
      let outMask = 0

      if (len <= 31) {
        for (let i = 0; i < len; i++) {
          const s = slots[i]!

          if (!inRegion(s)) {
            outMask |= 1 << i
            outSlots[outLen] = s
            outVals[outLen] = vals[i]!
            outLen++
          }
        }
      } else {
        for (let i = 0; i < len; i++) {
          const s = slots[i]!

          if (!inRegion(s)) {
            outSlots[outLen] = s
            outVals[outLen] = vals[i]!
            outLen++
          }
        }
      }

      if (!epsHasBig && (outLen > 4 || (epsOutMask & (1 << outLen)) === 0)) {
        continue
      }

      const ek = packBallKeyInt32(outSlots, outVals, outLen)
      const eIdx = getFastKey(epsTable, ek)

      if (eIdx === -1) {
        continue
      }

      let inLen = 0

      if (len <= 31) {
        for (let i = 0; i < len; i++) {
          if ((outMask & (1 << i)) === 0) {
            inSlots[inLen] = slots[i]!
            inVals[inLen] = vals[i]!
            inLen++
          }
        }
      } else {
        for (let i = 0; i < len; i++) {
          const s = slots[i]!

          if (inRegion(s)) {
            inSlots[inLen] = s
            inVals[inLen] = vals[i]!
            inLen++
          }
        }
      }

      const rk = packBallKeyInt32(inSlots, inVals, inLen)
      const er = epsRe[eIdx]!
      const ei = epsIm[eIdx]!

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

    // Pass 2 (non-vacuum eps): accumulate <aEps | a_e> linearly into flat single-level table.
    const aTable = aEps.table
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
      let inMask = 0

      if (len <= 31) {
        for (let i = 0; i < len; i++) {
          const s = slots[i]!

          if (inRegion(s)) {
            inMask |= 1 << i
            inSlots[inLen] = s
            inVals[inLen] = vals[i]!
            inLen++
          }
        }
      } else {
        for (let i = 0; i < len; i++) {
          const s = slots[i]!

          if (inRegion(s)) {
            inSlots[inLen] = s
            inVals[inLen] = vals[i]!
            inLen++
          }
        }
      }

      if (inLen < 31 ? (aEpsLenMask & (1 << inLen)) === 0 : !hasLongInLen) {
        continue
      }

      const rk = packBallKeyInt32(inSlots, inVals, inLen)
      const idx = getFastKey(aTable, rk)

      if (idx === -1) {
        continue
      }

      let outLen = 0

      if (len <= 31) {
        for (let i = 0; i < len; i++) {
          if ((inMask & (1 << i)) === 0) {
            outSlots[outLen] = slots[i]!
            outVals[outLen] = vals[i]!
            outLen++
          }
        }
      } else {
        for (let i = 0; i < len; i++) {
          const s = slots[i]!

          if (!inRegion(s)) {
            outSlots[outLen] = s
            outVals[outLen] = vals[i]!
            outLen++
          }
        }
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
  let stageEkNum = new Float64Array(stageCap)
  let stageRkNum = new Float64Array(stageCap)
  let stageEkBig: Map<number, bigint> | undefined
  let stageRkBig: Map<number, bigint> | undefined
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
        const nextEkNum = new Float64Array(stageCap)
        const nextRkNum = new Float64Array(stageCap)
        const nextInLen = new Int32Array(stageCap)
        const nextRe = new Float64Array(stageCap)
        const nextIm = new Float64Array(stageCap)

        nextEkNum.set(stageEkNum)
        nextRkNum.set(stageRkNum)
        nextInLen.set(stageInLen)
        nextRe.set(stageRe)
        nextIm.set(stageIm)
        stageEkNum = nextEkNum
        stageRkNum = nextRkNum
        stageInLen = nextInLen
        stageRe = nextRe
        stageIm = nextIm
      }

      if (typeof ek === 'number') {
        stageEkNum[si] = ek
      } else {
        stageEkNum[si] = Number.NaN

        if (stageEkBig === undefined) {
          stageEkBig = new Map()
        }

        stageEkBig.set(si, ek)
      }

      if (typeof rk === 'number') {
        stageRkNum[si] = rk
      } else {
        stageRkNum[si] = Number.NaN

        if (stageRkBig === undefined) {
          stageRkBig = new Map()
        }

        stageRkBig.set(si, rk)
      }

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

  const aTable = aEps.table
  let innerProd: CxAccum | undefined

  for (let i = 0; i < stageCount; i++) {
    const inLen = stageInLen[i]!

    if (inLen < 31 ? (aEpsLenMask & (1 << inLen)) === 0 : !hasLongInLen) {
      continue
    }

    const rkn = stageRkNum[i]!
    const idx = rkn === rkn ? getNumKey(aTable, rkn) : getFastKey(aTable, stageRkBig!.get(i)!)

    if (idx === -1) {
      continue
    }

    const br = aRe[idx]!
    const bi = aIm[idx]!
    const re = stageRe[i]!
    const im = stageIm[i]!
    const ekn = stageEkNum[i]!
    const ek: FastKey = ekn === ekn ? ekn : stageEkBig!.get(i)!

    if (innerProd === undefined) {
      innerProd = createCxAccum(256)
    }

    addCxAccum(innerProd, ek, br * re + bi * im, br * im - bi * re)
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
