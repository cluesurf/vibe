// The knot histories of the existing Bell experiments, rebuilt so later experiments can gate them: the
// classical record (meetings and crossings, beat by beat) each experiment's two-token knot rides, with the
// kernels it uses. Nothing here decides a gate. Each builder follows its experiment's own code:
//
//   qtm0100-swap   E-QTM-0100: the committed pair table's color weave on a side-3 D4 box, the vacuum pair
//                  (tokens 4 and 7) on live links, the swap phase at every meeting (meetingKernel), start
//                  |0>|1>: the sqrt 7 reading
//   qtm0100-color  the same record in E-QTM-0100's color section: start |0>|0bar>, the color mode's kernels
//                  with the like tokens exchanged
//   qtm0109        E-QTM-0109: the hop-free color turn knit (colorLocalKnit of COLOR_TURN_SPEC on the bind
//                  weave), the first line of dock 0 whose two calm tokens meet in 24 beats, color mode with
//                  like tokens kept in place, start |0>|0bar>: the 2.55 reading
//   frc0159-H      E-FRC-0159: the combined knit, configuration H (head-on turn base, scatter block at
//                  mirror phase 23, unfolded), vacuum pair found the same way, color mode, start |0>|0bar>
//   frc0159-HF     the same, folded (configuration HF: 2.37 in E-FRC-0159)
//   rlt0055        E-RLT-0055: the cold quaternion knit, the love-fear pair (the first line of dock 0 whose
//                  love and fear meet in 24 beats), color mode, start |0>|0bar>. Its beat with tokens is
//                  code/measure/fear-port's step, rebuilt here from the exported knit (fear-port keeps it
//                  private)

import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { COLOR_TURN_SPEC } from '@/code/rule/color-turn-weave'
import { HEAD_TURN_SPEC } from '@/code/rule/scatter-weave'
import {
  advanceWhole,
  CONJUGATE_POINT,
  type Whole,
  colorLocalKnit,
  fearBeat,
  fearKernels,
  makeLattice,
  meetingKernel,
  swapPhase,
  type BeatRecord,
  type FearKernels,
  type Knit,
} from '@/code/rule/fear-weave'
import { combinedBeat, combinedState, makeCombinedKnit } from '@/code/rule/combined-knit'
import {
  COLD_FIRSTS,
  COLD_OPPOSITE,
  coldQuaternionBeat,
  emptyColdState,
  makeColdQuaternionKnit,
  makeColdQuaternionLattice,
  type ColdMeeting,
  type ColdQuaternionState,
} from '@/code/rule/cold-quaternion-knit'

const OMEGA = (2 * Math.PI) / 3
const SIDE = 3

// how a history's knot moves at a meeting: E-QTM-0100's swap kernel on the tokens, or the color mode
export type KnotKernels = { readonly mode: 'swap'; readonly kernel4: number[][] } | { readonly mode: 'color'; readonly color: FearKernels }

export type KnotHistory = {
  readonly name: string
  readonly code: string
  // the weave whose grid moves the records name (advanceWhole reads weave.moves)
  readonly weave: ColorWeave
  readonly tokens: readonly number[]
  readonly records: readonly BeatRecord[]
  readonly kernels: KnotKernels
  // the role digits of the experiment's own start
  readonly start: readonly number[]
  // whether the second token is a fear stored at the reflected point (color mode): read through `native`
  readonly conjugated: boolean
}

const openOf = (slots: number, tokens: readonly number[]): Uint8Array => {
  const open = new Uint8Array(slots)

  for (const t of tokens) {
    open[t] = 1
  }

  return open
}

function fearWeaveRecords(input: { weave: ColorWeave; knit?: Knit; tokens: readonly number[]; beats: number; vibe?: Int8Array }): BeatRecord[] {
  const { weave, knit, tokens, beats } = input
  const slots = weave.mesh.cellCount * 24
  let lattice = makeLattice({ vibe: input.vibe ?? new Int8Array(slots), point: new Int8Array(slots) })
  const open = openOf(slots, tokens)
  const out: BeatRecord[] = []

  for (let t = 0; t < beats; t++) {
    const r = fearBeat({ weave, links: weave.links, lattice, open, t, knit })

    lattice = r.lattice
    out.push(r.record)
  }

  return out
}

// the first line of dock 0 whose two tokens meet within 24 beats, with the given records builder
function firstMeetingLine(opposite: readonly number[], meets: (pair: number[]) => boolean): number[] {
  for (let d = 0; d < 24; d++) {
    const o = opposite[d] ?? d

    if (o > d && meets([d, o])) {
      return [d, o]
    }
  }

  return []
}

export function qtm0100Histories(beats: number): KnotHistory[] {
  const weave = makeColorWeave({ side: SIDE, table: 'pair' })
  const tokens = [4, 7]
  const records = fearWeaveRecords({ weave, tokens, beats })

  return [
    { name: 'qtm0100-swap', code: 'E-QTM-0100', weave, tokens, records, kernels: { mode: 'swap', kernel4: meetingKernel(swapPhase(OMEGA)) ?? [] }, start: [0, 1], conjugated: false },
    { name: 'qtm0100-color', code: 'E-QTM-0100', weave, tokens, records, kernels: { mode: 'color', color: fearKernels({ like: OMEGA, unlike: OMEGA })! }, start: [0, 0], conjugated: true },
  ]
}

export function qtm0109History(beats: number): KnotHistory {
  const weave = makeColorWeave({ side: SIDE, table: 'bind' })
  const knit = colorLocalKnit({
    opposite: weave.opposite,
    couplesZero: COLOR_TURN_SPEC.couplesZero,
    turn: COLOR_TURN_SPEC.turn,
    positionAt: COLOR_TURN_SPEC.positionAt,
    swapAt: COLOR_TURN_SPEC.swapAt,
    table: COLOR_TURN_SPEC.tables[0] ?? [],
    swapWhen: COLOR_TURN_SPEC.swapWhen,
  })
  const tokens = firstMeetingLine(weave.opposite, pair => fearWeaveRecords({ weave, knit, tokens: pair, beats: 24 }).some(r => r.meetings.length > 0))

  return {
    name: 'qtm0109',
    code: 'E-QTM-0109',
    weave,
    tokens,
    records: fearWeaveRecords({ weave, knit, tokens, beats }),
    kernels: { mode: 'color', color: fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })! },
    start: [0, 0],
    conjugated: true,
  }
}

export function frc0159History(input: { fold: boolean; beats: number }): KnotHistory {
  const knit = makeCombinedKnit({ side: SIDE, spec: { base: HEAD_TURN_SPEC, fold: input.fold, scatter: true, mirror: 23, steer: false } })
  const slots = knit.weave.mesh.cellCount * 24
  const vacuum = { vibe: new Int8Array(slots), point: new Int8Array(slots) }
  const recordsOf = (tokens: readonly number[], beats: number): BeatRecord[] => {
    let state = combinedState(knit, vacuum)
    const open = openOf(slots, tokens)
    const out: BeatRecord[] = []

    for (let t = 0; t < beats; t++) {
      const r = combinedBeat(knit, state, open, t)

      state = r.state
      out.push(r.record)
    }

    return out
  }
  const tokens = firstMeetingLine(knit.weave.opposite, pair => recordsOf(pair, 24).some(r => r.meetings.length > 0))

  return {
    name: input.fold ? 'frc0159-HF' : 'frc0159-H',
    code: 'E-FRC-0159',
    weave: knit.weave,
    tokens,
    records: recordsOf(tokens, input.beats),
    kernels: { mode: 'color', color: fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })! },
    start: [0, 0],
    conjugated: true,
  }
}

// one beat of the cold quaternion knit with the record a knot reads (code/measure/fear-port's step)
export function coldRecords(input: { start: ColdQuaternionState; tokens: readonly number[]; beats: number; links?: Int16Array }): { records: BeatRecord[]; states: ColdQuaternionState[] } {
  const weave = makeColorWeave({ side: SIDE, table: 'bind' })
  const knit = makeColdQuaternionKnit()
  const lattice = makeColdQuaternionLattice(weave.mesh, knit)
  const links = input.links ?? weave.links
  const slots = weave.mesh.cellCount * 24
  const open = openOf(slots, input.tokens)
  let state = input.start
  const records: BeatRecord[] = []
  const states: ColdQuaternionState[] = [state]

  for (let t = 0; t < input.beats; t++) {
    const raw = { meetings: [] as ColdMeeting[], crossings: [] as [number, number][] }

    state = coldQuaternionBeat(lattice, state, raw)

    const meetings: [number, number][] = []
    const signs: [number, number][] = []

    for (const m of raw.meetings) {
      if (m.kind !== 'many' && open[m.tokens[0]] === 1 && open[m.tokens[1]] === 1) {
        meetings.push([m.tokens[0], m.tokens[1]])
        signs.push([m.signs[0], m.signs[1]])
      }
    }

    const crossings: [number, number][] = []

    for (const [tk, slot] of raw.crossings) {
      if (open[tk] === 1) {
        crossings.push([tk, links[slot] ?? weave.moves.identity])
      }
    }

    records.push({ meetings, crossings, signs })
    states.push(state)
  }

  return { records, states }
}

// the cold quaternion knit's labelled state from vibes and role points
export function coldStart(vibe: Int8Array, point: Int8Array): ColdQuaternionState {
  const weave = makeColorWeave({ side: SIDE, table: 'bind' })

  return { ...emptyColdState(weave.mesh, true), vibe: Int8Array.from(vibe), role: Int8Array.from(point) }
}

export function rlt0055History(beats: number): KnotHistory {
  const weave = makeColorWeave({ side: SIDE, table: 'bind' })
  const slots = weave.mesh.cellCount * 24
  let tokens: number[] = []
  let start = coldStart(new Int8Array(slots), new Int8Array(slots))

  for (let l = 0; l < 12 && tokens.length === 0; l++) {
    const d = COLD_FIRSTS[l] ?? 0
    const o = COLD_OPPOSITE[d] ?? 0
    const vibe = new Int8Array(slots)

    vibe[d] = 1
    vibe[o] = -1

    const candidate = coldStart(vibe, new Int8Array(slots))

    if (coldRecords({ start: candidate, tokens: [d, o], beats: 24 }).records.some(r => r.meetings.length > 0)) {
      tokens = [d, o]
      start = candidate
    }
  }

  return {
    name: 'rlt0055',
    code: 'E-RLT-0055',
    weave,
    tokens,
    records: coldRecords({ start, tokens, beats }).records,
    kernels: { mode: 'color', color: fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })! },
    start: [0, 0],
    conjugated: true,
  }
}

// every Bell history, each over `beats` beats
export function bellHistories(beats: number): KnotHistory[] {
  return [...qtm0100Histories(beats), qtm0109History(beats), frc0159History({ fold: false, beats }), frc0159History({ fold: true, beats }), rlt0055History(beats)]
}

// one beat of a history's knot, forward, in grain mode
export function advanceKnot(history: KnotHistory, whole: Whole, record: BeatRecord): Whole {
  const { kernels, weave } = history

  return kernels.mode === 'swap'
    ? advanceWhole({ weave, whole, record, kernel4: kernels.kernel4, fixed: false, forward: true })!
    : advanceWhole({ weave, whole, record, kernel4: [], color: kernels.color, fixed: false, forward: true })!
}

// a two-token knot read in the physical convention: the second token taken back from the reflected point
// when the history stores it there (the color mode's fear), unchanged otherwise
export function physicalKnot(history: KnotHistory, whole: Whole): Whole {
  return history.conjugated
    ? { tokens: whole.tokens, weight: whole.weight.map((_, i) => whole.weight[Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)] ?? 0n) }
    : whole
}

// the product knot of two role lines (weight 1 on each of the 9 joint points of line a x line b)
export function lineKnot(tokens: readonly number[], a: readonly number[], b: readonly number[]): Whole {
  const weight = new Array<bigint>(81).fill(0n)

  for (const x of a) {
    for (const y of b) {
      weight[x * 9 + y] = 1n
    }
  }

  return { tokens, weight }
}
