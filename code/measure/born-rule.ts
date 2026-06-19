// The Born-rule self-consistency measures. The model's one assumption is amplitude = sqrt(count): a
// patch's amplitude is the square root of how many vibes are co-excited in it. From that, the exponent 2
// in P = |a|^p is forced (not assumed) by two facts measured here:
//   - disjoint patches' vibe counts add, so amplitudes add in quadrature (quadratureAdditivityResidual ~ 0),
//   - probabilities of disjoint outcomes add, so (a1^2 + a2^2)^(p/2) = a1^p + a2^p for all amplitudes,
//     which holds only at p = 2 (exponentResidual ~ 0 only there).
// Fair sampling of the vibes then yields probability = count/total = |c|^2 (fairSampleFrequencies).

import { makeRng, sampleEmpiricalFrequencies } from '@/code/tool/rng'

// Realise amplitude_k = sqrt(count_k): disjoint vibe sets of size round(c_k^2 * scale), at least one each.
export function patchesFromAmplitudes(
  amps: ReadonlyArray<number>,
  scale: number,
): { counts: number[]; total: number } {
  const counts = amps.map(c => Math.max(1, Math.round(c * c * scale)))
  const total = counts.reduce((a, b) => a + b, 0)
  return { counts, total }
}

// Substrate fact (1): merge adjacent disjoint patches and check sqrt(n1+n2)^2 == sqrt(n1)^2 + sqrt(n2)^2.
// Returns the worst residual over all adjacent pairs (zero on a true quadrature additivity).
export function quadratureAdditivityResidual(
  amps: ReadonlyArray<number>,
  scale: number,
): number {
  const { counts } = patchesFromAmplitudes(amps, scale)
  let maxRes = 0
  for (let i = 0; i + 1 < counts.length; i++) {
    const n1 = counts[i] ?? 0
    const n2 = counts[i + 1] ?? 0
    const a1 = Math.sqrt(n1)
    const a2 = Math.sqrt(n2)
    const merged = Math.sqrt(n1 + n2)
    maxRes = Math.max(
      maxRes,
      Math.abs(merged * merged - (a1 * a1 + a2 * a2)),
    )
  }
  return maxRes
}

// The functional-equation residual that selects the exponent. For random amplitude pairs, the worst
// relative gap between (a1^2 + a2^2)^(p/2) and a1^p + a2^p. Zero only at p = 2.
export function exponentResidual(input: {
  p: number
  seed: number
  trials?: number
}): number {
  const rng = makeRng({ seed: input.seed })
  const trials = input.trials ?? 4000
  let maxRel = 0
  for (let i = 0; i < trials; i++) {
    const a1 = rng.next() + 0.05
    const a2 = rng.next() + 0.05
    const lhs = Math.pow(a1 * a1 + a2 * a2, input.p / 2)
    const rhs = Math.pow(a1, input.p) + Math.pow(a2, input.p)
    maxRel = Math.max(maxRel, Math.abs(lhs - rhs) / (rhs || 1))
  }
  return maxRel
}

// Fair sampling of the vibes: the empirical frequency of each outcome k over `draws` draws, which
// converges to n_k / total = |c_k|^2.
export function fairSampleFrequencies(input: {
  amps: ReadonlyArray<number>
  scale: number
  draws: number
  seed: number
}): number[] {
  const { counts } = patchesFromAmplitudes(input.amps, input.scale)
  return sampleEmpiricalFrequencies({
    counts,
    draws: input.draws,
    rng: makeRng({ seed: input.seed }),
  })
}
