// Conformance for code/rule/collision: the local interaction tables at the heart of
// the knit. The base rule must CONSERVE the per-pair charge and be REVERSIBLE (a
// bijection on the nine pair-states). Everything physical rests on these two
// properties, so we check them exactly (integer states, no tolerance) for every
// committed table.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  PAIR_FORWARD,
  PAIR_INVERSE,
  BIND_MOVE_FORWARD,
  BIND_MOVE_INVERSE,
  LEAKY_CONFINE,
  pairCollision,
  bindAndMove,
  leakyConfine,
  headOnRotate,
  momentumRotate2D,
  Collision,
} from '@/code/rule/collision'

type Tone = -1 | 0 | 1
const TONES: Tone[] = [-1, 0, 1]
const pairKey = (left: Tone, right: Tone): number => (left + 1) * 3 + (right + 1)

// Every nine-state pair table must satisfy two laws, so we check them the same way
// for each table rather than repeating the loop per table.
function conserves(table: [Tone, Tone][]): boolean {
  for (const left of TONES) {
    for (const right of TONES) {
      const out = table[pairKey(left, right)]!
      if (out[0] + out[1] !== left + right) {
        return false
      }
    }
  }

  return true
}

function isBijection(table: [Tone, Tone][]): boolean {
  const seen = new Set<number>()
  for (const left of TONES) {
    for (const right of TONES) {
      const out = table[pairKey(left, right)]!
      seen.add(pairKey(out[0], out[1]))
    }
  }

  return seen.size === 9
}

// inverse(forward(state)) === state for all nine states.
function inverts(
  forward: [Tone, Tone][],
  inverse: [Tone, Tone][],
): boolean {
  for (const left of TONES) {
    for (const right of TONES) {
      const out = forward[pairKey(left, right)]!
      const back = inverse[pairKey(out[0], out[1])]!
      if (back[0] !== left || back[1] !== right) {
        return false
      }
    }
  }

  return true
}

function isInvolution(table: [Tone, Tone][]): boolean {
  return inverts(table, table)
}

const tables: { name: string; table: [Tone, Tone][] }[] = [
  { name: 'pair', table: PAIR_FORWARD },
  { name: 'bind-move', table: BIND_MOVE_FORWARD },
  { name: 'leaky-confine', table: LEAKY_CONFINE },
]

// Run a collision on a single cell's slots and return the per-cell charge before
// and after, for a small handcrafted state. Used to confirm the cell-level wrappers
// inherit the table laws over a real coin.
function cellCharge(slots: Int8Array): number {
  let sum = 0
  for (const value of slots) {
    sum += value
  }

  return sum
}

// A degree-4 square coin: E,W,N,S with opposite pairs (E,W) and (N,S).
const squareOpposite = [1, 0, 3, 2]

function applied(collision: Collision, slots: Int8Array): Int8Array {
  const copy = Int8Array.from(slots)
  collision(copy, 0, copy.length)

  return copy
}

suite('rule/collision: nine-state tables', [
  ...tables.map(({ name, table }) =>
    check(`${name} table conserves the pair charge`, () => {
      ok(conserves(table), `${name} must conserve left+right on all 9 states`)
    }),
  ),
  ...tables.map(({ name, table }) =>
    check(`${name} table is a bijection on the 9 states`, () => {
      ok(isBijection(table), `${name} must permute the 9 pair-states`)
    }),
  ),
  check('pair table inverse undoes the forward table', () => {
    ok(inverts(PAIR_FORWARD, PAIR_INVERSE), 'PAIR_INVERSE must invert PAIR_FORWARD')
  }),
  check('bind-move inverse undoes the forward table', () => {
    ok(
      inverts(BIND_MOVE_FORWARD, BIND_MOVE_INVERSE),
      'BIND_MOVE_INVERSE must invert BIND_MOVE_FORWARD',
    )
  }),
  check('leaky-confine is a self-inverse involution', () => {
    ok(isInvolution(LEAKY_CONFINE), 'leaky-confine must be its own inverse')
  }),
  check('pair table is NOT an involution (the create cycle is a 3-cycle)', () => {
    ok(
      !isInvolution(PAIR_FORWARD),
      'the create-flip-annihilate cycle makes the pair table order-3, not order-2',
    )
  }),
  check('the arrow: peace creates a balanced pair', () => {
    const out = PAIR_FORWARD[pairKey(0, 0)]!
    equal(out[0], 1, 'peace,peace -> +,-  (left)')
    equal(out[1], -1, 'peace,peace -> +,-  (right)')
  }),
])

suite('rule/collision: cell-level wrappers', [
  check('pairCollision forward then inverse recovers a cell exactly', () => {
    const start = Int8Array.from([1, -1, 0, 0])
    const forward = pairCollision({ opposite: squareOpposite, forward: true })
    const backward = pairCollision({ opposite: squareOpposite, forward: false })
    const there = applied(forward, start)
    const back = applied(backward, there)
    for (let i = 0; i < start.length; i++) {
      equal(back[i], start[i], `slot ${i} must return to its start`)
    }
  }),
  check('every committed collision conserves the cell charge', () => {
    const states = [
      Int8Array.from([1, -1, 0, 0]),
      Int8Array.from([0, 0, 1, 1]),
      Int8Array.from([1, 0, 0, -1]),
      Int8Array.from([-1, -1, 1, 1]),
    ]
    const collisions: Collision[] = [
      pairCollision({ opposite: squareOpposite }),
      bindAndMove({ opposite: squareOpposite }),
      leakyConfine({ opposite: squareOpposite }),
      headOnRotate({ opposite: squareOpposite }),
      momentumRotate2D,
    ]
    for (const collision of collisions) {
      for (const state of states) {
        equal(
          cellCharge(applied(collision, state)),
          cellCharge(state),
          'a collision must not change the cell charge',
        )
      }
    }
  }),
  check('headOnRotate and leakyConfine are involutions at the cell level', () => {
    const state = Int8Array.from([1, 1, 0, 0])
    for (const collision of [
      headOnRotate({ opposite: squareOpposite }),
      leakyConfine({ opposite: squareOpposite }),
      momentumRotate2D,
    ]) {
      const twice = applied(collision, applied(collision, state))
      for (let i = 0; i < state.length; i++) {
        equal(twice[i], state[i], `applying twice must be the identity at slot ${i}`)
      }
    }
  }),
])
