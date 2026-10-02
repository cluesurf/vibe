// A knot in the coset-union vacuum at any dock, read frame by frame (E-QTM-0176). MEASUREMENT code: the rule is the
// bounce knit (code/rule/bounce-pair-knit) on the default dock-varying vacuum (code/measure/dense-hub, E-RLT-0093), run
// unedited; the quantum layer is the adopted comoving fear beat on the tokens held open, as in
// code/measure/vacuum-records (whose schedule puts the knot on the anchor dock only).
//
// THE FRAMES. A dock's 12 lines fall into three frames of four mutually orthogonal lines (code/measure/staggered-
// vacuum lineFrames). The coset-union vacuum stores, on a dock of root class rho, exactly the four lines of rho's
// frame, and nothing on a hub dock (class L'). So the vacuum names one frame at each root dock and none at a hub:
// it breaks W(F4) dock by dock while the rule keeps it.
//
// NOTHING MOVES: the stream copies each slot's vibe and token one dock along; a crossing is the link's grid move.

import { makeColorWeave } from '@/code/rule/color-weave'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import {
  bounceBeat,
  makeBounceKnit,
} from '@/code/rule/bounce-pair-knit'
import {
  GRID_OF_PHASE,
  phasePermOf,
  type BeatRecord,
} from '@/code/rule/fear-weave'
import { LINE_OF } from '@/code/rule/isometric-knit'
import { sparseLivingState } from '@/code/measure/sparse-living-vacuum'
import { baseHub, storeOfKind } from '@/code/measure/dense-hub'
import { boxHusk } from '@/code/measure/causal-components'
import { lineFrames } from '@/code/measure/staggered-vacuum'
import { type VacuumSchedule } from '@/code/measure/vacuum-records'

const IDENTITY9 = Array.from({ length: 9 }, (_, p) => p)

export const LINE_FRAME: Int8Array = lineFrames()

// the frame of a slot (0, 1, 2)
export const slotFrame = (slot: number): number =>
  LINE_FRAME[LINE_OF[slot % 24]!]!

// the coset-union store on the side's box (the anchor dock 0 stores line 0)
export const unionStore = (side: number): Int8Array =>
  storeOfKind('union', side, baseHub(side, 0))

// the frames a dock stores units on (empty at a hub)
export function storedFrames(store: Int8Array, dock: number): number[] {
  const out = new Set<number>()

  for (let l = 0; l < 12; l++) {
    if (store[dock * 12 + l] !== 0) {
      out.add(LINE_FRAME[l]!)
    }
  }

  return [...out].sort()
}

// The schedule of a lone love on slot `direction` of dock `dock`, over `beats`, under the link start current now: the
// knot's partners (every vacuum token it meets in the window), the records of the run with those tokens open, the
// knot's meetings and accumulated grid move. code/measure/vacuum-records vacuumSchedule with the dock free.
export function vacuumScheduleAt(
  side: number,
  dock: number,
  direction: number,
  beats: number,
  store: Int8Array = unionStore(side),
): VacuumSchedule {
  const weave = makeColorWeave({ side, table: 'bind' })
  const layout = separatedLayout(weave)
  const knit = makeBounceKnit(weave, 'alternate', true, 'lone')
  const slots = weave.mesh.cellCount * 24
  const husk = boxHusk(weave.mesh, side)
  const vibe = new Int8Array(slots)
  const point = new Int8Array(slots)
  const knot = dock * 24 + direction

  vibe[knot] = 1

  const start = sparseLivingState({ vibe, point, store, layout })
  const partners: number[] = []
  const partnerColumn: number[] = []
  const partnerSign: number[] = []
  const all = new Uint8Array(start.point.length).fill(1)

  let state = start

  for (let t = 0; t < beats; t++) {
    const docks = new Int32Array(start.point.length).fill(-1)

    for (let s = 0; s < slots; s++) {
      if (state.vibe[s] !== 0) {
        docks[state.token[s]!] = Math.floor(s / 24)
      }
    }

    const r = bounceBeat(knit, state, all, t)

    r.record.meetings.forEach(([a, b], m) => {
      if (a !== knot && b !== knot) {
        return
      }

      const other = a === knot ? b : a

      if (partners.includes(other)) {
        return
      }

      partners.push(other)
      partnerColumn.push(husk.column[docks[knot]!]!)
      partnerSign.push(
        (r.record.signs?.[m] ?? [1, 1])[a === knot ? 1 : 0],
      )
    })
    state = r.state
  }

  const open = new Uint8Array(start.point.length)

  open[knot] = 1

  for (const p of partners) {
    open[p] = 1
  }

  const records: BeatRecord[] = []
  const knotMeetings: number[] = []
  const knotMove: number[][] = []

  let move = IDENTITY9

  state = start

  for (let t = 0; t < beats; t++) {
    const r = bounceBeat(knit, state, open, t)

    state = r.state
    records.push(r.record)
    knotMeetings.push(
      r.record.meetings.filter(([a, b]) => a === knot || b === knot)
        .length,
    )

    for (const [tk, g] of r.record.crossings) {
      if (tk !== knot) {
        continue
      }

      const perm = phasePermOf(weave.moves.act[g]!)

      move = move.map(p => perm[p]!)
    }

    knotMove.push(move)
  }

  return {
    weave,
    knot,
    partners,
    partnerColumn,
    partnerPoint: partners.map(p => GRID_OF_PHASE[start.point[p]!]!),
    partnerSign,
    records,
    knotMeetings,
    knotMove,
  }
}
