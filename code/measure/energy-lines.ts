// ENERGY LINES DRAGGED BY THE RULE (E-GRV-0106, E-GRV-0107; note/project/vibe/roadmap/research/discrete-gravity.md, Part 5e).
// The rule conserves E = count + 2 sum |tau| exactly and LOCALLY: every piece of the collision (the coin, the meeting,
// the pair move, the bounce) acts inside one dock and keeps the dock's own energy e(x) = held slots + 2 stored pairs (a
// slot permutation keeps the count; making or unmaking a pair turns two vibes into one store of weight 2 or back), and
// the stream takes each held slot's value one dock along ONE bulk link. So energy moves only across links, one unit per
// vibe per beat, and a register on each bulk link that every crossing vibe changes by one unit keeps
//      div L - e = b   (out minus in, per dock)
// constant on every dock for all time, whatever the rule does, with b fixed by the beat-0 lines. That is Gauss's law for
// the rule's own energy with the lines never placed after beat 0.
//
// THE REGISTER, exactly. One integer L per bulk link (dock x, line l: the link from x along the line's first root r to
// x + r). A vibe that takes its value across the link forward (x to x + r, a first slot) lowers L by one; across it
// backward (a second slot, x + r to x) raises L by one. So each vibe drags a unit line that trails behind it, from the
// dock it arrives at back to the dock it left, and two lines of opposite direction on one link cancel: L is a NET count.
// Per beat a link changes by at most one in size (one first-slot and one second-slot vibe can use it, in opposite senses,
// so the change is -1, 0 or +1). What bounds L over many beats is not a rule: L_t = L_0 - (net vibes that crossed the
// link forward since beat 0), and along a closed loop of links that sum is the vibes' circulation, which Gauss does not
// fix. The readings here measure it rather than assume a bound.
//
// NOTHING MOVES: the lines are read off the values the stream took (a held slot after the stream is one crossing of the
// link it came through); the rule itself is code/measure/full-key-paths' keyed path, unchanged. Exact integers.

import {
  cloneConfiguration,
  streamConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { collideVeto } from '@/code/rule/occupation-veto-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  streamInto,
  THRESHOLD_BORN,
} from '@/code/measure/doublet-locked-readings'
import {
  keyedCoin,
  keyedMeet,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { type BoxHusk } from '@/code/measure/causal-components'
import { coulombFlux } from '@/code/measure/trit-hop-light'
import { huskGeometry } from '@/code/rule/trit-husk'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepDepth } from '@/code/rule/step-depth'
import { huskDistances } from '@/code/measure/plaquette-readings'

const ROOTS = rootsD4()

// the bulk links of a D4 box: per link (x * 12 + l) its head dock, and per dock and line the link that ends at it
export type BulkLinks = {
  readonly cells: number
  readonly head: Int32Array
  readonly tailOfIn: Int32Array
}

export function bulkLinks(tables: LockedTables): BulkLinks {
  const cells = tables.cells
  const head = new Int32Array(cells * 12)
  const tailOfIn = new Int32Array(cells * 12)

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const f = LINE_FIRSTS[l]!

      head[x * 12 + l] = Math.floor(tables.target[x * 24 + f]! / 24)
      // the dock whose line-l link ends at x: x - r, where the second slot of x streams to
      tailOfIn[x * 12 + l] = Math.floor(
        tables.target[x * 24 + OPPOSITE[f]!]! / 24,
      )
    }
  }

  return { cells, head, tailOfIn }
}

// the dock energy e(x) = held slots + 2 stored pairs (`storeWeight` 1 is the control: a store counted as one)
export function dockEnergies(
  c: Configuration,
  out: Int32Array,
  storeWeight = 2,
): Int32Array {
  out.fill(0)

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0) {
      out[Math.floor(i / 24)]!++
    }
  }

  for (let s = 0; s < c.store.length; s++) {
    if (c.store[s] !== 0) {
      out[Math.floor(s / 12)]! += storeWeight
    }
  }

  return out
}

// out = div L (out minus in) per dock
export function lineDivergence(
  links: BulkLinks,
  line: Int32Array,
  out: Int32Array,
): Int32Array {
  out.fill(0)

  for (let k = 0; k < line.length; k++) {
    const v = line[k]!

    if (v === 0) {
      continue
    }

    out[Math.floor(k / 12)]! += v
    out[links.head[k]!]! -= v
  }

  return out
}

// b = div L - e per dock, the Gauss invariant a run must keep (`storeWeight` as dockEnergies)
export function gaussBackground(
  links: BulkLinks,
  line: Int32Array,
  c: Configuration,
  storeWeight = 2,
): Int32Array {
  const div = lineDivergence(links, line, new Int32Array(links.cells))
  const e = dockEnergies(c, new Int32Array(links.cells), storeWeight)

  return Int32Array.from(div, (v, x) => v - e[x]!)
}

// the drag of one beat, read on the state just after the stream: sense -1 applies it (forward), +1 removes it
export function dragLines(
  tables: LockedTables,
  after: Configuration,
  line: Int32Array,
  sense: -1 | 1,
): void {
  for (let i = 0; i < after.vibe.length; i++) {
    if (after.vibe[i] === 0) {
      continue
    }

    const d = i % 24
    const l = LINE_OF[d]!

    if (d === LINE_FIRSTS[l]) {
      // forward across the link of the dock it came from
      const from = Math.floor(tables.source[i]! / 24)

      line[from * 12 + l]! += sense
    } else {
      line[Math.floor(i / 24) * 12 + l]! -= sense
    }
  }
}

// THE KEYED PATH WITH ITS LINES: code/measure/full-key-paths keyedRunner's beat (no mixer, the coin, the meeting, the
// collision with veto 'none', the stream) with the lines dragged, and the exact inverse beat (unstream, the collision's
// inverse, the meeting and the coin, each its own inverse at one beat: plaquette-readings' back)
export type LineRunner = {
  state: () => Configuration
  line: Int32Array
  time: () => number
  beat: () => void
  back: () => void
}

export function lineRunner(
  tables: LockedTables,
  start: Configuration,
  startLine: Int32Array,
  key: PathKey,
  threshold = THRESHOLD_BORN,
): LineRunner {
  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)

  const line = Int32Array.from(startLine)

  let t = 0

  return {
    state: () => a,
    line,
    time: () => t,
    beat() {
      keyedCoin(tables, a, key, threshold, t)
      keyedMeet(tables, a, key, threshold, t)
      collideVeto('none', tables, a, t, false)
      streamInto(tables, a, b)
      dragLines(tables, b, line, -1)

      const s = a

      a = b
      b = s
      t++
    },
    back() {
      t--
      dragLines(tables, a, line, 1)
      streamConfiguration(tables, a, true)
      collideVeto('none', tables, a, t, true)
      keyedMeet(tables, a, key, threshold, t)
      keyedCoin(tables, a, key, threshold, t)
      b = cloneConfiguration(a)
    },
  }
}

// THE BEAT-0 LINES of a seeded lump: `units` unit lines from dock `from` to dock `to`, each along a shortest path of
// bulk links that still has room for one more unit (|L| <= 1 after it, so the placed lines are trits). Returns the links
// used. Placed once, at beat 0; nothing is placed after
export function routeUnits(
  links: BulkLinks,
  line: Int32Array,
  from: number,
  to: number,
  units: number,
): number {
  const prev = new Int32Array(links.cells)
  const queue = new Int32Array(links.cells)

  let used = 0

  for (let u = 0; u < units; u++) {
    prev.fill(-2)
    prev[from] = -1

    let tail = 0

    queue[tail++] = from

    for (let head = 0; head < tail && prev[to] === -2; head++) {
      const x = queue[head]!

      for (let l = 0; l < 12; l++) {
        // forward along x's own link (the line rises), or backward along the link that ends at x (the line falls)
        const fk = x * 12 + l
        const bk = links.tailOfIn[x * 12 + l]! * 12 + l
        const steps: [number, number, number][] = [
          [fk, 1, links.head[fk]!],
          [bk, -1, links.tailOfIn[x * 12 + l]!],
        ]

        for (const [k, s, y] of steps) {
          if (Math.abs(line[k]! + s) > 1 || prev[y] !== -2) {
            continue
          }

          prev[y] = k * 2 + (s > 0 ? 0 : 1)
          queue[tail++] = y
        }
      }
    }

    if (prev[to] === -2) {
      throw new Error(
        `routeUnits: unit ${u} of ${units} cannot be routed`,
      )
    }

    for (let y = to; y !== from; ) {
      const k = Math.floor(prev[y]! / 2)
      const s = prev[y]! % 2 === 0 ? 1 : -1

      line[k]! += s
      used++
      y = s > 0 ? Math.floor(k / 12) : links.head[k]!
    }
  }

  return used
}

// ---- the husk reading: column sums ----

// every bulk link's husk link (column y, direction h: y * 9 + h) and orientation: the link's first root casts +/- a
// husk vector; cast backward, the husk link runs from the head's column
export type HuskCast = {
  readonly columns: number
  readonly link: Int32Array
  readonly sign: Int8Array
}

export function huskCast(links: BulkLinks, husk: BoxHusk): HuskCast {
  const link = new Int32Array(links.cells * 12)
  const sign = new Int8Array(links.cells * 12)

  for (let x = 0; x < links.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const r = ROOTS[LINE_FIRSTS[l]!]!
      const k = x * 12 + l
      const plus = TRIT_HUSK_VECTORS.findIndex(u =>
        u.every((v, j) => v === r[j]),
      )
      const minus = TRIT_HUSK_VECTORS.findIndex(u =>
        u.every((v, j) => v === -r[j]!),
      )

      if (plus >= 0) {
        link[k] = husk.column[x]! * 9 + plus
        sign[k] = 1
      } else {
        link[k] = husk.column[links.head[k]!]! * 9 + minus
        sign[k] = -1
      }
    }
  }

  return { columns: husk.columns, link, sign }
}

// the husk flux: per husk link, the column sum of the bulk lines over it, added into `out`
export function addHuskFlux(
  cast: HuskCast,
  line: Int32Array,
  out: Float64Array,
  weight = 1,
): void {
  for (let k = 0; k < line.length; k++) {
    const v = line[k]!

    if (v !== 0) {
      out[cast.link[k]!]! += weight * cast.sign[k]! * v
    }
  }
}

// THE DIVERGENCE-FIXED PART of a husk flux with divergence rho (per column, outflow), and the depth it gives: the
// static field of E-GRV-0090's rule for that content, F = g grad x with div F = rho (the torus's uniform mean removed,
// since no flux on a closed husk has a net divergence), by code/measure/trit-hop-light coulombFlux, and the depth x found
// by summing F / g along paths (code/rule/step-depth stepDepth, which returns 2x). A measurement: floats, never read by
// the rule
export function staticDepth(
  side: number,
  rho: Float64Array,
): { flux: Float64Array; depth: Float64Array } {
  const mean = rho.reduce((s, v) => s + v, 0) / rho.length
  const flux = coulombFlux(
    huskGeometry(side),
    Float64Array.from(rho, v => v - mean),
  )
  const found = stepDepth(radionMesh([side, side, side]), flux)

  return { flux, depth: Float64Array.from(found.twice, v => v / 2) }
}

// the mean of a per-column field over each shell of husk distance from one column (code/measure/plaquette-readings
// huskDistances), shells 0 .. the largest
export function shellMeans(
  side: number,
  from: number,
  field: Float64Array,
): number[] {
  const dist = huskDistances(side, from)
  const top = Math.max(...dist)
  const sum = new Float64Array(top + 1)
  const n = new Float64Array(top + 1)

  for (let c = 0; c < field.length; c++) {
    sum[dist[c]!]! += field[c]!
    n[dist[c]!]! += 1
  }

  return [...sum].map((s, r) => (n[r]! > 0 ? s / n[r]! : Number.NaN))
}

// the column sums of a per-dock field, added into `out`
export function addColumns(
  husk: BoxHusk,
  field: Int32Array,
  out: Float64Array,
  weight = 1,
): void {
  for (let x = 0; x < field.length; x++) {
    if (field[x] !== 0) {
      out[husk.column[x]!]! += weight * field[x]!
    }
  }
}
