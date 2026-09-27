// A gas bath in the cold vacuum: the E-QTM-0114 environment, as a reusable piece.
//
// The love-fear pair of E-RLT-0055 on the cold quaternion knit (the first line of dock 0 whose love and fear
// meet within 24 beats), laid on the cold vacuum with a gas of lone vibes at density f from the golden Weyl
// fill: slot i holds a vibe when frac((i + 1) phi) < f, a love or a fear by frac((i + 1) (sqrt 2 - 1)) < 1/2
// (the silver ratio), its role point floor(9 frac((i + 3) phi)). The pair's two slots are a love and a fear
// on role point 0. Every token is open in the record, so the record lists every meeting and every crossing:
// an experiment keeps the tokens it wants in a whole and follows the rest as classical points.
//
// This is the fill and record of test/experiment/quantum/decoherence-in-the-cold-vacuum (E-QTM-0114),
// which keeps its own inline copy; the numbers agree by construction (same fill, same knit, same side).
// No random numbers: golden and silver Weyl sequences only.

import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { type BeatRecord } from '@/code/rule/fear-weave'
import { COLD_FIRSTS, COLD_OPPOSITE } from '@/code/rule/cold-quaternion-knit'
import { coldRecords, coldStart } from '@/code/measure/knot-histories'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const SIDE = 3
const frac = (x: number): number => x - Math.floor(x)

export type ColdGas = {
  readonly weave: ColorWeave
  // the love and fear slots (their tokens) of the pair
  readonly pair: readonly [number, number]
  // every token's start role point
  readonly point: Int8Array
  // every token's start vibe
  readonly vibe: Int8Array
  readonly records: readonly BeatRecord[]
}

let PAIR: [number, number] | undefined

// the E-RLT-0055 love-fear pair: the first line of dock 0 whose love and fear meet within 24 beats
export function coldPair(): [number, number] {
  if (PAIR) {
    return PAIR
  }

  const weave = makeColorWeave({ side: SIDE, table: 'bind' })
  const slots = weave.mesh.cellCount * 24

  for (let l = 0; l < 12; l++) {
    const d = COLD_FIRSTS[l] ?? 0
    const o = COLD_OPPOSITE[d] ?? 0
    const vibe = new Int8Array(slots)

    vibe[d] = 1
    vibe[o] = -1

    if (coldRecords({ start: coldStart(vibe, new Int8Array(slots)), tokens: [d, o], beats: 24 }).records.some(r => r.meetings.length > 0)) {
      PAIR = [d, o]

      return PAIR
    }
  }

  PAIR = [0, 1]

  return PAIR
}

// the gas at density f and its record over `beats` beats, every token open
export function coldGas(input: { f: number; beats: number }): ColdGas {
  const { f, beats } = input
  const weave = makeColorWeave({ side: SIDE, table: 'bind' })
  const slots = weave.mesh.cellCount * 24
  const [pa, pb] = coldPair()
  const vibe = new Int8Array(slots)
  const point = new Int8Array(slots)

  for (let i = 0; i < slots; i++) {
    vibe[i] = frac((i + 1) * GOLDEN) < f ? (frac((i + 1) * SILVER) < 0.5 ? 1 : -1) : 0
    point[i] = Math.floor(9 * frac((i + 3) * GOLDEN))
  }

  vibe[pa] = 1
  vibe[pb] = -1
  point[pa] = 0
  point[pb] = 0

  const all = Array.from({ length: slots }, (_, i) => i)
  const { records } = coldRecords({ start: coldStart(vibe, point), tokens: all, beats })

  return { weave, pair: [pa, pb], point, vibe, records }
}
