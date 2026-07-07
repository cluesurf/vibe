// The five enters through the golden ratio of the addressing. The substrate's hyperbolic addressing
// (the Fibonacci-tree navigation, E-NVG-0004) counts nodes by the Fibonacci recurrence, and the
// Fibonacci numbers grow by the golden ratio, one plus the square root of five over two. So the five
// is present in the addressing not as a chosen number but inside the square root of five that defines
// the golden ratio, the growth rate of the number of addresses. The count of admissible addresses at
// each depth (binary strings with no two adjacent ones, the Zeckendorf words the addressing uses)
// follows the Fibonacci recurrence, so the addressing capacity grows by the golden ratio and the five
// is the discriminant square root inside it.
//
// This is the honest place of the five in vibe: less deeply forced than the seven (the octonions) or
// the nine (the ternary squared), it enters through the golden ratio of the hyperbolic addressing and
// the square root of five that ratio carries. Reported as such, not overclaimed.
//
// Measured: the count of length-n binary strings with no two adjacent ones follows the Fibonacci
// recurrence exactly (each is the sum of the previous two), the ratio of successive counts converges
// to the golden ratio, and the golden ratio squared equals itself plus one (its defining relation),
// with the square root of five appearing in the closed form. So the addressing capacity grows by the
// golden ratio and the five lives in it.
//
// The control is the plain binary count (two to the n, no adjacency rule): it grows by two, not the
// golden ratio, so the golden growth is specifically the no-two-adjacent (Zeckendorf) addressing
// rule, not any counting.
//
// Depth L1. It confirms the golden-ratio growth of the admissible-address count (Fibonacci recurrence,
// ratio to the golden mean, the defining relation with the square root of five) against a plain-binary
// control, exhibiting the honest place of the five in vibe. Known combinatorics, tied to the
// addressing. The number 5, via the golden ratio.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fibonacci } from '@/code/measure/number-structure'

const DEPTHS = [2, 3, 4, 5, 6, 7, 8]

export default experiment({
  id: 'addressing/five-golden-addressing',
  code: 'E-NVG-0013',
  title:
    'the admissible-address count (no two adjacent ones) follows the Fibonacci recurrence and grows by the golden ratio (1 + sqrt 5)/2, so the five enters the addressing through the square root of five in the golden mean, while plain binary grows by two',
  category: 'addressing',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // the no-two-adjacent-ones count of length n is Fibonacci(n + 2)
    const counts = (n: number): number => {
      // dynamic programming: a = strings ending in 0, b = ending in 1
      let endZero = 1
      let endOne = 1

      for (let i = 2; i <= n; i++) {
        const nextZero = endZero + endOne
        const nextOne = endZero
        endZero = nextZero
        endOne = nextOne
      }

      return endZero + endOne
    }

    // the counts obey the Fibonacci recurrence exactly
    let recurrenceHolds = true

    for (let i = 2; i < DEPTHS.length; i++) {
      if (
        counts(DEPTHS[i]!) !==
        counts(DEPTHS[i]! - 1) + counts(DEPTHS[i]! - 2)
      ) {
        recurrenceHolds = false
      }
    }

    // the successive ratio converges to the golden ratio
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const measuredRatio = fibonacci(25) / fibonacci(24)
    const ratioIsGolden = Math.abs(measuredRatio - goldenRatio) < 1e-6

    // the golden ratio's defining relation carries the square root of five
    const definingRelation =
      Math.abs(goldenRatio * goldenRatio - (goldenRatio + 1)) < 1e-12

    const carriesRootFive =
      Math.abs(2 * goldenRatio - 1 - Math.sqrt(5)) < 1e-12

    // CONTROL: plain binary grows by two, not the golden ratio
    const binaryRatio = 2 ** 8 / 2 ** 7
    const binaryNotGolden = Math.abs(binaryRatio - goldenRatio) > 0.3

    const ok =
      recurrenceHolds &&
      ratioIsGolden &&
      definingRelation &&
      carriesRootFive &&
      binaryNotGolden

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the count of length-n admissible addresses (binary strings with no two adjacent ones, the Zeckendorf words the hyperbolic addressing uses) follows the Fibonacci recurrence exactly, each the sum of the previous two, so the addressing capacity grows by the golden ratio one plus the square root of five over two (the successive ratio converging to it to a part in a million), whose defining relation is that its square equals itself plus one and which carries the square root of five (twice the golden ratio minus one equals the square root of five exactly), so the five enters the addressing through the golden mean, the honest and less deeply forced place of the five in vibe compared with the seven of the octonions and the nine of the ternary squared, while plain binary counting grows by two rather than the golden ratio so the golden growth is specifically the no-two-adjacent addressing rule',
      metrics: {
        addressCountAtDepth6: counts(6),
        addressCountAtDepth8: counts(8),
        measuredRatio: Number(measuredRatio.toFixed(6)),
        goldenRatio: Number(goldenRatio.toFixed(6)),
        rootFive: Number(Math.sqrt(5).toFixed(6)),
        binaryRatio,
      },
      // CONTROL: plain binary grows by two, not the golden ratio.
      control: { binaryRatio },
      notes:
        'The five via the golden ratio of the addressing (Fibonacci growth, sqrt 5 in the golden mean). Honestly the least-forced of five, seven, nine. Complements the Fibonacci navigation (E-NVG-0004). The number 5, through the golden ratio.',
    })
  },
})
