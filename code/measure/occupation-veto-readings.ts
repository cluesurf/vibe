// Readings of the doublet-locked knit with a chosen veto (code/rule/occupation-veto-knit, E-RLT-0100, E-RLT-0101): the
// paths of the all-open rule, the lone wake along a path, and a wall read along paths, each as code/measure/
// doublet-locked-readings reads them with the rule's collision replaced by the chosen veto's. MEASUREMENT: every count
// is an exact integer; no float appears in this file.
//
// A PATH fixes every keep-or-exchange choice of the all-open rule by an integer silver-rate Weyl number of its key
// (beat, dock, line), code/measure/doublet-locked-readings exchangeAt: threshold 0 keeps always (the old history), 65536
// exchanges always (the heaviest single term), 49152 exchanges at the Born rate 3/4. A path is one term of the sum.
//
// NOTHING MOVES: every reading compares values the stream took.

import { cloneConfiguration, streamConfiguration, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { collideVeto, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { pathMeet, streamInto, tritsApart, newPathTally, type PathRunner, type PathTally } from '@/code/measure/doublet-locked-readings'
import { type Replay } from '@/code/measure/causal-components'
import { LINE_OF } from '@/code/rule/isometric-knit'

export function vetoPathRunner(kind: VetoKind, tables: LockedTables, start: Configuration, threshold: number, phase = 0): PathRunner {
  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let t = phase
  const col = { made: 0, unmade: 0, vetoed: 0, likeMeetings: 0, splitMeetings: 0, phaseMeetings: 0, unlikeMeetings: 0, merged: 0 }

  return {
    state: () => a,
    time: () => t,
    beat: (tally?: PathTally) => {
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
    },
  }
}

// a path as a replay for code/measure/causal-components causalRun
export function vetoPathReplay(kind: VetoKind, tables: LockedTables, start: Configuration, threshold: number): Replay & { state: () => Configuration } {
  let c = cloneConfiguration(start)

  return {
    cells: tables.cells,
    state: () => c,
    collide(t) {
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
export function vetoPathTrack(kind: VetoKind, tables: LockedTables, vacuum: Configuration, threshold: number, beats: number): { states: Configuration[]; tally: PathTally } {
  const v = vetoPathRunner(kind, tables, vacuum, threshold)
  const tally = newPathTally()
  const states: Configuration[] = []

  for (let t = 0; t < beats; t++) {
    v.beat(tally)
    states.push(cloneConfiguration(v.state()))
  }

  return { states, tally }
}

// the lone wake along a path (E-RLT-0084's B6): worst trits apart per 24-beat period, and trits off the seed's line
export function vetoPathWake(input: { kind: VetoKind; tables: LockedTables; vacuum: Configuration; track: readonly Configuration[]; seedSlot: number; tone: number; threshold: number; beats: number }): { worst: number[]; offLine: number } {
  const { kind, tables, vacuum, track, seedSlot, tone, threshold, beats } = input
  const start = cloneConfiguration(vacuum)

  start.vibe[seedSlot] = tone
  start.open[seedSlot] = 1

  const s = vetoPathRunner(kind, tables, start, threshold)
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
