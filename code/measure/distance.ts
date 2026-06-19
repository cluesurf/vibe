// Distance measures. graphDistance is spatial (BFS hop count); longestChain is
// the discrete timelike geodesic (proper time) between two ordered elements.

import { Poset, precedes } from '@/code/tool/poset'
import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'

// Breadth-first hop count between two nodes over the undirected adjacency.
// Returns -1 if the target is unreachable.
export function graphDistance(input: {
  substrate: Substrate
  from: number
  to: number
}): number {
  if (input.from === input.to) {
    return 0
  }

  const adjacency = undirectedAdjacency({ substrate: input.substrate })
  const size = input.substrate.size
  const distance = new Int32Array(size).fill(-1)
  distance[input.from] = 0
  let frontier: number[] = [input.from]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const node of frontier) {
      const row = adjacency[node] ?? new Uint32Array(0)

      for (let k = 0; k < row.length; k++) {
        const neighbor = row[k] ?? 0

        if ((distance[neighbor] ?? -1) === -1) {
          distance[neighbor] = (distance[node] ?? 0) + 1

          if (neighbor === input.to) {
            return distance[neighbor] ?? -1
          }

          next.push(neighbor)
        }
      }
    }

    frontier = next
  }

  return -1
}

// Longest chain (in number of links) between two related elements: the discrete
// timelike geodesic distance. DP over a topological order of the future cone of
// `from`. Returns 0 if the elements are not related.
export function longestChain(input: {
  poset: Poset
  from: number
  to: number
}): number {
  const p = input.poset

  if (input.from === input.to) {
    return 0
  }

  if (!precedes(p, { a: input.from, b: input.to })) {
    return 0
  }

  // Restrict to the open interval cone: elements in the future of `from` and
  // the past of `to`, plus the endpoints. Process them in topological order so
  // each element is relaxed after all its predecessors in the cone.
  const inCone = (x: number): boolean => {
    if (x === input.from || x === input.to) {
      return true
    }

    return (
      precedes(p, { a: input.from, b: x }) &&
      precedes(p, { a: x, b: input.to })
    )
  }

  // Topological order over the cone by ascending future-cone size: if a precedes
  // b then future(a) strictly contains future(b)'s reachable set, so a has the
  // larger out-reach. Order descending by reach count puts predecessors first.
  const cone: number[] = []

  for (let x = 0; x < p.size; x++) {
    if (inCone(x)) {
      cone.push(x)
    }
  }

  const reach = new Int32Array(p.size)

  for (const x of cone) {
    let count = 0

    for (const y of cone) {
      if (x !== y && precedes(p, { a: x, b: y })) {
        count++
      }
    }

    reach[x] = count
  }

  cone.sort((a, b) => (reach[b] ?? 0) - (reach[a] ?? 0))

  // best[x] = longest chain length (in links) from `from` to x. A chain of L
  // links has L+1 elements. Relax covering links forward.
  const best = new Int32Array(p.size).fill(-1)
  best[input.from] = 0

  for (const x of cone) {
    const reachedFrom = best[x] ?? -1

    if (reachedFrom < 0) {
      continue
    }

    const row = p.links[x] ?? new Uint32Array(0)

    for (let k = 0; k < row.length; k++) {
      const child = row[k] ?? 0

      if (!inCone(child)) {
        continue
      }

      const candidate = reachedFrom + 1

      if (candidate > (best[child] ?? -1)) {
        best[child] = candidate
      }
    }
  }

  const result = best[input.to] ?? -1

  return result < 0 ? 0 : result
}
