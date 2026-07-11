import { Will, charge, cloneWill } from '@/code/tone/will'
import { Collision } from '@/code/rule/collision'
import { beat, inverseBeat } from '@/code/rule/lattice-gas'

// The base invariants of the committed rule, as checkable predicates. A rule that
// claims to conserve charge or to be reversible can be checked, not trusted.

// The total momentum vector, the sum over every occupied slot of its tone times the
// slot's direction vector. Streaming never changes it (the same tones keep the same
// directions, only their cells shift), so a collision conserves total momentum if
// and only if it keeps each local interaction momentum-neutral. This is the SECOND
// conserved current (beyond the U(1) charge) that a relativistic z = 1 mode and
// hydrodynamics both require. `directions[d]` is the vector of slot direction d.
export function totalMomentum(
  will: Will,
  directions: number[][],
): number[] {
  const degree = will.mesh.degree
  const dimension = directions[0]?.length ?? 0
  const momentum = new Array<number>(dimension).fill(0)
  const data = will.data

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const base = cell * degree

    for (let direction = 0; direction < degree; direction++) {
      const value = data[base + direction] ?? 0

      if (value === 0) continue

      const vector = directions[direction]!

      for (let axis = 0; axis < dimension; axis++)
        momentum[axis]! += value * (vector[axis] ?? 0)
    }
  }

  return momentum
}

// the total momentum vector is unchanged (exactly, integer) over a run of `beats` beats.
export function conservesMomentum(
  will: Will,
  collision: Collision,
  beats: number,
  directions: number[][],
): boolean {
  const before = totalMomentum(will, directions)

  let current = cloneWill(will)

  for (let step = 0; step < beats; step++)
    current = beat(current, collision)

  const after = totalMomentum(current, directions)

  return before.every((value, axis) => value === after[axis])
}

// the total tone is unchanged over a run of `beats` beats.
export function conservesCharge(
  will: Will,
  collision: Collision,
  beats: number,
): boolean {
  const before = charge(will)

  let current = cloneWill(will)

  for (let step = 0; step < beats; step++)
    current = beat(current, collision)

  return charge(current) === before
}

// running forward `beats` beats then backward `beats` beats recovers the start
// exactly, with zero error. For an involution collision the inverse is the same
// map (the default); a bijective collision passes its paired inverse, which
// inverseBeat applies after un-streaming.
export function isReversible(
  will: Will,
  collision: Collision,
  beats: number,
  inverseCollision: Collision = collision,
): boolean {
  const start = cloneWill(will)

  let forward = cloneWill(will)

  for (let step = 0; step < beats; step++)
    forward = beat(forward, collision)

  let back = forward

  for (let step = 0; step < beats; step++)
    back = inverseBeat(back, inverseCollision)

  if (back.data.length !== start.data.length) return false

  for (let index = 0; index < back.data.length; index++) {
    if (back.data[index] !== start.data[index]) return false
  }

  return true
}
