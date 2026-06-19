// P219 (gravity, DIMENSION-RESOLVED): the tree (p218) gave a dimension-blind 1/r. But gravity lives on the flat
// physical-space layer (the cusp / horosphere), whose OWN Laplacian Green's function is the d-dimensional Newton
// law 1/r^(d-2). So {3,4,3,4}'s 3D cusp -> 1/r (correct 3D Newton), {5,3,4}'s 2D horosphere -> log r. We solve
// the discrete Poisson equation (-Laplacian) G = delta on the flat lattice by conjugate gradient and read the
// falloff. Run: npx tsx code/experiment/p219-gravity-boundary.ts

import { logLogSlope, linearFit } from '@/code/measure/regression'
import { dCubePoissonGreens } from '@/code/operator/dcube-poisson'
import { radialFieldProfile } from '@/code/measure/profile'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const solvePoisson = (
  L: number,
  d: number,
): ReturnType<typeof dCubePoissonGreens> =>
  dCubePoissonGreens({ side: L, dimension: d })

const radial = (
  sol: { x: Float64Array; coord: (i: number) => number[] },
  L: number,
  d: number,
): { r: number; g: number }[] =>
  radialFieldProfile({
    values: sol.x,
    coord: sol.coord,
    side: L,
    dimension: d,
    minRadius: 2,
    maxRadius: L * 0.35,
  })

export function gravityBoundary(): {
  exp3D: number
  slope2DvsLog: number
} {
  // 3D cusp ({4,3,4}): Newton 1/r  -> g(r)*r ~ const, i.e. log g vs log r slope ~ -1
  const s3 = solvePoisson(32, 3),
    p3 = radial(s3, 32, 3).filter(p => p.g > 0)

  const exp3D = logLogSlope(
    p3.map(p => p.r),
    p3.map(p => p.g),
  )

  // 2D horosphere: Newton ~ -log r -> g(r) linear in log r (negative slope)
  const s2 = solvePoisson(140, 2),
    p2 = radial(s2, 140, 2)

  const slope2DvsLog = linearFit({
    xs: p2.map(p => Math.log(p.r)),
    ys: p2.map(p => p.g),
  }).slope

  return { exp3D, slope2DvsLog }
}

export default experiment({
  id: 'gravity/gravity-boundary',
  title:
    'the discrete Poisson Green function on the flat 3D cusp falls as 1/r and on the 2D horosphere as log r',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = gravityBoundary()
    const threeDimNewton = Math.abs(r.exp3D + 1) < 0.25
    const twoDimLog = r.slope2DvsLog < 0
    const ok = threeDimNewton && twoDimLog

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'solving the discrete Laplacian Green function on a flat 3D cube gives a 1/r falloff and on a flat 2D square gives a negative log-r slope, the dimension-correct Newton potentials',
      metrics: {
        threeDimSlope: r.exp3D,
        twoDimLogSlope: r.slope2DvsLog,
      },
      notes:
        'L1 known math with a dimensional control. This solves a hardcoded lattice Laplacian on a plain d-cube (not the substrate adjacency), so the 3D-vs-2D contrast is the established lattice Green function (1/r in 3D, log in 2D), not emergent gravity. The dimension comparison is the control. Useful as a consistency check that the flat-layer dimension sets the Newton law, but assumes the Laplacian.',
    })
  },
})
