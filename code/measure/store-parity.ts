// THE PARITY SECTOR WITH STORES (item vibe-roadmap-grounding-0034). E-SLF-0192 (item 0032) found the working rule keeps
// the parity of every pairwise separation on the {3,4,3,4} honeycomb for loves with no store: the dock graph is
// bipartite and every love crosses one facet a beat. Its limit: the pair move's store holds a love and a fear on their
// dock while the stream moves everything else. This file holds what the experiment needs to read that piece term by
// term, on the sparse branches of code/rule/sparse-locked-knit (which hold stores and closed vibes):
//
// - `storeBeat`: sparseVetoBeat's split beat (D, the meetings and the collision with veto 'none', D, the stream),
//   step for step, with checks between the steps: every dock-local step keeps each dock's held count h (slot vibes
//   plus 2 per stored line), every stream leaves the stored lines unchanged, and the sector identity
//   Q_(t+1) = Q_t + 2 (s_other - s_same) holds branch by branch. It also reads the weight resting in stores at each
//   stream. The experiment gates it against sparseVetoBeat (0 differing) and the dense coinedVetoBeat.
// - `storeLock`: E-SLF-0190's lock (parity-sector branchLock: G of F-G on every lone frame of a dock with an occupied
//   facet neighbour, a store counting as occupied) on a sparse branch.
// - `sectorOfBranch`: Q_t and N of a branch; `ballDistance`: breadth-first distance from dock 0.
//
// NOTHING MOVES the rule: the pieces are the rule's own, exact in Z[w][1/2]; floats only in `weightOf`.

import { halfCoinBranch, loneFrames, FRAME_SLOTS } from '@/code/rule/coined-locked-knit'
import { times, type Branch, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { collideVeto, meetBranch } from '@/code/rule/occupation-veto-knit'
import {
  cloneSparse,
  lineEntries,
  mergeSparse,
  sparseKey,
  streamSparse,
  type SparseBranch,
} from '@/code/rule/sparse-locked-knit'

const SLOTS = 24
const LINES = 12
const SQ3 = Math.sqrt(3)

export type StoreChecks = {
  // dock-local steps that changed some dock's held count
  pieceViolations: number
  // streams that changed the stored lines
  storeViolations: number
  // branches where Q_(t+1) != Q_t + 2 (s_other - s_same)
  identityViolations: number
  // pre-stream branches holding a store (all beats)
  storedBranches: number
}

export const newStoreChecks = (): StoreChecks => ({
  pieceViolations: 0,
  storeViolations: 0,
  identityViolations: 0,
  storedBranches: 0,
})

const withDocks = (br: Branch, docks: Int32Array): SparseBranch => Object.assign(br, { docks })

// each local dock's held count: slot vibes plus 2 per stored line
export function heldCounts(b: Branch, m: number): string {
  const h: number[] = []

  for (let i = 0; i < m; i++) {
    let n = 0

    for (let d = 0; d < SLOTS; d++) {
      if (b.vibe[i * SLOTS + d] !== 0) {
        n++
      }
    }

    for (let l = 0; l < LINES; l++) {
      if (b.store[i * LINES + l] !== 0) {
        n += 2
      }
    }

    h.push(n)
  }

  return h.join(',')
}

// Q_t (held units on docks of colour t mod 2), N (all held units), and the stored lines on each colour class
export function sectorOfBranch(
  b: SparseBranch,
  col: Uint8Array,
  beat: number,
): { q: number; n: number; same: number; other: number } {
  let q = 0
  let n = 0
  let same = 0
  let other = 0

  for (let i = 0; i < b.docks.length; i++) {
    const on = col[b.docks[i]!] === beat % 2

    for (let d = 0; d < SLOTS; d++) {
      if (b.vibe[i * SLOTS + d] !== 0) {
        n++
        q += on ? 1 : 0
      }
    }

    for (let l = 0; l < LINES; l++) {
      if (b.store[i * LINES + l] !== 0) {
        n += 2
        q += on ? 2 : 0
        same += on ? 1 : 0
        other += on ? 0 : 1
      }
    }
  }

  return { q, n, same, other }
}

export const hasStore = (b: Branch): boolean => b.store.some(v => v !== 0)

// |amplitude|^2 of a branch, (a + b w) / 2^k
export function weightOf(b: { a: bigint; b: bigint; k: number }): number {
  const s = 2 ** -b.k
  const re = (Number(b.a) - Number(b.b) / 2) * s
  const im = ((Number(b.b) * SQ3) / 2) * s

  return re * re + im * im
}

export function amplitudeOf(b: { a: bigint; b: bigint; k: number }): [number, number] {
  const s = 2 ** -b.k

  return [(Number(b.a) - Number(b.b) / 2) * s, ((Number(b.b) * SQ3) / 2) * s]
}

// the exact norm: sum N(a + b w) 4^(K - k) against 4^K
export function exactBranchNorm(list: readonly Branch[]): { total: bigint; unit: bigint } {
  let K = 0

  for (const b of list) {
    K = Math.max(K, b.k)
  }

  let total = 0n

  for (const b of list) {
    total += (b.a * b.a - b.a * b.b + b.b * b.b) * (1n << BigInt(2 * (K - b.k)))
  }

  return { total, unit: 1n << BigInt(2 * K) }
}

// a branch list as reduced exact amplitudes keyed by whole content, and the entries where two such maps differ. A list
// with no coincident configurations (every state a beat returns: merged, then streamed one to one) is read as it is;
// one with coincident configurations is merged on clones first
export function keyedBranches(list: readonly SparseBranch[]): Map<string, string> {
  const out = new Map<string, string>()

  for (const b of list) {
    const key = sparseKey(b)

    if (out.has(key)) {
      return keyedMerged(list)
    }

    out.set(key, reducedOf(b))
  }

  return out
}

function reducedOf(x: { a: bigint; b: bigint; k: number }): string {
  let { a, b, k } = x

  while (k > 0 && a % 2n === 0n && b % 2n === 0n) {
    a /= 2n
    b /= 2n
    k--
  }

  return `${a},${b},${k}`
}

function keyedMerged(list: readonly SparseBranch[]): Map<string, string> {
  const out = new Map<string, string>()

  for (const b of mergeSparse(list.map(cloneSparse))) {
    out.set(sparseKey(b), `${b.a},${b.b},${b.k}`)
  }

  return out
}

export function keyedDiffer(a: Map<string, string>, b: Map<string, string>): number {
  let n = 0

  for (const key of new Set([...a.keys(), ...b.keys()])) {
    if (a.get(key) !== b.get(key)) {
      n++
    }
  }

  return n
}

// breadth-first distance from dock 0 on a 24-regular dock table (-1 entries skipped; unreached -1)
export function ballDistance(table: Int32Array, docks: number): Int32Array {
  const dist = new Int32Array(docks).fill(-1)
  const order = new Int32Array(docks)

  dist[0] = 0

  let head = 0
  let tail = 1

  while (head < tail) {
    const x = order[head++]!

    for (let d = 0; d < SLOTS; d++) {
      const y = table[x * SLOTS + d]!

      if (y >= 0 && dist[y] === -1) {
        dist[y] = dist[x]! + 1
        order[tail++] = y
      }
    }
  }

  return dist
}

// the half coin on every branch, each output checked to keep its docks' held counts
function halfCoinChecked(branches: readonly SparseBranch[], checks: StoreChecks): SparseBranch[] {
  const out: SparseBranch[] = []

  for (const br of branches) {
    const m = br.docks.length
    const h0 = heldCounts(br, m)

    for (const o of halfCoinBranch(m, cloneSparse(br), false)) {
      if (heldCounts(o, m) !== h0) {
        checks.pieceViolations++
      }

      out.push(withDocks(o, br.docks))
    }
  }

  return out
}

// ONE split beat of the working rule (veto 'none'), sparseVetoBeat step for step, with the checks; `col` the dock
// colouring, `rest` the weight of pre-stream branches holding a store (each weighted by `scale`)
export function storeBeat(
  t: LockedTables,
  branches: readonly SparseBranch[],
  beat: number,
  col: Uint8Array,
  checks: StoreChecks,
  scale = 1,
): { branches: SparseBranch[]; rest: number } {
  const collided: SparseBranch[] = []

  for (const br of mergeSparse(halfCoinChecked(branches, checks))) {
    const m = br.docks.length
    const lt = { ...t, cells: m }
    const h0 = heldCounts(br, m)
    const docks = br.docks

    for (const b of meetBranch(br, m, false)) {
      if (heldCounts(b, m) !== h0) {
        checks.pieceViolations++
      }

      collideVeto('none', lt, b, beat, false)

      if (heldCounts(b, m) !== h0) {
        checks.pieceViolations++
      }

      collided.push(withDocks(b, docks))
    }
  }

  const out = mergeSparse(halfCoinChecked(mergeSparse(collided), checks))
  const next: SparseBranch[] = []

  let rest = 0

  for (const b of out) {
    const before = sectorOfBranch(b, col, beat)
    const lines0 = JSON.stringify(lineEntries(b))

    if (before.same + before.other > 0) {
      checks.storedBranches++
      rest += weightOf(b) * scale
    }

    const s = streamSparse(t, b, false)

    if (JSON.stringify(lineEntries(s)) !== lines0) {
      checks.storeViolations++
    }

    const after = sectorOfBranch(s, col, beat + 1)

    if (after.q !== before.q + 2 * (before.other - before.same)) {
      checks.identityViolations++
    }

    next.push(s)
  }

  return { branches: next, rest }
}

// the lone frames E-SLF-0190's lock opens on a sparse branch: a dock with an occupied facet neighbour (a dock holding
// a vibe or a store, the branch's docks), read through the mesh's neighbour function
export function openedFrames(
  b: SparseBranch,
  nb: (x: number, d: number) => number,
): { base: number; frame: number; q: number }[] {
  const held = new Set(b.docks)

  return loneFrames(b.docks.length, b).filter(f => {
    const x = b.docks[f.base / SLOTS]!

    for (let d = 0; d < SLOTS; d++) {
      const y = nb(x, d)

      if (y >= 0 && held.has(y)) {
        return true
      }
    }

    return false
  })
}

// LF-G on one sparse branch (parity-sector branchLock, unchanged in what it does), each output checked to keep the
// docks' held counts
export function storeLock(
  b: SparseBranch,
  nb: (x: number, d: number) => number,
  checks: StoreChecks,
): SparseBranch[] {
  const lone = openedFrames(b, nb)

  if (lone.length === 0) {
    return [b]
  }

  if (lone.length > 6) {
    throw new Error(`store-parity: ${lone.length} opened locks in one branch, over the guard 6`)
  }

  const m = b.docks.length
  const h0 = heldCounts(b, m)
  const out: SparseBranch[] = []

  for (let code = 0; code < 8 ** lone.length; code++) {
    const c = cloneSparse(b)

    let rest = code

    for (const { base, frame, q } of lone) {
      const o = rest % 8
      const ss = FRAME_SLOTS[frame]!

      rest = (rest - o) / 8

      if (o === 0) {
        times(c, 3n, 0n)
        continue
      }

      const from = base + ss[q]!
      const to = base + ss[q ^ o]!

      c.vibe[to] = c.vibe[from]!
      c.point[to] = c.point[from]!
      c.open[to] = c.open[from]!
      c.vibe[from] = 0
      c.point[from] = 0
      c.open[from] = 0
      times(c, -1n, 0n)
    }

    c.k += 2 * lone.length

    if (heldCounts(c, m) !== h0) {
      checks.pieceViolations++
    }

    out.push(c)
  }

  return out
}

// LF-G THEN THE BEAT on a large state, one input branch at a time: the lock's outputs of each branch run through
// storeBeat and the streamed results are added into one map. Both pieces are linear, so the sum equals
// storeBeat(storeLockAll(list)) exactly (the experiment checks it on every state small enough to run both); only the
// partial merges inside are smaller, so the lock's 8^n outputs of every branch never sit in memory at once. The rest
// weight is read on the summed state (a stream keeps the stores, so a branch held one at its stream exactly when it
// holds one after)
export function storeLockBeat(
  t: LockedTables,
  list: readonly SparseBranch[],
  nb: (x: number, d: number) => number,
  beat: number,
  col: Uint8Array,
  checks: StoreChecks,
  scale = 1,
): { branches: SparseBranch[]; rest: number } {
  const acc = new Map<string, SparseBranch>()

  for (const b of list) {
    for (const o of storeBeat(t, storeLock(b, nb, checks), beat, col, checks).branches) {
      const key = sparseKey(o)
      const twin = acc.get(key)

      if (!twin) {
        acc.set(key, o)
        continue
      }

      const k = Math.max(twin.k, o.k)

      twin.a = twin.a * (1n << BigInt(k - twin.k)) + o.a * (1n << BigInt(k - o.k))
      twin.b = twin.b * (1n << BigInt(k - twin.k)) + o.b * (1n << BigInt(k - o.k))
      twin.k = k
    }
  }

  const branches: SparseBranch[] = []

  let rest = 0

  for (const b of acc.values()) {
    while (b.k > 0 && b.a % 2n === 0n && b.b % 2n === 0n) {
      b.a /= 2n
      b.b /= 2n
      b.k--
    }

    if (b.a === 0n && b.b === 0n) {
      continue
    }

    if (hasStore(b)) {
      rest += weightOf(b) * scale
    }

    branches.push(b)
  }

  return { branches, rest }
}

// the lock on a whole state, merged
export function storeLockAll(
  list: readonly SparseBranch[],
  nb: (x: number, d: number) => number,
  checks: StoreChecks,
): SparseBranch[] {
  return mergeSparse(list.flatMap(b => storeLock(b, nb, checks)))
}
