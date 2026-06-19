// The parameter-scan harness. Almost every experiment is "vary one knob, measure
// one number, repeat over seeds." This standardizes the sweep, seeds every trial
// deterministically from one base seed, and aggregates mean and standard
// deviation of every reported metric.

import { Rng, makeRng, deriveSeed } from '@/code/tool/rng'

export interface ScanSpec<P> {
  readonly form: 'scan'
  readonly name: string
  readonly parameters: ReadonlyArray<P>
  readonly repeats: number
  run(input: { parameter: P; rng: Rng }): Record<string, number>
}

export interface ScanPoint {
  readonly parameterIndex: number
  readonly mean: Record<string, number>
  readonly std: Record<string, number>
}

export interface ScanResult {
  readonly form: 'scan-result'
  readonly name: string
  readonly points: ReadonlyArray<ScanPoint>
  readonly seed: number
}

export function runScan<P>(input: {
  spec: ScanSpec<P>
  baseSeed: number
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
      const seed = deriveSeed({
        base: input.baseSeed,
        index: parameterIndex * 1000 + repeat,
      })
      const rng = makeRng({ seed })
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
    seed: input.baseSeed,
  }
}
