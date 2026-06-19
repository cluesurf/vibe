// A Poincare-ball embedding of any hyperbolic Coxeter tessellation, from its Schlafli symbol alone. The
// reflection group acts on the Lorentzian root space (the Gram matrix has signature (n-1, 1)), so the timelike
// eigenvector of the Gram matrix is a base point on the hyperboloid, each chamber maps to matrix times the base
// point, and the hyperboloid point projects to the Poincare ball. This unblocks the coordinate-dependent data
// structures (greedy routing, the Busemann mipmap, the cusp array, the horoball R-tree) on EVERY tessellation,
// not only the ones with a hand-built grid. See plans/data-structures-on-all-tessellations (phase 2).

import {
  reflections,
  multiply,
  matrixKey,
} from '@/code/substrate/coxeter/matrix-group'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import type { DenseMatrix } from '@/code/algebra/linear/dense'
import { Graph } from '@/code/tool/graph'
import type { Embedding } from '@/code/tool/embedding'

const gramMatrix = (symbol: number[]): number[][] => {
  const n = symbol.length + 1
  const gram: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )
  for (let k = 0; k < symbol.length; k++) {
    const c = -Math.cos(Math.PI / symbol[k]!)
    gram[k]![k + 1] = c
    gram[k + 1]![k] = c
  }
  return gram
}

const matVec = (matrix: number[][], v: number[]): number[] =>
  matrix.map(row => row.reduce((s, x, i) => s + x * v[i]!, 0))

export function coxeterPoincareGraph(
  symbol: number[],
  maxCells: number,
): Graph {
  const generators = reflections(symbol)
  const degree = generators.length
  const n = symbol.length + 1
  const dim = n - 1 // the hyperbolic dimension

  // eigendecompose the Gram matrix, the most negative eigenvalue is the timelike axis
  const gram = gramMatrix(symbol)
  const data = new Float64Array(n * n)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) data[i * n + j] = gram[i]![j]!
  const eig = eigSymmetric({
    matrix: { form: 'dense', rows: n, cols: n, data } as DenseMatrix,
  })
  const values = Array.from(eig.values) // ascending
  const vectors = eig.vectors // vectors[i*n+j] = component i of eigenvector j
  const sqrtAbs = values.map(v => Math.sqrt(Math.abs(v)))
  const base = new Array(n).fill(0)
  const scale = 1 / Math.sqrt(-values[0]!)
  for (let i = 0; i < n; i++) base[i] = vectors[i * n + 0]! * scale

  // map a root-basis point to Poincare ball coordinates
  const toPoincare = (p: number[]): number[] => {
    const z = new Array(n).fill(0)
    for (let k = 0; k < n; k++) {
      let q = 0
      for (let i = 0; i < n; i++) q += vectors[i * n + k]! * p[i]!
      z[k] = sqrtAbs[k]! * q
    }
    const time = Math.abs(z[0]!)
    const y = new Array(dim).fill(0)
    for (let k = 1; k < n; k++) {
      let value = z[k]! / (1 + time)
      if (!Number.isFinite(value)) value = 0
      y[k - 1] = Math.max(-0.999999, Math.min(0.999999, value))
    }
    return y
  }

  const identity = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )
  const index = new Map<string, number>([[matrixKey(identity), 0]])
  const matrices: number[][][] = [identity]
  const coords: number[][] = [toPoincare(base)]
  let frontier = [0]
  while (index.size < maxCells && frontier.length > 0) {
    const next: number[] = []
    for (const cell of frontier) {
      for (let g = 0; g < degree; g++) {
        const m = multiply(matrices[cell]!, generators[g]!)
        const id = matrixKey(m)
        if (!index.has(id)) {
          index.set(id, matrices.length)
          matrices.push(m)
          coords.push(toPoincare(matVec(m, base)))
          next.push(index.get(id)!)
        }
      }
      if (index.size >= maxCells) break
    }
    frontier = next
  }

  const size = matrices.length
  const neighbors: Uint32Array[] = matrices.map(m => {
    const ns = new Set<number>()
    for (let g = 0; g < degree; g++) {
      const id = index.get(matrixKey(multiply(m, generators[g]!)))
      if (id !== undefined) ns.add(id)
    }
    return Uint32Array.from([...ns].sort((a, b) => a - b))
  })
  const flat = new Float64Array(size * dim)
  for (let i = 0; i < size; i++)
    for (let k = 0; k < dim; k++) flat[i * dim + k] = coords[i]![k]!
  const embedding: Embedding = {
    form: 'embedding',
    dimension: dim,
    signature: 'riemannian',
    coords: flat,
    manifold: { form: 'hyperbolic', dimension: dim, curvature: -1 },
  }
  return { form: 'graph', size, directed: false, neighbors, embedding }
}
