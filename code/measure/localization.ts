// The quantum return probability, the standard diagnostic for whether an excitation PROPAGATES
// (extended phase) or stays TRAPPED (localized phase) under a unitary evolution. Start a unit
// excitation at one site and evolve under exp(-i H t) by a stable leapfrog (H real symmetric, so
// the evolution is unitary). The return probability P(t) = |psi_source(t)|^2 is how much amplitude
// is still at the source. A LOW time-average means the excitation spread away and did not come
// back, the propagating / extended signature. A HIGH time-average means it is trapped, the
// localized signature. This is metric-free and robust, it does not need a clean wavepacket.

import { type LinearOperator } from '@/code/algebra/linear/sparse'

export function returnProbability(input: {
  operator: LinearOperator // a real symmetric H, applied via operator.apply({ x })
  source: number
  steps: number
  dt: number
  sampleEvery?: number
}): { samples: number[]; timeAverage: number; normDrift: number } {
  const { operator, source, steps, dt } = input
  const sampleEvery = input.sampleEvery ?? 1
  const n = operator.size
  const apply = (x: Float64Array): Float64Array => operator.apply({ x })

  // psi = real + i imaginary, the Schrodinger equation d psi / dt = -i H psi becomes
  // d(real)/dt = H imaginary, d(imaginary)/dt = -H real. The leapfrog staggers the two.
  const real = new Float64Array(n)
  const imaginary = new Float64Array(n)
  real[source] = 1

  const normOf = (): number => {
    let sum = 0
    for (let i = 0; i < n; i++) sum += real[i]! * real[i]! + imaginary[i]! * imaginary[i]!
    return sum
  }
  const startNorm = normOf()

  // half-step kick to stagger the imaginary part
  const first = apply(real)
  for (let i = 0; i < n; i++) imaginary[i] = imaginary[i]! - 0.5 * dt * first[i]!

  const samples: number[] = []
  for (let step = 1; step <= steps; step++) {
    const dImag = apply(imaginary)
    for (let i = 0; i < n; i++) real[i] = real[i]! + dt * dImag[i]!
    const dReal = apply(real)
    for (let i = 0; i < n; i++) imaginary[i] = imaginary[i]! - dt * dReal[i]!
    if (step % sampleEvery === 0) {
      samples.push(real[source]! * real[source]! + imaginary[source]! * imaginary[source]!)
    }
  }

  const timeAverage = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 1
  const normDrift = Math.abs(normOf() / startNorm - 1)
  return { samples, timeAverage, normDrift }
}
