// P7: quantum statistics from a classical base (the Bell hinge).
// Run a CHSH experiment on a deterministic substrate, sweeping how strongly the
// measurement settings are correlated with the hidden state. Report S versus
// that correlation. With independence (0), a local model obeys |S| <= 2.
// Run: npx tsx code/experiment/p7-bell.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { chsh, Lambda } from '~/measure/bell'
import { runScan, ScanSpec } from '~/experiment/runner'
import { writeReport } from '~/experiment/report'

export function main(): void {
  const angles = {
    a: 0,
    aPrime: Math.PI / 2,
    b: Math.PI / 4,
    bPrime: -Math.PI / 4,
  }
  const spec: ScanSpec<number> = {
    form: 'scan',
    name: 'p7-bell',
    parameters: [0, 0.25, 0.5, 0.75, 1],
    repeats: 3,
    run: ({ parameter, rng }) => {
      const r = chsh({
        drawHidden: ({ rng: r2 }): Lambda => r2.next() * Math.PI,
        settingCorrelation: parameter,
        angles,
        trials: 40000,
        rng,
      })
      return { s: r.s }
    },
  }
  const result = runScan({ spec, baseSeed: 5 })
  const out = writeReport({
    result,
    outDir: 'out',
    parameterLabels: spec.parameters.map((c) => `corr=${c}`),
  })
  console.log('P7 CHSH versus setting correlation, written to', out.markdown)
  for (const p of result.points) {
    console.log(
      `  correlation=${spec.parameters[p.parameterIndex]}  S=${(p.mean.s ?? 0).toFixed(3)}`,
    )
  }
  console.log('  classical bound 2, quantum (Tsirelson) bound ~2.828')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
