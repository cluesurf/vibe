// The hopping adjacency and graph Laplacian of a 1D open chain of n sites. The adjacency A has a 1 on
// each nearest-neighbour edge (the quantum-walk hopping term), the Laplacian L = D - A has the site
// degree on the diagonal and -1 on each edge (the classical-walk generator). The two drive the
// ballistic-versus-diffusive contrast: e^{-iAt} spreads ballistically, e^{-Lt} diffusively.

import { makeDense } from '@/code/algebra/linear/dense'

export function chainOperators(n: number): {
  adjacency: ReturnType<typeof makeDense>
  laplacian: ReturnType<typeof makeDense>
} {
  const adjacency = makeDense({ rows: n, cols: n })
  const laplacian = makeDense({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    let degree = 0
    if (i > 0) {
      adjacency.data[i * n + (i - 1)] = 1
      laplacian.data[i * n + (i - 1)] = -1
      degree++
    }

    if (i < n - 1) {
      adjacency.data[i * n + (i + 1)] = 1
      laplacian.data[i * n + (i + 1)] = -1
      degree++
    }

    laplacian.data[i * n + i] = degree
  }

  return { adjacency, laplacian }
}
