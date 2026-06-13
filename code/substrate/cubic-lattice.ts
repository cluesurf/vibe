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
