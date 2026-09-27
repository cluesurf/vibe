// Readings of the doublet-locked knit with a chosen veto (code/rule/occupation-veto-knit, E-RLT-0100, E-RLT-0101): the
// paths of the all-open rule, the lone wake along a path, and a wall read along paths, each as code/measure/
// doublet-locked-readings reads them with the rule's collision replaced by the chosen veto's. MEASUREMENT: every count
// is an exact integer; no float appears in this file.
//
// A PATH fixes every keep-or-exchange choice of the all-open rule by an integer silver-rate Weyl number of its key
// (beat, dock, line), code/measure/doublet-locked-readings exchangeAt: threshold 0 keeps always (the old history), 65536
// exchanges always (the heaviest single term), 49152 exchanges at the Born rate 3/4. A path is one term of the sum.
//
// WITH THE COIN (E-RLT-0104, E-RLT-0105): `coin` true runs the covariant coin of code/rule/coined-locked-knit on the
// path before the meeting, as that rule orders its beat. A line holding one OPEN vibe and an empty slot keeps it or
// hands it to the line's other slot, and the path decides which by the same keyed Weyl number as the meeting
// (exchangeAt on beat, dock, line): the coin's cross weight |(1 - w)/2|^2 is 3/4 and its keep weight 1/4, the meeting's
// own, so threshold 0 keeps always, 49152 crosses at the Born rate and 65536 always. A line is half full or full at
// one beat, never both, so the coin and the meeting never read one key twice. With `coin` false (the default) every
// reading here is the one it was before.
//
// NOTHING MOVES: every reading compares values the stream took.

import { cloneConfiguration, lockedTables, streamConfiguration, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { collideVeto, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { exchangeAt, lockedFresh, pathMeet, streamInto, tritsApart, newPathTally, THRESHOLD_KEEP, type LockedFresh, type PathRunner, type PathTally } from '@/code/measure/doublet-locked-readings'
import { type Replay } from '@/code/measure/causal-components'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

// the fresh vacuum weave with the rule's tables on a chosen like contact: 'lone' (the knit's own bounce, u = -1) or
// 'pass' (E-SPN-0092, u = +1)
export function contactFresh(side: number, contact: CollisionKind, anchor = 0): LockedFresh {
  const f = lockedFresh(side, anchor)

  return { ...f, tables: lockedTables(f.weave, contact) }
}

// The two vacuum vibes of the rule's OWN first like meeting with unequal points (E-RLT-0102, E-RLT-0103), named without
// an id run: the classical history of `vacuum` (no open vibe, the keep path, which is the no-open rule) is scanned for
// the first line of two like vibes with unequal points; those two are marked open and the rule is run back to beat 0,
// where the exact inverse leaves the two marks on the stored pairs they came from. So the pick is the rule's own, even
// where its history is not the old knit's. `clean` says the run back returned the vacuum's occupation and words exactly.
export function likePairStart(kind: VetoKind, tables: LockedTables, vacuum: Configuration, search: number): { start: Configuration; beat: number; clean: boolean } | undefined {
  const run = vetoPathRunner(kind, tables, vacuum, THRESHOLD_KEEP)

  for (let t = 0; t <= search; t++) {
    const c = run.state()

    for (let x = 0; x < tables.cells; x++) {
      for (let l = 0; l < 12; l++) {
        const i = x * 24 + (LINE_FIRSTS[l] as number)
        const j = x * 24 + (OPPOSITE[LINE_FIRSTS[l] as number] as number)

        if (c.vibe[i] === 0 || c.vibe[i] !== c.vibe[j] || c.point[i] === c.point[j]) continue

        const marked = cloneConfiguration(c)

        marked.open.fill(0)
        marked.sopen.fill(0)
        marked.open[i] = 1
        marked.open[j] = 1

        const back = vetoPathRunner(kind, tables, marked, THRESHOLD_KEEP, t)

        for (let k = 0; k < t; k++) back.back()

        const start = cloneConfiguration(back.state())
        let clean = true
        let marks = 0

        for (let s = 0; s < start.vibe.length && clean; s++) clean = start.vibe[s] === vacuum.vibe[s]
        for (let s = 0; s < start.store.length && clean; s++) {
          clean = start.store[s] === vacuum.store[s] && (start.store[s] === 0 || start.spoint[s] === vacuum.spoint[s])
          const o = start.sopen[s] as number

          marks += (o & 1) + (o >> 1)
        }

        return { start, beat: t, clean: clean && marks === 2 }
      }
    }

    run.beat()
  }

  return undefined
}

// the coin on a path at beat t: every line of one open vibe and an empty slot hands the vibe (value, point, open bit)
// to the other slot where the path's key says cross; its own inverse (the line stays half full). Returns the crosses.
export function pathCoin(tables: LockedTables, c: Configuration, threshold: number, t: number): number {
  let crossed = 0

  for (let x = 0; x < tables.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + (LINE_FIRSTS[l] as number)
      const j = x * 24 + (OPPOSITE[LINE_FIRSTS[l] as number] as number)
      const hi = c.vibe[i] !== 0
      const hj = c.vibe[j] !== 0

      if (hi === hj) continue

      const from = hi ? i : j
      const to = hi ? j : i

      if (!c.open[from] || !exchangeAt(threshold, tables.cells, t, x, l)) continue

      c.vibe[to] = c.vibe[from] as number
      c.point[to] = c.point[from] as number
      c.open[to] = c.open[from] as number
      c.vibe[from] = 0
      c.point[from] = 0
      c.open[from] = 0
      crossed++
    }
  }

  return crossed
}

export function vetoPathRunner(kind: VetoKind, tables: LockedTables, start: Configuration, threshold: number, phase = 0, coin = false): PathRunner & { crossed: () => number } {
  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let t = phase
  let crossed = 0
  const col = { made: 0, unmade: 0, vetoed: 0, likeMeetings: 0, splitMeetings: 0, phaseMeetings: 0, unlikeMeetings: 0, merged: 0 }

  return {
    state: () => a,
    time: () => t,
    crossed: () => crossed,
    beat: (tally?: PathTally) => {
      if (coin) crossed += pathCoin(tables, a, threshold, t)
      pathMeet(tables, a, threshold, t, tally)
      col.made = 0
      col.unmade = 0
      col.vetoed = 0
      collideVeto(kind, tables, a, t, false, col)

      if (tally) {
        tally.made += col.made
        tally.unmade += col.unmade
        tally.vetoed += col.vetoed
      }

      streamInto(tables, a, b)

      const swap = a

      a = b
      b = swap
      t++
    },
    back: () => {
      t--
      streamConfiguration(tables, a, true)
      collideVeto(kind, tables, a, t, true)
      pathMeet(tables, a, threshold, t)
      if (coin) pathCoin(tables, a, threshold, t)
    },
  }
}

// a path as a replay for code/measure/causal-components causalRun
export function vetoPathReplay(kind: VetoKind, tables: LockedTables, start: Configuration, threshold: number, coin = false): Replay & { state: () => Configuration } {
  let c = cloneConfiguration(start)

  return {
    cells: tables.cells,
    state: () => c,
    collide(t) {
      if (coin) pathCoin(tables, c, threshold, t)
      pathMeet(tables, c, threshold, t)
      collideVeto(kind, tables, c, t, false)
    },
    vibes: () => c.vibe,
    carried: () => undefined,
    stream(target) {
      if (target !== tables.target) {
        for (let i = 0; i < target.length; i++) if (target[i] !== tables.target[i]) throw new Error('a path replays through its own stream only')
      }

      streamConfiguration(tables, c, false)
    },
    snapshot() {
      const out = new Int32Array(c.vibe.length * 2 + c.store.length * 2)

      for (let i = 0; i < c.vibe.length; i++) {
        out[i] = c.vibe[i] as number
        out[c.vibe.length + i] = c.vibe[i] !== 0 ? (c.point[i] as number) : 0
      }

      for (let i = 0; i < c.store.length; i++) {
        out[2 * c.vibe.length + i] = c.store[i] as number
        out[2 * c.vibe.length + c.store.length + i] = c.store[i] !== 0 ? (c.spoint[i] as number) : 0
      }

      return out
    },
  }
}

// the vacuum's path history, one configuration per beat after the stream
export function vetoPathTrack(kind: VetoKind, tables: LockedTables, vacuum: Configuration, threshold: number, beats: number, coin = false): { states: Configuration[]; tally: PathTally } {
  const v = vetoPathRunner(kind, tables, vacuum, threshold, 0, coin)
  const tally = newPathTally()
  const states: Configuration[] = []

  for (let t = 0; t < beats; t++) {
    v.beat(tally)
    states.push(cloneConfiguration(v.state()))
  }

  return { states, tally }
}

// the lone wake along a path (E-RLT-0084's B6): worst trits apart per 24-beat period, and trits off the seed's line
export function vetoPathWake(input: { kind: VetoKind; tables: LockedTables; vacuum: Configuration; track: readonly Configuration[]; seedSlot: number; tone: number; threshold: number; beats: number; coin?: boolean }): { worst: number[]; offLine: number } {
  const { kind, tables, vacuum, track, seedSlot, tone, threshold, beats, coin = false } = input
  const start = cloneConfiguration(vacuum)

  start.vibe[seedSlot] = tone
  start.open[seedSlot] = 1

  const s = vetoPathRunner(kind, tables, start, threshold, 0, coin)
  const line = LINE_OF[seedSlot % 24] as number
  const worst = [0, 0, 0, 0]
  let offLine = 0

  for (let t = 0; t < beats; t++) {
    s.beat()

    const a = s.state()
    const b = track[t] as Configuration
    const period = Math.floor(t / 24)

    worst[period] = Math.max(worst[period] ?? 0, tritsApart(a, b))

    for (let i = 0; i < a.vibe.length; i++) if (a.vibe[i] !== b.vibe[i] && LINE_OF[i % 24] !== line) offLine++
    for (let i = 0; i < a.store.length; i++) if (a.store[i] !== b.store[i] && i % 12 !== line) offLine++
  }

  return { worst, offLine }
}

export type VetoWallReading = { readonly windows: number; readonly endDocks: number; readonly departing: number[]; readonly outside: number[]; readonly outsideColumns: number[]; readonly grew: number[]; readonly frozen: boolean; readonly passes: boolean }

// a wall along paths (code/measure/union-walls readWall, line for line, the three runs on one path): the planted run P
// against the vacuum A outside and the image vacuum B inside; `vacuum` builds a start from a store
export function readVetoWall(input: {
  kind: VetoKind
  tables: LockedTables
  vacuum: (store: Int8Array) => Configuration
  store: Int8Array
  image: Int8Array
  inside: Uint8Array
  column: Int32Array
  columns: number
  from: number
  to: number
  window: number
  threshold: number
}): VetoWallReading {
  const { kind, tables, vacuum, store, image, inside, column, columns, from, to, window, threshold } = input
  const cells = tables.cells
  const planted = Int8Array.from(store)

  for (let x = 0; x < cells; x++) if (inside[x]) planted.set(image.subarray(x * 12, x * 12 + 12), x * 12)

  const P = vetoPathRunner(kind, tables, vacuum(planted), threshold)
  const A = vetoPathRunner(kind, tables, vacuum(store), threshold)
  const B = vetoPathRunner(kind, tables, vacuum(image), threshold)
  const end = new Uint8Array(cells)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      const y = ((tables.target[x * 24 + d] as number) / 24) | 0

      if (inside[x] !== inside[y]) {
        end[x] = 1
        end[y] = 1
      }
    }
  }

  const notOwn = new Uint8Array(cells)
  const out = { departing: [] as number[], outside: [] as number[], outsideColumns: [] as number[], grew: [] as number[] }
  let previous: Uint8Array | undefined
  let frozen = true
  let windows = 0
  const scratch = new Uint8Array(columns)

  for (let t = 0; t < to; t++) {
    if (t >= from) {
      if ((t - from) % window === 0) notOwn.fill(0)

      const p = P.state()
      const a = A.state()
      const b = B.state()

      for (let x = 0; x < cells; x++) {
        if (notOwn[x]) continue

        const own = inside[x] ? b : a
        let d = 0

        for (let k = 0; k < 24 && !d; k++) if (p.vibe[x * 24 + k] !== own.vibe[x * 24 + k]) d = 1
        for (let l = 0; l < 12 && !d; l++) if (p.store[x * 12 + l] !== own.store[x * 12 + l]) d = 1

        notOwn[x] = d
      }

      if ((t - from) % window === window - 1) {
        windows++

        let n = 0
        let outside = 0
        let grew = 0

        scratch.fill(0)

        for (let x = 0; x < cells; x++) {
          if (!notOwn[x]) continue

          n++
          if (!end[x]) {
            outside++
            scratch[column[x] as number] = 1
          }
          if (previous && !previous[x]) grew++
        }

        if (previous) for (let x = 0; x < cells && frozen; x++) frozen = previous[x] === notOwn[x]

        out.departing.push(n)
        out.outside.push(outside)
        out.outsideColumns.push(scratch.reduce((s, v) => s + v, 0))
        if (previous) out.grew.push(grew)
        previous = Uint8Array.from(notOwn)
      }
    }

    P.beat()
    A.beat()
    B.beat()
  }

  let endCount = 0

  for (let x = 0; x < cells; x++) endCount += end[x] as number

  return { windows, endDocks: endCount, ...out, frozen, passes: out.outside.every(v => v === 0) && out.grew.every(v => v === 0) }
}

// ---- one dock on its own (E-RLT-0102): the collision reads and writes one dock only, so a dock is a configuration ----

const SLOT_SIDE: readonly number[] = LINE_OF.map((l, d) => (LINE_FIRSTS[l] === d ? 0 : 1))

// dock x of a configuration as a one-dock configuration
export function dockOf(c: Configuration, x: number): Configuration {
  return {
    vibe: c.vibe.slice(x * 24, x * 24 + 24),
    point: c.point.slice(x * 24, x * 24 + 24),
    open: c.open.slice(x * 24, x * 24 + 24),
    store: c.store.slice(x * 12, x * 12 + 12),
    spoint: c.spoint.slice(x * 12, x * 12 + 12),
    sopen: c.sopen.slice(x * 12, x * 12 + 12),
  }
}

// a dock's content as a key (held points and stored words only: an empty slot's stale point is not content)
export function dockKey(c: Configuration): string {
  const parts: number[] = []

  for (let d = 0; d < 24; d++) parts.push(c.vibe[d] === 0 ? 0 : (c.vibe[d] as number) * 32 + (c.point[d] as number) * 2 + (c.open[d] as number))
  for (let l = 0; l < 12; l++) parts.push(c.store[l] === 0 ? 0 : (c.store[l] as number) * 1024 + (c.spoint[l] as number) * 4 + (c.sopen[l] as number))

  return parts.join(',')
}

export const sameDock = (a: Configuration, b: Configuration): boolean => dockKey(a) === dockKey(b)

// a coin map g (a permutation of the 24 slots) on a dock: every slot's vibe, point and open bit to slot g[d]; a line's
// stored pair to the image line, and where g carries the line's first slot onto the image's second the stored unit is
// read from the other side: its trit negates, its two points swap in the word, its two open bits swap
export function slotMapDock(c: Configuration, g: readonly number[]): Configuration {
  const out: Configuration = { vibe: new Int8Array(24), point: new Int8Array(24), open: new Uint8Array(24), store: new Int8Array(12), spoint: new Int8Array(12), sopen: new Uint8Array(12) }

  for (let d = 0; d < 24; d++) {
    const e = g[d] as number

    out.vibe[e] = c.vibe[d] as number
    out.point[e] = c.point[d] as number
    out.open[e] = c.open[d] as number
  }

  for (let l = 0; l < 12; l++) {
    const e = g[LINE_FIRSTS[l] as number] as number
    const m = LINE_OF[e] as number
    const flipped = SLOT_SIDE[e] === 1
    const w = c.spoint[l] as number
    const o = c.sopen[l] as number

    out.store[m] = flipped ? -(c.store[l] as number) : (c.store[l] as number)
    out.spoint[m] = flipped ? 9 * (w % 9) + ((w / 9) | 0) : w
    out.sopen[m] = flipped ? ((o & 1) << 1) | (o >> 1) : o
  }

  return out
}

// charge conjugation on a dock: every vibe and store trit negated, points and words kept
export function conjugateDock(c: Configuration): Configuration {
  const out = cloneConfiguration(c)

  for (let d = 0; d < 24; d++) out.vibe[d] = -(c.vibe[d] as number)
  for (let l = 0; l < 12; l++) out.store[l] = -(c.store[l] as number)

  return out
}

// the collision of beat `beat` (or its inverse) on a one-dock configuration, a fresh copy
export function collideDock(kind: VetoKind, tables: LockedTables, c: Configuration, beat: number, inverse: boolean, tally?: { made: number; unmade: number; vetoed: number; likeMeetings: number; splitMeetings: number; phaseMeetings: number; unlikeMeetings: number; merged: number }): Configuration {
  const out = cloneConfiguration(c)

  collideVeto(kind, { ...tables, cells: 1 }, out, beat, inverse, tally)

  return out
}
