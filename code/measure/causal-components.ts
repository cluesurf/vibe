// Causal components from the copy history (E-RLT-0089). MEASUREMENT: every count is an exact integer.
//
// THE USER'S RULE (2026-09-26). Two docks are connected when they arose from each other: a chain of copy events in
// the run's history links them, one dock's value copied from the other's, directly or through intermediates. A
// matter meeting across a boundary is one case. Pass is exactly one causal component on the husk.
//
// WHERE A COPY BETWEEN DOCKS HAPPENS. Every knit here beats as collide, then stream. The collision rewrites the slots
// of one dock and never reads another dock, so it copies nothing between docks. The stream copies each slot's value
// one dock along its own direction, slot (x, d) into slot (neighbour(x, d), d). So the copies between docks at one
// beat are read exactly from the slots between the two steps: a slot holding a vibe there is a copy event from its
// dock into the dock it streams to. Nothing moves: this file only reads which values the stream copied, and where.
//
// WHAT COUNTS AS A COPIED VALUE. The gate counts CONTENT: a slot holding love or fear (the vibe not calm), with
// whatever that vibe carries (a store, a role point). The EVERY-COPY reading counts calm too: the stream copies every
// slot every beat, so that graph is the box's own neighbour graph whatever the knit does (everyCopyCounts shows it),
// and it cannot tell one knit from another. It is reported beside, never as the gate.
//
// THE HUSK. A husk dock is a column of bulk docks along the depth (code/measure/photon-husk): on the D4 box, the bulk
// dock with vector v lies over the husk dock (v0, v1, v2) mod side. Two husk docks are joined when any bulk copy
// joins a dock of one column to a dock of the other. The bulk count (docks joined by copies) is reported beside.
//
// DESCENT. A dock descends from the seed when a copy from the seed's dock, or from a dock that already descends,
// reaches it. The reach is monotone and read at the stream, so a dock reached at beat t copies onward from beat t + 1.
//
// MATTER. A matter copy is a copy of a slot whose value differs from the unseeded vacuum's at the same slot and beat:
// the part of the history the seed changed. The matter-only count joins docks through matter copies alone.

import { collideBounce, makeBounceKernel, type BounceKernel } from '@/code/measure/bounce-pair-kernel'
import { cloneReduced, type Reduced } from '@/code/measure/living-pair-kernel'
import { coinData, orientedHubStore } from '@/code/measure/varying-vacuum'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { makeColorWeave } from '@/code/rule/color-weave'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { coldQuaternionCollideAll, type ColdQuaternionLattice, type ColdQuaternionState } from '@/code/rule/cold-quaternion-knit'
import { collide } from '@/code/rule/lattice-gas'
import { type Collision } from '@/code/rule/collision'
import { d4BoxCoordinates, d4Coordinates, d4Vector } from '@/code/substrate/d4-box'
import { type Mesh } from '@/code/tool/mesh'

const modulo = (v: number, n: number): number => ((v % n) + n) % n

// ---- union-find over integer nodes ----

export function forest(n: number): Int32Array {
  return Int32Array.from({ length: n }, (_, i) => i)
}

export function rootOf(p: Int32Array, x: number): number {
  let r = x

  while (p[r] !== r) {
    p[r] = p[p[r] as number] as number
    r = p[r] as number
  }

  return r
}

export function join(p: Int32Array, a: number, b: number): void {
  const ra = rootOf(p, a)
  const rb = rootOf(p, b)

  if (ra !== rb) p[ra < rb ? rb : ra] = ra < rb ? ra : rb
}

export function componentCount(p: Int32Array): number {
  let n = 0

  for (let i = 0; i < p.length; i++) n += rootOf(p, i) === i ? 1 : 0

  return n
}

// the component sizes, as a histogram size -> how many components have it, sorted by size
export function componentSizes(p: Int32Array): [number, number][] {
  const size = new Map<number, number>()

  for (let i = 0; i < p.length; i++) {
    const r = rootOf(p, i)

    size.set(r, (size.get(r) ?? 0) + 1)
  }

  const histogram = new Map<number, number>()

  for (const s of size.values()) histogram.set(s, (histogram.get(s) ?? 0) + 1)

  return [...histogram.entries()].sort((a, b) => a[0] - b[0])
}

// ---- the box, its stream and its husk ----

export type BoxHusk = {
  readonly side: number
  readonly cells: number
  // the husk dock (column) of each bulk dock, and how many there are (side^3)
  readonly column: Int32Array
  readonly columns: number
  // v0 mod side of each bulk dock: the husk coordinate a planted cut splits
  readonly first: Int32Array
  // bulk docks and directions where neighbour(x, d) - x is not the root d modulo the periods: 0 on a sound box
  readonly stepErrors: number
}

export function boxHusk(mesh: Mesh, side: number): BoxHusk {
  const roots = rootsD4()
  const cells = mesh.cellCount
  const vectors = Array.from({ length: cells }, (_, x) => d4Vector(d4BoxCoordinates({ cell: x, side })))
  const column = new Int32Array(cells)
  const first = new Int32Array(cells)
  let stepErrors = 0

  for (let x = 0; x < cells; x++) {
    const v = vectors[x] as number[]

    column[x] = modulo(v[0] ?? 0, side) + side * modulo(v[1] ?? 0, side) + side * side * modulo(v[2] ?? 0, side)
    first[x] = modulo(v[0] ?? 0, side)

    for (let d = 0; d < 24; d++) {
      const w = vectors[mesh.neighbour(x, d)] as number[]
      const r = roots[d] as number[]

      // a difference in the periods side * D4: every coordinate a multiple of side, and side * D4 coordinates
      const diff = [0, 1, 2, 3].map(k => (w[k] ?? 0) - (v[k] ?? 0) - (r[k] ?? 0))
      const inPeriods = diff.every(c => modulo(c, side) === 0) && d4Coordinates(diff).every(c => modulo(c, side) === 0)

      stepErrors += inPeriods ? 0 : 1
    }
  }

  return { side, cells, column, columns: side ** 3, first, stepErrors }
}

// the stream: slot (x, d) is copied into slot (neighbour(x, d), d)
export function streamTarget(mesh: Mesh): Int32Array {
  const target = new Int32Array(mesh.cellCount * 24)

  for (let x = 0; x < mesh.cellCount; x++) for (let d = 0; d < 24; d++) target[x * 24 + d] = mesh.neighbour(x, d) * 24 + d

  return target
}

// A PLANTED CUT: the box split into two halves by the husk coordinate v0 (v0 mod side below side / 2, or not), and
// every slot whose stream would cross between halves copied instead into the opposite slot of its own dock (a
// reflecting wall). Still a bijection of slots, and no copy crosses. Each column lies wholly in one half.
export function cutTarget(mesh: Mesh, husk: BoxHusk, target: Int32Array): Int32Array {
  const half = (x: number): number => ((husk.first[x] as number) < Math.floor(husk.side / 2) ? 0 : 1)
  const out = Int32Array.from(target)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const y = Math.floor((target[x * 24 + d] as number) / 24)

      if (half(x) !== half(y)) out[x * 24 + d] = x * 24 + mesh.opposite(d)
    }
  }

  return out
}

// the every-copy reading: calm counted, so every slot's stream is a copy
export function everyCopyCounts(husk: BoxHusk, target: Int32Array): { bulk: number; husk: number } {
  const bulk = forest(husk.cells)
  const top = forest(husk.columns)

  for (let i = 0; i < target.length; i++) {
    const x = Math.floor(i / 24)
    const y = Math.floor((target[i] as number) / 24)

    if (x === y) continue

    join(bulk, x, y)
    join(top, husk.column[x] as number, husk.column[y] as number)
  }

  return { bulk: componentCount(bulk), husk: componentCount(top) }
}

// ---- the copy log ----

export type CausalLog = {
  readonly husk: BoxHusk
  readonly bulk: Int32Array
  readonly top: Int32Array
  readonly matterBulk: Int32Array
  readonly matterTop: Int32Array
  // the beat a dock came to descend from the seed (0 for the seed's dock), -1 if it does not
  readonly reachedAt: Int32Array
  // per beat, per dock: bit d set when slot d's new value was a content copy from the dock behind it along d
  readonly masks: Int32Array[] | undefined
  copies: number
  matterCopies: number
  beats: number
}

export function causalLog(husk: BoxHusk, input: { seedDock?: number; keepMasks?: boolean } = {}): CausalLog {
  const reachedAt = new Int32Array(husk.cells).fill(-1)

  if (input.seedDock !== undefined) reachedAt[input.seedDock] = 0

  return {
    husk,
    bulk: forest(husk.cells),
    top: forest(husk.columns),
    matterBulk: forest(husk.cells),
    matterTop: forest(husk.columns),
    reachedAt,
    masks: input.keepMasks ? [] : undefined,
    copies: 0,
    matterCopies: 0,
    beats: 0,
  }
}

const NEW_REACH: number[] = []

// record beat t's stream: `vibes` and `carried` are the slots between the collision and the stream; `reference`, the
// unseeded vacuum's slots at the same point of the same beat, when matter is read
export function recordCopies(
  log: CausalLog,
  target: Int32Array,
  vibes: ArrayLike<number>,
  carried?: ArrayLike<number>,
  reference?: { vibes: ArrayLike<number>; carried?: ArrayLike<number> },
): void {
  const t = log.beats
  const mask = log.masks ? new Int32Array(log.husk.cells) : undefined
  const { column } = log.husk

  NEW_REACH.length = 0

  for (let i = 0; i < target.length; i++) {
    const v = vibes[i] as number
    const c = carried ? (carried[i] as number) : 0

    // a calm slot copies no content (a slot the seed emptied is a difference, but no copy)
    if (v === 0 && c === 0) continue

    const to = target[i] as number
    const x = (i / 24) | 0
    const y = (to / 24) | 0

    if (mask) mask[y] = (mask[y] as number) | (1 << (to % 24))

    if (x === y) continue

    log.copies++
    join(log.bulk, x, y)
    join(log.top, column[x] as number, column[y] as number)

    const at = log.reachedAt[x] as number

    if (at !== -1 && at <= t && log.reachedAt[y] === -1) NEW_REACH.push(y)

    if (reference) {
      const rv = reference.vibes[i] as number
      const rc = reference.carried ? (reference.carried[i] as number) : 0

      if (rv !== v || rc !== c) {
        log.matterCopies++
        join(log.matterBulk, x, y)
        join(log.matterTop, column[x] as number, column[y] as number)
      }
    }
  }

  for (const y of NEW_REACH) if (log.reachedAt[y] === -1) log.reachedAt[y] = t + 1

  if (log.masks && mask) log.masks.push(mask)

  log.beats++
}

export type CausalCounts = {
  readonly bulk: number
  readonly husk: number
  readonly matterBulk: number
  readonly matterHusk: number
  readonly reachedBulk: number
  readonly reachedHusk: number
  readonly copies: number
  readonly matterCopies: number
}

export function causalCounts(log: CausalLog): CausalCounts {
  const columns = new Uint8Array(log.husk.columns)
  let reachedBulk = 0

  for (let x = 0; x < log.husk.cells; x++) {
    if (log.reachedAt[x] !== -1) {
      reachedBulk++
      columns[log.husk.column[x] as number] = 1
    }
  }

  return {
    bulk: componentCount(log.bulk),
    husk: componentCount(log.top),
    matterBulk: componentCount(log.matterBulk),
    matterHusk: componentCount(log.matterTop),
    reachedBulk,
    reachedHusk: columns.reduce((a, b) => a + b, 0),
    copies: log.copies,
    matterCopies: log.matterCopies,
  }
}

// the slot each slot is copied from: inverse[target[i]] = i (the stream and a planted cut are bijections)
export function inverseTarget(target: Int32Array): Int32Array {
  const inverse = new Int32Array(target.length).fill(-1)

  for (let i = 0; i < target.length; i++) inverse[target[i] as number] = i

  return inverse
}

// the docks dock y's new value was copied from at a logged beat (the per-beat record the gate is built on),
// distinct, its own dock included when a reflected slot copied within it
export function copySources(log: CausalLog, inverse: Int32Array, beat: number, y: number): number[] {
  const mask = log.masks?.[beat]

  if (!mask) return []

  const source = new Set<number>()

  for (let d = 0; d < 24; d++) if (((mask[y] as number) >> d) & 1) source.add(Math.floor((inverse[y * 24 + d] as number) / 24))

  return [...source]
}

// ---- replays: the rule's own collision, then the stream through a given target ----

export type Replay = {
  readonly cells: number
  // beat t's collision at every dock, in place (the rule's own code)
  collide(t: number): void
  // the slots between the collision and the stream
  vibes(): ArrayLike<number>
  carried(): ArrayLike<number> | undefined
  // the stream through `target`
  stream(target: Int32Array): void
  // the state after the stream, flattened for comparison: vibes, then anything else the state holds
  snapshot(): Int32Array
}

// the hub vacuum of E-RLT-0082 to E-RLT-0088 on a FRESH weave (code/measure/wall-reading's hubSetup caches its weave
// per side through varying-living-battery's weaveOf, so a link start set after the first call never reaches it; this
// builds the weave under whatever start is current, and is otherwise hubSetup line for line)
let COINS: ReturnType<typeof coinData> | undefined

export type HubFresh = { readonly kernel: BounceKernel; readonly store: Int8Array; readonly layout: Int8Array; readonly cells: number; readonly side: number; readonly mesh: Mesh }

export function hubFresh(side: number, kind: CollisionKind, anchor = 0): HubFresh {
  COINS ??= coinData(groupTable())

  const r0 = d4Coordinates(rootsD4()[LINE_FIRSTS[0] as number] as number[])
  const hub = d4BoxCoordinates({ cell: anchor, side }).map((v, k) => v - (r0[k] as number))
  const weave = makeColorWeave({ side, table: 'bind' })

  return { kernel: makeBounceKernel(weave, kind), store: orientedHubStore(COINS, side, hub), layout: separatedLayout(weave), cells: weave.mesh.cellCount, side, mesh: weave.mesh }
}

export function hubVacuum(h: { cells: number; store: Int8Array; layout: Int8Array }): Reduced {
  return { vibe: new Int8Array(h.cells * 24), point: new Int8Array(h.cells * 24), store: Int8Array.from(h.store), spoint: Int8Array.from(h.layout) }
}

export function hubReplay(k: BounceKernel, start: Reduced): Replay & { state: () => Reduced } {
  let a = cloneReduced(start)
  let b = cloneReduced(start)

  return {
    cells: k.cells,
    state: () => a,
    collide(t) {
      for (let x = 0; x < k.cells; x++) collideBounce(k, a, x, t)
    },
    vibes: () => a.vibe,
    carried: () => undefined,
    stream(target) {
      b.vibe.fill(0)

      for (let slot = 0; slot < a.vibe.length; slot++) {
        const v = a.vibe[slot] as number

        if (v === 0) continue

        const to = target[slot] as number

        b.vibe[to] = v
        b.point[to] = (k.move[slot] as Int8Array)[a.point[slot] as number] as number
      }

      b.store.set(a.store)
      b.spoint.set(a.spoint)

      const swap = a

      a = b
      b = swap
    },
    snapshot() {
      const out = new Int32Array(a.vibe.length * 2 + a.store.length * 2)

      for (let i = 0; i < a.vibe.length; i++) {
        out[i] = a.vibe[i] as number
        out[a.vibe.length + i] = a.vibe[i] !== 0 ? (a.point[i] as number) : 0
      }

      for (let i = 0; i < a.store.length; i++) {
        out[2 * a.vibe.length + i] = a.store[i] as number
        out[2 * a.vibe.length + a.store.length + i] = a.store[i] !== 0 ? (a.spoint[i] as number) : 0
      }

      return out
    },
  }
}

// the cold quaternion knits (E-RLT-0054, 0056, 0057)
export function coldReplay(lattice: ColdQuaternionLattice, start: ColdQuaternionState): Replay & { state: () => ColdQuaternionState } {
  let s: ColdQuaternionState = { vibe: Int8Array.from(start.vibe), store: Int32Array.from(start.store), counter: Int32Array.from(start.counter) }

  return {
    cells: lattice.mesh.cellCount,
    state: () => s,
    collide() {
      s = coldQuaternionCollideAll(lattice, s)
    },
    vibes: () => s.vibe,
    carried: () => s.store,
    stream(target) {
      const vibe = new Int8Array(s.vibe.length)
      const store = new Int32Array(s.store.length)

      for (let i = 0; i < s.vibe.length; i++) {
        const to = target[i] as number

        vibe[to] = s.vibe[i] as number
        store[to] = s.store[i] as number
      }

      s = { vibe, store, counter: s.counter }
    },
    snapshot() {
      return Int32Array.from([...s.vibe, ...s.store, ...s.counter])
    },
  }
}

// a tone-only knit of code/rule/lattice-gas (the committed turning weave, the combined knit)
export function toneReplay(mesh: Mesh, forward: (t: number) => Collision, start: Int8Array): Replay & { data: () => Int8Array } {
  let will = { mesh, data: Int8Array.from(start) }

  return {
    cells: mesh.cellCount,
    data: () => will.data,
    collide(t) {
      collide(will, forward(t))
    },
    vibes: () => will.data,
    carried: () => undefined,
    stream(target) {
      const out = new Int8Array(will.data.length)

      for (let i = 0; i < out.length; i++) out[target[i] as number] = will.data[i] as number

      will = { mesh, data: out }
    },
    snapshot() {
      return Int32Array.from(will.data)
    },
  }
}

// ---- one run, read ----

export type CausalRun = {
  readonly counts: CausalCounts
  // the post-collision slots of every beat, kept when asked (a vacuum reference for matter)
  readonly frames: { vibes: Int8Array; carried?: Int32Array }[]
  readonly log: CausalLog
}

// run `beats` beats of a replay through `target`, logging every copy; `onBeat` sees the replay after each stream
export function causalRun(input: {
  replay: Replay
  husk: BoxHusk
  target: Int32Array
  beats: number
  seedDock?: number
  reference?: readonly { vibes: Int8Array; carried?: Int32Array }[]
  keepFrames?: boolean
  keepMasks?: boolean
  onBeat?: (t: number) => void
}): CausalRun {
  const log = causalLog(input.husk, { seedDock: input.seedDock, keepMasks: input.keepMasks })
  const frames: { vibes: Int8Array; carried?: Int32Array }[] = []

  for (let t = 0; t < input.beats; t++) {
    input.replay.collide(t)

    const vibes = input.replay.vibes()
    const carried = input.replay.carried()

    recordCopies(log, input.target, vibes, carried, input.reference?.[t])

    if (input.keepFrames) frames.push({ vibes: Int8Array.from(vibes), carried: carried ? Int32Array.from(carried) : undefined })

    input.replay.stream(input.target)
    input.onBeat?.(t)
  }

  return { counts: causalCounts(log), frames, log }
}
