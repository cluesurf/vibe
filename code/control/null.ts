import { Will, cloneWill, charge } from '@/code/tone/will'

// Controls, the baselines a real result must beat. The audit found that the gap
// between a deep result and a circular one is almost always the control, so they
// are a first-class part of the library.

// The random null: the same tone multiset, reshuffled, so the structure is
// destroyed while the histogram and the total charge are preserved. A measure
// that scores high on a real pattern and near zero here is measuring structure,
// not just the tone counts.
export function randomNull(will: Will, seed: number): Will {
  const shuffled = cloneWill(will)
  const data = shuffled.data
  let state = seed >>> 0
  for (let index = data.length - 1; index > 0; index--) {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    const swap = state % (index + 1)
    const held = data[index] ?? 0
    data[index] = data[swap] ?? 0
    data[swap] = held
  }
  return shuffled
}

// True when a will and its random null carry the same total charge, which the
// shuffle must preserve since it only permutes the slots.
export function preservesCharge(will: Will, seed: number): boolean {
  return charge(randomNull(will, seed)) === charge(will)
}
