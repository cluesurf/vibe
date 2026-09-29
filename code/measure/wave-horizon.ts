// Measurement for the continuous bald horizon (E-GRV-0115): code/rule/wave-horizon. Real numbers live here only.
//
// THE ENERGY (derived in code/rule/wave-horizon): with F1 the live step now, F0 one beat before, x1 and x0 the depths
// found over the live links, S1 and S0 the sources now and one beat before (S0 = S1 with the last drift of sigma undone),
//   E = (pi / D) [ sum m v^2 / 2 kappa + sum_inner J^2 / 2 mu g + 1/2 sum_live F1 F0 / g + 1/2 lambda sum_H S1 S0
//                  - 1/2 sum (S1 x0 + S0 x1) ],
// every register over Q^L, kept between events to the carry level. Read just after a join (before the next beat makes
// the handover), the handover it will make is applied to a copy of sigma first, so the join is one event.
//
// THE PLACED LUMP under the same rule (waveStatics): the content placed at once, its horizon found by the clock
// criterion on its own statics, read again until no dock joins, as code/measure/clock-horizon clockStatics does for the
// held rule; the statics for a horizon are the wave's rest state (J = 0, lambda S - x the same on each piece of H, the
// piece's S summing to its content), found by a fixed point that converges at the ratio G_HH / lambda.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a unit of content added is a scheduled event.

import {
  HUSK_LATERAL,
  type OpenMesh,
  type OpenState,
} from '@/code/rule/open-husk'
import { horizonDepth } from '@/code/rule/horizon-husk'
import {
  handover,
  innerLink,
  waveBeat,
  waveBeatBack,
  waveScratch,
  wavePaths,
  type WaveHorizonRule,
  type WaveScratch,
} from '@/code/rule/wave-horizon'
import { greenSolve, huskDistance } from '@/code/measure/open-husk'
import type { HorizonEngine } from '@/code/measure/horizon-husk'
import { lineDivergence } from '@/code/measure/count-horizon'

const mod = (x: number, m: number): number => ((x % m) + m) % m

export type WaveEnergy = {
  energy: number
  wave: number
  flowKinetic: number
}

export function waveEnergy(
  mesh: OpenMesh,
  rule: WaveHorizonRule,
  s: OpenState,
  horizon: Uint8Array,
  w: WaveScratch,
): WaveEnergy {
  const u = rule.unit
  const kappa = rule.a / rule.q
  const lambda = rule.stiffTwice / 2
  const sigma1 = Float64Array.from(w.sigma)

  handover(mesh, s.step, horizon, w.known, sigma1, 1)

  const sigma0 = Float64Array.from(sigma1)

  for (let m = 0; m < mesh.huskDocks * 9; m++) {
    const J = w.flow[m]!

    if (J === 0) {
      continue
    }

    sigma0[mesh.tail[m]!] = sigma0[mesh.tail[m]!]! + J
    sigma0[mesh.head[m]!] = sigma0[mesh.head[m]!]! - J
  }

  const f0 = new Float64Array(mesh.links)

  for (let m = 0; m < mesh.links; m++) {
    if (innerLink(mesh, horizon, m)) {
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

  const d1 = horizonDepth(mesh, s.step, horizon, innerLink)
  const d0 = horizonDepth(mesh, f0, horizon, innerLink)
  const div = lineDivergence(mesh, s.line)

  let kinetic = 0
  let flow = 0
  let links = 0
  let stiff = 0
  let src = 0

  for (let y = 0; y < mesh.docks; y++) {
    const on = y < mesh.huskDocks && horizon[y] === 1
    const S1 = u * div[y]! + (on ? sigma1[y]! : 0)
    const S0 = u * div[y]! + (on ? sigma0[y]! : 0)

    kinetic +=
      (s.rate[y]! / u) ** 2 * (mesh.inertia ? mesh.inertia[y]! : 1)

    if (on) {
      stiff += (S1 / u) * (S0 / u)
    }

    if (S1 !== 0 || S0 !== 0) {
      src +=
        ((S1 / u) * (d0.twice[y]! / (2 * u)) +
          (S0 / u) * (d1.twice[y]! / (2 * u))) /
        2
    }
  }

  for (let m = 0; m < mesh.links; m++) {
    if (innerLink(mesh, horizon, m)) {
      flow += (w.flow[m]! / u) ** 2 / mesh.weight[m]!
    } else {
      links += ((s.step[m]! / u) * (f0[m]! / u)) / mesh.weight[m]!
    }
  }

  const scale = Math.PI / rule.depth
  const flowKinetic = (scale * flow) / (2 * kappa)

  return {
    energy:
      scale *
      (kinetic / (2 * kappa) +
        flow / (2 * kappa) +
        links / 2 +
        (lambda * stiff) / 2 -
        src),
    wave: flowKinetic + (scale * lambda * stiff) / 2,
    flowKinetic,
  }
}

// the continuous bald horizon as a growth run's engine (code/measure/horizon-husk growthRun); `last()` is the scratch
// the run made, so its wave registers can be read and checked back at zero after the reversal
export type WaveEngine = HorizonEngine<WaveScratch> & {
  last(): WaveScratch | undefined
}

export function waveEngine(
  mesh: OpenMesh,
  rule: WaveHorizonRule,
): WaveEngine {
  const paths = wavePaths(mesh)

  let made: WaveScratch | undefined

  return {
    scratch: () => (made = waveScratch(mesh, paths)),
    beat: (s, horizon, scratch, tally) =>
      waveBeat(mesh, rule, s, horizon, scratch, tally),
    back: (s, horizon, scratch) =>
      waveBeatBack(mesh, rule, s, horizon, scratch),
    energy: (s, horizon) =>
      made ? waveEnergy(mesh, rule, s, horizon, made).energy : 0,
    last: () => made,
  }
}

// the mesh with the inner links' weights 0 (for the linear solve of the statics)
export function innerMesh(
  mesh: OpenMesh,
  horizon: Uint8Array,
): OpenMesh {
  const weight = Int8Array.from(mesh.weight)

  for (let m = 0; m < mesh.links; m++) {
    if (innerLink(mesh, horizon, m)) {
      weight[m] = 0
    }
  }

  return { ...mesh, weight }
}

// the pieces of H joined by inner links: a label per husk dock (-1 off H), and how many
export function horizonPieces(
  mesh: OpenMesh,
  horizon: Uint8Array,
): { piece: Int32Array; pieces: number } {
  const piece = new Int32Array(mesh.huskDocks).fill(-1)
  const queue = new Int32Array(mesh.huskDocks)

  let pieces = 0

  for (let y0 = 0; y0 < mesh.huskDocks; y0++) {
    if (!horizon[y0] || piece[y0] !== -1) {
      continue
    }

    piece[y0] = pieces
    queue[0] = y0

    for (let at = 0, tail = 1; at < tail; at++) {
      const y = queue[at]!

      for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
        const m = mesh.incLink[j]!

        if (!innerLink(mesh, horizon, m)) {
          continue
        }

        const z = mesh.incSign[j]! > 0 ? mesh.head[m]! : mesh.tail[m]!

        if (piece[z] === -1) {
          ;((piece[z] = pieces), (queue[tail++] = z))
        }
      }
    }

    pieces++
  }

  return { piece, pieces }
}

// the wave's rest state for a fixed horizon: S on H (whole units) with lambda S - x the same on each piece and each
// piece summing to its content, the content off H; x the live mesh's static depth for it (x = 0 at dock 0)
export type WaveRest = {
  source: Float64Array
  x: Float64Array
  iterations: number
  ratio: number
}

export function waveRest(
  mesh: OpenMesh,
  rule: WaveHorizonRule,
  rho: ArrayLike<number>,
  horizon: Uint8Array,
  tolerance = 1e-10,
  limit = 400,
): WaveRest {
  const lambda = rule.stiffTwice / 2
  const cut = innerMesh(mesh, horizon)
  const { piece, pieces } = horizonPieces(mesh, horizon)
  const content = new Float64Array(pieces)
  const size = new Float64Array(pieces)
  const source = Float64Array.from(
    { length: mesh.docks },
    (_, y) => rho[y]!,
  )

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (piece[y]! >= 0) {
      ;((content[piece[y]!] = content[piece[y]!]! + rho[y]!),
        (size[piece[y]!] = size[piece[y]!]! + 1))
    }
  }

  let x = greenSolve(cut, source, 1e-12).x
  let iterations = 0
  let last = Infinity
  let ratio = 0

  for (; iterations < limit; iterations++) {
    const sum = new Float64Array(pieces)

    for (let y = 0; y < mesh.huskDocks; y++) {
      if (piece[y]! >= 0) {
        sum[piece[y]!] = sum[piece[y]!]! + x[y]!
      }
    }

    let change = 0

    for (let y = 0; y < mesh.huskDocks; y++) {
      const k = piece[y]!

      if (k < 0) {
        continue
      }

      const next =
        (x[y]! + (lambda * content[k]! - sum[k]!) / size[k]!) / lambda

      change = Math.max(change, Math.abs(next - source[y]!))
      source[y] = next
    }

    if (Number.isFinite(last) && last > 0) {
      ratio = change / last
    }

    last = change
    x = greenSolve(cut, source, 1e-12).x

    if (change < tolerance) {
      break
    }
  }

  return { source, x, iterations, ratio }
}

// A SECOND GROWTH ORDER for the same final lump (E-GRV-0115's B): OUTSIDE-IN, the docks of the content map farthest from
// the center first (ties by index), each given all its units in a row, so a shell forms and fills inward, the core last
export function outsideInOrder(
  mesh: OpenMesh,
  content: ArrayLike<number>,
  center: readonly number[],
): number[] {
  const docks: number[] = []

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (content[y]! > 0) {
      docks.push(y)
    }
  }

  docks.sort(
    (p, q) =>
      huskDistance(mesh, q, center) - huskDistance(mesh, p, center) ||
      p - q,
  )

  return docks.flatMap(y =>
    Array.from({ length: content[y]! }, () => y),
  )
}

export type WaveStatics = WaveRest & {
  horizon: Uint8Array
  rounds: number
}

export function waveStatics(
  mesh: OpenMesh,
  rule: WaveHorizonRule,
  rho: ArrayLike<number>,
): WaveStatics {
  const horizon = new Uint8Array(mesh.huskDocks)

  let rest: WaveRest = {
    source: Float64Array.from(rho),
    x: greenSolve(mesh, rho, 1e-12).x,
    iterations: 0,
    ratio: 0,
  }
  let rounds = 0

  for (;;) {
    let joined = 0

    for (let y = 0; y < mesh.huskDocks; y++) {
      if (
        !horizon[y] &&
        y !== rule.reference &&
        rest.x[y]! - rest.x[rule.reference]! >= rule.cap
      ) {
        ;((horizon[y] = 1), joined++)
      }
    }

    if (joined === 0) {
      break
    }

    rounds++
    rest = waveRest(mesh, rule, rho, horizon)
  }

  return { ...rest, horizon, rounds }
}
