// P7: quantum statistics from a classical base (the Bell hinge).
// A constructed superdeterministic model (in the spirit of 't Hooft): the hidden
// state lambda is engineered, per setting pair, to give the CHSH sign pattern.
// We sweep how strongly the settings are correlated with lambda. At independence
// the local model obeys |S| <= 2; as the correlation rises, S climbs past 2
// toward the algebraic maximum 4, the quantitative price of denying statistical
// independence. The outcomes deliberately depend on lambda, not the angle: that
// IS the superdeterministic conspiracy, made measurable.
// Run: npx tsx code/experiment/p7-bell.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
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
        // outcome A is always +1; outcome B is engineered per hidden-state region
        // so that, when settings track lambda, the four correlators are
        // (+1, -1, +1, +1) and S = 4. With independent settings the same B map
        // averages to give all four correlators ~0.5, so S ~ 1 (within bound).
        outcomeA: () => 1,
        outcomeB: ({ lambda }) =>
          lambda >= Math.PI / 4 && lambda < Math.PI / 2 ? -1 : 1,
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
  console.log('  classical bound 2, quantum (Tsirelson) ~2.828, algebraic max 4')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
