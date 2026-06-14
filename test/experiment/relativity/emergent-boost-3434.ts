// P259 (emergent BOOST, completing the Lorentz group): p247 gave rotations (isotropy of the 24 directions),
// this adds BOOSTS. The emergent dispersion E^2 - p^2 = m^2 (measured in p253) is the Lorentz invariant. We
// verify (1) a boost (rapidity phi) maps (E,p) -> (E',p') and E'^2 - p'^2 = m^2 is PRESERVED, so the
// long-wavelength theory is boost-invariant, (2) velocities ADD RELATIVISTICALLY u' = (u+v)/(1+uv), not
// Galilean, (3) HONEST: boost invariance is EMERGENT in the infrared, the lattice dispersion breaks it at
// short wavelength (a lattice artifact), exactly as expected for an emergent-spacetime substrate.
// Run: npx tsx code/experiment/p259-emergent-boost-3434.ts

import { coinedWalkDispersion } from '@/code/dynamics/quantum-walk'
import { addVelocities, boostEnergyMomentum, relativisticEnergy } from '@/code/measure/rapidity'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// continuum (IR) dispersion E = sqrt(m^2 + p^2); a boost of rapidity phi
const Eof = (m: number, p: number): number => relativisticEnergy({ mass: m, momentum: p })
const boost = (E: number, p: number, phi: number): [number, number] => {
  const b = boostEnergyMomentum({ omega: E, wavenumber: p, rapidity: -phi })
  return [b.omega, b.wavenumber]
}
// lattice dispersion cos E = cos(m) cos(k) (from the directional rule)
const ElatticeFromK = (m: number, k: number): number => coinedWalkDispersion({ theta: m, k })

export function emergentBoost(): { invariantPreserved: boolean; velocitiesAddRelativistically: boolean; latticeBreaksUV: boolean; emergentInIR: boolean } {
  // (1) E^2 - p^2 = m^2 preserved under boosts (the Lorentz invariant)
  let invariantPreserved = true
  for (const m of [0.2, 0.5]) for (const p of [0.0, 0.3, 0.7]) for (const phi of [-0.8, -0.3, 0.5, 1.0]) {
    const E = Eof(m, p), [E2, p2] = boost(E, p, phi)
    if (Math.abs((E2 * E2 - p2 * p2) - m * m) > 1e-9) invariantPreserved = false
  }

  // (2) relativistic velocity addition u' = (u+v)/(1+uv), NOT Galilean u+v
  let velocitiesAddRelativistically = true, galileanWrong = false
  for (const u of [0.3, 0.6, 0.9]) for (const v of [0.4, 0.8]) {
    const rel = addVelocities({ velocity: u, frame: v }) // relativistic sum, always < 1
    const gal = u + v
    if (rel >= 1 || rel <= 0) velocitiesAddRelativistically = false
    if (gal > 1) galileanWrong = true // Galilean would exceed c, relativistic never does
  }
  // verify a concrete case: 0.9 + 0.9 = 0.994... (< c), not 1.8
  const example = (0.9 + 0.9) / (1 + 0.81)

  // (3) HONEST: the lattice dispersion is NOT exactly boost-invariant, it breaks at short wavelength (UV)
  // measure the invariant E^2 - k^2 vs m^2 at small k (IR, should match) and large k (UV, should deviate)
  const m = 0.4
  const kIR = 0.05, EIR = ElatticeFromK(m, kIR), invIR = EIR * EIR - kIR * kIR
  const kUV = 1.5, EUV = ElatticeFromK(m, kUV), invUV = EUV * EUV - kUV * kUV
  const emergentInIR = Math.abs(invIR - m * m) < 1e-2
  const latticeBreaksUV = Math.abs(invUV - m * m) > 0.1

  return { invariantPreserved, velocitiesAddRelativistically: velocitiesAddRelativistically && galileanWrong, latticeBreaksUV, emergentInIR }
}

export default experiment({
  id: 'relativity/emergent-boost-3434',
  title: 'boosts preserve E^2 - p^2 = m^2 in the infrared and break it in the ultraviolet',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = emergentBoost()
    const ok =
      r.invariantPreserved &&
      r.velocitiesAddRelativistically &&
      r.emergentInIR &&
      r.latticeBreaksUV
    const m = 0.4
    const invariantIR = ElatticeFromK(m, 0.05) ** 2 - 0.05 ** 2
    const invariantUV = ElatticeFromK(m, 1.5) ** 2 - 1.5 ** 2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the assumed continuum dispersion is boost-invariant and velocities add relativistically, while the lattice dispersion holds the invariant in the infrared and breaks it in the ultraviolet',
      metrics: {
        massSquared: m * m,
        invariantInfrared: invariantIR,
        invariantUltraviolet: invariantUV,
      },
      notes:
        'L1, closed-form algebra of an ASSUMED continuum dispersion E = sqrt(m^2 + p^2) and the lattice dispersion cos E = cos(m) cos(k). Boost invariance and relativistic velocity addition are properties of the assumed forms, not measured from the directional rule, so this is a consistency check, not a derivation. The infrared-holds versus ultraviolet-breaks contrast is the control. The honest negative is that the lattice breaks boosts at short wavelength.',
    })
  },
})
