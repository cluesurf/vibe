// Wave dispersion of a discrete rule from its neighbour direction set. The
// nearest-neighbour lattice dispersion is omega^2(k) = sum over directions d of
// (1 - cos(k . d)), the small-k limit of the discrete Laplacian. How isotropic this
// is at fixed |k| (axis versus diagonal) is the lattice-isotropy test: the D4
// 24-direction set is isotropic to order four, the cubic 6 and hypercubic 8 are not.

import { dot } from '@/code/algebra/vector'

// omega^2(k) for a lattice whose nearest-neighbour offsets are `directions`.
export function latticeDispersion(input: {
  directions: number[][]
  wave: number[]
}): number {
  const { directions, wave } = input
  return directions.reduce((sum, d) => sum + (1 - Math.cos(dot(wave, d))), 0)
}
