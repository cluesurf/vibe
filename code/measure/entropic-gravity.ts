// Entropic gravity, the Verlinde route. Gravity is not an added field but a thermodynamic consequence of the
// entanglement area law. A holographic screen of radius r carries N(r) bits, set by the entanglement entropy of
// the enclosed region. For a gapped ground state that entropy obeys the AREA law, N(r) proportional to r squared
// in three dimensions, and the Verlinde argument turns that into the Newtonian inverse-square force with NO new
// ingredient. These helpers measure the screen-bit scaling N(r) from a correlation matrix and map its exponent to
// the resulting force and potential laws.
//
// The Verlinde chain (Verlinde 2011), all the r-dependence rides on N(r). A screen at radius r holds N(r) bits.
// Equipartition puts the enclosed mass-energy E = M c squared as E = (1/2) N k_B T, so the screen temperature is
// T = 2 M c squared / (N k_B). A test mass m approaching the screen raises its entropy by dS = 2 pi k_B (m c / hbar)
// per unit approach (the Bekenstein-Unruh bit count). The entropic force is F = T dS/dx = 4 pi M m c cubed / (N hbar),
// so F is proportional to M m / N(r). With the area law N(r) proportional to r squared this is F proportional to
// 1/r squared, Newton's law, and the potential is 1/r. A volume law N(r) proportional to r cubed would give the wrong
// 1/r cubed force. So the force exponent equals the screen-bit exponent, and the area law is what makes gravity
// inverse-square.

import { regionEntanglementEntropy } from '@/code/measure/entanglement'

// The lattice indices of a ball of radius `radius` centered at the lattice center, on a cubic lattice of side
// `side` with index x + side*y + side^2*z. The discrete screen enclosing a region of the substrate.
export function ballRegion(input: {
  side: number
  radius: number
}): number[] {
  const { side, radius } = input
  const center = (side - 1) / 2
  const region: number[] = []

  for (let x = 0; x < side; x++) {
    for (let y = 0; y < side; y++) {
      for (let z = 0; z < side; z++) {
        const dx = x - center
        const dy = y - center
        const dz = z - center

        if (dx * dx + dy * dy + dz * dz <= radius * radius) {
          region.push(x + side * y + side * side * z)
        }
      }
    }
  }

  return region
}

// The screen-bit count N(r), the entanglement entropy of the enclosed ball, for each radius. Reuses the
// free-fermion correlation-matrix entropy. Returns the radii, the ball sizes (the enclosed volume), and N(r).
export function screenBitSeries(input: {
  c: Float64Array
  n: number
  side: number
  radii: readonly number[]
}): { radii: number[]; volumes: number[]; bits: number[] } {
  const radii: number[] = []
  const volumes: number[] = []
  const bits: number[] = []

  for (const radius of input.radii) {
    const region = ballRegion({ side: input.side, radius })
    radii.push(radius)
    volumes.push(region.length)
    bits.push(
      regionEntanglementEntropy({ c: input.c, n: input.n, region }),
    )
  }

  return { radii, volumes, bits }
}

// The least-squares exponent alpha of a power law value proportional to radius^alpha, fit in log-log space.
export function logLogExponent(
  radii: readonly number[],
  values: readonly number[],
): number {
  const xs = radii.map(r => Math.log(r))
  const ys = values.map(v => Math.log(v))
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < xs.length; i++) {
    numerator += (xs[i]! - meanX) * (ys[i]! - meanY)
    denominator += (xs[i]! - meanX) ** 2
  }

  return numerator / denominator
}

// The Verlinde force and potential laws implied by a measured screen-bit exponent. With N(r) proportional to
// r^(bitExponent), the entropic force is F proportional to 1/N(r), so F proportional to r^(-bitExponent), and the
// potential is its integral, r^(-(bitExponent - 1)). The area law (bitExponent 2) gives Newton (force r^-2,
// potential r^-1), a volume law (bitExponent 3) gives the wrong r^-3.
export function verlindeForceLaw(input: {
  bitExponent: number
  tolerance?: number
}): {
  forceExponent: number
  potentialExponent: number
  isNewtonian: boolean
} {
  const tolerance = input.tolerance ?? 0.4
  const forceExponent = input.bitExponent

  return {
    forceExponent,
    potentialExponent: input.bitExponent - 1,
    isNewtonian: Math.abs(input.bitExponent - 2) <= tolerance,
  }
}
