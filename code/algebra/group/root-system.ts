// The D4 and F4 root systems, the symmetry algebra of the coin. D4 gives the 24
// directions of the {3,4,3,4} cell and, with the tone axis adjoined, grows to D5
// and the SO(10) grand-unified group. F4 is the full symmetry of the 24-cell.

// The general D_n root system: all (+-1, +-1, 0, ..., 0), the 2n(n-1) roots of
// norm squared 2. rootsD4() is rootsDn(4).
export function rootsDn(n: number): number[][] {
  const roots: number[][] = []

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const v = new Array<number>(n).fill(0)
          v[i] = si
          v[j] = sj
          roots.push(v)
        }
      }
    }
  }

  return roots
}

// The A_{n-1} roots embedded in R^n: all e_i - e_j with i != j, the n(n-1)
// vectors of su(n).
export function rootsAn(n: number): number[][] {
  const roots: number[][] = []

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const v = new Array<number>(n).fill(0)
        v[i] = 1
        v[j] = -1
        roots.push(v)
      }
    }
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
  for (const a of roots) {
    for (const v of roots) {
      const w = reflectRoot(v, a)

      if (!roots.some(r => vecEqExact(r, w))) {
        return false
      }
    }
  }

  return true
}

// Does the Standard Model semisimple algebra A2 (+) A1 (su(3) x su(2)) embed in this root system?
// True iff the roots contain an A2 sub-root-system (a pair a, b at 120 degrees, dot = -1, with a + b
// also a root) plus an A1 root c orthogonal to the whole A2 (the commuting su(2)).
export function standardModelEmbedsInRootSystem(
  roots: number[][],
): boolean {
  for (const a of roots) {
    for (const b of roots) {
      if (dotVec(a, b) !== -1) {
        continue
      } // 120 degrees -> A2 generator pair

      const ab = a.map((x, i) => x + b[i]!)

      if (!roots.some(r => vecEqExact(r, ab))) {
        continue
      } // a + b must be a root (A2 closes)

      // an A1 orthogonal to the whole A2 (orthogonal to a and b, hence to a + b)
      if (roots.some(c => dotVec(c, a) === 0 && dotVec(c, b) === 0)) {
        return true
      }
    }
  }

  return false
}

// The positive-chirality spinor weights of D_n (so(2n)): the half-integer vectors (+-1/2)^n with an
// EVEN number of minus signs, the 2^(n-1) weights of one spinor representation. For n = 5 these are the
// 16 weights of the so(10) generation. The odd-parity set is the conjugate spinor.
export function spinorWeightsDn(n: number): number[][] {
  const weights: number[][] = []

  const build = (acc: number[]): void => {
    if (acc.length === n) {
      if (acc.filter(x => x < 0).length % 2 === 0) {
        weights.push(acc)
      }

      return
    }

    build([...acc, 0.5])
    build([...acc, -0.5])
  }

  build([])

  return weights
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

// B4, the 32 roots of so(9): the 24 long D4 roots (+-1, +-1, 0, 0), norm squared 2,
// plus the 8 short axis roots (+-1, 0, 0, 0) and permutations, norm squared 1. This
// is a TWO-SPEED coin, a long step moves two coordinates per beat, a short step moves
// one, which is what a moving bound state needs (a slow centre of mass with fast
// internal parts). All roots are integer, so the lattice mesh stays exact.
export function rootsB4(): number[][] {
  const roots: number[][] = rootsD4()

  for (let axis = 0; axis < 4; axis++) {
    for (const sign of [1, -1]) {
      const root = [0, 0, 0, 0]
      root[axis] = sign
      roots.push(root)
    }
  }

  return roots
}

// The hypercubic axis directions in `dimension` dimensions: the 2*dimension unit vectors +-e_i. This is the
// nearest-neighbour coin of the cubic / hypercubic lattice, used as the anisotropic control against the D4
// 24-direction set in the Lorentz and discreteness tests.
export function hypercubicAxes(dimension: number): number[][] {
  const axes: number[][] = []

  for (let axis = 0; axis < dimension; axis++) {
    for (const sign of [1, -1]) {
      const direction = new Array<number>(dimension).fill(0)
      direction[axis] = sign
      axes.push(direction)
    }
  }

  return axes
}

// A fixed set of normalized 4D probe directions spanning axis, face-diagonal, body-diagonal, and several
// asymmetric directions. Used to sample the angular anisotropy of a lattice dispersion (the spread of the phase
// speed across directions), where a single axis-versus-diagonal pair can be accidentally isotropic.
export function probeDirections4D(): number[][] {
  const raw = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 1],
    [2, 1, 0, 0],
    [3, 1, 1, 0],
    [2, 1, 1, 1],
  ]

  return raw.map(v => {
    const norm = Math.hypot(...v)

    return v.map(x => x / norm)
  })
}

// The 12 icosahedron vertex directions, the directions of the {5,3,4} coin (the 12
// dodecahedron faces). The vertices (0, +-1, +-phi) and its two cyclic rotations,
// normalized to the unit sphere. Their rotation symmetry is the icosahedral group
// A5, whose permutation rep on these 12 directions carries integer-spin reps only
// (no spinor), the {5,3,4}-versus-{3,4,3,4} distinction.
export function icosahedronVertexDirections(): number[][] {
  const phi = (1 + Math.sqrt(5)) / 2
  const raw: number[][] = []

  for (const a of [1, -1]) {
    for (const b of [phi, -phi]) {
      raw.push([0, a, b], [a, b, 0], [b, 0, a])
    }
  }

  const norm = Math.hypot(...raw[0]!)

  return raw.map(vector => vector.map(value => value / norm))
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

// The 8 simple roots of E8 in the Bourbaki basis. The Dynkin diagram is the chain a1-a3-a4-a5-a6-a7-a8 with a2
// branching off a4. The exceptional ladder is read off this diagram by dropping one end node at a time, dropping
// a8 gives E7, dropping a7 too gives E6, dropping the exceptional node a1 gives D5 = so(10), dropping a6 gives
// D4 = the 24-cell coin. So the 24-cell sits at the bottom of the forced exceptional tower E8 > E7 > E6 > D5 > D4.
export function e8SimpleRoots(): number[][] {
  const axis = (i: number): number[] => {
    const v = new Array(8).fill(0)
    v[i] = 1

    return v
  }

  const minus = (a: number[], b: number[]): number[] =>
    a.map((x, i) => x - b[i]!)

  const plus = (a: number[], b: number[]): number[] =>
    a.map((x, i) => x + b[i]!)

  return [
    [0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5], // a1, the exceptional half-integer node
    plus(axis(0), axis(1)), // a2, the branch node
    minus(axis(1), axis(0)), // a3
    minus(axis(2), axis(1)), // a4
    minus(axis(3), axis(2)), // a5
    minus(axis(4), axis(3)), // a6
    minus(axis(5), axis(4)), // a7
    minus(axis(6), axis(5)), // a8
  ]
}

// The 240 roots of E8, generated as the reflection closure of the E8 simple roots. The largest exceptional root
// system, the roof of the chain D4 (the coin) up to E8.
export function rootsE8(): number[][] {
  return reflectionClosure(e8SimpleRoots())
}

// The shells of {-1,0,+1}^n grouped by squared length, the nonzero vectors keyed by their norm squared.
// For n = 4 the shells are the regular 4-polytopes: norm-1 is the 16-cell (8), norm-2 is the 24-CELL (24, the
// dock and the D4 roots), norm-3 is a 32-cell, norm-4 is the tesseract (16). So the dock is generated by four
// ternary tones, the geometry is the tone.
export function ternaryShells(n: number): Map<number, number[][]> {
  const shells = new Map<number, number[][]>()

  const recurse = (vector: number[]): void => {
    if (vector.length === n) {
      const normSquared = vector.reduce(
        (sum, value) => sum + value * value,
        0,
      )

      if (normSquared === 0) {
        return
      }

      if (!shells.has(normSquared)) {
        shells.set(normSquared, [])
      }

      shells.get(normSquared)!.push([...vector])

      return
    }

    for (const value of [-1, 0, 1]) {
      recurse([...vector, value])
    }
  }

  recurse([])

  return shells
}

// A canonical rounded key for a vector, for membership and closure over rational or half-integer coordinates.
export function vectorKey(vector: number[]): string {
  return vector.map(value => Math.round(value * 1e6) / 1e6).join(',')
}

// The closure of a set of roots under reflection in its own members, the smallest reflection-closed set
// containing the seed. Reflecting the four simple roots of a Coxeter diagram rebuilds the whole root system
// (the F4 diagram rebuilds the 24-cell and its dual).
export function reflectionClosure(seed: number[][]): number[][] {
  const found = new Map<string, number[]>()

  const add = (vector: number[]): void => {
    const key = vectorKey(vector)

    if (!found.has(key)) {
      found.set(key, vector)
    }
  }

  for (const root of seed) {
    add(root)
  }

  let changed = true

  while (changed) {
    changed = false

    const current = [...found.values()]

    for (const a of current) {
      for (const v of current) {
        const reflected = reflectRoot(v, a)

        if (!found.has(vectorKey(reflected))) {
          add(reflected)
          changed = true
        }
      }
    }
  }

  return [...found.values()]
}

// The Cartan matrix of a set of simple roots, A[i][j] = 2 (s_i . s_j) / (s_j . s_j), rounded to the integer it
// must be. The Cartan matrix IS the Dynkin diagram, so its symmetries are the diagram (outer) automorphisms.
export function cartanMatrix(simpleRoots: number[][]): number[][] {
  return simpleRoots.map(si =>
    simpleRoots.map(sj =>
      Math.round((2 * dotVec(si, sj)) / dotVec(sj, sj)),
    ),
  )
}

// The minimal nonzero vectors of the Construction A lattice of a binary code: the lattice is the integer points
// whose mod-2 reduction is a codeword, and for the even-weight code in dimension 4 this lattice is D4, whose
// minimal vectors are the 24 dock roots. So the dock also comes from a binary code, the information seed.
export function constructionAMinimalVectors(
  codewords: number[][],
  n: number,
): number[][] {
  // the lattice min vectors are the norm-2 integer vectors reducing to a codeword mod 2. Two families reach norm 2:
  // (+-1, +-1, 0, ...) reducing to a weight-2 codeword, scanned over small integer vectors.
  const minimal: number[][] = []
  const inCode = new Set(codewords.map(c => c.join(',')))

  const recurse = (vector: number[]): void => {
    if (vector.length === n) {
      const normSquared = vector.reduce(
        (sum, value) => sum + value * value,
        0,
      )

      if (normSquared !== 2) {
        return
      }

      const reduced = vector
        .map(value => ((value % 2) + 2) % 2)
        .join(',')

      if (inCode.has(reduced)) {
        minimal.push([...vector])
      }

      return
    }

    for (const value of [-1, 0, 1]) {
      recurse([...vector, value])
    }
  }

  recurse([])

  return minimal
}

// The even-weight binary code in dimension n: all 0/1 vectors with an even number of ones, the [n, n-1, 2] code.
export function evenWeightCode(n: number): number[][] {
  const words: number[][] = []

  const recurse = (vector: number[]): void => {
    if (vector.length === n) {
      if (vector.reduce((sum, value) => sum + value, 0) % 2 === 0) {
        words.push([...vector])
      }

      return
    }

    for (const bit of [0, 1]) {
      recurse([...vector, bit])
    }
  }

  recurse([])

  return words
}
