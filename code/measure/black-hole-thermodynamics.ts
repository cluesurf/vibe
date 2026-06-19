// Closed-form Schwarzschild and de Sitter horizon thermodynamics in geometric units
// (G = c = hbar = k_B = 1). These are the standard analytic relations, not derived from
// the vibe substrate. Callers supply the mass M (Schwarzschild) or the Hubble rate H
// (de Sitter) and read back the horizon radius, area, area-law entropy, surface gravity,
// and Hawking/Gibbons-Hawking temperature. The first-law / Smarr / Bekenstein / heat-
// capacity / evaporation CHECKS that verify mutual consistency live with each experiment.

// Schwarzschild horizon radius r_s = 2M.
export function schwarzschildRadius(mass: number): number {
  return 2 * mass
}

// Schwarzschild horizon area A = 4 pi r_s^2 = 16 pi M^2.
export function schwarzschildArea(mass: number): number {
  return 4 * Math.PI * schwarzschildRadius(mass) ** 2
}

// Area-law (Bekenstein-Hawking) entropy S = A / 4 = 4 pi M^2.
export function schwarzschildEntropy(mass: number): number {
  return schwarzschildArea(mass) / 4
}

// Surface gravity kappa = 1 / (4M).
export function schwarzschildSurfaceGravity(mass: number): number {
  return 1 / (4 * mass)
}

// Hawking temperature T = kappa / 2pi = 1 / (8 pi M).
export function hawkingTemperature(mass: number): number {
  return schwarzschildSurfaceGravity(mass) / (2 * Math.PI)
}

// Stefan-Boltzmann horizon luminosity (up to constants): A T^4 ~ M^-2.
export function horizonLuminosity(mass: number): number {
  return schwarzschildArea(mass) * hawkingTemperature(mass) ** 4
}

// Schwarzschild evaporation lifetime by integrating dM/dt = -A T^4 with an adaptive
// step that drains a fixed FRACTION of M per step, so the cost is logarithmic in M
// instead of the ~M^3/dt brute force. The lifetime scales exactly as M0^3.
export function schwarzschildEvaporationLifetime(input: {
  mass: number
  fraction?: number
  floor?: number
}): number {
  const fraction = input.fraction ?? 0.002
  const floor = input.floor ?? 1e-3

  let mass = input.mass
  let time = 0

  while (mass > floor) {
    const power = horizonLuminosity(mass)
    const dt = (fraction * mass) / power
    mass -= power * dt
    time += dt
  }

  return time
}

// de Sitter / Gibbons-Hawking horizon thermodynamics from a Hubble rate H (c = 1):
// horizon radius 1/H, area 4 pi / H^2, entropy A/4 = pi / H^2, temperature H / 2pi,
// cosmological constant Lambda = 3 H^2.
export function deSitterHorizon(hubble: number): {
  radius: number
  area: number
  entropy: number
  temperature: number
  cosmologicalConstant: number
} {
  const radius = 1 / hubble
  const area = 4 * Math.PI * radius ** 2

  return {
    radius,
    area,
    entropy: area / 4,
    temperature: hubble / (2 * Math.PI),
    cosmologicalConstant: 3 * hubble ** 2,
  }
}
