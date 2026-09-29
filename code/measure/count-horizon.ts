// Measurement for the horizon with no hair (E-GRV-0113): code/rule/count-horizon. Real numbers live here only.
//
// THE ENERGY is code/measure/horizon-husk horizonEnergy's with the source the count rule's beat reads: rho' = share /
// Q^L on the horizon's docks and div f off it, and no torn term (no dock reads a torn link). With F1 the live step now,
// F0 one beat before, x1 and x0 the depths found over the live links,
//   E = (pi / D) [ 1/2 sum_docks m_y v^2 / kappa + 1/2 sum_live F1 F0 / g - sum_docks rho'_y (x1 + x0) / 2 ],
// the leapfrog's invariant for a fixed source, kept between events to the carry levels.
//
// THE PLACED LUMP under the same rule (countStatics): the content placed at once, its horizon found by the clock
// criterion on its own statics (the torn solve with the count spread on the horizon), read again until no dock joins,
// as code/measure/clock-horizon clockStatics does for the held rule.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a unit of content added is a scheduled event.

import {
  HUSK_LATERAL,
  type OpenMesh,
  type OpenState,
} from '@/code/rule/open-husk'
import {
  horizonDepth,
  tornLink,
  type HorizonRule,
} from '@/code/rule/horizon-husk'
import type { ClockHorizonRule } from '@/code/rule/clock-horizon'
import {
  countBeat,
  countBeatBack,
  countScratch,
  countShares,
  type CountScratch,
} from '@/code/rule/count-horizon'
import { greenSolve } from '@/code/measure/open-husk'
import {
  tornMesh,
  type HorizonEngine,
} from '@/code/measure/horizon-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m

// div f per dock (whole units)
export function lineDivergence(
  mesh: OpenMesh,
  line: ArrayLike<number>,
): Float64Array {
  const out = new Float64Array(mesh.docks)

  for (let m = 0; m < mesh.links; m++) {
    const v = line[m]!

    if (v === 0) {
      continue
    }

    out[mesh.tail[m]!] = out[mesh.tail[m]!]! + v

    if (mesh.head[m]! >= 0) {
      out[mesh.head[m]!] = out[mesh.head[m]!]! - v
    }
  }

  return out
}

// the source the count rule reads, whole units: the share on the horizon, the content off it
export function countSource(
  mesh: OpenMesh,
  rule: HorizonRule,
  rho: ArrayLike<number>,
  horizon: Uint8Array,
): Float64Array {
  const shares = countShares(mesh, rule, rho, horizon)
  const out = Float64Array.from(
    { length: mesh.docks },
    (_, y) => rho[y]!,
  )

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (horizon[y]) {
      out[y] = shares.share[y]! / rule.unit
    }
  }

  return out
}

export function countEnergy(
  mesh: OpenMesh,
  rule: HorizonRule,
  s: OpenState,
  horizon: Uint8Array,
): number {
  const u = rule.unit
  const f0 = new Float64Array(mesh.links)

  for (let m = 0; m < mesh.links; m++) {
    if (tornLink(mesh, horizon, m)) {
      continue
    }

    const z = mesh.head[m]!
    const raw =
      s.step[m]! -
      mesh.weight[m]! *
        (s.rate[mesh.tail[m]!]! - (z >= 0 ? s.rate[z]! : 0))
    const [span, top] =
      mesh.kind[m] === HUSK_LATERAL
        ? [rule.span, rule.top]
        : [rule.bulkSpan, rule.bulkTop]

    f0[m] = mod(raw + top, span) - top
  }

  const d1 = horizonDepth(mesh, s.step, horizon)
  const d0 = horizonDepth(mesh, f0, horizon)
  const source = countSource(
    mesh,
    rule,
    lineDivergence(mesh, s.line),
    horizon,
  )
  const kappa = rule.a / rule.q

  let kinetic = 0
  let links = 0
  let src = 0

  for (let y = 0; y < mesh.docks; y++) {
    kinetic +=
      (s.rate[y]! / u) ** 2 * (mesh.inertia ? mesh.inertia[y]! : 1)

    if (source[y] !== 0) {
      src += (source[y]! * (d1.twice[y]! + d0.twice[y]!)) / (4 * u)
    }
  }

  for (let m = 0; m < mesh.links; m++) {
    if (!tornLink(mesh, horizon, m)) {
      links += ((s.step[m]! / u) * (f0[m]! / u)) / mesh.weight[m]!
    }
  }

  return (
    (Math.PI / rule.depth) * (kinetic / (2 * kappa) + links / 2 - src)
  )
}

// the count rule as a growth run's engine (code/measure/horizon-husk growthRun)
export const countEngine = (
  mesh: OpenMesh,
  rule: HorizonRule,
): HorizonEngine<CountScratch> => ({
  scratch: () => countScratch(mesh),
  beat: (s, horizon, scratch, tally) =>
    countBeat(mesh, rule, s, horizon, scratch, tally),
  back: (s, horizon, scratch) =>
    countBeatBack(mesh, rule, s, horizon, scratch),
  energy: (s, horizon) => countEnergy(mesh, rule, s, horizon),
})

// A SECOND GROWTH ORDER for the same final lump (E-GRV-0113's H3): the rounds of code/measure/clock-horizon
// accretionOrder (every dock of the final content map gets its first unit, then every dock with two its second, ...),
// but within each round the docks taken by INDEX, not nearest the center first: each round sweeps the lump slice by
// slice along the third axis, so the density still rises everywhere at once round by round but every round lands
// lopsided, one side before the other
export function sweepOrder(
  mesh: OpenMesh,
  content: ArrayLike<number>,
): number[] {
  let most = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    most = Math.max(most, content[y]!)
  }

  const order: number[] = []

  for (let j = 1; j <= most; j++) {
    for (let y = 0; y < mesh.huskDocks; y++) {
      if (content[y]! >= j) {
        order.push(y)
      }
    }
  }

  return order
}

// THE PLACED LUMP under the count rule (a second method, not the rule): the free statics, every husk dock whose excess
// over the reference reaches the cap joins, then the torn statics with the count spread on that horizon read again,
// until no dock joins (the horizon only grows, as the rule's does)
export type CountStatics = {
  horizon: Uint8Array
  x: Float64Array
  rounds: number
}

export function countStatics(
  mesh: OpenMesh,
  rule: ClockHorizonRule,
  rho: ArrayLike<number>,
  tolerance = 1e-12,
): CountStatics {
  const horizon = new Uint8Array(mesh.huskDocks)

  let x = greenSolve(mesh, rho, tolerance).x
  let rounds = 0

  for (;;) {
    let joined = 0

    for (let y = 0; y < mesh.huskDocks; y++) {
      if (
        !horizon[y] &&
        y !== rule.reference &&
        x[y]! - x[rule.reference]! >= rule.cap
      ) {
        ;((horizon[y] = 1), joined++)
      }
    }

    if (joined === 0) {
      break
    }

    rounds++
    x = greenSolve(
      tornMesh(mesh, horizon),
      countSource(mesh, rule, rho, horizon),
      tolerance,
    ).x
  }

  return { horizon, x, rounds }
}
