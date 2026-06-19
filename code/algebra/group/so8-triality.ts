// The three 8-dimensional representations of SO(8) realised on the 24-cell / D4
// coordinates, and the triality automorphism that cycles them. The vector rep 8v is
// the 8 signed coordinate axes; the two spinor reps 8s and 8c are the 16 half-integer
// vectors (+-1/2, +-1/2, +-1/2, +-1/2) split by the parity of the number of minus
// signs (even = 8s, odd = 8c, the two chiralities). The order-3 triality cycles
// 8v -> 8s -> 8c -> 8v; the Hadamard/2 matrix realises the first step (8v -> 8s).

// 8v: the 8 signed coordinate axes (+-e_i) in 4 dimensions.
export function vectorRep8(): number[][] {
  return [0, 1, 2, 3].flatMap(i =>
    [1, -1].map(s => [0, 1, 2, 3].map(j => (j === i ? s : 0))),
  )
}

// the 16 half-integer vectors (+-1/2)^4, before the chirality split.
function halfInteger16(): number[][] {
  const half: number[][] = []
  for (const a of [0.5, -0.5])
    for (const b of [0.5, -0.5])
      for (const c of [0.5, -0.5])
        for (const d of [0.5, -0.5]) half.push([a, b, c, d])
  return half
}

// 8s: the half-integer vectors with an EVEN number of minus signs (one chirality).
export function spinorRepEven8(): number[][] {
  return halfInteger16().filter(
    v => v.filter(x => x < 0).length % 2 === 0,
  )
}

// 8c: the half-integer vectors with an ODD number of minus signs (the other chirality).
export function spinorRepOdd8(): number[][] {
  return halfInteger16().filter(
    v => v.filter(x => x < 0).length % 2 === 1,
  )
}

// The triality step matrix, the order-4 Hadamard matrix divided by 2 (an orthogonal
// involution-like map whose action cycles the three 8-dim reps). Applying it to 8v
// yields 8s.
const HADAMARD_HALF = [
  [1, 1, 1, 1],
  [1, -1, 1, -1],
  [1, 1, -1, -1],
  [1, -1, -1, 1],
].map(row => row.map(x => x / 2))

// Apply the triality (Hadamard/2) map to a set of 4-vectors.
export function applyTriality(vectors: number[][]): number[][] {
  return vectors.map(v =>
    [0, 1, 2, 3].map(i =>
      HADAMARD_HALF[i]!.reduce(
        (s, _h, k) => s + HADAMARD_HALF[i]![k]! * v[k]!,
        0,
      ),
    ),
  )
}

// A rounded-coordinate set key for comparing two direction sets up to order.
export function vectorSetKey(vectors: number[][]): Set<string> {
  return new Set(
    vectors.map(v => v.map(x => Math.round(x * 1e4)).join(',')),
  )
}

// Equality of two 4-vector sets (as unordered sets, by rounded coordinates).
export function vectorSetsEqual(
  left: number[][],
  right: number[][],
): boolean {
  const a = vectorSetKey(left)
  const b = vectorSetKey(right)
  return a.size === b.size && [...a].every(x => b.has(x))
}
