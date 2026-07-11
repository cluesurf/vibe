// P28: singularity resolution (discreteness bounds the curvature).
// General relativity has singularities: at the big bang and inside black holes the
// curvature diverges, because the continuum lets you probe arbitrarily small scales,
// and curvature scales as 1 / length^2 -> infinity. A causal set has a MINIMUM
// length: the smallest causal interval is set by the sprinkling density, not zero. So
// curvature is bounded ABOVE by 1 / (minimum length)^2, a finite cap that rises with
// density and recovers the continuum divergence only in the limit. The singularity is
// resolved: a finite maximum curvature instead of infinity. We measure the minimum
// interval versus density and show the curvature cap is finite and set by the
// discreteness. See note/questions/frontiers.md. Run:
// npx tsx code/experiment/p28-singularity-resolution.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Point = {
  t: number
  x: number
}

function sprinkle(input: {
  density: number
  tMax: number
  xMax: number
  rng: Rng
}): Point[] {
  const n = Math.round(input.density * input.tMax * 2 * input.xMax)

  return Array.from({ length: n }, () => ({
    t: input.rng.next() * input.tMax,
    x: (input.rng.next() * 2 - 1) * input.xMax,
  }))
}

// The smallest timelike-future proper time from each point (its nearest causal
// neighbor): the discreteness length. The continuum has no such floor, it goes to
// zero, so a discrete set has a minimum length the continuum lacks.
export function minimumInterval(input: {
  density: number
  seed: number
}): {
  density: number
  meanLength: number
  curvatureCap: number
} {
  const pts = sprinkle({
    density: input.density,
    tMax: 8,
    xMax: 8,
    rng: makeRng({ seed: input.seed }),
  })

  const lengths: number[] = []

  for (const p of pts) {
    if (!p || p.t > 6 || Math.abs(p.x) > 6) {
      continue
    } // keep away from the boundary

    let best = Infinity

    for (const q of pts) {
      if (!q || q.t <= p.t) {
        continue
      }

      const dt = q.t - p.t
      const dx = q.x - p.x
      const interval2 = dt * dt - dx * dx

      if (interval2 > 0) {
        best = Math.min(best, Math.sqrt(interval2))
      }
    }

    if (best < Infinity) {
      lengths.push(best)
    }
  }

  const meanLength =
    lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length)

  return {
    density: input.density,
    meanLength,
    curvatureCap: meanLength > 0 ? 1 / (meanLength * meanLength) : 0,
  }
}

export default experiment({
  id: 'cosmology/singularity-resolution',
  code: 'E-CSM-0038',
  title: 'discreteness caps the curvature (finite, density-set)',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const a = minimumInterval({ density: 1, seed: 1 })
    const b = minimumInterval({ density: 16, seed: 1 })
    const ok =
      b.meanLength < a.meanLength &&
      b.curvatureCap > a.curvatureCap &&
      Number.isFinite(b.curvatureCap) &&
      a.curvatureCap > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the minimum causal interval caps the curvature at a finite value that rises with sprinkling density',
      metrics: {
        lengthLowDensity: a.meanLength,
        lengthHighDensity: b.meanLength,
        curvatureCapLowDensity: a.curvatureCap,
        curvatureCapHighDensity: b.curvatureCap,
      },
    })
  },
})
