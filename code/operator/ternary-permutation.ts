// The DETERMINISTIC conserving perception rule on a ternary tone pair, as an explicit
// permutation table (no randomness, the deterministic sibling of the probabilistic
// conservingEdgeSweep). On a pair of tones in {-1, 0, +1}:
//   like charges (+/+, -/-) hold,
//   a charge next to a 0 hops into the 0 (deterministically),
//   +/- swap to -/+ and -/+ annihilate to 0/0,
//   two 0s create a balanced +/- pair when `create` is set, else hold.
// The map is a fixed permutation of pair-states, so total charge is exactly conserved.
// Applied in a Margolus-style parity block sweep it is a reversible cellular automaton.

// The deterministic pair update. Returns the new tones [a', b'].
export function ternaryPairPermutation(
  a: number,
  b: number,
  create: boolean,
): [number, number] {
  if (a === -1 && b === -1) {
    return [-1, -1]
  }

  if (a === 1 && b === 1) {
    return [1, 1]
  }

  if (a === -1 && b === 0) {
    return [0, -1]
  }

  if (a === 0 && b === -1) {
    return [-1, 0]
  }

  if (a === 1 && b === 0) {
    return [0, 1]
  }

  if (a === 0 && b === 1) {
    return [1, 0]
  }

  if (a === 0 && b === 0) {
    return create ? [1, -1] : [0, 0]
  }

  if (a === 1 && b === -1) {
    return [-1, 1]
  }

  if (a === -1 && b === 1) {
    return [0, 0]
  }

  return [a, b]
}

// One beat of the deterministic rule on a periodic 3D cubic lattice of side L, swept as
// Margolus parity blocks: for each axis and each parity, pair each cell whose
// axis-coordinate has that parity with its +axis neighbour and apply the pair
// permutation. `index` maps (x, y, z) to the flat tone index (with periodic wrap).
export function parityBlockBeat3D(input: {
  tone: Int8Array
  side: number
  index: (x: number, y: number, z: number) => number
  create: boolean
}): void {
  const { tone, side, index, create } = input
  for (const [dx, dy, dz, axis] of [
    [1, 0, 0, 0],
    [0, 1, 0, 1],
    [0, 0, 1, 2],
  ] as const) {
    for (const par of [0, 1]) {
      for (let z = 0; z < side; z++) {
        for (let y = 0; y < side; y++) {
          for (let x = 0; x < side; x++) {
            const base = axis === 0 ? x : axis === 1 ? y : z
            if (base % 2 !== par) {
              continue
            }

            const i = index(x, y, z)
            const j = index(x + dx, y + dy, z + dz)
            const [na, nb] = ternaryPairPermutation(
              tone[i]!,
              tone[j]!,
              create,
            )
            tone[i] = na as -1 | 0 | 1
            tone[j] = nb as -1 | 0 | 1
          }
        }
      }
    }
  }
}
