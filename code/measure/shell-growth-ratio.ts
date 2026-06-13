// The near-shell arithmetic-mean growth ratio used across the substrate survey (the cosmology /
// hierarchy branching factor). Takes a window [from, to) of the shell-count series, averages each
// consecutive ratio shell[i+1]/shell[i] over that window, and rounds to two places. With
// safeDenominator the divisor is clamped to at least one (so a single-ratio window still returns
// a value); without it, a window with fewer than two entries returns zero.

export function shellGrowthRatio(input: {
  shellCounts: ReadonlyArray<number>
  from: number
  to: number
  safeDenominator?: boolean
}): number {
  const mid = input.shellCounts.slice(input.from, Math.min(input.to, input.shellCounts.length))
  if (mid.length <= 1 && !input.safeDenominator) return 0
  const denominator = input.safeDenominator ? Math.max(1, mid.length - 1) : mid.length - 1
  return Math.round((mid.slice(1).reduce((s, v, i) => s + v / mid[i]!, 0) / denominator) * 100) / 100
}
