// The smeared Benincasa-Dowker d'Alembertian acting on a scalar test function, built only from the
// causal order of a 2D Minkowski sprinkling. The action's kernel (smearedKernel2D) becomes a wave
// operator here:
//   B_eps phi(x) = 4 eps rho ( -1/2 phi(x) + eps sum_{y precedes x} f(eps, n_yx) phi(y) )
// where rho is the sprinkling density, n_yx the order-interval cardinality between y and x, and f the
// smeared 2D layer weight. In the mean it recovers the field d'Alembertian box = -d_t^2 + d_x^2, the
// kinetic operator of the scalar action emerging from the discrete causal set.

import { smearedKernel2D } from '@/code/dynamics/action'
import { Poset, pastMatrix, intervalSize } from '@/code/tool/poset'

// Apply B_eps to a test function phi(t, x) at the sprinkled point `index`. Only points in the strict
// causal past of `index` (positive time gap and timelike separation) contribute. Coordinates are the
// flat (t, x) embedding, two per point.
export function benincasaDowkerDalembertian(input: {
  phi: (t: number, x: number) => number
  coords: Float64Array
  poset: Poset
  past: ReturnType<typeof pastMatrix>
  index: number
  density: number
  epsilon: number
}): number {
  const { coords, poset, past, index, density, epsilon } = input
  const tx = coords[index * 2] ?? 0
  const xx = coords[index * 2 + 1] ?? 0
  let s = 0
  for (let y = 0; y < poset.size; y++) {
    if (y === index) continue
    const dt = tx - (coords[y * 2] ?? 0)
    const dx = xx - (coords[y * 2 + 1] ?? 0)
    if (dt <= 0 || dt * dt - dx * dx < 0) continue
    const n = intervalSize(poset, { a: y, b: index, past })
    s += smearedKernel2D({ n, epsilon }) * input.phi(coords[y * 2] ?? 0, coords[y * 2 + 1] ?? 0)
  }
  return 4 * epsilon * density * (-0.5 * input.phi(tx, xx) + epsilon * s)
}
