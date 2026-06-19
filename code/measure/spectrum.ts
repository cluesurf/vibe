// Small spectral-classification kit. Given a list of eigenvalues (or any scalar
// spectrum), the recurring questions are: which levels are genuinely distinct
// (merging numerical degeneracies and +/-E pairs within a tolerance), and how many
// modes sit at zero versus carry real weight. Experiments kept reinventing these as
// inline sort-and-dedup and zero-versus-nonzero counters. They are pure functions of
// a number array, no model assumptions, so they live with the other measures.

// The distinct ascending levels, merging values closer than tolerance into one.
// Useful for collapsing spin/sign degeneracies and roundoff-split eigenvalues.
export function distinctLevels(
  values: number[],
  tolerance = 1e-4,
): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  for (const v of sorted) {
    if (!out.length || Math.abs(v - out[out.length - 1]!) > tolerance)
      out.push(v)
  }
  return out
}

// Census of a spectrum into zero modes versus nonzero (physical) modes, with the
// smallest nonzero magnitude. For a gauge operator the zero modes are pure gauge and
// the nonzero ones are physical, so this reads off the gauge fraction and the gap.
export function zeroModeCensus(
  values: number[],
  tolerance = 1e-6,
): { zero: number; nonzero: number; minNonzero: number } {
  let zero = 0
  let nonzero = 0
  let minNonzero = Infinity
  for (const v of values) {
    if (v < tolerance) {
      zero += 1
    } else {
      nonzero += 1
      minNonzero = Math.min(minNonzero, v)
    }
  }
  return { zero, nonzero, minNonzero }
}
