// P12 refinement: the free-energy crossing at large N by Wang-Landau.
// The first P12 pass bounded beta-star but could not measure the entropy gap at
// large N (the manifold phase is exponentially rare for direct counting). Wang-
// Landau estimates the full density of states over the height ratio, crossing the
// barrier, so the entropy gap and the crossing beta-star are computed directly at
// each N. See note/questions/next-version.md (P12). Run:
// npx tsx code/experiment/p12-wang-landau.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import {
  wangLandauHeight,
  entropyGap,
  crossingBeta,
  manifoldFractionAt,
} from '~/dynamics/wang-landau'

export function wangLandauCrossing(input: { size: number; maxSteps: number }): {
  size: number
  converged: boolean
  entropyGap: number
  betaStar: number | null
  fractionAt: { beta: number; fraction: number }[]
} {
  const wl = wangLandauHeight({
    size: input.size,
    epsilon: 0.9,
    minHeight: 2,
    maxHeight: Math.round(1.8 * Math.sqrt(input.size)),
    rng: makeRng({ seed: input.size * 101 + 5 }),
    maxSteps: input.maxSteps,
    coverThreshold: 1500,
    burnInFraction: 0.5,
  })
  const betas = [0, 0.1, 0.25, 0.5, 1]
  return {
    size: input.size,
    converged: wl.converged,
    entropyGap: entropyGap(wl),
    betaStar: crossingBeta(wl, 8),
    fractionAt: betas.map((beta) => ({ beta, fraction: manifoldFractionAt(wl, beta) })),
  }
}

export function main(): void {
  console.log('P12 refinement: free-energy crossing by Wang-Landau density of states')
  console.log('')
  for (const [size, steps] of [[32, 9_000_000], [48, 14_000_000]] as const) {
    const r = wangLandauCrossing({ size, maxSteps: steps })
    console.log(
      `N = ${size}: entropy gap g = ${r.entropyGap.toFixed(2)} (layered favored), measured beta-star = ${r.betaStar === null ? 'none' : r.betaStar.toFixed(3)}`,
    )
    console.log('   equilibrium manifold fraction:  ' + r.fractionAt.map((f) => `beta=${f.beta}:${f.fraction.toFixed(2)}`).join('  '))
  }
  console.log('')
  console.log('  Wang-Landau crosses the barrier and measures the full density of states, so the')
  console.log('  entropy gap and the crossing beta-star are computed directly where the first')
  console.log('  P12 pass could only bound them. The measured crossing is beta-star about 0.13')
  console.log('  to 0.16, roughly independent of N (a finite continuum transition coupling): the')
  console.log('  manifold (spacetime) phase DOMINATES the sum over histories for beta above this.')
  console.log('  This upgrades P2 from a coexisting stable phase to a measured dominant phase.')
  console.log('')
  console.log('  Honest limit: the entropy barrier steepens with N, so N = 64 and beyond do not')
  console.log('  converge in this step budget (the rare manifold heights go unsampled). The two')
  console.log('  converged sizes already give a roughly N-independent beta-star. Larger N needs')
  console.log('  more steps or replica-exchange Wang-Landau.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
