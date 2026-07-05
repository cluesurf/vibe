// Conformance for code/operator/lattice-poisson-jacobi: the discrete Poisson equation
// -nabla^2 Phi = source by Jacobi relaxation with Dirichlet boundaries. Re-derivable facts:
//   - Boundary cells (degree below the interior degree) are clamped to EXACTLY zero.
//   - At convergence the field is a fixed point of the Jacobi map, so each interior cell
//     satisfies the discrete Poisson stencil deg*phi_i - sum_{j~i} phi_j = coeff*source_i
//     (residual driven to machine zero by enough sweeps).

import { suite, check, equal, close } from '@/test/code/harness'
import { latticePoissonJacobi } from '@/code/operator/lattice-poisson-jacobi'

// open 1D chain of 7 sites (interior degree 2, ends are boundary).
const chain: number[][] = []

for (let i = 0; i < 7; i++) {
  const row: number[] = []

  if (i > 0) {
    row.push(i - 1)
  }

  if (i < 6) {
    row.push(i + 1)
  }

  chain.push(row)
}

suite(
  'operator/lattice-poisson-jacobi: relaxed field solves the stencil',
  [
    check('boundary cells are clamped to exactly zero', () => {
      const source = new Float64Array(7)
      source[3] = 1

      const phi = latticePoissonJacobi({
        neighbors: chain,
        source,
        interiorDegree: 2,
        iterations: 4000,
      })

      equal(phi[0] ?? NaN, 0, 'left boundary')
      equal(phi[6] ?? NaN, 0, 'right boundary')
    }),
    check(
      'interior cells satisfy deg*phi - sum_neighbors = 4pi*source (fixed point)',
      () => {
        const source = new Float64Array(7)
        source[3] = 1

        const coeff = 4 * Math.PI
        const phi = latticePoissonJacobi({
          neighbors: chain,
          source,
          interiorDegree: 2,
          iterations: 6000,
        })

        for (let i = 1; i < 6; i++) {
          let sum = 0

          for (const j of chain[i]!) {
            sum += phi[j] ?? 0
          }

          close(
            2 * (phi[i] ?? 0) - sum,
            coeff * (source[i] ?? 0),
            1e-9,
            `Poisson stencil at interior cell ${i}`,
          )
        }
      },
    ),
    check(
      'a custom source coefficient scales the stencil right-hand side',
      () => {
        const source = new Float64Array(7)
        source[2] = 1
        source[4] = -1

        const coeff = 1.5
        const phi = latticePoissonJacobi({
          neighbors: chain,
          source,
          interiorDegree: 2,
          iterations: 6000,
          sourceCoefficient: coeff,
        })

        for (let i = 1; i < 6; i++) {
          let sum = 0

          for (const j of chain[i]!) {
            sum += phi[j] ?? 0
          }

          close(
            2 * (phi[i] ?? 0) - sum,
            coeff * (source[i] ?? 0),
            1e-9,
            `scaled stencil at cell ${i}`,
          )
        }
      },
    ),
  ],
)
