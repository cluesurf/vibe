// P2: a dynamics that makes manifold-like order dominate.
// Monte Carlo over causal sets weighted by the Benincasa-Dowker action, scanning
// the inverse temperature, observing manifold-likeness.
// Run: npx tsx code/experiment/p2-dynamics.ts

import { pathToFileURL } from 'node:url'
import { benincasaDowkerAction } from '@/code/dynamics/action'
import { sampleCausalSets } from '@/code/dynamics/mcmc'
import { manifoldLikeness } from '@/code/measure/manifoldlike'
import { runScan, ScanSpec } from '@/test/scaffold/runner'
import { writeReport } from '@/test/scaffold/report'

export function main(): void {
  const action = benincasaDowkerAction({ epsilon: 1, dimension: 2 })
  const spec: ScanSpec<number> = {
    form: 'scan',
    name: 'p2-dynamics',
    parameters: [0, 0.5, 1, 2],
    repeats: 3,
    run: ({ parameter, rng }) => {
      const r = sampleCausalSets({
        size: 40,
        action,
        beta: parameter,
        steps: 4000,
        rng,
        observe: ({ poset }) => manifoldLikeness({ poset }).score,
      })
      return { manifoldLikeness: r.meanObservable, acceptance: r.acceptanceRate }
    },
  }
  const result = runScan({ spec, baseSeed: 1 })
  const out = writeReport({
    result,
    outDir: 'out',
    parameterLabels: spec.parameters.map((b) => `beta=${b}`),
  })
  console.log('P2 dynamics scan written to', out.markdown)
  for (const p of result.points) {
    console.log(
      `  beta=${spec.parameters[p.parameterIndex]} manifoldLikeness=${(p.mean.manifoldLikeness ?? 0).toFixed(3)} acceptance=${(p.mean.acceptance ?? 0).toFixed(3)}`,
    )
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
