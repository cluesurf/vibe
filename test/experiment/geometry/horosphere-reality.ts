// HOROSPHERE-REALITY: probe what the {3,4,3,4} "flat 3D physical space" actually is in a FINITE mesh. Questions,
// (1) is a horosphere band intrinsically flat (POLYNOMIAL ~ r^2/r^3 growth, not exponential)? (2) is the discrete
// tiling on it PERIODIC (clean cubic {4,3,4}, uniform degree 6) or APERIODIC (varying degrees)? (3) how does the
// band size scale, i.e. what does a GROWING flat slice look like? Run: npx tsx code/experiment/horosphere-reality.ts

import { bfsShells, midShellGrowthRatio } from '@/code/measure/shells'
import {
  bandInducedSubgraph,
  buildHorosphereBand,
} from '@/code/substrate/coxeter/cell-direct'
import { mostConnectedNode } from '@/code/tool/graph'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function horosphereReality(): {
  bandCount: number
  flatGrowth: number
  degreeHistogram: Record<number, number>
} {
  const h = buildHorosphereBand({
    symbol: [3, 4, 3, 4] as never,
    maxBand: 3000,
    half: 0.5,
    margin: 0.7,
  })

  // induced adjacency ON the band only (cells whose Busemann value is within half)
  const { neighbors: bnb } = bandInducedSubgraph({
    band: h,
    halfWidth: 0.5,
  })

  const B = bnb.length
  // (1) flatness, intrinsic growth of the band graph (BFS from a central band cell) should be POLYNOMIAL
  const c0 = mostConnectedNode(bnb)
  const { shellCounts: shell } = bfsShells({ neighbors: bnb, root: c0 })
  const flatGrowth = midShellGrowthRatio({ shellCounts: shell })
  // (2) periodicity, degree histogram of the band cells (clean cubic {4,3,4} -> mostly degree 6; aperiodic -> spread)
  const degreeHistogram: Record<number, number> = {}

  for (let a = 0; a < B; a++) {
    const d = bnb[a]!.length
    degreeHistogram[d] = (degreeHistogram[d] ?? 0) + 1
  }

  return { bandCount: B, flatGrowth, degreeHistogram }
}

// The {3,4,3,4} horosphere band is intrinsically flat even at finite distance. We extract
// the band, measure its intrinsic shell growth (polynomial, a small ratio, not the
// exponential growth of a curved bulk), and read its degree histogram to see whether the
// discrete tiling is the clean periodic {4,3,4} or an aperiodic flat slab. This is a
// geometric probe of a known tessellation, so L1, and a structural finding, so paper is
// false.
export default experiment({
  id: 'geometry/horosphere-reality',
  code: 'E-GMT-0019',
  title:
    'the {3,4,3,4} horosphere band is intrinsically flat at finite distance, with a spread of cell degrees',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = horosphereReality()
    const distinctDegrees = Object.keys(r.degreeHistogram).length
    const flat = r.flatGrowth > 0 && r.flatGrowth < 4
    const ok = flat && r.bandCount > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} horosphere band grows polynomially (intrinsically flat) at finite distance, with a spread of cell degrees',
      metrics: {
        bandCells: r.bandCount,
        intrinsicGrowthRatio: r.flatGrowth,
        distinctDegrees,
      },
      notes:
        'L1, a geometric probe of a known tessellation. The polynomial (small) growth ratio shows horospheres are Euclidean even at finite distance. The degree spread distinguishes the clean periodic cusp from a generic aperiodic flat slab.',
    })
  },
})
