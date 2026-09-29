// Measurement for the clock horizon (E-GRV-0111, 0112): code/rule/clock-horizon. Real numbers live here only.
//
// THE SINKS. A closed shrinking stack needs a sink for every unit of content (code/rule/open-husk SHRINK). E-GRV-0090,
// 0108 and 0109 put them on the M husk docks farthest from the lump, which on the periodic husk is ONE cluster at the
// antipode, the corner, and the corner is dock 0, where the found depth is summed from. A depth criterion read against
// dock 0 would then read the lump's depth PLUS the sinks' own well at the reference (tmp/clock-probe1: 1.53 of the
// M = 1600 lump's 6.64 at the center is the sinks' well), a constant that grows with M and is not the lump's. So here
// the sinks are SPREAD: one unit on each of M husk docks taken evenly (by index) from the docks at distance >= `from`
// from the lump, a near-uniform background far from both the lump and the reference.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a unit of content added is a scheduled event.

import {
  HUSK_LATERAL,
  type OpenMesh,
  type OpenPath,
  type OpenState,
} from '@/code/rule/open-husk'
import { tornLink, type HorizonRule } from '@/code/rule/horizon-husk'
import type { ClockHorizonRule } from '@/code/rule/clock-horizon'
import {
  greenSolve,
  huskCoord,
  huskDistance,
  huskDock,
  stackGreen,
  type StackMode,
} from '@/code/measure/open-husk'
import { tornMesh } from '@/code/measure/horizon-husk'

// M sinks spread evenly (by dock index) over the husk docks at distance >= `from` from `center`, the reference excluded
export function spreadSinks(
  mesh: OpenMesh,
  center: readonly number[],
  m: number,
  from: number,
  reference = 0,
): number[] {
  const far: number[] = []

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (y !== reference && huskDistance(mesh, y, center) >= from) {
      far.push(y)
    }
  }

  if (m > far.length) {
    throw new Error('spreadSinks: more sinks than far docks')
  }

  return Array.from(
    { length: m },
    (_, i) => far[Math.floor(((2 * i + 1) * far.length) / (2 * m))]!,
  )
}

// a unit of content added: the dock it lands on, the sink its line ends at, the line's husk links with their signs
export type RoutedUnit = { at: number; sink: number; path: OpenPath }

// each unit in the order given routed from its dock to the nearest sink with room left (breadth first over the husk
// lateral links with room, a line against an existing one cancelling it: an augmenting path), one line a link. The
// lines' routing is bookkeeping (only div f enters the beat), so any routing is the same physics.
export function routeUnits(
  mesh: OpenMesh,
  at: readonly number[],
  sinks: readonly number[],
): RoutedUnit[] {
  const line = new Int8Array(mesh.links)
  const demand = new Int32Array(mesh.huskDocks)
  const prev = new Int32Array(mesh.huskDocks)
  const queue = new Int32Array(mesh.huskDocks)
  const out: RoutedUnit[] = []

  for (const y of sinks) {
    demand[y]!++
  }

  for (const from of at) {
    prev.fill(-2)
    prev[from] = -1

    let tail = 0
    let found = -1

    queue[tail++] = from

    for (let head = 0; head < tail && found < 0; head++) {
      const y = queue[head]!

      for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
        const m = mesh.incLink[j]!
        const sg = mesh.incSign[j]!

        if (mesh.kind[m] !== HUSK_LATERAL || sg * line[m]! >= 1) {
          continue
        }

        const z = sg > 0 ? mesh.head[m]! : mesh.tail[m]!

        if (prev[z] !== -2) {
          continue
        }

        prev[z] = j

        if (demand[z]! > 0) {
          found = z
          break
        }

        queue[tail++] = z
      }
    }

    if (found < 0) {
      throw new Error(
        `routeUnits: unit ${out.length} from ${from} has nowhere to go`,
      )
    }

    const path: [number, number][] = []

    for (let z = found; prev[z] !== -1; ) {
      const j = prev[z]!
      const m = mesh.incLink[j]!
      const sg = mesh.incSign[j]!

      line[m] = line[m]! + sg
      path.push([m, sg])
      z = sg > 0 ? mesh.tail[m]! : mesh.head[m]!
    }

    demand[found]!--
    out.push({ at: from, sink: found, path })
  }

  return out
}

// the uniform accretion of a lump: every dock of the final content map gets its first unit (nearest the center first),
// then every dock with two its second, and so on, so the density rises everywhere at once
export function accretionOrder(
  mesh: OpenMesh,
  content: ArrayLike<number>,
  center: readonly number[],
): number[] {
  const docks: number[] = []

  let most = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (content[y]! > 0) {
      ;(docks.push(y), (most = Math.max(most, content[y]!)))
    }
  }

  const dist = new Map(
    docks.map(y => [y, huskDistance(mesh, y, center)]),
  )

  docks.sort((p, q) => dist.get(p)! - dist.get(q)! || p - q)

  const order: number[] = []

  for (let j = 1; j <= most; j++) {
    for (const y of docks) {
      if (content[y]! >= j) {
        order.push(y)
      }
    }
  }

  return order
}

// a spread lump: `per` units on each husk dock nearest `center` (ties by index) until M are placed, -1 on each sink
export function spreadLump(
  mesh: OpenMesh,
  center: readonly number[],
  m: number,
  per: number,
  sinks: readonly number[],
): Int32Array {
  const rho = new Int32Array(mesh.docks)
  const dist = Float64Array.from({ length: mesh.huskDocks }, (_, y) =>
    huskDistance(mesh, y, center),
  )
  const order = Array.from(
    { length: mesh.huskDocks },
    (_, y) => y,
  ).sort((p, q) => dist[p]! - dist[q]! || p - q)

  let left = m

  for (const y of order) {
    if (left <= 0) {
      break
    }

    rho[y] = Math.min(per, left)
    left -= rho[y]
  }

  for (const y of sinks) {
    if (rho[y]! > 0) {
      throw new Error('spreadLump: a sink inside the lump')
    }

    rho[y]! -= 1
  }

  return rho
}

// THE CRITERION READ ON THE STATICS (a second method, not the rule): the husk docks whose free static excess over the
// reference reaches the cap, then the torn statics for that horizon read again, until no dock joins (the horizon only
// grows, as the rule's does)
export type ClockStatics = {
  horizon: Uint8Array
  torn: Float64Array
  free: Float64Array
  rounds: number
}

export function clockStatics(
  mesh: OpenMesh,
  rule: ClockHorizonRule,
  rho: ArrayLike<number>,
  tolerance = 1e-12,
): ClockStatics {
  const free = greenSolve(mesh, rho, tolerance).x
  const horizon = new Uint8Array(mesh.huskDocks)
  const excessOf = (x: Float64Array, y: number): number =>
    x[y]! - x[rule.reference]!

  let torn = free
  let rounds = 0

  for (;;) {
    let joined = 0

    for (let y = 0; y < mesh.huskDocks; y++) {
      if (
        !horizon[y] &&
        y !== rule.reference &&
        excessOf(torn, y) >= rule.cap
      ) {
        ;((horizon[y] = 1), joined++)
      }
    }

    if (joined === 0) {
      break
    }

    rounds++
    torn = greenSolve(tornMesh(mesh, horizon), rho, tolerance).x
  }

  return { horizon, torn, free, rounds }
}

// THE PREDICTION with the reference at infinity (theory, not the rule): a point lump's depth on the stack is M G(r)
// (code/measure/open-husk stackGreen, its layered Green's function, which is the husk's 1 / (24 pi r) at r << 1 / m_n
// and the zero mode's w_0 / (4 pi r) far out), and the metric register fills where M G(r) = CAP. Where G is 1/r the
// radius is exactly linear in M; the stack's massive modes make G fall faster than 1/r at a few docks, which bends it.
export function stackDepthRadius(
  modes: readonly StackMode[],
  m: number,
  cap: number,
): number {
  let lo = 0.05
  let hi = 1e4

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2

    if (m * stackGreen(modes, mid) >= cap) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return lo
}

// ---------------------------------------------------------------------------------------------------------
// reading a field along the husk's axes, and a lump carried onto a larger stack (linear solves, the far field)

const AXES: readonly (readonly number[])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

// the mean over the six axis docks at distance r from `center` of a dock field, and the force (its difference to r + 1)
export const axisMean = (
  mesh: OpenMesh,
  x: ArrayLike<number>,
  center: readonly number[],
  r: number,
): number =>
  AXES.reduce(
    (t, a) =>
      t +
      x[
        huskDock(
          mesh,
          a.map((v, i) => center[i]! + v * r),
        )
      ]!,
    0,
  ) / AXES.length
export const axisForce = (
  mesh: OpenMesh,
  x: ArrayLike<number>,
  center: readonly number[],
  r: number,
): number =>
  axisMean(mesh, x, center, r + 1) - axisMean(mesh, x, center, r)

// a side-`small` lump's source (per husk dock, sinks left out) and horizon carried to the center of a larger stack `big`,
// with `m` unit sinks there: the M farthest docks ('far', E-GRV-0108's) or spread from `from` ('spread', spreadSinks)
export function carryLump(
  small: OpenMesh,
  big: OpenMesh,
  source: ArrayLike<number>,
  horizon: Uint8Array,
  center: readonly number[],
  m: number,
  sinks: 'far' | 'spread',
  from = 9,
): { rho: Float64Array; horizon: Uint8Array; center: number[] } {
  const bigCenter = [big.side / 2, big.side / 2, big.side / 2]
  const rho = new Float64Array(big.docks)
  const bigHorizon = new Uint8Array(big.huskDocks)

  for (let y = 0; y < small.huskDocks; y++) {
    const z = huskDock(
      big,
      huskCoord(small, y).map((v, i) => v - center[i]! + bigCenter[i]!),
    )

    rho[z] = source[y]!

    if (horizon[y]) {
      bigHorizon[z] = 1
    }
  }

  let placed: number[]

  if (sinks === 'spread') {
    placed = spreadSinks(big, bigCenter, m, from)
  } else {
    const dist = Float64Array.from({ length: big.huskDocks }, (_, y) =>
      huskDistance(big, y, bigCenter),
    )

    placed = Array.from({ length: big.huskDocks }, (_, y) => y)
      .sort((p, q) => dist[q]! - dist[p]! || p - q)
      .slice(0, m)
  }

  for (const y of placed) {
    rho[y] = rho[y]! - 1
  }

  return { rho, horizon: bigHorizon, center: bigCenter }
}

// the placed statics: the torn husk's static field for `horizon` (depth x per dock in whole steps, x = 0 at dock 0, from
// the linear solve), written into a state as steps F = g (X_tail - X_head) on the live links with X the depth in register
// units to the nearest unit (the start is placed; the rule carries every remainder from then on), 0 on the torn links,
// rates and remainders 0. The steps are a gradient of X, so their curl is 0 exactly.
export function placeStatics(
  mesh: OpenMesh,
  rule: HorizonRule,
  s: OpenState,
  x: ArrayLike<number>,
  horizon: Uint8Array,
): { largest: number } {
  const X = Float64Array.from({ length: mesh.docks }, (_, y) =>
    Math.round(x[y]! * rule.unit),
  )

  let largest = 0

  for (let m = 0; m < mesh.links; m++) {
    const z = mesh.head[m]!

    if (z < 0 || tornLink(mesh, horizon, m)) {
      s.step[m] = 0
      continue
    }

    s.step[m] = mesh.weight[m]! * (X[mesh.tail[m]!]! - X[z]!)
    largest = Math.max(largest, Math.abs(s.step[m]!) / rule.unit)
  }

  s.rate.fill(0)
  s.rest.fill(0)

  return { largest }
}
