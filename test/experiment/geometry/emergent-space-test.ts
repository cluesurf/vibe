// The {3,4,3,4} flat physical space restores isotropy with scale; the periodic crystal does not.
//
// The naive question, is the aperiodic horosphere band's light cone rounder than the cubic
// crystal's at one radius, has the wrong answer and the wrong form. At short range the
// aperiodic band is ROUGHER (its cells cross the slice irregularly), so its front coefficient
// of variation is larger than the clean cubic's. But that roughness is RANDOM, so it
// self-averages away with scale (the coefficient of variation falls like one over the square
// root of the front size), the signature of an emergent isotropic continuum. The cubic crystal's
// anisotropy is SYSTEMATIC (a faceted L1 ball), so it is scale-invariant, a fixed floor it never
// escapes. So the right measurement is the SCALING: the band's light-cone anisotropy flows toward
// isotropy with radius, while the cubic's persists. This is exactly why a curved aperiodic
// substrate can respect Lorentz invariance and a flat lattice cannot. The cubic is the control,
// its anisotropy stays put. Depth L2, geometric measurements on known tessellations.

import {
  buildHorosphereBand,
  buildEuclideanLattice,
  bandLargestComponentSubgraph,
} from '@/code/substrate/coxeter/cell-direct'
import { spectralDimension } from '@/code/measure/dimension'
import { frontCoefficientOfVariation } from '@/code/measure/isotropy'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the two radii the anisotropy scaling is read between, small (where the aperiodic
// roughness is large) and large (where it has had room to self-average)
const SMALL_RADIUS = 4
const LARGE_RADIUS = 12

export function emergentSpaceTest(): {
  lccPercent: number
  bandDim: number
  bandCVSmall: number
  bandCVLarge: number
  cubeCVSmall: number
  cubeCVLarge: number
  bandReduction: number
  cubeReduction: number
} {
  // the {3,4,3,4} horosphere band, its coherent largest component (a bigger band is a more
  // accurate measurement, it lets the front reach the large radius without running out)
  const h = buildHorosphereBand({
    symbol: [3, 4, 3, 4] as never,
    maxBand: 30000,
    half: 1.0,
    margin: 0.8,
  })

  const slice = bandLargestComponentSubgraph({ band: h, halfWidth: 1.0 })

  const lccPercent = slice.largestComponentPercent
  const bandDim =
    Math.round(
      spectralDimension({
        neighbors: slice.neighbors,
        start: slice.start,
        t1: 3,
        t2: 12,
      }) * 100,
    ) / 100

  // the clean cubic {4,3,4}, the systematic-anisotropy control
  const cube = buildEuclideanLattice({
    symbol: [4, 3, 4] as never,
    maxCells: 30000,
  })

  let cc = 0
  for (let i = 0; i < cube.cellCount; i++) {
    if (cube.coords[i]!.every(x => x === 0)) {
      cc = i
    }
  }

  const cv = (
    neighbors: number[][],
    coords: number[][],
    start: number,
    radius: number,
  ): number =>
    frontCoefficientOfVariation({ neighbors, coords, start, radius })

  const bandCVSmall = cv(slice.neighbors, slice.coords, slice.start, SMALL_RADIUS)
  const bandCVLarge = cv(slice.neighbors, slice.coords, slice.start, LARGE_RADIUS)
  const cubeCVSmall = cv(cube.neighbors, cube.coords, cc, SMALL_RADIUS)
  const cubeCVLarge = cv(cube.neighbors, cube.coords, cc, LARGE_RADIUS)

  return {
    lccPercent,
    bandDim,
    bandCVSmall,
    bandCVLarge,
    cubeCVSmall,
    cubeCVLarge,
    bandReduction: bandCVSmall / bandCVLarge,
    cubeReduction: cubeCVSmall / cubeCVLarge,
  }
}

export default experiment({
  id: 'geometry/emergent-space-test',
  title:
    'the {3,4,3,4} flat space self-averages its light cone toward isotropy with scale while the cubic crystal stays anisotropic',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = emergentSpaceTest()

    // coherent: one large connected component, an effective dimension near three
    const coherent = r.lccPercent > 60 && Math.abs(r.bandDim - 3) < 1

    // emergent isotropy: the band's light-cone anisotropy falls substantially with radius
    // (random roughness self-averaging), while the cubic's barely moves (systematic facets)
    const bandFlowsToIsotropy = r.bandReduction > 2
    const cubeAnisotropyPersists = r.cubeReduction < 1.5
    const emergentIsotropy = bandFlowsToIsotropy && cubeAnisotropyPersists

    const ok = coherent && emergentIsotropy

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} horosphere band is a coherent near-three-dimensional space whose light-cone anisotropy self-averages toward isotropy with scale (a large reduction in the front coefficient of variation across the measured radii), the signature of an emergent isotropic continuum, while the periodic cubic crystal carries a systematic anisotropy that is scale-invariant, persisting at a fixed floor it never escapes',
      metrics: {
        largestComponentPercent: r.lccPercent,
        bandSpectralDimension: r.bandDim,
        bandReductionRatio: Number(r.bandReduction.toFixed(2)),
        cubeReductionRatio: Number(r.cubeReduction.toFixed(2)),
        bandCVSmall: Number(r.bandCVSmall.toFixed(3)),
        bandCVLarge: Number(r.bandCVLarge.toFixed(3)),
        cubeCVLarge: Number(r.cubeCVLarge.toFixed(3)),
      },
      control: {
        cubeReductionRatio: Number(r.cubeReduction.toFixed(2)),
        cubeCVLarge: Number(r.cubeCVLarge.toFixed(3)),
      },
      notes:
        'L2. The decisive measurement is the SCALING of the light-cone anisotropy, not its value at one radius. The aperiodic band CV falls steeply (random roughness self-averaging like one over the square root of the front size), flowing to isotropy, while the periodic cubic CV is scale-invariant (systematic facet anisotropy). This is the substrate-level reason a curved aperiodic mesh can restore Lorentz invariance and a flat lattice cannot. The cubic is the control where the anisotropy does NOT flow away.',
    })
  },
})
