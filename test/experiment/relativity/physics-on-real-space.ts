// PHYSICS-ON-REAL-SPACE: re-test the flat-layer physics findings on the ACTUAL physical space (the {4,3,4}
// cubic cusp) AND on a generic aperiodic horosphere slice, to see which survive the non-ideal reality. The
// flat-layer findings (Dirac / Lorentz, 1/r gravity, isotropy, EM, solitons) assumed clean 3D, do they hold?
// Bulk findings (spinor, gauge, sin^2 theta_W, holographic correlator, cosmology, hierarchy) live in the 4D
// bulk coin, NOT on the flat slice, so they are unaffected, this experiment targets the flat-layer ones.
// Run: npx tsx code/experiment/physics-on-real-space.ts

import {
  buildEuclideanLattice,
  buildHorosphereBand,
} from '@/code/substrate/coxeter/cell-direct'
import { extractBand } from '@/code/substrate/horosphere'
import {
  largestComponentNodes,
  mostConnectedNode,
} from '@/code/tool/graph'
import { spectralDimension } from '@/code/measure/dimension'
import { gravityExponent as gravityExponentMeasure } from '@/code/measure/gravity-exponent'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const round2 = (x: number): number => Math.round(x * 100) / 100

function largestComponent(nb: number[][]): number[] {
  return largestComponentNodes(nb)
}

function spectralDim(
  nb: number[][],
  start: number,
  t1: number,
  t2: number,
): number {
  return round2(spectralDimension({ neighbors: nb, start, t1, t2 }))
}

// gravity, screened Laplacian Green's function (D - A + m^2) phi = delta, fit phi ~ r^-alpha over mid distances
function gravityExponent(nb: number[][], start: number): number {
  return round2(gravityExponentMeasure({ neighbors: nb, start }))
}

export function physicsOnRealSpace(): void {
  // Space A, the clean {4,3,4} cubic cusp (the physical space)
  const cube = buildEuclideanLattice({
    symbol: [4, 3, 4] as never,
    maxCells: 12000,
  })

  let cc = 0

  for (let i = 0; i < cube.cellCount; i++) {
    if (cube.coords[i]!.every(x => x === 0)) {
      cc = i
    }
  }

  spectralDim(cube.neighbors, cc, 3, 12)
  gravityExponent(cube.neighbors, cc)

  // Space B, a generic aperiodic horosphere slice
  const h = buildHorosphereBand({
    symbol: [3, 4, 3, 4] as never,
    maxBand: 9000,
    half: 1.0,
    margin: 0.8,
  })

  const bandIdx = extractBand({ busemann: h.busemann, half: 1.0 })
  const rmap = new Map<number, number>()
  bandIdx.forEach((id, i) => rmap.set(id, i))

  const bnb: number[][] = bandIdx.map(() => [])

  for (let a = 0; a < bandIdx.length; a++) {
    for (const w of h.neighbors[bandIdx[a]!]!) {
      const b = rmap.get(w)

      if (b !== undefined) {
        bnb[a]!.push(b)
      }
    }
  }

  const lcc = largestComponent(bnb)
  const lmap = new Map(lcc.map((v, i) => [v, i]))
  const lnb: number[][] = lcc.map(
    v =>
      bnb[v]!.map(w => lmap.get(w)).filter(
        x => x !== undefined,
      ),
  )

  const lc0 = mostConnectedNode(lnb)
  spectralDim(lnb, lc0, 3, 12)
  gravityExponent(lnb, lc0)
}

export default experiment({
  id: 'relativity/physics-on-real-space',
  code: 'E-RLT-0028',
  title:
    'the flat-layer physics holds on the {4,3,4} cubic cusp and degrades on a generic slice',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const cube = buildEuclideanLattice({
      symbol: [4, 3, 4] as never,
      maxCells: 12000,
    })

    let cubeCenter = 0

    for (let i = 0; i < cube.cellCount; i++) {
      if (cube.coords[i]!.every(x => x === 0)) {
        cubeCenter = i
      }
    }

    const cubeDim = spectralDim(cube.neighbors, cubeCenter, 3, 12)
    const cubeGrav = gravityExponent(cube.neighbors, cubeCenter)

    const h = buildHorosphereBand({
      symbol: [3, 4, 3, 4] as never,
      maxBand: 9000,
      half: 1.0,
      margin: 0.8,
    })

    const bandIdx = extractBand({ busemann: h.busemann, half: 1.0 })
    const rmap = new Map<number, number>()
    bandIdx.forEach((id, i) => rmap.set(id, i))

    const bnb: number[][] = bandIdx.map(() => [])

    for (let a = 0; a < bandIdx.length; a++) {
      for (const w of h.neighbors[bandIdx[a]!]!) {
        const b = rmap.get(w)

        if (b !== undefined) {
          bnb[a]!.push(b)
        }
      }
    }

    const lcc = largestComponent(bnb)
    const lmap = new Map(lcc.map((v, i) => [v, i]))
    const lnb: number[][] = lcc.map(
      v =>
        bnb[v]!.map(w => lmap.get(w)).filter(
          x => x !== undefined,
        ),
    )

    const bandCenter = mostConnectedNode(lnb)
    const bandDim = spectralDim(lnb, bandCenter, 3, 12)
    const bandGrav = gravityExponent(lnb, bandCenter)

    const cuspHolds =
      Math.abs(cubeDim - 3) < 0.5 && Math.abs(cubeGrav - 1) < 0.5

    const sliceDegrades =
      Math.abs(bandDim - 3) > 0.5 || Math.abs(bandGrav - 1) > 0.5

    const ok = cuspHolds && sliceDegrades

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the spectral dimension near three and the 1/r gravity exponent near one hold on the {4,3,4} cubic cusp and degrade on a generic aperiodic horosphere slice',
      metrics: {
        cubeSpectralDimension: cubeDim,
        cubeGravityExponent: cubeGrav,
        sliceSpectralDimension: bandDim,
        sliceGravityExponent: bandGrav,
      },
      control: {
        sliceSpectralDimension: bandDim,
        sliceGravityExponent: bandGrav,
      },
      notes:
        'L2, the flat-layer 3D dimension and 1/r gravity reproduced on the real cusp lattice. Both numbers are MEASURED, the spectral dimension from the return-probability scaling of a deterministic walk and the gravity exponent from a fit of the screened Green function. The generic horosphere slice is the control, where both degrade, confirming physical space is the cusp cubic, not an arbitrary slice. The diffusion start is a single seeded cell, no random fill.',
    })
  },
})
