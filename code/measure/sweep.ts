// Sweep a scalar measure over a deterministic family and report the centre, the spread, and the
// scaling trend. The family is generated, never drawn, so there is no seed and the result is
// reproducible. This is the harness the methodology calls for: an experiment gets its stability
// across size and its scaling verdict from one call, so a number that only clears its bar at one
// size shows itself at once. Robustness comes from varying the size and the structure, never from
// averaging over random seeds.

// How the measure behaves as the size grows.
//   converges  the value has stopped moving between the last two sizes, it has settled to a limit
//   drifts     it keeps changing without settling and is not heading to zero
//   vanishes   the value at the largest size is near zero and well below its value at the smallest
export type ScalingTrend = 'converges' | 'drifts' | 'vanishes'

export interface FamilyStats {
  mean: number
  min: number
  max: number
  spread: number
}

export interface SweepResult extends FamilyStats {
  sizes: number[]
  values: number[]
  trend: ScalingTrend
}

// The centre and the spread of a family of values, for a family with no natural ordering (a set of
// structured start patterns, a set of perturbation sites). No trend, because a trend needs the sizes
// to be ordered.
export function familyStats(values: readonly number[]): FamilyStats {
  if (values.length === 0) {
    return { mean: 0, min: 0, max: 0, spread: 0 }
  }

  let sum = 0
  let min = Infinity
  let max = -Infinity

  for (const value of values) {
    sum += value

    if (value < min) {
      min = value
    }

    if (value > max) {
      max = value
    }
  }

  return { mean: sum / values.length, min, max, spread: max - min }
}

// Classify the scaling trend of a series of values ordered by increasing size. `vanishBelow` is the
// magnitude under which the largest-size value counts as gone. `convergeBelow` is the relative step
// between the last two values under which the number counts as settled.
export function classifyTrend(input: {
  values: readonly number[]
  vanishBelow: number
  convergeBelow: number
}): ScalingTrend {
  const { values, vanishBelow, convergeBelow } = input
  const n = values.length

  if (n < 2) {
    return 'converges'
  }

  const first = Math.abs(values[0]!)
  const last = Math.abs(values[n - 1]!)

  if (last < vanishBelow && last < 0.5 * first) {
    return 'vanishes'
  }

  const prev = Math.abs(values[n - 2]!)
  const relativeStep =
    Math.abs(values[n - 1]! - values[n - 2]!) / (last + prev + 1e-12)

  return relativeStep < convergeBelow ? 'converges' : 'drifts'
}

// Run `measure` at every size in `sizes` (which must be given in increasing order) and return the
// values, their centre and spread, and the scaling trend. Deterministic: the same sizes give the
// same numbers, with no seed.
export function sweepSizes(input: {
  sizes: readonly number[]
  measure: (size: number) => number
  vanishBelow?: number
  convergeBelow?: number
}): SweepResult {
  const vanishBelow = input.vanishBelow ?? 0.02
  const convergeBelow = input.convergeBelow ?? 0.05
  const sizes = [...input.sizes]
  const values = sizes.map(size => input.measure(size))
  const stats = familyStats(values)

  return {
    ...stats,
    sizes,
    values,
    trend: classifyTrend({ values, vanishBelow, convergeBelow }),
  }
}
