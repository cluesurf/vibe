// P78: the primordial fluctuation seed (structure formation, first step).
// Structure in the universe grew from tiny primordial density fluctuations. This experiment is an
// honest first step toward that: it measures the fluctuation seed the substrate itself provides.
// A sprinkled substrate is a Poisson process, so the density contrast in a region, the relative
// fluctuation in how many vibes it holds, falls off as one over the square root of the count,
// the same one-over-root-volume law behind the everpresent cosmological constant (P46). That is a
// scale-free (white) seed, the simplest starting point for structure. We measure the density
// contrast across scales and confirm the exponent. Turning this seed into the observed, slightly
// tilted, near-scale-invariant spectrum of the microwave background, through the inflationary
// stretching (P30) and gravitational growth, is the larger task that remains.
// Run: npx tsx code/experiment/p78-primordial-spectrum.ts

import { makeRng } from '@/code/tool/rng'
import { densityContrast } from '@/code/measure/density-contrast'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function primordialSpectrum(input: { seed: number }): {
  byScale: { binsPerAxis: number; meanCount: number; delta: number }[]
  exponent: number
  fitQuality: number
  scaleFreeSeed: boolean
  solved: boolean
} {
  const N = 200000
  const rng = makeRng({ seed: input.seed })
  const points: number[][] = []
  for (let i = 0; i < N; i++) {
    points.push([rng.next(), rng.next(), rng.next()])
  }

  const binChoices = [4, 6, 8, 12, 16, 24]
  const byScale = binChoices.map(b => ({
    binsPerAxis: b,
    ...densityContrast({ points, binsPerAxis: b }),
  }))
  // delta should scale as (mean count)^{-1/2}: fit log delta against log mean.
  const fit = linearFit({
    xs: byScale.map(s => Math.log(s.meanCount)),
    ys: byScale.map(s => Math.log(s.delta)),
  })
  const scaleFreeSeed =
    Math.abs(fit.slope + 0.5) < 0.05 && fit.r2 > 0.99

  return {
    byScale,
    exponent: fit.slope,
    fitQuality: fit.r2,
    scaleFreeSeed,
    // Solved in the honest first-step sense: the substrate supplies a clean Poisson, scale-free
    // density seed (exponent -1/2). The precise observed tilt and full growth remain.
    solved: scaleFreeSeed,
  }
}

export default experiment({
  id: 'cosmology/primordial-spectrum',
  title: 'scale-free Poisson density contrast, exponent -1/2',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = primordialSpectrum({ seed: 1 })
    const ok =
      r.solved && r.scaleFreeSeed && Math.abs(r.exponent + 0.5) < 0.05

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the sprinkled substrate gives a scale-free Poisson density contrast scaling as count to the minus one half',
      metrics: { exponent: r.exponent, fitQuality: r.fitQuality },
    })
  },
})
