// The swerve diffusion: the slope of rapidity variance versus proper time (the diffusion constant:
// variance = 2 k tau). On a causal set a free particle hops to the nearest available future element
// and its rapidity gets a tiny random kick at every step, so its variance grows linearly with proper
// time. We sprinkle a box, walk a particle as straight as the discreteness allows, and fit the slope.

import { makeRng } from '@/code/tool/rng'
import { sprinkleBox } from '@/code/substrate/sprinkle-box'
import { swerveWalk } from '@/code/dynamics/swerve-walk'
import { linearFit } from '@/code/measure/regression'

export function swerveDiffusion(input: {
  density: number
  seed: number
  trajectories: number
}): {
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
    const trace = swerveWalk({
      points,
      steps: 40,
      tauLo: 0.6,
      tauHi: 2.2,
    })
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
      points.push({
        tau: ((b + 0.5) / bins) * tauMax,
        varRapidity: (sum[b] ?? 0) / (count[b] ?? 1),
      })
    }
  }
  // Fit the slope on the clean linear range only (early proper time). At large tau the
  // variance saturates as wide-rapidity trajectories leave the finite box, a boundary
  // effect, not the diffusion.
  const linear = points.filter(p => p.tau <= 11)
  const slope =
    linear.length > 0
      ? linearFit({
          xs: linear.map(p => p.tau),
          ys: linear.map(p => p.varRapidity),
        }).slope
      : 0
  return { density: input.density, slope, points }
}
