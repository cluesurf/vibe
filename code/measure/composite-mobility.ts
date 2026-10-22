// THE MOBILITY OF A COMPOSITE OF LINEONS, READ ON THE HUSK (E-RLT-0114). In fracton models a single lineon cannot
// leave its line, yet some bound composites of lineons (a dipole on parallel lines, a pair or a triple on lines that
// cross) move in directions none of their members can. These readings ask the same of the working knit: a composite
// of vibes placed on different mesh lines is run beside the vacuum's own run on one keyed path, and what differs from
// the vacuum is read on the husk, in each of the 13 husk directions (3 axes, 6 face and 4 body diagonals).
//
// THE MEMBERS ARE THE SINGLES. The working vacuum holds no single line on any dock at any beat (condition Z,
// E-SPN-0119), so every dock line holding exactly one vibe in a run is the composite's own matter, however the rule
// has passed it around. The singles are what a "moving composite" must carry; the rest of what differs from the
// vacuum is the wake (disturbed stores and vacuum pairs).
//
// THE HUSK TORUS. pi(v_1, v_2, v_3, w) = (v_1, v_2, v_3) sends the box D4 / L D4 onto Z^3 / L Z^3 (code/measure/
// bulk-shadow). A dock's husk offset from a hub is read on that torus. A husk point lies on the husk line through the
// hub along u when it is s u mod L for an integer s with 0 < |s| < L / 2; its reach along u is |s| husk steps. The
// antipodes (|s| = L / 2) are left out, so a point lies on at most one such line: if s u = s' u' mod L with |s|, |s'|
// below L / 2, every entry of s u - s' u' is below L in size, so s u = s' u' and u = u'.
//
// Everything is exact integer arithmetic on the box except the reported distances (square roots of integers).
// DETERMINISM: no random numbers; the key is integer arithmetic on (beat, dock, line). NOTHING MOVES: the run hands
// values slot to slot through the rule's own pieces, and these functions only read.

import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  singlesAt,
  starBeat,
  starLines,
  type KEvent,
} from '@/code/measure/hub-star'
import {
  keyedRunner,
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { storeLine } from '@/code/measure/planon-lines'
import { dockVector, shadowOf } from '@/code/measure/bulk-shadow'

const mod = (a: number, m: number): number => ((a % m) + m) % m
const wrap = (a: number, side: number): number => {
  const d = mod(a, side)

  return d > side / 2 ? d - side : d
}

// the 13 husk directions up to sign: 3 axes, 6 face diagonals, 4 body diagonals
export const HUSK_DIRECTIONS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, -1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [1, -1, -1],
]

// the index in HUSK_DIRECTIONS of a husk vector's direction (up to sign and length), or -1 if it is none of the 13
export function huskDirectionOf(v: readonly number[]): number {
  return HUSK_DIRECTIONS.findIndex(u => {
    const k = v.findIndex(x => x !== 0)

    if (k < 0 || u[k] === 0) {
      return false
    }

    const s = v[k]! / u[k]!

    return u.every((x, c) => x * s === v[c])
  })
}

export type HuskFrame = {
  side: number
  // per dock: its husk offset from the hub, wrapped into (-L/2, L/2] on each husk axis
  offset: Int8Array
  // per dock: a bit mask over the 13 directions of the husk lines through the hub it lies on (at most one bit), and
  // its reach on each in husk steps
  lineMask: Uint16Array
  reach: Float64Array
  // per dock: its husk distance from the hub (the wrapped offset's length)
  distance: Float64Array
}

// the husk frame of a hub: every dock's husk offset, the husk lines through pi(hub) it lies on, and its reach on them
export function huskFrame(input: {
  cells: number
  side: number
  hub: number
}): HuskFrame {
  const { cells, side, hub } = input
  const origin = shadowOf(dockVector(hub, side))
  const offset = new Int8Array(cells * 3)
  const lineMask = new Uint16Array(cells)
  const reach = new Float64Array(cells * 13)
  const distance = new Float64Array(cells)
  const pointOf = (h: readonly number[]): number =>
    mod(h[0]!, side) + side * mod(h[1]!, side) + side * side * mod(h[2]!, side)
  // the husk lines through the origin point, as torus points: for each, the directions and the reach
  const onLine = new Map<number, { mask: number; reach: number[] }>()

  HUSK_DIRECTIONS.forEach((u, i) => {
    for (let s = 1 - Math.ceil(side / 2); s < side / 2; s++) {
      if (s === 0) {
        continue
      }

      const p = pointOf(u.map(x => x * s))
      const entry = onLine.get(p) ?? {
        mask: 0,
        reach: new Array<number>(13).fill(0),
      }

      entry.mask |= 1 << i
      entry.reach[i] = Math.max(entry.reach[i]!, Math.abs(s))
      onLine.set(p, entry)
    }
  })

  for (let x = 0; x < cells; x++) {
    const h = shadowOf(dockVector(x, side)).map((v, k) =>
      wrap(v - origin[k]!, side),
    )

    h.forEach((v, k) => (offset[x * 3 + k] = v))
    distance[x] = Math.hypot(...h)

    const entry = onLine.get(pointOf(h))

    if (entry && distance[x]! > 0) {
      lineMask[x] = entry.mask
      entry.reach.forEach((r, i) => (reach[x * 13 + i] = r))
    }
  }

  return { side, offset, lineMask, reach, distance }
}

// the bit mask over the 13 directions of a set of 4d line roots' husk shadows
export function shadowMask(roots: readonly (readonly number[])[]): number {
  return roots.reduce((m, r) => {
    const i = huskDirectionOf(shadowOf(r))

    return i < 0 ? m : m | (1 << i)
  }, 0)
}

// per dock: 1 if its husk point lies on some member's husk line, the whole torus line through the shadow of the
// member's start dock along the shadow of its root (antipode included), else 0
export function memberLineDocks(input: {
  cells: number
  side: number
  members: readonly { dock: number; root: readonly number[] }[]
}): Uint8Array {
  const { cells, side, members } = input
  const pointOf = (h: readonly number[]): number =>
    mod(h[0]!, side) + side * mod(h[1]!, side) + side * side * mod(h[2]!, side)
  const on = new Set<number>()

  for (const { dock, root } of members) {
    const p = shadowOf(dockVector(dock, side))
    const u = shadowOf(root)

    for (let s = 0; s < side; s++) {
      on.add(pointOf(p.map((x, k) => x + s * u[k]!)))
    }
  }

  const out = new Uint8Array(cells)

  for (let x = 0; x < cells; x++) {
    out[x] = on.has(pointOf(shadowOf(dockVector(x, side)))) ? 1 : 0
  }

  return out
}

// the husk distance between two docks on the torus
export function huskApart(frame: HuskFrame, x: number, y: number): number {
  let s = 0

  for (let k = 0; k < 3; k++) {
    const d = wrap(
      frame.offset[x * 3 + k]! - frame.offset[y * 3 + k]!,
      frame.side,
    )

    s += d * d
  }

  return Math.sqrt(s)
}

export type VacuumHistory = {
  // the vacuum after each beat
  states: Configuration[]
  // K firings and single lines in the vacuum run, summed over beats (condition Z says 0 and 0)
  events: number
  singles: number
}

// the vacuum's run on one keyed path, every beat kept, so many starts can be read against it
export function vacuumHistory(input: {
  tables: LockedTables
  vacuum: Configuration
  key: PathKey
  threshold: number
  beats: number
}): VacuumHistory {
  const { tables, vacuum, key, threshold, beats } = input
  const events: KEvent[] = []
  const states: Configuration[] = []

  let a = cloneConfiguration(vacuum)
  let b = cloneConfiguration(vacuum)
  let singles = 0

  for (let t = 0; t < beats; t++) {
    starBeat(tables, a, b, key, threshold, t, events)
    ;[a, b] = [b, a]
    states.push(cloneConfiguration(a))

    for (let x = 0; x < tables.cells; x++) {
      singles += singlesAt(a, x)
    }
  }

  return { states, events: events.length, singles }
}

export type CompositeReading = {
  // per beat: the single lines (the composite's matter), and the readings differing from the vacuum
  singles: number[]
  wake: number[]
  // per beat: the largest husk distance between two singles (0 for one), and the least and largest from the hub
  apart: number[]
  nearest: number[]
  farthest: number[]
  // per beat: the singles off every member's husk line (`onMember` 0 at their dock), and the singles' mean wrapped
  // husk offset from the hub
  offMembers: number[]
  centroid: number[][]
  // per direction, over all beats: the largest reach of a single, and of any differing reading, along that husk line
  singleReach: number[]
  wakeReach: number[]
  // single readings off every member's husk line, summed over beats
  singlesOffMembers: number
  // differing readings on no husk line through the hub, and on no mesh line through a hub dock, summed over beats
  offHuskLines: number
  offStar: number
  // K firings, and those at a dock other than the hubs
  events: number
  offHub: number
  // readings where this stepper and keyedRunner differ (-1 when not checked)
  stepperDiffer: number
}

const sameSlot = (
  p: Configuration,
  q: Configuration,
  i: number,
): boolean =>
  p.vibe[i] === q.vibe[i] &&
  (p.vibe[i] === 0 ||
    (p.point[i] === q.point[i] && p.open[i] === q.open[i]))
const sameStore = (
  p: Configuration,
  q: Configuration,
  s: number,
): boolean =>
  p.store[s] === q.store[s] &&
  (p.store[s] === 0 ||
    (p.spoint[s] === q.spoint[s] && p.sopen[s] === q.sopen[s]))

// a start run beside the vacuum's kept history on the same key, read on the husk frame of the first hub
export function compositeRun(input: {
  tables: LockedTables
  history: VacuumHistory
  start: Configuration
  lines: MeshLines
  frame: HuskFrame
  hubs: readonly number[]
  onMember: Uint8Array
  key: PathKey
  threshold: number
  beats: number
  check: boolean
}): CompositeReading {
  const {
    tables,
    history,
    start,
    lines,
    frame,
    hubs,
    onMember,
    key,
    threshold,
    beats,
    check,
  } = input
  const inStar = starLines(lines, hubs)
  const hubSet = new Set(hubs)
  const events: KEvent[] = []
  const runner = check ? keyedRunner(tables, start, { key, threshold }) : null
  const stores = tables.cells * 12
  const out: CompositeReading = {
    singles: [],
    wake: [],
    apart: [],
    nearest: [],
    farthest: [],
    offMembers: [],
    centroid: [],
    singleReach: new Array<number>(13).fill(0),
    wakeReach: new Array<number>(13).fill(0),
    singlesOffMembers: 0,
    offHuskLines: 0,
    offStar: 0,
    events: 0,
    offHub: 0,
    stepperDiffer: check ? 0 : -1,
  }
  const read = (x: number, into: number[]): void => {
    const m = frame.lineMask[x]!

    if (m === 0) {
      return
    }

    for (let i = 0; i < 13; i++) {
      if ((m >> i) & 1) {
        into[i] = Math.max(into[i]!, frame.reach[x * 13 + i]!)
      }
    }
  }

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)

  for (let t = 0; t < beats; t++) {
    starBeat(tables, a, b, key, threshold, t, events)
    ;[a, b] = [b, a]

    const v = history.states[t]!

    if (runner) {
      runner.beat()

      const c = runner.state()

      for (let i = 0; i < a.vibe.length; i++) {
        if (!sameSlot(a, c, i)) {
          out.stepperDiffer++
        }
      }

      for (let s = 0; s < stores; s++) {
        if (!sameStore(a, c, s)) {
          out.stepperDiffer++
        }
      }
    }

    let wake = 0

    const tally = (x: number, line: number): void => {
      wake++
      read(x, out.wakeReach)

      if (frame.lineMask[x] === 0 && frame.distance[x]! > 0) {
        out.offHuskLines++
      }

      if (!inStar[line]) {
        out.offStar++
      }
    }

    for (let i = 0; i < a.vibe.length; i++) {
      if (!sameSlot(a, v, i)) {
        tally(Math.floor(i / 24), lines.lineOf[i]!)
      }
    }

    for (let s = 0; s < stores; s++) {
      if (!sameStore(a, v, s)) {
        tally(Math.floor(s / 12), storeLine(lines, s))
      }
    }

    const docks: number[] = []
    const sum = [0, 0, 0]

    let off = 0

    for (let x = 0; x < tables.cells; x++) {
      for (let l = 0; l < 12; l++) {
        const f = LINE_FIRSTS[l]!

        if (
          (a.vibe[x * 24 + f] !== 0) ===
          (a.vibe[x * 24 + OPPOSITE[f]!] !== 0)
        ) {
          continue
        }

        docks.push(x)
        read(x, out.singleReach)
        sum.forEach((_, k) => (sum[k]! += frame.offset[x * 3 + k]!))

        if (onMember[x] === 0) {
          off++
        }
      }
    }

    out.singlesOffMembers += off
    out.offMembers.push(off)
    out.centroid.push(sum.map(s => s / Math.max(1, docks.length)))

    let apart = 0

    for (let i = 0; i < docks.length; i++) {
      for (let j = i + 1; j < docks.length; j++) {
        apart = Math.max(apart, huskApart(frame, docks[i]!, docks[j]!))
      }
    }

    out.singles.push(docks.length)
    out.wake.push(wake)
    out.apart.push(apart)
    out.nearest.push(
      docks.length === 0
        ? 0
        : Math.min(...docks.map(x => frame.distance[x]!)),
    )
    out.farthest.push(
      docks.length === 0
        ? 0
        : Math.max(...docks.map(x => frame.distance[x]!)),
    )
  }

  out.events = events.length
  out.offHub = events.filter(e => !hubSet.has(e.dock)).length

  return out
}

// the dimension of the intersection of the spans of a set of 4d line directions: 1 when every direction is parallel
// to the first, else 0 (two distinct lines through the origin share only the origin). A bound composite whose members
// keep their lines moves only inside this intersection (E-SPN-0127 item 4)
export function commonLineSpan(roots: readonly (readonly number[])[]): number {
  const first = roots[0]!

  return roots.every(r => {
    const k = first.findIndex(x => x !== 0)
    const s = r[k]! / first[k]!

    return s !== 0 && first.every((x, c) => x * s === r[c])
  })
    ? 1
    : 0
}
