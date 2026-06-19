// P26: swerves (a distinctive, observational prediction of discreteness).
// On a continuum geodesic a free particle keeps a constant velocity forever. On a
// causal set it cannot: there is no element exactly straight ahead, so the particle
// hops to the nearest available future element and its velocity gets a tiny random
// kick at every step. This is the Dowker-Henson-Sorkin swerve: the momentum
// (rapidity) undergoes a random walk, so its variance grows LINEARLY with proper
// time, a diffusion. The diffusion constant scales with the discreteness (sprinkling
// density), and over cosmic times it would heat particles, a cosmic-ray and
// dark-sector signature. We sprinkle 2D Minkowski, walk a particle as straight as the
// discreteness allows, and measure the rapidity diffusion. See note/questions/frontiers.md.
// Run: npx tsx code/experiment/p26-swerves.ts

import { swerveDiffusion } from '@/code/measure/swerve-diffusion'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'relativity/swerves',
  title:
    'momentum diffusion from discreteness, variance grows with proper time',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = swerveDiffusion({
      density: 1.2,
      seed: 1,
      trajectories: 250,
    })
    const clean = r.points.filter(p => p.tau <= 11)
    const grows =
      clean.length > 2 &&
      (clean[clean.length - 1]?.varRapidity ?? 0) >
        2 * (clean[0]?.varRapidity ?? 1)
    const ok = r.slope > 0.01 && grows
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a particle on a causal set undergoes rapidity diffusion whose variance grows with proper time',
      metrics: {
        rapidityVarianceSlope: r.slope,
        firstVariance: clean[0]?.varRapidity ?? 0,
        lastVariance: clean[clean.length - 1]?.varRapidity ?? 0,
      },
      notes:
        'variance saturates at large proper time as wide-rapidity trajectories leave the finite box, and the precise diffusion-constant density scaling needs a fully covariant trajectory rule',
    })
  },
})
