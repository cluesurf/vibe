// The gravity falloff exponent alpha in phi ~ r^(-alpha), measured from the
// screened graph-Laplacian Green's function. A 3D Coulomb / Newtonian potential has
// alpha = 1. The potential is solved from a unit source, shell-averaged by graph
// distance, and the negative log-log slope of phi against r over a mid-distance
// window [rLo, rHi] is the exponent (so the screening tail and the central spike are
// excluded). Returns NaN when fewer than three usable shells fall in the window.

import { screenedGreensFunction } from '@/code/operator/screened-greens-function'
import { bfsShells } from '@/code/measure/shells'
import { linearFit } from '@/code/measure/regression'

export function gravityExponent(input: {
  neighbors: number[][]
  start: number
  mass2?: number
  iterations?: number
  rLo?: number
  rHi?: number
}): number {
  const { neighbors, start } = input
  const mass2 = input.mass2 ?? 0.004
  const iterations = input.iterations ?? 3000
  const rLo = input.rLo ?? 2
  const rHi = input.rHi ?? 6
  const phi = screenedGreensFunction({
    neighbors,
    start,
    mass2,
    iterations,
  })

  const dist = bfsShells({ neighbors, root: start }).depth
  const sums: number[] = []
  const cnts: number[] = []

  for (let i = 0; i < neighbors.length; i++) {
    const r = dist[i]!

    if (r < 0) {
      continue
    }

    sums[r] = (sums[r] ?? 0) + phi[i]!
    cnts[r] = (cnts[r] ?? 0) + 1
  }

  const xs: number[] = []
  const ys: number[] = []

  for (let r = rLo; r <= rHi; r++) {
    if (cnts[r]) {
      xs.push(Math.log(r))
      ys.push(Math.log(sums[r]! / cnts[r]!))
    }
  }

  if (xs.length < 3) {
    return NaN
  }

  return -linearFit({ xs, ys }).slope // alpha in phi ~ r^-alpha
}
