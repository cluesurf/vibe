// Exchange statistics on the emergent walk: the Hong-Ou-Mandel effect and the many-body Fock
// structure of free walks. For non-interacting dynamics the N-particle amplitudes are the
// determinant (fermions) or permanent (bosons) of single-particle propagator entries, so the
// whole Fock structure at scale reduces to determinants of the walk propagator: exact, with no
// exponential cost, and Pauli exclusion holds identically (a determinant with equal rows is
// zero).

export type Complex = readonly [number, number]

export const cAdd = (a: Complex, b: Complex): Complex => [
  a[0] + b[0],
  a[1] + b[1],
]

export const cMul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

export const cAbs2 = (a: Complex): number => a[0] * a[0] + a[1] * a[1]

// The two-mode balanced beam splitter, the walk coin at the balanced angle.
export function balancedSplitter(): Complex[][] {
  const s = 1 / Math.SQRT2

  return [
    [
      [s, 0],
      [s, 0],
    ],
    [
      [s, 0],
      [-s, 0],
    ],
  ]
}

// The permanent of a 2x2 complex matrix, the boson coincidence amplitude.
export function permanent2(matrix: Complex[][]): Complex {
  return cAdd(
    cMul(matrix[0]![0]!, matrix[1]![1]!),
    cMul(matrix[0]![1]!, matrix[1]![0]!),
  )
}

// The determinant of a 2x2 complex matrix, the fermion coincidence amplitude.
export function determinant2(matrix: Complex[][]): Complex {
  return cAdd(cMul(matrix[0]![0]!, matrix[1]![1]!), [
    -cMul(matrix[0]![1]!, matrix[1]![0]!)[0],
    -cMul(matrix[0]![1]!, matrix[1]![0]!)[1],
  ])
}

// The determinant of an N x N complex matrix by Gaussian elimination with partial pivoting.
export function determinantN(input: Complex[][]): Complex {
  const n = input.length
  const matrix = input.map(row =>
    row.map(entry => [...entry] as [number, number]),
  )

  let det: Complex = [1, 0]

  for (let col = 0; col < n; col++) {
    // pivot on the largest magnitude entry
    let pivot = col

    for (let row = col + 1; row < n; row++) {
      if (cAbs2(matrix[row]![col]!) > cAbs2(matrix[pivot]![col]!)) {
        pivot = row
      }
    }

    if (cAbs2(matrix[pivot]![col]!) < 1e-30) {
      return [0, 0]
    }

    if (pivot !== col) {
      const swap = matrix[pivot]!
      matrix[pivot] = matrix[col]!
      matrix[col] = swap
      det = [-det[0], -det[1]]
    }

    const lead = matrix[col]![col]!
    det = cMul(det, lead)

    const inverseMagnitude = 1 / cAbs2(lead)
    const leadInverse: Complex = [
      lead[0] * inverseMagnitude,
      -lead[1] * inverseMagnitude,
    ]

    for (let row = col + 1; row < n; row++) {
      const factor = cMul(matrix[row]![col]!, leadInverse)

      for (let k = col; k < n; k++) {
        const product = cMul(factor, matrix[col]![k]!)
        matrix[row]![k] = [
          matrix[row]![k]![0] - product[0],
          matrix[row]![k]![1] - product[1],
        ]
      }
    }
  }

  return det
}

// One step of the coined walk as a matrix action on a position-spinor vector of dimension
// 2 * size (right components first, then left).
export function walkStep(input: {
  vector: Complex[]
  size: number
  mass: number
}): Complex[] {
  const { vector, size, mass } = input
  const c = Math.cos(mass)
  const s = Math.sin(mass)
  const next: Complex[] = new Array(2 * size).fill([0, 0])

  for (let x = 0; x < size; x++) {
    const right = vector[x]!
    const left = vector[size + x]!

    const coinedRight = cAdd(cMul([c, 0], right), cMul([0, -s], left))
    const coinedLeft = cAdd(cMul([0, -s], right), cMul([c, 0], left))

    next[(x + 1) % size] = cAdd(next[(x + 1) % size]!, coinedRight)
    next[size + ((x - 1 + size) % size)] = cAdd(
      next[size + ((x - 1 + size) % size)]!,
      coinedLeft,
    )
  }

  return next
}

// The single-particle propagator column for a basis start: evolve the basis vector `from` for
// `beats` steps and return the full amplitude vector.
export function propagatorColumn(input: {
  from: number
  size: number
  mass: number
  beats: number
}): Complex[] {
  const { from, size, mass, beats } = input

  let vector: Complex[] = new Array(2 * size).fill([0, 0])
  vector[from] = [1, 0]

  for (let t = 0; t < beats; t++) {
    vector = walkStep({ vector, size, mass })
  }

  return vector
}
