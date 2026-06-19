// The {p,q} hyperbolic tiling, grown by Margenstern's splitting method, with
// Fibonacci / Zeckendorf addressing. The regular side of P3 and a clean-
// navigation substrate.
//
// EXACT parts:
//   - The pentagrid {5,4} growth rule (a node is white with 3 children or black
//     with 2 children; the root seeds 5 white children). This is Margenstern's
//     standard splitting table for the pentagrid and reproduces the golden-ratio
//     ball-growth law.
//   - Zeckendorf addressing: each node, numbered breadth-first from 1, is written
//     in Zeckendorf form (sum of non-consecutive Fibonacci numbers) as a 0/1
//     string with no two adjacent ones. This is exact.
//
// APPROXIMATE parts:
//   - General {p,q} (anything other than {5,4}) uses a generic exponential tree:
//     each tile gets a fixed child count derived from (p-2)*(q-2), which gives the
//     right exponential growth order but not the exact Margenstern node-type
//     table for that specific tiling.
//   - Side-adjacency (cousin) edges are NOT wired here: the adjacency is the
//     spanning tree only (parent-child edges). The tree captures growth and
//     navigation; full cousin wiring is deferred to a later version.
//   - No Poincare-disc embedding is attached (the tree alone fixes no canonical
//     disc layout without the cousin geometry); embedding is omitted.

import { Graph, makeGraph } from '@/code/tool/graph'

interface TilingNode {
  readonly id: number
  readonly parent: number | null
  readonly white: boolean // pentagrid node type: white = 3 children, black = 2
}

export function tilingPQ(input: {
  p: number
  q: number
  generations: number
}): Graph {
  const nodes: TilingNode[] = []
  const childrenOf: number[][] = []

  // Root.
  nodes.push({ id: 0, parent: null, white: true })
  childrenOf.push([])

  const isPentagrid = input.p === 5 && input.q === 4

  // Root child count: the q tiles around the central vertex (pentagrid: 5).
  const rootChildCount = isPentagrid ? 5 : input.q

  // Generic child count for non-pentagrid tilings: a robust exponential choice.
  const genericChildCount = Math.max(
    1,
    Math.round(((input.p - 2) * (input.q - 2)) / 2),
  )

  // Breadth-first ring growth up to `generations` rings.
  let frontier = [0]

  for (let gen = 0; gen < input.generations; gen++) {
    const nextFrontier: number[] = []

    for (const parentId of frontier) {
      const parent = nodes[parentId]

      if (!parent) {
        continue
      }

      let childCount: number
      let childrenWhite: boolean[]

      if (gen === 0) {
        // The first ring out of the root: all white, q (or 5) of them.
        childCount = rootChildCount
        childrenWhite = new Array(childCount).fill(true)
      } else if (isPentagrid) {
        // Pentagrid splitting: a white tile has 3 children (white, black,
        // white), a black tile has 2 children (white, black).
        if (parent.white) {
          childCount = 3
          childrenWhite = [true, false, true]
        } else {
          childCount = 2
          childrenWhite = [true, false]
        }
      } else {
        childCount = genericChildCount
        childrenWhite = new Array(childCount).fill(true)
      }

      for (let k = 0; k < childCount; k++) {
        const id = nodes.length
        nodes.push({
          id,
          parent: parentId,
          white: childrenWhite[k] ?? true,
        })
        childrenOf.push([])
        childrenOf[parentId]?.push(id)
        nextFrontier.push(id)
      }
    }

    frontier = nextFrontier
  }

  const size = nodes.length

  // Tree adjacency: parent-child edges, undirected.
  const neighbors: number[][] = []

  for (let i = 0; i < size; i++) {
    neighbors.push([])
  }

  for (let i = 0; i < size; i++) {
    const node = nodes[i]

    if (node && node.parent !== null) {
      neighbors[i]?.push(node.parent)
      neighbors[node.parent]?.push(i)
    }
  }

  // Zeckendorf address per node: number breadth-first from 1, write in
  // Zeckendorf form as a 0/1 string with no two adjacent ones.
  const address: string[] = []

  for (let i = 0; i < size; i++) {
    address.push(zeckendorf({ value: i + 1 }))
  }

  return makeGraph({ size, directed: false, neighbors, address })
}

// Zeckendorf representation: the unique sum of non-consecutive Fibonacci
// numbers (>= 2: 1, 2, 3, 5, 8, ...). Returned high-order bit first, so the
// string has no two adjacent ones.
function zeckendorf(input: { value: number }): string {
  let v = input.value

  if (v <= 0) {
    return '0'
  }

  // Fibonacci sequence 1, 2, 3, 5, 8, ... (Zeckendorf basis) up to v.
  const fib: number[] = [1, 2]

  while ((fib[fib.length - 1] ?? 0) <= v) {
    const a = fib[fib.length - 1] ?? 0
    const b = fib[fib.length - 2] ?? 0
    fib.push(a + b)
  }

  // Largest basis element not exceeding v is at fib.length - 2 (the last pushed
  // one overshot). Greedily subtract.
  const bits: string[] = []

  let started = false

  for (let i = fib.length - 1; i >= 0; i--) {
    const f = fib[i] ?? 0

    if (f > v && !started) {
      continue
    }

    if (f <= v) {
      bits.push('1')
      v -= f
      started = true
    } else if (started) {
      bits.push('0')
    }
  }

  return bits.length > 0 ? bits.join('') : '0'
}
