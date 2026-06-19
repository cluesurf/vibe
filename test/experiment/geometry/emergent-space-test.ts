// EMERGENT-SPACE-TEST: settle the anisotropy-vs-disorder problem for the {3,4,3,4} flat 3D physical space.
// Decisive questions, (A) is the aperiodic horosphere band a COHERENT 3D space, largest connected component
// fraction + spectral dimension -> 3? (B) is its light cone ISOTROPIC (round) vs the clean cubic {4,3,4} whose
// light cone is anisotropic (faceted)? (C) the expansion law, how the spatial slice grows with radial level.
// Run: npx tsx code/experiment/emergent-space-test.ts

import {
  buildHorosphereBand,
  buildEuclideanLattice,
  bandLargestComponentSubgraph,
} from '@/code/substrate/coxeter/cell-direct'
import { spectralDimension } from '@/code/measure/dimension'
import { frontCoefficientOfVariation } from '@/code/measure/isotropy'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The geometry measures, the band largest-component extraction (bandLargestComponentSubgraph), the
// spectral dimension by lazy-walk return probability (spectralDimension), and the light-cone front
// isotropy (frontCoefficientOfVariation), all live in code/.
const spectralDim = (
  nb: number[][],
  start: number,
  t1: number,
  t2: number,
): number => spectralDimension({ neighbors: nb, start, t1, t2 })
const frontCV = (
  nb: number[][],
  coords: number[][],
  start: number,
  R: number,
): number =>
  frontCoefficientOfVariation({
    neighbors: nb,
    coords,
    start,
    radius: R,
  })

export function emergentSpaceTest(): void {
  // (A) the horosphere band, coherent largest component
  const h = buildHorosphereBand({
    symbol: [3, 4, 3, 4] as never,
    maxBand: 9000,
    half: 1.0,
    margin: 0.8,
  })
  const slice = bandLargestComponentSubgraph({
    band: h,
    halfWidth: 1.0,
  })
  const lccFrac = slice.largestComponentPercent
  const bandDim =
    Math.round(spectralDim(slice.neighbors, slice.start, 3, 12) * 100) /
    100
  const bandCV = frontCV(slice.neighbors, slice.coords, slice.start, 6)
  // (B) isotropy vs the clean cubic {4,3,4}
  const cube = buildEuclideanLattice({
    symbol: [4, 3, 4] as never,
    maxCells: 9000,
  })
  let cc = 0
  for (let i = 0; i < cube.cellCount; i++) {
    if (cube.coords[i]!.every(x => x === 0)) {
      cc = i
    }
  }
  const cubeDim =
    Math.round(spectralDim(cube.neighbors, cc, 3, 12) * 100) / 100
  const cubeCV = frontCV(cube.neighbors, cube.coords, cc, 6)
  // (C) expansion law, band-slice size vs radial (Busemann) level
  const levels: Record<number, number> = {}
  for (let i = 0; i < h.cellCount; i++) {
    const L = Math.round(h.busemann[i]!)
    levels[L] = (levels[L] ?? 0) + 1
  }
  const ks = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b)
  const coherent = lccFrac > 60 && Math.abs(bandDim - 3) < 1
}

// The {3,4,3,4} aperiodic horosphere band coarse-grains to a coherent, more-isotropic 3D
// space. We extract the band, take its largest connected component, and measure its
// spectral dimension (near 3, coherent space) and its light-cone front coefficient of
// variation (lower is rounder, more isotropic). The clean cubic {4,3,4} is the control,
// its faceted light cone gives a higher coefficient of variation, so the aperiodic band is
// rounder. These are geometric measurements on known tessellations, so L2.
export default experiment({
  id: 'geometry/emergent-space-test',
  title:
    'the {3,4,3,4} horosphere band is a coherent 3D space with a rounder light cone than the cubic crystal',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const h = buildHorosphereBand({
      symbol: [3, 4, 3, 4] as never,
      maxBand: 9000,
      half: 1.0,
      margin: 0.8,
    })
    const slice = bandLargestComponentSubgraph({
      band: h,
      halfWidth: 1.0,
    })
    const lccFrac = slice.largestComponentPercent
    const bandDim =
      Math.round(
        spectralDim(slice.neighbors, slice.start, 3, 12) * 100,
      ) / 100
    const bandCV = frontCV(
      slice.neighbors,
      slice.coords,
      slice.start,
      6,
    )

    const cube = buildEuclideanLattice({
      symbol: [4, 3, 4] as never,
      maxCells: 9000,
    })
    let cc = 0
    for (let i = 0; i < cube.cellCount; i++) {
      if (cube.coords[i]!.every(x => x === 0)) {
        cc = i
      }
    }
    const cubeCV = frontCV(cube.neighbors, cube.coords, cc, 6)

    const coherent = lccFrac > 60 && Math.abs(bandDim - 3) < 1
    const rounder = bandCV >= 0 && bandCV < cubeCV
    const ok = coherent && rounder
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} horosphere band is a coherent near-3D space whose light cone is rounder than the cubic crystal',
      metrics: {
        largestComponentPercent: lccFrac,
        bandSpectralDimension: bandDim,
        bandLightConeVariation: bandCV,
        cubicLightConeVariation: cubeCV,
      },
      control: {
        cubicLightConeVariation: cubeCV,
      },
      notes:
        'L2, geometric measurements on known tessellations. The clean cubic {4,3,4} is the isotropy control, its faceted cone has a larger coefficient of variation. Coherence (a single large component, dimension near 3) is a structural check.',
    })
  },
})
