// The radial Schrodinger operator, for bound states of a central potential. An emergent non-relativistic electron
// (kinetic energy p^2 / 2m, the low-energy limit of the emergent Dirac dispersion) in a central potential V(r) has,
// for each angular momentum l, a one-dimensional radial Hamiltonian H_l = -d^2/dr^2 / (2m) + l(l+1)/(2 m r^2) +
// V(r), discretized on a uniform radial grid. Diagonalizing it gives the bound-state energies. For the Coulomb
// potential V(r) = -k/r this reproduces the hydrogen Rydberg series E_n = -m k^2 / (2 n^2) and the accidental
// l-degeneracy (the SO(4) symmetry, the energy depends only on the principal quantum number n = n_r + l + 1).

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// the lowest `count` bound-state energies (negative eigenvalues) of the radial Hamiltonian for angular momentum `l`
// in the central potential `potential`, on a grid of `points` sites with spacing `spacing`, electron mass `mass`.
export function radialSchrodingerLevels(input: {
  l: number
  potential: (r: number) => number
  mass: number
  spacing: number
  points: number
  count: number
}): number[] {
  const { l, potential, mass, spacing, points, count } = input
  const h = makeDense({ rows: points, cols: points })
  const kinetic = 1 / (2 * mass * spacing * spacing)
  for (let i = 0; i < points; i++) {
    const r = (i + 1) * spacing
    h.data[i * points + i] =
      2 * kinetic + (l * (l + 1)) / (2 * mass * r * r) + potential(r)
    if (i + 1 < points) {
      h.data[i * points + (i + 1)] = -kinetic
      h.data[(i + 1) * points + i] = -kinetic
    }
  }
  const values = [...eigSymmetric({ matrix: h }).values].sort(
    (a, b) => a - b,
  )
  return values.filter(e => e < 0).slice(0, count)
}
