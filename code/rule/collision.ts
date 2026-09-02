import { Tone } from '@/code/tone/will'

// The collision, defined once. A collision is a local, in-place map on one cell's
// directional slots. `slots` is the whole will buffer, `base` is cell * degree,
// and `degree` is the coin size. A valid collision conserves the per-cell sum and
// is reversible. An involution is its own inverse (passThrough, momentumRotate2D);
// a bijection that is not an involution (the 9-state pair table below) runs
// backward through its paired inverse, which the engine applies in inverseBeat.

export type Collision = (
  slots: Int8Array,
  base: number,
  degree: number,
) => void

// The pass-through collision: never changes anything. The trivial reversible map.
export const passThrough: Collision = () => {
  // intentionally does nothing: the trivial reversible map
}

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
  } else if (
    east === 0 &&
    west === 0 &&
    north === south &&
    north !== 0
  ) {
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
function buildPairForward(): [Tone, Tone][] {
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

function invertPairTable(forward: [Tone, Tone][]): [Tone, Tone][] {
  const inverse = new Array<[Tone, Tone]>(9)

  for (const left of TONES) {
    for (const right of TONES) {
      const out = forward[pairKey(left, right)]!

      inverse[pairKey(out[0], out[1])] = [left, right]
    }
  }

  return inverse
}

export const PAIR_FORWARD: [Tone, Tone][] = buildPairForward()
export const PAIR_INVERSE: [Tone, Tone][] =
  invertPairTable(PAIR_FORWARD)

// the opposite-pair lines of a coin, each direction paired once with its opposite.
function linesOf(opposite: number[]): [number, number][] {
  const lines: [number, number][] = []

  for (let direction = 0; direction < opposite.length; direction++) {
    const other = opposite[direction]!

    if (direction < other) {
      lines.push([direction, other])
    }
  }

  return lines
}

// A collision that runs a 9-state per-line table on every opposite-direction pair.
// `opposite[direction]` is the slot index of the direction opposite `direction`, so
// the two tones moving head-on through the cell interact. This is the shared engine
// for any per-line reversible table on a coin that closes under opposite (the D4
// coin's twelve lines, the square coin's two, and so on).
function tableCollision(
  table: [Tone, Tone][],
  opposite: number[],
): Collision {
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

// The PREVIOUS committed knit (until 2026-09-02): the 9-state pair table on every opposite
// pair. Superseded as the committed base rule by lineWeave, which contains this table as its
// clock sector (five of six couples run exactly this), so every canon result measured on this
// rule remains a statement about the clock sector of the committed knit. Kept exported as that
// sector's table and as the machinery of the canon experiments. Pass forward: false for
// the inverse, which the engine streams through inverseBeat to run time backward.
export function pairCollision(input: {
  opposite: number[]
  forward?: boolean
}): Collision {
  return tableCollision(
    (input.forward ?? true) ? PAIR_FORWARD : PAIR_INVERSE,
    input.opposite,
  )
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
function buildBindMoveForward(): [Tone, Tone][] {
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

export const BIND_MOVE_FORWARD: [Tone, Tone][] = buildBindMoveForward()
export const BIND_MOVE_INVERSE: [Tone, Tone][] =
  invertPairTable(BIND_MOVE_FORWARD)

// The bind-and-move collision. Pass forward: false for its paired inverse.
export function bindAndMove(input: {
  opposite: number[]
  forward?: boolean
}): Collision {
  return tableCollision(
    (input.forward ?? true) ? BIND_MOVE_FORWARD : BIND_MOVE_INVERSE,
    input.opposite,
  )
}

// The leaky-confiner table (one-tone-photon-as-phonon). One reversible move on the single tone field that
// CONFINES charged line-states (so a body keeps its identity) but leaves CHARGE-NEUTRAL line-states alone so
// they STREAM as neutral ripples (phonons, the radiation). A lone charge (s, 0) reflects (s confined, it bounces
// back inward, like the pair-table hop), a neutral pair (1, -1) is left to stream apart (a propagating neutral
// disturbance), and there is NO create move, so the vacuum stays empty (no churn). So the matter is the tone
// bound, the photon is the tone waving, in ONE field. It is a self-inverse involution (the reflects are 2-cycles,
// the rest fixed), reversible and charge-conserving.
function buildLeakyConfineForward(): [Tone, Tone][] {
  const table = new Array<[Tone, Tone]>(9)

  table[pairKey(-1, -1)] = [-1, -1] // like signs, inert
  table[pairKey(1, 1)] = [1, 1]
  table[pairKey(1, 0)] = [0, 1] // a lone charge REFLECTS (confine the body)
  table[pairKey(0, 1)] = [1, 0]
  table[pairKey(-1, 0)] = [0, -1]
  table[pairKey(0, -1)] = [-1, 0]
  table[pairKey(0, 0)] = [0, 0] // peace left alone, NO create move (the vacuum stays empty)
  table[pairKey(1, -1)] = [1, -1] // a neutral pair STREAMS (the phonon, radiation)
  table[pairKey(-1, 1)] = [-1, 1]

  return table
}

export const LEAKY_CONFINE: [Tone, Tone][] = buildLeakyConfineForward()

// The leaky-confiner collision. A self-inverse involution, so the same table runs forward and backward.
export function leakyConfine(input: { opposite: number[] }): Collision {
  return tableCollision(LEAKY_CONFINE, input.opposite)
}

// The momentum-conserving collision, the generalization of momentumRotate2D to any coin. It rotates a
// zero-momentum HEAD-ON pair from one direction-line to an empty partner line, and does nothing else. A
// head-on pair is an opposite pair carrying the same tone (s, s), which has zero net momentum, so moving it
// to another line keeps momentum zero. A lone particle, or any net-momentum configuration, is left untouched
// and therefore STREAMS BALLISTICALLY, which is exactly what the pinning pair table denies. The lines are
// paired two at a time, and the move (one line full, its partner empty) is its own inverse, so the rule is a
// reversible involution that conserves both charge and momentum.
export function headOnRotate(input: { opposite: number[] }): Collision {
  const lines: [number, number][] = []

  for (
    let direction = 0;
    direction < input.opposite.length;
    direction++
  ) {
    const other = input.opposite[direction]!

    if (direction < other) {
      lines.push([direction, other])
    }
  }

  const linePairs: [[number, number], [number, number]][] = []

  for (let k = 0; k + 1 < lines.length; k += 2) {
    linePairs.push([lines[k]!, lines[k + 1]!])
  }

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
        slots[base + lj[0]] = ai
        slots[base + lj[1]] = ai
        slots[base + li[0]] = 0
        slots[base + li[1]] = 0
      } else if (jHeadOn && iEmpty) {
        slots[base + li[0]] = aj
        slots[base + li[1]] = aj
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
export function stickyReflect(input: {
  opposite: number[]
}): Collision {
  const lines = linesOf(input.opposite)

  return (slots, base, degree) => {
    let count = 0

    for (let direction = 0; direction < degree; direction++) {
      if (slots[base + direction] !== 0) {
        count++
      }
    }

    if (count < 2) {
      return
    }

    for (const [left, right] of lines) {
      const temporary = slots[base + left]!

      slots[base + left] = slots[base + right]!
      slots[base + right] = temporary
    }
  }
}

// The LINE-HOP collision, the traveller knit found by the 2026-09-01 rule-space hunt and PROPOSED as
// the committed knit's extension (adoption is a base-model decision; nothing in the suite runs this
// unless it asks for it). The twelve lines of a cell pair into six couples, and the whole rule is one
// clause plus the committed table:
//
//   - if exactly one line of a couple holds a single tone in its away slot and the other line is
//     empty, the two lines SWAP (a symmetric condition, so the swap is an involution),
//   - the second line of every couple (the wire) then runs the committed 9-state pair table, so the
//     vacuum keeps its three-beat cancelling clock.
//
// Measured (foundations/traveller-knit): exactly reversible with charge conserved, a lone tone is a
// SPEED-ONE PARTICLE holding one slot at coarse magnitude exactly sqrt 3 at every beat, superposing
// exactly, fully resident in the matter sector (the wires stay silent in free flight and engage at
// interactions), transmitted through a one-beat-offset domain with its clock phase rotated one unit,
// and amplified by a two-beat-offset domain (the detector). The quantum kinematics the roadmap's
// sixth-thing search specified, in one clause.
export function lineHop(input: {
  opposite: number[]
  forward?: boolean
}): Collision {
  const forward = input.forward ?? true
  const lines: [number, number][] = []

  for (let d = 0; d < input.opposite.length; d++) {
    const o = input.opposite[d]!

    if (d < o) {
      lines.push([d, o])
    }
  }

  const couples: [[number, number], [number, number]][] = []

  for (let k = 0; k + 1 < lines.length; k += 2) {
    couples.push([lines[k]!, lines[k + 1]!])
  }

  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const loneAway = (a: Tone, b: Tone): boolean => a === 0 && b !== 0
  const empty = (a: Tone, b: Tone): boolean => a === 0 && b === 0

  return (slots, base) => {
    for (const [line, wire] of couples) {
      const swap = (): void => {
        const a0 = (slots[base + line[0]] ?? 0) as Tone
        const a1 = (slots[base + line[1]] ?? 0) as Tone
        const w0 = (slots[base + wire[0]] ?? 0) as Tone
        const w1 = (slots[base + wire[1]] ?? 0) as Tone

        if (
          (loneAway(a0, a1) && empty(w0, w1)) ||
          (loneAway(w0, w1) && empty(a0, a1))
        ) {
          slots[base + line[0]] = w0
          slots[base + line[1]] = w1
          slots[base + wire[0]] = a0
          slots[base + wire[1]] = a1
        }
      }

      const clock = (): void => {
        const a = (slots[base + wire[0]] ?? 0) as Tone
        const b = (slots[base + wire[1]] ?? 0) as Tone
        const image = table[pairKey(a, b)]!

        slots[base + wire[0]] = image[0]
        slots[base + wire[1]] = image[1]
      }

      if (forward) {
        swap()
        clock()
      } else {
        clock()
        swap()
      }
    }
  }
}

// A superseded candidate (the CPT repair of lineHop, 2026-09-02), kept for its experiments.
// The committed form is lineWeave, which keeps the palindromic swap on one couple only. Same one swap
// clause and the committed 9-state table on wires, but applied as a PALINDROME per beat: swap,
// clock, swap. The swap is charge-even and an involution, and negating tones conjugates the clock
// table to its inverse, so negation conjugates the whole collision to its own inverse: combined
// with full spatial inversion and velocity reversal this gives an EXACT CPT conjugation on the d4
// substrate (measured, the unique nontrivial exact conjugation among 4,608), while C and CP stay
// violated (the weak pattern) and the speed-one traveller, exact superposition and exact echo all
// survive. lineHop's plain swap-then-clock order is what blocked its CPT. The inverse runs the
// inverse table in the same palindrome shape, since a palindrome inverts by inverting its middle.
export function linePalindrome(input: {
  opposite: number[]
  forward?: boolean
}): Collision {
  const forward = input.forward ?? true
  const lines: [number, number][] = []

  for (let d = 0; d < input.opposite.length; d++) {
    const o = input.opposite[d]!

    if (d < o) {
      lines.push([d, o])
    }
  }

  const couples: [[number, number], [number, number]][] = []

  for (let k = 0; k + 1 < lines.length; k += 2) {
    couples.push([lines[k]!, lines[k + 1]!])
  }

  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const loneAway = (a: Tone, b: Tone): boolean => a === 0 && b !== 0
  const empty = (a: Tone, b: Tone): boolean => a === 0 && b === 0

  return (slots, base) => {
    for (const [line, wire] of couples) {
      const swap = (): void => {
        const a0 = (slots[base + line[0]] ?? 0) as Tone
        const a1 = (slots[base + line[1]] ?? 0) as Tone
        const w0 = (slots[base + wire[0]] ?? 0) as Tone
        const w1 = (slots[base + wire[1]] ?? 0) as Tone

        if (
          (loneAway(a0, a1) && empty(w0, w1)) ||
          (loneAway(w0, w1) && empty(a0, a1))
        ) {
          slots[base + line[0]] = w0
          slots[base + line[1]] = w1
          slots[base + wire[0]] = a0
          slots[base + wire[1]] = a1
        }
      }

      const clock = (): void => {
        const a = (slots[base + wire[0]] ?? 0) as Tone
        const b = (slots[base + wire[1]] ?? 0) as Tone
        const image = table[pairKey(a, b)]!

        slots[base + wire[0]] = image[0]
        slots[base + wire[1]] = image[1]
      }

      swap()
      clock()
      swap()
    }
  }
}

// THE COMMITTED KNIT (adopted 2026-09-02): the weave. The 12 lines pair into 6 couples by the
// overlap-balanced table (each of the six planes contributes exactly one wire and one matter
// line, so every axis lies in exactly three wire planes and no direction is preferred, and every
// couple's matter and wire planes share an axis, so every potential species is detectable). The
// first couple is palindromic (swap, clock, swap), the matter sector; the other five run the
// committed clock alone, the medium. Adopted by the user after the acceptance programme
// (E-FND-0102 through E-FND-0111): the unique setting whose domain walls stay exactly periodic
// (quantized in whole cross-sectional sheets, quantum six times side cubed, period twelve at two
// sizes), carrying the speed-one traveller with exact superposition, the wire-polarization law,
// unit phase kicks, exact CPT with C and CP violated, exact two-path interference, and the
// dressed-quasiparticle picture in the dense-tiling vacuum. On meshes with fewer than twelve
// lines the couples fall back to consecutive pairing with the same one-swap structure.
export function lineWeave(input: {
  opposite: number[]
  forward?: boolean
}): Collision {
  const forward = input.forward ?? true
  const lines: [number, number][] = []

  for (let d = 0; d < input.opposite.length; d++) {
    const o = input.opposite[d]!

    if (d < o) {
      lines.push([d, o])
    }
  }

  const OVERLAP_BALANCED: [number, number][] = [
    [0, 3],
    [2, 5],
    [4, 1],
    [6, 9],
    [8, 11],
    [10, 7],
  ]
  const couples: [[number, number], [number, number]][] = []

  if (lines.length >= 12) {
    for (const [m, w] of OVERLAP_BALANCED) {
      couples.push([lines[m]!, lines[w]!])
    }
  } else {
    for (let k = 0; k + 1 < lines.length; k += 2) {
      couples.push([lines[k]!, lines[k + 1]!])
    }
  }

  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const loneAway = (a: Tone, b: Tone): boolean => a === 0 && b !== 0
  const empty = (a: Tone, b: Tone): boolean => a === 0 && b === 0

  return (slots, base) => {
    for (let k = 0; k < couples.length; k++) {
      const [line, wire] = couples[k]!

      const swap = (): void => {
        const a0 = (slots[base + line[0]] ?? 0) as Tone
        const a1 = (slots[base + line[1]] ?? 0) as Tone
        const w0 = (slots[base + wire[0]] ?? 0) as Tone
        const w1 = (slots[base + wire[1]] ?? 0) as Tone

        if (
          (loneAway(a0, a1) && empty(w0, w1)) ||
          (loneAway(w0, w1) && empty(a0, a1))
        ) {
          slots[base + line[0]] = w0
          slots[base + line[1]] = w1
          slots[base + wire[0]] = a0
          slots[base + wire[1]] = a1
        }
      }

      const clock = (): void => {
        const a = (slots[base + wire[0]] ?? 0) as Tone
        const b = (slots[base + wire[1]] ?? 0) as Tone
        const image = table[pairKey(a, b)]!

        slots[base + wire[0]] = image[0]
        slots[base + wire[1]] = image[1]
      }

      if (k === 0) {
        swap()
        clock()
        swap()
      } else {
        clock()
      }
    }
  }
}
