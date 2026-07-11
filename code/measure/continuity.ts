// Coarse-grained continuity of the directional lattice gas. The continuity (conservation) law in discrete form
// says the charge change inside a region over one beat equals minus the net charge flux across the region's
// boundary. For the conserving knit this holds EXACTLY at every coarse-block scale (integer equality), because
// the rule only rearranges tones. For a lossy rule a volume source/sink appears, so the residual is nonzero and
// grows with block size (volume) while the boundary flux scales with surface. This is the discrete face of
// Chronoflux's divergence-free conserved current: vibe's tone coarse-grains to a current obeying div J = 0.

import { Will, cloneWill } from '@/code/tone/will'
import { Collision } from '@/code/rule/collision'
import { collide, stream } from '@/code/rule/lattice-gas'

// The 4D periodic block index of a cell on a d4Mesh of side `meshSide`, partitioned into blocks of side
// `blockSide` (blockSide must divide meshSide). Cells are indexed x + side*y + side^2*z + side^3*w.
function blockOf(
  cell: number,
  meshSide: number,
  blockSide: number,
): number {
  const area = meshSide * meshSide
  const volume = area * meshSide
  const x = cell % meshSide
  const y = Math.floor(cell / meshSide) % meshSide
  const z = Math.floor(cell / area) % meshSide
  const w = Math.floor(cell / volume) % meshSide
  const nb = meshSide / blockSide
  const bx = Math.floor(x / blockSide)
  const by = Math.floor(y / blockSide)
  const bz = Math.floor(z / blockSide)
  const bw = Math.floor(w / blockSide)

  return bx + nb * by + nb * nb * bz + nb * nb * nb * bw
}

// The total net charge in each cell (the sum of its directional tones).
function cellCharge(
  data: Int8Array,
  cell: number,
  degree: number,
): number {
  let s = 0

  const base = cell * degree

  for (let d = 0; d < degree; d++) s += data[base + d]!

  return s
}

// Measure the discrete continuity residual of one beat at a chosen coarse-block scale. For each block, the
// residual is (charge change inside) + (net charge flux out), which is identically zero when the rule conserves.
// Returns the summed absolute residual over blocks, the total boundary flux (the normalizer), and the relative
// residual (residual over flux). A conserving knit gives absResidual 0 at every blockSide. A lossy rule gives a
// positive residual that grows with blockSide.
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
  const mesh = will.mesh
  const degree = mesh.degree
  const cellCount = mesh.cellCount
  const nb = meshSide / blockSide
  const blocks = nb * nb * nb * nb

  // charge per cell before the beat.
  const before = new Float64Array(cellCount)

  for (let cell = 0; cell < cellCount; cell++)
    before[cell] = cellCharge(will.data, cell, degree)

  // collide in place, then stream. The collided tones are exactly what crosses the boundaries.
  const collided = cloneWill(will)

  collide(collided, collision)

  const after = stream(collided)

  const blockId = new Int32Array(cellCount)

  for (let cell = 0; cell < cellCount; cell++)
    blockId[cell] = blockOf(cell, meshSide, blockSide)

  // charge change inside each block.
  const dQ = new Float64Array(blocks)

  for (let cell = 0; cell < cellCount; cell++) {
    const b = blockId[cell]!

    dQ[b] =
      dQ[b]! + (cellCharge(after.data, cell, degree) - before[cell]!)
  }

  // net charge flux out of each block: a collided tone in slot (cell, d) streams to neighbour(cell, d). If that
  // neighbour is in another block, the tone leaves cell's block and enters the neighbour's block.
  const outFlux = new Float64Array(blocks)
  const inFlux = new Float64Array(blocks)

  let totalFlux = 0

  for (let cell = 0; cell < cellCount; cell++) {
    const srcBlock = blockId[cell]!
    const base = cell * degree

    for (let d = 0; d < degree; d++) {
      const t = collided.data[base + d]!

      if (t === 0) continue

      const dest = mesh.neighbour(cell, d)
      const dstBlock = blockId[dest]!

      if (dstBlock !== srcBlock) {
        outFlux[srcBlock] = outFlux[srcBlock]! + t
        inFlux[dstBlock] = inFlux[dstBlock]! + t
        totalFlux += Math.abs(t)
      }
    }
  }

  let absResidual = 0

  for (let b = 0; b < blocks; b++) {
    const netOut = outFlux[b]! - inFlux[b]!

    absResidual += Math.abs(dQ[b]! + netOut)
  }

  return {
    blocks,
    absResidual,
    totalFlux,
    relative: absResidual / Math.max(1, totalFlux),
  }
}
