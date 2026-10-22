// The shortest-path count of the straight transport tau_a^(2n) on the true {3,4,3,4} mesh (item 0086's instrument,
// shared by gauge/cage-front and gauge/front-mesh). The ball of radius 4 gives each cell's geodesic word count N(c) in
// breadth-first order; beyond the ball the count splits at the midpoint: the distance D is the least |c| + |c^-1 g|
// over |c| <= L/2, and the paths are the sum over |c| = L/2 of N(c) N(c^-1 g).

import { buildHyperbolicBall, frameInverse, labelTransports, labelledCoin } from '@/code/substrate/coxeter/label-transport'
import { identity, matMul, matVec, pointKey, toPoincare, type Mat } from '@/code/substrate/coxeter/minkowski'

export type MeshPaths = {
  radius: number
  cells: number
  inconsistentSteps: number
  // per n = 1 .. 4: the graph distance of tau_a^(2n) and its number of shortest paths, least and greatest over slots
  distance: { least: number; most: number }[]
  paths: { least: number; most: number }[]
  perSlot: { distance: number[]; paths: number[] }[]
  seconds: number
}

export function meshPaths(): MeshPaths {
  const t0 = Date.now()
  const radius = 4
  const coin = labelledCoin()
  const ball = buildHyperbolicBall({ coin, radius })
  const transports = labelTransports({ coin, kind: 'antipodal' })
  const { center, timeAxis } = coin.frame
  const keyOf = (g: Mat): string => pointKey(toPoincare(matVec(g, center), timeAxis))
  const degree = transports.length
  // geodesic word counts N(c), breadth-first order
  const count = new Float64Array(ball.cells)

  count[0] = 1

  for (let c = 1; c < ball.cells; c++) {
    const dc = ball.distance[c]!

    let s = 0

    for (let k = 0; k < degree; k++) {
      const y = ball.mesh.neighbour(c, k)

      if (y !== ball.phantom && ball.distance[y] === dc - 1) {
        s += count[y]!
      }
    }

    count[c] = s
  }

  const inverses = ball.frames.map(g => frameInverse(coin, g))
  const perSlot: { distance: number[]; paths: number[] }[] = []

  for (let a = 0; a < degree; a++) {
    const distance: number[] = []
    const paths: number[] = []

    let g = identity(coin.frame.dim)

    for (let L = 1; L <= 8; L++) {
      g = matMul(g, transports[a]!)

      if (L % 2 === 1) {
        continue
      }

      const direct = ball.index.get(keyOf(g))

      if (L <= radius && direct !== undefined) {
        distance.push(ball.distance[direct]!)
        paths.push(count[direct]!)
        continue
      }

      // midpoint split: D = min over c (|c| <= L/2) of |c| + |c^-1 g|, paths = sum over |c| = L/2 of N(c) N(c^-1 g)
      const m = L / 2

      let D = Infinity
      let total = 0

      for (let c = 0; c < ball.cells; c++) {
        const dc = ball.distance[c]!

        if (dc > m) {
          break
        }

        const h = ball.index.get(keyOf(matMul(inverses[c]!, g)))

        if (h === undefined) {
          continue
        }

        D = Math.min(D, dc + ball.distance[h]!)

        if (dc === m && ball.distance[h] === L - m) {
          total += count[c]! * count[h]!
        }
      }

      distance.push(D)
      paths.push(D === L ? total : NaN)
    }

    perSlot.push({ distance, paths })
  }

  const over = (pick: (s: { distance: number[]; paths: number[] }) => number[], i: number): { least: number; most: number } => ({
    least: Math.min(...perSlot.map(s => pick(s)[i]!)),
    most: Math.max(...perSlot.map(s => pick(s)[i]!)),
  })

  return {
    radius,
    cells: ball.cells,
    inconsistentSteps: ball.inconsistentSteps,
    distance: [0, 1, 2, 3].map(i => over(s => s.distance, i)),
    paths: [0, 1, 2, 3].map(i => over(s => s.paths, i)),
    perSlot,
    seconds: (Date.now() - t0) / 1000,
  }
}
