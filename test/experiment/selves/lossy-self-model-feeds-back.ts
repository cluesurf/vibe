// What a self's lossy model throws away is not gone, it stays in the full state and feeds
// back into the determined outcome.
//
// A self does not read its world completely. It reads a compressed summary, a coarse model,
// and acts on that. The worry is that the discarded detail is then irrelevant. The answer
// modeled here is the opposite: detail that the coarse model literally cannot see still
// changes the choice, because the dynamics runs on the full micro-state, not on the summary.
//
// We build pairs of micro-states that are IDENTICAL under the self's coarse read (every block
// has the same sign) but DIFFER in their micro arrangement. We settle both under the same self
// and urge. If the outcomes diverge, then information invisible to the model has fed back into
// the determined result. The control is the structureless self (coupling 0): there the outcome
// is the urge alone, the start does not matter, and the hidden detail cannot feed back.
//
// L3: a single deterministic rule turns model-invisible micro-detail into a different outcome,
// with a control that gives no such divergence. It is a model of selves, not a base-emergence
// claim. Run via the suite: npx tsx test/run.ts

import {
  makeSelfPattern,
  settle,
  blockCoarse,
  coarseEqual,
  hammingFraction,
  ternaryPattern,
} from '@/code/model/deliberation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// shift each coarse block's entries cyclically by one. This preserves every block's tone sum
// exactly (it is a permutation within the block) so the coarse read is unchanged, while the
// micro arrangement, which the dynamics actually sees, changes.
function shiftWithinBlocks(
  state: Int8Array,
  blocks: number,
): Int8Array {
  const n = state.length
  const size = Math.ceil(n / blocks)
  const out = Int8Array.from(state)

  for (let b = 0; b < blocks; b++) {
    const lo = b * size
    const hi = Math.min(n, (b + 1) * size)

    if (hi - lo >= 2) {
      const last = out[hi - 1]!

      for (let i = hi - 1; i > lo; i--) {
        out[i] = out[i - 1]!
      }

      out[lo] = last
    }
  }

  return out
}

export function lossyModelFeedsBack(input: {
  n: number
  blocks: number
}): {
  allCoarseEqual: boolean
  divergenceWithSelf: number
  divergenceNoSelf: number
} {
  const n = input.n

  let allCoarseEqual = true
  let divergeWithSelf = 0
  let divergeNoSelf = 0

  // fully DETERMINISTIC construction (golden-ratio patterns at distinct, decorrelated offsets, no seed);
  // robustness comes from varying the SIZE n, never from averaging over a random ensemble.
  {
    const self = makeSelfPattern({ n, patterns: 3, offset: 300 })
    const urge = ternaryPattern(n, 8000)

    // two starts the coarse model cannot tell apart
    const startA = ternaryPattern(n, 9000)
    const startB = shiftWithinBlocks(startA, input.blocks)

    if (
      !coarseEqual(
        blockCoarse(startA, input.blocks),
        blockCoarse(startB, input.blocks),
      )
    ) {
      allCoarseEqual = false
    }

    // with a real self: the micro arrangement steers which basin is reached
    const a1 = settle({
      patterns: self,
      coupling: 2,
      urge,
      urgeWeight: 1,
      init: startA,
    }).state

    const b1 = settle({
      patterns: self,
      coupling: 2,
      urge,
      urgeWeight: 1,
      init: startB,
    }).state

    if (hammingFraction(a1, b1) > 0.05) {
      divergeWithSelf++
    }

    // control: no self. The outcome is the urge sign regardless of the start, so the hidden
    // micro-detail cannot feed back.
    const a0 = settle({
      patterns: self,
      coupling: 0,
      urge,
      urgeWeight: 1,
      init: startA,
    }).state

    const b0 = settle({
      patterns: self,
      coupling: 0,
      urge,
      urgeWeight: 1,
      init: startB,
    }).state

    if (hammingFraction(a0, b0) > 0.05) {
      divergeNoSelf++
    }
  }

  return {
    allCoarseEqual,
    divergenceWithSelf: divergeWithSelf,
    divergenceNoSelf: divergeNoSelf,
  }
}

export default experiment({
  id: 'selves/lossy-self-model-feeds-back',
  code: 'E-SLF-0069',
  title:
    'detail a self cannot see in its coarse model still feeds back into its determined choice',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    // robustness by varying the SIZE (never averaging over a seed): the conditions must hold at each n
    const sizes = [60, 90, 120]
    const runs = sizes.map(n => lossyModelFeedsBack({ n, blocks: 6 }))

    const coarseTrulyBlind = runs.every(r => r.allCoarseEqual)
    const feedsBackWithSelf = runs.every(
      r => r.divergenceWithSelf === 1,
    )

    const noFeedbackInControl = runs.every(
      r => r.divergenceNoSelf === 0,
    )

    const ok =
      coarseTrulyBlind && feedsBackWithSelf && noFeedbackInControl

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'micro-detail that the self coarse read cannot distinguish changes the settled choice under a real self, while a structureless self shows no such divergence',
      metrics: {
        divergenceWithSelf: last.divergenceWithSelf,
        coarseBlind: last.allCoarseEqual ? 1 : 0,
      },
      control: {
        divergenceNoSelf: last.divergenceNoSelf,
      },
      notes:
        'L3 on the deliberation model. the lost-to-the-model information is retained in the full state and feeds back, it is not a base-substrate emergence claim',
    })
  },
})
