// Every rule of the committed shape, enumerated: the clock is forced. A per-line collision that is
// reversible and conserves the pair charge is a bijection on the nine pair states that preserves the
// five charge classes {-2}, {-1}x2, {0}x3, {+1}x2, {+2}, so there are exactly 1! x 2! x 3! x 2! x 1! =
// 24 such rules, and this experiment builds all of them and measures each one exactly.
//
//   - 8 have a period-3 vacuum (the charge-zero class is a 3-cycle) and for every one the Z_3 amplitude
//     of the vacuum cancels EXACTLY over its cycle, because the cycle visits all three charge-zero
//     states and omega^0 + omega^0, omega^1 + omega^-1 twice sum to 2 - 1 - 1 = 0,
//   - 8 have a period-2 vacuum and 8 a fixed vacuum, and NONE of those sixteen cancels,
//   - every rule with a period-3 vacuum admits a tone birth only in its one empty beat, so within the
//     whole rule class no fixed-mesh dynamics gives two defects different clock phases,
//   - the committed charge rule is one of the eight with a clock, and the committed momentum-style
//     table (hop off) sits in the fixed-vacuum class.
//
// So the cancelling vacuum clock is not a lucky property of the chosen table: it is equivalent to the
// charge-zero class being a 3-cycle, and the birth restriction that pins every dynamical defect to one
// phase is universal in the class. Depth L1: a finite exact enumeration, with the count itself checked
// against the class sizes as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Tone = -1 | 0 | 1

const TONES: Tone[] = [-1, 0, 1]
const THIRD = (2 * Math.PI) / 3
const EXACT = 1e-12

function pairKey(a: Tone, b: Tone): number {
  return (a + 1) * 3 + (b + 1)
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) {
    return [items]
  }

  const out: T[][] = []

  for (let i = 0; i < items.length; i++) {
    for (const rest of permutations([
      ...items.slice(0, i),
      ...items.slice(i + 1),
    ])) {
      out.push([items[i]!, ...rest])
    }
  }

  return out
}

export default experiment({
  id: 'foundations/all-conserving-pair-rules',
  code: 'E-FND-0088',
  title:
    'all 24 reversible charge-conserving per-line pair rules, enumerated: exactly 8 have a period-3 vacuum and every one of those cancels in the Z_3 amplitude, the 16 with period-2 or fixed vacuums never cancel, every clocked rule admits a tone birth only in its one empty beat, and the committed charge rule is one of the eight, so the cancelling vacuum clock is equivalent to the charge-zero class being a 3-cycle and the one-phase birth restriction is universal in the rule class',
  category: 'foundations',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const classes: [Tone, Tone][][] = [-2, -1, 0, 1, 2].map(sum =>
      TONES.flatMap(a =>
        TONES.filter(b => a + b === sum).map(b => [a, b] as [Tone, Tone]),
      ),
    )

    const classPermutations = classes.map(c => permutations(c))
    const expectedCount = classPermutations.reduce(
      (n, p) => n * p.length,
      1,
    )

    let count = 0
    let period3 = 0
    let period3Cancels = 0
    let othersCancel = 0
    let clockedWithOneBirthBeat = 0
    let committedChargeSeen = false
    let committedMomentumSeen = false

    for (const p0 of classPermutations[0]!) {
      for (const p1 of classPermutations[1]!) {
        for (const p2 of classPermutations[2]!) {
          for (const p3 of classPermutations[3]!) {
            for (const p4 of classPermutations[4]!) {
              count++

              const table = new Array<[Tone, Tone]>(9)
              const images = [p0, p1, p2, p3, p4]

              classes.forEach((states, index) => {
                states.forEach((state, i) => {
                  table[pairKey(state[0], state[1])] = images[index]![i]!
                })
              })

              // the vacuum orbit of (0, 0)
              const orbit: [Tone, Tone][] = []

              let state: [Tone, Tone] = [0, 0]

              do {
                orbit.push(state)
                state = table[pairKey(state[0], state[1])]!
              } while (
                !(state[0] === 0 && state[1] === 0) &&
                orbit.length < 9
              )

              const period = orbit.length

              // the Z_3 amplitude of one vacuum pair summed over its cycle
              let re = 0
              let im = 0

              for (const [a, b] of orbit) {
                re += Math.cos(THIRD * a) + Math.cos(THIRD * b)
                im += Math.sin(THIRD * a) + Math.sin(THIRD * b)
              }

              const cancels = Math.hypot(re, im) < EXACT

              if (period === 3) {
                period3++

                if (cancels) {
                  period3Cancels++
                }

                // a tone can be born only where a slot is zero: count the beats of the cycle whose
                // state has any zero slot
                const emptyBeats = orbit.filter(
                  ([a, b]) => a === 0 && b === 0,
                ).length

                if (emptyBeats === 1) {
                  clockedWithOneBirthBeat++
                }
              } else if (cancels) {
                othersCancel++
              }

              // the committed charge table: hop swaps, (0,0) -> (1,-1) -> (-1,1) -> (0,0)
              const hop = table[pairKey(1, 0)]!
              const created = table[pairKey(0, 0)]!
              const flipped = table[pairKey(1, -1)]!

              if (
                hop[0] === 0 &&
                hop[1] === 1 &&
                created[0] === 1 &&
                created[1] === -1 &&
                flipped[0] === -1 &&
                flipped[1] === 1
              ) {
                committedChargeSeen = true
              }

              // the momentum-style member: every state fixed (the identity), vacuum fixed
              if (
                classes.every(states =>
                  states.every(([a, b]) => {
                    const image = table[pairKey(a, b)]!

                    return image[0] === a && image[1] === b
                  }),
                )
              ) {
                committedMomentumSeen = true
              }
            }
          }
        }
      }
    }

    const ok =
      count === 24 &&
      expectedCount === 24 &&
      period3 === 8 &&
      period3Cancels === 8 &&
      othersCancel === 0 &&
      clockedWithOneBirthBeat === 8 &&
      committedChargeSeen &&
      committedMomentumSeen

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reversible charge-conserving per-line rules on the nine pair states number exactly 24 (the product of the charge-class factorials), exactly 8 of them have a period-3 vacuum and all 8 cancel in the Z_3 amplitude while none of the 16 others does, every clocked rule has exactly one empty beat per cycle so a tone birth is pinned to one clock phase throughout the class, and the committed charge table and the identity (momentum-style) table both appear in the enumeration',
      metrics: {
        tables: count,
        period3,
        period3Cancels,
        othersCancel,
        clockedWithOneBirthBeat,
        committedChargeSeen: committedChargeSeen ? 1 : 0,
        committedMomentumSeen: committedMomentumSeen ? 1 : 0,
      },
      // CONTROL: the count matches the class-size product, so nothing was skipped or double-counted
      control: { expectedCount },
      notes:
        'The exhaustive answer to whether any rule of the committed shape shifts its own clock: none does, on a fixed mesh. The 24 tables split 8 period-3 (clocked, cancelling), 8 period-2, 8 fixed. Cancellation is exactly the visit of all three charge-zero states, 2 - 1 - 1 = 0. Rules that leave a line and act across lines (the momentum rotation) are a different shape and are covered by the measured experiments, not this enumeration.',
    })
  },
})
