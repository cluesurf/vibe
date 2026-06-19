// The exact Coxeter math behind the general engine: the Schlafli (Gram) matrix of a
// linear Coxeter symbol {p, q, r, ...}, its signature (which decides spherical vs flat vs
// hyperbolic), the mirror normals and metric in the model space (via eigendecomposition),
// and the dihedral-angle overflow that decides how many cells fit around a ridge. This is
// the shared, exact foundation for the reflection engine and the auto-selection test.

export type Geometry =
  | 'spherical'
  | 'euclidean'
  | 'hyperbolic'
  | 'higher'

// The Gram matrix of the mirror normals for the linear diagram {p1, ..., pk}:
// G_ii = 1, G_{i,i+1} = -cos(pi / p_i), zero for non-adjacent mirrors (perpendicular).
export function gramMatrix(symbol: number[]): number[][] {
  const m = symbol.length + 1
  const G: number[][] = Array.from({ length: m }, () =>
    new Array<number>(m).fill(0),
  )
  for (let i = 0; i < m; i++) {
    G[i]![i] = 1
  }
  for (let i = 0; i < symbol.length; i++) {
    const c = -Math.cos(Math.PI / (symbol[i] ?? 2))
    G[i]![i + 1] = c
    G[i + 1]![i] = c
  }
  return G
}

// Jacobi eigenvalue algorithm for a small symmetric matrix. Returns eigenvalues and the
// matrix Q whose columns are the eigenvectors (A = Q diag(values) Q^T). Robust for the tiny
// 3x3 and 4x4 matrices here.
export function symmetricEigen(input: { matrix: number[][] }): {
  values: number[]
  vectors: number[][]
} {
  const n = input.matrix.length
  const a = input.matrix.map(row => row.slice())
  const v: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += a[p]![q]! * a[p]![q]!
      }
    }
    if (off < 1e-28) {
      break
    }
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p]![q]!) < 1e-18) {
          continue
        }
        const theta = (a[q]![q]! - a[p]![p]!) / (2 * a[p]![q]!)
        const t =
          Math.sign(theta || 1) /
          (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c
        for (let k = 0; k < n; k++) {
          const akp = a[k]![p]!
          const akq = a[k]![q]!
          a[k]![p] = c * akp - s * akq
          a[k]![q] = s * akp + c * akq
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p]![k]!
          const aqk = a[q]![k]!
          a[p]![k] = c * apk - s * aqk
          a[q]![k] = s * apk + c * aqk
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k]![p]!
          const vkq = v[k]![q]!
          v[k]![p] = c * vkp - s * vkq
          v[k]![q] = s * vkp + c * vkq
        }
      }
    }
  }
  const values = a.map((row, i) => row[i]!)
  return { values, vectors: v }
}

// Classify the geometry by the signature of the Gram matrix (counting negative eigenvalues).
export function classifyGeometry(symbol: number[]): Geometry {
  const { values } = symmetricEigen({ matrix: gramMatrix(symbol) })
  const tol = 1e-9
  let neg = 0
  let zero = 0
  for (const lam of values) {
    if (lam < -tol) {
      neg++
    } else if (lam < tol) {
      zero++
    }
  }
  if (zero > 0) {
    return 'euclidean'
  }
  if (neg === 0) {
    return 'spherical'
  }
  if (neg === 1) {
    return 'hyperbolic'
  }
  return 'higher'
}

// The cell of a regular honeycomb symbol (drop the last entry) and its vertex figure
// (drop the first entry), the two sub-symbols the honeycomb classifiers test.
export function honeycombCell(symbol: number[]): number[] {
  return symbol.slice(0, -1)
}

export function honeycombVertexFigure(symbol: number[]): number[] {
  return symbol.slice(1)
}

// A COMPACT regular honeycomb: hyperbolic overall, with both finite (spherical) cells
// AND a finite (spherical) vertex figure. The {5,3,4} regime.
export function isCompactHoneycomb(symbol: number[]): boolean {
  return (
    classifyGeometry(symbol) === 'hyperbolic' &&
    classifyGeometry(honeycombCell(symbol)) === 'spherical' &&
    classifyGeometry(honeycombVertexFigure(symbol)) === 'spherical'
  )
}

// An IDEAL regular honeycomb with finite cells: hyperbolic overall, spherical (finite)
// cells, but a Euclidean (ideal, infinite) vertex figure. The {3,4,3,4} regime, whose
// vertex figure is the cubic cusp {4,3,4}.
export function isIdealFiniteCellHoneycomb(symbol: number[]): boolean {
  return (
    classifyGeometry(symbol) === 'hyperbolic' &&
    classifyGeometry(honeycombCell(symbol)) === 'spherical' &&
    classifyGeometry(honeycombVertexFigure(symbol)) === 'euclidean'
  )
}

// Every COMPACT regular hyperbolic honeycomb of the given dimension (symbol length), with each entry
// scanned over 3..maxEntry. A symbol of length `dimension` is kept when isCompactHoneycomb holds. The
// enumeration the dimension-window classification runs over (compact crystals exist only in 2, 3, 4).
export function enumerateCompactHoneycombs(input: {
  dimension: number
  maxEntry: number
}): number[][] {
  const { dimension, maxEntry } = input
  const found: number[][] = []
  const rec = (prefix: number[]): void => {
    if (prefix.length === dimension) {
      if (isCompactHoneycomb(prefix)) {
        found.push(prefix.slice())
      }
      return
    }
    for (let p = 3; p <= maxEntry; p++) {
      rec([...prefix, p])
    }
  }
  rec([])
  return found
}

// The mirror normals v_i (rows) in the model space, with the diagonal metric J (entries
// +1 spacelike, -1 timelike). Built from the eigendecomposition so that the J-inner product
// of the normals reproduces the Gram matrix exactly. For a hyperbolic symbol J has exactly
// one -1 (the timelike axis), which is the index returned as timeAxis.
export function mirrorFrame(symbol: number[]): {
  normals: number[][]
  metric: number[]
  timeAxis: number
} {
  const G = gramMatrix(symbol)
  const m = G.length
  const { values, vectors } = symmetricEigen({ matrix: G })
  const metric = values.map(lam => (lam < 0 ? -1 : 1))
  const normals: number[][] = Array.from({ length: m }, () =>
    new Array<number>(m).fill(0),
  )
  for (let i = 0; i < m; i++) {
    for (let a = 0; a < m; a++) {
      normals[i]![a] =
        (vectors[i]![a] ?? 0) * Math.sqrt(Math.abs(values[a] ?? 0))
    }
  }
  let timeAxis = metric.findIndex(g => g < 0)
  if (timeAxis < 0) {
    timeAxis = m - 1
  }
  return { normals, metric, timeAxis }
}

// The dihedral angle of the regular polyhedron {p, q} (the angle along an edge), in degrees.
// sin(dihedral / 2) = cos(pi/q) / sin(pi/p). Real only for a finite (spherical) cell, where
// the right side is below 1. At 1 the cell is flat ({6,3}), above 1 there is no finite cell.
export function dihedralAngleDegrees(input: {
  p: number
  q: number
}): number {
  const { p, q } = input
  const s = Math.cos(Math.PI / q) / Math.sin(Math.PI / p)
  if (s > 1) {
    return Number.NaN
  }
  return (2 * Math.asin(s) * 180) / Math.PI
}

// For a 3D honeycomb {p, q, r}: how the cell {p, q} packs around an edge. r copies meet
// around each edge, so the total angle is r times the cell's dihedral. Under 360 closes into
// a finite ball (spherical), exactly 360 is flat, over 360 overflows into hyperbolic.
export function edgeRegime(input: {
  p: number
  q: number
  r: number
}): {
  totalAngleDegrees: number
  regime: 'spherical' | 'euclidean' | 'hyperbolic'
} {
  const d = dihedralAngleDegrees({ p: input.p, q: input.q })
  const total = input.r * d
  const regime =
    total < 360 - 0.5
      ? 'spherical'
      : total > 360 + 0.5
        ? 'hyperbolic'
        : 'euclidean'
  return { totalAngleDegrees: total, regime }
}
