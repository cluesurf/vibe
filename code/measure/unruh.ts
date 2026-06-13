// The Unruh-DeWitt detector response and the temperature read off its detailed balance. A detector on
// a worldline of surface gravity (or proper acceleration) kappa couples to the field correlator along
// its path. For a horizon the near-worldline Wightman function is W(tau) = prefactor / sinh^2(kappa
// (tau - i eps) / 2). The response F(E) = integral dtau e^{-iE tau} W(tau) obeys detailed balance
// F(E) / F(-E) = exp(-E / T) with T = kappa / (2 pi), the thermal (Hawking/Unruh) spectrum. Both the
// transform and the temperature emerge from the kernel, nothing thermal is assumed.

// Fourier transform of the sinh^2 Wightman kernel at energy E. The integration runs over
// [-halfWindow / kappa, halfWindow / kappa] in proper time, sampled at the given spacing. Returns the
// complex transform, so callers can take either its magnitude or its real part.
export function unruhDetectorResponse(input: {
  energy: number
  kappa: number
  eps: number
  halfWindow: number
  step: number
  prefactor?: number
}): { real: number; imaginary: number } {
  const { energy, kappa, eps } = input
  const prefactor = input.prefactor ?? 1
  const T = input.halfWindow / kappa
  let re = 0
  let im = 0
  for (let tau = -T; tau <= T; tau += input.step) {
    const a = (kappa * tau) / 2
    const b = -(kappa * eps) / 2
    const sinhReal = Math.sinh(a) * Math.cos(b)
    const sinhImag = Math.cosh(a) * Math.sin(b)
    // sinh^2, complex
    const sqReal = sinhReal * sinhReal - sinhImag * sinhImag
    const sqImag = 2 * sinhReal * sinhImag
    // W = prefactor / sinh^2 = prefactor * conj(sinh^2) / |sinh^2|^2
    const den = sqReal * sqReal + sqImag * sqImag
    const wReal = prefactor * (sqReal / den)
    const wImag = prefactor * (-sqImag / den)
    // e^{-iE tau}
    const c = Math.cos(energy * tau)
    const s = -Math.sin(energy * tau)
    re += (wReal * c - wImag * s) * input.step
    im += (wReal * s + wImag * c) * input.step
  }
  return { real: re, imaginary: im }
}

// The temperature read off detailed balance F(E) / F(-E) = exp(-E / T), averaged over a few probe
// energies E = factor * kappa. The caller supplies a response function so the kernel normalization and
// integration details stay with the experiment. Only the same-sign ratio is used.
export function temperatureFromDetailedBalance(input: {
  kappa: number
  response: (energy: number) => number
  energyFactors?: ReadonlyArray<number>
}): number {
  const factors = input.energyFactors ?? [0.5, 1, 1.5]
  let sum = 0
  let count = 0
  for (const factor of factors) {
    const E = factor * input.kappa
    const fp = input.response(E)
    const fm = input.response(-E)
    if (fp !== 0 && fm !== 0 && fp / fm > 0) {
      sum += -E / Math.log(fp / fm)
      count++
    }
  }
  return sum / Math.max(1, count)
}
