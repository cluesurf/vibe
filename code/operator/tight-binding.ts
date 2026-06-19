// Nearest-neighbour tight-binding (free-fermion hopping) Hamiltonians on periodic lattices, as
// dense single-particle matrices. These are the substrates the entanglement / area-law /
// black-hole experiments diagonalize: a hopping amplitude on every lattice edge, with optional
// on-site potential. The free-fermion correlation-matrix machinery (measure/entanglement) takes
// one of these and reads off the ground-state entanglement entropy of a region.

import { makeDense, DenseMatrix } from '@/code/algebra/linear/dense'

// 1D periodic ring of `n` sites, hopping amplitude `t` (default 1) on each edge i ~ (i+1) mod n.
// The gapless ground state of this chain gives the conformal log entanglement law (c = 1).
export function ringHoppingHamiltonian(input: {
  n: number
  hopping?: number
}): DenseMatrix {
  const { n } = input
  const t = input.hopping ?? 1
  const h = makeDense({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    h.data[i * n + j] = t
    h.data[j * n + i] = t
  }

  return h
}

// 1D OPEN chain of `n` sites with hopping `-t` and a STAGGERED mass: on-site potential
// (-1)^i * mass. Half filling gives a Dirac field whose gap is set by `mass`: a massive field
// saturates (area law), the massless (mass = 0) field grows as a conformal log.
export function staggeredMassChainHamiltonian(input: {
  n: number
  mass: number
  hopping?: number
}): DenseMatrix {
  const { n, mass } = input
  const t = input.hopping ?? 1
  const h = makeDense({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    h.data[i * n + i] = (i % 2 === 0 ? 1 : -1) * mass
  }

  for (let i = 0; i < n - 1; i++) {
    h.data[i * n + (i + 1)] = -t
    h.data[(i + 1) * n + i] = -t
  }

  return h
}

// Matrix-free apply of a 1D OPEN-chain tight-binding Hamiltonian with an arbitrary on-site
// potential: (H phi)[r] = -t (phi[r-1] + phi[r+1]) + V[r] phi[r], open ends. The free band is
// [-2t, 2t]; an attractive well (V < 0) pulls bound states below -2t. Matrix-free so power
// iteration can find the bound spectrum on large chains without materializing the matrix.
export function openChainPotentialApply(input: {
  phi: Float64Array
  potential: Float64Array
  hopping?: number
}): Float64Array {
  const { phi, potential } = input
  const t = input.hopping ?? 1
  const n = phi.length
  const out = new Float64Array(n)
  for (let r = 0; r < n; r++) {
    let v = potential[r]! * phi[r]!
    if (r > 0) {
      v += -t * phi[r - 1]!
    }

    if (r < n - 1) {
      v += -t * phi[r + 1]!
    }

    out[r] = v
  }

  return out
}

// Matrix-free apply of an OPEN-boundary hypercubic tight-binding Hamiltonian with an arbitrary
// on-site potential, in `dimension` dimensions on a grid of `side` per axis (side^dimension
// sites). (H phi)[r] = -t * sum_neighbours phi + V[r] phi[r], open ends on every axis. A central
// attractive well (V < 0 near the centre) pulls down a discrete ladder of bound states whose
// degeneracies follow the well's rotational symmetry (the shells). Matrix-free so power iteration
// can find the bound spectrum on large grids without materializing the matrix.
export function gridPotentialApply(input: {
  phi: Float64Array
  potential: Float64Array
  side: number
  dimension: number
  hopping?: number
}): Float64Array {
  const { phi, potential, side, dimension } = input
  const t = input.hopping ?? 1
  const n = phi.length
  const out = new Float64Array(n)
  const strides: number[] = []
  let stride = 1
  for (let d = 0; d < dimension; d++) {
    strides.push(stride)
    stride *= side
  }

  for (let r = 0; r < n; r++) {
    let v = potential[r]! * phi[r]!
    let rest = r
    for (let d = 0; d < dimension; d++) {
      const coord = Math.floor(rest / strides[d]!) % side
      if (coord > 0) {
        v += -t * phi[r - strides[d]!]!
      }

      if (coord < side - 1) {
        v += -t * phi[r + strides[d]!]!
      }
    }

    out[r] = v
  }

  return out
}

// `dimension`-dimensional periodic hypercubic lattice of side `side` (so side^dimension sites),
// hopping `t` (default 1) along each of the `dimension` axis directions. side^2 is the 2D torus,
// side^3 the 3D torus used for the Bekenstein-Hawking area-law test.
export function torusHoppingHamiltonian(input: {
  dimension: number
  side: number
  hopping?: number
}): DenseMatrix {
  const { dimension, side } = input
  const t = input.hopping ?? 1
  let n = 1
  for (let d = 0; d < dimension; d++) {
    n *= side
  }

  const h = makeDense({ rows: n, cols: n })
  const strides: number[] = []
  let stride = 1
  for (let d = 0; d < dimension; d++) {
    strides.push(stride)
    stride *= side
  }

  for (let v = 0; v < n; v++) {
    let rest = v
    const coord: number[] = []
    for (let d = 0; d < dimension; d++) {
      coord.push(rest % side)
      rest = Math.floor(rest / side)
    }

    for (let d = 0; d < dimension; d++) {
      const next = (coord[d]! + 1) % side
      const w = v - coord[d]! * strides[d]! + next * strides[d]!
      h.data[v * n + w] = t
      h.data[w * n + v] = t
    }
  }

  return h
}

// 3D cubic lattice of side `side` (side^3 sites, index x + side*y + side^2*z) with hopping `-t` and a STAGGERED
// mass: on-site potential (-1)^(x+y+z) * mass on the two parity sublattices. At half filling this is a band
// insulator with a gap set by `mass`, so its ground state obeys the AREA law (the entanglement entropy of a region
// scales as the boundary, not the bulk). With `periodic` true (and an even `side`, so the parity sublattice is
// consistent under wrap) the lattice is a torus with no boundary, so every centered ball is interior, which is the
// clean substrate the entropic-gravity experiment diagonalizes to measure the screen-bit scaling N(r).
export function staggeredMassCubicHamiltonian(input: {
  side: number
  mass: number
  hopping?: number
  periodic?: boolean
}): DenseMatrix {
  const { side, mass } = input
  const t = input.hopping ?? 1
  const periodic = input.periodic ?? false
  const n = side * side * side
  const index = (x: number, y: number, z: number): number =>
    x + side * y + side * side * z
  const h = makeDense({ rows: n, cols: n })
  const bond = (i: number, j: number): void => {
    h.data[i * n + j] = -t
    h.data[j * n + i] = -t
  }

  for (let x = 0; x < side; x++) {
    for (let y = 0; y < side; y++) {
      for (let z = 0; z < side; z++) {
        const i = index(x, y, z)
        h.data[i * n + i] = ((x + y + z) % 2 === 0 ? 1 : -1) * mass
        if (x + 1 < side) {
          bond(i, index(x + 1, y, z))
        } else if (periodic) {
          bond(i, index(0, y, z))
        }

        if (y + 1 < side) {
          bond(i, index(x, y + 1, z))
        } else if (periodic) {
          bond(i, index(x, 0, z))
        }

        if (z + 1 < side) {
          bond(i, index(x, y, z + 1))
        } else if (periodic) {
          bond(i, index(x, y, 0))
        }
      }
    }
  }

  return h
}
