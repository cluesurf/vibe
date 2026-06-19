// The lattice Maxwell (curl-curl) operator on a periodic L^3 cubic lattice, the free U(1) gauge field.
// Degrees of freedom are link variables A[site, direction]. The Maxwell action S = (1/2) sum over
// plaquettes of F^2, with F the curl of the link field, gives the operator grad F (grad F)^T summed over
// plaquettes. Its spectrum (omega^2) has a large space of exact zero modes (gauge invariance), a
// massless physical band whose gap shrinks as the lattice grows, and a Proca mass term m^2 lifts the
// gauge modes to a uniform gap. Returns the sorted eigenvalues.

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

export function maxwellLatticeSpectrum(input: {
  side: number
  mass: number
}): number[] {
  const L = input.side
  const sites = L * L * L
  const dof = 3 * sites
  const siteIndex = (x: number, y: number, z: number): number =>
    ((x + L) % L) + L * (((y + L) % L) + L * ((z + L) % L))
  const link = (x: number, y: number, z: number, d: number): number =>
    d + 3 * siteIndex(x, y, z)
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

  return Array.from(eigSymmetric({ matrix: H }).values).sort(
    (a, b) => a - b,
  )
}
