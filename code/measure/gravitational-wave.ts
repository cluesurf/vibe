// Closed-form general-relativistic gravitational-wave physics of a circular compact binary
// (geometric units G = c = 1). These are the standard textbook formulas, not derived from the vibe
// substrate. Covers the Kepler orbital frequency, the quadrupole TT strain, the chirp mass, the
// Peters (1964) quadrupole radiated power and orbital decay, and the inspiral chirp track. The
// consistency CHECKS (polarization count, frequency doubling, -3/8 chirp slope) live with the
// experiment that calls these.

// Kepler angular frequency of a circular binary of total mass M at separation a: omega^2 = M / a^3.
export function keplerFrequency(input: {
  totalMass: number
  separation: number
}): number {
  return Math.sqrt(input.totalMass / input.separation ** 3)
}

// Chirp mass M_c = (m1 m2)^(3/5) / (m1 + m2)^(1/5), the single mass combination that sets the
// inspiral waveform's amplitude and phase evolution.
export function chirpMass(input: {
  mass1: number
  mass2: number
}): number {
  const { mass1, mass2 } = input

  return Math.pow(mass1 * mass2, 3 / 5) / Math.pow(mass1 + mass2, 1 / 5)
}

// Quadrupole TT strain of a face-on (observer on the z-axis) circular binary, sampled over `samples`
// steps with `samplesPerOrbit` points per orbit at observer distance `distance`. The standard result
// h_+ = -(4 mu omega^2 a^2 / r) cos(2 phi), h_x = the sin form, so the GW frequency is twice orbital.
export function binaryQuadrupoleStrain(input: {
  mass1: number
  mass2: number
  separation: number
  distance: number
  samples: number
  samplesPerOrbit?: number
}): { hplus: number[]; hcross: number[]; omega: number } {
  const { mass1, mass2, separation: a, distance: r, samples } = input
  const samplesPerOrbit = input.samplesPerOrbit ?? 12
  const Mtot = mass1 + mass2
  const mu = (mass1 * mass2) / Mtot
  const omega = keplerFrequency({ totalMass: Mtot, separation: a })
  const amp = (4 * mu * omega ** 2 * a ** 2) / r
  const dt = (2 * Math.PI) / omega / samplesPerOrbit
  const hplus: number[] = []
  const hcross: number[] = []
  for (let n = 0; n < samples; n++) {
    const phi = omega * (n * dt)
    hplus.push(-amp * Math.cos(2 * phi))
    hcross.push(-amp * Math.sin(2 * phi))
  }

  return { hplus, hcross, omega }
}

// Quadrupole radiated power (luminosity) of a circular binary: P = (32/5) m1^2 m2^2 (m1+m2) / a^5,
// equivalently (32/5) mu^2 a^4 omega^6.
export function quadrupoleRadiatedPower(input: {
  mass1: number
  mass2: number
  separation: number
}): number {
  const { mass1, mass2, separation: a } = input

  return (
    ((32 / 5) * (mass1 ** 2 * mass2 ** 2 * (mass1 + mass2))) / a ** 5
  )
}

// Peters (1964) inspiral: integrate da/dt = -(64/5) m1 m2 (m1+m2) / a^3 from a0 to `floor`, recording
// the GW frequency f = 2 omega / 2pi versus time. f(t) ~ (t_c - t)^(-3/8) near coalescence.
export function petersInspiralTrack(input: {
  mass1: number
  mass2: number
  separation: number
  floor?: number
  step?: number
  maxTime?: number
}): {
  times: number[]
  gwFrequencies: number[]
  coalescenceTime: number
} {
  const { mass1, mass2 } = input
  const floor = input.floor ?? 0.05
  const dt = input.step ?? 1e-3
  const maxTime = input.maxTime ?? 1e7
  const Mtot = mass1 + mass2
  let a = input.separation
  let t = 0
  const times: number[] = []
  const gwFrequencies: number[] = []
  while (a > floor && t < maxTime) {
    const dadt = (-(64 / 5) * (mass1 * mass2 * Mtot)) / a ** 3
    a += dadt * dt
    t += dt
    if (a <= 0) {
      break
    }

    const omega = keplerFrequency({ totalMass: Mtot, separation: a })
    times.push(t)
    gwFrequencies.push((2 * omega) / (2 * Math.PI))
  }

  return { times, gwFrequencies, coalescenceTime: t }
}
