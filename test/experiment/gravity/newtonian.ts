// P16: the Newtonian limit (a first rung of gravity beyond the action).
// The gravitational action makes spacetime a stable phase (P2). A theory of
// gravity also needs the weak-field potential. The static potential of a source
// is the Green's function of the emergent Laplacian, L^{-1}. In the continuum that
// falls as 1/r^(d-2) in d spatial dimensions: linear (confining) in 1D, log in 2D,
// and 1/r (Newtonian) in 3D. We compute it on the mesh and check it matches.
// This is one rung. The full Einstein equations and the graviton are the long road
// (see note/questions/next-version.md P16). Run: npx tsx code/experiment/p16-newtonian.ts

import { cubicLattice, CubicLattice } from '@/code/substrate/cubic-lattice'
import { graphLaplacian } from '@/code/operator/graph-laplacian'
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

function dot(a: Float64Array, b: Float64Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }
  return s
}

function subtractMean(x: Float64Array): void {
  let m = 0
  for (let i = 0; i < x.length; i++) {
    m += x[i] ?? 0
  }
  m /= x.length
  for (let i = 0; i < x.length; i++) {
    x[i] = (x[i] ?? 0) - m
  }
}

// The static potential phi = L^{-1} (source) by conjugate gradient on the sparse
// Laplacian. The source is a unit charge at the center against a uniform neutral
// background (so the right side is zero-mean and the singular zero mode is
// projected out). This is the Poisson equation on the mesh, the weak-field limit.
export function potentialProfile(input: { lat: Lat; side: number }): { r: number[]; phi: number[] } {
  const lat = input.lat
  const n = lat.size
  const center = centerNode(lat, input.side)
  const b = new Float64Array(n)
  b.fill(-1 / n)
  b[center] = 1 - 1 / n // unit charge minus uniform background, total zero
  const phi = new Float64Array(n)
  const residual = new Float64Array(b)
  const direction = new Float64Array(b)
  const temp = new Float64Array(n)
  let rsOld = dot(residual, residual)
  for (let iter = 0; iter < 5 * n; iter++) {
    graphLaplacian({ neighbors: lat.neighbors, x: direction, out: temp })
    subtractMean(temp)
    const alpha = rsOld / Math.max(dot(direction, temp), 1e-300)
    for (let i = 0; i < n; i++) {
      phi[i] = (phi[i] ?? 0) + alpha * (direction[i] ?? 0)
      residual[i] = (residual[i] ?? 0) - alpha * (temp[i] ?? 0)
    }
    const rsNew = dot(residual, residual)
    if (rsNew < 1e-16) {
      break
    }
    const beta = rsNew / rsOld
    for (let i = 0; i < n; i++) {
      direction[i] = (residual[i] ?? 0) + beta * (direction[i] ?? 0)
    }
    rsOld = rsNew
  }
  subtractMean(phi)
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
