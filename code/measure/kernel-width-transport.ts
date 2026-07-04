// Leizerman's one-dial map, QM and gravity as the two ends of one memory-kernel width
// (samuel-leizerman in the related-theories census). A localized packet on a ring is
// evolved by a second-order reversible wave whose "previous" slot is replaced by an
// average over the last w beats, a memory kernel of width w. At width one the kernel is
// the bare wave, ballistic, the packet spreads linearly in time (transport exponent near
// one, the Schrodinger/quantum end). As the width grows the memory smooths the wave into a
// diffusion, the packet spreads as the square root of time (transport exponent near one
// half, the gravity/infrared end). So one parameter, the causal-past width, interpolates
// between the two limits, which is Leizerman's claim made measurable.
//
// This is a probe field with a tunable kernel, not a change to the base rule. It reads a
// transport exponent, known physics, so it is graded L2, with the ballistic short-width
// limit as the anchor the wide-width limit must depart from.

// The root-mean-square radius of a packet on a periodic ring of length L, weighted by the
// absolute field. A ballistic front grows this linearly in time, a diffusive one as the
// square root.
function ringRmsRadius(field: Float64Array, center: number): number {
  const length = field.length

  let weight = 0
  let sumSquared = 0

  for (let x = 0; x < length; x++) {
    const magnitude = Math.abs(field[x]!)
    const d = Math.min(Math.abs(x - center), length - Math.abs(x - center))
    weight += magnitude
    sumSquared += magnitude * d * d
  }

  return weight > 0 ? Math.sqrt(sumSquared / weight) : 0
}

// Evolve a centred packet on a ring with a memory-kernel-width-w reversible wave, and
// return the packet's RMS radius at each beat. Deterministic, no randomness.
export function packetRmsTrace(input: {
  ringLength: number
  width: number
  beats: number
  amplitude?: number
}): number[] {
  const { ringLength: length, width, beats } = input
  const amplitude = input.amplitude ?? 1
  const center = Math.floor(length / 2)

  const curr = new Float64Array(length)
  const next = new Float64Array(length)
  const history: Float64Array[] = []
  curr[center] = amplitude

  // the memory slot is the average of the last `width` states, so width one is the bare
  // wave (previous = one beat back) and a wide width smooths the oscillation into a drift.
  const memoryAt = (index: number): number => {
    if (history.length === 0) {
      return curr[index]!
    }

    const window = Math.min(width, history.length)

    let sum = 0

    for (let h = 0; h < window; h++) {
      sum += history[history.length - 1 - h]![index]!
    }

    return sum / window
  }

  const trace: number[] = []

  for (let beat = 0; beat < beats; beat++) {
    trace.push(ringRmsRadius(curr, center))

    for (let i = 0; i < length; i++) {
      const left = curr[(i - 1 + length) % length]!
      const right = curr[(i + 1) % length]!
      const laplacian = (left + right) / 2 - curr[i]!
      // second-order wave with the memory slot in place of the single previous beat.
      next[i] = 2 * curr[i]! - memoryAt(i) + laplacian
    }

    history.push(Float64Array.from(curr))

    if (history.length > width) {
      history.shift()
    }

    for (let i = 0; i < length; i++) {
      curr[i] = next[i]!
    }
  }

  return trace
}

// The transport exponent alpha from a radius trace, the slope of log(radius) against
// log(time) over a mid window (avoiding the initial transient and the boundary
// wrap-around). Alpha near one is ballistic, near one half is diffusive.
export function transportExponent(input: {
  trace: readonly number[]
  tMin: number
  tMax: number
}): number {
  const { trace, tMin, tMax } = input
  const xs: number[] = []
  const ys: number[] = []

  for (let t = tMin; t <= tMax && t < trace.length; t++) {
    if (trace[t]! > 1e-9) {
      xs.push(Math.log(t))
      ys.push(Math.log(trace[t]!))
    }
  }

  const n = xs.length

  if (n < 2) {
    return 0
  }

  const meanX = xs.reduce((s, x) => s + x, 0) / n
  const meanY = ys.reduce((s, y) => s + y, 0) / n

  let covariance = 0
  let variance = 0

  for (let i = 0; i < n; i++) {
    covariance += (xs[i]! - meanX) * (ys[i]! - meanY)
    variance += (xs[i]! - meanX) * (xs[i]! - meanX)
  }

  return variance > 0 ? covariance / variance : 0
}
