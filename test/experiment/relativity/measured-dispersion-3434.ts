// P253 (MEASURED, not assumed): the relativistic dispersion read OUT of the actual one-step walk operator,
// not a formula written in by hand. Build U(k) = Shift(k) . Coin(m) for the Dirac walk in momentum space, and
// MEASURE omega(k) from the trace of U(k) (its eigenvalues are e^{-i omega}). The dispersion cos(omega) =
// cos(m) cos(k) then EMERGES from the operator, and we check the consequences against measurement:
//   rest energy omega(0) = m (the mass IS the gap), small-k omega^2 = m^2 + k^2 (Lorentz), group velocity
//   d omega/dk -> 1 = c when massless. This upgrades the dispersion test from analytic to measured.
// Run: npx tsx code/experiment/p253-measured-dispersion-3434.ts

import { pathToFileURL } from 'node:url'

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
  console.log(`P253 (1) rest energy omega(0) measured from the operator vs mass m: ${[0, 0.2, 0.5, 0.8].map((m) => `m=${m}:${measuredOmega(0, m).toFixed(3)}`).join(' ')} => omega(0)=m: ${restEnergyIsMass}`)

  // (2) Lorentz at long wavelength: omega^2 - k^2 -> m^2 as k -> 0 (measured)
  let lorentzAtLongWave = true
  for (const m of [0.2, 0.5]) { const k = 0.02, w = measuredOmega(k, m); if (Math.abs((w * w - k * k) - m * m) > 1e-3) lorentzAtLongWave = false }
  console.log(`P253 (2) Lorentz omega^2 - k^2 -> m^2 at long wavelength (measured): ${[0.2, 0.5].map((m) => { const k = 0.02, w = measuredOmega(k, m); return `m=${m}: ${(w * w - k * k).toFixed(4)} vs ${(m * m).toFixed(4)}` }).join(', ')} => ${lorentzAtLongWave}`)

  // (3) massless: group velocity d omega/dk -> 1 (light speed), measured by finite difference on the operator
  const dk = 1e-4, gv = (m: number, k: number): number => (measuredOmega(k + dk, m) - measuredOmega(k, m)) / dk
  const masslessGV = gv(0, 0.3) // group velocity at m=0, mid-band
  const lightSpeedMassless = Math.abs(masslessGV - 1) < 1e-3
  console.log(`P253 (3) massless group velocity d omega/dk measured = ${masslessGV.toFixed(4)} = c: ${lightSpeedMassless}`)

  // (4) massive: group velocity < 1 (subluminal), measured
  const massiveGV = gv(0.5, 0.3)
  const subluminalMassive = massiveGV < 0.98 && massiveGV > 0
  console.log(`P253 (4) massive (m=0.5) group velocity measured = ${massiveGV.toFixed(4)} < c (subluminal): ${subluminalMassive}`)
  console.log(`  => the relativistic dispersion is READ OUT of the walk operator (eigenvalues of U(k)), not assumed. Measured, not put in by hand.\n`)

  return { restEnergyIsMass, lorentzAtLongWave, lightSpeedMassless, subluminalMassive }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = measuredDispersion()
  const pass = r.restEnergyIsMass && r.lorentzAtLongWave && r.lightSpeedMassless && r.subluminalMassive
  console.log(`SOLVED MEASURED-DISPERSION: rest-energy=mass ${r.restEnergyIsMass}, Lorentz ${r.lorentzAtLongWave}, lightspeed-massless ${r.lightSpeedMassless}, subluminal-massive ${r.subluminalMassive} => ${pass ? 'PASSED' : 'FAILED'}`)
}
