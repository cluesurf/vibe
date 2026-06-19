// A discrete gravity field, an integer potential sourced by mass, the legitimate way to add a discrete attraction
// (a field with its own dynamics, not a coded cohesion bias, and no real numbers). The potential phi relaxes
// diffusively toward a discrete Poisson solution, lowered at each mass cell, forming a WELL around a body. Masses
// fall down the gradient of phi (toward each other) = attraction. Paired with excluded volume (one mass per cell)
// as the short-range repulsion, this binds a body without collapse and repairs a displaced piece (the field's
// gradient pulls it back). It is the 1A route in plans/bound-body-base-modifications.
//
// The field is sourced by the BULK only (cells dense in mass), so a lone/displaced mass feels the body's well
// without sitting in its own (no self-force, as in real gravity). The potential is integer, relaxed in integer
// steps, and can be WARM-started from the previous beat (the body moves little, so a few sweeps track it).

// the bulk-mass source, one at each cell that has at least `minNeighbours` occupied neighbours (the dense body),
// zero elsewhere (so isolated masses are test particles, not sources).
export function bulkMass(input: {
  occupied: ArrayLike<number>
  neighbour: (cell: number, direction: number) => number
  cellCount: number
  spatialDegree: number
  minNeighbours: number
}): Int8Array {
  const {
    occupied,
    neighbour,
    cellCount,
    spatialDegree,
    minNeighbours,
  } = input
  const source = new Int8Array(cellCount)
  for (let c = 0; c < cellCount; c++) {
    if (!occupied[c]) {
      continue
    }

    let count = 0
    for (let d = 0; d < spatialDegree; d++) {
      count += occupied[neighbour(c, d)] ? 1 : 0
    }

    if (count >= minNeighbours) {
      source[c] = 1
    }
  }

  return source
}

// relax the BOUNDED potential `sweeps` times, phi[c] = clamp( round(mean of spatial neighbours) - strength*source[c],
// -cap, +cap ). Lower phi is a deeper well (where the mass is). The clamp is the whole point of minimality, phi is a
// BOUNDED small integer in [-cap, cap], which is the COUNT of a bounded gas of at most `cap` token-bits per cell,
// NOT an arbitrary integer. A few bits suffice (cap 6, thirteen levels, about four bits, repairs displacements out
// to three). The well DEPTH is bounded by cap, the effective RANGE of the force grows with cap. Pass `warm` to
// continue from a previous potential (the field is fast, a few warm sweeps track the body).
export function relaxPotential(input: {
  source: ArrayLike<number>
  neighbour: (cell: number, direction: number) => number
  cellCount: number
  spatialDegree: number
  sweeps: number
  strength: number
  cap: number
  warm?: Int32Array
}): Int32Array {
  const {
    source,
    neighbour,
    cellCount,
    spatialDegree,
    sweeps,
    strength,
    cap,
    warm,
  } = input
  const clamp = (v: number): number =>
    v < -cap ? -cap : v > cap ? cap : v
  let phi = warm ? warm : new Int32Array(cellCount)
  for (let s = 0; s < sweeps; s++) {
    const next = new Int32Array(cellCount)
    for (let c = 0; c < cellCount; c++) {
      let sum = 0
      for (let d = 0; d < spatialDegree; d++) {
        sum += phi[neighbour(c, d)]!
      }

      next[c] = clamp(
        Math.round(sum / spatialDegree) -
          strength * (source[c] ? 1 : 0),
      )
    }

    phi = next
  }

  return phi
}

// the down-gradient moves, the force. Each NON-BULK mass (a surface or displaced piece, fewer than `minNeighbours`
// occupied neighbours) hops to the empty neighbour with the lowest potential, if it is lower than where it sits.
// Bulk masses do not move (excluded volume holds the body together, no collapse). Returns the (from, to) moves,
// computed against a running occupancy so two masses never target the same cell.
export function gravityMoves(input: {
  occupied: Uint8Array
  phi: Int32Array
  neighbour: (cell: number, direction: number) => number
  cellCount: number
  spatialDegree: number
  minNeighbours: number
}): Array<[number, number]> {
  const {
    occupied,
    phi,
    neighbour,
    cellCount,
    spatialDegree,
    minNeighbours,
  } = input
  const free = occupied.slice()
  const moves: Array<[number, number]> = []
  for (let c = 0; c < cellCount; c++) {
    if (!free[c]) {
      continue
    }

    let dense = 0
    for (let d = 0; d < spatialDegree; d++) {
      dense += free[neighbour(c, d)]!
    }

    if (dense >= minNeighbours) {
      continue
    }

    let best = -1
    let bestPhi = phi[c]!
    for (let d = 0; d < spatialDegree; d++) {
      const t = neighbour(c, d)
      if (!free[t] && phi[t]! < bestPhi) {
        bestPhi = phi[t]!
        best = t
      }
    }

    if (best >= 0) {
      moves.push([c, best])
      free[c] = 0
      free[best] = 1
    }
  }

  return moves
}

// The active-vacuum density, the attraction with NO new field (rung 4, plans/ternary-field-encoding). The arrow
// fills empty space with vacuum tones, and mass DEPLETES the vacuum (a mass cell excludes it). So this reads the
// existing vacuum as a bounded ternary density, HIGH (+cap) in empty space, pushed toward zero at mass, diffused.
// Mass then falls toward LOWER vacuum density (toward the depletion = toward the body), the Casimir/depletion
// attraction. This is not a new stored field, it is the coarse-grained density of the arrow's vacuum. Pass the
// result as `phi` to gravityMoves to move masses down it (toward depletion). Warm-startable.
export function vacuumDensity(input: {
  occupied: ArrayLike<number>
  neighbour: (cell: number, direction: number) => number
  cellCount: number
  spatialDegree: number
  sweeps: number
  cap: number
  warm?: Int32Array
}): Int32Array {
  const {
    occupied,
    neighbour,
    cellCount,
    spatialDegree,
    sweeps,
    cap,
    warm,
  } = input
  const clamp = (v: number): number =>
    v < -cap ? -cap : v > cap ? cap : v
  let v = warm ? warm : new Int32Array(cellCount)
  for (let s = 0; s < sweeps; s++) {
    const next = new Int32Array(cellCount)
    for (let c = 0; c < cellCount; c++) {
      let sum = 0
      for (let d = 0; d < spatialDegree; d++) {
        sum += v[neighbour(c, d)]!
      }

      // empty cells pump the vacuum up by one, mass cells push it down by cap (depletion).
      next[c] = clamp(
        Math.round(sum / spatialDegree) + (occupied[c] ? -cap : 1),
      )
    }

    v = next
  }

  return v
}
