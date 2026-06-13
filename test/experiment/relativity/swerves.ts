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

import { makeRng } from '@/code/tool/rng'
import { sprinkleBox } from '@/code/substrate/sprinkle-box'
import { swerveWalk } from '@/code/dynamics/swerve-walk'
import { linearFit } from '@/code/measure/regression'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Slope of rapidity variance versus proper time (the diffusion constant: variance =
// 2 k tau).
export function swerveDiffusion(input: { density: number; seed: number; trajectories: number }): {
  density: number
  slope: number
  points: { tau: number; varRapidity: number }[]
} {
  // Bin rapidity^2 by proper time, averaged over many trajectories.
  const bins = 12
  const tauMax = 18
  const sum = new Float64Array(bins)
  const count = new Int32Array(bins)
  for (let tr = 0; tr < input.trajectories; tr++) {
    const points = sprinkleBox({
      density: input.density,
      tMax: 26,
      xMax: 16,
      rng: makeRng({ seed: input.seed + tr * 97 }),
    })
    const trace = swerveWalk({ points, steps: 40, tauLo: 0.6, tauHi: 2.2 })
    for (const sample of trace) {
      const b = Math.floor((sample.tau / tauMax) * bins)
      if (b >= 0 && b < bins) {
        sum[b] = (sum[b] ?? 0) + sample.rapidity * sample.rapidity
        count[b] = (count[b] ?? 0) + 1
      }
    }
  }
  const points: { tau: number; varRapidity: number }[] = []
  for (let b = 0; b < bins; b++) {
    if ((count[b] ?? 0) > 20) {
      points.push({ tau: ((b + 0.5) / bins) * tauMax, varRapidity: (sum[b] ?? 0) / (count[b] ?? 1) })
    }
  }
  // Fit the slope on the clean linear range only (early proper time). At large tau the
  // variance saturates as wide-rapidity trajectories leave the finite box, a boundary
  // effect, not the diffusion.
  const linear = points.filter((p) => p.tau <= 11)
  const slope = linear.length > 0
    ? linearFit({ xs: linear.map((p) => p.tau), ys: linear.map((p) => p.varRapidity) }).slope
    : 0
  return { density: input.density, slope, points }
}

export default defineExperiment({
  id: 'relativity/swerves',
  title: 'momentum diffusion from discreteness, variance grows with proper time',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = swerveDiffusion({ density: 1.2, seed: 1, trajectories: 250 })
    const clean = r.points.filter((p) => p.tau <= 11)
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
