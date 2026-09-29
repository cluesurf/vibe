// The husk's cosmology on the true {3,4,3,4} mesh (E-CSM-0058, E-CSM-0059): the causal region a single seed reaches,
// read on the husk, which on the true mesh is the cusp layer of one ideal vertex (the cells touching it, whose centers
// lie on one horosphere, E-NVG-0014).
//
// THE SEED AND ITS CONE. The mesh unfolds from one 24-cell, the base cell (E-GMT-0027), and the rule moves nothing
// faster than one cell per beat across a facet (E-NVG-0014: arrivals never beat the cell-graph distance). So at beat t
// the seed's causal region is the ball of cells within cell-graph distance t of the base cell, and a cell c can first
// carry the seed's influence at beat seed(c) = its distance from the base cell. The base cell touches all 24 of its
// ideal vertices, so it is itself a husk dock (skin 0) of the cusp read here.
//
// THE SHARED PAST. Two husk docks a and b at beat T share a causal past when some cell c, reached by the seed at beat
// seed(c), can influence both by beat T: seed(c) + max(d(c, a), d(c, b)) <= T. The seed itself (c = base, seed 0)
// qualifies exactly when d(base, a) <= T and d(base, b) <= T, which is when both docks are inside the seed's cone.
// Every path counted here stays inside the ball of radius T about the base cell (each of its cells is within
// seed(c) + steps <= T of the base), so breadth-first distances inside that ball are exact for it.
//
// Reals appear only in the readers (ratios, logarithms, fits). The mesh and its distances are integers.

import type { HyperbolicBall, CuspLayer } from '@/code/substrate/coxeter/label-transport'

// the cubic lattice's l1 ball: how many points lie within l1 distance s of a point of Z^3 (1, 7, 25, 63, 129, ...)
export function cubicBall(s: number): number {
  return ((2 * s + 1) * (2 * s * s + 2 * s + 3)) / 3
}

// the cubic lattice's l1 shell: how many points lie at l1 distance exactly s (1, 6, 18, 38, 66, ...)
export function cubicShell(s: number): number {
  return s === 0 ? 1 : 4 * s * s + 2
}

// the husk docks of the cusp layer that lie inside the ball, each with its skin distance and its cell index
export type HuskDock = { cell: number; skin: number }

export function huskDocks(input: { ball: HyperbolicBall; layer: CuspLayer }): HuskDock[] {
  const { ball, layer } = input
  const out: HuskDock[] = []

  for (const m of layer.members) {
    const cell = ball.index.get(m.key)

    if (cell !== undefined) out.push({ cell, skin: m.skin })
  }

  return out
}

// breadth-first distance from one cell over the real cells of the ball, stopping at `limit`; -1 beyond it
export function distancesFrom(input: { ball: HyperbolicBall; source: number; limit: number }): Int16Array {
  const { ball, source, limit } = input
  const { mesh, cells } = ball
  const distance = new Int16Array(cells).fill(-1)
  const queue = new Int32Array(cells)
  let tail = 0

  distance[source] = 0
  queue[tail++] = source

  for (let head = 0; head < tail; head++) {
    const c = queue[head] as number
    const dc = distance[c] as number

    if (dc >= limit) continue

    for (let d = 0; d < mesh.degree; d++) {
      const n = mesh.neighbour(c, d)

      if (n < cells && distance[n] === -1) {
        distance[n] = dc + 1
        queue[tail++] = n
      }
    }
  }

  return distance
}

// the causal past at beat T of one husk dock: the cells c with seed(c) + d(c, a) <= T, as a bit mask over the ball
export function pastMask(input: { seed: ArrayLike<number>; from: Int16Array; beat: number }): Uint8Array {
  const { seed, from, beat } = input
  const mask = new Uint8Array(from.length)

  for (let c = 0; c < from.length; c++) {
    const d = from[c] as number

    if (d >= 0 && (seed[c] as number) + d <= beat) mask[c] = 1
  }

  return mask
}

export function countMask(mask: Uint8Array): number {
  let n = 0

  for (const b of mask) n += b

  return n
}

export function countBoth(a: Uint8Array, b: Uint8Array): number {
  let n = 0

  for (let i = 0; i < a.length; i++) n += (a[i] as number) & (b[i] as number)

  return n
}
