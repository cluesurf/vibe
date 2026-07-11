// The directional lattice-gas rule on a finite D4 torus (the {3,4,3,4} 24-direction substrate).
// State is one 24-bit occupancy integer per cell, bit d set = a particle moving in root direction d.
// STREAM hops the particle in slot (c, d) to (neigh[c][d], d): every target slot has exactly one
// source, so streaming is a permutation of the N*24 slots (deterministic, conflict-free, exactly
// reversible). COLLIDE is a momentum- and count-conserving involution that swaps two head-on
// momentum-zero pair configurations. A beat is collide-then-stream, its inverse stream-back then
// collide. Count and momentum are exact integer invariants. Built from buildD4Torus output.

export const D4_DIRECTIONS = 24

// opp[d] = the direction index of -root[d].
export function d4OppositeDirections(
  roots: readonly (readonly number[])[],
): number[] {
  return roots.map(r =>
    roots.findIndex(s => s.every((x, k) => x === -r[k]!)),
  )
}

// One forward stream beat: each occupied slot hops to its forward neighbour in the same direction.
export function streamD4(input: {
  occupancy: readonly number[]
  neigh: readonly (readonly number[])[]
}): number[] {
  const { occupancy, neigh } = input
  const N = occupancy.length
  const out = new Array<number>(N).fill(0)

  for (let c = 0; c < N; c++) {
    const o = occupancy[c]!

    for (let d = 0; d < D4_DIRECTIONS; d++) {
      if ((o >> d) & 1) out[neigh[c]![d]!]! |= 1 << d
    }
  }

  return out
}

// The inverse stream: each occupied slot hops to its backward neighbour (the opp direction) in the same direction.
export function streamD4Inverse(input: {
  occupancy: readonly number[]
  neigh: readonly (readonly number[])[]
  opp: readonly number[]
}): number[] {
  const { occupancy, neigh, opp } = input
  const N = occupancy.length
  const out = new Array<number>(N).fill(0)

  for (let c = 0; c < N; c++) {
    const o = occupancy[c]!

    for (let d = 0; d < D4_DIRECTIONS; d++) {
      if ((o >> d) & 1) out[neigh[c]![opp[d]!]!]! |= 1 << d
    }
  }

  return out
}

// The head-on collision involution. Picks a third direction k (distinct from 0 and opp[0] and not the
// anti of root 0), then swaps the pair {0, opp0} <-> {k, oppk} wherever a cell holds exactly that pair.
export function d4CollisionInvolution(input: {
  roots: readonly (readonly number[])[]
  opp: readonly number[]
}): (occupancy: readonly number[]) => number[] {
  const { roots, opp } = input
  const k = roots.findIndex(
    (s, i) =>
      i !== 0 &&
      i !== opp[0] &&
      s.every((x, q) => x !== -roots[0]![q]!),
  )

  const A = (1 << 0) | (1 << opp[0]!),
    B = (1 << k) | (1 << opp[k]!)

  return occupancy =>
    occupancy.map(o => (o === A ? B : o === B ? A : o))
}

// Total particle count (popcount over all occupancy slots).
export function d4Count(occupancy: readonly number[]): number {
  return occupancy.reduce((s, o) => {
    let c = 0

    for (let d = 0; d < D4_DIRECTIONS; d++) c += (o >> d) & 1

    return s + c
  }, 0)
}

// Total momentum, summed root vector over every occupied slot.
export function d4Momentum(input: {
  occupancy: readonly number[]
  roots: readonly (readonly number[])[]
}): number[] {
  const { occupancy, roots } = input
  const m = [0, 0, 0, 0]

  for (const o of occupancy) {
    for (let d = 0; d < D4_DIRECTIONS; d++) {
      if ((o >> d) & 1) {
        for (let q = 0; q < 4; q++) m[q]! += roots[d]![q]!
      }
    }
  }

  return m
}
