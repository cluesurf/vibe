import { Will, charge, cloneWill } from '@/code/tone/will'
import { Collision } from '@/code/rule/collision'
import { beat, inverseBeat } from '@/code/rule/lattice-gas'

// The base invariants of the committed rule, as checkable predicates. A rule that
// claims to conserve charge or to be reversible can be checked, not trusted.

// the total tone is unchanged over a run of `beats` beats.
export function conservesCharge(
  will: Will,
  collision: Collision,
  beats: number,
): boolean {
  const before = charge(will)
  let current = cloneWill(will)
  for (let step = 0; step < beats; step++) current = beat(current, collision)
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
  for (let step = 0; step < beats; step++) forward = beat(forward, collision)
  let back = forward
  for (let step = 0; step < beats; step++) back = inverseBeat(back, inverseCollision)
  if (back.data.length !== start.data.length) return false
  for (let index = 0; index < back.data.length; index++) {
    if (back.data[index] !== start.data[index]) return false
  }
  return true
}
