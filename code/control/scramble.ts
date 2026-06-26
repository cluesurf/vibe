import { makeRng } from '@/code/tool/rng'

// The scramble control: a degree-preserving rewiring of a neighbors graph that
// keeps the node count and the exact degree of every node, but destroys the
// hyperbolic geometry. It is the "run the same rules on a scrambled, non-hyperbolic
// graph" baseline. A measure that yields a clean geometric constant on the
// {3,4,3,4} graph and a different (or absent) value here is reading the geometry,
// not just the local alphabet and the degree. This is what upgrades a measured L2
// kinematic result to an L3 emergent one: the constant must survive on the real
// substrate and vanish on the scramble.
//
// The rewiring is the standard double-edge swap (pick two edges a-b and c-d, replace
// them with a-d and c-b when that introduces no self-loop and no duplicate edge).
// Each swap preserves every node's degree exactly, so the degree sequence is
// identical to the input, only the connectivity is randomized. It is deterministic
// given the seed (the methodology forbids relying on randomness for a result, but a
// control baseline is exactly where a seeded shuffle belongs, the same place the
// random null lives).

export function scrambleNeighbors(input: {
  neighbors: readonly ArrayLike<number>[]
  seed?: number
  passes?: number
}): number[][] {
  const { neighbors } = input
  const seed = input.seed ?? 1
  const passes = input.passes ?? 4
  const n = neighbors.length

  // undirected edge list, deduped with a<b, plus a membership set for fast checks
  const key = (a: number, b: number): number => a * n + b
  const present = new Set<number>()
  const edges: [number, number][] = []

  for (let a = 0; a < n; a++) {
    const row = neighbors[a]!

    for (let k = 0; k < row.length; k++) {
      const b = row[k]!
      const lo = a < b ? a : b
      const hi = a < b ? b : a

      if (lo === hi) {
        continue
      }

      const id = key(lo, hi)

      if (!present.has(id)) {
        present.add(id)
        edges.push([lo, hi])
      }
    }
  }

  const edgeCount = edges.length
  const rng = makeRng({ seed })
  const swaps = passes * edgeCount

  for (let step = 0; step < swaps; step++) {
    const i = rng.nextInt({ max: edgeCount })
    const j = rng.nextInt({ max: edgeCount })

    if (i === j) {
      continue
    }

    const [a, b] = edges[i]!
    const [c, d] = edges[j]!

    // skip if the four endpoints are not distinct (would make a self-loop)
    if (a === c || a === d || b === c || b === d) {
      continue
    }

    // proposed new edges a-d and c-b
    const ad = a < d ? key(a, d) : key(d, a)
    const cb = c < b ? key(c, b) : key(b, c)

    if (present.has(ad) || present.has(cb)) {
      continue
    }

    present.delete(key(a, b))
    present.delete(key(c, d))
    present.add(ad)
    present.add(cb)
    edges[i] = a < d ? [a, d] : [d, a]
    edges[j] = c < b ? [c, b] : [b, c]
  }

  const out: number[][] = Array.from({ length: n }, () => [])

  for (const [a, b] of edges) {
    out[a]!.push(b)
    out[b]!.push(a)
  }

  return out
}
