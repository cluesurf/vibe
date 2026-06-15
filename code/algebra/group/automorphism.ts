// Symmetry counts for a root system: the Weyl (reflection) group order, the full automorphism group order, the
// outer automorphism order (their ratio), and the diagram automorphism order from a Cartan matrix. The outer
// automorphism is the Dynkin-diagram symmetry, and outer order 6 (the symmetric group S3) is TRIALITY, which is
// unique to D4. This is the algebra that singles out the {3,4,3,4} dock among all root systems.

import { reflectRoot, dotVec, vectorKey } from '@/code/algebra/group/root-system'

// reflection of the standard basis under a root, as the matrix whose column k is the image of e_k.
function reflectionMatrix(root: number[], dimension: number): number[][] {
  const columns: number[][] = []
  for (let k = 0; k < dimension; k++) {
    const basis = new Array<number>(dimension).fill(0)
    basis[k] = 1
    columns.push(reflectRoot(basis, root))
  }
  // store as rows of images: matrix[k] = image of e_k (a column), composed via composeColumns below.
  return columns
}

function composeColumns(after: number[][], before: number[][], dimension: number): number[][] {
  // (after . before)(e_k) = after(before(e_k)). before[k] is the image of e_k; expand it in after's columns.
  const result: number[][] = []
  for (let k = 0; k < dimension; k++) {
    const middle = before[k]!
    const image = new Array<number>(dimension).fill(0)
    for (let j = 0; j < dimension; j++) for (let i = 0; i < dimension; i++) image[i]! += after[j]![i]! * middle[j]!
    result.push(image)
  }
  return result
}

function matrixKey(matrix: number[][]): string {
  return matrix.map((column) => column.map((value) => Math.round(value * 64) / 64).join(',')).join(';')
}

// The Weyl group order: close the reflections in all roots under composition. Feasible for small systems
// (up to a few thousand elements), not for E8.
export function weylGroupOrder(roots: number[][]): number {
  const dimension = roots[0]!.length
  const identity: number[][] = []
  for (let k = 0; k < dimension; k++) { const e = new Array<number>(dimension).fill(0); e[k] = 1; identity.push(e) }
  const generators = roots.map((root) => reflectionMatrix(root, dimension))
  const seen = new Map<string, number[][]>([[matrixKey(identity), identity]])
  let frontier = [identity]
  while (frontier.length) {
    const next: number[][][] = []
    for (const element of frontier) for (const generator of generators) {
      const product = composeColumns(generator, element, dimension)
      const key = matrixKey(product)
      if (!seen.has(key)) { seen.set(key, product); next.push(product) }
    }
    frontier = next
  }
  return seen.size
}

// Solve the symmetric system G c = rhs by Gaussian elimination (small ranks only).
function solveSymmetric(gram: number[][], rhs: number[]): number[] {
  const size = rhs.length
  const augmented = gram.map((row, index) => [...row, rhs[index]!])
  for (let column = 0; column < size; column++) {
    let pivot = column
    for (let row = column + 1; row < size; row++) if (Math.abs(augmented[row]![column]!) > Math.abs(augmented[pivot]![column]!)) pivot = row
    ;[augmented[column], augmented[pivot]] = [augmented[pivot]!, augmented[column]!]
    const diagonal = augmented[column]![column]!
    for (let j = column; j <= size; j++) augmented[column]![j]! /= diagonal
    for (let row = 0; row < size; row++) if (row !== column) {
      const factor = augmented[row]![column]!
      for (let j = column; j <= size; j++) augmented[row]![j]! -= factor * augmented[column]![j]!
    }
  }
  return augmented.map((row) => row[size]!)
}

// The full automorphism group order: the isometries (basis-image maps) that permute the root set. Counted by
// enumerating ordered bases B' with the same Gram matrix as a fixed basis B that preserve the root set. Feasible
// for small systems.
export function automorphismGroupOrder(roots: number[][]): number {
  const dimension = roots[0]!.length
  // a maximal linearly independent subset is the basis, found by Gram-determinant growth.
  const basis: number[][] = []
  for (const root of roots) {
    if (basis.length === dimension) break
    const test = [...basis, root]
    const gram = test.map((u) => test.map((v) => dotVec(u, v)))
    if (Math.abs(determinant(gram)) > 1e-9) basis.push(root)
  }
  const rank = basis.length
  const gram = basis.map((u) => basis.map((v) => dotVec(u, v)))
  const coordinates = roots.map((root) => solveSymmetric(gram, basis.map((b) => dotVec(b, root))))
  const rootKeys = new Set(roots.map(vectorKey))
  let count = 0
  const choose = (depth: number, picked: number[][]): void => {
    if (depth === rank) {
      for (const coordinate of coordinates) {
        const image = new Array<number>(dimension).fill(0)
        for (let i = 0; i < rank; i++) for (let axis = 0; axis < dimension; axis++) image[axis]! += coordinate[i]! * picked[i]![axis]!
        if (!rootKeys.has(vectorKey(image))) return
      }
      count++
      return
    }
    for (const candidate of roots) {
      let matches = Math.abs(dotVec(candidate, candidate) - gram[depth]![depth]!) < 1e-6
      for (let i = 0; i < depth && matches; i++) if (Math.abs(dotVec(candidate, picked[i]!) - gram[depth]![i]!) > 1e-6) matches = false
      if (matches) choose(depth + 1, [...picked, candidate])
    }
  }
  choose(0, [])
  return count
}

// The outer automorphism order = |Aut| / |Weyl|. Order 6 (S3) is triality. Small systems only.
export function outerAutomorphismOrder(roots: number[][]): number {
  return automorphismGroupOrder(roots) / weylGroupOrder(roots)
}

// The diagram (outer) automorphism order from a Cartan matrix: the permutations of the simple roots that
// preserve the Cartan matrix. This is the general, all-ranks way to read triality (works for E8 where the Weyl
// group is too large to enumerate). Order 6 is S3 triality, unique to D4 among all simple types.
export function diagramAutomorphismOrder(cartan: number[][]): number {
  const size = cartan.length
  const indices = [...Array(size).keys()]
  let count = 0
  const permute = (remaining: number[], chosen: number[]): void => {
    if (chosen.length === size) {
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
        if (cartan[chosen[i]!]![chosen[j]!]! !== cartan[i]![j]!) return
      }
      count++
      return
    }
    for (let k = 0; k < remaining.length; k++) permute(remaining.filter((_, index) => index !== k), [...chosen, remaining[k]!])
  }
  permute(indices, [])
  return count
}

function determinant(matrix: number[][]): number {
  const size = matrix.length
  const working = matrix.map((row) => [...row])
  let result = 1
  for (let column = 0; column < size; column++) {
    let pivot = column
    for (let row = column + 1; row < size; row++) if (Math.abs(working[row]![column]!) > Math.abs(working[pivot]![column]!)) pivot = row
    if (Math.abs(working[pivot]![column]!) < 1e-12) return 0
    if (pivot !== column) { [working[column], working[pivot]] = [working[pivot]!, working[column]!]; result = -result }
    result *= working[column]![column]!
    for (let row = column + 1; row < size; row++) {
      const factor = working[row]![column]! / working[column]![column]!
      for (let j = column; j < size; j++) working[row]![j]! -= factor * working[column]![j]!
    }
  }
  return result
}
