// A FINITE LABELLED REGION OF THE TRUE MESH, the hyperbolic {3,4,3,4} honeycomb with the antipodal labels of
// code/substrate/coxeter/label-transport. buildHyperbolicBall grows one ball about the base cell; the readings on the
// husk need two other shapes, so this module grows a region from any set of seed frames, admitting a cell only when a
// caller's test accepts it:
//
//   buildLabelledRegion   breadth-first from seed frames (distance 0) across the antipodal transports, to `radius`
//                         steps, keeping a cell only when `accept(frame)` holds. Returns the frames, the labelled
//                         neighbour table (-1 where the neighbour lies outside the region), the distance from the
//                         seeds, and how many steps land on a stored cell whose frame disagrees (0 on a consistent
//                         labelling).
//   cuspRegion            the husk neighbourhood: the cusp-layer cells within a skin radius of the base cell (the cubes
//                         of the horosphere's {4,3,4} tiling) and every cell below them within `depth` steps, reached
//                         without leaving through a layer cell outside the patch. Each cell carries its depth (0 on the
//                         layer), its Busemann level and its horizontal chart position in cubic-lattice units.
//   regionImage           the image of every region cell under an isometry g of the mesh, as a cell map, with the label
//                         action g carries (a slot permutation, one for every cell, since the labelling is the
//                         homomorphism of [3,4,3,4] onto W(F4)); undefined when g does not map the region to itself.
//
// KEYS. A cell is keyed by its center on the hyperboloid rounded to a half-unit grid. Two distinct centers are at
// hyperbolic distance at least s (cosh s = 3), so their Euclidean separation is at least sqrt(2 cosh s - 2) = 2, while
// two points on one half-unit grid key differ by less than 0.5 in each of five coordinates (under 1.12): no two cells
// share a key. The frame of every arrival is compared with the stored one (relative 1e-6), so a labelling or rounding
// fault is counted, not hidden.
//
// MEASUREMENT: frames are floats (the coordinates lie in Z[sqrt 2]); every verdict drawn from them is a permutation or
// a count. No random numbers.

import {
  frameInverse,
  labelTransports,
  type LabelledCoin,
} from '@/code/substrate/coxeter/label-transport'
import {
  identity,
  matMul,
  matVec,
  type Mat,
  type Vec,
} from '@/code/substrate/coxeter/minkowski'
import {
  horosphericalChart,
  slotPermutation,
} from '@/code/measure/hyperbolic-lines'

const SLOTS = 24

export type LabelledRegion = {
  readonly cells: number
  readonly frames: Mat[]
  // neighbour[x * 24 + d], -1 outside the region
  readonly neighbour: Int32Array
  readonly distance: Int32Array
  readonly index: Map<string, number>
  readonly inconsistentSteps: number
  readonly keyOf: (g: Mat) => string
}

export function centerKey(coin: LabelledCoin): (g: Mat) => string {
  const c0 = coin.frame.center

  return g =>
    matVec(g, c0)
      .map(x => Math.round(2 * x))
      .join(',')
}

function relativeGap(a: Mat, b: Mat): number {
  let worst = 0
  let size = 1

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length; j++) {
      worst = Math.max(worst, Math.abs(a[i]![j]! - b[i]![j]!))
      size = Math.max(size, Math.abs(a[i]![j]!))
    }
  }

  return worst / size
}

export function buildLabelledRegion(input: {
  coin: LabelledCoin
  seeds: readonly Mat[]
  radius: number
  accept?: (frame: Mat) => boolean
}): LabelledRegion {
  const { coin, seeds, radius } = input
  const accept = input.accept ?? (() => true)
  const tau = labelTransports({ coin, kind: 'antipodal' })
  const keyOf = centerKey(coin)
  const frames: Mat[] = []
  const distance: number[] = []
  const index = new Map<string, number>()

  for (const s of seeds) {
    const k = keyOf(s)

    if (!index.has(k)) {
      index.set(k, frames.length)
      frames.push(s)
      distance.push(0)
    }
  }

  const links: number[][] = []

  let inconsistentSteps = 0

  for (let head = 0; head < frames.length; head++) {
    const g = frames[head]!
    const row = new Array<number>(SLOTS).fill(-1)

    for (let d = 0; d < SLOTS; d++) {
      const next = matMul(g, tau[d]!)
      const key = keyOf(next)

      let id = index.get(key)

      if (id === undefined && distance[head]! < radius && accept(next)) {
        id = frames.length
        index.set(key, id)
        frames.push(next)
        distance.push(distance[head]! + 1)
      } else if (id !== undefined && relativeGap(frames[id]!, next) > 1e-6) {
        inconsistentSteps++
      }

      row[d] = id ?? -1
    }

    links.push(row)
  }

  const neighbour = new Int32Array(frames.length * SLOTS).fill(-1)

  links.forEach((row, x) =>
    row.forEach((n, d) => {
      neighbour[x * SLOTS + d] = n
    }),
  )

  return {
    cells: frames.length,
    frames,
    neighbour,
    distance: Int32Array.from(distance),
    index,
    inconsistentSteps,
    keyOf,
  }
}

export type CuspRegion = LabelledRegion & {
  // 0 on the cusp layer, else the steps below it
  readonly depth: Int32Array
  // the Busemann level over the layer's (1 on the layer)
  readonly levelRatio: Float64Array
  // the horizontal chart position of each center, cubic-lattice units about the base cell
  readonly husk: number[][]
  readonly layerCells: number
}

export function cuspRegion(input: {
  coin: LabelledCoin
  skin: number
  depth: number
}): CuspRegion {
  const { coin, skin, depth } = input
  const chart = horosphericalChart(coin)
  const c0 = coin.frame.center
  const onLayer = (g: Mat): boolean =>
    Math.abs(chart.level(matVec(g, c0)) - chart.layerLevel) <
    1e-9 * chart.layerLevel
  // the layer patch: layer cells within `skin` steps of the base cell over layer facets
  const patch = buildLabelledRegion({
    coin,
    seeds: [identity(c0.length)],
    radius: skin,
    accept: onLayer,
  })
  const patchKeys = new Set(patch.index.keys())
  const region = buildLabelledRegion({
    coin,
    seeds: patch.frames,
    radius: depth,
    accept: g => !onLayer(g) || patchKeys.has(patch.keyOf(g)),
  })
  const levels = region.frames.map(
    g => chart.level(matVec(g, c0)) / chart.layerLevel,
  )

  return {
    ...region,
    inconsistentSteps: region.inconsistentSteps + patch.inconsistentSteps,
    depth: Int32Array.from(region.distance),
    levelRatio: Float64Array.from(levels),
    husk: region.frames.map(g => chart.coordinates(matVec(g, c0) as Vec)),
    layerCells: patch.cells,
  }
}

// the finite group a set of isometries generates, by breadth-first closure over their matrices (keyed on the entries
// rounded to 1e-6), refusing to grow past `limit` elements
export function closeGroup(generators: readonly Mat[], limit: number): Mat[] {
  const key = (g: Mat): string =>
    g.map(r => r.map(x => Math.round(x * 1e6)).join(',')).join(';')
  const out: Mat[] = [identity(generators[0]!.length)]
  const seen = new Set<string>([key(out[0]!)])

  for (let i = 0; i < out.length; i++) {
    for (const s of generators) {
      const g = matMul(s, out[i]!)
      const k = key(g)

      if (!seen.has(k)) {
        if (out.length >= limit) {
          throw new Error(`closeGroup: more than ${limit} elements`)
        }

        seen.add(k)
        out.push(g)
      }
    }
  }

  return out
}

export type RegionImage = {
  readonly cellMap: Int32Array
  // the label action: slot d of cell x goes to slot slots[d] of cell cellMap[x]
  readonly slots: Int32Array
  // the label action as a matrix fixing the base center, s = f_(gx)^-1 g f_x
  readonly stabilizer: Mat
  // cells whose own label action differed from the first cell's (0 on a consistent labelling)
  readonly disagreeing: number
}

export function regionImage(input: {
  coin: LabelledCoin
  region: LabelledRegion
  g: Mat
}): RegionImage | undefined {
  const { coin, region, g } = input
  const cellMap = new Int32Array(region.cells)

  let slots: Int32Array | undefined
  let stabilizer: Mat | undefined
  let disagreeing = 0

  for (let x = 0; x < region.cells; x++) {
    const image = matMul(g, region.frames[x]!)
    const y = region.index.get(region.keyOf(image))

    if (y === undefined) {
      return undefined
    }

    cellMap[x] = y

    const s = matMul(frameInverse(coin, region.frames[y]!), image)
    const perm = slotPermutation(coin, s)

    if (!perm) {
      return undefined
    }

    if (!slots) {
      slots = perm
      stabilizer = s
    } else if (perm.some((v, d) => v !== slots![d])) {
      disagreeing++
    }
  }

  return slots && stabilizer
    ? { cellMap, slots, stabilizer, disagreeing }
    : undefined
}
