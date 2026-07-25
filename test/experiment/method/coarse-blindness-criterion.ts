// The exact criterion for when a coarse conservation test is admissible as evidence.
//
// E-MTH-0005 established that a coarse continuity test has blind spots: a charge-destroying rule can
// read as exactly balanced at coarse scales, because its violations cancel inside the block. That left
// the practical question open. WHEN is a coarse balance trustworthy, and when is it worthless? This
// experiment answers it with a two-condition criterion, and the route to it is worth recording because
// the first hypothesis was wrong.
//
// HYPOTHESIS ONE, REFUTED BY MEASUREMENT. The natural guess was commensurability: blindness whenever
// the block side shares a factor with the pattern period. Measured across periods 2, 3, 4 and 5 that is
// false. Blindness appeared only at period 3 and nowhere else, so a shared factor is not sufficient.
//
// HYPOTHESIS TWO, CONFIRMED WITH DISCRIMINATING CONTROLS ON BOTH SIDES. The criterion is a conjunction:
//
//   a coarse test is BLIND exactly when the block tiles whole periods of the destroyed quantity
//   AND the per-period sum of that quantity is zero.
//
// Both conditions are necessary, and this experiment measures each failing alone:
//
//   - zero-sum pattern, block does NOT tile whole periods, so the loss survives and is seen.
//   - tiling block, but the per-period sum is NONZERO, so the loss survives and is seen. This is the
//     case that kills hypothesis one, because the block tiles perfectly and the test still sees it.
//   - both conditions together, blind.
//
// Why period 3 looked special earlier. The tone alphabet is ternary and sums to zero over its full
// range, so a period-3 pattern that visits every tone is automatically zero-sum. The apparent
// significance of the number three was really the zero-sum condition wearing a disguise, which is why
// hypothesis one fit the first data set and then failed off it.
//
// The consequence is a usable admissibility rule rather than a warning. A coarse balance certifies
// microscopic conservation only when the destroyed quantity has nonzero per-period sum at that scale,
// or when the block fails to tile it. Otherwise measure at the finest scale, or probe with a one-signed
// sink, which cannot sum to zero by construction.

import { d4Mesh } from '@/code/tool/mesh'
import { erasingCollision } from '@/code/control/lossy-collision'
import { fillPeriodicSlot, makeWill } from '@/code/tone/will'
import { continuityBlindSpotScan } from '@/code/measure/continuity'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// side 12 divides by 1, 2, 3, 4, 6 and 12, so both tiling and non-tiling block sides exist for the
// periods under test
const MESH_SIDE = 12
const BLOCK_SIDES = [1, 2, 3, 4, 6, 12]

// the slot the erasing sink removes, so its pattern is the destroyed quantity
const SINK_SLOT = 0

type Case = {
  name: string
  pattern: number[]
  zeroSum: boolean
}

const CASES: Case[] = [
  { name: 'period3zero', pattern: [-1, 0, 1], zeroSum: true },
  { name: 'period3nonzero', pattern: [1, 1, -1], zeroSum: false },
  { name: 'period2zero', pattern: [-1, 1], zeroSum: true },
  { name: 'period2nonzero', pattern: [1, 1], zeroSum: false },
]

export default experiment({
  id: 'method/coarse-blindness-criterion',
  code: 'E-MTH-0006',
  title:
    'a coarse conservation test is blind exactly when the block tiles whole periods of the destroyed quantity AND that quantity sums to zero over a period, which refutes the simpler commensurability guess',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: MESH_SIDE })

    // predicted blind exactly when the block tiles the period and the period sums to zero
    let predictionHolds = true
    let blindCount = 0
    let tilingButNonzeroSeen = 0
    let zeroSumButNotTilingSeen = 0
    let mismatches = 0

    for (const testCase of CASES) {
      const period = testCase.pattern.length
      const periodSum = testCase.pattern.reduce((a, b) => a + b, 0)

      // the declared zeroSum flag must match the arithmetic, so the case table cannot drift
      if ((periodSum === 0) !== testCase.zeroSum) {
        predictionHolds = false
      }

      const will = makeWill(mesh)

      fillPeriodicSlot({
        will,
        meshSide: MESH_SIDE,
        slot: SINK_SLOT,
        axis: 0,
        pattern: testCase.pattern,
      })

      const scan = continuityBlindSpotScan({
        will,
        collision: erasingCollision,
        meshSide: MESH_SIDE,
        blockSides: BLOCK_SIDES,
      })

      for (const point of scan) {
        const tiles = point.blockSide % period === 0
        const predictedBlind = tiles && testCase.zeroSum

        if (point.balanced !== predictedBlind) {
          predictionHolds = false
          mismatches++
        }

        if (point.balanced) {
          blindCount++
        }

        // the two single-condition failures, counted so the necessity of each is evidenced
        if (tiles && !testCase.zeroSum && !point.balanced) {
          tilingButNonzeroSeen++
        }

        if (!tiles && testCase.zeroSum && !point.balanced) {
          zeroSumButNotTilingSeen++
        }
      }
    }

    // both single-condition cases must actually occur, else the conjunction is untested
    const bothNecessityLegsPresent =
      tilingButNonzeroSeen > 0 && zeroSumButNotTilingSeen > 0

    // and blindness must genuinely occur somewhere, else the criterion is vacuous
    const blindnessOccurs = blindCount > 0

    const ok = predictionHolds && bothNecessityLegsPresent && blindnessOccurs

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the blindness of a coarse conservation test is predicted exactly by a conjunction of two conditions, that the block tiles whole periods of the destroyed quantity and that the quantity sums to zero over one period, verified with no mismatches across four periodic patterns and six block scales, with both single-condition failures actually occurring so the conjunction is tested rather than assumed, which also refutes the simpler guess that a shared factor between block side and period suffices, since a tiling block with a nonzero per-period sum is still seen',
      metrics: {
        meshSide: MESH_SIDE,
        cases: CASES.length,
        blockScales: BLOCK_SIDES.length,
        scansTotal: CASES.length * BLOCK_SIDES.length,
        blindCount,
        mismatches,
        predictionHolds: predictionHolds ? 1 : 0,
      },
      control: {
        tilingButNonzeroSeen,
        zeroSumButNotTilingSeen,
        bothNecessityLegsPresent: bothNecessityLegsPresent ? 1 : 0,
      },
      notes:
        'L2, a statement about the measuring instrument rather than about physics, and the practical payoff of E-MTH-0005. The value is that it converts a caveat into an admissibility rule: a coarse balance certifies microscopic conservation only when the destroyed quantity has a nonzero per-period sum at that scale or when the block fails to tile it, and otherwise one must measure at the finest scale or probe with a one-signed sink, which cannot sum to zero by construction. Worth recording that hypothesis one, plain commensurability, was REFUTED by measurement before hypothesis two was found: blindness showed up only at period 3 across periods 2 to 5, and the reason is that a ternary alphabet summing to zero over its full range makes a period-3 pattern automatically zero-sum, so the number three was the zero-sum condition in disguise. The two necessity legs are counted rather than assumed, so a conjunction is not being read off a single confirming case. Fully deterministic, four fixed patterns, no random source.',
    })
  },
})
