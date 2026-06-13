// The D4 and F4 root systems, the symmetry algebra of the coin. D4 gives the 24
// directions of the {3,4,3,4} cell and, with the tone axis adjoined, grows to D5
// and the SO(10) grand-unified group. F4 is the full symmetry of the 24-cell.

// D4, the 24 roots, all coordinate permutations of (+-1, +-1, 0, 0). These are
// the 24 directions of the cell, each of norm squared 2.
export function rootsD4(): number[][] {
  const roots: number[][] = []
  for (let first = 0; first < 4; first++) {
    for (let second = first + 1; second < 4; second++) {
      for (const signFirst of [1, -1]) {
        for (const signSecond of [1, -1]) {
          const root = [0, 0, 0, 0]
          root[first] = signFirst
          root[second] = signSecond
          roots.push(root)
        }
      }
    }
  }
  return roots
}

// F4, the 48 roots: the 24 long D4 roots, plus 24 short roots, the 8 of
// (+-1, 0, 0, 0) and the 16 of (+-1/2, +-1/2, +-1/2, +-1/2).
export function rootsF4(): number[][] {
  const roots = rootsD4()
  for (let axis = 0; axis < 4; axis++) {
    for (const sign of [1, -1]) {
      const root = [0, 0, 0, 0]
      root[axis] = sign
      roots.push(root)
    }
  }
  for (const a of [0.5, -0.5]) {
    for (const b of [0.5, -0.5]) {
      for (const c of [0.5, -0.5]) {
        for (const d of [0.5, -0.5]) {
          roots.push([a, b, c, d])
        }
      }
    }
  }
  return roots
}
