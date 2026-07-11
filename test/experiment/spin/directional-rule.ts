// P191: the directional rule carries MOMENTUM and a DIRAC MASS. (1) a charge with a direction (coin) streams
// BALLISTICALLY while a memoryless scalar DIFFUSES, and the collision mixing is the MASS, (2) the emergent
// dispersion is the Dirac relation cos E = cos(theta) cos(k), E(0) = theta (rest mass), E^2 - k^2 = m^2 at
// long wavelength (Lorentz). Ported from the throwaway probes.
// Run: npx tsx code/experiment/p191-directional-rule.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { persistentWalkMeanDisplacement } from '@/code/dynamics/random-walk'
import { coinedWalkDispersion } from '@/code/dynamics/quantum-walk'
import { coordinateAxes } from '@/code/measure/probe-directions'

// (1) persistent walk (the directional rule for one charge) vs random walk (scalar): displacement vs time
function walk(
  mix: number,
  T: number,
  trials: number,
  seed: number,
): number {
  return persistentWalkMeanDisplacement({
    directions: coordinateAxes(3),
    mix,
    steps: T,
    runs: trials,
    rng: makeRng({ seed }),
  })
}

export function directionalRule(): {
  ballistic: number
  diffusive: number
  diracOk: boolean
} {
  const T = 64
  const ballistic = walk(0.0, T, 1, 1)
  const diffusive = walk(1.0, T, 400, 11)

  // (2) Dirac dispersion cos E = cos(theta) cos(k)
  let diracOk = true

  for (const m of [0.0, 0.2, 0.6]) {
    const E0 = coinedWalkDispersion({ theta: m, k: 0 })
    const k = 0.1,
      Ek = coinedWalkDispersion({ theta: m, k })

    if (
      Math.abs(E0 - m) > 1e-6 ||
      Math.abs(Ek * Ek - k * k - m * m) > 1e-2
    )
      diracOk = false
  }

  return { ballistic, diffusive, diracOk }
}

export default experiment({
  id: 'spin/directional-rule',
  code: 'E-SPN-0011',
  title:
    'a charge with a direction streams ballistically while a memoryless scalar diffuses',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = directionalRule()
    // ballistic reach should be near the beat count (64), diffusive near sqrt(64) = 8.
    const ballisticFar = r.ballistic > 40
    const diffusiveSlow = r.diffusive < 16
    const ok = ballisticFar && diffusiveSlow && r.diracOk

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a charge that carries a coin direction travels ballistically (displacement near the beat count) while a memoryless scalar diffuses (displacement near the square root), the coin-to-scalar mixing acts as a Dirac mass, and the dispersion follows cos E = cos m cos k with the rest mass equal to the coin angle',
      metrics: {
        ballisticReach: r.ballistic,
        diffusiveReach: r.diffusive,
        beats: 64,
        diracDispersionOk: r.diracOk ? 1 : 0,
      },
      control: {
        // the diffusive (fully-scrambled) walk is the negative control for the
        // ballistic (no-scatter) walk: same lattice, only the direction memory differs.
        diffusiveReach: r.diffusive,
      },
      notes:
        'L2, known physics (the directional walk to Dirac correspondence). HONEST CAVEAT: the walk part (1) uses a pseudo-random scatter schedule and averages over trials, so it is a STATISTICAL claim about an ensemble, not the deterministic base rule. The base is deterministic, the proper measurement is the synchronous lattice-gas, this is the throwaway-probe version ported. Part (2) the Dirac dispersion is ANALYTIC, the relation cos E = cos m cos k is computed and then verified, a consistency check, not a measured dispersion read out of the dynamics.',
    })
  },
})
