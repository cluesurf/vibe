// Whether the Kahler-Dirac fermion on a given cell graph PROPAGATES (the extended phase) or LOCALIZES.
// Build D = d + delta on the graph, evolve a localized excitation from the most-connected cell, and return
// the time-averaged quantum return probability for the clean operator and for one with a strong
// deterministic Aubry-Andre quasiperiodic potential (the localization control, no randomness). A LOW clean
// return means the fermion spreads and does not come back, the propagating signature. A HIGH localized
// return means disorder traps it. Shared by the {5,3,4} and pentacomb propagation experiments.

import { sparseWithAubryAndrePotential } from '@/code/algebra/linear/sparse'
import { cellComplexOf, kahlerDirac } from '@/code/operator/dirac'
import { returnProbability } from '@/code/measure/localization'
import { makeGraph } from '@/code/tool/graph'

export function kahlerDiracReturn(input: {
  neighbors: number[][]
  disorderStrength?: number
  steps?: number
  dt?: number
}): { clean: number; localized: number; normDrift: number } {
  const { neighbors } = input
  const graph = makeGraph({
    size: neighbors.length,
    directed: false,
    neighbors,
  })

  const dirac = kahlerDirac({
    complex: cellComplexOf({ substrate: graph, maxGrade: 1 }),
  })

  let source = 0
  let best = -1

  for (let i = 0; i < neighbors.length; i++) {
    if (neighbors[i]!.length > best) {
      best = neighbors[i]!.length
      source = i
    }
  }

  // dt well below 2 / ||H|| so the leapfrog stays near-unitary; total time steps * dt is the physical window
  const evolve = {
    source,
    steps: input.steps ?? 570,
    dt: input.dt ?? 0.02,
    sampleEvery: 30,
  }

  const clean = returnProbability({
    operator: sparseWithAubryAndrePotential(dirac, 0),
    ...evolve,
  })

  const localized = returnProbability({
    operator: sparseWithAubryAndrePotential(
      dirac,
      input.disorderStrength ?? 8,
    ),
    ...evolve,
  })

  return {
    clean: clean.timeAverage,
    localized: localized.timeAverage,
    normDrift: Math.max(clean.normDrift, localized.normDrift),
  }
}
