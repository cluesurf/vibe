// A BAND of a regular hyperbolic tiling {p,q}: the tiles within a fixed distance of one geodesic, as long as
// asked, with exact adjacency. A ball of the tiling is almost all rim (the {7,3} ball of radius 8 holds 11,173
// tiles and 6,909 of them are on its last ring), and the floating-point cell graph goes wrong past radius 8,
// so a ball is a poor place to lay anything long. A band is long and has the same width everywhere.
//
// HOW. Take a sound ball of the tiling from buildCellGraph, its tile centers lifted to the hyperboloid.
// Reflect across two edges of the central tile, edges a and b far enough apart that their lines never meet:
// the product T is a hyperbolic translation along their common perpendicular, the AXIS, by twice the
// distance between the lines, and it maps the tiling onto itself because each reflection does. A tile center
// x has an axis coordinate s(x), which T moves by exactly the translation length, and a distance to the axis,
// which T keeps. The tiles of the ball with s in one period [s0, s0 + L) and within `width` of the axis are
// the BASE, and the band is the base moved by T^k for k = 0 .. periods - 1. Band tile (k, b) is the base tile
// b moved k periods. Its neighbors are found in the ball, near the origin, where the floating point is good:
// a neighbor c of b is moved back by T^j into the base, and is (k + j, that base tile), or is outside the
// band. So the adjacency is exact however long the band, and nothing is ever computed far from the origin.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'

/** A point on the hyperboloid t^2 - x^2 - y^2 = 1, t > 0, as [x, y, t]. */
export type Point = [number, number, number]

/** A 3 by 3 matrix acting on hyperboloid points, row-major. */
export type Motion = number[]

/** The Minkowski product x1 y1 + x2 y2 - t1 t2. */
export function minkowski(a: Point, b: Point): number {
  return a[0] * b[0] + a[1] * b[1] - a[2] * b[2]
}

/** A Poincaré disk point lifted to the hyperboloid. */
export function lift([x, y]: number[]): Point {
  const r = x! * x! + y! * y!

  return [(2 * x!) / (1 - r), (2 * y!) / (1 - r), (1 + r) / (1 - r)]
}

/** A hyperboloid point projected to the Poincaré disk. */
export function toDisk(p: Point): [number, number] {
  return [p[0] / (1 + p[2]), p[1] / (1 + p[2])]
}

/** Apply a motion to a point. */
export function move(m: Motion, p: Point): Point {
  return [
    m[0]! * p[0] + m[1]! * p[1] + m[2]! * p[2],
    m[3]! * p[0] + m[4]! * p[1] + m[5]! * p[2],
    m[6]! * p[0] + m[7]! * p[1] + m[8]! * p[2],
  ]
}

/** The product of two motions, a after b. */
export function compose(a: Motion, b: Motion): Motion {
  const out: number[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out.push(
        a[i * 3]! * b[j]! + a[i * 3 + 1]! * b[3 + j]! + a[i * 3 + 2]! * b[6 + j]!,
      )
    }
  }

  return out
}

/** The reflection that swaps two hyperboloid points: the mirror is their perpendicular bisector. */
export function reflectionSwapping(x: Point, y: Point): Motion {
  const d: Point = [x[0] - y[0], x[1] - y[1], x[2] - y[2]]
  const norm = Math.sqrt(minkowski(d, d))
  const n: Point = [d[0] / norm, d[1] / norm, d[2] / norm]
  // R v = v - 2 <v, n> n, with <v, n> = v0 n0 + v1 n1 - v2 n2
  const g = [n[0], n[1], -n[2]]
  const out: number[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out.push((i === j ? 1 : 0) - 2 * n[i]! * g[j]!)
    }
  }

  return out
}

/** The inverse of a hyperbolic motion: J M^T J with J = diag(1, 1, -1). */
export function invert(m: Motion): Motion {
  const sign = [1, 1, -1]
  const out: number[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out.push(sign[i]! * m[j * 3 + i]! * sign[j]!)
    }
  }

  return out
}

export type Band = {
  symbol: [number, number]
  /** neighbors of each band tile, and the same in cyclic order round the tile */
  neighbors: number[][]
  ring: number[][]
  /** each band tile's period k and base tile index */
  period: number[]
  base: number[]
  /** each band tile's axis coordinate s and signed distance from the axis */
  along: number[]
  across: number[]
  /** the base tiles' centers, and their corners in cyclic order, on the hyperboloid */
  baseCenter: Point[]
  baseCorners: Point[][]
  /** the translation by one period */
  step: Motion
  /** one period's length along the axis */
  length: number
  width: number
  periods: number
}

/**
 * Build a band of {p,q} of half-width `width` and `periods` periods. `edges` picks the two edges of the
 * central tile whose reflections make the translation (their lines must not meet).
 */
export function buildBand({
  symbol,
  width,
  periods,
  edges,
  ball = BALL_CELLS,
}: {
  symbol: [number, number]
  width: number
  periods: number
  edges: [number, number]
  ball?: number
}): Band {
  const [p, q] = symbol
  const graph = buildCellGraph({ symbol, maxCells: ball })
  const center = graph.coords.map(lift)
  const cells = graph.cellCount

  // the sound part of the ball: tiles with a full ring whose consecutive neighbors are adjacent as the
  // tiling requires (q = 3: each two consecutive neighbors share an edge)
  const origin = center[0]!
  const angleAt = (from: Point, to: Point): number => {
    // the direction of `to` seen from `from`, after moving `from` to the origin
    const [fx, fy] = toDisk(from)
    const [zx, zy] = toDisk(to)
    const nx = zx - fx
    const ny = zy - fy
    const dx = 1 - (fx * zx + fy * zy)
    const dy = -(fx * zy - fy * zx)

    return Math.atan2(ny * dx - nx * dy, nx * dx + ny * dy)
  }
  const ring = graph.neighbors.map((list, cell) =>
    [...list].sort(
      (a, b) =>
        angleAt(center[cell]!, center[a]!) - angleAt(center[cell]!, center[b]!),
    ),
  )

  // the translation: reflect across edge a of the central tile, then across edge b
  const around = ring[0]!
  const mirrorA = reflectionSwapping(origin, center[around[edges[0]]!]!)
  const mirrorB = reflectionSwapping(origin, center[around[edges[1]]!]!)
  const step = compose(mirrorB, mirrorA)
  const back = invert(step)
  const trace = step[0]! + step[4]! + step[8]!

  if (trace <= 3 + 1e-9) {
    throw new Error(`edges ${edges.join(', ')} do not make a translation (trace ${trace})`)
  }

  const length = Math.acosh((trace - 1) / 2)

  // the axis's two ends, the null directions T pushes toward and pulls from
  const endOf = (m: Motion): Point => {
    let v: Point = [0.3, 0.1, 1]

    for (let i = 0; i < 60; i++) {
      v = move(m, v)
      const scale = v[2]

      v = [v[0] / scale, v[1] / scale, 1]
    }

    return v
  }
  const ahead = endOf(step)
  const behind = endOf(back)
  // the unit normal to the axis plane: Minkowski-orthogonal to both ends
  const cross: Point = [
    ahead[1] * behind[2] - ahead[2] * behind[1],
    ahead[2] * behind[0] - ahead[0] * behind[2],
    ahead[0] * behind[1] - ahead[1] * behind[0],
  ]
  const normalRaw: Point = [cross[0], cross[1], -cross[2]]
  const normalLength = Math.sqrt(minkowski(normalRaw, normalRaw))
  const normal: Point = [
    normalRaw[0] / normalLength,
    normalRaw[1] / normalLength,
    normalRaw[2] / normalLength,
  ]

  // s(x) grows by `length` under T: <T x, ahead> = e^-L <x, ahead>, <T x, behind> = e^L <x, behind>
  const s = (x: Point) =>
    0.5 * Math.log(minkowski(x, behind) / minkowski(x, ahead))
  const d = (x: Point) => Math.asinh(minkowski(x, normal))
  // the period starts where no tile center lies on its boundary, so no tile is on both sides of it
  const offsets = center
    .filter(x => Math.abs(d(x)) <= width + 1)
    .map(x => s(x))
  let s0 = s(origin) - length / 2

  for (let tries = 0; tries < 100; tries++) {
    const clear = offsets.every(v => {
      const phase = (((v - s0) % length) + length) % length

      return phase > 1e-6 && length - phase > 1e-6
    })

    if (clear) {
      break
    }

    s0 += length * 0.0137
  }

  // the base: ball tiles in one period and within the width, all inside the sound ball
  const baseCells: number[] = []

  for (let cell = 0; cell < cells; cell++) {
    const x = center[cell]!
    const a = s(x) - s0

    if (a >= 0 && a < length && Math.abs(d(x)) <= width) {
      baseCells.push(cell)
    }
  }

  const baseIndex = new Map<number, number>(baseCells.map((c, i) => [c, i]))

  // where a ball tile is in band terms: moved back j periods into the base, or null outside the width
  const nearest = new Map<string, number>()
  const key = (x: Point) => {
    const [u, v] = toDisk(x)

    return `${Math.round(u * 1e6)},${Math.round(v * 1e6)}`
  }

  for (let cell = 0; cell < cells; cell++) {
    nearest.set(key(center[cell]!), cell)
  }

  const locate = (x: Point): { shift: number; base: number } | null => {
    if (Math.abs(d(x)) > width) {
      return null
    }

    const shift = Math.floor((s(x) - s0) / length)
    let y = x

    for (let i = 0; i < Math.abs(shift); i++) {
      y = move(shift > 0 ? back : step, y)
    }

    // the tile whose center is within a small distance: by key, or by search if the key fell on a boundary
    let cell = nearest.get(key(y))

    if (cell === undefined) {
      cell = baseCells.find(c => -minkowski(center[c]!, y) < 1 + 1e-6)
    }

    if (cell === undefined || !baseIndex.has(cell)) {
      throw new Error('a band tile moved into the base matched no base tile')
    }

    return { shift, base: baseIndex.get(cell)! }
  }

  // each base tile's neighbors, in cyclic order, as (shift, base) or null
  const baseRing = baseCells.map(cell => {
    if (graph.neighbors[cell]!.length !== p) {
      throw new Error('a base tile lies outside the sound ball: lower the width')
    }

    // round every corner of the tile the tiling puts q tiles: for q = 3 two consecutive neighbors touch,
    // for q = 4 they share one more neighbor
    const r = ring[cell]!

    r.forEach((c1, i) => {
      const c2 = r[(i + 1) % r.length]!
      const touching = graph.neighbors[c1]!.includes(c2)
      const shared = graph.neighbors[c1]!.filter(
        n => n !== cell && graph.neighbors[c2]!.includes(n),
      ).length
      const sound = q === 3 ? touching : !touching && shared === 1

      if (!sound) {
        throw new Error('a base tile has a corner the tiling does not: lower the width')
      }
    })

    return ring[cell]!.map(n => locate(center[n]!))
  })

  const count = baseCells.length
  const neighbors: number[][] = []
  const ordered: number[][] = []
  const period: number[] = []
  const base: number[] = []
  const along: number[] = []
  const across: number[] = []

  for (let k = 0; k < periods; k++) {
    for (let b = 0; b < count; b++) {
      const around: number[] = []

      for (const n of baseRing[b]!) {
        if (n && k + n.shift >= 0 && k + n.shift < periods) {
          around.push((k + n.shift) * count + n.base)
        }
      }

      ordered.push(around)
      neighbors.push([...around])
      period.push(k)
      base.push(b)
      along.push(s(center[baseCells[b]!]!) - s0 + k * length)
      across.push(d(center[baseCells[b]!]!))
    }
  }

  // each base tile's corners: for q = 3 the corner between neighbors c1 and c2 is the normalized sum of the
  // three centers, for q = 4 of the four tiles round the corner, which the ball gives in either case
  const corner = (points: Point[]): Point => {
    const sum: Point = [0, 0, 0]

    for (const pt of points) {
      sum[0] += pt[0]
      sum[1] += pt[1]
      sum[2] += pt[2]
    }

    const norm = Math.sqrt(-minkowski(sum, sum))

    return [sum[0] / norm, sum[1] / norm, sum[2] / norm]
  }
  const baseCorners = baseCells.map(cell => {
    const r = ring[cell]!

    return r.map((c1, i) => {
      const c2 = r[(i + 1) % r.length]!
      const meet = [cell, c1, c2]

      if (q === 4) {
        const shared = graph.neighbors[c1]!.find(
          n => n !== cell && graph.neighbors[c2]!.includes(n),
        )

        if (shared !== undefined) {
          meet.push(shared)
        }
      }

      return corner(meet.map(m => center[m]!))
    })
  })

  return {
    symbol,
    neighbors,
    ring: ordered,
    period,
    base,
    along,
    across,
    baseCenter: baseCells.map(c => center[c]!),
    baseCorners,
    step,
    length,
    width,
    periods,
  }
}

/** The ball the base is cut from: radius 8 of {7,3}, all of it checked sound. */
export const BALL_CELLS = 12000

/** A band tile's center on the hyperboloid, moved `shift` periods further (negative moves it back). */
export function bandCenter({
  band,
  tile,
  shift = 0,
}: {
  band: Band
  tile: number
  shift?: number
}): Point {
  let x = band.baseCenter[band.base[tile]!]!
  const k = band.period[tile]! + shift
  const m = k >= 0 ? band.step : invert(band.step)

  for (let i = 0; i < Math.abs(k); i++) {
    x = move(m, x)
  }

  return x
}
