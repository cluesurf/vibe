// Conformance for code/measure/gravity-exponent: the falloff exponent alpha in
// phi ~ r^-alpha, read from the screened graph-Laplacian Green's function. On a 3D cubic
// grid the screened Coulomb potential falls as ~1/r over the mid-distance window, so alpha
// lands near 1 (Newtonian) and, crucially, is POSITIVE (the function returns -slope, so a
// decaying potential must give a positive exponent). The grid is large enough that the fit
// window [2,6] stays interior.

import { suite, check, ok } from '@/test/code/harness'
import { gravityExponent } from '@/code/measure/gravity-exponent'

// Open (non-periodic) 3D cubic grid of side L, index x + L*y + L^2*z, six face neighbours.
function cubicNeighbors(L: number): number[][] {
  const at = (x: number, y: number, z: number): number =>
    x + L * y + L * L * z

  const neighbors: number[][] = []

  for (let z = 0; z < L; z++) {
    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        const row: number[] = []

        if (x + 1 < L) row.push(at(x + 1, y, z))

        if (x - 1 >= 0) row.push(at(x - 1, y, z))

        if (y + 1 < L) row.push(at(x, y + 1, z))

        if (y - 1 >= 0) row.push(at(x, y - 1, z))

        if (z + 1 < L) row.push(at(x, y, z + 1))

        if (z - 1 >= 0) row.push(at(x, y, z - 1))

        neighbors.push(row)
      }
    }
  }

  return neighbors
}

suite('measure/gravity-exponent: 3D Coulomb falloff', [
  check(
    'alpha is finite, positive, and near 1 (Newtonian, z=1)',
    () => {
      const L = 21
      const c = (L - 1) / 2
      const start = c + L * c + L * L * c
      const neighbors = cubicNeighbors(L)
      const alpha = gravityExponent({ neighbors, start })

      ok(Number.isFinite(alpha), `alpha must be finite, got ${alpha}`)
      // The sign test: phi decays with r, so -slope is positive.
      ok(
        alpha > 0,
        `a decaying potential must give a positive exponent, got ${alpha}`,
      )

      // Closer to the area-law value 1 than to 0 or 2 (Newtonian band).
      ok(
        alpha > 0.5 && alpha < 1.5,
        `3D screened Coulomb should fall near 1/r, got alpha=${alpha}`,
      )
    },
  ),
])
