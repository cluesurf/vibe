import { Will, cloneWill, charge } from '@/code/tone/will'
import { weylPermutation } from '@/code/tool/weyl'

// Controls, the baselines a real result must beat. The audit found that the gap
// between a deep result and a circular one is almost always the control, so they
// are a first-class part of the library.
//
// Every null here permutes by a deterministic Weyl permutation (code/tool/weyl), not
// by draws. A null rate is therefore computed on a fixed quasi-random set of
// permutations, the same set on every run, and a claim that beats it beats that set.
// Until 2026-09-25 the permutations came from a seeded generator.

// The shuffle null: the same tone multiset, permuted by the Weyl permutation at
// `start`, so the structure is destroyed while the histogram and the total charge
// are preserved. A measure that scores high on a real pattern and near zero here is
// measuring structure, not just the tone counts. The name is kept for its callers.
export function randomNull(will: Will, start: number): Will {
  const shuffled = cloneWill(will)
  const data = shuffled.data
  const order = weylPermutation({ size: data.length, start })

  for (let index = 0; index < data.length; index++) {
    data[index] = will.data[order[index] ?? 0] ?? 0
  }

  return shuffled
}

// True when a will and its shuffle null carry the same total charge, which the
// permutation must preserve since it only moves the slots.
export function preservesCharge(will: Will, start: number): boolean {
  return charge(randomNull(will, start)) === charge(will)
}

// The spatial-shuffle null for a tone field: a Fisher-Yates permutation of the cells driven by the
// caller's Weyl stream, so the tone multiset (and total charge) is preserved while all spatial structure is
// destroyed. The control a coarse-graining coherence claim must beat to show it measures structure rather
// than plain averaging.
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
