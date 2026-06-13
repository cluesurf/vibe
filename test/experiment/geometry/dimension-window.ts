// P62: the dimension window (why the crystal substrate is low-dimensional).
// Is the substrate's 3D spatial form a choice or a constraint? The construction is fully
// general: a regular hyperbolic honeycomb {p, q, r, ...} can be written in any dimension. But
// requiring it to be a genuine CRYSTAL with finite cells (a compact regular hyperbolic
// honeycomb) is a hard constraint. A regular honeycomb {p1, ..., pk} tiles a k-dimensional
// space, and its type is read from the Schlafli (Gram) matrix of its reflection group:
//   positive definite  -> spherical (a finite polytope),
//   positive semidefinite (a zero eigenvalue) -> Euclidean (tiles flat space),
//   exactly one negative eigenvalue, signature (k, 1) -> hyperbolic (tiles H^k).
// It is COMPACT (finite cells, finite vertex figures) when both the cell (drop the last entry)
// and the vertex figure (drop the first) are spherical. Enumerating these shows compact
// regular hyperbolic honeycombs exist ONLY in dimensions 2, 3, and 4, and none at 5 and above.
// So the crystal substrate cannot be an arbitrary n-dimensional thing: finite cells force the
// spatial dimension into {2, 3, 4}, and 3 (four-dimensional spacetime) sits inside that window.
// Run: npx tsx code/experiment/p62-dimension-window.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Leading principal minors of the (k+1)x(k+1) Schlafli/Gram matrix of a linear Coxeter
// diagram for the symbol {p1, ..., pk}: G_ii = 1, G_{i,i+1} = -cos(pi / p_i).
function gram(symbol: number[]): number[][] {
  const m = symbol.length + 1
  const G: number[][] = Array.from({ length: m }, () => new Array<number>(m).fill(0))
  for (let i = 0; i < m; i++) G[i]![i] = 1
  for (let i = 0; i < symbol.length; i++) {
    const c = -Math.cos(Math.PI / (symbol[i] ?? 2))
    G[i]![i + 1] = c
    G[i + 1]![i] = c
  }
  return G
}

function determinant(a: number[][]): number {
  const n = a.length
  const m = a.map((row) => row.slice())
  let det = 1
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r]![col]!) > Math.abs(m[pivot]![col]!)) pivot = r
    if (Math.abs(m[pivot]![col]!) < 1e-15) return 0
    if (pivot !== col) {
      const tmp = m[pivot]!
      m[pivot] = m[col]!
      m[col] = tmp
      det = -det
    }
    det *= m[col]![col]!
    for (let r = col + 1; r < n; r++) {
      const f = m[r]![col]! / m[col]![col]!
      for (let c = col; c < n; c++) m[r]![c]! -= f * m[col]![c]!
    }
  }
  return det
}

type Kind = 'spherical' | 'euclidean' | 'hyperbolic' | 'higher'

// Classify a linear Coxeter symbol by the signature of its Gram matrix, read off the leading
// principal minors (Sylvester): number of negative eigenvalues = sign changes in 1, D1, ..., Dm.
function classify(symbol: number[]): Kind {
  const G = gram(symbol)
  const m = G.length
  const minors: number[] = [1]
  for (let k = 1; k <= m; k++) {
    const sub = G.slice(0, k).map((row) => row.slice(0, k))
    minors.push(determinant(sub))
  }
  const tol = 1e-9
  // Euclidean: positive definite up to the last, with the full determinant zero.
  if (Math.abs(minors[m] ?? 0) < tol) {
    let posDefBefore = true
    for (let k = 1; k < m; k++) if ((minors[k] ?? 0) <= tol) posDefBefore = false
    if (posDefBefore) return 'euclidean'
  }
  let signChanges = 0
  let prev = 1
  for (let k = 1; k <= m; k++) {
    const cur = minors[k] ?? 0
    if (Math.abs(cur) < tol) return 'euclidean' // degenerate interior minor, treat as parabolic
    if (cur * prev < 0) signChanges++
    prev = cur
  }
  if (signChanges === 0) return 'spherical'
  if (signChanges === 1) return 'hyperbolic'
  return 'higher'
}

function isCompactHyperbolicHoneycomb(symbol: number[]): boolean {
  if (symbol.length < 2) return false
  if (classify(symbol) !== 'hyperbolic') return false
  const cell = symbol.slice(0, -1)
  const vertexFigure = symbol.slice(1)
  return classify(cell) === 'spherical' && classify(vertexFigure) === 'spherical'
}

function enumerate(dimension: number, maxP: number): number[][] {
  const found: number[][] = []
  const rec = (prefix: number[]): void => {
    if (prefix.length === dimension) {
      if (isCompactHyperbolicHoneycomb(prefix)) found.push(prefix.slice())
      return
    }
    for (let p = 3; p <= maxP; p++) rec([...prefix, p])
  }
  rec([])
  return found
}

export function dimensionWindow(input: { maxP: number; maxDimension: number }): {
  byDimension: { dimension: number; count: number; examples: string[] }[]
  compactWindow: number[]
  vanishesAbove: number
} {
  const byDimension: { dimension: number; count: number; examples: string[] }[] = []
  for (let n = 2; n <= input.maxDimension; n++) {
    const found = enumerate(n, input.maxP)
    byDimension.push({
      dimension: n,
      count: found.length,
      examples: found.slice(0, 6).map((s) => `{${s.join(',')}}`),
    })
  }
  const compactWindow = byDimension.filter((d) => d.count > 0).map((d) => d.dimension)
  const firstEmpty = byDimension.find((d) => d.count === 0)
  return {
    byDimension,
    compactWindow,
    vanishesAbove: (compactWindow[compactWindow.length - 1] ?? 0),
  }
}

export default defineExperiment({
  id: 'geometry/dimension-window',
  title: 'compact hyperbolic crystals only in dimensions 2, 3, 4 (H3 = 4, H4 = 5, H5 plus = 0)',
  category: 'geometry',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const r = dimensionWindow({ maxP: 8, maxDimension: 6 })
    const count = (n: number): number =>
      r.byDimension.find((d) => d.dimension === n)?.count ?? -1
    const ok =
      count(3) === 4 &&
      count(4) === 5 &&
      count(5) === 0 &&
      count(6) === 0 &&
      r.compactWindow.join(',') === '2,3,4'
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'enumerating compact regular hyperbolic honeycombs reproduces the known classification and shows they exist only in dimensions two three and four',
      metrics: {
        h2: count(2),
        h3: count(3),
        h4: count(4),
        h5: count(5),
      },
    })
  },
})
