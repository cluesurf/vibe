// THE WORKING RULE ON SPARSE BRANCHES (item vibe-roadmap-grounding-0015): coinedVetoBeat (code/rule/coined-locked-knit,
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
  halfCoinBranch,
  type CoinTally,
} from '@/code/rule/coined-locked-knit'
import {
  type Branch,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'
import {
  collideVeto,
  meetBranch,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'

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
