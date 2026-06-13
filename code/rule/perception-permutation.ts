// The exact 9-state ternary perception permutation on an ordered pair of tones
// (values in -1, 0, +1). The reversible, charge-permuting local rule used by the
// {3,4,3,4} / {4,3,4} experiments (the cusp and bulk towers). Each of the nine
// ordered input pairs maps to a unique output pair, so the rule is a bijection on
// pairs (information-preserving). It conserves net charge except where a 0/0 mints
// a +1/-1 (the arrow) and a +1/-1 annihilates to 0/0.
export function perceptionPermutation(a: number, b: number): [number, number] {
  if (a === -1 && b === -1) return [-1, -1]
  if (a === 1 && b === 1) return [1, 1]
  if (a === -1 && b === 0) return [0, -1]
  if (a === 0 && b === -1) return [-1, 0]
  if (a === 1 && b === 0) return [0, 1]
  if (a === 0 && b === 1) return [1, 0]
  if (a === 0 && b === 0) return [1, -1]
  if (a === 1 && b === -1) return [-1, 1]
  if (a === -1 && b === 1) return [0, 0]
  return [a, b]
}

// The same permutation as a lookup table indexed by (a+1)*3 + (b+1), with values
// the output index (a'+1)*3 + (b'+1). PERCEPTION_FORWARD is perceptionPermutation;
// PERCEPTION_INVERSE undoes it (it is its own functional inverse up to the arrow /
// share 3-cycle being run backward), so a forward sweep followed by an inverse
// sweep recovers the start exactly.
export const PERCEPTION_FORWARD = [0, 3, 4, 1, 6, 7, 2, 5, 8]
export const PERCEPTION_INVERSE = [0, 3, 6, 1, 2, 7, 4, 5, 8]

// One beat of the deterministic reversible Margolus block CA driving the perception
// permutation on a ring of length L. The ring is tiled into adjacent pairs offset by
// `parity` (alternate 0/1 each beat to give both left- and right-movers); each pair
// is updated in place by `table` (PERCEPTION_FORWARD to advance, PERCEPTION_INVERSE
// to undo). Tones are in {-1, 0, +1}.
export function perceptionBlockBeat(input: {
  tone: Int8Array
  length: number
  parity: number
  table: number[]
}): void {
  const { tone, length, parity, table } = input
  for (let i = parity; i < length; i += 2) {
    const v = i
    const w = (i + 1) % length
    const idx = (tone[v]! + 1) * 3 + (tone[w]! + 1)
    const ni = table[idx]!
    tone[v] = (Math.floor(ni / 3) - 1) as -1 | 0 | 1
    tone[w] = ((ni % 3) - 1) as -1 | 0 | 1
  }
}
