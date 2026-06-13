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

import { makeRng, Rng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

interface Point {
  t: number
  x: number
}

// Poisson-sprinkle points into a 2D Minkowski box [0, tMax] x [-xMax, xMax].
function sprinkleBox(input: { density: number; tMax: number; xMax: number; rng: Rng }): Point[] {
  const area = input.tMax * 2 * input.xMax
  const n = Math.round(input.density * area)
  const pts: Point[] = []
  for (let i = 0; i < n; i++) {
    pts.push({ t: input.rng.next() * input.tMax, x: (input.rng.next() * 2 - 1) * input.xMax })
  }
  pts.sort((a, b) => a.t - b.t)
  return pts
}

// One swerving trajectory. From the current point, with the current rapidity, choose
// the future point in a proper-time shell whose hop rapidity is closest to the current
// one (as straight ahead as the discreteness allows). Return the rapidity samples
// against accumulated proper time.
function swerveWalk(input: {
  points: Point[]
  steps: number
  tauLo: number
  tauHi: number
}): { tau: number; rapidity: number }[] {
  const pts = input.points
  // Start near the bottom center, moving forward in time (rapidity 0).
  let cur: Point = { t: 0, x: 0 }
  let xi = 0
  let tau = 0
  const trace: { tau: number; rapidity: number }[] = []
  for (let s = 0; s < input.steps; s++) {
    let best: Point | null = null
    let bestRapidity = 0
    let bestDelta = Infinity
    let bestTau = 0
    for (const q of pts) {
      const dt = q.t - cur.t
      if (dt <= 0) {
        continue
      }
      const dx = q.x - cur.x
      const interval2 = dt * dt - dx * dx
      if (interval2 <= 0) {
        continue // not timelike-future
      }
      const properTime = Math.sqrt(interval2)
      if (properTime < input.tauLo || properTime > input.tauHi) {
        continue
      }
      const v = dx / dt
      if (Math.abs(v) >= 0.999) {
        continue
      }
      const rapidity = Math.atanh(v)
      const delta = Math.abs(rapidity - xi)
      if (delta < bestDelta) {
        bestDelta = delta
        best = q
        bestRapidity = rapidity
        bestTau = properTime
      }
    }
    if (best === null) {
      break
    }
    cur = best
    xi = bestRapidity
    tau += bestTau
    trace.push({ tau, rapidity: xi })
  }
  return trace
}

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
  const n = linear.length
  const mx = linear.reduce((a, p) => a + p.tau, 0) / Math.max(1, n)
  const my = linear.reduce((a, p) => a + p.varRapidity, 0) / Math.max(1, n)
  let cov = 0
  let varx = 0
  for (const p of linear) {
    cov += (p.tau - mx) * (p.varRapidity - my)
    varx += (p.tau - mx) * (p.tau - mx)
  }
  return { density: input.density, slope: varx === 0 ? 0 : cov / varx, points }
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
