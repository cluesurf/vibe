// The parameter-scan harness. Almost every experiment is "vary one knob, measure
// one number, repeat." This standardizes the sweep, gives every repeat its own
// Weyl stream (code/tool/weyl) at start = base + 1000 * parameter index + repeat,
// and aggregates mean and standard deviation of every reported metric. There is no
// seed: the repeats are a fixed equidistributed set of streams, so the spread is
// over a deterministic quasi-random set, not over draws.

import { Weyl, makeWeyl } from '@/code/tool/weyl'

export type ScanSpec<P> = {
  readonly form: 'scan'
  readonly name: string
  readonly parameters: readonly P[]
  readonly repeats: number
  run(input: { parameter: P; rng: Weyl }): Record<string, number>
}

export type ScanPoint = {
  readonly parameterIndex: number
  readonly mean: Record<string, number>
  readonly std: Record<string, number>
}

export type ScanResult = {
  readonly form: 'scan-result'
  readonly name: string
  readonly points: readonly ScanPoint[]
  readonly start: number
}

export function runScan<P>(input: {
  spec: ScanSpec<P>
  start: number
}): ScanResult {
  const points: ScanPoint[] = []

  for (
    let parameterIndex = 0;
    parameterIndex < input.spec.parameters.length;
    parameterIndex++
  ) {
    const parameter = input.spec.parameters[parameterIndex] as P

    // Collect each metric's values across repeats.
    const samples = new Map<string, number[]>()

    for (let repeat = 0; repeat < input.spec.repeats; repeat++) {
      const rng = makeWeyl({
        start: input.start + parameterIndex * 1000 + repeat,
      })
      const metrics = input.spec.run({ parameter, rng })

      for (const key of Object.keys(metrics)) {
        const value = metrics[key] ?? 0
        const list = samples.get(key)

        if (list) {
          list.push(value)
        } else {
          samples.set(key, [value])
        }
      }
    }

    const mean: Record<string, number> = {}
    const std: Record<string, number> = {}

    for (const [key, values] of samples) {
      const count = values.length

      let sum = 0

      for (let i = 0; i < count; i++) {
        sum += values[i] ?? 0
      }

      const m = count > 0 ? sum / count : 0

      let variance = 0

      for (let i = 0; i < count; i++) {
        const diff = (values[i] ?? 0) - m

        variance += diff * diff
      }

      // Population standard deviation across the repeats.
      const sd = count > 0 ? Math.sqrt(variance / count) : 0

      mean[key] = m
      std[key] = sd
    }

    points.push({ parameterIndex, mean, std })
  }

  return {
    form: 'scan-result',
    name: input.spec.name,
    points,
    start: input.start,
  }
}
