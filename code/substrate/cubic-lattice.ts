// A d-dimensional cubic lattice of the given side length, the regular Euclidean
// control mesh for the potential-and-curvature experiments. Coordinates are in
// integer units, adjacency is nearest-neighbor (each interior site has 2d
// neighbors). Sites are indexed row-major: index = sum_a c_a * side^a.

export interface CubicLattice {
  size: number
  coords: Float64Array // size * dim
  dim: number
  neighbors: number[][]
}

export function cubicLattice(side: number, dim: number): CubicLattice {
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

// Row-major index of the centre site (every coordinate at floor(side / 2)).
export function cubicLatticeCenter(input: {
  lattice: CubicLattice
  side: number
}): number {
  const { lattice, side } = input
  const mid = Math.floor(side / 2)
  let j = 0
  let place = 1
  for (let a = 0; a < lattice.dim; a++) {
    j += mid * place
    place *= side
  }
  return j
}

// Row-major index of the centre cell (every coordinate at side >> 1) of an equal-side
// cubic lattice, given only the side and dimension (no built lattice object needed).
export function cubicLatticeCenterBySide(input: {
  side: number
  dim: number
}): number {
  const { side, dim } = input
  const h = side >> 1
  let index = 0
  let place = 1
  for (let a = 0; a < dim; a++) {
    index += h * place
    place *= side
  }
  return index
}

// A cubic box of side `side` in `dim` dimensions with its coordinates repacked as rows (number[][]),
// the neighbour lists, and the centre cell index. The row-of-coordinates shape the spectral-dimension
// and Green's-function measures consume (which want coords as number[][] rather than a flat Float64Array).
export function cubicBoxRows(input: { side: number; dim: number }): {
  neighbors: number[][]
  coords: number[][]
  center: number
} {
  const { side, dim } = input
  const lattice = cubicLattice(side, dim)
  const coords: number[][] = []
  for (let i = 0; i < lattice.size; i++) {
    const row: number[] = []
    for (let a = 0; a < dim; a++) {
      row.push(lattice.coords[i * dim + a]!)
    }
    coords.push(row)
  }
  return {
    neighbors: lattice.neighbors,
    coords,
    center: cubicLatticeCenter({ lattice, side }),
  }
}

// Euclidean distance between two lattice sites in integer coordinate units.
export function cubicLatticeDistance(input: {
  lattice: CubicLattice
  from: number
  to: number
}): number {
  const { lattice, from, to } = input
  let s = 0
  for (let a = 0; a < lattice.dim; a++) {
    const d =
      (lattice.coords[from * lattice.dim + a] ?? 0) -
      (lattice.coords[to * lattice.dim + a] ?? 0)
    s += d * d
  }
  return Math.sqrt(s)
}
