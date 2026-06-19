// The Dowker-Henson-Sorkin swerve walk on a 2D causal set. A free particle on a
// continuum geodesic keeps a constant velocity forever, but on a sprinkled causal
// set there is no element exactly straight ahead, so at each step the particle hops
// to the future element (within a proper-time shell [tauLo, tauHi]) whose hop
// rapidity is closest to its current rapidity (as straight as the discreteness
// allows). The rapidity then undergoes a random walk, the swerve. Returns the
// rapidity samples against accumulated proper time.

import { SprinkledPoint } from '@/code/substrate/sprinkle-box'

export function swerveWalk(input: {
  points: SprinkledPoint[]
  steps: number
  tauLo: number
  tauHi: number
}): { tau: number; rapidity: number }[] {
  const pts = input.points
  // Start near the bottom centre, moving forward in time (rapidity 0).
  let cur: SprinkledPoint = { t: 0, x: 0 }
  let xi = 0
  let tau = 0
  const trace: { tau: number; rapidity: number }[] = []
  for (let s = 0; s < input.steps; s++) {
    let best: SprinkledPoint | null = null
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
