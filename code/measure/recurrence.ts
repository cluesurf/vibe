// Poincare recurrence of the reversible knit, the measure behind why the wake is forced. A
// reversible rule is a bijection on the finite set of mesh states, so every orbit is finite and
// every state RETURNS to itself after a finite number of beats (the recurrence period), bounded
// by the size of the state space. This module measures that period, and it is the fact the
// record-accumulating wake must escape: a fixed mesh recurs, so the distinct states it can ever
// visit are bounded, and unbounded accumulation of distinction (endless time) is impossible
// without growing the state space.

import { beat } from '@/code/rule/lattice-gas'
import { cloneWill, type Will } from '@/code/tone/will'
import type { Collision } from '@/code/rule/collision'

// the recurrence period of a state under a rule: the number of beats until the state returns to
// itself exactly (bit for bit). Returns -1 if it has not recurred within maxBeats (the period is
// larger than the search, still finite by Poincare, just not reached here).
export function recurrencePeriod(input: {
  will: Will
  collision: Collision
  maxBeats: number
}): number {
  const { collision, maxBeats } = input
  const start = cloneWill(input.will)

  let current = input.will

  for (let t = 1; t <= maxBeats; t++) {
    current = beat(current, collision)

    let same = true

    for (let i = 0; i < start.data.length; i++) {
      if (start.data[i] !== current.data[i]) {
        same = false
        break
      }
    }

    if (same) {
      return t
    }
  }

  return -1
}

// a deterministic ASYMMETRIC fill, whose orbit under the knit is long and state-dependent (unlike
// a highly symmetric fill, which has a short orbit). Used to exhibit that the recurrence period is
// state-dependent and can be large, while always finite.
export function asymmetricFill(mesh: {
  cellCount: number
  degree: number
}): Int8Array {
  const data = new Int8Array(mesh.cellCount * mesh.degree)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    for (let direction = 0; direction < mesh.degree; direction++) {
      data[cell * mesh.degree + direction] =
        (((cell * cell + direction * 7 + cell * direction) % 5) % 3) - 1
    }
  }

  return data
}
