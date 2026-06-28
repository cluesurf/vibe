// Reversibility round-trip check for the directional lattice gas: run the knit forward a number of beats then
// backward the same number, and measure the Hamming distance to the start. Zero means the dynamics recovered
// the exact initial state (reversible, information-conserving), positive means information was lost. Reusable
// by any experiment that needs to assert exact recoverability or to run a lossy control.

import { Will } from '@/code/tone/will'
import { Collision } from '@/code/rule/collision'
import { beat, inverseBeat } from '@/code/rule/lattice-gas'

// The number of slots that differ from the start after `beats` forward beats then `beats` inverse beats.
// Returns the evolved (forward-only) state too, for measuring the intermediate marginal.
export function roundtrip(input: {
  will: Will
  collision: Collision
  beats: number
}): { evolved: Int8Array; roundtripHamming: number } {
  const { will, collision, beats } = input
  const start = Int8Array.from(will.data)

  let w: Will = { mesh: will.mesh, data: Int8Array.from(will.data) }

  for (let b = 0; b < beats; b++) {
    w = beat(w, collision)
  }

  const evolved = Int8Array.from(w.data)

  for (let b = 0; b < beats; b++) {
    w = inverseBeat(w, collision)
  }

  let roundtripHamming = 0

  for (let i = 0; i < start.length; i++) {
    if (w.data[i] !== start[i]) {
      roundtripHamming++
    }
  }

  return { evolved, roundtripHamming }
}
