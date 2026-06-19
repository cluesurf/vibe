// D7 (L2): interference and forgetting as crosstalk. Store a family of overlapping words whose content
// separation we control. With few distinguishing slots the words overlap heavily, so exact queries return
// spurious responders and nearest recall confuses them. As the separation grows, recall recovers. Pass,
// recall is high for well-separated words and degrades for overlapping ones.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  makeAssociativeMemory,
  storeWord,
  readWord,
  searchExact,
  searchBest,
} from '@/code/operator/associative-memory'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a word that encodes its index in only the first `separation` slots, the rest a fixed shared background.
// Smaller separation means the words are content-near (heavy overlap), larger means well separated.
function overlappingWord(
  index: number,
  wordBits: number,
  separation: number,
): Int8Array {
  const word = new Int8Array(wordBits)
  // shared background, every word agrees here, this is the overlap
  for (let k = 0; k < wordBits; k++) {
    word[k] = (k * 2) % 3
  }
  // distinguishing slots encode the index in base 3
  let v = index
  for (let k = 0; k < separation && k < wordBits; k++) {
    word[k] = v % 3
    v = Math.floor(v / 3)
  }
  return word
}

function recallAtSeparation(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  wordBits: number
  count: number
  separation: number
}): {
  exactRecall: number
  nearestRecall: number
} {
  const mem = makeAssociativeMemory({
    neighbors: input.neighbors,
    wordBits: input.wordBits,
  })
  for (let i = 0; i < input.count; i++) {
    storeWord(
      mem,
      i,
      overlappingWord(i, input.wordBits, input.separation),
    )
  }
  let exactOk = 0
  let nearestOk = 0
  for (let i = 0; i < input.count; i++) {
    const cue = readWord(mem, i)
    const responders = searchExact({ mem, comparand: cue })
    if (responders.length === 1 && responders[0] === i) {
      exactOk++
    }
    if (searchBest({ mem, comparand: cue }).cell === i) {
      nearestOk++
    }
  }
  return {
    exactRecall: exactOk / input.count,
    nearestRecall: nearestOk / input.count,
  }
}

export function associativeInterference(input?: {
  maxCells?: number
  wordBits?: number
  count?: number
}): {
  count: number
  separations: number[]
  exactBySep: number[]
  nearestBySep: number[]
  lowSepRecall: number
  highSepRecall: number
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 800
  const wordBits = input?.wordBits ?? 21
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  // enough words that 1 distinguishing slot (3 values) cannot separate them, forcing crosstalk at low sep
  const count = input?.count ?? Math.min(g.cellCount, 200)

  const separations = [1, 2, 3, 5, 8]
  const exactBySep: number[] = []
  const nearestBySep: number[] = []
  for (const sep of separations) {
    const r = recallAtSeparation({
      neighbors: g.neighbors,
      wordBits,
      count,
      separation: sep,
    })
    exactBySep.push(r.exactRecall)
    nearestBySep.push(r.nearestRecall)
  }

  const lowSepRecall = exactBySep[0]!
  const highSepRecall = exactBySep[exactBySep.length - 1]!
  // well-separated words recall cleanly, heavily overlapping words suffer crosstalk
  const solved =
    highSepRecall > 0.95 &&
    lowSepRecall < 0.5 &&
    highSepRecall > lowSepRecall
  return {
    count,
    separations,
    exactBySep,
    nearestBySep,
    lowSepRecall,
    highSepRecall,
    solved,
  }
}

export default experiment({
  id: 'associative/interference',
  title:
    'interference and forgetting as crosstalk, overlapping memories confuse recall while well-separated ones recall cleanly',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = associativeInterference({ maxCells: 800 })
    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'storing words that share most of their content yields spurious responders and confused recall, while increasing the content separation restores clean exact and nearest recall',
      metrics: {
        count: r.count,
        lowSepExactRecall: r.lowSepRecall,
        highSepExactRecall: r.highSepRecall,
        lowSepNearestRecall: r.nearestBySep[0]!,
        highSepNearestRecall:
          r.nearestBySep[r.nearestBySep.length - 1]!,
      },
    })
  },
})
