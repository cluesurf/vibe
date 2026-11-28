// INTERFERENCE INSIDE PROVEN HONEYCOMB WINDOW & B-PIECE CALM-SLOT CHECK (E-QTM-0203).
// Verifies lone-love position interference strictly inside the proven honeycomb window m + 2t <= L (t = 1..3 on
// side-8 box and exact R = 3 {3,4,3,4} ball, exact equality diff = 0), and checks whether calm-slot leftover values
// moved by B across lines affect occupied-vibe amplitudes or interference.
//
// Depth L2: exact working rule in Z[w][1/2] on both box and exact honeycomb ball. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runWindowInterferenceCheck } from '@/code/measure/window-interference'

export default experiment({
  id: 'quantum/window-interference-check',
  code: 'E-QTM-0203',
  title:
    'Lone-love interference strictly inside proven honeycomb window m + 2t <= L (box vs exact ball) and B-piece calm-slot leftover check',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runWindowInterferenceCheck()
    const i0 = res.boxBallMaxDiff === 0
    const i1 = res.coinOffL1At3 === 0
    const g1 = res.boxL1At3 >= 0.25 && res.ballL1At3 >= 0.25 && Math.abs(res.boxL1At3 - res.ballL1At3) === 0
    const g2 =
      res.occupiedDiffWithCalmLeftoverBox === 0 && res.occupiedDiffWithCalmLeftoverBall === 0

    const ok = i0 && i1 && g1 && g2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Inside proven window m + 2t <= L (t = 1..3): side-8 box and exact R = 3 honeycomb ball agree to 0 ` +
        `(maxDiff ${res.boxBallMaxDiff}), lone-love L1 = ${res.boxL1At1}, ${res.boxL1At2}, ${res.boxL1At3} ` +
        `(coin-off control ${res.coinOffL1At3}); B-piece calm-slot leftovers moved=${res.calmLeftoversMoved} across lines ` +
        `with 0 effect on occupied amplitudes (box diff ${res.occupiedDiffWithCalmLeftoverBox}, ball diff ${res.occupiedDiffWithCalmLeftoverBall})`,
      metrics: {
        i0: i0 ? 1 : 0,
        i1: i1 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        boxBallMaxDiff: res.boxBallMaxDiff,
        boxL1At1: res.boxL1At1,
        boxL1At2: res.boxL1At2,
        boxL1At3: res.boxL1At3,
        ballL1At3: res.ballL1At3,
        coinOffL1At3: res.coinOffL1At3,
        calmLeftoversMoved: res.calmLeftoversMoved,
        occupiedDiffWithCalmLeftoverBox: res.occupiedDiffWithCalmLeftoverBox,
        occupiedDiffWithCalmLeftoverBall: res.occupiedDiffWithCalmLeftoverBall,
      },
    })
  },
})
