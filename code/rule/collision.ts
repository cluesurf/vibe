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

// A collision that runs the 9-state pair table on every opposite-direction pair.
// `opposite[direction]` is the slot index of the direction opposite `direction`,
// so the two tones moving head-on through the cell interact. This is the 24-slot
// collide on the {3,4,3,4} D4 coin (twelve opposite pairs), and the same map runs
// on any mesh whose coin closes under opposite. Pass forward: false for the
// inverse, which the engine streams through inverseBeat to run the rule backward.
export function pairCollision(input: {
  opposite: number[]
  forward?: boolean
}): Collision {
  const table = (input.forward ?? true) ? PAIR_FORWARD : PAIR_INVERSE
  const pairs: Array<[number, number]> = []
  for (let direction = 0; direction < input.opposite.length; direction++) {
    const other = input.opposite[direction]!
    if (direction < other) {
      pairs.push([direction, other])
    }
  }
  return (slots, base) => {
    for (const [left, right] of pairs) {
      const a = (slots[base + left] ?? 0) as Tone
      const b = (slots[base + right] ?? 0) as Tone
      const out = table[pairKey(a, b)]!
      slots[base + left] = out[0]
      slots[base + right] = out[1]
    }
  }
}
