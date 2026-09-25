// Instruments for asking whether a signal can cross one cusp of {3,4,3,4} through the bulk faster than
// along the flat horosphere (E-NVG-0014). Four of them:
//
// - ballCenters and centerBulkDistance: the exact cell-graph distance from the base cell to a target
//   cell, by meeting a ball around the base with a ball carried to the target, as bulkDistance in
//   code/substrate/coxeter/label-transport does, but carrying the far ball's CENTERS (one matrix-vector
//   product per cell) instead of its frames, so every cell of a cusp layer can be measured.
// - cellStabilizer, idealVertexMaps and retractionSearch: the 1,152 symmetries of the base cell, one
//   symmetry taking the first ideal vertex to each of the 24, and the exhaustive search for a frame
//   transport of the form tau_d = F_d X_d whose X is the image of the outer mirror under a retraction of
//   [3,4,3,4] onto [3,4,3]. Every normal subgroup acting simply transitively on the cells is the kernel
//   of such a retraction, so this is every label-consistent transport of that kind, and the determinant
//   of tau says whether it keeps the frame's orientation.
// - skinCertificate: a proof, on every facet step of a ball, that the cell-graph distance between two
//   cells of one cusp layer is never less than their skin distance. In horospherical coordinates about
//   the ideal vertex v (the upper half space with v at infinity), the horizontal position of a cell
//   center, read in the cubic lattice the layer's centers form, gives three coordinates n_1, n_2, n_3.
//   On the layer the skin distance is the l1 distance of n. If no facet step anywhere changes n by more
//   than 1 in l1, every path is at least as long as the l1 distance of its ends, so the bulk distance
//   is at least the skin distance, and the skin path makes them equal, at any separation.
// - tableArrival: the first-arrival map of code/measure/signal-arrival run over a precomputed stream
//   table, with the frontier of a ball either reflecting (growingBeat's rule, reproduced exactly) or
//   absorbing (the phantom outside the ball is empty and never collides, so what leaves never returns).

import {
  type Mat,
  type Vec,
  determinant,
  identity,
  innerJ,
  matMul,
  matVec,
  nullVector,
  pointKey,
  reflectionMatrix,
  toPoincare,
} from '@/code/substrate/coxeter/minkowski'
import type {
  CuspLayer,
  HyperbolicBall,
  LabelledCoin,
} from '@/code/substrate/coxeter/label-transport'
import { Mesh } from '@/code/tool/mesh'
import { Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'

export function ballCenters(input: {
  ball: HyperbolicBall
  coin: LabelledCoin
}): Vec[] {
  const { center } = input.coin.frame

  return input.ball.frames.map(g => matVec(g, center))
}

// The exact cell-graph distance from the base cell to the cell with frame `target`, when it is at most
// the sum of the two radii, and undefined when the balls do not meet (the distance exceeds that sum).
export function centerBulkDistance(input: {
  near: HyperbolicBall
  farCenters: readonly Vec[]
  farDistance: Int32Array
  target: Mat
  coin: LabelledCoin
}): number | undefined {
  const { near, farCenters, farDistance, target, coin } = input
  const { timeAxis } = coin.frame

  let best: number | undefined

  for (let i = 0; i < farCenters.length; i++) {
    const hit = near.index.get(
      pointKey(toPoincare(matVec(target, farCenters[i]!), timeAxis)),
    )

    if (hit !== undefined) {
      const total = (near.distance[hit] ?? 0) + (farDistance[i] ?? 0)

      best = best === undefined ? total : Math.min(best, total)
    }
  }

  return best
}

function maxAbsDifference(a: Mat, b: Mat): number {
  let worst = 0

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length; j++) {
      worst = Math.max(
        worst,
        Math.abs((a[i]?.[j] ?? 0) - (b[i]?.[j] ?? 0)),
      )
    }
  }

  return worst
}

// the symmetry group of the base cell, by breadth-first closure over its four mirrors
export function cellStabilizer(coin: LabelledCoin): Mat[] {
  const { normals, metric, dim } = coin.frame
  const mirrors = normals
    .slice(0, 4)
    .map(normal => reflectionMatrix(normal, metric))
  const group: Mat[] = [identity(dim)]
  const seen = new Set<string>([pointKey(group[0]!.flat())])

  for (const element of group) {
    for (const mirror of mirrors) {
      const g = matMul(mirror, element)
      const key = pointKey(g.flat())

      if (!seen.has(key)) {
        seen.add(key)
        group.push(g)
      }
    }
  }

  return group
}

// The ideal vertex the cusp layer of label-transport is built on (fixed by the last four mirrors), and
// for each of the base cell's ideal vertices one stabilizer element taking the first vertex to it.
export function idealVertexMaps(input: {
  coin: LabelledCoin
  stabilizer: readonly Mat[]
}): { vertex: Vec; maps: Mat[] } {
  const { normals, metric, timeAxis } = input.coin.frame
  const vertex = nullVector(normals.slice(1), metric)
  const unit = (v: Vec): Vec => v.map(x => x / (v[timeAxis] ?? 1))
  const seen = new Set<string>()
  const maps: Mat[] = []

  for (const h of input.stabilizer) {
    const key = pointKey(unit(matVec(h, vertex)))

    if (!seen.has(key)) {
      seen.add(key)
      maps.push(h)
    }
  }

  return { vertex, maps }
}

export type RetractionSearch = {
  readonly stabilizerOrder: number
  readonly involutions: number
  // of those, commuting with the three mirrors the outer one commutes with
  readonly commuting: number
  // of those, keeping the Coxeter relation (r3 X)^4 = 1 with the fourth cell mirror
  readonly coxeter: number
  // of those, taking the outer facet's antipode to the outer facet, so labels read d against -d
  readonly labelling: number
  // the determinant of tau = F X for every survivor: +1 keeps orientation, -1 reverses it
  readonly transportDeterminants: number[]
  // whether the point inversion is among the survivors
  readonly inversionSurvives: boolean
}

export function retractionSearch(input: {
  coin: LabelledCoin
  stabilizer: readonly Mat[]
}): RetractionSearch {
  const { coin, stabilizer } = input
  const { normals, metric, dim } = coin.frame
  const r = normals.map(normal => reflectionMatrix(normal, metric))
  const one = identity(dim)
  const same = (a: Mat, b: Mat): boolean => maxAbsDifference(a, b) < 1e-9
  const outer = r[4]!
  const Z = coin.inversion
  const antipode = matMul(matMul(Z, outer), Z)

  let involutions = 0
  let commuting = 0
  let coxeter = 0
  let labelling = 0

  const transportDeterminants: number[] = []

  let inversionSurvives = false

  for (const X of stabilizer) {
    if (!same(matMul(X, X), one) || same(X, one)) {
      continue
    }

    involutions++

    if (
      ![0, 1, 2].every(i =>
        same(matMul(X, r[i]!), matMul(r[i]!, X)),
      )
    ) {
      continue
    }

    commuting++

    const turn = matMul(r[3]!, X)
    const square = matMul(turn, turn)

    if (!same(matMul(square, square), one)) {
      continue
    }

    coxeter++

    if (!same(matMul(matMul(X, antipode), X), outer)) {
      continue
    }

    labelling++
    transportDeterminants.push(Math.round(determinant(matMul(outer, X))))

    if (same(X, Z)) {
      inversionSurvives = true
    }
  }

  return {
    stabilizerOrder: stabilizer.length,
    involutions,
    commuting,
    coxeter,
    labelling,
    transportDeterminants,
    inversionSurvives,
  }
}

export type SkinCertificate = {
  // facet steps checked, both ends inside the ball
  readonly steps: number
  // the largest l1 change of the lattice coordinates over one facet step
  readonly largestStep: number
  // the same, by depth band of the step's upper end (band k: its horospherical height is between
  // 2^-(k+1) and 2^-k of the layer's)
  readonly largestStepByBand: number[]
  readonly stepsByBand: number[]
  // the three layer axes found orthogonal and of equal length, to this error
  readonly axesError: number
  // every cell of the given layer has l1 lattice coordinates equal to its skin distance
  readonly skinIsL1: boolean
  // no cell of the ball lies above the layer (closer to the ideal vertex)
  readonly nothingAboveLayer: boolean
}

export function skinCertificate(input: {
  ball: HyperbolicBall
  centers: readonly Vec[]
  coin: LabelledCoin
  layer: CuspLayer
}): SkinCertificate {
  const { ball, centers, coin, layer } = input
  const { normals, metric, center: c0 } = coin.frame
  const dot = (a: Vec, b: Vec): number => innerJ(a, b, metric)

  let v = nullVector(normals.slice(1), metric)

  // both future pointing, so <p, v> < 0 on every cell center
  if (dot(c0, v) > 0) {
    v = v.map(x => -x)
  }

  // w: the null vector with <v, w> = -1 in the plane of c0 and v, so the complement of v and w is the
  // horizontal space of the upper half space with v at infinity
  const alpha = -1 / dot(c0, v)
  const beta = (-alpha * dot(c0, c0)) / (2 * dot(c0, v))
  const w = c0.map((x, a) => alpha * x + beta * (v[a] ?? 0))
  const horizontal = (p: Vec): Vec => {
    const height = -dot(p, v)
    const q = p.map(x => x / height)
    const along = -dot(q, w)

    return q.map((x, a) => x - along * (v[a] ?? 0) - (w[a] ?? 0))
  }
  const levelOf = (p: Vec): number => -dot(p, v)
  const origin = horizontal(c0)
  const level0 = levelOf(c0)

  // the three lattice axes, from the base cell's six layer neighbours
  const steps = layer.members
    .filter(m => m.skin === 1)
    .map(m =>
      horizontal(matVec(m.frame, c0)).map(
        (x, a) => x - (origin[a] ?? 0),
      ),
    )
  const axes: Vec[] = []

  for (const s of steps) {
    const parallel = axes.some(
      u => Math.abs(Math.abs(dot(s, u)) - dot(u, u)) < 1e-6 * dot(u, u),
    )

    if (!parallel) {
      axes.push(s)
    }
  }

  let axesError = axes.length === 3 ? 0 : Number.POSITIVE_INFINITY

  for (let i = 0; i < axes.length; i++) {
    for (let j = 0; j < axes.length; j++) {
      const expected = i === j ? dot(axes[0]!, axes[0]!) : 0

      axesError = Math.max(
        axesError,
        Math.abs(dot(axes[i]!, axes[j]!) - expected) /
          dot(axes[0]!, axes[0]!),
      )
    }
  }

  const coordinates = (p: Vec): number[] => {
    const x = horizontal(p).map((y, a) => y - (origin[a] ?? 0))

    return axes.map(u => dot(x, u) / dot(u, u))
  }

  const skinIsL1 = layer.members.every(m => {
    const n = coordinates(matVec(m.frame, c0))

    return (
      Math.abs(n.reduce((s, y) => s + Math.abs(y), 0) - m.skin) < 1e-6
    )
  })

  const n = centers.map(coordinates)
  const level = centers.map(levelOf)
  const nothingAboveLayer = level.every(l => l >= level0 * (1 - 1e-9))
  const largestStepByBand: number[] = []
  const stepsByBand: number[] = []

  let count = 0
  let largestStep = 0

  for (let c = 0; c < ball.cells; c++) {
    for (let d = 0; d < ball.mesh.degree; d++) {
      const other = ball.mesh.neighbour(c, d)

      if (other >= ball.cells || other <= c) {
        continue
      }

      const a = n[c]!
      const b = n[other]!
      const step = a.reduce(
        (s, y, i) => s + Math.abs(y - (b[i] ?? 0)),
        0,
      )
      const upper = Math.min(level[c]!, level[other]!)
      const band = Math.max(0, Math.floor(Math.log2(upper / level0)))

      count++
      largestStep = Math.max(largestStep, step)
      largestStepByBand[band] = Math.max(
        largestStepByBand[band] ?? 0,
        step,
      )
      stepsByBand[band] = (stepsByBand[band] ?? 0) + 1
    }
  }

  return {
    steps: count,
    largestStep,
    largestStepByBand: Array.from(
      largestStepByBand,
      x => x ?? 0,
    ),
    stepsByBand: Array.from(stepsByBand, x => x ?? 0),
    axesError,
    skinIsL1,
    nothingAboveLayer,
  }
}

// The first beat at which each of the first `cells` cells differs between two runs of one rule. The
// mesh may carry phantom cells after the real ones: a real slot whose source is a phantom takes this
// cell's own opposite slot under 'reflect', and an empty slot under 'absorb'. Phantoms never collide.
export function tableArrival(input: {
  mesh: Mesh
  cells: number
  start: Int8Array
  perturbed: Int8Array
  beats: number
  rule: (beatIndex: number) => Collision
  frontier: 'reflect' | 'absorb'
}): Int32Array {
  const { mesh, cells, beats, rule, frontier } = input
  const degree = mesh.degree
  const table = streamSourceTable(mesh)
  const opposite = Array.from({ length: degree }, (_, d) =>
    mesh.opposite(d),
  )
  const arrival = new Int32Array(cells).fill(-1)
  const size = cells * degree

  let a = Int8Array.from(input.start)
  let b = Int8Array.from(input.perturbed)
  let spareA = new Int8Array(a.length)
  let spareB = new Int8Array(b.length)

  const mark = (t: number): void => {
    for (let c = 0; c < cells; c++) {
      if (arrival[c] !== -1) {
        continue
      }

      const base = c * degree

      for (let d = 0; d < degree; d++) {
        if (a[base + d] !== b[base + d]) {
          arrival[c] = t
          break
        }
      }
    }
  }

  const advance = (
    from: Int8Array,
    into: Int8Array,
    collision: Collision,
  ): void => {
    for (let c = 0; c < cells; c++) {
      collision(from, c * degree, degree)
    }

    for (let i = 0; i < size; i++) {
      const source = table[i]!

      if (source < size) {
        into[i] = from[source] ?? 0
      } else if (frontier === 'reflect') {
        const d = i % degree

        into[i] = from[i - d + opposite[d]!] ?? 0
      } else {
        into[i] = 0
      }
    }
  }

  mark(0)

  for (let t = 0; t < beats; t++) {
    const collision = rule(t)

    advance(a, spareA, collision)
    advance(b, spareB, collision)

    const swapA = a
    const swapB = b

    a = spareA
    b = spareB
    spareA = swapA
    spareB = swapB
    mark(t + 1)
  }

  return arrival
}

// The same mesh with its directions renamed: slot d moves the way slot permutation[d] moved. The
// permutation must commute with the opposite map, so the renamed mesh is again a lattice-gas mesh, and
// running a rule on it is running the permuted rule on the original.
export function relabelMesh(input: {
  mesh: Mesh
  permutation: readonly number[]
}): Mesh {
  const { mesh, permutation } = input

  return {
    id: `${mesh.id}-relabelled-${permutation.join('.')}`,
    degree: mesh.degree,
    cellCount: mesh.cellCount,
    neighbour(cell, direction) {
      return mesh.neighbour(cell, permutation[direction] ?? direction)
    },
    opposite(direction) {
      return mesh.opposite(direction)
    },
  }
}
