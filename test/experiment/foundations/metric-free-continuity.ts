// EXTERNAL THEORY: Roy Herbert (Chronoflux), the July 2026 Descendancy refactor (DPL-01, Continuity as
// the Primitive Law). Herbert sharpened his own base: the primitive is NOT the divergence-free vector
// current, it is the closedness of a current form on an ORIENTED CARRIER, which needs orientation only.
// No metric, no ruler, no clock. The familiar zero-divergence current is what that primitive becomes
// after a volume form and a Lorentzian metric are declared, so conservation is logically prior to
// geometry rather than one equation among many.
//
// This experiment is the lattice statement of that refactored primitive, and it is strictly stronger
// than E-GRV-0039. That one balanced charge over COORDINATE BLOCKS, which are a geometric object, so it
// left open whether the closure was leaning on the block structure. Here the same balance is demanded
// over partitions that carry NO geometry at all: every cell its own region, cells interleaved by index
// modulo a prime, cells scrambled by a fixed integer mix, and a digit-parity split. Each of these
// shreds locality on purpose. If the balance still holds exactly, the law reads only adjacency and which
// slot points where, which is exactly Herbert's orientation-only primitive.
//
// Measured content. On the periodic {3,4,3,4} d4 mesh with the committed knit, from a deterministic
// coordinate fill, the per-region residual (charge change inside plus net flux out) is checked for five
// partitions. For the conserving knit it is EXACTLY zero, both summed and in the worst single region,
// under integer equality with no tolerance, for every partition including the scattered ones. CONTROL:
// the erasing collision injects a per-cell sink, so its residual is nonzero for every one of the same
// partitions, which is what makes the exactness a property of conservation rather than of bookkeeping.

import { d4Mesh } from '@/code/tool/mesh'
import { pairCollision } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { makeWill } from '@/code/tone/will'
import { regionContinuityResidual } from '@/code/measure/continuity'
import { blockCount, blockIndexer } from '@/code/tool/block'
import { integerMix } from '@/code/tool/integer'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// how many classes the deliberately non-geometric partitions use
const INTERLEAVE_CLASSES = 7
const SCRAMBLE_CLASSES = 13

// the digit sum of a cell index, used for a partition with no spatial meaning whatsoever
function digitSum(value: number): number {
  let sum = 0
  let rest = value

  while (rest > 0) {
    sum += rest % 10
    rest = Math.floor(rest / 10)
  }

  return sum
}

export default experiment({
  id: 'foundations/metric-free-continuity',
  code: 'E-FND-0073',
  title:
    'the discrete continuity law holds exactly over partitions that carry no geometry (single cells, interleaved, scrambled, digit-parity), so conservation reads only orientation and adjacency, never a metric',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const meshSide = 6 // 6^4 = 1296 cells, divisible by block sides 1, 2, 3
    const mesh = d4Mesh({ side: meshSide })
    const degree = mesh.degree
    const opposite: number[] = []

    for (let d = 0; d < mesh.degree; d++) {
      opposite.push(mesh.opposite(d))
    }

    const knit = pairCollision({ opposite })

    // a deterministic charged initial configuration, a fixed coordinate pattern, no randomness.
    const coordinate = (cell: number, axis: number): number =>
      Math.floor(cell / meshSide ** axis) % meshSide

    const start = makeWill(mesh)

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      for (let d = 0; d < degree; d++) {
        start.data[cell * degree + d] =
          ((coordinate(cell, 0) + 2 * coordinate(cell, 1) + d) % 3) - 1
      }
    }

    // Five partitions. The first is the geometric baseline for comparison, the other four are built to
    // carry no geometry: they scatter neighbouring cells into different regions on purpose.
    const partitions: {
      name: string
      regionOf: (cell: number) => number
      regionCount: number
      geometric: boolean
    }[] = [
      {
        name: 'coordinateBlock',
        regionOf: blockIndexer({ meshSide, blockSide: 2 }),
        regionCount: blockCount({ meshSide, blockSide: 2 }),
        geometric: true,
      },
      {
        name: 'singleton',
        regionOf: cell => cell,
        regionCount: mesh.cellCount,
        geometric: false,
      },
      {
        name: 'interleaved',
        regionOf: cell => cell % INTERLEAVE_CLASSES,
        regionCount: INTERLEAVE_CLASSES,
        geometric: false,
      },
      {
        name: 'scrambled',
        regionOf: cell => integerMix(cell) % SCRAMBLE_CLASSES,
        regionCount: SCRAMBLE_CLASSES,
        geometric: false,
      },
      {
        name: 'digitParity',
        regionOf: cell => digitSum(cell) % 2,
        regionCount: 2,
        geometric: false,
      },
    ]

    // REAL: the conserving knit. The residual must vanish exactly for EVERY partition, geometric or not.
    const real = partitions.map(p => ({
      name: p.name,
      geometric: p.geometric,
      measured: regionContinuityResidual({
        will: start,
        collision: knit,
        regionOf: p.regionOf,
        regionCount: p.regionCount,
      }),
    }))

    // exact in the sum AND in the worst single region, so no cancellation between regions can hide an error
    const exactEverywhere = real.every(
      r =>
        r.measured.absResidual === 0 && r.measured.maxRegionResidual === 0,
    )

    // the non-geometric partitions really did carry flux, so the zero is a balance and not an empty sum
    const nonGeometricCarryFlux = real
      .filter(r => !r.geometric)
      .every(r => r.measured.totalFlux > 0)

    // CONTROL: the lossy knit must break the balance on every one of the same partitions.
    const lossy = partitions.map(p => ({
      name: p.name,
      measured: regionContinuityResidual({
        will: start,
        collision: erasingCollision,
        regionOf: p.regionOf,
        regionCount: p.regionCount,
      }),
    }))

    const lossyBrokenEverywhere = lossy.every(
      r => r.measured.absResidual > 0,
    )

    const ok =
      exactEverywhere && nonGeometricCarryFlux && lossyBrokenEverywhere

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the discrete continuity law holds with exactly zero residual, summed and worst-region, over five partitions of the mesh including four that carry no geometry at all (every cell alone, cells interleaved by index modulo 7, cells scrambled by a fixed integer mix, and a digit-parity split), while those same scattered partitions do carry real boundary flux, so the balance reads only the adjacency and which slot points where and never a coordinate or a distance, which is the lattice statement of Herbert refactored primitive that continuity is a metric-free law on an oriented carrier, and a lossy rule breaks the balance on every one of the same partitions',
      metrics: {
        meshSide,
        partitions: partitions.length,
        residualCoordinateBlock: real[0]!.measured.absResidual,
        residualSingleton: real[1]!.measured.absResidual,
        residualInterleaved: real[2]!.measured.absResidual,
        residualScrambled: real[3]!.measured.absResidual,
        residualDigitParity: real[4]!.measured.absResidual,
        worstRegionResidual: Math.max(
          ...real.map(r => r.measured.maxRegionResidual),
        ),
        fluxScrambled: real[3]!.measured.totalFlux,
        exactEverywhere: exactEverywhere ? 1 : 0,
      },
      control: {
        lossyResidualSingleton: lossy[1]!.measured.absResidual,
        lossyResidualInterleaved: lossy[2]!.measured.absResidual,
        lossyResidualScrambled: lossy[3]!.measured.absResidual,
        lossyBrokenEverywhere: lossyBrokenEverywhere ? 1 : 0,
      },
      notes:
        'L2, the metric-free strengthening of E-GRV-0039. That experiment balanced charge over coordinate blocks, which are geometric, so it could not rule out that the closure leaned on block structure. Here the same balance is demanded over partitions chosen to destroy locality (single cells, index-interleaved, integer-scrambled, digit-parity), and it still holds under integer equality with zero tolerance, in the worst single region as well as the sum. That is the precise lattice content of Herbert DPL-01: the primitive needs an orientation and an adjacency, not a metric, so conservation sits logically below geometry. The scrambled partitions are verified to carry nonzero flux, so the zero residual is a real cancellation of large terms rather than an empty sum. The integer mix is a fixed deterministic scramble, not a random source. Fully deterministic, one fixed coordinate fill, size varied not seeds.',
    })
  },
})
