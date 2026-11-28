// Exact quantum measures on a bare-beat state (item vibe-computation-models-0029, Q0; decision 004 of
// vibe/computation/models). A state is code/rule/bare-beat's BeatState: amplitudes amp / den over Z[zeta_9][1/6]. Every
// measure here is an exact number of Q(zeta_9) (code/algebra/ninth-field Ninth) or an integer; an order between two
// real measures is read with code/algebra/ninth-real-sign, never with a float.
//
//   weightOf            |amp / den|^2 of one amplitude
//   totalWeight         the squared norm, sum of all weights (exactly 1 for a unit state)
//   overlap             <phi | psi>, and returnProbability |<initial | U^T initial>|^2
//   dockOccupation      the expected number of excitations at each dock, sum over configurations of weight * count
//   supportDocks        the docks any configuration with nonzero amplitude occupies
//   lightConeExcess     docks of a later support that are not within one hop of an earlier one (0 under one beat)
//   hopDistances        breadth-first hop distance from a dock, out to a radius, on the lazily discovered mesh
//   supportRadius       the largest hop distance of the support from a center (throws past the explored radius)
//   spreadingMoments    the weighted first and second moments of the exact Lorentz quantity -2B = 2 cosh(r) of each
//                       excitation (bare-beat lorentzCosh2) and of its hop distance
//   chargeCensus        per configuration the charge (sum of tones) and the excitation count; conserved when one value
//   imageSize           how many basis states a state spreads over (a permutation keeps every basis state at 1)
//
// DETERMINISM: no random numbers, no floating point.

import { type Ninth, ONE, ZERO, add, conj, equals, mul, ninth, scale } from '@/code/algebra/ninth-field'
import {
  type BeatState,
  type Z9,
  conjZ9,
  decodeConfig,
  lorentzCosh2,
  mulZ9,
  stepDock,
} from '@/code/rule/bare-beat'

export function weightOf(z: Z9, den: bigint): Ninth {
  return ninth(mulZ9(conjZ9(z), z), den * den)
}

export function totalWeight(state: BeatState): Ninth {
  let sum = ZERO

  for (const z of state.amp.values()) {
    sum = add(sum, weightOf(z, state.den))
  }

  return sum
}

export const isUnitState = (state: BeatState): boolean => equals(totalWeight(state), ONE)

// <phi | psi> = sum_k conj(phi_k) psi_k
export function overlap(phi: BeatState, psi: BeatState): Ninth {
  let sum = ZERO

  for (const [key, z] of phi.amp) {
    const w = psi.amp.get(key)

    if (w !== undefined) {
      sum = add(sum, ninth(mulZ9(conjZ9(z), w), phi.den * psi.den))
    }
  }

  return sum
}

export function returnProbability(initial: BeatState, evolved: BeatState): Ninth {
  const o = overlap(initial, evolved)

  return mul(conj(o), o)
}

export function dockOccupation(state: BeatState): Map<number, Ninth> {
  const out = new Map<number, Ninth>()

  for (const [key, z] of state.amp) {
    const w = weightOf(z, state.den)

    for (const [dock] of decodeConfig(key)) {
      out.set(dock, add(out.get(dock) ?? ZERO, w))
    }
  }

  return out
}

export function supportDocks(state: BeatState): Set<number> {
  const out = new Set<number>()

  for (const key of state.amp.keys()) {
    for (const [dock] of decodeConfig(key)) {
      out.add(dock)
    }
  }

  return out
}

// The closed one-hop neighborhood of a set of docks.
export function oneHopNeighborhood(docks: Iterable<number>): Set<number> {
  const out = new Set<number>()

  for (const dock of docks) {
    out.add(dock)

    for (let slot = 0; slot < 24; slot++) {
      out.add(stepDock(dock, slot))
    }
  }

  return out
}

// Docks of `after`'s support that lie more than one hop from every dock of `before`'s support.
export function lightConeExcess(before: BeatState, after: BeatState): number {
  const reach = oneHopNeighborhood(supportDocks(before))

  let excess = 0

  for (const dock of supportDocks(after)) {
    if (!reach.has(dock)) {
      excess++
    }
  }

  return excess
}

export function hopDistances(center: number, radius: number): Map<number, number> {
  const distance = new Map<number, number>([[center, 0]])
  const queue = [center]

  for (const dock of queue) {
    const r = distance.get(dock)!

    if (r >= radius) {
      continue
    }

    for (let slot = 0; slot < 24; slot++) {
      const next = stepDock(dock, slot)

      if (!distance.has(next)) {
        distance.set(next, r + 1)
        queue.push(next)
      }
    }
  }

  return distance
}

// The largest hop distance of the support, read from a distance table (fail-closed past its radius).
export function supportRadius(state: BeatState, distance: ReadonlyMap<number, number>): number {
  let radius = 0

  for (const dock of supportDocks(state)) {
    const r = distance.get(dock)

    if (r === undefined) {
      throw new Error(`quantum-lab-measures: dock ${dock} lies past the explored radius`)
    }

    if (r > radius) {
      radius = r
    }
  }

  return radius
}

export type SpreadingMoments = {
  // sum over configurations of weight * sum over excitations of x, and of x^2
  readonly cosh2First: Ninth
  readonly cosh2Second: Ninth
  readonly hopFirst: Ninth
  readonly hopSecond: Ninth
}

export function spreadingMoments(state: BeatState, distance: ReadonlyMap<number, number>): SpreadingMoments {
  let cosh2First = ZERO
  let cosh2Second = ZERO
  let hopFirst = ZERO
  let hopSecond = ZERO

  for (const [key, z] of state.amp) {
    const w = weightOf(z, state.den)

    for (const [dock] of decodeConfig(key)) {
      const c = lorentzCosh2(dock)
      const h = distance.get(dock)

      if (h === undefined) {
        throw new Error(`quantum-lab-measures: dock ${dock} lies past the explored radius`)
      }

      cosh2First = add(cosh2First, scale(w, c))
      cosh2Second = add(cosh2Second, scale(w, c * c))
      hopFirst = add(hopFirst, scale(w, h))
      hopSecond = add(hopSecond, scale(w, h * h))
    }
  }

  return { cosh2First, cosh2Second, hopFirst, hopSecond }
}

export type ChargeCensus = {
  // distinct values over the configurations with nonzero amplitude
  readonly charges: readonly number[]
  readonly counts: readonly number[]
  readonly plus: readonly number[]
}

export function chargeCensus(state: BeatState): ChargeCensus {
  const charges = new Set<number>()
  const counts = new Set<number>()
  const plus = new Set<number>()

  for (const key of state.amp.keys()) {
    const vibes = decodeConfig(key)

    let charge = 0
    let up = 0

    for (const [, , tone] of vibes) {
      charge += tone
      up += tone > 0 ? 1 : 0
    }

    charges.add(charge)
    counts.add(vibes.length)
    plus.add(up)
  }

  const sorted = (s: Set<number>): number[] => [...s].sort((a, b) => a - b)

  return { charges: sorted(charges), counts: sorted(counts), plus: sorted(plus) }
}

export const imageSize = (state: BeatState): number => state.amp.size
