// m1 OF F35 ON A FINE FILL GRID (item vibe-roadmap-board-0041). Every gate was written into the item's `what` before
// this file existed (gate 8056266ef710, 2026-11-16T22:39:42Z), and every run goes through task/pre-register.
//
// THE QUESTION. Board-0035 (E-FRC-0317 gauge/demon-link-family) found a confining string with an unbroken Z3 centre at
// 3 of 20 period-8 cusp points, all in m2 to m4, and none for m1 (E-FRC-0110 itself): m1's registered fills jump from
// melted at f = 0.2 (chi22 1.94 +- 0.67, too noisy for S2) to frozen at f = 0.08, so its floor stability was never
// read and 0035's verdict stayed partial. This file reruns m1 alone on the 13 fills 0.08, 0.09, ..., 0.20 on the
// same three cusps, with 0035's engine, readings and gates unchanged, to locate the first-order jump and to read
// whether an m1 string, where there is one, survives moving the floor.
//
// ONE READING ADDED: the layer plaquette over the first and the second half of the measured sweeps; a point whose
// halves differ by more than 0.02 is unsettled (S0) and counts neither way.
//
// READ-ACROSS, fixed before the run: F35 cannot fail by 0035's rule any more (m2 to m4 already pass at 3 points).
// With this item PASS, F35 meets 0035's PASS rule; otherwise F35 stays partial. Orientation joining is not claimed.
//
// GRADE mirrored (the floor is felt; honeycomb decision 002). Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

import {
  coldState,
  colorGroup,
  cuspGraph,
  familyF35,
  i2Holds,
  instrumentGates,
  makeField,
  pointGates,
  runPoint,
  sweep,
  type RunReading,
} from '@/test/experiment/gauge/demon-link-family'

export const FINE_FILLS: readonly number[] = Array.from({ length: 13 }, (_, k) => (8 + k) / 100)

const FROZEN_PLAQUETTE = 0.9
const SETTLED = 0.02
const REVERSAL_SWEEPS = 20
const REVERSAL_FILL = 0.14
const FLOOR_TOLERANCE = 0.25

export type FinePart = {
  part: 'grid' | 'floor'
  group: { order: number; centre: number }
  instruments: Record<string, Record<string, number>>
  reversal: { moved: number; returns: number } | null
  runs: RunReading[]
}

const strip = ({ state: _, ...reading }: RunReading & { state: unknown }): RunReading => reading

// grid: I-B (period 8 floor 1). floor: I-A (period 4 floor 1) with I5, then I-C (period 4 floor 2).
export function finePart(part: 'grid' | 'floor', log: (line: string) => void): FinePart {
  const color = colorGroup()
  const m1 = familyF35(color)[0]!
  const shapes =
    part === 'grid'
      ? [{ name: 'I-B', period: 8, floor: 1 }]
      : [
          { name: 'I-A', period: 4, floor: 1 },
          { name: 'I-C', period: 4, floor: 2 },
        ]
  const instruments: FinePart['instruments'] = {}
  const runs: RunReading[] = []

  let reversal: FinePart['reversal'] = null

  for (const shape of shapes) {
    const graph = cuspGraph({ period: shape.period, floor: shape.floor })
    const field = makeField(graph)
    const gates = instrumentGates(graph, field)

    instruments[shape.name] = gates
    log(`${shape.name} ${JSON.stringify(gates)}`)

    if (shape.name === 'I-A') {
      const state = coldState(field, color.group, m1, REVERSAL_FILL)
      const v0 = Int32Array.from(state.values)
      const d0 = Int32Array.from(state.demons)

      for (let s = 0; s < REVERSAL_SWEEPS; s++) {
        sweep({ field, group: color.group, member: m1, state })
      }

      const moved = state.values.some((v, k) => v !== v0[k]) ? 1 : 0

      for (let s = 0; s < REVERSAL_SWEEPS; s++) {
        sweep({ field, group: color.group, member: m1, state, reverse: true })
      }

      const returns =
        state.values.every((v, k) => v === v0[k]) && state.demons.every((v, k) => v === d0[k]) ? 1 : 0

      reversal = { moved, returns }
      log(`I5 ${JSON.stringify(reversal)}`)
    }

    for (const fill of FINE_FILLS) {
      const reading = strip(runPoint({ field, color, member: m1, fill, log }))

      runs.push({ ...reading, instrument: shape.name })
    }
  }

  return { part, group: { order: color.group.order, centre: color.centre.length }, instruments, reversal, runs }
}

export function settled(r: RunReading): boolean {
  return Math.abs(r.layerHalves[0] - r.layerHalves[1]) <= SETTLED
}

export function fineGates(r: RunReading): { s0: boolean; s2: boolean; s3: boolean; s4: boolean; string: boolean } {
  const g = pointGates(r)
  const s0 = settled(r)

  return { s0, s2: g.s2, s3: g.s3, s4: g.s4, string: s0 && g.string }
}

export type Bracket = {
  low: number | null
  high: number | null
  energyLow: number | null
  energyHigh: number | null
  jump: number | null
  coexistence: number[]
}

export function transitionBracket(runs: readonly RunReading[]): Bracket {
  const sorted = [...runs].sort((a, b) => a.fill - b.fill)
  const meltedRuns = sorted.filter(r => r.layerPlaquette < FROZEN_PLAQUETTE)
  const high = meltedRuns[0] ?? null
  const lowRun = high === null ? null : ([...sorted].reverse().find(r => r.fill < high.fill && r.layerPlaquette >= FROZEN_PLAQUETTE) ?? null)
  const coexistence =
    high === null ? [] : sorted.filter(r => r.fill > high.fill && r.layerPlaquette >= FROZEN_PLAQUETTE).map(r => r.fill)

  return {
    low: lowRun?.fill ?? null,
    high: high?.fill ?? null,
    energyLow: lowRun?.energyPerLink ?? null,
    energyHigh: high?.energyPerLink ?? null,
    jump: lowRun !== null && high !== null ? lowRun.layerPlaquette - high.layerPlaquette : null,
    coexistence,
  }
}

const fmt = (x: number | null, d = 3): string => (x === null || !Number.isFinite(x) ? 'none' : x.toFixed(d))

export function m1FineVerdict(input: { grid: FinePart; floor: FinePart }): Verdict {
  const { grid, floor } = input
  const ib = grid.runs
  const ia = floor.runs.filter(r => r.instrument === 'I-A')
  const ic = floor.runs.filter(r => r.instrument === 'I-C')
  const instruments = [grid.instruments['I-B']!, floor.instruments['I-A']!, floor.instruments['I-C']!]
  const i1 = grid.group.order === 648 && grid.group.centre === 3 && floor.group.order === 648 && floor.group.centre === 3
  const i2 = instruments.every(i2Holds)
  const i3 = instruments.every(g => g.classConflicts === 0)
  const i4 = instruments.every(g => g.bipartiteConflicts === 0)
  const i5 = floor.reversal?.moved === 1 && floor.reversal.returns === 1
  const all = [...ib, ...ia, ...ic]
  const i6 = all.every(r => r.energyDrift === 0)
  const loopsClean = all.every(r => r.loopFailures === 0)
  const ibGates = ib.map(r => ({ r, g: fineGates(r) }))
  const c1 = ibGates.filter(({ r }) => r.layerPlaquette >= FROZEN_PLAQUETTE).every(({ g }) => !g.s2 || !g.s3)
  const instrumentsHold = i1 && i2 && i3 && i4 && i5 && i6 && loopsClean && c1
  const passing = ibGates.filter(({ g }) => g.string).map(({ r }) => r)
  // a would-be pass: S2 to S4 hold but S0 does not
  const unsettledPasses = ibGates.filter(({ g }) => !g.s0 && g.s2 && g.s3 && g.s4).map(({ r }) => r)
  const floorRows = passing.map(r => {
    const a = ia.find(x => x.fill === r.fill)
    const c = ic.find(x => x.fill === r.fill)
    const ga = a ? fineGates(a) : null
    const gc = c ? fineGates(c) : null
    const shift = a && c ? Math.abs(c.chi22.value - a.chi22.value) / Math.abs(a.chi22.value) : Number.NaN
    const stable = Boolean(ga?.string && gc?.string && shift <= FLOOR_TOLERANCE)

    return { fill: r.fill, a, c, ga, gc, shift, stable }
  })
  const floorStable = floorRows.filter(x => x.stable)
  const settledFails = ibGates.filter(({ g }) => g.s0 && !g.string)
  const status: Verdict['status'] = !instrumentsHold
    ? 'partial'
    : floorStable.length > 0
      ? 'pass'
      : passing.length === 0 && unsettledPasses.length === 0
        ? 'fail'
        : 'partial'
  const brackets = { 'I-B': transitionBracket(ib), 'I-A': transitionBracket(ia), 'I-C': transitionBracket(ic) }
  const lowestPassing = passing.length > 0 ? Math.min(...passing.map(r => r.energyPerLink)) : Number.NaN
  const b = brackets['I-B']
  const metrics: Record<string, number> = {
    i1: i1 ? 1 : 0,
    i2: i2 ? 1 : 0,
    i3: i3 ? 1 : 0,
    i4: i4 ? 1 : 0,
    i5: i5 ? 1 : 0,
    i6: i6 ? 1 : 0,
    loopsClean: loopsClean ? 1 : 0,
    c1: c1 ? 1 : 0,
    passingPoints: passing.length,
    unsettledPasses: unsettledPasses.length,
    settledFails: settledFails.length,
    floorStablePoints: floorStable.length,
    lowestPassingEnergyPerLink: lowestPassing,
    bracketLow: b.low ?? Number.NaN,
    bracketHigh: b.high ?? Number.NaN,
    bracketJump: b.jump ?? Number.NaN,
  }

  for (const r of all) {
    const g = fineGates(r)
    const key = `${r.instrument}_f${r.fill}`

    metrics[`${key}_energyPerLink`] = r.energyPerLink
    metrics[`${key}_layerPlaquette`] = r.layerPlaquette
    metrics[`${key}_halfShift`] = r.layerHalves[1] - r.layerHalves[0]
    metrics[`${key}_chi22`] = r.chi22.value
    metrics[`${key}_chi22Error`] = r.chi22.error
    metrics[`${key}_polyakovAbs`] = r.polyakovAbs
    metrics[`${key}_string`] = g.string ? 1 : 0
  }

  const bracketText = (name: string, x: Bracket): string =>
    `${name} frozen at f ${fmt(x.low, 2)} (E/link ${fmt(x.energyLow)}) and melted at f ${fmt(x.high, 2)} (E/link ${fmt(x.energyHigh)}), layer plaquette jump ${fmt(x.jump)}${x.coexistence.length > 0 ? `, coexistence: frozen again at ${x.coexistence.join(', ')}` : ''}`

  return verdict({
    status,
    claim: `V0 (the empty mesh) is frozen under m1 (board-0035, not rerun). Transition of m1 (cold start): ${bracketText('I-B', b)}; ${bracketText('I-A', brackets['I-A'])}; ${bracketText('I-C', brackets['I-C'])}. ${
      passing.length > 0
        ? `A confining string with an unbroken Z3 centre (S0, S2 to S4) holds for m1 on the period-8 cusp at ${passing.length} of ${ib.length} fills (${passing.map(r => `f ${r.fill} chi22 ${r.chi22.value.toFixed(3)} +- ${r.chi22.error.toFixed(3)}`).join(', ')}), only at energy per link >= ${lowestPassing.toFixed(3)}`
        : 'No settled m1 fill on the period-8 cusp gives a confining string with a Z3 centre'
    }; ${floorStable.length} floor-stable (${floorRows.map(x => `f ${x.fill}: I-A chi22 ${fmt(x.a?.chi22.value ?? null)} string ${x.ga?.string ? 1 : 0}, I-C chi22 ${fmt(x.c?.chi22.value ?? null)} string ${x.gc?.string ? 1 : 0}, shift ${fmt(x.shift)}`).join('; ')}); ${unsettledPasses.length} unsettled would-be passes; instruments ${instrumentsHold ? 'hold' : 'FAIL'}. Orientation joining not tested and not claimed`,
    metrics,
    control: { c1: c1 ? 1 : 0 },
    notes: `L2, mirrored grade. Gates: board-0041 what, gate 8056266ef710. Instruments: ${JSON.stringify({ 'I-B': grid.instruments['I-B'], 'I-A': floor.instruments['I-A'], 'I-C': floor.instruments['I-C'] })}. Reversal: ${JSON.stringify(floor.reversal)}.`,
  })
}

export default experiment({
  id: 'gauge/demon-link-m1-fine',
  code: 'E-FRC-0318',
  title:
    'm1 of F35 (E-FRC-0110 itself, A6, demon capacity 24) on a fine fill grid 0.08 to 0.20 on the {3,4,3,4} cusp neighborhood, partial (gates fixed before the run): a cold start jumps from frozen to melted between f 0.10 and 0.11 on the period-8 cusp (2.40 to 2.64 units of energy per link, layer plaquette 0.995 to 0.690), 0.11 to 0.12 at period 4 floor 1 and 0.09 to 0.10 at floor 2, so the floor moves the jump; on the period-8 cusp m1 gives a confining string with an unbroken Z3 centre at 7 of 13 fills, f 0.12 to 0.18 (chi22 0.957 +- 0.007 up to 1.575 +- 0.135, |P| <= 0.002, every point settled), from 2.88 units of energy per link up, but none floor-stable: at f 0.12 both floors confine yet chi22 moves 0.868 to 1.116 (29 percent, past the 25 percent gate), and at f 0.13 to 0.15 floor 2 misses the 5-error line; every instrument gate and C1 hold; orientation joining not claimed',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const log = (line: string): void => console.error(line)

    return m1FineVerdict({ grid: finePart('grid', log), floor: finePart('floor', log) })
  },
})
