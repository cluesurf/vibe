// The three gates of the Chronoflux governing regime, read off the lattice as measurable predicates.
// Herbert's refactored base puts one primitive law (continuity) under three separate tests that
// govern every promotion above it, and his central structural claim is that the three are NOT
// substitutable: a quantity can be conserved while the field carrying it is unrecoverable, and a
// state can be recoverable while no identifiable structure survives.
//
// The three gates here, in his order:
//
// - CONSERVATION. The total charge is unchanged over the run, to the integer.
// - RECOVERABILITY. The evolution is injective, so running forward then backward returns the start
//   bit for bit. This is the discrete face of his injective-evolution condition.
// - PERSISTENCE. An identifiable structure is still there afterwards. Measured as the share of the
//   absolute tone still sitting inside the cells that carried the structure at the start, against a
//   declared floor. Conservation and recoverability can both hold while this fails, because a
//   reversible rule is free to spread a localized pattern out until nothing local remains.
//
// Reporting all three side by side is what makes the separation visible rather than asserted.

import { Will, charge, cloneWill } from '@/code/tone/will'
import { Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { isReversible } from '@/code/check/invariant'

// The share of the state's absolute tone that sits inside a chosen set of cells. One is fully inside,
// zero is fully outside. Used as the persistence read: a structure that has streamed away from the
// cells it started in scores low even though the rule destroyed nothing.
export function supportFraction(input: {
  will: Will
  inSupport: (cell: number) => boolean
}): number {
  const { will, inSupport } = input
  const degree = will.mesh.degree
  const data = will.data

  let inside = 0
  let total = 0

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const base = cell * degree
    const within = inSupport(cell)

    for (let d = 0; d < degree; d++) {
      const magnitude = Math.abs(data[base + d]!)

      if (magnitude === 0) {
        continue
      }

      total += magnitude

      if (within) {
        inside += magnitude
      }
    }
  }

  return total === 0 ? 0 : inside / total
}

export type ArpGates = {
  chargeConserved: boolean
  stateRecoverable: boolean
  structurePersistent: boolean
  chargeBefore: number
  chargeAfter: number
  supportBefore: number
  supportAfter: number
  supportMean: number
  supportMin: number
  supportTrajectory: number[]
}

// Run one rule for `beats` beats from a state and report the three gates. `inverseCollision` is the
// collision to use on the backward leg, defaulting to the same one (correct for an involution).
// `persistenceFloor` is the share of absolute tone that must remain inside the starting support for
// the structure to count as persistent, declared by the caller rather than hidden here.
//
// Persistence is judged on the MEAN share over the whole run, not on the final beat. A reversible rule
// on a finite periodic mesh has exact Poincare recurrences, so a single endpoint can land on a moment
// where the structure has momentarily reassembled and read as persistent when it spent the run
// dispersed. The trajectory and its minimum are returned too, so a caller can see the recurrences
// rather than average them away silently.
export function arpGates(input: {
  will: Will
  collision: Collision
  inverseCollision?: Collision
  beats: number
  inSupport: (cell: number) => boolean
  persistenceFloor: number
}): ArpGates {
  const {
    will,
    collision,
    inverseCollision,
    beats,
    inSupport,
    persistenceFloor,
  } = input

  const chargeBefore = charge(will)
  const supportBefore = supportFraction({ will, inSupport })

  let state = cloneWill(will)

  const supportTrajectory: number[] = []

  for (let step = 0; step < beats; step++) {
    state = beat(state, collision)
    supportTrajectory.push(supportFraction({ will: state, inSupport }))
  }

  const chargeAfter = charge(state)
  const supportAfter =
    supportTrajectory[supportTrajectory.length - 1] ?? supportBefore

  let sum = 0
  let supportMin = Number.POSITIVE_INFINITY

  for (const value of supportTrajectory) {
    sum += value

    if (value < supportMin) {
      supportMin = value
    }
  }

  const supportMean =
    supportTrajectory.length === 0 ? supportBefore : sum / supportTrajectory.length

  const stateRecoverable = isReversible(
    cloneWill(will),
    collision,
    beats,
    inverseCollision ?? collision,
  )

  return {
    chargeConserved: chargeBefore === chargeAfter,
    stateRecoverable,
    structurePersistent: supportMean >= persistenceFloor,
    chargeBefore,
    chargeAfter,
    supportBefore,
    supportAfter,
    supportMean,
    supportMin,
    supportTrajectory: supportTrajectory.length === 0 ? [] : supportTrajectory,
  }
}
