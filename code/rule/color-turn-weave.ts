// The color turn weave: a color-local rule that dresses no more than the committed one.
//
// E-FRC-0124 showed color is an exact local law only on a wire table with no hop, and E-FRC-0125 that the
// hop-free table on the committed schedule (the color weave) passes every acceptance gate but dressing.
// The search of E-FRC-0137 kept the hop-free bind table and varied the schedule. This member of that
// family (code/rule/color-local-weave, color-local-family) passes every gate of E-FRC-0125 against the
// committed rule, dressing included, for a lone love and a lone fear (E-FRC-0136). It differs from the
// color weave in two choices and nothing else:
// - the turn that precesses the couples is the signed axis permutation that swaps the first two axes and
//   reverses the third, an involution on the lines (it fixes lines 0 and 1), where the committed turn has
//   order four. On the out-and-back walk the partition then alternates between two
// - the palindromic swap visits the couples in the order 3, 0, 5, 2, 4, 1 and back, where the committed
//   order is 0, 2, 3, 1, 4, 5 and back
// The wire table is the bind table (calm makes a pair, the pair flips, then annihilates, a lone charge
// stays), the swap condition, the palindrome, the couples at beat zero and the out-and-back walk are the
// committed rule's. Roles ride as in code/rule/color-weave, so color stays exact cell by cell.

import { BIND_MOVE_FORWARD, type Collision } from '@/code/rule/collision'
import { colorLocalCollision, colorLocalSpec, type ColorLocalSpec } from '@/code/rule/color-local-weave'

// the turn, as a permutation of the 12 lines of the D4 box (index 100 of color-local-family's
// turnElements: axes 0 and 1 swapped, axis 2 negated)
export const COLOR_TURN = [0, 1, 7, 6, 8, 9, 3, 2, 4, 5, 11, 10]

// the palindromic swap's visiting order, run out and back
export const COLOR_TURN_SWAP_ORDER = [3, 0, 5, 2, 4, 1]

export const COLOR_TURN_SPEC: ColorLocalSpec = colorLocalSpec({
  tables: [BIND_MOVE_FORWARD],
  turn: COLOR_TURN,
  swapAt: [...COLOR_TURN_SWAP_ORDER, ...[...COLOR_TURN_SWAP_ORDER].reverse()],
})

// the collision of beat t, forward or its inverse, in the form turningWeave gives it
export function colorTurnWeave(input: { opposite: readonly number[]; forward?: boolean }): (t: number) => Collision {
  return colorLocalCollision({ spec: COLOR_TURN_SPEC, opposite: input.opposite, forward: input.forward })
}
