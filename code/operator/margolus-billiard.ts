// The Margolus billiard-ball cellular automaton (BBMCA), a reversible block rule
// proven Turing-complete. On a periodic L x L grid of bits the lattice is tiled into
// 2x2 blocks whose origin alternates between (0,0) and (1,1) by parity. The block
// rule rotates each block 180 degrees UNLESS it holds exactly two particles on a
// diagonal (a wall/collision, left fixed). The rule is its own inverse, so running it
// forward then backward (same parity order reversed) recovers the field exactly. A
// lone ball flies ballistically (a wire) and collisions are reversible, the two
// primitives of a universal construction.

// Periodic flat index for an L x L grid.
const at = (length: number, x: number, y: number): number =>
  (((y % length) + length) % length) * length +
  (((x % length) + length) % length)

// One Margolus 2x2 block step over a periodic L x L bit grid. `parity` selects the
// block origin offset (0 -> (0,0), 1 -> (1,1)).
export function margolusStep(
  length: number,
  g: Uint8Array,
  parity: number,
): void {
  const o = parity ? 1 : 0

  for (let by = 0; by < length; by += 2) {
    for (let bx = 0; bx < length; bx += 2) {
      const x0 = bx + o,
        y0 = by + o

      const a = g[at(length, x0, y0)]!
      const b = g[at(length, x0 + 1, y0)]!
      const c = g[at(length, x0, y0 + 1)]!
      const d = g[at(length, x0 + 1, y0 + 1)]!
      const cnt = a + b + c + d
      const diag2 =
        cnt === 2 && ((a === 1 && d === 1) || (b === 1 && c === 1))

      if (diag2) {
        continue
      }
      // collision/wall, fixed (reversible identity)

      // rotate 180: a<->d, b<->c
      g[at(length, x0, y0)] = d
      g[at(length, x0 + 1, y0 + 1)] = a
      g[at(length, x0 + 1, y0)] = c
      g[at(length, x0, y0 + 1)] = b
    }
  }
}
