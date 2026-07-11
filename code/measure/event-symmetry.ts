import { algebraicConnectivity } from '@/code/measure/integration'

// Event symmetry (Phil Gibbs): the fundamental laws are invariant under permutations of events, and
// ordinary spacetime, with its particular pattern of which event neighbors which, is a broken phase.
// The operational content on a graph substrate is that a physical observable depends only on the
// relational structure (the isomorphism class of the adjacency), not on how the events are labeled.
// Relabeling the events is a gauge symmetry; rewiring which events are neighbors is physical. The
// observable used here is the algebraic connectivity (the Fiedler value) of the whole graph, a
// relabeling invariant.

// A ring lattice on `size` events: each event linked to its neighbors within `reach` steps around
// the ring, an ordered (crystallized) geometry.
export function ringLattice(input: {
  size: number
  reach: number
}): Uint32Array[] {
  const { size, reach } = input
  const sets: Set<number>[] = Array.from(
    { length: size },
    () => new Set<number>(),
  )

  for (let i = 0; i < size; i++) {
    for (let d = 1; d <= reach; d++) {
      sets[i]!.add((i + d) % size)
      sets[i]!.add((i + size - d) % size)
    }
  }

  return sets.map(set => Uint32Array.from([...set]))
}

// Relabel the events by a permutation, remapping the adjacency consistently. The result is
// isomorphic to the input (the same graph with renamed events), so every relational observable is
// unchanged. `perm[i]` is the new label of event `i`.
export function relabel(
  adjacency: readonly Uint32Array[],
  perm: readonly number[],
): Uint32Array[] {
  const size = adjacency.length
  const out: Set<number>[] = Array.from(
    { length: size },
    () => new Set<number>(),
  )

  for (let i = 0; i < size; i++) {
    for (const neighbor of adjacency[i]!)
      out[perm[i]!]!.add(perm[neighbor]!)
  }

  return out.map(set => Uint32Array.from([...set]))
}

// A deterministic scrambling permutation: multiply-by-`stride` modulo `size` (a bijection when the
// stride is coprime to the size). Not an automorphism of the ring, so it genuinely renames the
// events rather than rotating them.
export function scramblePermutation(input: {
  size: number
  stride: number
}): number[] {
  const { size, stride } = input

  return Array.from(
    { length: size },
    (unused, i) => (i * stride) % size,
  )
}

// Rewire the geometry: cut two edges and reconnect their endpoints crosswise, a degree-preserving
// change that breaks the ring's ordered structure (a physical change to which events are neighbors).
export function rewire(input: {
  adjacency: readonly Uint32Array[]
  cuts: [number, number][]
}): Uint32Array[] {
  const { adjacency, cuts } = input
  const sets = adjacency.map(row => new Set<number>(row))

  for (const [a, b] of cuts) {
    // link far-apart events, an adjacency the ordered ring does not have
    sets[a]!.add(b)
    sets[b]!.add(a)
  }

  return sets.map(set => Uint32Array.from([...set]))
}

// The whole-graph algebraic connectivity, the relabeling-invariant observable.
export function graphObservable(
  adjacency: readonly Uint32Array[],
): number {
  const region = new Set<number>()

  for (let i = 0; i < adjacency.length; i++) region.add(i)

  return algebraicConnectivity({ adjacency, region })
}
