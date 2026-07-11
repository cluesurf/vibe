// Margenstern-style tree addressing on an embedded graph. Lay a breadth-first
// spanning tree from the most-connected (central) cell, order each cell's children by
// embedding angle so the addressing is deterministic, and give every cell the path of
// child-ordinals from the root (the Fibonacci-tree coordinate). A signal then routes
// between any two cells by address arithmetic alone (up to the common ancestor, then
// down the target's address suffix), using only local parent and ordered-children
// information, no global shortest-path lookup.

import { Graph } from '@/code/tool/graph'

export type AddressedTree = {
  parent: Int32Array
  depth: Int32Array
  children: number[][]
  address: number[][] // address[v] = path of child-ordinals from the root to v
  root: number
  levelSizes: number[]
}

// Breadth-first spanning tree from the most-connected cell, children ordered by
// embedding angle (atan2 of the first two coordinates).
export function buildAddressedTree(g: Graph): AddressedTree {
  let root = 0
  let best = -1

  for (let i = 0; i < g.size; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length

    if (d > best) {
      best = d
      root = i
    }
  }

  const coords = g.embedding?.coords ?? new Float64Array(0)
  const dim = g.embedding?.dimension ?? 2
  const angleOf = (v: number): number =>
    Math.atan2(coords[v * dim + 1] ?? 0, coords[v * dim] ?? 0)

  const parent = new Int32Array(g.size).fill(-1)
  const depth = new Int32Array(g.size).fill(-1)
  const children: number[][] = g.neighbors.map(() => [])

  parent[root] = root
  depth[root] = 0

  let frontier = [root]

  const levelSizes = [1]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const v of frontier) {
      const kids: number[] = []

      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (depth[w] === -1) {
          depth[w] = (depth[v] ?? 0) + 1
          parent[w] = v
          kids.push(w)
          next.push(w)
        }
      }

      kids.sort((a, b) => angleOf(a) - angleOf(b))
      children[v] = kids
    }

    if (next.length > 0) {
      levelSizes.push(next.length)
    }

    frontier = next
  }

  // Addresses: append the child-ordinal at each step down from the root, in depth
  // order so a parent's address is set before its children.
  const address: number[][] = g.neighbors.map(() => [])
  const order = Array.from({ length: g.size }, (_, i) => i)
    .filter(i => depth[i] !== -1)
    .sort((a, b) => (depth[a] ?? 0) - (depth[b] ?? 0))

  for (const v of order) {
    if (v === root) {
      continue
    }

    const p = parent[v] ?? root
    const ordinal = (children[p] ?? []).indexOf(v)

    address[v] = [...(address[p] ?? []), ordinal]
  }

  return { parent, depth, children, address, root, levelSizes }
}

// Route from s to t using addresses only: up to the common ancestor, then down by
// the target's address suffix. Returns the walk along tree edges (which are graph
// edges).
export function routeByAddress(
  tree: AddressedTree,
  s: number,
  t: number,
): number[] {
  const as = tree.address[s] ?? []
  const at = tree.address[t] ?? []

  let common = 0

  while (
    common < as.length &&
    common < at.length &&
    as[common] === at[common]
  ) {
    common++
  }

  const up: number[] = []

  let cur = s

  while ((tree.depth[cur] ?? 0) > common) {
    up.push(cur)
    cur = tree.parent[cur] ?? tree.root
  }

  const ancestor = cur
  const down: number[] = []

  let node = ancestor

  for (let i = common; i < at.length; i++) {
    node = (tree.children[node] ?? [])[at[i] ?? 0] ?? node
    down.push(node)
  }

  return [...up, ancestor, ...down]
}
