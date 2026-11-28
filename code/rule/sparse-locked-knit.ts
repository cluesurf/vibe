// THE WORKING RULE ON SPARSE BRANCHES: coinedVetoBeat (code/rule/coined-locked-knit,
// the coin or the split coin, then the no-veto beat of code/rule/occupation-veto-knit) on a mesh too large to hold one
// dense branch (the (sqrt 2)^6 congruence quotient: 1,048,576 docks, 108 MB a dense branch).
//
// THE BRANCH. A sparse branch keeps only its occupied docks (a dock holding a vibe or a stored pair), in increasing
// order, `docks`, and a compact configuration over them: local dock i holds global dock docks[i], its 24 slots at
// i * 24 + d and its 12 lines at i * 12 + l, in the dense layout. So every dock-local piece of the rule runs on it
// unchanged, called with `cells` = the number of occupied docks: the coin (coinLines) and the half coin
// (halfCoinBranch), the meetings (meetBranch) and the collision (collideVeto: the pair move and the bounce). Each of
// these reads and writes one dock at a time and never empties or fills a dock (a vibe moves inside its own dock, a pair
// moves between a line's slots and its store), so the docks are the same after it. Only the stream changes them: each
// vibe goes to its slot's target in the mesh's own tables (the same `target`, `source`, `move` and `back`), and the
// docks are rebuilt from where the vibes land and where the stores stay.
//
// BIT FOR BIT. The beats below are the dense beats' own sequence of steps (the same clones, merges and orders), so the
// branches come out in the same order with the same exact amplitudes; merging uses the configuration's whole content
// (global slot, vibe, point, open; global line, store, word, open bits), the same equality as sameConfiguration. The
// item's S0 gate checks it beat by beat against the dense engine on the box and the R = 4 ball.
//
// NOTHING MOVES: the stream copies each slot's value one dock along; a link holds nothing.

import {
  coinLines,
  currentCoinPlace,
  FRAME_OF_SLOT,
  FRAME_SLOTS,
  halfCoinBranch,
  LINE_SECONDS,
  type CoinPlace,
  type CoinTally,
  type MixTally,
} from '@/code/rule/coined-locked-knit'
import {
  norm,
  SPLIT_LIMIT,
  times,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'
import {
  collideVeto,
  meetBranch,
  pairWord,
  wordFirst,
  wordSecond,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'
import {
  bouncePermutation,
  BOUNCE_TABLE,
  type CollisionKind,
} from '@/code/rule/bounce-pair-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import { type Mesh } from '@/code/tool/mesh'

const SLOTS = 24
const LINES = 12

export type SparseBranch = Branch & { docks: Int32Array }

export type SparseState = { branches: SparseBranch[] }

// one held slot or stored line, by its global index
export type SlotEntry = { slot: number; vibe: number; point: number; open: number }
export type LineEntry = { line: number; store: number; spoint: number; sopen: number }

// a sparse branch from its held slots and stored lines (any order), amplitude (a + b w) / 2^k
export function sparseBranchOf(
  slots: readonly SlotEntry[],
  lines: readonly LineEntry[],
  a = 1n,
  b = 0n,
  k = 0,
): SparseBranch {
  const set = new Set<number>()

  for (const e of slots) {
    if (e.vibe !== 0) {
      set.add((e.slot / SLOTS) | 0)
    }
  }

  for (const e of lines) {
    if (e.store !== 0) {
      set.add((e.line / LINES) | 0)
    }
  }

  const docks = Int32Array.from([...set].sort((p, q) => p - q))
  const index = new Map<number, number>()

  docks.forEach((x, i) => index.set(x, i))

  const m = docks.length
  const out: SparseBranch = {
    vibe: new Int8Array(m * SLOTS),
    point: new Int8Array(m * SLOTS),
    open: new Uint8Array(m * SLOTS),
    store: new Int8Array(m * LINES),
    spoint: new Int8Array(m * LINES),
    sopen: new Uint8Array(m * LINES),
    a,
    b,
    k,
    docks,
  }

  for (const e of slots) {
    if (e.vibe === 0) {
      continue
    }

    const at = index.get((e.slot / SLOTS) | 0)! * SLOTS + (e.slot % SLOTS)

    if (out.vibe[at] !== 0) {
      throw new Error(`sparse-locked-knit: slot ${e.slot} is held twice`)
    }

    out.vibe[at] = e.vibe
    out.point[at] = e.point
    out.open[at] = e.open
  }

  for (const e of lines) {
    if (e.store === 0) {
      continue
    }

    const at = index.get((e.line / LINES) | 0)! * LINES + (e.line % LINES)

    out.store[at] = e.store
    out.spoint[at] = e.spoint
    out.sopen[at] = e.sopen
  }

  return out
}

// the held slots and stored lines of a sparse branch, by global index, in increasing order
export function slotEntries(b: SparseBranch): SlotEntry[] {
  const out: SlotEntry[] = []

  for (let i = 0; i < b.docks.length; i++) {
    const base = b.docks[i]! * SLOTS

    for (let d = 0; d < SLOTS; d++) {
      const at = i * SLOTS + d
      const v = b.vibe[at]!

      if (v !== 0) {
        out.push({ slot: base + d, vibe: v, point: b.point[at]!, open: b.open[at]! })
      }
    }
  }

  return out
}

export function lineEntries(b: SparseBranch): LineEntry[] {
  const out: LineEntry[] = []

  for (let i = 0; i < b.docks.length; i++) {
    const base = b.docks[i]! * LINES

    for (let l = 0; l < LINES; l++) {
      const at = i * LINES + l
      const v = b.store[at]!

      if (v !== 0) {
        out.push({ line: base + l, store: v, spoint: b.spoint[at]!, sopen: b.sopen[at]! })
      }
    }
  }

  return out
}

// ---- dense <-> sparse, for the proof against the dense engine ----

export function sparseFromDense(br: Branch): SparseBranch {
  const slots: SlotEntry[] = []
  const lines: LineEntry[] = []

  for (let i = 0; i < br.vibe.length; i++) {
    if (br.vibe[i] !== 0) {
      slots.push({ slot: i, vibe: br.vibe[i]!, point: br.point[i]!, open: br.open[i]! })
    }
  }

  for (let i = 0; i < br.store.length; i++) {
    if (br.store[i] !== 0) {
      lines.push({ line: i, store: br.store[i]!, spoint: br.spoint[i]!, sopen: br.sopen[i]! })
    }
  }

  return sparseBranchOf(slots, lines, br.a, br.b, br.k)
}

export function denseFromSparse(b: SparseBranch, cells: number): Branch {
  const out: Branch = {
    vibe: new Int8Array(cells * SLOTS),
    point: new Int8Array(cells * SLOTS),
    open: new Uint8Array(cells * SLOTS),
    store: new Int8Array(cells * LINES),
    spoint: new Int8Array(cells * LINES),
    sopen: new Uint8Array(cells * LINES),
    a: b.a,
    b: b.b,
    k: b.k,
  }

  for (const e of slotEntries(b)) {
    out.vibe[e.slot] = e.vibe
    out.point[e.slot] = e.point
    out.open[e.slot] = e.open
  }

  for (const e of lineEntries(b)) {
    out.store[e.line] = e.store
    out.spoint[e.line] = e.spoint
    out.sopen[e.line] = e.sopen
  }

  return out
}

// ---- branches ----

export const cloneSparse = (b: SparseBranch): SparseBranch => ({
  vibe: Int8Array.from(b.vibe),
  point: Int8Array.from(b.point),
  open: Uint8Array.from(b.open),
  store: Int8Array.from(b.store),
  spoint: Int8Array.from(b.spoint),
  sopen: Uint8Array.from(b.sopen),
  a: b.a,
  b: b.b,
  k: b.k,
  docks: b.docks,
})

// a dock-local piece's output branch, given back its docks (the piece kept them)
const withDocks = (br: Branch, docks: Int32Array): SparseBranch =>
  Object.assign(br, { docks })

// the rule's tables seen by a dock-local piece on a compact branch (the pieces read only `cells` and `collision`)
const localTables = (t: LockedTables, m: number): LockedTables => ({ ...t, cells: m })

// the whole content of a branch, equal exactly when sameConfiguration says equal
export function sparseKey(b: SparseBranch): string {
  const parts: number[] = []

  for (let i = 0; i < b.docks.length; i++) {
    const base = b.docks[i]! * SLOTS

    for (let d = 0; d < SLOTS; d++) {
      const at = i * SLOTS + d
      const v = b.vibe[at]!

      if (v !== 0) {
        parts.push(base + d, v, b.point[at]!, b.open[at]!)
      }
    }
  }

  parts.push(-9)

  for (let i = 0; i < b.docks.length; i++) {
    const base = b.docks[i]! * LINES

    for (let l = 0; l < LINES; l++) {
      const at = i * LINES + l
      const v = b.store[at]!

      if (v !== 0) {
        parts.push(base + l, v, b.spoint[at]!, b.sopen[at]!)
      }
    }
  }

  return parts.join(',')
}

function reduceBranch(b: Branch): void {
  while (b.k > 0 && b.a % 2n === 0n && b.b % 2n === 0n) {
    b.a /= 2n
    b.b /= 2n
    b.k--
  }
}

// mergeBranches (code/rule/doublet-locked-knit) on sparse branches: coincident configurations added, first occurrence
// order kept, amplitudes reduced, zeros dropped
export function mergeSparse(list: SparseBranch[], tally?: LockedTally): SparseBranch[] {
  if (list.length === 1) {
    reduceBranch(list[0]!)

    return list
  }

  const seen = new Map<string, SparseBranch>()
  const out: SparseBranch[] = []

  for (const b of list) {
    const key = sparseKey(b)
    const twin = seen.get(key)

    if (!twin) {
      seen.set(key, b)
      out.push(b)
      continue
    }

    if (tally) {
      tally.merged++
    }

    const k = Math.max(twin.k, b.k)
    const s1 = 1n << BigInt(k - twin.k)
    const s2 = 1n << BigInt(k - b.k)

    twin.a = twin.a * s1 + b.a * s2
    twin.b = twin.b * s1 + b.b * s2
    twin.k = k
  }

  return out.filter(b => {
    reduceBranch(b)

    return b.a !== 0n || b.b !== 0n
  })
}

// ---- the stream ----

// streamConfiguration on a sparse branch: a new branch (its docks rebuilt), the amplitude carried
export function streamSparse(
  t: LockedTables,
  b: SparseBranch,
  inverse: boolean,
): SparseBranch {
  const slots: SlotEntry[] = []

  for (let i = 0; i < b.docks.length; i++) {
    const base = b.docks[i]! * SLOTS

    for (let d = 0; d < SLOTS; d++) {
      const at = i * SLOTS + d
      const v = b.vibe[at]!

      if (v === 0) {
        continue
      }

      const slot = base + d
      const p = b.point[at]!

      slots.push({
        slot: (inverse ? t.source[slot] : t.target[slot])!,
        vibe: v,
        point: (inverse ? t.back[slot * 9 + p] : t.move[slot * 9 + p])!,
        open: b.open[at]!,
      })
    }
  }

  return sparseBranchOf(slots, lineEntries(b), b.a, b.b, b.k)
}

// ---- one beat, and its exact inverse ----

// vetoBeat (code/rule/occupation-veto-knit) on sparse branches
function vetoSparse(
  kind: VetoKind,
  t: LockedTables,
  branches: readonly SparseBranch[],
  beat: number,
  tally?: LockedTally,
): SparseBranch[] {
  const next: SparseBranch[] = []

  for (const br of branches) {
    const m = br.docks.length
    const lt = localTables(t, m)

    for (const b of meetBranch(cloneSparse(br), m, false, tally)) {
      collideVeto(kind, lt, b, beat, false, tally)
      next.push(streamSparse(t, withDocks(b, br.docks), false))
    }
  }

  return mergeSparse(next, tally)
}

function vetoSparseBack(
  kind: VetoKind,
  t: LockedTables,
  branches: readonly SparseBranch[],
  beat: number,
): SparseBranch[] {
  const next: SparseBranch[] = []

  for (const br of branches) {
    const b = streamSparse(t, br, true)
    const m = b.docks.length

    collideVeto(kind, localTables(t, m), b, beat, true)

    for (const o of meetBranch(b, m, true)) {
      next.push(withDocks(o, b.docks))
    }
  }

  return mergeSparse(next)
}

function coinAll(
  branches: readonly SparseBranch[],
  adjoint: boolean,
  half: boolean,
  coinTally?: CoinTally,
): SparseBranch[] {
  const out: SparseBranch[] = []

  for (const br of branches) {
    const m = br.docks.length
    const pieces = half
      ? halfCoinBranch(m, cloneSparse(br), adjoint, coinTally)
      : coinLines(m, cloneSparse(br), adjoint, coinTally)

    for (const o of pieces) {
      out.push(withDocks(o, br.docks))
    }
  }

  return out
}

// coinedVetoBeat on sparse branches, with the coin place in force (currentCoinPlace)
export function sparseVetoBeat(
  kind: VetoKind,
  t: LockedTables,
  s: SparseState,
  beat: number,
  tally?: LockedTally,
  coinTally?: CoinTally,
): SparseState {
  if (currentCoinPlace() === 'split') {
    // S D Y_t D: the half coin, the meetings and collision, the half coin, the stream
    const collided: SparseBranch[] = []

    for (const br of mergeSparse(coinAll(s.branches, false, true, coinTally))) {
      const m = br.docks.length
      const lt = localTables(t, m)

      for (const b of meetBranch(br, m, false, tally)) {
        collideVeto(kind, lt, b, beat, false, tally)
        collided.push(withDocks(b, br.docks))
      }
    }

    const out = mergeSparse(coinAll(mergeSparse(collided, tally), false, true, coinTally))

    return { branches: out.map(b => streamSparse(t, b, false)) }
  }

  const coined = mergeSparse(coinAll(s.branches, false, false, coinTally))

  return { branches: vetoSparse(kind, t, coined, beat, tally) }
}

export function sparseVetoBeatBack(
  kind: VetoKind,
  t: LockedTables,
  s: SparseState,
  beat: number,
): SparseState {
  if (currentCoinPlace() === 'split') {
    // D^-1 Y_t^-1 D^-1 S^-1
    const unstreamed = s.branches.map(br => streamSparse(t, br, true))
    const met: SparseBranch[] = []

    for (const b of mergeSparse(coinAll(unstreamed, true, true))) {
      const m = b.docks.length

      collideVeto(kind, localTables(t, m), b, beat, true)

      for (const o of meetBranch(b, m, true)) {
        met.push(withDocks(o, b.docks))
      }
    }

    return { branches: mergeSparse(coinAll(mergeSparse(met), true, true)) }
  }

  const back = vetoSparseBack(kind, t, s.branches, beat)

  return { branches: mergeSparse(coinAll(back, true, false)) }
}

// =================================================================================================
// SLOT-SPARSE LOCKED ENGINE: O(active slots + active stores) per branch, O(1) memory on bare meshes
// =================================================================================================
//
// Each SparseLockedBranch stores ONLY its strictly sorted active occupied slots
// (`slots`, `vibe`, `point`, `open`) and strictly sorted active stored lines
// (`storeLines`, `store`, `spoint`, `sopen`), plus exact Eisenstein amplitude `(a + b w) / 2^k`.
//
// Every dock-local operation walks only active docks via a zero-allocation two-pointer scan over
// `slots` and `storeLines`, and streaming touches only active slots via `SparseTables` (wrapping
// either a `LockedTables` or a bare `Mesh` with flat identity links and zero table allocation).
// Bit-for-bit identical in Z[w][1/2] (and Z[w][1/6] for M_pair) to the dense rules in
// doublet-locked-knit, occupation-veto-knit, coined-locked-knit, and pair-line-mixer.

const EMPTY_I32 = new Int32Array(0)
const EMPTY_I8 = new Int8Array(0)
const EMPTY_U8 = new Uint8Array(0)

const LINE_FIRST_U8 = Uint8Array.from(LINE_FIRSTS)
const LINE_SECOND_U8 = Uint8Array.from(LINE_SECONDS)
const OPPOSITE_U8 = Uint8Array.from(OPPOSITE)
const LINE_OF_U8 = Uint8Array.from(LINE_OF)
const FRAME_OF_SLOT_U8 = Uint8Array.from(FRAME_OF_SLOT)
const FRAME_SLOTS_FLAT = new Uint8Array(24)
const FRAME_Q_OF_SLOT_U8 = new Uint8Array(24)

for (let f = 0; f < 3; f++) {
  const ss = FRAME_SLOTS[f]!

  for (let q = 0; q < 8; q++) {
    const d = ss[q]!

    FRAME_SLOTS_FLAT[f * 8 + q] = d
    FRAME_Q_OF_SLOT_U8[d] = q
  }
}

// Meeting coefficients in Z[w][1/2] (forward row 0, adjoint row 1)
const MEET_KEEP: readonly [bigint, bigint][] = [
  [1n, 1n],
  [0n, -1n],
]
const MEET_EXCHANGE: readonly [bigint, bigint][] = [
  [-1n, 1n],
  [-2n, -1n],
]
const MEET_PHASE: readonly [bigint, bigint][] = [
  [0n, 1n],
  [-1n, -1n],
]

// Full coin C coefficients in Z[w][1/2] (forward row 0, adjoint row 1)
const COIN_KEEP: readonly [bigint, bigint][] = [
  [1n, 1n],
  [0n, -1n],
]
const COIN_CROSS: readonly [bigint, bigint][] = [
  [1n, -1n],
  [2n, 1n],
]
const COIN_DET: readonly [bigint, bigint][] = [
  [0n, 1n],
  [-1n, -1n],
]

// Half coin D = C^(1/2) coefficients in Z[w][1/2] (forward row 0, adjoint row 1)
const HALF_COIN_KEEP: readonly [bigint, bigint][] = [
  [2n, 1n],
  [1n, -1n],
]
const HALF_COIN_CROSS: readonly [bigint, bigint][] = [
  [0n, -1n],
  [1n, 1n],
]
const HALF_COIN_DET: readonly [bigint, bigint][] = [
  [1n, 1n],
  [0n, -1n],
]

// ---- Lightweight streaming tables: wraps LockedTables OR computes directly from Mesh ----

export type SparseTables = {
  readonly cells: number
  readonly collision: CollisionKind
  readonly veto: boolean
  readonly identityLinks: boolean
  targetOf(slot: number): number
  sourceOf(slot: number): number
  moveOf(slot: number, p: number): number
  backOf(slot: number, p: number): number
}

export type AnyLockedTables = LockedTables | SparseTables

export function sparseTablesFromLocked(t: LockedTables): SparseTables {
  const { target, source, move, back } = t

  return {
    cells: t.cells,
    collision: t.collision,
    veto: t.veto,
    identityLinks: false,
    targetOf: slot => target[slot]!,
    sourceOf: slot => source[slot]!,
    moveOf: (slot, p) => move[slot * 9 + p]!,
    backOf: (slot, p) => back[slot * 9 + p]!,
  }
}

export function sparseTablesFromMesh(
  mesh: Mesh,
  collision: CollisionKind = 'lone',
  veto = true,
): SparseTables {
  if (mesh.degree !== SLOTS) {
    throw new Error(
      `sparseTablesFromMesh: mesh degree is ${mesh.degree}, expected ${SLOTS}`,
    )
  }

  for (let d = 0; d < SLOTS; d++) {
    if (mesh.opposite(d) !== OPPOSITE_U8[d]) {
      throw new Error(
        `sparseTablesFromMesh: opposite of slot ${d} is ${mesh.opposite(d)}, not ${OPPOSITE_U8[d]} (labels not in rootsD4 order)`,
      )
    }
  }

  return {
    cells: mesh.cellCount,
    collision,
    veto,
    identityLinks: true,
    targetOf(slot) {
      const x = (slot / SLOTS) | 0
      const d = slot - x * SLOTS
      const y = mesh.neighbour(x, d)

      return y < 0 ? x * SLOTS + OPPOSITE_U8[d]! : y * SLOTS + d
    },
    sourceOf(slot) {
      const x = (slot / SLOTS) | 0
      const d = slot - x * SLOTS
      const od = OPPOSITE_U8[d]!
      const y = mesh.neighbour(x, od)

      return y < 0 ? x * SLOTS + od : y * SLOTS + d
    },
    moveOf(_slot, p) {
      return p
    },
    backOf(_slot, p) {
      return p
    },
  }
}

function isSparseTables(t: AnyLockedTables): t is SparseTables {
  return 'targetOf' in t
}

// ---- Slot-sparse configuration, branch, and state ----

export type SparseConfiguration = {
  slots: Int32Array
  vibe: Int8Array
  point: Int8Array
  open: Uint8Array
  storeLines: Int32Array
  store: Int8Array
  spoint: Int8Array
  sopen: Uint8Array
}

export type SparseLockedBranch = SparseConfiguration & {
  a: bigint
  b: bigint
  k: number
}

export type SparseLockedState = {
  branches: SparseLockedBranch[]
}

export function emptySparseConfiguration(): SparseConfiguration {
  return {
    slots: EMPTY_I32,
    vibe: EMPTY_I8,
    point: EMPTY_I8,
    open: EMPTY_U8,
    storeLines: EMPTY_I32,
    store: EMPTY_I8,
    spoint: EMPTY_I8,
    sopen: EMPTY_U8,
  }
}

export function cloneSparseConfiguration(
  c: SparseConfiguration,
): SparseConfiguration {
  return {
    slots: c.slots.length === 0 ? EMPTY_I32 : Int32Array.from(c.slots),
    vibe: c.vibe.length === 0 ? EMPTY_I8 : Int8Array.from(c.vibe),
    point: c.point.length === 0 ? EMPTY_I8 : Int8Array.from(c.point),
    open: c.open.length === 0 ? EMPTY_U8 : Uint8Array.from(c.open),
    storeLines:
      c.storeLines.length === 0 ? EMPTY_I32 : Int32Array.from(c.storeLines),
    store: c.store.length === 0 ? EMPTY_I8 : Int8Array.from(c.store),
    spoint: c.spoint.length === 0 ? EMPTY_I8 : Int8Array.from(c.spoint),
    sopen: c.sopen.length === 0 ? EMPTY_U8 : Uint8Array.from(c.sopen),
  }
}

export function cloneSparseBranch(b: SparseLockedBranch): SparseLockedBranch {
  return {
    slots: b.slots.length === 0 ? EMPTY_I32 : Int32Array.from(b.slots),
    vibe: b.vibe.length === 0 ? EMPTY_I8 : Int8Array.from(b.vibe),
    point: b.point.length === 0 ? EMPTY_I8 : Int8Array.from(b.point),
    open: b.open.length === 0 ? EMPTY_U8 : Uint8Array.from(b.open),
    storeLines:
      b.storeLines.length === 0 ? EMPTY_I32 : Int32Array.from(b.storeLines),
    store: b.store.length === 0 ? EMPTY_I8 : Int8Array.from(b.store),
    spoint: b.spoint.length === 0 ? EMPTY_I8 : Int8Array.from(b.spoint),
    sopen: b.sopen.length === 0 ? EMPTY_U8 : Uint8Array.from(b.sopen),
    a: b.a,
    b: b.b,
    k: b.k,
  }
}

export function sparseLockedState(c: SparseConfiguration): SparseLockedState {
  return {
    branches: [{ ...cloneSparseConfiguration(c), a: 1n, b: 0n, k: 0 }],
  }
}

// Build a slot-sparse branch directly from slot/line entry lists (any input order)
export function sparseLockedBranchOf(
  slotList: readonly SlotEntry[],
  lineList: readonly LineEntry[],
  a = 1n,
  b = 0n,
  k = 0,
): SparseLockedBranch {
  const activeSlots = slotList.filter(e => e.vibe !== 0)
  const activeLines = lineList.filter(e => e.store !== 0)

  activeSlots.sort((p, q) => p.slot - q.slot)
  activeLines.sort((p, q) => p.line - q.line)

  const ns = activeSlots.length
  const nl = activeLines.length
  const slots = ns === 0 ? EMPTY_I32 : new Int32Array(ns)
  const vibe = ns === 0 ? EMPTY_I8 : new Int8Array(ns)
  const point = ns === 0 ? EMPTY_I8 : new Int8Array(ns)
  const open = ns === 0 ? EMPTY_U8 : new Uint8Array(ns)

  for (let i = 0; i < ns; i++) {
    const e = activeSlots[i]!

    if (i > 0 && e.slot === slots[i - 1]) {
      throw new Error(`sparse-locked-knit: slot ${e.slot} is held twice`)
    }

    slots[i] = e.slot
    vibe[i] = e.vibe
    point[i] = e.point
    open[i] = e.open
  }

  const storeLines = nl === 0 ? EMPTY_I32 : new Int32Array(nl)
  const store = nl === 0 ? EMPTY_I8 : new Int8Array(nl)
  const spoint = nl === 0 ? EMPTY_I8 : new Int8Array(nl)
  const sopen = nl === 0 ? EMPTY_U8 : new Uint8Array(nl)

  for (let i = 0; i < nl; i++) {
    const e = activeLines[i]!

    if (i > 0 && e.line === storeLines[i - 1]) {
      throw new Error(`sparse-locked-knit: store line ${e.line} is held twice`)
    }

    storeLines[i] = e.line
    store[i] = e.store
    spoint[i] = e.spoint
    sopen[i] = e.sopen
  }

  return { slots, vibe, point, open, storeLines, store, spoint, sopen, a, b, k }
}

// Exact typed-array byte footprint of a slot-sparse branch
export function sparseBranchBytes(b: SparseLockedBranch): number {
  return (
    b.slots.byteLength +
    b.vibe.byteLength +
    b.point.byteLength +
    b.open.byteLength +
    b.storeLines.byteLength +
    b.store.byteLength +
    b.spoint.byteLength +
    b.sopen.byteLength
  )
}

// ---- Interoperability converters: Dense <-> Slot-Sparse ----

export function toSparseConfiguration(c: Configuration): SparseConfiguration {
  let ns = 0

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0) {
      ns++
    }
  }

  let nl = 0

  for (let i = 0; i < c.store.length; i++) {
    if (c.store[i] !== 0) {
      nl++
    }
  }

  const slots = ns === 0 ? EMPTY_I32 : new Int32Array(ns)
  const vibe = ns === 0 ? EMPTY_I8 : new Int8Array(ns)
  const point = ns === 0 ? EMPTY_I8 : new Int8Array(ns)
  const open = ns === 0 ? EMPTY_U8 : new Uint8Array(ns)

  if (ns > 0) {
    let p = 0

    for (let i = 0; i < c.vibe.length; i++) {
      const v = c.vibe[i]!

      if (v !== 0) {
        slots[p] = i
        vibe[p] = v
        point[p] = c.point[i]!
        open[p] = c.open[i]!
        p++
      }
    }
  }

  const storeLines = nl === 0 ? EMPTY_I32 : new Int32Array(nl)
  const store = nl === 0 ? EMPTY_I8 : new Int8Array(nl)
  const spoint = nl === 0 ? EMPTY_I8 : new Int8Array(nl)
  const sopen = nl === 0 ? EMPTY_U8 : new Uint8Array(nl)

  if (nl > 0) {
    let p = 0

    for (let i = 0; i < c.store.length; i++) {
      const v = c.store[i]!

      if (v !== 0) {
        storeLines[p] = i
        store[p] = v
        spoint[p] = c.spoint[i]!
        sopen[p] = c.sopen[i]!
        p++
      }
    }
  }

  return { slots, vibe, point, open, storeLines, store, spoint, sopen }
}

export function fromSparseConfiguration(
  c: SparseConfiguration,
  cells: number,
): Configuration {
  const vibe = new Int8Array(cells * SLOTS)
  const point = new Int8Array(cells * SLOTS)
  const open = new Uint8Array(cells * SLOTS)
  const store = new Int8Array(cells * LINES)
  const spoint = new Int8Array(cells * LINES)
  const sopen = new Uint8Array(cells * LINES)

  for (let i = 0; i < c.slots.length; i++) {
    const s = c.slots[i]!

    vibe[s] = c.vibe[i]!
    point[s] = c.point[i]!
    open[s] = c.open[i]!
  }

  for (let i = 0; i < c.storeLines.length; i++) {
    const l = c.storeLines[i]!

    store[l] = c.store[i]!
    spoint[l] = c.spoint[i]!
    sopen[l] = c.sopen[i]!
  }

  return { vibe, point, open, store, spoint, sopen }
}

export function toSparseBranch(br: Branch): SparseLockedBranch {
  return {
    ...toSparseConfiguration(br),
    a: br.a,
    b: br.b,
    k: br.k,
  }
}

export function fromSparseBranch(
  br: SparseLockedBranch,
  cells: number,
): Branch {
  return {
    ...fromSparseConfiguration(br, cells),
    a: br.a,
    b: br.b,
    k: br.k,
  }
}

export function toSparseState(s: LockedState): SparseLockedState {
  return { branches: s.branches.map(toSparseBranch) }
}

export function fromSparseState(
  s: SparseLockedState,
  cells: number,
): LockedState {
  return { branches: s.branches.map(b => fromSparseBranch(b, cells)) }
}

// ---- Fast in-place sorting of parallel slot arrays (zero allocation, deterministic) ----

function sortSlotsInPlace(
  slots: Int32Array,
  vibe: Int8Array,
  point: Int8Array,
  open: Uint8Array,
): void {
  const n = slots.length

  if (n <= 1) {
    return
  }

  if (n <= 32) {
    for (let i = 1; i < n; i++) {
      const s = slots[i]!

      if (s >= slots[i - 1]!) {
        continue
      }

      const v = vibe[i]!
      const p = point[i]!
      const o = open[i]!

      let j = i - 1

      while (j >= 0 && slots[j]! > s) {
        slots[j + 1] = slots[j]!
        vibe[j + 1] = vibe[j]!
        point[j + 1] = point[j]!
        open[j + 1] = open[j]!
        j--
      }

      slots[j + 1] = s
      vibe[j + 1] = v
      point[j + 1] = p
      open[j + 1] = o
    }

    return
  }

  // Deterministic in-place heapsort for larger active counts
  const siftDown = (start: number, end: number): void => {
    let idx = start

    while (true) {
      const left = idx * 2 + 1

      if (left > end) {
        break
      }

      let largest = idx

      if (slots[left]! > slots[largest]!) {
        largest = left
      }

      const right = left + 1

      if (right <= end && slots[right]! > slots[largest]!) {
        largest = right
      }

      if (largest === idx) {
        break
      }

      const ts = slots[idx]!
      const tv = vibe[idx]!
      const tp = point[idx]!
      const to = open[idx]!

      slots[idx] = slots[largest]!
      vibe[idx] = vibe[largest]!
      point[idx] = point[largest]!
      open[idx] = open[largest]!
      slots[largest] = ts
      vibe[largest] = tv
      point[largest] = tp
      open[largest] = to
      idx = largest
    }
  }

  for (let i = (n >> 1) - 1; i >= 0; i--) {
    siftDown(i, n - 1)
  }

  for (let end = n - 1; end > 0; end--) {
    const ts = slots[0]!
    const tv = vibe[0]!
    const tp = point[0]!
    const to = open[0]!

    slots[0] = slots[end]!
    vibe[0] = vibe[end]!
    point[0] = point[end]!
    open[0] = open[end]!
    slots[end] = ts
    vibe[end] = tv
    point[end] = tp
    open[end] = to
    siftDown(0, end - 1)
  }
}

// ---- Fast canonical 53-bit numeric hashing, exact equality, and branch merging ----

export function hashSparseConfiguration(c: SparseConfiguration): number {
  const ns = c.slots.length
  const nl = c.storeLines.length

  let h1 = (2166136261 ^ ns ^ (nl << 16)) >>> 0
  let h2 = (5381 + ns * 33 + nl * 131) >>> 0

  for (let i = 0; i < ns; i++) {
    const s = c.slots[i]!
    const packed = ((c.vibe[i]! + 1) | (c.point[i]! << 2) | (c.open[i]! << 6))

    h1 = Math.imul(h1 ^ s, 16777619) >>> 0
    h1 = Math.imul(h1 ^ packed, 16777619) >>> 0
    h2 = (Math.imul(h2, 33) ^ s ^ (packed * 2654435761)) >>> 0
  }

  h1 = Math.imul(h1 ^ 0x9e3779b9, 16777619) >>> 0
  h2 = (Math.imul(h2, 33) + 255) >>> 0

  for (let i = 0; i < nl; i++) {
    const l = c.storeLines[i]!
    const packed =
      ((c.store[i]! + 1) | (c.spoint[i]! << 2) | (c.sopen[i]! << 9))

    h1 = Math.imul(h1 ^ l, 16777619) >>> 0
    h1 = Math.imul(h1 ^ packed, 16777619) >>> 0
    h2 = (Math.imul(h2, 33) ^ l ^ (packed * 2654435761)) >>> 0
  }

  return h1 * 2097152 + (h2 & 0x1fffff)
}

export function sameSparseConfiguration(
  a: SparseConfiguration,
  b: SparseConfiguration,
): boolean {
  const ns = a.slots.length

  if (ns !== b.slots.length) {
    return false
  }

  const nl = a.storeLines.length

  if (nl !== b.storeLines.length) {
    return false
  }

  for (let i = 0; i < ns; i++) {
    if (
      a.slots[i] !== b.slots[i] ||
      a.vibe[i] !== b.vibe[i] ||
      a.point[i] !== b.point[i] ||
      a.open[i] !== b.open[i]
    ) {
      return false
    }
  }

  for (let i = 0; i < nl; i++) {
    if (
      a.storeLines[i] !== b.storeLines[i] ||
      a.store[i] !== b.store[i] ||
      a.spoint[i] !== b.spoint[i] ||
      a.sopen[i] !== b.sopen[i]
    ) {
      return false
    }
  }

  return true
}

function reduceSparseBranch(b: SparseLockedBranch): void {
  while (b.k > 0 && (b.a & 1n) === 0n && (b.b & 1n) === 0n) {
    b.a >>= 1n
    b.b >>= 1n
    b.k--
  }
}

export function mergeSparseBranches(
  list: SparseLockedBranch[],
  tally?: LockedTally,
): SparseLockedBranch[] {
  if (list.length === 0) {
    return list
  }

  if (list.length === 1) {
    reduceSparseBranch(list[0]!)

    return list
  }

  const buckets = new Map<number, SparseLockedBranch | SparseLockedBranch[]>()
  const out: SparseLockedBranch[] = []

  for (let idx = 0; idx < list.length; idx++) {
    const b = list[idx]!
    const key = hashSparseConfiguration(b)
    const entry = buckets.get(key)

    if (entry === undefined) {
      buckets.set(key, b)
      out.push(b)
      continue
    }

    let twin: SparseLockedBranch | undefined

    if (Array.isArray(entry)) {
      for (let j = 0; j < entry.length; j++) {
        if (sameSparseConfiguration(entry[j]!, b)) {
          twin = entry[j]!
          break
        }
      }

      if (!twin) {
        entry.push(b)
        out.push(b)
        continue
      }
    } else if (sameSparseConfiguration(entry, b)) {
      twin = entry
    } else {
      buckets.set(key, [entry, b])
      out.push(b)
      continue
    }

    if (tally) {
      tally.merged++
    }

    if (twin.k === b.k) {
      twin.a += b.a
      twin.b += b.b
    } else if (twin.k < b.k) {
      const shift = BigInt(b.k - twin.k)

      twin.a = (twin.a << shift) + b.a
      twin.b = (twin.b << shift) + b.b
      twin.k = b.k
    } else {
      const shift = BigInt(twin.k - b.k)

      twin.a += b.a << shift
      twin.b += b.b << shift
    }
  }

  const kept: SparseLockedBranch[] = []

  for (let i = 0; i < out.length; i++) {
    const b = out[i]!

    reduceSparseBranch(b)

    if (b.a !== 0n || b.b !== 0n) {
      kept.push(b)
    }
  }

  return kept
}

export function sparseLockedNorm(s: SparseLockedState): {
  total: bigint
  unit: bigint
} {
  let K = 0

  for (let i = 0; i < s.branches.length; i++) {
    const k = s.branches[i]!.k

    if (k > K) {
      K = k
    }
  }

  let total = 0n

  for (let i = 0; i < s.branches.length; i++) {
    const b = s.branches[i]!

    total += norm(b.a, b.b) << BigInt(2 * (K - b.k))
  }

  return { total, unit: 1n << BigInt(2 * K) }
}

// ---- Reusable single-dock scratch buffers (zero per-call allocation) ----

const DOCK_IDX = new Int32Array(SLOTS).fill(-1)
const DOCK_VIBE = new Int8Array(SLOTS)
const DOCK_POINT = new Int8Array(SLOTS)
const DOCK_OPEN = new Uint8Array(SLOTS)
const DOCK_STORE = new Int8Array(LINES)
const DOCK_SPOINT = new Int8Array(LINES)
const DOCK_SOPEN = new Uint8Array(LINES)
const DOCK_PERM = new Int32Array(SLOTS)
const DOCK_SV = new Int8Array(SLOTS)
const DOCK_SP = new Int8Array(SLOTS)
const DOCK_SO = new Uint8Array(SLOTS)
const DOCK_LOVES = new Int32Array(9)
const DOCK_FEARS = new Int32Array(9)

let scratchCapSlots = 256
let scratchSlots = new Int32Array(scratchCapSlots)
let scratchVibe = new Int8Array(scratchCapSlots)
let scratchPoint = new Int8Array(scratchCapSlots)
let scratchOpen = new Uint8Array(scratchCapSlots)

let scratchCapLines = 128
let scratchLines = new Int32Array(scratchCapLines)
let scratchStore = new Int8Array(scratchCapLines)
let scratchSpoint = new Int8Array(scratchCapLines)
let scratchSopen = new Uint8Array(scratchCapLines)

function ensureSlotScratch(need: number): void {
  if (need <= scratchCapSlots) {
    return
  }

  while (scratchCapSlots < need) {
    scratchCapSlots *= 2
  }

  const ns = new Int32Array(scratchCapSlots)
  const nv = new Int8Array(scratchCapSlots)
  const np = new Int8Array(scratchCapSlots)
  const no = new Uint8Array(scratchCapSlots)

  ns.set(scratchSlots)
  nv.set(scratchVibe)
  np.set(scratchPoint)
  no.set(scratchOpen)
  scratchSlots = ns
  scratchVibe = nv
  scratchPoint = np
  scratchOpen = no
}

function ensureLineScratch(need: number): void {
  if (need <= scratchCapLines) {
    return
  }

  while (scratchCapLines < need) {
    scratchCapLines *= 2
  }

  const nl = new Int32Array(scratchCapLines)
  const ns = new Int8Array(scratchCapLines)
  const np = new Int8Array(scratchCapLines)
  const no = new Uint8Array(scratchCapLines)

  nl.set(scratchLines)
  ns.set(scratchStore)
  np.set(scratchSpoint)
  no.set(scratchSopen)
  scratchLines = nl
  scratchStore = ns
  scratchSpoint = np
  scratchSopen = no
}

// ---- Meetings (O(active slots), exact match to meetBranch) ----

export function sparseMeetBranch(
  br: SparseLockedBranch,
  adjoint: boolean,
  tally?: LockedTally,
): SparseLockedBranch[] {
  const ns = br.slots.length

  if (ns < 2) {
    return [br]
  }

  const side = adjoint ? 1 : 0
  const [pu, pv] = MEET_PHASE[side]!
  const splitI: number[] = []
  const splitJ: number[] = []

  let si = 0

  while (si < ns) {
    const dock = (br.slots[si]! / SLOTS) | 0
    const base = dock * SLOTS

    let siEnd = si + 1

    while (siEnd < ns && ((br.slots[siEnd]! / SLOTS) | 0) === dock) {
      siEnd++
    }

    if (siEnd - si >= 2) {
      for (let i = si; i < siEnd; i++) {
        DOCK_IDX[br.slots[i]! - base] = i
      }

      for (let l = 0; l < LINES; l++) {
        const idxI = DOCK_IDX[LINE_FIRST_U8[l]!]!
        const idxJ = DOCK_IDX[LINE_SECOND_U8[l]!]!

        if (idxI < 0 || idxJ < 0 || !br.open[idxI] || !br.open[idxJ]) {
          continue
        }

        if (br.vibe[idxI] !== br.vibe[idxJ]) {
          if (tally) {
            tally.unlikeMeetings++
          }

          continue
        }

        if (tally) {
          tally.likeMeetings++
        }

        if (br.point[idxI] === br.point[idxJ]) {
          times(br, pu, pv)

          if (tally) {
            tally.phaseMeetings++
          }
        } else {
          splitI.push(idxI)
          splitJ.push(idxJ)
        }
      }

      for (let i = si; i < siEnd; i++) {
        DOCK_IDX[br.slots[i]! - base] = -1
      }
    }

    si = siEnd
  }

  const nSplit = splitI.length

  if (nSplit === 0) {
    return [br]
  }

  if (nSplit > SPLIT_LIMIT) {
    throw new Error(
      `a branch meets at ${nSplit} unequal-point like meetings in one beat, over the guard ${SPLIT_LIMIT}`,
    )
  }

  if (tally) {
    tally.splitMeetings += nSplit
  }

  const [ku, kv] = MEET_KEEP[side]!
  const [eu, ev] = MEET_EXCHANGE[side]!
  const total = 1 << nSplit
  const out: SparseLockedBranch[] = new Array(total)

  for (let mask = 0; mask < total; mask++) {
    const b = mask === total - 1 ? br : cloneSparseBranch(br)

    for (let n = 0; n < nSplit; n++) {
      if ((mask >> n) & 1) {
        const ii = splitI[n]!
        const jj = splitJ[n]!
        const tmp = b.point[ii]!

        b.point[ii] = b.point[jj]!
        b.point[jj] = tmp
        times(b, eu, ev)
      } else {
        times(b, ku, kv)
      }
    }

    b.k += nSplit
    out[mask] = b
  }

  return out
}

// ---- Coin (full C and half D, O(active slots), exact match to coinLines / halfCoinBranch) ----

function applySparseCoin(
  br: SparseLockedBranch,
  adjoint: boolean,
  half: boolean,
  tally?: CoinTally,
): SparseLockedBranch[] {
  const ns = br.slots.length

  if (ns === 0) {
    return [br]
  }

  const side = adjoint ? 1 : 0
  const [du, dv] = (half ? HALF_COIN_DET : COIN_DET)[side]!
  const halfIdx: number[] = []
  const halfTo: number[] = []

  let si = 0

  while (si < ns) {
    const dock = (br.slots[si]! / SLOTS) | 0
    const base = dock * SLOTS

    let siEnd = si + 1

    while (siEnd < ns && ((br.slots[siEnd]! / SLOTS) | 0) === dock) {
      siEnd++
    }

    if (siEnd - si === 1) {
      if (br.open[si]) {
        const d = br.slots[si]! - base

        halfIdx.push(si)
        halfTo.push(base + OPPOSITE_U8[d]!)
      }
    } else {
      for (let i = si; i < siEnd; i++) {
        DOCK_IDX[br.slots[i]! - base] = i
      }

      for (let l = 0; l < LINES; l++) {
        const f = LINE_FIRST_U8[l]!
        const s = LINE_SECOND_U8[l]!
        const idxI = DOCK_IDX[f]!
        const idxJ = DOCK_IDX[s]!

        if (idxI >= 0 && idxJ >= 0) {
          if (br.open[idxI] && br.open[idxJ]) {
            times(br, du, dv)

            if (tally) {
              tally.determinants++
            }
          }

          continue
        }

        if (idxI >= 0 && br.open[idxI]) {
          halfIdx.push(idxI)
          halfTo.push(base + s)
        } else if (idxJ >= 0 && br.open[idxJ]) {
          halfIdx.push(idxJ)
          halfTo.push(base + f)
        }
      }

      for (let i = si; i < siEnd; i++) {
        DOCK_IDX[br.slots[i]! - base] = -1
      }
    }

    si = siEnd
  }

  const nHalves = halfIdx.length

  if (nHalves === 0) {
    return [br]
  }

  if (nHalves > 20) {
    throw new Error(
      `coined-locked-knit: ${nHalves} half-full open lines in one branch, over the guard 20`,
    )
  }

  if (tally) {
    tally.splits += nHalves
  }

  const [ku, kv] = (half ? HALF_COIN_KEEP : COIN_KEEP)[side]!
  const [cu, cv] = (half ? HALF_COIN_CROSS : COIN_CROSS)[side]!
  const total = 1 << nHalves
  const out: SparseLockedBranch[] = new Array(total)

  for (let mask = 0; mask < total; mask++) {
    const b = mask === total - 1 ? br : cloneSparseBranch(br)

    let moved = false

    for (let n = 0; n < nHalves; n++) {
      if ((mask >> n) & 1) {
        b.slots[halfIdx[n]!] = halfTo[n]!
        moved = true
        times(b, cu, cv)
      } else {
        times(b, ku, kv)
      }
    }

    if (moved) {
      sortSlotsInPlace(b.slots, b.vibe, b.point, b.open)
    }

    b.k += nHalves
    out[mask] = b
  }

  return out
}

export function sparseCoinBranch(
  br: SparseLockedBranch,
  adjoint: boolean,
  tally?: CoinTally,
): SparseLockedBranch[] {
  return applySparseCoin(br, adjoint, false, tally)
}

export function sparseHalfCoinBranch(
  br: SparseLockedBranch,
  adjoint: boolean,
  tally?: CoinTally,
): SparseLockedBranch[] {
  return applySparseCoin(br, adjoint, true, tally)
}

// ---- Collision (pair move + bounce/lone/pass/isometric on active docks only) ----

function dockAllowsScratch(kind: VetoKind): boolean {
  if (kind === 'point' || kind === 'none') {
    return true
  }

  if (kind === 'occupation') {
    for (let l = 0; l < LINES; l++) {
      if (
        DOCK_VIBE[LINE_FIRST_U8[l]!]! + DOCK_VIBE[LINE_SECOND_U8[l]!]! !== 0
      ) {
        return false
      }
    }

    return true
  }

  DOCK_LOVES.fill(0)
  DOCK_FEARS.fill(0)

  for (let d = 0; d < SLOTS; d++) {
    const v = DOCK_VIBE[d]!

    if (v > 0) {
      DOCK_LOVES[DOCK_POINT[d]!]!++
    } else if (v < 0) {
      DOCK_FEARS[DOCK_POINT[d]!]!++
    }
  }

  for (let l = 0; l < LINES; l++) {
    const tau = DOCK_STORE[l]!

    if (tau === 0) {
      continue
    }

    const w = DOCK_SPOINT[l]!
    const first = wordFirst(w)
    const second = wordSecond(w)

    ;(tau > 0 ? DOCK_LOVES : DOCK_FEARS)[first]!++
    ;(tau > 0 ? DOCK_FEARS : DOCK_LOVES)[second]!++
  }

  for (let p = 0; p < 9; p++) {
    if (DOCK_LOVES[p] !== DOCK_FEARS[p]) {
      return false
    }
  }

  return true
}

function pairPieceVetoScratch(kind: VetoKind, tally?: LockedTally): void {
  const allowed = dockAllowsScratch(kind)

  for (let l = 0; l < LINES; l++) {
    const i = LINE_FIRST_U8[l]!
    const j = LINE_SECOND_U8[l]!
    const a = DOCK_VIBE[i]!
    const b = DOCK_VIBE[j]!
    const tau = DOCK_STORE[l]!
    const unmake = tau === 0 && a !== 0 && b === -a
    const make = tau !== 0 && a === 0 && b === 0

    if (!unmake && !make) {
      continue
    }

    if (
      !allowed ||
      (unmake && kind === 'point' && DOCK_POINT[i] !== DOCK_POINT[j])
    ) {
      if (tally) {
        tally.vetoed++
      }

      continue
    }

    if (unmake) {
      DOCK_VIBE[i] = 0
      DOCK_VIBE[j] = 0
      DOCK_STORE[l] = a
      DOCK_SPOINT[l] = pairWord(DOCK_POINT[i]!, DOCK_POINT[j]!)
      DOCK_SOPEN[l] = (DOCK_OPEN[i] ? 1 : 0) | (DOCK_OPEN[j] ? 2 : 0)
      DOCK_OPEN[i] = 0
      DOCK_OPEN[j] = 0

      if (tally) {
        tally.unmade++
      }
    } else {
      const w = DOCK_SPOINT[l]!
      const o = DOCK_SOPEN[l]!

      DOCK_VIBE[i] = tau
      DOCK_VIBE[j] = -tau
      DOCK_POINT[i] = wordFirst(w)
      DOCK_POINT[j] = wordSecond(w)
      DOCK_OPEN[i] = o & 1
      DOCK_OPEN[j] = (o >> 1) & 1
      DOCK_STORE[l] = 0
      DOCK_SOPEN[l] = 0

      if (tally) {
        tally.made++
      }
    }
  }
}

function pairPieceLockedScratch(veto: boolean, tally?: LockedTally): void {
  for (let l = 0; l < LINES; l++) {
    const i = LINE_FIRST_U8[l]!
    const j = LINE_SECOND_U8[l]!
    const a = DOCK_VIBE[i]!
    const b = DOCK_VIBE[j]!
    const tau = DOCK_STORE[l]!

    if (tau === 0) {
      if (a === 0 || b !== -a) {
        continue
      }

      if (veto && DOCK_POINT[i] !== DOCK_POINT[j]) {
        if (tally) {
          tally.vetoed++
        }

        continue
      }

      DOCK_VIBE[i] = 0
      DOCK_VIBE[j] = 0
      DOCK_STORE[l] = a
      DOCK_SPOINT[l] = DOCK_POINT[i]!
      DOCK_SOPEN[l] = (DOCK_OPEN[i] ? 1 : 0) | (DOCK_OPEN[j] ? 2 : 0)
      DOCK_OPEN[i] = 0
      DOCK_OPEN[j] = 0

      if (tally) {
        tally.unmade++
      }
    } else if (a === 0 && b === 0) {
      const p = DOCK_SPOINT[l]!
      const o = DOCK_SOPEN[l]!

      DOCK_VIBE[i] = tau
      DOCK_VIBE[j] = -tau
      DOCK_POINT[i] = p
      DOCK_POINT[j] = p
      DOCK_OPEN[i] = o & 1
      DOCK_OPEN[j] = (o >> 1) & 1
      DOCK_STORE[l] = 0
      DOCK_SOPEN[l] = 0

      if (tally) {
        tally.made++
      }
    }
  }
}

function coinPieceScratch(collision: CollisionKind): void {
  if (bouncePermutation(BOUNCE_TABLE, collision, DOCK_VIBE, 0, DOCK_PERM) === 0) {
    return
  }

  for (let d = 0; d < SLOTS; d++) {
    const to = DOCK_PERM[d]!

    DOCK_SV[to] = DOCK_VIBE[d]!
    DOCK_SP[to] = DOCK_POINT[d]!
    DOCK_SO[to] = DOCK_OPEN[d]!
  }

  for (let d = 0; d < SLOTS; d++) {
    DOCK_VIBE[d] = DOCK_SV[d]!
    DOCK_POINT[d] = DOCK_SP[d]!
    DOCK_OPEN[d] = DOCK_SO[d]!
  }
}

function collideActiveDocks(
  t: AnyLockedTables,
  c: SparseConfiguration,
  beat: number,
  inverse: boolean,
  vetoKind: VetoKind | null,
  tally?: LockedTally,
): void {
  const ns = c.slots.length
  const nl = c.storeLines.length

  if (ns === 0 && nl === 0) {
    return
  }

  const order = collisionOrder('alternate', beat)
  const pieces = inverse ? [...order].reverse() : order
  const useTally = inverse ? undefined : tally
  const collision = t.collision

  let si = 0
  let li = 0
  let outNs = 0
  let outNl = 0

  while (si < ns || li < nl) {
    const slotDock = si < ns ? (c.slots[si]! / SLOTS) | 0 : 0x7fffffff
    const lineDock = li < nl ? (c.storeLines[li]! / LINES) | 0 : 0x7fffffff
    const dock = slotDock < lineDock ? slotDock : lineDock
    const slotBase = dock * SLOTS
    const lineBase = dock * LINES

    if (slotDock === dock) {
      while (si < ns) {
        const d = c.slots[si]! - slotBase

        if (d >= SLOTS) {
          break
        }

        DOCK_VIBE[d] = c.vibe[si]!
        DOCK_POINT[d] = c.point[si]!
        DOCK_OPEN[d] = c.open[si]!
        si++
      }
    }

    if (lineDock === dock) {
      while (li < nl) {
        const l = c.storeLines[li]! - lineBase

        if (l >= LINES) {
          break
        }

        DOCK_STORE[l] = c.store[li]!
        DOCK_SPOINT[l] = c.spoint[li]!
        DOCK_SOPEN[l] = c.sopen[li]!
        li++
      }
    }

    for (let p = 0; p < pieces.length; p++) {
      if (pieces[p] === 'P') {
        if (vetoKind !== null) {
          pairPieceVetoScratch(vetoKind, useTally)
        } else {
          pairPieceLockedScratch(t.veto, useTally)
        }
      } else {
        coinPieceScratch(collision)
      }
    }

    ensureSlotScratch(outNs + SLOTS)

    for (let d = 0; d < SLOTS; d++) {
      const v = DOCK_VIBE[d]!

      if (v !== 0) {
        scratchSlots[outNs] = slotBase + d
        scratchVibe[outNs] = v
        scratchPoint[outNs] = DOCK_POINT[d]!
        scratchOpen[outNs] = DOCK_OPEN[d]!
        outNs++
        DOCK_VIBE[d] = 0
      }
    }

    ensureLineScratch(outNl + LINES)

    for (let l = 0; l < LINES; l++) {
      const s = DOCK_STORE[l]!

      if (s !== 0) {
        scratchLines[outNl] = lineBase + l
        scratchStore[outNl] = s
        scratchSpoint[outNl] = DOCK_SPOINT[l]!
        scratchSopen[outNl] = DOCK_SOPEN[l]!
        outNl++
        DOCK_STORE[l] = 0
      }
    }
  }

  if (outNs === 0) {
    c.slots = EMPTY_I32
    c.vibe = EMPTY_I8
    c.point = EMPTY_I8
    c.open = EMPTY_U8
  } else {
    c.slots = scratchSlots.slice(0, outNs)
    c.vibe = scratchVibe.slice(0, outNs)
    c.point = scratchPoint.slice(0, outNs)
    c.open = scratchOpen.slice(0, outNs)
  }

  if (outNl === 0) {
    c.storeLines = EMPTY_I32
    c.store = EMPTY_I8
    c.spoint = EMPTY_I8
    c.sopen = EMPTY_U8
  } else {
    c.storeLines = scratchLines.slice(0, outNl)
    c.store = scratchStore.slice(0, outNl)
    c.spoint = scratchSpoint.slice(0, outNl)
    c.sopen = scratchSopen.slice(0, outNl)
  }
}

export function sparseCollideConfiguration(
  t: AnyLockedTables,
  c: SparseConfiguration,
  beat: number,
  inverse: boolean,
  tally?: LockedTally,
): void {
  collideActiveDocks(t, c, beat, inverse, null, tally)
}

export function sparseCollideVeto(
  kind: VetoKind,
  t: AnyLockedTables,
  c: SparseConfiguration,
  beat: number,
  inverse: boolean,
  tally?: LockedTally,
): void {
  collideActiveDocks(t, c, beat, inverse, kind, tally)
}

// ---- Stream / Unstream (O(active slots), in-place on SparseConfiguration) ----

export function sparseStreamBranch(
  t: AnyLockedTables,
  c: SparseConfiguration,
  inverse: boolean,
): void {
  const ns = c.slots.length

  if (ns === 0) {
    return
  }

  const { slots, point } = c

  if (isSparseTables(t)) {
    if (t.identityLinks) {
      if (inverse) {
        for (let i = 0; i < ns; i++) {
          slots[i] = t.sourceOf(slots[i]!)
        }
      } else {
        for (let i = 0; i < ns; i++) {
          slots[i] = t.targetOf(slots[i]!)
        }
      }
    } else if (inverse) {
      for (let i = 0; i < ns; i++) {
        const s = slots[i]!

        slots[i] = t.sourceOf(s)
        point[i] = t.backOf(s, point[i]!)
      }
    } else {
      for (let i = 0; i < ns; i++) {
        const s = slots[i]!

        slots[i] = t.targetOf(s)
        point[i] = t.moveOf(s, point[i]!)
      }
    }
  } else if (inverse) {
    const { source, back } = t

    for (let i = 0; i < ns; i++) {
      const s = slots[i]!

      slots[i] = source[s]!
      point[i] = back[s * 9 + point[i]!]!
    }
  } else {
    const { target, move } = t

    for (let i = 0; i < ns; i++) {
      const s = slots[i]!

      slots[i] = target[s]!
      point[i] = move[s * 9 + point[i]!]!
    }
  }

  sortSlotsInPlace(c.slots, c.vibe, c.point, c.open)
}

// ---- Frame mixer F-G (mixBranch and thetaMixBranch on active docks) ----

type SparseLoneFrame = {
  dock: number
  idx: number
  frame: number
  q: number
}

export function sparseLoneFrames(c: SparseConfiguration): SparseLoneFrame[] {
  const ns = c.slots.length
  const out: SparseLoneFrame[] = []

  let si = 0

  while (si < ns) {
    const dock = (c.slots[si]! / SLOTS) | 0
    const base = dock * SLOTS

    let siEnd = si + 1

    while (siEnd < ns && ((c.slots[siEnd]! / SLOTS) | 0) === dock) {
      siEnd++
    }

    let c0 = 0
    let c1 = 0
    let c2 = 0
    let i0 = -1
    let i1 = -1
    let i2 = -1

    for (let i = si; i < siEnd; i++) {
      const f = FRAME_OF_SLOT_U8[c.slots[i]! - base]!

      if (f === 0) {
        c0++
        i0 = i
      } else if (f === 1) {
        c1++
        i1 = i
      } else {
        c2++
        i2 = i
      }
    }

    if (c0 === 1 && c.open[i0]) {
      out.push({
        dock,
        idx: i0,
        frame: 0,
        q: FRAME_Q_OF_SLOT_U8[c.slots[i0]! - base]!,
      })
    }

    if (c1 === 1 && c.open[i1]) {
      out.push({
        dock,
        idx: i1,
        frame: 1,
        q: FRAME_Q_OF_SLOT_U8[c.slots[i1]! - base]!,
      })
    }

    if (c2 === 1 && c.open[i2]) {
      out.push({
        dock,
        idx: i2,
        frame: 2,
        q: FRAME_Q_OF_SLOT_U8[c.slots[i2]! - base]!,
      })
    }

    si = siEnd
  }

  return out
}

export function sparseMixBranch(
  br: SparseLockedBranch,
  tally?: MixTally,
): SparseLockedBranch[] {
  const lone = sparseLoneFrames(br)

  if (lone.length === 0) {
    return [br]
  }

  if (lone.length > 4) {
    throw new Error(
      `coined-locked-knit: ${lone.length} lone frames in one branch, over the guard 4`,
    )
  }

  if (tally) {
    tally.mixes += lone.length
  }

  const total = 1 << (3 * lone.length)
  const out: SparseLockedBranch[] = new Array(total)

  for (let code = 0; code < total; code++) {
    const b = cloneSparseBranch(br)

    let rest = code
    let moved = false

    for (let n = 0; n < lone.length; n++) {
      const item = lone[n]!
      const o = rest & 7

      rest >>>= 3

      if (o === 0) {
        times(b, 3n, 0n)
        continue
      }

      b.slots[item.idx] =
        item.dock * SLOTS + FRAME_SLOTS_FLAT[item.frame * 8 + (item.q ^ o)]!
      moved = true
      times(b, -1n, 0n)
    }

    if (moved) {
      sortSlotsInPlace(b.slots, b.vibe, b.point, b.open)
    }

    b.k += 2 * lone.length
    out[code] = b
  }

  return out
}

export function sparseThetaMixBranch(
  br: SparseLockedBranch,
  u: readonly [bigint, bigint],
  adjoint = false,
): SparseLockedBranch[] {
  const lone = sparseLoneFrames(br)

  if (lone.length === 0) {
    return [br]
  }

  if (lone.length > 4) {
    throw new Error(
      `coined-locked-knit: ${lone.length} lone frames in one branch, over the guard 4`,
    )
  }

  const [p, q] = adjoint ? [u[0] - u[1], -u[1]] : u
  const total = 1 << (3 * lone.length)
  const out: SparseLockedBranch[] = []

  for (let code = 0; code < total; code++) {
    const b = cloneSparseBranch(br)

    let rest = code
    let moved = false

    for (let n = 0; n < lone.length; n++) {
      const item = lone[n]!
      const o = rest & 7

      rest >>>= 3

      if (o === 0) {
        times(b, p + 7n, q)
        continue
      }

      b.slots[item.idx] =
        item.dock * SLOTS + FRAME_SLOTS_FLAT[item.frame * 8 + (item.q ^ o)]!
      moved = true
      times(b, p - 1n, q)
    }

    if (b.a === 0n && b.b === 0n) {
      continue
    }

    if (moved) {
      sortSlotsInPlace(b.slots, b.vibe, b.point, b.open)
    }

    b.k += 3 * lone.length
    out.push(b)
  }

  return out
}

// ---- Pair-line mixer M_pair (full-line 12-line Grover mixer, exact Z[w][1/6]) ----

type SparseFullLineDock = {
  dock: number
  line: number
  idx0: number
  idx1: number
}

export function sparseSoleFullLineDocks(
  c: SparseConfiguration,
): SparseFullLineDock[] {
  const ns = c.slots.length
  const nl = c.storeLines.length
  const active: SparseFullLineDock[] = []

  let si = 0
  let li = 0

  while (si < ns) {
    const dock = (c.slots[si]! / SLOTS) | 0

    let siEnd = si + 1

    while (siEnd < ns && ((c.slots[siEnd]! / SLOTS) | 0) === dock) {
      siEnd++
    }

    while (li < nl && ((c.storeLines[li]! / LINES) | 0) < dock) {
      li++
    }

    const hasStoreHere = li < nl && ((c.storeLines[li]! / LINES) | 0) === dock

    if (!hasStoreHere && siEnd - si === 2) {
      const base = dock * SLOTS
      const d0 = c.slots[si]! - base
      const d1 = c.slots[si + 1]! - base

      if (
        OPPOSITE_U8[d0] === d1 &&
        c.vibe[si] === c.vibe[si + 1] &&
        c.open[si] !== 0 &&
        c.open[si + 1] !== 0 &&
        c.point[si] === c.point[si + 1]
      ) {
        active.push({
          dock,
          line: LINE_OF_U8[d0]!,
          idx0: si,
          idx1: si + 1,
        })
      }
    }

    si = siEnd
  }

  return active
}

// Exact match to pairLineMixBranchExact(cells, br) in code/rule/pair-line-mixer.ts
export function sparsePairLineMixBranchExact(
  cells: number,
  br: SparseLockedBranch,
): SparseLockedBranch[] {
  const active = sparseSoleFullLineDocks(br)

  if (active.length === 0) {
    const out = cloneSparseBranch(br)

    times(out, 6n ** BigInt(cells), 0n)

    return [out]
  }

  if (active.length > 3) {
    throw new Error(
      `pair-line-mixer: ${active.length} active full-line docks exceeds exact branch guard 3`,
    )
  }

  const inactiveScale = 6n ** BigInt(cells - active.length)
  const totalCodes = 12 ** active.length
  const out: SparseLockedBranch[] = new Array(totalCodes)

  for (let code = 0; code < totalCodes; code++) {
    const b = cloneSparseBranch(br)

    times(b, inactiveScale, 0n)

    let rest = code

    for (let n = 0; n < active.length; n++) {
      const { dock, line: l0, idx0, idx1 } = active[n]!
      const m = rest % LINES

      rest = (rest - m) / LINES

      if (m === l0) {
        times(b, 5n, 0n)
        continue
      }

      const base = dock * SLOTS

      // dock holds only idx0 and idx1 and LINE_FIRST_U8[m] < LINE_SECOND_U8[m], so slots stay sorted
      b.slots[idx0] = base + LINE_FIRST_U8[m]!
      b.slots[idx1] = base + LINE_SECOND_U8[m]!
      times(b, -1n, 0n)
    }

    out[code] = b
  }

  return out
}

export function sparsePairLineMixStateExact(
  cells: number,
  s: SparseLockedState,
): SparseLockedState {
  const next: SparseLockedBranch[] = []

  for (let i = 0; i < s.branches.length; i++) {
    const parts = sparsePairLineMixBranchExact(cells, s.branches[i]!)

    for (let j = 0; j < parts.length; j++) {
      next.push(parts[j]!)
    }
  }

  return { branches: mergeSparseBranches(next) }
}

// Large-mesh variant: scales uniformly by 6^(max active full-line docks in state) instead of 6^cells
export function sparsePairLineMixStateNormalized(s: SparseLockedState): {
  state: SparseLockedState
  powerOfSix: number
} {
  const activePerBranch = s.branches.map(b => sparseSoleFullLineDocks(b))

  let maxActive = 0

  for (let i = 0; i < activePerBranch.length; i++) {
    const len = activePerBranch[i]!.length

    if (len > maxActive) {
      maxActive = len
    }
  }

  if (maxActive === 0) {
    return {
      state: { branches: s.branches.map(cloneSparseBranch) },
      powerOfSix: 0,
    }
  }

  const next: SparseLockedBranch[] = []

  for (let i = 0; i < s.branches.length; i++) {
    const br = s.branches[i]!
    const active = activePerBranch[i]!

    if (active.length > 3) {
      throw new Error(
        `pair-line-mixer: ${active.length} active full-line docks exceeds exact branch guard 3`,
      )
    }

    if (active.length === 0) {
      const b = cloneSparseBranch(br)

      times(b, 6n ** BigInt(maxActive), 0n)
      next.push(b)
      continue
    }

    const inactiveScale = 6n ** BigInt(maxActive - active.length)
    const totalCodes = 12 ** active.length

    for (let code = 0; code < totalCodes; code++) {
      const b = cloneSparseBranch(br)

      if (inactiveScale !== 1n) {
        times(b, inactiveScale, 0n)
      }

      let rest = code

      for (let n = 0; n < active.length; n++) {
        const { dock, line: l0, idx0, idx1 } = active[n]!
        const m = rest % LINES

        rest = (rest - m) / LINES

        if (m === l0) {
          times(b, 5n, 0n)
          continue
        }

        const base = dock * SLOTS

        b.slots[idx0] = base + LINE_FIRST_U8[m]!
        b.slots[idx1] = base + LINE_SECOND_U8[m]!
        times(b, -1n, 0n)
      }

      next.push(b)
    }
  }

  return {
    state: { branches: mergeSparseBranches(next) },
    powerOfSix: maxActive,
  }
}

// ---- Complete Beats (exact slot-sparse equivalents of lockedBeat, vetoBeat, coinedVetoBeat, mixedVetoBeat) ----

export function sparseLockedBeat(
  t: AnyLockedTables,
  s: SparseLockedState,
  beat: number,
  tally?: LockedTally,
): SparseLockedState {
  const next: SparseLockedBranch[] = []

  for (let i = 0; i < s.branches.length; i++) {
    const met = sparseMeetBranch(cloneSparseBranch(s.branches[i]!), false, tally)

    for (let j = 0; j < met.length; j++) {
      const b = met[j]!

      sparseCollideConfiguration(t, b, beat, false, tally)
      sparseStreamBranch(t, b, false)
      next.push(b)
    }
  }

  return { branches: mergeSparseBranches(next, tally) }
}

export function sparseLockedBeatBack(
  t: AnyLockedTables,
  s: SparseLockedState,
  beat: number,
): SparseLockedState {
  const next: SparseLockedBranch[] = []

  for (let i = 0; i < s.branches.length; i++) {
    const b = cloneSparseBranch(s.branches[i]!)

    sparseStreamBranch(t, b, true)
    sparseCollideConfiguration(t, b, beat, true)

    const met = sparseMeetBranch(b, true)

    for (let j = 0; j < met.length; j++) {
      next.push(met[j]!)
    }
  }

  return { branches: mergeSparseBranches(next) }
}

export function sparseVetoOnlyBeat(
  kind: VetoKind,
  t: AnyLockedTables,
  s: SparseLockedState,
  beat: number,
  tally?: LockedTally,
): SparseLockedState {
  const next: SparseLockedBranch[] = []

  for (let i = 0; i < s.branches.length; i++) {
    const met = sparseMeetBranch(cloneSparseBranch(s.branches[i]!), false, tally)

    for (let j = 0; j < met.length; j++) {
      const b = met[j]!

      sparseCollideVeto(kind, t, b, beat, false, tally)
      sparseStreamBranch(t, b, false)
      next.push(b)
    }
  }

  return { branches: mergeSparseBranches(next, tally) }
}

export function sparseVetoOnlyBeatBack(
  kind: VetoKind,
  t: AnyLockedTables,
  s: SparseLockedState,
  beat: number,
): SparseLockedState {
  const next: SparseLockedBranch[] = []

  for (let i = 0; i < s.branches.length; i++) {
    const b = cloneSparseBranch(s.branches[i]!)

    sparseStreamBranch(t, b, true)
    sparseCollideVeto(kind, t, b, beat, true)

    const met = sparseMeetBranch(b, true)

    for (let j = 0; j < met.length; j++) {
      next.push(met[j]!)
    }
  }

  return { branches: mergeSparseBranches(next) }
}

function sparseHalfCoinAll(
  branches: readonly SparseLockedBranch[],
  adjoint: boolean,
  coinTally?: CoinTally,
): SparseLockedBranch[] {
  const out: SparseLockedBranch[] = []

  for (let i = 0; i < branches.length; i++) {
    const parts = sparseHalfCoinBranch(
      cloneSparseBranch(branches[i]!),
      adjoint,
      coinTally,
    )

    for (let j = 0; j < parts.length; j++) {
      out.push(parts[j]!)
    }
  }

  return mergeSparseBranches(out)
}

export function sparseCoinedVetoBeat(
  kind: VetoKind,
  t: AnyLockedTables,
  s: SparseLockedState,
  beat: number,
  tally?: LockedTally,
  coinTally?: CoinTally,
  place: CoinPlace = currentCoinPlace(),
): SparseLockedState {
  if (place === 'split') {
    const collided: SparseLockedBranch[] = []
    const coined1 = sparseHalfCoinAll(s.branches, false, coinTally)

    for (let i = 0; i < coined1.length; i++) {
      const met = sparseMeetBranch(coined1[i]!, false, tally)

      for (let j = 0; j < met.length; j++) {
        const b = met[j]!

        sparseCollideVeto(kind, t, b, beat, false, tally)
        collided.push(b)
      }
    }

    const out = sparseHalfCoinAll(
      mergeSparseBranches(collided, tally),
      false,
      coinTally,
    )

    for (let i = 0; i < out.length; i++) {
      sparseStreamBranch(t, out[i]!, false)
    }

    return { branches: out }
  }

  const coined: SparseLockedBranch[] = []

  for (let i = 0; i < s.branches.length; i++) {
    const parts = sparseCoinBranch(
      cloneSparseBranch(s.branches[i]!),
      false,
      coinTally,
    )

    for (let j = 0; j < parts.length; j++) {
      coined.push(parts[j]!)
    }
  }

  return sparseVetoOnlyBeat(
    kind,
    t,
    { branches: mergeSparseBranches(coined) },
    beat,
    tally,
  )
}

export function sparseCoinedVetoBeatBack(
  kind: VetoKind,
  t: AnyLockedTables,
  s: SparseLockedState,
  beat: number,
  place: CoinPlace = currentCoinPlace(),
): SparseLockedState {
  if (place === 'split') {
    const unstreamed: SparseLockedBranch[] = new Array(s.branches.length)

    for (let i = 0; i < s.branches.length; i++) {
      const b = cloneSparseBranch(s.branches[i]!)

      sparseStreamBranch(t, b, true)
      unstreamed[i] = b
    }

    const met: SparseLockedBranch[] = []
    const uncoined1 = sparseHalfCoinAll(unstreamed, true)

    for (let i = 0; i < uncoined1.length; i++) {
      const b = uncoined1[i]!

      sparseCollideVeto(kind, t, b, beat, true)

      const parts = sparseMeetBranch(b, true)

      for (let j = 0; j < parts.length; j++) {
        met.push(parts[j]!)
      }
    }

    return { branches: sparseHalfCoinAll(mergeSparseBranches(met), true) }
  }

  const back = sparseVetoOnlyBeatBack(kind, t, s, beat)
  const out: SparseLockedBranch[] = []

  for (let i = 0; i < back.branches.length; i++) {
    const parts = sparseCoinBranch(cloneSparseBranch(back.branches[i]!), true)

    for (let j = 0; j < parts.length; j++) {
      out.push(parts[j]!)
    }
  }

  return { branches: mergeSparseBranches(out) }
}

export function sparseMixedVetoBeat(
  kind: VetoKind,
  t: AnyLockedTables,
  s: SparseLockedState,
  beat: number,
  tally?: LockedTally,
  coinTally?: CoinTally,
  mixTally?: MixTally,
  coin = true,
  place: CoinPlace = currentCoinPlace(),
): SparseLockedState {
  const mixed: SparseLockedBranch[] = []

  for (let i = 0; i < s.branches.length; i++) {
    const parts = sparseMixBranch(cloneSparseBranch(s.branches[i]!), mixTally)

    for (let j = 0; j < parts.length; j++) {
      mixed.push(parts[j]!)
    }
  }

  const state: SparseLockedState = { branches: mergeSparseBranches(mixed) }

  return coin
    ? sparseCoinedVetoBeat(kind, t, state, beat, tally, coinTally, place)
    : sparseVetoOnlyBeat(kind, t, state, beat, tally)
}

export function sparseMixedVetoBeatBack(
  kind: VetoKind,
  t: AnyLockedTables,
  s: SparseLockedState,
  beat: number,
  coin = true,
  place: CoinPlace = currentCoinPlace(),
): SparseLockedState {
  const back = coin
    ? sparseCoinedVetoBeatBack(kind, t, s, beat, place)
    : sparseVetoOnlyBeatBack(kind, t, s, beat)
  const out: SparseLockedBranch[] = []

  for (let i = 0; i < back.branches.length; i++) {
    const parts = sparseMixBranch(cloneSparseBranch(back.branches[i]!))

    for (let j = 0; j < parts.length; j++) {
      out.push(parts[j]!)
    }
  }

  return { branches: mergeSparseBranches(out) }
}
