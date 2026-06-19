// The Dirac sea energy of a single-particle Hamiltonian, the sum of every negative
// eigenvalue. Filling all the negative-energy states gives the fermion ground-state
// (vacuum) energy, so this is the standard sea / filled-states energy used to read off
// fermion-induced contributions to a soliton background.

import { jacobiEigenvalues } from '@/code/algebra/linear/eig-jacobi'

// Sum the negative entries of an already-computed eigenvalue list.
export function seaEnergyFromEigenvalues(
  eigenvalues: number[],
): number {
  let sum = 0
  for (const value of eigenvalues) {
    if (value < 0) {
      sum += value
    }
  }

  return sum
}

// Diagonalise a real symmetric Hamiltonian (Jacobi) and return its Dirac sea energy.
export function diracSeaEnergy(input: {
  hamiltonian: number[][]
}): number {
  return seaEnergyFromEigenvalues(jacobiEigenvalues(input.hamiltonian))
}
