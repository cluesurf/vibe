// The lattice Maxwell (curl-curl) operator on a periodic L^3 cubic lattice, the free U(1) gauge field.
// Degrees of freedom are link variables A[site, direction]. The Maxwell action S = (1/2) sum over
// plaquettes of F^2, with F the curl of the link field, gives the operator grad F (grad F)^T summed over
// plaquettes. Its spectrum (omega^2) has a large space of exact zero modes (gauge invariance), a
// massless physical band whose gap shrinks as the lattice grows, and a Proca mass term m^2 lifts the
// gauge modes to a uniform gap.
//
// The matrix, its action on a link field, and the pure-gauge (gradient) link field are exposed so the
// Ward identity can be MEASURED (gauge/ward-identity-maxwell) rather than inferred from a zero-mode count.

import { DenseMatrix, makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// the link index of (site (x, y, z), direction d) on the periodic L^3 lattice, three links per site
export function maxwellLinkIndex(input: {
  side: number
  x: number
  y: number
  z: number
  direction: number
}): number {
  const L = input.side
  const site =
    ((input.x + L) % L) +
    L * (((input.y + L) % L) + L * ((input.z + L) % L))

  return input.direction + 3 * site
}

// the dense curl-curl matrix, plus m^2 on the diagonal for a Proca mass
export function maxwellLatticeMatrix(input: {
  side: number
  mass: number
}): DenseMatrix {
  const L = input.side
  const sites = L * L * L
  const dof = 3 * sites

  const link = (x: number, y: number, z: number, d: number): number =>
    maxwellLinkIndex({ side: L, x, y, z, direction: d })

  const step = (
    x: number,
    y: number,
    z: number,
    d: number,
  ): [number, number, number] =>
    d === 0 ? [x + 1, y, z] : d === 1 ? [x, y + 1, z] : [x, y, z + 1]

  const H = makeDense({ rows: dof, cols: dof })

  // For each plaquette F = A[a] + A[b] - A[c] - A[d], add (grad F)(grad F)^T.
  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        for (const [d1, d2] of [
          [0, 1],
          [0, 2],
          [1, 2],
        ] as const) {
          const [x1, y1, z1] = step(x, y, z, d1)
          const [x2, y2, z2] = step(x, y, z, d2)
          const links = [
            link(x, y, z, d1),
            link(x1, y1, z1, d2),
            link(x2, y2, z2, d1),
            link(x, y, z, d2),
          ]

          const signs = [1, 1, -1, -1]

          for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
              const ia = links[a] ?? 0
              const ib = links[b] ?? 0

              H.data[ia * dof + ib] =
                (H.data[ia * dof + ib] ?? 0) +
                (signs[a] ?? 0) * (signs[b] ?? 0)
            }
          }
        }
      }
    }
  }

  // A photon mass term (Proca) adds m^2 to every diagonal, lifting the gauge modes.
  if (input.mass !== 0) {
    for (let i = 0; i < dof; i++) {
      H.data[i * dof + i] =
        (H.data[i * dof + i] ?? 0) + input.mass * input.mass
    }
  }

  return H
}

// the sorted eigenvalues (omega^2) of the operator
export function maxwellLatticeSpectrum(input: {
  side: number
  mass: number
}): number[] {
  const H = maxwellLatticeMatrix(input)

  return Array.from(eigSymmetric({ matrix: H }).values).sort(
    (a, b) => a - b,
  )
}

// the operator applied to a link field, H A
export function applyMaxwell(input: {
  matrix: DenseMatrix
  field: Float64Array
}): Float64Array {
  const { matrix, field } = input
  const n = matrix.rows
  const out = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    let sum = 0

    for (let j = 0; j < n; j++) {
      sum += (matrix.data[i * n + j] ?? 0) * (field[j] ?? 0)
    }

    out[i] = sum
  }

  return out
}

// the pure-gauge link field A[site, d] = chi(site + d) - chi(site) of a scalar chi(x, y, z)
export function gradientLinkField(input: {
  side: number
  scalar: (x: number, y: number, z: number) => number
}): Float64Array {
  const L = input.side
  const field = new Float64Array(3 * L * L * L)

  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        const here = input.scalar(x, y, z)
        const ahead = [
          input.scalar((x + 1) % L, y, z),
          input.scalar(x, (y + 1) % L, z),
          input.scalar(x, y, (z + 1) % L),
        ]

        for (let d = 0; d < 3; d++) {
          field[maxwellLinkIndex({ side: L, x, y, z, direction: d })] =
            ahead[d]! - here
        }
      }
    }
  }

  return field
}

// a link field from an explicit per-link function, for non-gradient (physical) configurations
export function linkField(input: {
  side: number
  value: (x: number, y: number, z: number, direction: number) => number
}): Float64Array {
  const L = input.side
  const field = new Float64Array(3 * L * L * L)

  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        for (let d = 0; d < 3; d++) {
          field[maxwellLinkIndex({ side: L, x, y, z, direction: d })] =
            input.value(x, y, z, d)
        }
      }
    }
  }

  return field
}

// the magnetic flux through one plaquette of the link field: orientation 0 is the yz plaquette
// (B_x), 1 is zx (B_y), 2 is xy (B_z), the lattice curl of A at (x, y, z)
export function plaquetteFlux(input: {
  side: number
  field: Float64Array
  x: number
  y: number
  z: number
  orientation: number
}): number {
  const { side: L, field, x, y, z, orientation } = input
  const A = (
    px: number,
    py: number,
    pz: number,
    d: number,
  ): number =>
    field[
      maxwellLinkIndex({ side: L, x: px, y: py, z: pz, direction: d })
    ]!

  if (orientation === 2) {
    // xy: A_x(x,y,z) + A_y(x+1,y,z) - A_x(x,y+1,z) - A_y(x,y,z)
    return (
      A(x, y, z, 0) + A(x + 1, y, z, 1) - A(x, y + 1, z, 0) - A(x, y, z, 1)
    )
  }

  if (orientation === 0) {
    // yz: A_y(x,y,z) + A_z(x,y+1,z) - A_y(x,y,z+1) - A_z(x,y,z)
    return (
      A(x, y, z, 1) + A(x, y + 1, z, 2) - A(x, y, z + 1, 1) - A(x, y, z, 2)
    )
  }

  // zx: A_z(x,y,z) + A_x(x,y,z+1) - A_z(x+1,y,z) - A_x(x,y,z)
  return (
    A(x, y, z, 2) + A(x, y, z + 1, 0) - A(x + 1, y, z, 2) - A(x, y, z, 0)
  )
}

// the net magnetic flux out of the unit cube at (x, y, z): the six face fluxes, outward-signed.
// For ANY link field this is identically zero (each link appears in two faces with opposite
// signs), the lattice Bianchi identity, the no-monopole law of the potential formulation.
export function cubeDivergence(input: {
  side: number
  field: Float64Array
  x: number
  y: number
  z: number
}): number {
  const { side: L, field, x, y, z } = input
  const flux = (
    px: number,
    py: number,
    pz: number,
    orientation: number,
  ): number =>
    plaquetteFlux({
      side: L,
      field,
      x: (px + L) % L,
      y: (py + L) % L,
      z: (pz + L) % L,
      orientation,
    })

  return (
    flux(x + 1, y, z, 0) -
    flux(x, y, z, 0) +
    flux(x, y + 1, z, 1) -
    flux(x, y, z, 1) +
    flux(x, y, z + 1, 2) -
    flux(x, y, z, 2)
  )
}
