// APE smearing (Albanese et al. 1987): replace each spatial link by the group projection of itself
// plus a weight times the sum of its spatial staples, and repeat. A smeared link is a fat, smooth
// path from one site to the next, so an operator built from smeared spatial links overlaps far
// better with the ground state of a flux tube or a glueball and far less with the ultraviolet noise.
//
//   U'_i(x) = Proj[ (1 - alpha) U_i(x) + (alpha / (2 (d - 1))) sum_{j != i, spatial} S_ij(x) ]
//
// with S the two three-link paths from x to x + i through the j plane and d - 1 the number of spatial
// directions. Time-like links are never touched, so a temporal transfer matrix is unchanged and
// every Wilson loop with a smeared spatial side is still a correlator of the same Hamiltonian.
//
// Proj is the Gram-Schmidt unitarization onto the group (reunitarize), the common choice.

import {
  GaugeLattice,
  cloneGaugeLattice,
  linkSlot,
  stapleInto,
} from '@/code/dynamics/gauge-lattice'
import { reunitarize } from '@/code/algebra/group/unitary-matrix'

export function apeSmear(input: {
  lattice: GaugeLattice
  alpha: number
  iterations: number
}): GaugeLattice {
  const { lattice, alpha } = input
  const { n, geometry } = lattice
  const size = 2 * n * n
  const spatial = Array.from({ length: geometry.dim - 1 }, (_, i) => i)
  const weight = alpha / (2 * (spatial.length - 1))
  const staple = { data: new Float64Array(size), offset: 0 }

  let current = cloneGaugeLattice({ lattice })

  for (let step = 0; step < input.iterations; step++) {
    const next = cloneGaugeLattice({ lattice: current })

    for (let site = 0; site < geometry.sites; site++) {
      for (const mu of spatial) {
        stapleInto({
          lattice: current,
          site,
          mu,
          out: staple,
          directions: spatial,
        })

        const from = linkSlot({ lattice: current, site, mu })
        const to = linkSlot({ lattice: next, site, mu })

        // (1 - alpha) U + weight A^dag
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const k = 2 * (i * n + j)
            const kt = 2 * (j * n + i)

            to.data[to.offset + k] =
              (1 - alpha) * (from.data[from.offset + k] ?? 0) +
              weight * (staple.data[kt] ?? 0)

            to.data[to.offset + k + 1] =
              (1 - alpha) * (from.data[from.offset + k + 1] ?? 0) -
              weight * (staple.data[kt + 1] ?? 0)
          }
        }

        reunitarize({ n, out: to })
      }
    }

    current = next
  }

  return current
}
