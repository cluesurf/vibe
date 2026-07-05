// The dominant angular frequency of a real time series, by a plain discrete Fourier
// transform. Returns the angular frequency omega (radians per beat) of the strongest
// spectral bin above the constant (zero-frequency) term. A pure oscillation cos(omega t)
// returns omega. Used to read a beat or dephasing rate off a measured signal.

export function dominantAngularFrequency(
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
