// Packet dispersal on a graph, the measure behind the cusp-observer stability theorem. A localized
// excitation spread by a lazy random walk disperses at a rate set by the geometry: on a curved
// (hyperbolic, non-amenable) graph the surrounding space grows exponentially, so the packet spreads
// over exponentially many cells and escapes fast, while on a flat (amenable) lattice it spreads
// slowly. So a stable bound state, which an observer needs, persists on the flat cusp but disperses
// in the curved bulk. This module runs the diffusion and reads the participation number (the
// effective number of cells the packet occupies) and the return probability, degree-controlled so
// the difference is curvature, not connectivity.

import { d4Mesh } from '@/code/tool/mesh'

// the flat 24-neighbour D4 lattice neighbour list (the flat cusp analogue of the {3,4,3,4} bulk,
// same degree, so a fair curved-versus-flat comparison)
export function d4FlatNeighbors(side: number): number[][] {
  const mesh = d4Mesh({ side })
  const neighbors: number[][] = []

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const row: number[] = []

    for (let direction = 0; direction < mesh.degree; direction++) {
      row.push(mesh.neighbour(cell, direction))
    }

    neighbors.push(row)
  }

  return neighbors
}

// spread a delta at `center` by a lazy random walk (stay with probability one half, else step to a
// uniform neighbour) for `steps` steps, and read the return probability (mass still at the center)
// and the participation number (one over the sum of squared masses, the effective spread).
export function diffuseParticipation(input: {
  neighbors: readonly (readonly number[])[]
  center: number
  steps: number
}): { returnProbability: number; participation: number } {
  const { neighbors, center, steps } = input
  const n = neighbors.length

  let probability = new Float64Array(n)

  probability[center] = 1

  for (let t = 0; t < steps; t++) {
    const next = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      const mass = probability[i]!

      if (mass === 0) {
        continue
      }

      next[i]! += 0.5 * mass

      const row = neighbors[i]!
      const share = (0.5 * mass) / row.length

      for (const j of row) {
        next[j]! += share
      }
    }

    probability = next
  }

  let sumSquares = 0

  for (const value of probability) {
    sumSquares += value * value
  }

  return {
    returnProbability: probability[center]!,
    participation: sumSquares === 0 ? 0 : 1 / sumSquares,
  }
}

// the return-probability decay rate (the spectral radius) over a window, rho = (p(to)/p(from)) ^
// (1/(to-from)). This is a SIZE-INDEPENDENT bulk spectral property: on a non-amenable (hyperbolic)
// graph rho is bounded below one (a spectral gap, exponential screening), and on an amenable (flat)
// graph rho tends to one (no gap). The screening mass is -ln(rho). Unlike a finite-graph Green's
// function, rho does not depend on the graph size (before the walk reaches the boundary).
export function returnProbabilityDecayRate(input: {
  neighbors: readonly (readonly number[])[]
  from: number
  to: number
}): number {
  const { neighbors, from, to } = input
  const pFrom = diffuseParticipation({
    neighbors,
    center: 0,
    steps: from,
  }).returnProbability

  const pTo = diffuseParticipation({
    neighbors,
    center: 0,
    steps: to,
  }).returnProbability

  if (pFrom <= 0 || pTo <= 0) {
    return 1
  }

  return Math.pow(pTo / pFrom, 1 / (to - from))
}
