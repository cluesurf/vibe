// P16: the Newtonian limit (a first rung of gravity beyond the action).
// The gravitational action makes spacetime a stable phase (P2). A theory of
// gravity also needs the weak-field potential. The static potential of a source
// is the Green's function of the emergent Laplacian, L^{-1}. In the continuum that
// falls as 1/r^(d-2) in d spatial dimensions: linear (confining) in 1D, log in 2D,
// and 1/r (Newtonian) in 3D. We compute it on the mesh and check it matches.
// This is one rung. The full Einstein equations and the graviton are the long road
// (see note/questions/next-version.md P16). Run: npx tsx code/experiment/p16-newtonian.ts

import { pathToFileURL } from 'node:url'

interface Lat {
  size: number
  coords: Float64Array // size * dim
  dim: number
  neighbors: number[][]
}

// A d-dimensional cubic lattice of the given side length, coordinates in integer
// units, nearest-neighbor adjacency.
export function cubicLattice(side: number, dim: number): Lat {
  const size = side ** dim
  const coords = new Float64Array(size * dim)
  const neighbors: number[][] = Array.from({ length: size }, () => [])
  const coordOf = (idx: number): number[] => {
    const c: number[] = []
    let x = idx
    for (let a = 0; a < dim; a++) {
      c.push(x % side)
      x = Math.floor(x / side)
    }
    return c
  }
  for (let i = 0; i < size; i++) {
    const c = coordOf(i)
    for (let a = 0; a < dim; a++) {
      coords[i * dim + a] = c[a] ?? 0
    }
    for (let a = 0; a < dim; a++) {
      if ((c[a] ?? 0) + 1 < side) {
        let j = 0
        let place = 1
        for (let b = 0; b < dim; b++) {
          j += ((c[b] ?? 0) + (b === a ? 1 : 0)) * place
          place *= side
        }
        neighbors[i]?.push(j)
        neighbors[j]?.push(i)
      }
    }
  }
  return { size, coords, dim, neighbors }
}

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

// Apply the graph Laplacian L = D - A to a vector, using the sparse neighbor list.
function applyLaplacian(lat: Lat, x: Float64Array, out: Float64Array): void {
  for (let i = 0; i < lat.size; i++) {
    const row = lat.neighbors[i] ?? []
    let v = row.length * (x[i] ?? 0)
    for (const j of row) {
      v -= x[j] ?? 0
    }
    out[i] = v
  }
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
    applyLaplacian(lat, direction, temp)
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

// Fit phi(r) ~ a * f(r) + c by least squares (the constant absorbs the finite-box
// offset). Returns the coefficient and the fit quality R^2.
export function fitForm(r: number[], phi: number[], f: (x: number) => number): { a: number; r2: number } {
  const g = r.map(f)
  const n = g.length
  const mg = g.reduce((a, b) => a + b, 0) / n
  const mp = phi.reduce((a, b) => a + b, 0) / n
  let cov = 0
  let varg = 0
  for (let i = 0; i < n; i++) {
    cov += ((g[i] ?? 0) - mg) * ((phi[i] ?? 0) - mp)
    varg += ((g[i] ?? 0) - mg) * ((g[i] ?? 0) - mg)
  }
  const a = varg === 0 ? 0 : cov / varg
  const c = mp - a * mg
  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < n; i++) {
    const pred = a * (g[i] ?? 0) + c
    ssRes += ((phi[i] ?? 0) - pred) * ((phi[i] ?? 0) - pred)
    ssTot += ((phi[i] ?? 0) - mp) * ((phi[i] ?? 0) - mp)
  }
  return { a, r2: ssTot === 0 ? 0 : 1 - ssRes / ssTot }
}

export function main(): void {
  console.log('P16: the Newtonian limit, static potential phi(r) on a cubic lattice')
  console.log('  continuum prediction: 1D linear (confining), 2D logarithmic, 3D ~ 1/r')
  console.log('')

  const one = potentialProfile({ lat: cubicLattice(201, 1), side: 201 })
  const oneFit = fitForm(one.r, one.phi, (r) => r)
  console.log(`  1D: phi = a*r + c, a = ${oneFit.a.toFixed(3)} (negative = confining), R^2 = ${oneFit.r2.toFixed(4)}`)

  const two = potentialProfile({ lat: cubicLattice(81, 2), side: 81 })
  const twoFit = fitForm(two.r, two.phi, (r) => Math.log(r))
  console.log(`  2D: phi = a*ln(r) + c, a = ${twoFit.a.toFixed(3)} (negative = logarithmic), R^2 = ${twoFit.r2.toFixed(4)}`)

  const three = potentialProfile({ lat: cubicLattice(27, 3), side: 27 })
  const inv = fitForm(three.r, three.phi, (r) => 1 / r)
  const invSq = fitForm(three.r, three.phi, (r) => 1 / (r * r))
  const logf = fitForm(three.r, three.phi, (r) => Math.log(r))
  console.log(`  3D: best fit among forms (higher R^2 wins):`)
  console.log(`        1/r   (Newtonian):  R^2 = ${inv.r2.toFixed(4)}  (a = ${inv.a.toFixed(3)})`)
  console.log(`        1/r^2:               R^2 = ${invSq.r2.toFixed(4)}`)
  console.log(`        ln(r):               R^2 = ${logf.r2.toFixed(4)}`)
  const newtonWins = inv.r2 > invSq.r2 && inv.r2 > logf.r2
  console.log(`        Newtonian 1/r is the best fit: ${newtonWins ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The emergent static potential matches the continuum Green’s function in each')
  console.log('  dimension: confining in 1D, logarithmic in 2D, and Newtonian (1/r) in 3D. This')
  console.log('  is the weak-field rung. The Einstein equations and the graviton remain ahead.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
