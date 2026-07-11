// Poisson sprinkle of points into a 2D Minkowski box [0, tMax] x [-xMax, xMax].
// The expected count is the density times the box area, and the points are
// returned sorted by time. Unlike the diamond sprinkle (sprinkleMinkowski) this is
// a rectangular region, used for trajectory studies where a particle walks forward
// through a wide spatial extent.

import { Rng } from '@/code/tool/rng'

export type SprinkledPoint = {
  t: number
  x: number
}

export function sprinkleBox(input: {
  density: number
  tMax: number
  xMax: number
  rng: Rng
}): SprinkledPoint[] {
  const area = input.tMax * 2 * input.xMax
  const n = Math.round(input.density * area)
  const pts: SprinkledPoint[] = []

  for (let i = 0; i < n; i++) {
    pts.push({
      t: input.rng.next() * input.tMax,
      x: (input.rng.next() * 2 - 1) * input.xMax,
    })
  }

  pts.sort((a, b) => a.t - b.t)

  return pts
}
