// The exact one-dimensional Ising real-space renormalization group by block-spin
// decimation. Summing out every other spin of a 1D chain gives an effective coupling
// K' between the survivors. By direct summation over the eliminated spin,
//   sum_s exp(K(s1 s + s s2)) = e^{C + K' s1 s2},
// and reading off s1 = s2 versus s1 = -s2 gives K' exactly. The closed form is
// K' = (1/2) ln cosh(2K), and its beta function (the change in coupling per blocking
// step in log scale) is monotone non-positive with a Gaussian fixed point at K = 0.

// Effective coupling K' after decimating the middle spin, by DIRECT summation.
export function isingDecimationBySummation(coupling: number): number {
  const k = coupling
  // s1 = s2 = +1: sum_s exp(K(s + s)) = e^{2K} + e^{-2K}.
  const same = Math.exp(k * (1 + 1)) + Math.exp(k * (-1 - 1))
  // s1 = +1, s2 = -1: sum_s exp(K(s - s)) = 1 + 1 = 2.
  const diff = Math.exp(k * (1 - 1)) + Math.exp(k * (-1 + 1))
  // e^{C+K'} = same, e^{C-K'} = diff  =>  K' = (1/2) ln(same/diff).
  return 0.5 * Math.log(same / diff)
}

// The closed-form effective coupling, K' = (1/2) ln cosh(2K).
export function isingDecimationFormula(coupling: number): number {
  return 0.5 * Math.log(Math.cosh(2 * coupling))
}

// The decimation beta function: (K' - K) per blocking step in log_2 scale.
export function isingBetaFunction(coupling: number): number {
  return (isingDecimationFormula(coupling) - coupling) / Math.log(2)
}
