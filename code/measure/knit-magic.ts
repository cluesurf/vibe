// Magic along the knit's own histories: the two-role wholes the fear weave (code/rule/fear-weave) reaches on
// the committed lattice, beat by beat, for every pair of one dock's tokens that meets, from several starts.
//
// The classical layer never depends on the whole, so one classical run with all 24 tokens of dock 0 open
// records every meeting and crossing, and the record of one pair is that run's record filtered to the pair
// (the survey of E-QTM-0099). A whole is then carried through the pair's record by advanceWhole.
//
// Starts are products of one-role states written in whole numbers: a role basis state |j> (1 unit on each of
// the three points (j, s)) and the Strange state (|1> - |2>) / sqrt 2, the one-qutrit state of largest
// Wigner negativity (-1/3 at one point, 1/6 at the other eight, so 6 units: 8 loves and 2 fears). Its weights
// are computed from code/measure/qutrit-phase-space, not typed in.
//
// Backgrounds are deterministic: the vacuum (all calm, every role at point 0) and a golden-ratio Weyl fill of
// fears, calms and loves at a stated scale, as E-QTM-0099 builds its matter.

import { type ColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  fearBeat,
  makeLattice,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import { wignerFunction } from '@/code/measure/qutrit-phase-space'
import { GOLDEN, weyl } from '@/code/tool/weyl'

export type Background = { readonly vibe: Int8Array; readonly point: Int8Array }

const FEAR_BELOW = 0.3
const CALM_BELOW = 0.6

export function vacuumBackground(slots: number): Background {
  return { vibe: new Int8Array(slots), point: new Int8Array(slots) }
}

// fears, calms and loves from frac((i + 1) GOLDEN scale), role points from frac((i + 3) GOLDEN scale)
export function weylBackground(input: { slots: number; scale: number }): Background {
  const { slots, scale } = input
  const vibe = new Int8Array(slots)
  const point = new Int8Array(slots)

  for (let i = 0; i < slots; i++) {
    const u = weyl(i + 1, GOLDEN * scale)

    vibe[i] = u < FEAR_BELOW ? -1 : u < CALM_BELOW ? 0 : 1
    point[i] = Math.floor(9 * weyl(i + 3, GOLDEN * scale))
  }

  return { vibe, point }
}

// the classical records of `beats` beats with the listed tokens open
export function classicalRecords(input: {
  weave: ColorWeave
  links: Int16Array
  background: Background
  open: readonly number[]
  beats: number
}): BeatRecord[] {
  const { weave, links, background, beats } = input
  const open = new Uint8Array(weave.mesh.cellCount * 24)

  for (const t of input.open) {
    open[t] = 1
  }

  let lattice = makeLattice(background)
  const out: BeatRecord[] = []

  for (let t = 0; t < beats; t++) {
    const r = fearBeat({ weave, links, lattice, open, t })

    lattice = r.lattice
    out.push(r.record)
  }

  return out
}

// one pair's records: its meetings (with their signs) and its crossings
export function pairRecords(records: readonly BeatRecord[], a: number, b: number): BeatRecord[] {
  return records.map(r => {
    const keep = r.meetings.map(([x, y]) => (x === a && y === b) || (x === b && y === a))

    return {
      meetings: r.meetings.filter((_, k) => keep[k]),
      signs: (r.signs ?? []).filter((_, k) => keep[k]),
      crossings: r.crossings.filter(([tk]) => tk === a || tk === b),
    }
  })
}

// every pair that meets in the records, with its number of meetings, in a fixed order
export function meetingPairs(records: readonly BeatRecord[]): { a: number; b: number; meetings: number }[] {
  const count = new Map<string, number>()

  for (const r of records) {
    for (const [x, y] of r.meetings) {
      const key = `${Math.min(x, y)},${Math.max(x, y)}`

      count.set(key, (count.get(key) ?? 0) + 1)
    }
  }

  return [...count.entries()]
    .map(([key, meetings]) => {
      const [a, b] = key.split(',').map(Number)

      return { a: a ?? 0, b: b ?? 0, meetings }
    })
    .sort((x, y) => x.a - y.a || x.b - y.b)
}

// one role's states in whole units on the 9 phase points (index 3 a + b)
export type RoleState = 'basis0' | 'basis1' | 'strange'

export function roleWeights(state: RoleState): bigint[] {
  if (state === 'strange') {
    const s = Math.SQRT1_2
    const w = wignerFunction({ re: [0, s, -s], im: [0, 0, 0] })

    return w.map(x => BigInt(Math.round(6 * x)))
  }

  const j = state === 'basis0' ? 0 : 1

  return Array.from({ length: 9 }, (_, q) => (Math.floor(q / 3) === j ? 1n : 0n))
}

// the product whole of two role states, the first token most significant
export function productWhole(tokens: readonly [number, number], states: readonly [RoleState, RoleState]): Whole {
  const first = roleWeights(states[0])
  const second = roleWeights(states[1])
  const weight: bigint[] = []

  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      weight.push((first[x] ?? 0n) * (second[y] ?? 0n))
    }
  }

  return { tokens, weight }
}

export type WholeStep = {
  readonly whole: Whole
  readonly meetings: number
  // crossings of a link whose move is not the identity
  readonly moves: number
}

// the whole after every beat of the records, the swap-phase kernel or the color law
export function runWhole(input: {
  weave: ColorWeave
  start: Whole
  records: readonly BeatRecord[]
  kernel4: readonly (readonly number[])[]
  color?: FearKernels
}): WholeStep[] {
  const { weave, start, records, kernel4, color } = input
  let whole: Whole = start
  const out: WholeStep[] = []

  for (const record of records) {
    const next = advanceWhole({ weave, whole, record, kernel4, color, fixed: false, forward: true })

    if (!next) {
      throw new Error('a grain-mode whole was refused, which advanceWhole never does')
    }

    whole = next
    out.push({
      whole,
      meetings: record.meetings.length,
      moves: record.crossings.filter(([, g]) => g !== weave.moves.identity).length,
    })
  }

  return out
}
