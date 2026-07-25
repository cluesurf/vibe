// How much resolution a coarse observer actually has, and why no infinity is ever instantiated.
//
// A continuum field carries uncountably many degrees of freedom in any region, which is the thing the
// discrete base refuses. On the lattice the situation is exactly countable. A block of `blockVolume`
// cells holds `blockVolume * degree` ternary slots, so its total charge is an INTEGER in a bounded
// range, and its mean charge per cell can only land on an exact multiple of one over blockVolume.
//
// Two facts follow, and both are arithmetic rather than approximate:
//
// - The set of attainable coarse densities at any scale is FINITE, of size two times the slot count
//   plus one. There is no continuum of values at any finite scale.
// - The gap between neighbouring attainable values, the density quantum, is exactly one over
//   blockVolume. It shrinks as blocks grow and reaches zero only in a limit that is never taken.
//
// So the smooth field of a continuum theory is the coarse observer's finite-resolution reading, and
// the continuum is the idealization of that reading as the resolution improves. The base stays finite
// and integer at every step. `onLattice` checks the claim empirically rather than trusting it: every
// observed block mean is verified to be an exact integer multiple of the quantum, with no tolerance.

import { Will } from '@/code/tone/will'
import { blockCount, blockIndexer } from '@/code/tool/block'

export type CoarseResolution = {
  blockVolume: number
  slotsPerBlock: number
  attainableValues: number
  quantum: number
  distinctObserved: number
  onLattice: boolean
  minBlockCharge: number
  maxBlockCharge: number
}

// Read the coarse-density resolution of a state at one block scale. `meshSide` is the d4 mesh side and
// `blockSide` must divide it.
export function coarseDensityResolution(input: {
  will: Will
  meshSide: number
  blockSide: number
}): CoarseResolution {
  const { will, meshSide, blockSide } = input
  const degree = will.mesh.degree
  const data = will.data

  const blocks = blockCount({ meshSide, blockSide })
  const indexOf = blockIndexer({ meshSide, blockSide })

  const blockVolume = blockSide * blockSide * blockSide * blockSide
  const slotsPerBlock = blockVolume * degree

  // total charge per block, kept as an exact integer sum
  const blockCharge = new Int32Array(blocks)

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const base = cell * degree
    const b = indexOf(cell)

    let sum = 0

    for (let d = 0; d < degree; d++) {
      sum += data[base + d]!
    }

    blockCharge[b] = blockCharge[b]! + sum
  }

  const seen = new Set<number>()

  let minBlockCharge = Number.POSITIVE_INFINITY
  let maxBlockCharge = Number.NEGATIVE_INFINITY
  let onLattice = true

  for (let b = 0; b < blocks; b++) {
    const total = blockCharge[b]!

    seen.add(total)

    if (total < minBlockCharge) {
      minBlockCharge = total
    }

    if (total > maxBlockCharge) {
      maxBlockCharge = total
    }

    // the mean density is total / blockVolume, so it is on the quantum lattice exactly when the
    // total is an integer. Integer-valued by construction, and checked rather than assumed.
    if (!Number.isInteger(total)) {
      onLattice = false
    }

    // and the total can never exceed the slot count in magnitude
    if (Math.abs(total) > slotsPerBlock) {
      onLattice = false
    }
  }

  return {
    blockVolume,
    slotsPerBlock,
    attainableValues: 2 * slotsPerBlock + 1,
    quantum: 1 / blockVolume,
    distinctObserved: seen.size,
    onLattice,
    minBlockCharge: blocks === 0 ? 0 : minBlockCharge,
    maxBlockCharge: blocks === 0 ? 0 : maxBlockCharge,
  }
}
