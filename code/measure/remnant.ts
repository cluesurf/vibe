// Black-hole remnants forced by a discrete substrate. A discrete beat carries no dynamical frequency
// above the Nyquist ceiling omega_max = pi per beat, so the substrate cannot support radiation hotter
// than the temperature whose thermal scale reaches that ceiling, T_max = omega_max / (2 pi). Hawking
// radiation gets hotter as the hole shrinks (T = 1/(8 pi M)), so evaporation cannot proceed past the
// mass where T = T_max. It halts there, at a stable remnant. The remnant mass depends only on the
// cutoff, not on how big the hole started, so it is a universal Planckian relic; and it vanishes in
// the continuum limit (omega_max to infinity), which is the control. This reuses the analytic
// Schwarzschild relations in code/measure/black-hole-thermodynamics; the discreteness is the vibe
// substrate's own base feature (a discrete beat), not an extra ingredient.

import {
  hawkingTemperature,
  horizonLuminosity,
} from '@/code/measure/black-hole-thermodynamics'

// The temperature ceiling set by a maximum radiation frequency: T_max = omega_max / (2 pi).
export function temperatureCeiling(maxFrequency: number): number {
  return maxFrequency / (2 * Math.PI)
}

// The remnant mass where the Hawking temperature reaches the ceiling: 1/(8 pi M) = omega_max/(2 pi),
// so M_remnant = 1 / (4 omega_max). Independent of the initial mass.
export function remnantMass(maxFrequency: number): number {
  return 1 / (4 * maxFrequency)
}

// Evaporate a Schwarzschild hole by integrating dM/dt = -A T^4, stopping when the Hawking temperature
// reaches the ceiling (the mass floors at the remnant). With no cutoff (maxFrequency = Infinity) it
// runs to a tiny numerical floor, the continuum control that evaporates fully. Adaptive step drains a
// fixed fraction per step, so cost is logarithmic in the mass ratio.
export function evaporateWithCutoff(input: {
  initialMass: number
  maxFrequency: number
  fraction?: number
}): { finalMass: number; halted: boolean; steps: number } {
  const fraction = input.fraction ?? 0.002
  const ceiling = temperatureCeiling(input.maxFrequency)
  const floor = Number.isFinite(input.maxFrequency)
    ? remnantMass(input.maxFrequency)
    : 1e-6

  let mass = input.initialMass
  let steps = 0

  // stop once the temperature has reached the ceiling (mass has dropped to the remnant)
  while (
    hawkingTemperature(mass) < ceiling &&
    mass > floor &&
    steps < 1_000_000
  ) {
    const power = horizonLuminosity(mass)
    const dt = (fraction * mass) / power
    mass -= power * dt
    steps++
  }

  return {
    finalMass: mass,
    halted: Number.isFinite(input.maxFrequency),
    steps,
  }
}
