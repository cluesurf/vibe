// Coarse-grained continuity of the directional lattice gas. The continuity (conservation) law in discrete form
// says the charge change inside a region over one beat equals minus the net charge flux across the region's
// boundary. For the conserving knit this holds EXACTLY at every coarse-block scale (integer equality), because
// the rule only rearranges tones. For a lossy rule a volume source/sink appears, so the residual is nonzero and
// grows with block size (volume) while the boundary flux scales with surface. This is the discrete face of
// Chronoflux's divergence-free conserved current: vibe's tone coarse-grains to a current obeying div J = 0.
//
// The general form is `regionContinuityResidual`, which takes an ARBITRARY labelling of cells into regions. It
// reads only the mesh adjacency and which slot points where, never a coordinate and never a distance, so it is
// the lattice statement of continuity as a metric-free law. Herbert's refactored primitive is the closedness of
// a current form on an oriented carrier, which needs orientation only and no ruler, and this is its discrete
// face. `coarseContinuityResidual` is the special case where the regions are coordinate blocks, and it
// delegates, so there is one source of truth for the balance.

import { Will, cloneWill } from '@/code/tone/will'
import { Collision } from '@/code/rule/collision'
import { collide, stream } from '@/code/rule/lattice-gas'
import { blockCount, blockIndexer } from '@/code/tool/block'

// The total net charge in each cell (the sum of its directional tones).
function cellCharge(
  data: Int8Array,
  cell: number,
  degree: number,
): number {
  let s = 0

  const base = cell * degree

  for (let d = 0; d < degree; d++) {
    s += data[base + d]!
  }

  return s
}

// Measure the discrete continuity residual of one beat over an ARBITRARY partition of the cells into regions.
// `regionOf` maps a cell to its region label, which must land in [0, regionCount). For each region the residual
// is (charge change inside) + (net charge flux out), identically zero when the rule conserves, for ANY partition.
//
// Nothing here reads a coordinate, a distance, or a block shape. The charge change is read per cell, and the flux
// is read from `mesh.neighbour(cell, direction)`, which is the adjacency plus which slot points where. So a zero
// residual is the metric-free statement of the law: it holds for regions of any shape, including scattered ones
// and single cells, and it survives any relabelling of the cells that preserves adjacency.
//
// `maxRegionResidual` is the worst single region, so a caller can assert per-region exactness and not only that
// a sum of signed errors happened to cancel.
export function regionContinuityResidual(input: {
  will: Will
  collision: Collision
  regionOf: (cell: number) => number
  regionCount: number
}): {
  regions: number
  absResidual: number
  totalFlux: number
  relative: number
  maxRegionResidual: number
} {
  const { will, collision, regionOf, regionCount } = input
  const mesh = will.mesh
  const degree = mesh.degree
  const cellCount = mesh.cellCount

  // charge per cell before the beat.
  const before = new Float64Array(cellCount)

  for (let cell = 0; cell < cellCount; cell++) {
    before[cell] = cellCharge(will.data, cell, degree)
  }

  // collide in place, then stream. The collided tones are exactly what crosses the boundaries.
  const collided = cloneWill(will)

  collide(collided, collision)

  const after = stream(collided)

  const regionId = new Int32Array(cellCount)

  for (let cell = 0; cell < cellCount; cell++) {
    regionId[cell] = regionOf(cell)
  }

  // charge change inside each region.
  const dQ = new Float64Array(regionCount)

  for (let cell = 0; cell < cellCount; cell++) {
    const r = regionId[cell]!

    dQ[r] =
      dQ[r]! + (cellCharge(after.data, cell, degree) - before[cell]!)
  }

  // net charge flux out of each region: a collided tone in slot (cell, d) streams to neighbour(cell, d). If that
  // neighbour sits in another region, the tone leaves cell's region and enters the neighbour's region.
  const outFlux = new Float64Array(regionCount)
  const inFlux = new Float64Array(regionCount)

  let totalFlux = 0

  for (let cell = 0; cell < cellCount; cell++) {
    const srcRegion = regionId[cell]!
    const base = cell * degree

    for (let d = 0; d < degree; d++) {
      const t = collided.data[base + d]!

      if (t === 0) {
        continue
      }

      const dest = mesh.neighbour(cell, d)
      const dstRegion = regionId[dest]!

      if (dstRegion !== srcRegion) {
        outFlux[srcRegion] = outFlux[srcRegion]! + t
        inFlux[dstRegion] = inFlux[dstRegion]! + t
        totalFlux += Math.abs(t)
      }
    }
  }

  let absResidual = 0
  let maxRegionResidual = 0

  for (let r = 0; r < regionCount; r++) {
    const netOut = outFlux[r]! - inFlux[r]!
    const residual = Math.abs(dQ[r]! + netOut)

    absResidual += residual

    if (residual > maxRegionResidual) {
      maxRegionResidual = residual
    }
  }

  return {
    regions: regionCount,
    absResidual,
    totalFlux,
    relative: absResidual / Math.max(1, totalFlux),
    maxRegionResidual,
  }
}

// Measure the discrete continuity residual of one beat at a chosen coarse-block scale. For each block, the
// residual is (charge change inside) + (net charge flux out), which is identically zero when the rule conserves.
// Returns the summed absolute residual over blocks, the total boundary flux (the normalizer), and the relative
// residual (residual over flux). A conserving knit gives absResidual 0 at every blockSide. A lossy rule gives a
// positive residual that grows with blockSide.
//
// This is the coordinate-block special case of `regionContinuityResidual`, which carries the general balance.
export function coarseContinuityResidual(input: {
  will: Will
  collision: Collision
  meshSide: number
  blockSide: number
}): {
  blocks: number
  absResidual: number
  totalFlux: number
  relative: number
} {
  const { will, collision, meshSide, blockSide } = input

  const measured = regionContinuityResidual({
    will,
    collision,
    regionOf: blockIndexer({ meshSide, blockSide }),
    regionCount: blockCount({ meshSide, blockSide }),
  })

  return {
    blocks: measured.regions,
    absResidual: measured.absResidual,
    totalFlux: measured.totalFlux,
    relative: measured.relative,
  }
}
