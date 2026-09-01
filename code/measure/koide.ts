// The Koide ratio Q = (m1 + m2 + m3) / (sqrt m1 + sqrt m2 + sqrt m3)^2. The charged leptons give
// Q = 2/3 to one part in a hundred thousand. Until 2026-08-31 three experiments each carried this
// five-line function.

export function koideRatio(masses: readonly number[]): number {
  const sum = masses.reduce((s, m) => s + m, 0)
  const rootSum = masses.reduce((s, m) => s + Math.sqrt(m), 0)

  return sum / (rootSum * rootSum)
}
