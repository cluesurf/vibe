// A Fisher-Yates shuffle driven by a caller-supplied generator, so the permutation is a pure function of
// the generator's state. Until 2026-08-31 three coarse-graining experiments each carried this loop. Note
// the methodology: a shuffled labelling is a pseudo-random control, fine as a null, not as a foundation.

export function shuffled<T>(input: {
  items: readonly T[]
  rng: { next(): number }
}): T[] {
  const out = input.items.slice()

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(input.rng.next() * (i + 1))
    const tmp = out[i]!

    out[i] = out[j]!
    out[j] = tmp
  }

  return out
}
