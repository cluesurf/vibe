// Group speed of a dispersion relation and its directional anisotropy. The group
// velocity is grad_k omega(k); its magnitude is the group speed (the signal speed at
// momentum k). The continuum omega = |k| gives speed 1 in every direction (Lorentz
// safe), while a lattice dispersion gives a direction- and energy-dependent group
// speed (Lorentz violation). The anisotropy is (max - min) / mean of the group speed
// sampled around a quarter circle at fixed momentum magnitude.

// Magnitude of grad_k omega at (kx, ky) by central finite difference.
export function groupSpeed(input: {
  omega: (kx: number, ky: number) => number
  kx: number
  ky: number
  step?: number
}): number {
  const { omega, kx, ky } = input
  const h = input.step ?? 1e-5
  const dwx = (omega(kx + h, ky) - omega(kx - h, ky)) / (2 * h)
  const dwy = (omega(kx, ky + h) - omega(kx, ky - h)) / (2 * h)

  return Math.hypot(dwx, dwy)
}

// The 1D group velocity v = d omega / d k of a dispersion omega(k), by central
// finite difference. The signal velocity of a wave packet at momentum k.
export function groupVelocity1d(input: {
  omega: (k: number) => number
  k: number
  step?: number
}): number {
  const { omega, k } = input
  const h = input.step ?? 1e-6

  return (omega(k + h) - omega(k - h)) / (2 * h)
}

// Group-speed anisotropy at a fixed momentum magnitude: (max - min) / mean of the
// group speed sampled over `samples` directions in one quadrant (by the square
// lattice's symmetry). Zero is perfectly isotropic (Lorentz safe), large is strong
// Lorentz violation. Also returns the mean speed at that magnitude.
export function groupSpeedAnisotropy(input: {
  omega: (kx: number, ky: number) => number
  kMag: number
  samples?: number
  step?: number
}): { meanSpeed: number; anisotropy: number } {
  const { omega, kMag } = input
  const samples = input.samples ?? 24
  const speeds: number[] = []
  for (let a = 0; a < samples; a++) {
    const theta = (a / samples) * (Math.PI / 2)
    speeds.push(
      groupSpeed({
        omega,
        kx: kMag * Math.cos(theta),
        ky: kMag * Math.sin(theta),
        step: input.step,
      }),
    )
  }

  const mean = speeds.reduce((p, q) => p + q, 0) / speeds.length
  const max = Math.max(...speeds)
  const min = Math.min(...speeds)

  return {
    meanSpeed: mean,
    anisotropy: mean > 0 ? (max - min) / mean : 0,
  }
}
