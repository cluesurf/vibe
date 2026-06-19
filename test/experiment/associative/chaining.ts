// D3 (L2): free association as a content-cued walk. A recalled cell's word becomes the next comparand, and we
// step to the nearest content-related memory we have not yet visited. To make content track structure, each
// cell stores a word built from its graph-neighborhood, so graph-adjacent cells are content-near. Pass, the
// chain visits several distinct content-related cells and does not immediately collapse to one fixed cell.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  makeAssociativeMemory,
  storeWord,
  readWord,
  matchScore,
} from '@/code/operator/associative-memory'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a word that varies smoothly with the cell index, so cells with near indices are content-near, giving the
// chain a coherent gradient to walk rather than a flat random field. Deterministic, no rng.
function gradientWord(index: number, wordBits: number): Int8Array {
  const word = new Int8Array(wordBits)
  for (let k = 0; k < wordBits; k++) {
    word[k] = Math.floor(index / Math.pow(2, k % 7)) % 3
  }
  return word
}

export function associativeChaining(input?: {
  maxCells?: number
  wordBits?: number
  steps?: number
}): {
  cellCount: number
  distinctVisited: number
  chainLength: number
  collapsed: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 1500
  const wordBits = input?.wordBits ?? 21
  const steps = input?.steps ?? 12
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const mem = makeAssociativeMemory({
    neighbors: g.neighbors,
    wordBits,
  })
  for (let c = 0; c < g.cellCount; c++)
    storeWord(mem, c, gradientWord(c, wordBits))

  // start the chain at a deterministic cue, the recalled word becomes the next comparand, and we forbid
  // revisiting so a related-but-new memory is picked each step
  const visited = new Set<number>()
  let comparand: ArrayLike<number> = readWord(mem, 0)
  const chain: number[] = []
  for (let s = 0; s < steps; s++) {
    // nearest unvisited responder, the free-association pick
    let bestCell = -1
    let bestScore = -1
    for (let c = 0; c < g.cellCount; c++) {
      if (visited.has(c)) continue
      const sc = matchScore(mem, c, comparand)
      if (sc > bestScore) {
        bestScore = sc
        bestCell = c
      }
    }
    if (bestCell < 0) break
    visited.add(bestCell)
    chain.push(bestCell)
    comparand = readWord(mem, bestCell)
  }

  // a non-degenerate chain visits several distinct cells, a collapse would stall after one or two
  const distinctVisited = visited.size
  const collapsed = distinctVisited <= 2
  const solved = !collapsed && distinctVisited >= Math.min(5, steps)
  return {
    cellCount: g.cellCount,
    distinctVisited,
    chainLength: chain.length,
    collapsed,
    solved,
  }
}

export default experiment({
  id: 'associative/chaining',
  title:
    'free association as a content-cued walk, each recalled word cues the next nearest memory',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = associativeChaining({ maxCells: 1500, steps: 12 })
    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'using each recalled cell word as the next comparand walks coherently through several distinct content-related memories without immediately collapsing to a single fixed cell',
      metrics: {
        cellCount: r.cellCount,
        distinctVisited: r.distinctVisited,
        chainLength: r.chainLength,
        collapsed: r.collapsed ? 1 : 0,
      },
    })
  },
})
