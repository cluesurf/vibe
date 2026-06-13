// The D4 and F4 root systems, the symmetry algebra of the coin. D4 gives the 24
// directions of the {3,4,3,4} cell and, with the tone axis adjoined, grows to D5
// and the SO(10) grand-unified group. F4 is the full symmetry of the 24-cell.

// The general D_n root system: all (+-1, +-1, 0, ..., 0), the 2n(n-1) roots of
// norm squared 2. rootsD4() is rootsDn(4).
export function rootsDn(n: number): number[][] {
  const roots: number[][] = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (const si of [1, -1]) for (const sj of [1, -1]) {
    const v = new Array<number>(n).fill(0)
    v[i] = si
    v[j] = sj
    roots.push(v)
  }
  return roots
}

// The A_{n-1} roots embedded in R^n: all e_i - e_j with i != j, the n(n-1)
// vectors of su(n).
export function rootsAn(n: number): number[][] {
  const roots: number[][] = []
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) {
    const v = new Array<number>(n).fill(0)
    v[i] = 1
    v[j] = -1
    roots.push(v)
  }
  return roots
}

// Euclidean dot product of two coordinate vectors.
export function dotVec(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * b[i]!, 0)
}

// Exact coordinate equality of two vectors (component for component, ===).
export function vecEqExact(a: number[], b: number[]): boolean {
  return a.every((x, i) => x === b[i])
}

// Reflection of v in the hyperplane perpendicular to root a: v - 2 (v.a)/(a.a) a.
export function reflectRoot(v: number[], a: number[]): number[] {
  const f = (2 * dotVec(v, a)) / dotVec(a, a)
  return v.map((x, i) => x - f * a[i]!)
}

// A set of vectors is a root system if it is closed under reflection in each of
// its own roots (using exact equality to test membership).
export function isRootSystem(roots: number[][]): boolean {
  for (const a of roots) for (const v of roots) {
    const w = reflectRoot(v, a)
    if (!roots.some((r) => vecEqExact(r, w))) return false
  }
  return true
}

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

// The 12 icosahedron vertex directions, the directions of the {5,3,4} coin (the 12
// dodecahedron faces). The vertices (0, +-1, +-phi) and its two cyclic rotations,
// normalized to the unit sphere. Their rotation symmetry is the icosahedral group
// A5, whose permutation rep on these 12 directions carries integer-spin reps only
// (no spinor), the {5,3,4}-versus-{3,4,3,4} distinction.
export function icosahedronVertexDirections(): number[][] {
  const phi = (1 + Math.sqrt(5)) / 2
  const raw: number[][] = []
  for (const a of [1, -1]) for (const b of [phi, -phi]) raw.push([0, a, b], [a, b, 0], [b, 0, a])
  const norm = Math.hypot(...raw[0]!)
  return raw.map((vector) => vector.map((value) => value / norm))
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
