// B3: the memory is ASSOCIATIVE, it recalls the whole stored word from a corrupted cue. Query each stored
// word with a fraction of its slots flipped and take the nearest-content responder. Recall stays high up to a
// corruption threshold, then declines gracefully. This is the defining associative property, recall from a
// fragment. Base-layer (a nearest-content search, no attractor relaxation needed).

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'
import {
  makeAssociativeMemory,
  ternaryWord,
  storeWord,
} from '@/code/operator/associative-memory'
import { nearestRecallRate } from '@/code/measure/associative-recall'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function associativeNoisyRecall(input?: {
  maxCells?: number
  wordBits?: number
  sampleSize?: number
}): {
  recall0: number
  recall10: number
  recall20: number
  recall40: number
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 1500
  const wordBits = input?.wordBits ?? 21
  const sampleSize = input?.sampleSize ?? 300
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const mem = makeAssociativeMemory({
    neighbors: g.neighbors,
    wordBits,
  })

  for (let c = 0; c < g.cellCount; c++) {
    storeWord(mem, c, ternaryWord(c, wordBits))
  }

  const sample: number[] = []

  for (let c = 0; c < g.cellCount && sample.length < sampleSize; c++) {
    sample.push(c)
  }

  const at = (f: number): number =>
    nearestRecallRate({
      mem,
      corruptionFraction: f,
      rng: makeRng({ seed: 1 }),
      sample,
    })

  const recall0 = at(0)
  const recall10 = at(0.1)
  const recall20 = at(0.2)
  const recall40 = at(0.4)
  const solved = recall0 === 1 && recall10 > 0.9 && recall40 < recall10

  return { recall0, recall10, recall20, recall40, solved }
}

export default experiment({
  id: 'associative/noisy-recall',
  title:
    'the bulk associative memory recalls a whole stored word from a corrupted cue, degrading gracefully past a threshold',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = associativeNoisyRecall({ maxCells: 1500 })

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'querying with a partially corrupted comparand and taking the nearest-content responder recovers the right word at high rate up to a corruption threshold, then declines gracefully, the defining associative property',
      metrics: {
        recallClean: r.recall0,
        recall10pct: r.recall10,
        recall20pct: r.recall20,
        recall40pct: r.recall40,
      },
    })
  },
})
