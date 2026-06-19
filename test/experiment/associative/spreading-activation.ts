// D1 (the cognitive bridge, L3): spreading activation through semantic memory IS the bulk query wave. Store a
// word on every bulk cell, seed a cue at the central cell, and broadcast a wave. Activation arrival time at
// each cell equals its graph distance from the seed, and the whole store is reached in coverageRadius beats,
// which is O(log N) on the hyperbolic bulk. Control, a flat 3D cubic memory of equal N needs many more beats.
// Plan in note/research/vibe/notes/theory-v0.7.0/plans/associative-engine-architecture.md.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  cubicLattice,
  cubicLatticeCenterBySide,
} from '@/code/substrate/cubic-lattice'
import { bfsShells } from '@/code/measure/shells'
import {
  makeAssociativeMemory,
  ternaryWord,
  storeWord,
  broadcastWave,
} from '@/code/operator/associative-memory'
import { coverageRadius } from '@/code/measure/associative-recall'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function associativeSpreadingActivation(input?: {
  maxCells?: number
  wordBits?: number
}): {
  cellCount: number
  bulkCoverage: number
  cubicCoverage: number
  arrivalMatchesDistance: boolean
  monotone: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 1500
  const wordBits = input?.wordBits ?? 21

  // build the bulk, store a distinct word on every cell, seed the cue at the central cell
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const mem = makeAssociativeMemory({
    neighbors: g.neighbors,
    wordBits,
  })
  for (let c = 0; c < g.cellCount; c++) {
    storeWord(mem, c, ternaryWord(c, wordBits))
  }

  const seed = 0

  // every occupied cell is a potential responder, the wave reaches the whole store
  const responders: number[] = []
  for (let c = 0; c < g.cellCount; c++) {
    responders.push(c)
  }

  const wave = broadcastWave({
    neighbors: g.neighbors,
    seed,
    responders,
  })

  // activation arrival per cell must equal graph distance from the seed
  const distance = bfsShells({
    neighbors: g.neighbors,
    root: seed,
  }).depth
  let arrivalMatchesDistance = true
  for (let c = 0; c < g.cellCount; c++) {
    if (wave.arrivalBeat[c] !== distance[c]) {
      arrivalMatchesDistance = false
      break
    }
  }

  // arrival time increases monotonically with distance, the mean arrival per shell is strictly increasing
  const sums: number[] = []
  const counts: number[] = []
  for (let c = 0; c < g.cellCount; c++) {
    const d = distance[c]!
    if (d < 0) {
      continue
    }

    sums[d] = (sums[d] ?? 0) + wave.arrivalBeat[c]!
    counts[d] = (counts[d] ?? 0) + 1
  }

  let monotone = true
  let prev = -1
  for (let d = 0; d < sums.length; d++) {
    if (counts[d]) {
      const mean = sums[d]! / counts[d]!
      if (mean <= prev) {
        monotone = false
      }

      prev = mean
    }
  }

  const bulkCoverage = wave.coverageBeat

  // CONTROL: a flat 3D cubic memory of equal N, spreading from its center, needs many more beats
  const side = Math.max(2, Math.round(g.cellCount ** (1 / 3)))
  const lattice = cubicLattice(side, 3)
  const cubicCoverage = coverageRadius({
    neighbors: lattice.neighbors,
    seed: cubicLatticeCenterBySide({ side, dim: 3 }),
  })

  const solved =
    arrivalMatchesDistance && monotone && bulkCoverage < cubicCoverage

  return {
    cellCount: g.cellCount,
    bulkCoverage,
    cubicCoverage,
    arrivalMatchesDistance,
    monotone,
    solved,
  }
}

export default experiment({
  id: 'associative/spreading-activation',
  title:
    'spreading activation through semantic memory IS the bulk query wave, made logarithmic by hyperbolic geometry',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    const r = associativeSpreadingActivation({ maxCells: 1500 })

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'a cue seeded at the central bulk cell spreads as a query wave whose arrival time at each memory equals its graph distance and which reaches the whole store in far fewer beats than a flat cubic memory of equal size',
      metrics: {
        cellCount: r.cellCount,
        bulkCoverage: r.bulkCoverage,
        arrivalMatchesDistance: r.arrivalMatchesDistance ? 1 : 0,
        monotone: r.monotone ? 1 : 0,
      },
      control: {
        cubicCoverage: r.cubicCoverage,
        cellCount: r.cellCount,
      },
    })
  },
})
