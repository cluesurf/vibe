// G5 of chunk 10, the curvature-arrow link: only negative curvature sustains the arrow. A SPHERICAL reflection
// group has a FINITE orbit, it closes (adding room does not grow it, the depth stays tiny), so its frontier
// vanishes and the wake cannot sustain creation. A HYPERBOLIC group has an INFINITE orbit that grows
// geometrically (each shell larger than the last), so its frontier is perpetual and the wake sustains a living
// universe. We build a spherical and two hyperbolic substrates, confirm the orbit closes versus grows, and run
// the growing-mesh genesis on each, life sustains only on the hyperbolic ones. So the arrow's permanence traces
// to the curvature sign, its deepest geometric root.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { neighborDistances } from '@/code/tool/graph'
import { growingMeshGenesis } from '@/code/dynamics/genesis'
import { scaled } from '@/test/scaffold/scale'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/curvature-arrow',
  code: 'E-CSM-0008',
  title:
    'only negative curvature sustains the arrow, a spherical orbit closes and dies, a hyperbolic orbit grows and lives',
  category: 'cosmology',
  substrates: ['73'],
  depth: 'L3',
  paper: true,
  scales: true,
  run(context) {
    const scale = context.scale ?? 1

    const lifeOf = (sym: number[]) => {
      const small = buildCoxeterMesh({
        symbol: sym,
        depth: 40,
        maxChambers: scaled(200, scale),
      })

      const large = buildCoxeterMesh({
        symbol: sym,
        depth: 40,
        maxChambers: scaled(8000, scale),
      })

      const orbitGrows = large.cellCount > small.cellCount * 1.5 // does giving the orbit more room grow it (infinite) or not (closes)
      const n = large.cellCount

      let c = 0

      for (let i = 1; i < n; i++) {
        if (large.neighbors[i]!.length > large.neighbors[c]!.length) {
          c = i
        }
      }

      const depth = neighborDistances({
        neighbors: large.neighbors,
        size: n,
        source: c,
      })

      const g = growingMeshGenesis({
        neighbors: large.neighbors,
        depth,
        settleBeats: 20,
      })

      const lifeFrac =
        g.trajectory[g.trajectory.length - 1]! / g.bornEnd

      return { n, maxDepth: g.maxDepth, orbitGrows, lifeFrac }
    }

    const sph = lifeOf([5, 3]) // spherical (finite, closes)
    const hyp2 = lifeOf([7, 3]) // hyperbolic 2D
    const hyp3 = lifeOf([5, 3, 4]) // hyperbolic 3D

    const sphericalCloses = !sph.orbitGrows && sph.maxDepth <= 2 // the orbit is finite and shallow
    const hyperbolicGrows = hyp2.orbitGrows && hyp3.orbitGrows // the orbit is unbounded
    const hyperbolicLives = hyp2.lifeFrac > 0.1 && hyp3.lifeFrac > 0.03 // life sustained on the hyperbolic substrates
    const arrowTracksCurvature =
      Math.min(hyp2.lifeFrac, hyp3.lifeFrac) > sph.lifeFrac // hyperbolic outlives spherical

    const ok =
      sphericalCloses &&
      hyperbolicGrows &&
      hyperbolicLives &&
      arrowTracksCurvature

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a spherical reflection group has a finite orbit that closes (the frontier vanishes, the wake cannot sustain creation) while a hyperbolic group has an infinite orbit that grows geometrically (a perpetual frontier), and the growing-mesh genesis sustains a living universe only on the hyperbolic substrates, so the arrow permanence traces to negative curvature',
      metrics: {
        sphericalN: sph.n,
        sphericalMaxDepth: sph.maxDepth,
        sphericalLife: Number(sph.lifeFrac.toFixed(3)),
        hyp2dLife: Number(hyp2.lifeFrac.toFixed(3)),
        hyp3dLife: Number(hyp3.lifeFrac.toFixed(3)),
      },
      // CONTROL: the spherical orbit does not grow with added room (orbitGrows false), it closes, so the failure to sustain life is the curvature, not the size.
      control: {
        sphericalOrbitGrows: sph.orbitGrows ? 1 : 0,
        hyp2dOrbitGrows: hyp2.orbitGrows ? 1 : 0,
      },
      notes:
        'G5, the deepest geometric root of the arrow (arrow Layer 3). Euclidean is the marginal middle, not buildable via the orbit engine here.',
    })
  },
})
