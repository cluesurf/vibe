// P211 (Tier 3): emergent Lorentz invariance from the Dirac dispersion cos E = cos(m) cos(k). A boost of
// rapidity eta acts as (E,k) -> (E cosh eta + k sinh eta, k cosh eta + E sinh eta). Check the boosted point
// still lies on the dispersion at long wavelength (E^2 - k^2 = m^2 invariant), and the group velocity is
// subluminal, reaching c=1 only for the massless case. Run: npx tsx code/experiment/p211-lorentz.ts

import { coinedWalkDispersion } from '@/code/dynamics/quantum-walk'
import { boostEnergyMomentum } from '@/code/measure/rapidity'
import { groupVelocity1d } from '@/code/measure/group-speed'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const E = (m: number, k: number): number =>
  coinedWalkDispersion({ theta: m, k })

export function lorentz(): {
  invariantSmallK: boolean
  masslessIsLightspeed: boolean
  maxGroupVelocity: number
} {
  // (1) boost-invariance of E^2 - k^2 at small k
  let invariantSmallK = true

  const m = 0.3

  for (const k of [0.05, 0.1, 0.2]) {
    const e = E(m, k)

    for (const eta of [0.2, 0.5]) {
      const b = boostEnergyMomentum({
        omega: e,
        wavenumber: k,
        rapidity: eta,
      })

      const inv = b.omega * b.omega - b.wavenumber * b.wavenumber

      if (Math.abs(inv - m * m) > 0.02) {
        invariantSmallK = false
      }
    }
  }

  // (2) group velocity v = dE/dk, subluminal, -> 1 as m -> 0
  let maxGroupVelocity = 0

  for (const mm of [0.0, 0.3, 0.6]) {
    let vmax = 0

    for (let k = 0.01; k < 1.2; k += 0.01) {
      const v = groupVelocity1d({
        omega: kk => E(mm, kk),
        k,
        step: 0.005,
      })

      if (v > vmax) {
        vmax = v
      }
    }

    if (mm === 0) {
      maxGroupVelocity = vmax
    }
  }

  const masslessIsLightspeed = Math.abs(maxGroupVelocity - 1) < 0.05

  return { invariantSmallK, masslessIsLightspeed, maxGroupVelocity }
}

export default experiment({
  id: 'relativity/lorentz',
  title:
    'the Dirac dispersion is boost-invariant at small k with a massless light-speed mode',
  category: 'relativity',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = lorentz()
    const ok =
      r.invariantSmallK &&
      r.masslessIsLightspeed &&
      Math.abs(r.maxGroupVelocity - 1) < 0.05

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the assumed dispersion cos E = cos(m) cos(k) keeps E^2 - k^2 = m^2 invariant under a boost at small k and gives a massless mode at the speed of light',
      metrics: { maxGroupVelocityMassless: r.maxGroupVelocity },
      notes:
        'L1, closed-form algebra of the ASSUMED Dirac dispersion. Boost invariance and the light-speed massless mode are properties of the assumed formula, not measured from dynamics, so this is a consistency check. The massive subluminal versus massless light-speed comparison is the internal control.',
    })
  },
})
