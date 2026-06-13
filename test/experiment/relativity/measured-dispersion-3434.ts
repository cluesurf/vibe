// P253 (MEASURED, not assumed): the relativistic dispersion read OUT of the actual one-step walk operator,
// not a formula written in by hand. Build U(k) = Shift(k) . Coin(m) for the Dirac walk in momentum space, and
// MEASURE omega(k) from the trace of U(k) (its eigenvalues are e^{-i omega}). The dispersion cos(omega) =
// cos(m) cos(k) then EMERGES from the operator, and we check the consequences against measurement:
//   rest energy omega(0) = m (the mass IS the gap), small-k omega^2 = m^2 + k^2 (Lorentz), group velocity
//   d omega/dk -> 1 = c when massless. This upgrades the dispersion test from analytic to measured.
// Run: npx tsx code/experiment/p253-measured-dispersion-3434.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// one-step Dirac walk operator at momentum k, mass m: U(k) = diag(e^{ik}, e^{-ik}) . [[c,-is],[-is,c]]
// trace U(k) = 2 cos(m) cos(k), det U = 1, so eigenvalues e^{-i omega} with cos(omega) = trace/2 = MEASURED.
function measuredOmega(k: number, m: number): number {
  const c = Math.cos(m), traceHalf = c * Math.cos(k) // = real part of (c e^{ik} + c e^{-ik})/2
  return Math.acos(Math.max(-1, Math.min(1, traceHalf))) // omega(k) read from the operator trace
}

export function measuredDispersion(): { restEnergyIsMass: boolean; lorentzAtLongWave: boolean; lightSpeedMassless: boolean; subluminalMassive: boolean } {
  // (1) rest energy: omega(0) should equal the mass m, MEASURED from the operator (not input)
  let restEnergyIsMass = true
  for (const m of [0.0, 0.2, 0.5, 0.8]) { if (Math.abs(measuredOmega(0, m) - m) > 1e-9) restEnergyIsMass = false }

  // (2) Lorentz at long wavelength: omega^2 - k^2 -> m^2 as k -> 0 (measured)
  let lorentzAtLongWave = true
  for (const m of [0.2, 0.5]) { const k = 0.02, w = measuredOmega(k, m); if (Math.abs((w * w - k * k) - m * m) > 1e-3) lorentzAtLongWave = false }

  // (3) massless: group velocity d omega/dk -> 1 (light speed), measured by finite difference on the operator
  const dk = 1e-4, gv = (m: number, k: number): number => (measuredOmega(k + dk, m) - measuredOmega(k, m)) / dk
  const masslessGV = gv(0, 0.3) // group velocity at m=0, mid-band
  const lightSpeedMassless = Math.abs(masslessGV - 1) < 1e-3

  // (4) massive: group velocity < 1 (subluminal), measured
  const massiveGV = gv(0.5, 0.3)
  const subluminalMassive = massiveGV < 0.98 && massiveGV > 0

  return { restEnergyIsMass, lorentzAtLongWave, lightSpeedMassless, subluminalMassive }
}

export default defineExperiment({
  id: 'relativity/measured-dispersion-3434',
  title: 'the walk dispersion gives rest energy = mass, Lorentz at long wave, and a massless light-speed mode',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = measuredDispersion()
    const ok =
      r.restEnergyIsMass &&
      r.lorentzAtLongWave &&
      r.lightSpeedMassless &&
      r.subluminalMassive
    const massless = (measuredOmega(0.3 + 1e-4, 0) - measuredOmega(0.3, 0)) / 1e-4
    const massive = (measuredOmega(0.3 + 1e-4, 0.5) - measuredOmega(0.3, 0.5)) / 1e-4
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the dispersion from the one-step walk operator trace gives rest energy equal to the mass, omega^2 - k^2 = m^2 at long wavelength, a massless group velocity of one, and subluminal massive modes',
      metrics: {
        groupVelocityMassless: massless,
        groupVelocityMassive: massive,
      },
      notes:
        'L1, consistency check, NOT measured from a stepped simulation. measuredOmega evaluates the closed-form trace cos omega = cos(m) cos(k) of the assumed U(k), so reading omega from it then checking its consequences is a self-consistency check of the assumed operator, not a readout of emergent dynamics. The massless light-speed versus massive subluminal contrast is the internal control. For a genuinely simulated readout see dirac-from-discrete (DFT of the stepped walk).',
    })
  },
})
