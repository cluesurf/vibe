// The relation graph of a run's own history (E-SLF-0177, E-SLF-0178). MEASUREMENT: every count is an exact integer; no
// rule piece is changed, added or reimplemented here. Nothing moves: a vibe's history is the trail of slots and stores
// that took its value, beat after beat.
//
// A NODE IS A VIBE. The knit makes and unmakes no vibe: a stored unit is its two vibes resting on a line of a dock, a
// made pair is those two vibes put back in the line's slots, and every other piece permutes a dock's slots or takes a
// neighbor's value. So a vibe is one trail from beat 0 to the end, and the rule itself carries which trail is which:
// each slot's `open` bit and each stored line's `sopen` bits ride with the vibe through every piece (the stream copies
// open, the dock permutation carries it, the unmake stores it per slot and the make restores it per slot). On the paths
// read here that bit is a pure passenger: no piece reads it except the coin, which reads it only for a vibe alone on
// its line, and the vacuum never has one where the path crosses (E-RLT-0105: 0 crosses with every vibe open, so 0 with
// fewer open). So a vibe's number is written into the open bits, one bit plane per run, and read back by combining the
// planes. Every plane run is checked to have the plain run's occupation at every beat, and the numbers read back are
// checked to be a permutation (each number exactly once) at every read.
//
// AN EDGE IS A MEETING. The rule's collision acts on one dock at a time and reads that dock's content together:
//   BROAD (the gated reading): at beat t, every vibe in a slot of dock x before or after the collision meets every
//   other (the dock permutation, bounce or isometric, is a function of the whole dock's slot occupation, and every
//   line piece reads its own line), and a stored unit on a line of x meets them when that line holds a slot vibe before
//   or after the collision (the pair piece reads the line's store with its slots).
//   NARROW (reported): only vibes on one LINE of one dock meet: its two slots and its store, before or after.
// In both, a stored unit's two vibes are one unit and always joined.
// The relation is history: once joined, never unjoined. Components only merge.

import { type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { type VetoKind } from '@/code/rule/occupation-veto-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { vetoPathReplay } from '@/code/measure/occupation-veto-readings'
import { forest, join, rootOf, type BoxHusk } from '@/code/measure/causal-components'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

// the vibes of a configuration, numbered: held slots in slot order, then each held store line's first-slot vibe and
// second-slot vibe, in line order
export function numberVibes(c: Configuration): { count: number } {
  let count = 0

  for (let i = 0; i < c.vibe.length; i++) count += c.vibe[i] !== 0 ? 1 : 0
  for (let l = 0; l < c.store.length; l++) count += c.store[l] !== 0 ? 2 : 0

  return { count }
}

// a copy of `c` whose open bits carry bit k of each vibe's number (every held slot and stored vibe, in numberVibes order)
function planeOf(c: Configuration, k: number): Configuration {
  const out: Configuration = { vibe: Int8Array.from(c.vibe), point: Int8Array.from(c.point), open: new Uint8Array(c.open.length), store: Int8Array.from(c.store), spoint: Int8Array.from(c.spoint), sopen: new Uint8Array(c.sopen.length) }
  let id = 0

  for (let i = 0; i < c.vibe.length; i++) if (c.vibe[i] !== 0) out.open[i] = (id++ >> k) & 1

  for (let l = 0; l < c.store.length; l++) {
    if (c.store[l] === 0) continue

    const a = (id++ >> k) & 1
    const b = (id++ >> k) & 1

    out.sopen[l] = a | (b << 1)
  }

  return out
}

// the numbers read back from the planes: per slot (-1 if empty) and per store line, first and second (-1 if empty)
type Reading = { slot: Int32Array; first: Int32Array; second: Int32Array }

function readIds(plain: Configuration, planes: readonly Configuration[], into: Reading): void {
  into.slot.fill(-1)
  into.first.fill(-1)
  into.second.fill(-1)

  for (let i = 0; i < plain.vibe.length; i++) {
    if (plain.vibe[i] === 0) continue

    let id = 0

    for (let k = 0; k < planes.length; k++) id |= ((planes[k]!.open[i] as number) & 1) << k
    into.slot[i] = id
  }

  for (let l = 0; l < plain.store.length; l++) {
    if (plain.store[l] === 0) continue

    let a = 0
    let b = 0

    for (let k = 0; k < planes.length; k++) {
      const o = planes[k]!.sopen[l] as number

      a |= (o & 1) << k
      b |= ((o >> 1) & 1) << k
    }

    into.first[l] = a
    into.second[l] = b
  }
}

// how many slots or store lines of a plane differ from the plain run in occupation (vibe trit or store trit)
function occupationBreaks(plain: Configuration, plane: Configuration): number {
  let n = 0

  for (let i = 0; i < plain.vibe.length; i++) n += plain.vibe[i] !== plane.vibe[i] ? 1 : 0
  for (let l = 0; l < plain.store.length; l++) n += plain.store[l] !== plane.store[l] ? 1 : 0

  return n
}

// whether the numbers read are each of 0 .. count - 1 exactly once
function isPermutation(r: Reading, count: number, seen: Uint8Array): boolean {
  seen.fill(0)

  let n = 0
  const mark = (id: number): boolean => {
    if (id < 0) return true
    if (id >= count || seen[id]) return false
    seen[id] = 1
    n++

    return true
  }

  for (let i = 0; i < r.slot.length; i++) if (!mark(r.slot[i] as number)) return false
  for (let l = 0; l < r.first.length; l++) if (!mark(r.first[l] as number) || !mark(r.second[l] as number)) return false

  return n === count
}

// ---- the growing relation: union-find with the beat of each component's last merge ----

export type Relation = {
  readonly parent: Int32Array
  // at a root: the beat its component last grew by a merge (-1 if it never has)
  readonly lastMerge: Int32Array
  // per beat: the number of components and the largest component's size, after that beat's meetings
  readonly components: number[]
  readonly largest: number[]
  // every meeting, flat: meetings[t] holds, per meeting, its size then its members
  readonly meetings: Int32Array[]
}

function newRelation(count: number): Relation {
  return { parent: forest(count), lastMerge: new Int32Array(count).fill(-1), components: [], largest: [], meetings: [] }
}

function meet(r: Relation, ids: readonly number[], t: number): void {
  const a = ids[0] as number

  for (let k = 1; k < ids.length; k++) {
    const ra = rootOf(r.parent, a)
    const rb = rootOf(r.parent, ids[k] as number)

    if (ra === rb) continue

    join(r.parent, ra, rb)

    const root = rootOf(r.parent, ra)

    r.lastMerge[root] = t
  }
}

function tally(r: Relation, count: number): void {
  const size = new Int32Array(count)
  let components = 0
  let largest = 0

  for (let i = 0; i < count; i++) {
    const root = rootOf(r.parent, i)

    size[root]!++
  }

  for (let i = 0; i < count; i++) {
    if ((size[i] as number) === 0) continue
    components++
    largest = Math.max(largest, size[i] as number)
  }

  r.components.push(components)
  r.largest.push(largest)
}

// ---- one run, read ----

export type RelationRun = {
  readonly count: number
  readonly bits: number
  // plane occupations that differ from the plain run, summed over every plane and beat (0 when the bit is a passenger)
  readonly occupationBreaks: number
  // reads (before and after every collision) whose numbers are not a permutation
  readonly idBreaks: number
  readonly broad: Relation
  readonly narrow: Relation
  // each vibe's dock after the last beat
  readonly dock: Int32Array
  // with `track`, after each beat's stream: each vibe's place (a slot, or cells * 24 + its store line), and the plain
  // run's occupation
  readonly positions: Int32Array[]
  readonly occupation: { vibe: Int8Array; store: Int8Array }[]
}

export function relationRun(input: { kind: VetoKind; tables: LockedTables; start: Configuration; threshold: number; coin: boolean; beats: number; keepMeetings?: boolean; track?: boolean }): RelationRun {
  const { kind, tables, start, threshold, coin, beats } = input
  const { count } = numberVibes(start)
  const bits = Math.max(1, Math.ceil(Math.log2(Math.max(2, count))))
  const plain = vetoPathReplay(kind, tables, start, threshold, coin)
  const planes = Array.from({ length: bits }, (_, k) => vetoPathReplay(kind, tables, planeOf(start, k), threshold, coin))
  const cells = tables.cells
  const lines = cells * 12
  const pre: Reading = { slot: new Int32Array(cells * 24), first: new Int32Array(lines), second: new Int32Array(lines) }
  const post: Reading = { slot: new Int32Array(cells * 24), first: new Int32Array(lines), second: new Int32Array(lines) }
  const seen = new Uint8Array(count)
  const broad = newRelation(count)
  const narrow = newRelation(count)
  const set: number[] = []
  const lineSet: number[] = []
  let breaks = 0
  let idBreaks = 0
  const positions: Int32Array[] = []
  const occupation: { vibe: Int8Array; store: Int8Array }[] = []

  const add = (list: number[], id: number): void => {
    if (id >= 0 && !list.includes(id)) list.push(id)
  }

  for (let t = 0; t < beats; t++) {
    readIds(plain.state(), planes.map(p => p.state()), pre)
    idBreaks += isPermutation(pre, count, seen) ? 0 : 1

    plain.collide(t)
    for (const p of planes) p.collide(t)

    for (const p of planes) breaks += occupationBreaks(plain.state(), p.state())

    readIds(plain.state(), planes.map(p => p.state()), post)
    idBreaks += isPermutation(post, count, seen) ? 0 : 1

    const bmeet: number[] = []
    const nmeet: number[] = []

    for (let x = 0; x < cells; x++) {
      set.length = 0

      for (let d = 0; d < 24; d++) {
        add(set, pre.slot[x * 24 + d] as number)
        add(set, post.slot[x * 24 + d] as number)
      }

      for (let l = 0; l < 12; l++) {
        const line = x * 12 + l
        const i = x * 24 + (LINE_FIRSTS[l] as number)
        const j = x * 24 + (LINE_SECONDS[l] as number)
        const slotHeld = (pre.slot[i] as number) >= 0 || (pre.slot[j] as number) >= 0 || (post.slot[i] as number) >= 0 || (post.slot[j] as number) >= 0

        lineSet.length = 0
        add(lineSet, pre.slot[i] as number)
        add(lineSet, pre.slot[j] as number)
        add(lineSet, post.slot[i] as number)
        add(lineSet, post.slot[j] as number)

        // a stored unit's two vibes are one unit, always
        for (const r of [pre, post]) {
          const a = r.first[line] as number
          const b = r.second[line] as number

          if (a >= 0) {
            meet(broad, [a, b], t)
            meet(narrow, [a, b], t)

            if (input.keepMeetings && (r === pre || a !== pre.first[line])) {
              bmeet.push(2, a, b)
              nmeet.push(2, a, b)
            }

            add(lineSet, a)
            add(lineSet, b)

            if (slotHeld) {
              add(set, a)
              add(set, b)
            }
          }
        }

        if (lineSet.length >= 2) {
          meet(narrow, lineSet, t)
          if (input.keepMeetings) nmeet.push(lineSet.length, ...lineSet)
        }
      }

      if (set.length >= 2) {
        meet(broad, set, t)
        if (input.keepMeetings) bmeet.push(set.length, ...set)
      }
    }

    if (input.keepMeetings) {
      broad.meetings.push(Int32Array.from(bmeet))
      narrow.meetings.push(Int32Array.from(nmeet))
    }

    tally(broad, count)
    tally(narrow, count)

    plain.stream(tables.target)
    for (const p of planes) p.stream(tables.target)

    if (input.track) {
      readIds(plain.state(), planes.map(p => p.state()), pre)

      const at = new Int32Array(count).fill(-1)

      for (let i = 0; i < pre.slot.length; i++) if ((pre.slot[i] as number) >= 0) at[pre.slot[i] as number] = i

      for (let l = 0; l < pre.first.length; l++) {
        if ((pre.first[l] as number) < 0) continue
        at[pre.first[l] as number] = cells * 24 + l
        at[pre.second[l] as number] = cells * 24 + l
      }

      positions.push(at)
      occupation.push({ vibe: Int8Array.from(plain.state().vibe), store: Int8Array.from(plain.state().store) })
    }
  }

  readIds(plain.state(), planes.map(p => p.state()), pre)
  idBreaks += isPermutation(pre, count, seen) ? 0 : 1

  const dock = new Int32Array(count).fill(-1)

  for (let i = 0; i < pre.slot.length; i++) if ((pre.slot[i] as number) >= 0) dock[pre.slot[i] as number] = (i / 24) | 0

  for (let l = 0; l < pre.first.length; l++) {
    if ((pre.first[l] as number) < 0) continue
    dock[pre.first[l] as number] = (l / 12) | 0
    dock[pre.second[l] as number] = (l / 12) | 0
  }

  return { count, bits, occupationBreaks: breaks, idBreaks, broad, narrow, dock, positions, occupation }
}

// ---- the cut (E-SLF-0178): what one part's absence does to another part's trail ----

// the rule run from `start` with the part `removed` taken out at beat 0 (its slots emptied, its store lines emptied),
// against a tracked full run: for the vibes `watched`, the (vibe, beat) pairs whose place in the full run holds a
// different trit in the cut run; and after the last beat, the vibes outside `inside` whose place differs (the leak)
export function cutDifference(input: {
  kind: VetoKind
  tables: LockedTables
  start: Configuration
  threshold: number
  coin: boolean
  full: RelationRun
  removed: { slots: readonly number[]; lines: readonly number[] }
  watched: readonly number[]
  inside: ReadonlySet<number>
}): { moved: number; leak: number } {
  const { tables, full } = input
  const beats = full.positions.length
  const cells = tables.cells
  const c: Configuration = { vibe: Int8Array.from(input.start.vibe), point: Int8Array.from(input.start.point), open: Uint8Array.from(input.start.open), store: Int8Array.from(input.start.store), spoint: Int8Array.from(input.start.spoint), sopen: Uint8Array.from(input.start.sopen) }

  for (const s of input.removed.slots) {
    c.vibe[s] = 0
    c.point[s] = 0
    c.open[s] = 0
  }

  for (const l of input.removed.lines) {
    c.store[l] = 0
    c.sopen[l] = 0
  }

  const run = vetoPathReplay(input.kind, tables, c, input.threshold, input.coin)
  const differs = (at: number, t: number): boolean => {
    const occ = full.occupation[t]!
    const s = run.state()

    return at < cells * 24 ? s.vibe[at] !== occ.vibe[at] : s.store[at - cells * 24] !== occ.store[at - cells * 24]
  }
  let moved = 0
  let leak = 0

  for (let t = 0; t < beats; t++) {
    run.collide(t)
    run.stream(tables.target)

    const at = full.positions[t]!

    for (const v of input.watched) moved += differs(at[v] as number, t) ? 1 : 0

    if (t === beats - 1) for (let v = 0; v < full.count; v++) if (!input.inside.has(v) && differs(at[v] as number, t)) leak++
  }

  return { moved, leak }
}

// ---- components at the end, and their reach on the husk ----

export type Component = { readonly root: number; readonly members: number[]; readonly lastMerge: number }

export function componentsOf(r: Relation, count: number): Component[] {
  const byRoot = new Map<number, number[]>()

  for (let i = 0; i < count; i++) {
    const root = rootOf(r.parent, i)
    const list = byRoot.get(root)

    if (list) list.push(i)
    else byRoot.set(root, [i])
  }

  return [...byRoot.entries()].map(([root, members]) => ({ root, members, lastMerge: r.lastMerge[root] as number }))
}

const cyclic = (a: number, b: number, side: number): number => {
  const d = Math.abs(a - b) % side

  return Math.min(d, side - d)
}

// the husk coordinates of a column, and the cyclic L-infinity distance of two columns
export function columnDistance(a: number, b: number, side: number): number {
  const ax = a % side
  const ay = Math.floor(a / side) % side
  const az = Math.floor(a / (side * side))
  const bx = b % side
  const by = Math.floor(b / side) % side
  const bz = Math.floor(b / (side * side))

  return Math.max(cyclic(ax, bx, side), cyclic(ay, by, side), cyclic(az, bz, side))
}

// the husk columns a set of vibes sits on, and their largest pairwise cyclic L-infinity distance
export function huskSpread(members: readonly number[], dock: Int32Array, husk: BoxHusk): { columns: number; diameter: number } {
  const columns = [...new Set(members.map(m => husk.column[dock[m] as number] as number))]
  let diameter = 0

  for (let i = 0; i < columns.length; i++) for (let j = i + 1; j < columns.length; j++) diameter = Math.max(diameter, columnDistance(columns[i] as number, columns[j] as number, husk.side))

  return { columns: columns.length, diameter }
}

// the relational eccentricity of a component, by a double sweep: hops through meetings (one hop = one meeting shared)
export function relationalSweep(r: Relation, members: readonly number[], count: number): number {
  if (members.length < 2) return 0

  const byVibe: number[][] = Array.from({ length: count }, () => [])
  const groups: number[][] = []
  const inside = new Uint8Array(count)

  for (const m of members) inside[m] = 1

  for (const flat of r.meetings) {
    for (let k = 0; k < flat.length; ) {
      const size = flat[k] as number
      const group = Array.from(flat.subarray(k + 1, k + 1 + size))

      k += size + 1
      if (!inside[group[0] as number]) continue
      for (const v of group) byVibe[v]!.push(groups.length)
      groups.push(group)
    }
  }

  const bfs = (from: number): { far: number; depth: number } => {
    const dist = new Int32Array(count).fill(-1)
    const used = new Uint8Array(groups.length)
    let queue = [from]
    let depth = 0
    let far = from

    dist[from] = 0

    while (queue.length > 0) {
      const next: number[] = []

      for (const v of queue) {
        for (const g of byVibe[v]!) {
          if (used[g]) continue
          used[g] = 1
          for (const w of groups[g]!) {
            if (dist[w] !== -1) continue
            dist[w] = depth + 1
            far = w
            next.push(w)
          }
        }
      }

      if (next.length > 0) depth++
      queue = next
    }

    return { far, depth }
  }

  const first = bfs(members[0] as number)

  return bfs(first.far).depth
}
