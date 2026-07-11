// Conformance for code/coarse/surrogate-tower: the temporal renormalization tower. Each level fits a
// surrogate at lag baseLag * 2^level and prices it against base resolution. The lag-doubling and the
// op-count arithmetic (surrogateCost = ceil(span/lag) * bins^2, baseCost = span * cellCount, speedup =
// baseCost/surrogateCost) are exact; on a clean periodic trajectory the learned surrogate beats its
// time-shuffled control. Costs re-derived by hand.

import { suite, check, close, equal, ok } from '@/test/code/harness'
import {
  surrogateTower,
  towerAccuracyAtLag,
} from '@/code/coarse/surrogate-tower'

// A perfectly period-2 label trajectory: at every lag (1,2,4,...) the next label is a deterministic
// function of the current one, so a fit surrogate can predict it exactly.
const labels = Array.from({ length: 100 }, (_, i) => i % 2)

suite('coarse/surrogate-tower: lag doubling and cost', [
  check('lags double and the costs match the formula', () => {
    const span = 100
    const cellCount = 1000
    const bins = 2
    const tower = surrogateTower({
      labels,
      bins,
      baseLag: 1,
      levels: 3,
      cellCount,
      span,
    })

    equal(tower.length, 3)
    tower.forEach((level, k) => {
      const expectedLag = 1 * 2 ** k

      equal(level.lag, expectedLag, `level ${k} lag`)
      equal(
        level.surrogateCost,
        Math.ceil(span / expectedLag) * bins * bins,
        `level ${k} surrogate cost`,
      )
      equal(level.baseCost, span * cellCount, `level ${k} base cost`)
      close(
        level.speedup,
        level.baseCost / level.surrogateCost,
        1e-9,
        `level ${k} speedup`,
      )
    })
  }),
])

suite('coarse/surrogate-tower: fidelity vs the shuffled control', [
  check(
    'a periodic trajectory is predicted perfectly and beats shuffle',
    () => {
      const tower = surrogateTower({
        labels,
        bins: 2,
        baseLag: 1,
        levels: 3,
        cellCount: 1000,
        span: 100,
      })

      for (const level of tower) {
        close(
          level.accuracy,
          1,
          1e-12,
          'period-2 series is perfectly predictable',
        )

        ok(
          level.accuracy >= level.shuffledAccuracy,
          'the learned surrogate is at least as good as its time-shuffled control',
        )
      }
    },
  ),
  check('the single-lag accuracy agrees with the tower', () => {
    close(towerAccuracyAtLag({ labels, bins: 2, lag: 1 }), 1, 1e-12)
  }),
])
