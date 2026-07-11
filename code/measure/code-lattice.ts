// Binary linear codes, Construction A lattices, and CSS quantum codes. The classical chain used
// here: the even-weight parity code [4,3,2] lifts by Construction A to the D4 lattice (24 minimal
// vectors, the D4 root system), and the extended Hamming code [8,4,4] = Reed-Muller RM(1,3) lifts
// to the E8 lattice (240 minimal vectors, the E8 root system). The quantum chain: the CSS
// construction on a nested pair C2 within C1 gives a stabilizer code with k = dim C1 - dim C2
// logical qubits, and the pairs ([4,3,2] over the repetition code) and (RM(1,3) over RM(0,3))
// give the [[4,2,2]] and [[8,3,2]] codes, the smallest quantum error-detecting codes.

export function vectorWeight(vector: readonly number[]): number {
  let weight = 0

  for (const bit of vector) {
    weight += bit
  }

  return weight
}

// All even-weight binary vectors of length n, the parity-check code [n, n-1, 2].
export function evenWeightCode(n: number): number[][] {
  const out: number[][] = []

  for (let m = 0; m < 1 << n; m++) {
    const vector = Array.from(
      { length: n },
      (unused, i) => (m >> i) & 1,
    )

    if (vectorWeight(vector) % 2 === 0) {
      out.push(vector)
    }
  }

  return out
}

// The Reed-Muller code RM(1,3), the extended Hamming code [8,4,4]: the span of the all-ones vector
// and the three coordinate hyperplane indicators.
export function reedMuller13(): number[][] {
  const generators = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
  ]

  const out: number[][] = []

  for (let m = 0; m < 16; m++) {
    const vector = new Array<number>(8).fill(0)

    for (let g = 0; g < 4; g++) {
      if ((m >> g) & 1) {
        for (let i = 0; i < 8; i++) {
          vector[i] = vector[i]! ^ generators[g]![i]!
        }
      }
    }

    out.push(vector)
  }

  return out
}

// The repetition code {all-zeros, all-ones} of length n, RM(0, log2 n).
export function repetitionCode(n: number): number[][] {
  return [new Array<number>(n).fill(0), new Array<number>(n).fill(1)]
}

// The dual code: every vector with even overlap against all codewords.
export function dualCode(
  code: readonly number[][],
  n: number,
): number[][] {
  const out: number[][] = []

  for (let m = 0; m < 1 << n; m++) {
    const vector = Array.from(
      { length: n },
      (unused, i) => (m >> i) & 1,
    )

    const orthogonal = code.every(codeword => {
      let parity = 0

      for (let i = 0; i < n; i++) {
        parity ^= codeword[i]! & vector[i]!
      }

      return parity === 0
    })

    if (orthogonal) {
      out.push(vector)
    }
  }

  return out
}

// Construction A: the lattice of integer vectors whose mod-2 residue is a codeword. Returns the
// minimal nonzero norm and the number of minimal vectors (the kissing number), by exhaustive
// enumeration of coordinates in [-range, range].
export function constructionAMinimalVectors(input: {
  code: readonly number[][]
  n: number
  range: number
}): { norm: number; count: number } {
  const { code, n, range } = input
  const residues = new Set(code.map(codeword => codeword.join('')))

  let bestNorm = Infinity
  let count = 0

  const vector: number[] = []

  const recurse = (index: number): void => {
    if (index === n) {
      if (vector.every(x => x === 0)) {
        return
      }

      const residue = vector.map(x => ((x % 2) + 2) % 2).join('')

      if (!residues.has(residue)) {
        return
      }

      let norm = 0

      for (const x of vector) {
        norm += x * x
      }

      if (norm < bestNorm) {
        bestNorm = norm
        count = 1
      } else if (norm === bestNorm) {
        count++
      }

      return
    }

    for (let c = -range; c <= range; c++) {
      vector.push(c)
      recurse(index + 1)
      vector.pop()
    }
  }

  recurse(0)

  return { norm: bestNorm, count }
}

// Whether a set of binary vectors is closed under addition mod 2 (a linear code, so its
// Construction A lift is closed under lattice addition). The odd-weight coset is not.
export function closedUnderAddition(
  vectors: readonly number[][],
  n: number,
): boolean {
  const set = new Set(vectors.map(vector => vector.join('')))

  for (const a of vectors) {
    for (const b of vectors) {
      const sum: number[] = []

      for (let i = 0; i < n; i++) {
        sum.push(a[i]! ^ b[i]!)
      }

      if (!set.has(sum.join(''))) {
        return false
      }
    }
  }

  return true
}

// The CSS construction on a candidate pair (C1, C2): X-stabilizers supported on the codewords of
// C2, Z-stabilizers on the codewords of the dual of C1. The stabilizers all commute exactly when
// every X support meets every Z support evenly, which holds when C2 is nested inside C1. Returns
// the commutation check, the logical-qubit count k = dim C1 - dim C2, and the code distance
// d = min(dZ, dX) where dZ is the minimum weight in C1 outside C2 and dX the minimum weight in the
// dual of C2 outside the dual of C1.
export function cssCode(input: {
  c1: readonly number[][]
  c2: readonly number[][]
  n: number
}): { commute: boolean; k: number; distance: number } {
  const { c1, c2, n } = input
  const c1Dual = dualCode(c1, n)

  let commute = true

  for (const x of c2) {
    for (const z of c1Dual) {
      let overlap = 0

      for (let i = 0; i < n; i++) {
        overlap += x[i]! & z[i]!
      }

      if (overlap % 2 !== 0) {
        commute = false
      }
    }
  }

  const k = Math.log2(c1.length) - Math.log2(c2.length)

  const c2Set = new Set(c2.map(codeword => codeword.join('')))
  const zWeights = c1
    .filter(
      codeword =>
        !c2Set.has(codeword.join('')) && vectorWeight(codeword) > 0,
    )
    .map(vectorWeight)

  const c2Dual = dualCode(c2, n)
  const c1DualSet = new Set(c1Dual.map(codeword => codeword.join('')))
  const xWeights = c2Dual
    .filter(
      codeword =>
        !c1DualSet.has(codeword.join('')) && vectorWeight(codeword) > 0,
    )
    .map(vectorWeight)

  const distance = Math.min(
    zWeights.length ? Math.min(...zWeights) : Infinity,
    xWeights.length ? Math.min(...xWeights) : Infinity,
  )

  return { commute, k, distance }
}
