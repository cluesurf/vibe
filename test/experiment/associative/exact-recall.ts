// A1: the content-addressable memory core works on the {3,4,3,4} bulk. Store a distinct word on every cell,
// query each by exact content, and every query returns its one cell with no false positives. This is the
// base-layer associative search (a parallel match), compatible with the reversible rule. Plan in
// note/research/vibe/notes/theory-v0.7.0/plans/associative-engine-architecture.md.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'
import {
  makeAssociativeMemory,
  ternaryWord,
  storeWord,
} from '@/code/operator/associative-memory'
import {
  exactRecallRate,
  falsePositiveRate,
} from '@/code/measure/associative-recall'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function associativeExactRecall(input?: {
  maxCells?: number
  wordBits?: number
}): {
  cellCount: number
  recall: number
  falsePositive: number
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 1500
  const wordBits = input?.wordBits ?? 21
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const mem = makeAssociativeMemory({
    neighbors: g.neighbors,
    wordBits,
  })

  for (let c = 0; c < g.cellCount; c++)
    storeWord(mem, c, ternaryWord(c, wordBits))

  const recall = exactRecallRate(mem)
  const falsePositive = falsePositiveRate({
    mem,
    trials: 2000,
    rng: makeRng({ seed: 1 }),
  })

  return {
    cellCount: g.cellCount,
    recall,
    falsePositive,
    solved: recall === 1 && falsePositive < 0.01,
  }
}

export default experiment({
  id: 'associative/exact-recall',
  code: 'E-MMR-0005',
  title:
    'a content-addressable memory on the {3,4,3,4} bulk recalls every stored word exactly with no false positives',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = associativeExactRecall({ maxCells: 1500 })

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'storing a distinct word on every bulk cell and querying by exact content returns the unique correct cell every time, with near-zero false positives on random queries',
      metrics: {
        cellCount: r.cellCount,
        recall: r.recall,
        falsePositive: r.falsePositive,
      },
    })
  },
})
