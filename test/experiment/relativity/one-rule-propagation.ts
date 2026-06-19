// P37: one rule, causal propagation (deepening the capstone).
// P34 read geometry, the Hamiltonian, and the arrow off one mesh, but each physics
// sector still used its own operator. The first step of the deeper integration is to
// show the MICROSCOPIC RULE ITSELF, the ternary signed-majority update, carries the
// signal sector: a disturbance propagates causally, at finite speed, with a strict
// light-cone. We perturb one vibe and run two copies of the same dynamics in lockstep,
// and measure how far the difference can reach by each beat.
// See note/the-model.md. Run: npx tsx code/experiment/p37-one-rule-propagation.ts

import { makeRng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import {
  Graph,
  mostConnectedNode,
  neighborsOf,
} from '@/code/tool/graph'
import { bfsShells } from '@/code/measure/shells'
import {
  symmetricEdgeFills,
  signedMajorityStep,
} from '@/code/operator/signed-majority'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Graph-distance from a source by breadth-first search.
function distancesFrom(g: Graph, source: number): Int32Array {
  return bfsShells({ neighbors: neighborsOf(g), root: source }).depth
}

export function propagation(input: {
  count: number
  beats: number
  seed: number
}): {
  frontRadius: number[]
  lightConeHolds: boolean
  frontAdvances: boolean
} {
  const rng = makeRng({ seed: input.seed })
  const g = hyperbolicGraph({
    count: input.count,
    radius: 7,
    connectThreshold: 3.0,
    rng,
  })

  const fills = symmetricEdgeFills({
    neighbors: g.neighbors,
    rng: makeRng({ seed: input.seed + 1 }),
  })

  // A central source (most-connected node).
  const source = mostConnectedNode(g.neighbors)
  const dist = distancesFrom(g, source)

  // Random initial state, then the perturbed copy flips the source.
  let toneA = new Int8Array(g.size)

  for (let i = 0; i < g.size; i++) {
    toneA[i] = rng.nextInt({ max: 3 }) - 1
  }

  let toneB = Int8Array.from(toneA)
  toneB[source] = (((toneA[source] ?? 0) + 1 + 1) % 3) - 1 // guaranteed different ternary value

  const frontRadius: number[] = []

  let lightConeHolds = true

  for (let beat = 1; beat <= input.beats; beat++) {
    toneA = signedMajorityStep({
      neighbors: g.neighbors,
      fills,
      tone: toneA,
    })
    toneB = signedMajorityStep({
      neighbors: g.neighbors,
      fills,
      tone: toneB,
    })
    let maxDist = 0

    for (let v = 0; v < g.size; v++) {
      if (toneA[v] !== toneB[v]) {
        maxDist = Math.max(maxDist, dist[v] ?? 0)
      }
    }

    frontRadius.push(maxDist)

    // The light-cone bound: nothing can differ beyond graph-distance equal to the beat.
    if (maxDist > beat) {
      lightConeHolds = false
    }
  }

  const frontAdvances = (frontRadius[2] ?? 0) > (frontRadius[0] ?? 0)

  return { frontRadius, lightConeHolds, frontAdvances }
}

export default experiment({
  id: 'relativity/one-rule-propagation',
  title: 'the ternary rule carries a causal light-cone at finite speed',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = propagation({ count: 600, beats: 8, seed: 1 })
    const ok = r.lightConeHolds && r.frontAdvances

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a disturbance from the ternary rule never outruns one hop per beat and the front advances',
      metrics: {
        beats: r.frontRadius.length,
        finalFrontRadius: r.frontRadius[r.frontRadius.length - 1] ?? 0,
        lightConeHolds: r.lightConeHolds ? 1 : 0,
        frontAdvances: r.frontAdvances ? 1 : 0,
      },
    })
  },
})
