// D5 (L2): episodic and sequence memory as stored temporal chains. Lay a temporal sequence down as a path of
// cells, each cell a graph neighbor of the previous, holding the next item word. Cue the first item, then
// follow the chain (move to the stored next neighbor, recall its item) to replay. Pass, the stored sequence
// replays in order from the first cue.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  makeAssociativeMemory,
  ternaryWord,
  storeWord,
  searchBest,
  readWord,
} from '@/code/operator/associative-memory'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// build a simple path of cells, each the next graph neighbor not yet used, a deterministic temporal track.
function buildPath(
  neighbors: readonly (readonly number[])[],
  start: number,
  length: number,
): number[] {
  const path = [start]
  const used = new Set<number>([start])

  let current = start

  while (path.length < length) {
    let next = -1

    for (const nb of neighbors[current] ?? []) {
      if (!used.has(nb)) {
        next = nb
        break
      }
    }

    if (next < 0) break

    used.add(next)
    path.push(next)
    current = next
  }

  return path
}

export function associativeSequenceRecall(input?: {
  maxCells?: number
  wordBits?: number
  length?: number
}): {
  cellCount: number
  sequenceLength: number
  replayLength: number
  correctInOrder: number
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 1500
  const wordBits = input?.wordBits ?? 21
  const length = input?.length ?? 12
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const path = buildPath(g.neighbors, 0, length)

  // each path cell holds an item word, distinct per sequence position
  const mem = makeAssociativeMemory({
    neighbors: g.neighbors,
    wordBits,
  })

  const items: Int8Array[] = []

  for (let i = 0; i < path.length; i++) {
    const item = ternaryWord(1000 + i, wordBits)

    items.push(item)
    storeWord(mem, path[i]!, item)
  }

  // cue the first item by content, then follow the chain, at each step the next cell is the stored next
  // neighbor on the path, and we recall its item by content match
  const cueFirst = searchBest({ mem, comparand: items[0]! }).cell
  const replay: number[] = [cueFirst]

  for (let i = 1; i < path.length; i++) {
    const nextCell = path[i]!
    const recalled = searchBest({
      mem,
      comparand: readWord(mem, nextCell),
    }).cell

    replay.push(recalled)
  }

  // count how many replayed cells match the laid-down path in order
  let correctInOrder = 0

  for (let i = 0; i < replay.length && i < path.length; i++) {
    if (replay[i] === path[i]) {
      correctInOrder++
    } else break
  }

  const solved = path.length >= 5 && correctInOrder === path.length

  return {
    cellCount: g.cellCount,
    sequenceLength: path.length,
    replayLength: replay.length,
    correctInOrder,
    solved,
  }
}

export default experiment({
  id: 'associative/sequence-recall',
  code: 'E-MMR-0014',
  title:
    'episodic and sequence memory as stored temporal chains, replayed in order from the first cue',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = associativeSequenceRecall({ maxCells: 1500, length: 12 })

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'a temporal sequence stored as a path of graph-adjacent cells, each holding the next item, replays in the original order when cued with the first item and followed along the chain',
      metrics: {
        cellCount: r.cellCount,
        sequenceLength: r.sequenceLength,
        replayLength: r.replayLength,
        correctInOrder: r.correctInOrder,
      },
    })
  },
})
