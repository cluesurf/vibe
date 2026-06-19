// D4 (L2): graceful, graded recall. Query stored words with cues of decreasing completeness, masking more and
// more slots as don't-care, and measure fidelity, the fraction of cells whose own (partial) cue still returns
// that cell as the nearest content. Pass, fidelity degrades smoothly as the cue shrinks, not as a cliff.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  makeAssociativeMemory,
  storeWord,
  readWord,
  searchBest,
} from '@/code/operator/associative-memory'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a REDUNDANT distributed word, each slot is an independent ternary hash of the cell index, so the cell's
// identity is spread evenly across all slots rather than packed into the low ones. This is the human-like
// distributed representation, any subset of slots carries partial identity, so a partial cue degrades
// gracefully instead of crossing a sharp information-capacity cliff. Deterministic, no rng.
function distributedWord(index: number, wordBits: number): Int8Array {
  const word = new Int8Array(wordBits)
  let h = Math.imul(index + 1, 2654435761) >>> 0
  for (let k = 0; k < wordBits; k++) {
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0
    // read the well-mixed high byte, so each slot is an independent ternary symbol
    word[k] = (h >>> 24) % 3
  }
  return word
}

// keep the first `keep` slots of the word as a cue and mark the rest don't-care, a deterministic partial cue.
function partialMask(wordBits: number, keep: number): Int8Array {
  const mask = new Int8Array(wordBits)
  for (let k = 0; k < keep && k < wordBits; k++) mask[k] = 1
  return mask
}

export function associativeGradedRecall(input?: {
  maxCells?: number
  wordBits?: number
}): {
  cellCount: number
  fidelityByKeep: number[]
  maxDrop: number
  monotone: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 1200
  const wordBits = input?.wordBits ?? 21
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const mem = makeAssociativeMemory({
    neighbors: g.neighbors,
    wordBits,
  })
  for (let c = 0; c < g.cellCount; c++)
    storeWord(mem, c, distributedWord(c, wordBits))

  // sweep the cue size one slot at a time, from a full cue down to a single slot, so the degradation is
  // sampled finely. A real cliff would show one near-1-to-near-0 step, a graceful decline shows small steps.
  const fidelityByKeep: number[] = []
  for (let keep = wordBits; keep >= 1; keep--) {
    const mask = partialMask(wordBits, keep)
    let ok = 0
    let total = 0
    for (let c = 0; c < g.cellCount; c++) {
      total++
      const cue = readWord(mem, c)
      if (searchBest({ mem, comparand: cue, mask }).cell === c) ok++
    }
    fidelityByKeep.push(total > 0 ? ok / total : 0)
  }

  // smooth degradation, no single step drops fidelity by more than a threshold (a cliff)
  let maxDrop = 0
  for (let i = 1; i < fidelityByKeep.length; i++) {
    const drop = fidelityByKeep[i - 1]! - fidelityByKeep[i]!
    if (drop > maxDrop) maxDrop = drop
  }
  // fidelity should not increase as the cue shrinks
  let monotone = true
  for (let i = 1; i < fidelityByKeep.length; i++) {
    if (fidelityByKeep[i]! > fidelityByKeep[i - 1]! + 1e-9)
      monotone = false
  }

  const solved =
    monotone &&
    maxDrop < 0.5 &&
    fidelityByKeep[0]! > 0.99 &&
    fidelityByKeep[fidelityByKeep.length - 1]! < fidelityByKeep[0]!
  return {
    cellCount: g.cellCount,
    fidelityByKeep,
    maxDrop,
    monotone,
    solved,
  }
}

export default experiment({
  id: 'associative/graded-recall',
  title:
    'graceful, graded recall, fidelity degrades smoothly as the cue shrinks',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = associativeGradedRecall({ maxCells: 1200 })
    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        "masking more and more of a content cue as don't-care lowers recall fidelity smoothly and monotonically, the human-like graded-recall property rather than an all-or-nothing cliff",
      metrics: {
        cellCount: r.cellCount,
        fidelityFull: r.fidelityByKeep[0]!,
        fidelitySparse: r.fidelityByKeep[r.fidelityByKeep.length - 1]!,
        maxDrop: r.maxDrop,
        monotone: r.monotone ? 1 : 0,
      },
    })
  },
})
