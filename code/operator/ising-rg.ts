// The exact one-dimensional Ising real-space renormalization group by block-spin
// decimation. Summing out every other spin of a 1D chain gives an effective coupling
// K' between the survivors. By direct summation over the eliminated spin,
//   sum_s exp(K(s1 s + s s2)) = e^{C + K' s1 s2},
// and reading off s1 = s2 versus s1 = -s2 gives K' exactly. The closed form is
// K' = (1/2) ln cosh(2K), and its beta function (the change in coupling per blocking
// step in log scale) is monotone non-positive with a Gaussian fixed point at K = 0.
//
// A second, complementary block-spin scheme (keep every other spin, the survivors'
// correlation gives K') is sampled by Monte Carlo below. It obeys the exact recursion
// tanh K' = tanh^2 K and also flows to the disordered fixed point K* = 0.

import { makeRng, Rng } from '@/code/tool/rng'

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

// Sample a 1D Ising chain of tones exactly, P(s) proportional to exp(K sum s_i s_{i+1}). A 1D chain
// factorizes: each next tone aligns with the previous with probability e^K / (e^K + e^-K).
export function sampleIsingChain(
  n: number,
  coupling: number,
  rng: Rng,
): Int8Array {
  const s = new Int8Array(n)
  s[0] = rng.next() < 0.5 ? -1 : 1
  const pAlign =
    Math.exp(coupling) / (Math.exp(coupling) + Math.exp(-coupling))
  for (let i = 1; i < n; i++)
    s[i] = (rng.next() < pAlign ? s[i - 1] : -(s[i - 1] ?? 1)) as -1 | 1
  return s
}

// Nearest-neighbour correlation <s_i s_{i+1}> of a spin chain.
export function nearestNeighborCorrelation(s: Int8Array): number {
  let c = 0
  for (let i = 0; i + 1 < s.length; i++)
    c += (s[i] ?? 0) * (s[i + 1] ?? 0)
  return c / Math.max(1, s.length - 1)
}

// One Monte-Carlo block-spin (keep-every-other) step: the renormalized coupling K' measured from the
// survivors' correlation, averaged over `samples` chains. Obeys tanh K' = tanh^2 K.
export function measuredBlockSpinCoupling(input: {
  length: number
  coupling: number
  samples: number
  seed: number
}): number {
  const { length, coupling, samples, seed } = input
  const rng = makeRng({ seed })
  let acc = 0
  for (let r = 0; r < samples; r++) {
    const s = sampleIsingChain(length, coupling, rng)
    const blocked = new Int8Array(Math.floor(length / 2))
    for (let i = 0; i < blocked.length; i++) blocked[i] = s[2 * i] ?? 0
    acc += nearestNeighborCorrelation(blocked)
  }
  return Math.atanh(acc / samples)
}
