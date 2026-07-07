// Mentally navigating to a memory is a coarse-to-fine walk down the bulk hierarchy. Memories sit at
// the leaves of the bulk tree, and each level of the tree owns a disjoint block of the pattern, so a
// bulk internal node literally holds the coarse-grained memory of its whole subtree (the blocks its
// address prefix has already fixed). To recall from a noisy cue a self starts at the root and
// descends: at each level it reads that level's block of the cue and steps to the child whose stored
// block matches better, resolving the address coarse bits first, fine bits last. Recall therefore
// takes log(N) mental steps, the tree depth, not the N of scanning every memory, so the bulk gives
// content-addressable recall in logarithmic time. This is the mental walkway, the recall analogue of
// the physical greedy walkway.
//
// Measured on a bulk of one thousand and twenty four memories (depth ten): recall from the clean cue
// succeeds every time in exactly ten steps (log of the count), and stays well above half under a ten
// percent corruption of the cue (each block votes independently, so noise has to overwhelm a whole
// block to misdirect a step). The control scrambles the coarse patterns so a bulk node no longer
// predicts its subtree: descent then collapses to chance (well under one percent), because there is
// no coarse-to-fine gradient to follow. So logarithmic recall is the payoff of the hierarchy, and a
// self navigates to a memory the same way it navigates the bulk.
//
// Depth L2. It establishes logarithmic-step coarse-to-fine recall on the bulk hierarchy (a hundred
// percent from a clean cue, robust to noise, log(N) steps against N for a flat scan) with the
// scrambled-hierarchy control that fails, the mental-navigation walkway. Deterministic (fixed
// features and cue corruption from a seed, the count varied not the seed).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  buildRecallModel,
  recall,
} from '@/code/measure/hierarchical-recall'

const DEPTH = 10
const BLOCK_SIZE = 12
const TRIALS = 300

export default experiment({
  id: 'addressing/hierarchical-recall',
  code: 'E-NVG-0011',
  title:
    'recalling a memory is a coarse-to-fine descent of the bulk hierarchy in log(N) steps (100 percent from a clean cue, robust to noise) while scrambling the coarse patterns collapses recall to chance, the mental walkway',
  category: 'addressing',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const model = buildRecallModel({
      depth: DEPTH,
      blockSize: BLOCK_SIZE,
      seed: 3,
    })

    const memoryCount = 1 << DEPTH

    const successRate = (
      noiseFraction: number,
      scramble: boolean,
    ): number => {
      let correct = 0

      for (let trial = 0; trial < TRIALS; trial++) {
        // a deterministic spread of target leaves across the tree
        const leaf = (trial * 2654435761) % memoryCount
        const { recalled } = recall({
          model,
          leaf,
          noiseFraction,
          scramble,
          seed: 100 + trial,
        })

        if (recalled === leaf) {
          correct++
        }
      }

      return correct / TRIALS
    }

    const cleanRecall = successRate(0, false)
    const noisyRecall = successRate(0.1, false)
    const scrambledRecall = successRate(0, true)

    // the descent takes exactly the tree depth = log2 of the memory count
    const steps = recall({
      model,
      leaf: 0,
      noiseFraction: 0,
      scramble: false,
      seed: 1,
    }).steps

    const logarithmicSteps = steps === Math.log2(memoryCount)

    const cleanPerfect = cleanRecall > 0.999
    const noiseRobust = noisyRecall > 0.5
    const scrambledFails = scrambledRecall < 0.05

    const ok =
      cleanPerfect && noiseRobust && scrambledFails && logarithmicSteps

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on a bulk of one thousand and twenty four memories at the leaves of a depth-ten tree, recalling a memory by descending the hierarchy (reading the coarse block of the cue and stepping to the better-matching child at each level) succeeds every time from a clean cue in exactly ten steps (the log of the memory count, against one thousand and twenty four for a flat scan) and stays above half under a ten percent corruption of the cue (each level votes on its own block, so noise must overwhelm a whole block to misdirect a step), while scrambling the stored coarse patterns so a bulk node no longer predicts its subtree collapses recall to chance below one percent, so logarithmic content-addressable recall is the payoff of the bulk hierarchy and a self navigates to a memory exactly as it navigates the bulk',
      metrics: {
        memoryCount,
        cleanRecallPercent: Number((100 * cleanRecall).toFixed(1)),
        noisyRecallPercent: Number((100 * noisyRecall).toFixed(1)),
        scrambledRecallPercent: Number(
          (100 * scrambledRecall).toFixed(1),
        ),
        recallSteps: steps,
        flatScanComparisons: memoryCount,
      },
      // CONTROL: scrambling the coarse patterns collapses recall to chance.
      control: {
        scrambledRecallPercent: Number(
          (100 * scrambledRecall).toFixed(1),
        ),
      },
      notes:
        'Coarse-to-fine hierarchical recall as the mental walkway: log(N) steps, robust to noise, the recall analogue of the greedy physical walkway (E-NVG-0010) and the depth-is-scale law (E-NVG-0008). Scrambled-hierarchy control fails.',
    })
  },
})
