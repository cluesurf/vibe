// P16: the Newtonian limit (a first rung of gravity beyond the action).
// The gravitational action makes spacetime a stable phase (P2). A theory of
// gravity also needs the weak-field potential. The static potential of a source
// is the Green's function of the emergent Laplacian, L^{-1}. In the continuum that
// falls as 1/r^(d-2) in d spatial dimensions: linear (confining) in 1D, log in 2D,
// and 1/r (Newtonian) in 3D. We compute it on the mesh and check it matches.
// This is one rung. The full Einstein equations and the graviton are the long road
// (see note/questions/next-version.md P16). Run: npx tsx code/experiment/p16-newtonian.ts

import { cubicLattice, CubicLattice } from '@/code/substrate/cubic-lattice'
import { graphLaplacianGreensFunction } from '@/code/operator/graph-laplacian'
import { fitForm } from '@/code/measure/regression'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Lat = CubicLattice

function centerNode(lat: Lat, side: number): number {
  const mid = Math.floor(side / 2)
  let j = 0
  let place = 1
  for (let a = 0; a < lat.dim; a++) {
    j += mid * place
    place *= side
  }
  return j
}

function distance(lat: Lat, i: number, j: number): number {
  let s = 0
  for (let a = 0; a < lat.dim; a++) {
    const d = (lat.coords[i * lat.dim + a] ?? 0) - (lat.coords[j * lat.dim + a] ?? 0)
    s += d * d
  }
  return Math.sqrt(s)
}

// The static potential phi = L^{-1} (source) is the graph Laplacian Green's function
// of a unit charge at the center against a uniform neutral background. This is the
// Poisson equation on the mesh, the weak-field limit. We then bin it by distance.
export function potentialProfile(input: { lat: Lat; side: number }): { r: number[]; phi: number[] } {
  const lat = input.lat
  const n = lat.size
  const center = centerNode(lat, input.side)
  const phi = graphLaplacianGreensFunction({ neighbors: lat.neighbors, center })
  const rMin = 1.5
  const rMax = input.side / 2 - 1.5 // stay off the boundary
  const r: number[] = []
  const out: number[] = []
  for (let j = 0; j < n; j++) {
    if (j === center) {
      continue
    }
    const d = distance(lat, center, j)
    if (d < rMin || d > rMax) {
      continue
    }
    r.push(d)
    out.push(phi[j] ?? 0)
  }
  return { r, phi: out }
}

export default defineExperiment({
  id: 'gravity/newtonian',
  title: '3D static potential is Newtonian (1/r is the best fit)',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const three = potentialProfile({ lat: cubicLattice(21, 3), side: 21 })
    const inv = fitForm(three.r, three.phi, (r) => 1 / r)
    const invSq = fitForm(three.r, three.phi, (r) => 1 / (r * r))
    const logf = fitForm(three.r, three.phi, (r) => Math.log(r))
    const ok = inv.r2 > invSq.r2 && inv.r2 > logf.r2 && inv.r2 > 0.95
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the static potential on a 3D cubic lattice fits 1/r better than 1/r^2 or log, the Newtonian weak-field limit',
      metrics: {
        inverseR2: inv.r2,
        inverseSquareR2: invSq.r2,
        logR2: logf.r2,
      },
    })
  },
})
