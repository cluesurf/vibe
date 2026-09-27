// The working vacuum's local reply to a placed lump (E-GRV-0081, E-GRV-0082): Sakharov's question on this model, is a
// depth set by content the vacuum's own response? The vacuum is E-SPN-0095's (the no-veto two-point store under the
// pass, the covariant coin, the frame mixer G as flags), run on one path of code/measure/occupation-veto-readings
// vetoPathRunner; a lump is placed at beat 0 and nothing else is changed. Per husk column and per beat three counts
// are read, each defined before any run:
//   occupied  the column's occupied slots: vibes in slots plus units in stores (a stored pair counts once)
//   events    made minus unmade pair events in the column that beat (a store unit leaving its store is made, a pair
//             entering an empty store is unmade; the stream never touches a store, so a store's change across the beat
//             is the pair move's)
//   open      the column's open vibes (in the working vacuum every stored pair is open, so this is every vibe out of
//             its store, the vacuum's and the lump's alike)
// MEASUREMENT: every count is an exact integer; the shell means are floats.
//
// NOTHING MOVES: each slot takes its neighbor's value one dock along; the counts compare values the stream took.

import { boxHusk } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { meshDistance } from '@/code/measure/shared-distance'
import { torus, type Torus } from '@/code/measure/shared-history'
import { contactFresh, vetoPathRunner } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { FRAME_SLOTS } from '@/code/rule/coined-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'

export const READINGS = ['occupied', 'events', 'open'] as const

export type ReadingName = (typeof READINGS)[number]

// per reading, [beat * columns + column]
export type ColumnSeries = Record<ReadingName, Int32Array> & { beats: number; columns: number }

export type ResponseBox = { side: number; tables: LockedTables; vacuum: Configuration; column: Int32Array; columns: number; center: number; centerDock: number; torus: Torus; rMax: number; shellSize: number[] }

// every column's mesh distance from column `from`
export const ringsFrom = (box: ResponseBox, from: number): Int32Array => Int32Array.from({ length: box.columns }, (_, a) => meshDistance(Array.from(box.torus.vector[box.torus.delta(from, a)] as Int32Array)))

// the working vacuum on a side, its husk columns, the center dock's column, and the shell sizes about any column
export function responseBox(side: number): ResponseBox {
  const f = contactFresh(side, 'pass')
  const husk = boxHusk(f.weave.mesh, side)
  const centerDock = centerOf(side)
  const center = husk.column[centerDock] as number
  const box: ResponseBox = { side, tables: f.tables, vacuum: wordVacuum(f, f.store), column: husk.column, columns: husk.columns, center, centerDock, torus: torus(side), rMax: 0, shellSize: [] }
  const rOf = ringsFrom(box, center)

  box.rMax = Math.max(...rOf)
  box.shellSize = Array.from({ length: box.rMax + 1 }, (_, r) => rOf.filter(x => x === r).length)

  return box
}

// the column `d` husk steps from column `from`
export const columnAt = (box: ResponseBox, from: number, d: readonly number[]): number => {
  const s = box.side
  const mod = (v: number): number => ((v % s) + s) % s

  return mod((from % s) + (d[0] as number)) + s * mod((((from / s) | 0) % s) + (d[1] as number)) + s * s * mod(((from / (s * s)) | 0) + (d[2] as number))
}

// the lump of content `size` in column `at`: open vibes of `tone` on the first slot of a frame, frames 0, 1, 2 of the
// column's first dock (the center dock for the center column, else the lowest index), then of its other docks in index
// order; every one alone in its frame, so G acts on it from beat 0. Size 0 places nothing.
export function lumpStart(box: ResponseBox, tone: number, size: number, at = box.center): { start: Configuration; slots: number[] } {
  const start = cloneConfiguration(box.vacuum)
  const inColumn = Array.from(box.column.keys()).filter(x => box.column[x] === at)
  const docks = at === box.center ? [box.centerDock, ...inColumn.filter(x => x !== box.centerDock)] : inColumn
  const slots: number[] = []

  for (const x of docks) {
    for (const ss of FRAME_SLOTS) {
      if (slots.length === size) return { start, slots }

      const s = x * 24 + (ss[0] as number)

      if (start.vibe[s] !== 0) throw new Error('vacuum-response: a lump slot is not empty at beat 0')
      start.vibe[s] = tone
      start.open[s] = 1
      slots.push(s)
    }
  }

  if (slots.length !== size) throw new Error(`vacuum-response: the column holds ${slots.length} lump slots, not ${size}`)

  return { start, slots }
}

// the husk columns the bulk lines of `slots` pass through: the stream along the slot's direction and its opposite
// (the coin hands a vibe between its line's two slots, and nothing else takes it off the line when G is off)
export function lineColumns(box: ResponseBox, slots: readonly number[]): Set<number> {
  const out = new Set<number>()

  for (const s0 of slots) {
    for (const s of [s0, Math.floor(s0 / 24) * 24 + (OPPOSITE[s0 % 24] as number)]) {
      let at = s

      do {
        out.add(box.column[(at / 24) | 0] as number)
        at = box.tables.target[at] as number
      } while (at !== s)
    }
  }

  return out
}

// the columns where two series differ in any reading at any beat of [from, to)
export function differingColumns(a: ColumnSeries, b: ColumnSeries, from: number, to: number): Set<number> {
  const out = new Set<number>()

  for (const name of READINGS) {
    for (let t = from; t < to; t++) {
      for (let col = 0; col < a.columns; col++) if (a[name][t * a.columns + col] !== b[name][t * a.columns + col]) out.add(col)
    }
  }

  return out
}

// run `beats` beats of one path from `start` and read the three counts per column after every beat
export function columnSeries(input: { box: ResponseBox; start: Configuration; threshold: number; coin: boolean; mix: boolean; beats: number }): ColumnSeries {
  const { box, start, threshold, coin, mix, beats } = input
  const { columns, column } = box
  const run = vetoPathRunner('none', box.tables, start, threshold, 0, coin, mix)
  const out: ColumnSeries = { beats, columns, occupied: new Int32Array(beats * columns), events: new Int32Array(beats * columns), open: new Int32Array(beats * columns) }
  const before = new Int8Array(start.store.length)

  for (let t = 0; t < beats; t++) {
    before.set(run.state().store)
    run.beat()

    const c = run.state()
    const row = t * columns

    for (let i = 0; i < c.vibe.length; i++) {
      if (c.vibe[i] === 0) continue

      const k = row + (column[(i / 24) | 0] as number)

      out.occupied[k]!++
      if (c.open[i]) out.open[k]!++
    }

    for (let i = 0; i < c.store.length; i++) {
      const k = row + (column[(i / 12) | 0] as number)
      const now = c.store[i] !== 0
      const was = before[i] !== 0

      if (now) out.occupied[k]!++
      if (was && !now) out.events[k]!++
      else if (!was && now) out.events[k]!--
    }
  }

  return out
}

// the shell mean per column of a reading's difference (a minus b), averaged over beats [from, to), shells by `rOf`
// (code ringsFrom): index r
export function shellProfile(box: ResponseBox, rOf: Int32Array, a: Int32Array, b: Int32Array | undefined, from: number, to: number): number[] {
  const sums = new Float64Array(box.rMax + 1)

  for (let t = from; t < to; t++) {
    const row = t * box.columns

    for (let col = 0; col < box.columns; col++) sums[rOf[col] as number]! += (a[row + col] as number) - (b ? (b[row + col] as number) : 0)
  }

  return Array.from(sums, (s, r) => s / ((box.shellSize[r] as number) * (to - from)))
}
