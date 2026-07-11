// Factor (subword) complexity of a finite sequence: p(n) is the number of distinct length-n factors that
// appear in it. By the Morse-Hedlund theorem an infinite sequence is eventually periodic exactly when its
// factor complexity is bounded, p(n) <= n for some n. So p(n) > n is the signature of an aperiodic, complex
// sequence (above the low-complexity line), and p(n) <= n is the periodic, low-complexity regime. Reusable by
// any experiment that needs to place a rule's output on the complexity-decidability line (Kari, Nivat).

// the number of distinct length-n contiguous factors of the sequence.
export function factorComplexity(
  sequence: number[],
  n: number,
): number {
  if (n <= 0 || sequence.length < n) {
    return 0
  }

  const seen = new Set<string>()

  for (let i = 0; i + n <= sequence.length; i++) {
    seen.add(sequence.slice(i, i + n).join(','))
  }

  return seen.size
}

// p(n) for n = 1..maxN, the factor-complexity profile.
export function factorComplexityProfile(
  sequence: number[],
  maxN: number,
): number[] {
  const profile: number[] = []

  for (let n = 1; n <= maxN; n++) {
    profile.push(factorComplexity(sequence, n))
  }

  return profile
}

// whether the sequence is above the low-complexity (periodicity) line: p(n) > n at the given length.
export function aboveComplexityLine(
  sequence: number[],
  n: number,
): boolean {
  return factorComplexity(sequence, n) > n
}

// Symbolize a real profile by the sign of its successive differences (+1 rising, -1 falling, 0 flat). This is
// the standard reduction for measuring the factor complexity of a numeric profile: a monotone or unimodal
// profile gives a near-constant sign sequence (low complexity), an oscillatory one gives a rich sign sequence.
export function differenceSignSequence(values: number[]): number[] {
  const out: number[] = []

  for (let i = 1; i < values.length; i++) {
    const d = values[i]! - values[i - 1]!

    out.push(d > 0 ? 1 : d < 0 ? -1 : 0)
  }

  return out
}
