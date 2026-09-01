// The dominant angular frequency of a real time series, by a discrete Fourier transform of the mean-
// subtracted trace with parabolic interpolation of the log-power around the peak bin for sub-bin precision.
// Used for the zitterbewegung trembling frequency and the Bloch oscillation frequency, which until
// 2026-08-31 each carried their own copy of this transform.

export function dominantAngularFrequency(input: { trace: number[] }): number {
  const { trace } = input
  const n = trace.length
  const mean = trace.reduce((a, b) => a + b, 0) / n

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

// The same peak without the mean subtraction or the interpolation: the angular frequency of the
// strongest DFT bin between 1 and the Nyquist bin, so it is exact only when the true period divides the
// series length. `quantum/energy-time-collapse-law` reads its gap with this one. It lived in
// `time-spectrum.ts` until 2026-08-31.
export function dominantBinAngularFrequency(
  series: readonly number[],
): number {
  const n = series.length

  if (n < 2) {
    return 0
  }

  let bestBin = 1
  let bestPower = -1

  // skip bin 0 (the constant term), scan up to the Nyquist bin
  for (let f = 1; f < n / 2; f++) {
    let re = 0
    let im = 0

    for (let t = 0; t < n; t++) {
      const phase = (-2 * Math.PI * f * t) / n

      re += series[t]! * Math.cos(phase)
      im += series[t]! * Math.sin(phase)
    }

    const power = re * re + im * im

    if (power > bestPower) {
      bestPower = power
      bestBin = f
    }
  }

  return (2 * Math.PI * bestBin) / n
}
