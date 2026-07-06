// The collision-model route to the Lindblad reduction. A system qubit meets a FRESH environment
// qubit each beat and interacts by a partial swap. Tracing the environment gives an exact
// completely positive trace-preserving map, and because every collision partner is fresh the
// reduced dynamics is an exact semigroup (the same map composed), the discrete Lindblad
// evolution: the excited population decays exponentially at the rate set by the collision angle.
// The Markov property has a causal face: on the substrate a moving system meets fresh cells each
// beat because the light cone streams new environment past it, so freshness is enforced by the
// causal structure. Reusing ONE environment qubit instead (the same partner every beat) breaks
// the semigroup: information flows back and the population revives, the non-Markov control.

// One collision of the system qubit (excited population p, coherence not tracked here since the
// partial swap decouples populations for a ground-state environment): the exact reduced update is
// p -> p cos^2(theta). Iterated, p_n = p_0 cos^{2n}(theta), the exponential Lindblad decay.
export function freshCollisionPopulations(input: {
  initial: number
  theta: number
  collisions: number
}): number[] {
  const { initial, theta, collisions } = input
  const damping = Math.cos(theta) * Math.cos(theta)
  const out: number[] = [initial]

  let population = initial

  for (let n = 0; n < collisions; n++) {
    population *= damping
    out.push(population)
  }

  return out
}

// The non-Markov control: the system keeps colliding with the SAME single environment qubit. The
// pair evolves unitarily in the two-excitation-conserving sector spanned by |excited, ground> and
// |ground, excited>, a rotation by theta per beat, so the population oscillates and REVIVES
// instead of decaying, the memory of the reused environment flowing back.
export function reusedCollisionPopulations(input: {
  initial: number
  theta: number
  collisions: number
}): number[] {
  const { initial, theta, collisions } = input

  // amplitudes in the one-excitation sector: [system excited, environment excited]
  let systemAmplitude = Math.sqrt(initial)
  let environmentAmplitude = 0

  const out: number[] = [initial]

  for (let n = 0; n < collisions; n++) {
    const nextSystem =
      Math.cos(theta) * systemAmplitude -
      Math.sin(theta) * environmentAmplitude

    const nextEnvironment =
      Math.sin(theta) * systemAmplitude +
      Math.cos(theta) * environmentAmplitude

    systemAmplitude = nextSystem
    environmentAmplitude = nextEnvironment
    out.push(systemAmplitude * systemAmplitude)
  }

  return out
}
