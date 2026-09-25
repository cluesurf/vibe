// The glide weave: a pair rule that keeps a color triality only together with a shift in time.
//
// E-FRC-0112 shows that a rule carried to itself by a color triality sigma on every beat can move
// tones between a color line and its orbit only in threes, which is why the triality weave needs a
// four-line vertex. A rule that satisfies sigma U_t sigma^-1 = U_(t+2) instead, a glide in time, does
// not have to keep sigma-fixed states fixed on a single beat, so the argument does not reach it.
//
// Each beat t, the collision is S_t P S_t: P the committed pair clock on every line, S_t conditional
// swaps (a lone trailing tone moves to an empty partner line, as in the committed turning weave) on a
// perfect matching of the 12 lines. The matchings, with color lines c_i and orbit lines o_(i,j),
// where sigma sends o_(i,j) to o_(i,j+1) and fixes c_i:
//
//   A   c_i - o_(i,0)        o_(i,1) - o_(i+1,2)
//   B   c_i - o_(i+1,0)      o_(i,1) - o_(i,2)
//
// and the schedule A, B, sigma A, sigma B, sigma^2 A, sigma^2 B (period 6). So S_(t+2) = sigma S_t, and
// because P and the swap rule are the same on every line, U_(t+2) = sigma U_t sigma^-1. Over a period
// each color line meets every line of two orbits one at a time, which no rule symmetric beat by beat
// can do. Each beat is a bijection (S an involution, P a permutation), and the inverse beat is
// S_t P^-1 S_t.

import {
  Collision,
  PAIR_FORWARD,
  PAIR_INVERSE,
} from '@/code/rule/collision'
import {
  conditionalSwap,
  type TrialityWeaveLayout,
} from '@/code/rule/triality-weave'

export const GLIDE_WEAVE_PERIOD = 6

type LineRef = readonly ['c', number] | readonly ['o', number, number]

const MATCHING_A: readonly (readonly [LineRef, LineRef])[] = [
  0, 1, 2,
].flatMap(i => [
  [
    ['c', i],
    ['o', i, 0],
  ] as const,
  [
    ['o', i, 1],
    ['o', (i + 1) % 3, 2],
  ] as const,
])

const MATCHING_B: readonly (readonly [LineRef, LineRef])[] = [
  0, 1, 2,
].flatMap(i => [
  [
    ['c', i],
    ['o', (i + 1) % 3, 0],
  ] as const,
  [
    ['o', i, 1],
    ['o', i, 2],
  ] as const,
])

export function glideWeave(input: {
  layout: TrialityWeaveLayout
  forward?: boolean
}): (t: number) => Collision {
  const { layout, forward = true } = input
  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const NO_LINE: readonly [number, number] = [0, 0]

  // the slots of a line reference turned by sigma^n
  const slotsOf = (
    ref: LineRef,
    n: number,
  ): readonly [number, number] => {
    const index =
      ref[0] === 'c'
        ? layout.color[ref[1]]
        : layout.orbits[ref[1]]?.[(ref[2] + n) % 3]

    return layout.lines[index ?? 0] ?? NO_LINE
  }

  const schedule = Array.from(
    { length: GLIDE_WEAVE_PERIOD },
    (_, t) => {
      const matching = t % 2 === 0 ? MATCHING_A : MATCHING_B
      const n = Math.floor(t / 2)

      return matching.map(
        ([a, b]) => [slotsOf(a, n), slotsOf(b, n)] as const,
      )
    },
  )

  return (t: number): Collision => {
    const pairs =
      schedule[
        ((t % GLIDE_WEAVE_PERIOD) + GLIDE_WEAVE_PERIOD) %
          GLIDE_WEAVE_PERIOD
      ] ?? []

    const swapAll = (slots: Int8Array, base: number): void => {
      for (const [a, b] of pairs) {
        conditionalSwap(slots, base, a, b)
      }
    }

    return (slots, base) => {
      swapAll(slots, base)

      for (const [leading, trailing] of layout.lines) {
        const key =
          ((slots[base + leading] ?? 0) + 1) * 3 +
          ((slots[base + trailing] ?? 0) + 1)
        const out = table[key] ?? [0, 0]

        slots[base + leading] = out[0]
        slots[base + trailing] = out[1]
      }

      swapAll(slots, base)
    }
  }
}
