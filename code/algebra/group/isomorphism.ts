// Isomorphisms between small finite groups, counted exhaustively, and the permutation groups on a few points
// that the counts are usually asked about.
//
// A group here is a multiplication table on element indices 0 .. order - 1. An isomorphism is fixed by the
// images of a generating set, so the count is: pick a smallest generating set of the source, try every tuple
// of target elements of matching orders as its images, and keep the tuples that extend to a bijective
// homomorphism. The extension walks the source's Cayley graph from the identity, setting phi(x s) = phi(x) t
// for each generator s with image t, and fails on the first edge that disagrees. A map with phi(1) = 1 that
// respects right multiplication by every generator on every element is a homomorphism, so a tuple that
// survives every edge and is injective is an isomorphism. The count of isomorphisms onto a group isomorphic
// to the source is the order of the source's automorphism group.
//
// Exact integer arithmetic, no random numbers.

import { closure, type GroupOps } from '@/code/algebra/group/finite-group'

export type TableGroup = {
  readonly order: number
  // product[a * order + b], the index of a b
  readonly product: Int32Array
  readonly identity: number
}

// the multiplication table of the listed elements, which must be closed
export function tableGroup<T>(elements: readonly T[], ops: GroupOps<T>): TableGroup {
  const order = elements.length
  const index = new Map(elements.map((e, i) => [ops.key(e), i]))
  const product = new Int32Array(order * order)
  let identity = -1

  for (let a = 0; a < order; a++) {
    for (let b = 0; b < order; b++) {
      const found = index.get(ops.key(ops.multiply(elements[a] as T, elements[b] as T)))

      if (found === undefined) {
        throw new Error('the elements are not closed under the product')
      }

      product[a * order + b] = found
    }
  }

  for (let e = 0; e < order && identity < 0; e++) {
    let fixes = true

    for (let a = 0; a < order && fixes; a++) {
      fixes = product[e * order + a] === a
    }

    identity = fixes ? e : -1
  }

  return { order, product, identity }
}

// the order of each element
export function elementOrders(group: TableGroup): Int32Array {
  const { order, product, identity } = group

  return Int32Array.from({ length: order }, (_, a) => {
    let x = a
    let k = 1

    while (x !== identity) {
      x = product[x * order + a] ?? identity
      k++
    }

    return k
  })
}

// the size of the subgroup the listed elements generate
export function generatedOrder(group: TableGroup, generators: readonly number[]): number {
  const { order, product, identity } = group
  const seen = new Uint8Array(order)
  const queue = [identity]

  seen[identity] = 1

  for (let i = 0; i < queue.length; i++) {
    const x = queue[i] ?? identity

    for (const g of generators) {
      const y = product[x * order + g] ?? identity

      if (!seen[y]) {
        seen[y] = 1
        queue.push(y)
      }
    }
  }

  return queue.length
}

// the first generating pair (a, b) in index order, preferring elements of large order, or undefined
export function generatingPair(group: TableGroup): [number, number] | undefined {
  const orders = elementOrders(group)
  const byOrder = Array.from({ length: group.order }, (_, i) => i).sort((x, y) => (orders[y] ?? 0) - (orders[x] ?? 0) || x - y)

  for (const a of byOrder) {
    for (const b of byOrder) {
      if (a !== b && generatedOrder(group, [a, b]) === group.order) {
        return [a, b]
      }
    }
  }

  return undefined
}

// the map extending generators -> images, as an index array, or undefined when it is not an isomorphism
export function extendIsomorphism(input: {
  source: TableGroup
  target: TableGroup
  generators: readonly number[]
  images: readonly number[]
}): Int32Array | undefined {
  const { source, target, generators, images } = input
  const map = new Int32Array(source.order).fill(-1)
  const queue = [source.identity]

  map[source.identity] = target.identity

  for (let i = 0; i < queue.length; i++) {
    const x = queue[i] ?? source.identity
    const fx = map[x] ?? target.identity

    for (let k = 0; k < generators.length; k++) {
      const y = source.product[x * source.order + (generators[k] ?? 0)] ?? source.identity
      const fy = target.product[fx * target.order + (images[k] ?? 0)] ?? target.identity

      if (map[y] === -1) {
        map[y] = fy
        queue.push(y)
      } else if (map[y] !== fy) {
        return undefined
      }
    }
  }

  if (queue.length !== source.order || source.order !== target.order) {
    return undefined
  }

  const hit = new Uint8Array(target.order)

  for (const v of map) {
    if (hit[v]) {
      return undefined
    }

    hit[v] = 1
  }

  return map
}

// every isomorphism source -> target, through a generating pair of the source
export function isomorphisms(source: TableGroup, target: TableGroup): Int32Array[] {
  const pair = generatingPair(source)

  if (!pair || source.order !== target.order) {
    return []
  }

  const so = elementOrders(source)
  const to = elementOrders(target)
  const out: Int32Array[] = []

  for (let a = 0; a < target.order; a++) {
    if (to[a] !== so[pair[0]]) {
      continue
    }

    for (let b = 0; b < target.order; b++) {
      if (to[b] !== so[pair[1]]) {
        continue
      }

      const map = extendIsomorphism({ source, target, generators: pair, images: [a, b] })

      if (map) {
        out.push(map)
      }
    }
  }

  return out
}

// permutations of 0 .. n - 1 as arrays, image of p at index p, composed (g h)(p) = g(h(p))
export const PERMUTATION_OPS: GroupOps<readonly number[]> = {
  multiply: (g, h) => h.map(p => g[p] ?? p),
  inverse: g => {
    const out = new Array<number>(g.length)

    g.forEach((image, p) => (out[image] = p))

    return out
  },
  key: g => g.join(','),
}

// the permutation group the listed permutations generate
export function permutationGroup(generators: readonly (readonly number[])[]): (readonly number[])[] {
  return closure([...generators], PERMUTATION_OPS)
}

// every relabeling sigma of the n points with sigma G sigma^-1 = H, for permutation groups of equal order,
// checked on generators of G. Exhaustive over n! relabelings, so n up to 9
export function intertwiningRelabelings(input: {
  source: readonly (readonly number[])[]
  sourceGenerators: readonly (readonly number[])[]
  target: readonly (readonly number[])[]
}): number {
  const { source, sourceGenerators, target } = input
  const n = source[0]?.length ?? 0
  const inTarget = new Set(target.map(t => t.join(',')))
  let count = 0

  if (source.length !== target.length) {
    return 0
  }

  const sigma = Array.from({ length: n }, (_, i) => i)
  const used = new Uint8Array(n)
  const inverse = new Array<number>(n)

  const visit = (depth: number): void => {
    if (depth === n) {
      sigma.forEach((image, p) => (inverse[image] = p))

      const ok = sourceGenerators.every(g => {
        // sigma g sigma^-1
        const conjugated = inverse.map(p => sigma[g[p] ?? p] ?? 0)

        return inTarget.has(conjugated.join(','))
      })

      count += ok ? 1 : 0

      return
    }

    for (let v = 0; v < n; v++) {
      if (!used[v]) {
        used[v] = 1
        sigma[depth] = v
        visit(depth + 1)
        used[v] = 0
      }
    }
  }

  visit(0)

  return count
}
