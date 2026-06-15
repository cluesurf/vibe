// A richer momentum-mixing collision, to give the lattice gas a FINITE bulk viscosity. The committed headOnRotate
// only rotates ZERO-momentum head-on pairs, so net-momentum-carrying directions are never reshaped and momentum
// streams ballistically (the bulk is inviscid). This collision reshapes NET-momentum configurations too, it swaps
// occupancy between two disjoint direction-pairs that carry the SAME total momentum (for example +x momentum
// carried by the (1,1,0,0)+(1,-1,0,0) pair versus the (1,0,1,0)+(1,0,-1,0) pair). That conserves mass (the count)
// and the full momentum vector, and because the swap is between disjoint slot-pairs it is a self-inverse
// involution, so the rule stays reversible. After such a reshaping, streaming carries the momentum along different
// directions, so a momentum gradient spreads spatially, which is exactly viscous momentum diffusion.

import { Collision } from '@/code/rule/collision'

// build a fixed set of disjoint momentum-matched quads, each [a, b, c, d] meaning the pair {a,b} and the pair {c,d}
// carry the same total momentum, so swapping their occupancy conserves momentum. Disjoint so the whole collision is
// a product of independent involutions (exactly reversible). Nonzero-momentum classes come first (those are what
// give viscosity), then the zero-momentum class (the headOnRotate-style rotations).
export function buildViscousQuads(directions: number[][]): number[][] {
  const count = directions.length
  const dimension = directions[0]?.length ?? 0
  const momentumKey = (a: number, b: number): string => {
    const sum = new Array<number>(dimension)
    for (let axis = 0; axis < dimension; axis++) sum[axis] = (directions[a]![axis] ?? 0) + (directions[b]![axis] ?? 0)
    return sum.map((value) => Math.round(value)).join(',')
  }
  // group the unordered slot-pairs by their total momentum
  const groups = new Map<string, Array<[number, number]>>()
  for (let a = 0; a < count; a++) for (let b = a + 1; b < count; b++) {
    const key = momentumKey(a, b)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push([a, b])
  }
  const zeroKey = new Array<number>(dimension).fill(0).join(',')
  // process nonzero-momentum groups first (they give viscosity), then the zero-momentum group
  const orderedKeys = [...groups.keys()].sort((left, right) => {
    if (left === zeroKey) return 1
    if (right === zeroKey) return -1
    return 0
  })
  const quads: number[][] = []
  const used = new Uint8Array(count)
  for (const key of orderedKeys) {
    const pending: Array<[number, number]> = []
    for (const [a, b] of groups.get(key)!) {
      if (used[a] || used[b]) continue
      pending.push([a, b])
      if (pending.length === 2) {
        const [p1, p2] = pending
        quads.push([p1![0], p1![1], p2![0], p2![1]])
        used[p1![0]] = 1; used[p1![1]] = 1; used[p2![0]] = 1; used[p2![1]] = 1
        pending.length = 0
      }
    }
  }
  return quads
}

// The viscous collision, a self-inverse involution that swaps occupancy between momentum-matched disjoint pairs.
// Single-species (tone occupancy 1 versus 0), the form used by the shear gas. Conserves count and total momentum.
export function viscousRotate(input: { directions: number[][] }): Collision {
  const quads = buildViscousQuads(input.directions)
  return (slots, base) => {
    for (const quad of quads) {
      const a = base + quad[0]!, b = base + quad[1]!, c = base + quad[2]!, d = base + quad[3]!
      const pairOccupied = slots[a] === 1 && slots[b] === 1
      const pairEmpty = slots[a] === 0 && slots[b] === 0
      const partnerOccupied = slots[c] === 1 && slots[d] === 1
      const partnerEmpty = slots[c] === 0 && slots[d] === 0
      if (pairOccupied && partnerEmpty) { slots[a] = 0; slots[b] = 0; slots[c] = 1; slots[d] = 1 }
      else if (partnerOccupied && pairEmpty) { slots[c] = 0; slots[d] = 0; slots[a] = 1; slots[b] = 1 }
    }
  }
}
