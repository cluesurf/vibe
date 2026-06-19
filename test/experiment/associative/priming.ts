// D2 (L2): priming as residual activation. A prior wave pre-activates a region of the store. A later query
// for an item in that region resolves in fewer effective beats, because the query wave only has to travel to
// the nearest already-active cell, not all the way to the target. We model the primed latency as the graph
// distance from the query seed to the pre-activated frontier, and the unprimed latency as the full distance to
// the target. Pass, the primed query resolves in fewer beats than the unprimed.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { bfsShells, geodesicBall } from '@/code/measure/shells'
import { broadcastWave } from '@/code/operator/associative-memory'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function associativePriming(input?: {
  maxCells?: number
  primeRadius?: number
}): {
  cellCount: number
  target: number
  unprimedBeats: number
  primedBeats: number
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 1500
  const primeRadius = input?.primeRadius ?? 2
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const seed = 0
  const distFromSeed = bfsShells({
    neighbors: g.neighbors,
    root: seed,
  }).depth

  // pick a target deep in the store (a far cell), deterministic, the most distant cell
  let target = seed
  let far = -1
  for (let c = 0; c < g.cellCount; c++) {
    if (distFromSeed[c]! > far) {
      far = distFromSeed[c]!
      target = c
    }
  }

  // unprimed, the query wave must travel the full distance from the seed to the target
  const unprimed = broadcastWave({
    neighbors: g.neighbors,
    seed,
    responders: [target],
  })
  const unprimedBeats = unprimed.firstResponderBeat

  // priming, a prior wave pre-activates a region AROUND the target (a ball of primeRadius). The later query
  // is satisfied as soon as its wave reaches any pre-activated cell, so the effective latency is the distance
  // from the seed to the nearest primed cell.
  const primedRegion = geodesicBall({
    neighbors: g.neighbors,
    root: target,
    radius: primeRadius,
  })
  const primed = broadcastWave({
    neighbors: g.neighbors,
    seed,
    responders: primedRegion,
  })
  const primedBeats = primed.firstResponderBeat

  const solved =
    primedBeats >= 0 &&
    unprimedBeats >= 0 &&
    primedBeats < unprimedBeats
  return {
    cellCount: g.cellCount,
    target,
    unprimedBeats,
    primedBeats,
    solved,
  }
}

export default experiment({
  id: 'associative/priming',
  title:
    'priming as residual activation, a pre-activated region resolves a related query in fewer beats',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = associativePriming({ maxCells: 1500, primeRadius: 2 })
    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'pre-activating the region around a target memory with a prior wave lets a later query for that item resolve in fewer beats than the same query against an un-primed store',
      metrics: {
        cellCount: r.cellCount,
        unprimedBeats: r.unprimedBeats,
        primedBeats: r.primedBeats,
        savedBeats: r.unprimedBeats - r.primedBeats,
      },
    })
  },
})
