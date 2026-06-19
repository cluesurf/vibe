import { Will, cloneWill, charge } from '@/code/tone/will'
import { makeRng } from '@/code/tool/rng'

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
  const rng = makeRng({ seed })
  for (let index = data.length - 1; index > 0; index--) {
    const swap = rng.nextInt({ max: index + 1 })
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

// The spatial-shuffle null for a tone field: a fresh Fisher-Yates permutation of the cells, so the tone
// multiset (and total charge) is preserved while all spatial structure is destroyed. The control a coarse-
// graining coherence claim must beat to show it measures structure rather than plain averaging.
export function shuffledToneField(input: {
  tone: Int8Array
  rng: { next: () => number }
}): Int8Array {
  const { tone, rng } = input
  const out = tone.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const held = out[i]!
    out[i] = out[j]!
    out[j] = held
  }
  return out
}
