// THE LINE LAW ON THE HONEYCOMB (gates L1 and O1). On the exact {3,4,3,4} ball
// (code/substrate/coxeter/exact-ball-mesh), the empty mesh (the honeycomb's own vacuum, E-RLT-0121), flat links (the
// identity link on every slot, as code/measure/value-phase's trivial tables and B1's flat ring form), the working rule
// with the value phase (code/rule/value-phase valueBeat) and the coin at the place the caller sets:
//
// - the base line: the docks met from the base dock along slot LINE_FIRSTS[0] and its opposite, each step's stream
//   target the same slot of the neighbour, each step returned by the opposite slot, every dock met once
// - a start of open loves on that line's slots, run `beats` beats: every branch keeps every vibe on the line's slots
//   and every stored pair on the line's docks, charge and count (laws) exact every beat, the norm exact
// - the same run with ODD on (each dock's orientation, a 2-colouring of the bipartite ball) equals it with ODD off,
//   state for state (sameStateFast), and ODD fires on no branch
// - `beats` beats back return the start with amplitude 1 exactly (sameConfiguration, as the honeycomb trap says)
// - a positive control: ODD's exponent on the census's first qualifying 4-vibe pattern at the base dock is nonzero
//
// NOTHING MOVES: this file runs the working rule on a start and reads it.

import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  lockedNorm,
  lockedState,
  lockedTables,
  sameConfiguration,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import {
  laws,
  lockedFresh,
  vacuumConfiguration,
} from '@/code/measure/doublet-locked-readings'
import {
  newValueTally,
  valueBeat,
  valueBeatBack,
  valueCensus,
  valueExponent,
  type ValuePiece,
} from '@/code/rule/value-phase'
import {
  orientationOf,
  sameStateFast,
} from '@/code/measure/value-phase-maps'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'

const SLOTS = 24

export type BallLineCheck = {
  radius: number
  docks: number
  lineDocks: number
  lineSimple: boolean
  lineStream: boolean
  orientationConflicts: number
  loves: number
  beats: number
  mostBranches: number
  offLine: number
  lawBreaks: number
  normExact: boolean
  oddEqualsOff: boolean
  oddFired: number
  returned: boolean
  controlExponent: number
}

// loves as (line position, label): position 0 the base dock, + along the first slot, - along its opposite; label 0
// the first slot, 1 the opposite
export function ballLineCheck(input: {
  radius: number
  loves: readonly (readonly [number, number])[]
  beats: number
}): BallLineCheck {
  const { radius, loves, beats } = input
  const m = exactBallMesh({ radius })
  const cells = m.cells
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(cells * 12) })
  const tables: LockedTables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(cells * SLOTS).fill(f.weave.moves.identity),
  )
  const first = LINE_FIRSTS[0]!
  const second = OPPOSITE[first]!

  // the base line
  const at = new Map<number, number>([[0, 0]])
  const seen = new Set<number>([0])

  let lineSimple = true
  let lineStream = true

  for (const [slot, back, step] of [
    [first, second, 1],
    [second, first, -1],
  ] as const) {
    let x = 0

    for (let i = 1; ; i++) {
      const y = m.mesh.neighbour(x, slot)

      if (y < 0) {
        break
      }

      lineSimple &&= !seen.has(y) && m.mesh.neighbour(y, back) === x
      lineStream &&= tables.target[x * SLOTS + slot] === y * SLOTS + slot
      seen.add(y)
      at.set(step * i, y)
      x = y
    }
  }

  const lineSlots = new Set<number>()
  const lineDocks = new Set<number>(at.values())

  for (const x of lineDocks) {
    lineSlots.add(x * SLOTS + first)
    lineSlots.add(x * SLOTS + second)
  }

  const o = orientationOf({
    cells,
    neighbour: (x, d) => m.mesh.neighbour(x, d),
  })
  const start: Configuration = toWords(vacuumConfiguration(f, 'none'))

  for (const [p, j] of loves) {
    const x = at.get(p)

    if (x === undefined) {
      throw new Error(`cold-line-ball: line position ${p} is outside the ball`)
    }

    const i = x * SLOTS + (j === 0 ? first : second)

    start.vibe[i] = 1
    start.open[i] = 1
    start.point[i] = 0
  }

  const law0 = laws(start)
  const off: ValuePiece = { kind: 'off' }
  const odd: ValuePiece = { kind: 'odd', orientation: o.orientation }
  const tally = newValueTally()

  let a: LockedState = lockedState(start)
  let b: LockedState = lockedState(start)
  let mostBranches = 1
  let offLine = 0
  let lawBreaks = 0
  let normExact = true
  let oddEqualsOff = true

  for (let t = 0; t < beats; t++) {
    a = valueBeat(off, tables, a, t)
    b = valueBeat(odd, tables, b, t, undefined, tally)
    mostBranches = Math.max(mostBranches, a.branches.length)
    oddEqualsOff &&= sameStateFast(a, b)

    const n = lockedNorm(a)

    normExact &&= n.total === n.unit

    for (const br of a.branches) {
      const l = laws(br)

      lawBreaks += l[0] !== law0[0] || l[1] !== law0[1] ? 1 : 0

      for (let i = 0; i < br.vibe.length; i++) {
        if (br.vibe[i] !== 0 && !lineSlots.has(i)) {
          offLine++
        }
      }

      for (let i = 0; i < br.store.length; i++) {
        if (br.store[i] !== 0 && !lineDocks.has((i / 12) | 0)) {
          offLine++
        }
      }
    }
  }

  for (let t = beats - 1; t >= 0; t--) {
    a = valueBeatBack(off, tables, a, t)
  }

  const b0 = a.branches[0]
  const returned =
    a.branches.length === 1 &&
    !!b0 &&
    b0.a === 1n &&
    b0.b === 0n &&
    b0.k === 0 &&
    sameConfiguration(b0, start)

  // the positive control: the census's first qualifying pattern at the base dock
  const control: Configuration = toWords(vacuumConfiguration(f, 'none'))

  for (const [slot, tone] of valueCensus().first) {
    control.vibe[slot] = tone
    control.open[slot] = 1
  }

  return {
    radius,
    docks: cells,
    lineDocks: lineDocks.size,
    lineSimple,
    lineStream,
    orientationConflicts: o.conflicts,
    loves: loves.length,
    beats,
    mostBranches,
    offLine,
    lawBreaks,
    normExact,
    oddEqualsOff,
    oddFired: tally.fired,
    returned,
    controlExponent: valueExponent(odd, tables, control),
  }
}
