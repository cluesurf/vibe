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

  // the leapfrog keeps the imaginary part half a step ahead of the real part. To read a physical
  // |psi|^2 (norm or return probability) we SYNCHRONIZE the imaginary part back to integer time,
  // im_sync = im_{n+1/2} + (dt/2) H real_n (since d imaginary / dt = -H real). Without this the
  // staggered real^2 + imaginary^2 wobbles by O(dt ||H||) and is not the conserved quantity.
  const syncNormAt = (): number => {
    const hReal = apply(real)

    let sum = 0

    for (let i = 0; i < n; i++) {
      const imSync = imaginary[i]! + 0.5 * dt * hReal[i]!
      sum += real[i]! * real[i]! + imSync * imSync
    }

    return sum
  }

  const returnAt = (): number => {
    const hReal = apply(real)
    const imSync = imaginary[source]! + 0.5 * dt * hReal[source]!

    return real[source]! * real[source]! + imSync * imSync
  }

  // half-step kick to stagger the imaginary part. startNorm is measured AFTER (synchronized).
  const first = apply(real)

  for (let i = 0; i < n; i++) {
    imaginary[i] = imaginary[i]! - 0.5 * dt * first[i]!
  }

  const startNorm = syncNormAt()

  const samples: number[] = []

  for (let step = 1; step <= steps; step++) {
    const dImag = apply(imaginary)

    for (let i = 0; i < n; i++) {
      real[i] = real[i]! + dt * dImag[i]!
    }

    const dReal = apply(real)

    for (let i = 0; i < n; i++) {
      imaginary[i] = imaginary[i]! - dt * dReal[i]!
    }

    if (step % sampleEvery === 0) {
      samples.push(returnAt())
    }
  }

  const timeAverage = samples.length
    ? samples.reduce((a, b) => a + b, 0) / samples.length
    : 1

  const normDrift = Math.abs(syncNormAt() / startNorm - 1)

  return { samples, timeAverage, normDrift }
}

// The bound-state shell decay, the mechanism behind the fermion mass hierarchy. A fermion is a bound (localized) mode
// of a tight-binding operator with an attractive well. On a hyperbolic honeycomb where the cells at shell n grow like
// growthRate^n, a bound mode's amplitude must decay fast enough for the total probability to converge (sum over shells
// of growthRate^n |amplitude|^2 finite), which forces the amplitude to fall at least as growthRate^(-n/2). So the
// SLOWEST (shallowest-well, marginal) bound state decays as growthRate^(-n/2) per shell, the pure geometric floor, and
// deeper wells decay faster. The Yukawa coupling of a generation is the overlap of its mode with the Higgs, so it
// falls as a power of growthRate per shell of separation, and the inter-generation mass ratios are powers of
// growthRate. This computes the ground state of H = -A - wellDepth P_origin (A the adjacency) by power iteration on
// the shifted operator M = sI - H, then returns the per-shell amplitude-decay exponent c, the amplitude ratio between
// successive shells being growthRate^(-c).
export function boundStateDecayExponent(input: {
  neighbors: readonly ArrayLike<number>[]
  cellCount: number
  wellDepth: number
  growthRate: number
  maxDegree: number
  iterations?: number
  origin?: number
}): {
  decayExponent: number
  perShellAmplitude: number[]
  reliableShells: number
} {
  const { neighbors, cellCount, wellDepth, growthRate, maxDegree } =
    input

  const origin = input.origin ?? 0
  const iterations = input.iterations ?? 3000

  // shells from the origin by breadth-first search
  const shell = new Int32Array(cellCount).fill(-1)
  shell[origin] = 0

  let frontier = [origin]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const cell of frontier) {
      const row = neighbors[cell]

      if (!row) {
        continue
      }

      for (let i = 0; i < row.length; i++) {
        const nb = row[i]!

        if (shell[nb] === -1) {
          shell[nb] = shell[cell]! + 1
          next.push(nb)
        }
      }
    }

    frontier = next
  }

  const maxShell = shell.reduce((m, s) => (s > m ? s : m), 0)
  // the outermost two shells are truncated by the finite build, so they are not reliable
  const reliableShells = maxShell - 2

  // the most-bound state of H = -A - wellDepth P_origin, the dominant eigenvector of M = sI - H = sI + A + wellDepth
  // P_origin. Start from the localized origin vector (deterministic, no random).
  const s = maxDegree + wellDepth + 2
  const psi = new Float64Array(cellCount)
  psi[origin] = 1

  const out = new Float64Array(cellCount)

  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < cellCount; i++) {
      let acc = s * psi[i]!

      const row = neighbors[i]

      if (row) {
        for (let k = 0; k < row.length; k++) {
          acc += psi[row[k]!]!
        }
      }

      if (i === origin) {
        acc += wellDepth * psi[origin]!
      }

      out[i] = acc
    }

    let norm = 0

    for (let i = 0; i < cellCount; i++) {
      norm += out[i]! * out[i]!
    }

    norm = Math.sqrt(norm) || 1

    for (let i = 0; i < cellCount; i++) {
      psi[i] = out[i]! / norm
    }
  }

  // the root-mean-square amplitude per shell
  const perShellAmplitude: number[] = []

  for (let sh = 0; sh <= Math.max(reliableShells, 0); sh++) {
    let sum = 0
    let count = 0

    for (let i = 0; i < cellCount; i++) {
      if (shell[i] === sh) {
        sum += psi[i]! * psi[i]!
        count++
      }
    }

    perShellAmplitude.push(Math.sqrt(sum / Math.max(count, 1)))
  }

  // the decay exponent, a log-linear fit of amplitude versus shell over the reliable shells (from shell 1 outward,
  // skipping the origin peak), slope = -c ln(growthRate)
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0

  for (let sh = 1; sh <= reliableShells; sh++) {
    const amp = perShellAmplitude[sh]

    if (amp && amp > 0) {
      sx += sh
      sy += Math.log(amp)
      sxx += sh * sh
      sxy += sh * Math.log(amp)
      m++
    }
  }

  const slope =
    m > 1
      ? (m * sxy - sx * sy) / (m * sxx - sx * sx)
      : Math.log(
          (perShellAmplitude[reliableShells] ?? 1) /
            (perShellAmplitude[Math.max(reliableShells - 1, 0)] ?? 1),
        )

  return {
    decayExponent: -slope / Math.log(growthRate),
    perShellAmplitude,
    reliableShells,
  }
}
