// Zitterbewegung, the trembling motion of a Dirac particle, read off the knit's OWN coined Dirac
// walk. A relativistic particle with mass does not move smoothly: the interference between its
// positive- and negative-energy components makes its velocity oscillate at the mass-gap frequency,
// twice the energy, a purely relativistic-quantum effect with no classical or nonrelativistic
// analogue. On the {3,4,3,4} coin the single-particle sector IS a two-component coined Dirac walk
// (relativity/dirac-from-discrete), and its chirality is the velocity (which mover, right or left).
// Seeded as a pure right-mover and evolved by the exact walk, the total chirality (the mean velocity)
// TREMBLES: it oscillates in time at the mass-gap frequency, and a massless walk (no gap) does not
// tremble at all. So Zitterbewegung is measured as an emergent consequence of the discrete rule.

import { diracQuantumWalk } from '@/code/dynamics/quantum-walk'

// The chirality (mean-velocity) time series of the coined Dirac walk seeded as a right-mover.
export function tremblingTrace(input: {
  mass: number
  size: number
  steps: number
}): number[] {
  return diracQuantumWalk({
    size: input.size,
    mass: input.mass,
    steps: input.steps,
    seedMode: 'right',
  }).chirality
}

// The peak-to-peak amplitude of the trembling (zero for a massless, non-trembling walk).
export function tremblingAmplitude(input: {
  mass: number
  size: number
  steps: number
}): number {
  const trace = tremblingTrace(input)

  return Math.max(...trace) - Math.min(...trace)
}

// The dominant angular frequency of the trembling, by a discrete Fourier transform of the mean-
// subtracted trace with parabolic interpolation around the peak bin for sub-bin precision. For a
// massive Dirac walk this is the mass-gap frequency ~ 2 * mass; for a massless walk the trace is flat
// and the frequency is reported as zero.
export function tremblingFrequency(input: {
  mass: number
  size: number
  steps: number
}): number {
  const trace = tremblingTrace(input)
  const n = trace.length
  const mean = trace.reduce((a, b) => a + b, 0) / n

  // flat (massless) trace: no trembling
  const amplitude = Math.max(...trace) - Math.min(...trace)

  if (amplitude < 1e-9) return 0

  const power = (f: number): number => {
    let re = 0
    let im = 0

    for (let t = 0; t < n; t++) {
      const phase = (2 * Math.PI * f * t) / n

      re += (trace[t]! - mean) * Math.cos(phase)
      im += (trace[t]! - mean) * Math.sin(phase)
    }

    return re * re + im * im
  }

  let peak = 1
  let peakPower = 0

  for (let f = 1; f < n / 2; f++) {
    const p = power(f)

    if (p > peakPower) {
      peakPower = p
      peak = f
    }
  }

  // parabolic interpolation on the log-power around the peak bin
  const yLeft = Math.log(power(peak - 1) + 1e-30)
  const yMid = Math.log(peakPower + 1e-30)
  const yRight = Math.log(power(peak + 1) + 1e-30)
  const denom = yLeft - 2 * yMid + yRight
  const delta = denom !== 0 ? (0.5 * (yLeft - yRight)) / denom : 0
  const refined = peak + delta

  return (2 * Math.PI * refined) / n
}
