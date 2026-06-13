import { Tone } from '@/code/tone/will'

// The collision, defined once. A collision is a local, in-place map on one cell's
// directional slots. `slots` is the whole will buffer, `base` is cell * degree,
// and `degree` is the coin size. A valid collision conserves the per-cell sum and
// is reversible. An involution is its own inverse (passThrough, momentumRotate2D);
// a bijection that is not an involution (the 9-state pair table below) runs
// backward through its paired inverse, which the engine applies in inverseBeat.

export interface Collision {
  (slots: Int8Array, base: number, degree: number): void
}

// The pass-through collision: never changes anything. The trivial reversible map.
export const passThrough: Collision = () => {}

// The momentum-rotate involution on a degree-4 square mesh (direction order
// E, W, N, S). A zero-momentum head-on pair on one axis rotates to the other,
// (s, s, 0, 0) <-> (0, 0, s, s) for s = +-1. Conserves charge and momentum, and
// is its own inverse. This is the canonical 2D reference rule.
export const momentumRotate2D: Collision = (slots, base) => {
  const east = slots[base] ?? 0
  const west = slots[base + 1] ?? 0
  const north = slots[base + 2] ?? 0
  const south = slots[base + 3] ?? 0
  if (north === 0 && south === 0 && east === west && east !== 0) {
    slots[base] = 0
    slots[base + 1] = 0
    slots[base + 2] = east
    slots[base + 3] = east
  } else if (east === 0 && west === 0 && north === south && north !== 0) {
    slots[base + 2] = 0
    slots[base + 3] = 0
    slots[base] = north
    slots[base + 1] = north
  }
}

// The nine tones the two slots of an opposite pair can hold, indexed by the pair
// of tones moving head-on through the cell. Used to key the pair table.
const TONES: Tone[] = [-1, 0, 1]

function pairKey(left: Tone, right: Tone): number {
  return (left + 1) * 3 + (right + 1)
}

// The 9-state pair table: the canonical local interaction between the two tones
// on a pair of opposite direction slots. It is the create-flip-annihilate cycle.
// A like-signed pair is inert, a charge hops past a peace, peace creates a
// balanced pair, the pair flips, then annihilates back to peace. It conserves the
// pair sum and permutes the nine states, so the rule is reversible.
function buildPairForward(): Array<[Tone, Tone]> {
  const table = new Array<[Tone, Tone]>(9)
  table[pairKey(-1, -1)] = [-1, -1] // like signs, inert
  table[pairKey(1, 1)] = [1, 1]
  table[pairKey(-1, 0)] = [0, -1] // a charge hops past a peace
  table[pairKey(0, -1)] = [-1, 0]
  table[pairKey(1, 0)] = [0, 1]
  table[pairKey(0, 1)] = [1, 0]
  table[pairKey(0, 0)] = [1, -1] // the arrow: peace creates a balanced pair
  table[pairKey(1, -1)] = [-1, 1] // the pair flips
  table[pairKey(-1, 1)] = [0, 0] // annihilation closes the cycle
  return table
}

function invertPairTable(forward: Array<[Tone, Tone]>): Array<[Tone, Tone]> {
  const inverse = new Array<[Tone, Tone]>(9)
  for (const left of TONES) {
    for (const right of TONES) {
      const out = forward[pairKey(left, right)]!
      inverse[pairKey(out[0], out[1])] = [left, right]
    }
  }
  return inverse
}

export const PAIR_FORWARD: Array<[Tone, Tone]> = buildPairForward()
export const PAIR_INVERSE: Array<[Tone, Tone]> = invertPairTable(PAIR_FORWARD)

// the opposite-pair lines of a coin, each direction paired once with its opposite.
function linesOf(opposite: number[]): Array<[number, number]> {
  const lines: Array<[number, number]> = []
  for (let direction = 0; direction < opposite.length; direction++) {
    const other = opposite[direction]!
    if (direction < other) lines.push([direction, other])
  }
  return lines
}

// A collision that runs a 9-state per-line table on every opposite-direction pair.
// `opposite[direction]` is the slot index of the direction opposite `direction`, so
// the two tones moving head-on through the cell interact. This is the shared engine
// for any per-line reversible table on a coin that closes under opposite (the D4
// coin's twelve lines, the square coin's two, and so on).
function tableCollision(table: Array<[Tone, Tone]>, opposite: number[]): Collision {
  const lines = linesOf(opposite)
  return (slots, base) => {
    for (const [left, right] of lines) {
      const a = (slots[base + left] ?? 0) as Tone
      const b = (slots[base + right] ?? 0) as Tone
      const out = table[pairKey(a, b)]!
      slots[base + left] = out[0]
      slots[base + right] = out[1]
    }
  }
}

// The committed 9-state pair table on every opposite pair. Pass forward: false for
// the inverse, which the engine streams through inverseBeat to run time backward.
export function pairCollision(input: { opposite: number[]; forward?: boolean }): Collision {
  return tableCollision((input.forward ?? true) ? PAIR_FORWARD : PAIR_INVERSE, input.opposite)
}

// The bind-and-move table (Option 3, routes-to-nested-selves). It is the committed
// pair table with the HOP turned off, the lone-charge states (s, 0) and (0, s) are
// left UNTOUCHED instead of being swapped. Disabling the hop is exactly what removes
// the pinning, so lone charges stream ballistically (mobility). The create-flip-
// annihilate cycle on the charge-zero states is kept intact, which is the binding /
// breathing engine, a head-on opposite-charge pair can lock into a localized
// create-annihilate oscillation. So the one rule both moves (lone charges stream)
// and binds (opposite charges can capture into a breather), staying reversible and
// charge-conserving. It is not an involution (the create cycle is a 3-cycle), so it
// has a paired inverse, like the pair table.
function buildBindMoveForward(): Array<[Tone, Tone]> {
  const table = new Array<[Tone, Tone]>(9)
  table[pairKey(-1, -1)] = [-1, -1] // like signs, inert
  table[pairKey(1, 1)] = [1, 1]
  table[pairKey(-1, 0)] = [-1, 0] // HOP OFF, the lone charge is left to stream (mobility)
  table[pairKey(0, -1)] = [0, -1]
  table[pairKey(1, 0)] = [1, 0]
  table[pairKey(0, 1)] = [0, 1]
  table[pairKey(0, 0)] = [1, -1] // the binding engine, peace creates a balanced pair
  table[pairKey(1, -1)] = [-1, 1] // the pair flips
  table[pairKey(-1, 1)] = [0, 0] // annihilation closes the cycle
  return table
}

export const BIND_MOVE_FORWARD: Array<[Tone, Tone]> = buildBindMoveForward()
export const BIND_MOVE_INVERSE: Array<[Tone, Tone]> = invertPairTable(BIND_MOVE_FORWARD)

// The bind-and-move collision. Pass forward: false for its paired inverse.
export function bindAndMove(input: { opposite: number[]; forward?: boolean }): Collision {
  return tableCollision((input.forward ?? true) ? BIND_MOVE_FORWARD : BIND_MOVE_INVERSE, input.opposite)
}

// The momentum-conserving collision, the generalization of momentumRotate2D to any coin. It rotates a
// zero-momentum HEAD-ON pair from one direction-line to an empty partner line, and does nothing else. A
// head-on pair is an opposite pair carrying the same tone (s, s), which has zero net momentum, so moving it
// to another line keeps momentum zero. A lone particle, or any net-momentum configuration, is left untouched
// and therefore STREAMS BALLISTICALLY, which is exactly what the pinning pair table denies. The lines are
// paired two at a time, and the move (one line full, its partner empty) is its own inverse, so the rule is a
// reversible involution that conserves both charge and momentum.
export function headOnRotate(input: { opposite: number[] }): Collision {
  const lines: Array<[number, number]> = []
  for (let direction = 0; direction < input.opposite.length; direction++) {
    const other = input.opposite[direction]!
    if (direction < other) lines.push([direction, other])
  }
  const linePairs: Array<[[number, number], [number, number]]> = []
  for (let k = 0; k + 1 < lines.length; k += 2) linePairs.push([lines[k]!, lines[k + 1]!])
  return (slots, base) => {
    for (const [li, lj] of linePairs) {
      const ai = slots[base + li[0]] ?? 0
      const bi = slots[base + li[1]] ?? 0
      const aj = slots[base + lj[0]] ?? 0
      const bj = slots[base + lj[1]] ?? 0
      const iHeadOn = ai === bi && ai !== 0
      const jHeadOn = aj === bj && aj !== 0
      const iEmpty = ai === 0 && bi === 0
      const jEmpty = aj === 0 && bj === 0
      if (iHeadOn && jEmpty) {
        slots[base + lj[0]] = ai as Tone
        slots[base + lj[1]] = ai as Tone
        slots[base + li[0]] = 0
        slots[base + li[1]] = 0
      } else if (jHeadOn && iEmpty) {
        slots[base + li[0]] = aj as Tone
        slots[base + li[1]] = aj as Tone
        slots[base + lj[0]] = 0
        slots[base + lj[1]] = 0
      }
    }
  }
}

// The sticky-reflection collision (routes-to-nested-selves, the capture channel). A cell with a single charge
// is left ALONE, so a lone particle streams freely (mobility). But a CROWDED cell, two or more charges meeting
// (a collision), REFLECTS every charge, swapping each slot with its opposite, bouncing the colliding charges
// back toward each other. Free particles move, colliding particles are trapped, an inelastic-like CAPTURE that
// is nonetheless a reversible involution (reflecting twice is the identity, and the crowded condition is
// reflection-invariant) and charge-conserving. This is the binding channel the elastic momentum-rotate lacks,
// the cost is that the captured cluster does not conserve momentum, so it is bound but pinned.
export function stickyReflect(input: { opposite: number[] }): Collision {
  const lines = linesOf(input.opposite)
  return (slots, base, degree) => {
    let count = 0
    for (let direction = 0; direction < degree; direction++) if (slots[base + direction] !== 0) count++
    if (count < 2) return
    for (const [left, right] of lines) {
      const temporary = slots[base + left]!
      slots[base + left] = slots[base + right]!
      slots[base + right] = temporary
    }
  }
}
