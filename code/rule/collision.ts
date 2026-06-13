// The collision, defined once. A collision is a local, in-place map on one cell's
// directional slots. `slots` is the whole will buffer, `base` is cell * degree,
// and `degree` is the coin size. A valid collision conserves the per-cell sum and
// is an involution (its own inverse), so the rule runs backward as exactly as it
// runs forward.

export interface Collision {
  (slots: Int8Array, base: number, degree: number): void
}

// The pass-through collision: never changes anything. The trivial reversible map.
export const passThrough: Collision = () => {}

// The momentum-rotate involution on a degree-4 square mesh (direction order
// E, W, N, S). A zero-momentum head-on pair on one axis rotates to the other,
// (s, s, 0, 0) <-> (0, 0, s, s) for s = +-1. Conserves charge and momentum, and
// is its own inverse. This is the canonical 2D reference rule.
export const momentumRotate2D: Collision = (slots, base) => {
  const east = slots[base] ?? 0
  const west = slots[base + 1] ?? 0
  const north = slots[base + 2] ?? 0
  const south = slots[base + 3] ?? 0
  if (north === 0 && south === 0 && east === west && east !== 0) {
    slots[base] = 0
    slots[base + 1] = 0
    slots[base + 2] = east
    slots[base + 3] = east
  } else if (east === 0 && west === 0 && north === south && north !== 0) {
    slots[base + 2] = 0
    slots[base + 3] = 0
    slots[base] = north
    slots[base + 1] = north
  }
}
